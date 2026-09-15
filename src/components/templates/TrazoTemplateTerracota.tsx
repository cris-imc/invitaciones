"use client";

/**
 * TrazoTemplateTerracota.tsx — Colección Paper · Papel Prensado · Familia 05 "Trazo"
 * Variante: Terracota (generada por scripts/gen-papel-prensado-variants.js, no editar a mano). Las otras cuatro (Tinta, Terracota, Verde,
 * Ciruela) se generan con scripts/gen-papel-prensado-variants.js.
 *
 * GENERADO por scripts/derivar-trazo.js a partir de PrensaTemplate.tsx —
 * no editar a mano.
 *
 * Portado desde mockup/Paper/Trazo - Panoramica.dc.html. Misma imprenta que
 * Prensa, dibujada a mano:
 *
 *  - LO QUE CAMBIA POR VARIANTE ES LA TINTA, NO EL PAPEL. El papel es
 *    siempre el mismo cuaderno (#F6F1E9); lo que cambia es el color del
 *    trazo. Como los garabatos son máscaras CSS pintadas con la tinta, la
 *    familia pasa de lápiz negro a lápiz de color sin regenerar una pieza.
 *  - LOS ORNAMENTOS SON DIBUJOS: garabatos largos que se salen por los
 *    bordes de la hoja, destellos, un corazón donde Prensa pone los anillos
 *    y un marco circular alrededor de la cifra del countdown.
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
const tzCormorant = Cormorant_Garamond({
  subsets: ["latin"],
  preload: false,
  style: ["normal", "italic"],
  weight: ["300", "400"],
  variable: "--tz-cormorant",
  display: "swap",
});
const tzJost = Jost({
  subsets: ["latin"],
  preload: false,
  weight: ["300", "400", "500"],
  variable: "--tz-jost",
  display: "swap",
});

// ─── Paleta ─────────────────────────────────────────────────────────────────
// Lo único que cambia por variante es el par de papeles. El generador
// reemplaza estos dos hex y el nombre del identificador; todo lo demás queda.
const PAPEL = "#F6F1E9";
const PAPEL2 = "#EFE8DC";
const TINTA = "#8A5340";
const TINTA_SUAVE = "#7E7A70";
/** rgb de la sombra: se usa en todos los rgba() del registro. */
const SH = "112,106,94";

// Las tres caras son parte del diseño y no se cambian desde el wizard (a
// diferencia de las Flat de siempre, que leen --font-title/--font-body-custom):
// el relieve está calibrado para Cormorant 300 y la firma de la colección es
// la script. Por eso el paso de Tipografía no aparece para Paper (ver
// wizard-steps-config.ts).
const SERIF = "var(--tz-cormorant), 'Cormorant Garamond', serif";
const SANS = "var(--tz-jost), 'Jost', sans-serif";
const SCRIPT = "var(--font-final-parade, 'Final Parade Script'), cursive";

// ─── Piezas ─────────────────────────────────────────────────────────────────
// Sólo el set compartido de íconos de línea, como máscara CSS con la tinta
// de fondo: son tinta plana, así que nunca van como <img>. Las proporciones
// vienen del INVENTARIO de public/templates.
const PIEZAS = "/templates/iconos-linea/";
/** Los dibujos sueltos de esta familia, con su proporción real. */
const DIBUJOS = "/templates/trazo/";
const TRAZOS = {
  garabatoLargo: { f: "garabato-largo", ar: "176/1168" },
  garabatoCorto: { f: "garabato-corto", ar: "584/161" },
  corazonGrande: { f: "corazon-grande", ar: "196/238" },
  corazonChico: { f: "corazon-chico", ar: "134/148" },
  destello1: { f: "destello-1", ar: "126/185" },
  destello3: { f: "destello-3", ar: "72/96" },
  marcoCircular: { f: "marco-circular", ar: "632/674" },
} as const;
type NombreDeTrazo = keyof typeof TRAZOS;
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

interface TrazoTemplateTerracotaProps {
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
    <div data-tz-reveal="1" data-tz-retraso={retraso} className={`tz-entra ${className ?? ""}`} style={style}>
      {children}
    </div>
  );
}

/**
 * Un dibujo suelto, como máscara con la tinta de la variante.
 *
 * Van fuera del flujo y con pointerEvents none: se salen por los bordes de
 * la hoja a propósito (el garabato largo entra un 17 % por fuera), así que
 * si atajaran clics romperían los botones que quedan debajo.
 */
function Dibujo({ nombre, ancho, ...posicion }: { nombre: NombreDeTrazo; ancho: string } & React.CSSProperties) {
  const t = TRAZOS[nombre];
  const u = `url(${DIBUJOS}${t.f}.webp) no-repeat center / contain`;
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute", width: ancho, aspectRatio: t.ar, background: TINTA,
        WebkitMask: u, mask: u, pointerEvents: "none", zIndex: 0, ...posicion,
      }}
    />
  );
}

/** Una hoja de papel prensado: grano, sombra, esquinas plegadas y filete. */
function Hoja({ children, className, style, portada = false }: { children: React.ReactNode; className?: string; style?: React.CSSProperties; portada?: boolean }) {
  return (
    <div className={`tz-hoja ${portada ? "tz-hoja--portada" : ""} ${className ?? ""}`} style={style}>
      <div className="tz-filete" aria-hidden="true" />
      {children}
    </div>
  );
}

/** Cabecera de sección: ícono, número con punto y título en script. */
function Cabecera({ icono, numero, titulo, anchoIcono, topeIcono }: { icono: NombreDeIcono; numero: string; titulo: string; anchoIcono?: string; topeIcono?: number }) {
  return (
    <Entra>
      <IconoLinea nombre={icono} ancho={anchoIcono} tope={topeIcono} />
      <p className="tz-num">{numero}.</p>
      <h3 className="tz-titulo">{titulo}</h3>
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
function CuentaPrensa({ targetDate }: { targetDate: Date }) {
  const tx = useTextos();
  const { time, isEventDay, isPast, hasEnded } = useCountdown(targetDate);
  const enCero = time.dias === 0 && time.hs === 0 && time.min === 0 && time.seg === 0;

  if (isEventDay || (!isPast && enCero)) {
    return (
      <div id="countdown" className="tz-cuenta-aviso">
        <p className="tz-script">{tx("invitacion.cuentaRegresiva.llegoElDia")}</p>
        <p className="tz-cuerpo" style={{ marginBottom: 0 }}>{tx("invitacion.cuentaRegresiva.hoyEsElGranDia")}</p>
      </div>
    );
  }

  if (hasEnded || isPast) {
    return (
      <div id="countdown" className="tz-cuenta-aviso">
        <p className="tz-script">{tx("invitacion.cuentaRegresiva.yaFueUnaNocheIncreible")}</p>
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
    <div id="countdown" className="tz-cuenta">
      {celdas.map((c) => (
        <div key={c.l} className="tz-cuenta-celda">
          <span className="tz-cuenta-num">{c.v}</span>
          <span className="tz-cuenta-etq">{c.l}</span>
        </div>
      ))}
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
    <div className="tz-banco-fila">
      <div style={{ minWidth: 0, flex: 1 }}>
        <span className="tz-banco-clave">{label}</span>
        <span className="tz-banco-valor">{value}</span>
      </div>
      <button className={`copy-btn tz-btn-fantasma ${copied ? "copied" : ""}`} type="button" onClick={handle} style={{ minHeight: 40, padding: "0 14px" }}>
        {copied ? "✓ " + tx("invitacion.regalos.copiado") : tx("invitacion.regalos.copiar")}
      </button>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="tz-banco-fila">
      <div style={{ minWidth: 0, flex: 1 }}>
        <span className="tz-banco-clave">{label}</span>
        <span className="tz-banco-valor">{value}</span>
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
        <p className="tz-lugar">{tx("invitacion.quiz.juegoCompletado")}</p>
        <p className="tz-dato">{score} / {preguntas.length}</p>
        {isSaving ? (
          <p className="tz-cuerpo" style={{ color: TINTA_SUAVE }}>{tx("invitacion.quiz.guardandoResultados")}</p>
        ) : (
          stats && stats.count > 0 && (
            <p className="tz-cuerpo" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: TINTA_SUAVE }}>
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
      <p className="tz-lugar">{formatQuestion(q.pregunta)}</p>
      {q.opciones.map((opt, oi) => {
        const chosen = picks[currentIdx] === oi;
        return (
          <button
            key={oi}
            type="button"
            className="tz-quiz-opcion"
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
export function TrazoTemplateTerracota({ invitation, guest, isPersonalized = false }: TrazoTemplateTerracotaProps) {
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
    raiz.style.setProperty("--tz-rel", relieve(0, true));
    let raf = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const alScrollear = (y: number) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setPastillaOculta(false), 370);
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        raiz.style.setProperty("--tz-rel", relieve(y, quietoRef.current));
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
  // que trae cada bloque (data-tz-retraso: 0 / 120 / 240). Se arma cada vez
  // que se abre la portada porque hasta entonces el cuerpo no está montado.
  useEffect(() => {
    if (!isCoverOpen) return;
    const raiz = raizRef.current;
    if (!raiz) return;
    const bloques = Array.from(raiz.querySelectorAll<HTMLElement>("[data-tz-reveal]"));
    if (quietoRef.current || !("IntersectionObserver" in window)) {
      bloques.forEach((b) => b.classList.add("tz-entra--visto"));
      return;
    }
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target as HTMLElement;
        const d = Number(el.dataset.prRetraso || 0);
        el.style.transitionDelay = `${d}ms`;
        el.classList.add("tz-entra--visto");
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
    "--font-cormorant": "var(--tz-cormorant)",
    "--font-inter": "var(--tz-jost)",
    "--font-sans": "var(--tz-jost)",
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
      <div className={`${tzCormorant.variable} ${tzJost.variable} tz-raiz`} style={varsDeTema} data-theme={theme} ref={raizRef}>
        <style>{CSS_TRAZO}</style>
        <div className="tz-fondo" aria-hidden="true" />
        <main className="tz-post">
          <Hoja className="tz-post-hoja">
            <IconoLinea nombre={esXV ? "torta" : "anillos"} ancho="16%" />
            <p className="tz-kicker">{tx("invitacion.frase.unMomento")}</p>
            <h1 className="tz-nombres" style={{ fontSize: 38 }}>
              <AnimatedSynonyms words={[tx("invitacion.frase.inolvidable"), tx("invitacion.frase.unico"), tx("invitacion.frase.eterno"), tx("invitacion.frase.magico")]} className="tz-sinonimo" />
            </h1>
            <FileteConPunto />
            <p className="tz-cuerpo">{tx("invitacion.frase.graciasPorAcompanarnosCorto")}</p>
            <p className="tz-dato">{tx("invitacion.album.disponibleHasta")} {expirationDateStr}</p>
            <div style={{ marginTop: 22 }}>
              {livePhotos.length > 0 ? (
                <AlbumCarousel photos={livePhotos} hideHeader={true} />
              ) : (
                <>
                  <p className="tz-lugar">{tx("invitacion.album.fotografico")}</p>
                  <p className="tz-cuerpo" style={{ color: TINTA_SUAVE }}>{tx("invitacion.album.sinCapturas")}</p>
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
    <div className={`${tzCormorant.variable} ${tzJost.variable} tz-raiz`} style={varsDeTema} ref={raizRef}>
      <style>{CSS_TRAZO}</style>

      {/* ── Splash (celular) ────────────────────────────────────────── */}
      {!isCoverOpen && (
        <div className={`tz-splash ${isClosingCover ? "tz-splash--sale" : ""}`}>
          {portadaFondoAnimado && (
            <div className="acp-mobile-only">
              <AnimatedCoverPhoto
                photoSrc={portadaImagenFondoDesktopRaw as string}
                tintColor1={PAPEL}
                tintColor2={TINTA_SUAVE}
                effect="enfoque"
                scrimColorRgb="246,241,233"
              />
            </div>
          )}
          <Hoja className="tz-splash-hoja">
            <p className="tz-kicker">{saludaAlInvitado ? portadaKicker : kickerDelEvento}</p>
            <p className="tz-splash-nombre">{guestNameDisplay}</p>
            <div className="tz-filete-corto" aria-hidden="true" />
            {/* Los nombres de los novios sólo si arriba no están ya: cuando
                el saludo es para el invitado son el dato que falta ("¿la boda
                de quién?"); cuando el nombre grande ya es el de ellos,
                repetirlos era escribir lo mismo dos veces. */}
            {saludaAlInvitado && <p className="tz-dato">{nombresLinea}</p>}
            <p className="tz-dato" style={{ color: TINTA_SUAVE }}>{fechaCorta}{ciudad ? ` · ${ciudad}` : ""}</p>
            {Boolean(activeDressCode) && <p className="tz-kicker" style={{ marginTop: 6 }}>{tx("invitacion.ubicacion.dressCode")} {activeDressCode}</p>}
            <button type="button" onClick={openInvitation} className="tz-btn-solido" style={{ marginTop: 26 }}>
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
          className={`tz-pase-burbuja ${isTicketMaximized ? "tz-pase-burbuja--abierta" : ""}`}
        >
          {isTicketMaximized ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", gap: 14 }}>
              <div style={{ textAlign: "left" }}>
                <span className="tz-kicker" style={{ margin: 0, fontSize: 8 }}>{tx("invitacion.pase.pase")}</span>
                <span style={{ display: "block", fontFamily: SERIF, fontWeight: 300, fontSize: 18, color: TINTA, lineHeight: 1.1 }}>{guest.name}</span>
                {guest.mesas && guest.mesas.length > 0 && (
                  <span className="tz-kicker" style={{ margin: "4px 0 0", fontSize: 8 }}>{guest.mesas.join(" · ")}</span>
                )}
              </div>
              <div style={{ textAlign: "right", borderLeft: `0.5px solid rgba(${SH},.34)`, paddingLeft: 12 }}>
                <span style={{ display: "block", fontFamily: SERIF, fontWeight: 300, fontSize: 22, color: TINTA, lineHeight: 1 }}>{guest.expectedCount}</span>
                <span className="tz-kicker" style={{ margin: 0, fontSize: 8 }}>{guest.expectedCount === 1 ? tx("invitacion.pase.lugar") : tx("invitacion.pase.lugares")}</span>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <IconoPastilla nombre="tarjeta" />
              <span className="tz-kicker" style={{ margin: 0 }}>{tx("invitacion.pase.pase")}</span>
            </div>
          )}
        </div>,
        document.body
      )}
      {mounted && musicaHabilitada && isCoverOpen && createPortal(
        <MusicToggleButton isPlaying={isMusicPlaying} onToggle={toggleMusic} className="fixed top-3 right-3 z-[99998]" />,
        document.body
      )}

      <div className="desktop-stage tz-escenario" data-theme={theme}>
        <div className="tz-fondo" aria-hidden="true" />

        {/* ── Escritorio: la hoja grande, fija a la izquierda ─────────── */}
        <aside className="d-left hide-mobile tz-izquierda">
          <Hoja portada className="tz-hoja-grande">
            <Dibujo nombre="garabatoLargo" ancho="30%" right="-17%" top="-4%" transform="scaleX(-1)" />
            <Dibujo nombre="corazonChico" ancho="8%" position="relative" margin="0 auto 12px" />
            <p className="tz-kicker">{kickerDelEvento}</p>
            <h1 className="tz-nombres">
              <span>{nombre1}</span>
              {nombre2 && <span className="tz-amp">&amp;</span>}
              {nombre2 && <span>{nombre2}</span>}
            </h1>
            <div className="tz-filete-corto" aria-hidden="true" />
            <p className="tz-dato">{fechaLarga}</p>
            {ciudad && <p className="tz-dato">{ciudad}</p>}
            <div className="tz-nav-escritorio">
              <FileteConPunto ancho={220} />
              <nav className="tz-nav-lista">
                {seccionesNav.map((s) => (
                  <a key={s.id} href={`#${s.id}`}>{s.n}. {s.label}</a>
                ))}
              </nav>
            </div>
          </Hoja>
        </aside>

        <div className="d-right tpl tz-derecha" ref={derechaRef}>
          {/* ── Portada (celular) ───────────────────────────────────── */}
          <section className="hide-desktop tz-seccion tz-portada" data-sec="00">
            <Hoja portada className={isCoverOpen ? "tz-portada--sube" : ""}>
              <Dibujo nombre="garabatoLargo" ancho="30%" left="-17%" top="-6%" />
              <Dibujo nombre="destello1" ancho="7%" left="9%" top="9%" />
              <Dibujo nombre="destello3" ancho="5%" right="10%" top="16%" />
              <Dibujo nombre="garabatoCorto" ancho="46%" right="-16%" bottom="3%" />
              <Entra>
                <Dibujo nombre="corazonChico" ancho="8%" position="relative" margin="0 auto 12px" />
                <p className="tz-kicker">{kickerDelEvento}</p>
              </Entra>
              <Entra retraso={120}>
                <h1 className="tz-nombres">
                  <span>{nombre1}</span>
                  {nombre2 && <span className="tz-amp">&amp;</span>}
                  {nombre2 && <span>{nombre2}</span>}
                </h1>
              </Entra>
              <Entra retraso={240}>
                <div className="tz-filete-corto" aria-hidden="true" />
                <p className="tz-dato">{fechaLarga}</p>
                {ciudad && <p className="tz-dato">{ciudad}</p>}
                <AddToCalendarLink eventName={nombresLinea} targetDate={fechaEvento} location={[lugarNombre, direccion].filter(Boolean).join(", ")} className="tz-link" showIcon={false}>
                  {tx("invitacion.saveTheDate.agregarAlCalendario")}
                </AddToCalendarLink>
              </Entra>
            </Hoja>
          </section>

          {/* ── 01 La cuenta regresiva ─────────────────────────────── */}
          {(invitation.contadorHabilitado ?? true) ? (
            <section className="tz-seccion" data-sec="01" id="countdown-hoja">
              <Hoja>
                <Cabecera icono="reloj" numero="01" titulo={tx("invitacion.cuentaRegresiva.kicker")} />
                <Entra retraso={120}>
                  <p className="tz-kicker">{tx("invitacion.cuentaRegresiva.faltan")}</p>
                  <CuentaPrensa targetDate={fechaEvento} />
                  <FileteConPunto />
                  <p className="tz-dato">{fechaLarga}{hora ? ` · ${hora} hs` : ""}</p>
                </Entra>
              </Hoja>
            </section>
          ) : null}

          {/* ── 02 La frase (sangra, sin hoja) ─────────────────────── */}
          {frase && (
            <SectionWrapper id="quote" delay={100} className="tz-frase-seccion">
              <Entra>
                <IconoLinea nombre={esXV ? "torta" : "anillos"} ancho={esXV ? "15%" : "16%"} />
                <p className="tz-num">02.</p>
                <p className="tz-frase">{frase}</p>
                <p className="tz-script">{tx("invitacion.frase.unasPalabras")}</p>
              </Entra>
            </SectionWrapper>
          )}

          {/* ── 03 El evento ───────────────────────────────────────── */}
          <SectionWrapper id="details" delay={150} className="tz-seccion" style={{ padding: 0 }}>
            <div className="tz-seccion" data-sec="03">
              <Hoja>
                <Cabecera icono="iglesia" numero="03" titulo={tx("invitacion.ubicacion.cuandoYDonde")} />
                <Entra retraso={120}>
                  {Boolean(invitation.ceremoniaHabilitada) && (
                    <div>
                      <p className="tz-kicker">{String(invitation.ceremoniaTitulo || tx("invitacion.ubicacion.ceremoniaCivil"))}</p>
                      {Boolean(invitation.ceremoniaNombre) && <p className="tz-lugar">{String(invitation.ceremoniaNombre)}</p>}
                      <p className="tz-dato">
                        {Boolean(invitation.ceremoniaHora) && `${String(invitation.ceremoniaHora)} hs`}
                        {Boolean(invitation.ceremoniaHora) && Boolean(invitation.ceremoniaDireccion) && " · "}
                        {Boolean(invitation.ceremoniaDireccion) && String(invitation.ceremoniaDireccion)}
                      </p>
                      {Boolean(invitation.ceremoniaMapUrl) && (
                        <a href={String(invitation.ceremoniaMapUrl)} target="_blank" rel="noopener noreferrer" className="tz-link">{tx("invitacion.ubicacion.comoLlegar")}</a>
                      )}
                      <div className="tz-hairline" aria-hidden="true" />
                    </div>
                  )}
                  {(lugarNombre || direccion) && (
                    <div>
                      <p className="tz-kicker">{tx("invitacion.ubicacion.fiestaSalon")}</p>
                      {lugarNombre && <p className="tz-lugar">{lugarNombre}</p>}
                      <p className="tz-dato">
                        {hora && `${hora} hs`}
                        {hora && direccion && " · "}
                        {direccion}
                      </p>
                      {mapUrl && <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="tz-link">{tx("invitacion.ubicacion.comoLlegar")}</a>}
                    </div>
                  )}
                </Entra>
                {(cronograma.length > 0 || activeDressCode) && (
                  <Entra retraso={240}>
                    {cronograma.length > 0 && (
                      <>
                        <div className="tz-hairline" aria-hidden="true" />
                        <p className="tz-kicker">Cronograma</p>
                        <div className="tz-cronograma" id="schedule">
                          <span className="tz-cronograma-eje" aria-hidden="true" />
                          {cronograma.map((item, i) => (
                            <Entra key={i} retraso={i * 120} className="tz-hito">
                              <span className="tz-hito-hora">{item.time ?? ""}</span>
                              <span className="tz-hito-punto" aria-hidden="true" />
                              <span className="tz-hito-titulo">{item.title}</span>
                            </Entra>
                          ))}
                        </div>
                      </>
                    )}
                    {Boolean(activeDressCode) && (
                      <>
                        <div className="tz-hairline" aria-hidden="true" />
                        <p className="tz-kicker">{tx("invitacion.ubicacion.dressCode")}</p>
                        <p className="tz-cuerpo">{activeDressCode}</p>
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
            <SectionWrapper id="album" delay={200} className="tz-seccion" style={{ padding: 0 }}>
              <div className="tz-seccion" data-sec="04">
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
            <section className="tz-seccion" data-sec="05" id="location">
              <Hoja>
                <Cabecera icono="auto" numero="05" titulo={tx("invitacion.ubicacion.tituloMapa", { lugar: lugarNombre }).replace(/^Mapa de\s*/i, "Mapa")} anchoIcono="22%" />
                <Entra retraso={120}>
                  <div className="tz-mapa">
                    {embedMapUrl ? (
                      <iframe src={embedMapUrl} width="100%" height="100%" style={{ border: 0, display: "block" }} loading="lazy" title={tx("invitacion.ubicacion.tituloMapa", { lugar: lugarNombre })} referrerPolicy="no-referrer-when-downgrade" />
                    ) : (
                      <span className="tz-kicker" style={{ margin: 0 }}>{tx("invitacion.ubicacion.mapaNoDisponible")}</span>
                    )}
                  </div>
                  <p className="tz-dato">{[direccion, ciudad].filter(Boolean).join(" · ")}</p>
                  <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="tz-btn-solido">{tx("invitacion.ubicacion.verMapaFiesta")}</a>
                </Entra>
              </Hoja>
            </section>
          )}

          {/* ── 06 Tu confirmación ─────────────────────────────────── */}
          {rsvpEnabled && (
            <section className="tz-seccion" data-sec="06" id="rsvp-hoja">
              <Hoja>
                <Cabecera icono="tarjeta" numero="06" titulo={tx("invitacion.rsvp.confirmar")} />
                {rsvpDias > 0 && (
                  <Entra retraso={120}>
                    <p className="tz-kicker">{tx("invitacion.rsvp.quedan")}</p>
                    <div className="tz-marco">
                      <Dibujo nombre="marcoCircular" ancho="58%" left="50%" top="50%" transform="translate(-50%,-50%)" />
                      <p className="tz-cifra">{diasParaConfirmar}</p>
                    </div>
                    <p className="tz-kicker">{tx("invitacion.rsvp.diasParaConfirmar")}</p>
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
            <SectionWrapper id="album-2" delay={150} className="tz-seccion" style={{ padding: 0 }}>
              <div className="tz-seccion">
                <Hoja>
                  <Album photos={allPhotos} hideHeader albumStyle="solapadas" part="second" />
                </Hoja>
              </div>
            </SectionWrapper>
          )}

          {/* ── Quiz ───────────────────────────────────────────────── */}
          {triviaHabilitada && triviaPreguntas.length > 0 && (
            <SectionWrapper id="quiz" delay={300} className="tz-seccion" style={{ padding: 0 }}>
              <div className="tz-seccion">
                <Hoja>
                  <Entra>
                    <p className="tz-kicker">{String(invitation.triviaTitulo || tx("invitacion.quiz.cuantoSabes"))}</p>
                    <QuizPrensa preguntas={triviaPreguntas} invitationId={String(invitation.id ?? "")} guestToken={guest?.uniqueToken} guestName={guest?.name} />
                  </Entra>
                </Hoja>
              </div>
            </SectionWrapper>
          )}

          {/* ── 07 Regalos ─────────────────────────────────────────── */}
          {showGiftSection && (
            <SectionWrapper id="banco" delay={200} className="tz-seccion" style={{ padding: 0 }}>
              <div className="tz-seccion" data-sec="07">
                <Hoja>
                  <Cabecera icono="sobre" numero="07" titulo={tx("invitacion.regalos.banco")} />
                  <Entra retraso={120}>
                    {Boolean(invitation.regaloMensaje) && <p className="tz-cuerpo">{String(invitation.regaloMensaje)}</p>}
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
            <section className="tz-seccion" data-sec="08" id="songs-hoja">
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
          <section className="tz-seccion" data-sec="09" id="cierre">
            <Hoja>
              <Dibujo nombre="garabatoCorto" ancho="40%" left="-15%" bottom="4%" />
              <Entra>
                <Dibujo nombre="corazonGrande" ancho="12%" position="relative" margin="0 auto 12px" />
                <p className="tz-num">09.</p>
                <div className="tz-monograma">
                  <svg viewBox="0 0 88 110" width="78" height="98" aria-hidden="true">
                    <ellipse cx="44" cy="55" rx="40" ry="52" fill="none" stroke="currentColor" strokeWidth=".75" />
                    <ellipse cx="44" cy="55" rx="34" ry="46" fill="none" stroke="currentColor" strokeWidth=".4" />
                  </svg>
                  <span>{monograma}</span>
                </div>
                <p className="tz-script">{tx("invitacion.frase.graciasPorEstar")}</p>
              </Entra>
            </Hoja>
          </section>

          {musicaHabilitada && musicAudioElement}
          <LogoFooterCredit bgColor="transparent" textColor={TINTA_SUAVE} />
          <div style={{ height: 92 }} className="hide-desktop" aria-hidden="true" />
        </div>
      </div>

      {isCoverOpen && (
        <div className={`tz-pastilla ${pastillaOculta ? "tz-pastilla--oculta" : ""}`}>
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
const CSS_TRAZO = `
  .tz-raiz { position: relative; color: ${TINTA}; font-family: ${SANS}; }
  .tz-fondo { position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background-color: ${PAPEL}; background-image: ${GRANO_PAGINA}; background-blend-mode: multiply; }
  .tz-escenario { position: relative; z-index: 1; background: transparent !important; }
  .tz-escenario.desktop-stage { background: transparent; }
  .tz-derecha { background: transparent; }
  .desktop-stage.tz-escenario .d-left.tz-izquierda { background: transparent; padding: 26px 22px; align-items: center; justify-content: center; }
  .tz-hoja-grande { width: 94%; aspect-ratio: 301/432; padding: 34px 30px 26px; display: flex; flex-direction: column; align-items: center; text-align: center; }
  .tz-hoja-grande .tz-nombres { font-size: 38px; }
  .tz-nav-escritorio { margin-top: auto; width: 100%; }
  .tz-nav-lista { display: flex; flex-direction: column; align-items: center; gap: 2px; margin-top: 14px; }
  .tz-nav-lista a { background: none; border: none; padding: 5px 2px; font-family: ${SANS}; font-weight: 400; font-size: 10px; letter-spacing: .39em; text-transform: uppercase; color: ${TINTA_SUAVE}; text-decoration: none; }
  .tz-nav-lista a:hover { color: ${TINTA}; }

  /* La hoja */
  .tz-hoja { position: relative; padding: 32px 26px 28px; text-align: center; overflow: visible;
    background-color: ${PAPEL}; background-image: ${GRANO_HOJA}; background-blend-mode: multiply;
    box-shadow: -1.41px 1.41px 4px rgba(${SH},.40);
    clip-path: polygon(0 0, calc(100% - 26px) 0, 100% 26px, 100% 100%, 26px 100%, 0 calc(100% - 26px)); }
  .desktop-stage .tz-hoja { padding: 44px 54px 38px; }
  .tz-hoja::before, .tz-hoja::after { content: ""; position: absolute; width: 26px; height: 26px; pointer-events: none; }
  .tz-hoja::before { top: 0; right: 0; background: linear-gradient(225deg, rgba(${SH},.34), transparent); }
  .tz-hoja::after { bottom: 0; left: 0; background: linear-gradient(45deg, rgba(${SH},.34), transparent); }
  .tz-filete { position: absolute; inset: 14px; border: 0.5px solid rgba(${SH},.34); border-radius: 6px; pointer-events: none; }
  .tz-hoja--portada { aspect-ratio: 301/432; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .tz-seccion { position: relative; padding: 11px 3%; }
  .tz-portada { padding-top: 14px; }
  .tz-portada--sube { animation: tzPortadaSube .9s cubic-bezier(.22,.61,.36,1) both; }

  /* Tipos */
  .tz-kicker { font-family: ${SANS}; font-weight: 400; font-size: 10px; letter-spacing: .39em; text-transform: uppercase; color: ${TINTA_SUAVE}; margin: 0 0 10px; }
  .tz-dato { font-family: ${SANS}; font-weight: 400; font-size: 13px; letter-spacing: .16em; text-transform: uppercase; color: ${TINTA}; margin: 0 0 8px; }
  .tz-cuerpo { font-family: ${SANS}; font-weight: 300; font-size: 15px; line-height: 1.75; color: ${TINTA}; margin: 0 auto 16px; max-width: 46ch; }
  .tz-num { font-family: ${SERIF}; font-weight: 300; font-size: 26px; line-height: 1; color: ${TINTA}; margin: 0 0 8px; }
  .tz-titulo { font-family: ${SCRIPT}; font-weight: 400; font-size: 34px; line-height: 1.25; color: ${TINTA}; margin: 0 0 22px; display: inline-block; transform: rotate(-2.5deg); }
  .tz-script { font-family: ${SCRIPT}; font-weight: 400; font-size: 34px; line-height: 1.3; color: ${TINTA}; margin: 0 0 8px; display: inline-block; transform: rotate(-2.5deg); }
  .tz-nombres { font-family: ${SERIF}; font-weight: 300; font-size: 38px; line-height: 1.12; margin: 0 0 14px; color: ${matiz(PAPEL, -4)};
    text-shadow: var(--tz-rel); display: flex; flex-direction: column; align-items: center; }
  .tz-amp { font-family: ${SCRIPT}; font-weight: 400; font-size: 34px; line-height: 1.2; color: ${TINTA}; text-shadow: none; margin: 2px 0; }
  .tz-cifra { font-family: ${SERIF}; font-weight: 300; font-size: 86px; line-height: .9; color: ${matiz(PAPEL, -4)}; text-shadow: var(--tz-rel); margin: 6px 0 8px; }
  .tz-filete-corto { width: 38px; height: 0.5px; background: rgba(${SH},.6); margin: 14px auto 16px; }
  .tz-hairline { height: 0.5px; background: rgba(${SH},.3); margin: 22px 0; }
  .tz-lugar { font-family: ${SERIF}; font-weight: 400; font-style: italic; font-size: 26px; line-height: 1.2; color: ${TINTA}; margin: 0 0 8px; }
  .tz-link { display: inline-flex; align-items: center; min-height: 44px; font-family: ${SANS}; font-weight: 400; font-size: 11px; letter-spacing: .24em; text-transform: uppercase; color: ${TINTA}; border-bottom: 0.5px solid rgba(${SH},.7); text-decoration: none; }
  .tz-btn-solido { display: inline-flex; align-items: center; justify-content: center; min-height: 48px; padding: 0 26px; background: ${TINTA}; color: ${PAPEL}; border: none; font-family: ${SANS}; font-weight: 400; font-size: 11.5px; letter-spacing: .24em; text-transform: uppercase; cursor: pointer; text-decoration: none; }
  .tz-btn-fantasma { display: inline-flex; align-items: center; justify-content: center; min-height: 48px; padding: 0 22px; background: transparent; color: ${TINTA}; border: 0.5px solid rgba(${SH},.5); font-family: ${SANS}; font-weight: 400; font-size: 11px; letter-spacing: .24em; text-transform: uppercase; cursor: pointer; }
  .tz-frase-seccion { position: relative; padding: 48px 8%; text-align: center; background: transparent; }
  .desktop-stage .tz-frase-seccion { padding: 64px 8%; }
  .tz-frase { font-family: ${SERIF}; font-weight: 300; font-style: italic; font-size: 28px; line-height: 1.35; color: ${TINTA}; margin: 0 auto 6px; max-width: 26ch; }
  .desktop-stage .tz-frase { font-size: 34px; }

  /* Entrada de sección */
  .tz-entra { opacity: 0; transform: perspective(800px) rotateY(6deg) translateY(10px); transform-origin: left center;
    transition: opacity 1.2s cubic-bezier(.22,.61,.36,1), transform .35s cubic-bezier(.22,.61,.36,1); }
  .tz-entra--visto { opacity: 1; transform: none; }

  /* Cronograma */
  .tz-cronograma { position: relative; text-align: left; max-width: 380px; margin: 0 auto; }
  .tz-cronograma-eje { position: absolute; left: 74px; top: 10px; bottom: 10px; width: 0.5px; background: rgba(${SH},.45); }
  .tz-hito { display: flex; align-items: center; gap: 12px; padding: 11px 0; }
  .tz-hito-hora { font-family: ${SANS}; font-weight: 400; font-size: 13px; letter-spacing: .16em; color: ${TINTA_SUAVE}; width: 62px; text-align: right; flex-shrink: 0; }
  .tz-hito-punto { width: 3px; height: 3px; border-radius: 50%; background: ${TINTA}; flex-shrink: 0; }
  .tz-hito-titulo { font-family: ${SERIF}; font-weight: 400; font-style: italic; font-size: 20px; color: ${TINTA}; }

  /* Mapa */
  .tz-mapa { height: 170px; display: flex; align-items: center; justify-content: center; overflow: hidden;
    background-color: ${PAPEL2}; background-image: repeating-linear-gradient(0deg, rgba(${SH},.12) 0 0.5px, transparent 0.5px 26px), repeating-linear-gradient(90deg, rgba(${SH},.12) 0 0.5px, transparent 0.5px 26px);
    border: 0.5px solid rgba(${SH},.34); margin-bottom: 18px; }
  .desktop-stage .tz-mapa { height: 240px; }

  /* Banco */
  .tz-banco-fila { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 9px 0; border-bottom: 0.5px solid rgba(${SH},.22); text-align: left; }
  .tz-banco-clave { display: block; font-family: ${SANS}; font-weight: 400; font-size: 10px; letter-spacing: .39em; text-transform: uppercase; color: ${TINTA_SUAVE}; margin-bottom: 2px; }
  .tz-banco-valor { display: block; font-family: ${SANS}; font-weight: 300; font-size: 15px; color: ${TINTA}; overflow-wrap: anywhere; }
  .tz-hoja #banco .t-kicker, .tz-hoja h4 { font-family: ${SANS} !important; font-weight: 400 !important; font-size: 10px !important; letter-spacing: .39em !important; text-transform: uppercase !important; color: ${TINTA_SUAVE} !important; }

  /* Quiz */
  .tz-quiz-opcion { display: block; width: 100%; max-width: 420px; margin: 0 auto 8px; min-height: 48px; padding: 12px 16px; cursor: pointer; text-align: left;
    font-family: ${SANS}; font-weight: 300; font-size: 15px; color: ${TINTA}; background: transparent; border: 0.5px solid rgba(${SH},.34); transition: background .2s ease, color .2s ease; }
  .tz-quiz-opcion[data-elegida] { background: ${TINTA}; color: ${PAPEL}; }
  .tz-quiz-opcion:disabled { cursor: default; }

  /* El marco dibujado alrededor de la cifra: la cifra va encima (z-index 1)
     porque el marco es un dibujo suelto con z-index 0. */
  .tz-marco { position: relative; width: 200px; height: 150px; margin: 0 auto; display: flex; align-items: center; justify-content: center; }
  .tz-marco .tz-cifra { position: relative; z-index: 1; margin: 0; }

  /* Monograma */
  .tz-monograma { position: relative; width: 78px; height: 98px; display: flex; align-items: center; justify-content: center; margin: 6px auto 18px; }
  .tz-monograma svg { position: absolute; inset: 0; color: rgba(${SH},.7); }
  .tz-monograma span { position: relative; font-family: ${SERIF}; font-weight: 300; font-size: 22px; letter-spacing: .18em; color: ${TINTA}; }

  /* Splash */
  .tz-splash { position: fixed; inset: 0; z-index: 99999; display: flex; align-items: center; justify-content: center; padding: 16px 3%;
    background-color: ${PAPEL}; background-image: ${GRANO_PAGINA}; background-blend-mode: multiply; }
  .tz-splash--sale { animation: tzSplashSale .9s ease both; }
  .tz-splash-hoja { position: relative; width: 100%; max-width: 340px; aspect-ratio: 301/432; padding: 40px 28px 34px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .tz-splash-nombre { font-family: ${SCRIPT}; font-weight: 400; font-size: 56px; line-height: 1.06; color: ${TINTA}; margin: 2px 0 4px; }
  @keyframes tzSplashSale { from { opacity: 1; } to { opacity: 0; } }
  @keyframes tzPortadaSube { from { transform: translateY(24px); } to { transform: translateY(0); } }
  @keyframes tzPrensado { from { transform: scale(.96); opacity: 0; } to { transform: scale(1); opacity: 1; } }

  /* Pase (burbuja arriba) */
  .tz-pase-burbuja { position: fixed; top: 12px; left: 50%; transform: translateX(-50%); z-index: 99999; cursor: pointer; padding: 8px 14px;
    background-color: ${PAPEL}; background-image: ${GRANO_HOJA}; background-blend-mode: multiply; border: 0.5px solid rgba(${SH},.34); box-shadow: -1.41px 1.41px 8px rgba(${SH},.34); transition: all .5s ease; }
  .tz-pase-burbuja--abierta { width: calc(100% - 32px); max-width: 360px; padding: 12px 16px; }

  /* Pastilla inferior */
  .tz-pastilla { transition: opacity .35s ease, transform .35s cubic-bezier(.22,.61,.36,1); }
  .tz-pastilla--oculta { opacity: 0; transform: translateY(26px); transition: opacity .3s ease, transform .3s cubic-bezier(.22,.61,.36,1); pointer-events: none; }
  .tz-raiz .bottom-nav, .desktop-stage.tz-escenario .bottom-nav { border-radius: 0 !important; background: ${PAPEL} !important; border: 0.5px solid rgba(${SH},.28) !important;
    box-shadow: -1.41px 1.41px 8px rgba(${SH},.34) !important; backdrop-filter: none !important; padding: 5px !important; gap: 2px !important; }
  .tz-raiz .bottom-nav a { color: ${TINTA} !important; opacity: .55 !important; min-height: 48px; }
  .tz-raiz .bottom-nav a[aria-current="true"] { opacity: 1 !important; background: ${PAPEL2}; }

  /* Componentes compartidos vestidos con el registro */
  .tz-raiz .tpl h2, .tz-raiz .tpl h3, .tz-raiz .tpl h4 { font-family: ${SERIF}; color: ${TINTA}; }
  /* La script tiene que ganarle a la regla de arriba y a la tipografía que
     el anfitrión elige en el wizard (--font-title): los títulos de sección,
     el &, la frase de cierre y el nombre del splash van SIEMPRE en Final
     Parade, es la firma de la colección. */
  .tz-raiz .tz-titulo, .tz-raiz .tpl h3.tz-titulo, .tz-raiz .tz-script, .tz-raiz .tz-amp, .tz-raiz .tz-splash-nombre, .tz-raiz .tz-sinonimo { font-family: ${SCRIPT} !important; font-weight: 400 !important; font-style: normal !important; }
  .tz-raiz .tpl .t-kicker, .tz-raiz .tpl p.kicker { font-family: ${SANS} !important; color: ${TINTA_SUAVE} !important; font-size: 10px !important; font-weight: 400 !important; letter-spacing: .39em !important; text-transform: uppercase !important; display: block; }
  .tz-raiz .tpl .t-kicker::before, .tz-raiz .tpl p.kicker::before { display: none !important; }
  .tz-raiz .tpl div:not(#countdown div), .tz-raiz .tpl section, .tz-raiz .tpl button, .tz-raiz .tpl input, .tz-raiz .tpl iframe, .tz-raiz .tpl .t-btn, .tz-raiz .tpl .album-btn { border-radius: 0 !important; }
  .tz-raiz .tpl .album-item { border-radius: 0 !important; box-shadow: -1.41px 1.41px 4px rgba(${SH},.40); border: 10px solid ${PAPEL}; border-bottom-width: 26px; background-color: ${PAPEL}; }
  .tz-raiz .tpl .album-btn { color: ${TINTA} !important; border: 0.5px solid rgba(${SH},.5) !important; background: transparent !important; }
  .tz-raiz .tpl .cascade-frame { box-shadow: -1.41px 1.41px 4px rgba(${SH},.40) !important; background: ${PAPEL} !important; }

  /* La cuenta regresiva de la colección: cifras prensadas y filetes, nada más. */
  .tz-cuenta { display: grid; grid-template-columns: repeat(4, 1fr); align-items: end; max-width: 400px; margin: 2px auto 4px; }
  .tz-cuenta-celda { display: flex; flex-direction: column; align-items: center; gap: 9px; padding: 2px 2px 0; }
  .tz-cuenta-celda + .tz-cuenta-celda { border-left: 0.5px solid rgba(${SH},.30); }
  .tz-cuenta-num { font-family: ${SERIF}; font-weight: 300; font-size: clamp(32px, 10vw, 46px); line-height: .92; color: ${matiz(PAPEL, -4)}; text-shadow: var(--tz-rel); font-variant-numeric: tabular-nums; }
  .tz-cuenta-etq { font-family: ${SANS}; font-weight: 400; font-size: 8.5px; letter-spacing: .16em; text-transform: uppercase; color: ${TINTA_SUAVE}; white-space: nowrap; }
  .desktop-stage .tz-cuenta-num { font-size: 46px; }
  .tz-cuenta-aviso { text-align: center; }

  /* Sin íconos prestados: los componentes compartidos traen los suyos (una
     nota musical, un tilde, una cama) y al lado del ícono de línea de la
     cabecera quedaban dos dibujos distintos diciendo lo mismo en la misma
     sección. El juego de línea de la colección es el único que se ve. */
  .tz-raiz #songs svg.lucide, .tz-raiz #rsvp svg.lucide, .tz-raiz .ia-icon-box svg.lucide { display: none !important; }
  .tz-raiz .ia-icon-box { display: none !important; }

  .tz-raiz #rsvp.section.dark { background: transparent !important; color: ${TINTA} !important; border: none !important; padding: 0 !important; display: flex; flex-direction: column; align-items: center; }
  .tz-raiz #rsvp.section.dark > p.t-kicker, .tz-raiz #rsvp.section.dark > h2, .tz-raiz #rsvp.section.dark > .d-rsvp-grid { width: 100% !important; max-width: 420px !important; text-align: left !important; }
  .tz-raiz #rsvp.section.dark h2 { display: none !important; }
  .tz-raiz #rsvp.section.dark b, .tz-raiz #rsvp.section.dark strong { color: ${TINTA} !important; }
  .tz-raiz #rsvp.section.dark label { text-transform: uppercase !important; font-size: 10px !important; font-family: ${SANS} !important; letter-spacing: .39em !important; color: ${TINTA_SUAVE} !important; font-weight: 400 !important; }
  .tz-raiz #rsvp.section.dark input { background: ${PAPEL2} !important; color: ${TINTA} !important; border: 0.5px solid rgba(${SH},.34) !important; border-radius: 0 !important; padding: 12px 14px !important; font-family: ${SANS} !important; font-weight: 300 !important; font-size: 15px !important; min-height: 48px; }
  .tz-raiz #rsvp.section.dark input::placeholder { color: ${TINTA_SUAVE} !important; opacity: .8 !important; }
  .tz-raiz #rsvp.section.dark .t-btn { border-radius: 0 !important; min-height: 48px; padding: 0 22px !important; flex: 1 !important; min-width: 130px !important; background: transparent !important; color: ${TINTA} !important; border: 0.5px solid rgba(${SH},.5) !important; font-family: ${SANS} !important; font-weight: 400 !important; text-transform: uppercase !important; letter-spacing: .24em !important; font-size: 11.5px !important; }
  .tz-raiz #rsvp.section.dark .t-btn.solid, .tz-raiz #rsvp.section.dark button[data-rsvp="confirmar"] { background: ${TINTA} !important; color: ${PAPEL} !important; border-color: ${TINTA} !important; }
  .tz-raiz #rsvp.section.dark div:has(> button[data-rsvp="confirmar"]) { flex-direction: row !important; gap: 12px !important; }
  .tz-raiz .tpl .d-rsvp-grid { display: flex !important; flex-direction: column !important; gap: 24px !important; align-items: flex-start !important; }
  .tz-raiz .tpl .d-rsvp-grid > div { width: 100% !important; }
  .tz-raiz #rsvp.section.dark .t-detail { background: transparent !important; border: none !important; border-top: 0.5px solid rgba(${SH},.3) !important; padding: 16px 0 0 !important; text-align: left !important; box-shadow: none !important; width: 100% !important; }
  .tz-raiz #rsvp.section.dark .t-detail h4 { color: ${TINTA_SUAVE} !important; font-family: ${SANS} !important; text-transform: uppercase !important; font-size: 10px !important; letter-spacing: .39em !important; font-weight: 400 !important; margin-bottom: 6px !important; }
  .tz-raiz #rsvp.section.dark .t-detail p { color: ${TINTA} !important; font-size: 14px !important; }
  .tz-raiz #rsvp.section.dark .t-detail p b { font-family: ${SERIF} !important; font-weight: 300 !important; font-size: 26px !important; color: ${TINTA} !important; }
  /* CONFIRMADO en relieve hueco: prensado hacia adentro, creciendo de .96 a 1. */
  .tz-raiz #rsvp.section.dark [class*="confirm"] h3, .tz-raiz #rsvp.section.dark h3 { font-family: ${SERIF} !important; font-weight: 300 !important; font-size: 44px !important; line-height: 1 !important; letter-spacing: .04em !important; color: ${matiz(PAPEL, 3)} !important;
    text-shadow: 0 -1px 0 rgba(255,255,255,.90), 0 1px 1px rgba(${SH},.50), 0 2px 3px rgba(${SH},.12); animation: tzPrensado .5s cubic-bezier(.22,.61,.36,1) both; }

  .tz-raiz #songs.d-sec.dark, .tz-raiz #songs { background: transparent !important; padding: 0 !important; display: flex; flex-direction: column; align-items: center; color: ${TINTA}; }
  .tz-raiz #songs > p.t-kicker, .tz-raiz #songs > form, .tz-raiz #songs > div { width: 100% !important; max-width: 420px !important; text-align: left !important; }
  .tz-raiz #songs h2, .tz-raiz #songs p:not(.t-kicker) { font-family: ${SANS}; color: ${TINTA}; }
  .tz-raiz #songs .mod-input-row { display: flex !important; flex-direction: column !important; gap: 0 !important; width: 100% !important; }
  .tz-raiz #songs input { background: ${PAPEL2} !important; color: ${TINTA} !important; border: 0.5px solid rgba(${SH},.34) !important; border-radius: 0 !important; min-height: 48px; padding: 0 14px !important; font-family: ${SANS} !important; font-weight: 300 !important; font-size: 15px !important; }
  .tz-raiz #songs button[type="submit"], .tz-raiz #songs .t-btn { background: ${TINTA} !important; color: ${PAPEL} !important; border: none !important; border-radius: 0 !important; min-height: 48px; font-family: ${SANS} !important; font-weight: 400 !important; font-size: 11.5px !important; letter-spacing: .24em !important; text-transform: uppercase !important; }
  .tz-raiz #songs .mod-item, .tz-raiz #songs li { background: transparent !important; border: none !important; border-bottom: 0.5px solid rgba(${SH},.22) !important; border-radius: 0 !important; }

  .tz-raiz #info-adicional { background: transparent !important; }
  .tz-raiz #ia-trigger-btn { background: transparent !important; color: ${TINTA} !important; border: 0.5px solid rgba(${SH},.5) !important; border-radius: 0 !important; font-family: ${SANS} !important; letter-spacing: .24em !important; text-transform: uppercase !important; font-size: 11px !important; }

  .tz-raiz .copy-btn { background: transparent !important; color: ${TINTA} !important; border: 0.5px solid rgba(${SH},.5) !important; border-radius: 0 !important; font-family: ${SANS} !important; font-weight: 400 !important; font-size: 10px !important; letter-spacing: .24em !important; text-transform: uppercase !important; }
  .tz-raiz .copy-btn.copied { background: ${TINTA} !important; color: ${PAPEL} !important; }

  /* Post-evento */
  .tz-post { position: relative; z-index: 1; max-width: 640px; margin: 0 auto; padding: 48px 3% 24px; min-height: 100dvh; display: flex; align-items: center; }
  .tz-post-hoja { width: 100%; padding: 44px 30px 38px; }
  .tz-sinonimo { font-family: ${SCRIPT}; font-weight: 400; font-style: normal; color: ${TINTA}; text-shadow: none; }

  @media (prefers-reduced-motion: reduce) {
    .tz-entra { opacity: 1; transform: none; transition: none; }
    .tz-splash--sale, .tz-portada--sube { animation: none; }
    .tz-pastilla, .tz-pastilla--oculta { transition: none; opacity: 1; transform: none; pointer-events: auto; }
  }
`;
