"use client";

import { HeroV2 } from "@/components/invitation/v2/HeroV2";
import { BottomNavPill } from "@/components/invitation/v2/BottomNavPill";
import { CountdownV2 } from "@/components/invitation/v2/CountdownV2";
import { RSVPWizardV2 } from "@/components/invitation/v2/RSVPWizardV2";
import { PaymentBadge } from "@/components/invitation/v2/PaymentBadge";
import { SongSuggestion } from "@/components/invitation/v2/SongSuggestion";
import { SectionWrapper } from "@/components/invitation/v2/SectionWrapper";

// ── Iconos SVG inline (sin dependencia de librería) ─────────────
const IconInfo  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>;
const IconCheck = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>;
const IconMusic = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>;
const IconMap   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>;

// ── Tipos de tema ────────────────────────────────────────────────
type Theme = "boda" | "xv" | "general";

function getThemeFromTipo(tipo: string): Theme {
  if (tipo === "CASAMIENTO") return "boda";
  if (tipo === "QUINCE_ANOS") return "xv";
  return "general";
}

function safeJson(val: string | null | undefined, fallback: unknown = null) {
  if (!val) return fallback;
  try { return JSON.parse(val); } catch { return fallback; }
}

// ── Tipos de props ───────────────────────────────────────────────
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

// ── Template principal ───────────────────────────────────────────
export function ConviteTemplate({ invitation, guest, isPersonalized = false }: ConviteTemplateProps) {
  const tipo   = String(invitation.tipo ?? "OTRO");
  const theme  = getThemeFromTipo(tipo);

  // Nombre(s) para el hero
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
    tipo === "CASAMIENTO"    ? "Nos casamos"
    : tipo === "QUINCE_ANOS" ? "Mis quince años"
    : tipo === "CUMPLEANOS"  ? "¡Cumpleaños!"
    : tipo === "BAUTISMO"    ? "Bautismo"
    : "Te invitamos";

  const monogram =
    tipo === "CASAMIENTO"
      ? `${String(invitation.nombreNovia ?? "?")[0]}${String(invitation.nombreNovio ?? "?")[0]}`
      : String(title[0] ?? "✦");

  const fechaEvento = invitation.fechaEvento
    ? new Date(String(invitation.fechaEvento))
    : new Date();

  const fechaStr = fechaEvento.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).replace(/\//g, " · ");

  const lugarNombre = String(invitation.lugarNombre ?? "");
  const direccion   = String(invitation.direccion ?? "");
  const hora        = String(invitation.hora ?? "");
  const mapUrl      = String(invitation.mapUrl ?? "");

  // Galería
  const galeria: string[] = safeJson(String(invitation.galeriaPrincipalFotos ?? ""), []) as string[];

  // RSVP
  const rsvpEnabled = Boolean(invitation.rsvpEnabled ?? invitation.confirmacionHabilitada ?? true);

  // Estado de pago
  const paymentEnabled = Boolean(invitation.regaloHabilitado) && Boolean(invitation.regaloMostrarDatos);
  const paymentAmount  = Number(invitation.regaloMonto ?? 0) || undefined;
  const guestPayStatus = (guest?.paymentStatus ?? "PENDING") as "PENDING" | "EXEMPT" | "PAID";

  // Dress code
  const dresscode = Boolean(invitation.dresscodeHabilitado);

  // Canciones
  const songsEnabled = Boolean(invitation.albumCompartidoHabilitado); // reutilizamos el flag por ahora

  // Bottom nav sections
  const navSections = [
    { id: "details",   label: "Detalles", icon: <IconInfo /> },
    ...(rsvpEnabled ? [{ id: "rsvp", label: "Confirmar", icon: <IconCheck /> }] : []),
    ...(songsEnabled ? [{ id: "songs", label: "Música", icon: <IconMusic /> }] : []),
    ...(lugarNombre  ? [{ id: "location", label: "Mapa", icon: <IconMap /> }] : []),
  ];

  return (
    <div className="invitation-wrapper" data-theme={theme}>

      {/* ── HERO ── */}
      <HeroV2
        monogram={monogram}
        eyebrow={eyebrow}
        title={title}
        titleEm={em}
        date={fechaStr}
        location={lugarNombre || undefined}
        backgroundImage={String(invitation.portadaImagenFondo ?? "") || undefined}
        posX={Number(invitation.portadaImagenPosX ?? 50)}
        posY={Number(invitation.portadaImagenPosY ?? 30)}
        scale={Number(invitation.portadaImagenEscala ?? 110)}
      />

      {/* ── COUNTDOWN ── */}
      {invitation.contadorHabilitado ? (
        <CountdownV2
          targetDate={fechaEvento}
          kicker="Cuenta regresiva"
          title={tipo === "CASAMIENTO" ? "Faltan poquitos días" : "La cuenta ya empezó"}
        />
      ) : null}

      {/* ── QUOTE / FRASE ── */}
      {invitation.frasePersonalizadaHabilitada && invitation.frasePersonalizadaTexto ? (
        <SectionWrapper dark id="quote" delay={100}>
          <p className="inv-eyebrow">Nuestra historia</p>
          <blockquote
            className="inv-display"
            style={{ fontSize: "var(--text-h2)", fontStyle: "italic", fontWeight: 500, margin: 0 }}
          >
            {String(invitation.frasePersonalizadaTexto)}
          </blockquote>
        </SectionWrapper>
      ) : null}

      {/* ── DETALLES DEL EVENTO ── */}
      <SectionWrapper id="details" delay={150}>
        <p className="inv-eyebrow">Cuándo y dónde</p>
        <h2 className="inv-h2">Los esperamos</h2>

        {/* Lugar + hora */}
        {lugarNombre && (
          <div className="inv-card" style={{ marginTop: "var(--sp-5)" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h3)", margin: "0 0 4px" }}>
              {lugarNombre}
            </h3>
            {hora && (
              <p className="inv-mono" style={{ margin: "0 0 4px", fontSize: "var(--text-sm)" }}>
                {hora} hs
              </p>
            )}
            {direccion && (
              <p className="inv-body" style={{ margin: "0 0 var(--sp-3)" }}>{direccion}</p>
            )}
            {mapUrl && (
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inv-btn-ghost"
                aria-label={`Ver mapa de ${lugarNombre} en Google Maps`}
              >
                Ver mapa ↗
              </a>
            )}
          </div>
        )}

        {/* Invitado personalizado: nombre y mesa */}
        {isPersonalized && guest && (
          <div className="inv-card" style={{ marginTop: "var(--sp-3)", borderLeft: "3px solid var(--c-accent)" }}>
            <p className="inv-eyebrow" style={{ marginBottom: "var(--sp-2)" }}>Tu invitación</p>
            <p style={{ margin: 0, fontSize: "var(--text-h3)", fontFamily: "var(--font-display)", fontWeight: 600 }}>
              {guest.name}
            </p>
            <p className="inv-mono" style={{ margin: "4px 0 0", opacity: .65 }}>
              {guest.expectedCount} {guest.expectedCount === 1 ? "lugar reservado" : "lugares reservados"}
            </p>
          </div>
        )}
      </SectionWrapper>

      {/* ── DRESS CODE ── */}
      {dresscode && Boolean(invitation.dresscodeTipo) && (
        <SectionWrapper dark id="dresscode" delay={200}>
          <p className="inv-eyebrow">Dress code</p>
          <h2 className="inv-h2">{String(invitation.dresscodeTitulo ?? "Vestimenta")}</h2>
          <p className="inv-body">{String(invitation.dresscodeTipo ?? "")}</p>
          {invitation.dresscodeObservaciones != null && (
            <p className="inv-body" style={{ opacity: .7, marginTop: "var(--sp-2)" }}>
              {String(invitation.dresscodeObservaciones)}
            </p>
          )}
        </SectionWrapper>
      )}

      {/* ── GALERÍA ── */}
      {Boolean(invitation.galeriaPrincipalHabilitada) && galeria.length > 0 && (
        <SectionWrapper id="gallery" delay={250} noBorder>
          <p className="inv-eyebrow">Galería</p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: galeria.length === 1 ? "1fr" : "repeat(2, 1fr)",
              gap: "var(--sp-2)",
              marginTop: "var(--sp-4)",
            }}
          >
            {galeria.slice(0, 6).map((url, i) => (
              <div
                key={i}
                style={{
                  aspectRatio: "4/3",
                  borderRadius: "var(--radius-s)",
                  overflow: "hidden",
                  ...(i === 0 && galeria.length > 1 ? { gridColumn: "1 / -1", aspectRatio: "16/9" } : {}),
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Foto ${i + 1} del evento`}
                  loading="lazy"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            ))}
          </div>
        </SectionWrapper>
      )}

      {/* ── MAPA EMBED ── */}
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

      {/* ── RSVP ── */}
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

      {/* ── BADGE DE PAGO (fuera del wizard, visible siempre si ya confirmó) ── */}
      {isPersonalized && guest?.status === "CONFIRMED" && paymentEnabled && paymentAmount && (
        <SectionWrapper id="payment" delay={0} dark={false}>
          <p className="inv-eyebrow">Estado de tu tarjeta</p>
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

      {/* ── CANCIONES ── */}
      {songsEnabled && (
        <SongSuggestion
          invitationId={String(invitation.id ?? "")}
          guestToken={guest?.uniqueToken}
          guestName={guest?.name ?? "Invitado"}
          dark
          showPublicList
        />
      )}

      {/* ── FOOTER ── */}
      <footer
        style={{
          padding: "var(--sp-10) var(--sp-6) 90px",
          textAlign: "center",
          background: "var(--ink)",
          color: "var(--on-ink)",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontSize: "22px",
            color: "var(--c-accent)",
            marginBottom: "var(--sp-2)",
          }}
        >
          {monogram}
        </div>
        <small style={{ fontSize: "11px", opacity: 0.5 }}>
          Con cariño, gracias por ser parte de este día ✦{" "}
          <a
            href="https://convite.ar"
            style={{ color: "inherit", opacity: 0.6, textDecoration: "none" }}
            target="_blank"
            rel="noopener noreferrer"
          >
            Convite
          </a>
        </small>
      </footer>

      {/* ── BOTTOM NAV PILL ── */}
      <BottomNavPill sections={navSections} />
    </div>
  );
}
