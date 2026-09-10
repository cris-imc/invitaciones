import { PAISES, esCodigoPais, type CampoBancario, type CodigoPais } from "./paises";

/**
 * Puente entre la definición de campos por país (paises.ts) y cómo se guardan
 * y se muestran los datos bancarios de una invitación.
 *
 * POR QUÉ UN JSON Y NO COLUMNAS: cada país pide campos distintos -- Argentina
 * CBU y alias, España un IBAN, Estados Unidos routing y account number.
 * Fijarlos como columnas obliga a agregar una por cada campo de cada país, y a
 * migrar la base cada vez que se suma un país. El JSON guarda `{clave: valor}`
 * con las claves que define paises.ts.
 *
 * POR QUÉ SE MANTIENEN LAS COLUMNAS VIEJAS: hay invitaciones vivas con
 * regaloCbu/regaloAlias cargados y sus links ya están en el WhatsApp de sus
 * invitados. Borrarlas rompería lo único que este producto no puede romper.
 * Así que se leen como respaldo cuando el JSON está vacío, y las invitaciones
 * viejas siguen andando sin tocarlas.
 */

export type Seccion = "regalo" | "pagoTarjeta";

export interface DatoBancario {
  clave: string;
  etiqueta: string;
  valor: string;
  /** Para el botón de copiar: un CBU se copia, "Cuenta Corriente" no. */
  copiable: boolean;
}

/** Lo que sabe una invitación sobre sus datos bancarios. */
export interface FuenteDeDatos {
  pais?: string | null;
  regaloDatosBancarios?: string | null;
  pagoTarjetaDatosBancarios?: string | null;
  regaloBanco?: string | null;
  regaloCbu?: string | null;
  regaloAlias?: string | null;
  regaloTitular?: string | null;
  pagoTarjetaBanco?: string | null;
  pagoTarjetaCbu?: string | null;
  pagoTarjetaAlias?: string | null;
  pagoTarjetaTitular?: string | null;
}

/** El país de una invitación, con Argentina como respaldo. */
export function paisDe(fuente: Pick<FuenteDeDatos, "pais">): CodigoPais {
  return esCodigoPais(fuente.pais) ? fuente.pais : "AR";
}

/** Los campos que hay que pedirle a alguien de este país. */
export function camposDelPais(pais: CodigoPais): CampoBancario[] {
  return PAISES[pais].camposBancarios;
}

/**
 * Un valor sólo se puede copiar si es un dato que se pega en otro lado. Una
 * opción de una lista ("Cuenta Corriente") no: ofrecer copiarla es ruido.
 */
function esCopiable(campo: CampoBancario): boolean {
  return campo.validacion.tipo !== "opciones";
}

export function leerJson(crudo: string | null | undefined): Record<string, string> {
  if (!crudo) return {};
  try {
    const v: unknown = JSON.parse(crudo);
    if (!v || typeof v !== "object" || Array.isArray(v)) return {};
    const salida: Record<string, string> = {};
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      if (typeof val === "string") salida[k] = val;
    }
    return salida;
  } catch {
    // Un JSON roto no puede tumbar una invitación que ya está en manos de sus
    // invitados: se muestra sin datos bancarios y listo.
    return {};
  }
}

export function escribirJson(valores: Record<string, string>): string | null {
  const limpios = Object.fromEntries(
    Object.entries(valores).filter(([, v]) => (v ?? "").trim() !== "")
  );
  return Object.keys(limpios).length === 0 ? null : JSON.stringify(limpios);
}

/**
 * Los datos bancarios de una sección, listos para mostrar.
 *
 * "Banco" y "Titular" van siempre al final y aparte de paises.ts: no son un
 * campo de identificación de cuenta sino contexto que se muestra igual en
 * todos lados, y ya tienen columna propia desde antes.
 */
export function datosParaMostrar(fuente: FuenteDeDatos, seccion: Seccion): DatoBancario[] {
  const pais = paisDe(fuente);
  const guardados = leerJson(
    seccion === "regalo" ? fuente.regaloDatosBancarios : fuente.pagoTarjetaDatosBancarios
  );

  const legado = {
    cbu: (seccion === "regalo" ? fuente.regaloCbu : fuente.pagoTarjetaCbu) ?? "",
    alias: (seccion === "regalo" ? fuente.regaloAlias : fuente.pagoTarjetaAlias) ?? "",
  };

  const salida: DatoBancario[] = [];

  for (const campo of camposDelPais(pais)) {
    // El respaldo sólo aplica a Argentina: son las dos columnas que existían.
    const valor = guardados[campo.clave] || (pais === "AR" ? legado[campo.clave as "cbu" | "alias"] ?? "" : "");
    if (!valor.trim()) continue;
    salida.push({ clave: campo.clave, etiqueta: campo.etiqueta, valor, copiable: esCopiable(campo) });
  }

  const banco = (seccion === "regalo" ? fuente.regaloBanco : fuente.pagoTarjetaBanco) ?? "";
  const titular = (seccion === "regalo" ? fuente.regaloTitular : fuente.pagoTarjetaTitular) ?? "";
  if (banco.trim()) salida.push({ clave: "banco", etiqueta: "Banco", valor: banco, copiable: false });
  if (titular.trim()) salida.push({ clave: "titular", etiqueta: "Titular", valor: titular, copiable: false });

  return salida;
}

/** Si hay algo que mostrar. Para decidir si se dibuja la sección entera. */
export function tieneDatos(fuente: FuenteDeDatos, seccion: Seccion): boolean {
  return datosParaMostrar(fuente, seccion).length > 0;
}
