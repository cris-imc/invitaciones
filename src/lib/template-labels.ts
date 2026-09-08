/**
 * Nombre visible de cada familia de plantillas.
 *
 * Fuente única: lo usan el selector del wizard (TemplatePreviewModal) y la
 * landing de modelos. Antes cada uno tenía su propia lista y la de /modelos
 * se quedó con las 22 familias de la Colección Flat: las 36 de Storytelling
 * caían al fallback y la landing mostraba la constante cruda
 * ("GUESTPASSVIP", "PAPELERIADEHOTELDELUJO"). Si aparece una familia nueva,
 * se agrega acá y las dos pantallas la toman.
 */
export const TEMPLATE_LABELS: Record<string, string> = {
  // Colección Flat
  ELEGANT: "Elegant",
  MODERNO: "Moderno",
  NEON: "Neon",
  CHIC: "Chic",
  EDITORIAL: "Editorial",
  ONIX: "Ónix",
  JARDINSEDA: "Jardín de Seda",
  HOLOGRAMA: "Holograma",
  CIRCUITO: "Circuito",
  CRISTAL3D: "Cristal 3D",
  CINE: "Cine",
  NORDICO: "Atelier Nórdico",
  RIVIERA: "Riviera",
  GOLDENDUSK: "Golden Dusk",
  SEDA: "Seda",
  PETALOS: "Pétalos",
  LUZLUNA: "Luz de Luna",
  BONVOYAGE: "Bon Voyage",
  CORPORATE: "Corporate",
  GARDENPARTY: "Garden Party",
  LOFTINDUSTRIAL: "Loft Industrial",
  INFANTIL: "Infantil",

  // Colección Storytelling
  GUESTPASSVIP: "Guest Pass VIP",
  PRINCESA: "Princesa",
  CORONAESCARLATA: "Corona Escarlata",
  JEWELRYBOX: "Jewelry Box",
  PASEVIP: "Pase VIP",
  CINEABSTRACTOXV: "Cine Abstracto XV",
  ACRYLICPOP: "Acrylic Pop",
  BOLADEDISCOTECA: "Bola de Discoteca",
  CRYSTAL3D: "Crystal 3D",
  FASHIONTAG: "Fashion Tag",
  CERAMICAEDITORIAL: "Cerámica Editorial",
  CINEABSTRACTO: "Cine Abstracto",
  PAPELERIADEHOTELDELUJO: "Papelería de Hotel de Lujo",
  VINTAGEEDITORIAL: "Vintage Editorial",
  FASHIONLOOKBOOK: "Fashion Lookbook",
  MARMOLYORO: "Mármol y Oro",
  ATELIERDEPAPEL: "Atelier de Papel",
  BOTANICAEDITORIAL: "Botánica Editorial",
  ENCAJECONTEMPORANEO: "Encaje Contemporáneo",
  LIQUIDGLASS: "Liquid Glass",
  BLACKANDWHITE: "Black y White",
  BABYSHOWER: "Baby Shower",
  BAUTISMO: "Bautismo",
  CORPORATIVOANIVERSARIO: "Corporativo Aniversario",
  CORPORATIVOENCUENTRO: "Corporativo Encuentro",
  CUMPLEANOSCOCKTAIL: "Cumpleaños Cocktail",
  CUMPLEANOSJARDIN: "Cumpleaños Jardín de Noche",
  CUMPLEANOSTERRAZA: "Cumpleaños Terraza Dorada",
  DESPEDIDASOLTERA: "Despedida de Soltera",
  DESPEDIDASOLTERO: "Despedida de Soltero",
  GRADUACION: "Graduación",
  INAUGURACION: "Inauguración",
  INFANTILESPACIO: "Infantil Rumbo al Espacio",
  INFANTILJURASICO: "Infantil Mundo Jurásico",
  INFANTILSAFARI: "Infantil Safari",
  ANIVERSARIO: "Aniversario",
};

/**
 * Nombre visible de una familia. Si llega un tipo desconocido devuelve algo
 * legible en vez de la constante en mayúsculas y sin espacios: separa por
 * mayúsculas y capitaliza, así una familia nueva que alguien olvide agregar
 * arriba se ve mal pero no ilegible.
 */
export function labelDeFamilia(tipo: string): string {
  if (TEMPLATE_LABELS[tipo]) return TEMPLATE_LABELS[tipo];
  const legible = tipo
    .toLowerCase()
    .replace(/(^|\s)([a-záéíóúñ])/g, (_m, pre, letra) => pre + letra.toUpperCase());
  return legible || tipo;
}
