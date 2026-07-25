"use client";

import { useState } from "react";

type PaymentStatus = "PENDING" | "EXEMPT" | "PAID";

interface RSVPWizardV2Props {
  invitationId: string;
  guestToken?: string;           // si es invitación personalizada
  guestName?: string;            // prefill nombre
  maxGuests?: number;            // límite de acompañantes
  dark?: boolean;
  // Configuración de pago
  hasPayment?: boolean;
  paymentAmount?: number;
  paymentAlias?: string;
  paymentCbu?: string;
  paymentBanco?: string;
  paymentTitular?: string;
  // Estado previo (si ya confirmó)
  initialStatus?: "PENDING" | "CONFIRMED" | "DECLINED";
  initialAttendingCount?: number;
  initialPaymentStatus?: PaymentStatus;
  // Callbacks
  onConfirmed?: (data: { attending: boolean; count: number }) => void;
}

type Step = "decision" | "details" | "finish" | "done" | "declined";

export function RSVPWizardV2({
  invitationId,
  guestToken,
  guestName = "",
  maxGuests = 6,
  dark = true,
  hasPayment = false,
  paymentAmount,
  paymentAlias,
  paymentCbu,
  paymentBanco,
  paymentTitular,
  initialStatus,
  initialAttendingCount = 1,
  initialPaymentStatus = "PENDING",
  onConfirmed,
}: RSVPWizardV2Props) {
  const [step, setStep] = useState<Step>(() => {
    if (initialStatus === "CONFIRMED") return "done";
    if (initialStatus === "DECLINED") return "declined";
    return "decision";
  });
  const [count, setCount] = useState(initialAttendingCount > 0 ? initialAttendingCount : 1);
  const [dietary, setDietary] = useState("");
  const [name, setName] = useState(guestName);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [paymentStatus] = useState<PaymentStatus>(initialPaymentStatus);

  const sectionClass = `section${dark ? " dark" : ""}`;

  const totalPayment = (paymentAmount ?? 0) * count;
  const formatARS = (n: number) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0 }).format(n);

  if (step === "decision") {
    return (
      <section className={sectionClass} id="rsvp">
        <p className="kicker">Confirmá tu asistencia</p>
        <h2 className="section-title">¿Vas a venir?</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)", marginTop: "var(--sp-6)" }}>
          <button
            className="btn solid"
            onClick={() => setStep("details")}
            style={{ width: "100%", fontSize: "15px", padding: "16px" }}
            aria-label="Confirmar asistencia"
          >
            ✓ Sí, voy a estar
          </button>
          <button
            className="btn"
            onClick={() => handleDecline()}
            style={{ width: "100%" }}
            aria-label="Declinar invitación"
          >
            No puedo ir esta vez
          </button>
        </div>
      </section>
    );
  }

  // ── PASO 2: Detalles ──────────────────────────────────────────
  if (step === "details") {
    return (
      <section className={sectionClass} id="rsvp">
        <p className="kicker">Paso 2 de 3</p>
        <h2 className="section-title">¿Cuántos van?</h2>

        {/* Nombre solo si no es invitación personalizada */}
        {!guestToken && (
          <div className="field" style={{ marginTop: "var(--sp-5)" }}>
            <label htmlFor="rsvp-name">Tu nombre</label>
            <input
              id="rsvp-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre y apellido"
              required
              autoComplete="name"
            />
          </div>
        )}

        {/* Stepper de cantidad */}
        <div className="field" style={{ marginTop: "var(--sp-5)" }}>
          <label id="count-label">
            Personas que asisten {maxGuests > 1 ? `(máx. ${maxGuests})` : ""}
          </label>
          <div className="stepper" aria-labelledby="count-label">
            <button
              type="button"
              onClick={() => setCount(Math.max(1, count - 1))}
              aria-label="Restar una persona"
              disabled={count <= 1}
            >
              −
            </button>
            <span className="n" aria-live="polite" aria-atomic="true">
              {count}
            </span>
            <button
              type="button"
              onClick={() => setCount(Math.min(maxGuests, count + 1))}
              aria-label="Sumar una persona"
              disabled={count >= maxGuests}
            >
              +
            </button>
          </div>
        </div>

        {/* Restricción alimentaria */}
        <div className="field" style={{ marginTop: "var(--sp-4)" }}>
          <label htmlFor="rsvp-dietary">
            Restricción alimentaria <span style={{ opacity: .5 }}>(opcional)</span>
          </label>
          <input
            id="rsvp-dietary"
            type="text"
            value={dietary}
            onChange={(e) => setDietary(e.target.value)}
            placeholder="Ej: vegetariano, celíaco, alérgico a mariscos…"
          />
        </div>

        <button
          className="btn solid"
          onClick={() => setStep("finish")}
          style={{ width: "100%", marginTop: "var(--sp-5)" }}
          disabled={!guestToken && !name.trim()}
          aria-label="Continuar al último paso"
        >
          Continuar →
        </button>
      </section>
    );
  }

  // ── PASO 3: Pago + Canción ────────────────────────────────────
  if (step === "finish") {
    return (
      <section className={sectionClass} id="rsvp">
        <p className="kicker">Último paso</p>
        <h2 className="section-title">Casi listo</h2>

        {/* Info de pago si corresponde */}
        {hasPayment && paymentAmount && paymentStatus === "PENDING" && (
          <div className="info-card tone-a">
            <div className="dot" aria-hidden="true" />
            <div>
              <strong>
                Tarjeta: {formatARS(paymentAmount)} por persona
                {count > 1 && ` · Total ${formatARS(totalPayment)}`}
              </strong>
              {paymentAlias && (
                <p>
                  Transferencia: <span style={{ fontFamily: "var(--font-mono)", color: "var(--c-accent)" }}>{paymentAlias}</span>
                </p>
              )}
              {paymentBanco && (
                <p style={{ opacity: .7 }}>
                  {paymentBanco}{paymentTitular ? ` · ${paymentTitular}` : ""}
                </p>
              )}
              <p style={{ opacity: .65 }}>
                Una vez que lo recibamos, lo verás confirmado acá 💛
              </p>
            </div>
          </div>
        )}

        {error && (
          <p role="alert" style={{ color: "var(--c-accent)", fontSize: "13px", marginBottom: "var(--sp-3)" }}>
            {error}
          </p>
        )}

        <button
          className="btn solid"
          onClick={handleConfirm}
          disabled={isSubmitting}
          style={{ width: "100%", fontSize: "15px", padding: "16px" }}
          aria-label="Confirmar asistencia definitivamente"
        >
          {isSubmitting ? "Guardando…" : "✓ Confirmar asistencia"}
        </button>
        <button
          className="btn"
          onClick={() => setStep("details")}
          style={{ width: "100%", justifyContent: "center", marginTop: "var(--sp-3)" }}
          aria-label="Volver al paso anterior"
        >
          ← Volver
        </button>
      </section>
    );
  }

  // ── DONE ──────────────────────────────────────────────────────
  if (step === "done") {
    return (
      <section className={sectionClass} id="rsvp" role="status" aria-live="polite">
        <p className="kicker">¡Listo!</p>
        <h2 className="section-title">Te esperamos 🎉</h2>
        <p style={{ margin: "var(--sp-3) 0 var(--sp-5)" }}>
          Confirmaste {count} {count === 1 ? "persona" : "personas"}.
          {hasPayment && paymentStatus === "PENDING" && paymentAmount
            ? ` Recordá abonar la tarjeta (${formatARS(totalPayment)}).`
            : ""}
          {paymentStatus === "PAID" ? " Tu tarjeta fue confirmada. ✓" : ""}
        </p>
        {hasPayment && paymentStatus === "PENDING" && paymentAlias && (
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "13px", opacity: .75 }}>
            Alias: {paymentAlias}
          </p>
        )}
      </section>
    );
  }

  // ── DECLINED ─────────────────────────────────────────────────
  if (step === "declined") {
    return (
      <section className={sectionClass} id="rsvp" role="status">
        <p className="kicker">Respuesta registrada</p>
        <h2 className="section-title">Qué pena 💙</h2>
        <p style={{ marginTop: "var(--sp-3)" }}>
          Gracias por avisarnos. Si cambiás de idea, el link sigue activo.
        </p>
        <button
          className="btn"
          onClick={() => setStep("decision")}
          style={{ marginTop: "var(--sp-5)", justifyContent: "center", width: "100%" }}
        >
          Cambié de idea, ¡voy!
        </button>
      </section>
    );
  }

  return null;

  // ── Handlers ─────────────────────────────────────────────────
  async function handleConfirm() {
    setIsSubmitting(true);
    setError("");
    try {
      const endpoint = guestToken
        ? `/api/guests/${guestToken}/confirm`
        : `/api/rsvp`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitationId,
          nombre: name || guestName,
          asistencia: "CONFIRMA",
          numeroAcompanantes: count - 1,
          restricciones: dietary,
          token: guestToken,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error al confirmar");
      }

      setStep("done");
      onConfirmed?.({ attending: true, count });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error al confirmar. Intentá de nuevo.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDecline() {
    try {
      const endpoint = guestToken
        ? `/api/guests/${guestToken}/confirm`
        : `/api/rsvp`;
      await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitationId,
          nombre: name || guestName,
          asistencia: "NO_ASISTE",
          numeroAcompanantes: 0,
          token: guestToken,
        }),
      });
    } catch {
      // Silenciar — el invitado igual ve la pantalla de "no puedo ir"
    }
    setStep("declined");
  }
}
