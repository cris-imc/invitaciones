/**
 * NordicoTemplateMarino.tsx
 * Derivado de ModernoTemplate.tsx (misma arquitectura que Chic/Neon/Cine):
 * misma estructura, props, secciones y componentes reutilizados (Countdown,
 * AlbumCarousel, RSVPWizardV2, SongSuggestion, etc). Cambia la capa visual a
 * la estética "Atelier Nórdico" (mockup/nuevo Plantillas Casamiento -> Sol &
 * Bruno): fondo blanco (#FFFFFF) + tinta casi negra (#111111) + acento
 * grafito cálido (#35507A, variable por color), tipografía grotesca
 * geométrica bold (Space Grotesk) para títulos + texto (Inter), CERO radios
 * de borde (esquinas rectas en todo, incluido el bottom-nav), hairlines de
 * 1px como separador en vez de tarjetas rellenas, y doodles de líneas
 * geométricas simples (círculo, cruz de registro, marco tipo póster editorial)
 * en vez de motivos ilustrativos.
 * Gating: esta plantilla solo debe ofrecerse para eventos CASAMIENTO (pack
 * exclusivo de casamiento, ver docs/GUIA_TECNICA_PLANTILLAS.md) — el gating
 * vive en TemplatePreviewModal.tsx, este archivo no valida nada por su cuenta.
 */
"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Space_Grotesk, Inter } from "next/font/google";
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

// Doodles de líneas geométricas simples (mockup Sol & Bruno / Atelier
// Nórdico) en vez de íconos genéricos de librería -- trazo fino, sin relleno,
// coherentes con el motivo "grid tipo póster editorial".
const IconInfo  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><path d="M12 15.5v-4M12 8.2h.01"/></svg>;
const IconCheck = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>;
const IconMusic = ({ className, style }: { className?: string; style?: React.CSSProperties } = {}) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} className={className} style={style} aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 4v16M4 12h16" strokeWidth={1}/></svg>;
const IconMap   = ({ className, style }: { className?: string; style?: React.CSSProperties } = {}) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} style={style} aria-hidden="true"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
const IconGift  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"><rect x="3" y="8" width="18" height="4"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/></svg>;
const IconQuiz  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>;
// Cruz de registro (marca de imprenta/póster editorial) -- decorativa, usada
// en portada/hero y en las esquinas del marco de la foto.
const IconRegisterMark = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.1} className={className} style={style} aria-hidden="true">
    <circle cx="12" cy="12" r="7" />
    <path d="M12 1v6M12 17v6M1 12h6M17 12h6" />
  </svg>
);
// Cuadrado hueco rotado (rombo de esquinas rectas) -- separador de secciones
// y kickers, refuerza el "cero radios" del sistema.
const IconSquareDoodle = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.2} className={className} style={style} aria-hidden="true">
    <rect x="4" y="4" width="12" height="12" transform="rotate(45 10 10)" />
  </svg>
);
// Línea con dos puntos en los extremos -- doodle minimal para dividir
// secciones, tipo "grid de póster" con marcas de alineación.
const IconLineDoodle = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 40 8" fill="none" stroke="currentColor" strokeWidth={1.2} className={className} style={style} aria-hidden="true">
    <circle cx="3" cy="4" r="2.2" fill="currentColor" stroke="none" />
    <path d="M8 4h24" />
    <circle cx="37" cy="4" r="2.2" fill="currentColor" stroke="none" />
  </svg>
);

// Tipografía exacta del mockup "Atelier Nórdico" (Space Grotesk bold display
// + Inter texto), escopeada solo a este componente vía CSS var override en
// el wrapper raíz — no toca layout.tsx ni las demás plantillas que comparten
// --font-cormorant/--font-inter/--font-sans.
const nordicoSpaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--nordico-space-grotesk",
  display: "swap",
});
const nordicoInter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--nordico-inter",
  display: "swap",
});

const CRONO_ICONS: Record<string, string> = {
  Heart: "💛", Music: "🎵", Utensils: "🍽️", Calendar: "📅",
  Gift: "🎁", Camera: "📷", Clock: "🕐",
};

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

interface NordicoTemplateMarinoProps {
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
    <div className="flex items-center justify-between gap-3 py-3 border-b border-[#35507A]/25 last:border-b-0">
      <div className="min-w-0 flex-1">
        <span className="block text-[10px] font-semibold text-[#35507A] uppercase tracking-wider mb-0.5">{label}</span>
        <span className="text-xs sm:text-sm font-mono text-[#111111] break-all">{value}</span>
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
    <div className="flex items-center justify-between gap-3 py-3 border-b border-[#35507A]/25 last:border-b-0">
      <div className="min-w-0 flex-1">
        <span className="block text-[10px] font-semibold text-[#35507A] uppercase tracking-wider mb-0.5">{label}</span>
        <span className="text-sm font-medium text-[#111111] break-words">{value}</span>
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
        <h3 style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "2rem", fontStyle: "italic", color: "#FFFFFF" }}>
          ¡Juego Completado!
        </h3>
        <p style={{ marginTop: "12px", opacity: 0.8, fontFamily: "var(--font-sans)", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.8rem", color: "#111111" }}>
          RESPONDISTE {score} DE {preguntas.length} CORRECTAMENTE ({percent}%)
        </p>
        
        {isSaving ? (
          <p style={{ marginTop: "16px", fontSize: "14px", opacity: 0.7, color: "#6E6E6E" }}>Guardando tus resultados...</p>
        ) : (
          stats && stats.count > 0 && (
            <div style={{ marginTop: "28px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.05)", padding: "8px 16px", borderRadius: "99px", border: "1px solid rgba(255,255,255,0.1)", textAlign: "left", maxWidth: "90%" }}>
                <Users className="w-5 h-5 text-[#35507A] shrink-0" />
                <p style={{ fontSize: "11.5px", margin: 0, opacity: 0.85, lineHeight: 1.4, color: "#111111" }}>
                  El promedio global de aciertos del resto de los invitados ({stats.count}) es del <strong style={{ color: "#FFFFFF" }}>{stats.avg}%</strong>.
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
        <p className="text-[#111111] text-2xl md:text-3xl leading-relaxed tracking-wide" style={{ fontFamily: 'var(--font-cormorant), serif', fontStyle: 'italic', margin: 0, fontWeight: 500, marginBottom: "3.5rem" }}>
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

export function NordicoTemplateMarino({ invitation, guest, isPersonalized = false }: NordicoTemplateMarinoProps) {
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

  // Entrada animada de los doodles de la portada (marcas de registro,
  // cuadrado, línea) con anime.js. Corre una sola vez, cuando la portada
  // aparece (isCoverOpen pasa a false al montar, así que esto dispara en el
  // primer render real).
  const coverRootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isCoverOpen || !coverRootRef.current) return;
    const root = coverRootRef.current;
    animate(root.querySelectorAll(".nordico-doodle"), {
      scale: [0, 1],
      opacity: [0, 1],
      duration: 700,
      delay: stagger(120, { start: 250 }),
      ease: "outQuad",
    });
    animate(root.querySelectorAll(".nordico-seal"), {
      scale: [0.7, 1],
      opacity: [0, 1],
      duration: 600,
      delay: 100,
      ease: "outQuad",
    });
  }, [isCoverOpen]);

  // Doodles del CUERPO de la invitación (divisor, hero, secciones, footer):
  // se animan al entrar en viewport (scroll) con un IntersectionObserver,
  // uno por elemento, disparando una sola vez.
  useEffect(() => {
    if (!isCoverOpen) return;
    const els = document.querySelectorAll(".nordico-scroll-doodle");
    if (!els.length) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animate(entry.target, {
          scale: [0, 1],
          opacity: [0, 1],
          duration: 600,
          ease: "outQuad",
        });
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.3 });
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [isCoverOpen]);

  // Destello geométrico sobre la foto de portada, ligado al progreso de
  // scroll: una línea diagonal fina que cruza la foto + un marco tipo
  // "viewfinder" (corchetes de esquina) que se revela, coherente con el
  // motivo editorial/grid -- nada de blur ni gradientes cálidos.
  const heroPhotoRef = useRef<HTMLDivElement>(null);
  const heroFlareRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isCoverOpen || !heroPhotoRef.current || !heroFlareRef.current) return;
    const flare = heroFlareRef.current;
    const observer = onScroll({
      target: heroPhotoRef.current,
      container: document.body,
      enter: "bottom top",
      leave: "top bottom",
      onUpdate: (self) => {
        const p = self.progress; // 0 a 1 mientras la foto atraviesa el viewport
        const intensity = Math.sin(p * Math.PI); // 0 -> 1 -> 0
        flare.style.opacity = String(intensity * 0.5);
        flare.style.transform = `translateX(${(p * 220) - 60}%)`;
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

  // Portada animada -- mismo criterio que la base de Nordico: effect=
  // "geometric" sin tinte (minimalista, sin acento de color fuerte), texto
  // con clases CSS + media query (.nordico-cover-text/-muted/-line, en el
  // <style jsx> de este archivo). scrimColorRgb = rgb del texto oscuro
  // (#111111, igual en todas las variantes de Nordico).
  const portadaImagenFondoDesktopRaw = String(invitation.portadaImagenFondoDesktop ?? "") || undefined;
  const portadaFondoAnimado = Boolean(portadaImagenFondoDesktopRaw);
  const portadaFondoFallback = !portadaFondoAnimado && tipo === "CASAMIENTO" ? "/fondos/nordico-boda.png" : undefined;
  // Ver nota en NordicoTemplate.tsx (base): Cinzel es la única fuente de
  // título pensada para mayúscula, el resto usa "capitalize".
  const isCinzelTitle = invitation.fontTitle === "cinzel";

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
      <div className="min-h-dvh w-full bg-gradient-to-b from-[#12181A] via-[#161F22] to-[#0B1112] text-white relative overflow-x-hidden flex flex-col justify-between" data-theme={theme}>
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
          <LogoFooterCredit bgColor="transparent" />
        </footer>
      </div>
    );
  }

  return (
    <div
      className={`${nordicoSpaceGrotesk.variable} ${nordicoInter.variable}`}
      style={{
        "--font-cormorant": "var(--nordico-space-grotesk)",
        "--font-inter": "var(--nordico-inter)",
        "--font-sans": "var(--nordico-inter)",
        "--t-acc": "#35507A",
        "--t-acc2": "#35507A",
        "--c-accent": "#35507A",
        "--t-bg": "#FFFFFF",
        "--t-surface": "#F5F4F1",
        "--t-muted": "#6E6E6E",
        // Countdown.tsx/RSVPWizardV2.tsx tienen varios textos hardcodeados
        // como `dark ? var(--chic-ink, #FFFFFF) : "inherit"` -- el nombre de
        // variable está fijo en esos archivos compartidos (no es genérico
        // pese a lo que sugiere la sección 3.4 de la guía técnica) y no se
        // puede tocar esos componentes. Definir `--chic-ink` acá (mismo
        // nombre literal, con nuestro valor) es la única forma de que esos
        // textos internos lean tinta oscura en vez del blanco hardcodeado
        // pensado para Moderno/Neon/Cine -- que no definen esta variable, así
        // que su fallback (#FFFFFF/#EDE9F4) los deja exactamente como estaban.
        "--chic-ink": "#111111",
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
          color: #111111 !important;
        }
        .desktop-stage .tpl .nordico-light-card h4 {
          color: #111111 !important;
        }
        .desktop-stage .tpl .t-kicker,
        .desktop-stage .tpl p.kicker {
          font-family: var(--font-body-custom, var(--font-inter)), sans-serif !important;
          color: #35507A !important;
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

        /* Cero radios en absolutamente todo -- uno de los 3 pilares del
           sistema "Atelier Nórdico" (blanco/negro, hairlines, cero radios). */
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
          color: #111111 !important;
          border-color: rgba(17, 17, 17, 0.25) !important;
        }

        /* Override Countdown Hardcoded Colors -- cifras grandes sin caja,
           separadas por hairlines verticales (calcado del mockup Sol & Bruno). */
        #countdown.dark {
          background-color: #FFFFFF !important;
          margin-top: -2px !important;
          position: relative;
          z-index: 20;
        }
        #countdown[data-style="clasico"].dark > div > div > div {
          background-color: transparent !important;
          border: none !important;
          border-right: 1px solid rgba(17, 17, 17, 0.15) !important;
          border-radius: 0 !important;
        }
        #countdown[data-style="clasico"].dark > div > div > div:last-child {
          border-right: none !important;
        }

        /* RSVP Custom Aesthetics for NordicoTemplateMarino */
        #rsvp.section.dark {
          background-color: #FFFFFF !important;
          color: #111111 !important;
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
          color: #111111 !important;
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
          color: #35507A !important;
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
          color: #6E6E6E !important;
          font-weight: 600 !important;
        }
        #rsvp.section.dark input {
          background-color: #F5F4F1 !important;
          color: #111111 !important;
          border-radius: 0 !important;
          border: 1px solid rgba(17, 17, 17, 0.18) !important;
          padding: 12px 16px !important;
          font-weight: 400 !important;
          font-size: 14px !important;
        }
        #rsvp.section.dark input::placeholder {
          color: #6E6E6E !important;
          opacity: 0.8 !important;
        }
        #rsvp.section.dark .t-btn {
          border-radius: 0 !important;
          padding: 12px 24px !important;
          flex: 1 !important;
          min-width: 120px !important;
          background-color: #111111 !important;
          color: #FFFFFF !important;
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
          border-top: 1px solid rgba(17, 17, 17, 0.14) !important;
          text-align: left !important;
          box-shadow: none !important;
          width: 100% !important;
        }
        #rsvp.section.dark .t-detail h4 {
          color: rgba(17, 17, 17, 0.55) !important;
          font-family: var(--font-body-custom, var(--font-inter)), sans-serif !important;
          text-transform: uppercase !important;
          font-size: 10px !important;
          letter-spacing: 0.05em !important;
          font-weight: 600 !important;
          opacity: 1 !important;
          margin-bottom: 6px !important;
        }
        #rsvp.section.dark .t-detail p {
          color: rgba(17, 17, 17, 0.72) !important;
          font-size: 13px !important;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        #rsvp.section.dark .t-detail p b {
          font-size: 1.1rem !important;
          color: #111111 !important;
          font-weight: 600 !important;
        }
        #rsvp.section.dark .t-detail span {
          color: rgba(17, 17, 17, 0.45) !important;
          font-size: 12px !important;
        }

        /* SongSuggestion Custom Aesthetics */
        #songs.d-sec.dark {
          background-color: #F0EFEB !important;
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
          color: #35507A !important;
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
          background-color: #FFFFFF !important;
          color: #111111 !important;
          padding: 24px 24px 38px 24px !important;
          text-align: center;
          border-top: 1px solid rgba(17, 17, 17, 0.1) !important;
        }
        .desktop-stage .d-foot .mono {
          color: #35507A !important;
          font-family: var(--font-title, var(--font-cormorant)), sans-serif !important;
          font-size: 20px !important;
          margin-bottom: 8px !important;
        }

        /* Bank Section Overrides */
        #banco .t-kicker {
          text-align: left !important;
        }
        #banco .copy-btn {
          background-color: #111111 !important;
          color: #FFFFFF !important;
          border: none !important;
          border-radius: 0 !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
        }
        #banco .copy-btn.copied {
          background-color: #35507A !important;
          color: #FFFFFF !important;
        }

        /* Bottom Nav -- barra flotante oscura de cero radios (el único
           elemento de la plantilla que se mantiene oscuro a propósito,
           como chip de sistema flotando sobre el contenido claro). */
        .desktop-stage .bottom-nav {
          position: fixed !important;
          bottom: 24px !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          display: flex !important;
          justify-content: space-between !important;
          background: rgba(17, 17, 17, 0.95) !important;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3) !important;
          backdrop-filter: blur(12px) !important;
          width: calc(100% - 32px) !important;
          max-width: 360px !important;
          padding: 14px 10px !important;
          border-radius: 0 !important;
          z-index: 999999 !important;
        }
        .desktop-stage .bottom-nav a {
          color: #FFFFFF !important;
          opacity: 0.6 !important;
        }
        .desktop-stage .bottom-nav a[aria-current="true"] {
          opacity: 1 !important;
          color: #C9B08A !important;
        }
      `}</style>
      
      {/* PORTADA / WELCOME OVERLAY -- blanco puro, sin blur atmosférico
          (el "destello" acá es geométrico: marcas de registro + línea que se
          expande, no un glow difuso, coherente con la estética editorial). */}
      {!isCoverOpen && (
        <div
          ref={coverRootRef}
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100dvh', zIndex: 99999, backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: '25vh', overflow: 'hidden', ...getTypographyCssVars(invitation.fontTitle as string, invitation.fontBody as string) }}
          className={`text-[#111111] ${isClosingCover ? "acp-cover-exit" : "transition-all duration-1000 animate-in fade-in"}`}
        >
          {/* Doodles decorativos (marcas de registro, cuadrado, línea de
              alineación) -- animados de entrada con anime.js (ver useEffect
              de coverRootRef), inertes hasta que corre el JS (opacity-0). */}
          {portadaFondoAnimado && (
            <div className="acp-mobile-only">
              <AnimatedCoverPhoto
                photoSrc={portadaImagenFondoDesktopRaw as string}
                effect="geometric"
                tint={false}
                scrimColorRgb="17,17,17"
              />
            </div>
          )}
          <div className={portadaFondoAnimado ? "acp-desktop-only" : undefined}>
          <IconRegisterMark className="nordico-doodle opacity-0 absolute" style={{ width: 26, height: 26, top: '10%', left: '11%', color: 'rgba(53,80,122,0.55)' }} />
          <IconSquareDoodle className="nordico-doodle opacity-0 absolute" style={{ width: 16, height: 16, top: '14%', right: '13%', color: 'rgba(53,80,122,0.5)' }} />
          <IconLineDoodle className="nordico-doodle opacity-0 absolute" style={{ width: 40, height: 8, bottom: '22%', left: '10%', color: 'rgba(53,80,122,0.4)' }} />
          <IconRegisterMark className="nordico-doodle opacity-0 absolute" style={{ width: 14, height: 14, bottom: '27%', right: '16%', color: 'rgba(53,80,122,0.4)' }} />
          </div>

          {portadaFondoFallback && (
            <CoverFallbackBg photoSrc={portadaFondoFallback} />
          )}
          <div style={{ textAlign: 'center', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', position: 'relative' }}>

            <div className="nordico-seal opacity-0" style={{
              width: 40, height: 40, border: '1px solid #35507A',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#35507A',
            }}>
              {monogram}
            </div>

            {/* Guest Name */}
            <h2 className={`text-3xl sm:text-4xl font-bold tracking-tight leading-tight${portadaFondoAnimado ? " nordico-cover-text" : ""}`} style={{ fontFamily: 'var(--font-title, var(--font-cormorant)), sans-serif', color: portadaFondoAnimado ? undefined : '#111111', textTransform: isCinzelTitle ? 'uppercase' : 'capitalize' }}>
              {guestNameDisplay}
            </h2>

            <div className={`nordico-lineExpand${portadaFondoAnimado ? " nordico-cover-line" : ""}`} style={{ width: 40, height: 2, background: portadaFondoAnimado ? undefined : '#111111', margin: '0.25rem 0' }} />

            {/* Dress Code */}
            {Boolean(activeDressCode) && (
              <p className={`text-sm font-medium tracking-wide uppercase${portadaFondoAnimado ? " nordico-cover-text-muted" : ""}`} style={{ fontFamily: "var(--font-body-custom, var(--font-inter)), sans-serif", letterSpacing: "0.2em", opacity: 0.8, color: portadaFondoAnimado ? undefined : '#6E6E6E' }}>
                Dress code: {activeDressCode}
              </p>
            )}

            {/* Botón relleno, cero radios, calcado del mockup Sol & Bruno. */}
            <button
              type="button"
              onClick={openInvitation}
              className="inline-block font-semibold text-xs tracking-[0.2em] px-10 py-3 transition-colors duration-300 cursor-pointer"
              style={{
                fontFamily: 'var(--font-body-custom, var(--font-inter)), sans-serif', border: '1px solid #111111', color: '#FFFFFF',
                background: '#111111', borderRadius: 0,
                marginTop: '0.75rem',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.color = '#111111'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#111111'; e.currentTarget.style.color = '#FFFFFF'; }}
            >
              ABRIR INVITACIÓN
            </button>

          </div>

          <style jsx>{`
            .nordico-lineExpand { animation: nordico-lineExpand 1.2s ease-out; }
            @keyframes nordico-lineExpand { 0% { width: 0; } 100% { width: 40px; } }
            .nordico-cover-text { color: #FFFFFF; }
            .nordico-cover-text-muted { color: rgba(255,255,255,0.75); }
            .nordico-cover-line { background: #FFFFFF; }
            @media (min-width: 768px) {
              .nordico-cover-text { color: #111111; }
              .nordico-cover-text-muted { color: #6E6E6E; }
              .nordico-cover-line { background: #111111; }
            }
          `}</style>
          <style>{COVER_EXIT_STYLE}{COVER_RESPONSIVE_STYLE}{COVER_FALLBACK_STYLE}</style>
        </div>
      )}

      {/* Sticky Ticket Bubble via Portal */}
      {mounted && isPersonalized && guest && isCoverOpen && createPortal(
        <div
          onClick={() => setIsTicketMaximized(!isTicketMaximized)}
          className={`fixed top-3 left-1/2 -translate-x-1/2 z-[99999] transition-all duration-500 cursor-pointer overflow-hidden border border-[#35507A]/40 shadow-md ${isTicketMaximized ? 'bg-[#FFFFFF]/95 backdrop-blur-md w-[90%] max-w-sm px-5 py-2.5' : 'bg-[#111111]/95 backdrop-blur-md px-5 py-2'}`}
        >
          {isTicketMaximized ? (
            <div className="flex items-center justify-between w-full animate-in fade-in duration-300">
              <div className="flex flex-col text-left">
                <span className=" text-[8px] font-semibold uppercase tracking-[0.2em] text-[#35507A] leading-none mb-1" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>Pase Especial</span>
                <span className="text-[#111111] font-bold text-sm leading-none" style={{ fontFamily: 'var(--font-cormorant), serif' }}>{guest.name}</span>
              </div>
              <div className="flex flex-col items-end border-l border-[#35507A]/20 pl-3">
                <span className="text-[#111111] font-bold text-sm leading-none">{guest.expectedCount}</span>
                <span className="text-[#6E6E6E] text-[8px] uppercase tracking-wider leading-none mt-1">{guest.expectedCount === 1 ? 'Lugar' : 'Lugares'}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 animate-in fade-in duration-300">
              <Ticket className="w-4 h-4 text-[#C9B08A]" />
              <span className="text-[#FFFFFF]  text-[10px] font-semibold tracking-wider uppercase" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>Pase</span>
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
        // Este wrapper (vista de escritorio) necesita las mismas CSS vars de
        // color que el wrapper de mobile de más arriba -- ver sección 3.2 de
        // docs/GUIA_TECNICA_PLANTILLAS.md.
        "--t-acc": "#35507A",
        "--t-acc2": "#35507A",
        "--c-accent": "#35507A",
        "--t-bg": "#FFFFFF",
        "--t-surface": "#F5F4F1",
        "--t-muted": "#6E6E6E",
        "--chic-ink": "#111111",
      } as React.CSSProperties}>
      <aside className="d-left hide-mobile" style={{ position: "relative", overflow: "hidden" }}>
        <div
          className="hero-photo"
          style={heroBgDesktop ? {
            backgroundImage: `url(${heroBgDesktop})`,
            backgroundSize: "cover",
            backgroundPosition: `${Number(invitation.portadaImagenDesktopPosX ?? 50)}% ${Number(invitation.portadaImagenDesktopPosY ?? 50)}%`,
            backgroundRepeat: "no-repeat"
          } : undefined}
        />
        {/* Marco fino + marcas de registro en las esquinas, calcado del
            motivo editorial/póster del mockup Sol & Bruno -- estático en
            escritorio (el destello ligado al scroll vive en mobile). */}
        <div className="absolute inset-3 pointer-events-none z-20" aria-hidden="true">
          <div className="absolute inset-0" style={{ border: "1px solid rgba(255,255,255,0.7)" }} />
          <IconRegisterMark style={{ position: "absolute", top: -11, left: -11, width: 20, height: 20, color: "#FFFFFF" }} />
          <IconRegisterMark style={{ position: "absolute", bottom: -11, right: -11, width: 20, height: 20, color: "#FFFFFF" }} />
        </div>
        <div className="d-left-top drop-shadow-md">
          <div className="seal" style={{ borderColor: "white", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
            <span style={{ color: "white", fontFamily: "var(--font-cormorant), serif", textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>{monogram}</span>
          </div>
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
          <div style={{ width: 40, height: 2, background: '#35507A', margin: '6px 0 14px', animation: 'nordico-lineExpand 1.2s ease-out' }} />
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
        <div className="hide-desktop w-full flex flex-col min-h-[100dvh] bg-[#FFFFFF]">
          {/* Text Container */}
          <div className="px-8 pt-16 pb-12 text-left bg-[#FFFFFF] z-10 relative">
            <p className=" text-xs font-semibold uppercase tracking-[0.2em] text-[#35507A] mb-6" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
              {eyebrow}
            </p>
            <h1 className="text-[4rem] font-light text-[#111111] leading-[1.0] mb-3" style={{ fontFamily: 'var(--font-title, var(--font-cormorant)), serif' }}>
              {em ? (
                <>
                  <span className="block">{title.slice(0, title.indexOf(em)).trim()}</span>
                  <span className="block"><em style={{ fontFamily: 'var(--font-cormorant), serif', fontStyle: 'italic', color: '#35507A' }}>&amp;</em> {em.replace('& ', '').trim()}</span>
                </>
              ) : (
                <span className="block">{title}</span>
              )}
            </h1>
            <div style={{ width: 40, height: 2, background: '#35507A', margin: '0 0 20px', animation: 'nordico-lineExpand 1.2s ease-out' }} />
            <p className=" text-sm font-medium text-[#6E6E6E] tracking-wide" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
              {fechaStr}{lugarNombre ? ` · ${lugarNombre}` : ""}{ciudad ? ` — ${ciudad}` : ""}
            </p>
            {Boolean(activeDressCode) && (
              <p className=" text-xs font-semibold text-[#35507A] tracking-widest uppercase mt-4" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                Dress code: {activeDressCode}
              </p>
            )}
          </div>
          
          {/* Image Container -- marco fino + marcas de registro en las 4
              esquinas + línea diagonal ligada al scroll (ver useEffect de
              heroPhotoRef), coherente con el motivo editorial/póster. */}
          <div ref={heroPhotoRef} className="flex-1 w-full relative overflow-hidden">
            <div className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none z-10" style={{ background: 'linear-gradient(to bottom, transparent 0%, #FFFFFF 100%)' }} />
            <div
              className="absolute inset-0 w-full h-full"
              style={heroBgMobile ? {
                backgroundImage: `url(${heroBgMobile})`,
                backgroundSize: "cover",
                backgroundPosition: `${Number(invitation.portadaImagenPosX ?? 50)}% ${Number(invitation.portadaImagenPosY ?? 50)}%`,
                backgroundRepeat: "no-repeat"
              } : { backgroundColor: '#F5F4F1' }}
            />
            {/* Línea diagonal fina tipo "destello geométrico", ligada al
                progreso de scroll. */}
            <div ref={heroFlareRef} className="pointer-events-none z-20" style={{ position: "absolute", top: 0, bottom: 0, left: "-10%", width: "1px", background: "rgba(255,255,255,0.9)", boxShadow: "0 0 12px 1px rgba(255,255,255,0.6)", opacity: 0 }} />
            <div className="absolute inset-3 pointer-events-none z-20" aria-hidden="true">
              <div className="absolute inset-0" style={{ border: "1px solid rgba(255,255,255,0.7)" }} />
              <IconRegisterMark style={{ position: "absolute", top: -11, left: -11, width: 20, height: 20, color: "#FFFFFF" }} />
              <IconRegisterMark style={{ position: "absolute", bottom: -11, right: -11, width: 20, height: 20, color: "#FFFFFF" }} />
              <IconSquareDoodle style={{ position: "absolute", top: -8, right: -8, width: 14, height: 14, color: "#FFFFFF" }} />
            </div>
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
            title={tipo === "CASAMIENTO" ? "Faltan poquitos días" : "La cuenta ya empezó"}
            dark
          />
        ) : null}

        {(Boolean(invitation.frasePersonalizadaHabilitada) && Boolean(invitation.frasePersonalizadaTexto)) ? (
          <SectionWrapper id="quote" delay={100} className="w-full py-24 px-6 md:px-12 flex items-center justify-center" style={{ background: "linear-gradient(160deg, #8A857814, transparent 70%), #F5F4F1" }}>
            <div className="max-w-2xl mx-auto text-center">
              <div className="flex justify-center mb-6">
                <DrawLucideIcon icon={BookOpen} size={46} color="var(--t-acc)" strokeWidth={1.5} />
              </div>
              <TypewriterText 
                text={`"${String(invitation.frasePersonalizadaTexto)}"`}
                className="text-[#111111] text-2xl md:text-3xl leading-relaxed tracking-wide" 
                style={{ fontFamily: 'var(--font-cormorant), serif', fontStyle: 'italic', margin: 0, fontWeight: 500 }}
              />
            </div>
          </SectionWrapper>
        ) : null}

        {/* Divisor doodle tipo "grid editorial": línea con marcas de
            alineación, entre el hero y la cuenta regresiva. */}
        <div className="w-full flex items-center justify-center gap-3 py-8 bg-[#FFFFFF]" aria-hidden="true">
          <div style={{ width: 40, height: 1, background: 'rgba(17,17,17,0.18)' }} />
          <IconLineDoodle className="nordico-scroll-doodle opacity-0" style={{ width: 28, height: 6, color: '#35507A' }} />
          <div style={{ width: 40, height: 1, background: 'rgba(17,17,17,0.18)' }} />
        </div>

        <SectionWrapper id="details" delay={150} className="w-full bg-[#FFFFFF] py-20 px-6 md:px-12">
          <div className="w-full max-w-[340px] sm:max-w-xl mx-auto text-left">
            <div className="flex justify-center mb-4">
              <DrawLucideIcon icon={CalendarDays} size={46} color="var(--t-acc)" strokeWidth={1.5} />
            </div>
            <p className="t-kicker mb-8 flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase text-[#35507A]" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
              CUÁNDO Y DÓNDE
            </p>

            {/* TARJETA 1: CEREMONIA / CIVIL (Si está cargada) -- hairline en
                vez de tarjeta rellena, coherente con el sistema "cero radios". */}
            {(Boolean(invitation.ceremoniaHabilitada) || Boolean(invitation.ceremoniaNombre) || Boolean(invitation.ceremoniaDireccion)) && (
              <div className="border border-[#111111]/12 border-l-2 border-l-[#35507A] p-6 sm:p-8 mb-6">
                <div>
                  <span className=" text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6E6E6E] block mb-3" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                    {String(invitation.ceremoniaTitulo || "CEREMONIA")}
                  </span>
                  {Boolean(invitation.ceremoniaNombre) && (
                    <h4 className="text-2xl sm:text-3xl font-semibold text-[#111111] mb-3" style={{ fontFamily: 'var(--font-cormorant), sans-serif' }}>
                      {String(invitation.ceremoniaNombre)}
                    </h4>
                  )}
                  {Boolean(invitation.ceremoniaHora) && (
                    <p className="text-[#6E6E6E]  text-sm sm:text-base mb-1" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                      {String(invitation.ceremoniaHora)} hs
                    </p>
                  )}
                  {Boolean(invitation.ceremoniaDireccion) && (
                    <p className="text-[#6E6E6E]  text-sm sm:text-base mb-4" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                      {String(invitation.ceremoniaDireccion)}
                    </p>
                  )}
                  {Boolean(invitation.ceremoniaMapUrl) && (
                    <a href={String(invitation.ceremoniaMapUrl)} target="_blank" rel="noopener noreferrer" className="inline-block mt-1  text-xs font-semibold tracking-wider text-[#35507A] hover:text-[#111111] transition-colors" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                      Ver mapa ceremonia ↗
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* TARJETA 2: FIESTA / SALÓN (Siempre visible si se ingresó lugar o dirección) */}
            {(lugarNombre || direccion) && (
              <div className="border border-[#111111]/12 border-l-2 border-l-[#35507A] p-6 sm:p-8 mb-10">
                <span className=" text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6E6E6E] block mb-3" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                  FIESTA / SALÓN
                </span>
                {lugarNombre && (
                  <h4 className="text-2xl sm:text-3xl font-semibold text-[#111111] mb-3" style={{ fontFamily: 'var(--font-cormorant), sans-serif' }}>
                    {lugarNombre}
                  </h4>
                )}
                {hora && (
                  <p className="text-[#6E6E6E]  text-sm sm:text-base mb-1" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                    {hora} hs
                  </p>
                )}
                {direccion && (
                  <p className="text-[#6E6E6E]  text-sm sm:text-base mb-4" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                    {direccion}
                  </p>
                )}
                {mapUrl && (
                  <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-1  text-xs font-semibold tracking-wider text-[#35507A] hover:text-[#111111] transition-colors" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                    Ver mapa fiesta ↗
                  </a>
                )}
              </div>
            )}

            {/* CRONOGRAMA DE ACTIVIDADES (Si existe) */}
            {cronograma.length > 0 && (
              <div className="mt-16">
                <div className="flex justify-center mb-4">
                  <DrawLucideIcon icon={Clock} size={46} color="var(--t-acc)" strokeWidth={1.5} />
                </div>
                <p className="t-kicker mb-6 flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase text-[#35507A]" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                  CRONOGRAMA
                </p>
                <div className="flex flex-col w-full">
                  {cronograma.map((item, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center py-4 border-b border-[#111111]/10 last:border-b-0">
                      {item.time && (
                        <span className=" text-sm sm:text-base text-[#6E6E6E] font-medium w-24 flex-shrink-0 mb-1 sm:mb-0" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                          {item.time}
                        </span>
                      )}
                      <span className="text-[1.2rem] sm:text-[1.3rem] text-[#111111] font-semibold" style={{ fontFamily: 'var(--font-cormorant), sans-serif' }}>
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
          <SectionWrapper id="album" delay={200} className="w-full bg-[#F5F4F1] py-20 overflow-hidden">
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
          <SectionWrapper id="banco" delay={200} className="w-full bg-[#F0EFEB] py-20 px-6 md:px-12 overflow-hidden">
            <div className="w-full max-w-[340px] sm:max-w-xl mx-auto text-left">
                <div className="flex justify-center mb-4">
                  <DrawLucideIcon icon={Landmark} size={46} color="var(--t-acc)" strokeWidth={1.5} />
                </div>
                <p className="t-kicker mb-10 flex items-center gap-2 text-[#35507A]">
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
                      accentColor="#35507A"
                      cardBg="#F5F4F1"
                      textPrimary="#111111"
                      textSecondary="#6E6E6E"
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
                      accentColor="#35507A"
                      cardBg="#F5F4F1"
                      textPrimary="#111111"
                      textSecondary="#6E6E6E"
                      InfoRow={InfoRow}
                      CopyField={CopyField}
                    />
                  )}
                </div>
                </div>
          </SectionWrapper>
        )}

        {triviaHabilitada && triviaPreguntas.length > 0 && (
          <SectionWrapper id="quiz" delay={300} className="w-full py-20 px-6 md:px-12" style={{ background: "linear-gradient(160deg, #8A857818, transparent 70%), #F0EFEB" }}>
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

        {/* Separador doodle de footer: línea con marcas de registro. */}
        <div className="w-full flex items-center justify-center gap-2 py-6" style={{ background: '#FFFFFF' }} aria-hidden="true">
          <div style={{ width: 28, height: 1, background: 'rgba(17,17,17,0.15)' }} />
          <IconRegisterMark className="nordico-scroll-doodle opacity-0" style={{ width: 14, height: 14, color: '#35507A' }} />
          <div style={{ width: 28, height: 1, background: 'rgba(17,17,17,0.15)' }} />
        </div>

        <LogoFooterCredit bgColor="#FFFFFF" textColor="var(--chic-ink, #111111)" />
        </div>
      </div>

      {isCoverOpen && <BottomNavPill sections={navSections} variant="moderno" accentColor="#C9B08A" surfaceColor="#111111" />}
      </div>
  );
}

