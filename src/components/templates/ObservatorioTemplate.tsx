"use client";

/**
 * OBSERVATORIO · Colección Iconic — sub-colección "Tipográfica Editorial"
 * Variante: Medianoche (base).
 *
 * GENERADO por scripts/derivar-tipografica.js a partir de
 * EditorialBlancNoirTemplate.tsx — no editar a mano: el motor se arregla en
 * Editorial Blanc & Noir; el render en scripts/jsx/tipografica/obs.jsx, los
 * estilos en scripts/css/tipografica/obs.css y las caras y la paleta en
 * scripts/familias/tipografica/obs.json.
 *
 * La carta celeste: Cormorant Garamond fina para nombres y cifras, Jost
 * para el texto, IBM Plex Mono para coordenadas y folios. Azul profundo,
 * marfil, oro y azul acero con filetes de 0,5 a 1 px. Estrellas que
 * titilan, un cometa, la constelación que se traza sola con la fecha,
 * astrolabio que gira, la luna de esa noche, ocular, órbitas y placas.
 *
 * Sin imágenes propias: son fuentes y CSS.
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
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--obs-serif",
});
const obsSans = Jost({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--obs-sans",
});
// El mono es la ficha técnica de la revista: folios, kickers y datos.
const obsMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
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
  acc3: "#C97B63",
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
    const renglones = cartel ? Array.from(cartel.querySelectorAll<HTMLElement>("[data-pieza]")) : [];
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
            punto.dataset.activo = i === activo ? "1" : "";
          });
          // El baño de color de las fotos: opaco en el centro de la pantalla,
          // transparente a más de un 40 % del ancho.
          tira.querySelectorAll<HTMLElement>("[data-sheet]").forEach((hoja) => {
            const bano = hoja.querySelector<HTMLElement>("[data-colorwash]");
            if (!bano) return;
            const rh = hoja.getBoundingClientRect();
            const dx = Math.abs((rh.left + rh.width / 2) / vw - 0.5);
            const cerca = Math.max(0, Math.min(1, 1 - (dx - 0.1) / 0.3));
            bano.style.opacity = String(cerca);
            // Las placas (Observatorio) están en negativo y se revelan al
            // pasar por el centro.
            const negativo = hoja.querySelector<HTMLElement>("[data-neg]");
            if (negativo) negativo.style.opacity = (0.18 * (1 - cerca)).toFixed(3);
            // Las postales (Postal) giran y muestran el dorso cuando pasan
            // por el centro; vuelven al salir.
            const carta = hoja.querySelector<HTMLElement>("[data-card]");
            if (carta && !menosMovimiento) {
              const gira = dx < 0.18 && p > 0.02 && p < 0.98;
              if (carta.dataset.girada !== String(gira)) {
                carta.dataset.girada = String(gira);
                carta.style.transform = gira ? "rotateY(180deg)" : "rotateY(0)";
              }
            }
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
    "--pp-acc3": PALETA.acc3,
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

  // El nombre en Cormorant fina, centrado, con la "y" entre dos líneas
  // doradas. El renglón más largo manda el cuerpo.
  const renglones = saludaAlInvitado ? [nombreInvitado] : [nombre1, ...(nombre2 ? [nombre2] : [])];
  const renglonMasLargo = Math.max(5, ...renglones.map((n) => n.length));

  // La bitácora: el medio en itálica dorada y el cierre en itálica azul.
  const tonoDePalabra = (i: number) => {
    const n = palabras.length;
    if (i >= Math.ceil(n * 0.7)) return "obs-italica obs-azul";
    if (i >= Math.floor(n * 0.25) && i < desdeAcento) return "obs-italica obs-oro";
    return undefined;
  };

  const kickerDelEvento = tx(invitation.tipo === "CASAMIENTO" ? "invitacion.evento.nosCasamos" : invitation.tipo === "QUINCE_ANOS" ? "invitacion.evento.misQuinceAnos" : "invitacion.evento.teInvitamos");
  const mesCorto = mesLargo.slice(0, 3).toUpperCase();
  const anioRomano = aRomano(fechaEvento.getFullYear());
  const luna = faseLunar(fechaHora);
  const nombreDeLuna = tx(luna.clave);
  const inicialesY = `${(nombre1.trim()[0] || "").toUpperCase()}${nombre2 ? ` ${tx("invitacion.rsvp.y")} ${(nombre2.trim()[0] || "").toUpperCase()}` : ""}`;
  const codigoDelPase = `ALT ${pase} · ${(ciudad || lugarNombre || "").slice(0, 3).toUpperCase()} · ${anio}`;
  // Las estrellas del cielo de la tapa: posición, radio y, en ocho de ellas,
  // el ritmo del titilar.
  const ESTRELLAS: [number, number, number, number][] = [
    [22, 60, 1, 0], [88, 24, 0.8, 0], [140, 90, 1.3, 3.2], [210, 40, 0.7, 0], [300, 70, 1.1, 4.1], [370, 30, 0.9, 0],
    [40, 180, 0.9, 0], [120, 220, 0.6, 0], [250, 160, 1.2, 2.8], [340, 200, 0.8, 0], [390, 140, 0.6, 0],
    [60, 330, 0.7, 0], [180, 300, 0.9, 3.6], [290, 330, 0.6, 0], [360, 290, 1.1, 0],
    [30, 470, 1, 4.4], [110, 520, 0.7, 0], [200, 480, 0.8, 0], [310, 500, 1.2, 3], [380, 440, 0.7, 0],
    [70, 620, 0.8, 0], [160, 660, 1, 0], [260, 600, 0.6, 0], [350, 650, 0.9, 3.8],
  ];

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
            Las efemérides: el astrolabio con la fecha adentro y el texto
            girando, la luna de esa noche y la foto vista por el ocular. */}
        <section data-tone="dark" data-screen-label={tx("invitacion.saveTheDate.guardaLaFecha")} className="obs-section obs-std">
          <div className="obs-folio">
            <span data-xin="1" data-dist="-40">{nSaveTheDate} — {tx("invitacion.saveTheDate.efemerides").toUpperCase()}</span>
            <span data-xin="1" data-dist="40">{folio(nSaveTheDate)}</span>
          </div>
          <div className="obs-spread">
            <div className="obs-pagina">
              <div data-xin="1" data-dist="0" className="obs-astrolabio">
                <Astrolabio arco={`${diaSemana} · ${diaNum} ${tx("invitacion.evento.de").toUpperCase()} ${mesLargo.toUpperCase()} · ${anio} · ${[ciudad || lugarNombre].filter(Boolean).join(" · ").toUpperCase()} · ${hora} H · `} dia={diaNum} mes={`${tx("invitacion.evento.de")} ${mesLargo}`} anio={anioRomano} />
              </div>
              <div data-xin="1" data-delay="300" className="obs-luna">
                <span className="obs-luna-disco" aria-hidden="true"><span style={{ transform: `translateX(${luna.desplazamiento}%)` }} /></span>
                <div className="obs-luna-texto">
                  <span className="obs-etq-mono">{tx("invitacion.saveTheDate.lunaEsaNoche")}</span>
                  <span>{nombreDeLuna} · {luna.porcentaje} % {tx("invitacion.saveTheDate.iluminada")}</span>
                </div>
              </div>
              <AddToCalendarLink
                eventName={titulo}
                targetDate={fechaHora}
                location={[lugarNombre, direccion].filter(Boolean).join(", ")}
                className="obs-cta-linea"
                showIcon={false}
              >
                {tx("invitacion.saveTheDate.agregarAlCalendario").toUpperCase()}
              </AddToCalendarLink>
            </div>

            {hayFoto && (
              <div ref={ventanaRef} data-xin="1" data-delay="200" data-dist="0" className="obs-ocular">
                <div className="obs-ocular-lente">
                  {fotoMobile && (
                    <div className="acp-mobile-only obs-foto-capa">
                      <AnimatedCoverPhoto photoSrc={fotoMobile} tint={false} effect="enfoque" scrimColorRgb="11,20,38" />
                    </div>
                  )}
                  {fotoDesktop && (
                    <div className="acp-desktop-only obs-foto-capa">
                      <AnimatedCoverPhoto photoSrc={fotoDesktop} tint={false} effect="enfoque" scrimColorRgb="11,20,38" />
                    </div>
                  )}
                  {/* La viñeta que tapa la foto y se abre al subir: el motor
                      mueve --obs-punto de 7,2 a 0 y la opacidad la sigue. */}
                  <span className="obs-vineta" aria-hidden="true" />
                  <span className="obs-reticula obs-reticula--v" aria-hidden="true" /><span className="obs-reticula obs-reticula--h" aria-hidden="true" /><span className="obs-reticula-centro" aria-hidden="true" />
                  <span className="obs-ocular-etq">{tx("invitacion.album.nuestraFoto").toUpperCase()}</span>
                </div>
                <span className="obs-ocular-pie obs-ocular-pie--izq">{tx("invitacion.saveTheDate.ocular").toUpperCase()}</span>
                <span className="obs-ocular-pie obs-ocular-pie--der">{tx("invitacion.saveTheDate.placa").toUpperCase()} 01</span>
              </div>
            )}
          </div>
        </section>

        {/* ── 02 Falta poco ──────────────────────────────────────────────
            El tránsito: cuatro órbitas con su anillo punteado girando y la
            cifra en el centro. */}
        <section data-tone="dark" data-screen-label={tx("invitacion.cuentaRegresiva.kicker")} className="obs-section obs-countdown">
          <div className="obs-folio">
            <span data-xin="1" data-dist="-40">{nCountdown} — {tx("invitacion.saveTheDate.transito").toUpperCase()}</span>
            <span data-xin="1" data-dist="40">{folio(nCountdown)}</span>
          </div>
          <div className="obs-marquesina" aria-hidden="true">
            <div className="obs-marquesina-tira">
              {[0, 1].map((i) => (
                <span key={i}>
                  {tx("invitacion.cuentaRegresiva.faltan")} {tx("invitacion.cuentaRegresiva.dias").toLowerCase()}, {tx("invitacion.cuentaRegresiva.horas").toLowerCase()}, {tx("invitacion.cuentaRegresiva.minutos").toLowerCase()} {tx("invitacion.rsvp.y")} {tx("invitacion.cuentaRegresiva.segundos").toLowerCase()} — {diaNum} {tx("invitacion.evento.de")} {mesLargo} — {tx("invitacion.saveTheDate.laCuentaSigue")} —&nbsp;
                </span>
              ))}
            </div>
          </div>
          <div className="obs-spread">
            <div className="obs-pagina obs-pagina--entera">
              <CuentaObservatorio targetDate={fechaHora} />
            </div>
          </div>
          <div className="obs-folio obs-folio--chico">
            <span>{tx("invitacion.saveTheDate.horaLocal").toUpperCase()} · UTC−3</span>
            <span>{[lugarNombre, dressCode].filter(Boolean).join(" · ").toUpperCase()}</span>
          </div>
        </section>

        {/* ── 03 Unas palabras ───────────────────────────────────────────
            La bitácora: una constelación de fondo, la frase en Cormorant y
            la nota que flota con su estrella. */}
        {hayFrase && (
          <section data-tone="dark" data-screen-label={tx("invitacion.frase.etiqueta")} className="obs-section obs-frase-seccion">
            <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="obs-constelacion-fondo" aria-hidden="true">
              <polyline points="30,240 90,180 150,210 220,120 300,150 370,60" fill="none" stroke="currentColor" strokeWidth=".5" opacity=".6" className="obs-oro" />
              <g fill="currentColor"><circle cx="30" cy="240" r="1.5" /><circle cx="90" cy="180" r="2" /><circle cx="150" cy="210" r="1.2" /><circle cx="220" cy="120" r="2.4" /><circle cx="300" cy="150" r="1.4" /><circle cx="370" cy="60" r="2" /></g>
            </svg>
            <div className="obs-folio">
              <span data-xin="1" data-dist="-40">{nFrase} — {tx("invitacion.saveTheDate.bitacora").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nFrase)}</span>
            </div>
            <div className="obs-spread">
              <h2 ref={fraseRef} className="obs-frase">
                {palabras.map((p, i) => (
                  // El espacio va fuera del span: el motor pone cada palabra
                  // en inline-block y un espacio adentro se colapsa a cero.
                  <span key={i}>
                    <span data-w="1" className={tonoDePalabra(i)}>{p}</span>{" "}
                  </span>
                ))}
              </h2>
              <div data-xin="1" data-delay="900" data-dist="60" className="obs-nota">
                <span className="obs-nota-estrella" aria-hidden="true"><span /></span>
                <span>{tx("invitacion.frase.conAmor")} · {titulo} · {tx("invitacion.saveTheDate.registro").toLowerCase()} {String(fechaEvento.getDate()).padStart(2, "0")}.{String(fechaEvento.getMonth() + 1).padStart(2, "0")}.{anio}</span>
              </div>
            </div>
            <div className="obs-folio obs-folio--chico obs-folio--pie">
              <span>{tx("invitacion.saveTheDate.observacion").toUpperCase()} Nº {pase}</span>
              <span className="obs-barra" aria-hidden="true" />
            </div>
          </section>
        )}

        {/* ── 04 Cuándo y dónde ──────────────────────────────────────────
            Las coordenadas: una observación por lugar, con la ficha de
            filete fino y la etiqueta en la esquina. */}
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
              <div data-tone="dark" className="obs-panel">
                <div className="obs-folio">
                  <span>{nCuando} — {tx("invitacion.ubicacion.fiestaSalon").toUpperCase()}</span><span>{deLugar("recepcion")}</span>
                </div>
                <div className="obs-spread">
                  <div className="obs-pagina">
                    <span className="obs-panel-sub">{tx("invitacion.saveTheDate.observacion")} {deLugar("recepcion").split(" ")[0]}</span>
                    <h2 className="obs-panel-titulo">{lugarNombre || ciudad}</h2>
                  </div>
                  <div className="obs-ficha">
                    <span className="obs-ficha-coord">{(ciudad || `${hora} H`).toUpperCase()}</span>
                    <div className="obs-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{hora} h</span></div>
                    {direccion && <div className="obs-linea"><span>{tx("invitacion.ubicacion.direccion")}</span><span>{direccion}</span></div>}
                    {dressCode && <div className="obs-linea"><span>{tx("invitacion.ubicacion.dressCode")}</span><span>{dressCode}</span></div>}
                    {mapUrl && (
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="obs-cta">
                        {tx("invitacion.ubicacion.comoLlegar").toUpperCase()}<span>→</span>
                      </a>
                    )}
                  </div>
                </div>
                <div className="obs-folio obs-folio--chico obs-folio--pie">
                  <span>{[direccion, ciudad].filter(Boolean).join(" · ").toUpperCase()}</span>
                  {!scrollVertical && panelesLugar.length > 1 && <span>{tx("invitacion.portada.desliza").toUpperCase()} →</span>}
                </div>
              </div>

              {ceremoniaHabilitada && (
                <div id="ceremonia" data-tone="dark" className="obs-panel obs-panel--bg2">
                  <div className="obs-folio">
                    <span>{nCuando} — {ceremoniaTitulo.toUpperCase()}</span><span>{deLugar("ceremonia")}</span>
                  </div>
                  <div className="obs-spread">
                    <div className="obs-pagina">
                      <span className="obs-panel-sub">{tx("invitacion.saveTheDate.observacion")} {deLugar("ceremonia").split(" ")[0]}</span>
                      <h2 className="obs-panel-titulo">{ceremoniaNombre || ceremoniaTitulo}</h2>
                    </div>
                    <div className="obs-ficha obs-ficha--claro">
                      <span className="obs-ficha-coord">{(ceremoniaHora ? `${ceremoniaHora} H` : ceremoniaTitulo).toUpperCase()}</span>
                      {ceremoniaHora && <div className="obs-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{ceremoniaHora} h</span></div>}
                      {ceremoniaDireccion && <div className="obs-linea"><span>{tx("invitacion.ubicacion.direccion")}</span><span>{ceremoniaDireccion}</span></div>}
                    </div>
                  </div>
                  <div className="obs-folio obs-folio--chico obs-folio--pie">
                    <span>{tx("invitacion.ubicacion.ceremoniaCivil").toUpperCase()}</span>
                    {!scrollVertical && <span>{tx("invitacion.portada.desliza").toUpperCase()} →</span>}
                  </div>
                </div>
              )}

              {hayComoLlegar && (
                <div id="location" data-tone="dark" className="obs-panel">
                  <div className="obs-folio">
                    <span>{nCuando} — {tx("invitacion.ubicacion.comoLlegar").toUpperCase()}</span><span>{deLugar("llegar")}</span>
                  </div>
                  <div className="obs-spread">
                    <div className="obs-pagina">
                      <span className="obs-panel-sub">{tx("invitacion.saveTheDate.observacion")} {deLugar("llegar").split(" ")[0]}</span>
                      <h2 className="obs-panel-titulo">{tx("invitacion.ubicacion.comoLlegar")}</h2>
                    </div>
                    <div className="obs-ficha">
                      <span className="obs-ficha-coord">{(ciudad || lugarNombre).toUpperCase()}</span>
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
                        {tx("invitacion.ubicacion.abrirEnMapas").toUpperCase()}<span>→</span>
                      </a>
                    </div>
                  </div>
                  <div className="obs-folio obs-folio--chico obs-folio--pie">
                    <span>{[direccion, ciudad].filter(Boolean).join(" · ").toUpperCase()}</span>
                    {!scrollVertical && <span>{tx("invitacion.portada.desliza").toUpperCase()} →</span>}
                  </div>
                </div>
              )}

              {cronograma.length > 0 && (
                <div id="schedule" data-tone="light" className="obs-panel obs-panel--azul">
                  <div className="obs-folio">
                    <span>{nCuando} — {tx("invitacion.ubicacion.cronograma").toUpperCase()}</span><span>{deLugar("cronograma")}</span>
                  </div>
                  <div className="obs-spread">
                    <div className="obs-pagina">
                      <span className="obs-panel-sub">{tx("invitacion.saveTheDate.observacion")} {deLugar("cronograma").split(" ")[0]}</span>
                      <h2 className="obs-panel-titulo">{tx("invitacion.ubicacion.laNochePasoAPaso").split(",")[0]}</h2>
                    </div>
                    <div className="obs-ficha">
                      <span className="obs-ficha-coord">{hora} H</span>
                      {cronograma.map((item, i) => (
                        <div key={i} className="obs-linea"><span>{item.time || ""}</span><span>{item.title}</span></div>
                      ))}
                    </div>
                  </div>
                  <div className="obs-folio obs-folio--chico obs-folio--pie">
                    <span>{fechaPuntos}</span>
                  </div>
                </div>
              )}
            </div>
            {!scrollVertical && panelesLugar.length > 1 && <Puntos cantidad={panelesLugar.length} />}
          </div>
        </div>

        {/* ── 05 Check-in ────────────────────────────────────────────────
            El registro del observador: pliego azul, la ficha oscura con el
            libro de observadores y el sello REGISTRADO. */}
        {rsvpHabilitado && (
          <section id="rsvp" data-tone="dark" data-screen-label={tx("invitacion.rsvp.confirmar")} className="obs-section obs-checkin">
            <div className="obs-folio obs-folio--tinta">
              <span data-xin="1" data-dist="-40">{nCheckin} — {tx("invitacion.saveTheDate.registro").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nCheckin)}</span>
            </div>
            <div className="obs-spread">
              <div className="obs-pagina">
                <h2 data-xin="1" data-dist="-80" className="obs-h2">
                  {tx("invitacion.rsvp.confirmaLinea1")}<br /><em>{tx("invitacion.rsvp.confirmaLinea2")}</em>
                </h2>
              </div>
              <div data-xin="1" data-delay="160" data-dist="80" className="obs-cupon">
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
            Las placas fotográficas: en negativo hasta que pasan por el
            centro, donde se revelan con su baño de color. */}
        {todasLasFotos.length > 0 && (
          <div
            id="album"
            data-pan="1"
            data-scroll={scrollVertical || hojasDeFotos.length <= 1 ? "vertical" : "lateral"}
            data-screen-label={tx("invitacion.album.titulo")}
            className="obs-pan"
            style={{ "--st-pasos": Math.max(0, hojasDeFotos.length - 1) } as React.CSSProperties}
          >
            <div className="obs-pan-fijo obs-pan-fijo--bg2">
              <div data-strip="1" className="obs-tira">
                {hojasDeFotos.map((hoja, iHoja) => (
                  <div key={iHoja} data-tone="dark" className={`obs-panel obs-panel--album${iHoja % 2 === 1 ? " obs-panel--album-b" : ""}`}>
                    <div className="obs-folio">
                      <span>{nAlbum} — {tx("invitacion.saveTheDate.placas").toUpperCase()}</span>
                      <span>{tx("invitacion.saveTheDate.serie").toUpperCase()} {String(iHoja + 1).padStart(2, "0")} / {String(hojasDeFotos.length).padStart(2, "0")} · {folio(nAlbum)}</span>
                    </div>
                    <h2 className="obs-h2 obs-h2--album">{tx("invitacion.saveTheDate.placas")} <em>{tx("invitacion.saveTheDate.reveladas")}</em></h2>
                    <div className="obs-placas" data-cantidad={hoja.length}>
                      {hoja.map((url, i) => (
                        <div
                          key={i}
                          data-sheet="1"
                          className="obs-placa"
                          role="button"
                          tabIndex={0}
                          onClick={() => setFotoAmpliada(url)}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setFotoAmpliada(url); }}
                          aria-label={tx("invitacion.album.ampliarFoto", { n: i + 1 })}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="" loading="lazy" className="obs-placa-img" />
                          <span data-colorwash="1" className={`obs-bano obs-bano--${(i % 3) + 1}`} aria-hidden="true" />
                          <span data-neg="1" className="obs-negativo" aria-hidden="true" />
                          <span className="obs-placa-n">PL. {String(i + 1).padStart(2, "0")}</span>
                          <span className="obs-placa-nota">{[ciudad, anio].filter(Boolean).join(" · ").toUpperCase()}</span>
                        </div>
                      ))}
                    </div>
                    <div className="obs-folio obs-folio--chico obs-folio--pie">
                      <span>{tx("invitacion.album.fotosSubidas", { n: todasLasFotos.length }).toUpperCase()}</span>
                      {!scrollVertical && hojasDeFotos.length > 1 && <span>{tx("invitacion.portada.desliza").toUpperCase()} →</span>}
                    </div>
                  </div>
                ))}
              </div>
              {!scrollVertical && hojasDeFotos.length > 1 && <Puntos cantidad={hojasDeFotos.length} />}
            </div>
          </div>
        )}

        {/* ── 07 Música ──────────────────────────────────────────────────
            Las frecuencias: cada tema con su dial en mono y el
            ecualizador de seis líneas finas. */}
        {sugerenciaMusicaHabilitada && (
          <section id="songs" data-tone="dark" data-screen-label={tx("invitacion.musica.titulo")} className="obs-section obs-musica">
            <div className="obs-folio">
              <span data-xin="1" data-dist="-40">{nMusica} — {tx("invitacion.saveTheDate.frecuencias").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nMusica)}</span>
            </div>
            <div className="obs-spread">
              <div className="obs-pagina">
                <h2 data-xin="1" data-dist="-80" className="obs-h2">
                  {tituloEnDosLineas(tx("invitacion.sabor.preguntaCancionFaltar"), "obs-italica obs-oro")}
                </h2>
                <div data-xin="1" data-delay="120" className="obs-eq" aria-hidden="true">
                  {[0, 1, 2, 3, 4, 5].map((i) => <span key={i} style={{ animationDelay: `${i * 0.15}s` }} />)}
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
            Fichas de filete fino sobre el azul profundo. */}
        {hayRegalos && (
          <section id="banco" data-tone="dark" data-screen-label={tx("invitacion.regalos.titulo")} className="obs-section obs-regalos">
            <div className="obs-folio">
              <span data-xin="1" data-dist="-40">{nRegalos} — {tx("invitacion.regalos.titulo").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nRegalos)}</span>
            </div>
            <div className="obs-spread">
              <div className="obs-pagina">
                <h2 data-xin="1" data-dist="-80" className="obs-h2">
                  {tx("invitacion.regalos.siQueresLinea1")}<br /><em className="obs-oro">{tx("invitacion.regalos.siQueresLinea2")}</em>
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
                    retraso={160}
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
                    retraso={240}
                    inclinada
                  />
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── 09 Trivia ──────────────────────────────────────────────────
            La trivia astral: el único pliego dorado, con tinta oscura. */}
        {quizHabilitado && (
          <section id="quiz" data-tone="light" data-screen-label="Quiz" className="obs-section obs-quiz">
            <div className="obs-folio obs-folio--tinta">
              <span data-xin="1" data-dist="-40">{nQuiz} — {triviaTitulo.toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{tx("invitacion.saveTheDate.triviaAstral").toUpperCase()} · {folio(nQuiz)}</span>
            </div>
            <div className="obs-spread">
              <TriviaObservatorio
                preguntas={triviaPreguntas}
                invitationId={String(invitation.id ?? "")}
                guestToken={guest?.uniqueToken}
                guestName={nombreInvitado || tx("invitacion.evento.invitado")}
              />
            </div>
          </section>
        )}

        {/* ── 10 Tu pase ─────────────────────────────────────────────────
            El pase del observatorio: talón con texto vertical, el nombre,
            la cúpula (la mesa) en terracota, código de barras y el QR. */}
        <section data-tone="dark" data-screen-label={tx("invitacion.pase.tuPase")} className="obs-section obs-pase">
          <div className="obs-folio">
            <span data-xin="1" data-dist="-40">{nPase} — {tx("invitacion.pase.tuPase").toUpperCase()}</span>
            <span data-xin="1" data-dist="40">{folio(nPase)}</span>
          </div>
          <div className="obs-spread">
            <div data-xin="1" data-dist="-60" className="obs-pagina obs-pagina--ticket">
              <div className="obs-ticket">
                <span className="obs-ticket-troquel" aria-hidden="true" />
                <span className="obs-ticket-talon">Observatorio · {inicialesY} · {diaNum} {mesCorto}</span>
                <div className="obs-ticket-datos">
                  <div className="obs-ticket-etqs"><span>{tx("invitacion.saveTheDate.observador")}</span><span>{tx("invitacion.saveTheDate.cupula")}</span></div>
                  <div className="obs-ticket-fila"><span className="obs-ticket-nombre">{nombreInvitado || titulo}</span><span className="obs-ticket-cupula">{guest?.mesas?.[0] ?? pase}</span></div>
                  <CodigoDeBarras />
                  <span className="obs-ticket-codigo">{codigoDelPase}</span>
                </div>
                <div className="obs-ticket-qr">
                  <QrDeIngreso guest={guest as never} />
                </div>
              </div>
            </div>
            <div className="obs-pagina">
              <div data-xin="1" data-delay="100" className="obs-pase-cabeza">
                <div className="obs-pase-numero">
                  <span className="obs-etq-mono">{tx("invitacion.pase.pase").toUpperCase()} Nº</span>
                  <span>{pase}</span>
                </div>
                {guest?.mesas && guest.mesas.length > 0 && (
                  <div className="obs-pase-mesa">
                    <span className="obs-etq-mono">{tx("invitacion.pase.tuMesa").toUpperCase()}</span>
                    <span>{guest.mesas[0]}</span>
                  </div>
                )}
              </div>
              <div data-xin="1" data-delay="160" className="obs-lineas-pase">
                <div className="obs-linea"><span>{saludaAlInvitado ? tx("invitacion.pase.reservadoPara") : tx("invitacion.evento.invitado")}</span><span>{nombreInvitado || titulo}</span></div>
                {lugaresDelPase > 0 && (
                  <div className="obs-linea"><span>{tx("invitacion.pase.lugares")}</span><span>{lugaresDelPase}</span></div>
                )}
                {guest?.mesas && guest.mesas.length > 0 && (
                  <div className="obs-linea"><span>Sector</span><span>{guest.mesas.join(" · ")}</span></div>
                )}
                <div className="obs-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{fechaPuntos} · {hora} H</span></div>
              </div>
              <div className="obs-info-extra">
                <InfoAdicionalSection invitation={invitation} />
              </div>
            </div>
          </div>
          <div data-xin="1" data-delay="220" className="obs-pase-pie">
            <span className="obs-despedida">{tx("invitacion.saveTheDate.nosVemosBajoLasEstrellas")} — {inicialesY}</span>
            <div className="obs-folio obs-folio--chico obs-folio--colofon">
              <span className="obs-credito"><LogoFooterCredit bgColor="transparent" textColor={PALETA.ink} /></span>
              <span className="obs-replay" role="button" tabIndex={0} onClick={volverAVerla} onKeyDown={(e) => { if (e.key === "Enter") volverAVerla(); }}>
                {tx("invitacion.saveTheDate.volverALaCarta").toUpperCase()} ↺
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* ── Riel de progreso ───────────────────────────────────────────── */}
      <div ref={rielRef} className="obs-riel">
        <span ref={rielTopRef} className="obs-riel-top">{pase}</span>
        <div ref={rielLineaRef} className="obs-riel-linea">
          <span ref={rielBarraRef} className="obs-riel-barra" />
        </div>
        <span ref={rielEtiquetaRef} className="obs-riel-etiqueta">{tx("invitacion.saveTheDate.guardaLaFecha").toUpperCase()}</span>
      </div>

      {/* ── La tapa ─────────────────────────────────────────────────────
          La carta celeste de la fecha: el cielo con estrellas que titilan,
          un cometa que cruza cada tanto, la carta con sus ejes detrás y la
          constelación que se traza sola con la fecha en sus estrellas. Es
          la bienvenida: dice de quién es la fiesta, cuándo, dónde y para
          cuántos. */}
      <div ref={portadaRef} data-tone={TONO} className="obs-portada">
        <div ref={escenaPortadaRef} className="obs-portada-hoja">
          <div className="obs-cielo" aria-hidden="true">
            <svg data-depth="0.4" viewBox="0 0 400 700" preserveAspectRatio="xMidYMid slice" className="obs-estrellas">
              <g fill="currentColor">
                {ESTRELLAS.map(([x, y, r, dur], i) => (
                  <circle key={i} cx={x} cy={y} r={r} className={dur ? "obs-estrella--titila" : undefined} style={dur ? { animationDuration: `${dur}s`, animationDelay: `${(i % 5) * 0.4}s` } : undefined} />
                ))}
              </g>
            </svg>
            <span className="obs-cometa" />
            <svg data-depth="-0.6" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet" className="obs-carta">
              <g fill="none" stroke="currentColor" strokeWidth=".5">
                <circle cx="200" cy="200" r="190" strokeDasharray="2 5" /><circle cx="200" cy="200" r="150" /><circle cx="200" cy="200" r="100" strokeDasharray="1 4" />
                <line x1="200" y1="10" x2="200" y2="390" /><line x1="10" y1="200" x2="390" y2="200" /><line x1="66" y1="66" x2="334" y2="334" /><line x1="334" y1="66" x2="66" y2="334" />
              </g>
              <g className="obs-carta-puntos"><text x="204" y="20">N</text><text x="204" y="388">S</text><text x="14" y="196">O</text><text x="378" y="196">E</text></g>
            </svg>
          </div>

          <div data-cl="1" className="obs-folio obs-folio--tapa">
            <span>{tx("invitacion.saveTheDate.cartaCeleste")} Nº {pase}</span>
            <span>{(ciudad || lugarNombre || kickerDelEvento).toUpperCase()}</span>
          </div>

          <div data-cl="2" className="obs-tapa-centro">
            <div className="obs-constelacion" aria-hidden="true">
              <svg viewBox="0 0 500 200">
                <polyline points="40,140 110,70 190,110 250,40 330,90 400,50 460,130" fill="none" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" opacity=".9" pathLength="1000" className="obs-constelacion-linea" />
                <g className="obs-constelacion-estrellas">
                  <circle cx="40" cy="140" r="3" /><circle cx="110" cy="70" r="4.5" /><circle cx="190" cy="110" r="2.5" /><circle cx="250" cy="40" r="5" /><circle cx="330" cy="90" r="3" /><circle cx="400" cy="50" r="4" /><circle cx="460" cy="130" r="3" />
                </g>
                <g className="obs-constelacion-halos" fill="none" strokeWidth=".8" opacity=".6"><circle cx="110" cy="70" r="9" /><circle cx="250" cy="40" r="11" /><circle cx="400" cy="50" r="8" /></g>
                <g className="obs-constelacion-etqs"><text x="96" y="100">{diaNum}</text><text x="238" y="72">{String(fechaEvento.getMonth() + 1).padStart(2, "0")}</text><text x="378" y="82">{anio}</text><text x="430" y="152">{hora}</text></g>
              </svg>
            </div>
            <span className="obs-tapa-kicker">{tx("invitacion.saveTheDate.bajoElMismoCielo")}</span>
            <h1 ref={cartelRef} className="obs-tapa-nombres" style={{ "--largo": renglonMasLargo } as React.CSSProperties}>
              {saludaAlInvitado ? (
                <span className="obs-tapa-linea"><span data-pieza="1">{nombreInvitado}</span></span>
              ) : (
                <>
                  <span className="obs-tapa-linea"><span data-pieza="1">{nombre1}</span></span>
                  {nombre2 && (
                    <>
                      <span className="obs-tapa-linea obs-tapa-linea--y"><span data-pieza="1" className="obs-tapa-y"><i /><em>{tx("invitacion.rsvp.y")}</em><i /></span></span>
                      <span className="obs-tapa-linea"><span data-pieza="1">{nombre2}</span></span>
                    </>
                  )}
                </>
              )}
            </h1>
            <div className="obs-tapa-datos">
              <span>{lugarNombre || "—"}<br /><span className="obs-oro">{[direccion, ciudad].filter(Boolean).join(" · ")}</span></span>
              <span className="obs-tapa-datos-der">
                {isPersonalized && guest
                  ? <>{tx("invitacion.pase.pase")} Nº {pase}<br /><span className="obs-oro">{lugaresDelPase} {tx(lugaresDelPase === 1 ? "invitacion.bienvenida.persona" : "invitacion.bienvenida.personas")}</span></>
                  : <>{diaSemana} {diaNum} · {mesCorto} · {anio}<br /><span className="obs-oro">{hora} h</span></>}
              </span>
            </div>
          </div>

          <div data-cl="3" className="obs-tapa-pie">
            <p className="obs-tapa-mensaje">
              {saludaAlInvitado
                ? `${tx("invitacion.bienvenida.hola", { nombre: nombreInvitado })}, ${String(invitation.portadaMensaje || tx("invitacion.sabor.mensajeLoContamosNosotros"))}`
                : String(invitation.portadaMensaje || tx("invitacion.sabor.mensajeLoContamosNosotros"))}
            </p>
            <button type="button" onClick={abrir} className="obs-tapa-btn">
              {tx("invitacion.saveTheDate.abrirLaCarta").toUpperCase()}
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

/** El año en números romanos, como en las placas de los observatorios. */
function aRomano(n: number): string {
  const tabla: [number, string][] = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let resto = n;
  let salida = "";
  for (const [valor, letra] of tabla) {
    while (resto >= valor) { salida += letra; resto -= valor; }
  }
  return salida;
}

/**
 * La fase de la luna esa noche, a partir de la luna nueva del 6 de enero de
 * 2000 y el mes sinódico (29,53 días). Devuelve la clave del nombre, el
 * porcentaje iluminado y cuánto correr la sombra del disco (negativo cuando
 * crece, positivo cuando mengua, como en el mockup).
 */
const FASES_DE_LUNA = [
  "invitacion.saveTheDate.lunaNueva", "invitacion.saveTheDate.lunaCreciente", "invitacion.saveTheDate.cuartoCreciente", "invitacion.saveTheDate.crecienteGibosa",
  "invitacion.saveTheDate.lunaLlena", "invitacion.saveTheDate.menguanteGibosa", "invitacion.saveTheDate.cuartoMenguante", "invitacion.saveTheDate.lunaMenguante",
] as const;
function faseLunar(fecha: Date): { clave: (typeof FASES_DE_LUNA)[number]; porcentaje: number; desplazamiento: number } {
  const SINODICO = 29.530588853;
  const referencia = Date.UTC(2000, 0, 6, 18, 14);
  const dias = (fecha.getTime() - referencia) / 86400000;
  const edad = ((dias % SINODICO) + SINODICO) % SINODICO;
  const iluminacion = (1 - Math.cos((2 * Math.PI * edad) / SINODICO)) / 2;
  const crece = edad < SINODICO / 2;
  const indice = edad < 1.85 ? 0 : edad < 7.4 ? 1 : edad < 9.2 ? 2 : edad < 14.8 ? 3 : edad < 16.6 ? 4 : edad < 22.1 ? 5 : edad < 23.9 ? 6 : edad < 27.7 ? 7 : 0;
  const corrimiento = Math.round((2 * iluminacion - 1) * 100);
  return { clave: FASES_DE_LUNA[indice], porcentaje: Math.round(iluminacion * 100), desplazamiento: crece ? -corrimiento : corrimiento };
}

/**
 * El astrolabio del Save the Date: tres anillos, el texto de la fecha
 * girando una vuelta cada 90 s, cuatro puntos orbitando en contra y la
 * fecha adentro con el año en romanos.
 */
function Astrolabio({ arco, dia, mes, anio }: { arco: string; dia: string; mes: string; anio: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 200 200" className="obs-astrolabio-svg" aria-hidden="true">
      <defs><path id={`arc-${id}`} d="M100 100 m -80 0 a 80 80 0 1 1 160 0 a 80 80 0 1 1 -160 0" fill="none" /></defs>
      <g fill="none" stroke="currentColor"><circle cx="100" cy="100" r="96" strokeWidth=".6" /><circle cx="100" cy="100" r="88" strokeWidth=".6" strokeDasharray="1 3" /><circle cx="100" cy="100" r="62" strokeWidth=".8" /></g>
      <g className="obs-astrolabio-arco"><text><textPath href={`#arc-${id}`}>{arco.repeat(3).slice(0, 70)}</textPath></text></g>
      <g className="obs-astrolabio-orbita"><circle cx="100" cy="12" r="2" /><circle cx="188" cy="100" r="1.4" /><circle cx="100" cy="188" r="1.8" /><circle cx="12" cy="100" r="1.2" /></g>
      <text x="100" y="98" textAnchor="middle" className="obs-astrolabio-dia">{dia}</text>
      <text x="100" y="122" textAnchor="middle" className="obs-astrolabio-mes">{mes}</text>
      <text x="100" y="142" textAnchor="middle" className="obs-astrolabio-anio">{anio}</text>
    </svg>
  );
}

/** El código de barras del pase: cuarenta barras. */
function CodigoDeBarras() {
  const barras = [[0, 3], [5, 1], [9, 2], [14, 4], [20, 1], [24, 3], [30, 2], [34, 1], [38, 4], [45, 2], [49, 1], [53, 3], [59, 1], [62, 4], [69, 2], [73, 1], [77, 3], [83, 2], [87, 4], [94, 1], [97, 3], [103, 1], [107, 2], [112, 4], [118, 1], [122, 3], [128, 2], [132, 1], [136, 4], [143, 2], [147, 1], [151, 3], [157, 1], [160, 4], [167, 2], [171, 1], [175, 3], [181, 2], [185, 4], [192, 1], [196, 3]];
  return (
    <svg viewBox="0 0 200 40" preserveAspectRatio="none" className="obs-barras" aria-hidden="true">
      <g fill="currentColor">{barras.map(([x, w]) => <rect key={x} x={x} width={w} height="40" />)}</g>
    </svg>
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
          <span className="obs-cuenta-num"><span key={c.v}>{c.v}</span></span>
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
  /* ── Observatorio ─────────────────────────────────────────────────────
     La carta celeste: Cormorant Garamond fina para nombres y cifras, Jost
     para el texto, IBM Plex Mono para coordenadas y folios. Azul profundo,
     marfil, oro y azul acero; todo con filetes de 0,5-1 px. Estrellas que
     titilan, un cometa, la constelación que se traza sola, el astrolabio
     que gira, la luna de esa noche, el ocular, las órbitas del countdown y
     las placas en negativo. Todo SVG y CSS. */
  .obs-raiz { position: fixed; inset: 0; width: 100%; height: calc(var(--vh, 1vh) * 100); overflow: hidden;
    background: var(--pp-bg); color: var(--pp-ink); font-family: var(--obs-sans), 'Jost', sans-serif;
    --obs-acc3: ${PALETA.acc3}; --obs-linea: color-mix(in srgb, var(--pp-ink) 25%, transparent); --obs-linea-suave: color-mix(in srgb, var(--pp-ink) 20%, transparent); }
  .obs-raiz a { color: inherit; text-decoration: none; }
  .obs-raiz button { font: inherit; }

  .obs-scroller { position: absolute; inset: 0; overflow-y: auto; overflow-x: hidden; opacity: 0;
    transition: opacity 900ms ease 260ms; scrollbar-width: none; }
  .obs-scroller::-webkit-scrollbar { width: 0; height: 0; }

  /* ── El pliego ─────────────────────────────────────────────────────── */
  .obs-section { position: relative; z-index: 1; min-height: calc(var(--vh, 1vh) * 100); box-sizing: border-box; overflow: hidden;
    display: flex; flex-direction: column; gap: 24px;
    padding: 60px max(20px, calc((100% - 1100px) / 2)) 80px; background: var(--pp-bg); color: var(--pp-ink); }
  .obs-std, .obs-frase-seccion, .obs-musica { background: var(--pp-bg2); }
  .obs-std { border-top: 1px solid color-mix(in srgb, var(--pp-ink) 12%, transparent); }

  /* El folio: mono con tracking, en oro. */
  .obs-folio { position: relative; z-index: 1; display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;
    font-family: var(--obs-mono), 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: .18em; text-transform: uppercase; color: var(--pp-acc); }
  .obs-folio--chico { font-size: 10px; letter-spacing: .2em; }
  .obs-folio--tinta { color: inherit; }
  .obs-folio--pie { align-items: center; margin-top: auto; }
  .obs-panel > .obs-folio--pie { color: inherit; opacity: .8; }
  .obs-folio--colofon { align-items: center; border-top: 1px solid color-mix(in srgb, var(--pp-ink) 30%, transparent); padding-top: 12px; }
  .obs-etq-mono { font-family: var(--obs-mono), 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: .24em; text-transform: uppercase; color: var(--pp-acc); display: block; }
  .obs-barra { width: 40%; height: 1px; background: var(--obs-linea); }
  .obs-oro { color: var(--pp-acc); }
  .obs-azul { color: var(--pp-acc2); }
  .obs-italica { font-style: italic; }

  /* El spread: dos páginas; desde 1024 px se abren de verdad. */
  .obs-spread { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 22px; }
  .obs-pagina { display: flex; flex-direction: column; gap: 16px; min-width: 0; }
  @media (min-width: 1024px) {
    .obs-spread { display: grid; grid-template-columns: 1fr 1fr; align-items: center; column-gap: 72px; }
    .obs-spread > * { max-width: 560px; width: 100%; min-width: 0; }
    .obs-spread > *:first-child { justify-self: end; }
    .obs-spread > *:last-child { justify-self: start; }
    .obs-pagina--entera { grid-column: 1 / -1; max-width: none; justify-self: stretch; }
  }

  /* ── Tipos ─────────────────────────────────────────────────────────── */
  .obs-h2, .obs-panel-titulo, .obs-frase, .obs-tapa-nombres { font-family: var(--obs-serif), 'Cormorant Garamond', serif; font-weight: 300; }
  .obs-h2, .obs-panel-titulo { position: relative; z-index: 1; margin: 0; line-height: .98; font-size: clamp(40px, 11vw, 84px); }
  .obs-h2 em { font-weight: 300; }
  .obs-h2--album { font-size: clamp(34px, 9vw, 68px); line-height: 1; }
  .obs-panel-titulo { font-size: clamp(38px, 10vw, 84px); line-height: 1; }
  .obs-panel-sub { font-family: var(--obs-mono), 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: .22em; text-transform: uppercase; color: var(--pp-acc); }
  .obs-parrafo { margin: 0; font-size: 15px; line-height: 1.55; max-width: 40ch; opacity: .85; }
  .obs-cta-linea { align-self: flex-start; display: inline-flex; align-items: center; min-height: 48px; padding: 0 20px; border: 1px solid var(--pp-acc); color: var(--pp-acc);
    font-weight: 500; font-size: 12px; letter-spacing: .2em; text-transform: uppercase; }
  .obs-cta { margin-top: 10px; min-height: 48px; display: flex; align-items: center; justify-content: space-between; padding: 0 16px;
    color: var(--pp-bg); background: var(--pp-acc); font-weight: 500; font-size: 12px; letter-spacing: .2em; text-transform: uppercase; }

  /* ── 01 Guardá la fecha: las efemérides ────────────────────────────── */
  .obs-astrolabio { position: relative; width: min(100%, 420px); aspect-ratio: 1; align-self: center; }
  .obs-astrolabio-svg { position: absolute; inset: 0; overflow: visible; color: var(--pp-acc); }
  .obs-astrolabio-arco { animation: obsGira 90s linear infinite; transform-origin: 100px 100px; }
  .obs-astrolabio-arco text { font-family: var(--obs-mono), 'IBM Plex Mono', monospace; font-size: 8.5px; letter-spacing: 2.6px; fill: var(--pp-acc); }
  .obs-astrolabio-orbita { animation: obsGiraContra 60s linear infinite; transform-origin: 100px 100px; fill: var(--pp-ink); }
  .obs-astrolabio-dia { font-family: var(--obs-serif), 'Cormorant Garamond', serif; font-weight: 300; font-size: 70px; fill: var(--pp-ink); }
  .obs-astrolabio-mes { font-family: var(--obs-serif), 'Cormorant Garamond', serif; font-style: italic; font-size: 20px; letter-spacing: 1px; fill: var(--pp-acc); }
  .obs-astrolabio-anio { font-family: var(--obs-mono), 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 4px; fill: var(--pp-ink); }
  @keyframes obsGira { to { transform: rotate(360deg); } }
  @keyframes obsGiraContra { to { transform: rotate(-360deg); } }
  /* La luna esa noche: un disco marfil con la sombra corrida. */
  .obs-luna { display: grid; grid-template-columns: auto 1fr; gap: 14px; align-items: center; border: 1px solid var(--obs-linea-suave); padding: 14px 16px; }
  .obs-luna-disco { position: relative; width: 48px; height: 48px; border-radius: 50%; background: var(--pp-ink); overflow: hidden; display: block; }
  .obs-luna-disco > span { position: absolute; inset: 0; border-radius: 50%; background: var(--pp-bg2); }
  .obs-luna-texto { display: flex; flex-direction: column; gap: 2px; font-size: 13px; line-height: 1.4; }
  /* El ocular: la foto circular con retícula y viñeta que se abre. */
  .obs-ocular { position: relative; width: 100%; aspect-ratio: 1; align-self: center; max-width: 520px; margin-bottom: 28px; }
  .obs-ocular-lente { position: absolute; inset: 0; border-radius: 50%; overflow: hidden;
    background: repeating-linear-gradient(135deg, #1A2740 0 8px, #142038 8px 16px);
    box-shadow: 0 0 0 1px var(--pp-acc), 0 0 0 12px var(--pp-bg2), 0 0 0 13px var(--obs-linea-suave); }
  .obs-foto-capa { position: absolute; inset: 0; }
  .obs-vineta { position: absolute; inset: 0; z-index: 1; pointer-events: none; background: radial-gradient(circle at 50% 50%, transparent 20%, var(--pp-bg) 60%);
    opacity: calc(.25 + var(--obs-punto, 7.2) * .1042); }
  .obs-reticula { position: absolute; z-index: 2; background: var(--obs-linea); }
  .obs-reticula--v { left: 50%; top: 0; bottom: 0; width: 1px; }
  .obs-reticula--h { top: 50%; left: 0; right: 0; height: 1px; }
  .obs-reticula-centro { position: absolute; z-index: 2; left: 50%; top: 50%; width: 36px; height: 36px; margin: -18px; border-radius: 50%; border: 1px solid color-mix(in srgb, var(--pp-ink) 40%, transparent); }
  .obs-ocular-etq { position: absolute; left: 0; right: 0; bottom: 16%; z-index: 2; text-align: center; font-family: var(--obs-mono), 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: .2em; text-transform: uppercase; }
  .obs-ocular-pie { position: absolute; bottom: -28px; font-family: var(--obs-mono), 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: .18em; text-transform: uppercase; color: var(--pp-acc); }
  .obs-ocular-pie--izq { left: 0; }
  .obs-ocular-pie--der { right: 0; }

  /* ── 02 Falta poco: las órbitas ────────────────────────────────────── */
  .obs-countdown { justify-content: space-between; padding-left: 0; padding-right: 0; }
  .obs-countdown > .obs-folio, .obs-countdown > .obs-spread { margin-left: max(20px, calc((100% - 1100px) / 2)); margin-right: max(20px, calc((100% - 1100px) / 2)); }
  .obs-marquesina { position: relative; z-index: 1; overflow: hidden; padding: 10px 0; white-space: nowrap; border-top: 1px solid var(--obs-linea-suave); border-bottom: 1px solid var(--obs-linea-suave);
    font-family: var(--obs-serif), 'Cormorant Garamond', serif; font-style: italic; font-size: 22px; letter-spacing: .02em; }
  .obs-marquesina-tira { display: flex; width: max-content; animation: obsCorre 18s linear infinite; }
  .obs-marquesina-tira > span { padding-right: 40px; }
  @keyframes obsCorre { to { transform: translate3d(-50%, 0, 0); } }
  /* Cuatro órbitas: anillo fino, anillo punteado dorado que gira (más
     rápido cuanto más chica la unidad) con un punto encima, y la cifra. */
  .obs-cuenta { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; justify-items: center; }
  .obs-cuenta-caja { position: relative; width: min(100%, 240px); aspect-ratio: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; }
  .obs-cuenta-caja::before { content: ""; position: absolute; inset: 0; border-radius: 50%; border: 1px solid var(--obs-linea); }
  .obs-cuenta-caja::after { content: ""; position: absolute; inset: 8%; border-radius: 50%; border: 1px dashed var(--pp-acc); opacity: .6; animation: obsGira 90s linear infinite;
    background: radial-gradient(circle at 50% 0, var(--pp-acc) 0 4px, transparent 4.5px); }
  .obs-cuenta-caja:nth-child(2)::after { animation-duration: 60s; }
  .obs-cuenta-caja:nth-child(3)::after { animation-duration: 40s; }
  .obs-cuenta-caja:nth-child(4)::after { animation-duration: 30s; }
  .obs-cuenta-num { font-family: var(--obs-serif), 'Cormorant Garamond', serif; font-weight: 300; font-size: clamp(56px, 16vw, 96px); line-height: 1; font-variant-numeric: tabular-nums; }
  .obs-cuenta-num > span { display: inline-block; animation: obsCifra 300ms ease; }
  @keyframes obsCifra { from { opacity: .3; transform: translateY(6px); } to { opacity: 1; transform: none; } }
  .obs-cuenta-etq { font-family: var(--obs-mono), 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: .26em; text-transform: uppercase; color: var(--pp-acc); }
  .obs-tarjeta--hoy { display: flex; flex-direction: column; gap: 8px; align-items: center; text-align: center; padding: 20px 0; border-top: 1px solid var(--obs-linea-suave); border-bottom: 1px solid var(--obs-linea-suave); }
  .obs-tarjeta--hoy .obs-tarjeta-kicker { font-family: var(--obs-mono), 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: .26em; text-transform: uppercase; color: var(--pp-acc); }
  .obs-tarjeta--hoy .obs-tarjeta-titulo { font-family: var(--obs-serif), 'Cormorant Garamond', serif; font-weight: 300; font-style: italic; font-size: clamp(36px, 10vw, 72px); line-height: 1; }

  /* ── 03 Unas palabras: la bitácora ─────────────────────────────────── */
  .obs-frase-seccion { justify-content: space-between; gap: 30px; }
  .obs-constelacion-fondo { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; opacity: .5; color: var(--pp-ink); }
  .obs-constelacion-fondo polyline { stroke: var(--pp-acc); }
  .obs-frase { margin: 0; font-size: clamp(30px, 8vw, 64px); line-height: 1.12; max-width: 18ch; }
  .obs-nota { align-self: flex-end; display: flex; align-items: center; gap: 14px; border: 1px solid var(--obs-linea); padding: 14px 18px; max-width: 340px;
    font-size: 13px; line-height: 1.45; animation: obsFlota 5s ease-in-out infinite; }
  .obs-nota-estrella { width: 36px; height: 36px; border-radius: 50%; border: 1px solid var(--pp-acc); flex: 0 0 auto; display: flex; align-items: center; justify-content: center; }
  .obs-nota-estrella > span { width: 6px; height: 6px; border-radius: 50%; background: var(--pp-acc); }
  @keyframes obsFlota { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }

  /* ── 04 Paneles: las coordenadas ───────────────────────────────────── */
  .obs-pan { position: relative; z-index: 1; height: calc(100vh + var(--st-pasos, 2) * 90vh); }
  .obs-pan-fijo { position: sticky; top: 0; height: calc(var(--vh, 1vh) * 100); overflow: hidden; background: var(--pp-bg); }
  .obs-pan-fijo--bg2 { background: var(--pp-bg2); }
  .obs-tira { position: absolute; top: 0; left: 0; height: 100%; display: flex; will-change: transform; }
  .obs-panel { flex: 0 0 100vw; min-width: 0; height: 100%; box-sizing: border-box; position: relative; overflow: hidden;
    display: flex; flex-direction: column; justify-content: space-between; gap: 18px;
    padding: 60px max(20px, calc((100vw - 1100px) / 2)) 92px; background: var(--pp-bg); color: var(--pp-ink); }
  .obs-panel--bg2 { background: var(--pp-bg2); }
  .obs-panel--azul { background: var(--pp-acc2); color: var(--pp-bg); --obs-linea: color-mix(in srgb, var(--pp-bg) 35%, transparent); }
  .obs-panel--azul .obs-folio, .obs-panel--azul .obs-panel-sub { color: var(--pp-bg); }
  .obs-panel--azul .obs-cta { background: var(--pp-bg); color: var(--pp-ink); }
  .obs-panel--azul .obs-ficha-coord { background: var(--pp-acc2); color: var(--pp-bg); }
  .obs-pan[data-scroll="vertical"] { height: auto; }
  .obs-pan[data-scroll="vertical"] .obs-pan-fijo { position: static; height: auto; overflow: visible; }
  .obs-pan[data-scroll="vertical"] .obs-tira { position: static; display: block; width: 100%; transform: none !important; }
  .obs-pan[data-scroll="vertical"] .obs-panel { height: auto; min-height: calc(var(--vh, 1vh) * 100); }
  .obs-ficha { position: relative; border: 1px solid var(--obs-linea); padding: 18px 20px; display: flex; flex-direction: column; gap: 6px; }
  .obs-ficha--claro .obs-cta { background: var(--pp-ink); color: var(--pp-bg); }
  .obs-ficha-coord { position: absolute; right: 14px; top: -7px; padding: 0 8px; background: var(--pp-bg); font-family: var(--obs-mono), 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: .2em; text-transform: uppercase; color: var(--pp-acc); }
  .obs-panel--bg2 .obs-ficha-coord { background: var(--pp-bg2); }
  .obs-linea { display: flex; justify-content: space-between; gap: 14px; padding: 9px 0; border-bottom: 1px solid var(--obs-linea); font-size: 15px; line-height: 1.3; }
  .obs-linea > span:first-child { font-family: var(--obs-mono), 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: .18em; text-transform: uppercase; opacity: .75; flex: 0 0 auto; padding-top: 3px; }
  .obs-linea > span:last-child { text-align: right; font-weight: 500; }
  .obs-mapa { height: 190px; overflow: hidden; border: 1px solid var(--obs-linea); }
  .obs-puntos { position: absolute; left: 0; right: 40px; bottom: 30px; display: flex; gap: 8px; justify-content: center; z-index: 2; }
  .obs-punto { width: 6px; height: 6px; border-radius: 50%; background: currentColor !important; opacity: .3; transition: opacity 300ms ease; display: inline-block; }
  .obs-punto[data-activo="1"] { opacity: 1; }

  /* ── 05 Check-in: el registro del observador ───────────────────────── */
  .obs-checkin { background: var(--pp-acc2) !important; color: var(--pp-bg); }
  .obs-cupon { position: relative; background: var(--pp-bg); color: var(--pp-ink); padding: 22px; display: flex; flex-direction: column; gap: 14px; overflow: hidden; }
  .obs-cupon .obs-tarjeta { position: relative; display: flex; flex-direction: column; gap: 14px; background: transparent; border: 0; padding: 0; transform: none !important; }
  .obs-talon-top { display: flex; justify-content: space-between; align-items: center; gap: 10px; font-family: var(--obs-mono), 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: .2em; text-transform: uppercase;
    padding-bottom: 12px; border-bottom: 1px solid var(--obs-linea-suave); }
  .obs-talon-estado { transition: color 400ms ease; }
  .obs-campo { display: flex; flex-direction: column; gap: 6px; }
  .obs-etiqueta { font-family: var(--obs-mono), 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: .18em; text-transform: uppercase; opacity: .8; }
  .obs-input { min-height: 48px; border: 0; border-bottom: 1px solid var(--pp-ink); border-radius: 0; background: transparent; color: var(--pp-ink);
    font-family: var(--obs-sans), 'Jost', sans-serif; font-size: 15px; padding: 0; outline: none; }
  .obs-contador { display: flex; align-items: center; border-bottom: 1px solid var(--pp-ink); min-height: 48px; }
  .obs-contador button { width: 44px; min-height: 44px; border: 0; background: transparent; color: var(--pp-ink); cursor: pointer; font-size: 22px; line-height: 1; }
  .obs-contador button:disabled { opacity: .35; cursor: default; }
  .obs-contador > span { flex: 1; text-align: center; font-family: var(--obs-serif), 'Cormorant Garamond', serif; font-size: 30px; line-height: 1; color: var(--pp-acc); }
  .obs-filas { display: flex; flex-direction: column; }
  .obs-fila { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 9px 0; border-bottom: 1px solid var(--obs-linea-suave); font-size: 14px; }
  .obs-fila--ultima { border-bottom: 0; }
  .obs-fila-valor { text-align: right; font-weight: 500; }
  .obs-precio { display: flex; justify-content: space-between; gap: 12px; font-family: var(--obs-mono), 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: .12em; text-transform: uppercase; opacity: .8; }
  .obs-precio-valor { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; opacity: 1; }
  .obs-precio-total { font-family: var(--obs-serif), 'Cormorant Garamond', serif; font-size: 24px; line-height: 1; letter-spacing: 0; color: var(--pp-acc); }
  .obs-precio-detalle { font-size: 10px; letter-spacing: .1em; }
  .obs-btn-solido { min-height: 54px; border: 0; background: var(--pp-acc); color: var(--pp-bg); cursor: pointer;
    font-weight: 500; font-size: 13px; letter-spacing: .22em; text-transform: uppercase; padding: 0 18px; transition: background 200ms ease; }
  @media (hover: hover) { .obs-btn-solido:hover { background: var(--pp-ink); } }
  .obs-btn-solido:disabled { opacity: .6; cursor: default; }
  .obs-btn-fantasma { min-height: 48px; border: 1px solid var(--pp-acc); background: transparent; color: var(--pp-ink); cursor: pointer;
    font-weight: 500; font-size: 12px; letter-spacing: .16em; text-transform: uppercase; padding: 0 18px; }
  .obs-error { margin: 0; font-family: var(--obs-mono), 'IBM Plex Mono', monospace; font-size: 11px; color: var(--pp-acc); }
  /* El sello REGISTRADO: dos anillos finos, arriba a la derecha. */
  .obs-cupon .obs-sello { position: absolute; right: 14px; top: 46px; width: 120px; aspect-ratio: 1; border-radius: 50%; pointer-events: none;
    opacity: 0; transform: scale(1.8); border: 1px solid var(--pp-acc); box-sizing: border-box;
    display: flex; align-items: center; justify-content: center; text-align: center; padding: 22px;
    font-family: var(--obs-mono), 'IBM Plex Mono', monospace; font-size: 7px; letter-spacing: .16em; text-transform: uppercase; color: var(--pp-acc); }
  .obs-cupon .obs-sello::before { content: ""; position: absolute; inset: 26%; border-radius: 50%; border: 1px dashed var(--pp-acc); }
  .obs-cupon .obs-sello::after { content: ""; position: absolute; left: 50%; top: 50%; width: 6px; height: 6px; margin: -3px; border-radius: 50%; background: var(--pp-acc); }
  .obs-petalos { display: none; }

  /* ── 06 Álbum: las placas ──────────────────────────────────────────── */
  .obs-panel--album { background: var(--pp-bg2); justify-content: flex-start; gap: 14px; }
  .obs-panel--album-b { background: var(--pp-bg); }
  .obs-placas { flex: 1; min-height: 0; display: grid; grid-template-columns: repeat(6, 1fr); grid-template-rows: repeat(3, 1fr); gap: 10px; max-width: 900px; }
  .obs-placa { position: relative; min-height: 0; overflow: hidden; cursor: pointer; border: 1px solid color-mix(in srgb, var(--pp-ink) 30%, transparent);
    background: repeating-linear-gradient(135deg, #1A2740 0 8px, #142038 8px 16px); }
  .obs-placa-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
  .obs-bano { position: absolute; inset: 0; mix-blend-mode: screen; opacity: 0; transition: opacity 200ms linear; }
  .obs-bano--1 { background: color-mix(in srgb, var(--pp-acc) 35%, transparent); }
  .obs-bano--2 { background: color-mix(in srgb, var(--pp-acc2) 40%, transparent); }
  .obs-bano--3 { background: color-mix(in srgb, var(--obs-acc3) 35%, transparent); }
  /* El negativo: una capa marfil en "difference" que el motor apaga cuando
     la placa llega al centro. */
  .obs-negativo { position: absolute; inset: 0; background: var(--pp-ink); mix-blend-mode: difference; opacity: .18; transition: opacity 300ms linear; }
  .obs-placa-n { position: absolute; left: 8px; top: 6px; z-index: 1; font-family: var(--obs-mono), 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: .18em; color: var(--pp-acc); }
  .obs-placa-nota { position: absolute; left: 8px; bottom: 6px; z-index: 1; font-family: var(--obs-mono), 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: .14em; opacity: .85; }
  .obs-placas[data-cantidad="5"] .obs-placa:nth-child(1) { grid-column: 1 / 4; grid-row: 1 / 3; }
  .obs-placas[data-cantidad="5"] .obs-placa:nth-child(2) { grid-column: 4 / 7; grid-row: 1 / 2; }
  .obs-placas[data-cantidad="5"] .obs-placa:nth-child(3) { grid-column: 4 / 6; grid-row: 2 / 3; }
  .obs-placas[data-cantidad="5"] .obs-placa:nth-child(4) { grid-column: 6 / 7; grid-row: 2 / 3; }
  .obs-placas[data-cantidad="5"] .obs-placa:nth-child(5) { grid-column: 1 / 7; grid-row: 3 / 4; }
  .obs-placas[data-cantidad="4"] .obs-placa:nth-child(1) { grid-column: 1 / 4; grid-row: 1 / 3; }
  .obs-placas[data-cantidad="4"] .obs-placa:nth-child(2) { grid-column: 4 / 7; grid-row: 1 / 2; }
  .obs-placas[data-cantidad="4"] .obs-placa:nth-child(3) { grid-column: 4 / 7; grid-row: 2 / 3; }
  .obs-placas[data-cantidad="4"] .obs-placa:nth-child(4) { grid-column: 1 / 7; grid-row: 3 / 4; }
  .obs-placas[data-cantidad="3"] .obs-placa:nth-child(1) { grid-column: 1 / 4; grid-row: 1 / 4; }
  .obs-placas[data-cantidad="3"] .obs-placa:nth-child(2) { grid-column: 4 / 7; grid-row: 1 / 3; }
  .obs-placas[data-cantidad="3"] .obs-placa:nth-child(3) { grid-column: 4 / 7; grid-row: 3 / 4; }
  .obs-placas[data-cantidad="2"] .obs-placa:nth-child(1) { grid-column: 1 / 4; grid-row: 1 / 4; }
  .obs-placas[data-cantidad="2"] .obs-placa:nth-child(2) { grid-column: 4 / 7; grid-row: 1 / 4; }
  .obs-placas[data-cantidad="1"] .obs-placa:nth-child(1) { grid-column: 1 / 7; grid-row: 1 / 4; }

  /* ── 07 Música: las frecuencias ────────────────────────────────────── */
  .obs-eq { display: flex; align-items: flex-end; gap: 5px; height: 36px; }
  .obs-eq span { width: 2px; height: 100%; background: var(--pp-ink); transform-origin: bottom; animation: obsEq 1.2s ease-in-out infinite; }
  .obs-eq span:nth-child(1), .obs-eq span:nth-child(5) { background: var(--pp-acc); }
  .obs-eq span:nth-child(3), .obs-eq span:nth-child(6) { background: var(--pp-acc2); }
  @keyframes obsEq { 0%, 100% { transform: scaleY(.3); } 50% { transform: scaleY(1); } }
  .obs-musica form.obs-tarjeta { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; transform: none !important; }
  .obs-musica .obs-etiqueta { display: none; }
  .obs-musica .obs-input { min-height: 48px; border: 1px solid color-mix(in srgb, var(--pp-ink) 40%, transparent); background: transparent; color: var(--pp-ink); padding: 0 14px; min-width: 0; }
  .obs-musica .obs-error { grid-column: 1 / -1; }
  .obs-musica .obs-btn-solido { grid-column: 1 / -1; min-height: 50px; border: 1px solid var(--pp-acc); font-size: 12px; }
  @media (hover: hover) { .obs-musica .obs-btn-solido:hover { background: transparent; color: var(--pp-acc); } }
  .obs-lista { display: flex; flex-direction: column; margin-top: 12px; counter-reset: tema; }
  .obs-lista-fila { display: flex; align-items: center; gap: 14px; padding: 12px 0; border-bottom: 1px solid var(--obs-linea-suave); counter-increment: tema; }
  .obs-lista-fila::before { content: "8" counter(tema) ".7"; font-family: var(--obs-mono), 'IBM Plex Mono', monospace; font-size: 10px; color: var(--pp-acc); letter-spacing: .1em; flex: 0 0 auto; }
  .obs-lista-texto { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .obs-lista-tema { font-family: var(--obs-serif), 'Cormorant Garamond', serif; font-size: 22px; line-height: 1.05; }
  .obs-lista-quien { font-size: 12px; letter-spacing: .08em; text-transform: uppercase; opacity: .7; }

  /* ── 08 Regalos ────────────────────────────────────────────────────── */
  .obs-tarjeta--banco { --obs-neon: var(--pp-acc); position: relative; z-index: 1; border: 1px solid var(--obs-linea); background: var(--pp-bg2); padding: 18px 20px;
    display: flex; flex-direction: column; gap: 10px; transform: none !important; }
  .obs-tarjeta--der { --obs-neon: var(--pp-acc2); }
  .obs-tarjeta--banco + .obs-tarjeta--banco { margin-top: 14px; }
  .obs-tarjeta-kicker { font-family: var(--obs-mono), 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: .2em; text-transform: uppercase; color: var(--obs-neon); }
  .obs-tarjeta-mensaje { margin: 0; font-size: 14px; line-height: 1.55; opacity: .85; }
  .obs-fila-texto { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .obs-fila-etq { font-family: var(--obs-mono), 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: .2em; text-transform: uppercase; opacity: .7; }
  .obs-fila-dato { font-family: var(--obs-mono), 'IBM Plex Mono', monospace; font-size: 13px; overflow-wrap: anywhere; }
  .obs-fila--copiable:first-child { border-bottom: 1px solid var(--obs-linea-suave); }
  .obs-fila--copiable:first-child .obs-fila-dato { font-family: var(--obs-serif), 'Cormorant Garamond', serif; font-size: 24px; line-height: 1.05; color: var(--obs-neon); }
  .obs-tarjeta--banco .obs-fila--ultima { border-bottom: 0; font-size: 12px; letter-spacing: .08em; text-transform: uppercase; opacity: .7; }
  .obs-btn-copiar { flex: 0 0 auto; min-height: 44px; padding: 0 14px; border: 1px solid color-mix(in srgb, var(--pp-ink) 40%, transparent); background: transparent; color: var(--pp-ink); cursor: pointer;
    font-weight: 500; font-size: 11px; letter-spacing: .16em; text-transform: uppercase; }
  .obs-btn-copiar--hecho { background: var(--pp-ink); color: var(--pp-bg); }

  /* ── 09 Trivia: la trivia astral ───────────────────────────────────── */
  .obs-quiz { background: var(--pp-acc) !important; color: var(--pp-bg); }
  .obs-quiz .obs-tarjeta { display: flex; flex-direction: column; gap: 12px; transform: none !important; }
  .obs-quiz .obs-tarjeta-kicker { align-self: flex-start; border: 1px solid var(--pp-bg); color: var(--pp-bg); font-family: var(--obs-mono), 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: .2em; text-transform: uppercase; padding: 8px 14px; }
  .obs-quiz .obs-tarjeta-pregunta, .obs-quiz .obs-tarjeta-titulo { font-family: var(--obs-serif), 'Cormorant Garamond', serif; font-weight: 300; font-size: clamp(30px, 8vw, 64px); line-height: 1.05; max-width: 15ch; }
  .obs-quiz .obs-tarjeta-mensaje { margin: 0; font-size: 15px; }
  .obs-opciones { display: flex; flex-direction: column; gap: 10px; counter-reset: opcion; }
  .obs-opcion { min-height: 54px; border: 1px solid var(--pp-bg); background: transparent; color: var(--pp-bg); cursor: pointer; counter-increment: opcion;
    font-family: var(--obs-sans), 'Jost', sans-serif; font-weight: 500; font-size: 15px; text-align: left; padding: 0 18px;
    display: flex; justify-content: space-between; align-items: center; gap: 12px; transition: background 200ms ease, color 200ms ease; }
  .obs-opcion::after { content: counter(opcion, upper-alpha); font-family: var(--obs-mono), 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: .14em; text-transform: uppercase; }
  .obs-opcion--bien { background: var(--pp-bg); color: var(--pp-ink); }
  .obs-opcion--bien::after { content: "Correcta"; }
  .obs-opcion--mal { background: var(--obs-acc3); color: var(--pp-ink); }
  .obs-opcion--mal::after { content: "Casi"; }
  @media (min-width: 1024px) {
    .obs-quiz .obs-spread > .obs-tarjeta { grid-column: 1 / -1; max-width: none; justify-self: stretch; display: grid; grid-template-columns: 1fr 1fr; column-gap: 72px; align-items: center; }
    .obs-quiz .obs-tarjeta-kicker { grid-column: 1; justify-self: end; margin-right: auto; }
    .obs-quiz .obs-tarjeta-pregunta { grid-column: 1; max-width: 560px; justify-self: end; width: 100%; }
    .obs-quiz .obs-opciones { grid-column: 2; grid-row: 1 / span 2; max-width: 560px; width: 100%; }
  }

  /* ── 10 Tu pase: el pase del observatorio ──────────────────────────── */
  .obs-pase { justify-content: space-between; padding-bottom: calc(28px + env(safe-area-inset-bottom)); }
  .obs-pagina--ticket { align-items: flex-start; }
  .obs-ticket { position: relative; width: 100%; max-width: 420px; background: var(--pp-ink); color: var(--pp-bg); padding: 18px 18px 18px 46px; box-sizing: border-box;
    display: grid; grid-template-columns: 1fr auto; gap: 14px; align-items: center; margin-bottom: 20px; }
  .obs-ticket-troquel { position: absolute; left: 32px; top: 0; bottom: 0; border-left: 1px dashed var(--pp-bg); opacity: .5; }
  .obs-ticket-talon { position: absolute; left: 0; top: 0; bottom: 0; width: 32px; display: flex; align-items: center; justify-content: center;
    writing-mode: vertical-rl; transform: rotate(180deg); font-family: var(--obs-mono), 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: .3em; text-transform: uppercase; }
  .obs-ticket-datos { display: flex; flex-direction: column; gap: 10px; min-width: 0; }
  .obs-ticket-etqs { display: flex; justify-content: space-between; gap: 8px; font-family: var(--obs-mono), 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: .2em; text-transform: uppercase; }
  .obs-ticket-fila { display: flex; justify-content: space-between; gap: 8px; align-items: baseline; }
  .obs-ticket-nombre { font-family: var(--obs-serif), 'Cormorant Garamond', serif; font-size: clamp(20px, 5.4vw, 26px); line-height: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .obs-ticket-cupula { font-family: var(--obs-serif), 'Cormorant Garamond', serif; font-size: clamp(26px, 7vw, 34px); line-height: 1; color: var(--obs-acc3); }
  .obs-barras { width: 100%; height: 36px; display: block; color: var(--pp-bg); }
  .obs-ticket-codigo { font-family: var(--obs-mono), 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: .3em; }
  .obs-ticket-qr { position: relative; width: clamp(96px, 26vw, 130px); aspect-ratio: 1; background: #FFFFFF; padding: 8px; box-sizing: border-box; border: 1px solid var(--pp-bg); }
  .obs-ticket-qr .qr-ingreso, .obs-ticket-qr section { background: transparent !important; border: none !important; padding: 0 !important; }
  .obs-ticket-qr img, .obs-ticket-qr svg, .obs-ticket-qr canvas { width: 100% !important; height: auto !important; display: block; }
  .obs-ticket-qr p, .obs-ticket-qr h3, .obs-ticket-qr h4 { display: none; }
  .obs-pase-cabeza { display: flex; align-items: flex-end; justify-content: space-between; gap: 14px; }
  .obs-pase-numero, .obs-pase-mesa { display: flex; flex-direction: column; }
  .obs-pase-mesa { align-items: flex-end; text-align: right; }
  .obs-pase-numero > span:last-child { font-family: var(--obs-serif), 'Cormorant Garamond', serif; font-weight: 300; font-size: clamp(64px, 19vw, 140px); line-height: .9; }
  .obs-pase-mesa > span:last-child { font-family: var(--obs-serif), 'Cormorant Garamond', serif; font-style: italic; font-weight: 300; font-size: clamp(40px, 12vw, 88px); line-height: .9; color: var(--obs-acc3); }
  .obs-lineas-pase { display: flex; flex-direction: column; border-top: 1px solid color-mix(in srgb, var(--pp-ink) 30%, transparent); }
  .obs-lineas-pase .obs-linea { border-bottom: 1px solid var(--obs-linea-suave); font-size: 14px; padding: 10px 0; }
  .obs-lineas-pase .obs-linea:last-child { border-bottom: 0; }
  .obs-lineas-pase .obs-linea > span:first-child { color: var(--pp-acc); opacity: 1; letter-spacing: .16em; }
  .obs-lineas-pase .obs-linea > span:last-child { font-weight: 400; line-height: 1.4; }
  .obs-info-extra { margin-top: 4px; }
  .obs-info-extra #info-adicional { background: transparent !important; padding: 0 !important; }
  .obs-info-extra #ia-trigger-btn { background: transparent !important; color: var(--pp-acc) !important; border: 1px solid var(--pp-acc) !important;
    border-radius: 0 !important; font-weight: 500 !important; letter-spacing: .2em !important; text-transform: uppercase; }
  .obs-raiz .ia-icon-box, .obs-raiz svg.lucide { display: none !important; }
  .obs-pase-pie { display: flex; flex-direction: column; gap: 14px; }
  .obs-despedida { font-family: var(--obs-serif), 'Cormorant Garamond', serif; font-style: italic; font-weight: 300; font-size: clamp(26px, 7vw, 44px); line-height: 1.1; }
  .obs-replay { cursor: pointer; color: var(--pp-ink); }
  .obs-credito { display: inline-flex; opacity: .8; }

  /* ── La tapa: la carta celeste ─────────────────────────────────────── */
  .obs-portada { position: absolute; inset: 0; z-index: 5; overflow: hidden; background: var(--pp-bg); color: var(--pp-ink); }
  .obs-portada-hoja { position: absolute; inset: 0; display: grid; grid-template-rows: auto minmax(0, 1fr) auto; box-sizing: border-box;
    padding: calc(18px + env(safe-area-inset-top)) max(20px, calc((100% - 1100px) / 2)) calc(18px + env(safe-area-inset-bottom)); }
  .obs-cielo { position: absolute; inset: 0; pointer-events: none; overflow: hidden; color: var(--pp-ink); }
  .obs-estrellas { position: absolute; inset: -4%; width: 108%; height: 108%; }
  .obs-estrella--titila { animation: obsTitila 3s ease-in-out infinite; }
  @keyframes obsTitila { 0%, 100% { opacity: .35; } 50% { opacity: 1; } }
  /* El cometa: una línea que cruza en 3 s y espera el resto del ciclo. */
  .obs-cometa { position: absolute; left: 0; top: 40%; width: 120px; height: 1px; background: linear-gradient(90deg, transparent, var(--pp-ink)); transform-origin: right;
    rotate: -28deg; opacity: 0; animation: obsCometa 11s ease-out 3s infinite; }
  @keyframes obsCometa { 0% { transform: translate3d(-10vw, 10vh, 0); opacity: 0; } 8% { opacity: 1; } 30% { transform: translate3d(60vw, -30vh, 0); opacity: 0; } 100% { transform: translate3d(60vw, -30vh, 0); opacity: 0; } }
  .obs-carta { position: absolute; left: 50%; top: 50%; width: min(140vw, 120vh, 900px); height: min(140vw, 120vh, 900px); margin-left: calc(min(140vw, 120vh, 900px) / -2); margin-top: calc(min(140vw, 120vh, 900px) / -2); opacity: .35; }
  .obs-carta-puntos text { font-family: var(--obs-mono), 'IBM Plex Mono', monospace; font-size: 7px; letter-spacing: 1.5px; fill: currentColor; }
  .obs-folio--tapa { z-index: 1; }
  .obs-tapa-centro { position: relative; z-index: 1; align-self: center; display: flex; flex-direction: column; align-items: center; gap: 6px; min-height: 0; text-align: center; }
  /* La constelación: se traza sola cuando entra la tapa (la línea de 1000
     de largo se descubre en 1,8 s) y las estrellas aparecen de a una. */
  .obs-constelacion { position: relative; width: min(100%, 520px); aspect-ratio: 5 / 2; margin-bottom: -2vh; color: var(--pp-acc); }
  .obs-constelacion svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
  .obs-constelacion-linea { stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: obsTraza 1800ms cubic-bezier(.2,.7,.2,1) 300ms forwards; }
  @keyframes obsTraza { to { stroke-dashoffset: 0; } }
  .obs-constelacion-estrellas { fill: var(--pp-ink); }
  .obs-constelacion-estrellas circle, .obs-constelacion-halos circle, .obs-constelacion-etqs text { opacity: 0; animation: obsAparece 500ms ease forwards; }
  .obs-constelacion-estrellas circle:nth-child(1) { animation-delay: .6s; } .obs-constelacion-estrellas circle:nth-child(2) { animation-delay: .72s; } .obs-constelacion-estrellas circle:nth-child(3) { animation-delay: .84s; }
  .obs-constelacion-estrellas circle:nth-child(4) { animation-delay: .96s; } .obs-constelacion-estrellas circle:nth-child(5) { animation-delay: 1.08s; } .obs-constelacion-estrellas circle:nth-child(6) { animation-delay: 1.2s; } .obs-constelacion-estrellas circle:nth-child(7) { animation-delay: 1.32s; }
  .obs-constelacion-halos { stroke: var(--pp-acc); }
  .obs-constelacion-halos circle:nth-child(1) { animation-delay: 1.44s; } .obs-constelacion-halos circle:nth-child(2) { animation-delay: 1.56s; } .obs-constelacion-halos circle:nth-child(3) { animation-delay: 1.68s; }
  .obs-constelacion-etqs text { font-family: var(--obs-mono), 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 1.5px; fill: var(--pp-acc); }
  .obs-constelacion-etqs text:nth-child(1) { animation-delay: 1.8s; } .obs-constelacion-etqs text:nth-child(2) { animation-delay: 1.92s; } .obs-constelacion-etqs text:nth-child(3) { animation-delay: 2.04s; } .obs-constelacion-etqs text:nth-child(4) { animation-delay: 2.16s; }
  @keyframes obsAparece { to { opacity: 1; } }
  .obs-tapa-kicker { font-family: var(--obs-mono), 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: .26em; text-transform: uppercase; color: var(--pp-acc); }
  /* El nombre: Cormorant 300 centrado; el renglón más largo manda el cuerpo. */
  .obs-tapa-nombres { margin: 0; line-height: .95; letter-spacing: -.01em; display: flex; flex-direction: column; align-items: center;
    font-size: min(clamp(48px, 16vw, 140px), 13vh, calc((100vw - 60px) / (var(--largo, 9) * 0.48))); }
  @media (min-width: 1024px) { .obs-tapa-nombres { font-size: min(11vw, 150px, 13vh, calc((min(100vw, 1100px) - 60px) / (var(--largo, 9) * 0.48))); } }
  .obs-tapa-linea { overflow: hidden; display: block; white-space: nowrap; }
  .obs-tapa-linea > span { display: block; }
  .obs-tapa-linea--y { font-size: .34em; line-height: 1.6; }
  .obs-tapa-y { display: inline-flex !important; align-items: center; gap: .6em; font-style: italic; color: var(--pp-acc); }
  .obs-tapa-y > i { width: 2em; height: 1px; background: var(--pp-acc); }
  .obs-tapa-y > em { font-weight: 300; }
  .obs-tapa-datos { display: flex; justify-content: space-between; align-items: flex-end; gap: 14px; width: 100%; max-width: 520px; box-sizing: border-box;
    font-size: 13px; line-height: 1.4; text-align: left; font-weight: 500; border-top: 1px solid var(--obs-linea); padding-top: 10px; margin-top: 6px; }
  .obs-tapa-datos-der { text-align: right; }
  .obs-tapa-pie { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 14px; align-items: center; text-align: center; }
  .obs-tapa-mensaje { margin: 0; font-family: var(--obs-serif), 'Cormorant Garamond', serif; font-style: italic; font-weight: 400; font-size: clamp(18px, 4.6vw, 24px); line-height: 1.35; max-width: 34ch; }
  .obs-tapa-btn { min-height: 54px; width: 100%; max-width: 360px; border: 1px solid var(--pp-acc); background: transparent; color: var(--pp-acc); cursor: pointer;
    font-weight: 500; font-size: 13px; letter-spacing: .22em; text-transform: uppercase; padding: 0 22px; transition: background 200ms ease, color 200ms ease; }
  @media (hover: hover) { .obs-tapa-btn:hover { background: var(--pp-acc); color: var(--pp-bg); } }

  /* ── Riel, pista y lupa ────────────────────────────────────────────── */
  .obs-riel { position: absolute; right: 0; top: 0; bottom: 0; width: 40px; z-index: 4; display: flex; flex-direction: column;
    align-items: center; justify-content: space-between; padding: calc(16px + env(safe-area-inset-top)) 0 calc(16px + env(safe-area-inset-bottom));
    opacity: 0; transition: opacity 600ms ease; pointer-events: none; color: var(--pp-ink); border-left: 1px solid var(--obs-linea) !important; }
  .obs-riel-top { writing-mode: vertical-rl; font-family: var(--obs-mono), 'IBM Plex Mono', monospace; font-size: 11px; color: var(--pp-ink) !important; }
  .obs-riel-etiqueta { writing-mode: vertical-rl; font-family: var(--obs-mono), 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: .26em; text-transform: uppercase; color: var(--pp-ink); }
  .obs-riel-linea { flex: 1; width: 1px; margin: 16px 0; background: transparent !important; position: relative; }
  .obs-riel-barra { position: absolute; left: -1px; top: 0; width: 2px; height: 0%; background: var(--pp-acc); transition: height 200ms linear; display: block; }
  .obs-pista { position: absolute; left: 0; right: 40px; bottom: calc(18px + env(safe-area-inset-bottom)); z-index: 6; text-align: center;
    font-family: var(--obs-mono), 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: .28em; color: var(--pp-acc);
    opacity: 0; transition: opacity 600ms ease; pointer-events: none; animation: obsPista 2.4s ease-in-out infinite; }
  @keyframes obsPista { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(6px); } }

  .obs-lupa { position: fixed; inset: 0; z-index: 200; background: color-mix(in srgb, var(--pp-bg) 94%, transparent);
    display: flex; align-items: center; justify-content: center; padding: 24px; cursor: zoom-out; }
  .obs-lupa-cerrar { position: absolute; top: 20px; right: 20px; width: 40px; height: 40px; border: 1px solid var(--pp-acc); border-radius: 50%;
    background: transparent; color: var(--pp-acc); font-size: 18px; line-height: 1; cursor: pointer; }
  .obs-lupa-img { max-width: 100%; max-height: 88vh; object-fit: contain; cursor: default; border: 1px solid var(--pp-acc); }

  @media (prefers-reduced-motion: reduce) {
    .obs-raiz * { animation: none !important; }
    .obs-scroller [data-xin] { opacity: 1 !important; transform: none !important; }
    .obs-ocular { --obs-punto: 0; }
    .obs-constelacion-linea { stroke-dashoffset: 0; }
    .obs-constelacion-estrellas circle, .obs-constelacion-halos circle, .obs-constelacion-etqs text { opacity: 1; }
    .obs-cometa { display: none; }
  }
`;
