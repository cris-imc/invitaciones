#!/usr/bin/env node
/**
 * Escribe la base de "Tipográfica Editorial" (Colección Iconic) --
 * EditorialBlancNoirTemplate.tsx -- tomando de JardinDePapelTemplate.tsx el
 * MOTOR y reemplazando todo lo demás.
 *
 * Qué se hereda de Jardín (y por qué): el scroller propio, los reveals, la
 * frase palabra por palabra, los paneles pineados con su recorrido lateral y
 * su gesto de arrastre, el riel de progreso, la apertura de la portada, el
 * check-in que habla con la API, el álbum, la lupa y el post-evento. Todo eso
 * ya está probado y no tiene nada que ver con cómo se ve una familia.
 *
 * Qué se reemplaza entero, porque acá la página es OTRA:
 *
 *  - EL RENDER (scripts/jsx/editorial-render.jsx). Capas de papel dibuja un
 *    paisaje; Tipográfica Editorial compone una revista: folio arriba y
 *    abajo de cada pliego, spread de dos páginas, titulares enormes en
 *    Instrument Serif, kickers y datos en mono, marquesinas que corren,
 *    cupón troquelado en el check-in, hoja de contactos en el álbum y un
 *    sello circular que gira. La tapa ES la bienvenida -- dice de quién es
 *    la fiesta, cuándo, dónde y para cuántos --, así que esta sub-colección
 *    no monta además la sección de Bienvenida: sería decir dos veces lo
 *    mismo.
 *  - LA HOJA DE ESTILOS (scripts/css/editorial.css).
 *  - LAS CARAS y la PALETA.
 *
 * La PALETA conserva las trece claves de Capas de papel aunque acá sólo se
 * usen seis: así las dos sub-colecciones comparten el generador de variantes.
 *
 * GENERADO: no editar EditorialBlancNoirTemplate.tsx a mano.
 *
 * Uso:  node scripts/derivar-editorial.js
 */
const fs = require("node:fs");
const path = require("node:path");

const DIR = path.join(__dirname, "..", "src", "components", "templates");
let s = fs.readFileSync(path.join(DIR, "JardinDePapelTemplate.tsx"), "utf8");
const faltantes = [];
function rep(a, b, etiqueta) {
  if (!s.includes(a)) { faltantes.push(etiqueta); return; }
  s = s.split(a).join(b);
}
const L = (...l) => l.join("\n");

const P = "ebn";

// ── 1. Identidad ──────────────────────────────────────────────────────────
s = s.replace(/\bjdp-/g, `${P}-`)
  .replace(/--jdp-/g, `--${P}-`)
  .replace(/jdpSerif/g, `${P}Serif`)
  .replace(/jdpSans/g, `${P}Sans`)
  .replace(/CSS_JDP/g, `CSS_${P.toUpperCase()}`)
  .replace(/CuentaJardin/g, "CuentaEditorial")
  .replace(/CheckinJardin/g, "CheckinEditorial")
  .replace(/CancionesJardin/g, "CancionesEditorial")
  .replace(/TriviaJardin/g, "TriviaEditorial")
  .replace(/JardinDePapelTemplate/g, "EditorialBlancNoirTemplate");

const cabeceraVieja = s.slice(s.indexOf("/**"), s.indexOf(" */") + 3);
s = s.replace(cabeceraVieja, L(
  "/**",
  ' * EDITORIAL BLANC & NOIR · Colección Iconic — sub-colección "Tipográfica Editorial"',
  " * Variante: Lacre (base). Es la familia BASE de la sub-colección: las otras",
  " * trece se derivan de ésta con scripts/derivar-tipografica.js.",
  " *",
  " * GENERADO por scripts/derivar-editorial.js a partir de",
  " * JardinDePapelTemplate.tsx — no editar a mano: el motor se arregla en",
  " * Jardín, el render en scripts/jsx/editorial-render.jsx y los estilos en",
  " * scripts/css/editorial.css.",
  " *",
  " * Comparte con Capas de papel el MOTOR (scroller, reveals, frase palabra",
  " * por palabra, paneles pineados, riel, apertura de portada, check-in,",
  " * álbum) y NADA de la composición:",
  " *",
  " *  - CAPAS DE PAPEL DIBUJA; ACÁ SE COMPONE. Cada sección es un pliego de",
  " *    revista: folio arriba y abajo, spread de dos páginas (apiladas en el",
  " *    teléfono, abiertas desde 900 px), titulares enormes en Instrument",
  " *    Serif con la segunda línea en itálica y en el acento, y todo lo chico",
  " *    en JetBrains Mono. La única textura es una trama de semitono hecha",
  " *    con un gradiente.",
  " *  - EL COLOR ES UNA PÁGINA ENTERA: los pliegos alternan crema, tinta y",
  " *    acento; la frase y la trivia van enteras en el acento.",
  " *  - LA TAPA ES LA BIENVENIDA. Dice de quién es la fiesta, cuándo, dónde y",
  " *    para cuántos, con el mensaje del anfitrión abajo. Por eso esta",
  " *    sub-colección NO monta además <BienvenidaStorytelling>: sería la",
  " *    misma información dos veces, una arriba de la otra.",
  " *  - SIN PARALLAX ni inclinación: el papel no se mueve, se pasa.",
  " *",
  " * PESO (Railway): cero imágenes propias. Toda la familia son tres fuentes",
  " * y CSS.",
  " */"
));

// ── 2. Fuera lo que era dibujo ────────────────────────────────────────────
const desdeImport = s.indexOf("import {\n  DEFS_");
const hastaImport = s.indexOf('} from "@/components/templates/escenas/');
if (desdeImport < 0 || hastaImport < 0) faltantes.push("import de escenas");
else s = s.slice(0, desdeImport) + s.slice(s.indexOf("\n", hastaImport) + 1);

const desdeMapa = s.indexOf("/**\n * Qué escena le toca a cada panel");
const hastaMapa = s.indexOf("/** Un trozo de escena del mockup", desdeMapa);
if (desdeMapa < 0 || hastaMapa < 0) faltantes.push("mapa de escenas");
else s = s.slice(0, desdeMapa) + s.slice(hastaMapa);

const desdeEscena = s.indexOf("/** Un trozo de escena del mockup");
const hastaEscena = s.indexOf("export function EditorialBlancNoirTemplate", desdeEscena);
if (desdeEscena < 0 || hastaEscena < 0) faltantes.push("componente Escena");
else s = s.slice(0, desdeEscena) + s.slice(hastaEscena);

// La Bienvenida compartida no se usa: la tapa ya la es.
rep('import { BienvenidaStorytelling } from "@/components/invitation/BienvenidaStorytelling";\n', "", "import de Bienvenida");
// El papel de las tarjetas de Capas de papel tampoco: acá las fichas son
// blancas y lo dice el CSS.
const desdeCarta = s.indexOf("/** El papel de las tarjetas, que es el mismo en todas las variantes. */");
const hastaCarta = s.indexOf("/** Blanco o negro según", desdeCarta);
if (desdeCarta < 0 || hastaCarta < 0) faltantes.push("constantes de carta");
else s = s.slice(0, desdeCarta) + s.slice(hastaCarta);

// ── 3. Las caras ──────────────────────────────────────────────────────────
rep(
  'import { Cormorant_Garamond, DM_Sans } from "next/font/google";',
  'import { Instrument_Serif, Archivo, JetBrains_Mono } from "next/font/google";',
  "import de fuentes"
);
rep('import { useCallback, useEffect, useRef, useState } from "react";', 'import { useCallback, useEffect, useId, useRef, useState } from "react";', "import de useId");
rep(
  L(
    "const ebnSerif = Cormorant_Garamond({",
    '  subsets: ["latin"],',
    '  weight: ["400", "500", "600"],',
    '  style: ["normal", "italic"],',
    '  display: "swap",',
    '  variable: "--ebn-serif",',
    "});",
    "const ebnSans = DM_Sans({",
    '  subsets: ["latin"],',
    '  weight: ["400", "500"],',
    '  display: "swap",',
    '  variable: "--ebn-sans",',
    "});"
  ),
  L(
    "const ebnSerif = Instrument_Serif({",
    '  subsets: ["latin"],',
    '  weight: ["400"],',
    '  style: ["normal", "italic"],',
    '  display: "swap",',
    '  variable: "--ebn-serif",',
    "});",
    "const ebnSans = Archivo({",
    '  subsets: ["latin"],',
    '  weight: ["400", "500"],',
    '  display: "swap",',
    '  variable: "--ebn-sans",',
    "});",
    "// El mono es la ficha técnica de la revista: folios, kickers y datos.",
    "const ebnMono = JetBrains_Mono({",
    '  subsets: ["latin"],',
    '  weight: ["400"],',
    '  display: "swap",',
    '  variable: "--ebn-mono",',
    "});"
  ),
  "declaración de fuentes"
);
s = s.split("'Cormorant Garamond', serif").join("'Instrument Serif', serif");
s = s.split("'DM Sans', sans-serif").join("'Archivo', sans-serif");

// ── 4. La paleta ──────────────────────────────────────────────────────────
rep(
  L(
    "const PALETA = {",
    '  bg: "#F3EBDD",',
    '  bg2: "#E9DFCC",',
    '  ink: "#2B2A33",',
    '  ink2: "#6E6A72",',
    '  acc: "#C86B5A",',
    '  acc2: "#7C9A7E",',
    '  sky1: "#F3EBDD",',
    '  sky2: "#EBD3BE",',
    '  hill1: "#BCCBB6",',
    '  hill2: "#7C9A7E",',
    '  hill3: "#4F6B55",',
    '  night: "#2E2C3D",',
    '  nightInk: "#F3EBDD",',
    "};"
  ),
  L(
    "const PALETA = {",
    '  bg: "#F5F1EA",',
    '  bg2: "#EAE4D8",',
    '  ink: "#141414",',
    '  ink2: "#6B6760",',
    '  acc: "#E63B2E",',
    '  acc2: "#1F4FD1",',
    "  // Las cinco que siguen son de Capas de papel (cielo y cerros). Acá no",
    "  // hay paisaje, pero se declaran igual para que las dos sub-colecciones",
    "  // compartan el generador de variantes.",
    '  sky1: "#F5F1EA",',
    '  sky2: "#EAE4D8",',
    '  hill1: "#EAE4D8",',
    '  hill2: "#6B6760",',
    '  hill3: "#141414",',
    '  night: "#141414",',
    '  nightInk: "#F5F1EA",',
    "};"
  ),
  "paleta"
);

// ── 5. La entrada de la tapa ──────────────────────────────────────────────
// En Capas de papel el cartel se endereza como si lo levantaran del piso.
// Acá los nombres entran desde abajo detrás de su propia máscara, que es el
// gesto de una tapa de revista armándose.
rep(
  L(
    "    if (cartel) {",
    '      cartel.style.transition = "none";',
    '      cartel.style.opacity = "0";',
    '      cartel.style.transform = "perspective(700px) rotateX(-12deg) rotate(-1.2deg)";',
    '      cartel.style.boxShadow = "0 2px 0 rgba(0,0,0,.12)";',
    "      window.setTimeout(() => {",
    '        cartel.style.transition = "transform 1100ms cubic-bezier(.16,1,.3,1), opacity 700ms ease, box-shadow 1100ms ease";',
    '        cartel.style.opacity = "1";',
    '        cartel.style.transform = "perspective(700px) rotateX(0deg) rotate(-1.2deg)";',
    '        cartel.style.boxShadow = "0 2px 0 rgba(0,0,0,.12), 0 18px 30px rgba(0,0,0,.14)";',
    "      }, 700);",
    "    }"
  ),
  L(
    "    // Cada renglón del nombre sube desde su propia máscara, uno atrás de",
    "    // otro. Es el gesto de una tapa armándose, no el de un cartel que se",
    "    // endereza.",
    "    const renglones = cartel ? Array.from(cartel.querySelectorAll<HTMLElement>(\"span > span\")) : [];",
    "    renglones.forEach((linea, i) => {",
    '      linea.style.transition = "none";',
    '      linea.style.transform = "translate3d(0,110%,0)";',
    "      window.setTimeout(() => {",
    '        linea.style.transition = "transform 1000ms cubic-bezier(.16,1,.3,1)";',
    '        linea.style.transform = "translate3d(0,0,0)";',
    "      }, 260 + i * 130);",
    "    });"
  ),
  "entrada de la tapa"
);

// ── 5a. Las cifras entran de lados alternados ─────────────────────────────
// En Capas de papel las cuatro tarjetitas entran desde abajo. Acá cada cifra
// entra desde un costado distinto -- izquierda, derecha, izquierda, derecha --
// que es lo que arma la cruz de filetes a medida que se llenan los cuadrantes.
rep(
  '        <div key={c.l} data-xin="1" data-delay={80 + i * 80} data-dist="30" className={`ebn-cuenta-caja ebn-cuenta-caja--${i + 1}`}>',
  '        <div key={c.l} data-xin="1" data-delay={i * 100} data-dist={i % 2 === 0 ? -80 : 80} className={`ebn-cuenta-caja ebn-cuenta-caja--${i + 1}`}>',
  "entrada de las cifras"
);
rep(
  '          <span className={`ebn-cuenta-num${i === 3 ? " ebn-cuenta-num--acc" : ""}`}>{c.v}</span>',
  "          <span className=\"ebn-cuenta-num\">{c.v}</span>",
  "cifra"
);

// ── 5b. La foto no se abre: se REVELA ─────────────────────────────────────
// En Capas de papel la foto entra recortada como una ventana ovalada que se
// abre. Acá es una foto impresa: arranca tapada por la trama de semitono y
// los puntos se van achicando hasta desaparecer, como un papel revelándose.
rep(
  L(
    "          // La foto principal se abre como una ventana troquelada mientras",
    "          // sube: de un óvalo angosto al rectángulo entero.",
    "          const ven = ventanaRef.current;",
    "          if (ven) {",
    "            const r = ven.getBoundingClientRect();",
    "            const p = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.7)));",
    "            const v = (1 - p) * 44;",
    "            const h = (1 - p) * 38;",
    "            ven.style.clipPath = `inset(${v}% ${h}% ${v}% ${h}% round 999px 999px 14px 14px)`;",
    "          }"
  ),
  L(
    "          // La foto se revela: los puntos de la trama que la tapan se van",
    "          // achicando de 7,2 a 0 mientras sube, como un papel en el",
    "          // líquido. El radio va como variable CSS para no tocar el DOM.",
    "          const ven = ventanaRef.current;",
    "          if (ven) {",
    "            const r = ven.getBoundingClientRect();",
    "            const prog = 1 - (r.top + r.height / 2) / vh;",
    "            const t = Math.min(1, Math.max(0, (prog - 0.15) / 0.6));",
    '            ven.style.setProperty("--ebn-punto", (7.2 * (1 - t)).toFixed(2));',
    "          }"
  ),
  "revelado de la foto"
);

// ── 6. El render ──────────────────────────────────────────────────────────
// Desde el `return (` de la plantilla hasta el cierre del componente: todo
// eso es composición y acá es otra.
const marcaReturn = "\n  return (\n    <div\n      ref={raizRef}";
const desdeReturn = s.indexOf(marcaReturn);
const marcaFin = "\n// ───────────────────────────────────────────────────────────────────────────\n// Piezas de la colección";
const hastaReturn = s.indexOf(marcaFin);
if (desdeReturn < 0 || hastaReturn < 0) faltantes.push("bloque del render");
else {
  const render = fs.readFileSync(path.join(__dirname, "jsx", "editorial-render.jsx"), "utf8");
  s = s.slice(0, desdeReturn + 1) + render.trimEnd() + "\n" + s.slice(hastaReturn);
}

// ── 7. La hoja de estilos ─────────────────────────────────────────────────
const desdeCss = s.indexOf("const CSS_EBN = `");
const finCss = s.indexOf("\n`;", desdeCss);
if (desdeCss < 0 || finCss < 0) faltantes.push("bloque CSS");
else {
  const css = fs.readFileSync(path.join(__dirname, "css", "editorial.css"), "utf8");
  s = s.slice(0, desdeCss) + css.trimEnd() + s.slice(finCss + 3);
}

if (faltantes.length) {
  console.error("No encontré estos anclajes en JardinDePapelTemplate.tsx (¿cambió?):\n  - " + faltantes.join("\n  - "));
  process.exit(1);
}

fs.writeFileSync(path.join(DIR, "EditorialBlancNoirTemplate.tsx"), s);
console.log("EditorialBlancNoirTemplate.tsx (" + (s.length / 1024).toFixed(0) + " KB) — render y estilos propios");
