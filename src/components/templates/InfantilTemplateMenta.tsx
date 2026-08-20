/**
 * InfantilTemplateMenta.tsx
 * Derivado de ModernoTemplate.tsx (mismo patrón que ChicTemplate.tsx para el
 * theming de tema claro -- variable de tinta propia + prop `dark` en los
 * componentes compartidos, ver docs/GUIA_TECNICA_PLANTILLAS.md sección 3.4):
 * misma estructura, props, secciones y componentes reutilizados (Countdown,
 * AlbumCarousel, RSVPWizardV2, SongSuggestion, etc). Cambia la capa visual a
 * la estética "Infantil" (mockup/nuevo/Infantil evento.dc.html): fondo crema
 * (#FFF7F2) + tinta violeta oscuro (#2A2140) + acento coral (#29B38A,
 * variable por color) + acento lavanda (#FF8AA6) + acento menta (#3FBF9F),
 * tipografía Baloo 2 (títulos, redondeada/juguetona) + Manrope (texto),
 * doodles redondeados juguetones (estrella, globo, nube/blob, confeti),
 * blobs flotantes de fondo, reveals con rebote y wiggle sutil en acentos --
 * pensada para cumpleaños infantiles/juveniles.
 * Gating: esta plantilla solo debe ofrecerse para eventos CUMPLEANOS (el
 * gating vive en TemplatePreviewModal.tsx, este archivo no valida nada por su
 * cuenta).
 */
"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Baloo_2, Manrope } from "next/font/google";
import { animate, stagger, onScroll } from "animejs";
import { AlbumCarousel } from "@/components/invitation/v2/AlbumCarousel";
import { Album } from "@/components/invitation/v2/Album";
import { AnimatedCoverPhoto, COVER_EXIT_STYLE, COVER_RESPONSIVE_STYLE } from "@/components/invitation/v2/AnimatedCoverPhoto";
import { Countdown } from "@/components/invitation/v2/Countdown";
import { SaveTheDate } from "@/components/invitation/v2/SaveTheDate";
import { RSVPWizardV2 } from "@/components/invitation/v2/RSVPWizardV2";
import { SongSuggestion } from "@/components/invitation/v2/SongSuggestion";
import { SectionWrapper } from "@/components/invitation/v2/SectionWrapper";
import { BankDetailsCard } from "@/components/invitation/v2/BankDetailsCard";
import { BottomNavPill } from "@/components/invitation/v2/BottomNavPill";
import { TypewriterText } from "@/components/ui/TypewriterText";
import { AnimatedSynonyms } from "@/components/ui/AnimatedSynonyms";
import { useMusicPlayer, MusicToggleButton } from "@/components/invitation/MusicPlayer";
import { LogoFooterCredit } from "@/components/ui/Logo";
import { Clock, MapPin, Users, CreditCard, Gift, Ticket, BookOpen, CalendarDays, Camera, HelpCircle, Landmark } from "lucide-react";
import { DrawLucideIcon } from "@/components/ui/icons/DrawLucideIcon";
import { getEventStatus, getInvitationExpirationDate } from "@/lib/expiration";
import { toEmbedMapUrl } from "@/lib/google-maps";
import { getTypographyCssVars } from "@/lib/typography-map";
import { resolveGuestNameDisplay } from "@/lib/invitation-copy";

// Tipografía "Infantil" (Baloo 2 redondeada/juguetona + Manrope), escopeada
// solo a este componente vía CSS var override en el wrapper raíz.
const infantilBaloo = Baloo_2({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--infantil-baloo",
  display: "swap",
});
const infantilManrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--infantil-manrope",
  display: "swap",
});

// Doodles redondeados juguetones "Infantil": estrella/destello, globo,
// nube/blob, confeti -- coherentes con el motivo festivo infantil.
const IconInfo  = ({ className, style }: { className?: string; style?: React.CSSProperties } = {}) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className={className} style={style} aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><path d="M12 15.5v-4M12 8.2h.01"/></svg>;
const IconCheck = ({ className, style }: { className?: string; style?: React.CSSProperties } = {}) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>;
const IconMusic = ({ className, style }: { className?: string; style?: React.CSSProperties } = {}) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" className={className} style={style} aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="2.2"/></svg>;
const IconMap   = ({ className, style }: { className?: string; style?: React.CSSProperties } = {}) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
const IconGift  = ({ className, style }: { className?: string; style?: React.CSSProperties } = {}) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true"><rect x="3" y="8" width="18" height="4" rx="2"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/></svg>;
const IconQuiz  = ({ className, style }: { className?: string; style?: React.CSSProperties } = {}) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className={className} style={style} aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>;
// Estrella/destello de 4 puntas -- decorativa de portada, motivo "sparkle".
const IconStar = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className} style={style} aria-hidden="true">
    <path d="M12 1.5c.9 5.6 3.1 7.9 8.7 8.9-5.6.9-7.8 3.1-8.7 8.7-.9-5.6-3.1-7.8-8.7-8.7 5.6-1 7.8-3.3 8.7-8.9Z" />
  </svg>
);
// Globo con cordón -- decorativa de portada / separadores.
const IconBalloon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 20 27" fill="none" stroke="currentColor" strokeWidth={1.3} className={className} style={style} aria-hidden="true">
    <path d="M10 1.5a7 7 0 0 1 7 7c0 4.4-3.2 8.2-6 9.6l-1 1.4-1-1.4c-2.8-1.4-6-5.2-6-9.6a7 7 0 0 1 7-7Z" />
    <path d="M9.3 19.5 8.5 22l1.5-.9 1 1.1-.7-2.4" strokeWidth={1} />
  </svg>
);
// Nube/blob redondeado -- forma flotante de fondo.
const IconCloudBlob = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 30 20" fill="currentColor" stroke="none" className={className} style={style} aria-hidden="true">
    <path d="M8 16c-4 0-7-2.8-7-6.2C1 6.8 3.6 4.4 7 4.2 8.2 1.7 10.8 0 14 0c3.6 0 6.6 2.2 7.6 5.3 3.4.4 6.4 3 6.4 6.5 0 2.3-1.4 4.2-3.4 5.3-.9.6-2 1-3.2 1H8Z" />
  </svg>
);
// Racimo de confeti -- separador de secciones.
const IconConfetti = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 26 14" fill="currentColor" stroke="none" className={className} style={style} aria-hidden="true">
    <rect x="1" y="5" width="4" height="4" rx="1" transform="rotate(-18 3 7)" />
    <circle cx="12" cy="3" r="2" />
    <rect x="19" y="6" width="4" height="4" rx="1" transform="rotate(22 21 8)" />
    <circle cx="9" cy="11" r="1.6" />
    <circle cx="23" cy="1.5" r="1.4" />
  </svg>
);

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

interface InfantilTemplateMentaProps {
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
    <div className="flex items-center justify-between gap-3 py-3 border-b border-[#29B38A]/20 last:border-b-0">
      <div className="min-w-0 flex-1">
        <span className="block text-[10px] font-semibold text-[#29B38A] uppercase tracking-wider mb-0.5">{label}</span>
        <span className="text-xs sm:text-sm font-mono text-[#2A2140] break-all">{value}</span>
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
    <div className="flex items-center justify-between gap-3 py-3 border-b border-[#29B38A]/20 last:border-b-0">
      <div className="min-w-0 flex-1">
        <span className="block text-[10px] font-semibold text-[#29B38A] uppercase tracking-wider mb-0.5">{label}</span>
        <span className="text-sm font-medium text-[#2A2140] break-words">{value}</span>
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
        <h3 style={{ fontFamily: "var(--font-cormorant), sans-serif", fontSize: "2rem", color: "#2A2140" }}>
          ¡Juego Completado!
        </h3>
        <p style={{ marginTop: "12px", opacity: 0.8, fontFamily: "var(--font-sans)", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.8rem", color: "#2A2140" }}>
          RESPONDISTE {score} DE {preguntas.length} CORRECTAMENTE ({percent}%)
        </p>

        {isSaving ? (
          <p style={{ marginTop: "16px", fontSize: "14px", opacity: 0.7, color: "#8478A0" }}>Guardando tus resultados...</p>
        ) : (
          stats && stats.count > 0 && (
            <div style={{ marginTop: "28px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,92,138,0.08)", padding: "8px 16px", borderRadius: "99px", border: "1px solid rgba(255,92,138,0.18)", textAlign: "left", maxWidth: "90%" }}>
                <Users className="w-5 h-5 text-[#29B38A] shrink-0" />
                <p style={{ fontSize: "11.5px", margin: 0, opacity: 0.85, lineHeight: 1.4, color: "#2A2140" }}>
                  El promedio global de aciertos del resto de los invitados ({stats.count}) es del <strong style={{ color: "#2A2140" }}>{stats.avg}%</strong>.
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
        <p className="text-[#2A2140] text-2xl md:text-3xl leading-relaxed tracking-wide" style={{ fontFamily: 'var(--font-cormorant), sans-serif', margin: 0, fontWeight: 700, marginBottom: "3.5rem" }}>
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
                className={`px-5 py-2.5 rounded-full border text-sm font-bold transition-all hover:bg-[var(--t-acc)] hover:text-[var(--t-onacc)] ${className}`}
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

export function InfantilTemplateMenta({ invitation, guest, isPersonalized = false }: InfantilTemplateMentaProps) {
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

  // Entrada animada de los doodles de portada (estrella, globo, confeti) con
  // rebote (outBack) -- corre una sola vez, cuando la portada aparece.
  const coverRootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isCoverOpen || !coverRootRef.current) return;
    const root = coverRootRef.current;
    animate(root.querySelectorAll(".infantil-doodle"), {
      scale: [0, 1],
      rotate: [-18, 0],
      opacity: [0, 1],
      duration: 900,
      delay: stagger(130, { start: 260 }),
      ease: "outBack",
    });
    animate(root.querySelectorAll(".infantil-seal"), {
      scale: [0.5, 1],
      opacity: [0, 1],
      duration: 700,
      delay: 120,
      ease: "outBack",
    });
  }, [isCoverOpen]);

  // Doodles del cuerpo: reveal con rebote al entrar en viewport, una sola
  // vez por elemento.
  useEffect(() => {
    if (!isCoverOpen) return;
    const els = document.querySelectorAll(".infantil-scroll-doodle");
    if (!els.length) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animate(entry.target, {
          scale: [0, 1],
          rotate: [-14, 0],
          opacity: [0, 1],
          duration: 750,
          ease: "outBack",
        });
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.3 });
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [isCoverOpen]);

  // Ráfaga de destellos: 3 estrellitas de colores que titilan cruzando la
  // foto de portada en diagonal al hacer scroll -- efecto festivo/infantil,
  // coherente con el confeti del mockup (en vez del lens-flare de Chic o el
  // reflector industrial de Loft).
  const heroPhotoRef = useRef<HTMLDivElement>(null);
  const sparkle1Ref = useRef<HTMLDivElement>(null);
  const sparkle2Ref = useRef<HTMLDivElement>(null);
  const sparkle3Ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isCoverOpen || !heroPhotoRef.current || !sparkle1Ref.current) return;
    const s1 = sparkle1Ref.current, s2 = sparkle2Ref.current, s3 = sparkle3Ref.current;
    const observer = onScroll({
      target: heroPhotoRef.current,
      container: getScrollContainer(heroPhotoRef.current),
      enter: "bottom top",
      leave: "top bottom",
      onUpdate: (self) => {
        const p = self.progress;
        s1.style.opacity = String(Math.abs(Math.sin(p * Math.PI * 3)) * 0.8);
        s1.style.left = `${10 + p * 70}%`;
        s1.style.top = `${15 + p * 20}%`;
        if (s2) {
          s2.style.opacity = String(Math.abs(Math.sin(p * Math.PI * 3 + 1.2)) * 0.7);
          s2.style.left = `${25 + p * 60}%`;
          s2.style.top = `${55 - p * 25}%`;
        }
        if (s3) {
          s3.style.opacity = String(Math.abs(Math.sin(p * Math.PI * 3 + 2.4)) * 0.7);
          s3.style.left = `${50 + p * 40}%`;
          s3.style.top = `${35 + p * 30}%`;
        }
      },
    });
    return () => { observer.revert(); };
  }, [isCoverOpen]);

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

  const portadaImagenFondoDesktopRaw = String(invitation.portadaImagenFondoDesktop ?? "") || undefined;
  const portadaFondoAnimado = Boolean(portadaImagenFondoDesktopRaw);

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
      <div className="min-h-dvh w-full bg-gradient-to-b from-[#FFF7F2] via-[#FFF0E4] to-[#FFFFFF] text-white relative overflow-x-hidden flex flex-col justify-between" data-theme={theme}>
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[600px] h-[600px] bg-[var(--accent)]/10 rounded-full blur-[120px] pointer-events-none" aria-hidden="true" />
        <div className="absolute right-0 bottom-0 w-[500px] h-[500px] bg-[var(--accent)]/10 rounded-full blur-[120px] pointer-events-none" aria-hidden="true" />

        <main className="relative z-10 max-w-5xl mx-auto w-full px-4 md:px-6 py-12 lg:py-20">
          <div className="rounded-[2rem] bg-black/40 border border-white/10 shadow-2xl backdrop-blur-3xl text-center max-w-4xl mx-auto relative overflow-hidden flex flex-col">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-gradient-to-r from-transparent via-pink-200/50 to-transparent" />

            <div className="p-10 md:p-16 space-y-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light text-white tracking-wide drop-shadow-md">
                Un festejo <AnimatedSynonyms words={["inolvidable", "único", "divertido", "mágico"]} className="italic text-pink-200/90 font-serif" />
              </h1>

              <div className="flex justify-center items-center gap-4 py-2 opacity-60">
                <div className="h-[1px] w-12 bg-white/20" />
                <div className="w-1.5 h-1.5 rounded-full bg-pink-200/50" />
                <div className="h-[1px] w-12 bg-white/20" />
              </div>

              <p className="text-lg md:text-xl text-slate-300 leading-relaxed font-sans max-w-2xl mx-auto font-light tracking-wide" >
                Gracias por acompañarnos en este día tan especial y compartir la alegría de crear recuerdos que perdurarán para siempre.
              </p>

              <div className="pt-6">
                <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs  tracking-widest uppercase backdrop-blur-md" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-400/80 animate-pulse" />
                  <span>Álbum disponible hasta el {expirationDateStr}</span>
                </div>
              </div>
            </div>

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
          <LogoFooterCredit bgColor="transparent" textColor="var(--infantil-ink, #2A2140)" />
        </footer>
      </div>
    );
  }

  return (
    <div
      className={`${infantilBaloo.variable} ${infantilManrope.variable}`}
      style={{
        "--font-cormorant": "var(--infantil-baloo)",
        "--font-inter": "var(--infantil-manrope)",
        "--font-sans": "var(--infantil-manrope)",
        "--t-acc": "#29B38A",
        "--t-acc2": "#FF8AA6",
        "--c-accent": "#29B38A",
        "--t-bg": "#FFF7F2",
        "--t-surface": "#FFFFFF",
        "--t-muted": "#8478A0",
        // Usado por Countdown.tsx/RSVPWizardV2.tsx (dark ? var(--infantil-ink, #FFFFFF) : ...)
        "--infantil-ink": "#2A2140",
        "--chic-ink": "#2A2140",
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
          font-family: var(--font-title, var(--font-cormorant)), sans-serif !important;
          font-weight: 700 !important;
          color: #2A2140 !important;
        }
        .desktop-stage .tpl .moderno-light-card h4 {
          color: #2A2140 !important;
        }
        .desktop-stage .tpl .t-kicker,
        .desktop-stage .tpl p.kicker {
          font-family: var(--font-body-custom, var(--font-inter)), sans-serif !important;
          color: #29B38A !important;
          font-size: 11px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.15em !important;
          display: block;
        }
        .desktop-stage .tpl button {
          font-family: var(--font-body-custom, var(--font-inter)), sans-serif !important;
        }
        .desktop-stage .tpl .t-kicker::before,
        .desktop-stage .tpl p.kicker::before {
          display: none !important;
        }

        /* Esquinas bien redondeadas -- estética juguetona */
        .desktop-stage .tpl div:not(#countdown div),
        .desktop-stage .tpl section {
          border-radius: 22px;
        }
        .desktop-stage .tpl button,
        .desktop-stage .tpl input,
        .desktop-stage .tpl .t-btn,
        .desktop-stage .tpl .album-btn {
          border-radius: 999px !important;
        }
        .desktop-stage .tpl iframe {
          border-radius: 0 !important;
        }
        .desktop-stage .tpl .album-item {
          border-radius: 20px !important;
        }
        .desktop-stage .tpl .album-btn {
          color: #2A2140 !important;
          border-color: rgba(42, 33, 64, 0.2) !important;
        }

        #countdown.dark {
          background-color: #FFF7F2 !important;
          margin-top: -2px !important;
          position: relative;
          z-index: 20;
        }
        #countdown[data-style="clasico"].dark > div > div > div {
          background-color: #FFFFFF !important;
          border-color: rgba(255, 92, 138, 0.2) !important;
        }

        /* RSVP + footer: panel violeta oscuro (contraste), calcado del
           mockup -- el resto de las secciones son claras/crema. */
        #rsvp.section.dark {
          background-color: #241B38 !important;
          color: #FFFFFF !important;
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
          color: #FFFFFF !important;
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
          color: #29B38A !important;
          font-size: 11px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.15em !important;
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
          letter-spacing: 0.1em !important;
          color: rgba(255,255,255,0.6) !important;
          font-weight: 700 !important;
        }
        #rsvp.section.dark input {
          background-color: #3A2E54 !important;
          color: #FFFFFF !important;
          border-radius: 14px !important;
          border: none !important;
          padding: 12px 16px !important;
          font-weight: 500 !important;
          font-size: 14px !important;
        }
        #rsvp.section.dark input::placeholder {
          color: rgba(255,255,255,0.5) !important;
          opacity: 1 !important;
        }
        #rsvp.section.dark .t-btn {
          border-radius: 999px !important;
          padding: 12px 24px !important;
          flex: 1 !important;
          min-width: 120px !important;
          background-color: #29B38A !important;
          color: #FFFFFF !important;
          font-weight: 700 !important;
          border: none !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
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
          border-top: 1px solid rgba(255,255,255,0.12) !important;
          text-align: left !important;
          box-shadow: none !important;
          width: 100% !important;
        }
        #rsvp.section.dark .t-detail h4 {
          color: rgba(255,255,255,0.55) !important;
          font-family: var(--font-body-custom, var(--font-inter)), sans-serif !important;
          text-transform: uppercase !important;
          font-size: 10px !important;
          letter-spacing: 0.05em !important;
          font-weight: 700 !important;
          opacity: 1 !important;
          margin-bottom: 6px !important;
        }
        #rsvp.section.dark .t-detail p {
          color: rgba(255,255,255,0.75) !important;
          font-size: 13px !important;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        #rsvp.section.dark .t-detail p b {
          font-size: 1.1rem !important;
          color: #FFFFFF !important;
          font-weight: 700 !important;
        }
        #rsvp.section.dark .t-detail span {
          color: rgba(255,255,255,0.4) !important;
          font-size: 12px !important;
        }

        #songs.d-sec.dark {
          background-color: #FFF0E4 !important;
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
          color: #29B38A !important;
          font-size: 11px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.15em !important;
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
          background-color: #241B38 !important;
          color: #FFFFFF !important;
          padding: 24px 24px 38px 24px !important;
          text-align: center;
        }
        .desktop-stage .d-foot .mono {
          color: #29B38A !important;
          font-family: var(--font-title, var(--font-cormorant)), sans-serif !important;
          font-size: 20px !important;
          margin-bottom: 8px !important;
        }

        #banco .t-kicker {
          text-align: left !important;
        }
        #banco .copy-btn {
          background-color: #29B38A !important;
          color: #FFFFFF !important;
          border: none !important;
          border-radius: 999px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
        }
        #banco .copy-btn.copied {
          background-color: #2A2140 !important;
          color: #FFF7F2 !important;
        }

        .desktop-stage .bottom-nav {
          position: fixed !important;
          bottom: 24px !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          display: flex !important;
          justify-content: space-between !important;
          background: rgba(36, 27, 56, 0.95) !important;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35) !important;
          backdrop-filter: blur(12px) !important;
          width: calc(100% - 32px) !important;
          max-width: 360px !important;
          padding: 14px 10px !important;
          border-radius: 999px !important;
          z-index: 999999 !important;
        }
        .desktop-stage .bottom-nav a {
          color: #FFF7F2 !important;
          opacity: 0.65 !important;
        }
        .desktop-stage .bottom-nav a[aria-current="true"] {
          opacity: 1 !important;
          color: #29B38A !important;
        }

        @keyframes infantil-wiggle { 0%, 100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
        @keyframes infantil-blobFloat { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(14px,-16px) scale(1.05); } }
        @keyframes infantil-blobFloat2 { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-14px,14px) scale(1.06); } }
        .infantil-seal-wiggle { animation: infantil-wiggle 4s ease-in-out infinite; }
      `}</style>

      {/* PORTADA -- crema + blobs flotantes coral/lavanda (calcado del
          mockup: blobFloat/blobFloat2) */}
      {!isCoverOpen && (
        <div
          ref={coverRootRef}
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100dvh', zIndex: 99999, backgroundColor: '#FFF7F2', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: '25vh', overflow: 'hidden', ...getTypographyCssVars(invitation.fontTitle as string, invitation.fontBody as string) }}
          className={`text-[#2A2140] ${isClosingCover ? "acp-cover-exit" : "transition-all duration-1000 animate-in fade-in"}`}
        >
          {portadaFondoAnimado && (
            <div className="acp-mobile-only">
              <AnimatedCoverPhoto
                photoSrc={portadaImagenFondoDesktopRaw as string}
                effect="flash"
                tintColor1="#FF5C8A"
                tintColor2="#9B7FE8"
                scrimColorRgb="42,33,64"
              />
            </div>
          )}
          <div className={portadaFondoAnimado ? "acp-desktop-only" : undefined}>
            <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: '#29B38A', opacity: 0.16, top: '6%', left: '-8%', filter: 'blur(14px)', animation: 'infantil-blobFloat 7s ease-in-out infinite', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', width: 170, height: 170, borderRadius: '50%', background: '#FF8AA6', opacity: 0.18, bottom: '8%', right: '-6%', filter: 'blur(14px)', animation: 'infantil-blobFloat2 8s ease-in-out infinite', pointerEvents: 'none' }} />

          <IconStar className="infantil-doodle opacity-0 absolute" style={{ width: 26, height: 26, top: '10%', left: '11%', color: 'rgba(255,92,138,0.6)' }} />
          <IconBalloon className="infantil-doodle opacity-0 absolute" style={{ width: 22, height: 28, top: '15%', right: '13%', color: 'rgba(155,127,232,0.55)' }} />
          <IconConfetti className="infantil-doodle opacity-0 absolute" style={{ width: 32, height: 16, bottom: '20%', left: '14%', color: 'rgba(63,191,159,0.6)' }} />
          <IconStar className="infantil-doodle opacity-0 absolute" style={{ width: 16, height: 16, bottom: '26%', right: '18%', color: 'rgba(255,92,138,0.45)' }} />

          </div>
          <div style={{ textAlign: 'center', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', position: 'relative' }}>


            <h2 className={`text-4xl sm:text-5xl font-extrabold tracking-wide leading-relaxed${portadaFondoAnimado ? " infantil-cover-text" : ""}`} style={{ fontFamily: 'var(--font-title, var(--font-cormorant)), sans-serif', color: portadaFondoAnimado ? undefined : '#2A2140' }}>
              {guestNameDisplay}
            </h2>

            {Boolean(activeDressCode) && (
              <p className={`text-sm font-semibold tracking-wide uppercase${portadaFondoAnimado ? " infantil-cover-text-muted" : ""}`} style={{ fontFamily: "var(--font-body-custom, var(--font-inter)), sans-serif", letterSpacing: "0.15em", opacity: 0.9, color: portadaFondoAnimado ? undefined : '#8478A0' }}>
                Dress code: {activeDressCode}
              </p>
            )}

            <button
              type="button"
              onClick={openInvitation}
              className="inline-block font-bold text-xs tracking-[0.15em] px-10 py-3.5 transition-colors duration-500 cursor-pointer rounded-full"
              style={{
                fontFamily: 'var(--font-body-custom, var(--font-inter)), sans-serif', border: 'none', color: '#FFFFFF',
                background: '#29B38A', boxShadow: '0 10px 24px rgba(255,92,138,0.35)',
                marginTop: '1rem',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#E8447A'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#29B38A'; }}
            >
              ABRIR INVITACIÓN
            </button>

          </div>
          <style jsx>{`
            .infantil-cover-text { color: #FFF7F2; }
            .infantil-cover-text-muted { color: rgba(255,247,242,0.75); }
            @media (min-width: 768px) {
              .infantil-cover-text { color: #2A2140; }
              .infantil-cover-text-muted { color: #8478A0; }
            }
          `}</style>
          <style>{COVER_EXIT_STYLE}{COVER_RESPONSIVE_STYLE}</style>
        </div>
      )}

      {mounted && isPersonalized && guest && isCoverOpen && createPortal(
        <div
          onClick={() => setIsTicketMaximized(!isTicketMaximized)}
          className={`fixed top-3 left-1/2 -translate-x-1/2 z-[99999] transition-all duration-500 cursor-pointer overflow-hidden border border-[#29B38A]/40 shadow-md rounded-full ${isTicketMaximized ? 'bg-[#FFF7F2]/95 backdrop-blur-md w-[90%] max-w-sm px-5 py-2.5' : 'bg-[#241B38]/95 backdrop-blur-md px-5 py-2'}`}
        >
          {isTicketMaximized ? (
            <div className="flex items-center justify-between w-full animate-in fade-in duration-300">
              <div className="flex flex-col text-left">
                <span className=" text-[8px] font-bold uppercase tracking-[0.15em] text-[#29B38A] leading-none mb-1" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>Pase Especial</span>
                <span className="text-[#2A2140] font-bold text-sm leading-none" style={{ fontFamily: 'var(--font-cormorant), sans-serif' }}>{guest.name}</span>
              </div>
              <div className="flex flex-col items-end border-l border-[#29B38A]/20 pl-3">
                <span className="text-[#2A2140] font-bold text-sm leading-none">{guest.expectedCount}</span>
                <span className="text-[#8478A0] text-[8px] uppercase tracking-wider leading-none mt-1">{guest.expectedCount === 1 ? 'Lugar' : 'Lugares'}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 animate-in fade-in duration-300">
              <Ticket className="w-4 h-4 text-[#29B38A]" />
              <span className="text-[#FFFFFF]  text-[10px] font-bold tracking-wider uppercase" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>Pase</span>
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
        "--t-acc": "#29B38A",
        "--t-acc2": "#FF8AA6",
        "--c-accent": "#29B38A",
        "--t-bg": "#FFF7F2",
        "--t-surface": "#FFFFFF",
        "--t-muted": "#8478A0",
        "--infantil-ink": "#2A2140",
        "--chic-ink": "#2A2140",
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
          <p className=" text-[11px] font-bold uppercase tracking-[0.15em] text-white mb-6 drop-shadow-sm" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>{eyebrow}</p>
          <h1 className="text-5xl font-extrabold text-white leading-tight mb-2 drop-shadow-md" style={{ fontFamily: 'var(--font-title, var(--font-cormorant)), sans-serif' }}>
            {em ? (
              <>
                <span className="block">{title.slice(0, title.indexOf(em)).trim()}</span>
                <span className="block"><em style={{ fontFamily: 'var(--font-cormorant), sans-serif', fontStyle: 'normal', color: '#29B38A' }}>&amp;</em> {em.replace('& ', '').trim()}</span>
              </>
            ) : (
              <span className="block">{title}</span>
            )}
          </h1>
          <div style={{ width: 40, height: 4, background: '#29B38A', borderRadius: 4, margin: '6px 0 14px' }} />
          <p className=" text-sm font-semibold text-white/90 tracking-wide drop-shadow-sm" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>{fechaStr}{ciudad ? ` · ${ciudad}` : ""}{lugarNombre ? ` · ${lugarNombre}` : ""}</p>
          {Boolean(activeDressCode) && (
            <p className=" text-xs font-bold text-white/80 tracking-widest uppercase mt-4 drop-shadow-sm" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
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
        <div className="hide-desktop w-full flex flex-col min-h-[100dvh] bg-[#FFF7F2]">
          <div className="px-8 pt-16 pb-12 text-left bg-[#FFF7F2] z-10 relative">
            <IconStar className="infantil-scroll-doodle opacity-0 absolute" style={{ width: 18, height: 18, top: 14, right: 30, color: 'rgba(255,92,138,0.5)' }} />
            <IconConfetti className="infantil-scroll-doodle opacity-0 absolute" style={{ width: 26, height: 13, top: 62, right: 50, color: 'rgba(63,191,159,0.5)' }} />
            <p className=" text-xs font-bold uppercase tracking-[0.15em] text-[#29B38A] mb-6" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
              {eyebrow}
            </p>
            <h1 className="text-[4rem] font-extrabold text-[#2A2140] leading-[1.0] mb-3" style={{ fontFamily: 'var(--font-title, var(--font-cormorant)), sans-serif' }}>
              {em ? (
                <>
                  <span className="block">{title.slice(0, title.indexOf(em)).trim()}</span>
                  <span className="block"><em style={{ fontFamily: 'var(--font-cormorant), sans-serif', fontStyle: 'normal', color: '#29B38A' }}>&amp;</em> {em.replace('& ', '').trim()}</span>
                </>
              ) : (
                <span className="block">{title}</span>
              )}
            </h1>
            <div style={{ width: 40, height: 4, background: '#29B38A', borderRadius: 4, margin: '0 0 20px' }} />
            <p className=" text-sm font-semibold text-[#8478A0] tracking-wide" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
              {fechaStr}{lugarNombre ? ` · ${lugarNombre}` : ""}{ciudad ? ` — ${ciudad}` : ""}
            </p>
            {Boolean(activeDressCode) && (
              <p className=" text-xs font-bold text-[#29B38A] tracking-widest uppercase mt-4" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                Dress code: {activeDressCode}
              </p>
            )}
          </div>

          {/* Marco redondeado completo + ráfaga de destellos ligada al
              scroll (ver useEffect de heroPhotoRef). */}
          <div ref={heroPhotoRef} className="flex-1 w-full relative overflow-hidden">
            <div className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none z-10" style={{ background: 'linear-gradient(to bottom, transparent 0%, #FFF7F2 100%)' }} />
            <div
              className="absolute inset-0 w-full h-full"
              style={heroBgMobile ? {
                backgroundImage: `url(${heroBgMobile})`,
                backgroundSize: "cover",
                backgroundPosition: `${Number(invitation.portadaImagenPosX ?? 50)}% ${Number(invitation.portadaImagenPosY ?? 50)}%`,
                backgroundRepeat: "no-repeat"
              } : { backgroundColor: '#FFF0E4' }}
            />
            <div className="absolute inset-3 pointer-events-none z-20" aria-hidden="true">
              <div className="absolute inset-0" style={{ border: "2px solid rgba(255,92,138,0.55)", borderRadius: 28 }} />
              <IconStar style={{ position: "absolute", top: -12, left: -8, width: 24, height: 24, color: "#29B38A" }} />
              <IconBalloon style={{ position: "absolute", bottom: -14, right: -6, width: 20, height: 26, color: "#FF8AA6" }} />
            </div>
            <div ref={sparkle1Ref} className="pointer-events-none z-20" style={{ position: "absolute", width: 14, height: 14, borderRadius: "50%", background: "radial-gradient(circle, #FFD9E6 0%, transparent 75%)", opacity: 0, transform: "translate(-50%,-50%)" }} />
            <div ref={sparkle2Ref} className="pointer-events-none z-20" style={{ position: "absolute", width: 10, height: 10, borderRadius: "50%", background: "radial-gradient(circle, #D9CCFF 0%, transparent 75%)", opacity: 0, transform: "translate(-50%,-50%)" }} />
            <div ref={sparkle3Ref} className="pointer-events-none z-20" style={{ position: "absolute", width: 11, height: 11, borderRadius: "50%", background: "radial-gradient(circle, #C6F2E6 0%, transparent 75%)", opacity: 0, transform: "translate(-50%,-50%)" }} />
          </div>
        </div>

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
            title={tipo === "CASAMIENTO" ? "Faltan poquitos días" : "¡La cuenta ya empezó!"}
            dark
          />
        ) : null}

        {(Boolean(invitation.frasePersonalizadaHabilitada) && Boolean(invitation.frasePersonalizadaTexto)) ? (
          <SectionWrapper id="quote" delay={100} className="w-full py-24 px-6 md:px-12 flex items-center justify-center relative" style={{ background: "#FF8AA61A" }}>
            <IconStar className="infantil-scroll-doodle opacity-0 absolute" style={{ width: 14, height: 14, top: '18%', left: '12%', color: '#3FBF9F' }} />
            <div className="max-w-2xl mx-auto text-center">
              <div className="flex justify-center mb-6">
                <DrawLucideIcon icon={BookOpen} size={46} color="var(--t-acc)" strokeWidth={1.5} />
              </div>
              <TypewriterText
                text={`"${String(invitation.frasePersonalizadaTexto)}"`}
                className="text-[#2A2140] text-2xl md:text-3xl leading-relaxed tracking-wide"
                style={{ fontFamily: 'var(--font-cormorant), sans-serif', margin: 0, fontWeight: 600 }}
              />
            </div>
          </SectionWrapper>
        ) : null}

        <SectionWrapper id="details" delay={150} className="w-full bg-[#FFF7F2] py-20 px-6 md:px-12">
          <div className="w-full max-w-[340px] sm:max-w-xl mx-auto text-left">
            <div className="flex justify-center mb-4">
              <DrawLucideIcon icon={CalendarDays} size={46} color="var(--t-acc)" strokeWidth={1.5} />
            </div>
            <p className="t-kicker mb-8 flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase text-[#29B38A]" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
              CUÁNDO Y DÓNDE
            </p>

            {Boolean(invitation.ceremoniaHabilitada) && (
              <div className="bg-white border-l-[4px] border-l-[#3FBF9F] p-6 sm:p-8 mb-6 shadow-sm">
                <div>
                  <span className=" text-[10px] font-bold uppercase tracking-[0.15em] text-[#8478A0] block mb-3" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                    {String(invitation.ceremoniaTitulo || "CEREMONIA")}
                  </span>
                  {Boolean(invitation.ceremoniaNombre) && (
                    <h4 className="text-2xl sm:text-3xl font-extrabold text-[#2A2140] mb-3" style={{ fontFamily: 'var(--font-cormorant), sans-serif' }}>
                      {String(invitation.ceremoniaNombre)}
                    </h4>
                  )}
                  {Boolean(invitation.ceremoniaHora) && (
                    <p className="text-[#8478A0]  text-sm sm:text-base mb-1 font-medium" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                      {String(invitation.ceremoniaHora)} hs
                    </p>
                  )}
                  {Boolean(invitation.ceremoniaDireccion) && (
                    <p className="text-[#8478A0]  text-sm sm:text-base mb-4 font-medium" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                      {String(invitation.ceremoniaDireccion)}
                    </p>
                  )}
                  {Boolean(invitation.ceremoniaMapUrl) && (
                    <a href={String(invitation.ceremoniaMapUrl)} target="_blank" rel="noopener noreferrer" className="inline-block mt-1  text-xs font-bold tracking-wider text-[#29B38A] hover:text-[#2A2140] transition-colors" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                      Ver mapa ceremonia ↗
                    </a>
                  )}
                </div>
              </div>
            )}

            {(lugarNombre || direccion) && (
              <div className="bg-white border-l-[4px] border-l-[#3FBF9F] p-6 sm:p-8 mb-10 shadow-sm">
                <span className=" text-[10px] font-bold uppercase tracking-[0.15em] text-[#8478A0] block mb-3" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                  FIESTA / SALÓN
                </span>
                {lugarNombre && (
                  <h4 className="text-2xl sm:text-3xl font-extrabold text-[#2A2140] mb-3" style={{ fontFamily: 'var(--font-cormorant), sans-serif' }}>
                    {lugarNombre}
                  </h4>
                )}
                {hora && (
                  <p className="text-[#8478A0]  text-sm sm:text-base mb-1 font-medium" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                    {hora} hs
                  </p>
                )}
                {direccion && (
                  <p className="text-[#8478A0]  text-sm sm:text-base mb-4 font-medium" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                    {direccion}
                  </p>
                )}
                {mapUrl && (
                  <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-1  text-xs font-bold tracking-wider text-[#29B38A] hover:text-[#2A2140] transition-colors" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
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
                <p className="t-kicker mb-6 flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase text-[#29B38A]" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                  CRONOGRAMA
                </p>
                <div className="flex flex-col w-full">
                  {cronograma.map((item, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center py-4 border-b-2 border-dashed border-[#FF8AA6]/25 last:border-b-0">
                      {item.time && (
                        <span className=" text-sm sm:text-base text-[#3FBF9F] font-bold w-24 flex-shrink-0 mb-1 sm:mb-0" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                          {item.time}
                        </span>
                      )}
                      <span className="text-[1.2rem] sm:text-[1.3rem] text-[#2A2140] font-bold" style={{ fontFamily: 'var(--font-cormorant), sans-serif' }}>
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
          <SectionWrapper id="album" delay={200} className="w-full bg-[#FFF0E4] py-20 overflow-hidden">
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

        {(invitation.galeriaPrincipalHabilitada ?? false) && invitation.albumStyle === "solapadas" && allPhotos.length >= 5 && (
          <SectionWrapper id="album-2" delay={150} className="w-full py-16 overflow-hidden" style={{ background: 'var(--t-surface)' }}>
            <div className="w-full max-w-[340px] sm:max-w-xl mx-auto">
              <Album photos={allPhotos} hideHeader albumStyle="solapadas" part="second" />
            </div>
          </SectionWrapper>
        )}

        {showGiftSection && (
          <SectionWrapper id="banco" delay={200} className="w-full bg-[#FFF0E4] py-20 px-6 md:px-12 overflow-hidden">
            <div className="w-full max-w-[340px] sm:max-w-xl mx-auto text-left">
                <div className="flex justify-center mb-4">
                  <DrawLucideIcon icon={Landmark} size={46} color="var(--t-acc)" strokeWidth={1.5} />
                </div>
                <p className="t-kicker mb-10 flex items-center gap-2 text-[#29B38A]">
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
                      accentColor="#29B38A"
                      cardBg="#FFFFFF"
                      textPrimary="#2A2140"
                      textSecondary="#8478A0"
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
                      accentColor="#29B38A"
                      cardBg="#FFFFFF"
                      textPrimary="#2A2140"
                      textSecondary="#8478A0"
                      InfoRow={InfoRow}
                      CopyField={CopyField}
                    />
                  )}
                </div>
                </div>
          </SectionWrapper>
        )}

        {triviaHabilitada && triviaPreguntas.length > 0 && (
          <SectionWrapper id="quiz" delay={300} className="w-full py-20 px-6 md:px-12" style={{ background: "#3FBF9F1A" }}>
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

        <div className="w-full flex items-center justify-center gap-2 py-6" style={{ background: '#FFF7F2' }} aria-hidden="true">
          <IconConfetti className="infantil-scroll-doodle opacity-0" style={{ width: 24, height: 12, color: '#FF8AA6' }} />
        </div>

        <LogoFooterCredit bgColor="#FFF7F2" textColor="var(--infantil-ink, #2A2140)" />
        </div>
      </div>

      {isCoverOpen && <BottomNavPill sections={navSections} variant="moderno" accentColor="#29B38A" surfaceColor="#FFFFFF" />}
      </div>
  );
}
