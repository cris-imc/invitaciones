/**
 * GardenPartyTemplateAmarillo.tsx
 * Derivado de ModernoTemplate.tsx (mismo patrón que ChicTemplate.tsx para el
 * theming de tema claro -- variable de tinta propia + prop `dark` en los
 * componentes compartidos, ver docs/GUIA_TECNICA_PLANTILLAS.md sección 3.4):
 * misma estructura, props, secciones y componentes reutilizados (Countdown,
 * AlbumCarousel, RSVPWizardV2, SongSuggestion, etc). Cambia la capa visual a
 * la estética "Garden Party" (mockup/nuevo/Plantillas Eventos Genéricos.dc.html,
 * tema "Cumple de Valeria"): fondo crema cálido (#FBF4EC) + tinta marrón oscuro
 * (#3A2A22) + acento terracota (#E8A33D, variable por color) + acento salvia
 * (#6B8F71), tipografía Fraunces itálica (display) + Poppins (texto), doodles
 * de trazo fino de jardín (flor, hoja/ramita, mariposa, guirnalda) como motivo
 * decorativo -- pensada para cumpleaños de adultos al aire libre.
 * Gating: esta plantilla solo debe ofrecerse para eventos CUMPLEANOS (el
 * gating vive en TemplatePreviewModal.tsx, este archivo no valida nada por su
 * cuenta).
 */
"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Fraunces, Poppins } from "next/font/google";
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

// Tipografía "Garden Party" (Fraunces itálica + Poppins), escopeada solo a
// este componente vía CSS var override en el wrapper raíz.
const gardenFraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
  variable: "--gardenparty-fraunces",
  display: "swap",
});
const gardenPoppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--gardenparty-poppins",
  display: "swap",
});

// Doodles de trazo fino "Garden Party": flor de 5 pétalos, hoja/ramita,
// mariposa, guirnalda -- coherentes con el motivo de jardín/aire libre.
const IconInfo  = ({ className, style }: { className?: string; style?: React.CSSProperties } = {}) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} className={className} style={style} aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><path d="M12 15.5v-4M12 8.2h.01"/></svg>;
const IconCheck = ({ className, style }: { className?: string; style?: React.CSSProperties } = {}) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} className={className} style={style} aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>;
const IconMusic = ({ className, style }: { className?: string; style?: React.CSSProperties } = {}) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3} className={className} style={style} aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="2.2"/></svg>;
const IconMap   = ({ className, style }: { className?: string; style?: React.CSSProperties } = {}) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} className={className} style={style} aria-hidden="true"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
const IconGift  = ({ className, style }: { className?: string; style?: React.CSSProperties } = {}) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} className={className} style={style} aria-hidden="true"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/></svg>;
const IconQuiz  = ({ className, style }: { className?: string; style?: React.CSSProperties } = {}) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} className={className} style={style} aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>;
// Flor de cinco pétalos -- decorativa de portada/separadores.
const IconFlower = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.1} className={className} style={style} aria-hidden="true">
    <circle cx="12" cy="6.2" r="3.1" />
    <circle cx="17" cy="9.6" r="3.1" />
    <circle cx="15" cy="15.6" r="3.1" />
    <circle cx="9" cy="15.6" r="3.1" />
    <circle cx="7" cy="9.6" r="3.1" />
    <circle cx="12" cy="11" r="1.8" fill="currentColor" stroke="none" opacity={0.85} />
  </svg>
);
// Hoja/ramita -- kickers de sección y marco de la foto.
const IconLeaf = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} className={className} style={style} aria-hidden="true">
    <path d="M4.5 19.5C5 10.5 11.5 4.5 20 4c-0.5 9-7 15-15.5 15.5Z" />
    <path d="M6.5 17.5C10 14 13.5 10.5 17.5 6.8" strokeWidth={0.8} opacity={0.7} />
  </svg>
);
// Mariposa -- separador de secciones.
const IconButterfly = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 20" fill="none" stroke="currentColor" strokeWidth={1.1} className={className} style={style} aria-hidden="true">
    <path d="M12 5.5C10 1.5 3 2 3 6.8S9 12 12 9" />
    <path d="M12 5.5c2-4 9-3.5 9 .8s-6 5.2-9 2.2" />
    <path d="M12 4.5v11" strokeWidth={0.9} />
    <path d="M10.5 15c-1 1-1 2.3 0 3M13.5 15c1 1 1 2.3 0 3" strokeWidth={0.8} opacity={0.7} />
  </svg>
);
// Guirnalda de hojas -- separador ondulado entre secciones.
const IconGarland = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 28 12" fill="none" stroke="currentColor" strokeWidth={1.1} className={className} style={style} aria-hidden="true">
    <path d="M1 6c3.5-5.5 7 5.5 10.5 0S18.5 0.5 27 6" />
    <path d="M6 4.2 6.9 6M10 1.6l.4 2.1M18 1.8l-.3 2.1M22 4.4l-.8 1.8" strokeWidth={0.8} opacity={0.7} />
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

function safeJson<T>(val: string | null | undefined, fallback: T): T {
  if (!val) return fallback;
  try { return JSON.parse(val) as T; } catch { return fallback; }
}

interface GardenPartyTemplateAmarilloProps {
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
    <div className="flex items-center justify-between gap-3 py-3 border-b border-[#E8A33D]/20 last:border-b-0">
      <div className="min-w-0 flex-1">
        <span className="block text-[10px] font-semibold text-[#E8A33D] uppercase tracking-wider mb-0.5">{label}</span>
        <span className="text-xs sm:text-sm font-mono text-[#3A2A22] break-all">{value}</span>
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
    <div className="flex items-center justify-between gap-3 py-3 border-b border-[#E8A33D]/20 last:border-b-0">
      <div className="min-w-0 flex-1">
        <span className="block text-[10px] font-semibold text-[#E8A33D] uppercase tracking-wider mb-0.5">{label}</span>
        <span className="text-sm font-medium text-[#3A2A22] break-words">{value}</span>
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
        <h3 style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "2rem", fontStyle: "italic", color: "#3A2A22" }}>
          ¡Juego Completado!
        </h3>
        <p style={{ marginTop: "12px", opacity: 0.8, fontFamily: "var(--font-sans)", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.8rem", color: "#3A2A22" }}>
          RESPONDISTE {score} DE {preguntas.length} CORRECTAMENTE ({percent}%)
        </p>

        {isSaving ? (
          <p style={{ marginTop: "16px", fontSize: "14px", opacity: 0.7, color: "#8a7462" }}>Guardando tus resultados...</p>
        ) : (
          stats && stats.count > 0 && (
            <div style={{ marginTop: "28px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(217,119,87,0.08)", padding: "8px 16px", borderRadius: "99px", border: "1px solid rgba(217,119,87,0.18)", textAlign: "left", maxWidth: "90%" }}>
                <Users className="w-5 h-5 text-[#E8A33D] shrink-0" />
                <p style={{ fontSize: "11.5px", margin: 0, opacity: 0.85, lineHeight: 1.4, color: "#3A2A22" }}>
                  El promedio global de aciertos del resto de los invitados ({stats.count}) es del <strong style={{ color: "#3A2A22" }}>{stats.avg}%</strong>.
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
        <p className="text-[#3A2A22] text-2xl md:text-3xl leading-relaxed tracking-wide" style={{ fontFamily: 'var(--font-cormorant), serif', fontStyle: 'italic', margin: 0, fontWeight: 500, marginBottom: "3.5rem" }}>
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

export function GardenPartyTemplateAmarillo({ invitation, guest, isPersonalized = false }: GardenPartyTemplateAmarilloProps) {
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

  // Entrada animada de los doodles de portada (flor, hoja, mariposa) con
  // anime.js -- corre una sola vez, cuando la portada aparece.
  const coverRootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isCoverOpen || !coverRootRef.current) return;
    const root = coverRootRef.current;
    animate(root.querySelectorAll(".gardenparty-doodle"), {
      scale: [0, 1],
      rotate: [-16, 0],
      opacity: [0, 1],
      duration: 900,
      delay: stagger(140, { start: 300 }),
      ease: "outBack",
    });
    animate(root.querySelectorAll(".gardenparty-seal"), {
      scale: [0.6, 1],
      opacity: [0, 1],
      duration: 700,
      delay: 150,
      ease: "outQuad",
    });
  }, [isCoverOpen]);

  // Doodles del cuerpo: reveal al entrar en viewport, una sola vez por
  // elemento.
  useEffect(() => {
    if (!isCoverOpen) return;
    const els = document.querySelectorAll(".gardenparty-scroll-doodle");
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

  // Sol filtrado entre hojas: un par de manchas de luz cálidas (dorado +
  // salvia) que se deslizan por la foto de portada al hacer scroll, como
  // el efecto de sol de siesta atravesando un follaje -- coherente con el
  // tema de jardín (en vez del lens-flare de Chic o el neón de Neon).
  const heroPhotoRef = useRef<HTMLDivElement>(null);
  const heroSunRef = useRef<HTMLDivElement>(null);
  const heroSun2Ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isCoverOpen || !heroPhotoRef.current || !heroSunRef.current) return;
    const sun = heroSunRef.current;
    const sun2 = heroSun2Ref.current;
    const observer = onScroll({
      target: heroPhotoRef.current,
      container: document.body,
      enter: "bottom top",
      leave: "top bottom",
      onUpdate: (self) => {
        const p = self.progress;
        const intensity = Math.sin(p * Math.PI);
        sun.style.opacity = String(intensity * 0.5);
        sun.style.left = `${p * 120 - 10}%`;
        sun.style.top = `${20 + p * 30}%`;
        if (sun2) {
          sun2.style.opacity = String(intensity * 0.32);
          sun2.style.left = `${p * 120 - 30}%`;
          sun2.style.top = `${55 - p * 25}%`;
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
      <div className="min-h-dvh w-full bg-gradient-to-b from-[#FBF4EC] via-[#F5E6D6] to-[#FFFFFF] text-white relative overflow-x-hidden flex flex-col justify-between" data-theme={theme}>
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[600px] h-[600px] bg-[var(--accent)]/10 rounded-full blur-[120px] pointer-events-none" aria-hidden="true" />
        <div className="absolute right-0 bottom-0 w-[500px] h-[500px] bg-[var(--accent)]/10 rounded-full blur-[120px] pointer-events-none" aria-hidden="true" />

        <main className="relative z-10 max-w-5xl mx-auto w-full px-4 md:px-6 py-12 lg:py-20">
          <div className="rounded-[2rem] bg-black/40 border border-white/10 shadow-2xl backdrop-blur-3xl text-center max-w-4xl mx-auto relative overflow-hidden flex flex-col">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-gradient-to-r from-transparent via-amber-200/50 to-transparent" />

            <div className="p-10 md:p-16 space-y-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light text-white tracking-wide drop-shadow-md">
                Un festejo <AnimatedSynonyms words={["inolvidable", "único", "hermoso", "mágico"]} className="italic text-amber-200/90 font-serif" />
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
          <LogoFooterCredit bgColor="transparent" textColor="var(--gardenparty-ink, #3A2A22)" />
        </footer>
      </div>
    );
  }

  return (
    <div
      className={`${gardenFraunces.variable} ${gardenPoppins.variable}`}
      style={{
        "--font-cormorant": "var(--gardenparty-fraunces)",
        "--font-inter": "var(--gardenparty-poppins)",
        "--font-sans": "var(--gardenparty-poppins)",
        "--t-acc": "#E8A33D",
        "--t-acc2": "#6B8F71",
        "--c-accent": "#E8A33D",
        "--t-bg": "#FBF4EC",
        "--t-surface": "#FFFFFF",
        "--t-muted": "#8a7462",
        // Usado por Countdown.tsx/RSVPWizardV2.tsx (dark ? var(--gardenparty-ink, #FFFFFF) : ...)
        // -- sin definir esto, esos componentes muestran texto blanco
        // hardcodeado (pensado para Moderno/Neon) invisible sobre el fondo
        // claro de Garden Party.
        "--gardenparty-ink": "#3A2A22",
        "--chic-ink": "#3A2A22",
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
          font-style: italic !important;
          color: #3A2A22 !important;
        }
        .desktop-stage .tpl .moderno-light-card h4 {
          color: #3A2A22 !important;
        }
        .desktop-stage .tpl .t-kicker,
        .desktop-stage .tpl p.kicker {
          font-family: var(--font-body-custom, var(--font-inter)), sans-serif !important;
          color: #E8A33D !important;
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

        /* Esquinas redondeadas generosas -- estética cálida/jardín (opuesto
           al recorte cuadrado de Moderno/Corporate) */
        .desktop-stage .tpl div:not(#countdown div),
        .desktop-stage .tpl section {
          border-radius: 20px;
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
          border-radius: 18px !important;
        }
        .desktop-stage .tpl .album-btn {
          color: #3A2A22 !important;
          border-color: rgba(58, 42, 34, 0.2) !important;
        }

        #countdown.dark {
          background-color: #FBF4EC !important;
          margin-top: -2px !important;
          position: relative;
          z-index: 20;
        }
        #countdown[data-style="clasico"].dark > div > div > div {
          background-color: #FFFFFF !important;
          border-color: rgba(217, 119, 87, 0.2) !important;
        }

        #rsvp.section.dark {
          background-color: #F5E6D6 !important;
          color: #3A2A22 !important;
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
          color: #3A2A22 !important;
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
          color: #E8A33D !important;
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
          color: #8a7462 !important;
          font-weight: 600 !important;
        }
        #rsvp.section.dark input {
          background-color: #FFFFFF !important;
          color: #3A2A22 !important;
          border-radius: 14px !important;
          border: 1px solid rgba(217, 119, 87, 0.25) !important;
          padding: 12px 16px !important;
          font-weight: 400 !important;
          font-size: 14px !important;
        }
        #rsvp.section.dark input::placeholder {
          color: #8a7462 !important;
          opacity: 0.8 !important;
        }
        #rsvp.section.dark .t-btn {
          border-radius: 999px !important;
          padding: 12px 24px !important;
          flex: 1 !important;
          min-width: 120px !important;
          background-color: #E8A33D !important;
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
          border-top: 1px solid rgba(58,42,34,0.12) !important;
          text-align: left !important;
          box-shadow: none !important;
          width: 100% !important;
        }
        #rsvp.section.dark .t-detail h4 {
          color: rgba(58,42,34,0.55) !important;
          font-family: var(--font-body-custom, var(--font-inter)), sans-serif !important;
          text-transform: uppercase !important;
          font-size: 10px !important;
          letter-spacing: 0.05em !important;
          font-weight: 600 !important;
          opacity: 1 !important;
          margin-bottom: 6px !important;
        }
        #rsvp.section.dark .t-detail p {
          color: rgba(58,42,34,0.75) !important;
          font-size: 13px !important;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        #rsvp.section.dark .t-detail p b {
          font-size: 1.1rem !important;
          color: #3A2A22 !important;
          font-weight: 600 !important;
        }
        #rsvp.section.dark .t-detail span {
          color: rgba(58,42,34,0.45) !important;
          font-size: 12px !important;
        }

        /* SongSuggestion Custom Aesthetics */
        #songs.d-sec.dark {
          background-color: #F5E6D6 !important;
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
          color: #E8A33D !important;
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
          background-color: #FBF4EC !important;
          color: #3A2A22 !important;
          padding: 24px 24px 38px 24px !important;
          text-align: center;
        }
        .desktop-stage .d-foot .mono {
          color: #E8A33D !important;
          font-family: var(--font-title, var(--font-cormorant)), serif !important;
          font-size: 20px !important;
          margin-bottom: 8px !important;
        }

        #banco .t-kicker {
          text-align: left !important;
        }
        #banco .copy-btn {
          background-color: #E8A33D !important;
          color: #FFFFFF !important;
          border: none !important;
          border-radius: 999px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
        }
        #banco .copy-btn.copied {
          background-color: #3A2A22 !important;
          color: #FBF4EC !important;
        }

        .desktop-stage .bottom-nav {
          position: fixed !important;
          bottom: 24px !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          display: flex !important;
          justify-content: space-between !important;
          background: rgba(58, 42, 34, 0.95) !important;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4) !important;
          backdrop-filter: blur(12px) !important;
          width: calc(100% - 32px) !important;
          max-width: 360px !important;
          padding: 14px 10px !important;
          border-radius: 999px !important;
          z-index: 999999 !important;
        }
        .desktop-stage .bottom-nav a {
          color: #FBF4EC !important;
          opacity: 0.65 !important;
        }
        .desktop-stage .bottom-nav a[aria-current="true"] {
          opacity: 1 !important;
          color: #E8A33D !important;
        }
      `}</style>

      {/* PORTADA -- mesh cálido terracota + salvia animado */}
      {!isCoverOpen && (
        <div
          ref={coverRootRef}
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100dvh', zIndex: 99999, backgroundColor: '#FBF4EC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: '25vh', overflow: 'hidden', ...getTypographyCssVars(invitation.fontTitle as string, invitation.fontBody as string) }}
          className={`text-[#3A2A22] ${isClosingCover ? "acp-cover-exit" : "transition-all duration-1000 animate-in fade-in"}`}
        >
          {portadaFondoAnimado && (
            <div className="acp-mobile-only">
              <AnimatedCoverPhoto
                photoSrc={portadaImagenFondoDesktopRaw as string}
                effect="enfoque"
                tint={false}
                scrimColorRgb="58,42,34"
              />
            </div>
          )}
          <div className={portadaFondoAnimado ? "acp-desktop-only" : undefined}>
            <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(50% 40% at 15% 15%, rgba(217,119,87,0.18), transparent), radial-gradient(45% 40% at 85% 80%, rgba(124,148,115,0.22), transparent)',
            backgroundSize: '160% 160%',
            animation: 'gardenparty-meshDrift 14s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', width: 220, height: 220, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(217,119,87,0.16), transparent 70%)',
            top: '18%', left: '50%', transform: 'translateX(-50%)',
            animation: 'gardenparty-glowPulse 5s ease-in-out infinite', pointerEvents: 'none',
          }} />

          <IconFlower className="gardenparty-doodle opacity-0 absolute" style={{ width: 34, height: 34, top: '9%', left: '10%', color: 'rgba(217,119,87,0.55)' }} />
          <IconLeaf className="gardenparty-doodle opacity-0 absolute" style={{ width: 24, height: 24, top: '15%', right: '12%', color: 'rgba(124,148,115,0.5)' }} />
          <IconButterfly className="gardenparty-doodle opacity-0 absolute" style={{ width: 28, height: 22, bottom: '18%', left: '14%', color: 'rgba(217,119,87,0.45)' }} />
          <IconFlower className="gardenparty-doodle opacity-0 absolute" style={{ width: 18, height: 18, bottom: '24%', right: '18%', color: 'rgba(217,119,87,0.4)' }} />

          </div>
          <div style={{ textAlign: 'center', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', position: 'relative' }}>


            <h2 className={`text-4xl sm:text-5xl font-light tracking-wide leading-relaxed${portadaFondoAnimado ? " gardenparty-cover-text" : ""}`} style={{ fontFamily: 'var(--font-title, var(--font-cormorant)), serif', fontStyle: 'italic', color: portadaFondoAnimado ? undefined : '#3A2A22' }}>
              {guestNameDisplay}
            </h2>

            {Boolean(activeDressCode) && (
              <p className={`text-sm font-medium tracking-wide uppercase${portadaFondoAnimado ? " gardenparty-cover-text-muted" : ""}`} style={{ fontFamily: "var(--font-body-custom, var(--font-inter)), sans-serif", letterSpacing: "0.2em", opacity: 0.8, color: portadaFondoAnimado ? undefined : '#8a7462' }}>
                Dress code: {activeDressCode}
              </p>
            )}

            <button
              type="button"
              onClick={openInvitation}
              className="inline-block font-medium text-xs tracking-[0.2em] px-10 py-3 transition-colors duration-500 cursor-pointer rounded-full"
              style={{
                fontFamily: 'var(--font-body-custom, var(--font-inter)), sans-serif', border: '1px solid #E8A33D', color: '#E8A33D',
                background: 'rgba(217,119,87,0.08)', backdropFilter: 'blur(6px)',
                marginTop: '1rem',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#E8A33D'; e.currentTarget.style.color = '#FFFFFF'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(217,119,87,0.08)'; e.currentTarget.style.color = '#E8A33D'; }}
            >
              ABRIR INVITACIÓN
            </button>

          </div>

          <style jsx>{`
            @keyframes gardenparty-meshDrift { 0%, 100% { background-position: 0% 0%, 100% 100%; } 50% { background-position: 30% 20%, 70% 80%; } }
            @keyframes gardenparty-glowPulse { 0%, 100% { opacity: .5; } 50% { opacity: 1; } }
            @keyframes gardenparty-lineExpand { 0% { width: 0; } 100% { width: 40px; } }
            .gardenparty-cover-text { color: #FBF4EC; }
            .gardenparty-cover-text-muted { color: rgba(58,42,34,0.75); }
            @media (min-width: 768px) {
              .gardenparty-cover-text { color: #3A2A22; }
              .gardenparty-cover-text-muted { color: #8a7462; }
            }
          `}</style>
          <style>{COVER_EXIT_STYLE}{COVER_RESPONSIVE_STYLE}</style>
        </div>
      )}

      {mounted && isPersonalized && guest && isCoverOpen && createPortal(
        <div
          onClick={() => setIsTicketMaximized(!isTicketMaximized)}
          className={`fixed top-3 left-1/2 -translate-x-1/2 z-[99999] transition-all duration-500 cursor-pointer overflow-hidden border border-[#E8A33D]/40 shadow-md rounded-full ${isTicketMaximized ? 'bg-[#FBF4EC]/95 backdrop-blur-md w-[90%] max-w-sm px-5 py-2.5' : 'bg-[#3A2A22]/95 backdrop-blur-md px-5 py-2'}`}
        >
          {isTicketMaximized ? (
            <div className="flex items-center justify-between w-full animate-in fade-in duration-300">
              <div className="flex flex-col text-left">
                <span className=" text-[8px] font-semibold uppercase tracking-[0.2em] text-[#E8A33D] leading-none mb-1" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>Pase Especial</span>
                <span className="text-[#3A2A22] font-bold text-sm leading-none" style={{ fontFamily: 'var(--font-cormorant), serif' }}>{guest.name}</span>
              </div>
              <div className="flex flex-col items-end border-l border-[#E8A33D]/20 pl-3">
                <span className="text-[#3A2A22] font-bold text-sm leading-none">{guest.expectedCount}</span>
                <span className="text-[#8a7462] text-[8px] uppercase tracking-wider leading-none mt-1">{guest.expectedCount === 1 ? 'Lugar' : 'Lugares'}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 animate-in fade-in duration-300">
              <Ticket className="w-4 h-4 text-[#E8A33D]" />
              <span className="text-[#FFFFFF]  text-[10px] font-semibold tracking-wider uppercase" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>Pase</span>
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
        "--t-acc": "#E8A33D",
        "--t-acc2": "#6B8F71",
        "--c-accent": "#E8A33D",
        "--t-bg": "#FBF4EC",
        "--t-surface": "#FFFFFF",
        "--t-muted": "#8a7462",
        "--gardenparty-ink": "#3A2A22",
        "--chic-ink": "#3A2A22",
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
          <div style={{ width: 40, height: 2, background: '#E8A33D', margin: '6px 0 14px', animation: 'gardenparty-lineExpand 1.2s ease-out' }} />
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
        <div className="hide-desktop w-full flex flex-col min-h-[100dvh] bg-[#FBF4EC]">
          <div className="px-8 pt-16 pb-12 text-left bg-[#FBF4EC] z-10 relative">
            <IconLeaf className="gardenparty-scroll-doodle opacity-0 absolute" style={{ width: 20, height: 20, top: 12, right: 28, color: 'rgba(124,148,115,0.45)' }} />
            <IconFlower className="gardenparty-scroll-doodle opacity-0 absolute" style={{ width: 22, height: 22, top: 60, right: 52, color: 'rgba(217,119,87,0.4)' }} />
            <p className=" text-xs font-semibold uppercase tracking-[0.2em] text-[#E8A33D] mb-6" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
              {eyebrow}
            </p>
            <h1 className="text-[4rem] font-light text-[#3A2A22] leading-[1.0] mb-3" style={{ fontFamily: 'var(--font-title, var(--font-cormorant)), serif', fontStyle: 'italic' }}>
              {em ? (
                <>
                  <span className="block">{title.slice(0, title.indexOf(em)).trim()}</span>
                  <span className="block"><em style={{ fontFamily: 'var(--font-cormorant), serif', fontStyle: 'italic', color: '#E8A33D' }}>&amp;</em> {em.replace('& ', '').trim()}</span>
                </>
              ) : (
                <span className="block">{title}</span>
              )}
            </h1>
            <div style={{ width: 40, height: 2, background: '#E8A33D', margin: '0 0 20px', animation: 'gardenparty-lineExpand 1.2s ease-out' }} />
            <p className=" text-sm font-medium text-[#8a7462] tracking-wide" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
              {fechaStr}{lugarNombre ? ` · ${lugarNombre}` : ""}{ciudad ? ` — ${ciudad}` : ""}
            </p>
            {Boolean(activeDressCode) && (
              <p className=" text-xs font-semibold text-[#E8A33D] tracking-widest uppercase mt-4" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                Dress code: {activeDressCode}
              </p>
            )}
          </div>

          {/* Marco completo + sol filtrado entre hojas ligado al scroll (ver
              useEffect de heroPhotoRef). */}
          <div ref={heroPhotoRef} className="flex-1 w-full relative overflow-hidden">
            <div className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none z-10" style={{ background: 'linear-gradient(to bottom, transparent 0%, #FBF4EC 100%)' }} />
            <div
              className="absolute inset-0 w-full h-full"
              style={heroBgMobile ? {
                backgroundImage: `url(${heroBgMobile})`,
                backgroundSize: "cover",
                backgroundPosition: `${Number(invitation.portadaImagenPosX ?? 50)}% ${Number(invitation.portadaImagenPosY ?? 50)}%`,
                backgroundRepeat: "no-repeat"
              } : { backgroundColor: '#F5E6D6' }}
            />
            <div className="absolute inset-3 pointer-events-none z-20" aria-hidden="true">
              <div className="absolute inset-0" style={{ border: "1px solid rgba(217,119,87,0.6)", borderRadius: 24 }} />
              <IconFlower style={{ position: "absolute", top: -12, left: -10, width: 26, height: 26, color: "#E8A33D" }} />
              <IconLeaf style={{ position: "absolute", bottom: -8, right: -8, width: 22, height: 22, color: "#6B8F71" }} />
            </div>
            <div ref={heroSunRef} className="pointer-events-none z-20" style={{ position: "absolute", width: 110, height: 110, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,222,150,0.85) 0%, rgba(217,119,87,0.3) 45%, transparent 72%)", opacity: 0, transform: "translate(-50%,-50%)" }} />
            <div ref={heroSun2Ref} className="pointer-events-none z-20" style={{ position: "absolute", width: 46, height: 46, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,148,115,0.55), transparent 70%)", opacity: 0, transform: "translate(-50%,-50%)" }} />
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
          <SectionWrapper id="quote" delay={100} className="w-full py-24 px-6 md:px-12 flex items-center justify-center" style={{ background: "linear-gradient(160deg, #6B8F7114, transparent 70%), var(--t-surface)" }}>
            <div className="max-w-2xl mx-auto text-center">
              <div className="flex justify-center mb-6">
                <DrawLucideIcon icon={BookOpen} size={46} color="var(--t-acc)" strokeWidth={1.5} />
              </div>
              <TypewriterText
                text={`"${String(invitation.frasePersonalizadaTexto)}"`}
                className="text-[#3A2A22] text-2xl md:text-3xl leading-relaxed tracking-wide"
                style={{ fontFamily: 'var(--font-cormorant), serif', fontStyle: 'italic', margin: 0, fontWeight: 500 }}
              />
            </div>
          </SectionWrapper>
        ) : null}

        <SectionWrapper id="details" delay={150} className="w-full bg-[#FBF4EC] py-20 px-6 md:px-12">
          <div className="w-full max-w-[340px] sm:max-w-xl mx-auto text-left">
            <div className="flex justify-center mb-4">
              <DrawLucideIcon icon={CalendarDays} size={46} color="var(--t-acc)" strokeWidth={1.5} />
            </div>
            <p className="t-kicker mb-8 flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase text-[#E8A33D]" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
              CUÁNDO Y DÓNDE
            </p>

            {Boolean(invitation.ceremoniaHabilitada) && (
              <div className="bg-white border-l-[3px] border-l-[#E8A33D] p-6 sm:p-8 mb-6 shadow-sm">
                <div>
                  <span className=" text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8a7462] block mb-3" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                    {String(invitation.ceremoniaTitulo || "CEREMONIA")}
                  </span>
                  {Boolean(invitation.ceremoniaNombre) && (
                    <h4 className="text-2xl sm:text-3xl font-light text-[#3A2A22] mb-3" style={{ fontFamily: 'var(--font-cormorant), serif', fontStyle: 'italic' }}>
                      {String(invitation.ceremoniaNombre)}
                    </h4>
                  )}
                  {Boolean(invitation.ceremoniaHora) && (
                    <p className="text-[#8a7462]  text-sm sm:text-base mb-1" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                      {String(invitation.ceremoniaHora)} hs
                    </p>
                  )}
                  {Boolean(invitation.ceremoniaDireccion) && (
                    <p className="text-[#8a7462]  text-sm sm:text-base mb-4" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                      {String(invitation.ceremoniaDireccion)}
                    </p>
                  )}
                  {Boolean(invitation.ceremoniaMapUrl) && (
                    <a href={String(invitation.ceremoniaMapUrl)} target="_blank" rel="noopener noreferrer" className="inline-block mt-1  text-xs font-semibold tracking-wider text-[#E8A33D] hover:text-[#3A2A22] transition-colors" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                      Ver mapa ceremonia ↗
                    </a>
                  )}
                </div>
              </div>
            )}

            {(lugarNombre || direccion) && (
              <div className="bg-white border-l-[3px] border-l-[#E8A33D] p-6 sm:p-8 mb-10 shadow-sm">
                <span className=" text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8a7462] block mb-3" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                  FIESTA / SALÓN
                </span>
                {lugarNombre && (
                  <h4 className="text-2xl sm:text-3xl font-light text-[#3A2A22] mb-3" style={{ fontFamily: 'var(--font-cormorant), serif', fontStyle: 'italic' }}>
                    {lugarNombre}
                  </h4>
                )}
                {hora && (
                  <p className="text-[#8a7462]  text-sm sm:text-base mb-1" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                    {hora} hs
                  </p>
                )}
                {direccion && (
                  <p className="text-[#8a7462]  text-sm sm:text-base mb-4" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                    {direccion}
                  </p>
                )}
                {mapUrl && (
                  <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-1  text-xs font-semibold tracking-wider text-[#E8A33D] hover:text-[#3A2A22] transition-colors" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
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
                <p className="t-kicker mb-6 flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase text-[#E8A33D]" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                  CRONOGRAMA
                </p>
                <div className="flex flex-col w-full">
                  {cronograma.map((item, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center py-4 border-b border-[#E8A33D]/10 last:border-b-0">
                      {item.time && (
                        <span className=" text-sm sm:text-base text-[#8a7462] font-medium w-24 flex-shrink-0 mb-1 sm:mb-0" style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}>
                          {item.time}
                        </span>
                      )}
                      <span className="text-[1.2rem] sm:text-[1.3rem] text-[#3A2A22] font-light" style={{ fontFamily: 'var(--font-cormorant), serif', fontStyle: 'italic' }}>
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
          <SectionWrapper id="album" delay={200} className="w-full py-20 overflow-hidden" style={{ background: "var(--t-surface)" }}>
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
          <SectionWrapper id="banco" delay={200} className="w-full bg-[#F5E6D6] py-20 px-6 md:px-12 overflow-hidden">
            <div className="w-full max-w-[340px] sm:max-w-xl mx-auto text-left">
                <div className="flex justify-center mb-4">
                  <DrawLucideIcon icon={Landmark} size={46} color="var(--t-acc)" strokeWidth={1.5} />
                </div>
                <p className="t-kicker mb-10 flex items-center gap-2 text-[#E8A33D]">
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
                      accentColor="#E8A33D"
                      cardBg="#FFFFFF"
                      textPrimary="#3A2A22"
                      textSecondary="#8a7462"
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
                      accentColor="#E8A33D"
                      cardBg="#FFFFFF"
                      textPrimary="#3A2A22"
                      textSecondary="#8a7462"
                      InfoRow={InfoRow}
                      CopyField={CopyField}
                    />
                  )}
                </div>
                </div>
          </SectionWrapper>
        )}

        {triviaHabilitada && triviaPreguntas.length > 0 && (
          <SectionWrapper id="quiz" delay={300} className="w-full py-20 px-6 md:px-12" style={{ background: "linear-gradient(160deg, #6B8F7118, transparent 70%), #F5E6D6" }}>
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

        <div className="w-full flex items-center justify-center gap-2 py-6" style={{ background: '#FBF4EC' }} aria-hidden="true">
          <div style={{ width: 28, height: 1, background: 'linear-gradient(90deg, transparent, #E8A33D, transparent)' }} />
          <IconButterfly className="gardenparty-scroll-doodle opacity-0" style={{ width: 20, height: 17, color: '#6B8F71' }} />
          <div style={{ width: 28, height: 1, background: 'linear-gradient(90deg, transparent, #E8A33D, transparent)' }} />
        </div>

        <LogoFooterCredit bgColor="#FBF4EC" textColor="var(--gardenparty-ink, #3A2A22)" />
        </div>
      </div>

      {isCoverOpen && <BottomNavPill sections={navSections} variant="moderno" accentColor="#E8A33D" surfaceColor="#FFFFFF" />}
      </div>
  );
}
