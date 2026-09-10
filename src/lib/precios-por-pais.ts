import { PAISES, type CodigoPais } from "./paises";
import { PLAN_LIMITS, PREMIUM_DISCOUNT_PRICE, DIAMOND_DISCOUNT_PRICE, type PlanTier } from "./plan-limits";

/**
 * Los precios según el país de quien mira: pesos en Argentina, dólares en el
 * resto.
 *
 * POR QUÉ PRECIOS PROPIOS EN DÓLARES Y NO UNA CONVERSIÓN: convertir el precio
 * en pesos por una cotización da números feos que cambian todos los días
 * ("US$ 23,47" hoy, "US$ 24,11" mañana) y ata el precio internacional a la
 * inflación argentina, que no tiene nada que ver con lo que vale el producto
 * afuera. Se fijan a mano, se cambian a mano, y son estos dos números.
 *
 * ATENCIÓN: los montos en dólares de acá abajo son una PROPUESTA, no un
 * precio decidido. Es una decisión comercial del dueño del producto -- si los
 * quiere en otro valor, se cambian en este archivo y cambian en toda la app.
 */

/**
 * LA TARIFA DE CADA PAÍS, EN SU PROPIA MONEDA.
 *
 * Cada país cobra en lo suyo: un colombiano ve pesos colombianos, un mexicano
 * pesos mexicanos. Pagar en una moneda ajena le suma al cliente el costo de
 * cambio de su banco y, sobre todo, le hace dudar de cuánto va a terminar
 * pagando -- que en el checkout es donde se pierden las ventas.
 *
 * NO SE CONVIERTE POR COTIZACIÓN, se fijan a mano. Convertir da números feos
 * que cambian todos los días ("$ 156.234" hoy, "$ 158.901" mañana) y ata el
 * precio de afuera a la inflación argentina, que no tiene nada que ver con lo
 * que vale el producto allá.
 *
 * LA COMISIÓN NO ES IGUAL EN TODOS LADOS. En España y Estados Unidos el banco
 * que recibe se queda con una comisión fija por operación, así que el precio
 * la incluye: son 3 € y 3 USD adentro de los 25 € / 29 USD. En México las
 * cuentas no cobran esa comisión, así que ahí se cobra el equivalente neto y
 * nada más -- cargarle un costo que no existe sería cobrarle de más por ser
 * de otro país.
 *
 * COLOMBIA Y URUGUAY SON LA EXCEPCIÓN, y no por la comisión del banco: PayPal
 * no acepta sus monedas -- verificado contra la API, no contra la
 * documentación --, así que la orden se emite en dólares por la tarifa de
 * Estados Unidos. Si el precio que ven fuera el neto, verían el equivalente
 * de 25,78 USD y en el checkout de PayPal les aparecerían 29: el número
 * cambiaría entre la promesa y el cobro, que es justo donde se pierden las
 * ventas. Por eso su precio local iguala a lo que PayPal va a cobrar, y en
 * pantalla lleva un asterisco aclarando que el cobro es en dólares (ver
 * cobraEnOtraMoneda).
 *
 * ATENCIÓN, ESTO ES UNA DECISIÓN COMERCIAL, NO TÉCNICA. España se fijó a mano
 * (25 € y 30 €, ya con la comisión adentro) y de ahí salieron los demás.
 *
 * LA REFERENCIA ES ESPAÑA: 25 € y 30 € finales, fijados a mano. Todo lo demás
 * es ese mismo valor convertido, no un precio inventado por país.
 *
 * COTIZACIONES USADAS (verificadas por el dueño):
 *   1 USD = 0,86 euros  ->  1 EUR = 1,163 dólares
 *   1 USD = 3.103 pesos colombianos
 *   1 USD = 16,98 pesos mexicanos
 *   1 USD = 40,25 pesos uruguayos
 *
 * Los montos se redondearon hacia arriba a números vendibles, así que quedan
 * unos puntos por encima del equivalente exacto: ese margen es justamente el
 * que se come la comisión de PayPal.
 *
 * Las cotizaciones se mueven. Cuando alguna se corra mucho, se ajustan los
 * montos acá y cambian en toda la app.
 */

interface Tarifa {
  PREMIUM: number;
  DIAMOND: number;
}

/**
 * El precio de lista: el que se muestra tachado arriba del vigente.
 *
 * La referencia es España, que es donde se fijó el precio a mano (25 € y 30 €
 * finales). El resto sale de ahí, no de convertir el precio argentino: la
 * inflación argentina no dice cuánto vale el producto afuera.
 */
const LISTA: Record<CodigoPais, Tarifa> = {
  AR: { PREMIUM: PLAN_LIMITS.PREMIUM.price, DIAMOND: PLAN_LIMITS.DIAMOND.price },
  CO: { PREMIUM: 115000, DIAMOND: 140000 },
  MX: { PREMIUM: 575, DIAMOND: 715 },
  UY: { PREMIUM: 1490, DIAMOND: 1820 },
  ES: { PREMIUM: 32, DIAMOND: 39 },
  US: { PREMIUM: 37, DIAMOND: 45 },
};

/** Precio con el descuento vigente: lo que realmente paga el cliente. */
const CON_DESCUENTO: Record<CodigoPais, Tarifa> = {
  AR: { PREMIUM: PREMIUM_DISCOUNT_PRICE, DIAMOND: DIAMOND_DISCOUNT_PRICE },
  CO: { PREMIUM: 90000, DIAMOND: 109000 },
  MX: { PREMIUM: 435, DIAMOND: 535 },
  UY: { PREMIUM: 1170, DIAMOND: 1410 },
  ES: { PREMIUM: 25, DIAMOND: 30 },
  US: { PREMIUM: 29, DIAMOND: 35 },
};

/** El país del que salen los precios cuando todavía no se sabe cuál es. */
const POR_DEFECTO: CodigoPais = "AR";

export interface PrecioMostrable {
  monto: number;
  moneda: string;
}

export function esArgentina(pais: CodigoPais | null): boolean {
  return pais === "AR";
}

function paisDePrecio(pais: CodigoPais | null): CodigoPais {
  return pais ?? POR_DEFECTO;
}

export function precioDePlan(planTier: PlanTier, pais: CodigoPais | null): PrecioMostrable {
  const p = paisDePrecio(pais);
  const moneda = PAISES[p].moneda.codigo;

  // Sólo Premium y Diamond se cobran; el resto de los planes vale cero y no
  // tiene tarifa propia por país.
  if (planTier !== "PREMIUM" && planTier !== "DIAMOND") {
    return { monto: 0, moneda };
  }
  return { monto: LISTA[p][planTier], moneda };
}

export function precioConDescuento(
  planTier: "PREMIUM" | "DIAMOND",
  pais: CodigoPais | null
): PrecioMostrable {
  const p = paisDePrecio(pais);
  return { monto: CON_DESCUENTO[p][planTier], moneda: PAISES[p].moneda.codigo };
}

/**
 * El precio escrito como lo escribe cada lugar: "$ 35.000" en Argentina,
 * "US$ 29" afuera.
 *
 * El formato lo arma Intl con la configuración regional que corresponde, así
 * el separador de miles y la posición del símbolo salen bien solos -- en
 * español el punto separa miles, en inglés la coma, y escribirlo a mano
 * garantiza equivocarse en uno de los dos.
 */
export function formatearPrecio(precio: PrecioMostrable, idioma: string): string {
  // Para el español se usa es-AR y no es-419: el genérico escribe "USD 39" y
  // el argentino "US$ 39", que es como se escribe en toda Latinoamérica y
  // coincide con lo que ya sale en portugués.
  // Cada moneda con la convención de su lugar: el euro lleva el símbolo
  // detrás ("39 €"), el peso mexicano no separa con espacio, el dólar se
  // escribe "US$" y no "USD" en Latinoamérica.
  const REGIONALES: Record<string, string> = {
    ARS: "es-AR",
    COP: "es-CO",
    MXN: "es-MX",
    UYU: "es-UY",
    EUR: "es-ES",
    USD: idioma === "en" ? "en-US" : "es-AR",
  };
  const regional = REGIONALES[precio.moneda] ?? "es-AR";
  return new Intl.NumberFormat(regional, {
    style: "currency",
    currency: precio.moneda,
    minimumFractionDigits: 0,
  }).format(precio.monto);
}

/**
 * Las monedas nuestras que PayPal acepta como moneda de cobro.
 *
 * PayPal tiene una lista cerrada y ni el peso colombiano, ni el uruguayo, ni
 * el argentino están en ella. Mandarle una orden en COP la rechaza: el
 * cliente llega al checkout y no puede pagar, que es el peor lugar donde
 * puede fallar algo.
 *
 * Verificar contra la lista oficial de PayPal antes de sumar un país nuevo.
 */
const PAYPAL_ACEPTA = new Set(["USD", "EUR", "MXN"]);

/**
 * Lo que se le cobra por PayPal, que puede no ser lo que se le MUESTRA.
 *
 * A un colombiano se le muestra el precio en pesos colombianos -- que es lo
 * que entiende y con lo que compara -- pero PayPal no puede cobrar en esa
 * moneda, así que la orden va en dólares por el equivalente. La diferencia
 * hay que avisarla en pantalla antes de mandarlo al checkout: ver un precio
 * en pesos y que PayPal pida dólares, sin aviso, parece un error o una
 * estafa.
 */
export function precioParaPayPal(
  planTier: "PREMIUM" | "DIAMOND",
  pais: CodigoPais | null
): PrecioMostrable {
  const local = precioConDescuento(planTier, pais);
  if (PAYPAL_ACEPTA.has(local.moneda)) return local;

  // El equivalente en dólares es la tarifa de Estados Unidos, que es la que
  // está fijada en esa moneda.
  return precioConDescuento(planTier, "US");
}

/** Si al cliente se le muestra una moneda y PayPal le va a cobrar en otra. */
export function cobraEnOtraMoneda(pais: CodigoPais | null): boolean {
  return precioConDescuento("PREMIUM", pais).moneda !== precioParaPayPal("PREMIUM", pais).moneda;
}
