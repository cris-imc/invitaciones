"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PartyPopper, Heart, UserCheck } from "lucide-react";
import { DrawLucideIcon } from "@/components/ui/icons/DrawLucideIcon";
import { useTextos } from "@/components/i18n/ProveedorIdioma";
import { useFormatoDeMoneda, useFormatoDeNumero } from "@/components/i18n/ProveedorIdioma";

type PaymentStatus = "PENDING" | "PARTIAL" | "EXEMPT" | "PAID";

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
  /**
   * Lo que el invitado realmente va a pagar, resuelto en el servidor. Trae los
   * precios propios que el anfitrión le puso a cada lugar desde el panel, que
   * acá no se conocen: de este lado sólo están los precios generales por franja.
   * Llega null mientras no haya cupos confirmados.
   */
  paymentView?: { total: number; paid: number; pending: number; lines: string[] } | null;
  // Callbacks
  onConfirmed?: (data: { attending: boolean; count: number }) => void;
}

type Step = "decision" | "details" | "done" | "declined";

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
  paymentView = null,
  onConfirmed,
}: RSVPWizardV2Props) {
  const tx = useTextos();
  const router = useRouter();
  const [step, setStep] = useState<Step>(() => {
    if (initialStatus === "CONFIRMED") return "done";
    if (initialStatus === "DECLINED") return "declined";
    return "decision";
  });

  const hasSpecificAttending =
    (initialStatus === "CONFIRMED") && (
      (initialAttendingAdults !== undefined && initialAttendingAdults > 0) ||
      (initialAttendingTeens !== undefined && initialAttendingTeens > 0) ||
      (initialAttendingChildren !== undefined && initialAttendingChildren > 0)
    );

  // Si ya RSVP'd (hasSpecificAttending), usamos lo que confirmó. Si no, usamos lo esperado (max...).
  const initialAdults = hasSpecificAttending
    ? (initialAttendingAdults || 0)
    : (maxAdults !== undefined ? maxAdults : (initialAttendingCount > 0 ? initialAttendingCount : 1));

  const initialTeens = hasSpecificAttending
    ? (initialAttendingTeens || 0)
    : (maxTeens || 0);

  const initialChildren = hasSpecificAttending
    ? (initialAttendingChildren || 0)
    : (maxChildren || 0);

  const [adultCount, setAdultCount] = useState(initialAdults);
  const [teenCount, setTeenCount] = useState(initialTeens);
  const [childCount, setChildCount] = useState(initialChildren);
  const count = adultCount + teenCount + childCount; // Total calculation

  const [dietary, setDietary] = useState("");
  const [name, setName] = useState(guestName);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  // Sin useState: congelarlo al montar deja el estado viejo pegado despues de
  // que el invitado modifica la asistencia, porque router.refresh() actualiza la
  // prop pero no el estado local.
  const paymentStatus: PaymentStatus = initialPaymentStatus;

  const sectionClass = `section${dark ? " dark" : ""}`;

  const adultPrice = paymentAmount ?? 0;
  const teenPrice = precioAdolescente != null ? precioAdolescente : adultPrice;
  const childPrice = precioNino != null ? precioNino : adultPrice;

  // Mientras el invitado todavía elige cuántos van, el total se estima acá con
  // los precios generales. Ya confirmado manda lo que resolvió el servidor: es
  // lo único que sabe de los precios propios por lugar. Se compara contra los
  // cupos guardados porque si el invitado está cambiando la cantidad, el número
  // del servidor corresponde a la composición anterior.
  const useServerTotal =
    !isExempt &&
    !!paymentView &&
    initialStatus === "CONFIRMED" &&
    adultCount === (initialAttendingAdults ?? 0) &&
    teenCount === (initialAttendingTeens ?? 0) &&
    childCount === (initialAttendingChildren ?? 0);

  let totalPayment = 0;
  if (useServerTotal) {
    totalPayment = paymentView!.total;
  } else if (!isExempt) {
    totalPayment = (adultPrice * adultCount) + (teenPrice * teenCount) + (childPrice * childCount);
  }

  const formatARS = useFormatoDeMoneda();

  /**
   * El detalle de lo confirmado: "2 adultos, 1 adolescente y 3 niños".
   *
   * Se arma con partes traducidas y se une con la conjunción del idioma en
   * vez de pegar trozos de frase: "A, B y C" es "A, B and C" en inglés y
   * "A, B e C" en portugués, y el singular de cada franja tampoco se resuelve
   * agregando una "s".
   */
  const detalleConfirmado = (() => {
    const partes: string[] = [];
    if (maxGuests > 1 && (adultCount > 0 || teenCount > 0 || childCount > 0)) {
      if (adultCount > 0) partes.push(`${adultCount} ${tx(adultCount === 1 ? "invitacion.rsvp.adultoUno" : "invitacion.rsvp.adultoVarios")}`);
      if (teenCount > 0) partes.push(`${teenCount} ${tx(teenCount === 1 ? "invitacion.rsvp.adolescenteUno" : "invitacion.rsvp.adolescenteVarios")}`);
      if (childCount > 0) partes.push(`${childCount} ${tx(childCount === 1 ? "invitacion.rsvp.ninoUno" : "invitacion.rsvp.ninoVarios")}`);
    } else {
      partes.push(`${count} ${tx(count === 1 ? "invitacion.rsvp.personaUna" : "invitacion.rsvp.personaVarias")}`);
    }
    if (partes.length <= 1) return partes.join("");
    return `${partes.slice(0, -1).join(", ")} ${tx("invitacion.rsvp.y")} ${partes[partes.length - 1]}`;
  })();

  const renderContent = () => {
    if (step === "decision") {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
          <button
            className="t-btn"
            onClick={() => setStep("details")}
            style={{ background: "var(--t-acc2)", borderColor: "var(--t-acc2)", color: "var(--t-onink)", width: "100%", justifyContent: "center", fontSize: "15px", padding: "16px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}
            data-rsvp="confirmar"
            aria-label={tx("invitacion.rsvp.confirmarAsistencia")}
          >
            {tx("invitacion.rsvp.confirmar")}
          </button>
          <button
            className="t-btn"
            onClick={() => handleDecline()}
            style={{ width: "100%", justifyContent: "center", background: "transparent", fontWeight: 600, color: dark ? "var(--chic-ink, #FFFFFF)" : "inherit", borderColor: "currentColor" }}
            data-rsvp="declinar"
            aria-label={tx("invitacion.rsvp.declinarInvitacion")}
          >
            {tx("invitacion.rsvp.rechazar")}
          </button>
        </div>
      );
    }

    if (step === "details") {
      const textColor = dark ? "var(--chic-ink, #FFFFFF)" : "inherit";
      return (
        <div style={{ color: textColor }}>
          {!guestToken && (
            <div className="t-field" style={{ marginBottom: "14px" }}>
              <label htmlFor="rsvp-name" style={{ color: textColor }}>{tx("invitacion.rsvp.tuNombreYApellido")}</label>
              <input
                id="rsvp-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={tx("invitacion.rsvp.nombreYApellido")}
                required
                autoComplete="name"
              />
            </div>
          )}
          {maxGuests > 1 && (
            <div className="t-field" style={{ marginBottom: "14px" }}>
              <label id="count-label" style={{ marginBottom: "8px", display: "block", color: textColor, opacity: 1 }}>
                {tx("invitacion.rsvp.cuantosAsisten")} {maxGuests > 1 ? tx("invitacion.rsvp.maximo", { n: maxGuests }) : ""}
              </label>
              <div style={{ marginTop: "16px" }}>
                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                  {/* ADULTOS */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: "inherit", opacity: 0.9 }}>{tx("invitacion.rsvp.adultos")}</span>
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
                    <span style={{ fontSize: "14px", fontWeight: "600", color: "inherit", opacity: 0.9 }}>{tx("invitacion.rsvp.adolescentes")}</span>
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
                    <span style={{ fontSize: "14px", fontWeight: "600", color: "inherit", opacity: 0.9 }}>{tx("invitacion.rsvp.ninos")}</span>
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
            <label htmlFor="rsvp-dietary" style={{ color: textColor }}>
              {tx("invitacion.rsvp.restriccionAlimentaria")} <span style={{ opacity: .7 }}>{tx("invitacion.rsvp.opcional")}</span>
            </label>
            <input
              id="rsvp-dietary"
              type="text"
              value={dietary}
              onChange={(e) => setDietary(e.target.value)}
              placeholder={tx("invitacion.rsvp.ejemploDieta")}
            />
          </div>

          {error && (
            <p role="alert" style={{ color: "var(--c-accent)", fontSize: "13px", marginBottom: "12px" }}>
              {error}
            </p>
          )}

          <button
            className="t-btn"
            onClick={handleConfirm}
            disabled={isSubmitting || (!guestToken && !name.trim())}
            style={{ background: "var(--t-acc2)", borderColor: "var(--t-acc2)", color: "var(--t-onink)", width: "100%", justifyContent: "center", fontSize: "15px", padding: "16px", marginTop: "14px" }}
          >
            {isSubmitting ? tx("invitacion.rsvp.guardando") : "✓ " + tx("invitacion.rsvp.confirmarAsistencia")}
          </button>
        </div>
      );
    }

    if (step === "done") {
      return (
        <div role="status" aria-live="polite">

          <p style={{ 
            marginBottom: "12px", 
            fontSize: "26px", 
            lineHeight: "1.2",
            fontFamily: "var(--font-cormorant), serif",
            textAlign: "center",
            color: dark ? "var(--chic-ink, #FFFFFF)" : "inherit"
          }}>
            {tx("invitacion.rsvp.confirmaste", { detalle: detalleConfirmado })}
          </p>
          {/* Haber pagado no cierra la puerta: si al invitado le quedan cupos y
              quiere sumar a alguien, tiene que poder. El lugar nuevo entra al
              precio vigente y la tarjeta vuelve a quedar parcial hasta que el
              anfitrión marque ese cupo. La Colección Storytelling nunca lo
              bloqueó, así que además se comportaban distinto entre sí. */}
          <button
            className="t-btn"
            onClick={() => setStep("decision")}
            style={{ marginTop: "24px", justifyContent: "center", width: "100%", background: "transparent", border: "1px solid currentColor", color: dark ? "var(--chic-ink, #FFFFFF)" : "inherit" }}
          >
            {tx("invitacion.rsvp.modificarAsistencia")}
          </button>
          {paymentStatus === "PAID" && hasPayment && count < maxGuests && (
            <p style={{ marginTop: "10px", fontSize: "12.5px", lineHeight: 1.5, opacity: 0.75, textAlign: "center", color: dark ? "var(--chic-ink, #FFFFFF)" : "inherit" }}>
              {tx("invitacion.pago.sumasPersonas")}
            </p>
          )}
        </div>
      );
    }

    if (step === "declined") {
      return (
        <div role="status">
          <h3 style={{ marginBottom: "16px", fontFamily: "var(--font-cormorant), serif", fontSize: "2rem", color: dark ? "var(--chic-ink, #FFFFFF)" : "inherit", fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            {tx("invitacion.rsvp.quePena")} <Heart className="w-6 h-6" strokeWidth={1.5} />
          </h3>
          <p style={{ fontSize: "16px", opacity: 0.9, lineHeight: 1.5, color: dark ? "var(--chic-ink, #FFFFFF)" : "inherit" }}>
            {tx("invitacion.rsvp.graciasPorAvisarLink")}
          </p>
          <button
            className="t-btn"
            onClick={() => setStep("decision")}
            style={{ marginTop: "24px", justifyContent: "center", width: "100%", background: "transparent", color: dark ? "var(--chic-ink, #FFFFFF)" : "inherit", border: "1px solid currentColor" }}
          >
            {tx("invitacion.rsvp.cambieDeIdeaVoy")}
          </button>
        </div>
      );
    }
  };

  return (
    <section className={sectionClass} id="rsvp">
      {step !== "done" && step !== "declined" && (
        <>
          <div className="t-kicker flex justify-center mb-4">
            <DrawLucideIcon icon={UserCheck} size={46} color="var(--t-acc)" strokeWidth={1.5} />
          </div>
          <p className="t-kicker">{tx("invitacion.rsvp.kicker")}</p>
          <h2>{maxGuests > 1 ? tx("invitacion.rsvp.vanAVenir") : tx("invitacion.rsvp.vasAVenir")}</h2>
        </>
      )}

      <div className="d-rsvp-grid" style={{ marginTop: "24px" }}>
        <div>
          {renderContent()}
        </div>

        {hasPayment && paymentAmount != null && !isExempt && (
          <div className="t-detail" style={{ background: "rgba(255,255,255,.07)", border: "1px dashed var(--t-acc)", margin: 0, height: "fit-content", borderRadius: "12px", padding: "16px" }}>
            <h4 style={{ marginBottom: "8px", fontFamily: "var(--t-font-d)", fontSize: "15px", color: "var(--t-acc)", marginTop: 0 }}>
              {!guestToken
                ? tx("invitacion.pago.valorTarjetaPreview")
                : paymentStatus === "PAID"
                  ? tx("invitacion.pago.tarjetaAbonada") + " ✓"
                  : tx("invitacion.pago.valorTarjeta")}
            </h4>
            <p style={{ display: "block", opacity: 0.85, fontSize: "13.5px", lineHeight: 1.5, margin: 0, color: "inherit" }}>
              {paymentStatus === "PAID" ? tx("invitacion.pago.montoPagado") : tx("invitacion.pago.montoTotal")} <span style={{ fontWeight: 600, color: "inherit" }}>{formatARS(totalPayment)}</span>
              <br />
              <span style={{ fontSize: "12px", opacity: 0.8 }}>
                ({adultCount} {tx("invitacion.rsvp.adultoVarios")}{precioAdolescente != null && teenCount > 0 ? `, ${teenCount} ${tx("invitacion.rsvp.adolescenteVarios")}` : ""}{precioNino != null && childCount > 0 ? `, ${childCount} ${tx("invitacion.rsvp.ninoVarios")}` : ""})
              </span>
            </p>
            {/* Con un pago parcial el invitado solo se entera de que hay algo
                registrado. Nada de montos ni saldos: los numeros los maneja el
                anfitrion, que es quien sabe quien de la familia puso que. */}
            {paymentStatus === "PARTIAL" && (
              <p style={{ display: "block", margin: "8px 0 0", fontSize: "13px", lineHeight: 1.5, opacity: 0.9, color: "inherit" }}>
                {tx("invitacion.pago.yaTenesPagoParcial")}
              </p>
            )}
            {maxGuests > 1 && (
              <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px dashed currentColor", opacity: 0.85, display: "flex", flexDirection: "column", gap: "2px" }}>
                {/* El desglose del servidor viene escrito lugar por lugar cuando
                    dentro de una franja no todos pagan lo mismo: es la unica
                    forma de que la cuenta cierre con el total de arriba. */}
                {useServerTotal ? (
                  paymentView!.lines.map((linea, i) => (
                    <span key={i} style={{ fontSize: "12px" }}>
                      {linea}
                    </span>
                  ))
                ) : (
                  <>
                    {adultCount > 0 && (
                      <span style={{ fontSize: "12px" }}>
                        {adultCount} {tx(adultCount === 1 ? "invitacion.rsvp.adultoUno" : "invitacion.rsvp.adultoVarios")} × {formatARS(adultPrice)}
                      </span>
                    )}
                    {teenCount > 0 && (
                      <span style={{ fontSize: "12px" }}>
                        {teenCount} {tx(teenCount === 1 ? "invitacion.rsvp.adolescenteUno" : "invitacion.rsvp.adolescenteVarios")} × {formatARS(teenPrice)}
                      </span>
                    )}
                    {childCount > 0 && (
                      <span style={{ fontSize: "12px" }}>
                        {childCount} {tx(childCount === 1 ? "invitacion.rsvp.ninoUno" : "invitacion.rsvp.ninoVarios")} × {formatARS(childPrice)}
                      </span>
                    )}
                  </>
                )}
              </div>
            )}
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
        throw new Error(data.error || tx("invitacion.rsvp.errorConfirmar"));
      }

      setStep("done");
      onConfirmed?.({ attending: true, count });
      router.refresh();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : tx("invitacion.rsvp.errorConfirmarReintenta");
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
