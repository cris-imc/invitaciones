#!/usr/bin/env node
/**
 * Genera las variantes de color de las familias de Papelería Viva (Colección
 * Paper).
 *
 * Acá una variante son CUATRO colores, no uno: los dos papeles y los dos
 * acentos (el lacre y el dorado). Es lo que separa a esta sub-colección de
 * Papel Prensado, que es monocroma y cambia sólo el tono del papel.
 *
 * Uso:  node scripts/gen-papeleria-viva-variants.js [familia]
 */
const fs = require("node:fs");
const path = require("node:path");

const DIR = path.join(__dirname, "..", "src", "components", "templates");

const FAMILIAS = {
  sobreSello: {
    archivo: "SobreSelloTemplate",
    base: { nombre: "Bordó", bg: "#F4EBE2", alt: "#EAE0D4", ink: "#2A2320", ink2: "#6E5E52", acc: "#7A2F3A", acc2: "#A8854E" },
    variantes: [
      { id: "Bosque", bg: "#F2EDE4", alt: "#E5E4D6", ink: "#23261F", ink2: "#5F6456", acc: "#1F5A47", acc2: "#8E7F53" },
      { id: "Tinta", bg: "#F3F0E9", alt: "#E4E4DF", ink: "#1E2430", ink2: "#5C6472", acc: "#24344D", acc2: "#8E7B4C" },
      { id: "Terracota", bg: "#F7EEE6", alt: "#EEDFD2", ink: "#2F241D", ink2: "#725E4E", acc: "#B8643C", acc2: "#83714A" },
      { id: "Oliva", bg: "#F4F1E6", alt: "#E7E5D3", ink: "#262619", ink2: "#636453", acc: "#6B6B3A", acc2: "#957F50" },
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
  const base = fs.readFileSync(path.join(DIR, `${fam.archivo}.tsx`), "utf8");

  const chequeos = [
    [`const PAPEL = "${fam.base.bg}";`, "PAPEL"],
    [`const PAPEL2 = "${fam.base.alt}";`, "PAPEL2"],
    [`const TINTA = "${fam.base.ink}";`, "TINTA"],
    [`const TINTA_SUAVE = "${fam.base.ink2}";`, "TINTA_SUAVE"],
    [`const ACENTO = "${fam.base.acc}";`, "ACENTO"],
    [`const ACENTO2 = "${fam.base.acc2}";`, "ACENTO2"],
    [`export function ${fam.archivo}(`, "export"],
  ];
  for (const [texto, que] of chequeos) {
    if (!base.includes(texto)) throw new Error(`${fam.archivo}: no encontré ${que} → "${texto}"`);
  }

  for (const v of fam.variantes) {
    let s = base;
    s = s.split(`const PAPEL = "${fam.base.bg}";`).join(`const PAPEL = "${v.bg}";`);
    s = s.split(`const PAPEL2 = "${fam.base.alt}";`).join(`const PAPEL2 = "${v.alt}";`);
    s = s.split(`const TINTA = "${fam.base.ink}";`).join(`const TINTA = "${v.ink}";`);
    s = s.split(`const TINTA_SUAVE = "${fam.base.ink2}";`).join(`const TINTA_SUAVE = "${v.ink2}";`);
    s = s.split(`const ACENTO = "${fam.base.acc}";`).join(`const ACENTO = "${v.acc}";`);
    s = s.split(`const ACENTO2 = "${fam.base.acc2}";`).join(`const ACENTO2 = "${v.acc2}";`);
    s = s.split(`const SH = "${rgbDe(fam.base.ink)}";`).join(`const SH = "${rgbDe(v.ink)}";`);
    s = s.split(`scrimColorRgb="${rgbDe(fam.base.bg)}"`).join(`scrimColorRgb="${rgbDe(v.bg)}"`);
    s = s.split(` * \"Sobre & Sello\". Variante: ${fam.base.nombre} (base)`).join(` * \"Sobre & Sello\". Variante: ${v.id} (generada, no editar a mano)`);
    s = s.split(fam.archivo).join(`${fam.archivo}${v.id}`);
    fs.writeFileSync(path.join(DIR, `${fam.archivo}${v.id}.tsx`), s);
  }

  const acentos = new Set([fam.base.acc, ...fam.variantes.map((v) => v.acc)]);
  if (acentos.size !== fam.variantes.length + 1) throw new Error(`${fam.archivo}: dos variantes con el mismo acento`);
  console.log(`${fam.archivo}: ${fam.variantes.length} variantes (${fam.variantes.map((v) => v.id).join(", ")}) — papel y acentos distintos en cada una`);
}

const pedidas = process.argv.slice(2);
(pedidas.length ? pedidas : Object.keys(FAMILIAS)).forEach(generar);
