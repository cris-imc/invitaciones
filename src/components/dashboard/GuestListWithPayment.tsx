"use client";

import { useState, useEffect } from "react";
import { Info, ChevronUp, ChevronDown, Download, Minus, Plus, Wallet, Hourglass, Ban, Undo2, CircleDashed } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  BRACKETS,
  BRACKET_LABELS,
  CARD_PAYMENT_COLORS,
  CARD_PAYMENT_LABELS,
  formatARS,
  type Bracket,
  type CardPaymentStatus,
} from "@/lib/card-payments";

interface Guest {
  id: string;
  name: string;
  type: string;
  status: string;
  attendingCount: number;
  expectedCount: number;
  paymentStatus: string;
  // Resuelto por el servidor (GET /api/guests) con src/lib/card-payments.ts. El
  // panel no vuelve a calcular precios: así lo que ve el anfitrión y lo que se
  // guarda no pueden discrepar.
  seats: Record<Bracket, number>;
  paidSeats: Record<Bracket, number>;
  paidAmount: number;
  pendingAmount: number;
  totalAmount: number;
  surplus: number;
  isExempt?: boolean;
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

// Los labels y colores viven en src/lib/card-payments.ts, con el cálculo.
const PAYMENT_STATUS_LABELS = CARD_PAYMENT_LABELS;
const PAYMENT_STATUS_COLORS = CARD_PAYMENT_COLORS;

const PAYMENT_FILTER_LABELS: Record<string, string> = {
  PAID: "Pago",
  PARTIAL: "Parcial",
  PENDING: "No pago",
};

/** Botón redondo de +/- del desplegable de cupos. */
function stepperBtn(disabled: boolean): React.CSSProperties {
  return {
    width: "26px",
    height: "26px",
    borderRadius: "50%",
    border: "1px solid #ddd",
    background: "transparent",
    color: "#555",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: disabled ? "default" : "pointer",
    opacity: disabled ? 0.3 : 1,
    padding: 0,
  };
}

const DESKTOP_PAGE_SIZE = 8;
const MOBILE_PAGE_SIZE = 5;

type AttendanceFilter = "all" | "CONFIRMED" | "PENDING" | "DECLINED";
type PaymentFilter = "all" | "PAID" | "PARTIAL" | "PENDING";

export function GuestListWithPayment({
  invitationId,
  paymentAmount,
  pagoTarjetaHabilitado = false,
  onPaymentChange,
}: GuestListWithPaymentProps) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendanceFilter, setAttendanceFilter] = useState<AttendanceFilter>("all");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [showPaymentInfo, setShowPaymentInfo] = useState(true);
  const [page, setPage] = useState(1);
  // Fila con el desplegable de cupos abierto, y el error que devolvió el server.
  const [openSeatsFor, setOpenSeatsFor] = useState<string | null>(null);
  const [rowError, setRowError] = useState<{ guestId: string; message: string } | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (showPaymentInfo) {
      const timer = setTimeout(() => setShowPaymentInfo(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showPaymentInfo]);


  useEffect(() => {
    fetch(`/api/guests?invitationId=${invitationId}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setGuests(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [invitationId]);

  // Un solo camino hacia la API: se manda un estado (atajo) o los cupos pagos por
  // franja, y la fila se sincroniza con lo que responde el servidor -- que es
  // quien sabe a qué precio entró cada cupo. Sin optimismo local: los montos no
  // se pueden adivinar de este lado.
  const patchPayment = async (
    guestId: string,
    payload: { status: string } | { seats: Partial<Record<Bracket, number>> }
  ) => {
    setUpdatingId(guestId);
    setRowError(null);
    try {
      const res = await fetch(`/api/guests/${guestId}/payment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setRowError({
          guestId,
          message: data?.error ?? `El servidor rechazó el cambio (${res.status}).`,
        });
        return;
      }
      setGuests((prev) =>
        prev.map((g) =>
          g.id === guestId
            ? {
                ...g,
                paymentStatus: data.paymentStatus,
                isExempt: data.isExempt ?? g.isExempt,
                paidSeats: data.paidSeats ?? g.paidSeats,
                seats: data.seats ?? g.seats,
                paidAmount: data.paidAmount ?? g.paidAmount,
                pendingAmount: data.pendingAmount ?? g.pendingAmount,
                totalAmount: data.totalAmount ?? g.totalAmount,
                surplus: data.surplus ?? g.surplus,
              }
            : g
        )
      );
      onPaymentChange?.(guestId, data.paymentStatus);
    } catch {
      setRowError({ guestId, message: "No se pudo conectar con el servidor." });
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePaymentChange = (guestId: string, newStatus: string) =>
    patchPayment(guestId, { status: newStatus });

  /** Suma o resta un cupo pago de una franja, sin pasarse de los confirmados. */
  const changeSeat = (guest: Guest, bracket: Bracket, delta: number) => {
    const next = Math.min(
      guest.seats?.[bracket] ?? 0,
      Math.max(0, (guest.paidSeats?.[bracket] ?? 0) + delta)
    );
    return patchPayment(guest.id, { seats: { ...guest.paidSeats, [bracket]: next } });
  };

  const filtered = guests.filter((g) => {
    const matchAttendance = attendanceFilter === "all" || g.status === attendanceFilter;
    const matchPayment = paymentFilter === "all" || (g.status === "CONFIRMED" && g.paymentStatus === paymentFilter);
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase());
    return matchAttendance && matchPayment && matchSearch;
  });

  useEffect(() => {
    setPage(1);
  }, [attendanceFilter, paymentFilter, search]);

  // Los pills de estado y de pago son combinables (ej: Confirmó + No pago),
  // pero no todas las combinaciones tienen sentido -- el pago solo aplica a
  // invitados CONFIRMADOS, así que si el estado activo es Pendiente/No
  // asistirá los pills de pago se deshabilitan (y viceversa). Dentro de cada
  // grupo, además, son mutuamente excluyentes entre sí.
  const isAttendanceDisabled = (value: AttendanceFilter) => {
    if (value === "all") return false;
    if (attendanceFilter !== "all" && attendanceFilter !== value) return true;
    if (value !== "CONFIRMED" && paymentFilter !== "all") return true;
    return false;
  };

  const isPaymentDisabled = (value: Exclude<PaymentFilter, "all">) => {
    if (paymentFilter !== "all" && paymentFilter !== value) return true;
    if (attendanceFilter === "PENDING" || attendanceFilter === "DECLINED") return true;
    return false;
  };

  const toggleAttendance = (value: AttendanceFilter) => {
    if (value === "all") {
      // "Todos" es el reset general: borra también el filtro de pago.
      setAttendanceFilter("all");
      setPaymentFilter("all");
      return;
    }
    setAttendanceFilter((prev) => (prev === value ? "all" : value));
  };

  const togglePayment = (value: Exclude<PaymentFilter, "all">) => {
    setPaymentFilter((prev) => (prev === value ? "all" : value));
  };

  const PAGE_SIZE = isMobile ? MOBILE_PAGE_SIZE : DESKTOP_PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Resumen
  const confirmed  = guests.filter((g) => g.status === "CONFIRMED");
  const exemptCount = confirmed.filter((g) => g.paymentStatus === "EXEMPT").length;
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

  const handleExportExcel = () => {
    if (guests.length === 0) return;

    const escape = (str: string) => `"${(str ?? "").replace(/"/g, '""')}"`;
    const header = "Nombre;Estado;Personas;Pago;Restricciones alimentarias\n";
    const rows = guests
      .map((g) => {
        const personas = g.status === "CONFIRMED" ? g.attendingCount : g.expectedCount;
        const pago = g.status === "CONFIRMED"
          ? PAYMENT_STATUS_LABELS[g.paymentStatus as CardPaymentStatus] ?? g.paymentStatus
          : "—";
        return [
          escape(g.name),
          escape(STATUS_LABELS[g.status] ?? g.status),
          personas,
          escape(pago),
          escape(g.dietaryRestrictions || ""),
        ].join(";");
      })
      .join("\n");

    const csvContent = "﻿" + header + rows;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lista-invitados.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#888", fontSize: "14px" }}>
        Cargando invitados…
      </div>
    );
  }

  return (
    <div>
      {/* Totales de recaudación */}
      {pagoTarjetaHabilitado && (
        <>
          {/* Burbuja informativa colapsable animada */}
          <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-900/10 border border-amber-500/30 text-amber-200/90 text-xs overflow-hidden transition-all duration-300 mb-5 shadow-[0_0_15px_rgba(245,158,11,0.05)]">
            <button
                type="button"
                onClick={() => setShowPaymentInfo(!showPaymentInfo)}
                className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-amber-500/15 transition-colors cursor-pointer"
            >
                <div className="flex items-center gap-2 font-medium">
                    <Info className={`w-5 h-5 shrink-0 text-amber-400 ${showPaymentInfo ? 'animate-pulse' : ''}`} />
                    <span className="text-amber-400 text-[13px]">Aviso Importante y Gestión de Pagos</span>
                </div>
                <div className="text-amber-400 opacity-80 hover:opacity-100 transition-opacity shrink-0">
                    {showPaymentInfo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
            </button>

            {showPaymentInfo && (
                <div className="px-4 pb-5 pt-1 border-t border-amber-500/20 text-[13px] leading-relaxed opacity-95 animate-in fade-in slide-in-from-top-4 duration-300 space-y-3">
                    <p>
                      <strong>Aviso importante:</strong> Los pagos gestionados aquí son solamente figurativos para que puedas llevar un control. Esta plataforma <strong>no moviliza dinero</strong> y cualquier dato mal cargado es responsabilidad del cliente.
                    </p>
                    <div className="w-full h-px bg-amber-500/20" />
                    <div className="space-y-1">
                      <p className="flex gap-2">
                          <span>👉</span>
                          <span>Tocá un estado de pago (No pago aún / Exento / Pagado) en la lista para cambiarlo de manera rápida.</span>
                      </p>
                      <p className="font-medium text-amber-300 flex gap-2">
                          <span>💡</span>
                          <span>El invitado verá el cambio reflejado automáticamente cuando abra su invitación.</span>
                      </p>
                    </div>
                </div>
            )}
          </div>

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
        {(["all", "CONFIRMED", "PENDING", "DECLINED"] as const).map((f) => {
          const disabled = isAttendanceDisabled(f);
          const active = attendanceFilter === f;
          return (
            <button
              key={f}
              onClick={() => !disabled && toggleAttendance(f)}
              disabled={disabled}
              style={{
                padding: "5px 10px",
                borderRadius: "999px",
                border: "1px solid #ddd",
                background: active ? "#1a1a1a" : "#fff",
                color: active ? "#fff" : "#555",
                fontSize: "11px",
                fontWeight: 600,
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.35 : 1,
                fontFamily: "var(--font-body)",
                minHeight: "32px",
              }}
            >
              {f === "all" ? "Todos" : STATUS_LABELS[f]}
            </button>
          );
        })}

        {pagoTarjetaHabilitado && (
          <>
            <span style={{ width: "1px", alignSelf: "stretch", background: "#e2e2e2", margin: "2px 2px" }} />
            {(["PAID", "PENDING"] as const).map((p) => {
              const disabled = isPaymentDisabled(p);
              const active = paymentFilter === p;
              return (
                <button
                  key={p}
                  onClick={() => !disabled && togglePayment(p)}
                  disabled={disabled}
                  style={{
                    padding: "5px 10px",
                    borderRadius: "999px",
                    border: `1px solid ${active ? PAYMENT_STATUS_COLORS[p] : "#ddd"}`,
                    background: active ? PAYMENT_STATUS_COLORS[p] : "#fff",
                    color: active ? "#fff" : "#555",
                    fontSize: "11px",
                    fontWeight: 600,
                    cursor: disabled ? "not-allowed" : "pointer",
                    opacity: disabled ? 0.35 : 1,
                    fontFamily: "var(--font-body)",
                    minHeight: "32px",
                  }}
                >
                  {PAYMENT_FILTER_LABELS[p]}
                </button>
              );
            })}
          </>
        )}
      </div>

      {/* Descarga discreta de la lista */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "12px" }}>
        <button
          onClick={handleExportExcel}
          disabled={guests.length === 0}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 10px",
            borderRadius: "999px",
            border: "1px solid #ddd",
            background: "transparent",
            color: "#777",
            fontSize: "11.5px",
            fontWeight: 600,
            cursor: guests.length === 0 ? "default" : "pointer",
            opacity: guests.length === 0 ? 0.4 : 1,
            fontFamily: "var(--font-body)",
          }}
          aria-label="Descargar lista completa de invitados en Excel"
        >
          <Download size={13} />
          Descargar lista (Excel)
        </button>
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <p style={{ textAlign: "center", color: "#888", padding: "32px", fontSize: "13px" }}>
          No hay invitados en esta categoría.
        </p>
      ) : (
        <div>
          {paginated.map((guest) => {
            const seatsOpen = openSeatsFor === guest.id;
            const paidSeatsCount = BRACKETS.reduce((n, b) => n + (guest.paidSeats?.[b] ?? 0), 0);
            const totalSeatsCount = BRACKETS.reduce((n, b) => n + (guest.seats?.[b] ?? 0), 0);
            return (
            <div key={guest.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
            <div
              className="inv-guest-row"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
                padding: "14px 0",
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
                  {guest.status === "PENDING" && (
                    <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", background: "rgba(234, 179, 8, 0.1)", color: "rgb(234, 179, 8)", padding: "2px 8px", borderRadius: "99px", fontWeight: 700 }}>
                      Pendiente
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "11.5px", color: "#888", marginTop: "4px" }}>
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

                  {/* Resumen de plata de la fila + acceso al detalle por franja */}
                  {!guest.isExempt && guest.totalAmount > 0 && (
                    <button
                      onClick={() => setOpenSeatsFor(seatsOpen ? null : guest.id)}
                      aria-expanded={seatsOpen}
                      style={{
                        display: "flex", alignItems: "center", gap: "6px",
                        background: "transparent", border: "none", cursor: "pointer",
                        fontSize: "11.5px", color: "#666", padding: "2px 0",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      <span>
                        {paidSeatsCount} de {totalSeatsCount} pago{totalSeatsCount !== 1 ? "s" : ""}
                        {guest.pendingAmount > 0 ? (
                          <>
                            {" · falta "}
                            <b>{formatARS(guest.pendingAmount)}</b>
                          </>
                        ) : guest.surplus > 0 ? (
                          <>
                            {" · "}
                            <b style={{ color: PAYMENT_STATUS_COLORS.PARTIAL }}>
                              {formatARS(guest.surplus)} a favor
                            </b>
                          </>
                        ) : null}
                      </span>
                      {seatsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              )}
            </div>

            {rowError?.guestId === guest.id && (
              <div style={{ padding: "0 0 12px", fontSize: "11.5px", color: "#c0392b" }}>
                {rowError.message}
              </div>
            )}

            {/* Desplegable: qué cupos de cada franja están pagos */}
            {seatsOpen && (
              <div style={{ padding: "0 0 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                {BRACKETS.filter((b) => (guest.seats?.[b] ?? 0) > 0).map((b) => {
                  const total = guest.seats[b];
                  const paid = guest.paidSeats?.[b] ?? 0;
                  const label = total === 1 ? BRACKET_LABELS[b].one : BRACKET_LABELS[b].many;
                  return (
                    <div key={b} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                      <span style={{ fontSize: "12.5px", color: "#555", textTransform: "capitalize" }}>{label}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <button
                          onClick={() => changeSeat(guest, b, -1)}
                          disabled={updatingId === guest.id || paid <= 0}
                          aria-label={`Quitar un ${BRACKET_LABELS[b].one} pago`}
                          style={stepperBtn(paid <= 0 || updatingId === guest.id)}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span style={{ fontSize: "12.5px", fontWeight: 700, minWidth: "56px", textAlign: "center", color: paid === total ? PAYMENT_STATUS_COLORS.PAID : "#555" }}>
                          {paid} de {total}
                        </span>
                        <button
                          onClick={() => changeSeat(guest, b, 1)}
                          disabled={updatingId === guest.id || paid >= total}
                          aria-label={`Marcar un ${BRACKET_LABELS[b].one} como pago`}
                          style={stepperBtn(paid >= total || updatingId === guest.id)}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                <div style={{ borderTop: "1px dashed #e2e2e2", paddingTop: "10px", fontSize: "12px", color: "#666", display: "flex", flexWrap: "wrap", gap: "4px 10px" }}>
                  <span>Cobrado: <b style={{ color: PAYMENT_STATUS_COLORS.PAID }}>{formatARS(guest.paidAmount)}</b></span>
                  {guest.pendingAmount > 0 && (
                    <span>Falta: <b>{formatARS(guest.pendingAmount)}</b></span>
                  )}
                  <span style={{ opacity: .75 }}>Total: {formatARS(guest.totalAmount)}</span>
                  {guest.surplus > 0 && (
                    <span style={{ color: PAYMENT_STATUS_COLORS.PARTIAL }}>{formatARS(guest.surplus)} a favor</span>
                  )}
                </div>
              </div>
            )}
            </div>
            );
          })}

          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginTop: "20px" }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: "8px 14px",
                  borderRadius: "999px",
                  border: "1px solid #ddd",
                  background: "#fff",
                  color: "#555",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: currentPage === 1 ? "default" : "pointer",
                  opacity: currentPage === 1 ? 0.4 : 1,
                  fontFamily: "var(--font-body)",
                  minHeight: "44px",
                }}
                aria-label="Página anterior"
              >
                ‹
              </button>
              <span style={{ fontSize: "12px", color: "#888", minWidth: "90px", textAlign: "center" }}>
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: "8px 14px",
                  borderRadius: "999px",
                  border: "1px solid #ddd",
                  background: "#fff",
                  color: "#555",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: currentPage === totalPages ? "default" : "pointer",
                  opacity: currentPage === totalPages ? 0.4 : 1,
                  fontFamily: "var(--font-body)",
                  minHeight: "44px",
                }}
                aria-label="Página siguiente"
              >
                ›
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
