/**
 * PetalosTemplateVinoVibrante.tsx
 * Pack "Cinemático" (mockup/nuevo/Plantillas 15 Años Cinemático.dc.html +
 * Plantillas Casamiento Cinemático.dc.html) — sistema "Pétalos": romántico
 * floral, tema claro, tipografía Playfair Display (display) + Nunito
 * (texto). Ornamento del mockup (seal/lace según variante): acá unificado
 * como marco de perímetro fino completo + un pequeño ramo floral (flor +
 * pétalos) asomando de dos esquinas opuestas -- distinto del marco de
 * esquinas dobles de SedaTemplate y del marco+doodles de ChicTemplate.
 * Efecto de foto propio: "pétalos a la deriva" -- 3 pétalos que caen/rotan
 * suavemente sobre la foto de portada a medida que se hace scroll, en vez
 * del lens-flare de Chic o el brillo de seda de SedaTemplate.
 * Derivado de ModernoTemplate.tsx (misma arquitectura/props/componentes
 * compartidos: Countdown, RSVPWizardV2, BottomNavPill, SongSuggestion,
 * AlbumCarousel, SectionWrapper, ProgressiveQuiz local).
 *
 * Paleta: TODO el theming de color pasa por CSS custom properties definidas
 * en los DOS wrappers (mobile + desktop-stage, ver guía sección 3.2) -- cero
 * hex hardcodeado salpicado en el JSX de secciones/tarjetas/texto, para que
 * el script generador de variantes (scratch-gen-petalos-variants.js) solo
 * tenga que reemplazar el bloque de 9 valores del wrapper (evita la trampa
 * de "inversión mecánica" de la sección 3.5 de la guía). Paleta base
 * (Emilia · Pétalos Rojo Vibrante, tema claro):
 *   --t-bg #2B0E14 · --t-surface #3B131B · --petalos-ink #F6E4E6
 *   --t-muted #C99AA1 · --t-acc #8C1B2A (rojo vibrante) · --t-acc2 #E23B4E (rojo profundo)
 *
 * Gating: QUINCE_ANOS + CASAMIENTO (igual patrón dual que NeonTemplate con
 * QUINCE_ANOS+CUMPLEANOS). El gating real vive en TemplatePreviewModal.tsx,
 * este archivo no valida nada por su cuenta.
 */
"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Playfair_Display, Nunito } from "next/font/google";
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

// Doodles de trazo fino "romántico floral" -- flor de 5 pétalos, pétalo
// suelto, enredadera con hojas y capullo de corazón. Neutros para 15
// años/casamiento.
const IconInfo  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3} aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><path d="M12 15.5v-4M12 8.2h.01"/></svg>;
const IconCheck = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3} aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>;
const IconMusic = ({ className, style }: { className?: string; style?: React.CSSProperties } = {}) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3} className={className} style={style} aria-hidden="true"><path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="2.6"/><circle cx="17" cy="16" r="2.6"/></svg>;
const IconMap   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3} aria-hidden="true"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
const IconGift  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3} aria-hidden="true"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/></svg>;
const IconQuiz  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3} aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>;
// Flor de 5 pétalos -- pétalos como óvalos superpuestos alrededor de un
// centro, trazo fino, motivo principal del sistema "Pétalos".
const IconBlossom = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.05} className={className} style={style} aria-hidden="true">
    <ellipse cx="12" cy="6.2" rx="3.1" ry="4.4" />
    <ellipse cx="17.2" cy="9.6" rx="3.1" ry="4.4" transform="rotate(72 17.2 9.6)" />
    <ellipse cx="15.3" cy="16.4" rx="3.1" ry="4.4" transform="rotate(144 15.3 16.4)" />
    <ellipse cx="8.7" cy="16.4" rx="3.1" ry="4.4" transform="rotate(216 8.7 16.4)" />
    <ellipse cx="6.8" cy="9.6" rx="3.1" ry="4.4" transform="rotate(288 6.8 9.6)" />
    <circle cx="12" cy="12" r="1.6" strokeWidth={0.85} />
  </svg>
);
// Pétalo suelto -- forma de almendra con una línea de vena central, usado
// suelto como acento chico y como base del efecto "pétalos a la deriva".
const IconPetal = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 16 24" fill="currentColor" stroke="none" className={className} style={style} aria-hidden="true">
    <path d="M8 1c5 5 6 12 0 22C2 13 3 6 8 1Z" />
    <path d="M8 4v16" stroke="currentColor" strokeWidth={0.8} strokeLinecap="round" opacity={0.35} />
  </svg>
);
// Enredadera -- tallo curvo con 3 hojitas alternadas, separador de secciones
// y detalle del marco floral.
const IconVine = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 30 16" fill="none" stroke="currentColor" strokeWidth={1.05} className={className} style={style} aria-hidden="true">
    <path d="M1 12c8 4 20 4 28-8" />
    <path d="M8 10.6c-.3-2 .8-3.3 2.8-3.4" strokeWidth={0.8} />
    <path d="M15.5 7.4c-.2-2.1 1-3.4 3-3.4" strokeWidth={0.8} />
    <path d="M22 3.6c0-1.8 1.1-2.9 2.9-2.8" strokeWidth={0.8} />
  </svg>
);
// Capullo-corazón -- un pequeño capullo floral con silueta de corazón,
// acento romántico neutro (funciona para XV o casamiento).
const IconHeartBud = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 26" fill="none" stroke="currentColor" strokeWidth={1.15} className={className} style={style} aria-hidden="true">
    <path d="M12 20.5C6 16.8 2.5 13 2.5 9a5 5 0 0 1 9.5-2.2A5 5 0 0 1 21.5 9c0 4-3.5 7.8-9.5 11.5Z" />
    <path d="M8.5 8.6a3 3 0 0 1 3-2" strokeWidth={0.75} opacity={0.7} />
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

// Tipografía exacta del mockup Pétalos (Playfair Display + Nunito), escopeada
// solo a este componente vía CSS var override en el wrapper raíz.
const petalosPlayfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
  variable: "--petalos-playfair",
  display: "swap",
});
const petalosNunito = Nunito({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--petalos-nunito",
  display: "swap",
});

type Theme = "boda" | "xv" | "ejecutivo";

function getThemeFromTipo(tipo: string): Theme {
  if (tipo === "CASAMIENTO") return "boda";
  if (tipo === "QUINCE_ANOS") return "xv";
  return "ejecutivo";
}

function safeJson<T>(val: string | null | undefined, fallback: T): T {
  if (!val) return fallback;
  try { return JSON.parse(val) as T; } catch { return fallback; }
}

interface PetalosTemplateVinoVibranteProps {
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
        <span className="text-xs sm:text-sm font-mono break-all" style={{ color: "var(--petalos-ink)" }}>{value}</span>
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
        <span className="text-sm font-medium break-words" style={{ color: "var(--petalos-ink)" }}>{value}</span>
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
        <h3 style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "2rem", fontStyle: "italic", color: "var(--petalos-ink)" }}>
          ¡Juego Completado!
        </h3>
        <p style={{ marginTop: "12px", opacity: 0.8, fontFamily: "var(--font-sans)", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.8rem", color: "var(--petalos-ink)" }}>
          RESPONDISTE {score} DE {preguntas.length} CORRECTAMENTE ({percent}%)
        </p>

        {isSaving ? (
          <p style={{ marginTop: "16px", fontSize: "14px", opacity: 0.7, color: "var(--t-muted)" }}>Guardando tus resultados...</p>
        ) : (
          stats && stats.count > 0 && (
            <div style={{ marginTop: "28px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "color-mix(in srgb, var(--t-acc) 8%, transparent)", padding: "8px 16px", borderRadius: "99px", border: "1px solid color-mix(in srgb, var(--t-acc) 15%, transparent)", textAlign: "left", maxWidth: "90%" }}>
                <Users className="w-5 h-5 shrink-0" style={{ color: "var(--t-acc)" }} />
                <p style={{ fontSize: "11.5px", margin: 0, opacity: 0.85, lineHeight: 1.4, color: "var(--petalos-ink)" }}>
                  El promedio global de aciertos del resto de los invitados ({stats.count}) es del <strong style={{ color: "var(--petalos-ink)" }}>{stats.avg}%</strong>.
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
        <p className="text-2xl md:text-3xl leading-relaxed tracking-wide" style={{ color: "var(--petalos-ink)", fontFamily: 'var(--font-cormorant), serif', fontStyle: 'italic', margin: 0, fontWeight: 500, marginBottom: "3.5rem" }}>
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

export function PetalosTemplateVinoVibrante({ invitation, guest, isPersonalized = false }: PetalosTemplateVinoVibranteProps) {
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

  // Entrada animada de los doodles de portada (flor, pétalo, enredadera,
  // capullo) con anime.js -- corre una sola vez cuando la portada aparece.
  const coverRootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isCoverOpen || !coverRootRef.current) return;
    const root = coverRootRef.current;
    animate(root.querySelectorAll(".petalos-doodle"), {
      scale: [0, 1],
      rotate: [-14, 0],
      opacity: [0, 1],
      duration: 900,
      delay: stagger(140, { start: 300 }),
      ease: "outBack",
    });
    animate(root.querySelectorAll(".petalos-seal"), {
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
    const els = document.querySelectorAll(".petalos-scroll-doodle");
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

  // Pétalos a la deriva: 3 pétalos que caen/rotan suavemente sobre la foto
  // de portada a medida que se hace scroll, con fases distintas entre sí.
  const heroPhotoRef = useRef<HTMLDivElement>(null);
  const petal1Ref = useRef<HTMLDivElement>(null);
  const petal2Ref = useRef<HTMLDivElement>(null);
  const petal3Ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isCoverOpen || !heroPhotoRef.current) return;
    const petals = [petal1Ref.current, petal2Ref.current, petal3Ref.current];
    const phases = [0, 0.28, 0.55];
    const startX = [18, 55, 78];
    const observer = onScroll({
      target: heroPhotoRef.current,
      container: document.body,
      enter: "bottom top",
      leave: "top bottom",
      onUpdate: (self) => {
        const p = self.progress;
        petals.forEach((el, i) => {
          if (!el) return;
          const local = Math.min(1, Math.max(0, (p + phases[i]) % 1));
          const intensity = Math.sin(local * Math.PI);
          el.style.opacity = String(intensity * 0.65);
          el.style.top = `${local * 115 - 8}%`;
          el.style.left = `${startX[i] + Math.sin(local * Math.PI * 2) * 6}%`;
          el.style.transform = `rotate(${local * 220 - 30}deg)`;
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

  const monogram =
    tipo === "CASAMIENTO" ? "♥"
    : tipo === "QUINCE_ANOS" ? "✦"
    : "●";

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

  // Portada animada -- a diferencia de la base/Coral/Pastel/RosaPastel (tema
  // claro), VinoVibrante es de paleta oscura (--t-bg #2B0E14, acento #8C1B2A
  // vino) -- tinte + effect="shimmer", mismo criterio que la base pero con
  // tinte porque acá SÍ es una paleta oscura/cargada. scrimColorRgb = rgb
  // del propio --t-bg (no comparte bg con las otras variantes).
  const portadaImagenFondoDesktopRaw = String(invitation.portadaImagenFondoDesktop ?? "") || undefined;
  const portadaFondoAnimado = Boolean(portadaImagenFondoDesktopRaw);
  const portadaFondoFallback = portadaFondoAnimado ? undefined
    : tipo === "CASAMIENTO" ? "/fondos/petalos-boda.png"
    : tipo === "QUINCE_ANOS" ? "/fondos/petalos-quince.png"
    : undefined;
  const portadaTintColor1 = "#8C1B2A";
  const portadaTintColor2 = "#E23B4E";

  const guestNameDisplay = guest?.name
    ? guest.name
    : (tipo === "CASAMIENTO" && invitation.nombreNovia && invitation.nombreNovio
        ? `${invitation.nombreNovia} & ${invitation.nombreNovio}`
        : String(invitation.nombreQuinceanera || invitation.nombreEvento || "Invitado Especial"));

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
      <div className="min-h-dvh w-full text-white relative overflow-x-hidden flex flex-col justify-between" style={{ background: "linear-gradient(180deg, var(--t-bg) 0%, var(--t-surface) 55%, #FFFFFF 100%)" }} data-theme={theme}>
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none" style={{ background: "color-mix(in srgb, var(--t-acc) 10%, transparent)" }} aria-hidden="true" />
        <div className="absolute right-0 bottom-0 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none" style={{ background: "color-mix(in srgb, var(--t-acc2) 10%, transparent)" }} aria-hidden="true" />

        <main className="relative z-10 max-w-5xl mx-auto w-full px-4 md:px-6 py-12 lg:py-20">
          <div className="rounded-[2rem] shadow-2xl backdrop-blur-3xl text-center max-w-4xl mx-auto relative overflow-hidden flex flex-col" style={{ background: "color-mix(in srgb, var(--petalos-ink) 6%, transparent)", border: "1px solid color-mix(in srgb, var(--t-acc) 15%, transparent)" }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[1px]" style={{ background: "linear-gradient(90deg, transparent, color-mix(in srgb, var(--t-acc2) 60%, transparent), transparent)" }} />

            <div className="p-10 md:p-16 space-y-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light tracking-wide drop-shadow-md" style={{ color: "var(--petalos-ink)", fontFamily: "var(--font-cormorant), serif" }}>
                Un momento <AnimatedSynonyms words={["inolvidable", "único", "eterno", "mágico"]} className="italic font-serif text-[var(--t-acc2)]" />
              </h1>

              <div className="flex justify-center items-center gap-4 py-2 opacity-60">
                <div className="h-[1px] w-12" style={{ background: "color-mix(in srgb, var(--petalos-ink) 25%, transparent)" }} />
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--t-acc2)" }} />
                <div className="h-[1px] w-12" style={{ background: "color-mix(in srgb, var(--petalos-ink) 25%, transparent)" }} />
              </div>

              <p className="text-lg md:text-xl leading-relaxed max-w-2xl mx-auto font-light tracking-wide" style={{ color: "var(--t-muted)", fontFamily: "var(--font-sans)" }}>
                Gracias por acompañarnos en este día tan especial y compartir la alegría de crear recuerdos que perdurarán para siempre.
              </p>

              <div className="pt-6">
                <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full text-xs tracking-widest uppercase backdrop-blur-md" style={{ fontFamily: "var(--font-sans)", background: "color-mix(in srgb, var(--t-acc) 6%, transparent)", border: "1px solid color-mix(in srgb, var(--t-acc) 15%, transparent)", color: "var(--t-muted)" }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--t-acc2)" }} />
                  <span>Álbum disponible hasta el {expirationDateStr}</span>
                </div>
              </div>
            </div>

            <SectionWrapper id="album" className="w-full py-8 md:py-12" style={{ background: "color-mix(in srgb, var(--petalos-ink) 4%, transparent)", borderTop: "1px solid color-mix(in srgb, var(--t-acc) 8%, transparent)" }}>
              <div className="px-4 md:px-10">
                {livePhotos.length > 0 ? (
                  <div className="w-full overflow-hidden rounded-2xl shadow-xl" style={{ boxShadow: "0 0 0 1px color-mix(in srgb, var(--t-acc) 15%, transparent)" }}>
                    <AlbumCarousel photos={livePhotos} hideHeader={true} />
                  </div>
                ) : (
                  <div className="text-center space-y-3">
                    <h3 className="font-serif font-light text-xl tracking-wide" style={{ color: "var(--petalos-ink)" }}>
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
          <LogoFooterCredit bgColor="transparent" textColor="var(--chic-ink, #F6E4E6)" />
        </footer>
      </div>
    );
  }

  return (
    <div
      className={`${petalosPlayfair.variable} ${petalosNunito.variable}`}
      style={{
        "--font-cormorant": "var(--petalos-playfair)",
        "--font-inter": "var(--petalos-nunito)",
        "--font-sans": "var(--petalos-nunito)",
        "--t-acc": "#8C1B2A",
        "--t-acc2": "#E23B4E",
        "--c-accent": "#8C1B2A",
        "--t-bg": "#2B0E14",
        "--t-surface": "#3B131B",
        "--t-muted": "#C99AA1",
        "--petalos-ink": "#F6E4E6",
        // Shim para Countdown.tsx/RSVPWizardV2.tsx: esos componentes leen
        // literalmente `dark ? var(--chic-ink, #FFFFFF) : inherit` (nombre
        // hardcodeado, confirmado leyendo el código). Reusamos el mismo
        // nombre acá con el valor de --petalos-ink para que el contraste de
        // texto quede correcto sin tocar esos dos archivos.
        "--chic-ink": "#F6E4E6",
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
          color: var(--petalos-ink) !important;
        }
        .desktop-stage .tpl .moderno-light-card h4 {
          color: var(--petalos-ink) !important;
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
          color: var(--petalos-ink) !important;
          border-color: color-mix(in srgb, var(--petalos-ink) 30%, transparent) !important;
        }

        #countdown.dark {
          background-color: var(--t-bg) !important;
          margin-top: -2px !important;
          position: relative;
          z-index: 20;
        }
        #countdown[data-style="clasico"].dark > div > div > div {
          background-color: color-mix(in srgb, var(--petalos-ink) 6%, transparent) !important;
          border-color: color-mix(in srgb, var(--t-acc) 20%, transparent) !important;
        }

        #rsvp.section.dark {
          background-color: var(--t-bg) !important;
          color: var(--petalos-ink) !important;
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
          color: var(--petalos-ink) !important;
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
          color: var(--petalos-ink) !important;
          border-radius: 6px !important;
          border: 1px solid color-mix(in srgb, var(--t-acc) 20%, transparent) !important;
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
          color: #FFFFFF !important;
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
          border-top: 1px solid color-mix(in srgb, var(--petalos-ink) 10%, transparent) !important;
          text-align: left !important;
          box-shadow: none !important;
          width: 100% !important;
        }
        #rsvp.section.dark .t-detail h4 {
          color: color-mix(in srgb, var(--petalos-ink) 50%, transparent) !important;
          font-family: var(--font-body-custom, var(--font-inter)), sans-serif !important;
          text-transform: uppercase !important;
          font-size: 10px !important;
          letter-spacing: 0.05em !important;
          font-weight: 600 !important;
          opacity: 1 !important;
          margin-bottom: 6px !important;
        }
        #rsvp.section.dark .t-detail p {
          color: color-mix(in srgb, var(--petalos-ink) 70%, transparent) !important;
          font-size: 13px !important;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        #rsvp.section.dark .t-detail p b {
          font-size: 1.1rem !important;
          color: var(--petalos-ink) !important;
          font-weight: 600 !important;
        }
        #rsvp.section.dark .t-detail span {
          color: color-mix(in srgb, var(--petalos-ink) 40%, transparent) !important;
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
          color: var(--petalos-ink) !important;
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
          color: #FFFFFF !important;
          border: none !important;
          border-radius: 0 !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
        }
        #banco .copy-btn.copied {
          background-color: var(--petalos-ink) !important;
          color: var(--t-bg) !important;
        }

        .desktop-stage .bottom-nav {
          position: fixed !important;
          bottom: 24px !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          display: flex !important;
          justify-content: space-between !important;
          background: color-mix(in srgb, var(--petalos-ink) 95%, transparent) !important;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4) !important;
          backdrop-filter: blur(12px) !important;
          width: calc(100% - 32px) !important;
          max-width: 360px !important;
          padding: 14px 10px !important;
          border-radius: 999px !important;
          z-index: 999999 !important;
        }
        .desktop-stage .bottom-nav a {
          color: var(--t-bg) !important;
          opacity: 0.6 !important;
        }
        .desktop-stage .bottom-nav a[aria-current="true"] {
          opacity: 1 !important;
          color: var(--t-acc2) !important;
        }
      `}</style>

      {/* PORTADA / WELCOME OVERLAY */}
      {!isCoverOpen && (
        <div
          ref={coverRootRef}
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100dvh', zIndex: 99999, backgroundColor: 'var(--t-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: '25vh', overflow: 'hidden', ...getTypographyCssVars(invitation.fontTitle as string, invitation.fontBody as string) }}
          className={`${isClosingCover ? "acp-cover-exit" : "transition-all duration-1000 animate-in fade-in"}`}
        >
          {portadaFondoAnimado && (
            <div className="acp-mobile-only">
              <AnimatedCoverPhoto
                photoSrc={portadaImagenFondoDesktopRaw as string}
                tintColor1={portadaTintColor1}
                tintColor2={portadaTintColor2}
                effect="shimmer"
                scrimColorRgb="43,14,20"
              />
            </div>
          )}
          <div className={portadaFondoAnimado ? "acp-desktop-only" : undefined}>
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: 'radial-gradient(50% 40% at 15% 15%, color-mix(in srgb, var(--t-acc2) 14%, transparent), transparent), radial-gradient(45% 40% at 85% 80%, color-mix(in srgb, var(--t-acc) 16%, transparent), transparent)',
              backgroundSize: '160% 160%',
              animation: 'petalos-meshDrift 14s ease-in-out infinite',
            }} />
            <div style={{
              position: 'absolute', width: 220, height: 220, borderRadius: '50%',
              background: 'radial-gradient(circle, color-mix(in srgb, var(--t-acc2) 16%, transparent), transparent 70%)',
              top: '18%', left: '50%', transform: 'translateX(-50%)',
              animation: 'petalos-glowPulse 5s ease-in-out infinite', pointerEvents: 'none',
            }} />

            <IconBlossom className="petalos-doodle opacity-0 absolute" style={{ width: 34, height: 34, top: '9%', left: '10%', color: 'color-mix(in srgb, var(--t-acc) 55%, transparent)' }} />
            <IconVine className="petalos-doodle opacity-0 absolute" style={{ width: 34, height: 18, top: '15%', right: '10%', color: 'color-mix(in srgb, var(--t-acc2) 50%, transparent)' }} />
            <IconPetal className="petalos-doodle opacity-0 absolute" style={{ width: 14, height: 22, bottom: '20%', left: '14%', color: 'color-mix(in srgb, var(--t-acc) 45%, transparent)' }} />
            <IconHeartBud className="petalos-doodle opacity-0 absolute" style={{ width: 16, height: 16, bottom: '25%', right: '18%', color: 'color-mix(in srgb, var(--t-acc2) 45%, transparent)' }} />
          </div>

          {portadaFondoFallback && (
            <CoverFallbackBg photoSrc={portadaFondoFallback} />
          )}
          <div style={{ textAlign: 'center', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', position: 'relative' }}>

            <div className="petalos-seal opacity-0" style={{
              width: 44, height: 44, borderRadius: '50%', border: '1px solid var(--t-acc)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'var(--t-acc)',
            }}>
              {monogram}
            </div>

            <h2 className="text-4xl sm:text-5xl font-light tracking-wide leading-relaxed" style={{ fontFamily: 'var(--font-title, var(--font-cormorant)), serif', color: 'var(--petalos-ink)' }}>
              {guestNameDisplay}
            </h2>

            {Boolean(activeDressCode) && (
              <p className="text-sm font-medium tracking-wide uppercase" style={{ fontFamily: "var(--font-body-custom, var(--font-inter)), sans-serif", letterSpacing: "0.2em", opacity: 0.8, color: 'var(--t-muted)' }}>
                Dress code: {activeDressCode}
              </p>
            )}

            <button
              type="button"
              onClick={openInvitation}
              className="inline-block font-medium text-xs tracking-[0.2em] px-10 py-3 transition-colors duration-500 cursor-pointer"
              style={{
                fontFamily: 'var(--font-body-custom, var(--font-inter)), sans-serif', border: '1px solid var(--t-acc)', color: 'var(--t-acc)',
                background: 'color-mix(in srgb, var(--t-acc) 8%, transparent)', backdropFilter: 'blur(6px)',
                marginTop: '1rem',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--t-acc)'; e.currentTarget.style.color = '#FFFFFF'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'color-mix(in srgb, var(--t-acc) 8%, transparent)'; e.currentTarget.style.color = 'var(--t-acc)'; }}
            >
              ABRIR INVITACIÓN
            </button>

          </div>

          <style jsx>{`
            @keyframes petalos-meshDrift { 0%, 100% { background-position: 0% 0%, 100% 100%; } 50% { background-position: 30% 20%, 70% 80%; } }
            @keyframes petalos-glowPulse { 0%, 100% { opacity: .5; } 50% { opacity: 1; } }
            @keyframes petalos-lineExpand { 0% { width: 0; } 100% { width: 40px; } }
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
            "--t-acc": "#8C1B2A",
            "--t-bg": "#2B0E14",
            "--t-muted": "#C99AA1",
            "--petalos-ink": "#F6E4E6",
            border: '1px solid color-mix(in srgb, var(--t-acc) 40%, transparent)',
            backdropFilter: 'blur(8px)',
            ...(isTicketMaximized
              ? { background: 'color-mix(in srgb, var(--t-bg) 95%, transparent)', borderRadius: 999, width: '90%', maxWidth: 384, padding: '10px 20px' }
              : { background: 'color-mix(in srgb, var(--petalos-ink) 95%, transparent)', borderRadius: 999, padding: '8px 20px' }),
          } as unknown as React.CSSProperties}
        >
          {isTicketMaximized ? (
            <div className="flex items-center justify-between w-full animate-in fade-in duration-300">
              <div className="flex flex-col text-left">
                <span className="text-[8px] font-semibold uppercase tracking-[0.2em] leading-none mb-1" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))", color: 'var(--t-acc)' }}>Pase Especial</span>
                <span className="font-bold text-sm leading-none" style={{ fontFamily: 'var(--font-cormorant), serif', color: 'var(--petalos-ink)' }}>{guest.name}</span>
              </div>
              <div className="flex flex-col items-end pl-3" style={{ borderLeft: '1px solid color-mix(in srgb, var(--t-acc) 20%, transparent)' }}>
                <span className="font-bold text-sm leading-none" style={{ color: 'var(--petalos-ink)' }}>{guest.expectedCount}</span>
                <span className="text-[8px] uppercase tracking-wider leading-none mt-1" style={{ color: 'var(--t-muted)' }}>{guest.expectedCount === 1 ? 'Lugar' : 'Lugares'}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 animate-in fade-in duration-300">
              <Ticket className="w-4 h-4" style={{ color: 'var(--t-acc)' }} />
              <span className="text-[10px] font-semibold tracking-wider uppercase" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))", color: 'var(--t-bg)' }}>Pase</span>
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
        "--t-acc": "#8C1B2A",
        "--t-acc2": "#E23B4E",
        "--c-accent": "#8C1B2A",
        "--t-bg": "#2B0E14",
        "--t-surface": "#3B131B",
        "--t-muted": "#C99AA1",
        "--petalos-ink": "#F6E4E6",
        "--chic-ink": "#F6E4E6",
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
          <div className="seal" style={{ borderColor: "white", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
            <span style={{ color: "white", fontFamily: "var(--font-cormorant), serif", textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>{monogram}</span>
          </div>
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
          <div style={{ width: 40, height: 2, background: 'var(--t-acc2)', margin: '6px 0 14px', animation: 'petalos-lineExpand 1.2s ease-out' }} />
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
            <IconBlossom className="petalos-scroll-doodle opacity-0 absolute" style={{ width: 22, height: 22, top: 14, right: 28, color: 'color-mix(in srgb, var(--t-acc) 45%, transparent)' }} />
            <IconVine className="petalos-scroll-doodle opacity-0 absolute" style={{ width: 26, height: 14, top: 60, right: 56, color: 'color-mix(in srgb, var(--t-acc2) 45%, transparent)' }} />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-6" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))", color: 'var(--t-acc)' }}>
              {eyebrow}
            </p>
            <h1 className="text-[4rem] font-light leading-[1.0] mb-3" style={{ fontFamily: 'var(--font-title, var(--font-cormorant)), serif', color: 'var(--petalos-ink)' }}>
              {em ? (
                <>
                  <span className="block">{title.slice(0, title.indexOf(em)).trim()}</span>
                  <span className="block"><em style={{ fontFamily: 'var(--font-cormorant), serif', fontStyle: 'italic', color: 'var(--t-acc2)' }}>&amp;</em> {em.replace('& ', '').trim()}</span>
                </>
              ) : (
                <span className="block">{title}</span>
              )}
            </h1>
            <div style={{ width: 40, height: 2, background: 'var(--t-acc2)', margin: '0 0 20px', animation: 'petalos-lineExpand 1.2s ease-out' }} />
            <p className="text-sm font-medium tracking-wide" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))", color: 'var(--t-muted)' }}>
              {fechaStr}{lugarNombre ? ` · ${lugarNombre}` : ""}{ciudad ? ` — ${ciudad}` : ""}
            </p>
            {Boolean(activeDressCode) && (
              <p className="text-xs font-semibold tracking-widest uppercase mt-4" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))", color: 'var(--t-acc)' }}>
                Dress code: {activeDressCode}
              </p>
            )}
          </div>

          {/* Image Container -- marco de perímetro fino completo + ramo
              floral en dos esquinas + pétalos a la deriva ligados al scroll
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
            {/* Marco de perímetro fino completo */}
            <div className="absolute inset-3 pointer-events-none z-20" aria-hidden="true">
              <div className="absolute inset-0" style={{ border: "1px solid color-mix(in srgb, var(--t-acc) 60%, transparent)" }} />
              {/* Ramo floral asomando de dos esquinas opuestas */}
              <IconBlossom style={{ position: "absolute", top: -12, left: -10, width: 26, height: 26, color: "var(--t-acc)" }} />
              <IconPetal style={{ position: "absolute", top: -6, left: 14, width: 10, height: 16, color: "var(--t-acc2)", transform: "rotate(-18deg)" }} />
              <IconBlossom style={{ position: "absolute", bottom: -12, right: -10, width: 22, height: 22, color: "var(--t-acc2)" }} />
              <IconVine style={{ position: "absolute", bottom: -2, right: 14, width: 20, height: 12, color: "var(--t-acc)", transform: "scaleX(-1)" }} />
            </div>
            {/* Pétalos a la deriva -- agrandados y con menos dilución de
                blanco (antes 9-14px y 60-70% color: casi invisibles en
                movimiento, a pedido del usuario). */}
            <div ref={petal1Ref} className="pointer-events-none z-20" style={{ position: 'absolute', width: 18, height: 27, opacity: 0 }}>
              <IconPetal style={{ width: '100%', height: '100%', color: 'color-mix(in srgb, var(--t-acc2) 85%, white)' }} />
            </div>
            <div ref={petal2Ref} className="pointer-events-none z-20" style={{ position: 'absolute', width: 14, height: 21, opacity: 0 }}>
              <IconPetal style={{ width: '100%', height: '100%', color: 'color-mix(in srgb, var(--t-acc) 85%, white)' }} />
            </div>
            <div ref={petal3Ref} className="pointer-events-none z-20" style={{ position: 'absolute', width: 20, height: 29, opacity: 0 }}>
              <IconPetal style={{ width: '100%', height: '100%', color: 'color-mix(in srgb, var(--t-acc2) 78%, white)' }} />
            </div>
          </div>
        </div>

        {/* Divisor doodle: flor flanqueada por líneas finas */}

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
          <SectionWrapper id="quote" delay={100} className="w-full py-24 px-6 md:px-12 flex items-center justify-center" style={{ background: "linear-gradient(160deg, color-mix(in srgb, var(--t-acc2) 8%, transparent), transparent 70%), var(--t-bg)" }}>
            <div className="max-w-2xl mx-auto text-center">
              <IconHeartBud className="petalos-scroll-doodle opacity-0 mx-auto mb-6" style={{ width: 20, height: 22, color: 'var(--t-acc)' }} />
              <TypewriterText
                text={`"${String(invitation.frasePersonalizadaTexto)}"`}
                className="text-2xl md:text-3xl leading-relaxed tracking-wide"
                style={{ fontFamily: 'var(--font-cormorant), serif', fontStyle: 'italic', margin: 0, fontWeight: 500, color: 'var(--petalos-ink)' }}
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

            {(Boolean(invitation.ceremoniaHabilitada) || Boolean(invitation.ceremoniaNombre) || Boolean(invitation.ceremoniaDireccion)) && (
              <div className="p-6 sm:p-8 mb-6 shadow-sm" style={{ background: 'color-mix(in srgb, var(--petalos-ink) 4%, transparent)', borderLeft: '2px solid var(--t-acc)' }}>
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] block mb-3" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))", color: 'var(--t-muted)' }}>
                    {String(invitation.ceremoniaTitulo || "CEREMONIA")}
                  </span>
                  {Boolean(invitation.ceremoniaNombre) && (
                    <h4 className="text-2xl sm:text-3xl font-light mb-3" style={{ fontFamily: 'var(--font-cormorant), serif', fontStyle: 'italic', color: 'var(--petalos-ink)' }}>
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
              <div className="p-6 sm:p-8 mb-10 shadow-sm" style={{ background: 'color-mix(in srgb, var(--petalos-ink) 4%, transparent)', borderLeft: '2px solid var(--t-acc)' }}>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] block mb-3" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))", color: 'var(--t-muted)' }}>
                  FIESTA / SALÓN
                </span>
                {lugarNombre && (
                  <h4 className="text-2xl sm:text-3xl font-light mb-3" style={{ fontFamily: 'var(--font-cormorant), serif', fontStyle: 'italic', color: 'var(--petalos-ink)' }}>
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
              <div className="mt-16">
                <div className="flex justify-center mb-4">
                  <DrawLucideIcon icon={Clock} size={46} color="var(--t-acc)" strokeWidth={1.5} />
                </div>
                <p className="t-kicker mb-6 flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))", color: 'var(--t-acc)' }}>
                  CRONOGRAMA
                </p>
                <div className="flex flex-col w-full">
                  {cronograma.map((item, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center py-4 border-b last:border-b-0" style={{ borderColor: 'color-mix(in srgb, var(--t-acc) 10%, transparent)' }}>
                      {item.time && (
                        <span className="text-sm sm:text-base font-medium w-24 flex-shrink-0 mb-1 sm:mb-0" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))", color: 'var(--t-muted)' }}>
                          {item.time}
                        </span>
                      )}
                      <span className="text-[1.2rem] sm:text-[1.3rem] font-light" style={{ fontFamily: 'var(--font-cormorant), serif', fontStyle: 'italic', color: 'var(--petalos-ink)' }}>
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
          <SectionWrapper id="album" delay={200} className="w-full py-20 overflow-hidden" style={{ background: 'var(--t-bg)' }}>
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
            <iframe
              src={toEmbedMapUrl(mapUrl) ?? mapUrl}
              width="100%"
              height="220"
              style={{ border: 0, display: "block" }}
              loading="lazy"
              title={`Mapa: ${lugarNombre}`}
              referrerPolicy="no-referrer-when-downgrade"
            />
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
                      cardBg="#FFFFFF"
                      textPrimary="var(--petalos-ink)"
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
                      cardBg="#FFFFFF"
                      textPrimary="var(--petalos-ink)"
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
          <SectionWrapper id="quiz" delay={300} className="w-full py-20 px-6 md:px-12" style={{ background: "linear-gradient(160deg, color-mix(in srgb, var(--t-acc2) 10%, transparent), transparent 70%), var(--t-bg)" }}>
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
          <IconVine className="petalos-scroll-doodle opacity-0" style={{ width: 18, height: 9, color: 'var(--t-acc2)' }} />
          <div style={{ width: 28, height: 1, background: 'linear-gradient(90deg, transparent, var(--t-acc), transparent)' }} />
        </div>

        <LogoFooterCredit bgColor="var(--t-bg)" textColor="var(--chic-ink, #F6E4E6)" />
        </div>
      </div>

      {isCoverOpen && <BottomNavPill sections={navSections} variant="moderno" accentColor="#8C1B2A" surfaceColor="#3B131B" inactiveColor="#F6E4E6" solid />}
      </div>
  );
}
