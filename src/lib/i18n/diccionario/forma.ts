/**
 * La forma de un módulo del diccionario, tomada del español.
 *
 * El `as const` de cada módulo hace falta para que las claves queden fijas y
 * el autocompletado funcione, pero también congela los VALORES en el texto
 * español exacto. Sin este ensanchado, "Save" no sería asignable a una clave
 * cuyo tipo es literalmente "Guardar", y ningún otro idioma podría existir.
 */
export type ConCualquierTexto<T> = {
  [K in keyof T]: T[K] extends string ? string : ConCualquierTexto<T[K]>;
};
