// Generador de variantes de color para CineTemplate.tsx (script de una sola
// vez, ver docs/GUIA_TECNICA_PLANTILLAS.md sección 2.4). Sustituye SOLO el
// acento principal (--t-acc y sus rgba() derivados) -- el resto de la
// paleta (fondo/superficie/muted) se mantiene igual entre variantes, que es
// el mismo patrón usado por ChicTemplate/NeonTemplate.
//
// Uso: node scripts/gen-cine-variants.js
const fs = require("fs");
const path = require("path");

const baseFile = path.join(__dirname, "..", "src", "components", "templates", "CineTemplate.tsx");
const baseSrc = fs.readFileSync(baseFile, "utf8");

const BASE_ACCENT_HEX = "#C08A3E";
const BASE_ACCENT_RGB = "192,138,62";

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}

const variants = [
  // Sepia (default/base) no se regenera -- ya es CineTemplate.tsx.
  { name: "Noir", accent: "#8FA3B0" },       // film-noir: plata azulado, frío
  { name: "Tecnicolor", accent: "#C1442E" }, // rojo saturado tipo tecnicolor
  { name: "Esmeralda", accent: "#5B8A72" },  // verde vintage de cine de archivo
  { name: "Borgona", accent: "#8C4A56" },    // vino/terciopelo de sala de cine (sin ñ: consistencia de nombres de archivo ASCII con el resto del repo)
];

for (const v of variants) {
  const accentRgb = hexToRgb(v.accent);
  let s = baseSrc;
  // rgba() derivados del acento (espacio opcional tras la coma, ver sed que
  // generó el base -- algunas quedaron "192,138,62" y otra "192,138,62, 0.2")
  s = s.split(BASE_ACCENT_RGB).join(accentRgb);
  // Hex literal del acento (todas las mayúsculas usadas en el archivo)
  s = s.split(BASE_ACCENT_HEX).join(v.accent);
  // Rename de identificador: componente + interfaz de props
  s = s.split("CineTemplate").join(`CineTemplate${v.name}`);
  const outFile = path.join(__dirname, "..", "src", "components", "templates", `CineTemplate${v.name}.tsx`);
  fs.writeFileSync(outFile, s);
  console.log(`Generado: ${outFile}`);
}
