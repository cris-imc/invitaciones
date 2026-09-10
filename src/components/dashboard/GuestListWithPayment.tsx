"use client";

import { useState, useEffect } from "react";
import { Info, ChevronUp, ChevronDown, Download, NotebookPen, ListChecks, Undo2, Pencil, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { hapticoConfirmar, hapticoDeshacer } from "@/lib/haptics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogBody,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  BRACKETS,
  BRACKET_LABELS,
  CARD_PAYMENT_COLORS,
  CARD_PAYMENT_LABELS,
  formatARS,
  type Bracket,
  type CardPaymentStatus,
  type Seat,
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
  seats: Seat[];
  seatCounts: Record<Bracket, number>;
  totalSeats: number;
  paidSeats: number;
  paidAmount: number;
  pendingAmount: number;
  totalAmount: number;
  surplus: number;
  lugaresEnMesas?: { lugares: number; mesa: { numero: number } }[];
  // Registro propio del anfitrión: plata que dice haber recibido, y la
  // diferencia contra lo que representan los cupos marcados.
  receivedAmount: number;
  onAccount: number;
  missingAmount: number;
  /** Anotaciones privadas del anfitrión. El invitado nunca las ve. */
  hostNotes?: string | null;
  isExempt?: boolean;
  dietaryRestrictions?: string;
  message?: string;
  /** ISO. Sólo se usa para ordenar por "últimos agregados". */
  createdAt?: string;
}

interface GuestListWithPaymentProps {
  invitationId: string;
  paymentAmount?: number;
  pagoTarjetaHabilitado?: boolean;
  /**
   * Si la invitación tiene algún precio cargado. Sin precio no hay monto que
   * repartir entre los cupos: el panel se queda con los estados simples y no
   * muestra nada que hable de plata (sería todo $0).
   */
  hasPrices?: boolean;
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

/**
 * El pill de asistencia de cada fila. Los tres comparten forma y sólo cambian
 * texto y color; juntos acá, no hay manera de que uno quede desalineado de los
 * otros. El plural sale de cuántos vienen, o de cuántos se esperaban si dijo
 * que no.
 */
const ASISTENCIA_PILL: Record<
  string,
  (g: { attendingCount: number; expectedCount: number }) => { texto: string; rgb: string }
> = {
  CONFIRMED: (g) => ({ texto: g.attendingCount > 1 ? "Asistirán" : "Asistirá", rgb: "16, 185, 129" }),
  DECLINED: (g) => ({ texto: g.expectedCount > 1 ? "No asistirán" : "No asistirá", rgb: "239, 68, 68" }),
  PENDING: () => ({ texto: "Pendiente", rgb: "234, 179, 8" }),
};

/**
 * Filtra lo que se puede tipear en el monto recibido: solo dígitos y
 * separadores. El campo es `type="text"` porque `type="number"` no acepta el
 * formato local "25.000,50" y suma flechitas que acá molestan.
 */
function sanitizeAmountInput(text: string): string {
  return text.replace(/[^\d.,]/g, "");
}

/** "25000", "$25.000", "25.000,50" → 25000 / 25000.5. NaN si no es un número. */
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

/**
 * Que el anfitrión cerró el aviso de pagos para siempre. Va en localStorage y
 * no en sessionStorage justamente por eso: sessionStorage se vacía al cerrar la
 * pestaña y el aviso volvía a aparecer al día siguiente. Como es definitivo, se
 * pregunta antes de guardarlo.
 */
const AVISO_OCULTO_KEY = "inv:aviso-pagos-oculto";

type SortBy = "debt" | "name" | "recent";

const SORT_LABELS: Record<SortBy, string> = {
  debt: "Primero los que deben",
  name: "Nombre (A-Z)",
  recent: "Últimos agregados",
};

export function GuestListWithPayment({
  invitationId,
  paymentAmount,
  pagoTarjetaHabilitado = false,
  hasPrices = false,
  onPaymentChange,
}: GuestListWithPaymentProps) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendanceFilter, setAttendanceFilter] = useState<AttendanceFilter>("all");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  // Arranca plegado: el aviso importa la primera vez, no en cada visita.
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);
  // null = todavía no se sabe si el anfitrión lo cerró alguna vez.
  const [avisoVisible, setAvisoVisible] = useState<boolean | null>(null);
  const [confirmarCierreAviso, setConfirmarCierreAviso] = useState(false);
  const [page, setPage] = useState(1);
  // Invitado cuyo detalle de pago está abierto en el modal, y el error que
  // devolvió el server para esa fila.
  const [detailFor, setDetailFor] = useState<string | null>(null);
  // Precio propio que se está editando: "bracket-index" -> texto tipeado.
  // Por defecto suben los que tienen saldo: la pregunta que se le hace a esta
  // pantalla casi siempre es "a quién le falta cobrarle".
  const [sortBy, setSortBy] = useState<SortBy>("debt");
  const [priceDraft, setPriceDraft] = useState<Record<string, string>>({});
  // Nombre de un lugar puntual: se edita de a uno, y lo tipeado no se guarda
  // hasta confirmar, para no mandar un PATCH por cada tecla.
  const [nameEditing, setNameEditing] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState("");
  const [rowError, setRowError] = useState<{ guestId: string; message: string } | null>(null);
  // Modal de anotaciones: invitado abierto y lo tipeado, sin guardar hasta que
  // el anfitrión confirme.
  const [notesFor, setNotesFor] = useState<Guest | null>(null);
  const [notesText, setNotesText] = useState("");
  const [notesAmount, setNotesAmount] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  // Aviso antes de desmarcar cupos ya cargados (pasar a "no pago" o "exento").
  const [clearConfirm, setClearConfirm] = useState<
    { guest: Guest; status: string; marked: number } | null
  >(null);
  const [showPriceHelp, setShowPriceHelp] = useState(false);
  // Aviso antes de desmarcar un lugar concreto del desplegable.
  const [seatConfirm, setSeatConfirm] = useState<{ guestId: string; seat: Seat } | null>(null);
  const isMobile = useIsMobile();

  const openNotes = (guest: Guest) => {
    setNotesFor(guest);
    setNotesText(guest.hostNotes ?? "");
    setNotesAmount(guest.receivedAmount > 0 ? String(guest.receivedAmount) : "");
  };

  const saveNotes = async () => {
    if (!notesFor) return;
    const parsed = notesAmount.trim() === "" ? 0 : parseAmountInput(notesAmount);
    if (!Number.isFinite(parsed) || parsed < 0) return;
    hapticoConfirmar();
    setSavingNotes(true);
    await patchPayment(notesFor.id, { receivedAmount: parsed, notes: notesText.trim() || null });
    setSavingNotes(false);
    setNotesFor(null);
  };

  // Si el anfitrión ya lo cerró, no vuelve a aparecer nunca más. Se resuelve
  // acá y no en el estado inicial porque localStorage no existe cuando el
  // servidor arma el HTML; hasta que se sabe, `avisoVisible` es null y no se
  // dibuja nada, así que el aviso no llega a asomarse para desaparecer.
  useEffect(() => {
    try {
      setAvisoVisible(localStorage.getItem(AVISO_OCULTO_KEY) !== "1");
    } catch {
      setAvisoVisible(true);
    }
  }, []);

  const ocultarAvisoParaSiempre = () => {
    setConfirmarCierreAviso(false);
    setAvisoVisible(false);
    try {
      localStorage.setItem(AVISO_OCULTO_KEY, "1");
    } catch {
      // Modo privado o storage bloqueado: se cierra igual por ahora, y vuelve
      // a aparecer en la próxima carga. Mejor eso que romper el panel entero.
    }
  };


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
    payload:
      | { status: string }
      | {
          seat: {
            bracket: Bracket;
            index: number;
            paid?: boolean;
            override?: number | null;
            name?: string | null;
          };
        }
      | { receivedAmount: number; notes?: string | null }
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
        prev.map((g) => (g.id === guestId ? { ...g, ...data, paymentStatus: data.paymentStatus } : g))
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

  /**
   * "No pago" y "Exento" desmarcan todos los cupos. Si habia alguno marcado eso
   * borra trabajo del anfitrion y no se puede deshacer, asi que se avisa antes.
   */
  const requestPaymentChange = (guest: Guest, newStatus: string) => {
    const marked = guest.paidSeats ?? 0;
    if ((newStatus === "PENDING" || newStatus === "EXEMPT") && marked > 0) {
      setClearConfirm({ guest, status: newStatus, marked });
      return;
    }
    hapticoConfirmar();
    handlePaymentChange(guest.id, newStatus);
  };

  /** Marca o desmarca un lugar puntual. */
  const setSeatPaid = (guestId: string, seat: Seat, paid: boolean) => {
    // Al tocar y no cuando contesta el servidor: el golpecito es el acuse de
    // que el dedo dio en el lugar correcto, y llega tarde si espera la red.
    if (paid) hapticoConfirmar();
    else hapticoDeshacer();
    return patchPayment(guestId, { seat: { bracket: seat.bracket, index: seat.index, paid } });
  };

  /** Precio propio de un lugar. null lo devuelve al precio global de su franja. */
  const setSeatPrice = (guestId: string, seat: Seat, override: number | null) =>
    patchPayment(guestId, { seat: { bracket: seat.bracket, index: seat.index, override } });

  /** Nombre de quien ocupa un lugar. Vacío lo devuelve a "Adulto 2", "Niño 1". */
  const setSeatName = (guestId: string, seat: Seat, name: string) =>
    patchPayment(guestId, {
      seat: { bracket: seat.bracket, index: seat.index, name: name.trim() || null },
    });

  const openNameEditor = (seat: Seat, current: string) => {
    setNameEditing(`${seat.bracket}-${seat.index}`);
    setNameDraft(current);
  };

  const commitName = (guestId: string, seat: Seat, previous: string) => {
    setNameEditing(null);
    if (nameDraft.trim() === previous.trim()) return;
    setSeatName(guestId, seat, nameDraft);
  };

  // El invitado del modal se resuelve contra el estado vivo, no contra una copia
  // guardada al abrir: si no, los montos se quedaban con los del primer fetch.
  const detailGuest = detailFor ? guests.find((g) => g.id === detailFor) ?? null : null;

  const matching = guests.filter((g) => {
    const matchAttendance = attendanceFilter === "all" || g.status === attendanceFilter;
    const matchPayment = paymentFilter === "all" || (g.status === "CONFIRMED" && g.paymentStatus === paymentFilter);
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase());
    return matchAttendance && matchPayment && matchSearch;
  });

  const byName = (a: Guest, b: Guest) =>
    a.name.localeCompare(b.name, "es", { sensitivity: "base" });

  /**
   * Cuánto falta cobrarle. Ordena el modo "deben primero" y deja al final a
   * quien no debe nada: los pagos, los exentos y los que todavía no confirmaron
   * (que no tienen cupos, así que no deben).
   */
  const owed = (g: Guest) =>
    g.status === "CONFIRMED" && !g.isExempt ? g.pendingAmount ?? 0 : 0;

  // Sin precios cargados nadie "debe", así que ese orden no existe y se cae al
  // alfabético en vez de dejar la lista ordenada por un criterio vacío.
  const canSortByDebt = pagoTarjetaHabilitado && hasPrices;
  const effectiveSort: SortBy = sortBy === "debt" && !canSortByDebt ? "name" : sortBy;

  const filtered = [...matching].sort((a, b) => {
    if (effectiveSort === "name") return byName(a, b);
    if (effectiveSort === "recent") return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
    // "debt": primero los que tienen saldo, del que más debe al que menos, y
    // alfabético entre los que deben lo mismo (incluidos los que no deben nada).
    return owed(b) - owed(a) || byName(a, b);
  });

  useEffect(() => {
    setPage(1);
  }, [attendanceFilter, paymentFilter, search, sortBy]);

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
    // Los montos van como número plano, sin símbolo ni separador de miles, para
    // que Excel los sume sin tener que reformatear la columna.
    const money = (n: number) => String(Math.round(n));

    const header = pagoTarjetaHabilitado
      ? "Nombre;Estado;Personas;Pago;Cupos pagos;Cupos totales;Cobrado;Falta marcar;Total tarjeta;Recibido (tu registro);Notas;Restricciones alimentarias\n"
      : "Nombre;Estado;Personas;Pago;Restricciones alimentarias\n";

    const rows = guests
      .map((g) => {
        const confirmado = g.status === "CONFIRMED";
        const personas = confirmado ? g.attendingCount : g.expectedCount;
        const pago = confirmado
          ? PAYMENT_STATUS_LABELS[g.paymentStatus as CardPaymentStatus] ?? g.paymentStatus
          : "—";
        const paidSeats = g.paidSeats ?? 0;
        const totalSeats = g.totalSeats ?? 0;
        const exento = g.paymentStatus === "EXEMPT";

        return [
          escape(g.name),
          escape(STATUS_LABELS[g.status] ?? g.status),
          personas,
          escape(pago),
          ...(pagoTarjetaHabilitado
            ? [
                confirmado && !exento ? paidSeats : "",
                confirmado && !exento ? totalSeats : "",
                confirmado && !exento ? money(g.paidAmount) : "",
                confirmado && !exento ? money(g.pendingAmount) : "",
                confirmado && !exento ? money(g.totalAmount) : "",
                g.receivedAmount > 0 ? money(g.receivedAmount) : "",
                escape(g.hostNotes || ""),
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
          {/* Aviso plegable. Arranca cerrado y, si el anfitrión lo cierra con la
              cruz, no vuelve a aparecer en toda la sesión: es una explicación
              para leer una vez, no un cartel para esquivar en cada visita. */}
          {avisoVisible && (
          <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-900/10 border border-amber-500/30 text-amber-200/90 text-xs overflow-hidden transition-all duration-300 mb-5 shadow-[0_0_15px_rgba(245,158,11,0.05)]">
            <div className="flex items-center gap-1 pr-2">
              <button
                  type="button"
                  onClick={() => setShowPaymentInfo(!showPaymentInfo)}
                  aria-expanded={showPaymentInfo}
                  className="flex flex-1 items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-amber-500/15"
              >
                  <div className="flex items-center gap-2 font-medium">
                      <Info className="w-5 h-5 shrink-0 text-amber-400" />
                      <span className="text-amber-400 text-[13px]">Cómo funciona la gestión de pagos</span>
                  </div>
                  <div className="text-amber-400 opacity-80 shrink-0">
                      {showPaymentInfo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
              </button>
              {/* La cruz sólo con el aviso abierto: cerrado ya no molesta, y
                  tenerla siempre invita a descartarlo sin haberlo leído.
                  Pregunta antes, porque no hay forma de volver a traerlo. */}
              {showPaymentInfo && (
                <button
                  type="button"
                  onClick={() => setConfirmarCierreAviso(true)}
                  title="No volver a mostrar este aviso"
                  aria-label="No volver a mostrar este aviso"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-amber-400/80 transition-colors hover:bg-amber-500/20 hover:text-amber-300"
                >
                  <X className="h-4 w-4" strokeWidth={2} />
                </button>
              )}
            </div>

            {showPaymentInfo && (
                <div className="px-4 pb-5 pt-1 border-t border-amber-500/20 text-[13px] leading-relaxed opacity-95 space-y-3">
                    <p>
                      <strong>Importante:</strong> acá llevás tu propio control de quién te pagó. La plataforma <strong>no mueve dinero</strong>: lo que marcás es un registro tuyo, y lo que cargues mal queda a tu cargo.
                    </p>
                    <div className="w-full h-px bg-amber-500/20" />
                    <div className="space-y-2">
                      <p className="flex gap-2">
                          <span>👉</span>
                          <span>Los botones <strong>No pago / Parcial / Exento / Pagado</strong> cambian la tarjeta entera de una vez.</span>
                      </p>
                      <p className="flex gap-2">
                          <span>🧾</span>
                          <span>En <strong>Ver detalles</strong> marcás lugar por lugar, le ponés el nombre a cada uno y, si hace falta, no cobrarle o cobrarle un precio diferente a un invitado específico.</span>
                      </p>
                      <p className="flex gap-2">
                          <span>🔒</span>
                          <span>Lo que marcás pago queda al precio de ese momento. Si después subís los precios, sólo alcanza a los lugares que todavía no pagaron.</span>
                      </p>
                      <p className="flex gap-2">
                          <span>📝</span>
                          <span>En <strong>Anotaciones</strong> guardás cuánta plata te entregaron y notas sueltas. Eso no lo ve nadie más que vos.</span>
                      </p>
                      <p className="font-medium text-amber-300 flex gap-2">
                          <span>💡</span>
                          <span>El invitado ve en su invitación lo que realmente tiene que pagar, con los precios que le pusiste.</span>
                      </p>
                    </div>
                </div>
            )}
          </div>
          )}

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

      {/* Filtros + búsqueda. En mobile van apilados en bloques: buscador,
          asistencia y pago. Antes era una sola fila que envolvía donde caía y
          los dos grupos de pills se mezclaban entre sí. */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:gap-2">
        {/* La cruz para vaciar la busqueda es propia y no la nativa de
            type="search": esa no aparece en todos los navegadores, en el celular
            casi nunca, y con el tema oscuro se ve como una mancha clara. */}
        <div className="relative w-full md:w-auto md:min-w-[180px] md:flex-1">
          <input
            type="text"
            placeholder="Buscar invitado…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full rounded-full border bg-transparent px-4 py-2 text-sm ${search ? "pr-11" : ""}`}
            aria-label="Buscar invitado por nombre"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Borrar la búsqueda"
              className="absolute right-1.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          )}
        </div>

        {/* En celular van en grilla y no envolviendo: con flex-wrap los cuatro
            caían 3 + 1 y quedaban de anchos distintos según el largo del texto.
            En grilla todos miden lo mismo y las filas cierran parejas. */}
        <div
          className="grid grid-cols-2 gap-2 md:flex md:flex-wrap"
          role="group"
          aria-label="Filtrar por asistencia"
        >
          {(["all", "CONFIRMED", "PENDING", "DECLINED"] as const).map((f) => {
            const disabled = isAttendanceDisabled(f);
            const active = attendanceFilter === f;
            return (
              <button
                key={f}
                onClick={() => !disabled && toggleAttendance(f)}
                disabled={disabled}
                aria-pressed={active}
                className={`min-h-8 rounded-full border px-3 py-1 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${
                  active ? "bg-foreground text-background" : "hover:bg-muted/60"
                }`}
              >
                {f === "all" ? "Todos" : STATUS_LABELS[f]}
              </button>
            );
          })}
        </div>

        {pagoTarjetaHabilitado && (
          <div
            className="grid grid-cols-3 gap-2 md:flex md:flex-wrap"
            role="group"
            aria-label="Filtrar por estado de pago"
          >
            <span className="hidden self-stretch border-l md:block" aria-hidden="true" />
            {(["PAID", "PARTIAL", "PENDING"] as const).map((p) => {
              const disabled = isPaymentDisabled(p);
              const active = paymentFilter === p;
              return (
                <button
                  key={p}
                  onClick={() => !disabled && togglePayment(p)}
                  disabled={disabled}
                  aria-pressed={active}
                  className="min-h-8 rounded-full border px-3 py-1 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-35 hover:bg-muted/60"
                  style={active ? { background: PAYMENT_STATUS_COLORS[p], borderColor: PAYMENT_STATUS_COLORS[p], color: "#fff" } : undefined}
                >
                  {PAYMENT_FILTER_LABELS[p]}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Orden y descarga comparten renglón: ninguno de los dos filtra la lista
          y separados se comían dos líneas enteras arriba de los invitados. El
          texto del botón es corto para que en celular entre al lado del select. */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <label
            htmlFor="inv-orden"
            className="hidden shrink-0 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:block"
          >
            Ordenar por
          </label>
          <select
            id="inv-orden"
            value={effectiveSort}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            aria-label="Ordenar la lista"
            // El desplegable lo dibuja el sistema, no la pagina: con fondo
            // transparente lo pintaba blanco y sobre el tema oscuro las opciones
            // quedaban en blanco sobre blanco. `color-scheme` es lo que le avisa
            // al navegador de que lado esta el tema; el resto es por las dudas,
            // porque cada navegador hace lo suyo con este control.
            style={{ colorScheme: "dark" }}
            className="h-8 min-w-0 rounded-full border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted/60"
          >
            {(Object.keys(SORT_LABELS) as SortBy[])
              .filter((s) => s !== "debt" || canSortByDebt)
              .map((s) => (
                <option key={s} value={s} className="bg-background text-foreground">
                  {SORT_LABELS[s]}
                </option>
              ))}
          </select>
        </div>

        <button
          onClick={handleExportExcel}
          disabled={guests.length === 0}
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[11.5px] font-semibold text-muted-foreground transition-colors hover:bg-muted/60 disabled:cursor-default disabled:opacity-40"
          aria-label="Descargar lista completa de invitados en Excel"
        >
          <Download size={13} />
          Excel
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
            const paidSeatsCount = guest.paidSeats ?? 0;
            const totalSeatsCount = guest.totalSeats ?? 0;
            const asistencia = ASISTENCIA_PILL[guest.status]?.(guest);
            return (
            // Mismo lenguaje que las tarjetas de "Gestionar invitados": borde,
            // esquinas redondeadas y separación entre una y otra. Nada de
            // fondos ni acentos propios -- el panel puede ser claro u oscuro y
            // los colores los pone el tema.
            <div
              key={guest.id}
              className="border rounded-xl bg-card hover:bg-muted/50 transition-colors px-4 mb-2"
            >
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
                {/* El nombre ocupa su renglon entero y se recorta si no entra;
                    el pill baja al de abajo, arrancando siempre contra el borde
                    izquierdo de la tarjeta. Al lado del nombre no habia forma de
                    alinearlo: cada fila lo empujaba distinto, primero segun el
                    largo del nombre y despues segun cuanto ocupara el bloque de
                    pago de la derecha. */}
                <div className="truncate text-sm font-semibold" title={guest.name}>
                  {guest.name}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                  {asistencia && (
                    <span
                      className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.05em]"
                      style={{ background: `rgba(${asistencia.rgb}, 0.1)`, color: `rgb(${asistencia.rgb})` }}
                    >
                      {asistencia.texto}
                    </span>
                  )}
                  <span className="text-[11.5px] text-muted-foreground">
                    {guest.status === "CONFIRMED" && `${guest.attendingCount} persona${guest.attendingCount !== 1 ? "s" : ""}`}
                    {guest.dietaryRestrictions && (guest.status === "CONFIRMED" ? ` · ${guest.dietaryRestrictions}` : guest.dietaryRestrictions)}
                  </span>
                  {/* La mesa asignada, acá mismo. Sin pagos habilitados esta
                      columna está vacía y la pregunta más común del anfitrión
                      -- "¿dónde sentaron a los Pérez?" -- obligaba a cambiar de
                      pestaña. Con el detalle de lugares sólo si quedó repartida
                      entre varias: si va toda a una mesa, el número alcanza. */}
                  {(guest.lugaresEnMesas?.length ?? 0) > 0 && (
                    <span className="shrink-0 rounded-full border border-[var(--accent)]/35 bg-[var(--accent)]/10 px-2 py-0.5 text-[11px] font-semibold text-[var(--accent)]">
                      {guest.lugaresEnMesas!.length === 1
                        ? `Mesa ${guest.lugaresEnMesas![0].mesa.numero}`
                        : guest
                            .lugaresEnMesas!.map((l) => `Mesa ${l.mesa.numero} (${l.lugares})`)
                            .join(" · ")}
                    </span>
                  )}
                </div>
              </div>

              {/* Toggle de pago — solo visible si confirmó y si está habilitado */}
              {guest.status === "CONFIRMED" && pagoTarjetaHabilitado && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                  <span className="flex items-center gap-1 pr-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Estado de pago
                    {hasPrices && (
                      <button
                        type="button"
                        onClick={() => setShowPriceHelp(true)}
                        aria-label="Cómo funciona el precio de cada cupo"
                        className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-muted-foreground/50 text-[9px] font-bold leading-none transition-colors hover:bg-muted/60"
                      >
                        ?
                      </button>
                    )}
                  </span>
                  {/* El botón de anotaciones va en la misma línea que los
                      estados: es una acción de la fila, no del detalle de cupos. */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <div
                    className="inv-status-toggle"
                    role="group"
                    aria-label={`Estado de pago de ${guest.name}`}
                  >
                    {/* "Parcial" no se elige: sale de marcar cupos. Se muestra
                        para que el estado se vea, y tocarlo abre el desplegable
                        que es donde realmente se resuelve. */}
                    {/* Sin precios cargados no hay pagos parciales posibles:
                        quedan los tres estados de siempre. */}
                    {(hasPrices
                      ? (["PENDING", "PARTIAL", "EXEMPT", "PAID"] as const)
                      : (["PENDING", "EXEMPT", "PAID"] as const)
                    ).map((s) => (
                      <button
                        key={s}
                        onClick={() =>
                          s === "PARTIAL"
                            ? setDetailFor(guest.id)
                            : requestPaymentChange(guest, s)
                        }
                        disabled={updatingId === guest.id}
                        title={s === "PARTIAL" ? "Marcá cupos en el detalle para dejarla en parcial" : undefined}
                        // En celular el grupo ocupa todo el ancho, asi que los
                        // botones se lo reparten: sin esto quedaban con su ancho
                        // natural y sobraba un hueco muerto despues del ultimo.
                        // El alto minimo es para que se puedan tocar con el dedo.
                        className="max-sm:min-h-10 max-sm:flex-1"
                        style={{
                          padding: "6px 10px",
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

                  {hasPrices && !guest.isExempt && totalSeatsCount > 0 && (
                    <button
                      onClick={() => setDetailFor(guest.id)}
                      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted/60"
                    >
                      <ListChecks className="w-3.5 h-3.5" strokeWidth={1.75} />
                      Ver detalles
                    </button>
                  )}

                  <button
                    onClick={() => openNotes(guest)}
                    aria-label={`Anotaciones de ${guest.name}`}
                    title="Notas y monto recibido"
                    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted/60 ${
                      guest.hostNotes || guest.receivedAmount > 0 ? "border-foreground/40 text-foreground" : ""
                    }`}
                  >
                    <NotebookPen className="w-3.5 h-3.5" strokeWidth={1.75} />
                    Anotaciones
                  </button>
                  </div>

                  {/* Resumen de plata de la fila: texto, no control. Abrir el
                      detalle es un botón con etiqueta, arriba, junto a los otros
                      -- una flechita sola no dice qué va a pasar al tocarla. */}
                  {hasPrices && !guest.isExempt && totalSeatsCount > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {paidSeatsCount} de {totalSeatsCount} pago{totalSeatsCount !== 1 ? "s" : ""}
                      {guest.pendingAmount > 0 ? (
                        <>
                          {" · falta marcar "}
                          <b className="text-foreground">{formatARS(guest.pendingAmount)}</b>
                        </>
                      ) : guest.surplus > 0 ? (
                        <>{" · "}<b className="text-foreground">{formatARS(guest.surplus)} a favor</b></>
                      ) : null}
                    </span>
                  )}
                </div>
              )}
            </div>

            {rowError?.guestId === guest.id && (
              <div style={{ padding: "0 0 12px", fontSize: "11.5px", color: "#c0392b" }}>
                {rowError.message}
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

      {/* Detalle de pago, lugar por lugar. Va en modal y no desplegado en la
          fila porque con varias personas se comprimía todo entre un invitado y
          el siguiente. Acá cada lugar tiene su tilde de pago y su precio. */}
      <Dialog open={!!detailFor} onOpenChange={(open) => !open && setDetailFor(null)}>
        {/* Alto fijo a proposito: mide lo mismo con una tarjeta de dos lugares
            que con una de doce. Es el unico modal que se abre una y otra vez
            para distintos invitados, y si cambiara de alto cada vez, el resumen
            y el boton "Listo" saltarian de lugar en la pantalla entre uno y
            otro. Lo que sobra se desliza dentro de la lista. */}
        <DialogContent className="h-[80svh] sm:h-[min(85vh,34rem)]">
          <DialogHeader>
            <DialogTitle>{detailGuest?.name}</DialogTitle>
            <DialogDescription>
              Marcá qué lugares están pagos. Podés ponerle el nombre a cada uno y darle
              un precio propio distinto del general.
            </DialogDescription>
          </DialogHeader>

          {/* Solo la lista de lugares se desliza: el resumen de plata y el boton
              quedan fijos, asi el modal mide lo mismo con una familia de dos que
              con una de doce. */}
          <DialogBody className="space-y-1">
            {detailGuest?.seats.map((seat) => {
              const key = `${seat.bracket}-${seat.index}`;
              const draft = priceDraft[key];
              // En una tarjeta de una sola persona el lugar ES el invitado: decir
              // "Adulto 1" arriba de un modal que ya se titula con su nombre no
              // agrega nada. Con varios, sin nombre puesto queda la posición.
              const fallback = detailGuest.seats.length === 1 ? detailGuest.name : seat.label;
              const shown = seat.name ?? fallback;
              const editingName = nameEditing === key;
              return (
                // En celular el nombre se lleva su propia línea y el precio baja
                // abajo. En una sola línea, con el input y la etiqueta comiéndose
                // el ancho, un nombre de persona entraba recortado a dos o tres
                // letras -- justo el dato que se puso para poder leerlo.
                <div
                  key={key}
                  className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border px-3 py-2"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3 max-sm:w-full max-sm:flex-none">
                  <input
                    type="checkbox"
                    checked={seat.paid}
                    disabled={updatingId === detailGuest.id}
                    onChange={(e) => {
                      if (!e.target.checked) {
                        setSeatConfirm({ guestId: detailGuest.id, seat });
                      } else {
                        setSeatPaid(detailGuest.id, seat, true);
                      }
                    }}
                    aria-label={`${seat.label} pago`}
                    className="h-4 w-4 shrink-0 accent-current"
                  />
                  {editingName ? (
                    <Input
                      value={nameDraft}
                      autoFocus
                      maxLength={60}
                      placeholder={fallback}
                      onChange={(e) => setNameDraft(e.target.value)}
                      onBlur={() => commitName(detailGuest.id, seat, seat.name ?? "")}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") e.currentTarget.blur();
                        // Escape descarta lo tipeado: cerrar sin guardar tiene que
                        // ser posible, si no el unico modo de salir es guardar.
                        if (e.key === "Escape") {
                          setNameDraft(seat.name ?? "");
                          setNameEditing(null);
                        }
                      }}
                      aria-label={`Nombre de ${seat.label}`}
                      className="h-8 flex-1 text-sm"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => openNameEditor(seat, seat.name ?? "")}
                      // Toda la etiqueta abre la edicion, no solo el lapiz: en el
                      // celular apuntarle a un icono de 14px es una loteria.
                      title={seat.name ? "Cambiar el nombre" : "Ponerle nombre a este lugar"}
                      className="group flex min-w-0 flex-1 items-center gap-1.5 text-left"
                    >
                      <span
                        className={`truncate text-sm ${seat.name ? "font-medium" : ""} ${
                          seat.paid ? "text-muted-foreground line-through" : ""
                        }`}
                      >
                        {shown}
                      </span>
                      {/* Con nombre puesto, el "Niño 1" desaparece: el nombre lo
                          reemplaza, no lo acompaña. La franja se sigue leyendo en
                          el precio y en el orden de la lista. */}
                      <Pencil
                        className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-60 transition-opacity group-hover:opacity-100"
                        strokeWidth={1.75}
                      />
                    </button>
                  )}
                  </div>

                  {/* La etiqueta y el precio viajan juntos: en celular bajan a la
                      segunda línea, pegados a la derecha. */}
                  <div className="flex items-center gap-3 max-sm:w-full max-sm:justify-end">
                  {seat.override != null && !seat.paid && (
                    <span className="shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      precio editado
                    </span>
                  )}
                  {/* El botón va dentro del input, contra el borde izquierdo:
                      aparece sólo cuando el lugar tiene precio propio, y afuera
                      corría el input de lugar en lugar dejando la columna de
                      precios desalineada. El importe va a la derecha, así que
                      adentro no se pisan. */}
                  <div className="relative shrink-0">
                    <Input
                      value={draft !== undefined ? draft : String(Math.round(seat.price))}
                      onChange={(e) =>
                        setPriceDraft((d) => ({ ...d, [key]: sanitizeAmountInput(e.target.value) }))
                      }
                      onBlur={(e) => {
                        setPriceDraft((d) => {
                          const next = { ...d };
                          delete next[key];
                          return next;
                        });
                        const n = parseAmountInput(e.target.value);
                        if (!Number.isFinite(n) || n < 0) return;
                        if (Math.abs(n - seat.price) < 1) return;
                        setSeatPrice(detailGuest.id, seat, n);
                      }}
                      inputMode="decimal"
                      aria-label={`Precio de ${seat.label}`}
                      className={`h-8 w-28 text-right text-sm ${seat.override != null ? "pl-8" : ""}`}
                    />
                    {seat.override != null && (
                      <button
                        type="button"
                        // onMouseDown y no onClick: el input pierde el foco al
                        // tocarlo y su onBlur guardaría el precio que se está
                        // por descartar, pisando la vuelta al general.
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setSeatPrice(detailGuest.id, seat, null);
                        }}
                        title="Volver al precio general"
                        aria-label={`Volver ${seat.label} al precio general`}
                        className="absolute left-1 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                      >
                        <Undo2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                      </button>
                    )}
                  </div>
                  </div>
                </div>
              );
            })}
          </DialogBody>

          {detailGuest && (
            <div className="flex shrink-0 flex-wrap gap-x-3 gap-y-1 border-t pt-3 text-xs text-muted-foreground">
              <span>
                {detailGuest.paidSeats} de {detailGuest.totalSeats} pagos
              </span>
              <span>
                Cobrado: <b className="text-foreground">{formatARS(detailGuest.paidAmount)}</b>
              </span>
              {detailGuest.pendingAmount > 0 && (
                <span>
                  Falta marcar: <b className="text-foreground">{formatARS(detailGuest.pendingAmount)}</b>
                </span>
              )}
              <span>Total: {formatARS(detailGuest.totalAmount)}</span>
              {detailGuest.surplus > 0 && (
                <span>
                  <b className="text-foreground">{formatARS(detailGuest.surplus)}</b> a favor
                </span>
              )}
            </div>
          )}

          {detailGuest && detailGuest.receivedAmount > 0 && (
            <div className="flex shrink-0 flex-wrap gap-x-3 gap-y-1 border-t pt-3 text-xs text-muted-foreground">
              <span className="font-medium uppercase tracking-wide opacity-70">Tu registro</span>
              <span>
                recibiste <b className="text-foreground">{formatARS(detailGuest.receivedAmount)}</b>
              </span>
              {detailGuest.onAccount > 0 && (
                <span>
                  · recibiste <b className="text-foreground">{formatARS(detailGuest.onAccount)}</b> más de
                  lo que marcaste como pagado
                </span>
              )}
              {detailGuest.missingAmount > 0 && (
                <span>
                  · recibiste <b className="text-foreground">{formatARS(detailGuest.missingAmount)}</b> menos
                  de lo que marcaste como pagado
                </span>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setDetailFor(null)}>Listo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cerrar el aviso es definitivo y no hay desde dónde volver a abrirlo,
          asi que se avisa antes en vez de hacerlo desaparecer de un toque. */}
      <Dialog open={confirmarCierreAviso} onOpenChange={setConfirmarCierreAviso}>
        <DialogContent variant="centered" className="max-w-sm">
          <DialogHeader>
            <DialogTitle>¿Ocultar este aviso?</DialogTitle>
            <DialogDescription>
              No se va a volver a mostrar: ni al recargar, ni al volver a entrar más
              adelante con una sesión nueva. Es sólo la explicación de cómo funciona el
              panel — tus pagos y tus invitados no se tocan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setConfirmarCierreAviso(false)}>
              Mejor no
            </Button>
            <Button onClick={ocultarAvisoParaSiempre}>Sí, ocultar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Explica por qué el total de una tarjeta puede no ser "personas × precio
          de hoy". Es la duda que aparece apenas el anfitrión cambia un precio. */}
      <Dialog open={showPriceHelp} onOpenChange={setShowPriceHelp}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cómo se calcula lo que falta</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-3 text-sm">
                <p>
                  Cada lugar que marcás como pago queda registrado con el precio que la
                  tarjeta tenía <strong>en ese momento</strong>. Si más adelante subís el
                  valor, esos lugares no se tocan: ya están saldados.
                </p>
                <p>
                  El aumento alcanza <strong>solo a los lugares que siguen pendientes</strong>.
                </p>
                <p className="rounded-lg border bg-muted/40 p-3 text-xs">
                  Una familia de 3 paga 2 tarjetas cuando valían $10.000. Después subís la
                  tarjeta a $15.000. Esos 2 lugares siguen valiendo $10.000 y el que falta
                  pasa a $15.000: el total de esa familia queda en <strong>$35.000</strong>,
                  no en $45.000.
                </p>
                <p className="text-xs">
                  Por eso lo que ves como pendiente puede cambiar con el tiempo, mientras que
                  lo ya marcado no.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowPriceHelp(false)}>Entendido</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Aviso antes de desmarcar UN lugar del desplegable. Lo que se pierde no
          es solo el monto: es el precio con el que ese lugar quedó congelado. */}
      <Dialog open={!!seatConfirm} onOpenChange={(open) => !open && setSeatConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              ¿Desmarcar {seatConfirm?.seat.name ?? seatConfirm?.seat.label}?
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-3 text-sm">
                <p>
                  Ese lugar deja de estar pago
                  {seatConfirm && seatConfirm.seat.price > 0 ? (
                    <> y se descuentan <strong>{formatARS(seatConfirm.seat.price)}</strong> de lo cobrado</>
                  ) : null}
                  .
                </p>
                <p>
                  Si más adelante lo volvés a marcar, se cobra{" "}
                  <strong>al precio que tenga la tarjeta en ese momento</strong>, no al que
                  tiene ahora. Si el precio subió en el medio, va a costar más.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setSeatConfirm(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (seatConfirm) setSeatPaid(seatConfirm.guestId, seatConfirm.seat, false);
                setSeatConfirm(null);
              }}
            >
              Sí, desmarcar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Aviso antes de desmarcar cupos ya cargados: no hay deshacer. */}
      <Dialog open={!!clearConfirm} onOpenChange={(open) => !open && setClearConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {clearConfirm?.status === "EXEMPT" ? "¿Marcar como exento?" : "¿Pasar a no pago?"}
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-2">
                <p>
                  <strong>{clearConfirm?.guest.name}</strong> tiene{" "}
                  <strong>
                    {clearConfirm?.marked} cupo{clearConfirm?.marked !== 1 ? "s" : ""}
                  </strong>{" "}
                  marcado{clearConfirm?.marked !== 1 ? "s" : ""} como pago
                  {clearConfirm && clearConfirm.guest.paidAmount > 0
                    ? ` (${formatARS(clearConfirm.guest.paidAmount)})`
                    : ""}
                  . Se van a desmarcar todos y no se puede deshacer.
                </p>
                <p className="text-xs">
                  Tus anotaciones y el monto que registraste como recibido se conservan.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setClearConfirm(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                hapticoDeshacer();
                if (clearConfirm) handlePaymentChange(clearConfirm.guest.id, clearConfirm.status);
                setClearConfirm(null);
              }}
            >
              Sí, desmarcar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Anotaciones del anfitrión: notas libres + la plata que le fue
          entregando. Es su registro privado -- el invitado no ve nada de esto, y
          no mueve el estado de la tarjeta. */}
      <Dialog open={!!notesFor} onOpenChange={(open) => !open && setNotesFor(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Anotaciones de {notesFor?.name}</DialogTitle>
            <DialogDescription>
              Solo las ves vos. No cambian el estado de la tarjeta ni los cupos marcados.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {hasPrices && (
              <div className="space-y-1.5">
                <Label htmlFor="notas-monto">Plata recibida hasta ahora</Label>
                <Input
                  id="notas-monto"
                  type="text"
                  inputMode="decimal"
                  value={notesAmount}
                  onChange={(e) => setNotesAmount(sanitizeAmountInput(e.target.value))}
                  placeholder="Ej: 25000"
                />
                {notesFor && (
                  <p className="text-xs text-muted-foreground">
                    Los cupos que marcaste suman {formatARS(notesFor.paidAmount)}.
                  </p>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="notas-texto">Notas</Label>
              <textarea
                id="notas-texto"
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                rows={5}
                maxLength={2000}
                placeholder="Ej: Pagaron los dos adultos por transferencia. El resto lo traen el sábado."
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setNotesFor(null)}>
              Cancelar
            </Button>
            <Button onClick={saveNotes} disabled={savingNotes}>
              {savingNotes ? "Guardando…" : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
