/**
 * El texto que gira alrededor del sello de las plantillas storytelling.
 *
 * Va sobre un <textPath> circular de radio 38 en un viewBox de 100x100, o sea
 * 238.8 unidades de recorrido. Con IBM Plex Mono a 7px y letter-spacing 1.6px
 * cada caracter ocupa 5.45, asi que entran 43. Medido en el DOM con la fuente
 * real cargada, no estimado a ojo.
 *
 * Lo importante: SVG no dibuja los glifos que caen mas alla del final del
 * recorrido. Un nombre largo entonces no se superpone -- eso no puede pasar --
 * pero se corta en seco, dejando el apellido por la mitad y comiendose la
 * fecha:
 *
 *   MARIA DE LOS ANGELES & JUAN IGNACIO DEL VALLE · 14·03 ·
 *   -> "MARIA DE LOS ANGELES & JUAN IGNACIO DEL VALL"   (y la fecha no aparece)
 *
 * Por eso acá se suelta informacion a propósito, en orden de menor a mayor
 * importancia, hasta que lo que queda entra entero: primero la fecha (que ya
 * figura en varios otros lugares del pase), despues los apellidos. Recien si
 * ni siquiera los nombres de pila entran cortamos nosotros, con puntos
 * suspensivos, que se leen como decision y no como error.
 */

/** Cuantos caracteres entran en una vuelta completa del arco. */
export const ARCO_CAPACIDAD = 43;

/** Un caracter de margen, porque el kerning real varia entre navegadores. */
const LIMITE = ARCO_CAPACIDAD - 1;

/**
 * Acorta un nombre conservando lo que identifica a la persona.
 *
 * Con "&" (una pareja) recorta cada lado a su nombre de pila, para no dejar a
 * uno con apellido y al otro sin: "Maria de los Angeles & Juan Ignacio del
 * Valle" -> "Maria & Juan".
 *
 * Sin "&" va soltando las ultimas palabras, que es lo que menos identifica:
 * "Mis XV - Maria de los Angeles Fernandez Lopez" -> "Mis XV - Maria de los
 * Angeles Fernandez". Recortar al primer nombre acá seria un error: dejaria
 * "Mis", que no dice nada.
 */
function acortar(nombres: string, limite: number): string {
  if (nombres.includes("&")) {
    const pila = nombres
      .split("&")
      .map((parte) => parte.trim().split(/\s+/)[0] ?? "")
      .filter(Boolean)
      .join(" & ");
    if (pila) return pila;
  }

  const palabras = nombres.split(/\s+/).filter(Boolean);
  while (palabras.length > 1 && palabras.join(" ").length > limite) {
    palabras.pop();
  }
  return palabras.join(" ");
}

/**
 * Arma el texto del arco eligiendo la version mas completa que entre.
 *
 * @param nombres Lo que se muestra como titulo de la invitacion (namesTitle):
 *   "Ana & Juan", "Valentina", "Mis quince". Ya trae su propio generico si no
 *   hay nombres cargados, asi que acá nunca llega vacio en la practica.
 * @param fecha La fecha corta que cada plantilla ya calcula.
 */
export function textoArco(nombres: string, fecha: string): string {
  const n = String(nombres ?? "").trim().replace(/\s+/g, " ").toUpperCase();
  const f = String(fecha ?? "").trim();
  if (!n) return f ? `${f} · ` : "";

  const corto = acortar(n, LIMITE - 3);

  // De mas a menos completo. El nombre entero sin fecha le gana a nombre
  // recortado con fecha: quien mira el sello esta buscando de quien es la
  // invitacion, no cuando es.
  const candidatos = [
    f ? `${n} · ${f} · ` : "",
    `${n} · `,
    f && corto !== n ? `${corto} · ${f} · ` : "",
    corto !== n ? `${corto} · ` : "",
  ].filter(Boolean);

  for (const candidato of candidatos) {
    if (candidato.length <= LIMITE) return candidato;
  }

  // Nadie tiene un nombre de pila de 40 caracteres, pero si aparece preferimos
  // cortar nosotros antes que dejar que SVG lo parta al medio.
  const ultimo = candidatos[candidatos.length - 1] ?? `${n} · `;
  return `${ultimo.slice(0, LIMITE - 4).trimEnd()}… · `;
}
