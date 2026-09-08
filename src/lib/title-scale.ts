/**
 * Cuánto achicar el título de la portada cuando el nombre es largo.
 *
 * El título de las portadas storytelling mide
 * `min(clamp(48px, 16vw, 96px), 12.5vh)` con `line-height: 0.86`, dentro de
 * una columna de alto fijo (`position: absolute; inset: 0` +
 * `justify-content: space-between`) que no maneja desborde: lo que no entra
 * queda tapado por el `overflow: hidden` del contenedor de arriba.
 *
 * Medido en la plantilla real (GUESTPASSVIP, Bodoni Moda, 1536x647 -- un
 * notebook común): hasta 4 renglones entra; con 5 se pasa 40px y se come la
 * fecha del pie. Y no hace falta un nombre raro para llegar a 5:
 * "María Josefina & Juan Sebastián" ya los usa.
 *
 * El disparador real son los renglones, no los caracteres, pero CSS no sabe
 * contar renglones. El largo del nombre es el proxy que sí tenemos antes de
 * pintar, y alcanza: el error se paga con unos pixeles de más o de menos, no
 * con un corte.
 *
 * IMPORTANTE: esto multiplica SOLO el término de `vh`, no el tamaño entero
 * (ver el CSS que lo usa). El desborde lo causa nada más que ese tope, así
 * que la reducción tiene que morder ahí y en ningún otro lado. En mobile el
 * `min()` termina eligiendo `16vw` igual, así que la portada del celular
 * queda idéntica a como está hoy; en pantallas anchas y bajas, que es donde
 * se rompe, baja lo justo.
 *
 * La curva es continua a propósito: un nombre de 23 caracteres da 0.986, que
 * no se ve. No hay saltos ni escalones donde el diseño "cambie de golpe".
 */

/** Hasta acá el título va a tamaño pleno. */
const SIN_AJUSTE = 22;

/** Cuánto se achica por caracter que pasa de SIN_AJUSTE. */
const PENDIENTE = 0.014;

/**
 * Piso. En un notebook deja el título en ~50px: sigue siendo un titular, no
 * un subtítulo. Bajar más arreglaría casos absurdos rompiendo los normales.
 */
const PISO = 0.62;

export function escalaTitulo(largo: number): number {
  if (!Number.isFinite(largo) || largo <= SIN_AJUSTE) return 1;
  return Math.max(PISO, 1 - (largo - SIN_AJUSTE) * PENDIENTE);
}

/**
 * Largo del título tal como se va a ver. Para una pareja cuenta los dos
 * nombres más el separador, que es lo que ocupa la caja aunque se rendericen
 * en renglones forzados.
 */
export function largoTitulo(...partes: (string | null | undefined)[]): number {
  return partes.filter(Boolean).map((p) => String(p).trim()).join(" & ").length;
}
