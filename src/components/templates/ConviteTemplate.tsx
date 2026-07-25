"use client";

import { useState } from "react";
import { AlbumCarousel } from "@/components/invitation/v2/AlbumCarousel";
import { CountdownV2 } from "@/components/invitation/v2/CountdownV2";
import { RSVPWizardV2 } from "@/components/invitation/v2/RSVPWizardV2";
import { PaymentBadge } from "@/components/invitation/v2/PaymentBadge";
import { SongSuggestion } from "@/components/invitation/v2/SongSuggestion";
import { SectionWrapper } from "@/components/invitation/v2/SectionWrapper";
import { BottomNavPill } from "@/components/invitation/v2/BottomNavPill";
import { HeroV2 } from "@/components/invitation/v2/HeroV2";

const IconInfo  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>;
const IconCheck = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>;
const IconMusic = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>;
const IconMap   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>;

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
    paymentStatus: string;
    expectedCount: number;
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
    <div className="bank-row">
      <div>
        <label>{label}</label>
        <span>{value}</span>
      </div>
      <button className={`copy-btn${copied ? " copied" : ""}`} type="button" onClick={handle}>
        {copied ? "✓ Copiado" : "Copiar"}
      </button>
    </div>
  );
}

interface QuizQuestion {
  pregunta: string;
  opciones: string[];
  correcta?: number;
}

function ProgressiveQuiz({ preguntas, invitationId, guestToken, guestName }: { preguntas: QuizQuestion[]; invitationId?: string; guestToken?: string; guestName?: string }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [picks, setPicks] = useState<Record<number, number>>({});
  const [finished, setFinished] = useState(false);
  const [stats, setStats] = useState<{ avg: number; count: number } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
              if (newPicks[i] === q.correcta) score++;
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

  if (finished) {
    let score = 0;
    preguntas.forEach((q, i) => { if (picks[i] === q.correcta) score++; });
    const percent = Math.round((score / preguntas.length) * 100);
    
    return (
      <div className="quiz-box text-center">
        <div style={{ fontSize: "64px", marginBottom: "16px" }}>{percent === 100 ? "🏆" : percent >= 70 ? "⭐" : "👍"}</div>
        <h3 style={{ fontFamily: "var(--t-font-d)", fontSize: "28px", color: "var(--t-onpaper)" }}>¡Quiz Completado!</h3>
        <p style={{ marginTop: "12px", opacity: 0.9 }}>
          Respondiste {score} de {preguntas.length} correctamente ({percent}%).
        </p>
        
        {isSaving ? (
          <p style={{ marginTop: "16px", fontSize: "14px", opacity: 0.7 }}>Guardando tus resultados...</p>
        ) : (
          stats && stats.count > 0 && (
            <div style={{ marginTop: "24px", padding: "16px", background: "var(--t-paper2)", borderRadius: "12px", border: "1px dashed var(--t-acc)" }}>
              <p style={{ fontFamily: "var(--t-font-d)", fontSize: "16px", marginBottom: "8px" }}>Estadísticas de invitados</p>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "var(--t-acc2)" }}>{stats.avg}%</div>
              <p style={{ fontSize: "12px", opacity: 0.8, marginTop: "4px" }}>
                Promedio de aciertos entre {stats.count} {stats.count === 1 ? "invitado" : "invitados"}.
              </p>
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
  const tipo   = String(invitation.tipo ?? "OTRO");
  const theme  = getThemeFromTipo(tipo);

  const getHeroTitle = () => {
    if (tipo === "CASAMIENTO") {
      const novia = String(invitation.nombreNovia ?? "");
      const novio = String(invitation.nombreNovio ?? "");
      if (novia && novio) return { title: `${novia} & ${novio}`, em: `& ${novio}` };
      return { title: String(invitation.nombreEvento ?? ""), em: undefined };
    }
    if (tipo === "QUINCE_ANOS") {
      return { title: String(invitation.nombreQuinceanera ?? invitation.nombreEvento ?? ""), em: undefined };
    }
    return { title: String(invitation.nombreEvento ?? ""), em: undefined };
  };

  const { title, em } = getHeroTitle();

  const eyebrow =
    tipo === "CASAMIENTO"   ? "Nos casamos"
    : tipo === "QUINCE_ANOS" ? "Mis quince años"
    : "Te invitamos";

  const monogram =
    tipo === "CASAMIENTO"
      ? `${String(invitation.nombreNovia ?? "?")[0]}${String(invitation.nombreNovio ?? "?")[0]}`
      : String(title[0] ?? "✦");

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

  const quoteKicker =
    tipo === "CASAMIENTO"   ? "Nuestra historia"
    : tipo === "QUINCE_ANOS" ? "Sus palabras"
    : "Mensaje de bienvenida";

  const galeria: string[] = safeJson<string[]>(String(invitation.galeriaPrincipalFotos ?? ""), []);
  const albumFotos = (invitation.album as { fotos?: { url: string }[] } | null)?.fotos?.map((f) => f.url) ?? [];
  const allPhotos = [...new Set([...galeria, ...albumFotos])];

  const cronograma: CronoItem[] = safeJson<CronoItem[]>(String(invitation.cronogramaEventos ?? ""), []);

  const isPreview = !guest;
  const rsvpEnabled = Boolean(invitation.rsvpEnabled ?? invitation.confirmacionHabilitada ?? true);
  const paymentEnabled = Boolean(invitation.regaloHabilitado) || isPreview;
  const paymentAmount  = Number(invitation.regaloMonto ?? 0) || (isPreview && !invitation.id ? 25000 : undefined);
  const guestPayStatus = (guest?.paymentStatus ?? "PENDING") as "PENDING" | "EXEMPT" | "PAID";

  const showBankData =
    (Boolean(invitation.regaloHabilitado) && Boolean(invitation.regaloMostrarDatos) && Boolean(invitation.regaloCbu || invitation.regaloAlias)) ||
    isPreview;

  const triviaHabilitada = Boolean(invitation.triviaHabilitada);
  const triviaPreguntas: QuizQuestion[] = safeJson<QuizQuestion[]>(String(invitation.triviaPreguntas ?? ""), []);

  const songsEnabled = Boolean(invitation.albumCompartidoHabilitado ?? true);

  const navSections = [
    { id: "details",   label: "Detalles", icon: <IconInfo /> },
    ...(rsvpEnabled   ? [{ id: "rsvp",     label: "Confirmar", icon: <IconCheck /> }] : []),
    ...(songsEnabled  ? [{ id: "songs",    label: "Música",    icon: <IconMusic /> }] : []),
    ...(lugarNombre   ? [{ id: "location", label: "Mapa",      icon: <IconMap /> }]   : []),
  ];

  const heroBgMobile  = String(invitation.portadaImagenFondo ?? "") || undefined;
  const heroBgDesktop = String(invitation.portadaImagenFondoDesktop ?? "") || heroBgMobile;

  return (
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
          <p className="pdate">{fechaStr}{lugarNombre ? ` · ${lugarNombre}` : ""}</p>
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

        {((invitation.frasePersonalizadaHabilitada ?? false) && Boolean(invitation.frasePersonalizadaTexto)) ? (
          <SectionWrapper dark id="quote" delay={100}>
            <div className="d-quote-wrap">
              <p className="t-kicker">{quoteKicker}</p>
              <p className="t-quote" style={{ margin: 0 }}>
                {String(invitation.frasePersonalizadaTexto)}
              </p>
            </div>
          </SectionWrapper>
        ) : null}

        <SectionWrapper id="details" delay={150}>
          <p className="t-kicker">Cuándo y dónde</p>
          <h2>Los esperamos</h2>

          {cronograma.length > 0 ? (
            <div className="d-cols-2">
              {cronograma.map((item, i) => (
                <div key={i} className="t-detail">
                  <h4>{item.title}</h4>
                  <p>
                    {item.time ? `${item.time} hs · ` : ""}
                    {lugarNombre || ""}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            lugarNombre && (
              <div className="t-detail" style={{ margin: 0 }}>
                <h4>{lugarNombre}</h4>
                {hora && <p>{hora} hs</p>}
                {direccion && <p>{direccion}</p>}
                {mapUrl && (
                  <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="t-btn">
                    Ver mapa ↗
                  </a>
                )}
              </div>
            )
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

        {mapUrl && cronograma.length > 0 && (
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
            dark
            hasPayment={paymentEnabled}
            paymentAmount={paymentAmount}
            paymentAlias={String(invitation.regaloAlias ?? "") || undefined}
            paymentCbu={String(invitation.regaloCbu ?? "") || undefined}
            paymentBanco={String(invitation.regaloBanco ?? "") || undefined}
            paymentTitular={String(invitation.regaloTitular ?? "") || undefined}
            initialStatus={guest?.status as "PENDING" | "CONFIRMED" | "DECLINED" | undefined}
            initialAttendingCount={guest?.attendingCount ?? 1}
            initialPaymentStatus={guestPayStatus}
          />
        )}

        {isPersonalized && guest?.status === "CONFIRMED" && paymentEnabled && paymentAmount && (
          <SectionWrapper id="payment" delay={0} dark={false}>
            <p className="t-kicker">Estado de tu tarjeta</p>
            <PaymentBadge
              paymentStatus={guestPayStatus}
              amount={paymentAmount}
              attendingCount={guest.attendingCount}
              alias={String(invitation.regaloAlias ?? "") || undefined}
              cbu={String(invitation.regaloCbu ?? "") || undefined}
              banco={String(invitation.regaloBanco ?? "") || undefined}
              titular={String(invitation.regaloTitular ?? "") || undefined}
            />
          </SectionWrapper>
        )}

        {showBankData && (
          <SectionWrapper dark id="banco" delay={200}>
            <p className="t-kicker">Datos bancarios</p>
            <h2>{String(invitation.regaloTitulo ?? "Si querés hacer tu aporte")}</h2>
            {Boolean(invitation.regaloMensaje) ? (
              <p style={{ opacity: 0.8, marginBottom: "var(--sp-4)" }}>
                {String(invitation.regaloMensaje)}
              </p>
            ) : null}
            <div className="bank-card">
              {Boolean(invitation.regaloBanco) && (
                <CopyField label="Banco" value={String(invitation.regaloBanco)} />
              )}
              {Boolean(invitation.regaloCbu) && (
                <CopyField label="CBU" value={String(invitation.regaloCbu)} />
              )}
              {Boolean(invitation.regaloAlias) && (
                <CopyField label="Alias" value={String(invitation.regaloAlias)} />
              )}
              {Boolean(invitation.regaloTitular) && (
                <CopyField label="Titular" value={String(invitation.regaloTitular)} />
              )}
              {paymentAmount && (
                <CopyField label="Monto por persona" value={`$${paymentAmount.toLocaleString("es-AR")}`} />
              )}
            </div>
          </SectionWrapper>
        )}

        {triviaHabilitada && triviaPreguntas.length > 0 && (
          <SectionWrapper id="quiz" delay={300}>
            <p className="t-kicker">{String(invitation.triviaTitulo ?? "Un juego para vos")}</p>
            <h2>{String(invitation.triviaSubtitulo ?? "¿Cuánto sabés?")}</h2>
            <ProgressiveQuiz 
              preguntas={triviaPreguntas} 
              invitationId={String(invitation.id ?? "")}
              guestToken={guest?.uniqueToken}
              guestName={guest?.name}
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

        <footer className="d-foot">
          <div className="mono">{monogram}</div>
          <small>
            Con cariño, gracias por ser parte de este día ✦{" "}
            <a href="https://convite.ar" style={{ color: "inherit", textDecoration: "none" }} target="_blank" rel="noopener noreferrer">Convite</a>
          </small>
        </footer>

        <BottomNavPill sections={navSections} />
      </div>
    </div>
  );
}
