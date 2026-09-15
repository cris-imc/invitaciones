#!/usr/bin/env node
/**
 * Deriva CieloDePapelTemplate.tsx de JardinDePapelTemplate.tsx.
 *
 * Las familias de Capas de papel comparten el motor entero -- reveals, frase
 * palabra por palabra, paneles pineados, parallax con mouse y giroscopio,
 * ventana de la foto, riel, portada que se abre en capas, check-in con sello
 * y pétalos. Lo que cambia de una a otra es el DIBUJO (sus escenas), la
 * TIPOGRAFÍA y la PALETA. Cielo de papel es la de quince:
 *
 *  - Playfair Display + Jost, en vez de Cormorant Garamond + DM Sans.
 *  - Sus propias escenas (CdpEscenas.ts): la quinceañera de papel recortado,
 *    la luna, el salón.
 *  - Cinco paletas de cielo (Cielo rosado, Noche azul, Lila, Dorado, Menta).
 *  - Su mockup no tiene panel de ceremonia (un quince no suele tenerla), así
 *    que ese panel queda sin decoración propia si el anfitrión lo activa: el
 *    resto del panel se dibuja igual.
 *
 * GENERADO: no editar CieloDePapelTemplate.tsx a mano. Lo del motor se
 * arregla en JardinDePapelTemplate.tsx y se vuelve a derivar.
 *
 * Uso:  node scripts/derivar-cielo.js
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

// ── 1. Identidad ──────────────────────────────────────────────────────────
s = s.replace(/\bjdp-/g, "cdp-")
  .replace(/--jdp-/g, "--cdp-")
  .replace(/jdpSerif/g, "cdpSerif")
  .replace(/jdpSans/g, "cdpSans")
  .replace(/CSS_JDP/g, "CSS_CDP")
  .replace(/_JDP\b/g, "_CDP")
  .replace(/JdpEscenas/g, "CdpEscenas")
  .replace(/CuentaJardin/g, "CuentaCielo")
  .replace(/CheckinJardin/g, "CheckinCielo")
  .replace(/CancionesJardin/g, "CancionesCielo")
  .replace(/TriviaJardin/g, "TriviaCielo")
  .replace(/JardinDePapelTemplate/g, "CieloDePapelTemplate");

const cabeceraVieja = s.slice(s.indexOf("/**"), s.indexOf(" */") + 3);
s = s.replace(cabeceraVieja, L(
  "/**",
  " * CIELO DE PAPEL · Colección Iconic — sub-colección \"Capas de papel\"",
  " * Variante: Cielo rosado (base)",
  " *",
  " * GENERADO por scripts/derivar-cielo.js a partir de",
  " * JardinDePapelTemplate.tsx — no editar a mano: el motor se arregla en",
  " * Jardín y se vuelve a derivar; lo propio de Cielo se cambia en el script.",
  " *",
  " * El quince de la sub-colección: el mismo papel recortado que Jardín -- las",
  " * capas se inclinan con el mouse o el giroscopio, se desplazan a distinta",
  " * velocidad al bajar, la portada se abre levantando las capas -- pero con",
  " * su propio dibujo (la quinceañera, la luna, el salón), Playfair Display en",
  " * vez de Cormorant y cinco paletas de cielo.",
  " *",
  " * Su mockup no trae panel de ceremonia, porque un quince no suele tenerla.",
  " * Si el anfitrión igual la activa, el panel se dibuja sin decoración propia",
  " * en vez de robarle la escena a otro (ver ESCENA_DE_PANEL).",
  " *",
  " * PESO (Railway): comparte las piezas WebP de la sub-colección; las suyas",
  " * son 5 archivos de ~450 KB en total, con loading lazy salvo la portada.",
  " */"
));

// ── 2. Tipografías ────────────────────────────────────────────────────────
rep(
  'import { Cormorant_Garamond, DM_Sans } from "next/font/google";',
  'import { Playfair_Display, Jost } from "next/font/google";',
  "import de fuentes"
);
rep(
  L(
    "const cdpSerif = Cormorant_Garamond({",
    '  subsets: ["latin"],',
    '  weight: ["400", "500", "600"],',
    '  style: ["normal", "italic"],',
    '  display: "swap",',
    '  variable: "--cdp-serif",',
    "});",
    "const cdpSans = DM_Sans({",
    '  subsets: ["latin"],',
    '  weight: ["400", "500"],',
    '  display: "swap",',
    '  variable: "--cdp-sans",',
    "});"
  ),
  L(
    "const cdpSerif = Playfair_Display({",
    '  subsets: ["latin"],',
    '  weight: ["400", "500", "600"],',
    '  style: ["normal", "italic"],',
    '  display: "swap",',
    '  variable: "--cdp-serif",',
    "});",
    "const cdpSans = Jost({",
    '  subsets: ["latin"],',
    '  weight: ["300", "400", "500"],',
    '  display: "swap",',
    '  variable: "--cdp-sans",',
    "});"
  ),
  "declaración de fuentes"
);
s = s.split("'Cormorant Garamond', serif").join("'Playfair Display', serif");
s = s.split("'DM Sans', sans-serif").join("'Jost', sans-serif");

// ── 3. La paleta base ─────────────────────────────────────────────────────
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
    '  bg: "#F7E9EC",',
    '  bg2: "#F0DDE4",',
    '  ink: "#241C3A",',
    '  ink2: "#7A6C7E",',
    '  acc: "#D9738F",',
    '  acc2: "#C9A24D",',
    '  sky1: "#F7E9EC",',
    '  sky2: "#F2C9D8",',
    '  hill1: "#E6D2E8",',
    '  hill2: "#C3A6D6",',
    '  hill3: "#8E77A8",',
    '  night: "#2E2C3D",',
    '  nightInk: "#F7E9EC",',
    "};"
  ),
  "paleta"
);

// ── 4. Los paneles: este mockup no dibuja ceremonia ───────────────────────
rep(
  L(
    "const ESCENA_DE_PANEL: Record<string, string> = {",
    "  recepcion: CUANDO_CDP[0] ?? \"\",",
    "  ceremonia: CUANDO_CDP[1] ?? \"\",",
    "  llegar: CUANDO_CDP[2] ?? \"\",",
    "  cronograma: CUANDO_CDP[3] ?? \"\",",
    "};"
  ),
  L(
    "const ESCENA_DE_PANEL: Record<string, string> = {",
    "  recepcion: CUANDO_CDP[0] ?? \"\",",
    "  // Sin ceremonia en el mockup del quince: si el anfitrión la activa, el",
    "  // panel va sin decoración propia antes que con la de otro.",
    "  ceremonia: \"\",",
    "  llegar: CUANDO_CDP[1] ?? \"\",",
    "  cronograma: CUANDO_CDP[2] ?? \"\",",
    "};"
  ),
  "escenas por panel"
);

if (faltantes.length) {
  console.error("No encontré estos anclajes en JardinDePapelTemplate.tsx (¿cambió?):\n  - " + faltantes.join("\n  - "));
  process.exit(1);
}

fs.writeFileSync(path.join(DIR, "CieloDePapelTemplate.tsx"), s);
console.log("CieloDePapelTemplate.tsx (" + (s.length / 1024).toFixed(0) + " KB) derivado de JardinDePapelTemplate.tsx");
