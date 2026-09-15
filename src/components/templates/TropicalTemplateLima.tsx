"use client";

// GENERADO por scripts/gen-iconic-variants.js a partir de
// TropicalTemplate.tsx — no editar a mano: los cambios se pierden al regenerar.

/**
 * TROPICAL · Colección Iconic — sub-colección "Tipográfica Editorial"
 * Variante: Lima.
 *
 * GENERADO por scripts/derivar-tipografica.js a partir de
 * EditorialBlancNoirTemplate.tsx — no editar a mano: la sub-colección se
 * arregla en Editorial Blanc & Noir y se vuelve a derivar; lo propio de
 * esta familia está en scripts/familias/tipografica/tro.json.
 *
 * La isla: Lilita One sobre arena y mar, con Quicksand para el texto. El
 * acento es el de la fruta y el segundo el verde de las palmeras.
 *
 * Sin imágenes propias: son tres fuentes y CSS.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Lilita_One, Quicksand } from "next/font/google";
import { LogoFooterCredit } from "@/components/ui/Logo";
import { AddToCalendarLink } from "@/components/invitation/AddToCalendarLink";
import { AnimatedCoverPhoto, COVER_RESPONSIVE_STYLE } from "@/components/invitation/v2/AnimatedCoverPhoto";
import { InfoAdicionalSection } from "@/components/invitation/v2/InfoAdicionalSection";
import { useMusicPlayer, MusicToggleButton } from "@/components/invitation/MusicPlayer";
import { BurbujaPase } from "@/components/templates/BurbujaPase";
import { QrDeIngreso } from "@/components/invitation/QrDeIngreso";
import { BienvenidaStorytelling } from "@/components/invitation/BienvenidaStorytelling";
import { PostEventoStorytelling, useEstadoDelEvento } from "@/components/invitation/PostEventoStorytelling";
import { useCountdown, pad } from "@/components/invitation/v2/useCountdown";
import { useTextos, useFormatoDeMoneda, tituloEnDosLineas } from "@/components/i18n/ProveedorIdioma";
import { toEmbedMapUrl } from "@/lib/google-maps";
import { esVistaMiniatura } from "@/lib/miniatura";

const troSerif = Lilita_One({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  variable: "--tro-serif",
});
const troSans = Quicksand({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--tro-sans",
});
// El mono es la ficha técnica de la revista: kickers, folios y datos.

// ─── Paleta ─────────────────────────────────────────────────────────────────
// Las cinco variantes de "Capas de papel" cambian SOLO estos once colores
// (el script de variantes reemplaza este bloque entero, ver
// scripts/gen-capas-de-papel-variants.js). El dibujo es el mismo: los SVG de
// las escenas leen var(--pp-…), así que un cambio acá repinta cerros, cielo,
// sol y figuras de una sola vez.
const PALETA = {
  bg: "#FFF6DC",
  bg2: "#DFFBE6",
  ink: "#233A2E",
  ink2: "#233A2E",
  acc: "#9BD83A",
  acc2: "#1E7A55",
  sky1: "#FFF6DC",
  sky2: "#DFFBE6",
  hill1: "#DFFBE6",
  hill2: "#233A2E",
  hill3: "#233A2E",
  night: "#233A2E",
  nightInk: "#FFF6DC",
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

/** El papel de las tarjetas, que es el mismo en todas las variantes. */
const CARTA = "#F8F2E6";
const CARTA_LINEA = "#E2D8C4";
const CARTA_TINTA = "#2B2A33";

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

interface TropicalTemplateProps {
  invitation: Record<string, unknown>;
  guest?: GuestRecord | null;
  isPersonalized?: boolean;
}

/** El número de pase, con tres cifras como en el mockup ("PASE Nº 042"). */
function numeroDePase(orderNumber: number | undefined): string {
  return String(orderNumber ?? 42).padStart(3, "0");
}

export function TropicalTemplateLima({ invitation, guest, isPersonalized = false }: TropicalTemplateProps) {
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
    if (cartel) {
      cartel.style.transition = "none";
      cartel.style.opacity = "0";
      cartel.style.transform = "perspective(700px) rotateX(-12deg) rotate(-1.2deg)";
      cartel.style.boxShadow = "0 2px 0 rgba(0,0,0,.12)";
      window.setTimeout(() => {
        cartel.style.transition = "transform 1100ms cubic-bezier(.16,1,.3,1), opacity 700ms ease, box-shadow 1100ms ease";
        cartel.style.opacity = "1";
        cartel.style.transform = "perspective(700px) rotateX(0deg) rotate(-1.2deg)";
        cartel.style.boxShadow = "0 2px 0 rgba(0,0,0,.12), 0 18px 30px rgba(0,0,0,.14)";
      }, 700);
    }
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
      el.style.setProperty("--tro-y", `${dist}px`);
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
            el.style.setProperty("--tro-y", "0px");
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

          // La foto principal se abre como una ventana troquelada mientras
          // sube: de un óvalo angosto al rectángulo entero.
          const ven = ventanaRef.current;
          if (ven) {
            const r = ven.getBoundingClientRect();
            const p = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.7)));
            const v = (1 - p) * 44;
            const h = (1 - p) * 38;
            ven.style.clipPath = `inset(${v}% ${h}% ${v}% ${h}% round 999px 999px 14px 14px)`;
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
          clase: `${troSerif.variable} ${troSans.variable} `,
          fuente: "var(--tro-sans), 'Quicksand', sans-serif",
        }}
      />
    );
  }


  return (
    <div
      ref={raizRef}
      className={`${troSerif.variable} ${troSans.variable} tro-raiz`}
      style={varsDePaleta}
    >
      <style>{CSS_TRO}</style>
      <style>{COVER_RESPONSIVE_STYLE}</style>

      <div ref={scrollerRef} className="tro-scroller">
        <BienvenidaStorytelling
          prefijo="jdp"
          acento={PALETA.acc}
          titulo={titulo}
          tipo={invitation.tipo ? String(invitation.tipo) : null}
          fechaEvento={fechaEvento}
          lugar={lugarNombre || null}
          invitado={isPersonalized && guest?.name ? guest.name : null}
          numeroDePase={guest?.orderNumber ?? null}
          personas={guest?.expectedCount ?? null}
          tono={TONO}
        />

        {/* ── 01 Guardá la fecha ─────────────────────────────────────── */}
        <section data-tone={TONO} data-screen-label={tx("invitacion.saveTheDate.guardaLaFecha")} className="tro-section tro-std">
          <div className="tro-trama" aria-hidden="true" />
          <span data-xin="1" data-dist="-20" className="tro-kicker">{nSaveTheDate} — {tx("invitacion.saveTheDate.guardaLaFecha").toUpperCase()}</span>
          <div className="tro-std-fecha">
            <span data-xin="1" data-delay="60" data-dist="40" className="tro-std-dia">{diaNum}</span>
            <div data-xin="1" data-delay="160" data-dist="30" className="tro-std-fila">
              <span className="tro-cinta">{mesLargo}</span>
              <span className="tro-std-anio">{anio}</span>
            </div>
          </div>
          <div data-xin="1" data-delay="240" data-dist="20" className="tro-meta">
            <span>{diaSemana} · {hora} H</span>
            <span className="tro-meta-punto" aria-hidden="true" />
            <span>{(ciudad || lugarNombre || direccion).toUpperCase()}</span>
          </div>
          <AddToCalendarLink
            eventName={titulo}
            targetDate={fechaHora}
            location={[lugarNombre, direccion].filter(Boolean).join(", ")}
            description={String(invitation.portadaMensaje ?? "")}
            className="tro-btn-papel tro-btn-papel--reveal"
            showIcon={false}
          >
            {tx("invitacion.saveTheDate.agregarAlCalendario").toUpperCase()} <span aria-hidden="true">↗</span>
          </AddToCalendarLink>
        </section>

        {/* ── Nuestra foto: se abre como una ventana troquelada ───────── */}
        {hayFoto && (
          <section data-tone={TONO} data-screen-label={tx("invitacion.album.nuestraFoto")} className="tro-foto-seccion">
            <div className="tro-foto-marco">
              <div ref={ventanaRef} className="tro-ventana">
                {fotoMobile && (
                  <div className="acp-mobile-only tro-foto-capa">
                    <AnimatedCoverPhoto photoSrc={fotoMobile} tint={false} effect="enfoque" scrimColorRgb="243,235,221" />
                  </div>
                )}
                {fotoDesktop && (
                  <div className="acp-desktop-only tro-foto-capa">
                    <AnimatedCoverPhoto photoSrc={fotoDesktop} tint={false} effect="enfoque" scrimColorRgb="243,235,221" />
                  </div>
                )}
              </div>
              <div className="tro-foto-firma">{titulo}</div>
            </div>
          </section>
        )}

        {/* ── 02 Falta poco ──────────────────────────────────────────── */}
        <section data-tone={TONO} data-screen-label={tx("invitacion.cuentaRegresiva.kicker")} className="tro-section tro-countdown">
          <div className="tro-trama" aria-hidden="true" />
          <span data-xin="1" data-dist="-20" className="tro-kicker">{nCountdown} — {tx("invitacion.cuentaRegresiva.faltan").toUpperCase()}</span>
          <h2 data-xin="1" data-delay="60" className="tro-h2">
            {tx("invitacion.cuentaRegresiva.estamosContando")}<br /><em>{tx("invitacion.cuentaRegresiva.losDias")}</em>
          </h2>
          <CuentaTropical targetDate={fechaHora} />
        </section>

        {/* ── 03 Unas palabras ───────────────────────────────────────── */}
        {hayFrase && (
          <section data-tone={TONO} data-screen-label={tx("invitacion.frase.etiqueta")} className="tro-section tro-frase-seccion">
            <div className="tro-trama" aria-hidden="true" />
            <span data-xin="1" data-dist="-20" className="tro-kicker">{nFrase} — {tx("invitacion.frase.unasPalabras").toUpperCase()}</span>
            <h2 ref={fraseRef} className="tro-frase">
              {palabras.map((p, i) => (
                // El espacio va FUERA del span: el motor pone cada palabra en
                // inline-block para poder moverla, y un espacio de fin de
                // línea adentro de un inline-block se colapsa a cero.
                <span key={i}>
                  <span data-w="1" className={i >= desdeAcento ? "tro-acento" : undefined}>{p}</span>{" "}
                </span>
              ))}
            </h2>
            <div data-xin="1" data-delay="200" className="tro-firma">
              <span className="tro-firma-linea" aria-hidden="true" />{titulo.toUpperCase()}
            </div>
          </section>
        )}

        {/* ── 04 Cuándo y dónde ──────────────────────────────────────── */}
        <div
          id="details"
          data-pan="1"
          data-scroll={scrollVertical || panelesLugar.length <= 1 ? "vertical" : "lateral"}
          data-screen-label={tx("invitacion.ubicacion.cuandoYDonde")}
          className="tro-pan"
          style={{ "--st-pasos": Math.max(0, panelesLugar.length - 1) } as React.CSSProperties}
        >
          <div className="tro-pan-fijo">
            <div data-strip="1" className="tro-tira">
              {/* Recepción */}
              <div data-tone={TONO} className="tro-panel tro-panel--abajo" style={{ background: PALETA.bg }}>
                <div className="tro-panel-top">
                  <span>{nCuando} — {tx("invitacion.ubicacion.cuandoYDonde").toUpperCase()}</span><span>{deLugar("recepcion")}</span>
                </div>
                <div className="tro-tarjeta tro-tarjeta--izq">
                  <span className="tro-tarjeta-kicker">{tx("invitacion.ubicacion.fiestaSalon").toUpperCase()}</span>
                  <h2 className="tro-tarjeta-titulo">{lugarNombre || tx("invitacion.ubicacion.elLugar")}</h2>
                  <div className="tro-filas">
                    {direccion && (
                      <div className="tro-fila"><span>{tx("invitacion.ubicacion.direccion")}</span><span className="tro-fila-valor">{direccion}</span></div>
                    )}
                    <div className="tro-fila"><span>{tx("invitacion.ubicacion.horario")}</span><span>{hora} h</span></div>
                    {dressCode && (
                      <div className="tro-fila tro-fila--ultima"><span>{tx("invitacion.ubicacion.dressCode")}</span><span className="tro-acento-plano">{dressCode}</span></div>
                    )}
                  </div>
                </div>
                {!scrollVertical && panelesLugar.length > 1 && (
                  <div className="tro-seguir">{tx("invitacion.portada.seguiBajando").toUpperCase()} <span className="tro-flecha">→</span></div>
                )}
              </div>

              {/* Ceremonia */}
              {ceremoniaHabilitada && (
                <div id="ceremonia" data-tone={TONO} className="tro-panel tro-panel--abajo" style={{ background: PALETA.bg2 }}>
                  <div className="tro-panel-top">
                    <span>{ceremoniaTitulo.toUpperCase()}</span><span>{deLugar("ceremonia")}</span>
                  </div>
                  <div className="tro-tarjeta tro-tarjeta--der">
                    <h2 className="tro-tarjeta-titulo">{ceremoniaNombre || ceremoniaTitulo}</h2>
                    <div className="tro-filas">
                      {ceremoniaDireccion && (
                        <div className="tro-fila"><span>{tx("invitacion.ubicacion.direccion")}</span><span className="tro-fila-valor">{ceremoniaDireccion}</span></div>
                      )}
                      {ceremoniaHora && (
                        <div className="tro-fila tro-fila--ultima"><span>{tx("invitacion.ubicacion.horario")}</span><span>{ceremoniaHora} h</span></div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Cómo llegar */}
              {hayComoLlegar && (
                <div id="location" data-tone={TONO} className="tro-panel tro-panel--abajo" style={{ background: PALETA.bg }}>
                  <svg viewBox="0 0 430 700" preserveAspectRatio="xMidYMid slice" className="tro-escena" aria-hidden="true">
                    <path d="M0 520 C120 470 200 500 300 470 S420 380 430 400 V700 H0Z" style={{ fill: "var(--pp-hill1, #BCCBB6)" }} />
                    <path
                      ref={rutaRef}
                      d="M40 560 C120 500 80 380 180 340 S300 250 330 150"
                      fill="none"
                      style={{ stroke: "var(--pp-acc, #C86B5A)" }}
                      strokeWidth={3}
                      strokeDasharray="10 8"
                      strokeLinecap="round"
                    />
                    <circle cx={40} cy={560} r={7} style={{ fill: "var(--pp-ink, #2B2A33)" }} />
                    <path d="M330 150 m-16 0 a16 16 0 1 1 32 0 c0 12 -16 30 -16 30 s-16 -18 -16 -30Z" style={{ fill: "var(--pp-acc, #C86B5A)" }} />
                  </svg>
                  <div className="tro-panel-top">
                    <span>{tx("invitacion.ubicacion.comoLlegar").toUpperCase()}</span><span>{deLugar("llegar")}</span>
                  </div>
                  <h2 className="tro-h2">{tx("invitacion.ubicacion.comoLlegar")}</h2>
                  {(direccion || ciudad) && <p className="tro-parrafo">{[direccion, ciudad].filter(Boolean).join(" · ")}</p>}
                  {embedMapUrl && (
                    <div className="tro-mapa">
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
                  <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="tro-btn-solido">
                    {tx("invitacion.ubicacion.abrirEnMapas").toUpperCase()} <span aria-hidden="true">↗</span>
                  </a>
                </div>
              )}

              {/* Cronograma */}
              {cronograma.length > 0 && (
                <div id="schedule" data-tone={TONO} className="tro-panel tro-panel--centro" style={{ background: PALETA.bg2 }}>
                  <div className="tro-panel-top">
                    <span>{tx("invitacion.ubicacion.cronograma").toUpperCase()}</span><span>{deLugar("cronograma")}</span>
                  </div>
                  <h2 className="tro-h2">{tx("invitacion.ubicacion.laNochePasoAPaso")}</h2>
                  <div className="tro-crono">
                    {cronograma.map((item, i) => (
                      <div key={i} className="tro-crono-fila">
                        <span className="tro-crono-hora">{item.time || ""}</span>
                        <span className="tro-crono-titulo">{item.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {!scrollVertical && panelesLugar.length > 1 && <Puntos cantidad={panelesLugar.length} />}
          </div>
        </div>

        {/* ── 05 Check-in ────────────────────────────────────────────── */}
        {rsvpHabilitado && (
          <section id="rsvp" data-tone={TONO} data-screen-label={tx("invitacion.rsvp.confirmar")} className="tro-section tro-checkin">
            <div className="tro-trama" aria-hidden="true" />
            <span data-xin="1" data-dist="-20" className="tro-kicker">{nCheckin} — CHECK-IN</span>
            <h2 data-xin="1" data-delay="60" className="tro-h2">
              {tx("invitacion.rsvp.confirmaLinea1")}<br /><em>{tx("invitacion.rsvp.confirmaLinea2")}</em>
            </h2>
            <CheckinTropical
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
          </section>
        )}

        {/* ── 06 Álbum ───────────────────────────────────────────────── */}
        {todasLasFotos.length > 0 && (
          <div
            id="album"
            data-pan="1"
            data-scroll={scrollVertical || hojasDeFotos.length <= 1 ? "vertical" : "lateral"}
            data-screen-label={tx("invitacion.album.titulo")}
            className="tro-pan"
            style={{ "--st-pasos": Math.max(0, hojasDeFotos.length - 1) } as React.CSSProperties}
          >
            <div className="tro-pan-fijo">
              <div data-strip="1" className="tro-tira">
                {hojasDeFotos.map((hoja, iHoja) => (
                  <div key={iHoja} data-tone={TONO} className="tro-panel tro-panel--album" style={{ background: iHoja % 2 === 0 ? "#F6F1E7" : "#F1EBDF" }}>
                    <div className="tro-panel-top">
                      <span>{iHoja === 0 ? `${nAlbum} — ${tx("invitacion.album.titulo").toUpperCase()}` : tx("invitacion.album.hojaDeTotal", { n: String(iHoja + 1).padStart(2, "0"), total: String(hojasDeFotos.length).padStart(2, "0") }).toUpperCase()}</span>
                      {hojasDeFotos.length > 1 && <span>{String(iHoja + 1).padStart(2, "0")} / {String(hojasDeFotos.length).padStart(2, "0")}</span>}
                    </div>
                    {iHoja === 0 && (
                      <h2 className="tro-h2 tro-h2--album">{tx("invitacion.album.titulo")} <em>{tx("invitacion.album.deFotos")}</em></h2>
                    )}
                    <div className="tro-polaroids" data-cantidad={hoja.length}>
                      {hoja.map((url, i) => (
                        <div
                          key={i}
                          className="tro-polaroid"
                          role="button"
                          tabIndex={0}
                          onClick={() => setFotoAmpliada(url)}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setFotoAmpliada(url); }}
                          aria-label={tx("invitacion.album.ampliarFoto", { n: i + 1 })}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="" loading="lazy" className="tro-polaroid-img" />
                          {i % 2 === 0 && <span className="tro-chinche" aria-hidden="true" />}
                        </div>
                      ))}
                    </div>
                    <div className="tro-panel-pie">
                      <span>{tx("invitacion.album.fotosSubidas", { n: todasLasFotos.length }).toUpperCase()}</span>
                      {!scrollVertical && hojasDeFotos.length > 1 && <span className="tro-acento-plano">{tx("invitacion.portada.segui").toUpperCase()} →</span>}
                    </div>
                  </div>
                ))}
              </div>
              {!scrollVertical && hojasDeFotos.length > 1 && <Puntos cantidad={hojasDeFotos.length} />}
            </div>
          </div>
        )}

        {/* ── 07 Música ──────────────────────────────────────────────── */}
        {sugerenciaMusicaHabilitada && (
          <section id="songs" data-tone={TONO} data-screen-label={tx("invitacion.musica.titulo")} className="tro-section tro-musica">
            <div className="tro-trama" aria-hidden="true" />
            <span data-xin="1" data-dist="-20" className="tro-kicker">{nMusica} — {tx("invitacion.musica.titulo").toUpperCase()}</span>
            <h2 data-xin="1" data-delay="60" className="tro-h2">
              {tituloEnDosLineas(tx("invitacion.sabor.preguntaCancionFaltar"), "tro-acento")}
            </h2>
            <CancionesTropical
              invitationId={String(invitation.id ?? "")}
              guestToken={guest?.uniqueToken}
              guestName={nombreInvitado || tx("invitacion.evento.invitado")}
            />
          </section>
        )}

        {/* ── 08 Regalos ─────────────────────────────────────────────── */}
        {hayRegalos && (
          <section id="banco" data-tone={TONO} data-screen-label={tx("invitacion.regalos.titulo")} className="tro-section tro-regalos">
            <span data-xin="1" data-dist="-20" className="tro-kicker tro-kicker--tinta">{nRegalos} — {tx("invitacion.regalos.titulo").toUpperCase()}</span>
            <h2 data-xin="1" data-delay="60" className="tro-h2">
              {tx("invitacion.regalos.siQueresLinea1")}<br /><em>{tx("invitacion.regalos.siQueresLinea2")}</em>
            </h2>
            {Boolean(invitation.regaloMensaje) && (
              <p data-xin="1" data-delay="120" className="tro-parrafo tro-parrafo--tinta">{String(invitation.regaloMensaje)}</p>
            )}
            {regaloHabilitado && (
              <TarjetaBancaria
                titulo={String(invitation.regaloTitulo || tx("invitacion.regalos.tituloEvento"))}
                alias={String(invitation.regaloAlias || "")}
                cbu={String(invitation.regaloCbu || "")}
                banco={String(invitation.regaloBanco || "")}
                titular={String(invitation.regaloTitular || "")}
                retraso={180}
                dobleZ
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
                inclinada
              />
            )}
          </section>
        )}

        {/* ── 09 Trivia ──────────────────────────────────────────────── */}
        {quizHabilitado && (
          <section id="quiz" data-tone="dark" data-screen-label="Quiz" className="tro-section tro-quiz">
            <div className="tro-trama" aria-hidden="true" />
            <span data-xin="1" data-dist="-20" className="tro-kicker">{nQuiz} — {tx("invitacion.quiz.kicker").toUpperCase()}</span>
            <h2 data-xin="1" data-delay="60" className="tro-h2 tro-h2--claro">{triviaTitulo}</h2>
            <TriviaTropical
              preguntas={triviaPreguntas}
              invitationId={String(invitation.id ?? "")}
              guestToken={guest?.uniqueToken}
              guestName={nombreInvitado || tx("invitacion.evento.invitado")}
            />
          </section>
        )}

        {/* ── 10 Tu pase ─────────────────────────────────────────────── */}
        <section data-tone="dark" data-screen-label={tx("invitacion.pase.tuPase")} className="tro-section tro-pase">
          <div className="tro-trama" aria-hidden="true" />
          <span data-xin="1" data-dist="-20" className="tro-kicker">{nPase} — {tx("invitacion.pase.tuPase").toUpperCase()}</span>

          <div data-xin="1" data-delay="80" data-dist="30" className="tro-ticket">
            <div className="tro-ticket-izq">
              <span className="tro-ticket-kicker">{tx("invitacion.pase.numeroPase", { n: pase }).toUpperCase()}</span>
              <span className="tro-ticket-nombre">{saludaAlInvitado ? nombreInvitado : titulo}</span>
              <span className="tro-ticket-dato">
                {[
                  lugaresDelPase > 0 ? tx("invitacion.bienvenida.paraVarios", { cantidad: String(lugaresDelPase) }) : null,
                  guest?.mesas && guest.mesas.length > 0 ? guest.mesas.join(" · ") : null,
                ].filter(Boolean).join(" · ")}
              </span>
              <span className="tro-ticket-fecha">{fechaPuntos} — {hora} H</span>
              <span className="tro-ticket-muesca tro-ticket-muesca--arriba" aria-hidden="true" />
              <span className="tro-ticket-muesca tro-ticket-muesca--abajo" aria-hidden="true" />
            </div>
            <div className="tro-ticket-der">
              <QrDeIngreso guest={guest as never} />
            </div>
          </div>

          {/* Alojamiento, estacionamiento, transporte: lo que el anfitrión
              cargó en Info Adicional, con el vestido de esta sección. */}
          <div data-xin="1" data-delay="160" className="tro-info-extra">
            <InfoAdicionalSection invitation={invitation} />
          </div>

          <div className="tro-pase-pie">
            <span className="tro-pase-firma">{tx("invitacion.frase.conAmor")}, {titulo}</span>
            <div className="tro-pase-creditos">
              <LogoFooterCredit bgColor="transparent" />
              <span className="tro-replay" role="button" tabIndex={0} onClick={volverAVerla} onKeyDown={(e) => { if (e.key === "Enter") volverAVerla(); }}>
                {tx("invitacion.portada.verAperturaOtraVez").toUpperCase()} ↺
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* ── Riel de progreso ───────────────────────────────────────────── */}
      <div ref={rielRef} className="tro-riel">
        <span ref={rielTopRef} className="tro-riel-top">{tx("invitacion.pase.numeroPase", { n: pase }).toUpperCase()}</span>
        <div ref={rielLineaRef} className="tro-riel-linea">
          <span ref={rielBarraRef} className="tro-riel-barra" />
        </div>
        <span ref={rielEtiquetaRef} className="tro-riel-etiqueta">{tx("invitacion.saveTheDate.guardaLaFecha").toUpperCase()}</span>
      </div>

      {/* ── La portada ─────────────────────────────────────────────────── */}
      <div ref={portadaRef} data-tone={TONO} className="tro-portada">
        {/* La portada no tiene escena que levantar: lo que se va al abrir es la
            trama y el titular, y de eso se encarga el motor moviendo [data-cl]. */}
        <div ref={escenaPortadaRef} className="tro-portada-escena">
          <div data-cl="1" className="tro-trama" aria-hidden="true" />
        </div>
        <div className="tro-portada-contenido">
          <div className="tro-portada-arriba">
            <div ref={cartelRef} className="tro-cartel">
              <h1 className="tro-cartel-nombres">
                {saludaAlInvitado ? (
                  <span>{nombreInvitado}</span>
                ) : (
                  <>
                    <span>{nombre1}</span>
                    {nombre2 && <span className="tro-cartel-amp">&amp;</span>}
                    {nombre2 && <span>{nombre2}</span>}
                  </>
                )}
              </h1>
              <span className="tro-cartel-chinche" aria-hidden="true" />
            </div>
          </div>
          <div className="tro-portada-abajo">
            <div className="tro-portada-datos">
              <span className="tro-portada-saludo">
                {saludaAlInvitado
                  ? <>{tx("invitacion.bienvenida.hola", { nombre: nombreInvitado }).toUpperCase()} · <span className="tro-acento-plano">{titulo.toUpperCase()}</span></>
                  : <span className="tro-acento-plano">{tx(invitation.tipo === "CASAMIENTO" ? "invitacion.evento.nosCasamos" : invitation.tipo === "QUINCE_ANOS" ? "invitacion.evento.misQuinceAnos" : "invitacion.evento.teInvitamos").toUpperCase()}</span>}
              </span>
              <div className="tro-portada-fila">
                <span>{fechaPuntos}</span>
                <span className="tro-meta-punto" aria-hidden="true" />
                <span>{(lugarNombre || ciudad || direccion).toUpperCase()}</span>
              </div>
              {isPersonalized && guest && (
                <div className="tro-portada-pase">
                  <span>{tx("invitacion.pase.numeroPase", { n: pase }).toUpperCase()}</span>
                  <span>·</span>
                  <span>{tx("invitacion.bienvenida.paraVarios", { cantidad: String(lugaresDelPase) }).toUpperCase()}</span>
                  <span>·</span>
                  <span>{tx("invitacion.pase.noTransferible").toUpperCase()}</span>
                </div>
              )}
            </div>
            <button type="button" onClick={abrir} className="tro-portada-btn">
              {tx("invitacion.portada.abrirInvitacion").toUpperCase()}
            </button>
          </div>
        </div>
      </div>

      <div ref={pistaRef} className="tro-pista">{tx("invitacion.portada.desliza").toUpperCase()} ↓</div>

      {fotoAmpliada && (
        <div className="tro-lupa" onClick={() => setFotoAmpliada(null)} onContextMenu={(e) => e.preventDefault()}>
          <button
            type="button"
            className="tro-lupa-cerrar"
            onClick={(e) => { e.stopPropagation(); setFotoAmpliada(null); }}
            aria-label={tx("invitacion.cerrar")}
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fotoAmpliada} alt={tx("invitacion.album.fotoAmpliada")} className="tro-lupa-img" draggable={false} onClick={(e) => e.stopPropagation()} />
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


// ───────────────────────────────────────────────────────────────────────────
// Piezas de la colección
// ───────────────────────────────────────────────────────────────────────────

/** Los puntos que dicen en qué panel del recorrido estamos. */
function Puntos({ cantidad }: { cantidad: number }) {
  if (cantidad <= 1) return null;
  return (
    <div className="tro-puntos" aria-hidden="true">
      {Array.from({ length: cantidad }).map((_, i) => (
        <span key={i} data-dot={i} className="tro-punto" style={{ background: i === 0 ? PALETA.acc : "rgba(43,42,51,.18)" }} />
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
function CuentaTropical({ targetDate }: { targetDate: Date }) {
  const tx = useTextos();
  const { time, isEventDay, isPast, hasEnded } = useCountdown(targetDate);

  if (isEventDay || hasEnded || isPast) {
    return (
      <div className="tro-tarjeta tro-tarjeta--hoy" data-xin="1" data-delay="80" data-dist="30">
        <span className="tro-tarjeta-kicker">{tx("invitacion.cuentaRegresiva.kicker").toUpperCase()}</span>
        <span className="tro-tarjeta-titulo">
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
    <div className="tro-cuenta">
      {celdas.map((c, i) => (
        <div key={c.l} data-xin="1" data-delay={80 + i * 80} data-dist="30" className={`tro-cuenta-caja tro-cuenta-caja--${i + 1}`}>
          <span className={`tro-cuenta-num${i === 3 ? " tro-cuenta-num--acc" : ""}`}>{c.v}</span>
          <span className="tro-cuenta-etq">{c.l.toUpperCase()}</span>
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
    <div className="tro-fila tro-fila--copiable">
      <div className="tro-fila-texto">
        <span className="tro-fila-etq">{etiqueta.toUpperCase()}</span>
        <span className="tro-fila-dato">{valor}</span>
      </div>
      <button type="button" onClick={copiar} className={`tro-btn-copiar${copiado ? " tro-btn-copiar--hecho" : ""}`}>
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
      className={`tro-tarjeta tro-tarjeta--banco${dobleZ ? " tro-doblez" : ""}${inclinada ? " tro-tarjeta--der" : " tro-tarjeta--izq"}`}
    >
      <span className="tro-tarjeta-kicker">{titulo.toUpperCase()}</span>
      {mensaje && <p className="tro-tarjeta-mensaje">{mensaje}</p>}
      <div className="tro-filas">
        <FilaCopiable etiqueta="Alias" valor={alias} />
        <FilaCopiable etiqueta="CBU" valor={cbu} />
        {(banco || titular) && (
          <div className="tro-fila tro-fila--ultima">
            <span>{banco || tx("invitacion.regalos.banco")}</span>
            <span className="tro-fila-valor">{titular}</span>
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
function CheckinTropical({
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
      <div data-xin="1" data-delay="140" data-dist="30" className="tro-tarjeta tro-tarjeta--izq">
        <p className="tro-tarjeta-mensaje">{tx("invitacion.rsvp.graciasPorAvisarAcceso")}</p>
        <button type="button" className="tro-btn-fantasma" onClick={() => setEstado("PENDING")}>
          {tx("invitacion.rsvp.cambieDeIdea").toUpperCase()}
        </button>
      </div>
    );
  }

  const confirmadoYa = estado === "CONFIRMED";

  return (
    <>
      <div ref={tarjetaRef} data-xin="1" data-delay="140" data-dist="30" className="tro-tarjeta tro-tarjeta--talon">
        <div className="tro-talon-top">
          <span>{tx("invitacion.pase.numeroPase", { n: pase }).toUpperCase()}{guestName ? ` · ${guestName.toUpperCase()}` : ""}</span>
          <span ref={estadoRef} className="tro-talon-estado">
            {confirmado || confirmadoYa ? tx("invitacion.pase.accesoConfirmado").toUpperCase() : tx("invitacion.pase.pendiente").toUpperCase()}
          </span>
        </div>

        {!confirmadoYa ? (
          <>
            {lugares > 1 && (
              <div className="tro-campo">
                <label className="tro-etiqueta">{tx("invitacion.rsvp.adultos").toUpperCase()}</label>
                <div className="tro-contador">
                  <button type="button" onClick={() => setAdultos((v) => Math.max(1, v - 1))} disabled={adultos <= 1} aria-label="−">−</button>
                  <span>{adultos}</span>
                  <button type="button" onClick={() => setAdultos((v) => Math.min(maxAdultos, v + 1))} disabled={adultos >= maxAdultos} aria-label="+">+</button>
                </div>
              </div>
            )}
            {maxAdolescentes > 0 && (
              <div className="tro-campo">
                <label className="tro-etiqueta">{tx("invitacion.rsvp.adolescentes").toUpperCase()}</label>
                <div className="tro-contador">
                  <button type="button" onClick={() => setAdolescentes((v) => Math.max(0, v - 1))} disabled={adolescentes <= 0} aria-label="−">−</button>
                  <span>{adolescentes}</span>
                  <button type="button" onClick={() => setAdolescentes((v) => Math.min(maxAdolescentes, v + 1))} disabled={adolescentes >= maxAdolescentes} aria-label="+">+</button>
                </div>
              </div>
            )}
            {maxNinos > 0 && (
              <div className="tro-campo">
                <label className="tro-etiqueta">{tx("invitacion.rsvp.ninos").toUpperCase()}</label>
                <div className="tro-contador">
                  <button type="button" onClick={() => setNinos((v) => Math.max(0, v - 1))} disabled={ninos <= 0} aria-label="−">−</button>
                  <span>{ninos}</span>
                  <button type="button" onClick={() => setNinos((v) => Math.min(maxNinos, v + 1))} disabled={ninos >= maxNinos} aria-label="+">+</button>
                </div>
              </div>
            )}
            <div className="tro-campo">
              <label className="tro-etiqueta">{tx("invitacion.rsvp.restriccionAlimentaria").toUpperCase()}</label>
              <input
                value={dieta}
                onChange={(e) => setDieta(e.target.value)}
                placeholder="—"
                maxLength={120}
                className="tro-input"
              />
            </div>
          </>
        ) : (
          <div className="tro-filas">
            {lugares > 1 && adultos > 0 && <div className="tro-fila"><span>{tx("invitacion.rsvp.adultos")}</span><span>{adultos}</span></div>}
            {adolescentes > 0 && <div className="tro-fila"><span>{tx("invitacion.rsvp.adolescentes")}</span><span>{adolescentes}</span></div>}
            {ninos > 0 && <div className="tro-fila"><span>{tx("invitacion.rsvp.ninos")}</span><span>{ninos}</span></div>}
            <div className="tro-fila tro-fila--ultima">
              <span>{tx("invitacion.rsvp.restriccionAlimentaria")}</span>
              <span className="tro-fila-valor">{restricciones || dieta || "—"}</span>
            </div>
          </div>
        )}

        {hayPago && monto != null && !exento && (
          <div className="tro-precio">
            <span>{estadoDePago === "PAID" ? tx("invitacion.pago.abonado") : tx("invitacion.pago.valor")}</span>
            <div className="tro-precio-valor">
              <span className="tro-precio-total">{formatearMoneda(totalAPagar)}</span>
              {usarTotalDelServidor && vistaDePago
                ? vistaDePago.lines.map((l, i) => <span key={i} className="tro-precio-detalle">{l}</span>)
                : (
                  <>
                    {adultos > 0 && <span className="tro-precio-detalle">{adultos} × {formatearMoneda(precioAdulto)}</span>}
                    {adolescentes > 0 && <span className="tro-precio-detalle">{adolescentes} × {formatearMoneda(precioAdo)}</span>}
                    {ninos > 0 && <span className="tro-precio-detalle">{ninos} × {formatearMoneda(precioNin)}</span>}
                  </>
                )}
            </div>
          </div>
        )}

        <div ref={selloRef} className="tro-sello" aria-hidden="true">{tx("invitacion.pase.confirmado").toUpperCase()}</div>
        <div ref={petalosRef} className="tro-petalos" aria-hidden="true" />
      </div>

      {error && <p className="tro-error">{error}</p>}

      {!confirmadoYa ? (
        <>
          <button type="button" data-xin="1" data-delay="220" className="tro-btn-solido" disabled={enviando} onClick={() => enviar("CONFIRMA")}>
            {enviando ? tx("invitacion.rsvp.guardando").toUpperCase() : tx("invitacion.rsvp.confirmarAsistencia").toUpperCase()}
          </button>
          <button type="button" data-xin="1" data-delay="280" className="tro-btn-fantasma" disabled={enviando} onClick={() => enviar("NO_ASISTE")}>
            {tx("invitacion.rsvp.noVoyAPoderAsistir").toUpperCase()}
          </button>
        </>
      ) : (
        <button type="button" className="tro-btn-fantasma" onClick={() => setEstado("PENDING")}>
          {tx("invitacion.rsvp.modificarAsistencia").toUpperCase()}
        </button>
      )}
    </>
  );
}

interface CancionItem { id: string; title: string; artist: string; guestName: string }

/** Sugerir una canción, en una tarjeta de papel con la lista debajo. */
function CancionesTropical({ invitationId, guestToken, guestName }: { invitationId: string; guestToken?: string; guestName: string }) {
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
      <form onSubmit={enviar} data-xin="1" data-delay="140" data-dist="30" className="tro-tarjeta tro-tarjeta--der">
        <div className="tro-campo">
          <label className="tro-etiqueta">{tx("invitacion.musica.tema").toUpperCase()}</label>
          <input value={tema} onChange={(e) => setTema(e.target.value)} placeholder={tx("invitacion.musica.nombreDeLaCancion")} maxLength={100} className="tro-input tro-input--serif" />
        </div>
        <div className="tro-campo">
          <label className="tro-etiqueta">{tx("invitacion.musica.artista").toUpperCase()}</label>
          <input value={artista} onChange={(e) => setArtista(e.target.value)} placeholder={tx("invitacion.musica.artista")} maxLength={80} className="tro-input tro-input--serif" />
        </div>
        {error && <p className="tro-error">{error}</p>}
        <button type="submit" disabled={enviando} className="tro-btn-solido tro-btn-solido--tinta">
          {enviando ? tx("invitacion.musica.enviando").toUpperCase() : tx("invitacion.musica.sugeriUnaCancion").toUpperCase()}
        </button>
      </form>

      {canciones.length > 0 && (
        <div data-xin="1" data-delay="220" className="tro-lista">
          {canciones.slice(0, 8).map((c) => (
            <div key={c.id} className="tro-lista-fila">
              <div className="tro-lista-texto">
                <span className="tro-lista-tema">{c.title}</span>
                <span className="tro-lista-quien">{c.artist} · {tx("invitacion.musica.sumadoPor")} {c.guestName || tx("invitacion.evento.invitado")}</span>
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
function TriviaTropical({ preguntas, invitationId, guestToken, guestName }: { preguntas: QuizPregunta[]; invitationId: string; guestToken?: string; guestName: string }) {
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
      <div data-xin="1" data-delay="140" data-dist="30" className="tro-tarjeta tro-tarjeta--izq">
        <span className="tro-tarjeta-kicker">{tx("invitacion.quiz.kicker").toUpperCase()}</span>
        <span className="tro-tarjeta-titulo">
          {guardando ? tx("invitacion.rsvp.guardando") : tx("invitacion.quiz.respondisteCorrectamente", { aciertos: puntaje, total: preguntas.length })}
        </span>
        {!guardando && stats && stats.count > 0 && (
          <p className="tro-tarjeta-mensaje">{tx("invitacion.quiz.promedio", { n: stats.count, avg: stats.avg })}</p>
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
    <div data-xin="1" data-delay="140" data-dist="30" className="tro-tarjeta tro-tarjeta--izq">
      <span className="tro-tarjeta-kicker">{tx("invitacion.quiz.preguntaDeTotal", { n: indice + 1, total: preguntas.length }).toUpperCase()}</span>
      <span className="tro-tarjeta-pregunta">{q.pregunta}</span>
      <div className="tro-opciones">
        {q.opciones.map((op, oi) => {
          let clase = "";
          if (yaEligio && correcta !== undefined) {
            if (oi === correcta) clase = " tro-opcion--bien";
            else if (elegidas[indice] === oi) clase = " tro-opcion--mal";
          }
          return (
            <button key={oi} type="button" disabled={yaEligio} onClick={() => elegir(oi)} className={`tro-opcion${clase}`}>
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
// leen la Bienvenida y el Post-evento compartidos (esperan `tro-section` y
// `tro-kicker`).
const CSS_TRO = `
  .tro-raiz { position: fixed; inset: 0; width: 100%; height: calc(var(--vh, 1vh) * 100); overflow: hidden;
    background: var(--pp-bg); color: var(--pp-ink); font-family: var(--tro-sans), 'Quicksand', sans-serif; }
  .tro-raiz a { color: var(--pp-acc); text-decoration: none; }
  .tro-raiz button { font: inherit; }
  .tro-defs { position: absolute; width: 0; height: 0; overflow: hidden; }

  .tro-scroller { position: absolute; inset: 0; overflow-y: auto; overflow-x: hidden; opacity: 0;
    transition: opacity 900ms ease 260ms; scrollbar-width: none; }
  .tro-scroller::-webkit-scrollbar { width: 0; height: 0; }

  @keyframes ppFloat { 0%,100% { transform: translate(0,0) rotate(0deg); } 50% { transform: translate(6px,-14px) rotate(8deg); } }
  @keyframes ppDrift { 0% { transform: translateX(-14px); } 100% { transform: translateX(14px); } }
  @keyframes ppSway { 0%,100% { transform: rotate(-1.4deg); } 50% { transform: rotate(1.4deg); } }
  @keyframes ppBreath { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-16px); } }
  @keyframes ppRibbon { 0%,100% { transform: skewY(0deg) translateX(0); } 50% { transform: skewY(2deg) translateX(3px); } }
  @keyframes ppBlink { 0%,94%,100% { transform: scaleY(1); } 97% { transform: scaleY(.1); } }
  @keyframes ppFly1 { 0% { transform: translate(0,0) rotate(-6deg); } 25% { transform: translate(26px,-22px) rotate(6deg); } 50% { transform: translate(54px,-4px) rotate(-4deg); } 75% { transform: translate(24px,16px) rotate(8deg); } 100% { transform: translate(0,0) rotate(-6deg); } }
  @keyframes ppFly2 { 0% { transform: translate(0,0) rotate(4deg); } 30% { transform: translate(-30px,-18px) rotate(-8deg); } 60% { transform: translate(-48px,10px) rotate(6deg); } 100% { transform: translate(0,0) rotate(4deg); } }
  @keyframes ppWingL { 0%,100% { transform: scaleX(1); } 50% { transform: scaleX(.28); } }
  @keyframes ppWingR { 0%,100% { transform: scaleX(1); } 50% { transform: scaleX(.28); } }
  @keyframes ppNoteUp { 0% { transform: translate(0,0) rotate(-8deg) scale(.7); opacity: 0; } 15% { opacity: .9; } 70% { opacity: .7; } 100% { transform: translate(26px,-120px) rotate(12deg) scale(1); opacity: 0; } }
  @keyframes ppNoteUp2 { 0% { transform: translate(0,0) rotate(6deg) scale(.6); opacity: 0; } 18% { opacity: .85; } 100% { transform: translate(-30px,-140px) rotate(-14deg) scale(1); opacity: 0; } }
  @keyframes ppBeat { 0%,100% { transform: scaleY(.3); } 50% { transform: scaleY(1); } }
  @keyframes ppWindow { 0%,100% { opacity: .18; } 50% { opacity: .5; } }
  @keyframes ppSpin { 0%,100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }
  @keyframes ppGlow { 0%,100% { filter: drop-shadow(0 8px 16px rgba(0,0,0,.14)) brightness(1); } 50% { filter: drop-shadow(0 8px 22px rgba(255,240,200,.5)) brightness(1.12); } }
  @keyframes ppFall { 0% { transform: translate(0,-20px) rotate(0deg); opacity: 0; } 12% { opacity: .9; } 100% { transform: translate(34px,180px) rotate(220deg); opacity: 0; } }
  @keyframes ppHint { 0%,100% { transform: translateY(0); } 50% { transform: translateY(7px); } }
  @keyframes ppSide { 0%,100% { transform: translateX(0); } 50% { transform: translateX(7px); } }
  @keyframes ppTwinkle { 0%,100% { opacity: .3; } 50% { opacity: 1; } }

  /* Lo que entra al scrollear se mueve en --tro-y y gira en --tro-giro: son
     dos cosas distintas (el gesto de entrada y la inclinación del papel
     apoyado) y tienen que poder convivir en un mismo transform. */
  .tro-scroller [data-xin] { transform: translate3d(0, var(--tro-y, 0px), 0) rotate(var(--tro-giro, 0deg)); }

  /* Las escenas del mockup: quedan detrás y no atajan ningún toque. */
  .tro-escena { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; }

  /* ── Secciones ─────────────────────────────────────────────────────── */
  .tro-section { min-height: calc(var(--vh, 1vh) * 100); position: relative; overflow: hidden; display: flex;
    flex-direction: column; justify-content: center; gap: 22px;
    padding: 90px max(24px, calc((100% - 560px) / 2)) 110px; }
  .tro-kicker { position: relative; z-index: 1; font-size: 11px; letter-spacing: .3em; color: var(--pp-acc); }
  .tro-kicker--tinta { color: var(--pp-ink); }
  .tro-h2 { position: relative; z-index: 1; margin: 0; font-family: var(--tro-serif), 'Lilita One', cursive;
    font-weight: 400; font-size: clamp(40px, 11vw, 64px); line-height: .96; color: inherit; }
  .tro-h2 em, .tro-acento { font-style: italic; color: var(--pp-acc); }
  .tro-h2--claro { color: var(--pp-night-ink); }
  .tro-h2--album { font-size: clamp(38px, 10vw, 56px); }
  .tro-acento-plano { color: var(--pp-acc); }
  .tro-parrafo { position: relative; z-index: 1; margin: 0; font-size: 15px; line-height: 1.55; color: var(--pp-ink2); max-width: 420px; }
  .tro-parrafo--tinta { color: var(--pp-ink); }
  .tro-meta { position: relative; z-index: 1; display: flex; flex-wrap: wrap; align-items: center; gap: 10px 18px;
    font-size: 14px; letter-spacing: .12em; color: var(--pp-ink2); }
  .tro-meta-punto { width: 4px; height: 4px; border-radius: 50%; background: var(--pp-acc); display: inline-block; }

  /* ── 01 Guardá la fecha ────────────────────────────────────────────── */
  .tro-std { justify-content: flex-end; gap: 22px; padding: 46vh max(24px, calc((100% - 560px) / 2)) 90px;
    background: linear-gradient(180deg, var(--pp-sky1) 0%, var(--pp-sky2) 48%, var(--pp-bg) 62%); }
  .tro-std-fecha { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 6px; }
  .tro-std-dia { font-family: var(--tro-serif), 'Lilita One', cursive; font-weight: 500;
    font-size: clamp(120px, 34vw, 200px); line-height: .8; letter-spacing: -.04em; color: var(--pp-ink);
    text-shadow: 0 2px 0 rgba(0,0,0,.12), 0 8px 14px rgba(0,0,0,.08); }
  .tro-std-fila { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
  .tro-cinta { display: inline-block; padding: 8px 26px; background: var(--pp-acc); color: ${CARTA};
    font-family: var(--tro-serif), 'Lilita One', cursive; font-style: italic; font-size: clamp(30px, 8vw, 44px);
    line-height: 1; clip-path: polygon(0 0, 100% 0, 94% 50%, 100% 100%, 0 100%, 6% 50%);
    box-shadow: 0 2px 0 rgba(0,0,0,.12); animation: ppRibbon 4s ease-in-out infinite; text-transform: capitalize; }
  .tro-std-anio { font-family: var(--tro-serif), 'Lilita One', cursive; font-size: clamp(30px, 8vw, 44px); line-height: 1; color: var(--pp-ink); }

  /* ── Nuestra foto: la ventana troquelada ───────────────────────────── */
  .tro-foto-seccion { position: relative; overflow: hidden; padding: 20px max(24px, calc((100% - 900px) / 2)) 70px; background: var(--pp-bg); }
  .tro-foto-marco { position: relative; width: 100%; max-width: 900px; margin: 0 auto; aspect-ratio: 4 / 5; max-height: 78vh; }
  .tro-ventana { position: absolute; inset: 0; overflow: hidden;
    clip-path: inset(44% 38% 44% 38% round 999px 999px 14px 14px);
    background: repeating-linear-gradient(135deg, #DCD7CB 0 8px, #E9E5DC 8px 16px);
    box-shadow: inset 0 0 0 4px rgba(200,107,90,.55), inset 0 0 60px rgba(200,107,90,.28);
    transition: clip-path 120ms linear; }
  .tro-foto-capa { position: absolute; inset: 0; }
  .tro-foto-firma { position: absolute; left: 6%; bottom: -26px; padding: 12px 18px; background: ${CARTA}; color: ${CARTA_TINTA};
    font-family: var(--tro-serif), 'Lilita One', cursive; font-style: italic; font-size: 20px;
    box-shadow: 0 2px 0 rgba(0,0,0,.12), 0 8px 14px rgba(0,0,0,.08); transform: rotate(-2deg); }

  /* ── 02 Falta poco ─────────────────────────────────────────────────── */
  .tro-countdown { background: linear-gradient(180deg, var(--pp-bg), var(--pp-bg2)); }
  .tro-cuenta { position: relative; z-index: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 16px 14px; max-width: 460px; }
  .tro-cuenta-caja { position: relative; background: ${CARTA}; color: ${CARTA_TINTA}; padding: 20px 16px 16px;
    display: flex; flex-direction: column; gap: 6px; box-shadow: 0 2px 0 rgba(0,0,0,.12), 0 8px 14px rgba(0,0,0,.08); }
  /* La esquina doblada: el mismo triángulo de papel del mockup. */
  .tro-cuenta-caja::before { content: ""; position: absolute; right: 0; top: 0; border-style: solid; border-width: 0 20px 20px 0;
    border-color: var(--pp-bg) var(--pp-bg) ${CARTA_LINEA} ${CARTA_LINEA}; }
  .tro-cuenta-caja--1 { --tro-giro: -1.6deg; transform: rotate(var(--tro-giro)); }
  .tro-cuenta-caja--2 { --tro-giro: 1.2deg; transform: rotate(var(--tro-giro)); margin-top: 10px; }
  .tro-cuenta-caja--3 { --tro-giro: 1.8deg; transform: rotate(var(--tro-giro)); }
  .tro-cuenta-caja--4 { --tro-giro: -1.1deg; transform: rotate(var(--tro-giro)); margin-top: 10px; }
  .tro-cuenta-num { font-family: var(--tro-serif), 'Lilita One', cursive; font-size: clamp(56px, 15vw, 84px); line-height: .85; font-variant-numeric: tabular-nums; }
  .tro-cuenta-num--acc { color: var(--pp-acc); }
  .tro-cuenta-etq { font-size: 12px; letter-spacing: .26em; color: var(--pp-ink2); }

  /* ── 03 Unas palabras ──────────────────────────────────────────────── */
  .tro-frase-seccion { gap: 36px; padding: 100px max(24px, calc((100% - 620px) / 2)); background: var(--pp-bg2); }
  .tro-frase { position: relative; z-index: 1; margin: 0; font-family: var(--tro-serif), 'Lilita One', cursive;
    font-weight: 400; font-size: clamp(40px, 11.5vw, 76px); line-height: 1; letter-spacing: -.01em; text-wrap: pretty; }
  .tro-firma { position: relative; z-index: 1; display: flex; align-items: center; gap: 14px; font-size: 14px; letter-spacing: .14em; color: var(--pp-ink2); }
  .tro-firma-linea { width: 44px; height: 1.5px; background: var(--pp-acc); display: inline-block; }

  /* ── Paneles del recorrido ─────────────────────────────────────────── */
  .tro-pan { height: calc(100vh + var(--st-pasos, 2) * 90vh); position: relative; }
  .tro-pan-fijo { position: sticky; top: 0; height: calc(var(--vh, 1vh) * 100); overflow: hidden; }
  .tro-tira { position: absolute; top: 0; left: 0; height: 100%; display: flex; will-change: transform; }
  .tro-panel { flex: 0 0 100vw; min-width: 0; height: 100%; box-sizing: border-box; position: relative; overflow: hidden;
    display: flex; flex-direction: column; gap: 18px; padding: 80px max(24px, calc((100vw - 560px) / 2)) 96px; }
  .tro-panel--abajo { justify-content: flex-end; }
  .tro-panel--centro { justify-content: center; }
  .tro-panel--album { gap: 14px; padding: clamp(52px, 8vh, 80px) max(24px, calc((100vw - 900px) / 2)) clamp(60px, 10vh, 96px); color: ${CARTA_TINTA}; }
  /* Apilado: los mismos paneles, uno abajo del otro, recorridos bajando. */
  .tro-pan[data-scroll="vertical"] { height: auto; }
  .tro-pan[data-scroll="vertical"] .tro-pan-fijo { position: static; height: auto; overflow: visible; }
  .tro-pan[data-scroll="vertical"] .tro-tira { position: static; display: block; width: 100%; transform: none !important; }
  .tro-pan[data-scroll="vertical"] .tro-panel { height: auto; min-height: calc(var(--vh, 1vh) * 100); }
  .tro-panel-top { position: relative; z-index: 1; display: flex; justify-content: space-between; gap: 12px;
    font-size: 11px; letter-spacing: .3em; color: var(--pp-acc); }
  .tro-panel-pie { position: relative; z-index: 1; display: flex; justify-content: space-between; gap: 12px;
    font-size: 12px; letter-spacing: .22em; color: var(--pp-ink2); margin-top: auto; }
  .tro-seguir { position: relative; z-index: 1; display: flex; align-items: center; gap: 10px; font-size: 12px;
    letter-spacing: .24em; color: var(--pp-ink2); }
  .tro-flecha { display: inline-block; animation: ppSide 2.2s ease-in-out infinite; }
  .tro-puntos { position: absolute; left: 0; right: 34px; bottom: 26px; display: flex; gap: 6px; justify-content: center; z-index: 2; }
  .tro-punto { width: 22px; height: 3px; transition: background 400ms ease; display: inline-block; }

  /* ── Tarjetas de papel ─────────────────────────────────────────────── */
  .tro-tarjeta { position: relative; z-index: 1; background: ${CARTA}; color: ${CARTA_TINTA}; padding: 22px 20px;
    display: flex; flex-direction: column; gap: 12px; box-shadow: 0 2px 0 rgba(0,0,0,.12), 0 8px 14px rgba(0,0,0,.08); }
  .tro-tarjeta--izq { --tro-giro: -1deg; transform: rotate(var(--tro-giro)); }
  .tro-tarjeta--der { --tro-giro: 1.1deg; transform: rotate(var(--tro-giro)); }
  .tro-tarjeta--talon { --tro-giro: -.8deg; transform: rotate(var(--tro-giro)); overflow: visible; }
  .tro-tarjeta--hoy { --tro-giro: -1deg; transform: rotate(var(--tro-giro)); align-items: flex-start; }
  .tro-tarjeta--banco { margin-top: 4px; }
  .tro-doblez::before { content: ""; position: absolute; right: 0; top: 0; border-style: solid; border-width: 0 22px 22px 0;
    border-color: var(--pp-bg2) var(--pp-bg2) ${CARTA_LINEA} ${CARTA_LINEA}; }
  .tro-tarjeta-kicker { font-size: 12px; letter-spacing: .26em; color: var(--pp-ink2); }
  .tro-tarjeta-titulo { margin: 0; font-family: var(--tro-serif), 'Lilita One', cursive; font-weight: 500;
    font-size: clamp(30px, 8vw, 48px); line-height: .98; }
  .tro-tarjeta-pregunta { font-family: var(--tro-serif), 'Lilita One', cursive; font-size: 26px; line-height: 1.15; }
  .tro-tarjeta-mensaje { margin: 0; font-size: 14px; line-height: 1.5; color: var(--pp-ink2); }

  .tro-filas { display: flex; flex-direction: column; gap: 10px; font-size: 14px; line-height: 1.4; }
  .tro-fila { display: flex; justify-content: space-between; gap: 12px; border-bottom: 1px solid ${CARTA_LINEA}; padding-bottom: 8px; }
  .tro-fila > span:first-child { color: var(--pp-ink2); }
  .tro-fila--ultima { border-bottom: none; padding-bottom: 0; }
  .tro-fila-valor { text-align: right; }
  .tro-fila--copiable { align-items: center; }
  .tro-fila-texto { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .tro-fila-etq { font-size: 12px; letter-spacing: .18em; color: var(--pp-ink2); }
  .tro-fila-dato { font-size: 15px; font-weight: 500; overflow-wrap: anywhere; }
  .tro-btn-copiar { flex-shrink: 0; min-height: 44px; padding: 0 14px; border: 1.5px solid ${CARTA_TINTA}; background: transparent;
    color: ${CARTA_TINTA}; font-size: 13px; letter-spacing: .12em; cursor: pointer; }
  .tro-btn-copiar--hecho { background: ${CARTA_TINTA}; color: ${CARTA}; }

  /* ── Check-in ──────────────────────────────────────────────────────── */
  .tro-checkin { background: var(--pp-bg); }
  .tro-talon-top { display: flex; justify-content: space-between; align-items: center; gap: 10px; font-size: 12px; letter-spacing: .24em; color: var(--pp-ink2); }
  .tro-talon-estado { transition: color 400ms ease; flex-shrink: 0; }
  .tro-campo { display: flex; flex-direction: column; gap: 6px; }
  .tro-etiqueta { font-size: 12px; letter-spacing: .2em; color: var(--pp-ink2); }
  .tro-contador { display: flex; align-items: center; gap: 12px; }
  .tro-contador button { width: 48px; height: 48px; border: 1.5px solid ${CARTA_TINTA}; background: transparent; color: ${CARTA_TINTA}; font-size: 22px; line-height: 1; cursor: pointer; }
  .tro-contador button:disabled { opacity: .35; cursor: default; }
  .tro-contador > span { font-family: var(--tro-serif), 'Lilita One', cursive; font-size: 40px; min-width: 40px; text-align: center; line-height: 1; }
  .tro-input { min-height: 44px; border: none; border-bottom: 1.5px solid #CFC4AE; background: transparent; color: ${CARTA_TINTA};
    font-family: var(--tro-sans), 'Quicksand', sans-serif; font-size: 16px; padding: 6px 2px; }
  .tro-input--serif { font-family: var(--tro-serif), 'Lilita One', cursive; font-size: 20px; }
  .tro-input:focus { outline: none; border-bottom-color: var(--pp-acc); }
  .tro-input::placeholder { color: #9A9388; }
  .tro-precio { display: flex; justify-content: space-between; gap: 12px; border-top: 1px dashed #CFC4AE; padding-top: 12px; font-size: 14px; color: var(--pp-ink2); }
  .tro-precio-valor { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
  .tro-precio-total { font-family: var(--tro-serif), 'Lilita One', cursive; font-size: 26px; line-height: 1; color: ${CARTA_TINTA}; }
  .tro-precio-detalle { font-size: 12px; color: var(--pp-ink2); }
  .tro-sello { position: absolute; right: 14px; top: 44px; width: 92px; height: 92px; border-radius: 50%;
    background: var(--pp-acc); color: ${CARTA}; display: flex; align-items: center; justify-content: center; text-align: center;
    font-size: 11px; letter-spacing: .2em; line-height: 1.3; opacity: 0; transform: scale(1.6) rotate(-20deg);
    box-shadow: 0 2px 0 rgba(0,0,0,.15); pointer-events: none;
    clip-path: polygon(50% 0%, 61% 5%, 71% 2%, 79% 10%, 90% 11%, 93% 22%, 100% 30%, 97% 42%, 100% 52%, 95% 63%, 96% 75%, 88% 82%, 84% 93%, 72% 94%, 63% 100%, 50% 96%, 37% 100%, 28% 94%, 16% 93%, 12% 82%, 4% 75%, 5% 63%, 0% 52%, 3% 42%, 0% 30%, 7% 22%, 10% 11%, 21% 10%, 29% 2%, 39% 5%); }
  .tro-petalos { position: absolute; inset: 0; pointer-events: none; overflow: visible; }
  .tro-error { position: relative; z-index: 1; margin: 0; font-size: 13px; color: var(--pp-acc); }

  /* ── Botones ───────────────────────────────────────────────────────── */
  .tro-btn-solido { position: relative; z-index: 1; display: inline-flex; align-items: center; justify-content: center; gap: 10px;
    min-height: 52px; padding: 0 22px; border: none; background: var(--pp-acc); color: ${CARTA};
    font-family: var(--tro-sans), 'Quicksand', sans-serif; font-size: 14px; letter-spacing: .2em; cursor: pointer;
    box-shadow: 0 2px 0 rgba(0,0,0,.12), 0 8px 14px rgba(0,0,0,.08); }
  .tro-btn-solido--tinta { background: var(--pp-ink); color: var(--pp-btn-fg); }
  .tro-btn-solido:disabled { opacity: .6; cursor: default; }
  .tro-btn-fantasma { position: relative; z-index: 1; display: inline-flex; align-items: center; justify-content: center;
    min-height: 48px; padding: 0 22px; background: transparent; color: var(--pp-ink); border: 1.5px solid var(--pp-ink);
    font-size: 13px; letter-spacing: .18em; cursor: pointer; }
  .tro-btn-papel { position: relative; z-index: 1; display: inline-flex; align-items: center; gap: 10px; min-height: 48px;
    padding: 0 22px; align-self: flex-start; border: 1.5px solid var(--pp-ink); color: var(--pp-ink); font-size: 14px;
    letter-spacing: .14em; background: ${CARTA}; box-shadow: 0 2px 0 rgba(0,0,0,.12), 0 8px 14px rgba(0,0,0,.08);
    --tro-giro: -1deg; transform: rotate(var(--tro-giro)); text-decoration: none; }

  /* ── Mapa ──────────────────────────────────────────────────────────── */
  .tro-mapa { position: relative; z-index: 1; height: 180px; border: 1.5px solid ${CARTA_LINEA}; background: ${CARTA}; overflow: hidden;
    box-shadow: 0 2px 0 rgba(0,0,0,.12), 0 8px 14px rgba(0,0,0,.08); }

  /* ── Cronograma ────────────────────────────────────────────────────── */
  .tro-crono { position: relative; z-index: 1; display: flex; flex-direction: column; border-left: 2px solid var(--pp-acc); margin-left: 6px; }
  .tro-crono-fila { display: flex; gap: 18px; padding: 10px 0 10px 18px; align-items: baseline; }
  .tro-crono-hora { font-family: var(--tro-serif), 'Lilita One', cursive; font-size: 26px; min-width: 64px; line-height: 1; }
  .tro-crono-titulo { font-size: 15px; }

  /* ── Álbum ─────────────────────────────────────────────────────────── */
  .tro-polaroids { position: relative; z-index: 1; flex: 1; min-height: 0; display: grid; grid-template-columns: repeat(6, 1fr);
    gap: 14px; max-width: 900px; width: 100%; margin: 0 auto; align-content: start; }
  .tro-polaroid { position: relative; background: #FDFBF6; padding: 8px 8px 30px; min-height: 0; display: flex;
    box-shadow: 0 2px 0 rgba(0,0,0,.12), 0 8px 14px rgba(0,0,0,.08); cursor: pointer; grid-column: span 2; }
  .tro-polaroids[data-cantidad="1"] .tro-polaroid { grid-column: span 6; }
  .tro-polaroids[data-cantidad="2"] .tro-polaroid { grid-column: span 3; }
  .tro-polaroids[data-cantidad="4"] .tro-polaroid { grid-column: span 3; }
  .tro-polaroids[data-cantidad="5"] .tro-polaroid:nth-child(-n+2) { grid-column: span 3; }
  .tro-polaroid:nth-child(odd) { transform: rotate(-2deg); }
  .tro-polaroid:nth-child(even) { transform: rotate(1.5deg); margin-top: 14px; }
  .tro-polaroid-img { width: 100%; height: 100%; min-height: 120px; object-fit: cover; display: block;
    background: repeating-linear-gradient(135deg, #DCD7CB 0 8px, #E9E5DC 8px 16px); }
  .tro-chinche { position: absolute; left: 50%; top: -10px; width: 18px; height: 18px; margin-left: -9px; border-radius: 50%;
    background: radial-gradient(circle at 34% 30%, #fff 0 14%, var(--pp-acc) 16% 68%, rgba(0,0,0,.45) 70%);
    box-shadow: 0 3px 4px rgba(0,0,0,.32); }

  /* ── Música ────────────────────────────────────────────────────────── */
  .tro-musica { background: linear-gradient(180deg, var(--pp-bg2), var(--pp-sky2)); }
  .tro-lista { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 10px; max-height: 200px; overflow-y: auto; }
  .tro-lista-fila { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid rgba(43,42,51,.14); }
  .tro-lista-texto { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .tro-lista-tema { font-size: 15px; }
  .tro-lista-quien { font-size: 13px; color: var(--pp-ink2); }

  /* ── Regalos ───────────────────────────────────────────────────────── */
  .tro-regalos { background: linear-gradient(180deg, var(--pp-sky2), var(--pp-hill1) 60%, var(--pp-night)); }

  /* ── Trivia ────────────────────────────────────────────────────────── */
  .tro-quiz { background: linear-gradient(180deg, var(--pp-hill1), var(--pp-night) 70%); color: var(--pp-night-ink); }
  .tro-opciones { display: flex; flex-direction: column; gap: 8px; }
  .tro-opcion { min-height: 48px; text-align: left; padding: 0 16px; border: 1.5px solid #CFC4AE; background: transparent;
    color: ${CARTA_TINTA}; font-family: var(--tro-sans), 'Quicksand', sans-serif; font-size: 15px; cursor: pointer;
    transition: background 300ms, border-color 300ms, color 300ms; }
  .tro-opcion:disabled { cursor: default; }
  .tro-opcion--bien { background: var(--pp-acc2); border-color: var(--pp-acc2); color: ${CARTA}; }
  .tro-opcion--mal { border-color: var(--pp-acc); color: var(--pp-acc); }

  /* ── Tu pase ───────────────────────────────────────────────────────── */
  .tro-pase { justify-content: flex-end; gap: 20px; background: var(--pp-night); color: var(--pp-night-ink);
    padding: 44vh max(24px, calc((100% - 560px) / 2)) calc(40px + env(safe-area-inset-bottom)); }
  .tro-ticket { position: relative; z-index: 1; display: grid; grid-template-columns: 1fr auto; background: ${CARTA};
    color: ${CARTA_TINTA}; box-shadow: 0 2px 0 rgba(0,0,0,.2), 0 8px 14px rgba(0,0,0,.14); --tro-giro: -.6deg; transform: rotate(var(--tro-giro));
    border-radius: 12px; overflow: hidden; }
  .tro-ticket-izq { padding: 22px 20px; display: flex; flex-direction: column; gap: 10px; border-right: 2px dashed #CFC4AE; position: relative; }
  .tro-ticket-der { padding: 16px 14px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .tro-ticket-kicker { font-size: 12px; letter-spacing: .26em; color: var(--pp-ink2); }
  .tro-ticket-nombre { font-family: var(--tro-serif), 'Lilita One', cursive; font-size: clamp(30px, 8vw, 40px); line-height: .95; }
  .tro-ticket-dato { font-size: 14px; color: var(--pp-ink2); }
  .tro-ticket-fecha { font-size: 14px; letter-spacing: .14em; color: var(--pp-acc); }
  .tro-ticket-muesca { position: absolute; right: -12px; width: 24px; height: 24px; border-radius: 50%; background: var(--pp-night); }
  .tro-ticket-muesca--arriba { top: -12px; }
  .tro-ticket-muesca--abajo { bottom: -12px; }
  /* El QR compartido viene con su propio marco claro: acá va sobre el talón. */
  .tro-ticket-der .qr-ingreso, .tro-ticket-der section { background: transparent !important; border: none !important; padding: 0 !important; margin: 0 !important; }
  .tro-info-extra { position: relative; z-index: 1; }
  .tro-info-extra #info-adicional { background: transparent !important; padding: 0 !important; }
  .tro-info-extra #ia-trigger-btn { background: transparent !important; color: var(--pp-night-ink) !important;
    border: 1px solid rgba(243,235,221,.35) !important; border-radius: 0 !important; letter-spacing: .18em !important; }
  /* Los íconos de los componentes compartidos no entran acá: el dibujo de la
     colección es el papel recortado, y un ícono de trazo al lado desentona. */
  .tro-raiz .ia-icon-box { display: none !important; }
  .tro-pase-pie { position: relative; z-index: 1; display: flex; justify-content: space-between; align-items: flex-end; gap: 12px; padding-top: 10px; }
  .tro-pase-firma { font-family: var(--tro-serif), 'Lilita One', cursive; font-style: italic; font-size: 24px; color: var(--pp-night-ink); }
  .tro-pase-creditos { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
  .tro-replay { cursor: pointer; font-size: 12px; letter-spacing: .18em; color: var(--pp-acc); }

  /* ── Riel ──────────────────────────────────────────────────────────── */
  .tro-riel { position: absolute; right: 0; top: 0; bottom: 0; width: 34px; z-index: 4; display: flex; flex-direction: column;
    align-items: center; justify-content: space-between; padding: 20px 0 calc(20px + env(safe-area-inset-bottom));
    opacity: 0; transition: opacity 700ms ease; pointer-events: none; border-left: 1px solid rgba(43,42,51,.12); }
  .tro-riel-top { writing-mode: vertical-rl; font-size: 10px; letter-spacing: .3em; color: var(--pp-ink2); transition: color 500ms ease; }
  .tro-riel-linea { flex: 1; width: 1px; margin: 16px 0; background: rgba(43,42,51,.14); position: relative; }
  .tro-riel-barra { position: absolute; left: -1px; top: 0; width: 3px; height: 0%; background: var(--pp-acc); transition: height 260ms linear; display: block; }
  .tro-riel-etiqueta { writing-mode: vertical-rl; font-size: 10px; letter-spacing: .3em; color: var(--pp-acc); transition: color 500ms ease; }

  /* ── Portada ───────────────────────────────────────────────────────── */
  .tro-portada { position: absolute; inset: 0; z-index: 5; overflow: hidden;
    background: linear-gradient(180deg, var(--pp-sky1), var(--pp-sky2)); }
  .tro-portada-escena { position: absolute; inset: 0; pointer-events: none; }
  .tro-portada-contenido { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: space-between;
    align-items: center; text-align: center; pointer-events: none;
    padding: calc(64px + env(safe-area-inset-top)) max(24px, calc((100% - 480px) / 2)) calc(26px + env(safe-area-inset-bottom)); }
  .tro-portada-arriba { display: flex; flex-direction: column; align-items: center; gap: clamp(8px, 1.6vh, 14px); width: 100%; }
  .tro-cartel { position: relative; background: ${CARTA}; color: ${CARTA_TINTA}; padding: clamp(16px, 3vh, 26px) clamp(18px, 5vw, 30px);
    max-width: 100%; box-sizing: border-box; box-shadow: 0 2px 0 rgba(0,0,0,.12), 0 8px 14px rgba(0,0,0,.08);
    transform: rotate(-1.2deg); transform-origin: 50% 0%; }
  .tro-cartel-nombres { margin: 0; font-family: var(--tro-serif), 'Lilita One', cursive; font-weight: 500;
    font-size: min(clamp(34px, 10vw, 60px), 6.4vh); line-height: .96; letter-spacing: -.01em;
    display: flex; flex-wrap: wrap; justify-content: center; align-items: baseline; gap: 0 .28em; }
  .tro-cartel-amp { font-style: italic; font-weight: 400; font-size: .6em; color: var(--pp-acc); }
  .tro-cartel-chinche { position: absolute; left: 50%; top: -10px; width: 20px; height: 20px; margin-left: -10px; border-radius: 50%;
    background: radial-gradient(circle at 34% 30%, #fff 0 14%, var(--pp-acc) 16% 68%, rgba(0,0,0,.45) 70%);
    box-shadow: 0 3px 5px rgba(0,0,0,.34); }
  .tro-portada-abajo { display: flex; flex-direction: column; align-items: center; gap: clamp(10px, 2vh, 16px); width: 100%; pointer-events: auto; }
  .tro-portada-datos { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 14px 20px; background: ${CARTA};
    color: ${CARTA_TINTA}; box-shadow: 0 2px 0 rgba(0,0,0,.12), 0 8px 14px rgba(0,0,0,.08); transform: rotate(.8deg);
    max-width: 100%; box-sizing: border-box; }
  .tro-portada-saludo { font-size: 11px; letter-spacing: .28em; color: var(--pp-ink2); }
  .tro-portada-fila { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 6px 14px; font-size: 14px; letter-spacing: .14em; }
  .tro-portada-pase { display: flex; flex-wrap: wrap; justify-content: center; gap: 4px 10px; font-size: 11px; letter-spacing: .18em; color: var(--pp-ink2); }
  .tro-portada-btn { width: 100%; max-width: 360px; min-height: 52px; border: none; background: var(--pp-btn-bg); color: var(--pp-btn-fg);
    font-family: var(--tro-sans), 'Quicksand', sans-serif; font-size: 14px; letter-spacing: .22em; cursor: pointer;
    box-shadow: 0 2px 0 rgba(0,0,0,.14), 0 8px 14px rgba(0,0,0,.1); transition: background 300ms ease; }
  @media (hover: hover) { .tro-portada-btn:hover { background: var(--pp-acc); color: ${CARTA}; } }

  .tro-pista { position: absolute; left: 0; right: 34px; bottom: calc(18px + env(safe-area-inset-bottom)); z-index: 6; text-align: center;
    font-size: 11px; letter-spacing: .28em; color: var(--pp-ink2); opacity: 0; transition: opacity 600ms ease; pointer-events: none;
    animation: ppHint 2.4s ease-in-out infinite; }

  /* ── Lupa ──────────────────────────────────────────────────────────── */
  .tro-lupa { position: fixed; inset: 0; z-index: 200; background: rgba(43,42,51,.94); display: flex; align-items: center;
    justify-content: center; padding: 24px; cursor: zoom-out; }
  .tro-lupa-cerrar { position: absolute; top: 20px; right: 20px; width: 40px; height: 40px; border: 1px solid ${CARTA};
    background: transparent; color: ${CARTA}; font-size: 18px; line-height: 1; cursor: pointer; }
  .tro-lupa-img { max-width: 100%; max-height: 88vh; object-fit: contain; cursor: default; background: ${CARTA}; padding: 10px 10px 30px; }

  /* En escritorio la invitación sigue siendo una hoja angosta centrada: las
     escenas están dibujadas para una pantalla de teléfono y estiradas a 1440
     px pierden la escala del recorte. */
  @media (min-width: 1024px) {
    .tro-section, .tro-panel { padding-left: max(24px, calc((100% - 620px) / 2)); padding-right: max(24px, calc((100% - 620px) / 2)); }
    .tro-panel--album { padding-left: max(24px, calc((100vw - 900px) / 2)); padding-right: max(24px, calc((100vw - 900px) / 2)); }
  }

  /* ── Tipográfica Editorial ────────────────────────────────────────────
     Acá no hay dibujo: hay tipografía, filetes y tramas. La página es una
     revista -- cada sección es una hoja con su folio arriba, el titular
     ocupa lo que quiera y el color aparece en una palabra o en un fondo
     entero, nunca en un ornamento. */
  .tro-raiz { font-family: var(--tro-sans), 'Quicksand', sans-serif; }

  /* La trama de semitono, que es lo único "impreso" de la familia: puntos de
     1 px cada 12. Va como gradiente y no como SVG para que no cueste nada. */
  .tro-trama { position: absolute; inset: 0; pointer-events: none; opacity: .14; z-index: 0;
    background-image: radial-gradient(currentColor .8px, transparent .9px); background-size: 12px 12px; }

  /* Los kickers y los folios son mono: son los datos de la ficha técnica. */
  .tro-kicker, .tro-panel-top, .tro-panel-pie, .tro-meta, .tro-riel-top, .tro-riel-etiqueta,
  .tro-ticket-kicker, .tro-cuenta-etq, .tro-tarjeta-kicker, .tro-fila-etq, .tro-portada-pase {
    font-family: var(--tro-sans), 'Quicksand', sans-serif; }

  /* El titular: Instrument Serif enorme, con la segunda línea en itálica y en
     el acento. Es la firma de la sub-colección. */
  .tro-h2, .tro-frase, .tro-tarjeta-titulo, .tro-std-dia, .tro-cartel-nombres, .tro-ticket-nombre, .tro-cifra, .tro-cuenta-num {
    font-family: var(--tro-serif), 'Lilita One', cursive; letter-spacing: -.03em; }
  .tro-h2 em, .tro-acento { font-style: italic; color: var(--pp-acc); }

  /* Save the Date: el día ocupa la hoja entera. */
  .tro-std { background: var(--pp-ink); color: var(--pp-bg); padding: 64px max(22px, calc((100% - 560px) / 2)) 80px; justify-content: center; }
  .tro-std-dia { font-size: clamp(64px, 22vw, 180px); line-height: .82; text-shadow: none; color: inherit; }
  .tro-std-fila { justify-content: space-between; }
  .tro-cinta { background: none; color: var(--pp-acc); font-style: italic; clip-path: none; box-shadow: none;
    animation: none; padding: 0; font-family: var(--tro-serif), 'Lilita One', cursive; font-size: clamp(64px, 22vw, 180px); line-height: .82; }
  .tro-std-anio { font-family: var(--tro-serif), 'Lilita One', cursive; font-size: clamp(64px, 22vw, 180px); line-height: .82; }
  .tro-std .tro-kicker, .tro-std .tro-meta { color: rgba(245,241,234,.62); }

  /* La foto va enmarcada, como una foto de tapa. */
  .tro-foto-marco { border: 3px solid var(--pp-ink); }
  .tro-ventana { clip-path: none !important; box-shadow: none; }
  .tro-foto-firma { background: var(--pp-acc); color: var(--pp-bg); transform: none; box-shadow: none;
    font-family: var(--tro-serif), 'Lilita One', cursive; font-style: italic; }

  /* Las tarjetas son bloques de color, no papelitos inclinados. */
  .tro-tarjeta { background: var(--pp-bg2); color: var(--pp-ink); box-shadow: none; border: 1px solid color-mix(in srgb, var(--pp-ink) 14%, transparent); }
  .tro-tarjeta--izq, .tro-tarjeta--der, .tro-tarjeta--talon, .tro-tarjeta--hoy { transform: none; }
  .tro-doblez::before { display: none; }
  .tro-fila { border-bottom-color: color-mix(in srgb, var(--pp-ink) 14%, transparent); }
  .tro-chinche { display: none; }

  /* La cuenta regresiva: cuatro cifras al hilo, separadas por filetes. */
  .tro-cuenta { grid-template-columns: repeat(4, 1fr); gap: 0; max-width: 560px; }
  .tro-cuenta-caja { background: none; box-shadow: none; transform: none !important; margin: 0 !important;
    border-left: 1px solid color-mix(in srgb, var(--pp-ink) 18%, transparent); padding: 10px 12px; }
  .tro-cuenta-caja:first-child { border-left: none; }
  .tro-cuenta-caja::before { display: none; }
  .tro-cuenta-num { font-size: clamp(38px, 12vw, 72px); line-height: .9; }

  /* Los paneles del recorrido: cada uno es una hoja con su tono. El de
     cronograma va en el acento, que es lo que le da el golpe editorial. */
  .tro-panel { padding: 64px max(22px, calc((100vw - 560px) / 2)) 80px; }
  .tro-panel[data-tone="dark"] { background: var(--pp-ink) !important; color: var(--pp-bg); }
  .tro-panel[data-tone="dark"] .tro-tarjeta { background: transparent; border-color: rgba(245,241,234,.22); color: inherit; }
  .tro-panel-top, .tro-panel-pie { letter-spacing: .22em; font-size: 11px; }

  /* El pase es un cupón troquelado, no un ticket con muescas redondas. */
  .tro-ticket { background: var(--pp-bg); color: var(--pp-ink); border: 1px solid var(--pp-ink); border-radius: 0; transform: none; box-shadow: none; }
  .tro-ticket-izq { border-right: 1px dashed color-mix(in srgb, var(--pp-ink) 40%, transparent); }
  .tro-ticket-muesca { display: none; }

  /* Botones: rectángulos con el acento, sin sombra ni inclinación. */
  .tro-btn-solido, .tro-btn-papel, .tro-portada-btn { border-radius: 0; box-shadow: none; transform: none; }
  .tro-btn-papel { background: transparent; border: 1px solid currentColor; }
  .tro-opcion { border-color: color-mix(in srgb, var(--pp-ink) 24%, transparent); border-radius: 0; }

  /* La portada: sin capas de papel. Un titular enorme sobre la trama, el
     folio arriba y el botón abajo. */
  .tro-portada { background: var(--pp-bg); }
  .tro-cartel { background: none; box-shadow: none; transform: none; padding: 0; }
  .tro-cartel-nombres { font-size: min(clamp(52px, 17vw, 120px), 13vh); line-height: .86; display: block; }
  .tro-cartel-amp { display: block; font-style: italic; color: var(--pp-acc); font-size: .7em; }
  .tro-cartel-chinche { display: none; }
  .tro-portada-datos { background: none; box-shadow: none; transform: none; padding: 0; gap: 12px; }
  .tro-portada-btn { background: var(--pp-ink); color: var(--pp-bg); }
  @media (hover: hover) { .tro-portada-btn:hover { background: var(--pp-acc); color: var(--pp-bg); } }

  /* Tropical: el sol de fondo y los titulares redondos. */
  .tro-h2, .tro-cartel-nombres { letter-spacing: 0; }
  .tro-trama { opacity: .16; background-image: radial-gradient(currentColor 1px, transparent 1.2px); background-size: 18px 18px; }

  @media (prefers-reduced-motion: reduce) {
    .tro-raiz * { animation: none !important; }
    .tro-scroller [data-xin] { opacity: 1 !important; --tro-y: 0px; }
  }
`;
