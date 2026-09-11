/**
 * Qué preguntas hay y en qué orden, en un solo lugar.
 *
 * Los textos viven en el diccionario (landing.faq.*), porque se traducen y
 * tienen su versión argentina; acá sólo está el índice. Antes esto estaba
 * escrito dos veces -- una lista en la landing y otro archivo de datos para
 * el panel -- y las dos se desincronizaron: una pregunta agregada en un lado
 * no aparecía en el otro.
 *
 * EL ORDEN NO ES CASUAL. Arriba va lo que alguien se pregunta ANTES de
 * decidirse (si le va a salir difícil, cuánto cuesta, si le sirve para su
 * evento); abajo, lo que se pregunta cuando ya está usándolo. La landing
 * muestra sólo las primeras, que son las que están frenando la decisión.
 */
export const FAQ_CLAVES = [
  // Antes de decidirse
  "sinDiseno",
  "proceso",
  "limite",
  "planes",
  "moneda",
  "otrosEventos",

  // Ya decidido, usándolo
  "editar",
  "compartir",
  "cambiarPlan",
  "celular",
  "costoGratis",
  "cargaMasiva",
  "mesas",
  "ingreso",
  "planillaSalon",
  "restricciones",
  "cantidadConfirmada",
  "despuesDelEvento",
  "idiomaPais",
] as const;

/**
 * Cuántas se muestran en la landing.
 *
 * Seis y no las diecinueve: una lista larga de preguntas plegadas al final de
 * una página de venta se lee como un muro y nadie la abre. Las seis primeras
 * son las que frenan la decisión; el resto está a un clic, en /preguntas.
 */
export const FAQ_EN_LA_LANDING = 6;

export const FAQ_CLAVES_LANDING = FAQ_CLAVES.slice(0, FAQ_EN_LA_LANDING);
