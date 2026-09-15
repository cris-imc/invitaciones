#!/usr/bin/env node
/**
 * Deriva la base de "Tipográfica Editorial" (Colección Iconic) --
 * EditorialBlancNoirTemplate.tsx -- de JardinDePapelTemplate.tsx.
 *
 * Las dos sub-colecciones de Iconic comparten el MOTOR entero: el scroller
 * propio, los reveals, la frase palabra por palabra, los paneles pineados con
 * su recorrido lateral, el riel de progreso, la portada que se abre, el
 * check-in con sello, el álbum y el pase. Eso es lo que se hereda de Jardín,
 * que ya está probado.
 *
 * Lo que NO comparten es todo lo demás, y es bastante:
 *
 *  - CAPAS DE PAPEL DIBUJA; TIPOGRÁFICA EDITORIAL COMPONE. Acá no hay ni un
 *    SVG de paisaje: la página es una revista -- titulares enormes en
 *    Instrument Serif, kickers y folios en mono, filetes, y una trama de
 *    semitono como única textura.
 *  - EL COLOR ES UN BLOQUE, NO UN ADORNO. Las secciones alternan papel,
 *    tinta y acento a página completa; el panel de cronograma va entero en el
 *    color de la variante.
 *  - NO HAY PARALLAX de capas ni inclinación: el papel no se mueve, se pasa.
 *
 * La PALETA conserva las trece claves de Capas de papel aunque acá sólo se
 * usen seis: así el generador de variantes es el mismo para las dos
 * sub-colecciones. Las claves de paisaje (sky, hill) se mapean a la tinta.
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
  " * Jardín y se vuelve a derivar; lo propio de esta sub-colección está en",
  " * este script y en scripts/css/editorial.css.",
  " *",
  " * Comparte con Capas de papel el MOTOR (scroller propio, reveals, frase",
  " * palabra por palabra, paneles pineados, riel, portada que se abre,",
  " * check-in con sello, álbum, pase) y no comparte nada más:",
  " *",
  " *  - CAPAS DE PAPEL DIBUJA; ACÁ SE COMPONE. Ni un SVG de paisaje: la",
  " *    página es una revista, con titulares enormes en Instrument Serif,",
  " *    kickers y folios en JetBrains Mono, filetes y una trama de semitono",
  " *    como única textura (un gradiente, no una imagen).",
  " *  - EL COLOR ES UN BLOQUE: las secciones alternan papel, tinta y acento a",
  " *    página completa, y el panel de cronograma va entero en el acento.",
  " *  - NO HAY PARALLAX ni inclinación: el papel no se mueve, se pasa.",
  " *",
  " * PESO (Railway): cero imágenes propias. Toda la familia son tres fuentes",
  " * y CSS.",
  " */"
));

// ── 2. Fuera las escenas ──────────────────────────────────────────────────
// Esta sub-colección no dibuja: no hay nada que inyectar.
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

// Las apariciones: la de los defs, las de cada sección y la de la portada.
s = s.replace(/^ *\{\/\* Los filtros de grano[\s\S]*?\*\/\}\n/m, "");
s = s.replace(/^ *<Escena html=\{DEFS_JDP\} className="ebn-defs" \/>\n/m, "");
s = s.replace(/^ *<Escena html=\{[^}]+\} className="ebn-escena" \/>\n/gm, "");
s = s.replace(
  /^( *)<div ref=\{escenaPortadaRef\} className="ebn-portada-escena" dangerouslySetInnerHTML=\{\{ __html: COVER_JDP \}\} \/>$/m,
  L(
    "$1{/* La portada no tiene escena que levantar: lo que se va al abrir es la",
    "$1    trama y el titular, y de eso se encarga el motor moviendo [data-cl]. */}",
    '$1<div ref={escenaPortadaRef} className="ebn-portada-escena">',
    '$1  <div data-cl="1" className="ebn-trama" aria-hidden="true" />',
    "$1</div>"
  )
);
// La trama de semitono en cada sección, en lugar de la escena.
s = s.replace(
  /^( *)<span data-xin="1" data-dist="-20" className="ebn-kicker">/gm,
  '$1<div className="ebn-trama" aria-hidden="true" />\n$1<span data-xin="1" data-dist="-20" className="ebn-kicker">'
);

// ── 3. Las caras ──────────────────────────────────────────────────────────
rep(
  'import { Cormorant_Garamond, DM_Sans } from "next/font/google";',
  'import { Instrument_Serif, Archivo, JetBrains_Mono } from "next/font/google";',
  "import de fuentes"
);
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
    "// El mono es la ficha técnica de la revista: kickers, folios y datos.",
    "const ebnMono = JetBrains_Mono({",
    '  subsets: ["latin"],',
    '  weight: ["400"],',
    '  display: "swap",',
    '  variable: "--ebn-mono",',
    "});"
  ),
  "declaración de fuentes"
);
s = s.split("${ebnSerif.variable} ${ebnSans.variable}").join("${ebnSerif.variable} ${ebnSans.variable} ${ebnMono.variable}");
s = s.split("'Cormorant Garamond', serif").join("'Instrument Serif', serif");
s = s.split("'DM Sans', sans-serif").join("'Archivo', sans-serif");

// ── 4. La paleta ──────────────────────────────────────────────────────────
// Se mantienen las trece claves para que el generador de variantes de Capas
// sirva igual; las de paisaje se mapean a la tinta.
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
    "  // Las cuatro que siguen son de Capas de papel (cielo y cerros). Acá no",
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

// ── 5. El vestuario ───────────────────────────────────────────────────────
const extra = fs.readFileSync(path.join(__dirname, "css", "editorial.css"), "utf8");
const marca = "\n  @media (prefers-reduced-motion: reduce) {";
if (!s.includes(marca)) faltantes.push("cierre del CSS");
s = s.replace(marca, "\n" + extra.trimEnd() + "\n" + marca);

if (faltantes.length) {
  console.error("No encontré estos anclajes en JardinDePapelTemplate.tsx (¿cambió?):\n  - " + faltantes.join("\n  - "));
  process.exit(1);
}

fs.writeFileSync(path.join(DIR, "EditorialBlancNoirTemplate.tsx"), s);
console.log("EditorialBlancNoirTemplate.tsx (" + (s.length / 1024).toFixed(0) + " KB) derivado de JardinDePapelTemplate.tsx");
