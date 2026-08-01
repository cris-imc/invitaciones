"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type PaymentStatus = "PENDING" | "EXEMPT" | "PAID";

interface RSVPWizardV2Props {
  invitationId: string;
  guestToken?: string;           // si es invitación personalizada
  guestName?: string;            // prefill nombre
  maxGuests?: number;            // límite total de acompañantes
  maxAdults?: number;
  maxTeens?: number;
  maxChildren?: number;
  dark?: boolean;
  // Configuración de pago
  hasPayment?: boolean;
  paymentAmount?: number;
  paymentAlias?: string;
  paymentCbu?: string;
  paymentBanco?: string;
  paymentTitular?: string;
  isExempt?: boolean;
  precioNino?: number;
  precioAdolescente?: number;
  is15?: boolean;
  // Estado previo (si ya confirmó)
  initialStatus?: "PENDING" | "CONFIRMED" | "DECLINED";
  initialAttendingCount?: number;
  initialAttendingAdults?: number;
  initialAttendingTeens?: number;
  initialAttendingChildren?: number;
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
  maxAdults,
  maxTeens,
  maxChildren,
  dark = true,
  hasPayment = false,
  paymentAmount,
  paymentAlias,
  paymentCbu,
  paymentBanco,
  paymentTitular,
  isExempt = false,
  precioNino,
  precioAdolescente,
  is15 = false,
  initialStatus,
  initialAttendingCount = 1,
  initialAttendingAdults,
  initialAttendingTeens,
  initialAttendingChildren,
  initialPaymentStatus = "PENDING",
  onConfirmed,
}: RSVPWizardV2Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(() => {
    if (initialStatus === "CONFIRMED") return "done";
    if (initialStatus === "DECLINED") return "declined";
    return "decision";
  });

  const hasSpecificCounts =
    (initialAttendingAdults !== undefined && initialAttendingAdults > 0) ||
    (initialAttendingTeens !== undefined && initialAttendingTeens > 0) ||
    (initialAttendingChildren !== undefined && initialAttendingChildren > 0);

  const initialAdults = hasSpecificCounts ? (initialAttendingAdults || 0) : (initialAttendingCount > 0 ? initialAttendingCount : 1);
  const initialTeens = hasSpecificCounts ? (initialAttendingTeens || 0) : 0;
  const initialChildren = hasSpecificCounts ? (initialAttendingChildren || 0) : 0;

  const [adultCount, setAdultCount] = useState(initialAdults);
  const [teenCount, setTeenCount] = useState(initialTeens);
  const [childCount, setChildCount] = useState(initialChildren);
  const count = adultCount + teenCount + childCount; // Total calculation

  const [dietary, setDietary] = useState("");
  const [name, setName] = useState(guestName);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [paymentStatus] = useState<PaymentStatus>(initialPaymentStatus);

  const sectionClass = `section${dark ? " dark" : ""}`;

  let totalPayment = 0;
  if (!isExempt) {
    const adultPrice = paymentAmount ?? 0;
    const teenPrice = precioAdolescente != null ? precioAdolescente : adultPrice;
    const childPrice = precioNino != null ? precioNino : adultPrice;
    if (maxGuests > 1) {
      totalPayment = (adultPrice * adultCount) + (teenPrice * teenCount) + (childPrice * childCount);
    } else {
      totalPayment = adultPrice * count;
    }
  }

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
            ✓ Sí, {maxGuests > 1 ? "vamos a estar" : "voy a estar"}
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
          {maxGuests > 1 && (
            <div className="t-field" style={{ marginBottom: "14px" }}>
              <label id="count-label" style={{ marginBottom: "8px", display: "block" }}>
                ¿Cuántos asisten? {maxGuests > 1 ? `(máx. ${maxGuests})` : ""}
              </label>
              <div style={{ marginTop: "16px" }}>
                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                  {/* ADULTOS */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: "inherit", opacity: 0.9 }}>Adultos</span>
                    <div className="stepper" style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <button
                        type="button"
                        style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1px solid currentColor", background: "transparent", fontSize: "18px", cursor: "pointer", color: "inherit", opacity: adultCount <= 1 ? 0.3 : 0.8 }}
                        onClick={() => setAdultCount(Math.max(1, adultCount - 1))}
                        disabled={adultCount <= 1}
                      >−</button>
                      <span className="n" style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "16px", minWidth: "20px", textAlign: "center", color: "inherit" }}>{adultCount}</span>
                      <button
                        type="button"
                        style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1px solid currentColor", background: "transparent", fontSize: "18px", cursor: "pointer", color: "inherit", opacity: (maxAdults !== undefined ? adultCount >= maxAdults : count >= maxGuests) ? 0.3 : 0.8 }}
                        onClick={() => setAdultCount(Math.min(maxAdults !== undefined ? maxAdults : maxGuests - (teenCount + childCount), adultCount + 1))}
                        disabled={maxAdults !== undefined ? adultCount >= maxAdults : count >= maxGuests}
                      >+</button>
                    </div>
                  </div>

                  {/* ADOLESCENTES */}
                  {maxTeens !== 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: "inherit", opacity: 0.9 }}>Adolescentes</span>
                    <div className="stepper" style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <button
                        type="button"
                        style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1px solid currentColor", background: "transparent", fontSize: "18px", cursor: "pointer", color: "inherit", opacity: teenCount <= 0 ? 0.3 : 0.8 }}
                        onClick={() => setTeenCount(Math.max(0, teenCount - 1))}
                        disabled={teenCount <= 0}
                      >−</button>
                      <span className="n" style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "16px", minWidth: "20px", textAlign: "center", color: "inherit" }}>{teenCount}</span>
                      <button
                        type="button"
                        style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1px solid currentColor", background: "transparent", fontSize: "18px", cursor: "pointer", color: "inherit", opacity: (maxTeens !== undefined ? teenCount >= maxTeens : count >= maxGuests) ? 0.3 : 0.8 }}
                        onClick={() => setTeenCount(Math.min(maxTeens !== undefined ? maxTeens : maxGuests - (adultCount + childCount), teenCount + 1))}
                        disabled={maxTeens !== undefined ? teenCount >= maxTeens : count >= maxGuests}
                      >+</button>
                    </div>
                  </div>
                  )}

                  {/* NIÑOS */}
                  {maxChildren !== 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: "inherit", opacity: 0.9 }}>Niños</span>
                    <div className="stepper" style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <button
                        type="button"
                        style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1px solid currentColor", background: "transparent", fontSize: "18px", cursor: "pointer", color: "inherit", opacity: childCount <= 0 ? 0.3 : 0.8 }}
                        onClick={() => setChildCount(Math.max(0, childCount - 1))}
                        disabled={childCount <= 0}
                      >−</button>
                      <span className="n" style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "16px", minWidth: "20px", textAlign: "center", color: "inherit" }}>{childCount}</span>
                      <button
                        type="button"
                        style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1px solid currentColor", background: "transparent", fontSize: "18px", cursor: "pointer", color: "inherit", opacity: (maxChildren !== undefined ? childCount >= maxChildren : count >= maxGuests) ? 0.3 : 0.8 }}
                        onClick={() => setChildCount(Math.min(maxChildren !== undefined ? maxChildren : maxGuests - (adultCount + teenCount), childCount + 1))}
                        disabled={maxChildren !== undefined ? childCount >= maxChildren : count >= maxGuests}
                      >+</button>
                    </div>
                  </div>
                  )}
                </div>
              </div>
            </div>
          )}

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
          <h3 style={{ marginBottom: "12px", fontFamily: "var(--t-font-d)", color: "inherit" }}>{is15 ? "Te espero 🎉" : "Te esperamos 🎉"}</h3>
          <p style={{ marginBottom: "12px", fontSize: "14px", opacity: 0.9 }}>
            {maxGuests > 1 && (adultCount > 0 || teenCount > 0 || childCount > 0) ? (
              `Confirmaste ${adultCount} ${adultCount === 1 ? "adulto" : "adultos"}` +
              (teenCount > 0 ? `, ${teenCount} ${teenCount === 1 ? "adolescente" : "adolescentes"}` : "") +
              (childCount > 0 ? ` y ${childCount} ${childCount === 1 ? "niño" : "niños"}.` : ".")
            ) : (
              `Confirmaste ${count} ${count === 1 ? "persona" : "personas"}.`
            )}
          </p>
          {paymentStatus !== "PAID" && (
            <button
              className="t-btn"
              onClick={() => setStep("decision")}
              style={{ marginTop: "24px", justifyContent: "center", width: "100%", background: "transparent", border: "1px solid currentColor" }}
            >
              Modificar asistencia
            </button>
          )}
        </div>
      );
    }

    if (step === "declined") {
      return (
        <div role="status">
          <h3 style={{ marginBottom: "12px", fontFamily: "var(--t-font-d)", color: "inherit" }}>Qué pena 💙</h3>
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
          <h2>{maxGuests > 1 ? "¿Van a venir?" : "¿Vas a venir?"}</h2>
        </>
      )}

      <div className="d-rsvp-grid" style={{ marginTop: "24px" }}>
        <div>
          {renderContent()}
        </div>

        {hasPayment && paymentAmount != null && !isExempt && (
          <div className="t-detail" style={{ background: "rgba(255,255,255,.07)", border: "1px dashed var(--t-acc)", margin: 0, height: "fit-content", borderRadius: "12px", padding: "16px" }}>
            <h4 style={{ marginBottom: "8px", fontFamily: "var(--t-font-d)", fontSize: "15px", color: "var(--t-acc)", marginTop: 0 }}>
              {!guestToken ? "Valor de la tarjeta (vista previa)" : (paymentStatus === "PAID" ? "Tarjeta abonada ✓" : "Valor de la tarjeta")}
            </h4>
            <p style={{ opacity: 0.85, fontSize: "13.5px", lineHeight: 1.5, margin: 0, color: "inherit" }}>
              Monto total a pagar: <b>{formatARS(totalPayment)}</b>
              <br />
              <span style={{ fontSize: "12px", opacity: 0.8 }}>
                ({adultCount} adultos{precioAdolescente != null && teenCount > 0 ? `, ${teenCount} adolescentes` : ""}{precioNino != null && childCount > 0 ? `, ${childCount} niños` : ""})
              </span>
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
          attendingAdults: adultCount,
          attendingTeens: teenCount,
          attendingChildren: childCount,
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
      router.refresh();
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
