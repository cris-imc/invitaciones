import { esCodigoPais, type CodigoPais } from "./paises";

/**
 * Los datos para que un cliente pague por transferencia, según su país.
 *
 * SALEN DE VARIABLES DE ENTORNO Y NO DEL CÓDIGO. No es por secreto -- son
 * datos que se le muestran a quien va a pagar --, sino por dos razones
 * concretas:
 *
 *  - El repositorio es público. El nombre legal completo junto al número de
 *    cuenta, indexado por Google, es material cómodo para que alguien arme
 *    una estafa haciéndose pasar por Alta Invitación.
 *  - Estos números cambian. Cambiar de banco no debería ser tocar el código,
 *    commitear y esperar un deploy: se editan en Railway y listo.
 *
 * Se leen en cada pedido (ver /api/cobro) y no al construir la app, para que
 * un cambio en Railway tenga efecto con un reinicio y no con un deploy.
 */

export interface DatoDeCobro {
  etiqueta: string;
  valor: string;
  /** Si conviene ofrecer el botón de copiar: un número de cuenta sí, "Corriente" no. */
  copiable: boolean;
}

export interface CobroDelPais {
  titular: string;
  banco: string;
  datos: DatoDeCobro[];
}

const leer = (nombre: string): string => (process.env[nombre] ?? "").trim();

/**
 * Qué variable corresponde a cada campo de cada país. El orden es el que se
 * muestra en pantalla.
 */
const CAMPOS: Record<CodigoPais, { etiqueta: string; env: string; copiable?: boolean }[]> = {
  AR: [
    { etiqueta: "Alias", env: "COBRO_AR_ALIAS" },
    { etiqueta: "CBU", env: "COBRO_AR_CBU" },
  ],
  CO: [
    { etiqueta: "Llave Bre-B", env: "COBRO_CO_LLAVE" },
    { etiqueta: "Número de cuenta", env: "COBRO_CO_CUENTA" },
  ],
  MX: [{ etiqueta: "CLABE", env: "COBRO_MX_CLABE" }],
  ES: [{ etiqueta: "IBAN", env: "COBRO_ES_IBAN" }],
  US: [
    { etiqueta: "Número de cuenta", env: "COBRO_US_CUENTA" },
    { etiqueta: "ABA / Routing", env: "COBRO_US_ABA" },
    { etiqueta: "Tipo de cuenta", env: "COBRO_US_TIPO", copiable: false },
  ],
  UY: [{ etiqueta: "Número de cuenta", env: "COBRO_UY_CUENTA" }],
};

/**
 * Los datos de cobro del país, o null si todavía no están cargados.
 *
 * Devolver null y no datos a medias es a propósito: media cuenta bancaria en
 * pantalla es peor que no ofrecer la transferencia, porque el cliente
 * transfiere a un número incompleto y el dinero se pierde en el limbo.
 */
export function cobroDe(pais: string | null | undefined): CobroDelPais | null {
  const p: CodigoPais = esCodigoPais(pais) ? pais : "AR";

  const titular = leer(`COBRO_${p}_TITULAR`);
  const banco = leer(`COBRO_${p}_BANCO`);
  if (!titular || !banco) return null;

  const datos: DatoDeCobro[] = [];
  for (const campo of CAMPOS[p]) {
    const valor = leer(campo.env);
    if (valor) datos.push({ etiqueta: campo.etiqueta, valor, copiable: campo.copiable ?? true });
  }
  if (datos.length === 0) return null;

  return { titular, banco, datos };
}
