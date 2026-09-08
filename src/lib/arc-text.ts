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

/** Largo del recorrido: 2·pi·38, el radio del path del medallon. */
const CIRCUNFERENCIA = 238.76;

/**
 * Ancho de un glifo a 7px en IBM Plex Mono, sin contar el letter-spacing.
 * Medido sobre el SVG ya renderizado (getComputedTextLength), no deducido de
 * las metricas de la fuente: el trailing space y el redondeo del navegador
 * hacen que el valor teorico (3.85) se quede corto y el anillo se pase de
 * largo unos 7px.
 */
const AVANCE_GLIFO = 4.036;

/** El letter-spacing que trae el CSS de todas las familias. */
const ESPACIADO_BASE = 1.6;

/** El separador con el que estan escritos todos los textos del arco. */
const SEPARADOR = "· ";

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

export interface AnilloArco {
  /** El texto que se dibuja sobre el recorrido, ya listo para repetirse. */
  texto: string;
  /** letter-spacing en px que hace que ese texto cierre el circulo justo. */
  espaciado: number;
}

/**
 * Arma el anillo de texto del medallon sin costura visible.
 *
 * El problema que resuelve: el texto se dibujaba dos veces seguidas
 * (`{arcText}{arcText}`) y eso casi nunca mide lo mismo que el circulo. Como
 * SVG no dibuja los glifos que caen mas alla del final del recorrido, la
 * segunda copia quedaba cortada a mitad de palabra -- y como el recorrido es
 * cerrado, ese corte terminaba pegado al arranque del texto. De ahi salia el
 * "PACCESO" que se leia arriba del sello: la P de un "PASE" cortado contra el
 * "ACCESO" del principio.
 *
 * La solucion tiene dos partes:
 *
 * 1. Cortar SIEMPRE en un separador ("· "), nunca a mitad de palabra. Se elige
 *    el corte mas largo que entre, asi el anillo queda lo mas lleno posible.
 * 2. Estirar apenas el letter-spacing para que ese texto mida exactamente la
 *    circunferencia. Asi el final cae justo donde empieza y no queda ni hueco
 *    ni superposicion.
 *
 * El estiramiento es chico porque el paso 1 ya dejo el texto cerca de la
 * capacidad: para "ACCESO VIP · PASE Nº --- · " da 2.1px contra los 1.6px del
 * CSS. No se toca ni el tamaño ni la tipografia.
 */
export function anilloArco(arcText: string): AnilloArco {
  const base = String(arcText ?? "");
  if (!base.trim()) return { texto: "", espaciado: ESPACIADO_BASE };

  // Repetir hasta pasar la capacidad, para tener de donde cortar.
  let repetido = base;
  while (repetido.length <= ARCO_CAPACIDAD) repetido += base;

  // El corte mas largo que entre y que caiga despues de un separador.
  let corte = 0;
  for (let i = 0; i + SEPARADOR.length <= ARCO_CAPACIDAD; i++) {
    if (repetido.startsWith(SEPARADOR, i)) corte = i + SEPARADOR.length;
  }
  const texto = corte > 0 ? repetido.slice(0, corte) : repetido.slice(0, ARCO_CAPACIDAD);

  // Que el texto elegido mida exactamente la vuelta.
  const espaciado = CIRCUNFERENCIA / texto.length - AVANCE_GLIFO;
  return { texto, espaciado: Math.min(Math.max(espaciado, 0.4), 5) };
}
