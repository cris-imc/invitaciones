// Generador de variantes de color para RivieraTemplate.tsx (ver
// docs/GUIA_TECNICA_PLANTILLAS.md sección 2.4). Sustituye SOLO el acento
// principal (--t-acc y sus rgba() derivados) -- el resto de la paleta
// (lino/tinta café) se mantiene igual entre variantes.
//
// Uso: node scripts/gen-riviera-variants.js
const fs = require("fs");
const path = require("path");

const baseFile = path.join(__dirname, "..", "src", "components", "templates", "RivieraTemplate.tsx");
const baseSrc = fs.readFileSync(baseFile, "utf8");

const BASE_ACCENT_HEX = "#C1734A";
const BASE_ACCENT_RGB = "193,115,74";

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}

const variants = [
  // Terracota (default/base) no se regenera -- ya es RivieraTemplate.tsx.
  { name: "Oliva", accent: "#7A8F5E" },     // verde oliva mediterráneo
  { name: "Coral", accent: "#D97757" },     // coral cálido, más rosado que la terracota base
  { name: "Ocre", accent: "#C6963B" },      // ocre dorado tipo arena/atardecer
  { name: "Azulejo", accent: "#3E7C8C" },   // azul cerámica/Mediterráneo (azulejo portugués)
];

for (const v of variants) {
  const accentRgb = hexToRgb(v.accent);
  let s = baseSrc;
  s = s.split(BASE_ACCENT_RGB).join(accentRgb);
  s = s.split(BASE_ACCENT_HEX).join(v.accent);
  s = s.split("RivieraTemplate").join(`RivieraTemplate${v.name}`);
  const outFile = path.join(__dirname, "..", "src", "components", "templates", `RivieraTemplate${v.name}.tsx`);
  fs.writeFileSync(outFile, s);
  console.log(`Generado: ${outFile}`);
}
