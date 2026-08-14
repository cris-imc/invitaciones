/**
 * Generador de variantes de color para el pack "Cinemático" (Seda, Pétalos,
 * Luz de Luna). Como los 3 base (SedaTemplate.tsx, PetalosTemplate.tsx,
 * LuzLunaTemplate.tsx) definen TODO el theming vía CSS custom properties en
 * los dos wrappers (mobile + desktop-stage) -- ver comentario de cabecera de
 * cada archivo -- generar una variante es simplemente sustituir el bloque de
 * 6 valores hex del tema por los del mockup, más renombrar el identificador
 * del componente. No hay hex hardcodeado suelto en el resto del JSX, así que
 * no hace falta ninguna otra sustitución (evita la trampa de "inversión
 * mecánica" de la guía técnica sección 3.5).
 *
 * Uso: node scratch-gen-cinematico-variants.js
 */
const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "src", "components", "templates");

function genVariants(baseName, baseTokens, variants) {
  const baseSrc = fs.readFileSync(path.join(DIR, `${baseName}.tsx`), "utf8");
  for (const v of variants) {
    let s = baseSrc;
    // Sustitución en DOS fases con placeholders únicos en vez de
    // reemplazo directo valor-a-valor: si el hex de destino de un token
    // (ej. el dorado #D9BFA0, que es "acc2" en la base pero "acc" en
    // Nocturna/Esmeralda) coincide con el hex base de OTRO token que
    // todavía no se procesó, un reemplazo secuencial directo pisa el
    // valor recién insertado (bug real detectado generando Nocturna:
    // --t-acc terminaba igual a --t-acc2). Los placeholders evitan que
    // un valor final pueda volver a matchear como si fuera un token base.
    const keys = ["acc", "acc2", "bg", "surface", "muted", "ink"];
    for (const k of keys) {
      s = s.split(baseTokens[k]).join(`@@${k.toUpperCase()}@@`);
    }
    for (const k of keys) {
      s = s.split(`@@${k.toUpperCase()}@@`).join(v[k]);
    }
    s = s.split(baseName).join(`${baseName}${v.name}`);
    const outPath = path.join(DIR, `${baseName}${v.name}.tsx`);
    fs.writeFileSync(outPath, s);
    console.log("Generado:", outPath);
  }
}

// ---------------------------------------------------------------------
// SEDA -- base Valentina (Seda Champagne), tema claro
// ---------------------------------------------------------------------
genVariants(
  "SedaTemplate",
  { acc: "#C9A0A6", acc2: "#D9BFA0", bg: "#FBF3EE", surface: "#F5E6DC", muted: "#8a6f68", ink: "#3B2A28" },
  [
    // Catalina (Seda Nocturna) -- mockup real, tema oscuro
    { name: "Nocturna", acc: "#8C4A52", acc2: "#D9BFA0", bg: "#241417", surface: "#331B20", muted: "#C9A8A0", ink: "#F3E4DC" },
    // Valeria & Franco (Seda Marfil) -- mockup real, tema claro
    { name: "Marfil", acc: "#B98D57", acc2: "#D9BFA0", bg: "#FBF6EE", surface: "#F3E9D6", muted: "#8a7a68", ink: "#332A22" },
    // Renata & Tomás (Seda Esmeralda) -- mockup real, tema oscuro
    { name: "Esmeralda", acc: "#3D6E58", acc2: "#D9BFA0", bg: "#122019", surface: "#1B3026", muted: "#A8C2B4", ink: "#EFE7D8" },
    // Perla -- variante propia (no está en el mockup), tema claro, acento
    // azul-grisáceo frío para dar una 5ta opción con más contraste de tono.
    { name: "Perla", acc: "#8FA3B0", acc2: "#C9A876", bg: "#F5F7F8", surface: "#EAEFF1", muted: "#6b7c85", ink: "#263238" },
  ]
);

// ---------------------------------------------------------------------
// PÉTALOS -- base Emilia (Pétalos Rojo Vibrante), tema claro
// ---------------------------------------------------------------------
genVariants(
  "PetalosTemplate",
  { acc: "#E23B4E", acc2: "#B5142A", bg: "#FFF1EF", surface: "#FFDEDA", muted: "#8f4a4f", ink: "#3D1418" },
  [
    // Olivia (Pétalos Pastel) -- mockup real, tema claro
    { name: "Pastel", acc: "#F0B8C6", acc2: "#D98BA0", bg: "#FFF8F9", surface: "#FDEFF2", muted: "#9a6f79", ink: "#4A2E35" },
    // Sofía & Nicolás (Vino Vibrante) -- mockup real, tema oscuro
    { name: "VinoVibrante", acc: "#8C1B2A", acc2: "#E23B4E", bg: "#2B0E14", surface: "#3B131B", muted: "#C99AA1", ink: "#F6E4E6" },
    // Martina & Iván (Rosa Pastel) -- mockup real, tema claro
    { name: "RosaPastel", acc: "#E8A8BC", acc2: "#C77E96", bg: "#FFF7F8", surface: "#FCE9EE", muted: "#93707a", ink: "#452832" },
    // Coral -- variante propia (no está en el mockup), tema claro, acento
    // coral/durazno para dar una 5ta opción más cálida y menos rosada.
    { name: "Coral", acc: "#F2946B", acc2: "#D9673A", bg: "#FFF5EE", surface: "#FCE4D6", muted: "#9C6B54", ink: "#3D241A" },
  ]
);

// ---------------------------------------------------------------------
// LUZ DE LUNA -- base Isabella (Luz de Luna Nocturna), tema oscuro
// ---------------------------------------------------------------------
genVariants(
  "LuzLunaTemplate",
  { acc: "#B9A6D9", acc2: "#7C6BB0", bg: "#171425", surface: "#211C36", muted: "#A79BD6", ink: "#EDE7FB" },
  [
    // Antonella (Luz de Luna Perlada) -- mockup real, tema claro
    { name: "Perlada", acc: "#C9B8E8", acc2: "#E8C9DE", bg: "#F7F3FC", surface: "#EFE7F8", muted: "#8579a0", ink: "#3D3550" },
    // Camila & Bruno (Noche Estrellada) -- mockup real, tema oscuro
    { name: "NocheEstrellada", acc: "#9FB3E8", acc2: "#5C6BB0", bg: "#12121F", surface: "#1B1B30", muted: "#A6A2D6", ink: "#E9E7FB" },
    // Julia & Gastón (Perla Suave) -- mockup real, tema claro
    { name: "PerlaSuave", acc: "#7C93B0", acc2: "#B9A6D9", bg: "#F4F1F9", surface: "#E9E2F3", muted: "#847ba0", ink: "#3A3450" },
    // Medianoche Azul -- variante propia (no está en el mockup), tema
    // oscuro, acento azul cielo/índigo para dar una 5ta opción más fría.
    { name: "MedianocheAzul", acc: "#7EA3D9", acc2: "#4A5FA0", bg: "#0F1420", surface: "#182036", muted: "#8FA0C4", ink: "#E4E9F5" },
  ]
);

console.log("Listo.");
