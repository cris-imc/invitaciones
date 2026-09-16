"use client";

// GENERADO por scripts/gen-iconic-variants.js a partir de
// TropicalTemplate.tsx — no editar a mano: los cambios se pierden al regenerar.

/**
 * TROPICAL · Colección Iconic — sub-colección "Tipográfica Editorial"
 * Variante: Coco.
 *
 * GENERADO por scripts/derivar-tipografica.js a partir de
 * EditorialBlancNoirTemplate.tsx — no editar a mano: el motor se arregla en
 * Editorial Blanc & Noir; el render en scripts/jsx/tipografica/tro.jsx, los
 * estilos en scripts/css/tipografica/tro.css y las caras y la paleta en
 * scripts/familias/tipografica/tro.json.
 *
 * Etiqueta de bebida en la playa: Lilita One blanca con trazo de tinta y
 * sombra plana de color, Quicksand para el texto. Cielo, sol, mar con olas
 * que corren, arena, palmera que se mece, estrella de mar, sandía y un
 * radiocasete con parlantes girando para la cuenta regresiva.
 *
 * Sin imágenes propias: son fuentes y CSS.
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
  weight: ["500", "600", "700"],
  display: "swap",
  variable: "--tro-sans",
});
// El mono es la ficha técnica de la revista: folios, kickers y datos.

// ─── Paleta ─────────────────────────────────────────────────────────────────
// Las cinco variantes de "Capas de papel" cambian SOLO estos once colores
// (el script de variantes reemplaza este bloque entero, ver
// scripts/gen-capas-de-papel-variants.js). El dibujo es el mismo: los SVG de
// las escenas leen var(--pp-…), así que un cambio acá repinta cerros, cielo,
// sol y figuras de una sola vez.
const PALETA = {
  bg: "#BDEFFF",
  bg2: "#F7EBD5",
  ink: "#2C3A4A",
  ink2: "#6E6A78",
  acc: "#FF8A3D",
  acc2: "#1FA7A0",
  sky1: "#BDEFFF",
  sky2: "#F7EBD5",
  hill1: "#F7EBD5",
  hill2: "#6E6A78",
  hill3: "#2C3A4A",
  night: "#2C3A4A",
  nightInk: "#BDEFFF",
  sun: "#FFD166",
  leaf: "#2E9E6B",
  leaf2: "#1E7A55",
  trunk: "#8C5A34",
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

interface TropicalTemplateProps {
  invitation: Record<string, unknown>;
  guest?: GuestRecord | null;
  isPersonalized?: boolean;
}

/** El número de pase, con tres cifras como en el mockup ("PASE Nº 042"). */
function numeroDePase(orderNumber: number | undefined): string {
  return String(orderNumber ?? 42).padStart(3, "0");
}

export function TropicalTemplateCoco({ invitation, guest, isPersonalized = false }: TropicalTemplateProps) {
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
            ven.style.setProperty("--tro-punto", (7.2 * (1 - t)).toFixed(2));
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
    "--pp-sun": PALETA.sun,
    "--pp-leaf": PALETA.leaf,
    "--pp-leaf2": PALETA.leaf2,
    "--pp-trunk": PALETA.trunk,
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
          clase: `${troSerif.variable} ${troSans.variable}`,
          fuente: "var(--tro-sans), 'Quicksand', sans-serif",
        }}
      />
    );
  }


  // El total de pliegos, para los folios ("03 / 10"). Se cuenta lo que esta
  // invitación realmente tiene: si no hay trivia, no existe el pliego 09 y el
  // pase deja de ser 10 de 10.
  const totalPliegos = cuenta;
  const folio = (n: string) => `${n} / ${String(totalPliegos).padStart(2, "0")}`;

  // El nombre como etiqueta de bebida: un renglón en Lilita One, centrado;
  // con dos personas, uno por renglón y el cuerpo baja a .72em.
  const renglones = saludaAlInvitado ? [nombreInvitado] : [nombre1, ...(nombre2 ? [nombre2] : [])];
  const renglonMasLargo = Math.max(4, ...renglones.map((n) => n.length));
  const nombreLargo = renglones.length > 1 || renglonMasLargo > 11;
  const totalLetras = Math.max(1, renglones.join("").replace(/\s/g, "").length);

  // La frase: una palabra del medio en el acento y el cierre en el sol.
  const tonoDePalabra = (i: number) => {
    const n = palabras.length;
    if (i >= Math.ceil(n * 0.8)) return "tro-sol";
    if (i === Math.min(desdeAcento, n - 1) || i === Math.floor(n * 0.3)) return "tro-acento";
    return undefined;
  };

  const esXV = invitation.tipo === "QUINCE_ANOS";
  const esBoda = invitation.tipo === "CASAMIENTO";
  const kickerDelEvento = tx(esBoda ? "invitacion.evento.nosCasamos" : esXV ? "invitacion.evento.misQuinceAnos" : "invitacion.evento.teInvitamos");
  const cintaDelEvento = esXV ? `15 ${tx("invitacion.saveTheDate.anios")} ☼ ${tx("invitacion.saveTheDate.tropical")}` : `${anio} ☼ ${tx("invitacion.saveTheDate.tropical")}`;
  const firma = esXV ? nombre1.trim().split(/\s+/)[0] : iniciales(nombre1, nombre2);
  // Cada lugar es un parador numerado según el orden real de los paneles.
  const parador = (clave: string) => `${tx("invitacion.saveTheDate.parador")} ${Math.max(0, panelesLugar.indexOf(clave)) + 1}`;
  // Las olas: un path de 120×22 repetido al doble de ancho que corre 120 px
  // y vuelve a empezar sin costura.
  const Ola = ({ clase, arriba = false }: { clase: string; arriba?: boolean }) => (
    <span className={`tro-ola ${clase}`} aria-hidden="true">
      <svg viewBox="0 0 120 22" preserveAspectRatio="none"><path d={arriba ? "M0 11 Q15 0 30 11 T60 11 T90 11 T120 11 T150 11 T180 11 T210 11 T240 11 V0 H0 Z" : "M0 11 Q15 0 30 11 T60 11 T90 11 T120 11 T150 11 T180 11 T210 11 T240 11 V22 H0 Z"} /></svg>
    </span>
  );
  const FRONDA = "M0,0 C 10,-14 30,-14 46,-4 C 58,4 64,16 62,30 C 52,20 40,14 28,12 C 34,20 36,26 34,30 C 22,22 10,12 0,0 Z";
  const NERVIO = "M2,-1 C 20,-6 40,-2 58,20";
  const FRONDAS: [number, number][] = [[-158, 0.94], [-128, 1.01], [-98, 1.08], [-68, 1.15], [-38, 1.08], [-8, 1.01], [22, 0.94]];
  const ESTRELLA = "30,2 37,22 58,23 41,36 47,57 30,45 13,57 19,36 2,23 23,22";

  return (
    <div
      ref={raizRef}
      className={`${troSerif.variable} ${troSans.variable} tro-raiz`}
      style={varsDePaleta}
    >
      <style>{CSS_TRO}</style>
      <style>{COVER_RESPONSIVE_STYLE}</style>

      <div ref={scrollerRef} className="tro-scroller">
        {/* ── 01 Guardá la fecha ─────────────────────────────────────────
            Etiqueta de botella: sobre arena con la ola del mar arriba, la
            fecha en Lilita a tres colores y la foto con marco blanco,
            sombra de mar y el código de barras en la esquina. */}
        <section data-tone="light" data-screen-label={tx("invitacion.saveTheDate.guardaLaFecha")} className="tro-section tro-std">
          <Ola clase="tro-ola--std" arriba />
          <div className="tro-folio tro-folio--acento">
            <span data-xin="1" data-dist="-40">{nSaveTheDate} — {tx("invitacion.saveTheDate.guardaLaFecha")}</span>
            <span data-xin="1" data-dist="40">{folio(nSaveTheDate)}</span>
          </div>
          <div className="tro-spread">
            <div className="tro-pagina">
              <div className="tro-fecha">
                <span data-xin="1" data-dist="-160" className="tro-fecha-linea tro-fecha-linea--dia">{diaNum}</span>
                <span data-xin="1" data-dist="160" data-delay="120" className="tro-fecha-linea tro-fecha-linea--mes">{mesLargo}</span>
                <span data-xin="1" data-dist="-160" data-delay="240" className="tro-fecha-linea tro-fecha-linea--anio">{anio}</span>
              </div>
              <div data-xin="1" data-delay="360" className="tro-fecha-pie">
                <span>{diaSemana} · {hora} h</span>
                <AddToCalendarLink
                  eventName={titulo}
                  targetDate={fechaHora}
                  location={[lugarNombre, direccion].filter(Boolean).join(", ")}
                  className="tro-pildora tro-pildora--tinta"
                  showIcon={false}
                >
                  {tx("invitacion.saveTheDate.agregarAlCalendario")} ☼
                </AddToCalendarLink>
              </div>
            </div>

            {hayFoto && (
              <div ref={ventanaRef} data-xin="1" data-delay="200" data-dist="0" className="tro-foto">
                {fotoMobile && (
                  <div className="acp-mobile-only tro-foto-capa">
                    <AnimatedCoverPhoto photoSrc={fotoMobile} tint={false} effect="enfoque" scrimColorRgb="44,58,74" />
                  </div>
                )}
                {fotoDesktop && (
                  <div className="acp-desktop-only tro-foto-capa">
                    <AnimatedCoverPhoto photoSrc={fotoDesktop} tint={false} effect="enfoque" scrimColorRgb="44,58,74" />
                  </div>
                )}
                {/* La trama que tapa la foto y se disuelve al subir: el radio
                    del punto lo mueve el motor en --tro-punto. */}
                <span className="tro-foto-revelado" aria-hidden="true" />
                <span className="tro-foto-etq">{tx("invitacion.album.nuestraFoto").toUpperCase()}</span>
                <span className="tro-barras" aria-hidden="true">
                  {[2, 1, 3, 1, 2, 3, 1, 2, 1, 3, 2, 1].map((w, i) => <span key={i} style={{ width: w }} />)}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* ── 02 Falta poco ──────────────────────────────────────────────
            El radiocasete: sobre el mar, la caja de tinta con asa, cuatro
            displays de color y dos parlantes girando, entre dos
            marquesinas inclinadas. */}
        <section data-tone="dark" data-screen-label={tx("invitacion.cuentaRegresiva.kicker")} className="tro-section tro-countdown">
          <div className="tro-folio">
            <span data-xin="1" data-dist="-40">{nCountdown} — {tx("invitacion.cuentaRegresiva.faltan")}</span>
            <span data-xin="1" data-dist="40">{folio(nCountdown)}</span>
          </div>
          <div className="tro-marquesina tro-marquesina--sol" aria-hidden="true">
            <div className="tro-marquesina-tira">
              {[0, 1].map((i) => (
                <span key={i}>
                  {tx("invitacion.cuentaRegresiva.dias")} ☼ {tx("invitacion.cuentaRegresiva.horas")} ☼ {tx("invitacion.cuentaRegresiva.minutos")} ☼ {tx("invitacion.cuentaRegresiva.segundos")} ☼ {diaNum} {tx("invitacion.evento.de")} {mesLargo} ☼&nbsp;
                </span>
              ))}
            </div>
          </div>
          <div className="tro-spread">
            <div className="tro-pagina tro-pagina--entera">
              <div className="tro-radio">
                <span className="tro-radio-asa" aria-hidden="true" />
                <CuentaTropical targetDate={fechaHora} />
                <div className="tro-radio-pie" aria-hidden="true">
                  <span className="tro-parlante" /><span className="tro-radio-etq">Play ▶ {tx("invitacion.saveTheDate.hastaLaFiesta")}</span><span className="tro-parlante" />
                </div>
              </div>
            </div>
          </div>
          <div className="tro-marquesina tro-marquesina--blanca tro-marquesina--contraria" aria-hidden="true">
            <div className="tro-marquesina-tira">
              {[0, 1].map((i) => (
                <span key={i}>
                  {[lugarNombre, ciudad, `${hora} h`, dressCode].filter(Boolean).join(" · ").toUpperCase()} ·&nbsp;
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── 03 Unas palabras ───────────────────────────────────────────
            Escrito en la arena: grano de arena de fondo, la frase en Lilita
            con sombra de mar y la pastilla con la estrella de mar. */}
        {hayFrase && (
          <section data-tone="light" data-screen-label={tx("invitacion.frase.etiqueta")} className="tro-section tro-frase-seccion">
            <span className="tro-grano" aria-hidden="true" />
            <div className="tro-folio tro-folio--acento">
              <span data-xin="1" data-dist="-40">{nFrase} — {tx("invitacion.saveTheDate.escritoEnLaArena")}</span>
              <span data-xin="1" data-dist="40">{folio(nFrase)}</span>
            </div>
            <div className="tro-spread">
              <h2 ref={fraseRef} className="tro-frase">
                {palabras.map((p, i) => (
                  // El espacio va fuera del span: el motor pone cada palabra
                  // en inline-block y un espacio adentro se colapsa a cero.
                  <span key={i}>
                    <span data-w="1" className={tonoDePalabra(i)}>{p}</span>{" "}
                  </span>
                ))}
              </h2>
              <div data-xin="1" data-delay="900" data-dist="60" className="tro-pastilla">
                <svg viewBox="0 0 60 60" className="tro-pastilla-estrella" aria-hidden="true"><polygon points={ESTRELLA} /></svg>
                <span>{tx("invitacion.frase.conAmor")} · {titulo}</span>
              </div>
            </div>
            <div className="tro-folio tro-folio--pie">
              <span>{titulo}{esXV ? " · XV" : ""}</span>
              <span className="tro-barra" aria-hidden="true" />
            </div>
          </section>
        )}

        {/* ── 04 Cuándo y dónde ──────────────────────────────────────────
            Los paradores: cielo, arena y mar, cada uno con su ola abajo,
            el título en Lilita con sombra de color y la ficha blanca. */}
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
              <div data-tone="light" className="tro-panel tro-panel--cielo">
                <Ola clase="tro-ola--panel" />
                <div className="tro-folio">
                  <span>{nCuando} — {tx("invitacion.ubicacion.elSalon")}</span><span>{deLugar("recepcion")}</span>
                </div>
                <div className="tro-spread">
                  <div className="tro-pagina tro-pagina--titulo">
                    <span className="tro-panel-sub">{parador("recepcion")}</span>
                    <h2 className="tro-panel-titulo">{lugarNombre || tx("invitacion.ubicacion.elLugar")}</h2>
                  </div>
                  <div className="tro-ficha">
                    <div className="tro-linea"><span>{tx("invitacion.ubicacion.recepcion")}</span><span>{hora} h</span></div>
                    {direccion && <div className="tro-linea"><span>{tx("invitacion.ubicacion.direccion")}</span><span>{direccion}</span></div>}
                    {dressCode && <div className="tro-linea"><span>{tx("invitacion.ubicacion.dressCode")}</span><span>{dressCode}</span></div>}
                    {mapUrl && (
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="tro-cta">
                        {tx("invitacion.ubicacion.comoLlegar")}<span>→</span>
                      </a>
                    )}
                  </div>
                </div>
                <div className="tro-folio tro-folio--pie">
                  <span>{[direccion, ciudad].filter(Boolean).join(" · ")}</span>
                  {!scrollVertical && panelesLugar.length > 1 && <span>{tx("invitacion.portada.desliza")} →</span>}
                </div>
              </div>

              {ceremoniaHabilitada && (
                <div id="ceremonia" data-tone="light" className="tro-panel tro-panel--arena">
                  <Ola clase="tro-ola--panel" />
                  <div className="tro-folio">
                    <span>{nCuando} — {ceremoniaTitulo}</span><span>{deLugar("ceremonia")}</span>
                  </div>
                  <div className="tro-spread">
                    <div className="tro-pagina tro-pagina--titulo">
                      <span className="tro-panel-sub">{parador("ceremonia")}</span>
                      <h2 className="tro-panel-titulo">{ceremoniaNombre || ceremoniaTitulo}</h2>
                    </div>
                    <div className="tro-ficha">
                      {ceremoniaHora && <div className="tro-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{ceremoniaHora} h</span></div>}
                      {ceremoniaDireccion && <div className="tro-linea"><span>{tx("invitacion.ubicacion.direccion")}</span><span>{ceremoniaDireccion}</span></div>}
                    </div>
                  </div>
                  <div className="tro-folio tro-folio--pie">
                    <span>{tx("invitacion.ubicacion.ceremoniaCivil")}</span>
                    {!scrollVertical && <span>{tx("invitacion.portada.desliza")} →</span>}
                  </div>
                </div>
              )}

              {hayComoLlegar && (
                <div id="location" data-tone="light" className="tro-panel tro-panel--cielo tro-panel--mapa">
                  <Ola clase="tro-ola--panel" />
                  <div className="tro-folio">
                    <span>{nCuando} — {tx("invitacion.ubicacion.comoLlegar")}</span><span>{deLugar("llegar")}</span>
                  </div>
                  <div className="tro-spread">
                    <div className="tro-pagina tro-pagina--titulo">
                      <span className="tro-panel-sub">{parador("llegar")}</span>
                      <h2 className="tro-panel-titulo">{tx("invitacion.ubicacion.comoLlegar")}</h2>
                    </div>
                    <div className="tro-ficha">
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
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="tro-cta">
                        {tx("invitacion.ubicacion.abrirEnMapas")}<span>→</span>
                      </a>
                    </div>
                  </div>
                  <div className="tro-folio tro-folio--pie">
                    <span>{[direccion, ciudad].filter(Boolean).join(" · ")}</span>
                    {!scrollVertical && <span>{tx("invitacion.portada.desliza")} →</span>}
                  </div>
                </div>
              )}

              {cronograma.length > 0 && (
                <div id="schedule" data-tone="dark" className="tro-panel tro-panel--mar">
                  <Ola clase="tro-ola--panel" />
                  <div className="tro-folio">
                    <span>{nCuando} — {tx("invitacion.ubicacion.cronograma")}</span><span>{deLugar("cronograma")}</span>
                  </div>
                  <div className="tro-spread">
                    <div className="tro-pagina tro-pagina--titulo">
                      <span className="tro-panel-sub">{parador("cronograma")}</span>
                      <h2 className="tro-panel-titulo">{tx("invitacion.ubicacion.laNochePasoAPaso").split(",")[0]}</h2>
                    </div>
                    <div className="tro-ficha">
                      {cronograma.map((item, i) => (
                        <div key={i} className="tro-linea"><span>{item.time || ""}</span><span>{item.title}</span></div>
                      ))}
                    </div>
                  </div>
                  <div className="tro-folio tro-folio--pie">
                    <span>{fechaPuntos}</span>
                  </div>
                </div>
              )}
            </div>
            {!scrollVertical && panelesLugar.length > 1 && <Puntos cantidad={panelesLugar.length} />}
          </div>
        </div>

        {/* ── 05 Check-in ────────────────────────────────────────────────
            La pulsera de playa: sobre el acento con lunares blancos, la
            tarjeta blanca con sombra de tinta y la estrella "¡Sí!". */}
        {rsvpHabilitado && (
          <section id="rsvp" data-tone="light" data-screen-label={tx("invitacion.rsvp.confirmar")} className="tro-section tro-checkin">
            <span className="tro-lunares" aria-hidden="true" />
            <div className="tro-folio tro-folio--blanco">
              <span data-xin="1" data-dist="-40">{nCheckin} — {tx("invitacion.pase.checkIn")}</span>
              <span data-xin="1" data-dist="40">{folio(nCheckin)}</span>
            </div>
            <div className="tro-spread">
              <div className="tro-pagina">
                <h2 data-xin="1" data-dist="-80" className="tro-h2 tro-h2--sombra-tinta">
                  {tx("invitacion.saveTheDate.venis")}<br /><span className="tro-sol">{tx("invitacion.saveTheDate.aLaPlaya")}</span>
                </h2>
                <p data-xin="1" data-delay="120" className="tro-parrafo tro-parrafo--blanco">{tx("invitacion.rsvp.kicker")}.</p>
              </div>
              <div data-xin="1" data-delay="160" data-dist="80" className="tro-cupon">
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
              </div>
            </div>
          </section>
        )}

        {/* ── 06 Álbum ───────────────────────────────────────────────────
            Postales: marcos blancos gruesos con filete de tinta, apenas
            torcidos, sobre el papel neutro. */}
        {todasLasFotos.length > 0 && (
          <div
            id="album"
            data-pan="1"
            data-scroll={scrollVertical || hojasDeFotos.length <= 1 ? "vertical" : "lateral"}
            data-screen-label={tx("invitacion.album.titulo")}
            className="tro-pan"
            style={{ "--st-pasos": Math.max(0, hojasDeFotos.length - 1) } as React.CSSProperties}
          >
            <div className="tro-pan-fijo tro-pan-fijo--album">
              <div data-strip="1" className="tro-tira">
                {hojasDeFotos.map((hoja, iHoja) => (
                  <div key={iHoja} data-tone="light" className={`tro-panel tro-panel--album${iHoja % 2 === 1 ? " tro-panel--album-b" : ""}`}>
                    <div className="tro-folio tro-folio--gris">
                      <span>{nAlbum} — {tx("invitacion.album.titulo")}</span>
                      <span>{tx("invitacion.album.hojaDeTotal", { n: String(iHoja + 1).padStart(2, "0"), total: String(hojasDeFotos.length).padStart(2, "0") })} · {folio(nAlbum)}</span>
                    </div>
                    <h2 className="tro-h2 tro-h2--album">{tx("invitacion.saveTheDate.postales")}</h2>
                    <div className="tro-hoja" data-cantidad={hoja.length}>
                      {hoja.map((url, i) => (
                        <div
                          key={i}
                          data-sheet="1"
                          className="tro-foto-hoja"
                          role="button"
                          tabIndex={0}
                          onClick={() => setFotoAmpliada(url)}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setFotoAmpliada(url); }}
                          aria-label={tx("invitacion.album.ampliarFoto", { n: i + 1 })}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="" loading="lazy" className="tro-foto-hoja-img" />
                          <span data-colorwash="1" className={`tro-bano tro-bano--${(i % 5) + 1}`} aria-hidden="true" />
                          <span className="tro-foto-hoja-n">FOTO {String(i + 1).padStart(2, "0")}</span>
                        </div>
                      ))}
                    </div>
                    <div className="tro-folio tro-folio--gris tro-folio--pie">
                      <span>{tx("invitacion.album.fotosSubidas", { n: todasLasFotos.length })}</span>
                      {!scrollVertical && hojasDeFotos.length > 1 && <span>{tx("invitacion.portada.desliza")} →</span>}
                    </div>
                  </div>
                ))}
              </div>
              {!scrollVertical && hojasDeFotos.length > 1 && <Puntos cantidad={hojasDeFotos.length} />}
            </div>
          </div>
        )}

        {/* ── 07 Música ──────────────────────────────────────────────────
            El parlante de playa: sobre tinta, el título con la segunda
            línea al sol, el ecualizador de colores y la lista en fichas
            blancas. */}
        {sugerenciaMusicaHabilitada && (
          <section id="songs" data-tone="dark" data-screen-label={tx("invitacion.musica.titulo")} className="tro-section tro-musica">
            <div className="tro-folio tro-folio--sol">
              <span data-xin="1" data-dist="-40">{nMusica} — Playlist</span>
              <span data-xin="1" data-dist="40">{folio(nMusica)}</span>
            </div>
            <div className="tro-spread">
              <div className="tro-pagina">
                <h2 data-xin="1" data-dist="-80" className="tro-h2 tro-h2--plano">
                  {tituloEnDosLineas(tx("invitacion.saveTheDate.preguntaTemaSuena"), "tro-sol")}
                </h2>
                <div data-xin="1" data-delay="120" className="tro-eq" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((i) => <span key={i} style={{ animationDelay: `${i * 0.18}s` }} />)}
                </div>
              </div>
              <div className="tro-pagina">
                <CancionesTropical
                  invitationId={String(invitation.id ?? "")}
                  guestToken={guest?.uniqueToken}
                  guestName={nombreInvitado || tx("invitacion.evento.invitado")}
                />
              </div>
            </div>
          </section>
        )}

        {/* ── 08 Regalos ─────────────────────────────────────────────────
            Sobre arena, fichas blancas con sombra de color. */}
        {hayRegalos && (
          <section id="banco" data-tone="light" data-screen-label={tx("invitacion.regalos.titulo")} className="tro-section tro-regalos">
            <div className="tro-folio tro-folio--acento">
              <span data-xin="1" data-dist="-40">{nRegalos} — {tx("invitacion.regalos.titulo")}</span>
              <span data-xin="1" data-dist="40">{folio(nRegalos)}</span>
            </div>
            <div className="tro-spread">
              <div className="tro-pagina">
                <h2 data-xin="1" data-dist="-80" className="tro-h2 tro-h2--sombra-sol">
                  {tx("invitacion.saveTheDate.tuRegalo")}<br />{tx("invitacion.saveTheDate.esVenir")}
                </h2>
                {Boolean(invitation.regaloMensaje) && (
                  <p data-xin="1" data-delay="120" className="tro-parrafo">{String(invitation.regaloMensaje)}</p>
                )}
              </div>
              <div className="tro-pagina">
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
            Sobre el sol con la ola del mar abajo, chip de tinta y opciones
            en píldoras blancas con sombra. */}
        {quizHabilitado && (
          <section id="quiz" data-tone="light" data-screen-label={triviaTitulo} className="tro-section tro-quiz">
            <Ola clase="tro-ola--quiz" />
            <div className="tro-folio">
              <span data-xin="1" data-dist="-40">{nQuiz} — Trivia</span>
              <span data-xin="1" data-dist="40">{folio(nQuiz)}</span>
            </div>
            <div className="tro-spread">
              <TriviaTropical
                preguntas={triviaPreguntas}
                invitationId={String(invitation.id ?? "")}
                guestToken={guest?.uniqueToken}
                guestName={nombreInvitado || tx("invitacion.evento.invitado")}
              />
            </div>
          </section>
        )}

        {/* ── 10 Tu pase ─────────────────────────────────────────────────
            Pulsera y QR: sobre el mar con la arena abajo y su ola, el QR
            con marco de tinta y sombra del acento, el pase gigante, la
            mesa al sol y "¡Nos vemos en la arena!". */}
        <section data-tone="dark" data-screen-label={tx("invitacion.pase.tuPase")} className="tro-section tro-pase">
          <span className="tro-pase-arena" aria-hidden="true" />
          <Ola clase="tro-ola--pase" />
          <div className="tro-folio">
            <span data-xin="1" data-dist="-40">{nPase} — {tx("invitacion.pase.tuPase")}</span>
            <span data-xin="1" data-dist="40">{folio(nPase)}</span>
          </div>
          <div className="tro-spread">
            <div data-xin="1" data-dist="-60" className="tro-pagina tro-pagina--qr">
              <div className="tro-qr">
                <QrDeIngreso guest={guest as never} />
                <span className="tro-qr-etq">{tx("invitacion.pase.tuPase")}</span>
              </div>
            </div>
            <div className="tro-pagina">
              <div data-xin="1" data-delay="100" className="tro-pase-cabeza">
                <div className="tro-pase-numero">
                  <span className="tro-folio-etq">{tx("invitacion.pase.pase")} Nº</span>
                  <span>{pase}</span>
                </div>
                {guest?.mesas && guest.mesas.length > 0 && (
                  <div className="tro-pase-mesa">
                    <span className="tro-folio-etq">{tx("invitacion.pase.tuMesa")}</span>
                    <span>{guest.mesas[0]}</span>
                  </div>
                )}
              </div>
              <div data-xin="1" data-delay="160" className="tro-caja">
                <div className="tro-linea"><span>{saludaAlInvitado ? tx("invitacion.pase.reservadoPara") : tx("invitacion.evento.invitado")}</span><span>{nombreInvitado || titulo}</span></div>
                {lugaresDelPase > 0 && (
                  <div className="tro-linea"><span>{tx("invitacion.pase.lugares")}</span><span>{lugaresDelPase}</span></div>
                )}
                {guest?.mesas && guest.mesas.length > 0 && (
                  <div className="tro-linea"><span>{tx("invitacion.pase.sector")} · {tx("invitacion.pase.tuMesa")}</span><span>{guest.mesas.join(" · ")}</span></div>
                )}
                <div className="tro-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{fechaPuntos} · {hora} h</span></div>
              </div>
              <div className="tro-info-extra">
                <InfoAdicionalSection invitation={invitation} />
              </div>
            </div>
          </div>
          <div data-xin="1" data-delay="220" className="tro-pase-pie">
            <span className="tro-despedida">{tx("invitacion.saveTheDate.nosVemosEnLaArena")} — {firma}</span>
            <div className="tro-folio tro-folio--colofon">
              <span className="tro-credito"><LogoFooterCredit bgColor="transparent" textColor={PALETA.ink} /></span>
              <span className="tro-replay" role="button" tabIndex={0} onClick={volverAVerla} onKeyDown={(e) => { if (e.key === "Enter") volverAVerla(); }}>
                {tx("invitacion.saveTheDate.volverALaPlaya")} ↺
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* ── Riel de progreso ───────────────────────────────────────────── */}
      <div ref={rielRef} className="tro-riel">
        <span ref={rielTopRef} className="tro-riel-top">{pase}</span>
        <div ref={rielLineaRef} className="tro-riel-linea">
          <span ref={rielBarraRef} className="tro-riel-barra" />
        </div>
        <span ref={rielEtiquetaRef} className="tro-riel-etiqueta">{tx("invitacion.saveTheDate.guardaLaFecha")}</span>
      </div>

      {/* ── La tapa ─────────────────────────────────────────────────────
          La playa: cielo con sol y nubes, mar con olas, arena; la palmera
          que se mece, la estrella de mar que flota y la sandía. En el
          centro el nombre en Lilita blanca con trazo y la cinta del
          evento. Es la bienvenida: dice de quién es la fiesta, cuándo,
          dónde y para cuántos. */}
      <div ref={portadaRef} data-tone={TONO} className="tro-portada">
        <div ref={escenaPortadaRef} className="tro-portada-hoja">
          <div className="tro-playa" aria-hidden="true">
            <span data-drift="-6" className="tro-sol-disco" />
            <span data-drift="4" className="tro-nube tro-nube--grande" />
            <span data-drift="6" className="tro-nube tro-nube--chica" />
            <span className="tro-mar" />
            <Ola clase="tro-ola--mar" />
            <Ola clase="tro-ola--espuma" />
            <span className="tro-arena" />
            <Ola clase="tro-ola--arena" />
            <svg data-drift="10" viewBox="0 0 160 200" className="tro-palmera">
              <path d="M66 200 C 70 160, 74 120, 78 76 L 90 78 C 88 120, 86 160, 88 200 Z" className="tro-tronco" />
              <g className="tro-anillos"><path d="M70 104 Q78 100 88 103" /><path d="M69 128 Q78 124 87 127" /><path d="M68 152 Q78 148 87 151" /><path d="M67 176 Q78 172 87 175" /></g>
              {FRONDAS.map(([rot, esc], i) => (
                <g key={i} transform={`rotate(${rot} 80 68) translate(80 68) scale(${esc})`} className={i % 2 === 0 ? "tro-fronda" : "tro-fronda tro-fronda--oscura"}>
                  <path d={FRONDA} /><path d={NERVIO} className="tro-nervio" />
                </g>
              ))}
              <g className="tro-cocos"><circle cx="76" cy="76" r="7" /><circle cx="90" cy="78" r="7" /><circle cx="83" cy="86" r="6" /></g>
            </svg>
            <svg data-drift="8" viewBox="0 0 60 60" className="tro-estrella-mar"><polygon points={ESTRELLA} /></svg>
            <svg data-drift="5" viewBox="0 0 80 50" className="tro-sandia"><path d="M4 46 A36 36 0 0 1 76 46 Z" className="tro-sandia-pulpa" /><path d="M4 46 A36 36 0 0 1 76 46" className="tro-sandia-cascara" /><circle cx="30" cy="34" r="2.5" /><circle cx="44" cy="28" r="2.5" /><circle cx="54" cy="38" r="2.5" /></svg>
          </div>

          <div data-cl="1" className="tro-tapa-cabecera">
            <span className="tro-chip tro-chip--tinta">{kickerDelEvento}</span>
            <span className="tro-chip tro-chip--blanco">Nº 00 / {String(totalPliegos).padStart(2, "0")}</span>
          </div>

          <div data-cl="2" className="tro-tapa-centro">
            <span className="tro-chip tro-chip--blanco tro-tapa-kicker">{diaSemana} {diaNum} · {mesLargo} · {anio}</span>
            <h1 ref={cartelRef} className={`tro-tapa-nombres${nombreLargo ? " tro-tapa-nombres--largo" : ""}`} style={{ "--largo": renglonMasLargo, "--n": totalLetras } as React.CSSProperties}>
              {renglones.map((r, i) => (
                <span key={i} className="tro-tapa-linea"><span data-pieza="1"><Letras texto={r} desde={i === 0 ? 0 : renglones[0].replace(/\s/g, "").length} /></span></span>
              ))}
            </h1>
            <span className="tro-cinta">{cintaDelEvento}</span>
            <div className="tro-tapa-datos">
              <span>{lugarNombre || kickerDelEvento}<br /><span className="tro-acento">{[direccion, ciudad].filter(Boolean).join(" · ")}</span></span>
              <span className="tro-tapa-datos-der">
                {isPersonalized && guest
                  ? <>{tx("invitacion.pase.pase")} Nº {pase}<br /><span className="tro-acento">{lugaresDelPase} {tx(lugaresDelPase === 1 ? "invitacion.bienvenida.persona" : "invitacion.bienvenida.personas")}</span></>
                  : <>{hora} h<br /><span className="tro-acento">{fechaPuntos}</span></>}
              </span>
            </div>
          </div>

          <div data-cl="3" className="tro-tapa-pie">
            <p className="tro-tapa-mensaje">
              {saludaAlInvitado
                ? `${tx("invitacion.bienvenida.hola", { nombre: nombreInvitado })}, ${String(invitation.portadaMensaje || tx("invitacion.saveTheDate.mensajeTropical"))}`
                : String(invitation.portadaMensaje || tx("invitacion.saveTheDate.mensajeTropical"))}
            </p>
            <button type="button" onClick={abrir} className="tro-tapa-btn">
              <span>{tx("invitacion.portada.abrirInvitacion")}</span><span>→</span>
            </button>
          </div>
        </div>
      </div>

      <div ref={pistaRef} className="tro-pista">{tx("invitacion.portada.desliza")} ↓</div>

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

/** "V & T": las iniciales de la despedida. */
function iniciales(a: string, b: string): string {
  const i = (s: string) => (s.trim()[0] || "").toUpperCase();
  return b ? `${i(a)} & ${i(b)}` : i(a);
}

/**
 * El nombre letra por letra: cada tanto una "flota" (sube 14 px y gira
 * 6°) y vuelve rebotando. El CSS escalona el turno de cada letra.
 */
function Letras({ texto, desde }: { texto: string; desde: number }) {
  let k = desde;
  return (
    <>
      {Array.from(texto).map((ch, i) =>
        ch === " " ? " " : <span key={i} className="tro-letra" style={{ "--i": k++ } as React.CSSProperties}>{ch}</span>
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
        <div key={c.l} data-xin="1" data-delay={i * 100} data-dist={i % 2 === 0 ? -80 : 80} className={`tro-cuenta-caja tro-cuenta-caja--${i + 1}`}>
          <span className="tro-cuenta-num"><span key={c.v}>{c.v}</span></span>
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
  /* ── Tropical ─────────────────────────────────────────────────────────
     Etiqueta de bebida en la playa: Lilita One blanca con trazo de tinta
     y sombra plana de color, Quicksand para el texto. Cielo, sol, mar con
     olas que corren, arena, palmera que se mece, estrella de mar,
     sandía, radiocasete con parlantes girando. Todo CSS + SVG inline. */
  .tro-raiz { position: fixed; inset: 0; width: 100%; height: calc(var(--vh, 1vh) * 100); overflow: hidden;
    background: var(--pp-bg); color: var(--pp-ink); font-family: var(--tro-sans), 'Quicksand', sans-serif;
    --tro-cielo: var(--pp-bg); --tro-arena: var(--pp-bg2); --tro-mar: var(--pp-acc2);
    --tro-sol: ${PALETA.sun}; --tro-hoja: ${PALETA.leaf}; --tro-hoja2: ${PALETA.leaf2}; --tro-tronco: ${PALETA.trunk}; }
  .tro-raiz a { color: inherit; text-decoration: none; }
  .tro-raiz button { font: inherit; }

  .tro-scroller { position: absolute; inset: 0; overflow-y: auto; overflow-x: hidden; opacity: 0;
    transition: opacity 900ms ease 260ms; scrollbar-width: none; }
  .tro-scroller::-webkit-scrollbar { width: 0; height: 0; }

  /* Las olas: el path corre 120 px y vuelve a empezar sin costura. */
  .tro-ola { position: absolute; left: 0; right: 0; height: 22px; overflow: hidden; pointer-events: none; z-index: 0; }
  .tro-ola svg { position: absolute; left: 0; top: 0; width: 200%; height: 100%; animation: troOla 4s linear infinite; }
  .tro-ola path { fill: var(--tro-ola-color, var(--tro-mar)); }
  @keyframes troOla { to { transform: translate3d(-120px, 0, 0); } }
  .tro-ola--std { top: 0; --tro-ola-color: var(--tro-mar); }
  .tro-ola--std svg { animation: none; }
  .tro-ola--panel { bottom: 0; --tro-ola-color: var(--tro-panel-ola, var(--tro-mar)); }
  .tro-ola--quiz { bottom: 0; --tro-ola-color: var(--tro-mar); }
  .tro-ola--pase { bottom: 26%; margin-bottom: -11px; --tro-ola-color: var(--tro-arena); }
  .tro-ola--pase svg { animation-duration: 5s; }
  /* El grano de arena y los lunares. */
  .tro-grano { position: absolute; inset: 0; pointer-events: none; z-index: 0; opacity: .5;
    background-image: radial-gradient(#C9A87A 1px, transparent 1.2px), radial-gradient(#C9A87A 1px, transparent 1.2px); background-size: 14px 14px; background-position: 3px 4px, 10px 11px; }
  .tro-lunares { position: absolute; inset: 0; pointer-events: none; z-index: 0; opacity: .25; background-image: radial-gradient(#FFFFFF 3px, transparent 3.2px); background-size: 16px 16px;
    -webkit-mask-image: linear-gradient(90deg, #000, transparent 60%); mask-image: linear-gradient(90deg, #000, transparent 60%); }

  /* ── El pliego ─────────────────────────────────────────────────────── */
  .tro-section { position: relative; z-index: 1; min-height: calc(var(--vh, 1vh) * 100); box-sizing: border-box; overflow: hidden;
    display: flex; flex-direction: column; gap: 22px;
    padding: 60px max(20px, calc((100% - 1100px) / 2)) 80px; background: var(--pp-bg); color: var(--pp-ink); }

  /* El folio: Quicksand 700 con tracking. */
  .tro-folio { position: relative; z-index: 1; display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;
    font-weight: 700; font-size: 11px; letter-spacing: .24em; text-transform: uppercase; }
  .tro-folio--acento { color: var(--pp-acc); }
  .tro-folio--sol { color: var(--tro-sol); }
  .tro-folio--blanco { color: #FFFFFF; }
  .tro-folio--gris { color: #6E6A78; }
  .tro-folio--pie { align-items: center; margin-top: auto; letter-spacing: .22em; }
  .tro-folio--colofon { align-items: center; border-top: 3px solid var(--pp-ink); padding-top: 12px; color: var(--pp-ink); }
  .tro-folio-etq { font-weight: 700; font-size: 11px; letter-spacing: .24em; text-transform: uppercase; display: block; }
  .tro-barra { width: 40%; height: 4px; background: var(--pp-ink); border-radius: 2px; }
  .tro-acento { color: var(--pp-acc); }
  .tro-sol { color: var(--tro-sol); }

  /* El spread: dos páginas; desde 1024 px se abren de verdad. */
  .tro-spread { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 22px; }
  .tro-pagina { display: flex; flex-direction: column; gap: 14px; min-width: 0; }
  .tro-pagina--titulo { gap: 6px; }
  @media (min-width: 1024px) {
    .tro-spread { display: grid; grid-template-columns: 1fr 1fr; align-items: center; column-gap: 72px; }
    .tro-spread > * { max-width: 560px; width: 100%; min-width: 0; }
    .tro-spread > *:first-child { justify-self: end; }
    .tro-spread > *:last-child { justify-self: start; }
    .tro-pagina--entera { grid-column: 1 / -1; max-width: none; justify-self: stretch; }
  }

  /* ── Tipos ─────────────────────────────────────────────────────────── */
  .tro-h2, .tro-panel-titulo, .tro-frase, .tro-fecha-linea, .tro-tapa-nombres { font-family: var(--tro-serif), 'Lilita One', cursive; font-weight: 400; }
  /* El título: blanco con trazo de tinta y sombra plana de color. */
  .tro-h2, .tro-panel-titulo { position: relative; z-index: 1; margin: 0; line-height: .92; font-size: clamp(48px, 14vw, 120px);
    color: #FFFFFF; -webkit-text-stroke: 2px var(--pp-ink); paint-order: stroke fill; text-shadow: 5px 6px 0 var(--pp-acc); }
  .tro-h2--album { font-size: clamp(44px, 12vw, 100px); text-shadow: 4px 5px 0 var(--tro-mar); -webkit-text-stroke: 2px #2C3A4A; }
  .tro-h2--sombra-tinta { text-shadow: 5px 6px 0 var(--pp-ink); }
  .tro-h2--sombra-sol { text-shadow: 5px 6px 0 var(--tro-sol); }
  .tro-h2--plano { -webkit-text-stroke: 0; text-shadow: 5px 6px 0 var(--tro-mar); }
  .tro-panel-titulo { text-shadow: 5px 6px 0 var(--tro-panel-acc, var(--pp-acc)); }
  .tro-panel-sub { font-weight: 700; font-size: 12px; letter-spacing: .22em; text-transform: uppercase; }
  .tro-parrafo { margin: 0; font-weight: 700; font-size: 15px; line-height: 1.5; max-width: 40ch; }
  .tro-parrafo--blanco { color: #FFFFFF; }
  .tro-pildora { display: inline-flex; align-items: center; gap: 8px; border-radius: 999px; padding: 12px 18px; font-weight: 700; font-size: 12px; letter-spacing: .16em; text-transform: uppercase; }
  .tro-pildora--tinta { background: var(--pp-ink); color: #FFFFFF; }
  .tro-chip { display: inline-block; padding: 6px 12px; border-radius: 999px; font-weight: 700; font-size: 11px; letter-spacing: .24em; text-transform: uppercase; white-space: nowrap; }
  .tro-chip--tinta { background: var(--pp-ink); color: #FFFFFF; }
  .tro-chip--blanco { background: #FFFFFF; color: var(--pp-ink); }
  .tro-cta { margin-top: 6px; min-height: 48px; display: flex; align-items: center; justify-content: space-between; border-radius: 999px; padding: 0 18px;
    color: #FFFFFF; background: var(--pp-ink); font-family: var(--tro-serif), 'Lilita One', cursive; font-size: 18px; letter-spacing: .04em; }

  /* ── 01 Guardá la fecha: etiqueta de botella ───────────────────────── */
  .tro-std { background: var(--tro-arena); }
  .tro-fecha { display: flex; flex-direction: column; line-height: .9; }
  .tro-fecha-linea { font-size: clamp(56px, 18vw, 150px); -webkit-text-stroke: 2px var(--pp-ink); paint-order: stroke fill; }
  .tro-fecha-linea--dia { font-size: clamp(96px, 32vw, 240px); color: var(--pp-acc); text-shadow: 6px 6px 0 #FFFFFF; }
  .tro-fecha-linea--mes { text-align: right; color: var(--tro-mar); }
  .tro-fecha-linea--anio { color: var(--tro-sol); }
  .tro-fecha-pie { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 10px; font-weight: 700; font-size: 12px; letter-spacing: .16em; text-transform: uppercase; }
  /* La foto: marco blanco, filete de tinta y sombra de mar. */
  .tro-foto { position: relative; width: 100%; aspect-ratio: 4 / 5; border: 4px solid #FFFFFF; border-radius: 22px; box-sizing: border-box; overflow: hidden;
    box-shadow: 0 0 0 3px var(--pp-ink), 8px 8px 0 var(--tro-mar); background: repeating-linear-gradient(135deg, #C9BFAE 0 8px, #D9D0C0 8px 16px); }
  .tro-foto-capa { position: absolute; inset: 0; overflow: hidden; }
  .tro-foto-revelado { position: absolute; inset: 0; z-index: 1; pointer-events: none;
    background-image: radial-gradient(var(--tro-mar) calc(var(--tro-punto, 7.2) * 1px), transparent calc(var(--tro-punto, 7.2) * 1px + .6px));
    background-size: 10px 10px; }
  .tro-foto-etq { position: absolute; left: 14px; bottom: 12px; z-index: 2; font-weight: 700; font-size: 12px; letter-spacing: .2em; text-transform: uppercase; color: #FFFFFF; background: var(--pp-ink); padding: 4px 10px; border-radius: 999px; }
  .tro-barras { position: absolute; right: 12px; top: 12px; z-index: 2; display: flex; gap: 2px; align-items: flex-end; background: #FFFFFF; padding: 6px 8px; border-radius: 6px; }
  .tro-barras span { display: block; height: 26px; background: #2C3A4A; }

  /* ── 02 Falta poco: el radiocasete ─────────────────────────────────── */
  .tro-countdown { background: var(--tro-mar); color: #FFFFFF; justify-content: space-between; padding-left: 0; padding-right: 0; }
  .tro-countdown > .tro-folio, .tro-countdown > .tro-spread { margin-left: max(20px, calc((100% - 1100px) / 2)); margin-right: max(20px, calc((100% - 1100px) / 2)); }
  .tro-marquesina { position: relative; z-index: 1; overflow: hidden; padding: 8px 0; white-space: nowrap; color: var(--pp-ink);
    border-top: 3px solid var(--pp-ink); border-bottom: 3px solid var(--pp-ink); font-weight: 700; font-size: 13px; letter-spacing: .2em; text-transform: uppercase; }
  .tro-marquesina--sol { background: var(--tro-sol); transform: rotate(-2deg) scale(1.04); padding: 6px 0;
    font-family: var(--tro-serif), 'Lilita One', cursive; font-weight: 400; font-size: 26px; letter-spacing: .06em; text-transform: none; }
  .tro-marquesina--blanca { background: #FFFFFF; transform: rotate(2deg) scale(1.04); }
  .tro-marquesina-tira { display: flex; width: max-content; animation: troCorre 16s linear infinite; }
  .tro-marquesina-tira > span { padding-right: 32px; }
  .tro-marquesina--contraria .tro-marquesina-tira { animation-direction: reverse; }
  @keyframes troCorre { to { transform: translate3d(-50%, 0, 0); } }
  .tro-radio { position: relative; background: var(--pp-ink); border-radius: 26px; padding: 18px 14px 16px; display: flex; flex-direction: column; gap: 14px; border: 4px solid #FFFFFF; box-shadow: 8px 8px 0 rgba(44,58,74,.35); margin-top: 22px; }
  .tro-radio-asa { position: absolute; left: 50%; top: -26px; transform: translateX(-50%); width: 46%; height: 18px; border: 4px solid #FFFFFF; border-bottom: 0; border-radius: 12px 12px 0 0; background: var(--pp-ink); box-sizing: border-box; }
  .tro-cuenta { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .tro-cuenta-caja { position: relative; background: #FFFFFF; color: var(--pp-ink); border-radius: 16px; padding: 14px 12px 12px; display: flex; flex-direction: column; align-items: center; gap: 4px; overflow: hidden; }
  .tro-cuenta-caja--1 { background: var(--pp-acc); }
  .tro-cuenta-caja--2 { background: var(--tro-sol); }
  .tro-cuenta-caja--3 { background: var(--tro-arena); }
  .tro-cuenta-num { font-family: var(--tro-serif), 'Lilita One', cursive; font-size: clamp(56px, 17vw, 130px); line-height: .9; font-variant-numeric: tabular-nums; }
  .tro-cuenta-num > span { display: inline-block; animation: troCifra 300ms cubic-bezier(.16,1,.3,1); }
  @keyframes troCifra { from { transform: translateY(18%); opacity: .4; } to { transform: none; opacity: 1; } }
  .tro-cuenta-etq { font-weight: 700; font-size: 11px; letter-spacing: .22em; text-transform: uppercase; }
  .tro-radio-pie { display: flex; justify-content: space-between; align-items: center; padding: 0 6px; }
  .tro-parlante { width: 44px; height: 44px; border-radius: 50%; border: 5px solid var(--tro-arena); border-top-color: var(--pp-acc); box-sizing: border-box; animation: troGira 3s linear infinite; }
  @keyframes troGira { to { transform: rotate(360deg); } }
  .tro-radio-etq { font-weight: 700; font-size: 11px; letter-spacing: .2em; text-transform: uppercase; color: var(--tro-arena); }
  .tro-tarjeta--hoy { background: var(--tro-sol); color: var(--pp-ink); border-radius: 16px; padding: 18px; display: flex; flex-direction: column; gap: 6px; align-items: center; text-align: center; }
  .tro-tarjeta--hoy .tro-tarjeta-kicker { font-weight: 700; font-size: 11px; letter-spacing: .22em; text-transform: uppercase; }
  .tro-tarjeta--hoy .tro-tarjeta-titulo { font-family: var(--tro-serif), 'Lilita One', cursive; font-size: clamp(40px, 11vw, 90px); line-height: .9; color: #FFFFFF; -webkit-text-stroke: 2px var(--pp-ink); paint-order: stroke fill; text-shadow: 4px 5px 0 var(--pp-acc); }

  /* ── 03 Unas palabras: escrito en la arena ─────────────────────────── */
  .tro-frase-seccion { background: var(--tro-arena); justify-content: space-between; gap: 30px; }
  .tro-frase { margin: 0; font-size: clamp(34px, 9.5vw, 80px); line-height: 1.02; max-width: 15ch; color: #FFFFFF; -webkit-text-stroke: 2px var(--pp-ink); paint-order: stroke fill; text-shadow: 4px 5px 0 var(--tro-mar); }
  .tro-pastilla { align-self: flex-end; display: flex; align-items: center; gap: 12px; background: #FFFFFF; color: var(--pp-ink); border: 3px solid var(--pp-ink); border-radius: 999px; padding: 12px 20px; max-width: 320px;
    font-weight: 700; font-size: 14px; line-height: 1.4; box-shadow: 4px 5px 0 var(--pp-acc); animation: troFlota 4s ease-in-out infinite; }
  .tro-pastilla-estrella { width: 26px; height: 26px; flex: 0 0 auto; fill: var(--pp-acc); stroke: var(--pp-ink); stroke-width: 3; stroke-linejoin: round; }
  @keyframes troFlota { 0%, 100% { transform: translateY(0) rotate(-3deg); } 50% { transform: translateY(-10px) rotate(3deg); } }

  /* ── 04 Los paradores ──────────────────────────────────────────────── */
  .tro-pan { position: relative; z-index: 1; height: calc(100vh + var(--st-pasos, 2) * 90vh); }
  .tro-pan-fijo { position: sticky; top: 0; height: calc(var(--vh, 1vh) * 100); overflow: hidden; background: var(--tro-cielo); }
  .tro-pan-fijo--album { background: #F7F5F0; }
  .tro-tira { position: absolute; top: 0; left: 0; height: 100%; display: flex; will-change: transform; }
  .tro-panel { flex: 0 0 100vw; min-width: 0; height: 100%; box-sizing: border-box; position: relative; overflow: hidden;
    display: flex; flex-direction: column; justify-content: space-between; gap: 18px;
    padding: 60px max(20px, calc((100vw - 1100px) / 2)) 92px; background: var(--tro-cielo); color: var(--pp-ink); }
  .tro-panel--cielo { --tro-panel-acc: var(--pp-acc); --tro-panel-ola: var(--tro-mar); }
  .tro-panel--arena { --tro-panel-acc: var(--tro-mar); --tro-panel-ola: var(--tro-cielo); background: var(--tro-arena); }
  .tro-panel--mapa { --tro-panel-acc: var(--tro-hoja); }
  .tro-panel--mar { --tro-panel-acc: var(--tro-sol); --tro-panel-ola: var(--tro-arena); background: var(--tro-mar); color: #FFFFFF; }
  .tro-pan[data-scroll="vertical"] { height: auto; }
  .tro-pan[data-scroll="vertical"] .tro-pan-fijo { position: static; height: auto; overflow: visible; }
  .tro-pan[data-scroll="vertical"] .tro-tira { position: static; display: block; width: 100%; transform: none !important; }
  .tro-pan[data-scroll="vertical"] .tro-panel { height: auto; min-height: calc(var(--vh, 1vh) * 100); }
  .tro-ficha { background: #FFFFFF; color: var(--pp-ink); border: 3px solid var(--pp-ink); border-radius: 20px; padding: 14px 16px; box-shadow: 6px 7px 0 var(--tro-panel-acc, var(--pp-acc)); display: flex; flex-direction: column; gap: 8px; }
  .tro-linea { display: flex; justify-content: space-between; gap: 14px; padding: 8px 0; border-bottom: 2px dotted var(--pp-ink); font-size: 15px; line-height: 1.3; }
  .tro-linea > span:first-child { font-weight: 700; font-size: 11px; letter-spacing: .18em; text-transform: uppercase; opacity: .7; flex: 0 0 auto; padding-top: 2px; }
  .tro-linea > span:last-child { text-align: right; font-weight: 700; }
  .tro-mapa { height: 190px; overflow: hidden; border-radius: 12px; border: 3px solid var(--pp-ink); }
  .tro-puntos { position: absolute; left: 0; right: 40px; bottom: 30px; display: flex; gap: 8px; justify-content: center; z-index: 2; color: var(--pp-ink); }
  .tro-punto { width: 14px; height: 14px; border-radius: 50%; background: currentColor !important; opacity: .3; transition: opacity 300ms ease; display: inline-block; }
  .tro-punto[data-activo="1"] { opacity: 1; }

  /* ── 05 Check-in: la pulsera de playa ──────────────────────────────── */
  .tro-checkin { background: var(--pp-acc); }
  .tro-cupon { position: relative; background: #FFFFFF; color: var(--pp-ink); border: 3px solid var(--pp-ink); border-radius: 22px; padding: 20px; display: flex; flex-direction: column; gap: 14px; overflow: hidden;
    box-shadow: 7px 8px 0 var(--pp-ink); }
  .tro-cupon .tro-tarjeta { position: relative; display: flex; flex-direction: column; gap: 14px; background: transparent; border: 0; padding: 0; transform: none !important; }
  .tro-talon-top { display: flex; justify-content: space-between; align-items: center; gap: 10px; font-weight: 700; font-size: 11px; letter-spacing: .2em; text-transform: uppercase; opacity: .7; border-bottom: 3px dotted var(--pp-ink); padding-bottom: 12px; }
  .tro-talon-estado { transition: color 400ms ease; }
  .tro-cupon:has(.tro-filas) .tro-talon-estado { color: var(--pp-acc); }
  .tro-campo { display: flex; flex-direction: column; gap: 6px; }
  .tro-etiqueta { font-weight: 700; font-size: 11px; letter-spacing: .18em; text-transform: uppercase; opacity: .8; }
  .tro-input { min-height: 48px; border: 0; border-bottom: 3px solid var(--pp-ink); border-radius: 0; background: transparent; color: var(--pp-ink);
    font-family: var(--tro-sans), 'Quicksand', sans-serif; font-weight: 600; font-size: 15px; padding: 0; outline: none; }
  .tro-campo:first-of-type .tro-input, .tro-input--serif { font-family: var(--tro-serif), 'Lilita One', cursive; font-size: 18px; }
  .tro-contador { display: flex; align-items: center; border-bottom: 3px solid var(--pp-ink); min-height: 48px; }
  .tro-contador button { width: 44px; min-height: 44px; border: 0; background: transparent; color: var(--pp-ink); cursor: pointer; font-family: var(--tro-serif), 'Lilita One', cursive; font-size: 24px; line-height: 1; }
  .tro-contador button:disabled { opacity: .35; cursor: default; }
  .tro-contador > span { flex: 1; text-align: center; font-family: var(--tro-serif), 'Lilita One', cursive; font-size: 28px; line-height: 1; color: var(--pp-acc); }
  .tro-filas { display: flex; flex-direction: column; }
  .tro-fila { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 2px dotted var(--pp-ink); font-size: 15px; }
  .tro-fila--ultima { border-bottom: 0; }
  .tro-fila-valor { text-align: right; font-weight: 700; }
  .tro-precio { display: flex; justify-content: space-between; gap: 12px; font-weight: 700; font-size: 12px; letter-spacing: .12em; text-transform: uppercase; opacity: .8; padding-top: 4px; }
  .tro-precio-valor { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
  .tro-precio-total { font-family: var(--tro-serif), 'Lilita One', cursive; font-size: 22px; line-height: 1; color: var(--pp-acc); }
  .tro-precio-detalle { font-size: 11px; letter-spacing: .1em; }
  .tro-btn-solido { min-height: 54px; border: 3px solid var(--pp-ink); border-radius: 999px; background: var(--tro-sol); color: var(--pp-ink); cursor: pointer;
    font-family: var(--tro-serif), 'Lilita One', cursive; font-size: 20px; letter-spacing: .04em; padding: 2px 18px 0; box-shadow: 4px 5px 0 var(--pp-ink); transition: background 200ms ease, color 200ms ease; }
  @media (hover: hover) { .tro-btn-solido:hover { background: var(--tro-mar); color: #FFFFFF; } }
  .tro-btn-solido:disabled { opacity: .6; cursor: default; }
  .tro-btn-fantasma { min-height: 48px; border: 3px solid var(--pp-ink); border-radius: 999px; background: transparent; color: var(--pp-ink); cursor: pointer;
    font-family: var(--tro-serif), 'Lilita One', cursive; font-size: 18px; padding: 2px 18px 0; }
  .tro-error { margin: 0; font-weight: 700; font-size: 12px; color: var(--pp-acc); }
  /* La estrella "¡Sí!": diez puntas del acento. */
  .tro-cupon .tro-sello { position: absolute; right: 12px; bottom: 78px; width: 134px; aspect-ratio: 1; pointer-events: none;
    opacity: 0; transform: rotate(18deg) scale(1.9) translateY(-120px);
    background: var(--pp-acc); clip-path: polygon(50% 3%, 62% 36%, 97% 38%, 69% 59%, 79% 94%, 50% 74%, 21% 94%, 31% 59%, 3% 38%, 38% 36%);
    display: flex; align-items: flex-end; justify-content: center; padding-bottom: 30px; box-sizing: border-box;
    font-weight: 700; font-size: 7px; letter-spacing: .14em; text-transform: uppercase; color: #FFFFFF; }
  .tro-cupon .tro-sello::before { content: "¡Sí!"; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
    font-family: var(--tro-serif), 'Lilita One', cursive; font-size: 26px; letter-spacing: 0; color: #FFFFFF; -webkit-text-stroke: 1px var(--pp-ink); paint-order: stroke fill; }
  .tro-petalos { display: none; }

  /* ── 06 Álbum: postales ────────────────────────────────────────────── */
  .tro-panel--album { background: #F7F5F0; color: #2C3A4A; justify-content: flex-start; gap: 14px; }
  .tro-panel--album-b { background: #EFEBE3; }
  .tro-hoja { flex: 1; min-height: 0; display: grid; grid-template-columns: repeat(6, 1fr); grid-template-rows: repeat(3, 1fr); gap: 10px; max-width: 900px; }
  .tro-foto-hoja { position: relative; overflow: hidden; min-height: 0; cursor: pointer; border: 5px solid #FFFFFF; border-radius: 12px; box-shadow: 0 0 0 2px #2C3A4A;
    background: repeating-linear-gradient(135deg, #D7D1C4 0 8px, #E6E1D6 8px 16px); }
  .tro-foto-hoja:nth-child(1) { transform: rotate(-1.5deg); }
  .tro-foto-hoja:nth-child(2) { transform: rotate(1.5deg); }
  .tro-foto-hoja:nth-child(3) { transform: rotate(-1deg); }
  .tro-foto-hoja:nth-child(4) { transform: rotate(2deg); }
  .tro-foto-hoja:nth-child(5) { transform: rotate(.5deg); }
  .tro-foto-hoja-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
  .tro-bano { position: absolute; inset: 0; mix-blend-mode: multiply; opacity: 0; transition: opacity 200ms linear; }
  .tro-bano--1 { background: color-mix(in srgb, var(--pp-acc) 50%, transparent); }
  .tro-bano--2 { background: color-mix(in srgb, var(--tro-mar) 50%, transparent); }
  .tro-bano--3 { background: color-mix(in srgb, var(--tro-sol) 60%, transparent); }
  .tro-bano--4 { background: color-mix(in srgb, var(--tro-hoja) 45%, transparent); }
  .tro-bano--5 { background: color-mix(in srgb, var(--tro-cielo) 60%, transparent); }
  .tro-foto-hoja-n { position: absolute; left: 8px; bottom: 6px; z-index: 1; font-weight: 700; font-size: 11px; letter-spacing: .14em; color: #2C3A4A; }
  .tro-hoja[data-cantidad="5"] .tro-foto-hoja:nth-child(1) { grid-column: 1 / 4; grid-row: 1 / 3; }
  .tro-hoja[data-cantidad="5"] .tro-foto-hoja:nth-child(2) { grid-column: 4 / 7; grid-row: 1 / 2; }
  .tro-hoja[data-cantidad="5"] .tro-foto-hoja:nth-child(3) { grid-column: 4 / 6; grid-row: 2 / 3; }
  .tro-hoja[data-cantidad="5"] .tro-foto-hoja:nth-child(4) { grid-column: 6 / 7; grid-row: 2 / 3; }
  .tro-hoja[data-cantidad="5"] .tro-foto-hoja:nth-child(5) { grid-column: 1 / 7; grid-row: 3 / 4; }
  .tro-hoja[data-cantidad="4"] .tro-foto-hoja:nth-child(1) { grid-column: 1 / 4; grid-row: 1 / 3; }
  .tro-hoja[data-cantidad="4"] .tro-foto-hoja:nth-child(2) { grid-column: 4 / 7; grid-row: 1 / 2; }
  .tro-hoja[data-cantidad="4"] .tro-foto-hoja:nth-child(3) { grid-column: 4 / 7; grid-row: 2 / 3; }
  .tro-hoja[data-cantidad="4"] .tro-foto-hoja:nth-child(4) { grid-column: 1 / 7; grid-row: 3 / 4; }
  .tro-hoja[data-cantidad="3"] .tro-foto-hoja:nth-child(1) { grid-column: 1 / 4; grid-row: 1 / 4; }
  .tro-hoja[data-cantidad="3"] .tro-foto-hoja:nth-child(2) { grid-column: 4 / 7; grid-row: 1 / 3; }
  .tro-hoja[data-cantidad="3"] .tro-foto-hoja:nth-child(3) { grid-column: 4 / 7; grid-row: 3 / 4; }
  .tro-hoja[data-cantidad="2"] .tro-foto-hoja:nth-child(1) { grid-column: 1 / 4; grid-row: 1 / 4; }
  .tro-hoja[data-cantidad="2"] .tro-foto-hoja:nth-child(2) { grid-column: 4 / 7; grid-row: 1 / 4; }
  .tro-hoja[data-cantidad="1"] .tro-foto-hoja:nth-child(1) { grid-column: 1 / 7; grid-row: 1 / 4; }

  /* ── 07 Música: el parlante de playa ───────────────────────────────── */
  .tro-musica { background: var(--pp-ink); color: #FFFFFF; }
  .tro-eq { display: flex; align-items: flex-end; gap: 6px; height: 44px; }
  .tro-eq span { width: 12px; height: 100%; background: var(--tro-mar); border-radius: 6px; transform-origin: bottom; animation: troEq 1.1s ease-in-out infinite; }
  .tro-eq span:nth-child(2) { background: var(--pp-acc); }
  .tro-eq span:nth-child(3) { background: var(--tro-sol); }
  .tro-eq span:nth-child(4) { background: var(--tro-hoja); }
  .tro-eq span:nth-child(5) { background: #FFFFFF; }
  @keyframes troEq { 0%, 100% { transform: scaleY(.3); } 50% { transform: scaleY(1); } }
  .tro-musica form.tro-tarjeta { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; transform: none !important; }
  .tro-musica .tro-etiqueta { display: none; }
  .tro-musica .tro-input { min-height: 48px; border: 3px solid #FFFFFF; border-radius: 14px; background: transparent; color: #FFFFFF; font-family: var(--tro-sans), 'Quicksand', sans-serif; font-weight: 700; font-size: 15px; padding: 0 14px; min-width: 0; }
  .tro-musica .tro-input::placeholder { color: rgba(255,255,255,.6); }
  .tro-musica .tro-error { grid-column: 1 / -1; }
  .tro-musica .tro-btn-solido { grid-column: 1 / -1; min-height: 50px; border-color: #FFFFFF; background: var(--tro-sol); color: var(--pp-ink); font-size: 19px; box-shadow: none; }
  @media (hover: hover) { .tro-musica .tro-btn-solido:hover { background: var(--pp-acc); color: #FFFFFF; } }
  .tro-lista { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
  .tro-lista-fila { display: flex; align-items: center; gap: 12px; padding: 10px 14px; background: #FFFFFF; color: var(--pp-ink); border-radius: 16px; }
  .tro-lista-fila::before { content: ""; width: 14px; height: 14px; border-radius: 50%; background: var(--pp-acc); flex: 0 0 auto; }
  .tro-lista-fila:nth-child(3n+2)::before { background: var(--tro-mar); }
  .tro-lista-fila:nth-child(3n)::before { background: var(--tro-hoja); }
  .tro-lista-texto { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .tro-lista-tema { font-weight: 700; font-size: 17px; line-height: 1.1; }
  .tro-lista-quien { font-weight: 700; font-size: 12px; letter-spacing: .1em; text-transform: uppercase; opacity: .7; }

  /* ── 08 Regalos ────────────────────────────────────────────────────── */
  .tro-regalos { background: var(--tro-arena); }
  .tro-tarjeta--banco { --tro-sombra: var(--pp-acc); position: relative; z-index: 1; background: #FFFFFF; color: var(--pp-ink); border: 3px solid var(--pp-ink); border-radius: 20px; padding: 16px 18px;
    display: flex; flex-direction: column; gap: 10px; box-shadow: 6px 7px 0 var(--tro-sombra); transform: none !important; }
  .tro-tarjeta--der { --tro-sombra: var(--tro-mar); }
  .tro-tarjeta--banco + .tro-tarjeta--banco { margin-top: 14px; }
  .tro-tarjeta-kicker { font-weight: 700; font-size: 11px; letter-spacing: .2em; text-transform: uppercase; opacity: .7; }
  .tro-tarjeta-mensaje { margin: 0; font-weight: 600; font-size: 14px; line-height: 1.5; opacity: .8; }
  .tro-fila-texto { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .tro-fila-etq { font-weight: 700; font-size: 10px; letter-spacing: .2em; text-transform: uppercase; opacity: .7; }
  .tro-fila-dato { font-weight: 700; font-size: 14px; letter-spacing: .04em; overflow-wrap: anywhere; }
  .tro-fila--copiable:first-child .tro-fila-dato { font-family: var(--tro-serif), 'Lilita One', cursive; font-weight: 400; font-size: 22px; line-height: 1; color: var(--tro-sombra); -webkit-text-stroke: 1px var(--pp-ink); paint-order: stroke fill; }
  .tro-tarjeta--banco .tro-fila--ultima { border-bottom: 0; font-weight: 700; font-size: 12px; letter-spacing: .1em; text-transform: uppercase; opacity: .7; }
  .tro-btn-copiar { flex: 0 0 auto; min-height: 44px; padding: 0 14px; border: 3px solid var(--pp-ink); border-radius: 999px; background: var(--tro-sombra); color: #FFFFFF; cursor: pointer;
    font-weight: 700; font-size: 12px; letter-spacing: .12em; text-transform: uppercase; }
  .tro-btn-copiar--hecho { background: var(--pp-ink); }

  /* ── 09 Trivia ─────────────────────────────────────────────────────── */
  .tro-quiz { background: var(--tro-sol); }
  .tro-quiz .tro-tarjeta { display: flex; flex-direction: column; gap: 12px; transform: none !important; }
  .tro-quiz .tro-tarjeta-kicker { align-self: flex-start; background: var(--pp-ink); color: #FFFFFF; border-radius: 999px; font-weight: 700; font-size: 11px; letter-spacing: .2em; text-transform: uppercase; padding: 8px 16px; opacity: 1; }
  .tro-quiz .tro-tarjeta-pregunta, .tro-quiz .tro-tarjeta-titulo { font-family: var(--tro-serif), 'Lilita One', cursive; font-size: clamp(38px, 10.5vw, 90px); line-height: .96; max-width: 14ch;
    color: #FFFFFF; -webkit-text-stroke: 2px var(--pp-ink); paint-order: stroke fill; text-shadow: 4px 5px 0 var(--pp-acc); }
  .tro-quiz .tro-tarjeta-mensaje { margin: 0; font-weight: 700; font-size: 15px; opacity: 1; }
  .tro-opciones { display: flex; flex-direction: column; gap: 10px; counter-reset: opcion; }
  .tro-opcion { min-height: 54px; border: 3px solid var(--pp-ink); border-radius: 999px; background: #FFFFFF; color: var(--pp-ink); cursor: pointer; counter-increment: opcion;
    font-family: var(--tro-sans), 'Quicksand', sans-serif; font-weight: 700; font-size: 16px; text-align: left; padding: 0 20px; box-shadow: 4px 5px 0 var(--pp-ink);
    display: flex; justify-content: space-between; align-items: center; gap: 12px; transition: background 200ms ease, color 200ms ease; }
  .tro-opcion::after { content: counter(opcion, upper-alpha); font-family: var(--tro-serif), 'Lilita One', cursive; font-size: 18px; }
  .tro-opcion--bien { background: var(--tro-mar); color: #FFFFFF; }
  .tro-opcion--bien::after { content: "☼ ¡Sí!"; }
  .tro-opcion--mal { background: var(--pp-acc); color: #FFFFFF; }
  .tro-opcion--mal::after { content: "Casi"; }
  @media (min-width: 1024px) {
    .tro-quiz .tro-spread > .tro-tarjeta { grid-column: 1 / -1; max-width: none; justify-self: stretch; display: grid; grid-template-columns: 1fr 1fr; column-gap: 72px; align-items: center; }
    .tro-quiz .tro-tarjeta-kicker { grid-column: 1; justify-self: end; margin-right: auto; }
    .tro-quiz .tro-tarjeta-pregunta { grid-column: 1; max-width: 560px; justify-self: end; width: 100%; }
    .tro-quiz .tro-opciones { grid-column: 2; grid-row: 1 / span 2; max-width: 560px; width: 100%; }
  }

  /* ── 10 Tu pase: pulsera y QR ──────────────────────────────────────── */
  .tro-pase { background: var(--tro-mar); color: #FFFFFF; justify-content: space-between; padding-bottom: calc(28px + env(safe-area-inset-bottom)); }
  .tro-pase-arena { position: absolute; left: 0; right: 0; bottom: 0; height: 26%; background: var(--tro-arena); pointer-events: none; }
  .tro-pagina--qr { align-items: flex-start; }
  .tro-qr { position: relative; width: min(100%, 300px); aspect-ratio: 1; background: #FFFFFF; padding: 16px; box-sizing: border-box; border: 3px solid var(--pp-ink); border-radius: 22px;
    box-shadow: 8px 8px 0 var(--pp-acc); margin-bottom: 28px; }
  .tro-qr .qr-ingreso, .tro-qr section { background: transparent !important; border: none !important; padding: 0 !important; }
  .tro-qr img, .tro-qr svg, .tro-qr canvas { width: 100% !important; height: auto !important; display: block; }
  .tro-qr-etq { position: absolute; left: 0; right: 0; bottom: -24px; text-align: center; font-weight: 700; font-size: 11px; letter-spacing: .22em; text-transform: uppercase; color: #FFFFFF; }
  .tro-pase-cabeza { display: flex; align-items: flex-end; justify-content: space-between; gap: 14px; padding-top: 12px; }
  .tro-pase-numero, .tro-pase-mesa { display: flex; flex-direction: column; }
  .tro-pase-mesa { align-items: flex-end; text-align: right; }
  .tro-pase-numero > span:last-child { font-family: var(--tro-serif), 'Lilita One', cursive; font-size: clamp(72px, 22vw, 160px); line-height: .88; color: #FFFFFF; -webkit-text-stroke: 2px var(--pp-ink); paint-order: stroke fill; text-shadow: 5px 6px 0 var(--pp-acc); }
  .tro-pase-mesa > span:last-child { font-family: var(--tro-serif), 'Lilita One', cursive; font-size: clamp(44px, 13vw, 96px); line-height: .9; color: var(--tro-sol); -webkit-text-stroke: 2px var(--pp-ink); paint-order: stroke fill; }
  .tro-caja { display: flex; flex-direction: column; background: #FFFFFF; color: var(--pp-ink); border: 3px solid var(--pp-ink); border-radius: 18px; padding: 6px 16px; }
  .tro-caja .tro-linea { padding: 10px 0; font-size: 14px; }
  .tro-caja .tro-linea:last-child { border-bottom: 0; }
  .tro-caja .tro-linea > span:last-child { font-weight: 600; line-height: 1.35; }
  .tro-info-extra { margin-top: 4px; }
  .tro-info-extra #info-adicional { background: transparent !important; padding: 0 !important; }
  .tro-info-extra #ia-trigger-btn { background: #FFFFFF !important; color: var(--pp-ink) !important; border: 3px solid var(--pp-ink) !important;
    border-radius: 999px !important; font-weight: 700 !important; letter-spacing: .14em !important; text-transform: uppercase; box-shadow: 3px 4px 0 var(--pp-acc); }
  .tro-raiz .ia-icon-box, .tro-raiz svg.lucide { display: none !important; }
  .tro-pase-pie { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 14px; color: var(--pp-ink); }
  .tro-despedida { font-family: var(--tro-serif), 'Lilita One', cursive; font-size: clamp(28px, 7.5vw, 48px); line-height: 1; color: #FFFFFF; -webkit-text-stroke: 2px var(--pp-ink); paint-order: stroke fill; text-shadow: 3px 4px 0 var(--pp-acc); }
  .tro-replay { cursor: pointer; color: var(--pp-acc); }
  .tro-credito { display: inline-flex; opacity: .85; }

  /* ── La tapa: la playa ─────────────────────────────────────────────── */
  .tro-portada { position: absolute; inset: 0; z-index: 5; overflow: hidden; background: var(--tro-cielo); color: var(--pp-ink); }
  .tro-portada-hoja { position: absolute; inset: 0; display: grid; grid-template-rows: auto minmax(0, 1fr) auto; box-sizing: border-box;
    padding: calc(16px + env(safe-area-inset-top)) max(18px, calc((100% - 1100px) / 2)) calc(16px + env(safe-area-inset-bottom)); }
  .tro-playa { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
  .tro-sol-disco { position: absolute; right: 10%; top: 8%; width: clamp(90px, 24vw, 150px); aspect-ratio: 1; border-radius: 50%; background: var(--tro-sol); box-shadow: 0 0 0 14px color-mix(in srgb, var(--tro-sol) 25%, transparent); }
  .tro-nube { position: absolute; border-radius: 999px; background: #FFFFFF; opacity: .9; }
  .tro-nube--grande { left: 6%; top: 14%; width: 26vw; max-width: 200px; height: 30px; }
  .tro-nube--chica { left: 12%; top: 11%; width: 16vw; max-width: 120px; height: 26px; }
  .tro-mar { position: absolute; left: 0; right: 0; top: 46%; height: 30%; background: var(--tro-mar); }
  .tro-ola--mar { top: 46%; margin-top: -11px; --tro-ola-color: var(--tro-mar); }
  .tro-ola--mar svg { animation-duration: 3s; }
  .tro-ola--espuma { top: 58%; --tro-ola-color: #FFFFFF; }
  .tro-ola--espuma svg { animation-duration: 4.2s; animation-direction: reverse; opacity: .7; }
  .tro-arena { position: absolute; left: 0; right: 0; top: 72%; bottom: 0; background: var(--tro-arena); }
  .tro-ola--arena { top: 72%; margin-top: -11px; --tro-ola-color: var(--tro-arena); }
  .tro-ola--arena svg { animation-duration: 5s; }
  /* La palmera: tronco con anillos, siete frondas alternando dos verdes y tres cocos; se mece desde la base. */
  .tro-palmera { position: absolute; right: 2%; top: 30%; width: clamp(120px, 30vw, 220px); transform-origin: 50% 100%; animation: troMece 5s ease-in-out infinite; overflow: visible; }
  @keyframes troMece { 0%, 100% { transform: rotate(-2deg); } 50% { transform: rotate(2deg); } }
  .tro-tronco { fill: var(--tro-tronco); stroke: var(--pp-ink); stroke-width: 2; stroke-linejoin: round; }
  .tro-anillos path { fill: none; stroke: var(--pp-ink); stroke-width: 1.5; opacity: .6; }
  .tro-fronda path { fill: var(--tro-hoja); stroke: var(--pp-ink); stroke-width: 2.2; stroke-linejoin: round; }
  .tro-fronda--oscura path { fill: var(--tro-hoja2); }
  .tro-fronda .tro-nervio { fill: none; stroke-width: 1.2; opacity: .4; }
  .tro-cocos circle { fill: var(--tro-tronco); stroke: var(--pp-ink); stroke-width: 2; }
  .tro-estrella-mar { position: absolute; left: 6%; bottom: 9%; width: clamp(40px, 11vw, 64px); fill: var(--pp-acc); stroke: var(--pp-ink); stroke-width: 3; stroke-linejoin: round; animation: troFlota 4s ease-in-out infinite; }
  .tro-sandia { position: absolute; left: 28%; bottom: 5%; width: clamp(52px, 14vw, 84px); }
  .tro-sandia-pulpa { fill: var(--pp-acc); stroke: var(--pp-ink); stroke-width: 3; stroke-linejoin: round; }
  .tro-sandia-cascara { fill: none; stroke: var(--tro-hoja); stroke-width: 8; }
  .tro-sandia circle { fill: var(--pp-ink); }
  .tro-tapa-cabecera { position: relative; z-index: 1; display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
  .tro-tapa-centro { position: relative; z-index: 1; align-self: center; display: flex; flex-direction: column; align-items: center; gap: 8px; min-height: 0; text-align: center; }
  .tro-tapa-kicker { font-size: 12px; letter-spacing: .26em; padding: 6px 14px; }
  /* El nombre: Lilita blanca con trazo de tinta y sombra del acento. El más largo manda el cuerpo. */
  .tro-tapa-nombres { margin: 0; line-height: .9; letter-spacing: .01em; display: flex; flex-direction: column; align-items: center;
    color: #FFFFFF; -webkit-text-stroke: 2px var(--pp-ink); paint-order: stroke fill; text-shadow: 5px 6px 0 var(--pp-acc);
    font-size: min(clamp(60px, 20vw, 180px), 18vh, calc((100vw - 60px) / (var(--largo, 9) * 0.56))); }
  @media (min-width: 1024px) { .tro-tapa-nombres { font-size: min(13vw, 220px, 22vh, calc((min(100vw, 1100px) - 60px) / (var(--largo, 9) * 0.56))); } }
  .tro-tapa-nombres--largo { font-size: min(clamp(43px, 14.4vw, 130px), 13vh, calc((100vw - 60px) / (var(--largo, 9) * 0.56))); }
  .tro-tapa-linea { overflow: hidden; display: block; white-space: nowrap; padding: 0 10px 10px; margin: 0 -10px -10px; }
  .tro-tapa-linea > span { display: block; }
  .tro-letra { display: inline-block; animation: troLetra calc(var(--n, 9) * 3.4s) cubic-bezier(.34,1.56,.64,1) infinite; animation-delay: calc(var(--i, 0) * -3.4s); }
  @keyframes troLetra { 0%, 99% { transform: none; } 99.3% { transform: translateY(-14px) rotate(6deg); } 100% { transform: none; } }
  .tro-cinta { display: inline-flex; align-items: center; gap: 10px; background: var(--pp-acc); color: #FFFFFF; border-radius: 999px; padding: 8px 18px; font-family: var(--tro-serif), 'Lilita One', cursive; font-size: clamp(18px, 5vw, 26px); letter-spacing: .06em; border: 3px solid var(--pp-ink); }
  .tro-tapa-datos { display: flex; justify-content: space-between; align-items: flex-end; gap: 14px; width: 100%; max-width: 520px; font-weight: 700; font-size: 13px; line-height: 1.35; text-align: left; background: rgba(255,255,255,.9); padding: 10px 14px; border-radius: 14px; box-sizing: border-box; }
  .tro-tapa-datos-der { text-align: right; }
  .tro-tapa-pie { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 12px; align-items: center; text-align: center; }
  .tro-tapa-mensaje { margin: 0; font-weight: 700; font-size: clamp(15px, 4.2vw, 19px); line-height: 1.35; max-width: 34ch; background: rgba(255,255,255,.9); padding: 8px 14px; border-radius: 14px; }
  .tro-tapa-btn { min-height: 54px; width: 100%; max-width: 360px; border: 3px solid var(--pp-ink); border-radius: 999px; background: var(--pp-ink); color: #FFFFFF; cursor: pointer;
    font-family: var(--tro-serif), 'Lilita One', cursive; font-size: 20px; letter-spacing: .06em; padding: 2px 22px 0;
    display: flex; align-items: center; justify-content: center; gap: 12px; box-shadow: 4px 5px 0 var(--pp-acc); transition: background 200ms ease; }
  @media (hover: hover) { .tro-tapa-btn:hover { background: var(--pp-acc); } }

  /* ── Riel, pista y lupa ────────────────────────────────────────────── */
  .tro-riel { position: absolute; right: 0; top: 0; bottom: 0; width: 40px; z-index: 4; display: flex; flex-direction: column;
    align-items: center; justify-content: space-between; padding: calc(16px + env(safe-area-inset-top)) 0 calc(16px + env(safe-area-inset-bottom));
    opacity: 0; transition: opacity 600ms ease; pointer-events: none; color: var(--pp-ink); border-left: 3px solid currentColor !important; }
  .tro-riel-top { writing-mode: vertical-rl; font-family: var(--tro-serif), 'Lilita One', cursive; font-size: 14px; letter-spacing: .2em; color: inherit !important; }
  .tro-riel-etiqueta { writing-mode: vertical-rl; font-weight: 700; font-size: 10px; letter-spacing: .28em; text-transform: uppercase; color: inherit; }
  .tro-riel-linea { flex: 1; width: 1px; margin: 16px 0; background: transparent !important; position: relative; }
  .tro-riel-barra { position: absolute; left: -3px; top: 0; width: 6px; height: 0%; background: var(--pp-acc); border-radius: 3px; transition: height 200ms linear; display: block; }
  .tro-pista { position: absolute; left: 0; right: 40px; bottom: calc(18px + env(safe-area-inset-bottom)); z-index: 6; text-align: center;
    font-weight: 700; font-size: 11px; letter-spacing: .28em; text-transform: uppercase; color: var(--pp-ink);
    opacity: 0; transition: opacity 600ms ease; pointer-events: none; animation: troPista 2.4s ease-in-out infinite; }
  @keyframes troPista { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(6px); } }

  .tro-lupa { position: fixed; inset: 0; z-index: 200; background: rgba(44,58,74,.94);
    display: flex; align-items: center; justify-content: center; padding: 24px; cursor: zoom-out; }
  .tro-lupa-cerrar { position: absolute; top: 20px; right: 20px; width: 40px; height: 40px; border: 3px solid var(--pp-ink); border-radius: 50%;
    background: var(--tro-sol); color: var(--pp-ink); font-size: 18px; line-height: 1; cursor: pointer; box-shadow: 3px 4px 0 var(--pp-acc); }
  .tro-lupa-img { max-width: 100%; max-height: 88vh; object-fit: contain; cursor: default; border: 5px solid #FFFFFF; border-radius: 12px; box-shadow: 0 0 0 2px var(--pp-ink), 8px 8px 0 var(--pp-acc); }

  @media (prefers-reduced-motion: reduce) {
    .tro-raiz * { animation: none !important; }
    .tro-scroller [data-xin] { opacity: 1 !important; transform: none !important; }
    .tro-foto { --tro-punto: 0; }
  }
`;
