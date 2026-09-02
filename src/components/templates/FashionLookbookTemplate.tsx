"use client";

/**
 * FashionLookbookTemplate.tsx
 *
 * Portado 1:1 desde el diseño "Fashion Lookbook" (Colección Storytelling,
 * quince años: fondo negro editorial, acento rojo escarlata + dorado sutil en
 * los CTA, Archivo Black + IBM Plex Mono, medallón "LOOK Nº 015" en vez de
 * tiara/corona, tarjeta-stub tipo backstage pass, scroll horizontal
 * "pineado" para Cuándo y dónde / Álbum, riel lateral de progreso y portada
 * que se abre en dos mitades). Misma arquitectura que PrincesaTemplate.tsx
 * (ver ese archivo para el detalle del motor de motion) -- todo el motion es
 * CSS + SVG + un loop de scroll propio, cero PNGs.
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
import { AnimatedCoverPhoto, COVER_RESPONSIVE_STYLE } from "@/components/invitation/v2/AnimatedCoverPhoto";
import { toEmbedMapUrl } from "@/lib/google-maps";
import { resolveGuestNameDisplay } from "@/lib/invitation-copy";
import { useMusicPlayer, MusicToggleButton } from "@/components/invitation/MusicPlayer";
import { BankDetailsCard } from "@/components/invitation/v2/BankDetailsCard";
import { InfoAdicionalSection } from "@/components/invitation/v2/InfoAdicionalSection";
import { CreditCard, Gift } from "lucide-react";
import { createPortal } from "react-dom";

const flbArchivo = Archivo_Black({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--flb-archivo",
  display: "swap",
});

const flbMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--flb-mono",
  display: "swap",
});

// Tonos claros que rotan entre hojas del álbum -- son EXACTAMENTE los del
// mockup ("Álbum de fotos" / "Espacio reservado" / "El día después").
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

interface FlbQuizQuestion {
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

interface FashionLookbookTemplateProps {
  invitation: Record<string, unknown>;
  guest?: GuestRecord | null;
  isPersonalized?: boolean;
}

// El backend no reserva mesas/sectores -- el medallón muestra el orden real
// del invitado (001, 002...) como "LOOK Nº 015" en vez de un número inventado.
function passNumberFrom(orderNumber: number | undefined): string {
  if (!orderNumber) return "---";
  return String(orderNumber).padStart(3, "0");
}

export function FashionLookbookTemplate({ invitation, guest, isPersonalized = false }: FashionLookbookTemplateProps) {
  const nombreQuinceanera = String(invitation.nombreQuinceanera || invitation.nombreEvento || "");
  const namesTitle = nombreQuinceanera || "Mis quince";

  // "Saludar por nombre del invitado/familia": si está activo, la portada
  // saluda con el nombre del invitado/familia en vez de la quinceañera.
  const showGuestNameInCover = Boolean(guest?.name) && invitation.mostrarNombreInvitadoEnSaludo !== false;
  const coverGuestName = resolveGuestNameDisplay(invitation, guest);
  const coverKickerText = showGuestNameInCover ? "CASTING ABIERTO PARA" : "CASTING ABIERTO PARA LOS 15 DE";
  const coverNamesTitle: React.ReactNode = showGuestNameInCover ? coverGuestName : namesTitle;

  const fechaEvento = invitation.fechaEvento ? new Date(String(invitation.fechaEvento)) : new Date();
  const hora = String(invitation.hora ?? "19:00");
  const [hh, mm] = hora.split(":").map((n) => parseInt(n, 10) || 0);

  const eventDateTime = new Date(fechaEvento);
  eventDateTime.setHours(hh, mm, 0, 0);

  const dayNum = String(fechaEvento.getDate()).padStart(2, "0");
  const monthNum = String(fechaEvento.getMonth() + 1).padStart(2, "0");
  const monthAbbr = fechaEvento.toLocaleDateString("es-AR", { month: "short" }).replace(".", "").toLowerCase();
  const weekday = fechaEvento.toLocaleDateString("es-AR", { weekday: "long" }).toUpperCase();
  const yearShort = String(fechaEvento.getFullYear()).slice(-2);
  const fechaCorta = `${dayNum} · ${monthNum} · ${fechaEvento.getFullYear()}`;
  const fechaCompacta = `${dayNum}.${monthNum}.${yearShort}`;

  const lugarNombre = String(invitation.lugarNombre ?? "");
  const direccion = String(invitation.direccion ?? "");
  const mapUrl = String(invitation.mapUrl ?? "");
  const embedMapUrl = mapUrl ? toEmbedMapUrl(mapUrl) : null;
  const dressCode = String(invitation.portadaDressCode ?? "");
  const portadaMensaje = String(
    invitation.portadaMensaje || "Guardá la fecha. Vos estás en el casting."
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

  // Portada de bienvenida y foto principal con foto real (ver rama
  // experimento-foto-storytelling). 100% opcionales: sin cargarlas, todo
  // se ve exactamente igual que antes.
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
  const triviaPreguntas: FlbQuizQuestion[] = safeJson<FlbQuizQuestion[]>(String(invitation.triviaPreguntas ?? ""), []);
  const triviaTitulo = String(invitation.triviaTitulo || "¿Cuánto sabés de mí?");
  const quizEnabled = triviaHabilitada && triviaPreguntas.length > 0;

  // Frase: elegible/personalizable desde el wizard (StepPhrase) -- si está
  // deshabilitada o no se cargó texto, la sección entera no se muestra (ver
  // hasFrase más arriba): no hay frase default hardcodeada como fallback,
  // si no se quiere frase no debe aparecer ninguna.
  const frase = hasFrase ? String(invitation.frasePersonalizadaTexto) : "";
  const fraseWords = frase.split(/\s+/).filter(Boolean);
  // Combinación de colores del diseño: primera mitad de la frase en color
  // plano, segunda mitad en rojo itálico, partiendo por la mitad de la
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

  // "CÓD. GDL27" del mockup -- iniciales del nombre + año corto del evento,
  // como un código de colección de moda.
  const nameInitials = (namesTitle.replace(/[^\p{L}]/gu, "").slice(0, 3).toUpperCase() || "LKB");
  const lookCode = `${nameInitials}${yearShort}`;

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
        statusRef.current.style.color = "#F5F2ED";
      }
      if (stubRef.current) {
        stubRef.current.style.borderColor = "#D93A2B";
        stubRef.current.style.boxShadow = "0 0 0 1px rgba(217,58,43,.35), 0 18px 50px -30px #D93A2B";
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
            dot.style.background = i === active ? "#0B0B0B" : "rgba(20,20,27,0.18)";
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
          if (railLabelRef.current) railLabelRef.current.style.color = light ? "#0B0B0B" : "#D93A2B";
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
      className={`${flbArchivo.variable} ${flbMono.variable}`}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "calc(var(--vh, 1vh) * 100)",
        overflow: "hidden",
        background: "#080808",
        fontFamily: "var(--flb-mono), monospace",
        color: "#F4F1EA",
      }}
    >
      <style>{FLB_CSS}</style>
      <style>{COVER_RESPONSIVE_STYLE}</style>

      <div ref={scrollerRef} data-scroller="1" className="flb-scroller">
        <section data-tone="dark" data-screen-label="Save the Date" className="flb-section">
          <span className="flb-watermark" aria-hidden="true">15</span>
          <div className="flb-grid-overlay" />
          <span data-xin="1" data-dist="-60" className="flb-kicker" style={{ position: "relative" }}>01 — GUARDÁ LA FECHA</span>
          <div className="flb-date-stack" style={{ position: "relative" }}>
            <span data-xin="1" data-delay="60" data-dist="-110" className="flb-date-num">{dayNum}</span>
            <span data-xin="1" data-delay="170" data-dist="140" className="flb-date-month">{monthAbbr}</span>
            <span data-xin="1" data-delay="280" data-dist="220" className="flb-date-num flb-date-num--right">
              {yearShort}
            </span>
          </div>
          <div data-xin="1" data-delay="380" data-dist="-80" className="flb-divider" style={{ position: "relative" }}>
            <span className="flb-divider-line" /><span>{weekday} · {hora} H</span>
          </div>
          <p data-xin="1" data-delay="460" className="flb-lead" style={{ position: "relative" }}>{portadaMensaje}</p>
          <AddToCalendarLink
            eventName={namesTitle}
            targetDate={eventDateTime}
            location={lugarNombre || direccion}
            description={portadaMensaje}
            className="flb-cal-link"
          />

          <div data-drift="-70" className="flb-medallion flb-medallion--corner">
            <FlbMedallion main="15" sub="ACCESO" arcId="flbArc1" arcText="LOOKBOOK SS27 · EDICIÓN ÚNICA · " spin="normal" />
          </div>
        </section>

        {/* Foto principal con efecto cinemático, sin tinte de color --
            ocupa toda la pantalla en mobile, se enmarca en desktop. */}
        {(photoMobile || photoDesktop) && (
          <section
            data-tone="dark"
            data-screen-label="Nuestra foto"
            className={`flb-hero-photo-section${!photoMobile ? " flb-hero-photo-section--no-mobile" : ""}${!photoDesktop ? " flb-hero-photo-section--no-desktop" : ""}`}
          >
            <div className="flb-hero-photo-frame">
              {photoMobile && (
                <div className="acp-mobile-only">
                  <AnimatedCoverPhoto photoSrc={photoMobile} tint={false} effect="enfoque" scrimColorRgb="8,8,11" />
                </div>
              )}
              {photoDesktop && (
                <div className="acp-desktop-only">
                  <AnimatedCoverPhoto photoSrc={photoDesktop} tint={false} effect="enfoque" scrimColorRgb="8,8,11" />
                </div>
              )}
            </div>
            <span data-xin="1" data-dist="-60" className="flb-kicker flb-hero-photo-kicker">02 — DETRÁS DE CÁMARA</span>
          </section>
        )}

        <section id="countdown" data-tone="dark" data-screen-label="Countdown" className="flb-section flb-section--between">
          <div className="flb-scan-grid" />
          <div className="flb-scanline" />
          <span data-xin="1" data-dist="-60" className="flb-kicker" style={{ position: "relative" }}>{knPre(2)} — LA CAMPAÑA SALE EN</span>
          <div className="flb-cd-grid">
            <FlbCdBox refEl={dRef} delay={40} dist={-90} label="DÍAS" />
            <FlbCdBox refEl={hRef} delay={120} dist={110} label="HORAS" />
            <FlbCdBox refEl={mRef} delay={200} dist={-140} label="MIN" />
            <FlbCdBox refEl={sRef} delay={280} dist={170} label="SEG" />
          </div>
          <div className="flb-perf-strip" />
        </section>

        {hasFrase && (
        <section id="quote" data-tone="dark" data-screen-label="Frase" className="flb-section">
          <div data-drift="-130" className="flb-glow-blob" />
          <span data-xin="1" data-dist="-60" className="flb-kicker" style={{ position: "relative" }}>{knPre(3)} — CUANDO LLEGUE A CERO</span>
          <h2 ref={phraseRef} className="flb-phrase" style={{ fontSize: fraseFontSize }}>
            {fraseWords.map((w, i) => (
              // El espacio va FUERA del span: el motor de reveal fuerza
              // `display:inline-block` en cada [data-w], y un espacio de fin
              // de línea DENTRO de un inline-block se colapsa a 0 -- como
              // texto suelto entre spans, en cambio, se renderiza normal.
              <span key={i}>
                <span data-w="1" className={i >= fraseAccentStart ? "flb-accent-italic" : undefined}>
                  {w}
                </span>{" "}
              </span>
            ))}
          </h2>
          <div data-xin="1" data-delay="120" data-dist="90" className="flb-divider" style={{ position: "relative" }}>
            <span className="flb-divider-line flb-divider-line--long" /><span>{fechaCorta} — {hora} H</span>
          </div>
        </section>
        )}

        <div data-pan="1" data-screen-label="Cuándo y dónde" className="flb-pan" style={ceremoniaHabilitada ? { height: "340vh" } : undefined}>
          <div className="flb-pan-sticky">
            <div data-strip="1" className="flb-strip">
              {ceremoniaHabilitada && (
                <div id="ceremonia" data-tone="light" className="flb-panel flb-panel--between" style={{ background: "#EFEBE1", color: "#14141B" }}>
                  <div className="flb-hair-bg" />
                  <div className="flb-panel-top">
                    <span>{kn(3)} — {ceremoniaTitulo.toUpperCase()}</span><span>01 / {LUGAR_PANEL_COUNT}</span>
                  </div>
                  <h2 className="flb-panel-title">
                    {ceremoniaNombre || ceremoniaTitulo}
                    {ceremoniaDireccion && <><br /><span className="flb-accent-red-serif">{ceremoniaDireccion}</span></>}
                  </h2>
                  <div className="flb-facts">
                    {ceremoniaHora && (
                      <div className="flb-facts-row flb-facts-row--last">
                        <span>HORARIO</span><span>{ceremoniaHora} H</span>
                      </div>
                    )}
                  </div>
                  {ceremoniaMapUrl && (
                    <a href={ceremoniaMapUrl} target="_blank" rel="noopener noreferrer" className="flb-link-cta">
                      ABRIR EN MAPAS →
                    </a>
                  )}
                  <div className="flb-seguir">SEGUÍ BAJANDO <span className="flb-side-hint">→</span></div>
                </div>
              )}

              <div id="details" data-tone="light" className="flb-panel flb-panel--between" style={{ background: "#EFEBE1", color: "#14141B" }}>
                <div className="flb-hair-bg" />
                <div className="flb-panel-top">
                  <span>{kn(3)} — CUÁNDO Y DÓNDE</span><span>{ceremoniaHabilitada ? "02" : "01"} / {LUGAR_PANEL_COUNT}</span>
                </div>
                <h2 className="flb-panel-title">
                  {lugarNombre || "El salón"}
                  {direccion && <><br /><span className="flb-accent-red-serif">{direccion}</span></>}
                </h2>
                <div className="flb-facts">
                  <div className="flb-facts-row">
                    <span>RECEPCIÓN</span><span>{hora} H</span>
                  </div>
                  {dressCode && (
                    <div className="flb-facts-row flb-facts-row--last">
                      <span>CÓDIGO</span><span className="flb-accent-plain">{dressCode.toUpperCase()}</span>
                    </div>
                  )}
                </div>
                {cronograma.length > 0 && (
                  <div className="flb-crono">
                    {cronograma.map((item, i) => (
                      <div key={i} className="flb-crono-row">
                        <span className="flb-crono-time">{item.time || ""}</span>
                        <span className="flb-crono-title">{item.title}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flb-seguir">SEGUÍ BAJANDO <span className="flb-side-hint">→</span></div>
              </div>

              <div data-tone="light" className="flb-panel flb-panel--end" style={{ background: "#E4DFD3", color: "#14141B" }}>
                <svg viewBox="0 0 300 500" preserveAspectRatio="none" className="flb-route-svg">
                  <path ref={routeRef} d="M18 468 C 130 400, 54 262, 152 220 S 254 140, 282 40" fill="none" stroke="#0B0B0B" strokeWidth={1.6} />
                  <circle cx={282} cy={40} r={5} fill="#0B0B0B" />
                </svg>
                <div className="flb-panel-block">
                  <span className="flb-mini-label">{ceremoniaHabilitada ? "03" : "02"} / {LUGAR_PANEL_COUNT}</span>
                  <span className="flb-panel-title-sm">Cómo llegar</span>
                  <span className="flb-mini-label">15 MIN DESDE EL CENTRO · ESTACIONAMIENTO EN EL PREDIO</span>
                  {mapUrl && (
                    <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="flb-link-cta">
                      ABRIR EN MAPAS →
                    </a>
                  )}
                </div>
              </div>

              <div data-tone="dark" className="flb-panel flb-panel--center" style={{ background: "#0B0B0B", color: "#F4F1EA" }}>
                <div className="flb-medallion flb-medallion--lg">
                  <FlbMedallion kicker="SECTOR" main="Pasarela" sub="LOOK 04" subColor="#D93A2B" arcId="flbArc2" arcText={`ACCESO VIP · LOOK Nº ${passNumber} · `} spin="reverse" />
                </div>
                <span className="flb-mini-label flb-mini-label--dark">{LUGAR_PANEL_COUNT} / {LUGAR_PANEL_COUNT} — TU UBICACIÓN</span>
              </div>
            </div>
            <FlbDots count={LUGAR_PANEL_COUNT} />
          </div>
        </div>

        <section data-tone="dark" data-screen-label="Check-in" className="flb-section">
          <span data-xin="1" data-dist="-60" className="flb-kicker">{kn(4)} — CHECK-IN</span>
          <h2 data-xin="1" data-delay="80" data-dist="130" className="flb-h2">
            Confirmá<br /><span className="flb-accent-italic">tu acceso</span>
          </h2>

          {rsvpEnabled ? (
            <div data-xin="1" data-delay="170" data-dist="-90" className="flb-rsvp">
              <FlbRsvpCard
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
            <p className="flb-lead">La confirmación de asistencia está cerrada por el momento.</p>
          )}
        </section>

        <div id="album" data-pan="1" data-screen-label="Álbum" className="flb-pan">
          <div className="flb-pan-sticky">
            <div data-strip="1" className="flb-strip">
              {photoPages.map((page, pageIndex) => (
                <div key={pageIndex} data-tone="light" className="flb-panel flb-panel--gap" style={{ background: ALBUM_TONES[pageIndex % ALBUM_TONES.length], color: "#14141B" }}>
                  <div className="flb-hair-bg" />
                  <div className="flb-panel-top">
                    <span>{kn(5)} — ARCHIVO / {String(allPhotos.length).padStart(3, "0")}</span><span>HOJA {String(pageIndex + 1).padStart(2, "0")} / {String(photoPages.length).padStart(2, "0")}</span>
                  </div>
                  {pageIndex === 0 && <h2 className="flb-panel-title-md">Álbum <span className="flb-accent-mono">de fotos</span></h2>}
                  <div className="flb-mosaic">
                    {page.length > 0 ? page.map((url, i) => (
                      <div
                        key={i}
                        className={`flb-mosaic-cell${i === 0 ? " flb-mosaic-cell--featured" : ""}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => setExpandedPhoto(url)}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setExpandedPhoto(url); }}
                        aria-label={`Ampliar foto ${i + 1}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" className="flb-mosaic-img" />
                      </div>
                    )) : (
                      <span className="flb-photo-placeholder">Sin fotos todavía</span>
                    )}
                  </div>
                  <div className="flb-seguir flb-seguir--split">
                    <span>{allPhotos.length} FOTOS SUBIDAS</span>
                    <span className="flb-accent-plain">SEGUÍ →</span>
                  </div>
                </div>
              ))}

              <div data-tone="light" className="flb-panel flb-panel--gap" style={{ background: "#EDE8DE", color: "#14141B" }}>
                <span className="flb-panel-top" style={{ display: "block" }}>HOJA {String(photoPages.length + 1).padStart(2, "0")} — EN VIVO</span>
                <h2 className="flb-panel-title">Todo lo que<br /><span className="flb-accent-mono">vamos a recordar</span></h2>
                <div className="flb-album-embed">
                  {livePhotos.length > 0 ? (
                    <LiveAlbumStrip photos={livePhotos} tone="light" accentColor="#D93A2B" />
                  ) : (
                    <div className="flb-live-placeholder">
                      <span className="flb-mini-label">
                        {eventHasStarted
                          ? "Todavía no se subió nada en vivo."
                          : "Esta sección se activa el día de la fiesta -- ahí vas a poder ver todo lo que subamos en vivo."}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <FlbDots count={photoPages.length + 1} />
          </div>
        </div>

        {sugerenciaMusicaHabilitada && (
          <section id="music" data-tone="dark" data-screen-label="Música" className="flb-section" style={{ background: "#0B0B0B" }}>
            <span data-xin="1" data-dist="-60" className="flb-kicker">{kn(6)} — SUGERENCIA DE MÚSICA</span>
            <h2 data-xin="1" data-delay="80" data-dist="140" className="flb-h2">¿Qué look<br /><span className="flb-accent-italic">no puede faltar?</span></h2>
            <div data-xin="1" data-delay="160" data-dist="-80" className="flb-eq">
              {[0, 0.18, 0.36, 0.54, 0.72].map((delay, i) => (
                <span key={i} className="flb-eq-bar" style={{ animationDelay: `${delay}s`, background: i === 2 ? "#F5F2ED" : "#D93A2B" }} />
              ))}
            </div>
            <div data-xin="1" data-delay="240" data-dist="110" className="flb-song-wrap">
              <FlbSongSuggestion
                invitationId={String(invitation.id ?? "")}
                guestToken={guest?.uniqueToken}
                guestName={guestName || "Invitado"}
              />
            </div>
          </section>
        )}

        {showBankSection && (
          <section id="banco" data-tone="dark" data-screen-label="Regalos" className="flb-section" style={{ background: "#0B0B0B" }}>
            <span data-xin="1" data-dist="-60" className="flb-kicker">{sugerenciaMusicaHabilitada ? kn(7) : kn(6)} — REGALOS Y PAGOS</span>
            <h2 data-xin="1" data-delay="80" data-dist="140" className="flb-h2">
              Si querés<br /><span className="flb-accent-italic">sumarte</span>
            </h2>
            <div data-xin="1" data-delay="160" data-dist="-80" className="flb-bank-wrap">
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
                  accentColor="#D93A2B"
                  cardBg="rgba(20,20,27,0.72)"
                  cardBorder="#2A2417"
                  textPrimary="#F4F1EA"
                  textSecondary="#A8A292"
                  InfoRow={FlbInfoRow}
                  CopyField={FlbCopyField}
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
                  accentColor="#D93A2B"
                  cardBg="rgba(20,20,27,0.72)"
                  cardBorder="#2A2417"
                  textPrimary="#F4F1EA"
                  textSecondary="#A8A292"
                  InfoRow={FlbInfoRow}
                  CopyField={FlbCopyField}
                />
              )}
            </div>
          </section>
        )}

        {quizEnabled && (
          <section id="quiz" data-tone="dark" data-screen-label="Quiz" className="flb-section" style={{ background: "#0B0B0B" }}>
            <span data-xin="1" data-dist="-60" className="flb-kicker">{knAcc([sugerenciaMusicaHabilitada, showBankSection].filter(Boolean).length + 6)} — EL JUEGO</span>
            <h2 data-xin="1" data-delay="80" data-dist="140" className="flb-h2" style={{ fontSize: "clamp(28px, 6vw, 44px)" }}>
              {triviaTitulo}
            </h2>
            <div data-xin="1" data-delay="160" data-dist="-80">
              <FlbQuiz
                preguntas={triviaPreguntas}
                invitationId={String(invitation.id ?? "")}
                guestToken={guest?.uniqueToken}
                guestName={guestName || "Invitado"}
              />
            </div>
          </section>
        )}

        <section data-tone="dark" data-screen-label="Tu look" className="flb-section flb-section--between" style={{ padding: "96px max(30px, calc((100% - 560px) / 2)) 48px max(24px, calc((100% - 560px) / 2))" }}>
          <span data-xin="1" data-dist="-60" className="flb-kicker">{knAcc([sugerenciaMusicaHabilitada, showBankSection, quizEnabled].filter(Boolean).length + 6)} — GUARDÁ TU LOOK</span>
          <div data-xin="1" data-delay="100" data-dist="130" className="flb-final-card">
            <div className="flb-medallion flb-medallion--final">
              <FlbMedallion main="15" sub={confirmed ? "CONFIRMADO" : "PENDIENTE"} arcId="flbArc3" arcText={`${namesTitle.toUpperCase()} · ${fechaCompacta} · `} spin="reverse" />
            </div>
            <span className="flb-mini-label flb-accent-plain">LOOK Nº {passNumber} · ADMIT {guestAdults + guestTeens + guestChildren || 1}</span>
            <span className="flb-final-names">{namesTitle}</span>
            <span className="flb-mini-label" style={{ color: "#A8A292" }}>{fechaCorta} — {hora} H</span>
            <div className="flb-barcode" style={{ width: "60%", height: 26, opacity: 0.6 }} />
          </div>
          <div className="flb-final-footer">
            <span>NO TRANSFERIBLE</span>
            <span className="flb-replay" onClick={reset}>VER LA APERTURA OTRA VEZ ↺</span>
          </div>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <InfoAdicionalSection invitation={invitation as any} />
          <div className="flb-footer-credit">
            <LogoFooterCredit bgColor="transparent" />
          </div>
        </section>
      </div>

      <div ref={railRef} className="flb-rail">
        <span ref={railTopRef} className="flb-rail-top">LOOK Nº {passNumber}</span>
        <div ref={railLineRef} className="flb-rail-line">
          <span ref={railBarRef} className="flb-rail-bar" />
        </div>
        <span ref={railLabelRef} className="flb-rail-label">SAVE THE DATE</span>
      </div>

      <div ref={coverRef} className="flb-cover">
        <div ref={topRef} className="flb-cover-half flb-cover-half--top">
          <FlbCoverHalf
            namesRef={namesRef}
            kickerRef={kickerRef}
            perfRef={perfRef}
            kickerText={coverKickerText}
            namesTitle={coverNamesTitle}
            fechaCorta={fechaCorta}
            passNumber={passNumber}
            dressCode={dressCode}
            hora={hora}
            lookCode={lookCode}
            photoMobile={photoMobile}
            photoDesktop={photoDesktop}
          >
            <div className="flb-cover-cta">ABRIR INVITACIÓN</div>
          </FlbCoverHalf>
        </div>
        <div ref={bottomRef} className="flb-cover-half flb-cover-half--bottom">
          <FlbCoverHalf
            kickerText={coverKickerText}
            namesTitle={coverNamesTitle}
            fechaCorta={fechaCorta}
            passNumber={passNumber}
            dressCode={dressCode}
            hora={hora}
            lookCode={lookCode}
            photoMobile={photoMobile}
            photoDesktop={photoDesktop}
          >
            <button onClick={open} className="flb-cover-cta flb-cover-cta--btn">ABRIR INVITACIÓN</button>
          </FlbCoverHalf>
        </div>
      </div>

      <div ref={hintRef} className="flb-hint">DESLIZÁ ↓</div>

      {expandedPhoto && (
        <div
          className="flb-lightbox"
          onClick={() => setExpandedPhoto(null)}
          onContextMenu={(e) => e.preventDefault()}
        >
          <button
            type="button"
            className="flb-lightbox-close"
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
            className="flb-lightbox-img"
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

function FlbCdBox({ refEl, delay, dist, label }: { refEl: React.RefObject<HTMLSpanElement | null>; delay: number; dist: number; label: string }) {
  return (
    <div data-xin="1" data-delay={delay} data-dist={dist} className="flb-cd-box">
      <span ref={refEl} className="flb-cd-num">—</span>
      <span className="flb-cd-label">{label}</span>
    </div>
  );
}

function FlbDots({ count = 3 }: { count?: number }) {
  return (
    <div data-dots="1" className="flb-dots">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} data-dot={i} className="flb-dot" />
      ))}
    </div>
  );
}

// Medallón con el número "15" (o el nombre de sector) en el centro -- el
// mockup no dibuja un ícono ahí, usa directamente tipografía Archivo Black
// grande, como una etiqueta de backstage. "LOOK Nº 015" (el pase real del
// invitado) va SIEMPRE en el arco que rota alrededor, nunca en el centro.
function FlbMedallion({
  kicker,
  main,
  sub,
  subColor = "#8A8577",
  arcId,
  arcText,
  spin,
  compact,
}: {
  kicker?: string;
  main: string;
  sub?: string;
  subColor?: string;
  arcId: string;
  arcText: string;
  spin: "normal" | "reverse" | "none";
  compact?: boolean;
}) {
  // Duración fija por instancia (no en cada render) -- Math.random() directo
  // en el render viola la regla de pureza de React.
  const [ringDuration] = useState(() => 18 + Math.random() * 4);
  return (
    <>
      <div className="flb-medallion-ring" style={{ animation: spin === "none" ? "none" : `gpRing ${ringDuration}s linear infinite` }} />
      <div className="flb-medallion-core">
        {kicker && <span className="flb-medallion-kicker">{kicker}</span>}
        <span className={compact ? "flb-medallion-main-sm" : "flb-medallion-main"}>{main}</span>
        {sub && <span className="flb-medallion-sub" style={{ color: subColor }}>{sub}</span>}
      </div>
      {arcId && (
        <svg viewBox="0 0 100 100" className="flb-medallion-arc" style={{ animation: spin === "reverse" ? "gpRingRev 32s linear infinite" : "gpRingRev 34s linear infinite" }}>
          <defs>
            <path id={arcId} d="M50 50 m -38 0 a 38 38 0 1 1 76 0 a 38 38 0 1 1 -76 0" fill="none" />
          </defs>
          <text className="flb-medallion-arc-text">
            <textPath href={`#${arcId}`}>{arcText}{arcText}</textPath>
          </text>
        </svg>
      )}
    </>
  );
}

function FlbCopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div className="flb-bank-row">
      <div style={{ minWidth: 0, flex: 1 }}>
        <span className="flb-bank-row-label">{label}</span>
        <span className="flb-bank-row-value">{value}</span>
      </div>
      <button type="button" className="flb-bank-copy" onClick={handle}>
        {copied ? "✓ Copiado" : "Copiar"}
      </button>
    </div>
  );
}

// Reimplementación propia del RSVP: filas de datos + el stub/sello ya
// existente en la plantilla. Habla con el mismo endpoint/payload que
// <RSVPWizardV2> (/api/guests/[token]/confirm o /api/rsvp), así que no
// cambia ningún dato que pida el backend, solo cómo se ve.
function FlbRsvpCard({
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
      <div className="flb-rsvp-declined">
        <p className="flb-rsvp-declined-text">Gracias por avisarnos. Si cambiás de idea, este mismo acceso sigue activo.</p>
        <button type="button" className="flb-rsvp-btn flb-rsvp-btn--ghost" onClick={() => setStatus("PENDING")}>
          CAMBIÉ DE IDEA
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flb-rsvp-rows">
        <div className="flb-rsvp-row">
          <span>{totalGuests > 1 ? "RESERVADO PARA" : "NOMBRE Y APELLIDO"}</span>
          <span>{guestName || "—"}</span>
        </div>

        {totalGuests > 1 && status !== "CONFIRMED" && (
          <div className="flb-rsvp-row">
            <span>ADULTOS</span>
            <div className="flb-rsvp-stepper">
              <button type="button" onClick={() => setAdultCount((v) => Math.max(1, v - 1))} disabled={adultCount <= 1}>−</button>
              <span>{String(adultCount).padStart(2, "0")}</span>
              <button type="button" onClick={() => setAdultCount((v) => Math.min(maxAdults, v + 1))} disabled={adultCount >= maxAdults}>+</button>
            </div>
          </div>
        )}
        {maxTeens > 0 && status !== "CONFIRMED" && (
          <div className="flb-rsvp-row">
            <span>ADOLESCENTES</span>
            <div className="flb-rsvp-stepper">
              <button type="button" onClick={() => setTeenCount((v) => Math.max(0, v - 1))} disabled={teenCount <= 0}>−</button>
              <span>{String(teenCount).padStart(2, "0")}</span>
              <button type="button" onClick={() => setTeenCount((v) => Math.min(maxTeens, v + 1))} disabled={teenCount >= maxTeens}>+</button>
            </div>
          </div>
        )}
        {maxChildren > 0 && status !== "CONFIRMED" && (
          <div className="flb-rsvp-row">
            <span>NIÑOS</span>
            <div className="flb-rsvp-stepper">
              <button type="button" onClick={() => setChildCount((v) => Math.max(0, v - 1))} disabled={childCount <= 0}>−</button>
              <span>{String(childCount).padStart(2, "0")}</span>
              <button type="button" onClick={() => setChildCount((v) => Math.min(maxChildren, v + 1))} disabled={childCount >= maxChildren}>+</button>
            </div>
          </div>
        )}
        {status === "CONFIRMED" && (
          <>
            {totalGuests > 1 && adultCount > 0 && <div className="flb-rsvp-row"><span>ADULTOS</span><span>{String(adultCount).padStart(2, "0")}</span></div>}
            {teenCount > 0 && <div className="flb-rsvp-row"><span>ADOLESCENTES</span><span>{String(teenCount).padStart(2, "0")}</span></div>}
            {childCount > 0 && <div className="flb-rsvp-row"><span>NIÑOS</span><span>{String(childCount).padStart(2, "0")}</span></div>}
          </>
        )}

        {status !== "CONFIRMED" ? (
          <div className="flb-rsvp-row">
            <span>RESTRICCIÓN ALIMENTARIA</span>
            <input
              value={dietary}
              onChange={(e) => setDietary(e.target.value)}
              placeholder="—"
              className="flb-rsvp-input"
            />
          </div>
        ) : (
          <div className="flb-rsvp-row">
            <span>RESTRICCIÓN ALIMENTARIA</span>
            <span>{guestRestrictions || dietary || "—"}</span>
          </div>
        )}

        {hasPayment && paymentAmount != null && !isExempt && (
          <div className="flb-rsvp-row flb-rsvp-row--payment">
            <span>VALOR</span>
            <div className="flb-rsvp-payment-value">
              <span className="flb-rsvp-payment-total">{formatARS(totalPayment)}</span>
              {(adultCount > 0 || teenCount > 0 || childCount > 0) && (
                <div className="flb-rsvp-payment-detail">
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

      <div ref={stubRef} className="flb-stub">
        <div ref={sealRef} className="flb-seal">
          <FlbMedallion main="15" arcId="" arcText="" spin="none" compact />
        </div>
        <div className="flb-stub-body">
          <div className="flb-stub-top">
            <span>LOOK Nº {passNumber}</span>
            <span ref={statusRef} className="flb-stub-status">
              {confirmed ? "ACCESO CONFIRMADO" : "PENDIENTE"}
            </span>
          </div>
          <div className="flb-barcode flb-barcode--stub" />
        </div>
        <div ref={beamRef} className="flb-beam" />
      </div>

      {error && <p className="flb-rsvp-error">{error}</p>}

      {status !== "CONFIRMED" ? (
        <>
          <button type="button" className="flb-rsvp-btn" disabled={isSubmitting} onClick={() => submit("CONFIRMA")}>
            {isSubmitting ? "GUARDANDO…" : "CONFIRMAR ASISTENCIA"}
          </button>
          <button type="button" className="flb-rsvp-btn flb-rsvp-btn--ghost" disabled={isSubmitting} onClick={() => submit("NO_ASISTE")}>
            NO VOY A PODER ASISTIR
          </button>
        </>
      ) : (
        <button type="button" className="flb-rsvp-btn flb-rsvp-btn--ghost" onClick={() => setStatus("PENDING")}>
          MODIFICAR ASISTENCIA
        </button>
      )}
    </>
  );
}

interface FlbSongItem {
  id: string;
  title: string;
  artist: string;
  guestName: string;
}

// Misma API que <SongSuggestion> (/api/songs), look propio de la plantilla.
function FlbSongSuggestion({ invitationId, guestToken, guestName }: { invitationId: string; guestToken?: string; guestName: string }) {
  const [songs, setSongs] = useState<FlbSongItem[]>([]);
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
    <div className="flb-song">
      <form onSubmit={handleSubmit} className="flb-song-row">
        <div className="flb-song-inputs">
          <input value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="ARTISTA" maxLength={80} className="flb-song-input" />
          <span className="flb-song-sep">—</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="TEMA" maxLength={100} className="flb-song-input" />
        </div>
        <button type="submit" disabled={isSubmitting} className="flb-song-submit">+ {isSubmitting ? "..." : "SUMAR"}</button>
      </form>
      {error && <p className="flb-song-error">{error}</p>}
      {songs.length > 0 && (
        <div className="flb-song-list">
          {songs.slice(0, 12).map((s, i) => (
            <div key={s.id} className="flb-song-item">
              <span className="flb-song-item-title">{String(i + 1).padStart(2, "0")} · {s.artist} — {s.title}</span>
              <span className="flb-song-item-by">Sumado por {s.guestName || "Invitado"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Todas las preguntas se muestran juntas en la misma página -- misma API
// /api/quiz que usa el resto de las plantillas.
function FlbQuiz({ preguntas, invitationId, guestToken, guestName }: { preguntas: FlbQuizQuestion[]; invitationId: string; guestToken?: string; guestName?: string }) {
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
    <div className="flb-quiz">
      {preguntas.map((q, qi) => {
        const correctIdx = q.respuestaCorrecta ?? q.correcta;
        return (
          <div key={qi} className="flb-quiz-q">
            <span className="flb-quiz-q-num">{String(qi + 1).padStart(2, "0")}</span>
            <p className="flb-quiz-q-text">{q.pregunta}</p>
            <div className="flb-quiz-opts">
              {q.opciones.map((opt, oi) => {
                const chosen = picks[qi] === oi;
                const revealed = picks[qi] !== undefined && correctIdx !== undefined;
                let stateClass = "";
                if (revealed) {
                  if (oi === correctIdx) stateClass = " flb-quiz-opt--correct";
                  else if (chosen) stateClass = " flb-quiz-opt--wrong";
                } else if (chosen) {
                  stateClass = " flb-quiz-opt--picked";
                }
                return (
                  <button
                    key={oi}
                    type="button"
                    className={`flb-quiz-opt${stateClass}`}
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
        <div className="flb-quiz-result">
          <p className="flb-quiz-result-score">
            {isSaving ? "GUARDANDO…" : `RESPONDISTE ${score} DE ${preguntas.length} CORRECTAMENTE`}
          </p>
          {!isSaving && stats && stats.count > 0 && (
            <p className="flb-quiz-result-stat">
              El promedio del resto de los invitados ({stats.count}) es del {stats.avg}%.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function FlbInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flb-bank-row">
      <div style={{ minWidth: 0, flex: 1 }}>
        <span className="flb-bank-row-label">{label}</span>
        <span className="flb-bank-row-value">{value}</span>
      </div>
    </div>
  );
}

function FlbCoverHalf({
  namesRef,
  kickerRef,
  perfRef,
  kickerText,
  namesTitle,
  fechaCorta,
  passNumber,
  dressCode,
  hora,
  lookCode,
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
  lookCode: string;
  photoMobile?: string;
  photoDesktop?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flb-cover-inner">
      {/* Con foto cargada, la foto reemplaza el fondo -- el resto de la
          ornamentación (numeral, grilla, nombres, CTA) queda arriba sin
          cambios. Solo mobile (igual que Flat). La tapa de esta familia es
          de paleta clara (#F5F2ED, tinta oscura), así que sin tinte de
          color y con scrim en su propio tono claro -- no un scrim oscuro
          genérico -- para no perder contraste con el texto. */}
      {photoMobile && (
        <div className="acp-mobile-only">
          <AnimatedCoverPhoto photoSrc={photoMobile} tint={false} effect="enfoque" scrimColorRgb="245,242,237" />
        </div>
      )}
      {photoDesktop && (
        <div className="acp-desktop-only">
          <AnimatedCoverPhoto photoSrc={photoDesktop} tint={false} effect="enfoque" scrimColorRgb="245,242,237" />
        </div>
      )}
      <span className="flb-cover-numeral">15</span>
      <div className="flb-cover-grid" />
      <div className="flb-cover-content">
        <div className="flb-cover-top-row">
          <span>LOOKBOOK SS27 · Nº {passNumber}</span><span className="flb-accent-red">EDICIÓN ÚNICA</span>
        </div>
        <div className="flb-cover-center">
          <span ref={kickerRef} className="flb-cover-kicker">{kickerText}</span>
          <h1 ref={namesRef} className="flb-cover-names">{namesTitle}</h1>
          <span className="flb-cover-rule" />
          <span className="flb-cover-date">{fechaCorta}</span>
        </div>
        <div className="flb-cover-bottom">
          <div ref={perfRef} className="flb-perf-strip flb-perf-strip--reveal flb-perf-strip--light" />
          <div className="flb-cover-facts">
            <span>SECTOR — PASARELA</span>
            <span>{hora} H</span>
            <span>CÓD. {lookCode}</span>
          </div>
          {dressCode && <div className="flb-cover-facts flb-cover-facts--dress"><span>{dressCode.toUpperCase()}</span></div>}
          {children}
          <div className="flb-barcode-wrap">
            <div className="flb-barcode" style={{ width: "62%" }} />
            <span className="flb-mini-label" style={{ color: "#56534A" }}>NO TRANSFERIBLE</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Hoja de estilos (traslada 1:1 los tokens visuales del mockup aprobado)
// ---------------------------------------------------------------------
const FLB_CSS = `
  .flb-scroller { position: absolute; inset: 0; overflow-y: auto; overflow-x: hidden; opacity: 0; transition: opacity 900ms ease 260ms; scrollbar-width: none; }
  .flb-scroller::-webkit-scrollbar { width: 0; height: 0; }

  a { color: #D93A2B; text-decoration: none; }
  a:hover { color: #F5F2ED; }

  @keyframes gpFoil { to { transform: rotate(360deg); } }
  @keyframes gpRing { to { transform: rotate(360deg); } }
  @keyframes gpRingRev { to { transform: rotate(-360deg); } }
  @keyframes gpScan { 0% { transform: translateY(0); opacity: 0; } 12% { opacity: .85; } 88% { opacity: .85; } 100% { transform: translateY(320px); opacity: 0; } }
  @keyframes gpEq { 0%,100% { transform: scaleY(.25); } 50% { transform: scaleY(1); } }
  @keyframes gpHint { 0%,100% { transform: translateY(0); } 50% { transform: translateY(7px); } }
  @keyframes gpSide { 0%,100% { transform: translateX(0); } 50% { transform: translateX(7px); } }
  @media (prefers-reduced-motion: reduce) { .flb-scroller * { animation: none !important; } }

  .flb-section { min-height: calc(var(--vh, 1vh) * 100); position: relative; display: flex; flex-direction: column; justify-content: center; gap: 30px; padding: 96px max(30px, calc((100% - 560px) / 2)) 110px max(24px, calc((100% - 560px) / 2)); overflow: hidden; background: radial-gradient(120% 80% at 50% 0%, #17141F 0%, #0B0B0B 55%, #080808 100%); }
  .flb-section--between { justify-content: space-between; }

  /* Foto principal (ver rama experimento-foto-storytelling). Mobile: la
     foto ocupa toda la sección, borde a borde. Desktop: se enmarca con un
     borde rojo propio de la familia en vez de estirarse. */
  .flb-hero-photo-section { min-height: calc(var(--vh, 1vh) * 100); position: relative; overflow: hidden; background: #080808; }
  .flb-hero-photo-frame { position: absolute; inset: 0; overflow: hidden; }
  .flb-hero-photo-kicker { position: absolute; left: 0; right: 0; bottom: 0; z-index: 2; padding: 0 max(24px, calc((100% - 560px) / 2)) 48px; }
  @media (max-width: 767px) {
    .flb-hero-photo-section--no-mobile { min-height: 0; height: 0; }
  }
  @media (min-width: 768px) {
    .flb-hero-photo-frame { inset: 64px max(24px, calc((100% - 900px) / 2)); border: 1px solid rgba(217,58,43,.3); }
    .flb-hero-photo-kicker { bottom: 40px; }
    .flb-hero-photo-section--no-desktop { min-height: 0; height: 0; }
  }
  .flb-section:nth-of-type(2) { background: radial-gradient(100% 60% at 50% 100%, #1A1414 0%, #0E0B0B 55%, #080808 100%); }
  .flb-section:nth-of-type(3) { background: radial-gradient(130% 90% at 86% 16%, #1C1727 0%, #0C0B11 52%, #080808 100%); }

  .flb-watermark { position: absolute; right: -30px; top: 30px; font-family: var(--flb-archivo), sans-serif; font-size: min(60vw, 380px); line-height: .8; color: rgba(245,242,237,.05); z-index: 0; pointer-events: none; }
  .flb-grid-overlay { position: absolute; inset: 0; background-image: linear-gradient(90deg, rgba(245,242,237,.06) 1px, transparent 1px); background-size: 64px 100%; pointer-events: none; z-index: 0; }

  .flb-kicker { font-size: 9.5px; letter-spacing: 0.34em; color: #8A8577; }

  .flb-date-stack { display: flex; flex-direction: column; gap: 2px; }
  .flb-date-num { font-family: var(--flb-archivo), sans-serif; font-size: clamp(66px, 23vw, 140px); line-height: 0.82; letter-spacing: -0.04em; }
  .flb-date-num--right { text-align: right; line-height: 0.86; }
  .flb-date-month { font-family: var(--flb-archivo), sans-serif; font-style: italic; font-size: clamp(50px, 18vw, 104px); line-height: 0.9; color: #D93A2B; padding-left: 12%; }

  .flb-divider { display: flex; align-items: center; gap: 16px; font-size: 10px; letter-spacing: 0.26em; color: #8A8577; }
  .flb-divider-line { width: 52px; height: 1px; background: #D93A2B; display: inline-block; }
  .flb-divider-line--long { width: 64px; }

  .flb-lead { margin: 0; font-family: var(--flb-archivo), sans-serif; font-style: italic; font-size: 20px; line-height: 1.4; color: #A8A292; max-width: 330px; }
  .flb-cal-link { display: inline-flex; align-items: center; gap: 7px; margin-top: 4px; font-family: var(--flb-mono), monospace; font-size: 10px; letter-spacing: 0.24em; text-transform: uppercase; color: #8A8577; text-decoration: none; transition: color 200ms ease; }
  .flb-cal-link:hover { color: #D93A2B; }

  .flb-medallion { position: relative; }
  .flb-medallion--corner { position: absolute; right: max(32px, calc((100% - 560px) / 2)); top: 12%; width: clamp(86px, 22vw, 116px); aspect-ratio: 1; }
  .flb-medallion--lg { width: clamp(130px, 34vw, 178px); aspect-ratio: 1; margin: 0 auto; }
  .flb-medallion--final { width: clamp(104px, 26vw, 132px); aspect-ratio: 1; margin: -12px auto 0; }
  .flb-medallion-ring { position: absolute; inset: 0; border-radius: 50%; background: conic-gradient(from 0deg, #D93A2B, #0B0B0B, #D93A2B, #F5F2ED, #D93A2B); filter: saturate(.75); }
  .flb-medallion-core { position: absolute; inset: 3px; border-radius: 50%; background: #0C0C11; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; text-align: center; padding: 6px; }
  .flb-medallion-kicker { font-size: 6.5px; letter-spacing: 0.28em; color: #8A8577; }
  .flb-medallion-main { font-family: var(--flb-archivo), sans-serif; font-size: 26px; line-height: 1; color: #F5F2ED; }
  .flb-medallion-main-sm { font-family: var(--flb-archivo), sans-serif; font-size: 16px; line-height: 1; color: #F5F2ED; }
  .flb-medallion-sub { font-size: 6.5px; letter-spacing: 0.24em; }
  .flb-medallion-arc { position: absolute; inset: -14%; }
  .flb-medallion-arc-text { font-size: 7px; letter-spacing: 1.6px; fill: #D93A2B; font-family: var(--flb-mono), monospace; }

  .flb-scan-grid { position: absolute; inset: 0; background: repeating-linear-gradient(0deg, rgba(200,164,92,0.06) 0 1px, transparent 1px 5px); pointer-events: none; }
  .flb-scanline { position: absolute; left: 0; right: 0; top: 30%; height: 2px; background: linear-gradient(90deg, transparent, #F5F2ED, transparent); animation: gpScan 6s linear infinite; pointer-events: none; }

  .flb-cd-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; position: relative; }
  .flb-cd-box { border: 1px solid #2A2417; background: rgba(20,20,27,0.72); padding: 18px 15px; display: flex; flex-direction: column; gap: 6px; overflow: hidden; }
  .flb-cd-num { font-family: var(--flb-archivo), sans-serif; font-size: clamp(48px, 14vw, 80px); line-height: 0.82; color: #F6EFDD; display: inline-block; }
  .flb-cd-label { font-size: 9px; letter-spacing: 0.3em; color: #D93A2B; }
  .flb-perf-strip { height: 12px; position: relative; background: radial-gradient(circle at 6px 50%, #080808 3.4px, transparent 3.8px) 0 0/12px 12px repeat-x; opacity: .85; }
  .flb-perf-strip--reveal { clip-path: inset(0 100% 0 0); transition: clip-path 900ms cubic-bezier(.16,1,.3,1) 500ms; }

  .flb-glow-blob { position: absolute; right: -26%; top: 4%; width: 82vw; max-width: 540px; aspect-ratio: 1; border-radius: 50%; background: conic-gradient(from 200deg, rgba(217,58,43,0.24), rgba(11,11,11,0.3), rgba(217,58,43,0.36), rgba(217,58,43,0.24)); filter: blur(80px); opacity: .4; animation: gpFoil 30s linear infinite; }
  .flb-phrase { margin: 0; position: relative; font-family: var(--flb-archivo), sans-serif; font-weight: 400; font-size: clamp(50px, 15vw, 96px); line-height: 0.92; letter-spacing: -0.03em; }
  .flb-accent-italic { font-style: italic; color: #D93A2B; }
  .flb-accent-mono { font-style: italic; color: #0B0B0B; font-family: var(--flb-archivo), sans-serif; }
  .flb-accent-red-serif { font-style: italic; color: #D93A2B; font-family: var(--flb-archivo), sans-serif; }
  .flb-accent-plain { color: #0B0B0B; }
  .flb-accent-red { color: #D93A2B; }
  .flb-h2 { margin: 0; font-family: var(--flb-archivo), sans-serif; font-weight: 400; font-size: clamp(40px, 12vw, 68px); line-height: 0.96; }

  .flb-pan { height: 260vh; position: relative; }
  .flb-pan-sticky { position: sticky; top: 0; height: calc(var(--vh, 1vh) * 100); overflow: hidden; }
  .flb-strip { position: absolute; top: 0; left: 0; height: 100%; display: flex; width: 300vw; will-change: transform; }
  .flb-panel { flex: 0 0 100vw; min-width: 0; height: 100%; box-sizing: border-box; position: relative; overflow: hidden; display: flex; flex-direction: column; padding: 84px max(24px, calc((100vw - 560px) / 2)) 100px; gap: 22px; }
  .flb-panel--between { justify-content: space-between; }
  .flb-panel--end { justify-content: flex-end; }
  .flb-panel--center { align-items: center; justify-content: center; text-align: center; }
  .flb-panel--gap { gap: clamp(14px, 2.4vh, 22px); padding: clamp(52px, 9vh, 84px) max(24px, calc((100vw - 600px) / 2)) clamp(62px, 11vh, 100px); }
  .flb-hair-bg { position: absolute; inset: 0; background: repeating-linear-gradient(90deg, rgba(20,20,27,0.05) 0 1px, transparent 1px 26px); pointer-events: none; }
  .flb-panel-top { position: relative; display: flex; justify-content: space-between; font-size: 9.5px; letter-spacing: 0.32em; color: #7C7768; }
  .flb-panel-title { margin: 0; position: relative; font-family: var(--flb-archivo), sans-serif; font-weight: 400; font-size: clamp(46px, 13.5vw, 76px); line-height: 0.92; }
  .flb-panel-title-md { margin: 0; position: relative; font-family: var(--flb-archivo), sans-serif; font-weight: 400; font-size: clamp(42px, 12.5vw, 64px); line-height: 0.94; }
  .flb-panel-title-sm { margin: 0; font-family: var(--flb-archivo), sans-serif; font-size: clamp(34px, 10vw, 52px); line-height: 1; }
  .flb-panel-block { position: relative; display: flex; flex-direction: column; gap: 12px; }
  .flb-mini-label { font-size: 9px; letter-spacing: 0.26em; color: #7C7768; }
  .flb-mini-label--dark { color: #8A8577; }
  .flb-facts { position: relative; display: flex; flex-direction: column; gap: 12px; font-size: 11px; letter-spacing: 0.14em; color: #4A473F; }
  .flb-facts-row { display: flex; justify-content: space-between; border-bottom: 1px solid #D6D1C4; padding-bottom: 10px; }
  .flb-facts-row--last { border-bottom: none; padding-bottom: 0; }
  .flb-seguir { position: relative; display: flex; align-items: center; gap: 10px; font-size: 9px; letter-spacing: 0.26em; color: #0B0B0B; margin-top: auto; }
  .flb-seguir--split { justify-content: space-between; }
  .flb-side-hint { display: inline-block; animation: gpSide 2.2s ease-in-out infinite; }
  .flb-route-svg { position: absolute; inset: 0; width: 100%; height: 100%; }
  .flb-link-cta { font-size: 10px; letter-spacing: 0.24em; color: #0B0B0B; }

  .flb-crono { position: relative; display: flex; flex-direction: column; gap: 8px; margin-top: 4px; }
  .flb-crono-row { display: flex; align-items: baseline; gap: 14px; font-size: 11px; letter-spacing: 0.1em; color: #4A473F; border-bottom: 1px solid #D6D1C4; padding-bottom: 8px; }
  .flb-crono-time { font-family: var(--flb-mono), monospace; color: #D93A2B; min-width: 42px; }
  .flb-crono-title { flex: 1; }

  .flb-dots { position: absolute; left: 0; right: 34px; bottom: 26px; display: flex; gap: 6px; justify-content: center; z-index: 2; }
  .flb-dot { width: 22px; height: 2px; background: rgba(20,20,27,0.18); transition: background 400ms ease; display: inline-block; }

  .flb-stub { position: relative; overflow: hidden; border: 1px solid #2A2417; background: rgba(20,20,27,0.7); padding: 20px; display: flex; align-items: center; gap: 16px; transition: border-color 600ms ease, box-shadow 600ms ease; }
  .flb-stub-body { flex: 1; display: flex; flex-direction: column; gap: 12px; }
  .flb-stub-top { display: flex; justify-content: space-between; font-size: 9px; letter-spacing: 0.24em; color: #8A8577; }
  .flb-stub-status { color: #6E6A5D; transition: color 400ms ease; }
  .flb-seal { width: 62px; flex: 0 0 62px; aspect-ratio: 1; position: relative; opacity: .25; transform: scale(.86); transition: opacity 700ms ease, transform 700ms cubic-bezier(.16,1,.3,1); }
  .flb-beam { position: absolute; left: 0; right: 0; top: 0; height: 2px; background: linear-gradient(90deg, transparent, #F5F2ED, transparent); opacity: 0; transition: transform 900ms cubic-bezier(.16,1,.3,1), opacity 300ms ease; }

  .flb-rsvp { display: flex; flex-direction: column; gap: 22px; width: 100%; max-width: 420px; font-family: var(--flb-mono), monospace; }
  .flb-rsvp-rows { display: flex; flex-direction: column; }
  .flb-rsvp-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 0; border-bottom: 1px solid rgba(217,58,43,0.18); font-size: 10.5px; letter-spacing: 0.18em; color: #8A8577; }
  .flb-rsvp-row > span:first-child { flex-shrink: 0; }
  .flb-rsvp-row > span:last-child { color: #F4F1EA; letter-spacing: 0.02em; text-align: right; }
  .flb-rsvp-row--payment { align-items: flex-start; }
  .flb-rsvp-payment-value { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
  .flb-rsvp-payment-total { color: #F5F2ED; font-size: 13px; letter-spacing: 0.02em; font-weight: 600; }
  .flb-rsvp-payment-detail { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; font-size: 9px; letter-spacing: 0.05em; color: #8A8577; }
  .flb-rsvp-stepper { display: flex; align-items: center; gap: 12px; }
  .flb-rsvp-stepper button { width: 26px; height: 26px; border-radius: 50%; border: 1px solid #D93A2B; background: transparent; color: #D93A2B; font-size: 14px; line-height: 1; cursor: pointer; }
  .flb-rsvp-stepper button:disabled { opacity: 0.3; cursor: default; }
  .flb-rsvp-stepper span { font-family: var(--flb-mono), monospace; color: #F4F1EA; min-width: 20px; text-align: center; }
  .flb-rsvp-input { background: transparent; border: none; border-bottom: 1px solid rgba(217,58,43,0.3); color: #F4F1EA; font-family: var(--flb-mono), monospace; font-size: 11px; letter-spacing: 0.02em; padding: 4px 2px; text-align: right; max-width: 55%; }
  .flb-rsvp-input::placeholder { color: #6E6A5D; }
  .flb-rsvp-input:focus { outline: none; border-bottom-color: #D93A2B; }
  .flb-rsvp-btn { width: 100%; padding: 17px 0; font-family: var(--flb-mono), monospace; font-size: 11.5px; font-weight: 600; letter-spacing: 0.26em; text-transform: uppercase; border: 1px solid #D93A2B; background: linear-gradient(100deg, rgba(200,164,92,0.08), rgba(232,214,168,0.2), rgba(200,164,92,0.08)); color: #F6EFDD; cursor: pointer; transition: background 200ms ease, color 200ms ease; }
  .flb-rsvp-btn:hover:not(:disabled) { background: linear-gradient(100deg, rgba(232,214,168,0.34), rgba(246,239,221,0.5), rgba(232,214,168,0.34)); color: #0B0B0F; }
  .flb-rsvp-btn:disabled { opacity: 0.6; cursor: default; }
  .flb-rsvp-btn--ghost { background: transparent; color: #D93A2B; }
  .flb-rsvp-btn--ghost:hover:not(:disabled) { background: rgba(217,58,43,0.1); color: #D93A2B; }
  .flb-rsvp-error { font-size: 10px; letter-spacing: 0.06em; color: #D93A2B; margin: 0; }
  .flb-rsvp-declined { display: flex; flex-direction: column; gap: 18px; align-items: center; text-align: center; max-width: 380px; }
  .flb-rsvp-declined-text { margin: 0; font-family: var(--flb-archivo), sans-serif; font-style: italic; font-size: 18px; line-height: 1.4; color: #A8A292; }

  .flb-upload-wrap { flex: 1; min-height: 0; overflow-y: auto; }
  .flb-album-embed { flex: 1; min-height: 0; overflow-y: auto; }
  .flb-live-placeholder { flex: 1; display: flex; align-items: center; justify-content: center; text-align: center; padding: 24px; border: 1px dashed rgba(20,20,27,0.2); }
  .flb-photo-placeholder { position: relative; font-size: 8.5px; letter-spacing: 0.16em; color: #6E6A5D; }

  .flb-mosaic { position: relative; flex: 1; min-height: 0; display: grid; grid-template-columns: repeat(3, 1fr); grid-auto-rows: auto; grid-auto-flow: dense; align-content: start; gap: 10px; }
  .flb-mosaic-cell--featured { grid-column: span 2; grid-row: span 2; cursor: pointer; }
  .flb-mosaic-cell { position: relative; height: 0; padding-top: 100%; background: repeating-linear-gradient(135deg, #DCD7CB 0 6px, #E9E5DC 6px 12px); overflow: hidden; cursor: pointer; }
  .flb-mosaic-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }

  .flb-bank-wrap { position: relative; display: flex; flex-direction: column; gap: 14px; width: 100%; max-width: 420px; margin: 0; }
  .flb-bank-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid rgba(217,58,43,0.18); }
  .flb-bank-row:last-child { border-bottom: none; }
  .flb-bank-row-label { display: block; font-size: 9px; letter-spacing: 0.2em; color: #8A8577; margin-bottom: 3px; }
  .flb-bank-row-value { font-size: 12px; color: #F4F1EA; word-break: break-all; }
  .flb-bank-copy { flex-shrink: 0; font-family: var(--flb-mono), monospace; font-size: 10px; letter-spacing: 0.1em; padding: 7px 12px; border: 1px solid #D93A2B; background: transparent; color: #D93A2B; cursor: pointer; }
  .flb-bank-copy:hover { background: rgba(217,58,43,0.12); }

  .flb-eq { display: flex; align-items: flex-end; gap: 5px; height: 52px; }
  .flb-eq-bar { width: 4px; height: 100%; transform-origin: bottom; animation: gpEq 1.1s ease-in-out infinite; display: inline-block; }
  .flb-song-wrap { font-family: var(--flb-mono), monospace; }

  .flb-song { position: relative; width: 100%; max-width: 420px; margin: 0 auto; }
  .flb-song-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; border-bottom: 1px solid rgba(217,58,43,0.3); padding-bottom: 12px; }
  .flb-song-inputs { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; font-size: 10px; letter-spacing: 0.24em; color: #8A8577; text-transform: uppercase; }
  .flb-song-input { background: transparent; border: none; border-bottom: 1px solid rgba(217,58,43,0.3); color: #F4F1EA; font-family: var(--flb-mono), monospace; font-size: 12px; padding: 6px 2px; min-width: 0; flex: 1; }
  .flb-song-input::placeholder { color: #6E6A5D; }
  .flb-song-input:focus { outline: none; border-bottom-color: #D93A2B; }
  .flb-song-sep { color: #8A8577; flex-shrink: 0; }
  .flb-song-submit { flex-shrink: 0; background: none; border: none; color: #D93A2B; font-family: var(--flb-mono), monospace; font-size: 10px; letter-spacing: 0.2em; cursor: pointer; }
  .flb-song-submit:hover { color: #F5F2ED; }
  .flb-song-submit:disabled { color: #6E6A5D; cursor: default; }
  .flb-song-error { font-size: 10px; color: #D93A2B; margin-top: 6px; }
  .flb-song-list { display: flex; flex-direction: column; margin-top: 14px; max-height: 180px; overflow-y: auto; }
  .flb-song-item { display: flex; flex-direction: column; gap: 3px; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06); font-family: var(--flb-mono), monospace; }
  .flb-song-item-title { font-size: 11.5px; letter-spacing: 0.04em; color: #F4F1EA; }
  .flb-song-item-by { font-size: 9.5px; letter-spacing: 0.1em; color: #6E6A5D; }

  .flb-quiz { display: flex; flex-direction: column; gap: 28px; width: 100%; max-width: 460px; }
  .flb-quiz-q { display: flex; flex-direction: column; gap: 14px; }
  .flb-quiz-q-num { font-family: var(--flb-mono), monospace; font-size: 10px; letter-spacing: 0.24em; color: #8A8577; }
  .flb-quiz-q-text { margin: 0; font-family: var(--flb-archivo), sans-serif; font-size: clamp(16px, 3.6vw, 20px); line-height: 1.3; color: #F4F1EA; }
  .flb-quiz-opts { display: flex; flex-wrap: wrap; gap: 10px; }
  .flb-quiz-opt { font-family: var(--flb-mono), monospace; font-size: 11px; letter-spacing: 0.06em; padding: 10px 16px; border: 1px solid rgba(217,58,43,0.4); background: transparent; color: #D93A2B; cursor: pointer; transition: background 160ms ease, color 160ms ease, border-color 160ms ease; }
  .flb-quiz-opt:disabled { cursor: default; }
  .flb-quiz-opt--picked { background: #D93A2B; border-color: #D93A2B; color: #0B0B10; }
  .flb-quiz-opt--correct { background: #D93A2B; border-color: #D93A2B; color: #0B0B10; }
  .flb-quiz-opt--wrong { border-color: #8A6A6A; color: #C99; opacity: 0.6; }
  .flb-quiz-result { padding-top: 18px; border-top: 1px solid rgba(217,58,43,0.2); }
  .flb-quiz-result-score { margin: 0 0 6px; font-family: var(--flb-mono), monospace; font-size: 11px; letter-spacing: 0.16em; color: #F5F2ED; }
  .flb-quiz-result-stat { margin: 0; font-size: 11.5px; line-height: 1.5; color: #A8A292; }

  .flb-final-card { border: 1px solid #D93A2B; padding: 30px 24px; display: flex; flex-direction: column; gap: 22px; align-items: center; text-align: center; position: relative; }
  .flb-final-names { font-family: var(--flb-archivo), sans-serif; font-size: clamp(34px, 10vw, 46px); line-height: .9; color: #F5F2ED; }
  .flb-barcode { height: 26px; background: repeating-linear-gradient(90deg, #6E6A5D 0 2px, transparent 2px 4px, #6E6A5D 4px 5px, transparent 5px 9px, #6E6A5D 9px 11px, transparent 11px 14px); }
  .flb-barcode--stub { width: 100%; height: 28px; background: repeating-linear-gradient(90deg, #A8A292 0 2px, transparent 2px 4px, #A8A292 4px 5px, transparent 5px 9px, #A8A292 9px 11px, transparent 11px 14px); opacity: .55; }
  .flb-final-footer { display: flex; justify-content: space-between; align-items: center; font-size: 9px; letter-spacing: 0.24em; color: #56534A; }
  .flb-replay { cursor: pointer; color: #D93A2B; }
  .flb-footer-credit { display: flex; justify-content: center; padding-top: 8px; opacity: 0.7; }

  .flb-rail { position: absolute; right: 0; top: 0; bottom: 0; width: 34px; z-index: 4; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 20px 0; opacity: 0; transition: opacity 700ms ease; pointer-events: none; border-left: 1px solid rgba(200,164,92,0.14); }
  .flb-rail-top { writing-mode: vertical-rl; font-size: 8px; letter-spacing: 0.34em; color: #8A8577; transition: color 500ms ease; }
  .flb-rail-line { flex: 1; width: 1px; margin: 16px 0; background: rgba(200,164,92,0.16); position: relative; }
  .flb-rail-bar { position: absolute; left: -1px; top: 0; width: 3px; height: 0%; background: linear-gradient(#F5F2ED, #D93A2B); transition: height 260ms linear; display: block; }
  .flb-rail-label { writing-mode: vertical-rl; font-size: 8px; letter-spacing: 0.34em; color: #D93A2B; transition: color 500ms ease; }

  .flb-cover { position: absolute; inset: 0; z-index: 5; }
  .flb-cover-half { position: absolute; left: 0; right: 0; height: 50%; overflow: hidden; transition: transform 1100ms cubic-bezier(.7,0,.2,1); }
  .flb-cover-half--top { top: 0; }
  .flb-cover-half--bottom { bottom: 0; }
  .flb-cover-inner { position: absolute; left: 0; right: 0; top: 0; height: 200%; overflow: hidden; background: #F5F2ED; }
  .flb-cover-half--bottom .flb-cover-inner { top: auto; bottom: 0; }
  .flb-cover-numeral { position: absolute; right: -10px; top: 4%; font-family: var(--flb-archivo), sans-serif; font-size: min(46vw, 300px); line-height: .8; color: rgba(11,11,11,.06); z-index: 0; }
  .flb-cover-grid { position: absolute; inset: 0; background-image: linear-gradient(90deg, rgba(11,11,11,.06) 1px, transparent 1px); background-size: 48px 100%; }
  .flb-cover-content { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: space-between; padding: 24px max(24px, calc((100% - 440px) / 2)) 26px; }
  .flb-cover-top-row { display: flex; justify-content: space-between; font-size: 9.5px; letter-spacing: 0.24em; color: #6A6A66; }
  .flb-cover-center { display: flex; flex-direction: column; align-items: center; gap: clamp(10px, 2.2vh, 22px); text-align: center; }
  .flb-cover-kicker { font-size: 9.5px; letter-spacing: 0.34em; color: #6A6A66; }
  .flb-cover-names { margin: 0; font-family: var(--flb-archivo), sans-serif; font-weight: 400; font-size: min(clamp(40px, 13vw, 78px), 10.5vh); line-height: 1.05; letter-spacing: -0.03em; color: #0B0B0B; }
  .flb-cover-rule { width: 74px; height: 3px; background: #0B0B0B; display: block; }
  .flb-cover-date { font-size: 11.5px; letter-spacing: 0.3em; color: #6A6A66; white-space: nowrap; }
  .flb-cover-bottom { display: flex; flex-direction: column; gap: clamp(12px, 2.4vh, 22px); }
  .flb-cover-facts { display: flex; justify-content: space-between; font-size: 9px; letter-spacing: 0.2em; color: #6E6A5D; }
  .flb-cover-facts--dress { justify-content: center; color: #6A6A66; }
  .flb-cover-cta { border: 1px solid #0B0B0B; background: #0B0B0B; color: #F5F2ED; font-family: var(--flb-mono), monospace; font-size: 12px; letter-spacing: 0.26em; padding: clamp(13px, 2.1vh, 19px) 0; text-align: center; width: 100%; }
  .flb-cover-cta--btn { cursor: pointer; border-radius: 0; }
  @media (hover: hover) {
    .flb-cover-cta--btn:hover { background: #D93A2B; border-color: #D93A2B; }
  }
  .flb-perf-strip--light { background: radial-gradient(circle at 6px 50%, #F5F2ED 3.4px, transparent 3.8px) 0 0/12px 12px repeat-x; }
  .flb-barcode-wrap { display: flex; flex-direction: column; align-items: center; gap: 10px; }

  .flb-hint { position: absolute; left: 0; right: 34px; bottom: 18px; z-index: 6; text-align: center; font-size: 9px; letter-spacing: 0.28em; color: #8A8577; opacity: 0; transition: opacity 600ms ease; pointer-events: none; animation: gpHint 2.4s ease-in-out infinite; }

  .flb-lightbox { position: fixed; inset: 0; z-index: 200; background: rgba(8,8,8,0.96); display: flex; align-items: center; justify-content: center; padding: 24px; cursor: zoom-out; }
  .flb-lightbox-close { position: absolute; top: 20px; right: 20px; width: 36px; height: 36px; border-radius: 50%; border: 1px solid #D93A2B; background: rgba(0,0,0,0.4); color: #F4F1EA; font-size: 18px; line-height: 1; cursor: pointer; display: flex; align-items: center; justify-content: center; }
  .flb-lightbox-img { max-width: 100%; max-height: 88vh; object-fit: contain; cursor: default; }
`;
