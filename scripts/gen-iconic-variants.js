#!/usr/bin/env node
/**
 * Genera las variantes de color de TODA la Colección Iconic: las de "Capas de
 * papel" y las de "Tipográfica Editorial".
 *
 * Las dos sub-colecciones comparten el mismo bloque PALETA de trece claves,
 * así que comparten generador. En Capas de papel las trece se usan (los SVG
 * del paisaje leen var(--pp-sky1), var(--pp-hill2)…); en Tipográfica sólo se
 * usan seis y las de paisaje se completan desde la tinta y el papel -- se
 * declaran igual para no tener dos generadores casi iguales.
 *
 * Las paletas viven en la ficha de cada familia (scripts/familias/capas/ y
 * scripts/familias/tipografica/), al lado de sus fuentes.
 *
 * Uso:
 *   node scripts/derivar-capas.js && node scripts/derivar-tipografica.js \
 *     && node scripts/gen-iconic-variants.js
 */
const fs = require("node:fs");
const path = require("node:path");

const DIR = path.join(__dirname, "..", "src", "components", "templates");
const CARPETAS = [
  path.join(__dirname, "familias", "capas"),
  path.join(__dirname, "familias", "tipografica"),
];
const CLAVES = ["bg", "bg2", "ink", "ink2", "acc", "acc2", "sky1", "sky2", "hill1", "hill2", "hill3", "night", "nightInk"];

/** Completa las trece claves a partir de las seis que declara una ficha. */
function completa(p) {
  return {
    bg: p.bg, bg2: p.bg2 || p.bg, ink: p.ink, ink2: p.ink2 || p.ink,
    acc: p.acc, acc2: p.acc2 || p.acc,
    sky1: p.sky1 || p.bg, sky2: p.sky2 || p.bg2 || p.bg,
    hill1: p.hill1 || p.bg2 || p.bg, hill2: p.hill2 || p.ink2 || p.ink, hill3: p.hill3 || p.ink,
    night: p.night || p.ink, nightInk: p.nightInk || p.bg,
  };
}

function bloqueDePaleta(p) {
  return ["const PALETA = {", ...CLAVES.map((k) => `  ${k}: "${p[k]}",`), "};"].join("\n");
}

const RE_PALETA = /const PALETA = \{[\s\S]*?\n\};/;
let total = 0;

for (const carpeta of CARPETAS) {
  if (!fs.existsSync(carpeta)) continue;
  for (const archivo of fs.readdirSync(carpeta).filter((f) => f.endsWith(".json"))) {
    const fam = JSON.parse(fs.readFileSync(path.join(carpeta, archivo), "utf8"));
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
      const p = completa(paleta);
      const faltan = CLAVES.filter((k) => !p[k]);
      if (faltan.length) {
        console.error(`${fam.archivo} · ${sufijo}: le faltan colores (${faltan.join(", ")})`);
        process.exitCode = 1;
        continue;
      }
      let salida = fuente
        .replace(RE_PALETA, bloqueDePaleta(p))
        .replace(` * Variante: ${fam.varianteBase} (base)`, ` * Variante: ${paleta.etiqueta}`)
        .replace(`export function ${fam.archivo}(`, `export function ${fam.archivo}${sufijo}(`)
        .replace(
          '"use client";\n',
          `"use client";\n\n// GENERADO por scripts/gen-iconic-variants.js a partir de\n// ${fam.archivo}.tsx — no editar a mano: los cambios se pierden al regenerar.\n`
        );

      fs.writeFileSync(path.join(DIR, `${fam.archivo}${sufijo}.tsx`), salida);
      hechas.push(`${sufijo} (${p.acc})`);
      total++;
    }

    // Control: los acentos tienen que ser todos distintos, o el wizard muestra
    // dos variantes que se ven iguales (guía §3.6).
    const acentos = new Set([fuente.match(/acc: "(#[0-9A-Fa-f]{6})"/)[1], ...Object.values(variantes).map((p) => p.acc)]);
    if (acentos.size !== Object.keys(variantes).length + 1 && !fam.acentosIguales) {
      console.error(`${fam.archivo}: hay acentos repetidos entre variantes`);
      process.exitCode = 1;
    }
    console.log(`${fam.archivo}: ${hechas.length} variantes — ${hechas.join(", ")}`);
  }
}
console.log(`${total} archivos generados.`);
