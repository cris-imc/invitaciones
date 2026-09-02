"use client";

/**
 * InfantilSafariTemplateVerde.tsx
 *
 * Portado 1:1 desde el mockup "Infantil Safari Aventura" (mockup/Eventos),
 * siguiendo el mismo motor que Guest Pass VIP (pase de acceso estilo ticket,
 * Cormorant Garamond + IBM Plex Mono, medallón circular con texto en arco,
 * scroll horizontal "pineado" para Cuándo y dónde / Álbum, riel lateral de
 * progreso y portada que se abre en dos mitades). Todo el motion es CSS + SVG
 * + un loop de scroll propio -- cero PNGs, así que escala sin pixelarse en
 * cualquier viewport.
 *
 * Familia de la Colección Storytelling exclusiva del tipo de evento genérico
 * "Evento" (CUMPLEANOS en el schema -- ver soloCumpleanos en
 * TemplatePreviewModal.tsx) -- no hay novios ni quinceañera, solo un/a
 * festejado/a (invitation.nombreQuinceanera, reutilizado como campo genérico
 * "Nombre del Festejado/a" para este tipo de evento -- ver StepEventType.tsx).
 * Nunca se ofrece para Casamiento/XV, así que no necesita ninguna rama
 * condicional por tipo de evento.
 *
 * Secciones fijas del producto (Save the Date, Countdown, Cuándo y dónde,
 * RSVP, Álbum, Música, Footer) reinterpretadas visualmente, conectadas a
 * datos reales de `Invitation`/`Guest`.
 *
 * Esta familia de plantillas usa componentes de diseño fijo (no elegibles
 * desde el wizard): tipografía, countdown, álbum, RSVP y quiz están todos
 * re-implementados con look propio en vez de los componentes compartidos
 * `v2/*` que usa el resto de las plantillas, pero hablando SIEMPRE con los
 * mismos endpoints/datos reales del backend (mismo /api/guests/[token]/confirm
 * que usa RSVPWizardV2, mismo /api/quiz que usa ProgressiveQuiz, etc). El
 * destello de sello dorado se dispara al confirmar asistencia, vía el mismo
 * callback onConfirmed que usaban los componentes compartidos.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Baloo_2, IBM_Plex_Mono } from "next/font/google";
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

// Baloo 2 no tiene variante itálica (a diferencia de Cormorant Garamond) --
// las palabras que en el resto de la colección usan font-style:italic acá
// se distinguen solo por color/peso (ver bbs-accent-italic ~> ifs-accent-italic
// más abajo, sin el italic real).
const ifsDisplay = Baloo_2({
  subsets: ["latin"],
  weight: ["500", "700", "800"],
  variable: "--ifs-display",
  display: "swap",
});

const ifsMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--ifs-mono",
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

interface InfantilSafariTemplateVerdeQuizQuestion {
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
  // Orden real del invitado dentro de la invitación (1, 2, 3...) -- el
  // backend no reserva mesas/sectores, así que el pase usa este número de
  // orden en vez de inventar una ubicación que no existe.
  orderNumber?: number;
}

interface InfantilSafariTemplateVerdeProps {
  invitation: Record<string, unknown>;
  guest?: GuestRecord | null;
  isPersonalized?: boolean;
}

// El backend no reserva mesas/sectores -- el pase muestra el orden real del
// invitado (001, 002...) en vez de un número inventado. Sin invitado
// específico (vista genérica /i/[slug], sin token personal) no hay orden
// real que mostrar.
function passNumberFrom(orderNumber: number | undefined): string {
  if (!orderNumber) return "---";
  return String(orderNumber).padStart(3, "0");
}

export function InfantilSafariTemplateVerde({ invitation, guest, isPersonalized = false }: InfantilSafariTemplateVerdeProps) {
  // Festejado/a: el nombre va SOLO (ej. "Martina"), NUNCA con un prefijo tipo
  // "Cumple de" pegado adelante (así lo tenía el mockup original, "Cumple de
  // Martina", como si fuera el nombre -- está mal) -- ese concepto ya lo dice
  // el kicker de arriba (coverKickerText), repetirlo en el nombre queda
  // redundante/roto ("UNA AVENTURA EN LA SABANA PARA CELEBRAR A" + "Cumple
  // de Martina" no tiene sentido leído junto; con "Martina" sola, sí).
  const festejado = String(invitation.nombreQuinceanera || invitation.nombreEvento || "");
  const namesTitle = festejado || "Mi Cumpleaños";

  // "Saludar por nombre del invitado/familia" (Administrar > Gestionar
  // invitados): si está activo, la portada saluda con el nombre del
  // invitado/familia en vez de mostrar a quién festejamos -- el kicker
  // cambia a una invitación personalizada en vez de anunciar la aventura.
  const showGuestNameInCover = Boolean(guest?.name) && invitation.mostrarNombreInvitadoEnSaludo !== false;
  const coverGuestName = resolveGuestNameDisplay(invitation, guest);
  const coverKickerText = showGuestNameInCover ? "UNA INVITACIÓN ESPECIAL PARA" : "UNA AVENTURA EN LA SABANA PARA CELEBRAR A";
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
    invitation.portadaMensaje || "Guardá la fecha. La aventura empieza puntual."
  );

  // Cronograma real (no ceremonia[0]/recepcion[1] inventados) -- se muestra
  // tal cual lo cargó el cliente en el wizard, en la misma hoja que Salón.
  const cronograma: CronoItem[] = safeJson<CronoItem[]>(String(invitation.cronogramaEventos ?? ""), []);

  // Esta familia es exclusiva del tipo de evento "Evento" (CUMPLEANOS) --
  // StepCeremonia.tsx nunca se muestra para ese tipo (ver
  // wizard-steps-config.ts), así que a diferencia de Guest Pass VIP no hay
  // panel de Ceremonia separado: "El lugar" tiene siempre 3 paneles fijos.
  const LUGAR_PANEL_COUNT = 3;

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
  const triviaPreguntas: InfantilSafariTemplateVerdeQuizQuestion[] = safeJson<InfantilSafariTemplateVerdeQuizQuestion[]>(String(invitation.triviaPreguntas ?? ""), []);
  const triviaTitulo = String(invitation.triviaTitulo || "¿Cuánto sabés de nosotros?");
  const quizEnabled = triviaHabilitada && triviaPreguntas.length > 0;

  // Frase: elegible/personalizable desde el wizard (StepPhrase) -- si está
  // deshabilitada o no se cargó texto, la sección entera no se muestra (ver
  // hasFrase más arriba): no hay frase default hardcodeada como fallback,
  // si no se quiere frase no debe aparecer ninguna.
  const frase = hasFrase ? String(invitation.frasePersonalizadaTexto) : "";
  const fraseWords = frase.split(/\s+/).filter(Boolean);
  // Combinación de colores del diseño original (ver img/frase.jpg): primera
  // mitad de la frase en color plano, segunda mitad en dorado itálico. Antes
  // esto se perdía apenas se cargaba una frase personalizada (quedaba toda
  // pareja); ahora se aplica siempre, partiendo por la mitad de la cantidad
  // real de palabras en vez de un índice fijo pensado solo para la frase
  // default de 6 palabras.
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
  // refs para el motor de motion (idéntico al portado desde el diseño,
  // pero corriendo sobre requestAnimationFrame en vez de setInterval(16ms))
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
  // El botón de música flota fijo en pantalla -- solo debe aparecer una vez
  // abierta la invitación, nunca sobre la tapa (ahí compite visualmente con
  // el botón "Abrir invitación").
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
        statusRef.current.style.color = "#EAF3DE";
      }
      if (stubRef.current) {
        stubRef.current.style.borderColor = "#6B8E4E";
        stubRef.current.style.boxShadow = "0 0 0 1px rgba(200,164,92,.35), 0 18px 50px -30px #6B8E4E";
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

    // reveals: [data-xin]
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

    // frase palabra por palabra -- aparecen progresivamente a medida que se
    // scrollea la sección (no todas de una vez al entrar en viewport).
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

        // reveals en viewport
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
          // Progreso de 0 (recién entra abajo) a 1 (llega arriba del todo) --
          // cada palabra se revela cuando el progreso pasa su umbral.
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

        // scroll horizontal pineado
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
            dot.style.background = i === active ? "#3E5A2E" : "rgba(20,20,27,0.18)";
          });
        });

        drifts.forEach((el) => {
          const amt = parseFloat(el.dataset.drift || "0") || 0;
          const r = el.getBoundingClientRect();
          const rel = (r.top + r.height / 2 - vh / 2) / vh;
          el.style.transform = `translate3d(0,${rel * amt}px,0)`;
        });

        // riel lateral
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
          if (railLabelRef.current) railLabelRef.current.style.color = light ? "#3E5A2E" : "#6B8E4E";
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
      className={`${ifsDisplay.variable} ${ifsMono.variable}`}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "calc(var(--vh, 1vh) * 100)",
        overflow: "hidden",
        background: "#160F07",
        fontFamily: "var(--ifs-mono), monospace",
        color: "#F4F1EA",
      }}
    >
      <style>{GP_CSS}</style>
      <style>{COVER_RESPONSIVE_STYLE}</style>

      <div ref={scrollerRef} data-scroller="1" className="ifs-scroller">
        <section data-tone="dark" data-screen-label="Save the Date" className="ifs-section" style={{ background: "radial-gradient(120% 80% at 50% 0%, #17141F 0%, #1C1409 55%, #160F07 100%)" }}>
          <span data-xin="1" data-dist="-60" className="ifs-kicker">01 — GUARDÁ LA FECHA</span>
          <div className="ifs-date-stack">
            <span data-xin="1" data-delay="60" data-dist="-110" className="ifs-date-num">{dayNum}</span>
            <span data-xin="1" data-delay="170" data-dist="140" className="ifs-date-month">{monthAbbr}</span>
            <span data-xin="1" data-delay="280" data-dist="220" className="ifs-date-num ifs-date-num--right">
              {String(fechaEvento.getFullYear()).slice(-2)}
            </span>
          </div>
          <div data-xin="1" data-delay="380" data-dist="-80" className="ifs-divider">
            <span className="ifs-divider-line" /><span>{weekday} · {hora} H</span>
          </div>
          <p data-xin="1" data-delay="460" className="ifs-lead">{portadaMensaje}</p>
          <AddToCalendarLink
            eventName={namesTitle}
            targetDate={eventDateTime}
            location={lugarNombre || direccion}
            description={portadaMensaje}
            className="ifs-cal-link"
          />

          <div data-drift="-70" className="ifs-medallion ifs-medallion--corner">
            <InfantilSafariTemplateVerdeMedallionCmp label="SF" sub="ACCESO" arcId="ifsArc1" arcText="SAFARI PARTY · ACCESO · " spin="normal" />
          </div>
        </section>

        {/* Foto principal con efecto cinemático, sin tinte de color
            (identidad de la familia queda solo en el marco/kicker, no en la
            foto en sí). Es una sección nueva, sin decoración original propia
            -- así que si a un breakpoint le falta su recorte, esta sección
            se colapsa a 0 (clase --no-mobile/--no-desktop, ver CSS) en vez
            de mostrar un placeholder vacío: nada de "hueco" en el scroll, se
            pasa directo de Guardá la fecha a Countdown en ese breakpoint. Si
            ningún recorte está cargado, la sección no se renderiza. */}
        {(photoMobile || photoDesktop) && (
          <section
            data-tone="dark"
            data-screen-label="Nuestra foto"
            className={`ifs-hero-photo-section${!photoMobile ? " ifs-hero-photo-section--no-mobile" : ""}${!photoDesktop ? " ifs-hero-photo-section--no-desktop" : ""}`}
          >
            <div className="ifs-hero-photo-frame">
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
            <span data-xin="1" data-dist="-60" className="ifs-kicker ifs-hero-photo-kicker">02 — PRIMER AVISTAJE</span>
          </section>
        )}

        <section id="countdown" data-tone="dark" data-screen-label="Countdown" className="ifs-section ifs-section--between" style={{ background: "radial-gradient(100% 60% at 50% 100%, #3A2A12 0%, #0D0B10 55%, #160F07 100%)" }}>
          <div className="ifs-scan-grid" />
          <div className="ifs-scanline" />
          <span data-xin="1" data-dist="-60" className="ifs-kicker" style={{ position: "relative" }}>{knPre(2)} — LA EXPEDICIÓN SALE EN</span>
          <div className="ifs-cd-grid">
            <InfantilSafariTemplateVerdeCdBox refEl={dRef} delay={40} dist={-90} label="DÍAS" />
            <InfantilSafariTemplateVerdeCdBox refEl={hRef} delay={120} dist={110} label="HORAS" />
            <InfantilSafariTemplateVerdeCdBox refEl={mRef} delay={200} dist={-140} label="MIN" />
            <InfantilSafariTemplateVerdeCdBox refEl={sRef} delay={280} dist={170} label="SEG" />
          </div>
          <div className="ifs-perf-strip" />
        </section>

        {hasFrase && (
          <section id="quote" data-tone="dark" data-screen-label="Frase" className="ifs-section" style={{ background: "radial-gradient(130% 90% at 86% 16%, #1C1727 0%, #0C0B11 52%, #160F07 100%)" }}>
            <div data-drift="-130" className="ifs-glow-blob" />
            <span data-xin="1" data-dist="-60" className="ifs-kicker" style={{ position: "relative" }}>{knPre(3)} — UN MENSAJE PARA VOS</span>
            <h2 ref={phraseRef} className="ifs-phrase" style={{ fontSize: fraseFontSize }}>
              {fraseWords.map((w, i) => (
                // El espacio va FUERA del span: el motor de reveal fuerza
                // `display:inline-block` en cada [data-w] (lo necesita para que
                // el transform/blur del scroll-reveal se aplique), y un espacio
                // de fin de línea DENTRO de un inline-block se colapsa a 0 --
                // como texto suelto entre spans, en cambio, se renderiza normal.
                <span key={i}>
                  <span data-w="1" className={i >= fraseAccentStart ? "ifs-accent-italic" : undefined}>
                    {w}
                  </span>{" "}
                </span>
              ))}
            </h2>
            <div data-xin="1" data-delay="120" data-dist="90" className="ifs-divider" style={{ position: "relative" }}>
              <span className="ifs-divider-line ifs-divider-line--long" /><span>{fechaCorta} — {hora} H</span>
            </div>
          </section>
        )}

        <div data-pan="1" data-screen-label="El lugar" className="ifs-pan">
          <div className="ifs-pan-sticky">
            <div data-strip="1" className="ifs-strip">
              <div id="details" data-tone="light" className="ifs-panel ifs-panel--between" style={{ background: "#EFEBE1", color: "#14141B" }}>
                <div className="ifs-hair-bg" />
                <div className="ifs-panel-top">
                  <span>{kn(3)} — CUÁNDO Y DÓNDE</span><span>01 / {LUGAR_PANEL_COUNT}</span>
                </div>
                <h2 className="ifs-panel-title">
                  {lugarNombre || "El lugar"}
                  {direccion && <><br /><span className="ifs-accent-serif">{direccion}</span></>}
                </h2>
                <div className="ifs-facts">
                  <div className="ifs-facts-row">
                    <span>HORARIO</span><span>{hora} H</span>
                  </div>
                  {dressCode && (
                    <div className="ifs-facts-row ifs-facts-row--last">
                      <span>CÓDIGO</span><span className="ifs-accent-serif-2">{dressCode.toUpperCase()}</span>
                    </div>
                  )}
                </div>
                {cronograma.length > 0 && (
                  <div className="ifs-crono">
                    {cronograma.map((item, i) => (
                      <div key={i} className="ifs-crono-row">
                        <span className="ifs-crono-time">{item.time || ""}</span>
                        <span className="ifs-crono-title">{item.title}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="ifs-seguir">SEGUÍ BAJANDO <span className="ifs-side-hint">→</span></div>
              </div>

              <div data-tone="light" className="ifs-panel ifs-panel--end" style={{ background: "#E4DFD3", color: "#14141B" }}>
                <svg viewBox="0 0 300 500" preserveAspectRatio="none" className="ifs-route-svg">
                  <path ref={routeRef} d="M18 468 C 130 400, 54 262, 152 220 S 254 140, 282 40" fill="none" stroke="#3E5A2E" strokeWidth={1.6} />
                  <circle cx={282} cy={40} r={5} fill="#3E5A2E" />
                </svg>
                <div className="ifs-panel-block">
                  <span className="ifs-mini-label">02 / {LUGAR_PANEL_COUNT}</span>
                  <span className="ifs-panel-title-sm">Cómo llegar</span>
                  {direccion && <span className="ifs-mini-label">{direccion}</span>}
                  {mapUrl && (
                    <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="ifs-link-cta">
                      ABRIR EN MAPAS →
                    </a>
                  )}
                </div>
              </div>

              <div data-tone="dark" className="ifs-panel ifs-panel--center" style={{ background: "#1C1409", color: "#F4F1EA" }}>
                <div className="ifs-medallion ifs-medallion--lg">
                  <InfantilSafariTemplateVerdeMedallionCmp label={dressCode ? dressCode.toUpperCase() : "ACCESO"} sub={`PASE Nº ${passNumber}`} arcId="ifsArc2" arcText={`ACCESO VIP · PASE Nº ${passNumber} · `} spin="reverse" title="Reservado" />
                </div>
                <span className="ifs-mini-label">{LUGAR_PANEL_COUNT} / {LUGAR_PANEL_COUNT} — TU UBICACIÓN</span>
              </div>
            </div>
            <InfantilSafariTemplateVerdeDots count={LUGAR_PANEL_COUNT} />
          </div>
        </div>

        <section data-tone="dark" data-screen-label="Check-in" className="ifs-section" style={{ background: "radial-gradient(110% 70% at 50% 100%, #17141F 0%, #1C1409 60%, #160F07 100%)" }}>
          <span data-xin="1" data-dist="-60" className="ifs-kicker">{kn(4)} — CHECK-IN</span>
          <h2 data-xin="1" data-delay="80" data-dist="130" className="ifs-h2">
            Confirmá<br /><span className="ifs-accent-italic">tu acceso</span>
          </h2>

          {rsvpEnabled ? (
            <div data-xin="1" data-delay="170" data-dist="-90" className="ifs-rsvp">
              <InfantilSafariTemplateVerdeRsvpCard
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
            <p className="ifs-lead">La confirmación de asistencia está cerrada por el momento.</p>
          )}
        </section>

        <div id="album" data-pan="1" data-screen-label="Álbum" className="ifs-pan">
          <div className="ifs-pan-sticky">
            <div data-strip="1" className="ifs-strip">
              {photoPages.map((page, pageIndex) => (
                <div key={pageIndex} data-tone="light" className="ifs-panel ifs-panel--gap" style={{ background: ALBUM_TONES[pageIndex % ALBUM_TONES.length], color: "#14141B" }}>
                  <div className="ifs-hair-bg" />
                  <div className="ifs-panel-top">
                    <span>{kn(5)} — ARCHIVO / {String(allPhotos.length).padStart(3, "0")}</span><span>HOJA {String(pageIndex + 1).padStart(2, "0")} / {String(photoPages.length).padStart(2, "0")}</span>
                  </div>
                  {pageIndex === 0 && <h2 className="ifs-panel-title-md">Álbum <span className="ifs-accent-serif">de fotos</span></h2>}
                  <div className="ifs-mosaic">
                    {page.length > 0 ? page.map((url, i) => (
                      <div
                        key={i}
                        className={`ifs-mosaic-cell${i === 0 ? " ifs-mosaic-cell--featured" : ""}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => setExpandedPhoto(url)}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setExpandedPhoto(url); }}
                        aria-label={`Ampliar foto ${i + 1}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" className="ifs-mosaic-img" />
                      </div>
                    )) : (
                      <span className="ifs-photo-placeholder">Sin fotos todavía</span>
                    )}
                  </div>
                  <div className="ifs-seguir ifs-seguir--split">
                    <span>{allPhotos.length} FOTOS SUBIDAS</span>
                    <span className="ifs-accent-serif-2">SEGUÍ →</span>
                  </div>
                </div>
              ))}

              <div data-tone="light" className="ifs-panel ifs-panel--gap" style={{ background: "#EDE8DE", color: "#14141B" }}>
                <span className="ifs-panel-top" style={{ display: "block" }}>HOJA {String(photoPages.length + 1).padStart(2, "0")} — EN VIVO</span>
                <h2 className="ifs-panel-title">Todo lo que<br /><span className="ifs-accent-serif">vamos a recordar</span></h2>
                <div className="ifs-album-embed">
                  {livePhotos.length > 0 ? (
                    <LiveAlbumStrip photos={livePhotos} tone="light" accentColor="#3E5A2E" />
                  ) : (
                    <div className="ifs-live-placeholder">
                      <span className="ifs-mini-label">
                        {eventHasStarted
                          ? "Todavía no se subió nada en vivo."
                          : "Esta sección se activa el día de la fiesta -- ahí vas a poder ver todo lo que subamos en vivo."}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <InfantilSafariTemplateVerdeDots count={photoPages.length + 1} />
          </div>
        </div>

        {sugerenciaMusicaHabilitada && (
          <section id="music" data-tone="dark" data-screen-label="Música" className="ifs-section" style={{ background: "#1C1409" }}>
            <span data-xin="1" data-dist="-60" className="ifs-kicker">{kn(6)} — SUGERENCIA DE MÚSICA</span>
            <h2 data-xin="1" data-delay="80" data-dist="140" className="ifs-h2">¿Qué animal<br /><span className="ifs-accent-italic">es tu favorito?</span></h2>
            <div data-xin="1" data-delay="160" data-dist="-80" className="ifs-eq">
              {[0, 0.18, 0.36, 0.54, 0.72].map((delay, i) => (
                <span key={i} className="ifs-eq-bar" style={{ animationDelay: `${delay}s`, background: i === 2 ? "#EAF3DE" : "#6B8E4E" }} />
              ))}
            </div>
            <div data-xin="1" data-delay="240" data-dist="110" className="ifs-song-wrap">
              <InfantilSafariTemplateVerdeSongSuggestion
                invitationId={String(invitation.id ?? "")}
                guestToken={guest?.uniqueToken}
                guestName={guestName || "Invitado"}
              />
            </div>
          </section>
        )}

        {showBankSection && (
          <section id="banco" data-tone="dark" data-screen-label="Regalos" className="ifs-section" style={{ background: "#1C1409" }}>
            <span data-xin="1" data-dist="-60" className="ifs-kicker">{sugerenciaMusicaHabilitada ? kn(7) : kn(6)} — REGALOS Y PAGOS</span>
            <h2 data-xin="1" data-delay="80" data-dist="140" className="ifs-h2">
              Si querés<br /><span className="ifs-accent-italic">sumarte</span>
            </h2>
            <div data-xin="1" data-delay="160" data-dist="-80" className="ifs-bank-wrap">
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
                  accentColor="#6B8E4E"
                  cardBg="rgba(20,20,27,0.72)"
                  cardBorder="#2A2417"
                  textPrimary="#F4F1EA"
                  textSecondary="#A8A292"
                  InfoRow={InfantilSafariTemplateVerdeInfoRow}
                  CopyField={InfantilSafariTemplateVerdeCopyField}
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
                  accentColor="#6B8E4E"
                  cardBg="rgba(20,20,27,0.72)"
                  cardBorder="#2A2417"
                  textPrimary="#F4F1EA"
                  textSecondary="#A8A292"
                  InfoRow={InfantilSafariTemplateVerdeInfoRow}
                  CopyField={InfantilSafariTemplateVerdeCopyField}
                />
              )}
            </div>
          </section>
        )}

        {quizEnabled && (
          <section id="quiz" data-tone="dark" data-screen-label="Quiz" className="ifs-section" style={{ background: "#1C1409" }}>
            <span data-xin="1" data-dist="-60" className="ifs-kicker">{knAcc([sugerenciaMusicaHabilitada, showBankSection].filter(Boolean).length + 6)} — EL JUEGO</span>
            <h2 data-xin="1" data-delay="80" data-dist="140" className="ifs-h2" style={{ fontSize: "clamp(28px, 6vw, 44px)" }}>
              {triviaTitulo}
            </h2>
            <div data-xin="1" data-delay="160" data-dist="-80">
              <InfantilSafariTemplateVerdeQuiz
                preguntas={triviaPreguntas}
                invitationId={String(invitation.id ?? "")}
                guestToken={guest?.uniqueToken}
                guestName={guestName || "Invitado"}
              />
            </div>
          </section>
        )}

        <section data-tone="dark" data-screen-label="Tu pase" className="ifs-section ifs-section--between" style={{ padding: "96px max(30px, calc((100% - 560px) / 2)) 48px max(24px, calc((100% - 560px) / 2))", background: "radial-gradient(120% 70% at 50% 100%, #17141F 0%, #1C1409 55%, #160F07 100%)" }}>
          <span data-xin="1" data-dist="-60" className="ifs-kicker">{knAcc([sugerenciaMusicaHabilitada, showBankSection, quizEnabled].filter(Boolean).length + 6)} — GUARDÁ TU PASE</span>
          <div data-xin="1" data-delay="100" data-dist="130" className="ifs-final-card">
            <div className="ifs-medallion ifs-medallion--final">
              <InfantilSafariTemplateVerdeMedallionCmp label="SF" sub={confirmed ? "CONFIRMADO" : "PENDIENTE"} arcId="ifsArc3" arcText={`${namesTitle.toUpperCase()} · ${fechaCorta} · `} spin="reverse" />
            </div>
            <span className="ifs-mini-label ifs-accent-serif-2">PASE Nº {passNumber} · ADMIT {guestAdults + guestTeens + guestChildren || 1}</span>
            <span className="ifs-final-names">{namesTitle}</span>
            <span className="ifs-mini-label" style={{ color: "#A8A292" }}>{fechaCorta} — {hora} H</span>
            <div className="ifs-barcode" style={{ width: "60%", height: 26, opacity: 0.6 }} />
          </div>
          <div className="ifs-final-footer">
            <span>NO TRANSFERIBLE</span>
            <span className="ifs-replay" onClick={reset}>VER LA APERTURA OTRA VEZ ↺</span>
          </div>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <InfoAdicionalSection invitation={invitation as any} />
          <div className="ifs-footer-credit">
            <LogoFooterCredit bgColor="transparent" />
          </div>
        </section>
      </div>

      <div ref={railRef} className="ifs-rail">
        <span ref={railTopRef} className="ifs-rail-top">PASE Nº {passNumber}</span>
        <div ref={railLineRef} className="ifs-rail-line">
          <span ref={railBarRef} className="ifs-rail-bar" />
        </div>
        <span ref={railLabelRef} className="ifs-rail-label">SAVE THE DATE</span>
      </div>

      <div ref={coverRef} className="ifs-cover">
        <div ref={topRef} className="ifs-cover-half ifs-cover-half--top">
          <InfantilSafariTemplateVerdeCoverHalf
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
            <div className="ifs-cover-cta">ABRIR INVITACIÓN</div>
          </InfantilSafariTemplateVerdeCoverHalf>
        </div>
        <div ref={bottomRef} className="ifs-cover-half ifs-cover-half--bottom">
          <InfantilSafariTemplateVerdeCoverHalf
            kickerText={coverKickerText}
            namesTitle={coverNamesTitle}
            fechaCorta={fechaCorta}
            passNumber={passNumber}
            dressCode={dressCode}
            hora={hora}
            photoMobile={photoMobile}
            photoDesktop={photoDesktop}
          >
            <button onClick={open} className="ifs-cover-cta ifs-cover-cta--btn">ABRIR INVITACIÓN</button>
          </InfantilSafariTemplateVerdeCoverHalf>
        </div>
      </div>

      <div ref={hintRef} className="ifs-hint">DESLIZÁ ↓</div>

      {expandedPhoto && (
        <div
          className="ifs-lightbox"
          onClick={() => setExpandedPhoto(null)}
          onContextMenu={(e) => e.preventDefault()}
        >
          <button
            type="button"
            className="ifs-lightbox-close"
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
            className="ifs-lightbox-img"
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

function InfantilSafariTemplateVerdeCdBox({ refEl, delay, dist, label }: { refEl: React.RefObject<HTMLSpanElement | null>; delay: number; dist: number; label: string }) {
  return (
    <div data-xin="1" data-delay={delay} data-dist={dist} className="ifs-cd-box">
      <span ref={refEl} className="ifs-cd-num">—</span>
      <span className="ifs-cd-label">{label}</span>
    </div>
  );
}

function InfantilSafariTemplateVerdeDots({ count = 3 }: { count?: number }) {
  return (
    <div data-dots="1" className="ifs-dots">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} data-dot={i} className="ifs-dot" />
      ))}
    </div>
  );
}

function InfantilSafariTemplateVerdeMedallionCmp({
  label,
  sub,
  arcId,
  arcText,
  spin,
  title,
  compact,
}: {
  label: string;
  sub: string;
  arcId: string;
  arcText: string;
  spin: "normal" | "reverse" | "none";
  title?: string;
  compact?: boolean;
}) {
  // Duración fija por instancia (no en cada render) -- Math.random() directo
  // en el render viola la regla de pureza de React. useState (no useMemo) es
  // la forma admitida de calcular un valor no determinístico una sola vez.
  const [ringDuration] = useState(() => 18 + Math.random() * 4);
  return (
    <>
      <div className="ifs-medallion-ring" style={{ animation: spin === "none" ? "none" : `ifsRing ${ringDuration}s linear infinite` }} />
      <div className="ifs-medallion-core">
        {title && <span className="ifs-medallion-sub">SECTOR</span>}
        <span className={compact ? "ifs-medallion-label-sm" : "ifs-medallion-label"}>{title || label}</span>
        {sub && <span className="ifs-medallion-sub ifs-medallion-sub--accent">{sub}</span>}
      </div>
      {arcId && (
        <svg viewBox="0 0 100 100" className="ifs-medallion-arc" style={{ animation: spin === "reverse" ? "ifsRingRev 32s linear infinite" : "ifsRingRev 34s linear infinite" }}>
          <defs>
            <path id={arcId} d="M50 50 m -38 0 a 38 38 0 1 1 76 0 a 38 38 0 1 1 -76 0" fill="none" />
          </defs>
          <text className="ifs-medallion-arc-text">
            <textPath href={`#${arcId}`}>{arcText}{arcText}</textPath>
          </text>
        </svg>
      )}
    </>
  );
}

function InfantilSafariTemplateVerdeCopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div className="ifs-bank-row">
      <div style={{ minWidth: 0, flex: 1 }}>
        <span className="ifs-bank-row-label">{label}</span>
        <span className="ifs-bank-row-value">{value}</span>
      </div>
      <button type="button" className="ifs-bank-copy" onClick={handle}>
        {copied ? "✓ Copiado" : "Copiar"}
      </button>
    </div>
  );
}

// Reimplementación propia del RSVP (ver img/confirmacion.jpg): filas de
// datos + el ticket/sello dorado ya existente en la plantilla, en vez del
// look genérico de <RSVPWizardV2>. Habla con el mismo endpoint/payload que
// ese componente (/api/guests/[token]/confirm o /api/rsvp), así que no
// cambia ningún dato que pida el backend, solo cómo se ve.
function InfantilSafariTemplateVerdeRsvpCard({
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
      <div className="ifs-rsvp-declined">
        <p className="ifs-rsvp-declined-text">Gracias por avisarnos. Si cambiás de idea, este mismo acceso sigue activo.</p>
        <button type="button" className="ifs-rsvp-btn ifs-rsvp-btn--ghost" onClick={() => setStatus("PENDING")}>
          CAMBIÉ DE IDEA
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="ifs-rsvp-rows">
        <div className="ifs-rsvp-row">
          {/* Con más de un invitado el nombre suele ser de un grupo/familia
              ("Familia Juarez"), no el de una persona puntual -- la etiqueta
              "Nombre y apellido" queda rara ahí (ver img/confirmacion.jpg). */}
          <span>{totalGuests > 1 ? "RESERVADO PARA" : "NOMBRE Y APELLIDO"}</span>
          <span>{guestName || "—"}</span>
        </div>

        {totalGuests > 1 && status !== "CONFIRMED" && (
          <div className="ifs-rsvp-row">
            <span>ADULTOS</span>
            <div className="ifs-rsvp-stepper">
              <button type="button" onClick={() => setAdultCount((v) => Math.max(1, v - 1))} disabled={adultCount <= 1}>−</button>
              <span>{String(adultCount).padStart(2, "0")}</span>
              <button type="button" onClick={() => setAdultCount((v) => Math.min(maxAdults, v + 1))} disabled={adultCount >= maxAdults}>+</button>
            </div>
          </div>
        )}
        {maxTeens > 0 && status !== "CONFIRMED" && (
          <div className="ifs-rsvp-row">
            <span>ADOLESCENTES</span>
            <div className="ifs-rsvp-stepper">
              <button type="button" onClick={() => setTeenCount((v) => Math.max(0, v - 1))} disabled={teenCount <= 0}>−</button>
              <span>{String(teenCount).padStart(2, "0")}</span>
              <button type="button" onClick={() => setTeenCount((v) => Math.min(maxTeens, v + 1))} disabled={teenCount >= maxTeens}>+</button>
            </div>
          </div>
        )}
        {maxChildren > 0 && status !== "CONFIRMED" && (
          <div className="ifs-rsvp-row">
            <span>NIÑOS</span>
            <div className="ifs-rsvp-stepper">
              <button type="button" onClick={() => setChildCount((v) => Math.max(0, v - 1))} disabled={childCount <= 0}>−</button>
              <span>{String(childCount).padStart(2, "0")}</span>
              <button type="button" onClick={() => setChildCount((v) => Math.min(maxChildren, v + 1))} disabled={childCount >= maxChildren}>+</button>
            </div>
          </div>
        )}
        {status === "CONFIRMED" && (
          <>
            {totalGuests > 1 && adultCount > 0 && <div className="ifs-rsvp-row"><span>ADULTOS</span><span>{String(adultCount).padStart(2, "0")}</span></div>}
            {teenCount > 0 && <div className="ifs-rsvp-row"><span>ADOLESCENTES</span><span>{String(teenCount).padStart(2, "0")}</span></div>}
            {childCount > 0 && <div className="ifs-rsvp-row"><span>NIÑOS</span><span>{String(childCount).padStart(2, "0")}</span></div>}
          </>
        )}

        {status !== "CONFIRMED" ? (
          <div className="ifs-rsvp-row">
            <span>RESTRICCIÓN ALIMENTARIA</span>
            <input
              value={dietary}
              onChange={(e) => setDietary(e.target.value)}
              placeholder="—"
              className="ifs-rsvp-input"
            />
          </div>
        ) : (
          <div className="ifs-rsvp-row">
            <span>RESTRICCIÓN ALIMENTARIA</span>
            <span>{guestRestrictions || dietary || "—"}</span>
          </div>
        )}

        {hasPayment && paymentAmount != null && !isExempt && (
          // El detalle de precio queda visible en los dos estados (antes y
          // después de confirmar) -- antes solo se veía mientras se elegía
          // la cantidad, y una vez confirmado desaparecía justo cuando el
          // invitado más lo necesita: saber cuánto tiene que pagar en total.
          <div className="ifs-rsvp-row ifs-rsvp-row--payment">
            <span>VALOR</span>
            <div className="ifs-rsvp-payment-value">
              <span className="ifs-rsvp-payment-total">{formatARS(totalPayment)}</span>
              {(adultCount > 0 || teenCount > 0 || childCount > 0) && (
                <div className="ifs-rsvp-payment-detail">
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

      <div ref={stubRef} className="ifs-stub">
        <div className="ifs-stub-top">
          <span>PASE Nº {passNumber}</span>
          <span ref={statusRef} className="ifs-stub-status">
            {confirmed ? "ACCESO CONFIRMADO" : "PENDIENTE"}
          </span>
        </div>
        <div ref={sealRef} className="ifs-seal">
          <InfantilSafariTemplateVerdeMedallionCmp label="SF" sub="" arcId="" arcText="" spin="none" compact />
        </div>
        <div ref={beamRef} className="ifs-beam" />
        <div className="ifs-barcode" style={{ width: "70%", opacity: confirmed ? 0.7 : 0.2 }} />
      </div>

      {error && <p className="ifs-rsvp-error">{error}</p>}

      {status !== "CONFIRMED" ? (
        <>
          <button type="button" className="ifs-rsvp-btn" disabled={isSubmitting} onClick={() => submit("CONFIRMA")}>
            {isSubmitting ? "GUARDANDO…" : "CONFIRMAR ASISTENCIA"}
          </button>
          <button type="button" className="ifs-rsvp-btn ifs-rsvp-btn--ghost" disabled={isSubmitting} onClick={() => submit("NO_ASISTE")}>
            NO VOY A PODER ASISTIR
          </button>
        </>
      ) : (
        <button type="button" className="ifs-rsvp-btn ifs-rsvp-btn--ghost" onClick={() => setStatus("PENDING")}>
          MODIFICAR ASISTENCIA
        </button>
      )}
    </>
  );
}

interface GpSongItem {
  id: string;
  title: string;
  artist: string;
  guestName: string;
}

// Reimplementación minimalista del look original del mockup (ver
// img/musica.JPG) -- misma API que <SongSuggestion> (/api/songs), pero sin
// el look de tarjetas redondeadas del componente compartido.
function InfantilSafariTemplateVerdeSongSuggestion({ invitationId, guestToken, guestName }: { invitationId: string; guestToken?: string; guestName: string }) {
  const [songs, setSongs] = useState<GpSongItem[]>([]);
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
    <div className="ifs-song">
      <form onSubmit={handleSubmit} className="ifs-song-row">
        <div className="ifs-song-inputs">
          <input value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="ARTISTA" maxLength={80} className="ifs-song-input" />
          <span className="ifs-song-sep">—</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="TEMA" maxLength={100} className="ifs-song-input" />
        </div>
        <button type="submit" disabled={isSubmitting} className="ifs-song-submit">+ {isSubmitting ? "..." : "SUMAR"}</button>
      </form>
      {error && <p className="ifs-song-error">{error}</p>}
      {songs.length > 0 && (
        <div className="ifs-song-list">
          {songs.slice(0, 12).map((s, i) => (
            <div key={s.id} className="ifs-song-item">
              <span className="ifs-song-item-title">{String(i + 1).padStart(2, "0")} · {s.artist} — {s.title}</span>
              <span className="ifs-song-item-by">Sumado por {s.guestName || "Invitado"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Todas las preguntas se muestran juntas en la misma página (no un wizard
// paso a paso) -- misma API /api/quiz que usa el resto de las plantillas.
function InfantilSafariTemplateVerdeQuiz({ preguntas, invitationId, guestToken, guestName }: { preguntas: InfantilSafariTemplateVerdeQuizQuestion[]; invitationId: string; guestToken?: string; guestName?: string }) {
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
    <div className="ifs-quiz">
      {preguntas.map((q, qi) => {
        const correctIdx = q.respuestaCorrecta ?? q.correcta;
        return (
          <div key={qi} className="ifs-quiz-q">
            <span className="ifs-quiz-q-num">{String(qi + 1).padStart(2, "0")}</span>
            <p className="ifs-quiz-q-text">{q.pregunta}</p>
            <div className="ifs-quiz-opts">
              {q.opciones.map((opt, oi) => {
                const chosen = picks[qi] === oi;
                const revealed = picks[qi] !== undefined && correctIdx !== undefined;
                let stateClass = "";
                if (revealed) {
                  if (oi === correctIdx) stateClass = " ifs-quiz-opt--correct";
                  else if (chosen) stateClass = " ifs-quiz-opt--wrong";
                } else if (chosen) {
                  stateClass = " ifs-quiz-opt--picked";
                }
                return (
                  <button
                    key={oi}
                    type="button"
                    className={`ifs-quiz-opt${stateClass}`}
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
        <div className="ifs-quiz-result">
          <p className="ifs-quiz-result-score">
            {isSaving ? "GUARDANDO…" : `RESPONDISTE ${score} DE ${preguntas.length} CORRECTAMENTE`}
          </p>
          {!isSaving && stats && stats.count > 0 && (
            <p className="ifs-quiz-result-stat">
              El promedio del resto de los invitados ({stats.count}) es del {stats.avg}%.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function InfantilSafariTemplateVerdeInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="ifs-bank-row">
      <div style={{ minWidth: 0, flex: 1 }}>
        <span className="ifs-bank-row-label">{label}</span>
        <span className="ifs-bank-row-value">{value}</span>
      </div>
    </div>
  );
}

function InfantilSafariTemplateVerdeCoverHalf({
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
    <div className="ifs-cover-inner">
      {/* Cada recorte reemplaza el degradé de fondo SOLO en su propio
          breakpoint -- el resto de la ornamentación (glow, sunburst,
          medallón, nombres, CTA) se mantiene arriba sin cambios, así la
          identidad de la familia sigue siendo reconocible. Si un
          breakpoint no tiene recorte cargado, ese div simplemente no se
          renderiza y el degradé de fondo original de la plantilla (que
          sigue debajo sin tocar) se ve igual que siempre para ese tamaño. */}
      {photoMobile && (
        <div className="acp-mobile-only">
          <AnimatedCoverPhoto
            photoSrc={photoMobile}
            tint
            tintColor1="#6B8E4E"
            tintColor2="#1C1409"
            effect="enfoque"
            scrimColorRgb="8,8,11"
          />
        </div>
      )}
      {photoDesktop && (
        <div className="acp-desktop-only">
          <AnimatedCoverPhoto
            photoSrc={photoDesktop}
            tint
            tintColor1="#6B8E4E"
            tintColor2="#1C1409"
            effect="enfoque"
            scrimColorRgb="8,8,11"
          />
        </div>
      )}
      <div className="ifs-cover-glow" />
      <div className="ifs-cover-texture" />
      <div className="ifs-cover-content">
        <div className="ifs-cover-top-row">
          <span>PASE Nº {passNumber}</span><span className="ifs-accent-serif-2">ADMIT ONE</span>
        </div>
        <div className="ifs-cover-center">
          <span ref={kickerRef} className="ifs-cover-kicker">{kickerText}</span>
          <h1 ref={namesRef} className="ifs-cover-names">{namesTitle}</h1>
          <span className="ifs-cover-rule" />
          <span className="ifs-cover-date">{fechaCorta}</span>
        </div>
        <div className="ifs-cover-bottom">
          <div ref={perfRef} className="ifs-perf-strip ifs-perf-strip--reveal ifs-perf-strip--cover" />
          <div className="ifs-cover-facts">
            {dressCode && <span>{dressCode.toUpperCase()}</span>}
            <span>{hora} H</span>
          </div>
          {children}
          <div className="ifs-barcode-wrap">
            <div className="ifs-barcode" style={{ width: "62%", height: "clamp(15px, 3vh, 26px)", opacity: 0.6 }} />
            <span className="ifs-mini-label ifs-mini-label--cover" style={{ color: "#56534A" }}>NO TRANSFERIBLE</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Hoja de estilos (traslada 1:1 los tokens visuales del diseño aprobado)
// ---------------------------------------------------------------------
const GP_CSS = `
  .ifs-scroller { position: absolute; inset: 0; overflow-y: auto; overflow-x: hidden; opacity: 0; transition: opacity 900ms ease 260ms; scrollbar-width: none; }
  .ifs-scroller::-webkit-scrollbar { width: 0; height: 0; }

  a { color: #6B8E4E; text-decoration: none; }
  a:hover { color: #EAF3DE; }

  @keyframes ifsFoil { to { transform: rotate(360deg); } }
  @keyframes ifsRing { to { transform: rotate(360deg); } }
  @keyframes ifsRingRev { to { transform: rotate(-360deg); } }
  @keyframes ifsScan { 0% { transform: translateY(0); opacity: 0; } 12% { opacity: .85; } 88% { opacity: .85; } 100% { transform: translateY(320px); opacity: 0; } }
  @keyframes ifsEq { 0%,100% { transform: scaleY(.25); } 50% { transform: scaleY(1); } }
  @keyframes ifsHint { 0%,100% { transform: translateY(0); } 50% { transform: translateY(7px); } }
  @keyframes ifsSide { 0%,100% { transform: translateX(0); } 50% { transform: translateX(7px); } }
  @media (prefers-reduced-motion: reduce) { .ifs-scroller * { animation: none !important; } }

  .ifs-section { min-height: calc(var(--vh, 1vh) * 100); position: relative; display: flex; flex-direction: column; justify-content: center; gap: 30px; padding: 96px max(30px, calc((100% - 560px) / 2)) 110px max(24px, calc((100% - 560px) / 2)); overflow: hidden; }
  .ifs-section--between { justify-content: space-between; }

  /* EXPERIMENTAL: foto principal (ver rama experimento-foto-storytelling).
     Mobile: la foto ocupa toda la sección, borde a borde, como el resto de
     la colección Flat. Desktop: se enmarca con un borde dorado propio de la
     familia en vez de estirarse -- "bien compuesta y proporcionada" en
     pantallas anchas en lugar de recortada/deformada. */
  .ifs-hero-photo-section { min-height: calc(var(--vh, 1vh) * 100); position: relative; overflow: hidden; background: #160F07; }
  .ifs-hero-photo-frame { position: absolute; inset: 0; overflow: hidden; }
  .ifs-hero-photo-kicker { position: absolute; left: 0; right: 0; bottom: 0; z-index: 2; padding: 0 max(24px, calc((100% - 560px) / 2)) 48px; }
  /* Sin recorte propio, la sección se colapsa a 0 en ESE breakpoint en vez
     de mostrar un hueco vacío -- no hay decoración original a la que
     volver (es una sección nueva), así que "sin foto" acá significa "no
     ocupa lugar", no "mostrar un placeholder". */
  @media (max-width: 767px) {
    .ifs-hero-photo-section--no-mobile { min-height: 0; height: 0; }
  }
  @media (min-width: 768px) {
    .ifs-hero-photo-frame { inset: 64px max(24px, calc((100% - 900px) / 2)); border: 1px solid rgba(200,164,92,.3); }
    .ifs-hero-photo-kicker { bottom: 40px; }
    .ifs-hero-photo-section--no-desktop { min-height: 0; height: 0; }
  }

  .ifs-kicker { font-size: 9.5px; letter-spacing: 0.34em; color: #8A8577; }

  .ifs-date-stack { display: flex; flex-direction: column; gap: 2px; }
  .ifs-date-num { font-family: var(--ifs-display), serif; font-size: clamp(66px, 23vw, 140px); line-height: 0.82; letter-spacing: -0.04em; }
  .ifs-date-num--right { text-align: right; line-height: 0.86; }
  .ifs-date-month { font-family: var(--ifs-display), serif; font-style: italic; font-size: clamp(50px, 18vw, 104px); line-height: 0.9; color: #6B8E4E; padding-left: 12%; }

  .ifs-divider { display: flex; align-items: center; gap: 16px; font-size: 10px; letter-spacing: 0.26em; color: #8A8577; }
  .ifs-divider-line { width: 52px; height: 1px; background: #6B8E4E; display: inline-block; }
  .ifs-divider-line--long { width: 64px; }

  .ifs-lead { margin: 0; font-family: var(--ifs-display), serif; font-style: italic; font-size: 20px; line-height: 1.4; color: #A8A292; max-width: 330px; }
  .ifs-cal-link { display: inline-flex; align-items: center; gap: 7px; margin-top: 4px; font-family: var(--ifs-mono), monospace; font-size: 10px; letter-spacing: 0.24em; text-transform: uppercase; color: #8A8577; text-decoration: none; transition: color 200ms ease; }
  .ifs-cal-link:hover { color: #6B8E4E; }

  .ifs-medallion { position: relative; }
  .ifs-medallion--corner { position: absolute; right: max(32px, calc((100% - 560px) / 2)); top: 12%; width: clamp(86px, 22vw, 116px); aspect-ratio: 1; }
  .ifs-medallion--lg { width: clamp(130px, 34vw, 178px); aspect-ratio: 1; margin: 0 auto; }
  .ifs-medallion--final { width: clamp(104px, 26vw, 132px); aspect-ratio: 1; margin: -12px auto 0; }
  .ifs-medallion-ring { position: absolute; inset: 0; border-radius: 50%; background: conic-gradient(from 0deg, #6E5AA8, #4E7F86, #6B8E4E, #EAF3DE, #6E5AA8); filter: saturate(.75); }
  .ifs-medallion-core { position: absolute; inset: 3px; border-radius: 50%; background: #0C0C11; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; text-align: center; padding: 6px; }
  .ifs-medallion-label { font-family: var(--ifs-display), serif; font-size: 26px; line-height: 1; color: #EAF3DE; }
  .ifs-medallion-label-sm { font-family: var(--ifs-display), serif; font-size: 16px; color: #EAF3DE; }
  .ifs-medallion-sub { font-size: 6.5px; letter-spacing: 0.24em; color: #8A8577; }
  .ifs-medallion-sub--accent { color: #6B8E4E; }
  .ifs-medallion-arc { position: absolute; inset: -14%; }
  /* Opacity baja a propósito: el anillo gira sin parar, así que en algún
     momento de su vuelta una letra (ej. la "P" de "PASS") queda justo al
     lado de la etiqueta central ("ACCESO") y, al ser el mismo color/fuente,
     se leen como una sola palabra pegada ("Pacceso"). Atenuado no compite
     con el texto del centro y se lee como textura decorativa del anillo. */
  .ifs-medallion-arc-text { font-size: 7px; letter-spacing: 1.6px; fill: #6B8E4E; opacity: 0.4; font-family: var(--ifs-mono), monospace; }

  .ifs-scan-grid { position: absolute; inset: 0; background: repeating-linear-gradient(0deg, rgba(200,164,92,0.06) 0 1px, transparent 1px 5px); pointer-events: none; }
  .ifs-scanline { position: absolute; left: 0; right: 0; top: 30%; height: 2px; background: linear-gradient(90deg, transparent, #EAF3DE, transparent); animation: ifsScan 6s linear infinite; pointer-events: none; }

  .ifs-cd-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; position: relative; }
  .ifs-cd-box { border: 1px solid #2A2417; background: rgba(20,20,27,0.72); padding: 18px 15px; display: flex; flex-direction: column; gap: 6px; overflow: hidden; }
  .ifs-cd-num { font-family: var(--ifs-display), serif; font-size: clamp(48px, 14vw, 80px); line-height: 0.82; color: #EAF3DE; display: inline-block; }
  .ifs-cd-label { font-size: 9px; letter-spacing: 0.3em; color: #6B8E4E; }
  .ifs-perf-strip { height: 12px; position: relative; background: radial-gradient(circle at 6px 50%, #160F07 3.4px, transparent 3.8px) 0 0/12px 12px repeat-x; opacity: .85; }
  .ifs-perf-strip--reveal { clip-path: inset(0 100% 0 0); transition: clip-path 900ms cubic-bezier(.16,1,.3,1) 500ms; }
  .ifs-perf-strip--cover { opacity: .9; }

  .ifs-glow-blob { position: absolute; right: -26%; top: 4%; width: 82vw; max-width: 540px; aspect-ratio: 1; border-radius: 50%; background: conic-gradient(from 200deg, rgba(110,90,168,0.5), rgba(78,127,134,0.32), rgba(200,164,92,0.46), rgba(110,90,168,0.5)); filter: blur(80px); opacity: .4; animation: ifsFoil 30s linear infinite; }
  .ifs-phrase { margin: 0; position: relative; font-family: var(--ifs-display), serif; font-weight: 400; font-size: clamp(50px, 15vw, 96px); line-height: 0.92; letter-spacing: -0.03em; }
  .ifs-accent-italic { font-style: italic; color: #6B8E4E; }
  .ifs-accent-serif { font-style: italic; color: #3E5A2E; font-family: var(--ifs-display), serif; }
  .ifs-accent-serif-2 { color: #3E5A2E; }
  .ifs-h2 { margin: 0; font-family: var(--ifs-display), serif; font-weight: 400; font-size: clamp(40px, 12vw, 68px); line-height: 0.96; }

  .ifs-pan { height: 260vh; position: relative; }
  .ifs-pan-sticky { position: sticky; top: 0; height: calc(var(--vh, 1vh) * 100); overflow: hidden; }
  .ifs-strip { position: absolute; top: 0; left: 0; height: 100%; display: flex; width: 300vw; will-change: transform; }
  .ifs-panel { flex: 0 0 100vw; min-width: 0; height: 100%; box-sizing: border-box; position: relative; overflow: hidden; display: flex; flex-direction: column; padding: 84px max(24px, calc((100vw - 560px) / 2)) 100px; gap: 22px; }
  .ifs-panel--between { justify-content: space-between; }
  .ifs-panel--end { justify-content: flex-end; }
  .ifs-panel--center { align-items: center; justify-content: center; text-align: center; }
  .ifs-panel--gap { gap: clamp(14px, 2.4vh, 22px); padding: clamp(52px, 9vh, 84px) max(24px, calc((100vw - 600px) / 2)) clamp(62px, 11vh, 100px); }
  .ifs-hair-bg { position: absolute; inset: 0; background: repeating-linear-gradient(90deg, rgba(20,20,27,0.05) 0 1px, transparent 1px 26px); pointer-events: none; }
  .ifs-panel-top { position: relative; display: flex; justify-content: space-between; font-size: 9.5px; letter-spacing: 0.32em; color: #7C7768; }
  .ifs-panel-title { margin: 0; position: relative; font-family: var(--ifs-display), serif; font-weight: 400; font-size: clamp(46px, 13.5vw, 76px); line-height: 0.92; }
  .ifs-panel-title-md { margin: 0; position: relative; font-family: var(--ifs-display), serif; font-weight: 400; font-size: clamp(42px, 12.5vw, 64px); line-height: 0.94; }
  .ifs-panel-title-sm { margin: 0; font-family: var(--ifs-display), serif; font-size: clamp(34px, 10vw, 52px); line-height: 1; }
  .ifs-panel-block { position: relative; display: flex; flex-direction: column; gap: 12px; }
  .ifs-mini-label { font-size: 9px; letter-spacing: 0.26em; color: #7C7768; }
  .ifs-mini-label--cover { font-size: 8.5px; letter-spacing: 0.3em; }
  .ifs-facts { position: relative; display: flex; flex-direction: column; gap: 12px; font-size: 11px; letter-spacing: 0.14em; color: #4A473F; }
  .ifs-facts-row { display: flex; justify-content: space-between; border-bottom: 1px solid #D6D1C4; padding-bottom: 10px; }
  .ifs-facts-row--last { border-bottom: none; padding-bottom: 0; }
  .ifs-seguir { position: relative; display: flex; align-items: center; gap: 10px; font-size: 9px; letter-spacing: 0.26em; color: #3E5A2E; margin-top: auto; }
  .ifs-seguir--split { justify-content: space-between; }
  .ifs-side-hint { display: inline-block; animation: ifsSide 2.2s ease-in-out infinite; }
  .ifs-route-svg { position: absolute; inset: 0; width: 100%; height: 100%; }
  .ifs-link-cta { font-size: 10px; letter-spacing: 0.24em; color: #3E5A2E; }

  .ifs-crono { position: relative; display: flex; flex-direction: column; gap: 8px; margin-top: 4px; }
  .ifs-crono-row { display: flex; align-items: baseline; gap: 14px; font-size: 11px; letter-spacing: 0.1em; color: #4A473F; border-bottom: 1px solid #D6D1C4; padding-bottom: 8px; }
  .ifs-crono-time { font-family: var(--ifs-mono), monospace; color: #3E5A2E; min-width: 42px; }
  .ifs-crono-title { flex: 1; }

  .ifs-dots { position: absolute; left: 0; right: 34px; bottom: 26px; display: flex; gap: 6px; justify-content: center; z-index: 2; }
  .ifs-dot { width: 22px; height: 2px; background: rgba(20,20,27,0.18); transition: background 400ms ease; display: inline-block; }

  .ifs-stub { position: relative; overflow: hidden; border: 1px solid #2A2417; background: rgba(20,20,27,0.7); padding: 20px; display: flex; flex-direction: column; gap: 16px; transition: border-color 600ms ease, box-shadow 600ms ease; }
  .ifs-stub-top { display: flex; justify-content: space-between; font-size: 9px; letter-spacing: 0.24em; color: #8A8577; }
  .ifs-stub-status { color: #6E6A5D; transition: color 400ms ease; }
  .ifs-seal { width: 62px; aspect-ratio: 1; position: relative; opacity: .25; transform: scale(.86); transition: opacity 700ms ease, transform 700ms cubic-bezier(.16,1,.3,1); align-self: center; }
  .ifs-beam { position: absolute; left: 0; right: 0; top: 0; height: 2px; background: linear-gradient(90deg, transparent, #EAF3DE, transparent); opacity: 0; transition: transform 900ms cubic-bezier(.16,1,.3,1), opacity 300ms ease; }

  .ifs-rsvp { display: flex; flex-direction: column; gap: 22px; width: 100%; max-width: 420px; font-family: var(--ifs-mono), monospace; }
  .ifs-rsvp-rows { display: flex; flex-direction: column; }
  .ifs-rsvp-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 0; border-bottom: 1px solid rgba(200,164,92,0.18); font-size: 10.5px; letter-spacing: 0.18em; color: #8A8577; }
  .ifs-rsvp-row > span:first-child { flex-shrink: 0; }
  .ifs-rsvp-row > span:last-child { color: #F4F1EA; letter-spacing: 0.02em; text-align: right; }
  .ifs-rsvp-row--payment { align-items: flex-start; }
  .ifs-rsvp-payment-value { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
  .ifs-rsvp-payment-total { color: #EAF3DE; font-size: 13px; letter-spacing: 0.02em; font-weight: 600; }
  .ifs-rsvp-payment-detail { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; font-size: 9px; letter-spacing: 0.05em; color: #8A8577; }
  .ifs-rsvp-stepper { display: flex; align-items: center; gap: 12px; }
  .ifs-rsvp-stepper button { width: 26px; height: 26px; border-radius: 50%; border: 1px solid #6B8E4E; background: transparent; color: #6B8E4E; font-size: 14px; line-height: 1; cursor: pointer; }
  .ifs-rsvp-stepper button:disabled { opacity: 0.3; cursor: default; }
  .ifs-rsvp-stepper span { font-family: var(--ifs-mono), monospace; color: #F4F1EA; min-width: 20px; text-align: center; }
  .ifs-rsvp-input { background: transparent; border: none; border-bottom: 1px solid rgba(200,164,92,0.3); color: #F4F1EA; font-family: var(--ifs-mono), monospace; font-size: 11px; letter-spacing: 0.02em; padding: 4px 2px; text-align: right; max-width: 55%; }
  .ifs-rsvp-input::placeholder { color: #6E6A5D; }
  .ifs-rsvp-input:focus { outline: none; border-bottom-color: #6B8E4E; }
  .ifs-rsvp-btn { width: 100%; padding: 16px; font-family: var(--ifs-mono), monospace; font-size: 11px; font-weight: 600; letter-spacing: 0.22em; text-transform: uppercase; background: linear-gradient(180deg, #6B8E4E, #3E5A2E); border: 1px solid #6B8E4E; color: #1C1409; cursor: pointer; }
  .ifs-rsvp-btn:disabled { opacity: 0.6; cursor: default; }
  .ifs-rsvp-btn--ghost { background: transparent; color: #6B8E4E; }
  .ifs-rsvp-error { font-size: 10px; letter-spacing: 0.06em; color: #6B8E4E; margin: 0; }
  .ifs-rsvp-declined { display: flex; flex-direction: column; gap: 18px; align-items: center; text-align: center; max-width: 380px; }
  .ifs-rsvp-declined-text { margin: 0; font-family: var(--ifs-display), serif; font-style: italic; font-size: 18px; line-height: 1.4; color: #A8A292; }

  .ifs-photo-grid { position: relative; flex: 1; min-height: 0; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 12px; }
  .ifs-photo-cell { height: 100%; min-height: 0; aspect-ratio: 4/5; max-width: 100%; background: repeating-linear-gradient(135deg, #DCD7CB 0 6px, #E9E5DC 6px 12px); display: flex; align-items: flex-end; padding: 10px; box-sizing: border-box; overflow: hidden; position: relative; }
  .ifs-photo-cell--offset { margin-top: 18px; }
  .ifs-photo-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .ifs-photo-placeholder { position: relative; font-size: 8.5px; letter-spacing: 0.16em; color: #6E6A5D; }
  .ifs-upload-wrap { flex: 1; min-height: 0; overflow-y: auto; }
  .ifs-album-embed { flex: 1; min-height: 0; overflow-y: auto; }
  .ifs-live-placeholder { flex: 1; display: flex; align-items: center; justify-content: center; text-align: center; padding: 24px; border: 1px dashed rgba(20,20,27,0.2); }

  /* Mosaico fijo del álbum: grilla pareja de 3 columnas, todas las celdas
     con el mismo recorte cuadrado (mismo tamaño para todas las fotos, sin
     una celda "destacada" más grande que desentone), hasta 5 por hoja. */
  /* grid-auto-rows:auto + align-content:start (no stretch) -- si dejáramos
     1fr, las pocas filas de una página con menos fotos se repartían TODO el
     alto disponible del panel (flex:1 de un panel de 100vh) y las celdas se
     estiraban en vez de quedar cuadradas. Con auto, cada fila mide justo lo
     que necesita (cuadrado, según el ancho de columna) y el resto del panel
     queda en blanco en vez de deformar las fotos. */
  .ifs-mosaic { position: relative; flex: 1; min-height: 0; display: grid; grid-template-columns: repeat(3, 1fr); grid-auto-rows: auto; grid-auto-flow: dense; align-content: start; gap: 10px; }
  .ifs-mosaic-cell--featured { grid-column: span 2; grid-row: span 2; cursor: pointer; }
  .ifs-mosaic-cell { position: relative; height: 0; padding-top: 100%; background: repeating-linear-gradient(135deg, #DCD7CB 0 6px, #E9E5DC 6px 12px); overflow: hidden; cursor: pointer; }
  .ifs-mosaic-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  /* Celdas de relleno: cuando la cantidad de fotos no completa una fila
     entera, en vez de dejar el hueco vacío (o una fila con 1-2 fotos
     aisladas) se completa hasta el próximo múltiplo de 3 con este símbolo
     decorativo -- así todas las filas quedan parejas y alineadas entre sí,
     página a página. */

  .ifs-bank-wrap { position: relative; display: flex; flex-direction: column; gap: 14px; width: 100%; max-width: 420px; margin: 0; }
  .ifs-bank-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid rgba(200,164,92,0.18); }
  .ifs-bank-row:last-child { border-bottom: none; }
  .ifs-bank-row-label { display: block; font-size: 9px; letter-spacing: 0.2em; color: #8A8577; margin-bottom: 3px; }
  .ifs-bank-row-value { font-size: 12px; color: #F4F1EA; word-break: break-all; }
  .ifs-bank-copy { flex-shrink: 0; font-family: var(--ifs-mono), monospace; font-size: 10px; letter-spacing: 0.1em; padding: 7px 12px; border: 1px solid #6B8E4E; background: transparent; color: #6B8E4E; cursor: pointer; }
  .ifs-bank-copy:hover { background: rgba(200,164,92,0.12); }

  .ifs-eq { display: flex; align-items: flex-end; gap: 5px; height: 52px; }
  .ifs-eq-bar { width: 4px; height: 100%; transform-origin: bottom; animation: ifsEq 1.1s ease-in-out infinite; display: inline-block; }
  .ifs-song-wrap { font-family: var(--ifs-mono), monospace; }

  .ifs-song { position: relative; width: 100%; max-width: 420px; margin: 0 auto; }
  .ifs-song-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; border-bottom: 1px solid rgba(200,164,92,0.3); padding-bottom: 12px; }
  .ifs-song-inputs { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; font-size: 10px; letter-spacing: 0.24em; color: #8A8577; text-transform: uppercase; }
  .ifs-song-input { background: transparent; border: none; border-bottom: 1px solid rgba(200,164,92,0.3); color: #F4F1EA; font-family: var(--ifs-mono), monospace; font-size: 12px; padding: 6px 2px; min-width: 0; flex: 1; }
  .ifs-song-input::placeholder { color: #6E6A5D; }
  .ifs-song-input:focus { outline: none; border-bottom-color: #6B8E4E; }
  .ifs-song-sep { color: #8A8577; flex-shrink: 0; }
  .ifs-song-submit { flex-shrink: 0; background: none; border: none; color: #6B8E4E; font-family: var(--ifs-mono), monospace; font-size: 10px; letter-spacing: 0.2em; cursor: pointer; }
  .ifs-song-submit:hover { color: #EAF3DE; }
  .ifs-song-submit:disabled { color: #6E6A5D; cursor: default; }
  .ifs-song-error { font-size: 10px; color: #6B8E4E; margin-top: 6px; }
  .ifs-song-list { display: flex; flex-direction: column; margin-top: 14px; max-height: 180px; overflow-y: auto; }
  .ifs-song-item { display: flex; flex-direction: column; gap: 3px; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06); font-family: var(--ifs-mono), monospace; }
  .ifs-song-item-title { font-size: 11.5px; letter-spacing: 0.04em; color: #F4F1EA; }
  .ifs-song-item-by { font-size: 9.5px; letter-spacing: 0.1em; color: #6E6A5D; }

  .ifs-quiz { display: flex; flex-direction: column; gap: 28px; width: 100%; max-width: 460px; }
  .ifs-quiz-q { display: flex; flex-direction: column; gap: 14px; }
  .ifs-quiz-q-num { font-family: var(--ifs-mono), monospace; font-size: 10px; letter-spacing: 0.24em; color: #8A8577; }
  .ifs-quiz-q-text { margin: 0; font-family: var(--ifs-display), serif; font-size: clamp(18px, 4vw, 22px); line-height: 1.3; color: #F4F1EA; }
  .ifs-quiz-opts { display: flex; flex-wrap: wrap; gap: 10px; }
  .ifs-quiz-opt { font-family: var(--ifs-mono), monospace; font-size: 11px; letter-spacing: 0.06em; padding: 10px 16px; border: 1px solid rgba(200,164,92,0.4); background: transparent; color: #6B8E4E; cursor: pointer; transition: background 160ms ease, color 160ms ease, border-color 160ms ease; }
  .ifs-quiz-opt:disabled { cursor: default; }
  .ifs-quiz-opt--picked { background: #6B8E4E; border-color: #6B8E4E; color: #1C1409; }
  .ifs-quiz-opt--correct { background: #6B8E4E; border-color: #6B8E4E; color: #1C1409; }
  .ifs-quiz-opt--wrong { border-color: #8A6A6A; color: #C99; opacity: 0.6; }
  .ifs-quiz-result { padding-top: 18px; border-top: 1px solid rgba(200,164,92,0.2); }
  .ifs-quiz-result-score { margin: 0 0 6px; font-family: var(--ifs-mono), monospace; font-size: 11px; letter-spacing: 0.16em; color: #EAF3DE; }
  .ifs-quiz-result-stat { margin: 0; font-size: 11.5px; line-height: 1.5; color: #A8A292; }

  .ifs-final-card { border: 1px solid #6B8E4E; padding: 30px 24px; display: flex; flex-direction: column; gap: 22px; align-items: center; text-align: center; position: relative; }
  .ifs-final-names { font-family: var(--ifs-display), serif; font-size: clamp(34px, 10vw, 46px); line-height: .9; color: #EAF3DE; }
  .ifs-barcode { height: 26px; background: repeating-linear-gradient(90deg, #6E6A5D 0 2px, transparent 2px 4px, #6E6A5D 4px 5px, transparent 5px 9px, #6E6A5D 9px 11px, transparent 11px 14px); }
  .ifs-final-footer { display: flex; justify-content: space-between; align-items: center; font-size: 9px; letter-spacing: 0.24em; color: #56534A; }
  .ifs-replay { cursor: pointer; color: #6B8E4E; }
  .ifs-footer-credit { display: flex; justify-content: center; padding-top: 8px; opacity: 0.7; }

  .ifs-rail { position: absolute; right: 0; top: 0; bottom: 0; width: 34px; z-index: 4; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 20px 0; opacity: 0; transition: opacity 700ms ease; pointer-events: none; border-left: 1px solid rgba(200,164,92,0.14); }
  .ifs-rail-top { writing-mode: vertical-rl; font-size: 8px; letter-spacing: 0.34em; color: #8A8577; transition: color 500ms ease; }
  .ifs-rail-line { flex: 1; width: 1px; margin: 16px 0; background: rgba(200,164,92,0.16); position: relative; }
  .ifs-rail-bar { position: absolute; left: -1px; top: 0; width: 3px; height: 0%; background: linear-gradient(#EAF3DE, #6B8E4E); transition: height 260ms linear; display: block; }
  .ifs-rail-label { writing-mode: vertical-rl; font-size: 8px; letter-spacing: 0.34em; color: #6B8E4E; transition: color 500ms ease; }

  .ifs-cover { position: absolute; inset: 0; z-index: 5; }
  .ifs-cover-half { position: absolute; left: 0; right: 0; height: 50%; overflow: hidden; transition: transform 1100ms cubic-bezier(.7,0,.2,1); }
  .ifs-cover-half--top { top: 0; }
  .ifs-cover-half--bottom { bottom: 0; }
  .ifs-cover-inner { position: absolute; left: 0; right: 0; top: 0; height: 200%; overflow: hidden; background: radial-gradient(120% 70% at 50% 8%, #2A2010 0%, #1C1409 46%, #160F07 100%); }
  .ifs-cover-half--bottom .ifs-cover-inner { top: auto; bottom: 0; }
  .ifs-cover-glow { position: absolute; left: 50%; top: 6%; width: 190%; aspect-ratio: 1; transform: translate(-50%, -14%); border-radius: 50%; background: conic-gradient(from 200deg, rgba(62,110,74,0.45), rgba(107,142,78,0.32), rgba(107,142,78,0.55), rgba(62,110,74,0.45)); filter: blur(64px); opacity: .62; animation: ifsFoil 26s linear infinite; }
  .ifs-cover-texture { position: absolute; inset: 0; background-image: repeating-linear-gradient(115deg, rgba(234,243,222,.06) 0 2px, transparent 2px 30px); }
  .ifs-cover-content { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: space-between; padding: 24px max(24px, calc((100% - 440px) / 2)) 26px; }
  .ifs-cover-top-row { display: flex; justify-content: space-between; font-size: 9.5px; letter-spacing: 0.24em; color: #8A8577; }
  .ifs-cover-center { display: flex; flex-direction: column; align-items: center; gap: clamp(10px, 2.2vh, 22px); text-align: center; }
  .ifs-cover-kicker { font-size: 9.5px; letter-spacing: 0.34em; color: #8A8577; }
  .ifs-cover-names { margin: 0; font-family: var(--ifs-display), serif; font-weight: 400; font-size: min(clamp(48px, 16vw, 96px), 12.5vh); line-height: 0.86; letter-spacing: -0.02em; color: #EAF3DE; }
  .ifs-cover-rule { width: 1px; height: clamp(16px, 4vh, 44px); background: linear-gradient(#6B8E4E, transparent); display: block; }
  .ifs-cover-date { font-size: 11.5px; letter-spacing: 0.3em; color: #A8A292; white-space: nowrap; }
  .ifs-cover-bottom { display: flex; flex-direction: column; gap: clamp(12px, 2.4vh, 22px); }
  .ifs-cover-facts { display: flex; justify-content: space-between; font-size: 9px; letter-spacing: 0.2em; color: #6E6A5D; }
  /* La fila de datos de la tapa nace de datos reales (dress code + hora),
     no de los 3 items fijos del mockup: con un solo item, space-between lo
     pega al borde izquierdo y se lee como un bug. Centrado en ese caso. */
  .ifs-cover-facts:has(> span:only-child) { justify-content: center; }
  .ifs-cover-cta { border: 1px solid #6B8E4E; background: linear-gradient(100deg, rgba(200,164,92,0.08), rgba(232,214,168,0.2), rgba(200,164,92,0.08)); color: #EAF3DE; font-family: var(--ifs-mono), monospace; font-size: 12px; letter-spacing: 0.26em; padding: clamp(13px, 2.1vh, 19px) 0; text-align: center; width: 100%; }
  .ifs-cover-cta--btn { cursor: pointer; border-radius: 0; }
  @media (hover: hover) {
    .ifs-cover-cta--btn:hover { background: linear-gradient(100deg, rgba(232,214,168,0.34), rgba(246,239,221,0.5), rgba(232,214,168,0.34)); color: #1C1409; }
  }
  .ifs-barcode-wrap { display: flex; flex-direction: column; align-items: center; gap: 10px; }

  .ifs-hint { position: absolute; left: 0; right: 34px; bottom: 18px; z-index: 6; text-align: center; font-size: 9px; letter-spacing: 0.28em; color: #8A8577; opacity: 0; transition: opacity 600ms ease; pointer-events: none; animation: ifsHint 2.4s ease-in-out infinite; }

  .ifs-lightbox { position: fixed; inset: 0; z-index: 200; background: rgba(8,8,11,0.96); display: flex; align-items: center; justify-content: center; padding: 24px; cursor: zoom-out; }
  .ifs-lightbox-close { position: absolute; top: 20px; right: 20px; width: 36px; height: 36px; border-radius: 50%; border: 1px solid #6B8E4E; background: rgba(0,0,0,0.4); color: #F4F1EA; font-size: 18px; line-height: 1; cursor: pointer; display: flex; align-items: center; justify-content: center; }
  .ifs-lightbox-img { max-width: 100%; max-height: 88vh; object-fit: contain; cursor: default; }
`;
