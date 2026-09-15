"use client";

// GENERADO por scripts/gen-iconic-variants.js a partir de
// RetrowaveTemplate.tsx — no editar a mano: los cambios se pierden al regenerar.

/**
 * RETROWAVE · Colección Iconic — sub-colección "Tipográfica Editorial"
 * Variante: Láser.
 *
 * GENERADO por scripts/derivar-tipografica.js a partir de
 * EditorialBlancNoirTemplate.tsx — no editar a mano: el motor se arregla en
 * Editorial Blanc & Noir; el render en scripts/jsx/tipografica/rtw.jsx, los
 * estilos en scripts/css/tipografica/rtw.css y las caras y la paleta en
 * scripts/familias/tipografica/rtw.json.
 *
 * El atardecer de los 80: Righteous siempre en itálica con doble sombra dura
 * (magenta y cian), Manrope para el texto, la grilla en fuga que corre,
 * líneas de barrido VHS y el sol rayado. La tapa es un escenario: cielo
 * con estrellas, sol y palmeras (WebP) sobre el horizonte, y el nombre
 * como logo de los 80. Cinta VHS, display digital, walkman y ticket.
 *
 * Sin imágenes propias: son fuentes y CSS.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Righteous, Manrope } from "next/font/google";
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

const rtwSerif = Righteous({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  variable: "--rtw-serif",
});
const rtwSans = Manrope({
  subsets: ["latin"],
  weight: ["500", "700", "800"],
  display: "swap",
  variable: "--rtw-sans",
});
// El mono es la ficha técnica de la revista: folios, kickers y datos.

// ─── Paleta ─────────────────────────────────────────────────────────────────
// Las cinco variantes de "Capas de papel" cambian SOLO estos once colores
// (el script de variantes reemplaza este bloque entero, ver
// scripts/gen-capas-de-papel-variants.js). El dibujo es el mismo: los SVG de
// las escenas leen var(--pp-…), así que un cambio acá repinta cerros, cielo,
// sol y figuras de una sola vez.
const PALETA = {
  bg: "#0E1A12",
  bg2: "#14301F",
  ink: "#F4FFF7",
  ink2: "#F4FFF7",
  acc: "#B6FF3C",
  acc2: "#FF2D95",
  sky1: "#0E1A12",
  sky2: "#14301F",
  hill1: "#14301F",
  hill2: "#F4FFF7",
  hill3: "#F4FFF7",
  night: "#F4FFF7",
  nightInk: "#0E1A12",
  sky: "#14301F",
  ground: "#07110B",
  acc3: "#FF2D95",
  sun: "#FF7A3D",
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

interface RetrowaveTemplateProps {
  invitation: Record<string, unknown>;
  guest?: GuestRecord | null;
  isPersonalized?: boolean;
}

/** El número de pase, con tres cifras como en el mockup ("PASE Nº 042"). */
function numeroDePase(orderNumber: number | undefined): string {
  return String(orderNumber ?? 42).padStart(3, "0");
}

export function RetrowaveTemplateLaser({ invitation, guest, isPersonalized = false }: RetrowaveTemplateProps) {
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
      el.style.setProperty("--rtw-y", `${dist}px`);
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
            el.style.setProperty("--rtw-y", "0px");
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
            bano.style.opacity = String(Math.max(0, Math.min(1, 1 - (dx - 0.1) / 0.3)));
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
            ven.style.setProperty("--rtw-punto", (7.2 * (1 - t)).toFixed(2));
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
    "--pp-sky": PALETA.sky,
    "--pp-ground": PALETA.ground,
    "--pp-acc3": PALETA.acc3,
    "--pp-sun": PALETA.sun,
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
          clase: `${rtwSerif.variable} ${rtwSans.variable}`,
          fuente: "var(--rtw-sans), 'Manrope', sans-serif",
        }}
      />
    );
  }


  // El total de pliegos, para los folios ("03 / 10"). Se cuenta lo que esta
  // invitación realmente tiene: si no hay trivia, no existe el pliego 09 y el
  // pase deja de ser 10 de 10.
  const totalPliegos = cuenta;
  const folio = (n: string) => `${n} / ${String(totalPliegos).padStart(2, "0")}`;

  // El nombre como logo de los 80: crema con doble sombra dura (magenta y
  // cian, invertidas en la segunda línea). El renglón más largo manda el
  // cuerpo.
  const renglones = saludaAlInvitado ? [nombreInvitado] : [nombre1, ...(nombre2 ? [nombre2] : [])];
  const renglonMasLargo = Math.max(5, ...renglones.map((n) => n.length));
  const totalLetras = Math.max(1, renglones.join("").replace(/\s/g, "").length);

  // La frase: el medio en magenta y el cierre en cian.
  const tonoDePalabra = (i: number) => {
    const n = palabras.length;
    if (i >= Math.ceil(n * 0.7)) return "rtw-cian";
    if (i >= Math.floor(n * 0.25) && i < desdeAcento) return "rtw-magenta";
    return undefined;
  };

  const kickerDelEvento = tx(invitation.tipo === "CASAMIENTO" ? "invitacion.evento.nosCasamos" : invitation.tipo === "QUINCE_ANOS" ? "invitacion.evento.misQuinceAnos" : "invitacion.evento.teInvitamos");
  const mesCorto = mesLargo.slice(0, 3).toUpperCase();
  // Diez estrellas fijas sobre el cielo de la tapa, cada una con su ritmo.
  const ESTRELLAS: [number, number, number][] = [[6, 6, 3], [18, 14, 2], [30, 4, 2], [44, 12, 3], [58, 6, 2], [72, 16, 2], [86, 8, 3], [94, 20, 2], [12, 28, 2], [80, 30, 2]];

  return (
    <div
      ref={raizRef}
      className={`${rtwSerif.variable} ${rtwSans.variable} rtw-raiz`}
      style={varsDePaleta}
    >
      <style>{CSS_RTW}</style>
      <style>{COVER_RESPONSIVE_STYLE}</style>

      <div ref={scrollerRef} className="rtw-scroller">
        {/* ── 01 Guardá la fecha ─────────────────────────────────────────
            La cinta VHS: pliego magenta con líneas de barrido, la fecha en
            Righteous itálica con sombra dura y la foto como un cuadro de
            video con "● REC". */}
        <section data-tone="dark" data-screen-label={tx("invitacion.saveTheDate.guardaLaFecha")} className="rtw-section rtw-std">
          <span className="rtw-vhs" aria-hidden="true" />
          <div className="rtw-folio">
            <span data-xin="1" data-dist="-40">{nSaveTheDate} — {tx("invitacion.saveTheDate.guardaLaFecha").toUpperCase()}</span>
            <span data-xin="1" data-dist="40">● REC · {folio(nSaveTheDate)}</span>
          </div>
          <div className="rtw-spread">
            <div className="rtw-pagina">
              <div className="rtw-fecha">
                <span data-xin="1" data-dist="-160" className="rtw-fecha-linea rtw-fecha-linea--dia">{diaNum}</span>
                <span data-xin="1" data-dist="160" data-delay="120" className="rtw-fecha-linea rtw-fecha-linea--mes">{mesLargo}</span>
                <span data-xin="1" data-dist="-160" data-delay="240" className="rtw-fecha-linea rtw-fecha-linea--anio">{anio}</span>
              </div>
              <div data-xin="1" data-delay="360" className="rtw-fecha-pie">
                <span>{diaSemana} · {hora} H</span>
                <AddToCalendarLink
                  eventName={titulo}
                  targetDate={fechaHora}
                  location={[lugarNombre, direccion].filter(Boolean).join(", ")}
                  className="rtw-chip rtw-chip--oscuro"
                  showIcon={false}
                >
                  {tx("invitacion.saveTheDate.agregarAlCalendario").toUpperCase()} ▶
                </AddToCalendarLink>
              </div>
            </div>

            {hayFoto && (
              <div ref={ventanaRef} data-xin="1" data-delay="200" data-dist="0" className="rtw-foto">
                {fotoMobile && (
                  <div className="acp-mobile-only rtw-foto-capa">
                    <AnimatedCoverPhoto photoSrc={fotoMobile} tint={false} effect="enfoque" scrimColorRgb="26,11,46" />
                  </div>
                )}
                {fotoDesktop && (
                  <div className="acp-desktop-only rtw-foto-capa">
                    <AnimatedCoverPhoto photoSrc={fotoDesktop} tint={false} effect="enfoque" scrimColorRgb="26,11,46" />
                  </div>
                )}
                {/* La trama que tapa la foto y se disuelve al subir: el radio
                    del punto lo mueve el motor en --rtw-punto. */}
                <span className="rtw-foto-revelado" aria-hidden="true" />
                <div className="rtw-foto-cabeza"><span>● REC</span><span>SP 0:00:{String(fechaEvento.getDate()).padStart(2, "0")}</span></div>
                <div className="rtw-foto-pie"><span>{tx("invitacion.album.nuestraFoto").toUpperCase()}</span><span>{diaNum} {mesCorto} {anio}</span></div>
              </div>
            )}
          </div>
        </section>

        {/* ── 02 Falta poco ──────────────────────────────────────────────
            El display digital: dos marquesinas inclinadas y cuatro
            pantallas con borde y sombra dura de su color, sobre la grilla
            magenta en fuga. */}
        <section data-tone="dark" data-screen-label={tx("invitacion.cuentaRegresiva.kicker")} className="rtw-section rtw-countdown">
          <div className="rtw-grilla3d rtw-grilla3d--magenta" aria-hidden="true"><span /></div>
          <div className="rtw-folio rtw-folio--cian">
            <span data-xin="1" data-dist="-40">{nCountdown} — {tx("invitacion.cuentaRegresiva.faltan").toUpperCase()}</span>
            <span data-xin="1" data-dist="40">{folio(nCountdown)}</span>
          </div>
          <div className="rtw-marquesina rtw-marquesina--cian" aria-hidden="true">
            <div className="rtw-marquesina-tira">
              {[0, 1].map((i) => (
                <span key={i}>
                  {tx("invitacion.cuentaRegresiva.dias")} ▶ {tx("invitacion.cuentaRegresiva.horas")} ▶ {tx("invitacion.cuentaRegresiva.minutos")} ▶ {tx("invitacion.cuentaRegresiva.segundos")} ▶ {diaSemana.toLowerCase()} {diaNum} {tx("invitacion.evento.de")} {mesLargo} ▶&nbsp;
                </span>
              ))}
            </div>
          </div>
          <div className="rtw-spread">
            <div className="rtw-pagina rtw-pagina--entera">
              <CuentaRetrowave targetDate={fechaHora} />
            </div>
          </div>
          <div className="rtw-marquesina rtw-marquesina--magenta rtw-marquesina--contraria" aria-hidden="true">
            <div className="rtw-marquesina-tira">
              {[0, 1].map((i) => (
                <span key={i}>
                  {[lugarNombre, ciudad, `${hora} h`, dressCode, "Side A"].filter(Boolean).join(" · ").toUpperCase()} ·&nbsp;
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── 03 Unas palabras ───────────────────────────────────────────
            Las letras cromadas: sobre el cielo, con el sol rayado detrás,
            la frase en itálica con sombra y la tarjeta que flota. */}
        {hayFrase && (
          <section data-tone="dark" data-screen-label={tx("invitacion.frase.etiqueta")} className="rtw-section rtw-frase-seccion">
            <span className="rtw-sol-rayado" aria-hidden="true" />
            <div className="rtw-folio rtw-folio--cian">
              <span data-xin="1" data-dist="-40">{nFrase} — {tx("invitacion.frase.unasPalabras").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nFrase)}</span>
            </div>
            <div className="rtw-spread">
              <h2 ref={fraseRef} className="rtw-frase">
                {palabras.map((p, i) => (
                  // El espacio va fuera del span: el motor pone cada palabra
                  // en inline-block y un espacio adentro se colapsa a cero.
                  <span key={i}>
                    <span data-w="1" className={tonoDePalabra(i)}>{p}</span>{" "}
                  </span>
                ))}
              </h2>
              <div data-xin="1" data-delay="900" data-dist="60" className="rtw-firma">
                <span className="rtw-firma-play" aria-hidden="true">▶</span>
                <span>{tx("invitacion.frase.conAmor")} · {titulo}</span>
              </div>
            </div>
            <div className="rtw-folio rtw-folio--cian rtw-folio--pie">
              <span>Side A · Track {nFrase}</span>
              <span className="rtw-barra" aria-hidden="true" />
            </div>
          </section>
        )}

        {/* ── 04 Cuándo y dónde ──────────────────────────────────────────
            Un track por lugar: fondo, cielo y suelo, cada uno con su neón
            (magenta, cian, sol) en el título, la tarjeta y la grilla. */}
        <div
          id="details"
          data-pan="1"
          data-scroll={scrollVertical || panelesLugar.length <= 1 ? "vertical" : "lateral"}
          data-screen-label={tx("invitacion.ubicacion.cuandoYDonde")}
          className="rtw-pan"
          style={{ "--st-pasos": Math.max(0, panelesLugar.length - 1) } as React.CSSProperties}
        >
          <div className="rtw-pan-fijo">
            <div data-strip="1" className="rtw-tira">
              <div data-tone="dark" className="rtw-panel rtw-panel--magenta">
                <div className="rtw-grilla3d" aria-hidden="true"><span /></div>
                <div className="rtw-folio rtw-folio--acento">
                  <span>{nCuando} — {tx("invitacion.ubicacion.fiestaSalon").toUpperCase()}</span><span>{deLugar("recepcion")}</span>
                </div>
                <div className="rtw-spread">
                  <div className="rtw-pagina">
                    <span className="rtw-panel-sub">Track {deLugar("recepcion").split(" ")[0]}</span>
                    <h2 className="rtw-panel-titulo">{lugarNombre || ciudad}</h2>
                  </div>
                  <div className="rtw-tarjeta-lugar">
                    <div className="rtw-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{hora} h</span></div>
                    {direccion && <div className="rtw-linea"><span>{tx("invitacion.ubicacion.direccion")}</span><span>{direccion}</span></div>}
                    {dressCode && <div className="rtw-linea"><span>{tx("invitacion.ubicacion.dressCode")}</span><span>{dressCode}</span></div>}
                    {mapUrl && (
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="rtw-cta">
                        {tx("invitacion.ubicacion.comoLlegar").toUpperCase()}<span>▶</span>
                      </a>
                    )}
                  </div>
                </div>
                <div className="rtw-folio rtw-folio--pie">
                  <span>{[direccion, ciudad].filter(Boolean).join(" · ").toUpperCase()}</span>
                  {!scrollVertical && panelesLugar.length > 1 && <span>{tx("invitacion.portada.desliza").toUpperCase()} ▶▶</span>}
                </div>
              </div>

              {ceremoniaHabilitada && (
                <div id="ceremonia" data-tone="dark" className="rtw-panel rtw-panel--cian">
                  <div className="rtw-grilla3d" aria-hidden="true"><span /></div>
                  <div className="rtw-folio rtw-folio--acento">
                    <span>{nCuando} — {ceremoniaTitulo.toUpperCase()}</span><span>{deLugar("ceremonia")}</span>
                  </div>
                  <div className="rtw-spread">
                    <div className="rtw-pagina">
                      <span className="rtw-panel-sub">Track {deLugar("ceremonia").split(" ")[0]}</span>
                      <h2 className="rtw-panel-titulo">{ceremoniaNombre || ceremoniaTitulo}</h2>
                    </div>
                    <div className="rtw-tarjeta-lugar">
                      {ceremoniaHora && <div className="rtw-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{ceremoniaHora} h</span></div>}
                      {ceremoniaDireccion && <div className="rtw-linea"><span>{tx("invitacion.ubicacion.direccion")}</span><span>{ceremoniaDireccion}</span></div>}
                    </div>
                  </div>
                  <div className="rtw-folio rtw-folio--pie">
                    <span>{tx("invitacion.ubicacion.ceremoniaCivil").toUpperCase()}</span>
                    {!scrollVertical && <span>{tx("invitacion.portada.desliza").toUpperCase()} ▶▶</span>}
                  </div>
                </div>
              )}

              {hayComoLlegar && (
                <div id="location" data-tone="dark" className="rtw-panel rtw-panel--sol">
                  <div className="rtw-grilla3d" aria-hidden="true"><span /></div>
                  <div className="rtw-folio rtw-folio--acento">
                    <span>{nCuando} — {tx("invitacion.ubicacion.comoLlegar").toUpperCase()}</span><span>{deLugar("llegar")}</span>
                  </div>
                  <div className="rtw-spread">
                    <div className="rtw-pagina">
                      <span className="rtw-panel-sub">Track {deLugar("llegar").split(" ")[0]}</span>
                      <h2 className="rtw-panel-titulo">{tx("invitacion.ubicacion.comoLlegar")}</h2>
                    </div>
                    <div className="rtw-tarjeta-lugar">
                      {embedMapUrl && (
                        <div className="rtw-mapa">
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
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="rtw-cta">
                        {tx("invitacion.ubicacion.abrirEnMapas").toUpperCase()}<span>▶</span>
                      </a>
                    </div>
                  </div>
                  <div className="rtw-folio rtw-folio--pie">
                    <span>{[direccion, ciudad].filter(Boolean).join(" · ").toUpperCase()}</span>
                    {!scrollVertical && <span>{tx("invitacion.portada.desliza").toUpperCase()} ▶▶</span>}
                  </div>
                </div>
              )}

              {cronograma.length > 0 && (
                <div id="schedule" data-tone="dark" className="rtw-panel rtw-panel--sol rtw-panel--suelo">
                  <div className="rtw-grilla3d" aria-hidden="true"><span /></div>
                  <div className="rtw-folio rtw-folio--acento">
                    <span>{nCuando} — {tx("invitacion.ubicacion.cronograma").toUpperCase()}</span><span>{deLugar("cronograma")}</span>
                  </div>
                  <div className="rtw-spread">
                    <div className="rtw-pagina">
                      <span className="rtw-panel-sub">Track {deLugar("cronograma").split(" ")[0]}</span>
                      <h2 className="rtw-panel-titulo">{tx("invitacion.ubicacion.laNochePasoAPaso").split(",")[0]}</h2>
                    </div>
                    <div className="rtw-tarjeta-lugar">
                      {cronograma.map((item, i) => (
                        <div key={i} className="rtw-linea"><span>{item.time || ""}</span><span>{item.title}</span></div>
                      ))}
                    </div>
                  </div>
                  <div className="rtw-folio rtw-folio--pie">
                    <span>{fechaPuntos}</span>
                  </div>
                </div>
              )}
            </div>
            {!scrollVertical && panelesLugar.length > 1 && <Puntos cantidad={panelesLugar.length} />}
          </div>
        </div>

        {/* ── 05 Check-in ────────────────────────────────────────────────
            La carátula del cassette: pliego cian con barrido, la tarjeta
            crema con borde y sombra dura, "● REC" y el sello triangular
            GRABADO al confirmar. */}
        {rsvpHabilitado && (
          <section id="rsvp" data-tone="dark" data-screen-label={tx("invitacion.rsvp.confirmar")} className="rtw-section rtw-checkin">
            <span className="rtw-vhs rtw-vhs--suave" aria-hidden="true" />
            <div className="rtw-folio">
              <span data-xin="1" data-dist="-40">{nCheckin} — CHECK-IN</span>
              <span data-xin="1" data-dist="40">{folio(nCheckin)}</span>
            </div>
            <div className="rtw-spread">
              <div className="rtw-pagina">
                <h2 data-xin="1" data-dist="-80" className="rtw-h2 rtw-h2--sombra-crema">
                  {tx("invitacion.rsvp.confirmaLinea1")}<br /><span className="rtw-magenta">{tx("invitacion.rsvp.confirmaLinea2")}</span>
                </h2>
              </div>
              <div data-xin="1" data-delay="160" data-dist="80" className="rtw-cupon">
                <CheckinRetrowave
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
            Polaroids: marco blanco con el borde de abajo más ancho, sombra
            dura y cada una apenas girada. */}
        {todasLasFotos.length > 0 && (
          <div
            id="album"
            data-pan="1"
            data-scroll={scrollVertical || hojasDeFotos.length <= 1 ? "vertical" : "lateral"}
            data-screen-label={tx("invitacion.album.titulo")}
            className="rtw-pan"
            style={{ "--st-pasos": Math.max(0, hojasDeFotos.length - 1) } as React.CSSProperties}
          >
            <div className="rtw-pan-fijo rtw-pan-fijo--album">
              <div data-strip="1" className="rtw-tira">
                {hojasDeFotos.map((hoja, iHoja) => (
                  <div key={iHoja} data-tone="light" className={`rtw-panel rtw-panel--album${iHoja % 2 === 1 ? " rtw-panel--album-b" : ""}`}>
                    <div className="rtw-folio rtw-folio--gris">
                      <span>{nAlbum} — {tx("invitacion.album.titulo").toUpperCase()}</span>
                      <span>{tx("invitacion.album.hojaDeTotal", { n: String(iHoja + 1).padStart(2, "0"), total: String(hojasDeFotos.length).padStart(2, "0") }).toUpperCase()} · {folio(nAlbum)}</span>
                    </div>
                    <h2 className="rtw-h2 rtw-h2--album">Polaroids</h2>
                    <div className="rtw-polaroids" data-cantidad={hoja.length}>
                      {hoja.map((url, i) => (
                        <div
                          key={i}
                          data-sheet="1"
                          className="rtw-polaroid"
                          role="button"
                          tabIndex={0}
                          onClick={() => setFotoAmpliada(url)}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setFotoAmpliada(url); }}
                          aria-label={tx("invitacion.album.ampliarFoto", { n: i + 1 })}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="" loading="lazy" className="rtw-polaroid-img" />
                          <span data-colorwash="1" className={`rtw-bano rtw-bano--${(i % 5) + 1}`} aria-hidden="true" />
                          <span className="rtw-polaroid-n">FOTO {String(i + 1).padStart(2, "0")}</span>
                        </div>
                      ))}
                    </div>
                    <div className="rtw-folio rtw-folio--gris rtw-folio--pie">
                      <span>{tx("invitacion.album.fotosSubidas", { n: todasLasFotos.length }).toUpperCase()}</span>
                      {!scrollVertical && hojasDeFotos.length > 1 && <span>{tx("invitacion.portada.desliza").toUpperCase()} ▶▶</span>}
                    </div>
                  </div>
                ))}
              </div>
              {!scrollVertical && hojasDeFotos.length > 1 && <Puntos cantidad={hojasDeFotos.length} />}
            </div>
          </div>
        )}

        {/* ── 07 Música ──────────────────────────────────────────────────
            El walkman: dos carretes girando con la cinta entre ellos, y la
            lista con "A1, A2…" en el neón de cada tema. */}
        {sugerenciaMusicaHabilitada && (
          <section id="songs" data-tone="dark" data-screen-label={tx("invitacion.musica.titulo")} className="rtw-section rtw-musica">
            <div className="rtw-folio rtw-folio--cian">
              <span data-xin="1" data-dist="-40">{nMusica} — SIDE B</span>
              <span data-xin="1" data-dist="40">{folio(nMusica)}</span>
            </div>
            <div className="rtw-spread">
              <div className="rtw-pagina">
                <h2 data-xin="1" data-dist="-80" className="rtw-h2 rtw-h2--sombra-magenta">
                  {tituloEnDosLineas(tx("invitacion.sabor.preguntaCancionFaltar"), "rtw-cian")}
                </h2>
                <div data-xin="1" data-delay="120" className="rtw-walkman" aria-hidden="true">
                  <span className="rtw-carrete rtw-carrete--magenta" /><span className="rtw-cinta" /><span className="rtw-carrete rtw-carrete--cian" />
                </div>
              </div>
              <div className="rtw-pagina">
                <CancionesRetrowave
                  invitationId={String(invitation.id ?? "")}
                  guestToken={guest?.uniqueToken}
                  guestName={nombreInvitado || tx("invitacion.evento.invitado")}
                />
              </div>
            </div>
          </section>
        )}

        {/* ── 08 Regalos ─────────────────────────────────────────────────
            Pliego del sol: naranja con barrido, y las cuentas en tarjetas
            oscuras con borde y sombra de neón. */}
        {hayRegalos && (
          <section id="banco" data-tone="dark" data-screen-label={tx("invitacion.regalos.titulo")} className="rtw-section rtw-regalos">
            <span className="rtw-vhs rtw-vhs--suave" aria-hidden="true" />
            <div className="rtw-folio">
              <span data-xin="1" data-dist="-40">{nRegalos} — {tx("invitacion.regalos.titulo").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nRegalos)}</span>
            </div>
            <div className="rtw-spread">
              <div className="rtw-pagina">
                <h2 data-xin="1" data-dist="-80" className="rtw-h2 rtw-h2--sombra-crema">
                  {tx("invitacion.regalos.siQueresLinea1")}<br /><span className="rtw-magenta">{tx("invitacion.regalos.siQueresLinea2")}</span>
                </h2>
                {Boolean(invitation.regaloMensaje) && (
                  <p data-xin="1" data-delay="120" className="rtw-parrafo">{String(invitation.regaloMensaje)}</p>
                )}
              </div>
              <div className="rtw-pagina">
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
            El arcade: "LEVEL 1 / 3" sobre el cielo, la grilla cian en fuga
            y las opciones que dicen WIN o MISS. */}
        {quizHabilitado && (
          <section id="quiz" data-tone="dark" data-screen-label="Quiz" className="rtw-section rtw-quiz">
            <div className="rtw-grilla3d rtw-grilla3d--cian" aria-hidden="true"><span /></div>
            <div className="rtw-folio rtw-folio--cian">
              <span data-xin="1" data-dist="-40">{nQuiz} — {triviaTitulo.toUpperCase()}</span>
              <span data-xin="1" data-dist="40">HIGH SCORE · {folio(nQuiz)}</span>
            </div>
            <div className="rtw-spread">
              <TriviaRetrowave
                preguntas={triviaPreguntas}
                invitationId={String(invitation.id ?? "")}
                guestToken={guest?.uniqueToken}
                guestName={nombreInvitado || tx("invitacion.evento.invitado")}
              />
            </div>
          </section>
        )}

        {/* ── 10 Tu pase ─────────────────────────────────────────────────
            El ticket de entrada: el QR sobre crema con borde cian y sombra
            magenta, el pase enorme en itálica y "◀◀ Rebobinar". */}
        <section data-tone="dark" data-screen-label={tx("invitacion.pase.tuPase")} className="rtw-section rtw-pase">
          <span className="rtw-sol-rayado rtw-sol-rayado--chico" aria-hidden="true" />
          <div className="rtw-folio rtw-folio--cian">
            <span data-xin="1" data-dist="-40">{nPase} — {tx("invitacion.pase.tuPase").toUpperCase()}</span>
            <span data-xin="1" data-dist="40">{folio(nPase)}</span>
          </div>
          <div className="rtw-spread">
            <div data-xin="1" data-dist="-60" className="rtw-pagina rtw-pagina--qr">
              <div className="rtw-qr">
                <QrDeIngreso guest={guest as never} />
                <span className="rtw-qr-etq">{tx("invitacion.pase.tuPase").toUpperCase()}</span>
              </div>
            </div>
            <div className="rtw-pagina">
              <div data-xin="1" data-delay="100" className="rtw-pase-cabeza">
                <div className="rtw-pase-numero">
                  <span className="rtw-folio-etq">{tx("invitacion.pase.pase").toUpperCase()} Nº</span>
                  <span>{pase}</span>
                </div>
                {guest?.mesas && guest.mesas.length > 0 && (
                  <div className="rtw-pase-mesa">
                    <span className="rtw-folio-etq">{tx("invitacion.pase.tuMesa").toUpperCase()}</span>
                    <span>{guest.mesas[0]}</span>
                  </div>
                )}
              </div>
              <div data-xin="1" data-delay="160" className="rtw-caja">
                <div className="rtw-linea"><span>{saludaAlInvitado ? tx("invitacion.pase.reservadoPara") : tx("invitacion.evento.invitado")}</span><span>{nombreInvitado || titulo}</span></div>
                {lugaresDelPase > 0 && (
                  <div className="rtw-linea"><span>{tx("invitacion.pase.lugares")}</span><span>{lugaresDelPase}</span></div>
                )}
                {guest?.mesas && guest.mesas.length > 0 && (
                  <div className="rtw-linea"><span>Sector</span><span>{guest.mesas.join(" · ")}</span></div>
                )}
                <div className="rtw-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{fechaPuntos} · {hora} H</span></div>
              </div>
              <div className="rtw-info-extra">
                <InfoAdicionalSection invitation={invitation} />
              </div>
            </div>
          </div>
          <div data-xin="1" data-delay="220" className="rtw-pase-pie">
            <span className="rtw-despedida">{tx("invitacion.pase.losEsperamos")} {iniciales(nombre1, nombre2)}</span>
            <div className="rtw-folio rtw-folio--cian rtw-folio--colofon">
              <span className="rtw-credito"><LogoFooterCredit bgColor="transparent" textColor={PALETA.ink} /></span>
              <span className="rtw-replay" role="button" tabIndex={0} onClick={volverAVerla} onKeyDown={(e) => { if (e.key === "Enter") volverAVerla(); }}>
                ◀◀ {tx("invitacion.portada.verAperturaOtraVez").toUpperCase()}
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* ── Riel de progreso ───────────────────────────────────────────── */}
      <div ref={rielRef} className="rtw-riel">
        <span ref={rielTopRef} className="rtw-riel-top">{pase}</span>
        <div ref={rielLineaRef} className="rtw-riel-linea">
          <span ref={rielBarraRef} className="rtw-riel-barra" />
        </div>
        <span ref={rielEtiquetaRef} className="rtw-riel-etiqueta">{tx("invitacion.saveTheDate.guardaLaFecha").toUpperCase()}</span>
      </div>

      {/* ── La tapa ─────────────────────────────────────────────────────
          El atardecer: cielo con estrellas, el sol y las palmeras sobre el
          horizonte, la grilla en fuga que corre hacia adelante y el nombre
          como logo de los 80. Es la bienvenida: dice de quién es la
          fiesta, cuándo, dónde y para cuántos. */}
      <div ref={portadaRef} data-tone={TONO} className="rtw-portada">
        <div ref={escenaPortadaRef} className="rtw-portada-hoja">
          <div className="rtw-escenario" aria-hidden="true">
            <span className="rtw-cielo" />
            {ESTRELLAS.map(([x, y, s], i) => (
              <span key={i} className="rtw-estrella" style={{ left: `${x}%`, top: `${y}%`, width: s, height: s, animationDuration: `${(1.6 + (i % 4) * 0.5).toFixed(1)}s`, animationDelay: `${(i * 0.33).toFixed(2)}s` }} />
            ))}
            <div className="rtw-horizonte-escena">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img data-depth="-0.4" src="/templates/retrowave/sol.webp" alt="" className="rtw-sol" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img data-depth="0.8" src="/templates/retrowave/palmera-izq.webp" alt="" className="rtw-palmera rtw-palmera--izq" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img data-depth="1.2" src="/templates/retrowave/palmera-der.webp" alt="" className="rtw-palmera rtw-palmera--der" />
            </div>
            <div className="rtw-suelo"><div className="rtw-suelo-plano"><span className="rtw-suelo-grilla" /></div></div>
            <span className="rtw-horizonte" />
            <span className="rtw-scan" />
          </div>

          <div data-cl="1" className="rtw-folio rtw-folio--cian rtw-folio--tapa">
            <span>{kickerDelEvento}</span>
            <span>Nº 00 / {String(totalPliegos).padStart(2, "0")}</span>
          </div>

          <div data-cl="2" className="rtw-tapa-centro">
            <span className="rtw-tapa-kicker">Now playing</span>
            <h1 ref={cartelRef} className="rtw-tapa-nombres" style={{ "--largo": renglonMasLargo, "--n": totalLetras } as React.CSSProperties}>
              {saludaAlInvitado ? (
                <span className="rtw-tapa-linea"><span data-pieza="1" className="rtw-tapa-logo"><Letras texto={nombreInvitado} desde={0} /></span></span>
              ) : (
                <>
                  <span className="rtw-tapa-linea"><span data-pieza="1" className="rtw-tapa-logo"><Letras texto={nombre1} desde={0} /></span></span>
                  {nombre2 && (
                    <>
                      <span className="rtw-tapa-linea rtw-tapa-linea--amp"><span data-pieza="1">&amp;</span></span>
                      <span className="rtw-tapa-linea"><span data-pieza="1" className="rtw-tapa-logo rtw-tapa-logo--inv"><Letras texto={nombre2} desde={nombre1.replace(/\s/g, "").length} /></span></span>
                    </>
                  )}
                </>
              )}
            </h1>
            <div className="rtw-placa rtw-placa--datos">
              <span>{lugarNombre || "—"}<br /><span className="rtw-cian">{[direccion, ciudad].filter(Boolean).join(" · ")}</span></span>
              <span className="rtw-placa-der">
                {isPersonalized && guest
                  ? <>{tx("invitacion.pase.pase")} Nº {pase}<br /><span className="rtw-cian">{lugaresDelPase} {tx(lugaresDelPase === 1 ? "invitacion.bienvenida.persona" : "invitacion.bienvenida.personas")}</span></>
                  : <>{hora} h<br /><span className="rtw-cian">{fechaPuntos}</span></>}
              </span>
            </div>
          </div>

          <div data-cl="3" className="rtw-tapa-pie">
            <p className="rtw-placa rtw-tapa-mensaje">
              {saludaAlInvitado
                ? `${tx("invitacion.bienvenida.hola", { nombre: nombreInvitado })}. ${String(invitation.portadaMensaje || tx("invitacion.sabor.mensajeLoContamosNosotros"))}`
                : String(invitation.portadaMensaje || tx("invitacion.sabor.mensajeLoContamosNosotros"))}
            </p>
            <button type="button" onClick={abrir} className="rtw-tapa-btn">
              <span>▶ Play</span><span className="rtw-tapa-btn-etq">{tx("invitacion.portada.abrirInvitacion").toUpperCase()}</span>
            </button>
          </div>
        </div>
      </div>

      <div ref={pistaRef} className="rtw-pista">{tx("invitacion.portada.desliza").toUpperCase()} ▼</div>

      {fotoAmpliada && (
        <div className="rtw-lupa" onClick={() => setFotoAmpliada(null)} onContextMenu={(e) => e.preventDefault()}>
          <button
            type="button"
            className="rtw-lupa-cerrar"
            onClick={(e) => { e.stopPropagation(); setFotoAmpliada(null); }}
            aria-label={tx("invitacion.cerrar")}
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fotoAmpliada} alt={tx("invitacion.album.fotoAmpliada")} className="rtw-lupa-img" draggable={false} onClick={(e) => e.stopPropagation()} />
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

/** "V & T": las iniciales de la despedida. */
function iniciales(a: string, b: string): string {
  const i = (s: string) => (s.trim()[0] || "").toUpperCase();
  return b ? `${i(a)} & ${i(b)}` : i(a);
}

/**
 * El nombre letra por letra: cada tanto una hace "glitch" (se corre y se
 * inclina tres pasos y vuelve), como una cinta que tiembla. El CSS
 * escalona el turno de cada letra.
 */
function Letras({ texto, desde }: { texto: string; desde: number }) {
  let k = desde;
  return (
    <>
      {Array.from(texto).map((ch, i) =>
        ch === " " ? " " : <span key={i} className="rtw-letra" style={{ "--i": k++ } as React.CSSProperties}>{ch}</span>
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
    <div className="rtw-puntos" aria-hidden="true">
      {Array.from({ length: cantidad }).map((_, i) => (
        <span key={i} data-dot={i} className="rtw-punto" style={{ background: i === 0 ? PALETA.acc : "rgba(43,42,51,.18)" }} />
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
function CuentaRetrowave({ targetDate }: { targetDate: Date }) {
  const tx = useTextos();
  const { time, isEventDay, isPast, hasEnded } = useCountdown(targetDate);

  if (isEventDay || hasEnded || isPast) {
    return (
      <div className="rtw-tarjeta rtw-tarjeta--hoy" data-xin="1" data-delay="80" data-dist="30">
        <span className="rtw-tarjeta-kicker">{tx("invitacion.cuentaRegresiva.kicker").toUpperCase()}</span>
        <span className="rtw-tarjeta-titulo">
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
    <div className="rtw-cuenta">
      {celdas.map((c, i) => (
        <div key={c.l} data-xin="1" data-delay={i * 100} data-dist={i % 2 === 0 ? -80 : 80} className={`rtw-cuenta-caja rtw-cuenta-caja--${i + 1}`}>
          <span className="rtw-cuenta-num"><span key={c.v}>{c.v}</span></span>
          <span className="rtw-cuenta-etq">{c.l.toUpperCase()}</span>
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
    <div className="rtw-fila rtw-fila--copiable">
      <div className="rtw-fila-texto">
        <span className="rtw-fila-etq">{etiqueta.toUpperCase()}</span>
        <span className="rtw-fila-dato">{valor}</span>
      </div>
      <button type="button" onClick={copiar} className={`rtw-btn-copiar${copiado ? " rtw-btn-copiar--hecho" : ""}`}>
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
      className={`rtw-tarjeta rtw-tarjeta--banco${dobleZ ? " rtw-doblez" : ""}${inclinada ? " rtw-tarjeta--der" : " rtw-tarjeta--izq"}`}
    >
      <span className="rtw-tarjeta-kicker">{titulo.toUpperCase()}</span>
      {mensaje && <p className="rtw-tarjeta-mensaje">{mensaje}</p>}
      <div className="rtw-filas">
        <FilaCopiable etiqueta="Alias" valor={alias} />
        <FilaCopiable etiqueta="CBU" valor={cbu} />
        {(banco || titular) && (
          <div className="rtw-fila rtw-fila--ultima">
            <span>{banco || tx("invitacion.regalos.banco")}</span>
            <span className="rtw-fila-valor">{titular}</span>
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
function CheckinRetrowave({
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
      <div data-xin="1" data-delay="140" data-dist="30" className="rtw-tarjeta rtw-tarjeta--izq">
        <p className="rtw-tarjeta-mensaje">{tx("invitacion.rsvp.graciasPorAvisarAcceso")}</p>
        <button type="button" className="rtw-btn-fantasma" onClick={() => setEstado("PENDING")}>
          {tx("invitacion.rsvp.cambieDeIdea").toUpperCase()}
        </button>
      </div>
    );
  }

  const confirmadoYa = estado === "CONFIRMED";

  return (
    <>
      <div ref={tarjetaRef} data-xin="1" data-delay="140" data-dist="30" className="rtw-tarjeta rtw-tarjeta--talon">
        <div className="rtw-talon-top">
          <span>{tx("invitacion.pase.numeroPase", { n: pase }).toUpperCase()}{guestName ? ` · ${guestName.toUpperCase()}` : ""}</span>
          <span ref={estadoRef} className="rtw-talon-estado">
            {confirmado || confirmadoYa ? tx("invitacion.pase.accesoConfirmado").toUpperCase() : tx("invitacion.pase.pendiente").toUpperCase()}
          </span>
        </div>

        {!confirmadoYa ? (
          <>
            {lugares > 1 && (
              <div className="rtw-campo">
                <label className="rtw-etiqueta">{tx("invitacion.rsvp.adultos").toUpperCase()}</label>
                <div className="rtw-contador">
                  <button type="button" onClick={() => setAdultos((v) => Math.max(1, v - 1))} disabled={adultos <= 1} aria-label="−">−</button>
                  <span>{adultos}</span>
                  <button type="button" onClick={() => setAdultos((v) => Math.min(maxAdultos, v + 1))} disabled={adultos >= maxAdultos} aria-label="+">+</button>
                </div>
              </div>
            )}
            {maxAdolescentes > 0 && (
              <div className="rtw-campo">
                <label className="rtw-etiqueta">{tx("invitacion.rsvp.adolescentes").toUpperCase()}</label>
                <div className="rtw-contador">
                  <button type="button" onClick={() => setAdolescentes((v) => Math.max(0, v - 1))} disabled={adolescentes <= 0} aria-label="−">−</button>
                  <span>{adolescentes}</span>
                  <button type="button" onClick={() => setAdolescentes((v) => Math.min(maxAdolescentes, v + 1))} disabled={adolescentes >= maxAdolescentes} aria-label="+">+</button>
                </div>
              </div>
            )}
            {maxNinos > 0 && (
              <div className="rtw-campo">
                <label className="rtw-etiqueta">{tx("invitacion.rsvp.ninos").toUpperCase()}</label>
                <div className="rtw-contador">
                  <button type="button" onClick={() => setNinos((v) => Math.max(0, v - 1))} disabled={ninos <= 0} aria-label="−">−</button>
                  <span>{ninos}</span>
                  <button type="button" onClick={() => setNinos((v) => Math.min(maxNinos, v + 1))} disabled={ninos >= maxNinos} aria-label="+">+</button>
                </div>
              </div>
            )}
            <div className="rtw-campo">
              <label className="rtw-etiqueta">{tx("invitacion.rsvp.restriccionAlimentaria").toUpperCase()}</label>
              <input
                value={dieta}
                onChange={(e) => setDieta(e.target.value)}
                placeholder="—"
                maxLength={120}
                className="rtw-input"
              />
            </div>
          </>
        ) : (
          <div className="rtw-filas">
            {lugares > 1 && adultos > 0 && <div className="rtw-fila"><span>{tx("invitacion.rsvp.adultos")}</span><span>{adultos}</span></div>}
            {adolescentes > 0 && <div className="rtw-fila"><span>{tx("invitacion.rsvp.adolescentes")}</span><span>{adolescentes}</span></div>}
            {ninos > 0 && <div className="rtw-fila"><span>{tx("invitacion.rsvp.ninos")}</span><span>{ninos}</span></div>}
            <div className="rtw-fila rtw-fila--ultima">
              <span>{tx("invitacion.rsvp.restriccionAlimentaria")}</span>
              <span className="rtw-fila-valor">{restricciones || dieta || "—"}</span>
            </div>
          </div>
        )}

        {hayPago && monto != null && !exento && (
          <div className="rtw-precio">
            <span>{estadoDePago === "PAID" ? tx("invitacion.pago.abonado") : tx("invitacion.pago.valor")}</span>
            <div className="rtw-precio-valor">
              <span className="rtw-precio-total">{formatearMoneda(totalAPagar)}</span>
              {usarTotalDelServidor && vistaDePago
                ? vistaDePago.lines.map((l, i) => <span key={i} className="rtw-precio-detalle">{l}</span>)
                : (
                  <>
                    {adultos > 0 && <span className="rtw-precio-detalle">{adultos} × {formatearMoneda(precioAdulto)}</span>}
                    {adolescentes > 0 && <span className="rtw-precio-detalle">{adolescentes} × {formatearMoneda(precioAdo)}</span>}
                    {ninos > 0 && <span className="rtw-precio-detalle">{ninos} × {formatearMoneda(precioNin)}</span>}
                  </>
                )}
            </div>
          </div>
        )}

        <div ref={selloRef} className="rtw-sello" aria-hidden="true">{tx("invitacion.pase.confirmado").toUpperCase()}</div>
        <div ref={petalosRef} className="rtw-petalos" aria-hidden="true" />
      </div>

      {error && <p className="rtw-error">{error}</p>}

      {!confirmadoYa ? (
        <>
          <button type="button" data-xin="1" data-delay="220" className="rtw-btn-solido" disabled={enviando} onClick={() => enviar("CONFIRMA")}>
            {enviando ? tx("invitacion.rsvp.guardando").toUpperCase() : tx("invitacion.rsvp.confirmarAsistencia").toUpperCase()}
          </button>
          <button type="button" data-xin="1" data-delay="280" className="rtw-btn-fantasma" disabled={enviando} onClick={() => enviar("NO_ASISTE")}>
            {tx("invitacion.rsvp.noVoyAPoderAsistir").toUpperCase()}
          </button>
        </>
      ) : (
        <button type="button" className="rtw-btn-fantasma" onClick={() => setEstado("PENDING")}>
          {tx("invitacion.rsvp.modificarAsistencia").toUpperCase()}
        </button>
      )}
    </>
  );
}

interface CancionItem { id: string; title: string; artist: string; guestName: string }

/** Sugerir una canción, en una tarjeta de papel con la lista debajo. */
function CancionesRetrowave({ invitationId, guestToken, guestName }: { invitationId: string; guestToken?: string; guestName: string }) {
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
      <form onSubmit={enviar} data-xin="1" data-delay="140" data-dist="30" className="rtw-tarjeta rtw-tarjeta--der">
        <div className="rtw-campo">
          <label className="rtw-etiqueta">{tx("invitacion.musica.tema").toUpperCase()}</label>
          <input value={tema} onChange={(e) => setTema(e.target.value)} placeholder={tx("invitacion.musica.nombreDeLaCancion")} maxLength={100} className="rtw-input rtw-input--serif" />
        </div>
        <div className="rtw-campo">
          <label className="rtw-etiqueta">{tx("invitacion.musica.artista").toUpperCase()}</label>
          <input value={artista} onChange={(e) => setArtista(e.target.value)} placeholder={tx("invitacion.musica.artista")} maxLength={80} className="rtw-input rtw-input--serif" />
        </div>
        {error && <p className="rtw-error">{error}</p>}
        <button type="submit" disabled={enviando} className="rtw-btn-solido rtw-btn-solido--tinta">
          {enviando ? tx("invitacion.musica.enviando").toUpperCase() : tx("invitacion.musica.sugeriUnaCancion").toUpperCase()}
        </button>
      </form>

      {canciones.length > 0 && (
        <div data-xin="1" data-delay="220" className="rtw-lista">
          {canciones.slice(0, 8).map((c) => (
            <div key={c.id} className="rtw-lista-fila">
              <div className="rtw-lista-texto">
                <span className="rtw-lista-tema">{c.title}</span>
                <span className="rtw-lista-quien">{c.artist} · {tx("invitacion.musica.sumadoPor")} {c.guestName || tx("invitacion.evento.invitado")}</span>
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
function TriviaRetrowave({ preguntas, invitationId, guestToken, guestName }: { preguntas: QuizPregunta[]; invitationId: string; guestToken?: string; guestName: string }) {
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
      <div data-xin="1" data-delay="140" data-dist="30" className="rtw-tarjeta rtw-tarjeta--izq">
        <span className="rtw-tarjeta-kicker">{tx("invitacion.quiz.kicker").toUpperCase()}</span>
        <span className="rtw-tarjeta-titulo">
          {guardando ? tx("invitacion.rsvp.guardando") : tx("invitacion.quiz.respondisteCorrectamente", { aciertos: puntaje, total: preguntas.length })}
        </span>
        {!guardando && stats && stats.count > 0 && (
          <p className="rtw-tarjeta-mensaje">{tx("invitacion.quiz.promedio", { n: stats.count, avg: stats.avg })}</p>
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
    <div data-xin="1" data-delay="140" data-dist="30" className="rtw-tarjeta rtw-tarjeta--izq">
      <span className="rtw-tarjeta-kicker">{tx("invitacion.quiz.preguntaDeTotal", { n: indice + 1, total: preguntas.length }).toUpperCase()}</span>
      <span className="rtw-tarjeta-pregunta">{q.pregunta}</span>
      <div className="rtw-opciones">
        {q.opciones.map((op, oi) => {
          let clase = "";
          if (yaEligio && correcta !== undefined) {
            if (oi === correcta) clase = " rtw-opcion--bien";
            else if (elegidas[indice] === oi) clase = " rtw-opcion--mal";
          }
          return (
            <button key={oi} type="button" disabled={yaEligio} onClick={() => elegir(oi)} className={`rtw-opcion${clase}`}>
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
// leen la Bienvenida y el Post-evento compartidos (esperan `rtw-section` y
// `rtw-kicker`).
const CSS_RTW = `
  /* ── Retrowave ────────────────────────────────────────────────────────
     El atardecer de los 80: Righteous siempre en itálica con sombras duras
     desplazadas (magenta y cian), Manrope para el texto, la grilla en fuga
     hecha con dos gradientes sobre un plano en perspectiva, líneas de
     barrido VHS y el sol rayado. Las únicas imágenes son el sol y las dos
     palmeras de la tapa, en WebP. */
  .rtw-raiz { position: fixed; inset: 0; width: 100%; height: calc(var(--vh, 1vh) * 100); overflow: hidden;
    background: var(--pp-bg); color: var(--pp-ink); font-family: var(--rtw-sans), 'Manrope', sans-serif;
    --rtw-sky: ${PALETA.sky}; --rtw-ground: ${PALETA.ground}; --rtw-acc3: ${PALETA.acc3}; --rtw-sun: ${PALETA.sun};
    --rtw-vhs: color-mix(in srgb, var(--pp-bg) 12%, transparent);
    --rtw-linea: color-mix(in srgb, var(--pp-ink) 25%, transparent); }
  .rtw-raiz a { color: inherit; text-decoration: none; }
  .rtw-raiz button { font: inherit; }

  .rtw-scroller { position: absolute; inset: 0; overflow-y: auto; overflow-x: hidden; opacity: 0;
    transition: opacity 900ms ease 260ms; scrollbar-width: none; }
  .rtw-scroller::-webkit-scrollbar { width: 0; height: 0; }

  /* Las líneas de barrido del VHS, el sol rayado y la grilla en fuga. */
  .rtw-vhs { position: absolute; inset: 0; pointer-events: none; z-index: 0; background: repeating-linear-gradient(180deg, transparent 0 22px, var(--rtw-vhs) 22px 24px); }
  .rtw-vhs--suave { --rtw-vhs: color-mix(in srgb, var(--pp-bg) 8%, transparent); }
  .rtw-sol-rayado { position: absolute; right: -10%; top: 6%; width: 60vw; height: 60vw; max-width: 460px; max-height: 460px; border-radius: 50%;
    background: var(--rtw-sun); pointer-events: none; opacity: .9; z-index: 0;
    -webkit-mask-image: repeating-linear-gradient(180deg, #000 0 14px, transparent 14px 20px); mask-image: repeating-linear-gradient(180deg, #000 0 14px, transparent 14px 20px); }
  .rtw-sol-rayado--chico { top: 4%; width: 50vw; height: 50vw; max-width: 400px; max-height: 400px; opacity: .8;
    -webkit-mask-image: repeating-linear-gradient(180deg, #000 0 12px, transparent 12px 18px); mask-image: repeating-linear-gradient(180deg, #000 0 12px, transparent 12px 18px); }
  .rtw-grilla3d { position: absolute; left: -20%; right: -20%; bottom: -10%; height: 45%; perspective: 420px; perspective-origin: 50% 0; pointer-events: none; opacity: .45; z-index: 0; }
  .rtw-grilla3d > span { position: absolute; inset: 0; transform-origin: 50% 0; transform: rotateX(62deg);
    background-image: linear-gradient(var(--rtw-neon, var(--pp-acc)) 2px, transparent 2px), linear-gradient(90deg, var(--rtw-neon, var(--pp-acc)) 2px, transparent 2px); background-size: 64px 64px; }
  .rtw-grilla3d--magenta { height: 50%; opacity: .5; --rtw-neon: var(--pp-acc); }
  .rtw-grilla3d--cian { --rtw-neon: var(--rtw-acc3); }

  /* ── El pliego ─────────────────────────────────────────────────────── */
  .rtw-section { position: relative; z-index: 1; min-height: calc(var(--vh, 1vh) * 100); box-sizing: border-box; overflow: hidden;
    display: flex; flex-direction: column; gap: 24px;
    padding: 60px max(20px, calc((100% - 1100px) / 2)) 80px; background: var(--pp-bg); color: var(--pp-ink); }

  /* El folio: Manrope 800 con tracking, en cian cuando va sobre oscuro. */
  .rtw-folio { position: relative; z-index: 1; display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;
    font-weight: 800; font-size: 11px; letter-spacing: .26em; text-transform: uppercase; }
  .rtw-folio--cian { color: var(--rtw-acc3); }
  .rtw-folio--acento { color: var(--rtw-neon, var(--pp-acc)); }
  .rtw-folio--gris { color: #6E6A78; }
  .rtw-folio--pie { align-items: center; margin-top: auto; letter-spacing: .22em; }
  .rtw-panel > .rtw-folio--pie { color: inherit; opacity: .8; }
  .rtw-folio--colofon { align-items: center; border-top: 1px solid var(--rtw-linea); padding-top: 12px; }
  .rtw-folio-etq { font-weight: 800; font-size: 11px; letter-spacing: .26em; text-transform: uppercase; color: var(--rtw-acc3); display: block; }
  .rtw-barra { width: 40%; height: 2px; background: var(--pp-acc); }
  .rtw-magenta { color: var(--pp-acc); }
  .rtw-cian { color: var(--rtw-acc3); }

  /* El spread: dos páginas; desde 1024 px se abren de verdad. */
  .rtw-spread { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 22px; }
  .rtw-pagina { display: flex; flex-direction: column; gap: 14px; min-width: 0; }
  @media (min-width: 1024px) {
    .rtw-spread { display: grid; grid-template-columns: 1fr 1fr; align-items: center; column-gap: 72px; }
    .rtw-spread > * { max-width: 560px; width: 100%; min-width: 0; }
    .rtw-spread > *:first-child { justify-self: end; }
    .rtw-spread > *:last-child { justify-self: start; }
    .rtw-pagina--entera { grid-column: 1 / -1; max-width: none; justify-self: stretch; }
  }

  /* ── Tipos ─────────────────────────────────────────────────────────── */
  .rtw-h2, .rtw-panel-titulo, .rtw-frase, .rtw-fecha-linea, .rtw-tapa-nombres {
    font-family: var(--rtw-serif), 'Righteous', cursive; font-weight: 400; font-style: italic; }
  .rtw-h2, .rtw-panel-titulo { position: relative; z-index: 1; margin: 0; line-height: .92; font-size: clamp(48px, 14vw, 120px); }
  .rtw-h2--album { font-size: clamp(44px, 12vw, 100px); text-shadow: 4px 4px 0 var(--rtw-acc3); }
  .rtw-h2--sombra-crema { text-shadow: 4px 4px 0 var(--pp-ink); }
  .rtw-h2--sombra-magenta { text-shadow: 4px 4px 0 var(--pp-acc); }
  .rtw-panel-titulo { text-shadow: 4px 4px 0 var(--rtw-neon, var(--pp-acc)); }
  .rtw-panel-sub { font-weight: 800; font-size: 12px; letter-spacing: .24em; text-transform: uppercase; color: var(--rtw-neon, var(--pp-acc)); }
  .rtw-parrafo { margin: 0; font-weight: 700; font-size: 15px; line-height: 1.5; max-width: 40ch; }
  .rtw-chip { display: inline-block; padding: 12px 18px; font-weight: 800; font-size: 12px; letter-spacing: .18em; text-transform: uppercase; }
  .rtw-chip--oscuro { background: var(--pp-bg); color: var(--pp-ink); }
  .rtw-cta { margin-top: 6px; min-height: 48px; display: flex; align-items: center; justify-content: space-between; padding: 0 16px;
    background: var(--rtw-neon, var(--pp-acc)); color: var(--pp-bg); font-family: var(--rtw-serif), 'Righteous', cursive; font-size: 15px; letter-spacing: .1em; text-transform: uppercase; }

  /* ── 01 Guardá la fecha: la cinta VHS ──────────────────────────────── */
  .rtw-std { background: var(--pp-acc); color: var(--pp-bg); }
  .rtw-fecha { display: flex; flex-direction: column; line-height: .9; }
  .rtw-fecha-linea { font-size: clamp(56px, 18vw, 150px); text-shadow: 4px 4px 0 var(--pp-bg); }
  .rtw-fecha-linea--dia { font-size: clamp(96px, 32vw, 240px); color: var(--pp-bg); text-shadow: none; }
  .rtw-fecha-linea--mes { text-align: right; color: var(--pp-ink); text-transform: capitalize; }
  .rtw-fecha-linea--anio { color: var(--rtw-acc3); }
  .rtw-fecha-pie { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 10px;
    font-weight: 800; font-size: 12px; letter-spacing: .18em; text-transform: uppercase; }
  /* La foto: un cuadro de video 4:3 con borde oscuro y sombra dura cian. */
  .rtw-foto { position: relative; width: 100%; aspect-ratio: 4 / 3; box-sizing: border-box; overflow: hidden; border: 4px solid var(--pp-bg);
    box-shadow: 8px 8px 0 var(--rtw-acc3); background: repeating-linear-gradient(135deg, #3A2450 0 8px, #2C1A3E 8px 16px); }
  .rtw-foto-capa { position: absolute; inset: 0; }
  .rtw-foto-revelado { position: absolute; inset: 0; z-index: 1; pointer-events: none;
    background-image: radial-gradient(var(--pp-bg) calc(var(--rtw-punto, 7.2) * 1px), transparent calc(var(--rtw-punto, 7.2) * 1px + .6px));
    background-size: 10px 10px; }
  .rtw-foto-cabeza, .rtw-foto-pie { position: absolute; left: 12px; right: 12px; z-index: 2; display: flex; justify-content: space-between; color: var(--pp-ink); }
  .rtw-foto-cabeza { top: 10px; font-family: var(--rtw-serif), 'Righteous', cursive; font-size: 14px; letter-spacing: .1em; }
  .rtw-foto-pie { bottom: 10px; font-weight: 800; font-size: 11px; letter-spacing: .2em; text-transform: uppercase; }

  /* ── 02 Falta poco: el display digital ─────────────────────────────── */
  .rtw-countdown { justify-content: space-between; padding-left: 0; padding-right: 0; }
  .rtw-countdown > .rtw-folio, .rtw-countdown > .rtw-spread { margin-left: max(20px, calc((100% - 1100px) / 2)); margin-right: max(20px, calc((100% - 1100px) / 2)); }
  .rtw-marquesina { position: relative; z-index: 1; overflow: hidden; padding: 8px 0; white-space: nowrap; color: var(--pp-bg);
    font-weight: 800; font-size: 12px; letter-spacing: .26em; text-transform: uppercase; }
  .rtw-marquesina--cian { background: var(--rtw-acc3); transform: skewY(-2deg); font-family: var(--rtw-serif), 'Righteous', cursive; font-weight: 400; font-size: 24px; letter-spacing: .1em; }
  .rtw-marquesina--magenta { background: var(--pp-acc); transform: skewY(2deg); }
  .rtw-marquesina-tira { display: flex; width: max-content; animation: rtwCorre 16s linear infinite; }
  .rtw-marquesina-tira > span { padding-right: 36px; }
  .rtw-marquesina--contraria .rtw-marquesina-tira { animation-direction: reverse; }
  @keyframes rtwCorre { to { transform: translate3d(-50%, 0, 0); } }
  /* Cuatro pantallas: fondo cielo, borde y sombra dura del neón de cada una,
     la cifra en itálica del mismo color. */
  .rtw-cuenta { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .rtw-cuenta-caja { --rtw-neon: var(--pp-acc); position: relative; overflow: hidden; background: var(--rtw-sky); border: 2px solid var(--rtw-neon);
    box-shadow: 5px 5px 0 var(--rtw-neon); padding: 18px 14px 14px; display: flex; flex-direction: column; gap: 4px; }
  .rtw-cuenta-caja:nth-child(2) { --rtw-neon: var(--rtw-acc3); }
  .rtw-cuenta-caja:nth-child(3) { --rtw-neon: var(--rtw-sun); }
  .rtw-cuenta-caja:nth-child(4) { --rtw-neon: var(--pp-ink); }
  .rtw-cuenta-num { font-family: var(--rtw-serif), 'Righteous', cursive; font-style: italic; font-size: clamp(60px, 19vw, 140px); line-height: .9; color: var(--rtw-neon); font-variant-numeric: tabular-nums; }
  .rtw-cuenta-num > span { display: inline-block; animation: rtwCifra 300ms cubic-bezier(.16,1,.3,1); }
  @keyframes rtwCifra { from { transform: translateY(18%); opacity: .4; } to { transform: translateY(0); opacity: 1; } }
  .rtw-cuenta-etq { font-weight: 800; font-size: 11px; letter-spacing: .26em; text-transform: uppercase; }
  .rtw-tarjeta--hoy { background: var(--rtw-sky); border: 2px solid var(--pp-acc); box-shadow: 5px 5px 0 var(--pp-acc); padding: 18px; display: flex; flex-direction: column; gap: 8px; }
  .rtw-tarjeta--hoy .rtw-tarjeta-kicker { font-weight: 800; font-size: 11px; letter-spacing: .26em; text-transform: uppercase; color: var(--rtw-acc3); }
  .rtw-tarjeta--hoy .rtw-tarjeta-titulo { font-family: var(--rtw-serif), 'Righteous', cursive; font-style: italic; font-size: clamp(36px, 10vw, 84px); line-height: .92; text-shadow: 4px 4px 0 var(--pp-acc); }

  /* ── 03 Unas palabras: letras cromadas ─────────────────────────────── */
  .rtw-frase-seccion { background: var(--rtw-sky); justify-content: space-between; gap: 30px; }
  .rtw-frase { margin: 0; font-size: clamp(34px, 9.5vw, 80px); line-height: 1.02; max-width: 15ch; text-shadow: 3px 3px 0 var(--pp-bg); }
  .rtw-firma { align-self: flex-end; display: flex; align-items: center; gap: 12px; background: var(--pp-bg); border: 1px solid var(--pp-acc); padding: 12px 16px; max-width: 320px;
    font-weight: 700; font-size: 14px; line-height: 1.4; animation: rtwFlota 4s ease-in-out infinite; }
  .rtw-firma-play { font-family: var(--rtw-serif), 'Righteous', cursive; color: var(--pp-acc); font-size: 20px; }
  @keyframes rtwFlota { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }

  /* ── 04 Paneles: un track por lugar ────────────────────────────────── */
  .rtw-pan { position: relative; z-index: 1; height: calc(100vh + var(--st-pasos, 2) * 90vh); }
  .rtw-pan-fijo { position: sticky; top: 0; height: calc(var(--vh, 1vh) * 100); overflow: hidden; background: var(--pp-bg); }
  .rtw-pan-fijo--album { background: #F7F5F0; }
  .rtw-tira { position: absolute; top: 0; left: 0; height: 100%; display: flex; will-change: transform; }
  .rtw-panel { flex: 0 0 100vw; min-width: 0; height: 100%; box-sizing: border-box; position: relative; overflow: hidden;
    display: flex; flex-direction: column; justify-content: space-between; gap: 18px;
    padding: 60px max(20px, calc((100vw - 1100px) / 2)) 92px; background: var(--pp-bg); color: var(--pp-ink); }
  .rtw-panel--magenta { --rtw-neon: var(--pp-acc); background: var(--pp-bg); }
  .rtw-panel--cian { --rtw-neon: var(--rtw-acc3); background: var(--rtw-sky); }
  .rtw-panel--sol { --rtw-neon: var(--rtw-sun); background: var(--rtw-ground); }
  .rtw-panel--suelo { background: var(--rtw-ground); }
  .rtw-pan[data-scroll="vertical"] { height: auto; }
  .rtw-pan[data-scroll="vertical"] .rtw-pan-fijo { position: static; height: auto; overflow: visible; }
  .rtw-pan[data-scroll="vertical"] .rtw-tira { position: static; display: block; width: 100%; transform: none !important; }
  .rtw-pan[data-scroll="vertical"] .rtw-panel { height: auto; min-height: calc(var(--vh, 1vh) * 100); }
  .rtw-tarjeta-lugar { background: var(--pp-bg); border: 2px solid var(--rtw-neon, var(--pp-acc)); box-shadow: 6px 6px 0 var(--rtw-neon, var(--pp-acc));
    padding: 14px 16px; display: flex; flex-direction: column; gap: 8px; }
  .rtw-linea { display: flex; justify-content: space-between; gap: 14px; padding: 8px 0; border-bottom: 1px solid var(--rtw-linea); font-size: 15px; line-height: 1.3; }
  .rtw-linea > span:first-child { font-weight: 800; font-size: 11px; letter-spacing: .2em; text-transform: uppercase; color: var(--rtw-neon, var(--rtw-acc3)); flex: 0 0 auto; padding-top: 2px; }
  .rtw-linea > span:last-child { text-align: right; font-weight: 700; }
  .rtw-mapa { height: 190px; overflow: hidden; border: 2px solid var(--rtw-neon, var(--pp-acc)); }
  .rtw-puntos { position: absolute; left: 0; right: 40px; bottom: 30px; display: flex; gap: 8px; justify-content: center; z-index: 2; color: var(--rtw-acc3); }
  .rtw-punto { width: 28px; height: 4px; background: currentColor !important; opacity: .25; transition: opacity 300ms ease; display: inline-block; }
  .rtw-punto[data-activo="1"] { opacity: 1; }
  .rtw-pan-fijo--album .rtw-puntos { color: #1A0B2E; }

  /* ── 05 Check-in: la carátula del cassette ─────────────────────────── */
  .rtw-checkin { background: var(--rtw-acc3); color: var(--pp-bg); --rtw-vhs: color-mix(in srgb, var(--pp-bg) 8%, transparent); }
  .rtw-checkin .rtw-h2--sombra-crema { text-shadow: 4px 4px 0 var(--pp-ink); }
  .rtw-cupon { position: relative; background: var(--pp-ink); color: var(--pp-bg); border: 3px solid var(--pp-bg); box-shadow: 8px 8px 0 var(--pp-bg);
    padding: 20px; display: flex; flex-direction: column; gap: 14px; overflow: hidden; transition: box-shadow 400ms ease; }
  .rtw-cupon:has(.rtw-filas) { box-shadow: 8px 8px 0 var(--pp-acc); }
  .rtw-cupon .rtw-tarjeta { position: relative; display: flex; flex-direction: column; gap: 14px; background: transparent; border: 0; padding: 0; transform: none !important; }
  .rtw-talon-top { display: flex; justify-content: space-between; align-items: center; gap: 10px; font-weight: 800; font-size: 11px; letter-spacing: .22em;
    text-transform: uppercase; border-bottom: 3px solid var(--pp-bg); padding-bottom: 12px; }
  /* "● REC": el punto es magenta mientras graba y cian cuando ya grabó. */
  .rtw-talon-top > span:first-child { display: flex; align-items: center; gap: 8px; }
  .rtw-talon-top > span:first-child::before { content: ""; width: 10px; height: 10px; border-radius: 50%; background: var(--pp-acc); transition: background 300ms ease; }
  .rtw-cupon:has(.rtw-filas) .rtw-talon-top > span:first-child::before { background: var(--rtw-acc3); }
  .rtw-talon-estado { transition: color 400ms ease; }
  .rtw-campo { display: flex; flex-direction: column; gap: 6px; }
  .rtw-etiqueta { font-weight: 800; font-size: 11px; letter-spacing: .2em; text-transform: uppercase; }
  .rtw-input { min-height: 48px; border: 0; border-bottom: 2px solid var(--pp-bg); border-radius: 0; background: transparent; color: var(--pp-bg);
    font-family: var(--rtw-sans), 'Manrope', sans-serif; font-weight: 600; font-size: 15px; padding: 0; outline: none; }
  .rtw-contador { display: flex; align-items: center; border-bottom: 2px solid var(--pp-bg); min-height: 48px; }
  .rtw-contador button { width: 44px; min-height: 44px; border: 0; background: transparent; color: var(--pp-bg); cursor: pointer;
    font-family: var(--rtw-serif), 'Righteous', cursive; font-size: 24px; line-height: 1; }
  .rtw-contador button:disabled { opacity: .35; cursor: default; }
  .rtw-contador > span { flex: 1; text-align: center; font-family: var(--rtw-serif), 'Righteous', cursive; font-size: 28px; line-height: 1; color: var(--pp-acc); }
  .rtw-filas { display: flex; flex-direction: column; }
  .rtw-fila { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid color-mix(in srgb, var(--pp-bg) 25%, transparent); font-size: 15px; }
  .rtw-fila--ultima { border-bottom: 0; }
  .rtw-fila-valor { text-align: right; font-weight: 700; }
  .rtw-precio { display: flex; justify-content: space-between; gap: 12px; font-weight: 800; font-size: 12px; letter-spacing: .12em; text-transform: uppercase; }
  .rtw-precio-valor { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
  .rtw-precio-total { font-family: var(--rtw-serif), 'Righteous', cursive; font-size: 22px; line-height: 1; letter-spacing: 0; color: var(--pp-acc); }
  .rtw-precio-detalle { font-size: 11px; letter-spacing: .1em; }
  .rtw-btn-solido { min-height: 54px; border: 2px solid var(--pp-bg); background: var(--pp-bg); color: var(--rtw-acc3); cursor: pointer;
    font-family: var(--rtw-serif), 'Righteous', cursive; font-size: 17px; letter-spacing: .12em; text-transform: uppercase; padding: 0 18px;
    box-shadow: 4px 4px 0 var(--pp-acc); transition: background 200ms ease, color 200ms ease; }
  @media (hover: hover) { .rtw-btn-solido:hover { background: var(--pp-acc); color: var(--pp-bg); } }
  .rtw-btn-solido:disabled { opacity: .6; cursor: default; }
  .rtw-btn-fantasma { min-height: 48px; border: 2px solid var(--pp-bg); background: transparent; color: var(--pp-bg); cursor: pointer;
    font-family: var(--rtw-serif), 'Righteous', cursive; font-size: 15px; letter-spacing: .1em; text-transform: uppercase; padding: 0 18px; }
  .rtw-error { margin: 0; font-weight: 800; font-size: 12px; color: var(--pp-acc); }
  /* El sello GRABADO: un triángulo magenta con otro cian adentro. */
  .rtw-cupon .rtw-sello { position: absolute; right: 12px; bottom: 78px; width: 130px; aspect-ratio: 1; pointer-events: none;
    opacity: 0; transform: rotate(18deg) scale(1.9) translateY(-120px);
    background: var(--pp-acc); clip-path: polygon(50% 4%, 96% 90%, 4% 90%);
    display: flex; align-items: flex-end; justify-content: center; padding-bottom: 18px; box-sizing: border-box;
    font-family: var(--rtw-serif), 'Righteous', cursive; font-size: 12px; letter-spacing: .04em; color: var(--pp-ink); }
  .rtw-cupon .rtw-sello::before { content: ""; position: absolute; left: 18%; right: 18%; top: 24%; bottom: 16%; background: var(--rtw-acc3);
    clip-path: polygon(50% 0, 100% 100%, 0 100%); }
  .rtw-cupon .rtw-sello::after { content: ""; position: absolute; left: 22%; right: 22%; top: 31%; bottom: 20%; background: var(--pp-acc);
    clip-path: polygon(50% 0, 100% 100%, 0 100%); }
  .rtw-cupon .rtw-sello > * { position: relative; z-index: 1; }
  .rtw-petalos { display: none; }

  /* ── 06 Álbum: polaroids ───────────────────────────────────────────── */
  .rtw-panel--album { background: #F7F5F0; color: #1A0B2E; justify-content: flex-start; gap: 14px; }
  .rtw-panel--album-b { background: #EFEBE3; }
  .rtw-polaroids { flex: 1; min-height: 0; display: grid; grid-template-columns: repeat(6, 1fr); grid-template-rows: repeat(3, 1fr); gap: 10px; max-width: 900px; }
  .rtw-polaroid { position: relative; overflow: hidden; min-height: 0; cursor: pointer; border: 6px solid #FFFFFF; border-bottom-width: 22px;
    box-shadow: 4px 4px 0 #1A0B2E; background: repeating-linear-gradient(135deg, #D7D1C4 0 8px, #E6E1D6 8px 16px); }
  .rtw-polaroid:nth-child(1) { transform: rotate(-1.5deg); }
  .rtw-polaroid:nth-child(2) { transform: rotate(1.5deg); }
  .rtw-polaroid:nth-child(3) { transform: rotate(-1deg); }
  .rtw-polaroid:nth-child(4) { transform: rotate(2deg); }
  .rtw-polaroid:nth-child(5) { transform: rotate(.5deg); }
  .rtw-polaroid-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
  .rtw-bano { position: absolute; inset: 0; mix-blend-mode: multiply; opacity: 0; transition: opacity 200ms linear; }
  .rtw-bano--1 { background: color-mix(in srgb, var(--pp-acc) 50%, transparent); }
  .rtw-bano--2 { background: color-mix(in srgb, var(--rtw-acc3) 50%, transparent); }
  .rtw-bano--3 { background: color-mix(in srgb, var(--rtw-sun) 55%, transparent); }
  .rtw-bano--4 { background: color-mix(in srgb, var(--rtw-sky) 50%, transparent); }
  .rtw-bano--5 { background: color-mix(in srgb, var(--pp-acc) 40%, transparent); }
  .rtw-polaroid-n { position: absolute; left: 6px; bottom: -18px; font-weight: 800; font-size: 11px; letter-spacing: .14em; color: #1A0B2E; }
  .rtw-polaroids[data-cantidad="5"] .rtw-polaroid:nth-child(1) { grid-column: 1 / 4; grid-row: 1 / 3; }
  .rtw-polaroids[data-cantidad="5"] .rtw-polaroid:nth-child(2) { grid-column: 4 / 7; grid-row: 1 / 2; }
  .rtw-polaroids[data-cantidad="5"] .rtw-polaroid:nth-child(3) { grid-column: 4 / 6; grid-row: 2 / 3; }
  .rtw-polaroids[data-cantidad="5"] .rtw-polaroid:nth-child(4) { grid-column: 6 / 7; grid-row: 2 / 3; }
  .rtw-polaroids[data-cantidad="5"] .rtw-polaroid:nth-child(5) { grid-column: 1 / 7; grid-row: 3 / 4; }
  .rtw-polaroids[data-cantidad="4"] .rtw-polaroid:nth-child(1) { grid-column: 1 / 4; grid-row: 1 / 3; }
  .rtw-polaroids[data-cantidad="4"] .rtw-polaroid:nth-child(2) { grid-column: 4 / 7; grid-row: 1 / 2; }
  .rtw-polaroids[data-cantidad="4"] .rtw-polaroid:nth-child(3) { grid-column: 4 / 7; grid-row: 2 / 3; }
  .rtw-polaroids[data-cantidad="4"] .rtw-polaroid:nth-child(4) { grid-column: 1 / 7; grid-row: 3 / 4; }
  .rtw-polaroids[data-cantidad="3"] .rtw-polaroid:nth-child(1) { grid-column: 1 / 4; grid-row: 1 / 4; }
  .rtw-polaroids[data-cantidad="3"] .rtw-polaroid:nth-child(2) { grid-column: 4 / 7; grid-row: 1 / 3; }
  .rtw-polaroids[data-cantidad="3"] .rtw-polaroid:nth-child(3) { grid-column: 4 / 7; grid-row: 3 / 4; }
  .rtw-polaroids[data-cantidad="2"] .rtw-polaroid:nth-child(1) { grid-column: 1 / 4; grid-row: 1 / 4; }
  .rtw-polaroids[data-cantidad="2"] .rtw-polaroid:nth-child(2) { grid-column: 4 / 7; grid-row: 1 / 4; }
  .rtw-polaroids[data-cantidad="1"] .rtw-polaroid:nth-child(1) { grid-column: 1 / 7; grid-row: 1 / 4; }

  /* ── 07 Música: el walkman ─────────────────────────────────────────── */
  .rtw-walkman { display: flex; align-items: center; gap: 18px; }
  .rtw-carrete { width: 44px; height: 44px; border-radius: 50%; border: 6px solid var(--pp-acc); border-top-color: var(--pp-ink); box-sizing: border-box; animation: rtwGira 3s linear infinite; }
  .rtw-carrete--cian { border-color: var(--rtw-acc3); border-top-color: var(--pp-ink); }
  .rtw-cinta { flex: 1; height: 6px; background: var(--rtw-sky); border-top: 2px solid var(--rtw-acc3); border-bottom: 2px solid var(--rtw-acc3); }
  @keyframes rtwGira { to { transform: rotate(360deg); } }
  .rtw-musica form.rtw-tarjeta { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; transform: none !important; }
  .rtw-musica .rtw-etiqueta { display: none; }
  .rtw-musica .rtw-input { min-height: 48px; border: 2px solid var(--rtw-acc3); background: var(--rtw-sky); color: var(--pp-ink); font-weight: 700; padding: 0 14px; min-width: 0; }
  .rtw-musica .rtw-error { grid-column: 1 / -1; }
  .rtw-musica .rtw-btn-solido { grid-column: 1 / -1; min-height: 50px; border-color: var(--pp-acc); background: var(--pp-acc); color: var(--pp-bg); font-size: 16px; box-shadow: 4px 4px 0 var(--rtw-acc3); }
  @media (hover: hover) { .rtw-musica .rtw-btn-solido:hover { background: var(--rtw-acc3); border-color: var(--rtw-acc3); box-shadow: 4px 4px 0 var(--pp-acc); } }
  .rtw-lista { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; counter-reset: tema; }
  .rtw-lista-fila { --rtw-neon: var(--pp-acc); display: flex; align-items: center; gap: 12px; padding: 10px 14px; background: var(--rtw-sky); border-left: 4px solid var(--rtw-neon); counter-increment: tema; }
  .rtw-lista-fila:nth-child(3n+2) { --rtw-neon: var(--rtw-acc3); }
  .rtw-lista-fila:nth-child(3n+3) { --rtw-neon: var(--rtw-sun); }
  .rtw-lista-fila::before { content: "A" counter(tema); font-family: var(--rtw-serif), 'Righteous', cursive; font-size: 16px; color: var(--rtw-neon); width: 28px; flex: 0 0 auto; }
  .rtw-lista-texto { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .rtw-lista-tema { font-weight: 800; font-size: 17px; line-height: 1.1; }
  .rtw-lista-quien { font-weight: 700; font-size: 12px; letter-spacing: .1em; text-transform: uppercase; color: var(--rtw-neon); }

  /* ── 08 Regalos: el pliego del sol ─────────────────────────────────── */
  .rtw-regalos { background: var(--rtw-sun); color: var(--pp-bg); --rtw-vhs: color-mix(in srgb, var(--pp-bg) 10%, transparent); }
  .rtw-tarjeta--banco { --rtw-neon: var(--pp-acc); position: relative; z-index: 1; background: var(--pp-bg); color: var(--pp-ink); border: 2px solid var(--rtw-neon);
    box-shadow: 6px 6px 0 var(--rtw-neon); padding: 16px 18px; display: flex; flex-direction: column; gap: 10px; transform: none !important; }
  .rtw-tarjeta--der { --rtw-neon: var(--rtw-acc3); }
  .rtw-tarjeta--banco + .rtw-tarjeta--banco { margin-top: 14px; }
  .rtw-tarjeta-kicker { font-weight: 800; font-size: 11px; letter-spacing: .22em; text-transform: uppercase; color: var(--rtw-neon); }
  .rtw-tarjeta-mensaje { margin: 0; font-weight: 600; font-size: 14px; line-height: 1.5; opacity: .85; }
  .rtw-fila-texto { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .rtw-fila-etq { font-weight: 800; font-size: 10px; letter-spacing: .22em; text-transform: uppercase; opacity: .7; }
  .rtw-fila-dato { font-weight: 700; font-size: 14px; letter-spacing: .06em; overflow-wrap: anywhere; }
  .rtw-fila--copiable:first-child { border-bottom: 1px solid var(--rtw-linea); }
  .rtw-fila--copiable:first-child .rtw-fila-dato { font-family: var(--rtw-serif), 'Righteous', cursive; font-size: 20px; line-height: 1; letter-spacing: .04em; color: var(--rtw-neon); }
  .rtw-tarjeta--banco .rtw-fila--ultima { border-bottom: 0; font-weight: 700; font-size: 12px; letter-spacing: .12em; text-transform: uppercase; opacity: .7; }
  .rtw-btn-copiar { flex: 0 0 auto; min-height: 44px; padding: 0 14px; border: 2px solid var(--rtw-neon); background: transparent; color: var(--rtw-neon); cursor: pointer;
    font-weight: 800; font-size: 11px; letter-spacing: .18em; text-transform: uppercase; }
  .rtw-btn-copiar--hecho { background: var(--rtw-neon); color: var(--pp-bg); }

  /* ── 09 Trivia: el arcade ──────────────────────────────────────────── */
  .rtw-quiz { background: var(--rtw-sky); }
  .rtw-quiz .rtw-tarjeta { display: flex; flex-direction: column; gap: 12px; transform: none !important; }
  .rtw-quiz .rtw-tarjeta-kicker { align-self: flex-start; background: var(--pp-acc); color: var(--pp-bg); font-family: var(--rtw-serif), 'Righteous', cursive;
    font-size: 15px; letter-spacing: .1em; padding: 6px 14px 4px; text-transform: uppercase; }
  .rtw-quiz .rtw-tarjeta-pregunta, .rtw-quiz .rtw-tarjeta-titulo { font-family: var(--rtw-serif), 'Righteous', cursive; font-style: italic; font-size: clamp(38px, 10.5vw, 90px); line-height: .96; max-width: 14ch; text-shadow: 4px 4px 0 var(--pp-acc); }
  .rtw-quiz .rtw-tarjeta-mensaje { margin: 0; font-weight: 700; font-size: 15px; }
  .rtw-opciones { display: flex; flex-direction: column; gap: 10px; counter-reset: opcion; }
  .rtw-opcion { min-height: 54px; border: 2px solid color-mix(in srgb, var(--pp-ink) 35%, transparent); background: var(--pp-bg); color: var(--pp-ink); cursor: pointer; counter-increment: opcion;
    font-family: var(--rtw-sans), 'Manrope', sans-serif; font-weight: 800; font-size: 16px; text-align: left; padding: 0 18px;
    display: flex; justify-content: space-between; align-items: center; gap: 12px; transition: background 200ms ease, color 200ms ease, border-color 200ms ease; }
  .rtw-opcion::after { content: counter(opcion, upper-alpha); font-family: var(--rtw-serif), 'Righteous', cursive; font-size: 15px; letter-spacing: .08em; }
  .rtw-opcion--bien { background: var(--rtw-acc3); border-color: var(--rtw-acc3); color: var(--pp-bg); }
  .rtw-opcion--bien::after { content: "WIN"; }
  .rtw-opcion--mal { background: var(--pp-acc); border-color: var(--pp-acc); color: var(--pp-bg); }
  .rtw-opcion--mal::after { content: "MISS"; }
  @media (min-width: 1024px) {
    .rtw-quiz .rtw-spread > .rtw-tarjeta { grid-column: 1 / -1; max-width: none; justify-self: stretch; display: grid; grid-template-columns: 1fr 1fr; column-gap: 72px; align-items: center; }
    .rtw-quiz .rtw-tarjeta-kicker { grid-column: 1; justify-self: end; margin-right: auto; }
    .rtw-quiz .rtw-tarjeta-pregunta { grid-column: 1; max-width: 560px; justify-self: end; width: 100%; }
    .rtw-quiz .rtw-opciones { grid-column: 2; grid-row: 1 / span 2; max-width: 560px; width: 100%; }
  }

  /* ── 10 Tu pase: el ticket de entrada ──────────────────────────────── */
  .rtw-pase { justify-content: space-between; padding-bottom: calc(28px + env(safe-area-inset-bottom)); }
  .rtw-pagina--qr { align-items: flex-start; }
  .rtw-qr { position: relative; width: min(100%, 300px); aspect-ratio: 1; background: var(--pp-ink); padding: 16px; box-sizing: border-box;
    border: 3px solid var(--rtw-acc3); box-shadow: 8px 8px 0 var(--pp-acc); margin-bottom: 28px; }
  .rtw-qr .qr-ingreso, .rtw-qr section { background: transparent !important; border: none !important; padding: 0 !important; }
  .rtw-qr img, .rtw-qr svg, .rtw-qr canvas { width: 100% !important; height: auto !important; display: block; }
  .rtw-qr-etq { position: absolute; left: 0; right: 0; bottom: -24px; text-align: center; font-weight: 800; font-size: 11px; letter-spacing: .22em; text-transform: uppercase; color: var(--rtw-acc3); }
  .rtw-pase-cabeza { display: flex; align-items: flex-end; justify-content: space-between; gap: 14px; }
  .rtw-pase-numero, .rtw-pase-mesa { display: flex; flex-direction: column; }
  .rtw-pase-mesa { align-items: flex-end; text-align: right; }
  .rtw-pase-numero > span:last-child { font-family: var(--rtw-serif), 'Righteous', cursive; font-style: italic; font-size: clamp(72px, 22vw, 160px); line-height: .88; text-shadow: 5px 5px 0 var(--pp-acc); }
  .rtw-pase-mesa > span:last-child { font-family: var(--rtw-serif), 'Righteous', cursive; font-style: italic; font-size: clamp(44px, 13vw, 96px); line-height: .9; color: var(--rtw-acc3); }
  .rtw-caja { display: flex; flex-direction: column; background: var(--rtw-sky); border-left: 4px solid var(--pp-acc); padding: 6px 16px; }
  .rtw-caja .rtw-linea { font-size: 14px; padding: 10px 0; }
  .rtw-caja .rtw-linea:last-child { border-bottom: 0; }
  .rtw-caja .rtw-linea > span:first-child { color: var(--rtw-acc3); }
  .rtw-caja .rtw-linea > span:last-child { font-weight: 600; line-height: 1.35; }
  .rtw-info-extra { margin-top: 4px; }
  .rtw-info-extra #info-adicional { background: transparent !important; padding: 0 !important; }
  .rtw-info-extra #ia-trigger-btn { background: var(--rtw-sky) !important; color: var(--rtw-acc3) !important; border: 2px solid var(--rtw-acc3) !important;
    border-radius: 0 !important; font-weight: 800 !important; letter-spacing: .22em !important; text-transform: uppercase; }
  .rtw-raiz .ia-icon-box, .rtw-raiz svg.lucide { display: none !important; }
  .rtw-pase-pie { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 14px; }
  .rtw-despedida { font-family: var(--rtw-serif), 'Righteous', cursive; font-style: italic; font-size: clamp(26px, 7vw, 44px); line-height: 1; color: var(--pp-acc); text-shadow: 3px 3px 0 var(--rtw-acc3); }
  .rtw-replay { cursor: pointer; color: var(--pp-ink); }
  .rtw-credito { display: inline-flex; opacity: .8; }

  /* ── La tapa: el atardecer ─────────────────────────────────────────── */
  .rtw-portada { position: absolute; inset: 0; z-index: 5; overflow: hidden; background: var(--pp-bg); color: var(--pp-ink); }
  .rtw-portada-hoja { position: absolute; inset: 0; display: grid; grid-template-rows: auto minmax(0, 1fr) auto; box-sizing: border-box;
    padding: calc(16px + env(safe-area-inset-top)) max(18px, calc((100% - 1100px) / 2)) calc(16px + env(safe-area-inset-bottom)); }
  .rtw-escenario { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
  .rtw-cielo { position: absolute; left: 0; right: 0; top: 0; height: 52%; background: var(--rtw-sky); }
  .rtw-estrella { position: absolute; border-radius: 50%; background: #FFFFFF; animation: rtwTitila 2s ease-in-out infinite; }
  @keyframes rtwTitila { 0%, 100% { opacity: .2; transform: scale(.7); } 50% { opacity: 1; transform: scale(1); } }
  /* El escenario: sol al centro y palmeras en los bordes, apoyados en el
     horizonte. En el teléfono las palmeras salen del borde; en escritorio
     abrazan el sol. El motor las mueve con data-depth. */
  .rtw-horizonte-escena { position: absolute; left: 50%; bottom: 46%; width: min(100%, 1100px); height: 60%; transform: translateX(-50%); }
  .rtw-sol { position: absolute; left: 50%; bottom: 0; width: min(70vw, 460px); margin-left: calc(min(70vw, 460px) / -2); z-index: 1; }
  .rtw-palmera { position: absolute; bottom: 0; height: clamp(220px, 60vw, 480px); width: auto; z-index: 2; }
  .rtw-palmera--izq { left: max(-8%, calc(50% - 560px)); }
  .rtw-palmera--der { right: max(-8%, calc(50% - 560px)); }
  .rtw-suelo { position: absolute; left: -20%; right: -20%; top: 52%; height: 60%; perspective: 420px; perspective-origin: 50% 0; z-index: 1; }
  .rtw-suelo-plano { position: absolute; inset: 0; transform-origin: 50% 0; transform: rotateX(62deg); overflow: hidden; background: var(--rtw-ground); }
  .rtw-suelo-grilla { position: absolute; left: 0; right: 0; top: -64px; bottom: 0; opacity: .75; animation: rtwGrilla 1.6s linear infinite;
    background-image: linear-gradient(var(--rtw-acc3) 2px, transparent 2px), linear-gradient(90deg, var(--rtw-acc3) 2px, transparent 2px); background-size: 64px 64px; }
  @keyframes rtwGrilla { from { transform: translate3d(0, 0, 0); } to { transform: translate3d(0, 64px, 0); } }
  .rtw-horizonte { position: absolute; left: 0; right: 0; top: 52%; height: 3px; background: var(--rtw-acc3); z-index: 2; }
  .rtw-scan { position: absolute; left: 0; right: 0; top: 0; height: 24vh; opacity: .8; z-index: 3;
    background: linear-gradient(180deg, transparent, color-mix(in srgb, var(--rtw-acc3) 6%, transparent), transparent); animation: rtwScan 7s linear infinite; }
  @keyframes rtwScan { from { transform: translateY(-100%); } to { transform: translateY(100vh); } }
  .rtw-folio--tapa { z-index: 3; }
  .rtw-tapa-centro { position: relative; z-index: 3; align-self: center; display: flex; flex-direction: column; align-items: center; gap: 10px; min-height: 0; text-align: center; padding-top: 6vh; }
  .rtw-tapa-kicker { font-weight: 800; font-size: 12px; letter-spacing: .3em; text-transform: uppercase; background: var(--pp-bg); padding: 6px 12px; border: 1px solid var(--pp-acc); }
  /* El nombre: crema con contorno del fondo y doble sombra dura, magenta y
     cian (invertidas en el segundo renglón). El más largo manda el cuerpo. */
  .rtw-tapa-nombres { margin: 0; line-height: .92; letter-spacing: -.01em; display: flex; flex-direction: column; align-items: center;
    -webkit-text-stroke: 2px var(--pp-bg); paint-order: stroke fill;
    font-size: min(clamp(52px, 17vw, 160px), 16vh, calc((100vw - 60px) / (var(--largo, 9) * 0.6))); }
  @media (min-width: 1024px) { .rtw-tapa-nombres { font-size: min(12vw, 200px, 22vh, calc((min(100vw, 1100px) - 60px) / (var(--largo, 9) * 0.6))); } }
  .rtw-tapa-linea { overflow: hidden; display: block; white-space: nowrap; }
  .rtw-tapa-linea > span { display: block; }
  .rtw-tapa-logo { color: var(--pp-ink); text-shadow: 4px 4px 0 var(--pp-acc), 8px 8px 0 var(--rtw-acc3); padding: 0 .08em; }
  .rtw-tapa-logo--inv { text-shadow: 4px 4px 0 var(--rtw-acc3), 8px 8px 0 var(--pp-acc); }
  .rtw-tapa-linea--amp { font-size: .5em; line-height: 1.1; }
  .rtw-tapa-linea--amp > span { color: var(--pp-acc); font-family: var(--rtw-sans), 'Manrope', sans-serif; font-weight: 800; font-style: normal; letter-spacing: .3em; -webkit-text-stroke: 0; }
  .rtw-letra { display: inline-block; animation: rtwGlitch calc(var(--n, 12) * 3.4s) steps(1) infinite; animation-delay: calc(var(--i, 0) * -3.4s); }
  @keyframes rtwGlitch { 0%, 99.2% { transform: none; } 99.3% { transform: translateX(-6px) skewX(-12deg); } 99.5% { transform: translateX(6px) skewX(12deg); } 99.7% { transform: translateX(-3px) skewX(-6deg); } 99.9%, 100% { transform: none; } }
  .rtw-placa { background: color-mix(in srgb, var(--pp-bg) 85%, transparent); padding: 10px 14px; }
  .rtw-placa--datos { display: flex; justify-content: space-between; align-items: flex-end; gap: 14px; width: 100%; max-width: 520px; box-sizing: border-box;
    font-weight: 700; font-size: 13px; line-height: 1.35; text-align: left; border-left: 3px solid var(--pp-acc); }
  .rtw-placa-der { text-align: right; }
  .rtw-tapa-pie { position: relative; z-index: 3; display: flex; flex-direction: column; gap: 12px; align-items: center; text-align: center; }
  .rtw-tapa-mensaje { margin: 0; font-weight: 700; font-size: clamp(15px, 4.2vw, 19px); line-height: 1.35; max-width: 34ch; padding: 8px 14px; }
  .rtw-tapa-btn { min-height: 54px; width: 100%; max-width: 360px; border: 2px solid var(--pp-acc); background: var(--pp-acc); color: var(--pp-bg); cursor: pointer;
    font-family: var(--rtw-serif), 'Righteous', cursive; font-size: 18px; letter-spacing: .12em; text-transform: uppercase; padding: 2px 22px 0;
    display: flex; align-items: center; justify-content: center; gap: 12px; box-shadow: 4px 4px 0 var(--rtw-acc3);
    transition: background 200ms ease, border-color 200ms ease, box-shadow 200ms ease; }
  .rtw-tapa-btn-etq { font-family: var(--rtw-sans), 'Manrope', sans-serif; font-weight: 800; font-size: 11px; letter-spacing: .24em; }
  @media (hover: hover) { .rtw-tapa-btn:hover { background: var(--rtw-acc3); border-color: var(--rtw-acc3); box-shadow: 4px 4px 0 var(--pp-acc); } }

  /* ── Riel, pista y lupa ────────────────────────────────────────────── */
  .rtw-riel { position: absolute; right: 0; top: 0; bottom: 0; width: 40px; z-index: 4; display: flex; flex-direction: column;
    align-items: center; justify-content: space-between; padding: calc(16px + env(safe-area-inset-top)) 0 calc(16px + env(safe-area-inset-bottom));
    opacity: 0; transition: opacity 600ms ease; pointer-events: none; color: var(--rtw-acc3); border-left: 2px solid var(--rtw-acc3) !important; }
  .rtw-riel-top { writing-mode: vertical-rl; font-family: var(--rtw-serif), 'Righteous', cursive; font-size: 13px; letter-spacing: .2em; color: var(--rtw-acc3) !important; }
  .rtw-riel-etiqueta { writing-mode: vertical-rl; font-weight: 800; font-size: 10px; letter-spacing: .28em; text-transform: uppercase; color: var(--rtw-acc3); }
  .rtw-riel-linea { flex: 1; width: 1px; margin: 16px 0; background: transparent !important; position: relative; }
  .rtw-riel-barra { position: absolute; left: -2px; top: 0; width: 4px; height: 0%; background: var(--pp-acc); transition: height 200ms linear; display: block; }
  .rtw-pista { position: absolute; left: 0; right: 40px; bottom: calc(18px + env(safe-area-inset-bottom)); z-index: 6; text-align: center;
    font-weight: 800; font-size: 11px; letter-spacing: .28em; color: var(--rtw-acc3);
    opacity: 0; transition: opacity 600ms ease; pointer-events: none; animation: rtwPista 2.4s ease-in-out infinite; }
  @keyframes rtwPista { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(6px); } }

  .rtw-lupa { position: fixed; inset: 0; z-index: 200; background: color-mix(in srgb, var(--pp-bg) 94%, transparent);
    display: flex; align-items: center; justify-content: center; padding: 24px; cursor: zoom-out; }
  .rtw-lupa-cerrar { position: absolute; top: 20px; right: 20px; width: 40px; height: 40px; border: 2px solid var(--rtw-acc3);
    background: var(--pp-bg); color: var(--rtw-acc3); font-size: 18px; line-height: 1; cursor: pointer; box-shadow: 3px 3px 0 var(--pp-acc); }
  .rtw-lupa-img { max-width: 100%; max-height: 88vh; object-fit: contain; cursor: default; border: 6px solid #FFFFFF; box-shadow: 6px 6px 0 var(--pp-acc); }

  @media (prefers-reduced-motion: reduce) {
    .rtw-raiz * { animation: none !important; }
    .rtw-scroller [data-xin] { opacity: 1 !important; transform: none !important; }
    .rtw-foto { --rtw-punto: 0; }
  }
`;
