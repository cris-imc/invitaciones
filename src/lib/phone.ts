import { PAISES, esCodigoPais, type CodigoPais } from "./paises";

/**
 * El teléfono del anfitrión.
 *
 * ES OPCIONAL, y a propósito: no se le manda nada automático a ese número --
 * ni WhatsApp ni SMS --, el login no lo usa y la recuperación de clave va por
 * email. Sirve sólo para que el dueño del producto pueda contactar a un
 * cliente. Exigirlo en el registro es una barrera al principio del embudo a
 * cambio de un dato que se puede pedir después, y ya existe
 * PhoneReminderModal, que se lo pide al entrar al panel a quien no lo tenga.
 *
 * LAS REGLAS DEPENDEN DEL PAÍS. Las que había eran argentinas -- código de
 * área sin el 0, número sin el 15, entre 2 y 4 dígitos de área -- y a alguien
 * de Colombia le rechazaban un número perfectamente válido. Sólo se validan a
 * fondo los países donde conocemos la regla; para el resto alcanza con que
 * sean dígitos y que el largo total entre en el máximo internacional.
 */

export function normalizeDigits(value: string): string {
  return (value || "").replace(/\D/g, "");
}

/** El prefijo internacional del país, para mostrar al lado del campo. */
export function prefijoTelefonico(pais: string | null | undefined): string {
  return esCodigoPais(pais) ? PAISES[pais].codigoTelefonico : "";
}

/**
 * Cómo se escribe un teléfono en cada país.
 *
 * NO TODOS LOS PAÍSES TIENEN "CÓDIGO DE ÁREA", y donde lo tienen no se llama
 * igual ni mide lo mismo: en México es la "lada", en Estados Unidos el "area
 * code", y en España directamente no existe -- son nueve dígitos y punto.
 * Pedirle a un español un "código de área" es pedirle algo que no tiene, y el
 * formulario quedaba armado con las reglas de Argentina para todos.
 *
 * Cuando `etiquetaArea` es null, el país va con UN solo campo. Es el caso de
 * España, y también el de Colombia y Uruguay: hoy sus números se marcan
 * completos, de diez y de ocho dígitos, sin partirlos.
 */
export interface FormatoTelefono {
  /** Cómo llaman al tramo del medio, o null si ese país no lo usa. */
  etiquetaArea: string | null;
  areaMin: number;
  areaMax: number;
  numeroMin: number;
  numeroMax: number;
  /** Un número de ejemplo del país, para la ayuda debajo del campo. */
  ejemplo: string;
}

const FORMATOS: Record<CodigoPais, FormatoTelefono> = {
  // El 0 del área y el 15 del número son prefijos de marcado local que no van
  // en el número internacional, y son el error más común.
  AR: { etiquetaArea: "Cód. área", areaMin: 2, areaMax: 4, numeroMin: 6, numeroMax: 8, ejemplo: "351 5551234" },
  MX: { etiquetaArea: "Lada", areaMin: 2, areaMax: 3, numeroMin: 7, numeroMax: 8, ejemplo: "55 12345678" },
  US: { etiquetaArea: "Area code", areaMin: 3, areaMax: 3, numeroMin: 7, numeroMax: 7, ejemplo: "305 5551234" },
  ES: { etiquetaArea: null, areaMin: 0, areaMax: 0, numeroMin: 9, numeroMax: 9, ejemplo: "612345678" },
  CO: { etiquetaArea: null, areaMin: 0, areaMax: 0, numeroMin: 10, numeroMax: 10, ejemplo: "3001234567" },
  UY: { etiquetaArea: null, areaMin: 0, areaMax: 0, numeroMin: 8, numeroMax: 8, ejemplo: "99123456" },
};

/**
 * El formato del país, o uno permisivo si no lo conocemos.
 *
 * El default no inventa un código de área: sin conocer la regla, lo único que
 * se puede afirmar es el máximo internacional (E.164 permite 15 dígitos
 * contando el prefijo del país). Rechazar de más sería rechazar números
 * válidos de gente que quiere pagar.
 */
export function formatoTelefonico(pais: string | null | undefined): FormatoTelefono {
  if (esCodigoPais(pais)) return FORMATOS[pais];
  return { etiquetaArea: null, areaMin: 0, areaMax: 0, numeroMin: 6, numeroMax: 14, ejemplo: "" };
}

/**
 * Verifica el teléfono completo. Devuelve el error en español o null.
 *
 * Se valida el par entero y no cada campo por separado porque el largo válido
 * depende de la suma: en Argentina el área puede tener 2, 3 o 4 dígitos y el
 * número el resto hasta 10.
 */
export function validarTelefono(
  pais: string | null | undefined,
  codigoArea: string,
  numero: string
): string | null {
  const area = normalizeDigits(codigoArea);
  const resto = normalizeDigits(numero);

  // Vacío es válido: el teléfono es opcional.
  if (!area && !resto) return null;

  const f = formatoTelefonico(pais);

  // A medias no: o se carga entero o no se carga.
  //
  // Los mensajes usan la etiqueta tal cual, sin artículo: "el lada" y "la
  // area code" están mal, y el género de la palabra cambia con el país.
  if (f.etiquetaArea && !area) return `Completa ${f.etiquetaArea}`;
  if (!resto) return "Falta el número";

  // Argentina tiene dos trampas propias, y son el error más común: el 0 del
  // área y el 15 del número son prefijos de marcado local que no van en el
  // número internacional.
  if (esCodigoPais(pais) && pais === "AR") {
    if (area.startsWith("0")) return "El código de área va sin el 0 inicial";
    if (resto.startsWith("15")) return "El número va sin el 15 inicial";
  }

  if (f.etiquetaArea) {
    if (area.length < f.areaMin || area.length > f.areaMax) {
      return f.areaMin === f.areaMax
        ? `${f.etiquetaArea}: tienen que ser ${f.areaMin} dígitos`
        : `${f.etiquetaArea}: tienen que ser entre ${f.areaMin} y ${f.areaMax} dígitos`;
    }
  } else if (area) {
    // Ese país no usa código de área: si vino algo, se suma al número en vez
    // de rechazarlo -- puede venir de una cuenta vieja o de otro formulario.
    return validarTelefono(pais, "", area + resto);
  }

  if (resto.length < f.numeroMin || resto.length > f.numeroMax) {
    return f.numeroMin === f.numeroMax
      ? `El número debe tener ${f.numeroMin} dígitos`
      : `El número debe tener entre ${f.numeroMin} y ${f.numeroMax} dígitos`;
  }

  return null;
}

/**
 * @deprecated Usar validarTelefono, que contempla el país. Se mantienen
 * porque los llama código viejo que todavía no se migró.
 */
export function validatePhoneAreaCode(value: string): string | null {
  return validarTelefono("AR", value, "1234567");
}

export function validatePhoneNumber(value: string): string | null {
  return validarTelefono("AR", "351", value);
}
