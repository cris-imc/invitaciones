"use client";

import { useState, useEffect } from "react";
import { Info, ChevronUp, ChevronDown } from "lucide-react";

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
  pagoTarjetaHabilitado?: boolean;
  onPaymentChange?: (guestId: string, newStatus: string) => void;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmó",
  DECLINED: "No asistirá",
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
  pagoTarjetaHabilitado = false,
  onPaymentChange,
}: GuestListWithPaymentProps) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "CONFIRMED" | "PENDING" | "DECLINED">("all");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);

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
      <div className={`grid grid-cols-2 ${pagoTarjetaHabilitado ? 'md:grid-cols-4' : ''} gap-4 mb-5 pb-5 border-b`} style={{ borderColor: "var(--line)" }}>
        {[
          { label: "Enviadas / Aceptadas", value: `${guests.length} / ${confirmed.length}` },
          { label: "Personas", value: totalPeople },
          ...(pagoTarjetaHabilitado ? [
            { label: "Pagaron", value: paidCount },
            { label: "Pendientes de Pago", value: pendingPayCount }
          ] : []),
        ].map(({ label, value }, index) => (
          <div key={label} className="text-center p-4 rounded-xl" style={{ backgroundColor: "rgba(0,0,0,0.03)", border: "1px solid var(--line)" }}>
            <b style={{ display: "block", fontFamily: "var(--font-display)", fontSize: "28px", color: "var(--accent)" }}>{value}</b>
            <span style={{ fontSize: "10.5px", textTransform: "uppercase", letterSpacing: ".05em", opacity: 0.7 }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Totales de recaudación */}
      {pagoTarjetaHabilitado && (
        <>
          {paymentAmount && (
            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
                marginBottom: "12px",
                padding: "12px 16px",
                background: "var(--ink)",
                border: "1px solid var(--ink-2)",
                color: "var(--on-ink)",
                borderRadius: "12px",
                fontSize: "13px",
              }}
            >
              <span>💰 Recaudado: <b style={{ color: "var(--accent)" }}>{formatARS(collectedTotal)}</b></span>
              <span style={{ opacity: .5 }}>·</span>
              <span>⏳ Estimado total: <b>{formatARS(estimatedTotal)}</b></span>
              <span style={{ opacity: .5 }}>·</span>
              <span style={{ opacity: .6 }}>⊘ Exentos: {exemptCount}</span>
            </div>
          )}

          {/* Burbuja informativa colapsable */}
          <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200/90 text-xs overflow-hidden transition-all duration-200 mb-5">
            <button
                type="button"
                onClick={() => setShowPaymentInfo(!showPaymentInfo)}
                className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-amber-500/15 transition-colors cursor-pointer"
            >
                <div className="flex items-center gap-2 font-medium">
                    <Info className="w-4.5 h-4.5 shrink-0 text-amber-400" />
                    <span>Gestión de pagos</span>
                </div>
                <div className="text-amber-400 opacity-80 hover:opacity-100 transition-opacity shrink-0">
                    {showPaymentInfo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
            </button>

            {showPaymentInfo && (
                <div className="px-4 pb-4 pt-1 border-t border-amber-500/20 text-[13px] leading-relaxed opacity-95 animate-in fade-in duration-200 space-y-2">
                    <p>
                        Tocá un estado de pago (Pendiente / Exento / Pagado) en la lista para cambiarlo de manera rápida.
                    </p>
                    <p className="font-medium text-amber-300">
                        💡 El invitado verá el cambio reflejado automáticamente cuando abra su invitación.
                    </p>
                </div>
            )}
          </div>
        </>
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
              className="inv-guest-row"
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
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: 4 }}>
                  <div style={{ fontWeight: 600, fontSize: "14px" }}>{guest.name}</div>
                  {guest.status === "DECLINED" && (
                    <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", background: "rgba(239, 68, 68, 0.1)", color: "rgb(239, 68, 68)", padding: "2px 8px", borderRadius: "99px", fontWeight: 700 }}>
                      {guest.expectedCount > 1 ? "No asistirán" : "No asistirá"}
                    </span>
                  )}
                  {guest.status === "CONFIRMED" && (
                    <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", background: "rgba(16, 185, 129, 0.1)", color: "rgb(16, 185, 129)", padding: "2px 8px", borderRadius: "99px", fontWeight: 700 }}>
                      {guest.attendingCount > 1 ? "Asistirán" : "Asistirá"}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "11.5px", color: "#888", marginTop: "4px" }}>
                  {guest.status === "PENDING" && (STATUS_LABELS[guest.status] ?? guest.status)}
                  {guest.status === "CONFIRMED" && `${guest.attendingCount} persona${guest.attendingCount !== 1 ? "s" : ""}`}
                  {guest.dietaryRestrictions && (guest.status === "CONFIRMED" ? ` · ${guest.dietaryRestrictions}` : guest.dietaryRestrictions)}
                </div>
              </div>

              {/* Toggle de pago — solo visible si confirmó y si está habilitado */}
              {guest.status === "CONFIRMED" && pagoTarjetaHabilitado && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                  <span style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#888", fontWeight: 600, paddingRight: "4px" }}>Estado de pago</span>
                  <div
                    className="inv-status-toggle"
                    role="group"
                    aria-label={`Estado de pago de ${guest.name}`}
                  >
                    {(["PENDING", "EXEMPT", "PAID"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => handlePaymentChange(guest.id, s)}
                        disabled={updatingId === guest.id}
                        style={{
                          padding: "6px 12px",
                          fontSize: "11px",
                          fontWeight: 700,
                          border: "none",
                          background: guest.paymentStatus === s ? PAYMENT_STATUS_COLORS[s] : "transparent",
                          color: guest.paymentStatus === s ? "#fff" : "#888",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          opacity: updatingId === guest.id ? 0.5 : 1,
                        }}
                        aria-pressed={guest.paymentStatus === s}
                      >
                        {PAYMENT_STATUS_LABELS[s]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
