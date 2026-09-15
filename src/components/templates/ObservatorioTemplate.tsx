"use client";

/**
 * OBSERVATORIO · Colección Iconic — sub-colección "Tipográfica Editorial"
 * Variante: Medianoche (base).
 *
 * GENERADO por scripts/derivar-tipografica.js a partir de
 * EditorialBlancNoirTemplate.tsx — no editar a mano: la sub-colección se
 * arregla en Editorial Blanc & Noir y se vuelve a derivar; lo propio de
 * esta familia está en scripts/familias/tipografica/obs.json.
 *
 * La carta celeste: Cormorant Garamond sobre un cielo nocturno, con IBM
 * Plex Mono para las coordenadas y Jost para el texto. El acento es el
 * dorado de una constelación dibujada.
 *
 * Sin imágenes propias: son tres fuentes y CSS.
 */

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Cormorant_Garamond, Jost, IBM_Plex_Mono } from "next/font/google";
import { LogoFooterCredit } from "@/components/ui/Logo";
import { AddToCalendarLink } from "@/components/invitation/AddToCalendarLink";
import { AnimatedCoverPhoto, COVER_RESPONSIVE_STYLE } from "@/components/invitation/v2/AnimatedCoverPhoto";
import { InfoAdicionalSection } from "@/components/invitation/v2/InfoAdicionalSection";
import { useMusicPlayer, MusicToggleButton } from "@/components/invitation/MusicPlayer";
import { BurbujaPase } from "@/components/templates/BurbujaPase";
import { QrDeIngreso } from "@/components/invitation/QrDeIngreso";
import { PostEventoStorytelling, useEstadoDelEvento } from "@/components/invitation/PostEventoStorytelling";
import { useCountdown, pad } from "@/components/invitation/v2/useCountdown";
import { useTextos, useFormatoDeMoneda, tituloEnDosLineas } from "@/components/i18n/ProveedorIdioma";
import { toEmbedMapUrl } from "@/lib/google-maps";
import { esVistaMiniatura } from "@/lib/miniatura";

const obsSerif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--obs-serif",
});
const obsSans = Jost({
  subsets: ["latin"],
  weight: ["300", "400"],
  display: "swap",
  variable: "--obs-sans",
});
// El mono es la ficha técnica de la revista: folios, kickers y datos.
const obsMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  variable: "--obs-mono",
});

// ─── Paleta ─────────────────────────────────────────────────────────────────
// Las cinco variantes de "Capas de papel" cambian SOLO estos once colores
// (el script de variantes reemplaza este bloque entero, ver
// scripts/gen-capas-de-papel-variants.js). El dibujo es el mismo: los SVG de
// las escenas leen var(--pp-…), así que un cambio acá repinta cerros, cielo,
// sol y figuras de una sola vez.
const PALETA = {
  bg: "#0B1426",
  bg2: "#101C33",
  ink: "#EFE6D2",
  ink2: "#EFE6D2",
  acc: "#D4A957",
  acc2: "#7FA3C4",
  sky1: "#0B1426",
  sky2: "#101C33",
  hill1: "#101C33",
  hill2: "#EFE6D2",
  hill3: "#EFE6D2",
  night: "#EFE6D2",
  nightInk: "#0B1426",
};

/**
 * Si la variante es de fondo oscuro. De las cinco sólo lo es "Noche
 * estrellada", y se calcula de la paleta en vez de escribirse a mano para que
 * las variantes generadas por script lo hereden solas: lo leen el riel de
 * progreso y la Bienvenida compartida para saber de qué color dibujarse.
 */
const ES_OSCURA = (() => {
  const n = parseInt(PALETA.bg.slice(1), 16);
  return 0.2126 * ((n >> 16) / 255) + 0.7152 * (((n >> 8) & 255) / 255) + 0.0722 * ((n & 255) / 255) < 0.5;
})();
const TONO: "dark" | "light" = ES_OSCURA ? "dark" : "light";

/** Blanco o negro según lo oscuro que sea el color de fondo del botón. */
function tintaSobre(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const lum = 0.2126 * ((n >> 16) / 255) + 0.7152 * (((n >> 8) & 255) / 255) + 0.0722 * ((n & 255) / 255);
  return lum > 0.5 ? PALETA.bg : "#FFFFFF";
}

function safeJson<T>(val: string | null | undefined, fallback: T): T {
  if (!val) return fallback;
  try { return JSON.parse(val) as T; } catch { return fallback; }
}

interface CronoItem { time?: string; title: string }
interface QuizPregunta { pregunta: string; opciones: string[]; respuestaCorrecta?: number; correcta?: number }
type GuestStatus = "PENDING" | "CONFIRMED" | "DECLINED";

interface GuestRecord {
  id?: string;
  name?: string;
  uniqueToken?: string;
  status?: GuestStatus;
  expectedCount?: number;
  expectedAdults?: number;
  expectedTeens?: number;
  expectedChildren?: number;
  attendingAdults?: number;
  attendingTeens?: number;
  attendingChildren?: number;
  dietaryRestrictions?: string;
  orderNumber?: number;
  mesas?: string[] | null;
  isExempt?: boolean;
  paymentStatus?: string;
  paymentView?: { total: number; paid: number; pending: number; lines: string[] } | null;
}

interface ObservatorioTemplateProps {
  invitation: Record<string, unknown>;
  guest?: GuestRecord | null;
  isPersonalized?: boolean;
}

/** El número de pase, con tres cifras como en el mockup ("PASE Nº 042"). */
function numeroDePase(orderNumber: number | undefined): string {
  return String(orderNumber ?? 42).padStart(3, "0");
}

export function ObservatorioTemplate({ invitation, guest, isPersonalized = false }: ObservatorioTemplateProps) {
  const tx = useTextos();

  // ── Los datos de la invitación ─────────────────────────────────────────
  const novia = String(invitation.nombreNovia ?? "");
  const novio = String(invitation.nombreNovio ?? "");
  const quinceanera = String(invitation.nombreQuinceanera ?? "");
  const nombre1 = novia || quinceanera || String(invitation.nombreEvento ?? "");
  const nombre2 = novio;
  const titulo = nombre2 ? `${nombre1} & ${nombre2}` : nombre1;

  const fechaEvento = invitation.fechaEvento ? new Date(String(invitation.fechaEvento)) : new Date();
  const hora = String(invitation.hora ?? "19:00");
  const [hh, mm] = hora.split(":").map((n) => parseInt(n, 10) || 0);
  const fechaHora = new Date(fechaEvento);
  fechaHora.setHours(hh, mm, 0, 0);

  const diaNum = String(fechaEvento.getDate());
  const mesLargo = fechaEvento.toLocaleDateString("es-AR", { month: "long" });
  const anio = String(fechaEvento.getFullYear());
  const diaSemana = fechaEvento.toLocaleDateString("es-AR", { weekday: "long" }).toUpperCase();
  const fechaPuntos = `${String(fechaEvento.getDate()).padStart(2, "0")} · ${String(fechaEvento.getMonth() + 1).padStart(2, "0")} · ${anio}`;

  const lugarNombre = String(invitation.lugarNombre ?? "");
  const direccion = String(invitation.direccion ?? "");
  const ciudad = String(invitation.ciudad ?? "");
  const mapUrl = String(invitation.mapUrl ?? "");
  const embedMapUrl = mapUrl ? toEmbedMapUrl(mapUrl) : null;
  const dressCode = String(invitation.portadaDressCode ?? "");
  const scrollVertical = Boolean(invitation.storytellingScrollVertical);

  const ceremoniaHabilitada = Boolean(invitation.ceremoniaHabilitada);
  const ceremoniaTitulo = String(invitation.ceremoniaTitulo || tx("invitacion.ubicacion.ceremoniaCivil"));
  const ceremoniaNombre = String(invitation.ceremoniaNombre ?? "");
  const ceremoniaDireccion = String(invitation.ceremoniaDireccion ?? "");
  const ceremoniaHora = String(invitation.ceremoniaHora ?? "");

  const cronograma: CronoItem[] = safeJson<CronoItem[]>(String(invitation.cronogramaEventos ?? ""), []);
  const hayComoLlegar = Boolean(mapUrl);

  // Los paneles de "Cuándo y dónde" se arman con lo que el anfitrión cargó:
  // sin ceremonia aparte, sin link de mapa o sin cronograma, ese panel no
  // existe -- y la numeración (01 / 03) se calcula sobre los que quedan, para
  // que nunca diga "01 / 04" cuando hay tres.
  const panelesLugar = [
    "recepcion",
    ...(ceremoniaHabilitada ? ["ceremonia"] : []),
    ...(hayComoLlegar ? ["llegar"] : []),
    ...(cronograma.length > 0 ? ["cronograma"] : []),
  ];
  const totalLugar = String(panelesLugar.length).padStart(2, "0");
  const deLugar = (clave: string) => `${String(panelesLugar.indexOf(clave) + 1).padStart(2, "0")} / ${totalLugar}`;

  const galeria: string[] = safeJson<string[]>(String(invitation.galeriaPrincipalFotos ?? ""), []);
  const albumFotos = ((invitation.album as { fotos?: { url: string }[] } | null)?.fotos ?? []).map((f) => f.url);
  const todasLasFotos = Array.from(new Set([...galeria, ...albumFotos].filter(Boolean)));
  // Cinco por hoja, repartidas parejo: con seis fotos van 3+3 y no 5+1, que
  // dejaba una foto sola ocupando una hoja entera.
  const HOJA = 5;
  const cantidadHojas = Math.max(1, Math.ceil(todasLasFotos.length / HOJA));
  const porHoja = Math.ceil(todasLasFotos.length / cantidadHojas) || HOJA;
  const hojasDeFotos: string[][] = [];
  for (let i = 0; i < todasLasFotos.length; i += porHoja) hojasDeFotos.push(todasLasFotos.slice(i, i + porHoja));
  if (hojasDeFotos.length === 0) hojasDeFotos.push([]);

  const liveItems = (invitation.liveSession as { items?: { fileUrl: string; type?: string }[] } | null)?.items ?? [];
  const fotosLive = liveItems
    .filter((it) => it.fileUrl && (it.type === "PHOTO" || !it.type || /\.(jpg|jpeg|png|webp|gif)$/i.test(it.fileUrl)))
    .map((it) => it.fileUrl);

  const estadoDelEvento = useEstadoDelEvento(fechaHora);

  const rsvpHabilitado = Boolean(invitation.rsvpEnabled ?? true);
  const musicaHabilitada = Boolean(invitation.musicaHabilitada) && Boolean(invitation.musicaUrl);
  const sugerenciaMusicaHabilitada = Boolean(invitation.sugerenciaMusicaHabilitada ?? false);
  const triviaHabilitada = Boolean(invitation.triviaHabilitada);
  const triviaPreguntas: QuizPregunta[] = safeJson<QuizPregunta[]>(String(invitation.triviaPreguntas ?? ""), []);
  const quizHabilitado = triviaHabilitada && triviaPreguntas.length > 0;
  const triviaTitulo = String(invitation.triviaTitulo || tx("invitacion.quiz.cuantoSabesDeNosotros"));

  const regaloHabilitado = Boolean(invitation.regaloHabilitado);
  const pagoTarjetaHabilitado = Boolean(invitation.pagoTarjetaHabilitado);
  const hayRegalos = regaloHabilitado || pagoTarjetaHabilitado;
  const montoPago = invitation.regaloMonto ? Number(invitation.regaloMonto) : undefined;
  const pagoHabilitado = pagoTarjetaHabilitado || Boolean(montoPago);

  const hayFrase = Boolean(invitation.frasePersonalizadaHabilitada) && Boolean(invitation.frasePersonalizadaTexto);
  const frase = hayFrase ? String(invitation.frasePersonalizadaTexto) : "";
  const palabras = frase.split(/\s+/).filter(Boolean);
  // El mockup pinta en itálica y color la segunda mitad de la frase; con una
  // frase cargada por el anfitrión el corte se calcula sobre sus palabras y
  // no sobre un índice fijo pensado para la frase de ejemplo.
  const desdeAcento = Math.ceil(palabras.length / 2);

  const fotoMobile = String(invitation.portadaImagenFondo || "");
  const fotoDesktop = String(invitation.portadaImagenFondoDesktop || "");
  const hayFoto = Boolean(fotoMobile || fotoDesktop);

  const pase = numeroDePase(guest?.orderNumber);
  const nombreInvitado = guest?.name ?? "";
  const lugaresDelPase = (guest?.expectedAdults ?? guest?.expectedCount ?? 1) + (guest?.expectedTeens ?? 0) + (guest?.expectedChildren ?? 0);
  const estadoInvitado: GuestStatus = guest?.status ?? "PENDING";
  const saludaAlInvitado = Boolean(guest?.name) && invitation.mostrarNombreInvitadoEnSaludo !== false;

  // La numeración de las secciones depende de cuáles existan: sin foto de
  // portada, "Falta poco" es 02 y no 03.
  let cuenta = 0;
  const num = () => String(++cuenta).padStart(2, "0");
  const nSaveTheDate = num();
  // La foto de portada no lleva número: es una lámina, no un capítulo (en el
  // mockup tampoco lo lleva, y el riel la anuncia como parte de Save the Date).
  const nCountdown = num();
  const nFrase = hayFrase ? num() : "";
  const nCuando = num();
  const nCheckin = rsvpHabilitado ? num() : "";
  const nAlbum = todasLasFotos.length > 0 ? num() : "";
  const nMusica = sugerenciaMusicaHabilitada ? num() : "";
  const nRegalos = hayRegalos ? num() : "";
  const nQuiz = quizHabilitado ? num() : "";
  const nPase = num();

  // ── Refs del motor ─────────────────────────────────────────────────────
  const raizRef = useRef<HTMLDivElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const portadaRef = useRef<HTMLDivElement | null>(null);
  const escenaPortadaRef = useRef<HTMLDivElement | null>(null);
  const cartelRef = useRef<HTMLDivElement | null>(null);
  const rielRef = useRef<HTMLDivElement | null>(null);
  const rielTopRef = useRef<HTMLSpanElement | null>(null);
  const rielEtiquetaRef = useRef<HTMLSpanElement | null>(null);
  const rielBarraRef = useRef<HTMLSpanElement | null>(null);
  const rielLineaRef = useRef<HTMLDivElement | null>(null);
  const pistaRef = useRef<HTMLDivElement | null>(null);
  const fraseRef = useRef<HTMLHeadingElement | null>(null);
  const ventanaRef = useRef<HTMLDivElement | null>(null);
  const rutaRef = useRef<SVGPathElement | null>(null);
  const selloRef = useRef<HTMLDivElement | null>(null);
  const petalosRef = useRef<HTMLDivElement | null>(null);
  const estadoRef = useRef<HTMLSpanElement | null>(null);
  const tarjetaCheckinRef = useRef<HTMLDivElement | null>(null);

  const [confirmado, setConfirmado] = useState(estadoInvitado === "CONFIRMED");
  const [fotoAmpliada, setFotoAmpliada] = useState<string | null>(null);
  const [montado, setMontado] = useState(false);
  const [portadaAbierta, setPortadaAbierta] = useState(false);
  useEffect(() => setMontado(true), []);

  const { isPlaying: musicaSonando, togglePlay: alternarMusica, audioElement: audioDeFondo } = useMusicPlayer({
    musicaUrl: String(invitation.musicaUrl ?? ""),
    autoplay: musicaHabilitada && Boolean(invitation.musicaAutoplay ?? true),
  });

  // ── Portada: entrada y apertura ────────────────────────────────────────
  // Las capas del paisaje entran desde abajo una atrás de otra, y el cartel
  // con los nombres se endereza como si lo levantaran del piso.
  const entrada = useCallback(() => {
    const escena = escenaPortadaRef.current;
    const cartel = cartelRef.current;
    const capas = escena ? Array.from(escena.querySelectorAll<HTMLElement>("[data-cl]")) : [];
    capas.forEach((capa, i) => {
      capa.style.transition = "none";
      capa.style.opacity = "0";
      capa.style.transform = "translate3d(0,60px,0)";
      window.setTimeout(() => {
        capa.style.transition = "opacity 900ms cubic-bezier(.16,1,.3,1), transform 900ms cubic-bezier(.16,1,.3,1)";
        capa.style.opacity = "1";
        capa.style.transform = "translate3d(0,0,0)";
        // Se saca la transición al terminar: si queda puesta, el parallax del
        // mouse arrastra cada movimiento 900 ms y se siente pegajoso.
        window.setTimeout(() => { capa.style.transition = "none"; }, 950);
      }, 80 + i * 90);
    });
    // Cada renglón del nombre sube desde su propia máscara, uno atrás de
    // otro. Es el gesto de una tapa armándose, no el de un cartel que se
    // endereza.
    const renglones = cartel ? Array.from(cartel.querySelectorAll<HTMLElement>("span > span")) : [];
    renglones.forEach((linea, i) => {
      linea.style.transition = "none";
      linea.style.transform = "translate3d(0,110%,0)";
      window.setTimeout(() => {
        linea.style.transition = "transform 1000ms cubic-bezier(.16,1,.3,1)";
        linea.style.transform = "translate3d(0,0,0)";
      }, 260 + i * 130);
    });
  }, []);

  const dibujarRuta = useCallback(() => {
    const r = rutaRef.current;
    if (!r || r.dataset.listo) return;
    const largo = r.getTotalLength();
    r.style.strokeDasharray = String(largo);
    r.style.strokeDashoffset = String(largo);
    r.style.transition = "stroke-dashoffset 1600ms cubic-bezier(.16,1,.3,1)";
    r.dataset.listo = "1";
  }, []);

  const abrir = useCallback(() => {
    const escena = escenaPortadaRef.current;
    const capas = escena ? Array.from(escena.querySelectorAll<HTMLElement>("[data-cl]")).reverse() : [];
    capas.forEach((capa, i) => {
      capa.style.transition = `transform 900ms cubic-bezier(.7,0,.2,1) ${i * 70}ms, opacity 700ms ease ${i * 70 + 200}ms`;
      capa.style.transform = "translate3d(0,-110%,0)";
      capa.style.opacity = "0";
    });
    if (portadaRef.current) {
      portadaRef.current.style.transition = "opacity 700ms ease 500ms";
      portadaRef.current.style.opacity = "0";
    }
    if (scrollerRef.current) scrollerRef.current.style.opacity = "1";
    window.setTimeout(() => {
      if (pistaRef.current) pistaRef.current.style.opacity = "1";
      if (rielRef.current) rielRef.current.style.opacity = "1";
    }, 1000);
    window.setTimeout(() => {
      if (portadaRef.current) portadaRef.current.style.pointerEvents = "none";
    }, 1200);
    setPortadaAbierta(true);
    dibujarRuta();
  }, [dibujarRuta]);

  const volverAVerla = useCallback(() => {
    const escena = escenaPortadaRef.current;
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = 0;
      scrollerRef.current.style.opacity = "0";
    }
    [pistaRef.current, rielRef.current].forEach((el) => { if (el) el.style.opacity = "0"; });
    if (portadaRef.current) {
      portadaRef.current.style.pointerEvents = "auto";
      portadaRef.current.style.transition = "none";
      portadaRef.current.style.opacity = "1";
    }
    if (escena) {
      escena.querySelectorAll<HTMLElement>("[data-cl]").forEach((capa) => {
        capa.style.transition = "none";
        capa.style.opacity = "1";
        capa.style.transform = "none";
      });
    }
    setPortadaAbierta(false);
    window.setTimeout(() => entrada(), 300);
  }, [entrada]);

  // ── Confirmación: el sello y los pétalos ───────────────────────────────
  const alConfirmar = useCallback((datos: { attending: boolean }) => {
    if (!datos.attending) return;
    setConfirmado(true);
    const sello = selloRef.current;
    if (sello) {
      sello.style.transition = "transform 700ms cubic-bezier(.34,1.56,.64,1), opacity 300ms ease";
      sello.style.opacity = "1";
      sello.style.transform = "scale(1) rotate(-8deg)";
    }
    window.setTimeout(() => {
      if (estadoRef.current) {
        estadoRef.current.textContent = tx("invitacion.pase.accesoConfirmado").toUpperCase();
        estadoRef.current.style.color = PALETA.acc;
      }
      if (tarjetaCheckinRef.current) {
        tarjetaCheckinRef.current.style.boxShadow = "0 2px 0 rgba(0,0,0,.12), 0 18px 30px rgba(0,0,0,.14)";
      }
    }, 500);

    // Diez pétalos que salen del sello. Se animan con la Web Animations API y
    // se borran solos al terminar: son diez nodos que viven 1,7 segundos, no
    // diez elementos más en el árbol para siempre.
    const caja = petalosRef.current;
    if (!caja || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const NS = "http://www.w3.org/2000/svg";
    const x0 = caja.clientWidth - 60;
    const y0 = 90;
    for (let i = 0; i < 10; i++) {
      const svg = document.createElementNS(NS, "svg");
      svg.setAttribute("viewBox", "0 0 20 20");
      svg.style.cssText = `position:absolute;left:${x0}px;top:${y0}px;width:16px;height:16px;`;
      const path = document.createElementNS(NS, "path");
      path.setAttribute("d", "M10 0 C16 4 18 12 10 20 C2 12 4 4 10 0Z");
      path.setAttribute("fill", i % 3 === 0 ? PALETA.acc2 : PALETA.acc);
      svg.appendChild(path);
      caja.appendChild(svg);
      const ang = (i / 10) * Math.PI * 2 + Math.random() * 0.5;
      const dist = 90 + Math.random() * 70;
      const dx = Math.cos(ang) * dist;
      const dy = Math.sin(ang) * dist + 40;
      const giro = (Math.random() > 0.5 ? 1 : -1) * (120 + Math.random() * 120);
      const anim = svg.animate(
        [
          { transform: "translate(0,0) rotate(0deg) scale(.4)", opacity: 1 },
          { transform: `translate(${dx}px,${dy}px) rotate(${giro}deg) scale(1)`, opacity: 0 },
        ],
        { duration: 1200 + Math.random() * 500, delay: 200 + i * 40, easing: "cubic-bezier(.2,.7,.3,1)", fill: "forwards" }
      );
      anim.onfinish = () => svg.remove();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // ── El motor: reveals, paneles, parallax, riel ─────────────────────────
  // Un solo requestAnimationFrame para todo, como el resto de la colección
  // Storytelling: cada cosa que se mueve lee el scroll del mismo frame en vez
  // de suscribirse por su cuenta (y hacer layout cuatro veces por cuadro).
  useEffect(() => {
    const raiz = raizRef.current;
    if (!raiz) return;

    const menosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    entrada();

    // Reveals: entran desde abajo, sin blur -- el papel no se desenfoca.
    const reveals = menosMovimiento ? [] : Array.from(raiz.querySelectorAll<HTMLElement>("[data-xin]"));
    reveals.forEach((el) => {
      const dist = el.dataset.dist ? parseFloat(el.dataset.dist) : 24;
      el.style.opacity = "0";
      el.style.setProperty("--obs-y", `${dist}px`);
      el.style.transition = "opacity 900ms cubic-bezier(.16,1,.3,1), transform 900ms cubic-bezier(.16,1,.3,1)";
      el.style.transitionDelay = `${el.dataset.delay || 0}ms`;
    });
    const pendientes = reveals.slice();

    // La frase entra palabra por palabra, escalonada 120 ms, cuando la
    // sección llega a la pantalla (no atada al scroll: acá el gesto es de
    // renglón escrito a mano, no de barrido).
    const palabrasFrase = fraseRef.current && !menosMovimiento
      ? Array.from(fraseRef.current.querySelectorAll<HTMLElement>("[data-w]"))
      : [];
    palabrasFrase.forEach((w) => {
      w.style.display = "inline-block";
      w.style.opacity = "0";
      w.style.transform = "translate3d(0,-24px,0) rotate(3deg)";
      w.style.transformOrigin = "50% 100%";
      w.style.transition = "opacity 700ms cubic-bezier(.16,1,.3,1), transform 700ms cubic-bezier(.16,1,.3,1)";
    });
    let fraseLista = false;

    const pans = Array.from(raiz.querySelectorAll<HTMLElement>("[data-pan]"));
    const posPan: number[] = [];
    let rutaLista = false;

    // La inclinación: el mouse en escritorio, el giroscopio en el teléfono y,
    // si no hay ninguno de los dos, una oscilación lenta para que las capas
    // nunca queden completamente muertas.
    const inclinacion = { x: 0, y: 0 };
    let hayPuntero = false;
    let hayGiro = false;
    const alMover = (e: MouseEvent) => {
      if (window.innerWidth < 1024) return;
      inclinacion.x = (e.clientX / window.innerWidth - 0.5) * 20;
      inclinacion.y = (e.clientY / window.innerHeight - 0.5) * 20;
      hayPuntero = true;
    };
    const alGirar = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      hayGiro = true;
      inclinacion.x = Math.max(-6, Math.min(6, e.gamma / 5));
      inclinacion.y = Math.max(-6, Math.min(6, (e.beta - 45) / 6));
    };
    window.addEventListener("mousemove", alMover);
    window.addEventListener("deviceorientation", alGirar);

    let raf = 0;
    const cuadro = () => {
      const sc = scrollerRef.current;
      if (sc) {
        const vh = sc.clientHeight;
        const vw = sc.clientWidth;
        const y = sc.scrollTop;

        for (let i = pendientes.length - 1; i >= 0; i--) {
          const el = pendientes[i];
          if (!el.isConnected) { pendientes.splice(i, 1); continue; }
          const r = el.getBoundingClientRect();
          if (r.top < vh * 0.92 && r.bottom > 0 && r.left < window.innerWidth && r.right > 0) {
            el.style.opacity = "1";
            el.style.setProperty("--obs-y", "0px");
            pendientes.splice(i, 1);
          }
        }

        if (!fraseLista && fraseRef.current && palabrasFrase.length > 0) {
          const r = fraseRef.current.getBoundingClientRect();
          if (r.top < vh * 0.8 && r.bottom > 0) {
            fraseLista = true;
            palabrasFrase.forEach((w, i) => {
              w.style.transitionDelay = `${i * 120}ms`;
              w.style.opacity = "1";
              w.style.transform = "none";
            });
          }
        }

        pans.forEach((pan, pi) => {
          // Apilado: el recorrido lo hace el scroll de la página y el JS no
          // tiene que mover nada (ver el CSS de [data-scroll="vertical"]).
          if (pan.dataset.scroll === "vertical") return;
          const tira = pan.querySelector<HTMLElement>("[data-strip]");
          if (!tira) return;
          const n = tira.children.length;
          const largo = pan.offsetHeight - vh;
          const p = largo > 0 ? Math.min(1, Math.max(0, (y - pan.offsetTop) / largo)) : 0;
          const previo = posPan[pi];
          const suave = previo == null ? p : previo + (p - previo) * 0.14;
          posPan[pi] = Math.abs(p - suave) < 0.0004 ? p : suave;
          tira.style.transform = `translate3d(${-suave * (n - 1) * vw}px,0,0)`;
          const activo = Math.min(n - 1, Math.round(suave * (n - 1)));
          pan.querySelectorAll<HTMLElement>("[data-dot]").forEach((punto, i) => {
            punto.style.background = i === activo ? PALETA.acc : "rgba(43,42,51,.18)";
          });
        });

        if (!menosMovimiento) {
          if (!hayGiro && !hayPuntero) {
            const t = performance.now();
            inclinacion.x = Math.sin(t / 2600) * 6;
            inclinacion.y = Math.cos(t / 3300) * 4;
          }
          const tx2 = inclinacion.x;
          const ty2 = inclinacion.y;
          raiz.querySelectorAll<HTMLElement>("[data-drift], [data-depth]").forEach((el) => {
            const amt = parseFloat(el.dataset.drift || "0") || 0;
            const prof = parseFloat(el.dataset.depth || "0") || 0;
            const r = el.getBoundingClientRect();
            // Fuera de pantalla no se toca: mover capas que nadie ve es
            // trabajo puro para el compositor (y batería en el teléfono).
            if (r.bottom < -200 || r.top > vh + 200) return;
            let dy = 0;
            if (amt) dy = ((r.top + r.height / 2 - vh / 2) / vh) * amt;
            el.style.transform = `translate3d(${tx2 * prof}px,${dy + ty2 * prof}px,0)`;
          });

          // La foto se revela: los puntos de la trama que la tapan se van
          // achicando de 7,2 a 0 mientras sube, como un papel en el
          // líquido. El radio va como variable CSS para no tocar el DOM.
          const ven = ventanaRef.current;
          if (ven) {
            const r = ven.getBoundingClientRect();
            const prog = 1 - (r.top + r.height / 2) / vh;
            const t = Math.min(1, Math.max(0, (prog - 0.15) / 0.6));
            ven.style.setProperty("--obs-punto", (7.2 * (1 - t)).toFixed(2));
          }
        }

        if (rutaRef.current && rutaRef.current.dataset.listo && !rutaLista) {
          const r = rutaRef.current.getBoundingClientRect();
          if (r.left < window.innerWidth * 0.9 && r.right > 0 && r.top < vh && r.bottom > 0) {
            rutaLista = true;
            rutaRef.current.style.strokeDashoffset = "0";
            // Al terminar de dibujarse vuelve a ser una línea de puntos, que
            // es como está dibujado el camino en el mockup.
            window.setTimeout(() => {
              if (rutaRef.current) {
                rutaRef.current.style.strokeDasharray = "10 8";
                rutaRef.current.style.strokeDashoffset = "0";
              }
            }, 1650);
          }
        }

        // Riel: la barra de progreso y el nombre de la pantalla actual.
        const max = sc.scrollHeight - sc.clientHeight;
        const prog = max > 0 ? Math.min(1, sc.scrollTop / max) : 0;
        if (rielBarraRef.current) rielBarraRef.current.style.height = `${prog * 100}%`;

        const secciones = Array.from(sc.children) as HTMLElement[];
        const medio = sc.scrollTop + sc.clientHeight / 2;
        let actual = secciones[0];
        secciones.forEach((s) => { if (s.offsetTop <= medio) actual = s; });
        if (actual) {
          const etiqueta = (actual.dataset.screenLabel || "").toUpperCase();
          if (rielEtiquetaRef.current && rielEtiquetaRef.current.textContent !== etiqueta) {
            rielEtiquetaRef.current.textContent = etiqueta;
          }
          let tono = actual.dataset.tone;
          if (!tono) {
            const tira = actual.querySelector<HTMLElement>("[data-strip]");
            if (tira) {
              const idx = Math.min(
                tira.children.length - 1,
                Math.round(Math.abs(parseFloat((tira.style.transform || "").replace(/[^-\d.]/g, "")) || 0) / (vw || 1))
              );
              tono = (tira.children[idx] as HTMLElement)?.dataset.tone || "light";
            }
          }
          const oscuro = tono === "dark";
          const linea = oscuro ? "rgba(243,235,221,.18)" : "rgba(43,42,51,.14)";
          if (rielRef.current) rielRef.current.style.borderLeftColor = linea;
          if (rielLineaRef.current) rielLineaRef.current.style.background = linea;
          if (rielTopRef.current) rielTopRef.current.style.color = oscuro ? "rgba(243,235,221,.7)" : PALETA.ink2;
        }
        if (pistaRef.current && sc.scrollTop > 40) pistaRef.current.style.opacity = "0";
      }
      raf = requestAnimationFrame(cuadro);
    };
    // En la miniatura de /modelos el bucle no arranca: movería lo que está
    // detrás de una portada que ahí nunca se abre.
    if (!esVistaMiniatura()) raf = requestAnimationFrame(cuadro);

    // Gesto lateral dentro de los paneles pineados: además del scroll de
    // siempre, un arrastre claramente horizontal (o el wheel horizontal de un
    // trackpad) los mueve, y un arrastre de todo el ancho de pantalla avanza
    // exactamente un panel.
    const factorDePan = (destino: HTMLElement | null): number => {
      const pan = destino?.closest<HTMLElement>("[data-pan]");
      const sc = scrollerRef.current;
      if (!pan || !sc || sc.clientWidth <= 0 || pan.dataset.scroll === "vertical") return 0;
      const tira = pan.querySelector<HTMLElement>("[data-strip]");
      const n = tira ? tira.children.length : 1;
      if (n <= 1) return 0;
      return ((pan.offsetHeight - sc.clientHeight) / (n - 1)) / sc.clientWidth;
    };
    let x0 = 0;
    let y0 = 0;
    let lateral = false;
    let factor = 0;
    const alTocar = (e: TouchEvent) => {
      lateral = false;
      factor = 0;
      x0 = e.touches[0].clientX;
      y0 = e.touches[0].clientY;
    };
    const alArrastrar = (e: TouchEvent) => {
      const t = e.touches[0];
      const dx = x0 - t.clientX;
      const dy = y0 - t.clientY;
      if (!lateral) {
        if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy) * 1.3) return;
        // Recién acá se mira qué hay debajo del dedo AHORA (y no dónde
        // arrancó el toque): si el gesto empezó justo en el borde del panel,
        // mirar el target original dejaba el arrastre inhabilitado entero.
        factor = factorDePan(document.elementFromPoint(t.clientX, t.clientY) as HTMLElement | null);
        if (!factor) return;
        lateral = true;
      }
      e.preventDefault();
      if (scrollerRef.current) scrollerRef.current.scrollTop += dx * factor;
      x0 = t.clientX;
      y0 = t.clientY;
    };
    const alRueda = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) <= 2) return;
      const f = factorDePan(e.target as HTMLElement);
      if (!f || !scrollerRef.current) return;
      scrollerRef.current.scrollTop += e.deltaX * f;
    };
    raiz.addEventListener("touchstart", alTocar, { passive: true });
    raiz.addEventListener("touchmove", alArrastrar, { passive: false });
    raiz.addEventListener("wheel", alRueda, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", alMover);
      window.removeEventListener("deviceorientation", alGirar);
      raiz.removeEventListener("touchstart", alTocar);
      raiz.removeEventListener("touchmove", alArrastrar);
      raiz.removeEventListener("wheel", alRueda);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const varsDePaleta = {
    "--pp-bg": PALETA.bg,
    "--pp-bg2": PALETA.bg2,
    "--pp-ink": PALETA.ink,
    "--pp-ink2": PALETA.ink2,
    "--pp-acc": PALETA.acc,
    "--pp-acc2": PALETA.acc2,
    "--pp-sky1": PALETA.sky1,
    "--pp-sky2": PALETA.sky2,
    "--pp-hill1": PALETA.hill1,
    "--pp-hill2": PALETA.hill2,
    "--pp-hill3": PALETA.hill3,
    "--pp-night": PALETA.night,
    "--pp-night-ink": PALETA.nightInk,
    "--pp-btn-bg": PALETA.ink,
    "--pp-btn-fg": tintaSobre(PALETA.ink),
  } as React.CSSProperties;

  // ── Después de la fiesta ───────────────────────────────────────────────
  // La invitación deja de invitar: no tiene sentido pedir confirmación ni
  // mostrar una cuenta regresiva en cero. Lo que queda es el álbum.
  if (estadoDelEvento === "POST_EVENT" || estadoDelEvento === "EXPIRED") {
    return (
      <PostEventoStorytelling
        titulo={titulo}
        fechaEvento={fechaHora}
        fotos={fotosLive}
        paleta={{
          fondo: PALETA.bg,
          tinta: PALETA.ink,
          acento: PALETA.acc,
          clase: `${obsSerif.variable} ${obsSans.variable}`,
          fuente: "var(--obs-sans), 'Jost', sans-serif",
        }}
      />
    );
  }


  // El total de pliegos, para los folios ("03 / 10"). Se cuenta lo que esta
  // invitación realmente tiene: si no hay trivia, no existe el pliego 09 y el
  // pase deja de ser 10 de 10.
  const totalPliegos = cuenta;
  const folio = (n: string) => `${n} / ${String(totalPliegos).padStart(2, "0")}`;

  return (
    <div
      ref={raizRef}
      className={`${obsSerif.variable} ${obsSans.variable} ${obsMono.variable} obs-raiz`}
      style={varsDePaleta}
    >
      <style>{CSS_OBS}</style>
      <style>{COVER_RESPONSIVE_STYLE}</style>

      <div ref={scrollerRef} className="obs-scroller">
        {/* ── 01 Guardá la fecha ─────────────────────────────────────────
            El pliego se invierte: tinta sobre crema. La fecha ocupa la
            página izquierda en tres renglones que se cruzan, y la foto va
            enmarcada en la derecha. */}
        <section data-tone="dark" data-screen-label={tx("invitacion.saveTheDate.guardaLaFecha")} className="obs-section obs-std">
          <div className="obs-trama obs-trama--media" aria-hidden="true" />
          <div className="obs-spread">
            <div className="obs-pagina">
              <div className="obs-folio">
                <span data-xin="1" data-dist="-40">{nSaveTheDate} — {tx("invitacion.saveTheDate.guardaLaFecha").toUpperCase()}</span>
                <span data-xin="1" data-dist="40">{folio(nSaveTheDate)}</span>
              </div>
              <div className="obs-fecha">
                <span data-xin="1" data-dist="-160" className="obs-fecha-linea">{diaNum}</span>
                <span data-xin="1" data-dist="160" data-delay="120" className="obs-fecha-linea obs-fecha-linea--acc">{mesLargo.slice(0, 3)}</span>
                <span data-xin="1" data-dist="-160" data-delay="240" className="obs-fecha-linea">{anio}</span>
              </div>
              <div data-xin="1" data-delay="360" className="obs-fecha-pie">
                <span>{diaSemana} · {hora} H</span>
                <AddToCalendarLink
                  eventName={titulo}
                  targetDate={fechaHora}
                  location={[lugarNombre, direccion].filter(Boolean).join(", ")}
                  className="obs-link"
                  showIcon={false}
                >
                  {tx("invitacion.saveTheDate.agregarAlCalendario").toUpperCase()} ↗
                </AddToCalendarLink>
              </div>
            </div>

            {hayFoto && (
              <div ref={ventanaRef} data-xin="1" data-delay="200" data-dist="0" className="obs-foto">
                {fotoMobile && (
                  <div className="acp-mobile-only obs-foto-capa">
                    <AnimatedCoverPhoto photoSrc={fotoMobile} tint={false} effect="enfoque" scrimColorRgb="20,20,20" />
                  </div>
                )}
                {fotoDesktop && (
                  <div className="acp-desktop-only obs-foto-capa">
                    <AnimatedCoverPhoto photoSrc={fotoDesktop} tint={false} effect="enfoque" scrimColorRgb="20,20,20" />
                  </div>
                )}
                {/* La trama que tapa la foto y se disuelve al subir: el radio
                    del punto lo mueve el motor en --obs-punto. */}
                <span className="obs-foto-revelado" aria-hidden="true" />
                <span className="obs-foto-anio">{anio}</span>
                <span className="obs-foto-pie">{tx("invitacion.album.nuestraFoto").toUpperCase()}</span>
              </div>
            )}
          </div>
        </section>

        {/* ── 02 Falta poco ──────────────────────────────────────────────
            Dos marquesinas que corren en sentidos opuestos y, entre ellas,
            las cuatro cifras. */}
        <section data-tone={TONO} data-screen-label={tx("invitacion.cuentaRegresiva.kicker")} className="obs-section obs-countdown">
          <div className="obs-folio">
            <span data-xin="1" data-dist="-40">{nCountdown} — {tx("invitacion.cuentaRegresiva.faltan").toUpperCase()}</span>
            <span data-xin="1" data-dist="40">{folio(nCountdown)}</span>
          </div>
          <div className="obs-marquesina" aria-hidden="true">
            <div className="obs-marquesina-tira">
              {[0, 1].map((i) => (
                <span key={i}>
                  {[tx("invitacion.cuentaRegresiva.dias"), tx("invitacion.cuentaRegresiva.horas"), tx("invitacion.cuentaRegresiva.minutos"), tx("invitacion.cuentaRegresiva.segundos")].join(" · ")} · {fechaPuntos} ·&nbsp;
                </span>
              ))}
            </div>
          </div>
          <CuentaObservatorio targetDate={fechaHora} />
          <div className="obs-marquesina obs-marquesina--contraria" aria-hidden="true">
            <div className="obs-marquesina-tira">
              {[0, 1].map((i) => (
                <span key={i}>
                  {[lugarNombre, ciudad, hora ? `${hora} H` : "", dressCode].filter(Boolean).join(" · ").toUpperCase()} ·&nbsp;
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── 03 Unas palabras ───────────────────────────────────────────
            El pliego del acento: la frase entra palabra por palabra y al
            lado va el sello con la firma. */}
        {hayFrase && (
          <section data-tone="dark" data-screen-label={tx("invitacion.frase.etiqueta")} className="obs-section obs-frase-seccion">
            <div className="obs-folio">
              <span data-xin="1" data-dist="-40">{nFrase} — {tx("invitacion.frase.unasPalabras").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nFrase)}</span>
            </div>
            <div className="obs-spread">
              <h2 ref={fraseRef} className="obs-frase">
                {palabras.map((p, i) => (
                  // El espacio va fuera del span: el motor pone cada palabra
                  // en inline-block y un espacio adentro se colapsa a cero.
                  <span key={i}>
                    <span data-w="1" className={i >= desdeAcento ? "obs-acento" : undefined}>{p}</span>{" "}
                  </span>
                ))}
              </h2>
              <div data-xin="1" data-delay="900" data-dist="60" className="obs-sello">
                <span>{tx("invitacion.frase.conAmor")}</span>
              </div>
            </div>
            <div className="obs-folio obs-folio--pie">
              <span>{titulo.toUpperCase()}</span>
              <span>{fechaPuntos}</span>
            </div>
          </section>
        )}

        {/* ── 04 Cuándo y dónde ──────────────────────────────────────────
            Un pliego por lugar. Cada uno se lleva su tono: el salón sobre
            crema, la ceremonia sobre tinta y el cronograma sobre el acento. */}
        <div
          id="details"
          data-pan="1"
          data-scroll={scrollVertical || panelesLugar.length <= 1 ? "vertical" : "lateral"}
          data-screen-label={tx("invitacion.ubicacion.cuandoYDonde")}
          className="obs-pan"
          style={{ "--st-pasos": Math.max(0, panelesLugar.length - 1) } as React.CSSProperties}
        >
          <div className="obs-pan-fijo">
            <div data-strip="1" className="obs-tira">
              <div data-tone={TONO} className="obs-panel">
                <div className="obs-folio">
                  <span>{nCuando} — {tx("invitacion.ubicacion.fiestaSalon").toUpperCase()}</span><span>{deLugar("recepcion")}</span>
                </div>
                <div className="obs-spread">
                  <h2 className="obs-panel-titulo">
                    {(lugarNombre || tx("invitacion.ubicacion.elLugar")).split(" ")[0]}
                    <br /><span className="obs-acento">{(lugarNombre || "").split(" ").slice(1).join(" ") || ciudad}</span>
                  </h2>
                  <div className="obs-lineas">
                    <div className="obs-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{hora} h</span></div>
                    {direccion && <div className="obs-linea"><span>{tx("invitacion.ubicacion.direccion")}</span><span>{direccion}</span></div>}
                    {dressCode && <div className="obs-linea"><span>{tx("invitacion.ubicacion.dressCode")}</span><span>{dressCode}</span></div>}
                    {mapUrl && (
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="obs-cta">
                        {tx("invitacion.ubicacion.comoLlegar")}<span className="obs-cta-flecha">↗</span>
                      </a>
                    )}
                  </div>
                </div>
                <div className="obs-folio obs-folio--pie">
                  <span>{(ciudad || direccion).toUpperCase()}</span>
                  {!scrollVertical && panelesLugar.length > 1 && <span>{tx("invitacion.portada.segui").toUpperCase()} →</span>}
                </div>
              </div>

              {ceremoniaHabilitada && (
                <div id="ceremonia" data-tone="dark" className="obs-panel">
                  <div className="obs-folio">
                    <span>{nCuando} — {ceremoniaTitulo.toUpperCase()}</span><span>{deLugar("ceremonia")}</span>
                  </div>
                  <div className="obs-spread">
                    <h2 className="obs-panel-titulo">
                      {(ceremoniaNombre || ceremoniaTitulo).split(" ")[0]}
                      <br /><span className="obs-acento">{(ceremoniaNombre || "").split(" ").slice(1).join(" ") || ceremoniaTitulo}</span>
                    </h2>
                    <div className="obs-lineas">
                      {ceremoniaHora && <div className="obs-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{ceremoniaHora} h</span></div>}
                      {ceremoniaDireccion && <div className="obs-linea"><span>{tx("invitacion.ubicacion.direccion")}</span><span>{ceremoniaDireccion}</span></div>}
                    </div>
                  </div>
                  <div className="obs-folio obs-folio--pie">
                    <span>{tx("invitacion.ubicacion.ceremoniaCivil").toUpperCase()}</span>
                    {!scrollVertical && <span>{tx("invitacion.portada.segui").toUpperCase()} →</span>}
                  </div>
                </div>
              )}

              {hayComoLlegar && (
                <div id="location" data-tone={TONO} className="obs-panel">
                  <div className="obs-folio">
                    <span>{nCuando} — {tx("invitacion.ubicacion.comoLlegar").toUpperCase()}</span><span>{deLugar("llegar")}</span>
                  </div>
                  <div className="obs-spread">
                    <h2 className="obs-panel-titulo">
                      {tx("invitacion.ubicacion.comoLlegar")}
                    </h2>
                    <div className="obs-lineas">
                      {embedMapUrl && (
                        <div className="obs-mapa">
                          <iframe
                            src={embedMapUrl}
                            width="100%"
                            height="100%"
                            style={{ border: 0, display: "block" }}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title={tx("invitacion.ubicacion.tituloMapa", { lugar: lugarNombre })}
                          />
                        </div>
                      )}
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="obs-cta">
                        {tx("invitacion.ubicacion.abrirEnMapas")}<span className="obs-cta-flecha">↗</span>
                      </a>
                    </div>
                  </div>
                  <div className="obs-folio obs-folio--pie">
                    <span>{[direccion, ciudad].filter(Boolean).join(" · ").toUpperCase()}</span>
                    {!scrollVertical && <span>{tx("invitacion.portada.segui").toUpperCase()} →</span>}
                  </div>
                </div>
              )}

              {cronograma.length > 0 && (
                <div id="schedule" data-tone="dark" className="obs-panel obs-panel--acento">
                  <div className="obs-folio">
                    <span>{nCuando} — {tx("invitacion.ubicacion.cronograma").toUpperCase()}</span><span>{deLugar("cronograma")}</span>
                  </div>
                  <div className="obs-spread">
                    <h2 className="obs-panel-titulo">
                      {tx("invitacion.ubicacion.laNochePasoAPaso").split(",")[0]}
                      <br /><span className="obs-acento obs-acento--tinta">{tx("invitacion.ubicacion.laNochePasoAPaso").split(",").slice(1).join(",").trim()}</span>
                    </h2>
                    <div className="obs-lineas">
                      {cronograma.map((item, i) => (
                        <div key={i} className="obs-linea"><span>{item.time || ""}</span><span>{item.title}</span></div>
                      ))}
                    </div>
                  </div>
                  <div className="obs-folio obs-folio--pie">
                    <span>{fechaPuntos}</span>
                  </div>
                </div>
              )}
            </div>
            {!scrollVertical && panelesLugar.length > 1 && <Puntos cantidad={panelesLugar.length} />}
          </div>
        </div>

        {/* ── 05 Check-in ────────────────────────────────────────────────
            El cupón: papel blanco con borde grueso, línea de corte punteada
            y el estado arriba a la derecha. */}
        {rsvpHabilitado && (
          <section id="rsvp" data-tone={TONO} data-screen-label={tx("invitacion.rsvp.confirmar")} className="obs-section obs-checkin">
            <div className="obs-folio">
              <span data-xin="1" data-dist="-40">{nCheckin} — CHECK-IN</span>
              <span data-xin="1" data-dist="40">{folio(nCheckin)}</span>
            </div>
            <div className="obs-spread">
              <div className="obs-pagina">
                <h2 data-xin="1" data-dist="-80" className="obs-h2">
                  {tx("invitacion.rsvp.confirmaLinea1")}<br /><span className="obs-acento">{tx("invitacion.rsvp.confirmaLinea2")}</span>
                </h2>
              </div>
              <div className="obs-cupon">
                <span className="obs-cupon-corte" aria-hidden="true" />
                <CheckinObservatorio
                  invitationId={String(invitation.id ?? "")}
                  guestToken={guest?.uniqueToken}
                  guestName={nombreInvitado}
                  pase={pase}
                  maxAdultos={guest?.expectedAdults ?? guest?.expectedCount ?? 1}
                  maxAdolescentes={guest?.expectedTeens ?? 0}
                  maxNinos={guest?.expectedChildren ?? 0}
                  estadoInicial={estadoInvitado}
                  adultosIniciales={guest?.attendingAdults}
                  adolescentesIniciales={guest?.attendingTeens}
                  ninosIniciales={guest?.attendingChildren}
                  restricciones={guest?.dietaryRestrictions ?? ""}
                  hayPago={pagoHabilitado}
                  monto={montoPago}
                  precioNino={invitation.precioNino ? Number(invitation.precioNino) : undefined}
                  precioAdolescente={invitation.precioAdolescente ? Number(invitation.precioAdolescente) : undefined}
                  exento={guest?.isExempt ?? false}
                  estadoDePago={guest?.paymentStatus ?? "PENDING"}
                  vistaDePago={guest?.paymentView ?? null}
                  confirmado={confirmado}
                  tarjetaRef={tarjetaCheckinRef}
                  selloRef={selloRef}
                  petalosRef={petalosRef}
                  estadoRef={estadoRef}
                  alConfirmar={alConfirmar}
                />
              </div>
            </div>
          </section>
        )}

        {/* ── 06 Álbum ───────────────────────────────────────────────────
            Hoja de contactos: la grilla de seis columnas de una plancha de
            fotografía, con la tinta del acento por encima. */}
        {todasLasFotos.length > 0 && (
          <div
            id="album"
            data-pan="1"
            data-scroll={scrollVertical || hojasDeFotos.length <= 1 ? "vertical" : "lateral"}
            data-screen-label={tx("invitacion.album.titulo")}
            className="obs-pan"
            style={{ "--st-pasos": Math.max(0, hojasDeFotos.length - 1) } as React.CSSProperties}
          >
            <div className="obs-pan-fijo">
              <div data-strip="1" className="obs-tira">
                {hojasDeFotos.map((hoja, iHoja) => (
                  <div key={iHoja} data-tone={TONO} className="obs-panel obs-panel--album">
                    <div className="obs-folio">
                      <span>{nAlbum} — {tx("invitacion.album.titulo").toUpperCase()}</span>
                      <span>{tx("invitacion.album.hojaDeTotal", { n: String(iHoja + 1).padStart(2, "0"), total: String(hojasDeFotos.length).padStart(2, "0") }).toUpperCase()}</span>
                    </div>
                    {iHoja === 0 && (
                      <h2 className="obs-h2 obs-h2--album">
                        {tx("invitacion.album.titulo")} <span className="obs-acento">{tx("invitacion.album.deFotos")}</span>
                      </h2>
                    )}
                    <div className="obs-contactos" data-cantidad={hoja.length}>
                      {hoja.map((url, i) => (
                        <div
                          key={i}
                          className="obs-contacto"
                          role="button"
                          tabIndex={0}
                          onClick={() => setFotoAmpliada(url)}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setFotoAmpliada(url); }}
                          aria-label={tx("invitacion.album.ampliarFoto", { n: i + 1 })}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="" loading="lazy" className="obs-contacto-img" />
                          <span className="obs-contacto-tinta" aria-hidden="true" />
                          <span className="obs-contacto-n">{String(i + 1).padStart(2, "0")}</span>
                        </div>
                      ))}
                    </div>
                    <div className="obs-folio obs-folio--pie">
                      <span>{tx("invitacion.album.fotosSubidas", { n: todasLasFotos.length }).toUpperCase()}</span>
                      {!scrollVertical && hojasDeFotos.length > 1 && <span>{tx("invitacion.portada.segui").toUpperCase()} →</span>}
                    </div>
                  </div>
                ))}
              </div>
              {!scrollVertical && hojasDeFotos.length > 1 && <Puntos cantidad={hojasDeFotos.length} />}
            </div>
          </div>
        )}

        {/* ── 07 Música ──────────────────────────────────────────────────
            Pliego de tinta, con el ecualizador como única ilustración. */}
        {sugerenciaMusicaHabilitada && (
          <section id="songs" data-tone="dark" data-screen-label={tx("invitacion.musica.titulo")} className="obs-section obs-musica">
            <div className="obs-folio">
              <span data-xin="1" data-dist="-40">{nMusica} — {tx("invitacion.musica.titulo").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nMusica)}</span>
            </div>
            <div className="obs-spread">
              <div className="obs-pagina">
                <h2 data-xin="1" data-dist="-80" className="obs-h2">
                  {tituloEnDosLineas(tx("invitacion.sabor.preguntaCancionFaltar"), "obs-acento")}
                </h2>
                <div data-xin="1" data-delay="120" className="obs-eq" aria-hidden="true">
                  {[0, 1, 2, 3, 4, 5, 6].map((i) => <span key={i} style={{ animationDelay: `${i * 0.12}s` }} />)}
                </div>
              </div>
              <div className="obs-pagina">
                <CancionesObservatorio
                  invitationId={String(invitation.id ?? "")}
                  guestToken={guest?.uniqueToken}
                  guestName={nombreInvitado || tx("invitacion.evento.invitado")}
                />
              </div>
            </div>
          </section>
        )}

        {/* ── 08 Regalos ─────────────────────────────────────────────────
            Las tarjetas bancarias son fichas blancas con borde grueso. */}
        {hayRegalos && (
          <section id="banco" data-tone={TONO} data-screen-label={tx("invitacion.regalos.titulo")} className="obs-section obs-regalos">
            <div className="obs-folio">
              <span data-xin="1" data-dist="-40">{nRegalos} — {tx("invitacion.regalos.titulo").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nRegalos)}</span>
            </div>
            <div className="obs-spread">
              <div className="obs-pagina">
                <h2 data-xin="1" data-dist="-80" className="obs-h2">
                  {tx("invitacion.regalos.siQueresLinea1")}<br /><span className="obs-acento">{tx("invitacion.regalos.siQueresLinea2")}</span>
                </h2>
                {Boolean(invitation.regaloMensaje) && (
                  <p data-xin="1" data-delay="120" className="obs-parrafo">{String(invitation.regaloMensaje)}</p>
                )}
              </div>
              <div className="obs-pagina">
                {regaloHabilitado && (
                  <TarjetaBancaria
                    titulo={String(invitation.regaloTitulo || tx("invitacion.regalos.tituloEvento"))}
                    alias={String(invitation.regaloAlias || "")}
                    cbu={String(invitation.regaloCbu || "")}
                    banco={String(invitation.regaloBanco || "")}
                    titular={String(invitation.regaloTitular || "")}
                    retraso={180}
                  />
                )}
                {pagoTarjetaHabilitado && (
                  <TarjetaBancaria
                    titulo={String(invitation.pagoTarjetaTitulo || tx("invitacion.regalos.pagoTarjetas"))}
                    mensaje={String(invitation.pagoTarjetaMensaje || "")}
                    alias={String(invitation.pagoTarjetaAlias || "")}
                    cbu={String(invitation.pagoTarjetaCbu || "")}
                    banco={String(invitation.pagoTarjetaBanco || "")}
                    titular={String(invitation.pagoTarjetaTitular || "")}
                    retraso={260}
                  />
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── 09 Trivia ──────────────────────────────────────────────────
            El único pliego que va entero en el acento. */}
        {quizHabilitado && (
          <section id="quiz" data-tone="dark" data-screen-label="Quiz" className="obs-section obs-quiz">
            <div className="obs-folio">
              <span data-xin="1" data-dist="-40">{nQuiz} — {tx("invitacion.quiz.kicker").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nQuiz)}</span>
            </div>
            <div className="obs-spread">
              <div className="obs-pagina">
                <h2 data-xin="1" data-dist="-80" className="obs-h2">{triviaTitulo}</h2>
              </div>
              <div className="obs-pagina">
                <TriviaObservatorio
                  preguntas={triviaPreguntas}
                  invitationId={String(invitation.id ?? "")}
                  guestToken={guest?.uniqueToken}
                  guestName={nombreInvitado || tx("invitacion.evento.invitado")}
                />
              </div>
            </div>
          </section>
        )}

        {/* ── 10 Tu pase ─────────────────────────────────────────────────
            La contratapa: el QR grande a la izquierda y los datos del pase
            a la derecha, con el sello girando. */}
        <section data-tone="dark" data-screen-label={tx("invitacion.pase.tuPase")} className="obs-section obs-pase">
          <div className="obs-folio">
            <span data-xin="1" data-dist="-40">{nPase} — {tx("invitacion.pase.tuPase").toUpperCase()}</span>
            <span data-xin="1" data-dist="40">{folio(nPase)}</span>
          </div>
          <div className="obs-spread">
            <div data-xin="1" data-dist="-60" className="obs-pagina obs-pagina--qr">
              <QrDeIngreso guest={guest as never} />
            </div>
            <div className="obs-pagina">
              <div data-xin="1" data-delay="100" className="obs-pase-cabeza">
                <div className="obs-pase-numero">
                  <span className="obs-folio-etq">{tx("invitacion.pase.pase").toUpperCase()} Nº</span>
                  <span>{pase}</span>
                </div>
                <Sello texto={`${titulo} · ${fechaPuntos} · `} />
              </div>
              <div className="obs-lineas">
                <div className="obs-linea"><span>{saludaAlInvitado ? tx("invitacion.pase.reservadoPara").toUpperCase() : tx("invitacion.evento.invitado").toUpperCase()}</span><span>{nombreInvitado || titulo}</span></div>
                {lugaresDelPase > 0 && (
                  <div className="obs-linea"><span>{tx("invitacion.pase.lugares").toUpperCase()}</span><span>{lugaresDelPase}</span></div>
                )}
                {guest?.mesas && guest.mesas.length > 0 && (
                  <div className="obs-linea"><span>{tx("invitacion.pase.tuMesa").toUpperCase()}</span><span>{guest.mesas.join(" · ")}</span></div>
                )}
                <div className="obs-linea"><span>{tx("invitacion.ubicacion.horario").toUpperCase()}</span><span>{fechaPuntos} · {hora} H</span></div>
              </div>
              <div className="obs-info-extra">
                <InfoAdicionalSection invitation={invitation} />
              </div>
            </div>
          </div>
          <div className="obs-folio obs-folio--pie">
            <span>{tx("invitacion.pase.noTransferible").toUpperCase()}</span>
            <span className="obs-replay" role="button" tabIndex={0} onClick={volverAVerla} onKeyDown={(e) => { if (e.key === "Enter") volverAVerla(); }}>
              {tx("invitacion.portada.verAperturaOtraVez").toUpperCase()} ↺
            </span>
          </div>
          <div className="obs-credito">
            <LogoFooterCredit bgColor="transparent" textColor={PALETA.bg} />
          </div>
        </section>
      </div>

      {/* ── Riel de progreso ───────────────────────────────────────────── */}
      <div ref={rielRef} className="obs-riel">
        <span ref={rielTopRef} className="obs-riel-top">{tx("invitacion.pase.numeroPase", { n: pase }).toUpperCase()}</span>
        <div ref={rielLineaRef} className="obs-riel-linea">
          <span ref={rielBarraRef} className="obs-riel-barra" />
        </div>
        <span ref={rielEtiquetaRef} className="obs-riel-etiqueta">{tx("invitacion.saveTheDate.guardaLaFecha").toUpperCase()}</span>
      </div>

      {/* ── La portada ──────────────────────────────────────────────────
          Es la tapa de la revista y, a la vez, la bienvenida: dice de quién
          es la fiesta, cuándo, dónde y para cuántos. Por eso esta
          sub-colección no monta además la sección de Bienvenida: sería
          decir dos veces lo mismo, una arriba de la otra. */}
      <div ref={portadaRef} data-tone={TONO} className="obs-portada">
        <div ref={escenaPortadaRef} className="obs-portada-hoja">
          <div className="obs-trama obs-trama--tapa" aria-hidden="true" />

          <div data-cl="1" className="obs-folio">
            <span>{tx(invitation.tipo === "CASAMIENTO" ? "invitacion.evento.nosCasamos" : invitation.tipo === "QUINCE_ANOS" ? "invitacion.evento.misQuinceAnos" : "invitacion.evento.teInvitamos").toUpperCase()}</span>
            <span>Nº 00 / {String(totalPliegos).padStart(2, "0")}</span>
          </div>

          <div data-cl="2" className="obs-tapa-centro">
            <div className="obs-tapa-fila">
              <span className="obs-tapa-fecha">{diaSemana} {diaNum} · {mesLargo.toUpperCase()} · {anio}</span>
              <Sello texto={`${tx(invitation.tipo === "QUINCE_ANOS" ? "invitacion.evento.misQuinceAnos" : "invitacion.evento.nosCasamos")} · ${fechaPuntos} · `} amp />
            </div>
            <h1 ref={cartelRef} className="obs-tapa-nombres">
              {saludaAlInvitado ? (
                <span className="obs-tapa-linea"><span>{nombreInvitado}</span></span>
              ) : (
                <>
                  <span className="obs-tapa-linea"><span>{nombre1}</span></span>
                  {nombre2 && (
                    <span className="obs-tapa-linea obs-tapa-linea--sangra">
                      <span><span className="obs-acento">&amp;</span>{nombre2}</span>
                    </span>
                  )}
                </>
              )}
            </h1>
            <div className="obs-folio">
              <span>{[lugarNombre, ciudad].filter(Boolean).join(" · ").toUpperCase()}</span>
              {isPersonalized && guest && (
                <span className="obs-tapa-pase">
                  {tx("invitacion.pase.numeroPase", { n: pase }).toUpperCase()}<br />
                  {tx("invitacion.bienvenida.paraVarios", { cantidad: String(lugaresDelPase) }).toUpperCase()}
                </span>
              )}
            </div>
          </div>

          <div data-cl="3" className="obs-tapa-pie">
            <span className="obs-regla" aria-hidden="true" />
            <p className="obs-tapa-mensaje">
              {saludaAlInvitado
                ? `${tx("invitacion.bienvenida.hola", { nombre: nombreInvitado })}. ${String(invitation.portadaMensaje || tx("invitacion.sabor.mensajeLoContamosNosotros"))}`
                : String(invitation.portadaMensaje || tx("invitacion.sabor.mensajeLoContamosNosotros"))}
            </p>
            <button type="button" onClick={abrir} className="obs-tapa-btn">
              {tx("invitacion.portada.abrirInvitacion").toUpperCase()}
            </button>
          </div>
        </div>
      </div>

      <div ref={pistaRef} className="obs-pista">{tx("invitacion.portada.desliza").toUpperCase()} ↓</div>

      {fotoAmpliada && (
        <div className="obs-lupa" onClick={() => setFotoAmpliada(null)} onContextMenu={(e) => e.preventDefault()}>
          <button
            type="button"
            className="obs-lupa-cerrar"
            onClick={(e) => { e.stopPropagation(); setFotoAmpliada(null); }}
            aria-label={tx("invitacion.cerrar")}
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fotoAmpliada} alt={tx("invitacion.album.fotoAmpliada")} className="obs-lupa-img" draggable={false} onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {musicaHabilitada && audioDeFondo}
      {montado && isPersonalized && guest && portadaAbierta && (
        <BurbujaPase acento={PALETA.acc} guest={guest} />
      )}
      {montado && musicaHabilitada && portadaAbierta && createPortal(
        <MusicToggleButton isPlaying={musicaSonando} onToggle={alternarMusica} className="fixed top-3 left-3 z-[99998]" />,
        document.body
      )}
    </div>
  );
}

/**
 * El sello circular: dos anillos y el texto siguiendo la circunferencia,
 * girando una vuelta cada 26 segundos. Es el único elemento de la
 * sub-colección que no es tipografía plana, y aparece dos veces: en la tapa
 * (con el & en el centro) y en la contratapa.
 */
function Sello({ texto, amp = false }: { texto: string; amp?: boolean }) {
  // El id del arco tiene que ser único por instancia: dos <textPath> que
  // apuntan al mismo id hacen que el segundo no se dibuje.
  const id = useId().replace(/:/g, "");
  return (
    <div className="obs-sello-circular" aria-hidden="true">
      <svg viewBox="0 0 100 100">
        <defs>
          <path id={`arc-${id}`} d="M50 50 m -37 0 a 37 37 0 1 1 74 0 a 37 37 0 1 1 -74 0" fill="none" />
        </defs>
        <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="50" cy="50" r="27" fill="none" stroke="currentColor" strokeWidth="2" />
        <text>
          <textPath href={`#arc-${id}`}>{texto.toUpperCase().repeat(2).slice(0, 64)}</textPath>
        </text>
      </svg>
      {amp && <span className="obs-sello-amp">&amp;</span>}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Piezas de la colección
// ───────────────────────────────────────────────────────────────────────────

/** Los puntos que dicen en qué panel del recorrido estamos. */
function Puntos({ cantidad }: { cantidad: number }) {
  if (cantidad <= 1) return null;
  return (
    <div className="obs-puntos" aria-hidden="true">
      {Array.from({ length: cantidad }).map((_, i) => (
        <span key={i} data-dot={i} className="obs-punto" style={{ background: i === 0 ? PALETA.acc : "rgba(43,42,51,.18)" }} />
      ))}
    </div>
  );
}

/**
 * La cuenta regresiva de Capas de papel: cuatro tarjetitas apoyadas con una
 * leve rotación distinta cada una, con la esquina doblada, y los segundos en
 * el color de acento.
 *
 * Es propia de la colección (el wizard no ofrece estilos de countdown para
 * Paper e Iconic, ver wizard-steps-config.ts): las cajas redondeadas del
 * componente compartido no pegan con el papel recortado.
 */
function CuentaObservatorio({ targetDate }: { targetDate: Date }) {
  const tx = useTextos();
  const { time, isEventDay, isPast, hasEnded } = useCountdown(targetDate);

  if (isEventDay || hasEnded || isPast) {
    return (
      <div className="obs-tarjeta obs-tarjeta--hoy" data-xin="1" data-delay="80" data-dist="30">
        <span className="obs-tarjeta-kicker">{tx("invitacion.cuentaRegresiva.kicker").toUpperCase()}</span>
        <span className="obs-tarjeta-titulo">
          {isEventDay ? tx("invitacion.cuentaRegresiva.llegoElDia") : tx("invitacion.cuentaRegresiva.yaFueUnaNocheIncreible")}
        </span>
      </div>
    );
  }

  const celdas = [
    { v: String(time.dias), l: tx("invitacion.cuentaRegresiva.dias") },
    { v: pad(time.hs), l: tx("invitacion.cuentaRegresiva.horas") },
    { v: pad(time.min), l: tx("invitacion.cuentaRegresiva.minutos") },
    { v: pad(time.seg), l: tx("invitacion.cuentaRegresiva.segundos") },
  ];

  return (
    <div className="obs-cuenta">
      {celdas.map((c, i) => (
        <div key={c.l} data-xin="1" data-delay={i * 100} data-dist={i % 2 === 0 ? -80 : 80} className={`obs-cuenta-caja obs-cuenta-caja--${i + 1}`}>
          <span className="obs-cuenta-num">{c.v}</span>
          <span className="obs-cuenta-etq">{c.l.toUpperCase()}</span>
        </div>
      ))}
    </div>
  );
}

/** Una fila de dato con su botón de copiar, dentro de una tarjeta de papel. */
function FilaCopiable({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  const tx = useTextos();
  const [copiado, setCopiado] = useState(false);
  if (!valor) return null;
  const copiar = () => {
    navigator.clipboard?.writeText(valor).catch(() => {});
    setCopiado(true);
    window.setTimeout(() => setCopiado(false), 1600);
  };
  return (
    <div className="obs-fila obs-fila--copiable">
      <div className="obs-fila-texto">
        <span className="obs-fila-etq">{etiqueta.toUpperCase()}</span>
        <span className="obs-fila-dato">{valor}</span>
      </div>
      <button type="button" onClick={copiar} className={`obs-btn-copiar${copiado ? " obs-btn-copiar--hecho" : ""}`}>
        {copiado ? tx("invitacion.regalos.copiado").toUpperCase() : tx("invitacion.regalos.copiar").toUpperCase()}
      </button>
    </div>
  );
}

/** La tarjeta con los datos bancarios, en papel. */
function TarjetaBancaria({
  titulo, mensaje, alias, cbu, banco, titular, retraso = 0, dobleZ = false, inclinada = false,
}: {
  titulo: string; mensaje?: string; alias: string; cbu: string; banco: string; titular: string;
  retraso?: number; dobleZ?: boolean; inclinada?: boolean;
}) {
  const tx = useTextos();
  if (!alias && !cbu) return null;
  return (
    <div
      data-xin="1"
      data-delay={retraso}
      data-dist="30"
      className={`obs-tarjeta obs-tarjeta--banco${dobleZ ? " obs-doblez" : ""}${inclinada ? " obs-tarjeta--der" : " obs-tarjeta--izq"}`}
    >
      <span className="obs-tarjeta-kicker">{titulo.toUpperCase()}</span>
      {mensaje && <p className="obs-tarjeta-mensaje">{mensaje}</p>}
      <div className="obs-filas">
        <FilaCopiable etiqueta="Alias" valor={alias} />
        <FilaCopiable etiqueta="CBU" valor={cbu} />
        {(banco || titular) && (
          <div className="obs-fila obs-fila--ultima">
            <span>{banco || tx("invitacion.regalos.banco")}</span>
            <span className="obs-fila-valor">{titular}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * El check-in: el talón del pase con los lugares, las restricciones y el
 * botón de confirmar. Al confirmar, el sello cae sobre el talón y se abre en
 * pétalos (ver alConfirmar en la plantilla).
 *
 * Manda exactamente lo mismo que el resto de las plantillas
 * (/api/guests/[token]/confirm o /api/rsvp): adultos, adolescentes, niños y
 * restricciones. Lo propio es el papel, no los datos.
 */
function CheckinObservatorio({
  invitationId, guestToken, guestName, pase,
  maxAdultos, maxAdolescentes, maxNinos,
  estadoInicial, adultosIniciales, adolescentesIniciales, ninosIniciales, restricciones,
  hayPago, monto, precioNino, precioAdolescente, exento, estadoDePago, vistaDePago,
  confirmado, tarjetaRef, selloRef, petalosRef, estadoRef, alConfirmar,
}: {
  invitationId: string; guestToken?: string; guestName: string; pase: string;
  maxAdultos: number; maxAdolescentes: number; maxNinos: number;
  estadoInicial: GuestStatus;
  adultosIniciales?: number; adolescentesIniciales?: number; ninosIniciales?: number;
  restricciones: string;
  hayPago: boolean; monto?: number; precioNino?: number; precioAdolescente?: number;
  exento: boolean; estadoDePago?: string;
  vistaDePago?: { total: number; paid: number; pending: number; lines: string[] } | null;
  confirmado: boolean;
  tarjetaRef: React.RefObject<HTMLDivElement | null>;
  selloRef: React.RefObject<HTMLDivElement | null>;
  petalosRef: React.RefObject<HTMLDivElement | null>;
  estadoRef: React.RefObject<HTMLSpanElement | null>;
  alConfirmar: (datos: { attending: boolean }) => void;
}) {
  const tx = useTextos();
  const formatearMoneda = useFormatoDeMoneda();
  const [estado, setEstado] = useState<GuestStatus>(estadoInicial);
  const yaEligio =
    estadoInicial === "CONFIRMED" &&
    ((adultosIniciales ?? 0) > 0 || (adolescentesIniciales ?? 0) > 0 || (ninosIniciales ?? 0) > 0);

  const [adultos, setAdultos] = useState(yaEligio ? (adultosIniciales || 0) : Math.max(1, maxAdultos));
  const [adolescentes, setAdolescentes] = useState(yaEligio ? (adolescentesIniciales || 0) : maxAdolescentes);
  const [ninos, setNinos] = useState(yaEligio ? (ninosIniciales || 0) : maxNinos);
  const [dieta, setDieta] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const total = adultos + adolescentes + ninos;
  const lugares = maxAdultos + maxAdolescentes + maxNinos;

  const precioAdulto = monto ?? 0;
  const precioAdo = precioAdolescente ?? precioAdulto;
  const precioNin = precioNino ?? precioAdulto;
  const totalEnVivo = exento ? 0 : precioAdulto * adultos + precioAdo * adolescentes + precioNin * ninos;
  // Ya confirmado manda lo que resolvió el servidor: ahí están aplicados los
  // precios propios que el anfitrión le puso a cada lugar, que de este lado
  // no se conocen.
  const usarTotalDelServidor =
    !exento && !!vistaDePago && estado === "CONFIRMED" &&
    adultos === (adultosIniciales ?? 0) && adolescentes === (adolescentesIniciales ?? 0) && ninos === (ninosIniciales ?? 0);
  const totalAPagar = usarTotalDelServidor && vistaDePago ? vistaDePago.total : totalEnVivo;

  async function enviar(asistencia: "CONFIRMA" | "NO_ASISTE") {
    setEnviando(true);
    setError("");
    try {
      const url = guestToken ? `/api/guests/${guestToken}/confirm` : "/api/rsvp";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitationId,
          nombre: guestName,
          asistencia,
          attendingAdults: asistencia === "CONFIRMA" ? adultos : undefined,
          attendingTeens: asistencia === "CONFIRMA" ? adolescentes : undefined,
          attendingChildren: asistencia === "CONFIRMA" ? ninos : undefined,
          numeroAcompanantes: asistencia === "CONFIRMA" ? total - 1 : 0,
          restricciones: asistencia === "CONFIRMA" ? dieta : undefined,
          token: guestToken,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || tx("invitacion.rsvp.errorConfirmar"));
      }
      if (asistencia === "CONFIRMA") {
        setEstado("CONFIRMED");
        alConfirmar({ attending: true });
      } else {
        setEstado("DECLINED");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : tx("invitacion.rsvp.errorConfirmarReintenta"));
    } finally {
      setEnviando(false);
    }
  }

  if (estado === "DECLINED") {
    return (
      <div data-xin="1" data-delay="140" data-dist="30" className="obs-tarjeta obs-tarjeta--izq">
        <p className="obs-tarjeta-mensaje">{tx("invitacion.rsvp.graciasPorAvisarAcceso")}</p>
        <button type="button" className="obs-btn-fantasma" onClick={() => setEstado("PENDING")}>
          {tx("invitacion.rsvp.cambieDeIdea").toUpperCase()}
        </button>
      </div>
    );
  }

  const confirmadoYa = estado === "CONFIRMED";

  return (
    <>
      <div ref={tarjetaRef} data-xin="1" data-delay="140" data-dist="30" className="obs-tarjeta obs-tarjeta--talon">
        <div className="obs-talon-top">
          <span>{tx("invitacion.pase.numeroPase", { n: pase }).toUpperCase()}{guestName ? ` · ${guestName.toUpperCase()}` : ""}</span>
          <span ref={estadoRef} className="obs-talon-estado">
            {confirmado || confirmadoYa ? tx("invitacion.pase.accesoConfirmado").toUpperCase() : tx("invitacion.pase.pendiente").toUpperCase()}
          </span>
        </div>

        {!confirmadoYa ? (
          <>
            {lugares > 1 && (
              <div className="obs-campo">
                <label className="obs-etiqueta">{tx("invitacion.rsvp.adultos").toUpperCase()}</label>
                <div className="obs-contador">
                  <button type="button" onClick={() => setAdultos((v) => Math.max(1, v - 1))} disabled={adultos <= 1} aria-label="−">−</button>
                  <span>{adultos}</span>
                  <button type="button" onClick={() => setAdultos((v) => Math.min(maxAdultos, v + 1))} disabled={adultos >= maxAdultos} aria-label="+">+</button>
                </div>
              </div>
            )}
            {maxAdolescentes > 0 && (
              <div className="obs-campo">
                <label className="obs-etiqueta">{tx("invitacion.rsvp.adolescentes").toUpperCase()}</label>
                <div className="obs-contador">
                  <button type="button" onClick={() => setAdolescentes((v) => Math.max(0, v - 1))} disabled={adolescentes <= 0} aria-label="−">−</button>
                  <span>{adolescentes}</span>
                  <button type="button" onClick={() => setAdolescentes((v) => Math.min(maxAdolescentes, v + 1))} disabled={adolescentes >= maxAdolescentes} aria-label="+">+</button>
                </div>
              </div>
            )}
            {maxNinos > 0 && (
              <div className="obs-campo">
                <label className="obs-etiqueta">{tx("invitacion.rsvp.ninos").toUpperCase()}</label>
                <div className="obs-contador">
                  <button type="button" onClick={() => setNinos((v) => Math.max(0, v - 1))} disabled={ninos <= 0} aria-label="−">−</button>
                  <span>{ninos}</span>
                  <button type="button" onClick={() => setNinos((v) => Math.min(maxNinos, v + 1))} disabled={ninos >= maxNinos} aria-label="+">+</button>
                </div>
              </div>
            )}
            <div className="obs-campo">
              <label className="obs-etiqueta">{tx("invitacion.rsvp.restriccionAlimentaria").toUpperCase()}</label>
              <input
                value={dieta}
                onChange={(e) => setDieta(e.target.value)}
                placeholder="—"
                maxLength={120}
                className="obs-input"
              />
            </div>
          </>
        ) : (
          <div className="obs-filas">
            {lugares > 1 && adultos > 0 && <div className="obs-fila"><span>{tx("invitacion.rsvp.adultos")}</span><span>{adultos}</span></div>}
            {adolescentes > 0 && <div className="obs-fila"><span>{tx("invitacion.rsvp.adolescentes")}</span><span>{adolescentes}</span></div>}
            {ninos > 0 && <div className="obs-fila"><span>{tx("invitacion.rsvp.ninos")}</span><span>{ninos}</span></div>}
            <div className="obs-fila obs-fila--ultima">
              <span>{tx("invitacion.rsvp.restriccionAlimentaria")}</span>
              <span className="obs-fila-valor">{restricciones || dieta || "—"}</span>
            </div>
          </div>
        )}

        {hayPago && monto != null && !exento && (
          <div className="obs-precio">
            <span>{estadoDePago === "PAID" ? tx("invitacion.pago.abonado") : tx("invitacion.pago.valor")}</span>
            <div className="obs-precio-valor">
              <span className="obs-precio-total">{formatearMoneda(totalAPagar)}</span>
              {usarTotalDelServidor && vistaDePago
                ? vistaDePago.lines.map((l, i) => <span key={i} className="obs-precio-detalle">{l}</span>)
                : (
                  <>
                    {adultos > 0 && <span className="obs-precio-detalle">{adultos} × {formatearMoneda(precioAdulto)}</span>}
                    {adolescentes > 0 && <span className="obs-precio-detalle">{adolescentes} × {formatearMoneda(precioAdo)}</span>}
                    {ninos > 0 && <span className="obs-precio-detalle">{ninos} × {formatearMoneda(precioNin)}</span>}
                  </>
                )}
            </div>
          </div>
        )}

        <div ref={selloRef} className="obs-sello" aria-hidden="true">{tx("invitacion.pase.confirmado").toUpperCase()}</div>
        <div ref={petalosRef} className="obs-petalos" aria-hidden="true" />
      </div>

      {error && <p className="obs-error">{error}</p>}

      {!confirmadoYa ? (
        <>
          <button type="button" data-xin="1" data-delay="220" className="obs-btn-solido" disabled={enviando} onClick={() => enviar("CONFIRMA")}>
            {enviando ? tx("invitacion.rsvp.guardando").toUpperCase() : tx("invitacion.rsvp.confirmarAsistencia").toUpperCase()}
          </button>
          <button type="button" data-xin="1" data-delay="280" className="obs-btn-fantasma" disabled={enviando} onClick={() => enviar("NO_ASISTE")}>
            {tx("invitacion.rsvp.noVoyAPoderAsistir").toUpperCase()}
          </button>
        </>
      ) : (
        <button type="button" className="obs-btn-fantasma" onClick={() => setEstado("PENDING")}>
          {tx("invitacion.rsvp.modificarAsistencia").toUpperCase()}
        </button>
      )}
    </>
  );
}

interface CancionItem { id: string; title: string; artist: string; guestName: string }

/** Sugerir una canción, en una tarjeta de papel con la lista debajo. */
function CancionesObservatorio({ invitationId, guestToken, guestName }: { invitationId: string; guestToken?: string; guestName: string }) {
  const tx = useTextos();
  const [canciones, setCanciones] = useState<CancionItem[]>([]);
  const [tema, setTema] = useState("");
  const [artista, setArtista] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const urlLista = guestToken
    ? `/api/songs?invitationId=${invitationId}&guestToken=${guestToken}`
    : `/api/songs?invitationId=${invitationId}`;

  useEffect(() => {
    fetch(urlLista)
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setCanciones(d); })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invitationId, guestToken]);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = tema.trim();
    const a = artista.trim();
    if (!t || !a) { setError(tx("invitacion.musica.completaTemaYArtista")); return; }
    setError("");
    setEnviando(true);
    try {
      const res = await fetch("/api/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationId, title: t, artist: a, guestToken, guestName }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || tx("invitacion.musica.errorEnviar"));
      }
      setTema("");
      setArtista("");
      const d = await fetch(urlLista).then((r) => r.json());
      if (Array.isArray(d)) setCanciones(d);
    } catch (err) {
      setError(err instanceof Error ? err.message : tx("invitacion.musica.noSePudoEnviar"));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <form onSubmit={enviar} data-xin="1" data-delay="140" data-dist="30" className="obs-tarjeta obs-tarjeta--der">
        <div className="obs-campo">
          <label className="obs-etiqueta">{tx("invitacion.musica.tema").toUpperCase()}</label>
          <input value={tema} onChange={(e) => setTema(e.target.value)} placeholder={tx("invitacion.musica.nombreDeLaCancion")} maxLength={100} className="obs-input obs-input--serif" />
        </div>
        <div className="obs-campo">
          <label className="obs-etiqueta">{tx("invitacion.musica.artista").toUpperCase()}</label>
          <input value={artista} onChange={(e) => setArtista(e.target.value)} placeholder={tx("invitacion.musica.artista")} maxLength={80} className="obs-input obs-input--serif" />
        </div>
        {error && <p className="obs-error">{error}</p>}
        <button type="submit" disabled={enviando} className="obs-btn-solido obs-btn-solido--tinta">
          {enviando ? tx("invitacion.musica.enviando").toUpperCase() : tx("invitacion.musica.sugeriUnaCancion").toUpperCase()}
        </button>
      </form>

      {canciones.length > 0 && (
        <div data-xin="1" data-delay="220" className="obs-lista">
          {canciones.slice(0, 8).map((c) => (
            <div key={c.id} className="obs-lista-fila">
              <div className="obs-lista-texto">
                <span className="obs-lista-tema">{c.title}</span>
                <span className="obs-lista-quien">{c.artist} · {tx("invitacion.musica.sumadoPor")} {c.guestName || tx("invitacion.evento.invitado")}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/**
 * La trivia, pregunta por pregunta sobre una tarjeta de papel: se elige una
 * opción, se pinta la correcta y se pasa a la siguiente. Misma API /api/quiz
 * que el resto de las plantillas.
 */
function TriviaObservatorio({ preguntas, invitationId, guestToken, guestName }: { preguntas: QuizPregunta[]; invitationId: string; guestToken?: string; guestName: string }) {
  const tx = useTextos();
  const [indice, setIndice] = useState(0);
  const [elegidas, setElegidas] = useState<Record<number, number>>({});
  const [terminado, setTerminado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [stats, setStats] = useState<{ avg: number; count: number } | null>(null);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    if (!invitationId) { setCargado(true); return; }
    const params = new URLSearchParams({ invitationId });
    if (guestToken) params.append("guestToken", guestToken);
    fetch(`/api/quiz?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        if (d && typeof d.averagePercentage === "number") setStats({ avg: d.averagePercentage, count: d.totalResponses });
        if (d && d.hasAnswered && d.guestScore) {
          setElegidas(d.guestScore.answers || {});
          setTerminado(true);
        }
      })
      .catch(() => {})
      .finally(() => setCargado(true));
  }, [invitationId, guestToken]);

  const guardar = async (finales: Record<number, number>) => {
    setTerminado(true);
    if (!invitationId) return;
    setGuardando(true);
    try {
      let puntos = 0;
      preguntas.forEach((q, i) => { if (finales[i] === (q.respuestaCorrecta ?? q.correcta)) puntos++; });
      await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitationId,
          guestName,
          guestToken: guestToken || null,
          answers: Object.values(finales),
          score: puntos,
          totalQuestions: preguntas.length,
        }),
      });
      const params = new URLSearchParams({ invitationId });
      if (guestToken) params.append("guestToken", guestToken);
      const res = await fetch(`/api/quiz?${params.toString()}`);
      if (res.ok) {
        const d = await res.json();
        setStats({ avg: d.averagePercentage, count: d.totalResponses });
      }
    } catch {
      // El juego no bloquea el resto de la invitación si falla el guardado.
    } finally {
      setGuardando(false);
    }
  };

  if (!cargado) return null;

  const puntaje = preguntas.reduce((acc, q, i) => acc + (elegidas[i] === (q.respuestaCorrecta ?? q.correcta) ? 1 : 0), 0);

  if (terminado) {
    return (
      <div data-xin="1" data-delay="140" data-dist="30" className="obs-tarjeta obs-tarjeta--izq">
        <span className="obs-tarjeta-kicker">{tx("invitacion.quiz.kicker").toUpperCase()}</span>
        <span className="obs-tarjeta-titulo">
          {guardando ? tx("invitacion.rsvp.guardando") : tx("invitacion.quiz.respondisteCorrectamente", { aciertos: puntaje, total: preguntas.length })}
        </span>
        {!guardando && stats && stats.count > 0 && (
          <p className="obs-tarjeta-mensaje">{tx("invitacion.quiz.promedio", { n: stats.count, avg: stats.avg })}</p>
        )}
      </div>
    );
  }

  const q = preguntas[indice];
  if (!q) return null;
  const correcta = q.respuestaCorrecta ?? q.correcta;
  const yaEligio = elegidas[indice] !== undefined;

  const elegir = (oi: number) => {
    if (yaEligio) return;
    const nuevas = { ...elegidas, [indice]: oi };
    setElegidas(nuevas);
    window.setTimeout(() => {
      if (indice + 1 < preguntas.length) setIndice(indice + 1);
      else guardar(nuevas);
    }, 900);
  };

  return (
    <div data-xin="1" data-delay="140" data-dist="30" className="obs-tarjeta obs-tarjeta--izq">
      <span className="obs-tarjeta-kicker">{tx("invitacion.quiz.preguntaDeTotal", { n: indice + 1, total: preguntas.length }).toUpperCase()}</span>
      <span className="obs-tarjeta-pregunta">{q.pregunta}</span>
      <div className="obs-opciones">
        {q.opciones.map((op, oi) => {
          let clase = "";
          if (yaEligio && correcta !== undefined) {
            if (oi === correcta) clase = " obs-opcion--bien";
            else if (elegidas[indice] === oi) clase = " obs-opcion--mal";
          }
          return (
            <button key={oi} type="button" disabled={yaEligio} onClick={() => elegir(oi)} className={`obs-opcion${clase}`}>
              {op}
            </button>
          );
        })}
      </div>
    </div>
  );
}


// ───────────────────────────────────────────────────────────────────────────
// La hoja de estilos de la familia
// ───────────────────────────────────────────────────────────────────────────
// Los mismos valores del mockup, pasados de estilos en línea a clases: las
// escenas inyectadas traen los suyos propios (y así se quedan tal cual), pero
// todo lo que escribe la plantilla se viste desde acá, que es también lo que
// leen la Bienvenida y el Post-evento compartidos (esperan `obs-section` y
// `obs-kicker`).
const CSS_OBS = `
  /* ── Tipográfica Editorial ────────────────────────────────────────────
     Acá no hay dibujo: hay tipografía, filetes y trama. Cada sección es un
     pliego de revista -- folio arriba, spread de dos páginas, titular que
     ocupa lo que quiera -- y el color aparece como fondo de página entera o
     en una palabra, nunca como adorno. */
  .obs-raiz { position: fixed; inset: 0; width: 100%; height: calc(var(--vh, 1vh) * 100); overflow: hidden;
    background: var(--pp-bg); color: var(--pp-ink); font-family: var(--obs-sans), 'Jost', sans-serif; }
  .obs-raiz a { color: inherit; text-decoration: none; }
  .obs-raiz button { font: inherit; }

  .obs-scroller { position: absolute; inset: 0; overflow-y: auto; overflow-x: hidden; opacity: 0;
    transition: opacity 900ms ease 260ms; scrollbar-width: none; }
  .obs-scroller::-webkit-scrollbar { width: 0; height: 0; }

  /* La trama de semitono: puntos de imprenta. Es la única textura de la
     sub-colección, y es un gradiente -- no pesa nada y escala sola. */
  .obs-trama { position: absolute; inset: 0; pointer-events: none; z-index: 0; opacity: .16; color: currentColor;
    background-image: radial-gradient(currentColor 1.1px, transparent 1.2px); background-size: 9px 9px; }
  .obs-trama--media { opacity: .14; bottom: 45%; background-size: 12px 12px; }
  .obs-trama--tapa { -webkit-mask-image: linear-gradient(180deg, transparent 30%, #000 100%);
    mask-image: linear-gradient(180deg, transparent 30%, #000 100%); }

  /* ── El pliego ─────────────────────────────────────────────────────── */
  .obs-section { position: relative; z-index: 1; min-height: calc(var(--vh, 1vh) * 100); box-sizing: border-box;
    display: flex; flex-direction: column; justify-content: space-between; gap: 26px;
    padding: 64px max(22px, calc((100% - 1100px) / 2)) 80px; background: var(--pp-bg); color: var(--pp-ink); }
  .obs-section[data-tone="dark"] { background: var(--pp-ink); color: var(--pp-bg); }

  /* El folio: el renglón de arriba y el de abajo de cada pliego. */
  .obs-folio { position: relative; z-index: 1; display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;
    font-family: var(--obs-mono), 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: .22em;
    color: color-mix(in srgb, currentColor 62%, transparent); }
  .obs-folio--pie { align-items: center; margin-top: auto; }
  .obs-folio-etq { font-family: var(--obs-mono), 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: .22em;
    color: color-mix(in srgb, currentColor 62%, transparent); display: block; }

  /* El spread: dos páginas. En el teléfono van una abajo de la otra; desde
     900 px se abren de verdad, como una revista apoyada. */
  .obs-spread { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 24px; }
  .obs-pagina { display: flex; flex-direction: column; gap: 16px; min-width: 0; }
  @media (min-width: 900px) {
    .obs-spread { flex-direction: row; align-items: flex-start; gap: 40px; }
    .obs-spread > * { flex: 1 1 0; min-width: 0; }
  }

  /* ── Tipos ─────────────────────────────────────────────────────────── */
  .obs-h2, .obs-panel-titulo, .obs-frase {
    position: relative; z-index: 1; margin: 0; font-family: var(--obs-serif), 'Cormorant Garamond', serif;
    font-weight: 400; line-height: .94; letter-spacing: -.035em; }
  .obs-h2 { font-size: clamp(40px, 12vw, 96px); }
  .obs-h2--album { font-size: clamp(34px, 9vw, 64px); }
  .obs-panel-titulo { font-size: clamp(48px, 15vw, 130px); }
  .obs-frase { font-size: clamp(30px, 8vw, 68px); line-height: 1.04; text-wrap: pretty; }
  .obs-acento { font-style: italic; color: var(--pp-acc); }
  .obs-acento--tinta { color: var(--pp-ink); }
  .obs-parrafo { margin: 0; font-size: 15px; line-height: 1.5; max-width: 34ch;
    color: color-mix(in srgb, currentColor 72%, transparent); }
  .obs-link { display: inline-flex; align-items: center; min-height: 28px; border-bottom: 2px solid var(--pp-acc); padding-bottom: 2px; }
  .obs-regla { display: block; height: 2px; background: currentColor; }

  /* ── 01 Guardá la fecha ────────────────────────────────────────────── */
  .obs-std { justify-content: center; }
  .obs-fecha { display: flex; flex-direction: column; font-family: var(--obs-serif), 'Cormorant Garamond', serif;
    line-height: .82; letter-spacing: -.04em; }
  .obs-fecha-linea { font-size: clamp(64px, 22vw, 180px); text-transform: lowercase; }
  .obs-fecha-linea--acc { font-style: italic; color: var(--pp-acc); text-align: right; }
  .obs-fecha-pie { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 10px;
    font-family: var(--obs-mono), 'IBM Plex Mono', monospace; font-size: 13px; letter-spacing: .12em; }
  /* La foto va enmarcada como una foto de tapa, con el año encima. */
  .obs-foto { position: relative; width: 100%; aspect-ratio: 4 / 5; border: 3px solid currentColor; box-sizing: border-box;
    overflow: hidden; background: repeating-linear-gradient(135deg, color-mix(in srgb, currentColor 12%, transparent) 0 8px, transparent 8px 16px); }
  .obs-foto-capa { position: absolute; inset: 0; }
  /* La trama que tapa la foto y se disuelve: el punto arranca en 7,2 (tapa
     entera, porque la baldosa es de 10) y el motor lo lleva a 0 al subir. */
  .obs-foto-revelado { position: absolute; inset: 0; z-index: 1; pointer-events: none;
    background-image: radial-gradient(var(--pp-ink) calc(var(--obs-punto, 7.2) * 1px), transparent calc(var(--obs-punto, 7.2) * 1px + .6px));
    background-size: 10px 10px; }
  .obs-foto-anio { position: absolute; right: 12px; top: 8px; z-index: 2; font-family: var(--obs-serif), 'Cormorant Garamond', serif;
    font-style: italic; font-size: 34px; line-height: 1; color: var(--pp-acc); }
  .obs-foto-pie { position: absolute; left: 14px; bottom: 12px; z-index: 2; font-family: var(--obs-mono), 'IBM Plex Mono', monospace;
    font-size: 11px; letter-spacing: .2em; color: color-mix(in srgb, currentColor 80%, transparent); }

  /* ── 02 Falta poco: dos marquesinas y cuatro cifras ────────────────── */
  .obs-countdown { justify-content: space-between; }
  .obs-marquesina { position: relative; z-index: 1; overflow: hidden; border-top: 2px solid currentColor; border-bottom: 2px solid currentColor;
    padding: 8px 0; font-family: var(--obs-mono), 'IBM Plex Mono', monospace; font-size: 12px; letter-spacing: .2em; text-transform: uppercase; }
  .obs-marquesina-tira { display: flex; width: max-content; animation: ebnCorre 26s linear infinite; }
  .obs-marquesina--contraria .obs-marquesina-tira { animation-direction: reverse; }
  @keyframes ebnCorre { to { transform: translateX(-50%); } }

  /* Las cuatro cifras en dos por dos, con una cruz de filetes entre ellas:
     la primera lleva filete a la derecha y abajo, la segunda sólo abajo, la
     tercera sólo a la derecha y la cuarta ninguno. Los segundos van en
     itálica y en el acento, que es lo único que se mueve de la página. */
  .obs-cuenta { position: relative; z-index: 1; display: grid; grid-template-columns: 1fr 1fr; }
  .obs-cuenta-caja { display: flex; flex-direction: column; gap: 6px; padding: 18px 14px 20px; overflow: hidden; }
  .obs-cuenta-caja:nth-child(1) { border-right: 2px solid currentColor; border-bottom: 2px solid currentColor; }
  .obs-cuenta-caja:nth-child(2) { border-bottom: 2px solid currentColor; }
  .obs-cuenta-caja:nth-child(3) { border-right: 2px solid currentColor; }
  .obs-cuenta-num, .obs-cuenta-dias, .obs-cifra { font-family: var(--obs-serif), 'Cormorant Garamond', serif; font-weight: 400;
    font-size: clamp(64px, 20vw, 150px); line-height: .82; letter-spacing: -.04em; font-variant-numeric: tabular-nums; }
  .obs-cuenta-caja:nth-child(4) .obs-cuenta-num { font-style: italic; color: var(--pp-acc); }
  .obs-cuenta-etq { font-family: var(--obs-mono), 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: .24em;
    text-transform: uppercase; color: var(--pp-acc); }
  .obs-cuenta-aviso { display: flex; flex-direction: column; gap: 8px; }

  /* ── 03 Unas palabras ──────────────────────────────────────────────── */
  .obs-frase-seccion { background: var(--pp-acc) !important; color: var(--pp-bg); }
  .obs-frase-seccion .obs-acento { color: var(--pp-bg); font-style: italic; }
  .obs-sello { align-self: flex-start; border: 2px solid currentColor; padding: 10px 16px; transform: rotate(-3deg);
    font-family: var(--obs-mono), 'IBM Plex Mono', monospace; font-size: 12px; letter-spacing: .2em; text-transform: uppercase; }

  /* ── Paneles ───────────────────────────────────────────────────────── */
  .obs-pan { position: relative; z-index: 1; height: calc(100vh + var(--st-pasos, 2) * 90vh); }
  .obs-pan-fijo { position: sticky; top: 0; height: calc(var(--vh, 1vh) * 100); overflow: hidden; background: var(--pp-bg); }
  .obs-tira { position: absolute; top: 0; left: 0; height: 100%; display: flex; will-change: transform; }
  .obs-panel { flex: 0 0 100vw; min-width: 0; height: 100%; box-sizing: border-box; position: relative; overflow: hidden;
    display: flex; flex-direction: column; justify-content: space-between; gap: 24px;
    padding: 64px max(22px, calc((100vw - 1100px) / 2)) 80px; background: var(--pp-bg); color: var(--pp-ink); }
  .obs-panel[data-tone="dark"] { background: var(--pp-ink); color: var(--pp-bg); }
  .obs-panel--acento { background: var(--pp-acc) !important; color: var(--pp-bg); }
  .obs-panel--acento .obs-acento { color: var(--pp-ink); }
  .obs-pan[data-scroll="vertical"] { height: auto; }
  .obs-pan[data-scroll="vertical"] .obs-pan-fijo { position: static; height: auto; overflow: visible; }
  .obs-pan[data-scroll="vertical"] .obs-tira { position: static; display: block; width: 100%; transform: none !important; }
  .obs-pan[data-scroll="vertical"] .obs-panel { height: auto; min-height: calc(var(--vh, 1vh) * 100); }

  .obs-lineas { display: flex; flex-direction: column; border-top: 2px solid currentColor; }
  .obs-linea { display: flex; justify-content: space-between; gap: 16px; padding: 12px 0; border-bottom: 1px solid color-mix(in srgb, currentColor 30%, transparent); }
  .obs-linea > span:first-child { font-family: var(--obs-mono), 'IBM Plex Mono', monospace; font-size: 12px; letter-spacing: .14em;
    text-transform: uppercase; color: color-mix(in srgb, currentColor 66%, transparent); flex: 0 0 auto; }
  .obs-linea > span:last-child { text-align: right; font-size: 15px; }
  .obs-cta { margin-top: 14px; min-height: 48px; display: flex; align-items: center; justify-content: space-between;
    border: 2px solid currentColor; padding: 0 16px; font-family: var(--obs-mono), 'IBM Plex Mono', monospace;
    font-size: 12px; letter-spacing: .18em; text-transform: uppercase; }
  .obs-cta-flecha { font-family: var(--obs-serif), 'Cormorant Garamond', serif; font-style: italic; font-size: 22px; }
  .obs-mapa { height: 190px; border: 2px solid currentColor; overflow: hidden; margin-top: 14px; }
  .obs-puntos { position: absolute; left: 0; right: 40px; bottom: 30px; display: flex; gap: 8px; justify-content: center; z-index: 2; }
  .obs-punto { width: 28px; height: 3px; transition: background 300ms ease; display: inline-block; }

  /* ── 05 Check-in: el cupón ─────────────────────────────────────────── */
  .obs-checkin { background: var(--pp-bg2); }
  .obs-cupon { position: relative; background: #FFFFFF; color: var(--pp-ink); border: 3px solid var(--pp-ink);
    padding: 26px 18px 18px; display: flex; flex-direction: column; gap: 14px; }
  .obs-cupon-corte { position: absolute; left: -3px; right: -3px; top: 52px; border-top: 2px dashed var(--pp-ink); }
  .obs-cupon .obs-talon-top { font-family: var(--obs-mono), 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: .2em; }
  .obs-cupon input, .obs-cupon .obs-input { border: 2px solid var(--pp-ink); border-radius: 0; background: transparent; }
  .obs-cupon .obs-contador button { border: 2px solid var(--pp-ink); }
  .obs-sello, .obs-cupon .obs-sello { color: inherit; }

  /* ── 06 Álbum: hoja de contactos ───────────────────────────────────── */
  .obs-panel--album { background: color-mix(in srgb, var(--pp-bg) 92%, var(--pp-ink)); }
  .obs-contactos { position: relative; z-index: 1; flex: 1; min-height: 0; display: grid; grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: 1fr; gap: 10px; }
  @media (min-width: 900px) { .obs-contactos { grid-template-columns: repeat(6, 1fr); } }
  .obs-contacto { position: relative; overflow: hidden; border: 1px solid color-mix(in srgb, currentColor 30%, transparent); cursor: pointer; }
  .obs-contacto-img { width: 100%; height: 100%; object-fit: cover; display: block; filter: grayscale(1) contrast(1.1); }
  .obs-contacto-tinta { position: absolute; inset: 0; background: var(--pp-acc); mix-blend-mode: multiply; opacity: .18; }
  .obs-contacto-n { position: absolute; left: 6px; bottom: 4px; font-family: var(--obs-mono), 'IBM Plex Mono', monospace;
    font-size: 10px; letter-spacing: .14em; color: #FFFFFF; mix-blend-mode: difference; }

  /* ── 07 Música ─────────────────────────────────────────────────────── */
  .obs-eq { display: flex; align-items: flex-end; gap: 6px; height: 40px; }
  .obs-eq span { width: 6px; height: 100%; background: currentColor; transform-origin: bottom; animation: ebnEq 1.1s ease-in-out infinite; }
  @keyframes ebnEq { 0%, 100% { transform: scaleY(.25); } 50% { transform: scaleY(1); } }
  .obs-lista { display: flex; flex-direction: column; border-top: 2px solid currentColor; }
  .obs-lista-fila { display: flex; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid color-mix(in srgb, currentColor 30%, transparent); }
  .obs-lista-texto { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .obs-lista-tema { font-size: 15px; }
  .obs-lista-quien { font-family: var(--obs-mono), 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: .12em;
    color: color-mix(in srgb, currentColor 62%, transparent); }

  /* ── 08 Regalos: fichas blancas ────────────────────────────────────── */
  .obs-tarjeta { position: relative; z-index: 1; background: #FFFFFF; color: var(--pp-ink); border: 3px solid var(--pp-ink);
    padding: 18px; display: flex; flex-direction: column; gap: 12px; transform: none !important; box-shadow: none; }
  .obs-tarjeta + .obs-tarjeta { margin-top: 12px; }
  .obs-tarjeta-kicker { font-family: var(--obs-mono), 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: .2em; text-transform: uppercase; }
  .obs-tarjeta-titulo { font-family: var(--obs-serif), 'Cormorant Garamond', serif; font-size: 28px; line-height: 1; }
  .obs-tarjeta-mensaje { margin: 0; font-size: 14px; line-height: 1.5; color: var(--pp-ink2); }
  .obs-tarjeta .obs-fila { border-bottom: 1px solid color-mix(in srgb, var(--pp-ink) 22%, transparent); }
  .obs-fila { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 10px 0; }
  .obs-fila--ultima { border-bottom: none; }
  .obs-fila-texto { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .obs-fila-etq { font-family: var(--obs-mono), 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: .18em; color: var(--pp-ink2); }
  .obs-fila-dato { font-size: 15px; overflow-wrap: anywhere; }
  .obs-fila-valor { text-align: right; }
  .obs-btn-copiar { flex-shrink: 0; min-height: 44px; padding: 0 14px; border: 2px solid var(--pp-ink); background: transparent;
    color: var(--pp-ink); font-family: var(--obs-mono), 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: .14em;
    text-transform: uppercase; cursor: pointer; }
  .obs-btn-copiar--hecho { background: var(--pp-ink); color: #FFFFFF; }

  /* ── 09 Trivia: el pliego del acento ───────────────────────────────── */
  .obs-quiz { background: var(--pp-acc) !important; color: var(--pp-bg); }
  .obs-quiz .obs-acento { color: var(--pp-ink); }
  .obs-opciones { display: flex; flex-direction: column; gap: 10px; }
  .obs-opcion { min-height: 52px; text-align: left; padding: 0 16px; border: 2px solid currentColor; background: transparent;
    color: inherit; font-family: var(--obs-sans), 'Jost', sans-serif; font-size: 15px; cursor: pointer;
    transition: background 200ms ease, color 200ms ease; }
  .obs-opcion--bien { background: var(--pp-bg); color: var(--pp-ink); }
  .obs-opcion--mal { opacity: .55; }

  /* ── 10 Tu pase ────────────────────────────────────────────────────── */
  .obs-pase { background: var(--pp-ink); color: var(--pp-bg); }
  .obs-pagina--qr { align-items: flex-start; }
  .obs-pagina--qr .qr-ingreso, .obs-pagina--qr section { background: transparent !important; border: none !important; padding: 0 !important; }
  .obs-pase-cabeza { display: flex; align-items: flex-end; justify-content: space-between; gap: 14px; }
  .obs-pase-numero { display: flex; flex-direction: column; }
  .obs-pase-numero > span:last-child { font-family: var(--obs-serif), 'Cormorant Garamond', serif; font-size: clamp(44px, 12vw, 86px); line-height: .9; }
  .obs-info-extra { margin-top: 12px; }
  .obs-info-extra #info-adicional { background: transparent !important; padding: 0 !important; }
  .obs-info-extra #ia-trigger-btn { background: transparent !important; color: inherit !important; border: 2px solid currentColor !important;
    border-radius: 0 !important; font-family: var(--obs-mono), 'IBM Plex Mono', monospace !important; letter-spacing: .18em !important; }
  /* Los íconos de los componentes compartidos no entran: acá el dibujo es la
     tipografía. */
  .obs-raiz .ia-icon-box, .obs-raiz svg.lucide { display: none !important; }
  .obs-replay { cursor: pointer; }
  .obs-credito { display: flex; justify-content: center; opacity: .6; }
  .obs-error { margin: 0; font-family: var(--obs-mono), 'IBM Plex Mono', monospace; font-size: 12px; }

  /* ── El sello circular ─────────────────────────────────────────────── */
  .obs-sello-circular { position: relative; width: clamp(72px, 18vw, 96px); aspect-ratio: 1; flex: 0 0 auto; color: var(--pp-acc); }
  .obs-sello-circular svg { position: absolute; inset: 0; animation: ebnGira 26s linear infinite; }
  .obs-sello-circular text { font-family: var(--obs-mono), 'IBM Plex Mono', monospace; font-size: 9.2px; letter-spacing: 1.4px; fill: currentColor; }
  .obs-sello-amp { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
    font-family: var(--obs-serif), 'Cormorant Garamond', serif; font-style: italic; font-size: 30px; color: var(--pp-acc); }
  @keyframes ebnGira { to { transform: rotate(360deg); } }

  /* ── La tapa ───────────────────────────────────────────────────────── */
  .obs-portada { position: absolute; inset: 0; z-index: 5; overflow: hidden; background: var(--pp-bg); color: var(--pp-ink); }
  .obs-portada-hoja { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: space-between;
    padding: calc(18px + env(safe-area-inset-top)) max(22px, calc((100% - 1100px) / 2)) calc(22px + env(safe-area-inset-bottom)); }
  .obs-tapa-centro { position: relative; z-index: 1; display: flex; flex-direction: column; gap: clamp(8px, 2vh, 20px); }
  .obs-tapa-fila { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
  .obs-tapa-fecha { font-family: var(--obs-mono), 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: .22em;
    text-transform: uppercase; color: var(--pp-acc); }
  .obs-tapa-nombres { margin: 0; font-family: var(--obs-serif), 'Cormorant Garamond', serif; font-weight: 400;
    font-size: min(clamp(56px, 20vw, 180px), 15vh); line-height: .84; letter-spacing: -.035em; display: flex; flex-direction: column; }
  .obs-tapa-linea { overflow: hidden; display: block; }
  .obs-tapa-linea > span { display: block; }
  .obs-tapa-linea--sangra { padding-left: 14%; }
  .obs-tapa-pase { text-align: right; }
  .obs-tapa-pie { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 14px; }
  .obs-tapa-mensaje { margin: 0; font-family: var(--obs-serif), 'Cormorant Garamond', serif; font-size: clamp(20px, 5.4vw, 26px);
    line-height: 1.2; max-width: 34ch; }
  .obs-tapa-btn { min-height: 52px; border: 2px solid var(--pp-ink); background: var(--pp-ink); color: var(--pp-bg);
    font-family: var(--obs-sans), 'Jost', sans-serif; font-weight: 600; font-size: 13px; letter-spacing: .2em;
    text-transform: uppercase; padding: 0 22px; cursor: pointer; transition: background 200ms ease, color 200ms ease; }
  @media (hover: hover) { .obs-tapa-btn:hover { background: var(--pp-acc); border-color: var(--pp-acc); color: var(--pp-bg); } }

  /* ── Riel, pista y lupa ────────────────────────────────────────────── */
  .obs-riel { position: absolute; right: 0; top: 0; bottom: 0; width: 34px; z-index: 4; display: flex; flex-direction: column;
    align-items: center; justify-content: space-between; padding: 20px 0 calc(20px + env(safe-area-inset-bottom));
    opacity: 0; transition: opacity 700ms ease; pointer-events: none; border-left: 1px solid color-mix(in srgb, var(--pp-ink) 20%, transparent); }
  .obs-riel-top, .obs-riel-etiqueta { writing-mode: vertical-rl; font-family: var(--obs-mono), 'IBM Plex Mono', monospace;
    font-size: 10px; letter-spacing: .28em; transition: color 500ms ease; }
  .obs-riel-top { color: var(--pp-ink2); }
  .obs-riel-etiqueta { color: var(--pp-acc); }
  .obs-riel-linea { flex: 1; width: 1px; margin: 16px 0; background: color-mix(in srgb, var(--pp-ink) 20%, transparent); position: relative; }
  .obs-riel-barra { position: absolute; left: -1px; top: 0; width: 3px; height: 0%; background: var(--pp-acc); transition: height 260ms linear; display: block; }
  .obs-pista { position: absolute; left: 0; right: 34px; bottom: calc(18px + env(safe-area-inset-bottom)); z-index: 6; text-align: center;
    font-family: var(--obs-mono), 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: .28em; color: var(--pp-ink2);
    opacity: 0; transition: opacity 600ms ease; pointer-events: none; animation: ebnPista 2.4s ease-in-out infinite; }
  @keyframes ebnPista { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(7px); } }

  .obs-lupa { position: fixed; inset: 0; z-index: 200; background: color-mix(in srgb, var(--pp-ink) 94%, transparent);
    display: flex; align-items: center; justify-content: center; padding: 24px; cursor: zoom-out; }
  .obs-lupa-cerrar { position: absolute; top: 20px; right: 20px; width: 40px; height: 40px; border: 2px solid var(--pp-bg);
    background: transparent; color: var(--pp-bg); font-size: 18px; line-height: 1; cursor: pointer; }
  .obs-lupa-img { max-width: 100%; max-height: 88vh; object-fit: contain; cursor: default; border: 3px solid var(--pp-bg); }

  /* ── Formularios (check-in y canciones) ────────────────────────────── */
  .obs-campo { display: flex; flex-direction: column; gap: 6px; }
  .obs-etiqueta { font-family: var(--obs-mono), 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: .2em; text-transform: uppercase;
    color: color-mix(in srgb, currentColor 66%, transparent); }
  .obs-input { min-height: 48px; border: 2px solid currentColor; background: transparent; color: inherit;
    font-family: var(--obs-sans), 'Jost', sans-serif; font-size: 16px; padding: 0 12px; border-radius: 0; }
  .obs-input:focus { outline: none; border-color: var(--pp-acc); }
  .obs-contador { display: flex; align-items: center; gap: 12px; }
  .obs-contador button { width: 48px; height: 48px; border: 2px solid currentColor; background: transparent; color: inherit;
    font-size: 20px; line-height: 1; cursor: pointer; }
  .obs-contador button:disabled { opacity: .35; cursor: default; }
  .obs-contador > span { font-family: var(--obs-serif), 'Cormorant Garamond', serif; font-size: 36px; min-width: 40px; text-align: center; line-height: 1; }
  .obs-btn-solido { min-height: 48px; padding: 0 22px; border: 2px solid currentColor; background: currentColor; color: var(--pp-bg);
    font-family: var(--obs-mono), 'IBM Plex Mono', monospace; font-size: 12px; letter-spacing: .18em; text-transform: uppercase; cursor: pointer; }
  .obs-btn-solido--tinta { background: var(--pp-acc); border-color: var(--pp-acc); color: var(--pp-bg); }
  .obs-btn-fantasma { min-height: 48px; padding: 0 22px; border: 2px solid currentColor; background: transparent; color: inherit;
    font-family: var(--obs-mono), 'IBM Plex Mono', monospace; font-size: 12px; letter-spacing: .18em; text-transform: uppercase; cursor: pointer; }
  .obs-precio { display: flex; justify-content: space-between; gap: 12px; border-top: 2px solid currentColor; padding-top: 12px; }
  .obs-precio-valor { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
  .obs-precio-total { font-family: var(--obs-serif), 'Cormorant Garamond', serif; font-size: 28px; line-height: 1; }
  .obs-precio-detalle { font-family: var(--obs-mono), 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: .1em; }
  .obs-talon-top { display: flex; justify-content: space-between; gap: 10px; font-family: var(--obs-mono), 'IBM Plex Mono', monospace;
    font-size: 11px; letter-spacing: .2em; text-transform: uppercase; }
  .obs-talon-estado { transition: color 400ms ease; }
  .obs-filas { display: flex; flex-direction: column; }
  .obs-petalos { display: none; }

  /* Observatorio: la trama son estrellas en dos tamaños, no puntos de imprenta. */
  .obs-trama { opacity: .32; background-image: radial-gradient(currentColor .6px, transparent .7px), radial-gradient(currentColor .4px, transparent .5px); background-size: 46px 46px, 23px 23px; background-position: 0 0, 12px 8px; }
  .obs-sello-circular svg { animation-duration: 60s; }

  @media (prefers-reduced-motion: reduce) {
    .obs-raiz * { animation: none !important; }
    .obs-scroller [data-xin] { opacity: 1 !important; transform: none !important; }
    /* Sin movimiento no hay revelado: la foto se ve, sin la trama encima. */
    .obs-foto { --obs-punto: 0; }
  }
`;
