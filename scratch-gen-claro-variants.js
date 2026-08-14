// Genera las variantes CLARAS (tema claro) de Corporate y Loft Industrial,
// que son plantillas de tema oscuro por defecto. Sigue el patrón de Chic
// (sección 3.4/3.5 de la guía): variable de tinta propia + revisión
// individual de cada instancia de texto/fondo invertido (no un swap
// mecánico ciego, porque algunos tokens de "fondo oscuro" se reusan como
// "color de texto oscuro sobre tarjeta clara" en un par de puntos).
const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "src", "components", "templates");

function build(baseFileName, baseComponentName, variantName, opts) {
  const file = path.join(DIR, baseFileName);
  let s = fs.readFileSync(file, "utf8");

  // 1) Rename component identifier.
  s = s.split(baseComponentName).join(`${baseComponentName}${variantName}`);

  // 2) Accent: cambia en TODOS lados (acento principal, el que tiene que
  //    variar de verdad).
  s = s.split(opts.accentFrom).join(opts.accentTo);

  // 3) Surface (tarjetas oscuras -> tarjetas claras) y muted (texto
  //    secundario) -- uso consistente en todo el archivo, sin trampas.
  s = s.split(opts.surfaceFrom).join(opts.surfaceTo);
  s = s.split(opts.mutedFrom).join(opts.mutedTo);

  // 4) Ink (texto claro sobre fondo oscuro -> texto oscuro) y Bg (fondo
  //    oscuro -> fondo claro) -- swap general primero...
  s = s.split(opts.inkFrom).join(opts.inkTo);
  s = s.split(opts.bgFrom).join(opts.bgTo);

  // 5) ...y ahora las excepciones puntuales (sección 3.5): instancias
  //    donde el token de "bg oscuro" se reusaba como "texto oscuro sobre
  //    tarjeta/botón claro", que el swap general de arriba dejó mal
  //    (terminaron con el nuevo BG claro como *color de texto*, invisible).
  for (const fix of opts.exceptions) {
    if (!s.includes(fix.from)) {
      throw new Error(`Excepción no encontrada (¿el archivo base cambió?): ${fix.from}`);
    }
    s = s.replace(fix.from, fix.to);
  }

  // 6) Variable de tinta propia, agregada en AMBOS wrappers (mobile +
  //    desktop-stage) -- ver sección 3.2/3.4 de la guía.
  const inkVarLine = `        "${opts.inkVarName}": "${opts.inkTo}",\n`;
  s = s.replace(
    /("--t-muted": "[^"]+",\n)(\s*} as React\.CSSProperties}\s*\n\s*>)/,
    `$1${inkVarLine}$2`
  );
  s = s.replace(
    /("--t-muted": "[^"]+",\n)(\s*} as React\.CSSProperties}>\s*\n\s*<aside)/,
    `$1${inkVarLine}$2`
  );

  const outName = `${baseFileName.replace(".tsx", "")}${variantName}.tsx`;
  fs.writeFileSync(path.join(DIR, outName), s);
  console.log(`-> ${outName}`);
}

// ---------------------------------------------------------------------
// CORPORATE -> Claro (corp-light del mockup real)
build("CorporateTemplate.tsx", "CorporateTemplate", "Claro", {
  accentFrom: "#5C8DFF", accentTo: "#2952E3",
  surfaceFrom: "#171B27", surfaceTo: "#EBEDF2",
  mutedFrom: "#8990A6", mutedTo: "#5C6478",
  inkFrom: "#EDEFF5", inkTo: "#141A2E",
  bgFrom: "#10131C", bgTo: "#F5F6F8",
  inkVarName: "--corporate-ink",
  exceptions: [
    // .moderno-light-card h4 -- texto oscuro sobre tarjeta SIEMPRE clara,
    // no debe seguir al bg general (quedaría F5F6F8 sobre F5F6F8 = invisible).
    { from: ".moderno-light-card h4 {\n          color: #F5F6F8 !important;", to: ".moderno-light-card h4 {\n          color: #141A2E !important;" },
    // .t-btn / .copy-btn con fondo = accento (#2952E3, azul saturado): el
    // texto oscuro (141A2E) tendría bajo contraste ahí -- blanco es más
    // legible sobre este azul más saturado que el de la variante oscura.
    { from: "background-color: #2952E3 !important;\n          color: #F5F6F8 !important;\n          font-weight: 600 !important;\n          border: none !important;\n          text-transform: uppercase !important;\n          letter-spacing: 0.1em !important;\n          font-size: 13px !important;\n        }\n        #rsvp.section.dark div:has", to: "background-color: #2952E3 !important;\n          color: #FFFFFF !important;\n          font-weight: 600 !important;\n          border: none !important;\n          text-transform: uppercase !important;\n          letter-spacing: 0.1em !important;\n          font-size: 13px !important;\n        }\n        #rsvp.section.dark div:has" },
    { from: "#banco .copy-btn {\n          background-color: #2952E3 !important;\n          color: #F5F6F8 !important;", to: "#banco .copy-btn {\n          background-color: #2952E3 !important;\n          color: #FFFFFF !important;" },
    // #banco .copy-btn.copied -- fondo BLANCO explícito, el texto tiene que
    // quedar oscuro (ink), no heredar el bg claro (blanco sobre blanco).
    { from: "#banco .copy-btn.copied {\n          background-color: #FFFFFF !important;\n          color: #F5F6F8 !important;", to: "#banco .copy-btn.copied {\n          background-color: #FFFFFF !important;\n          color: #141A2E !important;" },
    // Hover del botón "Abrir invitación" (ghost -> fill accento): mismo
    // motivo de contraste que el .t-btn de arriba.
    { from: "e.currentTarget.style.background = '#2952E3'; e.currentTarget.style.color = '#F5F6F8';", to: "e.currentTarget.style.background = '#2952E3'; e.currentTarget.style.color = '#FFFFFF';" },
  ],
});

// ---------------------------------------------------------------------
// LOFT INDUSTRIAL -> Claro (loft-light del mockup real)
// Nota de orden: las excepciones corren DESPUÉS de los 5 swaps generales
// (accent/surface/muted/ink/bg), así que sus strings "from" ya reflejan el
// acento nuevo (#C0392B) -- #000000 no es ninguno de los 5 tokens
// rastreados así que no lo toca ningún swap general, se mantiene igual en
// RSVP/footer/bottom-nav (panel de contraste fuerte, coherente con el resto
// de las plantillas claras que también mantienen su nav pill oscuro).
build("LoftIndustrialTemplate.tsx", "LoftIndustrialTemplate", "Claro", {
  accentFrom: "#E0B84B", accentTo: "#C0392B",
  surfaceFrom: "#1C1C1C", surfaceTo: "#E6E4DE",
  mutedFrom: "#9C9992", mutedTo: "#6b6862",
  inkFrom: "#F0EFEC", inkTo: "#161513",
  bgFrom: "#121212", bgTo: "#F2F1EE",
  inkVarName: "--loftindustrial-ink",
  exceptions: [
    // .moderno-light-card h4 -- texto oscuro sobre tarjeta SIEMPRE clara,
    // no debe seguir al bg general (quedaría F2F1EE sobre F2F1EE = invisible).
    { from: ".moderno-light-card h4 {\n          color: #F2F1EE !important;", to: ".moderno-light-card h4 {\n          color: #161513 !important;" },
    // .t-btn con fondo = acento nuevo (#C0392B, rojo óxido oscuro): el
    // texto quedó en #000000 (no es ninguno de los 5 tokens rastreados, no
    // lo tocó ningún swap) -- negro sobre rojo oscuro es bajo contraste,
    // blanco es más legible.
    { from: "background-color: #C0392B !important;\n          color: #000000 !important;\n          font-weight: 700 !important;\n          border: 1px solid #C0392B !important;", to: "background-color: #C0392B !important;\n          color: #FFFFFF !important;\n          font-weight: 700 !important;\n          border: 1px solid #C0392B !important;" },
    // #banco .copy-btn -- mismo caso que el .t-btn de arriba.
    { from: "#banco .copy-btn {\n          background-color: #C0392B !important;\n          color: #000000 !important;", to: "#banco .copy-btn {\n          background-color: #C0392B !important;\n          color: #FFFFFF !important;" },
  ],
});

console.log("Listo.");
