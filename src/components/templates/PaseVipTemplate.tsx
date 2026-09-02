"use client";

/**
 * PaseVipTemplate.tsx
 *
 * Portado 1:1 desde el diseño "Pase VIP - Panorámica" (Colección Storytelling,
 * mis quince años: fondo negro casi puro, acento dorado con destellos de rojo
 * y verde azulado en los medallones, Bodoni Moda + IBM Plex Mono, medallón de
 * texto plano "VIP" -- sin ícono -- tarjeta-pase perforada tipo entrada de
 * boliche, scroll horizontal "pineado" para Cuándo y dónde / Álbum, riel
 * lateral de progreso y portada que se abre en dos mitades). Misma
 * arquitectura que PrincesaTemplate.tsx (ver ese archivo para el detalle del
 * motor de motion) -- todo el motion es CSS + SVG + un loop de scroll propio,
 * cero PNGs.
 *
 * OJO -- particularidad del mockup fuente (`Pase VIP - Panoramica.dc.html`,
 * sin tilde): la tapa usa el MISMO fondo y el MISMO patrón de rayos en abanico
 * ("sunburst", `repeating-conic-gradient` enmascarado con una viñeta radial)
 * que ya está construido 1:1 en GuestPassVipTemplate.tsx (`.gpv-cover-sunburst`,
 * valores idénticos) -- es decir que el propio mockup de XV es, en ese
 * elemento puntual, un calco del de casamiento. Como el usuario pidió
 * explícitamente que cada plantilla tenga su textura de tapa propia (nunca
 * reutilizar el sunburst de Guest Pass VIP), acá la tapa NO usa esos rayos:
 * en su lugar hay una grilla fina tipo papel de ticket/boletería
 * (`.pvp-cover-grid`, dos `repeating-linear-gradient` cruzados con la misma
 * viñeta radial de máscara), fiel al resto del lenguaje visual del propio
 * mockup (la grilla de líneas de la sección Countdown) pero sin duplicar el
 * elemento específico de Guest Pass VIP.
 *
 * Secciones fijas del producto (Save the Date, Countdown, Frase, Cuándo y
 * dónde, RSVP, Álbum, Música, Footer) reinterpretadas visualmente, conectadas
 * a datos reales de `Invitation`/`Guest`. Tipografía/countdown/álbum/RSVP/quiz
 * son de diseño fijo (no elegibles desde el wizard, como toda esta colección),
 * pero hablan SIEMPRE con los mismos endpoints reales del backend
 * (/api/guests/[token]/confirm, /api/songs, /api/quiz).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Bodoni_Moda, IBM_Plex_Mono } from "next/font/google";
import { LiveAlbumStrip } from "@/components/templates/LiveAlbumStrip";
import { LogoFooterCredit } from "@/components/ui/Logo";
import { AddToCalendarLink } from "@/components/invitation/AddToCalendarLink";
import { resolveGuestNameDisplay } from "@/lib/invitation-copy";
import { useMusicPlayer, MusicToggleButton } from "@/components/invitation/MusicPlayer";
import { BankDetailsCard } from "@/components/invitation/v2/BankDetailsCard";
import { InfoAdicionalSection } from "@/components/invitation/v2/InfoAdicionalSection";
import { CreditCard, Gift } from "lucide-react";
import { createPortal } from "react-dom";

const pvpBodoni = Bodoni_Moda({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500"],
  variable: "--pvp-bodoni",
  display: "swap",
});

const pvpMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--pvp-mono",
  display: "swap",
});

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

interface PvpQuizQuestion {
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

interface PaseVipTemplateProps {
  invitation: Record<string, unknown>;
  guest?: GuestRecord | null;
  isPersonalized?: boolean;
}

// El backend no reserva mesas/sectores -- el pase muestra el orden real del
// invitado (001, 002...) en vez de un número inventado.
function passNumberFrom(orderNumber: number | undefined): string {
  if (!orderNumber) return "---";
  return String(orderNumber).padStart(3, "0");
}

export function PaseVipTemplate({ invitation, guest, isPersonalized = false }: PaseVipTemplateProps) {
  const nombreQuinceanera = String(invitation.nombreQuinceanera || invitation.nombreEvento || "");
  const namesTitle = nombreQuinceanera || "Mis quince";

  // "Saludar por nombre del invitado/familia": si está activo, la portada
  // saluda con el nombre del invitado/familia en vez de la quinceañera.
  const showGuestNameInCover = Boolean(guest?.name) && invitation.mostrarNombreInvitadoEnSaludo !== false;
  const coverGuestName = resolveGuestNameDisplay(invitation, guest);
  const coverKickerText = showGuestNameInCover ? "ACCESO EXCLUSIVO PARA" : "ACCESO EXCLUSIVO A MIS QUINCE DE";
  const coverNamesTitle: React.ReactNode = showGuestNameInCover ? coverGuestName : namesTitle;

  const fechaEvento = invitation.fechaEvento ? new Date(String(invitation.fechaEvento)) : new Date();
  const hora = String(invitation.hora ?? "21:00");
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
  const dressCode = String(invitation.portadaDressCode ?? "");
  const portadaMensaje = String(
    invitation.portadaMensaje || "Bloqueá la noche entera. El resto lo cuento yo."
  );

  // Cronograma real (no inventado) -- se muestra tal cual lo cargó el
  // cliente en el wizard, en la misma hoja que el salón.
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
  const triviaPreguntas: PvpQuizQuestion[] = safeJson<PvpQuizQuestion[]>(String(invitation.triviaPreguntas ?? ""), []);
  const triviaTitulo = String(invitation.triviaTitulo || "¿Cuánto sabés de mí?");
  const quizEnabled = triviaHabilitada && triviaPreguntas.length > 0;

  // Frase: elegible/personalizable desde el wizard (StepPhrase) -- nunca
  // hardcodeada. Frase larga -> tipografía más chica para que entre bien.
  const frasePersonalizadaHabilitada = Boolean(invitation.frasePersonalizadaHabilitada);
  const frase = frasePersonalizadaHabilitada && invitation.frasePersonalizadaTexto
    ? String(invitation.frasePersonalizadaTexto)
    : "La pista se abre una sola vez.";
  const fraseWords = frase.split(/\s+/).filter(Boolean);
  // Combinación de colores del diseño: primera mitad de la frase en color
  // plano, segunda mitad en dorado itálico, partiendo por la mitad de la
  // cantidad real de palabras.
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
        statusRef.current.style.color = "#E8D6A8";
      }
      if (stubRef.current) {
        stubRef.current.style.borderColor = "#C8A45C";
        stubRef.current.style.boxShadow = "0 0 0 1px rgba(200,164,92,.35), 0 18px 50px -30px #C8A45C";
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
            dot.style.background = i === active ? "#8C6F35" : "rgba(20,20,27,0.18)";
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
          if (railLabelRef.current) railLabelRef.current.style.color = light ? "#8C6F35" : "#C8A45C";
        }
        if (hintRef.current && sc.scrollTop > 40) hintRef.current.style.opacity = "0";
      }
      rafId = requestAnimationFrame(frame);
    };
    rafId = requestAnimationFrame(frame);

    const onResize = () => {};
    window.addEventListener("resize", onResize);

    // Gesto lateral manual dentro de los paneles "pineados" (El lugar /
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
      className={`${pvpBodoni.variable} ${pvpMono.variable}`}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "calc(var(--vh, 1vh) * 100)",
        overflow: "hidden",
        background: "#08080B",
        fontFamily: "var(--pvp-mono), monospace",
        color: "#F4F1EA",
      }}
    >
      <style>{PVP_CSS}</style>

      <div ref={scrollerRef} data-scroller="1" className="pvp-scroller">
        <section data-tone="dark" data-screen-label="Save the Date" className="pvp-section" style={{ background: "radial-gradient(120% 80% at 50% 0%, #17141F 0%, #0B0B10 55%, #08080B 100%)" }}>
          <span data-xin="1" data-dist="-60" className="pvp-kicker">01 — GUARDÁ LA FECHA</span>
          <div className="pvp-date-stack">
            <span data-xin="1" data-delay="60" data-dist="-110" className="pvp-date-num">{dayNum}</span>
            <span data-xin="1" data-delay="170" data-dist="140" className="pvp-date-month">{monthAbbr}</span>
            <span data-xin="1" data-delay="280" data-dist="220" className="pvp-date-num pvp-date-num--right">
              {String(fechaEvento.getFullYear()).slice(-2)}
            </span>
          </div>
          <div data-xin="1" data-delay="380" data-dist="-80" className="pvp-divider">
            <span className="pvp-divider-line" /><span>{weekday} · {hora} H</span>
          </div>
          <p data-xin="1" data-delay="460" className="pvp-lead">{portadaMensaje}</p>
          <AddToCalendarLink
            eventName={namesTitle}
            targetDate={eventDateTime}
            location={lugarNombre || direccion}
            description={portadaMensaje}
            className="pvp-cal-link"
          />

          <div data-drift="-70" className="pvp-medallion pvp-medallion--corner">
            <PvpMedallion label="VIP" sub="ACCESO" arcId="pvpArc1" arcText="ADMIT ONE · MIS QUINCE · " spin="normal" />
          </div>
        </section>

        <section id="countdown" data-tone="dark" data-screen-label="Countdown" className="pvp-section pvp-section--between" style={{ background: "radial-gradient(100% 60% at 50% 100%, #241D0F 0%, #0D0B10 55%, #08080B 100%)" }}>
          <div className="pvp-scan-grid" />
          <div className="pvp-scanline" />
          <span data-xin="1" data-dist="-60" className="pvp-kicker" style={{ position: "relative" }}>02 — EL PASE SE ACTIVA EN</span>
          <div className="pvp-cd-grid">
            <PvpCdBox refEl={dRef} delay={40} dist={-90} label="DÍAS" />
            <PvpCdBox refEl={hRef} delay={120} dist={110} label="HORAS" />
            <PvpCdBox refEl={mRef} delay={200} dist={-140} label="MIN" />
            <PvpCdBox refEl={sRef} delay={280} dist={170} label="SEG" />
          </div>
          <div className="pvp-perf-strip" />
        </section>

        <section id="quote" data-tone="dark" data-screen-label="Frase" className="pvp-section" style={{ background: "radial-gradient(130% 90% at 86% 16%, #1C1727 0%, #0C0B11 52%, #08080B 100%)" }}>
          <div data-drift="-130" className="pvp-glow-blob" />
          <span data-xin="1" data-dist="-60" className="pvp-kicker" style={{ position: "relative" }}>03 — CUANDO LLEGUE A CERO</span>
          <h2 ref={phraseRef} className="pvp-phrase" style={{ fontSize: fraseFontSize }}>
            {fraseWords.map((w, i) => (
              // El espacio va FUERA del span: el motor de reveal fuerza
              // `display:inline-block` en cada [data-w], y un espacio de fin
              // de línea DENTRO de un inline-block se colapsa a 0 -- como
              // texto suelto entre spans, en cambio, se renderiza normal.
              <span key={i}>
                <span data-w="1" className={i >= fraseAccentStart ? "pvp-accent-italic" : undefined}>
                  {w}
                </span>{" "}
              </span>
            ))}
          </h2>
          <div data-xin="1" data-delay="120" data-dist="90" className="pvp-divider" style={{ position: "relative" }}>
            <span className="pvp-divider-line pvp-divider-line--long" /><span>{fechaCorta} — {hora} H</span>
          </div>
        </section>

        <div data-pan="1" data-screen-label="Cuándo y dónde" className="pvp-pan" style={ceremoniaHabilitada ? { height: "340vh" } : undefined}>
          <div className="pvp-pan-sticky">
            <div data-strip="1" className="pvp-strip">
              {ceremoniaHabilitada && (
                <div id="ceremonia" data-tone="light" className="pvp-panel pvp-panel--between" style={{ background: "#EFEBE1", color: "#14141B" }}>
                  <div className="pvp-hair-bg" />
                  <div className="pvp-panel-top">
                    <span>04 — {ceremoniaTitulo.toUpperCase()}</span><span>01 / {LUGAR_PANEL_COUNT}</span>
                  </div>
                  <h2 className="pvp-panel-title">
                    {ceremoniaNombre || ceremoniaTitulo}
                    {ceremoniaDireccion && <><br /><span className="pvp-accent-serif">{ceremoniaDireccion}</span></>}
                  </h2>
                  <div className="pvp-facts">
                    {ceremoniaHora && (
                      <div className="pvp-facts-row pvp-facts-row--last">
                        <span>HORARIO</span><span>{ceremoniaHora} H</span>
                      </div>
                    )}
                  </div>
                  {ceremoniaMapUrl && (
                    <a href={ceremoniaMapUrl} target="_blank" rel="noopener noreferrer" className="pvp-link-cta">
                      ABRIR EN MAPAS →
                    </a>
                  )}
                  <div className="pvp-seguir">SEGUÍ BAJANDO <span className="pvp-side-hint">→</span></div>
                </div>
              )}

              <div id="details" data-tone="light" className="pvp-panel pvp-panel--between" style={{ background: "#EFEBE1", color: "#14141B" }}>
                <div className="pvp-hair-bg" />
                <div className="pvp-panel-top">
                  <span>04 — CUÁNDO Y DÓNDE</span><span>{ceremoniaHabilitada ? "02" : "01"} / {LUGAR_PANEL_COUNT}</span>
                </div>
                <h2 className="pvp-panel-title">
                  {lugarNombre || "El salón"}
                  {direccion && <><br /><span className="pvp-accent-serif">{direccion}</span></>}
                </h2>
                <div className="pvp-facts">
                  <div className="pvp-facts-row">
                    <span>HORARIO</span><span>{hora} H</span>
                  </div>
                  {dressCode && (
                    <div className="pvp-facts-row pvp-facts-row--last">
                      <span>CÓDIGO</span><span className="pvp-accent-serif-2">{dressCode.toUpperCase()}</span>
                    </div>
                  )}
                </div>
                {cronograma.length > 0 && (
                  <div className="pvp-crono">
                    {cronograma.map((item, i) => (
                      <div key={i} className="pvp-crono-row">
                        <span className="pvp-crono-time">{item.time || ""}</span>
                        <span className="pvp-crono-title">{item.title}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="pvp-seguir">SEGUÍ BAJANDO <span className="pvp-side-hint">→</span></div>
              </div>

              <div data-tone="light" className="pvp-panel pvp-panel--end" style={{ background: "#E4DFD3", color: "#14141B" }}>
                <svg viewBox="0 0 300 500" preserveAspectRatio="none" className="pvp-route-svg">
                  <path ref={routeRef} d="M18 468 C 130 400, 54 262, 152 220 S 254 140, 282 40" fill="none" stroke="#8C6F35" strokeWidth={1.6} />
                  <circle cx={282} cy={40} r={5} fill="#8C6F35" />
                </svg>
                <div className="pvp-panel-block">
                  <span className="pvp-mini-label">{ceremoniaHabilitada ? "03" : "02"} / {LUGAR_PANEL_COUNT}</span>
                  <span className="pvp-panel-title-sm">Cómo llegar</span>
                  {direccion && <span className="pvp-mini-label">{direccion}</span>}
                  {mapUrl && (
                    <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="pvp-link-cta">
                      ABRIR EN MAPAS →
                    </a>
                  )}
                </div>
              </div>

              <div data-tone="dark" className="pvp-panel pvp-panel--center" style={{ background: "#0B0B10", color: "#F4F1EA" }}>
                <div className="pvp-medallion pvp-medallion--lg">
                  <PvpMedallion title="SECTOR" label="Pista" sub="MESA VIP" arcId="pvpArc2" arcText={`ACCESO VIP · PASE Nº ${passNumber} · `} spin="reverse" />
                </div>
                <span className="pvp-mini-label">{LUGAR_PANEL_COUNT} / {LUGAR_PANEL_COUNT} — TU UBICACIÓN</span>
              </div>
            </div>
            <PvpDots count={LUGAR_PANEL_COUNT} />
          </div>
        </div>

        <section data-tone="dark" data-screen-label="Check-in" className="pvp-section" style={{ background: "radial-gradient(110% 70% at 50% 100%, #17141F 0%, #0B0B10 60%, #08080B 100%)" }}>
          <span data-xin="1" data-dist="-60" className="pvp-kicker">05 — CHECK-IN</span>
          <h2 data-xin="1" data-delay="80" data-dist="130" className="pvp-h2">
            Confirmá<br /><span className="pvp-accent-italic">tu acceso</span>
          </h2>

          {rsvpEnabled ? (
            <div data-xin="1" data-delay="170" data-dist="-90" className="pvp-rsvp">
              <PvpRsvpCard
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
            <p className="pvp-lead">La confirmación de asistencia está cerrada por el momento.</p>
          )}
        </section>

        <div id="album" data-pan="1" data-screen-label="Álbum" className="pvp-pan">
          <div className="pvp-pan-sticky">
            <div data-strip="1" className="pvp-strip">
              {photoPages.map((page, pageIndex) => (
                <div key={pageIndex} data-tone="light" className="pvp-panel pvp-panel--gap" style={{ background: ALBUM_TONES[pageIndex % ALBUM_TONES.length], color: "#14141B" }}>
                  <div className="pvp-hair-bg" />
                  <div className="pvp-panel-top">
                    <span>06 — ARCHIVO / {String(allPhotos.length).padStart(3, "0")}</span><span>HOJA {String(pageIndex + 1).padStart(2, "0")} / {String(photoPages.length).padStart(2, "0")}</span>
                  </div>
                  {pageIndex === 0 && <h2 className="pvp-panel-title-md">Álbum <span className="pvp-accent-serif">de fotos</span></h2>}
                  <div className="pvp-mosaic">
                    {page.length > 0 ? page.map((url, i) => (
                      <div
                        key={i}
                        className={`pvp-mosaic-cell${i === 0 ? " pvp-mosaic-cell--featured" : ""}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => setExpandedPhoto(url)}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setExpandedPhoto(url); }}
                        aria-label={`Ampliar foto ${i + 1}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" className="pvp-mosaic-img" />
                      </div>
                    )) : (
                      <span className="pvp-photo-placeholder">Sin fotos todavía</span>
                    )}
                  </div>
                  <div className="pvp-seguir pvp-seguir--split">
                    <span>{allPhotos.length} FOTOS SUBIDAS</span>
                    <span className="pvp-accent-serif-2">SEGUÍ →</span>
                  </div>
                </div>
              ))}

              <div data-tone="light" className="pvp-panel pvp-panel--gap" style={{ background: "#EDE8DE", color: "#14141B" }}>
                <span className="pvp-panel-top" style={{ display: "block" }}>HOJA {String(photoPages.length + 1).padStart(2, "0")} — EN VIVO</span>
                <h2 className="pvp-panel-title">Todo lo que<br /><span className="pvp-accent-serif">vamos a recordar</span></h2>
                <div className="pvp-album-embed">
                  {livePhotos.length > 0 ? (
                    <LiveAlbumStrip photos={livePhotos} tone="light" accentColor="#8C6F35" />
                  ) : (
                    <div className="pvp-live-placeholder">
                      <span className="pvp-mini-label">
                        {eventHasStarted
                          ? "Todavía no se subió nada en vivo."
                          : "Esta sección se activa el día de la fiesta -- ahí vas a poder ver todo lo que subamos en vivo."}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <PvpDots count={photoPages.length + 1} />
          </div>
        </div>

        {sugerenciaMusicaHabilitada && (
          <section id="music" data-tone="dark" data-screen-label="Música" className="pvp-section" style={{ background: "#0B0B10" }}>
            <span data-xin="1" data-dist="-60" className="pvp-kicker">07 — SUGERENCIA DE MÚSICA</span>
            <h2 data-xin="1" data-delay="80" data-dist="140" className="pvp-h2">¿Qué tema<br /><span className="pvp-accent-italic">no puede faltar?</span></h2>
            <div data-xin="1" data-delay="160" data-dist="-80" className="pvp-eq">
              {[0, 0.18, 0.36, 0.54, 0.72].map((delay, i) => (
                <span key={i} className="pvp-eq-bar" style={{ animationDelay: `${delay}s`, background: i === 2 ? "#E8D6A8" : "#C8A45C" }} />
              ))}
            </div>
            <div data-xin="1" data-delay="240" data-dist="110" className="pvp-song-wrap">
              <PvpSongSuggestion
                invitationId={String(invitation.id ?? "")}
                guestToken={guest?.uniqueToken}
                guestName={guestName || "Invitado"}
              />
            </div>
          </section>
        )}

        {showBankSection && (
          <section id="banco" data-tone="dark" data-screen-label="Regalos" className="pvp-section" style={{ background: "#0B0B10" }}>
            <span data-xin="1" data-dist="-60" className="pvp-kicker">{sugerenciaMusicaHabilitada ? "08" : "07"} — REGALOS Y PAGOS</span>
            <h2 data-xin="1" data-delay="80" data-dist="140" className="pvp-h2">
              Si querés<br /><span className="pvp-accent-italic">sumarte</span>
            </h2>
            <div data-xin="1" data-delay="160" data-dist="-80" className="pvp-bank-wrap">
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
                  accentColor="#C8A45C"
                  cardBg="rgba(20,20,27,0.72)"
                  cardBorder="#2A2417"
                  textPrimary="#F4F1EA"
                  textSecondary="#A8A292"
                  InfoRow={PvpInfoRow}
                  CopyField={PvpCopyField}
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
                  accentColor="#C8A45C"
                  cardBg="rgba(20,20,27,0.72)"
                  cardBorder="#2A2417"
                  textPrimary="#F4F1EA"
                  textSecondary="#A8A292"
                  InfoRow={PvpInfoRow}
                  CopyField={PvpCopyField}
                />
              )}
            </div>
          </section>
        )}

        {quizEnabled && (
          <section id="quiz" data-tone="dark" data-screen-label="Quiz" className="pvp-section" style={{ background: "#0B0B10" }}>
            <span data-xin="1" data-dist="-60" className="pvp-kicker">{[sugerenciaMusicaHabilitada, showBankSection].filter(Boolean).length + 7} — EL JUEGO</span>
            <h2 data-xin="1" data-delay="80" data-dist="140" className="pvp-h2" style={{ fontSize: "clamp(28px, 6vw, 44px)" }}>
              {triviaTitulo}
            </h2>
            <div data-xin="1" data-delay="160" data-dist="-80">
              <PvpQuiz
                preguntas={triviaPreguntas}
                invitationId={String(invitation.id ?? "")}
                guestToken={guest?.uniqueToken}
                guestName={guestName || "Invitado"}
              />
            </div>
          </section>
        )}

        <section data-tone="dark" data-screen-label="Tu pase VIP" className="pvp-section pvp-section--between" style={{ padding: "96px max(30px, calc((100% - 560px) / 2)) 48px max(24px, calc((100% - 560px) / 2))", background: "radial-gradient(120% 70% at 50% 100%, #17141F 0%, #0B0B10 55%, #08080B 100%)" }}>
          <span data-xin="1" data-dist="-60" className="pvp-kicker">{[sugerenciaMusicaHabilitada, showBankSection, quizEnabled].filter(Boolean).length + 7} — GUARDÁ TU PASE</span>
          <div data-xin="1" data-delay="100" data-dist="130" className="pvp-final-card">
            <div className="pvp-medallion pvp-medallion--final">
              <PvpMedallion label="VIP" sub={confirmed ? "CONFIRMADO" : "PENDIENTE"} arcId="pvpArc3" arcText={`${namesTitle.toUpperCase()} · ${fechaCorta} · `} spin="reverse" />
            </div>
            <span className="pvp-mini-label pvp-accent-serif-2">PASE Nº {passNumber} · ADMIT {guestAdults + guestTeens + guestChildren || 1}</span>
            <span className="pvp-final-names">{namesTitle}</span>
            <span className="pvp-mini-label" style={{ color: "#A8A292" }}>{fechaCorta} — {hora} H</span>
            <div className="pvp-barcode" style={{ width: "60%", height: 26, opacity: 0.6 }} />
          </div>
          <div className="pvp-final-footer">
            <span>NO TRANSFERIBLE</span>
            <span className="pvp-replay" onClick={reset}>VER LA APERTURA OTRA VEZ ↺</span>
          </div>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <InfoAdicionalSection invitation={invitation as any} />
          <div className="pvp-footer-credit">
            <LogoFooterCredit bgColor="transparent" />
          </div>
        </section>
      </div>

      <div ref={railRef} className="pvp-rail">
        <span ref={railTopRef} className="pvp-rail-top">PASE Nº {passNumber}</span>
        <div ref={railLineRef} className="pvp-rail-line">
          <span ref={railBarRef} className="pvp-rail-bar" />
        </div>
        <span ref={railLabelRef} className="pvp-rail-label">SAVE THE DATE</span>
      </div>

      <div ref={coverRef} className="pvp-cover">
        <div ref={topRef} className="pvp-cover-half pvp-cover-half--top">
          <PvpCoverHalf
            namesRef={namesRef}
            kickerRef={kickerRef}
            perfRef={perfRef}
            kickerText={coverKickerText}
            namesTitle={coverNamesTitle}
            fechaCorta={fechaCorta}
            passNumber={passNumber}
            dressCode={dressCode}
            hora={hora}
          >
            <div className="pvp-cover-cta">ABRIR INVITACIÓN</div>
          </PvpCoverHalf>
        </div>
        <div ref={bottomRef} className="pvp-cover-half pvp-cover-half--bottom">
          <PvpCoverHalf
            kickerText={coverKickerText}
            namesTitle={coverNamesTitle}
            fechaCorta={fechaCorta}
            passNumber={passNumber}
            dressCode={dressCode}
            hora={hora}
          >
            <button onClick={open} className="pvp-cover-cta pvp-cover-cta--btn">ABRIR INVITACIÓN</button>
          </PvpCoverHalf>
        </div>
      </div>

      <div ref={hintRef} className="pvp-hint">DESLIZÁ ↓</div>

      {expandedPhoto && (
        <div
          className="pvp-lightbox"
          onClick={() => setExpandedPhoto(null)}
          onContextMenu={(e) => e.preventDefault()}
        >
          <button
            type="button"
            className="pvp-lightbox-close"
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
            className="pvp-lightbox-img"
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

function PvpCdBox({ refEl, delay, dist, label }: { refEl: React.RefObject<HTMLSpanElement | null>; delay: number; dist: number; label: string }) {
  return (
    <div data-xin="1" data-delay={delay} data-dist={dist} className="pvp-cd-box">
      <span ref={refEl} className="pvp-cd-num">—</span>
      <span className="pvp-cd-label">{label}</span>
    </div>
  );
}

function PvpDots({ count = 3 }: { count?: number }) {
  return (
    <div data-dots="1" className="pvp-dots">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} data-dot={i} className="pvp-dot" />
      ))}
    </div>
  );
}

// Medallón de texto plano (sin ícono): así lo muestra el mockup -- "VIP" en
// Bodoni Moda en vez de un dibujo, con una leyenda chica arriba (opcional,
// ej. "SECTOR") y otra abajo (ej. "ACCESO"/"MESA VIP"). Ver `title`/`sub`.
function PvpMedallion({
  title,
  label,
  sub,
  arcId,
  arcText,
  spin,
  compact,
}: {
  title?: string;
  label: string;
  sub?: string;
  arcId?: string;
  arcText?: string;
  spin: "normal" | "reverse" | "none";
  compact?: boolean;
}) {
  // Duración fija por instancia (no en cada render) -- Math.random() directo
  // en el render viola la regla de pureza de React.
  const [ringDuration] = useState(() => 18 + Math.random() * 4);
  return (
    <>
      <div className="pvp-medallion-ring" style={{ animation: spin === "none" ? "none" : `gpRing ${ringDuration}s linear infinite` }} />
      <div className="pvp-medallion-core">
        {title && <span className="pvp-medallion-sub">{title}</span>}
        <span className={compact ? "pvp-medallion-label-sm" : "pvp-medallion-label"}>{label}</span>
        {sub && <span className="pvp-medallion-sub pvp-medallion-sub--accent">{sub}</span>}
      </div>
      {arcId && arcText && (
        <svg viewBox="0 0 100 100" className="pvp-medallion-arc" style={{ animation: spin === "reverse" ? "gpRingRev 32s linear infinite" : "gpRingRev 34s linear infinite" }}>
          <defs>
            <path id={arcId} d="M50 50 m -38 0 a 38 38 0 1 1 76 0 a 38 38 0 1 1 -76 0" fill="none" />
          </defs>
          <text className="pvp-medallion-arc-text">
            <textPath href={`#${arcId}`}>{arcText}{arcText}</textPath>
          </text>
        </svg>
      )}
    </>
  );
}

function PvpCopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div className="pvp-bank-row">
      <div style={{ minWidth: 0, flex: 1 }}>
        <span className="pvp-bank-row-label">{label}</span>
        <span className="pvp-bank-row-value">{value}</span>
      </div>
      <button type="button" className="pvp-bank-copy" onClick={handle}>
        {copied ? "✓ Copiado" : "Copiar"}
      </button>
    </div>
  );
}

// Reimplementación propia del RSVP: filas de datos + el ticket/sello ya
// existente en la plantilla. Habla con el mismo endpoint/payload que
// <RSVPWizardV2> (/api/guests/[token]/confirm o /api/rsvp), así que no
// cambia ningún dato que pida el backend, solo cómo se ve.
function PvpRsvpCard({
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
      <div className="pvp-rsvp-declined">
        <p className="pvp-rsvp-declined-text">Gracias por avisarnos. Si cambiás de idea, este mismo acceso sigue activo.</p>
        <button type="button" className="pvp-rsvp-btn pvp-rsvp-btn--ghost" onClick={() => setStatus("PENDING")}>
          CAMBIÉ DE IDEA
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="pvp-rsvp-rows">
        <div className="pvp-rsvp-row">
          <span>{totalGuests > 1 ? "RESERVADO PARA" : "NOMBRE Y APELLIDO"}</span>
          <span>{guestName || "—"}</span>
        </div>

        {totalGuests > 1 && status !== "CONFIRMED" && (
          <div className="pvp-rsvp-row">
            <span>ADULTOS</span>
            <div className="pvp-rsvp-stepper">
              <button type="button" onClick={() => setAdultCount((v) => Math.max(1, v - 1))} disabled={adultCount <= 1}>−</button>
              <span>{String(adultCount).padStart(2, "0")}</span>
              <button type="button" onClick={() => setAdultCount((v) => Math.min(maxAdults, v + 1))} disabled={adultCount >= maxAdults}>+</button>
            </div>
          </div>
        )}
        {maxTeens > 0 && status !== "CONFIRMED" && (
          <div className="pvp-rsvp-row">
            <span>ADOLESCENTES</span>
            <div className="pvp-rsvp-stepper">
              <button type="button" onClick={() => setTeenCount((v) => Math.max(0, v - 1))} disabled={teenCount <= 0}>−</button>
              <span>{String(teenCount).padStart(2, "0")}</span>
              <button type="button" onClick={() => setTeenCount((v) => Math.min(maxTeens, v + 1))} disabled={teenCount >= maxTeens}>+</button>
            </div>
          </div>
        )}
        {maxChildren > 0 && status !== "CONFIRMED" && (
          <div className="pvp-rsvp-row">
            <span>NIÑOS</span>
            <div className="pvp-rsvp-stepper">
              <button type="button" onClick={() => setChildCount((v) => Math.max(0, v - 1))} disabled={childCount <= 0}>−</button>
              <span>{String(childCount).padStart(2, "0")}</span>
              <button type="button" onClick={() => setChildCount((v) => Math.min(maxChildren, v + 1))} disabled={childCount >= maxChildren}>+</button>
            </div>
          </div>
        )}
        {status === "CONFIRMED" && (
          <>
            {totalGuests > 1 && adultCount > 0 && <div className="pvp-rsvp-row"><span>ADULTOS</span><span>{String(adultCount).padStart(2, "0")}</span></div>}
            {teenCount > 0 && <div className="pvp-rsvp-row"><span>ADOLESCENTES</span><span>{String(teenCount).padStart(2, "0")}</span></div>}
            {childCount > 0 && <div className="pvp-rsvp-row"><span>NIÑOS</span><span>{String(childCount).padStart(2, "0")}</span></div>}
          </>
        )}

        {status !== "CONFIRMED" ? (
          <div className="pvp-rsvp-row">
            <span>RESTRICCIÓN ALIMENTARIA</span>
            <input
              value={dietary}
              onChange={(e) => setDietary(e.target.value)}
              placeholder="—"
              className="pvp-rsvp-input"
            />
          </div>
        ) : (
          <div className="pvp-rsvp-row">
            <span>RESTRICCIÓN ALIMENTARIA</span>
            <span>{guestRestrictions || dietary || "—"}</span>
          </div>
        )}

        {hasPayment && paymentAmount != null && !isExempt && (
          <div className="pvp-rsvp-row pvp-rsvp-row--payment">
            <span>VALOR</span>
            <div className="pvp-rsvp-payment-value">
              <span className="pvp-rsvp-payment-total">{formatARS(totalPayment)}</span>
              {(adultCount > 0 || teenCount > 0 || childCount > 0) && (
                <div className="pvp-rsvp-payment-detail">
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

      <div ref={stubRef} className="pvp-stub">
        <div className="pvp-stub-top">
          <span>PASE Nº {passNumber}</span>
          <span ref={statusRef} className="pvp-stub-status">
            {confirmed ? "ACCESO CONFIRMADO" : "PENDIENTE"}
          </span>
        </div>
        <div ref={sealRef} className="pvp-seal">
          <PvpMedallion label="VIP" spin="none" compact />
        </div>
        <div ref={beamRef} className="pvp-beam" />
        <div className="pvp-barcode" style={{ width: "70%", opacity: confirmed ? 0.7 : 0.2 }} />
      </div>

      {error && <p className="pvp-rsvp-error">{error}</p>}

      {status !== "CONFIRMED" ? (
        <>
          <button type="button" className="pvp-rsvp-btn" disabled={isSubmitting} onClick={() => submit("CONFIRMA")}>
            {isSubmitting ? "GUARDANDO…" : "CONFIRMAR ASISTENCIA"}
          </button>
          <button type="button" className="pvp-rsvp-btn pvp-rsvp-btn--ghost" disabled={isSubmitting} onClick={() => submit("NO_ASISTE")}>
            NO VOY A PODER ASISTIR
          </button>
        </>
      ) : (
        <button type="button" className="pvp-rsvp-btn pvp-rsvp-btn--ghost" onClick={() => setStatus("PENDING")}>
          MODIFICAR ASISTENCIA
        </button>
      )}
    </>
  );
}

interface PvpSongItem {
  id: string;
  title: string;
  artist: string;
  guestName: string;
}

// Misma API que <SongSuggestion> (/api/songs), look propio de la plantilla.
function PvpSongSuggestion({ invitationId, guestToken, guestName }: { invitationId: string; guestToken?: string; guestName: string }) {
  const [songs, setSongs] = useState<PvpSongItem[]>([]);
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
    <div className="pvp-song">
      <form onSubmit={handleSubmit} className="pvp-song-row">
        <div className="pvp-song-inputs">
          <input value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="ARTISTA" maxLength={80} className="pvp-song-input" />
          <span className="pvp-song-sep">—</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="TEMA" maxLength={100} className="pvp-song-input" />
        </div>
        <button type="submit" disabled={isSubmitting} className="pvp-song-submit">+ {isSubmitting ? "..." : "SUMAR"}</button>
      </form>
      {error && <p className="pvp-song-error">{error}</p>}
      {songs.length > 0 && (
        <div className="pvp-song-list">
          {songs.slice(0, 12).map((s, i) => (
            <div key={s.id} className="pvp-song-item">
              <span className="pvp-song-item-title">{String(i + 1).padStart(2, "0")} · {s.artist} — {s.title}</span>
              <span className="pvp-song-item-by">Sumado por {s.guestName || "Invitado"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Todas las preguntas se muestran juntas en la misma página -- misma API
// /api/quiz que usa el resto de las plantillas.
function PvpQuiz({ preguntas, invitationId, guestToken, guestName }: { preguntas: PvpQuizQuestion[]; invitationId: string; guestToken?: string; guestName?: string }) {
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
    <div className="pvp-quiz">
      {preguntas.map((q, qi) => {
        const correctIdx = q.respuestaCorrecta ?? q.correcta;
        return (
          <div key={qi} className="pvp-quiz-q">
            <span className="pvp-quiz-q-num">{String(qi + 1).padStart(2, "0")}</span>
            <p className="pvp-quiz-q-text">{q.pregunta}</p>
            <div className="pvp-quiz-opts">
              {q.opciones.map((opt, oi) => {
                const chosen = picks[qi] === oi;
                const revealed = picks[qi] !== undefined && correctIdx !== undefined;
                let stateClass = "";
                if (revealed) {
                  if (oi === correctIdx) stateClass = " pvp-quiz-opt--correct";
                  else if (chosen) stateClass = " pvp-quiz-opt--wrong";
                } else if (chosen) {
                  stateClass = " pvp-quiz-opt--picked";
                }
                return (
                  <button
                    key={oi}
                    type="button"
                    className={`pvp-quiz-opt${stateClass}`}
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
        <div className="pvp-quiz-result">
          <p className="pvp-quiz-result-score">
            {isSaving ? "GUARDANDO…" : `RESPONDISTE ${score} DE ${preguntas.length} CORRECTAMENTE`}
          </p>
          {!isSaving && stats && stats.count > 0 && (
            <p className="pvp-quiz-result-stat">
              El promedio del resto de los invitados ({stats.count}) es del {stats.avg}%.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function PvpInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="pvp-bank-row">
      <div style={{ minWidth: 0, flex: 1 }}>
        <span className="pvp-bank-row-label">{label}</span>
        <span className="pvp-bank-row-value">{value}</span>
      </div>
    </div>
  );
}

function PvpCoverHalf({
  namesRef,
  kickerRef,
  perfRef,
  kickerText,
  namesTitle,
  fechaCorta,
  passNumber,
  dressCode,
  hora,
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
  children: React.ReactNode;
}) {
  return (
    <div className="pvp-cover-inner">
      <div className="pvp-cover-glow" />
      <div className="pvp-cover-grid" />
      <div className="pvp-cover-content">
        <div className="pvp-cover-top-row">
          <span>PASE Nº {passNumber}</span><span className="pvp-accent-serif-2">ADMIT ONE</span>
        </div>
        <div className="pvp-cover-center">
          <span ref={kickerRef} className="pvp-cover-kicker">{kickerText}</span>
          <h1 ref={namesRef} className="pvp-cover-names">{namesTitle}</h1>
          <span className="pvp-cover-rule" />
          <span className="pvp-cover-date">{fechaCorta}</span>
        </div>
        <div className="pvp-cover-bottom">
          <div ref={perfRef} className="pvp-perf-strip pvp-perf-strip--reveal" />
          <div className="pvp-cover-facts">
            {dressCode && <span>{dressCode.toUpperCase()}</span>}
            <span>{hora} H</span>
          </div>
          {children}
          <div className="pvp-barcode-wrap">
            <div className="pvp-barcode" style={{ width: "62%" }} />
            <span className="pvp-mini-label" style={{ color: "#56534A" }}>NO TRANSFERIBLE</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Hoja de estilos (traslada 1:1 los tokens visuales del diseño aprobado)
// ---------------------------------------------------------------------
const PVP_CSS = `
  .pvp-scroller { position: absolute; inset: 0; overflow-y: auto; overflow-x: hidden; opacity: 0; transition: opacity 900ms ease 260ms; scrollbar-width: none; }
  .pvp-scroller::-webkit-scrollbar { width: 0; height: 0; }

  a { color: #C8A45C; text-decoration: none; }
  a:hover { color: #E8D6A8; }

  @keyframes gpFoil { to { transform: rotate(360deg); } }
  @keyframes gpRing { to { transform: rotate(360deg); } }
  @keyframes gpRingRev { to { transform: rotate(-360deg); } }
  @keyframes gpScan { 0% { transform: translateY(0); opacity: 0; } 12% { opacity: .85; } 88% { opacity: .85; } 100% { transform: translateY(320px); opacity: 0; } }
  @keyframes gpEq { 0%,100% { transform: scaleY(.25); } 50% { transform: scaleY(1); } }
  @keyframes gpHint { 0%,100% { transform: translateY(0); } 50% { transform: translateY(7px); } }
  @keyframes gpSide { 0%,100% { transform: translateX(0); } 50% { transform: translateX(7px); } }
  @media (prefers-reduced-motion: reduce) { .pvp-scroller * { animation: none !important; } }

  .pvp-section { min-height: calc(var(--vh, 1vh) * 100); position: relative; display: flex; flex-direction: column; justify-content: center; gap: 30px; padding: 96px max(30px, calc((100% - 560px) / 2)) 110px max(24px, calc((100% - 560px) / 2)); overflow: hidden; }
  .pvp-section--between { justify-content: space-between; }

  .pvp-kicker { font-size: 9.5px; letter-spacing: 0.34em; color: #8A8577; }

  .pvp-date-stack { display: flex; flex-direction: column; gap: 2px; }
  .pvp-date-num { font-family: var(--pvp-bodoni), serif; font-size: clamp(66px, 23vw, 140px); line-height: 0.82; letter-spacing: -0.04em; }
  .pvp-date-num--right { text-align: right; line-height: 0.86; }
  .pvp-date-month { font-family: var(--pvp-bodoni), serif; font-style: italic; font-size: clamp(50px, 18vw, 104px); line-height: 0.9; color: #C8A45C; padding-left: 12%; }

  .pvp-divider { display: flex; align-items: center; gap: 16px; font-size: 10px; letter-spacing: 0.26em; color: #8A8577; }
  .pvp-divider-line { width: 52px; height: 1px; background: #C8A45C; display: inline-block; }
  .pvp-divider-line--long { width: 64px; }

  .pvp-lead { margin: 0; font-family: var(--pvp-bodoni), serif; font-style: italic; font-size: 20px; line-height: 1.4; color: #A8A292; max-width: 330px; }
  .pvp-cal-link { display: inline-flex; align-items: center; gap: 7px; margin-top: 4px; font-family: var(--pvp-mono), monospace; font-size: 10px; letter-spacing: 0.24em; text-transform: uppercase; color: #8A8577; text-decoration: none; transition: color 200ms ease; }
  .pvp-cal-link:hover { color: #C8A45C; }

  .pvp-medallion { position: relative; }
  .pvp-medallion--corner { position: absolute; right: max(32px, calc((100% - 560px) / 2)); top: 12%; width: clamp(86px, 22vw, 116px); aspect-ratio: 1; }
  .pvp-medallion--lg { width: clamp(130px, 34vw, 178px); aspect-ratio: 1; margin: 0 auto; }
  .pvp-medallion--final { width: clamp(104px, 26vw, 132px); aspect-ratio: 1; margin: -12px auto 0; }
  .pvp-medallion-ring { position: absolute; inset: 0; border-radius: 50%; background: conic-gradient(from 0deg, #E8123A, #4E7F86, #C8A45C, #E8D6A8, #E8123A); filter: saturate(.75); }
  .pvp-medallion-core { position: absolute; inset: 3px; border-radius: 50%; background: #0C0C11; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; text-align: center; padding: 6px; }
  .pvp-medallion-label { font-family: var(--pvp-bodoni), serif; font-size: 26px; line-height: 1; color: #E8D6A8; }
  .pvp-medallion-label-sm { font-family: var(--pvp-bodoni), serif; font-size: 16px; color: #E8D6A8; }
  .pvp-medallion-sub { font-size: 6.5px; letter-spacing: 0.24em; color: #8A8577; }
  .pvp-medallion-sub--accent { color: #C8A45C; }
  .pvp-medallion-arc { position: absolute; inset: -14%; }
  .pvp-medallion-arc-text { font-size: 7px; letter-spacing: 1.6px; fill: #C8A45C; opacity: 0.4; font-family: var(--pvp-mono), monospace; }

  .pvp-scan-grid { position: absolute; inset: 0; background: repeating-linear-gradient(0deg, rgba(200,164,92,0.06) 0 1px, transparent 1px 5px); pointer-events: none; }
  .pvp-scanline { position: absolute; left: 0; right: 0; top: 30%; height: 2px; background: linear-gradient(90deg, transparent, #E8D6A8, transparent); animation: gpScan 6s linear infinite; pointer-events: none; }

  .pvp-cd-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; position: relative; }
  .pvp-cd-box { border: 1px solid #2A2417; background: rgba(20,20,27,0.72); padding: 18px 15px; display: flex; flex-direction: column; gap: 6px; overflow: hidden; }
  .pvp-cd-num { font-family: var(--pvp-bodoni), serif; font-size: clamp(48px, 14vw, 80px); line-height: 0.82; color: #F6EFDD; display: inline-block; }
  .pvp-cd-label { font-size: 9px; letter-spacing: 0.3em; color: #C8A45C; }
  .pvp-perf-strip { height: 12px; position: relative; background: radial-gradient(circle at 6px 50%, #08080B 3.4px, transparent 3.8px) 0 0/12px 12px repeat-x; opacity: .85; }
  .pvp-perf-strip--reveal { clip-path: inset(0 100% 0 0); transition: clip-path 900ms cubic-bezier(.16,1,.3,1) 500ms; }

  .pvp-glow-blob { position: absolute; right: -26%; top: 4%; width: 82vw; max-width: 540px; aspect-ratio: 1; border-radius: 50%; background: conic-gradient(from 200deg, rgba(110,90,168,0.5), rgba(78,127,134,0.32), rgba(200,164,92,0.46), rgba(110,90,168,0.5)); filter: blur(80px); opacity: .4; animation: gpFoil 30s linear infinite; }
  .pvp-phrase { margin: 0; position: relative; font-family: var(--pvp-bodoni), serif; font-weight: 400; font-size: clamp(50px, 15vw, 96px); line-height: 0.92; letter-spacing: -0.03em; }
  .pvp-accent-italic { font-style: italic; color: #C8A45C; }
  .pvp-accent-serif { font-style: italic; color: #8C6F35; font-family: var(--pvp-bodoni), serif; }
  .pvp-accent-serif-2 { color: #8C6F35; }
  .pvp-h2 { margin: 0; font-family: var(--pvp-bodoni), serif; font-weight: 400; font-size: clamp(40px, 12vw, 68px); line-height: 0.96; }

  .pvp-pan { height: 260vh; position: relative; }
  .pvp-pan-sticky { position: sticky; top: 0; height: calc(var(--vh, 1vh) * 100); overflow: hidden; }
  .pvp-strip { position: absolute; top: 0; left: 0; height: 100%; display: flex; width: 300vw; will-change: transform; }
  .pvp-panel { flex: 0 0 100vw; min-width: 0; height: 100%; box-sizing: border-box; position: relative; overflow: hidden; display: flex; flex-direction: column; padding: 84px max(24px, calc((100vw - 560px) / 2)) 100px; gap: 22px; }
  .pvp-panel--between { justify-content: space-between; }
  .pvp-panel--end { justify-content: flex-end; }
  .pvp-panel--center { align-items: center; justify-content: center; text-align: center; }
  .pvp-panel--gap { gap: clamp(14px, 2.4vh, 22px); padding: clamp(52px, 9vh, 84px) max(24px, calc((100vw - 600px) / 2)) clamp(62px, 11vh, 100px); }
  .pvp-hair-bg { position: absolute; inset: 0; background: repeating-linear-gradient(90deg, rgba(20,20,27,0.05) 0 1px, transparent 1px 26px); pointer-events: none; }
  .pvp-panel-top { position: relative; display: flex; justify-content: space-between; font-size: 9.5px; letter-spacing: 0.32em; color: #7C7768; }
  .pvp-panel-title { margin: 0; position: relative; font-family: var(--pvp-bodoni), serif; font-weight: 400; font-size: clamp(46px, 13.5vw, 76px); line-height: 0.92; }
  .pvp-panel-title-md { margin: 0; position: relative; font-family: var(--pvp-bodoni), serif; font-weight: 400; font-size: clamp(42px, 12.5vw, 64px); line-height: 0.94; }
  .pvp-panel-title-sm { margin: 0; font-family: var(--pvp-bodoni), serif; font-size: clamp(34px, 10vw, 52px); line-height: 1; }
  .pvp-panel-block { position: relative; display: flex; flex-direction: column; gap: 12px; }
  .pvp-mini-label { font-size: 9px; letter-spacing: 0.26em; color: #7C7768; }
  .pvp-facts { position: relative; display: flex; flex-direction: column; gap: 12px; font-size: 11px; letter-spacing: 0.14em; color: #4A473F; }
  .pvp-facts-row { display: flex; justify-content: space-between; border-bottom: 1px solid #D6D1C4; padding-bottom: 10px; }
  .pvp-facts-row--last { border-bottom: none; padding-bottom: 0; }
  .pvp-seguir { position: relative; display: flex; align-items: center; gap: 10px; font-size: 9px; letter-spacing: 0.26em; color: #8C6F35; margin-top: auto; }
  .pvp-seguir--split { justify-content: space-between; }
  .pvp-side-hint { display: inline-block; animation: gpSide 2.2s ease-in-out infinite; }
  .pvp-route-svg { position: absolute; inset: 0; width: 100%; height: 100%; }
  .pvp-link-cta { font-size: 10px; letter-spacing: 0.24em; color: #8C6F35; }

  .pvp-crono { position: relative; display: flex; flex-direction: column; gap: 8px; margin-top: 4px; }
  .pvp-crono-row { display: flex; align-items: baseline; gap: 14px; font-size: 11px; letter-spacing: 0.1em; color: #4A473F; border-bottom: 1px solid #D6D1C4; padding-bottom: 8px; }
  .pvp-crono-time { font-family: var(--pvp-mono), monospace; color: #8C6F35; min-width: 42px; }
  .pvp-crono-title { flex: 1; }

  .pvp-dots { position: absolute; left: 0; right: 34px; bottom: 26px; display: flex; gap: 6px; justify-content: center; z-index: 2; }
  .pvp-dot { width: 22px; height: 2px; background: rgba(20,20,27,0.18); transition: background 400ms ease; display: inline-block; }

  .pvp-stub { position: relative; overflow: hidden; border: 1px solid #2A2417; background: rgba(20,20,27,0.7); padding: 20px; display: flex; flex-direction: column; gap: 16px; transition: border-color 600ms ease, box-shadow 600ms ease; }
  .pvp-stub-top { display: flex; justify-content: space-between; font-size: 9px; letter-spacing: 0.24em; color: #8A8577; }
  .pvp-stub-status { color: #6E6A5D; transition: color 400ms ease; }
  .pvp-seal { width: 62px; aspect-ratio: 1; position: relative; opacity: .25; transform: scale(.86); transition: opacity 700ms ease, transform 700ms cubic-bezier(.16,1,.3,1); align-self: center; }
  .pvp-beam { position: absolute; left: 0; right: 0; top: 0; height: 2px; background: linear-gradient(90deg, transparent, #E8D6A8, transparent); opacity: 0; transition: transform 900ms cubic-bezier(.16,1,.3,1), opacity 300ms ease; }

  .pvp-rsvp { display: flex; flex-direction: column; gap: 22px; width: 100%; max-width: 420px; font-family: var(--pvp-mono), monospace; }
  .pvp-rsvp-rows { display: flex; flex-direction: column; }
  .pvp-rsvp-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 0; border-bottom: 1px solid rgba(200,164,92,0.18); font-size: 10.5px; letter-spacing: 0.18em; color: #8A8577; }
  .pvp-rsvp-row > span:first-child { flex-shrink: 0; }
  .pvp-rsvp-row > span:last-child { color: #F4F1EA; letter-spacing: 0.02em; text-align: right; }
  .pvp-rsvp-row--payment { align-items: flex-start; }
  .pvp-rsvp-payment-value { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
  .pvp-rsvp-payment-total { color: #E8D6A8; font-size: 13px; letter-spacing: 0.02em; font-weight: 600; }
  .pvp-rsvp-payment-detail { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; font-size: 9px; letter-spacing: 0.05em; color: #8A8577; }
  .pvp-rsvp-stepper { display: flex; align-items: center; gap: 12px; }
  .pvp-rsvp-stepper button { width: 26px; height: 26px; border-radius: 50%; border: 1px solid #C8A45C; background: transparent; color: #C8A45C; font-size: 14px; line-height: 1; cursor: pointer; }
  .pvp-rsvp-stepper button:disabled { opacity: 0.3; cursor: default; }
  .pvp-rsvp-stepper span { font-family: var(--pvp-mono), monospace; color: #F4F1EA; min-width: 20px; text-align: center; }
  .pvp-rsvp-input { background: transparent; border: none; border-bottom: 1px solid rgba(200,164,92,0.3); color: #F4F1EA; font-family: var(--pvp-mono), monospace; font-size: 11px; letter-spacing: 0.02em; padding: 4px 2px; text-align: right; max-width: 55%; }
  .pvp-rsvp-input::placeholder { color: #6E6A5D; }
  .pvp-rsvp-input:focus { outline: none; border-bottom-color: #C8A45C; }
  .pvp-rsvp-btn { width: 100%; padding: 16px; font-family: var(--pvp-mono), monospace; font-size: 11px; font-weight: 600; letter-spacing: 0.22em; text-transform: uppercase; background: linear-gradient(180deg, #E8D6A8, #C8A45C); border: 1px solid #C8A45C; color: #0B0B10; cursor: pointer; }
  .pvp-rsvp-btn:disabled { opacity: 0.6; cursor: default; }
  .pvp-rsvp-btn--ghost { background: transparent; color: #C8A45C; }
  .pvp-rsvp-error { font-size: 10px; letter-spacing: 0.06em; color: #C8A45C; margin: 0; }
  .pvp-rsvp-declined { display: flex; flex-direction: column; gap: 18px; align-items: center; text-align: center; max-width: 380px; }
  .pvp-rsvp-declined-text { margin: 0; font-family: var(--pvp-bodoni), serif; font-style: italic; font-size: 18px; line-height: 1.4; color: #A8A292; }

  .pvp-upload-wrap { flex: 1; min-height: 0; overflow-y: auto; }
  .pvp-album-embed { flex: 1; min-height: 0; overflow-y: auto; }
  .pvp-live-placeholder { flex: 1; display: flex; align-items: center; justify-content: center; text-align: center; padding: 24px; border: 1px dashed rgba(20,20,27,0.2); }
  .pvp-photo-placeholder { position: relative; font-size: 8.5px; letter-spacing: 0.16em; color: #6E6A5D; }

  .pvp-mosaic { position: relative; flex: 1; min-height: 0; display: grid; grid-template-columns: repeat(3, 1fr); grid-auto-rows: auto; grid-auto-flow: dense; align-content: start; gap: 10px; }
  .pvp-mosaic-cell--featured { grid-column: span 2; grid-row: span 2; cursor: pointer; }
  .pvp-mosaic-cell { position: relative; height: 0; padding-top: 100%; background: repeating-linear-gradient(135deg, #DCD7CB 0 6px, #E9E5DC 6px 12px); overflow: hidden; cursor: pointer; }
  .pvp-mosaic-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }

  .pvp-bank-wrap { position: relative; display: flex; flex-direction: column; gap: 14px; width: 100%; max-width: 420px; margin: 0; }
  .pvp-bank-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid rgba(200,164,92,0.18); }
  .pvp-bank-row:last-child { border-bottom: none; }
  .pvp-bank-row-label { display: block; font-size: 9px; letter-spacing: 0.2em; color: #8A8577; margin-bottom: 3px; }
  .pvp-bank-row-value { font-size: 12px; color: #F4F1EA; word-break: break-all; }
  .pvp-bank-copy { flex-shrink: 0; font-family: var(--pvp-mono), monospace; font-size: 10px; letter-spacing: 0.1em; padding: 7px 12px; border: 1px solid #C8A45C; background: transparent; color: #C8A45C; cursor: pointer; }
  .pvp-bank-copy:hover { background: rgba(200,164,92,0.12); }

  .pvp-eq { display: flex; align-items: flex-end; gap: 5px; height: 52px; }
  .pvp-eq-bar { width: 4px; height: 100%; transform-origin: bottom; animation: gpEq 1.1s ease-in-out infinite; display: inline-block; }
  .pvp-song-wrap { font-family: var(--pvp-mono), monospace; }

  .pvp-song { position: relative; width: 100%; max-width: 420px; margin: 0 auto; }
  .pvp-song-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; border-bottom: 1px solid rgba(200,164,92,0.3); padding-bottom: 12px; }
  .pvp-song-inputs { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; font-size: 10px; letter-spacing: 0.24em; color: #8A8577; text-transform: uppercase; }
  .pvp-song-input { background: transparent; border: none; border-bottom: 1px solid rgba(200,164,92,0.3); color: #F4F1EA; font-family: var(--pvp-mono), monospace; font-size: 12px; padding: 6px 2px; min-width: 0; flex: 1; }
  .pvp-song-input::placeholder { color: #6E6A5D; }
  .pvp-song-input:focus { outline: none; border-bottom-color: #C8A45C; }
  .pvp-song-sep { color: #8A8577; flex-shrink: 0; }
  .pvp-song-submit { flex-shrink: 0; background: none; border: none; color: #C8A45C; font-family: var(--pvp-mono), monospace; font-size: 10px; letter-spacing: 0.2em; cursor: pointer; }
  .pvp-song-submit:hover { color: #E8D6A8; }
  .pvp-song-submit:disabled { color: #6E6A5D; cursor: default; }
  .pvp-song-error { font-size: 10px; color: #C8A45C; margin-top: 6px; }
  .pvp-song-list { display: flex; flex-direction: column; margin-top: 14px; max-height: 180px; overflow-y: auto; }
  .pvp-song-item { display: flex; flex-direction: column; gap: 3px; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06); font-family: var(--pvp-mono), monospace; }
  .pvp-song-item-title { font-size: 11.5px; letter-spacing: 0.04em; color: #F4F1EA; }
  .pvp-song-item-by { font-size: 9.5px; letter-spacing: 0.1em; color: #6E6A5D; }

  .pvp-quiz { display: flex; flex-direction: column; gap: 28px; width: 100%; max-width: 460px; }
  .pvp-quiz-q { display: flex; flex-direction: column; gap: 14px; }
  .pvp-quiz-q-num { font-family: var(--pvp-mono), monospace; font-size: 10px; letter-spacing: 0.24em; color: #8A8577; }
  .pvp-quiz-q-text { margin: 0; font-family: var(--pvp-bodoni), serif; font-size: clamp(18px, 4vw, 22px); line-height: 1.3; color: #F4F1EA; }
  .pvp-quiz-opts { display: flex; flex-wrap: wrap; gap: 10px; }
  .pvp-quiz-opt { font-family: var(--pvp-mono), monospace; font-size: 11px; letter-spacing: 0.06em; padding: 10px 16px; border: 1px solid rgba(200,164,92,0.4); background: transparent; color: #C8A45C; cursor: pointer; transition: background 160ms ease, color 160ms ease, border-color 160ms ease; }
  .pvp-quiz-opt:disabled { cursor: default; }
  .pvp-quiz-opt--picked { background: #C8A45C; border-color: #C8A45C; color: #0B0B10; }
  .pvp-quiz-opt--correct { background: #C8A45C; border-color: #C8A45C; color: #0B0B10; }
  .pvp-quiz-opt--wrong { border-color: #8A6A6A; color: #C99; opacity: 0.6; }
  .pvp-quiz-result { padding-top: 18px; border-top: 1px solid rgba(200,164,92,0.2); }
  .pvp-quiz-result-score { margin: 0 0 6px; font-family: var(--pvp-mono), monospace; font-size: 11px; letter-spacing: 0.16em; color: #E8D6A8; }
  .pvp-quiz-result-stat { margin: 0; font-size: 11.5px; line-height: 1.5; color: #A8A292; }

  .pvp-final-card { border: 1px solid #C8A45C; padding: 30px 24px; display: flex; flex-direction: column; gap: 22px; align-items: center; text-align: center; position: relative; }
  .pvp-final-names { font-family: var(--pvp-bodoni), serif; font-size: clamp(34px, 10vw, 46px); line-height: .9; color: #F6EFDD; }
  .pvp-barcode { height: 26px; background: repeating-linear-gradient(90deg, #6E6A5D 0 2px, transparent 2px 4px, #6E6A5D 4px 5px, transparent 5px 9px, #6E6A5D 9px 11px, transparent 11px 14px); }
  .pvp-final-footer { display: flex; justify-content: space-between; align-items: center; font-size: 9px; letter-spacing: 0.24em; color: #56534A; }
  .pvp-replay { cursor: pointer; color: #C8A45C; }
  .pvp-footer-credit { display: flex; justify-content: center; padding-top: 8px; opacity: 0.7; }

  .pvp-rail { position: absolute; right: 0; top: 0; bottom: 0; width: 34px; z-index: 4; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 20px 0; opacity: 0; transition: opacity 700ms ease; pointer-events: none; border-left: 1px solid rgba(200,164,92,0.14); }
  .pvp-rail-top { writing-mode: vertical-rl; font-size: 8px; letter-spacing: 0.34em; color: #8A8577; transition: color 500ms ease; }
  .pvp-rail-line { flex: 1; width: 1px; margin: 16px 0; background: rgba(200,164,92,0.16); position: relative; }
  .pvp-rail-bar { position: absolute; left: -1px; top: 0; width: 3px; height: 0%; background: linear-gradient(#E8D6A8, #C8A45C); transition: height 260ms linear; display: block; }
  .pvp-rail-label { writing-mode: vertical-rl; font-size: 8px; letter-spacing: 0.34em; color: #C8A45C; transition: color 500ms ease; }

  .pvp-cover { position: absolute; inset: 0; z-index: 5; }
  .pvp-cover-half { position: absolute; left: 0; right: 0; height: 50%; overflow: hidden; transition: transform 1100ms cubic-bezier(.7,0,.2,1); }
  .pvp-cover-half--top { top: 0; }
  .pvp-cover-half--bottom { bottom: 0; }
  .pvp-cover-inner { position: absolute; left: 0; right: 0; top: 0; height: 200%; overflow: hidden; background: radial-gradient(120% 70% at 50% 8%, #1A1726 0%, #0B0B10 46%, #08080B 100%); }
  .pvp-cover-half--bottom .pvp-cover-inner { top: auto; bottom: 0; }
  .pvp-cover-glow { position: absolute; left: 50%; top: 6%; width: 190%; aspect-ratio: 1; transform: translate(-50%, -14%); border-radius: 50%; background: conic-gradient(from 200deg, rgba(232,18,58,0.55), rgba(78,127,134,0.4), rgba(200,164,92,0.7), rgba(232,18,58,0.55)); filter: blur(64px); opacity: .62; animation: gpFoil 26s linear infinite; }
  /* Grilla fina tipo papel de ticket/boletería (ver comentario al inicio del
     archivo) -- reemplaza a propósito el patrón de rayos en abanico
     ("sunburst") que el mockup original comparte 1:1 con Guest Pass VIP, para
     que esta plantilla tenga su propia textura de tapa. */
  .pvp-cover-grid { position: absolute; inset: 0; background: repeating-linear-gradient(0deg, rgba(232,214,168,0.14) 0 1px, transparent 1px 7px), repeating-linear-gradient(90deg, rgba(232,214,168,0.1) 0 1px, transparent 1px 7px); opacity: .3; -webkit-mask-image: radial-gradient(closest-side at 50% 44%, #000 14%, rgba(0,0,0,0.5) 46%, transparent 82%); mask-image: radial-gradient(closest-side at 50% 44%, #000 14%, rgba(0,0,0,0.5) 46%, transparent 82%); }
  .pvp-cover-content { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: space-between; padding: 24px max(24px, calc((100% - 440px) / 2)) 26px; }
  .pvp-cover-top-row { display: flex; justify-content: space-between; font-size: 9.5px; letter-spacing: 0.24em; color: #8A8577; }
  .pvp-cover-center { display: flex; flex-direction: column; align-items: center; gap: clamp(10px, 2.2vh, 22px); text-align: center; }
  .pvp-cover-kicker { font-size: 9.5px; letter-spacing: 0.34em; color: #8A8577; }
  .pvp-cover-names { margin: 0; font-family: var(--pvp-bodoni), serif; font-weight: 400; font-size: min(clamp(48px, 16vw, 96px), 12.5vh); line-height: 0.86; letter-spacing: -0.02em; color: #F6EFDD; }
  .pvp-cover-rule { width: 1px; height: clamp(16px, 4vh, 44px); background: linear-gradient(#C8A45C, transparent); display: block; }
  .pvp-cover-date { font-size: 11.5px; letter-spacing: 0.3em; color: #A8A292; white-space: nowrap; }
  .pvp-cover-bottom { display: flex; flex-direction: column; gap: clamp(12px, 2.4vh, 22px); }
  .pvp-cover-facts { display: flex; justify-content: space-between; font-size: 9px; letter-spacing: 0.2em; color: #6E6A5D; }
  .pvp-cover-cta { border: 1px solid #C8A45C; background: linear-gradient(100deg, rgba(200,164,92,0.08), rgba(232,214,168,0.2), rgba(200,164,92,0.08)); color: #F6EFDD; font-family: var(--pvp-mono), monospace; font-size: 12px; letter-spacing: 0.26em; padding: clamp(13px, 2.1vh, 19px) 0; text-align: center; width: 100%; }
  .pvp-cover-cta--btn { cursor: pointer; border-radius: 0; }
  @media (hover: hover) {
    .pvp-cover-cta--btn:hover { background: linear-gradient(100deg, rgba(232,214,168,0.34), rgba(246,239,221,0.5), rgba(232,214,168,0.34)); color: #0B0B0F; }
  }
  .pvp-barcode-wrap { display: flex; flex-direction: column; align-items: center; gap: 10px; }

  .pvp-hint { position: absolute; left: 0; right: 34px; bottom: 18px; z-index: 6; text-align: center; font-size: 9px; letter-spacing: 0.28em; color: #8A8577; opacity: 0; transition: opacity 600ms ease; pointer-events: none; animation: gpHint 2.4s ease-in-out infinite; }

  .pvp-lightbox { position: fixed; inset: 0; z-index: 200; background: rgba(8,8,11,0.96); display: flex; align-items: center; justify-content: center; padding: 24px; cursor: zoom-out; }
  .pvp-lightbox-close { position: absolute; top: 20px; right: 20px; width: 36px; height: 36px; border-radius: 50%; border: 1px solid #C8A45C; background: rgba(0,0,0,0.4); color: #F4F1EA; font-size: 18px; line-height: 1; cursor: pointer; display: flex; align-items: center; justify-content: center; }
  .pvp-lightbox-img { max-width: 100%; max-height: 88vh; object-fit: contain; cursor: default; }
`;
