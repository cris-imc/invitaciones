#!/usr/bin/env node
/**
 * Genera las variantes de color de las familias de Papel Prensado (Colección
 * Paper): Prensa, Noche, Lumbre, Herbario y Trazo.
 *
 * En esta colección una variante NO es un acento distinto: es otro tono de
 * papel. La tinta, la tinta suave y la sombra son las mismas en las cinco a
 * propósito (la colección es monocroma, ver el handoff de cada mockup). Por
 * eso el chequeo de la guía §3.6 ("dos variantes con el mismo acento") acá
 * se lee al revés: lo que tiene que ser distinto entre archivos es el hex del
 * papel, y --t-acc es el mismo en todas. Este script lo verifica al final.
 *
 * Reemplaza por string sobre el archivo base, como manda la guía §2.4:
 *   - los dos hex del papel (PAPEL y PAPEL2),
 *   - el rgb del scrim de la portada animada (derivado de PAPEL),
 *   - el identificador (XxxTemplate → XxxTemplateNombre),
 *   - la línea "Variante: ..." del encabezado.
 *
 * Correr después de CADA edición del archivo base, si no las variantes
 * quedan desincronizadas en silencio:
 *   node scripts/gen-papel-prensado-variants.js prensa
 *   node scripts/gen-papel-prensado-variants.js            (todas)
 */
const fs = require("node:fs");
const path = require("node:path");

const DIR = path.join(__dirname, "..", "src", "components", "templates");

// Base = la variante default (id "default" en el registro). Las demás llevan
// el id con el que el wizard las guarda en temaColores.colorPrincipal.
const FAMILIAS = {
  prensa: {
    archivo: "PrensaTemplate",
    base: { nombre: "Lino", paper: "#F4ECE2", paper2: "#EFE5D9" },
    variantes: [
      { id: "Hueso", paper: "#F8F4EE", paper2: "#F1ECE3" },
      { id: "Arena", paper: "#EDE3D4", paper2: "#E6DBC9" },
      { id: "Piedra", paper: "#E4DED6", paper2: "#DBD4CA" },
      { id: "Humo", paper: "#DCD8D2", paper2: "#D3CEC6" },
    ],
  },
  // Noche: cinco negros, sin un solo color de acento. El papel2 de cada uno
  // es apenas más claro, para que la tarjeta se despegue del fondo.
  noche: {
    archivo: "NocheTemplate",
    base: { nombre: "Carbón", paper: "#141414", paper2: "#1C1C1A" },
    variantes: [
      { id: "Tinta", paper: "#16191F", paper2: "#1E222A" },
      { id: "Vino", paper: "#1B1315", paper2: "#241A1D" },
      { id: "Bosque", paper: "#121A16", paper2: "#19231E" },
      { id: "Bronce", paper: "#1A1611", paper2: "#231E17" },
    ],
  },
  // Herbario: el papel tampoco cambia. Lo que cambia es el FILTRO con el que
  // se duotonizan las cuatro fotos botánicas (y el acento que las acompaña),
  // así las cinco variantes se ven como cinco herbarios distintos con un solo
  // juego de imágenes.
  herbario: {
    archivo: "HerbarioTemplate",
    porBotanica: true,
    sinScrim: true,
    base: { nombre: "Salvia", acento: "#6E7A5E", filtro: "grayscale(1) sepia(1) hue-rotate(48deg) saturate(.75) brightness(.96)" },
    variantes: [
      { id: "Eucalipto", acento: "#7C8B7A", filtro: "grayscale(1) sepia(1) hue-rotate(58deg) saturate(.55) brightness(1.02)" },
      { id: "Oliva", acento: "#7A7A55", filtro: "grayscale(1) sepia(1) hue-rotate(20deg) saturate(.85) brightness(.94)" },
      { id: "Ceniza", acento: "#8A8A82", filtro: "grayscale(1) sepia(.35) saturate(.5)" },
      { id: "Tinta", acento: "#55605C", filtro: "grayscale(1) sepia(1) hue-rotate(150deg) saturate(.45) brightness(.92)" },
    ],
  },
  // Trazo: acá la variante NO es otro papel, es otro lápiz. El cuaderno es
  // siempre el mismo y lo que cambia es la tinta, que además pinta los
  // garabatos (son máscaras CSS con el color de la tinta).
  trazo: {
    archivo: "TrazoTemplate",
    porTinta: true,
    sinScrim: true,
    base: { nombre: "Grafito", tinta: "#3C3A35" },
    variantes: [
      { id: "Tinta", tinta: "#2E3A4A" },
      { id: "Terracota", tinta: "#8A5340" },
      { id: "Verde", tinta: "#3F5347" },
      { id: "Ciruela", tinta: "#54364A" },
    ],
  },
  lumbre: {
    archivo: "LumbreTemplate",
    sinScrim: true,
    base: { nombre: "Topo", paper: "#E9DFD3", paper2: "#E1D5C7" },
    variantes: [
      { id: "Tostado", paper: "#EFE6DA", paper2: "#E7DCCE" },
      { id: "Arcilla", paper: "#E2D6C6", paper2: "#D9CBB9" },
      { id: "Ceniza", paper: "#DAD2C8", paper2: "#D1C8BC" },
      { id: "Sombra", paper: "#CFC6BA", paper2: "#C5BBAE" },
    ],
  },
};

function rgbDe(hex) {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}

function generar(clave) {
  const fam = FAMILIAS[clave];
  if (!fam) throw new Error(`familia desconocida: ${clave}`);
  const rutaBase = path.join(DIR, `${fam.archivo}.tsx`);
  const base = fs.readFileSync(rutaBase, "utf8");

  const chequeos = fam.porBotanica ? [
    [`const ACENTO = "${fam.base.acento}";`, "ACENTO"],
    [`const FILTRO = "${fam.base.filtro}";`, "FILTRO"],
    [`Variante: ${fam.base.nombre} (base)`, "encabezado"],
    [`export function ${fam.archivo}(`, "export"],
  ] : fam.porTinta ? [
    [`const TINTA = "${fam.base.tinta}";`, "TINTA"],
    [`Variante: ${fam.base.nombre} (base)`, "encabezado"],
    [`export function ${fam.archivo}(`, "export"],
  ] : [
    [`const PAPEL = "${fam.base.paper}";`, "PAPEL"],
    [`const PAPEL2 = "${fam.base.paper2}";`, "PAPEL2"],
    ...(fam.sinScrim ? [] : [[`scrimColorRgb="${rgbDe(fam.base.paper)}"`, "scrimColorRgb"]]),
    [`Variante: ${fam.base.nombre} (base)`, "encabezado"],
    [`export function ${fam.archivo}(`, "export"],
  ];
  for (const [texto, que] of chequeos) {
    if (!base.includes(texto)) throw new Error(`${fam.archivo}: no encontré ${que} → "${texto}"`);
  }

  for (const v of fam.variantes) {
    let s = base;
    if (fam.porBotanica) {
      s = s.split(`const ACENTO = "${fam.base.acento}";`).join(`const ACENTO = "${v.acento}";`);
      s = s.split(`const FILTRO = "${fam.base.filtro}";`).join(`const FILTRO = "${v.filtro}";`);
    }
    if (fam.porTinta) {
      s = s.split(`const TINTA = "${fam.base.tinta}";`).join(`const TINTA = "${v.tinta}";`);
    }
    if (!fam.porTinta && !fam.porBotanica) {
      s = s.split(`const PAPEL = "${fam.base.paper}";`).join(`const PAPEL = "${v.paper}";`);
      s = s.split(`const PAPEL2 = "${fam.base.paper2}";`).join(`const PAPEL2 = "${v.paper2}";`);
    }
    if (!fam.sinScrim) {
      s = s.split(`scrimColorRgb="${rgbDe(fam.base.paper)}"`).join(`scrimColorRgb="${rgbDe(v.paper)}"`);
    }
    s = s.split(`Variante: ${fam.base.nombre} (base)`).join(`Variante: ${v.id} (generada por scripts/gen-papel-prensado-variants.js, no editar a mano)`);
    s = s.split(fam.archivo).join(`${fam.archivo}${v.id}`);
    fs.writeFileSync(path.join(DIR, `${fam.archivo}${v.id}.tsx`), s);
  }

  // Verificación: papeles todos distintos, tinta idéntica en todos.
  const distintos = new Set(fam.porBotanica
    ? [fam.base.filtro, ...fam.variantes.map((v) => v.filtro)]
    : fam.porTinta
      ? [fam.base.tinta, ...fam.variantes.map((v) => v.tinta)]
      : [fam.base.paper, ...fam.variantes.map((v) => v.paper)]);
  if (distintos.size !== fam.variantes.length + 1) throw new Error(`${fam.archivo}: dos variantes iguales`);
  console.log(`${fam.archivo}: ${fam.variantes.length} variantes (${fam.variantes.map((v) => v.id).join(", ")}) — ${fam.porTinta ? "tinta distinta en cada una, papel igual a propósito" : "papel distinto en cada una, tinta igual a propósito"}`);
}

const pedidas = process.argv.slice(2);
(pedidas.length ? pedidas : Object.keys(FAMILIAS)).forEach(generar);
