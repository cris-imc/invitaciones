"use client";

// GENERADO por scripts/gen-iconic-variants.js a partir de
// Y2kTemplate.tsx — no editar a mano: los cambios se pierden al regenerar.

/**
 * Y2K · Colección Iconic — sub-colección "Tipográfica Editorial"
 * Variante: Cielo.
 *
 * GENERADO por scripts/derivar-tipografica.js a partir de
 * EditorialBlancNoirTemplate.tsx — no editar a mano: el motor se arregla en
 * Editorial Blanc & Noir y se vuelve a derivar; lo propio de esta familia
 * está en scripts/familias/tipografica/y2k.json.
 *
 * PROVISORIO: todavía usa el render de Editorial. Falta portar el suyo
 * desde el mockup.
 *
 * El 2000: Baloo 2 inflado, Comfortaa para el texto y VT323 para los datos,
 * como la pantalla de un Tamagotchi. Todo burbuja y cromo.
 *
 * Sin imágenes propias: son fuentes y CSS.
 */

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Baloo_2, Comfortaa, VT323 } from "next/font/google";
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

const y2kSerif = Baloo_2({
  subsets: ["latin"],
  weight: ["400", "800"],
  display: "swap",
  variable: "--y2k-serif",
});
const y2kSans = Comfortaa({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--y2k-sans",
});
// El mono es la ficha técnica de la revista: folios, kickers y datos.
const y2kMono = VT323({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  variable: "--y2k-mono",
});

// ─── Paleta ─────────────────────────────────────────────────────────────────
// Las cinco variantes de "Capas de papel" cambian SOLO estos once colores
// (el script de variantes reemplaza este bloque entero, ver
// scripts/gen-capas-de-papel-variants.js). El dibujo es el mismo: los SVG de
// las escenas leen var(--pp-…), así que un cambio acá repinta cerros, cielo,
// sol y figuras de una sola vez.
const PALETA = {
  bg: "#E4F3FF",
  bg2: "#B5E1FF",
  ink: "#2A2340",
  ink2: "#6B6484",
  acc: "#3FA9FF",
  acc2: "#C9B8FF",
  sky1: "#E4F3FF",
  sky2: "#B5E1FF",
  hill1: "#B5E1FF",
  hill2: "#6B6484",
  hill3: "#2A2340",
  night: "#2A2340",
  nightInk: "#E4F3FF",
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

interface Y2kTemplateProps {
  invitation: Record<string, unknown>;
  guest?: GuestRecord | null;
  isPersonalized?: boolean;
}

/** El número de pase, con tres cifras como en el mockup ("PASE Nº 042"). */
function numeroDePase(orderNumber: number | undefined): string {
  return String(orderNumber ?? 42).padStart(3, "0");
}

export function Y2kTemplateCielo({ invitation, guest, isPersonalized = false }: Y2kTemplateProps) {
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
      el.style.setProperty("--y2k-y", `${dist}px`);
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
            el.style.setProperty("--y2k-y", "0px");
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
            ven.style.setProperty("--y2k-punto", (7.2 * (1 - t)).toFixed(2));
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
          clase: `${y2kSerif.variable} ${y2kSans.variable}`,
          fuente: "var(--y2k-sans), 'Comfortaa', cursive",
        }}
      />
    );
  }


  // El total de pliegos, para los folios ("03 / 10"). Se cuenta lo que esta
  // invitación realmente tiene: si no hay trivia, no existe el pliego 09 y el
  // pase deja de ser 10 de 10.
  const totalPliegos = cuenta;
  const folio = (n: string) => `${n} / ${String(totalPliegos).padStart(2, "0")}`;

  return (
    <div
      ref={raizRef}
      className={`${y2kSerif.variable} ${y2kSans.variable} ${y2kMono.variable} y2k-raiz`}
      style={varsDePaleta}
    >
      <style>{CSS_Y2K}</style>
      <style>{COVER_RESPONSIVE_STYLE}</style>

      <div ref={scrollerRef} className="y2k-scroller">
        {/* ── 01 Guardá la fecha ─────────────────────────────────────────
            El pliego se invierte: tinta sobre crema. La fecha ocupa la
            página izquierda en tres renglones que se cruzan, y la foto va
            enmarcada en la derecha. */}
        <section data-tone="dark" data-screen-label={tx("invitacion.saveTheDate.guardaLaFecha")} className="y2k-section y2k-std">
          <div className="y2k-trama y2k-trama--media" aria-hidden="true" />
          <div className="y2k-spread">
            <div className="y2k-pagina">
              <div className="y2k-folio">
                <span data-xin="1" data-dist="-40">{nSaveTheDate} — {tx("invitacion.saveTheDate.guardaLaFecha").toUpperCase()}</span>
                <span data-xin="1" data-dist="40">{folio(nSaveTheDate)}</span>
              </div>
              <div className="y2k-fecha">
                <span data-xin="1" data-dist="-160" className="y2k-fecha-linea">{diaNum}</span>
                <span data-xin="1" data-dist="160" data-delay="120" className="y2k-fecha-linea y2k-fecha-linea--acc">{mesLargo.slice(0, 3)}</span>
                <span data-xin="1" data-dist="-160" data-delay="240" className="y2k-fecha-linea">{anio}</span>
              </div>
              <div data-xin="1" data-delay="360" className="y2k-fecha-pie">
                <span>{diaSemana} · {hora} H</span>
                <AddToCalendarLink
                  eventName={titulo}
                  targetDate={fechaHora}
                  location={[lugarNombre, direccion].filter(Boolean).join(", ")}
                  className="y2k-link"
                  showIcon={false}
                >
                  {tx("invitacion.saveTheDate.agregarAlCalendario").toUpperCase()} ↗
                </AddToCalendarLink>
              </div>
            </div>

            {hayFoto && (
              <div ref={ventanaRef} data-xin="1" data-delay="200" data-dist="0" className="y2k-foto">
                {fotoMobile && (
                  <div className="acp-mobile-only y2k-foto-capa">
                    <AnimatedCoverPhoto photoSrc={fotoMobile} tint={false} effect="enfoque" scrimColorRgb="20,20,20" />
                  </div>
                )}
                {fotoDesktop && (
                  <div className="acp-desktop-only y2k-foto-capa">
                    <AnimatedCoverPhoto photoSrc={fotoDesktop} tint={false} effect="enfoque" scrimColorRgb="20,20,20" />
                  </div>
                )}
                {/* La trama que tapa la foto y se disuelve al subir: el radio
                    del punto lo mueve el motor en --y2k-punto. */}
                <span className="y2k-foto-revelado" aria-hidden="true" />
                <span className="y2k-foto-anio">{anio}</span>
                <span className="y2k-foto-pie">{tx("invitacion.album.nuestraFoto").toUpperCase()}</span>
              </div>
            )}
          </div>
        </section>

        {/* ── 02 Falta poco ──────────────────────────────────────────────
            Dos marquesinas que corren en sentidos opuestos y, entre ellas,
            las cuatro cifras. */}
        <section data-tone={TONO} data-screen-label={tx("invitacion.cuentaRegresiva.kicker")} className="y2k-section y2k-countdown">
          <div className="y2k-folio">
            <span data-xin="1" data-dist="-40">{nCountdown} — {tx("invitacion.cuentaRegresiva.faltan").toUpperCase()}</span>
            <span data-xin="1" data-dist="40">{folio(nCountdown)}</span>
          </div>
          <div className="y2k-marquesina" aria-hidden="true">
            <div className="y2k-marquesina-tira">
              {[0, 1].map((i) => (
                <span key={i}>
                  {[tx("invitacion.cuentaRegresiva.dias"), tx("invitacion.cuentaRegresiva.horas"), tx("invitacion.cuentaRegresiva.minutos"), tx("invitacion.cuentaRegresiva.segundos")].join(" · ")} · {fechaPuntos} ·&nbsp;
                </span>
              ))}
            </div>
          </div>
          <CuentaY2k targetDate={fechaHora} />
          <div className="y2k-marquesina y2k-marquesina--contraria" aria-hidden="true">
            <div className="y2k-marquesina-tira">
              {[0, 1].map((i) => (
                <span key={i}>
                  {[lugarNombre, ciudad, hora ? `${hora} H` : "", dressCode].filter(Boolean).join(" · ").toUpperCase()} ·&nbsp;
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── 03 Unas palabras ───────────────────────────────────────────
            El pliego del acento: la frase entra palabra por palabra y al
            lado va el sello con la firma. */}
        {hayFrase && (
          <section data-tone="dark" data-screen-label={tx("invitacion.frase.etiqueta")} className="y2k-section y2k-frase-seccion">
            <div className="y2k-folio">
              <span data-xin="1" data-dist="-40">{nFrase} — {tx("invitacion.frase.unasPalabras").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nFrase)}</span>
            </div>
            <div className="y2k-spread">
              <h2 ref={fraseRef} className="y2k-frase">
                {palabras.map((p, i) => (
                  // El espacio va fuera del span: el motor pone cada palabra
                  // en inline-block y un espacio adentro se colapsa a cero.
                  <span key={i}>
                    <span data-w="1" className={i >= desdeAcento ? "y2k-acento" : undefined}>{p}</span>{" "}
                  </span>
                ))}
              </h2>
              <div data-xin="1" data-delay="900" data-dist="60" className="y2k-sello">
                <span>{tx("invitacion.frase.conAmor")}</span>
              </div>
            </div>
            <div className="y2k-folio y2k-folio--pie">
              <span>{titulo.toUpperCase()}</span>
              <span>{fechaPuntos}</span>
            </div>
          </section>
        )}

        {/* ── 04 Cuándo y dónde ──────────────────────────────────────────
            Un pliego por lugar. Cada uno se lleva su tono: el salón sobre
            crema, la ceremonia sobre tinta y el cronograma sobre el acento. */}
        <div
          id="details"
          data-pan="1"
          data-scroll={scrollVertical || panelesLugar.length <= 1 ? "vertical" : "lateral"}
          data-screen-label={tx("invitacion.ubicacion.cuandoYDonde")}
          className="y2k-pan"
          style={{ "--st-pasos": Math.max(0, panelesLugar.length - 1) } as React.CSSProperties}
        >
          <div className="y2k-pan-fijo">
            <div data-strip="1" className="y2k-tira">
              <div data-tone={TONO} className="y2k-panel">
                <div className="y2k-folio">
                  <span>{nCuando} — {tx("invitacion.ubicacion.fiestaSalon").toUpperCase()}</span><span>{deLugar("recepcion")}</span>
                </div>
                <div className="y2k-spread">
                  <h2 className="y2k-panel-titulo">
                    {(lugarNombre || tx("invitacion.ubicacion.elLugar")).split(" ")[0]}
                    <br /><span className="y2k-acento">{(lugarNombre || "").split(" ").slice(1).join(" ") || ciudad}</span>
                  </h2>
                  <div className="y2k-lineas">
                    <div className="y2k-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{hora} h</span></div>
                    {direccion && <div className="y2k-linea"><span>{tx("invitacion.ubicacion.direccion")}</span><span>{direccion}</span></div>}
                    {dressCode && <div className="y2k-linea"><span>{tx("invitacion.ubicacion.dressCode")}</span><span>{dressCode}</span></div>}
                    {mapUrl && (
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="y2k-cta">
                        {tx("invitacion.ubicacion.comoLlegar")}<span className="y2k-cta-flecha">↗</span>
                      </a>
                    )}
                  </div>
                </div>
                <div className="y2k-folio y2k-folio--pie">
                  <span>{(ciudad || direccion).toUpperCase()}</span>
                  {!scrollVertical && panelesLugar.length > 1 && <span>{tx("invitacion.portada.segui").toUpperCase()} →</span>}
                </div>
              </div>

              {ceremoniaHabilitada && (
                <div id="ceremonia" data-tone="dark" className="y2k-panel">
                  <div className="y2k-folio">
                    <span>{nCuando} — {ceremoniaTitulo.toUpperCase()}</span><span>{deLugar("ceremonia")}</span>
                  </div>
                  <div className="y2k-spread">
                    <h2 className="y2k-panel-titulo">
                      {(ceremoniaNombre || ceremoniaTitulo).split(" ")[0]}
                      <br /><span className="y2k-acento">{(ceremoniaNombre || "").split(" ").slice(1).join(" ") || ceremoniaTitulo}</span>
                    </h2>
                    <div className="y2k-lineas">
                      {ceremoniaHora && <div className="y2k-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{ceremoniaHora} h</span></div>}
                      {ceremoniaDireccion && <div className="y2k-linea"><span>{tx("invitacion.ubicacion.direccion")}</span><span>{ceremoniaDireccion}</span></div>}
                    </div>
                  </div>
                  <div className="y2k-folio y2k-folio--pie">
                    <span>{tx("invitacion.ubicacion.ceremoniaCivil").toUpperCase()}</span>
                    {!scrollVertical && <span>{tx("invitacion.portada.segui").toUpperCase()} →</span>}
                  </div>
                </div>
              )}

              {hayComoLlegar && (
                <div id="location" data-tone={TONO} className="y2k-panel">
                  <div className="y2k-folio">
                    <span>{nCuando} — {tx("invitacion.ubicacion.comoLlegar").toUpperCase()}</span><span>{deLugar("llegar")}</span>
                  </div>
                  <div className="y2k-spread">
                    <h2 className="y2k-panel-titulo">
                      {tx("invitacion.ubicacion.comoLlegar")}
                    </h2>
                    <div className="y2k-lineas">
                      {embedMapUrl && (
                        <div className="y2k-mapa">
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
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="y2k-cta">
                        {tx("invitacion.ubicacion.abrirEnMapas")}<span className="y2k-cta-flecha">↗</span>
                      </a>
                    </div>
                  </div>
                  <div className="y2k-folio y2k-folio--pie">
                    <span>{[direccion, ciudad].filter(Boolean).join(" · ").toUpperCase()}</span>
                    {!scrollVertical && <span>{tx("invitacion.portada.segui").toUpperCase()} →</span>}
                  </div>
                </div>
              )}

              {cronograma.length > 0 && (
                <div id="schedule" data-tone="dark" className="y2k-panel y2k-panel--acento">
                  <div className="y2k-folio">
                    <span>{nCuando} — {tx("invitacion.ubicacion.cronograma").toUpperCase()}</span><span>{deLugar("cronograma")}</span>
                  </div>
                  <div className="y2k-spread">
                    <h2 className="y2k-panel-titulo">
                      {tx("invitacion.ubicacion.laNochePasoAPaso").split(",")[0]}
                      <br /><span className="y2k-acento y2k-acento--tinta">{tx("invitacion.ubicacion.laNochePasoAPaso").split(",").slice(1).join(",").trim()}</span>
                    </h2>
                    <div className="y2k-lineas">
                      {cronograma.map((item, i) => (
                        <div key={i} className="y2k-linea"><span>{item.time || ""}</span><span>{item.title}</span></div>
                      ))}
                    </div>
                  </div>
                  <div className="y2k-folio y2k-folio--pie">
                    <span>{fechaPuntos}</span>
                  </div>
                </div>
              )}
            </div>
            {!scrollVertical && panelesLugar.length > 1 && <Puntos cantidad={panelesLugar.length} />}
          </div>
        </div>

        {/* ── 05 Check-in ────────────────────────────────────────────────
            El cupón: papel blanco con borde grueso, línea de corte punteada
            y el estado arriba a la derecha. */}
        {rsvpHabilitado && (
          <section id="rsvp" data-tone={TONO} data-screen-label={tx("invitacion.rsvp.confirmar")} className="y2k-section y2k-checkin">
            <div className="y2k-folio">
              <span data-xin="1" data-dist="-40">{nCheckin} — CHECK-IN</span>
              <span data-xin="1" data-dist="40">{folio(nCheckin)}</span>
            </div>
            <div className="y2k-spread">
              <div className="y2k-pagina">
                <h2 data-xin="1" data-dist="-80" className="y2k-h2">
                  {tx("invitacion.rsvp.confirmaLinea1")}<br /><span className="y2k-acento">{tx("invitacion.rsvp.confirmaLinea2")}</span>
                </h2>
              </div>
              <div className="y2k-cupon">
                <span className="y2k-cupon-corte" aria-hidden="true" />
                <CheckinY2k
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
            Hoja de contactos: la grilla de seis columnas de una plancha de
            fotografía, con la tinta del acento por encima. */}
        {todasLasFotos.length > 0 && (
          <div
            id="album"
            data-pan="1"
            data-scroll={scrollVertical || hojasDeFotos.length <= 1 ? "vertical" : "lateral"}
            data-screen-label={tx("invitacion.album.titulo")}
            className="y2k-pan"
            style={{ "--st-pasos": Math.max(0, hojasDeFotos.length - 1) } as React.CSSProperties}
          >
            <div className="y2k-pan-fijo">
              <div data-strip="1" className="y2k-tira">
                {hojasDeFotos.map((hoja, iHoja) => (
                  <div key={iHoja} data-tone={TONO} className="y2k-panel y2k-panel--album">
                    <div className="y2k-folio">
                      <span>{nAlbum} — {tx("invitacion.album.titulo").toUpperCase()}</span>
                      <span>{tx("invitacion.album.hojaDeTotal", { n: String(iHoja + 1).padStart(2, "0"), total: String(hojasDeFotos.length).padStart(2, "0") }).toUpperCase()}</span>
                    </div>
                    {iHoja === 0 && (
                      <h2 className="y2k-h2 y2k-h2--album">
                        {tx("invitacion.album.titulo")} <span className="y2k-acento">{tx("invitacion.album.deFotos")}</span>
                      </h2>
                    )}
                    <div className="y2k-contactos" data-cantidad={hoja.length}>
                      {hoja.map((url, i) => (
                        <div
                          key={i}
                          className="y2k-contacto"
                          role="button"
                          tabIndex={0}
                          onClick={() => setFotoAmpliada(url)}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setFotoAmpliada(url); }}
                          aria-label={tx("invitacion.album.ampliarFoto", { n: i + 1 })}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="" loading="lazy" className="y2k-contacto-img" />
                          <span className="y2k-contacto-tinta" aria-hidden="true" />
                          <span className="y2k-contacto-n">{String(i + 1).padStart(2, "0")}</span>
                        </div>
                      ))}
                    </div>
                    <div className="y2k-folio y2k-folio--pie">
                      <span>{tx("invitacion.album.fotosSubidas", { n: todasLasFotos.length }).toUpperCase()}</span>
                      {!scrollVertical && hojasDeFotos.length > 1 && <span>{tx("invitacion.portada.segui").toUpperCase()} →</span>}
                    </div>
                  </div>
                ))}
              </div>
              {!scrollVertical && hojasDeFotos.length > 1 && <Puntos cantidad={hojasDeFotos.length} />}
            </div>
          </div>
        )}

        {/* ── 07 Música ──────────────────────────────────────────────────
            Pliego de tinta, con el ecualizador como única ilustración. */}
        {sugerenciaMusicaHabilitada && (
          <section id="songs" data-tone="dark" data-screen-label={tx("invitacion.musica.titulo")} className="y2k-section y2k-musica">
            <div className="y2k-folio">
              <span data-xin="1" data-dist="-40">{nMusica} — {tx("invitacion.musica.titulo").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nMusica)}</span>
            </div>
            <div className="y2k-spread">
              <div className="y2k-pagina">
                <h2 data-xin="1" data-dist="-80" className="y2k-h2">
                  {tituloEnDosLineas(tx("invitacion.sabor.preguntaCancionFaltar"), "y2k-acento")}
                </h2>
                <div data-xin="1" data-delay="120" className="y2k-eq" aria-hidden="true">
                  {[0, 1, 2, 3, 4, 5, 6].map((i) => <span key={i} style={{ animationDelay: `${i * 0.12}s` }} />)}
                </div>
              </div>
              <div className="y2k-pagina">
                <CancionesY2k
                  invitationId={String(invitation.id ?? "")}
                  guestToken={guest?.uniqueToken}
                  guestName={nombreInvitado || tx("invitacion.evento.invitado")}
                />
              </div>
            </div>
          </section>
        )}

        {/* ── 08 Regalos ─────────────────────────────────────────────────
            Las tarjetas bancarias son fichas blancas con borde grueso. */}
        {hayRegalos && (
          <section id="banco" data-tone={TONO} data-screen-label={tx("invitacion.regalos.titulo")} className="y2k-section y2k-regalos">
            <div className="y2k-folio">
              <span data-xin="1" data-dist="-40">{nRegalos} — {tx("invitacion.regalos.titulo").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nRegalos)}</span>
            </div>
            <div className="y2k-spread">
              <div className="y2k-pagina">
                <h2 data-xin="1" data-dist="-80" className="y2k-h2">
                  {tx("invitacion.regalos.siQueresLinea1")}<br /><span className="y2k-acento">{tx("invitacion.regalos.siQueresLinea2")}</span>
                </h2>
                {Boolean(invitation.regaloMensaje) && (
                  <p data-xin="1" data-delay="120" className="y2k-parrafo">{String(invitation.regaloMensaje)}</p>
                )}
              </div>
              <div className="y2k-pagina">
                {regaloHabilitado && (
                  <TarjetaBancaria
                    titulo={String(invitation.regaloTitulo || tx("invitacion.regalos.tituloEvento"))}
                    alias={String(invitation.regaloAlias || "")}
                    cbu={String(invitation.regaloCbu || "")}
                    banco={String(invitation.regaloBanco || "")}
                    titular={String(invitation.regaloTitular || "")}
                    retraso={180}
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
                  />
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── 09 Trivia ──────────────────────────────────────────────────
            El único pliego que va entero en el acento. */}
        {quizHabilitado && (
          <section id="quiz" data-tone="dark" data-screen-label="Quiz" className="y2k-section y2k-quiz">
            <div className="y2k-folio">
              <span data-xin="1" data-dist="-40">{nQuiz} — {tx("invitacion.quiz.kicker").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nQuiz)}</span>
            </div>
            <div className="y2k-spread">
              <div className="y2k-pagina">
                <h2 data-xin="1" data-dist="-80" className="y2k-h2">{triviaTitulo}</h2>
              </div>
              <div className="y2k-pagina">
                <TriviaY2k
                  preguntas={triviaPreguntas}
                  invitationId={String(invitation.id ?? "")}
                  guestToken={guest?.uniqueToken}
                  guestName={nombreInvitado || tx("invitacion.evento.invitado")}
                />
              </div>
            </div>
          </section>
        )}

        {/* ── 10 Tu pase ─────────────────────────────────────────────────
            La contratapa: el QR grande a la izquierda y los datos del pase
            a la derecha, con el sello girando. */}
        <section data-tone="dark" data-screen-label={tx("invitacion.pase.tuPase")} className="y2k-section y2k-pase">
          <div className="y2k-folio">
            <span data-xin="1" data-dist="-40">{nPase} — {tx("invitacion.pase.tuPase").toUpperCase()}</span>
            <span data-xin="1" data-dist="40">{folio(nPase)}</span>
          </div>
          <div className="y2k-spread">
            <div data-xin="1" data-dist="-60" className="y2k-pagina y2k-pagina--qr">
              <QrDeIngreso guest={guest as never} />
            </div>
            <div className="y2k-pagina">
              <div data-xin="1" data-delay="100" className="y2k-pase-cabeza">
                <div className="y2k-pase-numero">
                  <span className="y2k-folio-etq">{tx("invitacion.pase.pase").toUpperCase()} Nº</span>
                  <span>{pase}</span>
                </div>
                <Sello texto={`${titulo} · ${fechaPuntos} · `} />
              </div>
              <div className="y2k-lineas">
                <div className="y2k-linea"><span>{saludaAlInvitado ? tx("invitacion.pase.reservadoPara").toUpperCase() : tx("invitacion.evento.invitado").toUpperCase()}</span><span>{nombreInvitado || titulo}</span></div>
                {lugaresDelPase > 0 && (
                  <div className="y2k-linea"><span>{tx("invitacion.pase.lugares").toUpperCase()}</span><span>{lugaresDelPase}</span></div>
                )}
                {guest?.mesas && guest.mesas.length > 0 && (
                  <div className="y2k-linea"><span>{tx("invitacion.pase.tuMesa").toUpperCase()}</span><span>{guest.mesas.join(" · ")}</span></div>
                )}
                <div className="y2k-linea"><span>{tx("invitacion.ubicacion.horario").toUpperCase()}</span><span>{fechaPuntos} · {hora} H</span></div>
              </div>
              <div className="y2k-info-extra">
                <InfoAdicionalSection invitation={invitation} />
              </div>
            </div>
          </div>
          <div className="y2k-folio y2k-folio--pie">
            <span>{tx("invitacion.pase.noTransferible").toUpperCase()}</span>
            <span className="y2k-replay" role="button" tabIndex={0} onClick={volverAVerla} onKeyDown={(e) => { if (e.key === "Enter") volverAVerla(); }}>
              {tx("invitacion.portada.verAperturaOtraVez").toUpperCase()} ↺
            </span>
          </div>
          <div className="y2k-credito">
            <LogoFooterCredit bgColor="transparent" textColor={PALETA.bg} />
          </div>
        </section>
      </div>

      {/* ── Riel de progreso ───────────────────────────────────────────── */}
      <div ref={rielRef} className="y2k-riel">
        <span ref={rielTopRef} className="y2k-riel-top">{tx("invitacion.pase.numeroPase", { n: pase }).toUpperCase()}</span>
        <div ref={rielLineaRef} className="y2k-riel-linea">
          <span ref={rielBarraRef} className="y2k-riel-barra" />
        </div>
        <span ref={rielEtiquetaRef} className="y2k-riel-etiqueta">{tx("invitacion.saveTheDate.guardaLaFecha").toUpperCase()}</span>
      </div>

      {/* ── La portada ──────────────────────────────────────────────────
          Es la tapa de la revista y, a la vez, la bienvenida: dice de quién
          es la fiesta, cuándo, dónde y para cuántos. Por eso esta
          sub-colección no monta además la sección de Bienvenida: sería
          decir dos veces lo mismo, una arriba de la otra. */}
      <div ref={portadaRef} data-tone={TONO} className="y2k-portada">
        <div ref={escenaPortadaRef} className="y2k-portada-hoja">
          <div className="y2k-trama y2k-trama--tapa" aria-hidden="true" />

          <div data-cl="1" className="y2k-folio">
            <span>{tx(invitation.tipo === "CASAMIENTO" ? "invitacion.evento.nosCasamos" : invitation.tipo === "QUINCE_ANOS" ? "invitacion.evento.misQuinceAnos" : "invitacion.evento.teInvitamos").toUpperCase()}</span>
            <span>Nº 00 / {String(totalPliegos).padStart(2, "0")}</span>
          </div>

          <div data-cl="2" className="y2k-tapa-centro">
            <div className="y2k-tapa-fila">
              <span className="y2k-tapa-fecha">{diaSemana} {diaNum} · {mesLargo.toUpperCase()} · {anio}</span>
              <Sello texto={`${tx(invitation.tipo === "QUINCE_ANOS" ? "invitacion.evento.misQuinceAnos" : "invitacion.evento.nosCasamos")} · ${fechaPuntos} · `} amp />
            </div>
            <h1 ref={cartelRef} className="y2k-tapa-nombres">
              {saludaAlInvitado ? (
                <span className="y2k-tapa-linea"><span data-pieza="1">{nombreInvitado}</span></span>
              ) : (
                <>
                  <span className="y2k-tapa-linea"><span data-pieza="1">{nombre1}</span></span>
                  {nombre2 && (
                    <span className="y2k-tapa-linea y2k-tapa-linea--sangra">
                      <span data-pieza="1"><span className="y2k-acento">&amp;</span>{nombre2}</span>
                    </span>
                  )}
                </>
              )}
            </h1>
            <div className="y2k-folio">
              <span>{[lugarNombre, ciudad].filter(Boolean).join(" · ").toUpperCase()}</span>
              {isPersonalized && guest && (
                <span className="y2k-tapa-pase">
                  {tx("invitacion.pase.numeroPase", { n: pase }).toUpperCase()}<br />
                  {tx("invitacion.bienvenida.paraVarios", { cantidad: String(lugaresDelPase) }).toUpperCase()}
                </span>
              )}
            </div>
          </div>

          <div data-cl="3" className="y2k-tapa-pie">
            <span className="y2k-regla" aria-hidden="true" />
            <p className="y2k-tapa-mensaje">
              {saludaAlInvitado
                ? `${tx("invitacion.bienvenida.hola", { nombre: nombreInvitado })}. ${String(invitation.portadaMensaje || tx("invitacion.sabor.mensajeLoContamosNosotros"))}`
                : String(invitation.portadaMensaje || tx("invitacion.sabor.mensajeLoContamosNosotros"))}
            </p>
            <button type="button" onClick={abrir} className="y2k-tapa-btn">
              {tx("invitacion.portada.abrirInvitacion").toUpperCase()}
            </button>
          </div>
        </div>
      </div>

      <div ref={pistaRef} className="y2k-pista">{tx("invitacion.portada.desliza").toUpperCase()} ↓</div>

      {fotoAmpliada && (
        <div className="y2k-lupa" onClick={() => setFotoAmpliada(null)} onContextMenu={(e) => e.preventDefault()}>
          <button
            type="button"
            className="y2k-lupa-cerrar"
            onClick={(e) => { e.stopPropagation(); setFotoAmpliada(null); }}
            aria-label={tx("invitacion.cerrar")}
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fotoAmpliada} alt={tx("invitacion.album.fotoAmpliada")} className="y2k-lupa-img" draggable={false} onClick={(e) => e.stopPropagation()} />
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

/**
 * El sello circular: dos anillos y el texto siguiendo la circunferencia,
 * girando una vuelta cada 26 segundos. Es el único elemento de la
 * sub-colección que no es tipografía plana, y aparece dos veces: en la tapa
 * (con el & en el centro) y en la contratapa.
 */
function Sello({ texto, amp = false }: { texto: string; amp?: boolean }) {
  // El id del arco tiene que ser único por instancia: dos <textPath> que
  // apuntan al mismo id hacen que el segundo no se dibuje.
  const id = useId().replace(/:/g, "");
  return (
    <div className="y2k-sello-circular" aria-hidden="true">
      <svg viewBox="0 0 100 100">
        <defs>
          <path id={`arc-${id}`} d="M50 50 m -37 0 a 37 37 0 1 1 74 0 a 37 37 0 1 1 -74 0" fill="none" />
        </defs>
        <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="50" cy="50" r="27" fill="none" stroke="currentColor" strokeWidth="2" />
        <text>
          <textPath href={`#arc-${id}`}>{texto.toUpperCase().repeat(2).slice(0, 64)}</textPath>
        </text>
      </svg>
      {amp && <span className="y2k-sello-amp">&amp;</span>}
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
    <div className="y2k-puntos" aria-hidden="true">
      {Array.from({ length: cantidad }).map((_, i) => (
        <span key={i} data-dot={i} className="y2k-punto" style={{ background: i === 0 ? PALETA.acc : "rgba(43,42,51,.18)" }} />
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
function CuentaY2k({ targetDate }: { targetDate: Date }) {
  const tx = useTextos();
  const { time, isEventDay, isPast, hasEnded } = useCountdown(targetDate);

  if (isEventDay || hasEnded || isPast) {
    return (
      <div className="y2k-tarjeta y2k-tarjeta--hoy" data-xin="1" data-delay="80" data-dist="30">
        <span className="y2k-tarjeta-kicker">{tx("invitacion.cuentaRegresiva.kicker").toUpperCase()}</span>
        <span className="y2k-tarjeta-titulo">
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
    <div className="y2k-cuenta">
      {celdas.map((c, i) => (
        <div key={c.l} data-xin="1" data-delay={i * 100} data-dist={i % 2 === 0 ? -80 : 80} className={`y2k-cuenta-caja y2k-cuenta-caja--${i + 1}`}>
          <span className="y2k-cuenta-num"><span key={c.v}>{c.v}</span></span>
          <span className="y2k-cuenta-etq">{c.l.toUpperCase()}</span>
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
    <div className="y2k-fila y2k-fila--copiable">
      <div className="y2k-fila-texto">
        <span className="y2k-fila-etq">{etiqueta.toUpperCase()}</span>
        <span className="y2k-fila-dato">{valor}</span>
      </div>
      <button type="button" onClick={copiar} className={`y2k-btn-copiar${copiado ? " y2k-btn-copiar--hecho" : ""}`}>
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
      className={`y2k-tarjeta y2k-tarjeta--banco${dobleZ ? " y2k-doblez" : ""}${inclinada ? " y2k-tarjeta--der" : " y2k-tarjeta--izq"}`}
    >
      <span className="y2k-tarjeta-kicker">{titulo.toUpperCase()}</span>
      {mensaje && <p className="y2k-tarjeta-mensaje">{mensaje}</p>}
      <div className="y2k-filas">
        <FilaCopiable etiqueta="Alias" valor={alias} />
        <FilaCopiable etiqueta="CBU" valor={cbu} />
        {(banco || titular) && (
          <div className="y2k-fila y2k-fila--ultima">
            <span>{banco || tx("invitacion.regalos.banco")}</span>
            <span className="y2k-fila-valor">{titular}</span>
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
function CheckinY2k({
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
      <div data-xin="1" data-delay="140" data-dist="30" className="y2k-tarjeta y2k-tarjeta--izq">
        <p className="y2k-tarjeta-mensaje">{tx("invitacion.rsvp.graciasPorAvisarAcceso")}</p>
        <button type="button" className="y2k-btn-fantasma" onClick={() => setEstado("PENDING")}>
          {tx("invitacion.rsvp.cambieDeIdea").toUpperCase()}
        </button>
      </div>
    );
  }

  const confirmadoYa = estado === "CONFIRMED";

  return (
    <>
      <div ref={tarjetaRef} data-xin="1" data-delay="140" data-dist="30" className="y2k-tarjeta y2k-tarjeta--talon">
        <div className="y2k-talon-top">
          <span>{tx("invitacion.pase.numeroPase", { n: pase }).toUpperCase()}{guestName ? ` · ${guestName.toUpperCase()}` : ""}</span>
          <span ref={estadoRef} className="y2k-talon-estado">
            {confirmado || confirmadoYa ? tx("invitacion.pase.accesoConfirmado").toUpperCase() : tx("invitacion.pase.pendiente").toUpperCase()}
          </span>
        </div>

        {!confirmadoYa ? (
          <>
            {lugares > 1 && (
              <div className="y2k-campo">
                <label className="y2k-etiqueta">{tx("invitacion.rsvp.adultos").toUpperCase()}</label>
                <div className="y2k-contador">
                  <button type="button" onClick={() => setAdultos((v) => Math.max(1, v - 1))} disabled={adultos <= 1} aria-label="−">−</button>
                  <span>{adultos}</span>
                  <button type="button" onClick={() => setAdultos((v) => Math.min(maxAdultos, v + 1))} disabled={adultos >= maxAdultos} aria-label="+">+</button>
                </div>
              </div>
            )}
            {maxAdolescentes > 0 && (
              <div className="y2k-campo">
                <label className="y2k-etiqueta">{tx("invitacion.rsvp.adolescentes").toUpperCase()}</label>
                <div className="y2k-contador">
                  <button type="button" onClick={() => setAdolescentes((v) => Math.max(0, v - 1))} disabled={adolescentes <= 0} aria-label="−">−</button>
                  <span>{adolescentes}</span>
                  <button type="button" onClick={() => setAdolescentes((v) => Math.min(maxAdolescentes, v + 1))} disabled={adolescentes >= maxAdolescentes} aria-label="+">+</button>
                </div>
              </div>
            )}
            {maxNinos > 0 && (
              <div className="y2k-campo">
                <label className="y2k-etiqueta">{tx("invitacion.rsvp.ninos").toUpperCase()}</label>
                <div className="y2k-contador">
                  <button type="button" onClick={() => setNinos((v) => Math.max(0, v - 1))} disabled={ninos <= 0} aria-label="−">−</button>
                  <span>{ninos}</span>
                  <button type="button" onClick={() => setNinos((v) => Math.min(maxNinos, v + 1))} disabled={ninos >= maxNinos} aria-label="+">+</button>
                </div>
              </div>
            )}
            <div className="y2k-campo">
              <label className="y2k-etiqueta">{tx("invitacion.rsvp.restriccionAlimentaria").toUpperCase()}</label>
              <input
                value={dieta}
                onChange={(e) => setDieta(e.target.value)}
                placeholder="—"
                maxLength={120}
                className="y2k-input"
              />
            </div>
          </>
        ) : (
          <div className="y2k-filas">
            {lugares > 1 && adultos > 0 && <div className="y2k-fila"><span>{tx("invitacion.rsvp.adultos")}</span><span>{adultos}</span></div>}
            {adolescentes > 0 && <div className="y2k-fila"><span>{tx("invitacion.rsvp.adolescentes")}</span><span>{adolescentes}</span></div>}
            {ninos > 0 && <div className="y2k-fila"><span>{tx("invitacion.rsvp.ninos")}</span><span>{ninos}</span></div>}
            <div className="y2k-fila y2k-fila--ultima">
              <span>{tx("invitacion.rsvp.restriccionAlimentaria")}</span>
              <span className="y2k-fila-valor">{restricciones || dieta || "—"}</span>
            </div>
          </div>
        )}

        {hayPago && monto != null && !exento && (
          <div className="y2k-precio">
            <span>{estadoDePago === "PAID" ? tx("invitacion.pago.abonado") : tx("invitacion.pago.valor")}</span>
            <div className="y2k-precio-valor">
              <span className="y2k-precio-total">{formatearMoneda(totalAPagar)}</span>
              {usarTotalDelServidor && vistaDePago
                ? vistaDePago.lines.map((l, i) => <span key={i} className="y2k-precio-detalle">{l}</span>)
                : (
                  <>
                    {adultos > 0 && <span className="y2k-precio-detalle">{adultos} × {formatearMoneda(precioAdulto)}</span>}
                    {adolescentes > 0 && <span className="y2k-precio-detalle">{adolescentes} × {formatearMoneda(precioAdo)}</span>}
                    {ninos > 0 && <span className="y2k-precio-detalle">{ninos} × {formatearMoneda(precioNin)}</span>}
                  </>
                )}
            </div>
          </div>
        )}

        <div ref={selloRef} className="y2k-sello" aria-hidden="true">{tx("invitacion.pase.confirmado").toUpperCase()}</div>
        <div ref={petalosRef} className="y2k-petalos" aria-hidden="true" />
      </div>

      {error && <p className="y2k-error">{error}</p>}

      {!confirmadoYa ? (
        <>
          <button type="button" data-xin="1" data-delay="220" className="y2k-btn-solido" disabled={enviando} onClick={() => enviar("CONFIRMA")}>
            {enviando ? tx("invitacion.rsvp.guardando").toUpperCase() : tx("invitacion.rsvp.confirmarAsistencia").toUpperCase()}
          </button>
          <button type="button" data-xin="1" data-delay="280" className="y2k-btn-fantasma" disabled={enviando} onClick={() => enviar("NO_ASISTE")}>
            {tx("invitacion.rsvp.noVoyAPoderAsistir").toUpperCase()}
          </button>
        </>
      ) : (
        <button type="button" className="y2k-btn-fantasma" onClick={() => setEstado("PENDING")}>
          {tx("invitacion.rsvp.modificarAsistencia").toUpperCase()}
        </button>
      )}
    </>
  );
}

interface CancionItem { id: string; title: string; artist: string; guestName: string }

/** Sugerir una canción, en una tarjeta de papel con la lista debajo. */
function CancionesY2k({ invitationId, guestToken, guestName }: { invitationId: string; guestToken?: string; guestName: string }) {
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
      <form onSubmit={enviar} data-xin="1" data-delay="140" data-dist="30" className="y2k-tarjeta y2k-tarjeta--der">
        <div className="y2k-campo">
          <label className="y2k-etiqueta">{tx("invitacion.musica.tema").toUpperCase()}</label>
          <input value={tema} onChange={(e) => setTema(e.target.value)} placeholder={tx("invitacion.musica.nombreDeLaCancion")} maxLength={100} className="y2k-input y2k-input--serif" />
        </div>
        <div className="y2k-campo">
          <label className="y2k-etiqueta">{tx("invitacion.musica.artista").toUpperCase()}</label>
          <input value={artista} onChange={(e) => setArtista(e.target.value)} placeholder={tx("invitacion.musica.artista")} maxLength={80} className="y2k-input y2k-input--serif" />
        </div>
        {error && <p className="y2k-error">{error}</p>}
        <button type="submit" disabled={enviando} className="y2k-btn-solido y2k-btn-solido--tinta">
          {enviando ? tx("invitacion.musica.enviando").toUpperCase() : tx("invitacion.musica.sugeriUnaCancion").toUpperCase()}
        </button>
      </form>

      {canciones.length > 0 && (
        <div data-xin="1" data-delay="220" className="y2k-lista">
          {canciones.slice(0, 8).map((c) => (
            <div key={c.id} className="y2k-lista-fila">
              <div className="y2k-lista-texto">
                <span className="y2k-lista-tema">{c.title}</span>
                <span className="y2k-lista-quien">{c.artist} · {tx("invitacion.musica.sumadoPor")} {c.guestName || tx("invitacion.evento.invitado")}</span>
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
function TriviaY2k({ preguntas, invitationId, guestToken, guestName }: { preguntas: QuizPregunta[]; invitationId: string; guestToken?: string; guestName: string }) {
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
      <div data-xin="1" data-delay="140" data-dist="30" className="y2k-tarjeta y2k-tarjeta--izq">
        <span className="y2k-tarjeta-kicker">{tx("invitacion.quiz.kicker").toUpperCase()}</span>
        <span className="y2k-tarjeta-titulo">
          {guardando ? tx("invitacion.rsvp.guardando") : tx("invitacion.quiz.respondisteCorrectamente", { aciertos: puntaje, total: preguntas.length })}
        </span>
        {!guardando && stats && stats.count > 0 && (
          <p className="y2k-tarjeta-mensaje">{tx("invitacion.quiz.promedio", { n: stats.count, avg: stats.avg })}</p>
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
    <div data-xin="1" data-delay="140" data-dist="30" className="y2k-tarjeta y2k-tarjeta--izq">
      <span className="y2k-tarjeta-kicker">{tx("invitacion.quiz.preguntaDeTotal", { n: indice + 1, total: preguntas.length }).toUpperCase()}</span>
      <span className="y2k-tarjeta-pregunta">{q.pregunta}</span>
      <div className="y2k-opciones">
        {q.opciones.map((op, oi) => {
          let clase = "";
          if (yaEligio && correcta !== undefined) {
            if (oi === correcta) clase = " y2k-opcion--bien";
            else if (elegidas[indice] === oi) clase = " y2k-opcion--mal";
          }
          return (
            <button key={oi} type="button" disabled={yaEligio} onClick={() => elegir(oi)} className={`y2k-opcion${clase}`}>
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
// leen la Bienvenida y el Post-evento compartidos (esperan `y2k-section` y
// `y2k-kicker`).
const CSS_Y2K = `
  /* ── Tipográfica Editorial ────────────────────────────────────────────
     Acá no hay dibujo: hay tipografía, filetes y trama. Cada sección es un
     pliego de revista -- folio arriba, spread de dos páginas, titular que
     ocupa lo que quiera -- y el color aparece como fondo de página entera o
     en una palabra, nunca como adorno. */
  .y2k-raiz { position: fixed; inset: 0; width: 100%; height: calc(var(--vh, 1vh) * 100); overflow: hidden;
    background: var(--pp-bg); color: var(--pp-ink); font-family: var(--y2k-sans), 'Comfortaa', cursive; }
  .y2k-raiz a { color: inherit; text-decoration: none; }
  .y2k-raiz button { font: inherit; }

  .y2k-scroller { position: absolute; inset: 0; overflow-y: auto; overflow-x: hidden; opacity: 0;
    transition: opacity 900ms ease 260ms; scrollbar-width: none; }
  .y2k-scroller::-webkit-scrollbar { width: 0; height: 0; }

  /* La trama de semitono: puntos de imprenta. Es la única textura de la
     sub-colección, y es un gradiente -- no pesa nada y escala sola. */
  .y2k-trama { position: absolute; inset: 0; pointer-events: none; z-index: 0; opacity: .16; color: currentColor;
    background-image: radial-gradient(currentColor 1.1px, transparent 1.2px); background-size: 9px 9px; }
  .y2k-trama--media { opacity: .14; bottom: 45%; background-size: 12px 12px; }
  .y2k-trama--tapa { -webkit-mask-image: linear-gradient(180deg, transparent 30%, #000 100%);
    mask-image: linear-gradient(180deg, transparent 30%, #000 100%); }

  /* ── El pliego ─────────────────────────────────────────────────────── */
  .y2k-section { position: relative; z-index: 1; min-height: calc(var(--vh, 1vh) * 100); box-sizing: border-box;
    display: flex; flex-direction: column; justify-content: space-between; gap: 26px;
    padding: 64px max(22px, calc((100% - 1100px) / 2)) 80px; background: var(--pp-bg); color: var(--pp-ink); }
  .y2k-section[data-tone="dark"] { background: var(--pp-ink); color: var(--pp-bg); }

  /* El folio: el renglón de arriba y el de abajo de cada pliego. */
  .y2k-folio { position: relative; z-index: 1; display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;
    font-family: var(--y2k-mono), 'VT323', monospace; font-size: 11px; letter-spacing: .22em;
    color: color-mix(in srgb, currentColor 62%, transparent); }
  .y2k-folio--pie { align-items: center; margin-top: auto; }
  .y2k-folio-etq { font-family: var(--y2k-mono), 'VT323', monospace; font-size: 11px; letter-spacing: .22em;
    color: color-mix(in srgb, currentColor 62%, transparent); display: block; }

  /* El spread: dos páginas. En el teléfono van una abajo de la otra; desde
     900 px se abren de verdad, como una revista apoyada. */
  .y2k-spread { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 24px; }
  .y2k-pagina { display: flex; flex-direction: column; gap: 16px; min-width: 0; }
  @media (min-width: 900px) {
    .y2k-spread { flex-direction: row; align-items: flex-start; gap: 40px; }
    .y2k-spread > * { flex: 1 1 0; min-width: 0; }
  }

  /* ── Tipos ─────────────────────────────────────────────────────────── */
  .y2k-h2, .y2k-panel-titulo, .y2k-frase {
    position: relative; z-index: 1; margin: 0; font-family: var(--y2k-serif), 'Baloo 2', cursive;
    font-weight: 400; line-height: .94; letter-spacing: -.035em; }
  .y2k-h2 { font-size: clamp(40px, 12vw, 96px); }
  .y2k-h2--album { font-size: clamp(34px, 9vw, 64px); }
  .y2k-panel-titulo { font-size: clamp(48px, 15vw, 130px); }
  .y2k-frase { font-size: clamp(30px, 8vw, 68px); line-height: 1.04; text-wrap: pretty; }
  .y2k-acento { font-style: italic; color: var(--pp-acc); }
  .y2k-acento--tinta { color: var(--pp-ink); }
  .y2k-parrafo { margin: 0; font-size: 15px; line-height: 1.5; max-width: 34ch;
    color: color-mix(in srgb, currentColor 72%, transparent); }
  .y2k-link { display: inline-flex; align-items: center; min-height: 28px; border-bottom: 2px solid var(--pp-acc); padding-bottom: 2px; }
  .y2k-regla { display: block; height: 2px; background: currentColor; }

  /* ── 01 Guardá la fecha ────────────────────────────────────────────── */
  .y2k-std { justify-content: center; }
  .y2k-fecha { display: flex; flex-direction: column; font-family: var(--y2k-serif), 'Baloo 2', cursive;
    line-height: .82; letter-spacing: -.04em; }
  .y2k-fecha-linea { font-size: clamp(64px, 22vw, 180px); text-transform: lowercase; }
  .y2k-fecha-linea--acc { font-style: italic; color: var(--pp-acc); text-align: right; }
  .y2k-fecha-pie { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 10px;
    font-family: var(--y2k-mono), 'VT323', monospace; font-size: 13px; letter-spacing: .12em; }
  /* La foto va enmarcada como una foto de tapa, con el año encima. */
  .y2k-foto { position: relative; width: 100%; aspect-ratio: 4 / 5; border: 3px solid currentColor; box-sizing: border-box;
    overflow: hidden; background: repeating-linear-gradient(135deg, color-mix(in srgb, currentColor 12%, transparent) 0 8px, transparent 8px 16px); }
  .y2k-foto-capa { position: absolute; inset: 0; }
  /* La trama que tapa la foto y se disuelve: el punto arranca en 7,2 (tapa
     entera, porque la baldosa es de 10) y el motor lo lleva a 0 al subir. */
  .y2k-foto-revelado { position: absolute; inset: 0; z-index: 1; pointer-events: none;
    background-image: radial-gradient(var(--pp-ink) calc(var(--y2k-punto, 7.2) * 1px), transparent calc(var(--y2k-punto, 7.2) * 1px + .6px));
    background-size: 10px 10px; }
  .y2k-foto-anio { position: absolute; right: 12px; top: 8px; z-index: 2; font-family: var(--y2k-serif), 'Baloo 2', cursive;
    font-style: italic; font-size: 34px; line-height: 1; color: var(--pp-acc); }
  .y2k-foto-pie { position: absolute; left: 14px; bottom: 12px; z-index: 2; font-family: var(--y2k-mono), 'VT323', monospace;
    font-size: 11px; letter-spacing: .2em; color: color-mix(in srgb, currentColor 80%, transparent); }

  /* ── 02 Falta poco: dos marquesinas y cuatro cifras ────────────────── */
  .y2k-countdown { justify-content: space-between; }
  .y2k-marquesina { position: relative; z-index: 1; overflow: hidden; border-top: 2px solid currentColor; border-bottom: 2px solid currentColor;
    padding: 8px 0; font-family: var(--y2k-mono), 'VT323', monospace; font-size: 12px; letter-spacing: .2em; text-transform: uppercase; }
  .y2k-marquesina-tira { display: flex; width: max-content; animation: ebnCorre 26s linear infinite; }
  .y2k-marquesina--contraria .y2k-marquesina-tira { animation-direction: reverse; }
  @keyframes ebnCorre { to { transform: translateX(-50%); } }

  /* Las cuatro cifras en dos por dos, con una cruz de filetes entre ellas:
     la primera lleva filete a la derecha y abajo, la segunda sólo abajo, la
     tercera sólo a la derecha y la cuarta ninguno. Los segundos van en
     itálica y en el acento, que es lo único que se mueve de la página. */
  .y2k-cuenta { position: relative; z-index: 1; display: grid; grid-template-columns: 1fr 1fr; }
  .y2k-cuenta-caja { display: flex; flex-direction: column; gap: 6px; padding: 18px 14px 20px; overflow: hidden; }
  .y2k-cuenta-caja:nth-child(1) { border-right: 2px solid currentColor; border-bottom: 2px solid currentColor; }
  .y2k-cuenta-caja:nth-child(2) { border-bottom: 2px solid currentColor; }
  .y2k-cuenta-caja:nth-child(3) { border-right: 2px solid currentColor; }
  .y2k-cuenta-num, .y2k-cuenta-dias, .y2k-cifra { font-family: var(--y2k-serif), 'Baloo 2', cursive; font-weight: 400;
    font-size: clamp(64px, 20vw, 150px); line-height: .82; letter-spacing: -.04em; font-variant-numeric: tabular-nums; }
  .y2k-cuenta-caja:nth-child(4) .y2k-cuenta-num { font-style: italic; color: var(--pp-acc); }
  .y2k-cuenta-etq { font-family: var(--y2k-mono), 'VT323', monospace; font-size: 11px; letter-spacing: .24em;
    text-transform: uppercase; color: var(--pp-acc); }
  .y2k-cuenta-aviso { display: flex; flex-direction: column; gap: 8px; }

  /* ── 03 Unas palabras ──────────────────────────────────────────────── */
  .y2k-frase-seccion { background: var(--pp-acc) !important; color: var(--pp-bg); }
  .y2k-frase-seccion .y2k-acento { color: var(--pp-bg); font-style: italic; }
  .y2k-sello { align-self: flex-start; border: 2px solid currentColor; padding: 10px 16px; transform: rotate(-3deg);
    font-family: var(--y2k-mono), 'VT323', monospace; font-size: 12px; letter-spacing: .2em; text-transform: uppercase; }

  /* ── Paneles ───────────────────────────────────────────────────────── */
  .y2k-pan { position: relative; z-index: 1; height: calc(100vh + var(--st-pasos, 2) * 90vh); }
  .y2k-pan-fijo { position: sticky; top: 0; height: calc(var(--vh, 1vh) * 100); overflow: hidden; background: var(--pp-bg); }
  .y2k-tira { position: absolute; top: 0; left: 0; height: 100%; display: flex; will-change: transform; }
  .y2k-panel { flex: 0 0 100vw; min-width: 0; height: 100%; box-sizing: border-box; position: relative; overflow: hidden;
    display: flex; flex-direction: column; justify-content: space-between; gap: 24px;
    padding: 64px max(22px, calc((100vw - 1100px) / 2)) 80px; background: var(--pp-bg); color: var(--pp-ink); }
  .y2k-panel[data-tone="dark"] { background: var(--pp-ink); color: var(--pp-bg); }
  .y2k-panel--acento { background: var(--pp-acc) !important; color: var(--pp-bg); }
  .y2k-panel--acento .y2k-acento { color: var(--pp-ink); }
  .y2k-pan[data-scroll="vertical"] { height: auto; }
  .y2k-pan[data-scroll="vertical"] .y2k-pan-fijo { position: static; height: auto; overflow: visible; }
  .y2k-pan[data-scroll="vertical"] .y2k-tira { position: static; display: block; width: 100%; transform: none !important; }
  .y2k-pan[data-scroll="vertical"] .y2k-panel { height: auto; min-height: calc(var(--vh, 1vh) * 100); }

  .y2k-lineas { display: flex; flex-direction: column; border-top: 2px solid currentColor; }
  .y2k-linea { display: flex; justify-content: space-between; gap: 16px; padding: 12px 0; border-bottom: 1px solid color-mix(in srgb, currentColor 30%, transparent); }
  .y2k-linea > span:first-child { font-family: var(--y2k-mono), 'VT323', monospace; font-size: 12px; letter-spacing: .14em;
    text-transform: uppercase; color: color-mix(in srgb, currentColor 66%, transparent); flex: 0 0 auto; }
  .y2k-linea > span:last-child { text-align: right; font-size: 15px; }
  .y2k-cta { margin-top: 14px; min-height: 48px; display: flex; align-items: center; justify-content: space-between;
    border: 2px solid currentColor; padding: 0 16px; font-family: var(--y2k-mono), 'VT323', monospace;
    font-size: 12px; letter-spacing: .18em; text-transform: uppercase; }
  .y2k-cta-flecha { font-family: var(--y2k-serif), 'Baloo 2', cursive; font-style: italic; font-size: 22px; }
  .y2k-mapa { height: 190px; border: 2px solid currentColor; overflow: hidden; margin-top: 14px; }
  .y2k-puntos { position: absolute; left: 0; right: 40px; bottom: 30px; display: flex; gap: 8px; justify-content: center; z-index: 2; }
  .y2k-punto { width: 28px; height: 3px; transition: background 300ms ease; display: inline-block; }

  /* ── 05 Check-in: el cupón ─────────────────────────────────────────── */
  .y2k-checkin { background: var(--pp-bg2); }
  .y2k-cupon { position: relative; background: #FFFFFF; color: var(--pp-ink); border: 3px solid var(--pp-ink);
    padding: 26px 18px 18px; display: flex; flex-direction: column; gap: 14px; }
  .y2k-cupon-corte { position: absolute; left: -3px; right: -3px; top: 52px; border-top: 2px dashed var(--pp-ink); }
  .y2k-cupon .y2k-talon-top { font-family: var(--y2k-mono), 'VT323', monospace; font-size: 11px; letter-spacing: .2em; }
  .y2k-cupon input, .y2k-cupon .y2k-input { border: 2px solid var(--pp-ink); border-radius: 0; background: transparent; }
  .y2k-cupon .y2k-contador button { border: 2px solid var(--pp-ink); }
  .y2k-sello, .y2k-cupon .y2k-sello { color: inherit; }

  /* ── 06 Álbum: hoja de contactos ───────────────────────────────────── */
  .y2k-panel--album { background: color-mix(in srgb, var(--pp-bg) 92%, var(--pp-ink)); }
  .y2k-contactos { position: relative; z-index: 1; flex: 1; min-height: 0; display: grid; grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: 1fr; gap: 10px; }
  @media (min-width: 900px) { .y2k-contactos { grid-template-columns: repeat(6, 1fr); } }
  .y2k-contacto { position: relative; overflow: hidden; border: 1px solid color-mix(in srgb, currentColor 30%, transparent); cursor: pointer; }
  .y2k-contacto-img { width: 100%; height: 100%; object-fit: cover; display: block; filter: grayscale(1) contrast(1.1); }
  .y2k-contacto-tinta { position: absolute; inset: 0; background: var(--pp-acc); mix-blend-mode: multiply; opacity: .18; }
  .y2k-contacto-n { position: absolute; left: 6px; bottom: 4px; font-family: var(--y2k-mono), 'VT323', monospace;
    font-size: 10px; letter-spacing: .14em; color: #FFFFFF; mix-blend-mode: difference; }

  /* ── 07 Música ─────────────────────────────────────────────────────── */
  .y2k-eq { display: flex; align-items: flex-end; gap: 6px; height: 40px; }
  .y2k-eq span { width: 6px; height: 100%; background: currentColor; transform-origin: bottom; animation: ebnEq 1.1s ease-in-out infinite; }
  @keyframes ebnEq { 0%, 100% { transform: scaleY(.25); } 50% { transform: scaleY(1); } }
  .y2k-lista { display: flex; flex-direction: column; border-top: 2px solid currentColor; }
  .y2k-lista-fila { display: flex; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid color-mix(in srgb, currentColor 30%, transparent); }
  .y2k-lista-texto { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .y2k-lista-tema { font-size: 15px; }
  .y2k-lista-quien { font-family: var(--y2k-mono), 'VT323', monospace; font-size: 11px; letter-spacing: .12em;
    color: color-mix(in srgb, currentColor 62%, transparent); }

  /* ── 08 Regalos: fichas blancas ────────────────────────────────────── */
  .y2k-tarjeta { position: relative; z-index: 1; background: #FFFFFF; color: var(--pp-ink); border: 3px solid var(--pp-ink);
    padding: 18px; display: flex; flex-direction: column; gap: 12px; transform: none !important; box-shadow: none; }
  .y2k-tarjeta + .y2k-tarjeta { margin-top: 12px; }
  .y2k-tarjeta-kicker { font-family: var(--y2k-mono), 'VT323', monospace; font-size: 11px; letter-spacing: .2em; text-transform: uppercase; }
  .y2k-tarjeta-titulo { font-family: var(--y2k-serif), 'Baloo 2', cursive; font-size: 28px; line-height: 1; }
  .y2k-tarjeta-mensaje { margin: 0; font-size: 14px; line-height: 1.5; color: var(--pp-ink2); }
  .y2k-tarjeta .y2k-fila { border-bottom: 1px solid color-mix(in srgb, var(--pp-ink) 22%, transparent); }
  .y2k-fila { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 10px 0; }
  .y2k-fila--ultima { border-bottom: none; }
  .y2k-fila-texto { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .y2k-fila-etq { font-family: var(--y2k-mono), 'VT323', monospace; font-size: 11px; letter-spacing: .18em; color: var(--pp-ink2); }
  .y2k-fila-dato { font-size: 15px; overflow-wrap: anywhere; }
  .y2k-fila-valor { text-align: right; }
  .y2k-btn-copiar { flex-shrink: 0; min-height: 44px; padding: 0 14px; border: 2px solid var(--pp-ink); background: transparent;
    color: var(--pp-ink); font-family: var(--y2k-mono), 'VT323', monospace; font-size: 11px; letter-spacing: .14em;
    text-transform: uppercase; cursor: pointer; }
  .y2k-btn-copiar--hecho { background: var(--pp-ink); color: #FFFFFF; }

  /* ── 09 Trivia: el pliego del acento ───────────────────────────────── */
  .y2k-quiz { background: var(--pp-acc) !important; color: var(--pp-bg); }
  .y2k-quiz .y2k-acento { color: var(--pp-ink); }
  .y2k-opciones { display: flex; flex-direction: column; gap: 10px; }
  .y2k-opcion { min-height: 52px; text-align: left; padding: 0 16px; border: 2px solid currentColor; background: transparent;
    color: inherit; font-family: var(--y2k-sans), 'Comfortaa', cursive; font-size: 15px; cursor: pointer;
    transition: background 200ms ease, color 200ms ease; }
  .y2k-opcion--bien { background: var(--pp-bg); color: var(--pp-ink); }
  .y2k-opcion--mal { opacity: .55; }

  /* ── 10 Tu pase ────────────────────────────────────────────────────── */
  .y2k-pase { background: var(--pp-ink); color: var(--pp-bg); }
  .y2k-pagina--qr { align-items: flex-start; }
  .y2k-pagina--qr .qr-ingreso, .y2k-pagina--qr section { background: transparent !important; border: none !important; padding: 0 !important; }
  .y2k-pase-cabeza { display: flex; align-items: flex-end; justify-content: space-between; gap: 14px; }
  .y2k-pase-numero { display: flex; flex-direction: column; }
  .y2k-pase-numero > span:last-child { font-family: var(--y2k-serif), 'Baloo 2', cursive; font-size: clamp(44px, 12vw, 86px); line-height: .9; }
  .y2k-info-extra { margin-top: 12px; }
  .y2k-info-extra #info-adicional { background: transparent !important; padding: 0 !important; }
  .y2k-info-extra #ia-trigger-btn { background: transparent !important; color: inherit !important; border: 2px solid currentColor !important;
    border-radius: 0 !important; font-family: var(--y2k-mono), 'VT323', monospace !important; letter-spacing: .18em !important; }
  /* Los íconos de los componentes compartidos no entran: acá el dibujo es la
     tipografía. */
  .y2k-raiz .ia-icon-box, .y2k-raiz svg.lucide { display: none !important; }
  .y2k-replay { cursor: pointer; }
  .y2k-credito { display: flex; justify-content: center; opacity: .6; }
  .y2k-error { margin: 0; font-family: var(--y2k-mono), 'VT323', monospace; font-size: 12px; }

  /* ── El sello circular ─────────────────────────────────────────────── */
  .y2k-sello-circular { position: relative; width: clamp(72px, 18vw, 96px); aspect-ratio: 1; flex: 0 0 auto; color: var(--pp-acc); }
  .y2k-sello-circular svg { position: absolute; inset: 0; animation: ebnGira 26s linear infinite; }
  .y2k-sello-circular text { font-family: var(--y2k-mono), 'VT323', monospace; font-size: 9.2px; letter-spacing: 1.4px; fill: currentColor; }
  .y2k-sello-amp { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
    font-family: var(--y2k-serif), 'Baloo 2', cursive; font-style: italic; font-size: 30px; color: var(--pp-acc); }
  @keyframes ebnGira { to { transform: rotate(360deg); } }

  /* ── La tapa ───────────────────────────────────────────────────────── */
  .y2k-portada { position: absolute; inset: 0; z-index: 5; overflow: hidden; background: var(--pp-bg); color: var(--pp-ink); }
  .y2k-portada-hoja { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: space-between;
    padding: calc(18px + env(safe-area-inset-top)) max(22px, calc((100% - 1100px) / 2)) calc(22px + env(safe-area-inset-bottom)); }
  .y2k-tapa-centro { position: relative; z-index: 1; display: flex; flex-direction: column; gap: clamp(8px, 2vh, 20px); }
  .y2k-tapa-fila { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
  .y2k-tapa-fecha { font-family: var(--y2k-mono), 'VT323', monospace; font-size: 11px; letter-spacing: .22em;
    text-transform: uppercase; color: var(--pp-acc); }
  .y2k-tapa-nombres { margin: 0; font-family: var(--y2k-serif), 'Baloo 2', cursive; font-weight: 400;
    font-size: min(clamp(56px, 20vw, 180px), 15vh); line-height: .84; letter-spacing: -.035em; display: flex; flex-direction: column; }
  .y2k-tapa-linea { overflow: hidden; display: block; }
  .y2k-tapa-linea > span { display: block; }
  .y2k-tapa-linea--sangra { padding-left: 14%; }
  .y2k-tapa-pase { text-align: right; }
  .y2k-tapa-pie { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 14px; }
  .y2k-tapa-mensaje { margin: 0; font-family: var(--y2k-serif), 'Baloo 2', cursive; font-size: clamp(20px, 5.4vw, 26px);
    line-height: 1.2; max-width: 34ch; }
  .y2k-tapa-btn { min-height: 52px; border: 2px solid var(--pp-ink); background: var(--pp-ink); color: var(--pp-bg);
    font-family: var(--y2k-sans), 'Comfortaa', cursive; font-weight: 600; font-size: 13px; letter-spacing: .2em;
    text-transform: uppercase; padding: 0 22px; cursor: pointer; transition: background 200ms ease, color 200ms ease; }
  @media (hover: hover) { .y2k-tapa-btn:hover { background: var(--pp-acc); border-color: var(--pp-acc); color: var(--pp-bg); } }

  /* ── Riel, pista y lupa ────────────────────────────────────────────── */
  .y2k-riel { position: absolute; right: 0; top: 0; bottom: 0; width: 34px; z-index: 4; display: flex; flex-direction: column;
    align-items: center; justify-content: space-between; padding: 20px 0 calc(20px + env(safe-area-inset-bottom));
    opacity: 0; transition: opacity 700ms ease; pointer-events: none; border-left: 1px solid color-mix(in srgb, var(--pp-ink) 20%, transparent); }
  .y2k-riel-top, .y2k-riel-etiqueta { writing-mode: vertical-rl; font-family: var(--y2k-mono), 'VT323', monospace;
    font-size: 10px; letter-spacing: .28em; transition: color 500ms ease; }
  .y2k-riel-top { color: var(--pp-ink2); }
  .y2k-riel-etiqueta { color: var(--pp-acc); }
  .y2k-riel-linea { flex: 1; width: 1px; margin: 16px 0; background: color-mix(in srgb, var(--pp-ink) 20%, transparent); position: relative; }
  .y2k-riel-barra { position: absolute; left: -1px; top: 0; width: 3px; height: 0%; background: var(--pp-acc); transition: height 260ms linear; display: block; }
  .y2k-pista { position: absolute; left: 0; right: 34px; bottom: calc(18px + env(safe-area-inset-bottom)); z-index: 6; text-align: center;
    font-family: var(--y2k-mono), 'VT323', monospace; font-size: 11px; letter-spacing: .28em; color: var(--pp-ink2);
    opacity: 0; transition: opacity 600ms ease; pointer-events: none; animation: ebnPista 2.4s ease-in-out infinite; }
  @keyframes ebnPista { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(7px); } }

  .y2k-lupa { position: fixed; inset: 0; z-index: 200; background: color-mix(in srgb, var(--pp-ink) 94%, transparent);
    display: flex; align-items: center; justify-content: center; padding: 24px; cursor: zoom-out; }
  .y2k-lupa-cerrar { position: absolute; top: 20px; right: 20px; width: 40px; height: 40px; border: 2px solid var(--pp-bg);
    background: transparent; color: var(--pp-bg); font-size: 18px; line-height: 1; cursor: pointer; }
  .y2k-lupa-img { max-width: 100%; max-height: 88vh; object-fit: contain; cursor: default; border: 3px solid var(--pp-bg); }

  /* ── Formularios (check-in y canciones) ────────────────────────────── */
  .y2k-campo { display: flex; flex-direction: column; gap: 6px; }
  .y2k-etiqueta { font-family: var(--y2k-mono), 'VT323', monospace; font-size: 11px; letter-spacing: .2em; text-transform: uppercase;
    color: color-mix(in srgb, currentColor 66%, transparent); }
  .y2k-input { min-height: 48px; border: 2px solid currentColor; background: transparent; color: inherit;
    font-family: var(--y2k-sans), 'Comfortaa', cursive; font-size: 16px; padding: 0 12px; border-radius: 0; }
  .y2k-input:focus { outline: none; border-color: var(--pp-acc); }
  .y2k-contador { display: flex; align-items: center; gap: 12px; }
  .y2k-contador button { width: 48px; height: 48px; border: 2px solid currentColor; background: transparent; color: inherit;
    font-size: 20px; line-height: 1; cursor: pointer; }
  .y2k-contador button:disabled { opacity: .35; cursor: default; }
  .y2k-contador > span { font-family: var(--y2k-serif), 'Baloo 2', cursive; font-size: 36px; min-width: 40px; text-align: center; line-height: 1; }
  .y2k-btn-solido { min-height: 48px; padding: 0 22px; border: 2px solid currentColor; background: currentColor; color: var(--pp-bg);
    font-family: var(--y2k-mono), 'VT323', monospace; font-size: 12px; letter-spacing: .18em; text-transform: uppercase; cursor: pointer; }
  .y2k-btn-solido--tinta { background: var(--pp-acc); border-color: var(--pp-acc); color: var(--pp-bg); }
  .y2k-btn-fantasma { min-height: 48px; padding: 0 22px; border: 2px solid currentColor; background: transparent; color: inherit;
    font-family: var(--y2k-mono), 'VT323', monospace; font-size: 12px; letter-spacing: .18em; text-transform: uppercase; cursor: pointer; }
  .y2k-precio { display: flex; justify-content: space-between; gap: 12px; border-top: 2px solid currentColor; padding-top: 12px; }
  .y2k-precio-valor { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
  .y2k-precio-total { font-family: var(--y2k-serif), 'Baloo 2', cursive; font-size: 28px; line-height: 1; }
  .y2k-precio-detalle { font-family: var(--y2k-mono), 'VT323', monospace; font-size: 11px; letter-spacing: .1em; }
  .y2k-talon-top { display: flex; justify-content: space-between; gap: 10px; font-family: var(--y2k-mono), 'VT323', monospace;
    font-size: 11px; letter-spacing: .2em; text-transform: uppercase; }
  .y2k-talon-estado { transition: color 400ms ease; }
  .y2k-filas { display: flex; flex-direction: column; }
  .y2k-petalos { display: none; }

  /* Y2K: burbujas. Nada es cuadrado y el titular tiene brillo de cromo. */
  .y2k-tarjeta, .y2k-cupon, .y2k-btn-solido, .y2k-tapa-btn, .y2k-opcion, .y2k-input, .y2k-cta, .y2k-foto { border-radius: 22px; }
  .y2k-tapa-nombres, .y2k-h2, .y2k-panel-titulo, .y2k-fecha-linea { letter-spacing: -.01em; text-shadow: 0 2px 0 #fff, 0 7px 0 color-mix(in srgb, var(--pp-acc) 40%, transparent); }

  @media (prefers-reduced-motion: reduce) {
    .y2k-raiz * { animation: none !important; }
    .y2k-scroller [data-xin] { opacity: 1 !important; transform: none !important; }
    /* Sin movimiento no hay revelado: la foto se ve, sin la trama encima. */
    .y2k-foto { --y2k-punto: 0; }
  }
`;
