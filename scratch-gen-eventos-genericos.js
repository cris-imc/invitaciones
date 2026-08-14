// Script scratch (no hace falta commitear) para generar las variantes de
// color de Corporate / Garden Party / Loft Industrial / Infantil por
// sustitución de string sobre el archivo base, siguiendo el patrón de la
// sección 2.4 de docs/GUIA_TECNICA_PLANTILLAS.md.
//
// Uso: node scratch-gen-eventos-genericos.js
const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "src", "components", "templates");

function replaceAll(str, from, to) {
  if (!from || from === to) return str;
  return str.split(from).join(to);
}

function genVariants(baseFileName, baseComponentName, tokenMap, variants) {
  const baseSrc = fs.readFileSync(path.join(DIR, baseFileName), "utf8");
  const keys = Object.keys(tokenMap);
  for (const v of variants) {
    let s = baseSrc;
    // Paso 1: cada hex "from" -> un placeholder único (evita que un swap
    // accent<->accent2, por ejemplo, se pise a sí mismo si se reemplazara
    // directo hex-a-hex en pasadas secuenciales).
    keys.forEach((key, i) => {
      s = replaceAll(s, tokenMap[key], `__TOKEN_${i}__`);
    });
    // Paso 2: cada placeholder -> el hex final de la variante.
    keys.forEach((key, i) => {
      const toHex = v.colors[key] || tokenMap[key];
      s = replaceAll(s, `__TOKEN_${i}__`, toHex);
    });
    s = replaceAll(s, baseComponentName, `${baseComponentName}${v.name}`);
    const outName = `${baseFileName.replace(".tsx", "")}${v.name}.tsx`;
    fs.writeFileSync(path.join(DIR, outName), s);
    console.log(`  -> ${outName}`);
  }
}

// ---------------------------------------------------------------------
// CORPORATE (dark base) -- acento azul #5C8DFF es el token que más tiene
// que variar; bg/surface se retintan como bonus, ink/muted quedan fijos.
console.log("Corporate:");
genVariants(
  "CorporateTemplate.tsx",
  "CorporateTemplate",
  { accent: "#5C8DFF", bg: "#10131C", surface: "#171B27" },
  [
    { name: "Verde",  colors: { accent: "#34C77B", bg: "#0E1512", surface: "#16211C" } },
    { name: "Violeta", colors: { accent: "#8B7CF6", bg: "#14101C", surface: "#1E1828" } },
    { name: "Bordo",  colors: { accent: "#D9536B", bg: "#1A1013", surface: "#241419" } },
  ]
);

// ---------------------------------------------------------------------
// GARDEN PARTY (light base) -- acento terracota #D97757 + acento2 salvia
// #7C9473 son los que tienen que variar. La variante "Vibrante" viene del
// mockup real (Garden Vibrante) y también retinta ink/inkSoft.
console.log("GardenParty:");
genVariants(
  "GardenPartyTemplate.tsx",
  "GardenPartyTemplate",
  { accent: "#D97757", accent2: "#7C9473", bg: "#FBF4EC", bg2: "#F5E6D6", ink: "#3A2A22", inkSoft: "#8a7462" },
  [
    { name: "Vibrante", colors: { accent: "#FF5A36", accent2: "#2FA88A", bg: "#FFF4F0", bg2: "#FFE1D6", ink: "#411D14", inkSoft: "#9c5a45" } },
    { name: "Amarillo", colors: { accent: "#E8A33D", accent2: "#6B8F71" } },
    { name: "Rosa",     colors: { accent: "#E0709A", accent2: "#7C9473", bg: "#FDF1F3", bg2: "#F7E2E8" } },
    { name: "Lavanda",  colors: { accent: "#8B7FD1", accent2: "#7C9473", bg: "#F7F3FC", bg2: "#ECE3F7" } },
  ]
);

// ---------------------------------------------------------------------
// LOFT INDUSTRIAL (dark base) -- acento dorado/latón #E0B84B es el que
// tiene que variar; bg/surface se retintan, ink/muted/negro puro fijos.
console.log("LoftIndustrial:");
genVariants(
  "LoftIndustrialTemplate.tsx",
  "LoftIndustrialTemplate",
  { accent: "#E0B84B", bg: "#121212", surface: "#1C1C1C" },
  [
    { name: "Cobre", colors: { accent: "#D2691E", bg: "#151210", surface: "#201A16" } },
    { name: "Acero", colors: { accent: "#6FA8CC", bg: "#10141A", surface: "#1A1F26" } },
    { name: "Verde", colors: { accent: "#7FA65C", bg: "#10140F", surface: "#1A2016" } },
  ]
);

// ---------------------------------------------------------------------
// INFANTIL (light base, diseño único) -- acento coral #FF5C8A y acento2
// lavanda #9B7FE8 son los que varían; bg/crema/tinta/panel oscuro RSVP
// (#241B38) quedan fijos (estructura del diseño, no del color de marca).
console.log("Infantil:");
genVariants(
  "InfantilTemplate.tsx",
  "InfantilTemplate",
  { accent: "#FF5C8A", accent2: "#9B7FE8" },
  [
    { name: "Lavanda",  colors: { accent: "#9B7FE8", accent2: "#FF5C8A" } },
    { name: "Menta",    colors: { accent: "#29B38A", accent2: "#FF8AA6" } },
    { name: "Amarillo", colors: { accent: "#FFB627", accent2: "#9B7FE8" } },
    { name: "Celeste",  colors: { accent: "#4FB8E8", accent2: "#FF5C8A" } },
  ]
);

console.log("Listo.");
