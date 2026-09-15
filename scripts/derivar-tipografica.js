#!/usr/bin/env node
/**
 * Deriva una familia de "Tipográfica Editorial" (Colección Iconic) de la
 * base, EditorialBlancNoirTemplate.tsx.
 *
 * Las catorce familias comparten el MOTOR (el scroller, los reveals, la
 * frase palabra por palabra, los paneles pineados, el riel, la apertura de
 * la portada, el check-in, el álbum) y la secuencia de pliegos: bienvenida,
 * save the date, countdown, frase, cuándo y dónde, check-in, álbum, música,
 * regalos, trivia y pase. Lo que NO comparten es cómo se ve cada pliego:
 * Cartelera es una marquesina con bombitas y naipes sobre paño, Postal es
 * una estampilla con un avioncito, Arcade es una pantalla de píxeles. Cada
 * mockup compone distinto, así que cada familia trae:
 *
 *  - SU RENDER (scripts/jsx/tipografica/<prefijo>.jsx), escrito desde su
 *    mockup, con las mismas variables del motor que usa Editorial.
 *  - SU HOJA DE ESTILOS (scripts/css/tipografica/<prefijo>.css).
 *  - SUS CARAS, SU PALETA (más las claves extra que necesite: un tercer
 *    neón, el paño verde) y, si hace falta, RETOQUES AL MOTOR
 *    (scripts/familias/tipografica/<prefijo>.motor.js).
 *
 * Una familia que todavía no tiene render propio (sin `render` en la ficha)
 * se deriva como antes: cambia caras, paleta y `cssExtra` sobre el render de
 * Editorial. Es un estado provisorio y el auditor lo marca.
 *
 * Uso:
 *   node scripts/derivar-tipografica.js scripts/familias/tipografica/car.json
 *   node scripts/derivar-tipografica.js        (todas)
 */
const fs = require("node:fs");
const path = require("node:path");

const DIR = path.join(__dirname, "..", "src", "components", "templates");
const CONFIGS = path.join(__dirname, "familias", "tipografica");
const L = (...l) => l.join("\n");
const CLAVES = ["bg", "bg2", "ink", "ink2", "acc", "acc2", "sky1", "sky2", "hill1", "hill2", "hill3", "night", "nightInk"];

/**
 * Las trece claves de la paleta a partir de las seis que declara la ficha,
 * más las extras propias de la familia (`extras`: ["acc3", "felt"]).
 * Las de paisaje (sky, hill) existen sólo para compartir el generador de
 * variantes con Capas de papel: acá se mapean a la tinta y al papel.
 */
function paletaCompleta(p, extras = []) {
  const base = {
    bg: p.bg, bg2: p.bg2 || p.bg, ink: p.ink, ink2: p.ink2 || p.ink,
    acc: p.acc, acc2: p.acc2 || p.acc,
    sky1: p.bg, sky2: p.bg2 || p.bg, hill1: p.bg2 || p.bg, hill2: p.ink2 || p.ink, hill3: p.ink,
    night: p.night || p.ink, nightInk: p.nightInk || p.bg,
  };
  for (const k of extras) base[k] = p[k];
  return base;
}

function bloqueDePaleta(p, extras = []) {
  return L("const PALETA = {", ...[...CLAVES, ...extras].map((k) => `  ${k}: "${p[k]}",`), "};");
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
  const extras = fam.extras || [];
  const propio = Boolean(fam.render);

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
    " * EditorialBlancNoirTemplate.tsx — no editar a mano: el motor se arregla en",
    ...(propio
      ? [
        ` * Editorial Blanc & Noir; el render en scripts/jsx/tipografica/${P}.jsx, los`,
        ` * estilos en scripts/css/tipografica/${P}.css y las caras y la paleta en`,
        ` * scripts/familias/tipografica/${path.basename(rutaJson)}.`,
      ]
      : [
        " * Editorial Blanc & Noir y se vuelve a derivar; lo propio de esta familia",
        ` * está en scripts/familias/tipografica/${path.basename(rutaJson)}.`,
        " *",
        " * PROVISORIO: todavía usa el render de Editorial. Falta portar el suyo",
        " * desde el mockup.",
      ]),
    " *",
    ...fam.resumen.map((linea) => ` * ${linea}`),
    " *",
    " * Sin imágenes propias: son fuentes y CSS.",
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
  s = s.replace(RE_PALETA, bloqueDePaleta(paletaCompleta(fam.paleta, extras), extras));
  if (extras.length) {
    // Las claves extra también salen como variables CSS (--pp-acc3, --pp-felt).
    rep(
      '    "--pp-btn-fg": tintaSobre(PALETA.ink),\n',
      '    "--pp-btn-fg": tintaSobre(PALETA.ink),\n' + extras.map((k) => `    "--pp-${k}": PALETA.${k},\n`).join(""),
      "variables de paleta"
    );
  }

  // ── 4. El render y la hoja de estilos propios ───────────────────────────
  if (propio) {
    const marcaReturn = "\n  // El total de pliegos, para los folios";
    const desdeReturn = s.indexOf(marcaReturn);
    const marcaFin = "\n// ───────────────────────────────────────────────────────────────────────────\n// Piezas de la colección";
    const hastaReturn = s.indexOf(marcaFin);
    if (desdeReturn < 0 || hastaReturn < 0) faltantes.push("bloque del render");
    else {
      const render = fs.readFileSync(path.join(__dirname, "jsx", "tipografica", fam.render), "utf8");
      s = s.slice(0, desdeReturn + 1) + render.trimEnd() + "\n" + s.slice(hastaReturn);
      // useId lo usa el sello de Editorial; un render que no lo necesita no
      // lo importa (eslint lo marcaría).
      if (!render.includes("useId(")) {
        rep(
          'import { useCallback, useEffect, useId, useRef, useState } from "react";',
          'import { useCallback, useEffect, useRef, useState } from "react";',
          "import de useId"
        );
      }
      if (!render.includes("tituloEnDosLineas(")) {
        rep(
          'import { useTextos, useFormatoDeMoneda, tituloEnDosLineas } from "@/components/i18n/ProveedorIdioma";',
          'import { useTextos, useFormatoDeMoneda } from "@/components/i18n/ProveedorIdioma";',
          "import de tituloEnDosLineas"
        );
      }
    }
    const desdeCss = s.indexOf(`const CSS_${P.toUpperCase()} = \``);
    const finCss = s.indexOf("\n`;", desdeCss);
    if (desdeCss < 0 || finCss < 0) faltantes.push("bloque CSS");
    else {
      const css = fs.readFileSync(path.join(__dirname, "css", "tipografica", fam.css), "utf8");
      s = s.slice(0, desdeCss) + css.trimEnd() + s.slice(finCss + 3);
    }
    // Las variables CSS del motor (--ebn-y, --ebn-punto) ya vienen renombradas
    // por la identidad; el render propio las usa con su prefijo.
  } else if (fam.cssExtra && fam.cssExtra.length) {
    const marca = "\n  @media (prefers-reduced-motion: reduce) {";
    if (!s.includes(marca)) faltantes.push("cierre del CSS");
    s = s.replace(marca, "\n" + fam.cssExtra.map((l) => `  ${l}`).join("\n") + "\n" + marca);
  }

  // ── 5. Retoques al motor ────────────────────────────────────────────────
  // Lo que una familia necesita cambiar del motor (una animación distinta
  // en la tapa, otro gesto en el countdown) vive en <prefijo>.motor.js, como
  // una lista de reemplazos exactos que fallan si el anclaje se movió.
  const rutaMotor = path.join(CONFIGS, `${P}.motor.js`);
  if (fs.existsSync(rutaMotor)) {
    const cambios = require(rutaMotor);
    for (const c of cambios) rep(c.de, c.a, `motor: ${c.etiqueta}`);
  }

  if (faltantes.length) {
    console.error(`${fam.archivo}: no encontré estos anclajes en EditorialBlancNoirTemplate.tsx (¿cambió?):\n  - ${faltantes.join("\n  - ")}`);
    process.exitCode = 1;
    return;
  }

  fs.writeFileSync(path.join(DIR, `${fam.archivo}.tsx`), s);
  console.log(`${fam.archivo}.tsx (${(s.length / 1024).toFixed(0)} KB) — ${fam.titulo}, ${fam.serif.modulo} + ${fam.sans.modulo}${propio ? "" : " · PROVISORIO (render de Editorial)"}`);
}

const pedidos = process.argv.slice(2);
if (pedidos.length) {
  pedidos.forEach((p) => derivar(path.resolve(p)));
} else {
  fs.readdirSync(CONFIGS).filter((f) => f.endsWith(".json")).forEach((f) => derivar(path.join(CONFIGS, f)));
}
