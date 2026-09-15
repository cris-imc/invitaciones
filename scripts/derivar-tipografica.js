#!/usr/bin/env node
/**
 * Deriva una familia de "Tipográfica Editorial" (Colección Iconic) de la
 * base, EditorialBlancNoirTemplate.tsx.
 *
 * Las catorce familias de esta sub-colección comparten el motor (el de
 * Iconic) y la manera de componer: titulares enormes, kickers y folios en
 * mono, filetes, bloques de color a página completa y ni una imagen. Lo que
 * cambia de una a otra es lo que la hace reconocible en dos segundos:
 *
 *  - LAS CARAS. Press Start 2P no es Cinzel Decorative, y eso ES la familia.
 *  - LA PALETA, que acá suele tener tres acentos y no dos.
 *  - UN PUÑADO DE REGLAS PROPIAS (la ficha las trae en `cssExtra`): la sombra
 *    dura de Arcade, las estrellas de Shōjo, los bloques de Bauhaus.
 *
 * Todo eso vive en la ficha JSON de la familia
 * (scripts/familias/tipografica/), al lado de sus variantes de color.
 *
 * Uso:
 *   node scripts/derivar-tipografica.js scripts/familias/tipografica/arcade.json
 *   node scripts/derivar-tipografica.js        (todas)
 */
const fs = require("node:fs");
const path = require("node:path");

const DIR = path.join(__dirname, "..", "src", "components", "templates");
const CONFIGS = path.join(__dirname, "familias", "tipografica");
const L = (...l) => l.join("\n");
const CLAVES = ["bg", "bg2", "ink", "ink2", "acc", "acc2", "sky1", "sky2", "hill1", "hill2", "hill3", "night", "nightInk"];

/**
 * Las trece claves de la paleta a partir de las seis que declara la ficha.
 * Las de paisaje (sky, hill) existen sólo para compartir el generador de
 * variantes con Capas de papel: acá se mapean a la tinta y al papel.
 */
function paletaCompleta(p) {
  return {
    bg: p.bg, bg2: p.bg2 || p.bg, ink: p.ink, ink2: p.ink2 || p.ink,
    acc: p.acc, acc2: p.acc2 || p.acc,
    sky1: p.bg, sky2: p.bg2 || p.bg, hill1: p.bg2 || p.bg, hill2: p.ink2 || p.ink, hill3: p.ink,
    night: p.night || p.ink, nightInk: p.nightInk || p.bg,
  };
}

function bloqueDePaleta(p) {
  return L("const PALETA = {", ...CLAVES.map((k) => `  ${k}: "${p[k]}",`), "};");
}

function derivar(rutaJson) {
  const fam = JSON.parse(fs.readFileSync(rutaJson, "utf8"));
  if (fam.esBase) return;
  let s = fs.readFileSync(path.join(DIR, "EditorialBlancNoirTemplate.tsx"), "utf8");
  const faltantes = [];
  const rep = (a, b, etiqueta) => {
    if (!s.includes(a)) { faltantes.push(etiqueta); return; }
    s = s.split(a).join(b);
  };

  const P = fam.prefijo;

  // ── 1. Identidad ────────────────────────────────────────────────────────
  s = s.replace(/\bebn-/g, `${P}-`)
    .replace(/--ebn-/g, `--${P}-`)
    .replace(/ebnSerif/g, `${P}Serif`)
    .replace(/ebnSans/g, `${P}Sans`)
    .replace(/ebnMono/g, `${P}Mono`)
    .replace(/CSS_EBN/g, `CSS_${P.toUpperCase()}`)
    .replace(/CuentaEditorial/g, `Cuenta${fam.mote}`)
    .replace(/CheckinEditorial/g, `Checkin${fam.mote}`)
    .replace(/CancionesEditorial/g, `Canciones${fam.mote}`)
    .replace(/TriviaEditorial/g, `Trivia${fam.mote}`)
    .replace(/EditorialBlancNoirTemplate/g, fam.archivo);

  const cabeceraVieja = s.slice(s.indexOf("/**"), s.indexOf(" */") + 3);
  s = s.replace(cabeceraVieja, L(
    "/**",
    ` * ${fam.titulo} · Colección Iconic — sub-colección "Tipográfica Editorial"`,
    ` * Variante: ${fam.varianteBase} (base).`,
    " *",
    " * GENERADO por scripts/derivar-tipografica.js a partir de",
    " * EditorialBlancNoirTemplate.tsx — no editar a mano: la sub-colección se",
    " * arregla en Editorial Blanc & Noir y se vuelve a derivar; lo propio de",
    ` * esta familia está en scripts/familias/tipografica/${path.basename(rutaJson)}.`,
    " *",
    ...fam.resumen.map((linea) => ` * ${linea}`),
    " *",
    " * Sin imágenes propias: son tres fuentes y CSS.",
    " */"
  ));

  // ── 2. Las caras ────────────────────────────────────────────────────────
  rep(
    'import { Instrument_Serif, Archivo, JetBrains_Mono } from "next/font/google";',
    `import { ${[fam.serif.modulo, fam.sans.modulo, fam.mono.modulo].filter((m, i, a) => a.indexOf(m) === i).join(", ")} } from "next/font/google";`,
    "import de fuentes"
  );
  rep(
    L(
      `const ${P}Serif = Instrument_Serif({`,
      '  subsets: ["latin"],',
      '  weight: ["400"],',
      '  style: ["normal", "italic"],',
      '  display: "swap",',
      `  variable: "--${P}-serif",`,
      "});"
    ),
    L(
      `const ${P}Serif = ${fam.serif.modulo}({`,
      '  subsets: ["latin"],',
      `  weight: [${fam.serif.pesos.map((p) => `"${p}"`).join(", ")}],`,
      ...(fam.serif.italica ? ['  style: ["normal", "italic"],'] : []),
      '  display: "swap",',
      `  variable: "--${P}-serif",`,
      "});"
    ),
    "declaración del serif"
  );
  rep(
    L(
      `const ${P}Sans = Archivo({`,
      '  subsets: ["latin"],',
      '  weight: ["400", "500"],',
      '  display: "swap",',
      `  variable: "--${P}-sans",`,
      "});"
    ),
    L(
      `const ${P}Sans = ${fam.sans.modulo}({`,
      '  subsets: ["latin"],',
      `  weight: [${fam.sans.pesos.map((p) => `"${p}"`).join(", ")}],`,
      '  display: "swap",',
      `  variable: "--${P}-sans",`,
      "});"
    ),
    "declaración del sans"
  );
  if (fam.mono.modulo === fam.sans.modulo) {
    // Familias que no tienen una tercera cara: el mono es el mismo sans.
    const desde = s.indexOf(`const ${P}Mono = JetBrains_Mono({`);
    const hasta = s.indexOf("});", desde);
    if (desde < 0 || hasta < 0) faltantes.push("declaración del mono");
    else s = s.slice(0, desde) + s.slice(hasta + 4);
    s = s.split(`\${${P}Mono.variable}`).join("").split(".variable}  ").join(".variable} ");
    s = s.split(`var(--${P}-mono)`).join(`var(--${P}-sans)`);
  } else {
    rep(
      L(
        `const ${P}Mono = JetBrains_Mono({`,
        '  subsets: ["latin"],',
        '  weight: ["400"],',
        '  display: "swap",',
        `  variable: "--${P}-mono",`,
        "});"
      ),
      L(
        `const ${P}Mono = ${fam.mono.modulo}({`,
        '  subsets: ["latin"],',
        `  weight: [${fam.mono.pesos.map((p) => `"${p}"`).join(", ")}],`,
        '  display: "swap",',
        `  variable: "--${P}-mono",`,
        "});"
      ),
      "declaración del mono"
    );
  }
  s = s.split("'Instrument Serif', serif").join(fam.serif.css);
  s = s.split("'Archivo', sans-serif").join(fam.sans.css);
  s = s.split("'JetBrains Mono', monospace").join(fam.mono.css);

  // ── 3. La paleta ────────────────────────────────────────────────────────
  const RE_PALETA = /const PALETA = \{[\s\S]*?\n\};/;
  if (!RE_PALETA.test(s)) faltantes.push("bloque PALETA");
  s = s.replace(RE_PALETA, bloqueDePaleta(paletaCompleta(fam.paleta)));

  // ── 4. Lo propio de la familia ──────────────────────────────────────────
  if (fam.cssExtra && fam.cssExtra.length) {
    const marca = "\n  @media (prefers-reduced-motion: reduce) {";
    if (!s.includes(marca)) faltantes.push("cierre del CSS");
    s = s.replace(marca, "\n" + fam.cssExtra.map((l) => `  ${l}`).join("\n") + "\n" + marca);
  }

  if (faltantes.length) {
    console.error(`${fam.archivo}: no encontré estos anclajes en EditorialBlancNoirTemplate.tsx (¿cambió?):\n  - ${faltantes.join("\n  - ")}`);
    process.exitCode = 1;
    return;
  }

  fs.writeFileSync(path.join(DIR, `${fam.archivo}.tsx`), s);
  console.log(`${fam.archivo}.tsx (${(s.length / 1024).toFixed(0)} KB) — ${fam.titulo}, ${fam.serif.modulo} + ${fam.sans.modulo}`);
}

const pedidos = process.argv.slice(2);
if (pedidos.length) {
  pedidos.forEach((p) => derivar(path.resolve(p)));
} else {
  fs.readdirSync(CONFIGS).filter((f) => f.endsWith(".json")).forEach((f) => derivar(path.join(CONFIGS, f)));
}
