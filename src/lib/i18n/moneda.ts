import { PAISES, esCodigoPais, type CodigoPais } from "@/lib/paises";
import type { Idioma } from "./idiomas";

/**
 * Cómo se escribe un monto dentro de una invitación.
 *
 * EL PROBLEMA NO ES EL SÍMBOLO: el "$" se usa igual para pesos y para
 * dólares. El problema es el separador de miles. Argentina escribe
 * `$ 45.000` con punto para los miles; Estados Unidos usa el punto para los
 * decimales, así que ese mismo texto se lee como cuarenta y cinco. Es un
 * error de mil veces sobre un número que el invitado va a transferir.
 *
 * La moneda sale del país de la INVITACIÓN, no del idioma: una invitación
 * mexicana escrita en inglés cobra en pesos mexicanos, no en dólares.
 */

const LOCALES: Record<CodigoPais, Record<Idioma, string>> = {
  AR: { es: "es-AR", en: "en-US", pt: "pt-BR" },
  CL: { es: "es-CL", en: "en-US", pt: "pt-BR" },
  UY: { es: "es-UY", en: "en-US", pt: "pt-BR" },
  BR: { es: "es-AR", en: "en-US", pt: "pt-BR" },
  CO: { es: "es-CO", en: "en-US", pt: "pt-BR" },
  MX: { es: "es-MX", en: "en-US", pt: "pt-BR" },
  US: { es: "es-MX", en: "en-US", pt: "pt-BR" },
};

const MONEDAS: Record<CodigoPais, string> = {
  AR: "ARS",
  CL: "CLP",
  UY: "UYU",
  BR: "BRL",
  CO: "COP",
  MX: "MXN",
  US: "USD",
};

function normalizar(pais: string | null | undefined): CodigoPais {
  return esCodigoPais(pais) ? pais : "AR";
}

/** El monto con su símbolo: `$ 45.000`, `$45,000`, `R$ 45.000`. */
export function formatearMonto(n: number, pais: string | null | undefined, idioma: Idioma): string {
  const p = normalizar(pais);
  return new Intl.NumberFormat(LOCALES[p][idioma], {
    style: "currency",
    currency: MONEDAS[p],
    minimumFractionDigits: 0,
  }).format(n);
}

/** Un número sin moneda, sólo con el separador de miles que corresponde. */
export function formatearNumero(n: number, pais: string | null | undefined, idioma: Idioma): string {
  return new Intl.NumberFormat(LOCALES[normalizar(pais)][idioma]).format(n);
}

/** El nombre de la moneda, por si alguna pantalla necesita aclararlo. */
export function monedaDelPais(pais: string | null | undefined) {
  const p = normalizar(pais);
  return { codigo: MONEDAS[p], simbolo: PAISES[p].moneda.simbolo };
}
