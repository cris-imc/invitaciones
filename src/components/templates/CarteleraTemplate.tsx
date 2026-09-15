"use client";

/**
 * CARTELERA · Colección Iconic — sub-colección "Tipográfica Editorial"
 * Variante: Strip (base).
 *
 * GENERADO por scripts/derivar-tipografica.js a partir de
 * EditorialBlancNoirTemplate.tsx — no editar a mano: el motor se arregla en
 * Editorial Blanc & Noir; el render en scripts/jsx/tipografica/car.jsx, los
 * estilos en scripts/css/tipografica/car.css y las caras y la paleta en
 * scripts/familias/tipografica/car.json.
 *
 * La marquesina de un teatro de Las Vegas: Limelight en neón rosa, un
 * marco de bombitas que se encienden en cadena, countdown tragamonedas,
 * frase en letrero celeste, naipes sobre paño verde, ticket de mesa, cabina
 * de fotos, jukebox y ficha VIP. Karla 400-800 para todo lo demás; sin mono.
 *
 * Sin imágenes propias: son fuentes y CSS.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Limelight, Karla } from "next/font/google";
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

const carSerif = Limelight({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  variable: "--car-serif",
});
const carSans = Karla({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
  variable: "--car-sans",
});
// El mono es la ficha técnica de la revista: folios, kickers y datos.

// ─── Paleta ─────────────────────────────────────────────────────────────────
// Las cinco variantes de "Capas de papel" cambian SOLO estos once colores
// (el script de variantes reemplaza este bloque entero, ver
// scripts/gen-capas-de-papel-variants.js). El dibujo es el mismo: los SVG de
// las escenas leen var(--pp-…), así que un cambio acá repinta cerros, cielo,
// sol y figuras de una sola vez.
const PALETA = {
  bg: "#07071A",
  bg2: "#FFF6E8",
  ink: "#FFF6E8",
  ink2: "#A9A6C4",
  acc: "#FF3CAC",
  acc2: "#FFC857",
  sky1: "#07071A",
  sky2: "#FFF6E8",
  hill1: "#FFF6E8",
  hill2: "#A9A6C4",
  hill3: "#FFF6E8",
  night: "#FFF6E8",
  nightInk: "#07071A",
  acc3: "#00F0FF",
  felt: "#0E4D3A",
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

interface CarteleraTemplateProps {
  invitation: Record<string, unknown>;
  guest?: GuestRecord | null;
  isPersonalized?: boolean;
}

/** El número de pase, con tres cifras como en el mockup ("PASE Nº 042"). */
function numeroDePase(orderNumber: number | undefined): string {
  return String(orderNumber ?? 42).padStart(3, "0");
}

export function CarteleraTemplate({ invitation, guest, isPersonalized = false }: CarteleraTemplateProps) {
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
      el.style.setProperty("--car-y", `${dist}px`);
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
            el.style.setProperty("--car-y", "0px");
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
            ven.style.setProperty("--car-punto", (7.2 * (1 - t)).toFixed(2));
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
    "--pp-felt": PALETA.felt,
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
          clase: `${carSerif.variable} ${carSans.variable}`,
          fuente: "var(--car-sans), 'Karla', sans-serif",
        }}
      />
    );
  }


  // El total de pliegos, para los folios ("03 / 10"). Se cuenta lo que esta
  // invitación realmente tiene: si no hay trivia, no existe el pliego 09 y el
  // pase deja de ser 10 de 10.
  const totalPliegos = cuenta;
  const folio = (n: string) => `${n} / ${String(totalPliegos).padStart(2, "0")}`;

  // El nombre de la marquesina se parte en letras para que cada tanto una
  // "falle" como un tubo de neón: la animación va escalonada por letra, así
  // que en cada ciclo se apaga una sola (ver carZumbido en el CSS).
  const textoDeMarquesina = saludaAlInvitado ? nombreInvitado : `${nombre1}${nombre2}`;
  const totalLetras = Math.max(1, textoDeMarquesina.replace(/\s/g, "").length);
  // El renglón más largo manda el cuerpo del nombre: Limelight es ancha y un
  // "María Florencia" no puede partirse en dos renglones dentro del marco.
  const renglonMasLargo = Math.max(4, ...(saludaAlInvitado ? [nombreInvitado] : [nombre1, nombre2]).map((n) => n.length));

  // La frase: el medio va en rosa y el cierre en dorado, como en el letrero
  // del mockup ("doce años" rosa, "decirlo en voz alta" dorado).
  const tonoDePalabra = (i: number) => {
    const n = palabras.length;
    if (i >= Math.ceil(n * 0.7)) return "car-acento2";
    if (i >= Math.floor(n * 0.25) && i < desdeAcento) return "car-acento";
    return undefined;
  };

  const kickerDelEvento = tx(invitation.tipo === "CASAMIENTO" ? "invitacion.evento.nosCasamos" : invitation.tipo === "QUINCE_ANOS" ? "invitacion.evento.misQuinceAnos" : "invitacion.evento.teInvitamos");

  return (
    <div
      ref={raizRef}
      className={`${carSerif.variable} ${carSans.variable} car-raiz`}
      style={varsDePaleta}
    >
      <style>{CSS_CAR}</style>
      <style>{COVER_RESPONSIVE_STYLE}</style>

      <div ref={scrollerRef} className="car-scroller">
        {/* ── 01 Guardá la fecha ─────────────────────────────────────────
            El cartel de ruta: crema con rayos dorados arriba, la fecha en
            tres renglones de Limelight y la foto enmarcada como un afiche. */}
        <section data-tone="light" data-screen-label={tx("invitacion.saveTheDate.guardaLaFecha")} className="car-section car-std">
          <div className="car-rayos" aria-hidden="true" />
          <div className="car-folio">
            <span data-xin="1" data-dist="-40">{nSaveTheDate} — {tx("invitacion.saveTheDate.guardaLaFecha").toUpperCase()}</span>
            <span data-xin="1" data-dist="40">{folio(nSaveTheDate)}</span>
          </div>
          <div className="car-spread">
            <div className="car-pagina">
              <div className="car-fecha" style={{ "--letras": Math.max(3, mesLargo.length) } as React.CSSProperties}>
                <span data-xin="1" data-dist="-160" className="car-fecha-linea car-fecha-linea--dia">{diaNum}</span>
                <span data-xin="1" data-dist="160" data-delay="120" className="car-fecha-linea car-fecha-linea--mes">{mesLargo}</span>
                <span data-xin="1" data-dist="-160" data-delay="240" className="car-fecha-linea">{anio}</span>
              </div>
              <div data-xin="1" data-delay="360" className="car-fecha-pie">
                <span>{diaSemana} · {hora} H</span>
                <AddToCalendarLink
                  eventName={titulo}
                  targetDate={fechaHora}
                  location={[lugarNombre, direccion].filter(Boolean).join(", ")}
                  className="car-pildora car-pildora--tinta"
                  showIcon={false}
                >
                  {tx("invitacion.saveTheDate.agregarAlCalendario").toUpperCase()} ↗
                </AddToCalendarLink>
              </div>
            </div>

            {hayFoto && (
              <div ref={ventanaRef} data-xin="1" data-delay="200" data-dist="0" className="car-foto">
                {fotoMobile && (
                  <div className="acp-mobile-only car-foto-capa">
                    <AnimatedCoverPhoto photoSrc={fotoMobile} tint={false} effect="enfoque" scrimColorRgb="7,7,26" />
                  </div>
                )}
                {fotoDesktop && (
                  <div className="acp-desktop-only car-foto-capa">
                    <AnimatedCoverPhoto photoSrc={fotoDesktop} tint={false} effect="enfoque" scrimColorRgb="7,7,26" />
                  </div>
                )}
                {/* La trama que tapa la foto y se disuelve al subir: el radio
                    del punto lo mueve el motor en --car-punto. */}
                <span className="car-foto-revelado" aria-hidden="true" />
                <div className="car-foto-cabeza">
                  <span>{tx("invitacion.album.nuestraFoto").toUpperCase()}</span>
                  <span className="car-estrellas">★★★★★</span>
                </div>
                <span className="car-foto-pildora">Jackpot</span>
              </div>
            )}
          </div>
        </section>

        {/* ── 02 Falta poco ──────────────────────────────────────────────
            El tragamonedas: una marquesina rosa arriba, la caja con borde
            dorado y los cuatro rodillos, y otra marquesina abajo en sentido
            contrario. */}
        <section data-tone="dark" data-screen-label={tx("invitacion.cuentaRegresiva.kicker")} className="car-section car-countdown">
          <div className="car-folio car-folio--suave">
            <span data-xin="1" data-dist="-40">{nCountdown} — {tx("invitacion.cuentaRegresiva.faltan").toUpperCase()}</span>
            <span data-xin="1" data-dist="40">{folio(nCountdown)}</span>
          </div>
          <div className="car-marquesina car-marquesina--rosa" aria-hidden="true">
            <div className="car-marquesina-tira">
              {[0, 1].map((i) => (
                <span key={i}>
                  {tx("invitacion.cuentaRegresiva.dias")} ♠ {tx("invitacion.cuentaRegresiva.horas")} ♥ {tx("invitacion.cuentaRegresiva.minutos")} ♣ {tx("invitacion.cuentaRegresiva.segundos")} ♦ {diaSemana.toLowerCase()} {diaNum} · {mesLargo} ♠ {hora} h ♥&nbsp;
                </span>
              ))}
            </div>
          </div>
          <div className="car-spread">
            <div className="car-tragamonedas">
              <span className="car-tragamonedas-titulo">{tx("invitacion.cuentaRegresiva.faltan")}</span>
              <CuentaCartelera targetDate={fechaHora} />
              <div className="car-tragamonedas-pie" aria-hidden="true">
                <span className="car-luces"><span /><span /><span /></span>
                <span>{tx("invitacion.cuentaRegresiva.segundos").toUpperCase()} · {tx("invitacion.cuentaRegresiva.kicker").toUpperCase()}</span>
                <span className="car-palanca" />
              </div>
            </div>
          </div>
          <div className="car-marquesina car-marquesina--contraria" aria-hidden="true">
            <div className="car-marquesina-tira">
              {[0, 1].map((i) => (
                <span key={i}>
                  {[lugarNombre, ciudad, dressCode].filter(Boolean).join(" · ").toUpperCase()} ·&nbsp;
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── 03 Unas palabras ───────────────────────────────────────────
            El letrero de neón: la frase adentro de un tubo celeste, con
            "open all night" arriba y los cuatro palos abajo. */}
        {hayFrase && (
          <section data-tone="dark" data-screen-label={tx("invitacion.frase.etiqueta")} className="car-section car-frase-seccion">
            <div className="car-grilla" aria-hidden="true" />
            <div className="car-folio car-folio--suave">
              <span data-xin="1" data-dist="-40">{nFrase} — {tx("invitacion.frase.unasPalabras").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nFrase)}</span>
            </div>
            <div className="car-spread">
              <div className="car-letrero">
                <span className="car-letrero-etq">Open all night</span>
                <h2 ref={fraseRef} className="car-frase">
                  {palabras.map((p, i) => (
                    // El espacio va fuera del span: el motor pone cada palabra
                    // en inline-block y un espacio adentro se colapsa a cero.
                    <span key={i}>
                      <span data-w="1" className={tonoDePalabra(i)}>{p}</span>{" "}
                    </span>
                  ))}
                </h2>
              </div>
              <div data-xin="1" data-delay="900" data-dist="60" className="car-firma">
                <span className="car-firma-etq">{tx("invitacion.frase.conAmor").toUpperCase()}</span>
                <span>{titulo}{ciudad ? `. ${ciudad}.` : ""}</span>
              </div>
            </div>
            <div className="car-palos" aria-hidden="true"><span>♠</span><span className="car-palos-rojo">♥</span><span>♣</span><span className="car-palos-rojo">♦</span></div>
          </section>
        )}

        {/* ── 04 Cuándo y dónde ──────────────────────────────────────────
            La mesa de paño: un naipe por lugar. El salón es el as de picas,
            la ceremonia el rey de corazones, el mapa la jota de tréboles y
            el cronograma la reina de diamantes. */}
        <div
          id="details"
          data-pan="1"
          data-scroll={scrollVertical || panelesLugar.length <= 1 ? "vertical" : "lateral"}
          data-screen-label={tx("invitacion.ubicacion.cuandoYDonde")}
          className="car-pan"
          style={{ "--st-pasos": Math.max(0, panelesLugar.length - 1) } as React.CSSProperties}
        >
          <div className="car-pan-fijo">
            <div data-strip="1" className="car-tira">
              <div data-tone="dark" className="car-panel car-panel--pano">
                <div className="car-folio">
                  <span>{nCuando} — {tx("invitacion.ubicacion.fiestaSalon").toUpperCase()}</span><span>{deLugar("recepcion")}</span>
                </div>
                <div className="car-spread">
                  <div className="car-pagina">
                    <span className="car-panel-sub">{tx("invitacion.ubicacion.elLugar")}</span>
                    <h2 className="car-panel-titulo">{lugarNombre || ciudad}</h2>
                  </div>
                  <Naipe rango="A" palo="♠">
                    <div className="car-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{hora} h</span></div>
                    {direccion && <div className="car-linea"><span>{tx("invitacion.ubicacion.direccion")}</span><span>{direccion}</span></div>}
                    {dressCode && <div className="car-linea"><span>{tx("invitacion.ubicacion.dressCode")}</span><span>{dressCode}</span></div>}
                    {mapUrl && (
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="car-pildora car-pildora--tinta car-pildora--ancha">
                        {tx("invitacion.ubicacion.comoLlegar").toUpperCase()}<span>→</span>
                      </a>
                    )}
                  </Naipe>
                </div>
                <div className="car-folio car-folio--pie">
                  <span>{[direccion, ciudad].filter(Boolean).join(" · ").toUpperCase()}</span>
                  {!scrollVertical && panelesLugar.length > 1 && <span>{tx("invitacion.portada.desliza").toUpperCase()} →</span>}
                </div>
              </div>

              {ceremoniaHabilitada && (
                <div id="ceremonia" data-tone="dark" className="car-panel car-panel--vino">
                  <div className="car-folio">
                    <span>{nCuando} — {ceremoniaTitulo.toUpperCase()}</span><span>{deLugar("ceremonia")}</span>
                  </div>
                  <div className="car-spread">
                    <div className="car-pagina">
                      <span className="car-panel-sub">{ceremoniaTitulo}</span>
                      <h2 className="car-panel-titulo">{ceremoniaNombre || ceremoniaTitulo}</h2>
                    </div>
                    <Naipe rango="K" palo="♥" rojo>
                      {ceremoniaHora && <div className="car-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{ceremoniaHora} h</span></div>}
                      {ceremoniaDireccion && <div className="car-linea"><span>{tx("invitacion.ubicacion.direccion")}</span><span>{ceremoniaDireccion}</span></div>}
                    </Naipe>
                  </div>
                  <div className="car-folio car-folio--pie">
                    <span>{tx("invitacion.ubicacion.ceremoniaCivil").toUpperCase()}</span>
                    {!scrollVertical && <span>{tx("invitacion.portada.desliza").toUpperCase()} →</span>}
                  </div>
                </div>
              )}

              {hayComoLlegar && (
                <div id="location" data-tone="dark" className="car-panel car-panel--noche">
                  <div className="car-folio">
                    <span>{nCuando} — {tx("invitacion.ubicacion.comoLlegar").toUpperCase()}</span><span>{deLugar("llegar")}</span>
                  </div>
                  <div className="car-spread">
                    <div className="car-pagina">
                      <span className="car-panel-sub">{ciudad || lugarNombre}</span>
                      <h2 className="car-panel-titulo">{tx("invitacion.ubicacion.comoLlegar")}</h2>
                    </div>
                    <Naipe rango="J" palo="♣">
                      {embedMapUrl && (
                        <div className="car-mapa">
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
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="car-pildora car-pildora--tinta car-pildora--ancha">
                        {tx("invitacion.ubicacion.abrirEnMapas").toUpperCase()}<span>→</span>
                      </a>
                    </Naipe>
                  </div>
                  <div className="car-folio car-folio--pie">
                    <span>{[direccion, ciudad].filter(Boolean).join(" · ").toUpperCase()}</span>
                    {!scrollVertical && <span>{tx("invitacion.portada.desliza").toUpperCase()} →</span>}
                  </div>
                </div>
              )}

              {cronograma.length > 0 && (
                <div id="schedule" data-tone="dark" className="car-panel car-panel--noche">
                  <div className="car-folio">
                    <span>{nCuando} — {tx("invitacion.ubicacion.cronograma").toUpperCase()}</span><span>{deLugar("cronograma")}</span>
                  </div>
                  <div className="car-spread">
                    <div className="car-pagina">
                      <span className="car-panel-sub">{tx("invitacion.ubicacion.cronograma")}</span>
                      <h2 className="car-panel-titulo">{tx("invitacion.ubicacion.laNochePasoAPaso").split(",")[0]}</h2>
                    </div>
                    <Naipe rango="Q" palo="♦" rojo>
                      {cronograma.map((item, i) => (
                        <div key={i} className="car-linea"><span>{item.time || ""}</span><span>{item.title}</span></div>
                      ))}
                    </Naipe>
                  </div>
                  <div className="car-folio car-folio--pie">
                    <span>{fechaPuntos}</span>
                  </div>
                </div>
              )}
            </div>
            {!scrollVertical && panelesLugar.length > 1 && <Puntos cantidad={panelesLugar.length} />}
          </div>
        </div>

        {/* ── 05 Check-in ────────────────────────────────────────────────
            El ticket de mesa: papel crema con las muescas a los costados,
            línea de corte punteada y el sello JACKPOT al confirmar. */}
        {rsvpHabilitado && (
          <section id="rsvp" data-tone="dark" data-screen-label={tx("invitacion.rsvp.confirmar")} className="car-section car-checkin">
            <div className="car-halo car-halo--dorado" aria-hidden="true" />
            <div className="car-folio car-folio--suave">
              <span data-xin="1" data-dist="-40">{nCheckin} — CHECK-IN</span>
              <span data-xin="1" data-dist="40">{folio(nCheckin)}</span>
            </div>
            <div className="car-spread">
              <div className="car-pagina">
                <h2 data-xin="1" data-dist="-80" className="car-h2 car-h2--dorado">
                  {tx("invitacion.rsvp.confirmaLinea1")}<br /><span className="car-acento2">{tx("invitacion.rsvp.confirmaLinea2")}</span>
                </h2>
              </div>
              <div data-xin="1" data-delay="160" data-dist="80" className="car-cupon">
                <CheckinCartelera
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
            La cabina de fotos: grilla de seis columnas con las fotos en
            marco blanco y un baño de color que se enciende al pasar por el
            centro. */}
        {todasLasFotos.length > 0 && (
          <div
            id="album"
            data-pan="1"
            data-scroll={scrollVertical || hojasDeFotos.length <= 1 ? "vertical" : "lateral"}
            data-screen-label={tx("invitacion.album.titulo")}
            className="car-pan"
            style={{ "--st-pasos": Math.max(0, hojasDeFotos.length - 1) } as React.CSSProperties}
          >
            <div className="car-pan-fijo car-pan-fijo--claro">
              <div data-strip="1" className="car-tira">
                {hojasDeFotos.map((hoja, iHoja) => (
                  <div key={iHoja} data-tone="light" className={`car-panel car-panel--album${iHoja % 2 === 1 ? " car-panel--album-b" : ""}`}>
                    <div className="car-folio car-folio--gris">
                      <span>{nAlbum} — {tx("invitacion.album.titulo").toUpperCase()}</span>
                      <span>{tx("invitacion.album.hojaDeTotal", { n: String(iHoja + 1).padStart(2, "0"), total: String(hojasDeFotos.length).padStart(2, "0") }).toUpperCase()} · {folio(nAlbum)}</span>
                    </div>
                    <h2 className="car-h2 car-h2--album">
                      {tx("invitacion.album.titulo")} <span className="car-acento">{tx("invitacion.album.deFotos")}</span>
                    </h2>
                    <div className="car-cabina" data-cantidad={hoja.length}>
                      {hoja.map((url, i) => (
                        <div
                          key={i}
                          data-sheet="1"
                          className="car-foto-cabina"
                          role="button"
                          tabIndex={0}
                          onClick={() => setFotoAmpliada(url)}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setFotoAmpliada(url); }}
                          aria-label={tx("invitacion.album.ampliarFoto", { n: i + 1 })}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="" loading="lazy" className="car-foto-cabina-img" />
                          <span data-colorwash="1" className={`car-bano car-bano--${(i % 5) + 1}`} aria-hidden="true" />
                          <span className="car-foto-cabina-n">FOTO {String(i + 1).padStart(2, "0")}</span>
                        </div>
                      ))}
                    </div>
                    <div className="car-folio car-folio--gris car-folio--pie">
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
            El jukebox: titular celeste, ecualizador de tres neones y la
            lista sobre fichas oscuras. */}
        {sugerenciaMusicaHabilitada && (
          <section id="songs" data-tone="dark" data-screen-label={tx("invitacion.musica.titulo")} className="car-section car-musica">
            <div className="car-halo car-halo--celeste" aria-hidden="true" />
            <div className="car-folio car-folio--suave">
              <span data-xin="1" data-dist="-40">{nMusica} — JUKEBOX</span>
              <span data-xin="1" data-dist="40">{folio(nMusica)}</span>
            </div>
            <div className="car-spread">
              <div className="car-pagina">
                <h2 data-xin="1" data-dist="-80" className="car-h2 car-h2--celeste">
                  {tituloEnDosLineas(tx("invitacion.sabor.preguntaCancionFaltar"), "car-acento3")}
                </h2>
                <div data-xin="1" data-delay="120" className="car-eq" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((i) => <span key={i} style={{ animationDelay: `${i * 0.18}s` }} />)}
                </div>
              </div>
              <div className="car-pagina">
                <CancionesCartelera
                  invitationId={String(invitation.id ?? "")}
                  guestToken={guest?.uniqueToken}
                  guestName={nombreInvitado || tx("invitacion.evento.invitado")}
                />
              </div>
            </div>
          </section>
        )}

        {/* ── 08 Regalos ─────────────────────────────────────────────────
            La caja: pliego crema y las cuentas en fichas negras con borde
            de neón, dorado la primera y celeste la segunda. */}
        {hayRegalos && (
          <section id="banco" data-tone="light" data-screen-label={tx("invitacion.regalos.titulo")} className="car-section car-regalos">
            <div className="car-folio car-folio--gris">
              <span data-xin="1" data-dist="-40">{nRegalos} — {tx("invitacion.regalos.titulo").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nRegalos)}</span>
            </div>
            <div className="car-spread">
              <div className="car-pagina">
                <h2 data-xin="1" data-dist="-80" className="car-h2">
                  {tx("invitacion.regalos.siQueresLinea1")}<br /><span className="car-acento">{tx("invitacion.regalos.siQueresLinea2")}</span>
                </h2>
                {Boolean(invitation.regaloMensaje) && (
                  <p data-xin="1" data-delay="120" className="car-parrafo">{String(invitation.regaloMensaje)}</p>
                )}
              </div>
              <div className="car-pagina">
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
            La ruleta, sobre el paño: gira una vuelta entera cada vez que
            se contesta. */}
        {quizHabilitado && (
          <section id="quiz" data-tone="dark" data-screen-label="Quiz" className="car-section car-quiz">
            <div className="car-folio">
              <span data-xin="1" data-dist="-40">{nQuiz} — {triviaTitulo.toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nQuiz)}</span>
            </div>
            <div className="car-quiz-cuerpo">
              <div data-xin="1" className="car-ruleta" aria-hidden="true">
                <svg viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="48" fill={PALETA.bg} />
                  <g stroke={PALETA.bg} strokeWidth="1">
                    <path d="M50 50 L50 6 A44 44 0 0 1 81.1 18.9 Z" fill="#C8102E" />
                    <path d="M50 50 L81.1 18.9 A44 44 0 0 1 94 50 Z" fill="#0F0F1F" />
                    <path d="M50 50 L94 50 A44 44 0 0 1 81.1 81.1 Z" fill="#C8102E" />
                    <path d="M50 50 L81.1 81.1 A44 44 0 0 1 50 94 Z" fill="#0F0F1F" />
                    <path d="M50 50 L50 94 A44 44 0 0 1 18.9 81.1 Z" fill="#C8102E" />
                    <path d="M50 50 L18.9 81.1 A44 44 0 0 1 6 50 Z" fill="#0F0F1F" />
                    <path d="M50 50 L6 50 A44 44 0 0 1 18.9 18.9 Z" fill="#C8102E" />
                    <path d="M50 50 L18.9 18.9 A44 44 0 0 1 50 6 Z" fill="#0E7A4E" />
                  </g>
                  <circle cx="50" cy="50" r="14" fill={PALETA.acc2} stroke={PALETA.bg} strokeWidth="2" />
                </svg>
                <span className="car-ruleta-aguja" />
              </div>
              <TriviaCartelera
                preguntas={triviaPreguntas}
                invitationId={String(invitation.id ?? "")}
                guestToken={guest?.uniqueToken}
                guestName={nombreInvitado || tx("invitacion.evento.invitado")}
              />
            </div>
          </section>
        )}

        {/* ── 10 Tu pase ─────────────────────────────────────────────────
            La ficha VIP: el QR adentro de una ficha de casino, el número de
            pase en dorado y los datos en una caja oscura. */}
        <section data-tone="dark" data-screen-label={tx("invitacion.pase.tuPase")} className="car-section car-pase">
          <div className="car-halo car-halo--rosa" aria-hidden="true" />
          <div className="car-folio car-folio--suave">
            <span data-xin="1" data-dist="-40">{nPase} — {tx("invitacion.pase.tuPase").toUpperCase()}</span>
            <span data-xin="1" data-dist="40">{folio(nPase)}</span>
          </div>
          <div className="car-spread">
            <div data-xin="1" data-dist="-60" className="car-pagina car-pagina--ficha">
              <div className="car-ficha">
                <span className="car-ficha-anillo" aria-hidden="true" />
                <span className="car-ficha-arriba">FICHA VIP</span>
                <div className="car-ficha-qr">
                  <QrDeIngreso guest={guest as never} />
                </div>
                <span className="car-ficha-abajo">{tx("invitacion.pase.tuPase").toUpperCase()}</span>
              </div>
            </div>
            <div className="car-pagina">
              <div data-xin="1" data-delay="100" className="car-pase-cabeza">
                <div className="car-pase-numero">
                  <span className="car-folio-etq">{tx("invitacion.pase.pase").toUpperCase()} Nº</span>
                  <span>{pase}</span>
                </div>
                {guest?.mesas && guest.mesas.length > 0 && (
                  <div className="car-pase-mesa">
                    <span className="car-folio-etq">{tx("invitacion.pase.tuMesa").toUpperCase()}</span>
                    <span>{guest.mesas[0]}</span>
                  </div>
                )}
              </div>
              <div data-xin="1" data-delay="160" className="car-caja">
                <div className="car-linea"><span>{saludaAlInvitado ? tx("invitacion.pase.reservadoPara").toUpperCase() : tx("invitacion.evento.invitado").toUpperCase()}</span><span>{nombreInvitado || titulo}</span></div>
                {lugaresDelPase > 0 && (
                  <div className="car-linea"><span>{tx("invitacion.pase.lugares").toUpperCase()}</span><span>{lugaresDelPase}</span></div>
                )}
                {guest?.mesas && guest.mesas.length > 0 && (
                  <div className="car-linea"><span>SECTOR</span><span>{guest.mesas.join(" · ")}</span></div>
                )}
                <div className="car-linea"><span>{tx("invitacion.ubicacion.horario").toUpperCase()}</span><span>{fechaPuntos} · {hora} H</span></div>
              </div>
              <div className="car-info-extra">
                <InfoAdicionalSection invitation={invitation} />
              </div>
            </div>
          </div>
          <div data-xin="1" data-delay="220" className="car-pase-pie">
            <span className="car-despedida">{tx("invitacion.pase.losEsperamos")} {iniciales(nombre1, nombre2)}</span>
            <div className="car-folio car-folio--suave car-folio--filete">
              <span className="car-credito"><LogoFooterCredit bgColor="transparent" textColor={PALETA.ink} /></span>
              <span className="car-replay" role="button" tabIndex={0} onClick={volverAVerla} onKeyDown={(e) => { if (e.key === "Enter") volverAVerla(); }}>
                {tx("invitacion.portada.verAperturaOtraVez").toUpperCase()} ↺
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* ── Riel de progreso ───────────────────────────────────────────── */}
      <div ref={rielRef} className="car-riel">
        <span ref={rielTopRef} className="car-riel-top">{pase}</span>
        <div ref={rielLineaRef} className="car-riel-linea">
          <span ref={rielBarraRef} className="car-riel-barra" />
        </div>
        <span ref={rielEtiquetaRef} className="car-riel-etiqueta">{tx("invitacion.saveTheDate.guardaLaFecha").toUpperCase()}</span>
      </div>

      {/* ── La portada ──────────────────────────────────────────────────
          La marquesina: un marco de bombitas que se encienden en cadena,
          el nombre en neón rosa que parpadea y, abajo, la ficha del
          invitado. Es la bienvenida: dice de quién es la fiesta, cuándo,
          dónde y para cuántos. */}
      <div ref={portadaRef} data-tone={TONO} className="car-portada">
        <div ref={escenaPortadaRef} className="car-portada-hoja">
          <div className="car-grilla car-grilla--tapa" aria-hidden="true" />
          <div className="car-halo car-halo--tapa" aria-hidden="true" />

          <div data-cl="1" className="car-marco">
            <div className="car-bombillas car-bombillas--arriba" aria-hidden="true"><Bombillas cantidad={16} /></div>
            <div className="car-bombillas car-bombillas--abajo" aria-hidden="true"><Bombillas cantidad={16} invertido /></div>
            <div className="car-bombillas car-bombillas--izq" aria-hidden="true"><Bombillas cantidad={12} invertido /></div>
            <div className="car-bombillas car-bombillas--der" aria-hidden="true"><Bombillas cantidad={12} /></div>

            <div className="car-folio car-folio--marco">
              <span className="car-live"><span className="car-live-punto" />Live · {tx("invitacion.saveTheDate.unaSolaNoche")}</span>
              <span>Nº 00 / {String(totalPliegos).padStart(2, "0")}</span>
            </div>

            <div data-cl="2" className="car-tapa-centro">
              <span className="car-tapa-kicker">{kickerDelEvento}</span>
              <h1 ref={cartelRef} className="car-tapa-nombres" style={{ "--n": totalLetras, "--largo": renglonMasLargo } as React.CSSProperties}>
                {saludaAlInvitado ? (
                  <span className="car-tapa-linea"><span data-pieza="1"><Letras texto={nombreInvitado} desde={0} /></span></span>
                ) : (
                  <>
                    <span className="car-tapa-linea"><span data-pieza="1"><Letras texto={nombre1} desde={0} /></span></span>
                    {nombre2 && (
                      <>
                        <span className="car-tapa-linea car-tapa-linea--amp"><span data-pieza="1">&amp;</span></span>
                        <span className="car-tapa-linea"><span data-pieza="1"><Letras texto={nombre2} desde={nombre1.replace(/\s/g, "").length} /></span></span>
                      </>
                    )}
                  </>
                )}
              </h1>
              <div className="car-tapa-fecha">
                <Flecha />
                <span>{diaSemana} {diaNum} · {mesLargo.toUpperCase()} · {anio}</span>
                <Flecha invertida />
              </div>
              <div className="car-tapa-datos">
                <div><span>{tx("invitacion.ubicacion.elLugar").toUpperCase()}</span><span>{lugarNombre || "—"}</span></div>
                <div><span>{tx("invitacion.ubicacion.ciudad").toUpperCase()}</span><span>{ciudad || "—"}</span></div>
                <div>
                  <span>{isPersonalized && guest ? tx("invitacion.pase.pase").toUpperCase() : tx("invitacion.saveTheDate.fecha").toUpperCase()}</span>
                  <span>{isPersonalized && guest ? `Nº ${pase} · ×${lugaresDelPase}` : fechaPuntos}</span>
                </div>
              </div>
            </div>

            <div data-cl="3" className="car-tapa-pie">
              <p className="car-tapa-mensaje">
                {saludaAlInvitado
                  ? `${tx("invitacion.bienvenida.hola", { nombre: nombreInvitado })}. ${String(invitation.portadaMensaje || tx("invitacion.sabor.mensajeLoContamosNosotros"))}`
                  : String(invitation.portadaMensaje || tx("invitacion.sabor.mensajeLoContamosNosotros"))}
              </p>
              <button type="button" onClick={abrir} className="car-tapa-btn">
                {tx("invitacion.portada.abrirInvitacion")}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div ref={pistaRef} className="car-pista">{tx("invitacion.portada.desliza").toUpperCase()} ↓</div>

      {fotoAmpliada && (
        <div className="car-lupa" onClick={() => setFotoAmpliada(null)} onContextMenu={(e) => e.preventDefault()}>
          <button
            type="button"
            className="car-lupa-cerrar"
            onClick={(e) => { e.stopPropagation(); setFotoAmpliada(null); }}
            aria-label={tx("invitacion.cerrar")}
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fotoAmpliada} alt={tx("invitacion.album.fotoAmpliada")} className="car-lupa-img" draggable={false} onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {musicaHabilitada && audioDeFondo}
      {montado && isPersonalized && guest && portadaAbierta && (
        <BurbujaPase acento={PALETA.acc2} guest={guest} />
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
 * Las bombitas del marco: cada una se enciende un tercio del ciclo, con el
 * retraso corrido de a una, y así la luz "corre" alrededor de la marquesina.
 * Del lado de abajo y de la izquierda va invertido para que el giro sea
 * horario.
 */
function Bombillas({ cantidad, invertido = false }: { cantidad: number; invertido?: boolean }) {
  return (
    <>
      {Array.from({ length: cantidad }).map((_, i) => (
        <span key={i} className="car-bombilla" style={{ animationDelay: `-${((invertido ? cantidad - 1 - i : i) % 3) * 250}ms` }} />
      ))}
    </>
  );
}

/**
 * El nombre letra por letra, cada una con su índice: el CSS apaga una
 * distinta cada 3,6 segundos, como un tubo de neón que falla.
 */
function Letras({ texto, desde }: { texto: string; desde: number }) {
  let k = desde;
  return (
    <>
      {Array.from(texto).map((ch, i) =>
        ch === " " ? " " : <span key={i} className="car-letra" style={{ "--i": k++ } as React.CSSProperties}>{ch}</span>
      )}
    </>
  );
}

/** La flecha de neón celeste que señala la fecha, moviéndose de a 8 px. */
function Flecha({ invertida = false }: { invertida?: boolean }) {
  return (
    <svg width="42" height="22" viewBox="0 0 42 22" className={`car-flecha${invertida ? " car-flecha--inv" : ""}`} aria-hidden="true">
      <path d="M2 11 H30 M22 3 L30 11 L22 19" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="36" cy="11" r="3" fill="currentColor" />
    </svg>
  );
}

/** Un naipe: papel crema, índice y palo en dos esquinas (una dada vuelta). */
function Naipe({ rango, palo, rojo = false, children }: { rango: string; palo: string; rojo?: boolean; children: React.ReactNode }) {
  return (
    <div className={`car-naipe${rojo ? " car-naipe--rojo" : ""}`}>
      <span className="car-naipe-indice" aria-hidden="true">{rango}<span>{palo}</span></span>
      <span className="car-naipe-indice car-naipe-indice--abajo" aria-hidden="true">{rango}<span>{palo}</span></span>
      <div className="car-naipe-cuerpo">{children}</div>
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
    <div className="car-puntos" aria-hidden="true">
      {Array.from({ length: cantidad }).map((_, i) => (
        <span key={i} data-dot={i} className="car-punto" style={{ background: i === 0 ? PALETA.acc : "rgba(43,42,51,.18)" }} />
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
function CuentaCartelera({ targetDate }: { targetDate: Date }) {
  const tx = useTextos();
  const { time, isEventDay, isPast, hasEnded } = useCountdown(targetDate);

  if (isEventDay || hasEnded || isPast) {
    return (
      <div className="car-tarjeta car-tarjeta--hoy" data-xin="1" data-delay="80" data-dist="30">
        <span className="car-tarjeta-kicker">{tx("invitacion.cuentaRegresiva.kicker").toUpperCase()}</span>
        <span className="car-tarjeta-titulo">
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
    <div className="car-cuenta">
      {celdas.map((c, i) => (
        <div key={c.l} data-xin="1" data-delay={i * 100} data-dist={i % 2 === 0 ? -80 : 80} className={`car-cuenta-caja car-cuenta-caja--${i + 1}`}>
          <span className="car-cuenta-num"><span key={c.v}>{c.v}</span></span>
          <span className="car-cuenta-etq">{c.l.toUpperCase()}</span>
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
    <div className="car-fila car-fila--copiable">
      <div className="car-fila-texto">
        <span className="car-fila-etq">{etiqueta.toUpperCase()}</span>
        <span className="car-fila-dato">{valor}</span>
      </div>
      <button type="button" onClick={copiar} className={`car-btn-copiar${copiado ? " car-btn-copiar--hecho" : ""}`}>
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
      className={`car-tarjeta car-tarjeta--banco${dobleZ ? " car-doblez" : ""}${inclinada ? " car-tarjeta--der" : " car-tarjeta--izq"}`}
    >
      <span className="car-tarjeta-kicker">{titulo.toUpperCase()}</span>
      {mensaje && <p className="car-tarjeta-mensaje">{mensaje}</p>}
      <div className="car-filas">
        <FilaCopiable etiqueta="Alias" valor={alias} />
        <FilaCopiable etiqueta="CBU" valor={cbu} />
        {(banco || titular) && (
          <div className="car-fila car-fila--ultima">
            <span>{banco || tx("invitacion.regalos.banco")}</span>
            <span className="car-fila-valor">{titular}</span>
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
function CheckinCartelera({
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
      <div data-xin="1" data-delay="140" data-dist="30" className="car-tarjeta car-tarjeta--izq">
        <p className="car-tarjeta-mensaje">{tx("invitacion.rsvp.graciasPorAvisarAcceso")}</p>
        <button type="button" className="car-btn-fantasma" onClick={() => setEstado("PENDING")}>
          {tx("invitacion.rsvp.cambieDeIdea").toUpperCase()}
        </button>
      </div>
    );
  }

  const confirmadoYa = estado === "CONFIRMED";

  return (
    <>
      <div ref={tarjetaRef} data-xin="1" data-delay="140" data-dist="30" className="car-tarjeta car-tarjeta--talon">
        <div className="car-talon-top">
          <span>{tx("invitacion.pase.numeroPase", { n: pase }).toUpperCase()}{guestName ? ` · ${guestName.toUpperCase()}` : ""}</span>
          <span ref={estadoRef} className="car-talon-estado">
            {confirmado || confirmadoYa ? tx("invitacion.pase.accesoConfirmado").toUpperCase() : tx("invitacion.pase.pendiente").toUpperCase()}
          </span>
        </div>

        {!confirmadoYa ? (
          <>
            {lugares > 1 && (
              <div className="car-campo">
                <label className="car-etiqueta">{tx("invitacion.rsvp.adultos").toUpperCase()}</label>
                <div className="car-contador">
                  <button type="button" onClick={() => setAdultos((v) => Math.max(1, v - 1))} disabled={adultos <= 1} aria-label="−">−</button>
                  <span>{adultos}</span>
                  <button type="button" onClick={() => setAdultos((v) => Math.min(maxAdultos, v + 1))} disabled={adultos >= maxAdultos} aria-label="+">+</button>
                </div>
              </div>
            )}
            {maxAdolescentes > 0 && (
              <div className="car-campo">
                <label className="car-etiqueta">{tx("invitacion.rsvp.adolescentes").toUpperCase()}</label>
                <div className="car-contador">
                  <button type="button" onClick={() => setAdolescentes((v) => Math.max(0, v - 1))} disabled={adolescentes <= 0} aria-label="−">−</button>
                  <span>{adolescentes}</span>
                  <button type="button" onClick={() => setAdolescentes((v) => Math.min(maxAdolescentes, v + 1))} disabled={adolescentes >= maxAdolescentes} aria-label="+">+</button>
                </div>
              </div>
            )}
            {maxNinos > 0 && (
              <div className="car-campo">
                <label className="car-etiqueta">{tx("invitacion.rsvp.ninos").toUpperCase()}</label>
                <div className="car-contador">
                  <button type="button" onClick={() => setNinos((v) => Math.max(0, v - 1))} disabled={ninos <= 0} aria-label="−">−</button>
                  <span>{ninos}</span>
                  <button type="button" onClick={() => setNinos((v) => Math.min(maxNinos, v + 1))} disabled={ninos >= maxNinos} aria-label="+">+</button>
                </div>
              </div>
            )}
            <div className="car-campo">
              <label className="car-etiqueta">{tx("invitacion.rsvp.restriccionAlimentaria").toUpperCase()}</label>
              <input
                value={dieta}
                onChange={(e) => setDieta(e.target.value)}
                placeholder="—"
                maxLength={120}
                className="car-input"
              />
            </div>
          </>
        ) : (
          <div className="car-filas">
            {lugares > 1 && adultos > 0 && <div className="car-fila"><span>{tx("invitacion.rsvp.adultos")}</span><span>{adultos}</span></div>}
            {adolescentes > 0 && <div className="car-fila"><span>{tx("invitacion.rsvp.adolescentes")}</span><span>{adolescentes}</span></div>}
            {ninos > 0 && <div className="car-fila"><span>{tx("invitacion.rsvp.ninos")}</span><span>{ninos}</span></div>}
            <div className="car-fila car-fila--ultima">
              <span>{tx("invitacion.rsvp.restriccionAlimentaria")}</span>
              <span className="car-fila-valor">{restricciones || dieta || "—"}</span>
            </div>
          </div>
        )}

        {hayPago && monto != null && !exento && (
          <div className="car-precio">
            <span>{estadoDePago === "PAID" ? tx("invitacion.pago.abonado") : tx("invitacion.pago.valor")}</span>
            <div className="car-precio-valor">
              <span className="car-precio-total">{formatearMoneda(totalAPagar)}</span>
              {usarTotalDelServidor && vistaDePago
                ? vistaDePago.lines.map((l, i) => <span key={i} className="car-precio-detalle">{l}</span>)
                : (
                  <>
                    {adultos > 0 && <span className="car-precio-detalle">{adultos} × {formatearMoneda(precioAdulto)}</span>}
                    {adolescentes > 0 && <span className="car-precio-detalle">{adolescentes} × {formatearMoneda(precioAdo)}</span>}
                    {ninos > 0 && <span className="car-precio-detalle">{ninos} × {formatearMoneda(precioNin)}</span>}
                  </>
                )}
            </div>
          </div>
        )}

        <div ref={selloRef} className="car-sello" aria-hidden="true">{tx("invitacion.pase.confirmado").toUpperCase()}</div>
        <div ref={petalosRef} className="car-petalos" aria-hidden="true" />
      </div>

      {error && <p className="car-error">{error}</p>}

      {!confirmadoYa ? (
        <>
          <button type="button" data-xin="1" data-delay="220" className="car-btn-solido" disabled={enviando} onClick={() => enviar("CONFIRMA")}>
            {enviando ? tx("invitacion.rsvp.guardando").toUpperCase() : tx("invitacion.rsvp.confirmarAsistencia").toUpperCase()}
          </button>
          <button type="button" data-xin="1" data-delay="280" className="car-btn-fantasma" disabled={enviando} onClick={() => enviar("NO_ASISTE")}>
            {tx("invitacion.rsvp.noVoyAPoderAsistir").toUpperCase()}
          </button>
        </>
      ) : (
        <button type="button" className="car-btn-fantasma" onClick={() => setEstado("PENDING")}>
          {tx("invitacion.rsvp.modificarAsistencia").toUpperCase()}
        </button>
      )}
    </>
  );
}

interface CancionItem { id: string; title: string; artist: string; guestName: string }

/** Sugerir una canción, en una tarjeta de papel con la lista debajo. */
function CancionesCartelera({ invitationId, guestToken, guestName }: { invitationId: string; guestToken?: string; guestName: string }) {
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
      <form onSubmit={enviar} data-xin="1" data-delay="140" data-dist="30" className="car-tarjeta car-tarjeta--der">
        <div className="car-campo">
          <label className="car-etiqueta">{tx("invitacion.musica.tema").toUpperCase()}</label>
          <input value={tema} onChange={(e) => setTema(e.target.value)} placeholder={tx("invitacion.musica.nombreDeLaCancion")} maxLength={100} className="car-input car-input--serif" />
        </div>
        <div className="car-campo">
          <label className="car-etiqueta">{tx("invitacion.musica.artista").toUpperCase()}</label>
          <input value={artista} onChange={(e) => setArtista(e.target.value)} placeholder={tx("invitacion.musica.artista")} maxLength={80} className="car-input car-input--serif" />
        </div>
        {error && <p className="car-error">{error}</p>}
        <button type="submit" disabled={enviando} className="car-btn-solido car-btn-solido--tinta">
          {enviando ? tx("invitacion.musica.enviando").toUpperCase() : tx("invitacion.musica.sugeriUnaCancion").toUpperCase()}
        </button>
      </form>

      {canciones.length > 0 && (
        <div data-xin="1" data-delay="220" className="car-lista">
          {canciones.slice(0, 8).map((c) => (
            <div key={c.id} className="car-lista-fila">
              <div className="car-lista-texto">
                <span className="car-lista-tema">{c.title}</span>
                <span className="car-lista-quien">{c.artist} · {tx("invitacion.musica.sumadoPor")} {c.guestName || tx("invitacion.evento.invitado")}</span>
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
function TriviaCartelera({ preguntas, invitationId, guestToken, guestName }: { preguntas: QuizPregunta[]; invitationId: string; guestToken?: string; guestName: string }) {
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
      <div data-xin="1" data-delay="140" data-dist="30" className="car-tarjeta car-tarjeta--izq">
        <span className="car-tarjeta-kicker">{tx("invitacion.quiz.kicker").toUpperCase()}</span>
        <span className="car-tarjeta-titulo">
          {guardando ? tx("invitacion.rsvp.guardando") : tx("invitacion.quiz.respondisteCorrectamente", { aciertos: puntaje, total: preguntas.length })}
        </span>
        {!guardando && stats && stats.count > 0 && (
          <p className="car-tarjeta-mensaje">{tx("invitacion.quiz.promedio", { n: stats.count, avg: stats.avg })}</p>
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
    <div data-xin="1" data-delay="140" data-dist="30" className="car-tarjeta car-tarjeta--izq">
      <span className="car-tarjeta-kicker">{tx("invitacion.quiz.preguntaDeTotal", { n: indice + 1, total: preguntas.length }).toUpperCase()}</span>
      <span className="car-tarjeta-pregunta">{q.pregunta}</span>
      <div className="car-opciones">
        {q.opciones.map((op, oi) => {
          let clase = "";
          if (yaEligio && correcta !== undefined) {
            if (oi === correcta) clase = " car-opcion--bien";
            else if (elegidas[indice] === oi) clase = " car-opcion--mal";
          }
          return (
            <button key={oi} type="button" disabled={yaEligio} onClick={() => elegir(oi)} className={`car-opcion${clase}`}>
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
// leen la Bienvenida y el Post-evento compartidos (esperan `car-section` y
// `car-kicker`).
const CSS_CAR = `
  /* ── Cartelera ────────────────────────────────────────────────────────
     La marquesina de un teatro de Las Vegas: Limelight en neón, bombitas
     que corren, tragamonedas, naipes sobre paño verde y una ficha VIP. Todo
     es CSS: los brillos son text-shadow y box-shadow, las bombitas son
     gradientes radiales y la trama de fondo es una grilla de 1 px. */
  .car-raiz { position: fixed; inset: 0; width: 100%; height: calc(var(--vh, 1vh) * 100); overflow: hidden;
    background: var(--pp-bg); color: var(--pp-ink); font-family: var(--car-sans), 'Karla', sans-serif;
    --car-acc3: ${PALETA.acc3}; --car-pano: ${PALETA.felt}; --car-crema: #FFFDF7; --car-tinta: #07071A;
    --car-glow: color-mix(in srgb, var(--pp-acc) 50%, transparent);
    --car-glow2: color-mix(in srgb, var(--pp-acc2) 45%, transparent);
    --car-glow3: color-mix(in srgb, var(--car-acc3) 45%, transparent);
    --car-neon: 0 0 6px #FFFFFF, 0 0 18px var(--pp-acc), 0 0 46px var(--pp-acc), 0 0 90px var(--pp-acc);
    --car-neon2: 0 0 6px #FFFFFF, 0 0 18px var(--pp-acc2), 0 0 44px var(--pp-acc2);
    --car-neon3: 0 0 6px #FFFFFF, 0 0 18px var(--car-acc3), 0 0 44px var(--car-acc3); }
  .car-raiz a { color: inherit; text-decoration: none; }
  .car-raiz button { font: inherit; }

  .car-scroller { position: absolute; inset: 0; overflow-y: auto; overflow-x: hidden; opacity: 0;
    transition: opacity 900ms ease 260ms; scrollbar-width: none; }
  .car-scroller::-webkit-scrollbar { width: 0; height: 0; }

  /* La grilla de fondo (34 px, trazo 1 px) y los halos de neón. */
  .car-grilla { position: absolute; inset: 0; pointer-events: none; z-index: 0; opacity: .6;
    background-image: linear-gradient(#1B1B3E 1px, transparent 1px), linear-gradient(90deg, #1B1B3E 1px, transparent 1px);
    background-size: 34px 34px; }
  .car-grilla--tapa { opacity: .5; -webkit-mask-image: radial-gradient(60% 50% at 50% 60%, transparent 30%, #000 100%);
    mask-image: radial-gradient(60% 50% at 50% 60%, transparent 30%, #000 100%); }
  .car-halo { position: absolute; pointer-events: none; z-index: 0; border-radius: 50%; }
  .car-halo--tapa { left: 50%; top: 50%; width: 120vmax; height: 120vmax; margin: -60vmax 0 0 -60vmax;
    background: radial-gradient(circle at center, var(--car-glow) 0, transparent 38%); opacity: .45; }
  .car-halo--dorado { right: -20vw; top: 10vh; width: 70vw; height: 70vw; background: radial-gradient(circle, var(--car-glow2) 0, transparent 60%); opacity: .4; }
  .car-halo--celeste { left: -20vw; bottom: 0; width: 80vw; height: 80vw; background: radial-gradient(circle, var(--car-glow3) 0, transparent 60%); opacity: .4; }
  .car-halo--rosa { left: 50%; top: 30%; width: 90vw; height: 90vw; margin-left: -45vw; background: radial-gradient(circle, var(--car-glow) 0, transparent 60%); opacity: .4; }
  /* Los rayos dorados del cartel de ruta, que se apagan hacia abajo. */
  .car-rayos { position: absolute; inset: 0; pointer-events: none; z-index: 0; opacity: .45;
    background-image: repeating-linear-gradient(45deg, var(--pp-acc2) 0 14px, transparent 14px 28px);
    -webkit-mask-image: linear-gradient(180deg, #000 0, transparent 40%); mask-image: linear-gradient(180deg, #000 0, transparent 40%); }

  /* ── El pliego ─────────────────────────────────────────────────────── */
  .car-section { position: relative; z-index: 1; min-height: calc(var(--vh, 1vh) * 100); box-sizing: border-box; overflow: hidden;
    display: flex; flex-direction: column; gap: 22px;
    padding: 60px max(20px, calc((100% - 1100px) / 2)) 80px; background: var(--pp-bg); color: var(--pp-ink); }
  .car-section[data-tone="light"] { background: var(--pp-bg2); color: var(--car-tinta); }

  /* El folio: Karla 800 con mucho tracking. */
  .car-folio { position: relative; z-index: 1; display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;
    font-weight: 800; font-size: 11px; letter-spacing: .24em; text-transform: uppercase; }
  .car-folio--suave { color: var(--pp-ink2); }
  .car-folio--gris { color: #6E6A78; }
  .car-folio--pie { align-items: center; margin-top: auto; letter-spacing: .2em; opacity: .85; }
  .car-folio--filete { border-top: 1px solid #2A2A55; padding-top: 12px; align-items: center; }
  .car-folio-etq { font-weight: 800; font-size: 11px; letter-spacing: .22em; text-transform: uppercase; color: var(--pp-ink2); display: block; }

  /* El spread: dos páginas; desde 1024 px se abren de verdad. */
  .car-spread { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 22px; }
  .car-pagina { display: flex; flex-direction: column; gap: 14px; min-width: 0; }
  @media (min-width: 1024px) {
    .car-spread { display: grid; grid-template-columns: 1fr 1fr; align-items: center; column-gap: 72px; }
    .car-spread > * { max-width: 560px; width: 100%; min-width: 0; }
    .car-spread > *:first-child { justify-self: end; }
    .car-spread > *:last-child { justify-self: start; }
  }

  /* ── Tipos ─────────────────────────────────────────────────────────── */
  .car-h2, .car-panel-titulo, .car-frase, .car-fecha-linea, .car-tapa-nombres, .car-tragamonedas-titulo, .car-panel-sub {
    font-family: var(--car-serif), 'Limelight', cursive; font-weight: 400; text-transform: uppercase; }
  .car-h2, .car-panel-titulo { position: relative; z-index: 1; margin: 0; line-height: .92; }
  .car-h2 { font-size: clamp(44px, 13vw, 120px); }
  .car-h2--album { font-size: clamp(40px, 11vw, 96px); }
  .car-h2--dorado { text-shadow: var(--car-neon2); }
  .car-h2--celeste { text-shadow: var(--car-neon3); }
  .car-panel-titulo { font-size: clamp(48px, 15vw, 130px); text-shadow: 0 0 18px rgba(255,246,232,.35); }
  .car-panel-sub { font-size: clamp(20px, 5.6vw, 30px); letter-spacing: .06em; color: var(--pp-acc2); text-shadow: 0 0 10px var(--pp-acc2); text-transform: none; }
  .car-acento { color: var(--pp-acc); }
  .car-acento2 { color: var(--pp-acc2); }
  .car-acento3 { color: var(--car-acc3); }
  .car-parrafo { margin: 0; font-weight: 500; font-size: 15px; line-height: 1.5; max-width: 40ch; color: #6E6A78; }
  /* La píldora: el botón de esta familia es redondo de punta a punta. */
  .car-pildora { display: inline-flex; align-items: center; justify-content: center; gap: 10px; min-height: 48px; padding: 0 18px;
    border-radius: 999px; font-weight: 800; font-size: 12px; letter-spacing: .2em; text-transform: uppercase; cursor: pointer; }
  .car-pildora--tinta { background: var(--car-tinta); color: #FFF6E8; }
  .car-pildora--ancha { justify-content: space-between; margin-top: 8px; }

  /* ── 01 Guardá la fecha: el cartel de ruta ─────────────────────────── */
  .car-std { justify-content: center; }
  .car-fecha { display: flex; flex-direction: column; line-height: .9; }
  .car-fecha-linea { font-size: clamp(60px, 20vw, 170px); }
  .car-fecha-linea--dia { font-size: clamp(96px, 32vw, 240px); letter-spacing: -.01em; }
  /* El mes no puede pasarse de la página: con "septiembre" el cuerpo baja. */
  .car-fecha-linea--mes { text-align: right; color: var(--pp-acc); -webkit-text-stroke: 1px var(--car-tinta);
    font-size: min(clamp(60px, 20vw, 170px), calc((100vw - 40px) / (var(--letras, 5) * 0.78))); }
  @media (min-width: 1024px) { .car-fecha-linea--mes { font-size: min(170px, calc(560px / (var(--letras, 5) * 0.78))); } }
  .car-fecha-pie { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 10px;
    font-weight: 800; font-size: 13px; letter-spacing: .14em; text-transform: uppercase; }
  /* La foto: marco negro, filete dorado y otro negro, esquinas redondas. */
  .car-foto { position: relative; width: 100%; aspect-ratio: 4 / 5; box-sizing: border-box; overflow: hidden; border-radius: 22px;
    border: 6px solid var(--car-tinta); box-shadow: 0 0 0 4px var(--pp-acc2), 0 0 0 8px var(--car-tinta);
    background: repeating-linear-gradient(135deg, #2A2A55 0 8px, #1B1B3E 8px 16px); }
  .car-foto-capa { position: absolute; inset: 0; }
  .car-foto-revelado { position: absolute; inset: 0; z-index: 1; pointer-events: none;
    background-image: radial-gradient(var(--car-tinta) calc(var(--car-punto, 7.2) * 1px), transparent calc(var(--car-punto, 7.2) * 1px + .6px));
    background-size: 10px 10px; }
  .car-foto-cabeza { position: absolute; left: 14px; right: 14px; top: 12px; z-index: 2; display: flex; justify-content: space-between;
    font-weight: 800; font-size: 11px; letter-spacing: .22em; text-transform: uppercase; color: var(--pp-ink); }
  .car-estrellas { color: var(--pp-acc2); }
  .car-foto-pildora { position: absolute; left: 50%; bottom: 16px; z-index: 2; transform: translateX(-50%) rotate(-3deg);
    background: var(--pp-acc2); color: var(--car-tinta); border: 3px solid var(--car-tinta); border-radius: 999px; padding: 8px 18px;
    font-family: var(--car-serif), 'Limelight', cursive; font-size: 22px; letter-spacing: .06em; white-space: nowrap; }

  /* ── 02 Falta poco: el tragamonedas ────────────────────────────────── */
  .car-countdown { justify-content: space-between; padding-left: 0; padding-right: 0; }
  .car-countdown > .car-folio, .car-countdown > .car-spread { padding-left: max(20px, calc((100% - 1100px) / 2)); padding-right: max(20px, calc((100% - 1100px) / 2)); }
  .car-marquesina { position: relative; z-index: 1; overflow: hidden; padding: 8px 0; border-top: 1px solid #2A2A55; border-bottom: 1px solid #2A2A55;
    font-weight: 800; font-size: 12px; letter-spacing: .24em; text-transform: uppercase; white-space: nowrap; color: var(--pp-ink2); }
  .car-marquesina--rosa { border: 0; background: var(--pp-acc); color: var(--car-tinta);
    font-family: var(--car-serif), 'Limelight', cursive; font-weight: 400; font-size: 24px; letter-spacing: .08em; }
  .car-marquesina-tira { display: flex; width: max-content; animation: carCorre 16s linear infinite; }
  .car-marquesina-tira > span { padding-right: 36px; }
  .car-marquesina--contraria .car-marquesina-tira { animation-direction: reverse; }
  @keyframes carCorre { to { transform: translate3d(-50%, 0, 0); } }
  .car-tragamonedas { position: relative; grid-column: 1 / -1; max-width: none !important; justify-self: stretch !important;
    background: #12122E; border: 4px solid var(--pp-acc2); border-radius: 22px; padding: 18px 14px 16px;
    box-shadow: 0 0 0 6px var(--pp-bg), 0 0 0 8px #2A2A55; display: flex; flex-direction: column; gap: 14px; }
  .car-tragamonedas-titulo { align-self: center; font-size: clamp(22px, 6vw, 30px); letter-spacing: .1em; color: var(--pp-acc2); text-shadow: 0 0 10px var(--pp-acc2); }
  .car-cuenta { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
  .car-cuenta-caja { display: flex; flex-direction: column; align-items: center; gap: 8px; }
  /* Cada rodillo: papel blanco con la línea del medio, y la cifra que cae
     de arriba cada vez que cambia (el span de adentro se vuelve a montar). */
  .car-cuenta-num { position: relative; width: 100%; aspect-ratio: 3 / 4; box-sizing: border-box; overflow: hidden; border-radius: 10px;
    border: 3px solid var(--car-tinta); background: linear-gradient(180deg, #E9E2D2 0, #FFFFFF 30%, #FFFFFF 70%, #E9E2D2 100%);
    display: flex; align-items: center; justify-content: center;
    font-family: var(--car-serif), 'Limelight', cursive; font-size: clamp(30px, 9.5vw, 72px); line-height: 1; color: var(--car-tinta); }
  .car-cuenta-num::after { content: ""; position: absolute; left: 0; right: 0; top: 50%; height: 1px; background: rgba(7,7,26,.15); }
  .car-cuenta-num > span { display: inline-block; animation: carRodillo 320ms cubic-bezier(.16,1,.3,1); }
  .car-cuenta-caja:nth-child(4) .car-cuenta-num { color: var(--pp-acc); }
  @keyframes carRodillo { from { transform: translateY(-60%); opacity: .2; } to { transform: translateY(0); opacity: 1; } }
  .car-cuenta-etq { font-weight: 800; font-size: 10px; letter-spacing: .2em; text-transform: uppercase; color: var(--pp-ink2); }
  .car-tragamonedas-pie { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding-top: 6px; border-top: 1px solid #2A2A55;
    font-weight: 800; font-size: 11px; letter-spacing: .2em; text-transform: uppercase; color: var(--pp-ink2); }
  .car-luces { display: inline-flex; gap: 6px; }
  .car-luces span { width: 10px; height: 10px; border-radius: 50%; }
  .car-luces span:nth-child(1) { background: var(--pp-acc); box-shadow: 0 0 8px var(--pp-acc); }
  .car-luces span:nth-child(2) { background: var(--pp-acc2); box-shadow: 0 0 8px var(--pp-acc2); }
  .car-luces span:nth-child(3) { background: var(--car-acc3); box-shadow: 0 0 8px var(--car-acc3); }
  .car-palanca { width: 34px; height: 12px; border-radius: 6px; background: var(--pp-acc); box-shadow: 0 0 10px var(--pp-acc); }
  /* El día de la fiesta la caja dice "llegó el día" en vez de rodillos. */
  .car-tarjeta--hoy { display: flex; flex-direction: column; gap: 8px; align-items: center; text-align: center; }
  .car-tarjeta--hoy .car-tarjeta-kicker { font-weight: 800; font-size: 11px; letter-spacing: .24em; text-transform: uppercase; color: var(--pp-ink2); }
  .car-tarjeta--hoy .car-tarjeta-titulo { font-family: var(--car-serif), 'Limelight', cursive; font-size: clamp(30px, 8vw, 56px); line-height: 1;
    text-transform: uppercase; color: var(--pp-acc2); text-shadow: var(--car-neon2); }

  /* ── 03 Unas palabras: el letrero ──────────────────────────────────── */
  .car-frase-seccion { background: #04040F !important; justify-content: space-between; gap: 30px; }
  .car-letrero { position: relative; border: 3px solid var(--car-acc3); border-radius: 30px; padding: 28px 22px 30px;
    box-shadow: 0 0 18px var(--car-glow3), inset 0 0 18px var(--car-glow3); }
  .car-letrero-etq { position: absolute; left: 50%; top: -12px; transform: translateX(-50%); background: #04040F; padding: 0 12px; white-space: nowrap;
    font-weight: 800; font-size: 11px; letter-spacing: .3em; text-transform: uppercase; color: var(--car-acc3); text-shadow: 0 0 10px var(--car-acc3); }
  .car-frase { margin: 0; font-size: clamp(32px, 9vw, 72px); line-height: 1.04; letter-spacing: .02em; text-align: center; text-shadow: var(--car-neon3); }
  .car-frase .car-acento { text-shadow: 0 0 6px #FFFFFF, 0 0 18px var(--pp-acc), 0 0 40px var(--pp-acc); }
  .car-frase .car-acento2 { text-shadow: 0 0 6px #FFFFFF, 0 0 18px var(--pp-acc2), 0 0 40px var(--pp-acc2); }
  .car-firma { display: flex; flex-direction: column; gap: 6px; align-self: center; text-align: center; max-width: 320px; font-weight: 500; font-size: 16px; line-height: 1.4; }
  .car-firma-etq { font-weight: 800; font-size: 11px; letter-spacing: .24em; text-transform: uppercase; color: var(--pp-ink2); }
  .car-palos { position: relative; z-index: 1; display: flex; justify-content: center; gap: 14px; font-size: 22px; color: var(--pp-acc2); text-shadow: 0 0 10px var(--pp-acc2); }
  .car-palos-rojo { color: var(--pp-acc); text-shadow: 0 0 10px var(--pp-acc); }

  /* ── 04 Paneles: la mesa de paño y los naipes ──────────────────────── */
  .car-pan { position: relative; z-index: 1; height: calc(100vh + var(--st-pasos, 2) * 90vh); }
  .car-pan-fijo { position: sticky; top: 0; height: calc(var(--vh, 1vh) * 100); overflow: hidden; background: var(--car-pano); }
  .car-pan-fijo--claro { background: #F7F5F0; }
  .car-tira { position: absolute; top: 0; left: 0; height: 100%; display: flex; will-change: transform; }
  .car-panel { flex: 0 0 100vw; min-width: 0; height: 100%; box-sizing: border-box; position: relative; overflow: hidden;
    display: flex; flex-direction: column; justify-content: space-between; gap: 18px;
    padding: 60px max(20px, calc((100vw - 1100px) / 2)) 92px; color: var(--pp-ink); }
  .car-panel > .car-folio { opacity: .85; }
  .car-panel--pano { background: var(--car-pano); }
  .car-panel--vino { background: #5A0F24; }
  .car-panel--noche { background: #0E0E2A; }
  .car-pan[data-scroll="vertical"] { height: auto; }
  .car-pan[data-scroll="vertical"] .car-pan-fijo { position: static; height: auto; overflow: visible; }
  .car-pan[data-scroll="vertical"] .car-tira { position: static; display: block; width: 100%; transform: none !important; }
  .car-pan[data-scroll="vertical"] .car-panel { height: auto; min-height: calc(var(--vh, 1vh) * 100); }
  .car-naipe { position: relative; background: var(--car-crema); color: var(--car-tinta); border-radius: 16px; border: 2px solid #E4DCC8;
    padding: 30px 20px; display: flex; flex-direction: column; }
  .car-naipe-indice { position: absolute; left: 12px; top: 8px; display: flex; flex-direction: column; align-items: center; line-height: 1;
    font-family: var(--car-serif), 'Limelight', cursive; font-size: 22px; color: var(--car-tinta); }
  .car-naipe-indice > span { font-family: var(--car-sans), 'Karla', sans-serif; font-size: 16px; }
  .car-naipe-indice--abajo { left: auto; top: auto; right: 12px; bottom: 8px; transform: rotate(180deg); }
  .car-naipe--rojo .car-naipe-indice { color: #C8102E; }
  .car-naipe-cuerpo { display: flex; flex-direction: column; gap: 8px; padding: 0 22px; }
  .car-linea { display: flex; justify-content: space-between; gap: 14px; padding: 8px 0; border-bottom: 1px dashed #B9B0A0; font-size: 15px; line-height: 1.3; }
  .car-linea > span:first-child { font-weight: 800; font-size: 11px; letter-spacing: .18em; text-transform: uppercase; color: #6E6A78; flex: 0 0 auto; padding-top: 2px; }
  .car-linea > span:last-child { text-align: right; font-weight: 700; }
  .car-mapa { height: 190px; border-radius: 12px; overflow: hidden; border: 2px solid #E4DCC8; }
  .car-puntos { position: absolute; left: 0; right: 40px; bottom: 30px; display: flex; gap: 8px; justify-content: center; z-index: 2; color: var(--pp-acc2); }
  .car-punto { width: 12px; height: 12px; border-radius: 50%; background: currentColor !important; box-shadow: 0 0 8px currentColor;
    opacity: .25; transition: opacity 300ms ease; display: inline-block; }
  .car-punto[data-activo="1"] { opacity: 1; }
  .car-pan-fijo--claro .car-puntos { color: var(--car-tinta); }
  .car-pan-fijo--claro .car-punto { box-shadow: none; }

  /* ── 05 Check-in: el ticket ────────────────────────────────────────── */
  .car-cupon { position: relative; background: var(--car-crema); color: var(--car-tinta); border-radius: 18px; padding: 20px;
    display: flex; flex-direction: column; gap: 14px; overflow: hidden;
    -webkit-mask: radial-gradient(12px at 0 66px, transparent 98%, #000) -12px 0 / 100% 100% no-repeat, radial-gradient(12px at 100% 66px, transparent 98%, #000) 12px 0 / 100% 100% no-repeat;
    -webkit-mask-composite: source-in;
    mask: radial-gradient(12px at 0 66px, transparent 98%, #000) -12px 0 / 100% 100% no-repeat, radial-gradient(12px at 100% 66px, transparent 98%, #000) 12px 0 / 100% 100% no-repeat;
    mask-composite: intersect; }
  .car-cupon .car-tarjeta { position: relative; display: flex; flex-direction: column; gap: 14px; background: transparent; border: 0; padding: 0; transform: none !important; }
  .car-talon-top { display: flex; justify-content: space-between; align-items: center; gap: 10px; font-weight: 800; font-size: 11px; letter-spacing: .2em;
    text-transform: uppercase; color: #6E6A78; border-bottom: 2px dashed #B9B0A0; padding-bottom: 14px; margin-bottom: 4px; }
  .car-talon-estado { transition: color 400ms ease; }
  .car-campo { display: flex; flex-direction: column; gap: 6px; }
  .car-etiqueta { font-weight: 800; font-size: 11px; letter-spacing: .18em; text-transform: uppercase; color: #6E6A78; }
  .car-input { min-height: 48px; border: 0; border-bottom: 2px solid var(--car-tinta); border-radius: 0; background: transparent; color: var(--car-tinta);
    font-family: var(--car-sans), 'Karla', sans-serif; font-weight: 700; font-size: 17px; padding: 0; outline: none; }
  .car-input::placeholder { font-weight: 500; }
  .car-contador { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid var(--car-tinta); min-height: 48px; }
  .car-contador button { width: 44px; min-height: 44px; border: 0; background: transparent; color: var(--car-tinta); cursor: pointer;
    font-family: var(--car-serif), 'Limelight', cursive; font-size: 24px; line-height: 1; }
  .car-contador button:disabled { opacity: .35; cursor: default; }
  /* El número de personas es una ficha rosa con el borde punteado. */
  .car-contador > span { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
    background: var(--pp-acc); color: #FFF6E8; border: 3px dashed var(--car-crema); box-shadow: 0 0 0 2px var(--pp-acc);
    font-family: var(--car-serif), 'Limelight', cursive; font-size: 22px; line-height: 1; }
  .car-filas { display: flex; flex-direction: column; }
  .car-fila { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px dashed #B9B0A0; font-size: 15px; }
  .car-fila--ultima { border-bottom: 0; }
  .car-fila-valor { text-align: right; font-weight: 700; }
  .car-precio { display: flex; justify-content: space-between; gap: 12px; padding-top: 4px; font-weight: 800; font-size: 12px; letter-spacing: .12em; text-transform: uppercase; color: #6E6A78; }
  .car-precio-valor { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; color: var(--car-tinta); }
  .car-precio-total { font-family: var(--car-serif), 'Limelight', cursive; font-size: 26px; line-height: 1; letter-spacing: .02em; }
  .car-precio-detalle { font-weight: 700; font-size: 11px; letter-spacing: .1em; }
  .car-btn-solido { min-height: 54px; border: 0; border-radius: 999px; background: var(--pp-acc); color: #FFFFFF; cursor: pointer;
    font-family: var(--car-serif), 'Limelight', cursive; font-size: 20px; letter-spacing: .08em; text-transform: uppercase; padding: 4px 22px 0;
    transition: background 200ms ease; }
  @media (hover: hover) { .car-btn-solido:hover { background: var(--car-tinta); } }
  .car-btn-solido:disabled { opacity: .6; cursor: default; }
  .car-btn-fantasma { min-height: 48px; border: 2px solid var(--car-tinta); border-radius: 999px; background: transparent; color: var(--car-tinta);
    font-weight: 800; font-size: 12px; letter-spacing: .18em; text-transform: uppercase; cursor: pointer; padding: 0 18px; }
  .car-error { margin: 0; font-weight: 700; font-size: 12px; color: #C8102E; }
  /* El sello JACKPOT: cae girando sobre el ticket al confirmar. */
  .car-cupon .car-sello { position: absolute; right: 12px; bottom: 78px; width: 136px; aspect-ratio: 1; border-radius: 50%; pointer-events: none;
    opacity: 0; transform: rotate(18deg) scale(1.9) translateY(-120px);
    background: radial-gradient(circle, var(--car-crema) 0 30%, transparent 30.5% 39%, var(--car-crema) 39.5% 42%, var(--pp-acc) 42.5%);
    display: flex; align-items: center; justify-content: center; text-align: center; padding: 30px; box-sizing: border-box;
    font-family: var(--car-serif), 'Limelight', cursive; font-size: 13px; line-height: 1.1; color: var(--car-tinta); }
  .car-cupon .car-sello::before { content: ""; position: absolute; inset: 8%; border-radius: 50%; border: 6px dashed var(--car-crema); }
  .car-petalos { display: none; }

  /* ── 06 Álbum: la cabina de fotos ──────────────────────────────────── */
  .car-panel--album { background: #F7F5F0; color: var(--car-tinta); justify-content: flex-start; gap: 14px; }
  .car-panel--album-b { background: #EFEBE3; }
  .car-cabina { flex: 1; min-height: 0; display: grid; grid-template-columns: repeat(6, 1fr); grid-template-rows: repeat(3, 1fr); gap: 8px; max-width: 900px; }
  .car-foto-cabina { position: relative; overflow: hidden; min-height: 0; border: 6px solid #FFFFFF; border-radius: 4px; cursor: pointer;
    background: repeating-linear-gradient(135deg, #D7D1C4 0 8px, #E6E1D6 8px 16px); box-shadow: 0 1px 0 #B9B0A0; }
  .car-foto-cabina-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
  .car-bano { position: absolute; inset: 0; mix-blend-mode: multiply; opacity: 0; transition: opacity 200ms linear; }
  .car-bano--1 { background: color-mix(in srgb, var(--pp-acc) 50%, transparent); }
  .car-bano--2 { background: color-mix(in srgb, var(--car-acc3) 50%, transparent); }
  .car-bano--3 { background: color-mix(in srgb, var(--pp-acc2) 60%, transparent); }
  .car-bano--4 { background: rgba(180,85,255,.5); }
  .car-bano--5 { background: rgba(61,242,176,.5); }
  .car-foto-cabina-n { position: absolute; left: 8px; bottom: 6px; z-index: 1; font-weight: 800; font-size: 11px; letter-spacing: .14em; color: var(--car-tinta); }
  /* Las cinco fotos de una hoja, repartidas como en la plancha del mockup. */
  .car-cabina[data-cantidad="5"] .car-foto-cabina:nth-child(1) { grid-column: 1 / 4; grid-row: 1 / 3; }
  .car-cabina[data-cantidad="5"] .car-foto-cabina:nth-child(2) { grid-column: 4 / 7; grid-row: 1 / 2; }
  .car-cabina[data-cantidad="5"] .car-foto-cabina:nth-child(3) { grid-column: 4 / 6; grid-row: 2 / 3; }
  .car-cabina[data-cantidad="5"] .car-foto-cabina:nth-child(4) { grid-column: 6 / 7; grid-row: 2 / 3; }
  .car-cabina[data-cantidad="5"] .car-foto-cabina:nth-child(5) { grid-column: 1 / 7; grid-row: 3 / 4; }
  .car-cabina[data-cantidad="4"] .car-foto-cabina:nth-child(1) { grid-column: 1 / 4; grid-row: 1 / 3; }
  .car-cabina[data-cantidad="4"] .car-foto-cabina:nth-child(2) { grid-column: 4 / 7; grid-row: 1 / 2; }
  .car-cabina[data-cantidad="4"] .car-foto-cabina:nth-child(3) { grid-column: 4 / 7; grid-row: 2 / 3; }
  .car-cabina[data-cantidad="4"] .car-foto-cabina:nth-child(4) { grid-column: 1 / 7; grid-row: 3 / 4; }
  .car-cabina[data-cantidad="3"] .car-foto-cabina:nth-child(1) { grid-column: 1 / 4; grid-row: 1 / 4; }
  .car-cabina[data-cantidad="3"] .car-foto-cabina:nth-child(2) { grid-column: 4 / 7; grid-row: 1 / 3; }
  .car-cabina[data-cantidad="3"] .car-foto-cabina:nth-child(3) { grid-column: 4 / 7; grid-row: 3 / 4; }
  .car-cabina[data-cantidad="2"] .car-foto-cabina:nth-child(1) { grid-column: 1 / 4; grid-row: 1 / 4; }
  .car-cabina[data-cantidad="2"] .car-foto-cabina:nth-child(2) { grid-column: 4 / 7; grid-row: 1 / 4; }
  .car-cabina[data-cantidad="1"] .car-foto-cabina:nth-child(1) { grid-column: 1 / 7; grid-row: 1 / 4; }

  /* ── 07 Música: el jukebox ─────────────────────────────────────────── */
  .car-musica { background: #04040F !important; }
  .car-eq { display: flex; align-items: flex-end; gap: 6px; height: 40px; }
  .car-eq span { width: 8px; height: 100%; border-radius: 4px; transform-origin: bottom; animation: carEq 1.1s ease-in-out infinite; }
  .car-eq span:nth-child(3n+1) { background: var(--car-acc3); box-shadow: 0 0 8px var(--car-acc3); }
  .car-eq span:nth-child(3n+2) { background: var(--pp-acc); box-shadow: 0 0 8px var(--pp-acc); }
  .car-eq span:nth-child(3n+3) { background: var(--pp-acc2); box-shadow: 0 0 8px var(--pp-acc2); }
  @keyframes carEq { 0%, 100% { transform: scaleY(.3); } 50% { transform: scaleY(1); } }
  .car-musica form.car-tarjeta { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; transform: none !important; }
  .car-musica .car-etiqueta { display: none; }
  .car-musica .car-input { min-height: 48px; border: 2px solid #2A2A55; border-radius: 12px; background: #0E0E2A; color: var(--pp-ink);
    font-weight: 600; font-size: 15px; padding: 0 14px; min-width: 0; }
  .car-musica .car-error { grid-column: 1 / -1; color: var(--pp-acc); }
  .car-musica .car-btn-solido { grid-column: 1 / -1; min-height: 50px; border: 3px solid var(--car-acc3); background: transparent; color: var(--car-acc3);
    font-size: 18px; text-shadow: 0 0 10px var(--car-acc3); box-shadow: 0 0 14px var(--car-glow3); }
  @media (hover: hover) { .car-musica .car-btn-solido:hover { background: var(--car-acc3); color: #04040F; text-shadow: none; } }
  .car-lista { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; counter-reset: tema; }
  .car-lista-fila { display: flex; align-items: center; gap: 12px; padding: 10px 14px; background: #0E0E2A; border: 1px solid #2A2A55; border-radius: 14px; counter-increment: tema; }
  .car-lista-fila::before { content: counter(tema, decimal-leading-zero); font-family: var(--car-serif), 'Limelight', cursive; font-size: 18px;
    color: var(--pp-acc2); width: 28px; text-align: center; flex: 0 0 auto; }
  .car-lista-texto { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .car-lista-tema { font-weight: 800; font-size: 17px; line-height: 1.1; }
  .car-lista-quien { font-weight: 600; font-size: 12px; letter-spacing: .1em; text-transform: uppercase; color: var(--pp-ink2); }

  /* ── 08 Regalos: las fichas negras ─────────────────────────────────── */
  .car-tarjeta--banco { --car-borde: var(--pp-acc2); --car-borde-glow: var(--car-glow2); position: relative; z-index: 1;
    background: var(--car-tinta); color: var(--pp-ink); border-radius: 16px; padding: 16px 18px; display: flex; flex-direction: column; gap: 10px;
    border: 3px solid var(--car-borde); box-shadow: 0 0 16px var(--car-borde-glow); transform: none !important; }
  .car-tarjeta--der { --car-borde: var(--car-acc3); --car-borde-glow: var(--car-glow3); }
  .car-tarjeta--banco + .car-tarjeta--banco { margin-top: 14px; }
  .car-tarjeta-kicker { font-weight: 800; font-size: 11px; letter-spacing: .2em; text-transform: uppercase; color: var(--pp-ink2); }
  .car-tarjeta-mensaje { margin: 0; font-weight: 500; font-size: 14px; line-height: 1.5; color: var(--pp-ink2); }
  .car-tarjeta--banco .car-fila { border-bottom: 1px dashed #2A2A55; padding: 8px 0; }
  .car-tarjeta--banco .car-fila--ultima { border-bottom: 0; font-weight: 700; font-size: 12px; letter-spacing: .1em; text-transform: uppercase; color: var(--pp-ink2); }
  .car-fila-texto { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .car-fila-etq { font-weight: 800; font-size: 10px; letter-spacing: .2em; text-transform: uppercase; color: var(--pp-ink2); }
  .car-fila-dato { font-weight: 700; font-size: 14px; letter-spacing: .06em; overflow-wrap: anywhere; }
  .car-fila--copiable:first-child .car-fila-dato { font-family: var(--car-serif), 'Limelight', cursive; font-weight: 400; font-size: 22px; line-height: 1;
    letter-spacing: .04em; color: var(--car-borde); text-shadow: 0 0 10px var(--car-borde); }
  .car-btn-copiar { flex: 0 0 auto; min-height: 44px; padding: 0 14px; border: 2px solid var(--car-borde); border-radius: 999px; background: transparent;
    color: var(--car-borde); font-weight: 800; font-size: 11px; letter-spacing: .16em; text-transform: uppercase; cursor: pointer; }
  .car-btn-copiar--hecho { background: var(--car-borde); color: var(--car-tinta); }

  /* ── 09 Trivia: la ruleta ──────────────────────────────────────────── */
  .car-quiz { background: var(--car-pano) !important; }
  .car-quiz > .car-folio { opacity: .85; }
  .car-quiz-cuerpo { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 14px; }
  .car-ruleta { position: relative; width: clamp(72px, 20vw, 100px); aspect-ratio: 1; flex: 0 0 auto; }
  .car-ruleta svg { position: absolute; inset: 0; transition: transform 1400ms cubic-bezier(.16,1,.3,1); }
  .car-quiz-cuerpo:has(.car-opcion--bien) .car-ruleta svg { transform: rotate(765deg); }
  .car-ruleta-aguja { position: absolute; left: 50%; top: -4px; width: 0; height: 0; margin-left: -6px;
    border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 10px solid var(--pp-acc2); }
  .car-quiz .car-tarjeta { display: flex; flex-direction: column; gap: 14px; transform: none !important; }
  .car-quiz .car-tarjeta-kicker { font-family: var(--car-serif), 'Limelight', cursive; font-size: clamp(18px, 5vw, 26px); letter-spacing: .06em;
    color: var(--pp-acc2); text-shadow: 0 0 10px var(--pp-acc2); text-transform: none; }
  .car-quiz .car-tarjeta-pregunta, .car-quiz .car-tarjeta-titulo { font-family: var(--car-serif), 'Limelight', cursive; font-size: clamp(36px, 10vw, 84px); line-height: .96; max-width: 14ch; }
  .car-quiz .car-tarjeta-mensaje { margin: 0; font-weight: 500; font-size: 15px; opacity: .85; }
  .car-opciones { display: flex; flex-direction: column; gap: 10px; counter-reset: opcion; }
  .car-opcion { min-height: 54px; border: 2px solid rgba(255,246,232,.35); border-radius: 14px; background: rgba(7,7,26,.35); color: var(--pp-ink);
    font-weight: 800; font-size: 16px; text-align: left; padding: 0 18px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; gap: 12px;
    counter-increment: opcion; transition: background 200ms ease, color 200ms ease, border-color 200ms ease; }
  .car-opcion::after { content: counter(opcion, upper-alpha); font-family: var(--car-serif), 'Limelight', cursive; font-size: 16px; letter-spacing: .06em; }
  .car-opcion--bien { background: var(--pp-acc2); border-color: var(--pp-acc2); color: var(--car-tinta); }
  .car-opcion--bien::after { content: "Pleno"; }
  .car-opcion--mal { background: #C8102E; border-color: #C8102E; }
  .car-opcion--mal::after { content: "Casi"; }
  @media (min-width: 1024px) {
    .car-quiz-cuerpo { display: grid; grid-template-columns: auto 1fr; column-gap: 40px; align-items: start; }
    .car-quiz .car-tarjeta { display: grid; grid-template-columns: 1fr 1fr; column-gap: 72px; align-items: center; }
    .car-quiz .car-tarjeta-kicker { grid-column: 1; }
    .car-quiz .car-tarjeta-pregunta { grid-column: 1; }
    .car-quiz .car-opciones { grid-column: 2; grid-row: 1 / span 2; }
  }

  /* ── 10 Tu pase: la ficha VIP ──────────────────────────────────────── */
  .car-pase { justify-content: space-between; padding-bottom: calc(28px + env(safe-area-inset-bottom)); }
  .car-pagina--ficha { align-items: center; }
  .car-ficha { position: relative; width: min(100%, 300px); aspect-ratio: 1; box-sizing: border-box; border-radius: 50%; background: var(--car-crema);
    border: 8px dashed var(--pp-acc); box-shadow: 0 0 0 6px var(--car-crema), 0 0 30px var(--car-glow); }
  .car-ficha-anillo { position: absolute; inset: 22px; border-radius: 50%; border: 2px solid var(--car-tinta); }
  .car-ficha-qr { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; padding: 60px; box-sizing: border-box; }
  .car-ficha-qr .qr-ingreso, .car-ficha-qr section { background: transparent !important; border: none !important; padding: 0 !important; width: 100%; }
  .car-ficha-qr img, .car-ficha-qr svg, .car-ficha-qr canvas { width: 100% !important; height: auto !important; display: block; }
  .car-ficha-arriba, .car-ficha-abajo { position: absolute; left: 0; right: 0; text-align: center; }
  .car-ficha-arriba { top: 30px; font-family: var(--car-serif), 'Limelight', cursive; font-size: 14px; letter-spacing: .1em; color: var(--car-tinta); }
  .car-ficha-abajo { bottom: 30px; font-weight: 800; font-size: 10px; letter-spacing: .22em; text-transform: uppercase; color: #6E6A78; }
  .car-pase-cabeza { display: flex; align-items: flex-end; justify-content: space-between; gap: 14px; }
  .car-pase-numero, .car-pase-mesa { display: flex; flex-direction: column; }
  .car-pase-mesa { align-items: flex-end; text-align: right; }
  .car-pase-numero > span:last-child { font-family: var(--car-serif), 'Limelight', cursive; font-size: clamp(64px, 20vw, 150px); line-height: .9;
    color: var(--pp-acc2); text-shadow: var(--car-neon2); }
  .car-pase-mesa > span:last-child { font-family: var(--car-serif), 'Limelight', cursive; font-size: clamp(40px, 12vw, 90px); line-height: .9; }
  .car-caja { display: flex; flex-direction: column; background: #0E0E2A; border: 1px solid #2A2A55; border-radius: 16px; padding: 6px 16px; }
  .car-caja .car-linea { border-bottom: 1px dashed #2A2A55; font-size: 14px; padding: 10px 0; }
  .car-caja .car-linea:last-child { border-bottom: 0; }
  .car-caja .car-linea > span:first-child { color: var(--pp-ink2); }
  .car-caja .car-linea > span:last-child { font-weight: 500; line-height: 1.35; }
  .car-info-extra { margin-top: 4px; }
  .car-info-extra #info-adicional { background: transparent !important; padding: 0 !important; }
  .car-info-extra #ia-trigger-btn { background: transparent !important; color: var(--pp-acc2) !important; border: 2px solid var(--pp-acc2) !important;
    border-radius: 999px !important; font-weight: 800 !important; letter-spacing: .18em !important; text-transform: uppercase; }
  .car-raiz .ia-icon-box, .car-raiz svg.lucide { display: none !important; }
  .car-pase-pie { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 14px; }
  .car-despedida { font-family: var(--car-serif), 'Limelight', cursive; font-size: clamp(26px, 7vw, 44px); line-height: 1; letter-spacing: .04em;
    color: var(--pp-acc); text-shadow: var(--car-neon); }
  .car-replay { cursor: pointer; color: var(--pp-acc2); }
  .car-credito { display: flex; opacity: .8; }

  /* ── La marquesina (portada) ───────────────────────────────────────── */
  .car-portada { position: absolute; inset: 0; z-index: 5; overflow: hidden; background: var(--pp-bg); color: var(--pp-ink); }
  .car-portada-hoja { position: absolute; inset: 0; display: flex; flex-direction: column; box-sizing: border-box;
    padding: calc(12px + env(safe-area-inset-top)) max(12px, calc((100% - 1100px) / 2)) calc(12px + env(safe-area-inset-bottom)); }
  .car-marco { position: relative; flex: 1; min-height: 0; box-sizing: border-box; border: 20px solid #2A0F1F; border-radius: 30px;
    display: flex; flex-direction: column; justify-content: space-between; padding: 22px 14px 14px; background: color-mix(in srgb, var(--pp-bg) 60%, transparent);
    box-shadow: inset 0 0 0 3px var(--pp-acc2), 0 0 0 3px var(--pp-acc2), 0 0 0 5px #1A0A14, 0 0 30px var(--car-glow2); }
  /* Las bombitas: blanco cálido, ámbar, bronce; casquillo oscuro y halo. */
  .car-bombillas { position: absolute; display: flex; justify-content: space-between; pointer-events: none; }
  .car-bombillas--arriba { left: 12px; right: 12px; top: -17px; }
  .car-bombillas--abajo { left: 12px; right: 12px; bottom: -17px; }
  .car-bombillas--izq { top: 12px; bottom: 12px; left: -17px; flex-direction: column; }
  .car-bombillas--der { top: 12px; bottom: 12px; right: -17px; flex-direction: column; }
  .car-bombilla { width: 14px; height: 14px; border-radius: 50%; flex: 0 0 auto;
    background: radial-gradient(circle at 38% 32%, #FFFDF0 0, #FFE9A8 30%, #FFC24A 62%, #C9761A 100%);
    box-shadow: 0 0 0 2px #4A2410, 0 0 8px #FFD27A, 0 0 18px rgba(255,190,80,.9); animation: carChase .75s steps(1) infinite; }
  @keyframes carChase { 0%, 32% { opacity: 1; } 33%, 100% { opacity: .14; } }
  .car-folio--marco { text-transform: uppercase; }
  .car-folio--marco > span:last-child { color: var(--pp-ink2); text-align: right; letter-spacing: .22em; }
  .car-live { display: inline-flex; align-items: center; gap: 8px; letter-spacing: .26em; color: var(--car-acc3); text-shadow: 0 0 10px var(--car-acc3); }
  .car-live-punto { width: 8px; height: 8px; border-radius: 50%; background: var(--car-acc3); box-shadow: 0 0 10px var(--car-acc3); animation: carParpadeo 1.2s steps(1) infinite; }
  @keyframes carParpadeo { 0%, 49% { opacity: 1; } 50%, 100% { opacity: .15; } }
  .car-tapa-centro { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 10px; align-items: center; text-align: center; }
  .car-tapa-kicker { font-family: var(--car-serif), 'Limelight', cursive; font-size: clamp(20px, 5.6vw, 28px); letter-spacing: .06em;
    color: var(--pp-acc2); text-shadow: 0 0 8px var(--pp-acc2), 0 0 22px var(--car-glow2); }
  /* El nombre en neón rosa: parpadea entero cada 7 s y, además, se le apaga
     una letra cada 3,6 s (cada letra tiene su turno en el ciclo). */
  .car-tapa-nombres { margin: 0; line-height: .9; letter-spacing: .01em; display: flex; flex-direction: column;
    font-size: min(clamp(60px, 19vw, 170px), 17vh, calc((100vw - 130px) / (var(--largo, 9) * 0.74)));
    text-shadow: var(--car-neon); animation: carFlicker 7s linear infinite; }
  @media (min-width: 1024px) { .car-tapa-nombres { font-size: min(13vw, 220px, 24vh, calc((min(100vw, 1100px) - 150px) / (var(--largo, 9) * 0.74))); } }
  .car-tapa-linea { overflow: hidden; display: block; white-space: nowrap; }
  .car-tapa-linea > span { display: block; }
  .car-tapa-linea--amp { font-size: .5em; line-height: 1.1; color: var(--pp-acc); text-shadow: 0 0 6px #FFFFFF, 0 0 18px var(--pp-acc), 0 0 40px var(--pp-acc); }
  .car-letra { display: inline-block; animation: carZumbido calc(var(--n, 12) * 3.6s) linear infinite; animation-delay: calc(var(--i, 0) * -3.6s); }
  @keyframes carFlicker { 0%, 100% { opacity: 1; } 92% { opacity: 1; } 93% { opacity: .35; } 94% { opacity: 1; } 96% { opacity: .5; } 97% { opacity: 1; } }
  @keyframes carZumbido { 0%, 99.3% { opacity: 1; transform: none; } 99.4% { opacity: .25; transform: translateY(2px); } 99.6% { opacity: 1; transform: none; } 99.8% { opacity: .4; transform: translateY(2px); } }
  .car-tapa-fecha { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; color: var(--car-acc3);
    font-weight: 800; font-size: 13px; letter-spacing: .22em; text-transform: uppercase; text-shadow: 0 0 10px var(--car-acc3); }
  .car-flecha { flex: 0 0 auto; animation: carFlecha 1.2s ease-in-out infinite; }
  .car-flecha--inv { transform: scaleX(-1); animation-name: carFlechaInv; }
  @keyframes carFlecha { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(8px); } }
  @keyframes carFlechaInv { 0%, 100% { transform: scaleX(-1) translateX(0); } 50% { transform: scaleX(-1) translateX(8px); } }
  .car-tapa-datos { display: grid; grid-template-columns: 1fr 1fr 1fr; width: 100%; border-top: 1px solid #2A2A55; border-bottom: 1px solid #2A2A55; }
  .car-tapa-datos > div { padding: 10px 6px; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .car-tapa-datos > div + div { border-left: 1px solid #2A2A55; }
  .car-tapa-datos > div > span:first-child { font-size: 10px; letter-spacing: .2em; text-transform: uppercase; color: var(--pp-ink2); }
  .car-tapa-datos > div > span:last-child { font-weight: 800; font-size: 14px; letter-spacing: .04em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .car-tapa-pie { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 12px; align-items: center; text-align: center; }
  .car-tapa-mensaje { margin: 0; font-weight: 500; font-size: clamp(15px, 4.2vw, 19px); line-height: 1.35; max-width: 34ch; }
  .car-tapa-btn { min-height: 54px; width: 100%; max-width: 360px; border: 3px solid var(--pp-acc); border-radius: 999px; background: transparent;
    color: var(--pp-acc); font-family: var(--car-serif), 'Limelight', cursive; font-size: 20px; letter-spacing: .1em; text-transform: uppercase;
    padding: 4px 22px 0; cursor: pointer; text-shadow: 0 0 10px var(--pp-acc);
    box-shadow: 0 0 14px var(--car-glow), inset 0 0 14px color-mix(in srgb, var(--pp-acc) 35%, transparent);
    transition: background 200ms ease, color 200ms ease; }
  @media (hover: hover) { .car-tapa-btn:hover { background: var(--pp-acc); color: var(--pp-bg); text-shadow: none; } }

  /* ── Riel, pista y lupa ────────────────────────────────────────────── */
  .car-riel { position: absolute; right: 0; top: 0; bottom: 0; width: 40px; z-index: 4; display: flex; flex-direction: column;
    align-items: center; justify-content: space-between; padding: calc(16px + env(safe-area-inset-top)) 0 calc(16px + env(safe-area-inset-bottom));
    opacity: 0; transition: opacity 600ms ease; pointer-events: none; border-left: 1px solid #2A2A55 !important; }
  .car-riel-top { writing-mode: vertical-rl; font-family: var(--car-serif), 'Limelight', cursive; font-size: 13px; letter-spacing: .2em; }
  .car-riel-etiqueta { writing-mode: vertical-rl; font-weight: 800; font-size: 10px; letter-spacing: .28em; text-transform: uppercase; color: var(--pp-ink); }
  .car-riel-linea { flex: 1; width: 1px; margin: 16px 0; background: transparent !important; position: relative; }
  .car-riel-barra { position: absolute; left: -2px; top: 0; width: 4px; height: 0%; background: var(--pp-acc); box-shadow: 0 0 10px var(--pp-acc); transition: height 200ms linear; display: block; }
  .car-pista { position: absolute; left: 0; right: 40px; bottom: calc(18px + env(safe-area-inset-bottom)); z-index: 6; text-align: center;
    font-weight: 800; font-size: 11px; letter-spacing: .28em; color: var(--pp-ink2);
    opacity: 0; transition: opacity 600ms ease; pointer-events: none; animation: carPista 2.4s ease-in-out infinite; }
  @keyframes carPista { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(6px); } }

  .car-lupa { position: fixed; inset: 0; z-index: 200; background: rgba(7,7,26,.94);
    display: flex; align-items: center; justify-content: center; padding: 24px; cursor: zoom-out; }
  .car-lupa-cerrar { position: absolute; top: 20px; right: 20px; width: 40px; height: 40px; border: 2px solid var(--pp-acc2); border-radius: 50%;
    background: transparent; color: var(--pp-acc2); font-size: 18px; line-height: 1; cursor: pointer; }
  .car-lupa-img { max-width: 100%; max-height: 88vh; object-fit: contain; cursor: default; border: 6px solid #FFFFFF; border-radius: 4px; }

  @media (prefers-reduced-motion: reduce) {
    .car-raiz * { animation: none !important; }
    .car-scroller [data-xin] { opacity: 1 !important; transform: none !important; }
    .car-bombilla { opacity: 1; }
    .car-foto { --car-punto: 0; }
  }
`;
