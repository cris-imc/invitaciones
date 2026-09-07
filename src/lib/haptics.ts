/**
 * Vibración corta al tocar, para las acciones que cambian datos.
 *
 * Sólo se siente en Android. Safari en iOS no implementa la Vibration API --
 * tampoco Chrome en iPhone, que por dentro también es WebKit --, así que en
 * esos equipos estas llamadas no hacen nada. No es una degradación a arreglar:
 * es todo lo que la web permite hoy, y el resto de la interfaz no depende de
 * que el teléfono vibre.
 *
 * Va en las acciones que MODIFICAN algo (marcar un pago, guardar, desmarcar) y
 * no en las de navegar o abrir un panel: si todo vibra, la vibración deja de
 * significar "listo, quedó registrado".
 */

type Patron = number | number[];

function vibrar(patron: Patron) {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  // Quien pidió menos movimiento en el sistema tampoco quiere que el teléfono
  // le tiemble en la mano.
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  try {
    navigator.vibrate(patron);
  } catch {
    // Algunos navegadores lo bloquean si no hubo interacción previa del
    // usuario. No es motivo para interrumpir la acción que se estaba haciendo.
  }
}

/** Confirmación breve: se marcó un pago, se guardó una anotación. */
export const hapticoConfirmar = () => vibrar(18);

/** Algo se deshace o se borra: dos golpecitos para que no pase por lo mismo. */
export const hapticoDeshacer = () => vibrar([12, 45, 12]);
