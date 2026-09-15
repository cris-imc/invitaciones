"use client";

// GENERADO por scripts/gen-iconic-variants.js a partir de
// CoutureTemplate.tsx — no editar a mano: los cambios se pierden al regenerar.

/**
 * COUTURE · Colección Iconic — sub-colección "Tipográfica Editorial"
 * Variante: Burdeos.
 *
 * GENERADO por scripts/derivar-tipografica.js a partir de
 * EditorialBlancNoirTemplate.tsx — no editar a mano: el motor se arregla en
 * Editorial Blanc & Noir; el render en scripts/jsx/tipografica/cou.jsx, los
 * estilos en scripts/css/tipografica/cou.css y las caras y la paleta en
 * scripts/familias/tipografica/cou.json.
 *
 * La revista de moda: Bodoni Moda en cuerpos de tapa, Space Grotesk en
 * versalitas con tracking, filetes de 1 px y el color en una sola palabra
 * por página. Tapa con masthead, foto, recuadro de edición, sello del pase
 * y código de barras; sumario, countdown en renglones, cita destacada,
 * pasarela, tarjeta de suscripción, sesión de tapa, tracklist y contratapa.
 *
 * Sin imágenes propias: son fuentes y CSS.
 */

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Bodoni_Moda, Space_Grotesk } from "next/font/google";
import { LogoFooterCredit } from "@/components/ui/Logo";
import { AddToCalendarLink } from "@/components/invitation/AddToCalendarLink";
import { AnimatedCoverPhoto, COVER_RESPONSIVE_STYLE } from "@/components/invitation/v2/AnimatedCoverPhoto";
import { InfoAdicionalSection } from "@/components/invitation/v2/InfoAdicionalSection";
import { useMusicPlayer, MusicToggleButton } from "@/components/invitation/MusicPlayer";
import { BurbujaPase } from "@/components/templates/BurbujaPase";
import { QrDeIngreso } from "@/components/invitation/QrDeIngreso";
import { PostEventoStorytelling, useEstadoDelEvento } from "@/components/invitation/PostEventoStorytelling";
import { useCountdown, pad } from "@/components/invitation/v2/useCountdown";
import { useTextos, useFormatoDeMoneda } from "@/components/i18n/ProveedorIdioma";
import { toEmbedMapUrl } from "@/lib/google-maps";
import { esVistaMiniatura } from "@/lib/miniatura";

const couSerif = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--cou-serif",
});
const couSans = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--cou-sans",
});
// El mono es la ficha técnica de la revista: folios, kickers y datos.

// ─── Paleta ─────────────────────────────────────────────────────────────────
// Las cinco variantes de "Capas de papel" cambian SOLO estos once colores
// (el script de variantes reemplaza este bloque entero, ver
// scripts/gen-capas-de-papel-variants.js). El dibujo es el mismo: los SVG de
// las escenas leen var(--pp-…), así que un cambio acá repinta cerros, cielo,
// sol y figuras de una sola vez.
const PALETA = {
  bg: "#FAF6F3",
  bg2: "#F1E9E4",
  ink: "#0B0B0B",
  ink2: "#6E6262",
  acc: "#7A1E2C",
  acc2: "#B8862B",
  sky1: "#FAF6F3",
  sky2: "#F1E9E4",
  hill1: "#F1E9E4",
  hill2: "#6E6262",
  hill3: "#0B0B0B",
  night: "#0B0B0B",
  nightInk: "#FAF6F3",
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

interface CoutureTemplateProps {
  invitation: Record<string, unknown>;
  guest?: GuestRecord | null;
  isPersonalized?: boolean;
}

/** El número de pase, con tres cifras como en el mockup ("PASE Nº 042"). */
function numeroDePase(orderNumber: number | undefined): string {
  return String(orderNumber ?? 42).padStart(3, "0");
}

export function CoutureTemplateBurdeos({ invitation, guest, isPersonalized = false }: CoutureTemplateProps) {
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
      el.style.setProperty("--cou-y", `${dist}px`);
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
            el.style.setProperty("--cou-y", "0px");
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
            ven.style.setProperty("--cou-punto", (7.2 * (1 - t)).toFixed(2));
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
          clase: `${couSerif.variable} ${couSans.variable}`,
          fuente: "var(--cou-sans), 'Space Grotesk', sans-serif",
        }}
      />
    );
  }


  // El total de pliegos, para los folios ("03 / 10"). Se cuenta lo que esta
  // invitación realmente tiene: si no hay trivia, no existe el pliego 09 y el
  // pase deja de ser 10 de 10.
  const totalPliegos = cuenta;
  const folio = (n: string) => `${n} / ${String(totalPliegos).padStart(2, "0")}`;

  // El masthead: una línea por nombre, la segunda alineada a la derecha con
  // el "&" chico en itálica y en el acento. El renglón más largo manda el
  // cuerpo, porque una didona no se parte.
  const renglones = saludaAlInvitado ? [nombreInvitado] : [nombre1, ...(nombre2 ? [nombre2] : [])];
  const renglonMasLargo = Math.max(5, ...renglones.map((n) => n.length));
  const totalLetras = Math.max(1, renglones.join("").replace(/\s/g, "").length);

  // La frase: el medio en itálica y en el acento, el cierre subrayado con un
  // filete de 3 px -- como una cita destacada de revista.
  const tonoDePalabra = (i: number) => {
    const n = palabras.length;
    if (i >= Math.ceil(n * 0.7)) return "cou-subrayado";
    if (i >= Math.floor(n * 0.25) && i < desdeAcento) return "cou-acento";
    return undefined;
  };

  const kickerDelEvento = tx(invitation.tipo === "CASAMIENTO" ? "invitacion.evento.nosCasamos" : invitation.tipo === "QUINCE_ANOS" ? "invitacion.evento.misQuinceAnos" : "invitacion.evento.teInvitamos");
  const mesCorto = mesLargo.slice(0, 3);
  const fechaCodigo = `${anio} ${String(fechaEvento.getMonth() + 1).padStart(2, "0")} ${String(fechaEvento.getDate()).padStart(2, "0")} ${pase}`;

  // El sumario de la tapa interior: los pliegos que esta invitación tiene.
  const sumario = [
    { n: nSaveTheDate, t: tx("invitacion.saveTheDate.guardaLaFecha"), p: `${diaSemana.toLowerCase()} ${diaNum} ${tx("invitacion.evento.de")} ${mesLargo}` },
    { n: nCuando, t: tx("invitacion.ubicacion.cuandoYDonde"), p: lugarNombre || ciudad },
    ...(nCheckin ? [{ n: nCheckin, t: "Check-in", p: tx("invitacion.rsvp.confirmar") }] : []),
    { n: nPase, t: tx("invitacion.pase.tuPase"), p: guest?.mesas?.length ? `QR · ${tx("invitacion.pase.tuMesa")} ${guest.mesas[0]}` : "QR" },
  ];

  return (
    <div
      ref={raizRef}
      className={`${couSerif.variable} ${couSans.variable} cou-raiz`}
      style={varsDePaleta}
    >
      <style>{CSS_COU}</style>
      <style>{COVER_RESPONSIVE_STYLE}</style>

      <div ref={scrollerRef} className="cou-scroller">
        {/* ── 01 Guardá la fecha ─────────────────────────────────────────
            El sumario: el día enorme, el mes en itálica y en el acento, el
            índice de pliegos con filetes y la foto con su pie de foto. */}
        <section data-tone="light" data-screen-label={tx("invitacion.saveTheDate.guardaLaFecha")} className="cou-section cou-std">
          <div className="cou-folio">
            <span data-xin="1" data-dist="-40">{nSaveTheDate} — {tx("invitacion.saveTheDate.guardaLaFecha").toUpperCase()}</span>
            <span data-xin="1" data-dist="40">SUMARIO · {folio(nSaveTheDate)}</span>
          </div>
          <div className="cou-spread">
            <div className="cou-pagina">
              <div className="cou-fecha">
                <span data-xin="1" data-dist="-160" className="cou-fecha-dia">{diaNum}</span>
                <div className="cou-fecha-columna">
                  <span data-xin="1" data-dist="160" data-delay="120" className="cou-fecha-mes">{mesLargo}</span>
                  <span data-xin="1" data-dist="160" data-delay="240" className="cou-fecha-anio">{anio}</span>
                  <span data-xin="1" data-delay="360" className="cou-fecha-pie">{diaSemana} · {hora} H</span>
                </div>
              </div>
              <div data-xin="1" data-delay="400" className="cou-sumario">
                {sumario.map((s) => (
                  <div key={s.n} className="cou-sumario-fila">
                    <span><span className="cou-sumario-n">{s.n}</span><span className="cou-sumario-t">{s.t}</span></span>
                    <span className="cou-sumario-p">{s.p}</span>
                  </div>
                ))}
              </div>
              <AddToCalendarLink
                eventName={titulo}
                targetDate={fechaHora}
                location={[lugarNombre, direccion].filter(Boolean).join(", ")}
                className="cou-cta cou-cta--chico"
                showIcon={false}
              >
                {tx("invitacion.saveTheDate.agregarAlCalendario").toUpperCase()} <span className="cou-cta-flecha">↗</span>
              </AddToCalendarLink>
            </div>

            {hayFoto && (
              <div ref={ventanaRef} data-xin="1" data-delay="200" data-dist="0" className="cou-foto">
                {fotoMobile && (
                  <div className="acp-mobile-only cou-foto-capa">
                    <AnimatedCoverPhoto photoSrc={fotoMobile} tint={false} effect="enfoque" scrimColorRgb="11,11,11" />
                  </div>
                )}
                {fotoDesktop && (
                  <div className="acp-desktop-only cou-foto-capa">
                    <AnimatedCoverPhoto photoSrc={fotoDesktop} tint={false} effect="enfoque" scrimColorRgb="11,11,11" />
                  </div>
                )}
                {/* La trama que tapa la foto y se disuelve al subir: el radio
                    del punto lo mueve el motor en --cou-punto. */}
                <span className="cou-foto-revelado" aria-hidden="true" />
                <span className="cou-foto-etq">{tx("invitacion.album.nuestraFoto").toUpperCase()}</span>
                <span className="cou-foto-pie">{[lugarNombre, ciudad].filter(Boolean).join(", ")}</span>
              </div>
            )}
          </div>
        </section>

        {/* ── 02 Falta poco ──────────────────────────────────────────────
            Pliego de tinta: cuatro renglones -- la etiqueta, una línea de
            puntos y la cifra -- y una marquesina en itálica abajo. */}
        <section data-tone="dark" data-screen-label={tx("invitacion.cuentaRegresiva.kicker")} className="cou-section cou-countdown">
          <div className="cou-folio">
            <span data-xin="1" data-dist="-40">{nCountdown} — {tx("invitacion.cuentaRegresiva.faltan").toUpperCase()}</span>
            <span data-xin="1" data-dist="40">{folio(nCountdown)}</span>
          </div>
          <div className="cou-spread">
            <div className="cou-pagina cou-pagina--entera">
              <CuentaCouture targetDate={fechaHora} />
            </div>
          </div>
          <div className="cou-marquesina" aria-hidden="true">
            <div className="cou-marquesina-tira">
              {[0, 1].map((i) => (
                <span key={i}>
                  {[`${diaSemana.toLowerCase()} ${diaNum} ${tx("invitacion.evento.de")} ${mesLargo}`, lugarNombre, ciudad, dressCode].filter(Boolean).join(" — ")} —&nbsp;
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── 03 Unas palabras ───────────────────────────────────────────
            La cita destacada: la comilla gigante en el acento detrás, la
            frase en Bodoni y la firma con un filete a la izquierda. */}
        {hayFrase && (
          <section data-tone="light" data-screen-label={tx("invitacion.frase.etiqueta")} className="cou-section cou-frase-seccion">
            <div className="cou-folio">
              <span data-xin="1" data-dist="-40">{nFrase} — EDITORIAL</span>
              <span data-xin="1" data-dist="40">{folio(nFrase)}</span>
            </div>
            <div className="cou-spread">
              <div className="cou-cita">
                <span className="cou-comilla" aria-hidden="true">“</span>
                <h2 ref={fraseRef} className="cou-frase">
                  {palabras.map((p, i) => (
                    // El espacio va fuera del span: el motor pone cada palabra
                    // en inline-block y un espacio adentro se colapsa a cero.
                    <span key={i}>
                      <span data-w="1" className={tonoDePalabra(i)}>{p}</span>{" "}
                    </span>
                  ))}
                </h2>
              </div>
              <div data-xin="1" data-delay="900" data-dist="60" className="cou-firma">
                <span className="cou-folio-etq">{tx("invitacion.frase.conAmor").toUpperCase()}</span>
                <span className="cou-firma-texto">{titulo}{ciudad ? `, ${ciudad}.` : "."}</span>
              </div>
            </div>
            <div className="cou-folio cou-folio--pie">
              <span>{titulo.toUpperCase()} · {mesLargo.toUpperCase()} {anio}</span>
              <span>PÁGINA {nFrase}</span>
            </div>
          </section>
        )}

        {/* ── 04 Cuándo y dónde ──────────────────────────────────────────
            La pasarela: un pliego por lugar, el salón sobre crema, la
            ceremonia sobre tinta, el cronograma sobre blanco. */}
        <div
          id="details"
          data-pan="1"
          data-scroll={scrollVertical || panelesLugar.length <= 1 ? "vertical" : "lateral"}
          data-screen-label={tx("invitacion.ubicacion.cuandoYDonde")}
          className="cou-pan"
          style={{ "--st-pasos": Math.max(0, panelesLugar.length - 1) } as React.CSSProperties}
        >
          <div className="cou-pan-fijo">
            <div data-strip="1" className="cou-tira">
              <div data-tone="light" className="cou-panel">
                <div className="cou-folio">
                  <span>{nCuando} — {tx("invitacion.ubicacion.fiestaSalon").toUpperCase()}</span><span>{deLugar("recepcion")}</span>
                </div>
                <div className="cou-spread">
                  <div className="cou-pagina">
                    <span className="cou-panel-sub">{(lugarNombre || tx("invitacion.ubicacion.elLugar")).split(" ")[0]}</span>
                    <h2 className="cou-panel-titulo">{(lugarNombre || "").split(" ").slice(1).join(" ") || ciudad}</h2>
                  </div>
                  <div className="cou-lineas">
                    <div className="cou-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{hora} h</span></div>
                    {direccion && <div className="cou-linea"><span>{tx("invitacion.ubicacion.direccion")}</span><span>{direccion}</span></div>}
                    {dressCode && <div className="cou-linea"><span>{tx("invitacion.ubicacion.dressCode")}</span><span>{dressCode}</span></div>}
                    {mapUrl && (
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="cou-cta">
                        {tx("invitacion.ubicacion.comoLlegar").toUpperCase()}<span className="cou-cta-flecha">→</span>
                      </a>
                    )}
                  </div>
                </div>
                <div className="cou-folio cou-folio--pie">
                  <span>{[direccion, ciudad].filter(Boolean).join(" · ").toUpperCase()}</span>
                  {!scrollVertical && panelesLugar.length > 1 && <span>{tx("invitacion.portada.desliza").toUpperCase()} →</span>}
                </div>
              </div>

              {ceremoniaHabilitada && (
                <div id="ceremonia" data-tone="dark" className="cou-panel">
                  <div className="cou-folio">
                    <span>{nCuando} — {ceremoniaTitulo.toUpperCase()}</span><span>{deLugar("ceremonia")}</span>
                  </div>
                  <div className="cou-spread">
                    <div className="cou-pagina">
                      <span className="cou-panel-sub">{(ceremoniaNombre || ceremoniaTitulo).split(" ")[0]}</span>
                      <h2 className="cou-panel-titulo">{(ceremoniaNombre || "").split(" ").slice(1).join(" ") || ceremoniaTitulo}</h2>
                    </div>
                    <div className="cou-lineas">
                      {ceremoniaHora && <div className="cou-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{ceremoniaHora} h</span></div>}
                      {ceremoniaDireccion && <div className="cou-linea"><span>{tx("invitacion.ubicacion.direccion")}</span><span>{ceremoniaDireccion}</span></div>}
                    </div>
                  </div>
                  <div className="cou-folio cou-folio--pie">
                    <span>{tx("invitacion.ubicacion.ceremoniaCivil").toUpperCase()}</span>
                    {!scrollVertical && <span>{tx("invitacion.portada.desliza").toUpperCase()} →</span>}
                  </div>
                </div>
              )}

              {hayComoLlegar && (
                <div id="location" data-tone="light" className="cou-panel">
                  <div className="cou-folio">
                    <span>{nCuando} — {tx("invitacion.ubicacion.comoLlegar").toUpperCase()}</span><span>{deLugar("llegar")}</span>
                  </div>
                  <div className="cou-spread">
                    <div className="cou-pagina">
                      <span className="cou-panel-sub">{ciudad || lugarNombre}</span>
                      <h2 className="cou-panel-titulo">{tx("invitacion.ubicacion.comoLlegar")}</h2>
                    </div>
                    <div className="cou-lineas">
                      {embedMapUrl && (
                        <div className="cou-mapa">
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
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="cou-cta">
                        {tx("invitacion.ubicacion.abrirEnMapas").toUpperCase()}<span className="cou-cta-flecha">→</span>
                      </a>
                    </div>
                  </div>
                  <div className="cou-folio cou-folio--pie">
                    <span>{[direccion, ciudad].filter(Boolean).join(" · ").toUpperCase()}</span>
                    {!scrollVertical && <span>{tx("invitacion.portada.desliza").toUpperCase()} →</span>}
                  </div>
                </div>
              )}

              {cronograma.length > 0 && (
                <div id="schedule" data-tone="light" className="cou-panel cou-panel--blanco">
                  <div className="cou-folio">
                    <span>{nCuando} — {tx("invitacion.ubicacion.cronograma").toUpperCase()}</span><span>{deLugar("cronograma")}</span>
                  </div>
                  <div className="cou-spread">
                    <div className="cou-pagina">
                      <span className="cou-panel-sub">{tx("invitacion.ubicacion.cronograma")}</span>
                      <h2 className="cou-panel-titulo">{tx("invitacion.ubicacion.laNochePasoAPaso").split(",")[0]}</h2>
                    </div>
                    <div className="cou-lineas">
                      {cronograma.map((item, i) => (
                        <div key={i} className="cou-linea"><span>{item.time || ""}</span><span>{item.title}</span></div>
                      ))}
                    </div>
                  </div>
                  <div className="cou-folio cou-folio--pie">
                    <span>{fechaPuntos}</span>
                  </div>
                </div>
              )}
            </div>
            {!scrollVertical && panelesLugar.length > 1 && <Puntos cantidad={panelesLugar.length} />}
          </div>
        </div>

        {/* ── 05 Check-in ────────────────────────────────────────────────
            La tarjeta de suscripción: blanca, con filete, el punto de
            estado parpadeando y el sello "sí" que cae al confirmar. */}
        {rsvpHabilitado && (
          <section id="rsvp" data-tone="light" data-screen-label={tx("invitacion.rsvp.confirmar")} className="cou-section cou-checkin">
            <div className="cou-folio">
              <span data-xin="1" data-dist="-40">{nCheckin} — CHECK-IN</span>
              <span data-xin="1" data-dist="40">{folio(nCheckin)}</span>
            </div>
            <div className="cou-spread">
              <div className="cou-pagina">
                <span data-xin="1" className="cou-panel-sub">{tx("invitacion.rsvp.confirmaLinea1")}</span>
                <h2 data-xin="1" data-dist="-80" className="cou-h2">{tx("invitacion.rsvp.confirmaLinea2")}</h2>
              </div>
              <div data-xin="1" data-delay="160" data-dist="80" className="cou-cupon">
                <CheckinCouture
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
            La sesión de tapa: hoja de contactos de seis columnas con
            filete, y el baño de color que se enciende al pasar. */}
        {todasLasFotos.length > 0 && (
          <div
            id="album"
            data-pan="1"
            data-scroll={scrollVertical || hojasDeFotos.length <= 1 ? "vertical" : "lateral"}
            data-screen-label={tx("invitacion.album.titulo")}
            className="cou-pan"
            style={{ "--st-pasos": Math.max(0, hojasDeFotos.length - 1) } as React.CSSProperties}
          >
            <div className="cou-pan-fijo cou-pan-fijo--album">
              <div data-strip="1" className="cou-tira">
                {hojasDeFotos.map((hoja, iHoja) => (
                  <div key={iHoja} data-tone="light" className={`cou-panel cou-panel--album${iHoja % 2 === 1 ? " cou-panel--album-b" : ""}`}>
                    <div className="cou-folio">
                      <span>{nAlbum} — {tx("invitacion.album.titulo").toUpperCase()}</span>
                      <span>{tx("invitacion.album.hojaDeTotal", { n: String(iHoja + 1).padStart(2, "0"), total: String(hojasDeFotos.length).padStart(2, "0") }).toUpperCase()} · {folio(nAlbum)}</span>
                    </div>
                    <h2 className="cou-h2 cou-h2--album">
                      {tx("invitacion.album.titulo")} <span className="cou-italica">{tx("invitacion.album.deFotos")}</span>
                    </h2>
                    <div className="cou-contactos" data-cantidad={hoja.length}>
                      {hoja.map((url, i) => (
                        <div
                          key={i}
                          data-sheet="1"
                          className="cou-contacto"
                          role="button"
                          tabIndex={0}
                          onClick={() => setFotoAmpliada(url)}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setFotoAmpliada(url); }}
                          aria-label={tx("invitacion.album.ampliarFoto", { n: i + 1 })}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="" loading="lazy" className="cou-contacto-img" />
                          <span data-colorwash="1" className={`cou-bano cou-bano--${(i % 5) + 1}`} aria-hidden="true" />
                          <span className="cou-contacto-n">FOTO {String(i + 1).padStart(2, "0")}</span>
                        </div>
                      ))}
                    </div>
                    <div className="cou-folio cou-folio--pie">
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
            La banda sonora: pliego de tinta, "Lado A" en itálica y la
            lista como un tracklist con filetes. */}
        {sugerenciaMusicaHabilitada && (
          <section id="songs" data-tone="dark" data-screen-label={tx("invitacion.musica.titulo")} className="cou-section cou-musica">
            <div className="cou-folio">
              <span data-xin="1" data-dist="-40">{nMusica} — {tx("invitacion.musica.titulo").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nMusica)}</span>
            </div>
            <div className="cou-spread">
              <div className="cou-pagina">
                <span data-xin="1" className="cou-panel-sub">Lado A</span>
                <h2 data-xin="1" data-dist="-80" className="cou-h2">{tx("invitacion.sabor.preguntaCancionFaltar")}</h2>
                <div data-xin="1" data-delay="120" className="cou-eq" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((i) => <span key={i} style={{ animationDelay: `${i * 0.18}s` }} />)}
                </div>
              </div>
              <div className="cou-pagina">
                <CancionesCouture
                  invitationId={String(invitation.id ?? "")}
                  guestToken={guest?.uniqueToken}
                  guestName={nombreInvitado || tx("invitacion.evento.invitado")}
                />
              </div>
            </div>
          </section>
        )}

        {/* ── 08 Regalos ─────────────────────────────────────────────────
            Los créditos: fichas blancas con filete. */}
        {hayRegalos && (
          <section id="banco" data-tone="light" data-screen-label={tx("invitacion.regalos.titulo")} className="cou-section cou-regalos">
            <div className="cou-folio">
              <span data-xin="1" data-dist="-40">{nRegalos} — {tx("invitacion.regalos.titulo").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nRegalos)}</span>
            </div>
            <div className="cou-spread">
              <div className="cou-pagina">
                <span data-xin="1" className="cou-panel-sub">{tx("invitacion.regalos.siQueresLinea1")}</span>
                <h2 data-xin="1" data-dist="-80" className="cou-h2">{tx("invitacion.regalos.siQueresLinea2")}</h2>
                {Boolean(invitation.regaloMensaje) && (
                  <p data-xin="1" data-delay="120" className="cou-parrafo">{String(invitation.regaloMensaje)}</p>
                )}
              </div>
              <div className="cou-pagina">
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
            El cuestionario: el único pliego entero en el acento, con las
            opciones en Bodoni y filete blanco. */}
        {quizHabilitado && (
          <section id="quiz" data-tone="light" data-screen-label="Quiz" className="cou-section cou-quiz">
            <div className="cou-folio">
              <span data-xin="1" data-dist="-40">{nQuiz} — {triviaTitulo.toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nQuiz)}</span>
            </div>
            <div className="cou-spread">
              <TriviaCouture
                preguntas={triviaPreguntas}
                invitationId={String(invitation.id ?? "")}
                guestToken={guest?.uniqueToken}
                guestName={nombreInvitado || tx("invitacion.evento.invitado")}
              />
            </div>
          </section>
        )}

        {/* ── 10 Tu pase ─────────────────────────────────────────────────
            La contratapa: el QR sobre un cuadrado de papel, el número de
            pase enorme, el sello de la mesa girando y el colofón. */}
        <section data-tone="dark" data-screen-label={tx("invitacion.pase.tuPase")} className="cou-section cou-pase">
          <div className="cou-folio">
            <span data-xin="1" data-dist="-40">{nPase} — {tx("invitacion.pase.tuPase").toUpperCase()}</span>
            <span data-xin="1" data-dist="40">CONTRATAPA · {folio(nPase)}</span>
          </div>
          <div className="cou-spread">
            <div data-xin="1" data-dist="-60" className="cou-pagina cou-pagina--qr">
              <div className="cou-qr">
                <QrDeIngreso guest={guest as never} />
                <span className="cou-qr-etq">{tx("invitacion.pase.tuPase").toUpperCase()}</span>
              </div>
            </div>
            <div className="cou-pagina">
              <div data-xin="1" data-delay="100" className="cou-pase-cabeza">
                <div className="cou-pase-numero">
                  <span className="cou-folio-etq">{tx("invitacion.pase.pase").toUpperCase()} Nº</span>
                  <span>{pase}</span>
                </div>
                <SelloCouture
                  texto={`${(nombreInvitado || titulo).toUpperCase()} · ${lugaresDelPase} ${tx(lugaresDelPase === 1 ? "invitacion.bienvenida.persona" : "invitacion.bienvenida.personas").toUpperCase()} · `}
                  centro={guest?.mesas?.[0] ?? pase}
                />
              </div>
              <div data-xin="1" data-delay="160" className="cou-lineas cou-lineas--pase">
                <div className="cou-linea"><span>{saludaAlInvitado ? tx("invitacion.pase.reservadoPara") : tx("invitacion.evento.invitado")}</span><span>{nombreInvitado || titulo}</span></div>
                {lugaresDelPase > 0 && (
                  <div className="cou-linea"><span>{tx("invitacion.pase.lugares")}</span><span>{lugaresDelPase}</span></div>
                )}
                {guest?.mesas && guest.mesas.length > 0 && (
                  <div className="cou-linea"><span>{tx("invitacion.pase.tuMesa")}</span><span>{guest.mesas.join(" · ")}</span></div>
                )}
                <div className="cou-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{fechaPuntos} · {hora} H</span></div>
              </div>
              <div className="cou-info-extra">
                <InfoAdicionalSection invitation={invitation} />
              </div>
            </div>
          </div>
          <div data-xin="1" data-delay="220" className="cou-pase-pie">
            <span className="cou-despedida">{tx("invitacion.pase.losEsperamos")} {iniciales(nombre1, nombre2)}</span>
            <div className="cou-folio cou-folio--colofon">
              <span className="cou-credito">COLOFÓN · <LogoFooterCredit bgColor="transparent" textColor={PALETA.bg} /></span>
              <span className="cou-replay" role="button" tabIndex={0} onClick={volverAVerla} onKeyDown={(e) => { if (e.key === "Enter") volverAVerla(); }}>
                {tx("invitacion.portada.verAperturaOtraVez").toUpperCase()} ↺
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* ── Riel de progreso ───────────────────────────────────────────── */}
      <div ref={rielRef} className="cou-riel">
        <span ref={rielTopRef} className="cou-riel-top">{pase}</span>
        <div ref={rielLineaRef} className="cou-riel-linea">
          <span ref={rielBarraRef} className="cou-riel-barra" />
        </div>
        <span ref={rielEtiquetaRef} className="cou-riel-etiqueta">{tx("invitacion.saveTheDate.guardaLaFecha").toUpperCase()}</span>
      </div>

      {/* ── La tapa ─────────────────────────────────────────────────────
          La tapa de la revista y, a la vez, la bienvenida: cabecera con
          número y edición, el masthead con los nombres, la foto con el
          recuadro "en esta edición" y el sello del pase, y abajo el mensaje
          con el código de barras. */}
      <div ref={portadaRef} data-tone={TONO} className="cou-portada">
        <div ref={escenaPortadaRef} className="cou-portada-hoja">
          <div data-cl="1" className="cou-cabecera">
            <span>Nº {pase} · {mesLargo.toUpperCase()} {anio}</span>
            <span className="cou-cabecera-edicion">{kickerDelEvento}</span>
            <span>{[lugarNombre, ciudad].filter(Boolean).join(" · ").toUpperCase() || `${diaSemana} · ${hora} H`}</span>
          </div>

          <div data-cl="2" className="cou-tapa-cuerpo">
            <h1 ref={cartelRef} className="cou-masthead" style={{ "--largo": renglonMasLargo, "--n": totalLetras } as React.CSSProperties}>
              {saludaAlInvitado ? (
                <span className="cou-masthead-linea"><span data-pieza="1"><Letras texto={nombreInvitado} desde={0} /></span></span>
              ) : (
                <>
                  <span className="cou-masthead-linea"><span data-pieza="1"><Letras texto={nombre1} desde={0} /></span></span>
                  {nombre2 && (
                    <span className="cou-masthead-linea cou-masthead-linea--der">
                      <span data-pieza="1"><span className="cou-amp">&amp;</span><Letras texto={nombre2} desde={nombre1.replace(/\s/g, "").length} /></span>
                    </span>
                  )}
                </>
              )}
            </h1>
            <div className="cou-tapa-foto">
              {hayFoto && fotoMobile && (
                <div className="acp-mobile-only cou-foto-capa">
                  <AnimatedCoverPhoto photoSrc={fotoMobile} tint={false} effect="enfoque" scrimColorRgb="11,11,11" />
                </div>
              )}
              {hayFoto && fotoDesktop && (
                <div className="acp-desktop-only cou-foto-capa">
                  <AnimatedCoverPhoto photoSrc={fotoDesktop} tint={false} effect="enfoque" scrimColorRgb="11,11,11" />
                </div>
              )}
              <span className="cou-tapa-trama" aria-hidden="true" />
              <span className="cou-tapa-foto-etq">{hayFoto ? tx("invitacion.album.nuestraFoto").toUpperCase() : titulo.toUpperCase()}</span>
              <div className="cou-edicion">
                <span className="cou-folio-etq">{tx("invitacion.saveTheDate.enEstaEdicion").toUpperCase()}</span>
                <span className="cou-edicion-titulo">{diaSemana.charAt(0) + diaSemana.slice(1).toLowerCase()} {diaNum} {tx("invitacion.evento.de")} {mesLargo}{lugarNombre ? `, ${lugarNombre}` : ""}</span>
                <span className="cou-edicion-pie">{[ciudad, `${hora} h`].filter(Boolean).join(", ")}</span>
              </div>
              <div className="cou-tapa-sello">
                <SelloCouture
                  texto={`${kickerDelEvento.toUpperCase()} · ${isPersonalized && guest ? `${tx("invitacion.pase.pase").toUpperCase()} Nº ${pase} · ${lugaresDelPase} ${tx(lugaresDelPase === 1 ? "invitacion.bienvenida.persona" : "invitacion.bienvenida.personas").toUpperCase()}` : `${diaNum} ${mesCorto.toUpperCase()} ${anio}`} · `}
                  centro={isPersonalized && guest ? pase.replace(/^0+/, "") || pase : diaNum}
                  relleno
                />
              </div>
            </div>
          </div>

          <div data-cl="3" className="cou-tapa-pie">
            <div className="cou-tapa-pie-texto">
              <p className="cou-tapa-mensaje">
                {saludaAlInvitado
                  ? `${tx("invitacion.bienvenida.hola", { nombre: nombreInvitado })}. ${String(invitation.portadaMensaje || tx("invitacion.sabor.mensajeLoContamosNosotros"))}`
                  : String(invitation.portadaMensaje || tx("invitacion.sabor.mensajeLoContamosNosotros"))}
              </p>
              <button type="button" onClick={abrir} className="cou-tapa-btn">
                <span>{tx("invitacion.portada.abrirInvitacion").toUpperCase()}</span><span className="cou-cta-flecha">→</span>
              </button>
            </div>
            <CodigoDeBarras texto={fechaCodigo} />
          </div>
        </div>
      </div>

      <div ref={pistaRef} className="cou-pista">{tx("invitacion.portada.desliza").toUpperCase()} ↓</div>

      {fotoAmpliada && (
        <div className="cou-lupa" onClick={() => setFotoAmpliada(null)} onContextMenu={(e) => e.preventDefault()}>
          <button
            type="button"
            className="cou-lupa-cerrar"
            onClick={(e) => { e.stopPropagation(); setFotoAmpliada(null); }}
            aria-label={tx("invitacion.cerrar")}
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fotoAmpliada} alt={tx("invitacion.album.fotoAmpliada")} className="cou-lupa-img" draggable={false} onClick={(e) => e.stopPropagation()} />
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

/** "V & T": las iniciales de la despedida de la contratapa. */
function iniciales(a: string, b: string): string {
  const i = (s: string) => (s.trim()[0] || "").toUpperCase();
  return b ? `${i(a)} & ${i(b)}` : i(a);
}

/**
 * El masthead letra por letra: cada tanto una se corre 20-40 px y vuelve,
 * como plomo suelto en la caja. El CSS escalona el turno de cada letra.
 */
function Letras({ texto, desde }: { texto: string; desde: number }) {
  let k = desde;
  return (
    <>
      {Array.from(texto).map((ch, i) =>
        ch === " " ? " " : <span key={i} className="cou-letra" style={{ "--i": k++ } as React.CSSProperties}>{ch}</span>
      )}
    </>
  );
}

/**
 * El sello circular: un anillo con el texto siguiendo la circunferencia,
 * girando, y un número en itálica en el centro. En la tapa va relleno de
 * papel (sobre la foto); en la contratapa es sólo el anillo en el acento.
 */
function SelloCouture({ texto, centro, relleno = false }: { texto: string; centro: string; relleno?: boolean }) {
  // El id del arco tiene que ser único por instancia: dos <textPath> que
  // apuntan al mismo id hacen que el segundo no se dibuje.
  const id = useId().replace(/:/g, "");
  return (
    <div className={`cou-sello-circular${relleno ? " cou-sello-circular--relleno" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 100 100">
        <defs>
          <path id={`arc-${id}`} d="M50 50 m -36 0 a 36 36 0 1 1 72 0 a 36 36 0 1 1 -72 0" fill="none" />
        </defs>
        <circle cx="50" cy="50" r="48.5" fill={relleno ? "var(--pp-bg)" : "none"} stroke="currentColor" strokeWidth="1.5" />
        <text>
          <textPath href={`#arc-${id}`}>{texto.repeat(3).slice(0, 62)}</textPath>
        </text>
      </svg>
      <span className="cou-sello-centro">{centro}</span>
    </div>
  );
}

/** El código de barras de la tapa: 17 barras y la fecha con el pase debajo. */
function CodigoDeBarras({ texto }: { texto: string }) {
  const barras = [[0, 2], [4, 1], [7, 3], [12, 1], [15, 2], [19, 1], [22, 3], [27, 2], [31, 1], [34, 3], [39, 1], [42, 2], [46, 1], [49, 3], [54, 2], [58, 1], [61, 3]];
  return (
    <svg width="64" height="50" viewBox="0 0 64 50" className="cou-barras" aria-hidden="true">
      <g fill="currentColor">
        {barras.map(([x, w]) => <rect key={x} x={x} y="0" width={w} height="40" />)}
      </g>
      <text x="32" y="49" textAnchor="middle">{texto}</text>
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
    <div className="cou-puntos" aria-hidden="true">
      {Array.from({ length: cantidad }).map((_, i) => (
        <span key={i} data-dot={i} className="cou-punto" style={{ background: i === 0 ? PALETA.acc : "rgba(43,42,51,.18)" }} />
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
function CuentaCouture({ targetDate }: { targetDate: Date }) {
  const tx = useTextos();
  const { time, isEventDay, isPast, hasEnded } = useCountdown(targetDate);

  if (isEventDay || hasEnded || isPast) {
    return (
      <div className="cou-tarjeta cou-tarjeta--hoy" data-xin="1" data-delay="80" data-dist="30">
        <span className="cou-tarjeta-kicker">{tx("invitacion.cuentaRegresiva.kicker").toUpperCase()}</span>
        <span className="cou-tarjeta-titulo">
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
    <div className="cou-cuenta">
      {celdas.map((c, i) => (
        <div key={c.l} data-xin="1" data-delay={i * 100} data-dist={i % 2 === 0 ? -80 : 80} className={`cou-cuenta-caja cou-cuenta-caja--${i + 1}`}>
          <span className="cou-cuenta-num"><span key={c.v}>{c.v}</span></span>
          <span className="cou-cuenta-etq">{c.l.toUpperCase()}</span>
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
    <div className="cou-fila cou-fila--copiable">
      <div className="cou-fila-texto">
        <span className="cou-fila-etq">{etiqueta.toUpperCase()}</span>
        <span className="cou-fila-dato">{valor}</span>
      </div>
      <button type="button" onClick={copiar} className={`cou-btn-copiar${copiado ? " cou-btn-copiar--hecho" : ""}`}>
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
      className={`cou-tarjeta cou-tarjeta--banco${dobleZ ? " cou-doblez" : ""}${inclinada ? " cou-tarjeta--der" : " cou-tarjeta--izq"}`}
    >
      <span className="cou-tarjeta-kicker">{titulo.toUpperCase()}</span>
      {mensaje && <p className="cou-tarjeta-mensaje">{mensaje}</p>}
      <div className="cou-filas">
        <FilaCopiable etiqueta="Alias" valor={alias} />
        <FilaCopiable etiqueta="CBU" valor={cbu} />
        {(banco || titular) && (
          <div className="cou-fila cou-fila--ultima">
            <span>{banco || tx("invitacion.regalos.banco")}</span>
            <span className="cou-fila-valor">{titular}</span>
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
function CheckinCouture({
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
      <div data-xin="1" data-delay="140" data-dist="30" className="cou-tarjeta cou-tarjeta--izq">
        <p className="cou-tarjeta-mensaje">{tx("invitacion.rsvp.graciasPorAvisarAcceso")}</p>
        <button type="button" className="cou-btn-fantasma" onClick={() => setEstado("PENDING")}>
          {tx("invitacion.rsvp.cambieDeIdea").toUpperCase()}
        </button>
      </div>
    );
  }

  const confirmadoYa = estado === "CONFIRMED";

  return (
    <>
      <div ref={tarjetaRef} data-xin="1" data-delay="140" data-dist="30" className="cou-tarjeta cou-tarjeta--talon">
        <div className="cou-talon-top">
          <span>{tx("invitacion.pase.numeroPase", { n: pase }).toUpperCase()}{guestName ? ` · ${guestName.toUpperCase()}` : ""}</span>
          <span ref={estadoRef} className="cou-talon-estado">
            {confirmado || confirmadoYa ? tx("invitacion.pase.accesoConfirmado").toUpperCase() : tx("invitacion.pase.pendiente").toUpperCase()}
          </span>
        </div>

        {!confirmadoYa ? (
          <>
            {lugares > 1 && (
              <div className="cou-campo">
                <label className="cou-etiqueta">{tx("invitacion.rsvp.adultos").toUpperCase()}</label>
                <div className="cou-contador">
                  <button type="button" onClick={() => setAdultos((v) => Math.max(1, v - 1))} disabled={adultos <= 1} aria-label="−">−</button>
                  <span>{adultos}</span>
                  <button type="button" onClick={() => setAdultos((v) => Math.min(maxAdultos, v + 1))} disabled={adultos >= maxAdultos} aria-label="+">+</button>
                </div>
              </div>
            )}
            {maxAdolescentes > 0 && (
              <div className="cou-campo">
                <label className="cou-etiqueta">{tx("invitacion.rsvp.adolescentes").toUpperCase()}</label>
                <div className="cou-contador">
                  <button type="button" onClick={() => setAdolescentes((v) => Math.max(0, v - 1))} disabled={adolescentes <= 0} aria-label="−">−</button>
                  <span>{adolescentes}</span>
                  <button type="button" onClick={() => setAdolescentes((v) => Math.min(maxAdolescentes, v + 1))} disabled={adolescentes >= maxAdolescentes} aria-label="+">+</button>
                </div>
              </div>
            )}
            {maxNinos > 0 && (
              <div className="cou-campo">
                <label className="cou-etiqueta">{tx("invitacion.rsvp.ninos").toUpperCase()}</label>
                <div className="cou-contador">
                  <button type="button" onClick={() => setNinos((v) => Math.max(0, v - 1))} disabled={ninos <= 0} aria-label="−">−</button>
                  <span>{ninos}</span>
                  <button type="button" onClick={() => setNinos((v) => Math.min(maxNinos, v + 1))} disabled={ninos >= maxNinos} aria-label="+">+</button>
                </div>
              </div>
            )}
            <div className="cou-campo">
              <label className="cou-etiqueta">{tx("invitacion.rsvp.restriccionAlimentaria").toUpperCase()}</label>
              <input
                value={dieta}
                onChange={(e) => setDieta(e.target.value)}
                placeholder="—"
                maxLength={120}
                className="cou-input"
              />
            </div>
          </>
        ) : (
          <div className="cou-filas">
            {lugares > 1 && adultos > 0 && <div className="cou-fila"><span>{tx("invitacion.rsvp.adultos")}</span><span>{adultos}</span></div>}
            {adolescentes > 0 && <div className="cou-fila"><span>{tx("invitacion.rsvp.adolescentes")}</span><span>{adolescentes}</span></div>}
            {ninos > 0 && <div className="cou-fila"><span>{tx("invitacion.rsvp.ninos")}</span><span>{ninos}</span></div>}
            <div className="cou-fila cou-fila--ultima">
              <span>{tx("invitacion.rsvp.restriccionAlimentaria")}</span>
              <span className="cou-fila-valor">{restricciones || dieta || "—"}</span>
            </div>
          </div>
        )}

        {hayPago && monto != null && !exento && (
          <div className="cou-precio">
            <span>{estadoDePago === "PAID" ? tx("invitacion.pago.abonado") : tx("invitacion.pago.valor")}</span>
            <div className="cou-precio-valor">
              <span className="cou-precio-total">{formatearMoneda(totalAPagar)}</span>
              {usarTotalDelServidor && vistaDePago
                ? vistaDePago.lines.map((l, i) => <span key={i} className="cou-precio-detalle">{l}</span>)
                : (
                  <>
                    {adultos > 0 && <span className="cou-precio-detalle">{adultos} × {formatearMoneda(precioAdulto)}</span>}
                    {adolescentes > 0 && <span className="cou-precio-detalle">{adolescentes} × {formatearMoneda(precioAdo)}</span>}
                    {ninos > 0 && <span className="cou-precio-detalle">{ninos} × {formatearMoneda(precioNin)}</span>}
                  </>
                )}
            </div>
          </div>
        )}

        <div ref={selloRef} className="cou-sello" aria-hidden="true">{tx("invitacion.pase.confirmado").toUpperCase()}</div>
        <div ref={petalosRef} className="cou-petalos" aria-hidden="true" />
      </div>

      {error && <p className="cou-error">{error}</p>}

      {!confirmadoYa ? (
        <>
          <button type="button" data-xin="1" data-delay="220" className="cou-btn-solido" disabled={enviando} onClick={() => enviar("CONFIRMA")}>
            {enviando ? tx("invitacion.rsvp.guardando").toUpperCase() : tx("invitacion.rsvp.confirmarAsistencia").toUpperCase()}
          </button>
          <button type="button" data-xin="1" data-delay="280" className="cou-btn-fantasma" disabled={enviando} onClick={() => enviar("NO_ASISTE")}>
            {tx("invitacion.rsvp.noVoyAPoderAsistir").toUpperCase()}
          </button>
        </>
      ) : (
        <button type="button" className="cou-btn-fantasma" onClick={() => setEstado("PENDING")}>
          {tx("invitacion.rsvp.modificarAsistencia").toUpperCase()}
        </button>
      )}
    </>
  );
}

interface CancionItem { id: string; title: string; artist: string; guestName: string }

/** Sugerir una canción, en una tarjeta de papel con la lista debajo. */
function CancionesCouture({ invitationId, guestToken, guestName }: { invitationId: string; guestToken?: string; guestName: string }) {
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
      <form onSubmit={enviar} data-xin="1" data-delay="140" data-dist="30" className="cou-tarjeta cou-tarjeta--der">
        <div className="cou-campo">
          <label className="cou-etiqueta">{tx("invitacion.musica.tema").toUpperCase()}</label>
          <input value={tema} onChange={(e) => setTema(e.target.value)} placeholder={tx("invitacion.musica.nombreDeLaCancion")} maxLength={100} className="cou-input cou-input--serif" />
        </div>
        <div className="cou-campo">
          <label className="cou-etiqueta">{tx("invitacion.musica.artista").toUpperCase()}</label>
          <input value={artista} onChange={(e) => setArtista(e.target.value)} placeholder={tx("invitacion.musica.artista")} maxLength={80} className="cou-input cou-input--serif" />
        </div>
        {error && <p className="cou-error">{error}</p>}
        <button type="submit" disabled={enviando} className="cou-btn-solido cou-btn-solido--tinta">
          {enviando ? tx("invitacion.musica.enviando").toUpperCase() : tx("invitacion.musica.sugeriUnaCancion").toUpperCase()}
        </button>
      </form>

      {canciones.length > 0 && (
        <div data-xin="1" data-delay="220" className="cou-lista">
          {canciones.slice(0, 8).map((c) => (
            <div key={c.id} className="cou-lista-fila">
              <div className="cou-lista-texto">
                <span className="cou-lista-tema">{c.title}</span>
                <span className="cou-lista-quien">{c.artist} · {tx("invitacion.musica.sumadoPor")} {c.guestName || tx("invitacion.evento.invitado")}</span>
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
function TriviaCouture({ preguntas, invitationId, guestToken, guestName }: { preguntas: QuizPregunta[]; invitationId: string; guestToken?: string; guestName: string }) {
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
      <div data-xin="1" data-delay="140" data-dist="30" className="cou-tarjeta cou-tarjeta--izq">
        <span className="cou-tarjeta-kicker">{tx("invitacion.quiz.kicker").toUpperCase()}</span>
        <span className="cou-tarjeta-titulo">
          {guardando ? tx("invitacion.rsvp.guardando") : tx("invitacion.quiz.respondisteCorrectamente", { aciertos: puntaje, total: preguntas.length })}
        </span>
        {!guardando && stats && stats.count > 0 && (
          <p className="cou-tarjeta-mensaje">{tx("invitacion.quiz.promedio", { n: stats.count, avg: stats.avg })}</p>
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
    <div data-xin="1" data-delay="140" data-dist="30" className="cou-tarjeta cou-tarjeta--izq">
      <span className="cou-tarjeta-kicker">{tx("invitacion.quiz.preguntaDeTotal", { n: indice + 1, total: preguntas.length }).toUpperCase()}</span>
      <span className="cou-tarjeta-pregunta">{q.pregunta}</span>
      <div className="cou-opciones">
        {q.opciones.map((op, oi) => {
          let clase = "";
          if (yaEligio && correcta !== undefined) {
            if (oi === correcta) clase = " cou-opcion--bien";
            else if (elegidas[indice] === oi) clase = " cou-opcion--mal";
          }
          return (
            <button key={oi} type="button" disabled={yaEligio} onClick={() => elegir(oi)} className={`cou-opcion${clase}`}>
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
// leen la Bienvenida y el Post-evento compartidos (esperan `cou-section` y
// `cou-kicker`).
const CSS_COU = `
  /* ── Couture ──────────────────────────────────────────────────────────
     Una revista de moda: Bodoni Moda en cuerpos de tapa, Space Grotesk en
     versalitas con tracking para todo lo chico, filetes de 1 px y el color
     en una sola palabra por página. Sin sombras, sin redondeos. */
  .cou-raiz { position: fixed; inset: 0; width: 100%; height: calc(var(--vh, 1vh) * 100); overflow: hidden;
    background: var(--pp-bg); color: var(--pp-ink); font-family: var(--cou-sans), 'Space Grotesk', sans-serif;
    --cou-filete: 1px solid currentColor; }
  .cou-raiz a { color: inherit; text-decoration: none; }
  .cou-raiz button { font: inherit; }

  .cou-scroller { position: absolute; inset: 0; overflow-y: auto; overflow-x: hidden; opacity: 0;
    transition: opacity 900ms ease 260ms; scrollbar-width: none; }
  .cou-scroller::-webkit-scrollbar { width: 0; height: 0; }

  /* ── El pliego ─────────────────────────────────────────────────────── */
  .cou-section { position: relative; z-index: 1; min-height: calc(var(--vh, 1vh) * 100); box-sizing: border-box;
    display: flex; flex-direction: column; gap: 26px;
    padding: 56px max(18px, calc((100% - 1100px) / 2)) 80px; background: var(--pp-bg); color: var(--pp-ink); }
  .cou-section[data-tone="dark"] { background: var(--pp-ink); color: var(--pp-bg); }
  .cou-std, .cou-regalos { background: var(--pp-bg2); }

  /* El folio: versalitas con tracking y un filete debajo. */
  .cou-folio { position: relative; z-index: 1; display: flex; justify-content: space-between; align-items: baseline; gap: 16px;
    border-bottom: 1px solid currentColor; padding-bottom: 8px; font-size: 11px; letter-spacing: .22em; text-transform: uppercase;
    color: color-mix(in srgb, currentColor 72%, transparent); }
  .cou-section[data-tone="dark"] .cou-folio { border-bottom-color: color-mix(in srgb, currentColor 50%, transparent); }
  .cou-folio--pie { margin-top: auto; border-bottom: 0; border-top: 1px solid currentColor; padding: 8px 0 0; align-items: center; }
  .cou-folio--colofon { border-bottom: 0; border-top: 1px solid color-mix(in srgb, currentColor 30%, transparent); padding: 12px 0 0; align-items: center; }
  .cou-folio-etq { font-size: 11px; letter-spacing: .22em; text-transform: uppercase; color: color-mix(in srgb, currentColor 62%, transparent); display: block; }

  /* El spread: dos páginas; desde 1024 px se abren de verdad. */
  .cou-spread { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 22px; }
  .cou-pagina { display: flex; flex-direction: column; gap: 12px; min-width: 0; }
  @media (min-width: 1024px) {
    .cou-spread { display: grid; grid-template-columns: 1fr 1fr; align-items: center; column-gap: 72px; }
    .cou-spread > * { max-width: 560px; width: 100%; min-width: 0; }
    .cou-spread > *:first-child { justify-self: end; }
    .cou-spread > *:last-child { justify-self: start; }
    .cou-pagina--entera { grid-column: 1 / -1; max-width: none; justify-self: stretch; }
  }

  /* ── Tipos ─────────────────────────────────────────────────────────── */
  .cou-h2, .cou-panel-titulo, .cou-frase, .cou-fecha-dia, .cou-fecha-mes, .cou-fecha-anio, .cou-masthead {
    font-family: var(--cou-serif), 'Bodoni Moda', serif; font-weight: 400; }
  .cou-h2, .cou-panel-titulo { position: relative; z-index: 1; margin: 0; line-height: .86; letter-spacing: -.03em; }
  .cou-h2 { font-size: clamp(52px, 15vw, 120px); }
  .cou-h2--album { font-size: clamp(44px, 12vw, 96px); line-height: .9; }
  .cou-panel-titulo { font-size: clamp(52px, 16vw, 130px); }
  .cou-panel-sub { font-family: var(--cou-serif), 'Bodoni Moda', serif; font-style: italic; font-size: clamp(22px, 6vw, 36px); color: var(--pp-acc); }
  .cou-italica { font-style: italic; }
  .cou-acento { font-style: italic; color: var(--pp-acc); }
  .cou-subrayado { border-bottom: 3px solid currentColor; }
  .cou-parrafo { margin: 0; font-size: 15px; line-height: 1.5; max-width: 40ch; color: var(--pp-ink2); }
  /* El botón de esta familia: filete, versalitas y la flecha en Bodoni. */
  .cou-cta { margin-top: 14px; min-height: 48px; display: flex; align-items: center; justify-content: space-between; gap: 12px;
    border: 1px solid currentColor; padding: 0 16px; font-weight: 600; font-size: 12px; letter-spacing: .22em; text-transform: uppercase; color: inherit; }
  .cou-cta--chico { align-self: flex-start; justify-content: flex-start; margin-top: 0; }
  .cou-cta-flecha { font-family: var(--cou-serif), 'Bodoni Moda', serif; font-style: italic; font-size: 20px; letter-spacing: 0; text-transform: none; }

  /* ── 01 Guardá la fecha: el sumario ────────────────────────────────── */
  .cou-fecha { display: flex; align-items: flex-start; gap: 12px; }
  .cou-fecha-dia { font-size: clamp(120px, 40vw, 300px); line-height: .78; letter-spacing: -.04em; }
  .cou-fecha-columna { display: flex; flex-direction: column; gap: 6px; padding-top: 10px; min-width: 0; }
  .cou-fecha-mes { font-style: italic; font-size: clamp(40px, 12vw, 96px); line-height: .9; color: var(--pp-acc); }
  .cou-fecha-anio { font-size: clamp(32px, 9vw, 72px); line-height: .9; letter-spacing: .02em; }
  .cou-fecha-pie { font-size: 12px; letter-spacing: .2em; text-transform: uppercase; color: var(--pp-ink2); padding-top: 6px; }
  .cou-sumario { display: flex; flex-direction: column; border-top: 1px solid currentColor; }
  .cou-sumario-fila { display: flex; justify-content: space-between; align-items: baseline; gap: 14px; padding: 9px 0; font-size: 14px;
    border-bottom: 1px solid color-mix(in srgb, currentColor 25%, transparent); }
  .cou-sumario-fila > span:first-child { display: flex; gap: 12px; align-items: baseline; min-width: 0; }
  .cou-sumario-n { font-weight: 600; letter-spacing: .1em; }
  .cou-sumario-t { font-family: var(--cou-serif), 'Bodoni Moda', serif; font-size: 17px; }
  .cou-sumario-p { color: var(--pp-ink2); font-size: 12px; letter-spacing: .12em; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  /* La foto: filete de 1 px, sin marco, y los pies de foto sobre papel. */
  .cou-foto { position: relative; width: 100%; aspect-ratio: 3 / 4; border: 1px solid currentColor; box-sizing: border-box; overflow: hidden;
    background: repeating-linear-gradient(135deg, #D9D2C6 0 8px, #E7E1D6 8px 16px); }
  .cou-foto-capa { position: absolute; inset: 0; }
  .cou-foto-revelado { position: absolute; inset: 0; z-index: 1; pointer-events: none;
    background-image: radial-gradient(var(--pp-ink) calc(var(--cou-punto, 7.2) * 1px), transparent calc(var(--cou-punto, 7.2) * 1px + .6px));
    background-size: 10px 10px; }
  .cou-foto-etq, .cou-foto-pie { position: absolute; bottom: 10px; z-index: 2; background: var(--pp-bg); color: var(--pp-ink); padding: 4px 8px; }
  .cou-foto-etq { left: 12px; font-size: 11px; letter-spacing: .2em; text-transform: uppercase; }
  .cou-foto-pie { right: 12px; font-family: var(--cou-serif), 'Bodoni Moda', serif; font-style: italic; font-size: 14px; max-width: 50%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .cou-foto-pie:empty { display: none; }

  /* ── 02 Falta poco: renglones con línea de puntos ──────────────────── */
  .cou-countdown { justify-content: space-between; padding-left: 0; padding-right: 0; }
  .cou-countdown > .cou-folio, .cou-countdown > .cou-spread { margin-left: max(18px, calc((100% - 1100px) / 2)); margin-right: max(18px, calc((100% - 1100px) / 2)); }
  .cou-cuenta { display: flex; flex-direction: column; }
  .cou-cuenta-caja { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; padding: 6px 0;
    border-bottom: 1px solid color-mix(in srgb, currentColor 35%, transparent); }
  .cou-cuenta-etq { order: 1; font-size: 11px; letter-spacing: .24em; text-transform: uppercase; flex: 0 0 auto; }
  .cou-cuenta-caja::after { content: ""; order: 2; flex: 1; border-bottom: 1px dotted color-mix(in srgb, currentColor 35%, transparent); transform: translateY(-.35em); }
  .cou-cuenta-num { order: 3; font-family: var(--cou-serif), 'Bodoni Moda', serif; font-size: clamp(56px, 17vw, 130px); line-height: .9;
    letter-spacing: -.03em; min-width: 2ch; text-align: right; font-variant-numeric: tabular-nums; }
  .cou-cuenta-num > span { display: inline-block; animation: couCifra 300ms cubic-bezier(.16,1,.3,1); }
  .cou-cuenta-caja:nth-child(4) .cou-cuenta-num, .cou-cuenta-caja:nth-child(4) .cou-cuenta-etq { color: var(--pp-acc); }
  .cou-cuenta-caja:nth-child(4) .cou-cuenta-num { font-style: italic; }
  @keyframes couCifra { from { transform: translateY(18%); opacity: .4; } to { transform: translateY(0); opacity: 1; } }
  .cou-tarjeta--hoy { display: flex; flex-direction: column; gap: 8px; padding: 12px 0; border-top: 1px solid currentColor; border-bottom: 1px solid currentColor; }
  .cou-tarjeta--hoy .cou-tarjeta-kicker { font-size: 11px; letter-spacing: .24em; text-transform: uppercase; }
  .cou-tarjeta--hoy .cou-tarjeta-titulo { font-family: var(--cou-serif), 'Bodoni Moda', serif; font-style: italic; font-size: clamp(40px, 11vw, 88px); line-height: .9; color: var(--pp-acc); }
  .cou-marquesina { position: relative; z-index: 1; overflow: hidden; padding: 10px 0; white-space: nowrap;
    border-top: 1px solid color-mix(in srgb, currentColor 50%, transparent); border-bottom: 1px solid color-mix(in srgb, currentColor 50%, transparent);
    font-family: var(--cou-serif), 'Bodoni Moda', serif; font-style: italic; font-size: 24px; }
  .cou-marquesina-tira { display: flex; width: max-content; animation: couCorre 18s linear infinite; }
  .cou-marquesina-tira > span { padding-right: 40px; }
  @keyframes couCorre { to { transform: translate3d(-50%, 0, 0); } }

  /* ── 03 Unas palabras: la cita destacada ───────────────────────────── */
  .cou-frase-seccion { justify-content: space-between; gap: 30px; }
  .cou-cita { position: relative; }
  .cou-comilla { position: absolute; left: -6px; top: -.55em; font-family: var(--cou-serif), 'Bodoni Moda', serif; font-size: clamp(120px, 34vw, 260px);
    line-height: 1; color: var(--pp-acc); opacity: .35; pointer-events: none; }
  .cou-frase { position: relative; margin: 0; padding-top: .6em; font-size: clamp(36px, 10.5vw, 88px); line-height: 1.04; letter-spacing: -.015em; max-width: 16ch; }
  .cou-firma { display: flex; flex-direction: column; gap: 8px; max-width: 320px; align-self: flex-end; border-left: 1px solid currentColor; padding-left: 16px; }
  .cou-firma-texto { font-family: var(--cou-serif), 'Bodoni Moda', serif; font-style: italic; font-size: 22px; line-height: 1.2; }

  /* ── 04 Paneles: la pasarela ───────────────────────────────────────── */
  .cou-pan { position: relative; z-index: 1; height: calc(100vh + var(--st-pasos, 2) * 90vh); }
  .cou-pan-fijo { position: sticky; top: 0; height: calc(var(--vh, 1vh) * 100); overflow: hidden; background: var(--pp-bg2); }
  .cou-pan-fijo--album { background: #F7F5F0; }
  .cou-tira { position: absolute; top: 0; left: 0; height: 100%; display: flex; will-change: transform; }
  .cou-panel { flex: 0 0 100vw; min-width: 0; height: 100%; box-sizing: border-box; position: relative; overflow: hidden;
    display: flex; flex-direction: column; justify-content: space-between; gap: 20px;
    padding: 56px max(18px, calc((100vw - 1100px) / 2)) 92px; background: var(--pp-bg2); color: var(--pp-ink); }
  .cou-panel[data-tone="dark"] { background: var(--pp-ink); color: var(--pp-bg); }
  .cou-panel--blanco { background: #FFFFFF; }
  .cou-panel > .cou-folio { opacity: .8; }
  .cou-pan[data-scroll="vertical"] { height: auto; }
  .cou-pan[data-scroll="vertical"] .cou-pan-fijo { position: static; height: auto; overflow: visible; }
  .cou-pan[data-scroll="vertical"] .cou-tira { position: static; display: block; width: 100%; transform: none !important; }
  .cou-pan[data-scroll="vertical"] .cou-panel { height: auto; min-height: calc(var(--vh, 1vh) * 100); }
  .cou-lineas { display: flex; flex-direction: column; border-top: 1px solid currentColor; }
  .cou-linea { display: flex; justify-content: space-between; gap: 16px; padding: 11px 0; border-bottom: 1px solid currentColor; font-size: 14px; line-height: 1.3; }
  .cou-linea > span:first-child { font-size: 11px; letter-spacing: .2em; text-transform: uppercase; opacity: .75; flex: 0 0 auto; padding-top: 2px; }
  .cou-linea > span:last-child { text-align: right; font-family: var(--cou-serif), 'Bodoni Moda', serif; font-size: 18px; }
  .cou-mapa { height: 190px; border: 1px solid currentColor; overflow: hidden; margin-top: 14px; }
  .cou-puntos { position: absolute; left: 0; right: 40px; bottom: 30px; display: flex; gap: 8px; justify-content: center; z-index: 2; }
  .cou-punto { width: 28px; height: 1px; background: currentColor !important; opacity: .3; transition: opacity 300ms ease; display: inline-block; }
  .cou-punto[data-activo="1"] { opacity: 1; }

  /* ── 05 Check-in: la tarjeta de suscripción ────────────────────────── */
  .cou-cupon { position: relative; background: #FFFFFF; color: var(--pp-ink); border: 1px solid var(--pp-ink); padding: 18px 20px 20px;
    display: flex; flex-direction: column; gap: 14px; overflow: hidden; transition: border-color 400ms ease; }
  .cou-cupon:has(.cou-filas) { border-color: var(--pp-acc); }
  .cou-cupon .cou-tarjeta { position: relative; display: flex; flex-direction: column; gap: 14px; background: transparent; border: 0; padding: 0; transform: none !important; }
  .cou-talon-top { display: flex; justify-content: space-between; align-items: center; gap: 10px; font-size: 11px; letter-spacing: .2em; text-transform: uppercase;
    color: var(--pp-ink2); border-bottom: 1px dashed var(--pp-ink); padding-bottom: 12px; }
  /* El punto de estado parpadea mientras está pendiente y se queda quieto,
     en el acento, cuando se confirma. */
  .cou-talon-estado { display: flex; align-items: center; gap: 6px; transition: color 400ms ease; }
  .cou-talon-estado::before { content: ""; width: 7px; height: 7px; border-radius: 50%; background: var(--pp-ink2); animation: couParpadeo 1.6s ease-in-out infinite; }
  .cou-cupon:has(.cou-filas) .cou-talon-estado::before { animation: none; background: var(--pp-acc); }
  @keyframes couParpadeo { 0%, 100% { opacity: 1; } 50% { opacity: .2; } }
  .cou-campo { display: flex; flex-direction: column; gap: 6px; }
  .cou-etiqueta { font-size: 11px; letter-spacing: .2em; text-transform: uppercase; color: var(--pp-ink2); }
  .cou-input { min-height: 48px; border: 0; border-bottom: 1px solid var(--pp-ink); border-radius: 0; background: transparent; color: var(--pp-ink);
    font-family: var(--cou-sans), 'Space Grotesk', sans-serif; font-size: 15px; padding: 0; outline: none; }
  .cou-contador { display: flex; align-items: center; border-bottom: 1px solid var(--pp-ink); min-height: 48px; }
  .cou-contador button { width: 44px; min-height: 44px; border: 0; background: transparent; color: var(--pp-ink); cursor: pointer;
    font-family: var(--cou-serif), 'Bodoni Moda', serif; font-size: 26px; line-height: 1; }
  .cou-contador button:disabled { opacity: .35; cursor: default; }
  .cou-contador > span { flex: 1; text-align: center; font-family: var(--cou-serif), 'Bodoni Moda', serif; font-size: 30px; line-height: 1; }
  .cou-filas { display: flex; flex-direction: column; }
  .cou-fila { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 9px 0; border-bottom: 1px solid color-mix(in srgb, currentColor 25%, transparent); font-size: 14px; }
  .cou-fila--ultima { border-bottom: 0; }
  .cou-fila-valor { text-align: right; font-family: var(--cou-serif), 'Bodoni Moda', serif; font-size: 17px; }
  .cou-precio { display: flex; justify-content: space-between; gap: 12px; font-size: 12px; letter-spacing: .14em; text-transform: uppercase; color: var(--pp-ink2); }
  .cou-precio-valor { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; color: var(--pp-ink); text-transform: none; letter-spacing: 0; }
  .cou-precio-total { font-family: var(--cou-serif), 'Bodoni Moda', serif; font-size: 22px; line-height: 1; }
  .cou-precio-detalle { font-size: 11px; letter-spacing: .1em; }
  .cou-btn-solido { min-height: 52px; border: 1px solid var(--pp-ink); background: var(--pp-acc); color: #FFFFFF; cursor: pointer;
    font-weight: 600; font-size: 12px; letter-spacing: .24em; text-transform: uppercase; padding: 0 18px; transition: background 200ms ease; }
  @media (hover: hover) { .cou-btn-solido:hover { background: var(--pp-ink); } }
  .cou-btn-solido:disabled { opacity: .6; cursor: default; }
  .cou-btn-fantasma { min-height: 48px; border: 1px solid currentColor; background: transparent; color: inherit; cursor: pointer;
    font-weight: 600; font-size: 12px; letter-spacing: .18em; text-transform: uppercase; padding: 0 18px; }
  .cou-error { margin: 0; font-size: 12px; letter-spacing: .06em; color: var(--pp-acc2); }
  /* El sello "sí": dos anillos en el acento, cae girando al confirmar. */
  .cou-cupon .cou-sello { position: absolute; right: 14px; bottom: 80px; width: 128px; aspect-ratio: 1; border-radius: 50%; pointer-events: none;
    opacity: 0; transform: rotate(18deg) scale(1.9) translateY(-120px); color: var(--pp-acc);
    border: 2px solid currentColor; box-shadow: inset 0 0 0 3px #FFFFFF, inset 0 0 0 3.8px currentColor;
    display: flex; align-items: flex-end; justify-content: center; padding-bottom: 16px; box-sizing: border-box;
    font-weight: 600; font-size: 8px; letter-spacing: .18em; text-transform: uppercase; }
  .cou-cupon .cou-sello::before { content: "sí"; position: absolute; left: 0; right: 0; top: 34px; text-align: center;
    font-family: var(--cou-serif), 'Bodoni Moda', serif; font-style: italic; font-size: 34px; letter-spacing: 0; text-transform: none; line-height: 1; }
  .cou-petalos { display: none; }

  /* ── 06 Álbum: la sesión de tapa ───────────────────────────────────── */
  .cou-panel--album { background: #F7F5F0; color: #0B0B0B; justify-content: flex-start; gap: 14px; }
  .cou-panel--album-b { background: #EFEBE3; }
  .cou-contactos { flex: 1; min-height: 0; display: grid; grid-template-columns: repeat(6, 1fr); grid-template-rows: repeat(3, 1fr); gap: 6px; max-width: 900px; }
  .cou-contacto { position: relative; overflow: hidden; min-height: 0; border: 1px solid #0B0B0B; cursor: pointer;
    background: repeating-linear-gradient(135deg, #D7D1C4 0 8px, #E6E1D6 8px 16px); }
  .cou-contacto-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; filter: grayscale(1); }
  .cou-bano { position: absolute; inset: 0; mix-blend-mode: multiply; opacity: 0; transition: opacity 200ms linear; }
  .cou-bano--1 { background: color-mix(in srgb, var(--pp-acc) 50%, transparent); }
  .cou-bano--2 { background: color-mix(in srgb, var(--pp-acc2) 45%, transparent); }
  .cou-bano--3 { background: rgba(31,74,58,.45); }
  .cou-bano--4 { background: rgba(27,42,92,.45); }
  .cou-bano--5 { background: rgba(180,83,46,.5); }
  .cou-contacto-n { position: absolute; left: 8px; bottom: 6px; z-index: 1; font-size: 11px; letter-spacing: .14em; color: #0B0B0B; }
  .cou-contactos[data-cantidad="5"] .cou-contacto:nth-child(1) { grid-column: 1 / 4; grid-row: 1 / 3; }
  .cou-contactos[data-cantidad="5"] .cou-contacto:nth-child(2) { grid-column: 4 / 7; grid-row: 1 / 2; }
  .cou-contactos[data-cantidad="5"] .cou-contacto:nth-child(3) { grid-column: 4 / 6; grid-row: 2 / 3; }
  .cou-contactos[data-cantidad="5"] .cou-contacto:nth-child(4) { grid-column: 6 / 7; grid-row: 2 / 3; }
  .cou-contactos[data-cantidad="5"] .cou-contacto:nth-child(5) { grid-column: 1 / 7; grid-row: 3 / 4; }
  .cou-contactos[data-cantidad="4"] .cou-contacto:nth-child(1) { grid-column: 1 / 4; grid-row: 1 / 3; }
  .cou-contactos[data-cantidad="4"] .cou-contacto:nth-child(2) { grid-column: 4 / 7; grid-row: 1 / 2; }
  .cou-contactos[data-cantidad="4"] .cou-contacto:nth-child(3) { grid-column: 4 / 7; grid-row: 2 / 3; }
  .cou-contactos[data-cantidad="4"] .cou-contacto:nth-child(4) { grid-column: 1 / 7; grid-row: 3 / 4; }
  .cou-contactos[data-cantidad="3"] .cou-contacto:nth-child(1) { grid-column: 1 / 4; grid-row: 1 / 4; }
  .cou-contactos[data-cantidad="3"] .cou-contacto:nth-child(2) { grid-column: 4 / 7; grid-row: 1 / 3; }
  .cou-contactos[data-cantidad="3"] .cou-contacto:nth-child(3) { grid-column: 4 / 7; grid-row: 3 / 4; }
  .cou-contactos[data-cantidad="2"] .cou-contacto:nth-child(1) { grid-column: 1 / 4; grid-row: 1 / 4; }
  .cou-contactos[data-cantidad="2"] .cou-contacto:nth-child(2) { grid-column: 4 / 7; grid-row: 1 / 4; }
  .cou-contactos[data-cantidad="1"] .cou-contacto:nth-child(1) { grid-column: 1 / 7; grid-row: 1 / 4; }

  /* ── 07 Música: la banda sonora ────────────────────────────────────── */
  .cou-eq { display: flex; align-items: flex-end; gap: 5px; height: 36px; }
  .cou-eq span { width: 2px; height: 100%; background: currentColor; transform-origin: bottom; animation: couEq 1.1s ease-in-out infinite; }
  .cou-eq span:nth-child(3) { background: var(--pp-acc); }
  @keyframes couEq { 0%, 100% { transform: scaleY(.3); } 50% { transform: scaleY(1); } }
  .cou-musica form.cou-tarjeta { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; transform: none !important; }
  .cou-musica .cou-etiqueta { display: none; }
  .cou-musica .cou-input { border-bottom-color: currentColor; color: inherit; min-width: 0; }
  .cou-musica .cou-error { grid-column: 1 / -1; color: var(--pp-acc); }
  .cou-musica .cou-btn-solido { grid-column: 1 / -1; min-height: 48px; border: 1px solid var(--pp-bg); background: var(--pp-bg); color: var(--pp-ink); }
  @media (hover: hover) { .cou-musica .cou-btn-solido:hover { background: var(--pp-acc); border-color: var(--pp-acc); color: #FFFFFF; } }
  .cou-lista { display: flex; flex-direction: column; border-top: 1px solid currentColor; margin-top: 12px; counter-reset: tema; }
  .cou-lista-fila { display: flex; align-items: baseline; gap: 12px; padding: 12px 0; border-bottom: 1px solid color-mix(in srgb, currentColor 30%, transparent); counter-increment: tema; }
  .cou-lista-fila::before { content: counter(tema, decimal-leading-zero); font-size: 11px; letter-spacing: .14em; opacity: .6; flex: 0 0 auto; }
  .cou-lista-texto { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .cou-lista-tema { font-family: var(--cou-serif), 'Bodoni Moda', serif; font-size: 22px; line-height: 1; }
  .cou-lista-quien { font-size: 12px; letter-spacing: .12em; text-transform: uppercase; opacity: .6; }

  /* ── 08 Regalos: los créditos ──────────────────────────────────────── */
  .cou-tarjeta--banco { position: relative; z-index: 1; background: #FFFFFF; color: var(--pp-ink); border: 1px solid var(--pp-ink); padding: 16px 18px;
    display: flex; flex-direction: column; gap: 10px; transform: none !important; }
  .cou-tarjeta--banco + .cou-tarjeta--banco { margin-top: 12px; }
  .cou-tarjeta-kicker { font-size: 11px; letter-spacing: .2em; text-transform: uppercase; color: var(--pp-ink2); }
  .cou-tarjeta-mensaje { margin: 0; font-size: 14px; line-height: 1.5; color: var(--pp-ink2); }
  .cou-fila-texto { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .cou-fila-etq { font-size: 10px; letter-spacing: .2em; text-transform: uppercase; color: var(--pp-ink2); }
  .cou-fila-dato { font-size: 14px; letter-spacing: .06em; overflow-wrap: anywhere; }
  .cou-fila--copiable:first-child { border-bottom: 1px solid var(--pp-ink); }
  .cou-fila--copiable:first-child .cou-fila-dato { font-family: var(--cou-serif), 'Bodoni Moda', serif; font-size: 24px; line-height: 1; letter-spacing: 0; }
  .cou-tarjeta--banco .cou-fila--ultima { font-size: 12px; letter-spacing: .12em; text-transform: uppercase; color: var(--pp-ink2); }
  .cou-btn-copiar { flex: 0 0 auto; min-height: 44px; padding: 0 12px; border: 1px solid var(--pp-ink); background: transparent; color: var(--pp-ink);
    font-weight: 600; font-size: 11px; letter-spacing: .2em; text-transform: uppercase; cursor: pointer; transition: background 200ms ease, color 200ms ease; }
  @media (hover: hover) { .cou-btn-copiar:hover { background: var(--pp-ink); color: #FFFFFF; } }
  .cou-btn-copiar--hecho { background: var(--pp-ink); color: #FFFFFF; }

  /* ── 09 Trivia: el cuestionario, entero en el acento ───────────────── */
  .cou-quiz { background: var(--pp-acc) !important; color: #FFFFFF; }
  .cou-quiz .cou-folio { border-bottom-color: #FFFFFF; color: #FFFFFF; }
  .cou-quiz .cou-tarjeta { display: flex; flex-direction: column; gap: 12px; transform: none !important; }
  .cou-quiz .cou-tarjeta-kicker { font-family: var(--cou-serif), 'Bodoni Moda', serif; font-style: italic; font-size: clamp(22px, 6vw, 36px); text-transform: none; letter-spacing: 0; color: inherit; }
  .cou-quiz .cou-tarjeta-pregunta, .cou-quiz .cou-tarjeta-titulo { font-family: var(--cou-serif), 'Bodoni Moda', serif; font-size: clamp(40px, 11vw, 88px); line-height: .95; letter-spacing: -.02em; max-width: 16ch; }
  .cou-quiz .cou-tarjeta-mensaje { margin: 0; font-size: 15px; color: inherit; opacity: .85; }
  .cou-opciones { display: flex; flex-direction: column; gap: 10px; counter-reset: opcion; }
  .cou-opcion { min-height: 52px; border: 1px solid #FFFFFF; background: transparent; color: #FFFFFF; cursor: pointer; counter-increment: opcion;
    font-family: var(--cou-serif), 'Bodoni Moda', serif; font-size: 19px; text-align: left; padding: 0 16px;
    display: flex; justify-content: space-between; align-items: center; gap: 12px; transition: background 200ms ease, color 200ms ease; }
  .cou-opcion::after { content: counter(opcion, upper-alpha); font-family: var(--cou-sans), 'Space Grotesk', sans-serif; font-size: 11px; letter-spacing: .2em; text-transform: uppercase; }
  .cou-opcion--bien { background: #FFFFFF; color: var(--pp-acc); }
  .cou-opcion--bien::after { content: "Correcta"; }
  .cou-opcion--mal { opacity: .6; }
  .cou-opcion--mal::after { content: "Casi"; }
  @media (min-width: 1024px) {
    .cou-quiz .cou-spread > .cou-tarjeta { grid-column: 1 / -1; max-width: none; justify-self: stretch; display: grid; grid-template-columns: 1fr 1fr; column-gap: 72px; align-items: center; }
    .cou-quiz .cou-tarjeta-kicker, .cou-quiz .cou-tarjeta-pregunta { grid-column: 1; max-width: 560px; justify-self: end; width: 100%; }
    .cou-quiz .cou-opciones { grid-column: 2; grid-row: 1 / span 2; max-width: 560px; width: 100%; }
  }

  /* ── 10 Tu pase: la contratapa ─────────────────────────────────────── */
  .cou-pase { justify-content: space-between; padding-bottom: calc(28px + env(safe-area-inset-bottom)); }
  .cou-pagina--qr { align-items: flex-start; }
  .cou-qr { position: relative; width: min(100%, 300px); aspect-ratio: 1; background: var(--pp-bg); padding: 16px; box-sizing: border-box; margin-bottom: 26px; }
  .cou-qr .qr-ingreso, .cou-qr section { background: transparent !important; border: none !important; padding: 0 !important; }
  .cou-qr img, .cou-qr svg, .cou-qr canvas { width: 100% !important; height: auto !important; display: block; }
  .cou-qr-etq { position: absolute; left: 0; right: 0; bottom: -22px; text-align: center; font-size: 11px; letter-spacing: .2em; text-transform: uppercase; color: color-mix(in srgb, var(--pp-bg) 60%, transparent); }
  .cou-pase-cabeza { display: flex; align-items: flex-end; justify-content: space-between; gap: 14px; }
  .cou-pase-numero { display: flex; flex-direction: column; }
  .cou-pase-numero > span:last-child { font-family: var(--cou-serif), 'Bodoni Moda', serif; font-size: clamp(64px, 20vw, 140px); line-height: .82; letter-spacing: -.03em; }
  .cou-lineas--pase .cou-linea { border-bottom-color: color-mix(in srgb, currentColor 30%, transparent); }
  .cou-lineas--pase .cou-linea > span:first-child { opacity: .6; }
  .cou-info-extra { margin-top: 4px; }
  .cou-info-extra #info-adicional { background: transparent !important; padding: 0 !important; }
  .cou-info-extra #ia-trigger-btn { background: transparent !important; color: inherit !important; border: 1px solid currentColor !important;
    border-radius: 0 !important; font-weight: 600 !important; letter-spacing: .22em !important; text-transform: uppercase; }
  .cou-raiz .ia-icon-box, .cou-raiz svg.lucide { display: none !important; }
  .cou-pase-pie { display: flex; flex-direction: column; gap: 16px; }
  .cou-despedida { font-family: var(--cou-serif), 'Bodoni Moda', serif; font-style: italic; font-size: clamp(30px, 8vw, 48px); line-height: 1; }
  .cou-replay { cursor: pointer; color: var(--pp-acc); }
  .cou-credito { display: inline-flex; align-items: center; gap: 8px; opacity: .7; }

  /* ── El sello circular ─────────────────────────────────────────────── */
  .cou-sello-circular { position: relative; width: clamp(84px, 22vw, 110px); aspect-ratio: 1; flex: 0 0 auto; color: var(--pp-acc); }
  .cou-sello-circular svg { position: absolute; inset: 0; animation: couGira 30s linear infinite; }
  .cou-sello-circular text { font-family: var(--cou-sans), 'Space Grotesk', sans-serif; font-size: 9px; letter-spacing: 1.8px; font-weight: 600; fill: currentColor; }
  .cou-sello-centro { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
    font-family: var(--cou-serif), 'Bodoni Moda', serif; font-style: italic; font-size: 26px; color: var(--pp-acc); }
  .cou-sello-circular--relleno { color: var(--pp-ink); width: clamp(64px, 16vw, 84px); }
  .cou-sello-circular--relleno svg { animation-duration: 28s; }
  .cou-sello-circular--relleno .cou-sello-centro { font-size: 24px; }
  @keyframes couGira { to { transform: rotate(360deg); } }

  /* ── La tapa ───────────────────────────────────────────────────────── */
  .cou-portada { position: absolute; inset: 0; z-index: 5; overflow: hidden; background: var(--pp-bg); color: var(--pp-ink); }
  .cou-portada-hoja { position: absolute; inset: 0; display: grid; grid-template-rows: auto 1fr auto; box-sizing: border-box;
    padding: calc(14px + env(safe-area-inset-top)) max(18px, calc((100% - 1100px) / 2)) calc(18px + env(safe-area-inset-bottom)); }
  .cou-cabecera { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; border-bottom: 1px solid var(--pp-ink); padding-bottom: 8px;
    font-size: 11px; letter-spacing: .22em; text-transform: uppercase; }
  .cou-cabecera > span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .cou-cabecera-edicion { font-family: var(--cou-serif), 'Bodoni Moda', serif; font-style: italic; text-transform: none; letter-spacing: 0; font-size: 15px; }
  .cou-tapa-cuerpo { position: relative; min-height: 0; display: flex; flex-direction: column; }
  /* El masthead: una didona enorme que no se parte; el renglón más largo
     manda el cuerpo. */
  .cou-masthead { margin: 10px 0 0; position: relative; z-index: 2; display: flex; flex-direction: column; line-height: .84; letter-spacing: -.02em;
    font-size: min(clamp(64px, 22vw, 180px), 18vh, calc((100vw - 40px) / (var(--largo, 9) * 0.56))); }
  @media (min-width: 1024px) { .cou-masthead { font-size: min(13vw, 220px, 24vh, calc((min(100vw, 1100px) - 40px) / (var(--largo, 9) * 0.56))); } }
  .cou-masthead-linea { overflow: hidden; display: block; white-space: nowrap; }
  .cou-masthead-linea > span { display: block; }
  .cou-masthead-linea--der { text-align: right; }
  .cou-amp { font-style: italic; color: var(--pp-acc); font-size: .6em; vertical-align: .25em; }
  .cou-letra { display: inline-block; animation: couDeslizar calc(var(--n, 12) * 3.5s) cubic-bezier(.16,1,.3,1) infinite; animation-delay: calc(var(--i, 0) * -3.5s); }
  @keyframes couDeslizar { 0%, 98.6% { transform: translateX(0); } 99.1% { transform: translateX(28px); } 100% { transform: translateX(0); } }
  /* La foto de tapa, debajo del masthead, con la trama de imprenta suave
     encima, el recuadro "en esta edición" y el sello del pase. */
  .cou-tapa-foto { position: relative; flex: 1; min-height: 26vh; margin-top: -1.2em; overflow: hidden; border: 1px solid var(--pp-ink);
    background: repeating-linear-gradient(135deg, #D9D2C6 0 8px, #E7E1D6 8px 16px); }
  @media (min-width: 1024px) { .cou-tapa-foto { max-width: 900px; margin-left: auto; margin-right: auto; width: 100%; } }
  .cou-tapa-trama { position: absolute; inset: 0; z-index: 1; pointer-events: none; opacity: .28;
    background-image: radial-gradient(var(--pp-ink) 2.4px, transparent 2.6px); background-size: 11px 11px; }
  .cou-tapa-foto-etq { position: absolute; left: 12px; bottom: 10px; z-index: 2; font-size: 11px; letter-spacing: .2em; text-transform: uppercase; }
  .cou-edicion { position: absolute; right: 12px; top: 12px; z-index: 2; display: flex; flex-direction: column; align-items: flex-end; gap: 4px; text-align: right;
    background: var(--pp-bg); padding: 10px 12px; border: 1px solid var(--pp-ink); max-width: 60%; }
  .cou-edicion-titulo { font-family: var(--cou-serif), 'Bodoni Moda', serif; font-size: clamp(18px, 4.8vw, 24px); line-height: 1.05; }
  .cou-edicion-pie { font-family: var(--cou-serif), 'Bodoni Moda', serif; font-style: italic; font-size: 15px; color: var(--pp-acc); }
  .cou-tapa-sello { position: absolute; left: 12px; top: 12px; z-index: 2; }
  .cou-tapa-pie { display: grid; grid-template-columns: 1fr auto; gap: 14px; align-items: end; border-top: 1px solid var(--pp-ink); padding-top: 12px; }
  .cou-tapa-pie-texto { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
  .cou-tapa-mensaje { margin: 0; font-family: var(--cou-serif), 'Bodoni Moda', serif; font-size: clamp(17px, 4.6vw, 22px); line-height: 1.2; }
  .cou-tapa-btn { min-height: 50px; max-width: 320px; border: 1px solid var(--pp-ink); background: var(--pp-ink); color: var(--pp-bg); cursor: pointer;
    font-weight: 600; font-size: 12px; letter-spacing: .24em; text-transform: uppercase; padding: 0 18px;
    display: flex; align-items: center; justify-content: space-between; gap: 12px; transition: background 200ms ease, border-color 200ms ease; }
  @media (hover: hover) { .cou-tapa-btn:hover { background: var(--pp-acc); border-color: var(--pp-acc); } }
  .cou-barras { flex: 0 0 auto; color: var(--pp-ink); }
  .cou-barras text { font-family: var(--cou-sans), 'Space Grotesk', sans-serif; font-size: 7px; letter-spacing: 1.5px; fill: currentColor; }

  /* ── Riel, pista y lupa ────────────────────────────────────────────── */
  .cou-riel { position: absolute; right: 0; top: 0; bottom: 0; width: 40px; z-index: 4; display: flex; flex-direction: column;
    align-items: center; justify-content: space-between; padding: calc(14px + env(safe-area-inset-top)) 0 calc(14px + env(safe-area-inset-bottom));
    opacity: 0; transition: opacity 600ms ease; pointer-events: none; border-left: 1px solid color-mix(in srgb, var(--pp-ink) 40%, transparent) !important; }
  .cou-riel-top, .cou-riel-etiqueta { writing-mode: vertical-rl; font-size: 10px; letter-spacing: .3em; text-transform: uppercase; color: var(--pp-ink); }
  .cou-riel-linea { flex: 1; width: 1px; margin: 16px 0; background: transparent !important; position: relative; }
  .cou-riel-barra { position: absolute; left: -1px; top: 0; width: 2px; height: 0%; background: var(--pp-acc); transition: height 200ms linear; display: block; }
  .cou-pista { position: absolute; left: 0; right: 40px; bottom: calc(18px + env(safe-area-inset-bottom)); z-index: 6; text-align: center;
    font-size: 11px; letter-spacing: .28em; color: var(--pp-ink2);
    opacity: 0; transition: opacity 600ms ease; pointer-events: none; animation: couPista 2.4s ease-in-out infinite; }
  @keyframes couPista { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(6px); } }

  .cou-lupa { position: fixed; inset: 0; z-index: 200; background: color-mix(in srgb, var(--pp-ink) 94%, transparent);
    display: flex; align-items: center; justify-content: center; padding: 24px; cursor: zoom-out; }
  .cou-lupa-cerrar { position: absolute; top: 20px; right: 20px; width: 40px; height: 40px; border: 1px solid var(--pp-bg);
    background: transparent; color: var(--pp-bg); font-size: 18px; line-height: 1; cursor: pointer; }
  .cou-lupa-img { max-width: 100%; max-height: 88vh; object-fit: contain; cursor: default; border: 1px solid var(--pp-bg); }

  @media (prefers-reduced-motion: reduce) {
    .cou-raiz * { animation: none !important; }
    .cou-scroller [data-xin] { opacity: 1 !important; transform: none !important; }
    .cou-foto { --cou-punto: 0; }
  }
`;
