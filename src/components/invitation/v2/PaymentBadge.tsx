"use client";

import { useState } from "react";

interface PaymentBadgeProps {
  paymentStatus: "PENDING" | "EXEMPT" | "PAID";
  amount?: number;          // monto por persona en ARS
  attendingCount?: number;  // cantidad de personas confirmadas
  alias?: string;           // alias de transferencia
  cbu?: string;
  banco?: string;
  titular?: string;
}

export function PaymentBadge({
  paymentStatus,
  amount,
  attendingCount = 1,
  alias,
  cbu,
  banco,
  titular,
}: PaymentBadgeProps) {
  const [copied, setCopied] = useState(false);

  if (paymentStatus === "PAID") {
    return (
      <div className="inv-pay paid" role="status" aria-label="Estado de pago: pagado">
        <div className="inv-pay-dot" aria-hidden="true" />
        <div>
          <strong style={{ display: "block", fontSize: "13.5px", marginBottom: 2 }}>
            ✓ Tarjeta confirmada
          </strong>
          <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.5 }}>
            ¡Tu pago fue registrado! Gracias, nos vemos el gran día 💛
          </p>
        </div>
      </div>
    );
  }

  if (paymentStatus === "EXEMPT") {
    return (
      <div className="inv-pay exempt" role="status" aria-label="Estado de pago: sin cargo">
        <div className="inv-pay-dot" aria-hidden="true" />
        <div>
          <strong style={{ display: "block", fontSize: "13.5px", marginBottom: 2 }}>
            ✓ Sin cargo
          </strong>
          <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.5 }}>
            Tu lugar está cubierto. ¡Te esperamos!
          </p>
        </div>
      </div>
    );
  }

  // PENDING
  if (!amount) return null;

  const total = amount * attendingCount;
  const formattedAmount = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(amount);
  const formattedTotal = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(total);

  const handleCopyAlias = async () => {
    if (!alias) return;
    await navigator.clipboard.writeText(alias).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="inv-pay pending" role="region" aria-label="Información de pago de tarjeta">
      <div className="inv-pay-dot" aria-hidden="true" />
      <div style={{ flex: 1 }}>
        <strong style={{ display: "block", fontSize: "13.5px", marginBottom: 4 }}>
          Tarjeta: {formattedAmount} por persona
          {attendingCount > 1 && ` · Total ${formattedTotal}`}
        </strong>

        {alias && (
          <p style={{ margin: "0 0 8px", fontSize: "13px", lineHeight: 1.5 }}>
            Transferencia:&nbsp;
            <button
              onClick={handleCopyAlias}
              style={{
                fontFamily: "var(--font-mono)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--c-accent)",
                fontSize: "13px",
                padding: 0,
                textDecoration: "underline dotted",
              }}
              aria-label={`Copiar alias ${alias}`}
            >
              {alias}
            </button>
            {copied && (
              <span style={{ marginLeft: 6, fontSize: 11, color: "var(--c-muted)" }}>
                ✓ Copiado
              </span>
            )}
          </p>
        )}

        {banco && (
          <p style={{ margin: "0 0 2px", fontSize: "12px", opacity: 0.7 }}>
            Banco: {banco}{titular ? ` · ${titular}` : ""}
          </p>
        )}
        {cbu && (
          <p style={{ margin: 0, fontSize: "11.5px", opacity: 0.6, fontFamily: "var(--font-mono)" }}>
            CBU: {cbu}
          </p>
        )}

        <p style={{ margin: "8px 0 0", fontSize: "12px", opacity: 0.7 }}>
          Una vez que lo recibamos, vas a ver acá la confirmación 💛
        </p>
      </div>
    </div>
  );
}
