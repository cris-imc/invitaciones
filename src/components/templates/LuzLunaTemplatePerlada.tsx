/**
 * LuzLunaTemplatePerlada.tsx
 * Pack "Cinemático" (mockup/nuevo/Plantillas 15 Años Cinemático.dc.html +
 * Plantillas Casamiento Cinemático.dc.html) — sistema "Luz de Luna": noche
 * estrellada, tema oscuro por defecto, tipografía Cormorant Garamond
 * (display) + Quicksand (texto). Ornamento del mockup (stars/shimmer según
 * variante): acá unificado como marco de halo (perímetro fino completo, como
 * un aro de luz de luna) + una luna creciente asomando de una esquina y una
 * mini-constelación en la opuesta -- distinto del marco de esquinas dobles
 * de SedaTemplate y del marco+ramo floral de PetalosTemplate. Efecto de foto
 * propio: resplandor de luna (glow circular suave que recorre la foto en
 * diagonal con el scroll) + un puñado de estrellas titilando encima de la
 * foto (opacidad oscilante ligada al progreso de scroll), en vez del
 * lens-flare de Chic, el brillo de seda o los pétalos a la deriva.
 * Derivado de ModernoTemplate.tsx (misma arquitectura/props/componentes
 * compartidos: Countdown, RSVPWizardV2, BottomNavPill, SongSuggestion,
 * AlbumCarousel, SectionWrapper, ProgressiveQuiz local).
 *
 * Paleta: TODO el theming de color pasa por CSS custom properties definidas
 * en los DOS wrappers (mobile + desktop-stage, ver guía sección 3.2) -- cero
 * hex hardcodeado salpicado en el JSX de secciones/tarjetas/texto, para que
 * el script generador de variantes (scratch-gen-luzluna-variants.js) solo
 * tenga que reemplazar el bloque de 9 valores del wrapper (evita la trampa
 * de "inversión mecánica" de la sección 3.5 de la guía -- funciona igual
 * para variantes claras que para oscuras). Paleta base (Isabella · Luz de
 * Luna Nocturna, tema oscuro):
 *   --t-bg #F7F3FC · --t-surface #EFE7F8 · --luzluna-ink #3D3550
 *   --t-muted #8579a0 · --t-acc #C9B8E8 (lavanda) · --t-acc2 #E8C9DE (violeta profundo)
 *
 * Gating: QUINCE_ANOS + CASAMIENTO (igual patrón dual que NeonTemplate con
 * QUINCE_ANOS+CUMPLEANOS). El gating real vive en TemplatePreviewModal.tsx,
 * este archivo no valida nada por su cuenta.
 */
"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Cormorant_Garamond, Quicksand } from "next/font/google";
import { animate, stagger, onScroll } from "animejs";
import { AlbumCarousel } from "@/components/invitation/v2/AlbumCarousel";
import { Album } from "@/components/invitation/v2/Album";
import { AnimatedCoverPhoto, COVER_EXIT_STYLE, COVER_RESPONSIVE_STYLE } from "@/components/invitation/v2/AnimatedCoverPhoto";
import { CoverFallbackBg, COVER_FALLBACK_STYLE } from "@/components/invitation/v2/CoverFallbackBg";
import { Countdown } from "@/components/invitation/v2/Countdown";
import { SaveTheDate } from "@/components/invitation/v2/SaveTheDate";
import { RSVPWizardV2 } from "@/components/invitation/v2/RSVPWizardV2";
import { PaymentBadge } from "@/components/invitation/v2/PaymentBadge";
import { SongSuggestion } from "@/components/invitation/v2/SongSuggestion";
import { SectionWrapper } from "@/components/invitation/v2/SectionWrapper";
import { BankDetailsCard } from "@/components/invitation/v2/BankDetailsCard";
import { BottomNavPill } from "@/components/invitation/v2/BottomNavPill";
import { TypewriterText } from "@/components/ui/TypewriterText";
import { AnimatedSynonyms } from "@/components/ui/AnimatedSynonyms";
import { HeroV2 } from "@/components/invitation/v2/HeroV2";
import { useMusicPlayer, MusicToggleButton } from "@/components/invitation/MusicPlayer";
import { LogoFooterCredit } from "@/components/ui/Logo";
import { Clock, MapPin, Trophy, Star, ThumbsUp, Users, CreditCard, Gift, Ticket, BookOpen, CalendarDays, Camera, HelpCircle, Landmark } from "lucide-react";
import { DrawLucideIcon } from "@/components/ui/icons/DrawLucideIcon";
import { getEventStatus, getInvitationExpirationDate } from "@/lib/expiration";
import { toEmbedMapUrl } from "@/lib/google-maps";
import { getTypographyCssVars } from "@/lib/typography-map";
import { resolveGuestNameDisplay } from "@/lib/invitation-copy";

// Doodles de trazo fino "noche estrellada" -- luna creciente, sparkle de 4
// puntas, constelación de puntos conectados y voluta de nube/niebla nocturna.
const IconInfo  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3} aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><path d="M12 15.5v-4M12 8.2h.01"/></svg>;
const IconCheck = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3} aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>;
const IconMusic = ({ className, style }: { className?: string; style?: React.CSSProperties } = {}) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3} className={className} style={style} aria-hidden="true"><path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="2.6"/><circle cx="17" cy="16" r="2.6"/></svg>;
const IconMap   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3} aria-hidden="true"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
const IconGift  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3} aria-hidden="true"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/></svg>;
const IconQuiz  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3} aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>;
// Luna creciente -- dos arcos formando la silueta clásica de luna, con una
// mini-estrella acompañando. Motivo principal del sistema "Luz de Luna".
const IconMoon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.1} className={className} style={style} aria-hidden="true">
    <path d="M15.5 3.5a8.5 8.5 0 1 0 5 15.4A9.5 9.5 0 0 1 15.5 3.5Z" />
    <path d="M20.5 2.5v2.4M19.3 3.7h2.4" strokeWidth={0.8} />
  </svg>
);
// Sparkle de 4 puntas -- estrella de acento, doble trazo con centro marcado.
const IconStarSpark = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.1} className={className} style={style} aria-hidden="true">
    <path d="M10 1c0 4 .6 7 2.2 8.4C13.6 10.6 16 11 19 11c-4 0-6.4.6-7.8 2.2C10 14.6 10 17 10 19c0-4-.6-6.4-2.2-7.8C6.4 10 4 10 1 10c4 0 6.4-.6 7.8-2.2C10 6.4 10 4 10 1Z" />
  </svg>
);
// Constelación -- 4 puntos conectados por líneas finas, cada punto marcado
// con un pequeño círculo, separador de secciones y detalle del marco.
const IconConstellation = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 34 16" fill="none" stroke="currentColor" strokeWidth={0.95} className={className} style={style} aria-hidden="true">
    <path d="M2 12 11 4l9 6 12-8" />
    <circle cx="2" cy="12" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="11" cy="4" r="1.6" fill="currentColor" stroke="none" />
    <circle cx="20" cy="10" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="32" cy="2" r="1.4" fill="currentColor" stroke="none" />
  </svg>
);
// Voluta de nube/niebla nocturna -- dos ondas suaves apiladas, acento
// atmosférico usado como separador y detalle de citas.
const IconCloudWisp = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 26 14" fill="none" stroke="currentColor" strokeWidth={1.1} className={className} style={style} aria-hidden="true">
    <path d="M1 5c3-3 6-3 8 0s5 3 8 0 6-3 8 0" />
    <path d="M3 10c3-2.4 6-2.4 8 0s5 2.4 8 0" strokeWidth={0.85} opacity={0.75} />
  </svg>
);
// Arco ceremonial neutro (civil o religioso) -- reemplaza un ícono
// específico de iglesia para que la tarjeta "Ceremonia" sirva tanto para una
// boda como para una misa/celebración de 15, sin connotación única.
const IconArch = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.1} className={className} style={style} aria-hidden="true">
    <path d="M4 21V12a8 8 0 0 1 16 0v9" />
    <path d="M4 21h16" />
    <path d="M8.5 21v-7a3.5 3.5 0 0 1 7 0v7" />
    <path d="M12 7.4V5.6M11.3 6h1.4" strokeWidth={0.9} />
  </svg>
);

const CRONO_ICONS: Record<string, string> = {
  Heart: "💛", Music: "🎵", Utensils: "🍽️", Calendar: "📅",
  Gift: "🎁", Camera: "📷", Clock: "🕐",
};

// Tipografía exacta del mockup Luz de Luna (Cormorant Garamond + Quicksand),
// escopeada solo a este componente vía CSS var override en el wrapper raíz.
const luzlunaCormorant = Cormorant_Garamond({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
  variable: "--luzluna-cormorant",
  display: "swap",
});
const luzlunaQuicksand = Quicksand({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--luzluna-quicksand",
  display: "swap",
});

type Theme = "boda" | "xv" | "cumple";

function getThemeFromTipo(tipo: string): Theme {
  if (tipo === "CASAMIENTO") return "boda";
  if (tipo === "QUINCE_ANOS") return "xv";
  return "cumple";
}

// Ancestro real que scrollea al hero: document.body en una invitación real
// (scroll de página completa), pero un <div> con overflow-y propio dentro
// del "phone frame" de vista previa (/modelos, wizard) -- pasarle
// document.body ahi hace que anime.js escuche scroll de la ventana, que
// nunca ocurre (solo scrollea el div interno), y el efecto queda
// congelado/con tirones en vez de animar con el scroll real.
function getScrollContainer(el: HTMLElement | null): HTMLElement {
  let node = el?.parentElement ?? null;
  while (node && node !== document.body) {
    const cs = getComputedStyle(node);
    if ((cs.overflowY === "auto" || cs.overflowY === "scroll") && node.scrollHeight > node.clientHeight + 1) {
      return node;
    }
    node = node.parentElement;
  }
  return document.body;
}

function safeJson<T>(val: string | null | undefined, fallback: T): T {
  if (!val) return fallback;
  try { return JSON.parse(val) as T; } catch { return fallback; }
}

interface LuzLunaTemplatePerladaProps {
  invitation: Record<string, unknown>;
  guest?: {
    id: string;
    name: string;
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

interface CronoItem {
  time?: string;
  title: string;
  icon?: string;
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div className="flex items-center justify-between gap-3 py-3 border-b" style={{ borderColor: "color-mix(in srgb, var(--t-acc) 20%, transparent)" }}>
      <div className="min-w-0 flex-1">
        <span className="block text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: "var(--t-acc)" }}>{label}</span>
        <span className="text-xs sm:text-sm font-mono break-all" style={{ color: "var(--luzluna-ink)" }}>{value}</span>
      </div>
      <button
        className={`copy-btn shrink-0 px-4 py-2 transition-all ${copied ? "copied" : ""}`}
        type="button"
        onClick={handle}
      >
        {copied ? "✓ Copiado" : "Copiar"}
      </button>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 border-b" style={{ borderColor: "color-mix(in srgb, var(--t-acc) 20%, transparent)" }}>
      <div className="min-w-0 flex-1">
        <span className="block text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: "var(--t-acc)" }}>{label}</span>
        <span className="text-sm font-medium break-words" style={{ color: "var(--luzluna-ink)" }}>{value}</span>
      </div>
    </div>
  );
}

interface QuizQuestion {
  pregunta: string;
  opciones: string[];
  respuestaCorrecta?: number;
  correcta?: number;
}

function ProgressiveQuiz({ preguntas, invitationId, guestToken, guestName, tipo }: { preguntas: QuizQuestion[]; invitationId?: string; guestToken?: string; guestName?: string; tipo?: string }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [picks, setPicks] = useState<Record<number, number>>({});
  const [finished, setFinished] = useState(false);
  const [stats, setStats] = useState<{ avg: number; count: number } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (!invitationId) {
      setHasLoaded(true);
      return;
    }

    const params = new URLSearchParams({ invitationId });
    if (guestToken) params.append("guestToken", guestToken);

    fetch(`/api/quiz?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.averagePercentage === 'number') {
          setStats({ avg: data.averagePercentage, count: data.totalResponses });
        }
        if (data && data.hasAnswered && data.guestScore) {
          setPicks(data.guestScore.answers || {});
          setFinished(true);
        } else {
          const storageKey = guestToken ? `quiz_finished_${invitationId}_${guestToken}` : `quiz_finished_${invitationId}`;
          const localPicks = localStorage.getItem(storageKey);
          if (localPicks) {
            setPicks(JSON.parse(localPicks));
            setFinished(true);
          }
        }
      })
      .catch(e => console.error("Error fetching quiz data", e))
      .finally(() => setHasLoaded(true));
  }, [invitationId, guestToken]);

  const pick = async (oi: number) => {
    if (picks[currentIdx] !== undefined) return;
    const newPicks = { ...picks, [currentIdx]: oi };
    setPicks(newPicks);

    setTimeout(async () => {
      if (currentIdx < preguntas.length - 1) {
        setCurrentIdx(currentIdx + 1);
      } else {
        setFinished(true);
        if (invitationId) {
          setIsSaving(true);
          try {
            let score = 0;
            preguntas.forEach((q, i) => {
              if (newPicks[i] === q.respuestaCorrecta) score++;
            });
            await fetch('/api/quiz', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                invitationId,
                guestName: guestName || 'Invitado Anónimo',
                guestToken: guestToken || null,
                answers: Object.values(newPicks),
                score,
                totalQuestions: preguntas.length
              })
            });

            const params = new URLSearchParams({ invitationId });
            if (guestToken) params.append("guestToken", guestToken);
            const statsRes = await fetch(`/api/quiz?${params.toString()}`);
            if (statsRes.ok) {
              const data = await statsRes.json();
              setStats({ avg: data.averagePercentage, count: data.totalResponses });
            }

            const storageKey = guestToken ? `quiz_finished_${invitationId}_${guestToken}` : `quiz_finished_${invitationId}`;
            localStorage.setItem(storageKey, JSON.stringify(newPicks));
          } catch (e) {
             console.error(e);
          } finally {
            setIsSaving(false);
          }
        }
      }
    }, 400);
  };

  if (!hasLoaded) return null;

  if (finished) {
    let score = 0;
    preguntas.forEach((q, i) => { if (picks[i] === q.respuestaCorrecta) score++; });
    const percent = Math.round((score / preguntas.length) * 100);

    return (
      <div className="quiz-box text-center flex flex-col items-center">
        <h3 style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "2rem", fontStyle: "italic", color: "var(--luzluna-ink)" }}>
          ¡Juego Completado!
        </h3>
        <p style={{ marginTop: "12px", opacity: 0.8, fontFamily: "var(--font-sans)", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.8rem", color: "var(--luzluna-ink)" }}>
          RESPONDISTE {score} DE {preguntas.length} CORRECTAMENTE ({percent}%)
        </p>

        {isSaving ? (
          <p style={{ marginTop: "16px", fontSize: "14px", opacity: 0.7, color: "var(--t-muted)" }}>Guardando tus resultados...</p>
        ) : (
          stats && stats.count > 0 && (
            <div style={{ marginTop: "28px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "color-mix(in srgb, var(--t-acc) 10%, transparent)", padding: "8px 16px", borderRadius: "99px", border: "1px solid color-mix(in srgb, var(--t-acc) 20%, transparent)", textAlign: "left", maxWidth: "90%" }}>
                <Users className="w-5 h-5 shrink-0" style={{ color: "var(--t-acc)" }} />
                <p style={{ fontSize: "11.5px", margin: 0, opacity: 0.85, lineHeight: 1.4, color: "var(--luzluna-ink)" }}>
                  El promedio global de aciertos del resto de los invitados ({stats.count}) es del <strong style={{ color: "var(--luzluna-ink)" }}>{stats.avg}%</strong>.
                </p>
              </div>
            </div>
          )
        )}
      </div>
    );
  }

  const q = preguntas[currentIdx];
  if (!q) return null;

  const formatQuestion = (text: string) => {
    let formatted = text.trim();
    if (formatted.startsWith('¿')) {
      formatted = formatted.substring(1).trim();
    }
    if (formatted.length > 0) {
      formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }
    return `¿${formatted}${formatted.endsWith('?') ? '' : '?'}`;
  };

  return (
    <div className="quiz-box flex flex-col items-center text-center">
      <div className="quiz-q w-full max-w-lg" key={currentIdx}>
        <p className="text-2xl md:text-3xl leading-relaxed tracking-wide" style={{ color: "var(--luzluna-ink)", fontFamily: 'var(--font-cormorant), serif', fontStyle: 'italic', margin: 0, fontWeight: 500, marginBottom: "3.5rem" }}>
          {formatQuestion(q.pregunta)}
        </p>
        <div className="quiz-opts flex flex-wrap justify-center gap-3">
          {q.opciones.map((opt, oi) => {
            const chosen = picks[currentIdx] === oi;
            let className = "quiz-opt";
            if (chosen) {
              if (q.correcta !== undefined) {
                className += (q.correcta === oi) ? " picked" : " picked-wrong";
              } else {
                className += " picked";
              }
            }
            return (
              <button
                key={oi}
                type="button"
                style={{
                  borderColor: 'var(--t-acc)',
                  color: chosen ? 'var(--t-onacc)' : 'var(--t-acc)',
                  backgroundColor: chosen ? 'var(--t-acc)' : 'transparent'
                }}
                className={`px-5 py-2.5 rounded-full border text-sm transition-all hover:bg-[var(--t-acc)] hover:text-[var(--t-onacc)] ${className}`}
                disabled={picks[currentIdx] !== undefined}
                onClick={() => pick(oi)}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const formatNumber = (num: number) => {
  return new Intl.NumberFormat("es-AR").format(num);
};

export function LuzLunaTemplatePerlada({ invitation, guest, isPersonalized = false }: LuzLunaTemplatePerladaProps) {
  const [isCoverOpen, setIsCoverOpen] = useState(false);
  const [isClosingCover, setIsClosingCover] = useState(false);
  const [isTicketMaximized, setIsTicketMaximized] = useState(true);

  const openInvitation = () => {
    if (isClosingCover) return;
    setIsClosingCover(true);
  };
  useEffect(() => {
    if (!isClosingCover) return;
    const t = setTimeout(() => setIsCoverOpen(true), 700);
    return () => clearTimeout(t);
  }, [isClosingCover]);

  const musicaHabilitada = Boolean(invitation.musicaHabilitada) && Boolean(invitation.musicaUrl);
  const { isPlaying: isMusicPlaying, togglePlay: toggleMusic, audioElement: musicAudioElement } = useMusicPlayer({
    musicaUrl: String(invitation.musicaUrl ?? ""),
    autoplay: musicaHabilitada && Boolean(invitation.musicaAutoplay ?? true),
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isCoverOpen || !isTicketMaximized) return;
    const t = setTimeout(() => setIsTicketMaximized(false), 4000);
    return () => clearTimeout(t);
  }, [isCoverOpen, isTicketMaximized]);
  const tipo   = String(invitation.tipo ?? "OTRO");
  const theme  = getThemeFromTipo(tipo);

  useEffect(() => {
    const isPostEventNow = getEventStatus(invitation.fechaEvento ? new Date(String(invitation.fechaEvento)) : new Date()) === "POST_EVENT";
    if (!isCoverOpen && !isPostEventNow) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isCoverOpen, invitation.fechaEvento]);

  // Entrada animada de los doodles de portada (luna, sparkle, constelación,
  // nube) con anime.js -- corre una sola vez cuando la portada aparece.
  const coverRootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isCoverOpen || !coverRootRef.current) return;
    const root = coverRootRef.current;
    animate(root.querySelectorAll(".luzluna-doodle"), {
      scale: [0, 1],
      rotate: [-14, 0],
      opacity: [0, 1],
      duration: 900,
      delay: stagger(140, { start: 300 }),
      ease: "outBack",
    });
    animate(root.querySelectorAll(".luzluna-seal"), {
      scale: [0.6, 1],
      opacity: [0, 1],
      duration: 700,
      delay: 150,
      ease: "outQuad",
    });
  }, [isCoverOpen]);

  // Doodles del CUERPO: se animan al entrar en viewport con un
  // IntersectionObserver, uno por elemento, disparando una sola vez.
  useEffect(() => {
    if (!isCoverOpen) return;
    const els = document.querySelectorAll(".luzluna-scroll-doodle");
    if (!els.length) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animate(entry.target, {
          scale: [0, 1],
          rotate: [-10, 0],
          opacity: [0, 1],
          duration: 800,
          ease: "outBack",
        });
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.3 });
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [isCoverOpen]);

  // Resplandor de luna + estrellas titilando: un glow circular suave que
  // recorre la foto en diagonal con el scroll, más 4 puntos de luz que
  // titilan (opacidad oscilante) a distinto ritmo entre sí.
  const heroPhotoRef = useRef<HTMLDivElement>(null);
  const moonGlowRef = useRef<HTMLDivElement>(null);
  const twinkle1Ref = useRef<HTMLDivElement>(null);
  const twinkle2Ref = useRef<HTMLDivElement>(null);
  const twinkle3Ref = useRef<HTMLDivElement>(null);
  const twinkle4Ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isCoverOpen || !heroPhotoRef.current || !moonGlowRef.current) return;
    const glow = moonGlowRef.current;
    const twinkles = [twinkle1Ref.current, twinkle2Ref.current, twinkle3Ref.current, twinkle4Ref.current];
    const freqs = [3.4, 4.8, 2.6, 5.6];
    const phases = [0, 1.1, 2.3, 0.6];
    const observer = onScroll({
      target: heroPhotoRef.current,
      container: getScrollContainer(heroPhotoRef.current),
      enter: "bottom top",
      leave: "top bottom",
      onUpdate: (self) => {
        const p = self.progress;
        const intensity = Math.sin(p * Math.PI);
        glow.style.opacity = String(intensity * 0.5);
        glow.style.left = `${p * 130 - 15}%`;
        glow.style.top = `${p * 90 - 5}%`;
        twinkles.forEach((el, i) => {
          if (!el) return;
          const tw = Math.abs(Math.sin(p * Math.PI * freqs[i] + phases[i]));
          el.style.opacity = String(tw * intensity);
        });
      },
    });
    return () => { observer.revert(); };
  }, [isCoverOpen]);

  // Cover / Welcome Overlay data
  const portadaHabilitada = Boolean(invitation.portadaHabilitada ?? true);
  const ciudad = String(invitation.ciudad ?? "");
  const portadaKicker = String(invitation.portadaKicker || "Con mucho cariño, para");
  const portadaMensaje = String(invitation.portadaMensaje || invitation.frasePersonalizadaTexto || invitation.portadaTitulo || "Te invitamos a compartir este día tan especial con nosotros");
  const portadaBoton = String(invitation.portadaTextoBoton || "Abrir invitación");

  const getHeroTitle = () => {
    if (tipo === "CASAMIENTO") {
      const novia = String(invitation.nombreNovia ?? "");
      const novio = String(invitation.nombreNovio ?? "");
      if (novia && novio) return { title: `${novia} & ${novio}`, em: `& ${novio}` };
      return { title: String(invitation.nombreEvento ?? ""), em: undefined };
    }
    return { title: String(invitation.nombreQuinceanera ?? invitation.nombreEvento ?? ""), em: undefined };
  };

  const { title, em } = getHeroTitle();

  const eyebrow = invitation.nombreEvento
    ? String(invitation.nombreEvento)
    : tipo === "CASAMIENTO" ? "Nos casamos"
    : tipo === "QUINCE_ANOS" ? "Mis quince años"
    : "Te invitamos";

  const fechaEvento = invitation.fechaEvento
    ? new Date(String(invitation.fechaEvento))
    : new Date();

  const fechaStr = fechaEvento.toLocaleDateString("es-AR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  }).replace(/\//g, " · ");

  const lugarNombre = String(invitation.lugarNombre ?? "");
  const direccion   = String(invitation.direccion ?? "");
  const hora        = String(invitation.hora ?? "");
  const mapUrl      = String(invitation.mapUrl ?? "");
  // toEmbedMapUrl devuelve null si no pudo convertir el link a un formato
  // embebible (ej. un link corto de Maps que nunca se resolvio, o esta roto)
  // -- antes en ese caso se usaba mapUrl crudo como src del iframe, que
  // Google bloquea (X-Frame-Options) y quedaba como un recuadro blanco.
  const embedMapUrl = mapUrl ? toEmbedMapUrl(mapUrl) : null;

  const quoteKicker = "Unas palabras";

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
  const paymentAmount  = paymentEnabled ? (Number((invitation as any).pagoTarjetaMonto ?? invitation.regaloMonto ?? 0) || (isPreview && !invitation.id ? 25000 : undefined)) : undefined;
  const guestPayStatus = paymentEnabled ? ((guest?.paymentStatus ?? "PENDING") as "PENDING" | "EXEMPT" | "PAID") : undefined;

  const triviaHabilitada = Boolean(invitation.triviaHabilitada);
  const triviaPreguntas: QuizQuestion[] = safeJson<QuizQuestion[]>(String(invitation.triviaPreguntas ?? ""), []);

  const songsEnabled = Boolean(invitation.sugerenciaMusicaHabilitada ?? true);

  const activeDressCode = invitation.dresscodeHabilitado ? String(invitation.dresscodeTipo || invitation.portadaDressCode || "") : "";

  const navSections = [
    { id: "details",   label: "Detalles", icon: <IconInfo /> },
    ...(mapUrl        ? [{ id: "location", label: "Mapa",      icon: <IconMap /> }]   : []),
    ...(rsvpEnabled   ? [{ id: "rsvp",     label: "Confirmar", icon: <IconCheck /> }] : []),
    ...(showGiftSection  ? [{ id: "banco",    label: "Banco",     icon: <IconGift /> }]  : []),
    ...(triviaHabilitada && triviaPreguntas.length > 0 ? [{ id: "quiz", label: "Juego", icon: <IconQuiz /> }] : []),
    ...(songsEnabled  ? [{ id: "songs",    label: "Música",    icon: <IconMusic /> }] : []),
  ];

  const heroBgMobile  = String(invitation.portadaImagenFondo ?? "") || undefined;
  const heroBgDesktop = String(invitation.portadaImagenFondoDesktop ?? "") || heroBgMobile;

  // Portada animada -- a diferencia de la base/MedianocheAzul/NocheEstrellada
  // (tema oscuro), Perlada es de paleta clara (--t-bg #F7F3FC, ink #3D3550) --
  // mismo caso que Chic: el texto no puede forzarse a claro por JS. Se
  // resuelve con clases CSS + media query (.luzluna-cover-text/-muted, en el
  // <style jsx> de este archivo), sin tinte (paleta clara/pastel).
  const portadaImagenFondoDesktopRaw = String(invitation.portadaImagenFondoDesktop ?? "") || undefined;
  const portadaFondoAnimado = Boolean(portadaImagenFondoDesktopRaw);
  const portadaFondoFallback = portadaFondoAnimado ? undefined
    : tipo === "CASAMIENTO" ? "/fondos/luzluna-boda.png"
    : tipo === "QUINCE_ANOS" ? "/fondos/luzluna-quince.png"
    : undefined;

  const guestNameDisplay = resolveGuestNameDisplay(invitation, guest);

  const fechaEventoDate = invitation.fechaEvento ? new Date(String(invitation.fechaEvento)) : new Date();
  const eventStatus = getEventStatus(fechaEventoDate);
  const expirationDate = getInvitationExpirationDate(fechaEventoDate);
  const expirationDateStr = expirationDate.toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });

  const liveItems = (invitation.liveSession as { items?: { fileUrl: string; type?: string }[] } | null)?.items ?? [];
  const livePhotos: string[] = liveItems
    .filter((item) => item.fileUrl && (item.type === "PHOTO" || !item.type || item.fileUrl.match(/\.(jpg|jpeg|png|webp|gif)$/i)))
    .map((item) => item.fileUrl);

  if (eventStatus === "POST_EVENT") {
    return (
      <div className="min-h-dvh w-full text-white relative overflow-x-hidden flex flex-col justify-between" style={{ background: "linear-gradient(180deg, var(--t-bg) 0%, var(--t-surface) 55%, #0A0816 100%)" }} data-theme={theme}>
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none" style={{ background: "color-mix(in srgb, var(--t-acc) 12%, transparent)" }} aria-hidden="true" />
        <div className="absolute right-0 bottom-0 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none" style={{ background: "color-mix(in srgb, var(--t-acc2) 12%, transparent)" }} aria-hidden="true" />

        <main className="relative z-10 max-w-5xl mx-auto w-full px-4 md:px-6 py-12 lg:py-20">
          <div className="rounded-[2rem] shadow-2xl backdrop-blur-3xl text-center max-w-4xl mx-auto relative overflow-hidden flex flex-col" style={{ background: "color-mix(in srgb, black 40%, transparent)", border: "1px solid color-mix(in srgb, var(--t-acc) 15%, transparent)" }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[1px]" style={{ background: "linear-gradient(90deg, transparent, color-mix(in srgb, var(--t-acc) 60%, transparent), transparent)" }} />

            <div className="p-10 md:p-16 space-y-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light tracking-wide drop-shadow-md" style={{ color: "var(--luzluna-ink)", fontFamily: "var(--font-cormorant), serif" }}>
                Un momento <AnimatedSynonyms words={["inolvidable", "único", "eterno", "mágico"]} className="italic font-serif text-[var(--t-acc)]" />
              </h1>

              <div className="flex justify-center items-center gap-4 py-2 opacity-60">
                <div className="h-[1px] w-12" style={{ background: "color-mix(in srgb, var(--luzluna-ink) 25%, transparent)" }} />
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--t-acc)" }} />
                <div className="h-[1px] w-12" style={{ background: "color-mix(in srgb, var(--luzluna-ink) 25%, transparent)" }} />
              </div>

              <p className="text-lg md:text-xl leading-relaxed max-w-2xl mx-auto font-light tracking-wide" style={{ color: "var(--t-muted)", fontFamily: "var(--font-sans)" }}>
                Gracias por acompañarnos en este día tan especial y compartir la alegría de crear recuerdos que perdurarán para siempre.
              </p>

              <div className="pt-6">
                <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full text-xs tracking-widest uppercase backdrop-blur-md" style={{ fontFamily: "var(--font-sans)", background: "color-mix(in srgb, var(--t-acc) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--t-acc) 18%, transparent)", color: "var(--t-muted)" }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--t-acc)" }} />
                  <span>Álbum disponible hasta el {expirationDateStr}</span>
                </div>
              </div>
            </div>

            <SectionWrapper id="album" className="w-full py-8 md:py-12" style={{ background: "color-mix(in srgb, black 20%, transparent)", borderTop: "1px solid color-mix(in srgb, var(--t-acc) 8%, transparent)" }}>
              <div className="px-4 md:px-10">
                {livePhotos.length > 0 ? (
                  <div className="w-full overflow-hidden rounded-2xl shadow-xl" style={{ boxShadow: "0 0 0 1px color-mix(in srgb, var(--t-acc) 15%, transparent)" }}>
                    <AlbumCarousel photos={livePhotos} hideHeader={true} />
                  </div>
                ) : (
                  <div className="text-center space-y-3">
                    <h3 className="font-serif font-light text-xl tracking-wide" style={{ color: "var(--luzluna-ink)" }}>
                      Álbum Fotográfico
                    </h3>
                    <p className="text-sm font-light tracking-wide" style={{ color: "var(--t-muted)", fontFamily: "var(--font-sans)" }}>
                      No se registraron capturas durante la velada.
                    </p>
                  </div>
                )}
              </div>
            </SectionWrapper>
          </div>
        </main>

        <footer className="relative z-10 pt-4 pb-2 text-center font-sans" style={{ borderTop: "1px solid color-mix(in srgb, var(--t-acc) 10%, transparent)" }}>
          <LogoFooterCredit bgColor="transparent" textColor="var(--chic-ink, #3D3550)" />
        </footer>
      </div>
    );
  }

  return (
    <div
      className={`${luzlunaCormorant.variable} ${luzlunaQuicksand.variable}`}
      style={{
        "--font-cormorant": "var(--luzluna-cormorant)",
        "--font-inter": "var(--luzluna-quicksand)",
        "--font-sans": "var(--luzluna-quicksand)",
        "--t-acc": "#C9B8E8",
        "--t-acc2": "#E8C9DE",
        "--c-accent": "#C9B8E8",
        "--t-bg": "#F7F3FC",
        "--t-surface": "#EFE7F8",
        "--t-muted": "#8579a0",
        "--luzluna-ink": "#3D3550",
        // Shim para Countdown.tsx/RSVPWizardV2.tsx: esos componentes leen
        // literalmente `dark ? var(--chic-ink, #FFFFFF) : inherit` (nombre
        // hardcodeado, confirmado leyendo el código). Reusamos el mismo
        // nombre acá con el valor de --luzluna-ink para que el contraste de
        // texto quede correcto sin tocar esos dos archivos.
        "--chic-ink": "#3D3550",
      } as React.CSSProperties}
    >
      <style>{`
        .desktop-stage .tpl h2,
        .desktop-stage .tpl h3,
        .desktop-stage .tpl h4,
        .desktop-stage .tpl .rsvp-container h2,
        .desktop-stage .tpl .rsvp-container h3,
        .desktop-stage .tpl .quiz-container h2,
        .desktop-stage .tpl .quiz-container h3 {
          font-family: var(--font-title, var(--font-cormorant)), serif !important;
          color: var(--luzluna-ink) !important;
        }
        .desktop-stage .tpl .moderno-light-card h4 {
          color: var(--luzluna-ink) !important;
        }
        .desktop-stage .tpl .t-kicker,
        .desktop-stage .tpl p.kicker {
          font-family: var(--font-body-custom, var(--font-inter)), sans-serif !important;
          color: var(--t-acc) !important;
          font-size: 11px !important;
          font-weight: 600 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.2em !important;
          display: block;
        }
        .desktop-stage .tpl button {
          font-family: var(--font-body-custom, var(--font-inter)), sans-serif !important;
        }
        .desktop-stage .tpl .t-kicker::before,
        .desktop-stage .tpl p.kicker::before {
          display: none !important;
        }

        .desktop-stage .tpl div:not(#countdown div),
        .desktop-stage .tpl section,
        .desktop-stage .tpl button,
        .desktop-stage .tpl input,
        .desktop-stage .tpl iframe,
        .desktop-stage .tpl .t-btn,
        .desktop-stage .tpl .album-item,
        .desktop-stage .tpl .album-btn {
          border-radius: 0 !important;
        }
        .desktop-stage .tpl .album-btn {
          color: var(--luzluna-ink) !important;
          border-color: color-mix(in srgb, var(--luzluna-ink) 30%, transparent) !important;
        }

        #countdown.dark {
          background-color: var(--t-bg) !important;
          margin-top: -2px !important;
          position: relative;
          z-index: 20;
        }
        #countdown[data-style="clasico"].dark > div > div > div {
          background-color: color-mix(in srgb, white 6%, transparent) !important;
          border-color: color-mix(in srgb, var(--t-acc) 25%, transparent) !important;
        }

        #rsvp.section.dark {
          background-color: var(--t-bg) !important;
          color: var(--luzluna-ink) !important;
          border: none !important;
          padding: 48px !important;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        #rsvp.section.dark > p.t-kicker,
        #rsvp.section.dark > h2,
        #rsvp.section.dark > .d-rsvp-grid {
          width: 100% !important;
          max-width: 340px !important;
          text-align: left !important;
        }
        #rsvp.section.dark b,
        #rsvp.section.dark strong {
          color: var(--luzluna-ink) !important;
        }
        @media (min-width: 640px) {
          #rsvp.section.dark > p.t-kicker,
          #rsvp.section.dark > h2,
          #rsvp.section.dark > .d-rsvp-grid {
            max-width: 36rem !important;
          }
        }
        #rsvp.section.dark .t-kicker {
          font-family: var(--font-body-custom, var(--font-inter)), sans-serif !important;
          color: var(--t-acc) !important;
          font-size: 11px !important;
          font-weight: 600 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.2em !important;
          margin-bottom: 30px !important;
          display: block !important;
        }
        #rsvp.section.dark h2 {
          display: none !important;
        }
        #rsvp.section.dark label {
          text-transform: uppercase !important;
          font-size: 10px !important;
          font-family: var(--font-body-custom, var(--font-inter)), sans-serif !important;
          letter-spacing: 0.15em !important;
          color: var(--t-muted) !important;
          font-weight: 600 !important;
        }
        #rsvp.section.dark input {
          background-color: var(--t-surface) !important;
          color: var(--luzluna-ink) !important;
          border-radius: 6px !important;
          border: 1px solid color-mix(in srgb, var(--t-acc) 25%, transparent) !important;
          padding: 12px 16px !important;
          font-weight: 400 !important;
          font-size: 14px !important;
        }
        #rsvp.section.dark input::placeholder {
          color: var(--t-muted) !important;
          opacity: 0.8 !important;
        }
        #rsvp.section.dark .t-btn {
          border-radius: 6px !important;
          padding: 12px 24px !important;
          flex: 1 !important;
          min-width: 120px !important;
          background-color: var(--t-acc) !important;
          color: var(--t-bg) !important;
          font-weight: 600 !important;
          border: none !important;
          text-transform: uppercase !important;
          letter-spacing: 0.1em !important;
          font-size: 13px !important;
        }
        #rsvp.section.dark div:has(> button[aria-label="Confirmar asistencia"]) {
          flex-direction: row !important;
          gap: 12px !important;
        }

        .desktop-stage .tpl .d-rsvp-grid {
          display: flex !important;
          flex-direction: column !important;
          gap: 24px !important;
          align-items: flex-start !important;
        }
        .desktop-stage .tpl .d-rsvp-grid > div {
          width: 100% !important;
        }

        #rsvp.section.dark .t-detail {
          background-color: transparent !important;
          border: none !important;
          border-radius: 0 !important;
          padding: 16px 0 0 0 !important;
          border-top: 1px solid color-mix(in srgb, var(--luzluna-ink) 12%, transparent) !important;
          text-align: left !important;
          box-shadow: none !important;
          width: 100% !important;
        }
        #rsvp.section.dark .t-detail h4 {
          color: color-mix(in srgb, var(--luzluna-ink) 55%, transparent) !important;
          font-family: var(--font-body-custom, var(--font-inter)), sans-serif !important;
          text-transform: uppercase !important;
          font-size: 10px !important;
          letter-spacing: 0.05em !important;
          font-weight: 600 !important;
          opacity: 1 !important;
          margin-bottom: 6px !important;
        }
        #rsvp.section.dark .t-detail p {
          color: color-mix(in srgb, var(--luzluna-ink) 75%, transparent) !important;
          font-size: 13px !important;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        #rsvp.section.dark .t-detail p b {
          font-size: 1.1rem !important;
          color: var(--luzluna-ink) !important;
          font-weight: 600 !important;
        }
        #rsvp.section.dark .t-detail span {
          color: color-mix(in srgb, var(--luzluna-ink) 45%, transparent) !important;
          font-size: 12px !important;
        }

        #songs.d-sec.dark {
          background-color: var(--t-surface) !important;
          padding: 80px 24px !important;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        #songs.d-sec.dark > p.t-kicker,
        #songs.d-sec.dark > form,
        #songs.d-sec.dark > div {
          width: 100% !important;
          max-width: 340px !important;
          text-align: left !important;
        }
        @media (min-width: 640px) {
          #songs.d-sec.dark > p.t-kicker,
          #songs.d-sec.dark > form,
          #songs.d-sec.dark > div {
            max-width: 36rem !important;
          }
        }
        #songs.d-sec.dark .t-kicker {
          font-family: var(--font-body-custom, var(--font-inter)), sans-serif !important;
          color: var(--t-acc) !important;
          font-size: 11px !important;
          font-weight: 600 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.2em !important;
          margin-bottom: 30px !important;
          display: block !important;
        }
        #songs.d-sec.dark h2 {
          display: none !important;
        }
        #songs.d-sec.dark .mod-input-row {
          display: flex !important;
          flex-direction: column !important;
          gap: 0 !important;
          width: 100% !important;
        }
        .desktop-stage .d-foot {
          background-color: var(--t-bg) !important;
          color: var(--luzluna-ink) !important;
          padding: 24px 24px 38px 24px !important;
          text-align: center;
        }
        .desktop-stage .d-foot .mono {
          color: var(--t-acc) !important;
          font-family: var(--font-title, var(--font-cormorant)), serif !important;
          font-size: 20px !important;
          margin-bottom: 8px !important;
        }

        #banco .t-kicker {
          text-align: left !important;
        }
        #banco .copy-btn {
          background-color: var(--t-acc) !important;
          color: var(--t-bg) !important;
          border: none !important;
          border-radius: 0 !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
        }
        #banco .copy-btn.copied {
          background-color: var(--luzluna-ink) !important;
          color: var(--t-bg) !important;
        }

        .desktop-stage .bottom-nav {
          position: fixed !important;
          bottom: 24px !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          display: flex !important;
          justify-content: space-between !important;
          background: color-mix(in srgb, black 90%, var(--t-bg)) !important;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5) !important;
          backdrop-filter: blur(12px) !important;
          width: calc(100% - 32px) !important;
          max-width: 360px !important;
          padding: 14px 10px !important;
          border-radius: 999px !important;
          z-index: 999999 !important;
        }
        .desktop-stage .bottom-nav a {
          color: var(--luzluna-ink) !important;
          opacity: 0.6 !important;
        }
        .desktop-stage .bottom-nav a[aria-current="true"] {
          opacity: 1 !important;
          color: var(--t-acc) !important;
        }
      `}</style>

      {/* PORTADA / WELCOME OVERLAY */}
      {!isCoverOpen && (
        <div
          ref={coverRootRef}
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100dvh', zIndex: 99999, backgroundColor: 'var(--t-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: '25vh', overflow: 'hidden', ...getTypographyCssVars(invitation.fontTitle as string, invitation.fontBody as string) }}
          className={isClosingCover ? "acp-cover-exit" : "transition-all duration-1000 animate-in fade-in"}
        >
          {portadaFondoAnimado && (
            <div className="acp-mobile-only">
              <AnimatedCoverPhoto
                photoSrc={portadaImagenFondoDesktopRaw as string}
                effect="shimmer"
                tint={false}
                scrimColorRgb="61,53,80"
              />
            </div>
          )}
          <div className={portadaFondoAnimado ? "acp-desktop-only" : undefined}>
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: 'radial-gradient(50% 40% at 15% 15%, color-mix(in srgb, var(--t-acc) 16%, transparent), transparent), radial-gradient(45% 40% at 85% 80%, color-mix(in srgb, var(--t-acc2) 20%, transparent), transparent)',
              backgroundSize: '160% 160%',
              animation: 'luzluna-meshDrift 14s ease-in-out infinite',
            }} />
            <div style={{
              position: 'absolute', width: 220, height: 220, borderRadius: '50%',
              background: 'radial-gradient(circle, color-mix(in srgb, var(--t-acc) 18%, transparent), transparent 70%)',
              top: '18%', left: '50%', transform: 'translateX(-50%)',
              animation: 'luzluna-glowPulse 5s ease-in-out infinite', pointerEvents: 'none',
            }} />
          </div>

          <IconMoon className="luzluna-doodle opacity-0 absolute" style={{ width: 30, height: 30, top: '9%', left: '10%', color: 'color-mix(in srgb, var(--t-acc) 60%, transparent)' }} />
          <IconConstellation className="luzluna-doodle opacity-0 absolute" style={{ width: 36, height: 16, top: '15%', right: '9%', color: 'color-mix(in srgb, var(--t-acc2) 55%, transparent)' }} />
          <IconStarSpark className="luzluna-doodle opacity-0 absolute" style={{ width: 16, height: 16, bottom: '22%', left: '14%', color: 'color-mix(in srgb, var(--t-acc) 55%, transparent)' }} />
          <IconCloudWisp className="luzluna-doodle opacity-0 absolute" style={{ width: 26, height: 12, bottom: '26%', right: '16%', color: 'color-mix(in srgb, var(--t-acc2) 45%, transparent)' }} />

          {portadaFondoFallback && (
            <CoverFallbackBg photoSrc={portadaFondoFallback} />
          )}
          <div style={{ textAlign: 'center', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', position: 'relative' }}>


            <h2 className={`text-4xl sm:text-5xl font-light tracking-wide leading-relaxed${portadaFondoAnimado ? " luzluna-cover-text" : ""}`} style={{ fontFamily: 'var(--font-title, var(--font-cormorant)), serif', color: portadaFondoAnimado ? undefined : 'var(--luzluna-ink)' }}>
              {guestNameDisplay}
            </h2>

            {Boolean(activeDressCode) && (
              <p className={`text-sm font-medium tracking-wide uppercase${portadaFondoAnimado ? " luzluna-cover-text-muted" : ""}`} style={{ fontFamily: "var(--font-body-custom, var(--font-inter)), sans-serif", letterSpacing: "0.2em", opacity: 0.8, color: portadaFondoAnimado ? undefined : 'var(--t-muted)' }}>
                Dress code: {activeDressCode}
              </p>
            )}

            <button
              type="button"
              onClick={openInvitation}
              className="inline-block font-medium text-xs tracking-[0.2em] px-10 py-3 transition-colors duration-500 cursor-pointer"
              style={{
                fontFamily: 'var(--font-body-custom, var(--font-inter)), sans-serif', border: '1px solid var(--t-acc)', color: 'var(--t-acc)',
                background: 'color-mix(in srgb, var(--t-acc) 10%, transparent)', backdropFilter: 'blur(6px)',
                marginTop: '1rem',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--t-acc)'; e.currentTarget.style.color = 'var(--t-bg)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'color-mix(in srgb, var(--t-acc) 10%, transparent)'; e.currentTarget.style.color = 'var(--t-acc)'; }}
            >
              ABRIR INVITACIÓN
            </button>

          </div>

          <style jsx>{`
            @keyframes luzluna-meshDrift { 0%, 100% { background-position: 0% 0%, 100% 100%; } 50% { background-position: 30% 20%, 70% 80%; } }
            @keyframes luzluna-glowPulse { 0%, 100% { opacity: .5; } 50% { opacity: 1; } }
            @keyframes luzluna-lineExpand { 0% { width: 0; } 100% { width: 40px; } }
            .luzluna-cover-text { color: #F7F3FC; }
            .luzluna-cover-text-muted { color: rgba(247,243,252,0.75); }
            @media (min-width: 768px) {
              .luzluna-cover-text { color: var(--luzluna-ink); }
              .luzluna-cover-text-muted { color: var(--t-muted); }
            }
          `}</style>
          <style>{COVER_EXIT_STYLE}{COVER_RESPONSIVE_STYLE}{COVER_FALLBACK_STYLE}</style>
        </div>
      )}

      {/* Sticky Ticket Bubble via Portal */}
      {mounted && isPersonalized && guest && isCoverOpen && createPortal(
        <div
          onClick={() => setIsTicketMaximized(!isTicketMaximized)}
          className="fixed top-3 left-1/2 -translate-x-1/2 z-[99999] transition-all duration-500 cursor-pointer overflow-hidden shadow-md"
          style={{
            // El portal a document.body rompe la herencia de las CSS vars
            // del wrapper (mismo bug ya documentado para BottomNavPill,
            // GUIA_TECNICA_PLANTILLAS.md) -- se redeclaran acá con los
            // mismos hex del tema para que "Pase Especial" resuelva bien.
            "--t-acc": "#C9B8E8",
            "--t-bg": "#F7F3FC",
            "--t-muted": "#8579a0",
            "--luzluna-ink": "#3D3550",
            border: '1px solid color-mix(in srgb, var(--t-acc) 45%, transparent)',
            backdropFilter: 'blur(8px)',
            ...(isTicketMaximized
              ? { background: 'color-mix(in srgb, var(--t-bg) 95%, transparent)', borderRadius: 999, width: '90%', maxWidth: 384, padding: '10px 20px' }
              : { background: 'color-mix(in srgb, black 90%, var(--t-bg))', borderRadius: 999, padding: '8px 20px' }),
          } as unknown as React.CSSProperties}
        >
          {isTicketMaximized ? (
            <div className="flex items-center justify-between w-full animate-in fade-in duration-300">
              <div className="flex flex-col text-left">
                <span className="text-[8px] font-semibold uppercase tracking-[0.2em] leading-none mb-1" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))", color: 'var(--t-acc)' }}>Pase Especial</span>
                <span className="font-bold text-sm leading-none" style={{ fontFamily: 'var(--font-cormorant), serif', color: 'var(--luzluna-ink)' }}>{guest.name}</span>
              </div>
              <div className="flex flex-col items-end pl-3" style={{ borderLeft: '1px solid color-mix(in srgb, var(--t-acc) 25%, transparent)' }}>
                <span className="font-bold text-sm leading-none" style={{ color: 'var(--luzluna-ink)' }}>{guest.expectedCount}</span>
                <span className="text-[8px] uppercase tracking-wider leading-none mt-1" style={{ color: 'var(--t-muted)' }}>{guest.expectedCount === 1 ? 'Lugar' : 'Lugares'}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 animate-in fade-in duration-300">
              <Ticket className="w-4 h-4" style={{ color: 'var(--t-acc)' }} />
              <span className="text-[10px] font-semibold tracking-wider uppercase" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))", color: 'var(--luzluna-ink)' }}>Pase</span>
            </div>
          )}
        </div>,
        document.body
      )}

      {mounted && musicaHabilitada && isCoverOpen && createPortal(
        <MusicToggleButton
          isPlaying={isMusicPlaying}
          onToggle={toggleMusic}
          className="fixed top-3 right-3 z-[99998]"
        />,
        document.body
      )}

      <div className="desktop-stage" data-theme={theme} style={{
        ...getTypographyCssVars(invitation.fontTitle as string, invitation.fontBody as string),
        "--t-acc": "#C9B8E8",
        "--t-acc2": "#E8C9DE",
        "--c-accent": "#C9B8E8",
        "--t-bg": "#F7F3FC",
        "--t-surface": "#EFE7F8",
        "--t-muted": "#8579a0",
        "--luzluna-ink": "#3D3550",
        "--chic-ink": "#3D3550",
      } as React.CSSProperties}>
      <aside className="d-left hide-mobile">
        <div
          className="hero-photo"
          style={heroBgDesktop ? {
            backgroundImage: `url(${heroBgDesktop})`,
            backgroundSize: "cover",
            backgroundPosition: `${Number(invitation.portadaImagenDesktopPosX ?? 50)}% ${Number(invitation.portadaImagenDesktopPosY ?? 50)}%`,
            backgroundRepeat: "no-repeat"
          } : undefined}
        />
        <div className="d-left-top drop-shadow-md">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white mb-6 drop-shadow-sm" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>{eyebrow}</p>
          <h1 className="text-5xl font-light text-white leading-tight mb-2 drop-shadow-md" style={{ fontFamily: 'var(--font-title, var(--font-cormorant)), serif' }}>
            {em ? (
              <>
                <span className="block">{title.slice(0, title.indexOf(em)).trim()}</span>
                <span className="block"><em style={{ fontFamily: 'var(--font-cormorant), serif', fontStyle: 'italic', color: 'white' }}>&amp;</em> {em.replace('& ', '').trim()}</span>
              </>
            ) : (
              <span className="block">{title}</span>
            )}
          </h1>
          <div style={{ width: 40, height: 2, background: 'var(--t-acc)', margin: '6px 0 14px', animation: 'luzluna-lineExpand 1.2s ease-out' }} />
          <p className="text-sm font-medium text-white/90 tracking-wide drop-shadow-sm" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>{fechaStr}{ciudad ? ` · ${ciudad}` : ""}{lugarNombre ? ` · ${lugarNombre}` : ""}</p>
          {Boolean(activeDressCode) && (
            <p className="text-xs font-semibold text-white/80 tracking-widest uppercase mt-4 drop-shadow-sm" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
              Dress code: {activeDressCode}
            </p>
          )}
        </div>

        <nav className="d-nav">
          {navSections.map((sec, i) => (
            <a key={sec.id} href={`#${sec.id}`}>
              <b>0{i + 1}</b> {sec.label}
            </a>
          ))}
        </nav>
      </aside>

      <div className="d-right tpl">
        <div className="hide-desktop w-full flex flex-col min-h-[100dvh]" style={{ background: 'var(--t-bg)' }}>
          <div className="px-8 pt-16 pb-12 text-left z-10 relative" style={{ background: 'var(--t-bg)' }}>
            <IconMoon className="luzluna-scroll-doodle opacity-0 absolute" style={{ width: 24, height: 24, top: 14, right: 28, color: 'color-mix(in srgb, var(--t-acc) 50%, transparent)' }} />
            <IconStarSpark className="luzluna-scroll-doodle opacity-0 absolute" style={{ width: 14, height: 14, top: 62, right: 62, color: 'color-mix(in srgb, var(--t-acc2) 50%, transparent)' }} />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-6" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))", color: 'var(--t-acc)' }}>
              {eyebrow}
            </p>
            <h1 className="text-[4rem] font-light leading-[1.0] mb-3" style={{ fontFamily: 'var(--font-title, var(--font-cormorant)), serif', color: 'var(--luzluna-ink)' }}>
              {em ? (
                <>
                  <span className="block">{title.slice(0, title.indexOf(em)).trim()}</span>
                  <span className="block"><em style={{ fontFamily: 'var(--font-cormorant), serif', fontStyle: 'italic', color: 'var(--t-acc)' }}>&amp;</em> {em.replace('& ', '').trim()}</span>
                </>
              ) : (
                <span className="block">{title}</span>
              )}
            </h1>
            <div style={{ width: 40, height: 2, background: 'var(--t-acc)', margin: '0 0 20px', animation: 'luzluna-lineExpand 1.2s ease-out' }} />
            <p className="text-sm font-medium tracking-wide" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))", color: 'var(--t-muted)' }}>
              {fechaStr}{lugarNombre ? ` · ${lugarNombre}` : ""}{ciudad ? ` — ${ciudad}` : ""}
            </p>
            {Boolean(activeDressCode) && (
              <p className="text-xs font-semibold tracking-widest uppercase mt-4" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))", color: 'var(--t-acc)' }}>
                Dress code: {activeDressCode}
              </p>
            )}
          </div>

          {/* Image Container -- marco de halo (perímetro fino completo) +
              luna asomando de una esquina y constelación en la opuesta +
              resplandor de luna con estrellas titilando, ligados al scroll
              (ver useEffect de heroPhotoRef). */}
          <div ref={heroPhotoRef} className="flex-1 w-full relative overflow-hidden">
            <div className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none z-10" style={{ background: 'linear-gradient(to bottom, transparent 0%, var(--t-bg) 100%)' }} />
            <div
              className="absolute inset-0 w-full h-full"
              style={heroBgMobile ? {
                backgroundImage: `url(${heroBgMobile})`,
                backgroundSize: "cover",
                backgroundPosition: `${Number(invitation.portadaImagenPosX ?? 50)}% ${Number(invitation.portadaImagenPosY ?? 50)}%`,
                backgroundRepeat: "no-repeat"
              } : { backgroundColor: 'var(--t-surface)' }}
            />
            {/* Marco de halo: perímetro fino completo */}
            <div className="absolute inset-3 pointer-events-none z-20" aria-hidden="true">
              <div className="absolute inset-0" style={{ border: "1px solid color-mix(in srgb, var(--t-acc) 65%, transparent)" }} />
              <IconMoon style={{ position: "absolute", top: -10, left: -8, width: 26, height: 26, color: "var(--t-acc)" }} />
              <IconConstellation style={{ position: "absolute", bottom: -6, right: -10, width: 30, height: 14, color: "var(--t-acc2)" }} />
            </div>
            {/* Resplandor de luna */}
            <div ref={moonGlowRef} className="pointer-events-none z-20" style={{
              position: 'absolute', width: 130, height: 130, borderRadius: '50%',
              background: 'radial-gradient(circle, color-mix(in srgb, var(--t-acc) 55%, white) 0%, color-mix(in srgb, var(--t-acc2) 35%, transparent) 45%, transparent 72%)',
              opacity: 0, transform: 'translate(-50%,-50%)',
            }} />
            {/* Estrellas titilando */}
            <div ref={twinkle1Ref} className="pointer-events-none z-20" style={{ position: 'absolute', top: '20%', left: '25%', width: 8, height: 8, borderRadius: '50%', background: 'white', opacity: 0, boxShadow: '0 0 6px 1px rgba(255,255,255,0.8)' }} />
            <div ref={twinkle2Ref} className="pointer-events-none z-20" style={{ position: 'absolute', top: '35%', right: '20%', width: 6, height: 6, borderRadius: '50%', background: 'white', opacity: 0, boxShadow: '0 0 5px 1px rgba(255,255,255,0.8)' }} />
            <div ref={twinkle3Ref} className="pointer-events-none z-20" style={{ position: 'absolute', top: '60%', left: '15%', width: 5, height: 5, borderRadius: '50%', background: 'white', opacity: 0, boxShadow: '0 0 4px 1px rgba(255,255,255,0.7)' }} />
            <div ref={twinkle4Ref} className="pointer-events-none z-20" style={{ position: 'absolute', top: '70%', right: '30%', width: 7, height: 7, borderRadius: '50%', background: 'white', opacity: 0, boxShadow: '0 0 6px 1px rgba(255,255,255,0.8)' }} />
          </div>
        </div>

        {/* Divisor doodle: luna flanqueada por líneas finas */}

        <SaveTheDate
          headerIcon={tipo === "QUINCE_ANOS" ? "crown" : tipo === "CASAMIENTO" ? "rings" : undefined}
          eventName={title || String(invitation.nombreEvento ?? "")}
          targetDate={fechaEvento}
          location={[lugarNombre, direccion].filter(Boolean).join(", ")}
        />

        {(invitation.contadorHabilitado ?? true) ? (
          <Countdown
            targetDate={fechaEvento}
            countdownStyle={invitation.countdownStyle as any}
            kicker="Cuenta regresiva"
            title={tipo === "CASAMIENTO" ? "Faltan poquitos días" : "La cuenta ya empezó"}
            dark
          />
        ) : null}

        {(Boolean(invitation.frasePersonalizadaHabilitada) && Boolean(invitation.frasePersonalizadaTexto)) ? (
          <SectionWrapper id="quote" delay={100} className="w-full py-24 px-6 md:px-12 flex items-center justify-center" style={{ background: "linear-gradient(160deg, color-mix(in srgb, var(--t-acc2) 12%, transparent), transparent 70%), var(--t-surface)" }}>
            <div className="max-w-2xl mx-auto text-center">
              <div className="flex justify-center mb-4">
                <DrawLucideIcon icon={BookOpen} size={46} color="var(--t-acc)" strokeWidth={1.5} />
              </div>
              <IconCloudWisp className="luzluna-scroll-doodle opacity-0 mx-auto mb-6" style={{ width: 28, height: 14, color: 'var(--t-acc)' }} />
              <TypewriterText
                text={`"${String(invitation.frasePersonalizadaTexto)}"`}
                className="text-2xl md:text-3xl leading-relaxed tracking-wide"
                style={{ fontFamily: 'var(--font-cormorant), serif', fontStyle: 'italic', margin: 0, fontWeight: 500, color: 'var(--luzluna-ink)' }}
              />
            </div>
          </SectionWrapper>
        ) : null}

        <SectionWrapper id="details" delay={150} className="w-full py-20 px-6 md:px-12" style={{ background: 'var(--t-bg)' }}>
          <div className="w-full max-w-[340px] sm:max-w-xl mx-auto text-left">
            <div className="flex justify-center mb-4">
              <DrawLucideIcon icon={CalendarDays} size={46} color="var(--t-acc)" strokeWidth={1.5} />
            </div>
            <p className="t-kicker mb-8 flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))", color: 'var(--t-acc)' }}>
              CUÁNDO Y DÓNDE
            </p>

            {Boolean(invitation.ceremoniaHabilitada) && (
              <div className="p-6 sm:p-8 mb-6 shadow-sm" style={{ background: 'color-mix(in srgb, white 4%, transparent)', borderLeft: '2px solid var(--t-acc)' }}>
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] block mb-3" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))", color: 'var(--t-muted)' }}>
                    {String(invitation.ceremoniaTitulo || "CEREMONIA")}
                  </span>
                  {Boolean(invitation.ceremoniaNombre) && (
                    <h4 className="text-2xl sm:text-3xl font-light mb-3" style={{ fontFamily: 'var(--font-cormorant), serif', fontStyle: 'italic', color: 'var(--luzluna-ink)' }}>
                      {String(invitation.ceremoniaNombre)}
                    </h4>
                  )}
                  {Boolean(invitation.ceremoniaHora) && (
                    <p className="text-sm sm:text-base mb-1" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))", color: 'var(--t-muted)' }}>
                      {String(invitation.ceremoniaHora)} hs
                    </p>
                  )}
                  {Boolean(invitation.ceremoniaDireccion) && (
                    <p className="text-sm sm:text-base mb-4" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))", color: 'var(--t-muted)' }}>
                      {String(invitation.ceremoniaDireccion)}
                    </p>
                  )}
                  {Boolean(invitation.ceremoniaMapUrl) && (
                    <a href={String(invitation.ceremoniaMapUrl)} target="_blank" rel="noopener noreferrer" className="inline-block mt-1 text-xs font-semibold tracking-wider transition-colors" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))", color: 'var(--t-acc)' }}>
                      Ver mapa ceremonia ↗
                    </a>
                  )}
                </div>
              </div>
            )}

            {(lugarNombre || direccion) && (
              <div className="p-6 sm:p-8 mb-10 shadow-sm" style={{ background: 'color-mix(in srgb, white 4%, transparent)', borderLeft: '2px solid var(--t-acc)' }}>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] block mb-3" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))", color: 'var(--t-muted)' }}>
                  FIESTA / SALÓN
                </span>
                {lugarNombre && (
                  <h4 className="text-2xl sm:text-3xl font-light mb-3" style={{ fontFamily: 'var(--font-cormorant), serif', fontStyle: 'italic', color: 'var(--luzluna-ink)' }}>
                    {lugarNombre}
                  </h4>
                )}
                {hora && (
                  <p className="text-sm sm:text-base mb-1" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))", color: 'var(--t-muted)' }}>
                    {hora} hs
                  </p>
                )}
                {direccion && (
                  <p className="text-sm sm:text-base mb-4" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))", color: 'var(--t-muted)' }}>
                    {direccion}
                  </p>
                )}
                {mapUrl && (
                  <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-1 text-xs font-semibold tracking-wider transition-colors" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))", color: 'var(--t-acc)' }}>
                    Ver mapa fiesta ↗
                  </a>
                )}
              </div>
            )}

            {cronograma.length > 0 && (
              <div className="mt-16" id="schedule">
                <div className="flex justify-center mb-4">
                  <DrawLucideIcon icon={Clock} size={46} color="var(--t-acc)" strokeWidth={1.5} />
                </div>
                <p className="t-kicker mb-6 flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))", color: 'var(--t-acc)' }}>
                  CRONOGRAMA
                </p>
                <div className="flex flex-col w-full">
                  {cronograma.map((item, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center py-4 border-b last:border-b-0" style={{ borderColor: 'color-mix(in srgb, var(--t-acc) 12%, transparent)' }}>
                      {item.time && (
                        <span className="text-sm sm:text-base font-medium w-24 flex-shrink-0 mb-1 sm:mb-0" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))", color: 'var(--t-muted)' }}>
                          {item.time}
                        </span>
                      )}
                      <span className="text-[1.2rem] sm:text-[1.3rem] font-light" style={{ fontFamily: 'var(--font-cormorant), serif', fontStyle: 'italic', color: 'var(--luzluna-ink)' }}>
                        {item.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SectionWrapper>

        {(invitation.galeriaPrincipalHabilitada ?? false) && allPhotos.length > 0 && (
          <SectionWrapper id="album" delay={200} className="w-full py-20 overflow-hidden" style={{ background: 'var(--t-surface)' }}>
            <div className="w-full max-w-[340px] sm:max-w-xl mx-auto text-left">
              <div className="flex justify-center mb-4">
                <DrawLucideIcon icon={Camera} size={46} color="var(--t-acc)" strokeWidth={1.5} />
              </div>
              <p className="t-kicker mb-10 flex items-center gap-2">
                ÁLBUM
              </p>
            </div>
            <div className="w-full">
              <Album photos={allPhotos} hideHeader albumStyle={invitation.albumStyle as any} />
            </div>
          </SectionWrapper>
        )}

        {mapUrl && (
          <section id="location" style={{ overflow: "hidden" }}>
            <div className="flex justify-center py-6" style={{ background: "var(--t-bg, #0F0E13)" }}>
              <DrawLucideIcon icon={MapPin} size={46} color="var(--t-acc)" strokeWidth={1.5} />
            </div>
            <div style={{ height: "220px", overflow: "hidden" }}>
            {embedMapUrl ? (
              <iframe
                src={embedMapUrl}
                width="100%"
                height="220"
                style={{ border: 0, display: "block" }}
                loading="lazy"
                title={`Mapa: ${lugarNombre}`}
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "220px", width: "100%", padding: "0 24px", textAlign: "center", color: "var(--t-acc)", fontSize: 13, fontWeight: 600, textDecoration: "underline", textUnderlineOffset: "3px" }}
              >
                No pudimos mostrar el mapa acá — tocá para verlo en Google Maps
              </a>
            )}
            </div>
          </section>
        )}

        {rsvpEnabled && (
          <RSVPWizardV2
            invitationId={String(invitation.id ?? "")}
            guestToken={guest?.uniqueToken}
            guestName={guest?.name}
            maxGuests={guest?.expectedCount ?? 6}
            maxAdults={guest?.expectedAdults ?? undefined}
            maxTeens={(guest as any)?.expectedTeens ?? undefined}
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
            initialAttendingTeens={(guest as any)?.attendingTeens ?? undefined}
            initialAttendingChildren={guest?.attendingChildren ?? undefined}
            initialPaymentStatus={guestPayStatus}
            isExempt={guest?.isExempt ?? false}
            precioNino={invitation.precioNino ? Number(invitation.precioNino) : undefined}
            precioAdolescente={invitation.precioAdolescente ? Number(invitation.precioAdolescente) : undefined}
            is15={invitation.tipo === "QUINCE_ANOS"}
          />
        )}

        {showGiftSection && (
          <SectionWrapper id="banco" delay={200} className="w-full py-20 px-6 md:px-12 overflow-hidden" style={{ background: 'var(--t-surface)' }}>
            <div className="w-full max-w-[340px] sm:max-w-xl mx-auto text-left">
                <div className="flex justify-center mb-4">
                  <DrawLucideIcon icon={Landmark} size={46} color="var(--t-acc)" strokeWidth={1.5} />
                </div>
                <p className="t-kicker mb-10 flex items-center gap-2" style={{ color: 'var(--t-acc)' }}>
                  DATOS BANCARIOS DEL EVENTO
                </p>

                <div className="grid grid-cols-1 gap-6 text-left w-full mt-4 items-stretch">
                  {pagoTarjetaHabilitado && (
                    <BankDetailsCard
                      icon={<CreditCard className="w-5 h-5" strokeWidth={1.5} />}
                      data={{
                        titulo: String((invitation as any).pagoTarjetaTitulo || "Pago de Tarjetas / Pases"),
                        mensaje: String((invitation as any).pagoTarjetaMensaje || ""),
                        banco: String((invitation as any).pagoTarjetaBanco || ""),
                        cbu: String((invitation as any).pagoTarjetaCbu || ""),
                        alias: String((invitation as any).pagoTarjetaAlias || ""),
                        titular: String((invitation as any).pagoTarjetaTitular || ""),
                      }}
                      accentColor="var(--t-acc)"
                      cardBg="var(--t-surface)"
                      textPrimary="var(--luzluna-ink)"
                      textSecondary="var(--t-muted)"
                      InfoRow={InfoRow}
                      CopyField={CopyField}
                    />
                  )}

                  {regaloHabilitado && (
                    <BankDetailsCard
                      icon={<Gift className="w-5 h-5" strokeWidth={1.5} />}
                      data={{
                        titulo: String((invitation as any).regaloTitulo || "Regalos del Evento"),
                        mensaje: String((invitation as any).regaloMensaje || ""),
                        banco: String((invitation as any).regaloBanco || ""),
                        cbu: String((invitation as any).regaloCbu || ""),
                        alias: String((invitation as any).regaloAlias || ""),
                        titular: String((invitation as any).regaloTitular || ""),
                      }}
                      accentColor="var(--t-acc)"
                      cardBg="var(--t-surface)"
                      textPrimary="var(--luzluna-ink)"
                      textSecondary="var(--t-muted)"
                      InfoRow={InfoRow}
                      CopyField={CopyField}
                    />
                  )}
                </div>
                </div>
          </SectionWrapper>
        )}

        {triviaHabilitada && triviaPreguntas.length > 0 && (
          <SectionWrapper id="quiz" delay={300} className="w-full py-20 px-6 md:px-12" style={{ background: "linear-gradient(160deg, color-mix(in srgb, var(--t-acc2) 14%, transparent), transparent 70%), var(--t-bg)" }}>
            <div className="w-full max-w-[340px] sm:max-w-xl mx-auto text-left">
              <div className="flex justify-center mb-4">
                <DrawLucideIcon icon={HelpCircle} size={46} color="var(--t-acc)" strokeWidth={1.5} />
              </div>
              <p className="t-kicker mb-8 flex items-center gap-2">
                {String(invitation.triviaTitulo || "¿CUÁNTO SABÉS?")}
              </p>
              <ProgressiveQuiz
                preguntas={triviaPreguntas}
                invitationId={String(invitation.id ?? "")}
                guestToken={guest?.uniqueToken}
                guestName={guest?.name}
                tipo={tipo}
              />
            </div>
          </SectionWrapper>
        )}

        {songsEnabled && (
          <SongSuggestion
            invitationId={String(invitation.id ?? "")}
            guestToken={guest?.uniqueToken}
            guestName={guest?.name ?? "Invitado"}
            kicker="SUGERÍ UNA CANCIÓN"
            hideHeader
            dark
            showPublicList
            variant="moderno"
          />
        )}

        {musicaHabilitada && musicAudioElement}

        <div className="w-full flex items-center justify-center gap-2 py-6" style={{ background: 'var(--t-bg)' }} aria-hidden="true">
          <div style={{ width: 28, height: 1, background: 'linear-gradient(90deg, transparent, var(--t-acc), transparent)' }} />
          <IconCloudWisp className="luzluna-scroll-doodle opacity-0" style={{ width: 20, height: 10, color: 'var(--t-acc2)' }} />
          <div style={{ width: 28, height: 1, background: 'linear-gradient(90deg, transparent, var(--t-acc), transparent)' }} />
        </div>

        <LogoFooterCredit bgColor="var(--t-bg)" textColor="var(--chic-ink, #3D3550)" />
        </div>
      </div>

      {isCoverOpen && <BottomNavPill sections={navSections} variant="moderno" accentColor="#C9B8E8" surfaceColor="#EFE7F8" inactiveColor="#3D3550" solid />}
      </div>
  );
}
