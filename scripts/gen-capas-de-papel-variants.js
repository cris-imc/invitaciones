#!/usr/bin/env node
/**
 * Genera las variantes de color de las familias de "Capas de papel"
 * (Colección Iconic).
 *
 * Una familia de Capas de papel es un paisaje de papel recortado dibujado una
 * sola vez; lo único que cambia entre variantes son los trece colores de la
 * PALETA, que los SVG leen como var(--pp-…). Por eso las variantes se generan
 * reemplazando ese bloque en vez de mantener cinco archivos de 2.100 líneas a
 * mano: un arreglo en el dibujo llega a las cinco con volver a correr esto.
 *
 * Las paletas viven en el mismo JSON que describe la familia
 * (scripts/familias/capas/*.json), al lado de sus fuentes y sus paneles, para
 * que no haya dos lugares donde mirar qué es una familia.
 *
 * Uso:
 *   node scripts/derivar-capas.js && node scripts/gen-capas-de-papel-variants.js
 */
const fs = require("node:fs");
const path = require("node:path");

const DIR = path.join(__dirname, "..", "src", "components", "templates");
const CONFIGS = path.join(__dirname, "familias", "capas");
const CLAVES = ["bg", "bg2", "ink", "ink2", "acc", "acc2", "sky1", "sky2", "hill1", "hill2", "hill3", "night", "nightInk"];

function bloqueDePaleta(p) {
  return ["const PALETA = {", ...CLAVES.map((k) => `  ${k}: "${p[k]}",`), "};"].join("\n");
}

const RE_PALETA = /const PALETA = \{[\s\S]*?\n\};/;

let total = 0;
const configs = fs.readdirSync(CONFIGS).filter((f) => f.endsWith(".json"));

for (const archivo of configs) {
  const fam = JSON.parse(fs.readFileSync(path.join(CONFIGS, archivo), "utf8"));
  const variantes = fam.variantes || {};
  if (!Object.keys(variantes).length) {
    console.log(`${fam.archivo}: sin variantes declaradas todavía`);
    continue;
  }

  const origen = path.join(DIR, `${fam.archivo}.tsx`);
  const fuente = fs.readFileSync(origen, "utf8");
  if (!RE_PALETA.test(fuente)) {
    console.error(`${fam.archivo}: no encontré el bloque PALETA — ¿cambió el formato?`);
    process.exitCode = 1;
    continue;
  }

  const hechas = [];
  for (const [sufijo, paleta] of Object.entries(variantes)) {
    const faltan = CLAVES.filter((k) => !paleta[k]);
    if (faltan.length) {
      console.error(`${fam.archivo} · ${sufijo}: le faltan colores (${faltan.join(", ")})`);
      process.exitCode = 1;
      continue;
    }
    let salida = fuente
      .replace(RE_PALETA, bloqueDePaleta(paleta))
      .replace(` * Variante: ${fam.varianteBase} (base)`, ` * Variante: ${paleta.etiqueta}`)
      .replace(`export function ${fam.archivo}(`, `export function ${fam.archivo}${sufijo}(`);

    // Aviso de archivo generado, justo después del "use client".
    salida = salida.replace(
      '"use client";\n',
      `"use client";\n\n// GENERADO por scripts/gen-capas-de-papel-variants.js a partir de\n// ${fam.archivo}.tsx — no editar a mano: los cambios se pierden al regenerar.\n`
    );

    fs.writeFileSync(path.join(DIR, `${fam.archivo}${sufijo}.tsx`), salida);
    hechas.push(`${sufijo} (${paleta.acc})`);
    total++;
  }

  // Control: los acentos tienen que ser todos distintos. Si dos coinciden, el
  // reemplazo no funcionó y el wizard mostraría dos variantes que se ven
  // iguales (guía §3.6).
  const acentos = new Set([fuente.match(/acc: "(#[0-9A-Fa-f]{6})"/)[1], ...Object.values(variantes).map((p) => p.acc)]);
  if (acentos.size !== Object.keys(variantes).length + 1) {
    console.error(`${fam.archivo}: hay acentos repetidos entre variantes`);
    process.exitCode = 1;
  }
  console.log(`${fam.archivo}: ${hechas.length} variantes — ${hechas.join(", ")}`);
}
console.log(`${total} archivos generados.`);
