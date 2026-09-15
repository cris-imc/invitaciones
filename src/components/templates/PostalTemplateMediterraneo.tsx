"use client";

// GENERADO por scripts/gen-iconic-variants.js a partir de
// PostalTemplate.tsx — no editar a mano: los cambios se pierden al regenerar.

/**
 * POSTAL · Colección Iconic — sub-colección "Tipográfica Editorial"
 * Variante: Mediterráneo.
 *
 * GENERADO por scripts/derivar-tipografica.js a partir de
 * EditorialBlancNoirTemplate.tsx — no editar a mano: el motor se arregla en
 * Editorial Blanc & Noir; el render en scripts/jsx/tipografica/pos.jsx, los
 * estilos en scripts/css/tipografica/pos.css y las caras y la paleta en
 * scripts/familias/tipografica/pos.json.
 *
 * Correo aéreo: Alfa Slab One como sello postal, Work Sans para el texto y
 * JetBrains Mono para folios y sellos. Borde de franjas, mapa con curvas de
 * nivel, un avioncito que recorre la ruta, matasellos con la tinta gastada,
 * sello de visa, panel split-flap, etiquetas de valija, boarding pass y
 * postales que giran y muestran el dorso.
 *
 * Sin imágenes propias: son fuentes y CSS.
 */

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Alfa_Slab_One, Work_Sans, JetBrains_Mono } from "next/font/google";
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

const posSerif = Alfa_Slab_One({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  variable: "--pos-serif",
});
const posSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--pos-sans",
});
// El mono es la ficha técnica de la revista: folios, kickers y datos.
const posMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--pos-mono",
});

// ─── Paleta ─────────────────────────────────────────────────────────────────
// Las cinco variantes de "Capas de papel" cambian SOLO estos once colores
// (el script de variantes reemplaza este bloque entero, ver
// scripts/gen-capas-de-papel-variants.js). El dibujo es el mismo: los SVG de
// las escenas leen var(--pp-…), así que un cambio acá repinta cerros, cielo,
// sol y figuras de una sola vez.
const PALETA = {
  bg: "#F2EFE6",
  bg2: "#F2EFE6",
  ink: "#123456",
  ink2: "#123456",
  acc: "#E76F51",
  acc2: "#2A9D8F",
  sky1: "#F2EFE6",
  sky2: "#F2EFE6",
  hill1: "#F2EFE6",
  hill2: "#123456",
  hill3: "#123456",
  night: "#123456",
  nightInk: "#F2EFE6",
  acc3: "#E9C46A",
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

interface PostalTemplateProps {
  invitation: Record<string, unknown>;
  guest?: GuestRecord | null;
  isPersonalized?: boolean;
}

/** El número de pase, con tres cifras como en el mockup ("PASE Nº 042"). */
function numeroDePase(orderNumber: number | undefined): string {
  return String(orderNumber ?? 42).padStart(3, "0");
}

export function PostalTemplateMediterraneo({ invitation, guest, isPersonalized = false }: PostalTemplateProps) {
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
    const matasellos = escena ? escena.querySelector<HTMLElement>("[data-matasellos]") : null;
    if (matasellos) {
      matasellos.style.animation = "none";
      void matasellos.offsetWidth;
      matasellos.style.animation = "";
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
      el.style.setProperty("--pos-y", `${dist}px`);
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
            el.style.setProperty("--pos-y", "0px");
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
            ven.style.setProperty("--pos-punto", (7.2 * (1 - t)).toFixed(2));
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
          clase: `${posSerif.variable} ${posSans.variable}`,
          fuente: "var(--pos-sans), 'Work Sans', sans-serif",
        }}
      />
    );
  }


  // El total de pliegos, para los folios ("03 / 10"). Se cuenta lo que esta
  // invitación realmente tiene: si no hay trivia, no existe el pliego 09 y el
  // pase deja de ser 10 de 10.
  const totalPliegos = cuenta;
  const folio = (n: string) => `${n} / ${String(totalPliegos).padStart(2, "0")}`;

  // El nombre en Alfa Slab, centrado, con el "&" como una estampilla. El
  // renglón más largo manda el cuerpo.
  const renglones = saludaAlInvitado ? [nombreInvitado] : [nombre1, ...(nombre2 ? [nombre2] : [])];
  const renglonMasLargo = Math.max(5, ...renglones.map((n) => n.length));

  // La frase: el medio en el acento y el cierre en el verde azulado.
  const tonoDePalabra = (i: number) => {
    const n = palabras.length;
    if (i >= Math.ceil(n * 0.7)) return "pos-teal";
    if (i >= Math.floor(n * 0.25) && i < desdeAcento) return "pos-acento";
    return undefined;
  };

  const kickerDelEvento = tx(invitation.tipo === "CASAMIENTO" ? "invitacion.evento.nosCasamos" : invitation.tipo === "QUINCE_ANOS" ? "invitacion.evento.misQuinceAnos" : "invitacion.evento.teInvitamos");
  const mesCorto = mesLargo.slice(0, 3).toUpperCase();
  const inicialesCortas = iniciales(nombre1, nombre2).replace(" & ", "+");
  const codigoDelPase = `ALT ${pase} · ${anio} · ${(ciudad || lugarNombre || "").slice(0, 3).toUpperCase()}`;

  return (
    <div
      ref={raizRef}
      className={`${posSerif.variable} ${posSans.variable} ${posMono.variable} pos-raiz`}
      style={varsDePaleta}
    >
      <style>{CSS_POS}</style>
      <style>{COVER_RESPONSIVE_STYLE}</style>

      <div ref={scrollerRef} className="pos-scroller">
        {/* ── 01 Guardá la fecha ─────────────────────────────────────────
            El pasaporte: sobre tinta, el sello de visa con la fecha adentro
            y la foto con marco de papel y el "VISA 2027" arriba. */}
        <section data-tone="dark" data-screen-label={tx("invitacion.saveTheDate.guardaLaFecha")} className="pos-section pos-std">
          <div className="pos-folio pos-folio--ambar">
            <span data-xin="1" data-dist="-40">{nSaveTheDate} — {tx("invitacion.saveTheDate.guardaLaFecha").toUpperCase()}</span>
            <span data-xin="1" data-dist="40">{folio(nSaveTheDate)}</span>
          </div>
          <div className="pos-spread">
            <div className="pos-pagina">
              <div data-xin="1" data-dist="0" className="pos-visa">
                <SelloVisa arco={`${tx("invitacion.saveTheDate.entrada").toUpperCase()} · ${[lugarNombre, ciudad].filter(Boolean).join(" · ").toUpperCase()} · `} dia={diaNum} mes={mesLargo.toUpperCase()} anio={anio} admitido={tx("invitacion.saveTheDate.admitido").toUpperCase()} />
              </div>
              <div data-xin="1" data-delay="360" className="pos-fecha-pie">
                <span>{diaSemana} · {hora} H</span>
                <AddToCalendarLink
                  eventName={titulo}
                  targetDate={fechaHora}
                  location={[lugarNombre, direccion].filter(Boolean).join(", ")}
                  className="pos-chip pos-chip--ambar"
                  showIcon={false}
                >
                  {tx("invitacion.saveTheDate.agregarAlCalendario").toUpperCase()} ✈
                </AddToCalendarLink>
              </div>
            </div>

            {hayFoto && (
              <div ref={ventanaRef} data-xin="1" data-delay="200" data-dist="0" className="pos-foto">
                {fotoMobile && (
                  <div className="acp-mobile-only pos-foto-capa">
                    <AnimatedCoverPhoto photoSrc={fotoMobile} tint={false} effect="enfoque" scrimColorRgb="30,58,95" />
                  </div>
                )}
                {fotoDesktop && (
                  <div className="acp-desktop-only pos-foto-capa">
                    <AnimatedCoverPhoto photoSrc={fotoDesktop} tint={false} effect="enfoque" scrimColorRgb="30,58,95" />
                  </div>
                )}
                {/* La trama que tapa la foto y se disuelve al subir: el radio
                    del punto lo mueve el motor en --pos-punto. */}
                <span className="pos-foto-revelado" aria-hidden="true" />
                <span className="pos-foto-visa" aria-hidden="true">VISA<br />{anio}</span>
                <span className="pos-foto-etq">{tx("invitacion.album.nuestraFoto").toUpperCase()}</span>
              </div>
            )}
          </div>
        </section>

        {/* ── 02 Falta poco ──────────────────────────────────────────────
            El panel de salidas: fichas split-flap en mono, con la línea
            partida al medio, entre dos marquesinas. */}
        <section data-tone="dark" data-screen-label={tx("invitacion.cuentaRegresiva.kicker")} className="pos-section pos-countdown">
          <div className="pos-folio">
            <span data-xin="1" data-dist="-40">{nCountdown} — {tx("invitacion.cuentaRegresiva.faltan").toUpperCase()}</span>
            <span data-xin="1" data-dist="40">{folio(nCountdown)}</span>
          </div>
          <div className="pos-marquesina pos-marquesina--acento" aria-hidden="true">
            <div className="pos-marquesina-tira">
              {[0, 1].map((i) => (
                <span key={i}>
                  {tx("invitacion.saveTheDate.embarque").toUpperCase()} · {tx("invitacion.cuentaRegresiva.dias").toUpperCase()} · {tx("invitacion.cuentaRegresiva.horas").toUpperCase()} · {tx("invitacion.cuentaRegresiva.minutos").toUpperCase()} · {tx("invitacion.cuentaRegresiva.segundos").toUpperCase()} · {diaNum} {tx("invitacion.evento.de").toUpperCase()} {mesLargo.toUpperCase()} ·&nbsp;
                </span>
              ))}
            </div>
          </div>
          <div className="pos-spread">
            <div className="pos-pagina pos-pagina--entera">
              <CuentaPostal targetDate={fechaHora} />
            </div>
          </div>
          <div className="pos-marquesina pos-marquesina--filete pos-marquesina--contraria" aria-hidden="true">
            <div className="pos-marquesina-tira">
              {[0, 1].map((i) => (
                <span key={i}>
                  {[lugarNombre, ciudad, `${hora} h`, dressCode].filter(Boolean).join(" · ").toUpperCase()} ·&nbsp;
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── 03 Unas palabras ───────────────────────────────────────────
            El dorso de la postal: papel rayado, la frase en Alfa Slab y la
            nota con el avioncito que flota. */}
        {hayFrase && (
          <section data-tone="light" data-screen-label={tx("invitacion.frase.etiqueta")} className="pos-section pos-frase-seccion">
            <span className="pos-rayado" aria-hidden="true" />
            <div className="pos-folio pos-folio--acento">
              <span data-xin="1" data-dist="-40">{nFrase} — {tx("invitacion.frase.unasPalabras").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nFrase)}</span>
            </div>
            <div className="pos-spread">
              <h2 ref={fraseRef} className="pos-frase">
                {palabras.map((p, i) => (
                  // El espacio va fuera del span: el motor pone cada palabra
                  // en inline-block y un espacio adentro se colapsa a cero.
                  <span key={i}>
                    <span data-w="1" className={tonoDePalabra(i)}>{p}</span>{" "}
                  </span>
                ))}
              </h2>
              <div data-xin="1" data-delay="900" data-dist="60" className="pos-nota">
                <span className="pos-nota-avion" aria-hidden="true">✈</span>
                <span>{tx("invitacion.frase.conAmor")} · {titulo}</span>
              </div>
            </div>
            <div className="pos-folio pos-folio--pie">
              <span>{tx("invitacion.saveTheDate.viaAerea").toUpperCase()}</span>
              <span className="pos-barra" aria-hidden="true" />
            </div>
          </section>
        )}

        {/* ── 04 Cuándo y dónde ──────────────────────────────────────────
            Etiquetas de valija: un destino por lugar, con la tarjeta de
            esquinas desparejas y el ojal a la izquierda. */}
        <div
          id="details"
          data-pan="1"
          data-scroll={scrollVertical || panelesLugar.length <= 1 ? "vertical" : "lateral"}
          data-screen-label={tx("invitacion.ubicacion.cuandoYDonde")}
          className="pos-pan"
          style={{ "--st-pasos": Math.max(0, panelesLugar.length - 1) } as React.CSSProperties}
        >
          <div className="pos-pan-fijo">
            <div data-strip="1" className="pos-tira">
              <div data-tone="light" className="pos-panel pos-panel--crema">
                <div className="pos-folio pos-folio--acento">
                  <span>{nCuando} — {tx("invitacion.ubicacion.fiestaSalon").toUpperCase()}</span><span>{deLugar("recepcion")}</span>
                </div>
                <div className="pos-spread">
                  <div className="pos-pagina">
                    <span className="pos-panel-sub">{tx("invitacion.saveTheDate.destino")} {deLugar("recepcion").split(" ")[0]}</span>
                    <h2 className="pos-panel-titulo">{lugarNombre || ciudad}</h2>
                  </div>
                  <div className="pos-etiqueta-valija">
                    <span className="pos-ojal" aria-hidden="true" />
                    <div className="pos-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{hora} h</span></div>
                    {direccion && <div className="pos-linea"><span>{tx("invitacion.ubicacion.direccion")}</span><span>{direccion}</span></div>}
                    {dressCode && <div className="pos-linea"><span>{tx("invitacion.ubicacion.dressCode")}</span><span>{dressCode}</span></div>}
                    {mapUrl && (
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="pos-cta">
                        {tx("invitacion.ubicacion.comoLlegar")}<span>✈</span>
                      </a>
                    )}
                  </div>
                </div>
                <div className="pos-folio pos-folio--pie">
                  <span>{[direccion, ciudad].filter(Boolean).join(" · ").toUpperCase()}</span>
                  {!scrollVertical && panelesLugar.length > 1 && <span>{tx("invitacion.portada.desliza").toUpperCase()} →</span>}
                </div>
              </div>

              {ceremoniaHabilitada && (
                <div id="ceremonia" data-tone="dark" className="pos-panel pos-panel--tinta">
                  <div className="pos-folio pos-folio--ambar">
                    <span>{nCuando} — {ceremoniaTitulo.toUpperCase()}</span><span>{deLugar("ceremonia")}</span>
                  </div>
                  <div className="pos-spread">
                    <div className="pos-pagina">
                      <span className="pos-panel-sub pos-panel-sub--ambar">{tx("invitacion.saveTheDate.destino")} {deLugar("ceremonia").split(" ")[0]}</span>
                      <h2 className="pos-panel-titulo">{ceremoniaNombre || ceremoniaTitulo}</h2>
                    </div>
                    <div className="pos-etiqueta-valija">
                      <span className="pos-ojal" aria-hidden="true" />
                      {ceremoniaHora && <div className="pos-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{ceremoniaHora} h</span></div>}
                      {ceremoniaDireccion && <div className="pos-linea"><span>{tx("invitacion.ubicacion.direccion")}</span><span>{ceremoniaDireccion}</span></div>}
                    </div>
                  </div>
                  <div className="pos-folio pos-folio--pie">
                    <span>{tx("invitacion.ubicacion.ceremoniaCivil").toUpperCase()}</span>
                    {!scrollVertical && <span>{tx("invitacion.portada.desliza").toUpperCase()} →</span>}
                  </div>
                </div>
              )}

              {hayComoLlegar && (
                <div id="location" data-tone="light" className="pos-panel pos-panel--crema">
                  <div className="pos-folio pos-folio--acento">
                    <span>{nCuando} — {tx("invitacion.ubicacion.comoLlegar").toUpperCase()}</span><span>{deLugar("llegar")}</span>
                  </div>
                  <div className="pos-spread">
                    <div className="pos-pagina">
                      <span className="pos-panel-sub">{tx("invitacion.saveTheDate.destino")} {deLugar("llegar").split(" ")[0]}</span>
                      <h2 className="pos-panel-titulo">{tx("invitacion.ubicacion.comoLlegar")}</h2>
                    </div>
                    <div className="pos-etiqueta-valija">
                      <span className="pos-ojal" aria-hidden="true" />
                      {embedMapUrl && (
                        <div className="pos-mapa">
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
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="pos-cta">
                        {tx("invitacion.ubicacion.abrirEnMapas")}<span>✈</span>
                      </a>
                    </div>
                  </div>
                  <div className="pos-folio pos-folio--pie">
                    <span>{[direccion, ciudad].filter(Boolean).join(" · ").toUpperCase()}</span>
                    {!scrollVertical && <span>{tx("invitacion.portada.desliza").toUpperCase()} →</span>}
                  </div>
                </div>
              )}

              {cronograma.length > 0 && (
                <div id="schedule" data-tone="dark" className="pos-panel pos-panel--teal">
                  <div className="pos-folio">
                    <span>{nCuando} — {tx("invitacion.ubicacion.cronograma").toUpperCase()}</span><span>{deLugar("cronograma")}</span>
                  </div>
                  <div className="pos-spread">
                    <div className="pos-pagina">
                      <span className="pos-panel-sub pos-panel-sub--blanco">{tx("invitacion.saveTheDate.destino")} {deLugar("cronograma").split(" ")[0]}</span>
                      <h2 className="pos-panel-titulo">{tx("invitacion.ubicacion.laNochePasoAPaso").split(",")[0]}</h2>
                    </div>
                    <div className="pos-etiqueta-valija">
                      <span className="pos-ojal" aria-hidden="true" />
                      {cronograma.map((item, i) => (
                        <div key={i} className="pos-linea"><span>{item.time || ""}</span><span>{item.title}</span></div>
                      ))}
                    </div>
                  </div>
                  <div className="pos-folio pos-folio--pie">
                    <span>{fechaPuntos}</span>
                  </div>
                </div>
              )}
            </div>
            {!scrollVertical && panelesLugar.length > 1 && <Puntos cantidad={panelesLugar.length} />}
          </div>
        </div>

        {/* ── 05 Check-in ────────────────────────────────────────────────
            La tarjeta de embarque: pliego verde azulado, el boarding pass
            blanco con la línea de troquel y el sello OK al confirmar. */}
        {rsvpHabilitado && (
          <section id="rsvp" data-tone="light" data-screen-label={tx("invitacion.rsvp.confirmar")} className="pos-section pos-checkin">
            <div className="pos-folio">
              <span data-xin="1" data-dist="-40">{nCheckin} — CHECK-IN</span>
              <span data-xin="1" data-dist="40">{folio(nCheckin)}</span>
            </div>
            <div className="pos-spread">
              <div className="pos-pagina">
                <h2 data-xin="1" data-dist="-80" className="pos-h2">
                  {tx("invitacion.rsvp.confirmaLinea1")}<br /><span className="pos-ambar">{tx("invitacion.rsvp.confirmaLinea2")}</span>
                </h2>
              </div>
              <div data-xin="1" data-delay="160" data-dist="80" className="pos-cupon">
                <span className="pos-troquel" aria-hidden="true"><span /><span /><span /></span>
                <CheckinPostal
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
            Postales del viaje: cada foto es una tarjeta que, al pasar por
            el centro, gira y muestra el dorso con la estampilla. */}
        {todasLasFotos.length > 0 && (
          <div
            id="album"
            data-pan="1"
            data-scroll={scrollVertical || hojasDeFotos.length <= 1 ? "vertical" : "lateral"}
            data-screen-label={tx("invitacion.album.titulo")}
            className="pos-pan"
            style={{ "--st-pasos": Math.max(0, hojasDeFotos.length - 1) } as React.CSSProperties}
          >
            <div className="pos-pan-fijo pos-pan-fijo--album">
              <div data-strip="1" className="pos-tira">
                {hojasDeFotos.map((hoja, iHoja) => (
                  <div key={iHoja} data-tone="light" className={`pos-panel pos-panel--album${iHoja % 2 === 1 ? " pos-panel--album-b" : ""}`}>
                    <div className="pos-folio pos-folio--gris">
                      <span>{nAlbum} — {tx("invitacion.album.titulo").toUpperCase()}</span>
                      <span>{tx("invitacion.album.hojaDeTotal", { n: String(iHoja + 1).padStart(2, "0"), total: String(hojasDeFotos.length).padStart(2, "0") }).toUpperCase()} · {folio(nAlbum)}</span>
                    </div>
                    <h2 className="pos-h2 pos-h2--album">{tx("invitacion.saveTheDate.postalesDelViaje")}</h2>
                    <div className="pos-postales" data-cantidad={hoja.length}>
                      {hoja.map((url, i) => (
                        <div
                          key={i}
                          data-sheet="1"
                          className="pos-postal"
                          role="button"
                          tabIndex={0}
                          onClick={() => setFotoAmpliada(url)}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setFotoAmpliada(url); }}
                          aria-label={tx("invitacion.album.ampliarFoto", { n: i + 1 })}
                        >
                          <div data-card="1" className="pos-postal-carta">
                            <div className="pos-postal-frente">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={url} alt="" loading="lazy" className="pos-postal-img" />
                              <span data-colorwash="1" className={`pos-bano pos-bano--${(i % 5) + 1}`} aria-hidden="true" />
                              <span className="pos-postal-n">FOTO {String(i + 1).padStart(2, "0")}</span>
                            </div>
                            <div className="pos-postal-dorso" aria-hidden="true">
                              <div className="pos-postal-dorso-izq"><span>{[ciudad, anio].filter(Boolean).join(" · ").toUpperCase()}</span><span /><span /><span /></div>
                              <div className="pos-postal-dorso-der"><span className="pos-estampilla-chica" /><span /><span /></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="pos-folio pos-folio--gris pos-folio--pie">
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
            El anuncio de abordo: sobre tinta, con el ecualizador de cinco
            barras y la lista en fichas. */}
        {sugerenciaMusicaHabilitada && (
          <section id="songs" data-tone="dark" data-screen-label={tx("invitacion.musica.titulo")} className="pos-section pos-musica">
            <div className="pos-folio pos-folio--ambar">
              <span data-xin="1" data-dist="-40">{nMusica} — {tx("invitacion.musica.titulo").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nMusica)}</span>
            </div>
            <div className="pos-spread">
              <div className="pos-pagina">
                <h2 data-xin="1" data-dist="-80" className="pos-h2">
                  {tituloEnDosLineas(tx("invitacion.sabor.preguntaCancionFaltar"), "pos-ambar")}
                </h2>
                <div data-xin="1" data-delay="120" className="pos-eq" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((i) => <span key={i} style={{ animationDelay: `${i * 0.18}s` }} />)}
                </div>
              </div>
              <div className="pos-pagina">
                <CancionesPostal
                  invitationId={String(invitation.id ?? "")}
                  guestToken={guest?.uniqueToken}
                  guestName={nombreInvitado || tx("invitacion.evento.invitado")}
                />
              </div>
            </div>
          </section>
        )}

        {/* ── 08 Regalos ─────────────────────────────────────────────────
            El fondo de viaje: tarjetas blancas con borde de tinta. */}
        {hayRegalos && (
          <section id="banco" data-tone="light" data-screen-label={tx("invitacion.regalos.titulo")} className="pos-section pos-regalos">
            <div className="pos-folio pos-folio--acento">
              <span data-xin="1" data-dist="-40">{nRegalos} — {tx("invitacion.regalos.titulo").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nRegalos)}</span>
            </div>
            <div className="pos-spread">
              <div className="pos-pagina">
                <h2 data-xin="1" data-dist="-80" className="pos-h2">
                  {tx("invitacion.regalos.siQueresLinea1")}<br /><span className="pos-teal">{tx("invitacion.regalos.siQueresLinea2")}</span>
                </h2>
                {Boolean(invitation.regaloMensaje) && (
                  <p data-xin="1" data-delay="120" className="pos-parrafo">{String(invitation.regaloMensaje)}</p>
                )}
              </div>
              <div className="pos-pagina">
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
            La declaración de aduana: pliego ámbar y opciones en blanco con
            borde de tinta. */}
        {quizHabilitado && (
          <section id="quiz" data-tone="light" data-screen-label="Quiz" className="pos-section pos-quiz">
            <div className="pos-folio">
              <span data-xin="1" data-dist="-40">{nQuiz} — {triviaTitulo.toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nQuiz)}</span>
            </div>
            <div className="pos-spread">
              <TriviaPostal
                preguntas={triviaPreguntas}
                invitationId={String(invitation.id ?? "")}
                guestToken={guest?.uniqueToken}
                guestName={nombreInvitado || tx("invitacion.evento.invitado")}
              />
            </div>
          </section>
        )}

        {/* ── 10 Tu pase ─────────────────────────────────────────────────
            La tarjeta de embarque final: talón lateral con texto vertical,
            código de barras, el QR chico y el asiento; al lado, el número
            de pase y los datos. */}
        <section data-tone="dark" data-screen-label={tx("invitacion.pase.tuPase")} className="pos-section pos-pase">
          <div className="pos-folio pos-folio--ambar">
            <span data-xin="1" data-dist="-40">{nPase} — {tx("invitacion.pase.tuPase").toUpperCase()}</span>
            <span data-xin="1" data-dist="40">{folio(nPase)}</span>
          </div>
          <div className="pos-spread">
            <div data-xin="1" data-dist="-60" className="pos-pagina pos-pagina--boarding">
              <div className="pos-boarding">
                <span className="pos-boarding-troquel" aria-hidden="true" />
                <span className="pos-boarding-talon">Boarding · {inicialesCortas} · {diaNum} {mesCorto}</span>
                <div className="pos-boarding-datos">
                  <div className="pos-boarding-etqs"><span>{tx("invitacion.saveTheDate.pasajero")}</span><span>{tx("invitacion.saveTheDate.asiento")}</span></div>
                  <div className="pos-boarding-fila"><span className="pos-boarding-nombre">{nombreInvitado || titulo}</span><span className="pos-boarding-asiento">{guest?.mesas?.[0] ?? pase}</span></div>
                  <CodigoDeBarras />
                  <span className="pos-boarding-codigo">{codigoDelPase}</span>
                </div>
                <div className="pos-boarding-qr">
                  <QrDeIngreso guest={guest as never} />
                </div>
              </div>
            </div>
            <div className="pos-pagina">
              <div data-xin="1" data-delay="100" className="pos-pase-cabeza">
                <div className="pos-pase-numero">
                  <span className="pos-folio-etq">{tx("invitacion.pase.pase").toUpperCase()} Nº</span>
                  <span>{pase}</span>
                </div>
                {guest?.mesas && guest.mesas.length > 0 && (
                  <div className="pos-pase-mesa">
                    <span className="pos-folio-etq">{tx("invitacion.pase.tuMesa").toUpperCase()}</span>
                    <span>{guest.mesas[0]}</span>
                  </div>
                )}
              </div>
              <div data-xin="1" data-delay="160" className="pos-caja">
                <div className="pos-linea"><span>{saludaAlInvitado ? tx("invitacion.pase.reservadoPara") : tx("invitacion.evento.invitado")}</span><span>{nombreInvitado || titulo}</span></div>
                {lugaresDelPase > 0 && (
                  <div className="pos-linea"><span>{tx("invitacion.pase.lugares")}</span><span>{lugaresDelPase}</span></div>
                )}
                {guest?.mesas && guest.mesas.length > 0 && (
                  <div className="pos-linea"><span>Sector</span><span>{guest.mesas.join(" · ")}</span></div>
                )}
                <div className="pos-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{fechaPuntos} · {hora} H</span></div>
              </div>
              <div className="pos-info-extra">
                <InfoAdicionalSection invitation={invitation} />
              </div>
            </div>
          </div>
          <div data-xin="1" data-delay="220" className="pos-pase-pie">
            <span className="pos-despedida">{tx("invitacion.saveTheDate.buenViaje")} {tx("invitacion.pase.losEsperamos")} — {iniciales(nombre1, nombre2)}</span>
            <div className="pos-folio pos-folio--ambar pos-folio--colofon">
              <span className="pos-credito"><LogoFooterCredit bgColor="transparent" textColor={PALETA.bg} /></span>
              <span className="pos-replay" role="button" tabIndex={0} onClick={volverAVerla} onKeyDown={(e) => { if (e.key === "Enter") volverAVerla(); }}>
                {tx("invitacion.portada.verAperturaOtraVez").toUpperCase()} ↺
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* ── Riel de progreso ───────────────────────────────────────────── */}
      <div ref={rielRef} className="pos-riel">
        <span ref={rielTopRef} className="pos-riel-top">{pase}</span>
        <div ref={rielLineaRef} className="pos-riel-linea">
          <span ref={rielBarraRef} className="pos-riel-barra" />
        </div>
        <span ref={rielEtiquetaRef} className="pos-riel-etiqueta">{tx("invitacion.saveTheDate.guardaLaFecha").toUpperCase()}</span>
      </div>

      {/* ── La tapa ─────────────────────────────────────────────────────
          La postal de tapa: borde de correo aéreo, el mapa con las curvas
          de nivel, la ruta punteada con el avioncito recorriéndola, el
          nombre en Alfa Slab con el "&" como estampilla y el matasellos que
          cae encima. Es la bienvenida: dice de quién es la fiesta, cuándo,
          dónde y para cuántos. */}
      <div ref={portadaRef} data-tone={TONO} className="pos-portada">
        <div ref={escenaPortadaRef} className="pos-portada-hoja">
          <span className="pos-borde-aereo" aria-hidden="true" />
          <div className="pos-mapa-fondo" aria-hidden="true">
            <svg data-depth="0.5" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="pos-mapa-curvas">
              <g fill="none" stroke="currentColor" strokeWidth="1"><path d="M20 220 Q60 180 110 200 T200 190 T300 210 T380 190" /><path d="M40 100 Q90 130 150 110 T260 120 T360 90" /></g>
              <g fill="currentColor" opacity=".5"><circle cx="70" cy="205" r="2.5" /><circle cx="220" cy="188" r="2.5" /><circle cx="330" cy="205" r="2.5" /><circle cx="150" cy="112" r="2.5" /><circle cx="300" cy="105" r="2.5" /></g>
            </svg>
            <svg viewBox="0 0 430 300" preserveAspectRatio="none" className="pos-ruta">
              <path d="M -40 62 C 20 20, 60 20, 110 50 S 200 70, 260 30 S 380 10, 470 40" fill="none" stroke="currentColor" strokeWidth="1.6" strokeDasharray="5 7" opacity=".7" />
              <circle cx="110" cy="50" r="3" className="pos-ruta-punto" /><circle cx="260" cy="30" r="3" className="pos-ruta-punto" />
            </svg>
            <svg viewBox="0 0 40 40" className="pos-avion">
              <path d="M38 20 C38 18.4 36.4 18.4 34 18.4 L23 18.4 L15 4 L11 4 L15.5 18.4 L9.5 18.4 L6.5 13 L4.5 13 L5.5 18.8 L3 20 L5.5 21.2 L4.5 27 L6.5 27 L9.5 21.6 L15.5 21.6 L11 36 L15 36 L23 21.6 L34 21.6 C36.4 21.6 38 21.6 38 20 Z" fill="currentColor" />
            </svg>
          </div>

          <div data-cl="1" className="pos-folio pos-folio--tapa">
            <span className="pos-chip-borde">{tx("invitacion.saveTheDate.vueloConfirmado")}</span>
            <span className="pos-chip-borde">Nº 00 / {String(totalPliegos).padStart(2, "0")}</span>
          </div>

          <div data-cl="2" className="pos-tapa-centro">
            <span className="pos-tapa-kicker">{ciudad ? `${tx("invitacion.saveTheDate.saludosDesde")} ${ciudad}` : kickerDelEvento}</span>
            <h1 ref={cartelRef} className="pos-tapa-nombres" style={{ "--largo": renglonMasLargo } as React.CSSProperties}>
              <Matasellos texto={`${tx("invitacion.saveTheDate.correo").toUpperCase()} · ${diaNum} ${mesCorto} ${anio} · ${(ciudad || lugarNombre).toUpperCase()} · `} centro={inicialesCortas} pie={`${hora} H`} />
              {saludaAlInvitado ? (
                <span className="pos-tapa-linea"><span data-pieza="1">{nombreInvitado}</span></span>
              ) : (
                <>
                  <span className="pos-tapa-linea"><span data-pieza="1">{nombre1}</span></span>
                  {nombre2 && (
                    <>
                      <span className="pos-tapa-linea pos-tapa-linea--amp"><span data-pieza="1" className="pos-estampilla-amp">&amp;</span></span>
                      <span className="pos-tapa-linea"><span data-pieza="1">{nombre2}</span></span>
                    </>
                  )}
                </>
              )}
            </h1>
            <div className="pos-tapa-datos">
              <span>{tx("invitacion.saveTheDate.destino")}: {lugarNombre || "—"}<br /><span className="pos-acento">{[direccion, ciudad].filter(Boolean).join(" · ")}</span></span>
              <span className="pos-tapa-datos-der">
                {isPersonalized && guest
                  ? <>{tx("invitacion.pase.pase")} Nº {pase}<br /><span className="pos-acento">{lugaresDelPase} {tx(lugaresDelPase === 1 ? "invitacion.bienvenida.persona" : "invitacion.bienvenida.personas")}</span></>
                  : <>{diaSemana} {diaNum}<br /><span className="pos-acento">{hora} h</span></>}
              </span>
            </div>
          </div>

          <div data-cl="3" className="pos-tapa-pie">
            <p className="pos-tapa-mensaje">
              {saludaAlInvitado
                ? `${tx("invitacion.bienvenida.hola", { nombre: nombreInvitado })}. ${String(invitation.portadaMensaje || tx("invitacion.sabor.mensajeLoContamosNosotros"))}`
                : String(invitation.portadaMensaje || tx("invitacion.sabor.mensajeLoContamosNosotros"))}
            </p>
            <button type="button" onClick={abrir} className="pos-tapa-btn">
              {tx("invitacion.portada.abrirInvitacion")} ✈
            </button>
          </div>
        </div>
      </div>

      <div ref={pistaRef} className="pos-pista">{tx("invitacion.portada.desliza").toUpperCase()} ↓</div>

      {fotoAmpliada && (
        <div className="pos-lupa" onClick={() => setFotoAmpliada(null)} onContextMenu={(e) => e.preventDefault()}>
          <button
            type="button"
            className="pos-lupa-cerrar"
            onClick={(e) => { e.stopPropagation(); setFotoAmpliada(null); }}
            aria-label={tx("invitacion.cerrar")}
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fotoAmpliada} alt={tx("invitacion.album.fotoAmpliada")} className="pos-lupa-img" draggable={false} onClick={(e) => e.stopPropagation()} />
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
 * El matasellos: dos anillos con el texto en arco, las iniciales en el
 * centro y la hora debajo, con la tinta gastada (una máscara de puntos).
 * Cae sobre el nombre 1,6 s después de que entra la tapa.
 */
function Matasellos({ texto, centro, pie }: { texto: string; centro: string; pie: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <div data-matasellos="1" className="pos-matasellos" aria-hidden="true">
      <svg viewBox="0 0 100 100">
        <defs>
          <path id={`arc-${id}`} d="M50 50 m -36 0 a 36 36 0 1 1 72 0 a 36 36 0 1 1 -72 0" fill="none" />
          <pattern id={`gasto-${id}`} patternUnits="userSpaceOnUse" width="7" height="7"><circle cx="2" cy="3" r="1.4" fill="#000" /><circle cx="5.5" cy="6" r="1" fill="#000" /></pattern>
          <mask id={`mascara-${id}`}><rect width="100" height="100" fill="#fff" /><rect width="100" height="100" fill={`url(#gasto-${id})`} opacity=".55" /></mask>
        </defs>
        <g mask={`url(#mascara-${id})`}>
          <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="3" />
          <circle cx="50" cy="50" r="27" fill="none" stroke="currentColor" strokeWidth="2" />
          <text className="pos-matasellos-arco"><textPath href={`#arc-${id}`}>{texto.repeat(3).slice(0, 44)}</textPath></text>
          <text x="50" y="47" textAnchor="middle" className="pos-matasellos-centro">{centro}</text>
          <text x="50" y="60" textAnchor="middle" className="pos-matasellos-pie">{pie}</text>
        </g>
      </svg>
    </div>
  );
}

/** El sello de visa del Save the Date: la fecha adentro de tres anillos. */
function SelloVisa({ arco, dia, mes, anio, admitido }: { arco: string; dia: string; mes: string; anio: string; admitido: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 200 200" className="pos-visa-sello" aria-hidden="true">
      <defs>
        <pattern id={`gasto-${id}`} patternUnits="userSpaceOnUse" width="7" height="7"><circle cx="2" cy="3" r="1.4" fill="#000" /><circle cx="5.5" cy="6" r="1" fill="#000" /></pattern>
        <path id={`arc-${id}`} d="M100 100 m -78 0 a 78 78 0 1 1 156 0 a 78 78 0 1 1 -156 0" fill="none" />
        <mask id={`mascara-${id}`}><rect width="200" height="200" fill="#fff" /><rect width="200" height="200" fill={`url(#gasto-${id})`} opacity=".45" /></mask>
      </defs>
      <g mask={`url(#mascara-${id})`} fill="none" stroke="currentColor"><circle cx="100" cy="100" r="94" strokeWidth="5" /><circle cx="100" cy="100" r="86" strokeWidth="1.5" /><circle cx="100" cy="100" r="62" strokeWidth="2" /></g>
      <g mask={`url(#mascara-${id})`}>
        <text className="pos-visa-arco"><textPath href={`#arc-${id}`}>{arco.repeat(3).slice(0, 56)}</textPath></text>
        <text x="100" y="92" textAnchor="middle" className="pos-visa-dia">{dia}</text>
        <text x="100" y="116" textAnchor="middle" className="pos-visa-mes">{mes}</text>
        <text x="100" y="140" textAnchor="middle" className="pos-visa-anio">{anio}</text>
        <rect x="66" y="150" width="68" height="12" fill="currentColor" /><text x="100" y="159.5" textAnchor="middle" className="pos-visa-admitido">{admitido}</text>
      </g>
    </svg>
  );
}

/** El código de barras del boarding pass: cuarenta barras. */
function CodigoDeBarras() {
  const barras = [[0, 3], [5, 1], [9, 2], [14, 4], [20, 1], [24, 3], [30, 2], [34, 1], [38, 4], [45, 2], [49, 1], [53, 3], [59, 1], [62, 4], [69, 2], [73, 1], [77, 3], [83, 2], [87, 4], [94, 1], [97, 3], [103, 1], [107, 2], [112, 4], [118, 1], [122, 3], [128, 2], [132, 1], [136, 4], [143, 2], [147, 1], [151, 3], [157, 1], [160, 4], [167, 2], [171, 1], [175, 3], [181, 2], [185, 4], [192, 1], [196, 3]];
  return (
    <svg viewBox="0 0 200 40" preserveAspectRatio="none" className="pos-barras" aria-hidden="true">
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
    <div className="pos-puntos" aria-hidden="true">
      {Array.from({ length: cantidad }).map((_, i) => (
        <span key={i} data-dot={i} className="pos-punto" style={{ background: i === 0 ? PALETA.acc : "rgba(43,42,51,.18)" }} />
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
function CuentaPostal({ targetDate }: { targetDate: Date }) {
  const tx = useTextos();
  const { time, isEventDay, isPast, hasEnded } = useCountdown(targetDate);

  if (isEventDay || hasEnded || isPast) {
    return (
      <div className="pos-tarjeta pos-tarjeta--hoy" data-xin="1" data-delay="80" data-dist="30">
        <span className="pos-tarjeta-kicker">{tx("invitacion.cuentaRegresiva.kicker").toUpperCase()}</span>
        <span className="pos-tarjeta-titulo">
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
    <div className="pos-cuenta">
      {celdas.map((c, i) => (
        <div key={c.l} data-xin="1" data-delay={i * 100} data-dist={i % 2 === 0 ? -80 : 80} className={`pos-cuenta-caja pos-cuenta-caja--${i + 1}`}>
          <span className="pos-cuenta-num"><span key={c.v}>{c.v}</span></span>
          <span className="pos-cuenta-etq">{c.l.toUpperCase()}</span>
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
    <div className="pos-fila pos-fila--copiable">
      <div className="pos-fila-texto">
        <span className="pos-fila-etq">{etiqueta.toUpperCase()}</span>
        <span className="pos-fila-dato">{valor}</span>
      </div>
      <button type="button" onClick={copiar} className={`pos-btn-copiar${copiado ? " pos-btn-copiar--hecho" : ""}`}>
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
      className={`pos-tarjeta pos-tarjeta--banco${dobleZ ? " pos-doblez" : ""}${inclinada ? " pos-tarjeta--der" : " pos-tarjeta--izq"}`}
    >
      <span className="pos-tarjeta-kicker">{titulo.toUpperCase()}</span>
      {mensaje && <p className="pos-tarjeta-mensaje">{mensaje}</p>}
      <div className="pos-filas">
        <FilaCopiable etiqueta="Alias" valor={alias} />
        <FilaCopiable etiqueta="CBU" valor={cbu} />
        {(banco || titular) && (
          <div className="pos-fila pos-fila--ultima">
            <span>{banco || tx("invitacion.regalos.banco")}</span>
            <span className="pos-fila-valor">{titular}</span>
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
function CheckinPostal({
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
      <div data-xin="1" data-delay="140" data-dist="30" className="pos-tarjeta pos-tarjeta--izq">
        <p className="pos-tarjeta-mensaje">{tx("invitacion.rsvp.graciasPorAvisarAcceso")}</p>
        <button type="button" className="pos-btn-fantasma" onClick={() => setEstado("PENDING")}>
          {tx("invitacion.rsvp.cambieDeIdea").toUpperCase()}
        </button>
      </div>
    );
  }

  const confirmadoYa = estado === "CONFIRMED";

  return (
    <>
      <div ref={tarjetaRef} data-xin="1" data-delay="140" data-dist="30" className="pos-tarjeta pos-tarjeta--talon">
        <div className="pos-talon-top">
          <span>{tx("invitacion.pase.numeroPase", { n: pase }).toUpperCase()}{guestName ? ` · ${guestName.toUpperCase()}` : ""}</span>
          <span ref={estadoRef} className="pos-talon-estado">
            {confirmado || confirmadoYa ? tx("invitacion.pase.accesoConfirmado").toUpperCase() : tx("invitacion.pase.pendiente").toUpperCase()}
          </span>
        </div>

        {!confirmadoYa ? (
          <>
            {lugares > 1 && (
              <div className="pos-campo">
                <label className="pos-etiqueta">{tx("invitacion.rsvp.adultos").toUpperCase()}</label>
                <div className="pos-contador">
                  <button type="button" onClick={() => setAdultos((v) => Math.max(1, v - 1))} disabled={adultos <= 1} aria-label="−">−</button>
                  <span>{adultos}</span>
                  <button type="button" onClick={() => setAdultos((v) => Math.min(maxAdultos, v + 1))} disabled={adultos >= maxAdultos} aria-label="+">+</button>
                </div>
              </div>
            )}
            {maxAdolescentes > 0 && (
              <div className="pos-campo">
                <label className="pos-etiqueta">{tx("invitacion.rsvp.adolescentes").toUpperCase()}</label>
                <div className="pos-contador">
                  <button type="button" onClick={() => setAdolescentes((v) => Math.max(0, v - 1))} disabled={adolescentes <= 0} aria-label="−">−</button>
                  <span>{adolescentes}</span>
                  <button type="button" onClick={() => setAdolescentes((v) => Math.min(maxAdolescentes, v + 1))} disabled={adolescentes >= maxAdolescentes} aria-label="+">+</button>
                </div>
              </div>
            )}
            {maxNinos > 0 && (
              <div className="pos-campo">
                <label className="pos-etiqueta">{tx("invitacion.rsvp.ninos").toUpperCase()}</label>
                <div className="pos-contador">
                  <button type="button" onClick={() => setNinos((v) => Math.max(0, v - 1))} disabled={ninos <= 0} aria-label="−">−</button>
                  <span>{ninos}</span>
                  <button type="button" onClick={() => setNinos((v) => Math.min(maxNinos, v + 1))} disabled={ninos >= maxNinos} aria-label="+">+</button>
                </div>
              </div>
            )}
            <div className="pos-campo">
              <label className="pos-etiqueta">{tx("invitacion.rsvp.restriccionAlimentaria").toUpperCase()}</label>
              <input
                value={dieta}
                onChange={(e) => setDieta(e.target.value)}
                placeholder="—"
                maxLength={120}
                className="pos-input"
              />
            </div>
          </>
        ) : (
          <div className="pos-filas">
            {lugares > 1 && adultos > 0 && <div className="pos-fila"><span>{tx("invitacion.rsvp.adultos")}</span><span>{adultos}</span></div>}
            {adolescentes > 0 && <div className="pos-fila"><span>{tx("invitacion.rsvp.adolescentes")}</span><span>{adolescentes}</span></div>}
            {ninos > 0 && <div className="pos-fila"><span>{tx("invitacion.rsvp.ninos")}</span><span>{ninos}</span></div>}
            <div className="pos-fila pos-fila--ultima">
              <span>{tx("invitacion.rsvp.restriccionAlimentaria")}</span>
              <span className="pos-fila-valor">{restricciones || dieta || "—"}</span>
            </div>
          </div>
        )}

        {hayPago && monto != null && !exento && (
          <div className="pos-precio">
            <span>{estadoDePago === "PAID" ? tx("invitacion.pago.abonado") : tx("invitacion.pago.valor")}</span>
            <div className="pos-precio-valor">
              <span className="pos-precio-total">{formatearMoneda(totalAPagar)}</span>
              {usarTotalDelServidor && vistaDePago
                ? vistaDePago.lines.map((l, i) => <span key={i} className="pos-precio-detalle">{l}</span>)
                : (
                  <>
                    {adultos > 0 && <span className="pos-precio-detalle">{adultos} × {formatearMoneda(precioAdulto)}</span>}
                    {adolescentes > 0 && <span className="pos-precio-detalle">{adolescentes} × {formatearMoneda(precioAdo)}</span>}
                    {ninos > 0 && <span className="pos-precio-detalle">{ninos} × {formatearMoneda(precioNin)}</span>}
                  </>
                )}
            </div>
          </div>
        )}

        <div ref={selloRef} className="pos-sello" aria-hidden="true">{tx("invitacion.pase.confirmado").toUpperCase()}</div>
        <div ref={petalosRef} className="pos-petalos" aria-hidden="true" />
      </div>

      {error && <p className="pos-error">{error}</p>}

      {!confirmadoYa ? (
        <>
          <button type="button" data-xin="1" data-delay="220" className="pos-btn-solido" disabled={enviando} onClick={() => enviar("CONFIRMA")}>
            {enviando ? tx("invitacion.rsvp.guardando").toUpperCase() : tx("invitacion.rsvp.confirmarAsistencia").toUpperCase()}
          </button>
          <button type="button" data-xin="1" data-delay="280" className="pos-btn-fantasma" disabled={enviando} onClick={() => enviar("NO_ASISTE")}>
            {tx("invitacion.rsvp.noVoyAPoderAsistir").toUpperCase()}
          </button>
        </>
      ) : (
        <button type="button" className="pos-btn-fantasma" onClick={() => setEstado("PENDING")}>
          {tx("invitacion.rsvp.modificarAsistencia").toUpperCase()}
        </button>
      )}
    </>
  );
}

interface CancionItem { id: string; title: string; artist: string; guestName: string }

/** Sugerir una canción, en una tarjeta de papel con la lista debajo. */
function CancionesPostal({ invitationId, guestToken, guestName }: { invitationId: string; guestToken?: string; guestName: string }) {
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
      <form onSubmit={enviar} data-xin="1" data-delay="140" data-dist="30" className="pos-tarjeta pos-tarjeta--der">
        <div className="pos-campo">
          <label className="pos-etiqueta">{tx("invitacion.musica.tema").toUpperCase()}</label>
          <input value={tema} onChange={(e) => setTema(e.target.value)} placeholder={tx("invitacion.musica.nombreDeLaCancion")} maxLength={100} className="pos-input pos-input--serif" />
        </div>
        <div className="pos-campo">
          <label className="pos-etiqueta">{tx("invitacion.musica.artista").toUpperCase()}</label>
          <input value={artista} onChange={(e) => setArtista(e.target.value)} placeholder={tx("invitacion.musica.artista")} maxLength={80} className="pos-input pos-input--serif" />
        </div>
        {error && <p className="pos-error">{error}</p>}
        <button type="submit" disabled={enviando} className="pos-btn-solido pos-btn-solido--tinta">
          {enviando ? tx("invitacion.musica.enviando").toUpperCase() : tx("invitacion.musica.sugeriUnaCancion").toUpperCase()}
        </button>
      </form>

      {canciones.length > 0 && (
        <div data-xin="1" data-delay="220" className="pos-lista">
          {canciones.slice(0, 8).map((c) => (
            <div key={c.id} className="pos-lista-fila">
              <div className="pos-lista-texto">
                <span className="pos-lista-tema">{c.title}</span>
                <span className="pos-lista-quien">{c.artist} · {tx("invitacion.musica.sumadoPor")} {c.guestName || tx("invitacion.evento.invitado")}</span>
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
function TriviaPostal({ preguntas, invitationId, guestToken, guestName }: { preguntas: QuizPregunta[]; invitationId: string; guestToken?: string; guestName: string }) {
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
      <div data-xin="1" data-delay="140" data-dist="30" className="pos-tarjeta pos-tarjeta--izq">
        <span className="pos-tarjeta-kicker">{tx("invitacion.quiz.kicker").toUpperCase()}</span>
        <span className="pos-tarjeta-titulo">
          {guardando ? tx("invitacion.rsvp.guardando") : tx("invitacion.quiz.respondisteCorrectamente", { aciertos: puntaje, total: preguntas.length })}
        </span>
        {!guardando && stats && stats.count > 0 && (
          <p className="pos-tarjeta-mensaje">{tx("invitacion.quiz.promedio", { n: stats.count, avg: stats.avg })}</p>
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
    <div data-xin="1" data-delay="140" data-dist="30" className="pos-tarjeta pos-tarjeta--izq">
      <span className="pos-tarjeta-kicker">{tx("invitacion.quiz.preguntaDeTotal", { n: indice + 1, total: preguntas.length }).toUpperCase()}</span>
      <span className="pos-tarjeta-pregunta">{q.pregunta}</span>
      <div className="pos-opciones">
        {q.opciones.map((op, oi) => {
          let clase = "";
          if (yaEligio && correcta !== undefined) {
            if (oi === correcta) clase = " pos-opcion--bien";
            else if (elegidas[indice] === oi) clase = " pos-opcion--mal";
          }
          return (
            <button key={oi} type="button" disabled={yaEligio} onClick={() => elegir(oi)} className={`pos-opcion${clase}`}>
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
// leen la Bienvenida y el Post-evento compartidos (esperan `pos-section` y
// `pos-kicker`).
const CSS_POS = `
  /* ── Postal ───────────────────────────────────────────────────────────
     Correo aéreo: Alfa Slab One como sello postal, Work Sans para el texto
     y JetBrains Mono para folios, sellos y el panel de vuelos. Borde de
     franjas, mapa con curvas de nivel, un avioncito que recorre la ruta,
     matasellos con la tinta gastada, sello de visa, split-flap, etiquetas
     de valija, boarding pass y postales que giran. Todo CSS y SVG. */
  .pos-raiz { position: fixed; inset: 0; width: 100%; height: calc(var(--vh, 1vh) * 100); overflow: hidden;
    background: var(--pp-bg); color: var(--pp-ink); font-family: var(--pos-sans), 'Work Sans', sans-serif;
    --pos-acc3: ${PALETA.acc3}; --pos-panel: #16283F; --pos-flap: #0E1A2C; }
  .pos-raiz a { color: inherit; text-decoration: none; }
  .pos-raiz button { font: inherit; }

  .pos-scroller { position: absolute; inset: 0; overflow-y: auto; overflow-x: hidden; opacity: 0;
    transition: opacity 900ms ease 260ms; scrollbar-width: none; }
  .pos-scroller::-webkit-scrollbar { width: 0; height: 0; }

  /* ── El pliego ─────────────────────────────────────────────────────── */
  .pos-section { position: relative; z-index: 1; min-height: calc(var(--vh, 1vh) * 100); box-sizing: border-box; overflow: hidden;
    display: flex; flex-direction: column; gap: 24px;
    padding: 60px max(20px, calc((100% - 1100px) / 2)) 80px; background: var(--pp-bg); color: var(--pp-ink); }
  .pos-section[data-tone="dark"] { background: var(--pp-ink); color: var(--pp-bg); }

  /* El folio: Work Sans 700 con tracking; ámbar sobre tinta, acento sobre
     crema. */
  .pos-folio { position: relative; z-index: 1; display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;
    font-weight: 700; font-size: 11px; letter-spacing: .24em; text-transform: uppercase; }
  .pos-folio--ambar { color: var(--pos-acc3); }
  .pos-folio--acento { color: var(--pp-acc); }
  .pos-folio--gris { color: #6E6A78; }
  .pos-folio--pie { align-items: center; margin-top: auto; letter-spacing: .22em; }
  .pos-panel > .pos-folio--pie { color: inherit; opacity: .8; }
  .pos-folio--colofon { align-items: center; border-top: 1px solid color-mix(in srgb, var(--pp-bg) 30%, transparent); padding-top: 12px; }
  .pos-folio-etq { font-weight: 700; font-size: 11px; letter-spacing: .24em; text-transform: uppercase; color: var(--pos-acc3); display: block; }
  .pos-barra { width: 40%; height: 1px; background: currentColor; }
  .pos-acento { color: var(--pp-acc); }
  .pos-teal { color: var(--pp-acc2); }
  .pos-ambar { color: var(--pos-acc3); }

  /* El spread: dos páginas; desde 1024 px se abren de verdad. */
  .pos-spread { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 22px; }
  .pos-pagina { display: flex; flex-direction: column; gap: 14px; min-width: 0; }
  @media (min-width: 1024px) {
    .pos-spread { display: grid; grid-template-columns: 1fr 1fr; align-items: center; column-gap: 72px; }
    .pos-spread > * { max-width: 560px; width: 100%; min-width: 0; }
    .pos-spread > *:first-child { justify-self: end; }
    .pos-spread > *:last-child { justify-self: start; }
    .pos-pagina--entera { grid-column: 1 / -1; max-width: none; justify-self: stretch; }
  }

  /* ── Tipos ─────────────────────────────────────────────────────────── */
  .pos-h2, .pos-panel-titulo, .pos-frase, .pos-tapa-nombres { font-family: var(--pos-serif), 'Alfa Slab One', cursive; font-weight: 400; }
  .pos-h2, .pos-panel-titulo { position: relative; z-index: 1; margin: 0; line-height: 1.02; font-size: clamp(34px, 9.5vw, 72px); }
  .pos-h2--album { font-size: clamp(30px, 8vw, 60px); }
  .pos-panel-titulo { font-size: clamp(32px, 9vw, 74px); }
  .pos-panel-sub { font-weight: 700; font-size: 12px; letter-spacing: .22em; text-transform: uppercase; color: var(--pp-acc); }
  .pos-panel-sub--ambar { color: var(--pos-acc3); }
  .pos-panel-sub--blanco { color: #FFFFFF; }
  .pos-parrafo { margin: 0; font-weight: 600; font-size: 15px; line-height: 1.5; max-width: 40ch; }
  .pos-chip { display: inline-block; padding: 12px 18px; font-weight: 700; font-size: 12px; letter-spacing: .16em; text-transform: uppercase; }
  .pos-chip--ambar { background: var(--pos-acc3); color: var(--pp-ink); }
  .pos-cta { margin-top: 6px; min-height: 48px; display: flex; align-items: center; justify-content: space-between; padding: 0 16px;
    color: #FFFFFF; background: var(--pp-ink); font-family: var(--pos-serif), 'Alfa Slab One', cursive; font-size: 14px; }

  /* ── 01 Guardá la fecha: el pasaporte ──────────────────────────────── */
  .pos-visa { position: relative; width: min(100%, 420px); aspect-ratio: 1; align-self: center; }
  .pos-visa-sello { position: absolute; inset: 0; transform: rotate(-9deg); color: var(--pp-acc); }
  .pos-visa-arco { font-family: var(--pos-mono), 'JetBrains Mono', monospace; font-weight: 500; font-size: 12px; letter-spacing: 3px; fill: currentColor; }
  .pos-visa-dia { font-family: var(--pos-serif), 'Alfa Slab One', cursive; font-size: 58px; fill: currentColor; }
  .pos-visa-mes { font-family: var(--pos-serif), 'Alfa Slab One', cursive; font-size: 20px; letter-spacing: 2px; fill: currentColor; }
  .pos-visa-anio { font-family: var(--pos-mono), 'JetBrains Mono', monospace; font-size: 15px; letter-spacing: 4px; fill: currentColor; }
  .pos-visa-admitido { font-family: var(--pos-mono), 'JetBrains Mono', monospace; font-size: 8px; letter-spacing: 2px; fill: var(--pp-ink); }
  .pos-fecha-pie { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 10px;
    font-weight: 700; font-size: 12px; letter-spacing: .16em; text-transform: uppercase; }
  /* La foto: marco de papel de 10 px y el circulito "VISA" arriba. */
  .pos-foto { position: relative; width: 100%; aspect-ratio: 4 / 5; box-sizing: border-box; overflow: hidden; border: 10px solid var(--pp-bg);
    background: repeating-linear-gradient(135deg, #3A4E68 0 8px, #2B3E58 8px 16px); }
  .pos-foto-capa { position: absolute; inset: 0; }
  .pos-foto-revelado { position: absolute; inset: 0; z-index: 1; pointer-events: none;
    background-image: radial-gradient(var(--pp-ink) calc(var(--pos-punto, 7.2) * 1px), transparent calc(var(--pos-punto, 7.2) * 1px + .6px));
    background-size: 10px 10px; }
  .pos-foto-visa { position: absolute; left: 14px; top: 14px; z-index: 2; width: 60px; height: 60px; border: 2px solid var(--pp-acc); border-radius: 50%;
    display: flex; align-items: center; justify-content: center; transform: rotate(-12deg); text-align: center; line-height: 1.1;
    font-family: var(--pos-serif), 'Alfa Slab One', cursive; font-size: 11px; color: var(--pp-acc); }
  .pos-foto-etq { position: absolute; left: 14px; bottom: 12px; z-index: 2; font-weight: 700; font-size: 12px; letter-spacing: .2em; text-transform: uppercase; color: var(--pp-bg); }

  /* ── 02 Falta poco: el panel de salidas ────────────────────────────── */
  .pos-countdown { background: var(--pos-panel) !important; color: var(--pos-acc3) !important; justify-content: space-between; padding-left: 0; padding-right: 0; }
  .pos-countdown > .pos-folio, .pos-countdown > .pos-spread { margin-left: max(20px, calc((100% - 1100px) / 2)); margin-right: max(20px, calc((100% - 1100px) / 2)); }
  .pos-marquesina { position: relative; z-index: 1; overflow: hidden; padding: 8px 0; white-space: nowrap; font-weight: 700; font-size: 12px; letter-spacing: .22em; text-transform: uppercase; }
  .pos-marquesina--acento { background: var(--pp-acc); color: var(--pp-bg); font-family: var(--pos-serif), 'Alfa Slab One', cursive; font-weight: 400; font-size: 20px; letter-spacing: .04em; }
  .pos-marquesina--filete { border-top: 1px solid var(--pos-acc3); border-bottom: 1px solid var(--pos-acc3); }
  .pos-marquesina-tira { display: flex; width: max-content; animation: posCorre 16s linear infinite; }
  .pos-marquesina-tira > span { padding-right: 32px; }
  .pos-marquesina--contraria .pos-marquesina-tira { animation-direction: reverse; }
  @keyframes posCorre { to { transform: translate3d(-50%, 0, 0); } }
  /* Las fichas split-flap: caja oscura con la línea partida al medio; al
     cambiar, la cifra nueva baja girando desde arriba. */
  .pos-cuenta { display: grid; grid-template-columns: 1fr 1fr; gap: 3px; background: var(--pp-ink); padding: 3px; }
  .pos-cuenta-caja { position: relative; background: var(--pos-panel); padding: 18px 14px 14px; display: flex; flex-direction: column; gap: 8px; overflow: hidden; }
  .pos-cuenta-num { position: relative; display: block; background: var(--pos-flap); border-radius: 6px; perspective: 400px; text-align: center;
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--pos-acc3) 25%, transparent);
    font-family: var(--pos-mono), 'JetBrains Mono', monospace; font-weight: 700; font-size: clamp(52px, 17vw, 120px); line-height: 1.1; color: var(--pos-acc3); }
  .pos-cuenta-num::after { content: ""; position: absolute; left: 0; right: 0; top: 50%; height: 2px; margin-top: -1px; background: var(--pos-panel); }
  .pos-cuenta-num > span { display: block; transform-origin: 50% 50%; animation: posFlap 240ms ease-out; }
  @keyframes posFlap { from { transform: rotateX(-90deg); } to { transform: rotateX(0); } }
  .pos-cuenta-etq { font-weight: 700; font-size: 11px; letter-spacing: .24em; text-transform: uppercase; color: var(--pp-bg); }
  .pos-tarjeta--hoy { background: var(--pos-flap); border-radius: 6px; padding: 18px; display: flex; flex-direction: column; gap: 8px; }
  .pos-tarjeta--hoy .pos-tarjeta-kicker { font-weight: 700; font-size: 11px; letter-spacing: .24em; text-transform: uppercase; color: var(--pp-bg); }
  .pos-tarjeta--hoy .pos-tarjeta-titulo { font-family: var(--pos-serif), 'Alfa Slab One', cursive; font-size: clamp(30px, 8vw, 60px); line-height: 1.05; color: var(--pos-acc3); }

  /* ── 03 Unas palabras: el dorso de la postal ───────────────────────── */
  .pos-frase-seccion { justify-content: space-between; gap: 30px; }
  .pos-rayado { position: absolute; inset: 0; pointer-events: none; opacity: .6; background: repeating-linear-gradient(180deg, transparent 0 39px, color-mix(in srgb, var(--pp-ink) 14%, transparent) 39px 40px); }
  .pos-frase { margin: 0; font-size: clamp(26px, 7vw, 56px); line-height: 1.15; max-width: 16ch; }
  .pos-nota { align-self: flex-end; display: flex; align-items: center; gap: 12px; background: #FFFFFF; border: 1px solid var(--pp-ink); padding: 12px 16px; max-width: 320px;
    font-weight: 600; font-size: 14px; line-height: 1.4; animation: posFlota 4s ease-in-out infinite; }
  .pos-nota-avion { width: 34px; height: 34px; border: 2px solid var(--pp-acc); border-radius: 50%; flex: 0 0 auto; display: flex; align-items: center; justify-content: center;
    font-family: var(--pos-serif), 'Alfa Slab One', cursive; font-size: 12px; color: var(--pp-acc); }
  @keyframes posFlota { 0%, 100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-8px) rotate(2deg); } }

  /* ── 04 Paneles: etiquetas de valija ───────────────────────────────── */
  .pos-pan { position: relative; z-index: 1; height: calc(100vh + var(--st-pasos, 2) * 90vh); }
  .pos-pan-fijo { position: sticky; top: 0; height: calc(var(--vh, 1vh) * 100); overflow: hidden; background: var(--pp-bg); }
  .pos-pan-fijo--album { background: #F7F5F0; }
  .pos-tira { position: absolute; top: 0; left: 0; height: 100%; display: flex; will-change: transform; }
  .pos-panel { flex: 0 0 100vw; min-width: 0; height: 100%; box-sizing: border-box; position: relative; overflow: hidden;
    display: flex; flex-direction: column; justify-content: space-between; gap: 18px;
    padding: 60px max(20px, calc((100vw - 1100px) / 2)) 92px; background: var(--pp-bg); color: var(--pp-ink); }
  .pos-panel--tinta { background: var(--pp-ink); color: var(--pp-bg); }
  .pos-panel--teal { background: var(--pp-acc2); color: #FFFFFF; }
  .pos-panel--teal > .pos-folio { color: #FFFFFF; }
  .pos-pan[data-scroll="vertical"] { height: auto; }
  .pos-pan[data-scroll="vertical"] .pos-pan-fijo { position: static; height: auto; overflow: visible; }
  .pos-pan[data-scroll="vertical"] .pos-tira { position: static; display: block; width: 100%; transform: none !important; }
  .pos-pan[data-scroll="vertical"] .pos-panel { height: auto; min-height: calc(var(--vh, 1vh) * 100); }
  /* La etiqueta de valija: blanca, con las esquinas desparejas y el ojal. */
  .pos-etiqueta-valija { position: relative; background: #FFFFFF; color: var(--pp-ink); border: 2px solid var(--pp-ink); border-radius: 8px 24px 8px 24px;
    padding: 16px 18px; display: flex; flex-direction: column; gap: 8px; }
  .pos-ojal { position: absolute; left: -10px; top: 16px; width: 16px; height: 16px; border-radius: 50%; background: var(--pp-bg); border: 2px solid var(--pp-ink); box-sizing: border-box; }
  .pos-panel--tinta .pos-ojal { background: var(--pp-ink); }
  .pos-panel--teal .pos-ojal { background: var(--pp-acc2); }
  .pos-linea { display: flex; justify-content: space-between; gap: 14px; padding: 8px 0; border-bottom: 1px dashed currentColor; font-size: 15px; line-height: 1.3; }
  .pos-linea > span:first-child { font-weight: 700; font-size: 11px; letter-spacing: .18em; text-transform: uppercase; opacity: .7; flex: 0 0 auto; padding-top: 2px; }
  .pos-linea > span:last-child { text-align: right; font-weight: 700; }
  .pos-mapa { height: 190px; overflow: hidden; border: 1px solid var(--pp-ink); border-radius: 6px; }
  .pos-puntos { position: absolute; left: 0; right: 40px; bottom: 30px; display: flex; gap: 8px; justify-content: center; z-index: 2; }
  .pos-punto { width: 24px; height: 3px; background: currentColor !important; opacity: .3; transition: opacity 300ms ease; display: inline-block; }
  .pos-punto[data-activo="1"] { opacity: 1; }

  /* ── 05 Check-in: la tarjeta de embarque ───────────────────────────── */
  .pos-checkin { background: var(--pp-acc2) !important; color: #FFFFFF !important; }
  .pos-cupon { position: relative; background: #FFFFFF; color: var(--pp-ink); border-radius: 6px; padding: 20px; display: flex; flex-direction: column; gap: 14px; overflow: hidden; }
  /* La línea de troquel con los dos círculos en las puntas, a la altura
     del renglón de estado. */
  .pos-troquel { position: absolute; left: -10px; right: -10px; top: 62px; display: flex; align-items: center; gap: 6px; pointer-events: none; }
  .pos-troquel > span:first-child, .pos-troquel > span:last-child { width: 20px; height: 20px; border-radius: 50%; background: var(--pp-acc2); }
  .pos-troquel > span:nth-child(2) { flex: 1; border-top: 2px dashed var(--pp-ink); }
  .pos-cupon .pos-tarjeta { position: relative; display: flex; flex-direction: column; gap: 14px; background: transparent; border: 0; padding: 0; transform: none !important; }
  .pos-talon-top { display: flex; justify-content: space-between; align-items: center; gap: 10px; font-weight: 700; font-size: 11px; letter-spacing: .2em; text-transform: uppercase; padding-bottom: 18px; }
  .pos-talon-estado { transition: color 400ms ease; }
  .pos-campo { display: flex; flex-direction: column; gap: 6px; }
  .pos-etiqueta { font-weight: 700; font-size: 11px; letter-spacing: .18em; text-transform: uppercase; opacity: .8; }
  .pos-input { min-height: 48px; border: 0; border-bottom: 2px solid var(--pp-ink); border-radius: 0; background: transparent; color: var(--pp-ink);
    font-family: var(--pos-sans), 'Work Sans', sans-serif; font-weight: 600; font-size: 15px; padding: 0; outline: none; }
  .pos-contador { display: flex; align-items: center; border-bottom: 2px solid var(--pp-ink); min-height: 48px; }
  .pos-contador button { width: 44px; min-height: 44px; border: 0; background: transparent; color: var(--pp-ink); cursor: pointer; font-size: 22px; line-height: 1; }
  .pos-contador button:disabled { opacity: .35; cursor: default; }
  .pos-contador > span { flex: 1; text-align: center; font-family: var(--pos-serif), 'Alfa Slab One', cursive; font-size: 24px; line-height: 1; color: var(--pp-acc); }
  .pos-filas { display: flex; flex-direction: column; }
  .pos-fila { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px dashed var(--pp-ink); font-size: 15px; }
  .pos-fila--ultima { border-bottom: 0; }
  .pos-fila-valor { text-align: right; font-weight: 700; }
  .pos-precio { display: flex; justify-content: space-between; gap: 12px; font-weight: 700; font-size: 12px; letter-spacing: .1em; text-transform: uppercase; opacity: .8; }
  .pos-precio-valor { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
  .pos-precio-total { font-family: var(--pos-serif), 'Alfa Slab One', cursive; font-size: 20px; line-height: 1; letter-spacing: 0; }
  .pos-precio-detalle { font-size: 11px; letter-spacing: .1em; }
  .pos-btn-solido { min-height: 54px; border: 0; background: var(--pp-acc); color: #FFFFFF; cursor: pointer;
    font-family: var(--pos-serif), 'Alfa Slab One', cursive; font-size: 16px; padding: 0 18px; transition: background 200ms ease; }
  @media (hover: hover) { .pos-btn-solido:hover { background: var(--pp-ink); } }
  .pos-btn-solido:disabled { opacity: .6; cursor: default; }
  .pos-btn-fantasma { min-height: 48px; border: 2px solid var(--pp-ink); background: transparent; color: var(--pp-ink); cursor: pointer;
    font-weight: 700; font-size: 13px; letter-spacing: .1em; padding: 0 18px; }
  .pos-error { margin: 0; font-weight: 700; font-size: 12px; color: var(--pp-acc); }
  /* El sello OK: anillo grueso en el acento sobre papel crema. */
  .pos-cupon .pos-sello { position: absolute; right: 12px; bottom: 78px; width: 128px; aspect-ratio: 1; border-radius: 50%; pointer-events: none;
    opacity: 0; transform: rotate(18deg) scale(1.9) translateY(-120px);
    background: var(--pp-bg); border: 6px solid var(--pp-acc); box-sizing: border-box;
    display: flex; align-items: flex-end; justify-content: center; padding-bottom: 14px;
    font-family: var(--pos-mono), 'JetBrains Mono', monospace; font-size: 8px; letter-spacing: .14em; color: var(--pp-acc); }
  .pos-cupon .pos-sello::before { content: "OK"; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
    font-family: var(--pos-serif), 'Alfa Slab One', cursive; font-size: 24px; letter-spacing: 0; color: var(--pp-ink); }
  .pos-petalos { display: none; }

  /* ── 06 Álbum: postales del viaje ──────────────────────────────────── */
  .pos-panel--album { background: #F7F5F0; color: #1E3A5F; justify-content: flex-start; gap: 14px; }
  .pos-panel--album-b { background: #EFEBE3; }
  .pos-postales { flex: 1; min-height: 0; display: grid; grid-template-columns: repeat(6, 1fr); grid-template-rows: repeat(3, 1fr); gap: 10px; max-width: 900px; }
  .pos-postal { position: relative; min-height: 0; perspective: 900px; cursor: pointer; }
  .pos-postal:nth-child(1) { transform: rotate(-1.5deg); }
  .pos-postal:nth-child(2) { transform: rotate(1.5deg); }
  .pos-postal:nth-child(3) { transform: rotate(-1deg); }
  .pos-postal:nth-child(4) { transform: rotate(2deg); }
  .pos-postal:nth-child(5) { transform: rotate(.5deg); }
  /* La tarjeta gira (rotateY 180°) cuando pasa por el centro: lo decide el
     motor con data-card. */
  .pos-postal-carta { position: absolute; inset: 0; transform-style: preserve-3d; transition: transform 600ms cubic-bezier(.16,1,.3,1); }
  .pos-postal-frente { position: absolute; inset: 0; border: 8px solid #FFFFFF; box-shadow: 0 0 0 1px #1E3A5F; backface-visibility: hidden; overflow: hidden;
    background: repeating-linear-gradient(135deg, #D7D1C4 0 8px, #E6E1D6 8px 16px); }
  .pos-postal-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
  .pos-bano { position: absolute; inset: 0; mix-blend-mode: multiply; opacity: 0; transition: opacity 200ms linear; }
  .pos-bano--1 { background: color-mix(in srgb, var(--pp-acc) 50%, transparent); }
  .pos-bano--2 { background: color-mix(in srgb, var(--pp-acc2) 50%, transparent); }
  .pos-bano--3 { background: color-mix(in srgb, var(--pos-acc3) 55%, transparent); }
  .pos-bano--4 { background: color-mix(in srgb, var(--pp-ink) 40%, transparent); }
  .pos-bano--5 { background: color-mix(in srgb, var(--pp-acc) 35%, transparent); }
  .pos-postal-n { position: absolute; left: 8px; bottom: 6px; z-index: 1; font-weight: 700; font-size: 11px; letter-spacing: .14em; color: #1E3A5F; }
  .pos-postal-dorso { position: absolute; inset: 0; background: #FFFDF6; box-shadow: 0 0 0 1px #1E3A5F; backface-visibility: hidden; transform: rotateY(180deg);
    padding: 8px 10px; box-sizing: border-box; display: grid; grid-template-columns: 1.1fr 1fr; gap: 8px; overflow: hidden; }
  .pos-postal-dorso-izq { display: flex; flex-direction: column; gap: 6px; padding-top: 6px; }
  .pos-postal-dorso-izq > span:first-child { font-family: var(--pos-mono), 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: .14em; color: #1E3A5F; }
  .pos-postal-dorso-izq > span:not(:first-child), .pos-postal-dorso-der > span:not(:first-child) { height: 1px; width: 100%; background: rgba(30,58,95,.35); }
  .pos-postal-dorso-der { border-left: 1px solid rgba(30,58,95,.35); padding-left: 8px; display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
  .pos-estampilla-chica { width: 26px; height: 32px; background: var(--pp-acc); border: 2px dashed #FFFDF6; outline: 2px solid var(--pp-acc); box-sizing: border-box; }
  .pos-postales[data-cantidad="5"] .pos-postal:nth-child(1) { grid-column: 1 / 4; grid-row: 1 / 3; }
  .pos-postales[data-cantidad="5"] .pos-postal:nth-child(2) { grid-column: 4 / 7; grid-row: 1 / 2; }
  .pos-postales[data-cantidad="5"] .pos-postal:nth-child(3) { grid-column: 4 / 6; grid-row: 2 / 3; }
  .pos-postales[data-cantidad="5"] .pos-postal:nth-child(4) { grid-column: 6 / 7; grid-row: 2 / 3; }
  .pos-postales[data-cantidad="5"] .pos-postal:nth-child(5) { grid-column: 1 / 7; grid-row: 3 / 4; }
  .pos-postales[data-cantidad="4"] .pos-postal:nth-child(1) { grid-column: 1 / 4; grid-row: 1 / 3; }
  .pos-postales[data-cantidad="4"] .pos-postal:nth-child(2) { grid-column: 4 / 7; grid-row: 1 / 2; }
  .pos-postales[data-cantidad="4"] .pos-postal:nth-child(3) { grid-column: 4 / 7; grid-row: 2 / 3; }
  .pos-postales[data-cantidad="4"] .pos-postal:nth-child(4) { grid-column: 1 / 7; grid-row: 3 / 4; }
  .pos-postales[data-cantidad="3"] .pos-postal:nth-child(1) { grid-column: 1 / 4; grid-row: 1 / 4; }
  .pos-postales[data-cantidad="3"] .pos-postal:nth-child(2) { grid-column: 4 / 7; grid-row: 1 / 3; }
  .pos-postales[data-cantidad="3"] .pos-postal:nth-child(3) { grid-column: 4 / 7; grid-row: 3 / 4; }
  .pos-postales[data-cantidad="2"] .pos-postal:nth-child(1) { grid-column: 1 / 4; grid-row: 1 / 4; }
  .pos-postales[data-cantidad="2"] .pos-postal:nth-child(2) { grid-column: 4 / 7; grid-row: 1 / 4; }
  .pos-postales[data-cantidad="1"] .pos-postal:nth-child(1) { grid-column: 1 / 7; grid-row: 1 / 4; }

  /* ── 07 Música: el anuncio de abordo ───────────────────────────────── */
  .pos-musica { color: #FFFFFF !important; }
  .pos-eq { display: flex; align-items: flex-end; gap: 6px; height: 40px; }
  .pos-eq span { width: 8px; height: 100%; transform-origin: bottom; animation: posEq 1.1s ease-in-out infinite; background: var(--pp-acc); }
  .pos-eq span:nth-child(2) { background: var(--pos-acc3); }
  .pos-eq span:nth-child(3) { background: var(--pp-acc2); }
  .pos-eq span:nth-child(4) { background: #FFFFFF; }
  @keyframes posEq { 0%, 100% { transform: scaleY(.3); } 50% { transform: scaleY(1); } }
  .pos-musica form.pos-tarjeta { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; transform: none !important; }
  .pos-musica .pos-etiqueta { display: none; }
  .pos-musica .pos-input { min-height: 48px; border: 2px solid #FFFFFF; background: transparent; color: #FFFFFF; padding: 0 14px; min-width: 0; }
  .pos-musica .pos-input::placeholder { color: rgba(255,255,255,.6); }
  .pos-musica .pos-error { grid-column: 1 / -1; color: var(--pos-acc3); }
  .pos-musica .pos-btn-solido { grid-column: 1 / -1; min-height: 50px; border: 2px solid var(--pp-acc); font-size: 15px; }
  @media (hover: hover) { .pos-musica .pos-btn-solido:hover { background: var(--pos-acc3); border-color: var(--pos-acc3); color: var(--pp-ink); } }
  .pos-lista { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
  .pos-lista-fila { display: flex; align-items: center; gap: 12px; padding: 10px 14px; background: var(--pos-panel); }
  .pos-lista-texto { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .pos-lista-tema { font-family: var(--pos-serif), 'Alfa Slab One', cursive; font-size: 16px; line-height: 1.1; }
  .pos-lista-quien { font-weight: 700; font-size: 12px; letter-spacing: .1em; text-transform: uppercase; color: var(--pos-acc3); }

  /* ── 08 Regalos: el fondo de viaje ─────────────────────────────────── */
  .pos-tarjeta--banco { --pos-neon: var(--pp-acc); position: relative; z-index: 1; background: #FFFFFF; color: var(--pp-ink); border: 2px solid var(--pp-ink);
    padding: 16px 18px; display: flex; flex-direction: column; gap: 10px; transform: none !important; }
  .pos-tarjeta--der { --pos-neon: var(--pp-acc2); }
  .pos-tarjeta--banco + .pos-tarjeta--banco { margin-top: 14px; }
  .pos-tarjeta-kicker { font-weight: 700; font-size: 11px; letter-spacing: .2em; text-transform: uppercase; color: var(--pos-neon); }
  .pos-tarjeta-mensaje { margin: 0; font-weight: 600; font-size: 14px; line-height: 1.5; opacity: .85; }
  .pos-fila-texto { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .pos-fila-etq { font-weight: 700; font-size: 10px; letter-spacing: .2em; text-transform: uppercase; opacity: .7; }
  .pos-fila-dato { font-weight: 600; font-size: 14px; overflow-wrap: anywhere; }
  .pos-fila--copiable:first-child { border-bottom: 1px dashed var(--pp-ink); }
  .pos-fila--copiable:first-child .pos-fila-dato { font-family: var(--pos-serif), 'Alfa Slab One', cursive; font-size: 18px; line-height: 1.1; color: var(--pos-neon); }
  .pos-tarjeta--banco .pos-fila--ultima { border-bottom: 0; font-weight: 600; font-size: 12px; letter-spacing: .1em; text-transform: uppercase; opacity: .7; }
  .pos-btn-copiar { flex: 0 0 auto; min-height: 44px; padding: 0 14px; border: 2px solid var(--pp-ink); background: transparent; color: var(--pp-ink); cursor: pointer;
    font-weight: 700; font-size: 11px; letter-spacing: .16em; text-transform: uppercase; }
  .pos-btn-copiar--hecho { background: var(--pp-ink); color: #FFFFFF; }

  /* ── 09 Trivia: la declaración de aduana ───────────────────────────── */
  .pos-quiz { background: var(--pos-acc3) !important; color: var(--pp-ink) !important; }
  .pos-quiz .pos-tarjeta { display: flex; flex-direction: column; gap: 12px; transform: none !important; }
  .pos-quiz .pos-tarjeta-kicker { align-self: flex-start; background: var(--pp-ink); color: #FFFFFF; font-weight: 700; font-size: 11px; letter-spacing: .2em; text-transform: uppercase; padding: 8px 16px; }
  .pos-quiz .pos-tarjeta-pregunta, .pos-quiz .pos-tarjeta-titulo { font-family: var(--pos-serif), 'Alfa Slab One', cursive; font-size: clamp(26px, 7vw, 56px); line-height: 1.08; max-width: 15ch; }
  .pos-quiz .pos-tarjeta-mensaje { margin: 0; font-weight: 600; font-size: 15px; }
  .pos-opciones { display: flex; flex-direction: column; gap: 10px; counter-reset: opcion; }
  .pos-opcion { min-height: 54px; border: 2px solid var(--pp-ink); background: #FFFFFF; color: var(--pp-ink); cursor: pointer; counter-increment: opcion;
    font-family: var(--pos-sans), 'Work Sans', sans-serif; font-weight: 600; font-size: 16px; text-align: left; padding: 0 18px;
    display: flex; justify-content: space-between; align-items: center; gap: 12px; transition: background 200ms ease, color 200ms ease; }
  .pos-opcion::after { content: counter(opcion, upper-alpha); font-family: var(--pos-serif), 'Alfa Slab One', cursive; font-size: 15px; }
  .pos-opcion--bien { background: var(--pp-acc2); color: #FFFFFF; }
  .pos-opcion--bien::after { content: "Correcta"; }
  .pos-opcion--mal { background: var(--pp-acc); color: #FFFFFF; }
  .pos-opcion--mal::after { content: "Casi"; }
  @media (min-width: 1024px) {
    .pos-quiz .pos-spread > .pos-tarjeta { grid-column: 1 / -1; max-width: none; justify-self: stretch; display: grid; grid-template-columns: 1fr 1fr; column-gap: 72px; align-items: center; }
    .pos-quiz .pos-tarjeta-kicker { grid-column: 1; justify-self: end; margin-right: auto; }
    .pos-quiz .pos-tarjeta-pregunta { grid-column: 1; max-width: 560px; justify-self: end; width: 100%; }
    .pos-quiz .pos-opciones { grid-column: 2; grid-row: 1 / span 2; max-width: 560px; width: 100%; }
  }

  /* ── 10 Tu pase: el boarding pass ──────────────────────────────────── */
  .pos-pase { justify-content: space-between; padding-bottom: calc(28px + env(safe-area-inset-bottom)); }
  .pos-pagina--boarding { align-items: flex-start; }
  .pos-boarding { position: relative; width: 100%; max-width: 420px; background: var(--pp-bg); color: var(--pp-ink); border-radius: 8px; padding: 16px 16px 16px 44px; box-sizing: border-box;
    display: grid; grid-template-columns: 1fr auto; gap: 14px; align-items: center; margin-bottom: 20px; }
  .pos-boarding-troquel { position: absolute; left: 30px; top: -8px; bottom: -8px; border-left: 2px dashed var(--pp-ink); opacity: .5; }
  .pos-boarding-talon { position: absolute; left: 0; top: 0; bottom: 0; width: 30px; display: flex; align-items: center; justify-content: center;
    writing-mode: vertical-rl; transform: rotate(180deg); font-size: 9px; letter-spacing: .3em; text-transform: uppercase; font-weight: 700; }
  .pos-boarding-datos { display: flex; flex-direction: column; gap: 10px; min-width: 0; }
  .pos-boarding-etqs { display: flex; justify-content: space-between; gap: 8px; font-size: 10px; letter-spacing: .2em; text-transform: uppercase; font-weight: 700; }
  .pos-boarding-fila { display: flex; justify-content: space-between; gap: 8px; align-items: baseline; }
  .pos-boarding-nombre { font-family: var(--pos-serif), 'Alfa Slab One', cursive; font-size: clamp(16px, 4.6vw, 22px); line-height: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .pos-boarding-asiento { font-family: var(--pos-serif), 'Alfa Slab One', cursive; font-size: clamp(22px, 6vw, 30px); line-height: 1; color: var(--pp-acc); }
  .pos-barras { width: 100%; height: 40px; display: block; color: var(--pp-ink); }
  .pos-boarding-codigo { font-family: var(--pos-mono), 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: .3em; }
  .pos-boarding-qr { position: relative; width: clamp(96px, 26vw, 130px); aspect-ratio: 1; background: #FFFFFF; padding: 8px; box-sizing: border-box; border: 1px solid var(--pp-ink); }
  .pos-boarding-qr .qr-ingreso, .pos-boarding-qr section { background: transparent !important; border: none !important; padding: 0 !important; }
  .pos-boarding-qr img, .pos-boarding-qr svg, .pos-boarding-qr canvas { width: 100% !important; height: auto !important; display: block; }
  .pos-boarding-qr p, .pos-boarding-qr h3, .pos-boarding-qr h4 { display: none; }
  .pos-pase-cabeza { display: flex; align-items: flex-end; justify-content: space-between; gap: 14px; }
  .pos-pase-numero, .pos-pase-mesa { display: flex; flex-direction: column; }
  .pos-pase-mesa { align-items: flex-end; text-align: right; }
  .pos-pase-numero > span:last-child { font-family: var(--pos-serif), 'Alfa Slab One', cursive; font-size: clamp(56px, 17vw, 130px); line-height: .95; color: var(--pp-acc); }
  .pos-pase-mesa > span:last-child { font-family: var(--pos-serif), 'Alfa Slab One', cursive; font-size: clamp(36px, 11vw, 80px); line-height: .95; color: var(--pp-acc2); }
  .pos-caja { display: flex; flex-direction: column; background: var(--pos-panel); padding: 6px 16px; }
  .pos-caja .pos-linea { border-bottom: 1px dashed color-mix(in srgb, var(--pp-bg) 30%, transparent); font-size: 14px; padding: 10px 0; }
  .pos-caja .pos-linea:last-child { border-bottom: 0; }
  .pos-caja .pos-linea > span:first-child { color: var(--pos-acc3); opacity: 1; letter-spacing: .16em; }
  .pos-caja .pos-linea > span:last-child { font-weight: 500; line-height: 1.35; }
  .pos-info-extra { margin-top: 4px; }
  .pos-info-extra #info-adicional { background: transparent !important; padding: 0 !important; }
  .pos-info-extra #ia-trigger-btn { background: transparent !important; color: var(--pos-acc3) !important; border: 2px solid var(--pos-acc3) !important;
    border-radius: 0 !important; font-weight: 700 !important; letter-spacing: .2em !important; text-transform: uppercase; }
  .pos-raiz .ia-icon-box, .pos-raiz svg.lucide { display: none !important; }
  .pos-pase-pie { display: flex; flex-direction: column; gap: 14px; }
  .pos-despedida { font-family: var(--pos-serif), 'Alfa Slab One', cursive; font-size: clamp(22px, 6vw, 38px); line-height: 1.1; color: var(--pp-acc); }
  .pos-replay { cursor: pointer; color: var(--pp-bg); }
  .pos-credito { display: inline-flex; opacity: .8; }

  /* ── La tapa: la postal ────────────────────────────────────────────── */
  .pos-portada { position: absolute; inset: 0; z-index: 5; overflow: hidden; background: var(--pp-bg); color: var(--pp-ink); }
  .pos-portada-hoja { position: absolute; inset: 0; display: grid; grid-template-rows: auto minmax(0, 1fr) auto; box-sizing: border-box;
    padding: calc(16px + env(safe-area-inset-top)) max(18px, calc((100% - 1100px) / 2)) calc(16px + env(safe-area-inset-bottom)); }
  /* El borde de correo aéreo: franjas a 45° en dos colores. */
  .pos-borde-aereo { position: absolute; inset: 0; pointer-events: none; z-index: 3; border: 12px solid transparent;
    border-image: repeating-linear-gradient(45deg, var(--pp-acc) 0 14px, var(--pp-bg) 14px 28px, var(--pp-acc2) 28px 42px, var(--pp-bg) 42px 56px) 12; }
  /* El mapa: curvas de nivel, la ruta punteada y el avión que la recorre. */
  .pos-mapa-fondo { position: absolute; inset: 0; pointer-events: none; overflow: hidden; opacity: .75; color: var(--pp-ink); }
  .pos-mapa-curvas { width: 100%; height: 100%; display: block; }
  .pos-ruta { position: absolute; inset: 0; width: 100%; height: 100%; }
  .pos-ruta-punto { fill: var(--pp-acc); }
  .pos-avion { position: absolute; left: 0; top: 0; width: clamp(34px, 9vw, 52px); height: auto; transform-origin: 50% 50%;
    offset-path: path('M -40 62 C 20 20, 60 20, 110 50 S 200 70, 260 30 S 380 10, 470 40'); offset-rotate: auto; animation: posVuela 14s linear infinite; }
  @keyframes posVuela { from { offset-distance: 0%; } to { offset-distance: 100%; } }
  .pos-folio--tapa { z-index: 3; }
  .pos-chip-borde { border: 1px solid var(--pp-ink); padding: 6px 12px; }
  .pos-tapa-centro { position: relative; z-index: 3; align-self: center; display: flex; flex-direction: column; align-items: center; gap: 10px; min-height: 0; text-align: center; }
  .pos-tapa-kicker { font-weight: 700; font-size: 12px; letter-spacing: .26em; text-transform: uppercase; }
  /* El nombre: Alfa Slab centrado; el renglón más largo manda el cuerpo. El
     "&" es una estampilla dentada (borde punteado crema y outline acento). */
  .pos-tapa-nombres { position: relative; margin: 0; line-height: .98; letter-spacing: 0; display: flex; flex-direction: column; align-items: center;
    font-size: min(clamp(44px, 15vw, 130px), 13vh, calc((100vw - 70px) / (var(--largo, 9) * 0.66))); }
  @media (min-width: 1024px) { .pos-tapa-nombres { font-size: min(11vw, 150px, 13vh, calc((min(100vw, 1100px) - 70px) / (var(--largo, 9) * 0.66))); } }
  .pos-tapa-linea { overflow: hidden; display: block; white-space: nowrap; }
  .pos-tapa-linea > span { display: block; }
  .pos-tapa-linea--amp { font-size: .32em; line-height: 1.5; padding: .2em 0; }
  .pos-estampilla-amp { display: inline-flex !important; align-items: center; justify-content: center; width: 2.4em; height: 2em; background: var(--pp-acc); color: var(--pp-bg);
    border: .12em dashed var(--pp-bg); outline: .12em solid var(--pp-acc); font-family: var(--pos-serif), 'Alfa Slab One', cursive; }
  /* El matasellos cae sobre el nombre 1,6 s después de que entra la tapa
     (scale 2,2 → 1, rotate 24 → −12°) con la tinta gastada. */
  .pos-matasellos { position: absolute; right: -6%; top: -12%; width: clamp(84px, 22vw, 130px); aspect-ratio: 1; z-index: 3; pointer-events: none; color: var(--pp-acc);
    opacity: 0; transform: rotate(24deg) scale(2.2); animation: posMatasellos 600ms cubic-bezier(.34,1.56,.64,1) 1.6s forwards; }
  .pos-matasellos svg { position: absolute; inset: 0; mix-blend-mode: multiply; }
  .pos-matasellos-arco { font-family: var(--pos-mono), 'JetBrains Mono', monospace; font-weight: 500; font-size: 8.6px; letter-spacing: 1.4px; fill: currentColor; }
  .pos-matasellos-centro { font-family: var(--pos-serif), 'Alfa Slab One', cursive; font-size: 13px; fill: currentColor; }
  .pos-matasellos-pie { font-family: var(--pos-mono), 'JetBrains Mono', monospace; font-size: 7px; letter-spacing: 1px; fill: currentColor; }
  @keyframes posMatasellos { from { opacity: 0; transform: rotate(24deg) scale(2.2); } 30% { opacity: 1; } to { opacity: 1; transform: rotate(-12deg) scale(1); } }
  .pos-tapa-datos { display: flex; justify-content: space-between; align-items: flex-end; gap: 14px; width: 100%; max-width: 520px; box-sizing: border-box;
    font-weight: 700; font-size: 13px; line-height: 1.35; text-align: left; border-top: 1px dashed var(--pp-ink); padding-top: 10px; }
  .pos-tapa-datos-der { text-align: right; }
  .pos-tapa-pie { position: relative; z-index: 3; display: flex; flex-direction: column; gap: 12px; align-items: center; text-align: center; }
  .pos-tapa-mensaje { margin: 0; font-weight: 600; font-size: clamp(14px, 3.8vw, 18px); line-height: 1.4; max-width: 34ch; }
  .pos-tapa-btn { min-height: 54px; width: 100%; max-width: 360px; border: 2px solid var(--pp-ink); background: var(--pp-ink); color: var(--pp-bg); cursor: pointer;
    font-family: var(--pos-serif), 'Alfa Slab One', cursive; font-size: 16px; letter-spacing: .04em; padding: 2px 22px 0;
    display: flex; align-items: center; justify-content: center; gap: 12px; transition: background 200ms ease, border-color 200ms ease; }
  @media (hover: hover) { .pos-tapa-btn:hover { background: var(--pp-acc); border-color: var(--pp-acc); } }

  /* ── Riel, pista y lupa ────────────────────────────────────────────── */
  .pos-riel { position: absolute; right: 0; top: 0; bottom: 0; width: 40px; z-index: 4; display: flex; flex-direction: column;
    align-items: center; justify-content: space-between; padding: calc(16px + env(safe-area-inset-top)) 0 calc(16px + env(safe-area-inset-bottom));
    opacity: 0; transition: opacity 600ms ease; pointer-events: none; border-left: 1px solid color-mix(in srgb, var(--pp-ink) 50%, transparent) !important; }
  .pos-riel-top { writing-mode: vertical-rl; font-family: var(--pos-serif), 'Alfa Slab One', cursive; font-size: 12px; color: var(--pp-ink) !important; }
  .pos-riel-etiqueta { writing-mode: vertical-rl; font-weight: 700; font-size: 10px; letter-spacing: .26em; text-transform: uppercase; color: var(--pp-ink); }
  .pos-riel-linea { flex: 1; width: 1px; margin: 16px 0; background: transparent !important; position: relative; }
  .pos-riel-barra { position: absolute; left: -2px; top: 0; width: 4px; height: 0%; background: var(--pp-acc); transition: height 200ms linear; display: block; }
  .pos-pista { position: absolute; left: 0; right: 40px; bottom: calc(18px + env(safe-area-inset-bottom)); z-index: 6; text-align: center;
    font-weight: 700; font-size: 11px; letter-spacing: .28em; color: var(--pp-ink);
    opacity: 0; transition: opacity 600ms ease; pointer-events: none; animation: posPista 2.4s ease-in-out infinite; }
  @keyframes posPista { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(6px); } }

  .pos-lupa { position: fixed; inset: 0; z-index: 200; background: color-mix(in srgb, var(--pp-ink) 94%, transparent);
    display: flex; align-items: center; justify-content: center; padding: 24px; cursor: zoom-out; }
  .pos-lupa-cerrar { position: absolute; top: 20px; right: 20px; width: 40px; height: 40px; border: 2px solid var(--pp-bg); border-radius: 50%;
    background: transparent; color: var(--pp-bg); font-size: 18px; line-height: 1; cursor: pointer; }
  .pos-lupa-img { max-width: 100%; max-height: 88vh; object-fit: contain; cursor: default; border: 8px solid #FFFFFF; box-shadow: 0 0 0 1px var(--pp-ink); }

  @media (prefers-reduced-motion: reduce) {
    .pos-raiz * { animation: none !important; }
    .pos-scroller [data-xin] { opacity: 1 !important; transform: none !important; }
    .pos-foto { --pos-punto: 0; }
    .pos-matasellos { opacity: 1; transform: rotate(-12deg) scale(1); }
    .pos-avion { offset-distance: 40%; }
  }
`;
