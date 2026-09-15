"use client";

// GENERADO por scripts/gen-iconic-variants.js a partir de
// ShojoTemplate.tsx — no editar a mano: los cambios se pierden al regenerar.

/**
 * SHŌJO · Colección Iconic — sub-colección "Tipográfica Editorial"
 * Variante: Lavanda.
 *
 * GENERADO por scripts/derivar-tipografica.js a partir de
 * EditorialBlancNoirTemplate.tsx — no editar a mano: el motor se arregla en
 * Editorial Blanc & Noir; el render en scripts/jsx/tipografica/sho.jsx, los
 * estilos en scripts/css/tipografica/sho.css y las caras y la paleta en
 * scripts/familias/tipografica/sho.json.
 *
 * Title card de anime: Cherry Bomb One en blanco con trazo de tinta y
 * sombra plana doble, M PLUS Rounded 1c para el texto y los acentos en
 * japonés. Líneas de velocidad, screentone, destellos que titilan, pétalos
 * que caen, globos de pensamiento y el nombre que salta letra por letra.
 *
 * Sin imágenes propias: son fuentes y CSS.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Cherry_Bomb_One, M_PLUS_Rounded_1c } from "next/font/google";
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

const shoSerif = Cherry_Bomb_One({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  variable: "--sho-serif",
});
const shoSans = M_PLUS_Rounded_1c({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
  variable: "--sho-sans",
});
// El mono es la ficha técnica de la revista: folios, kickers y datos.

// ─── Paleta ─────────────────────────────────────────────────────────────────
// Las cinco variantes de "Capas de papel" cambian SOLO estos once colores
// (el script de variantes reemplaza este bloque entero, ver
// scripts/gen-capas-de-papel-variants.js). El dibujo es el mismo: los SVG de
// las escenas leen var(--pp-…), así que un cambio acá repinta cerros, cielo,
// sol y figuras de una sola vez.
const PALETA = {
  bg: "#EFE6FF",
  bg2: "#FFE3EE",
  ink: "#2F2440",
  ink2: "#857A99",
  acc: "#B58CFF",
  acc2: "#FF6FAE",
  sky1: "#EFE6FF",
  sky2: "#FFE3EE",
  hill1: "#FFE3EE",
  hill2: "#857A99",
  hill3: "#2F2440",
  night: "#2F2440",
  nightInk: "#EFE6FF",
  acc3: "#8DF0D2",
  star: "#FFE380",
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

interface ShojoTemplateProps {
  invitation: Record<string, unknown>;
  guest?: GuestRecord | null;
  isPersonalized?: boolean;
}

/** El número de pase, con tres cifras como en el mockup ("PASE Nº 042"). */
function numeroDePase(orderNumber: number | undefined): string {
  return String(orderNumber ?? 42).padStart(3, "0");
}

export function ShojoTemplateLavanda({ invitation, guest, isPersonalized = false }: ShojoTemplateProps) {
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
      el.style.setProperty("--sho-y", `${dist}px`);
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
            el.style.setProperty("--sho-y", "0px");
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
            ven.style.setProperty("--sho-punto", (7.2 * (1 - t)).toFixed(2));
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
    "--pp-star": PALETA.star,
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
          clase: `${shoSerif.variable} ${shoSans.variable}`,
          fuente: "var(--sho-sans), 'M PLUS Rounded 1c', sans-serif",
        }}
      />
    );
  }


  // El total de pliegos, para los folios ("03 / 10"). Se cuenta lo que esta
  // invitación realmente tiene: si no hay trivia, no existe el pliego 09 y el
  // pase deja de ser 10 de 10.
  const totalPliegos = cuenta;
  const folio = (n: string) => `${n} / ${String(totalPliegos).padStart(2, "0")}`;

  // El nombre como título de opening: dos renglones, el segundo sangrado.
  // Con una sola persona el nombre se parte en dos (Valen / tina, como en el
  // mockup); con dos, uno por renglón y el cuerpo baja a .7em si son largos.
  const partirNombre = (n: string): [string, string] => {
    const limpio = n.trim();
    const partes = limpio.split(/\s+/);
    if (partes.length > 1) return [partes[0], partes.slice(1).join(" ")];
    const corte = Math.ceil(limpio.length / 2);
    return [limpio.slice(0, corte), limpio.slice(corte)];
  };
  const renglones: [string, string] = saludaAlInvitado ? partirNombre(nombreInvitado) : nombre2 ? [nombre1, nombre2] : partirNombre(nombre1);
  const renglonMasLargo = Math.max(4, ...renglones.map((n) => n.length));
  const nombreLargo = Boolean(nombre2) && renglonMasLargo > 7;
  const totalLetras = Math.max(1, renglones.join("").replace(/\s/g, "").length);

  // La frase: una palabra del medio en el acento y el cierre sobre la
  // estrella amarilla.
  const tonoDePalabra = (i: number) => {
    const n = palabras.length;
    if (i >= Math.ceil(n * 0.8)) return "sho-resalte";
    if (i === Math.min(desdeAcento, n - 1) || i === Math.floor(n * 0.3)) return "sho-acento";
    return undefined;
  };

  const esXV = invitation.tipo === "QUINCE_ANOS";
  const esBoda = invitation.tipo === "CASAMIENTO";
  const kickerDelEvento = tx(esBoda ? "invitacion.evento.nosCasamos" : esXV ? "invitacion.evento.misQuinceAnos" : "invitacion.evento.teInvitamos");
  const subtituloJp = tx(esXV ? "invitacion.saveTheDate.jpQuince" : esBoda ? "invitacion.saveTheDate.jpBoda" : "invitacion.saveTheDate.jpFiesta");
  const numeroDeEpisodio = esXV ? "15" : "01";
  const emblema = esXV ? "✦ 15 ✦" : nombre2 ? "✦ & ✦" : "✦ ✦ ✦";
  const firma = esXV ? nombre1.trim().split(/\s+/)[0] : iniciales(nombre1, nombre2);
  // Los nueve destellos de la tapa y del pase: posición, tamaño, color y
  // ritmo, como en el mockup.
  const DESTELLOS = [[6, 14, 26], [86, 10, 34], [70, 26, 18], [14, 44, 22], [92, 52, 20], [30, 62, 16], [80, 74, 30], [10, 84, 20], [56, 90, 18]];
  const PETALOS = [8, 22, 38, 55, 68, 82, 94];

  return (
    <div
      ref={raizRef}
      className={`${shoSerif.variable} ${shoSans.variable} sho-raiz`}
      style={varsDePaleta}
    >
      <style>{CSS_SHO}</style>
      <style>{COVER_RESPONSIVE_STYLE}</style>

      <div ref={scrollerRef} className="sho-scroller">
        {/* ── 01 Guardá la fecha ─────────────────────────────────────────
            "Próximo episodio": sobre la tinta, la fecha en Cherry Bomb a
            tres colores, y la foto con marco blanco y el sticker つづく. */}
        <section data-tone="dark" data-screen-label={tx("invitacion.saveTheDate.guardaLaFecha")} className="sho-section sho-std">
          <span className="sho-lineas sho-lineas--std" aria-hidden="true" />
          <div className="sho-folio sho-folio--celeste">
            <span data-xin="1" data-dist="-40">{nSaveTheDate} — {tx("invitacion.saveTheDate.proximoEpisodio")}</span>
            <span data-xin="1" data-dist="40">{folio(nSaveTheDate)}</span>
          </div>
          <div className="sho-spread">
            <div className="sho-pagina">
              <div className="sho-fecha">
                <span data-xin="1" data-dist="-160" className="sho-fecha-linea sho-fecha-linea--dia">{diaNum}</span>
                <span data-xin="1" data-dist="160" data-delay="120" className="sho-fecha-linea sho-fecha-linea--mes">{mesLargo}</span>
                <span data-xin="1" data-dist="-160" data-delay="240" className="sho-fecha-linea sho-fecha-linea--anio">{anio}</span>
              </div>
              <div data-xin="1" data-delay="360" className="sho-fecha-pie">
                <span>{diaSemana} · {hora} h · {tx("invitacion.saveTheDate.guardaLaFecha")}</span>
                <AddToCalendarLink
                  eventName={titulo}
                  targetDate={fechaHora}
                  location={[lugarNombre, direccion].filter(Boolean).join(", ")}
                  className="sho-pildora sho-pildora--blanca"
                  showIcon={false}
                >
                  {tx("invitacion.saveTheDate.agregarAlCalendario")} ↗
                </AddToCalendarLink>
              </div>
            </div>

            {hayFoto && (
              <div ref={ventanaRef} data-xin="1" data-delay="200" data-dist="0" className="sho-foto">
                {fotoMobile && (
                  <div className="acp-mobile-only sho-foto-capa">
                    <AnimatedCoverPhoto photoSrc={fotoMobile} tint={false} effect="enfoque" scrimColorRgb="59,42,74" />
                  </div>
                )}
                {fotoDesktop && (
                  <div className="acp-desktop-only sho-foto-capa">
                    <AnimatedCoverPhoto photoSrc={fotoDesktop} tint={false} effect="enfoque" scrimColorRgb="59,42,74" />
                  </div>
                )}
                {/* La trama que tapa la foto y se disuelve al subir: el radio
                    del punto lo mueve el motor en --sho-punto. */}
                <span className="sho-foto-revelado" aria-hidden="true" />
                <span className="sho-foto-etq">{tx("invitacion.album.nuestraFoto").toUpperCase()}</span>
                <span className="sho-sticker sho-sticker--tsuzuku">{tx("invitacion.saveTheDate.tsuzuku")}</span>
              </div>
            )}
          </div>
        </section>

        {/* ── 02 Falta poco ──────────────────────────────────────────────
            Secuencia de transformación: cuatro viñetas blancas con líneas
            de velocidad entre dos marquesinas inclinadas. */}
        <section data-tone="light" data-screen-label={tx("invitacion.cuentaRegresiva.kicker")} className="sho-section sho-countdown">
          <div className="sho-folio sho-folio--suave">
            <span data-xin="1" data-dist="-40">{nCountdown} — {tx("invitacion.saveTheDate.transformacionEn")}</span>
            <span data-xin="1" data-dist="40">{folio(nCountdown)}</span>
          </div>
          <div className="sho-marquesina sho-marquesina--acento" aria-hidden="true">
            <div className="sho-marquesina-tira">
              {[0, 1].map((i) => (
                <span key={i}>
                  {tx("invitacion.cuentaRegresiva.dias")} ✦ {tx("invitacion.cuentaRegresiva.horas")} ✦ {tx("invitacion.cuentaRegresiva.minutos")} ✦ {tx("invitacion.cuentaRegresiva.segundos")} ✦ {diaNum} {tx("invitacion.evento.de")} {mesLargo} ✦ カウントダウン ✦&nbsp;
                </span>
              ))}
            </div>
          </div>
          <div className="sho-spread">
            <div className="sho-pagina sho-pagina--entera">
              <CuentaShojo targetDate={fechaHora} />
            </div>
          </div>
          <div className="sho-marquesina sho-marquesina--celeste sho-marquesina--contraria" aria-hidden="true">
            <div className="sho-marquesina-tira">
              {[0, 1].map((i) => (
                <span key={i}>
                  {[lugarNombre, ciudad, `${hora} h`, dressCode].filter(Boolean).join(" · ").toUpperCase()} ·&nbsp;
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── 03 Unas palabras ───────────────────────────────────────────
            Monólogo interior: la frase dentro de un globo de pensamiento y
            el cartel キラキラ flotando al costado. */}
        {hayFrase && (
          <section data-tone="light" data-screen-label={tx("invitacion.frase.etiqueta")} className="sho-section sho-frase-seccion">
            <span className="sho-trama sho-trama--frase" aria-hidden="true" />
            <div className="sho-folio sho-folio--suave">
              <span data-xin="1" data-dist="-40">{nFrase} — {tx("invitacion.saveTheDate.monologoInterior")}</span>
              <span data-xin="1" data-dist="40">{folio(nFrase)}</span>
            </div>
            <div className="sho-spread">
              <div className="sho-pensamiento">
                <h2 ref={fraseRef} className="sho-frase">
                  {palabras.map((p, i) => (
                    // El espacio va fuera del span: el motor pone cada palabra
                    // en inline-block y un espacio adentro se colapsa a cero.
                    <span key={i}>
                      <span data-w="1" className={tonoDePalabra(i)}>{p}</span>{" "}
                    </span>
                  ))}
                </h2>
                <span className="sho-burbujita sho-burbujita--grande" aria-hidden="true" /><span className="sho-burbujita sho-burbujita--chica" aria-hidden="true" />
              </div>
              <div data-xin="1" data-delay="900" data-dist="60" className="sho-kirakira">
                <span className="sho-kirakira-titulo">{tx("invitacion.saveTheDate.kirakira")}</span>
                <span className="sho-kirakira-texto">{tx("invitacion.frase.conAmor")} · {titulo}</span>
              </div>
            </div>
            <div className="sho-folio sho-folio--suave sho-folio--pie">
              <span>{titulo} · {tx("invitacion.saveTheDate.epAbrev")} {numeroDeEpisodio}</span>
              <span className="sho-barra" aria-hidden="true" />
            </div>
          </section>
        )}

        {/* ── 04 Cuándo y dónde ──────────────────────────────────────────
            Viñetas de manga: el escenario sobre lila, la escena 1 sobre
            tinta y el guion sobre rosa, con el título blanco con trazo y
            la ficha blanca. */}
        <div
          id="details"
          data-pan="1"
          data-scroll={scrollVertical || panelesLugar.length <= 1 ? "vertical" : "lateral"}
          data-screen-label={tx("invitacion.ubicacion.cuandoYDonde")}
          className="sho-pan"
          style={{ "--st-pasos": Math.max(0, panelesLugar.length - 1) } as React.CSSProperties}
        >
          <div className="sho-pan-fijo">
            <div data-strip="1" className="sho-tira">
              <div data-tone="light" className="sho-panel sho-panel--escenario">
                <span className="sho-lineas sho-lineas--panel" aria-hidden="true" />
                <div className="sho-folio">
                  <span>{nCuando} — {tx("invitacion.saveTheDate.escenario")}</span><span>{deLugar("recepcion")}</span>
                </div>
                <div className="sho-spread">
                  <div className="sho-pagina sho-pagina--titulo">
                    <span className="sho-panel-sub">{tx("invitacion.ubicacion.elSalon")}</span>
                    <h2 className="sho-panel-titulo">{lugarNombre || tx("invitacion.ubicacion.elLugar")}</h2>
                  </div>
                  <div className="sho-ficha">
                    <div className="sho-linea"><span>{tx("invitacion.ubicacion.recepcion")}</span><span>{hora} h</span></div>
                    {direccion && <div className="sho-linea"><span>{tx("invitacion.ubicacion.direccion")}</span><span>{direccion}</span></div>}
                    {dressCode && <div className="sho-linea"><span>{tx("invitacion.ubicacion.dressCode")}</span><span>{dressCode}</span></div>}
                    {mapUrl && (
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="sho-cta">
                        {tx("invitacion.ubicacion.comoLlegar")}<span>→</span>
                      </a>
                    )}
                  </div>
                </div>
                <div className="sho-folio sho-folio--pie">
                  <span>{[direccion, ciudad].filter(Boolean).join(" · ")}</span>
                  {!scrollVertical && panelesLugar.length > 1 && <span>{tx("invitacion.portada.desliza")} →</span>}
                </div>
              </div>

              {ceremoniaHabilitada && (
                <div id="ceremonia" data-tone="dark" className="sho-panel sho-panel--escena">
                  <span className="sho-lineas sho-lineas--panel" aria-hidden="true" />
                  <div className="sho-folio">
                    <span>{nCuando} — {tx("invitacion.saveTheDate.escena")} 1</span><span>{deLugar("ceremonia")}</span>
                  </div>
                  <div className="sho-spread">
                    <div className="sho-pagina sho-pagina--titulo">
                      <span className="sho-panel-sub">{ceremoniaTitulo}</span>
                      <h2 className="sho-panel-titulo">{ceremoniaNombre || ceremoniaTitulo}</h2>
                    </div>
                    <div className="sho-ficha">
                      {ceremoniaHora && <div className="sho-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{ceremoniaHora} h</span></div>}
                      {ceremoniaDireccion && <div className="sho-linea"><span>{tx("invitacion.ubicacion.direccion")}</span><span>{ceremoniaDireccion}</span></div>}
                    </div>
                  </div>
                  <div className="sho-folio sho-folio--pie">
                    <span>{tx("invitacion.ubicacion.ceremoniaCivil")}</span>
                    {!scrollVertical && <span>{tx("invitacion.portada.desliza")} →</span>}
                  </div>
                </div>
              )}

              {hayComoLlegar && (
                <div id="location" data-tone="light" className="sho-panel sho-panel--mapa">
                  <span className="sho-lineas sho-lineas--panel" aria-hidden="true" />
                  <div className="sho-folio">
                    <span>{nCuando} — {tx("invitacion.ubicacion.comoLlegar")}</span><span>{deLugar("llegar")}</span>
                  </div>
                  <div className="sho-spread">
                    <div className="sho-pagina sho-pagina--titulo">
                      <span className="sho-panel-sub">{tx("invitacion.ubicacion.tuUbicacion")}</span>
                      <h2 className="sho-panel-titulo">{tx("invitacion.ubicacion.comoLlegar")}</h2>
                    </div>
                    <div className="sho-ficha">
                      {embedMapUrl && (
                        <div className="sho-mapa">
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
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="sho-cta">
                        {tx("invitacion.ubicacion.abrirEnMapas")}<span>→</span>
                      </a>
                    </div>
                  </div>
                  <div className="sho-folio sho-folio--pie">
                    <span>{[direccion, ciudad].filter(Boolean).join(" · ")}</span>
                    {!scrollVertical && <span>{tx("invitacion.portada.desliza")} →</span>}
                  </div>
                </div>
              )}

              {cronograma.length > 0 && (
                <div id="schedule" data-tone="light" className="sho-panel sho-panel--guion">
                  <span className="sho-lineas sho-lineas--panel" aria-hidden="true" />
                  <div className="sho-folio">
                    <span>{nCuando} — {tx("invitacion.saveTheDate.guion")}</span><span>{deLugar("cronograma")}</span>
                  </div>
                  <div className="sho-spread">
                    <div className="sho-pagina sho-pagina--titulo">
                      <span className="sho-panel-sub">{tx("invitacion.ubicacion.cronograma")}</span>
                      <h2 className="sho-panel-titulo">{tx("invitacion.ubicacion.laNochePasoAPaso").split(",")[0]}</h2>
                    </div>
                    <div className="sho-ficha">
                      {cronograma.map((item, i) => (
                        <div key={i} className="sho-linea"><span>{item.time || ""}</span><span>{item.title}</span></div>
                      ))}
                    </div>
                  </div>
                  <div className="sho-folio sho-folio--pie">
                    <span>{fechaPuntos}</span>
                  </div>
                </div>
              )}
            </div>
            {!scrollVertical && panelesLugar.length > 1 && <Puntos cantidad={panelesLugar.length} />}
          </div>
        </div>

        {/* ── 05 Check-in ────────────────────────────────────────────────
            Ficha de personaje: pliego celeste con líneas de velocidad, la
            tarjeta blanca con sombra de tinta y el sello "¡Sí!" de
            estrella al confirmar. */}
        {rsvpHabilitado && (
          <section id="rsvp" data-tone="light" data-screen-label={tx("invitacion.rsvp.confirmar")} className="sho-section sho-checkin">
            <span className="sho-lineas sho-lineas--checkin" aria-hidden="true" />
            <div className="sho-folio">
              <span data-xin="1" data-dist="-40">{nCheckin} — {tx("invitacion.saveTheDate.fichaDePersonaje")}</span>
              <span data-xin="1" data-dist="40">{folio(nCheckin)}</span>
            </div>
            <div className="sho-spread">
              <div className="sho-pagina">
                <h2 data-xin="1" data-dist="-80" className="sho-h2">
                  {tx("invitacion.saveTheDate.teSumas")}<br />{tx("invitacion.saveTheDate.alElenco")}
                </h2>
                <p data-xin="1" data-delay="120" className="sho-parrafo sho-parrafo--tinta">{tx("invitacion.rsvp.kicker")}.</p>
              </div>
              <div data-xin="1" data-delay="160" data-dist="80" className="sho-cupon">
                <CheckinShojo
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
            Fotogramas: la hoja de contactos con marcos de tinta, esquinas
            redondas, sombra plana y apenas torcidos. */}
        {todasLasFotos.length > 0 && (
          <div
            id="album"
            data-pan="1"
            data-scroll={scrollVertical || hojasDeFotos.length <= 1 ? "vertical" : "lateral"}
            data-screen-label={tx("invitacion.album.titulo")}
            className="sho-pan"
            style={{ "--st-pasos": Math.max(0, hojasDeFotos.length - 1) } as React.CSSProperties}
          >
            <div className="sho-pan-fijo sho-pan-fijo--album">
              <div data-strip="1" className="sho-tira">
                {hojasDeFotos.map((hoja, iHoja) => (
                  <div key={iHoja} data-tone="light" className={`sho-panel sho-panel--album${iHoja % 2 === 1 ? " sho-panel--album-b" : ""}`}>
                    <div className="sho-folio sho-folio--gris">
                      <span>{nAlbum} — {tx("invitacion.saveTheDate.galeria")}</span>
                      <span>{tx("invitacion.album.hojaDeTotal", { n: String(iHoja + 1).padStart(2, "0"), total: String(hojasDeFotos.length).padStart(2, "0") })} · {folio(nAlbum)}</span>
                    </div>
                    <h2 className="sho-h2 sho-h2--album">{tx("invitacion.saveTheDate.fotogramas")}</h2>
                    <div className="sho-hoja" data-cantidad={hoja.length}>
                      {hoja.map((url, i) => (
                        <div
                          key={i}
                          data-sheet="1"
                          className="sho-foto-hoja"
                          role="button"
                          tabIndex={0}
                          onClick={() => setFotoAmpliada(url)}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setFotoAmpliada(url); }}
                          aria-label={tx("invitacion.album.ampliarFoto", { n: i + 1 })}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="" loading="lazy" className="sho-foto-hoja-img" />
                          <span data-colorwash="1" className={`sho-bano sho-bano--${(i % 5) + 1}`} aria-hidden="true" />
                          <span className="sho-foto-hoja-n">FOTO {String(i + 1).padStart(2, "0")}</span>
                        </div>
                      ))}
                    </div>
                    <div className="sho-folio sho-folio--gris sho-folio--pie">
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
            Opening / ending: pliego lila con trama blanca abajo, el
            ecualizador y la lista en fichas blancas. */}
        {sugerenciaMusicaHabilitada && (
          <section id="songs" data-tone="dark" data-screen-label={tx("invitacion.musica.titulo")} className="sho-section sho-musica">
            <span className="sho-trama sho-trama--musica" aria-hidden="true" />
            <div className="sho-folio">
              <span data-xin="1" data-dist="-40">{nMusica} — {tx("invitacion.saveTheDate.opening")}</span>
              <span data-xin="1" data-dist="40">{folio(nMusica)}</span>
            </div>
            <div className="sho-spread">
              <div className="sho-pagina">
                <h2 data-xin="1" data-dist="-80" className="sho-h2 sho-h2--sombra-tinta">
                  {tituloEnDosLineas(tx("invitacion.saveTheDate.cualEsTuOpening"), "sho-h2-sub")}
                </h2>
                <p data-xin="1" data-delay="100" className="sho-parrafo sho-parrafo--tinta">{tx("invitacion.musica.dejanosElTema")}</p>
                <div data-xin="1" data-delay="120" className="sho-eq" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((i) => <span key={i} style={{ animationDelay: `${i * 0.18}s` }} />)}
                </div>
              </div>
              <div className="sho-pagina">
                <CancionesShojo
                  invitationId={String(invitation.id ?? "")}
                  guestToken={guest?.uniqueToken}
                  guestName={nombreInvitado || tx("invitacion.evento.invitado")}
                />
              </div>
            </div>
          </section>
        )}

        {/* ── 08 Regalos ─────────────────────────────────────────────────
            Ítems: sobre rosa, fichas blancas con sombra de color. */}
        {hayRegalos && (
          <section id="banco" data-tone="light" data-screen-label={tx("invitacion.regalos.titulo")} className="sho-section sho-regalos">
            <div className="sho-folio sho-folio--suave">
              <span data-xin="1" data-dist="-40">{nRegalos} — {tx("invitacion.saveTheDate.items")}</span>
              <span data-xin="1" data-dist="40">{folio(nRegalos)}</span>
            </div>
            <div className="sho-spread">
              <div className="sho-pagina">
                <h2 data-xin="1" data-dist="-80" className="sho-h2 sho-h2--sombra-lila">
                  {tx("invitacion.saveTheDate.tuRegalo")}<br />{tx("invitacion.saveTheDate.esVenir")}
                </h2>
                {Boolean(invitation.regaloMensaje) && (
                  <p data-xin="1" data-delay="120" className="sho-parrafo">{String(invitation.regaloMensaje)}</p>
                )}
              </div>
              <div className="sho-pagina">
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
            Trivia de fans: sobre la estrella amarilla con líneas de
            velocidad desde abajo, chip de tinta y opciones con sombra. */}
        {quizHabilitado && (
          <section id="quiz" data-tone="light" data-screen-label={triviaTitulo} className="sho-section sho-quiz">
            <span className="sho-lineas sho-lineas--quiz" aria-hidden="true" />
            <div className="sho-folio">
              <span data-xin="1" data-dist="-40">{nQuiz} — {tx("invitacion.saveTheDate.triviaDeFans")}</span>
              <span data-xin="1" data-dist="40">{folio(nQuiz)}</span>
            </div>
            <div className="sho-spread">
              <TriviaShojo
                preguntas={triviaPreguntas}
                invitationId={String(invitation.id ?? "")}
                guestToken={guest?.uniqueToken}
                guestName={nombreInvitado || tx("invitacion.evento.invitado")}
              />
            </div>
          </section>
        )}

        {/* ── 10 Tu pase ─────────────────────────────────────────────────
            El ticket del festival: sobre tinta con destellos, el QR con
            marco rosa, el pase gigante, la mesa en amarillo y el "fin del
            episodio". */}
        <section data-tone="dark" data-screen-label={tx("invitacion.pase.tuPase")} className="sho-section sho-pase">
          <div className="sho-destellos" aria-hidden="true">
            {DESTELLOS.map(([x, y, s], i) => (
              <svg key={i} viewBox="0 0 40 40" className={`sho-destello sho-destello--${i % 4}`} style={{ left: `${x}%`, top: `${y}%`, width: s, height: s, animationDuration: `${(1.8 + (i % 4) * 0.45).toFixed(2)}s`, animationDelay: `${(i * 0.37).toFixed(2)}s` }}><path d="M20 2 C22 14 26 18 38 20 C26 22 22 26 20 38 C18 26 14 22 2 20 C14 18 18 14 20 2 Z" fill="currentColor" /></svg>
            ))}
          </div>
          <div className="sho-folio sho-folio--celeste">
            <span data-xin="1" data-dist="-40">{nPase} — {tx("invitacion.pase.tuPase")}</span>
            <span data-xin="1" data-dist="40">{folio(nPase)}</span>
          </div>
          <div className="sho-spread">
            <div data-xin="1" data-dist="-60" className="sho-pagina sho-pagina--qr">
              <div className="sho-qr">
                <QrDeIngreso guest={guest as never} />
                <span className="sho-qr-etq">{tx("invitacion.pase.tuPase")}</span>
              </div>
            </div>
            <div className="sho-pagina">
              <div data-xin="1" data-delay="100" className="sho-pase-cabeza">
                <div className="sho-pase-numero">
                  <span className="sho-folio-etq">{tx("invitacion.pase.pase")} Nº</span>
                  <span>{pase}</span>
                </div>
                {guest?.mesas && guest.mesas.length > 0 && (
                  <div className="sho-pase-mesa">
                    <span className="sho-folio-etq">{tx("invitacion.pase.tuMesa")}</span>
                    <span>{guest.mesas[0]}</span>
                  </div>
                )}
              </div>
              <div data-xin="1" data-delay="160" className="sho-caja">
                <div className="sho-linea"><span>{saludaAlInvitado ? tx("invitacion.pase.reservadoPara") : tx("invitacion.evento.invitado")}</span><span>{nombreInvitado || titulo}</span></div>
                {lugaresDelPase > 0 && (
                  <div className="sho-linea"><span>{tx("invitacion.pase.lugares")}</span><span>{lugaresDelPase}</span></div>
                )}
                {guest?.mesas && guest.mesas.length > 0 && (
                  <div className="sho-linea"><span>{tx("invitacion.pase.sector")} · {tx("invitacion.pase.tuMesa")}</span><span>{guest.mesas.join(" · ")}</span></div>
                )}
                <div className="sho-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{fechaPuntos} · {hora} h</span></div>
              </div>
              <div className="sho-info-extra">
                <InfoAdicionalSection invitation={invitation} />
              </div>
            </div>
          </div>
          <div data-xin="1" data-delay="220" className="sho-pase-pie">
            <span className="sho-despedida">{tx("invitacion.saveTheDate.finDelEpisodio")} — {firma}</span>
            <div className="sho-folio sho-folio--celeste sho-folio--colofon">
              <span className="sho-credito"><LogoFooterCredit bgColor="transparent" textColor={PALETA.acc3} /></span>
              <span className="sho-replay" role="button" tabIndex={0} onClick={volverAVerla} onKeyDown={(e) => { if (e.key === "Enter") volverAVerla(); }}>
                {tx("invitacion.saveTheDate.volverAlOpening")} ↺
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* ── Riel de progreso ───────────────────────────────────────────── */}
      <div ref={rielRef} className="sho-riel">
        <span ref={rielTopRef} className="sho-riel-top">{pase}</span>
        <div ref={rielLineaRef} className="sho-riel-linea">
          <span ref={rielBarraRef} className="sho-riel-barra" />
        </div>
        <span ref={rielEtiquetaRef} className="sho-riel-etiqueta">{tx("invitacion.saveTheDate.guardaLaFecha")}</span>
      </div>

      {/* ── La tapa ─────────────────────────────────────────────────────
          Title card del episodio: líneas de velocidad lilas, screentone
          rosa abajo, destellos y pétalos cayendo. El nombre en Cherry
          Bomb blanco con trazo y doble sombra, el emblema entre barras,
          el globo del mensaje y el botón "▶". Es la bienvenida: dice de
          quién es la fiesta, cuándo, dónde y para cuántos. */}
      <div ref={portadaRef} data-tone={TONO} className="sho-portada">
        <div ref={escenaPortadaRef} className="sho-portada-hoja">
          <span className="sho-lineas sho-lineas--tapa" aria-hidden="true" />
          <span className="sho-trama sho-trama--tapa" aria-hidden="true" />
          <div className="sho-destellos" data-drift="24" aria-hidden="true">
            {DESTELLOS.map(([x, y, s], i) => (
              <svg key={i} viewBox="0 0 40 40" className={`sho-destello sho-destello--${i % 4}`} style={{ left: `${x}%`, top: `${y}%`, width: s, height: s, animationDuration: `${(1.8 + (i % 4) * 0.45).toFixed(2)}s`, animationDelay: `${(i * 0.37).toFixed(2)}s` }}><path d="M20 2 C22 14 26 18 38 20 C26 22 22 26 20 38 C18 26 14 22 2 20 C14 18 18 14 20 2 Z" fill="currentColor" /></svg>
            ))}
            {PETALOS.map((x, i) => (
              <svg key={`p${i}`} viewBox="0 0 24 24" className="sho-petalo" style={{ left: `${x}%`, animationDuration: `${9 + (i % 3) * 2.5}s`, animationDelay: `${i * 1.7}s` }}><path d="M12 2 C18 6 20 12 12 22 C4 12 6 6 12 2 Z" fill="currentColor" opacity=".7" /></svg>
            ))}
          </div>

          <div data-cl="1" className="sho-tapa-cabecera">
            <div className="sho-tapa-episodio">
              <span className="sho-chip">{tx("invitacion.saveTheDate.episodio")} {numeroDeEpisodio}</span>
              <span className="sho-tapa-jp">{subtituloJp}</span>
            </div>
            <span className="sho-tapa-numero">Nº 00 / {String(totalPliegos).padStart(2, "0")}</span>
          </div>

          <div data-cl="2" className="sho-tapa-centro">
            <span className="sho-tapa-kicker">{diaSemana} {diaNum} · {mesLargo} · {anio}</span>
            <h1 ref={cartelRef} className={`sho-tapa-nombres${nombreLargo ? " sho-tapa-nombres--largo" : ""}`} style={{ "--largo": renglonMasLargo, "--n": totalLetras } as React.CSSProperties}>
              <span className="sho-tapa-linea"><span data-pieza="1"><Letras texto={renglones[0]} desde={0} /></span></span>
              {renglones[1] && (
                <span className="sho-tapa-linea sho-tapa-linea--sangra"><span data-pieza="1"><Letras texto={renglones[1]} desde={renglones[0].replace(/\s/g, "").length} /></span></span>
              )}
            </h1>
            <div className="sho-emblema" aria-hidden="true">
              <span className="sho-emblema-barra" /><span className="sho-emblema-texto">{emblema}</span><span className="sho-emblema-barra" />
            </div>
            <div className="sho-tapa-datos">
              <span>{lugarNombre || kickerDelEvento}<br /><span className="sho-suave">{[direccion, ciudad].filter(Boolean).join(" · ")}</span></span>
              <span className="sho-tapa-datos-der">
                {isPersonalized && guest
                  ? <>{tx("invitacion.pase.pase")} Nº {pase}<br /><span className="sho-suave">{lugaresDelPase} {tx(lugaresDelPase === 1 ? "invitacion.bienvenida.persona" : "invitacion.bienvenida.personas")}</span></>
                  : <>{hora} h<br /><span className="sho-suave">{fechaPuntos}</span></>}
              </span>
            </div>
          </div>

          <div data-cl="3" className="sho-tapa-pie">
            <div className="sho-globo">
              <p className="sho-tapa-mensaje">
                {saludaAlInvitado
                  ? `${tx("invitacion.bienvenida.hola", { nombre: nombreInvitado })}, ${String(invitation.portadaMensaje || tx("invitacion.sabor.mensajeLoContamosNosotros"))}`
                  : String(invitation.portadaMensaje || tx("invitacion.sabor.mensajeLoContamosNosotros"))}
              </p>
              <svg viewBox="0 0 40 40" className="sho-globo-estrella" aria-hidden="true"><path d="M20 2 C22 14 26 18 38 20 C26 22 22 26 20 38 C18 26 14 22 2 20 C14 18 18 14 20 2 Z" /></svg>
            </div>
            <button type="button" onClick={abrir} className="sho-tapa-btn">
              <span>{tx("invitacion.portada.abrirInvitacion")}</span><span>▶</span>
            </button>
          </div>
        </div>
      </div>

      <div ref={pistaRef} className="sho-pista">{tx("invitacion.portada.desliza")} ↓</div>

      {fotoAmpliada && (
        <div className="sho-lupa" onClick={() => setFotoAmpliada(null)} onContextMenu={(e) => e.preventDefault()}>
          <button
            type="button"
            className="sho-lupa-cerrar"
            onClick={(e) => { e.stopPropagation(); setFotoAmpliada(null); }}
            aria-label={tx("invitacion.cerrar")}
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fotoAmpliada} alt={tx("invitacion.album.fotoAmpliada")} className="sho-lupa-img" draggable={false} onClick={(e) => e.stopPropagation()} />
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
 * El nombre letra por letra: cada tanto una sube 16 px y crece un poco,
 * y vuelve rebotando ("sparkle bounce"). El CSS escalona el turno de cada
 * letra.
 */
function Letras({ texto, desde }: { texto: string; desde: number }) {
  let k = desde;
  return (
    <>
      {Array.from(texto).map((ch, i) =>
        ch === " " ? " " : <span key={i} className="sho-letra" style={{ "--i": k++ } as React.CSSProperties}>{ch}</span>
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
    <div className="sho-puntos" aria-hidden="true">
      {Array.from({ length: cantidad }).map((_, i) => (
        <span key={i} data-dot={i} className="sho-punto" style={{ background: i === 0 ? PALETA.acc : "rgba(43,42,51,.18)" }} />
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
function CuentaShojo({ targetDate }: { targetDate: Date }) {
  const tx = useTextos();
  const { time, isEventDay, isPast, hasEnded } = useCountdown(targetDate);

  if (isEventDay || hasEnded || isPast) {
    return (
      <div className="sho-tarjeta sho-tarjeta--hoy" data-xin="1" data-delay="80" data-dist="30">
        <span className="sho-tarjeta-kicker">{tx("invitacion.cuentaRegresiva.kicker").toUpperCase()}</span>
        <span className="sho-tarjeta-titulo">
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
    <div className="sho-cuenta">
      {celdas.map((c, i) => (
        <div key={c.l} data-xin="1" data-delay={i * 100} data-dist={i % 2 === 0 ? -80 : 80} className={`sho-cuenta-caja sho-cuenta-caja--${i + 1}`}>
          <span className="sho-cuenta-num"><span key={c.v}>{c.v}</span></span>
          <span className="sho-cuenta-etq">{c.l.toUpperCase()}</span>
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
    <div className="sho-fila sho-fila--copiable">
      <div className="sho-fila-texto">
        <span className="sho-fila-etq">{etiqueta.toUpperCase()}</span>
        <span className="sho-fila-dato">{valor}</span>
      </div>
      <button type="button" onClick={copiar} className={`sho-btn-copiar${copiado ? " sho-btn-copiar--hecho" : ""}`}>
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
      className={`sho-tarjeta sho-tarjeta--banco${dobleZ ? " sho-doblez" : ""}${inclinada ? " sho-tarjeta--der" : " sho-tarjeta--izq"}`}
    >
      <span className="sho-tarjeta-kicker">{titulo.toUpperCase()}</span>
      {mensaje && <p className="sho-tarjeta-mensaje">{mensaje}</p>}
      <div className="sho-filas">
        <FilaCopiable etiqueta="Alias" valor={alias} />
        <FilaCopiable etiqueta="CBU" valor={cbu} />
        {(banco || titular) && (
          <div className="sho-fila sho-fila--ultima">
            <span>{banco || tx("invitacion.regalos.banco")}</span>
            <span className="sho-fila-valor">{titular}</span>
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
function CheckinShojo({
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
      <div data-xin="1" data-delay="140" data-dist="30" className="sho-tarjeta sho-tarjeta--izq">
        <p className="sho-tarjeta-mensaje">{tx("invitacion.rsvp.graciasPorAvisarAcceso")}</p>
        <button type="button" className="sho-btn-fantasma" onClick={() => setEstado("PENDING")}>
          {tx("invitacion.rsvp.cambieDeIdea").toUpperCase()}
        </button>
      </div>
    );
  }

  const confirmadoYa = estado === "CONFIRMED";

  return (
    <>
      <div ref={tarjetaRef} data-xin="1" data-delay="140" data-dist="30" className="sho-tarjeta sho-tarjeta--talon">
        <div className="sho-talon-top">
          <span>{tx("invitacion.pase.numeroPase", { n: pase }).toUpperCase()}{guestName ? ` · ${guestName.toUpperCase()}` : ""}</span>
          <span ref={estadoRef} className="sho-talon-estado">
            {confirmado || confirmadoYa ? tx("invitacion.pase.accesoConfirmado").toUpperCase() : tx("invitacion.pase.pendiente").toUpperCase()}
          </span>
        </div>

        {!confirmadoYa ? (
          <>
            {lugares > 1 && (
              <div className="sho-campo">
                <label className="sho-etiqueta">{tx("invitacion.rsvp.adultos").toUpperCase()}</label>
                <div className="sho-contador">
                  <button type="button" onClick={() => setAdultos((v) => Math.max(1, v - 1))} disabled={adultos <= 1} aria-label="−">−</button>
                  <span>{adultos}</span>
                  <button type="button" onClick={() => setAdultos((v) => Math.min(maxAdultos, v + 1))} disabled={adultos >= maxAdultos} aria-label="+">+</button>
                </div>
              </div>
            )}
            {maxAdolescentes > 0 && (
              <div className="sho-campo">
                <label className="sho-etiqueta">{tx("invitacion.rsvp.adolescentes").toUpperCase()}</label>
                <div className="sho-contador">
                  <button type="button" onClick={() => setAdolescentes((v) => Math.max(0, v - 1))} disabled={adolescentes <= 0} aria-label="−">−</button>
                  <span>{adolescentes}</span>
                  <button type="button" onClick={() => setAdolescentes((v) => Math.min(maxAdolescentes, v + 1))} disabled={adolescentes >= maxAdolescentes} aria-label="+">+</button>
                </div>
              </div>
            )}
            {maxNinos > 0 && (
              <div className="sho-campo">
                <label className="sho-etiqueta">{tx("invitacion.rsvp.ninos").toUpperCase()}</label>
                <div className="sho-contador">
                  <button type="button" onClick={() => setNinos((v) => Math.max(0, v - 1))} disabled={ninos <= 0} aria-label="−">−</button>
                  <span>{ninos}</span>
                  <button type="button" onClick={() => setNinos((v) => Math.min(maxNinos, v + 1))} disabled={ninos >= maxNinos} aria-label="+">+</button>
                </div>
              </div>
            )}
            <div className="sho-campo">
              <label className="sho-etiqueta">{tx("invitacion.rsvp.restriccionAlimentaria").toUpperCase()}</label>
              <input
                value={dieta}
                onChange={(e) => setDieta(e.target.value)}
                placeholder="—"
                maxLength={120}
                className="sho-input"
              />
            </div>
          </>
        ) : (
          <div className="sho-filas">
            {lugares > 1 && adultos > 0 && <div className="sho-fila"><span>{tx("invitacion.rsvp.adultos")}</span><span>{adultos}</span></div>}
            {adolescentes > 0 && <div className="sho-fila"><span>{tx("invitacion.rsvp.adolescentes")}</span><span>{adolescentes}</span></div>}
            {ninos > 0 && <div className="sho-fila"><span>{tx("invitacion.rsvp.ninos")}</span><span>{ninos}</span></div>}
            <div className="sho-fila sho-fila--ultima">
              <span>{tx("invitacion.rsvp.restriccionAlimentaria")}</span>
              <span className="sho-fila-valor">{restricciones || dieta || "—"}</span>
            </div>
          </div>
        )}

        {hayPago && monto != null && !exento && (
          <div className="sho-precio">
            <span>{estadoDePago === "PAID" ? tx("invitacion.pago.abonado") : tx("invitacion.pago.valor")}</span>
            <div className="sho-precio-valor">
              <span className="sho-precio-total">{formatearMoneda(totalAPagar)}</span>
              {usarTotalDelServidor && vistaDePago
                ? vistaDePago.lines.map((l, i) => <span key={i} className="sho-precio-detalle">{l}</span>)
                : (
                  <>
                    {adultos > 0 && <span className="sho-precio-detalle">{adultos} × {formatearMoneda(precioAdulto)}</span>}
                    {adolescentes > 0 && <span className="sho-precio-detalle">{adolescentes} × {formatearMoneda(precioAdo)}</span>}
                    {ninos > 0 && <span className="sho-precio-detalle">{ninos} × {formatearMoneda(precioNin)}</span>}
                  </>
                )}
            </div>
          </div>
        )}

        <div ref={selloRef} className="sho-sello" aria-hidden="true">{tx("invitacion.pase.confirmado").toUpperCase()}</div>
        <div ref={petalosRef} className="sho-petalos" aria-hidden="true" />
      </div>

      {error && <p className="sho-error">{error}</p>}

      {!confirmadoYa ? (
        <>
          <button type="button" data-xin="1" data-delay="220" className="sho-btn-solido" disabled={enviando} onClick={() => enviar("CONFIRMA")}>
            {enviando ? tx("invitacion.rsvp.guardando").toUpperCase() : tx("invitacion.rsvp.confirmarAsistencia").toUpperCase()}
          </button>
          <button type="button" data-xin="1" data-delay="280" className="sho-btn-fantasma" disabled={enviando} onClick={() => enviar("NO_ASISTE")}>
            {tx("invitacion.rsvp.noVoyAPoderAsistir").toUpperCase()}
          </button>
        </>
      ) : (
        <button type="button" className="sho-btn-fantasma" onClick={() => setEstado("PENDING")}>
          {tx("invitacion.rsvp.modificarAsistencia").toUpperCase()}
        </button>
      )}
    </>
  );
}

interface CancionItem { id: string; title: string; artist: string; guestName: string }

/** Sugerir una canción, en una tarjeta de papel con la lista debajo. */
function CancionesShojo({ invitationId, guestToken, guestName }: { invitationId: string; guestToken?: string; guestName: string }) {
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
      <form onSubmit={enviar} data-xin="1" data-delay="140" data-dist="30" className="sho-tarjeta sho-tarjeta--der">
        <div className="sho-campo">
          <label className="sho-etiqueta">{tx("invitacion.musica.tema").toUpperCase()}</label>
          <input value={tema} onChange={(e) => setTema(e.target.value)} placeholder={tx("invitacion.musica.nombreDeLaCancion")} maxLength={100} className="sho-input sho-input--serif" />
        </div>
        <div className="sho-campo">
          <label className="sho-etiqueta">{tx("invitacion.musica.artista").toUpperCase()}</label>
          <input value={artista} onChange={(e) => setArtista(e.target.value)} placeholder={tx("invitacion.musica.artista")} maxLength={80} className="sho-input sho-input--serif" />
        </div>
        {error && <p className="sho-error">{error}</p>}
        <button type="submit" disabled={enviando} className="sho-btn-solido sho-btn-solido--tinta">
          {enviando ? tx("invitacion.musica.enviando").toUpperCase() : tx("invitacion.musica.sugeriUnaCancion").toUpperCase()}
        </button>
      </form>

      {canciones.length > 0 && (
        <div data-xin="1" data-delay="220" className="sho-lista">
          {canciones.slice(0, 8).map((c) => (
            <div key={c.id} className="sho-lista-fila">
              <div className="sho-lista-texto">
                <span className="sho-lista-tema">{c.title}</span>
                <span className="sho-lista-quien">{c.artist} · {tx("invitacion.musica.sumadoPor")} {c.guestName || tx("invitacion.evento.invitado")}</span>
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
function TriviaShojo({ preguntas, invitationId, guestToken, guestName }: { preguntas: QuizPregunta[]; invitationId: string; guestToken?: string; guestName: string }) {
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
      <div data-xin="1" data-delay="140" data-dist="30" className="sho-tarjeta sho-tarjeta--izq">
        <span className="sho-tarjeta-kicker">{tx("invitacion.quiz.kicker").toUpperCase()}</span>
        <span className="sho-tarjeta-titulo">
          {guardando ? tx("invitacion.rsvp.guardando") : tx("invitacion.quiz.respondisteCorrectamente", { aciertos: puntaje, total: preguntas.length })}
        </span>
        {!guardando && stats && stats.count > 0 && (
          <p className="sho-tarjeta-mensaje">{tx("invitacion.quiz.promedio", { n: stats.count, avg: stats.avg })}</p>
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
    <div data-xin="1" data-delay="140" data-dist="30" className="sho-tarjeta sho-tarjeta--izq">
      <span className="sho-tarjeta-kicker">{tx("invitacion.quiz.preguntaDeTotal", { n: indice + 1, total: preguntas.length }).toUpperCase()}</span>
      <span className="sho-tarjeta-pregunta">{q.pregunta}</span>
      <div className="sho-opciones">
        {q.opciones.map((op, oi) => {
          let clase = "";
          if (yaEligio && correcta !== undefined) {
            if (oi === correcta) clase = " sho-opcion--bien";
            else if (elegidas[indice] === oi) clase = " sho-opcion--mal";
          }
          return (
            <button key={oi} type="button" disabled={yaEligio} onClick={() => elegir(oi)} className={`sho-opcion${clase}`}>
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
// leen la Bienvenida y el Post-evento compartidos (esperan `sho-section` y
// `sho-kicker`).
const CSS_SHO = `
  /* ── Shōjo ────────────────────────────────────────────────────────────
     Title card de anime: Cherry Bomb One en blanco con trazo de tinta y
     sombra plana doble (rosa y lila), M PLUS Rounded para el texto y los
     acentos en japonés. Líneas de velocidad, screentone, destellos que
     titilan, pétalos que caen, globos con cola de burbujas, bordes de
     tinta de 3 px con sombra sin blur. Todo CSS. */
  .sho-raiz { position: fixed; inset: 0; width: 100%; height: calc(var(--vh, 1vh) * 100); overflow: hidden;
    background: var(--pp-bg); color: var(--pp-ink); font-family: var(--sho-sans), 'M PLUS Rounded 1c', sans-serif;
    --sho-acc3: ${PALETA.acc3}; --sho-star: ${PALETA.star}; --sho-blanco: #FFFFFF; }
  .sho-raiz a { color: inherit; text-decoration: none; }
  .sho-raiz button { font: inherit; }

  .sho-scroller { position: absolute; inset: 0; overflow-y: auto; overflow-x: hidden; opacity: 0;
    transition: opacity 900ms ease 260ms; scrollbar-width: none; }
  .sho-scroller::-webkit-scrollbar { width: 0; height: 0; }

  /* Las líneas de velocidad: un abanico cónico desde un punto. */
  .sho-lineas { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
  .sho-lineas--tapa { background: repeating-conic-gradient(from 0deg at 62% 42%, var(--pp-acc2) 0deg 3deg, transparent 3deg 12deg); opacity: .18;
    -webkit-mask-image: radial-gradient(circle at 62% 42%, transparent 18%, #000 60%); mask-image: radial-gradient(circle at 62% 42%, transparent 18%, #000 60%); }
  .sho-lineas--std { background: repeating-conic-gradient(from 0deg at 20% 30%, #FFFFFF 0deg 2deg, transparent 2deg 14deg); opacity: .08; }
  .sho-lineas--panel { background: repeating-conic-gradient(from 0deg at 80% 20%, currentColor 0deg 2deg, transparent 2deg 14deg); opacity: .07; }
  .sho-lineas--checkin { background: repeating-conic-gradient(from 0deg at 90% 10%, #FFFFFF 0deg 2deg, transparent 2deg 12deg); opacity: .35; }
  .sho-lineas--quiz { background: repeating-conic-gradient(from 0deg at 50% 110%, #FFFFFF 0deg 3deg, transparent 3deg 12deg); opacity: .5; }
  /* El screentone: puntitos del acento. */
  .sho-trama { position: absolute; inset: 0; pointer-events: none; z-index: 0; background-image: radial-gradient(var(--pp-acc) 1.4px, transparent 1.6px); background-size: 9px 9px; }
  .sho-trama--tapa { opacity: .35; -webkit-mask-image: linear-gradient(180deg, transparent 35%, #000 100%); mask-image: linear-gradient(180deg, transparent 35%, #000 100%); }
  .sho-trama--frase { opacity: .4; }
  .sho-trama--musica { opacity: .25; background-image: radial-gradient(#FFFFFF 2.4px, transparent 2.6px); background-size: 12px 12px;
    -webkit-mask-image: linear-gradient(0deg, #000, transparent 55%); mask-image: linear-gradient(0deg, #000, transparent 55%); }
  /* Los destellos y los pétalos. */
  .sho-destellos { position: absolute; inset: 0; pointer-events: none; overflow: hidden; z-index: 0; }
  .sho-destello { position: absolute; animation: shoTitila 2.4s ease-in-out infinite; }
  .sho-destello--0 { color: var(--sho-star); } .sho-destello--1 { color: #FFFFFF; } .sho-destello--2 { color: var(--pp-acc); } .sho-destello--3 { color: var(--sho-acc3); }
  @keyframes shoTitila { 0%, 100% { opacity: .2; transform: scale(.6) rotate(0deg); } 50% { opacity: 1; transform: scale(1) rotate(20deg); } }
  .sho-petalo { position: absolute; top: 0; width: 18px; height: 18px; color: var(--pp-acc); animation: shoPetalo 11s linear infinite; }
  @keyframes shoPetalo { 0% { transform: translate3d(0, -10vh, 0) rotate(0deg); opacity: 0; } 10% { opacity: 1; } 100% { transform: translate3d(-12vw, 110vh, 0) rotate(300deg); opacity: 0; } }

  /* ── El pliego ─────────────────────────────────────────────────────── */
  .sho-section { position: relative; z-index: 1; min-height: calc(var(--vh, 1vh) * 100); box-sizing: border-box; overflow: hidden;
    display: flex; flex-direction: column; gap: 22px;
    padding: 60px max(20px, calc((100% - 1100px) / 2)) 80px; background: var(--pp-bg); color: var(--pp-ink); }

  /* El folio: M PLUS 800 con tracking. */
  .sho-folio { position: relative; z-index: 1; display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;
    font-weight: 800; font-size: 11px; letter-spacing: .24em; text-transform: uppercase; }
  .sho-folio--suave { color: var(--pp-ink2); }
  .sho-folio--gris { color: #8A7A9C; }
  .sho-folio--celeste { color: var(--sho-acc3); }
  .sho-folio--pie { align-items: center; margin-top: auto; letter-spacing: .2em; }
  .sho-panel > .sho-folio { opacity: .8; }
  .sho-folio--colofon { align-items: center; border-top: 2px dotted var(--sho-acc3); padding-top: 12px; }
  .sho-folio-etq { font-weight: 800; font-size: 12px; letter-spacing: .2em; text-transform: uppercase; display: block; color: var(--sho-acc3); }
  .sho-barra { width: 40%; height: 3px; background: var(--pp-ink); border-radius: 2px; }
  .sho-suave { color: var(--pp-ink2); }

  /* El spread: dos páginas; desde 1024 px se abren de verdad. */
  .sho-spread { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 22px; }
  .sho-pagina { display: flex; flex-direction: column; gap: 14px; min-width: 0; }
  @media (min-width: 1024px) {
    .sho-spread { display: grid; grid-template-columns: 1fr 1fr; align-items: center; column-gap: 72px; }
    .sho-spread > * { max-width: 560px; width: 100%; min-width: 0; }
    .sho-spread > *:first-child { justify-self: end; }
    .sho-spread > *:last-child { justify-self: start; }
    .sho-pagina--entera { grid-column: 1 / -1; max-width: none; justify-self: stretch; }
  }

  /* ── Tipos ─────────────────────────────────────────────────────────── */
  .sho-h2, .sho-panel-titulo, .sho-frase, .sho-fecha-linea, .sho-tapa-nombres { font-family: var(--sho-serif), 'Cherry Bomb One', cursive; font-weight: 400; }
  /* El título de opening: relleno blanco, trazo de tinta y sombra plana. */
  .sho-h2, .sho-panel-titulo { position: relative; z-index: 1; margin: 0; line-height: .9; font-size: clamp(52px, 15vw, 130px);
    color: #FFFFFF; -webkit-text-stroke: 2px var(--pp-ink); paint-order: stroke fill; text-shadow: 5px 6px 0 var(--pp-acc); }
  .sho-h2--album { font-size: clamp(44px, 12vw, 100px); text-shadow: 4px 5px 0 var(--pp-acc); }
  .sho-h2--sombra-tinta { text-shadow: 5px 6px 0 var(--pp-ink); }
  .sho-h2--sombra-lila { text-shadow: 5px 6px 0 var(--pp-acc2); }
  .sho-panel-titulo { font-size: clamp(52px, 16vw, 140px); text-shadow: 5px 6px 0 var(--sho-panel-acc, var(--pp-acc)); -webkit-text-stroke: 2px var(--sho-panel-trazo, var(--pp-ink)); }
  .sho-panel-sub { font-weight: 800; font-size: 12px; letter-spacing: .2em; text-transform: uppercase; color: var(--sho-panel-acc, var(--pp-acc)); }
  .sho-pagina--titulo { gap: 6px; }
  .sho-parrafo { margin: 0; font-weight: 700; font-size: 15px; line-height: 1.5; color: var(--pp-ink2); max-width: 40ch; }
  .sho-parrafo--tinta { color: var(--pp-ink); }
  .sho-acento { color: var(--pp-acc); }
  .sho-resalte { background: var(--sho-star); border-radius: 8px; padding: 0 .14em; }
  /* Píldoras, chips y stickers: borde de tinta y sombra plana. */
  .sho-pildora { display: inline-flex; align-items: center; gap: 8px; border: 3px solid var(--pp-acc); border-radius: 999px; padding: 10px 18px;
    font-weight: 800; font-size: 13px; letter-spacing: .12em; text-transform: uppercase; }
  .sho-pildora--blanca { background: #FFFFFF; color: var(--pp-ink); }
  .sho-chip { background: var(--pp-ink); color: #FFFFFF; font-weight: 800; font-size: 11px; letter-spacing: .24em; text-transform: uppercase; padding: 6px 12px; border-radius: 6px 6px 6px 0; align-self: flex-start; }
  .sho-sticker { display: inline-block; background: var(--sho-star); color: var(--pp-ink); border: 3px solid var(--pp-ink); border-radius: 999px; padding: 6px 16px 4px;
    font-family: var(--sho-serif), 'Cherry Bomb One', cursive; font-size: 24px; box-shadow: 3px 3px 0 var(--pp-ink); white-space: nowrap; }
  .sho-cta { margin-top: 4px; min-height: 48px; display: flex; align-items: center; justify-content: space-between; border: 3px solid var(--pp-ink); border-radius: 999px; padding: 0 18px;
    color: var(--pp-ink); background: var(--sho-panel-acc, var(--pp-acc)); font-weight: 800; font-size: 13px; letter-spacing: .14em; text-transform: uppercase; }

  /* ── 01 Guardá la fecha: próximo episodio ──────────────────────────── */
  .sho-std { background: var(--pp-ink); color: #FFFFFF; }
  .sho-fecha { display: flex; flex-direction: column; line-height: .88; }
  .sho-fecha-linea { font-size: clamp(64px, 20vw, 170px); }
  .sho-fecha-linea--dia { font-size: clamp(96px, 32vw, 240px); color: #FFFFFF; -webkit-text-stroke: 2px var(--pp-acc); paint-order: stroke fill; text-shadow: 6px 6px 0 var(--pp-acc); }
  .sho-fecha-linea--mes { text-align: right; color: var(--sho-acc3); }
  .sho-fecha-linea--anio { color: var(--sho-star); }
  .sho-fecha-pie { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 10px; font-weight: 800; font-size: 13px; letter-spacing: .12em; text-transform: uppercase; }
  /* La foto: marco blanco, sombra rosa y apenas torcida. */
  .sho-foto { position: relative; width: 100%; aspect-ratio: 4 / 5; border: 4px solid #FFFFFF; border-radius: 18px; box-sizing: border-box; overflow: visible;
    box-shadow: 8px 8px 0 var(--pp-acc); transform: rotate(-2deg); background: repeating-linear-gradient(135deg, #5A4470 0 8px, #4A3660 8px 16px); }
  .sho-foto-capa { position: absolute; inset: 0; overflow: hidden; border-radius: 14px; }
  .sho-foto-revelado { position: absolute; inset: 0; z-index: 1; pointer-events: none; border-radius: 14px;
    background-image: radial-gradient(var(--pp-acc) calc(var(--sho-punto, 7.2) * 1px), transparent calc(var(--sho-punto, 7.2) * 1px + .6px));
    background-size: 10px 10px; }
  .sho-foto-etq { position: absolute; left: 14px; bottom: 12px; z-index: 2; font-weight: 800; font-size: 12px; letter-spacing: .2em; text-transform: uppercase; color: #FFFFFF; }
  .sho-sticker--tsuzuku { position: absolute; right: -8px; top: 16px; z-index: 2; transform: rotate(6deg); }

  /* ── 02 Falta poco: la transformación ──────────────────────────────── */
  .sho-countdown { background: var(--pp-bg2); justify-content: space-between; padding-left: 0; padding-right: 0; }
  .sho-countdown > .sho-folio, .sho-countdown > .sho-spread { margin-left: max(20px, calc((100% - 1100px) / 2)); margin-right: max(20px, calc((100% - 1100px) / 2)); }
  .sho-marquesina { position: relative; z-index: 1; overflow: hidden; padding: 8px 0; white-space: nowrap; color: var(--pp-ink);
    border-top: 3px solid var(--pp-ink); border-bottom: 3px solid var(--pp-ink); font-weight: 800; font-size: 14px; letter-spacing: .2em; text-transform: uppercase; }
  .sho-marquesina--acento { background: var(--pp-acc); color: #FFFFFF; transform: rotate(-2deg) scale(1.04); padding: 6px 0;
    font-family: var(--sho-serif), 'Cherry Bomb One', cursive; font-weight: 400; font-size: 28px; letter-spacing: .04em; text-transform: none; -webkit-text-stroke: 1px var(--pp-ink); paint-order: stroke fill; }
  .sho-marquesina--celeste { background: var(--sho-acc3); transform: rotate(2deg) scale(1.04); }
  .sho-marquesina-tira { display: flex; width: max-content; animation: shoCorre 16s linear infinite; }
  .sho-marquesina-tira > span { padding-right: 32px; }
  .sho-marquesina--contraria .sho-marquesina-tira { animation-direction: reverse; }
  @keyframes shoCorre { to { transform: translate3d(-50%, 0, 0); } }
  .sho-cuenta { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .sho-cuenta-caja { position: relative; background: #FFFFFF; color: var(--pp-ink); border: 3px solid var(--pp-ink); border-radius: 20px; padding: 18px 14px 14px; display: flex; flex-direction: column; gap: 4px; overflow: hidden;
    --sho-caja: var(--pp-acc); box-shadow: 5px 6px 0 var(--sho-caja); }
  .sho-cuenta-caja::before { content: ""; position: absolute; inset: 0; pointer-events: none; background: repeating-conic-gradient(from 0deg at 50% 50%, var(--sho-caja) 0deg 4deg, transparent 4deg 16deg); opacity: .14; }
  .sho-cuenta-caja--2 { --sho-caja: var(--pp-acc2); }
  .sho-cuenta-caja--3 { --sho-caja: var(--sho-acc3); }
  .sho-cuenta-caja--4 { --sho-caja: var(--sho-star); }
  .sho-cuenta-num { position: relative; font-family: var(--sho-serif), 'Cherry Bomb One', cursive; font-size: clamp(64px, 20vw, 150px); line-height: .9; color: var(--sho-caja); -webkit-text-stroke: 1.5px var(--pp-ink); paint-order: stroke fill; font-variant-numeric: tabular-nums; }
  .sho-cuenta-num > span { display: inline-block; animation: shoCifra 300ms cubic-bezier(.16,1,.3,1); }
  @keyframes shoCifra { from { transform: translateY(18%); opacity: .4; } to { transform: none; opacity: 1; } }
  .sho-cuenta-etq { position: relative; font-weight: 800; font-size: 12px; letter-spacing: .22em; text-transform: uppercase; }
  .sho-tarjeta--hoy { background: #FFFFFF; color: var(--pp-ink); border: 3px solid var(--pp-ink); border-radius: 20px; padding: 18px; box-shadow: 5px 6px 0 var(--pp-acc); transform: rotate(-1deg);
    display: flex; flex-direction: column; gap: 6px; }
  .sho-tarjeta--hoy .sho-tarjeta-kicker { font-weight: 800; font-size: 12px; letter-spacing: .22em; text-transform: uppercase; color: var(--pp-ink2); }
  .sho-tarjeta--hoy .sho-tarjeta-titulo { font-family: var(--sho-serif), 'Cherry Bomb One', cursive; font-size: clamp(40px, 11vw, 90px); line-height: .9; color: #FFFFFF; -webkit-text-stroke: 2px var(--pp-ink); paint-order: stroke fill; text-shadow: 4px 5px 0 var(--pp-acc); }

  /* ── 03 Unas palabras: el monólogo interior ────────────────────────── */
  .sho-frase-seccion { justify-content: space-between; gap: 30px; }
  .sho-pensamiento { position: relative; background: #FFFFFF; border: 3px solid var(--pp-ink); border-radius: 34px; padding: 24px 22px 26px; box-shadow: 7px 8px 0 var(--pp-acc2); max-width: 520px; }
  .sho-burbujita { position: absolute; border-radius: 50%; background: #FFFFFF; border: 3px solid var(--pp-ink); }
  .sho-burbujita--grande { left: 40px; bottom: -18px; width: 22px; height: 22px; }
  .sho-burbujita--chica { left: 24px; bottom: -34px; width: 12px; height: 12px; }
  .sho-frase { margin: 0; font-size: clamp(30px, 8.5vw, 64px); line-height: 1.05; letter-spacing: .01em; }
  /* El cartel キラキラ: celeste, flota. */
  .sho-kirakira { position: relative; align-self: flex-end; background: var(--sho-acc3); color: var(--pp-ink); border: 3px solid var(--pp-ink); border-radius: 16px; padding: 14px 18px; max-width: 260px; box-shadow: 5px 6px 0 var(--pp-ink);
    animation: shoFlota 4s ease-in-out infinite; }
  .sho-kirakira-titulo { font-family: var(--sho-serif), 'Cherry Bomb One', cursive; font-size: 28px; line-height: 1; display: block; }
  .sho-kirakira-texto { display: block; font-weight: 700; font-size: 14px; margin-top: 4px; }
  @keyframes shoFlota { 0%, 100% { transform: translateY(0) rotate(-4deg); } 50% { transform: translateY(-8px) rotate(4deg); } }

  /* ── 04 Viñetas ────────────────────────────────────────────────────── */
  .sho-pan { position: relative; z-index: 1; height: calc(100vh + var(--st-pasos, 2) * 90vh); }
  .sho-pan-fijo { position: sticky; top: 0; height: calc(var(--vh, 1vh) * 100); overflow: hidden; background: var(--pp-bg2); }
  .sho-pan-fijo--album { background: #F7F5F0; }
  .sho-tira { position: absolute; top: 0; left: 0; height: 100%; display: flex; will-change: transform; }
  .sho-panel { flex: 0 0 100vw; min-width: 0; height: 100%; box-sizing: border-box; position: relative; overflow: hidden;
    display: flex; flex-direction: column; justify-content: space-between; gap: 18px;
    padding: 60px max(20px, calc((100vw - 1100px) / 2)) 92px; background: var(--pp-bg2); color: var(--pp-ink); }
  .sho-panel--escenario { --sho-panel-acc: var(--pp-acc); --sho-panel-trazo: var(--pp-ink); }
  .sho-panel--escena { --sho-panel-acc: var(--sho-acc3); --sho-panel-trazo: var(--pp-acc); background: var(--pp-ink); color: #FFFFFF; }
  .sho-panel--mapa { --sho-panel-acc: var(--sho-acc3); --sho-panel-trazo: var(--pp-ink); background: var(--pp-bg); }
  .sho-panel--guion { --sho-panel-acc: var(--pp-acc2); --sho-panel-trazo: var(--pp-ink); background: var(--pp-bg); }
  .sho-pan[data-scroll="vertical"] { height: auto; }
  .sho-pan[data-scroll="vertical"] .sho-pan-fijo { position: static; height: auto; overflow: visible; }
  .sho-pan[data-scroll="vertical"] .sho-tira { position: static; display: block; width: 100%; transform: none !important; }
  .sho-pan[data-scroll="vertical"] .sho-panel { height: auto; min-height: calc(var(--vh, 1vh) * 100); }
  .sho-ficha { background: #FFFFFF; color: var(--pp-ink); border: 3px solid var(--pp-ink); border-radius: 18px; padding: 14px 16px; box-shadow: 5px 6px 0 var(--sho-panel-acc, var(--pp-acc)); display: flex; flex-direction: column; gap: 8px; }
  .sho-linea { display: flex; justify-content: space-between; gap: 14px; padding: 6px 0; border-bottom: 2px dotted var(--pp-ink2); font-size: 15px; line-height: 1.3; }
  .sho-linea > span:first-child { font-weight: 800; font-size: 11px; letter-spacing: .16em; text-transform: uppercase; color: var(--pp-ink2); flex: 0 0 auto; padding-top: 2px; }
  .sho-linea > span:last-child { text-align: right; font-weight: 700; }
  .sho-mapa { height: 190px; overflow: hidden; border: 3px solid var(--pp-ink); border-radius: 12px; }
  /* Los puntos son destellos de cuatro puntas. */
  .sho-puntos { position: absolute; left: 0; right: 40px; bottom: 30px; display: flex; gap: 8px; justify-content: center; z-index: 2; }
  .sho-punto { width: 18px; height: 18px; background: currentColor !important; opacity: .3; transition: opacity 300ms ease; display: inline-block;
    clip-path: polygon(50% 0, 58% 42%, 100% 50%, 58% 58%, 50% 100%, 42% 58%, 0 50%, 42% 42%); }
  .sho-punto[data-activo="1"] { opacity: 1; }

  /* ── 05 Check-in: ficha de personaje ───────────────────────────────── */
  .sho-checkin { background: var(--sho-acc3); color: var(--pp-ink); }
  .sho-cupon { position: relative; background: #FFFFFF; color: var(--pp-ink); border: 3px solid var(--pp-ink); border-radius: 22px; padding: 20px; display: flex; flex-direction: column; gap: 14px; overflow: hidden;
    box-shadow: 7px 8px 0 var(--pp-ink); transition: border-color 400ms ease; }
  .sho-cupon:has(.sho-filas) { border-color: var(--pp-acc); }
  .sho-cupon .sho-tarjeta { position: relative; display: flex; flex-direction: column; gap: 14px; background: transparent; border: 0; padding: 0; transform: none !important; }
  .sho-talon-top { display: flex; justify-content: space-between; align-items: center; gap: 10px; font-weight: 800; font-size: 11px; letter-spacing: .2em; text-transform: uppercase; color: var(--pp-ink2); border-bottom: 3px dotted var(--pp-ink2); padding-bottom: 12px; }
  .sho-talon-estado { display: flex; align-items: center; gap: 6px; transition: color 400ms ease; }
  .sho-talon-estado::before { content: ""; width: 8px; height: 8px; border-radius: 50%; background: currentColor; animation: shoParpadea 1.4s ease-in-out infinite; }
  .sho-cupon:has(.sho-filas) .sho-talon-estado { color: var(--pp-acc); }
  .sho-cupon:has(.sho-filas) .sho-talon-estado::before { animation: none; }
  @keyframes shoParpadea { 0%, 100% { opacity: 1; } 50% { opacity: .3; } }
  .sho-campo { display: flex; flex-direction: column; gap: 6px; }
  .sho-etiqueta { font-weight: 800; font-size: 11px; letter-spacing: .18em; text-transform: uppercase; color: var(--pp-ink2); }
  .sho-input { min-height: 48px; border: 0; border-bottom: 3px solid var(--pp-ink); border-radius: 0; background: transparent; color: var(--pp-ink);
    font-family: var(--sho-sans), 'M PLUS Rounded 1c', sans-serif; font-weight: 700; font-size: 16px; padding: 0; outline: none; }
  .sho-contador { display: flex; align-items: center; border-bottom: 3px solid var(--pp-ink); min-height: 48px; }
  .sho-contador button { width: 44px; min-height: 44px; border: 0; background: transparent; color: var(--pp-ink); cursor: pointer; font-family: var(--sho-serif), 'Cherry Bomb One', cursive; font-size: 26px; line-height: 1; }
  .sho-contador button:disabled { opacity: .35; cursor: default; }
  .sho-contador > span { flex: 1; text-align: center; font-family: var(--sho-serif), 'Cherry Bomb One', cursive; font-size: 30px; line-height: 1; color: var(--pp-acc); }
  .sho-filas { display: flex; flex-direction: column; }
  .sho-fila { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 2px dotted var(--pp-ink2); font-size: 15px; }
  .sho-fila--ultima { border-bottom: 0; }
  .sho-fila-valor { text-align: right; font-weight: 700; }
  .sho-precio { display: flex; justify-content: space-between; gap: 12px; font-weight: 800; font-size: 12px; letter-spacing: .12em; text-transform: uppercase; color: var(--pp-ink2); padding-top: 4px; }
  .sho-precio-valor { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; color: var(--pp-ink); }
  .sho-precio-total { font-family: var(--sho-serif), 'Cherry Bomb One', cursive; font-size: 24px; line-height: 1; color: var(--pp-acc); }
  .sho-precio-detalle { font-size: 11px; letter-spacing: .1em; }
  .sho-btn-solido { min-height: 54px; border: 3px solid var(--pp-ink); border-radius: 999px; background: var(--pp-acc2); color: #FFFFFF; cursor: pointer;
    font-family: var(--sho-serif), 'Cherry Bomb One', cursive; font-size: 22px; padding: 2px 18px 0; box-shadow: 4px 5px 0 var(--pp-ink); -webkit-text-stroke: 1px var(--pp-ink); paint-order: stroke fill; transition: background 200ms ease; }
  @media (hover: hover) { .sho-btn-solido:hover { background: var(--pp-acc); } }
  .sho-btn-solido:disabled { opacity: .6; cursor: default; }
  .sho-btn-fantasma { min-height: 48px; border: 3px solid var(--pp-ink); border-radius: 999px; background: transparent; color: var(--pp-ink); cursor: pointer;
    font-family: var(--sho-serif), 'Cherry Bomb One', cursive; font-size: 19px; padding: 2px 18px 0; }
  .sho-error { margin: 0; font-weight: 800; font-size: 12px; color: var(--pp-acc); }
  /* El sello "¡Sí!": la estrella de diez puntas amarilla. */
  .sho-cupon .sho-sello { position: absolute; right: 10px; bottom: 78px; width: 140px; aspect-ratio: 1; pointer-events: none;
    opacity: 0; transform: rotate(18deg) scale(1.9) translateY(-120px);
    background: var(--sho-star); clip-path: polygon(50% 4%, 57% 20%, 74% 12%, 70% 30%, 88% 34%, 76% 46%, 90% 58%, 72% 62%, 74% 80%, 58% 72%, 50% 88%, 42% 72%, 26% 80%, 28% 62%, 10% 58%, 24% 46%, 12% 34%, 30% 30%, 26% 12%, 43% 20%);
    display: flex; align-items: flex-end; justify-content: center; padding-bottom: 28px; box-sizing: border-box;
    font-weight: 800; font-size: 8px; letter-spacing: .12em; text-transform: uppercase; color: var(--pp-ink); }
  .sho-cupon .sho-sello::before { content: "¡Sí!"; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
    font-family: var(--sho-serif), 'Cherry Bomb One', cursive; font-size: 30px; letter-spacing: 0; color: var(--pp-acc); -webkit-text-stroke: 1px var(--pp-ink); paint-order: stroke fill; }
  .sho-petalos { display: none; }

  /* ── 06 Álbum: fotogramas ──────────────────────────────────────────── */
  .sho-panel--album { background: #F7F5F0; color: #3B2A4A; justify-content: flex-start; gap: 14px; }
  .sho-panel--album-b { background: #EFEBE3; }
  .sho-panel--album .sho-h2 { -webkit-text-stroke: 2px #3B2A4A; }
  .sho-hoja { flex: 1; min-height: 0; display: grid; grid-template-columns: repeat(6, 1fr); grid-template-rows: repeat(3, 1fr); gap: 10px; max-width: 900px; }
  .sho-foto-hoja { position: relative; overflow: hidden; min-height: 0; cursor: pointer; border: 3px solid #3B2A4A; border-radius: 14px; box-shadow: 4px 4px 0 #3B2A4A;
    background: repeating-linear-gradient(135deg, #D7D1C4 0 8px, #E6E1D6 8px 16px); }
  .sho-foto-hoja:nth-child(1) { transform: rotate(-1.5deg); }
  .sho-foto-hoja:nth-child(2) { transform: rotate(1.5deg); }
  .sho-foto-hoja:nth-child(3) { transform: rotate(-1deg); }
  .sho-foto-hoja:nth-child(4) { transform: rotate(2deg); }
  .sho-foto-hoja:nth-child(5) { transform: rotate(.5deg); }
  .sho-foto-hoja-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
  .sho-bano { position: absolute; inset: 0; mix-blend-mode: multiply; opacity: 0; transition: opacity 200ms linear; }
  .sho-bano--1 { background: color-mix(in srgb, var(--pp-acc) 50%, transparent); }
  .sho-bano--2 { background: color-mix(in srgb, var(--pp-acc2) 50%, transparent); }
  .sho-bano--3 { background: color-mix(in srgb, var(--sho-acc3) 55%, transparent); }
  .sho-bano--4 { background: color-mix(in srgb, var(--sho-star) 60%, transparent); }
  .sho-bano--5 { background: rgba(141,240,210,.5); }
  .sho-foto-hoja-n { position: absolute; left: 8px; bottom: 6px; z-index: 1; font-weight: 800; font-size: 11px; letter-spacing: .14em; color: #3B2A4A; }
  .sho-hoja[data-cantidad="5"] .sho-foto-hoja:nth-child(1) { grid-column: 1 / 4; grid-row: 1 / 3; }
  .sho-hoja[data-cantidad="5"] .sho-foto-hoja:nth-child(2) { grid-column: 4 / 7; grid-row: 1 / 2; }
  .sho-hoja[data-cantidad="5"] .sho-foto-hoja:nth-child(3) { grid-column: 4 / 6; grid-row: 2 / 3; }
  .sho-hoja[data-cantidad="5"] .sho-foto-hoja:nth-child(4) { grid-column: 6 / 7; grid-row: 2 / 3; }
  .sho-hoja[data-cantidad="5"] .sho-foto-hoja:nth-child(5) { grid-column: 1 / 7; grid-row: 3 / 4; }
  .sho-hoja[data-cantidad="4"] .sho-foto-hoja:nth-child(1) { grid-column: 1 / 4; grid-row: 1 / 3; }
  .sho-hoja[data-cantidad="4"] .sho-foto-hoja:nth-child(2) { grid-column: 4 / 7; grid-row: 1 / 2; }
  .sho-hoja[data-cantidad="4"] .sho-foto-hoja:nth-child(3) { grid-column: 4 / 7; grid-row: 2 / 3; }
  .sho-hoja[data-cantidad="4"] .sho-foto-hoja:nth-child(4) { grid-column: 1 / 7; grid-row: 3 / 4; }
  .sho-hoja[data-cantidad="3"] .sho-foto-hoja:nth-child(1) { grid-column: 1 / 4; grid-row: 1 / 4; }
  .sho-hoja[data-cantidad="3"] .sho-foto-hoja:nth-child(2) { grid-column: 4 / 7; grid-row: 1 / 3; }
  .sho-hoja[data-cantidad="3"] .sho-foto-hoja:nth-child(3) { grid-column: 4 / 7; grid-row: 3 / 4; }
  .sho-hoja[data-cantidad="2"] .sho-foto-hoja:nth-child(1) { grid-column: 1 / 4; grid-row: 1 / 4; }
  .sho-hoja[data-cantidad="2"] .sho-foto-hoja:nth-child(2) { grid-column: 4 / 7; grid-row: 1 / 4; }
  .sho-hoja[data-cantidad="1"] .sho-foto-hoja:nth-child(1) { grid-column: 1 / 7; grid-row: 1 / 4; }

  /* ── 07 Música: opening / ending ───────────────────────────────────── */
  .sho-musica { background: var(--pp-acc2); color: var(--pp-ink); }
  .sho-h2-sub { color: #FFFFFF; }
  .sho-eq { display: flex; align-items: flex-end; gap: 6px; height: 40px; }
  .sho-eq span { width: 9px; height: 100%; background: var(--pp-ink); border-radius: 5px; transform-origin: bottom; animation: shoEq 1.1s ease-in-out infinite; }
  .sho-eq span:nth-child(2) { background: var(--pp-acc); }
  .sho-eq span:nth-child(3) { background: #FFFFFF; }
  .sho-eq span:nth-child(4) { background: var(--sho-star); }
  @keyframes shoEq { 0%, 100% { transform: scaleY(.3); } 50% { transform: scaleY(1); } }
  .sho-musica form.sho-tarjeta { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; transform: none !important; }
  .sho-musica .sho-etiqueta { display: none; }
  .sho-musica .sho-input { min-height: 48px; border: 3px solid var(--pp-ink); border-radius: 14px; background: #FFFFFF; color: var(--pp-ink); font-weight: 700; font-size: 15px; padding: 0 14px; min-width: 0; }
  .sho-musica .sho-error { grid-column: 1 / -1; }
  .sho-musica .sho-btn-solido { grid-column: 1 / -1; min-height: 50px; background: var(--sho-star); color: var(--pp-ink); font-size: 20px; -webkit-text-stroke: 0; }
  @media (hover: hover) { .sho-musica .sho-btn-solido:hover { background: var(--pp-acc); color: #FFFFFF; } }
  .sho-lista { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
  .sho-lista-fila { display: flex; align-items: center; gap: 12px; padding: 10px 14px; background: #FFFFFF; border: 3px solid var(--pp-ink); border-radius: 16px; box-shadow: 3px 4px 0 var(--pp-ink); counter-increment: tema; }
  .sho-lista { counter-reset: tema; }
  .sho-lista-fila::before { content: "♪"; font-family: var(--sho-serif), 'Cherry Bomb One', cursive; font-size: 20px; color: var(--pp-acc); width: 28px; text-align: center; flex: 0 0 auto; }
  .sho-lista-texto { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .sho-lista-tema { font-weight: 800; font-size: 17px; line-height: 1.1; }
  .sho-lista-quien { font-weight: 700; font-size: 12px; letter-spacing: .1em; text-transform: uppercase; color: var(--pp-ink2); }

  /* ── 08 Regalos: ítems ─────────────────────────────────────────────── */
  .sho-tarjeta--banco { --sho-sombra: var(--pp-acc); position: relative; z-index: 1; background: #FFFFFF; color: var(--pp-ink); border: 3px solid var(--pp-ink); border-radius: 18px; padding: 16px 18px;
    display: flex; flex-direction: column; gap: 10px; box-shadow: 5px 6px 0 var(--sho-sombra); transform: none !important; }
  .sho-tarjeta--der { --sho-sombra: var(--sho-acc3); }
  .sho-tarjeta--banco + .sho-tarjeta--banco { margin-top: 14px; }
  .sho-tarjeta-kicker { font-weight: 800; font-size: 11px; letter-spacing: .18em; text-transform: uppercase; color: var(--pp-ink2); }
  .sho-tarjeta-mensaje { margin: 0; font-weight: 600; font-size: 14px; line-height: 1.5; color: var(--pp-ink2); }
  .sho-fila-texto { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .sho-fila-etq { font-weight: 800; font-size: 11px; letter-spacing: .18em; text-transform: uppercase; color: var(--pp-ink2); }
  .sho-fila-dato { font-weight: 800; font-size: 14px; letter-spacing: .04em; overflow-wrap: anywhere; }
  .sho-fila--copiable:first-child .sho-fila-dato { font-family: var(--sho-serif), 'Cherry Bomb One', cursive; font-weight: 400; font-size: 22px; line-height: 1; color: var(--sho-sombra); -webkit-text-stroke: 1px var(--pp-ink); paint-order: stroke fill; }
  .sho-tarjeta--banco .sho-fila--ultima { border-bottom: 0; font-weight: 700; font-size: 12px; letter-spacing: .1em; text-transform: uppercase; color: var(--pp-ink2); }
  .sho-btn-copiar { flex: 0 0 auto; min-height: 44px; padding: 0 14px; border: 3px solid var(--pp-ink); border-radius: 999px; background: var(--sho-sombra); color: var(--pp-ink); cursor: pointer;
    font-weight: 800; font-size: 12px; letter-spacing: .12em; text-transform: uppercase; }
  .sho-btn-copiar--hecho { background: var(--pp-ink); color: #FFFFFF; }

  /* ── 09 Trivia de fans ─────────────────────────────────────────────── */
  .sho-quiz { background: var(--sho-star); color: var(--pp-ink); }
  .sho-quiz .sho-tarjeta { display: flex; flex-direction: column; gap: 12px; transform: none !important; }
  .sho-quiz .sho-tarjeta-kicker { align-self: flex-start; background: var(--pp-ink); color: #FFFFFF; border-radius: 999px; font-weight: 800; font-size: 12px; letter-spacing: .18em; text-transform: uppercase; padding: 8px 16px; }
  .sho-quiz .sho-tarjeta-pregunta, .sho-quiz .sho-tarjeta-titulo { font-family: var(--sho-serif), 'Cherry Bomb One', cursive; font-size: clamp(40px, 11vw, 96px); line-height: .95; max-width: 14ch;
    color: #FFFFFF; -webkit-text-stroke: 2px var(--pp-ink); paint-order: stroke fill; text-shadow: 4px 5px 0 var(--pp-acc); }
  .sho-quiz .sho-tarjeta-mensaje { margin: 0; font-weight: 700; font-size: 15px; color: var(--pp-ink); }
  .sho-opciones { display: flex; flex-direction: column; gap: 10px; counter-reset: opcion; }
  .sho-opcion { min-height: 54px; border: 3px solid var(--pp-ink); border-radius: 18px; background: #FFFFFF; color: var(--pp-ink); cursor: pointer; counter-increment: opcion;
    font-family: var(--sho-sans), 'M PLUS Rounded 1c', sans-serif; font-weight: 800; font-size: 16px; text-align: left; padding: 0 18px; box-shadow: 4px 5px 0 var(--pp-ink);
    display: flex; justify-content: space-between; align-items: center; gap: 12px; transition: background 200ms ease; }
  .sho-opcion::after { content: counter(opcion, upper-alpha); font-family: var(--sho-serif), 'Cherry Bomb One', cursive; font-size: 20px; }
  .sho-opcion--bien { background: var(--sho-acc3); }
  .sho-opcion--bien::after { content: "✦ ¡Sí!"; }
  .sho-opcion--mal { background: var(--pp-acc); color: #FFFFFF; }
  .sho-opcion--mal::after { content: "Casi"; }
  @media (min-width: 1024px) {
    .sho-quiz .sho-spread > .sho-tarjeta { grid-column: 1 / -1; max-width: none; justify-self: stretch; display: grid; grid-template-columns: 1fr 1fr; column-gap: 72px; align-items: center; }
    .sho-quiz .sho-tarjeta-kicker { grid-column: 1; justify-self: end; margin-right: auto; }
    .sho-quiz .sho-tarjeta-pregunta { grid-column: 1; max-width: 560px; justify-self: end; width: 100%; }
    .sho-quiz .sho-opciones { grid-column: 2; grid-row: 1 / span 2; max-width: 560px; width: 100%; }
  }

  /* ── 10 Tu pase: el ticket del festival ────────────────────────────── */
  .sho-pase { background: var(--pp-ink); color: #FFFFFF; justify-content: space-between; padding-bottom: calc(28px + env(safe-area-inset-bottom)); }
  .sho-pagina--qr { align-items: flex-start; }
  .sho-qr { position: relative; width: min(100%, 300px); aspect-ratio: 1; background: #FFFFFF; padding: 16px; box-sizing: border-box; border: 4px solid var(--pp-acc); border-radius: 22px;
    box-shadow: 8px 8px 0 var(--pp-acc2); transform: rotate(-2deg); margin-bottom: 30px; }
  .sho-qr .qr-ingreso, .sho-qr section { background: transparent !important; border: none !important; padding: 0 !important; }
  .sho-qr img, .sho-qr svg, .sho-qr canvas { width: 100% !important; height: auto !important; display: block; }
  .sho-qr-etq { position: absolute; left: 0; right: 0; bottom: -28px; text-align: center; font-weight: 800; font-size: 11px; letter-spacing: .2em; text-transform: uppercase; color: var(--sho-acc3); }
  .sho-pase-cabeza { display: flex; align-items: flex-end; justify-content: space-between; gap: 14px; }
  .sho-pase-numero, .sho-pase-mesa { display: flex; flex-direction: column; }
  .sho-pase-mesa { align-items: flex-end; text-align: right; }
  .sho-pase-numero > span:last-child { font-family: var(--sho-serif), 'Cherry Bomb One', cursive; font-size: clamp(72px, 22vw, 160px); line-height: .88; color: #FFFFFF; -webkit-text-stroke: 2px var(--pp-acc); paint-order: stroke fill; text-shadow: 5px 6px 0 var(--pp-acc); }
  .sho-pase-mesa > span:last-child { font-family: var(--sho-serif), 'Cherry Bomb One', cursive; font-size: clamp(44px, 13vw, 96px); line-height: .9; color: var(--sho-star); }
  .sho-caja { display: flex; flex-direction: column; background: #FFFFFF; color: var(--pp-ink); border: 3px solid var(--pp-acc); border-radius: 18px; padding: 6px 16px; box-shadow: 5px 6px 0 var(--pp-acc2); }
  .sho-caja .sho-linea { padding: 10px 0; font-size: 14px; }
  .sho-caja .sho-linea:last-child { border-bottom: 0; }
  .sho-caja .sho-linea > span:last-child { font-weight: 700; line-height: 1.35; }
  .sho-info-extra { margin-top: 4px; }
  .sho-info-extra #info-adicional { background: transparent !important; padding: 0 !important; }
  .sho-info-extra #ia-trigger-btn { background: #FFFFFF !important; color: var(--pp-ink) !important; border: 3px solid var(--pp-acc) !important;
    border-radius: 999px !important; font-weight: 800 !important; letter-spacing: .14em !important; text-transform: uppercase; box-shadow: 3px 4px 0 var(--pp-acc2); }
  .sho-raiz .ia-icon-box, .sho-raiz svg.lucide { display: none !important; }
  .sho-pase-pie { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 14px; }
  .sho-despedida { font-family: var(--sho-serif), 'Cherry Bomb One', cursive; font-size: clamp(30px, 8vw, 50px); line-height: 1; color: #FFFFFF; -webkit-text-stroke: 1px var(--pp-acc); paint-order: stroke fill; text-shadow: 3px 4px 0 var(--pp-acc); }
  .sho-replay { cursor: pointer; color: var(--sho-star); }
  .sho-credito { display: inline-flex; opacity: .85; }

  /* ── La tapa: title card ───────────────────────────────────────────── */
  .sho-portada { position: absolute; inset: 0; z-index: 5; overflow: hidden; background: var(--pp-bg); color: var(--pp-ink); }
  .sho-portada-hoja { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box;
    padding: calc(16px + env(safe-area-inset-top)) max(20px, calc((100% - 1100px) / 2)) calc(18px + env(safe-area-inset-bottom)); }
  .sho-tapa-cabecera { position: relative; z-index: 1; display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
  .sho-tapa-episodio { display: flex; flex-direction: column; gap: 4px; }
  .sho-tapa-jp { font-weight: 700; font-size: 12px; color: var(--pp-acc2); letter-spacing: .1em; }
  .sho-tapa-numero { font-weight: 800; font-size: 12px; letter-spacing: .18em; text-transform: uppercase; text-align: right; line-height: 1.3; color: var(--pp-ink2); }
  .sho-tapa-centro { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 10px; }
  .sho-tapa-kicker { font-weight: 800; font-size: 13px; letter-spacing: .2em; text-transform: uppercase; color: var(--pp-acc); }
  /* El nombre: blanco con trazo de tinta y doble sombra (rosa y lila); el
     segundo renglón sangrado. El más largo manda el cuerpo. */
  .sho-tapa-nombres { margin: 0; line-height: .9; letter-spacing: .01em; display: flex; flex-direction: column;
    color: #FFFFFF; -webkit-text-stroke: 2px var(--pp-ink); paint-order: stroke fill; text-shadow: 5px 6px 0 var(--pp-acc), 10px 12px 0 var(--pp-acc2);
    font-size: min(clamp(64px, 23vw, 200px), 20vh, calc((100vw - 44px) / (var(--largo, 6) * 0.56))); }
  @media (min-width: 1024px) { .sho-tapa-nombres { font-size: min(15vw, 250px, 24vh, calc((min(100vw, 1100px) - 44px) / (var(--largo, 6) * 0.56))); } }
  .sho-tapa-nombres--largo { font-size: min(clamp(48px, 16vw, 140px), 14vh, calc((100vw - 44px) / (var(--largo, 9) * 0.56))); }
  .sho-tapa-linea { overflow: hidden; display: block; white-space: nowrap; padding: 0 12px 12px 0; margin: 0 -12px -12px 0; }
  .sho-tapa-linea > span { display: block; }
  .sho-tapa-linea--sangra { padding-left: 20%; }
  .sho-tapa-nombres--largo .sho-tapa-linea--sangra { padding-left: 8%; }
  .sho-letra { display: inline-block; animation: shoSalta calc(var(--n, 9) * 3.2s) cubic-bezier(.34,1.56,.64,1) infinite; animation-delay: calc(var(--i, 0) * -3.2s); }
  @keyframes shoSalta { 0%, 99% { transform: none; } 99.3% { transform: translateY(-16px) scale(1.12); } 100% { transform: none; } }
  .sho-emblema { display: flex; align-items: center; gap: 10px; }
  .sho-emblema-barra { flex: 1; height: 3px; background: var(--pp-ink); border-radius: 2px; }
  .sho-emblema-texto { font-family: var(--sho-serif), 'Cherry Bomb One', cursive; font-size: clamp(20px, 6vw, 30px); color: var(--pp-acc); -webkit-text-stroke: 1px var(--pp-ink); paint-order: stroke fill; }
  .sho-tapa-datos { display: flex; justify-content: space-between; align-items: flex-end; gap: 14px; font-weight: 700; font-size: 13px; line-height: 1.35; }
  .sho-tapa-datos-der { text-align: right; }
  .sho-tapa-pie { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 12px; }
  /* El globo del mensaje: blanco, esquina recta abajo a la izquierda,
     sombra lila y un destello en la esquina. */
  .sho-globo { position: relative; background: #FFFFFF; color: var(--pp-ink); border: 3px solid var(--pp-ink); border-radius: 24px 24px 24px 6px; padding: 14px 18px; max-width: 340px; box-shadow: 4px 5px 0 var(--pp-acc2); }
  .sho-globo-estrella { position: absolute; right: -14px; top: -14px; width: 30px; height: 30px; fill: var(--sho-star); stroke: var(--pp-ink); stroke-width: 2; animation: shoTitila 2.4s ease-in-out infinite; }
  .sho-tapa-mensaje { margin: 0; font-weight: 700; font-size: clamp(16px, 4.4vw, 20px); line-height: 1.35; }
  .sho-tapa-btn { min-height: 54px; min-width: 250px; align-self: flex-start; border: 3px solid var(--pp-ink); border-radius: 999px; background: var(--pp-acc); color: #FFFFFF; cursor: pointer;
    font-family: var(--sho-serif), 'Cherry Bomb One', cursive; font-size: 22px; letter-spacing: .04em; padding: 2px 24px 0; -webkit-text-stroke: 1px var(--pp-ink); paint-order: stroke fill;
    display: flex; align-items: center; justify-content: space-between; gap: 12px; box-shadow: 4px 5px 0 var(--pp-ink); transition: background 200ms ease; }
  @media (hover: hover) { .sho-tapa-btn:hover { background: var(--pp-acc2); } }

  /* ── Riel, pista y lupa ────────────────────────────────────────────── */
  .sho-riel { position: absolute; right: 0; top: 0; bottom: 0; width: 40px; z-index: 4; display: flex; flex-direction: column;
    align-items: center; justify-content: space-between; padding: calc(16px + env(safe-area-inset-top)) 0 calc(16px + env(safe-area-inset-bottom));
    opacity: 0; transition: opacity 600ms ease; pointer-events: none; color: var(--pp-ink); border-left: 3px dotted currentColor !important; }
  .sho-riel-top { writing-mode: vertical-rl; font-family: var(--sho-serif), 'Cherry Bomb One', cursive; font-size: 14px; letter-spacing: .2em; color: inherit !important; }
  .sho-riel-etiqueta { writing-mode: vertical-rl; font-weight: 800; font-size: 10px; letter-spacing: .28em; text-transform: uppercase; color: inherit; }
  .sho-riel-linea { flex: 1; width: 1px; margin: 16px 0; background: transparent !important; position: relative; }
  .sho-riel-barra { position: absolute; left: -3px; top: 0; width: 6px; height: 0%; background: var(--pp-acc); border-radius: 3px; transition: height 200ms linear; display: block; }
  .sho-pista { position: absolute; left: 0; right: 40px; bottom: calc(18px + env(safe-area-inset-bottom)); z-index: 6; text-align: center;
    font-weight: 800; font-size: 11px; letter-spacing: .28em; text-transform: uppercase; color: var(--pp-acc);
    opacity: 0; transition: opacity 600ms ease; pointer-events: none; animation: shoPista 2.4s ease-in-out infinite; }
  @keyframes shoPista { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(6px); } }

  .sho-lupa { position: fixed; inset: 0; z-index: 200; background: rgba(59,42,74,.94);
    display: flex; align-items: center; justify-content: center; padding: 24px; cursor: zoom-out; }
  .sho-lupa-cerrar { position: absolute; top: 20px; right: 20px; width: 40px; height: 40px; border: 3px solid var(--pp-ink); border-radius: 50%;
    background: var(--sho-star); color: var(--pp-ink); font-size: 18px; line-height: 1; cursor: pointer; box-shadow: 3px 4px 0 var(--pp-acc); }
  .sho-lupa-img { max-width: 100%; max-height: 88vh; object-fit: contain; cursor: default; border: 4px solid #FFFFFF; border-radius: 14px; box-shadow: 8px 8px 0 var(--pp-acc); }

  @media (prefers-reduced-motion: reduce) {
    .sho-raiz * { animation: none !important; }
    .sho-scroller [data-xin] { opacity: 1 !important; transform: none !important; }
    .sho-foto { --sho-punto: 0; }
  }
`;
