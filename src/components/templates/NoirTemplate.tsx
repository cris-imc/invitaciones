"use client";

/**
 * NOIR · Colección Iconic — sub-colección "Tipográfica Editorial"
 * Variante: Clásico (base).
 *
 * GENERADO por scripts/derivar-tipografica.js a partir de
 * EditorialBlancNoirTemplate.tsx — no editar a mano: el motor se arregla en
 * Editorial Blanc & Noir; el render en scripts/jsx/tipografica/noi.jsx, los
 * estilos en scripts/css/tipografica/noi.css y las caras y la paleta en
 * scripts/familias/tipografica/noi.json.
 *
 * Cine negro: Playfair Display 900 como cartel y su itálica 400 como
 * contrapunto, Courier Prime para todo lo demás (el expediente). Negro,
 * marfil, oro y rojo sangre. Foco que sigue al puntero, persiana, humo,
 * grano, tira de película, claqueta, expediente, fotogramas, carretes y
 * créditos finales.
 *
 * Sin imágenes propias: son fuentes y CSS.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Playfair_Display, Courier_Prime } from "next/font/google";
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

const noiSerif = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--noi-serif",
});
const noiSans = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--noi-sans",
});
// El mono es la ficha técnica de la revista: folios, kickers y datos.

// ─── Paleta ─────────────────────────────────────────────────────────────────
// Las cinco variantes de "Capas de papel" cambian SOLO estos once colores
// (el script de variantes reemplaza este bloque entero, ver
// scripts/gen-capas-de-papel-variants.js). El dibujo es el mismo: los SVG de
// las escenas leen var(--pp-…), así que un cambio acá repinta cerros, cielo,
// sol y figuras de una sola vez.
const PALETA = {
  bg: "#0B0B0D",
  bg2: "#17171A",
  ink: "#F2EEE6",
  ink2: "#F2EEE6",
  acc: "#C9A24A",
  acc2: "#8E1B2C",
  sky1: "#0B0B0D",
  sky2: "#17171A",
  hill1: "#17171A",
  hill2: "#F2EEE6",
  hill3: "#F2EEE6",
  night: "#F2EEE6",
  nightInk: "#0B0B0D",
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

interface NoirTemplateProps {
  invitation: Record<string, unknown>;
  guest?: GuestRecord | null;
  isPersonalized?: boolean;
}

/** El número de pase, con tres cifras como en el mockup ("PASE Nº 042"). */
function numeroDePase(orderNumber: number | undefined): string {
  return String(orderNumber ?? 42).padStart(3, "0");
}

export function NoirTemplate({ invitation, guest, isPersonalized = false }: NoirTemplateProps) {
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
      el.style.setProperty("--noi-y", `${dist}px`);
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
            el.style.setProperty("--noi-y", "0px");
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
            ven.style.setProperty("--noi-punto", (7.2 * (1 - t)).toFixed(2));
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
          clase: `${noiSerif.variable} ${noiSans.variable}`,
          fuente: "var(--noi-sans), 'Courier Prime', monospace",
        }}
      />
    );
  }


  // El total de pliegos, para los folios ("03 / 10"). Se cuenta lo que esta
  // invitación realmente tiene: si no hay trivia, no existe el pliego 09 y el
  // pase deja de ser 10 de 10.
  const totalPliegos = cuenta;
  const folio = (n: string) => `${n} / ${String(totalPliegos).padStart(2, "0")}`;

  // El nombre como cartel de cine: Playfair 900 centrado, con la "y" en
  // itálica dorada. El renglón más largo manda el cuerpo.
  const renglones = saludaAlInvitado ? [nombreInvitado] : [nombre1, ...(nombre2 ? [nombre2] : [])];
  const renglonMasLargo = Math.max(5, ...renglones.map((n) => n.length));
  const totalLetras = Math.max(1, renglones.join("").replace(/\s/g, "").length);

  // El intertítulo: el medio en dorado y el cierre en redonda negrita.
  const tonoDePalabra = (i: number) => {
    const n = palabras.length;
    if (i >= Math.ceil(n * 0.7)) return "noi-negrita";
    if (i >= Math.floor(n * 0.25) && i < desdeAcento) return "noi-oro";
    return undefined;
  };

  const kickerDelEvento = tx(invitation.tipo === "CASAMIENTO" ? "invitacion.evento.nosCasamos" : invitation.tipo === "QUINCE_ANOS" ? "invitacion.evento.misQuinceAnos" : "invitacion.evento.teInvitamos");
  const tituloDePelicula = String(invitation.nombreEvento || kickerDelEvento);
  // Cuatro volutas de humo, cada una con su ritmo.
  const HUMO: [number, number, number][] = [[22, 6, 0], [30, 7.5, 1.8], [26, 5.2, 3.2], [34, 8, 4.6]];

  return (
    <div
      ref={raizRef}
      className={`${noiSerif.variable} ${noiSans.variable} noi-raiz`}
      style={varsDePaleta}
    >
      <style>{CSS_NOI}</style>
      <style>{COVER_RESPONSIVE_STYLE}</style>

      <div ref={scrollerRef} className="noi-scroller">
        {/* ── 01 Guardá la fecha ─────────────────────────────────────────
            El cartel de cine: marfil, "estreno mundial", la fecha en tres
            renglones y la foto en blanco y negro con perforaciones de
            película a los costados. */}
        <section data-tone="light" data-screen-label={tx("invitacion.saveTheDate.guardaLaFecha")} className="noi-section noi-std">
          <div className="noi-folio">
            <span data-xin="1" data-dist="-40">{nSaveTheDate} — {tx("invitacion.saveTheDate.guardaLaFecha").toUpperCase()}</span>
            <span data-xin="1" data-dist="40">{folio(nSaveTheDate)}</span>
          </div>
          <div className="noi-spread">
            <div className="noi-pagina">
              <span data-xin="1" className="noi-estreno">{tx("invitacion.saveTheDate.estrenoMundial")}</span>
              <div className="noi-fecha">
                <span data-xin="1" data-dist="-160" className="noi-fecha-linea noi-fecha-linea--dia">{diaNum}</span>
                <span data-xin="1" data-dist="160" data-delay="120" className="noi-fecha-linea noi-fecha-linea--mes">{tx("invitacion.evento.de")} {mesLargo}</span>
                <span data-xin="1" data-dist="-160" data-delay="240" className="noi-fecha-linea noi-fecha-linea--anio">{anio}</span>
              </div>
              <div data-xin="1" data-delay="360" className="noi-fecha-pie">
                <span>{diaSemana} · {tx("invitacion.saveTheDate.funcionUnica")} · {hora} H</span>
                <AddToCalendarLink
                  eventName={titulo}
                  targetDate={fechaHora}
                  location={[lugarNombre, direccion].filter(Boolean).join(", ")}
                  className="noi-chip"
                  showIcon={false}
                >
                  {tx("invitacion.saveTheDate.reservarEnCalendario")}
                </AddToCalendarLink>
              </div>
            </div>

            {hayFoto && (
              <div ref={ventanaRef} data-xin="1" data-delay="200" data-dist="0" className="noi-foto">
                <span className="noi-perforaciones noi-perforaciones--izq" aria-hidden="true" />
                <span className="noi-perforaciones noi-perforaciones--der" aria-hidden="true" />
                {fotoMobile && (
                  <div className="acp-mobile-only noi-foto-capa">
                    <AnimatedCoverPhoto photoSrc={fotoMobile} tint={false} effect="enfoque" scrimColorRgb="11,11,13" />
                  </div>
                )}
                {fotoDesktop && (
                  <div className="acp-desktop-only noi-foto-capa">
                    <AnimatedCoverPhoto photoSrc={fotoDesktop} tint={false} effect="enfoque" scrimColorRgb="11,11,13" />
                  </div>
                )}
                {/* La trama que tapa la foto y se disuelve al subir: el radio
                    del punto lo mueve el motor en --noi-punto. */}
                <span className="noi-foto-revelado" aria-hidden="true" />
                <span className="noi-foto-etq">{tx("invitacion.album.nuestraFoto").toUpperCase()} · B/N</span>
              </div>
            )}
          </div>
        </section>

        {/* ── 02 Falta poco ──────────────────────────────────────────────
            La claqueta: la franja a rayas, la caja con producción y
            dirección, los cuatro números y la toma. */}
        <section data-tone="dark" data-screen-label={tx("invitacion.cuentaRegresiva.kicker")} className="noi-section noi-countdown">
          <div className="noi-folio noi-folio--oro">
            <span data-xin="1" data-dist="-40">{nCountdown} — {tx("invitacion.cuentaRegresiva.kicker").toUpperCase()}</span>
            <span data-xin="1" data-dist="40">{folio(nCountdown)}</span>
          </div>
          <span className="noi-claqueta" aria-hidden="true" />
          <div className="noi-spread">
            <div className="noi-pagina noi-pagina--entera">
              <div className="noi-claqueta-caja">
                <div className="noi-claqueta-fila"><span>{tx("invitacion.saveTheDate.prod").toUpperCase()} {titulo.toUpperCase()}</span><span>{tx("invitacion.saveTheDate.dirElDestino").toUpperCase()}</span></div>
                <CuentaNoir targetDate={fechaHora} />
                <div className="noi-claqueta-fila noi-claqueta-fila--pie"><span>{tx("invitacion.saveTheDate.escena").toUpperCase()} {nCountdown}</span><span>{tx("invitacion.saveTheDate.toma").toUpperCase()} {String(fechaEvento.getDate() % 9 + 1)}</span></div>
              </div>
            </div>
          </div>
          <div className="noi-marquesina" aria-hidden="true">
            <div className="noi-marquesina-tira">
              {[0, 1].map((i) => (
                <span key={i}>
                  {[lugarNombre, ciudad, `${hora} h`, dressCode].filter(Boolean).join(" · ").toUpperCase()} ·&nbsp;
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── 03 Unas palabras ───────────────────────────────────────────
            El intertítulo de cine mudo: viñeta oscura, marco doble y la
            frase en itálica que se funde palabra por palabra. */}
        {hayFrase && (
          <section data-tone="dark" data-screen-label={tx("invitacion.frase.etiqueta")} className="noi-section noi-frase-seccion">
            <span className="noi-vineta" aria-hidden="true" />
            <div className="noi-folio noi-folio--oro">
              <span data-xin="1" data-dist="-40">{nFrase} — {tx("invitacion.saveTheDate.intertitulo").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nFrase)}</span>
            </div>
            <div className="noi-spread noi-spread--centro">
              <div className="noi-intertitulo">
                <h2 ref={fraseRef} className="noi-frase">
                  {palabras.map((p, i) => (
                    // El espacio va fuera del span: el motor pone cada palabra
                    // en inline-block y un espacio adentro se colapsa a cero.
                    <span key={i}>
                      <span data-w="1" className={tonoDePalabra(i)}>{p}</span>{" "}
                    </span>
                  ))}
                </h2>
              </div>
              <span data-xin="1" data-delay="900" data-dist="60" className="noi-frase-firma">{tx("invitacion.frase.conAmor").toUpperCase()} · {titulo.toUpperCase()}</span>
            </div>
            <div className="noi-folio noi-folio--suave noi-folio--pie">
              <span>{titulo.toUpperCase()}</span>
              <span>{tx("invitacion.saveTheDate.rollo").toUpperCase()} {nFrase}</span>
            </div>
          </section>
        )}

        {/* ── 04 Cuándo y dónde ──────────────────────────────────────────
            Las escenas: exterior noche sobre negro, interior sobre marfil y
            el guion de la noche sobre rojo sangre. */}
        <div
          id="details"
          data-pan="1"
          data-scroll={scrollVertical || panelesLugar.length <= 1 ? "vertical" : "lateral"}
          data-screen-label={tx("invitacion.ubicacion.cuandoYDonde")}
          className="noi-pan"
          style={{ "--st-pasos": Math.max(0, panelesLugar.length - 1) } as React.CSSProperties}
        >
          <div className="noi-pan-fijo">
            <div data-strip="1" className="noi-tira">
              <div data-tone="dark" className="noi-panel noi-panel--negro">
                <div className="noi-folio noi-folio--acento">
                  <span>{nCuando} — {tx("invitacion.saveTheDate.escena").toUpperCase()} {deLugar("recepcion").split(" ")[0]}</span><span>{deLugar("recepcion")}</span>
                </div>
                <div className="noi-spread">
                  <div className="noi-pagina">
                    <span className="noi-panel-sub">{tx("invitacion.ubicacion.fiestaSalon")}</span>
                    <h2 className="noi-panel-titulo">{lugarNombre || ciudad}</h2>
                  </div>
                  <div className="noi-ficha">
                    <div className="noi-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{hora} h</span></div>
                    {direccion && <div className="noi-linea"><span>{tx("invitacion.ubicacion.direccion")}</span><span>{direccion}</span></div>}
                    {dressCode && <div className="noi-linea"><span>{tx("invitacion.ubicacion.dressCode")}</span><span>{dressCode}</span></div>}
                    {mapUrl && (
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="noi-cta">
                        {tx("invitacion.ubicacion.comoLlegar").toUpperCase()}<span>→</span>
                      </a>
                    )}
                  </div>
                </div>
                <div className="noi-folio noi-folio--pie">
                  <span>{[direccion, ciudad].filter(Boolean).join(" · ").toUpperCase()}</span>
                  {!scrollVertical && panelesLugar.length > 1 && <span>{tx("invitacion.portada.desliza").toUpperCase()} →</span>}
                </div>
              </div>

              {ceremoniaHabilitada && (
                <div id="ceremonia" data-tone="light" className="noi-panel noi-panel--marfil">
                  <div className="noi-folio noi-folio--acento">
                    <span>{nCuando} — {tx("invitacion.saveTheDate.escena").toUpperCase()} {deLugar("ceremonia").split(" ")[0]}</span><span>{deLugar("ceremonia")}</span>
                  </div>
                  <div className="noi-spread">
                    <div className="noi-pagina">
                      <span className="noi-panel-sub">{ceremoniaTitulo}</span>
                      <h2 className="noi-panel-titulo">{ceremoniaNombre || ceremoniaTitulo}</h2>
                    </div>
                    <div className="noi-ficha">
                      {ceremoniaHora && <div className="noi-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{ceremoniaHora} h</span></div>}
                      {ceremoniaDireccion && <div className="noi-linea"><span>{tx("invitacion.ubicacion.direccion")}</span><span>{ceremoniaDireccion}</span></div>}
                    </div>
                  </div>
                  <div className="noi-folio noi-folio--pie">
                    <span>{tx("invitacion.ubicacion.ceremoniaCivil").toUpperCase()}</span>
                    {!scrollVertical && <span>{tx("invitacion.portada.desliza").toUpperCase()} →</span>}
                  </div>
                </div>
              )}

              {hayComoLlegar && (
                <div id="location" data-tone="dark" className="noi-panel noi-panel--negro">
                  <div className="noi-folio noi-folio--acento">
                    <span>{nCuando} — {tx("invitacion.saveTheDate.escena").toUpperCase()} {deLugar("llegar").split(" ")[0]}</span><span>{deLugar("llegar")}</span>
                  </div>
                  <div className="noi-spread">
                    <div className="noi-pagina">
                      <span className="noi-panel-sub">{ciudad || lugarNombre}</span>
                      <h2 className="noi-panel-titulo">{tx("invitacion.ubicacion.comoLlegar")}</h2>
                    </div>
                    <div className="noi-ficha">
                      {embedMapUrl && (
                        <div className="noi-mapa">
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
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="noi-cta">
                        {tx("invitacion.ubicacion.abrirEnMapas").toUpperCase()}<span>→</span>
                      </a>
                    </div>
                  </div>
                  <div className="noi-folio noi-folio--pie">
                    <span>{[direccion, ciudad].filter(Boolean).join(" · ").toUpperCase()}</span>
                    {!scrollVertical && <span>{tx("invitacion.portada.desliza").toUpperCase()} →</span>}
                  </div>
                </div>
              )}

              {cronograma.length > 0 && (
                <div id="schedule" data-tone="dark" className="noi-panel noi-panel--rojo">
                  <div className="noi-folio">
                    <span>{nCuando} — {tx("invitacion.saveTheDate.escena").toUpperCase()} {deLugar("cronograma").split(" ")[0]}</span><span>{deLugar("cronograma")}</span>
                  </div>
                  <div className="noi-spread">
                    <div className="noi-pagina">
                      <span className="noi-panel-sub">{tx("invitacion.saveTheDate.guionDeLaNoche")}</span>
                      <h2 className="noi-panel-titulo">{tx("invitacion.ubicacion.laNochePasoAPaso").split(",")[0]}</h2>
                    </div>
                    <div className="noi-ficha">
                      {cronograma.map((item, i) => (
                        <div key={i} className="noi-linea"><span>{item.time || ""}</span><span>{item.title}</span></div>
                      ))}
                    </div>
                  </div>
                  <div className="noi-folio noi-folio--pie">
                    <span>{fechaPuntos}</span>
                  </div>
                </div>
              )}
            </div>
            {!scrollVertical && panelesLugar.length > 1 && <Puntos cantidad={panelesLugar.length} />}
          </div>
        </div>

        {/* ── 05 Check-in ────────────────────────────────────────────────
            El expediente: sobre marfil, la carpeta con "Caso Nº", máquina
            de escribir y el sello rectangular CONFIRMADO. */}
        {rsvpHabilitado && (
          <section id="rsvp" data-tone="light" data-screen-label={tx("invitacion.rsvp.confirmar")} className="noi-section noi-checkin">
            <div className="noi-folio">
              <span data-xin="1" data-dist="-40">{nCheckin} — {tx("invitacion.saveTheDate.expediente").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nCheckin)}</span>
            </div>
            <div className="noi-spread">
              <div className="noi-pagina">
                <h2 data-xin="1" data-dist="-80" className="noi-h2">
                  {tx("invitacion.rsvp.confirmaLinea1")}<br /><span className="noi-italica noi-rojo">{tx("invitacion.rsvp.confirmaLinea2")}</span>
                </h2>
              </div>
              <div data-xin="1" data-delay="160" data-dist="80" className="noi-cupon">
                <CheckinNoir
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
            La tira de fotogramas: negro con perforaciones arriba y abajo,
            y las fotos con su baño de color. */}
        {todasLasFotos.length > 0 && (
          <div
            id="album"
            data-pan="1"
            data-scroll={scrollVertical || hojasDeFotos.length <= 1 ? "vertical" : "lateral"}
            data-screen-label={tx("invitacion.album.titulo")}
            className="noi-pan"
            style={{ "--st-pasos": Math.max(0, hojasDeFotos.length - 1) } as React.CSSProperties}
          >
            <div className="noi-pan-fijo noi-pan-fijo--album">
              <div data-strip="1" className="noi-tira">
                {hojasDeFotos.map((hoja, iHoja) => (
                  <div key={iHoja} data-tone="light" className={`noi-panel noi-panel--album${iHoja % 2 === 1 ? " noi-panel--album-b" : ""}`}>
                    <div className="noi-folio noi-folio--gris">
                      <span>{nAlbum} — {tx("invitacion.saveTheDate.fotogramas").toUpperCase()}</span>
                      <span>{tx("invitacion.saveTheDate.rollo").toUpperCase()} {String(iHoja + 1).padStart(2, "0")} / {String(hojasDeFotos.length).padStart(2, "0")} · {folio(nAlbum)}</span>
                    </div>
                    <h2 className="noi-h2 noi-h2--album">{tx("invitacion.saveTheDate.detrasDe")} <span className="noi-italica">{tx("invitacion.saveTheDate.escena").toLowerCase()}</span></h2>
                    <div className="noi-fotogramas" data-cantidad={hoja.length}>
                      {hoja.map((url, i) => (
                        <div
                          key={i}
                          data-sheet="1"
                          className="noi-fotograma"
                          role="button"
                          tabIndex={0}
                          onClick={() => setFotoAmpliada(url)}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setFotoAmpliada(url); }}
                          aria-label={tx("invitacion.album.ampliarFoto", { n: i + 1 })}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="" loading="lazy" className="noi-fotograma-img" />
                          <span data-colorwash="1" className={`noi-bano noi-bano--${(i % 2) + 1}`} aria-hidden="true" />
                          <span className="noi-fotograma-n">FOTO {String(i + 1).padStart(2, "0")}</span>
                        </div>
                      ))}
                    </div>
                    <div className="noi-folio noi-folio--gris noi-folio--pie">
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
            La banda sonora: dos carretes girando y la lista con filetes
            punteados. */}
        {sugerenciaMusicaHabilitada && (
          <section id="songs" data-tone="dark" data-screen-label={tx("invitacion.musica.titulo")} className="noi-section noi-musica">
            <div className="noi-folio noi-folio--oro">
              <span data-xin="1" data-dist="-40">{nMusica} — {tx("invitacion.saveTheDate.bandaSonora").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nMusica)}</span>
            </div>
            <div className="noi-spread">
              <div className="noi-pagina">
                <h2 data-xin="1" data-dist="-80" className="noi-h2">
                  {tituloEnDosLineas(tx("invitacion.sabor.preguntaCancionFaltar"), "noi-italica noi-oro")}
                </h2>
                <div data-xin="1" data-delay="120" className="noi-carretes" aria-hidden="true">
                  <span className="noi-carrete"><i /><i /><i /><i /></span><span className="noi-carrete-cinta" /><span className="noi-carrete noi-carrete--oro"><i /><i /><i /><i /></span>
                </div>
              </div>
              <div className="noi-pagina">
                <CancionesNoir
                  invitationId={String(invitation.id ?? "")}
                  guestToken={guest?.uniqueToken}
                  guestName={nombreInvitado || tx("invitacion.evento.invitado")}
                />
              </div>
            </div>
          </section>
        )}

        {/* ── 08 Regalos ─────────────────────────────────────────────────
            Sobre marfil, fichas de papel con filete. */}
        {hayRegalos && (
          <section id="banco" data-tone="light" data-screen-label={tx("invitacion.regalos.titulo")} className="noi-section noi-regalos">
            <div className="noi-folio">
              <span data-xin="1" data-dist="-40">{nRegalos} — {tx("invitacion.regalos.titulo").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nRegalos)}</span>
            </div>
            <div className="noi-spread">
              <div className="noi-pagina">
                <h2 data-xin="1" data-dist="-80" className="noi-h2">
                  {tx("invitacion.regalos.siQueresLinea1")}<br /><span className="noi-italica noi-rojo">{tx("invitacion.regalos.siQueresLinea2")}</span>
                </h2>
                {Boolean(invitation.regaloMensaje) && (
                  <p data-xin="1" data-delay="120" className="noi-parrafo">{String(invitation.regaloMensaje)}</p>
                )}
              </div>
              <div className="noi-pagina">
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
            El interrogatorio: rojo sangre, la pregunta en itálica y las
            opciones que dicen culpable o coartada. */}
        {quizHabilitado && (
          <section id="quiz" data-tone="dark" data-screen-label="Quiz" className="noi-section noi-quiz">
            <div className="noi-folio">
              <span data-xin="1" data-dist="-40">{nQuiz} — {triviaTitulo.toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{tx("invitacion.saveTheDate.interrogatorio").toUpperCase()} · {folio(nQuiz)}</span>
            </div>
            <div className="noi-spread">
              <TriviaNoir
                preguntas={triviaPreguntas}
                invitationId={String(invitation.id ?? "")}
                guestToken={guest?.uniqueToken}
                guestName={nombreInvitado || tx("invitacion.evento.invitado")}
              />
            </div>
          </section>
        )}

        {/* ── 10 Tu pase ─────────────────────────────────────────────────
            Los créditos finales: el QR sobre marfil con doble filete
            dorado, el pase enorme, la butaca en itálica y FIN. */}
        <section data-tone="dark" data-screen-label={tx("invitacion.pase.tuPase")} className="noi-section noi-pase">
          <div className="noi-folio noi-folio--oro">
            <span data-xin="1" data-dist="-40">{nPase} — {tx("invitacion.saveTheDate.creditosFinales").toUpperCase()}</span>
            <span data-xin="1" data-dist="40">{folio(nPase)}</span>
          </div>
          <div className="noi-spread">
            <div data-xin="1" data-dist="-60" className="noi-pagina noi-pagina--qr">
              <div className="noi-qr">
                <QrDeIngreso guest={guest as never} />
                <span className="noi-qr-etq">{tx("invitacion.pase.tuPase").toUpperCase()}</span>
              </div>
            </div>
            <div className="noi-pagina">
              <div data-xin="1" data-delay="100" className="noi-pase-cabeza">
                <div className="noi-pase-numero">
                  <span className="noi-folio-etq">{tx("invitacion.pase.pase").toUpperCase()} Nº</span>
                  <span>{pase}</span>
                </div>
                {guest?.mesas && guest.mesas.length > 0 && (
                  <div className="noi-pase-mesa">
                    <span className="noi-folio-etq">{tx("invitacion.saveTheDate.butaca").toUpperCase()}</span>
                    <span>{guest.mesas[0]}</span>
                  </div>
                )}
              </div>
              <div data-xin="1" data-delay="160" className="noi-lineas-pase">
                <div className="noi-linea"><span>{saludaAlInvitado ? tx("invitacion.pase.reservadoPara") : tx("invitacion.evento.invitado")}</span><span>{nombreInvitado || titulo}</span></div>
                {lugaresDelPase > 0 && (
                  <div className="noi-linea"><span>{tx("invitacion.pase.lugares")}</span><span>{lugaresDelPase}</span></div>
                )}
                {guest?.mesas && guest.mesas.length > 0 && (
                  <div className="noi-linea"><span>Sector · {tx("invitacion.pase.tuMesa")}</span><span>{guest.mesas.join(" · ")}</span></div>
                )}
                <div className="noi-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{fechaPuntos} · {hora} H</span></div>
              </div>
              <div className="noi-info-extra">
                <InfoAdicionalSection invitation={invitation} />
              </div>
            </div>
          </div>
          <div data-xin="1" data-delay="220" className="noi-pase-pie">
            <span className="noi-fin">FIN</span>
            <span className="noi-fin-sub">{tx("invitacion.saveTheDate.oElPrincipio")} — {iniciales(nombre1, nombre2)}</span>
            <div className="noi-folio noi-folio--oro noi-folio--colofon">
              <span className="noi-credito"><LogoFooterCredit bgColor="transparent" textColor={PALETA.ink} /></span>
              <span className="noi-replay" role="button" tabIndex={0} onClick={volverAVerla} onKeyDown={(e) => { if (e.key === "Enter") volverAVerla(); }}>
                {tx("invitacion.saveTheDate.rebobinar").toUpperCase()} ↺
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* ── Riel de progreso ───────────────────────────────────────────── */}
      <div ref={rielRef} className="noi-riel">
        <span ref={rielTopRef} className="noi-riel-top">{pase}</span>
        <div ref={rielLineaRef} className="noi-riel-linea">
          <span ref={rielBarraRef} className="noi-riel-barra" />
        </div>
        <span ref={rielEtiquetaRef} className="noi-riel-etiqueta">{tx("invitacion.saveTheDate.guardaLaFecha").toUpperCase()}</span>
      </div>

      {/* ── La tapa ─────────────────────────────────────────────────────
          El foco, la persiana y el humo: un cartel de cine negro con el
          nombre en Playfair 900, la "y" en itálica dorada y el título de
          la película. Es la bienvenida: dice de quién es la fiesta,
          cuándo, dónde y para cuántos. */}
      <div ref={portadaRef} data-tone={TONO} className="noi-portada">
        <div ref={escenaPortadaRef} className="noi-portada-hoja">
          <div className="noi-escenario" aria-hidden="true">
            <span data-depth="6" className="noi-foco" />
            <span data-depth="1.5" className="noi-persiana" />
            {HUMO.map(([x, d, dl], i) => (
              <span key={i} className="noi-humo" style={{ left: `${x}%`, animationDuration: `${d}s`, animationDelay: `${dl}s` }} />
            ))}
            <span className="noi-grano" />
          </div>

          <div data-cl="1" className="noi-folio noi-folio--oro noi-folio--tapa">
            <span>{tx("invitacion.saveTheDate.escena")} 00 · {tx("invitacion.saveTheDate.toma")} 1</span>
            <span>Nº 00 / {String(totalPliegos).padStart(2, "0")}</span>
          </div>

          <div data-cl="2" className="noi-tapa-centro">
            <span className="noi-tapa-kicker">— {tx("invitacion.saveTheDate.unaProduccionDe")} —</span>
            <h1 ref={cartelRef} className="noi-tapa-nombres" style={{ "--largo": renglonMasLargo, "--n": totalLetras } as React.CSSProperties}>
              {saludaAlInvitado ? (
                <span className="noi-tapa-linea"><span data-pieza="1"><Letras texto={nombreInvitado} desde={0} /></span></span>
              ) : (
                <>
                  <span className="noi-tapa-linea"><span data-pieza="1"><Letras texto={nombre1} desde={0} /></span></span>
                  {nombre2 && (
                    <>
                      <span className="noi-tapa-linea noi-tapa-linea--y"><span data-pieza="1">{tx("invitacion.rsvp.y")}</span></span>
                      <span className="noi-tapa-linea"><span data-pieza="1"><Letras texto={nombre2} desde={nombre1.replace(/\s/g, "").length} /></span></span>
                    </>
                  )}
                </>
              )}
            </h1>
            <span className="noi-tapa-pelicula">{tx("invitacion.saveTheDate.en")} «{tituloDePelicula}»</span>
            <div className="noi-tapa-datos">
              <span>{diaSemana} {diaNum} · {String(fechaEvento.getMonth() + 1).padStart(2, "0")} · {anio} · {hora}<br /><span className="noi-oro">{[lugarNombre, ciudad].filter(Boolean).join(" · ")}</span></span>
              <span className="noi-tapa-datos-der">
                {isPersonalized && guest
                  ? <>{tx("invitacion.pase.pase").toUpperCase()} Nº {pase}<br /><span className="noi-oro">{lugaresDelPase} {tx(lugaresDelPase === 1 ? "invitacion.bienvenida.persona" : "invitacion.bienvenida.personas")}</span></>
                  : <>{kickerDelEvento.toUpperCase()}<br /><span className="noi-oro">{dressCode || fechaPuntos}</span></>}
              </span>
            </div>
          </div>

          <div data-cl="3" className="noi-tapa-pie">
            <p className="noi-tapa-mensaje">
              {saludaAlInvitado
                ? `${tx("invitacion.bienvenida.hola", { nombre: nombreInvitado })}: ${String(invitation.portadaMensaje || tx("invitacion.sabor.mensajeLoContamosNosotros"))}`
                : String(invitation.portadaMensaje || tx("invitacion.sabor.mensajeLoContamosNosotros"))}
            </p>
            <button type="button" onClick={abrir} className="noi-tapa-btn">
              {tx("invitacion.portada.abrirInvitacion").toUpperCase()}<span className="noi-cursor">_</span>
            </button>
          </div>
        </div>
      </div>

      <div ref={pistaRef} className="noi-pista">{tx("invitacion.portada.desliza").toUpperCase()} ↓</div>

      {fotoAmpliada && (
        <div className="noi-lupa" onClick={() => setFotoAmpliada(null)} onContextMenu={(e) => e.preventDefault()}>
          <button
            type="button"
            className="noi-lupa-cerrar"
            onClick={(e) => { e.stopPropagation(); setFotoAmpliada(null); }}
            aria-label={tx("invitacion.cerrar")}
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fotoAmpliada} alt={tx("invitacion.album.fotoAmpliada")} className="noi-lupa-img" draggable={false} onClick={(e) => e.stopPropagation()} />
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
 * El nombre letra por letra: cada tanto una salta como una tecla de máquina
 * de escribir (sube 4 px y baja en seco). El CSS escalona el turno.
 */
function Letras({ texto, desde }: { texto: string; desde: number }) {
  let k = desde;
  return (
    <>
      {Array.from(texto).map((ch, i) =>
        ch === " " ? " " : <span key={i} className="noi-letra" style={{ "--i": k++ } as React.CSSProperties}>{ch}</span>
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
    <div className="noi-puntos" aria-hidden="true">
      {Array.from({ length: cantidad }).map((_, i) => (
        <span key={i} data-dot={i} className="noi-punto" style={{ background: i === 0 ? PALETA.acc : "rgba(43,42,51,.18)" }} />
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
function CuentaNoir({ targetDate }: { targetDate: Date }) {
  const tx = useTextos();
  const { time, isEventDay, isPast, hasEnded } = useCountdown(targetDate);

  if (isEventDay || hasEnded || isPast) {
    return (
      <div className="noi-tarjeta noi-tarjeta--hoy" data-xin="1" data-delay="80" data-dist="30">
        <span className="noi-tarjeta-kicker">{tx("invitacion.cuentaRegresiva.kicker").toUpperCase()}</span>
        <span className="noi-tarjeta-titulo">
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
    <div className="noi-cuenta">
      {celdas.map((c, i) => (
        <div key={c.l} data-xin="1" data-delay={i * 100} data-dist={i % 2 === 0 ? -80 : 80} className={`noi-cuenta-caja noi-cuenta-caja--${i + 1}`}>
          <span className="noi-cuenta-num"><span key={c.v}>{c.v}</span></span>
          <span className="noi-cuenta-etq">{c.l.toUpperCase()}</span>
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
    <div className="noi-fila noi-fila--copiable">
      <div className="noi-fila-texto">
        <span className="noi-fila-etq">{etiqueta.toUpperCase()}</span>
        <span className="noi-fila-dato">{valor}</span>
      </div>
      <button type="button" onClick={copiar} className={`noi-btn-copiar${copiado ? " noi-btn-copiar--hecho" : ""}`}>
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
      className={`noi-tarjeta noi-tarjeta--banco${dobleZ ? " noi-doblez" : ""}${inclinada ? " noi-tarjeta--der" : " noi-tarjeta--izq"}`}
    >
      <span className="noi-tarjeta-kicker">{titulo.toUpperCase()}</span>
      {mensaje && <p className="noi-tarjeta-mensaje">{mensaje}</p>}
      <div className="noi-filas">
        <FilaCopiable etiqueta="Alias" valor={alias} />
        <FilaCopiable etiqueta="CBU" valor={cbu} />
        {(banco || titular) && (
          <div className="noi-fila noi-fila--ultima">
            <span>{banco || tx("invitacion.regalos.banco")}</span>
            <span className="noi-fila-valor">{titular}</span>
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
function CheckinNoir({
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
      <div data-xin="1" data-delay="140" data-dist="30" className="noi-tarjeta noi-tarjeta--izq">
        <p className="noi-tarjeta-mensaje">{tx("invitacion.rsvp.graciasPorAvisarAcceso")}</p>
        <button type="button" className="noi-btn-fantasma" onClick={() => setEstado("PENDING")}>
          {tx("invitacion.rsvp.cambieDeIdea").toUpperCase()}
        </button>
      </div>
    );
  }

  const confirmadoYa = estado === "CONFIRMED";

  return (
    <>
      <div ref={tarjetaRef} data-xin="1" data-delay="140" data-dist="30" className="noi-tarjeta noi-tarjeta--talon">
        <div className="noi-talon-top">
          <span>{tx("invitacion.pase.numeroPase", { n: pase }).toUpperCase()}{guestName ? ` · ${guestName.toUpperCase()}` : ""}</span>
          <span ref={estadoRef} className="noi-talon-estado">
            {confirmado || confirmadoYa ? tx("invitacion.pase.accesoConfirmado").toUpperCase() : tx("invitacion.pase.pendiente").toUpperCase()}
          </span>
        </div>

        {!confirmadoYa ? (
          <>
            {lugares > 1 && (
              <div className="noi-campo">
                <label className="noi-etiqueta">{tx("invitacion.rsvp.adultos").toUpperCase()}</label>
                <div className="noi-contador">
                  <button type="button" onClick={() => setAdultos((v) => Math.max(1, v - 1))} disabled={adultos <= 1} aria-label="−">−</button>
                  <span>{adultos}</span>
                  <button type="button" onClick={() => setAdultos((v) => Math.min(maxAdultos, v + 1))} disabled={adultos >= maxAdultos} aria-label="+">+</button>
                </div>
              </div>
            )}
            {maxAdolescentes > 0 && (
              <div className="noi-campo">
                <label className="noi-etiqueta">{tx("invitacion.rsvp.adolescentes").toUpperCase()}</label>
                <div className="noi-contador">
                  <button type="button" onClick={() => setAdolescentes((v) => Math.max(0, v - 1))} disabled={adolescentes <= 0} aria-label="−">−</button>
                  <span>{adolescentes}</span>
                  <button type="button" onClick={() => setAdolescentes((v) => Math.min(maxAdolescentes, v + 1))} disabled={adolescentes >= maxAdolescentes} aria-label="+">+</button>
                </div>
              </div>
            )}
            {maxNinos > 0 && (
              <div className="noi-campo">
                <label className="noi-etiqueta">{tx("invitacion.rsvp.ninos").toUpperCase()}</label>
                <div className="noi-contador">
                  <button type="button" onClick={() => setNinos((v) => Math.max(0, v - 1))} disabled={ninos <= 0} aria-label="−">−</button>
                  <span>{ninos}</span>
                  <button type="button" onClick={() => setNinos((v) => Math.min(maxNinos, v + 1))} disabled={ninos >= maxNinos} aria-label="+">+</button>
                </div>
              </div>
            )}
            <div className="noi-campo">
              <label className="noi-etiqueta">{tx("invitacion.rsvp.restriccionAlimentaria").toUpperCase()}</label>
              <input
                value={dieta}
                onChange={(e) => setDieta(e.target.value)}
                placeholder="—"
                maxLength={120}
                className="noi-input"
              />
            </div>
          </>
        ) : (
          <div className="noi-filas">
            {lugares > 1 && adultos > 0 && <div className="noi-fila"><span>{tx("invitacion.rsvp.adultos")}</span><span>{adultos}</span></div>}
            {adolescentes > 0 && <div className="noi-fila"><span>{tx("invitacion.rsvp.adolescentes")}</span><span>{adolescentes}</span></div>}
            {ninos > 0 && <div className="noi-fila"><span>{tx("invitacion.rsvp.ninos")}</span><span>{ninos}</span></div>}
            <div className="noi-fila noi-fila--ultima">
              <span>{tx("invitacion.rsvp.restriccionAlimentaria")}</span>
              <span className="noi-fila-valor">{restricciones || dieta || "—"}</span>
            </div>
          </div>
        )}

        {hayPago && monto != null && !exento && (
          <div className="noi-precio">
            <span>{estadoDePago === "PAID" ? tx("invitacion.pago.abonado") : tx("invitacion.pago.valor")}</span>
            <div className="noi-precio-valor">
              <span className="noi-precio-total">{formatearMoneda(totalAPagar)}</span>
              {usarTotalDelServidor && vistaDePago
                ? vistaDePago.lines.map((l, i) => <span key={i} className="noi-precio-detalle">{l}</span>)
                : (
                  <>
                    {adultos > 0 && <span className="noi-precio-detalle">{adultos} × {formatearMoneda(precioAdulto)}</span>}
                    {adolescentes > 0 && <span className="noi-precio-detalle">{adolescentes} × {formatearMoneda(precioAdo)}</span>}
                    {ninos > 0 && <span className="noi-precio-detalle">{ninos} × {formatearMoneda(precioNin)}</span>}
                  </>
                )}
            </div>
          </div>
        )}

        <div ref={selloRef} className="noi-sello" aria-hidden="true">{tx("invitacion.pase.confirmado").toUpperCase()}</div>
        <div ref={petalosRef} className="noi-petalos" aria-hidden="true" />
      </div>

      {error && <p className="noi-error">{error}</p>}

      {!confirmadoYa ? (
        <>
          <button type="button" data-xin="1" data-delay="220" className="noi-btn-solido" disabled={enviando} onClick={() => enviar("CONFIRMA")}>
            {enviando ? tx("invitacion.rsvp.guardando").toUpperCase() : tx("invitacion.rsvp.confirmarAsistencia").toUpperCase()}
          </button>
          <button type="button" data-xin="1" data-delay="280" className="noi-btn-fantasma" disabled={enviando} onClick={() => enviar("NO_ASISTE")}>
            {tx("invitacion.rsvp.noVoyAPoderAsistir").toUpperCase()}
          </button>
        </>
      ) : (
        <button type="button" className="noi-btn-fantasma" onClick={() => setEstado("PENDING")}>
          {tx("invitacion.rsvp.modificarAsistencia").toUpperCase()}
        </button>
      )}
    </>
  );
}

interface CancionItem { id: string; title: string; artist: string; guestName: string }

/** Sugerir una canción, en una tarjeta de papel con la lista debajo. */
function CancionesNoir({ invitationId, guestToken, guestName }: { invitationId: string; guestToken?: string; guestName: string }) {
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
      <form onSubmit={enviar} data-xin="1" data-delay="140" data-dist="30" className="noi-tarjeta noi-tarjeta--der">
        <div className="noi-campo">
          <label className="noi-etiqueta">{tx("invitacion.musica.tema").toUpperCase()}</label>
          <input value={tema} onChange={(e) => setTema(e.target.value)} placeholder={tx("invitacion.musica.nombreDeLaCancion")} maxLength={100} className="noi-input noi-input--serif" />
        </div>
        <div className="noi-campo">
          <label className="noi-etiqueta">{tx("invitacion.musica.artista").toUpperCase()}</label>
          <input value={artista} onChange={(e) => setArtista(e.target.value)} placeholder={tx("invitacion.musica.artista")} maxLength={80} className="noi-input noi-input--serif" />
        </div>
        {error && <p className="noi-error">{error}</p>}
        <button type="submit" disabled={enviando} className="noi-btn-solido noi-btn-solido--tinta">
          {enviando ? tx("invitacion.musica.enviando").toUpperCase() : tx("invitacion.musica.sugeriUnaCancion").toUpperCase()}
        </button>
      </form>

      {canciones.length > 0 && (
        <div data-xin="1" data-delay="220" className="noi-lista">
          {canciones.slice(0, 8).map((c) => (
            <div key={c.id} className="noi-lista-fila">
              <div className="noi-lista-texto">
                <span className="noi-lista-tema">{c.title}</span>
                <span className="noi-lista-quien">{c.artist} · {tx("invitacion.musica.sumadoPor")} {c.guestName || tx("invitacion.evento.invitado")}</span>
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
function TriviaNoir({ preguntas, invitationId, guestToken, guestName }: { preguntas: QuizPregunta[]; invitationId: string; guestToken?: string; guestName: string }) {
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
      <div data-xin="1" data-delay="140" data-dist="30" className="noi-tarjeta noi-tarjeta--izq">
        <span className="noi-tarjeta-kicker">{tx("invitacion.quiz.kicker").toUpperCase()}</span>
        <span className="noi-tarjeta-titulo">
          {guardando ? tx("invitacion.rsvp.guardando") : tx("invitacion.quiz.respondisteCorrectamente", { aciertos: puntaje, total: preguntas.length })}
        </span>
        {!guardando && stats && stats.count > 0 && (
          <p className="noi-tarjeta-mensaje">{tx("invitacion.quiz.promedio", { n: stats.count, avg: stats.avg })}</p>
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
    <div data-xin="1" data-delay="140" data-dist="30" className="noi-tarjeta noi-tarjeta--izq">
      <span className="noi-tarjeta-kicker">{tx("invitacion.quiz.preguntaDeTotal", { n: indice + 1, total: preguntas.length }).toUpperCase()}</span>
      <span className="noi-tarjeta-pregunta">{q.pregunta}</span>
      <div className="noi-opciones">
        {q.opciones.map((op, oi) => {
          let clase = "";
          if (yaEligio && correcta !== undefined) {
            if (oi === correcta) clase = " noi-opcion--bien";
            else if (elegidas[indice] === oi) clase = " noi-opcion--mal";
          }
          return (
            <button key={oi} type="button" disabled={yaEligio} onClick={() => elegir(oi)} className={`noi-opcion${clase}`}>
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
// leen la Bienvenida y el Post-evento compartidos (esperan `noi-section` y
// `noi-kicker`).
const CSS_NOI = `
  /* ── Noir ─────────────────────────────────────────────────────────────
     Cine negro: Playfair Display 900 como cartel y su itálica 400 como
     contrapunto, Courier Prime para todo lo demás (el expediente). Negro,
     marfil, oro y rojo sangre. Foco que sigue al puntero, persiana, humo,
     grano, tira de película, claqueta y créditos finales. Todo CSS. */
  .noi-raiz { position: fixed; inset: 0; width: 100%; height: calc(var(--vh, 1vh) * 100); overflow: hidden;
    background: var(--pp-bg); color: var(--pp-ink); font-family: var(--noi-sans), 'Courier Prime', monospace;
    --noi-panel: #17171A; --noi-papel: #FFFDF8; --noi-linea: color-mix(in srgb, var(--pp-ink) 30%, transparent); }
  .noi-raiz a { color: inherit; text-decoration: none; }
  .noi-raiz button { font: inherit; }

  .noi-scroller { position: absolute; inset: 0; overflow-y: auto; overflow-x: hidden; opacity: 0;
    transition: opacity 900ms ease 260ms; scrollbar-width: none; }
  .noi-scroller::-webkit-scrollbar { width: 0; height: 0; }

  /* ── El pliego ─────────────────────────────────────────────────────── */
  .noi-section { position: relative; z-index: 1; min-height: calc(var(--vh, 1vh) * 100); box-sizing: border-box; overflow: hidden;
    display: flex; flex-direction: column; gap: 24px;
    padding: 60px max(20px, calc((100% - 1100px) / 2)) 80px; background: var(--pp-bg); color: var(--pp-ink); }
  .noi-section[data-tone="light"] { background: var(--pp-ink); color: var(--pp-bg); }

  /* El folio: Courier con tracking; oro sobre negro. */
  .noi-folio { position: relative; z-index: 1; display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;
    font-size: 11px; letter-spacing: .22em; text-transform: uppercase; }
  .noi-folio--oro { color: var(--pp-acc); }
  .noi-folio--acento { color: var(--noi-acento, var(--pp-acc)); }
  .noi-folio--suave { color: color-mix(in srgb, currentColor 60%, transparent); }
  .noi-folio--gris { color: #6E6A78; }
  .noi-folio--pie { align-items: center; margin-top: auto; }
  .noi-panel > .noi-folio--pie { color: inherit; opacity: .7; }
  .noi-folio--colofon { width: 100%; align-items: center; border-top: 1px solid var(--noi-linea); padding-top: 12px; font-size: 10px; }
  .noi-folio-etq { font-size: 10px; letter-spacing: .24em; text-transform: uppercase; color: var(--pp-acc); display: block; }
  .noi-oro { color: var(--pp-acc); }
  .noi-rojo { color: var(--pp-acc2); }
  .noi-italica { font-style: italic; font-weight: 400; }
  .noi-negrita { font-weight: 700; font-style: normal; }

  /* El spread: dos páginas; desde 1024 px se abren de verdad. */
  .noi-spread { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 22px; }
  .noi-spread--centro { align-items: center; }
  .noi-pagina { display: flex; flex-direction: column; gap: 14px; min-width: 0; }
  @media (min-width: 1024px) {
    .noi-spread { display: grid; grid-template-columns: 1fr 1fr; align-items: center; column-gap: 72px; }
    .noi-spread > * { max-width: 560px; width: 100%; min-width: 0; }
    .noi-spread > *:first-child { justify-self: end; }
    .noi-spread > *:last-child { justify-self: start; }
    .noi-pagina--entera { grid-column: 1 / -1; max-width: none; justify-self: stretch; }
  }

  /* ── Tipos ─────────────────────────────────────────────────────────── */
  .noi-h2, .noi-panel-titulo, .noi-fecha-linea, .noi-tapa-nombres, .noi-fin { font-family: var(--noi-serif), 'Playfair Display', serif; font-weight: 900; }
  .noi-h2, .noi-panel-titulo { position: relative; z-index: 1; margin: 0; line-height: .92; letter-spacing: -.02em; font-size: clamp(44px, 13vw, 110px); }
  .noi-h2--album { font-size: clamp(40px, 11vw, 90px); }
  .noi-panel-sub { font-size: 12px; letter-spacing: .24em; text-transform: uppercase; color: var(--noi-acento, var(--pp-acc)); }
  .noi-parrafo { margin: 0; font-size: 14px; line-height: 1.6; max-width: 42ch; }
  .noi-chip { display: inline-block; padding: 12px 18px; color: var(--pp-ink); background: var(--pp-bg); font-size: 12px; letter-spacing: .16em; text-transform: uppercase; }
  .noi-cta { margin-top: 6px; min-height: 48px; display: flex; align-items: center; justify-content: space-between; padding: 0 16px;
    color: var(--noi-fondo, var(--pp-bg)); background: currentColor; font-weight: 700; font-size: 12px; letter-spacing: .24em; text-transform: uppercase; }
  .noi-cta > * { color: var(--noi-fondo, var(--pp-bg)); }

  /* ── 01 Guardá la fecha: el cartel de cine ─────────────────────────── */
  .noi-estreno { font-size: 12px; letter-spacing: .3em; text-transform: uppercase; text-align: center; }
  .noi-fecha { display: flex; flex-direction: column; line-height: .9; text-align: center; }
  .noi-fecha-linea { font-size: clamp(40px, 12vw, 90px); }
  .noi-fecha-linea--dia { font-size: clamp(110px, 36vw, 260px); letter-spacing: -.04em; }
  .noi-fecha-linea--mes { font-style: italic; font-weight: 400; }
  .noi-fecha-linea--anio { color: var(--pp-acc2); }
  .noi-fecha-pie { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 10px;
    font-size: 12px; letter-spacing: .16em; text-transform: uppercase; border-top: 2px solid currentColor; border-bottom: 2px solid currentColor; padding: 10px 0; }
  .noi-std .noi-chip { color: var(--pp-ink); background: var(--pp-bg); }
  /* La foto: en blanco y negro, con la tira de película a los costados. */
  .noi-foto { position: relative; width: 100%; aspect-ratio: 4 / 5; box-sizing: border-box; overflow: visible; border: 14px solid var(--pp-bg); border-left-width: 26px; border-right-width: 26px;
    background: repeating-linear-gradient(135deg, #3A3A3E 0 8px, #2A2A2E 8px 16px); }
  .noi-foto-capa { position: absolute; inset: 0; overflow: hidden; filter: grayscale(1) contrast(1.05); }
  .noi-perforaciones { position: absolute; top: 0; bottom: 0; width: 26px; z-index: 2; opacity: .9;
    background: repeating-linear-gradient(180deg, transparent 0 10px, var(--pp-ink) 10px 22px, transparent 22px 32px); background-position: 6px 0; background-size: 14px 32px; background-repeat: repeat-y; }
  .noi-perforaciones--izq { left: -26px; }
  .noi-perforaciones--der { right: -26px; }
  .noi-foto-revelado { position: absolute; inset: 0; z-index: 1; pointer-events: none;
    background-image: radial-gradient(var(--pp-bg) calc(var(--noi-punto, 7.2) * 1px), transparent calc(var(--noi-punto, 7.2) * 1px + .6px));
    background-size: 10px 10px; }
  .noi-foto-etq { position: absolute; left: 12px; bottom: 10px; z-index: 2; font-size: 11px; letter-spacing: .2em; text-transform: uppercase; color: var(--pp-ink); }

  /* ── 02 Falta poco: la claqueta ────────────────────────────────────── */
  .noi-countdown { justify-content: space-between; padding-left: 0; padding-right: 0; }
  .noi-countdown > .noi-folio, .noi-countdown > .noi-spread { margin-left: max(20px, calc((100% - 1100px) / 2)); margin-right: max(20px, calc((100% - 1100px) / 2)); }
  .noi-claqueta { display: block; height: 26px; background: repeating-linear-gradient(-45deg, var(--pp-ink) 0 22px, var(--pp-bg) 22px 44px); }
  .noi-claqueta-caja { background: var(--noi-panel); border: 2px solid var(--pp-ink); padding: 16px 14px; display: flex; flex-direction: column; gap: 12px; }
  .noi-claqueta-fila { display: flex; justify-content: space-between; gap: 12px; font-size: 11px; letter-spacing: .2em; text-transform: uppercase; border-bottom: 1px solid var(--noi-linea); padding-bottom: 8px; }
  .noi-claqueta-fila--pie { border-bottom: 0; border-top: 1px solid var(--noi-linea); padding: 8px 0 0; }
  .noi-cuenta { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .noi-cuenta-caja { border: 1px solid var(--noi-linea); padding: 14px 12px 12px; display: flex; flex-direction: column-reverse; gap: 6px; }
  .noi-cuenta-etq { font-size: 10px; letter-spacing: .24em; text-transform: uppercase; color: var(--pp-acc); }
  .noi-cuenta-num { font-family: var(--noi-serif), 'Playfair Display', serif; font-weight: 900; font-size: clamp(52px, 17vw, 130px); line-height: .9; letter-spacing: -.03em; font-variant-numeric: tabular-nums; }
  .noi-tarjeta--hoy { display: flex; flex-direction: column; gap: 8px; text-align: center; padding: 12px 0; }
  .noi-tarjeta--hoy .noi-tarjeta-kicker { font-size: 10px; letter-spacing: .24em; text-transform: uppercase; color: var(--pp-acc); }
  .noi-tarjeta--hoy .noi-tarjeta-titulo { font-family: var(--noi-serif), 'Playfair Display', serif; font-weight: 900; font-size: clamp(36px, 10vw, 84px); line-height: .92; }
  .noi-marquesina { position: relative; z-index: 1; overflow: hidden; padding: 8px 0; white-space: nowrap; color: var(--pp-acc);
    font-size: 12px; letter-spacing: .22em; text-transform: uppercase; border-top: 1px solid var(--noi-linea); border-bottom: 1px solid var(--noi-linea); }
  .noi-marquesina-tira { display: flex; width: max-content; animation: noiCorre 16s linear infinite reverse; }
  .noi-marquesina-tira > span { padding-right: 36px; }
  @keyframes noiCorre { to { transform: translate3d(-50%, 0, 0); } }

  /* ── 03 Unas palabras: el intertítulo ──────────────────────────────── */
  .noi-frase-seccion { justify-content: space-between; gap: 30px; }
  .noi-vineta { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,.8) 100%); }
  .noi-intertitulo { border: 1px solid color-mix(in srgb, var(--pp-ink) 40%, transparent); padding: 30px 22px; width: 100%; max-width: 560px; box-sizing: border-box; text-align: center;
    box-shadow: inset 0 0 0 6px var(--pp-bg), inset 0 0 0 7px color-mix(in srgb, var(--pp-ink) 25%, transparent); }
  .noi-frase { margin: 0; font-family: var(--noi-serif), 'Playfair Display', serif; font-style: italic; font-weight: 400; font-size: clamp(26px, 7vw, 56px); line-height: 1.2; }
  .noi-frase-firma { font-size: 12px; letter-spacing: .2em; text-transform: uppercase; color: var(--pp-acc); }

  /* ── 04 Paneles: las escenas ───────────────────────────────────────── */
  .noi-pan { position: relative; z-index: 1; height: calc(100vh + var(--st-pasos, 2) * 90vh); }
  .noi-pan-fijo { position: sticky; top: 0; height: calc(var(--vh, 1vh) * 100); overflow: hidden; background: var(--pp-bg); }
  .noi-pan-fijo--album { background: #F7F5F0; }
  .noi-tira { position: absolute; top: 0; left: 0; height: 100%; display: flex; will-change: transform; }
  .noi-panel { flex: 0 0 100vw; min-width: 0; height: 100%; box-sizing: border-box; position: relative; overflow: hidden;
    display: flex; flex-direction: column; justify-content: space-between; gap: 18px;
    padding: 60px max(20px, calc((100vw - 1100px) / 2)) 92px; background: var(--pp-bg); color: var(--pp-ink); }
  .noi-panel--negro { --noi-acento: var(--pp-acc); --noi-fondo: var(--pp-bg); }
  .noi-panel--marfil { --noi-acento: var(--pp-acc2); --noi-fondo: var(--pp-ink); background: var(--pp-ink); color: var(--pp-bg); }
  .noi-panel--rojo { --noi-acento: var(--pp-ink); --noi-fondo: var(--pp-acc2); background: var(--pp-acc2); color: var(--pp-ink); }
  .noi-pan[data-scroll="vertical"] { height: auto; }
  .noi-pan[data-scroll="vertical"] .noi-pan-fijo { position: static; height: auto; overflow: visible; }
  .noi-pan[data-scroll="vertical"] .noi-tira { position: static; display: block; width: 100%; transform: none !important; }
  .noi-pan[data-scroll="vertical"] .noi-panel { height: auto; min-height: calc(var(--vh, 1vh) * 100); }
  .noi-ficha { border: 1px solid currentColor; padding: 14px 16px; display: flex; flex-direction: column; gap: 8px; }
  .noi-linea { display: flex; justify-content: space-between; gap: 14px; padding: 8px 0; border-bottom: 1px dotted currentColor; font-size: 14px; line-height: 1.4; }
  .noi-linea > span:first-child { font-size: 10px; letter-spacing: .2em; text-transform: uppercase; opacity: .7; flex: 0 0 auto; padding-top: 3px; }
  .noi-linea > span:last-child { text-align: right; font-weight: 700; }
  .noi-mapa { height: 190px; overflow: hidden; border: 1px solid currentColor; }
  .noi-puntos { position: absolute; left: 0; right: 40px; bottom: 30px; display: flex; gap: 8px; justify-content: center; z-index: 2; }
  .noi-punto { width: 24px; height: 2px; background: currentColor !important; opacity: .3; transition: opacity 300ms ease; display: inline-block; }
  .noi-punto[data-activo="1"] { opacity: 1; }

  /* ── 05 Check-in: el expediente ────────────────────────────────────── */
  .noi-cupon { position: relative; background: var(--noi-papel); color: var(--pp-bg); border: 1px solid var(--pp-bg); padding: 22px 20px;
    display: flex; flex-direction: column; gap: 14px; overflow: hidden; }
  .noi-cupon .noi-tarjeta { position: relative; display: flex; flex-direction: column; gap: 14px; background: transparent; border: 0; padding: 0; transform: none !important; }
  .noi-talon-top { display: flex; justify-content: space-between; align-items: center; gap: 10px; font-size: 11px; letter-spacing: .22em; text-transform: uppercase;
    border-bottom: 2px solid var(--pp-bg); padding-bottom: 12px; }
  .noi-talon-estado { border: 1px solid currentColor; padding: 3px 8px; transition: color 400ms ease; }
  .noi-campo { display: flex; flex-direction: column; gap: 6px; }
  .noi-etiqueta { font-size: 10px; letter-spacing: .22em; text-transform: uppercase; }
  .noi-input { min-height: 48px; border: 0; border-bottom: 1px solid var(--pp-bg); border-radius: 0; background: transparent; color: var(--pp-bg);
    font-family: var(--noi-sans), 'Courier Prime', monospace; font-size: 15px; padding: 0; outline: none; }
  .noi-contador { display: flex; align-items: center; border-bottom: 1px solid var(--pp-bg); min-height: 48px; }
  .noi-contador button { width: 44px; min-height: 44px; border: 0; background: transparent; color: var(--pp-bg); cursor: pointer; font-size: 22px; line-height: 1; }
  .noi-contador button:disabled { opacity: .35; cursor: default; }
  .noi-contador > span { flex: 1; text-align: center; font-family: var(--noi-serif), 'Playfair Display', serif; font-weight: 900; font-size: 26px; line-height: 1; }
  .noi-filas { display: flex; flex-direction: column; }
  .noi-fila { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px dotted var(--pp-bg); font-size: 14px; }
  .noi-fila--ultima { border-bottom: 0; }
  .noi-fila-valor { text-align: right; font-weight: 700; }
  .noi-precio { display: flex; justify-content: space-between; gap: 12px; font-size: 11px; letter-spacing: .14em; text-transform: uppercase; }
  .noi-precio-valor { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
  .noi-precio-total { font-family: var(--noi-serif), 'Playfair Display', serif; font-weight: 900; font-size: 22px; line-height: 1; letter-spacing: 0; }
  .noi-precio-detalle { font-size: 11px; letter-spacing: .1em; }
  .noi-btn-solido { min-height: 54px; border: 0; background: var(--pp-acc2); color: var(--pp-ink); cursor: pointer;
    font-weight: 700; font-size: 13px; letter-spacing: .3em; text-transform: uppercase; padding: 0 18px; transition: background 200ms ease; }
  @media (hover: hover) { .noi-btn-solido:hover { background: var(--pp-bg); } }
  .noi-btn-solido:disabled { opacity: .6; cursor: default; }
  .noi-btn-fantasma { min-height: 48px; border: 1px solid var(--pp-bg); background: transparent; color: var(--pp-bg); cursor: pointer;
    font-weight: 700; font-size: 12px; letter-spacing: .2em; text-transform: uppercase; padding: 0 18px; }
  .noi-error { margin: 0; font-size: 12px; letter-spacing: .06em; color: var(--pp-acc2); }
  /* El sello CONFIRMADO: rectángulo con doble filete rojo. */
  .noi-cupon .noi-sello { position: absolute; right: 12px; bottom: 78px; width: 150px; height: 70px; pointer-events: none;
    opacity: 0; transform: rotate(18deg) scale(1.9) translateY(-120px);
    border: 3px solid var(--pp-acc2); color: var(--pp-acc2); box-shadow: inset 0 0 0 3px var(--noi-papel), inset 0 0 0 4px var(--pp-acc2);
    display: flex; align-items: center; justify-content: center; box-sizing: border-box;
    font-weight: 700; font-size: 14px; letter-spacing: .2em; text-transform: uppercase; }
  .noi-petalos { display: none; }

  /* ── 06 Álbum: la tira de fotogramas ───────────────────────────────── */
  .noi-panel--album { background: #F7F5F0; color: #0B0B0D; justify-content: flex-start; gap: 14px; }
  .noi-panel--album-b { background: #EFEBE3; }
  .noi-fotogramas { flex: 1; min-height: 0; display: grid; grid-template-columns: repeat(6, 1fr); grid-template-rows: repeat(3, 1fr); gap: 8px; max-width: 900px;
    background: #0B0B0D; padding: 8px; border-top: 12px dotted #F7F5F0; border-bottom: 12px dotted #F7F5F0; box-sizing: border-box; }
  .noi-panel--album-b .noi-fotogramas { border-color: #EFEBE3; }
  .noi-fotograma { position: relative; overflow: hidden; min-height: 0; cursor: pointer; background: repeating-linear-gradient(135deg, #8A8680 0 8px, #9E9A93 8px 16px); }
  .noi-fotograma-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; filter: grayscale(1); }
  .noi-bano { position: absolute; inset: 0; mix-blend-mode: multiply; opacity: 0; transition: opacity 200ms linear; }
  .noi-bano--1 { background: color-mix(in srgb, var(--pp-acc) 50%, transparent); }
  .noi-bano--2 { background: color-mix(in srgb, var(--pp-acc2) 50%, transparent); }
  .noi-fotograma-n { position: absolute; left: 8px; bottom: 6px; z-index: 1; font-size: 10px; letter-spacing: .14em; color: #F2EEE6; }
  .noi-fotogramas[data-cantidad="5"] .noi-fotograma:nth-child(1) { grid-column: 1 / 4; grid-row: 1 / 3; }
  .noi-fotogramas[data-cantidad="5"] .noi-fotograma:nth-child(2) { grid-column: 4 / 7; grid-row: 1 / 2; }
  .noi-fotogramas[data-cantidad="5"] .noi-fotograma:nth-child(3) { grid-column: 4 / 6; grid-row: 2 / 3; }
  .noi-fotogramas[data-cantidad="5"] .noi-fotograma:nth-child(4) { grid-column: 6 / 7; grid-row: 2 / 3; }
  .noi-fotogramas[data-cantidad="5"] .noi-fotograma:nth-child(5) { grid-column: 1 / 7; grid-row: 3 / 4; }
  .noi-fotogramas[data-cantidad="4"] .noi-fotograma:nth-child(1) { grid-column: 1 / 4; grid-row: 1 / 3; }
  .noi-fotogramas[data-cantidad="4"] .noi-fotograma:nth-child(2) { grid-column: 4 / 7; grid-row: 1 / 2; }
  .noi-fotogramas[data-cantidad="4"] .noi-fotograma:nth-child(3) { grid-column: 4 / 7; grid-row: 2 / 3; }
  .noi-fotogramas[data-cantidad="4"] .noi-fotograma:nth-child(4) { grid-column: 1 / 7; grid-row: 3 / 4; }
  .noi-fotogramas[data-cantidad="3"] .noi-fotograma:nth-child(1) { grid-column: 1 / 4; grid-row: 1 / 4; }
  .noi-fotogramas[data-cantidad="3"] .noi-fotograma:nth-child(2) { grid-column: 4 / 7; grid-row: 1 / 3; }
  .noi-fotogramas[data-cantidad="3"] .noi-fotograma:nth-child(3) { grid-column: 4 / 7; grid-row: 3 / 4; }
  .noi-fotogramas[data-cantidad="2"] .noi-fotograma:nth-child(1) { grid-column: 1 / 4; grid-row: 1 / 4; }
  .noi-fotogramas[data-cantidad="2"] .noi-fotograma:nth-child(2) { grid-column: 4 / 7; grid-row: 1 / 4; }
  .noi-fotogramas[data-cantidad="1"] .noi-fotograma:nth-child(1) { grid-column: 1 / 7; grid-row: 1 / 4; }

  /* ── 07 Música: la banda sonora ────────────────────────────────────── */
  .noi-carretes { display: flex; align-items: center; gap: 16px; }
  .noi-carrete { position: relative; width: 48px; height: 48px; border-radius: 50%; border: 2px solid currentColor; box-sizing: border-box; animation: noiGira 4s linear infinite; }
  .noi-carrete--oro { color: var(--pp-acc); }
  .noi-carrete i { position: absolute; background: currentColor; }
  .noi-carrete i:nth-child(1) { left: 50%; top: 4px; width: 2px; height: 16px; margin-left: -1px; }
  .noi-carrete i:nth-child(2) { left: 50%; bottom: 4px; width: 2px; height: 16px; margin-left: -1px; }
  .noi-carrete i:nth-child(3) { top: 50%; left: 4px; height: 2px; width: 16px; margin-top: -1px; }
  .noi-carrete i:nth-child(4) { top: 50%; right: 4px; height: 2px; width: 16px; margin-top: -1px; }
  .noi-carrete-cinta { flex: 1; height: 1px; background: color-mix(in srgb, var(--pp-ink) 40%, transparent); }
  @keyframes noiGira { to { transform: rotate(360deg); } }
  .noi-musica form.noi-tarjeta { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; transform: none !important; }
  .noi-musica .noi-etiqueta { display: none; }
  .noi-musica .noi-input { min-height: 48px; border: 1px solid var(--pp-ink); background: transparent; color: var(--pp-ink); padding: 0 14px; min-width: 0; }
  .noi-musica .noi-error { grid-column: 1 / -1; }
  .noi-musica .noi-btn-solido { grid-column: 1 / -1; min-height: 50px; border: 1px solid var(--pp-acc); background: var(--pp-acc); color: var(--pp-bg); font-size: 12px; }
  @media (hover: hover) { .noi-musica .noi-btn-solido:hover { background: var(--pp-ink); border-color: var(--pp-ink); } }
  .noi-lista { display: flex; flex-direction: column; margin-top: 12px; counter-reset: tema; }
  .noi-lista-fila { display: flex; align-items: baseline; gap: 12px; padding: 12px 0; border-bottom: 1px dotted color-mix(in srgb, var(--pp-ink) 40%, transparent); counter-increment: tema; }
  .noi-lista-fila::before { content: counter(tema, decimal-leading-zero); font-size: 11px; color: var(--pp-acc); flex: 0 0 auto; }
  .noi-lista-texto { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .noi-lista-tema { font-family: var(--noi-serif), 'Playfair Display', serif; font-weight: 700; font-size: 19px; line-height: 1.1; }
  .noi-lista-quien { font-size: 11px; letter-spacing: .14em; text-transform: uppercase; opacity: .7; }

  /* ── 08 Regalos ────────────────────────────────────────────────────── */
  .noi-tarjeta--banco { position: relative; z-index: 1; background: var(--noi-papel); color: var(--pp-bg); border: 1px solid var(--pp-bg); padding: 16px 18px;
    display: flex; flex-direction: column; gap: 10px; transform: none !important; }
  .noi-tarjeta--banco + .noi-tarjeta--banco { margin-top: 14px; }
  .noi-tarjeta-kicker { font-size: 10px; letter-spacing: .22em; text-transform: uppercase; }
  .noi-tarjeta-mensaje { margin: 0; font-size: 14px; line-height: 1.6; opacity: .85; }
  .noi-fila-texto { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .noi-fila-etq { font-size: 10px; letter-spacing: .22em; text-transform: uppercase; opacity: .7; }
  .noi-fila-dato { font-size: 14px; overflow-wrap: anywhere; }
  .noi-fila--copiable:first-child { border-bottom: 1px dotted var(--pp-bg); }
  .noi-fila--copiable:first-child .noi-fila-dato { font-family: var(--noi-serif), 'Playfair Display', serif; font-weight: 700; font-size: 20px; line-height: 1.1; }
  .noi-tarjeta--banco .noi-fila--ultima { border-bottom: 0; font-size: 11px; letter-spacing: .14em; text-transform: uppercase; opacity: .7; }
  .noi-btn-copiar { flex: 0 0 auto; min-height: 44px; padding: 0 14px; border: 1px solid var(--pp-bg); background: transparent; color: var(--pp-bg); cursor: pointer;
    font-weight: 700; font-size: 11px; letter-spacing: .2em; text-transform: uppercase; transition: background 200ms ease, color 200ms ease; }
  @media (hover: hover) { .noi-btn-copiar:hover { background: var(--pp-bg); color: var(--pp-ink); } }
  .noi-btn-copiar--hecho { background: var(--pp-bg); color: var(--pp-ink); }

  /* ── 09 Trivia: el interrogatorio ──────────────────────────────────── */
  .noi-quiz { background: var(--pp-acc2) !important; color: var(--pp-ink); }
  .noi-quiz .noi-tarjeta { display: flex; flex-direction: column; gap: 12px; transform: none !important; }
  .noi-quiz .noi-tarjeta-kicker { align-self: flex-start; border: 1px solid var(--pp-ink); font-size: 11px; letter-spacing: .22em; text-transform: uppercase; padding: 8px 14px; }
  .noi-quiz .noi-tarjeta-pregunta, .noi-quiz .noi-tarjeta-titulo { font-family: var(--noi-serif), 'Playfair Display', serif; font-style: italic; font-weight: 400; font-size: clamp(34px, 9.5vw, 80px); line-height: 1; max-width: 16ch; }
  .noi-quiz .noi-tarjeta-mensaje { margin: 0; font-size: 14px; line-height: 1.6; }
  .noi-opciones { display: flex; flex-direction: column; gap: 10px; counter-reset: opcion; }
  .noi-opcion { min-height: 54px; border: 1px solid var(--pp-ink); background: transparent; color: var(--pp-ink); cursor: pointer; counter-increment: opcion;
    font-family: var(--noi-sans), 'Courier Prime', monospace; font-weight: 700; font-size: 15px; text-align: left; padding: 0 18px;
    display: flex; justify-content: space-between; align-items: center; gap: 12px; transition: background 200ms ease, color 200ms ease; }
  .noi-opcion::after { content: counter(opcion, upper-alpha); font-size: 11px; letter-spacing: .2em; text-transform: uppercase; }
  .noi-opcion--bien { background: var(--pp-ink); color: var(--pp-acc2); }
  .noi-opcion--bien::after { content: "Culpable"; }
  .noi-opcion--mal { background: var(--pp-bg); color: var(--pp-ink); }
  .noi-opcion--mal::after { content: "Coartada"; }
  @media (min-width: 1024px) {
    .noi-quiz .noi-spread > .noi-tarjeta { grid-column: 1 / -1; max-width: none; justify-self: stretch; display: grid; grid-template-columns: 1fr 1fr; column-gap: 72px; align-items: center; }
    .noi-quiz .noi-tarjeta-kicker { grid-column: 1; justify-self: end; margin-right: auto; }
    .noi-quiz .noi-tarjeta-pregunta { grid-column: 1; max-width: 560px; justify-self: end; width: 100%; }
    .noi-quiz .noi-opciones { grid-column: 2; grid-row: 1 / span 2; max-width: 560px; width: 100%; }
  }

  /* ── 10 Tu pase: los créditos finales ──────────────────────────────── */
  .noi-pase { justify-content: space-between; padding-bottom: calc(28px + env(safe-area-inset-bottom)); }
  .noi-pagina--qr { align-items: flex-start; }
  .noi-qr { position: relative; width: min(100%, 300px); aspect-ratio: 1; background: var(--pp-ink); padding: 16px; box-sizing: border-box;
    border: 1px solid var(--pp-acc); box-shadow: 0 0 0 8px var(--pp-bg), 0 0 0 9px var(--pp-acc); margin-bottom: 30px; }
  .noi-qr .qr-ingreso, .noi-qr section { background: transparent !important; border: none !important; padding: 0 !important; }
  .noi-qr img, .noi-qr svg, .noi-qr canvas { width: 100% !important; height: auto !important; display: block; }
  .noi-qr-etq { position: absolute; left: 0; right: 0; bottom: -28px; text-align: center; font-size: 10px; letter-spacing: .22em; text-transform: uppercase; color: var(--pp-acc); }
  .noi-pase-cabeza { display: flex; align-items: flex-end; justify-content: space-between; gap: 14px; }
  .noi-pase-numero, .noi-pase-mesa { display: flex; flex-direction: column; }
  .noi-pase-mesa { align-items: flex-end; text-align: right; }
  .noi-pase-numero > span:last-child { font-family: var(--noi-serif), 'Playfair Display', serif; font-weight: 900; font-size: clamp(64px, 20vw, 150px); line-height: .9; letter-spacing: -.03em; }
  .noi-pase-mesa > span:last-child { font-family: var(--noi-serif), 'Playfair Display', serif; font-style: italic; font-weight: 400; font-size: clamp(40px, 12vw, 90px); line-height: .9; color: var(--pp-acc); }
  .noi-lineas-pase { display: flex; flex-direction: column; border-top: 1px solid var(--pp-acc); }
  .noi-lineas-pase .noi-linea { border-bottom: 1px dotted color-mix(in srgb, var(--pp-ink) 40%, transparent); font-size: 13px; padding: 10px 0; }
  .noi-lineas-pase .noi-linea:last-child { border-bottom: 0; }
  .noi-lineas-pase .noi-linea > span:first-child { color: var(--pp-acc); opacity: 1; }
  .noi-lineas-pase .noi-linea > span:last-child { font-weight: 400; line-height: 1.45; }
  .noi-info-extra { margin-top: 4px; }
  .noi-info-extra #info-adicional { background: transparent !important; padding: 0 !important; }
  .noi-info-extra #ia-trigger-btn { background: transparent !important; color: var(--pp-acc) !important; border: 1px solid var(--pp-acc) !important;
    border-radius: 0 !important; font-family: var(--noi-sans), 'Courier Prime', monospace !important; letter-spacing: .22em !important; text-transform: uppercase; }
  .noi-raiz .ia-icon-box, .noi-raiz svg.lucide { display: none !important; }
  .noi-pase-pie { display: flex; flex-direction: column; gap: 14px; align-items: center; text-align: center; }
  .noi-fin { font-size: clamp(56px, 16vw, 120px); line-height: .9; letter-spacing: .1em; }
  .noi-fin-sub { font-family: var(--noi-serif), 'Playfair Display', serif; font-style: italic; font-size: clamp(16px, 4.4vw, 22px); }
  .noi-replay { cursor: pointer; color: var(--pp-ink); }
  .noi-credito { display: inline-flex; opacity: .8; }

  /* ── La tapa: foco, persiana y humo ────────────────────────────────── */
  .noi-portada { position: absolute; inset: 0; z-index: 5; overflow: hidden; background: var(--pp-bg); color: var(--pp-ink); }
  .noi-portada-hoja { position: absolute; inset: 0; display: grid; grid-template-rows: auto minmax(0, 1fr) auto; box-sizing: border-box;
    padding: calc(18px + env(safe-area-inset-top)) max(20px, calc((100% - 1100px) / 2)) calc(18px + env(safe-area-inset-bottom)); }
  .noi-escenario { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
  /* El foco: un gradiente radial enorme que el motor corre con el puntero. */
  .noi-foco { position: absolute; left: 50%; top: 40%; width: 140vmax; height: 140vmax; margin: -70vmax 0 0 -70vmax;
    background: radial-gradient(circle at center, color-mix(in srgb, var(--pp-ink) 16%, transparent) 0, color-mix(in srgb, var(--pp-ink) 6%, transparent) 18%, transparent 34%); }
  .noi-persiana { position: absolute; left: -10%; right: -10%; top: 0; bottom: 0;
    background: repeating-linear-gradient(174deg, transparent 0 46px, color-mix(in srgb, var(--pp-ink) 5%, transparent) 46px 58px);
    -webkit-mask-image: linear-gradient(90deg, transparent, #000 40%, #000 60%, transparent); mask-image: linear-gradient(90deg, transparent, #000 40%, #000 60%, transparent); }
  .noi-humo { position: absolute; bottom: 22%; width: 60px; height: 60px; border-radius: 50%; opacity: 0;
    background: radial-gradient(circle, color-mix(in srgb, var(--pp-ink) 50%, transparent), transparent 70%); animation: noiHumo 6s ease-out infinite; }
  @keyframes noiHumo { 0% { transform: translate3d(0, 0, 0) scale(1); opacity: 0; } 20% { opacity: .35; } 100% { transform: translate3d(30px, -180px, 0) scale(2.2); opacity: 0; } }
  .noi-grano { position: absolute; inset: -4%; opacity: .12; animation: noiGrano .4s steps(1) infinite;
    background-image: radial-gradient(var(--pp-ink) .6px, transparent .7px), radial-gradient(var(--pp-ink) .5px, transparent .6px); background-size: 6px 6px, 6px 6px; background-position: 1px 2px, 4px 5px; }
  @keyframes noiGrano { 0% { transform: translate(0, 0); } 25% { transform: translate(-2%, 1%); } 50% { transform: translate(1%, -2%); } 75% { transform: translate(-1%, -1%); } 100% { transform: translate(2%, 1%); } }
  .noi-folio--tapa { z-index: 1; }
  .noi-tapa-centro { position: relative; z-index: 1; align-self: center; display: flex; flex-direction: column; align-items: center; gap: 12px; min-height: 0; text-align: center;
    animation: noiParpadeo 9s linear infinite; }
  @keyframes noiParpadeo { 0%, 100% { opacity: 1; } 92% { opacity: 1; } 93% { opacity: .82; } 94% { opacity: 1; } 97% { opacity: .9; } 98% { opacity: 1; } }
  .noi-tapa-kicker { font-size: 12px; letter-spacing: .3em; text-transform: uppercase; color: var(--pp-acc); }
  /* El nombre: Playfair 900 centrado; el renglón más largo manda el cuerpo. */
  .noi-tapa-nombres { margin: 0; line-height: .92; letter-spacing: -.02em; display: flex; flex-direction: column; align-items: center;
    font-size: min(clamp(56px, 18vw, 170px), 13vh, calc((100vw - 60px) / (var(--largo, 9) * 0.62))); }
  @media (min-width: 1024px) { .noi-tapa-nombres { font-size: min(11vw, 180px, 13vh, calc((min(100vw, 1100px) - 60px) / (var(--largo, 9) * 0.62))); } }
  .noi-tapa-linea { overflow: hidden; display: block; white-space: nowrap; }
  .noi-tapa-linea > span { display: block; }
  .noi-tapa-linea--y { font-size: .3em; line-height: 1.2; }
  .noi-tapa-linea--y > span { font-weight: 400; font-style: italic; color: var(--pp-acc); }
  .noi-letra { display: inline-block; animation: noiTecla calc(var(--n, 12) * 4s) steps(1) infinite; animation-delay: calc(var(--i, 0) * -4s); }
  @keyframes noiTecla { 0%, 99.4% { transform: none; opacity: 1; } 99.5%, 99.9% { transform: translateY(-4px); opacity: .6; } 100% { transform: none; opacity: 1; } }
  .noi-tapa-pelicula { font-family: var(--noi-serif), 'Playfair Display', serif; font-style: italic; font-weight: 400; font-size: clamp(18px, 5vw, 28px); }
  .noi-tapa-datos { display: flex; justify-content: space-between; align-items: flex-end; gap: 14px; width: 100%; max-width: 520px; box-sizing: border-box;
    font-size: 12px; line-height: 1.5; text-align: left; border-top: 1px solid var(--noi-linea); padding-top: 10px; letter-spacing: .04em; text-transform: uppercase; }
  .noi-tapa-datos-der { text-align: right; }
  .noi-tapa-pie { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 12px; align-items: center; text-align: center; }
  .noi-tapa-mensaje { margin: 0; font-size: clamp(13px, 3.6vw, 16px); line-height: 1.5; max-width: 40ch; }
  .noi-tapa-btn { min-height: 54px; width: 100%; max-width: 360px; border: 1px solid var(--pp-acc); background: transparent; color: var(--pp-acc); cursor: pointer;
    font-weight: 700; font-size: 13px; letter-spacing: .3em; text-transform: uppercase; padding: 0 22px;
    display: flex; align-items: center; justify-content: center; gap: 12px; transition: background 200ms ease, color 200ms ease; }
  @media (hover: hover) { .noi-tapa-btn:hover { background: var(--pp-acc); color: var(--pp-bg); } }
  .noi-cursor { animation: noiCursor 1s steps(1) infinite; }
  @keyframes noiCursor { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }

  /* ── Riel, pista y lupa ────────────────────────────────────────────── */
  .noi-riel { position: absolute; right: 0; top: 0; bottom: 0; width: 40px; z-index: 4; display: flex; flex-direction: column;
    align-items: center; justify-content: space-between; padding: calc(16px + env(safe-area-inset-top)) 0 calc(16px + env(safe-area-inset-bottom));
    opacity: 0; transition: opacity 600ms ease; pointer-events: none; color: var(--pp-acc); border-left: 1px solid var(--pp-acc) !important; }
  .noi-riel-top { writing-mode: vertical-rl; font-size: 11px; letter-spacing: .2em; color: var(--pp-acc) !important; }
  .noi-riel-etiqueta { writing-mode: vertical-rl; font-size: 10px; letter-spacing: .28em; text-transform: uppercase; color: var(--pp-acc); }
  .noi-riel-linea { flex: 1; width: 1px; margin: 16px 0; background: transparent !important; position: relative; }
  .noi-riel-barra { position: absolute; left: -1px; top: 0; width: 2px; height: 0%; background: var(--pp-acc); transition: height 200ms linear; display: block; }
  .noi-pista { position: absolute; left: 0; right: 40px; bottom: calc(18px + env(safe-area-inset-bottom)); z-index: 6; text-align: center;
    font-size: 11px; letter-spacing: .28em; color: var(--pp-acc);
    opacity: 0; transition: opacity 600ms ease; pointer-events: none; animation: noiPista 2.4s ease-in-out infinite; }
  @keyframes noiPista { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(6px); } }

  .noi-lupa { position: fixed; inset: 0; z-index: 200; background: rgba(11,11,13,.94);
    display: flex; align-items: center; justify-content: center; padding: 24px; cursor: zoom-out; }
  .noi-lupa-cerrar { position: absolute; top: 20px; right: 20px; width: 40px; height: 40px; border: 1px solid var(--pp-acc);
    background: transparent; color: var(--pp-acc); font-size: 18px; line-height: 1; cursor: pointer; }
  .noi-lupa-img { max-width: 100%; max-height: 88vh; object-fit: contain; cursor: default; border: 14px solid var(--pp-bg); box-shadow: 0 0 0 1px var(--pp-acc); }

  @media (prefers-reduced-motion: reduce) {
    .noi-raiz * { animation: none !important; }
    .noi-scroller [data-xin] { opacity: 1 !important; transform: none !important; }
    .noi-foto { --noi-punto: 0; }
    .noi-humo, .noi-grano { display: none; }
  }
`;
