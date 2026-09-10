import type { CodigoPais } from "./paises";
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

/** Precio de lista en dólares, para todos los países que no son Argentina. */
const PRECIOS_USD: Record<PlanTier, number> = {
  FREE: 0,
  PREMIUM: 39,
  DIAMOND: 49,
  DIAMOND_LIGHT: 0,
  ENTERPRISE: 0,
  ADMIN: 0,
};

/** Precio con el descuento vigente, en dólares. */
const PRECIOS_USD_CON_DESCUENTO: Record<"PREMIUM" | "DIAMOND", number> = {
  PREMIUM: 29,
  DIAMOND: 39,
};

export interface PrecioMostrable {
  monto: number;
  moneda: "ARS" | "USD";
}

export function esArgentina(pais: CodigoPais | null): boolean {
  return pais === "AR";
}

export function precioDePlan(planTier: PlanTier, pais: CodigoPais | null): PrecioMostrable {
  return esArgentina(pais)
    ? { monto: PLAN_LIMITS[planTier].price, moneda: "ARS" }
    : { monto: PRECIOS_USD[planTier], moneda: "USD" };
}

export function precioConDescuento(
  planTier: "PREMIUM" | "DIAMOND",
  pais: CodigoPais | null
): PrecioMostrable {
  if (esArgentina(pais)) {
    const monto = planTier === "PREMIUM" ? PREMIUM_DISCOUNT_PRICE : DIAMOND_DISCOUNT_PRICE;
    return { monto, moneda: "ARS" };
  }
  return { monto: PRECIOS_USD_CON_DESCUENTO[planTier], moneda: "USD" };
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
  const regional = precio.moneda === "ARS" ? "es-AR" : idioma === "en" ? "en-US" : idioma === "pt" ? "pt-BR" : "es-AR";
  return new Intl.NumberFormat(regional, {
    style: "currency",
    currency: precio.moneda,
    minimumFractionDigits: 0,
  }).format(precio.monto);
}
