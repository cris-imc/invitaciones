"use client";

// GENERADO por scripts/gen-iconic-variants.js a partir de
// PopTemplate.tsx — no editar a mano: los cambios se pierden al regenerar.

/**
 * POP · Colección Iconic — sub-colección "Tipográfica Editorial"
 * Variante: Limón.
 *
 * GENERADO por scripts/derivar-tipografica.js a partir de
 * EditorialBlancNoirTemplate.tsx — no editar a mano: el motor se arregla en
 * Editorial Blanc & Noir; el render en scripts/jsx/tipografica/pop.jsx, los
 * estilos en scripts/css/tipografica/pop.css y las caras y la paleta en
 * scripts/familias/tipografica/pop.json.
 *
 * El cómic: Bangers en mayúsculas con sombra plana y trazo negro, Nunito
 * redonda para el texto. Tramas de puntos, globos con cola, stickers
 * torcidos, marquesinas inclinadas, la estrella de doce puntas girando y
 * el nombre que salta letra por letra.
 *
 * Sin imágenes propias: son fuentes y CSS.
 */

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Bangers, Nunito } from "next/font/google";
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

const popSerif = Bangers({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  variable: "--pop-serif",
});
const popSans = Nunito({
  subsets: ["latin"],
  weight: ["500", "700", "800"],
  display: "swap",
  variable: "--pop-sans",
});
// El mono es la ficha técnica de la revista: folios, kickers y datos.

// ─── Paleta ─────────────────────────────────────────────────────────────────
// Las cinco variantes de "Capas de papel" cambian SOLO estos once colores
// (el script de variantes reemplaza este bloque entero, ver
// scripts/gen-capas-de-papel-variants.js). El dibujo es el mismo: los SVG de
// las escenas leen var(--pp-…), así que un cambio acá repinta cerros, cielo,
// sol y figuras de una sola vez.
const PALETA = {
  bg: "#0E0E10",
  bg2: "#FFF7E6",
  ink: "#FFF7E6",
  ink2: "#B9B39F",
  acc: "#FFD84D",
  acc2: "#2EC4FF",
  sky1: "#0E0E10",
  sky2: "#FFF7E6",
  hill1: "#FFF7E6",
  hill2: "#B9B39F",
  hill3: "#FFF7E6",
  night: "#FFF7E6",
  nightInk: "#0E0E10",
  acc3: "#FF2E63",
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

interface PopTemplateProps {
  invitation: Record<string, unknown>;
  guest?: GuestRecord | null;
  isPersonalized?: boolean;
}

/** El número de pase, con tres cifras como en el mockup ("PASE Nº 042"). */
function numeroDePase(orderNumber: number | undefined): string {
  return String(orderNumber ?? 42).padStart(3, "0");
}

export function PopTemplateLimon({ invitation, guest, isPersonalized = false }: PopTemplateProps) {
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
      el.style.setProperty("--pop-y", `${dist}px`);
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
            el.style.setProperty("--pop-y", "0px");
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
            ven.style.setProperty("--pop-punto", (7.2 * (1 - t)).toFixed(2));
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
          clase: `${popSerif.variable} ${popSans.variable}`,
          fuente: "var(--pop-sans), 'Nunito', sans-serif",
        }}
      />
    );
  }


  // El total de pliegos, para los folios ("03 / 10"). Se cuenta lo que esta
  // invitación realmente tiene: si no hay trivia, no existe el pliego 09 y el
  // pase deja de ser 10 de 10.
  const totalPliegos = cuenta;
  const folio = (n: string) => `${n} / ${String(totalPliegos).padStart(2, "0")}`;

  // El nombre como título de cómic: dos renglones enormes, el segundo en el
  // amarillo y sangrado. Con una sola persona el nombre se parte en dos
  // (VALEN / TINA, como en el mockup); con dos, uno por renglón.
  const partirNombre = (n: string): [string, string] => {
    const limpio = n.trim();
    const partes = limpio.split(/\s+/);
    if (partes.length > 1) return [partes[0], partes.slice(1).join(" ")];
    const corte = Math.ceil(limpio.length / 2);
    return [limpio.slice(0, corte), limpio.slice(corte)];
  };
  const renglones: [string, string] = saludaAlInvitado ? partirNombre(nombreInvitado) : nombre2 ? [nombre1, nombre2] : partirNombre(nombre1);
  const renglonMasLargo = Math.max(4, ...renglones.map((n) => n.length));
  const totalLetras = Math.max(1, renglones.join("").replace(/\s/g, "").length);

  // La frase: el medio sobre un bloque amarillo y el cierre sobre el acento
  // con letras blancas.
  const tonoDePalabra = (i: number) => {
    const n = palabras.length;
    if (i >= Math.ceil(n * 0.75)) return "pop-bloque-acento";
    if (i >= Math.floor(n * 0.25) && i < desdeAcento) return "pop-bloque-amarillo";
    return undefined;
  };

  const kickerDelEvento = tx(invitation.tipo === "CASAMIENTO" ? "invitacion.evento.nosCasamos" : invitation.tipo === "QUINCE_ANOS" ? "invitacion.evento.misQuinceAnos" : "invitacion.evento.teInvitamos");
  const esXV = invitation.tipo === "QUINCE_ANOS";
  const centroDelSello = esXV ? "XV" : nombre2 ? "&" : (nombre1.trim()[0] || "").toUpperCase();
  const firma = esXV ? nombre1.trim().split(/\s+/)[0].toUpperCase() : iniciales(nombre1, nombre2);
  // Los doce íconos del ticker de la tapa (corona, estrella, corazón, rayo,
  // nota, globo, taco, cámara, disco, cinta, copa, XV).
  const ICONOS = [
    "M27 8 L32 22 L47 22 L35 31 L40 46 L27 37 L14 46 L19 31 L7 22 L22 22 Z",
    "M8 40 L12 16 L22 28 L27 10 L32 28 L42 16 L46 40 Z M8 40 L46 40",
    "M27 46 C10 34 6 24 12 16 C18 10 25 13 27 19 C29 13 36 10 42 16 C48 24 44 34 27 46 Z",
    "M31 6 L14 30 L26 30 L22 48 L40 22 L28 22 Z",
    "M20 42 a6 6 0 1 0 0.1 0 M20 42 L20 12 L40 8 L40 36 a6 6 0 1 0 0.1 0",
    "M27 8 a14 16 0 1 1 -0.1 0 M27 40 L24 50 M27 40 L30 50",
    "M6 38 Q27 8 48 38 Z M14 38 L40 38",
    "M8 18 L46 18 L46 44 L8 44 Z M20 18 L24 10 L30 10 L34 18 M27 31 a6 6 0 1 0 0.1 0",
    "M27 27 a19 19 0 1 0 0.1 0 M27 27 a5 5 0 1 0 0.1 0",
    "M6 22 L48 22 L48 34 L6 34 Z M6 22 L10 14 L44 14 L48 22 M14 22 L14 34 M40 22 L40 34",
    "M14 8 L40 8 L36 24 Q27 32 18 24 Z M27 30 L27 44 M18 46 L36 46",
    "M8 12 L20 42 L27 24 L34 42 L46 12 M10 42 L26 12 L38 42",
  ];

  return (
    <div
      ref={raizRef}
      className={`${popSerif.variable} ${popSans.variable} pop-raiz`}
      style={varsDePaleta}
    >
      <style>{CSS_POP}</style>
      <style>{COVER_RESPONSIVE_STYLE}</style>

      <div ref={scrollerRef} className="pop-scroller">
        {/* ── 01 Guardá la fecha ─────────────────────────────────────────
            Inversión: el acento entero con la trama negra arriba, la
            fecha en Bangers con sombras planas y la foto torcida con el
            sticker "¡Guardala!". */}
        <section data-tone="dark" data-screen-label={tx("invitacion.saveTheDate.guardaLaFecha")} className="pop-section pop-std">
          <span className="pop-trama pop-trama--std" aria-hidden="true" />
          <div className="pop-spread">
            <div className="pop-pagina">
              <div className="pop-folio pop-folio--tinta">
                <span data-xin="1" data-dist="-40">{nSaveTheDate} — {tx("invitacion.saveTheDate.guardaLaFecha").toUpperCase()}</span>
                <span data-xin="1" data-dist="40">{folio(nSaveTheDate)}</span>
              </div>
              <div className="pop-fecha">
                <span data-xin="1" data-dist="-160" className="pop-fecha-linea pop-fecha-linea--dia">{diaNum}</span>
                <span data-xin="1" data-dist="160" data-delay="120" className="pop-fecha-linea pop-fecha-linea--mes">{mesLargo}</span>
                <span data-xin="1" data-dist="-160" data-delay="240" className="pop-fecha-linea pop-fecha-linea--anio">{anio}</span>
              </div>
              <div data-xin="1" data-delay="360" className="pop-fecha-pie">
                <span>{diaSemana} · {hora} H</span>
                <AddToCalendarLink
                  eventName={titulo}
                  targetDate={fechaHora}
                  location={[lugarNombre, direccion].filter(Boolean).join(", ")}
                  className="pop-pildora pop-pildora--crema"
                  showIcon={false}
                >
                  {tx("invitacion.saveTheDate.agregarAlCalendario").toUpperCase()} ↗
                </AddToCalendarLink>
              </div>
            </div>

            {hayFoto && (
              <div ref={ventanaRef} data-xin="1" data-delay="200" data-dist="0" className="pop-foto">
                {fotoMobile && (
                  <div className="acp-mobile-only pop-foto-capa">
                    <AnimatedCoverPhoto photoSrc={fotoMobile} tint={false} effect="enfoque" scrimColorRgb="14,14,16" />
                  </div>
                )}
                {fotoDesktop && (
                  <div className="acp-desktop-only pop-foto-capa">
                    <AnimatedCoverPhoto photoSrc={fotoDesktop} tint={false} effect="enfoque" scrimColorRgb="14,14,16" />
                  </div>
                )}
                {/* La trama que tapa la foto y se disuelve al subir: el radio
                    del punto lo mueve el motor en --pop-punto. */}
                <span className="pop-foto-revelado" aria-hidden="true" />
                <span className="pop-foto-etq">{tx("invitacion.album.nuestraFoto").toUpperCase()}</span>
                <span className="pop-sticker pop-sticker--guardala">{tx("invitacion.saveTheDate.guardala")}</span>
              </div>
            )}
          </div>
        </section>

        {/* ── 02 Falta poco ──────────────────────────────────────────────
            Cuatro viñetas de color torcidas entre dos marquesinas
            inclinadas con borde negro. */}
        <section data-tone="dark" data-screen-label={tx("invitacion.cuentaRegresiva.kicker")} className="pop-section pop-countdown">
          <div className="pop-folio pop-folio--suave">
            <span data-xin="1" data-dist="-40">{nCountdown} — {tx("invitacion.cuentaRegresiva.faltan").toUpperCase()}</span>
            <span data-xin="1" data-dist="40">{folio(nCountdown)}</span>
          </div>
          <div className="pop-marquesina pop-marquesina--amarilla" aria-hidden="true">
            <div className="pop-marquesina-tira">
              {[0, 1].map((i) => (
                <span key={i}>
                  {tx("invitacion.cuentaRegresiva.dias").toUpperCase()} ★ {tx("invitacion.cuentaRegresiva.horas").toUpperCase()} ★ {tx("invitacion.cuentaRegresiva.minutos").toUpperCase()} ★ {tx("invitacion.cuentaRegresiva.segundos").toUpperCase()} ★ {diaNum} {tx("invitacion.evento.de").toUpperCase()} {mesLargo.toUpperCase()} ★&nbsp;
                </span>
              ))}
            </div>
          </div>
          <div className="pop-spread">
            <div className="pop-pagina pop-pagina--entera">
              <CuentaPop targetDate={fechaHora} />
            </div>
          </div>
          <div className="pop-marquesina pop-marquesina--acento pop-marquesina--contraria" aria-hidden="true">
            <div className="pop-marquesina-tira">
              {[0, 1].map((i) => (
                <span key={i}>
                  {[lugarNombre, ciudad, `${hora} h`, dressCode].filter(Boolean).join(" · ").toUpperCase()} ·&nbsp;
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── 03 Unas palabras ───────────────────────────────────────────
            Globo de historieta sobre crema: la frase en Bangers adentro
            del globo, y la onomatopeya que tiembla al costado. */}
        {hayFrase && (
          <section data-tone="light" data-screen-label={tx("invitacion.frase.etiqueta")} className="pop-section pop-frase-seccion">
            <span className="pop-trama pop-trama--celeste" aria-hidden="true" />
            <div className="pop-folio pop-folio--gris">
              <span data-xin="1" data-dist="-40">{nFrase} — {tx("invitacion.frase.unasPalabras").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nFrase)}</span>
            </div>
            <div className="pop-spread">
              <div className="pop-globo">
                <h2 ref={fraseRef} className="pop-frase">
                  {palabras.map((p, i) => (
                    // El espacio va fuera del span: el motor pone cada palabra
                    // en inline-block y un espacio adentro se colapsa a cero.
                    <span key={i}>
                      <span data-w="1" className={tonoDePalabra(i)}>{p}</span>{" "}
                    </span>
                  ))}
                </h2>
                <span className="pop-globo-cola" aria-hidden="true" /><span className="pop-globo-cola pop-globo-cola--blanca" aria-hidden="true" />
              </div>
              <div data-xin="1" data-delay="900" data-dist="60" className="pop-boom">
                <span className="pop-boom-titulo">{tx("invitacion.saveTheDate.boom")}</span>
                <span className="pop-boom-texto">{tx("invitacion.frase.conAmor")} · {titulo}</span>
              </div>
            </div>
            <div className="pop-folio pop-folio--gris pop-folio--pie">
              <span>{titulo.toUpperCase()}{esXV ? " · XV" : ""}</span>
              <span className="pop-barra" aria-hidden="true" />
            </div>
          </section>
        )}

        {/* ── 04 Cuándo y dónde ──────────────────────────────────────────
            Un panel por lugar: negro, acento y amarillo, con el título en
            Bangers a dos colores y la ficha blanca con borde negro. */}
        <div
          id="details"
          data-pan="1"
          data-scroll={scrollVertical || panelesLugar.length <= 1 ? "vertical" : "lateral"}
          data-screen-label={tx("invitacion.ubicacion.cuandoYDonde")}
          className="pop-pan"
          style={{ "--st-pasos": Math.max(0, panelesLugar.length - 1) } as React.CSSProperties}
        >
          <div className="pop-pan-fijo">
            <div data-strip="1" className="pop-tira">
              <div data-tone="dark" className="pop-panel pop-panel--negro">
                <div className="pop-folio">
                  <span>{nCuando} — {tx("invitacion.ubicacion.fiestaSalon").toUpperCase()}</span><span>{deLugar("recepcion")}</span>
                </div>
                <div className="pop-spread">
                  <h2 className="pop-panel-titulo">
                    {(lugarNombre || tx("invitacion.ubicacion.elLugar")).split(" ")[0]}<br /><span className="pop-panel-sub">{(lugarNombre || "").split(" ").slice(1).join(" ") || ciudad}</span>
                  </h2>
                  <div className="pop-ficha">
                    <div className="pop-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{hora} h</span></div>
                    {direccion && <div className="pop-linea"><span>{tx("invitacion.ubicacion.direccion")}</span><span>{direccion}</span></div>}
                    {dressCode && <div className="pop-linea"><span>{tx("invitacion.ubicacion.dressCode")}</span><span>{dressCode}</span></div>}
                    {mapUrl && (
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="pop-cta">
                        {tx("invitacion.ubicacion.comoLlegar").toUpperCase()}<span>→</span>
                      </a>
                    )}
                  </div>
                </div>
                <div className="pop-folio pop-folio--pie">
                  <span>{[direccion, ciudad].filter(Boolean).join(" · ").toUpperCase()}</span>
                  {!scrollVertical && panelesLugar.length > 1 && <span>{tx("invitacion.portada.desliza").toUpperCase()} →</span>}
                </div>
              </div>

              {ceremoniaHabilitada && (
                <div id="ceremonia" data-tone="dark" className="pop-panel pop-panel--acento">
                  <div className="pop-folio">
                    <span>{nCuando} — {ceremoniaTitulo.toUpperCase()}</span><span>{deLugar("ceremonia")}</span>
                  </div>
                  <div className="pop-spread">
                    <h2 className="pop-panel-titulo">
                      {(ceremoniaNombre || ceremoniaTitulo).split(" ")[0]}<br /><span className="pop-panel-sub">{(ceremoniaNombre || "").split(" ").slice(1).join(" ") || ceremoniaTitulo}</span>
                    </h2>
                    <div className="pop-ficha">
                      {ceremoniaHora && <div className="pop-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{ceremoniaHora} h</span></div>}
                      {ceremoniaDireccion && <div className="pop-linea"><span>{tx("invitacion.ubicacion.direccion")}</span><span>{ceremoniaDireccion}</span></div>}
                    </div>
                  </div>
                  <div className="pop-folio pop-folio--pie">
                    <span>{tx("invitacion.ubicacion.ceremoniaCivil").toUpperCase()}</span>
                    {!scrollVertical && <span>{tx("invitacion.portada.desliza").toUpperCase()} →</span>}
                  </div>
                </div>
              )}

              {hayComoLlegar && (
                <div id="location" data-tone="dark" className="pop-panel pop-panel--negro pop-panel--celeste-sub">
                  <div className="pop-folio">
                    <span>{nCuando} — {tx("invitacion.ubicacion.comoLlegar").toUpperCase()}</span><span>{deLugar("llegar")}</span>
                  </div>
                  <div className="pop-spread">
                    <h2 className="pop-panel-titulo">
                      {tx("invitacion.ubicacion.comoLlegar").split(" ")[0]}<br /><span className="pop-panel-sub">{tx("invitacion.ubicacion.comoLlegar").split(" ").slice(1).join(" ")}</span>
                    </h2>
                    <div className="pop-ficha">
                      {embedMapUrl && (
                        <div className="pop-mapa">
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
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="pop-cta">
                        {tx("invitacion.ubicacion.abrirEnMapas").toUpperCase()}<span>→</span>
                      </a>
                    </div>
                  </div>
                  <div className="pop-folio pop-folio--pie">
                    <span>{[direccion, ciudad].filter(Boolean).join(" · ").toUpperCase()}</span>
                    {!scrollVertical && <span>{tx("invitacion.portada.desliza").toUpperCase()} →</span>}
                  </div>
                </div>
              )}

              {cronograma.length > 0 && (
                <div id="schedule" data-tone="light" className="pop-panel pop-panel--amarillo">
                  <div className="pop-folio">
                    <span>{nCuando} — {tx("invitacion.ubicacion.cronograma").toUpperCase()}</span><span>{deLugar("cronograma")}</span>
                  </div>
                  <div className="pop-spread">
                    <h2 className="pop-panel-titulo">
                      {tx("invitacion.ubicacion.laNochePasoAPaso").split(",")[0].split(" ")[0]}<br /><span className="pop-panel-sub">{tx("invitacion.ubicacion.laNochePasoAPaso").split(",")[0].split(" ").slice(1).join(" ")}</span>
                    </h2>
                    <div className="pop-ficha">
                      {cronograma.map((item, i) => (
                        <div key={i} className="pop-linea"><span>{item.time || ""}</span><span>{item.title}</span></div>
                      ))}
                    </div>
                  </div>
                  <div className="pop-folio pop-folio--pie">
                    <span>{fechaPuntos}</span>
                  </div>
                </div>
              )}
            </div>
            {!scrollVertical && panelesLugar.length > 1 && <Puntos cantidad={panelesLugar.length} />}
          </div>
        </div>

        {/* ── 05 Check-in ────────────────────────────────────────────────
            El cupón: pliego amarillo, la tarjeta blanca con tijeras y
            línea de corte, botones píldora y la estrella "¡SÍ!". */}
        {rsvpHabilitado && (
          <section id="rsvp" data-tone="light" data-screen-label={tx("invitacion.rsvp.confirmar")} className="pop-section pop-checkin">
            <span className="pop-trama pop-trama--checkin" aria-hidden="true" />
            <div className="pop-folio pop-folio--tinta">
              <span data-xin="1" data-dist="-40">{nCheckin} — CHECK-IN</span>
              <span data-xin="1" data-dist="40">{folio(nCheckin)}</span>
            </div>
            <div className="pop-spread">
              <div className="pop-pagina">
                <h2 data-xin="1" data-dist="-80" className="pop-h2 pop-h2--sombra-blanca">
                  {tx("invitacion.rsvp.confirmaLinea1")}<br /><span className="pop-acento-trazo">{tx("invitacion.rsvp.confirmaLinea2")}</span>
                </h2>
              </div>
              <div data-xin="1" data-delay="160" data-dist="80" className="pop-cupon">
                <span className="pop-corte" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M8.5 7.5 L20 18 M8.5 16.5 L20 6" /></svg>
                  <span />
                </span>
                <CheckinPop
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
            Hoja de contactos con las fotos en marco negro, esquinas
            redondas, sombra plana y apenas torcidas. */}
        {todasLasFotos.length > 0 && (
          <div
            id="album"
            data-pan="1"
            data-scroll={scrollVertical || hojasDeFotos.length <= 1 ? "vertical" : "lateral"}
            data-screen-label={tx("invitacion.album.titulo")}
            className="pop-pan"
            style={{ "--st-pasos": Math.max(0, hojasDeFotos.length - 1) } as React.CSSProperties}
          >
            <div className="pop-pan-fijo pop-pan-fijo--album">
              <div data-strip="1" className="pop-tira">
                {hojasDeFotos.map((hoja, iHoja) => (
                  <div key={iHoja} data-tone="light" className={`pop-panel pop-panel--album${iHoja % 2 === 1 ? " pop-panel--album-b" : ""}`}>
                    <div className="pop-folio pop-folio--gris">
                      <span>{nAlbum} — {tx("invitacion.album.titulo").toUpperCase()}</span>
                      <span>{tx("invitacion.album.hojaDeTotal", { n: String(iHoja + 1).padStart(2, "0"), total: String(hojasDeFotos.length).padStart(2, "0") }).toUpperCase()} · {folio(nAlbum)}</span>
                    </div>
                    <h2 className="pop-h2 pop-h2--album">{tx("invitacion.album.titulo")} <span className="pop-acento-trazo">{tx("invitacion.album.deFotos")}</span></h2>
                    <div className="pop-hoja" data-cantidad={hoja.length}>
                      {hoja.map((url, i) => (
                        <div
                          key={i}
                          data-sheet="1"
                          className="pop-foto-hoja"
                          role="button"
                          tabIndex={0}
                          onClick={() => setFotoAmpliada(url)}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setFotoAmpliada(url); }}
                          aria-label={tx("invitacion.album.ampliarFoto", { n: i + 1 })}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="" loading="lazy" className="pop-foto-hoja-img" />
                          <span data-colorwash="1" className={`pop-bano pop-bano--${(i % 5) + 1}`} aria-hidden="true" />
                          <span className="pop-foto-hoja-n">FOTO {String(i + 1).padStart(2, "0")}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pop-folio pop-folio--gris pop-folio--pie">
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
            El jukebox: pliego celeste, ecualizador de barras gordas y la
            lista en fichas blancas con borde. */}
        {sugerenciaMusicaHabilitada && (
          <section id="songs" data-tone="dark" data-screen-label={tx("invitacion.musica.titulo")} className="pop-section pop-musica">
            <span className="pop-trama pop-trama--musica" aria-hidden="true" />
            <div className="pop-folio pop-folio--tinta">
              <span data-xin="1" data-dist="-40">{nMusica} — {tx("invitacion.musica.titulo").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nMusica)}</span>
            </div>
            <div className="pop-spread">
              <div className="pop-pagina">
                <h2 data-xin="1" data-dist="-80" className="pop-h2 pop-h2--sombra-blanca">
                  {tituloEnDosLineas(tx("invitacion.sabor.preguntaCancionFaltar"), "pop-acento-trazo")}
                </h2>
                <div data-xin="1" data-delay="120" className="pop-eq" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((i) => <span key={i} style={{ animationDelay: `${i * 0.18}s` }} />)}
                </div>
              </div>
              <div className="pop-pagina">
                <CancionesPop
                  invitationId={String(invitation.id ?? "")}
                  guestToken={guest?.uniqueToken}
                  guestName={nombreInvitado || tx("invitacion.evento.invitado")}
                />
              </div>
            </div>
          </section>
        )}

        {/* ── 08 Regalos ─────────────────────────────────────────────────
            Sobre negro, fichas blancas con sombra de color. */}
        {hayRegalos && (
          <section id="banco" data-tone="dark" data-screen-label={tx("invitacion.regalos.titulo")} className="pop-section pop-regalos">
            <div className="pop-folio pop-folio--suave">
              <span data-xin="1" data-dist="-40">{nRegalos} — {tx("invitacion.regalos.titulo").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nRegalos)}</span>
            </div>
            <div className="pop-spread">
              <div className="pop-pagina">
                <h2 data-xin="1" data-dist="-80" className="pop-h2 pop-h2--sombra-acento">
                  {tx("invitacion.regalos.siQueresLinea1")}<br /><span className="pop-amarillo">{tx("invitacion.regalos.siQueresLinea2")}</span>
                </h2>
                {Boolean(invitation.regaloMensaje) && (
                  <p data-xin="1" data-delay="120" className="pop-parrafo">{String(invitation.regaloMensaje)}</p>
                )}
              </div>
              <div className="pop-pagina">
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
            Sobre crema: la etiqueta torcida, la pregunta en Bangers con
            sombra amarilla y las opciones con borde y sombra. */}
        {quizHabilitado && (
          <section id="quiz" data-tone="light" data-screen-label="Quiz" className="pop-section pop-quiz">
            <div className="pop-folio pop-folio--gris">
              <span data-xin="1" data-dist="-40">{nQuiz} — {triviaTitulo.toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nQuiz)}</span>
            </div>
            <div className="pop-spread">
              <TriviaPop
                preguntas={triviaPreguntas}
                invitationId={String(invitation.id ?? "")}
                guestToken={guest?.uniqueToken}
                guestName={nombreInvitado || tx("invitacion.evento.invitado")}
              />
            </div>
          </section>
        )}

        {/* ── 10 Tu pase ─────────────────────────────────────────────────
            La contratapa: pliego del acento, el QR torcido con borde
            negro, el pase gigante y la estrella con la mesa. */}
        <section data-tone="dark" data-screen-label={tx("invitacion.pase.tuPase")} className="pop-section pop-pase">
          <span className="pop-trama pop-trama--pase" aria-hidden="true" />
          <div className="pop-folio pop-folio--tinta">
            <span data-xin="1" data-dist="-40">{nPase} — {tx("invitacion.pase.tuPase").toUpperCase()}</span>
            <span data-xin="1" data-dist="40">{folio(nPase)}</span>
          </div>
          <div className="pop-spread">
            <div data-xin="1" data-dist="-60" className="pop-pagina pop-pagina--qr">
              <div className="pop-qr">
                <QrDeIngreso guest={guest as never} />
                <span className="pop-qr-etq">{tx("invitacion.pase.tuPase").toUpperCase()}</span>
              </div>
            </div>
            <div className="pop-pagina">
              <div data-xin="1" data-delay="100" className="pop-pase-cabeza">
                <div className="pop-pase-numero">
                  <span className="pop-folio-etq">{tx("invitacion.pase.pase").toUpperCase()} Nº</span>
                  <span>{pase}</span>
                </div>
                <Estrella texto={`${(nombreInvitado || titulo).toUpperCase()} · ${lugaresDelPase} ${tx(lugaresDelPase === 1 ? "invitacion.bienvenida.persona" : "invitacion.bienvenida.personas").toUpperCase()}${guest?.mesas?.length ? ` · ${tx("invitacion.pase.tuMesa").toUpperCase()} ${guest.mesas[0]}` : ""} · `} centro={guest?.mesas?.[0] ?? pase.replace(/^0+/, "") ?? pase} amarilla />
              </div>
              <div data-xin="1" data-delay="160" className="pop-caja">
                <div className="pop-linea"><span>{saludaAlInvitado ? tx("invitacion.pase.reservadoPara") : tx("invitacion.evento.invitado")}</span><span>{nombreInvitado || titulo}</span></div>
                {lugaresDelPase > 0 && (
                  <div className="pop-linea"><span>{tx("invitacion.pase.lugares")}</span><span>{lugaresDelPase}</span></div>
                )}
                {guest?.mesas && guest.mesas.length > 0 && (
                  <div className="pop-linea"><span>Sector · {tx("invitacion.pase.tuMesa")}</span><span>{guest.mesas.join(" · ")}</span></div>
                )}
                <div className="pop-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{fechaPuntos} · {hora} H</span></div>
              </div>
              <div className="pop-info-extra">
                <InfoAdicionalSection invitation={invitation} />
              </div>
            </div>
          </div>
          <div data-xin="1" data-delay="220" className="pop-pase-pie">
            <span className="pop-despedida">{tx("invitacion.saveTheDate.nosVemosEnLaPista")} — {firma}</span>
            <div className="pop-folio pop-folio--tinta pop-folio--colofon">
              <span className="pop-credito"><LogoFooterCredit bgColor="transparent" textColor={PALETA.bg} /></span>
              <span className="pop-replay" role="button" tabIndex={0} onClick={volverAVerla} onKeyDown={(e) => { if (e.key === "Enter") volverAVerla(); }}>
                {tx("invitacion.portada.verAperturaOtraVez").toUpperCase()} ↺
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* ── Riel de progreso ───────────────────────────────────────────── */}
      <div ref={rielRef} className="pop-riel">
        <span ref={rielTopRef} className="pop-riel-top">{pase}</span>
        <div ref={rielLineaRef} className="pop-riel-linea">
          <span ref={rielBarraRef} className="pop-riel-barra" />
        </div>
        <span ref={rielEtiquetaRef} className="pop-riel-etiqueta">{tx("invitacion.saveTheDate.guardaLaFecha").toUpperCase()}</span>
      </div>

      {/* ── La tapa ─────────────────────────────────────────────────────
          Tapa de cómic: trama del acento arriba a la derecha, un ticker
          de íconos que pasa detrás del nombre, el nombre en Bangers con
          sombra plana y trazo, el globo con el mensaje y el botón
          píldora. Es la bienvenida: dice de quién es la fiesta, cuándo,
          dónde y para cuántos. */}
      <div ref={portadaRef} data-tone={TONO} className="pop-portada">
        <div ref={escenaPortadaRef} className="pop-portada-hoja">
          <span className="pop-trama pop-trama--tapa" aria-hidden="true" />
          <div className="pop-ticker" aria-hidden="true">
            <div className="pop-ticker-tira">
              {[...ICONOS, ...ICONOS].map((d, i) => (
                <svg key={i} width="54" height="54" viewBox="0 0 54 54" className={`pop-ticker-icono pop-ticker-icono--${i % 4}`}><path d={d} fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" /></svg>
              ))}
            </div>
          </div>

          <div data-cl="1" className="pop-tapa-cabecera">
            <span className="pop-sticker pop-sticker--evento">{kickerDelEvento.toUpperCase()}</span>
            <span className="pop-tapa-numero">Nº 00 / {String(totalPliegos).padStart(2, "0")}<br /><span className="pop-amarillo">{tx("invitacion.saveTheDate.edicionUnica")}</span></span>
          </div>

          <div data-cl="2" className="pop-tapa-centro">
            <div className="pop-tapa-fila">
              <span className="pop-tapa-kicker">{diaSemana} {diaNum} · {mesLargo} · {anio}</span>
              <Estrella texto={`${kickerDelEvento.toUpperCase()} · ${String(fechaEvento.getDate()).padStart(2, "0")} · ${String(fechaEvento.getMonth() + 1).padStart(2, "0")} · ${anio} · `} centro={centroDelSello} />
            </div>
            <h1 ref={cartelRef} className="pop-tapa-nombres" style={{ "--largo": renglonMasLargo, "--n": totalLetras } as React.CSSProperties}>
              <span className="pop-tapa-linea"><span data-pieza="1"><Letras texto={renglones[0].toUpperCase()} desde={0} /></span></span>
              {renglones[1] && (
                <span className="pop-tapa-linea pop-tapa-linea--sangra"><span data-pieza="1" className="pop-amarillo"><Letras texto={renglones[1].toUpperCase()} desde={renglones[0].replace(/\s/g, "").length} /></span></span>
              )}
            </h1>
            <div className="pop-tapa-datos">
              <span>{lugarNombre || "—"}<br /><span className="pop-suave">{[direccion, ciudad].filter(Boolean).join(" · ")}</span></span>
              <span className="pop-tapa-datos-der">
                {isPersonalized && guest
                  ? <>{tx("invitacion.pase.pase")} Nº {pase}<br /><span className="pop-suave">{lugaresDelPase} {tx(lugaresDelPase === 1 ? "invitacion.bienvenida.persona" : "invitacion.bienvenida.personas")}</span></>
                  : <>{hora} h<br /><span className="pop-suave">{fechaPuntos}</span></>}
              </span>
            </div>
          </div>

          <div data-cl="3" className="pop-tapa-pie">
            <div className="pop-globo pop-globo--tapa">
              <p className="pop-tapa-mensaje">
                {saludaAlInvitado
                  ? `${tx("invitacion.bienvenida.hola", { nombre: nombreInvitado })}, ${String(invitation.portadaMensaje || tx("invitacion.sabor.mensajeLoContamosNosotros"))}`
                  : String(invitation.portadaMensaje || tx("invitacion.sabor.mensajeLoContamosNosotros"))}
              </p>
              <span className="pop-globo-cola" aria-hidden="true" /><span className="pop-globo-cola pop-globo-cola--crema" aria-hidden="true" />
            </div>
            <button type="button" onClick={abrir} className="pop-tapa-btn">
              <span>{tx("invitacion.portada.abrirInvitacion").toUpperCase()}</span><span>→</span>
            </button>
          </div>
        </div>
      </div>

      <div ref={pistaRef} className="pop-pista">{tx("invitacion.portada.desliza").toUpperCase()} ↓</div>

      {fotoAmpliada && (
        <div className="pop-lupa" onClick={() => setFotoAmpliada(null)} onContextMenu={(e) => e.preventDefault()}>
          <button
            type="button"
            className="pop-lupa-cerrar"
            onClick={(e) => { e.stopPropagation(); setFotoAmpliada(null); }}
            aria-label={tx("invitacion.cerrar")}
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fotoAmpliada} alt={tx("invitacion.album.fotoAmpliada")} className="pop-lupa-img" draggable={false} onClick={(e) => e.stopPropagation()} />
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
 * El nombre letra por letra: cada tanto una salta 18 px con un giro y
 * vuelve rebotando. El CSS escalona el turno de cada letra.
 */
function Letras({ texto, desde }: { texto: string; desde: number }) {
  let k = desde;
  return (
    <>
      {Array.from(texto).map((ch, i) =>
        ch === " " ? " " : <span key={i} className="pop-letra" style={{ "--i": k++ } as React.CSSProperties}>{ch}</span>
      )}
    </>
  );
}

/**
 * El sello estrella de doce puntas con el texto en arco, girando, y algo
 * en el centro (XV, el & o la mesa). En la tapa va en el acento; en el
 * pase, en amarillo.
 */
function Estrella({ texto, centro, amarilla = false }: { texto: string; centro: string; amarilla?: boolean }) {
  const id = useId().replace(/:/g, "");
  return (
    <div className={`pop-estrella${amarilla ? " pop-estrella--amarilla" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 100 100">
        <defs><path id={`arc-${id}`} d="M50 50 m -35 0 a 35 35 0 1 1 70 0 a 35 35 0 1 1 -70 0" fill="none" /></defs>
        <path d="M50 3 L58 14 L71 8 L73 22 L87 24 L82 37 L94 45 L84 55 L91 68 L77 71 L76 85 L63 80 L55 92 L46 81 L33 87 L31 73 L17 71 L22 58 L10 50 L20 40 L13 27 L27 24 L28 10 L41 15 Z" className="pop-estrella-forma" strokeWidth="3" strokeLinejoin="round" />
        <text><textPath href={`#arc-${id}`}>{texto.repeat(3).slice(0, 46)}</textPath></text>
      </svg>
      <span className="pop-estrella-centro">{centro}</span>
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
    <div className="pop-puntos" aria-hidden="true">
      {Array.from({ length: cantidad }).map((_, i) => (
        <span key={i} data-dot={i} className="pop-punto" style={{ background: i === 0 ? PALETA.acc : "rgba(43,42,51,.18)" }} />
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
function CuentaPop({ targetDate }: { targetDate: Date }) {
  const tx = useTextos();
  const { time, isEventDay, isPast, hasEnded } = useCountdown(targetDate);

  if (isEventDay || hasEnded || isPast) {
    return (
      <div className="pop-tarjeta pop-tarjeta--hoy" data-xin="1" data-delay="80" data-dist="30">
        <span className="pop-tarjeta-kicker">{tx("invitacion.cuentaRegresiva.kicker").toUpperCase()}</span>
        <span className="pop-tarjeta-titulo">
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
    <div className="pop-cuenta">
      {celdas.map((c, i) => (
        <div key={c.l} data-xin="1" data-delay={i * 100} data-dist={i % 2 === 0 ? -80 : 80} className={`pop-cuenta-caja pop-cuenta-caja--${i + 1}`}>
          <span className="pop-cuenta-num"><span key={c.v}>{c.v}</span></span>
          <span className="pop-cuenta-etq">{c.l.toUpperCase()}</span>
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
    <div className="pop-fila pop-fila--copiable">
      <div className="pop-fila-texto">
        <span className="pop-fila-etq">{etiqueta.toUpperCase()}</span>
        <span className="pop-fila-dato">{valor}</span>
      </div>
      <button type="button" onClick={copiar} className={`pop-btn-copiar${copiado ? " pop-btn-copiar--hecho" : ""}`}>
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
      className={`pop-tarjeta pop-tarjeta--banco${dobleZ ? " pop-doblez" : ""}${inclinada ? " pop-tarjeta--der" : " pop-tarjeta--izq"}`}
    >
      <span className="pop-tarjeta-kicker">{titulo.toUpperCase()}</span>
      {mensaje && <p className="pop-tarjeta-mensaje">{mensaje}</p>}
      <div className="pop-filas">
        <FilaCopiable etiqueta="Alias" valor={alias} />
        <FilaCopiable etiqueta="CBU" valor={cbu} />
        {(banco || titular) && (
          <div className="pop-fila pop-fila--ultima">
            <span>{banco || tx("invitacion.regalos.banco")}</span>
            <span className="pop-fila-valor">{titular}</span>
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
function CheckinPop({
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
      <div data-xin="1" data-delay="140" data-dist="30" className="pop-tarjeta pop-tarjeta--izq">
        <p className="pop-tarjeta-mensaje">{tx("invitacion.rsvp.graciasPorAvisarAcceso")}</p>
        <button type="button" className="pop-btn-fantasma" onClick={() => setEstado("PENDING")}>
          {tx("invitacion.rsvp.cambieDeIdea").toUpperCase()}
        </button>
      </div>
    );
  }

  const confirmadoYa = estado === "CONFIRMED";

  return (
    <>
      <div ref={tarjetaRef} data-xin="1" data-delay="140" data-dist="30" className="pop-tarjeta pop-tarjeta--talon">
        <div className="pop-talon-top">
          <span>{tx("invitacion.pase.numeroPase", { n: pase }).toUpperCase()}{guestName ? ` · ${guestName.toUpperCase()}` : ""}</span>
          <span ref={estadoRef} className="pop-talon-estado">
            {confirmado || confirmadoYa ? tx("invitacion.pase.accesoConfirmado").toUpperCase() : tx("invitacion.pase.pendiente").toUpperCase()}
          </span>
        </div>

        {!confirmadoYa ? (
          <>
            {lugares > 1 && (
              <div className="pop-campo">
                <label className="pop-etiqueta">{tx("invitacion.rsvp.adultos").toUpperCase()}</label>
                <div className="pop-contador">
                  <button type="button" onClick={() => setAdultos((v) => Math.max(1, v - 1))} disabled={adultos <= 1} aria-label="−">−</button>
                  <span>{adultos}</span>
                  <button type="button" onClick={() => setAdultos((v) => Math.min(maxAdultos, v + 1))} disabled={adultos >= maxAdultos} aria-label="+">+</button>
                </div>
              </div>
            )}
            {maxAdolescentes > 0 && (
              <div className="pop-campo">
                <label className="pop-etiqueta">{tx("invitacion.rsvp.adolescentes").toUpperCase()}</label>
                <div className="pop-contador">
                  <button type="button" onClick={() => setAdolescentes((v) => Math.max(0, v - 1))} disabled={adolescentes <= 0} aria-label="−">−</button>
                  <span>{adolescentes}</span>
                  <button type="button" onClick={() => setAdolescentes((v) => Math.min(maxAdolescentes, v + 1))} disabled={adolescentes >= maxAdolescentes} aria-label="+">+</button>
                </div>
              </div>
            )}
            {maxNinos > 0 && (
              <div className="pop-campo">
                <label className="pop-etiqueta">{tx("invitacion.rsvp.ninos").toUpperCase()}</label>
                <div className="pop-contador">
                  <button type="button" onClick={() => setNinos((v) => Math.max(0, v - 1))} disabled={ninos <= 0} aria-label="−">−</button>
                  <span>{ninos}</span>
                  <button type="button" onClick={() => setNinos((v) => Math.min(maxNinos, v + 1))} disabled={ninos >= maxNinos} aria-label="+">+</button>
                </div>
              </div>
            )}
            <div className="pop-campo">
              <label className="pop-etiqueta">{tx("invitacion.rsvp.restriccionAlimentaria").toUpperCase()}</label>
              <input
                value={dieta}
                onChange={(e) => setDieta(e.target.value)}
                placeholder="—"
                maxLength={120}
                className="pop-input"
              />
            </div>
          </>
        ) : (
          <div className="pop-filas">
            {lugares > 1 && adultos > 0 && <div className="pop-fila"><span>{tx("invitacion.rsvp.adultos")}</span><span>{adultos}</span></div>}
            {adolescentes > 0 && <div className="pop-fila"><span>{tx("invitacion.rsvp.adolescentes")}</span><span>{adolescentes}</span></div>}
            {ninos > 0 && <div className="pop-fila"><span>{tx("invitacion.rsvp.ninos")}</span><span>{ninos}</span></div>}
            <div className="pop-fila pop-fila--ultima">
              <span>{tx("invitacion.rsvp.restriccionAlimentaria")}</span>
              <span className="pop-fila-valor">{restricciones || dieta || "—"}</span>
            </div>
          </div>
        )}

        {hayPago && monto != null && !exento && (
          <div className="pop-precio">
            <span>{estadoDePago === "PAID" ? tx("invitacion.pago.abonado") : tx("invitacion.pago.valor")}</span>
            <div className="pop-precio-valor">
              <span className="pop-precio-total">{formatearMoneda(totalAPagar)}</span>
              {usarTotalDelServidor && vistaDePago
                ? vistaDePago.lines.map((l, i) => <span key={i} className="pop-precio-detalle">{l}</span>)
                : (
                  <>
                    {adultos > 0 && <span className="pop-precio-detalle">{adultos} × {formatearMoneda(precioAdulto)}</span>}
                    {adolescentes > 0 && <span className="pop-precio-detalle">{adolescentes} × {formatearMoneda(precioAdo)}</span>}
                    {ninos > 0 && <span className="pop-precio-detalle">{ninos} × {formatearMoneda(precioNin)}</span>}
                  </>
                )}
            </div>
          </div>
        )}

        <div ref={selloRef} className="pop-sello" aria-hidden="true">{tx("invitacion.pase.confirmado").toUpperCase()}</div>
        <div ref={petalosRef} className="pop-petalos" aria-hidden="true" />
      </div>

      {error && <p className="pop-error">{error}</p>}

      {!confirmadoYa ? (
        <>
          <button type="button" data-xin="1" data-delay="220" className="pop-btn-solido" disabled={enviando} onClick={() => enviar("CONFIRMA")}>
            {enviando ? tx("invitacion.rsvp.guardando").toUpperCase() : tx("invitacion.rsvp.confirmarAsistencia").toUpperCase()}
          </button>
          <button type="button" data-xin="1" data-delay="280" className="pop-btn-fantasma" disabled={enviando} onClick={() => enviar("NO_ASISTE")}>
            {tx("invitacion.rsvp.noVoyAPoderAsistir").toUpperCase()}
          </button>
        </>
      ) : (
        <button type="button" className="pop-btn-fantasma" onClick={() => setEstado("PENDING")}>
          {tx("invitacion.rsvp.modificarAsistencia").toUpperCase()}
        </button>
      )}
    </>
  );
}

interface CancionItem { id: string; title: string; artist: string; guestName: string }

/** Sugerir una canción, en una tarjeta de papel con la lista debajo. */
function CancionesPop({ invitationId, guestToken, guestName }: { invitationId: string; guestToken?: string; guestName: string }) {
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
      <form onSubmit={enviar} data-xin="1" data-delay="140" data-dist="30" className="pop-tarjeta pop-tarjeta--der">
        <div className="pop-campo">
          <label className="pop-etiqueta">{tx("invitacion.musica.tema").toUpperCase()}</label>
          <input value={tema} onChange={(e) => setTema(e.target.value)} placeholder={tx("invitacion.musica.nombreDeLaCancion")} maxLength={100} className="pop-input pop-input--serif" />
        </div>
        <div className="pop-campo">
          <label className="pop-etiqueta">{tx("invitacion.musica.artista").toUpperCase()}</label>
          <input value={artista} onChange={(e) => setArtista(e.target.value)} placeholder={tx("invitacion.musica.artista")} maxLength={80} className="pop-input pop-input--serif" />
        </div>
        {error && <p className="pop-error">{error}</p>}
        <button type="submit" disabled={enviando} className="pop-btn-solido pop-btn-solido--tinta">
          {enviando ? tx("invitacion.musica.enviando").toUpperCase() : tx("invitacion.musica.sugeriUnaCancion").toUpperCase()}
        </button>
      </form>

      {canciones.length > 0 && (
        <div data-xin="1" data-delay="220" className="pop-lista">
          {canciones.slice(0, 8).map((c) => (
            <div key={c.id} className="pop-lista-fila">
              <div className="pop-lista-texto">
                <span className="pop-lista-tema">{c.title}</span>
                <span className="pop-lista-quien">{c.artist} · {tx("invitacion.musica.sumadoPor")} {c.guestName || tx("invitacion.evento.invitado")}</span>
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
function TriviaPop({ preguntas, invitationId, guestToken, guestName }: { preguntas: QuizPregunta[]; invitationId: string; guestToken?: string; guestName: string }) {
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
      <div data-xin="1" data-delay="140" data-dist="30" className="pop-tarjeta pop-tarjeta--izq">
        <span className="pop-tarjeta-kicker">{tx("invitacion.quiz.kicker").toUpperCase()}</span>
        <span className="pop-tarjeta-titulo">
          {guardando ? tx("invitacion.rsvp.guardando") : tx("invitacion.quiz.respondisteCorrectamente", { aciertos: puntaje, total: preguntas.length })}
        </span>
        {!guardando && stats && stats.count > 0 && (
          <p className="pop-tarjeta-mensaje">{tx("invitacion.quiz.promedio", { n: stats.count, avg: stats.avg })}</p>
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
    <div data-xin="1" data-delay="140" data-dist="30" className="pop-tarjeta pop-tarjeta--izq">
      <span className="pop-tarjeta-kicker">{tx("invitacion.quiz.preguntaDeTotal", { n: indice + 1, total: preguntas.length }).toUpperCase()}</span>
      <span className="pop-tarjeta-pregunta">{q.pregunta}</span>
      <div className="pop-opciones">
        {q.opciones.map((op, oi) => {
          let clase = "";
          if (yaEligio && correcta !== undefined) {
            if (oi === correcta) clase = " pop-opcion--bien";
            else if (elegidas[indice] === oi) clase = " pop-opcion--mal";
          }
          return (
            <button key={oi} type="button" disabled={yaEligio} onClick={() => elegir(oi)} className={`pop-opcion${clase}`}>
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
// leen la Bienvenida y el Post-evento compartidos (esperan `pop-section` y
// `pop-kicker`).
const CSS_POP = `
  /* ── Pop ──────────────────────────────────────────────────────────────
     Tapa de cómic: Bangers en mayúsculas con sombra plana y trazo negro,
     Nunito redonda para el texto. Tramas de puntos, globos con cola,
     stickers torcidos, bordes negros de 3 px con sombra sin blur y
     píldoras. Todo CSS. */
  .pop-raiz { position: fixed; inset: 0; width: 100%; height: calc(var(--vh, 1vh) * 100); overflow: hidden;
    background: var(--pp-bg); color: var(--pp-ink); font-family: var(--pop-sans), 'Nunito', sans-serif;
    --pop-acc3: ${PALETA.acc3}; --pop-negro: #0E0E10; --pop-gris: #5C554A; }
  .pop-raiz a { color: inherit; text-decoration: none; }
  .pop-raiz button { font: inherit; }

  .pop-scroller { position: absolute; inset: 0; overflow-y: auto; overflow-x: hidden; opacity: 0;
    transition: opacity 900ms ease 260ms; scrollbar-width: none; }
  .pop-scroller::-webkit-scrollbar { width: 0; height: 0; }

  /* Las tramas de puntos: cada pliego tiene la suya, con su máscara. */
  .pop-trama { position: absolute; inset: 0; pointer-events: none; z-index: 0; background-image: radial-gradient(var(--pop-negro) 2.4px, transparent 2.6px); background-size: 12px 12px; }
  .pop-trama--tapa { opacity: .55; background-image: radial-gradient(var(--pp-acc) 3.2px, transparent 3.4px); background-size: 14px 14px;
    -webkit-mask-image: radial-gradient(70% 70% at 70% 30%, #000, transparent); mask-image: radial-gradient(70% 70% at 70% 30%, #000, transparent); }
  .pop-trama--std { opacity: .35; bottom: 55%; }
  .pop-trama--celeste { opacity: .5; background-image: radial-gradient(var(--pop-acc3) 2px, transparent 2.2px); background-size: 16px 16px; }
  .pop-trama--checkin { opacity: .25; background-image: radial-gradient(var(--pop-negro) 2.6px, transparent 2.8px); background-size: 14px 14px;
    -webkit-mask-image: linear-gradient(90deg, #000, transparent 60%); mask-image: linear-gradient(90deg, #000, transparent 60%); }
  .pop-trama--musica { opacity: .3; -webkit-mask-image: linear-gradient(0deg, #000, transparent 50%); mask-image: linear-gradient(0deg, #000, transparent 50%); }
  .pop-trama--pase { opacity: .3; -webkit-mask-image: linear-gradient(180deg, #000, transparent 45%); mask-image: linear-gradient(180deg, #000, transparent 45%); }

  /* ── El pliego ─────────────────────────────────────────────────────── */
  .pop-section { position: relative; z-index: 1; min-height: calc(var(--vh, 1vh) * 100); box-sizing: border-box; overflow: hidden;
    display: flex; flex-direction: column; gap: 22px;
    padding: 60px max(20px, calc((100% - 1100px) / 2)) 80px; background: var(--pp-bg); color: var(--pp-ink); }

  /* El folio: Nunito 800 con tracking. */
  .pop-folio { position: relative; z-index: 1; display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;
    font-weight: 800; font-size: 12px; letter-spacing: .2em; text-transform: uppercase; }
  .pop-folio--suave { color: var(--pp-ink2); }
  .pop-folio--gris { color: var(--pop-gris); }
  .pop-folio--tinta { color: var(--pop-negro); }
  .pop-folio--pie { align-items: center; margin-top: auto; letter-spacing: .18em; }
  .pop-panel > .pop-folio { color: inherit; opacity: .8; }
  .pop-folio--colofon { align-items: center; border-top: 3px solid var(--pop-negro); padding-top: 12px; }
  .pop-folio-etq { font-weight: 800; font-size: 12px; letter-spacing: .2em; text-transform: uppercase; display: block; }
  .pop-barra { width: 40%; height: 4px; background: var(--pop-negro); border-radius: 2px; }
  .pop-amarillo { color: var(--pp-acc2); }
  .pop-suave { color: var(--pp-ink2); }
  .pop-acento-trazo { color: var(--pp-acc); -webkit-text-stroke: 2px var(--pop-negro); paint-order: stroke fill; }

  /* El spread: dos páginas; desde 1024 px se abren de verdad. */
  .pop-spread { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 22px; }
  .pop-pagina { display: flex; flex-direction: column; gap: 14px; min-width: 0; }
  @media (min-width: 1024px) {
    .pop-spread { display: grid; grid-template-columns: 1fr 1fr; align-items: center; column-gap: 72px; }
    .pop-spread > * { max-width: 560px; width: 100%; min-width: 0; }
    .pop-spread > *:first-child { justify-self: end; }
    .pop-spread > *:last-child { justify-self: start; }
    .pop-pagina--entera { grid-column: 1 / -1; max-width: none; justify-self: stretch; }
  }

  /* ── Tipos ─────────────────────────────────────────────────────────── */
  .pop-h2, .pop-panel-titulo, .pop-frase, .pop-fecha-linea, .pop-tapa-nombres { font-family: var(--pop-serif), 'Bangers', cursive; font-weight: 400; text-transform: uppercase; }
  .pop-h2, .pop-panel-titulo { position: relative; z-index: 1; margin: 0; line-height: .86; letter-spacing: .01em; font-size: clamp(56px, 16vw, 140px); }
  .pop-h2--album { font-size: clamp(48px, 13vw, 110px); line-height: .88; text-shadow: 4px 4px 0 var(--pp-acc2); }
  .pop-h2--sombra-blanca { text-shadow: 5px 5px 0 #FFFFFF; }
  .pop-h2--sombra-acento { text-shadow: 5px 5px 0 var(--pp-acc); }
  .pop-panel-titulo { font-size: clamp(56px, 17vw, 150px); text-shadow: 5px 5px 0 var(--pop-sombra, var(--pp-acc)); }
  .pop-panel-sub { color: var(--pop-sub, var(--pp-acc2)); }
  .pop-parrafo { margin: 0; font-weight: 600; font-size: 15px; line-height: 1.5; color: var(--pp-ink2); max-width: 40ch; }
  /* La píldora y el sticker: borde negro de 3 px y sombra plana. */
  .pop-pildora { display: inline-flex; align-items: center; gap: 8px; border: 3px solid var(--pop-negro); border-radius: 999px; padding: 8px 14px;
    font-weight: 800; font-size: 14px; letter-spacing: .1em; text-transform: uppercase; box-shadow: 3px 3px 0 var(--pop-negro); }
  .pop-pildora--crema { background: var(--pp-ink); color: var(--pop-negro); }
  .pop-sticker { display: inline-block; background: var(--pp-acc2); color: var(--pop-negro); border: 3px solid var(--pop-negro); padding: 4px 14px 2px;
    font-family: var(--pop-serif), 'Bangers', cursive; font-size: 26px; letter-spacing: .06em; box-shadow: 3px 3px 0 var(--pop-negro); white-space: nowrap; }
  .pop-cta { margin-top: 4px; min-height: 48px; display: flex; align-items: center; justify-content: space-between; border: 3px solid var(--pop-negro); border-radius: 999px; padding: 0 18px;
    color: var(--pop-negro); background: var(--pop-sub, var(--pp-acc2)); font-family: var(--pop-serif), 'Bangers', cursive; font-size: 20px; letter-spacing: .05em; box-shadow: 3px 3px 0 var(--pop-negro); }

  /* ── 01 Guardá la fecha: inversión ─────────────────────────────────── */
  .pop-std { background: var(--pp-acc); color: var(--pop-negro); }
  .pop-fecha { display: flex; flex-direction: column; line-height: .84; }
  .pop-fecha-linea { font-size: clamp(72px, 22vw, 180px); -webkit-text-stroke: 2px var(--pop-negro); paint-order: stroke fill; }
  .pop-fecha-linea--dia { font-size: clamp(88px, 30vw, 220px); text-shadow: 6px 6px 0 var(--pp-ink); }
  .pop-fecha-linea--mes { text-align: right; color: var(--pp-ink); }
  .pop-fecha-linea--anio { color: var(--pp-acc2); text-shadow: 6px 6px 0 var(--pop-negro); }
  .pop-fecha-pie { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 10px; font-weight: 800; font-size: 14px; letter-spacing: .1em; text-transform: uppercase; }
  /* La foto: borde negro, sombra plana de 8 px y apenas torcida. */
  .pop-foto { position: relative; width: 100%; aspect-ratio: 4 / 5; border: 4px solid var(--pop-negro); box-sizing: border-box; overflow: visible;
    box-shadow: 8px 8px 0 var(--pop-negro); transform: rotate(-1.5deg); background: repeating-linear-gradient(135deg, #3A3733 0 8px, #2C2A27 8px 16px); }
  .pop-foto-capa { position: absolute; inset: 0; overflow: hidden; }
  .pop-foto-revelado { position: absolute; inset: 0; z-index: 1; pointer-events: none;
    background-image: radial-gradient(var(--pp-acc) calc(var(--pop-punto, 7.2) * 1px), transparent calc(var(--pop-punto, 7.2) * 1px + .6px));
    background-size: 10px 10px; }
  .pop-foto-etq { position: absolute; left: 14px; bottom: 12px; z-index: 2; font-weight: 800; font-size: 12px; letter-spacing: .2em; text-transform: uppercase; color: var(--pp-ink); }
  .pop-sticker--guardala { position: absolute; right: -6px; top: 14px; z-index: 2; transform: rotate(4deg); }

  /* ── 02 Falta poco: viñetas de color ───────────────────────────────── */
  .pop-countdown { justify-content: space-between; padding-left: 0; padding-right: 0; }
  .pop-countdown > .pop-folio, .pop-countdown > .pop-spread { margin-left: max(20px, calc((100% - 1100px) / 2)); margin-right: max(20px, calc((100% - 1100px) / 2)); }
  .pop-marquesina { position: relative; z-index: 1; overflow: hidden; padding: 8px 0; white-space: nowrap; color: var(--pop-negro);
    border-top: 3px solid var(--pop-negro); border-bottom: 3px solid var(--pop-negro); font-weight: 800; font-size: 14px; letter-spacing: .2em; text-transform: uppercase; }
  .pop-marquesina--amarilla { background: var(--pp-acc2); transform: rotate(-2deg) scale(1.04); padding: 6px 0;
    font-family: var(--pop-serif), 'Bangers', cursive; font-weight: 400; font-size: 30px; letter-spacing: .06em; }
  .pop-marquesina--acento { background: var(--pp-acc); transform: rotate(2deg) scale(1.04); }
  .pop-marquesina-tira { display: flex; width: max-content; animation: popCorre 16s linear infinite; }
  .pop-marquesina-tira > span { padding-right: 32px; }
  .pop-marquesina--contraria .pop-marquesina-tira { animation-direction: reverse; }
  @keyframes popCorre { to { transform: translate3d(-50%, 0, 0); } }
  .pop-cuenta { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .pop-cuenta-caja { border: 3px solid var(--pop-negro); border-radius: 14px; padding: 16px 14px 14px; display: flex; flex-direction: column; gap: 4px; overflow: hidden; color: var(--pop-negro); }
  .pop-cuenta-caja:nth-child(1) { background: var(--pp-acc); box-shadow: 5px 5px 0 var(--pp-ink); transform: rotate(-2deg); }
  .pop-cuenta-caja:nth-child(2) { background: var(--pp-ink); box-shadow: 5px 5px 0 var(--pp-acc); transform: rotate(2deg); }
  .pop-cuenta-caja:nth-child(3) { background: var(--pop-acc3); box-shadow: 5px 5px 0 var(--pp-acc2); transform: rotate(1.5deg); }
  .pop-cuenta-caja:nth-child(4) { background: var(--pp-acc2); box-shadow: 5px 5px 0 var(--pop-acc3); transform: rotate(-1.5deg); }
  .pop-cuenta-num { font-family: var(--pop-serif), 'Bangers', cursive; font-size: clamp(64px, 20vw, 150px); line-height: .86; font-variant-numeric: tabular-nums; }
  .pop-cuenta-num > span { display: inline-block; animation: popCifra 300ms cubic-bezier(.16,1,.3,1); }
  @keyframes popCifra { from { transform: translateY(18%); opacity: .4; } to { transform: none; opacity: 1; } }
  .pop-cuenta-etq { font-weight: 800; font-size: 12px; letter-spacing: .22em; text-transform: uppercase; }
  .pop-tarjeta--hoy { background: var(--pp-acc2); color: var(--pop-negro); border: 3px solid var(--pop-negro); border-radius: 14px; padding: 18px; box-shadow: 5px 5px 0 var(--pp-acc); transform: rotate(-1deg);
    display: flex; flex-direction: column; gap: 6px; }
  .pop-tarjeta--hoy .pop-tarjeta-kicker { font-weight: 800; font-size: 12px; letter-spacing: .22em; text-transform: uppercase; }
  .pop-tarjeta--hoy .pop-tarjeta-titulo { font-family: var(--pop-serif), 'Bangers', cursive; font-size: clamp(40px, 11vw, 90px); line-height: .9; text-transform: uppercase; }

  /* ── 03 Unas palabras: el globo ────────────────────────────────────── */
  .pop-frase-seccion { background: var(--pp-bg2); color: var(--pop-negro); justify-content: space-between; gap: 30px; }
  .pop-globo { position: relative; background: #FFFFFF; border: 4px solid var(--pop-negro); border-radius: 26px; padding: 22px 22px 24px; box-shadow: 8px 8px 0 var(--pop-negro); max-width: 520px; }
  .pop-globo-cola { position: absolute; left: 44px; bottom: -22px; width: 0; height: 0; border-left: 14px solid transparent; border-right: 14px solid transparent; border-top: 22px solid var(--pop-negro); }
  .pop-globo-cola--blanca { left: 48px; bottom: -14px; border-left-width: 10px; border-right-width: 10px; border-top: 16px solid #FFFFFF; }
  .pop-frase { margin: 0; font-size: clamp(34px, 9.5vw, 72px); line-height: 1; letter-spacing: .02em; }
  .pop-bloque-amarillo { background: var(--pp-acc2); padding: 0 .14em; }
  .pop-bloque-acento { background: var(--pp-acc); color: #FFFFFF; padding: 0 .14em; }
  /* La onomatopeya: un cartel celeste recortado que tiembla. */
  .pop-boom { position: relative; align-self: flex-end; background: var(--pop-acc3); border: 4px solid var(--pop-negro); padding: 14px 18px; max-width: 260px; box-shadow: 6px 6px 0 var(--pop-negro);
    clip-path: polygon(6% 0, 100% 4%, 96% 100%, 0 94%); animation: popTiembla 4s ease-in-out infinite; }
  .pop-boom-titulo { font-family: var(--pop-serif), 'Bangers', cursive; font-size: 30px; line-height: 1; display: block; }
  .pop-boom-texto { display: block; font-weight: 700; font-size: 14px; margin-top: 4px; }
  @keyframes popTiembla { 0%, 100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }

  /* ── 04 Paneles ────────────────────────────────────────────────────── */
  .pop-pan { position: relative; z-index: 1; height: calc(100vh + var(--st-pasos, 2) * 90vh); }
  .pop-pan-fijo { position: sticky; top: 0; height: calc(var(--vh, 1vh) * 100); overflow: hidden; background: var(--pp-bg); }
  .pop-pan-fijo--album { background: #F7F5F0; }
  .pop-tira { position: absolute; top: 0; left: 0; height: 100%; display: flex; will-change: transform; }
  .pop-panel { flex: 0 0 100vw; min-width: 0; height: 100%; box-sizing: border-box; position: relative; overflow: hidden;
    display: flex; flex-direction: column; justify-content: space-between; gap: 20px;
    padding: 60px max(20px, calc((100vw - 1100px) / 2)) 92px; background: var(--pp-bg); color: var(--pp-ink); }
  .pop-panel--negro { --pop-sub: var(--pp-acc2); --pop-sombra: var(--pp-acc); }
  .pop-panel--celeste-sub { --pop-sub: var(--pop-acc3); --pop-sombra: var(--pp-acc2); }
  .pop-panel--acento { --pop-sub: var(--pp-acc2); --pop-sombra: var(--pp-ink); background: var(--pp-acc); color: var(--pop-negro); }
  .pop-panel--amarillo { --pop-sub: var(--pop-acc3); --pop-sombra: #FFFFFF; background: var(--pp-acc2); color: var(--pop-negro); }
  .pop-pan[data-scroll="vertical"] { height: auto; }
  .pop-pan[data-scroll="vertical"] .pop-pan-fijo { position: static; height: auto; overflow: visible; }
  .pop-pan[data-scroll="vertical"] .pop-tira { position: static; display: block; width: 100%; transform: none !important; }
  .pop-pan[data-scroll="vertical"] .pop-panel { height: auto; min-height: calc(var(--vh, 1vh) * 100); }
  .pop-ficha { background: #FFFFFF; color: var(--pop-negro); border: 3px solid var(--pop-negro); border-radius: 16px; padding: 14px 16px; box-shadow: 6px 6px 0 var(--pop-negro); display: flex; flex-direction: column; gap: 10px; }
  .pop-linea { display: flex; justify-content: space-between; gap: 14px; padding: 6px 0; border-bottom: 2px dashed var(--pop-negro); font-size: 15px; line-height: 1.3; }
  .pop-linea > span:first-child { font-weight: 800; font-size: 12px; letter-spacing: .16em; text-transform: uppercase; color: var(--pop-gris); flex: 0 0 auto; padding-top: 2px; }
  .pop-linea > span:last-child { text-align: right; font-weight: 700; }
  .pop-mapa { height: 190px; overflow: hidden; border: 3px solid var(--pop-negro); border-radius: 12px; }
  .pop-puntos { position: absolute; left: 0; right: 40px; bottom: 30px; display: flex; gap: 8px; justify-content: center; z-index: 2; }
  .pop-punto { width: 14px; height: 14px; border-radius: 50%; border: 3px solid currentColor; background: currentColor !important; opacity: .3; transition: opacity 300ms ease; display: inline-block; box-sizing: border-box; }
  .pop-punto[data-activo="1"] { opacity: 1; }

  /* ── 05 Check-in: el cupón ─────────────────────────────────────────── */
  .pop-checkin { background: var(--pp-acc2); color: var(--pop-negro); }
  .pop-cupon { position: relative; background: #FFFFFF; color: var(--pop-negro); border: 3px solid var(--pop-negro); border-radius: 18px; padding: 20px; display: flex; flex-direction: column; gap: 14px; overflow: hidden;
    box-shadow: 8px 8px 0 var(--pop-negro); transition: box-shadow 400ms ease; }
  .pop-cupon:has(.pop-filas) { box-shadow: 8px 8px 0 var(--pp-acc); }
  /* La tijera y la línea de corte, a la altura del renglón de estado. */
  .pop-corte { position: absolute; left: -3px; right: -3px; top: 54px; display: flex; align-items: center; gap: 8px; pointer-events: none; }
  .pop-corte svg { margin-left: 8px; flex: 0 0 auto; }
  .pop-corte > span { flex: 1; border-top: 3px dashed var(--pop-negro); }
  .pop-cupon .pop-tarjeta { position: relative; display: flex; flex-direction: column; gap: 14px; background: transparent; border: 0; padding: 0; transform: none !important; }
  .pop-talon-top { display: flex; justify-content: space-between; align-items: center; gap: 10px; font-weight: 800; font-size: 12px; letter-spacing: .18em; text-transform: uppercase; color: var(--pop-gris); padding-bottom: 22px; }
  .pop-talon-estado { transition: color 400ms ease; }
  .pop-campo { display: flex; flex-direction: column; gap: 6px; }
  .pop-etiqueta { font-weight: 800; font-size: 12px; letter-spacing: .16em; text-transform: uppercase; color: var(--pop-gris); }
  .pop-input { min-height: 48px; border: 0; border-bottom: 3px solid var(--pop-negro); border-radius: 0; background: transparent; color: var(--pop-negro);
    font-family: var(--pop-sans), 'Nunito', sans-serif; font-weight: 600; font-size: 15px; padding: 0; outline: none; }
  .pop-contador { display: flex; align-items: center; border-bottom: 3px solid var(--pop-negro); min-height: 48px; }
  .pop-contador button { width: 44px; min-height: 44px; border: 0; background: transparent; color: var(--pop-negro); cursor: pointer; font-family: var(--pop-serif), 'Bangers', cursive; font-size: 28px; line-height: 1; }
  .pop-contador button:disabled { opacity: .35; cursor: default; }
  .pop-contador > span { flex: 1; text-align: center; font-family: var(--pop-serif), 'Bangers', cursive; font-size: 32px; line-height: 1; }
  .pop-filas { display: flex; flex-direction: column; }
  .pop-fila { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 2px dashed var(--pop-negro); font-size: 15px; }
  .pop-fila--ultima { border-bottom: 0; }
  .pop-fila-valor { text-align: right; font-weight: 700; }
  .pop-precio { display: flex; justify-content: space-between; gap: 12px; font-weight: 800; font-size: 12px; letter-spacing: .12em; text-transform: uppercase; color: var(--pop-gris); padding-top: 4px; }
  .pop-precio-valor { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; color: var(--pop-negro); }
  .pop-precio-total { font-family: var(--pop-serif), 'Bangers', cursive; font-size: 26px; line-height: 1; letter-spacing: .02em; }
  .pop-precio-detalle { font-size: 11px; letter-spacing: .1em; }
  .pop-btn-solido { min-height: 54px; border: 3px solid var(--pop-negro); border-radius: 999px; background: var(--pop-acc3); color: var(--pop-negro); cursor: pointer;
    font-family: var(--pop-serif), 'Bangers', cursive; font-size: 24px; letter-spacing: .06em; padding: 4px 18px 0; box-shadow: 4px 4px 0 var(--pop-negro); transition: background 200ms ease; }
  @media (hover: hover) { .pop-btn-solido:hover { background: var(--pp-acc); } }
  .pop-btn-solido:disabled { opacity: .6; cursor: default; }
  .pop-btn-fantasma { min-height: 48px; border: 3px solid var(--pop-negro); border-radius: 999px; background: transparent; color: var(--pop-negro); cursor: pointer;
    font-family: var(--pop-serif), 'Bangers', cursive; font-size: 20px; letter-spacing: .05em; padding: 4px 18px 0; }
  .pop-error { margin: 0; font-weight: 800; font-size: 12px; color: var(--pp-acc); }
  /* El sticker "¡SÍ!": la estrella de doce puntas del acento. */
  .pop-cupon .pop-sello { position: absolute; right: 10px; bottom: 76px; width: 138px; aspect-ratio: 1; pointer-events: none;
    opacity: 0; transform: rotate(18deg) scale(1.9) translateY(-120px);
    background: var(--pp-acc); clip-path: polygon(50% 3%, 58% 14%, 71% 8%, 73% 22%, 87% 24%, 82% 37%, 94% 45%, 84% 55%, 91% 68%, 77% 71%, 76% 85%, 63% 80%, 55% 92%, 46% 81%, 33% 87%, 31% 73%, 17% 71%, 22% 58%, 10% 50%, 20% 40%, 13% 27%, 27% 24%, 28% 10%, 41% 15%);
    display: flex; align-items: flex-end; justify-content: center; padding-bottom: 30px; box-sizing: border-box;
    font-weight: 800; font-size: 8px; letter-spacing: .14em; text-transform: uppercase; color: var(--pop-negro); }
  .pop-cupon .pop-sello::before { content: "¡SÍ!"; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
    font-family: var(--pop-serif), 'Bangers', cursive; font-size: 34px; letter-spacing: 0; }
  .pop-petalos { display: none; }

  /* ── 06 Álbum: hoja de contactos ───────────────────────────────────── */
  .pop-panel--album { background: #F7F5F0; color: var(--pop-negro); justify-content: flex-start; gap: 14px; }
  .pop-panel--album-b { background: #EFEBE3; }
  .pop-hoja { flex: 1; min-height: 0; display: grid; grid-template-columns: repeat(6, 1fr); grid-template-rows: repeat(3, 1fr); gap: 10px; max-width: 900px; }
  .pop-foto-hoja { position: relative; overflow: hidden; min-height: 0; cursor: pointer; border: 3px solid var(--pop-negro); border-radius: 10px; box-shadow: 4px 4px 0 var(--pop-negro);
    background: repeating-linear-gradient(135deg, #D7D1C4 0 8px, #E6E1D6 8px 16px); }
  .pop-foto-hoja:nth-child(1) { transform: rotate(-1.5deg); }
  .pop-foto-hoja:nth-child(2) { transform: rotate(1.5deg); }
  .pop-foto-hoja:nth-child(3) { transform: rotate(-1deg); }
  .pop-foto-hoja:nth-child(4) { transform: rotate(2deg); }
  .pop-foto-hoja:nth-child(5) { transform: rotate(.5deg); }
  .pop-foto-hoja-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
  .pop-bano { position: absolute; inset: 0; mix-blend-mode: multiply; opacity: 0; transition: opacity 200ms linear; }
  .pop-bano--1 { background: color-mix(in srgb, var(--pp-acc) 55%, transparent); }
  .pop-bano--2 { background: color-mix(in srgb, var(--pop-acc3) 55%, transparent); }
  .pop-bano--3 { background: color-mix(in srgb, var(--pp-acc2) 60%, transparent); }
  .pop-bano--4 { background: rgba(180,85,255,.5); }
  .pop-bano--5 { background: rgba(61,242,176,.55); }
  .pop-foto-hoja-n { position: absolute; left: 8px; bottom: 6px; z-index: 1; font-weight: 800; font-size: 11px; letter-spacing: .14em; color: var(--pop-negro); }
  .pop-hoja[data-cantidad="5"] .pop-foto-hoja:nth-child(1) { grid-column: 1 / 4; grid-row: 1 / 3; }
  .pop-hoja[data-cantidad="5"] .pop-foto-hoja:nth-child(2) { grid-column: 4 / 7; grid-row: 1 / 2; }
  .pop-hoja[data-cantidad="5"] .pop-foto-hoja:nth-child(3) { grid-column: 4 / 6; grid-row: 2 / 3; }
  .pop-hoja[data-cantidad="5"] .pop-foto-hoja:nth-child(4) { grid-column: 6 / 7; grid-row: 2 / 3; }
  .pop-hoja[data-cantidad="5"] .pop-foto-hoja:nth-child(5) { grid-column: 1 / 7; grid-row: 3 / 4; }
  .pop-hoja[data-cantidad="4"] .pop-foto-hoja:nth-child(1) { grid-column: 1 / 4; grid-row: 1 / 3; }
  .pop-hoja[data-cantidad="4"] .pop-foto-hoja:nth-child(2) { grid-column: 4 / 7; grid-row: 1 / 2; }
  .pop-hoja[data-cantidad="4"] .pop-foto-hoja:nth-child(3) { grid-column: 4 / 7; grid-row: 2 / 3; }
  .pop-hoja[data-cantidad="4"] .pop-foto-hoja:nth-child(4) { grid-column: 1 / 7; grid-row: 3 / 4; }
  .pop-hoja[data-cantidad="3"] .pop-foto-hoja:nth-child(1) { grid-column: 1 / 4; grid-row: 1 / 4; }
  .pop-hoja[data-cantidad="3"] .pop-foto-hoja:nth-child(2) { grid-column: 4 / 7; grid-row: 1 / 3; }
  .pop-hoja[data-cantidad="3"] .pop-foto-hoja:nth-child(3) { grid-column: 4 / 7; grid-row: 3 / 4; }
  .pop-hoja[data-cantidad="2"] .pop-foto-hoja:nth-child(1) { grid-column: 1 / 4; grid-row: 1 / 4; }
  .pop-hoja[data-cantidad="2"] .pop-foto-hoja:nth-child(2) { grid-column: 4 / 7; grid-row: 1 / 4; }
  .pop-hoja[data-cantidad="1"] .pop-foto-hoja:nth-child(1) { grid-column: 1 / 7; grid-row: 1 / 4; }

  /* ── 07 Música: el jukebox ─────────────────────────────────────────── */
  .pop-musica { background: var(--pop-acc3); color: var(--pop-negro); }
  .pop-eq { display: flex; align-items: flex-end; gap: 6px; height: 44px; }
  .pop-eq span { width: 10px; height: 100%; background: var(--pop-negro); border-radius: 4px; transform-origin: bottom; animation: popEq 1.1s ease-in-out infinite; }
  .pop-eq span:nth-child(3) { background: var(--pp-acc); }
  .pop-eq span:nth-child(5) { background: var(--pp-acc2); }
  @keyframes popEq { 0%, 100% { transform: scaleY(.3); } 50% { transform: scaleY(1); } }
  .pop-musica form.pop-tarjeta { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; transform: none !important; }
  .pop-musica .pop-etiqueta { display: none; }
  .pop-musica .pop-input { min-height: 48px; border: 3px solid var(--pop-negro); border-radius: 12px; background: #FFFFFF; color: var(--pop-negro); font-weight: 700; padding: 0 14px; min-width: 0; }
  .pop-musica .pop-error { grid-column: 1 / -1; }
  .pop-musica .pop-btn-solido { grid-column: 1 / -1; min-height: 50px; background: var(--pp-acc2); font-size: 22px; }
  .pop-lista { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
  .pop-lista-fila { display: flex; align-items: center; gap: 12px; padding: 10px 14px; background: #FFFFFF; border: 3px solid var(--pop-negro); border-radius: 14px; box-shadow: 3px 3px 0 var(--pop-negro); }
  .pop-lista-texto { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .pop-lista-tema { font-family: var(--pop-serif), 'Bangers', cursive; font-size: 24px; line-height: 1; }
  .pop-lista-quien { font-weight: 700; font-size: 12px; letter-spacing: .1em; text-transform: uppercase; color: var(--pop-gris); }

  /* ── 08 Regalos ────────────────────────────────────────────────────── */
  .pop-tarjeta--banco { --pop-sombra: var(--pp-acc); position: relative; z-index: 1; background: #FFFFFF; color: var(--pop-negro); border: 3px solid var(--pop-negro); border-radius: 16px; padding: 16px 18px;
    display: flex; flex-direction: column; gap: 10px; box-shadow: 6px 6px 0 var(--pop-sombra); transform: none !important; }
  .pop-tarjeta--der { --pop-sombra: var(--pop-acc3); }
  .pop-tarjeta--banco + .pop-tarjeta--banco { margin-top: 14px; }
  .pop-tarjeta-kicker { font-weight: 800; font-size: 12px; letter-spacing: .18em; text-transform: uppercase; color: var(--pop-gris); }
  .pop-tarjeta-mensaje { margin: 0; font-weight: 600; font-size: 14px; line-height: 1.5; color: var(--pop-gris); }
  .pop-fila-texto { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .pop-fila-etq { font-weight: 800; font-size: 11px; letter-spacing: .18em; text-transform: uppercase; color: var(--pop-gris); }
  .pop-fila-dato { font-weight: 700; font-size: 14px; letter-spacing: .04em; overflow-wrap: anywhere; }
  .pop-fila--copiable:first-child .pop-fila-dato { font-family: var(--pop-serif), 'Bangers', cursive; font-weight: 400; font-size: 24px; line-height: 1; }
  .pop-tarjeta--banco .pop-fila--ultima { border-bottom: 0; font-weight: 700; font-size: 12px; letter-spacing: .1em; text-transform: uppercase; color: var(--pop-gris); }
  .pop-btn-copiar { flex: 0 0 auto; min-height: 44px; padding: 0 14px; border: 3px solid var(--pop-negro); border-radius: 999px; background: var(--pp-acc2); color: var(--pop-negro); cursor: pointer;
    font-weight: 800; font-size: 12px; letter-spacing: .14em; text-transform: uppercase; }
  .pop-btn-copiar--hecho { background: var(--pop-negro); color: #FFFFFF; }

  /* ── 09 Trivia ─────────────────────────────────────────────────────── */
  .pop-quiz { background: var(--pp-bg2); color: var(--pop-negro); }
  .pop-quiz .pop-tarjeta { display: flex; flex-direction: column; gap: 12px; transform: none !important; }
  .pop-quiz .pop-tarjeta-kicker { align-self: flex-start; background: var(--pp-acc); color: var(--pop-negro); border: 3px solid var(--pop-negro); font-family: var(--pop-serif), 'Bangers', cursive;
    font-size: 20px; letter-spacing: .05em; padding: 4px 14px 2px; transform: rotate(-2deg); box-shadow: 3px 3px 0 var(--pop-negro); text-transform: uppercase; }
  .pop-quiz .pop-tarjeta-pregunta, .pop-quiz .pop-tarjeta-titulo { font-family: var(--pop-serif), 'Bangers', cursive; font-size: clamp(44px, 12vw, 100px); line-height: .92; max-width: 14ch; text-transform: uppercase; text-shadow: 4px 4px 0 var(--pp-acc2); }
  .pop-quiz .pop-tarjeta-mensaje { margin: 0; font-weight: 700; font-size: 15px; color: var(--pop-gris); }
  .pop-opciones { display: flex; flex-direction: column; gap: 10px; counter-reset: opcion; }
  .pop-opcion { min-height: 54px; border: 3px solid var(--pop-negro); border-radius: 16px; background: #FFFFFF; color: var(--pop-negro); cursor: pointer; counter-increment: opcion;
    font-family: var(--pop-sans), 'Nunito', sans-serif; font-weight: 800; font-size: 16px; text-align: left; padding: 0 18px; box-shadow: 4px 4px 0 var(--pop-negro);
    display: flex; justify-content: space-between; align-items: center; gap: 12px; transition: background 200ms ease; }
  .pop-opcion::after { content: counter(opcion, upper-alpha); font-family: var(--pop-serif), 'Bangers', cursive; font-size: 20px; letter-spacing: .05em; }
  .pop-opcion--bien { background: var(--pp-acc2); }
  .pop-opcion--bien::after { content: "¡SÍ!"; }
  .pop-opcion--mal { background: var(--pp-acc); }
  .pop-opcion--mal::after { content: "CASI"; }
  @media (min-width: 1024px) {
    .pop-quiz .pop-spread > .pop-tarjeta { grid-column: 1 / -1; max-width: none; justify-self: stretch; display: grid; grid-template-columns: 1fr 1fr; column-gap: 72px; align-items: center; }
    .pop-quiz .pop-tarjeta-kicker { grid-column: 1; justify-self: end; margin-right: auto; }
    .pop-quiz .pop-tarjeta-pregunta { grid-column: 1; max-width: 560px; justify-self: end; width: 100%; }
    .pop-quiz .pop-opciones { grid-column: 2; grid-row: 1 / span 2; max-width: 560px; width: 100%; }
  }

  /* ── 10 Tu pase: la contratapa ─────────────────────────────────────── */
  .pop-pase { background: var(--pp-acc); color: var(--pop-negro); justify-content: space-between; padding-bottom: calc(28px + env(safe-area-inset-bottom)); }
  .pop-pagina--qr { align-items: flex-start; }
  .pop-qr { position: relative; width: min(100%, 300px); aspect-ratio: 1; background: #FFFFFF; padding: 16px; box-sizing: border-box; border: 4px solid var(--pop-negro); border-radius: 18px;
    box-shadow: 8px 8px 0 var(--pop-negro); transform: rotate(-2deg); margin-bottom: 30px; }
  .pop-qr .qr-ingreso, .pop-qr section { background: transparent !important; border: none !important; padding: 0 !important; }
  .pop-qr img, .pop-qr svg, .pop-qr canvas { width: 100% !important; height: auto !important; display: block; }
  .pop-qr-etq { position: absolute; left: 0; right: 0; bottom: -30px; text-align: center; font-weight: 800; font-size: 11px; letter-spacing: .2em; text-transform: uppercase; }
  .pop-pase-cabeza { display: flex; align-items: flex-end; justify-content: space-between; gap: 14px; }
  .pop-pase-numero { display: flex; flex-direction: column; }
  .pop-pase-numero > span:last-child { font-family: var(--pop-serif), 'Bangers', cursive; font-size: clamp(72px, 22vw, 160px); line-height: .84; text-shadow: 5px 5px 0 var(--pp-ink); -webkit-text-stroke: 2px var(--pop-negro); paint-order: stroke fill; }
  .pop-caja { display: flex; flex-direction: column; background: #FFFFFF; border: 3px solid var(--pop-negro); border-radius: 16px; padding: 6px 16px; box-shadow: 6px 6px 0 var(--pop-negro); }
  .pop-caja .pop-linea { padding: 10px 0; font-size: 14px; }
  .pop-caja .pop-linea:last-child { border-bottom: 0; }
  .pop-caja .pop-linea > span:last-child { font-weight: 600; line-height: 1.35; }
  .pop-info-extra { margin-top: 4px; }
  .pop-info-extra #info-adicional { background: transparent !important; padding: 0 !important; }
  .pop-info-extra #ia-trigger-btn { background: #FFFFFF !important; color: var(--pop-negro) !important; border: 3px solid var(--pop-negro) !important;
    border-radius: 999px !important; font-weight: 800 !important; letter-spacing: .14em !important; text-transform: uppercase; box-shadow: 3px 3px 0 var(--pop-negro); }
  .pop-raiz .ia-icon-box, .pop-raiz svg.lucide { display: none !important; }
  .pop-pase-pie { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 14px; }
  .pop-despedida { font-family: var(--pop-serif), 'Bangers', cursive; font-size: clamp(34px, 9vw, 56px); line-height: 1; text-shadow: 3px 3px 0 var(--pp-ink); text-transform: uppercase; }
  .pop-replay { cursor: pointer; }
  .pop-credito { display: inline-flex; opacity: .85; }

  /* ── La estrella de doce puntas ────────────────────────────────────── */
  .pop-estrella { position: relative; width: clamp(78px, 20vw, 104px); aspect-ratio: 1; flex: 0 0 auto; }
  .pop-estrella svg { position: absolute; inset: 0; animation: popGira 22s linear infinite; }
  .pop-estrella-forma { fill: var(--pp-acc); stroke: var(--pop-negro); }
  .pop-estrella text { font-family: var(--pop-sans), 'Nunito', sans-serif; font-weight: 800; font-size: 9.5px; letter-spacing: 1.6px; fill: var(--pop-negro); }
  .pop-estrella-centro { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-family: var(--pop-serif), 'Bangers', cursive; font-size: 30px; color: var(--pop-negro); }
  .pop-estrella--amarilla { width: clamp(90px, 24vw, 120px); }
  .pop-estrella--amarilla svg { animation-duration: 26s; }
  .pop-estrella--amarilla .pop-estrella-forma { fill: var(--pp-acc2); }
  @keyframes popGira { to { transform: rotate(360deg); } }

  /* ── La tapa: el cómic ─────────────────────────────────────────────── */
  .pop-portada { position: absolute; inset: 0; z-index: 5; overflow: hidden; background: var(--pp-bg); color: var(--pp-ink); }
  .pop-portada-hoja { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box;
    padding: calc(16px + env(safe-area-inset-top)) max(20px, calc((100% - 1100px) / 2)) calc(20px + env(safe-area-inset-bottom)); }
  /* El ticker de íconos que pasa detrás del nombre. */
  .pop-ticker { position: absolute; left: 0; right: 0; top: 34%; overflow: hidden; pointer-events: none; opacity: .9; }
  .pop-ticker-tira { display: flex; width: max-content; gap: 28px; padding: 0 14px; animation: popCorre 30s linear infinite; }
  .pop-ticker-icono { flex: 0 0 auto; }
  .pop-ticker-icono--0 { color: var(--pp-acc); } .pop-ticker-icono--1 { color: var(--pp-acc2); } .pop-ticker-icono--2 { color: var(--pop-acc3); } .pop-ticker-icono--3 { color: var(--pp-ink); }
  .pop-tapa-cabecera { position: relative; z-index: 1; display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
  .pop-sticker--evento { font-size: 22px; padding: 4px 12px 2px; transform: rotate(-2deg); box-shadow: 4px 4px 0 var(--pp-ink); }
  .pop-tapa-numero { font-weight: 800; font-size: 12px; letter-spacing: .18em; text-transform: uppercase; text-align: right; line-height: 1.3; }
  .pop-tapa-centro { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 10px; }
  .pop-tapa-fila { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
  .pop-tapa-kicker { font-weight: 800; font-size: 13px; letter-spacing: .2em; text-transform: uppercase; color: var(--pp-acc2); }
  /* El nombre: Bangers gigante con sombra plana del acento y trazo negro;
     el segundo renglón en amarillo y sangrado. El más largo manda el cuerpo. */
  .pop-tapa-nombres { margin: 0; line-height: .86; letter-spacing: .01em; display: flex; flex-direction: column;
    text-shadow: 6px 6px 0 var(--pp-acc); -webkit-text-stroke: 2px var(--pop-negro); paint-order: stroke fill;
    font-size: min(clamp(72px, 26vw, 220px), 22vh, calc((100vw - 44px) / (var(--largo, 6) * 0.5))); }
  @media (min-width: 1024px) { .pop-tapa-nombres { font-size: min(17vw, 300px, 26vh, calc((min(100vw, 1100px) - 44px) / (var(--largo, 6) * 0.5))); } }
  .pop-tapa-linea { overflow: hidden; display: block; white-space: nowrap; }
  .pop-tapa-linea > span { display: block; }
  .pop-tapa-linea--sangra { padding-left: 22%; }
  .pop-letra { display: inline-block; animation: popSalta calc(var(--n, 9) * 3.2s) cubic-bezier(.34,1.56,.64,1) infinite; animation-delay: calc(var(--i, 0) * -3.2s); }
  @keyframes popSalta { 0%, 99% { transform: none; } 99.3% { transform: translateY(-18px) rotate(8deg); } 100% { transform: none; } }
  .pop-tapa-datos { display: flex; justify-content: space-between; align-items: flex-end; gap: 14px; font-weight: 700; font-size: 13px; line-height: 1.35; }
  .pop-tapa-datos-der { text-align: right; }
  .pop-tapa-pie { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 12px; }
  /* El globo del mensaje: crema con borde negro, sombra del acento y cola. */
  .pop-globo--tapa { background: var(--pp-ink); color: var(--pop-negro); border-width: 3px; border-radius: 18px; padding: 14px 18px; box-shadow: 5px 5px 0 var(--pp-acc); max-width: 340px; margin-bottom: 10px; }
  .pop-globo--tapa .pop-globo-cola { left: 30px; bottom: -16px; border-left-width: 10px; border-right-width: 10px; border-top-width: 16px; }
  .pop-globo--tapa .pop-globo-cola--crema { left: 33px; bottom: -10px; border-left-width: 7px; border-right-width: 7px; border-top: 11px solid var(--pp-ink); }
  .pop-tapa-mensaje { margin: 0; font-weight: 700; font-size: clamp(16px, 4.4vw, 20px); line-height: 1.3; }
  .pop-tapa-btn { min-height: 54px; min-width: 240px; align-self: flex-start; border: 3px solid var(--pop-negro); border-radius: 999px; background: var(--pp-acc); color: var(--pop-negro); cursor: pointer;
    font-family: var(--pop-serif), 'Bangers', cursive; font-size: 24px; letter-spacing: .06em; padding: 4px 24px 0;
    display: flex; align-items: center; justify-content: space-between; gap: 12px; box-shadow: 4px 4px 0 var(--pp-ink); transition: background 200ms ease; }
  @media (hover: hover) { .pop-tapa-btn:hover { background: var(--pp-acc2); } }

  /* ── Riel, pista y lupa ────────────────────────────────────────────── */
  .pop-riel { position: absolute; right: 0; top: 0; bottom: 0; width: 40px; z-index: 4; display: flex; flex-direction: column;
    align-items: center; justify-content: space-between; padding: calc(16px + env(safe-area-inset-top)) 0 calc(16px + env(safe-area-inset-bottom));
    opacity: 0; transition: opacity 600ms ease; pointer-events: none; color: var(--pp-ink); border-left: 3px solid currentColor !important; }
  .pop-riel-top { writing-mode: vertical-rl; font-family: var(--pop-serif), 'Bangers', cursive; font-size: 14px; letter-spacing: .2em; color: inherit !important; }
  .pop-riel-etiqueta { writing-mode: vertical-rl; font-weight: 800; font-size: 10px; letter-spacing: .28em; text-transform: uppercase; color: inherit; }
  .pop-riel-linea { flex: 1; width: 1px; margin: 16px 0; background: transparent !important; position: relative; }
  .pop-riel-barra { position: absolute; left: -3px; top: 0; width: 6px; height: 0%; background: var(--pp-acc2); transition: height 200ms linear; display: block; }
  .pop-pista { position: absolute; left: 0; right: 40px; bottom: calc(18px + env(safe-area-inset-bottom)); z-index: 6; text-align: center;
    font-weight: 800; font-size: 11px; letter-spacing: .28em; color: var(--pp-acc2);
    opacity: 0; transition: opacity 600ms ease; pointer-events: none; animation: popPista 2.4s ease-in-out infinite; }
  @keyframes popPista { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(6px); } }

  .pop-lupa { position: fixed; inset: 0; z-index: 200; background: rgba(14,14,16,.94);
    display: flex; align-items: center; justify-content: center; padding: 24px; cursor: zoom-out; }
  .pop-lupa-cerrar { position: absolute; top: 20px; right: 20px; width: 40px; height: 40px; border: 3px solid var(--pop-negro); border-radius: 50%;
    background: var(--pp-acc2); color: var(--pop-negro); font-size: 18px; line-height: 1; cursor: pointer; box-shadow: 3px 3px 0 var(--pp-ink); }
  .pop-lupa-img { max-width: 100%; max-height: 88vh; object-fit: contain; cursor: default; border: 4px solid var(--pop-negro); border-radius: 12px; box-shadow: 8px 8px 0 var(--pp-acc); }

  @media (prefers-reduced-motion: reduce) {
    .pop-raiz * { animation: none !important; }
    .pop-scroller [data-xin] { opacity: 1 !important; transform: none !important; }
    .pop-foto { --pop-punto: 0; }
  }
`;
