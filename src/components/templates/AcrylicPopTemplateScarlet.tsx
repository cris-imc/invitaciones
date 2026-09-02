"use client";

/**
 * AcrylicPopTemplateScarlet.tsx
 *
 * Portado 1:1 desde el diseño "Acrylic Pop" (Colección Storytelling, mis
 * quince años: fondo tinta casi negra, acento neón rojo/turquesa/amarillo estilo
 * "acrílico de club", Poppins + IBM Plex Mono, medallón tipo pase de acceso
 * con el número "15" en vez de ícono, scroll horizontal "pineado" para
 * Cuándo y dónde / Álbum, riel lateral de progreso y portada que se abre en
 * dos mitades). Misma arquitectura que PrincesaTemplate.tsx (ver ese archivo
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
import { AnimatedCoverPhoto, COVER_RESPONSIVE_STYLE } from "@/components/invitation/v2/AnimatedCoverPhoto";
import { resolveGuestNameDisplay } from "@/lib/invitation-copy";
import { useMusicPlayer, MusicToggleButton } from "@/components/invitation/MusicPlayer";
import { BankDetailsCard } from "@/components/invitation/v2/BankDetailsCard";
import { InfoAdicionalSection } from "@/components/invitation/v2/InfoAdicionalSection";
import { CreditCard, Gift } from "lucide-react";
import { createPortal } from "react-dom";

const acpPoppins = Poppins({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "600", "700", "800"],
  variable: "--acp-poppins",
  display: "swap",
});

const acpMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--acp-mono",
  display: "swap",
});

// Tonos claros que rotan entre hojas del álbum para diferenciarlas a simple
// vista sin depender de más de 3 colores fijos.
const ALBUM_TONES = ["#F6F3EC", "#F1EDE3", "#EDE8DE"];

// Ciclo de acento rojo/turquesa/amarillo (variante "Escarlata Eléctrico") del mockup para las palabras destacadas de
// la frase (mismo orden en que aparecen: prende=rojo, una=turquesa, sola=amarillo,
// vez.=fucsia otra vez).
const PHRASE_ACCENTS = ["#FF3355", "#1FE0C8", "#FFE94D"];

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

interface AcpQuizQuestion {
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

interface AcrylicPopTemplateScarletProps {
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

export function AcrylicPopTemplateScarlet({ invitation, guest, isPersonalized = false }: AcrylicPopTemplateScarletProps) {
  const nombreQuinceanera = String(invitation.nombreQuinceanera || invitation.nombreEvento || "");
  const namesTitle = nombreQuinceanera || "Mis 15";

  // "Saludar por nombre del invitado/familia": si está activo, la portada
  // saluda con el nombre del invitado/familia en vez de la quinceañera.
  const showGuestNameInCover = Boolean(guest?.name) && invitation.mostrarNombreInvitadoEnSaludo !== false;
  const coverGuestName = resolveGuestNameDisplay(invitation, guest);
  const coverKickerText = showGuestNameInCover ? "TU PASE PERSONAL PARA" : "ABRÍ TU INVITACIÓN A LOS 15 DE";
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
  const dressCode = String(invitation.portadaDressCode ?? "");
  const portadaMensaje = String(
    invitation.portadaMensaje || "Bloqueá la noche entera: esto no termina temprano."
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

  // Portada de bienvenida y foto principal con foto real (ver
  // GuestPassVipTemplate.tsx / rama experimento-foto-storytelling). Ambas
  // opcionales: sin cargarlas, todo se ve exactamente igual que antes.
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
  const triviaPreguntas: AcpQuizQuestion[] = safeJson<AcpQuizQuestion[]>(String(invitation.triviaPreguntas ?? ""), []);
  const triviaTitulo = String(invitation.triviaTitulo || "¿Cuánto sabés de mí?");
  const quizEnabled = triviaHabilitada && triviaPreguntas.length > 0;

  // Frase: elegible/personalizable desde el wizard (StepPhrase) -- si está
  // deshabilitada o no se cargó texto, la sección entera no se muestra (ver
  // hasFrase más arriba): no hay frase default hardcodeada como fallback,
  // si no se quiere frase no debe aparecer ninguna.
  const frase = hasFrase ? String(invitation.frasePersonalizadaTexto) : "";
  const fraseWords = frase.split(/\s+/).filter(Boolean);
  // Combinación de colores del diseño: primera mitad de la frase en color
  // plano, segunda mitad itálica ciclando rojo/turquesa/amarillo (mismo orden que
  // el mockup: prende, una, sola, vez.).
  const fraseAccentStart = Math.floor(fraseWords.length / 2);
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
        statusRef.current.style.color = "#FFE94D";
      }
      if (stubRef.current) {
        stubRef.current.style.borderColor = "#FF3355";
        stubRef.current.style.boxShadow = "0 0 0 1px rgba(200,164,92,.35), 0 18px 50px -30px #FF3355";
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
            dot.style.background = i === active ? "#1FE0C8" : "rgba(20,20,27,0.18)";
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
          if (railLabelRef.current) railLabelRef.current.style.color = light ? "#1FE0C8" : "#FF3355";
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
      className={`${acpPoppins.variable} ${acpMono.variable}`}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "calc(var(--vh, 1vh) * 100)",
        overflow: "hidden",
        background: "#14090B",
        fontFamily: "var(--acp-mono), monospace",
        color: "#F4F1EA",
      }}
    >
      <style>{ACP_CSS}</style>
      <style>{COVER_RESPONSIVE_STYLE}</style>

      <div ref={scrollerRef} data-scroller="1" className="acp-scroller">
        <section data-tone="dark" data-screen-label="Save the Date" className="acp-section" style={{ background: "radial-gradient(120% 80% at 50% 0%, #260D10 0%, #1D0B0F 55%, #14090B 100%)" }}>
          <span data-xin="1" data-dist="-60" className="acp-kicker">01 — GUARDÁ LA FECHA</span>
          <div className="acp-date-stack">
            <span data-xin="1" data-delay="60" data-dist="-110" className="acp-date-num">{dayNum}</span>
            <span data-xin="1" data-delay="170" data-dist="140" className="acp-date-month">{monthAbbr}</span>
            <span data-xin="1" data-delay="280" data-dist="220" className="acp-date-num acp-date-num--right">
              {String(fechaEvento.getFullYear()).slice(-2)}
            </span>
          </div>
          <div data-xin="1" data-delay="380" data-dist="-80" className="acp-divider">
            <span className="acp-divider-line" /><span>{weekday} · {hora} H</span>
          </div>
          <p data-xin="1" data-delay="460" className="acp-lead">{portadaMensaje}</p>
          <AddToCalendarLink
            eventName={namesTitle}
            targetDate={eventDateTime}
            location={lugarNombre || direccion}
            description={portadaMensaje}
            className="acp-cal-link"
          />

          <div data-drift="-70" className="acp-medallion acp-medallion--corner">
            <AcpMedallion sub="ACCESO" arcId="acpArc1" arcText="MIS 15 · ADMIT ONE · " spin="normal" />
          </div>
        </section>

        {/* Foto principal con efecto cinemático, sin tinte de color. Ocupa
            toda la pantalla en mobile; en desktop se enmarca con un borde
            propio en vez de estirarse edge-to-edge. */}
        {(photoMobile || photoDesktop) && (
          <section
            data-tone="dark"
            data-screen-label="Nuestra foto"
            className={`acp-hero-photo-section${!photoMobile ? " acp-hero-photo-section--no-mobile" : ""}${!photoDesktop ? " acp-hero-photo-section--no-desktop" : ""}`}
          >
            <div className="acp-hero-photo-frame">
              {photoMobile && (
                <div className="acp-mobile-only">
                  <AnimatedCoverPhoto photoSrc={photoMobile} tint={false} effect="enfoque" scrimColorRgb="20,9,11" />
                </div>
              )}
              {photoDesktop && (
                <div className="acp-desktop-only">
                  <AnimatedCoverPhoto photoSrc={photoDesktop} tint={false} effect="enfoque" scrimColorRgb="20,9,11" />
                </div>
              )}
            </div>
            <span data-xin="1" data-dist="-60" className="acp-kicker acp-hero-photo-kicker">02 — LA PISTA YA ARRANCÓ</span>
          </section>
        )}

        <section id="countdown" data-tone="dark" data-screen-label="Countdown" className="acp-section acp-section--between" style={{ background: "radial-gradient(100% 60% at 50% 100%, #2A0E12 0%, #1A0A0D 55%, #14090B 100%)" }}>
          <div className="acp-scan-grid" />
          <div className="acp-scanline" />
          <span data-xin="1" data-dist="-60" className="acp-kicker" style={{ position: "relative" }}>{knPre(2)} — LA FIESTA EMPIEZA EN</span>
          <div className="acp-cd-grid">
            <AcpCdBox refEl={dRef} delay={40} dist={-90} label="DÍAS" />
            <AcpCdBox refEl={hRef} delay={120} dist={110} label="HORAS" />
            <AcpCdBox refEl={mRef} delay={200} dist={-140} label="MIN" />
            <AcpCdBox refEl={sRef} delay={280} dist={170} label="SEG" numColor="#FFE94D" />
          </div>
          <div className="acp-perf-strip" />
        </section>

        {hasFrase && (
        <section id="quote" data-tone="dark" data-screen-label="Frase" className="acp-section" style={{ background: "radial-gradient(130% 90% at 86% 16%, #2C0F14 0%, #17090C 52%, #14090B 100%)" }}>
          <div data-drift="-130" className="acp-glow-blob" />
          <span data-xin="1" data-dist="-60" className="acp-kicker" style={{ position: "relative" }}>{knPre(3)} — CUANDO LLEGUE A CERO</span>
          <h2 ref={phraseRef} className="acp-phrase" style={{ fontSize: fraseFontSize }}>
            {fraseWords.map((w, i) => {
              const isAccent = i >= fraseAccentStart;
              const accentColor = isAccent ? PHRASE_ACCENTS[(i - fraseAccentStart) % PHRASE_ACCENTS.length] : undefined;
              return (
                // El espacio va FUERA del span: el motor de reveal fuerza
                // `display:inline-block` en cada [data-w], y un espacio de fin
                // de línea DENTRO de un inline-block se colapsa a 0 -- como
                // texto suelto entre spans, en cambio, se renderiza normal.
                <span key={i}>
                  <span data-w="1" className={isAccent ? "acp-accent-italic" : undefined} style={accentColor ? { color: accentColor } : undefined}>
                    {w}
                  </span>{" "}
                </span>
              );
            })}
          </h2>
          <div data-xin="1" data-delay="120" data-dist="90" className="acp-divider" style={{ position: "relative" }}>
            <span className="acp-divider-line acp-divider-line--long" /><span>{fechaCorta} — {hora} H</span>
          </div>
        </section>
        )}

        <div data-pan="1" data-screen-label="Cuándo y dónde" className="acp-pan" style={ceremoniaHabilitada ? { height: "340vh" } : undefined}>
          <div className="acp-pan-sticky">
            <div data-strip="1" className="acp-strip">
              {ceremoniaHabilitada && (
                <div id="ceremonia" data-tone="light" className="acp-panel acp-panel--between" style={{ background: "#EFEBE1", color: "#14141B" }}>
                  <div className="acp-hair-bg" />
                  <div className="acp-panel-top">
                    <span>{kn(3)} — {ceremoniaTitulo.toUpperCase()}</span><span>01 / {LUGAR_PANEL_COUNT}</span>
                  </div>
                  <h2 className="acp-panel-title">
                    {ceremoniaNombre || ceremoniaTitulo}
                    {ceremoniaDireccion && <><br /><span className="acp-accent-serif">{ceremoniaDireccion}</span></>}
                  </h2>
                  <div className="acp-facts">
                    {ceremoniaHora && (
                      <div className="acp-facts-row acp-facts-row--last">
                        <span>HORARIO</span><span>{ceremoniaHora} H</span>
                      </div>
                    )}
                  </div>
                  {ceremoniaMapUrl && (
                    <a href={ceremoniaMapUrl} target="_blank" rel="noopener noreferrer" className="acp-link-cta">
                      ABRIR EN MAPAS →
                    </a>
                  )}
                  <div className="acp-seguir">SEGUÍ BAJANDO <span className="acp-side-hint">→</span></div>
                </div>
              )}

              <div id="details" data-tone="light" className="acp-panel acp-panel--between" style={{ background: "#EFEBE1", color: "#14141B" }}>
                <div className="acp-hair-bg" />
                <div className="acp-panel-top">
                  <span>{kn(3)} — CUÁNDO Y DÓNDE</span><span>{ceremoniaHabilitada ? "02" : "01"} / {LUGAR_PANEL_COUNT}</span>
                </div>
                <h2 className="acp-panel-title">
                  {lugarNombre || "El salón"}
                  {direccion && <><br /><span className="acp-accent-serif">{direccion}</span></>}
                </h2>
                <div className="acp-facts">
                  <div className="acp-facts-row">
                    <span>HORARIO</span><span>{hora} H</span>
                  </div>
                  {dressCode && (
                    <div className="acp-facts-row acp-facts-row--last">
                      <span>CÓDIGO</span><span className="acp-accent-serif-2">{dressCode.toUpperCase()}</span>
                    </div>
                  )}
                </div>
                {cronograma.length > 0 && (
                  <div className="acp-crono">
                    {cronograma.map((item, i) => (
                      <div key={i} className="acp-crono-row">
                        <span className="acp-crono-time">{item.time || ""}</span>
                        <span className="acp-crono-title">{item.title}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="acp-seguir">SEGUÍ BAJANDO <span className="acp-side-hint">→</span></div>
              </div>

              <div data-tone="light" className="acp-panel acp-panel--end" style={{ background: "#E4DFD3", color: "#14141B" }}>
                <svg viewBox="0 0 300 500" preserveAspectRatio="none" className="acp-route-svg">
                  <path ref={routeRef} d="M18 468 C 130 400, 54 262, 152 220 S 254 140, 282 40" fill="none" stroke="#1FE0C8" strokeWidth={1.6} />
                  <circle cx={282} cy={40} r={5} fill="#1FE0C8" />
                </svg>
                <div className="acp-panel-block">
                  <span className="acp-mini-label">{ceremoniaHabilitada ? "03" : "02"} / {LUGAR_PANEL_COUNT}</span>
                  <span className="acp-panel-title-sm">Cómo llegar</span>
                  {direccion && <span className="acp-mini-label">{direccion}</span>}
                  {mapUrl && (
                    <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="acp-link-cta">
                      ABRIR EN MAPAS →
                    </a>
                  )}
                </div>
              </div>

              <div data-tone="dark" className="acp-panel acp-panel--center" style={{ background: "#1D0B0F", color: "#F4F1EA" }}>
                <div className="acp-medallion acp-medallion--lg">
                  <AcpMedallion sub={`PASE Nº ${passNumber}`} arcId="acpArc2" arcText={`ACCESO VIP · PASE Nº ${passNumber} · `} spin="reverse" />
                </div>
                <span className="acp-mini-label">{LUGAR_PANEL_COUNT} / {LUGAR_PANEL_COUNT} — TU UBICACIÓN</span>
              </div>
            </div>
            <AcpDots count={LUGAR_PANEL_COUNT} />
          </div>
        </div>

        <section data-tone="dark" data-screen-label="Check-in" className="acp-section" style={{ background: "radial-gradient(110% 70% at 50% 100%, #260D10 0%, #1D0B0F 60%, #14090B 100%)" }}>
          <span data-xin="1" data-dist="-60" className="acp-kicker">{kn(4)} — CHECK-IN</span>
          <h2 data-xin="1" data-delay="80" data-dist="130" className="acp-h2">
            Confirmá<br /><span className="acp-accent-italic">tu acceso</span>
          </h2>

          {rsvpEnabled ? (
            <div data-xin="1" data-delay="170" data-dist="-90" className="acp-rsvp">
              <AcpRsvpCard
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
            <p className="acp-lead">La confirmación de asistencia está cerrada por el momento.</p>
          )}
        </section>

        <div id="album" data-pan="1" data-screen-label="Álbum" className="acp-pan">
          <div className="acp-pan-sticky">
            <div data-strip="1" className="acp-strip">
              {photoPages.map((page, pageIndex) => (
                <div key={pageIndex} data-tone="light" className="acp-panel acp-panel--gap" style={{ background: ALBUM_TONES[pageIndex % ALBUM_TONES.length], color: "#14141B" }}>
                  <div className="acp-hair-bg" />
                  <div className="acp-panel-top">
                    <span>{kn(5)} — ARCHIVO / {String(allPhotos.length).padStart(3, "0")}</span><span>HOJA {String(pageIndex + 1).padStart(2, "0")} / {String(photoPages.length).padStart(2, "0")}</span>
                  </div>
                  {pageIndex === 0 && <h2 className="acp-panel-title-md">Álbum <span className="acp-accent-serif">de fotos</span></h2>}
                  <div className="acp-mosaic">
                    {page.length > 0 ? page.map((url, i) => (
                      <div
                        key={i}
                        className={`acp-mosaic-cell${i === 0 ? " acp-mosaic-cell--featured" : ""}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => setExpandedPhoto(url)}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setExpandedPhoto(url); }}
                        aria-label={`Ampliar foto ${i + 1}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" className="acp-mosaic-img" />
                      </div>
                    )) : (
                      <span className="acp-photo-placeholder">Sin fotos todavía</span>
                    )}
                  </div>
                  <div className="acp-seguir acp-seguir--split">
                    <span>{allPhotos.length} FOTOS SUBIDAS</span>
                    <span className="acp-accent-serif-2">SEGUÍ →</span>
                  </div>
                </div>
              ))}

              <div data-tone="light" className="acp-panel acp-panel--gap" style={{ background: "#EDE8DE", color: "#14141B" }}>
                <span className="acp-panel-top" style={{ display: "block" }}>HOJA {String(photoPages.length + 1).padStart(2, "0")} — EN VIVO</span>
                <h2 className="acp-panel-title">Todo lo que<br /><span className="acp-accent-serif">vamos a recordar</span></h2>
                <div className="acp-album-embed">
                  {livePhotos.length > 0 ? (
                    <LiveAlbumStrip photos={livePhotos} tone="light" accentColor="#1FE0C8" />
                  ) : (
                    <div className="acp-live-placeholder">
                      <span className="acp-mini-label">
                        {eventHasStarted
                          ? "Todavía no se subió nada en vivo."
                          : "Esta sección se activa el día de la fiesta -- ahí vas a poder ver todo lo que subamos en vivo."}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <AcpDots count={photoPages.length + 1} />
          </div>
        </div>

        {sugerenciaMusicaHabilitada && (
          <section id="music" data-tone="dark" data-screen-label="Música" className="acp-section" style={{ background: "#1D0B0F" }}>
            <span data-xin="1" data-dist="-60" className="acp-kicker">{kn(6)} — SUGERENCIA DE MÚSICA</span>
            <h2 data-xin="1" data-delay="80" data-dist="140" className="acp-h2">¿Qué tema<br /><span className="acp-accent-italic">te hace bailar?</span></h2>
            <div data-xin="1" data-delay="160" data-dist="-80" className="acp-eq">
              {[0, 0.18, 0.36, 0.54, 0.72].map((delay, i) => (
                <span key={i} className="acp-eq-bar" style={{ animationDelay: `${delay}s`, background: i === 2 ? "#FFE94D" : "#FF3355" }} />
              ))}
            </div>
            <div data-xin="1" data-delay="240" data-dist="110" className="acp-song-wrap">
              <AcpSongSuggestion
                invitationId={String(invitation.id ?? "")}
                guestToken={guest?.uniqueToken}
                guestName={guestName || "Invitado"}
              />
            </div>
          </section>
        )}

        {showBankSection && (
          <section id="banco" data-tone="dark" data-screen-label="Regalos" className="acp-section" style={{ background: "#1D0B0F" }}>
            <span data-xin="1" data-dist="-60" className="acp-kicker">{sugerenciaMusicaHabilitada ? kn(7) : kn(6)} — REGALOS Y PAGOS</span>
            <h2 data-xin="1" data-delay="80" data-dist="140" className="acp-h2">
              Si querés<br /><span className="acp-accent-italic">sumarte</span>
            </h2>
            <div data-xin="1" data-delay="160" data-dist="-80" className="acp-bank-wrap">
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
                  accentColor="#FF3355"
                  cardBg="rgba(20,20,27,0.72)"
                  cardBorder="#2A2417"
                  textPrimary="#F4F1EA"
                  textSecondary="#A8A292"
                  InfoRow={AcpInfoRow}
                  CopyField={AcpCopyField}
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
                  accentColor="#FF3355"
                  cardBg="rgba(20,20,27,0.72)"
                  cardBorder="#2A2417"
                  textPrimary="#F4F1EA"
                  textSecondary="#A8A292"
                  InfoRow={AcpInfoRow}
                  CopyField={AcpCopyField}
                />
              )}
            </div>
          </section>
        )}

        {quizEnabled && (
          <section id="quiz" data-tone="dark" data-screen-label="Quiz" className="acp-section" style={{ background: "#1D0B0F" }}>
            <span data-xin="1" data-dist="-60" className="acp-kicker">{knAcc([sugerenciaMusicaHabilitada, showBankSection].filter(Boolean).length + 6)} — EL JUEGO</span>
            <h2 data-xin="1" data-delay="80" data-dist="140" className="acp-h2" style={{ fontSize: "clamp(28px, 6vw, 44px)" }}>
              {triviaTitulo}
            </h2>
            <div data-xin="1" data-delay="160" data-dist="-80">
              <AcpQuiz
                preguntas={triviaPreguntas}
                invitationId={String(invitation.id ?? "")}
                guestToken={guest?.uniqueToken}
                guestName={guestName || "Invitado"}
              />
            </div>
          </section>
        )}

        <section data-tone="dark" data-screen-label="Tu pase" className="acp-section acp-section--between" style={{ padding: "96px max(30px, calc((100% - 560px) / 2)) 48px max(24px, calc((100% - 560px) / 2))", background: "radial-gradient(120% 70% at 50% 100%, #260D10 0%, #1D0B0F 55%, #14090B 100%)" }}>
          <span data-xin="1" data-dist="-60" className="acp-kicker">{knAcc([sugerenciaMusicaHabilitada, showBankSection, quizEnabled].filter(Boolean).length + 6)} — GUARDÁ TU PASE</span>
          <div data-xin="1" data-delay="100" data-dist="130" className="acp-final-card">
            <div className="acp-medallion acp-medallion--final">
              <AcpMedallion sub={confirmed ? "CONFIRMADO" : "PENDIENTE"} arcId="acpArc3" arcText={`${namesTitle.toUpperCase()} · ${fechaCorta} · `} spin="reverse" />
            </div>
            <span className="acp-mini-label acp-accent-serif-2">PASE Nº {passNumber} · ADMIT {guestAdults + guestTeens + guestChildren || 1}</span>
            <span className="acp-final-names">{namesTitle}</span>
            <span className="acp-mini-label" style={{ color: "#A8A292" }}>{fechaCorta} — {hora} H</span>
            <div className="acp-barcode" style={{ width: "60%", height: 26, opacity: 0.6 }} />
          </div>
          <div className="acp-final-footer">
            <span>NO TRANSFERIBLE</span>
            <span className="acp-replay" onClick={reset}>VER LA APERTURA OTRA VEZ ↺</span>
          </div>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <InfoAdicionalSection invitation={invitation as any} />
          <div className="acp-footer-credit">
            <LogoFooterCredit bgColor="transparent" />
          </div>
        </section>
      </div>

      <div ref={railRef} className="acp-rail">
        <span ref={railTopRef} className="acp-rail-top">PASE Nº {passNumber}</span>
        <div ref={railLineRef} className="acp-rail-line">
          <span ref={railBarRef} className="acp-rail-bar" />
        </div>
        <span ref={railLabelRef} className="acp-rail-label">SAVE THE DATE</span>
      </div>

      <div ref={coverRef} className="acp-cover">
        <div ref={topRef} className="acp-cover-half acp-cover-half--top">
          <AcpCoverHalf
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
            <div className="acp-cover-cta">ABRIR INVITACIÓN</div>
          </AcpCoverHalf>
        </div>
        <div ref={bottomRef} className="acp-cover-half acp-cover-half--bottom">
          <AcpCoverHalf
            kickerText={coverKickerText}
            namesTitle={coverNamesTitle}
            fechaCorta={fechaCorta}
            passNumber={passNumber}
            dressCode={dressCode}
            hora={hora}
            photoMobile={photoMobile}
            photoDesktop={photoDesktop}
          >
            <button onClick={open} className="acp-cover-cta acp-cover-cta--btn">ABRIR INVITACIÓN</button>
          </AcpCoverHalf>
        </div>
      </div>

      <div ref={hintRef} className="acp-hint">DESLIZÁ ↓</div>

      {expandedPhoto && (
        <div
          className="acp-lightbox"
          onClick={() => setExpandedPhoto(null)}
          onContextMenu={(e) => e.preventDefault()}
        >
          <button
            type="button"
            className="acp-lightbox-close"
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
            className="acp-lightbox-img"
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

function AcpCdBox({ refEl, delay, dist, label, numColor }: { refEl: React.RefObject<HTMLSpanElement | null>; delay: number; dist: number; label: string; numColor?: string }) {
  return (
    <div data-xin="1" data-delay={delay} data-dist={dist} className="acp-cd-box">
      <span ref={refEl} className="acp-cd-num" style={numColor ? { color: numColor } : undefined}>—</span>
      <span className="acp-cd-label">{label}</span>
    </div>
  );
}

function AcpDots({ count = 3 }: { count?: number }) {
  return (
    <div data-dots="1" className="acp-dots">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} data-dot={i} className="acp-dot" />
      ))}
    </div>
  );
}

// Medallón tipo pase de acceso: el número "15" en Poppins en vez de un ícono
// (ver el mockup original -- no hay tiara ni destello, solo el número y el
// texto girando en el borde) -- distinto a los medallones con ícono de otras
// plantillas de la colección.
function AcpMedallion({
  sub,
  arcId,
  arcText,
  spin,
  compact,
}: {
  sub: string;
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
      <div className="acp-medallion-ring" style={{ animation: spin === "none" ? "none" : `gpRing ${ringDuration}s linear infinite` }} />
      <div className="acp-medallion-core">
        <span className={compact ? "acp-medallion-num-sm" : "acp-medallion-num"}>15</span>
        {sub && <span className="acp-medallion-sub">{sub}</span>}
      </div>
      {arcId && (
        <svg viewBox="0 0 100 100" className="acp-medallion-arc" style={{ animation: spin === "reverse" ? "gpRingRev 32s linear infinite" : "gpRingRev 34s linear infinite" }}>
          <defs>
            <path id={arcId} d="M50 50 m -38 0 a 38 38 0 1 1 76 0 a 38 38 0 1 1 -76 0" fill="none" />
          </defs>
          <text className="acp-medallion-arc-text">
            <textPath href={`#${arcId}`}>{arcText}{arcText}</textPath>
          </text>
        </svg>
      )}
    </>
  );
}

function AcpCopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div className="acp-bank-row">
      <div style={{ minWidth: 0, flex: 1 }}>
        <span className="acp-bank-row-label">{label}</span>
        <span className="acp-bank-row-value">{value}</span>
      </div>
      <button type="button" className="acp-bank-copy" onClick={handle}>
        {copied ? "✓ Copiado" : "Copiar"}
      </button>
    </div>
  );
}

// Reimplementación propia del RSVP: filas de datos + el ticket/sello ya
// existente en la plantilla. Habla con el mismo endpoint/payload que
// <RSVPWizardV2> (/api/guests/[token]/confirm o /api/rsvp), así que no
// cambia ningún dato que pida el backend, solo cómo se ve.
function AcpRsvpCard({
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
      <div className="acp-rsvp-declined">
        <p className="acp-rsvp-declined-text">Gracias por avisarnos. Si cambiás de idea, este mismo acceso sigue activo.</p>
        <button type="button" className="acp-rsvp-btn acp-rsvp-btn--ghost" onClick={() => setStatus("PENDING")}>
          CAMBIÉ DE IDEA
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="acp-rsvp-rows">
        <div className="acp-rsvp-row">
          <span>{totalGuests > 1 ? "RESERVADO PARA" : "NOMBRE Y APELLIDO"}</span>
          <span>{guestName || "—"}</span>
        </div>

        {totalGuests > 1 && status !== "CONFIRMED" && (
          <div className="acp-rsvp-row">
            <span>ADULTOS</span>
            <div className="acp-rsvp-stepper">
              <button type="button" onClick={() => setAdultCount((v) => Math.max(1, v - 1))} disabled={adultCount <= 1}>−</button>
              <span>{String(adultCount).padStart(2, "0")}</span>
              <button type="button" onClick={() => setAdultCount((v) => Math.min(maxAdults, v + 1))} disabled={adultCount >= maxAdults}>+</button>
            </div>
          </div>
        )}
        {maxTeens > 0 && status !== "CONFIRMED" && (
          <div className="acp-rsvp-row">
            <span>ADOLESCENTES</span>
            <div className="acp-rsvp-stepper">
              <button type="button" onClick={() => setTeenCount((v) => Math.max(0, v - 1))} disabled={teenCount <= 0}>−</button>
              <span>{String(teenCount).padStart(2, "0")}</span>
              <button type="button" onClick={() => setTeenCount((v) => Math.min(maxTeens, v + 1))} disabled={teenCount >= maxTeens}>+</button>
            </div>
          </div>
        )}
        {maxChildren > 0 && status !== "CONFIRMED" && (
          <div className="acp-rsvp-row">
            <span>NIÑOS</span>
            <div className="acp-rsvp-stepper">
              <button type="button" onClick={() => setChildCount((v) => Math.max(0, v - 1))} disabled={childCount <= 0}>−</button>
              <span>{String(childCount).padStart(2, "0")}</span>
              <button type="button" onClick={() => setChildCount((v) => Math.min(maxChildren, v + 1))} disabled={childCount >= maxChildren}>+</button>
            </div>
          </div>
        )}
        {status === "CONFIRMED" && (
          <>
            {totalGuests > 1 && adultCount > 0 && <div className="acp-rsvp-row"><span>ADULTOS</span><span>{String(adultCount).padStart(2, "0")}</span></div>}
            {teenCount > 0 && <div className="acp-rsvp-row"><span>ADOLESCENTES</span><span>{String(teenCount).padStart(2, "0")}</span></div>}
            {childCount > 0 && <div className="acp-rsvp-row"><span>NIÑOS</span><span>{String(childCount).padStart(2, "0")}</span></div>}
          </>
        )}

        {status !== "CONFIRMED" ? (
          <div className="acp-rsvp-row">
            <span>RESTRICCIÓN ALIMENTARIA</span>
            <input
              value={dietary}
              onChange={(e) => setDietary(e.target.value)}
              placeholder="—"
              className="acp-rsvp-input"
            />
          </div>
        ) : (
          <div className="acp-rsvp-row">
            <span>RESTRICCIÓN ALIMENTARIA</span>
            <span>{guestRestrictions || dietary || "—"}</span>
          </div>
        )}

        {hasPayment && paymentAmount != null && !isExempt && (
          <div className="acp-rsvp-row acp-rsvp-row--payment">
            <span>VALOR</span>
            <div className="acp-rsvp-payment-value">
              <span className="acp-rsvp-payment-total">{formatARS(totalPayment)}</span>
              {(adultCount > 0 || teenCount > 0 || childCount > 0) && (
                <div className="acp-rsvp-payment-detail">
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

      <div ref={stubRef} className="acp-stub">
        <div className="acp-stub-top">
          <span>PASE Nº {passNumber}</span>
          <span ref={statusRef} className="acp-stub-status">
            {confirmed ? "ACCESO CONFIRMADO" : "PENDIENTE"}
          </span>
        </div>
        <div ref={sealRef} className="acp-seal">
          <AcpMedallion sub="" arcId="" arcText="" spin="none" compact />
        </div>
        <div ref={beamRef} className="acp-beam" />
        <div className="acp-barcode" style={{ width: "70%", opacity: confirmed ? 0.7 : 0.2 }} />
      </div>

      {error && <p className="acp-rsvp-error">{error}</p>}

      {status !== "CONFIRMED" ? (
        <>
          <button type="button" className="acp-rsvp-btn" disabled={isSubmitting} onClick={() => submit("CONFIRMA")}>
            {isSubmitting ? "GUARDANDO…" : "CONFIRMAR ASISTENCIA"}
          </button>
          <button type="button" className="acp-rsvp-btn acp-rsvp-btn--ghost" disabled={isSubmitting} onClick={() => submit("NO_ASISTE")}>
            NO VOY A PODER ASISTIR
          </button>
        </>
      ) : (
        <button type="button" className="acp-rsvp-btn acp-rsvp-btn--ghost" onClick={() => setStatus("PENDING")}>
          MODIFICAR ASISTENCIA
        </button>
      )}
    </>
  );
}

interface AcpSongItem {
  id: string;
  title: string;
  artist: string;
  guestName: string;
}

// Misma API que <SongSuggestion> (/api/songs), look propio de la plantilla.
function AcpSongSuggestion({ invitationId, guestToken, guestName }: { invitationId: string; guestToken?: string; guestName: string }) {
  const [songs, setSongs] = useState<AcpSongItem[]>([]);
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
    <div className="acp-song">
      <form onSubmit={handleSubmit} className="acp-song-row">
        <div className="acp-song-inputs">
          <input value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="ARTISTA" maxLength={80} className="acp-song-input" />
          <span className="acp-song-sep">—</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="TEMA" maxLength={100} className="acp-song-input" />
        </div>
        <button type="submit" disabled={isSubmitting} className="acp-song-submit">+ {isSubmitting ? "..." : "SUMAR"}</button>
      </form>
      {error && <p className="acp-song-error">{error}</p>}
      {songs.length > 0 && (
        <div className="acp-song-list">
          {songs.slice(0, 12).map((s, i) => (
            <div key={s.id} className="acp-song-item">
              <span className="acp-song-item-title">{String(i + 1).padStart(2, "0")} · {s.artist} — {s.title}</span>
              <span className="acp-song-item-by">Sumado por {s.guestName || "Invitado"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Todas las preguntas se muestran juntas en la misma página -- misma API
// /api/quiz que usa el resto de las plantillas.
function AcpQuiz({ preguntas, invitationId, guestToken, guestName }: { preguntas: AcpQuizQuestion[]; invitationId: string; guestToken?: string; guestName?: string }) {
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
    <div className="acp-quiz">
      {preguntas.map((q, qi) => {
        const correctIdx = q.respuestaCorrecta ?? q.correcta;
        return (
          <div key={qi} className="acp-quiz-q">
            <span className="acp-quiz-q-num">{String(qi + 1).padStart(2, "0")}</span>
            <p className="acp-quiz-q-text">{q.pregunta}</p>
            <div className="acp-quiz-opts">
              {q.opciones.map((opt, oi) => {
                const chosen = picks[qi] === oi;
                const revealed = picks[qi] !== undefined && correctIdx !== undefined;
                let stateClass = "";
                if (revealed) {
                  if (oi === correctIdx) stateClass = " acp-quiz-opt--correct";
                  else if (chosen) stateClass = " acp-quiz-opt--wrong";
                } else if (chosen) {
                  stateClass = " acp-quiz-opt--picked";
                }
                return (
                  <button
                    key={oi}
                    type="button"
                    className={`acp-quiz-opt${stateClass}`}
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
        <div className="acp-quiz-result">
          <p className="acp-quiz-result-score">
            {isSaving ? "GUARDANDO…" : `RESPONDISTE ${score} DE ${preguntas.length} CORRECTAMENTE`}
          </p>
          {!isSaving && stats && stats.count > 0 && (
            <p className="acp-quiz-result-stat">
              El promedio del resto de los invitados ({stats.count}) es del {stats.avg}%.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function AcpInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="acp-bank-row">
      <div style={{ minWidth: 0, flex: 1 }}>
        <span className="acp-bank-row-label">{label}</span>
        <span className="acp-bank-row-value">{value}</span>
      </div>
    </div>
  );
}

function AcpCoverHalf({
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
    <div className="acp-cover-inner">
      {photoMobile && (
        <div className="acp-mobile-only">
          <AnimatedCoverPhoto
            photoSrc={photoMobile}
            tint
            tintColor1="#FF3355"
            tintColor2="#14090B"
            effect="enfoque"
            scrimColorRgb="20,9,11"
          />
        </div>
      )}
      {photoDesktop && (
        <div className="acp-desktop-only">
          <AnimatedCoverPhoto
            photoSrc={photoDesktop}
            tint
            tintColor1="#FF3355"
            tintColor2="#14090B"
            effect="enfoque"
            scrimColorRgb="20,9,11"
          />
        </div>
      )}
      <div className="acp-cover-glow" />
      <div className="acp-cover-spots" />
      <div className="acp-cover-content">
        <div className="acp-cover-top-row">
          <span>PASE Nº {passNumber}</span><span className="acp-accent-serif-2">ADMIT ONE</span>
        </div>
        <div className="acp-cover-center">
          <span ref={kickerRef} className="acp-cover-kicker">{kickerText}</span>
          <h1 ref={namesRef} className="acp-cover-names">{namesTitle}</h1>
          <span className="acp-cover-rule" />
          <span className="acp-cover-date">{fechaCorta}</span>
        </div>
        <div className="acp-cover-bottom">
          <div ref={perfRef} className="acp-perf-strip acp-perf-strip--reveal acp-perf-strip--cover" />
          <div className="acp-cover-facts">
            {dressCode && <span>{dressCode.toUpperCase()}</span>}
            <span>{hora} H</span>
          </div>
          {children}
          <div className="acp-barcode-wrap">
            <div className="acp-barcode" style={{ width: "62%", height: "clamp(15px, 3vh, 26px)", opacity: 0.6 }} />
            <span className="acp-mini-label acp-mini-label--cover" style={{ color: "#56534A" }}>NO TRANSFERIBLE</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Hoja de estilos (traslada 1:1 los tokens visuales del diseño aprobado)
// ---------------------------------------------------------------------
const ACP_CSS = `
  .acp-scroller { position: absolute; inset: 0; overflow-y: auto; overflow-x: hidden; opacity: 0; transition: opacity 900ms ease 260ms; scrollbar-width: none; }
  .acp-scroller::-webkit-scrollbar { width: 0; height: 0; }

  a { color: #FF3355; text-decoration: none; }
  a:hover { color: #FFE94D; }

  @keyframes gpFoil { to { transform: rotate(360deg); } }
  @keyframes gpRing { to { transform: rotate(360deg); } }
  @keyframes gpRingRev { to { transform: rotate(-360deg); } }
  @keyframes gpScan { 0% { transform: translateY(0); opacity: 0; } 12% { opacity: .85; } 88% { opacity: .85; } 100% { transform: translateY(320px); opacity: 0; } }
  @keyframes gpEq { 0%,100% { transform: scaleY(.25); } 50% { transform: scaleY(1); } }
  @keyframes gpHint { 0%,100% { transform: translateY(0); } 50% { transform: translateY(7px); } }
  @keyframes gpSide { 0%,100% { transform: translateX(0); } 50% { transform: translateX(7px); } }
  @media (prefers-reduced-motion: reduce) { .acp-scroller * { animation: none !important; } }

  .acp-section { min-height: calc(var(--vh, 1vh) * 100); position: relative; display: flex; flex-direction: column; justify-content: center; gap: 30px; padding: 96px max(30px, calc((100% - 560px) / 2)) 110px max(24px, calc((100% - 560px) / 2)); overflow: hidden; }

  /* Foto principal (ver GuestPassVipTemplate.tsx). Mobile: la foto ocupa
     toda la seccion, borde a borde. Desktop: se enmarca con un borde
     propio de la familia en vez de estirarse. */
  .acp-hero-photo-section { min-height: calc(var(--vh, 1vh) * 100); position: relative; overflow: hidden; background: #14090B; }
  .acp-hero-photo-frame { position: absolute; inset: 0; overflow: hidden; }
  .acp-hero-photo-kicker { position: absolute; left: 0; right: 0; bottom: 0; z-index: 2; padding: 0 max(24px, calc((100% - 560px) / 2)) 48px; }
  @media (max-width: 767px) {
    .acp-hero-photo-section--no-mobile { min-height: 0; height: 0; }
  }
  @media (min-width: 768px) {
    .acp-hero-photo-frame { inset: 64px max(24px, calc((100% - 900px) / 2)); border: 1px solid rgba(255,51,85,.3); }
    .acp-hero-photo-kicker { bottom: 40px; }
    .acp-hero-photo-section--no-desktop { min-height: 0; height: 0; }
  }
  .acp-section--between { justify-content: space-between; }

  .acp-kicker { font-size: 9.5px; letter-spacing: 0.34em; color: #8A8577; }

  .acp-date-stack { display: flex; flex-direction: column; gap: 2px; }
  .acp-date-num { font-family: var(--acp-poppins), sans-serif; font-size: clamp(66px, 23vw, 140px); line-height: 0.82; letter-spacing: -0.04em; }
  .acp-date-num--right { text-align: right; line-height: 0.86; }
  .acp-date-month { font-family: var(--acp-poppins), sans-serif; font-style: italic; font-size: clamp(50px, 18vw, 104px); line-height: 0.9; color: #FF3355; padding-left: 12%; }

  .acp-divider { display: flex; align-items: center; gap: 16px; font-size: 10px; letter-spacing: 0.26em; color: #8A8577; }
  .acp-divider-line { width: 52px; height: 1px; background: #FF3355; display: inline-block; }
  .acp-divider-line--long { width: 64px; }

  .acp-lead { margin: 0; font-family: var(--acp-poppins), sans-serif; font-style: italic; font-size: 20px; line-height: 1.4; color: #A8A292; max-width: 330px; }
  .acp-cal-link { display: inline-flex; align-items: center; gap: 7px; margin-top: 4px; font-family: var(--acp-mono), monospace; font-size: 10px; letter-spacing: 0.24em; text-transform: uppercase; color: #8A8577; text-decoration: none; transition: color 200ms ease; }
  .acp-cal-link:hover { color: #FF3355; }

  .acp-medallion { position: relative; }
  .acp-medallion--corner { position: absolute; right: max(32px, calc((100% - 560px) / 2)); top: 12%; width: clamp(86px, 22vw, 116px); aspect-ratio: 1; }
  .acp-medallion--lg { width: clamp(130px, 34vw, 178px); aspect-ratio: 1; margin: 0 auto; }
  .acp-medallion--final { width: clamp(104px, 26vw, 132px); aspect-ratio: 1; margin: -12px auto 0; }
  .acp-medallion-ring { position: absolute; inset: 0; border-radius: 50%; background: conic-gradient(from 0deg, #FF3355, #1FE0C8, #FF3355, #FFE94D, #FF3355); filter: saturate(.75); }
  .acp-medallion-core { position: absolute; inset: 3px; border-radius: 50%; background: #14080A; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; text-align: center; padding: 6px; }
  .acp-medallion-num { font-family: var(--acp-poppins), sans-serif; font-size: 26px; line-height: 1; color: #FFE94D; }
  .acp-medallion-num-sm { font-family: var(--acp-poppins), sans-serif; font-size: 16px; line-height: 1; color: #FFE94D; }
  .acp-medallion-sub { font-size: 6.5px; letter-spacing: 0.24em; color: #8A8577; }
  .acp-medallion-arc { position: absolute; inset: -14%; }
  .acp-medallion-arc-text { font-size: 7px; letter-spacing: 1.6px; fill: #FF3355; font-family: var(--acp-mono), monospace; }

  .acp-scan-grid { position: absolute; inset: 0; background: repeating-linear-gradient(0deg, rgba(200,164,92,0.06) 0 1px, transparent 1px 5px); pointer-events: none; }
  .acp-scanline { position: absolute; left: 0; right: 0; top: 30%; height: 2px; background: linear-gradient(90deg, transparent, #FFE94D, transparent); animation: gpScan 6s linear infinite; pointer-events: none; }

  .acp-cd-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; position: relative; }
  .acp-cd-box { border: 1px solid rgba(255,255,255,.24); border-radius: 14px; background: rgba(255,255,255,.06); backdrop-filter: blur(4px); padding: 18px 15px; display: flex; flex-direction: column; gap: 6px; overflow: hidden; }
  .acp-cd-num { font-family: var(--acp-poppins), sans-serif; font-size: clamp(48px, 14vw, 80px); line-height: 0.82; color: #F6EFDD; display: inline-block; }
  .acp-cd-label { font-size: 9px; letter-spacing: 0.3em; color: #FF3355; }
  .acp-perf-strip { height: 12px; position: relative; background: radial-gradient(circle at 6px 50%, #14090B 3.4px, transparent 3.8px) 0 0/12px 12px repeat-x; opacity: .85; }
  .acp-perf-strip--reveal { clip-path: inset(0 100% 0 0); transition: clip-path 900ms cubic-bezier(.16,1,.3,1) 500ms; }
  .acp-perf-strip--cover { opacity: .9; }

  .acp-glow-blob { position: absolute; right: -26%; top: 4%; width: 82vw; max-width: 540px; aspect-ratio: 1; border-radius: 50%; background: conic-gradient(from 200deg, rgba(255,51,85,0.32), rgba(31,224,200,0.26), rgba(255,233,77,0.34), rgba(255,51,85,0.32)); filter: blur(80px); opacity: .4; animation: gpFoil 30s linear infinite; }
  .acp-phrase { margin: 0; position: relative; font-family: var(--acp-poppins), sans-serif; font-weight: 400; font-size: clamp(50px, 15vw, 96px); line-height: 0.92; letter-spacing: -0.03em; }
  .acp-accent-italic { font-style: italic; }
  .acp-accent-serif { font-style: italic; color: #1FE0C8; font-family: var(--acp-poppins), sans-serif; }
  .acp-accent-serif-2 { color: #1FE0C8; }
  .acp-h2 { margin: 0; font-family: var(--acp-poppins), sans-serif; font-weight: 400; font-size: clamp(40px, 12vw, 68px); line-height: 0.96; }

  .acp-pan { height: 260vh; position: relative; }
  .acp-pan-sticky { position: sticky; top: 0; height: calc(var(--vh, 1vh) * 100); overflow: hidden; }
  .acp-strip { position: absolute; top: 0; left: 0; height: 100%; display: flex; width: 300vw; will-change: transform; }
  .acp-panel { flex: 0 0 100vw; min-width: 0; height: 100%; box-sizing: border-box; position: relative; overflow: hidden; display: flex; flex-direction: column; padding: 84px max(24px, calc((100vw - 560px) / 2)) 100px; gap: 22px; }
  .acp-panel--between { justify-content: space-between; }
  .acp-panel--end { justify-content: flex-end; }
  .acp-panel--center { align-items: center; justify-content: center; text-align: center; }
  .acp-panel--gap { gap: clamp(14px, 2.4vh, 22px); padding: clamp(52px, 9vh, 84px) max(24px, calc((100vw - 600px) / 2)) clamp(62px, 11vh, 100px); }
  .acp-hair-bg { position: absolute; inset: 0; background: repeating-linear-gradient(90deg, rgba(20,20,27,0.05) 0 1px, transparent 1px 26px); pointer-events: none; }
  .acp-panel-top { position: relative; display: flex; justify-content: space-between; font-size: 9.5px; letter-spacing: 0.32em; color: #7C7768; }
  .acp-panel-title { margin: 0; position: relative; font-family: var(--acp-poppins), sans-serif; font-weight: 400; font-size: clamp(46px, 13.5vw, 76px); line-height: 0.92; }
  .acp-panel-title-md { margin: 0; position: relative; font-family: var(--acp-poppins), sans-serif; font-weight: 400; font-size: clamp(42px, 12.5vw, 64px); line-height: 0.94; }
  .acp-panel-title-sm { margin: 0; font-family: var(--acp-poppins), sans-serif; font-size: clamp(34px, 10vw, 52px); line-height: 1; }
  .acp-panel-block { position: relative; display: flex; flex-direction: column; gap: 12px; }
  .acp-mini-label { font-size: 9px; letter-spacing: 0.26em; color: #7C7768; }
  .acp-mini-label--cover { font-size: 8.5px; letter-spacing: 0.3em; }
  .acp-facts { position: relative; display: flex; flex-direction: column; gap: 12px; font-size: 11px; letter-spacing: 0.14em; color: #4A473F; }
  .acp-facts-row { display: flex; justify-content: space-between; border-bottom: 1px solid #D6D1C4; padding-bottom: 10px; }
  .acp-facts-row--last { border-bottom: none; padding-bottom: 0; }
  .acp-seguir { position: relative; display: flex; align-items: center; gap: 10px; font-size: 9px; letter-spacing: 0.26em; color: #1FE0C8; margin-top: auto; }
  .acp-seguir--split { justify-content: space-between; }
  .acp-side-hint { display: inline-block; animation: gpSide 2.2s ease-in-out infinite; }
  .acp-route-svg { position: absolute; inset: 0; width: 100%; height: 100%; }
  .acp-link-cta { font-size: 10px; letter-spacing: 0.24em; color: #1FE0C8; }

  .acp-crono { position: relative; display: flex; flex-direction: column; gap: 8px; margin-top: 4px; }
  .acp-crono-row { display: flex; align-items: baseline; gap: 14px; font-size: 11px; letter-spacing: 0.1em; color: #4A473F; border-bottom: 1px solid #D6D1C4; padding-bottom: 8px; }
  .acp-crono-time { font-family: var(--acp-mono), monospace; color: #1FE0C8; min-width: 42px; }
  .acp-crono-title { flex: 1; }

  .acp-dots { position: absolute; left: 0; right: 34px; bottom: 26px; display: flex; gap: 6px; justify-content: center; z-index: 2; }
  .acp-dot { width: 22px; height: 2px; background: rgba(20,20,27,0.18); transition: background 400ms ease; display: inline-block; }

  .acp-stub { position: relative; overflow: hidden; border: 1px solid #2A2417; background: rgba(20,20,27,0.7); padding: 20px; display: flex; flex-direction: column; gap: 16px; transition: border-color 600ms ease, box-shadow 600ms ease; }
  .acp-stub-top { display: flex; justify-content: space-between; font-size: 9px; letter-spacing: 0.24em; color: #8A8577; }
  .acp-stub-status { color: #6E6A5D; transition: color 400ms ease; }
  .acp-seal { width: 62px; aspect-ratio: 1; position: relative; opacity: .25; transform: scale(.86); transition: opacity 700ms ease, transform 700ms cubic-bezier(.16,1,.3,1); align-self: center; }
  .acp-beam { position: absolute; left: 0; right: 0; top: 0; height: 2px; background: linear-gradient(90deg, transparent, #FFE94D, transparent); opacity: 0; transition: transform 900ms cubic-bezier(.16,1,.3,1), opacity 300ms ease; }

  .acp-rsvp { display: flex; flex-direction: column; gap: 22px; width: 100%; max-width: 420px; font-family: var(--acp-mono), monospace; }
  .acp-rsvp-rows { display: flex; flex-direction: column; }
  .acp-rsvp-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 0; border-bottom: 1px solid #2A2A33; font-size: 10.5px; letter-spacing: 0.18em; color: #6E6A5D; }
  .acp-rsvp-row > span:first-child { flex-shrink: 0; }
  .acp-rsvp-row > span:last-child { color: #F4F1EA; letter-spacing: 0.02em; text-align: right; }
  .acp-rsvp-row--payment { align-items: flex-start; }
  .acp-rsvp-payment-value { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
  .acp-rsvp-payment-total { color: #FFE94D; font-size: 13px; letter-spacing: 0.02em; font-weight: 600; }
  .acp-rsvp-payment-detail { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; font-size: 9px; letter-spacing: 0.05em; color: #8A8577; }
  .acp-rsvp-stepper { display: flex; align-items: center; gap: 12px; }
  .acp-rsvp-stepper button { width: 26px; height: 26px; border-radius: 50%; border: 1px solid #FF3355; background: transparent; color: #FF3355; font-size: 14px; line-height: 1; cursor: pointer; }
  .acp-rsvp-stepper button:disabled { opacity: 0.3; cursor: default; }
  .acp-rsvp-stepper span { font-family: var(--acp-mono), monospace; color: #F4F1EA; min-width: 20px; text-align: center; }
  .acp-rsvp-input { background: transparent; border: none; border-bottom: 1px solid rgba(255,51,85,0.3); color: #F4F1EA; font-family: var(--acp-mono), monospace; font-size: 11px; letter-spacing: 0.02em; padding: 4px 2px; text-align: right; max-width: 55%; }
  .acp-rsvp-input::placeholder { color: #6E6A5D; }
  .acp-rsvp-input:focus { outline: none; border-bottom-color: #FF3355; }
  .acp-rsvp-btn { width: 100%; padding: 16px; font-family: var(--acp-mono), monospace; font-size: 11px; font-weight: 600; letter-spacing: 0.22em; text-transform: uppercase; background: linear-gradient(100deg, rgba(200,164,92,0.08), rgba(232,214,168,0.2), rgba(200,164,92,0.08)); border: 1px solid #FF3355; color: #F6EFDD; cursor: pointer; }
  .acp-rsvp-btn:hover:not(:disabled) { background: linear-gradient(100deg, rgba(232,214,168,0.34), rgba(246,239,221,0.5), rgba(232,214,168,0.34)); color: #130709; }
  .acp-rsvp-btn:disabled { opacity: 0.6; cursor: default; }
  .acp-rsvp-btn--ghost { background: transparent; color: #FF3355; }
  .acp-rsvp-btn--ghost:hover:not(:disabled) { background: rgba(255,51,85,0.1); color: #FF3355; }
  .acp-rsvp-error { font-size: 10px; letter-spacing: 0.06em; color: #FF3355; margin: 0; }
  .acp-rsvp-declined { display: flex; flex-direction: column; gap: 18px; align-items: center; text-align: center; max-width: 380px; }
  .acp-rsvp-declined-text { margin: 0; font-family: var(--acp-poppins), sans-serif; font-style: italic; font-size: 18px; line-height: 1.4; color: #A8A292; }

  .acp-upload-wrap { flex: 1; min-height: 0; overflow-y: auto; }
  .acp-album-embed { flex: 1; min-height: 0; overflow-y: auto; }
  .acp-live-placeholder { flex: 1; display: flex; align-items: center; justify-content: center; text-align: center; padding: 24px; border: 1px dashed rgba(20,20,27,0.2); }
  .acp-photo-placeholder { position: relative; font-size: 8.5px; letter-spacing: 0.16em; color: #6E6A5D; }

  .acp-mosaic { position: relative; flex: 1; min-height: 0; display: grid; grid-template-columns: repeat(3, 1fr); grid-auto-rows: auto; grid-auto-flow: dense; align-content: start; gap: 10px; }
  .acp-mosaic-cell--featured { grid-column: span 2; grid-row: span 2; cursor: pointer; }
  .acp-mosaic-cell { position: relative; height: 0; padding-top: 100%; background: repeating-linear-gradient(135deg, #DCD7CB 0 6px, #E9E5DC 6px 12px); overflow: hidden; cursor: pointer; }
  .acp-mosaic-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }

  .acp-bank-wrap { position: relative; display: flex; flex-direction: column; gap: 14px; width: 100%; max-width: 420px; margin: 0; }
  .acp-bank-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid #2A2A33; }
  .acp-bank-row:last-child { border-bottom: none; }
  .acp-bank-row-label { display: block; font-size: 9px; letter-spacing: 0.2em; color: #8A8577; margin-bottom: 3px; }
  .acp-bank-row-value { font-size: 12px; color: #F4F1EA; word-break: break-all; }
  .acp-bank-copy { flex-shrink: 0; font-family: var(--acp-mono), monospace; font-size: 10px; letter-spacing: 0.1em; padding: 7px 12px; border: 1px solid #FF3355; background: transparent; color: #FF3355; cursor: pointer; }
  .acp-bank-copy:hover { background: rgba(255,51,85,0.12); }

  .acp-eq { display: flex; align-items: flex-end; gap: 5px; height: 52px; }
  .acp-eq-bar { width: 4px; height: 100%; transform-origin: bottom; animation: gpEq 1.1s ease-in-out infinite; display: inline-block; }
  .acp-song-wrap { font-family: var(--acp-mono), monospace; }

  .acp-song { position: relative; width: 100%; max-width: 420px; margin: 0 auto; }
  .acp-song-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; border-bottom: 1px solid #2A2A33; padding-bottom: 12px; }
  .acp-song-inputs { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; font-size: 10px; letter-spacing: 0.24em; color: #8A8577; text-transform: uppercase; }
  .acp-song-input { background: transparent; border: none; border-bottom: 1px solid rgba(255,51,85,0.3); color: #F4F1EA; font-family: var(--acp-mono), monospace; font-size: 12px; padding: 6px 2px; min-width: 0; flex: 1; }
  .acp-song-input::placeholder { color: #6E6A5D; }
  .acp-song-input:focus { outline: none; border-bottom-color: #FF3355; }
  .acp-song-sep { color: #8A8577; flex-shrink: 0; }
  .acp-song-submit { flex-shrink: 0; background: none; border: none; color: #FF3355; font-family: var(--acp-mono), monospace; font-size: 10px; letter-spacing: 0.2em; cursor: pointer; }
  .acp-song-submit:hover { color: #FFE94D; }
  .acp-song-submit:disabled { color: #6E6A5D; cursor: default; }
  .acp-song-error { font-size: 10px; color: #FF3355; margin-top: 6px; }
  .acp-song-list { display: flex; flex-direction: column; margin-top: 14px; max-height: 180px; overflow-y: auto; }
  .acp-song-item { display: flex; flex-direction: column; gap: 3px; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06); font-family: var(--acp-mono), monospace; }
  .acp-song-item-title { font-size: 11.5px; letter-spacing: 0.04em; color: #F4F1EA; }
  .acp-song-item-by { font-size: 9.5px; letter-spacing: 0.1em; color: #6E6A5D; }

  .acp-quiz { display: flex; flex-direction: column; gap: 28px; width: 100%; max-width: 460px; }
  .acp-quiz-q { display: flex; flex-direction: column; gap: 14px; }
  .acp-quiz-q-num { font-family: var(--acp-mono), monospace; font-size: 10px; letter-spacing: 0.24em; color: #8A8577; }
  .acp-quiz-q-text { margin: 0; font-family: var(--acp-poppins), sans-serif; font-size: clamp(18px, 4vw, 22px); line-height: 1.3; color: #F4F1EA; }
  .acp-quiz-opts { display: flex; flex-wrap: wrap; gap: 10px; }
  .acp-quiz-opt { font-family: var(--acp-mono), monospace; font-size: 11px; letter-spacing: 0.06em; padding: 10px 16px; border: 1px solid rgba(255,51,85,0.4); background: transparent; color: #FF3355; cursor: pointer; transition: background 160ms ease, color 160ms ease, border-color 160ms ease; }
  .acp-quiz-opt:disabled { cursor: default; }
  .acp-quiz-opt--picked { background: #FF3355; border-color: #FF3355; color: #130709; }
  .acp-quiz-opt--correct { background: #FFE94D; border-color: #FFE94D; color: #130709; }
  .acp-quiz-opt--wrong { border-color: #8A6A6A; color: #C99; opacity: 0.6; }
  .acp-quiz-result { padding-top: 18px; border-top: 1px solid #2A2A33; }
  .acp-quiz-result-score { margin: 0 0 6px; font-family: var(--acp-mono), monospace; font-size: 11px; letter-spacing: 0.16em; color: #FFE94D; }
  .acp-quiz-result-stat { margin: 0; font-size: 11.5px; line-height: 1.5; color: #A8A292; }

  .acp-final-card { border: 1px solid #FF3355; padding: 30px 24px; display: flex; flex-direction: column; gap: 22px; align-items: center; text-align: center; position: relative; }
  .acp-final-names { font-family: var(--acp-poppins), sans-serif; font-size: clamp(34px, 10vw, 46px); line-height: .9; color: #FFFFFF; }
  .acp-barcode { height: 26px; background: repeating-linear-gradient(90deg, #6E6A5D 0 2px, transparent 2px 4px, #6E6A5D 4px 5px, transparent 5px 9px, #6E6A5D 9px 11px, transparent 11px 14px); }
  .acp-final-footer { display: flex; justify-content: space-between; align-items: center; font-size: 9px; letter-spacing: 0.24em; color: #56534A; }
  .acp-replay { cursor: pointer; color: #FF3355; }
  .acp-footer-credit { display: flex; justify-content: center; padding-top: 8px; opacity: 0.7; }

  .acp-rail { position: absolute; right: 0; top: 0; bottom: 0; width: 34px; z-index: 4; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 20px 0; opacity: 0; transition: opacity 700ms ease; pointer-events: none; border-left: 1px solid rgba(200,164,92,0.14); }
  .acp-rail-top { writing-mode: vertical-rl; font-size: 8px; letter-spacing: 0.34em; color: #8A8577; transition: color 500ms ease; }
  .acp-rail-line { flex: 1; width: 1px; margin: 16px 0; background: rgba(200,164,92,0.16); position: relative; }
  .acp-rail-bar { position: absolute; left: -1px; top: 0; width: 3px; height: 0%; background: linear-gradient(#FFE94D, #FF3355); transition: height 260ms linear; display: block; }
  .acp-rail-label { writing-mode: vertical-rl; font-size: 8px; letter-spacing: 0.34em; color: #FF3355; transition: color 500ms ease; }

  .acp-cover { position: absolute; inset: 0; z-index: 5; }
  .acp-cover-half { position: absolute; left: 0; right: 0; height: 50%; overflow: hidden; transition: transform 1100ms cubic-bezier(.7,0,.2,1); }
  .acp-cover-half--top { top: 0; }
  .acp-cover-half--bottom { bottom: 0; }
  .acp-cover-inner { position: absolute; left: 0; right: 0; top: 0; height: 200%; overflow: hidden; background: radial-gradient(120% 70% at 50% 8%, #230B10 0%, #1D0B0F 46%, #14090B 100%); }
  .acp-cover-half--bottom .acp-cover-inner { top: auto; bottom: 0; }
  .acp-cover-glow { position: absolute; left: 50%; top: 6%; width: 190%; aspect-ratio: 1; transform: translate(-50%, -14%); border-radius: 50%; background: conic-gradient(from 200deg, rgba(255,51,85,0.5), rgba(31,224,200,0.4), rgba(255,233,77,0.5), rgba(255,51,85,0.5)); filter: blur(64px); opacity: .62; animation: gpFoil 26s linear infinite; }
  /* Manchas de luz suaves (ver mockup original) -- propias de Acrylic Pop:
     tres focos de color difusos, sin destellos ni sunburst de otras
     plantillas de la colección. */
  .acp-cover-spots { position: absolute; inset: 0; background-image: radial-gradient(circle at 20% 20%, rgba(255,51,85,.25), transparent 40%), radial-gradient(circle at 80% 70%, rgba(31,224,200,.22), transparent 40%), radial-gradient(circle at 50% 90%, rgba(255,233,77,.18), transparent 35%); }
  .acp-cover-content { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: space-between; padding: 24px max(24px, calc((100% - 440px) / 2)) 26px; }
  .acp-cover-top-row { display: flex; justify-content: space-between; font-size: 9.5px; letter-spacing: 0.24em; color: #8A8577; }
  .acp-cover-center { display: flex; flex-direction: column; align-items: center; gap: clamp(10px, 2.2vh, 22px); text-align: center; }
  .acp-cover-kicker { font-size: 9.5px; letter-spacing: 0.34em; color: #8A8577; }
  .acp-cover-names { margin: 0; font-family: var(--acp-poppins), sans-serif; font-weight: 400; font-size: min(clamp(48px, 16vw, 96px), 12.5vh); line-height: 0.86; letter-spacing: -0.02em; color: #FFFFFF; }
  .acp-cover-rule { width: 1px; height: clamp(16px, 4vh, 44px); background: linear-gradient(#FF3355, transparent); display: block; }
  .acp-cover-date { font-size: 11.5px; letter-spacing: 0.3em; color: #A8A292; white-space: nowrap; }
  .acp-cover-bottom { display: flex; flex-direction: column; gap: clamp(12px, 2.4vh, 22px); }
  .acp-cover-facts { display: flex; justify-content: space-between; font-size: 9px; letter-spacing: 0.2em; color: #6E6A5D; }
  .acp-cover-cta { border: 1px solid #FF3355; background: linear-gradient(100deg, rgba(200,164,92,0.08), rgba(232,214,168,0.2), rgba(200,164,92,0.08)); color: #F6EFDD; font-family: var(--acp-mono), monospace; font-size: 12px; letter-spacing: 0.26em; padding: clamp(13px, 2.1vh, 19px) 0; text-align: center; width: 100%; }
  .acp-cover-cta--btn { cursor: pointer; border-radius: 0; }
  @media (hover: hover) {
    .acp-cover-cta--btn:hover { background: linear-gradient(100deg, rgba(232,214,168,0.34), rgba(246,239,221,0.5), rgba(232,214,168,0.34)); color: #130709; }
  }
  .acp-barcode-wrap { display: flex; flex-direction: column; align-items: center; gap: 10px; }

  .acp-hint { position: absolute; left: 0; right: 34px; bottom: 18px; z-index: 6; text-align: center; font-size: 9px; letter-spacing: 0.28em; color: #8A8577; opacity: 0; transition: opacity 600ms ease; pointer-events: none; animation: gpHint 2.4s ease-in-out infinite; }

  .acp-lightbox { position: fixed; inset: 0; z-index: 200; background: rgba(8,8,11,0.96); display: flex; align-items: center; justify-content: center; padding: 24px; cursor: zoom-out; }
  .acp-lightbox-close { position: absolute; top: 20px; right: 20px; width: 36px; height: 36px; border-radius: 50%; border: 1px solid #FF3355; background: rgba(0,0,0,0.4); color: #F4F1EA; font-size: 18px; line-height: 1; cursor: pointer; display: flex; align-items: center; justify-content: center; }
  .acp-lightbox-img { max-width: 100%; max-height: 88vh; object-fit: contain; cursor: default; }
`;
