"use client";

import { useState, useEffect } from "react";
import { Info, ChevronUp, ChevronDown, Download } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  computeBalance,
  formatARS,
} from "@/lib/payments";

interface Guest {
  id: string;
  name: string;
  type: string;
  status: string;
  attendingCount: number;
  expectedCount: number;
  paymentStatus: string;
  // Montos resueltos por el servidor (GET /api/guests) -- el panel no vuelve a
  // calcular precios, así lo que ve el anfitrión y lo que ve el invitado coinciden.
  paidAmount: number;
  expectedAmount: number;
  balance: number;
  isExempt?: boolean;
  dietaryRestrictions?: string;
  message?: string;
}

interface GuestListWithPaymentProps {
  invitationId: string;
  pagoTarjetaHabilitado?: boolean;
  onPaymentChange?: (guestId: string, newStatus: string) => void;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmó",
  DECLINED: "No asistirá",
};

// Los labels y colores de estado viven en src/lib/payments.ts (los comparte la
// barra de estadísticas).
const PAYMENT_FILTER_LABELS: Record<string, string> = {
  PAID: "Pago",
  PARTIAL: "Parcial",
  PENDING: "No pago",
};

// Labels cortos: en mobile el toggle ocupa el ancho completo y ahora tiene
// cuatro estados, así que "No pago aún" no entra.
const TOGGLE_LABELS: Record<string, string> = {
  PENDING: "No pago",
  PARTIAL: "Parcial",
  EXEMPT: "Exento",
  PAID: "Pagado",
};

const PAYMENT_TOGGLE_STATES = ["PENDING", "PARTIAL", "EXEMPT", "PAID"] as const;

/**
 * Filtra lo que se puede tipear en el monto: solo dígitos y separadores. El
 * campo es `type="text"` (un `type="number"` no acepta el formato local
 * "150.000,50" y además suma flechitas y scroll que acá molestan), así que el
 * teclado hay que acotarlo a mano -- si no, entran letras y símbolos que recién
 * se rechazan al guardar.
 */
function sanitizeAmountInput(text: string): string {
  return text.replace(/[^\d.,]/g, "");
}

/**
 * Interpreta lo que el anfitrión tipea en el monto: "150000", "$150.000",
 * "150.000,50". El punto se toma como separador de miles y la coma como decimal.
 * Devuelve NaN si no es un número.
 */
function parseAmountInput(text: string): number {
  const normalized = text
    .trim()
    .split("$").join("")
    .split(" ").join("")
    .split(".").join("")
    .split(",").join(".");
  if (normalized === "") return NaN;
  return Number(normalized);
}

const DESKTOP_PAGE_SIZE = 8;
const MOBILE_PAGE_SIZE = 5;

type AttendanceFilter = "all" | "CONFIRMED" | "PENDING" | "DECLINED";
type PaymentFilter = "all" | "PAID" | "PARTIAL" | "PENDING";

export function GuestListWithPayment({
  invitationId,
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
  // Fila con el editor de pago parcial abierto, y lo tipeado ahí.
  const [partialFor, setPartialFor] = useState<string | null>(null);
  const [partialInput, setPartialInput] = useState("");
  const [partialError, setPartialError] = useState("");
  // Fila esperando que se confirme el borrado de un monto ya registrado.
  const [clearConfirm, setClearConfirm] = useState<
    { guestId: string; status: string; paidAmount?: number } | null
  >(null);
  // Error de una fila (lo que devolvió el servidor al cambiar el estado).
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

  // Un solo camino para cambiar el pago: se manda o un estado (atajo) o un monto
  // (pago parcial), y la fila se sincroniza con lo que responde el servidor --
  // que es quien deriva el estado a partir del monto. Sin optimismo local: el
  // estado ya no es un dato independiente que se pueda adivinar de este lado.
  const patchPayment = async (
    guestId: string,
    payload: ({ status?: string } | { paidAmount: number }) & { confirmClearPayment?: boolean }
  ) => {
    setUpdatingId(guestId);
    try {
      const res = await fetch(`/api/guests/${guestId}/payment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const updated = await res.json().catch(() => ({}));
      // El servidor es el que valida (sobrepago, borrado de un monto ya
      // registrado): se muestra su mensaje en vez de un "no se pudo guardar"
      // que no dice nada.
      if (!res.ok) {
        return {
          ok: false as const,
          error: (updated?.error as string | undefined) ?? `El servidor rechazó el cambio (${res.status}).`,
          code: updated?.code as string | undefined,
          paidAmount: updated?.paidAmount as number | undefined,
        };
      }
      setGuests((prev) =>
        prev.map((g) =>
          g.id === guestId
            ? {
                ...g,
                paymentStatus: updated.paymentStatus,
                paidAmount: updated.paidAmount ?? g.paidAmount,
                expectedAmount: updated.expectedAmount ?? g.expectedAmount,
                balance: updated.balance ?? computeBalance(updated.paidAmount, updated.expectedAmount),
                isExempt: updated.isExempt ?? g.isExempt,
              }
            : g
        )
      );
      onPaymentChange?.(guestId, updated.paymentStatus);
      return { ok: true as const };
    } catch {
      return { ok: false as const, error: "No se pudo conectar con el servidor." };
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePaymentChange = async (guestId: string, newStatus: string, confirmClearPayment = false) => {
    setPartialFor(null);
    setClearConfirm(null);
    const res = await patchPayment(guestId, { status: newStatus, confirmClearPayment });
    if (!res.ok) {
      // El servidor tiene la última palabra sobre cuánto hay abonado. Si frena
      // el cambio porque borraría plata (la fila podía tener el monto viejo),
      // se abre la confirmación en vez de dejar el clic sin efecto ni aviso.
      if (res.code === "PAYMENT_WOULD_BE_CLEARED") {
        setClearConfirm({ guestId, status: newStatus, paidAmount: res.paidAmount });
      } else {
        setRowError({ guestId, message: res.error ?? "No se pudo guardar." });
      }
    }
    return res;
  };

  /**
   * "No pago" y "Exento" dejan el monto en cero -- son estados sin plata, y el
   * estado se deriva del monto. Pero un clic al pasar borraría en silencio lo
   * que la familia ya entregó, sin deshacer, así que cuando hay un monto
   * registrado primero se pide confirmación.
   */
  const requestPaymentChange = (guest: Guest, newStatus: string) => {
    setRowError(null);
    const wipesMoney = (newStatus === "PENDING" || newStatus === "EXEMPT") && guest.paidAmount > 0;
    if (wipesMoney) {
      setPartialFor(null);
      setClearConfirm({ guestId: guest.id, status: newStatus, paidAmount: guest.paidAmount });
      return;
    }
    handlePaymentChange(guest.id, newStatus);
  };

  const openPartialEditor = (guest: Guest) => {
    setPartialError("");
    setClearConfirm(null);
    setRowError(null);
    setPartialFor(guest.id);
    // Se precarga lo ya abonado (si hay), que es lo que el anfitrión va a querer
    // corregir o completar.
    setPartialInput(guest.paidAmount > 0 && guest.paidAmount < guest.expectedAmount ? String(guest.paidAmount) : "");
  };

  const handlePartialSubmit = async (guest: Guest) => {
    const amount = parseAmountInput(partialInput);
    if (!Number.isFinite(amount) || amount < 0) {
      setPartialError("Ingresá un monto válido.");
      return;
    }
    if (guest.expectedAmount > 0 && amount > guest.expectedAmount) {
      setPartialError(`No puede superar el total de ${formatARS(guest.expectedAmount)}.`);
      return;
    }
    // Tipear un 0 acá es deliberado (a diferencia de un clic al pasar en "No
    // pago"), así que se confirma solo el borrado del monto.
    const res = await patchPayment(guest.id, { paidAmount: amount, confirmClearPayment: amount === 0 });
    if (res.ok) {
      setPartialFor(null);
      setPartialInput("");
      setPartialError("");
    } else {
      setPartialError(res.error ?? "No se pudo guardar. Intentá de nuevo.");
    }
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
  const partialCount = confirmed.filter((g) => g.paymentStatus === "PARTIAL").length;

  // Se suman los montos que ya resolvió el servidor (incluye pagos parciales y
  // los precios diferenciados por franja de edad). Antes esto se estimaba acá
  // multiplicando plano por attendingCount, y encima dependía de un prop
  // `paymentAmount` que esta lista nunca recibía -- por eso el recuadro de
  // recaudación no llegaba a mostrarse nunca. Ese prop ya no existe.
  const billable = confirmed.filter((g) => g.paymentStatus !== "EXEMPT");
  const estimatedTotal = billable.reduce((sum, g) => sum + (g.expectedAmount || 0), 0);
  const collectedTotal = billable.reduce((sum, g) => sum + (g.paidAmount || 0), 0);
  const outstandingTotal = billable.reduce((sum, g) => sum + (g.balance || 0), 0);
  const showTotals = estimatedTotal > 0 || collectedTotal > 0;

  const handleExportExcel = () => {
    if (guests.length === 0) return;

    const escape = (str: string) => `"${(str ?? "").replace(/"/g, '""')}"`;
    const header = pagoTarjetaHabilitado
      ? "Nombre;Estado;Personas;Pago;Total tarjeta;Abonado;Saldo;Restricciones alimentarias\n"
      : "Nombre;Estado;Personas;Pago;Restricciones alimentarias\n";
    const rows = guests
      .map((g) => {
        const personas = g.status === "CONFIRMED" ? g.attendingCount : g.expectedCount;
        const pago = g.status === "CONFIRMED" ? PAYMENT_STATUS_LABELS[g.paymentStatus] ?? g.paymentStatus : "—";
        // Los montos van como número plano (sin símbolo ni separador de miles)
        // para que Excel los sume sin reformatear la columna.
        const money = (n: number) => (g.status === "CONFIRMED" ? String(Math.round(n)) : "");
        return [
          escape(g.name),
          escape(STATUS_LABELS[g.status] ?? g.status),
          personas,
          escape(pago),
          ...(pagoTarjetaHabilitado
            ? [
                money(g.paymentStatus === "EXEMPT" ? 0 : g.expectedAmount || 0),
                money(g.paidAmount || 0),
                money(g.paymentStatus === "EXEMPT" ? 0 : g.balance || 0),
              ]
            : []),
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
                      <p className="flex gap-2">
                          <span>◐</span>
                          <span>Si una familia o grupo abonó solo una parte, usá <strong>Parcial</strong> y cargá el monto recibido: la lista te va a mostrar el saldo que falta, y el invitado también lo ve en su invitación.</span>
                      </p>
                      <p className="font-medium text-amber-300 flex gap-2">
                          <span>💡</span>
                          <span>El invitado verá el cambio reflejado automáticamente cuando abra su invitación.</span>
                      </p>
                    </div>
                </div>
            )}
          </div>

          {showTotals && (
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
              <span>⏳ Falta cobrar: <b>{formatARS(outstandingTotal)}</b></span>
              <span style={{ opacity: .5 }}>·</span>
              <span style={{ opacity: .8 }}>Total tarjetas: <b>{formatARS(estimatedTotal)}</b></span>
              {partialCount > 0 && (
                <>
                  <span style={{ opacity: .5 }}>·</span>
                  <span style={{ color: PAYMENT_STATUS_COLORS.PARTIAL }}>
                    ◐ {partialCount} pago{partialCount !== 1 ? "s" : ""} parcial{partialCount !== 1 ? "es" : ""}
                  </span>
                </>
              )}
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
            {(["PAID", "PARTIAL", "PENDING"] as const).map((p) => {
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
            const partialOpen = partialFor === guest.id;
            const confirmOpen = clearConfirm?.guestId === guest.id ? clearConfirm : null;
            const billableRow = guest.status === "CONFIRMED" && guest.paymentStatus !== "EXEMPT" && guest.expectedAmount > 0;
            // Valor de "una tarjeta" del grupo, para los atajos. Con precios
            // diferenciados por edad es un promedio: el monto exacto queda a la
            // vista en el input antes de guardar.
            const perPerson = guest.attendingCount > 0 ? guest.expectedAmount / guest.attendingCount : 0;
            const typedAmount = parseAmountInput(partialInput);
            const previewBalance = Number.isFinite(typedAmount)
              ? computeBalance(typedAmount, guest.expectedAmount)
              : guest.balance;
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
                    {PAYMENT_TOGGLE_STATES.map((s) => (
                      <button
                        key={s}
                        onClick={() =>
                          // "Parcial" no se aplica de una: necesita el monto, así
                          // que abre el editor de la fila. Los demás pasan por
                          // requestPaymentChange, que frena si el cambio borraría
                          // un monto ya registrado.
                          s === "PARTIAL" ? openPartialEditor(guest) : requestPaymentChange(guest, s)
                        }
                        disabled={updatingId === guest.id || (s === "PARTIAL" && guest.expectedAmount <= 0)}
                        title={
                          s === "PARTIAL" && guest.expectedAmount <= 0
                            ? "Cargá el precio de la tarjeta para poder registrar pagos parciales"
                            : undefined
                        }
                        style={{
                          padding: "6px 10px",
                          fontSize: "11px",
                          fontWeight: 700,
                          border: "none",
                          background: guest.paymentStatus === s ? PAYMENT_STATUS_COLORS[s] : "transparent",
                          color: guest.paymentStatus === s ? "#fff" : "#888",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          opacity: updatingId === guest.id || (s === "PARTIAL" && guest.expectedAmount <= 0) ? 0.5 : 1,
                        }}
                        aria-pressed={guest.paymentStatus === s}
                      >
                        {TOGGLE_LABELS[s]}
                      </button>
                    ))}
                  </div>

                  {/* Plata concreta de esta fila: lo que entregó y lo que falta. */}
                  {billableRow && (
                    <div style={{ fontSize: "11.5px", color: "#666", textAlign: "right" }}>
                      {guest.paymentStatus === "PARTIAL" ? (
                        <>
                          Abonó <b style={{ color: PAYMENT_STATUS_COLORS.PARTIAL }}>{formatARS(guest.paidAmount)}</b>
                          {" · falta "}
                          <b>{formatARS(guest.balance)}</b>
                          <span style={{ opacity: .7 }}> de {formatARS(guest.expectedAmount)}</span>
                        </>
                      ) : guest.paymentStatus === "PAID" ? (
                        <>Pagó {formatARS(guest.paidAmount)}</>
                      ) : (
                        <>Tarjeta: {formatARS(guest.expectedAmount)}</>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Lo que respondió el servidor cuando el cambio no se pudo aplicar */}
            {rowError?.guestId === guest.id && (
              <div style={{ padding: "0 0 12px", fontSize: "11.5px", color: "#c0392b" }}>
                {rowError.message}
              </div>
            )}

            {/* Confirmación antes de borrar un monto ya registrado */}
            {confirmOpen && (
              <div
                style={{
                  padding: "0 0 16px",
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                  alignItems: "center",
                  animation: "fadeIn .2s ease",
                }}
              >
                <span style={{ fontSize: "12px", color: "#666" }}>
                  {confirmOpen.status === "EXEMPT" ? "Marcar exento a " : "Pasar a “No pago” a "}
                  <b>{guest.name}</b> borra los{" "}
                  <b style={{ color: PAYMENT_STATUS_COLORS.PARTIAL }}>
                    {formatARS(confirmOpen.paidAmount ?? guest.paidAmount)}
                  </b>{" "}
                  ya registrados. ¿Seguro?
                </span>
                <button
                  onClick={() => handlePaymentChange(guest.id, confirmOpen.status, true)}
                  disabled={updatingId === guest.id}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "999px",
                    border: "none",
                    background: "#c0392b",
                    color: "#fff",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    opacity: updatingId === guest.id ? 0.5 : 1,
                    fontFamily: "var(--font-body)",
                    minHeight: "38px",
                  }}
                >
                  Sí, borrar el monto
                </button>
                <button
                  onClick={() => setClearConfirm(null)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "999px",
                    border: "1px solid #ddd",
                    background: "transparent",
                    color: "#777",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "var(--font-body)",
                    minHeight: "38px",
                  }}
                >
                  Cancelar
                </button>
              </div>
            )}

            {/* Editor de pago parcial de la fila */}
            {partialOpen && (
              <div
                style={{
                  padding: "0 0 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  animation: "fadeIn .2s ease",
                }}
              >
                <div style={{ fontSize: "12px", color: "#666" }}>
                  Monto recibido de <b>{guest.name}</b> — total de la tarjeta {formatARS(guest.expectedAmount)}
                  {guest.attendingCount > 1 ? ` (${guest.attendingCount} personas)` : ""}
                </div>

                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
                  <input
                    type="text"
                    inputMode="decimal"
                    autoFocus
                    value={partialInput}
                    onChange={(ev) => { setPartialInput(sanitizeAmountInput(ev.target.value)); setPartialError(""); }}
                    onKeyDown={(ev) => {
                      if (ev.key === "Enter") handlePartialSubmit(guest);
                      if (ev.key === "Escape") setPartialFor(null);
                    }}
                    placeholder="Ej: 150000"
                    aria-label={`Monto abonado por ${guest.name}`}
                    style={{
                      width: "140px",
                      padding: "8px 12px",
                      borderRadius: "10px",
                      border: `1px solid ${partialError ? "#c0392b" : "#ddd"}`,
                      fontSize: "13px",
                      fontFamily: "var(--font-body)",
                    }}
                  />
                  <button
                    onClick={() => handlePartialSubmit(guest)}
                    disabled={updatingId === guest.id}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "999px",
                      border: "none",
                      background: PAYMENT_STATUS_COLORS.PARTIAL,
                      color: "#fff",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                      opacity: updatingId === guest.id ? 0.5 : 1,
                      fontFamily: "var(--font-body)",
                      minHeight: "38px",
                    }}
                  >
                    Guardar monto
                  </button>
                  <button
                    onClick={() => { setPartialFor(null); setPartialError(""); }}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "999px",
                      border: "1px solid #ddd",
                      background: "transparent",
                      color: "#777",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "var(--font-body)",
                      minHeight: "38px",
                    }}
                  >
                    Cancelar
                  </button>
                </div>

                {/* Atajo para el caso típico: "pagaron 2 tarjetas de las 5". */}
                {guest.attendingCount > 1 && perPerson > 0 && (
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
                    <span style={{ fontSize: "11px", color: "#999" }}>Pagaron</span>
                    {Array.from({ length: Math.min(guest.attendingCount - 1, 8) }, (_, i) => i + 1).map((k) => (
                      <button
                        key={k}
                        onClick={() => { setPartialInput(String(Math.round(perPerson * k))); setPartialError(""); }}
                        style={{
                          padding: "5px 10px",
                          borderRadius: "999px",
                          border: "1px dashed #ccc",
                          background: "transparent",
                          color: "#666",
                          fontSize: "11px",
                          fontWeight: 600,
                          cursor: "pointer",
                          fontFamily: "var(--font-body)",
                        }}
                      >
                        {k} tarjeta{k !== 1 ? "s" : ""}
                      </button>
                    ))}
                  </div>
                )}

                <div style={{ fontSize: "11.5px", color: partialError ? "#c0392b" : "#888" }}>
                  {partialError
                    ? partialError
                    : previewBalance > 0
                      ? `Quedaría un saldo de ${formatARS(previewBalance)}.`
                      : "Con este monto la tarjeta queda paga."}
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
