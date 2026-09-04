/**
 * CorporateTemplateVerde.tsx
 * Derivado de ModernoTemplate.tsx: misma estructura, props, secciones y componentes
 * reutilizados (Countdown, AlbumCarousel, RSVPWizardV2, SongSuggestion, etc).
 * Cambia la capa visual a la estética "Minimal Corporate" (mockup/nuevo/Plantillas
 * Eventos Genéricos.dc.html, tema "Encuentro Anual"): fondo grafito (#0E1512) +
 * acento azul eléctrico (#34C77B, variable por color), tipografía Space Grotesk
 * (display) + Sora (texto), doodles geométricos de trazo fino (nodos/red, barras,
 * target, grilla de puntos) en vez de motivos decorativos "cálidos" -- sobria,
 * pensada para eventos de empresa / encuentros corporativos.
 * Gating: esta plantilla solo debe ofrecerse para eventos CUMPLEANOS (el gating
 * vive en TemplatePreviewModal.tsx, este archivo no valida nada por su cuenta).
 */
"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Space_Grotesk, Sora } from "next/font/google";
import { animate, stagger, onScroll } from "animejs";
import { AlbumCarousel } from "@/components/invitation/v2/AlbumCarousel";
import { Album } from "@/components/invitation/v2/Album";
import { AnimatedCoverPhoto, COVER_EXIT_STYLE, COVER_RESPONSIVE_STYLE } from "@/components/invitation/v2/AnimatedCoverPhoto";
import { Countdown } from "@/components/invitation/v2/Countdown";
import { SaveTheDate } from "@/components/invitation/v2/SaveTheDate";
import { RSVPWizardV2 } from "@/components/invitation/v2/RSVPWizardV2";
import { SongSuggestion } from "@/components/invitation/v2/SongSuggestion";
import { InfoAdicionalSection } from "@/components/invitation/v2/InfoAdicionalSection";
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

// Tipografía "Minimal Corporate" (Space Grotesk display + Sora texto), escopeada
// solo a este componente vía CSS var override en el wrapper raíz.
const corporateSpaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--corporate-space-grotesk",
  display: "swap",
});
const corporateSora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--corporate-sora",
  display: "swap",
});

// Doodles geométricos de trazo fino -- "Minimal Corporate": nodos de red,
// barras, target/objetivo, grilla de puntos. Nada de íconos genéricos de
// librería; coherentes con el motivo de "encuentro/equipo/resultados".
const IconInfo  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 16v-5M12 8h.01"/></svg>;
const IconCheck = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>;
const IconMusic = ({ className, style }: { className?: string; style?: React.CSSProperties } = {}) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} className={className} style={style} aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="1.5"/><path d="M9 16V9l6-1.2V14"/><circle cx="8" cy="16" r="1.3"/><circle cx="14" cy="14.8" r="1.3"/></svg>;
const IconMap   = ({ className, style }: { className?: string; style?: React.CSSProperties } = {}) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} style={style} aria-hidden="true"><path d="M9 4 3 6.5v14L9 18l6 2.5 6-2.5v-14L15 6.5 9 4Z"/><path d="M9 4v14M15 6.5v14"/></svg>;
const IconGift  = ({ className, style }: { className?: string; style?: React.CSSProperties } = {}) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} style={style} aria-hidden="true"><rect x="3" y="8" width="18" height="13" rx="1"/><path d="M3 8h18v4H3z"/><path d="M12 8v13"/><path d="M12 8c-1.5-4-6-4-6-1s4.5 1 6 1Zm0 0c1.5-4 6-4 6-1s-4.5 1-6 1Z"/></svg>;
const IconQuiz  = ({ className, style }: { className?: string; style?: React.CSSProperties } = {}) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} style={style} aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9a3 3 0 0 1 5.5 1.7c0 1.7-2.5 2-2.5 3.8"/><path d="M12 17.5h.01"/></svg>;
// Nodos de red conectados -- decorativa de portada, motivo "encuentro/equipo".
const IconNode = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 32 24" fill="none" stroke="currentColor" strokeWidth={1.1} className={className} style={style} aria-hidden="true">
    <circle cx="8" cy="6" r="3" />
    <circle cx="24" cy="6" r="3" />
    <circle cx="16" cy="19" r="3" />
    <path d="M10.6 7.9 14 16.6M21.4 7.9 18 16.6M11 6h10" strokeWidth={0.9} />
  </svg>
);
// Barras ascendentes -- separadores / kickers de sección.
const IconBars = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 18" fill="none" stroke="currentColor" strokeWidth={1.4} className={className} style={style} aria-hidden="true">
    <path d="M3 16V11M9 16V6M15 16V10M21 16V2" strokeLinecap="round" />
  </svg>
);
// Target/objetivo -- kicker de RSVP / confirmación.
const IconTarget = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} className={className} style={style} aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);
// Grilla de puntos -- motivo de esquina del marco de la foto de portada.
const IconGridDots = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 20 20" fill="currentColor" stroke="none" className={className} style={style} aria-hidden="true">
    {[0, 1, 2].flatMap((row) => [0, 1, 2].map((col) => (
      <circle key={`${row}-${col}`} cx={3 + col * 7} cy={3 + row * 7} r={1.3} />
    )))}
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

interface CorporateTemplateVerdeProps {
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
    <div className="flex items-center justify-between gap-3 py-3 border-b border-[#34C77B]/20 last:border-b-0">
      <div className="min-w-0 flex-1">
        <span className="block text-[10px] font-semibold text-[#34C77B] uppercase tracking-wider mb-0.5">{label}</span>
        <span className="text-xs sm:text-sm font-mono text-[#EDEFF5] break-all">{value}</span>
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
    <div className="flex items-center justify-between gap-3 py-3 border-b border-[#34C77B]/20 last:border-b-0">
      <div className="min-w-0 flex-1">
        <span className="block text-[10px] font-semibold text-[#34C77B] uppercase tracking-wider mb-0.5">{label}</span>
        <span className="text-sm font-medium text-[#EDEFF5] break-words">{value}</span>
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
        <h3 style={{ fontFamily: "var(--font-cormorant), sans-serif", fontSize: "2rem", color: "#EDEFF5" }}>
          ¡Juego Completado!
        </h3>
        <p style={{ marginTop: "12px", opacity: 0.8, fontFamily: "var(--font-sans)", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.8rem", color: "#EDEFF5" }}>
          RESPONDISTE {score} DE {preguntas.length} CORRECTAMENTE ({percent}%)
        </p>

        {isSaving ? (
          <p style={{ marginTop: "16px", fontSize: "14px", opacity: 0.7, color: "#8990A6" }}>Guardando tus resultados...</p>
        ) : (
          stats && stats.count > 0 && (
            <div style={{ marginTop: "28px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.05)", padding: "8px 16px", border: "1px solid rgba(255,255,255,0.1)", textAlign: "left", maxWidth: "90%" }}>
                <Users className="w-5 h-5 text-[#34C77B] shrink-0" />
                <p style={{ fontSize: "11.5px", margin: 0, opacity: 0.85, lineHeight: 1.4, color: "#EDEFF5" }}>
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
        <p className="text-[#EDEFF5] text-2xl md:text-3xl leading-relaxed tracking-wide" style={{ fontFamily: 'var(--font-cormorant), sans-serif', margin: 0, fontWeight: 500, marginBottom: "3.5rem" }}>
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
                className={`px-5 py-2.5 border text-sm transition-all hover:bg-[var(--t-acc)] hover:text-[var(--t-onacc)] ${className}`}
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

export function CorporateTemplateVerde({ invitation, guest, isPersonalized = false }: CorporateTemplateVerdeProps) {
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

  // Entrada animada de los doodles de portada (nodos, barras, target) con
  // anime.js -- corre una sola vez, cuando la portada aparece.
  const coverRootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isCoverOpen || !coverRootRef.current) return;
    const root = coverRootRef.current;
    animate(root.querySelectorAll(".corporate-doodle"), {
      scale: [0, 1],
      rotate: [-10, 0],
      opacity: [0, 1],
      duration: 800,
      delay: stagger(130, { start: 280 }),
      ease: "outBack",
    });
    animate(root.querySelectorAll(".corporate-seal"), {
      scale: [0.6, 1],
      opacity: [0, 1],
      duration: 650,
      delay: 140,
      ease: "outQuad",
    });
  }, [isCoverOpen]);

  // Doodles del cuerpo: reveal al entrar en viewport, una sola vez por
  // elemento (IntersectionObserver + anime.js).
  useEffect(() => {
    if (!isCoverOpen) return;
    const els = document.querySelectorAll(".corporate-scroll-doodle");
    if (!els.length) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animate(entry.target, {
          scale: [0, 1],
          rotate: [-8, 0],
          opacity: [0, 1],
          duration: 700,
          ease: "outBack",
        });
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.3 });
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [isCoverOpen]);

  // Efecto de "vidrio/reflejo de sala de reuniones": una franja diagonal de
  // luz fría y sobria que atraviesa la foto de portada al hacer scroll --
  // como el reflejo de un panel de vidrio corporativo, no un destello cálido.
  const heroPhotoRef = useRef<HTMLDivElement>(null);
  const heroSheenRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isCoverOpen || !heroPhotoRef.current || !heroSheenRef.current) return;
    const sheen = heroSheenRef.current;
    const observer = onScroll({
      target: heroPhotoRef.current,
      container: getScrollContainer(heroPhotoRef.current),
      enter: "bottom top",
      leave: "top bottom",
      onUpdate: (self) => {
        const p = self.progress;
        const intensity = Math.sin(p * Math.PI);
        sheen.style.opacity = String(intensity * 0.35);
        sheen.style.transform = `translateX(${p * 220 - 60}%) skewX(-18deg)`;
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
  const guestPayStatus = paymentEnabled ? ((guest?.paymentStatus ?? "PENDING") as "PENDING" | "PARTIAL" | "EXEMPT" | "PAID") : undefined;
  // Monto ya abonado (pagos parciales de familias/grupos): el mismo patron que
  // el resto de los campos que el tipo local de guest no declara.
  const guestPaidAmount = paymentEnabled ? Number((guest as any)?.paidAmount ?? 0) : 0;

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

  // Portada animada -- effect="geometric" (sobria, sin blur/Ken Burns) y sin
  // tinte, mismo criterio que la base de Corporate. scrimColorRgb = rgb del
  // propio bg oscuro de esta variante (a diferencia de Cine, en Corporate
  // cada variante tiene su propio bg, no uno compartido).
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
      <div className="min-h-dvh w-full bg-gradient-to-b from-[#0E1512] via-[#12151F] to-[#0A0C12] text-white relative overflow-x-hidden flex flex-col justify-between" data-theme={theme}>
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[600px] h-[600px] bg-[var(--accent)]/10 rounded-full blur-[120px] pointer-events-none" aria-hidden="true" />
        <div className="absolute right-0 bottom-0 w-[500px] h-[500px] bg-[var(--accent)]/10 rounded-full blur-[120px] pointer-events-none" aria-hidden="true" />

        <main className="relative z-10 max-w-5xl mx-auto w-full px-4 md:px-6 py-12 lg:py-20">
          <div className="rounded-none bg-black/40 border border-white/10 shadow-2xl backdrop-blur-3xl text-center max-w-4xl mx-auto relative overflow-hidden flex flex-col">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-gradient-to-r from-transparent via-[#34C77B]/50 to-transparent" />

            <div className="p-10 md:p-16 space-y-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-sans font-light text-white tracking-wide drop-shadow-md">
                Un encuentro <AnimatedSynonyms words={["inolvidable", "único", "memorable", "especial"]} className="text-[#34C77B]/90 font-sans" />
              </h1>

              <div className="flex justify-center items-center gap-4 py-2 opacity-60">
                <div className="h-[1px] w-12 bg-white/20" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#34C77B]/50" />
                <div className="h-[1px] w-12 bg-white/20" />
              </div>

              <p className="text-lg md:text-xl text-slate-300 leading-relaxed font-sans max-w-2xl mx-auto font-light tracking-wide" >
                Gracias por acompañarnos en este día y compartir la alegría de crear recuerdos que perdurarán.
              </p>

              <div className="pt-6">
                <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/5 border border-white/10 text-slate-300 text-xs tracking-widest uppercase backdrop-blur-md" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34C77B]/80 animate-pulse" />
                  <span>Álbum disponible hasta el {expirationDateStr}</span>
                </div>
              </div>
            </div>

            <SectionWrapper id="album" className="w-full bg-black/20 border-t border-white/5 py-8 md:py-12">
              <div className="px-4 md:px-10">
                {livePhotos.length > 0 ? (
                  <div className="w-full overflow-hidden shadow-xl ring-1 ring-white/10">
                    <AlbumCarousel photos={livePhotos} hideHeader={true} />
                  </div>
                ) : (
                  <div className="text-center space-y-3">
                    <h3 className="font-sans font-light text-xl text-slate-200 tracking-wide">
                      Álbum Fotográfico
                    </h3>
                    <p className="text-sm text-slate-400 font-light tracking-wide" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
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
      className={`${corporateSpaceGrotesk.variable} ${corporateSora.variable}`}
      style={{
        "--font-cormorant": "var(--corporate-space-grotesk)",
        "--font-inter": "var(--corporate-sora)",
        "--font-sans": "var(--corporate-sora)",
        "--t-acc": "#34C77B",
        "--t-acc2": "#34C77B",
        "--c-accent": "#34C77B",
        "--t-bg": "#0E1512",
        "--t-surface": "#16211C",
        "--t-muted": "#8990A6",
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
          color: #EDEFF5 !important;
        }
        .desktop-stage .tpl .moderno-light-card h4 {
          color: #0E1512 !important;
        }
        .desktop-stage .tpl .t-kicker,
        .desktop-stage .tpl p.kicker {
          font-family: var(--font-body-custom, var(--font-inter)), sans-serif !important;
          color: #34C77B !important;
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

        /* Sin esquinas redondeadas -- estética sobria/corporativa */
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
          color: #ffffff !important;
          border-color: rgba(255, 255, 255, 0.3) !important;
        }

        #countdown.dark {
          background-color: #0E1512 !important;
          margin-top: -2px !important;
          position: relative;
          z-index: 20;
        }
        #countdown[data-style="clasico"].dark > div > div > div {
          background-color: rgba(0, 0, 0, 0.2) !important;
          border-color: rgba(92, 141, 255, 0.25) !important;
        }

        #rsvp.section.dark {
          background-color: #0E1512 !important;
          color: #EDEFF5 !important;
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
          color: #EDEFF5 !important;
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
          color: #34C77B !important;
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
          color: #8990A6 !important;
          font-weight: 600 !important;
        }
        #rsvp.section.dark input {
          background-color: #16211C !important;
          color: #EDEFF5 !important;
          border: 1px solid rgba(92, 141, 255, 0.25) !important;
          padding: 12px 16px !important;
          font-weight: 400 !important;
          font-size: 14px !important;
        }
        #rsvp.section.dark input::placeholder {
          color: #8990A6 !important;
          opacity: 0.8 !important;
        }
        #rsvp.section.dark .t-btn {
          padding: 12px 24px !important;
          flex: 1 !important;
          min-width: 120px !important;
          background-color: #34C77B !important;
          color: #0E1512 !important;
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
          padding: 16px 0 0 0 !important;
          border-top: 1px solid rgba(237, 239, 245, 0.1) !important;
          text-align: left !important;
          box-shadow: none !important;
          width: 100% !important;
        }
        #rsvp.section.dark .t-detail h4 {
          color: rgba(237, 239, 245, 0.5) !important;
          font-family: var(--font-body-custom, var(--font-inter)), sans-serif !important;
          text-transform: uppercase !important;
          font-size: 10px !important;
          letter-spacing: 0.05em !important;
          font-weight: 600 !important;
          opacity: 1 !important;
          margin-bottom: 6px !important;
        }
        #rsvp.section.dark .t-detail p {
          color: rgba(237, 239, 245, 0.7) !important;
          font-size: 13px !important;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        #rsvp.section.dark .t-detail p b {
          font-size: 1.1rem !important;
          color: #EDEFF5 !important;
          font-weight: 600 !important;
        }
        #rsvp.section.dark .t-detail span {
          color: rgba(237, 239, 245, 0.4) !important;
          font-size: 12px !important;
        }

        #songs.d-sec.dark {
          background-color: #16211C !important;
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
          color: #34C77B !important;
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
          background-color: #0E1512 !important;
          color: #EDEFF5 !important;
          padding: 24px 24px 38px 24px !important;
          text-align: center;
        }
        .desktop-stage .d-foot .mono {
          color: #34C77B !important;
          font-family: var(--font-title, var(--font-cormorant)), sans-serif !important;
          font-size: 20px !important;
          margin-bottom: 8px !important;
        }

        #banco .t-kicker {
          text-align: left !important;
        }
        #banco .copy-btn {
          background-color: #34C77B !important;
          color: #0E1512 !important;
          border: none !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
        }
        #banco .copy-btn.copied {
          background-color: #FFFFFF !important;
          color: #0E1512 !important;
        }

        .desktop-stage .bottom-nav {
          position: fixed !important;
          bottom: 24px !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          display: flex !important;
          justify-content: space-between !important;
          background: rgba(16, 19, 28, 0.95) !important;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5) !important;
          backdrop-filter: blur(12px) !important;
          width: calc(100% - 32px) !important;
          max-width: 360px !important;
          padding: 14px 10px !important;
          border-radius: 999px !important;
          z-index: 999999 !important;
        }
        .desktop-stage .bottom-nav a {
          color: #ffffff !important;
          opacity: 0.6 !important;
        }
        .desktop-stage .bottom-nav a[aria-current="true"] {
          opacity: 1 !important;
          color: #34C77B !important;
        }
      `}</style>

      {/* PORTADA -- fondo grafito + glow azul frío, sin gradiente cálido */}
      {!isCoverOpen && (
        <div
          ref={coverRootRef}
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100dvh', zIndex: 99999, backgroundColor: '#0E1512', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: '25vh', overflow: 'hidden', ...getTypographyCssVars(invitation.fontTitle as string, invitation.fontBody as string) }}
          className={`text-[#EDEFF5] ${isClosingCover ? "acp-cover-exit" : "transition-all duration-1000 animate-in fade-in"}`}
        >
          {portadaFondoAnimado && (
            <div className="acp-mobile-only">
              <AnimatedCoverPhoto
                photoSrc={portadaImagenFondoDesktopRaw as string}
                effect="geometric"
                tint={false}
                scrimColorRgb="14,21,18"
              />
            </div>
          )}
          <div className={portadaFondoAnimado ? "acp-desktop-only" : undefined}>
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(50% 40% at 15% 15%, rgba(92,141,255,0.16), transparent), radial-gradient(45% 40% at 85% 80%, rgba(92,141,255,0.08), transparent)',
            backgroundSize: '160% 160%',
            animation: 'corporate-meshDrift 14s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', width: 220, height: 220, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(92,141,255,0.14), transparent 70%)',
            top: '18%', left: '50%', transform: 'translateX(-50%)',
            animation: 'corporate-glowPulse 5s ease-in-out infinite', pointerEvents: 'none',
          }} />
          </div>

          <IconNode className="corporate-doodle opacity-0 absolute" style={{ width: 42, height: 30, top: '10%', left: '9%', color: 'rgba(92,141,255,0.5)' }} />
          <IconBars className="corporate-doodle opacity-0 absolute" style={{ width: 20, height: 16, top: '16%', right: '13%', color: 'rgba(92,141,255,0.4)' }} />
          <IconTarget className="corporate-doodle opacity-0 absolute" style={{ width: 20, height: 20, bottom: '20%', left: '15%', color: 'rgba(92,141,255,0.35)' }} />
          <IconGridDots className="corporate-doodle opacity-0 absolute" style={{ width: 22, height: 22, bottom: '25%', right: '18%', color: 'rgba(92,141,255,0.4)' }} />

          <div style={{ textAlign: 'center', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', position: 'relative' }}>


            <h2 className="text-4xl sm:text-5xl font-light tracking-wide text-[#EDEFF5] leading-relaxed" style={{ fontFamily: 'var(--font-title, var(--font-cormorant)), sans-serif' }}>
              {guestNameDisplay}
            </h2>

            {Boolean(activeDressCode) && (
              <p className=" text-sm font-medium text-[#8990A6] tracking-wide uppercase" style={{ fontFamily: "var(--font-body-custom, var(--font-inter)), sans-serif", letterSpacing: "0.2em", opacity: 0.8 }}>
                Dress code: {activeDressCode}
              </p>
            )}

            <button
              type="button"
              onClick={openInvitation}
              className="inline-block font-medium text-xs tracking-[0.2em] px-10 py-3 transition-colors duration-500 cursor-pointer"
              style={{
                fontFamily: 'var(--font-body-custom, var(--font-inter)), sans-serif', border: '1px solid #34C77B', color: '#34C77B',
                background: 'rgba(92,141,255,0.08)', backdropFilter: 'blur(6px)',
                marginTop: '1rem',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#34C77B'; e.currentTarget.style.color = '#0E1512'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(92,141,255,0.08)'; e.currentTarget.style.color = '#34C77B'; }}
            >
              ABRIR INVITACIÓN
            </button>

          </div>

          <style jsx>{`
            @keyframes corporate-meshDrift { 0%, 100% { background-position: 0% 0%, 100% 100%; } 50% { background-position: 30% 20%, 70% 80%; } }
            @keyframes corporate-glowPulse { 0%, 100% { opacity: .5; } 50% { opacity: 1; } }
            @keyframes corporate-lineExpand { 0% { width: 0; } 100% { width: 40px; } }
          `}</style>
          <style>{COVER_EXIT_STYLE}{COVER_RESPONSIVE_STYLE}</style>
        </div>
      )}

      {mounted && isPersonalized && guest && isCoverOpen && createPortal(
        <div
          onClick={() => setIsTicketMaximized(!isTicketMaximized)}
          className={`fixed top-3 left-1/2 -translate-x-1/2 z-[99999] transition-all duration-500 cursor-pointer overflow-hidden border border-[#34C77B]/40 shadow-md ${isTicketMaximized ? 'bg-[#0E1512]/95 backdrop-blur-md w-[90%] max-w-sm px-5 py-2.5 rounded-full' : 'bg-[#16211C]/95 backdrop-blur-md px-5 py-2 rounded-full'}`}
        >
          {isTicketMaximized ? (
            <div className="flex items-center justify-between w-full animate-in fade-in duration-300">
              <div className="flex flex-col text-left">
                <span className=" text-[8px] font-semibold uppercase tracking-[0.2em] text-[#34C77B] leading-none mb-1" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>Pase Especial</span>
                <span className="text-[#EDEFF5] font-bold text-sm leading-none" style={{ fontFamily: 'var(--font-cormorant), sans-serif' }}>{guest.name}</span>
              </div>
              <div className="flex flex-col items-end border-l border-[#34C77B]/20 pl-3">
                <span className="text-[#EDEFF5] font-bold text-sm leading-none">{guest.expectedCount}</span>
                <span className="text-[#8990A6] text-[8px] uppercase tracking-wider leading-none mt-1">{guest.expectedCount === 1 ? 'Lugar' : 'Lugares'}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 animate-in fade-in duration-300">
              <Ticket className="w-4 h-4 text-[#34C77B]" />
              <span className="text-[#EDEFF5] text-[10px] font-semibold tracking-wider uppercase" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>Pase</span>
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
        "--t-acc": "#34C77B",
        "--t-acc2": "#34C77B",
        "--c-accent": "#34C77B",
        "--t-bg": "#0E1512",
        "--t-surface": "#16211C",
        "--t-muted": "#8990A6",
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
          <h1 className="text-5xl font-light text-white leading-tight mb-2 drop-shadow-md" style={{ fontFamily: 'var(--font-title, var(--font-cormorant)), sans-serif' }}>
            {em ? (
              <>
                <span className="block">{title.slice(0, title.indexOf(em)).trim()}</span>
                <span className="block"><em style={{ fontFamily: 'var(--font-cormorant), sans-serif', fontStyle: 'normal', color: 'white' }}>&amp;</em> {em.replace('& ', '').trim()}</span>
              </>
            ) : (
              <span className="block">{title}</span>
            )}
          </h1>
          <div style={{ width: 40, height: 2, background: '#34C77B', margin: '6px 0 14px', animation: 'corporate-lineExpand 1.2s ease-out' }} />
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
        <div className="hide-desktop w-full flex flex-col min-h-[100dvh] bg-[#0E1512]">
          <div className="px-8 pt-16 pb-12 text-left bg-[#0E1512] z-10 relative">
            <IconBars className="corporate-scroll-doodle opacity-0 absolute" style={{ width: 18, height: 14, top: 14, right: 30, color: 'rgba(92,141,255,0.45)' }} />
            <IconGridDots className="corporate-scroll-doodle opacity-0 absolute" style={{ width: 20, height: 20, top: 60, right: 54, color: 'rgba(92,141,255,0.4)' }} />
            <p className=" text-xs font-semibold uppercase tracking-[0.2em] text-[#34C77B] mb-6" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
              {eyebrow}
            </p>
            <h1 className="text-[4rem] font-light text-[#EDEFF5] leading-[1.0] mb-3" style={{ fontFamily: 'var(--font-title, var(--font-cormorant)), sans-serif' }}>
              {em ? (
                <>
                  <span className="block">{title.slice(0, title.indexOf(em)).trim()}</span>
                  <span className="block"><em style={{ fontFamily: 'var(--font-cormorant), sans-serif', fontStyle: 'normal', color: '#34C77B' }}>&amp;</em> {em.replace('& ', '').trim()}</span>
                </>
              ) : (
                <span className="block">{title}</span>
              )}
            </h1>
            <div style={{ width: 40, height: 2, background: '#34C77B', margin: '0 0 20px', animation: 'corporate-lineExpand 1.2s ease-out' }} />
            <p className=" text-sm font-medium text-[#8990A6] tracking-wide" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
              {fechaStr}{lugarNombre ? ` · ${lugarNombre}` : ""}{ciudad ? ` — ${ciudad}` : ""}
            </p>
            {Boolean(activeDressCode) && (
              <p className=" text-xs font-semibold text-[#34C77B] tracking-widest uppercase mt-4" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                Dress code: {activeDressCode}
              </p>
            )}
          </div>

          {/* Marco de línea fina completo + franja de "vidrio" que atraviesa
              la foto ligada al scroll (ver useEffect de heroPhotoRef). */}
          <div ref={heroPhotoRef} className="flex-1 w-full relative overflow-hidden">
            <div className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none z-10" style={{ background: 'linear-gradient(to bottom, transparent 0%, #0E1512 100%)' }} />
            <div
              className="absolute inset-0 w-full h-full"
              style={heroBgMobile ? {
                backgroundImage: `url(${heroBgMobile})`,
                backgroundSize: "cover",
                backgroundPosition: `${Number(invitation.portadaImagenPosX ?? 50)}% ${Number(invitation.portadaImagenPosY ?? 50)}%`,
                backgroundRepeat: "no-repeat"
              } : { backgroundColor: '#16211C' }}
            />
            <div className="absolute inset-3 pointer-events-none z-20" aria-hidden="true">
              <div className="absolute inset-0" style={{ border: "1px solid rgba(92,141,255,0.6)" }} />
              <IconGridDots style={{ position: "absolute", top: -9, left: -9, width: 20, height: 20, color: "#34C77B" }} />
              <IconNode style={{ position: "absolute", bottom: -8, right: -10, width: 26, height: 18, color: "#34C77B" }} />
            </div>
            {/* Franja diagonal de "vidrio" fría, ligada al progreso de scroll */}
            <div ref={heroSheenRef} className="pointer-events-none z-20" style={{ position: "absolute", inset: "-20% -40%", background: "linear-gradient(100deg, transparent 40%, rgba(255,255,255,0.5) 50%, rgba(92,141,255,0.3) 54%, transparent 62%)", opacity: 0 }} />
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
          <SectionWrapper id="quote" delay={100} className="w-full py-24 px-6 md:px-12 flex items-center justify-center" style={{ background: "linear-gradient(160deg, #34C77B14, transparent 70%), #16211C" }}>
            <div className="max-w-2xl mx-auto text-center">
              <div className="flex justify-center mb-6">
                <DrawLucideIcon icon={BookOpen} size={46} color="var(--t-acc)" strokeWidth={1.5} />
              </div>
              <TypewriterText
                text={`"${String(invitation.frasePersonalizadaTexto)}"`}
                className="text-[#EDEFF5] text-2xl md:text-3xl leading-relaxed tracking-wide"
                style={{ fontFamily: 'var(--font-cormorant), sans-serif', margin: 0, fontWeight: 500 }}
              />
            </div>
          </SectionWrapper>
        ) : null}

        <SectionWrapper id="details" delay={150} className="w-full bg-[#0E1512] py-20 px-6 md:px-12">
          <div className="w-full max-w-[340px] sm:max-w-xl mx-auto text-left">
            <div className="flex justify-center mb-4">
              <DrawLucideIcon icon={CalendarDays} size={46} color="var(--t-acc)" strokeWidth={1.5} />
            </div>
            <p className="t-kicker mb-8 flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase text-[#34C77B]" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
              CUÁNDO Y DÓNDE
            </p>

            {Boolean(invitation.ceremoniaHabilitada) && (
              <div className="bg-black/20 border-l-[2px] border-l-[#34C77B] p-6 sm:p-8 mb-6 shadow-sm">
                <div>
                  <span className=" text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8990A6] block mb-3" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                    {String(invitation.ceremoniaTitulo || "CEREMONIA")}
                  </span>
                  {Boolean(invitation.ceremoniaNombre) && (
                    <h4 className="text-2xl sm:text-3xl font-light text-[#EDEFF5] mb-3" style={{ fontFamily: 'var(--font-cormorant), sans-serif' }}>
                      {String(invitation.ceremoniaNombre)}
                    </h4>
                  )}
                  {Boolean(invitation.ceremoniaHora) && (
                    <p className="text-[#8990A6]  text-sm sm:text-base mb-1" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                      {String(invitation.ceremoniaHora)} hs
                    </p>
                  )}
                  {Boolean(invitation.ceremoniaDireccion) && (
                    <p className="text-[#8990A6]  text-sm sm:text-base mb-4" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                      {String(invitation.ceremoniaDireccion)}
                    </p>
                  )}
                  {Boolean(invitation.ceremoniaMapUrl) && (
                    <a href={String(invitation.ceremoniaMapUrl)} target="_blank" rel="noopener noreferrer" className="inline-block mt-1  text-xs font-semibold tracking-wider text-[#34C77B] hover:text-white transition-colors" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                      Ver mapa ceremonia ↗
                    </a>
                  )}
                </div>
              </div>
            )}

            {(lugarNombre || direccion) && (
              <div className="bg-black/20 border-l-[2px] border-l-[#34C77B] p-6 sm:p-8 mb-10 shadow-sm">
                <span className=" text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8990A6] block mb-3" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                  FIESTA / SALÓN
                </span>
                {lugarNombre && (
                  <h4 className="text-2xl sm:text-3xl font-light text-[#EDEFF5] mb-3" style={{ fontFamily: 'var(--font-cormorant), sans-serif' }}>
                    {lugarNombre}
                  </h4>
                )}
                {hora && (
                  <p className="text-[#8990A6]  text-sm sm:text-base mb-1" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                    {hora} hs
                  </p>
                )}
                {direccion && (
                  <p className="text-[#8990A6]  text-sm sm:text-base mb-4" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                    {direccion}
                  </p>
                )}
                {mapUrl && (
                  <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-1  text-xs font-semibold tracking-wider text-[#34C77B] hover:text-white transition-colors" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
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
                <p className="t-kicker mb-6 flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase text-[#34C77B]" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                  CRONOGRAMA
                </p>
                <div className="flex flex-col w-full">
                  {cronograma.map((item, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center py-4 border-b border-[#34C77B]/10 last:border-b-0">
                      {item.time && (
                        <span className=" text-sm sm:text-base text-[#8990A6] font-medium w-24 flex-shrink-0 mb-1 sm:mb-0" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                          {item.time}
                        </span>
                      )}
                      <span className="text-[1.2rem] sm:text-[1.3rem] text-[#EDEFF5] font-light" style={{ fontFamily: 'var(--font-cormorant), sans-serif' }}>
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
          <SectionWrapper id="album" delay={200} className="w-full bg-[#16211C] py-20 overflow-hidden">
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
            initialPaidAmount={guestPaidAmount}
            paidPrices={(guest as any)?.paidPrices ?? null}
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
          <SectionWrapper id="banco" delay={200} className="w-full bg-[#16211C] py-20 px-6 md:px-12 overflow-hidden">
            <div className="w-full max-w-[340px] sm:max-w-xl mx-auto text-left">
                <div className="flex justify-center mb-4">
                  <DrawLucideIcon icon={Landmark} size={46} color="var(--t-acc)" strokeWidth={1.5} />
                </div>
                <p className="t-kicker mb-10 flex items-center gap-2 text-[#34C77B]">
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
                      accentColor="#34C77B"
                      cardBg="#16211C"
                      textPrimary="#EDEFF5"
                      textSecondary="#8990A6"
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
                      accentColor="#34C77B"
                      cardBg="#16211C"
                      textPrimary="#EDEFF5"
                      textSecondary="#8990A6"
                      InfoRow={InfoRow}
                      CopyField={CopyField}
                    />
                  )}
                </div>
                </div>
          </SectionWrapper>
        )}

        {triviaHabilitada && triviaPreguntas.length > 0 && (
          <SectionWrapper id="quiz" delay={300} className="w-full py-20 px-6 md:px-12" style={{ background: "linear-gradient(160deg, #34C77B18, transparent 70%), #16211C" }}>
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
            kicker="¿Armamos la playlist de la fiesta?"
            hideHeader
            dark
            showPublicList
            variant="moderno"
          />
        )}

        <InfoAdicionalSection invitation={invitation} />

        {musicaHabilitada && musicAudioElement}

        <div className="w-full flex items-center justify-center gap-2 py-6" style={{ background: '#0E1512' }} aria-hidden="true">
          <div style={{ width: 28, height: 1, background: 'linear-gradient(90deg, transparent, #34C77B, transparent)' }} />
          <IconNode className="corporate-scroll-doodle opacity-0" style={{ width: 20, height: 15, color: '#34C77B' }} />
          <div style={{ width: 28, height: 1, background: 'linear-gradient(90deg, transparent, #34C77B, transparent)' }} />
        </div>

        <LogoFooterCredit bgColor="#0E1512" />
        </div>
      </div>

      {isCoverOpen && <BottomNavPill sections={navSections} variant="moderno" accentColor="#34C77B" surfaceColor="#16211C" />}
      </div>
  );
}
