import type { CodigoPais } from "./paises";
import { PAISES } from "./paises";

/**
 * Qué aplica y qué no en cada país: medios de pago, cuotas, y qué funciones
 * tiene sentido ofrecer.
 *
 * POR QUÉ EXISTE: hay cosas del producto que son argentinas y no viajan.
 *
 * 1. "Hasta 3 cuotas sin interés" es una campaña de Mercado Pago Argentina.
 *    Mostrárselo a un colombiano es prometerle una forma de pago que no va a
 *    existir cuando llegue al checkout. Una promesa de pago que no se cumple
 *    es peor que no hacerla.
 *
 *
 *
 * LO QUE NO ESTÁ ACÁ, Y POR QUÉ: la gestión de pagos. Se pensó en apagarla
 * fuera de Argentina, porque para casamientos y quince en el resto de
 * Latinoamérica no se le cobra al invitado. Pero la función no depende del
 * país sino del EVENTO: una cena de egresados o un evento corporativo sí
 * pueden cobrarse en cualquier lado. Queda ofrecida en todos los países y
 * la prende el anfitrión si le sirve.
 *
 * ESTE ARCHIVO ES UNA DECISIÓN DE PRODUCTO, NO UN DATO VERIFICADO. Los flags
 * de costumbre los definió el dueño del producto. Si mañana se confirma que
 * en Uruguay también se cobra la tarjeta, se cambia acá y cambia en toda la
 * app, sin buscar carteles por el código.
 *
 * Sobre los medios de pago: Argentina cobra por Mercado Pago y por
 * transferencia; el resto del mundo, por PayPal. No es una preferencia
 * estética -- una cuenta común de Mercado Pago Argentina directamente no
 * puede cobrarle a alguien de otro país. El detalle y las fuentes están en
 * docs/PLAN-INTERNACIONAL.md.
 */

export interface CostumbresDelPais {
  /** En cuántas cuotas sin interés se puede pagar, o null si no aplica. */
  cuotasSinInteres: number | null;
  /** Si se le puede cobrar al anfitrión hoy, y cómo. */
  mediosDePago: ("mercadopago" | "transferencia" | "paypal")[];

}

// Argentina tiene los tres. PayPal también acá, como alternativa para quien
// ya lo usa; las cuotas sin interés siguen siendo sólo de Mercado Pago.
const ARGENTINA: CostumbresDelPais = {
  cuotasSinInteres: 3,
  mediosDePago: ["mercadopago", "transferencia", "paypal"],
};

// Todo lo que no es Argentina.
//
// PayPal y no Mercado Pago, y no es una preferencia: una cuenta común de
// Mercado Pago Argentina no puede cobrarle a un comprador de otro país. MP
// no convierte monedas -- una preferencia en ARS le cobra ese número en
// pesos argentinos -- y el checkout argentino pide un tipo de documento
// argentino. Existe el producto Cross Border, que sí sirve, pero la cuenta
// la crea el equipo de MP a pedido y todavía no está (ver
// docs/PLAN-INTERNACIONAL.md).
//
// Sin cuotas: las cuotas sin interés son una campaña de Mercado Pago
// Argentina y no existen ni en PayPal ni en una transferencia.
//
// La TRANSFERENCIA sí va, y es un cambio: antes estaba sólo en Argentina
// porque la única cuenta cargada era argentina y no le servía a nadie de
// afuera. Ahora hay una cuenta local en cada país (ver lib/cobro.ts), así que
// un colombiano transfiere a una cuenta colombiana. Es importante que esté:
// PayPal no tiene la penetración que tiene en Estados Unidos en el resto de
// los países de la lista, y sin transferencia se pierde esa venta.
const FUERA_DE_ARGENTINA: CostumbresDelPais = {
  cuotasSinInteres: null,
  mediosDePago: ["paypal", "transferencia"],
};

const POR_PAIS: Record<CodigoPais, CostumbresDelPais> = {
  AR: ARGENTINA,
  UY: FUERA_DE_ARGENTINA,
  CO: FUERA_DE_ARGENTINA,
  MX: FUERA_DE_ARGENTINA,
  ES: FUERA_DE_ARGENTINA,
  US: FUERA_DE_ARGENTINA,
};

export function costumbresDe(pais: CodigoPais): CostumbresDelPais {
  return POR_PAIS[pais];
}

/**
 * Lo que corresponde mostrarle a alguien de quien todavía no sabemos el país
 * (un visitante anónimo en la landing).
 *
 * Es lo mismo que fuera de Argentina, y a propósito: ante la duda no se
 * promete nada que pueda no cumplirse. Prometer de menos se corrige cuando se
 * registra y dice de dónde es; prometer de más -- unas cuotas sin interés que
 * después no están -- se descubre en el checkout, que es el peor momento
 * posible.
 */
export const ANTE_LA_DUDA: CostumbresDelPais = FUERA_DE_ARGENTINA;

export function costumbresDeVisitante(pais: CodigoPais | null): CostumbresDelPais {
  return pais ? costumbresDe(pais) : ANTE_LA_DUDA;
}

/** La moneda del país, para mostrar precios. */
export function monedaDe(pais: CodigoPais) {
  return PAISES[pais].moneda;
}
