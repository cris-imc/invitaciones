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

  // A medias no: o se carga entero o no se carga.
  if (!area) return "Falta el código de área";
  if (!resto) return "Falta el número";

  const p: CodigoPais | null = esCodigoPais(pais) ? pais : null;

  if (p === "AR") {
    // El 0 del área y el 15 del número son prefijos de marcado local que no
    // van en el número internacional, y son el error más común.
    if (area.startsWith("0")) return "El código de área va sin el 0 inicial";
    if (resto.startsWith("15")) return "El número va sin el 15 inicial";
    if (area.length < 2 || area.length > 4) return "El código de área debe tener entre 2 y 4 dígitos";
    if (resto.length < 6 || resto.length > 8) return "El número debe tener entre 6 y 8 dígitos";
    return null;
  }

  // Para el resto, lo único que se puede afirmar sin conocer la regla de cada
  // país es el máximo internacional: E.164 permite 15 dígitos contando el
  // prefijo del país. Rechazar de más sería rechazar números válidos.
  const total = area.length + resto.length;
  if (total < 6) return "El número parece incompleto";
  if (total > 14) return "El número tiene demasiados dígitos";
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
