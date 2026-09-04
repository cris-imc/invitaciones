"use client";

/**
 * Crystal3dTemplate.tsx
 *
 * Portado 1:1 desde el diseño "Crystal 3D -- Panoramica" (Colección
 * Storytelling, mis quince años: fondo carbón casi negro, doble acento
 * cian/lavanda, Poppins + IBM Plex Mono, medallón facetado tipo gema en la
 * portada, medallones circulares con el "15" en el resto de la pieza,
 * scroll horizontal "pineado" para Cuándo y dónde / Álbum, riel lateral de
 * progreso y portada que se abre en dos mitades con textura de facetas
 * cruzadas). Misma arquitectura que PrincesaTemplate.tsx (ver ese archivo
 * para el detalle del motor de motion) -- todo el motion es CSS + SVG + un
 * loop de scroll propio, cero PNGs.
 *
 * Secciones fijas del producto (Save the Date, Countdown, Frase, Cuándo y
 * dónde, RSVP, Álbum, Música, Footer) reinterpretadas visualmente, conectadas
 * a datos reales de `Invitation`/`Guest`. Tipografía/countdown/álbum/RSVP/quiz
 * son de diseño fijo (no elegibles desde el wizard, como toda esta colección),
 * pero hablan SIEMPRE con los mismos endpoints reales del backend
 * (/api/guests/[token]/confirm, /api/songs, /api/quiz).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Poppins, IBM_Plex_Mono } from "next/font/google";
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

const c3dPoppins = Poppins({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "600", "700"],
  variable: "--c3d-poppins",
  display: "swap",
});

const c3dMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--c3d-mono",
  display: "swap",
});

// Tonos claros que rotan entre hojas del álbum para diferenciarlas a simple
// vista sin depender de más de 3 colores fijos (mismos valores del mockup).
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

interface C3dQuizQuestion {
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

interface Crystal3dTemplateProps {
  invitation: Record<string, unknown>;
  guest?: GuestRecord | null;
  isPersonalized?: boolean;
}

// El backend no reserva mesas/sectores -- el medallón muestra el orden real
// del invitado (001, 002...) en vez de un número inventado.
function passNumberFrom(orderNumber: number | undefined): string {
  if (!orderNumber) return "---";
  return String(orderNumber).padStart(3, "0");
}

export function Crystal3dTemplateEsmeraldaPlata({ invitation, guest, isPersonalized = false }: Crystal3dTemplateProps) {
  const nombreQuinceanera = String(invitation.nombreQuinceanera || invitation.nombreEvento || "");
  const namesTitle = nombreQuinceanera || "Mis quince";

  // "Saludar por nombre del invitado/familia": si está activo, la portada
  // saluda con el nombre del invitado/familia en vez de la quinceañera.
  const showGuestNameInCover = Boolean(guest?.name) && invitation.mostrarNombreInvitadoEnSaludo !== false;
  const coverGuestName = resolveGuestNameDisplay(invitation, guest);
  const coverKickerText = showGuestNameInCover ? "UNA FACETA ÚNICA PARA" : "UNA FACETA ÚNICA PARA LOS 15 DE";
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
    invitation.portadaMensaje || "Bloqueá la noche entera. Esto no termina temprano."
  );

  // Cronograma real (no inventado) -- se muestra tal cual lo cargó el
  // cliente en el wizard, en la misma hoja que Salón.
  const cronograma: CronoItem[] = safeJson<CronoItem[]>(String(invitation.cronogramaEventos ?? ""), []);

  // Ceremonia: sección propia si está habilitada (lugar distinto a la
  // fiesta, ver StepCeremonia.tsx) -- nunca se mezcla con los datos del salón.
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
  // "Nuestra foto" (02) y "Un mensaje para vos" (frase) son las únicas
  // secciones que pueden no existir. La frase es la misma para mobile y
  // desktop, pero la foto NO -- cada breakpoint tiene su propio recorte
  // independiente (ver arriba), así que un mismo kicker puede necesitar
  // mostrar un número distinto en mobile que en desktop (ej. si solo hay
  // recorte mobile, la tapa Y la numeración de ahí en más avanzan un lugar
  // en mobile pero no en desktop). kn()/knPre() devuelven AMBOS números a
  // la vez, envueltos en acp-mobile-only/acp-desktop-only (mismas clases
  // que ya deciden qué foto se ve en cada breakpoint), para que cada uno
  // muestre el que le corresponde. knPre() es para Countdown y la Frase
  // misma (solo les afecta la Foto, que va ANTES en la secuencia); kn() es
  // para todo lo que sigue después de la Frase (les afecta la Foto Y/O la
  // Frase).
  const hasFrase = Boolean(invitation.frasePersonalizadaHabilitada) && Boolean(invitation.frasePersonalizadaTexto);
  const kOffsetMobilePre = photoMobile ? 1 : 0;
  const kOffsetDesktopPre = photoDesktop ? 1 : 0;
  const kOffsetMobile = kOffsetMobilePre + (hasFrase ? 1 : 0);
  const kOffsetDesktop = kOffsetDesktopPre + (hasFrase ? 1 : 0);
  const kn = (base: number) => (
    <>
      <span className="acp-mobile-only">{String(base + kOffsetMobile).padStart(2, "0")}</span>
      <span className="acp-desktop-only">{String(base + kOffsetDesktop).padStart(2, "0")}</span>
    </>
  );
  const knPre = (base: number) => (
    <>
      <span className="acp-mobile-only">{String(base + kOffsetMobilePre).padStart(2, "0")}</span>
      <span className="acp-desktop-only">{String(base + kOffsetDesktopPre).padStart(2, "0")}</span>
    </>
  );
  const knAcc = (count: number) => (
    <>
      <span className="acp-mobile-only">{count + kOffsetMobile}</span>
      <span className="acp-desktop-only">{count + kOffsetDesktop}</span>
    </>
  );
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
  const triviaPreguntas: C3dQuizQuestion[] = safeJson<C3dQuizQuestion[]>(String(invitation.triviaPreguntas ?? ""), []);
  const triviaTitulo = String(invitation.triviaTitulo || "¿Cuánto sabés de mí?");
  const quizEnabled = triviaHabilitada && triviaPreguntas.length > 0;

  // Frase: elegible/personalizable desde el wizard (StepPhrase) -- si está
  // deshabilitada o no se cargó texto, la sección entera no se muestra (ver
  // hasFrase más arriba): no hay frase default hardcodeada como fallback,
  // si no se quiere frase no debe aparecer ninguna.
  const frase = hasFrase ? String(invitation.frasePersonalizadaTexto) : "";
  const fraseWords = frase.split(/\s+/).filter(Boolean);
  // Combinación de colores del diseño: primera mitad de la frase en color
  // plano, segunda mitad alterna itálica cian/lavanda palabra a palabra
  // (ver mockup: "refracta"=cian, "una"=lavanda, "sola"=cian, "vez."=lavanda),
  // partiendo por la mitad de la cantidad real de palabras.
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
  // refs para el motor de motion (idéntico al de PrincesaTemplate.tsx,
  // corriendo sobre requestAnimationFrame)
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
        statusRef.current.style.color = "#EAF6F0";
      }
      if (stubRef.current) {
        stubRef.current.style.borderColor = "#6FCB9F";
        stubRef.current.style.boxShadow = "0 0 0 1px rgba(111,203,159,.35), 0 18px 50px -30px #6FCB9F";
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
            dot.style.background = i === active ? "#C7D2D6" : "rgba(20,20,27,0.18)";
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
          if (railRef.current) railRef.current.style.borderLeftColor = light ? "rgba(20,20,27,0.14)" : "rgba(111,203,159,0.14)";
          if (railLineRef.current) railLineRef.current.style.background = light ? "rgba(20,20,27,0.14)" : "rgba(111,203,159,0.16)";
          if (railTopRef.current) railTopRef.current.style.color = light ? "#7C7768" : "#8A8577";
          if (railLabelRef.current) railLabelRef.current.style.color = light ? "#C7D2D6" : "#6FCB9F";
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
    // exactamente un panel -- se siente como pasar de foto a fotos, no como
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
      className={`${c3dPoppins.variable} ${c3dMono.variable}`}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "calc(var(--vh, 1vh) * 100)",
        overflow: "hidden",
        background: "#070F0D",
        fontFamily: "var(--c3d-mono), monospace",
        color: "#F4F1EA",
      }}
    >
      <style>{C3D_CSS}</style>
      <style>{COVER_RESPONSIVE_STYLE}</style>

      <div ref={scrollerRef} data-scroller="1" className="c3d-scroller">
        <section data-tone="dark" data-screen-label="Save the Date" className="c3d-section" style={{ background: "radial-gradient(120% 80% at 50% 0%, #142019 0%, #0B1512 55%, #070F0D 100%)" }}>
          <span data-xin="1" data-dist="-60" className="c3d-kicker">01 — GUARDÁ LA FECHA</span>
          <div className="c3d-date-stack">
            <span data-xin="1" data-delay="60" data-dist="-110" className="c3d-date-num">{dayNum}</span>
            <span data-xin="1" data-delay="170" data-dist="140" className="c3d-date-month">{monthAbbr}</span>
            <span data-xin="1" data-delay="280" data-dist="220" className="c3d-date-num c3d-date-num--right">
              {String(fechaEvento.getFullYear()).slice(-2)}
            </span>
          </div>
          <div data-xin="1" data-delay="380" data-dist="-80" className="c3d-divider">
            <span className="c3d-divider-line" /><span>{weekday} · {hora} H</span>
          </div>
          <p data-xin="1" data-delay="460" className="c3d-lead">{portadaMensaje}</p>
          <AddToCalendarLink
            eventName={namesTitle}
            targetDate={eventDateTime}
            location={lugarNombre || direccion}
            description={portadaMensaje}
            className="c3d-cal-link"
          />

          <div data-drift="-70" className="c3d-medallion c3d-medallion--corner">
            <C3dFacetGem arcId="c3dArc0" arcText="MIS 15 · ADMIT ONE · " />
          </div>
        </section>

        {(photoMobile || photoDesktop) && (
          <section
            data-tone="dark"
            data-screen-label="Nuestra foto"
            className={`c3d-hero-photo-section${!photoMobile ? " c3d-hero-photo-section--no-mobile" : ""}${!photoDesktop ? " c3d-hero-photo-section--no-desktop" : ""}`}
          >
            <div className="c3d-hero-photo-frame">
              {photoMobile && (
                <div className="acp-mobile-only">
                  <AnimatedCoverPhoto photoSrc={photoMobile} tint={false} effect="enfoque" scrimColorRgb="7,15,13" />
                </div>
              )}
              {photoDesktop && (
                <div className="acp-desktop-only">
                  <AnimatedCoverPhoto photoSrc={photoDesktop} tint={false} effect="enfoque" scrimColorRgb="7,15,13" />
                </div>
              )}
            </div>
            <span data-xin="1" data-dist="-60" className="c3d-kicker c3d-hero-photo-kicker">02 — EL CRISTAL YA BRILLA</span>
          </section>
        )}

        <section id="countdown" data-tone="dark" data-screen-label="Countdown" className="c3d-section c3d-section--between" style={{ background: "radial-gradient(100% 60% at 50% 100%, #16281E 0%, #0C1712 55%, #070F0D 100%)" }}>
          <div className="c3d-scan-grid" />
          <div className="c3d-scanline" />
          <span data-xin="1" data-dist="-60" className="c3d-kicker" style={{ position: "relative" }}>{knPre(2)} — EL CRISTAL SE ILUMINA EN</span>
          <div className="c3d-cd-grid">
            <C3dCdBox refEl={dRef} delay={40} dist={-90} label="DÍAS" />
            <C3dCdBox refEl={hRef} delay={120} dist={110} label="HORAS" />
            <C3dCdBox refEl={mRef} delay={200} dist={-140} label="MIN" />
            <C3dCdBox refEl={sRef} delay={280} dist={170} label="SEG" />
          </div>
          <div className="c3d-perf-strip" />
        </section>

        {hasFrase && (
        <section id="quote" data-tone="dark" data-screen-label="Frase" className="c3d-section" style={{ background: "radial-gradient(130% 90% at 86% 16%, #142720 0%, #0B1613 52%, #070F0D 100%)" }}>
          <div data-drift="-130" className="c3d-glow-blob" />
          <span data-xin="1" data-dist="-60" className="c3d-kicker" style={{ position: "relative" }}>{knPre(3)} — CUANDO LLEGUE A CERO</span>
          <h2 ref={phraseRef} className="c3d-phrase" style={{ fontSize: fraseFontSize }}>
            {fraseWords.map((w, i) => {
              const accented = i >= fraseAccentStart;
              const cyanTurn = (i - fraseAccentStart) % 2 === 0;
              const cls = accented ? (cyanTurn ? "c3d-accent-italic-cyan" : "c3d-accent-italic-lavender") : undefined;
              return (
                // El espacio va FUERA del span: el motor de reveal fuerza
                // `display:inline-block` en cada [data-w], y un espacio de fin
                // de línea DENTRO de un inline-block se colapsa a 0 -- como
                // texto suelto entre spans, en cambio, se renderiza normal.
                <span key={i}>
                  <span data-w="1" className={cls}>
                    {w}
                  </span>{" "}
                </span>
              );
            })}
          </h2>
          <div data-xin="1" data-delay="120" data-dist="90" className="c3d-divider" style={{ position: "relative" }}>
            <span className="c3d-divider-line c3d-divider-line--long" /><span>{fechaCorta} — {hora} H</span>
          </div>
        </section>
        )}

        <div data-pan="1" data-screen-label="Cuándo y dónde" className="c3d-pan" style={ceremoniaHabilitada ? { height: "340vh" } : undefined}>
          <div className="c3d-pan-sticky">
            <div data-strip="1" className="c3d-strip">
              {ceremoniaHabilitada && (
                <div id="ceremonia" data-tone="light" className="c3d-panel c3d-panel--between" style={{ background: "#EFEBE1", color: "#14141B" }}>
                  <div className="c3d-hair-bg" />
                  <div className="c3d-panel-top">
                    <span>{kn(3)} — {ceremoniaTitulo.toUpperCase()}</span><span>01 / {LUGAR_PANEL_COUNT}</span>
                  </div>
                  <h2 className="c3d-panel-title">
                    {ceremoniaNombre || ceremoniaTitulo}
                    {ceremoniaDireccion && <><br /><span className="c3d-accent-italic-cyan">{ceremoniaDireccion}</span></>}
                  </h2>
                  <div className="c3d-facts">
                    {ceremoniaHora && (
                      <div className="c3d-facts-row c3d-facts-row--last">
                        <span>HORARIO</span><span>{ceremoniaHora} H</span>
                      </div>
                    )}
                  </div>
                  {ceremoniaMapUrl && (
                    <a href={ceremoniaMapUrl} target="_blank" rel="noopener noreferrer" className="c3d-link-cta">
                      ABRIR EN MAPAS →
                    </a>
                  )}
                  <div className="c3d-seguir">SEGUÍ BAJANDO <span className="c3d-side-hint">→</span></div>
                </div>
              )}

              <div id="details" data-tone="light" className="c3d-panel c3d-panel--between" style={{ background: "#EFEBE1", color: "#14141B" }}>
                <div className="c3d-hair-bg" />
                <div className="c3d-panel-top">
                  <span>{kn(3)} — CUÁNDO Y DÓNDE</span><span>{ceremoniaHabilitada ? "02" : "01"} / {LUGAR_PANEL_COUNT}</span>
                </div>
                <h2 className="c3d-panel-title">
                  {lugarNombre || "Studio"}
                  {direccion && <><br /><span className="c3d-accent-italic-cyan">{direccion}</span></>}
                </h2>
                <div className="c3d-facts">
                  <div className="c3d-facts-row">
                    <span>HORARIO</span><span>{hora} H</span>
                  </div>
                  {dressCode && (
                    <div className="c3d-facts-row c3d-facts-row--last">
                      <span>CÓDIGO</span><span className="c3d-accent-lavender">{dressCode.toUpperCase()}</span>
                    </div>
                  )}
                </div>
                {cronograma.length > 0 && (
                  <div className="c3d-crono">
                    {cronograma.map((item, i) => (
                      <div key={i} className="c3d-crono-row">
                        <span className="c3d-crono-time">{item.time || ""}</span>
                        <span className="c3d-crono-title">{item.title}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="c3d-seguir">SEGUÍ BAJANDO <span className="c3d-side-hint">→</span></div>
              </div>

              <div data-tone="light" className="c3d-panel c3d-panel--end" style={{ background: "#E4DFD3", color: "#14141B" }}>
                <svg viewBox="0 0 300 500" preserveAspectRatio="none" className="c3d-route-svg">
                  <path ref={routeRef} d="M18 468 C 130 400, 54 262, 152 220 S 254 140, 282 40" fill="none" stroke="#C7D2D6" strokeWidth={1.6} />
                  <circle cx={282} cy={40} r={5} fill="#C7D2D6" />
                </svg>
                <div className="c3d-panel-block">
                  <span className="c3d-mini-label">{ceremoniaHabilitada ? "03" : "02"} / {LUGAR_PANEL_COUNT}</span>
                  <span className="c3d-panel-title-sm">Cómo llegar</span>
                  {direccion && <span className="c3d-mini-label">{direccion}</span>}
                  {mapUrl && (
                    <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="c3d-link-cta">
                      ABRIR EN MAPAS →
                    </a>
                  )}
                </div>
              </div>

              <div data-tone="dark" className="c3d-panel c3d-panel--center" style={{ background: "#0B1512", color: "#F4F1EA" }}>
                <div className="c3d-medallion c3d-medallion--lg">
                  <C3dMedallion
                    ringGradient="conic-gradient(from 90deg, #6FCB9F, #EAF6F0, #C7D2D6, #6FCB9F, #6FCB9F)"
                    topLabel="ACCESO VIP"
                    sub={`PASE Nº ${passNumber}`}
                    subAccent="cyan"
                    arcId="c3dArc2"
                    arcText={`ACCESO VIP · PASE Nº ${passNumber} · `}
                  />
                </div>
                <span className="c3d-mini-label">{LUGAR_PANEL_COUNT} / {LUGAR_PANEL_COUNT} — TU UBICACIÓN</span>
              </div>
            </div>
            <C3dDots count={LUGAR_PANEL_COUNT} />
          </div>
        </div>

        <section data-tone="dark" data-screen-label="Check-in" className="c3d-section" style={{ background: "radial-gradient(110% 70% at 50% 100%, #142019 0%, #0B1512 60%, #070F0D 100%)" }}>
          <span data-xin="1" data-dist="-60" className="c3d-kicker">{kn(4)} — CHECK-IN</span>
          <h2 data-xin="1" data-delay="80" data-dist="130" className="c3d-h2">
            Confirmá<br /><span className="c3d-accent-italic-cyan">tu acceso</span>
          </h2>

          {rsvpEnabled ? (
            <div data-xin="1" data-delay="170" data-dist="-90" className="c3d-rsvp">
              <C3dRsvpCard
                invitationId={String(invitation.id ?? "")}
                guestToken={guest?.uniqueToken}
                guestName={guestName}
                maxAdults={guestAdults}
                maxTeens={guestTeens}
                maxChildren={guestChildren}
                hasPayment={paymentEnabled}
                paymentAmount={paymentAmount}
                isExempt={guest?.isExempt ?? false}
                paymentStatus={(guest as any)?.paymentStatus ?? "PENDING"}
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
            <p className="c3d-lead">La confirmación de asistencia está cerrada por el momento.</p>
          )}
        </section>

        <div id="album" data-pan="1" data-screen-label="Álbum" className="c3d-pan">
          <div className="c3d-pan-sticky">
            <div data-strip="1" className="c3d-strip">
              {photoPages.map((page, pageIndex) => (
                <div key={pageIndex} data-tone="light" className="c3d-panel c3d-panel--gap" style={{ background: ALBUM_TONES[pageIndex % ALBUM_TONES.length], color: "#14141B" }}>
                  <div className="c3d-hair-bg" />
                  <div className="c3d-panel-top">
                    <span>{kn(5)} — ARCHIVO / {String(allPhotos.length).padStart(3, "0")}</span><span>HOJA {String(pageIndex + 1).padStart(2, "0")} / {String(photoPages.length).padStart(2, "0")}</span>
                  </div>
                  {pageIndex === 0 && <h2 className="c3d-panel-title-md">Álbum <span className="c3d-accent-italic-lavender">de fotos</span></h2>}
                  <div className="c3d-mosaic">
                    {page.length > 0 ? page.map((url, i) => (
                      <div
                        key={i}
                        className={`c3d-mosaic-cell${i === 0 ? " c3d-mosaic-cell--featured" : ""}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => setExpandedPhoto(url)}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setExpandedPhoto(url); }}
                        aria-label={`Ampliar foto ${i + 1}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" className="c3d-mosaic-img" />
                      </div>
                    )) : (
                      <span className="c3d-photo-placeholder">Sin fotos todavía</span>
                    )}
                  </div>
                  <div className="c3d-seguir c3d-seguir--split">
                    <span>{allPhotos.length} FOTOS SUBIDAS</span>
                    <span className="c3d-accent-lavender">SEGUÍ →</span>
                  </div>
                </div>
              ))}

              <div data-tone="light" className="c3d-panel c3d-panel--gap" style={{ background: "#EDE8DE", color: "#14141B" }}>
                <span className="c3d-panel-top" style={{ display: "block" }}>HOJA {String(photoPages.length + 1).padStart(2, "0")} — EN VIVO</span>
                <h2 className="c3d-panel-title">Todo lo que<br /><span className="c3d-accent-italic-lavender">vamos a recordar</span></h2>
                <div className="c3d-album-embed">
                  {livePhotos.length > 0 ? (
                    <LiveAlbumStrip photos={livePhotos} tone="light" accentColor="#C7D2D6" />
                  ) : (
                    <div className="c3d-live-placeholder">
                      <span className="c3d-mini-label">
                        {eventHasStarted
                          ? "Todavía no se subió nada en vivo."
                          : "Esta sección se activa el día de la fiesta -- ahí vas a poder ver todo lo que subamos en vivo."}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <C3dDots count={photoPages.length + 1} />
          </div>
        </div>

        {sugerenciaMusicaHabilitada && (
          <section id="music" data-tone="dark" data-screen-label="Música" className="c3d-section" style={{ background: "#0B1512" }}>
            <span data-xin="1" data-dist="-60" className="c3d-kicker">{kn(6)} — SUGERENCIA DE MÚSICA</span>
            <h2 data-xin="1" data-delay="80" data-dist="140" className="c3d-h2">¿Qué tema<br /><span className="c3d-accent-italic-lavender">te hace bailar?</span></h2>
            <div data-xin="1" data-delay="160" data-dist="-80" className="c3d-eq">
              {[0, 0.18, 0.36, 0.54, 0.72].map((delay, i) => (
                <span key={i} className="c3d-eq-bar" style={{ animationDelay: `${delay}s`, background: i === 2 ? "#EAF6F0" : "#6FCB9F" }} />
              ))}
            </div>
            <div data-xin="1" data-delay="240" data-dist="110" className="c3d-song-wrap">
              <C3dSongSuggestion
                invitationId={String(invitation.id ?? "")}
                guestToken={guest?.uniqueToken}
                guestName={guestName || "Invitado"}
              />
            </div>
          </section>
        )}

        {showBankSection && (
          <section id="banco" data-tone="dark" data-screen-label="Regalos" className="c3d-section" style={{ background: "#0B1512" }}>
            <span data-xin="1" data-dist="-60" className="c3d-kicker">{sugerenciaMusicaHabilitada ? kn(7) : kn(6)} — REGALOS Y PAGOS</span>
            <h2 data-xin="1" data-delay="80" data-dist="140" className="c3d-h2">
              Si querés<br /><span className="c3d-accent-italic-cyan">sumarte</span>
            </h2>
            <div data-xin="1" data-delay="160" data-dist="-80" className="c3d-bank-wrap">
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
                  accentColor="#6FCB9F"
                  cardBg="rgba(20,20,27,0.72)"
                  cardBorder="#2A2417"
                  textPrimary="#F4F1EA"
                  textSecondary="#A8A292"
                  InfoRow={C3dInfoRow}
                  CopyField={C3dCopyField}
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
                  accentColor="#6FCB9F"
                  cardBg="rgba(20,20,27,0.72)"
                  cardBorder="#2A2417"
                  textPrimary="#F4F1EA"
                  textSecondary="#A8A292"
                  InfoRow={C3dInfoRow}
                  CopyField={C3dCopyField}
                />
              )}
            </div>
          </section>
        )}

        {quizEnabled && (
          <section id="quiz" data-tone="dark" data-screen-label="Quiz" className="c3d-section" style={{ background: "#0B1512" }}>
            <span data-xin="1" data-dist="-60" className="c3d-kicker">{knAcc([sugerenciaMusicaHabilitada, showBankSection].filter(Boolean).length + 6)} — EL JUEGO</span>
            <h2 data-xin="1" data-delay="80" data-dist="140" className="c3d-h2" style={{ fontSize: "clamp(28px, 6vw, 44px)" }}>
              {triviaTitulo}
            </h2>
            <div data-xin="1" data-delay="160" data-dist="-80">
              <C3dQuiz
                preguntas={triviaPreguntas}
                invitationId={String(invitation.id ?? "")}
                guestToken={guest?.uniqueToken}
                guestName={guestName || "Invitado"}
              />
            </div>
          </section>
        )}

        <section data-tone="dark" data-screen-label="Tu pase" className="c3d-section c3d-section--between" style={{ padding: "96px max(30px, calc((100% - 560px) / 2)) 48px max(24px, calc((100% - 560px) / 2))", background: "radial-gradient(120% 70% at 50% 100%, #142019 0%, #0B1512 55%, #070F0D 100%)" }}>
          <span data-xin="1" data-dist="-60" className="c3d-kicker">{knAcc([sugerenciaMusicaHabilitada, showBankSection, quizEnabled].filter(Boolean).length + 6)} — GUARDÁ TU PASE</span>
          <div data-xin="1" data-delay="100" data-dist="130" className="c3d-final-card">
            <div className="c3d-medallion c3d-medallion--final">
              <C3dMedallion
                ringGradient="conic-gradient(from 140deg, #C7D2D6, #6FCB9F, #6FCB9F, #EAF6F0, #C7D2D6)"
                sub={confirmed ? "CONFIRMADO" : "PENDIENTE"}
                subAccent="cyan"
                arcId="c3dArc3"
                arcText={`${namesTitle.toUpperCase()} · ${fechaCorta} · `}
              />
            </div>
            <span className="c3d-mini-label c3d-accent-cyan">PASE Nº {passNumber} · ADMIT {guestAdults + guestTeens + guestChildren || 1}</span>
            <span className="c3d-final-names">{namesTitle}</span>
            <span className="c3d-mini-label" style={{ color: "#A8A292" }}>{fechaCorta} — {hora} H</span>
            <div className="c3d-barcode" style={{ width: "60%", height: 26, opacity: 0.6 }} />
          </div>
          <div className="c3d-final-footer">
            <span>NO TRANSFERIBLE</span>
            <span className="c3d-replay" onClick={reset}>VER LA APERTURA OTRA VEZ ↺</span>
          </div>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <InfoAdicionalSection invitation={invitation as any} />
          <div className="c3d-footer-credit">
            <LogoFooterCredit bgColor="transparent" />
          </div>
        </section>
      </div>

      <div ref={railRef} className="c3d-rail">
        <span ref={railTopRef} className="c3d-rail-top">PASE Nº {passNumber}</span>
        <div ref={railLineRef} className="c3d-rail-line">
          <span ref={railBarRef} className="c3d-rail-bar" />
        </div>
        <span ref={railLabelRef} className="c3d-rail-label">SAVE THE DATE</span>
      </div>

      <div ref={coverRef} className="c3d-cover">
        <div ref={topRef} className="c3d-cover-half c3d-cover-half--top">
          <C3dCoverHalf
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
            <div className="c3d-cover-cta">ABRIR INVITACIÓN</div>
          </C3dCoverHalf>
        </div>
        <div ref={bottomRef} className="c3d-cover-half c3d-cover-half--bottom">
          <C3dCoverHalf
            kickerText={coverKickerText}
            namesTitle={coverNamesTitle}
            fechaCorta={fechaCorta}
            passNumber={passNumber}
            dressCode={dressCode}
            hora={hora}
            photoMobile={photoMobile}
            photoDesktop={photoDesktop}
          >
            <button onClick={open} className="c3d-cover-cta c3d-cover-cta--btn">ABRIR INVITACIÓN</button>
          </C3dCoverHalf>
        </div>
      </div>

      <div ref={hintRef} className="c3d-hint">DESLIZÁ ↓</div>

      {expandedPhoto && (
        <div
          className="c3d-lightbox"
          onClick={() => setExpandedPhoto(null)}
          onContextMenu={(e) => e.preventDefault()}
        >
          <button
            type="button"
            className="c3d-lightbox-close"
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
            className="c3d-lightbox-img"
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

function C3dCdBox({ refEl, delay, dist, label }: { refEl: React.RefObject<HTMLSpanElement | null>; delay: number; dist: number; label: string }) {
  return (
    <div data-xin="1" data-delay={delay} data-dist={dist} className="c3d-cd-box">
      <span ref={refEl} className="c3d-cd-num">—</span>
      <span className="c3d-cd-label">{label}</span>
    </div>
  );
}

function C3dDots({ count = 3 }: { count?: number }) {
  return (
    <div data-dots="1" className="c3d-dots">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} data-dot={i} className="c3d-dot" />
      ))}
    </div>
  );
}

// Medallón facetado tipo gema (solo la portada de "Guardá la fecha") -- ver
// [data-facet] en el mockup original: un pentágono recortado con clip-path
// que gira suavemente en 3D (rotate3d), con el número "15" centrado y un
// anillo de texto girando en sentido contrario alrededor.
function C3dFacetGem({ arcId, arcText }: { arcId: string; arcText: string }) {
  return (
    <>
      <div className="c3d-facet-gem" />
      <div className="c3d-facet-core">
        <span className="c3d-facet-num">15</span>
        <span className="c3d-facet-sub">ACCESO</span>
      </div>
      <svg viewBox="0 0 100 100" className="c3d-facet-arc">
        <defs><path id={arcId} d="M50 50 m -38 0 a 38 38 0 1 1 76 0 a 38 38 0 1 1 -76 0" fill="none" /></defs>
        <text className="c3d-medallion-arc-text">
          <textPath href={`#${arcId}`}>{arcText}{arcText}</textPath>
        </text>
      </svg>
    </>
  );
}

// Medallón circular con el "15" en el centro (en vez de una etiqueta de
// sector/mesa inventada -- ver [data-tiara]-equivalente en el mockup
// original, que mostraba un asiento ficticio). Reutilizado en el panel de
// ubicación, el talón de check-in y el pase final.
function C3dMedallion({
  ringGradient,
  topLabel,
  sub,
  subAccent,
  arcId,
  arcText,
  compact,
}: {
  ringGradient: string;
  topLabel?: string;
  sub: string;
  subAccent?: "cyan" | "lavender";
  arcId: string;
  arcText: string;
  compact?: boolean;
}) {
  // Duración fija por instancia (no en cada render) -- Math.random() directo
  // en el render viola la regla de pureza de React.
  const [ringDuration] = useState(() => 18 + Math.random() * 4);
  return (
    <>
      <div className="c3d-medallion-ring" style={{ background: ringGradient, animation: `gpRing ${ringDuration}s linear infinite` }} />
      <div className="c3d-medallion-core">
        {topLabel && <span className="c3d-medallion-sub">{topLabel}</span>}
        <span className={compact ? "c3d-medallion-num-sm" : "c3d-medallion-num"}>15</span>
        {sub && (
          <span className={`c3d-medallion-sub ${subAccent === "lavender" ? "c3d-medallion-sub--lavender" : "c3d-medallion-sub--cyan"}`}>
            {sub}
          </span>
        )}
      </div>
      {arcId && (
        <svg viewBox="0 0 100 100" className="c3d-medallion-arc" style={{ animation: "gpRingRev 32s linear infinite" }}>
          <defs>
            <path id={arcId} d="M50 50 m -38 0 a 38 38 0 1 1 76 0 a 38 38 0 1 1 -76 0" fill="none" />
          </defs>
          <text className="c3d-medallion-arc-text">
            <textPath href={`#${arcId}`}>{arcText}{arcText}</textPath>
          </text>
        </svg>
      )}
    </>
  );
}

function C3dCopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div className="c3d-bank-row">
      <div style={{ minWidth: 0, flex: 1 }}>
        <span className="c3d-bank-row-label">{label}</span>
        <span className="c3d-bank-row-value">{value}</span>
      </div>
      <button type="button" className="c3d-bank-copy" onClick={handle}>
        {copied ? "✓ Copiado" : "Copiar"}
      </button>
    </div>
  );
}

// Reimplementación propia del RSVP: filas de datos + el ticket/sello ya
// existente en la plantilla. Habla con el mismo endpoint/payload que
// <RSVPWizardV2> (/api/guests/[token]/confirm o /api/rsvp), así que no
// cambia ningún dato que pida el backend, solo cómo se ve.
function C3dRsvpCard({
  invitationId,
  guestToken,
  guestName,
  maxAdults,
  maxTeens,
  maxChildren,
  hasPayment,
  paymentAmount,
  isExempt,
  paymentStatus,
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
  paymentStatus?: string;
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
      <div className="c3d-rsvp-declined">
        <p className="c3d-rsvp-declined-text">Gracias por avisarnos. Si cambiás de idea, este mismo acceso sigue activo.</p>
        <button type="button" className="c3d-rsvp-btn c3d-rsvp-btn--ghost" onClick={() => setStatus("PENDING")}>
          CAMBIÉ DE IDEA
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="c3d-rsvp-rows">
        <div className="c3d-rsvp-row">
          <span>{totalGuests > 1 ? "RESERVADO PARA" : "NOMBRE Y APELLIDO"}</span>
          <span>{guestName || "—"}</span>
        </div>

        {totalGuests > 1 && status !== "CONFIRMED" && (
          <div className="c3d-rsvp-row">
            <span>ADULTOS</span>
            <div className="c3d-rsvp-stepper">
              <button type="button" onClick={() => setAdultCount((v) => Math.max(1, v - 1))} disabled={adultCount <= 1}>−</button>
              <span>{String(adultCount).padStart(2, "0")}</span>
              <button type="button" onClick={() => setAdultCount((v) => Math.min(maxAdults, v + 1))} disabled={adultCount >= maxAdults}>+</button>
            </div>
          </div>
        )}
        {maxTeens > 0 && status !== "CONFIRMED" && (
          <div className="c3d-rsvp-row">
            <span>ADOLESCENTES</span>
            <div className="c3d-rsvp-stepper">
              <button type="button" onClick={() => setTeenCount((v) => Math.max(0, v - 1))} disabled={teenCount <= 0}>−</button>
              <span>{String(teenCount).padStart(2, "0")}</span>
              <button type="button" onClick={() => setTeenCount((v) => Math.min(maxTeens, v + 1))} disabled={teenCount >= maxTeens}>+</button>
            </div>
          </div>
        )}
        {maxChildren > 0 && status !== "CONFIRMED" && (
          <div className="c3d-rsvp-row">
            <span>NIÑOS</span>
            <div className="c3d-rsvp-stepper">
              <button type="button" onClick={() => setChildCount((v) => Math.max(0, v - 1))} disabled={childCount <= 0}>−</button>
              <span>{String(childCount).padStart(2, "0")}</span>
              <button type="button" onClick={() => setChildCount((v) => Math.min(maxChildren, v + 1))} disabled={childCount >= maxChildren}>+</button>
            </div>
          </div>
        )}
        {status === "CONFIRMED" && (
          <>
            {totalGuests > 1 && adultCount > 0 && <div className="c3d-rsvp-row"><span>ADULTOS</span><span>{String(adultCount).padStart(2, "0")}</span></div>}
            {teenCount > 0 && <div className="c3d-rsvp-row"><span>ADOLESCENTES</span><span>{String(teenCount).padStart(2, "0")}</span></div>}
            {childCount > 0 && <div className="c3d-rsvp-row"><span>NIÑOS</span><span>{String(childCount).padStart(2, "0")}</span></div>}
          </>
        )}

        {status !== "CONFIRMED" ? (
          <div className="c3d-rsvp-row">
            <span>RESTRICCIÓN ALIMENTARIA</span>
            <input
              value={dietary}
              onChange={(e) => setDietary(e.target.value)}
              placeholder="—"
              className="c3d-rsvp-input"
            />
          </div>
        ) : (
          <div className="c3d-rsvp-row">
            <span>RESTRICCIÓN ALIMENTARIA</span>
            <span>{guestRestrictions || dietary || "—"}</span>
          </div>
        )}

        {hasPayment && paymentAmount != null && !isExempt && (
          <div className="c3d-rsvp-row c3d-rsvp-row--payment">
            <span>{paymentStatus === "PAID" ? "ABONADO" : "VALOR"}</span>
            <div className="c3d-rsvp-payment-value">
              <span className="c3d-rsvp-payment-total">{formatARS(totalPayment)}</span>
              {paymentStatus === "PARTIAL" && (
                <div className="c3d-rsvp-payment-detail"><span>Pago parcial registrado</span></div>
              )}
              {(adultCount > 0 || teenCount > 0 || childCount > 0) && (
                <div className="c3d-rsvp-payment-detail">
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

      <div ref={stubRef} className="c3d-stub">
        <div className="c3d-stub-top">
          <span>PASE Nº {passNumber}</span>
          <span ref={statusRef} className="c3d-stub-status">
            {confirmed ? "ACCESO CONFIRMADO" : "PENDIENTE"}
          </span>
        </div>
        <div ref={sealRef} className="c3d-seal">
          <C3dMedallion ringGradient="conic-gradient(from 0deg, #C7D2D6, #6FCB9F, #EAF6F0, #C7D2D6)" sub="" arcId="" arcText="" compact />
        </div>
        <div ref={beamRef} className="c3d-beam" />
        <div className="c3d-barcode" style={{ width: "70%", opacity: confirmed ? 0.7 : 0.2 }} />
      </div>

      {error && <p className="c3d-rsvp-error">{error}</p>}

      {status !== "CONFIRMED" ? (
        <>
          <button type="button" className="c3d-rsvp-btn" disabled={isSubmitting} onClick={() => submit("CONFIRMA")}>
            {isSubmitting ? "GUARDANDO…" : "CONFIRMAR ASISTENCIA"}
          </button>
          <button type="button" className="c3d-rsvp-btn c3d-rsvp-btn--ghost" disabled={isSubmitting} onClick={() => submit("NO_ASISTE")}>
            NO VOY A PODER ASISTIR
          </button>
        </>
      ) : (
        <button type="button" className="c3d-rsvp-btn c3d-rsvp-btn--ghost" onClick={() => setStatus("PENDING")}>
          MODIFICAR ASISTENCIA
        </button>
      )}
    </>
  );
}

interface C3dSongItem {
  id: string;
  title: string;
  artist: string;
  guestName: string;
}

// Misma API que <SongSuggestion> (/api/songs), look propio de la plantilla.
function C3dSongSuggestion({ invitationId, guestToken, guestName }: { invitationId: string; guestToken?: string; guestName: string }) {
  const [songs, setSongs] = useState<C3dSongItem[]>([]);
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
    <div className="c3d-song">
      <form onSubmit={handleSubmit} className="c3d-song-row">
        <div className="c3d-song-inputs">
          <input value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="ARTISTA" maxLength={80} className="c3d-song-input" />
          <span className="c3d-song-sep">—</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="TEMA" maxLength={100} className="c3d-song-input" />
        </div>
        <button type="submit" disabled={isSubmitting} className="c3d-song-submit">+ {isSubmitting ? "..." : "SUMAR"}</button>
      </form>
      {error && <p className="c3d-song-error">{error}</p>}
      {songs.length > 0 && (
        <div className="c3d-song-list">
          {songs.slice(0, 12).map((s, i) => (
            <div key={s.id} className="c3d-song-item">
              <span className="c3d-song-item-title">{String(i + 1).padStart(2, "0")} · {s.artist} — {s.title}</span>
              <span className="c3d-song-item-by">Sumado por {s.guestName || "Invitado"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Todas las preguntas se muestran juntas en la misma página -- misma API
// /api/quiz que usa el resto de las plantillas.
function C3dQuiz({ preguntas, invitationId, guestToken, guestName }: { preguntas: C3dQuizQuestion[]; invitationId: string; guestToken?: string; guestName?: string }) {
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
    <div className="c3d-quiz">
      {preguntas.map((q, qi) => {
        const correctIdx = q.respuestaCorrecta ?? q.correcta;
        return (
          <div key={qi} className="c3d-quiz-q">
            <span className="c3d-quiz-q-num">{String(qi + 1).padStart(2, "0")}</span>
            <p className="c3d-quiz-q-text">{q.pregunta}</p>
            <div className="c3d-quiz-opts">
              {q.opciones.map((opt, oi) => {
                const chosen = picks[qi] === oi;
                const revealed = picks[qi] !== undefined && correctIdx !== undefined;
                let stateClass = "";
                if (revealed) {
                  if (oi === correctIdx) stateClass = " c3d-quiz-opt--correct";
                  else if (chosen) stateClass = " c3d-quiz-opt--wrong";
                } else if (chosen) {
                  stateClass = " c3d-quiz-opt--picked";
                }
                return (
                  <button
                    key={oi}
                    type="button"
                    className={`c3d-quiz-opt${stateClass}`}
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
        <div className="c3d-quiz-result">
          <p className="c3d-quiz-result-score">
            {isSaving ? "GUARDANDO…" : `RESPONDISTE ${score} DE ${preguntas.length} CORRECTAMENTE`}
          </p>
          {!isSaving && stats && stats.count > 0 && (
            <p className="c3d-quiz-result-stat">
              El promedio del resto de los invitados ({stats.count}) es del {stats.avg}%.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function C3dInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="c3d-bank-row">
      <div style={{ minWidth: 0, flex: 1 }}>
        <span className="c3d-bank-row-label">{label}</span>
        <span className="c3d-bank-row-value">{value}</span>
      </div>
    </div>
  );
}

function C3dCoverHalf({
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
    <div className="c3d-cover-inner">
      {photoMobile && (
        <div className="acp-mobile-only">
          <AnimatedCoverPhoto photoSrc={photoMobile} tint tintColor1="#6FCB9F" tintColor2="#080B10" effect="enfoque" scrimColorRgb="7,15,13" />
        </div>
      )}
      {photoDesktop && (
        <div className="acp-desktop-only">
          <AnimatedCoverPhoto photoSrc={photoDesktop} tint tintColor1="#6FCB9F" tintColor2="#080B10" effect="enfoque" scrimColorRgb="7,15,13" />
        </div>
      )}
      <div className="c3d-cover-glow" />
      <div className="c3d-cover-facets" />
      <div className="c3d-cover-content">
        <div className="c3d-cover-top-row">
          <span>PASE Nº {passNumber}</span><span className="c3d-accent-cyan">ADMIT ONE</span>
        </div>
        <div className="c3d-cover-center">
          <span ref={kickerRef} className="c3d-cover-kicker">{kickerText}</span>
          <h1 ref={namesRef} className="c3d-cover-names">{namesTitle}</h1>
          <span className="c3d-cover-rule" />
          <span className="c3d-cover-date">{fechaCorta}</span>
        </div>
        <div className="c3d-cover-bottom">
          <div ref={perfRef} className="c3d-perf-strip c3d-perf-strip--reveal c3d-perf-strip--cover" />
          <div className="c3d-cover-facts">
            {dressCode && <span>{dressCode.toUpperCase()}</span>}
            <span>{hora} H</span>
          </div>
          {children}
          <div className="c3d-barcode-wrap">
            <div className="c3d-barcode" style={{ width: "62%", height: "clamp(15px, 3vh, 26px)", opacity: 0.6 }} />
            <span className="c3d-mini-label c3d-mini-label--cover" style={{ color: "#56534A" }}>NO TRANSFERIBLE</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Hoja de estilos (traslada 1:1 los tokens visuales del diseño aprobado)
// ---------------------------------------------------------------------
const C3D_CSS = `
  .c3d-scroller { position: absolute; inset: 0; overflow-y: auto; overflow-x: hidden; opacity: 0; transition: opacity 900ms ease 260ms; scrollbar-width: none; }
  .c3d-scroller::-webkit-scrollbar { width: 0; height: 0; }

  a { color: #C7D2D6; text-decoration: none; }
  a:hover { color: #EAF6F0; }

  @keyframes gpFoil { to { transform: rotate(360deg); } }
  @keyframes gpRing { to { transform: rotate(360deg); } }
  @keyframes gpRingRev { to { transform: rotate(-360deg); } }
  @keyframes gpScan { 0% { transform: translateY(0); opacity: 0; } 12% { opacity: .85; } 88% { opacity: .85; } 100% { transform: translateY(320px); opacity: 0; } }
  @keyframes gpEq { 0%,100% { transform: scaleY(.25); } 50% { transform: scaleY(1); } }
  @keyframes gpHint { 0%,100% { transform: translateY(0); } 50% { transform: translateY(7px); } }
  @keyframes gpSide { 0%,100% { transform: translateX(0); } 50% { transform: translateX(7px); } }
  @keyframes facetSpin { 0%,100% { transform: rotate3d(1,1,0,0deg); } 50% { transform: rotate3d(1,1,0,10deg); } }
  @media (prefers-reduced-motion: reduce) { .c3d-scroller * { animation: none !important; } }

  .c3d-section { min-height: calc(var(--vh, 1vh) * 100); position: relative; display: flex; flex-direction: column; justify-content: center; gap: 30px; padding: 96px max(30px, calc((100% - 560px) / 2)) 110px max(24px, calc((100% - 560px) / 2)); overflow: hidden; }
  .c3d-section--between { justify-content: space-between; }

  .c3d-kicker { font-size: 9.5px; letter-spacing: 0.34em; color: #8A8577; }

  .c3d-hero-photo-section { position: relative; min-height: calc(var(--vh, 1vh) * 100); overflow: hidden; }
  .c3d-hero-photo-frame { position: absolute; inset: 0; overflow: hidden; }
  @media (min-width: 768px) { .c3d-hero-photo-frame { inset: 64px max(24px, calc((100% - 900px) / 2)); border: 1px solid rgba(111,203,159,.3); } }
  .c3d-hero-photo-kicker { position: absolute; left: max(30px, calc((100% - 560px) / 2)); bottom: 40px; z-index: 2; }

  .c3d-date-stack { display: flex; flex-direction: column; gap: 2px; }
  .c3d-date-num { font-family: var(--c3d-poppins), sans-serif; font-size: clamp(66px, 23vw, 140px); line-height: 0.82; letter-spacing: -0.04em; }
  .c3d-date-num--right { text-align: right; line-height: 0.86; }
  .c3d-date-month { font-family: var(--c3d-poppins), sans-serif; font-style: italic; font-size: clamp(50px, 18vw, 104px); line-height: 0.9; color: #6FCB9F; padding-left: 12%; }

  .c3d-divider { display: flex; align-items: center; gap: 16px; font-size: 10px; letter-spacing: 0.26em; color: #8A8577; }
  .c3d-divider-line { width: 52px; height: 1px; background: #6FCB9F; display: inline-block; }
  .c3d-divider-line--long { width: 64px; }

  .c3d-lead { margin: 0; font-family: var(--c3d-poppins), sans-serif; font-style: italic; font-size: 20px; line-height: 1.4; color: #A8A292; max-width: 330px; }
  .c3d-cal-link { display: inline-flex; align-items: center; gap: 7px; margin-top: 4px; font-family: var(--c3d-mono), monospace; font-size: 10px; letter-spacing: 0.24em; text-transform: uppercase; color: #8A8577; text-decoration: none; transition: color 200ms ease; }
  .c3d-cal-link:hover { color: #6FCB9F; }

  .c3d-medallion { position: relative; }
  .c3d-medallion--corner { position: absolute; right: max(32px, calc((100% - 560px) / 2)); top: 12%; width: clamp(86px, 22vw, 116px); aspect-ratio: 1; perspective: 600px; }
  .c3d-medallion--lg { width: clamp(130px, 34vw, 178px); aspect-ratio: 1; margin: 0 auto; }
  .c3d-medallion--final { width: clamp(104px, 26vw, 132px); aspect-ratio: 1; margin: -12px auto 0; }
  .c3d-medallion-ring { position: absolute; inset: 0; border-radius: 50%; filter: saturate(.85); }
  .c3d-medallion-core { position: absolute; inset: 3px; border-radius: 50%; background: #0C0C11; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; text-align: center; padding: 6px; }
  .c3d-medallion-num { font-family: var(--c3d-poppins), sans-serif; font-size: 30px; line-height: 1; color: #EAF6F0; }
  .c3d-medallion-num-sm { font-family: var(--c3d-poppins), sans-serif; font-size: 16px; line-height: 1; color: #EAF6F0; }
  .c3d-medallion-sub { font-size: 6.5px; letter-spacing: 0.24em; color: #8A8577; }
  .c3d-medallion-sub--cyan { color: #6FCB9F; }
  .c3d-medallion-sub--lavender { color: #C7D2D6; }
  .c3d-medallion-arc { position: absolute; inset: -14%; }
  .c3d-medallion-arc-text { font-size: 7px; letter-spacing: 1.6px; fill: #6FCB9F; font-family: var(--c3d-mono), monospace; }

  .c3d-facet-gem { position: absolute; inset: 0; clip-path: polygon(50% 0%, 95% 30%, 80% 90%, 20% 90%, 5% 30%); background: linear-gradient(135deg, #6FCB9F, #C7D2D6 55%, #EAF6F0); filter: saturate(.9); animation: facetSpin 6s ease-in-out infinite; }
  .c3d-facet-core { position: absolute; inset: 3px; border-radius: 50%; background: #0C0C11; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; }
  .c3d-facet-num { font-family: var(--c3d-poppins), sans-serif; font-size: 26px; line-height: 1; color: #EAF6F0; }
  .c3d-facet-sub { font-size: 6.5px; letter-spacing: 0.24em; color: #8A8577; }
  .c3d-facet-arc { position: absolute; inset: -14%; animation: gpRingRev 34s linear infinite; }

  .c3d-scan-grid { position: absolute; inset: 0; background: repeating-linear-gradient(0deg, rgba(200,164,92,0.06) 0 1px, transparent 1px 5px); pointer-events: none; }
  .c3d-scanline { position: absolute; left: 0; right: 0; top: 30%; height: 2px; background: linear-gradient(90deg, transparent, #EAF6F0, transparent); animation: gpScan 6s linear infinite; pointer-events: none; }

  .c3d-cd-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; position: relative; }
  .c3d-cd-box { border: 1px solid #2A2417; background: rgba(20,20,27,0.72); padding: 18px 15px; display: flex; flex-direction: column; gap: 6px; overflow: hidden; }
  .c3d-cd-num { font-family: var(--c3d-poppins), sans-serif; font-size: clamp(48px, 14vw, 80px); line-height: 0.82; color: #F6EFDD; display: inline-block; }
  .c3d-cd-label { font-size: 9px; letter-spacing: 0.3em; color: #6FCB9F; }
  .c3d-perf-strip { height: 12px; position: relative; background: radial-gradient(circle at 6px 50%, #070F0D 3.4px, transparent 3.8px) 0 0/12px 12px repeat-x; opacity: .85; }
  .c3d-perf-strip--reveal { clip-path: inset(0 100% 0 0); transition: clip-path 900ms cubic-bezier(.16,1,.3,1) 500ms; }
  .c3d-perf-strip--cover { opacity: .9; }

  .c3d-glow-blob { position: absolute; right: -26%; top: 4%; width: 82vw; max-width: 540px; aspect-ratio: 1; border-radius: 50%; background: conic-gradient(from 200deg, rgba(199,210,214,0.32), rgba(111,203,159,0.26), rgba(111,203,159,0.36), rgba(199,210,214,0.32)); filter: blur(80px); opacity: .4; animation: gpFoil 30s linear infinite; }
  .c3d-phrase { margin: 0; position: relative; font-family: var(--c3d-poppins), sans-serif; font-weight: 400; font-size: clamp(50px, 15vw, 96px); line-height: 0.92; letter-spacing: -0.03em; }
  .c3d-accent-italic-cyan { font-style: italic; color: #6FCB9F; }
  .c3d-accent-italic-lavender { font-style: italic; color: #C7D2D6; }
  .c3d-accent-cyan { color: #6FCB9F; }
  .c3d-accent-lavender { color: #C7D2D6; }
  .c3d-h2 { margin: 0; font-family: var(--c3d-poppins), sans-serif; font-weight: 400; font-size: clamp(40px, 12vw, 68px); line-height: 0.96; }

  .c3d-pan { height: 260vh; position: relative; }
  .c3d-pan-sticky { position: sticky; top: 0; height: calc(var(--vh, 1vh) * 100); overflow: hidden; }
  .c3d-strip { position: absolute; top: 0; left: 0; height: 100%; display: flex; width: 300vw; will-change: transform; }
  .c3d-panel { flex: 0 0 100vw; min-width: 0; height: 100%; box-sizing: border-box; position: relative; overflow: hidden; display: flex; flex-direction: column; padding: 84px max(24px, calc((100vw - 560px) / 2)) 100px; gap: 22px; }
  .c3d-panel--between { justify-content: space-between; }
  .c3d-panel--end { justify-content: flex-end; }
  .c3d-panel--center { align-items: center; justify-content: center; text-align: center; }
  .c3d-panel--gap { gap: clamp(14px, 2.4vh, 22px); padding: clamp(52px, 9vh, 84px) max(24px, calc((100vw - 600px) / 2)) clamp(62px, 11vh, 100px); }
  .c3d-hair-bg { position: absolute; inset: 0; background: repeating-linear-gradient(90deg, rgba(20,20,27,0.05) 0 1px, transparent 1px 26px); pointer-events: none; }
  .c3d-panel-top { position: relative; display: flex; justify-content: space-between; font-size: 9.5px; letter-spacing: 0.32em; color: #7C7768; }
  .c3d-panel-title { margin: 0; position: relative; font-family: var(--c3d-poppins), sans-serif; font-weight: 400; font-size: clamp(46px, 13.5vw, 76px); line-height: 0.92; }
  .c3d-panel-title-md { margin: 0; position: relative; font-family: var(--c3d-poppins), sans-serif; font-weight: 400; font-size: clamp(42px, 12.5vw, 64px); line-height: 0.94; }
  .c3d-panel-title-sm { margin: 0; font-family: var(--c3d-poppins), sans-serif; font-size: clamp(34px, 10vw, 52px); line-height: 1; }
  .c3d-panel-block { position: relative; display: flex; flex-direction: column; gap: 12px; }
  .c3d-mini-label { font-size: 9px; letter-spacing: 0.26em; color: #7C7768; }
  .c3d-mini-label--cover { font-size: 8.5px; letter-spacing: 0.3em; }
  .c3d-facts { position: relative; display: flex; flex-direction: column; gap: 12px; font-size: 11px; letter-spacing: 0.14em; color: #4A473F; }
  .c3d-facts-row { display: flex; justify-content: space-between; border-bottom: 1px solid #D6D1C4; padding-bottom: 10px; }
  .c3d-facts-row--last { border-bottom: none; padding-bottom: 0; }
  .c3d-seguir { position: relative; display: flex; align-items: center; gap: 10px; font-size: 9px; letter-spacing: 0.26em; color: #C7D2D6; margin-top: auto; }
  .c3d-seguir--split { justify-content: space-between; }
  .c3d-side-hint { display: inline-block; animation: gpSide 2.2s ease-in-out infinite; }
  .c3d-route-svg { position: absolute; inset: 0; width: 100%; height: 100%; }
  .c3d-link-cta { font-size: 10px; letter-spacing: 0.24em; color: #C7D2D6; }

  .c3d-crono { position: relative; display: flex; flex-direction: column; gap: 8px; margin-top: 4px; }
  .c3d-crono-row { display: flex; align-items: baseline; gap: 14px; font-size: 11px; letter-spacing: 0.1em; color: #4A473F; border-bottom: 1px solid #D6D1C4; padding-bottom: 8px; }
  .c3d-crono-time { font-family: var(--c3d-mono), monospace; color: #4F7A6E; min-width: 42px; }
  .c3d-crono-title { flex: 1; }

  .c3d-dots { position: absolute; left: 0; right: 34px; bottom: 26px; display: flex; gap: 6px; justify-content: center; z-index: 2; }
  .c3d-dot { width: 22px; height: 2px; background: rgba(20,20,27,0.18); transition: background 400ms ease; display: inline-block; }

  .c3d-stub { position: relative; overflow: hidden; border: 1px solid #2A2417; background: rgba(20,20,27,0.7); padding: 20px; display: flex; flex-direction: column; gap: 16px; transition: border-color 600ms ease, box-shadow 600ms ease; }
  .c3d-stub-top { display: flex; justify-content: space-between; font-size: 9px; letter-spacing: 0.24em; color: #8A8577; }
  .c3d-stub-status { color: #6E6A5D; transition: color 400ms ease; }
  .c3d-seal { width: 62px; aspect-ratio: 1; position: relative; opacity: .25; transform: scale(.86); transition: opacity 700ms ease, transform 700ms cubic-bezier(.16,1,.3,1); align-self: center; }
  .c3d-beam { position: absolute; left: 0; right: 0; top: 0; height: 2px; background: linear-gradient(90deg, transparent, #EAF6F0, transparent); opacity: 0; transition: transform 900ms cubic-bezier(.16,1,.3,1), opacity 300ms ease; }

  .c3d-rsvp { display: flex; flex-direction: column; gap: 22px; width: 100%; max-width: 420px; font-family: var(--c3d-mono), monospace; }
  .c3d-rsvp-rows { display: flex; flex-direction: column; }
  .c3d-rsvp-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 0; border-bottom: 1px solid rgba(111,203,159,0.18); font-size: 10.5px; letter-spacing: 0.18em; color: #8A8577; }
  .c3d-rsvp-row > span:first-child { flex-shrink: 0; }
  .c3d-rsvp-row > span:last-child { color: #F4F1EA; letter-spacing: 0.02em; text-align: right; }
  .c3d-rsvp-row--payment { align-items: flex-start; }
  .c3d-rsvp-payment-value { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
  .c3d-rsvp-payment-total { color: #EAF6F0; font-size: 13px; letter-spacing: 0.02em; font-weight: 600; }
  .c3d-rsvp-payment-detail { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; font-size: 9px; letter-spacing: 0.05em; color: #8A8577; }
  .c3d-rsvp-stepper { display: flex; align-items: center; gap: 12px; }
  .c3d-rsvp-stepper button { width: 26px; height: 26px; border-radius: 50%; border: 1px solid #6FCB9F; background: transparent; color: #6FCB9F; font-size: 14px; line-height: 1; cursor: pointer; }
  .c3d-rsvp-stepper button:disabled { opacity: 0.3; cursor: default; }
  .c3d-rsvp-stepper span { font-family: var(--c3d-mono), monospace; color: #F4F1EA; min-width: 20px; text-align: center; }
  .c3d-rsvp-input { background: transparent; border: none; border-bottom: 1px solid rgba(111,203,159,0.3); color: #F4F1EA; font-family: var(--c3d-mono), monospace; font-size: 11px; letter-spacing: 0.02em; padding: 4px 2px; text-align: right; max-width: 55%; }
  .c3d-rsvp-input::placeholder { color: #6E6A5D; }
  .c3d-rsvp-input:focus { outline: none; border-bottom-color: #6FCB9F; }
  .c3d-rsvp-btn { width: 100%; padding: 16px; font-family: var(--c3d-mono), monospace; font-size: 11px; font-weight: 600; letter-spacing: 0.22em; text-transform: uppercase; background: linear-gradient(180deg, #6FCB9F, #2E8F63); border: 1px solid #6FCB9F; color: #0B0B10; cursor: pointer; }
  .c3d-rsvp-btn:disabled { opacity: 0.6; cursor: default; }
  .c3d-rsvp-btn--ghost { background: transparent; color: #6FCB9F; }
  .c3d-rsvp-error { font-size: 10px; letter-spacing: 0.06em; color: #6FCB9F; margin: 0; }
  .c3d-rsvp-declined { display: flex; flex-direction: column; gap: 18px; align-items: center; text-align: center; max-width: 380px; }
  .c3d-rsvp-declined-text { margin: 0; font-family: var(--c3d-poppins), sans-serif; font-style: italic; font-size: 18px; line-height: 1.4; color: #A8A292; }

  .c3d-upload-wrap { flex: 1; min-height: 0; overflow-y: auto; }
  .c3d-album-embed { flex: 1; min-height: 0; overflow-y: auto; }
  .c3d-live-placeholder { flex: 1; display: flex; align-items: center; justify-content: center; text-align: center; padding: 24px; border: 1px dashed rgba(20,20,27,0.2); }
  .c3d-photo-placeholder { position: relative; font-size: 8.5px; letter-spacing: 0.16em; color: #6E6A5D; }

  .c3d-mosaic { position: relative; flex: 1; min-height: 0; display: grid; grid-template-columns: repeat(3, 1fr); grid-auto-rows: auto; grid-auto-flow: dense; align-content: start; gap: 10px; }
  .c3d-mosaic-cell--featured { grid-column: span 2; grid-row: span 2; cursor: pointer; }
  .c3d-mosaic-cell { position: relative; height: 0; padding-top: 100%; background: repeating-linear-gradient(135deg, #DCD7CB 0 6px, #E9E5DC 6px 12px); overflow: hidden; cursor: pointer; }
  .c3d-mosaic-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }

  .c3d-bank-wrap { position: relative; display: flex; flex-direction: column; gap: 14px; width: 100%; max-width: 420px; margin: 0; }
  .c3d-bank-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid rgba(111,203,159,0.18); }
  .c3d-bank-row:last-child { border-bottom: none; }
  .c3d-bank-row-label { display: block; font-size: 9px; letter-spacing: 0.2em; color: #8A8577; margin-bottom: 3px; }
  .c3d-bank-row-value { font-size: 12px; color: #F4F1EA; word-break: break-all; }
  .c3d-bank-copy { flex-shrink: 0; font-family: var(--c3d-mono), monospace; font-size: 10px; letter-spacing: 0.1em; padding: 7px 12px; border: 1px solid #6FCB9F; background: transparent; color: #6FCB9F; cursor: pointer; }
  .c3d-bank-copy:hover { background: rgba(111,203,159,0.12); }

  .c3d-eq { display: flex; align-items: flex-end; gap: 5px; height: 52px; }
  .c3d-eq-bar { width: 4px; height: 100%; transform-origin: bottom; animation: gpEq 1.1s ease-in-out infinite; display: inline-block; }
  .c3d-song-wrap { font-family: var(--c3d-mono), monospace; }

  .c3d-song { position: relative; width: 100%; max-width: 420px; margin: 0 auto; }
  .c3d-song-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; border-bottom: 1px solid rgba(111,203,159,0.3); padding-bottom: 12px; }
  .c3d-song-inputs { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; font-size: 10px; letter-spacing: 0.24em; color: #8A8577; text-transform: uppercase; }
  .c3d-song-input { background: transparent; border: none; border-bottom: 1px solid rgba(111,203,159,0.3); color: #F4F1EA; font-family: var(--c3d-mono), monospace; font-size: 12px; padding: 6px 2px; min-width: 0; flex: 1; }
  .c3d-song-input::placeholder { color: #6E6A5D; }
  .c3d-song-input:focus { outline: none; border-bottom-color: #6FCB9F; }
  .c3d-song-sep { color: #8A8577; flex-shrink: 0; }
  .c3d-song-submit { flex-shrink: 0; background: none; border: none; color: #6FCB9F; font-family: var(--c3d-mono), monospace; font-size: 10px; letter-spacing: 0.2em; cursor: pointer; }
  .c3d-song-submit:hover { color: #EAF6F0; }
  .c3d-song-submit:disabled { color: #6E6A5D; cursor: default; }
  .c3d-song-error { font-size: 10px; color: #6FCB9F; margin-top: 6px; }
  .c3d-song-list { display: flex; flex-direction: column; margin-top: 14px; max-height: 180px; overflow-y: auto; }
  .c3d-song-item { display: flex; flex-direction: column; gap: 3px; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06); font-family: var(--c3d-mono), monospace; }
  .c3d-song-item-title { font-size: 11.5px; letter-spacing: 0.04em; color: #F4F1EA; }
  .c3d-song-item-by { font-size: 9.5px; letter-spacing: 0.1em; color: #6E6A5D; }

  .c3d-quiz { display: flex; flex-direction: column; gap: 28px; width: 100%; max-width: 460px; }
  .c3d-quiz-q { display: flex; flex-direction: column; gap: 14px; }
  .c3d-quiz-q-num { font-family: var(--c3d-mono), monospace; font-size: 10px; letter-spacing: 0.24em; color: #8A8577; }
  .c3d-quiz-q-text { margin: 0; font-family: var(--c3d-poppins), sans-serif; font-size: clamp(18px, 4vw, 22px); line-height: 1.3; color: #F4F1EA; }
  .c3d-quiz-opts { display: flex; flex-wrap: wrap; gap: 10px; }
  .c3d-quiz-opt { font-family: var(--c3d-mono), monospace; font-size: 11px; letter-spacing: 0.06em; padding: 10px 16px; border: 1px solid rgba(111,203,159,0.4); background: transparent; color: #6FCB9F; cursor: pointer; transition: background 160ms ease, color 160ms ease, border-color 160ms ease; }
  .c3d-quiz-opt:disabled { cursor: default; }
  .c3d-quiz-opt--picked { background: #6FCB9F; border-color: #6FCB9F; color: #0B0B10; }
  .c3d-quiz-opt--correct { background: #6FCB9F; border-color: #6FCB9F; color: #0B0B10; }
  .c3d-quiz-opt--wrong { border-color: #8A6A6A; color: #C99; opacity: 0.6; }
  .c3d-quiz-result { padding-top: 18px; border-top: 1px solid rgba(111,203,159,0.2); }
  .c3d-quiz-result-score { margin: 0 0 6px; font-family: var(--c3d-mono), monospace; font-size: 11px; letter-spacing: 0.16em; color: #EAF6F0; }
  .c3d-quiz-result-stat { margin: 0; font-size: 11.5px; line-height: 1.5; color: #A8A292; }

  .c3d-final-card { border: 1px solid #6FCB9F; padding: 30px 24px; display: flex; flex-direction: column; gap: 22px; align-items: center; text-align: center; position: relative; }
  .c3d-final-names { font-family: var(--c3d-poppins), sans-serif; font-size: clamp(34px, 10vw, 46px); line-height: .9; color: #EAF6F0; }
  .c3d-barcode { height: 26px; background: repeating-linear-gradient(90deg, #6E6A5D 0 2px, transparent 2px 4px, #6E6A5D 4px 5px, transparent 5px 9px, #6E6A5D 9px 11px, transparent 11px 14px); }
  .c3d-final-footer { display: flex; justify-content: space-between; align-items: center; font-size: 9px; letter-spacing: 0.24em; color: #56534A; }
  .c3d-replay { cursor: pointer; color: #6FCB9F; }
  .c3d-footer-credit { display: flex; justify-content: center; padding-top: 8px; opacity: 0.7; }

  .c3d-rail { position: absolute; right: 0; top: 0; bottom: 0; width: 34px; z-index: 4; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 20px 0; opacity: 0; transition: opacity 700ms ease; pointer-events: none; border-left: 1px solid rgba(111,203,159,0.14); }
  .c3d-rail-top { writing-mode: vertical-rl; font-size: 8px; letter-spacing: 0.34em; color: #8A8577; transition: color 500ms ease; }
  .c3d-rail-line { flex: 1; width: 1px; margin: 16px 0; background: rgba(111,203,159,0.16); position: relative; }
  .c3d-rail-bar { position: absolute; left: -1px; top: 0; width: 3px; height: 0%; background: linear-gradient(#EAF6F0, #6FCB9F); transition: height 260ms linear; display: block; }
  .c3d-rail-label { writing-mode: vertical-rl; font-size: 8px; letter-spacing: 0.34em; color: #6FCB9F; transition: color 500ms ease; }

  .c3d-cover { position: absolute; inset: 0; z-index: 5; }
  .c3d-cover-half { position: absolute; left: 0; right: 0; height: 50%; overflow: hidden; transition: transform 1100ms cubic-bezier(.7,0,.2,1); }
  .c3d-cover-half--top { top: 0; }
  .c3d-cover-half--bottom { bottom: 0; }
  .c3d-cover-inner { position: absolute; left: 0; right: 0; top: 0; height: 200%; overflow: hidden; background: radial-gradient(120% 70% at 50% 8%, #142420 0%, #0B1512 46%, #070F0D 100%); }
  .c3d-cover-half--bottom .c3d-cover-inner { top: auto; bottom: 0; }
  .c3d-cover-glow { position: absolute; left: 50%; top: 6%; width: 190%; aspect-ratio: 1; transform: translate(-50%, -14%); border-radius: 50%; background: conic-gradient(from 200deg, rgba(201,169,245,0.5), rgba(127,209,224,0.4), rgba(127,209,224,0.55), rgba(201,169,245,0.5)); filter: blur(64px); opacity: .62; animation: gpFoil 26s linear infinite; }
  /* Textura de facetas cruzadas (ver mockup original): dos tramas
     diagonales -- una clara, una lavanda -- que se cruzan sobre el fondo
     de la portada, imitando el corte de un cristal. Propia de esta
     plantilla, distinta del abanico ("sunburst") u otras texturas del
     resto de la colección. */
  .c3d-cover-facets { position: absolute; inset: 0; background-image: repeating-linear-gradient(64deg, rgba(234,246,240,.08) 0 1px, transparent 1px 34px), repeating-linear-gradient(-64deg, rgba(199,210,214,.08) 0 1px, transparent 1px 34px); }
  .c3d-cover-content { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: space-between; padding: 24px max(24px, calc((100% - 440px) / 2)) 26px; }
  .c3d-cover-top-row { display: flex; justify-content: space-between; font-size: 9.5px; letter-spacing: 0.24em; color: #8A8577; }
  .c3d-cover-center { display: flex; flex-direction: column; align-items: center; gap: clamp(10px, 2.2vh, 22px); text-align: center; }
  .c3d-cover-kicker { font-size: 9.5px; letter-spacing: 0.34em; color: #8A8577; }
  .c3d-cover-names { margin: 0; font-family: var(--c3d-poppins), sans-serif; font-weight: 400; font-size: min(clamp(48px, 16vw, 96px), 12.5vh); line-height: 0.86; letter-spacing: -0.02em; color: #EAF6F0; }
  .c3d-cover-rule { width: 1px; height: clamp(16px, 4vh, 44px); background: linear-gradient(#6FCB9F, transparent); display: block; }
  .c3d-cover-date { font-size: 11.5px; letter-spacing: 0.3em; color: #A8A292; white-space: nowrap; }
  .c3d-cover-bottom { display: flex; flex-direction: column; gap: clamp(12px, 2.4vh, 22px); }
  .c3d-cover-facts { display: flex; justify-content: space-between; font-size: 9px; letter-spacing: 0.2em; color: #6E6A5D; }
  .c3d-cover-cta { border: 1px solid #6FCB9F; background: linear-gradient(100deg, rgba(200,164,92,0.08), rgba(232,214,168,0.2), rgba(200,164,92,0.08)); color: #F6EFDD; font-family: var(--c3d-mono), monospace; font-size: 12px; letter-spacing: 0.26em; padding: clamp(13px, 2.1vh, 19px) 0; text-align: center; width: 100%; }
  .c3d-cover-cta--btn { cursor: pointer; border-radius: 0; }
  @media (hover: hover) {
    .c3d-cover-cta--btn:hover { background: linear-gradient(100deg, rgba(232,214,168,0.34), rgba(246,239,221,0.5), rgba(232,214,168,0.34)); color: #0B0B0F; }
  }
  .c3d-barcode-wrap { display: flex; flex-direction: column; align-items: center; gap: 10px; }

  .c3d-hint { position: absolute; left: 0; right: 34px; bottom: 18px; z-index: 6; text-align: center; font-size: 9px; letter-spacing: 0.28em; color: #8A8577; opacity: 0; transition: opacity 600ms ease; pointer-events: none; animation: gpHint 2.4s ease-in-out infinite; }

  .c3d-lightbox { position: fixed; inset: 0; z-index: 200; background: rgba(8,8,11,0.96); display: flex; align-items: center; justify-content: center; padding: 24px; cursor: zoom-out; }
  .c3d-lightbox-close { position: absolute; top: 20px; right: 20px; width: 36px; height: 36px; border-radius: 50%; border: 1px solid #6FCB9F; background: rgba(0,0,0,0.4); color: #F4F1EA; font-size: 18px; line-height: 1; cursor: pointer; display: flex; align-items: center; justify-content: center; }
  .c3d-lightbox-img { max-width: 100%; max-height: 88vh; object-fit: contain; cursor: default; }
`;
