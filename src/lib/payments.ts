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

/** Saldo pendiente, nunca negativo (un sobrepago no genera saldo a favor). */
export function computeBalance(paidAmount?: number | null, expectedAmount?: number | null): number {
  const paid = Number(paidAmount ?? 0) || 0;
  const expected = Number(expectedAmount ?? 0) || 0;
  return Math.max(0, expected - paid);
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
  const expectedAmount = guest.expectedAmount != null
    ? Number(guest.expectedAmount) || 0
    : computeExpectedAmount(guest, invitation);

  const storedPaid = Number(guest.paidAmount ?? 0) || 0;
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
