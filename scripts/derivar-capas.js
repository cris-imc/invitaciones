#!/usr/bin/env node
/**
 * Deriva una familia de "Capas de papel" (Colección Iconic) de la base,
 * JardinDePapelTemplate.tsx.
 *
 * Las familias de esta sub-colección comparten el motor entero: reveals,
 * frase palabra por palabra, paneles pineados, parallax con mouse y
 * giroscopio, ventana de la foto, riel, portada que se abre levantando las
 * capas, check-in con sello y pétalos. Lo que cambia de una a otra es el
 * DIBUJO (sus escenas), la TIPOGRAFÍA y la PALETA -- y en algunas, qué
 * paneles trae su mockup.
 *
 * Por eso cada familia es un JSON con esas diferencias y no 2.100 líneas
 * copiadas: un arreglo del motor se hace en Jardín y llega a todas volviendo
 * a correr esto. Si un anclaje no aparece (porque la base cambió), el script
 * falla y dice cuál: no escribe un archivo a medias.
 *
 * Uso:
 *   node scripts/derivar-capas.js scripts/familias/capas/cielo.json
 *   node scripts/derivar-capas.js            (todas las de familias/capas/)
 */
const fs = require("node:fs");
const path = require("node:path");

const RAIZ = path.join(__dirname, "..");
const DIR = path.join(RAIZ, "src", "components", "templates");
const CONFIGS = path.join(__dirname, "familias", "capas");
const L = (...l) => l.join("\n");

function derivar(rutaJson) {
  const fam = JSON.parse(fs.readFileSync(rutaJson, "utf8"));
  // Jardín es la base: está escrita a mano y derivarla la pisaría con ella misma.
  if (fam.esBase) return;
  let s = fs.readFileSync(path.join(DIR, "JardinDePapelTemplate.tsx"), "utf8");
  const faltantes = [];
  const rep = (a, b, etiqueta) => {
    if (!s.includes(a)) { faltantes.push(etiqueta); return; }
    s = s.split(a).join(b);
  };

  const P = fam.prefijo;                       // "cdp"
  const SUF = P.toUpperCase();                 // "CDP"
  const Escenas = P.charAt(0).toUpperCase() + P.slice(1) + "Escenas"; // "CdpEscenas"

  // ── 1. Identidad ────────────────────────────────────────────────────────
  s = s.replace(/\bjdp-/g, `${P}-`)
    .replace(/--jdp-/g, `--${P}-`)
    .replace(/jdpSerif/g, `${P}Serif`)
    .replace(/jdpSans/g, `${P}Sans`)
    .replace(/CSS_JDP/g, `CSS_${SUF}`)
    .replace(/_JDP\b/g, `_${SUF}`)
    .replace(/JdpEscenas/g, Escenas)
    .replace(/CuentaJardin/g, `Cuenta${fam.mote}`)
    .replace(/CheckinJardin/g, `Checkin${fam.mote}`)
    .replace(/CancionesJardin/g, `Canciones${fam.mote}`)
    .replace(/TriviaJardin/g, `Trivia${fam.mote}`)
    .replace(/JardinDePapelTemplate/g, fam.archivo);

  // ── 2. La cabecera ──────────────────────────────────────────────────────
  const cabeceraVieja = s.slice(s.indexOf("/**"), s.indexOf(" */") + 3);
  s = s.replace(cabeceraVieja, L(
    "/**",
    ` * ${fam.titulo} · Colección Iconic — sub-colección "Capas de papel"`,
    ` * Variante: ${fam.varianteBase} (base)`,
    " *",
    " * GENERADO por scripts/derivar-capas.js a partir de",
    " * JardinDePapelTemplate.tsx — no editar a mano: el motor se arregla en",
    ` * Jardín y se vuelve a derivar; lo propio de esta familia está en`,
    ` * scripts/familias/capas/${path.basename(rutaJson)}.`,
    " *",
    ...fam.resumen.map((linea) => ` * ${linea}`),
    " *",
    " * Las escenas son las del mockup, byte por byte (ver",
    ` * escenas/${Escenas}.ts y scripts/extraer-escenas-capas.js): son`,
    " * decoración pura -- ni un dato del invitado pasa por ahí -- y montarlas",
    " * como HTML es lo único que garantiza que el dibujo llegue igual.",
    " */"
  ));

  // ── 3. Tipografías ──────────────────────────────────────────────────────
  rep(
    'import { Cormorant_Garamond, DM_Sans } from "next/font/google";',
    `import { ${fam.serif.modulo}, ${fam.sans.modulo} } from "next/font/google";`,
    "import de fuentes"
  );
  rep(
    L(
      `const ${P}Serif = Cormorant_Garamond({`,
      '  subsets: ["latin"],',
      '  weight: ["400", "500", "600"],',
      '  style: ["normal", "italic"],',
      '  display: "swap",',
      `  variable: "--${P}-serif",`,
      "});",
      `const ${P}Sans = DM_Sans({`,
      '  subsets: ["latin"],',
      '  weight: ["400", "500"],',
      '  display: "swap",',
      `  variable: "--${P}-sans",`,
      "});"
    ),
    L(
      `const ${P}Serif = ${fam.serif.modulo}({`,
      '  subsets: ["latin"],',
      `  weight: [${fam.serif.pesos.map((p) => `"${p}"`).join(", ")}],`,
      ...(fam.serif.italica === false ? [] : ['  style: ["normal", "italic"],']),
      '  display: "swap",',
      `  variable: "--${P}-serif",`,
      "});",
      `const ${P}Sans = ${fam.sans.modulo}({`,
      '  subsets: ["latin"],',
      `  weight: [${fam.sans.pesos.map((p) => `"${p}"`).join(", ")}],`,
      '  display: "swap",',
      `  variable: "--${P}-sans",`,
      "});"
    ),
    "declaración de fuentes"
  );
  s = s.split("'Cormorant Garamond', serif").join(fam.serif.css);
  s = s.split("'DM Sans', sans-serif").join(fam.sans.css);

  // ── 4. La paleta base ───────────────────────────────────────────────────
  const bloqueDePaleta = (p) => L(
    "const PALETA = {",
    ...["bg", "bg2", "ink", "ink2", "acc", "acc2", "sky1", "sky2", "hill1", "hill2", "hill3", "night", "nightInk"]
      .map((k) => `  ${k}: "${p[k]}",`),
    "};"
  );
  const RE_PALETA = /const PALETA = \{[\s\S]*?\n\};/;
  if (!RE_PALETA.test(s)) faltantes.push("bloque PALETA");
  s = s.replace(RE_PALETA, bloqueDePaleta(fam.paleta));

  // ── 5. Qué escena le toca a cada panel ──────────────────────────────────
  // El mockup de cada familia trae los paneles que esa fiesta necesita: los
  // quince no suelen tener ceremonia aparte. Mapear por nombre (y no por
  // posición) evita que sacar un panel le pase el dibujo equivocado al de al
  // lado.
  const linea = (nombre) => {
    const i = fam.paneles[nombre];
    return i === null || i === undefined
      ? `  ${nombre}: "", // su mockup no dibuja este panel`
      : `  ${nombre}: CUANDO_${SUF}[${i}] ?? "",`;
  };
  rep(
    L(
      "const ESCENA_DE_PANEL: Record<string, string> = {",
      `  recepcion: CUANDO_${SUF}[0] ?? "",`,
      `  ceremonia: CUANDO_${SUF}[1] ?? "",`,
      `  llegar: CUANDO_${SUF}[2] ?? "",`,
      `  cronograma: CUANDO_${SUF}[3] ?? "",`,
      "};"
    ),
    L(
      "const ESCENA_DE_PANEL: Record<string, string> = {",
      linea("recepcion"),
      linea("ceremonia"),
      linea("llegar"),
      linea("cronograma"),
      "};"
    ),
    "escenas por panel"
  );

  if (faltantes.length) {
    console.error(`${fam.archivo}: no encontré estos anclajes en JardinDePapelTemplate.tsx (¿cambió?):\n  - ${faltantes.join("\n  - ")}`);
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
  fs.readdirSync(CONFIGS)
    .filter((f) => f.endsWith(".json"))
    .forEach((f) => derivar(path.join(CONFIGS, f)));
}
