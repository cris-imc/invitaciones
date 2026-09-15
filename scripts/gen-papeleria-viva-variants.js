#!/usr/bin/env node
/**
 * Genera las variantes de color de las familias de Papelería Viva (Colección
 * Paper).
 *
 * Acá una variante son CUATRO colores, no uno: los dos papeles y los dos
 * acentos (el lacre y el dorado). Es lo que separa a esta sub-colección de
 * Papel Prensado, que es monocroma y cambia sólo el tono del papel.
 *
 * Las paletas viven en la ficha de cada familia
 * (scripts/familias/papeleria/*.json), al lado de sus fuentes y sus doodles.
 *
 * Uso:
 *   node scripts/derivar-papeleria.js && node scripts/gen-papeleria-viva-variants.js
 */
const fs = require("node:fs");
const path = require("node:path");

const DIR = path.join(__dirname, "..", "src", "components", "templates");
const CONFIGS = path.join(__dirname, "familias", "papeleria");

function rgbDe(hex) {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}

let total = 0;
for (const archivo of fs.readdirSync(CONFIGS).filter((f) => f.endsWith(".json"))) {
  const fam = JSON.parse(fs.readFileSync(path.join(CONFIGS, archivo), "utf8"));
  const variantes = fam.variantes || {};
  if (!Object.keys(variantes).length) {
    console.log(`${fam.archivo}: sin variantes declaradas todavía`);
    continue;
  }

  const base = fs.readFileSync(path.join(DIR, `${fam.archivo}.tsx`), "utf8");
  const p = fam.paleta;
  const chequeos = [
    [`const PAPEL = "${p.bg}";`, "PAPEL"],
    [`const PAPEL2 = "${p.alt}";`, "PAPEL2"],
    [`const TINTA = "${p.ink}";`, "TINTA"],
    [`const TINTA_SUAVE = "${p.ink2}";`, "TINTA_SUAVE"],
    [`const ACENTO = "${p.acc}";`, "ACENTO"],
    [`const ACENTO2 = "${p.acc2}";`, "ACENTO2"],
    [`export function ${fam.archivo}(`, "export"],
  ];
  const falta = chequeos.find(([texto]) => !base.includes(texto));
  if (falta) {
    console.error(`${fam.archivo}: no encontré ${falta[1]} → "${falta[0]}"`);
    process.exitCode = 1;
    continue;
  }

  const hechas = [];
  for (const [sufijo, v] of Object.entries(variantes)) {
    let s = base
      .split(`const PAPEL = "${p.bg}";`).join(`const PAPEL = "${v.bg}";`)
      .split(`const PAPEL2 = "${p.alt}";`).join(`const PAPEL2 = "${v.alt}";`)
      .split(`const TINTA = "${p.ink}";`).join(`const TINTA = "${v.ink}";`)
      .split(`const TINTA_SUAVE = "${p.ink2}";`).join(`const TINTA_SUAVE = "${v.ink2}";`)
      .split(`const ACENTO = "${p.acc}";`).join(`const ACENTO = "${v.acc}";`)
      .split(`const ACENTO2 = "${p.acc2}";`).join(`const ACENTO2 = "${v.acc2}";`)
      .split(`const SH = "${rgbDe(p.ink)}";`).join(`const SH = "${rgbDe(v.ink)}";`)
      .split(`scrimColorRgb="${rgbDe(p.bg)}"`).join(`scrimColorRgb="${rgbDe(v.bg)}"`)
      .split(` * Variante: ${fam.varianteBase} (base).`).join(` * Variante: ${v.etiqueta} (generada, no editar a mano).`)
      .split(fam.archivo).join(`${fam.archivo}${sufijo}`);

    fs.writeFileSync(path.join(DIR, `${fam.archivo}${sufijo}.tsx`), s);
    hechas.push(`${sufijo} (${v.acc})`);
    total++;
  }

  const acentos = new Set([p.acc, ...Object.values(variantes).map((v) => v.acc)]);
  if (acentos.size !== Object.keys(variantes).length + 1) {
    console.error(`${fam.archivo}: dos variantes con el mismo acento`);
    process.exitCode = 1;
  }
  console.log(`${fam.archivo}: ${hechas.length} variantes — ${hechas.join(", ")}`);
}
console.log(`${total} archivos generados.`);
