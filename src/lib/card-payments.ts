/**
 * Pago de la tarjeta por CUPO.
 *
 * Una tarjeta agrupa a varias personas (2 adultos, 1 adolescente, 1 niño). El
 * anfitrión va marcando qué lugares quedaron saldados, y de ahí sale todo: el
 * estado, lo recaudado y lo que falta.
 *
 * Dos reglas, que son las que definen el modelo:
 *
 *   1. Lo que se pagó queda pagado. Cada lugar guarda el precio que regía cuando
 *      se marcó, y ese número no se recalcula nunca. Un aumento posterior no le
 *      llega.
 *   2. Lo pendiente sigue el precio vigente. Los lugares que todavía no se
 *      pagaron se valúan con el precio de hoy, así que un aumento los alcanza.
 *
 * El precio se guarda lugar por lugar (`Guest.paidSeatPrices`) y no como un
 * total por franja. Con un total había que promediar: si un cupo se pagó a
 * $3.000 y otro a $9.000, desmarcar uno devolvía $6.000, que no es lo que se
 * cobró por ninguno de los dos.
 */

export type CardPaymentStatus = "PENDING" | "PARTIAL" | "PAID" | "EXEMPT";

export const CARD_PAYMENT_LABELS: Record<CardPaymentStatus, string> = {
  PENDING: "No pago",
  PARTIAL: "Parcial",
  PAID: "Pagado",
  EXEMPT: "Exento",
};

export const CARD_PAYMENT_COLORS: Record<CardPaymentStatus, string> = {
  PENDING: "#B98B3E",
  PARTIAL: "#C2703A",
  PAID: "#5a8a6e",
  EXEMPT: "#8b8b8b",
};

/** Las tres franjas, en el orden en que se muestran. */
export const BRACKETS = ["adults", "teens", "children"] as const;
export type Bracket = (typeof BRACKETS)[number];

export const BRACKET_LABELS: Record<Bracket, { one: string; many: string }> = {
  adults: { one: "adulto", many: "adultos" },
  teens: { one: "adolescente", many: "adolescentes" },
  children: { one: "niño", many: "niños" },
};

export interface InvitationPrices {
  pagoTarjetaMonto?: number | null;
  regaloMonto?: number | null;
  precioAdolescente?: number | null;
  precioNino?: number | null;
}

/** Lo que necesita el cálculo de un invitado guardado. */
export interface StoredCardPayment {
  attendingCount?: number | null;
  attendingAdults?: number | null;
  attendingTeens?: number | null;
  attendingChildren?: number | null;
  /** JSON con el precio de cada lugar pago, por franja. Ver Guest.paidSeatPrices. */
  paidSeatPrices?: string | null;
  isExempt?: boolean | null;
  paymentStatus?: string | null;
  /** Registro del anfitrión: plata realmente recibida. Ver `onAccount`. */
  receivedAmount?: number | null;
}

/** Precio de cada lugar pago, por franja. */
export type SeatPrices = Record<Bracket, number[]>;

export function parseSeatPrices(raw?: string | null): SeatPrices {
  const empty: SeatPrices = { adults: [], teens: [], children: [] };
  if (!raw) return empty;
  try {
    const p = JSON.parse(raw) as Partial<Record<Bracket, unknown>>;
    const clean = (v: unknown) =>
      Array.isArray(v) ? v.map((n) => Math.max(0, Number(n) || 0)) : [];
    return { adults: clean(p.adults), teens: clean(p.teens), children: clean(p.children) };
  } catch {
    return empty;
  }
}

export function serializeSeatPrices(prices: SeatPrices): string {
  return JSON.stringify(prices);
}

/**
 * Precio de cada franja. El monto de la tarjeta es `pagoTarjetaMonto ?? regaloMonto`
 * (el panel edita `regaloMonto`), y adolescentes/niños sin precio propio pagan
 * como adulto.
 */
export function resolvePrices(invitation: InvitationPrices): Record<Bracket, number> {
  const adults = Number(invitation.pagoTarjetaMonto ?? invitation.regaloMonto ?? 0) || 0;
  return {
    adults,
    teens: invitation.precioAdolescente != null ? Number(invitation.precioAdolescente) || 0 : adults,
    children: invitation.precioNino != null ? Number(invitation.precioNino) || 0 : adults,
  };
}

/**
 * Cupos confirmados por franja. Un invitado sin desglose -- registros viejos, o
 * RSVP anteriores a los precios diferenciados -- cuenta todo como adultos.
 */
export function resolveSeats(guest: StoredCardPayment): Record<Bracket, number> {
  const adults = Math.max(0, guest.attendingAdults ?? 0);
  const teens = Math.max(0, guest.attendingTeens ?? 0);
  const children = Math.max(0, guest.attendingChildren ?? 0);
  if (adults + teens + children === 0) {
    return { adults: Math.max(0, guest.attendingCount ?? 0), teens: 0, children: 0 };
  }
  return { adults, teens, children };
}

/**
 * Precios de los lugares pagos, recortados a los cupos confirmados: si el
 * invitado baja la cantidad de personas después de pagar, sobran lugares
 * saldados y ese excedente pasa a ser plata a favor. Se conservan los primeros,
 * que son los que se pagaron antes.
 */
export function resolvePaidSeatPrices(guest: StoredCardPayment): SeatPrices {
  const seats = resolveSeats(guest);
  const stored = parseSeatPrices(guest.paidSeatPrices);
  return {
    adults: stored.adults.slice(0, seats.adults),
    teens: stored.teens.slice(0, seats.teens),
    children: stored.children.slice(0, seats.children),
  };
}

/** Cuántos lugares están pagos por franja. */
export function resolvePaidSeats(guest: StoredCardPayment): Record<Bracket, number> {
  const p = resolvePaidSeatPrices(guest);
  return { adults: p.adults.length, teens: p.teens.length, children: p.children.length };
}

/**
 * Precio exacto que se devuelve al desmarcar un lugar de esta franja: el del
 * ÚLTIMO que se marcó, que es el que se está deshaciendo. Nada de promedios --
 * cada lugar conserva lo que se cobró por él.
 */
export function refundForSeat(guest: StoredCardPayment, bracket: Bracket): number {
  const list = resolvePaidSeatPrices(guest)[bracket];
  return list.length > 0 ? list[list.length - 1] : 0;
}

export interface ResolvedCardPayment {
  seats: Record<Bracket, number>;
  paidSeats: Record<Bracket, number>;
  paidSeatPrices: SeatPrices;
  totalSeats: number;
  totalPaidSeats: number;
  /** Plata efectivamente cobrada (histórica, al precio de cada momento). */
  paidAmount: number;
  /** Lo que falta, valuado al precio vigente. */
  pendingAmount: number;
  /** Cobrado + pendiente. No es "cupos × precio de hoy". */
  totalAmount: number;
  /** Cobrado de más, cuando se bajaron asistentes después de pagar. */
  surplus: number;
  /** Lo que el anfitrión anotó como recibido (0 si no anotó nada). */
  receivedAmount: number;
  /** Recibido por encima de los cupos marcados: queda a cuenta. */
  onAccount: number;
  /** Recibido por debajo de lo marcado: probablemente marcó de más. */
  missingAmount: number;
  status: CardPaymentStatus;
}

/** Tolerancia en pesos, para que un redondeo no genere un saldo de $0,003. */
const EPSILON = 1;

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

export function resolveCardPayment(
  guest: StoredCardPayment,
  invitation: InvitationPrices
): ResolvedCardPayment {
  const prices = resolvePrices(invitation);
  const seats = resolveSeats(guest);
  const stored = parseSeatPrices(guest.paidSeatPrices);
  const paidSeatPrices = resolvePaidSeatPrices(guest);
  const paidSeats = {
    adults: paidSeatPrices.adults.length,
    teens: paidSeatPrices.teens.length,
    children: paidSeatPrices.children.length,
  };

  const totalSeats = seats.adults + seats.teens + seats.children;
  const totalPaidSeats = paidSeats.adults + paidSeats.teens + paidSeats.children;

  const paidAmount = BRACKETS.reduce((t, b) => t + sum(paidSeatPrices[b]), 0);
  // Lo cobrado por lugares que ya no existen (bajaron los asistentes).
  const surplus = BRACKETS.reduce((t, b) => t + sum(stored[b].slice(paidSeats[b])), 0);

  const pendingAmount = BRACKETS.reduce(
    (t, b) => t + (seats[b] - paidSeats[b]) * prices[b],
    0
  );

  // Solo la marca isExempt decide. Mirar también paymentStatus dejaba el estado
  // pegado: al escribir se resuelve con el guest ya guardado, cuyo paymentStatus
  // todavía dice "EXEMPT", así que sacar la exención volvía a dar EXEMPT.
  const isExempt = Boolean(guest.isExempt);
  const status: CardPaymentStatus = isExempt
    ? "EXEMPT"
    : totalSeats > 0 && totalPaidSeats >= totalSeats
      ? "PAID"
      : totalPaidSeats > 0
        ? "PARTIAL"
        : "PENDING";

  const receivedAmount = Math.max(0, Number(guest.receivedAmount ?? 0) || 0);
  const diff = receivedAmount > 0 ? receivedAmount - paidAmount : 0;

  return {
    seats,
    paidSeats,
    paidSeatPrices,
    totalSeats,
    totalPaidSeats,
    paidAmount,
    pendingAmount: pendingAmount >= EPSILON ? pendingAmount : 0,
    totalAmount: paidAmount + pendingAmount,
    surplus: surplus >= EPSILON ? surplus : 0,
    receivedAmount,
    onAccount: diff >= EPSILON ? diff : 0,
    missingAmount: -diff >= EPSILON ? -diff : 0,
    status,
  };
}

/**
 * Cómo quedan los lugares pagos al marcar o desmarcar.
 *
 * Los que se suman entran al precio VIGENTE. Los que se sacan salen por el
 * final -- el último que se marcó es el que se está deshaciendo -- y se llevan
 * exactamente lo que se había cobrado por ellos.
 */
export function applyPaidSeats(
  guest: StoredCardPayment,
  invitation: InvitationPrices,
  next: Partial<Record<Bracket, number>>
): { paidSeatPrices: string } {
  const prices = resolvePrices(invitation);
  const seats = resolveSeats(guest);
  const current = resolvePaidSeatPrices(guest);

  const out: SeatPrices = { adults: [], teens: [], children: [] };
  for (const b of BRACKETS) {
    const target = clamp(next[b] ?? current[b].length, 0, seats[b]);
    const list = current[b].slice(0, target);
    while (list.length < target) list.push(prices[b]);
    out[b] = list;
  }
  return { paidSeatPrices: serializeSeatPrices(out) };
}

export function computeBalance(pendingAmount: number): number {
  return pendingAmount >= EPSILON ? pendingAmount : 0;
}

export function formatARS(n: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(n);
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(Number(n) || 0)));
}
