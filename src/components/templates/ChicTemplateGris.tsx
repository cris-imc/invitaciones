/**
 * ChicTemplateGris.tsx
 * Derivado de ModernoTemplate.tsx (misma arquitectura que DraftTemplate.tsx):
 * misma estructura, props, secciones y componentes reutilizados (Countdown,
 * AlbumCarousel, RSVPWizardV2, SongSuggestion, etc). Cambia la capa visual a
 * la estética "Doodle Wedding" (mockup/nuevo/chic.html): fondo crema
 * (#F4F2EF) + tinta oscura (#241E12) + dorado fijo (#8C8275) + acento oliva
 * (#8C8275, variable por color), tipografía itálica elegante (Playfair
 * Display) + texto geométrico (Jost), doodles de trazo fino de boda
 * (anillos, corazones, moños, ramitas) como motivo decorativo y "marca de
 * agua" de fondo.
 * Gating: esta plantilla solo debe ofrecerse para eventos CASAMIENTO (ver
 * docs/PLAN_TEMPLATES_NEON_CHIC.md) — el gating vive en
 * TemplatePreviewModal.tsx, este archivo no valida nada por su cuenta.
 */
"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Playfair_Display, Jost } from "next/font/google";
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

// Doodles de trazo fino estilo "boda" (mockup chic.html) en vez de íconos
// genéricos de librería -- coherentes con el resto del motivo decorativo.
const IconInfo  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><path d="M12 15.5v-4M12 8.2h.01"/></svg>;
const IconCheck = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>;
const IconMusic = ({ className, style }: { className?: string; style?: React.CSSProperties } = {}) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3} className={className} style={style} aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="2.2"/></svg>;
const IconMap   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} aria-hidden="true"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
const IconGift  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} aria-hidden="true"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/></svg>;
const IconQuiz  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>;
// Anillos entrelazados doodle -- decorativa, usada en portada/hero. Doble
// trazo (banda con grosor) + brillos tipo diamante en vez de círculos lisos.
const IconRings = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 32 22" fill="none" stroke="currentColor" strokeWidth={1.1} className={className} style={style} aria-hidden="true">
    <circle cx="12" cy="11" r="7.2" />
    <circle cx="12" cy="11" r="5.6" />
    <circle cx="20" cy="11" r="7.2" />
    <circle cx="20" cy="11" r="5.6" />
    <path d="M9.5 4.2 8.7 2.6M9.5 4.2 11 3.6M9.5 4.2 10 5.6" strokeWidth={0.9} />
    <path d="M22.5 4.2 21.7 2.6M22.5 4.2 23.2 3.6" strokeWidth={0.9} />
  </svg>
);
// Corazón doodle de trazo fino -- acompaña títulos y separadores, con una
// pequeña voluta/cola en la punta y una línea de brillo interna.
const IconHeartDoodle = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 26" fill="none" stroke="currentColor" strokeWidth={1.2} className={className} style={style} aria-hidden="true">
    <path d="M12 20.5C6 16.8 2.5 13 2.5 9a5 5 0 0 1 9.5-2.2A5 5 0 0 1 21.5 9c0 4-3.5 7.8-9.5 11.5Z" />
    <path d="M12 20.5c-.8 1.6-.6 3-2 3.6" strokeWidth={0.9} />
    <path d="M8.2 8.4a3 3 0 0 1 3-2" strokeWidth={0.8} opacity={0.7} />
  </svg>
);
// Moño/cinta doodle -- separador de secciones, con dos lazos, colas
// dentadas en la punta y un nudo central con líneas de textura.
const IconRibbon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 28 18" fill="none" stroke="currentColor" strokeWidth={1.1} className={className} style={style} aria-hidden="true">
    <path d="M14 9C11 3 5 2 2.5 3.6c-2.3 1.5-1 5 1 5.8 1.6.6 3.2.2 4.2-.6" />
    <path d="M14 9c3 6 9 7 11.5 5.4c2.3-1.5 1-5-1-5.8-1.6-.6-3.2-.2-4.2.6" />
    <path d="M2.5 3.6 1 1.8M2.5 3.6 1.5 5.6" strokeWidth={0.8} />
    <path d="M25.5 14.4 27 16.2M25.5 14.4 26.5 12.4" strokeWidth={0.8} />
    <circle cx="14" cy="9" r="1.8" />
    <path d="M13.1 9h1.8M14 8.1v1.8" strokeWidth={0.7} />
  </svg>
);
// Capillita con cruz chica -- para la tarjeta de Ceremonia, con puerta en
// arco, rosetón y tejas marcadas. La cruz se hace deliberadamente
// pequeña/proporcional (pedido del usuario: una cruz grande "parece un
// cementerio").
const IconChurch = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.1} className={className} style={style} aria-hidden="true">
    <path d="M4 21V11l8-5 8 5v10" />
    <path d="M4 21h16" />
    <path d="M9 21v-6a3 3 0 0 1 6 0v6" />
    <circle cx="12" cy="10.4" r="1.7" strokeWidth={0.8} />
    <path d="M6 13.2h1.4M16.6 13.2H18" strokeWidth={0.7} opacity={0.7} />
    <path d="M12 6.4V4.6M11.3 5h1.4" strokeWidth={0.9} />
  </svg>
);

// Tipografía exacta del mockup "Doodle Wedding" (Playfair Display itálica +
// Jost texto), escopeada solo a este componente vía CSS var override en el
// wrapper raíz — no toca layout.tsx ni las demás plantillas que comparten
// --font-cormorant/--font-inter/--font-sans.
const chicPlayfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
  variable: "--chic-playfair",
  display: "swap",
});
const chicJost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--chic-jost",
  display: "swap",
});

const CRONO_ICONS: Record<string, string> = {
  Heart: "💛", Music: "🎵", Utensils: "🍽️", Calendar: "📅",
  Gift: "🎁", Camera: "📷", Clock: "🕐",
};

type Theme = "boda" | "xv" | "cumple";

function getThemeFromTipo(tipo: string): Theme {
  if (tipo === "CASAMIENTO") return "boda";
  if (tipo === "QUINCE_ANOS") return "xv";
  return "cumple";
}

function safeJson<T>(val: string | null | undefined, fallback: T): T {
  if (!val) return fallback;
  try { return JSON.parse(val) as T; } catch { return fallback; }
}

interface ChicTemplateGrisProps {
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
    <div className="flex items-center justify-between gap-3 py-3 border-b border-[#8C8275]/20 last:border-b-0">
      <div className="min-w-0 flex-1">
        <span className="block text-[10px] font-semibold text-[#8C8275] uppercase tracking-wider mb-0.5">{label}</span>
        <span className="text-xs sm:text-sm font-mono text-[#241E12] break-all">{value}</span>
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
    <div className="flex items-center justify-between gap-3 py-3 border-b border-[#8C8275]/20 last:border-b-0">
      <div className="min-w-0 flex-1">
        <span className="block text-[10px] font-semibold text-[#8C8275] uppercase tracking-wider mb-0.5">{label}</span>
        <span className="text-sm font-medium text-[#241E12] break-words">{value}</span>
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
    
    // Fetch latest stats and guest past response from database
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
          // Check local/session storage scoped to this specific guest
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
        // Save to backend and get stats
        if (invitationId) {
          setIsSaving(true);
          try {
            // Compute score
            let score = 0;
            preguntas.forEach((q, i) => {
              if (newPicks[i] === q.respuestaCorrecta) score++;
            });
            const res = await fetch('/api/quiz', {
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
            
            // fetch stats
            const params = new URLSearchParams({ invitationId });
            if (guestToken) params.append("guestToken", guestToken);
            const statsRes = await fetch(`/api/quiz?${params.toString()}`);
            if (statsRes.ok) {
              const data = await statsRes.json();
              setStats({ avg: data.averagePercentage, count: data.totalResponses });
            }
            
            // Save to local storage as fallback
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
        <h3 style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "2rem", fontStyle: "italic", color: "#241E12" }}>
          ¡Juego Completado!
        </h3>
        <p style={{ marginTop: "12px", opacity: 0.8, fontFamily: "var(--font-sans)", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.8rem", color: "#241E12" }}>
          RESPONDISTE {score} DE {preguntas.length} CORRECTAMENTE ({percent}%)
        </p>
        
        {isSaving ? (
          <p style={{ marginTop: "16px", fontSize: "14px", opacity: 0.7, color: "#8A7A63" }}>Guardando tus resultados...</p>
        ) : (
          stats && stats.count > 0 && (
            <div style={{ marginTop: "28px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.05)", padding: "8px 16px", borderRadius: "99px", border: "1px solid rgba(255,255,255,0.1)", textAlign: "left", maxWidth: "90%" }}>
                <Users className="w-5 h-5 text-[#8C8275] shrink-0" />
                <p style={{ fontSize: "11.5px", margin: 0, opacity: 0.85, lineHeight: 1.4, color: "#241E12" }}>
                  El promedio global de aciertos del resto de los invitados ({stats.count}) es del <strong style={{ color: "#241E12" }}>{stats.avg}%</strong>.
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
        <p className="text-[#241E12] text-2xl md:text-3xl leading-relaxed tracking-wide" style={{ fontFamily: 'var(--font-cormorant), serif', fontStyle: 'italic', margin: 0, fontWeight: 500, marginBottom: "3.5rem" }}>
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

export function ChicTemplateGris({ invitation, guest, isPersonalized = false }: ChicTemplateGrisProps) {
  const [isCoverOpen, setIsCoverOpen] = useState(false);
  const [isClosingCover, setIsClosingCover] = useState(false);
  const [isTicketMaximized, setIsTicketMaximized] = useState(true);

  // Transición cinemática al abrir (COVER_EXIT_STYLE), igual que la base de Chic.
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
    // No bloquear el scroll del body si no hay portada que tapar (ej. la
    // vista post-evento) -- si no, overflow queda en "hidden" para siempre
    // porque isCoverOpen nunca pasa a true en esas vistas.
    const isPostEventNow = getEventStatus(invitation.fechaEvento ? new Date(String(invitation.fechaEvento)) : new Date()) === "POST_EVENT";
    if (!isCoverOpen && !isPostEventNow) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isCoverOpen, invitation.fechaEvento]);

  // Entrada animada de los doodles de la portada (anillos, corazón, moño) con
  // anime.js -- ver docs/PLAN_TEMPLATES_NEON_CHIC.md. Corre una sola vez,
  // cuando la portada aparece (isCoverOpen pasa a false al montar, así que
  // esto dispara en el primer render real).
  const coverRootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isCoverOpen || !coverRootRef.current) return;
    const root = coverRootRef.current;
    animate(root.querySelectorAll(".chic-doodle"), {
      scale: [0, 1],
      rotate: [-15, 0],
      opacity: [0, 1],
      duration: 900,
      delay: stagger(140, { start: 300 }),
      ease: "outBack",
    });
    animate(root.querySelectorAll(".chic-seal"), {
      scale: [0.6, 1],
      opacity: [0, 1],
      duration: 700,
      delay: 150,
      ease: "outQuad",
    });
  }, [isCoverOpen]);

  // Doodles del CUERPO de la invitación (divisor, hero, secciones, footer):
  // se animan al entrar en viewport (scroll) con un IntersectionObserver,
  // uno por elemento, disparando una sola vez.
  useEffect(() => {
    if (!isCoverOpen) return;
    const els = document.querySelectorAll(".chic-scroll-doodle");
    if (!els.length) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animate(entry.target, {
          scale: [0, 1],
          rotate: [-12, 0],
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

  // Destello tipo "sol en el lente de una cámara" sobre la foto de portada,
  // ligado al progreso de scroll (ScrollObserver de anime.js): un punto de
  // luz cálido que recorre la foto en diagonal + un par de reflejos
  // fantasma más chicos siguiéndolo, como un lens flare real.
  const heroPhotoRef = useRef<HTMLDivElement>(null);
  const heroFlareRef = useRef<HTMLDivElement>(null);
  const heroGhost1Ref = useRef<HTMLDivElement>(null);
  const heroGhost2Ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isCoverOpen || !heroPhotoRef.current || !heroFlareRef.current) return;
    const flare = heroFlareRef.current;
    const ghost1 = heroGhost1Ref.current;
    const ghost2 = heroGhost2Ref.current;
    const observer = onScroll({
      target: heroPhotoRef.current,
      container: document.body,
      enter: "bottom top",
      leave: "top bottom",
      onUpdate: (self) => {
        const p = self.progress; // 0 a 1 mientras la foto atraviesa el viewport
        const intensity = Math.sin(p * Math.PI); // 0 -> 1 -> 0
        const x = p * 130 - 15; // % a lo largo de la diagonal, de punta a punta
        const y = p * 110 - 5;
        flare.style.opacity = String(intensity * 0.55);
        flare.style.left = `${x}%`;
        flare.style.top = `${y}%`;
        if (ghost1) {
          ghost1.style.opacity = String(intensity * 0.28);
          ghost1.style.left = `${x - 22}%`;
          ghost1.style.top = `${y - 18}%`;
        }
        if (ghost2) {
          ghost2.style.opacity = String(intensity * 0.18);
          ghost2.style.left = `${x - 40}%`;
          ghost2.style.top = `${y - 33}%`;
        }
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

  // PAGOS Y COBROS DE TARJETAS SOLO ACTIVOS SI PAGO DE TARJETAS ESTÁ HABILITADO
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

  // Portada de bienvenida animada -- Chic es paleta clara/pastel, sin tinte
  // (tint={false}), y el ink oscuro/muted son los mismos en TODAS las
  // variantes de color de Chic (#241E12 / #8A7A63), por eso coverScrimRgb y
  // las clases .chic-cover-text/.chic-cover-text-muted no varían por variante.
  const portadaImagenFondoDesktopRaw = String(invitation.portadaImagenFondoDesktop ?? "") || undefined;
  const portadaFondoAnimado = Boolean(portadaImagenFondoDesktopRaw);
  const coverScrimRgb = "36,30,18"; // rgb(#241E12)
  const portadaFondoFallback = !portadaFondoAnimado && tipo === "CASAMIENTO" ? "/fondos/chic-boda.png" : undefined;

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
      <div className="min-h-dvh w-full bg-gradient-to-b from-[#F4F2EF] via-[#E9E5E0] to-[#FCFBFA] text-white relative overflow-x-hidden flex flex-col justify-between" data-theme={theme}>
        {/* Glow decorativo (mismo estilo que la seccion "Plantillas" del landing) en vez de foto de fondo */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[600px] h-[600px] bg-[var(--accent)]/10 rounded-full blur-[120px] pointer-events-none" aria-hidden="true" />
        <div className="absolute right-0 bottom-0 w-[500px] h-[500px] bg-[var(--accent)]/10 rounded-full blur-[120px] pointer-events-none" aria-hidden="true" />

        <main className="relative z-10 max-w-5xl mx-auto w-full px-4 md:px-6 py-12 lg:py-20">
          <div className="rounded-[2rem] bg-black/40 border border-white/10 shadow-2xl backdrop-blur-3xl text-center max-w-4xl mx-auto relative overflow-hidden flex flex-col">
            {/* Elegant top accent line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-gradient-to-r from-transparent via-amber-200/50 to-transparent" />
            
            {/* Header Content */}
            <div className="p-10 md:p-16 space-y-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light text-white tracking-wide drop-shadow-md">
                Un momento <AnimatedSynonyms words={["inolvidable", "único", "eterno", "mágico"]} className="italic text-amber-200/90 font-serif" />
              </h1>
              
              <div className="flex justify-center items-center gap-4 py-2 opacity-60">
                <div className="h-[1px] w-12 bg-white/20" />
                <div className="w-1.5 h-1.5 rounded-full bg-amber-200/50" />
                <div className="h-[1px] w-12 bg-white/20" />
              </div>

              <p className="text-lg md:text-xl text-slate-300 leading-relaxed font-sans max-w-2xl mx-auto font-light tracking-wide" >
                Gracias por acompañarnos en este día tan especial y compartir la alegría de crear recuerdos que perdurarán para siempre.
              </p>

              <div className="pt-6">
                <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs  tracking-widest uppercase backdrop-blur-md" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80 animate-pulse" />
                  <span>Álbum disponible hasta el {expirationDateStr}</span>
                </div>
              </div>
            </div>

            {/* Carrusel de Fotos LIVE integrado */}
            <SectionWrapper id="album" className="w-full bg-black/20 border-t border-white/5 py-8 md:py-12">
              <div className="px-4 md:px-10">
                {livePhotos.length > 0 ? (
                  <div className="w-full overflow-hidden rounded-2xl shadow-xl ring-1 ring-white/10">
                    <AlbumCarousel photos={livePhotos} hideHeader={true} />
                  </div>
                ) : (
                  <div className="text-center space-y-3">
                    <h3 className="font-serif font-light text-xl text-slate-200 tracking-wide">
                      Álbum Fotográfico
                    </h3>
                    <p className="text-sm text-slate-400  font-light tracking-wide" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                      No se registraron capturas durante la velada.
                    </p>
                  </div>
                )}
              </div>
            </SectionWrapper>
          </div>
        </main>

        <footer className="relative z-10 pt-4 pb-2 text-center border-t border-white/10 font-sans">
          <LogoFooterCredit bgColor="transparent" textColor="var(--chic-ink, #241E12)" />
        </footer>
      </div>
    );
  }

  return (
    <div
      className={`${chicPlayfair.variable} ${chicJost.variable}`}
      style={{
        "--font-cormorant": "var(--chic-playfair)",
        "--font-inter": "var(--chic-jost)",
        "--font-sans": "var(--chic-jost)",
        "--t-acc": "#8C8275",
        "--t-acc2": "#8C8275",
        "--c-accent": "#8C8275",
        "--t-bg": "#F4F2EF",
        "--t-surface": "#FCFBFA",
        "--t-muted": "#8A7A63",
        // Usado por Countdown.tsx/RSVPWizardV2.tsx (dark ? var(--chic-ink, #FCFBFA) : ...)
        // -- sin definir esto, esos componentes muestran texto blanco
        // hardcodeado (pensado para Moderno/Neon) invisible sobre el fondo
        // claro de Chic. Moderno/Neon no definen esta var, así que su
        // fallback (#FCFBFA/#EDE9F4) los deja exactamente como estaban.
        "--chic-ink": "#241E12",
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
          color: #241E12 !important;
        }
        /* Tarjetas claras (Ceremonia/Fiesta) necesitan texto oscuro, no blanco */
        .desktop-stage .tpl .moderno-light-card h4 {
          color: #241E12 !important;
        }
        .desktop-stage .tpl .t-kicker,
        .desktop-stage .tpl p.kicker {
          font-family: var(--font-body-custom, var(--font-inter)), sans-serif !important;
          color: #8C8275 !important;
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
        
        /* Remove ALL rounded corners for the sharp, formal aesthetic */
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
          color: #241E12 !important;
          border-color: rgba(255, 255, 255, 0.3) !important;
        }

        /* Override Countdown Hardcoded Colors */
        #countdown.dark {
          background-color: #F4F2EF !important;
          margin-top: -2px !important;
          position: relative;
          z-index: 20;
        }
        #countdown[data-style="clasico"].dark > div > div > div {
          background-color: rgba(0, 0, 0, 0.2) !important;
          border-color: rgba(140,130,117,0.2) !important;
        }

        /* RSVP Custom Aesthetics for ChicTemplateGris */
        #rsvp.section.dark {
          background-color: #F4F2EF !important;
          color: #241E12 !important;
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
          color: #241E12 !important;
        }
        @media (min-width: 640px) {
          #rsvp.section.dark > p.t-kicker,
          #rsvp.section.dark > h2,
          #rsvp.section.dark > .d-rsvp-grid {
            max-width: 36rem !important; /* 576px to match sm:max-w-xl */
          }
        }
        #rsvp.section.dark .t-kicker {
          font-family: var(--font-body-custom, var(--font-inter)), sans-serif !important;
          color: #8C8275 !important;
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
          color: #8A7A63 !important;
          font-weight: 600 !important;
        }
        #rsvp.section.dark input {
          background-color: #FCFBFA !important;
          color: #241E12 !important;
          border-radius: 6px !important;
          border: 1px solid rgba(140,130,117,0.2) !important;
          padding: 12px 16px !important;
          font-weight: 400 !important;
          font-size: 14px !important;
        }
        #rsvp.section.dark input::placeholder {
          color: #8A7A63 !important;
          opacity: 0.8 !important;
        }
        #rsvp.section.dark .t-btn {
          border-radius: 6px !important;
          padding: 12px 24px !important;
          flex: 1 !important;
          min-width: 120px !important;
          background-color: #8C8275 !important;
          color: #241E12 !important;
          font-weight: 600 !important;
          border: none !important;
          text-transform: uppercase !important;
          letter-spacing: 0.1em !important;
          font-size: 13px !important;
        }
        /* Make decision buttons side-by-side */
        #rsvp.section.dark div:has(> button[aria-label="Confirmar asistencia"]) {
          flex-direction: row !important;
          gap: 12px !important;
        }
        
        
        
        /* Subtle Calculated Prices Styling Below the Form */
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
          border-top: 1px solid rgba(36,30,18,0.1) !important;
          text-align: left !important;
          box-shadow: none !important;
          width: 100% !important;
        }
        #rsvp.section.dark .t-detail h4 {
          color: rgba(36,30,18,0.5) !important;
          font-family: var(--font-body-custom, var(--font-inter)), sans-serif !important;
          text-transform: uppercase !important;
          font-size: 10px !important;
          letter-spacing: 0.05em !important;
          font-weight: 600 !important;
          opacity: 1 !important;
          margin-bottom: 6px !important;
        }
        #rsvp.section.dark .t-detail p {
          color: rgba(36,30,18,0.7) !important;
          font-size: 13px !important;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        #rsvp.section.dark .t-detail p b {
          font-size: 1.1rem !important;
          color: #241E12 !important;
          font-weight: 600 !important;
        }
        #rsvp.section.dark .t-detail span {
          color: rgba(36,30,18,0.4) !important;
          font-size: 12px !important;
        }
        
        /* SongSuggestion Custom Aesthetics */
        #songs.d-sec.dark {
          background-color: #E9E5E0 !important;
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
            max-width: 36rem !important; /* 576px */
          }
        }
        #songs.d-sec.dark .t-kicker {
          font-family: var(--font-body-custom, var(--font-inter)), sans-serif !important;
          color: #8C8275 !important; /* Gold/Orange */
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
        /* Fix Input Row Overflow */
        #songs.d-sec.dark .mod-input-row {
          display: flex !important;
          flex-direction: column !important;
          gap: 0 !important;
          width: 100% !important;
        }
        /* Footer Aesthetics */
        .desktop-stage .d-foot {
          background-color: #F4F2EF !important; /* Matches light sections */
          color: #241E12 !important;
          padding: 24px 24px 38px 24px !important;
          text-align: center;
        }
        .desktop-stage .d-foot .mono {
          color: #8C8275 !important;
          font-family: var(--font-title, var(--font-cormorant)), serif !important;
          font-size: 20px !important;
          margin-bottom: 8px !important;
        }

        /* Bank Section Overrides */
        #banco .t-kicker {
          text-align: left !important;
        }
        #banco .copy-btn {
          background-color: #8C8275 !important;
          color: #241E12 !important;
          border: none !important;
          border-radius: 0 !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
        }
        #banco .copy-btn.copied {
          background-color: #241E12 !important;
          color: #F4F2EF !important;
        }

        /* Bottom Nav Pill - Liquid Glass Sticky */
        .desktop-stage .bottom-nav {
          position: fixed !important;
          bottom: 24px !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          display: flex !important;
          justify-content: space-between !important;
          background: rgba(26, 21, 18, 0.95) !important;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5) !important;
          backdrop-filter: blur(12px) !important;
          width: calc(100% - 32px) !important;
          max-width: 360px !important;
          padding: 14px 10px !important;
          border-radius: 999px !important;
          z-index: 999999 !important;
        }
        .desktop-stage .bottom-nav a {
          color: #241E12 !important;
          opacity: 0.6 !important;
        }
        .desktop-stage .bottom-nav a[aria-current="true"] {
          opacity: 1 !important;
          color: #8C8275 !important;
        }
      `}</style>
      
      {/* PORTADA / WELCOME OVERLAY (mesh dorado + esmeralda animado, glow pulsante) */}
      {!isCoverOpen && (
        <div
          ref={coverRootRef}
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100dvh', zIndex: 99999, backgroundColor: '#F4F2EF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: '25vh', overflow: 'hidden', ...getTypographyCssVars(invitation.fontTitle as string, invitation.fontBody as string) }}
          className={`text-[#241E12] ${isClosingCover ? "acp-cover-exit" : "transition-all duration-1000 animate-in fade-in"}`}
        >
          {portadaFondoAnimado && (
            <div className="acp-mobile-only">
              <AnimatedCoverPhoto
                photoSrc={portadaImagenFondoDesktopRaw as string}
                effect="enfoque"
                tint={false}
                scrimColorRgb={coverScrimRgb}
              />
            </div>
          )}
          <div className={portadaFondoAnimado ? "acp-desktop-only" : undefined}>
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(50% 40% at 15% 15%, rgba(140,130,117,0.13), transparent), radial-gradient(45% 40% at 85% 80%, rgba(140,130,117,0.2), transparent)',
            backgroundSize: '160% 160%',
            animation: 'chic-meshDrift 14s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', width: 220, height: 220, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(140,130,117,0.13), transparent 70%)',
            top: '18%', left: '50%', transform: 'translateX(-50%)',
            animation: 'chic-glowPulse 5s ease-in-out infinite', pointerEvents: 'none',
          }} />
          </div>

          {/* Doodles decorativos (anillos, corazón, moño) -- animados de
              entrada con anime.js (ver useEffect de coverRootRef), inertes
              hasta que corre el JS (opacity-0 inicial). */}
          <IconRings className="chic-doodle opacity-0 absolute" style={{ width: 40, height: 26, top: '9%', left: '10%', color: 'rgba(140,130,117,0.55)' }} />
          <IconHeartDoodle className="chic-doodle opacity-0 absolute" style={{ width: 22, height: 22, top: '15%', right: '12%', color: 'rgba(140,130,117,0.45)' }} />
          <IconRibbon className="chic-doodle opacity-0 absolute" style={{ width: 32, height: 18, bottom: '18%', left: '14%', color: 'rgba(140,130,117,0.45)' }} />
          <IconHeartDoodle className="chic-doodle opacity-0 absolute" style={{ width: 16, height: 16, bottom: '24%', right: '20%', color: 'rgba(140,130,117,0.4)' }} />

          {portadaFondoFallback && (
            <CoverFallbackBg photoSrc={portadaFondoFallback} />
          )}
          <div style={{ textAlign: 'center', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', position: 'relative' }}>


            {/* Guest Name */}
            <h2 className={`text-4xl sm:text-5xl font-light tracking-wide leading-relaxed${portadaFondoAnimado ? " chic-cover-text" : ""}`} style={{ fontFamily: 'var(--font-title, var(--font-cormorant)), serif', color: portadaFondoAnimado ? undefined : '#241E12' }}>
              {guestNameDisplay}
            </h2>

            {/* Dress Code */}
            {Boolean(activeDressCode) && (
              <p className={`text-sm font-medium tracking-wide uppercase${portadaFondoAnimado ? " chic-cover-text-muted" : ""}`} style={{ fontFamily: "var(--font-body-custom, var(--font-inter)), sans-serif", letterSpacing: "0.2em", opacity: 0.8, color: portadaFondoAnimado ? undefined : '#8A7A63' }}>
                Dress code: {activeDressCode}
              </p>
            )}

            {/* Thin Open Button, borde dorado con vidrio esmerilado */}
            <button
              type="button"
              onClick={openInvitation}
              className="inline-block font-medium text-xs tracking-[0.2em] px-10 py-3 transition-colors duration-500 cursor-pointer" 
              style={{
                fontFamily: 'var(--font-body-custom, var(--font-inter)), sans-serif', border: '1px solid #8C8275', color: '#8C8275',
                background: 'rgba(140,130,117,0.08)', backdropFilter: 'blur(6px)',
                marginTop: '1rem',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#8C8275'; e.currentTarget.style.color = '#F4F2EF'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(140,130,117,0.08)'; e.currentTarget.style.color = '#8C8275'; }}
            >
              ABRIR INVITACIÓN
            </button>

          </div>

          <style jsx>{`
            @keyframes chic-meshDrift { 0%, 100% { background-position: 0% 0%, 100% 100%; } 50% { background-position: 30% 20%, 70% 80%; } }
            @keyframes chic-glowPulse { 0%, 100% { opacity: .5; } 50% { opacity: 1; } }
            @keyframes chic-lineExpand { 0% { width: 0; } 100% { width: 40px; } }
            .chic-cover-text { color: #FBF3EA; }
            .chic-cover-text-muted { color: rgba(251,243,234,0.75); }
            @media (min-width: 768px) {
              .chic-cover-text { color: #241E12; }
              .chic-cover-text-muted { color: #8A7A63; }
            }
          `}</style>
          <style>{COVER_EXIT_STYLE}{COVER_RESPONSIVE_STYLE}{COVER_FALLBACK_STYLE}</style>
        </div>
      )}

      {/* Sticky Ticket Bubble via Portal */}
      {mounted && isPersonalized && guest && isCoverOpen && createPortal(
        <div 
          onClick={() => setIsTicketMaximized(!isTicketMaximized)}
          className={`fixed top-3 left-1/2 -translate-x-1/2 z-[99999] transition-all duration-500 cursor-pointer overflow-hidden border border-[#8C8275]/40 shadow-md ${isTicketMaximized ? 'bg-[#F4F2EF]/95 backdrop-blur-md rounded-full w-[90%] max-w-sm px-5 py-2.5' : 'bg-[#241E12]/95 backdrop-blur-md rounded-full px-5 py-2'}`}
        >
          {isTicketMaximized ? (
            <div className="flex items-center justify-between w-full animate-in fade-in duration-300">
              <div className="flex flex-col text-left">
                <span className=" text-[8px] font-semibold uppercase tracking-[0.2em] text-[#8C8275] leading-none mb-1" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>Pase Especial</span>
                <span className="text-[#241E12] font-bold text-sm leading-none" style={{ fontFamily: 'var(--font-cormorant), serif' }}>{guest.name}</span>
              </div>
              <div className="flex flex-col items-end border-l border-[#8C8275]/20 pl-3">
                <span className="text-[#241E12] font-bold text-sm leading-none">{guest.expectedCount}</span>
                <span className="text-[#8A7A63] text-[8px] uppercase tracking-wider leading-none mt-1">{guest.expectedCount === 1 ? 'Lugar' : 'Lugares'}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 animate-in fade-in duration-300">
              <Ticket className="w-4 h-4 text-[#8C8275]" />
              <span className="text-[#FCFBFA]  text-[10px] font-semibold tracking-wider uppercase" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>Pase</span>
            </div>
          )}
        </div>,
        document.body
      )}

      {/* Burbuja de música, independiente de la burbuja de pase */}
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
        // Este wrapper (vista de escritorio, separado del de arriba que es
        // el de mobile) nunca tuvo las CSS vars del tema -- ni siquiera en
        // ModernoTemplate.tsx original. Ahí "no se nota" porque el fallback
        // de los componentes compartidos (Countdown, RSVPWizardV2) es un
        // color claro que igual se lee sobre el fondo oscuro de Moderno.
        // En Chic (tema claro) ese mismo fallback es invisible, así que acá
        // SÍ hace falta definir todo explícitamente.
        "--t-acc": "#8C8275",
        "--t-acc2": "#8C8275",
        "--c-accent": "#8C8275",
        "--t-bg": "#F4F2EF",
        "--t-surface": "#FCFBFA",
        "--t-muted": "#8A7A63",
        "--chic-ink": "#241E12",
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
          <p className=" text-[11px] font-semibold uppercase tracking-[0.2em] text-white mb-6 drop-shadow-sm" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>{eyebrow}</p>
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
          <div style={{ width: 40, height: 2, background: '#8C8275', margin: '6px 0 14px', animation: 'chic-lineExpand 1.2s ease-out' }} />
          <p className=" text-sm font-medium text-white/90 tracking-wide drop-shadow-sm" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>{fechaStr}{ciudad ? ` · ${ciudad}` : ""}{lugarNombre ? ` · ${lugarNombre}` : ""}</p>
          {Boolean(activeDressCode) && (
            <p className=" text-xs font-semibold text-white/80 tracking-widest uppercase mt-4 drop-shadow-sm" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
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
        <div className="hide-desktop w-full flex flex-col min-h-[100dvh] bg-[#F4F2EF]">
          {/* Text Container */}
          <div className="px-8 pt-16 pb-12 text-left bg-[#F4F2EF] z-10 relative">
            <IconHeartDoodle className="chic-scroll-doodle opacity-0 absolute" style={{ width: 18, height: 18, top: 12, right: 28, color: 'rgba(140,130,117,0.4)' }} />
            <IconRibbon className="chic-scroll-doodle opacity-0 absolute" style={{ width: 26, height: 15, top: 64, right: 52, color: 'rgba(140,130,117,0.4)' }} />
            <p className=" text-xs font-semibold uppercase tracking-[0.2em] text-[#8C8275] mb-6" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
              {eyebrow}
            </p>
            <h1 className="text-[4rem] font-light text-[#241E12] leading-[1.0] mb-3" style={{ fontFamily: 'var(--font-title, var(--font-cormorant)), serif' }}>
              {em ? (
                <>
                  <span className="block">{title.slice(0, title.indexOf(em)).trim()}</span>
                  <span className="block"><em style={{ fontFamily: 'var(--font-cormorant), serif', fontStyle: 'italic', color: '#8C8275' }}>&amp;</em> {em.replace('& ', '').trim()}</span>
                </>
              ) : (
                <span className="block">{title}</span>
              )}
            </h1>
            <div style={{ width: 40, height: 2, background: '#8C8275', margin: '0 0 20px', animation: 'chic-lineExpand 1.2s ease-out' }} />
            <p className=" text-sm font-medium text-[#8A7A63] tracking-wide" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
              {fechaStr}{lugarNombre ? ` · ${lugarNombre}` : ""}{ciudad ? ` — ${ciudad}` : ""}
            </p>
            {Boolean(activeDressCode) && (
              <p className=" text-xs font-semibold text-[#8C8275] tracking-widest uppercase mt-4" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                Dress code: {activeDressCode}
              </p>
            )}
          </div>
          
          {/* Image Container -- marco dorado completo + destello tipo lente
              de cámara ligado al scroll (ver useEffect de heroPhotoRef). */}
          <div ref={heroPhotoRef} className="flex-1 w-full relative overflow-hidden">
            <div className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none z-10" style={{ background: 'linear-gradient(to bottom, transparent 0%, #F4F2EF 100%)' }} />
            <div
              className="absolute inset-0 w-full h-full"
              style={heroBgMobile ? {
                backgroundImage: `url(${heroBgMobile})`,
                backgroundSize: "cover",
                backgroundPosition: `${Number(invitation.portadaImagenPosX ?? 50)}% ${Number(invitation.portadaImagenPosY ?? 50)}%`,
                backgroundRepeat: "no-repeat"
              } : { backgroundColor: '#FCFBFA' }}
            />
            {/* Marco completo + un par de doodles "saliendo" del borde (anillos
                y corazón), calcado del mockup chic.html. */}
            <div className="absolute inset-3 pointer-events-none z-20" aria-hidden="true">
              <div className="absolute inset-0" style={{ border: "1px solid rgba(140,130,117,0.65)" }} />
              <IconRings style={{ position: "absolute", top: -10, left: -8, width: 30, height: 20, color: "#8C8275" }} />
              <IconHeartDoodle style={{ position: "absolute", bottom: -8, right: -6, width: 18, height: 18, color: "#8C8275" }} />
            </div>
            {/* Destello cálido tipo "sol en el lente" + 2 reflejos fantasma
                más chicos, todos ligados al progreso de scroll. */}
            <div ref={heroFlareRef} className="pointer-events-none z-20" style={{ position: "absolute", width: 90, height: 90, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,247,224,0.9) 0%, rgba(140,130,117,0.35) 45%, transparent 72%)", opacity: 0, transform: "translate(-50%,-50%)" }} />
            <div ref={heroGhost1Ref} className="pointer-events-none z-20" style={{ position: "absolute", width: 30, height: 30, borderRadius: "50%", background: "radial-gradient(circle, rgba(140,130,117,0.5), transparent 70%)", opacity: 0, transform: "translate(-50%,-50%)" }} />
            <div ref={heroGhost2Ref} className="pointer-events-none z-20" style={{ position: "absolute", width: 16, height: 16, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.6), transparent 70%)", opacity: 0, transform: "translate(-50%,-50%)" }} />
          </div>
        </div>

        {/* Divisor doodle tipo "guirnalda" entre hero y cuenta regresiva
            (anillos flanqueados por ramitas, calcado del mockup chic.html). */}

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
          <SectionWrapper id="quote" delay={100} className="w-full py-24 px-6 md:px-12 flex items-center justify-center" style={{ background: "linear-gradient(160deg, #8C827514, transparent 70%), #FCFBFA" }}>
            <div className="max-w-2xl mx-auto text-center">
              <div className="flex justify-center mb-6">
                <DrawLucideIcon icon={BookOpen} size={46} color="var(--t-acc)" strokeWidth={1.5} />
              </div>
              <TypewriterText 
                text={`"${String(invitation.frasePersonalizadaTexto)}"`}
                className="text-[#241E12] text-2xl md:text-3xl leading-relaxed tracking-wide" 
                style={{ fontFamily: 'var(--font-cormorant), serif', fontStyle: 'italic', margin: 0, fontWeight: 500 }}
              />
            </div>
          </SectionWrapper>
        ) : null}

        <SectionWrapper id="details" delay={150} className="w-full bg-[#F4F2EF] py-20 px-6 md:px-12">
          <div className="w-full max-w-[340px] sm:max-w-xl mx-auto text-left">
            <div className="flex justify-center mb-4">
              <DrawLucideIcon icon={CalendarDays} size={46} color="var(--t-acc)" strokeWidth={1.5} />
            </div>
            <p className="t-kicker mb-8 flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase text-[#8C8275]" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
              CUÁNDO Y DÓNDE
            </p>

            {/* TARJETA 1: CEREMONIA / CIVIL (Si está cargada) */}
            {Boolean(invitation.ceremoniaHabilitada) && (
              <div className="bg-black/20 border-l-[2px] border-l-[#8C8275] p-6 sm:p-8 mb-6 shadow-sm">
                <div>
                  <span className=" text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8A7A63] block mb-3" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                    {String(invitation.ceremoniaTitulo || "CEREMONIA")}
                  </span>
                  {Boolean(invitation.ceremoniaNombre) && (
                    <h4 className="text-2xl sm:text-3xl font-light text-[#241E12] mb-3" style={{ fontFamily: 'var(--font-cormorant), serif', fontStyle: 'italic' }}>
                      {String(invitation.ceremoniaNombre)}
                    </h4>
                  )}
                  {Boolean(invitation.ceremoniaHora) && (
                    <p className="text-[#8A7A63]  text-sm sm:text-base mb-1" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                      {String(invitation.ceremoniaHora)} hs
                    </p>
                  )}
                  {Boolean(invitation.ceremoniaDireccion) && (
                    <p className="text-[#8A7A63]  text-sm sm:text-base mb-4" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                      {String(invitation.ceremoniaDireccion)}
                    </p>
                  )}
                  {Boolean(invitation.ceremoniaMapUrl) && (
                    <a href={String(invitation.ceremoniaMapUrl)} target="_blank" rel="noopener noreferrer" className="inline-block mt-1  text-xs font-semibold tracking-wider text-[#8C8275] hover:text-white transition-colors" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                      Ver mapa ceremonia ↗
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* TARJETA 2: FIESTA / SALÓN (Siempre visible si se ingresó lugar o dirección) */}
            {(lugarNombre || direccion) && (
              <div className="bg-black/20 border-l-[2px] border-l-[#8C8275] p-6 sm:p-8 mb-10 shadow-sm">
                <span className=" text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8A7A63] block mb-3" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                  FIESTA / SALÓN
                </span>
                {lugarNombre && (
                  <h4 className="text-2xl sm:text-3xl font-light text-[#241E12] mb-3" style={{ fontFamily: 'var(--font-cormorant), serif', fontStyle: 'italic' }}>
                    {lugarNombre}
                  </h4>
                )}
                {hora && (
                  <p className="text-[#8A7A63]  text-sm sm:text-base mb-1" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                    {hora} hs
                  </p>
                )}
                {direccion && (
                  <p className="text-[#8A7A63]  text-sm sm:text-base mb-4" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                    {direccion}
                  </p>
                )}
                {mapUrl && (
                  <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-1  text-xs font-semibold tracking-wider text-[#8C8275] hover:text-white transition-colors" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                    Ver mapa fiesta ↗
                  </a>
                )}
              </div>
            )}

            {/* CRONOGRAMA DE ACTIVIDADES (Si existe) */}
            {cronograma.length > 0 && (
              <div className="mt-16" id="schedule">
                <div className="flex justify-center mb-4">
                  <DrawLucideIcon icon={Clock} size={46} color="var(--t-acc)" strokeWidth={1.5} />
                </div>
                <p className="t-kicker mb-6 flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase text-[#8C8275]" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                  CRONOGRAMA
                </p>
                <div className="flex flex-col w-full">
                  {cronograma.map((item, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center py-4 border-b border-[#8C8275]/10 last:border-b-0">
                      {item.time && (
                        <span className=" text-sm sm:text-base text-[#8A7A63] font-medium w-24 flex-shrink-0 mb-1 sm:mb-0" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                          {item.time}
                        </span>
                      )}
                      <span className="text-[1.2rem] sm:text-[1.3rem] text-[#241E12] font-light" style={{ fontFamily: 'var(--font-cormorant), serif', fontStyle: 'italic' }}>
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
          <SectionWrapper id="album" delay={200} className="w-full bg-[#FCFBFA] py-20 overflow-hidden">
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
          <SectionWrapper id="banco" delay={200} className="w-full bg-[#E9E5E0] py-20 px-6 md:px-12 overflow-hidden">
            <div className="w-full max-w-[340px] sm:max-w-xl mx-auto text-left">
                <div className="flex justify-center mb-4">
                  <DrawLucideIcon icon={Landmark} size={46} color="var(--t-acc)" strokeWidth={1.5} />
                </div>
                <p className="t-kicker mb-10 flex items-center gap-2 text-[#8C8275]">
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
                      accentColor="#8C8275"
                      cardBg="#FCFBFA"
                      textPrimary="#241E12"
                      textSecondary="#8A7A63"
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
                      accentColor="#8C8275"
                      cardBg="#FCFBFA"
                      textPrimary="#241E12"
                      textSecondary="#8A7A63"
                      InfoRow={InfoRow}
                      CopyField={CopyField}
                    />
                  )}
                </div>
                </div>
          </SectionWrapper>
        )}

        {triviaHabilitada && triviaPreguntas.length > 0 && (
          <SectionWrapper id="quiz" delay={300} className="w-full py-20 px-6 md:px-12" style={{ background: "linear-gradient(160deg, #8C827518, transparent 70%), #E9E5E0" }}>
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

        {/* Separador doodle de footer: guirnalda de ramitas, calcado del
            mockup (separadores tipo guirnalda entre secciones). */}
        <div className="w-full flex items-center justify-center gap-2 py-6" style={{ background: '#F4F2EF' }} aria-hidden="true">
          <div style={{ width: 28, height: 1, background: 'linear-gradient(90deg, transparent, #8C8275, transparent)' }} />
          <svg className="chic-scroll-doodle opacity-0" viewBox="0 0 16 12" width="16" height="12" fill="none" stroke="#8C8275" strokeWidth="1.1" aria-hidden="true">
            <path d="M8 11V2M8 5 4 3M8 5l4-2M8 8 4.5 6.3M8 8l3.5-1.7" />
          </svg>
          <div style={{ width: 28, height: 1, background: 'linear-gradient(90deg, transparent, #8C8275, transparent)' }} />
        </div>

        <LogoFooterCredit bgColor="#F4F2EF" textColor="var(--chic-ink, #241E12)" />
        </div>
      </div>
      
      {isCoverOpen && <BottomNavPill sections={navSections} variant="moderno" accentColor="#8C8275" surfaceColor="#FCFBFA" />}
      </div>
  );
}

