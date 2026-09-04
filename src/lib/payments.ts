/**
 * Pago de tarjeta por invitado -- soporta pagos parciales.
 *
 * Regla central: el dinero recibido vive en `Guest.paidAmount` y el estado
 * (`Guest.paymentStatus`) se DERIVA de el con `derivePaymentStatus()`. Nunca se
 * escribe un estado que contradiga el monto: si hay dos fuentes de verdad,
 * tarde o temprano se contradicen (un PAID con 0 cobrado, o un PENDING con
 * plata en la cuenta).
 *
 * El monto esperado se calcula una sola vez aca (`computeExpectedAmount`) para
 * que el panel del anfitrion y la invitacion del invitado siempre coincidan:
 * antes el wizard cobraba por franja de edad y el panel multiplicaba plano por
 * attendingCount, asi que la recaudacion mostrada no cerraba cuando habia
 * precios de nino/adolescente cargados.
 *
 * Modulo sin dependencias de servidor: lo importan tanto las rutas de API como
 * los componentes cliente.
 */

export type PaymentStatus = "PENDING" | "PARTIAL" | "PAID" | "EXEMPT";

/**
 * Código que devuelven las rutas (409) cuando el cambio pedido pondría en cero
 * un monto ya registrado -- pasar a "no pago" o marcar exento a alguien que ya
 * entregó plata. No se guarda salvo que el cliente reintente con
 * `confirmClearPayment: true`.
 *
 * El guardarraíl vive acá y no en cada panel porque la pérdida es irreversible
 * (no hay historial de pagos, solo el monto acumulado) y hay más de una
 * pantalla que puede provocarla.
 */
export const PAYMENT_CLEAR_CODE = "PAYMENT_WOULD_BE_CLEARED";

/** Tolerancia en pesos para comparar montos (evita que 499999.999 quede PARTIAL). */
const EPSILON = 1;

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "No pago aún",
  PARTIAL: "Parcial",
  EXEMPT: "Exento",
  PAID: "Pagado",
};

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PENDING: "#B98B3E",
  PARTIAL: "#C2703A",
  EXEMPT: "#8b8b8b",
  PAID: "#5a8a6e",
};

/** Cantidad de personas confirmadas, por franja. */
export interface GuestCounts {
  attendingCount?: number | null;
  attendingAdults?: number | null;
  attendingTeens?: number | null;
  attendingChildren?: number | null;
}

/** Precios cargados en la invitacion (los campos que usan las plantillas). */
export interface InvitationPrices {
  pagoTarjetaMonto?: number | null;
  regaloMonto?: number | null;
  precioAdolescente?: number | null;
  precioNino?: number | null;
}

/**
 * Precio por franja. Replica la resolucion que ya hacian las plantillas y el
 * wizard: el monto de tarjeta es `pagoTarjetaMonto ?? regaloMonto` (el panel
 * edita `regaloMonto`), y adolescentes/ninos sin precio propio pagan como
 * adulto.
 */
export function resolveCardPrices(invitation: InvitationPrices) {
  const adult = Number(invitation.pagoTarjetaMonto ?? invitation.regaloMonto ?? 0) || 0;
  const teen = invitation.precioAdolescente != null ? Number(invitation.precioAdolescente) || 0 : adult;
  const child = invitation.precioNino != null ? Number(invitation.precioNino) || 0 : adult;
  return { adult, teen, child };
}

/**
 * Monto total que le corresponde pagar a un invitado (o a su grupo/familia).
 * Si el invitado no tiene desglose por franja -- registros viejos, o RSVP
 * hechos antes de los precios diferenciados -- se cobra `attendingCount` a
 * precio de adulto.
 */
export function computeExpectedAmount(guest: GuestCounts, invitation: InvitationPrices): number {
  const { adult, teen, child } = resolveCardPrices(invitation);

  const adults = guest.attendingAdults ?? 0;
  const teens = guest.attendingTeens ?? 0;
  const children = guest.attendingChildren ?? 0;

  if (adults + teens + children === 0) {
    return adult * (guest.attendingCount ?? 0);
  }

  return adult * adults + teen * teens + child * children;
}

/**
 * Estado de pago derivado del monto abonado. `EXEMPT` es una marca del
 * anfitrion (el invitado no paga), no un monto: gana sobre cualquier calculo.
 */
export function derivePaymentStatus({
  paidAmount,
  expectedAmount,
  isExempt,
}: {
  paidAmount?: number | null;
  expectedAmount?: number | null;
  isExempt?: boolean | null;
}): PaymentStatus {
  if (isExempt) return "EXEMPT";

  const paid = Number(paidAmount ?? 0) || 0;
  const expected = Number(expectedAmount ?? 0) || 0;

  if (paid <= 0) return "PENDING";
  // Sin monto esperado (invitacion sin precio cargado) cualquier pago se toma
  // como pago completo: no hay un total contra el que comparar.
  if (expected <= 0) return "PAID";
  if (paid >= expected - EPSILON) return "PAID";
  return "PARTIAL";
}

/**
 * Saldo pendiente, nunca negativo. Diferencias menores a EPSILON se toman como
 * cero: al escalar las tarifas congeladas quedan residuos de coma flotante
 * (30500.000000000004 contra 30500) que si no se filtran terminan a la vista
 * como un "falta $0" sin sentido.
 */
export function computeBalance(paidAmount?: number | null, expectedAmount?: number | null): number {
  const paid = Number(paidAmount ?? 0) || 0;
  const expected = Number(expectedAmount ?? 0) || 0;
  const balance = expected - paid;
  return balance >= EPSILON ? balance : 0;
}

/** Plata cobrada de más, con la misma tolerancia: evita el "$0 a favor". */
export function computeSurplus(paidAmount?: number | null, expectedAmount?: number | null): number {
  const paid = Number(paidAmount ?? 0) || 0;
  const expected = Number(expectedAmount ?? 0) || 0;
  const surplus = paid - expected;
  return surplus >= EPSILON ? surplus : 0;
}

export function formatARS(n: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(n);
}

/** Lo que necesita `resolveGuestPayment` de un invitado guardado. */
export interface StoredGuestPayment extends GuestCounts {
  status?: string | null;
  isExempt?: boolean | null;
  paymentStatus?: string | null;
  paidAmount?: number | null;
  expectedAmount?: number | null;
  /** JSON de los precios congelados al quedar paga (ver resolveExpectedAmount). */
  paidPrices?: string | null;
}

export interface ResolvedGuestPayment {
  expectedAmount: number;
  paidAmount: number;
  balance: number;
  status: PaymentStatus;
}

/**
 * Resuelve el pago de un invitado ya guardado, tolerando registros previos a
 * los pagos parciales. Es la unica forma en que el resto de la app deberia leer
 * montos de pago.
 *
 * Compatibilidad hacia atras (importante): en produccion el schema se aplica
 * con `prisma db push`, que crea las columnas nuevas pero no corre el backfill
 * de la migracion. Entonces un invitado marcado PAID antes de este cambio llega
 * con `paidAmount = 0`; tomarlo literal mostraria "recaudado $0" a clientes que
 * ya cobraron todo. Aca ese caso se interpreta como pago completo.
 */
export function resolveGuestPayment(
  guest: StoredGuestPayment,
  invitation: InvitationPrices
): ResolvedGuestPayment {
  const storedPaid = Number(guest.paidAmount ?? 0) || 0;

  const expectedAmount = resolveExpectedAmount({
    guest,
    invitation,
    paidPrices: guest.paidPrices,
    paidAmount: storedPaid,
    paymentStatus: guest.paymentStatus,
  });

  const isLegacyPaid = storedPaid <= 0 && guest.paymentStatus === "PAID";
  const paidAmount = isLegacyPaid ? expectedAmount : storedPaid;

  return {
    expectedAmount,
    paidAmount,
    balance: computeBalance(paidAmount, expectedAmount),
    status: derivePaymentStatus({
      paidAmount,
      expectedAmount,
      isExempt: guest.isExempt || guest.paymentStatus === "EXEMPT",
    }),
  };
}

/**
 * Foto del momento en que la tarjeta quedo paga (columna Guest.paidPrices):
 * los precios de ese dia y CUANTOS cupos quedaron cubiertos con ellos.
 *
 * Los cupos importan tanto como los precios: si despues se suma un asistente,
 * ese lugar nuevo no estaba pago, asi que se cobra al precio vigente. El
 * congelamiento cubre lo que se pago, no la invitacion entera para siempre.
 */
export interface FrozenSnapshot {
  adult: number;
  teen: number;
  child: number;
  /** Cupos pagos por franja. Ausentes en registros previos a este cambio. */
  adults?: number;
  teens?: number;
  children?: number;
}

/** Cantidades por franja, con el mismo fallback que computeExpectedAmount(). */
export function normalizeCounts(guest: GuestCounts) {
  const adults = guest.attendingAdults ?? 0;
  const teens = guest.attendingTeens ?? 0;
  const children = guest.attendingChildren ?? 0;
  if (adults + teens + children === 0) {
    return { adults: guest.attendingCount ?? 0, teens: 0, children: 0 };
  }
  return { adults, teens, children };
}

/**
 * Foto a guardar cuando la tarjeta queda paga: congela TODOS los cupos actuales.
 *
 * `settledTotal` es lo que efectivamente se pago. Puede no coincidir con el
 * precio vigente: si dos cupos se habian pagado a $10.000 y el tercero se paga
 * con la tarjeta ya a $15.000, la tarjeta se salda en $35.000 y no en $45.000.
 * Los precios se escalan para que el total congelado sea exactamente ese, y asi
 * un aumento posterior no la reabre. Se escala manteniendo la proporcion entre
 * franjas, para no aplanar adulto/adolescente/nino a un promedio.
 */
export function serializePaidPrices(
  invitation: InvitationPrices,
  guest: GuestCounts,
  settledTotal?: number
): string {
  const live = resolveCardPrices(invitation);
  const counts = normalizeCounts(guest);
  const liveTotal = computeExpectedAmount(guest, invitation);
  const factor =
    settledTotal != null && settledTotal > 0 && liveTotal > 0 ? settledTotal / liveTotal : 1;

  return JSON.stringify({
    adult: live.adult * factor,
    teen: live.teen * factor,
    child: live.child * factor,
    adults: counts.adults,
    teens: counts.teens,
    children: counts.children,
  });
}

export function parsePaidPrices(raw?: string | null): FrozenSnapshot | null {
  if (!raw) return null;
  try {
    const p = JSON.parse(raw) as Partial<FrozenSnapshot>;
    const adult = Number(p.adult) || 0;
    if (adult <= 0) return null;
    const snap: FrozenSnapshot = { adult, teen: Number(p.teen) || adult, child: Number(p.child) || adult };
    if (p.adults != null || p.teens != null || p.children != null) {
      snap.adults = Number(p.adults) || 0;
      snap.teens = Number(p.teens) || 0;
      snap.children = Number(p.children) || 0;
    }
    return snap;
  } catch {
    return null;
  }
}

/**
 * Total que le corresponde pagar hoy a un invitado.
 *
 * Lo que se congela al quedar paga la tarjeta son los PRECIOS, no el total.
 * Congelar el total estaba mal: tambien absorbia los cambios de asistentes, asi
 * que alguien que pagaba y despues sumaba dos personas seguia debiendo $0.
 *
 * El congelamiento se aplica CUPO POR CUPO, no a la invitacion entera:
 *   - los lugares que ya estaban pagos mantienen su precio, asi que una suba
 *     posterior no les cobra diferencia;
 *   - los lugares que se suman despues se cobran al precio vigente, porque ese
 *     lugar nunca se pago;
 *   - si se restan lugares, se cobran menos, y lo entregado de mas queda a favor.
 *
 * Sobre los cupos ya pagos se cobra el menor entre el precio congelado y el
 * vigente: el congelamiento protege de los aumentos, pero una BAJA de precio se
 * traslada igual.
 */
export function resolveExpectedAmount({
  guest,
  invitation,
  paidPrices,
  paidAmount,
  paymentStatus,
}: {
  guest: GuestCounts;
  invitation: InvitationPrices;
  paidPrices?: string | null;
  paidAmount?: number | null;
  paymentStatus?: string | null;
}): number {
  // Sin foto no se adivina: reconstruirla desde los cupos actuales daba mal
  // apenas la cantidad de asistentes ya había cambiado (decía "pago, debe $0"
  // cuando en realidad debía la persona nueva). Un invitado pagado antes de que
  // existiera `paidPrices` queda cubierto por la via legacy de
  // resolveGuestPayment, que lo mantiene pago.
  void paidAmount;
  void paymentStatus;

  const snap = parsePaidPrices(paidPrices);
  if (!snap) return computeExpectedAmount(guest, invitation);

  const live = resolveCardPrices(invitation);
  const now = normalizeCounts(guest);
  // Registros previos a que se guardaran los cupos: se asume que todo lo
  // confirmado hoy estaba pago (el comportamiento anterior).
  const paid = snap.adults != null
    ? { adults: snap.adults, teens: snap.teens ?? 0, children: snap.children ?? 0 }
    : now;

  const bill = (nowQty: number, paidQty: number, frozenPrice: number, livePrice: number) =>
    Math.min(nowQty, paidQty) * Math.min(frozenPrice, livePrice) +
    Math.max(0, nowQty - paidQty) * livePrice;

  return (
    bill(now.adults, paid.adults, snap.adult, live.adult) +
    bill(now.teens, paid.teens, snap.teen, live.teen) +
    bill(now.children, paid.children, snap.child, live.child)
  );
}
