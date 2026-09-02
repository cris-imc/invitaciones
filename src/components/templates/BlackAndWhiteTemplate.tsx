"use client";

/**
 * BlackAndWhiteTemplate.tsx
 *
 * Variante en escala de grises de "Guest Pass VIP" (mismo layout, tipografía
 * y motion), aprobada en Claude Design como familia propia "Black y White"
 * (pase de acceso para boda: fondo casi negro, acento gris claro/blanco,
 * Bodoni Moda + IBM Plex Mono, ticket perforado, medallón circular con
 * texto en arco, marco de doble filete en la tapa, scroll horizontal
 * "pineado" para Cuándo y dónde / Álbum, riel lateral de progreso y
 * portada que se abre en dos mitades). Todo el motion es CSS + SVG y un
 * loop de scroll propio -- cero PNGs, así que escala sin pixelarse en
 * cualquier viewport.
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
 * destello del sello se dispara al confirmar asistencia, vía el mismo
 * callback onConfirmed que usaban los componentes compartidos.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Bodoni_Moda, IBM_Plex_Mono } from "next/font/google";
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

const bcwBodoni = Bodoni_Moda({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500"],
  variable: "--bcw-bodoni",
  display: "swap",
});

const bcwMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--bcw-mono",
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

interface BcwQuizQuestion {
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

interface BlackAndWhiteTemplateProps {
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

export function BlackAndWhiteTemplate({ invitation, guest, isPersonalized = false }: BlackAndWhiteTemplateProps) {
  const tipo = String(invitation.tipo ?? "OTRO");
  const isCasamiento = tipo === "CASAMIENTO";
  const novia = String(invitation.nombreNovia ?? "");
  const novio = String(invitation.nombreNovio ?? "");
  const nombreQuinceanera = String(invitation.nombreQuinceanera ?? "");
  const namesTitle = isCasamiento
    ? (novia && novio ? `${novia} & ${novio}` : String(invitation.nombreEvento ?? "Nuestra boda"))
    : (nombreQuinceanera || String(invitation.nombreEvento ?? "Mis quince"));
  const admitLabel = isCasamiento ? "ADMIT TWO" : "ADMIT ONE";

  // "Saludar por nombre del invitado/familia" (Administrar > Gestionar
  // invitados): si está activo, la portada saluda con el nombre del
  // invitado/familia en vez de los novios/quinceañera -- "la boda DE
  // Familia Juarez" suena mal, así que el kicker pierde el "de" y el
  // nombre va debajo, como un dato propio (no como si Familia Juarez
  // fuera quien se casa/cumple años).
  const showGuestNameInCover = Boolean(guest?.name) && invitation.mostrarNombreInvitadoEnSaludo !== false;
  const coverGuestName = resolveGuestNameDisplay(invitation, guest);
  const coverKickerText = isCasamiento
    ? (showGuestNameInCover ? "ACCESO EXCLUSIVO A LA BODA" : "ACCESO EXCLUSIVO A LA BODA DE")
    : (showGuestNameInCover ? "ACCESO EXCLUSIVO PARA" : "ACCESO EXCLUSIVO A MIS QUINCE DE");
  const coverNamesTitle: React.ReactNode = showGuestNameInCover
    ? coverGuestName
    : isCasamiento
      ? <>{novia}<br /><span className="bcw-accent-italic" style={{ fontSize: "0.54em" }}>&amp;</span><br />{novio}</>
      : namesTitle;

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
    invitation.portadaMensaje || "Bloqueá el día. El resto lo contamos nosotros."
  );

  // Cronograma real (no ceremonia[0]/recepcion[1] inventados) -- se muestra
  // tal cual lo cargó el cliente en el wizard, en la misma hoja que Salón.
  const cronograma: CronoItem[] = safeJson<CronoItem[]>(String(invitation.cronogramaEventos ?? ""), []);

  // Ceremonia: sección propia si está habilitada (lugar distinto a la
  // fiesta, ver StepCeremonia.tsx) -- nunca se mezcla con los datos del salón.
  const ceremoniaHabilitada = Boolean(invitation.ceremoniaHabilitada);
  const ceremoniaTitulo = String(invitation.ceremoniaTitulo || "Ceremonia / Civil");
  const ceremoniaNombre = String(invitation.ceremoniaNombre ?? "");
  const ceremoniaDireccion = String(invitation.ceremoniaDireccion ?? "");
  const ceremoniaHora = String(invitation.ceremoniaHora ?? "");
  const ceremoniaMapUrl = String(invitation.ceremoniaMapUrl ?? "");
  const LUGAR_PANEL_COUNT = ceremoniaHabilitada ? 4 : 3;

  const galeria: string[] = safeJson<string[]>(String(invitation.galeriaPrincipalFotos ?? ""), []);

  // Portada de bienvenida y foto principal con foto real, misma
  // infraestructura que ya usa la Colección Flat (AnimatedCoverPhoto +
  // los campos que ya carga StepHeroImages.tsx) -- ver rama
  // experimento-foto-storytelling. Ambas 100% opcionales: sin cargarlas,
  // todo se ve exactamente igual que antes (cero regresión). Sin tinte de
  // color en ninguna de las dos -- "sin coloración" es la identidad de esta
  // familia.
  // Recorte celular (mobile) y Recorte PC (desktop): mismos 2 campos que
  // carga StepHeroImages.tsx, cada uno 100% opcional e independiente --
  // ver rama experimento-foto-storytelling. Cada uno controla SU propio
  // breakpoint tanto en la tapa (CoverHalf) como en "Nuestra foto" más
  // abajo: si solo se cargó uno de los dos, ese breakpoint muestra la
  // foto y el otro se ve tal cual la plantilla original (sin foto, sin
  // fallback cruzado ni fallback a la galería principal).
  const photoMobile = String(invitation.portadaImagenFondo || "");
  const photoDesktop = String(invitation.portadaImagenFondoDesktop || "");
  // "Nuestra foto" (02) y "Un mensaje para vos" (frase) son las dos únicas
  // secciones que pueden no existir -- si no hay foto cargada, o si la
  // frase está deshabilitada/sin texto, esas secciones no se renderizan
  // (ver más abajo), y el resto de los kickers no puede seguir asumiendo
  // que ambas ocupan un lugar: knPre()/kn() corren el número según cuáles
  // de las dos existan, para no saltar números en el medio de la secuencia.
  // knPre() es para Countdown y la Frase misma (solo les afecta si existe
  // Nuestra foto, que va ANTES en la secuencia); kn() es para todo lo que
  // sigue después de la Frase (les afecta si existen Nuestra foto Y/O la
  // Frase).
  const hasHeroPhoto = Boolean(photoMobile || photoDesktop);
  const hasFrase = Boolean(invitation.frasePersonalizadaHabilitada) && Boolean(invitation.frasePersonalizadaTexto);
  const kOffsetPre = hasHeroPhoto ? 1 : 0;
  const kOffset = kOffsetPre + (hasFrase ? 1 : 0);
  const kn = (base: number) => String(base + kOffset).padStart(2, "0");
  const knPre = (base: number) => String(base + kOffsetPre).padStart(2, "0");
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
  const triviaPreguntas: BcwQuizQuestion[] = safeJson<BcwQuizQuestion[]>(String(invitation.triviaPreguntas ?? ""), []);
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
        statusRef.current.style.color = "#FFFFFF";
      }
      if (stubRef.current) {
        stubRef.current.style.borderColor = "#B9B9BC";
        stubRef.current.style.boxShadow = "0 0 0 1px rgba(185,185,188,.35), 0 18px 50px -30px #B9B9BC";
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
            dot.style.background = i === active ? "#4A4A4A" : "rgba(20,20,27,0.18)";
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
          if (railRef.current) railRef.current.style.borderLeftColor = light ? "rgba(20,20,27,0.14)" : "rgba(185,185,188,0.14)";
          if (railLineRef.current) railLineRef.current.style.background = light ? "rgba(20,20,27,0.14)" : "rgba(185,185,188,0.16)";
          if (railTopRef.current) railTopRef.current.style.color = light ? "#7C7768" : "#8A8577";
          if (railLabelRef.current) railLabelRef.current.style.color = light ? "#4A4A4A" : "#B9B9BC";
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
      className={`${bcwBodoni.variable} ${bcwMono.variable}`}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "calc(var(--vh, 1vh) * 100)",
        overflow: "hidden",
        background: "#080808",
        fontFamily: "var(--bcw-mono), monospace",
        color: "#F4F1EA",
      }}
    >
      <style>{GP_CSS}</style>
      <style>{COVER_RESPONSIVE_STYLE}</style>

      <div ref={scrollerRef} data-scroller="1" className="bcw-scroller">
        <section data-tone="dark" data-screen-label="Save the Date" className="bcw-section" style={{ background: "radial-gradient(120% 80% at 50% 0%, #17141F 0%, #0A0A0A 55%, #080808 100%)" }}>
          <span data-xin="1" data-dist="-60" className="bcw-kicker">01 — GUARDÁ LA FECHA</span>
          <div className="bcw-date-stack">
            <span data-xin="1" data-delay="60" data-dist="-110" className="bcw-date-num">{dayNum}</span>
            <span data-xin="1" data-delay="170" data-dist="140" className="bcw-date-month">{monthAbbr}</span>
            <span data-xin="1" data-delay="280" data-dist="220" className="bcw-date-num bcw-date-num--right">
              {String(fechaEvento.getFullYear()).slice(-2)}
            </span>
          </div>
          <div data-xin="1" data-delay="380" data-dist="-80" className="bcw-divider">
            <span className="bcw-divider-line" /><span>{weekday} · {hora} H</span>
          </div>
          <p data-xin="1" data-delay="460" className="bcw-lead">{portadaMensaje}</p>
          <AddToCalendarLink
            eventName={namesTitle}
            targetDate={eventDateTime}
            location={lugarNombre || direccion}
            description={portadaMensaje}
            className="bcw-cal-link"
          />

          <div data-drift="-70" className="bcw-medallion bcw-medallion--corner">
            <Medallion label="VIP" sub="ACCESO" arcId="bcwArc1" arcText={isCasamiento ? "NOS CASAMOS · EDICIÓN ÚNICA · " : "ADMIT ONE · MIS QUINCE · "} spin="normal" />
          </div>
        </section>

        {/* Foto principal con efecto cinemático, SIN tinte de color -- "sin
            coloración" es la identidad de esta familia, así que ni la
            portada ni esta foto reciben tinta de color como el resto de las
            familias. Ocupa toda la pantalla en mobile; en desktop se
            enmarca con un borde propio en vez de estirarse edge-to-edge. */}
        {(photoMobile || photoDesktop) && (
          <section
            data-tone="dark"
            data-screen-label="Nuestra foto"
            className={`bcw-hero-photo-section${!photoMobile ? " bcw-hero-photo-section--no-mobile" : ""}${!photoDesktop ? " bcw-hero-photo-section--no-desktop" : ""}`}
          >
            <div className="bcw-hero-photo-frame">
              {photoMobile && (
                <div className="acp-mobile-only">
                  <AnimatedCoverPhoto photoSrc={photoMobile} tint={false} effect="enfoque" scrimColorRgb="8,8,8" />
                </div>
              )}
              {photoDesktop && (
                <div className="acp-desktop-only">
                  <AnimatedCoverPhoto photoSrc={photoDesktop} tint={false} effect="enfoque" scrimColorRgb="8,8,8" />
                </div>
              )}
            </div>
            <span data-xin="1" data-dist="-60" className="bcw-kicker bcw-hero-photo-kicker">02 — {isCasamiento ? "NUESTRA HISTORIA" : "MI HISTORIA"}</span>
          </section>
        )}

        <section id="countdown" data-tone="dark" data-screen-label="Countdown" className="bcw-section bcw-section--between" style={{ background: "radial-gradient(100% 60% at 50% 100%, #1C1C1C 0%, #0A0A0A 55%, #080808 100%)" }}>
          <div className="bcw-scan-grid" />
          <div className="bcw-scanline" />
          <span data-xin="1" data-dist="-60" className="bcw-kicker" style={{ position: "relative" }}>{knPre(2)} — EL PASE SE ACTIVA EN</span>
          <div className="bcw-cd-grid">
            <CdBox refEl={dRef} delay={40} dist={-90} label="DÍAS" />
            <CdBox refEl={hRef} delay={120} dist={110} label="HORAS" />
            <CdBox refEl={mRef} delay={200} dist={-140} label="MIN" />
            <CdBox refEl={sRef} delay={280} dist={170} label="SEG" />
          </div>
          <div className="bcw-perf-strip" />
        </section>

        {hasFrase && (
        <section id="quote" data-tone="dark" data-screen-label="Frase" className="bcw-section" style={{ background: "radial-gradient(130% 90% at 86% 16%, #1C1727 0%, #0C0B11 52%, #080808 100%)" }}>
          <div data-drift="-130" className="bcw-glow-blob" />
          <span data-xin="1" data-dist="-60" className="bcw-kicker" style={{ position: "relative" }}>{knPre(3)} — UN MENSAJE PARA VOS</span>
          <h2 ref={phraseRef} className="bcw-phrase" style={{ fontSize: fraseFontSize }}>
            {fraseWords.map((w, i) => (
              // El espacio va FUERA del span: el motor de reveal fuerza
              // `display:inline-block` en cada [data-w] (lo necesita para que
              // el transform/blur del scroll-reveal se aplique), y un espacio
              // de fin de línea DENTRO de un inline-block se colapsa a 0 --
              // como texto suelto entre spans, en cambio, se renderiza normal.
              <span key={i}>
                <span data-w="1" className={i >= fraseAccentStart ? "bcw-accent-italic" : undefined}>
                  {w}
                </span>{" "}
              </span>
            ))}
          </h2>
          <div data-xin="1" data-delay="120" data-dist="90" className="bcw-divider" style={{ position: "relative" }}>
            <span className="bcw-divider-line bcw-divider-line--long" /><span>{fechaCorta} — {hora} H</span>
          </div>
        </section>
        )}

        <div data-pan="1" data-screen-label="El lugar" className="bcw-pan" style={ceremoniaHabilitada ? { height: "340vh" } : undefined}>
          <div className="bcw-pan-sticky">
            <div data-strip="1" className="bcw-strip">
              {ceremoniaHabilitada && (
                <div id="ceremonia" data-tone="light" className="bcw-panel bcw-panel--between" style={{ background: "#EFEBE1", color: "#14141B" }}>
                  <div className="bcw-hair-bg" />
                  <div className="bcw-panel-top">
                    <span>{kn(3)} — {ceremoniaTitulo.toUpperCase()}</span><span>01 / {LUGAR_PANEL_COUNT}</span>
                  </div>
                  <h2 className="bcw-panel-title">
                    {ceremoniaNombre || ceremoniaTitulo}
                    {ceremoniaDireccion && <><br /><span className="bcw-accent-serif">{ceremoniaDireccion}</span></>}
                  </h2>
                  <div className="bcw-facts">
                    {ceremoniaHora && (
                      <div className="bcw-facts-row bcw-facts-row--last">
                        <span>HORARIO</span><span>{ceremoniaHora} H</span>
                      </div>
                    )}
                  </div>
                  {ceremoniaMapUrl && (
                    <a href={ceremoniaMapUrl} target="_blank" rel="noopener noreferrer" className="bcw-link-cta">
                      ABRIR EN MAPAS →
                    </a>
                  )}
                  <div className="bcw-seguir">SEGUÍ BAJANDO <span className="bcw-side-hint">→</span></div>
                </div>
              )}

              <div id="details" data-tone="light" className="bcw-panel bcw-panel--between" style={{ background: "#EFEBE1", color: "#14141B" }}>
                <div className="bcw-hair-bg" />
                <div className="bcw-panel-top">
                  <span>{kn(3)} — CUÁNDO Y DÓNDE</span><span>{ceremoniaHabilitada ? "02" : "01"} / {LUGAR_PANEL_COUNT}</span>
                </div>
                <h2 className="bcw-panel-title">
                  {lugarNombre || "El lugar"}
                  {direccion && <><br /><span className="bcw-accent-serif">{direccion}</span></>}
                </h2>
                <div className="bcw-facts">
                  <div className="bcw-facts-row">
                    <span>HORARIO</span><span>{hora} H</span>
                  </div>
                  {dressCode && (
                    <div className="bcw-facts-row bcw-facts-row--last">
                      <span>CÓDIGO</span><span className="bcw-accent-serif-2">{dressCode.toUpperCase()}</span>
                    </div>
                  )}
                </div>
                {cronograma.length > 0 && (
                  <div className="bcw-crono">
                    {cronograma.map((item, i) => (
                      <div key={i} className="bcw-crono-row">
                        <span className="bcw-crono-time">{item.time || ""}</span>
                        <span className="bcw-crono-title">{item.title}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="bcw-seguir">SEGUÍ BAJANDO <span className="bcw-side-hint">→</span></div>
              </div>

              <div data-tone="light" className="bcw-panel bcw-panel--end" style={{ background: "#E4DFD3", color: "#14141B" }}>
                <svg viewBox="0 0 300 500" preserveAspectRatio="none" className="bcw-route-svg">
                  <path ref={routeRef} d="M18 468 C 130 400, 54 262, 152 220 S 254 140, 282 40" fill="none" stroke="#4A4A4A" strokeWidth={1.6} />
                  <circle cx={282} cy={40} r={5} fill="#4A4A4A" />
                </svg>
                <div className="bcw-panel-block">
                  <span className="bcw-mini-label">{ceremoniaHabilitada ? "03" : "02"} / {LUGAR_PANEL_COUNT}</span>
                  <span className="bcw-panel-title-sm">Cómo llegar</span>
                  {direccion && <span className="bcw-mini-label">{direccion}</span>}
                  {mapUrl && (
                    <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="bcw-link-cta">
                      ABRIR EN MAPAS →
                    </a>
                  )}
                </div>
              </div>

              <div data-tone="dark" className="bcw-panel bcw-panel--center" style={{ background: "#0A0A0A", color: "#F4F1EA" }}>
                <div className="bcw-medallion bcw-medallion--lg">
                  <Medallion label={dressCode ? dressCode.toUpperCase() : "ACCESO"} sub={`PASE Nº ${passNumber}`} arcId="bcwArc2" arcText={`ACCESO VIP · PASE Nº ${passNumber} · `} spin="reverse" title="Reservado" />
                </div>
                <span className="bcw-mini-label">{LUGAR_PANEL_COUNT} / {LUGAR_PANEL_COUNT} — TU UBICACIÓN</span>
              </div>
            </div>
            <Dots count={LUGAR_PANEL_COUNT} />
          </div>
        </div>

        <section data-tone="dark" data-screen-label="Check-in" className="bcw-section" style={{ background: "radial-gradient(110% 70% at 50% 100%, #17141F 0%, #0A0A0A 60%, #080808 100%)" }}>
          <span data-xin="1" data-dist="-60" className="bcw-kicker">{kn(4)} — CHECK-IN</span>
          <h2 data-xin="1" data-delay="80" data-dist="130" className="bcw-h2">
            Confirmá<br /><span className="bcw-accent-italic">tu acceso</span>
          </h2>

          {rsvpEnabled ? (
            <div data-xin="1" data-delay="170" data-dist="-90" className="bcw-rsvp">
              <GpRsvpCard
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
            <p className="bcw-lead">La confirmación de asistencia está cerrada por el momento.</p>
          )}
        </section>

        <div id="album" data-pan="1" data-screen-label="Álbum" className="bcw-pan">
          <div className="bcw-pan-sticky">
            <div data-strip="1" className="bcw-strip">
              {photoPages.map((page, pageIndex) => (
                <div key={pageIndex} data-tone="light" className="bcw-panel bcw-panel--gap" style={{ background: ALBUM_TONES[pageIndex % ALBUM_TONES.length], color: "#14141B" }}>
                  <div className="bcw-hair-bg" />
                  <div className="bcw-panel-top">
                    <span>{kn(5)} — ARCHIVO / {String(allPhotos.length).padStart(3, "0")}</span><span>HOJA {String(pageIndex + 1).padStart(2, "0")} / {String(photoPages.length).padStart(2, "0")}</span>
                  </div>
                  {pageIndex === 0 && <h2 className="bcw-panel-title-md">Álbum <span className="bcw-accent-serif">de fotos</span></h2>}
                  <div className="bcw-mosaic">
                    {page.length > 0 ? page.map((url, i) => (
                      <div
                        key={i}
                        className={`bcw-mosaic-cell${i === 0 ? " bcw-mosaic-cell--featured" : ""}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => setExpandedPhoto(url)}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setExpandedPhoto(url); }}
                        aria-label={`Ampliar foto ${i + 1}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" className="bcw-mosaic-img" />
                      </div>
                    )) : (
                      <span className="bcw-photo-placeholder">Sin fotos todavía</span>
                    )}
                  </div>
                  <div className="bcw-seguir bcw-seguir--split">
                    <span>{allPhotos.length} FOTOS SUBIDAS</span>
                    <span className="bcw-accent-serif-2">SEGUÍ →</span>
                  </div>
                </div>
              ))}

              <div data-tone="light" className="bcw-panel bcw-panel--gap" style={{ background: "#EDE8DE", color: "#14141B" }}>
                <span className="bcw-panel-top" style={{ display: "block" }}>HOJA {String(photoPages.length + 1).padStart(2, "0")} — EN VIVO</span>
                <h2 className="bcw-panel-title">Todo lo que<br /><span className="bcw-accent-serif">vamos a recordar</span></h2>
                <div className="bcw-album-embed">
                  {livePhotos.length > 0 ? (
                    <LiveAlbumStrip photos={livePhotos} tone="light" accentColor="#4A4A4A" />
                  ) : (
                    <div className="bcw-live-placeholder">
                      <span className="bcw-mini-label">
                        {eventHasStarted
                          ? "Todavía no se subió nada en vivo."
                          : "Esta sección se activa el día de la fiesta -- ahí vas a poder ver todo lo que subamos en vivo."}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <Dots count={photoPages.length + 1} />
          </div>
        </div>

        {sugerenciaMusicaHabilitada && (
          <section id="music" data-tone="dark" data-screen-label="Música" className="bcw-section" style={{ background: "#0A0A0A" }}>
            <span data-xin="1" data-dist="-60" className="bcw-kicker">{kn(6)} — SUGERENCIA DE MÚSICA</span>
            <h2 data-xin="1" data-delay="80" data-dist="140" className="bcw-h2">¿Qué tema<br /><span className="bcw-accent-italic">te hace bailar?</span></h2>
            <div data-xin="1" data-delay="160" data-dist="-80" className="bcw-eq">
              {[0, 0.18, 0.36, 0.54, 0.72].map((delay, i) => (
                <span key={i} className="bcw-eq-bar" style={{ animationDelay: `${delay}s`, background: i === 2 ? "#FFFFFF" : "#B9B9BC" }} />
              ))}
            </div>
            <div data-xin="1" data-delay="240" data-dist="110" className="bcw-song-wrap">
              <GpSongSuggestion
                invitationId={String(invitation.id ?? "")}
                guestToken={guest?.uniqueToken}
                guestName={guestName || "Invitado"}
              />
            </div>
          </section>
        )}

        {showBankSection && (
          <section id="banco" data-tone="dark" data-screen-label="Regalos" className="bcw-section" style={{ background: "#0A0A0A" }}>
            <span data-xin="1" data-dist="-60" className="bcw-kicker">{sugerenciaMusicaHabilitada ? kn(7) : kn(6)} — REGALOS Y PAGOS</span>
            <h2 data-xin="1" data-delay="80" data-dist="140" className="bcw-h2">
              Si querés<br /><span className="bcw-accent-italic">sumarte</span>
            </h2>
            <div data-xin="1" data-delay="160" data-dist="-80" className="bcw-bank-wrap">
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
                  accentColor="#B9B9BC"
                  cardBg="rgba(20,20,27,0.72)"
                  cardBorder="#2A2417"
                  textPrimary="#F4F1EA"
                  textSecondary="#A8A292"
                  InfoRow={GpInfoRow}
                  CopyField={GpCopyField}
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
                  accentColor="#B9B9BC"
                  cardBg="rgba(20,20,27,0.72)"
                  cardBorder="#2A2417"
                  textPrimary="#F4F1EA"
                  textSecondary="#A8A292"
                  InfoRow={GpInfoRow}
                  CopyField={GpCopyField}
                />
              )}
            </div>
          </section>
        )}

        {quizEnabled && (
          <section id="quiz" data-tone="dark" data-screen-label="Quiz" className="bcw-section" style={{ background: "#0A0A0A" }}>
            <span data-xin="1" data-dist="-60" className="bcw-kicker">{[sugerenciaMusicaHabilitada, showBankSection].filter(Boolean).length + 6 + kOffset} — EL JUEGO</span>
            <h2 data-xin="1" data-delay="80" data-dist="140" className="bcw-h2" style={{ fontSize: "clamp(28px, 6vw, 44px)" }}>
              {triviaTitulo}
            </h2>
            <div data-xin="1" data-delay="160" data-dist="-80">
              <BcwQuiz
                preguntas={triviaPreguntas}
                invitationId={String(invitation.id ?? "")}
                guestToken={guest?.uniqueToken}
                guestName={guestName || "Invitado"}
              />
            </div>
          </section>
        )}

        <section data-tone="dark" data-screen-label="Tu pase" className="bcw-section bcw-section--between" style={{ padding: "96px max(30px, calc((100% - 560px) / 2)) 48px max(24px, calc((100% - 560px) / 2))", background: "radial-gradient(120% 70% at 50% 100%, #17141F 0%, #0A0A0A 55%, #080808 100%)" }}>
          <span data-xin="1" data-dist="-60" className="bcw-kicker">{[sugerenciaMusicaHabilitada, showBankSection, quizEnabled].filter(Boolean).length + 6 + kOffset} — GUARDÁ TU PASE</span>
          <div data-xin="1" data-delay="100" data-dist="130" className="bcw-final-card">
            <div className="bcw-medallion bcw-medallion--final">
              <Medallion label="VIP" sub={confirmed ? "CONFIRMADO" : "PENDIENTE"} arcId="bcwArc3" arcText={`${namesTitle.toUpperCase()} · ${fechaCorta} · `} spin="reverse" />
            </div>
            <span className="bcw-mini-label bcw-accent-serif-2">PASE Nº {passNumber} · ADMIT {guestAdults + guestTeens + guestChildren || 1}</span>
            <span className="bcw-final-names">
              {isCasamiento
                ? <>{novia}{novia && novio ? <span className="bcw-accent-italic"> &amp; </span> : ""}{novio}</>
                : namesTitle}
            </span>
            <span className="bcw-mini-label" style={{ color: "#A8A292" }}>{fechaCorta} — {hora} H</span>
            <div className="bcw-barcode" style={{ width: "60%", height: 26, opacity: 0.6 }} />
          </div>
          <div className="bcw-final-footer">
            <span>NO TRANSFERIBLE</span>
            <span className="bcw-replay" onClick={reset}>VER LA APERTURA OTRA VEZ ↺</span>
          </div>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <InfoAdicionalSection invitation={invitation as any} />
          <div className="bcw-footer-credit">
            <LogoFooterCredit bgColor="transparent" />
          </div>
        </section>
      </div>

      <div ref={railRef} className="bcw-rail">
        <span ref={railTopRef} className="bcw-rail-top">PASE Nº {passNumber}</span>
        <div ref={railLineRef} className="bcw-rail-line">
          <span ref={railBarRef} className="bcw-rail-bar" />
        </div>
        <span ref={railLabelRef} className="bcw-rail-label">SAVE THE DATE</span>
      </div>

      <div ref={coverRef} className="bcw-cover">
        <div ref={topRef} className="bcw-cover-half bcw-cover-half--top">
          <CoverHalf
            namesRef={namesRef}
            kickerRef={kickerRef}
            perfRef={perfRef}
            kickerText={coverKickerText}
            namesTitle={coverNamesTitle}
            fechaCorta={fechaCorta}
            passNumber={passNumber}
            dressCode={dressCode}
            hora={hora}
            admitLabel={admitLabel}
            photoMobile={photoMobile}
            photoDesktop={photoDesktop}
          >
            <div className="bcw-cover-cta">ABRIR INVITACIÓN</div>
          </CoverHalf>
        </div>
        <div ref={bottomRef} className="bcw-cover-half bcw-cover-half--bottom">
          <CoverHalf
            kickerText={coverKickerText}
            namesTitle={coverNamesTitle}
            fechaCorta={fechaCorta}
            passNumber={passNumber}
            dressCode={dressCode}
            hora={hora}
            admitLabel={admitLabel}
            photoMobile={photoMobile}
            photoDesktop={photoDesktop}
          >
            <button onClick={open} className="bcw-cover-cta bcw-cover-cta--btn">ABRIR INVITACIÓN</button>
          </CoverHalf>
        </div>
      </div>

      <div ref={hintRef} className="bcw-hint">DESLIZÁ ↓</div>

      {expandedPhoto && (
        <div
          className="bcw-lightbox"
          onClick={() => setExpandedPhoto(null)}
          onContextMenu={(e) => e.preventDefault()}
        >
          <button
            type="button"
            className="bcw-lightbox-close"
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
            className="bcw-lightbox-img"
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

function CdBox({ refEl, delay, dist, label }: { refEl: React.RefObject<HTMLSpanElement | null>; delay: number; dist: number; label: string }) {
  return (
    <div data-xin="1" data-delay={delay} data-dist={dist} className="bcw-cd-box">
      <span ref={refEl} className="bcw-cd-num">—</span>
      <span className="bcw-cd-label">{label}</span>
    </div>
  );
}

function Dots({ count = 3 }: { count?: number }) {
  return (
    <div data-dots="1" className="bcw-dots">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} data-dot={i} className="bcw-dot" />
      ))}
    </div>
  );
}

function Medallion({
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
      <div className="bcw-medallion-ring" style={{ animation: spin === "none" ? "none" : `bcwRing ${ringDuration}s linear infinite` }} />
      <div className="bcw-medallion-core">
        {title && <span className="bcw-medallion-sub">SECTOR</span>}
        <span className={compact ? "bcw-medallion-label-sm" : "bcw-medallion-label"}>{title || label}</span>
        {sub && <span className="bcw-medallion-sub bcw-medallion-sub--accent">{sub}</span>}
      </div>
      {arcId && (
        <svg viewBox="0 0 100 100" className="bcw-medallion-arc" style={{ animation: spin === "reverse" ? "bcwRingRev 32s linear infinite" : "bcwRingRev 34s linear infinite" }}>
          <defs>
            <path id={arcId} d="M50 50 m -38 0 a 38 38 0 1 1 76 0 a 38 38 0 1 1 -76 0" fill="none" />
          </defs>
          <text className="bcw-medallion-arc-text">
            <textPath href={`#${arcId}`}>{arcText}{arcText}</textPath>
          </text>
        </svg>
      )}
    </>
  );
}

function GpCopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div className="bcw-bank-row">
      <div style={{ minWidth: 0, flex: 1 }}>
        <span className="bcw-bank-row-label">{label}</span>
        <span className="bcw-bank-row-value">{value}</span>
      </div>
      <button type="button" className="bcw-bank-copy" onClick={handle}>
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
function GpRsvpCard({
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
      <div className="bcw-rsvp-declined">
        <p className="bcw-rsvp-declined-text">Gracias por avisarnos. Si cambiás de idea, este mismo acceso sigue activo.</p>
        <button type="button" className="bcw-rsvp-btn bcw-rsvp-btn--ghost" onClick={() => setStatus("PENDING")}>
          CAMBIÉ DE IDEA
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="bcw-rsvp-rows">
        <div className="bcw-rsvp-row">
          {/* Con más de un invitado el nombre suele ser de un grupo/familia
              ("Familia Juarez"), no el de una persona puntual -- la etiqueta
              "Nombre y apellido" queda rara ahí (ver img/confirmacion.jpg). */}
          <span>{totalGuests > 1 ? "RESERVADO PARA" : "NOMBRE Y APELLIDO"}</span>
          <span>{guestName || "—"}</span>
        </div>

        {totalGuests > 1 && status !== "CONFIRMED" && (
          <div className="bcw-rsvp-row">
            <span>ADULTOS</span>
            <div className="bcw-rsvp-stepper">
              <button type="button" onClick={() => setAdultCount((v) => Math.max(1, v - 1))} disabled={adultCount <= 1}>−</button>
              <span>{String(adultCount).padStart(2, "0")}</span>
              <button type="button" onClick={() => setAdultCount((v) => Math.min(maxAdults, v + 1))} disabled={adultCount >= maxAdults}>+</button>
            </div>
          </div>
        )}
        {maxTeens > 0 && status !== "CONFIRMED" && (
          <div className="bcw-rsvp-row">
            <span>ADOLESCENTES</span>
            <div className="bcw-rsvp-stepper">
              <button type="button" onClick={() => setTeenCount((v) => Math.max(0, v - 1))} disabled={teenCount <= 0}>−</button>
              <span>{String(teenCount).padStart(2, "0")}</span>
              <button type="button" onClick={() => setTeenCount((v) => Math.min(maxTeens, v + 1))} disabled={teenCount >= maxTeens}>+</button>
            </div>
          </div>
        )}
        {maxChildren > 0 && status !== "CONFIRMED" && (
          <div className="bcw-rsvp-row">
            <span>NIÑOS</span>
            <div className="bcw-rsvp-stepper">
              <button type="button" onClick={() => setChildCount((v) => Math.max(0, v - 1))} disabled={childCount <= 0}>−</button>
              <span>{String(childCount).padStart(2, "0")}</span>
              <button type="button" onClick={() => setChildCount((v) => Math.min(maxChildren, v + 1))} disabled={childCount >= maxChildren}>+</button>
            </div>
          </div>
        )}
        {status === "CONFIRMED" && (
          <>
            {totalGuests > 1 && adultCount > 0 && <div className="bcw-rsvp-row"><span>ADULTOS</span><span>{String(adultCount).padStart(2, "0")}</span></div>}
            {teenCount > 0 && <div className="bcw-rsvp-row"><span>ADOLESCENTES</span><span>{String(teenCount).padStart(2, "0")}</span></div>}
            {childCount > 0 && <div className="bcw-rsvp-row"><span>NIÑOS</span><span>{String(childCount).padStart(2, "0")}</span></div>}
          </>
        )}

        {status !== "CONFIRMED" ? (
          <div className="bcw-rsvp-row">
            <span>RESTRICCIÓN ALIMENTARIA</span>
            <input
              value={dietary}
              onChange={(e) => setDietary(e.target.value)}
              placeholder="—"
              className="bcw-rsvp-input"
            />
          </div>
        ) : (
          <div className="bcw-rsvp-row">
            <span>RESTRICCIÓN ALIMENTARIA</span>
            <span>{guestRestrictions || dietary || "—"}</span>
          </div>
        )}

        {hasPayment && paymentAmount != null && !isExempt && (
          // El detalle de precio queda visible en los dos estados (antes y
          // después de confirmar) -- antes solo se veía mientras se elegía
          // la cantidad, y una vez confirmado desaparecía justo cuando el
          // invitado más lo necesita: saber cuánto tiene que pagar en total.
          <div className="bcw-rsvp-row bcw-rsvp-row--payment">
            <span>VALOR</span>
            <div className="bcw-rsvp-payment-value">
              <span className="bcw-rsvp-payment-total">{formatARS(totalPayment)}</span>
              {(adultCount > 0 || teenCount > 0 || childCount > 0) && (
                <div className="bcw-rsvp-payment-detail">
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

      <div ref={stubRef} className="bcw-stub">
        <div className="bcw-stub-top">
          <span>PASE Nº {passNumber}</span>
          <span ref={statusRef} className="bcw-stub-status">
            {confirmed ? "ACCESO CONFIRMADO" : "PENDIENTE"}
          </span>
        </div>
        <div ref={sealRef} className="bcw-seal">
          <Medallion label="VIP" sub="" arcId="" arcText="" spin="none" compact />
        </div>
        <div ref={beamRef} className="bcw-beam" />
        <div className="bcw-barcode" style={{ width: "70%", opacity: confirmed ? 0.7 : 0.2 }} />
      </div>

      {error && <p className="bcw-rsvp-error">{error}</p>}

      {status !== "CONFIRMED" ? (
        <>
          <button type="button" className="bcw-rsvp-btn" disabled={isSubmitting} onClick={() => submit("CONFIRMA")}>
            {isSubmitting ? "GUARDANDO…" : "CONFIRMAR ASISTENCIA"}
          </button>
          <button type="button" className="bcw-rsvp-btn bcw-rsvp-btn--ghost" disabled={isSubmitting} onClick={() => submit("NO_ASISTE")}>
            NO VOY A PODER ASISTIR
          </button>
        </>
      ) : (
        <button type="button" className="bcw-rsvp-btn bcw-rsvp-btn--ghost" onClick={() => setStatus("PENDING")}>
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
function GpSongSuggestion({ invitationId, guestToken, guestName }: { invitationId: string; guestToken?: string; guestName: string }) {
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
    <div className="bcw-song">
      <form onSubmit={handleSubmit} className="bcw-song-row">
        <div className="bcw-song-inputs">
          <input value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="ARTISTA" maxLength={80} className="bcw-song-input" />
          <span className="bcw-song-sep">—</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="TEMA" maxLength={100} className="bcw-song-input" />
        </div>
        <button type="submit" disabled={isSubmitting} className="bcw-song-submit">+ {isSubmitting ? "..." : "SUMAR"}</button>
      </form>
      {error && <p className="bcw-song-error">{error}</p>}
      {songs.length > 0 && (
        <div className="bcw-song-list">
          {songs.slice(0, 12).map((s, i) => (
            <div key={s.id} className="bcw-song-item">
              <span className="bcw-song-item-title">{String(i + 1).padStart(2, "0")} · {s.artist} — {s.title}</span>
              <span className="bcw-song-item-by">Sumado por {s.guestName || "Invitado"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Todas las preguntas se muestran juntas en la misma página (no un wizard
// paso a paso) -- misma API /api/quiz que usa el resto de las plantillas.
function BcwQuiz({ preguntas, invitationId, guestToken, guestName }: { preguntas: BcwQuizQuestion[]; invitationId: string; guestToken?: string; guestName?: string }) {
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
    <div className="bcw-quiz">
      {preguntas.map((q, qi) => {
        const correctIdx = q.respuestaCorrecta ?? q.correcta;
        return (
          <div key={qi} className="bcw-quiz-q">
            <span className="bcw-quiz-q-num">{String(qi + 1).padStart(2, "0")}</span>
            <p className="bcw-quiz-q-text">{q.pregunta}</p>
            <div className="bcw-quiz-opts">
              {q.opciones.map((opt, oi) => {
                const chosen = picks[qi] === oi;
                const revealed = picks[qi] !== undefined && correctIdx !== undefined;
                let stateClass = "";
                if (revealed) {
                  if (oi === correctIdx) stateClass = " bcw-quiz-opt--correct";
                  else if (chosen) stateClass = " bcw-quiz-opt--wrong";
                } else if (chosen) {
                  stateClass = " bcw-quiz-opt--picked";
                }
                return (
                  <button
                    key={oi}
                    type="button"
                    className={`bcw-quiz-opt${stateClass}`}
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
        <div className="bcw-quiz-result">
          <p className="bcw-quiz-result-score">
            {isSaving ? "GUARDANDO…" : `RESPONDISTE ${score} DE ${preguntas.length} CORRECTAMENTE`}
          </p>
          {!isSaving && stats && stats.count > 0 && (
            <p className="bcw-quiz-result-stat">
              El promedio del resto de los invitados ({stats.count}) es del {stats.avg}%.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function GpInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="bcw-bank-row">
      <div style={{ minWidth: 0, flex: 1 }}>
        <span className="bcw-bank-row-label">{label}</span>
        <span className="bcw-bank-row-value">{value}</span>
      </div>
    </div>
  );
}

function CoverHalf({
  namesRef,
  kickerRef,
  perfRef,
  kickerText,
  namesTitle,
  fechaCorta,
  passNumber,
  dressCode,
  hora,
  admitLabel,
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
  admitLabel: string;
  photoMobile?: string;
  photoDesktop?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bcw-cover-inner">
      {photoMobile && (
        <div className="acp-mobile-only">
          <AnimatedCoverPhoto photoSrc={photoMobile} tint={false} effect="enfoque" scrimColorRgb="8,8,8" />
        </div>
      )}
      {photoDesktop && (
        <div className="acp-desktop-only">
          <AnimatedCoverPhoto photoSrc={photoDesktop} tint={false} effect="enfoque" scrimColorRgb="8,8,8" />
        </div>
      )}
      <div className="bcw-cover-glow" />
      <div className="bcw-cover-sunburst" />
      <div className="bcw-cover-frame bcw-cover-frame--outer" />
      <div className="bcw-cover-frame bcw-cover-frame--inner" />
      <div className="bcw-cover-content">
        <div className="bcw-cover-top-row">
          <span>PASE Nº {passNumber}</span><span className="bcw-accent-serif-2">{admitLabel}</span>
        </div>
        <div className="bcw-cover-center">
          <span ref={kickerRef} className="bcw-cover-kicker">{kickerText}</span>
          <h1 ref={namesRef} className="bcw-cover-names">{namesTitle}</h1>
          <span className="bcw-cover-rule" />
          <span className="bcw-cover-date">{fechaCorta}</span>
        </div>
        <div className="bcw-cover-bottom">
          <div ref={perfRef} className="bcw-perf-strip bcw-perf-strip--reveal" />
          <div className="bcw-cover-facts">
            {dressCode && <span>{dressCode.toUpperCase()}</span>}
            <span>{hora} H</span>
          </div>
          {children}
          <div className="bcw-barcode-wrap">
            <div className="bcw-barcode" style={{ width: "62%" }} />
            <span className="bcw-mini-label" style={{ color: "#56534A" }}>NO TRANSFERIBLE</span>
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
  .bcw-scroller { position: absolute; inset: 0; overflow-y: auto; overflow-x: hidden; opacity: 0; transition: opacity 900ms ease 260ms; scrollbar-width: none; }
  .bcw-scroller::-webkit-scrollbar { width: 0; height: 0; }

  a { color: #B9B9BC; text-decoration: none; }
  a:hover { color: #FFFFFF; }

  @keyframes bcwFoil { to { transform: rotate(360deg); } }
  @keyframes bcwRing { to { transform: rotate(360deg); } }
  @keyframes bcwRingRev { to { transform: rotate(-360deg); } }
  @keyframes bcwScan { 0% { transform: translateY(0); opacity: 0; } 12% { opacity: .85; } 88% { opacity: .85; } 100% { transform: translateY(320px); opacity: 0; } }
  @keyframes bcwEq { 0%,100% { transform: scaleY(.25); } 50% { transform: scaleY(1); } }
  @keyframes bcwHint { 0%,100% { transform: translateY(0); } 50% { transform: translateY(7px); } }
  @keyframes bcwSide { 0%,100% { transform: translateX(0); } 50% { transform: translateX(7px); } }
  @media (prefers-reduced-motion: reduce) { .bcw-scroller * { animation: none !important; } }

  .bcw-section { min-height: calc(var(--vh, 1vh) * 100); position: relative; display: flex; flex-direction: column; justify-content: center; gap: 30px; padding: 96px max(30px, calc((100% - 560px) / 2)) 110px max(24px, calc((100% - 560px) / 2)); overflow: hidden; }
  .bcw-section--between { justify-content: space-between; }

  .bcw-hero-photo-section { min-height: calc(var(--vh, 1vh) * 100); position: relative; overflow: hidden; background: #080808; }
  .bcw-hero-photo-frame { position: absolute; inset: 0; overflow: hidden; }
  .bcw-hero-photo-kicker { position: absolute; left: 0; right: 0; bottom: 0; z-index: 2; padding: 0 max(24px, calc((100% - 560px) / 2)) 48px; }
  @media (max-width: 767px) {
    .bcw-hero-photo-section--no-mobile { min-height: 0; height: 0; }
  }
  @media (min-width: 768px) {
    .bcw-hero-photo-frame { inset: 64px max(24px, calc((100% - 900px) / 2)); border: 1px solid rgba(185,185,188,.3); }
    .bcw-hero-photo-kicker { bottom: 40px; }
    .bcw-hero-photo-section--no-desktop { min-height: 0; height: 0; }
  }

  .bcw-kicker { font-size: 9.5px; letter-spacing: 0.34em; color: #8A8577; }

  .bcw-date-stack { display: flex; flex-direction: column; gap: 2px; }
  .bcw-date-num { font-family: var(--bcw-bodoni), serif; font-size: clamp(66px, 23vw, 140px); line-height: 0.82; letter-spacing: -0.04em; }
  .bcw-date-num--right { text-align: right; line-height: 0.86; }
  .bcw-date-month { font-family: var(--bcw-bodoni), serif; font-style: italic; font-size: clamp(50px, 18vw, 104px); line-height: 0.9; color: #B9B9BC; padding-left: 12%; }

  .bcw-divider { display: flex; align-items: center; gap: 16px; font-size: 10px; letter-spacing: 0.26em; color: #8A8577; }
  .bcw-divider-line { width: 52px; height: 1px; background: #B9B9BC; display: inline-block; }
  .bcw-divider-line--long { width: 64px; }

  .bcw-lead { margin: 0; font-family: var(--bcw-bodoni), serif; font-style: italic; font-size: 20px; line-height: 1.4; color: #A8A292; max-width: 330px; }
  .bcw-cal-link { display: inline-flex; align-items: center; gap: 7px; margin-top: 4px; font-family: var(--bcw-mono), monospace; font-size: 10px; letter-spacing: 0.24em; text-transform: uppercase; color: #8A8577; text-decoration: none; transition: color 200ms ease; }
  .bcw-cal-link:hover { color: #B9B9BC; }

  .bcw-medallion { position: relative; }
  .bcw-medallion--corner { position: absolute; right: max(32px, calc((100% - 560px) / 2)); top: 12%; width: clamp(86px, 22vw, 116px); aspect-ratio: 1; }
  .bcw-medallion--lg { width: clamp(130px, 34vw, 178px); aspect-ratio: 1; margin: 0 auto; }
  .bcw-medallion--final { width: clamp(104px, 26vw, 132px); aspect-ratio: 1; margin: -12px auto 0; }
  .bcw-medallion-ring { position: absolute; inset: 0; border-radius: 50%; background: conic-gradient(from 0deg, #4A4A4A, #2A2A2A, #B9B9BC, #FFFFFF, #4A4A4A); filter: saturate(.75); }
  .bcw-medallion-core { position: absolute; inset: 3px; border-radius: 50%; background: #0C0C11; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; text-align: center; padding: 6px; }
  .bcw-medallion-label { font-family: var(--bcw-bodoni), serif; font-size: 26px; line-height: 1; color: #FFFFFF; }
  .bcw-medallion-label-sm { font-family: var(--bcw-bodoni), serif; font-size: 16px; color: #FFFFFF; }
  .bcw-medallion-sub { font-size: 6.5px; letter-spacing: 0.24em; color: #8A8577; }
  .bcw-medallion-sub--accent { color: #B9B9BC; }
  .bcw-medallion-arc { position: absolute; inset: -14%; }
  /* Opacity baja a propósito: el anillo gira sin parar, así que en algún
     momento de su vuelta una letra (ej. la "P" de "PASS") queda justo al
     lado de la etiqueta central ("ACCESO") y, al ser el mismo color/fuente,
     se leen como una sola palabra pegada ("Pacceso"). Atenuado no compite
     con el texto del centro y se lee como textura decorativa del anillo. */
  .bcw-medallion-arc-text { font-size: 7px; letter-spacing: 1.6px; fill: #B9B9BC; opacity: 0.4; font-family: var(--bcw-mono), monospace; }

  .bcw-scan-grid { position: absolute; inset: 0; background: repeating-linear-gradient(0deg, rgba(185,185,188,0.06) 0 1px, transparent 1px 5px); pointer-events: none; }
  .bcw-scanline { position: absolute; left: 0; right: 0; top: 30%; height: 2px; background: linear-gradient(90deg, transparent, #FFFFFF, transparent); animation: bcwScan 6s linear infinite; pointer-events: none; }

  .bcw-cd-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; position: relative; }
  .bcw-cd-box { border: 1px solid #2A2417; background: rgba(20,20,27,0.72); padding: 18px 15px; display: flex; flex-direction: column; gap: 6px; overflow: hidden; }
  .bcw-cd-num { font-family: var(--bcw-bodoni), serif; font-size: clamp(48px, 14vw, 80px); line-height: 0.82; color: #FFFFFF; display: inline-block; }
  .bcw-cd-label { font-size: 9px; letter-spacing: 0.3em; color: #B9B9BC; }
  .bcw-perf-strip { height: 12px; position: relative; background: radial-gradient(circle at 6px 50%, #080808 3.4px, transparent 3.8px) 0 0/12px 12px repeat-x; opacity: .85; }
  .bcw-perf-strip--reveal { clip-path: inset(0 100% 0 0); transition: clip-path 900ms cubic-bezier(.16,1,.3,1) 500ms; }

  .bcw-glow-blob { position: absolute; right: -26%; top: 4%; width: 82vw; max-width: 540px; aspect-ratio: 1; border-radius: 50%; background: conic-gradient(from 200deg, rgba(255,255,255,0.2), rgba(185,185,188,0.2), rgba(255,255,255,0.26), rgba(255,255,255,0.2)); filter: blur(80px); opacity: .4; animation: bcwFoil 30s linear infinite; }
  .bcw-phrase { margin: 0; position: relative; font-family: var(--bcw-bodoni), serif; font-weight: 400; font-size: clamp(50px, 15vw, 96px); line-height: 0.92; letter-spacing: -0.03em; }
  .bcw-accent-italic { font-style: italic; color: #B9B9BC; }
  .bcw-accent-serif { font-style: italic; color: #4A4A4A; font-family: var(--bcw-bodoni), serif; }
  .bcw-accent-serif-2 { color: #4A4A4A; }
  .bcw-h2 { margin: 0; font-family: var(--bcw-bodoni), serif; font-weight: 400; font-size: clamp(40px, 12vw, 68px); line-height: 0.96; }

  .bcw-pan { height: 260vh; position: relative; }
  .bcw-pan-sticky { position: sticky; top: 0; height: calc(var(--vh, 1vh) * 100); overflow: hidden; }
  .bcw-strip { position: absolute; top: 0; left: 0; height: 100%; display: flex; width: 300vw; will-change: transform; }
  .bcw-panel { flex: 0 0 100vw; min-width: 0; height: 100%; box-sizing: border-box; position: relative; overflow: hidden; display: flex; flex-direction: column; padding: 84px max(24px, calc((100vw - 560px) / 2)) 100px; gap: 22px; }
  .bcw-panel--between { justify-content: space-between; }
  .bcw-panel--end { justify-content: flex-end; }
  .bcw-panel--center { align-items: center; justify-content: center; text-align: center; }
  .bcw-panel--gap { gap: clamp(14px, 2.4vh, 22px); padding: clamp(52px, 9vh, 84px) max(24px, calc((100vw - 600px) / 2)) clamp(62px, 11vh, 100px); }
  .bcw-hair-bg { position: absolute; inset: 0; background: repeating-linear-gradient(90deg, rgba(20,20,27,0.05) 0 1px, transparent 1px 26px); pointer-events: none; }
  .bcw-panel-top { position: relative; display: flex; justify-content: space-between; font-size: 9.5px; letter-spacing: 0.32em; color: #7C7768; }
  .bcw-panel-title { margin: 0; position: relative; font-family: var(--bcw-bodoni), serif; font-weight: 400; font-size: clamp(46px, 13.5vw, 76px); line-height: 0.92; }
  .bcw-panel-title-md { margin: 0; position: relative; font-family: var(--bcw-bodoni), serif; font-weight: 400; font-size: clamp(42px, 12.5vw, 64px); line-height: 0.94; }
  .bcw-panel-title-sm { margin: 0; font-family: var(--bcw-bodoni), serif; font-size: clamp(34px, 10vw, 52px); line-height: 1; }
  .bcw-panel-block { position: relative; display: flex; flex-direction: column; gap: 12px; }
  .bcw-mini-label { font-size: 9px; letter-spacing: 0.26em; color: #7C7768; }
  .bcw-facts { position: relative; display: flex; flex-direction: column; gap: 12px; font-size: 11px; letter-spacing: 0.14em; color: #4A473F; }
  .bcw-facts-row { display: flex; justify-content: space-between; border-bottom: 1px solid #D6D1C4; padding-bottom: 10px; }
  .bcw-facts-row--last { border-bottom: none; padding-bottom: 0; }
  .bcw-seguir { position: relative; display: flex; align-items: center; gap: 10px; font-size: 9px; letter-spacing: 0.26em; color: #4A4A4A; margin-top: auto; }
  .bcw-seguir--split { justify-content: space-between; }
  .bcw-side-hint { display: inline-block; animation: bcwSide 2.2s ease-in-out infinite; }
  .bcw-route-svg { position: absolute; inset: 0; width: 100%; height: 100%; }
  .bcw-link-cta { font-size: 10px; letter-spacing: 0.24em; color: #4A4A4A; }

  .bcw-crono { position: relative; display: flex; flex-direction: column; gap: 8px; margin-top: 4px; }
  .bcw-crono-row { display: flex; align-items: baseline; gap: 14px; font-size: 11px; letter-spacing: 0.1em; color: #4A473F; border-bottom: 1px solid #D6D1C4; padding-bottom: 8px; }
  .bcw-crono-time { font-family: var(--bcw-mono), monospace; color: #4A4A4A; min-width: 42px; }
  .bcw-crono-title { flex: 1; }

  .bcw-dots { position: absolute; left: 0; right: 34px; bottom: 26px; display: flex; gap: 6px; justify-content: center; z-index: 2; }
  .bcw-dot { width: 22px; height: 2px; background: rgba(20,20,27,0.18); transition: background 400ms ease; display: inline-block; }

  .bcw-stub { position: relative; overflow: hidden; border: 1px solid #2A2417; background: rgba(20,20,27,0.7); padding: 20px; display: flex; flex-direction: column; gap: 16px; transition: border-color 600ms ease, box-shadow 600ms ease; }
  .bcw-stub-top { display: flex; justify-content: space-between; font-size: 9px; letter-spacing: 0.24em; color: #8A8577; }
  .bcw-stub-status { color: #6E6A5D; transition: color 400ms ease; }
  .bcw-seal { width: 62px; aspect-ratio: 1; position: relative; opacity: .25; transform: scale(.86); transition: opacity 700ms ease, transform 700ms cubic-bezier(.16,1,.3,1); align-self: center; }
  .bcw-beam { position: absolute; left: 0; right: 0; top: 0; height: 2px; background: linear-gradient(90deg, transparent, #FFFFFF, transparent); opacity: 0; transition: transform 900ms cubic-bezier(.16,1,.3,1), opacity 300ms ease; }

  .bcw-rsvp { display: flex; flex-direction: column; gap: 22px; width: 100%; max-width: 420px; font-family: var(--bcw-mono), monospace; }
  .bcw-rsvp-rows { display: flex; flex-direction: column; }
  .bcw-rsvp-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 0; border-bottom: 1px solid rgba(185,185,188,0.18); font-size: 10.5px; letter-spacing: 0.18em; color: #8A8577; }
  .bcw-rsvp-row > span:first-child { flex-shrink: 0; }
  .bcw-rsvp-row > span:last-child { color: #F4F1EA; letter-spacing: 0.02em; text-align: right; }
  .bcw-rsvp-row--payment { align-items: flex-start; }
  .bcw-rsvp-payment-value { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
  .bcw-rsvp-payment-total { color: #FFFFFF; font-size: 13px; letter-spacing: 0.02em; font-weight: 600; }
  .bcw-rsvp-payment-detail { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; font-size: 9px; letter-spacing: 0.05em; color: #8A8577; }
  .bcw-rsvp-stepper { display: flex; align-items: center; gap: 12px; }
  .bcw-rsvp-stepper button { width: 26px; height: 26px; border-radius: 50%; border: 1px solid #B9B9BC; background: transparent; color: #B9B9BC; font-size: 14px; line-height: 1; cursor: pointer; }
  .bcw-rsvp-stepper button:disabled { opacity: 0.3; cursor: default; }
  .bcw-rsvp-stepper span { font-family: var(--bcw-mono), monospace; color: #F4F1EA; min-width: 20px; text-align: center; }
  .bcw-rsvp-input { background: transparent; border: none; border-bottom: 1px solid rgba(185,185,188,0.3); color: #F4F1EA; font-family: var(--bcw-mono), monospace; font-size: 11px; letter-spacing: 0.02em; padding: 4px 2px; text-align: right; max-width: 55%; }
  .bcw-rsvp-input::placeholder { color: #6E6A5D; }
  .bcw-rsvp-input:focus { outline: none; border-bottom-color: #B9B9BC; }
  .bcw-rsvp-btn { width: 100%; padding: 16px; font-family: var(--bcw-mono), monospace; font-size: 11px; font-weight: 600; letter-spacing: 0.22em; text-transform: uppercase; background: linear-gradient(180deg, #B9B9BC, #4A4A4A); border: 1px solid #B9B9BC; color: #0A0A0A; cursor: pointer; }
  .bcw-rsvp-btn:disabled { opacity: 0.6; cursor: default; }
  .bcw-rsvp-btn--ghost { background: transparent; color: #B9B9BC; }
  .bcw-rsvp-error { font-size: 10px; letter-spacing: 0.06em; color: #B9B9BC; margin: 0; }
  .bcw-rsvp-declined { display: flex; flex-direction: column; gap: 18px; align-items: center; text-align: center; max-width: 380px; }
  .bcw-rsvp-declined-text { margin: 0; font-family: var(--bcw-bodoni), serif; font-style: italic; font-size: 18px; line-height: 1.4; color: #A8A292; }

  .bcw-photo-grid { position: relative; flex: 1; min-height: 0; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 12px; }
  .bcw-photo-cell { height: 100%; min-height: 0; aspect-ratio: 4/5; max-width: 100%; background: repeating-linear-gradient(135deg, #DCD7CB 0 6px, #E9E5DC 6px 12px); display: flex; align-items: flex-end; padding: 10px; box-sizing: border-box; overflow: hidden; position: relative; }
  .bcw-photo-cell--offset { margin-top: 18px; }
  .bcw-photo-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .bcw-photo-placeholder { position: relative; font-size: 8.5px; letter-spacing: 0.16em; color: #6E6A5D; }
  .bcw-upload-wrap { flex: 1; min-height: 0; overflow-y: auto; }
  .bcw-album-embed { flex: 1; min-height: 0; overflow-y: auto; }
  .bcw-live-placeholder { flex: 1; display: flex; align-items: center; justify-content: center; text-align: center; padding: 24px; border: 1px dashed rgba(20,20,27,0.2); }

  /* Mosaico fijo del álbum: grilla pareja de 3 columnas, todas las celdas
     con el mismo recorte cuadrado (mismo tamaño para todas las fotos, sin
     una celda "destacada" más grande que desentone), hasta 5 por hoja. */
  /* grid-auto-rows:auto + align-content:start (no stretch) -- si dejáramos
     1fr, las pocas filas de una página con menos fotos se repartían TODO el
     alto disponible del panel (flex:1 de un panel de 100vh) y las celdas se
     estiraban en vez de quedar cuadradas. Con auto, cada fila mide justo lo
     que necesita (cuadrado, según el ancho de columna) y el resto del panel
     queda en blanco en vez de deformar las fotos. */
  .bcw-mosaic { position: relative; flex: 1; min-height: 0; display: grid; grid-template-columns: repeat(3, 1fr); grid-auto-rows: auto; grid-auto-flow: dense; align-content: start; gap: 10px; }
  .bcw-mosaic-cell--featured { grid-column: span 2; grid-row: span 2; cursor: pointer; }
  .bcw-mosaic-cell { position: relative; height: 0; padding-top: 100%; background: repeating-linear-gradient(135deg, #DCD7CB 0 6px, #E9E5DC 6px 12px); overflow: hidden; cursor: pointer; }
  .bcw-mosaic-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  /* Celdas de relleno: cuando la cantidad de fotos no completa una fila
     entera, en vez de dejar el hueco vacío (o una fila con 1-2 fotos
     aisladas) se completa hasta el próximo múltiplo de 3 con este símbolo
     decorativo -- así todas las filas quedan parejas y alineadas entre sí,
     página a página. */

  .bcw-bank-wrap { position: relative; display: flex; flex-direction: column; gap: 14px; width: 100%; max-width: 420px; margin: 0; }
  .bcw-bank-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid rgba(185,185,188,0.18); }
  .bcw-bank-row:last-child { border-bottom: none; }
  .bcw-bank-row-label { display: block; font-size: 9px; letter-spacing: 0.2em; color: #8A8577; margin-bottom: 3px; }
  .bcw-bank-row-value { font-size: 12px; color: #F4F1EA; word-break: break-all; }
  .bcw-bank-copy { flex-shrink: 0; font-family: var(--bcw-mono), monospace; font-size: 10px; letter-spacing: 0.1em; padding: 7px 12px; border: 1px solid #B9B9BC; background: transparent; color: #B9B9BC; cursor: pointer; }
  .bcw-bank-copy:hover { background: rgba(185,185,188,0.12); }

  .bcw-eq { display: flex; align-items: flex-end; gap: 5px; height: 52px; }
  .bcw-eq-bar { width: 4px; height: 100%; transform-origin: bottom; animation: bcwEq 1.1s ease-in-out infinite; display: inline-block; }
  .bcw-song-wrap { font-family: var(--bcw-mono), monospace; }

  .bcw-song { position: relative; width: 100%; max-width: 420px; margin: 0 auto; }
  .bcw-song-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; border-bottom: 1px solid rgba(185,185,188,0.3); padding-bottom: 12px; }
  .bcw-song-inputs { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; font-size: 10px; letter-spacing: 0.24em; color: #8A8577; text-transform: uppercase; }
  .bcw-song-input { background: transparent; border: none; border-bottom: 1px solid rgba(185,185,188,0.3); color: #F4F1EA; font-family: var(--bcw-mono), monospace; font-size: 12px; padding: 6px 2px; min-width: 0; flex: 1; }
  .bcw-song-input::placeholder { color: #6E6A5D; }
  .bcw-song-input:focus { outline: none; border-bottom-color: #B9B9BC; }
  .bcw-song-sep { color: #8A8577; flex-shrink: 0; }
  .bcw-song-submit { flex-shrink: 0; background: none; border: none; color: #B9B9BC; font-family: var(--bcw-mono), monospace; font-size: 10px; letter-spacing: 0.2em; cursor: pointer; }
  .bcw-song-submit:hover { color: #FFFFFF; }
  .bcw-song-submit:disabled { color: #6E6A5D; cursor: default; }
  .bcw-song-error { font-size: 10px; color: #B9B9BC; margin-top: 6px; }
  .bcw-song-list { display: flex; flex-direction: column; margin-top: 14px; max-height: 180px; overflow-y: auto; }
  .bcw-song-item { display: flex; flex-direction: column; gap: 3px; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06); font-family: var(--bcw-mono), monospace; }
  .bcw-song-item-title { font-size: 11.5px; letter-spacing: 0.04em; color: #F4F1EA; }
  .bcw-song-item-by { font-size: 9.5px; letter-spacing: 0.1em; color: #6E6A5D; }

  .bcw-quiz { display: flex; flex-direction: column; gap: 28px; width: 100%; max-width: 460px; }
  .bcw-quiz-q { display: flex; flex-direction: column; gap: 14px; }
  .bcw-quiz-q-num { font-family: var(--bcw-mono), monospace; font-size: 10px; letter-spacing: 0.24em; color: #8A8577; }
  .bcw-quiz-q-text { margin: 0; font-family: var(--bcw-bodoni), serif; font-size: clamp(18px, 4vw, 22px); line-height: 1.3; color: #F4F1EA; }
  .bcw-quiz-opts { display: flex; flex-wrap: wrap; gap: 10px; }
  .bcw-quiz-opt { font-family: var(--bcw-mono), monospace; font-size: 11px; letter-spacing: 0.06em; padding: 10px 16px; border: 1px solid rgba(185,185,188,0.4); background: transparent; color: #B9B9BC; cursor: pointer; transition: background 160ms ease, color 160ms ease, border-color 160ms ease; }
  .bcw-quiz-opt:disabled { cursor: default; }
  .bcw-quiz-opt--picked { background: #B9B9BC; border-color: #B9B9BC; color: #0A0A0A; }
  .bcw-quiz-opt--correct { background: #B9B9BC; border-color: #B9B9BC; color: #0A0A0A; }
  .bcw-quiz-opt--wrong { border-color: #8A6A6A; color: #C99; opacity: 0.6; }
  .bcw-quiz-result { padding-top: 18px; border-top: 1px solid rgba(185,185,188,0.2); }
  .bcw-quiz-result-score { margin: 0 0 6px; font-family: var(--bcw-mono), monospace; font-size: 11px; letter-spacing: 0.16em; color: #FFFFFF; }
  .bcw-quiz-result-stat { margin: 0; font-size: 11.5px; line-height: 1.5; color: #A8A292; }

  .bcw-final-card { border: 1px solid #B9B9BC; padding: 30px 24px; display: flex; flex-direction: column; gap: 22px; align-items: center; text-align: center; position: relative; }
  .bcw-final-names { font-family: var(--bcw-bodoni), serif; font-size: clamp(34px, 10vw, 46px); line-height: .9; color: #FFFFFF; }
  .bcw-barcode { height: 26px; background: repeating-linear-gradient(90deg, #6E6A5D 0 2px, transparent 2px 4px, #6E6A5D 4px 5px, transparent 5px 9px, #6E6A5D 9px 11px, transparent 11px 14px); }
  .bcw-final-footer { display: flex; justify-content: space-between; align-items: center; font-size: 9px; letter-spacing: 0.24em; color: #56534A; }
  .bcw-replay { cursor: pointer; color: #B9B9BC; }
  .bcw-footer-credit { display: flex; justify-content: center; padding-top: 8px; opacity: 0.7; }

  .bcw-rail { position: absolute; right: 0; top: 0; bottom: 0; width: 34px; z-index: 4; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 20px 0; opacity: 0; transition: opacity 700ms ease; pointer-events: none; border-left: 1px solid rgba(185,185,188,0.14); }
  .bcw-rail-top { writing-mode: vertical-rl; font-size: 8px; letter-spacing: 0.34em; color: #8A8577; transition: color 500ms ease; }
  .bcw-rail-line { flex: 1; width: 1px; margin: 16px 0; background: rgba(185,185,188,0.16); position: relative; }
  .bcw-rail-bar { position: absolute; left: -1px; top: 0; width: 3px; height: 0%; background: linear-gradient(#FFFFFF, #B9B9BC); transition: height 260ms linear; display: block; }
  .bcw-rail-label { writing-mode: vertical-rl; font-size: 8px; letter-spacing: 0.34em; color: #B9B9BC; transition: color 500ms ease; }

  .bcw-cover { position: absolute; inset: 0; z-index: 5; }
  .bcw-cover-half { position: absolute; left: 0; right: 0; height: 50%; overflow: hidden; transition: transform 1100ms cubic-bezier(.7,0,.2,1); }
  .bcw-cover-half--top { top: 0; }
  .bcw-cover-half--bottom { bottom: 0; }
  .bcw-cover-inner { position: absolute; left: 0; right: 0; top: 0; height: 200%; overflow: hidden; background: radial-gradient(120% 70% at 50% 8%, #141414 0%, #0A0A0A 46%, #080808 100%); }
  .bcw-cover-half--bottom .bcw-cover-inner { top: auto; bottom: 0; }
  .bcw-cover-glow { position: absolute; left: 50%; top: 6%; width: 190%; aspect-ratio: 1; transform: translate(-50%, -14%); border-radius: 50%; background: conic-gradient(from 200deg, rgba(255,255,255,0.3), rgba(185,185,188,0.3), rgba(255,255,255,0.4), rgba(255,255,255,0.3)); filter: blur(64px); opacity: .62; animation: bcwFoil 26s linear infinite; }
  .bcw-cover-sunburst { position: absolute; inset: 0; background: repeating-conic-gradient(from 0deg at 50% 44%, rgba(255,255,255,0.75) 0deg 0.4deg, transparent 0.4deg 3.2deg); opacity: .3; -webkit-mask-image: radial-gradient(closest-side at 50% 44%, #000 14%, rgba(0,0,0,0.5) 46%, transparent 82%); mask-image: radial-gradient(closest-side at 50% 44%, #000 14%, rgba(0,0,0,0.5) 46%, transparent 82%); }
  .bcw-cover-frame { position: absolute; pointer-events: none; }
  .bcw-cover-frame--outer { inset: 26px; border: 1px solid rgba(255,255,255,.5); }
  .bcw-cover-frame--inner { inset: 32px; border: 1px solid rgba(255,255,255,.16); }
  .bcw-cover-content { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: space-between; padding: 24px max(24px, calc((100% - 440px) / 2)) 26px; }
  .bcw-cover-top-row { display: flex; justify-content: space-between; font-size: 9.5px; letter-spacing: 0.24em; color: #8A8577; }
  .bcw-cover-center { display: flex; flex-direction: column; align-items: center; gap: clamp(10px, 2.2vh, 22px); text-align: center; }
  .bcw-cover-kicker { font-size: 9.5px; letter-spacing: 0.34em; color: #8A8577; }
  .bcw-cover-names { margin: 0; font-family: var(--bcw-bodoni), serif; font-weight: 400; font-size: min(clamp(48px, 16vw, 96px), 12.5vh); line-height: 0.86; letter-spacing: -0.02em; color: #FFFFFF; }
  .bcw-cover-rule { width: 1px; height: clamp(16px, 4vh, 44px); background: linear-gradient(#B9B9BC, transparent); display: block; }
  .bcw-cover-date { font-size: 11.5px; letter-spacing: 0.3em; color: #A8A292; white-space: nowrap; }
  .bcw-cover-bottom { display: flex; flex-direction: column; gap: clamp(12px, 2.4vh, 22px); }
  .bcw-cover-facts { display: flex; justify-content: space-between; font-size: 9px; letter-spacing: 0.2em; color: #6E6A5D; }
  .bcw-cover-cta { border: 1px solid #B9B9BC; background: linear-gradient(100deg, rgba(185,185,188,0.08), rgba(255,255,255,0.2), rgba(185,185,188,0.08)); color: #FFFFFF; font-family: var(--bcw-mono), monospace; font-size: 12px; letter-spacing: 0.26em; padding: clamp(13px, 2.1vh, 19px) 0; text-align: center; width: 100%; }
  .bcw-cover-cta--btn { cursor: pointer; border-radius: 0; }
  @media (hover: hover) {
    .bcw-cover-cta--btn:hover { background: linear-gradient(100deg, rgba(255,255,255,0.34), rgba(255,255,255,0.5), rgba(255,255,255,0.34)); color: #0B0B0F; }
  }
  .bcw-barcode-wrap { display: flex; flex-direction: column; align-items: center; gap: 10px; }

  .bcw-hint { position: absolute; left: 0; right: 34px; bottom: 18px; z-index: 6; text-align: center; font-size: 9px; letter-spacing: 0.28em; color: #8A8577; opacity: 0; transition: opacity 600ms ease; pointer-events: none; animation: bcwHint 2.4s ease-in-out infinite; }

  .bcw-lightbox { position: fixed; inset: 0; z-index: 200; background: rgba(8,8,11,0.96); display: flex; align-items: center; justify-content: center; padding: 24px; cursor: zoom-out; }
  .bcw-lightbox-close { position: absolute; top: 20px; right: 20px; width: 36px; height: 36px; border-radius: 50%; border: 1px solid #B9B9BC; background: rgba(0,0,0,0.4); color: #F4F1EA; font-size: 18px; line-height: 1; cursor: pointer; display: flex; align-items: center; justify-content: center; }
  .bcw-lightbox-img { max-width: 100%; max-height: 88vh; object-fit: contain; cursor: default; }
`;
