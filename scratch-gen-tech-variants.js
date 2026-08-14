// Scratch script (NOT part of the app) — genera las variantes de color de
// HologramaTemplate / CircuitoTemplate / Cristal3DTemplate por sustitución
// de string sobre el archivo base, siguiendo el patrón de la sección 2.4 de
// docs/GUIA_TECNICA_PLANTILLAS.md. El ACENTO PRINCIPAL (--t-acc, que es el
// hex más repetido/visible del archivo: countdown, kickers, bordes) cambia
// de verdad en cada variante -- no un token secundario.
//
// Volver a correr este script cada vez que se edite sustancialmente
// HologramaTemplate.tsx / CircuitoTemplate.tsx / Cristal3DTemplate.tsx (JSX,
// doodles, animaciones, estructura), si no las variantes quedan
// desincronizadas del base silenciosamente.
const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "src/components/templates");

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function replaceRgba(src, fromHex, toHex) {
  const from = hexToRgb(fromHex);
  const to = hexToRgb(toHex);
  const re = new RegExp(
    `rgba\\(\\s*${from.r}\\s*,\\s*${from.g}\\s*,\\s*${from.b}\\s*,\\s*([0-9.]+)\\s*\\)`,
    "g"
  );
  return src.replace(re, (_, alpha) => `rgba(${to.r},${to.g},${to.b},${alpha})`);
}

function genVariants(baseFile, baseName, accentHex, accent2Hex, variants) {
  const srcPath = path.join(DIR, baseFile);
  const baseSrc = fs.readFileSync(srcPath, "utf8");

  for (const v of variants) {
    let out = baseSrc;
    // Acento principal (--t-acc / --c-accent y todo lo que dependa de él) --
    // es el cambio que realmente importa (sección 2.4 de la guía).
    out = replaceRgba(out, accentHex, v.accent);
    out = out.split(accentHex).join(v.accent);
    // Acento secundario (--t-acc2) -- puede repetirse entre variantes, pero
    // acá también lo variamos para que se sienta un paquete de color
    // coherente y no solo un retinte de un botón.
    out = replaceRgba(out, accent2Hex, v.accent2);
    out = out.split(accent2Hex).join(v.accent2);
    // Rename de identificador (componente + interfaz de props).
    out = out.split(baseName).join(`${baseName}${v.name}`);

    fs.writeFileSync(path.join(DIR, `${baseName}${v.name}.tsx`), out, "utf8");
    console.log(`Wrote ${baseName}${v.name}.tsx (acc=${v.accent} acc2=${v.accent2})`);
  }
}

// ---- Holograma (base: --t-acc #A78BFA violeta, --t-acc2 #22D3EE cian) ----
genVariants("HologramaTemplate.tsx", "HologramaTemplate", "#A78BFA", "#22D3EE", [
  { name: "Rosa",      accent: "#FF6FD8", accent2: "#7C4DFF" },
  { name: "Esmeralda", accent: "#2EE6A8", accent2: "#22D3EE" },
  { name: "Dorado",    accent: "#F5C452", accent2: "#A78BFA" },
  { name: "Azul",      accent: "#5B8CFF", accent2: "#B9A6FF" },
  { name: "Coral",     accent: "#FF8A65", accent2: "#22D3EE" },
]);

// ---- Circuito (base: --t-acc #39FFD0 verde terminal, --t-acc2 #FF2E9B magenta) ----
genVariants("CircuitoTemplate.tsx", "CircuitoTemplate", "#39FFD0", "#FF2E9B", [
  { name: "Rojo",    accent: "#FF3B3B", accent2: "#FFD23B" },
  { name: "Ambar",   accent: "#FFB020", accent2: "#39FFD0" },
  { name: "Violeta", accent: "#B14EFF", accent2: "#39FFD0" },
  { name: "Azul",    accent: "#3ED0FF", accent2: "#FF2E9B" },
  { name: "Lima",    accent: "#C6FF3B", accent2: "#FF2E9B" },
]);

// ---- Cristal3D (base: --t-acc #8FD3FF celeste, --t-acc2 #B9A6FF lavanda) ----
genVariants("Cristal3DTemplate.tsx", "Cristal3DTemplate", "#8FD3FF", "#B9A6FF", [
  { name: "RosaCuarzo", accent: "#FFB3D1", accent2: "#B9A6FF" },
  { name: "Esmeralda",  accent: "#7CF2C0", accent2: "#8FD3FF" },
  { name: "Ambar",      accent: "#FFCB77", accent2: "#FF9AD5" },
  { name: "Violeta",    accent: "#C4A6FF", accent2: "#8FD3FF" },
  { name: "Menta",      accent: "#8FFFE0", accent2: "#B9A6FF" },
]);
