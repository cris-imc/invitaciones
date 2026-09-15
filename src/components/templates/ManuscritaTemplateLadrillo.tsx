"use client";

/**
 * ManuscritaTemplateLadrillo.tsx — Colección Paper · Papelería Viva · Familia 03 "Manuscrita"
 * Variante: Ladrillo (generada, no editar a mano).
 *
 * GENERADO por scripts/derivar-papeleria.js a partir de
 * SobreSelloTemplate.tsx — no editar a mano: la papelería se arregla en
 * Sobre & Sello y se vuelve a derivar; lo propio de esta familia está en
 * scripts/familias/papeleria/manuscrita.json.
 *
 * El casamiento informal: la misma papelería, escrita a mano. Los nombres
 * van en Caveat (la letra manuscrita de la familia), los titulares en Bodoni
 * Moda y el texto en Space Mono, como una nota escrita sobre papel de carta.
 * 
 * El borde del sobre es un pespunte (línea de puntadas), no un filete, y
 * sobre el forro pasa una aguada de acuarela cada siete segundos y medio.
 */

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Bodoni_Moda, Space_Mono, Caveat } from "next/font/google";
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
const mnSerif = Bodoni_Moda({
  subsets: ["latin"],
  preload: false,
  style: ["normal", "italic"],
  weight: ["400", "500"],
  variable: "--mn-serif",
  display: "swap",
});
const mnSans = Space_Mono({
  subsets: ["latin"],
  preload: false,
  weight: ["400", "700"],
  variable: "--mn-sans",
  display: "swap",
});
// La script de esta sub-colección sí es de Google (Papel Prensado usa la
// del repo): Pinyon Script, que es la caligrafía de una tarjeta grabada.
const mnScript = Caveat({
  subsets: ["latin"],
  preload: false,
  weight: ["400"],
  variable: "--mn-script",
  display: "swap",
});

// ─── Paleta ─────────────────────────────────────────────────────────────────
// Lo único que cambia por variante es el par de papeles. El generador
// reemplaza estos dos hex y el nombre del identificador; todo lo demás queda.
const PAPEL = "#F5EDE5";
const PAPEL2 = "#EBDFD2";
const TINTA = "#2E241E";
const TINTA_SUAVE = "#77655A";
/**
 * Los dos acentos de Papelería Viva: el lacre y el dorado. Son lo que
 * cambia por variante (junto con los papeles) y lo que la separa de Papel
 * Prensado, que es monocroma a propósito.
 */
const ACENTO = "#A4573B";
const ACENTO2 = "#84754C";
/** rgb de la sombra: se usa en todos los rgba() del registro. */
const SH = "46,36,30";

// Las tres caras son parte del diseño y no se cambian desde el wizard (a
// diferencia de las Flat de siempre, que leen --font-title/--font-body-custom):
// el relieve está calibrado para Cormorant 300 y la firma de la colección es
// la script. Por eso el paso de Tipografía no aparece para Paper (ver
// wizard-steps-config.ts).
const SERIF = "var(--mn-serif), 'Bodoni Moda', serif";
const SANS = "var(--mn-sans), 'Space Mono', monospace";
const SCRIPT = "var(--mn-script), 'Caveat', cursive";

// ─── Piezas ─────────────────────────────────────────────────────────────────
// Sólo el set compartido de íconos de línea, como máscara CSS con la tinta
// de fondo: son tinta plana, así que nunca van como <img>. Las proporciones
// vienen del INVENTARIO de public/templates.
/**
 * Los cuatro doodles de la familia. Van como <img> y no como máscara: son
 * acuarelas con medios tonos, y pintadas de un color plano se perderían.
 * Las cinco variantes comparten los cuatro archivos.
 */
const DOODLES = "/templates/manuscrita/";

const PIEZAS = "/templates/iconos-linea/";
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

// Papelería Viva no lleva grano ni relieve: el papel es liso y la gracia
// está en el color y en los doodles. Las dos funciones quedan en el
// archivo (vienen del registro compartido) pero no se usan acá.
void grano;
void relieve;

// ─── Datos ──────────────────────────────────────────────────────────────────
function safeJson<T>(val: string | null | undefined, fallback: T): T {
  if (!val) return fallback;
  try { return JSON.parse(val) as T; } catch { return fallback; }
}

interface ManuscritaTemplateLadrilloProps {
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
    <div data-mn-reveal="1" data-mn-retraso={retraso} className={`mn-entra ${className ?? ""}`} style={style}>
      {children}
    </div>
  );
}

/**
 * Un doodle pintado. Va fuera del flujo, sin atajar clics, y con
 * loading lazy salvo los de la portada: son decoración y no tiene sentido
 * que retrasen el primer dibujo.
 */
function Doodle({ pieza, ancho, prioritario = false, className, ...posicion }: { pieza: "cupido" | "olivo" | "copas" | "candelabro"; ancho: number | string; prioritario?: boolean; className?: string } & React.CSSProperties) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`${DOODLES}${pieza}.webp`}
      alt=""
      aria-hidden="true"
      className={className}
      loading={prioritario ? "eager" : "lazy"}
      style={{
        position: "absolute", width: ancho, pointerEvents: "none", zIndex: 0,
        filter: `drop-shadow(0 3px 6px rgba(${SH},.18))`, ...posicion,
      }}
    />
  );
}

/** Una tarjeta de papel: filete fino y la esquina doblada. */
function Hoja({ children, className, style, portada = false }: { children: React.ReactNode; className?: string; style?: React.CSSProperties; portada?: boolean }) {
  return (
    <div className={`mn-hoja ${portada ? "mn-hoja--portada" : ""} ${className ?? ""}`} style={style}>
      <div className="mn-filete" aria-hidden="true" />
      {children}
    </div>
  );
}

/** Cabecera de sección: ícono, número con punto y título en script. */
// Los parámetros de ícono siguen en la firma porque las secciones los pasan
// (el llamado es el mismo que en Papel Prensado); acá no se dibujan.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function Cabecera({ icono, numero, titulo, anchoIcono, topeIcono }: { icono: NombreDeIcono; numero: string; titulo: string; anchoIcono?: string; topeIcono?: number }) {
  return (
    <Entra>
      <div className="mn-cabecera">
        <span className="mn-kicker">{titulo}</span>
        <span className="mn-cabecera-filete" aria-hidden="true" />
        <span className="mn-cabecera-punto" aria-hidden="true" />
      </div>
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
function CuentaManuscrita({ targetDate }: { targetDate: Date }) {
  const tx = useTextos();
  const { time, isEventDay, isPast, hasEnded } = useCountdown(targetDate);
  const enCero = time.dias === 0 && time.hs === 0 && time.min === 0 && time.seg === 0;

  if (isEventDay || (!isPast && enCero)) {
    return (
      <div id="countdown" className="mn-cuenta-aviso">
        <p className="mn-script">{tx("invitacion.cuentaRegresiva.llegoElDia")}</p>
        <p className="mn-cuerpo" style={{ marginBottom: 0 }}>{tx("invitacion.cuentaRegresiva.hoyEsElGranDia")}</p>
      </div>
    );
  }

  if (hasEnded || isPast) {
    return (
      <div id="countdown" className="mn-cuenta-aviso">
        <p className="mn-script">{tx("invitacion.cuentaRegresiva.yaFueUnaNocheIncreible")}</p>
      </div>
    );
  }

  const celdas = [
    { v: String(time.dias), l: tx("invitacion.cuentaRegresiva.dias") },
    { v: pad(time.hs), l: tx("invitacion.cuentaRegresiva.horas") },
    { v: pad(time.min), l: tx("invitacion.cuentaRegresiva.minutos") },
    { v: pad(time.seg), l: tx("invitacion.cuentaRegresiva.segundos") },
  ];

  // Los días van en el centro de un anillo que da una vuelta por minuto:
  // es lo único que se mueve en toda la sección, y se mueve tan despacio
  // que se nota recién si uno se queda mirando. Horas, minutos y segundos
  // van abajo, en tres cajitas con la esquina doblada.
  const [dias, ...resto] = celdas;
  return (
    <div id="countdown" className="mn-cuenta">
      <div className="mn-cuenta-circulo">
        <span className="mn-cuenta-anillo" aria-hidden="true" />
        <span>
          <span className="mn-cuenta-dias">{dias.v}</span>
          <span className="mn-cuenta-etq">{dias.l}</span>
        </span>
      </div>
      <div className="mn-cuenta-grilla">
        {resto.map((c) => (
          <div key={c.l} className="mn-cuenta-caja">
            <span className="mn-cuenta-num">{c.v}</span>
            <span className="mn-cuenta-etq">{c.l}</span>
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
    <div className="mn-banco-fila">
      <div style={{ minWidth: 0, flex: 1 }}>
        <span className="mn-banco-clave">{label}</span>
        <span className="mn-banco-valor">{value}</span>
      </div>
      <button className={`copy-btn mn-btn-fantasma ${copied ? "copied" : ""}`} type="button" onClick={handle} style={{ minHeight: 40, padding: "0 14px" }}>
        {copied ? "✓ " + tx("invitacion.regalos.copiado") : tx("invitacion.regalos.copiar")}
      </button>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="mn-banco-fila">
      <div style={{ minWidth: 0, flex: 1 }}>
        <span className="mn-banco-clave">{label}</span>
        <span className="mn-banco-valor">{value}</span>
      </div>
    </div>
  );
}

/**
 * El quiz, con la misma lógica que el de Moderno (mismo /api/quiz, mismo
 * guardado local) y las opciones del registro: botones de ancho completo,
 * filete de 0,5 px, el elegido se rellena de tinta.
 */
function QuizManuscrita({ preguntas, invitationId, guestToken, guestName }: { preguntas: QuizQuestion[]; invitationId?: string; guestToken?: string; guestName?: string }) {
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
        <p className="mn-lugar">{tx("invitacion.quiz.juegoCompletado")}</p>
        <p className="mn-dato">{score} / {preguntas.length}</p>
        {isSaving ? (
          <p className="mn-cuerpo" style={{ color: TINTA_SUAVE }}>{tx("invitacion.quiz.guardandoResultados")}</p>
        ) : (
          stats && stats.count > 0 && (
            <p className="mn-cuerpo" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: TINTA_SUAVE }}>
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
      <p className="mn-lugar">{formatQuestion(q.pregunta)}</p>
      {q.opciones.map((opt, oi) => {
        const chosen = picks[currentIdx] === oi;
        return (
          <button
            key={oi}
            type="button"
            className="mn-quiz-opcion"
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
export function ManuscritaTemplateLadrillo({ invitation, guest, isPersonalized = false }: ManuscritaTemplateLadrilloProps) {
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
    raiz.style.setProperty("--mn-rel", relieve(0, true));
    let raf = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const alScrollear = (y: number) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setPastillaOculta(false), 370);
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        raiz.style.setProperty("--mn-rel", relieve(y, quietoRef.current));
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
  // que trae cada bloque (data-mn-retraso: 0 / 120 / 240). Se arma cada vez
  // que se abre la portada porque hasta entonces el cuerpo no está montado.
  useEffect(() => {
    if (!isCoverOpen) return;
    const raiz = raizRef.current;
    if (!raiz) return;
    const bloques = Array.from(raiz.querySelectorAll<HTMLElement>("[data-mn-reveal]"));
    if (quietoRef.current || !("IntersectionObserver" in window)) {
      bloques.forEach((b) => b.classList.add("mn-entra--visto"));
      return;
    }
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target as HTMLElement;
        const d = Number(el.dataset.prRetraso || 0);
        el.style.transitionDelay = `${d}ms`;
        el.classList.add("mn-entra--visto");
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
    "--font-cormorant": "var(--mn-cormorant)",
    "--font-inter": "var(--mn-jost)",
    "--font-sans": "var(--mn-jost)",
    // En esta colección --t-acc y --t-acc2 no son un acento: son la tinta y
    // la tinta suave. Lo que cambia por variante es el papel (--t-bg).
    "--t-acc": ACENTO,
    "--t-acc2": ACENTO2,
    "--c-accent": ACENTO,
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
      <div className={`${mnSerif.variable} ${mnSans.variable} ${mnScript.variable} mn-raiz`} style={varsDeTema} data-theme={theme} ref={raizRef}>
        <style>{CSS_MN}</style>
        <div className="mn-fondo" aria-hidden="true" />
        <main className="mn-post">
          <Hoja className="mn-post-hoja">
            <IconoLinea nombre={esXV ? "torta" : "anillos"} ancho="16%" />
            <p className="mn-kicker">{tx("invitacion.frase.unMomento")}</p>
            <h1 className="mn-nombres" style={{ fontSize: 38 }}>
              <AnimatedSynonyms words={[tx("invitacion.frase.inolvidable"), tx("invitacion.frase.unico"), tx("invitacion.frase.eterno"), tx("invitacion.frase.magico")]} className="mn-sinonimo" />
            </h1>
            <FileteConPunto />
            <p className="mn-cuerpo">{tx("invitacion.frase.graciasPorAcompanarnosCorto")}</p>
            <p className="mn-dato">{tx("invitacion.album.disponibleHasta")} {expirationDateStr}</p>
            <div style={{ marginTop: 22 }}>
              {livePhotos.length > 0 ? (
                <AlbumCarousel photos={livePhotos} hideHeader={true} />
              ) : (
                <>
                  <p className="mn-lugar">{tx("invitacion.album.fotografico")}</p>
                  <p className="mn-cuerpo" style={{ color: TINTA_SUAVE }}>{tx("invitacion.album.sinCapturas")}</p>
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
    <div className={`${mnSerif.variable} ${mnSans.variable} ${mnScript.variable} mn-raiz`} style={varsDeTema} ref={raizRef}>
      <style>{CSS_MN}</style>

      {/* ── Splash (celular) ────────────────────────────────────────── */}
      {!isCoverOpen && (
        <div className={`mn-splash ${isClosingCover ? "mn-splash--sale" : ""}`}>
          {portadaFondoAnimado && (
            <div className="acp-mobile-only">
              <AnimatedCoverPhoto
                photoSrc={portadaImagenFondoDesktopRaw as string}
                tintColor1={PAPEL}
                tintColor2={TINTA_SUAVE}
                effect="enfoque"
                scrimColorRgb="245,237,229"
              />
            </div>
          )}
          <Hoja className="mn-splash-hoja">
            <p className="mn-kicker">{saludaAlInvitado ? portadaKicker : kickerDelEvento}</p>
            <p className="mn-splash-nombre">{guestNameDisplay}</p>
            <div className="mn-filete-corto" aria-hidden="true" />
            {/* Los nombres de los novios sólo si arriba no están ya: cuando
                el saludo es para el invitado son el dato que falta ("¿la boda
                de quién?"); cuando el nombre grande ya es el de ellos,
                repetirlos era escribir lo mismo dos veces. */}
            {saludaAlInvitado && <p className="mn-dato">{nombresLinea}</p>}
            <p className="mn-dato" style={{ color: TINTA_SUAVE }}>{fechaCorta}{ciudad ? ` · ${ciudad}` : ""}</p>
            {Boolean(activeDressCode) && <p className="mn-kicker" style={{ marginTop: 6 }}>{tx("invitacion.ubicacion.dressCode")} {activeDressCode}</p>}
            <button type="button" onClick={openInvitation} className="mn-btn-solido" style={{ marginTop: 26 }}>
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
          className={`mn-pase-burbuja ${isTicketMaximized ? "mn-pase-burbuja--abierta" : ""}`}
        >
          {isTicketMaximized ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", gap: 14 }}>
              <div style={{ textAlign: "left" }}>
                <span className="mn-kicker" style={{ margin: 0, fontSize: 8 }}>{tx("invitacion.pase.pase")}</span>
                <span style={{ display: "block", fontFamily: SERIF, fontWeight: 300, fontSize: 18, color: TINTA, lineHeight: 1.1 }}>{guest.name}</span>
                {guest.mesas && guest.mesas.length > 0 && (
                  <span className="mn-kicker" style={{ margin: "4px 0 0", fontSize: 8 }}>{guest.mesas.join(" · ")}</span>
                )}
              </div>
              <div style={{ textAlign: "right", borderLeft: `0.5px solid rgba(${SH},.34)`, paddingLeft: 12 }}>
                <span style={{ display: "block", fontFamily: SERIF, fontWeight: 300, fontSize: 22, color: TINTA, lineHeight: 1 }}>{guest.expectedCount}</span>
                <span className="mn-kicker" style={{ margin: 0, fontSize: 8 }}>{guest.expectedCount === 1 ? tx("invitacion.pase.lugar") : tx("invitacion.pase.lugares")}</span>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <IconoPastilla nombre="tarjeta" />
              <span className="mn-kicker" style={{ margin: 0 }}>{tx("invitacion.pase.pase")}</span>
            </div>
          )}
        </div>,
        document.body
      )}
      {mounted && musicaHabilitada && isCoverOpen && createPortal(
        <MusicToggleButton isPlaying={isMusicPlaying} onToggle={toggleMusic} className="fixed top-3 right-3 z-[99998]" />,
        document.body
      )}

      <div className="desktop-stage mn-escenario" data-theme={theme}>
        <div className="mn-fondo" aria-hidden="true" />

        {/* ── Escritorio: la hoja grande, fija a la izquierda ─────────── */}
        <aside className="d-left hide-mobile mn-izquierda">
          <Hoja portada className="mn-hoja-grande">
            {/* El sobre: forro a rayas, doble filete, ramos en las esquinas y
                el borde rasgado del papel asomando abajo. */}
            <div className="mn-sobre" aria-hidden="true">
              <div className="mn-sobre-forro" />
              <div className="mn-sobre-brillo" />
              <div className="mn-sobre-filete" />
              <div className="mn-sobre-filete mn-sobre-filete--interno" />
              <Doodle pieza="cupido" ancho="30%" left="-4%" top="2%" prioritario />
              <Doodle pieza="olivo" ancho="34%" right="-6%" bottom="10%" transform="scaleX(-1)" opacity={0.9} prioritario />
            </div>
            <p className="mn-kicker">{kickerDelEvento}</p>
            <h1 className="mn-nombres">
              <span>{nombre1}</span>
              {nombre2 && <span className="mn-amp">&amp;</span>}
              {nombre2 && <span>{nombre2}</span>}
            </h1>
            <div className="mn-filete-corto" aria-hidden="true" />
            <p className="mn-dato">{fechaLarga}</p>
            {ciudad && <p className="mn-dato">{ciudad}</p>}
            <div className="mn-nav-escritorio">
              <FileteConPunto ancho={220} />
              <nav className="mn-nav-lista">
                {seccionesNav.map((s) => (
                  <a key={s.id} href={`#${s.id}`}>{s.n}. {s.label}</a>
                ))}
              </nav>
            </div>
          </Hoja>
        </aside>

        <div className="d-right tpl mn-derecha" ref={derechaRef}>
          {/* ── Portada (celular) ───────────────────────────────────── */}
          <section className="hide-desktop mn-seccion mn-portada" data-sec="00">
            <Hoja portada className={isCoverOpen ? "mn-portada--sube" : ""}>
              {/* El sobre: forro a rayas, doble filete, ramos en las esquinas y
                  el borde rasgado del papel asomando abajo. */}
              <div className="mn-sobre" aria-hidden="true">
                <div className="mn-sobre-forro" />
                <div className="mn-sobre-brillo" />
                <div className="mn-sobre-filete" />
                <div className="mn-sobre-filete mn-sobre-filete--interno" />
                <Doodle pieza="cupido" ancho="30%" left="-4%" top="2%" prioritario />
                <Doodle pieza="olivo" ancho="34%" right="-6%" bottom="10%" transform="scaleX(-1)" opacity={0.9} prioritario />
              </div>
              <Entra>
                <p className="mn-kicker">{kickerDelEvento}</p>
              </Entra>
              <Entra retraso={120}>
                <h1 className="mn-nombres">
                  <span>{nombre1}</span>
                  {nombre2 && <span className="mn-amp">&amp;</span>}
                  {nombre2 && <span>{nombre2}</span>}
                </h1>
              </Entra>
              <Entra retraso={240}>
                <div className="mn-filete-corto" aria-hidden="true" />
                <p className="mn-dato">{fechaLarga}</p>
                {ciudad && <p className="mn-dato">{ciudad}</p>}
                <AddToCalendarLink eventName={nombresLinea} targetDate={fechaEvento} location={[lugarNombre, direccion].filter(Boolean).join(", ")} className="mn-link" showIcon={false}>
                  {tx("invitacion.saveTheDate.agregarAlCalendario")}
                </AddToCalendarLink>
              </Entra>
            </Hoja>
          </section>

          {/* ── 01 La cuenta regresiva ─────────────────────────────── */}
          {(invitation.contadorHabilitado ?? true) ? (
            <section className="mn-seccion" data-sec="01" id="countdown-hoja">
              <Hoja>
                <Cabecera icono="reloj" numero="01" titulo={tx("invitacion.cuentaRegresiva.kicker")} />
                <Entra retraso={120}>
                  <p className="mn-kicker">{tx("invitacion.cuentaRegresiva.faltan")}</p>
                  <CuentaManuscrita targetDate={fechaEvento} />
                  <FileteConPunto />
                  <p className="mn-dato">{fechaLarga}{hora ? ` · ${hora} hs` : ""}</p>
                </Entra>
              </Hoja>
            </section>
          ) : null}

          {/* ── 02 La frase (sangra, sin hoja) ─────────────────────── */}
          {frase && (
            <SectionWrapper id="quote" delay={100} className="mn-frase-seccion">
              <Doodle pieza="copas" ancho={92} className="mn-flota" right={16} top={40} />
              <Entra>
                <p className="mn-num">02.</p>
                <p className="mn-frase">{frase}</p>
                <p className="mn-script">{tx("invitacion.frase.unasPalabras")}</p>
              </Entra>
            </SectionWrapper>
          )}

          {/* ── 03 El evento ───────────────────────────────────────── */}
          <SectionWrapper id="details" delay={150} className="mn-seccion" style={{ padding: 0 }}>
            <div className="mn-seccion" data-sec="03">
              <Hoja>
                <Cabecera icono="iglesia" numero="03" titulo={tx("invitacion.ubicacion.cuandoYDonde")} />
                <Entra retraso={120}>
                  {Boolean(invitation.ceremoniaHabilitada) && (
                    <div>
                      <p className="mn-kicker">{String(invitation.ceremoniaTitulo || tx("invitacion.ubicacion.ceremoniaCivil"))}</p>
                      {Boolean(invitation.ceremoniaNombre) && <p className="mn-lugar">{String(invitation.ceremoniaNombre)}</p>}
                      <p className="mn-dato">
                        {Boolean(invitation.ceremoniaHora) && `${String(invitation.ceremoniaHora)} hs`}
                        {Boolean(invitation.ceremoniaHora) && Boolean(invitation.ceremoniaDireccion) && " · "}
                        {Boolean(invitation.ceremoniaDireccion) && String(invitation.ceremoniaDireccion)}
                      </p>
                      {Boolean(invitation.ceremoniaMapUrl) && (
                        <a href={String(invitation.ceremoniaMapUrl)} target="_blank" rel="noopener noreferrer" className="mn-link">{tx("invitacion.ubicacion.comoLlegar")}</a>
                      )}
                      <div className="mn-hairline" aria-hidden="true" />
                    </div>
                  )}
                  {(lugarNombre || direccion) && (
                    <div>
                      <p className="mn-kicker">{tx("invitacion.ubicacion.fiestaSalon")}</p>
                      {lugarNombre && <p className="mn-lugar">{lugarNombre}</p>}
                      <p className="mn-dato">
                        {hora && `${hora} hs`}
                        {hora && direccion && " · "}
                        {direccion}
                      </p>
                      {mapUrl && <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="mn-link">{tx("invitacion.ubicacion.comoLlegar")}</a>}
                    </div>
                  )}
                </Entra>
                {(cronograma.length > 0 || activeDressCode) && (
                  <Entra retraso={240}>
                    {cronograma.length > 0 && (
                      <>
                        <div className="mn-hairline" aria-hidden="true" />
                        <p className="mn-kicker">Cronograma</p>
                        <div className="mn-cronograma" id="schedule">
                          <span className="mn-cronograma-eje" aria-hidden="true" />
                          {cronograma.map((item, i) => (
                            <Entra key={i} retraso={i * 120} className="mn-hito">
                              <span className="mn-hito-hora">{item.time ?? ""}</span>
                              <span className="mn-hito-punto" aria-hidden="true" />
                              <span className="mn-hito-titulo">{item.title}</span>
                            </Entra>
                          ))}
                        </div>
                      </>
                    )}
                    {Boolean(activeDressCode) && (
                      <>
                        <div className="mn-hairline" aria-hidden="true" />
                        <p className="mn-kicker">{tx("invitacion.ubicacion.dressCode")}</p>
                        <p className="mn-cuerpo">{activeDressCode}</p>
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
            <SectionWrapper id="album" delay={200} className="mn-seccion" style={{ padding: 0 }}>
              <div className="mn-seccion" data-sec="04">
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
            <section className="mn-seccion" data-sec="05" id="location">
              <Hoja>
                <Cabecera icono="auto" numero="05" titulo={tx("invitacion.ubicacion.tituloMapa", { lugar: lugarNombre }).replace(/^Mapa de\s*/i, "Mapa")} anchoIcono="22%" />
                <Entra retraso={120}>
                  <div className="mn-mapa">
                    {embedMapUrl ? (
                      <iframe src={embedMapUrl} width="100%" height="100%" style={{ border: 0, display: "block" }} loading="lazy" title={tx("invitacion.ubicacion.tituloMapa", { lugar: lugarNombre })} referrerPolicy="no-referrer-when-downgrade" />
                    ) : (
                      <span className="mn-kicker" style={{ margin: 0 }}>{tx("invitacion.ubicacion.mapaNoDisponible")}</span>
                    )}
                  </div>
                  <p className="mn-dato">{[direccion, ciudad].filter(Boolean).join(" · ")}</p>
                  <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="mn-btn-solido">{tx("invitacion.ubicacion.verMapaFiesta")}</a>
                </Entra>
              </Hoja>
            </section>
          )}

          {/* ── 06 Tu confirmación ─────────────────────────────────── */}
          {rsvpEnabled && (
            <section className="mn-seccion" data-sec="06" id="rsvp-hoja">
              <Hoja>
                <Cabecera icono="tarjeta" numero="06" titulo={tx("invitacion.rsvp.confirmar")} />
                {rsvpDias > 0 && (
                  <Entra retraso={120}>
                    <p className="mn-kicker">{tx("invitacion.rsvp.quedan")}</p>
                    <p className="mn-cifra">{diasParaConfirmar}</p>
                    <p className="mn-kicker">{tx("invitacion.rsvp.diasParaConfirmar")}</p>
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
            <SectionWrapper id="album-2" delay={150} className="mn-seccion" style={{ padding: 0 }}>
              <div className="mn-seccion">
                <Hoja>
                  <Album photos={allPhotos} hideHeader albumStyle="solapadas" part="second" />
                </Hoja>
              </div>
            </SectionWrapper>
          )}

          {/* ── Quiz ───────────────────────────────────────────────── */}
          {triviaHabilitada && triviaPreguntas.length > 0 && (
            <SectionWrapper id="quiz" delay={300} className="mn-seccion" style={{ padding: 0 }}>
              <div className="mn-seccion">
                <Hoja>
                  <Entra>
                    <p className="mn-kicker">{String(invitation.triviaTitulo || tx("invitacion.quiz.cuantoSabes"))}</p>
                    <QuizManuscrita preguntas={triviaPreguntas} invitationId={String(invitation.id ?? "")} guestToken={guest?.uniqueToken} guestName={guest?.name} />
                  </Entra>
                </Hoja>
              </div>
            </SectionWrapper>
          )}

          {/* ── 07 Regalos ─────────────────────────────────────────── */}
          {showGiftSection && (
            <SectionWrapper id="banco" delay={200} className="mn-seccion" style={{ padding: 0 }}>
              <div className="mn-seccion" data-sec="07">
                <Hoja>
                  <Cabecera icono="sobre" numero="07" titulo={tx("invitacion.regalos.banco")} />
                  <Entra retraso={120}>
                    {Boolean(invitation.regaloMensaje) && <p className="mn-cuerpo">{String(invitation.regaloMensaje)}</p>}
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
            <section className="mn-seccion" data-sec="08" id="songs-hoja">
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
          <section className="mn-seccion" data-sec="09" id="cierre">
            <Hoja>
              <Doodle pieza="candelabro" ancho={84} left="50%" top={-26} transform="translateX(-50%)" />
              <Entra>
                <p className="mn-num">09.</p>
                <div className="mn-monograma">
                  <svg viewBox="0 0 88 110" width="78" height="98" aria-hidden="true">
                    <ellipse cx="44" cy="55" rx="40" ry="52" fill="none" stroke="currentColor" strokeWidth=".75" />
                    <ellipse cx="44" cy="55" rx="34" ry="46" fill="none" stroke="currentColor" strokeWidth=".4" />
                  </svg>
                  <span>{monograma}</span>
                </div>
                <p className="mn-script">{tx("invitacion.frase.graciasPorEstar")}</p>
              </Entra>
            </Hoja>
          </section>

          {musicaHabilitada && musicAudioElement}
          <LogoFooterCredit bgColor="transparent" textColor={TINTA_SUAVE} />
          <div style={{ height: 92 }} className="hide-desktop" aria-hidden="true" />
        </div>
      </div>

      {isCoverOpen && (
        <div className={`mn-pastilla ${pastillaOculta ? "mn-pastilla--oculta" : ""}`}>
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
// ─── El registro de Papelería Viva, en CSS ──────────────────────────────────
// Lo escribe scripts/derivar-sobre-sello.js dentro de la plantilla. Vive
// aparte porque es la identidad entera de la sub-colección y así se lee de
// corrido, sin el ruido del script que lo inserta.
const CSS_MN = `
  .mn-raiz { position: relative; color: ${TINTA}; font-family: ${SANS}; background: ${PAPEL}; }
  .mn-fondo { position: fixed; inset: 0; z-index: 0; pointer-events: none; background-color: ${PAPEL}; }
  .mn-escenario { position: relative; z-index: 1; background: transparent !important; }
  .mn-escenario.desktop-stage { background: transparent; }
  .mn-derecha { background: transparent; }
  .desktop-stage.mn-escenario .d-left.mn-izquierda { background: transparent; padding: 26px 22px; align-items: center; justify-content: center; }
  .mn-hoja-grande { width: 94%; aspect-ratio: 301/432; padding: 0; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; text-align: center; overflow: hidden; }
  .mn-hoja-grande .mn-nombres { font-size: 44px; }
  .mn-nav-escritorio { margin-top: 18px; width: 100%; padding-bottom: 22px; }
  .mn-nav-lista { display: flex; flex-direction: column; align-items: center; gap: 2px; margin-top: 12px; }
  .mn-nav-lista a { background: none; border: none; padding: 5px 2px; font-family: ${SANS}; font-weight: 400; font-size: 10px; letter-spacing: .3em; text-transform: uppercase; color: ${TINTA_SUAVE}; text-decoration: none; }
  .mn-nav-lista a:hover { color: ${ACENTO}; }

  /* La tarjeta: papel, un filete fino y la esquina doblada. Sin troquel ni
     relieve -- eso es de la otra sub-colección. */
  .mn-hoja { position: relative; padding: 26px 22px 24px; text-align: center; background: ${PAPEL};
    border: 1px solid rgba(0,0,0,.08); overflow: hidden; }
  .desktop-stage .mn-hoja { padding: 34px 40px 30px; }
  .mn-hoja::after { content: ""; position: absolute; right: 0; top: 0; width: 16px; height: 16px;
    background: linear-gradient(225deg, ${PAPEL2} 50%, rgba(0,0,0,.10) 50%); pointer-events: none; }
  .mn-filete { display: none; }
  /* La portada del celular no es una hoja con proporción de tarjeta: es un
     sobre que llena la pantalla, con el papel asomando abajo. Con la
     proporción 301:432 de Papel Prensado el sobre quedaba de 72 px y los
     nombres se salían por el borde. */
  .mn-hoja--portada { aspect-ratio: auto; min-height: min(86vh, 806px); display: flex; flex-direction: column;
    align-items: center; justify-content: flex-end; padding: 0; border: none; }
  .mn-hoja--portada::after { display: none; }
  .mn-seccion { position: relative; padding: 14px 3%; }
  .mn-seccion:nth-of-type(even) { background: ${PAPEL2}; }
  .mn-portada { padding: 0; }
  .mn-portada--sube { animation: mnPortadaSube .9s cubic-bezier(.22,.61,.36,1) both; }

  /* El sobre de la portada. */
  /* El papel que asoma abajo ocupa el 24 % de la portada (196 de 806 px en el
     mockup). Va en porcentaje y no en píxeles porque la misma portada se
     dibuja a 806 px en el celular y a la altura de la tarjeta en escritorio. */
  .mn-sobre { position: absolute; left: 0; right: 0; top: 0; bottom: 24%; overflow: hidden; pointer-events: none; }
  .mn-sobre-forro { position: absolute; inset: 0;
    background: repeating-linear-gradient(135deg, ${matiz(PAPEL2, -8)} 0 7px, ${matiz(PAPEL2, -14)} 7px 14px); }
  .mn-sobre-brillo { position: absolute; top: 0; bottom: 0; width: 130px; left: -130px;
    background: linear-gradient(90deg, transparent, rgba(255,244,228,.6), transparent); animation: mnBrillo 9s ease-in-out infinite; }
  .mn-sobre-filete { position: absolute; left: 18px; right: 18px; top: 18px; bottom: 18px; border: 1px solid rgba(244,235,226,.8); }
  .mn-sobre-filete--interno { left: 25px; right: 25px; top: 25px; bottom: 25px; border-color: rgba(244,235,226,.4); }
  /* Lo que va sobre el papel que asoma abajo del sobre: el saludo, los
     nombres y la fecha. Son bloques hermanos del sobre, así que cada uno se
     apoya en el papel y se pone por encima del forro. */
  .mn-hoja--portada > .mn-entra { position: relative; z-index: 1; align-self: stretch; box-sizing: border-box; background: ${PAPEL}; padding: 0 22px; }
  .mn-hoja--portada > .mn-entra:first-of-type { padding-top: 24px; }
  .mn-hoja--portada > .mn-entra:last-of-type { padding-bottom: 26px; }

  /* La cabecera de cada sección: el nombre, un filete que llega al borde y
     un punto dorado que lo cierra. */
  .mn-cabecera { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; }
  .mn-cabecera .mn-kicker { margin: 0; flex-shrink: 0; }
  .mn-cabecera-filete { flex: 1; height: 1px; background: ${ACENTO2}; opacity: .5; }
  .mn-cabecera-punto { width: 4px; height: 4px; border-radius: 50%; background: ${ACENTO2}; flex-shrink: 0; }

  /* Tipos */
  .mn-kicker { font-family: ${SANS}; font-weight: 400; font-size: 10px; letter-spacing: .28em; text-transform: uppercase; color: ${ACENTO}; margin: 0 0 10px; }
  .mn-dato { font-family: ${SANS}; font-weight: 400; font-size: 11px; letter-spacing: .3em; text-transform: uppercase; color: ${TINTA_SUAVE}; margin: 0 0 8px; }
  .mn-cuerpo { font-family: ${SANS}; font-weight: 300; font-size: 14px; line-height: 1.7; color: ${TINTA_SUAVE}; margin: 0 auto 16px; max-width: 46ch; }
  .mn-num { display: none; }
  .mn-titulo { font-family: ${SERIF}; font-weight: 300; font-size: 30px; line-height: 1.2; color: ${TINTA}; margin: 0 0 18px; letter-spacing: .04em; }
  .mn-script { font-family: ${SCRIPT}; font-weight: 400; font-size: 40px; line-height: 1.2; color: ${ACENTO}; margin: 0 0 8px; display: inline-block; }
  .mn-nombres { font-family: ${SERIF}; font-weight: 300; font-size: 42px; line-height: 1; letter-spacing: .07em; color: ${TINTA}; margin: 0;
    display: flex; flex-direction: column; align-items: center; text-transform: uppercase; }
  .mn-amp { font-family: ${SCRIPT}; font-weight: 400; font-size: 36px; line-height: .62; color: ${ACENTO}; text-transform: none; margin: 2px 0; }
  .mn-cifra { font-family: ${SERIF}; font-weight: 300; font-size: 62px; line-height: 1; color: ${TINTA}; margin: 4px 0 6px; }
  .mn-filete-corto { display: flex; align-items: center; justify-content: center; gap: 12px; margin: 14px auto 16px; }
  .mn-filete-corto::before, .mn-filete-corto::after { content: ""; width: 46px; height: 1px; background: ${ACENTO2}; }
  .mn-hairline { height: 1px; background: rgba(0,0,0,.08); margin: 22px 0; }
  .mn-lugar { font-family: ${SERIF}; font-weight: 400; font-size: 26px; line-height: 1.2; color: ${TINTA}; margin: 0 0 8px; }
  .mn-link { display: inline-flex; align-items: center; min-height: 44px; font-family: ${SANS}; font-weight: 400; font-size: 11px; letter-spacing: .24em; text-transform: uppercase; color: ${ACENTO}; border-bottom: 1px solid ${ACENTO2}; text-decoration: none; }
  .mn-btn-solido { display: inline-flex; align-items: center; justify-content: center; min-height: 48px; padding: 0 26px; background: ${ACENTO}; color: ${PAPEL}; border: none; font-family: ${SANS}; font-weight: 400; font-size: 11.5px; letter-spacing: .24em; text-transform: uppercase; cursor: pointer; text-decoration: none; }
  .mn-btn-fantasma { display: inline-flex; align-items: center; justify-content: center; min-height: 48px; padding: 0 22px; background: transparent; color: ${TINTA}; border: 1px solid ${ACENTO2}; font-family: ${SANS}; font-weight: 400; font-size: 11px; letter-spacing: .24em; text-transform: uppercase; cursor: pointer; }
  .mn-frase-seccion { position: relative; padding: 64px 8%; text-align: center; background: ${PAPEL}; }
  .desktop-stage .mn-frase-seccion { padding: 76px 8%; }
  .mn-frase { font-family: ${SERIF}; font-weight: 300; font-style: italic; font-size: 27px; line-height: 1.45; color: ${TINTA}; margin: 0 auto 6px; max-width: 26ch; text-wrap: pretty; }
  .desktop-stage .mn-frase { font-size: 32px; }
  .mn-flota { animation: mnFlota 7s ease-in-out infinite; }

  /* La cabecera de cada sección: kicker, filete largo y un punto. */
  .mn-entra { opacity: 0; transform: translateY(14px);
    transition: opacity .9s cubic-bezier(.22,.61,.36,1), transform .9s cubic-bezier(.22,.61,.36,1); }
  .mn-entra--visto { opacity: 1; transform: none; }

  /* Cronograma */
  .mn-cronograma { position: relative; text-align: left; max-width: 380px; margin: 0 auto; }
  .mn-cronograma-eje { position: absolute; left: 74px; top: 10px; bottom: 10px; width: 1px; background: ${ACENTO2}; opacity: .45; }
  .mn-hito { display: flex; align-items: center; gap: 12px; padding: 11px 0; }
  .mn-hito-hora { font-family: ${SANS}; font-weight: 400; font-size: 12px; letter-spacing: .2em; color: ${TINTA_SUAVE}; width: 62px; text-align: right; flex-shrink: 0; }
  .mn-hito-punto { width: 4px; height: 4px; border-radius: 50%; background: ${ACENTO2}; flex-shrink: 0; }
  .mn-hito-titulo { font-family: ${SERIF}; font-weight: 400; font-size: 20px; color: ${TINTA}; }

  /* Cuenta regresiva: los días en un anillo que gira, el resto en cajitas. */
  .mn-cuenta { display: flex; flex-direction: column; align-items: center; gap: 22px; }
  .mn-cuenta-circulo { position: relative; width: 152px; height: 152px; display: flex; align-items: center; justify-content: center; text-align: center; }
  .mn-cuenta-anillo { position: absolute; inset: 0; border-radius: 50%; border: 1px solid ${ACENTO2};
    border-top-color: ${ACENTO}; border-right-color: transparent; animation: mnGira 60s linear infinite; }
  .mn-cuenta-dias { display: block; font-family: ${SERIF}; font-weight: 300; font-size: 62px; line-height: 1; color: ${TINTA}; font-variant-numeric: tabular-nums; }
  .mn-cuenta-grilla { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; width: 100%; max-width: 340px; }
  .mn-cuenta-caja { position: relative; background: ${PAPEL}; border: 1px solid rgba(0,0,0,.08); padding: 16px 8px 13px; text-align: center; overflow: hidden; }
  .mn-cuenta-caja::after { content: ""; position: absolute; right: 0; top: 0; width: 16px; height: 16px;
    background: linear-gradient(225deg, ${PAPEL2} 50%, rgba(0,0,0,.10) 50%); }
  .mn-cuenta-num { display: block; font-family: ${SERIF}; font-weight: 300; font-size: 32px; line-height: 1; color: ${TINTA}; font-variant-numeric: tabular-nums; }
  .mn-cuenta-etq { display: block; font-family: ${SANS}; font-weight: 400; font-size: 9px; letter-spacing: .26em; text-transform: uppercase; color: ${TINTA_SUAVE}; margin-top: 6px; }
  .mn-cuenta-aviso { text-align: center; }

  /* Mapa */
  .mn-mapa { height: 180px; display: flex; align-items: center; justify-content: center; overflow: hidden;
    background: ${PAPEL2}; border: 1px solid rgba(0,0,0,.08); margin-bottom: 18px; }
  .desktop-stage .mn-mapa { height: 250px; }

  /* Banco */
  .mn-banco-fila { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid rgba(0,0,0,.08); text-align: left; }
  .mn-banco-clave { display: block; font-family: ${SANS}; font-weight: 400; font-size: 9.5px; letter-spacing: .28em; text-transform: uppercase; color: ${ACENTO}; margin-bottom: 3px; }
  .mn-banco-valor { display: block; font-family: ${SANS}; font-weight: 300; font-size: 15px; color: ${TINTA}; overflow-wrap: anywhere; }
  .mn-hoja #banco .t-kicker, .mn-hoja h4 { font-family: ${SANS} !important; font-weight: 400 !important; font-size: 9.5px !important; letter-spacing: .28em !important; text-transform: uppercase !important; color: ${ACENTO} !important; }

  /* Quiz */
  .mn-quiz-opcion { display: block; width: 100%; max-width: 420px; margin: 0 auto 8px; min-height: 48px; padding: 12px 16px; cursor: pointer; text-align: left;
    font-family: ${SANS}; font-weight: 300; font-size: 15px; color: ${TINTA}; background: ${PAPEL}; border: 1px solid rgba(0,0,0,.08); transition: background .2s ease, color .2s ease, border-color .2s ease; }
  .mn-quiz-opcion[data-elegida] { background: ${ACENTO}; border-color: ${ACENTO}; color: ${PAPEL}; }
  .mn-quiz-opcion:disabled { cursor: default; }

  /* Monograma */
  .mn-monograma { position: relative; width: 78px; height: 78px; display: flex; align-items: center; justify-content: center; margin: 6px auto 18px;
    border: 1px solid ${ACENTO2}; border-radius: 50%; }
  .mn-monograma svg { display: none; }
  .mn-monograma span { position: relative; font-family: ${SERIF}; font-weight: 300; font-size: 22px; letter-spacing: .18em; color: ${ACENTO}; }

  /* Splash */
  .mn-splash { position: fixed; inset: 0; z-index: 99999; display: flex; align-items: center; justify-content: center; padding: 16px 3%; background: ${PAPEL}; }
  .mn-splash--sale { animation: mnSplashSale .9s ease both; }
  .mn-splash-hoja { position: relative; width: 100%; max-width: 340px; aspect-ratio: 301/432; padding: 40px 28px 34px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .mn-splash-nombre { font-family: ${SCRIPT}; font-weight: 400; font-size: 52px; line-height: 1.1; color: ${ACENTO}; margin: 2px 0 4px; }
  @keyframes mnSplashSale { from { opacity: 1; } to { opacity: 0; } }
  @keyframes mnPortadaSube { from { transform: translateY(24px); } to { transform: translateY(0); } }
  @keyframes mnPrensado { from { transform: scale(.96); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  @keyframes mnGira { to { transform: rotate(360deg); } }
  @keyframes mnFlota { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
  @keyframes mnBrillo { 0% { left: -130px; } 60%, 100% { left: 120%; } }

  /* Pase (burbuja arriba) */
  .mn-pase-burbuja { position: fixed; top: 12px; left: 50%; transform: translateX(-50%); z-index: 99999; cursor: pointer; padding: 8px 14px;
    background: ${PAPEL}; border: 1px solid ${ACENTO2}; box-shadow: 0 2px 10px rgba(${SH},.16); transition: all .5s ease; }
  .mn-pase-burbuja--abierta { width: calc(100% - 32px); max-width: 360px; padding: 12px 16px; }

  /* Pastilla inferior */
  .mn-pastilla { transition: opacity .35s ease, transform .35s cubic-bezier(.22,.61,.36,1); }
  .mn-pastilla--oculta { opacity: 0; transform: translateY(26px); transition: opacity .3s ease, transform .3s cubic-bezier(.22,.61,.36,1); pointer-events: none; }
  .mn-raiz .bottom-nav, .desktop-stage.mn-escenario .bottom-nav { border-radius: 0 !important; background: ${PAPEL} !important; border: 1px solid ${ACENTO2} !important;
    box-shadow: 0 2px 10px rgba(${SH},.16) !important; backdrop-filter: none !important; padding: 5px !important; gap: 2px !important; }
  .mn-raiz .bottom-nav a { color: ${TINTA} !important; opacity: .55 !important; min-height: 48px; }
  .mn-raiz .bottom-nav a[aria-current="true"] { opacity: 1 !important; background: ${PAPEL2}; color: ${ACENTO} !important; }

  /* Componentes compartidos, vestidos con el registro */
  .mn-raiz .tpl h2, .mn-raiz .tpl h3, .mn-raiz .tpl h4 { font-family: ${SERIF}; color: ${TINTA}; }
  .mn-raiz .mn-script, .mn-raiz .mn-amp, .mn-raiz .mn-splash-nombre, .mn-raiz .mn-sinonimo { font-family: ${SCRIPT} !important; font-weight: 400 !important; font-style: normal !important; }
  .mn-raiz .tpl .t-kicker, .mn-raiz .tpl p.kicker { font-family: ${SANS} !important; color: ${ACENTO} !important; font-size: 10px !important; font-weight: 400 !important; letter-spacing: .28em !important; text-transform: uppercase !important; display: block; }
  .mn-raiz .tpl .t-kicker::before, .mn-raiz .tpl p.kicker::before { display: none !important; }
  .mn-raiz .tpl div:not(#countdown div), .mn-raiz .tpl section, .mn-raiz .tpl button, .mn-raiz .tpl input, .mn-raiz .tpl iframe, .mn-raiz .tpl .t-btn, .mn-raiz .tpl .album-btn { border-radius: 0 !important; }
  .mn-raiz .tpl .album-item { border-radius: 0 !important; border: 8px solid ${PAPEL}; border-bottom-width: 22px; background: ${PAPEL}; box-shadow: 0 2px 10px rgba(${SH},.16); }
  .mn-raiz .tpl .album-btn { color: ${ACENTO} !important; border: 1px solid ${ACENTO2} !important; background: transparent !important; }
  .mn-raiz .tpl .cascade-frame { box-shadow: 0 2px 10px rgba(${SH},.16) !important; background: ${PAPEL} !important; }

  /* Los íconos de los componentes compartidos no entran: el dibujo de esta
     sub-colección son los doodles pintados. */
  .mn-raiz #songs svg.lucide, .mn-raiz #rsvp svg.lucide, .mn-raiz .ia-icon-box svg.lucide { display: none !important; }
  .mn-raiz .ia-icon-box { display: none !important; }

  .mn-raiz #rsvp.section.dark { background: transparent !important; color: ${TINTA} !important; border: none !important; padding: 0 !important; display: flex; flex-direction: column; align-items: center; }
  .mn-raiz #rsvp.section.dark > p.t-kicker, .mn-raiz #rsvp.section.dark > h2, .mn-raiz #rsvp.section.dark > .d-rsvp-grid { width: 100% !important; max-width: 420px !important; text-align: left !important; }
  .mn-raiz #rsvp.section.dark h2 { display: none !important; }
  .mn-raiz #rsvp.section.dark b, .mn-raiz #rsvp.section.dark strong { color: ${TINTA} !important; }
  .mn-raiz #rsvp.section.dark label { text-transform: uppercase !important; font-size: 9.5px !important; font-family: ${SANS} !important; letter-spacing: .28em !important; color: ${ACENTO} !important; font-weight: 400 !important; }
  .mn-raiz #rsvp.section.dark input { background: ${PAPEL} !important; color: ${TINTA} !important; border: 1px solid rgba(0,0,0,.08) !important; border-radius: 0 !important; padding: 12px 14px !important; font-family: ${SANS} !important; font-weight: 300 !important; font-size: 15px !important; min-height: 48px; }
  .mn-raiz #rsvp.section.dark input::placeholder { color: ${TINTA_SUAVE} !important; opacity: .8 !important; }
  .mn-raiz #rsvp.section.dark .t-btn { border-radius: 0 !important; min-height: 48px; padding: 0 22px !important; flex: 1 !important; min-width: 130px !important; background: transparent !important; color: ${TINTA} !important; border: 1px solid ${ACENTO2} !important; font-family: ${SANS} !important; font-weight: 400 !important; text-transform: uppercase !important; letter-spacing: .24em !important; font-size: 11.5px !important; }
  .mn-raiz #rsvp.section.dark .t-btn.solid, .mn-raiz #rsvp.section.dark button[data-rsvp="confirmar"] { background: ${ACENTO} !important; color: ${PAPEL} !important; border-color: ${ACENTO} !important; }
  .mn-raiz #rsvp.section.dark div:has(> button[data-rsvp="confirmar"]) { flex-direction: row !important; gap: 12px !important; }
  .mn-raiz .tpl .d-rsvp-grid { display: flex !important; flex-direction: column !important; gap: 24px !important; align-items: flex-start !important; }
  .mn-raiz .tpl .d-rsvp-grid > div { width: 100% !important; }
  .mn-raiz #rsvp.section.dark .t-detail { background: transparent !important; border: none !important; border-top: 1px solid rgba(0,0,0,.08) !important; padding: 16px 0 0 !important; text-align: left !important; box-shadow: none !important; width: 100% !important; }
  .mn-raiz #rsvp.section.dark .t-detail h4 { color: ${ACENTO} !important; font-family: ${SANS} !important; text-transform: uppercase !important; font-size: 9.5px !important; letter-spacing: .28em !important; font-weight: 400 !important; margin-bottom: 6px !important; }
  .mn-raiz #rsvp.section.dark .t-detail p { color: ${TINTA_SUAVE} !important; font-size: 14px !important; }
  .mn-raiz #rsvp.section.dark .t-detail p b { font-family: ${SERIF} !important; font-weight: 300 !important; font-size: 26px !important; color: ${TINTA} !important; }
  /* Confirmado: la caligrafía de la familia, no un relieve. */
  .mn-raiz #rsvp.section.dark [class*="confirm"] h3, .mn-raiz #rsvp.section.dark h3 { font-family: ${SCRIPT} !important; font-weight: 400 !important; font-size: 46px !important; line-height: 1.1 !important; color: ${ACENTO} !important;
    animation: mnPrensado .5s cubic-bezier(.22,.61,.36,1) both; }

  .mn-raiz #songs.d-sec.dark, .mn-raiz #songs { background: transparent !important; padding: 0 !important; display: flex; flex-direction: column; align-items: center; color: ${TINTA}; }
  .mn-raiz #songs > p.t-kicker, .mn-raiz #songs > form, .mn-raiz #songs > div { width: 100% !important; max-width: 420px !important; text-align: left !important; }
  .mn-raiz #songs h2, .mn-raiz #songs p:not(.t-kicker) { font-family: ${SANS}; color: ${TINTA}; }
  .mn-raiz #songs .mod-input-row { display: flex !important; flex-direction: column !important; gap: 0 !important; width: 100% !important; }
  .mn-raiz #songs input { background: ${PAPEL} !important; color: ${TINTA} !important; border: 1px solid rgba(0,0,0,.08) !important; border-radius: 0 !important; min-height: 48px; padding: 0 14px !important; font-family: ${SANS} !important; font-weight: 300 !important; font-size: 15px !important; }
  .mn-raiz #songs button[type="submit"], .mn-raiz #songs .t-btn { background: ${ACENTO} !important; color: ${PAPEL} !important; border: none !important; border-radius: 0 !important; min-height: 48px; font-family: ${SANS} !important; font-weight: 400 !important; font-size: 11.5px !important; letter-spacing: .24em !important; text-transform: uppercase !important; }
  .mn-raiz #songs .mod-item, .mn-raiz #songs li { background: transparent !important; border: none !important; border-bottom: 1px solid rgba(0,0,0,.08) !important; border-radius: 0 !important; }

  .mn-raiz #info-adicional { background: transparent !important; }
  .mn-raiz #ia-trigger-btn { background: transparent !important; color: ${ACENTO} !important; border: 1px solid ${ACENTO2} !important; border-radius: 0 !important; font-family: ${SANS} !important; letter-spacing: .24em !important; text-transform: uppercase !important; font-size: 11px !important; }

  .mn-raiz .copy-btn { background: transparent !important; color: ${ACENTO} !important; border: 1px solid ${ACENTO2} !important; border-radius: 0 !important; font-family: ${SANS} !important; font-weight: 400 !important; font-size: 10px !important; letter-spacing: .24em !important; text-transform: uppercase !important; }
  .mn-raiz .copy-btn.copied { background: ${ACENTO} !important; color: ${PAPEL} !important; }

  /* Post-evento */
  .mn-post { position: relative; z-index: 1; max-width: 640px; margin: 0 auto; padding: 48px 3% 24px; min-height: 100dvh; display: flex; align-items: center; }
  .mn-post-hoja { width: 100%; padding: 44px 30px 38px; }
  .mn-sinonimo { font-family: ${SCRIPT}; font-weight: 400; font-style: normal; color: ${ACENTO}; }

  /* Manuscrita: los nombres son letra manuscrita, no mayúsculas grabadas. */
  .mn-nombres { font-family: ${SCRIPT}; font-weight: 400; font-size: 60px; line-height: 1.15; letter-spacing: 0; text-transform: none; }
  .desktop-stage .mn-nombres { font-size: 72px; }
  .mn-amp { font-size: 42px; line-height: .8; }
  /* El borde del sobre es un pespunte: puntadas en diagonal, como una carta
     cosida a mano. */
  .mn-sobre-filete { border: none;
    background: repeating-linear-gradient(45deg, ${PAPEL} 0 5px, transparent 5px 10px);
    -webkit-mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0);
    mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0);
    padding: 6px; }
  .mn-sobre-filete--interno { border: 1px dashed ${PAPEL}80; background: none; -webkit-mask: none; mask: none; padding: 0; }
  /* La aguada: una pasada de agua sobre el forro, cada 7,5 s. */
  .mn-sobre-brillo { background: linear-gradient(90deg, transparent, rgba(255,250,240,.5), transparent);
    animation: mnBrillo 7.5s cubic-bezier(.45,0,.55,1) 1.6s infinite; }

  @media (prefers-reduced-motion: reduce) {
    .mn-entra { opacity: 1; transform: none; transition: none; }
    .mn-splash--sale, .mn-portada--sube, .mn-flota, .mn-cuenta-anillo, .mn-sobre-brillo { animation: none; }
    .mn-pastilla, .mn-pastilla--oculta { transition: none; opacity: 1; transform: none; pointer-events: auto; }
  }
`;
