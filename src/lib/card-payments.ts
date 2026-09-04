/**
 * Pago de la tarjeta por CUPO.
 *
 * Una tarjeta agrupa a varias personas (2 adultos, 1 adolescente, 1 niño). El
 * anfitrión va marcando cuántos lugares de cada franja quedaron saldados, y de
 * ahí sale todo: el estado, lo recaudado y lo que falta.
 *
 * Dos reglas, que son las que definen el modelo:
 *
 *   1. Lo que se pagó queda pagado. La plata cobrada por un cupo se guarda al
 *      precio que regía en ese momento (`paidAmount*`) y no se recalcula nunca.
 *      Un aumento posterior no le llega.
 *   2. Lo pendiente sigue el precio vigente. Los lugares que todavía no se
 *      pagaron se valúan con el precio de hoy, así que un aumento los alcanza.
 *
 * Por eso no hay precios congelados, ni fotos, ni escalados: la plata cobrada ES
 * el registro, y lo pendiente se calcula fresco cada vez.
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

/** Cupos confirmados y cuántos están pagos, tal como se guardan en Guest. */
export interface StoredCardPayment {
  attendingCount?: number | null;
  attendingAdults?: number | null;
  attendingTeens?: number | null;
  attendingChildren?: number | null;
  paidAdults?: number | null;
  paidTeens?: number | null;
  paidChildren?: number | null;
  paidAmountAdults?: number | null;
  paidAmountTeens?: number | null;
  paidAmountChildren?: number | null;
  isExempt?: boolean | null;
  paymentStatus?: string | null;
  /** Registro del anfitrión: plata realmente recibida. Ver `onAccount`. */
  receivedAmount?: number | null;
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
 * Cupos pagos, nunca por encima de los confirmados: si el invitado baja la
 * cantidad de personas después de pagar, sobran lugares saldados y el excedente
 * pasa a ser plata a favor.
 */
export function resolvePaidSeats(guest: StoredCardPayment): Record<Bracket, number> {
  const seats = resolveSeats(guest);
  return {
    adults: Math.min(seats.adults, Math.max(0, guest.paidAdults ?? 0)),
    teens: Math.min(seats.teens, Math.max(0, guest.paidTeens ?? 0)),
    children: Math.min(seats.children, Math.max(0, guest.paidChildren ?? 0)),
  };
}

export interface ResolvedCardPayment {
  seats: Record<Bracket, number>;
  paidSeats: Record<Bracket, number>;
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
  /**
   * Plata recibida por encima de los cupos ya marcados: queda a cuenta de pagos
   * futuros. Es solo informativo para el anfitrión -- no mueve el estado, porque
   * los cupos los marca él y esta diferencia puede ser una seña, un redondeo o
   * simplemente que todavía no marcó el cupo que corresponde.
   */
  onAccount: number;
  /** Recibido por debajo de lo marcado: probablemente marcó de más. */
  missingAmount: number;
  status: CardPaymentStatus;
}

/** Tolerancia en pesos, para que un redondeo no genere un saldo de $0,003. */
const EPSILON = 1;

export function resolveCardPayment(
  guest: StoredCardPayment,
  invitation: InvitationPrices
): ResolvedCardPayment {
  const prices = resolvePrices(invitation);
  const seats = resolveSeats(guest);
  const paidSeats = resolvePaidSeats(guest);

  const totalSeats = seats.adults + seats.teens + seats.children;
  const totalPaidSeats = paidSeats.adults + paidSeats.teens + paidSeats.children;

  // Lo cobrado por cada franja. Si sobran cupos pagos (bajaron la cantidad de
  // personas), se descuenta la parte proporcional y esa plata queda a favor.
  let paidAmount = 0;
  let surplus = 0;
  for (const b of BRACKETS) {
    const stored = Math.max(0, Number(guest[amountKey(b)] ?? 0) || 0);
    const declared = Math.max(0, guest[countKey(b)] ?? 0);
    if (declared > 0 && paidSeats[b] < declared) {
      const kept = stored * (paidSeats[b] / declared);
      paidAmount += kept;
      surplus += stored - kept;
    } else {
      paidAmount += stored;
    }
  }

  const pendingAmount = BRACKETS.reduce(
    (sum, b) => sum + (seats[b] - paidSeats[b]) * prices[b],
    0
  );

  const isExempt = Boolean(guest.isExempt) || guest.paymentStatus === "EXEMPT";
  const status: CardPaymentStatus = isExempt
    ? "EXEMPT"
    : totalSeats > 0 && totalPaidSeats >= totalSeats
      ? "PAID"
      : totalPaidSeats > 0
        ? "PARTIAL"
        : "PENDING";

  // Lo anotado por el anfitrión, contra lo que representan los cupos marcados.
  const receivedAmount = Math.max(0, Number(guest.receivedAmount ?? 0) || 0);
  const diff = receivedAmount > 0 ? receivedAmount - paidAmount : 0;

  return {
    seats,
    paidSeats,
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
 * Cómo quedan los cupos y los montos al marcar/desmarcar lugares.
 *
 * Los cupos que se suman se cobran al precio VIGENTE. Los que se sacan devuelven
 * lo que habían aportado (la parte proporcional de lo cobrado en esa franja), y
 * no el precio de hoy: si no, desmarcar despues de un aumento devolveria de mas.
 */
export function applyPaidSeats(
  guest: StoredCardPayment,
  invitation: InvitationPrices,
  next: Partial<Record<Bracket, number>>
): { paidAdults: number; paidTeens: number; paidChildren: number; paidAmountAdults: number; paidAmountTeens: number; paidAmountChildren: number } {
  const prices = resolvePrices(invitation);
  const seats = resolveSeats(guest);
  const current = resolvePaidSeats(guest);

  const out = {
    paidAdults: 0, paidTeens: 0, paidChildren: 0,
    paidAmountAdults: 0, paidAmountTeens: 0, paidAmountChildren: 0,
  };

  for (const b of BRACKETS) {
    const target = clamp(next[b] ?? current[b], 0, seats[b]);
    const stored = Math.max(0, Number(guest[amountKey(b)] ?? 0) || 0);
    const declared = Math.max(0, guest[countKey(b)] ?? 0);

    let amount: number;
    if (target >= declared) {
      // Se suman cupos: los nuevos entran al precio de hoy.
      amount = stored + (target - declared) * prices[b];
    } else if (declared > 0) {
      // Se sacan cupos: se devuelve lo que aportaron, no el precio de hoy.
      amount = stored * (target / declared);
    } else {
      amount = target * prices[b];
    }

    out[countKey(b)] = target;
    out[amountKey(b)] = round2(amount);
  }

  return out;
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

function countKey(b: Bracket) {
  return ({ adults: "paidAdults", teens: "paidTeens", children: "paidChildren" } as const)[b];
}

function amountKey(b: Bracket) {
  return ({ adults: "paidAmountAdults", teens: "paidAmountTeens", children: "paidAmountChildren" } as const)[b];
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(Number(n) || 0)));
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
