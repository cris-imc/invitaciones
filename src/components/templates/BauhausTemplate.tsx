"use client";

/**
 * BAUHAUS · Colección Iconic — sub-colección "Tipográfica Editorial"
 * Variante: Primarios (base).
 *
 * GENERADO por scripts/derivar-tipografica.js a partir de
 * EditorialBlancNoirTemplate.tsx — no editar a mano: el motor se arregla en
 * Editorial Blanc & Noir; el render en scripts/jsx/tipografica/bau.jsx, los
 * estilos en scripts/css/tipografica/bau.css y las caras y la paleta en
 * scripts/familias/tipografica/bau.json.
 *
 * La escuela: Jost geométrica en mayúsculas, Work Sans para el texto, tres
 * primarios más el negro y formas hechas sólo con CSS (círculo, semicírculo,
 * cuarto, banda). La tapa es una composición de cinco formas con parallax;
 * la retícula con junta negra de 3 px arma el countdown, el álbum y los
 * formularios. Nunca un degradé.
 *
 * Sin imágenes propias: son fuentes y CSS.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Jost, Work_Sans } from "next/font/google";
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

const bauSerif = Jost({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
  variable: "--bau-serif",
});
const bauSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--bau-sans",
});
// El mono es la ficha técnica de la revista: folios, kickers y datos.

// ─── Paleta ─────────────────────────────────────────────────────────────────
// Las cinco variantes de "Capas de papel" cambian SOLO estos once colores
// (el script de variantes reemplaza este bloque entero, ver
// scripts/gen-capas-de-papel-variants.js). El dibujo es el mismo: los SVG de
// las escenas leen var(--pp-…), así que un cambio acá repinta cerros, cielo,
// sol y figuras de una sola vez.
const PALETA = {
  bg: "#F2ECE0",
  bg2: "#E8E1D2",
  ink: "#111111",
  ink2: "#5A5650",
  acc: "#D4321F",
  acc2: "#F2C319",
  sky1: "#F2ECE0",
  sky2: "#E8E1D2",
  hill1: "#E8E1D2",
  hill2: "#5A5650",
  hill3: "#111111",
  night: "#111111",
  nightInk: "#F2ECE0",
  acc3: "#1E3FBF",
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

interface BauhausTemplateProps {
  invitation: Record<string, unknown>;
  guest?: GuestRecord | null;
  isPersonalized?: boolean;
}

/** El número de pase, con tres cifras como en el mockup ("PASE Nº 042"). */
function numeroDePase(orderNumber: number | undefined): string {
  return String(orderNumber ?? 42).padStart(3, "0");
}

export function BauhausTemplate({ invitation, guest, isPersonalized = false }: BauhausTemplateProps) {
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
      el.style.setProperty("--bau-y", `${dist}px`);
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
            el.style.setProperty("--bau-y", "0px");
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
            ven.style.setProperty("--bau-punto", (7.2 * (1 - t)).toFixed(2));
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
          clase: `${bauSerif.variable} ${bauSans.variable}`,
          fuente: "var(--bau-sans), 'Work Sans', sans-serif",
        }}
      />
    );
  }


  // El total de pliegos, para los folios ("03 / 10"). Se cuenta lo que esta
  // invitación realmente tiene: si no hay trivia, no existe el pliego 09 y el
  // pase deja de ser 10 de 10.
  const totalPliegos = cuenta;
  const folio = (n: string) => `${n} / ${String(totalPliegos).padStart(2, "0")}`;

  // El nombre va en bloques sobre fondo crema, uno por renglón; el más largo
  // manda el cuerpo (Jost es geométrica y no se parte).
  const renglones = saludaAlInvitado ? [nombreInvitado] : [nombre1, ...(nombre2 ? [nombre2] : [])];
  const renglonMasLargo = Math.max(5, ...renglones.map((n) => n.length));
  const totalLetras = Math.max(1, renglones.join("").replace(/\s/g, "").length);

  // La frase: el medio en negro sobre amarillo (invertido) y el cierre sobre
  // un bloque crema.
  const tonoDePalabra = (i: number) => {
    const n = palabras.length;
    if (i >= Math.ceil(n * 0.7)) return "bau-bloque";
    if (i >= Math.floor(n * 0.25) && i < desdeAcento) return "bau-invertido";
    return undefined;
  };

  const kickerDelEvento = tx(invitation.tipo === "CASAMIENTO" ? "invitacion.evento.nosCasamos" : invitation.tipo === "QUINCE_ANOS" ? "invitacion.evento.misQuinceAnos" : "invitacion.evento.teInvitamos");
  const mesCorto = mesLargo.slice(0, 3);

  return (
    <div
      ref={raizRef}
      className={`${bauSerif.variable} ${bauSans.variable} bau-raiz`}
      style={varsDePaleta}
    >
      <style>{CSS_BAU}</style>
      <style>{COVER_RESPONSIVE_STYLE}</style>

      <div ref={scrollerRef} className="bau-scroller">
        {/* ── 01 Guardá la fecha ─────────────────────────────────────────
            Inversión en negro: un círculo azul, un semicírculo amarillo, la
            fecha en tres renglones y la foto con la esquina redonda. */}
        <section data-tone="dark" data-screen-label={tx("invitacion.saveTheDate.guardaLaFecha")} className="bau-section bau-std">
          <span className="bau-forma bau-std-circulo" aria-hidden="true" />
          <span className="bau-forma bau-std-medio" aria-hidden="true" />
          <div className="bau-folio">
            <span data-xin="1" data-dist="-40">{nSaveTheDate} — {tx("invitacion.saveTheDate.guardaLaFecha").toUpperCase()}</span>
            <span data-xin="1" data-dist="40">{folio(nSaveTheDate)}</span>
          </div>
          <div className="bau-spread">
            <div className="bau-pagina">
              <div className="bau-fecha">
                <span data-xin="1" data-dist="-160" className="bau-fecha-linea bau-fecha-linea--dia">{diaNum}</span>
                <span data-xin="1" data-dist="160" data-delay="120" className="bau-fecha-linea bau-fecha-linea--mes">{mesCorto}</span>
                <span data-xin="1" data-dist="-160" data-delay="240" className="bau-fecha-linea bau-fecha-linea--anio">{anio}</span>
              </div>
              <div data-xin="1" data-delay="360" className="bau-fecha-pie">
                <span>{diaSemana} · {hora} H</span>
                <AddToCalendarLink
                  eventName={titulo}
                  targetDate={fechaHora}
                  location={[lugarNombre, direccion].filter(Boolean).join(", ")}
                  className="bau-chip bau-chip--claro"
                  showIcon={false}
                >
                  {tx("invitacion.saveTheDate.agregarAlCalendario").toUpperCase()} →
                </AddToCalendarLink>
              </div>
            </div>

            {hayFoto && (
              <div ref={ventanaRef} data-xin="1" data-delay="200" data-dist="0" className="bau-foto">
                {fotoMobile && (
                  <div className="acp-mobile-only bau-foto-capa">
                    <AnimatedCoverPhoto photoSrc={fotoMobile} tint={false} effect="enfoque" scrimColorRgb="17,17,17" />
                  </div>
                )}
                {fotoDesktop && (
                  <div className="acp-desktop-only bau-foto-capa">
                    <AnimatedCoverPhoto photoSrc={fotoDesktop} tint={false} effect="enfoque" scrimColorRgb="17,17,17" />
                  </div>
                )}
                {/* La trama que tapa la foto y se disuelve al subir: el radio
                    del punto lo mueve el motor en --bau-punto. */}
                <span className="bau-foto-revelado" aria-hidden="true" />
                <span className="bau-foto-etq">{tx("invitacion.album.nuestraFoto").toUpperCase()}</span>
                <span className="bau-foto-cuadrado" aria-hidden="true" />
              </div>
            )}
          </div>
        </section>

        {/* ── 02 Falta poco ──────────────────────────────────────────────
            La retícula: cuatro módulos de color con una junta negra de 3 px,
            cada uno con una forma asomando, entre dos marquesinas. */}
        <section data-tone="light" data-screen-label={tx("invitacion.cuentaRegresiva.kicker")} className="bau-section bau-countdown">
          <div className="bau-folio">
            <span data-xin="1" data-dist="-40">{nCountdown} — {tx("invitacion.cuentaRegresiva.faltan").toUpperCase()}</span>
            <span data-xin="1" data-dist="40">{folio(nCountdown)}</span>
          </div>
          <div className="bau-marquesina bau-marquesina--negra" aria-hidden="true">
            <div className="bau-marquesina-tira">
              {[0, 1].map((i) => (
                <span key={i}>
                  {tx("invitacion.cuentaRegresiva.dias")} ● {tx("invitacion.cuentaRegresiva.horas")} ■ {tx("invitacion.cuentaRegresiva.minutos")} ▲ {tx("invitacion.cuentaRegresiva.segundos")} ● {diaSemana.toLowerCase()} {diaNum} {tx("invitacion.evento.de")} {mesLargo} ■&nbsp;
                </span>
              ))}
            </div>
          </div>
          <div className="bau-spread">
            <div className="bau-pagina bau-pagina--entera">
              <CuentaBauhaus targetDate={fechaHora} />
            </div>
          </div>
          <div className="bau-marquesina bau-marquesina--filete bau-marquesina--contraria" aria-hidden="true">
            <div className="bau-marquesina-tira">
              {[0, 1].map((i) => (
                <span key={i}>
                  {[lugarNombre, ciudad, `${hora} h`, dressCode].filter(Boolean).join(" · ").toUpperCase()} ·&nbsp;
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── 03 Unas palabras ───────────────────────────────────────────
            Pliego amarillo: un cuarto rojo arriba a la derecha, el disco azul
            que pendula abajo y la frase con palabras en bloque. */}
        {hayFrase && (
          <section data-tone="light" data-screen-label={tx("invitacion.frase.etiqueta")} className="bau-section bau-frase-seccion">
            <span className="bau-forma bau-frase-cuarto" aria-hidden="true" />
            <span className="bau-forma bau-frase-pendulo" aria-hidden="true" />
            <div className="bau-folio">
              <span data-xin="1" data-dist="-40">{nFrase} — {tx("invitacion.frase.unasPalabras").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nFrase)}</span>
            </div>
            <div className="bau-spread">
              <h2 ref={fraseRef} className="bau-frase">
                {palabras.map((p, i) => (
                  // El espacio va fuera del span: el motor pone cada palabra
                  // en inline-block y un espacio adentro se colapsa a cero.
                  <span key={i}>
                    <span data-w="1" className={tonoDePalabra(i)}>{p}</span>{" "}
                  </span>
                ))}
              </h2>
              <div data-xin="1" data-delay="900" data-dist="60" className="bau-firma">
                <span className="bau-forma bau-forma--circulo bau-firma-punto" aria-hidden="true" />
                <span>{tx("invitacion.frase.conAmor")} · {titulo}{ciudad ? `, ${ciudad}.` : "."}</span>
              </div>
            </div>
            <div className="bau-folio bau-folio--pie">
              <span>{titulo.toUpperCase()}</span>
              <span className="bau-barra" aria-hidden="true" />
            </div>
          </section>
        )}

        {/* ── 04 Cuándo y dónde ──────────────────────────────────────────
            Un módulo por lugar, cada uno con su color de fondo y una forma
            grande en la esquina: crema y cuarto amarillo, azul y círculo
            rojo, amarillo y semicírculo negro. */}
        <div
          id="details"
          data-pan="1"
          data-scroll={scrollVertical || panelesLugar.length <= 1 ? "vertical" : "lateral"}
          data-screen-label={tx("invitacion.ubicacion.cuandoYDonde")}
          className="bau-pan"
          style={{ "--st-pasos": Math.max(0, panelesLugar.length - 1) } as React.CSSProperties}
        >
          <div className="bau-pan-fijo">
            <div data-strip="1" className="bau-tira">
              <div data-tone="light" className="bau-panel bau-panel--crema">
                <span className="bau-forma bau-panel-forma" aria-hidden="true" />
                <div className="bau-folio">
                  <span>{nCuando} — {tx("invitacion.ubicacion.fiestaSalon").toUpperCase()}</span><span>{deLugar("recepcion")}</span>
                </div>
                <div className="bau-spread">
                  <div className="bau-pagina">
                    <span className="bau-panel-sub">Módulo {deLugar("recepcion").split(" ")[0]}</span>
                    <h2 className="bau-panel-titulo">{lugarNombre || ciudad}</h2>
                  </div>
                  <div className="bau-tarjeta-lugar">
                    <div className="bau-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{hora} h</span></div>
                    {direccion && <div className="bau-linea"><span>{tx("invitacion.ubicacion.direccion")}</span><span>{direccion}</span></div>}
                    {dressCode && <div className="bau-linea"><span>{tx("invitacion.ubicacion.dressCode")}</span><span>{dressCode}</span></div>}
                    {mapUrl && (
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="bau-cta">
                        {tx("invitacion.ubicacion.comoLlegar").toUpperCase()}<span>→</span>
                      </a>
                    )}
                  </div>
                </div>
                <div className="bau-folio bau-folio--pie">
                  <span>{[direccion, ciudad].filter(Boolean).join(" · ").toUpperCase()}</span>
                  {!scrollVertical && panelesLugar.length > 1 && <span>{tx("invitacion.portada.desliza").toUpperCase()} →</span>}
                </div>
              </div>

              {ceremoniaHabilitada && (
                <div id="ceremonia" data-tone="dark" className="bau-panel bau-panel--azul">
                  <span className="bau-forma bau-panel-forma" aria-hidden="true" />
                  <div className="bau-folio">
                    <span>{nCuando} — {ceremoniaTitulo.toUpperCase()}</span><span>{deLugar("ceremonia")}</span>
                  </div>
                  <div className="bau-spread">
                    <div className="bau-pagina">
                      <span className="bau-panel-sub">Módulo {deLugar("ceremonia").split(" ")[0]}</span>
                      <h2 className="bau-panel-titulo">{ceremoniaNombre || ceremoniaTitulo}</h2>
                    </div>
                    <div className="bau-tarjeta-lugar bau-tarjeta-lugar--negra">
                      {ceremoniaHora && <div className="bau-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{ceremoniaHora} h</span></div>}
                      {ceremoniaDireccion && <div className="bau-linea"><span>{tx("invitacion.ubicacion.direccion")}</span><span>{ceremoniaDireccion}</span></div>}
                    </div>
                  </div>
                  <div className="bau-folio bau-folio--pie">
                    <span>{tx("invitacion.ubicacion.ceremoniaCivil").toUpperCase()}</span>
                    {!scrollVertical && <span>{tx("invitacion.portada.desliza").toUpperCase()} →</span>}
                  </div>
                </div>
              )}

              {hayComoLlegar && (
                <div id="location" data-tone="light" className="bau-panel bau-panel--crema2">
                  <span className="bau-forma bau-panel-forma" aria-hidden="true" />
                  <div className="bau-folio">
                    <span>{nCuando} — {tx("invitacion.ubicacion.comoLlegar").toUpperCase()}</span><span>{deLugar("llegar")}</span>
                  </div>
                  <div className="bau-spread">
                    <div className="bau-pagina">
                      <span className="bau-panel-sub">Módulo {deLugar("llegar").split(" ")[0]}</span>
                      <h2 className="bau-panel-titulo">{tx("invitacion.ubicacion.comoLlegar")}</h2>
                    </div>
                    <div className="bau-tarjeta-lugar">
                      {embedMapUrl && (
                        <div className="bau-mapa">
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
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="bau-cta">
                        {tx("invitacion.ubicacion.abrirEnMapas").toUpperCase()}<span>→</span>
                      </a>
                    </div>
                  </div>
                  <div className="bau-folio bau-folio--pie">
                    <span>{[direccion, ciudad].filter(Boolean).join(" · ").toUpperCase()}</span>
                    {!scrollVertical && <span>{tx("invitacion.portada.desliza").toUpperCase()} →</span>}
                  </div>
                </div>
              )}

              {cronograma.length > 0 && (
                <div id="schedule" data-tone="light" className="bau-panel bau-panel--amarillo">
                  <span className="bau-forma bau-panel-forma" aria-hidden="true" />
                  <div className="bau-folio">
                    <span>{nCuando} — {tx("invitacion.ubicacion.cronograma").toUpperCase()}</span><span>{deLugar("cronograma")}</span>
                  </div>
                  <div className="bau-spread">
                    <div className="bau-pagina">
                      <span className="bau-panel-sub">Módulo {deLugar("cronograma").split(" ")[0]}</span>
                      <h2 className="bau-panel-titulo">{tx("invitacion.ubicacion.laNochePasoAPaso").split(",")[0]}</h2>
                    </div>
                    <div className="bau-tarjeta-lugar">
                      {cronograma.map((item, i) => (
                        <div key={i} className="bau-linea"><span>{item.time || ""}</span><span>{item.title}</span></div>
                      ))}
                    </div>
                  </div>
                  <div className="bau-folio bau-folio--pie">
                    <span>{fechaPuntos}</span>
                  </div>
                </div>
              )}
            </div>
            {!scrollVertical && panelesLugar.length > 1 && <Puntos cantidad={panelesLugar.length} />}
          </div>
        </div>

        {/* ── 05 Check-in ────────────────────────────────────────────────
            El formulario en retícula: un anillo azul detrás, la tarjeta
            blanca con borde de 3 px y el sello "SÍ" al confirmar. */}
        {rsvpHabilitado && (
          <section id="rsvp" data-tone="light" data-screen-label={tx("invitacion.rsvp.confirmar")} className="bau-section bau-checkin">
            <span className="bau-forma bau-checkin-anillo" aria-hidden="true" />
            <div className="bau-folio">
              <span data-xin="1" data-dist="-40">{nCheckin} — CHECK-IN</span>
              <span data-xin="1" data-dist="40">{folio(nCheckin)}</span>
            </div>
            <div className="bau-spread">
              <div className="bau-pagina">
                <h2 data-xin="1" data-dist="-80" className="bau-h2">
                  {tx("invitacion.rsvp.confirmaLinea1")}<br /><span className="bau-rojo">{tx("invitacion.rsvp.confirmaLinea2")}</span>
                </h2>
              </div>
              <div data-xin="1" data-delay="160" data-dist="80" className="bau-cupon">
                <CheckinBauhaus
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
            La retícula de fotos: junta negra de 3 px y una esquina redonda
            distinta en cada módulo. */}
        {todasLasFotos.length > 0 && (
          <div
            id="album"
            data-pan="1"
            data-scroll={scrollVertical || hojasDeFotos.length <= 1 ? "vertical" : "lateral"}
            data-screen-label={tx("invitacion.album.titulo")}
            className="bau-pan"
            style={{ "--st-pasos": Math.max(0, hojasDeFotos.length - 1) } as React.CSSProperties}
          >
            <div className="bau-pan-fijo bau-pan-fijo--album">
              <div data-strip="1" className="bau-tira">
                {hojasDeFotos.map((hoja, iHoja) => (
                  <div key={iHoja} data-tone="light" className={`bau-panel bau-panel--album${iHoja % 2 === 1 ? " bau-panel--album-b" : ""}`}>
                    <div className="bau-folio">
                      <span>{nAlbum} — {tx("invitacion.album.titulo").toUpperCase()}</span>
                      <span>{tx("invitacion.album.hojaDeTotal", { n: String(iHoja + 1).padStart(2, "0"), total: String(hojasDeFotos.length).padStart(2, "0") }).toUpperCase()} · {folio(nAlbum)}</span>
                    </div>
                    <h2 className="bau-h2 bau-h2--album">{tx("invitacion.album.titulo")} <span className="bau-rojo">{tx("invitacion.album.deFotos")}</span></h2>
                    <div className="bau-reticula" data-cantidad={hoja.length}>
                      {hoja.map((url, i) => (
                        <div
                          key={i}
                          data-sheet="1"
                          className="bau-modulo-foto"
                          role="button"
                          tabIndex={0}
                          onClick={() => setFotoAmpliada(url)}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setFotoAmpliada(url); }}
                          aria-label={tx("invitacion.album.ampliarFoto", { n: i + 1 })}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="" loading="lazy" className="bau-modulo-foto-img" />
                          <span data-colorwash="1" className={`bau-bano bau-bano--${(i % 5) + 1}`} aria-hidden="true" />
                          <span className="bau-modulo-foto-n">FOTO {String(i + 1).padStart(2, "0")}</span>
                        </div>
                      ))}
                    </div>
                    <div className="bau-folio bau-folio--pie">
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
            Pliego azul con un círculo amarillo, el ecualizador de barras
            anchas y la lista en módulos negros con viñeta geométrica. */}
        {sugerenciaMusicaHabilitada && (
          <section id="songs" data-tone="dark" data-screen-label={tx("invitacion.musica.titulo")} className="bau-section bau-musica">
            <span className="bau-forma bau-musica-circulo" aria-hidden="true" />
            <div className="bau-folio">
              <span data-xin="1" data-dist="-40">{nMusica} — {tx("invitacion.musica.titulo").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nMusica)}</span>
            </div>
            <div className="bau-spread">
              <div className="bau-pagina">
                <h2 data-xin="1" data-dist="-80" className="bau-h2">{tx("invitacion.sabor.preguntaCancionFaltar")}</h2>
                <div data-xin="1" data-delay="120" className="bau-eq" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((i) => <span key={i} style={{ animationDelay: `${i * 0.18}s` }} />)}
                </div>
              </div>
              <div className="bau-pagina">
                <CancionesBauhaus
                  invitationId={String(invitation.id ?? "")}
                  guestToken={guest?.uniqueToken}
                  guestName={nombreInvitado || tx("invitacion.evento.invitado")}
                />
              </div>
            </div>
          </section>
        )}

        {/* ── 08 Regalos ─────────────────────────────────────────────────
            Pliego crema con una media píldora roja, y las cuentas en
            módulos blancos con borde de 3 px. */}
        {hayRegalos && (
          <section id="banco" data-tone="light" data-screen-label={tx("invitacion.regalos.titulo")} className="bau-section bau-regalos">
            <span className="bau-forma bau-regalos-pildora" aria-hidden="true" />
            <div className="bau-folio">
              <span data-xin="1" data-dist="-40">{nRegalos} — {tx("invitacion.regalos.titulo").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nRegalos)}</span>
            </div>
            <div className="bau-spread">
              <div className="bau-pagina">
                <h2 data-xin="1" data-dist="-80" className="bau-h2">
                  {tx("invitacion.regalos.siQueresLinea1")}<br /><span className="bau-azul">{tx("invitacion.regalos.siQueresLinea2")}</span>
                </h2>
                {Boolean(invitation.regaloMensaje) && (
                  <p data-xin="1" data-delay="120" className="bau-parrafo">{String(invitation.regaloMensaje)}</p>
                )}
              </div>
              <div className="bau-pagina bau-pagina--junta">
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
            Pliego rojo con un disco negro abajo; las opciones son módulos
            crema con su forma de viñeta. */}
        {quizHabilitado && (
          <section id="quiz" data-tone="dark" data-screen-label="Quiz" className="bau-section bau-quiz">
            <span className="bau-forma bau-quiz-disco" aria-hidden="true" />
            <div className="bau-folio">
              <span data-xin="1" data-dist="-40">{nQuiz} — {triviaTitulo.toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nQuiz)}</span>
            </div>
            <div className="bau-spread">
              <TriviaBauhaus
                preguntas={triviaPreguntas}
                invitationId={String(invitation.id ?? "")}
                guestToken={guest?.uniqueToken}
                guestName={nombreInvitado || tx("invitacion.evento.invitado")}
              />
            </div>
          </section>
        )}

        {/* ── 10 Tu pase ─────────────────────────────────────────────────
            Pliego negro con un cuarto amarillo; el QR sobre un cuadrado
            crema con la esquina redonda, el pase en amarillo, la mesa en
            rojo y las tres formas como firma. */}
        <section data-tone="dark" data-screen-label={tx("invitacion.pase.tuPase")} className="bau-section bau-pase">
          <span className="bau-forma bau-pase-cuarto" aria-hidden="true" />
          <div className="bau-folio">
            <span data-xin="1" data-dist="-40">{nPase} — {tx("invitacion.pase.tuPase").toUpperCase()}</span>
            <span data-xin="1" data-dist="40">{folio(nPase)}</span>
          </div>
          <div className="bau-spread">
            <div data-xin="1" data-dist="-60" className="bau-pagina bau-pagina--qr">
              <div className="bau-qr">
                <QrDeIngreso guest={guest as never} />
                <span className="bau-qr-etq">{tx("invitacion.pase.tuPase").toUpperCase()}</span>
              </div>
            </div>
            <div className="bau-pagina">
              <div data-xin="1" data-delay="100" className="bau-pase-cabeza">
                <div className="bau-pase-numero">
                  <span className="bau-folio-etq">{tx("invitacion.pase.pase").toUpperCase()} Nº</span>
                  <span>{pase}</span>
                </div>
                {guest?.mesas && guest.mesas.length > 0 && (
                  <div className="bau-pase-mesa">
                    <span className="bau-folio-etq">{tx("invitacion.pase.tuMesa").toUpperCase()}</span>
                    <span>{guest.mesas[0]}</span>
                  </div>
                )}
              </div>
              <div data-xin="1" data-delay="160" className="bau-lineas-pase">
                <div className="bau-linea"><span>{saludaAlInvitado ? tx("invitacion.pase.reservadoPara") : tx("invitacion.evento.invitado")}</span><span>{nombreInvitado || titulo}</span></div>
                {lugaresDelPase > 0 && (
                  <div className="bau-linea"><span>{tx("invitacion.pase.lugares")}</span><span>{lugaresDelPase}</span></div>
                )}
                {guest?.mesas && guest.mesas.length > 0 && (
                  <div className="bau-linea"><span>Sector</span><span>{guest.mesas.join(" · ")}</span></div>
                )}
                <div className="bau-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{fechaPuntos} · {hora} H</span></div>
              </div>
              <div className="bau-info-extra">
                <InfoAdicionalSection invitation={invitation} />
              </div>
            </div>
          </div>
          <div data-xin="1" data-delay="220" className="bau-pase-pie">
            <div className="bau-despedida">
              <span className="bau-forma bau-forma--circulo bau-despedida-forma bau-despedida-forma--azul" aria-hidden="true" />
              <span className="bau-forma bau-forma--cuadrado bau-despedida-forma bau-despedida-forma--rojo" aria-hidden="true" />
              <span className="bau-triangulo" aria-hidden="true" />
              <span className="bau-despedida-texto">{tx("invitacion.pase.losEsperamos")} · {iniciales(nombre1, nombre2)}</span>
            </div>
            <div className="bau-folio bau-folio--colofon">
              <span className="bau-credito"><LogoFooterCredit bgColor="transparent" textColor={PALETA.bg} /></span>
              <span className="bau-replay" role="button" tabIndex={0} onClick={volverAVerla} onKeyDown={(e) => { if (e.key === "Enter") volverAVerla(); }}>
                {tx("invitacion.portada.verAperturaOtraVez").toUpperCase()} ↺
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* ── Riel de progreso ───────────────────────────────────────────── */}
      <div ref={rielRef} className="bau-riel">
        <span ref={rielTopRef} className="bau-riel-top">{pase}</span>
        <div ref={rielLineaRef} className="bau-riel-linea">
          <span ref={rielBarraRef} className="bau-riel-barra" />
        </div>
        <span ref={rielEtiquetaRef} className="bau-riel-etiqueta">{tx("invitacion.saveTheDate.guardaLaFecha").toUpperCase()}</span>
      </div>

      {/* ── La tapa ─────────────────────────────────────────────────────
          La composición: cinco formas de color sobre una grilla de 4×6,
          cada una a su profundidad, y el nombre en bloques crema encima.
          Es la bienvenida: dice de quién es la fiesta, cuándo, dónde y para
          cuántos. */}
      <div ref={portadaRef} data-tone={TONO} className="bau-portada">
        <div ref={escenaPortadaRef} className="bau-portada-hoja">
          <div className="bau-composicion" aria-hidden="true">
            <span data-drift="14" data-depth="0.8" className="bau-forma bau-comp-1" />
            <span data-drift="-10" data-depth="-0.6" className="bau-forma bau-comp-2" />
            <span data-drift="20" data-depth="1.1" className="bau-forma bau-comp-3" />
            <span data-drift="-6" data-depth="-0.3" className="bau-forma bau-comp-4" />
            <span data-drift="8" data-depth="0.5" className="bau-forma bau-comp-5" />
          </div>

          <div data-cl="1" className="bau-folio bau-folio--tapa">
            <span>{kickerDelEvento}</span>
            <span>Nº 00 / {String(totalPliegos).padStart(2, "0")}</span>
          </div>

          <div data-cl="2" className="bau-tapa-centro">
            <span className="bau-chip bau-chip--fecha">{diaSemana} {diaNum} · {String(fechaEvento.getMonth() + 1).padStart(2, "0")} · {anio}</span>
            <h1 ref={cartelRef} className="bau-tapa-nombres" style={{ "--largo": renglonMasLargo, "--n": totalLetras } as React.CSSProperties}>
              {saludaAlInvitado ? (
                <span className="bau-tapa-linea"><span data-pieza="1" className="bau-tapa-bloque"><Letras texto={nombreInvitado} desde={0} /></span></span>
              ) : (
                <>
                  <span className="bau-tapa-linea"><span data-pieza="1" className="bau-tapa-bloque"><Letras texto={nombre1} desde={0} /></span></span>
                  {nombre2 && (
                    <span className="bau-tapa-linea">
                      <span data-pieza="1" className="bau-tapa-bloque bau-tapa-bloque--punto"><span className="bau-forma bau-forma--circulo bau-tapa-punto" aria-hidden="true" /><Letras texto={nombre2} desde={nombre1.replace(/\s/g, "").length} /></span>
                    </span>
                  )}
                </>
              )}
            </h1>
            <div className="bau-chip bau-chip--datos">
              <span>{lugarNombre || "—"}<br />{[direccion, ciudad].filter(Boolean).join(" · ")}</span>
              <span className="bau-chip-der">
                {isPersonalized && guest
                  ? <>{tx("invitacion.pase.pase")} Nº {pase}<br />{lugaresDelPase} {tx(lugaresDelPase === 1 ? "invitacion.bienvenida.persona" : "invitacion.bienvenida.personas")}</>
                  : <>{hora} h<br />{fechaPuntos}</>}
              </span>
            </div>
          </div>

          <div data-cl="3" className="bau-tapa-pie">
            <p className="bau-tapa-mensaje">
              {saludaAlInvitado
                ? `${tx("invitacion.bienvenida.hola", { nombre: nombreInvitado })}. ${String(invitation.portadaMensaje || tx("invitacion.sabor.mensajeLoContamosNosotros"))}`
                : String(invitation.portadaMensaje || tx("invitacion.sabor.mensajeLoContamosNosotros"))}
            </p>
            <button type="button" onClick={abrir} className="bau-tapa-btn">
              <span>{tx("invitacion.portada.abrirInvitacion").toUpperCase()}</span><span className="bau-forma bau-forma--circulo bau-tapa-btn-punto" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <div ref={pistaRef} className="bau-pista">{tx("invitacion.portada.desliza").toUpperCase()} ↓</div>

      {fotoAmpliada && (
        <div className="bau-lupa" onClick={() => setFotoAmpliada(null)} onContextMenu={(e) => e.preventDefault()}>
          <button
            type="button"
            className="bau-lupa-cerrar"
            onClick={(e) => { e.stopPropagation(); setFotoAmpliada(null); }}
            aria-label={tx("invitacion.cerrar")}
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fotoAmpliada} alt={tx("invitacion.album.fotoAmpliada")} className="bau-lupa-img" draggable={false} onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {musicaHabilitada && audioDeFondo}
      {montado && isPersonalized && guest && portadaAbierta && (
        <BurbujaPase acento={PALETA.acc3} guest={guest} />
      )}
      {montado && musicaHabilitada && portadaAbierta && createPortal(
        <MusicToggleButton isPlaying={musicaSonando} onToggle={alternarMusica} className="fixed top-3 left-3 z-[99998]" />,
        document.body
      )}
    </div>
  );
}

/** "V & T": las iniciales de la despedida. */
function iniciales(a: string, b: string): string {
  const i = (s: string) => (s.trim()[0] || "").toUpperCase();
  return b ? `${i(a)} & ${i(b)}` : i(a);
}

/**
 * El nombre letra por letra: cada tanto una gira 90° sobre su eje vertical
 * y vuelve, como una placa. El CSS escalona el turno de cada letra.
 */
function Letras({ texto, desde }: { texto: string; desde: number }) {
  let k = desde;
  return (
    <>
      {Array.from(texto).map((ch, i) =>
        ch === " " ? " " : <span key={i} className="bau-letra" style={{ "--i": k++ } as React.CSSProperties}>{ch}</span>
      )}
    </>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Piezas de la colección
// ───────────────────────────────────────────────────────────────────────────

/** Los puntos que dicen en qué panel del recorrido estamos. */
function Puntos({ cantidad }: { cantidad: number }) {
  if (cantidad <= 1) return null;
  return (
    <div className="bau-puntos" aria-hidden="true">
      {Array.from({ length: cantidad }).map((_, i) => (
        <span key={i} data-dot={i} className="bau-punto" style={{ background: i === 0 ? PALETA.acc : "rgba(43,42,51,.18)" }} />
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
function CuentaBauhaus({ targetDate }: { targetDate: Date }) {
  const tx = useTextos();
  const { time, isEventDay, isPast, hasEnded } = useCountdown(targetDate);

  if (isEventDay || hasEnded || isPast) {
    return (
      <div className="bau-tarjeta bau-tarjeta--hoy" data-xin="1" data-delay="80" data-dist="30">
        <span className="bau-tarjeta-kicker">{tx("invitacion.cuentaRegresiva.kicker").toUpperCase()}</span>
        <span className="bau-tarjeta-titulo">
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
    <div className="bau-cuenta">
      {celdas.map((c, i) => (
        <div key={c.l} data-xin="1" data-delay={i * 100} data-dist={i % 2 === 0 ? -80 : 80} className={`bau-cuenta-caja bau-cuenta-caja--${i + 1}`}>
          <span className="bau-cuenta-num"><span key={c.v}>{c.v}</span></span>
          <span className="bau-cuenta-etq">{c.l.toUpperCase()}</span>
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
    <div className="bau-fila bau-fila--copiable">
      <div className="bau-fila-texto">
        <span className="bau-fila-etq">{etiqueta.toUpperCase()}</span>
        <span className="bau-fila-dato">{valor}</span>
      </div>
      <button type="button" onClick={copiar} className={`bau-btn-copiar${copiado ? " bau-btn-copiar--hecho" : ""}`}>
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
      className={`bau-tarjeta bau-tarjeta--banco${dobleZ ? " bau-doblez" : ""}${inclinada ? " bau-tarjeta--der" : " bau-tarjeta--izq"}`}
    >
      <span className="bau-tarjeta-kicker">{titulo.toUpperCase()}</span>
      {mensaje && <p className="bau-tarjeta-mensaje">{mensaje}</p>}
      <div className="bau-filas">
        <FilaCopiable etiqueta="Alias" valor={alias} />
        <FilaCopiable etiqueta="CBU" valor={cbu} />
        {(banco || titular) && (
          <div className="bau-fila bau-fila--ultima">
            <span>{banco || tx("invitacion.regalos.banco")}</span>
            <span className="bau-fila-valor">{titular}</span>
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
function CheckinBauhaus({
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
      <div data-xin="1" data-delay="140" data-dist="30" className="bau-tarjeta bau-tarjeta--izq">
        <p className="bau-tarjeta-mensaje">{tx("invitacion.rsvp.graciasPorAvisarAcceso")}</p>
        <button type="button" className="bau-btn-fantasma" onClick={() => setEstado("PENDING")}>
          {tx("invitacion.rsvp.cambieDeIdea").toUpperCase()}
        </button>
      </div>
    );
  }

  const confirmadoYa = estado === "CONFIRMED";

  return (
    <>
      <div ref={tarjetaRef} data-xin="1" data-delay="140" data-dist="30" className="bau-tarjeta bau-tarjeta--talon">
        <div className="bau-talon-top">
          <span>{tx("invitacion.pase.numeroPase", { n: pase }).toUpperCase()}{guestName ? ` · ${guestName.toUpperCase()}` : ""}</span>
          <span ref={estadoRef} className="bau-talon-estado">
            {confirmado || confirmadoYa ? tx("invitacion.pase.accesoConfirmado").toUpperCase() : tx("invitacion.pase.pendiente").toUpperCase()}
          </span>
        </div>

        {!confirmadoYa ? (
          <>
            {lugares > 1 && (
              <div className="bau-campo">
                <label className="bau-etiqueta">{tx("invitacion.rsvp.adultos").toUpperCase()}</label>
                <div className="bau-contador">
                  <button type="button" onClick={() => setAdultos((v) => Math.max(1, v - 1))} disabled={adultos <= 1} aria-label="−">−</button>
                  <span>{adultos}</span>
                  <button type="button" onClick={() => setAdultos((v) => Math.min(maxAdultos, v + 1))} disabled={adultos >= maxAdultos} aria-label="+">+</button>
                </div>
              </div>
            )}
            {maxAdolescentes > 0 && (
              <div className="bau-campo">
                <label className="bau-etiqueta">{tx("invitacion.rsvp.adolescentes").toUpperCase()}</label>
                <div className="bau-contador">
                  <button type="button" onClick={() => setAdolescentes((v) => Math.max(0, v - 1))} disabled={adolescentes <= 0} aria-label="−">−</button>
                  <span>{adolescentes}</span>
                  <button type="button" onClick={() => setAdolescentes((v) => Math.min(maxAdolescentes, v + 1))} disabled={adolescentes >= maxAdolescentes} aria-label="+">+</button>
                </div>
              </div>
            )}
            {maxNinos > 0 && (
              <div className="bau-campo">
                <label className="bau-etiqueta">{tx("invitacion.rsvp.ninos").toUpperCase()}</label>
                <div className="bau-contador">
                  <button type="button" onClick={() => setNinos((v) => Math.max(0, v - 1))} disabled={ninos <= 0} aria-label="−">−</button>
                  <span>{ninos}</span>
                  <button type="button" onClick={() => setNinos((v) => Math.min(maxNinos, v + 1))} disabled={ninos >= maxNinos} aria-label="+">+</button>
                </div>
              </div>
            )}
            <div className="bau-campo">
              <label className="bau-etiqueta">{tx("invitacion.rsvp.restriccionAlimentaria").toUpperCase()}</label>
              <input
                value={dieta}
                onChange={(e) => setDieta(e.target.value)}
                placeholder="—"
                maxLength={120}
                className="bau-input"
              />
            </div>
          </>
        ) : (
          <div className="bau-filas">
            {lugares > 1 && adultos > 0 && <div className="bau-fila"><span>{tx("invitacion.rsvp.adultos")}</span><span>{adultos}</span></div>}
            {adolescentes > 0 && <div className="bau-fila"><span>{tx("invitacion.rsvp.adolescentes")}</span><span>{adolescentes}</span></div>}
            {ninos > 0 && <div className="bau-fila"><span>{tx("invitacion.rsvp.ninos")}</span><span>{ninos}</span></div>}
            <div className="bau-fila bau-fila--ultima">
              <span>{tx("invitacion.rsvp.restriccionAlimentaria")}</span>
              <span className="bau-fila-valor">{restricciones || dieta || "—"}</span>
            </div>
          </div>
        )}

        {hayPago && monto != null && !exento && (
          <div className="bau-precio">
            <span>{estadoDePago === "PAID" ? tx("invitacion.pago.abonado") : tx("invitacion.pago.valor")}</span>
            <div className="bau-precio-valor">
              <span className="bau-precio-total">{formatearMoneda(totalAPagar)}</span>
              {usarTotalDelServidor && vistaDePago
                ? vistaDePago.lines.map((l, i) => <span key={i} className="bau-precio-detalle">{l}</span>)
                : (
                  <>
                    {adultos > 0 && <span className="bau-precio-detalle">{adultos} × {formatearMoneda(precioAdulto)}</span>}
                    {adolescentes > 0 && <span className="bau-precio-detalle">{adolescentes} × {formatearMoneda(precioAdo)}</span>}
                    {ninos > 0 && <span className="bau-precio-detalle">{ninos} × {formatearMoneda(precioNin)}</span>}
                  </>
                )}
            </div>
          </div>
        )}

        <div ref={selloRef} className="bau-sello" aria-hidden="true">{tx("invitacion.pase.confirmado").toUpperCase()}</div>
        <div ref={petalosRef} className="bau-petalos" aria-hidden="true" />
      </div>

      {error && <p className="bau-error">{error}</p>}

      {!confirmadoYa ? (
        <>
          <button type="button" data-xin="1" data-delay="220" className="bau-btn-solido" disabled={enviando} onClick={() => enviar("CONFIRMA")}>
            {enviando ? tx("invitacion.rsvp.guardando").toUpperCase() : tx("invitacion.rsvp.confirmarAsistencia").toUpperCase()}
          </button>
          <button type="button" data-xin="1" data-delay="280" className="bau-btn-fantasma" disabled={enviando} onClick={() => enviar("NO_ASISTE")}>
            {tx("invitacion.rsvp.noVoyAPoderAsistir").toUpperCase()}
          </button>
        </>
      ) : (
        <button type="button" className="bau-btn-fantasma" onClick={() => setEstado("PENDING")}>
          {tx("invitacion.rsvp.modificarAsistencia").toUpperCase()}
        </button>
      )}
    </>
  );
}

interface CancionItem { id: string; title: string; artist: string; guestName: string }

/** Sugerir una canción, en una tarjeta de papel con la lista debajo. */
function CancionesBauhaus({ invitationId, guestToken, guestName }: { invitationId: string; guestToken?: string; guestName: string }) {
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
      <form onSubmit={enviar} data-xin="1" data-delay="140" data-dist="30" className="bau-tarjeta bau-tarjeta--der">
        <div className="bau-campo">
          <label className="bau-etiqueta">{tx("invitacion.musica.tema").toUpperCase()}</label>
          <input value={tema} onChange={(e) => setTema(e.target.value)} placeholder={tx("invitacion.musica.nombreDeLaCancion")} maxLength={100} className="bau-input bau-input--serif" />
        </div>
        <div className="bau-campo">
          <label className="bau-etiqueta">{tx("invitacion.musica.artista").toUpperCase()}</label>
          <input value={artista} onChange={(e) => setArtista(e.target.value)} placeholder={tx("invitacion.musica.artista")} maxLength={80} className="bau-input bau-input--serif" />
        </div>
        {error && <p className="bau-error">{error}</p>}
        <button type="submit" disabled={enviando} className="bau-btn-solido bau-btn-solido--tinta">
          {enviando ? tx("invitacion.musica.enviando").toUpperCase() : tx("invitacion.musica.sugeriUnaCancion").toUpperCase()}
        </button>
      </form>

      {canciones.length > 0 && (
        <div data-xin="1" data-delay="220" className="bau-lista">
          {canciones.slice(0, 8).map((c) => (
            <div key={c.id} className="bau-lista-fila">
              <div className="bau-lista-texto">
                <span className="bau-lista-tema">{c.title}</span>
                <span className="bau-lista-quien">{c.artist} · {tx("invitacion.musica.sumadoPor")} {c.guestName || tx("invitacion.evento.invitado")}</span>
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
function TriviaBauhaus({ preguntas, invitationId, guestToken, guestName }: { preguntas: QuizPregunta[]; invitationId: string; guestToken?: string; guestName: string }) {
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
      <div data-xin="1" data-delay="140" data-dist="30" className="bau-tarjeta bau-tarjeta--izq">
        <span className="bau-tarjeta-kicker">{tx("invitacion.quiz.kicker").toUpperCase()}</span>
        <span className="bau-tarjeta-titulo">
          {guardando ? tx("invitacion.rsvp.guardando") : tx("invitacion.quiz.respondisteCorrectamente", { aciertos: puntaje, total: preguntas.length })}
        </span>
        {!guardando && stats && stats.count > 0 && (
          <p className="bau-tarjeta-mensaje">{tx("invitacion.quiz.promedio", { n: stats.count, avg: stats.avg })}</p>
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
    <div data-xin="1" data-delay="140" data-dist="30" className="bau-tarjeta bau-tarjeta--izq">
      <span className="bau-tarjeta-kicker">{tx("invitacion.quiz.preguntaDeTotal", { n: indice + 1, total: preguntas.length }).toUpperCase()}</span>
      <span className="bau-tarjeta-pregunta">{q.pregunta}</span>
      <div className="bau-opciones">
        {q.opciones.map((op, oi) => {
          let clase = "";
          if (yaEligio && correcta !== undefined) {
            if (oi === correcta) clase = " bau-opcion--bien";
            else if (elegidas[indice] === oi) clase = " bau-opcion--mal";
          }
          return (
            <button key={oi} type="button" disabled={yaEligio} onClick={() => elegir(oi)} className={`bau-opcion${clase}`}>
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
// leen la Bienvenida y el Post-evento compartidos (esperan `bau-section` y
// `bau-kicker`).
const CSS_BAU = `
  /* ── Bauhaus ──────────────────────────────────────────────────────────
     La escuela: Jost geométrica en mayúsculas, Work Sans para el texto,
     tres primarios más el negro, y formas hechas sólo con CSS -- círculo,
     semicírculo, cuarto, banda. Nunca un degradé. La junta negra de 3 px
     entre módulos es la retícula. */
  .bau-raiz { position: fixed; inset: 0; width: 100%; height: calc(var(--vh, 1vh) * 100); overflow: hidden;
    background: var(--pp-bg); color: var(--pp-ink); font-family: var(--bau-sans), 'Work Sans', sans-serif;
    --bau-acc3: ${PALETA.acc3}; }
  .bau-raiz a { color: inherit; text-decoration: none; }
  .bau-raiz button { font: inherit; }

  .bau-scroller { position: absolute; inset: 0; overflow-y: auto; overflow-x: hidden; opacity: 0;
    transition: opacity 900ms ease 260ms; scrollbar-width: none; }
  .bau-scroller::-webkit-scrollbar { width: 0; height: 0; }

  /* Las formas: un span con fondo y radio. */
  .bau-forma { position: absolute; pointer-events: none; display: block; }
  .bau-forma--circulo { position: static; border-radius: 50%; }
  .bau-forma--cuadrado { position: static; border-radius: 0; }
  .bau-forma--medio { position: static; border-radius: 999px 999px 0 0; }

  /* ── El pliego ─────────────────────────────────────────────────────── */
  .bau-section { position: relative; z-index: 1; min-height: calc(var(--vh, 1vh) * 100); box-sizing: border-box; overflow: hidden;
    display: flex; flex-direction: column; gap: 24px;
    padding: 60px max(20px, calc((100% - 1100px) / 2)) 80px; background: var(--pp-bg); color: var(--pp-ink); }
  .bau-section[data-tone="dark"] { background: var(--pp-ink); color: var(--pp-bg); }

  /* El folio: Jost 600 en versalitas con tracking. */
  .bau-folio { position: relative; z-index: 1; display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;
    font-weight: 600; font-size: 11px; letter-spacing: .24em; text-transform: uppercase; }
  .bau-folio--pie { align-items: center; margin-top: auto; letter-spacing: .22em; }
  .bau-folio--colofon { align-items: center; opacity: .8; border-top: 1px solid color-mix(in srgb, currentColor 35%, transparent); padding-top: 12px; }
  .bau-folio-etq { font-weight: 600; font-size: 11px; letter-spacing: .24em; text-transform: uppercase; opacity: .7; display: block; }
  .bau-barra { width: 40%; height: 3px; background: currentColor; }

  /* El spread: dos páginas; desde 1024 px se abren de verdad. */
  .bau-spread { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 20px; }
  .bau-pagina { display: flex; flex-direction: column; gap: 12px; min-width: 0; }
  @media (min-width: 1024px) {
    .bau-spread { display: grid; grid-template-columns: 1fr 1fr; align-items: center; column-gap: 72px; }
    .bau-spread > * { max-width: 560px; width: 100%; min-width: 0; }
    .bau-spread > *:first-child { justify-self: end; }
    .bau-spread > *:last-child { justify-self: start; }
    .bau-pagina--entera { grid-column: 1 / -1; max-width: none; justify-self: stretch; }
  }

  /* ── Tipos ─────────────────────────────────────────────────────────── */
  .bau-h2, .bau-panel-titulo, .bau-frase, .bau-fecha-linea, .bau-tapa-nombres {
    font-family: var(--bau-serif), 'Jost', sans-serif; font-weight: 700; text-transform: uppercase; }
  .bau-h2, .bau-panel-titulo { position: relative; z-index: 1; margin: 0; line-height: .88; letter-spacing: -.03em; font-size: clamp(52px, 15vw, 130px); }
  .bau-h2--album { font-size: clamp(44px, 12vw, 100px); }
  .bau-panel-sub { font-weight: 600; font-size: 12px; letter-spacing: .22em; text-transform: uppercase; }
  .bau-rojo { color: var(--pp-acc); }
  .bau-azul { color: var(--bau-acc3); }
  .bau-parrafo { margin: 0; font-size: 15px; line-height: 1.5; max-width: 40ch; }
  /* El chip: un bloque de fondo detrás de un texto, ancho al contenido. */
  .bau-chip { display: inline-block; width: max-content; max-width: 100%; box-sizing: border-box; background: var(--pp-bg); color: var(--pp-ink); padding: 8px 10px; }
  .bau-chip--claro { font-weight: 600; font-size: 12px; letter-spacing: .18em; text-transform: uppercase; padding: 12px 18px; }
  .bau-cta { margin-top: 6px; min-height: 48px; display: flex; align-items: center; justify-content: space-between; padding: 0 16px;
    background: var(--pp-ink); color: #FFFFFF; font-family: var(--bau-serif), 'Jost', sans-serif; font-weight: 600; font-size: 12px; letter-spacing: .22em; text-transform: uppercase; }

  /* ── 01 Guardá la fecha: inversión en negro ────────────────────────── */
  .bau-std-circulo { right: -10vw; top: 8vh; width: 60vw; height: 60vw; max-width: 520px; max-height: 520px; border-radius: 50%; background: var(--bau-acc3); }
  .bau-std-medio { left: 0; bottom: 0; width: 34vw; height: 17vw; max-width: 300px; max-height: 150px; border-radius: 300px 300px 0 0; background: var(--pp-acc2); }
  .bau-fecha { display: flex; flex-direction: column; line-height: .86; letter-spacing: -.04em; }
  .bau-fecha-linea { font-size: clamp(64px, 20vw, 170px); }
  .bau-fecha-linea--dia { font-size: clamp(96px, 32vw, 240px); }
  .bau-fecha-linea--mes { text-align: right; color: var(--pp-acc2); }
  .bau-fecha-linea--anio { color: var(--pp-acc); }
  .bau-fecha-pie { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 10px;
    font-weight: 600; font-size: 12px; letter-spacing: .18em; text-transform: uppercase; }
  /* La foto: cuadrada, con la esquina de arriba a la izquierda redonda y
     un cuadrado rojo abajo a la derecha. */
  .bau-foto { position: relative; width: 100%; aspect-ratio: 1; box-sizing: border-box; overflow: hidden; border-radius: 50% 0 0 0;
    background: repeating-linear-gradient(135deg, #3A3733 0 8px, #2C2A27 8px 16px); }
  .bau-foto-capa { position: absolute; inset: 0; }
  .bau-foto-revelado { position: absolute; inset: 0; z-index: 1; pointer-events: none;
    background-image: radial-gradient(var(--pp-ink) calc(var(--bau-punto, 7.2) * 1px), transparent calc(var(--bau-punto, 7.2) * 1px + .6px));
    background-size: 10px 10px; }
  .bau-foto-etq { position: absolute; left: 14px; bottom: 12px; z-index: 2; font-weight: 600; font-size: 11px; letter-spacing: .2em; text-transform: uppercase; color: var(--pp-bg); }
  .bau-foto-cuadrado { position: absolute; right: 0; bottom: 0; z-index: 2; width: 26%; aspect-ratio: 1; background: var(--pp-acc); }

  /* ── 02 Falta poco: la retícula ────────────────────────────────────── */
  .bau-countdown { justify-content: space-between; padding-left: 0; padding-right: 0; }
  .bau-countdown > .bau-folio, .bau-countdown > .bau-spread { margin-left: max(20px, calc((100% - 1100px) / 2)); margin-right: max(20px, calc((100% - 1100px) / 2)); }
  .bau-marquesina { position: relative; z-index: 1; overflow: hidden; padding: 8px 0; white-space: nowrap;
    font-weight: 600; font-size: 12px; letter-spacing: .22em; text-transform: uppercase; }
  .bau-marquesina--negra { background: var(--pp-ink); color: var(--pp-bg); font-family: var(--bau-serif), 'Jost', sans-serif; font-size: 22px; letter-spacing: .12em; }
  .bau-marquesina--filete { border-top: 3px solid var(--pp-ink); border-bottom: 3px solid var(--pp-ink); }
  .bau-marquesina-tira { display: flex; width: max-content; animation: bauCorre 16s linear infinite; }
  .bau-marquesina-tira > span { padding-right: 36px; }
  .bau-marquesina--contraria .bau-marquesina-tira { animation-direction: reverse; }
  @keyframes bauCorre { to { transform: translate3d(-50%, 0, 0); } }
  /* Cuatro módulos con junta negra: crema, amarillo, azul, rojo; en cada
     uno asoma un círculo de otro color. */
  .bau-cuenta { display: grid; grid-template-columns: 1fr 1fr; gap: 3px; background: var(--pp-ink); padding: 3px; }
  .bau-cuenta-caja { position: relative; overflow: hidden; min-height: 150px; padding: 18px 14px 14px; display: flex; flex-direction: column; gap: 4px; }
  .bau-cuenta-caja::after { content: ""; position: absolute; right: -10%; bottom: -30%; width: 60%; aspect-ratio: 1; border-radius: 50%; opacity: .9; }
  .bau-cuenta-caja:nth-child(1) { background: var(--pp-bg); color: var(--pp-ink); }
  .bau-cuenta-caja:nth-child(1)::after { background: var(--pp-acc); }
  .bau-cuenta-caja:nth-child(2) { background: var(--pp-acc2); color: var(--pp-ink); }
  .bau-cuenta-caja:nth-child(2)::after { background: var(--bau-acc3); }
  .bau-cuenta-caja:nth-child(3) { background: var(--bau-acc3); color: var(--pp-bg); }
  .bau-cuenta-caja:nth-child(3)::after { background: var(--pp-acc2); }
  .bau-cuenta-caja:nth-child(4) { background: var(--pp-acc); color: var(--pp-bg); }
  .bau-cuenta-caja:nth-child(4)::after { background: var(--pp-ink); }
  .bau-cuenta-num { position: relative; z-index: 1; font-family: var(--bau-serif), 'Jost', sans-serif; font-weight: 700; font-size: clamp(64px, 20vw, 150px);
    line-height: .86; letter-spacing: -.04em; font-variant-numeric: tabular-nums; }
  .bau-cuenta-num > span { display: inline-block; animation: bauCifra 300ms cubic-bezier(.16,1,.3,1); }
  @keyframes bauCifra { from { transform: translateY(18%); opacity: .4; } to { transform: translateY(0); opacity: 1; } }
  .bau-cuenta-etq { position: relative; z-index: 1; font-weight: 600; font-size: 11px; letter-spacing: .24em; text-transform: uppercase; }
  .bau-tarjeta--hoy { background: var(--pp-acc2); color: var(--pp-ink); border: 3px solid var(--pp-ink); padding: 18px; display: flex; flex-direction: column; gap: 8px; }
  .bau-tarjeta--hoy .bau-tarjeta-kicker { font-weight: 600; font-size: 11px; letter-spacing: .24em; text-transform: uppercase; }
  .bau-tarjeta--hoy .bau-tarjeta-titulo { font-family: var(--bau-serif), 'Jost', sans-serif; font-weight: 700; font-size: clamp(36px, 10vw, 84px); line-height: .9; text-transform: uppercase; letter-spacing: -.03em; }

  /* ── 03 Unas palabras: pliego amarillo ─────────────────────────────── */
  .bau-frase-seccion { background: var(--pp-acc2) !important; color: var(--pp-ink); justify-content: space-between; gap: 30px; }
  .bau-frase-cuarto { right: 0; top: 0; width: 40vw; height: 40vw; max-width: 380px; max-height: 380px; background: var(--pp-acc); border-radius: 0 0 0 100%; }
  /* El disco azul pendula colgado de su borde de arriba. */
  .bau-frase-pendulo { left: 20px; bottom: 90px; width: 22vw; height: 22vw; max-width: 200px; max-height: 200px; border-radius: 50%; background: var(--bau-acc3);
    transform-origin: 50% 0; animation: bauPendulo 8s ease-in-out infinite; }
  @keyframes bauPendulo { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(90deg); } }
  .bau-frase { margin: 0; font-weight: 600; font-size: clamp(36px, 10vw, 84px); line-height: 1; letter-spacing: -.02em; max-width: 15ch; text-transform: none; }
  .bau-invertido { background: var(--pp-ink); color: var(--pp-acc2); padding: 0 .12em; }
  .bau-bloque { background: var(--pp-bg); padding: 0 .12em; }
  .bau-firma { align-self: flex-end; display: flex; align-items: center; gap: 12px; background: var(--pp-ink); color: var(--pp-bg); padding: 12px 16px; max-width: 320px;
    font-weight: 500; font-size: 14px; line-height: 1.4; }
  .bau-firma-punto { width: 22px; height: 22px; background: var(--pp-acc); flex: 0 0 auto; }

  /* ── 04 Paneles: los módulos ───────────────────────────────────────── */
  .bau-pan { position: relative; z-index: 1; height: calc(100vh + var(--st-pasos, 2) * 90vh); }
  .bau-pan-fijo { position: sticky; top: 0; height: calc(var(--vh, 1vh) * 100); overflow: hidden; background: var(--pp-bg); }
  .bau-pan-fijo--album { background: #F7F5F0; }
  .bau-tira { position: absolute; top: 0; left: 0; height: 100%; display: flex; will-change: transform; }
  .bau-panel { flex: 0 0 100vw; min-width: 0; height: 100%; box-sizing: border-box; position: relative; overflow: hidden;
    display: flex; flex-direction: column; justify-content: space-between; gap: 18px;
    padding: 60px max(20px, calc((100vw - 1100px) / 2)) 92px; background: var(--pp-bg); color: var(--pp-ink); }
  .bau-panel-forma { right: 0; top: 0; width: 50vw; height: 50vw; max-width: 460px; max-height: 460px; }
  .bau-panel--crema .bau-panel-forma { background: var(--pp-acc2); border-radius: 0 0 0 100%; }
  .bau-panel--azul { background: var(--bau-acc3); color: var(--pp-bg); }
  .bau-panel--azul .bau-panel-forma { background: var(--pp-acc); border-radius: 50%; }
  .bau-panel--crema2 { background: var(--pp-bg2); }
  .bau-panel--crema2 .bau-panel-forma { background: var(--bau-acc3); border-radius: 50% 0 0 0; }
  .bau-panel--amarillo { background: var(--pp-acc2); }
  .bau-panel--amarillo .bau-panel-forma { background: var(--pp-ink); border-radius: 999px 999px 0 0; }
  .bau-pan[data-scroll="vertical"] { height: auto; }
  .bau-pan[data-scroll="vertical"] .bau-pan-fijo { position: static; height: auto; overflow: visible; }
  .bau-pan[data-scroll="vertical"] .bau-tira { position: static; display: block; width: 100%; transform: none !important; }
  .bau-pan[data-scroll="vertical"] .bau-panel { height: auto; min-height: calc(var(--vh, 1vh) * 100); }
  .bau-tarjeta-lugar { background: #FFFFFF; color: var(--pp-ink); padding: 14px 16px; display: flex; flex-direction: column; gap: 8px; }
  .bau-tarjeta-lugar--negra { background: var(--pp-ink); color: var(--pp-bg); }
  .bau-tarjeta-lugar--negra .bau-cta { background: var(--pp-bg); color: var(--pp-ink); }
  .bau-linea { display: flex; justify-content: space-between; gap: 14px; padding: 8px 0; border-bottom: 2px solid currentColor; font-size: 15px; line-height: 1.3; }
  .bau-linea > span:first-child { font-weight: 600; font-size: 11px; letter-spacing: .2em; text-transform: uppercase; flex: 0 0 auto; padding-top: 2px; }
  .bau-linea > span:last-child { text-align: right; font-weight: 500; }
  .bau-mapa { height: 190px; overflow: hidden; border: 3px solid var(--pp-ink); }
  .bau-puntos { position: absolute; left: 0; right: 40px; bottom: 30px; display: flex; gap: 8px; justify-content: center; z-index: 2; }
  .bau-punto { width: 14px; height: 14px; background: currentColor !important; opacity: .25; transition: opacity 300ms ease; display: inline-block; }
  .bau-punto:nth-child(3n+1) { border-radius: 50%; }
  .bau-punto:nth-child(3n+3) { border-radius: 50% 50% 0 0; }
  .bau-punto[data-activo="1"] { opacity: 1; }

  /* ── 05 Check-in: el formulario en retícula ────────────────────────── */
  .bau-checkin-anillo { left: -10vw; top: 20vh; width: 44vw; height: 44vw; max-width: 380px; max-height: 380px; border-radius: 50%;
    border: 3vw solid var(--bau-acc3); box-sizing: border-box; }
  .bau-cupon { position: relative; background: #FFFFFF; color: var(--pp-ink); border: 3px solid var(--pp-ink); padding: 20px;
    display: flex; flex-direction: column; gap: 14px; overflow: hidden; transition: border-color 400ms ease; }
  .bau-cupon:has(.bau-filas) { border-color: var(--bau-acc3); }
  .bau-cupon .bau-tarjeta { position: relative; display: flex; flex-direction: column; gap: 14px; background: transparent; border: 0; padding: 0; transform: none !important; }
  .bau-talon-top { display: flex; justify-content: space-between; align-items: center; gap: 10px; font-weight: 600; font-size: 11px; letter-spacing: .22em;
    text-transform: uppercase; border-bottom: 3px solid var(--pp-ink); padding-bottom: 12px; }
  /* El estado lleva un cuadrado amarillo que, al confirmar, se vuelve un
     círculo azul. */
  .bau-talon-estado { display: flex; align-items: center; gap: 8px; transition: color 400ms ease; }
  .bau-talon-estado::before { content: ""; width: 10px; height: 10px; background: var(--pp-acc2); transition: background 300ms ease, border-radius 300ms ease; }
  .bau-cupon:has(.bau-filas) .bau-talon-estado::before { background: var(--bau-acc3); border-radius: 50%; }
  .bau-campo { display: flex; flex-direction: column; gap: 6px; }
  .bau-etiqueta { font-weight: 600; font-size: 11px; letter-spacing: .2em; text-transform: uppercase; }
  .bau-input { min-height: 48px; border: 0; border-bottom: 3px solid var(--pp-ink); border-radius: 0; background: transparent; color: var(--pp-ink);
    font-family: var(--bau-sans), 'Work Sans', sans-serif; font-size: 15px; padding: 0; outline: none; }
  .bau-contador { display: flex; align-items: center; border-bottom: 3px solid var(--pp-ink); min-height: 48px; }
  .bau-contador button { width: 44px; min-height: 44px; border: 0; background: transparent; color: var(--pp-ink); cursor: pointer;
    font-family: var(--bau-serif), 'Jost', sans-serif; font-size: 26px; line-height: 1; }
  .bau-contador button:disabled { opacity: .35; cursor: default; }
  .bau-contador > span { flex: 1; text-align: center; font-family: var(--bau-serif), 'Jost', sans-serif; font-weight: 700; font-size: 28px; line-height: 1; }
  .bau-filas { display: flex; flex-direction: column; }
  .bau-fila { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 2px solid var(--pp-ink); font-size: 15px; }
  .bau-fila--ultima { border-bottom: 0; }
  .bau-fila-valor { text-align: right; font-weight: 500; }
  .bau-precio { display: flex; justify-content: space-between; gap: 12px; font-weight: 600; font-size: 12px; letter-spacing: .12em; text-transform: uppercase; }
  .bau-precio-valor { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
  .bau-precio-total { font-family: var(--bau-serif), 'Jost', sans-serif; font-weight: 700; font-size: 22px; line-height: 1; letter-spacing: 0; }
  .bau-precio-detalle { font-size: 11px; letter-spacing: .1em; }
  .bau-btn-solido { min-height: 54px; border: 0; background: var(--pp-acc); color: #FFFFFF; cursor: pointer;
    font-family: var(--bau-serif), 'Jost', sans-serif; font-weight: 600; font-size: 13px; letter-spacing: .22em; text-transform: uppercase; padding: 0 18px; transition: background 200ms ease; }
  @media (hover: hover) { .bau-btn-solido:hover { background: var(--pp-ink); } }
  .bau-btn-solido:disabled { opacity: .6; cursor: default; }
  .bau-btn-fantasma { min-height: 48px; border: 3px solid var(--pp-ink); background: #FFFFFF; color: var(--pp-ink); cursor: pointer;
    font-family: var(--bau-serif), 'Jost', sans-serif; font-weight: 600; font-size: 12px; letter-spacing: .2em; text-transform: uppercase; padding: 0 18px; }
  .bau-error { margin: 0; font-weight: 600; font-size: 12px; color: var(--pp-acc); }
  /* El sello "SÍ": disco amarillo con un círculo azul adentro. */
  .bau-cupon .bau-sello { position: absolute; right: 12px; bottom: 78px; width: 130px; aspect-ratio: 1; border-radius: 50%; pointer-events: none;
    opacity: 0; transform: rotate(18deg) scale(1.9) translateY(-120px);
    background: radial-gradient(circle, var(--bau-acc3) 0 26%, var(--pp-acc2) 26.5%);
    display: flex; align-items: flex-end; justify-content: center; padding-bottom: 12px; box-sizing: border-box;
    font-family: var(--bau-serif), 'Jost', sans-serif; font-weight: 600; font-size: 8px; letter-spacing: .18em; text-transform: uppercase; color: var(--pp-ink); }
  .bau-cupon .bau-sello::before { content: "SÍ"; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 20px; letter-spacing: 0; color: #FFFFFF; }
  .bau-petalos { display: none; }

  /* ── 06 Álbum: la retícula ─────────────────────────────────────────── */
  .bau-panel--album { background: #F7F5F0; color: #111111; justify-content: flex-start; gap: 14px; }
  .bau-panel--album-b { background: #EFEBE3; }
  .bau-reticula { flex: 1; min-height: 0; display: grid; grid-template-columns: repeat(6, 1fr); grid-template-rows: repeat(3, 1fr); gap: 3px;
    background: #111111; padding: 3px; max-width: 900px; box-sizing: border-box; }
  .bau-modulo-foto { position: relative; overflow: hidden; min-height: 0; cursor: pointer;
    background: repeating-linear-gradient(135deg, #D7D1C4 0 8px, #E6E1D6 8px 16px); }
  .bau-modulo-foto-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
  .bau-bano { position: absolute; inset: 0; mix-blend-mode: multiply; opacity: 0; transition: opacity 200ms linear; }
  .bau-bano--1 { background: color-mix(in srgb, var(--pp-acc) 55%, transparent); }
  .bau-bano--2 { background: color-mix(in srgb, var(--bau-acc3) 50%, transparent); }
  .bau-bano--3 { background: color-mix(in srgb, var(--pp-acc2) 60%, transparent); }
  .bau-bano--4 { background: rgba(17,17,17,.4); }
  .bau-bano--5 { background: color-mix(in srgb, var(--pp-acc) 40%, transparent); }
  .bau-modulo-foto-n { position: absolute; left: 8px; bottom: 6px; z-index: 1; font-weight: 600; font-size: 11px; letter-spacing: .14em; color: #111111; }
  .bau-modulo-foto:nth-child(1) { border-radius: 0 50% 0 0; }
  .bau-modulo-foto:nth-child(3) { border-radius: 0 0 0 50%; }
  .bau-modulo-foto:nth-child(4) { border-radius: 50%; }
  .bau-reticula[data-cantidad="5"] .bau-modulo-foto:nth-child(1) { grid-column: 1 / 4; grid-row: 1 / 3; }
  .bau-reticula[data-cantidad="5"] .bau-modulo-foto:nth-child(2) { grid-column: 4 / 7; grid-row: 1 / 2; }
  .bau-reticula[data-cantidad="5"] .bau-modulo-foto:nth-child(3) { grid-column: 4 / 6; grid-row: 2 / 3; }
  .bau-reticula[data-cantidad="5"] .bau-modulo-foto:nth-child(4) { grid-column: 6 / 7; grid-row: 2 / 3; }
  .bau-reticula[data-cantidad="5"] .bau-modulo-foto:nth-child(5) { grid-column: 1 / 7; grid-row: 3 / 4; }
  .bau-reticula[data-cantidad="4"] .bau-modulo-foto:nth-child(1) { grid-column: 1 / 4; grid-row: 1 / 3; }
  .bau-reticula[data-cantidad="4"] .bau-modulo-foto:nth-child(2) { grid-column: 4 / 7; grid-row: 1 / 2; }
  .bau-reticula[data-cantidad="4"] .bau-modulo-foto:nth-child(3) { grid-column: 4 / 7; grid-row: 2 / 3; }
  .bau-reticula[data-cantidad="4"] .bau-modulo-foto:nth-child(4) { grid-column: 1 / 7; grid-row: 3 / 4; border-radius: 0; }
  .bau-reticula[data-cantidad="3"] .bau-modulo-foto:nth-child(1) { grid-column: 1 / 4; grid-row: 1 / 4; }
  .bau-reticula[data-cantidad="3"] .bau-modulo-foto:nth-child(2) { grid-column: 4 / 7; grid-row: 1 / 3; }
  .bau-reticula[data-cantidad="3"] .bau-modulo-foto:nth-child(3) { grid-column: 4 / 7; grid-row: 3 / 4; }
  .bau-reticula[data-cantidad="2"] .bau-modulo-foto:nth-child(1) { grid-column: 1 / 4; grid-row: 1 / 4; }
  .bau-reticula[data-cantidad="2"] .bau-modulo-foto:nth-child(2) { grid-column: 4 / 7; grid-row: 1 / 4; }
  .bau-reticula[data-cantidad="1"] .bau-modulo-foto:nth-child(1) { grid-column: 1 / 7; grid-row: 1 / 4; }

  /* ── 07 Música: pliego azul ────────────────────────────────────────── */
  .bau-musica { background: var(--bau-acc3) !important; color: var(--pp-bg); }
  .bau-musica-circulo { right: -6vw; bottom: -6vw; width: 50vw; height: 50vw; max-width: 440px; max-height: 440px; border-radius: 50%; background: var(--pp-acc2); }
  .bau-eq { display: flex; align-items: flex-end; gap: 6px; height: 44px; }
  .bau-eq span { width: 14px; height: 100%; background: var(--pp-bg); transform-origin: bottom; animation: bauEq 1.1s ease-in-out infinite; }
  .bau-eq span:nth-child(2) { background: var(--pp-acc2); border-radius: 7px 7px 0 0; }
  .bau-eq span:nth-child(3) { background: var(--pp-acc); }
  .bau-eq span:nth-child(4) { border-radius: 7px 7px 0 0; }
  .bau-eq span:nth-child(5) { background: var(--pp-ink); }
  @keyframes bauEq { 0%, 100% { transform: scaleY(.3); } 50% { transform: scaleY(1); } }
  .bau-musica form.bau-tarjeta { display: grid; grid-template-columns: 1fr 1fr; gap: 3px; background: var(--pp-bg); padding: 3px; transform: none !important; }
  .bau-musica .bau-etiqueta { display: none; }
  .bau-musica .bau-input { min-height: 48px; border: 0; background: var(--bau-acc3); color: var(--pp-bg); padding: 0 14px; min-width: 0; }
  .bau-musica .bau-input::placeholder { color: color-mix(in srgb, var(--pp-bg) 70%, transparent); }
  .bau-musica .bau-error { grid-column: 1 / -1; background: var(--pp-bg); padding: 4px 8px; }
  .bau-musica .bau-btn-solido { grid-column: 1 / -1; min-height: 50px; background: var(--pp-bg); color: var(--pp-ink); font-size: 12px; }
  @media (hover: hover) { .bau-musica .bau-btn-solido:hover { background: var(--pp-acc2); } }
  .bau-lista { display: flex; flex-direction: column; gap: 3px; margin-top: 12px; }
  .bau-lista-fila { display: flex; align-items: center; gap: 12px; padding: 10px 14px; background: var(--pp-ink); color: var(--pp-bg); }
  .bau-lista-fila::before { content: ""; width: 14px; height: 14px; flex: 0 0 auto; background: var(--pp-acc); border-radius: 50%; }
  .bau-lista-fila:nth-child(3n+2)::before { background: var(--pp-acc2); border-radius: 0; }
  .bau-lista-fila:nth-child(3n+3)::before { background: var(--bau-acc3); border-radius: 50% 50% 0 0; }
  .bau-lista-texto { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .bau-lista-tema { font-family: var(--bau-serif), 'Jost', sans-serif; font-weight: 600; font-size: 17px; line-height: 1.1; }
  .bau-lista-quien { font-size: 12px; letter-spacing: .1em; text-transform: uppercase; opacity: .7; }

  /* ── 08 Regalos: módulos blancos ───────────────────────────────────── */
  .bau-regalos-pildora { right: 0; top: 30%; width: 24vw; height: 48vw; max-width: 200px; max-height: 400px; background: var(--pp-acc); border-radius: 200px 0 0 200px; }
  .bau-pagina--junta { gap: 3px; }
  .bau-tarjeta--banco { position: relative; z-index: 1; background: #FFFFFF; color: var(--pp-ink); border: 3px solid var(--pp-ink); padding: 16px 18px;
    display: flex; flex-direction: column; gap: 10px; transform: none !important; }
  .bau-tarjeta-kicker { display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 11px; letter-spacing: .22em; text-transform: uppercase; }
  .bau-tarjeta-kicker::before { content: ""; width: 12px; height: 12px; background: var(--bau-acc3); border-radius: 50%; }
  .bau-tarjeta--der .bau-tarjeta-kicker::before { background: var(--pp-acc); border-radius: 0; }
  .bau-tarjeta-mensaje { margin: 0; font-size: 14px; line-height: 1.5; }
  .bau-fila-texto { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .bau-fila-etq { font-weight: 600; font-size: 10px; letter-spacing: .22em; text-transform: uppercase; }
  .bau-fila-dato { font-weight: 500; font-size: 14px; letter-spacing: .06em; overflow-wrap: anywhere; }
  .bau-fila--copiable:first-child { border-bottom: 2px solid var(--pp-ink); }
  .bau-fila--copiable:first-child .bau-fila-dato { font-family: var(--bau-serif), 'Jost', sans-serif; font-weight: 700; font-size: 22px; line-height: 1; letter-spacing: 0; }
  .bau-tarjeta--banco .bau-fila--ultima { border-bottom: 0; font-size: 12px; letter-spacing: .12em; text-transform: uppercase; }
  .bau-btn-copiar { flex: 0 0 auto; min-height: 44px; padding: 0 14px; border: 0; background: var(--pp-ink); color: #FFFFFF; cursor: pointer;
    font-family: var(--bau-serif), 'Jost', sans-serif; font-weight: 600; font-size: 11px; letter-spacing: .2em; text-transform: uppercase; transition: background 200ms ease; }
  @media (hover: hover) { .bau-btn-copiar:hover { background: var(--bau-acc3); } }
  .bau-btn-copiar--hecho { background: var(--bau-acc3); }

  /* ── 09 Trivia: pliego rojo ────────────────────────────────────────── */
  .bau-quiz { background: var(--pp-acc) !important; color: var(--pp-bg); }
  .bau-quiz-disco { left: 50%; bottom: -20vw; width: 60vw; height: 60vw; max-width: 500px; max-height: 500px; margin-left: -30vw; border-radius: 50%; background: var(--pp-ink); }
  .bau-quiz .bau-tarjeta { display: flex; flex-direction: column; gap: 12px; transform: none !important; }
  .bau-quiz .bau-tarjeta-kicker { align-self: flex-start; background: var(--pp-bg); color: var(--pp-ink); padding: 8px 14px; }
  .bau-quiz .bau-tarjeta-kicker::before { display: none; }
  .bau-quiz .bau-tarjeta-pregunta, .bau-quiz .bau-tarjeta-titulo { font-family: var(--bau-serif), 'Jost', sans-serif; font-weight: 700; font-size: clamp(40px, 11vw, 96px); line-height: .92; letter-spacing: -.03em; max-width: 14ch; }
  .bau-quiz .bau-tarjeta-mensaje { margin: 0; font-size: 15px; opacity: .9; }
  .bau-opciones { display: flex; flex-direction: column; gap: 3px; }
  .bau-opcion { min-height: 54px; border: 0; background: var(--pp-bg); color: var(--pp-ink); cursor: pointer;
    font-family: var(--bau-sans), 'Work Sans', sans-serif; font-weight: 500; font-size: 16px; text-align: left; padding: 0 18px;
    display: flex; justify-content: space-between; align-items: center; gap: 12px; transition: background 200ms ease, color 200ms ease; }
  .bau-opcion::after { content: ""; width: 14px; height: 14px; flex: 0 0 auto; background: currentColor; border-radius: 50%; }
  .bau-opcion:nth-child(3n+2)::after { border-radius: 0; }
  .bau-opcion:nth-child(3n+3)::after { border-radius: 50% 50% 0 0; }
  .bau-opcion--bien { background: var(--pp-acc2); }
  .bau-opcion--mal { background: var(--pp-ink); color: var(--pp-bg); }
  @media (min-width: 1024px) {
    .bau-quiz .bau-spread > .bau-tarjeta { grid-column: 1 / -1; max-width: none; justify-self: stretch; display: grid; grid-template-columns: 1fr 1fr; column-gap: 72px; align-items: center; }
    .bau-quiz .bau-tarjeta-kicker { grid-column: 1; justify-self: end; margin-right: auto; }
    .bau-quiz .bau-tarjeta-pregunta { grid-column: 1; max-width: 560px; justify-self: end; width: 100%; }
    .bau-quiz .bau-opciones { grid-column: 2; grid-row: 1 / span 2; max-width: 560px; width: 100%; }
  }

  /* ── 10 Tu pase ────────────────────────────────────────────────────── */
  .bau-pase { justify-content: space-between; padding-bottom: calc(28px + env(safe-area-inset-bottom)); }
  .bau-pase-cuarto { right: 0; top: 0; width: 30vw; height: 30vw; max-width: 260px; max-height: 260px; background: var(--pp-acc2); border-radius: 0 0 0 100%; }
  .bau-pagina--qr { align-items: flex-start; }
  .bau-qr { position: relative; width: min(100%, 300px); aspect-ratio: 1; background: var(--pp-bg); padding: 18px; box-sizing: border-box; border-radius: 0 50% 0 0; margin-bottom: 28px; }
  .bau-qr .qr-ingreso, .bau-qr section { background: transparent !important; border: none !important; padding: 0 !important; }
  .bau-qr img, .bau-qr svg, .bau-qr canvas { width: 100% !important; height: auto !important; display: block; }
  .bau-qr-etq { position: absolute; left: 0; right: 0; bottom: -24px; text-align: center; font-weight: 600; font-size: 11px; letter-spacing: .22em; text-transform: uppercase; color: var(--pp-bg); opacity: .7; }
  .bau-pase-cabeza { display: flex; align-items: flex-end; justify-content: space-between; gap: 14px; }
  .bau-pase-numero, .bau-pase-mesa { display: flex; flex-direction: column; }
  .bau-pase-mesa { align-items: flex-end; text-align: right; }
  .bau-pase-numero > span:last-child { font-family: var(--bau-serif), 'Jost', sans-serif; font-weight: 700; font-size: clamp(72px, 22vw, 160px); line-height: .84; letter-spacing: -.04em; color: var(--pp-acc2); }
  .bau-pase-mesa > span:last-child { font-family: var(--bau-serif), 'Jost', sans-serif; font-weight: 700; font-size: clamp(44px, 13vw, 96px); line-height: .88; letter-spacing: -.03em; color: var(--pp-acc); }
  .bau-lineas-pase { display: flex; flex-direction: column; border-top: 3px solid var(--pp-bg); }
  .bau-lineas-pase .bau-linea { border-bottom: 1px solid color-mix(in srgb, var(--pp-bg) 35%, transparent); font-size: 14px; padding: 11px 0; }
  .bau-lineas-pase .bau-linea > span:first-child { opacity: .7; }
  .bau-lineas-pase .bau-linea:last-child { border-bottom: 0; }
  .bau-info-extra { margin-top: 4px; }
  .bau-info-extra #info-adicional { background: transparent !important; padding: 0 !important; }
  .bau-info-extra #ia-trigger-btn { background: var(--pp-bg) !important; color: var(--pp-ink) !important; border: 0 !important;
    border-radius: 0 !important; font-weight: 600 !important; letter-spacing: .22em !important; text-transform: uppercase; }
  .bau-raiz .ia-icon-box, .bau-raiz svg.lucide { display: none !important; }
  .bau-pase-pie { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 14px; }
  .bau-despedida { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  .bau-despedida-forma { width: 22px; height: 22px; }
  .bau-despedida-forma--azul { background: var(--bau-acc3); }
  .bau-despedida-forma--rojo { background: var(--pp-acc); }
  .bau-triangulo { width: 0; height: 0; border-left: 11px solid transparent; border-right: 11px solid transparent; border-bottom: 22px solid var(--pp-acc2); }
  .bau-despedida-texto { font-family: var(--bau-serif), 'Jost', sans-serif; font-weight: 600; font-size: clamp(22px, 6vw, 36px); line-height: 1; letter-spacing: -.02em; text-transform: uppercase; }
  .bau-replay { cursor: pointer; color: var(--pp-acc2); }
  .bau-credito { display: inline-flex; opacity: .8; }

  /* ── La tapa: la composición ───────────────────────────────────────── */
  .bau-portada { position: absolute; inset: 0; z-index: 5; overflow: hidden; background: var(--pp-bg); color: var(--pp-ink); }
  .bau-portada-hoja { position: absolute; inset: 0; display: grid; grid-template-rows: auto minmax(0, 1fr) auto; box-sizing: border-box;
    padding: calc(16px + env(safe-area-inset-top)) max(20px, calc((100% - 1100px) / 2)) calc(18px + env(safe-area-inset-bottom)); }
  /* Cinco formas en una grilla de 4×6; cada una tiene su data-drift y su
     data-depth, así el motor las mueve a distinta profundidad. */
  .bau-composicion { position: absolute; inset: 0; pointer-events: none; display: grid; grid-template-columns: repeat(4, 1fr); grid-template-rows: repeat(6, 1fr); }
  .bau-composicion .bau-forma { position: static; }
  .bau-comp-1 { grid-column: 3 / 5; grid-row: 1 / 3; background: var(--pp-acc2); border-radius: 0 0 0 100%; }
  .bau-comp-2 { grid-column: 1 / 3; grid-row: 2 / 4; background: var(--pp-acc); border-radius: 100% 0 0 0; opacity: .95; }
  .bau-comp-3 { grid-column: 4 / 5; grid-row: 3 / 6; background: var(--bau-acc3); border-radius: 999px 999px 0 0; }
  .bau-comp-4 { grid-column: 1 / 2; grid-row: 5 / 7; background: var(--pp-ink); border-radius: 0 999px 0 0; }
  .bau-comp-5 { grid-column: 2 / 4; grid-row: 6 / 7; background: var(--pp-acc2); border-radius: 999px 999px 0 0; align-self: end; height: 60%; }
  .bau-folio--tapa { align-items: flex-start; }
  .bau-tapa-centro { position: relative; z-index: 1; align-self: center; display: flex; flex-direction: column; gap: 8px; min-height: 0; }
  .bau-chip--fecha { font-family: var(--bau-serif), 'Jost', sans-serif; font-weight: 600; font-size: 13px; letter-spacing: .22em; text-transform: uppercase; color: var(--pp-acc); padding: 6px 10px; }
  /* El nombre: un bloque crema por renglón, del ancho del texto. El renglón
     más largo manda el cuerpo. */
  .bau-tapa-nombres { margin: 0; line-height: .88; letter-spacing: -.03em; display: flex; flex-direction: column;
    font-size: min(clamp(44px, 14.5vw, 150px), 16vh, calc((100vw - 44px) / (var(--largo, 9) * 0.66))); }
  @media (min-width: 1024px) { .bau-tapa-nombres { font-size: min(11vw, 190px, 22vh, calc((min(100vw, 1100px) - 44px) / (var(--largo, 9) * 0.66))); } }
  .bau-tapa-linea { overflow: hidden; display: block; white-space: nowrap; }
  .bau-tapa-bloque { display: block; width: max-content; max-width: 100%; background: var(--pp-bg); padding: 0 .06em; }
  .bau-tapa-bloque--punto { display: flex; align-items: center; gap: .1em; }
  .bau-tapa-punto { width: .55em; height: .55em; background: var(--bau-acc3); flex: 0 0 auto; }
  .bau-letra { display: inline-block; backface-visibility: hidden; animation: bauPlaca calc(var(--n, 12) * 3.6s) ease-in-out infinite; animation-delay: calc(var(--i, 0) * -3.6s); }
  @keyframes bauPlaca { 0%, 98.8% { transform: rotateY(0); } 99.4% { transform: rotateY(90deg); } 100% { transform: rotateY(0); } }
  .bau-chip--datos { display: flex; justify-content: space-between; align-items: flex-end; gap: 14px; font-weight: 500; font-size: 13px; line-height: 1.35; }
  .bau-chip-der { text-align: right; }
  .bau-tapa-pie { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 12px; }
  .bau-tapa-mensaje { margin: 0; font-family: var(--bau-serif), 'Jost', sans-serif; font-weight: 500; font-size: clamp(17px, 4.6vw, 22px); line-height: 1.25; max-width: 30ch;
    background: var(--pp-bg); padding: 8px 10px; width: max-content; box-sizing: border-box; }
  .bau-tapa-btn { min-height: 54px; min-width: 260px; align-self: flex-start; border: 0; background: var(--pp-ink); color: var(--pp-bg); cursor: pointer;
    font-family: var(--bau-serif), 'Jost', sans-serif; font-weight: 600; font-size: 13px; letter-spacing: .22em; text-transform: uppercase; padding: 0 22px;
    display: flex; align-items: center; justify-content: space-between; gap: 14px; transition: background 200ms ease; }
  @media (hover: hover) { .bau-tapa-btn:hover { background: var(--pp-acc); } }
  .bau-tapa-btn-punto { width: 14px; height: 14px; background: var(--pp-acc2); }

  /* ── Riel, pista y lupa ────────────────────────────────────────────── */
  .bau-riel { position: absolute; right: 0; top: 0; bottom: 0; width: 40px; z-index: 4; display: flex; flex-direction: column;
    align-items: center; justify-content: space-between; padding: calc(16px + env(safe-area-inset-top)) 0 calc(16px + env(safe-area-inset-bottom));
    opacity: 0; transition: opacity 600ms ease; pointer-events: none; border-left: 3px solid var(--pp-ink) !important; }
  .bau-riel-top { writing-mode: vertical-rl; font-family: var(--bau-serif), 'Jost', sans-serif; font-weight: 600; font-size: 12px; letter-spacing: .2em; color: var(--pp-ink) !important; }
  .bau-riel-etiqueta { writing-mode: vertical-rl; font-weight: 600; font-size: 10px; letter-spacing: .28em; text-transform: uppercase; color: var(--pp-ink); }
  .bau-riel-linea { flex: 1; width: 1px; margin: 16px 0; background: transparent !important; position: relative; }
  .bau-riel-barra { position: absolute; left: -3px; top: 0; width: 6px; height: 0%; background: var(--pp-acc); transition: height 200ms linear; display: block; }
  .bau-pista { position: absolute; left: 0; right: 40px; bottom: calc(18px + env(safe-area-inset-bottom)); z-index: 6; text-align: center;
    font-weight: 600; font-size: 11px; letter-spacing: .28em; color: var(--pp-ink);
    opacity: 0; transition: opacity 600ms ease; pointer-events: none; animation: bauPista 2.4s ease-in-out infinite; }
  @keyframes bauPista { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(6px); } }

  .bau-lupa { position: fixed; inset: 0; z-index: 200; background: rgba(17,17,17,.94);
    display: flex; align-items: center; justify-content: center; padding: 24px; cursor: zoom-out; }
  .bau-lupa-cerrar { position: absolute; top: 20px; right: 20px; width: 40px; height: 40px; border: 0; border-radius: 50%;
    background: var(--pp-acc2); color: var(--pp-ink); font-size: 18px; line-height: 1; cursor: pointer; }
  .bau-lupa-img { max-width: 100%; max-height: 88vh; object-fit: contain; cursor: default; border: 3px solid var(--pp-bg); }

  @media (prefers-reduced-motion: reduce) {
    .bau-raiz * { animation: none !important; }
    .bau-scroller [data-xin] { opacity: 1 !important; transform: none !important; }
    .bau-foto { --bau-punto: 0; }
  }
`;
