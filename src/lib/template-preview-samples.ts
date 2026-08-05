// Datos de ejemplo + fotos reales (generadas para este propósito) usados SOLO
// para renderizar una vista previa en vivo de cada plantilla/color dentro del
// wizard de creación. No se guardan en la base de datos ni se usan en
// invitaciones reales.

const CASAMIENTO_FOTOS = [
  "/mockup-preview/casamiento/watermarked_img_1346976295218286240.jpg",
  "/mockup-preview/casamiento/watermarked_img_13217750163076780480.jpg",
  "/mockup-preview/casamiento/watermarked_img_17623725134356043623.jpg",
  "/mockup-preview/casamiento/watermarked_img_1942085709239661697.jpg",
  "/mockup-preview/casamiento/watermarked_img_3216348278055410474.jpg",
  "/mockup-preview/casamiento/watermarked_img_3366300357194425067.jpg",
  "/mockup-preview/casamiento/watermarked_img_354824716826829957.jpg",
  "/mockup-preview/casamiento/watermarked_img_5541227884786045805.jpg",
  "/mockup-preview/casamiento/watermarked_img_7090549787569710905.jpg",
  "/mockup-preview/casamiento/watermarked_img_8428878371330858127.jpg",
];

const EVENTO_FOTOS = [
  "/mockup-preview/evento/watermarked_img_1215185753765141526.jpg",
  "/mockup-preview/evento/watermarked_img_1370624865937633976.jpg",
  "/mockup-preview/evento/watermarked_img_1482629838507027044.jpg",
  "/mockup-preview/evento/watermarked_img_12176265081736345566.jpg",
  "/mockup-preview/evento/watermarked_img_17729993219468427008.jpg",
  "/mockup-preview/evento/watermarked_img_9792634984836670783.jpg",
];

const QUINCE_FOTOS_POR_COLOR: Record<"rojo" | "amarillo" | "verde" | "azul" | "rosa" | "violeta", string[]> = {
  rojo: [
    "/mockup-preview/quince/rojo/watermarked_img_1386756256672415103.jpg",
    "/mockup-preview/quince/rojo/watermarked_img_15234077429430457470.jpg",
    "/mockup-preview/quince/rojo/watermarked_img_18156801226262206946.jpg",
    "/mockup-preview/quince/rojo/watermarked_img_5058825283644314923.jpg",
    "/mockup-preview/quince/rojo/watermarked_img_6754739976927879431.jpg",
    "/mockup-preview/quince/rojo/watermarked_img_8416355192625455799.jpg",
  ],
  amarillo: [
    "/mockup-preview/quince/amarillo/watermarked_img_11861545266327823235.jpg",
    "/mockup-preview/quince/amarillo/watermarked_img_12456859188461426887.jpg",
    "/mockup-preview/quince/amarillo/watermarked_img_16045289254519503181.jpg",
    "/mockup-preview/quince/amarillo/watermarked_img_16879656052016807446.jpg",
    "/mockup-preview/quince/amarillo/watermarked_img_3097681961692980692.jpg",
    "/mockup-preview/quince/amarillo/watermarked_img_4277696953572426393.jpg",
  ],
  verde: [
    "/mockup-preview/quince/verde/watermarked_img_11810797164705834912.jpg",
    "/mockup-preview/quince/verde/watermarked_img_13547552293077845081.jpg",
    "/mockup-preview/quince/verde/watermarked_img_5021113646220611216.jpg",
    "/mockup-preview/quince/verde/watermarked_img_9863235364892897043.jpg",
  ],
  azul: [
    "/mockup-preview/quince/azul/watermarked_img_13632606580387267151.jpg",
    "/mockup-preview/quince/azul/watermarked_img_14068180752105619012.jpg",
    "/mockup-preview/quince/azul/watermarked_img_15328137091592772609.jpg",
    "/mockup-preview/quince/azul/watermarked_img_16504961428506036886.jpg",
    "/mockup-preview/quince/azul/watermarked_img_6742947177961612941.jpg",
    "/mockup-preview/quince/azul/watermarked_img_7050771212832727957.jpg",
    "/mockup-preview/quince/azul/watermarked_img_8651568145804205759.jpg",
  ],
  rosa: [
    "/mockup-preview/quince/rosa/watermarked_img_1330515123529395640.jpg",
    "/mockup-preview/quince/rosa/watermarked_img_14623954223679475472.jpg",
    "/mockup-preview/quince/rosa/watermarked_img_15312041016619323723.jpg",
    "/mockup-preview/quince/rosa/watermarked_img_16469043511979064987.jpg",
    "/mockup-preview/quince/rosa/watermarked_img_16678692149030345148.jpg",
    "/mockup-preview/quince/rosa/watermarked_img_17163298564593890836.jpg",
    "/mockup-preview/quince/rosa/watermarked_img_17372932137939150386.jpg",
    "/mockup-preview/quince/rosa/watermarked_img_4060953750151405632.jpg",
    "/mockup-preview/quince/rosa/watermarked_img_8699808669818304376.jpg",
  ],
  violeta: [
    "/mockup-preview/quince/violeta/watermarked_img_12752784819423363844.jpg",
    "/mockup-preview/quince/violeta/watermarked_img_17469571342383098743.jpg",
    "/mockup-preview/quince/violeta/watermarked_img_18318526593306957717.jpg",
    "/mockup-preview/quince/violeta/watermarked_img_4202346747737599537.jpg",
    "/mockup-preview/quince/violeta/watermarked_img_4317128682403649657.jpg",
    "/mockup-preview/quince/violeta/watermarked_img_773800043388720602.jpg",
  ],
};

// Mapea cada color de plantilla (Moderno o Elegant) al vestido que tenemos
// disponible. La mayoría son matches exactos; default/Gray/Orange (sin
// vestido propio) caen a "amarillo" como neutro cálido más cercano.
const MODERNO_COLOR_TO_VESTIDO: Record<string, keyof typeof QUINCE_FOTOS_POR_COLOR> = {
  default: "amarillo", // Gris y Dorado
  Bordo: "rojo",
  Azul: "azul",
  Verde: "verde",
  Purpura: "violeta",
  Rojo: "rojo",
};

const ELEGANT_COLOR_TO_VESTIDO: Record<string, keyof typeof QUINCE_FOTOS_POR_COLOR> = {
  default: "amarillo", // Dorados
  Green: "verde",
  Red: "rojo",
  Blue: "azul",
  Orange: "amarillo",
  Violet: "violeta",
  Gray: "amarillo",
  DarkYellow: "amarillo",
  Pink: "rosa",
};

function getQuinceFotos(templateTipo: "ELEGANT" | "MODERNO", colorId: string): string[] {
  const map = templateTipo === "MODERNO" ? MODERNO_COLOR_TO_VESTIDO : ELEGANT_COLOR_TO_VESTIDO;
  const vestido = map[colorId] ?? "amarillo";
  return QUINCE_FOTOS_POR_COLOR[vestido];
}

// No hay fotos de casamiento por color (el vestido de novia no varía según
// la plantilla), así que rotamos el pool compartido para que cada
// plantilla/color muestre una portada y un orden de álbum distintos en vez
// de repetir siempre la misma foto.
function rotate<T>(arr: T[], offset: number): T[] {
  const n = arr.length;
  const start = ((offset % n) + n) % n;
  return [...arr.slice(start), ...arr.slice(0, start)];
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function getCasamientoFotos(templateTipo: "ELEGANT" | "MODERNO", colorId: string): string[] {
  const offset = hashString(`${templateTipo}:${colorId}`);
  return rotate(CASAMIENTO_FOTOS, offset);
}

// Tampoco hay fotos de evento genérico por color (no hay un "vestido" que
// varíe), misma rotación por plantilla/color que casamiento.
function getEventoFotos(templateTipo: "ELEGANT" | "MODERNO", colorId: string): string[] {
  const offset = hashString(`${templateTipo}:${colorId}`);
  return rotate(EVENTO_FOTOS, offset);
}

const fechaEjemplo = (() => {
  const d = new Date();
  d.setMonth(d.getMonth() + 4);
  return d.toISOString();
})();

function buildCasamientoSample(templateTipo: "ELEGANT" | "MODERNO", colorId: string): Record<string, unknown> {
  const fotos = getCasamientoFotos(templateTipo, colorId);
  return {
    tipo: "CASAMIENTO",
    nombreEvento: "Valentina & Nicolás",
    nombreNovia: "Valentina",
    nombreNovio: "Nicolás",
    fechaEvento: fechaEjemplo,
    ciudad: "Buenos Aires",
    lugarNombre: "Estancia Villa Rosa",
    lugarDireccion: "Ruta 8, km 52, Buenos Aires",
    portadaHabilitada: true,
    portadaKicker: "Con mucho cariño, para",
    portadaMensaje: "Nos casamos y queremos compartir este día tan especial con vos",
    portadaTextoBoton: "Abrir invitación",
    portadaImagenFondo: fotos[0],
    portadaImagenFondoDesktop: fotos[0],
    galeriaPrincipalFotos: JSON.stringify(fotos),
    cronogramaEventos: JSON.stringify([
      { time: "18:00", title: "Ceremonia", icon: "Heart" },
      { time: "19:30", title: "Recepción", icon: "Utensils" },
      { time: "21:00", title: "Fiesta", icon: "Music" },
    ]),
  };
}

function buildQuinceSample(templateTipo: "ELEGANT" | "MODERNO", colorId: string): Record<string, unknown> {
  const fotos = getQuinceFotos(templateTipo, colorId);
  return {
    tipo: "QUINCE_ANOS",
    nombreEvento: "Mis XV Años",
    nombreQuinceanera: "Sofía",
    fechaEvento: fechaEjemplo,
    ciudad: "Córdoba",
    lugarNombre: "Salón Jardín del Sol",
    lugarDireccion: "Av. Colón 4521, Córdoba",
    portadaHabilitada: true,
    portadaKicker: "Con mucho cariño, para",
    portadaMensaje: "Te invito a celebrar mis quince años junto a mí",
    portadaTextoBoton: "Abrir invitación",
    portadaImagenFondo: fotos[0],
    portadaImagenFondoDesktop: fotos[0],
    galeriaPrincipalFotos: JSON.stringify(fotos),
    cronogramaEventos: JSON.stringify([
      { time: "20:00", title: "Ceremonia de las Zapatillas", icon: "Heart" },
      { time: "21:00", title: "Cena", icon: "Utensils" },
      { time: "22:30", title: "Baile", icon: "Music" },
    ]),
  };
}

function buildEventoSample(templateTipo: "ELEGANT" | "MODERNO", colorId: string): Record<string, unknown> {
  const fotos = getEventoFotos(templateTipo, colorId);
  return {
    tipo: "CUMPLEANOS",
    nombreEvento: "Fiesta de Fin de Año",
    fechaEvento: fechaEjemplo,
    ciudad: "Buenos Aires",
    lugarNombre: "Salón Terraza Norte",
    lugarDireccion: "Av. del Libertador 1450, Buenos Aires",
    portadaHabilitada: true,
    portadaKicker: "Te esperamos en",
    portadaMensaje: "Vení a celebrar con nosotros este día tan especial",
    portadaTextoBoton: "Abrir invitación",
    portadaImagenFondo: fotos[0],
    portadaImagenFondoDesktop: fotos[0],
    galeriaPrincipalFotos: JSON.stringify(fotos),
    cronogramaEventos: JSON.stringify([
      { time: "20:00", title: "Recepción", icon: "Heart" },
      { time: "21:00", title: "Cena", icon: "Utensils" },
      { time: "23:00", title: "Fiesta", icon: "Music" },
    ]),
  };
}

export function getTemplatePreviewSample(
  eventType: string | undefined,
  templateTipo: "ELEGANT" | "MODERNO",
  colorId: string
): Record<string, unknown> {
  if (eventType === "QUINCE_ANOS") return buildQuinceSample(templateTipo, colorId);
  if (eventType === "CUMPLEANOS") return buildEventoSample(templateTipo, colorId);
  return buildCasamientoSample(templateTipo, colorId);
}
