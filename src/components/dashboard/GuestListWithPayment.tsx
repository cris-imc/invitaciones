"use client";

import { useState, useEffect } from "react";

interface Guest {
  id: string;
  name: string;
  type: string;
  status: string;
  attendingCount: number;
  expectedCount: number;
  paymentStatus: string;
  dietaryRestrictions?: string;
  message?: string;
}

interface GuestListWithPaymentProps {
  invitationId: string;
  paymentAmount?: number;
  onPaymentChange?: (guestId: string, newStatus: string) => void;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmó",
  DECLINED: "Declinó",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  EXEMPT: "Exento",
  PAID: "Pagado",
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PENDING: "#B98B3E",
  EXEMPT:  "#8b8b8b",
  PAID:    "#5a8a6e",
};

export function GuestListWithPayment({
  invitationId,
  paymentAmount,
  onPaymentChange,
}: GuestListWithPaymentProps) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "CONFIRMED" | "PENDING" | "DECLINED">("all");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/guests?invitationId=${invitationId}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setGuests(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [invitationId]);

  const handlePaymentChange = async (guestId: string, newStatus: string) => {
    setUpdatingId(guestId);
    // Optimistic update
    setGuests((prev) =>
      prev.map((g) => (g.id === guestId ? { ...g, paymentStatus: newStatus } : g))
    );
    try {
      const res = await fetch(`/api/guests/${guestId}/payment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      onPaymentChange?.(guestId, newStatus);
    } catch {
      // Revert
      setGuests((prev) =>
        prev.map((g) =>
          g.id === guestId
            ? { ...g, paymentStatus: g.paymentStatus }
            : g
        )
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = guests.filter((g) => {
    const matchFilter = filter === "all" || g.status === filter;
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  // Resumen
  const confirmed  = guests.filter((g) => g.status === "CONFIRMED");
  const totalPeople = confirmed.reduce((s, g) => s + g.attendingCount, 0);
  const paidCount  = confirmed.filter((g) => g.paymentStatus === "PAID").length;
  const exemptCount = confirmed.filter((g) => g.paymentStatus === "EXEMPT").length;
  const pendingPayCount = confirmed.filter((g) => g.paymentStatus === "PENDING").length;
  const estimatedTotal = paymentAmount
    ? confirmed
        .filter((g) => g.paymentStatus === "PAID" || g.paymentStatus === "PENDING")
        .reduce((s, g) => s + g.attendingCount * paymentAmount, 0)
    : 0;
  const collectedTotal = paymentAmount
    ? confirmed
        .filter((g) => g.paymentStatus === "PAID")
        .reduce((s, g) => s + g.attendingCount * paymentAmount, 0)
    : 0;

  const formatARS = (n: number) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0 }).format(n);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#888", fontSize: "14px" }}>
        Cargando invitados…
      </div>
    );
  }

  return (
    <div>
      {/* Resumen */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          borderBottom: "1px solid #eee",
          marginBottom: "20px",
        }}
      >
        {[
          { label: "Confirmados", value: confirmed.length },
          { label: "Personas", value: totalPeople },
          { label: "Pagaron", value: paidCount },
          { label: "Pendientes", value: pendingPayCount },
        ].map(({ label, value }) => (
          <div key={label} style={{ padding: "16px 12px", textAlign: "center", borderRight: "1px solid #eee" }}>
            <b style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "22px", color: "#1a1a1a" }}>{value}</b>
            <span style={{ fontSize: "10.5px", textTransform: "uppercase", letterSpacing: ".05em", color: "#888" }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Totales de recaudación */}
      {paymentAmount && (
        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "20px",
            padding: "12px 16px",
            background: "#f9f7f2",
            borderRadius: "12px",
            fontSize: "13px",
          }}
        >
          <span>💰 Recaudado: <b>{formatARS(collectedTotal)}</b></span>
          <span style={{ opacity: .5 }}>·</span>
          <span>⏳ Estimado total: <b>{formatARS(estimatedTotal)}</b></span>
          <span style={{ opacity: .5 }}>·</span>
          <span style={{ color: "#8b8b8b" }}>⊘ Exentos: {exemptCount}</span>
        </div>
      )}

      {/* Filtros + búsqueda */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
        <input
          type="search"
          placeholder="Buscar invitado…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: "180px",
            padding: "8px 14px",
            borderRadius: "999px",
            border: "1px solid #ddd",
            fontSize: "13px",
            fontFamily: "var(--font-body)",
          }}
          aria-label="Buscar invitado por nombre"
        />
        {(["all", "CONFIRMED", "PENDING", "DECLINED"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "8px 14px",
              borderRadius: "999px",
              border: "1px solid #ddd",
              background: filter === f ? "#1a1a1a" : "#fff",
              color: filter === f ? "#fff" : "#555",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              minHeight: "44px",
            }}
          >
            {f === "all" ? "Todos" : STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <p style={{ textAlign: "center", color: "#888", padding: "32px", fontSize: "13px" }}>
          No hay invitados en esta categoría.
        </p>
      ) : (
        <div>
          {filtered.map((guest) => (
            <div
              key={guest.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
                padding: "14px 0",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: "14px", marginBottom: 2 }}>{guest.name}</div>
                <div style={{ fontSize: "11.5px", color: "#888" }}>
                  {STATUS_LABELS[guest.status] ?? guest.status}
                  {guest.status === "CONFIRMED" && ` · ${guest.attendingCount} persona${guest.attendingCount !== 1 ? "s" : ""}`}
                  {guest.dietaryRestrictions && ` · ${guest.dietaryRestrictions}`}
                </div>
              </div>

              {/* Toggle de pago — solo visible si confirmó */}
              {guest.status === "CONFIRMED" && (
                <div
                  className="inv-status-toggle"
                  role="group"
                  aria-label={`Estado de pago de ${guest.name}`}
                >
                  {(["PENDING", "EXEMPT", "PAID"] as const).map((s) => (
                    <button
                      key={s}
                      className={`inv-status-btn ${guest.paymentStatus === s ? `active-${s.toLowerCase()}` : ""}`}
                      onClick={() => handlePaymentChange(guest.id, s)}
                      disabled={updatingId === guest.id}
                      aria-pressed={guest.paymentStatus === s}
                      aria-label={`Marcar ${PAYMENT_STATUS_LABELS[s]}`}
                      style={{
                        ...(guest.paymentStatus === s
                          ? { background: PAYMENT_STATUS_COLORS[s], color: "#fff", border: "none" }
                          : {}),
                        opacity: updatingId === guest.id ? .5 : 1,
                      }}
                    >
                      {PAYMENT_STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <p style={{ fontSize: "11.5px", color: "#999", marginTop: "16px", lineHeight: 1.5 }}>
        Tocá un estado para cambiarlo. El invitado ve el cambio reflejado automáticamente en su invitación.
      </p>
    </div>
  );
}
