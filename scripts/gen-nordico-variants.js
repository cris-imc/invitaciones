// Generador de variantes de color para NordicoTemplate.tsx (ver
// docs/GUIA_TECNICA_PLANTILLAS.md sección 2.4). Sustituye SOLO el acento
// principal (--t-acc y sus rgba() derivados) -- el resto de la paleta
// (blanco/negro/hairlines) se mantiene igual entre variantes.
//
// Uso: node scripts/gen-nordico-variants.js
const fs = require("fs");
const path = require("path");

const baseFile = path.join(__dirname, "..", "src", "components", "templates", "NordicoTemplate.tsx");
const baseSrc = fs.readFileSync(baseFile, "utf8");

const BASE_ACCENT_HEX = "#5B5850";
const BASE_ACCENT_RGB = "91,88,80";

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}

const variants = [
  // Grafito (default/base) no se regenera -- ya es NordicoTemplate.tsx.
  { name: "Terracota", accent: "#B15E3D" },
  { name: "Bosque", accent: "#3F5D45" },
  { name: "Marino", accent: "#35507A" },
  { name: "Ocre", accent: "#A97D2A" },
];

for (const v of variants) {
  const accentRgb = hexToRgb(v.accent);
  let s = baseSrc;
  s = s.split(BASE_ACCENT_RGB).join(accentRgb);
  s = s.split(BASE_ACCENT_HEX).join(v.accent);
  s = s.split("NordicoTemplate").join(`NordicoTemplate${v.name}`);
  const outFile = path.join(__dirname, "..", "src", "components", "templates", `NordicoTemplate${v.name}.tsx`);
  fs.writeFileSync(outFile, s);
  console.log(`Generado: ${outFile}`);
}
