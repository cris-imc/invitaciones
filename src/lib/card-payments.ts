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
 *   n = nombre de quien ocupa el lugar (null: se muestra "Adulto 2", "Niño 1")
 */
interface StoredSeat {
  o: number | null;
  p: number | null;
  n: string | null;
}

type StoredSeats = Record<Bracket, StoredSeat[]>;

/** Hasta dónde se guarda un nombre de lugar. */
const MAX_SEAT_NAME = 60;

function cleanSeatName(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const name = v.trim().slice(0, MAX_SEAT_NAME);
  return name === "" ? null : name;
}

/** Un lugar ya resuelto, listo para mostrar. */
export interface Seat {
  bracket: Bracket;
  index: number;
  /** "Adulto 2", "Niño 1" -- la posición, siempre presente. */
  label: string;
  /** Nombre que le puso el anfitrión. null = se muestra el label. */
  name: string | null;
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
              n: cleanSeatName(seat.n),
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
    while (list.length < counts[b]) list.push({ o: null, p: null, n: null });
    out[b] = list;
  }
  return out;
}

/**
 * Los lugares listos para trabajar, con la compatibilidad hacia atrás aplicada.
 *
 * Antes el pago era de la tarjeta entera (Guest.paymentStatus), sin detalle por
 * lugar: un invitado marcado PAID llega acá con seatDetails vacío y, tomado
 * literal, se mostraría como impago. Se interpreta como lo que significaba:
 * todos sus lugares están pagos. Al precio de hoy, porque el modelo viejo no
 * guardaba cuánto se cobró.
 *
 * Está acá y no solo en la lectura porque escribir tiene que partir de la misma
 * interpretación: si no, desmarcar un lugar de una tarjeta vieja arrancaba de
 * cero y se llevaba puesto el pago de todos los demás.
 *
 * Solo aplica mientras nadie haya tocado el pago desde el panel nuevo: en cuanto
 * se marca o desmarca un lugar, seatDetails deja de estar vacío y este camino no
 * vuelve a usarse.
 */
function resolveSeats(
  guest: StoredCardPayment,
  prices: Record<Bracket, number>,
  counts: Record<Bracket, number>
): StoredSeats {
  const seats = alignSeats(parseSeats(guest.seatDetails), counts);
  if (!guest.seatDetails && guest.paymentStatus === "PAID") {
    for (const b of BRACKETS) {
      for (const seat of seats[b]) {
        if (seat.p == null) seat.p = seat.o ?? prices[b];
      }
    }
  }
  return seats;
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
  const aligned = resolveSeats(guest, prices, seatCounts);

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
        name: s.n,
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
  /** Nombre de quien ocupa el lugar. `null` o vacío lo vuelve a "Niño 1". */
  name?: string | null;
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
  const seats = resolveSeats(guest, prices, counts);

  const list = seats[change.bracket];
  const seat = list[change.index];
  if (!seat) return { seatDetails: serializeSeats(seats) };

  if (change.override !== undefined) {
    seat.o = change.override == null ? null : Math.max(0, Number(change.override) || 0);
    // Si ya estaba pago, cambiar su precio corrige lo cobrado por ese lugar: es
    // el anfitrión diciendo cuánto valía en realidad.
    if (seat.p != null) seat.p = seat.o ?? prices[change.bracket];
  }

  if (change.name !== undefined) {
    seat.n = cleanSeatName(change.name);
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

/**
 * Lo que tiene que ver el invitado en su invitación.
 *
 * La plantilla calculaba el total sola, multiplicando el precio de cada franja
 * por cuánta gente venía. Eso ignora los precios propios por lugar: si el
 * anfitrión le puso $0 al hijo menor de una familia, la familia igual veía el
 * precio de niño en su invitación y no lo que realmente iba a pagar.
 *
 * Se arma en el servidor, con el mismo resolvedor que usa el panel, así los dos
 * lados no pueden discrepar. Sólo tiene sentido con cupos ya confirmados: antes
 * de confirmar no hay lugares y la plantilla sigue estimando con los precios
 * generales, que es lo correcto mientras el invitado todavía elige cuántos van.
 */
export interface GuestPaymentView {
  total: number;
  paid: number;
  pending: number;
  /**
   * El desglose ya escrito ("2 adultos × $30.000", "Jorge · $0"). Va armado y no
   * en partes porque lo consumen 177 plantillas: cuanto menos tenga que decidir
   * cada una, menos formas hay de que una quede distinta de las otras.
   */
  lines: string[];
}

export function resolveGuestPaymentView(
  guest: StoredCardPayment,
  invitation: InvitationPrices
): GuestPaymentView | null {
  const resolved = resolveCardPayment(guest, invitation);
  if (resolved.totalSeats === 0) return null;

  const lines: string[] = [];
  for (const b of BRACKETS) {
    const seats = resolved.seats.filter((s) => s.bracket === b);
    if (seats.length === 0) continue;

    // Si todos los lugares de la franja valen lo mismo alcanza con una línea
    // ("2 adultos × $15.000"). Con un precio distinto en el medio esa cuenta
    // deja de cerrar, así que ahí se enumeran los lugares uno por uno.
    const uniform = seats.every((s) => s.price === seats[0].price);
    if (uniform) {
      const { one, many } = BRACKET_LABELS[b];
      const noun = seats.length === 1 ? one.toLowerCase() : many.toLowerCase();
      lines.push(`${seats.length} ${noun} × ${formatARS(seats[0].price)}`);
    } else {
      for (const s of seats) lines.push(`${s.name ?? s.label} · ${formatARS(s.price)}`);
    }
  }

  return {
    total: resolved.totalAmount,
    paid: resolved.paidAmount,
    pending: resolved.pendingAmount,
    lines,
  };
}
