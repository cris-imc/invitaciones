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

  const sectionClass = `inv-section${dark ? " dark" : ""}`;

  const totalPayment = (paymentAmount ?? 0) * count;
  const formatARS = (n: number) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0 }).format(n);

  // ── PASO 1: Decisión ──────────────────────────────────────────
  if (step === "decision") {
    return (
      <section className={sectionClass} id="rsvp">
        <p className="inv-eyebrow">Confirmá tu asistencia</p>
        <h2 className="inv-h2">¿Vas a venir?</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)", marginTop: "var(--sp-6)" }}>
          <button
            className="inv-btn"
            onClick={() => setStep("details")}
            style={{ width: "100%", fontSize: "15px", padding: "16px" }}
            aria-label="Confirmar asistencia"
          >
            ✓ Sí, voy a estar
          </button>
          <button
            className="inv-btn-ghost"
            onClick={() => handleDecline()}
            style={{ width: "100%", justifyContent: "center" }}
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
        <p className="inv-eyebrow">Paso 2 de 3</p>
        <h2 className="inv-h2">¿Cuántos van?</h2>

        {/* Nombre solo si no es invitación personalizada */}
        {!guestToken && (
          <div className="inv-field" style={{ marginTop: "var(--sp-5)" }}>
            <label className="inv-label" htmlFor="rsvp-name">Tu nombre</label>
            <input
              id="rsvp-name"
              className="inv-input"
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
        <div className="inv-field" style={{ marginTop: "var(--sp-5)" }}>
          <p className="inv-label" id="count-label">
            Personas que asisten {maxGuests > 1 ? `(máx. ${maxGuests})` : ""}
          </p>
          <div className="inv-stepper" aria-labelledby="count-label">
            <button
              type="button"
              onClick={() => setCount(Math.max(1, count - 1))}
              aria-label="Restar una persona"
              disabled={count <= 1}
            >
              −
            </button>
            <span className="inv-stepper-n" aria-live="polite" aria-atomic="true">
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
        <div className="inv-field" style={{ marginTop: "var(--sp-4)" }}>
          <label className="inv-label" htmlFor="rsvp-dietary">
            Restricción alimentaria <span style={{ opacity: .5 }}>(opcional)</span>
          </label>
          <input
            id="rsvp-dietary"
            className="inv-input"
            type="text"
            value={dietary}
            onChange={(e) => setDietary(e.target.value)}
            placeholder="Ej: vegetariano, celíaco, alérgico a mariscos…"
          />
        </div>

        <button
          className="inv-btn"
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
        <p className="inv-eyebrow">Último paso</p>
        <h2 className="inv-h2">Casi listo</h2>

        {/* Info de pago si corresponde */}
        {hasPayment && paymentAmount && paymentStatus === "PENDING" && (
          <div className="inv-pay pending" style={{ marginBottom: "var(--sp-5)", marginTop: "var(--sp-4)" }}>
            <div className="inv-pay-dot" aria-hidden="true" />
            <div>
              <strong style={{ display: "block", fontSize: "13.5px", marginBottom: 4 }}>
                Tarjeta: {formatARS(paymentAmount)} por persona
                {count > 1 && ` · Total ${formatARS(totalPayment)}`}
              </strong>
              {paymentAlias && (
                <p style={{ margin: "0 0 4px", fontSize: "13px", lineHeight: 1.5 }}>
                  Transferencia: <span style={{ fontFamily: "var(--font-mono)", color: "var(--c-accent)" }}>{paymentAlias}</span>
                </p>
              )}
              {paymentBanco && (
                <p style={{ margin: 0, fontSize: "12px", opacity: .7 }}>
                  {paymentBanco}{paymentTitular ? ` · ${paymentTitular}` : ""}
                </p>
              )}
              <p style={{ margin: "6px 0 0", fontSize: "12px", opacity: .65 }}>
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
          className="inv-btn"
          onClick={handleConfirm}
          disabled={isSubmitting}
          style={{ width: "100%", fontSize: "15px", padding: "16px" }}
          aria-label="Confirmar asistencia definitivamente"
        >
          {isSubmitting ? "Guardando…" : "✓ Confirmar asistencia"}
        </button>
        <button
          className="inv-btn-ghost"
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
        <p className="inv-eyebrow">¡Listo!</p>
        <h2 className="inv-h2">Te esperamos 🎉</h2>
        <p className="inv-body" style={{ margin: "var(--sp-3) 0 var(--sp-5)" }}>
          Confirmaste {count} {count === 1 ? "persona" : "personas"}.
          {hasPayment && paymentStatus === "PENDING" && paymentAmount
            ? ` Recordá abonar la tarjeta (${formatARS(totalPayment)}).`
            : ""}
          {paymentStatus === "PAID" ? " Tu tarjeta fue confirmada. ✓" : ""}
        </p>
        {hasPayment && paymentStatus === "PENDING" && paymentAlias && (
          <p className="inv-mono" style={{ fontSize: "13px", opacity: .75 }}>
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
        <p className="inv-eyebrow">Respuesta registrada</p>
        <h2 className="inv-h2">Qué pena 💙</h2>
        <p className="inv-body" style={{ marginTop: "var(--sp-3)" }}>
          Gracias por avisarnos. Si cambiás de idea, el link sigue activo.
        </p>
        <button
          className="inv-btn-ghost"
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
