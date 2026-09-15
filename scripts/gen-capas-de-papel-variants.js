#!/usr/bin/env node
/**
 * Genera las variantes de color de la sub-colección "Capas de papel"
 * (Colección Iconic).
 *
 * Una familia de Capas de papel es un paisaje de papel recortado dibujado una
 * sola vez; lo único que cambia entre variantes son los once colores de la
 * PALETA, que los SVG leen como var(--pp-…). Por eso las variantes se generan
 * reemplazando ese bloque en vez de mantener cinco archivos de 2.000 líneas a
 * mano: un arreglo en el dibujo llega a las cinco con volver a correr esto.
 *
 * Uso:  node scripts/gen-capas-de-papel-variants.js
 */
const fs = require("node:fs");
const path = require("node:path");

const DIR = path.join(__dirname, "..", "src", "components", "templates");

/** Las cinco paletas del mockup, tal cual las define su bloque de handoff. */
const PALETAS = {
  Noche: {
    etiqueta: "Noche estrellada",
    bg: "#1E2740", bg2: "#16203A", ink: "#F1E9DA", ink2: "#A9AEC2",
    acc: "#D4A857", acc2: "#6C7BA8", sky1: "#1E2740", sky2: "#3A3F63",
    hill1: "#3E4A6B", hill2: "#2C3654", hill3: "#1B2238",
    // La única variante de fondo oscuro: su "noche" es más profunda todavía,
    // para que la sección del pase siga separándose del resto.
    night: "#0F1526", nightInk: "#F1E9DA",
  },
  Bosque: {
    etiqueta: "Bosque",
    bg: "#EAE6D8", bg2: "#DDD8C6", ink: "#1F2B25", ink2: "#5E6B64",
    acc: "#B87333", acc2: "#2F5D4A", sky1: "#EAE6D8", sky2: "#D6D9C4",
    hill1: "#A9B8A2", hill2: "#5C7F68", hill3: "#2F4A3C",
    night: "#2E2C3D", nightInk: "#F3EBDD",
  },
  Rosa: {
    etiqueta: "Rosa empolvado",
    bg: "#F4E6E2", bg2: "#EBD6D0", ink: "#3A2A2E", ink2: "#7C666B",
    acc: "#7A2A3B", acc2: "#D9A5A0", sky1: "#F4E6E2", sky2: "#EBC9C2",
    hill1: "#D9B9B4", hill2: "#B98C8A", hill3: "#7A5C60",
    night: "#2E2C3D", nightInk: "#F3EBDD",
  },
  Vinedo: {
    etiqueta: "Viñedo",
    bg: "#F3EBDD", bg2: "#E7DCC8", ink: "#2E2530", ink2: "#6E6470",
    acc: "#6B3A5B", acc2: "#C9A24D", sky1: "#F3EBDD", sky2: "#E4CDBE",
    hill1: "#C3B5A6", hill2: "#8A6E7E", hill3: "#4E3A4C",
    night: "#2E2C3D", nightInk: "#F3EBDD",
  },
};

/** Las familias de la sub-colección y su archivo base. */
const FAMILIAS = [
  { archivo: "JardinDePapelTemplate", componente: "JardinDePapelTemplate", base: "Jardín" },
];

function bloqueDePaleta(p) {
  return `const PALETA = {
  bg: "${p.bg}",
  bg2: "${p.bg2}",
  ink: "${p.ink}",
  ink2: "${p.ink2}",
  acc: "${p.acc}",
  acc2: "${p.acc2}",
  sky1: "${p.sky1}",
  sky2: "${p.sky2}",
  hill1: "${p.hill1}",
  hill2: "${p.hill2}",
  hill3: "${p.hill3}",
  night: "${p.night}",
  nightInk: "${p.nightInk}",
};`;
}

const RE_PALETA = /const PALETA = \{[\s\S]*?\n\};/;

let total = 0;
for (const fam of FAMILIAS) {
  const origen = path.join(DIR, `${fam.archivo}.tsx`);
  const fuente = fs.readFileSync(origen, "utf8");
  if (!RE_PALETA.test(fuente)) {
    console.error(`${fam.archivo}: no encontré el bloque PALETA — ¿cambió el formato?`);
    process.exitCode = 1;
    continue;
  }

  const hechas = [];
  for (const [sufijo, paleta] of Object.entries(PALETAS)) {
    let salida = fuente
      .replace(RE_PALETA, bloqueDePaleta(paleta))
      .replace(` * Variante: ${fam.base} (base)`, ` * Variante: ${paleta.etiqueta}`)
      .replace(
        `export function ${fam.componente}(`,
        `export function ${fam.componente}${sufijo}(`
      );

    // Aviso de archivo generado, justo después del "use client".
    salida = salida.replace(
      `"use client";\n`,
      `"use client";\n\n// GENERADO por scripts/gen-capas-de-papel-variants.js a partir de\n// ${fam.archivo}.tsx — no editar a mano: los cambios se pierden al regenerar.\n`
    );

    const destino = path.join(DIR, `${fam.archivo}${sufijo}.tsx`);
    fs.writeFileSync(destino, salida);
    hechas.push(`${sufijo} (${paleta.acc})`);
    total++;
  }

  // Control: las cinco tienen que terminar con acentos distintos. Si dos
  // coinciden, el reemplazo no funcionó y el wizard mostraría dos variantes
  // que se ven iguales.
  const acentos = new Set([fuente.match(/acc: "(#[0-9A-Fa-f]{6})"/)[1], ...Object.values(PALETAS).map((p) => p.acc)]);
  if (acentos.size !== Object.keys(PALETAS).length + 1) {
    console.error(`${fam.archivo}: hay acentos repetidos entre variantes`);
    process.exitCode = 1;
  }
  console.log(`${fam.archivo}: ${hechas.length} variantes — ${hechas.join(", ")}`);
}
console.log(`${total} archivos generados.`);
