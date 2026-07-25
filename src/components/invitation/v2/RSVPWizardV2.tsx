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

  const renderContent = () => {
    if (step === "decision") {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
          <button
            className="t-btn"
            onClick={() => setStep("details")}
            style={{ background: "var(--t-acc2)", borderColor: "var(--t-acc2)", color: "var(--t-onink)", width: "100%", justifyContent: "center", fontSize: "15px", padding: "16px" }}
            aria-label="Confirmar asistencia"
          >
            ✓ Sí, voy a estar
          </button>
          <button
            className="t-btn"
            onClick={() => handleDecline()}
            style={{ width: "100%", justifyContent: "center", background: "transparent" }}
            aria-label="Declinar invitación"
          >
            No puedo ir esta vez
          </button>
        </div>
      );
    }

    if (step === "details") {
      return (
        <div>
          <p className="t-kicker" style={{ margin: "0 0 12px 0" }}>Paso 2 de 3</p>
          {!guestToken && (
            <div className="t-field" style={{ marginBottom: "14px" }}>
              <label htmlFor="rsvp-name">Tu nombre y apellido</label>
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

          <div className="t-field" style={{ marginBottom: "14px" }}>
            <label id="count-label">
              ¿Cuántos asisten? {maxGuests > 1 ? `(máx. ${maxGuests})` : ""}
            </label>
            <div className="stepper" style={{ display: "flex", alignItems: "center", gap: "14px" }} aria-labelledby="count-label">
              <button
                type="button"
                style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1px solid var(--t-onpaper)", background: "transparent", fontSize: "15px", cursor: "pointer", color: "var(--t-onpaper)" }}
                onClick={() => setCount(Math.max(1, count - 1))}
                aria-label="Restar una persona"
                disabled={count <= 1}
              >
                −
              </button>
              <span className="n" style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "15px", minWidth: "18px", textAlign: "center", color: "var(--t-onpaper)" }} aria-live="polite" aria-atomic="true">
                {count}
              </span>
              <button
                type="button"
                style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1px solid var(--t-onpaper)", background: "transparent", fontSize: "15px", cursor: "pointer", color: "var(--t-onpaper)" }}
                onClick={() => setCount(Math.min(maxGuests, count + 1))}
                aria-label="Sumar una persona"
                disabled={count >= maxGuests}
              >
                +
              </button>
            </div>
          </div>

          <div className="t-field" style={{ marginBottom: "14px" }}>
            <label htmlFor="rsvp-dietary">
              Restricción alimentaria <span style={{ opacity: .5 }}>(opcional)</span>
            </label>
            <input
              id="rsvp-dietary"
              type="text"
              value={dietary}
              onChange={(e) => setDietary(e.target.value)}
              placeholder="Ej: vegetariano, celíaco…"
            />
          </div>

          <button
            className="t-btn"
            onClick={() => setStep("finish")}
            style={{ background: "var(--t-acc2)", borderColor: "var(--t-acc2)", color: "var(--t-onink)", width: "100%", justifyContent: "center", marginTop: "14px" }}
            disabled={!guestToken && !name.trim()}
          >
            Continuar →
          </button>
        </div>
      );
    }

    if (step === "finish") {
      return (
        <div>
          <p className="t-kicker" style={{ margin: "0 0 12px 0" }}>Último paso</p>
          {error && (
            <p role="alert" style={{ color: "var(--c-accent)", fontSize: "13px", marginBottom: "var(--sp-3)" }}>
              {error}
            </p>
          )}

          <button
            className="t-btn"
            onClick={handleConfirm}
            disabled={isSubmitting}
            style={{ background: "var(--t-acc2)", borderColor: "var(--t-acc2)", color: "var(--t-onink)", width: "100%", justifyContent: "center", fontSize: "15px", padding: "16px" }}
          >
            {isSubmitting ? "Guardando…" : "✓ Confirmar asistencia"}
          </button>
          <button
            className="t-btn"
            onClick={() => setStep("details")}
            style={{ width: "100%", justifyContent: "center", marginTop: "14px", background: "transparent" }}
          >
            ← Volver
          </button>
        </div>
      );
    }

    if (step === "done") {
      return (
        <div role="status" aria-live="polite">
          <h3 style={{ marginBottom: "12px", fontFamily: "var(--t-font-d)", color: "var(--t-onpaper)" }}>Te esperamos 🎉</h3>
          <p style={{ marginBottom: "12px", fontSize: "14px", opacity: 0.9 }}>
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
        </div>
      );
    }

    if (step === "declined") {
      return (
        <div role="status">
          <h3 style={{ marginBottom: "12px", fontFamily: "var(--t-font-d)", color: "var(--t-onpaper)" }}>Qué pena 💙</h3>
          <p style={{ fontSize: "14px", opacity: 0.9 }}>
            Gracias por avisarnos. Si cambiás de idea, el link sigue activo.
          </p>
          <button
            className="t-btn"
            onClick={() => setStep("decision")}
            style={{ marginTop: "24px", justifyContent: "center", width: "100%", background: "transparent" }}
          >
            Cambié de idea, ¡voy!
          </button>
        </div>
      );
    }
  };

  return (
    <section className={sectionClass} id="rsvp">
      {step !== "done" && step !== "declined" && (
        <>
          <p className="t-kicker">Confirmá tu asistencia</p>
          <h2>¿Vas a venir?</h2>
        </>
      )}

      <div className="d-rsvp-grid" style={{ marginTop: "24px" }}>
        <div>
          {renderContent()}
        </div>

        {hasPayment && paymentAmount != null && (
          <div className="t-detail" style={{ background: "rgba(255,255,255,.07)", border: "1px dashed var(--t-acc)", margin: 0, height: "fit-content", borderRadius: "12px", padding: "16px" }}>
            <h4 style={{ marginBottom: "8px", fontFamily: "var(--t-font-d)", fontSize: "15px", color: "var(--t-acc)", marginTop: 0 }}>
              {!guestToken ? "Valor de la tarjeta (vista previa)" : (paymentStatus === "PAID" ? "Tarjeta abonada ✓" : "Valor de la tarjeta")}
            </h4>
            <p style={{ opacity: 0.85, fontSize: "13.5px", lineHeight: 1.5, margin: 0, color: "inherit" }}>
              {!guestToken ? (
                `El valor de tu tarjeta es de ${formatARS(paymentAmount)} por persona. Así es como tus invitados verán esta información.`
              ) : (
                paymentStatus === "PAID"
                ? "Ya recibimos el pago de tu tarjeta. ¡Gracias!"
                : `El valor es de ${formatARS(paymentAmount)} por persona.`
              )}
            </p>
          </div>
        )}
      </div>
    </section>
  );

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
      // Silenciar
    }
    setStep("declined");
  }
}
