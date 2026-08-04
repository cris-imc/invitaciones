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

const QUINCE_FOTOS_POR_COLOR: Record<"rojo" | "amarillo" | "verde", string[]> = {
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
};

// Mapea cada color de plantilla (Moderno o Elegant) al vestido más parecido
// que tenemos disponible (rojo / amarillo / verde).
const MODERNO_COLOR_TO_VESTIDO: Record<string, keyof typeof QUINCE_FOTOS_POR_COLOR> = {
  default: "amarillo", // Gris y Dorado
  Bordo: "rojo",
  Azul: "verde",
  Verde: "verde",
  Purpura: "rojo",
  Rojo: "rojo",
};

const ELEGANT_COLOR_TO_VESTIDO: Record<string, keyof typeof QUINCE_FOTOS_POR_COLOR> = {
  default: "amarillo", // Dorados
  Green: "verde",
  Red: "rojo",
  Blue: "verde",
  Orange: "amarillo",
  Violet: "rojo",
  Gray: "amarillo",
  DarkYellow: "amarillo",
  Pink: "rojo",
};

function getQuinceFotos(templateTipo: "ELEGANT" | "MODERNO", colorId: string): string[] {
  const map = templateTipo === "MODERNO" ? MODERNO_COLOR_TO_VESTIDO : ELEGANT_COLOR_TO_VESTIDO;
  const vestido = map[colorId] ?? "amarillo";
  return QUINCE_FOTOS_POR_COLOR[vestido];
}

const fechaEjemplo = (() => {
  const d = new Date();
  d.setMonth(d.getMonth() + 4);
  return d.toISOString();
})();

function buildCasamientoSample(): Record<string, unknown> {
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
    portadaImagenFondo: CASAMIENTO_FOTOS[0],
    portadaImagenFondoDesktop: CASAMIENTO_FOTOS[0],
    galeriaPrincipalFotos: JSON.stringify(CASAMIENTO_FOTOS),
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

export function getTemplatePreviewSample(
  eventType: string | undefined,
  templateTipo: "ELEGANT" | "MODERNO",
  colorId: string
): Record<string, unknown> {
  return eventType === "QUINCE_ANOS"
    ? buildQuinceSample(templateTipo, colorId)
    : buildCasamientoSample();
}
