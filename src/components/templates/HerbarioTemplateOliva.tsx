"use client";

/**
 * HerbarioTemplateOliva.tsx — Colección Paper · Papel Prensado · Familia 04 "Herbario"
 * Variante: Oliva (generada por scripts/gen-papel-prensado-variants.js, no editar a mano). Las otras cuatro (Eucalipto, Oliva, Ceniza,
 * Tinta) se generan con scripts/gen-papel-prensado-variants.js.
 *
 * GENERADO por scripts/derivar-herbario.js a partir de PrensaTemplate.tsx —
 * no editar a mano.
 *
 * Portado desde mockup/Paper/Herbario - Panoramica.dc.html. Misma imprenta
 * que Prensa, con botánica prensada encima:
 *
 *  - LAS PIEZAS SON FOTOS, NO MÁSCARAS: una rama tiene medios tonos y como
 *    máscara de un color plano se perdería. Van como <img> con un filtro
 *    que las duotoniza; ese filtro es lo que cambia por variante, así que
 *    las cinco se ven como cinco herbarios distintos con UN solo juego de
 *    cuatro WebP.
 *  - LA CUENTA REGRESIVA tiene los días en grande y, al costado de un
 *    filete vertical, horas, minutos y segundos en columna.
 *  - AL CONFIRMAR CAEN TRES HOJAS sobre la palabra CONFIRMADO.
 */

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { Album } from "@/components/invitation/v2/Album";
import { AlbumCarousel } from "@/components/invitation/v2/AlbumCarousel";
import { AnimatedCoverPhoto, COVER_EXIT_STYLE, COVER_RESPONSIVE_STYLE } from "@/components/invitation/v2/AnimatedCoverPhoto";
import { useCountdown, pad } from "@/components/invitation/v2/useCountdown";
import { RSVPWizardV2 } from "@/components/invitation/v2/RSVPWizardV2";
import { SongSuggestion } from "@/components/invitation/v2/SongSuggestion";
import { InfoAdicionalSection } from "@/components/invitation/v2/InfoAdicionalSection";
import { SectionWrapper } from "@/components/invitation/v2/SectionWrapper";
import { BankDetailsCard } from "@/components/invitation/v2/BankDetailsCard";
import { BottomNavPill } from "@/components/invitation/v2/BottomNavPill";
import { AnimatedSynonyms } from "@/components/ui/AnimatedSynonyms";
import { useMusicPlayer, MusicToggleButton } from "@/components/invitation/MusicPlayer";
import { LogoFooterCredit } from "@/components/ui/Logo";
import { AddToCalendarLink } from "@/components/invitation/AddToCalendarLink";
import { getEventStatus, getInvitationExpirationDate } from "@/lib/expiration";
import { toEmbedMapUrl } from "@/lib/google-maps";
import { resolveGuestNameDisplay } from "@/lib/invitation-copy";
import { QrDeIngreso } from "@/components/invitation/QrDeIngreso";
import { useTextos } from "@/components/i18n/ProveedorIdioma";

// ─── Tipografía ─────────────────────────────────────────────────────────────
// Cormorant Garamond 300 para nombres, cifras y numeración; Jost 300/400 para
// kickers, datos y texto corrido. La script (Final Parade) es del repo y llega
// por var(--font-final-parade) desde layout.tsx: no se pide a Google.
const hbCormorant = Cormorant_Garamond({
  subsets: ["latin"],
  preload: false,
  style: ["normal", "italic"],
  weight: ["300", "400"],
  variable: "--hb-cormorant",
  display: "swap",
});
const hbJost = Jost({
  subsets: ["latin"],
  preload: false,
  weight: ["300", "400", "500"],
  variable: "--hb-jost",
  display: "swap",
});

// ─── Paleta ─────────────────────────────────────────────────────────────────
// Lo único que cambia por variante es el par de papeles. El generador
// reemplaza estos dos hex y el nombre del identificador; todo lo demás queda.
const PAPEL = "#F7F2EA";
const PAPEL2 = "#F1EADF";
const TINTA = "#45443C";
const TINTA_SUAVE = "#857F70";
/** rgb de la sombra: se usa en todos los rgba() del registro. */
const SH = "116,110,92";

// Las tres caras son parte del diseño y no se cambian desde el wizard (a
// diferencia de las Flat de siempre, que leen --font-title/--font-body-custom):
// el relieve está calibrado para Cormorant 300 y la firma de la colección es
// la script. Por eso el paso de Tipografía no aparece para Paper (ver
// wizard-steps-config.ts).
const SERIF = "var(--hb-cormorant), 'Cormorant Garamond', serif";
const SANS = "var(--hb-jost), 'Jost', sans-serif";
const SCRIPT = "var(--font-final-parade, 'Final Parade Script'), cursive";

// ─── Piezas ─────────────────────────────────────────────────────────────────
// Sólo el set compartido de íconos de línea, como máscara CSS con la tinta
// de fondo: son tinta plana, así que nunca van como <img>. Las proporciones
// vienen del INVENTARIO de public/templates.
const PIEZAS = "/templates/iconos-linea/";

/**
 * El color de la variante y el filtro que lo aplica a las fotos botánicas.
 * Los reemplaza scripts/gen-papel-prensado-variants.js: son las dos únicas
 * líneas que cambian entre las cinco variantes de esta familia.
 */
const ACENTO = "#7A7A55";
const FILTRO = "grayscale(1) sepia(1) hue-rotate(20deg) saturate(.85) brightness(.94)";

/** Las cuatro piezas botánicas, compartidas por las cinco variantes. */
const BOTANICA = "/templates/herbario/";
const ICONOS = {
  anillos: { f: "anillos", ar: "290/332" },
  reloj: { f: "reloj", ar: "265/269" },
  iglesia: { f: "iglesia", ar: "269/362" },
  copas: { f: "copas", ar: "261/360" },
  polaroids: { f: "polaroids", ar: "281/271" },
  auto: { f: "auto", ar: "367/223" },
  tarjeta: { f: "tarjeta", ar: "256/300" },
  regalo: { f: "regalo", ar: "249/293" },
  nota: { f: "nota-musical", ar: "202/253" },
  confeti: { f: "confeti", ar: "268/319" },
  sobre: { f: "sobre", ar: "261/276" },
  torta: { f: "torta", ar: "281/361" },
} as const;
type NombreDeIcono = keyof typeof ICONOS;

/**
 * Un ícono de línea del juego de la colección.
 *
 * El ancho va en porcentaje PERO con tope en píxeles: el mismo 19 % que en un
 * teléfono da un sello de 70 px, en la columna de escritorio (que es bastante
 * más ancha) daba uno de 120 px y la hoja quedaba dominada por el ícono en vez
 * de por los nombres. El tope lo deja siempre del tamaño de un sello de lacre,
 * mida lo que mida la hoja.
 */
function IconoLinea({ nombre, ancho = "19%", tope = 58, margen = "0 auto 10px" }: { nombre: NombreDeIcono; ancho?: string; tope?: number; margen?: string }) {
  const i = ICONOS[nombre];
  const u = `url(${PIEZAS}${i.f}.webp) no-repeat center / contain`;
  return (
    <div
      aria-hidden="true"
      style={{ width: `min(${ancho}, ${tope}px)`, aspectRatio: i.ar, margin: margen, background: TINTA, WebkitMask: u, mask: u, pointerEvents: "none" }}
    />
  );
}

// ─── El papel ───────────────────────────────────────────────────────────────
/** Grano de papel: ruido fractal desaturado en un data URI, sin archivo. */
function grano(freq: string, op: string): string {
  return `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='f'><feTurbulence type='fractalNoise' baseFrequency='${freq}' numOctaves='4' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='200' height='200' filter='url(%23f)' opacity='${op}'/></svg>")`;
}

/** Oscurece (pct < 0) o aclara (pct > 0) un hex. */
function matiz(hex: string, pct: number): string {
  const n = parseInt(hex.slice(1), 16);
  const f = 1 + pct / 100;
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.max(0, Math.min(255, Math.round(v * f))));
  return "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
}

/**
 * La sombra del relieve para un ángulo dado. En reposo la luz viene de −135°
 * (arriba a la derecha); el scroll la hace girar ±3°.
 */
function relieve(scrollY: number, quieto: boolean): string {
  const a = ((-135 + (quieto ? 0 : 3 * Math.sin(scrollY / 260))) * Math.PI) / 180;
  const m = 1.4;
  const dx = m * Math.cos(a);
  const dy = m * Math.sin(a);
  return `${dx.toFixed(2)}px ${dy.toFixed(2)}px 0 rgba(${SH},.55), ${(-dx).toFixed(2)}px ${(-dy).toFixed(2)}px 0 rgba(255,255,255,.92), ${(-dx * 1.43).toFixed(2)}px ${(-dy * 2.14).toFixed(2)}px 4px rgba(${SH},.20)`;
}

const GRANO_PAGINA = grano("0.85", "0.30");
const GRANO_HOJA = grano("1.1", "0.22");

// ─── Datos ──────────────────────────────────────────────────────────────────
function safeJson<T>(val: string | null | undefined, fallback: T): T {
  if (!val) return fallback;
  try { return JSON.parse(val) as T; } catch { return fallback; }
}

interface HerbarioTemplateOlivaProps {
  invitation: Record<string, unknown>;
  guest?: {
    id: string;
    name: string;
    mesas?: string[] | null;
    uniqueToken: string;
    status: string;
    attendingCount: number;
    isExempt?: boolean;
    paymentStatus: string;
    expectedCount: number;
    expectedAdults?: number | null;
    expectedChildren?: number | null;
    attendingAdults?: number | null;
    attendingChildren?: number | null;
  } | null;
  isPersonalized?: boolean;
}

interface CronoItem { time?: string; title: string; icon?: string }
interface QuizQuestion { pregunta: string; opciones: string[]; respuestaCorrecta?: number; correcta?: number }

type Theme = "boda" | "xv" | "cumple";
function temaDe(tipo: string): Theme {
  if (tipo === "CASAMIENTO") return "boda";
  if (tipo === "QUINCE_ANOS") return "xv";
  return "cumple";
}

// ─── Piezas de UI del registro ──────────────────────────────────────────────
/** Un bloque que entra con el gesto de la colección. `retraso` en ms. */
function Entra({ children, retraso = 0, style, className }: { children: React.ReactNode; retraso?: number; style?: React.CSSProperties; className?: string }) {
  return (
    <div data-hb-reveal="1" data-hb-retraso={retraso} className={`hb-entra ${className ?? ""}`} style={style}>
      {children}
    </div>
  );
}

/**
 * Una pieza botánica: una foto prensada, duotonizada al color de la
 * variante. Va fuera del flujo y sin atajar clics -- varias entran por
 * fuera del borde de la hoja a propósito.
 */
function Botanica({ pieza, className, ...posicion }: { pieza: "magnolia" | "rama-esquina" | "rama-cabecera" | "hoja"; className?: string } & React.CSSProperties) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`${BOTANICA}${pieza}.webp`}
      alt=""
      aria-hidden="true"
      className={className}
      loading="lazy"
      style={{ position: "absolute", filter: FILTRO, pointerEvents: "none", zIndex: 0, ...posicion }}
    />
  );
}

/** Una hoja de papel prensado: grano, sombra, esquinas plegadas y filete. */
function Hoja({ children, className, style, portada = false }: { children: React.ReactNode; className?: string; style?: React.CSSProperties; portada?: boolean }) {
  return (
    <div className={`hb-hoja ${portada ? "hb-hoja--portada" : ""} ${className ?? ""}`} style={style}>
      <div className="hb-filete" aria-hidden="true" />
      {children}
    </div>
  );
}

/** Cabecera de sección: ícono, número con punto y título en script. */
function Cabecera({ icono, numero, titulo, anchoIcono, topeIcono }: { icono: NombreDeIcono; numero: string; titulo: string; anchoIcono?: string; topeIcono?: number }) {
  return (
    <Entra>
      <IconoLinea nombre={icono} ancho={anchoIcono} tope={topeIcono} />
      <p className="hb-num">{numero}.</p>
      <h3 className="hb-titulo">{titulo}</h3>
    </Entra>
  );
}


/**
 * La cuenta regresiva de Papel Prensado.
 *
 * Las plantillas Flat comparten un <Countdown> con cuatro estilos que el
 * anfitrión elige en el wizard (cápsulas, flip, cajas redondeadas). Ninguno
 * de esos cuatro es de esta colección: acá no hay cajas, ni sombras suaves,
 * ni números que giran -- hay tinta prensada sobre papel. Por eso la
 * colección trae la suya y el wizard ya no pregunta el estilo (ver
 * wizard-steps-config.ts): cuatro cifras en relieve separadas por filetes,
 * quietas, como estarían impresas.
 *
 * La lógica del tiempo sí es la compartida (useCountdown): eso no tiene
 * nada de visual y duplicarlo sólo traería dos relojes que se desincronizan.
 */
function CuentaHerbario({ targetDate }: { targetDate: Date }) {
  const tx = useTextos();
  const { time, isEventDay, isPast, hasEnded } = useCountdown(targetDate);
  const enCero = time.dias === 0 && time.hs === 0 && time.min === 0 && time.seg === 0;

  if (isEventDay || (!isPast && enCero)) {
    return (
      <div id="countdown" className="hb-cuenta-aviso">
        <p className="hb-script">{tx("invitacion.cuentaRegresiva.llegoElDia")}</p>
        <p className="hb-cuerpo" style={{ marginBottom: 0 }}>{tx("invitacion.cuentaRegresiva.hoyEsElGranDia")}</p>
      </div>
    );
  }

  if (hasEnded || isPast) {
    return (
      <div id="countdown" className="hb-cuenta-aviso">
        <p className="hb-script">{tx("invitacion.cuentaRegresiva.yaFueUnaNocheIncreible")}</p>
      </div>
    );
  }

  const celdas = [
    { v: String(time.dias), l: tx("invitacion.cuentaRegresiva.dias") },
    { v: pad(time.hs), l: tx("invitacion.cuentaRegresiva.horas") },
    { v: pad(time.min), l: tx("invitacion.cuentaRegresiva.minutos") },
    { v: pad(time.seg), l: tx("invitacion.cuentaRegresiva.segundos") },
  ];

  // Los días mandan: son el dato que se mira. Horas, minutos y segundos
  // van al costado, en columna, separados por un filete vertical.
  const [dias, ...resto] = celdas;
  return (
    <div id="countdown" className="hb-cuenta">
      <div className="hb-cuenta-dias">
        <span className="hb-cifra">{dias.v}</span>
        <span className="hb-cuenta-etq">{dias.l}</span>
      </div>
      <span className="hb-cuenta-divisor" aria-hidden="true" />
      <div className="hb-cuenta-lado">
        {resto.map((c, i) => (
          <div key={c.l}>
            <div className="hb-cuenta-fila">
              <span className="hb-cuenta-num">{c.v}</span>
              <span className="hb-cuenta-etq">{c.l}</span>
            </div>
            {i < resto.length - 1 && <span className="hb-cuenta-regla" aria-hidden="true" />}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Filete corto con punto, el divisor del registro (slot D8). */
function FileteConPunto({ ancho = 140, centrado = true }: { ancho?: number; centrado?: boolean }) {
  return (
    <svg viewBox="0 0 220 8" width={ancho} height="8" aria-hidden="true" style={{ color: `rgba(${SH},.7)`, display: "block", margin: centrado ? "18px auto" : "18px 0" }}>
      <line x1="0" y1="4" x2="96" y2="4" stroke="currentColor" strokeWidth=".75" />
      <circle cx="110" cy="4" r="1.5" fill="currentColor" />
      <line x1="124" y1="4" x2="220" y2="4" stroke="currentColor" strokeWidth=".75" />
    </svg>
  );
}

function CopyField({ label, value }: { label: string; value: string }) {
  const tx = useTextos();
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div className="hb-banco-fila">
      <div style={{ minWidth: 0, flex: 1 }}>
        <span className="hb-banco-clave">{label}</span>
        <span className="hb-banco-valor">{value}</span>
      </div>
      <button className={`copy-btn hb-btn-fantasma ${copied ? "copied" : ""}`} type="button" onClick={handle} style={{ minHeight: 40, padding: "0 14px" }}>
        {copied ? "✓ " + tx("invitacion.regalos.copiado") : tx("invitacion.regalos.copiar")}
      </button>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="hb-banco-fila">
      <div style={{ minWidth: 0, flex: 1 }}>
        <span className="hb-banco-clave">{label}</span>
        <span className="hb-banco-valor">{value}</span>
      </div>
    </div>
  );
}

/**
 * El quiz, con la misma lógica que el de Moderno (mismo /api/quiz, mismo
 * guardado local) y las opciones del registro: botones de ancho completo,
 * filete de 0,5 px, el elegido se rellena de tinta.
 */
function QuizPrensa({ preguntas, invitationId, guestToken, guestName }: { preguntas: QuizQuestion[]; invitationId?: string; guestToken?: string; guestName?: string }) {
  const tx = useTextos();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [picks, setPicks] = useState<Record<number, number>>({});
  const [finished, setFinished] = useState(false);
  const [stats, setStats] = useState<{ avg: number; count: number } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (!invitationId) { setHasLoaded(true); return; }
    const params = new URLSearchParams({ invitationId });
    if (guestToken) params.append("guestToken", guestToken);
    fetch(`/api/quiz?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.averagePercentage === "number") setStats({ avg: data.averagePercentage, count: data.totalResponses });
        if (data && data.hasAnswered && data.guestScore) {
          setPicks(data.guestScore.answers || {});
          setFinished(true);
        } else {
          const storageKey = guestToken ? `quiz_finished_${invitationId}_${guestToken}` : `quiz_finished_${invitationId}`;
          const localPicks = localStorage.getItem(storageKey);
          if (localPicks) { setPicks(JSON.parse(localPicks)); setFinished(true); }
        }
      })
      .catch((e) => console.error("Error fetching quiz data", e))
      .finally(() => setHasLoaded(true));
  }, [invitationId, guestToken]);

  const pick = async (oi: number) => {
    if (picks[currentIdx] !== undefined) return;
    const newPicks = { ...picks, [currentIdx]: oi };
    setPicks(newPicks);
    setTimeout(async () => {
      if (currentIdx < preguntas.length - 1) { setCurrentIdx(currentIdx + 1); return; }
      setFinished(true);
      if (!invitationId) return;
      setIsSaving(true);
      try {
        let score = 0;
        preguntas.forEach((q, i) => { if (newPicks[i] === q.respuestaCorrecta) score++; });
        await fetch("/api/quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invitationId, guestName: guestName || tx("invitacion.evento.invitadoAnonimo"), guestToken: guestToken || null, answers: Object.values(newPicks), score, totalQuestions: preguntas.length }),
        });
        const params = new URLSearchParams({ invitationId });
        if (guestToken) params.append("guestToken", guestToken);
        const statsRes = await fetch(`/api/quiz?${params.toString()}`);
        if (statsRes.ok) { const data = await statsRes.json(); setStats({ avg: data.averagePercentage, count: data.totalResponses }); }
        const storageKey = guestToken ? `quiz_finished_${invitationId}_${guestToken}` : `quiz_finished_${invitationId}`;
        localStorage.setItem(storageKey, JSON.stringify(newPicks));
      } catch (e) {
        console.error(e);
      } finally {
        setIsSaving(false);
      }
    }, 400);
  };

  if (!hasLoaded) return null;

  if (finished) {
    let score = 0;
    preguntas.forEach((q, i) => { if (picks[i] === q.respuestaCorrecta) score++; });
    return (
      <div style={{ textAlign: "center" }}>
        <p className="hb-lugar">{tx("invitacion.quiz.juegoCompletado")}</p>
        <p className="hb-dato">{score} / {preguntas.length}</p>
        {isSaving ? (
          <p className="hb-cuerpo" style={{ color: TINTA_SUAVE }}>{tx("invitacion.quiz.guardandoResultados")}</p>
        ) : (
          stats && stats.count > 0 && (
            <p className="hb-cuerpo" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: TINTA_SUAVE }}>
              <span>{tx("invitacion.quiz.promedioGlobal", { n: stats.count })} <strong style={{ color: TINTA, fontWeight: 400 }}>{stats.avg}%</strong>.</span>
            </p>
          )
        )}
      </div>
    );
  }

  const q = preguntas[currentIdx];
  if (!q) return null;
  const formatQuestion = (text: string) => {
    let f = text.trim();
    if (f.startsWith("¿")) f = f.substring(1).trim();
    if (f.length > 0) f = f.charAt(0).toUpperCase() + f.slice(1);
    return tx("invitacion.quiz.signoPregunta", { pregunta: f }) + (f.endsWith("?") ? "" : "?");
  };

  return (
    <div key={currentIdx}>
      <p className="hb-lugar">{formatQuestion(q.pregunta)}</p>
      {q.opciones.map((opt, oi) => {
        const chosen = picks[currentIdx] === oi;
        return (
          <button
            key={oi}
            type="button"
            className="hb-quiz-opcion"
            data-elegida={chosen ? "1" : undefined}
            disabled={picks[currentIdx] !== undefined}
            onClick={() => pick(oi)}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// ─── La plantilla ───────────────────────────────────────────────────────────
export function HerbarioTemplateOliva({ invitation, guest, isPersonalized = false }: HerbarioTemplateOlivaProps) {
  const tx = useTextos();
  const [isCoverOpen, setIsCoverOpen] = useState(false);
  const [isClosingCover, setIsClosingCover] = useState(false);
  const [isTicketMaximized, setIsTicketMaximized] = useState(true);
  // false en el servidor, true apenas hidrata: sirve para montar los portales
  // (pase, música) sin un setState dentro de un efecto.
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  // "Ahora" se fija una vez al montar: los días para confirmar no necesitan
  // correr en vivo, y leer Date.now() en cada render es impuro para React.
  const [ahora] = useState(() => Date.now());
  const raizRef = useRef<HTMLDivElement>(null);
  const derechaRef = useRef<HTMLDivElement>(null);

  // Salida del splash: la hoja se desvanece 900 ms y recién ahí se desmonta;
  // la portada, debajo, sube 24 px en el mismo tiempo.
  const openInvitation = () => { if (!isClosingCover) setIsClosingCover(true); };
  useEffect(() => {
    if (!isClosingCover) return;
    const t = setTimeout(() => setIsCoverOpen(true), 900);
    return () => clearTimeout(t);
  }, [isClosingCover]);

  useEffect(() => {
    if (!isCoverOpen || !isTicketMaximized) return;
    const t = setTimeout(() => setIsTicketMaximized(false), 4000);
    return () => clearTimeout(t);
  }, [isCoverOpen, isTicketMaximized]);

  const musicaHabilitada = Boolean(invitation.musicaHabilitada) && Boolean(invitation.musicaUrl);
  const { isPlaying: isMusicPlaying, togglePlay: toggleMusic, audioElement: musicAudioElement } = useMusicPlayer({
    musicaUrl: String(invitation.musicaUrl ?? ""),
    autoplay: musicaHabilitada && Boolean(invitation.musicaAutoplay ?? true),
  });

  const tipo = String(invitation.tipo ?? "OTRO");
  const theme = temaDe(tipo);
  const esBoda = tipo === "CASAMIENTO";
  const esXV = tipo === "QUINCE_ANOS";

  useEffect(() => {
    const postEvento = getEventStatus(invitation.fechaEvento ? new Date(String(invitation.fechaEvento)) : new Date()) === "POST_EVENT";
    document.body.style.overflow = !isCoverOpen && !postEvento ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isCoverOpen, invitation.fechaEvento]);

  // ── La luz que gira y la pastilla que se repliega ──────────────────────
  // Un solo listener de scroll (window en celular, la columna derecha en
  // escritorio) actualiza dos cosas: el ángulo del relieve, que va como
  // variable CSS en la raíz para no re-renderizar nada, y la pastilla, que
  // se esconde mientras se scrollea y vuelve 370 ms después de frenar.
  const [pastillaOculta, setPastillaOculta] = useState(false);
  const quietoRef = useRef(false);
  useEffect(() => {
    quietoRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const raiz = raizRef.current;
    if (!raiz) return;
    raiz.style.setProperty("--hb-rel", relieve(0, true));
    let raf = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const alScrollear = (y: number) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setPastillaOculta(false), 370);
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        raiz.style.setProperty("--hb-rel", relieve(y, quietoRef.current));
        setPastillaOculta(y > 40);
      });
    };
    const onWindow = () => alScrollear(window.scrollY);
    const derecha = derechaRef.current;
    const onDerecha = () => alScrollear(derecha ? derecha.scrollTop : 0);
    window.addEventListener("scroll", onWindow, { passive: true });
    derecha?.addEventListener("scroll", onDerecha, { passive: true });
    return () => {
      window.removeEventListener("scroll", onWindow);
      derecha?.removeEventListener("scroll", onDerecha);
      if (raf) cancelAnimationFrame(raf);
      if (timer) clearTimeout(timer);
    };
  }, [isCoverOpen]);

  // ── Entrada de sección ─────────────────────────────────────────────────
  // IntersectionObserver al 15 %, una sola vez por bloque, con el retraso
  // que trae cada bloque (data-hb-retraso: 0 / 120 / 240). Se arma cada vez
  // que se abre la portada porque hasta entonces el cuerpo no está montado.
  useEffect(() => {
    if (!isCoverOpen) return;
    const raiz = raizRef.current;
    if (!raiz) return;
    const bloques = Array.from(raiz.querySelectorAll<HTMLElement>("[data-hb-reveal]"));
    if (quietoRef.current || !("IntersectionObserver" in window)) {
      bloques.forEach((b) => b.classList.add("hb-entra--visto"));
      return;
    }
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target as HTMLElement;
        const d = Number(el.dataset.prRetraso || 0);
        el.style.transitionDelay = `${d}ms`;
        el.classList.add("hb-entra--visto");
        io.unobserve(el);
      });
    }, { threshold: 0.15 });
    bloques.forEach((b) => io.observe(b));
    return () => io.disconnect();
  }, [isCoverOpen]);

  // ── Datos ──────────────────────────────────────────────────────────────
  const ciudad = String(invitation.ciudad ?? "");
  // Dos kickers distintos, porque encabezan dos cosas distintas.
  //
  // "kickerDelEvento" dice de quién es la fiesta ("Nos casamos", "Mis quince
  // años") y es el que va arriba de los nombres de los homenajeados.
  //
  // "kickerDelSaludo" es el que escribe el anfitrión en el wizard, que casi
  // siempre es un saludo dirigido al invitado ("Con mucho cariño para"). Ese
  // sólo se usa cuando abajo va el nombre del invitado o su familia: arriba
  // de los novios quedaba "Con mucho cariño para / Valentina & Tomás", como
  // si los novios fueran los invitados de su propia boda.
  const kickerDelEvento = esBoda ? tx("invitacion.evento.nosCasamos") : esXV ? tx("invitacion.evento.misQuinceAnos") : tx("invitacion.evento.teInvitamos");
  const portadaKicker = String(invitation.portadaKicker || kickerDelEvento);

  const novia = String(invitation.nombreNovia ?? "");
  const novio = String(invitation.nombreNovio ?? "");
  const nombre1 = esBoda ? (novia || String(invitation.nombreEvento ?? "")) : String(invitation.nombreQuinceanera ?? invitation.nombreEvento ?? "");
  const nombre2 = esBoda ? novio : "";
  const nombresLinea = nombre2 ? `${nombre1} & ${nombre2}` : nombre1;
  const monograma = nombre2
    ? `${nombre1.charAt(0)} · ${nombre2.charAt(0)}`.toUpperCase()
    : nombre1.charAt(0).toUpperCase();

  const fechaEvento = invitation.fechaEvento ? new Date(String(invitation.fechaEvento)) : new Date();
  const fechaLarga = fechaEvento.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const fechaCorta = fechaEvento.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, " · ");

  const lugarNombre = String(invitation.lugarNombre ?? "");
  const direccion = String(invitation.direccion ?? "");
  const hora = String(invitation.hora ?? "");
  const mapUrl = String(invitation.mapUrl ?? "");
  const embedMapUrl = mapUrl ? toEmbedMapUrl(mapUrl) : null;

  const galeria: string[] = safeJson<string[]>(String(invitation.galeriaPrincipalFotos ?? ""), []);
  const albumFotos = (invitation.album as { fotos?: { url: string }[] } | null)?.fotos?.map((f) => f.url) ?? [];
  const allPhotos = [...new Set([...galeria, ...albumFotos].filter(Boolean))];
  const cronograma: CronoItem[] = safeJson<CronoItem[]>(String(invitation.cronogramaEventos ?? ""), []);

  const isPreview = !guest;
  const rsvpEnabled = Boolean(invitation.rsvpEnabled ?? invitation.confirmacionHabilitada ?? true);
  const regaloHabilitado = Boolean(invitation.regaloHabilitado);
  const pagoTarjetaHabilitado = Boolean(invitation.pagoTarjetaHabilitado);
  const showGiftSection = regaloHabilitado || pagoTarjetaHabilitado;
  const paymentEnabled = pagoTarjetaHabilitado;
  const paymentAmount = paymentEnabled ? (Number((invitation as Record<string, unknown>).pagoTarjetaMonto ?? invitation.regaloMonto ?? 0) || (isPreview && !invitation.id ? 25000 : undefined)) : undefined;
  const guestPayStatus = paymentEnabled ? ((guest?.paymentStatus ?? "PENDING") as "PENDING" | "EXEMPT" | "PAID") : undefined;
  const triviaHabilitada = Boolean(invitation.triviaHabilitada);
  const triviaPreguntas: QuizQuestion[] = safeJson<QuizQuestion[]>(String(invitation.triviaPreguntas ?? ""), []);
  const songsEnabled = Boolean(invitation.sugerenciaMusicaHabilitada ?? true);
  const activeDressCode = invitation.dresscodeHabilitado ? String(invitation.dresscodeTipo || invitation.portadaDressCode || "") : "";
  const frase = Boolean(invitation.frasePersonalizadaHabilitada) && Boolean(invitation.frasePersonalizadaTexto) ? String(invitation.frasePersonalizadaTexto) : "";

  // Días que quedan para confirmar (rsvpDaysBeforeEvent): el registro los
  // muestra en relieve arriba del formulario.
  const rsvpDias = Number(invitation.rsvpDaysBeforeEvent ?? 0) || 0;
  const limiteRsvp = new Date(fechaEvento.getTime() - rsvpDias * 86400000);
  const diasParaConfirmar = Math.max(0, Math.floor((limiteRsvp.getTime() - ahora) / 86400000));

  // La pastilla: cinco ítems como en el mockup (Fecha, Evento, Álbum, RSVP,
  // Música), sólo los que existen en esta invitación.
  const navSections = [
    { id: "countdown", label: tx("invitacion.cuentaRegresiva.kicker"), icon: <IconoPastilla nombre="reloj" /> },
    { id: "details", label: "Evento", icon: <IconoPastilla nombre="iglesia" /> },
    ...(allPhotos.length > 0 ? [{ id: "album", label: tx("invitacion.album.titulo"), icon: <IconoPastilla nombre="polaroids" /> }] : []),
    ...(rsvpEnabled ? [{ id: "rsvp", label: tx("invitacion.rsvp.confirmar"), icon: <IconoPastilla nombre="tarjeta" /> }] : []),
    ...(songsEnabled ? [{ id: "songs", label: tx("invitacion.musica.titulo"), icon: <IconoPastilla nombre="nota" /> }] : []),
  ];

  // Secciones numeradas del escritorio (la lista de la hoja grande).
  const seccionesNav = [
    { id: "countdown", n: "01", label: tx("invitacion.cuentaRegresiva.kicker") },
    ...(frase ? [{ id: "quote", n: "02", label: tx("invitacion.frase.unasPalabras") }] : []),
    { id: "details", n: "03", label: tx("invitacion.ubicacion.cuandoYDonde") },
    ...(allPhotos.length > 0 ? [{ id: "album", n: "04", label: tx("invitacion.album.titulo") }] : []),
    ...(mapUrl ? [{ id: "location", n: "05", label: tx("invitacion.ubicacion.tituloMapa", { lugar: "" }).trim() || "Mapa" }] : []),
    ...(rsvpEnabled ? [{ id: "rsvp", n: "06", label: tx("invitacion.rsvp.confirmar") }] : []),
    ...(showGiftSection ? [{ id: "banco", n: "07", label: tx("invitacion.regalos.banco") }] : []),
    ...(songsEnabled ? [{ id: "songs", n: "08", label: tx("invitacion.musica.titulo") }] : []),
    { id: "cierre", n: "09", label: tx("invitacion.frase.graciasPorEstar") },
  ];

  const portadaImagenFondoDesktopRaw = String(invitation.portadaImagenFondoDesktop ?? "") || undefined;
  const portadaFondoAnimado = Boolean(portadaImagenFondoDesktopRaw);
  const guestNameDisplay = resolveGuestNameDisplay(invitation, guest);
  // ¿El nombre grande de la bienvenida es el del invitado, o el de los
  // homenajeados? De eso dependen el saludo de arriba y si hace falta
  // repetir los nombres abajo (ver la hoja del splash).
  const saludaAlInvitado = Boolean(guest?.name) && invitation.mostrarNombreInvitadoEnSaludo !== false;

  const eventStatus = getEventStatus(fechaEvento);
  const expirationDate = getInvitationExpirationDate(fechaEvento);
  const expirationDateStr = expirationDate.toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });
  const liveItems = (invitation.liveSession as { items?: { fileUrl: string; type?: string }[] } | null)?.items ?? [];
  const livePhotos: string[] = liveItems
    .filter((item) => item.fileUrl && (item.type === "PHOTO" || !item.type || item.fileUrl.match(/\.(jpg|jpeg|png|webp|gif)$/i)))
    .map((item) => item.fileUrl);

  const varsDeTema = {
    "--font-cormorant": "var(--hb-cormorant)",
    "--font-inter": "var(--hb-jost)",
    "--font-sans": "var(--hb-jost)",
    // En esta colección --t-acc y --t-acc2 no son un acento: son la tinta y
    // la tinta suave. Lo que cambia por variante es el papel (--t-bg).
    "--t-acc": TINTA,
    "--t-acc2": TINTA_SUAVE,
    "--c-accent": TINTA,
    "--t-bg": PAPEL,
    "--t-surface": PAPEL2,
    "--t-muted": TINTA_SUAVE,
    "--t-ink": TINTA,
    // Tema claro: Countdown y RSVPWizardV2 leen esto para no pintar texto
    // blanco hardcodeado sobre el papel (guía §3.4).
    "--chic-ink": TINTA,
    "--t-nav-inactive": TINTA_SUAVE,
  } as React.CSSProperties;

  // ── Post-evento ────────────────────────────────────────────────────────
  if (eventStatus === "POST_EVENT") {
    return (
      <div className={`${hbCormorant.variable} ${hbJost.variable} hb-raiz`} style={varsDeTema} data-theme={theme} ref={raizRef}>
        <style>{CSS_HERBARIO}</style>
        <div className="hb-fondo" aria-hidden="true" />
        <main className="hb-post">
          <Hoja className="hb-post-hoja">
            <IconoLinea nombre={esXV ? "torta" : "anillos"} ancho="16%" />
            <p className="hb-kicker">{tx("invitacion.frase.unMomento")}</p>
            <h1 className="hb-nombres" style={{ fontSize: 38 }}>
              <AnimatedSynonyms words={[tx("invitacion.frase.inolvidable"), tx("invitacion.frase.unico"), tx("invitacion.frase.eterno"), tx("invitacion.frase.magico")]} className="hb-sinonimo" />
            </h1>
            <FileteConPunto />
            <p className="hb-cuerpo">{tx("invitacion.frase.graciasPorAcompanarnosCorto")}</p>
            <p className="hb-dato">{tx("invitacion.album.disponibleHasta")} {expirationDateStr}</p>
            <div style={{ marginTop: 22 }}>
              {livePhotos.length > 0 ? (
                <AlbumCarousel photos={livePhotos} hideHeader={true} />
              ) : (
                <>
                  <p className="hb-lugar">{tx("invitacion.album.fotografico")}</p>
                  <p className="hb-cuerpo" style={{ color: TINTA_SUAVE }}>{tx("invitacion.album.sinCapturas")}</p>
                </>
              )}
            </div>
          </Hoja>
        </main>
        <LogoFooterCredit bgColor="transparent" textColor={TINTA_SUAVE} />
      </div>
    );
  }

  return (
    <div className={`${hbCormorant.variable} ${hbJost.variable} hb-raiz`} style={varsDeTema} ref={raizRef}>
      <style>{CSS_HERBARIO}</style>

      {/* ── Splash (celular) ────────────────────────────────────────── */}
      {!isCoverOpen && (
        <div className={`hb-splash ${isClosingCover ? "hb-splash--sale" : ""}`}>
          {portadaFondoAnimado && (
            <div className="acp-mobile-only">
              <AnimatedCoverPhoto
                photoSrc={portadaImagenFondoDesktopRaw as string}
                tintColor1={PAPEL}
                tintColor2={TINTA_SUAVE}
                effect="enfoque"
                scrimColorRgb="247,242,234"
              />
            </div>
          )}
          <Hoja className="hb-splash-hoja">
            <Botanica pieza="rama-cabecera" width="36%" left="62%" top="-4%" />
            <p className="hb-kicker">{saludaAlInvitado ? portadaKicker : kickerDelEvento}</p>
            <p className="hb-splash-nombre">{guestNameDisplay}</p>
            <div className="hb-filete-corto" aria-hidden="true" />
            {/* Los nombres de los novios sólo si arriba no están ya: cuando
                el saludo es para el invitado son el dato que falta ("¿la boda
                de quién?"); cuando el nombre grande ya es el de ellos,
                repetirlos era escribir lo mismo dos veces. */}
            {saludaAlInvitado && <p className="hb-dato">{nombresLinea}</p>}
            <p className="hb-dato" style={{ color: TINTA_SUAVE }}>{fechaCorta}{ciudad ? ` · ${ciudad}` : ""}</p>
            {Boolean(activeDressCode) && <p className="hb-kicker" style={{ marginTop: 6 }}>{tx("invitacion.ubicacion.dressCode")} {activeDressCode}</p>}
            <button type="button" onClick={openInvitation} className="hb-btn-solido" style={{ marginTop: 26 }}>
              {tx("invitacion.portada.abrirInvitacion")}
            </button>
          </Hoja>
          <style>{COVER_EXIT_STYLE}{COVER_RESPONSIVE_STYLE}</style>
        </div>
      )}

      {/* ── Pase (burbuja) y música ─────────────────────────────────── */}
      {mounted && isPersonalized && guest && isCoverOpen && createPortal(
        <div
          onClick={() => setIsTicketMaximized(!isTicketMaximized)}
          className={`hb-pase-burbuja ${isTicketMaximized ? "hb-pase-burbuja--abierta" : ""}`}
        >
          {isTicketMaximized ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", gap: 14 }}>
              <div style={{ textAlign: "left" }}>
                <span className="hb-kicker" style={{ margin: 0, fontSize: 8 }}>{tx("invitacion.pase.pase")}</span>
                <span style={{ display: "block", fontFamily: SERIF, fontWeight: 300, fontSize: 18, color: TINTA, lineHeight: 1.1 }}>{guest.name}</span>
                {guest.mesas && guest.mesas.length > 0 && (
                  <span className="hb-kicker" style={{ margin: "4px 0 0", fontSize: 8 }}>{guest.mesas.join(" · ")}</span>
                )}
              </div>
              <div style={{ textAlign: "right", borderLeft: `0.5px solid rgba(${SH},.34)`, paddingLeft: 12 }}>
                <span style={{ display: "block", fontFamily: SERIF, fontWeight: 300, fontSize: 22, color: TINTA, lineHeight: 1 }}>{guest.expectedCount}</span>
                <span className="hb-kicker" style={{ margin: 0, fontSize: 8 }}>{guest.expectedCount === 1 ? tx("invitacion.pase.lugar") : tx("invitacion.pase.lugares")}</span>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <IconoPastilla nombre="tarjeta" />
              <span className="hb-kicker" style={{ margin: 0 }}>{tx("invitacion.pase.pase")}</span>
            </div>
          )}
        </div>,
        document.body
      )}
      {mounted && musicaHabilitada && isCoverOpen && createPortal(
        <MusicToggleButton isPlaying={isMusicPlaying} onToggle={toggleMusic} className="fixed top-3 right-3 z-[99998]" />,
        document.body
      )}

      <div className="desktop-stage hb-escenario" data-theme={theme}>
        <div className="hb-fondo" aria-hidden="true" />

        {/* ── Escritorio: la hoja grande, fija a la izquierda ─────────── */}
        <aside className="d-left hide-mobile hb-izquierda">
          <Hoja portada className="hb-hoja-grande">
            <Botanica pieza="magnolia" width="45%" left="-6%" top="14%" />
            <Botanica pieza="rama-esquina" width="38%" right="-8%" bottom="-4%" />
            <p className="hb-kicker">{kickerDelEvento}</p>
            <h1 className="hb-nombres">
              <span>{nombre1}</span>
              {nombre2 && <span className="hb-amp">&amp;</span>}
              {nombre2 && <span>{nombre2}</span>}
            </h1>
            <div className="hb-filete-corto" aria-hidden="true" />
            <p className="hb-dato">{fechaLarga}</p>
            {ciudad && <p className="hb-dato">{ciudad}</p>}
            <div className="hb-nav-escritorio">
              <FileteConPunto ancho={220} />
              <nav className="hb-nav-lista">
                {seccionesNav.map((s) => (
                  <a key={s.id} href={`#${s.id}`}>{s.n}. {s.label}</a>
                ))}
              </nav>
            </div>
          </Hoja>
        </aside>

        <div className="d-right tpl hb-derecha" ref={derechaRef}>
          {/* ── Portada (celular) ───────────────────────────────────── */}
          <section className="hide-desktop hb-seccion hb-portada" data-sec="00">
            <Hoja portada className={isCoverOpen ? "hb-portada--sube" : ""}>
              <Botanica pieza="magnolia" width="44%" right="-26%" top="8%" />
              <Botanica pieza="rama-esquina" width="28%" left="-9%" top="60%" />
              <Entra>
                <p className="hb-kicker">{kickerDelEvento}</p>
              </Entra>
              <Entra retraso={120}>
                <h1 className="hb-nombres">
                  <span>{nombre1}</span>
                  {nombre2 && <span className="hb-amp">&amp;</span>}
                  {nombre2 && <span>{nombre2}</span>}
                </h1>
              </Entra>
              <Entra retraso={240}>
                <div className="hb-filete-corto" aria-hidden="true" />
                <p className="hb-dato">{fechaLarga}</p>
                {ciudad && <p className="hb-dato">{ciudad}</p>}
                <AddToCalendarLink eventName={nombresLinea} targetDate={fechaEvento} location={[lugarNombre, direccion].filter(Boolean).join(", ")} className="hb-link" showIcon={false}>
                  {tx("invitacion.saveTheDate.agregarAlCalendario")}
                </AddToCalendarLink>
              </Entra>
            </Hoja>
          </section>

          {/* ── 01 La cuenta regresiva ─────────────────────────────── */}
          {(invitation.contadorHabilitado ?? true) ? (
            <section className="hb-seccion" data-sec="01" id="countdown-hoja">
              <Hoja>
                <Cabecera icono="reloj" numero="01" titulo={tx("invitacion.cuentaRegresiva.kicker")} />
                <Entra retraso={120}>
                  <p className="hb-kicker">{tx("invitacion.cuentaRegresiva.faltan")}</p>
                  <CuentaHerbario targetDate={fechaEvento} />
                  <FileteConPunto />
                  <p className="hb-dato">{fechaLarga}{hora ? ` · ${hora} hs` : ""}</p>
                </Entra>
              </Hoja>
            </section>
          ) : null}

          {/* ── 02 La frase (sangra, sin hoja) ─────────────────────── */}
          {frase && (
            <SectionWrapper id="quote" delay={100} className="hb-frase-seccion">
              <Entra>
                <IconoLinea nombre={esXV ? "torta" : "anillos"} ancho={esXV ? "15%" : "16%"} />
                <p className="hb-num">02.</p>
                <p className="hb-frase">{frase}</p>
                <p className="hb-script">{tx("invitacion.frase.unasPalabras")}</p>
              </Entra>
            </SectionWrapper>
          )}

          {/* ── 03 El evento ───────────────────────────────────────── */}
          <SectionWrapper id="details" delay={150} className="hb-seccion" style={{ padding: 0 }}>
            <div className="hb-seccion" data-sec="03">
              <Hoja>
                <Cabecera icono="iglesia" numero="03" titulo={tx("invitacion.ubicacion.cuandoYDonde")} />
                <Entra retraso={120}>
                  {Boolean(invitation.ceremoniaHabilitada) && (
                    <div>
                      <p className="hb-kicker">{String(invitation.ceremoniaTitulo || tx("invitacion.ubicacion.ceremoniaCivil"))}</p>
                      {Boolean(invitation.ceremoniaNombre) && <p className="hb-lugar">{String(invitation.ceremoniaNombre)}</p>}
                      <p className="hb-dato">
                        {Boolean(invitation.ceremoniaHora) && `${String(invitation.ceremoniaHora)} hs`}
                        {Boolean(invitation.ceremoniaHora) && Boolean(invitation.ceremoniaDireccion) && " · "}
                        {Boolean(invitation.ceremoniaDireccion) && String(invitation.ceremoniaDireccion)}
                      </p>
                      {Boolean(invitation.ceremoniaMapUrl) && (
                        <a href={String(invitation.ceremoniaMapUrl)} target="_blank" rel="noopener noreferrer" className="hb-link">{tx("invitacion.ubicacion.comoLlegar")}</a>
                      )}
                      <div className="hb-hairline" aria-hidden="true" />
                    </div>
                  )}
                  {(lugarNombre || direccion) && (
                    <div>
                      <p className="hb-kicker">{tx("invitacion.ubicacion.fiestaSalon")}</p>
                      {lugarNombre && <p className="hb-lugar">{lugarNombre}</p>}
                      <p className="hb-dato">
                        {hora && `${hora} hs`}
                        {hora && direccion && " · "}
                        {direccion}
                      </p>
                      {mapUrl && <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="hb-link">{tx("invitacion.ubicacion.comoLlegar")}</a>}
                    </div>
                  )}
                </Entra>
                {(cronograma.length > 0 || activeDressCode) && (
                  <Entra retraso={240}>
                    {cronograma.length > 0 && (
                      <>
                        <div className="hb-hairline" aria-hidden="true" />
                        <p className="hb-kicker">Cronograma</p>
                        <div className="hb-cronograma" id="schedule">
                          <span className="hb-cronograma-eje" aria-hidden="true" />
                          {cronograma.map((item, i) => (
                            <Entra key={i} retraso={i * 120} className="hb-hito">
                              <span className="hb-hito-hora">{item.time ?? ""}</span>
                              <span className="hb-hito-punto" aria-hidden="true" />
                              <span className="hb-hito-titulo">{item.title}</span>
                            </Entra>
                          ))}
                        </div>
                      </>
                    )}
                    {Boolean(activeDressCode) && (
                      <>
                        <div className="hb-hairline" aria-hidden="true" />
                        <p className="hb-kicker">{tx("invitacion.ubicacion.dressCode")}</p>
                        <p className="hb-cuerpo">{activeDressCode}</p>
                      </>
                    )}
                  </Entra>
                )}
              </Hoja>
            </div>
          </SectionWrapper>

          <InfoAdicionalSection invitation={invitation} />

          {/* ── 04 El álbum ────────────────────────────────────────── */}
          {(invitation.galeriaPrincipalHabilitada ?? false) && allPhotos.length > 0 && (
            <SectionWrapper id="album" delay={200} className="hb-seccion" style={{ padding: 0 }}>
              <div className="hb-seccion" data-sec="04">
                <Hoja>
                  <Cabecera icono="polaroids" numero="04" titulo={tx("invitacion.album.titulo")} />
                  <Entra retraso={120}>
                    <Album photos={allPhotos} hideHeader albumStyle={invitation.albumStyle as never} />
                  </Entra>
                </Hoja>
              </div>
            </SectionWrapper>
          )}

          {/* ── 05 El mapa ─────────────────────────────────────────── */}
          {mapUrl && (
            <section className="hb-seccion" data-sec="05" id="location">
              <Hoja>
                <Cabecera icono="auto" numero="05" titulo={tx("invitacion.ubicacion.tituloMapa", { lugar: lugarNombre }).replace(/^Mapa de\s*/i, "Mapa")} anchoIcono="22%" />
                <Entra retraso={120}>
                  <div className="hb-mapa">
                    {embedMapUrl ? (
                      <iframe src={embedMapUrl} width="100%" height="100%" style={{ border: 0, display: "block" }} loading="lazy" title={tx("invitacion.ubicacion.tituloMapa", { lugar: lugarNombre })} referrerPolicy="no-referrer-when-downgrade" />
                    ) : (
                      <span className="hb-kicker" style={{ margin: 0 }}>{tx("invitacion.ubicacion.mapaNoDisponible")}</span>
                    )}
                  </div>
                  <p className="hb-dato">{[direccion, ciudad].filter(Boolean).join(" · ")}</p>
                  <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="hb-btn-solido">{tx("invitacion.ubicacion.verMapaFiesta")}</a>
                </Entra>
              </Hoja>
            </section>
          )}

          {/* ── 06 Tu confirmación ─────────────────────────────────── */}
          {rsvpEnabled && (
            <section className="hb-seccion" data-sec="06" id="rsvp-hoja">
              <Hoja>
                <Botanica pieza="hoja" className="hb-hoja-cae" width="24px" />
                <Botanica pieza="hoja" className="hb-hoja-cae" width="24px" />
                <Botanica pieza="hoja" className="hb-hoja-cae" width="24px" />
                <Cabecera icono="tarjeta" numero="06" titulo={tx("invitacion.rsvp.confirmar")} />
                {rsvpDias > 0 && (
                  <Entra retraso={120}>
                    <p className="hb-kicker">{tx("invitacion.rsvp.quedan")}</p>
                    <p className="hb-cifra">{diasParaConfirmar}</p>
                    <p className="hb-kicker">{tx("invitacion.rsvp.diasParaConfirmar")}</p>
                  </Entra>
                )}
                <Entra retraso={240}>
                  <RSVPWizardV2
                    invitationId={String(invitation.id ?? "")}
                    guestToken={guest?.uniqueToken}
                    guestName={guest?.name}
                    maxGuests={guest?.expectedCount ?? 6}
                    maxAdults={guest?.expectedAdults ?? undefined}
                    maxTeens={(guest as { expectedTeens?: number } | null | undefined)?.expectedTeens ?? undefined}
                    maxChildren={guest?.expectedChildren ?? undefined}
                    dark
                    hasPayment={paymentEnabled}
                    paymentAmount={paymentAmount}
                    paymentAlias={String(invitation.regaloAlias ?? "") || undefined}
                    paymentCbu={String(invitation.regaloCbu ?? "") || undefined}
                    paymentBanco={String(invitation.regaloBanco ?? "") || undefined}
                    paymentTitular={String(invitation.regaloTitular ?? "") || undefined}
                    initialStatus={guest?.status as "PENDING" | "CONFIRMED" | "DECLINED" | undefined}
                    initialAttendingCount={guest?.attendingCount ?? 1}
                    initialAttendingAdults={guest?.attendingAdults ?? undefined}
                    initialAttendingTeens={(guest as { attendingTeens?: number } | null | undefined)?.attendingTeens ?? undefined}
                    initialAttendingChildren={guest?.attendingChildren ?? undefined}
                    initialPaymentStatus={guestPayStatus}
                    paymentView={(guest as { paymentView?: unknown } | null | undefined)?.paymentView as never ?? null}
                    isExempt={guest?.isExempt ?? false}
                    precioNino={invitation.precioNino ? Number(invitation.precioNino) : undefined}
                    precioAdolescente={invitation.precioAdolescente ? Number(invitation.precioAdolescente) : undefined}
                    is15={esXV}
                  />
                </Entra>
              </Hoja>
            </section>
          )}

          <QrDeIngreso guest={guest as never} />

          {(invitation.galeriaPrincipalHabilitada ?? false) && invitation.albumStyle === "solapadas" && allPhotos.length >= 5 && (
            <SectionWrapper id="album-2" delay={150} className="hb-seccion" style={{ padding: 0 }}>
              <div className="hb-seccion">
                <Hoja>
                  <Album photos={allPhotos} hideHeader albumStyle="solapadas" part="second" />
                </Hoja>
              </div>
            </SectionWrapper>
          )}

          {/* ── Quiz ───────────────────────────────────────────────── */}
          {triviaHabilitada && triviaPreguntas.length > 0 && (
            <SectionWrapper id="quiz" delay={300} className="hb-seccion" style={{ padding: 0 }}>
              <div className="hb-seccion">
                <Hoja>
                  <Entra>
                    <p className="hb-kicker">{String(invitation.triviaTitulo || tx("invitacion.quiz.cuantoSabes"))}</p>
                    <QuizPrensa preguntas={triviaPreguntas} invitationId={String(invitation.id ?? "")} guestToken={guest?.uniqueToken} guestName={guest?.name} />
                  </Entra>
                </Hoja>
              </div>
            </SectionWrapper>
          )}

          {/* ── 07 Regalos ─────────────────────────────────────────── */}
          {showGiftSection && (
            <SectionWrapper id="banco" delay={200} className="hb-seccion" style={{ padding: 0 }}>
              <div className="hb-seccion" data-sec="07">
                <Hoja>
                  <Cabecera icono="sobre" numero="07" titulo={tx("invitacion.regalos.banco")} />
                  <Entra retraso={120}>
                    {Boolean(invitation.regaloMensaje) && <p className="hb-cuerpo">{String(invitation.regaloMensaje)}</p>}
                    <div style={{ display: "grid", gap: 14 }}>
                      {pagoTarjetaHabilitado && (
                        <BankDetailsCard
                          icon={<IconoPastilla nombre="tarjeta" />}
                          data={{
                            titulo: String(invitation.pagoTarjetaTitulo || tx("invitacion.regalos.pagoTarjetas")),
                            mensaje: String(invitation.pagoTarjetaMensaje || ""),
                            banco: String(invitation.pagoTarjetaBanco || ""),
                            cbu: String(invitation.pagoTarjetaCbu || ""),
                            alias: String(invitation.pagoTarjetaAlias || ""),
                            titular: String(invitation.pagoTarjetaTitular || ""),
                          }}
                          accentColor={TINTA}
                          cardBg={PAPEL2}
                          textPrimary={TINTA}
                          textSecondary={TINTA_SUAVE}
                          InfoRow={InfoRow}
                          CopyField={CopyField}
                        />
                      )}
                      {regaloHabilitado && (
                        <BankDetailsCard
                          icon={<IconoPastilla nombre="regalo" />}
                          data={{
                            titulo: String(invitation.regaloTitulo || tx("invitacion.regalos.tituloEvento")),
                            mensaje: String(invitation.regaloMensaje || ""),
                            banco: String(invitation.regaloBanco || ""),
                            cbu: String(invitation.regaloCbu || ""),
                            alias: String(invitation.regaloAlias || ""),
                            titular: String(invitation.regaloTitular || ""),
                          }}
                          accentColor={TINTA}
                          cardBg={PAPEL2}
                          textPrimary={TINTA}
                          textSecondary={TINTA_SUAVE}
                          InfoRow={InfoRow}
                          CopyField={CopyField}
                        />
                      )}
                    </div>
                  </Entra>
                </Hoja>
              </div>
            </SectionWrapper>
          )}

          {/* ── 08 Sugerí una canción ──────────────────────────────── */}
          {songsEnabled && (
            <section className="hb-seccion" data-sec="08" id="songs-hoja">
              <Hoja>
                <Cabecera icono="nota" numero="08" titulo={tx("invitacion.musica.titulo")} anchoIcono="15%" />
                <Entra retraso={120}>
                  <SongSuggestion
                    invitationId={String(invitation.id ?? "")}
                    guestToken={guest?.uniqueToken}
                    guestName={guest?.name ?? tx("invitacion.evento.invitado")}
                    kicker={tx("invitacion.musica.armamosLaPlaylist")}
                    hideHeader
                    dark
                    showPublicList
                    variant="moderno"
                  />
                </Entra>
              </Hoja>
            </section>
          )}

          {/* ── 09 Cierre ──────────────────────────────────────────── */}
          <section className="hb-seccion" data-sec="09" id="cierre">
            <Hoja>
              <Botanica pieza="rama-cabecera" width="72%" left="26%" top="-3%" />
              <Entra>
                <p className="hb-num">09.</p>
                <div className="hb-monograma">
                  <svg viewBox="0 0 88 110" width="78" height="98" aria-hidden="true">
                    <ellipse cx="44" cy="55" rx="40" ry="52" fill="none" stroke="currentColor" strokeWidth=".75" />
                    <ellipse cx="44" cy="55" rx="34" ry="46" fill="none" stroke="currentColor" strokeWidth=".4" />
                  </svg>
                  <span>{monograma}</span>
                </div>
                <p className="hb-script">{tx("invitacion.frase.graciasPorEstar")}</p>
              </Entra>
            </Hoja>
          </section>

          {musicaHabilitada && musicAudioElement}
          <LogoFooterCredit bgColor="transparent" textColor={TINTA_SUAVE} />
          <div style={{ height: 92 }} className="hide-desktop" aria-hidden="true" />
        </div>
      </div>

      {isCoverOpen && (
        <div className={`hb-pastilla ${pastillaOculta ? "hb-pastilla--oculta" : ""}`}>
          <BottomNavPill sections={navSections} variant="moderno" accentColor={TINTA} surfaceColor={PAPEL} inactiveColor={TINTA_SUAVE} solid />
        </div>
      )}
    </div>
  );
}

/** El ícono de la pastilla: 20 px, máscara con la tinta. */
function IconoPastilla({ nombre }: { nombre: NombreDeIcono }) {
  const u = `url(${PIEZAS}${ICONOS[nombre].f}.webp) no-repeat center / contain`;
  return <span aria-hidden="true" style={{ display: "block", width: 20, height: 20, background: "currentColor", WebkitMask: u, mask: u }} />;
}

// ─── El registro, en CSS ────────────────────────────────────────────────────
// Todo lo que el mockup tenía como objetos de estilo. Los componentes
// compartidos (Countdown, RSVP, canciones, álbum, pastilla) se visten desde
// acá con selectores sobre sus ganchos, igual que hace Moderno.
const CSS_HERBARIO = `
  .hb-raiz { position: relative; color: ${TINTA}; font-family: ${SANS}; }
  .hb-fondo { position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background-color: ${PAPEL}; background-image: ${GRANO_PAGINA}; background-blend-mode: multiply; }
  .hb-escenario { position: relative; z-index: 1; background: transparent !important; }
  .hb-escenario.desktop-stage { background: transparent; }
  .hb-derecha { background: transparent; }
  .desktop-stage.hb-escenario .d-left.hb-izquierda { background: transparent; padding: 26px 22px; align-items: center; justify-content: center; }
  .hb-hoja-grande { width: 94%; aspect-ratio: 301/432; padding: 34px 30px 26px; display: flex; flex-direction: column; align-items: center; text-align: center; }
  .hb-hoja-grande .hb-nombres { font-size: 38px; }
  .hb-nav-escritorio { margin-top: auto; width: 100%; }
  .hb-nav-lista { display: flex; flex-direction: column; align-items: center; gap: 2px; margin-top: 14px; }
  .hb-nav-lista a { background: none; border: none; padding: 5px 2px; font-family: ${SANS}; font-weight: 400; font-size: 10px; letter-spacing: .39em; text-transform: uppercase; color: ${TINTA_SUAVE}; text-decoration: none; }
  .hb-nav-lista a:hover { color: ${TINTA}; }

  /* La hoja */
  .hb-hoja { position: relative; padding: 32px 26px 28px; text-align: center;
    background-color: ${PAPEL}; background-image: ${GRANO_HOJA}; background-blend-mode: multiply;
    box-shadow: -1.41px 1.41px 4px rgba(${SH},.40);
    clip-path: polygon(0 0, calc(100% - 26px) 0, 100% 26px, 100% 100%, 26px 100%, 0 calc(100% - 26px)); }
  .desktop-stage .hb-hoja { padding: 44px 54px 38px; }
  .hb-hoja::before, .hb-hoja::after { content: ""; position: absolute; width: 26px; height: 26px; pointer-events: none; }
  .hb-hoja::before { top: 0; right: 0; background: linear-gradient(225deg, rgba(${SH},.34), transparent); }
  .hb-hoja::after { bottom: 0; left: 0; background: linear-gradient(45deg, rgba(${SH},.34), transparent); }
  .hb-filete { position: absolute; inset: 14px; border: 0.5px solid rgba(${SH},.34); border-radius: 6px; pointer-events: none; }
  .hb-hoja--portada { aspect-ratio: 301/432; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .hb-seccion { position: relative; padding: 11px 3%; }
  .hb-portada { padding-top: 14px; }
  .hb-portada--sube { animation: hbPortadaSube .9s cubic-bezier(.22,.61,.36,1) both; }

  /* Tipos */
  .hb-kicker { font-family: ${SANS}; font-weight: 400; font-size: 10px; letter-spacing: .39em; text-transform: uppercase; color: ${TINTA_SUAVE}; margin: 0 0 10px; }
  .hb-dato { font-family: ${SANS}; font-weight: 400; font-size: 13px; letter-spacing: .16em; text-transform: uppercase; color: ${TINTA}; margin: 0 0 8px; }
  .hb-cuerpo { font-family: ${SANS}; font-weight: 300; font-size: 15px; line-height: 1.75; color: ${TINTA}; margin: 0 auto 16px; max-width: 46ch; }
  .hb-num { font-family: ${SERIF}; font-weight: 300; font-size: 26px; line-height: 1; color: ${TINTA}; margin: 0 0 8px; }
  .hb-titulo { font-family: ${SCRIPT}; font-weight: 400; font-size: 34px; line-height: 1.25; color: ${TINTA}; margin: 0 0 22px; display: inline-block; transform: rotate(-2.5deg); }
  .hb-script { font-family: ${SCRIPT}; font-weight: 400; font-size: 34px; line-height: 1.3; color: ${TINTA}; margin: 0 0 8px; display: inline-block; transform: rotate(-2.5deg); }
  .hb-nombres { font-family: ${SERIF}; font-weight: 300; font-size: 38px; line-height: 1.12; margin: 0 0 14px; color: ${matiz(PAPEL, -4)};
    text-shadow: var(--hb-rel); display: flex; flex-direction: column; align-items: center; }
  .hb-amp { font-family: ${SCRIPT}; font-weight: 400; font-size: 34px; line-height: 1.2; color: ${TINTA}; text-shadow: none; margin: 2px 0; }
  .hb-cifra { font-family: ${SERIF}; font-weight: 300; font-size: 86px; line-height: .9; color: ${matiz(PAPEL, -4)}; text-shadow: var(--hb-rel); margin: 6px 0 8px; }
  .hb-filete-corto { width: 38px; height: 0.5px; background: rgba(${SH},.6); margin: 14px auto 16px; }
  .hb-hairline { height: 0.5px; background: rgba(${SH},.3); margin: 22px 0; }
  .hb-lugar { font-family: ${SERIF}; font-weight: 400; font-style: italic; font-size: 26px; line-height: 1.2; color: ${TINTA}; margin: 0 0 8px; }
  .hb-link { display: inline-flex; align-items: center; min-height: 44px; font-family: ${SANS}; font-weight: 400; font-size: 11px; letter-spacing: .24em; text-transform: uppercase; color: ${TINTA}; border-bottom: 0.5px solid rgba(${SH},.7); text-decoration: none; }
  .hb-btn-solido { display: inline-flex; align-items: center; justify-content: center; min-height: 48px; padding: 0 26px; background: ${TINTA}; color: ${PAPEL}; border: none; font-family: ${SANS}; font-weight: 400; font-size: 11.5px; letter-spacing: .24em; text-transform: uppercase; cursor: pointer; text-decoration: none; }
  .hb-btn-fantasma { display: inline-flex; align-items: center; justify-content: center; min-height: 48px; padding: 0 22px; background: transparent; color: ${TINTA}; border: 0.5px solid rgba(${SH},.5); font-family: ${SANS}; font-weight: 400; font-size: 11px; letter-spacing: .24em; text-transform: uppercase; cursor: pointer; }
  .hb-frase-seccion { position: relative; padding: 48px 8%; text-align: center; background: transparent; }
  .desktop-stage .hb-frase-seccion { padding: 64px 8%; }
  .hb-frase { font-family: ${SERIF}; font-weight: 300; font-style: italic; font-size: 28px; line-height: 1.35; color: ${TINTA}; margin: 0 auto 6px; max-width: 26ch; }
  .desktop-stage .hb-frase { font-size: 34px; }

  /* Entrada de sección */
  .hb-entra { opacity: 0; transform: perspective(800px) rotateY(6deg) translateY(10px); transform-origin: left center;
    transition: opacity 1.2s cubic-bezier(.22,.61,.36,1), transform .35s cubic-bezier(.22,.61,.36,1); }
  .hb-entra--visto { opacity: 1; transform: none; }

  /* Cronograma */
  .hb-cronograma { position: relative; text-align: left; max-width: 380px; margin: 0 auto; }
  .hb-cronograma-eje { position: absolute; left: 74px; top: 10px; bottom: 10px; width: 0.5px; background: rgba(${SH},.45); }
  .hb-hito { display: flex; align-items: center; gap: 12px; padding: 11px 0; }
  .hb-hito-hora { font-family: ${SANS}; font-weight: 400; font-size: 13px; letter-spacing: .16em; color: ${TINTA_SUAVE}; width: 62px; text-align: right; flex-shrink: 0; }
  .hb-hito-punto { width: 3px; height: 3px; border-radius: 50%; background: ${ACENTO}; flex-shrink: 0; }
  .hb-hito-titulo { font-family: ${SERIF}; font-weight: 400; font-style: italic; font-size: 20px; color: ${TINTA}; }

  /* Mapa */
  .hb-mapa { height: 170px; display: flex; align-items: center; justify-content: center; overflow: hidden;
    background-color: ${PAPEL2}; background-image: repeating-linear-gradient(0deg, rgba(${SH},.12) 0 0.5px, transparent 0.5px 26px), repeating-linear-gradient(90deg, rgba(${SH},.12) 0 0.5px, transparent 0.5px 26px);
    border: 0.5px solid rgba(${SH},.34); margin-bottom: 18px; }
  .desktop-stage .hb-mapa { height: 240px; }

  /* Banco */
  .hb-banco-fila { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 9px 0; border-bottom: 0.5px solid rgba(${SH},.22); text-align: left; }
  .hb-banco-clave { display: block; font-family: ${SANS}; font-weight: 400; font-size: 10px; letter-spacing: .39em; text-transform: uppercase; color: ${TINTA_SUAVE}; margin-bottom: 2px; }
  .hb-banco-valor { display: block; font-family: ${SANS}; font-weight: 300; font-size: 15px; color: ${TINTA}; overflow-wrap: anywhere; }
  .hb-hoja #banco .t-kicker, .hb-hoja h4 { font-family: ${SANS} !important; font-weight: 400 !important; font-size: 10px !important; letter-spacing: .39em !important; text-transform: uppercase !important; color: ${TINTA_SUAVE} !important; }

  /* Quiz */
  .hb-quiz-opcion { display: block; width: 100%; max-width: 420px; margin: 0 auto 8px; min-height: 48px; padding: 12px 16px; cursor: pointer; text-align: left;
    font-family: ${SANS}; font-weight: 300; font-size: 15px; color: ${TINTA}; background: transparent; border: 0.5px solid rgba(${SH},.34); transition: background .2s ease, color .2s ease; }
  .hb-quiz-opcion[data-elegida] { background: ${TINTA}; color: ${PAPEL}; }
  .hb-quiz-opcion:disabled { cursor: default; }

  /* Las tres hojas que caen cuando se confirma: entran desde arriba, con
     120 ms de diferencia entre una y otra, y se quedan. Quietas hasta que
     el RSVP muestra su bloque de confirmado, que es el único [role=status]
     con aria-live: así no caen cuando alguien avisa que no viene. */
  @keyframes hbCae1 { from { transform: translateY(-120px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @keyframes hbCae2 { from { transform: translateY(-150px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @keyframes hbCae3 { from { transform: translateY(-100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  .hb-hoja-cae { top: 0; opacity: 0; z-index: 1; }
  .hb-seccion:has([role="status"][aria-live="polite"]) .hb-hoja-cae:nth-of-type(1) { left: 18%; animation: hbCae1 .9s cubic-bezier(.22,.61,.36,1) both; }
  .hb-seccion:has([role="status"][aria-live="polite"]) .hb-hoja-cae:nth-of-type(2) { left: 48%; top: 8px; animation: hbCae2 .9s cubic-bezier(.22,.61,.36,1) .12s both; }
  .hb-seccion:has([role="status"][aria-live="polite"]) .hb-hoja-cae:nth-of-type(3) { left: 74%; top: 2px; animation: hbCae3 .9s cubic-bezier(.22,.61,.36,1) .24s both; }

  /* Monograma */
  .hb-monograma { position: relative; width: 78px; height: 98px; display: flex; align-items: center; justify-content: center; margin: 6px auto 18px; }
  .hb-monograma svg { position: absolute; inset: 0; color: rgba(${SH},.7); }
  .hb-monograma span { position: relative; font-family: ${SERIF}; font-weight: 300; font-size: 22px; letter-spacing: .18em; color: ${TINTA}; }

  /* Splash */
  .hb-splash { position: fixed; inset: 0; z-index: 99999; display: flex; align-items: center; justify-content: center; padding: 16px 3%;
    background-color: ${PAPEL}; background-image: ${GRANO_PAGINA}; background-blend-mode: multiply; }
  .hb-splash--sale { animation: hbSplashSale .9s ease both; }
  .hb-splash-hoja { position: relative; width: 100%; max-width: 340px; aspect-ratio: 301/432; padding: 40px 28px 34px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .hb-splash-nombre { font-family: ${SCRIPT}; font-weight: 400; font-size: 56px; line-height: 1.06; color: ${TINTA}; margin: 2px 0 4px; }
  @keyframes hbSplashSale { from { opacity: 1; } to { opacity: 0; } }
  @keyframes hbPortadaSube { from { transform: translateY(24px); } to { transform: translateY(0); } }
  @keyframes hbPrensado { from { transform: scale(.96); opacity: 0; } to { transform: scale(1); opacity: 1; } }

  /* Pase (burbuja arriba) */
  .hb-pase-burbuja { position: fixed; top: 12px; left: 50%; transform: translateX(-50%); z-index: 99999; cursor: pointer; padding: 8px 14px;
    background-color: ${PAPEL}; background-image: ${GRANO_HOJA}; background-blend-mode: multiply; border: 0.5px solid rgba(${SH},.34); box-shadow: -1.41px 1.41px 8px rgba(${SH},.34); transition: all .5s ease; }
  .hb-pase-burbuja--abierta { width: calc(100% - 32px); max-width: 360px; padding: 12px 16px; }

  /* Pastilla inferior */
  .hb-pastilla { transition: opacity .35s ease, transform .35s cubic-bezier(.22,.61,.36,1); }
  .hb-pastilla--oculta { opacity: 0; transform: translateY(26px); transition: opacity .3s ease, transform .3s cubic-bezier(.22,.61,.36,1); pointer-events: none; }
  .hb-raiz .bottom-nav, .desktop-stage.hb-escenario .bottom-nav { border-radius: 0 !important; background: ${PAPEL} !important; border: 0.5px solid rgba(${SH},.28) !important;
    box-shadow: -1.41px 1.41px 8px rgba(${SH},.34) !important; backdrop-filter: none !important; padding: 5px !important; gap: 2px !important; }
  .hb-raiz .bottom-nav a { color: ${TINTA} !important; opacity: .55 !important; min-height: 48px; }
  .hb-raiz .bottom-nav a[aria-current="true"] { opacity: 1 !important; background: ${PAPEL2}; }

  /* Componentes compartidos vestidos con el registro */
  .hb-raiz .tpl h2, .hb-raiz .tpl h3, .hb-raiz .tpl h4 { font-family: ${SERIF}; color: ${TINTA}; }
  /* La script tiene que ganarle a la regla de arriba y a la tipografía que
     el anfitrión elige en el wizard (--font-title): los títulos de sección,
     el &, la frase de cierre y el nombre del splash van SIEMPRE en Final
     Parade, es la firma de la colección. */
  .hb-raiz .hb-titulo, .hb-raiz .tpl h3.hb-titulo, .hb-raiz .hb-script, .hb-raiz .hb-amp, .hb-raiz .hb-splash-nombre, .hb-raiz .hb-sinonimo { font-family: ${SCRIPT} !important; font-weight: 400 !important; font-style: normal !important; }
  .hb-raiz .tpl .t-kicker, .hb-raiz .tpl p.kicker { font-family: ${SANS} !important; color: ${TINTA_SUAVE} !important; font-size: 10px !important; font-weight: 400 !important; letter-spacing: .39em !important; text-transform: uppercase !important; display: block; }
  .hb-raiz .tpl .t-kicker::before, .hb-raiz .tpl p.kicker::before { display: none !important; }
  .hb-raiz .tpl div:not(#countdown div), .hb-raiz .tpl section, .hb-raiz .tpl button, .hb-raiz .tpl input, .hb-raiz .tpl iframe, .hb-raiz .tpl .t-btn, .hb-raiz .tpl .album-btn { border-radius: 0 !important; }
  .hb-raiz .tpl .album-item { border-radius: 0 !important; box-shadow: -1.41px 1.41px 4px rgba(${SH},.40); border: 10px solid ${PAPEL}; border-bottom-width: 26px; background-color: ${PAPEL}; }
  .hb-raiz .tpl .album-btn { color: ${TINTA} !important; border: 0.5px solid rgba(${SH},.5) !important; background: transparent !important; }
  .hb-raiz .tpl .cascade-frame { box-shadow: -1.41px 1.41px 4px rgba(${SH},.40) !important; background: ${PAPEL} !important; }

  /* La cuenta regresiva de Herbario: los días en grande, el resto al lado. */
  .hb-cuenta { display: flex; align-items: center; justify-content: center; gap: 22px; flex-wrap: wrap; margin: 4px auto 20px; }
  .hb-cuenta-dias { text-align: center; display: flex; flex-direction: column; gap: 6px; }
  .hb-cuenta-divisor { width: 0.5px; height: 112px; background: rgba(${SH},.45); }
  .hb-cuenta-lado { display: flex; flex-direction: column; gap: 8px; text-align: left; }
  .hb-cuenta-fila { display: flex; align-items: baseline; gap: 9px; }
  .hb-cuenta-regla { display: block; width: 92px; height: 0.5px; background: rgba(${SH},.3); margin: 8px 0; }
  .hb-cuenta-num { font-family: ${SERIF}; font-weight: 300; font-size: 30px; line-height: 1; color: ${TINTA}; min-width: 44px; font-variant-numeric: tabular-nums; }
  .hb-cuenta-etq { font-family: ${SANS}; font-weight: 400; font-size: 8.5px; letter-spacing: .16em; text-transform: uppercase; color: ${TINTA_SUAVE}; white-space: nowrap; }
  .desktop-stage .hb-cuenta-num { font-size: 46px; }
  .hb-cuenta-aviso { text-align: center; }

  /* Sin íconos prestados: los componentes compartidos traen los suyos (una
     nota musical, un tilde, una cama) y al lado del ícono de línea de la
     cabecera quedaban dos dibujos distintos diciendo lo mismo en la misma
     sección. El juego de línea de la colección es el único que se ve. */
  .hb-raiz #songs svg.lucide, .hb-raiz #rsvp svg.lucide, .hb-raiz .ia-icon-box svg.lucide { display: none !important; }
  .hb-raiz .ia-icon-box { display: none !important; }

  .hb-raiz #rsvp.section.dark { background: transparent !important; color: ${TINTA} !important; border: none !important; padding: 0 !important; display: flex; flex-direction: column; align-items: center; }
  .hb-raiz #rsvp.section.dark > p.t-kicker, .hb-raiz #rsvp.section.dark > h2, .hb-raiz #rsvp.section.dark > .d-rsvp-grid { width: 100% !important; max-width: 420px !important; text-align: left !important; }
  .hb-raiz #rsvp.section.dark h2 { display: none !important; }
  .hb-raiz #rsvp.section.dark b, .hb-raiz #rsvp.section.dark strong { color: ${TINTA} !important; }
  .hb-raiz #rsvp.section.dark label { text-transform: uppercase !important; font-size: 10px !important; font-family: ${SANS} !important; letter-spacing: .39em !important; color: ${TINTA_SUAVE} !important; font-weight: 400 !important; }
  .hb-raiz #rsvp.section.dark input { background: ${PAPEL2} !important; color: ${TINTA} !important; border: 0.5px solid rgba(${SH},.34) !important; border-radius: 0 !important; padding: 12px 14px !important; font-family: ${SANS} !important; font-weight: 300 !important; font-size: 15px !important; min-height: 48px; }
  .hb-raiz #rsvp.section.dark input::placeholder { color: ${TINTA_SUAVE} !important; opacity: .8 !important; }
  .hb-raiz #rsvp.section.dark .t-btn { border-radius: 0 !important; min-height: 48px; padding: 0 22px !important; flex: 1 !important; min-width: 130px !important; background: transparent !important; color: ${TINTA} !important; border: 0.5px solid rgba(${SH},.5) !important; font-family: ${SANS} !important; font-weight: 400 !important; text-transform: uppercase !important; letter-spacing: .24em !important; font-size: 11.5px !important; }
  .hb-raiz #rsvp.section.dark .t-btn.solid, .hb-raiz #rsvp.section.dark button[data-rsvp="confirmar"] { background: ${TINTA} !important; color: ${PAPEL} !important; border-color: ${TINTA} !important; }
  .hb-raiz #rsvp.section.dark div:has(> button[data-rsvp="confirmar"]) { flex-direction: row !important; gap: 12px !important; }
  .hb-raiz .tpl .d-rsvp-grid { display: flex !important; flex-direction: column !important; gap: 24px !important; align-items: flex-start !important; }
  .hb-raiz .tpl .d-rsvp-grid > div { width: 100% !important; }
  .hb-raiz #rsvp.section.dark .t-detail { background: transparent !important; border: none !important; border-top: 0.5px solid rgba(${SH},.3) !important; padding: 16px 0 0 !important; text-align: left !important; box-shadow: none !important; width: 100% !important; }
  .hb-raiz #rsvp.section.dark .t-detail h4 { color: ${TINTA_SUAVE} !important; font-family: ${SANS} !important; text-transform: uppercase !important; font-size: 10px !important; letter-spacing: .39em !important; font-weight: 400 !important; margin-bottom: 6px !important; }
  .hb-raiz #rsvp.section.dark .t-detail p { color: ${TINTA} !important; font-size: 14px !important; }
  .hb-raiz #rsvp.section.dark .t-detail p b { font-family: ${SERIF} !important; font-weight: 300 !important; font-size: 26px !important; color: ${TINTA} !important; }
  /* CONFIRMADO en relieve hueco: prensado hacia adentro, creciendo de .96 a 1. */
  .hb-raiz #rsvp.section.dark [class*="confirm"] h3, .hb-raiz #rsvp.section.dark h3 { font-family: ${SERIF} !important; font-weight: 300 !important; font-size: 44px !important; line-height: 1 !important; letter-spacing: .04em !important; color: ${matiz(PAPEL, 3)} !important;
    text-shadow: 0 -1px 0 rgba(255,255,255,.90), 0 1px 1px rgba(${SH},.50), 0 2px 3px rgba(${SH},.12); animation: hbPrensado .5s cubic-bezier(.22,.61,.36,1) both; }

  .hb-raiz #songs.d-sec.dark, .hb-raiz #songs { background: transparent !important; padding: 0 !important; display: flex; flex-direction: column; align-items: center; color: ${TINTA}; }
  .hb-raiz #songs > p.t-kicker, .hb-raiz #songs > form, .hb-raiz #songs > div { width: 100% !important; max-width: 420px !important; text-align: left !important; }
  .hb-raiz #songs h2, .hb-raiz #songs p:not(.t-kicker) { font-family: ${SANS}; color: ${TINTA}; }
  .hb-raiz #songs .mod-input-row { display: flex !important; flex-direction: column !important; gap: 0 !important; width: 100% !important; }
  .hb-raiz #songs input { background: ${PAPEL2} !important; color: ${TINTA} !important; border: 0.5px solid rgba(${SH},.34) !important; border-radius: 0 !important; min-height: 48px; padding: 0 14px !important; font-family: ${SANS} !important; font-weight: 300 !important; font-size: 15px !important; }
  .hb-raiz #songs button[type="submit"], .hb-raiz #songs .t-btn { background: ${TINTA} !important; color: ${PAPEL} !important; border: none !important; border-radius: 0 !important; min-height: 48px; font-family: ${SANS} !important; font-weight: 400 !important; font-size: 11.5px !important; letter-spacing: .24em !important; text-transform: uppercase !important; }
  .hb-raiz #songs .mod-item, .hb-raiz #songs li { background: transparent !important; border: none !important; border-bottom: 0.5px solid rgba(${SH},.22) !important; border-radius: 0 !important; }

  .hb-raiz #info-adicional { background: transparent !important; }
  .hb-raiz #ia-trigger-btn { background: transparent !important; color: ${TINTA} !important; border: 0.5px solid rgba(${SH},.5) !important; border-radius: 0 !important; font-family: ${SANS} !important; letter-spacing: .24em !important; text-transform: uppercase !important; font-size: 11px !important; }

  .hb-raiz .copy-btn { background: transparent !important; color: ${TINTA} !important; border: 0.5px solid rgba(${SH},.5) !important; border-radius: 0 !important; font-family: ${SANS} !important; font-weight: 400 !important; font-size: 10px !important; letter-spacing: .24em !important; text-transform: uppercase !important; }
  .hb-raiz .copy-btn.copied { background: ${TINTA} !important; color: ${PAPEL} !important; }

  /* Post-evento */
  .hb-post { position: relative; z-index: 1; max-width: 640px; margin: 0 auto; padding: 48px 3% 24px; min-height: 100dvh; display: flex; align-items: center; }
  .hb-post-hoja { width: 100%; padding: 44px 30px 38px; }
  .hb-sinonimo { font-family: ${SCRIPT}; font-weight: 400; font-style: normal; color: ${TINTA}; text-shadow: none; }

  @media (prefers-reduced-motion: reduce) {
    .hb-entra { opacity: 1; transform: none; transition: none; }
    .hb-splash--sale, .hb-portada--sube { animation: none; }
    .hb-pastilla, .hb-pastilla--oculta { transition: none; opacity: 1; transform: none; pointer-events: auto; }
  }
`;
