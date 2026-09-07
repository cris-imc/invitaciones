/**
 * Pago de la tarjeta, LUGAR POR LUGAR.
 *
 * Una tarjeta agrupa a varias personas (2 adultos, 1 adolescente, 1 niño) y cada
 * lugar se maneja por separado: se marca pago de a uno, y puede tener un precio
 * propio distinto del global de la invitación.
 *
 * Tres reglas definen el modelo:
 *
 *   1. Lo que se pagó queda pagado. Al marcar un lugar se guarda el precio que
 *      regía en ese momento y no se recalcula nunca. Un aumento posterior no le
 *      llega.
 *   2. Lo pendiente sigue el precio vigente, así que un aumento sí alcanza a los
 *      lugares que todavía no se pagaron.
 *   3. Un lugar puede tener precio propio. Sirve para no cobrarle a un chico de
 *      una familia puntual, o hacerle un precio especial, sin tocar el precio
 *      global ni eximir la tarjeta entera.
 *
 * Se guarda lugar por lugar y no un total por franja porque el total obliga a
 * promediar: si un niño se cobró a $3.000 y otro a $9.000, desmarcar uno tenía
 * que devolver $6.000, que no es lo que se cobró por ninguno de los dos.
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
  adults: { one: "Adulto", many: "Adultos" },
  teens: { one: "Adolescente", many: "Adolescentes" },
  children: { one: "Niño", many: "Niños" },
};

export interface InvitationPrices {
  pagoTarjetaMonto?: number | null;
  regaloMonto?: number | null;
  precioAdolescente?: number | null;
  precioNino?: number | null;
}

export interface StoredCardPayment {
  attendingCount?: number | null;
  attendingAdults?: number | null;
  attendingTeens?: number | null;
  attendingChildren?: number | null;
  /** JSON con el detalle de cada lugar. Ver Guest.seatDetails. */
  seatDetails?: string | null;
  isExempt?: boolean | null;
  paymentStatus?: string | null;
  /** Registro del anfitrión: plata realmente recibida. Ver `onAccount`. */
  receivedAmount?: number | null;
}

/**
 * Cómo se guarda cada lugar. Formato compacto porque va serializado:
 *   o = precio propio de este lugar (null: usa el precio global de su franja)
 *   p = lo que se cobró al marcarlo pago (null: todavía no está pago)
 */
interface StoredSeat {
  o: number | null;
  p: number | null;
}

type StoredSeats = Record<Bracket, StoredSeat[]>;

/** Un lugar ya resuelto, listo para mostrar. */
export interface Seat {
  bracket: Bracket;
  index: number;
  /** "Adulto 2", "Niño 1" */
  label: string;
  /** Precio propio, si el anfitrión se lo puso. null = sigue el global. */
  override: number | null;
  paid: boolean;
  /** Lo que vale hoy: lo cobrado si está pago, o el precio que le corresponde. */
  price: number;
}

const emptySeats = (): StoredSeats => ({ adults: [], teens: [], children: [] });

function parseSeats(raw?: string | null): StoredSeats {
  if (!raw) return emptySeats();
  try {
    const parsed = JSON.parse(raw) as Partial<Record<Bracket, unknown>>;
    const clean = (v: unknown): StoredSeat[] =>
      Array.isArray(v)
        ? v.map((s) => {
            const seat = (s ?? {}) as Partial<StoredSeat>;
            return {
              o: seat.o == null ? null : Math.max(0, Number(seat.o) || 0),
              p: seat.p == null ? null : Math.max(0, Number(seat.p) || 0),
            };
          })
        : [];
    return {
      adults: clean(parsed.adults),
      teens: clean(parsed.teens),
      children: clean(parsed.children),
    };
  } catch {
    return emptySeats();
  }
}

function serializeSeats(seats: StoredSeats): string {
  return JSON.stringify(seats);
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
export function resolveSeatCounts(guest: StoredCardPayment): Record<Bracket, number> {
  const adults = Math.max(0, guest.attendingAdults ?? 0);
  const teens = Math.max(0, guest.attendingTeens ?? 0);
  const children = Math.max(0, guest.attendingChildren ?? 0);
  if (adults + teens + children === 0) {
    return { adults: Math.max(0, guest.attendingCount ?? 0), teens: 0, children: 0 };
  }
  return { adults, teens, children };
}

/**
 * Ajusta la lista guardada a los cupos confirmados. Si el invitado sumó gente,
 * los lugares nuevos entran vacíos; si restó, los que sobran se descartan (lo
 * que se hubiera cobrado por ellos queda como plata a favor).
 */
function alignSeats(stored: StoredSeats, counts: Record<Bracket, number>): StoredSeats {
  const out = emptySeats();
  for (const b of BRACKETS) {
    const list = stored[b].slice(0, counts[b]);
    while (list.length < counts[b]) list.push({ o: null, p: null });
    out[b] = list;
  }
  return out;
}

export interface ResolvedCardPayment {
  seats: Seat[];
  seatCounts: Record<Bracket, number>;
  totalSeats: number;
  paidSeats: number;
  /** Plata efectivamente cobrada (histórica, al precio de cada momento). */
  paidAmount: number;
  /** Lo que falta, valuado al precio que le corresponde hoy a cada lugar. */
  pendingAmount: number;
  totalAmount: number;
  /** Cobrado por lugares que ya no existen (bajaron los asistentes). */
  surplus: number;
  receivedAmount: number;
  /** Recibido por encima de lo marcado: queda a cuenta. */
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
  const seatCounts = resolveSeatCounts(guest);
  const stored = parseSeats(guest.seatDetails);
  const aligned = alignSeats(stored, seatCounts);

  const seats: Seat[] = [];
  let paidAmount = 0;
  let pendingAmount = 0;
  let paidSeats = 0;

  for (const b of BRACKETS) {
    aligned[b].forEach((s, i) => {
      const paid = s.p != null;
      const price = paid ? (s.p as number) : s.o ?? prices[b];
      if (paid) {
        paidAmount += price;
        paidSeats += 1;
      } else {
        pendingAmount += price;
      }
      seats.push({
        bracket: b,
        index: i,
        label: `${BRACKET_LABELS[b].one} ${i + 1}`,
        override: s.o,
        paid,
        price,
      });
    });
  }

  // Lo cobrado por lugares que ya no existen: bajaron los asistentes.
  const surplus = BRACKETS.reduce(
    (t, b) => t + stored[b].slice(seatCounts[b]).reduce((n, s) => n + (s.p ?? 0), 0),
    0
  );

  const totalSeats = seatCounts.adults + seatCounts.teens + seatCounts.children;

  // Solo la marca isExempt decide. Mirar también paymentStatus dejaba el estado
  // pegado: al escribir se resuelve con el guest ya guardado, cuyo paymentStatus
  // todavía dice "EXEMPT", así que sacar la exención volvía a dar EXEMPT.
  const isExempt = Boolean(guest.isExempt);
  const status: CardPaymentStatus = isExempt
    ? "EXEMPT"
    : totalSeats > 0 && paidSeats >= totalSeats
      ? "PAID"
      : paidSeats > 0
        ? "PARTIAL"
        : "PENDING";

  const receivedAmount = Math.max(0, Number(guest.receivedAmount ?? 0) || 0);
  const diff = receivedAmount > 0 ? receivedAmount - paidAmount : 0;

  return {
    seats,
    seatCounts,
    totalSeats,
    paidSeats,
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

/** Cambio sobre un lugar puntual. */
export interface SeatChange {
  bracket: Bracket;
  index: number;
  /** Marcar o desmarcar como pago. */
  paid?: boolean;
  /** Precio propio del lugar. `null` lo devuelve al precio global. */
  override?: number | null;
}

/**
 * Aplica un cambio sobre un lugar.
 *
 * Marcarlo pago congela el precio que le corresponde en ese momento (el propio
 * si tiene, si no el global). Desmarcarlo lo suelta, y si más adelante se vuelve
 * a marcar se cobra al precio que rija entonces.
 */
export function applySeatChange(
  guest: StoredCardPayment,
  invitation: InvitationPrices,
  change: SeatChange
): { seatDetails: string } {
  const prices = resolvePrices(invitation);
  const counts = resolveSeatCounts(guest);
  const seats = alignSeats(parseSeats(guest.seatDetails), counts);

  const list = seats[change.bracket];
  const seat = list[change.index];
  if (!seat) return { seatDetails: serializeSeats(seats) };

  if (change.override !== undefined) {
    seat.o = change.override == null ? null : Math.max(0, Number(change.override) || 0);
    // Si ya estaba pago, cambiar su precio corrige lo cobrado por ese lugar: es
    // el anfitrión diciendo cuánto valía en realidad.
    if (seat.p != null) seat.p = seat.o ?? prices[change.bracket];
  }

  if (change.paid !== undefined) {
    seat.p = change.paid ? seat.o ?? prices[change.bracket] : null;
  }

  return { seatDetails: serializeSeats(seats) };
}

/** Marca o desmarca TODOS los lugares. Los atajos del panel pasan por acá. */
export function applyAllSeats(
  guest: StoredCardPayment,
  invitation: InvitationPrices,
  paid: boolean
): { seatDetails: string } {
  const prices = resolvePrices(invitation);
  const counts = resolveSeatCounts(guest);
  const seats = alignSeats(parseSeats(guest.seatDetails), counts);

  for (const b of BRACKETS) {
    for (const seat of seats[b]) {
      seat.p = paid ? seat.o ?? prices[b] : null;
    }
  }
  return { seatDetails: serializeSeats(seats) };
}

export function formatARS(n: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(n);
}
