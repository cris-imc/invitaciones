"use client";

import { useState } from "react";

interface PaymentBadgeProps {
  paymentStatus: "PENDING" | "PARTIAL" | "EXEMPT" | "PAID";
  amount?: number;          // monto por persona en ARS
  paidAmount?: number;      // plata ya entregada (pagos parciales de familias/grupos)
  precioNino?: number;
  precioAdolescente?: number;
  attendingCount?: number;  // cantidad de personas confirmadas (legacy)
  attendingAdults?: number;
  attendingTeens?: number;
  attendingChildren?: number;
  alias?: string;           // alias de transferencia
  cbu?: string;
  banco?: string;
  titular?: string;
}

export function PaymentBadge({
  paymentStatus,
  amount,
  paidAmount = 0,
  precioNino,
  precioAdolescente,
  attendingCount = 1,
  attendingAdults,
  attendingTeens,
  attendingChildren,
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

  // PENDING y PARTIAL: los dos muestran cómo pagar, pero el parcial descuenta
  // lo ya entregado para que el invitado no vuelva a transferir el total.
  if (!amount) return null;

  const hasSpecificCounts = (attendingAdults !== undefined && attendingAdults > 0) || (attendingTeens !== undefined && attendingTeens > 0) || (attendingChildren !== undefined && attendingChildren > 0);
  const adults = hasSpecificCounts ? (attendingAdults || 0) : attendingCount;
  const teens = hasSpecificCounts ? (attendingTeens || 0) : 0;
  const children = hasSpecificCounts ? (attendingChildren || 0) : 0;
  const teenPrice = precioAdolescente != null ? precioAdolescente : amount;
  const childPrice = precioNino != null ? precioNino : amount;

  const total = (amount * adults) + (teenPrice * teens) + (childPrice * children);

  const money = (n: number) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(n);

  const paid = Math.max(0, paidAmount);
  const balance = Math.max(0, total - paid);
  const isPartial = paid > 0 && balance > 0;
  const formattedTotal = money(total);

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
          {isPartial ? `Saldo pendiente: ${money(balance)}` : `Monto a pagar: ${formattedTotal}`}
        </strong>

        {isPartial && (
          <p style={{ margin: "0 0 8px", fontSize: "13px", lineHeight: 1.5, opacity: 0.85 }}>
            Ya registramos {money(paid)} de {formattedTotal}.
          </p>
        )}

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
