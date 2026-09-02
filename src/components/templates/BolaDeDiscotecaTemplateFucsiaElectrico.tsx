"use client";

/**
 * BolaDeDiscotecaTemplateFucsiaElectrico.tsx
 *
 * Portado 1:1 desde el diseño "Bola de Discoteca" (Colección Storytelling,
 * mis quince años: club nocturno, negro casi puro + neones cian/magenta/
 * amarillo, Archivo Black + IBM Plex Mono, pase de acceso "ADMIT ONE" en vez
 * de tiara, luces de bola de espejos barriendo la portada, scroll horizontal
 * "pineado" para Cuándo y dónde / Álbum, riel lateral de progreso y portada
 * que se abre en dos mitades). Misma arquitectura que PrincesaTemplate.tsx /
 * GuestPassVipTemplate.tsx (ver esos archivos para el detalle del motor de
 * motion) -- todo el motion es CSS + SVG + un loop de scroll propio, cero
 * PNGs.
 *
 * Secciones fijas del producto (Save the Date, Countdown, Frase, Cuándo y
 * dónde, RSVP, Álbum, Música, Footer) reinterpretadas visualmente, conectadas
 * a datos reales de `Invitation`/`Guest`. Tipografía/countdown/álbum/RSVP/quiz
 * son de diseño fijo (no elegibles desde el wizard, como toda esta colección),
 * pero hablan SIEMPRE con los mismos endpoints reales del backend
 * (/api/guests/[token]/confirm, /api/songs, /api/quiz).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Archivo_Black, IBM_Plex_Mono } from "next/font/google";
import { LiveAlbumStrip } from "@/components/templates/LiveAlbumStrip";
import { LogoFooterCredit } from "@/components/ui/Logo";
import { AddToCalendarLink } from "@/components/invitation/AddToCalendarLink";
import { toEmbedMapUrl } from "@/lib/google-maps";
import { resolveGuestNameDisplay } from "@/lib/invitation-copy";
import { useMusicPlayer, MusicToggleButton } from "@/components/invitation/MusicPlayer";
import { BankDetailsCard } from "@/components/invitation/v2/BankDetailsCard";
import { InfoAdicionalSection } from "@/components/invitation/v2/InfoAdicionalSection";
import { AnimatedCoverPhoto, COVER_RESPONSIVE_STYLE } from "@/components/invitation/v2/AnimatedCoverPhoto";
import { CreditCard, Gift } from "lucide-react";
import { createPortal } from "react-dom";

const bddArchivo = Archivo_Black({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--bdd-archivo",
  display: "swap",
});

const bddMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--bdd-mono",
  display: "swap",
});

// Colores de acento del mockup: cian (estructura/labels/medallón), magenta
// (links "seguí"/CTA de texto/dots/código de vestimenta) y amarillo (solo en
// el resplandor y como tercer color de la frase) -- se ciclan en la frase
// para reproducir el efecto multicolor del mockup con cualquier cantidad de
// palabras.
const ACCENT_CYCLE = ["#2E6BFF", "#FF17B0", "#FFFFFF"];

// Tonos claros que rotan entre hojas del álbum para diferenciarlas a simple
// vista sin depender de más de 3 colores fijos.
const ALBUM_TONES = ["#F6F3EC", "#F1EDE3", "#EDE8DE"];

function safeJson<T>(val: string | null | undefined, fallback: T): T {
  if (!val) return fallback;
  try {
    const parsed = JSON.parse(val);
    return (parsed ?? fallback) as T;
  } catch {
    return fallback;
  }
}

interface CronoItem {
  time?: string;
  title: string;
  icon?: string;
}

interface BddQuizQuestion {
  pregunta: string;
  opciones: string[];
  respuestaCorrecta?: number;
  correcta?: number;
}

type GuestStatus = "PENDING" | "CONFIRMED" | "DECLINED";

interface GuestRecord {
  id?: string;
  name?: string;
  uniqueToken?: string;
  expectedCount?: number;
  expectedAdults?: number;
  expectedTeens?: number;
  expectedChildren?: number;
  status?: GuestStatus;
  attendingCount?: number;
  attendingAdults?: number;
  attendingTeens?: number;
  attendingChildren?: number;
  dietaryRestrictions?: string | null;
  isExempt?: boolean;
  orderNumber?: number;
}

interface BolaDeDiscotecaTemplateProps {
  invitation: Record<string, unknown>;
  guest?: GuestRecord | null;
  isPersonalized?: boolean;
}

// El backend no reserva mesas/sectores -- el pase muestra el orden real del
// invitado (001, 002...) en vez de un número de mesa inventado.
function passNumberFrom(orderNumber: number | undefined): string {
  if (!orderNumber) return "---";
  return String(orderNumber).padStart(3, "0");
}

export function BolaDeDiscotecaTemplateFucsiaElectrico({ invitation, guest, isPersonalized = false }: BolaDeDiscotecaTemplateProps) {
  const nombreQuinceanera = String(invitation.nombreQuinceanera || invitation.nombreEvento || "");
  const namesTitle = nombreQuinceanera || "Mis quince";

  // "Saludar por nombre del invitado/familia": si está activo, la portada
  // saluda con el nombre del invitado/familia en vez de la quinceañera.
  const showGuestNameInCover = Boolean(guest?.name) && invitation.mostrarNombreInvitadoEnSaludo !== false;
  const coverGuestName = resolveGuestNameDisplay(invitation, guest);
  const coverKickerText = showGuestNameInCover ? "LA PISTA SE PRENDE PARA" : "LA PISTA SE PRENDE PARA MIS 15 DE";
  const coverNamesTitle: React.ReactNode = showGuestNameInCover ? coverGuestName : namesTitle;

  const fechaEvento = invitation.fechaEvento ? new Date(String(invitation.fechaEvento)) : new Date();
  const hora = String(invitation.hora ?? "19:00");
  const [hh, mm] = hora.split(":").map((n) => parseInt(n, 10) || 0);

  const eventDateTime = new Date(fechaEvento);
  eventDateTime.setHours(hh, mm, 0, 0);

  const dayNum = String(fechaEvento.getDate()).padStart(2, "0");
  const monthAbbr = fechaEvento.toLocaleDateString("es-AR", { month: "short" }).replace(".", "").toLowerCase();
  const weekday = fechaEvento.toLocaleDateString("es-AR", { weekday: "long" }).toUpperCase();
  const fechaCorta = `${dayNum} · ${String(fechaEvento.getMonth() + 1).padStart(2, "0")} · ${fechaEvento.getFullYear()}`;

  const lugarNombre = String(invitation.lugarNombre ?? "");
  const direccion = String(invitation.direccion ?? "");
  const mapUrl = String(invitation.mapUrl ?? "");
  const embedMapUrl = mapUrl ? toEmbedMapUrl(mapUrl) : null;
  const dressCode = String(invitation.portadaDressCode ?? "");
  const portadaMensaje = String(
    invitation.portadaMensaje || "Bloqueá la noche entera. La pista no se apaga."
  );

  // Cronograma real (no inventado) -- se muestra tal cual lo cargó el
  // cliente en el wizard, en la misma hoja que el salón.
  const cronograma: CronoItem[] = safeJson<CronoItem[]>(String(invitation.cronogramaEventos ?? ""), []);

  // Ceremonia: sección propia si está habilitada (lugar distinto a la
  // fiesta, ver StepCeremonia.tsx) -- nunca se mezcla con los datos del club.
  const ceremoniaHabilitada = Boolean(invitation.ceremoniaHabilitada);
  const ceremoniaTitulo = String(invitation.ceremoniaTitulo || "Ceremonia");
  const ceremoniaNombre = String(invitation.ceremoniaNombre ?? "");
  const ceremoniaDireccion = String(invitation.ceremoniaDireccion ?? "");
  const ceremoniaHora = String(invitation.ceremoniaHora ?? "");
  const ceremoniaMapUrl = String(invitation.ceremoniaMapUrl ?? "");
  const LUGAR_PANEL_COUNT = ceremoniaHabilitada ? 4 : 3;

  const galeria: string[] = safeJson<string[]>(String(invitation.galeriaPrincipalFotos ?? ""), []);
  // Recorte celular (mobile) y Recorte PC (desktop): mismos 2 campos que
  // carga StepHeroImages.tsx, cada uno 100% opcional e independiente --
  // ver rama experimento-foto-storytelling. Cada uno controla SU propio
  // breakpoint tanto en la tapa (CoverHalf) como en "Nuestra foto" más
  // abajo: si solo se cargó uno de los dos, ese breakpoint muestra la
  // foto y el otro se ve tal cual la plantilla original (sin foto, sin
  // fallback cruzado ni fallback a la galería principal).
  const photoMobile = String(invitation.portadaImagenFondo || "");
  const photoDesktop = String(invitation.portadaImagenFondoDesktop || "");
  const albumFotos = ((invitation.album as { fotos?: { url: string }[] } | null)?.fotos ?? []).map((f) => f.url);
  const allPhotos = Array.from(new Set([...galeria, ...albumFotos].filter(Boolean)));
  // El diseño del álbum es fijo de esta plantilla (no elegible desde el
  // wizard) -- mosaico propio, de hasta 5 fotos por hoja. Reparte parejo en
  // vez de llenar cada hoja al máximo y dejar el resto en la última: con,
  // por ejemplo, 6 fotos, 5+1 dejaba una sola foto huérfana en toda una hoja
  // -- calculando cuántas hojas hacen falta primero y repartiendo el total
  // entre esas hojas por igual, da 3+3 en vez de eso.
  const PHOTOS_PER_PAGE = 5;
  const photoPageCount = Math.max(1, Math.ceil(allPhotos.length / PHOTOS_PER_PAGE));
  const photosPerPageBalanced = Math.ceil(allPhotos.length / photoPageCount) || PHOTOS_PER_PAGE;
  const photoPages: string[][] = [];
  for (let i = 0; i < allPhotos.length; i += photosPerPageBalanced) {
    photoPages.push(allPhotos.slice(i, i + photosPerPageBalanced));
  }
  if (photoPages.length === 0) photoPages.push([]);

  // LIVE: solo se habilita el día del evento -- antes de eso se avisa que
  // todavía no arrancó, en vez de mostrar un álbum vacío.
  const liveItems = (invitation.liveSession as { items?: { fileUrl: string; type?: string }[] } | null)?.items ?? [];
  const livePhotos = liveItems
    .filter((item) => item.fileUrl && (item.type === "PHOTO" || !item.type || /\.(jpg|jpeg|png|webp|gif)$/i.test(item.fileUrl)))
    .map((item) => item.fileUrl);
  const eventHasStarted = Date.now() >= eventDateTime.getTime();

  const rsvpEnabled = Boolean(invitation.rsvpEnabled ?? true);
  const sugerenciaMusicaHabilitada = Boolean(invitation.sugerenciaMusicaHabilitada ?? false);
  const musicaHabilitada = Boolean(invitation.musicaHabilitada) && Boolean(invitation.musicaUrl);

  const triviaHabilitada = Boolean(invitation.triviaHabilitada);
  const triviaPreguntas: BddQuizQuestion[] = safeJson<BddQuizQuestion[]>(String(invitation.triviaPreguntas ?? ""), []);
  const triviaTitulo = String(invitation.triviaTitulo || "¿Cuánto sabés de mí?");
  const quizEnabled = triviaHabilitada && triviaPreguntas.length > 0;

  // Frase: elegible/personalizable desde el wizard (StepPhrase) -- nunca
  // hardcodeada. Frase larga -> tipografía más chica para que entre bien.
  const frasePersonalizadaHabilitada = Boolean(invitation.frasePersonalizadaHabilitada);
  const frase = frasePersonalizadaHabilitada && invitation.frasePersonalizadaTexto
    ? String(invitation.frasePersonalizadaTexto)
    : "La pista se prende una sola vez.";
  const fraseWords = frase.split(/\s+/).filter(Boolean);
  // Combinación de colores del diseño: primera mitad de la frase en color
  // plano, segunda mitad ciclando entre los tres acentos de neón (cian,
  // magenta, amarillo), partiendo por la mitad de la cantidad real de
  // palabras -- reproduce el remate multicolor del mockup sin depender de la
  // longitud exacta de la frase original.
  const fraseAccentStart = Math.ceil(fraseWords.length / 2);
  const fraseFontSize = fraseWords.length > 14
    ? "clamp(28px, 7vw, 42px)"
    : fraseWords.length > 9
      ? "clamp(36px, 9.5vw, 60px)"
      : fraseWords.length > 5
        ? "clamp(44px, 12vw, 78px)"
        : "clamp(50px, 15vw, 96px)";

  const guestName = guest?.name ?? "";
  const guestAdults = guest?.expectedAdults ?? guest?.expectedCount ?? 1;
  const guestTeens = guest?.expectedTeens ?? 0;
  const guestChildren = guest?.expectedChildren ?? 0;
  const guestRestrictions = guest?.dietaryRestrictions ?? "";
  const guestStatus: GuestStatus = guest?.status ?? "PENDING";

  const passNumber = passNumberFrom(guest?.orderNumber);

  const paymentAmount = invitation.regaloMonto ? Number(invitation.regaloMonto) : undefined;
  const paymentEnabled = Boolean(invitation.pagoTarjetaHabilitado) || Boolean(paymentAmount);
  const regaloHabilitado = Boolean(invitation.regaloHabilitado);
  const pagoTarjetaHabilitado = Boolean(invitation.pagoTarjetaHabilitado);
  const showBankSection = regaloHabilitado || pagoTarjetaHabilitado;

  // ---------------------------------------------------------------------
  // refs para el motor de motion (idéntico al de PrincesaTemplate.tsx /
  // GuestPassVipTemplate.tsx, corriendo sobre requestAnimationFrame)
  // ---------------------------------------------------------------------
  const rootRef = useRef<HTMLDivElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const coverRef = useRef<HTMLDivElement | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const perfRef = useRef<HTMLDivElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const railTopRef = useRef<HTMLSpanElement | null>(null);
  const railLabelRef = useRef<HTMLSpanElement | null>(null);
  const railBarRef = useRef<HTMLSpanElement | null>(null);
  const railLineRef = useRef<HTMLDivElement | null>(null);
  const hintRef = useRef<HTMLDivElement | null>(null);
  const namesRef = useRef<HTMLHeadingElement | null>(null);
  const kickerRef = useRef<HTMLSpanElement | null>(null);
  const phraseRef = useRef<HTMLHeadingElement | null>(null);
  const routeRef = useRef<SVGPathElement | null>(null);

  const dRef = useRef<HTMLSpanElement | null>(null);
  const hRef = useRef<HTMLSpanElement | null>(null);
  const mRef = useRef<HTMLSpanElement | null>(null);
  const sRef = useRef<HTMLSpanElement | null>(null);

  const stubRef = useRef<HTMLDivElement | null>(null);
  const sealRef = useRef<HTMLDivElement | null>(null);
  const beamRef = useRef<HTMLDivElement | null>(null);
  const statusRef = useRef<HTMLSpanElement | null>(null);

  const [confirmed, setConfirmed] = useState(guestStatus === "CONFIRMED");
  const [expandedPhoto, setExpandedPhoto] = useState<string | null>(null);

  const { isPlaying: isMusicPlaying, togglePlay: toggleMusic, audioElement: musicAudioElement } = useMusicPlayer({
    musicaUrl: String(invitation.musicaUrl ?? ""),
    autoplay: musicaHabilitada && Boolean(invitation.musicaAutoplay ?? true),
  });
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [isCoverOpen, setIsCoverOpen] = useState(false);

  // -- intro / apertura de portada -----------------------------------
  const intro = useCallback(() => {
    [kickerRef.current, namesRef.current].forEach((el, i) => {
      if (!el) return;
      el.style.opacity = "0";
      el.style.transform = "translateY(26px)";
      el.style.filter = "blur(10px)";
      el.style.transition = "opacity 1s cubic-bezier(.16,1,.3,1), transform 1s cubic-bezier(.16,1,.3,1), filter 1s ease";
      el.style.transitionDelay = `${180 + i * 220}ms`;
      window.setTimeout(() => {
        el.style.opacity = "1";
        el.style.transform = "none";
        el.style.filter = "none";
      }, 90);
    });
    if (perfRef.current) {
      window.setTimeout(() => {
        if (perfRef.current) perfRef.current.style.clipPath = "inset(0 0 0 0)";
      }, 90);
    }
  }, []);

  const open = useCallback(() => {
    if (topRef.current) topRef.current.style.transform = "translateY(-100%)";
    if (bottomRef.current) bottomRef.current.style.transform = "translateY(100%)";
    if (scrollerRef.current) scrollerRef.current.style.opacity = "1";
    window.setTimeout(() => {
      if (hintRef.current) hintRef.current.style.opacity = "1";
      if (railRef.current) railRef.current.style.opacity = "1";
    }, 1200);
    window.setTimeout(() => {
      if (coverRef.current) coverRef.current.style.pointerEvents = "none";
    }, 1100);
    setIsCoverOpen(true);
    drawRoute();
  }, []);

  const reset = useCallback(() => {
    setIsCoverOpen(false);
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = 0;
      scrollerRef.current.style.opacity = "0";
    }
    if (coverRef.current) coverRef.current.style.pointerEvents = "auto";
    if (hintRef.current) hintRef.current.style.opacity = "0";
    if (railRef.current) railRef.current.style.opacity = "0";
    if (topRef.current) topRef.current.style.transform = "none";
    if (bottomRef.current) bottomRef.current.style.transform = "none";
    window.setTimeout(() => intro(), 600);
  }, [intro]);

  function drawRoute() {
    const r = routeRef.current;
    if (!r || r.dataset.drawn) return;
    const len = r.getTotalLength();
    r.style.strokeDasharray = String(len);
    r.style.strokeDashoffset = String(len);
    r.style.transition = "stroke-dashoffset 1600ms cubic-bezier(.16,1,.3,1)";
    r.dataset.drawn = "1";
  }

  const handleConfirmed = useCallback((data: { attending: boolean; count: number }) => {
    if (!data.attending) return;
    setConfirmed(true);
    if (beamRef.current) {
      const beam = beamRef.current;
      beam.style.transition = "none";
      beam.style.transform = "translateY(0)";
      beam.style.opacity = "1";
      requestAnimationFrame(() => {
        beam.style.transition = "transform 900ms cubic-bezier(.16,1,.3,1), opacity 400ms ease 700ms";
        beam.style.transform = "translateY(110px)";
        beam.style.opacity = "0";
      });
    }
    window.setTimeout(() => {
      if (statusRef.current) {
        statusRef.current.textContent = "ACCESO CONFIRMADO";
        statusRef.current.style.color = "#FFFFFF";
      }
      if (stubRef.current) {
        stubRef.current.style.borderColor = "#2E6BFF";
        stubRef.current.style.boxShadow = "0 0 0 1px rgba(200,164,92,.35), 0 18px 50px -30px #2E6BFF";
      }
      if (sealRef.current) {
        sealRef.current.style.opacity = "1";
        sealRef.current.style.transform = "scale(1) rotate(-6deg)";
      }
    }, 900);
  }, []);

  // -- montaje: intro, countdown, reveals, loop de scroll --------------
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    intro();

    const tick = () => {
      const ms = Math.max(0, eventDateTime.getTime() - Date.now());
      const d = Math.floor(ms / 864e5);
      const h = Math.floor(ms / 36e5) % 24;
      const m = Math.floor(ms / 6e4) % 60;
      const s = Math.floor(ms / 1e3) % 60;
      const p = (n: number) => String(n).padStart(2, "0");
      if (dRef.current) dRef.current.textContent = String(d);
      if (hRef.current) hRef.current.textContent = p(h);
      if (mRef.current) mRef.current.textContent = p(m);
      const sEl = sRef.current;
      if (sEl) {
        sEl.textContent = p(s);
        sEl.style.transition = "none";
        sEl.style.transform = "translateY(18%)";
        sEl.style.opacity = "0.4";
        requestAnimationFrame(() => {
          sEl.style.transition = "transform 300ms cubic-bezier(.16,1,.3,1), opacity 300ms ease";
          sEl.style.transform = "translateY(0)";
          sEl.style.opacity = "1";
        });
      }
    };
    tick();
    const tickTimer = window.setInterval(tick, 1000);

    const reveals = Array.from(root.querySelectorAll<HTMLElement>("[data-xin]"));
    reveals.forEach((el) => {
      const dist = el.dataset.dist ? parseFloat(el.dataset.dist) : 90;
      el.style.opacity = "0";
      el.style.transform = `translate3d(${dist}px,0,0)`;
      el.style.filter = "blur(6px)";
      el.style.transition = "opacity 900ms cubic-bezier(.16,1,.3,1), transform 1000ms cubic-bezier(.16,1,.3,1), filter 800ms ease";
      el.style.transitionDelay = `${el.dataset.delay || 0}ms`;
    });
    const pending = reveals.slice();

    const words = phraseRef.current ? Array.from(phraseRef.current.querySelectorAll<HTMLElement>("[data-w]")) : [];
    words.forEach((w) => {
      w.style.display = "inline-block";
      w.style.opacity = "0";
      w.style.transform = "translate3d(64px,0,0) rotate(3deg)";
      w.style.filter = "blur(10px)";
      w.style.transition = "opacity 500ms ease, transform 600ms cubic-bezier(.16,1,.3,1), filter 500ms ease";
    });
    let lastWordsShown = -1;

    let routeDone = false;

    const pans = Array.from(root.querySelectorAll<HTMLElement>("[data-pan]"));
    const drifts = Array.from(root.querySelectorAll<HTMLElement>("[data-drift]"));
    const panPos: number[] = [];

    let rafId = 0;
    const frame = () => {
      const sc = scrollerRef.current;
      if (sc) {
        const vh = sc.clientHeight;
        const vw = sc.clientWidth;
        const y = sc.scrollTop;

        for (let i = pending.length - 1; i >= 0; i--) {
          const el = pending[i];
          if (!el.isConnected) {
            pending.splice(i, 1);
            continue;
          }
          const r = el.getBoundingClientRect();
          if (r.top < vh * 0.92 && r.bottom > 0) {
            el.style.opacity = "1";
            el.style.transform = "none";
            el.style.filter = "none";
            pending.splice(i, 1);
          }
        }
        if (phraseRef.current && words.length > 0) {
          const r = phraseRef.current.getBoundingClientRect();
          const progress = Math.min(1, Math.max(0, (vh * 0.92 - r.top) / (vh * 0.55)));
          const wordsToShow = Math.round(progress * words.length);
          if (wordsToShow !== lastWordsShown) {
            lastWordsShown = wordsToShow;
            words.forEach((w, i) => {
              const shown = i < wordsToShow;
              w.style.opacity = shown ? "1" : "0";
              w.style.transform = shown ? "none" : "translate3d(64px,0,0) rotate(3deg)";
              w.style.filter = shown ? "none" : "blur(10px)";
            });
          }
        }
        if (routeRef.current && routeRef.current.dataset.drawn && !routeDone) {
          const r = routeRef.current.getBoundingClientRect();
          if (r.left < window.innerWidth * 0.9 && r.right > 0) {
            routeDone = true;
            routeRef.current.style.strokeDashoffset = "0";
          }
        }

        pans.forEach((pan, pi) => {
          const strip = pan.querySelector<HTMLElement>("[data-strip]");
          if (!strip) return;
          const n = strip.children.length;
          const span = pan.offsetHeight - vh;
          const p = span > 0 ? Math.min(1, Math.max(0, (y - pan.offsetTop) / span)) : 0;
          const prev = panPos[pi];
          const eased = prev == null ? p : prev + (p - prev) * 0.14;
          panPos[pi] = Math.abs(p - eased) < 0.0004 ? p : eased;
          strip.style.transform = `translate3d(${-eased * (n - 1) * vw}px,0,0)`;
          const dots = pan.querySelectorAll<HTMLElement>("[data-dot]");
          const active = Math.min(n - 1, Math.round(eased * (n - 1)));
          dots.forEach((dot, i) => {
            dot.style.background = i === active ? "#FF17B0" : "rgba(20,20,27,0.18)";
          });
        });

        drifts.forEach((el) => {
          const amt = parseFloat(el.dataset.drift || "0") || 0;
          const r = el.getBoundingClientRect();
          const rel = (r.top + r.height / 2 - vh / 2) / vh;
          el.style.transform = `translate3d(0,${rel * amt}px,0)`;
        });

        const max = sc.scrollHeight - sc.clientHeight;
        const prog = max > 0 ? Math.min(1, sc.scrollTop / max) : 0;
        if (railBarRef.current) railBarRef.current.style.height = `${prog * 100}%`;

        const secs = Array.from(sc.children) as HTMLElement[];
        const mid = sc.scrollTop + sc.clientHeight / 2;
        let cur = secs[0];
        secs.forEach((s) => {
          if (s.offsetTop <= mid) cur = s;
        });
        if (cur) {
          const label = (cur.dataset.screenLabel || "").toUpperCase();
          if (railLabelRef.current && railLabelRef.current.textContent !== label) {
            railLabelRef.current.textContent = label;
          }
          let tone = cur.dataset.tone;
          if (!tone) {
            const strip = cur.querySelector<HTMLElement>("[data-strip]");
            if (strip) {
              const idx = Math.min(
                strip.children.length - 1,
                Math.round(Math.abs(parseFloat(strip.style.transform.replace(/[^-\d.]/g, "")) || 0) / (vw || 1))
              );
              tone = (strip.children[idx] as HTMLElement)?.dataset.tone || "dark";
            }
          }
          const light = tone === "light";
          if (railRef.current) railRef.current.style.borderLeftColor = light ? "rgba(20,20,27,0.14)" : "rgba(200,164,92,0.14)";
          if (railLineRef.current) railLineRef.current.style.background = light ? "rgba(20,20,27,0.14)" : "rgba(200,164,92,0.16)";
          if (railTopRef.current) railTopRef.current.style.color = light ? "#7C7768" : "#8A8577";
          if (railLabelRef.current) railLabelRef.current.style.color = light ? "#FF17B0" : "#2E6BFF";
        }
        if (hintRef.current && sc.scrollTop > 40) hintRef.current.style.opacity = "0";
      }
      rafId = requestAnimationFrame(frame);
    };
    rafId = requestAnimationFrame(frame);

    const onResize = () => {};
    window.addEventListener("resize", onResize);

    // Gesto lateral manual dentro de los paneles "pineados" (Cuándo y dónde /
    // Álbum): el scroll de siempre (vertical, dedo o rueda) ya mueve el
    // carrusel horizontal -- esto suma que un arrastre CLARAMENTE horizontal
    // (o el wheel horizontal de un trackpad) también lo mueva, en la
    // dirección intuitiva: arrastrar hacia la izquierda avanza (como bajar),
    // arrastrar hacia la derecha retrocede (como subir). Fuera de un panel
    // pineado no hace nada -- el scroll normal sigue su flujo de siempre.
    // Un arrastre/wheel de 1px no puede mover 1px de scrollTop -- el pan
    // puede medir varias pantallas de alto (260-340vh) repartidas entre
    // pocos paneles, así que 1px de dedo apenas movía una fracción mínima
    // (había que arrastrar muchas veces para avanzar un poco). En cambio,
    // se escala para que un arrastre de TODO el ancho de pantalla mueva
    // exactamente un panel -- se siente como pasar de foto a foto, no como
    // empujar centímetro a centímetro.
    const panFactorFor = (target: HTMLElement | null): number => {
      const pan = target?.closest<HTMLElement>("[data-pan]");
      const sc = scrollerRef.current;
      if (!pan || !sc || sc.clientWidth <= 0) return 0;
      const strip = pan.querySelector<HTMLElement>("[data-strip]");
      const n = strip ? strip.children.length : 1;
      if (n <= 1) return 0;
      const span = pan.offsetHeight - sc.clientHeight;
      return (span / (n - 1)) / sc.clientWidth;
    };
    let touchStartX = 0;
    let touchStartY = 0;
    let touchIsHorizontal = false;
    let touchPanFactor = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchIsHorizontal = false;
      touchPanFactor = 0;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      const dx = touchStartX - t.clientX;
      const dy = touchStartY - t.clientY;
      if (!touchIsHorizontal) {
        if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy) * 1.3) return;
        // El gesto ya es claramente horizontal -- recién ACÁ nos fijamos si
        // hay un panel pineado debajo, usando dónde está el dedo AHORA
        // (elementFromPoint), no dónde arrancó el touch. Los eventos
        // touchmove "capturan" el elemento del touchstart y lo mantienen
        // fijo para todo el gesto (target original), así que si el toque
        // arrancó justo en el borde -- todavía en el contenido de ANTES del
        // panel -- decidir solo con e.target dejaba el gesto lateral
        // inhabilitado para todo ese arrastre, aunque el dedo ya estuviera
        // visualmente sobre el panel. Por eso justo en ese primer punto de
        // entrada a un panel se sentía que "no respondía".
        const el = document.elementFromPoint(t.clientX, t.clientY) as HTMLElement | null;
        touchPanFactor = panFactorFor(el);
        if (!touchPanFactor) return;
        touchIsHorizontal = true;
      }
      e.preventDefault();
      if (scrollerRef.current) scrollerRef.current.scrollTop += dx * touchPanFactor;
      touchStartX = t.clientX;
      touchStartY = t.clientY;
    };
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) <= 2) return;
      const factor = panFactorFor(e.target as HTMLElement);
      if (!factor || !scrollerRef.current) return;
      scrollerRef.current.scrollTop += e.deltaX * factor;
    };
    root.addEventListener("touchstart", onTouchStart, { passive: true });
    root.addEventListener("touchmove", onTouchMove, { passive: false });
    root.addEventListener("wheel", onWheel, { passive: true });

    return () => {
      window.clearInterval(tickTimer);
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      root.removeEventListener("touchstart", onTouchStart);
      root.removeEventListener("touchmove", onTouchMove);
      root.removeEventListener("wheel", onWheel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={rootRef}
      className={`${bddArchivo.variable} ${bddMono.variable}`}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "calc(var(--vh, 1vh) * 100)",
        overflow: "hidden",
        background: "#08081A",
        fontFamily: "var(--bdd-mono), monospace",
        color: "#F4F1EA",
      }}
    >
      <style>{BDD_CSS}</style>
      <style>{COVER_RESPONSIVE_STYLE}</style>

      <div ref={scrollerRef} data-scroller="1" className="bdd-scroller">
        <section data-tone="dark" data-screen-label="Save the Date" className="bdd-section" style={{ background: "radial-gradient(120% 80% at 50% 0%, #161233 0%, #0A0A22 55%, #08081A 100%)" }}>
          <span data-xin="1" data-dist="-60" className="bdd-kicker">01 — GUARDÁ LA FECHA</span>
          <div className="bdd-date-stack">
            <span data-xin="1" data-delay="60" data-dist="-110" className="bdd-date-num">{dayNum}</span>
            <span data-xin="1" data-delay="170" data-dist="140" className="bdd-date-month">{monthAbbr}</span>
            <span data-xin="1" data-delay="280" data-dist="220" className="bdd-date-num bdd-date-num--right">
              {String(fechaEvento.getFullYear()).slice(-2)}
            </span>
          </div>
          <div data-xin="1" data-delay="380" data-dist="-80" className="bdd-divider">
            <span className="bdd-divider-line" /><span>{weekday} · {hora} H</span>
          </div>
          <p data-xin="1" data-delay="460" className="bdd-lead">{portadaMensaje}</p>
          <AddToCalendarLink
            eventName={namesTitle}
            targetDate={eventDateTime}
            location={lugarNombre || direccion}
            description={portadaMensaje}
            className="bdd-cal-link"
          />

          <div data-drift="-70" className="bdd-medallion bdd-medallion--corner">
            <BddMedallion mainText="15" subLabel="ACCESO" arcId="bddArc1" arcText="MIS 15 · ADMIT ONE · " spin="normal" />
          </div>
        </section>

        <section data-tone="dark" data-screen-label="Nuestra foto" className="bdd-hero-photo-section">
          <div className="bdd-hero-photo-frame">
            <div className="acp-mobile-only">
              {photoMobile ? (
                <AnimatedCoverPhoto photoSrc={photoMobile} tint={false} effect="enfoque" scrimColorRgb="8,8,26" />
              ) : (
                <div className="bdd-hero-photo-placeholder" />
              )}
            </div>
            <div className="acp-desktop-only">
              {photoDesktop ? (
                <AnimatedCoverPhoto photoSrc={photoDesktop} tint={false} effect="enfoque" scrimColorRgb="8,8,26" />
              ) : (
                <div className="bdd-hero-photo-placeholder" />
              )}
            </div>
          </div>
          <span data-xin="1" data-dist="-60" className="bdd-kicker bdd-hero-photo-kicker">02 — LA PISTA YA ARRANCÓ</span>
        </section>

        <section id="countdown" data-tone="dark" data-screen-label="Countdown" className="bdd-section bdd-section--between" style={{ background: "radial-gradient(100% 60% at 50% 100%, #140F2E 0%, #0E0C24 55%, #08081A 100%)" }}>
          <div className="bdd-scan-grid" />
          <div className="bdd-scanline" />
          <span data-xin="1" data-dist="-60" className="bdd-kicker" style={{ position: "relative" }}>03 — LA PISTA SE ENCIENDE EN</span>
          <div className="bdd-cd-grid">
            <BddCdBox refEl={dRef} delay={40} dist={-90} label="DÍAS" />
            <BddCdBox refEl={hRef} delay={120} dist={110} label="HORAS" />
            <BddCdBox refEl={mRef} delay={200} dist={-140} label="MIN" />
            <BddCdBox refEl={sRef} delay={280} dist={170} label="SEG" />
          </div>
          <div className="bdd-perf-strip" />
        </section>

        <section id="quote" data-tone="dark" data-screen-label="Frase" className="bdd-section" style={{ background: "radial-gradient(130% 90% at 86% 16%, #1D1338 0%, #120A22 52%, #08081A 100%)" }}>
          <div data-drift="-130" className="bdd-glow-blob" />
          <span data-xin="1" data-dist="-60" className="bdd-kicker" style={{ position: "relative" }}>04 — CUANDO LLEGUE A CERO</span>
          <h2 ref={phraseRef} className="bdd-phrase" style={{ fontSize: fraseFontSize }}>
            {fraseWords.map((w, i) => (
              // El espacio va FUERA del span: el motor de reveal fuerza
              // `display:inline-block` en cada [data-w], y un espacio de fin
              // de línea DENTRO de un inline-block se colapsa a 0 -- como
              // texto suelto entre spans, en cambio, se renderiza normal.
              <span key={i}>
                <span
                  data-w="1"
                  className={i >= fraseAccentStart ? "bdd-accent-cycle" : undefined}
                  style={i >= fraseAccentStart ? { color: ACCENT_CYCLE[(i - fraseAccentStart) % ACCENT_CYCLE.length] } : undefined}
                >
                  {w}
                </span>{" "}
              </span>
            ))}
          </h2>
          <div data-xin="1" data-delay="120" data-dist="90" className="bdd-divider" style={{ position: "relative" }}>
            <span className="bdd-divider-line bdd-divider-line--long" /><span>{fechaCorta} — {hora} H</span>
          </div>
        </section>

        <div data-pan="1" data-screen-label="Cuándo y dónde" className="bdd-pan" style={ceremoniaHabilitada ? { height: "340vh" } : undefined}>
          <div className="bdd-pan-sticky">
            <div data-strip="1" className="bdd-strip">
              {ceremoniaHabilitada && (
                <div id="ceremonia" data-tone="light" className="bdd-panel bdd-panel--between" style={{ background: "#EFEBE1", color: "#14141B" }}>
                  <div className="bdd-hair-bg" />
                  <div className="bdd-panel-top">
                    <span>05 — {ceremoniaTitulo.toUpperCase()}</span><span>01 / {LUGAR_PANEL_COUNT}</span>
                  </div>
                  <h2 className="bdd-panel-title">
                    {ceremoniaNombre || ceremoniaTitulo}
                    {ceremoniaDireccion && <><br /><span className="bdd-accent-italic">{ceremoniaDireccion}</span></>}
                  </h2>
                  <div className="bdd-facts">
                    {ceremoniaHora && (
                      <div className="bdd-facts-row bdd-facts-row--last">
                        <span>HORARIO</span><span>{ceremoniaHora} H</span>
                      </div>
                    )}
                  </div>
                  {ceremoniaMapUrl && (
                    <a href={ceremoniaMapUrl} target="_blank" rel="noopener noreferrer" className="bdd-link-cta">
                      ABRIR EN MAPAS →
                    </a>
                  )}
                  <div className="bdd-seguir">SEGUÍ BAJANDO <span className="bdd-side-hint">→</span></div>
                </div>
              )}

              <div id="details" data-tone="light" className="bdd-panel bdd-panel--between" style={{ background: "#EFEBE1", color: "#14141B" }}>
                <div className="bdd-hair-bg" />
                <div className="bdd-panel-top">
                  <span>05 — CUÁNDO Y DÓNDE</span><span>{ceremoniaHabilitada ? "02" : "01"} / {LUGAR_PANEL_COUNT}</span>
                </div>
                <h2 className="bdd-panel-title">
                  {lugarNombre || "Club Nocturno"}
                  {direccion && <><br /><span className="bdd-accent-italic">{direccion}</span></>}
                </h2>
                <div className="bdd-facts">
                  <div className="bdd-facts-row">
                    <span>HORARIO</span><span>{hora} H</span>
                  </div>
                  {dressCode && (
                    <div className="bdd-facts-row bdd-facts-row--last">
                      <span>CÓDIGO</span><span className="bdd-accent-2">{dressCode.toUpperCase()}</span>
                    </div>
                  )}
                </div>
                {cronograma.length > 0 && (
                  <div className="bdd-crono">
                    {cronograma.map((item, i) => (
                      <div key={i} className="bdd-crono-row">
                        <span className="bdd-crono-time">{item.time || ""}</span>
                        <span className="bdd-crono-title">{item.title}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="bdd-seguir">SEGUÍ BAJANDO <span className="bdd-side-hint">→</span></div>
              </div>

              <div data-tone="light" className="bdd-panel bdd-panel--end" style={{ background: "#E4DFD3", color: "#14141B" }}>
                <svg viewBox="0 0 300 500" preserveAspectRatio="none" className="bdd-route-svg">
                  <path ref={routeRef} d="M18 468 C 130 400, 54 262, 152 220 S 254 140, 282 40" fill="none" stroke="#FF17B0" strokeWidth={1.6} />
                  <circle cx={282} cy={40} r={5} fill="#FF17B0" />
                </svg>
                <div className="bdd-panel-block">
                  <span className="bdd-mini-label">{ceremoniaHabilitada ? "03" : "02"} / {LUGAR_PANEL_COUNT}</span>
                  <span className="bdd-panel-title-sm">Cómo llegar</span>
                  {direccion && <span className="bdd-mini-label">{direccion}</span>}
                  {mapUrl && (
                    <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="bdd-link-cta">
                      ABRIR EN MAPAS →
                    </a>
                  )}
                </div>
              </div>

              <div data-tone="dark" className="bdd-panel bdd-panel--center" style={{ background: "#0A0A22", color: "#F4F1EA" }}>
                <div className="bdd-medallion bdd-medallion--lg">
                  <BddMedallion topLabel="SECTOR" mainText="Pista" subLabel={`PASE Nº ${passNumber}`} arcId="bddArc2" arcText={`ACCESO VIP · PASE Nº ${passNumber} · `} spin="reverse" />
                </div>
                <span className="bdd-mini-label">{LUGAR_PANEL_COUNT} / {LUGAR_PANEL_COUNT} — TU UBICACIÓN</span>
              </div>
            </div>
            <BddDots count={LUGAR_PANEL_COUNT} />
          </div>
        </div>

        <section data-tone="dark" data-screen-label="Check-in" className="bdd-section" style={{ background: "radial-gradient(110% 70% at 50% 100%, #161233 0%, #0A0A22 60%, #08081A 100%)" }}>
          <span data-xin="1" data-dist="-60" className="bdd-kicker">06 — CHECK-IN</span>
          <h2 data-xin="1" data-delay="80" data-dist="130" className="bdd-h2">
            Confirmá<br /><span className="bdd-accent-italic">tu acceso</span>
          </h2>

          {rsvpEnabled ? (
            <div data-xin="1" data-delay="170" data-dist="-90" className="bdd-rsvp">
              <BddRsvpCard
                invitationId={String(invitation.id ?? "")}
                guestToken={guest?.uniqueToken}
                guestName={guestName}
                maxAdults={guestAdults}
                maxTeens={guestTeens}
                maxChildren={guestChildren}
                hasPayment={paymentEnabled}
                paymentAmount={paymentAmount}
                isExempt={guest?.isExempt ?? false}
                precioNino={invitation.precioNino ? Number(invitation.precioNino) : undefined}
                precioAdolescente={invitation.precioAdolescente ? Number(invitation.precioAdolescente) : undefined}
                initialStatus={guestStatus}
                initialAttendingAdults={guest?.attendingAdults}
                initialAttendingTeens={guest?.attendingTeens}
                initialAttendingChildren={guest?.attendingChildren}
                guestRestrictions={guestRestrictions}
                passNumber={passNumber}
                confirmed={confirmed}
                stubRef={stubRef}
                sealRef={sealRef}
                beamRef={beamRef}
                statusRef={statusRef}
                onConfirmed={handleConfirmed}
              />
            </div>
          ) : (
            <p className="bdd-lead">La confirmación de asistencia está cerrada por el momento.</p>
          )}
        </section>

        <div id="album" data-pan="1" data-screen-label="Álbum" className="bdd-pan">
          <div className="bdd-pan-sticky">
            <div data-strip="1" className="bdd-strip">
              {photoPages.map((page, pageIndex) => (
                <div key={pageIndex} data-tone="light" className="bdd-panel bdd-panel--gap" style={{ background: ALBUM_TONES[pageIndex % ALBUM_TONES.length], color: "#14141B" }}>
                  <div className="bdd-hair-bg" />
                  <div className="bdd-panel-top">
                    <span>07 — ARCHIVO / {String(allPhotos.length).padStart(3, "0")}</span><span>HOJA {String(pageIndex + 1).padStart(2, "0")} / {String(photoPages.length).padStart(2, "0")}</span>
                  </div>
                  {pageIndex === 0 && <h2 className="bdd-panel-title-md">Álbum <span className="bdd-accent-pink-italic">de fotos</span></h2>}
                  <div className="bdd-mosaic">
                    {page.length > 0 ? page.map((url, i) => (
                      <div
                        key={i}
                        className={`bdd-mosaic-cell${i === 0 ? " bdd-mosaic-cell--featured" : ""}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => setExpandedPhoto(url)}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setExpandedPhoto(url); }}
                        aria-label={`Ampliar foto ${i + 1}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" className="bdd-mosaic-img" />
                      </div>
                    )) : (
                      <span className="bdd-photo-placeholder">Sin fotos todavía</span>
                    )}
                  </div>
                  <div className="bdd-seguir bdd-seguir--split">
                    <span>{allPhotos.length} FOTOS SUBIDAS</span>
                    <span className="bdd-accent-2">SEGUÍ →</span>
                  </div>
                </div>
              ))}

              <div data-tone="light" className="bdd-panel bdd-panel--gap" style={{ background: "#EDE8DE", color: "#14141B" }}>
                <span className="bdd-panel-top" style={{ display: "block" }}>HOJA {String(photoPages.length + 1).padStart(2, "0")} — EN VIVO</span>
                <h2 className="bdd-panel-title">Todo lo que<br /><span className="bdd-accent-pink-italic">vamos a recordar</span></h2>
                <div className="bdd-album-embed">
                  {livePhotos.length > 0 ? (
                    <LiveAlbumStrip photos={livePhotos} tone="light" accentColor="#FF17B0" />
                  ) : (
                    <div className="bdd-live-placeholder">
                      <span className="bdd-mini-label">
                        {eventHasStarted
                          ? "Todavía no se subió nada en vivo."
                          : "Esta sección se activa el día de la fiesta -- ahí vas a poder ver todo lo que subamos en vivo."}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <BddDots count={photoPages.length + 1} />
          </div>
        </div>

        {sugerenciaMusicaHabilitada && (
          <section id="music" data-tone="dark" data-screen-label="Música" className="bdd-section" style={{ background: "#0A0A22" }}>
            <span data-xin="1" data-dist="-60" className="bdd-kicker">08 — SUGERENCIA DE MÚSICA</span>
            <h2 data-xin="1" data-delay="80" data-dist="140" className="bdd-h2">¿Qué tema<br /><span className="bdd-accent-pink-italic">te hace bailar?</span></h2>
            <div data-xin="1" data-delay="160" data-dist="-80" className="bdd-eq">
              {[0, 0.18, 0.36, 0.54, 0.72].map((delay, i) => (
                <span key={i} className="bdd-eq-bar" style={{ animationDelay: `${delay}s`, background: i === 2 ? "#FFFFFF" : "#2E6BFF" }} />
              ))}
            </div>
            <div data-xin="1" data-delay="240" data-dist="110" className="bdd-song-wrap">
              <BddSongSuggestion
                invitationId={String(invitation.id ?? "")}
                guestToken={guest?.uniqueToken}
                guestName={guestName || "Invitado"}
              />
            </div>
          </section>
        )}

        {showBankSection && (
          <section id="banco" data-tone="dark" data-screen-label="Regalos" className="bdd-section" style={{ background: "#0A0A22" }}>
            <span data-xin="1" data-dist="-60" className="bdd-kicker">{sugerenciaMusicaHabilitada ? "09" : "08"} — REGALOS Y PAGOS</span>
            <h2 data-xin="1" data-delay="80" data-dist="140" className="bdd-h2">
              Si querés<br /><span className="bdd-accent-italic">sumarte</span>
            </h2>
            <div data-xin="1" data-delay="160" data-dist="-80" className="bdd-bank-wrap">
              {pagoTarjetaHabilitado && (
                <BankDetailsCard
                  icon={<CreditCard className="w-[18px] h-[18px]" strokeWidth={1.5} />}
                  data={{
                    titulo: String(invitation.pagoTarjetaTitulo || "Pago de Tarjetas / Pases"),
                    mensaje: String(invitation.pagoTarjetaMensaje || ""),
                    banco: String(invitation.pagoTarjetaBanco || ""),
                    cbu: String(invitation.pagoTarjetaCbu || ""),
                    alias: String(invitation.pagoTarjetaAlias || ""),
                    titular: String(invitation.pagoTarjetaTitular || ""),
                  }}
                  accentColor="#2E6BFF"
                  cardBg="rgba(20,20,27,0.72)"
                  cardBorder="#2A2417"
                  textPrimary="#F4F1EA"
                  textSecondary="#A8A292"
                  InfoRow={BddInfoRow}
                  CopyField={BddCopyField}
                />
              )}
              {regaloHabilitado && (
                <BankDetailsCard
                  icon={<Gift className="w-[18px] h-[18px]" strokeWidth={1.5} />}
                  data={{
                    titulo: String(invitation.regaloTitulo || "Regalos del Evento"),
                    mensaje: String(invitation.regaloMensaje || ""),
                    banco: String(invitation.regaloBanco || ""),
                    cbu: String(invitation.regaloCbu || ""),
                    alias: String(invitation.regaloAlias || ""),
                    titular: String(invitation.regaloTitular || ""),
                  }}
                  accentColor="#2E6BFF"
                  cardBg="rgba(20,20,27,0.72)"
                  cardBorder="#2A2417"
                  textPrimary="#F4F1EA"
                  textSecondary="#A8A292"
                  InfoRow={BddInfoRow}
                  CopyField={BddCopyField}
                />
              )}
            </div>
          </section>
        )}

        {quizEnabled && (
          <section id="quiz" data-tone="dark" data-screen-label="Quiz" className="bdd-section" style={{ background: "#0A0A22" }}>
            <span data-xin="1" data-dist="-60" className="bdd-kicker">{[sugerenciaMusicaHabilitada, showBankSection].filter(Boolean).length + 8} — EL JUEGO</span>
            <h2 data-xin="1" data-delay="80" data-dist="140" className="bdd-h2" style={{ fontSize: "clamp(28px, 6vw, 44px)" }}>
              {triviaTitulo}
            </h2>
            <div data-xin="1" data-delay="160" data-dist="-80">
              <BddQuiz
                preguntas={triviaPreguntas}
                invitationId={String(invitation.id ?? "")}
                guestToken={guest?.uniqueToken}
                guestName={guestName || "Invitado"}
              />
            </div>
          </section>
        )}

        <section data-tone="dark" data-screen-label="Tu pase" className="bdd-section bdd-section--between" style={{ padding: "96px max(30px, calc((100% - 560px) / 2)) 48px max(24px, calc((100% - 560px) / 2))", background: "radial-gradient(120% 70% at 50% 100%, #161233 0%, #0A0A22 55%, #08081A 100%)" }}>
          <span data-xin="1" data-dist="-60" className="bdd-kicker">{[sugerenciaMusicaHabilitada, showBankSection, quizEnabled].filter(Boolean).length + 8} — GUARDÁ TU PASE</span>
          <div data-xin="1" data-delay="100" data-dist="130" className="bdd-final-card">
            <div className="bdd-medallion bdd-medallion--final">
              <BddMedallion mainText="15" subLabel={confirmed ? "CONFIRMADO" : "PENDIENTE"} arcId="bddArc3" arcText={`${namesTitle.toUpperCase()} · ${fechaCorta} · `} spin="reverse" />
            </div>
            <span className="bdd-mini-label bdd-accent-2">PASE Nº {passNumber} · ADMIT {guestAdults + guestTeens + guestChildren || 1}</span>
            <span className="bdd-final-names">{namesTitle}</span>
            <span className="bdd-mini-label" style={{ color: "#A8A292" }}>{fechaCorta} — {hora} H</span>
            <div className="bdd-barcode" style={{ width: "60%", height: 26, opacity: 0.6 }} />
          </div>
          <div className="bdd-final-footer">
            <span>NO TRANSFERIBLE</span>
            <span className="bdd-replay" onClick={reset}>VER LA APERTURA OTRA VEZ ↺</span>
          </div>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <InfoAdicionalSection invitation={invitation as any} />
          <div className="bdd-footer-credit">
            <LogoFooterCredit bgColor="transparent" />
          </div>
        </section>
      </div>

      <div ref={railRef} className="bdd-rail">
        <span ref={railTopRef} className="bdd-rail-top">PASE Nº {passNumber}</span>
        <div ref={railLineRef} className="bdd-rail-line">
          <span ref={railBarRef} className="bdd-rail-bar" />
        </div>
        <span ref={railLabelRef} className="bdd-rail-label">SAVE THE DATE</span>
      </div>

      <div ref={coverRef} className="bdd-cover">
        <div ref={topRef} className="bdd-cover-half bdd-cover-half--top">
          <BddCoverHalf
            namesRef={namesRef}
            kickerRef={kickerRef}
            perfRef={perfRef}
            kickerText={coverKickerText}
            namesTitle={coverNamesTitle}
            fechaCorta={fechaCorta}
            passNumber={passNumber}
            dressCode={dressCode}
            hora={hora}
            photoMobile={photoMobile}
            photoDesktop={photoDesktop}
          >
            <div className="bdd-cover-cta">ABRIR INVITACIÓN</div>
          </BddCoverHalf>
        </div>
        <div ref={bottomRef} className="bdd-cover-half bdd-cover-half--bottom">
          <BddCoverHalf
            kickerText={coverKickerText}
            namesTitle={coverNamesTitle}
            fechaCorta={fechaCorta}
            passNumber={passNumber}
            dressCode={dressCode}
            hora={hora}
            photoMobile={photoMobile}
            photoDesktop={photoDesktop}
          >
            <button onClick={open} className="bdd-cover-cta bdd-cover-cta--btn">ABRIR INVITACIÓN</button>
          </BddCoverHalf>
        </div>
      </div>

      <div ref={hintRef} className="bdd-hint">DESLIZÁ ↓</div>

      {expandedPhoto && (
        <div
          className="bdd-lightbox"
          onClick={() => setExpandedPhoto(null)}
          onContextMenu={(e) => e.preventDefault()}
        >
          <button
            type="button"
            className="bdd-lightbox-close"
            onClick={(e) => {
              e.stopPropagation();
              setExpandedPhoto(null);
            }}
            aria-label="Cerrar"
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={expandedPhoto}
            alt="Foto ampliada"
            className="bdd-lightbox-img"
            draggable={false}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {musicaHabilitada && musicAudioElement}
      {mounted && musicaHabilitada && isCoverOpen && createPortal(
        <MusicToggleButton
          isPlaying={isMusicPlaying}
          onToggle={toggleMusic}
          className="fixed top-3 left-3 z-[99998]"
        />,
        document.body
      )}
    </div>
  );
}

// ---------------------------------------------------------------------
// Subcomponentes de presentación
// ---------------------------------------------------------------------

function BddCdBox({ refEl, delay, dist, label }: { refEl: React.RefObject<HTMLSpanElement | null>; delay: number; dist: number; label: string }) {
  return (
    <div data-xin="1" data-delay={delay} data-dist={dist} className="bdd-cd-box">
      <span ref={refEl} className="bdd-cd-num">—</span>
      <span className="bdd-cd-label">{label}</span>
    </div>
  );
}

function BddDots({ count = 3 }: { count?: number }) {
  return (
    <div data-dots="1" className="bdd-dots">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} data-dot={i} className="bdd-dot" />
      ))}
    </div>
  );
}

// Medallón de pase de acceso: anillo cian/magenta girando + disco central
// oscuro con el "15" (o el texto de sector) en Archivo Black + arco de texto
// en SVG rotando alrededor -- reproduce 1:1 el pase "ADMIT ONE" del mockup
// (a diferencia de la tiara de PrincesaTemplate, acá el centro es tipografía,
// no un ícono).
function BddMedallion({
  topLabel,
  mainText,
  mainCompact,
  subLabel,
  arcId,
  arcText,
  spin,
}: {
  topLabel?: string;
  mainText: string;
  mainCompact?: boolean;
  subLabel?: string;
  arcId: string;
  arcText: string;
  spin: "normal" | "reverse" | "none";
}) {
  // Duración fija por instancia (no en cada render) -- Math.random() directo
  // en el render viola la regla de pureza de React.
  const [ringDuration] = useState(() => 18 + Math.random() * 4);
  return (
    <>
      <div className="bdd-medallion-ring" style={{ animation: spin === "none" ? "none" : `bddRing ${ringDuration}s linear infinite` }} />
      <div className="bdd-medallion-core">
        {topLabel && <span className="bdd-medallion-label">{topLabel}</span>}
        <span className={mainCompact ? "bdd-medallion-main bdd-medallion-main--sm" : "bdd-medallion-main"}>{mainText}</span>
        {subLabel && <span className="bdd-medallion-label bdd-medallion-label--accent">{subLabel}</span>}
      </div>
      {arcId && (
        <svg viewBox="0 0 100 100" className="bdd-medallion-arc" style={{ animation: spin === "reverse" ? "bddRingRev 32s linear infinite" : "bddRingRev 34s linear infinite" }}>
          <defs>
            <path id={arcId} d="M50 50 m -38 0 a 38 38 0 1 1 76 0 a 38 38 0 1 1 -76 0" fill="none" />
          </defs>
          <text className="bdd-medallion-arc-text">
            <textPath href={`#${arcId}`}>{arcText}{arcText}</textPath>
          </text>
        </svg>
      )}
    </>
  );
}

function BddCopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div className="bdd-bank-row">
      <div style={{ minWidth: 0, flex: 1 }}>
        <span className="bdd-bank-row-label">{label}</span>
        <span className="bdd-bank-row-value">{value}</span>
      </div>
      <button type="button" className="bdd-bank-copy" onClick={handle}>
        {copied ? "✓ Copiado" : "Copiar"}
      </button>
    </div>
  );
}

// Reimplementación propia del RSVP: filas de datos + el ticket/sello ya
// existente en la plantilla. Habla con el mismo endpoint/payload que
// <RSVPWizardV2> (/api/guests/[token]/confirm o /api/rsvp), así que no
// cambia ningún dato que pida el backend, solo cómo se ve.
function BddRsvpCard({
  invitationId,
  guestToken,
  guestName,
  maxAdults,
  maxTeens,
  maxChildren,
  hasPayment,
  paymentAmount,
  isExempt,
  precioNino,
  precioAdolescente,
  initialStatus,
  initialAttendingAdults,
  initialAttendingTeens,
  initialAttendingChildren,
  guestRestrictions,
  passNumber,
  confirmed,
  stubRef,
  sealRef,
  beamRef,
  statusRef,
  onConfirmed,
}: {
  invitationId: string;
  guestToken?: string;
  guestName: string;
  maxAdults: number;
  maxTeens: number;
  maxChildren: number;
  hasPayment: boolean;
  paymentAmount?: number;
  isExempt: boolean;
  precioNino?: number;
  precioAdolescente?: number;
  initialStatus: GuestStatus;
  initialAttendingAdults?: number;
  initialAttendingTeens?: number;
  initialAttendingChildren?: number;
  guestRestrictions: string;
  passNumber: string;
  confirmed: boolean;
  stubRef: React.RefObject<HTMLDivElement | null>;
  sealRef: React.RefObject<HTMLDivElement | null>;
  beamRef: React.RefObject<HTMLDivElement | null>;
  statusRef: React.RefObject<HTMLSpanElement | null>;
  onConfirmed: (data: { attending: boolean; count: number }) => void;
}) {
  const [status, setStatus] = useState<GuestStatus>(initialStatus);
  const hasSpecific =
    initialStatus === "CONFIRMED" &&
    ((initialAttendingAdults ?? 0) > 0 || (initialAttendingTeens ?? 0) > 0 || (initialAttendingChildren ?? 0) > 0);

  const [adultCount, setAdultCount] = useState(hasSpecific ? (initialAttendingAdults || 0) : Math.max(1, maxAdults));
  const [teenCount, setTeenCount] = useState(hasSpecific ? (initialAttendingTeens || 0) : maxTeens);
  const [childCount, setChildCount] = useState(hasSpecific ? (initialAttendingChildren || 0) : maxChildren);
  const [dietary, setDietary] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const count = adultCount + teenCount + childCount;
  const totalGuests = maxAdults + maxTeens + maxChildren;

  const adultPrice = paymentAmount ?? 0;
  const teenPrice = precioAdolescente ?? adultPrice;
  const childPrice = precioNino ?? adultPrice;
  const totalPayment = isExempt ? 0 : adultPrice * adultCount + teenPrice * teenCount + childPrice * childCount;
  const formatARS = (n: number) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0 }).format(n);

  async function submit(asistencia: "CONFIRMA" | "NO_ASISTE") {
    setIsSubmitting(true);
    setError("");
    try {
      const endpoint = guestToken ? `/api/guests/${guestToken}/confirm` : "/api/rsvp";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitationId,
          nombre: guestName,
          asistencia,
          attendingAdults: asistencia === "CONFIRMA" ? adultCount : undefined,
          attendingTeens: asistencia === "CONFIRMA" ? teenCount : undefined,
          attendingChildren: asistencia === "CONFIRMA" ? childCount : undefined,
          numeroAcompanantes: asistencia === "CONFIRMA" ? count - 1 : 0,
          restricciones: asistencia === "CONFIRMA" ? dietary : undefined,
          token: guestToken,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Error al confirmar");
      }
      if (asistencia === "CONFIRMA") {
        setStatus("CONFIRMED");
        onConfirmed({ attending: true, count });
      } else {
        setStatus("DECLINED");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al confirmar. Intentá de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (status === "DECLINED") {
    return (
      <div className="bdd-rsvp-declined">
        <p className="bdd-rsvp-declined-text">Gracias por avisarnos. Si cambiás de idea, este mismo acceso sigue activo.</p>
        <button type="button" className="bdd-rsvp-btn bdd-rsvp-btn--ghost" onClick={() => setStatus("PENDING")}>
          CAMBIÉ DE IDEA
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="bdd-rsvp-rows">
        <div className="bdd-rsvp-row">
          <span>{totalGuests > 1 ? "RESERVADO PARA" : "NOMBRE Y APELLIDO"}</span>
          <span>{guestName || "—"}</span>
        </div>

        {totalGuests > 1 && status !== "CONFIRMED" && (
          <div className="bdd-rsvp-row">
            <span>ADULTOS</span>
            <div className="bdd-rsvp-stepper">
              <button type="button" onClick={() => setAdultCount((v) => Math.max(1, v - 1))} disabled={adultCount <= 1}>−</button>
              <span>{String(adultCount).padStart(2, "0")}</span>
              <button type="button" onClick={() => setAdultCount((v) => Math.min(maxAdults, v + 1))} disabled={adultCount >= maxAdults}>+</button>
            </div>
          </div>
        )}
        {maxTeens > 0 && status !== "CONFIRMED" && (
          <div className="bdd-rsvp-row">
            <span>ADOLESCENTES</span>
            <div className="bdd-rsvp-stepper">
              <button type="button" onClick={() => setTeenCount((v) => Math.max(0, v - 1))} disabled={teenCount <= 0}>−</button>
              <span>{String(teenCount).padStart(2, "0")}</span>
              <button type="button" onClick={() => setTeenCount((v) => Math.min(maxTeens, v + 1))} disabled={teenCount >= maxTeens}>+</button>
            </div>
          </div>
        )}
        {maxChildren > 0 && status !== "CONFIRMED" && (
          <div className="bdd-rsvp-row">
            <span>NIÑOS</span>
            <div className="bdd-rsvp-stepper">
              <button type="button" onClick={() => setChildCount((v) => Math.max(0, v - 1))} disabled={childCount <= 0}>−</button>
              <span>{String(childCount).padStart(2, "0")}</span>
              <button type="button" onClick={() => setChildCount((v) => Math.min(maxChildren, v + 1))} disabled={childCount >= maxChildren}>+</button>
            </div>
          </div>
        )}
        {status === "CONFIRMED" && (
          <>
            {totalGuests > 1 && adultCount > 0 && <div className="bdd-rsvp-row"><span>ADULTOS</span><span>{String(adultCount).padStart(2, "0")}</span></div>}
            {teenCount > 0 && <div className="bdd-rsvp-row"><span>ADOLESCENTES</span><span>{String(teenCount).padStart(2, "0")}</span></div>}
            {childCount > 0 && <div className="bdd-rsvp-row"><span>NIÑOS</span><span>{String(childCount).padStart(2, "0")}</span></div>}
          </>
        )}

        {status !== "CONFIRMED" ? (
          <div className="bdd-rsvp-row">
            <span>RESTRICCIÓN ALIMENTARIA</span>
            <input
              value={dietary}
              onChange={(e) => setDietary(e.target.value)}
              placeholder="—"
              className="bdd-rsvp-input"
            />
          </div>
        ) : (
          <div className="bdd-rsvp-row">
            <span>RESTRICCIÓN ALIMENTARIA</span>
            <span>{guestRestrictions || dietary || "—"}</span>
          </div>
        )}

        {hasPayment && paymentAmount != null && !isExempt && (
          <div className="bdd-rsvp-row bdd-rsvp-row--payment">
            <span>VALOR</span>
            <div className="bdd-rsvp-payment-value">
              <span className="bdd-rsvp-payment-total">{formatARS(totalPayment)}</span>
              {(adultCount > 0 || teenCount > 0 || childCount > 0) && (
                <div className="bdd-rsvp-payment-detail">
                  {adultCount > 0 && (
                    <span>{adultCount} {adultCount === 1 ? "adulto" : "adultos"} × {formatARS(adultPrice)}</span>
                  )}
                  {teenCount > 0 && (
                    <span>{teenCount} {teenCount === 1 ? "adolescente" : "adolescentes"} × {formatARS(teenPrice)}</span>
                  )}
                  {childCount > 0 && (
                    <span>{childCount} {childCount === 1 ? "niño" : "niños"} × {formatARS(childPrice)}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div ref={stubRef} className="bdd-stub">
        <div className="bdd-stub-top">
          <span>PASE Nº {passNumber}</span>
          <span ref={statusRef} className="bdd-stub-status">
            {confirmed ? "ACCESO CONFIRMADO" : "PENDIENTE"}
          </span>
        </div>
        <div ref={sealRef} className="bdd-seal">
          <BddMedallion mainText="15" mainCompact arcId="" arcText="" spin="none" />
        </div>
        <div ref={beamRef} className="bdd-beam" />
        <div className="bdd-barcode" style={{ width: "70%", opacity: confirmed ? 0.7 : 0.2 }} />
      </div>

      {error && <p className="bdd-rsvp-error">{error}</p>}

      {status !== "CONFIRMED" ? (
        <>
          <button type="button" className="bdd-rsvp-btn" disabled={isSubmitting} onClick={() => submit("CONFIRMA")}>
            {isSubmitting ? "GUARDANDO…" : "CONFIRMAR ASISTENCIA"}
          </button>
          <button type="button" className="bdd-rsvp-btn bdd-rsvp-btn--ghost" disabled={isSubmitting} onClick={() => submit("NO_ASISTE")}>
            NO VOY A PODER ASISTIR
          </button>
        </>
      ) : (
        <button type="button" className="bdd-rsvp-btn bdd-rsvp-btn--ghost" onClick={() => setStatus("PENDING")}>
          MODIFICAR ASISTENCIA
        </button>
      )}
    </>
  );
}

interface BddSongItem {
  id: string;
  title: string;
  artist: string;
  guestName: string;
}

// Misma API que <SongSuggestion> (/api/songs), look propio de la plantilla.
function BddSongSuggestion({ invitationId, guestToken, guestName }: { invitationId: string; guestToken?: string; guestName: string }) {
  const [songs, setSongs] = useState<BddSongItem[]>([]);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const listUrl = guestToken
    ? `/api/songs?invitationId=${invitationId}&guestToken=${guestToken}`
    : `/api/songs?invitationId=${invitationId}`;

  useEffect(() => {
    fetch(listUrl)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setSongs(data); })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invitationId, guestToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    const a = artist.trim();
    if (!t || !a) {
      setError("Completá tema y artista");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationId, title: t, artist: a, guestToken, guestName }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Error al enviar");
      }
      setTitle("");
      setArtist("");
      const data = await fetch(listUrl).then((r) => r.json());
      if (Array.isArray(data)) setSongs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bdd-song">
      <form onSubmit={handleSubmit} className="bdd-song-row">
        <div className="bdd-song-inputs">
          <input value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="ARTISTA" maxLength={80} className="bdd-song-input" />
          <span className="bdd-song-sep">—</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="TEMA" maxLength={100} className="bdd-song-input" />
        </div>
        <button type="submit" disabled={isSubmitting} className="bdd-song-submit">+ {isSubmitting ? "..." : "SUMAR"}</button>
      </form>
      {error && <p className="bdd-song-error">{error}</p>}
      {songs.length > 0 && (
        <div className="bdd-song-list">
          {songs.slice(0, 12).map((s, i) => (
            <div key={s.id} className="bdd-song-item">
              <span className="bdd-song-item-title">{String(i + 1).padStart(2, "0")} · {s.artist} — {s.title}</span>
              <span className="bdd-song-item-by">Sumado por {s.guestName || "Invitado"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Todas las preguntas se muestran juntas en la misma página -- misma API
// /api/quiz que usa el resto de las plantillas.
function BddQuiz({ preguntas, invitationId, guestToken, guestName }: { preguntas: BddQuizQuestion[]; invitationId: string; guestToken?: string; guestName?: string }) {
  const [picks, setPicks] = useState<Record<number, number>>({});
  const [finished, setFinished] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState<{ avg: number; count: number } | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (!invitationId) {
      setHasLoaded(true);
      return;
    }
    const params = new URLSearchParams({ invitationId });
    if (guestToken) params.append("guestToken", guestToken);
    fetch(`/api/quiz?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data.averagePercentage === "number") {
          setStats({ avg: data.averagePercentage, count: data.totalResponses });
        }
        if (data && data.hasAnswered && data.guestScore) {
          setPicks(data.guestScore.answers || {});
          setFinished(true);
        }
      })
      .catch(() => {})
      .finally(() => setHasLoaded(true));
  }, [invitationId, guestToken]);

  const submit = async (finalPicks: Record<number, number>) => {
    setFinished(true);
    if (!invitationId) return;
    setIsSaving(true);
    try {
      let score = 0;
      preguntas.forEach((q, i) => {
        if (finalPicks[i] === (q.respuestaCorrecta ?? q.correcta)) score++;
      });
      await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitationId,
          guestName: guestName || "Invitado",
          guestToken: guestToken || null,
          answers: Object.values(finalPicks),
          score,
          totalQuestions: preguntas.length,
        }),
      });
      const params = new URLSearchParams({ invitationId });
      if (guestToken) params.append("guestToken", guestToken);
      const statsRes = await fetch(`/api/quiz?${params.toString()}`);
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats({ avg: data.averagePercentage, count: data.totalResponses });
      }
    } catch {
      // El juego no bloquea el resto de la invitación si falla el guardado.
    } finally {
      setIsSaving(false);
    }
  };

  const pick = (qi: number, oi: number) => {
    if (finished || picks[qi] !== undefined) return;
    const newPicks = { ...picks, [qi]: oi };
    setPicks(newPicks);
    if (Object.keys(newPicks).length === preguntas.length) {
      submit(newPicks);
    }
  };

  if (!hasLoaded) return null;

  const score = preguntas.reduce((acc, q, i) => acc + (picks[i] === (q.respuestaCorrecta ?? q.correcta) ? 1 : 0), 0);

  return (
    <div className="bdd-quiz">
      {preguntas.map((q, qi) => {
        const correctIdx = q.respuestaCorrecta ?? q.correcta;
        return (
          <div key={qi} className="bdd-quiz-q">
            <span className="bdd-quiz-q-num">{String(qi + 1).padStart(2, "0")}</span>
            <p className="bdd-quiz-q-text">{q.pregunta}</p>
            <div className="bdd-quiz-opts">
              {q.opciones.map((opt, oi) => {
                const chosen = picks[qi] === oi;
                const revealed = picks[qi] !== undefined && correctIdx !== undefined;
                let stateClass = "";
                if (revealed) {
                  if (oi === correctIdx) stateClass = " bdd-quiz-opt--correct";
                  else if (chosen) stateClass = " bdd-quiz-opt--wrong";
                } else if (chosen) {
                  stateClass = " bdd-quiz-opt--picked";
                }
                return (
                  <button
                    key={oi}
                    type="button"
                    className={`bdd-quiz-opt${stateClass}`}
                    disabled={picks[qi] !== undefined}
                    onClick={() => pick(qi, oi)}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      {finished && (
        <div className="bdd-quiz-result">
          <p className="bdd-quiz-result-score">
            {isSaving ? "GUARDANDO…" : `RESPONDISTE ${score} DE ${preguntas.length} CORRECTAMENTE`}
          </p>
          {!isSaving && stats && stats.count > 0 && (
            <p className="bdd-quiz-result-stat">
              El promedio del resto de los invitados ({stats.count}) es del {stats.avg}%.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function BddInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="bdd-bank-row">
      <div style={{ minWidth: 0, flex: 1 }}>
        <span className="bdd-bank-row-label">{label}</span>
        <span className="bdd-bank-row-value">{value}</span>
      </div>
    </div>
  );
}

function BddCoverHalf({
  namesRef,
  kickerRef,
  perfRef,
  kickerText,
  namesTitle,
  fechaCorta,
  passNumber,
  dressCode,
  hora,
  photoMobile,
  photoDesktop,
  children,
}: {
  namesRef?: React.RefObject<HTMLHeadingElement | null>;
  kickerRef?: React.RefObject<HTMLSpanElement | null>;
  perfRef?: React.RefObject<HTMLDivElement | null>;
  kickerText: string;
  namesTitle: React.ReactNode;
  fechaCorta: string;
  passNumber: string;
  dressCode: string;
  hora: string;
  photoMobile?: string;
  photoDesktop?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bdd-cover-inner">
      {photoMobile && (
        <div className="acp-mobile-only">
          <AnimatedCoverPhoto photoSrc={photoMobile} tint tintColor1="#2E6BFF" tintColor2="#08080E" effect="enfoque" scrimColorRgb="8,8,26" />
        </div>
      )}
      {photoDesktop && (
        <div className="acp-desktop-only">
          <AnimatedCoverPhoto photoSrc={photoDesktop} tint tintColor1="#2E6BFF" tintColor2="#08080E" effect="enfoque" scrimColorRgb="8,8,26" />
        </div>
      )}
      <div className="bdd-cover-glow" />
      <div className="bdd-discolight" />
      <div className="bdd-cover-content">
        <div className="bdd-cover-top-row">
          <span>PASE Nº {passNumber}</span><span className="bdd-accent-2">ADMIT ONE</span>
        </div>
        <div className="bdd-cover-center">
          <span ref={kickerRef} className="bdd-cover-kicker">{kickerText}</span>
          <h1 ref={namesRef} className="bdd-cover-names">{namesTitle}</h1>
          <span className="bdd-cover-rule" />
          <span className="bdd-cover-date">{fechaCorta}</span>
        </div>
        <div className="bdd-cover-bottom">
          <div ref={perfRef} className="bdd-perf-strip bdd-perf-strip--reveal" />
          <div className="bdd-cover-facts">
            {dressCode && <span>{dressCode.toUpperCase()}</span>}
            <span>{hora} H</span>
          </div>
          {children}
          <div className="bdd-barcode-wrap">
            <div className="bdd-barcode" style={{ width: "62%" }} />
            <span className="bdd-mini-label" style={{ color: "#56534A" }}>NO TRANSFERIBLE</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Hoja de estilos (traslada 1:1 los tokens visuales del mockup aprobado)
// ---------------------------------------------------------------------
const BDD_CSS = `
  .bdd-scroller { position: absolute; inset: 0; overflow-y: auto; overflow-x: hidden; opacity: 0; transition: opacity 900ms ease 260ms; scrollbar-width: none; }
  .bdd-scroller::-webkit-scrollbar { width: 0; height: 0; }

  a { color: #2E6BFF; text-decoration: none; }
  a:hover { color: #FFFFFF; }

  @keyframes bddFoil { to { transform: rotate(360deg); } }
  @keyframes bddRing { to { transform: rotate(360deg); } }
  @keyframes bddRingRev { to { transform: rotate(-360deg); } }
  @keyframes bddScan { 0% { transform: translateY(0); opacity: 0; } 12% { opacity: .85; } 88% { opacity: .85; } 100% { transform: translateY(320px); opacity: 0; } }
  @keyframes bddEq { 0%,100% { transform: scaleY(.25); } 50% { transform: scaleY(1); } }
  @keyframes bddHint { 0%,100% { transform: translateY(0); } 50% { transform: translateY(7px); } }
  @keyframes bddSide { 0%,100% { transform: translateX(0); } 50% { transform: translateX(7px); } }
  @keyframes bddDiscoSweep { 0% { transform: translate(-10%,-10%); } 50% { transform: translate(10%,8%); } 100% { transform: translate(-10%,-10%); } }
  @media (prefers-reduced-motion: reduce) { .bdd-scroller *, .bdd-discolight { animation: none !important; } }

  .bdd-section { min-height: calc(var(--vh, 1vh) * 100); position: relative; display: flex; flex-direction: column; justify-content: center; gap: 30px; padding: 96px max(30px, calc((100% - 560px) / 2)) 110px max(24px, calc((100% - 560px) / 2)); overflow: hidden; }
  .bdd-section--between { justify-content: space-between; }

  .bdd-kicker { font-size: 9.5px; letter-spacing: 0.34em; color: #8A8577; }

  .bdd-hero-photo-section { position: relative; min-height: calc(var(--vh, 1vh) * 100); overflow: hidden; }
  .bdd-hero-photo-frame { position: absolute; inset: 0; overflow: hidden; }
  @media (min-width: 768px) { .bdd-hero-photo-frame { inset: 64px max(24px, calc((100% - 900px) / 2)); border: 1px solid rgba(46,107,255,.3); } }
  .bdd-hero-photo-placeholder { position: absolute; inset: 0; background: radial-gradient(120% 80% at 50% 0%, #161233 0%, #0A0A22 55%, #08081A 100%); }
  .bdd-hero-photo-kicker { position: absolute; left: max(30px, calc((100% - 560px) / 2)); bottom: 40px; z-index: 2; }

  .bdd-date-stack { display: flex; flex-direction: column; gap: 2px; }
  .bdd-date-num { font-family: var(--bdd-archivo), sans-serif; font-size: clamp(66px, 23vw, 140px); line-height: 0.82; letter-spacing: -0.04em; }
  .bdd-date-num--right { text-align: right; line-height: 0.86; }
  .bdd-date-month { font-family: var(--bdd-archivo), sans-serif; font-style: italic; font-size: clamp(50px, 18vw, 104px); line-height: 0.9; color: #2E6BFF; padding-left: 12%; }

  .bdd-divider { display: flex; align-items: center; gap: 16px; font-size: 10px; letter-spacing: 0.26em; color: #8A8577; }
  .bdd-divider-line { width: 52px; height: 1px; background: #2E6BFF; display: inline-block; }
  .bdd-divider-line--long { width: 64px; }

  .bdd-lead { margin: 0; font-family: var(--bdd-archivo), sans-serif; font-style: italic; font-size: 20px; line-height: 1.4; color: #A8A292; max-width: 330px; }
  .bdd-cal-link { display: inline-flex; align-items: center; gap: 7px; margin-top: 4px; font-family: var(--bdd-mono), monospace; font-size: 10px; letter-spacing: 0.24em; text-transform: uppercase; color: #8A8577; text-decoration: none; transition: color 200ms ease; }
  .bdd-cal-link:hover { color: #2E6BFF; }

  .bdd-medallion { position: relative; }
  .bdd-medallion--corner { position: absolute; right: max(32px, calc((100% - 560px) / 2)); top: 12%; width: clamp(86px, 22vw, 116px); aspect-ratio: 1; }
  .bdd-medallion--lg { width: clamp(130px, 34vw, 178px); aspect-ratio: 1; margin: 0 auto; }
  .bdd-medallion--final { width: clamp(104px, 26vw, 132px); aspect-ratio: 1; margin: -12px auto 0; }
  .bdd-medallion-ring { position: absolute; inset: 0; border-radius: 50%; background: conic-gradient(from 0deg, #FF17B0, #2E6BFF, #2E6BFF, #FFFFFF, #FF17B0); filter: saturate(.75); }
  .bdd-medallion-core { position: absolute; inset: 3px; border-radius: 50%; background: #0E0C22; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; text-align: center; padding: 6px; }
  .bdd-medallion-main { font-family: var(--bdd-archivo), sans-serif; font-size: clamp(20px, 6vw, 32px); line-height: 1; color: #FFFFFF; }
  .bdd-medallion-main--sm { font-size: 16px; }
  .bdd-medallion-label { font-size: 6.5px; letter-spacing: 0.24em; color: #8A8577; }
  .bdd-medallion-label--accent { color: #2E6BFF; }
  .bdd-medallion-arc { position: absolute; inset: -14%; }
  .bdd-medallion-arc-text { font-size: 7px; letter-spacing: 1.6px; fill: #2E6BFF; font-family: var(--bdd-mono), monospace; }

  .bdd-scan-grid { position: absolute; inset: 0; background: repeating-linear-gradient(0deg, rgba(200,164,92,0.06) 0 1px, transparent 1px 5px); pointer-events: none; }
  .bdd-scanline { position: absolute; left: 0; right: 0; top: 30%; height: 2px; background: linear-gradient(90deg, transparent, #FFFFFF, transparent); animation: bddScan 6s linear infinite; pointer-events: none; }

  .bdd-cd-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; position: relative; }
  .bdd-cd-box { border: 1px solid #2A2417; background: rgba(20,20,27,0.72); padding: 18px 15px; display: flex; flex-direction: column; gap: 6px; overflow: hidden; }
  .bdd-cd-num { font-family: var(--bdd-archivo), sans-serif; font-size: clamp(48px, 14vw, 80px); line-height: 0.82; color: #F6EFDD; display: inline-block; }
  .bdd-cd-label { font-size: 9px; letter-spacing: 0.3em; color: #2E6BFF; }
  .bdd-perf-strip { height: 12px; position: relative; background: radial-gradient(circle at 6px 50%, #08081A 3.4px, transparent 3.8px) 0 0/12px 12px repeat-x; opacity: .85; }
  .bdd-perf-strip--reveal { clip-path: inset(0 100% 0 0); transition: clip-path 900ms cubic-bezier(.16,1,.3,1) 500ms; }

  .bdd-glow-blob { position: absolute; right: -26%; top: 4%; width: 82vw; max-width: 540px; aspect-ratio: 1; border-radius: 50%; background: conic-gradient(from 200deg, rgba(255,23,176,0.28), rgba(46,107,255,0.24), rgba(255,255,255,0.3), rgba(255,23,176,0.28)); filter: blur(80px); opacity: .4; animation: bddFoil 30s linear infinite; }
  .bdd-phrase { margin: 0; position: relative; font-family: var(--bdd-archivo), sans-serif; font-weight: 400; font-size: clamp(50px, 15vw, 96px); line-height: 0.92; letter-spacing: -0.03em; }
  .bdd-accent-cycle { font-style: italic; }
  .bdd-accent-italic { font-style: italic; color: #2E6BFF; }
  .bdd-accent-pink-italic { font-style: italic; color: #FF17B0; }
  .bdd-accent-2 { color: #FF17B0; }
  .bdd-h2 { margin: 0; font-family: var(--bdd-archivo), sans-serif; font-weight: 400; font-size: clamp(40px, 12vw, 68px); line-height: 0.96; }

  .bdd-pan { height: 260vh; position: relative; }
  .bdd-pan-sticky { position: sticky; top: 0; height: calc(var(--vh, 1vh) * 100); overflow: hidden; }
  .bdd-strip { position: absolute; top: 0; left: 0; height: 100%; display: flex; width: 300vw; will-change: transform; }
  .bdd-panel { flex: 0 0 100vw; min-width: 0; height: 100%; box-sizing: border-box; position: relative; overflow: hidden; display: flex; flex-direction: column; padding: 84px max(24px, calc((100vw - 560px) / 2)) 100px; gap: 22px; }
  .bdd-panel--between { justify-content: space-between; }
  .bdd-panel--end { justify-content: flex-end; }
  .bdd-panel--center { align-items: center; justify-content: center; text-align: center; }
  .bdd-panel--gap { gap: clamp(14px, 2.4vh, 22px); padding: clamp(52px, 9vh, 84px) max(24px, calc((100vw - 600px) / 2)) clamp(62px, 11vh, 100px); }
  .bdd-hair-bg { position: absolute; inset: 0; background: repeating-linear-gradient(90deg, rgba(20,20,27,0.05) 0 1px, transparent 1px 26px); pointer-events: none; }
  .bdd-panel-top { position: relative; display: flex; justify-content: space-between; font-size: 9.5px; letter-spacing: 0.32em; color: #7C7768; }
  .bdd-panel-title { margin: 0; position: relative; font-family: var(--bdd-archivo), sans-serif; font-weight: 400; font-size: clamp(46px, 13.5vw, 76px); line-height: 0.92; }
  .bdd-panel-title-md { margin: 0; position: relative; font-family: var(--bdd-archivo), sans-serif; font-weight: 400; font-size: clamp(42px, 12.5vw, 64px); line-height: 0.94; }
  .bdd-panel-title-sm { margin: 0; font-family: var(--bdd-archivo), sans-serif; font-size: clamp(34px, 10vw, 52px); line-height: 1; }
  .bdd-panel-block { position: relative; display: flex; flex-direction: column; gap: 12px; }
  .bdd-mini-label { font-size: 9px; letter-spacing: 0.26em; color: #7C7768; }
  .bdd-facts { position: relative; display: flex; flex-direction: column; gap: 12px; font-size: 11px; letter-spacing: 0.14em; color: #4A473F; }
  .bdd-facts-row { display: flex; justify-content: space-between; border-bottom: 1px solid #D6D1C4; padding-bottom: 10px; }
  .bdd-facts-row--last { border-bottom: none; padding-bottom: 0; }
  .bdd-seguir { position: relative; display: flex; align-items: center; gap: 10px; font-size: 9px; letter-spacing: 0.26em; color: #FF17B0; margin-top: auto; }
  .bdd-seguir--split { justify-content: space-between; }
  .bdd-side-hint { display: inline-block; animation: bddSide 2.2s ease-in-out infinite; }
  .bdd-route-svg { position: absolute; inset: 0; width: 100%; height: 100%; }
  .bdd-link-cta { font-size: 10px; letter-spacing: 0.24em; color: #FF17B0; }

  .bdd-crono { position: relative; display: flex; flex-direction: column; gap: 8px; margin-top: 4px; }
  .bdd-crono-row { display: flex; align-items: baseline; gap: 14px; font-size: 11px; letter-spacing: 0.1em; color: #4A473F; border-bottom: 1px solid #D6D1C4; padding-bottom: 8px; }
  .bdd-crono-time { font-family: var(--bdd-mono), monospace; color: #FF17B0; min-width: 42px; }
  .bdd-crono-title { flex: 1; }

  .bdd-dots { position: absolute; left: 0; right: 34px; bottom: 26px; display: flex; gap: 6px; justify-content: center; z-index: 2; }
  .bdd-dot { width: 22px; height: 2px; background: rgba(20,20,27,0.18); transition: background 400ms ease; display: inline-block; }

  .bdd-stub { position: relative; overflow: hidden; border: 1px solid #2A2417; background: rgba(20,20,27,0.7); padding: 20px; display: flex; flex-direction: column; gap: 16px; transition: border-color 600ms ease, box-shadow 600ms ease; }
  .bdd-stub-top { display: flex; justify-content: space-between; font-size: 9px; letter-spacing: 0.24em; color: #8A8577; }
  .bdd-stub-status { color: #6E6A5D; transition: color 400ms ease; }
  .bdd-seal { width: 62px; aspect-ratio: 1; position: relative; opacity: .25; transform: scale(.86); transition: opacity 700ms ease, transform 700ms cubic-bezier(.16,1,.3,1); align-self: center; }
  .bdd-beam { position: absolute; left: 0; right: 0; top: 0; height: 2px; background: linear-gradient(90deg, transparent, #FFFFFF, transparent); opacity: 0; transition: transform 900ms cubic-bezier(.16,1,.3,1), opacity 300ms ease; }

  .bdd-rsvp { display: flex; flex-direction: column; gap: 22px; width: 100%; max-width: 420px; font-family: var(--bdd-mono), monospace; }
  .bdd-rsvp-rows { display: flex; flex-direction: column; }
  .bdd-rsvp-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 0; border-bottom: 1px solid rgba(46,107,255,0.18); font-size: 10.5px; letter-spacing: 0.18em; color: #6E6A5D; }
  .bdd-rsvp-row > span:first-child { flex-shrink: 0; }
  .bdd-rsvp-row > span:last-child { color: #F4F1EA; letter-spacing: 0.02em; text-align: right; }
  .bdd-rsvp-row--payment { align-items: flex-start; }
  .bdd-rsvp-payment-value { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
  .bdd-rsvp-payment-total { color: #F6EFDD; font-size: 13px; letter-spacing: 0.02em; font-weight: 600; }
  .bdd-rsvp-payment-detail { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; font-size: 9px; letter-spacing: 0.05em; color: #8A8577; }
  .bdd-rsvp-stepper { display: flex; align-items: center; gap: 12px; }
  .bdd-rsvp-stepper button { width: 26px; height: 26px; border-radius: 50%; border: 1px solid #2E6BFF; background: transparent; color: #2E6BFF; font-size: 14px; line-height: 1; cursor: pointer; }
  .bdd-rsvp-stepper button:disabled { opacity: 0.3; cursor: default; }
  .bdd-rsvp-stepper span { font-family: var(--bdd-mono), monospace; color: #F4F1EA; min-width: 20px; text-align: center; }
  .bdd-rsvp-input { background: transparent; border: none; border-bottom: 1px solid rgba(46,107,255,0.3); color: #F4F1EA; font-family: var(--bdd-mono), monospace; font-size: 11px; letter-spacing: 0.02em; padding: 4px 2px; text-align: right; max-width: 55%; }
  .bdd-rsvp-input::placeholder { color: #6E6A5D; }
  .bdd-rsvp-input:focus { outline: none; border-bottom-color: #2E6BFF; }
  .bdd-rsvp-btn { width: 100%; padding: 16px; font-family: var(--bdd-mono), monospace; font-size: 11px; font-weight: 600; letter-spacing: 0.22em; text-transform: uppercase; border: 1px solid #2E6BFF; background: linear-gradient(100deg, rgba(200,164,92,0.08), rgba(232,214,168,0.2), rgba(200,164,92,0.08)); color: #F6EFDD; cursor: pointer; transition: background 300ms ease, color 300ms ease; }
  .bdd-rsvp-btn:hover:not(:disabled) { background: linear-gradient(100deg, rgba(232,214,168,0.34), rgba(246,239,221,0.5), rgba(232,214,168,0.34)); color: #0A0818; }
  .bdd-rsvp-btn:disabled { opacity: 0.6; cursor: default; }
  .bdd-rsvp-btn--ghost { background: transparent; color: #2E6BFF; }
  .bdd-rsvp-btn--ghost:hover:not(:disabled) { background: rgba(46,107,255,0.1); color: #2E6BFF; }
  .bdd-rsvp-error { font-size: 10px; letter-spacing: 0.06em; color: #FF17B0; margin: 0; }
  .bdd-rsvp-declined { display: flex; flex-direction: column; gap: 18px; align-items: center; text-align: center; max-width: 380px; }
  .bdd-rsvp-declined-text { margin: 0; font-family: var(--bdd-archivo), sans-serif; font-style: italic; font-size: 18px; line-height: 1.4; color: #A8A292; }

  .bdd-upload-wrap { flex: 1; min-height: 0; overflow-y: auto; }
  .bdd-album-embed { flex: 1; min-height: 0; overflow-y: auto; }
  .bdd-live-placeholder { flex: 1; display: flex; align-items: center; justify-content: center; text-align: center; padding: 24px; border: 1px dashed rgba(20,20,27,0.2); }
  .bdd-photo-placeholder { position: relative; font-size: 8.5px; letter-spacing: 0.16em; color: #6E6A5D; }

  .bdd-mosaic { position: relative; flex: 1; min-height: 0; display: grid; grid-template-columns: repeat(3, 1fr); grid-auto-rows: auto; grid-auto-flow: dense; align-content: start; gap: 10px; }
  .bdd-mosaic-cell--featured { grid-column: span 2; grid-row: span 2; cursor: pointer; }
  .bdd-mosaic-cell { position: relative; height: 0; padding-top: 100%; background: repeating-linear-gradient(135deg, #DCD7CB 0 6px, #E9E5DC 6px 12px); overflow: hidden; cursor: pointer; }
  .bdd-mosaic-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }

  .bdd-bank-wrap { position: relative; display: flex; flex-direction: column; gap: 14px; width: 100%; max-width: 420px; margin: 0; }
  .bdd-bank-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid rgba(46,107,255,0.18); }
  .bdd-bank-row:last-child { border-bottom: none; }
  .bdd-bank-row-label { display: block; font-size: 9px; letter-spacing: 0.2em; color: #8A8577; margin-bottom: 3px; }
  .bdd-bank-row-value { font-size: 12px; color: #F4F1EA; word-break: break-all; }
  .bdd-bank-copy { flex-shrink: 0; font-family: var(--bdd-mono), monospace; font-size: 10px; letter-spacing: 0.1em; padding: 7px 12px; border: 1px solid #2E6BFF; background: transparent; color: #2E6BFF; cursor: pointer; }
  .bdd-bank-copy:hover { background: rgba(46,107,255,0.12); }

  .bdd-eq { display: flex; align-items: flex-end; gap: 5px; height: 52px; }
  .bdd-eq-bar { width: 4px; height: 100%; transform-origin: bottom; animation: bddEq 1.1s ease-in-out infinite; display: inline-block; }
  .bdd-song-wrap { font-family: var(--bdd-mono), monospace; }

  .bdd-song { position: relative; width: 100%; max-width: 420px; margin: 0 auto; }
  .bdd-song-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; border-bottom: 1px solid rgba(46,107,255,0.3); padding-bottom: 12px; }
  .bdd-song-inputs { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; font-size: 10px; letter-spacing: 0.24em; color: #8A8577; text-transform: uppercase; }
  .bdd-song-input { background: transparent; border: none; border-bottom: 1px solid rgba(46,107,255,0.3); color: #F4F1EA; font-family: var(--bdd-mono), monospace; font-size: 12px; padding: 6px 2px; min-width: 0; flex: 1; }
  .bdd-song-input::placeholder { color: #6E6A5D; }
  .bdd-song-input:focus { outline: none; border-bottom-color: #2E6BFF; }
  .bdd-song-sep { color: #8A8577; flex-shrink: 0; }
  .bdd-song-submit { flex-shrink: 0; background: none; border: none; color: #2E6BFF; font-family: var(--bdd-mono), monospace; font-size: 10px; letter-spacing: 0.2em; cursor: pointer; }
  .bdd-song-submit:hover { color: #FFFFFF; }
  .bdd-song-submit:disabled { color: #6E6A5D; cursor: default; }
  .bdd-song-error { font-size: 10px; color: #FF17B0; margin-top: 6px; }
  .bdd-song-list { display: flex; flex-direction: column; margin-top: 14px; max-height: 180px; overflow-y: auto; }
  .bdd-song-item { display: flex; flex-direction: column; gap: 3px; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06); font-family: var(--bdd-mono), monospace; }
  .bdd-song-item-title { font-size: 11.5px; letter-spacing: 0.04em; color: #F4F1EA; }
  .bdd-song-item-by { font-size: 9.5px; letter-spacing: 0.1em; color: #6E6A5D; }

  .bdd-quiz { display: flex; flex-direction: column; gap: 28px; width: 100%; max-width: 460px; }
  .bdd-quiz-q { display: flex; flex-direction: column; gap: 14px; }
  .bdd-quiz-q-num { font-family: var(--bdd-mono), monospace; font-size: 10px; letter-spacing: 0.24em; color: #8A8577; }
  .bdd-quiz-q-text { margin: 0; font-family: var(--bdd-archivo), sans-serif; font-size: clamp(16px, 4vw, 20px); line-height: 1.3; color: #F4F1EA; }
  .bdd-quiz-opts { display: flex; flex-wrap: wrap; gap: 10px; }
  .bdd-quiz-opt { font-family: var(--bdd-mono), monospace; font-size: 11px; letter-spacing: 0.06em; padding: 10px 16px; border: 1px solid rgba(46,107,255,0.4); background: transparent; color: #2E6BFF; cursor: pointer; transition: background 160ms ease, color 160ms ease, border-color 160ms ease; }
  .bdd-quiz-opt:disabled { cursor: default; }
  .bdd-quiz-opt--picked { background: #2E6BFF; border-color: #2E6BFF; color: #0A0818; }
  .bdd-quiz-opt--correct { background: #2E6BFF; border-color: #2E6BFF; color: #0A0818; }
  .bdd-quiz-opt--wrong { border-color: #8A6A6A; color: #C99; opacity: 0.6; }
  .bdd-quiz-result { padding-top: 18px; border-top: 1px solid rgba(46,107,255,0.2); }
  .bdd-quiz-result-score { margin: 0 0 6px; font-family: var(--bdd-mono), monospace; font-size: 11px; letter-spacing: 0.16em; color: #FFFFFF; }
  .bdd-quiz-result-stat { margin: 0; font-size: 11.5px; line-height: 1.5; color: #A8A292; }

  .bdd-final-card { border: 1px solid #2E6BFF; padding: 30px 24px; display: flex; flex-direction: column; gap: 22px; align-items: center; text-align: center; position: relative; }
  .bdd-final-names { font-family: var(--bdd-archivo), sans-serif; font-size: clamp(34px, 10vw, 46px); line-height: .9; color: #FFFFFF; }
  .bdd-barcode { height: 26px; background: repeating-linear-gradient(90deg, #6E6A5D 0 2px, transparent 2px 4px, #6E6A5D 4px 5px, transparent 5px 9px, #6E6A5D 9px 11px, transparent 11px 14px); }
  .bdd-final-footer { display: flex; justify-content: space-between; align-items: center; font-size: 9px; letter-spacing: 0.24em; color: #56534A; }
  .bdd-replay { cursor: pointer; color: #2E6BFF; }
  .bdd-footer-credit { display: flex; justify-content: center; padding-top: 8px; opacity: 0.7; }

  .bdd-rail { position: absolute; right: 0; top: 0; bottom: 0; width: 34px; z-index: 4; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 20px 0; opacity: 0; transition: opacity 700ms ease; pointer-events: none; border-left: 1px solid rgba(200,164,92,0.14); }
  .bdd-rail-top { writing-mode: vertical-rl; font-size: 8px; letter-spacing: 0.34em; color: #8A8577; transition: color 500ms ease; }
  .bdd-rail-line { flex: 1; width: 1px; margin: 16px 0; background: rgba(200,164,92,0.16); position: relative; }
  .bdd-rail-bar { position: absolute; left: -1px; top: 0; width: 3px; height: 0%; background: linear-gradient(#FFFFFF, #2E6BFF); transition: height 260ms linear; display: block; }
  .bdd-rail-label { writing-mode: vertical-rl; font-size: 8px; letter-spacing: 0.34em; color: #2E6BFF; transition: color 500ms ease; }

  .bdd-cover { position: absolute; inset: 0; z-index: 5; }
  .bdd-cover-half { position: absolute; left: 0; right: 0; height: 50%; overflow: hidden; transition: transform 1100ms cubic-bezier(.7,0,.2,1); }
  .bdd-cover-half--top { top: 0; }
  .bdd-cover-half--bottom { bottom: 0; }
  .bdd-cover-inner { position: absolute; left: 0; right: 0; top: 0; height: 200%; overflow: hidden; background: radial-gradient(120% 70% at 50% 8%, #120E2A 0%, #0A0A22 46%, #08081A 100%); }
  .bdd-cover-half--bottom .bdd-cover-inner { top: auto; bottom: 0; }
  .bdd-cover-glow { position: absolute; left: 50%; top: 6%; width: 190%; aspect-ratio: 1; transform: translate(-50%, -14%); border-radius: 50%; background: conic-gradient(from 200deg, rgba(255,23,176,0.4), rgba(46,107,255,0.36), rgba(255,255,255,0.4), rgba(255,23,176,0.4)); filter: blur(64px); opacity: .62; animation: bddFoil 26s linear infinite; }
  /* Luces de la bola de espejos (ver mockup original): puntos radiales de
     distintos colores que barren en diagonal -- reemplaza al abanico de
     destellos ("sparkles") de otras plantillas de la colección, propio de
     este mockup de club nocturno. */
  .bdd-discolight { position: absolute; inset: -20%; animation: bddDiscoSweep 8s ease-in-out infinite; background:
    radial-gradient(4% 3% at 20% 20%, rgba(255,255,255,.9), transparent 60%),
    radial-gradient(3% 2% at 70% 15%, rgba(255,23,176,.7), transparent 60%),
    radial-gradient(3% 2% at 40% 60%, rgba(46,107,255,.7), transparent 60%),
    radial-gradient(3% 2% at 85% 70%, rgba(255,255,255,.6), transparent 60%),
    radial-gradient(2% 2% at 15% 80%, rgba(255,255,255,.7), transparent 60%); }
  .bdd-cover-content { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: space-between; padding: 24px max(24px, calc((100% - 440px) / 2)) 26px; }
  .bdd-cover-top-row { display: flex; justify-content: space-between; font-size: 9.5px; letter-spacing: 0.24em; color: #8A8577; }
  .bdd-cover-center { display: flex; flex-direction: column; align-items: center; gap: clamp(10px, 2.2vh, 22px); text-align: center; }
  .bdd-cover-kicker { font-size: 9.5px; letter-spacing: 0.34em; color: #8A8577; }
  .bdd-cover-names { margin: 0; font-family: var(--bdd-archivo), sans-serif; font-weight: 400; font-size: min(clamp(48px, 16vw, 96px), 12.5vh); line-height: 0.86; letter-spacing: -0.02em; color: #FFFFFF; }
  .bdd-cover-rule { width: 1px; height: clamp(16px, 4vh, 44px); background: linear-gradient(#2E6BFF, transparent); display: block; }
  .bdd-cover-date { font-size: 11.5px; letter-spacing: 0.3em; color: #A8A292; white-space: nowrap; }
  .bdd-cover-bottom { display: flex; flex-direction: column; gap: clamp(12px, 2.4vh, 22px); }
  .bdd-cover-facts { display: flex; justify-content: space-between; font-size: 9px; letter-spacing: 0.2em; color: #6E6A5D; }
  .bdd-cover-cta { border: 1px solid #2E6BFF; background: linear-gradient(100deg, rgba(200,164,92,0.08), rgba(232,214,168,0.2), rgba(200,164,92,0.08)); color: #F6EFDD; font-family: var(--bdd-mono), monospace; font-size: 12px; letter-spacing: 0.26em; padding: clamp(13px, 2.1vh, 19px) 0; text-align: center; width: 100%; }
  .bdd-cover-cta--btn { cursor: pointer; border-radius: 0; }
  @media (hover: hover) {
    .bdd-cover-cta--btn:hover { background: linear-gradient(100deg, rgba(232,214,168,0.34), rgba(246,239,221,0.5), rgba(232,214,168,0.34)); color: #0A0818; }
  }
  .bdd-barcode-wrap { display: flex; flex-direction: column; align-items: center; gap: 10px; }

  .bdd-hint { position: absolute; left: 0; right: 34px; bottom: 18px; z-index: 6; text-align: center; font-size: 9px; letter-spacing: 0.28em; color: #8A8577; opacity: 0; transition: opacity 600ms ease; pointer-events: none; animation: bddHint 2.4s ease-in-out infinite; }

  .bdd-lightbox { position: fixed; inset: 0; z-index: 200; background: rgba(8,8,11,0.96); display: flex; align-items: center; justify-content: center; padding: 24px; cursor: zoom-out; }
  .bdd-lightbox-close { position: absolute; top: 20px; right: 20px; width: 36px; height: 36px; border-radius: 50%; border: 1px solid #2E6BFF; background: rgba(0,0,0,0.4); color: #F4F1EA; font-size: 18px; line-height: 1; cursor: pointer; display: flex; align-items: center; justify-content: center; }
  .bdd-lightbox-img { max-width: 100%; max-height: 88vh; object-fit: contain; cursor: default; }
`;
