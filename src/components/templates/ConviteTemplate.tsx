"use client";

import { useState, useEffect } from "react";
import { AlbumCarousel } from "@/components/invitation/v2/AlbumCarousel";
import { CountdownV2 } from "@/components/invitation/v2/CountdownV2";
import { RSVPWizardV2 } from "@/components/invitation/v2/RSVPWizardV2";
import { PaymentBadge } from "@/components/invitation/v2/PaymentBadge";
import { SongSuggestion } from "@/components/invitation/v2/SongSuggestion";
import { SectionWrapper } from "@/components/invitation/v2/SectionWrapper";
import { BottomNavPill } from "@/components/invitation/v2/BottomNavPill";
import { HeroV2 } from "@/components/invitation/v2/HeroV2";
import { MusicPlayer } from "@/components/invitation/MusicPlayer";
import { Clock, MapPin, Trophy, Star, ThumbsUp, Users } from "lucide-react";
import { getEventStatus, getInvitationExpirationDate } from "@/lib/expiration";

const IconInfo  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>;
const IconCheck = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>;
const IconMusic = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>;
const IconMap   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
const IconGift  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/></svg>;
const IconQuiz  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>;

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

interface ConviteTemplateProps {
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
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-white/10 last:border-b-0">
      <div className="min-w-0 flex-1">
        <span className="block text-[11px] font-semibold text-amber-300/80 uppercase tracking-wider">{label}</span>
        <span className="text-sm font-mono text-white/90 break-all">{value}</span>
      </div>
      <button className={`copy-btn shrink-0 text-xs font-semibold px-3 py-1 rounded-full border border-amber-500/40 text-amber-300 hover:bg-amber-500/20 transition-all${copied ? " copied bg-amber-500/30" : ""}`} type="button" onClick={handle}>
        {copied ? "✓ Copiado" : "Copiar"}
      </button>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-white/10 last:border-b-0">
      <div className="min-w-0 flex-1">
        <span className="block text-[11px] font-semibold text-white/40 uppercase tracking-wider">{label}</span>
        <span className="text-sm font-medium text-white/90">{value}</span>
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
      <div className="quiz-box text-center">
        <div className="flex justify-center mb-4 text-amber-500">
          {percent === 100 ? <Trophy className="w-16 h-16" strokeWidth={1.5} /> : percent >= 70 ? <Star className="w-16 h-16" strokeWidth={1.5} /> : <ThumbsUp className="w-16 h-16" strokeWidth={1.5} />}
        </div>
        <h3 style={{ fontFamily: "var(--t-font-d)", fontSize: "28px", color: "var(--t-onpaper)" }}>¡Quiz Completado!</h3>
        <p style={{ marginTop: "12px", opacity: 0.9 }}>
          Respondiste {score} de {preguntas.length} correctamente ({percent}%).
        </p>
        
        {isSaving ? (
          <p style={{ marginTop: "16px", fontSize: "14px", opacity: 0.7 }}>Guardando tus resultados...</p>
        ) : (
          stats && stats.count > 0 && (
            <div style={{ marginTop: "28px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "var(--t-paper2)", padding: "8px 16px", borderRadius: "99px", border: "1px solid rgba(0,0,0,0.06)", textAlign: "left", maxWidth: "90%" }}>
                <Users className="w-5 h-5 opacity-60 shrink-0" />
                <p style={{ fontSize: "11.5px", margin: 0, opacity: 0.85, lineHeight: 1.4 }}>
                  El promedio global de aciertos del resto de los invitados ({stats.count}) es del <strong>{stats.avg}%</strong>.
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

  return (
    <div className="quiz-box">
      <p style={{ fontSize: "13px", opacity: 0.6, marginBottom: "12px", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Pregunta {currentIdx + 1} de {preguntas.length}</p>
      <div className="quiz-q" key={currentIdx}>
        <p className="quiz-q-text">{q.pregunta}</p>
        <div className="quiz-opts">
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
                className={className}
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

export function ConviteTemplate({ invitation, guest, isPersonalized = false }: ConviteTemplateProps) {
  const [isCoverOpen, setIsCoverOpen] = useState(false);
  const tipo   = String(invitation.tipo ?? "OTRO");
  const theme  = getThemeFromTipo(tipo);

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
  const liveFotos = (invitation.liveSession as { items?: { fileUrl: string }[] } | null)?.items?.map((i) => i.fileUrl) ?? [];
  const allPhotos = [...new Set([...galeria, ...albumFotos, ...liveFotos].filter(Boolean))];

  const cronograma: CronoItem[] = safeJson<CronoItem[]>(String(invitation.cronogramaEventos ?? ""), []);

  const isPreview = !guest;
  const rsvpEnabled = Boolean(invitation.rsvpEnabled ?? invitation.confirmacionHabilitada ?? true);
  const paymentEnabled = Boolean(invitation.regaloHabilitado) || isPreview;
  const paymentAmount  = Number(invitation.regaloMonto ?? 0) || (isPreview && !invitation.id ? 25000 : undefined);
  const guestPayStatus = (guest?.paymentStatus ?? "PENDING") as "PENDING" | "EXEMPT" | "PAID";

  const regaloHabilitado = Boolean(invitation.regaloHabilitado);
  const pagoTarjetaHabilitado = Boolean(invitation.pagoTarjetaHabilitado);
  const showGiftSection = regaloHabilitado || pagoTarjetaHabilitado;
  const bothAccounts = regaloHabilitado && pagoTarjetaHabilitado;

  const showBankDetails = showGiftSection && Boolean(
    invitation.regaloCbu || invitation.regaloAlias || invitation.regaloTitular || 
    invitation.pagoTarjetaCbu || invitation.pagoTarjetaAlias || invitation.pagoTarjetaTitular || 
    paymentAmount
  );

  const triviaHabilitada = Boolean(invitation.triviaHabilitada);
  const triviaPreguntas: QuizQuestion[] = safeJson<QuizQuestion[]>(String(invitation.triviaPreguntas ?? ""), []);

  const songsEnabled = Boolean(invitation.sugerenciaMusicaHabilitada ?? true);

  const portadaDressCode = String(invitation.portadaDressCode ?? "");

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
      <div className="min-h-screen w-full bg-gradient-to-b from-[#0d1412] via-[#121c19] to-[#090e0d] text-white relative overflow-x-hidden flex flex-col justify-between" data-theme={theme}>
        {/* Decorative Background Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-25 bg-cover bg-center"
          style={heroBgDesktop ? { backgroundImage: `url(${heroBgDesktop})` } : undefined}
        />
        <div className="absolute inset-0 pointer-events-none bg-black/50 backdrop-blur-[2px]" />

        <main className="relative z-10 max-w-5xl mx-auto w-full px-6 py-12 lg:py-20 space-y-12">
          {/* Header Card */}
          <div className="p-8 sm:p-14 rounded-3xl bg-[#172420]/95 border border-amber-500/30 shadow-2xl backdrop-blur-2xl text-center max-w-4xl mx-auto space-y-6">
            <span className="text-6xl sm:text-7xl block transform hover:scale-110 transition-transform duration-300 drop-shadow-md">✨🥳</span>
            
            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-amber-300 tracking-tight drop-shadow-md">
              ¡Esperamos que la hayan pasado genial!
            </h1>
            
            <p className="text-lg sm:text-2xl text-slate-100 leading-relaxed font-sans max-w-2xl mx-auto font-normal drop-shadow-sm">
              Gracias por habernos acompañado en este día tan especial y compartir momentos inolvidables con nosotros. ❤️
            </p>

            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs sm:text-sm font-mono tracking-wide shadow-lg backdrop-blur-md">
                <span>⏳ Tarjeta y fotos LIVE disponibles hasta el <strong className="text-amber-300 font-bold">{expirationDateStr}</strong></span>
              </div>
            </div>
          </div>

          {/* Carrusel de Fotos LIVE */}
          <SectionWrapper id="album" className="w-full">
            {livePhotos.length > 0 ? (
              <div className="w-full overflow-hidden rounded-2xl bg-black/50 p-4 border border-amber-500/20 shadow-2xl">
                <AlbumCarousel photos={livePhotos} hideHeader={true} />
              </div>
            ) : (
              <div className="p-10 sm:p-14 rounded-3xl bg-[#172420]/95 border border-amber-500/30 text-center max-w-lg mx-auto shadow-2xl backdrop-blur-2xl space-y-4">
                <span className="text-6xl block drop-shadow-md">📸</span>
                <h3 className="font-serif font-bold text-2xl text-amber-300 drop-shadow-sm">
                  Fotos LIVE de la Fiesta
                </h3>
                <p className="text-base text-slate-200 leading-relaxed font-sans font-medium">
                  No se registraron fotografías subidas durante la transmisión LIVE del evento.
                </p>
              </div>
            )}
          </SectionWrapper>
        </main>

        <footer className="relative z-10 py-6 text-center text-xs text-slate-400 border-t border-white/10 font-sans">
          Invitaciones Digitales · Recuerdos del Evento
        </footer>
      </div>
    );
  }

  return (
    <>
      {/* PORTADA / WELCOME OVERLAY (Antesala tipo sobre) */}
      {portadaHabilitada && !isCoverOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-[#182420] via-[#0F1613] to-[#050807] text-[#F7F1E4] transition-all duration-700 animate-in fade-in"
          style={{
            backgroundImage: heroBgDesktop 
              ? `linear-gradient(rgba(15,22,19,0.88), rgba(15,22,19,0.94)), url(${heroBgDesktop})`
              : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="relative w-full max-w-lg p-8 sm:p-12 border border-white/20 rounded-3xl bg-[#0F1613]/90 backdrop-blur-xl text-center shadow-2xl flex flex-col items-center justify-center">
            {/* Monogram Seal */}
            <div className="w-16 h-16 rounded-full border-2 border-[var(--t-acc,#C79A4B)] flex items-center justify-center mb-6 shadow-inner bg-black/20">
              <span className="font-serif text-xl font-bold text-[var(--t-acc,#C79A4B)]">{monogram}</span>
            </div>

            {/* Kicker */}
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--t-acc,#C79A4B)] mb-3 opacity-90">
              {portadaKicker}
            </p>

            {/* Guest Name or Event Title */}
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-12 text-[#F7F1E4] leading-tight">
              {guestNameDisplay}
            </h2>



            {portadaDressCode && portadaDressCode !== "undefined" && (
              <div className="mb-12 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/5 backdrop-blur-md border border-[var(--t-acc,#C79A4B)]/40 text-[var(--t-acc,#C79A4B)] shadow-[0_0_20px_rgba(0,0,0,0.3)] transform transition-transform hover:scale-105">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 9.5l-4-4-3 3-2-2-2 2-3-3-4 4M21 9.5v9a2 2 0 01-2 2H5a2 2 0 01-2-2v-9" />
                </svg>
                <p className="text-sm font-bold tracking-widest uppercase font-sans">Dress Code: {portadaDressCode}</p>
              </div>
            )}

            {/* City & Date */}
            <p className="font-mono text-xs opacity-75 mb-8 tracking-wider">
              {ciudad ? `${ciudad} · ` : ""}{fechaStr}
            </p>

            {/* Open Button */}
            <button
              type="button"
              onClick={() => setIsCoverOpen(true)}
              className="inline-flex items-center gap-3 font-sans font-bold text-sm px-8 py-4 rounded-full bg-[var(--t-acc,#C79A4B)] text-[#0F1613] hover:scale-105 transition-all shadow-lg active:scale-95 cursor-pointer"
            >
              <span className="text-base">✦</span> {portadaBoton}
            </button>

          </div>
        </div>
      )}

      <div className="desktop-stage" data-theme={theme}>
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
        <div className="d-left-top">
          <div className="seal" style={{ borderColor: "var(--t-acc)" }}>
            <span style={{ color: "var(--t-acc)", fontFamily: "var(--t-font-d)" }}>{monogram}</span>
          </div>
          <p className="t-kicker" style={{ color: "var(--t-acc)" }}>{eyebrow}</p>
          <h1>
            {em ? (
              <>
                {title.slice(0, title.indexOf(em))}
                <em>{em}</em>
                {title.slice(title.indexOf(em) + em.length)}
              </>
            ) : title}
          </h1>
          <p className="pdate">{fechaStr}{ciudad ? ` · ${ciudad}` : ""}{lugarNombre ? ` · ${lugarNombre}` : ""}</p>
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
        <div className="hide-desktop">
          <div className="p-hero">
            <div
              className="hero-photo"
              style={heroBgMobile ? {
                backgroundImage: `url(${heroBgMobile})`,
                backgroundSize: "cover",
                backgroundPosition: `${Number(invitation.portadaImagenPosX ?? 50)}% ${Number(invitation.portadaImagenPosY ?? 50)}%`,
                backgroundRepeat: "no-repeat"
              } : undefined}
            />
            <div className="p-seal">
              <span style={{ color: "var(--t-acc)", fontFamily: "var(--t-font-d)" }}>{monogram}</span>
            </div>
            <p className="t-kicker" style={{ color: "var(--t-acc)" }}>{eyebrow}</p>
            <h1>
              {em ? (
                <>
                  {title.slice(0, title.indexOf(em))}
                  <em>{em}</em>
                  {title.slice(title.indexOf(em) + em.length)}
                </>
              ) : title}
            </h1>
            <p className="pdate">{fechaStr}{lugarNombre ? ` · ${lugarNombre}` : ""}</p>
          </div>
        </div>

        {(invitation.contadorHabilitado ?? true) ? (
          <CountdownV2
            targetDate={fechaEvento}
            kicker="Cuenta regresiva"
            title={tipo === "CASAMIENTO" ? "Faltan poquitos días" : "La cuenta ya empezó"}
          />
        ) : null}

        {(Boolean(invitation.frasePersonalizadaHabilitada) && Boolean(invitation.frasePersonalizadaTexto)) ? (
          <SectionWrapper dark id="quote" delay={100}>
            <div className="d-quote-wrap">
              <h2 style={{ margin: 0, fontStyle: "italic", fontWeight: 500, textAlign: "center", position: "relative", padding: "0 10px" }}>
                <span style={{ color: "var(--t-acc)", fontSize: "1.6em", lineHeight: 0, verticalAlign: "-0.2em", marginRight: "4px" }}>&ldquo;</span>
                {String(invitation.frasePersonalizadaTexto)}
                <span style={{ color: "var(--t-acc)", fontSize: "1.6em", lineHeight: 0, verticalAlign: "-0.2em", marginLeft: "4px" }}>&rdquo;</span>
              </h2>
            </div>
          </SectionWrapper>
        ) : null}

        <SectionWrapper id="details" delay={150}>
          <p className="t-kicker">Cuándo y dónde</p>
          <h2>Los esperamos</h2>

          {/* TARJETA 1: CEREMONIA / CIVIL (Si está cargada) */}
          {(Boolean(invitation.ceremoniaHabilitada) || Boolean(invitation.ceremoniaNombre) || Boolean(invitation.ceremoniaDireccion)) && (
            <div className="t-detail" style={{ margin: "0 0 20px 0", borderLeft: "4px solid var(--t-acc)", paddingLeft: "18px" }}>
              <span className="t-kicker" style={{ display: "block", marginBottom: "6px" }}>
                {String(invitation.ceremoniaTitulo || "Ceremonia / Civil")}
              </span>
              {Boolean(invitation.ceremoniaNombre) && (
                <h4 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "4px" }}>
                  {String(invitation.ceremoniaNombre)}
                </h4>
              )}
              {Boolean(invitation.ceremoniaHora) && (
                <p style={{ fontWeight: 600, margin: "4px 0", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Clock className="w-4 h-4 text-amber-600/70 dark:text-amber-400/70" /> {String(invitation.ceremoniaHora)} hs
                </p>
              )}
              {Boolean(invitation.ceremoniaDireccion) && (
                <p style={{ margin: "4px 0", display: "flex", alignItems: "center", gap: "6px" }}>
                  <MapPin className="w-4 h-4 text-amber-600/70 dark:text-amber-400/70" /> {String(invitation.ceremoniaDireccion)}
                </p>
              )}
              {Boolean(invitation.ceremoniaMapUrl) && (
                <a href={String(invitation.ceremoniaMapUrl)} target="_blank" rel="noopener noreferrer" className="t-btn" style={{ marginTop: "10px" }}>
                  Ver mapa ceremonia ↗
                </a>
              )}
            </div>
          )}

          {/* TARJETA 2: FIESTA / SALÓN (Siempre visible si se ingresó lugar o dirección) */}
          {(lugarNombre || direccion) && (
            <div className="t-detail" style={{ margin: "0 0 20px 0" }}>
              <span className="t-kicker" style={{ display: "block", marginBottom: "6px" }}>Fiesta / Salón</span>
              {lugarNombre && <h4 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "4px" }}>{lugarNombre}</h4>}
              {hora && <p style={{ fontWeight: 600, margin: "4px 0", display: "flex", alignItems: "center", gap: "6px" }}>
                <Clock className="w-4 h-4 text-amber-600/70 dark:text-amber-400/70" /> {hora} hs
              </p>}
              {direccion && <p style={{ margin: "4px 0", display: "flex", alignItems: "center", gap: "6px" }}>
                <MapPin className="w-4 h-4 text-amber-600/70 dark:text-amber-400/70" /> {direccion}
              </p>}
              {mapUrl && (
                <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="t-btn" style={{ marginTop: "10px" }}>
                  Ver mapa fiesta ↗
                </a>
              )}
            </div>
          )}

          {/* CRONOGRAMA DE ACTIVIDADES (Si existe) */}
          {cronograma.length > 0 && (
            <div className="mt-6">
              <span className="t-kicker" style={{ display: "block", marginBottom: "12px" }}>Cronograma del Evento</span>
              <div className="d-cols-2">
                {cronograma.map((item, i) => (
                  <div key={i} className="t-detail">
                    <h4>{item.title}</h4>
                    <p style={{ margin: "4px 0", display: "flex", alignItems: "center", gap: "6px" }}>
                      {item.time ? <><Clock className="w-4 h-4 text-amber-600/70 dark:text-amber-400/70" /> {item.time} hs</> : ""}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isPersonalized && guest && (
            <div className="t-detail" style={{ background: "rgba(0,0,0,.05)", border: "1px dashed var(--t-acc)", marginTop: "16px" }}>
              <h4 style={{ marginBottom: "6px" }}>Tu invitación: {guest.name}</h4>
              <p style={{ opacity: 0.85 }}>
                {guest.expectedCount} {guest.expectedCount === 1 ? "lugar reservado" : "lugares reservados"}
              </p>
            </div>
          )}
        </SectionWrapper>

        {(invitation.galeriaPrincipalHabilitada ?? true) && allPhotos.length > 0 && (
          <AlbumCarousel photos={allPhotos} dark />
        )}

        {mapUrl && (
          <section id="location" style={{ height: "220px", overflow: "hidden" }}>
            <iframe
              src={mapUrl.replace("maps.google.com", "maps.google.com/maps?output=embed&")}
              width="100%"
              height="220"
              style={{ border: 0, display: "block" }}
              loading="lazy"
              title={`Mapa: ${lugarNombre}`}
              referrerPolicy="no-referrer-when-downgrade"
            />
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
          <SectionWrapper dark id="banco" delay={200}>
            {bothAccounts ? (
              <>
                <p className="t-kicker">Datos Bancarios del Evento</p>
                <h2>Transferencias & Regalos</h2>
                <p style={{ opacity: 0.8, marginBottom: "20px" }} className="text-sm max-w-2xl">
                  Disponemos de dos cuentas bancarias independientes: una para la acreditación / pago de tarjetas de la fiesta y otra para los regalos.
                </p>
                {showBankDetails && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left w-full mt-4 items-stretch">
                    {/* Tarjeta 1: Pago de Tarjetas */}
                    {pagoTarjetaHabilitado && (
                      <div className="p-5 rounded-2xl bg-white/5 border border-amber-500/20 shadow-sm space-y-3">
                        <div className="flex items-center gap-2 font-bold text-amber-300 text-base border-b border-white/10 pb-2.5">
                          <span>💳</span>
                          <span>{String((invitation as any).pagoTarjetaTitulo || "Pago de Tarjetas / Pases")}</span>
                        </div>
                        {Boolean((invitation as any).pagoTarjetaMensaje) && (
                          <p className="text-xs text-white/70 italic py-1">
                            {String((invitation as any).pagoTarjetaMensaje)}
                          </p>
                        )}
                        {Boolean((invitation as any).pagoTarjetaBanco) && (
                          <InfoRow label="BANCO" value={String((invitation as any).pagoTarjetaBanco)} />
                        )}
                        {Boolean((invitation as any).pagoTarjetaCbu) && (
                          <CopyField label="CBU / CVU" value={String((invitation as any).pagoTarjetaCbu)} />
                        )}
                        {Boolean((invitation as any).pagoTarjetaAlias) && (
                          <CopyField label="ALIAS" value={String((invitation as any).pagoTarjetaAlias)} />
                        )}
                        {Boolean((invitation as any).pagoTarjetaTitular) && (
                          <InfoRow label="TITULAR" value={String((invitation as any).pagoTarjetaTitular)} />
                        )}
                      </div>
                    )}

                    {/* Tarjeta 2: Regalos */}
                    {regaloHabilitado && (
                      <div className="p-5 rounded-2xl bg-white/5 border border-amber-500/20 shadow-sm space-y-3">
                        <div className="flex items-center gap-2 font-bold text-amber-300 text-base border-b border-white/10 pb-2.5">
                          <span>🎁</span>
                          <span>{String((invitation as any).regaloTitulo || "Regalos del Evento")}</span>
                        </div>
                        {Boolean((invitation as any).regaloMensaje) && (
                          <p className="text-xs text-white/70 italic py-1">
                            {String((invitation as any).regaloMensaje)}
                          </p>
                        )}
                        {Boolean((invitation as any).regaloBanco) && (
                          <InfoRow label="BANCO" value={String((invitation as any).regaloBanco)} />
                        )}
                        {Boolean((invitation as any).regaloCbu) && (
                          <CopyField label="CBU / CVU" value={String((invitation as any).regaloCbu)} />
                        )}
                        {Boolean((invitation as any).regaloAlias) && (
                          <CopyField label="ALIAS" value={String((invitation as any).regaloAlias)} />
                        )}
                        {Boolean((invitation as any).regaloTitular) && (
                          <InfoRow label="TITULAR" value={String((invitation as any).regaloTitular)} />
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="t-kicker">Datos Bancarios</p>
                <h2>Cuenta de Transferencia</h2>
                <p style={{ opacity: 0.8, marginBottom: "20px" }} className="text-sm max-w-xl">
                  {String((invitation as any).pagoTarjetaMensaje || (invitation as any).regaloMensaje || "Esta cuenta se utilizará tanto para el pago/confirmación de pases como para quienes deseen realizar un regalo.")}
                </p>
                {showBankDetails && (
                  <div className="w-full max-w-lg text-left mt-4">
                    <div className="p-5 rounded-2xl bg-white/5 border border-amber-500/20 shadow-sm space-y-3">
                      <div className="flex items-center gap-2 font-bold text-amber-300 text-base border-b border-white/10 pb-2.5">
                        <span>💳</span>
                        <span>Datos de Transferencia</span>
                      </div>
                      {Boolean((invitation as any).pagoTarjetaBanco || (invitation as any).regaloBanco) && (
                        <InfoRow label="BANCO" value={String((invitation as any).pagoTarjetaBanco || (invitation as any).regaloBanco)} />
                      )}
                      {Boolean((invitation as any).pagoTarjetaCbu || (invitation as any).regaloCbu) && (
                        <CopyField label="CBU / CVU" value={String((invitation as any).pagoTarjetaCbu || (invitation as any).regaloCbu)} />
                      )}
                      {Boolean((invitation as any).pagoTarjetaAlias || (invitation as any).regaloAlias) && (
                        <CopyField label="ALIAS" value={String((invitation as any).pagoTarjetaAlias || (invitation as any).regaloAlias)} />
                      )}
                      {Boolean((invitation as any).pagoTarjetaTitular || (invitation as any).regaloTitular) && (
                        <InfoRow label="TITULAR" value={String((invitation as any).pagoTarjetaTitular || (invitation as any).regaloTitular)} />
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </SectionWrapper>
        )}

        {triviaHabilitada && triviaPreguntas.length > 0 && (
          <SectionWrapper id="quiz" delay={300}>
            <p className="t-kicker">¿Cuánto sabés?</p>
            <h2>{String(invitation.triviaTitulo ?? "Un juego para vos")}</h2>
            <ProgressiveQuiz 
              preguntas={triviaPreguntas} 
              invitationId={String(invitation.id ?? "")}
              guestToken={guest?.uniqueToken}
              guestName={guest?.name}
              tipo={tipo}
            />
          </SectionWrapper>
        )}

        {songsEnabled && (
          <SongSuggestion
            invitationId={String(invitation.id ?? "")}
            guestToken={guest?.uniqueToken}
            guestName={guest?.name ?? "Invitado"}
            dark
            showPublicList
          />
        )}

        {Boolean(invitation.musicaHabilitada) && Boolean(invitation.musicaUrl) && (
          <MusicPlayer 
            musicaUrl={String(invitation.musicaUrl)} 
            autoplay={Boolean(invitation.musicaAutoplay ?? true)}
            loop={Boolean(invitation.musicaLoop ?? true)}
          />
        )}

        <footer className="d-foot">
          <div className="mono">{monogram}</div>
          <small>
            Con cariño, gracias por ser parte de este día ✦{" "}
            <a href="https://convite.ar" style={{ color: "inherit", textDecoration: "none" }} target="_blank" rel="noopener noreferrer">Invitaciones digitales</a>
          </small>
        </footer>

        <BottomNavPill sections={navSections} />
      </div>
    </div>
    </>
  );
}
