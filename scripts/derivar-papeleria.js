#!/usr/bin/env node
/**
 * Deriva una familia de "Papelería Viva" (Colección Paper) de la base,
 * SobreSelloTemplate.tsx.
 *
 * Las cinco familias de esta sub-colección son la misma papelería: tarjetas
 * con filete fino y esquina doblada, cabecera de sección con filete y punto,
 * dos acentos, doodles pintados en los márgenes, cuenta regresiva de anillo y
 * una portada que es un sobre con el papel asomando abajo. Lo que cambia de
 * una a otra:
 *
 *  - LAS CARAS. Cada familia trae su terna (una script, una de titulares y
 *    una de texto) y eso es lo que primero se reconoce: Parisienne no es
 *    Caveat, y Abril Fatface no es Source Serif.
 *  - LOS DOODLES. Cada una tiene su juego de piezas y sus posiciones.
 *  - LA PALETA, que son cuatro colores y no dos.
 *  - EL BORDE DEL SOBRE: filete doble, punteado, pespunte.
 *
 * Todo eso vive en la ficha JSON de la familia (scripts/familias/papeleria/),
 * al lado de sus variantes de color. Un arreglo de la papelería se hace en
 * Sobre & Sello y llega a las cinco volviendo a correr esto.
 *
 * Uso:
 *   node scripts/derivar-papeleria.js scripts/familias/papeleria/acuarela.json
 *   node scripts/derivar-papeleria.js          (todas)
 */
const fs = require("node:fs");
const path = require("node:path");

const DIR = path.join(__dirname, "..", "src", "components", "templates");
const CONFIGS = path.join(__dirname, "familias", "papeleria");
const L = (...l) => l.join("\n");

/** Un <Doodle> a partir de su ficha. */
function doodleJsx(d, sangria) {
  const props = Object.entries(d)
    .filter(([k]) => !["pieza", "ancho", "prioritario", "clase"].includes(k))
    .map(([k, v]) => (typeof v === "number" ? `${k}={${v}}` : `${k}="${v}"`));
  return [
    `${sangria}<Doodle pieza="${d.pieza}" ancho=${typeof d.ancho === "number" ? `{${d.ancho}}` : `"${d.ancho}"`}`,
    d.clase ? `className="${d.clase}"` : "",
    props.join(" "),
    d.prioritario ? "prioritario" : "",
    "/>",
  ].filter(Boolean).join(" ");
}

function derivar(rutaJson) {
  const fam = JSON.parse(fs.readFileSync(rutaJson, "utf8"));
  if (fam.esBase) return;
  let s = fs.readFileSync(path.join(DIR, "SobreSelloTemplate.tsx"), "utf8");
  const faltantes = [];
  const rep = (a, b, etiqueta) => {
    if (!s.includes(a)) { faltantes.push(etiqueta); return; }
    s = s.split(a).join(b);
  };

  const P = fam.prefijo;

  // ── 1. Identidad ────────────────────────────────────────────────────────
  s = s.replace(/\bss-/g, `${P}-`)
    .replace(/ssCormorant/g, `${P}Serif`)
    .replace(/ssJost/g, `${P}Sans`)
    .replace(/ssPinyon/g, `${P}Script`)
    .replace(/ssSplashSale/g, `${P}SplashSale`)
    .replace(/ssPortadaSube/g, `${P}PortadaSube`)
    .replace(/ssPrensado/g, `${P}Prensado`)
    .replace(/ssGira/g, `${P}Gira`)
    .replace(/ssFlota/g, `${P}Flota`)
    .replace(/ssBrillo/g, `${P}Brillo`)
    .replace(/CSS_SOBRE/g, `CSS_${P.toUpperCase()}`)
    .replace(/CuentaSobre/g, `Cuenta${fam.mote}`)
    .replace(/QuizSobre/g, `Quiz${fam.mote}`)
    .replace(/SobreSelloTemplate/g, fam.archivo);

  const cabeceraVieja = s.slice(s.indexOf("/**"), s.indexOf(" */") + 3);
  s = s.replace(cabeceraVieja, L(
    "/**",
    ` * ${fam.archivo}.tsx — Colección Paper · Papelería Viva · ${fam.titulo}`,
    ` * Variante: ${fam.varianteBase} (base).`,
    " *",
    " * GENERADO por scripts/derivar-papeleria.js a partir de",
    " * SobreSelloTemplate.tsx — no editar a mano: la papelería se arregla en",
    " * Sobre & Sello y se vuelve a derivar; lo propio de esta familia está en",
    ` * scripts/familias/papeleria/${path.basename(rutaJson)}.`,
    " *",
    ...fam.resumen.map((linea) => ` * ${linea}`),
    " */"
  ));

  // ── 2. Las caras ────────────────────────────────────────────────────────
  // Membrete no tiene script: es papelería institucional y su "firma" es la
  // misma serif en itálica. En ese caso no se declara una cuarta fuente (sería
  // el mismo archivo pedido dos veces) y la constante SCRIPT apunta al serif.
  const sinScript = Boolean(fam.script.usaSerif);
  rep(
    'import { Cormorant_Garamond, Jost, Pinyon_Script } from "next/font/google";',
    sinScript
      ? `import { ${fam.serif.modulo}, ${fam.sans.modulo} } from "next/font/google";`
      : `import { ${fam.serif.modulo}, ${fam.sans.modulo}, ${fam.script.modulo} } from "next/font/google";`,
    "import de fuentes"
  );
  rep("= Cormorant_Garamond({", `= ${fam.serif.modulo}({`, "módulo serif");
  rep("= Jost({", `= ${fam.sans.modulo}({`, "módulo sans");
  if (sinScript) {
    // Se borra la declaración entera de la script.
    const desde = s.indexOf(`const ${P}Script = Pinyon_Script({`);
    const hasta = s.indexOf("});", desde);
    if (desde < 0 || hasta < 0) faltantes.push("declaración de la script");
    else s = s.slice(0, desde) + s.slice(hasta + 4);
  } else {
    rep("= Pinyon_Script({", `= ${fam.script.modulo}({`, "módulo script");
  }
  rep(
    `  weight: ["300", "400"],\n  variable: "--${P}-cormorant",`,
    `  weight: [${fam.serif.pesos.map((p) => `"${p}"`).join(", ")}],\n  variable: "--${P}-serif",`,
    "pesos del serif"
  );
  rep(
    `  weight: ["300", "400", "500"],\n  variable: "--${P}-jost",`,
    `  weight: [${fam.sans.pesos.map((p) => `"${p}"`).join(", ")}],\n  variable: "--${P}-sans",`,
    "pesos del sans"
  );
  if (!sinScript) rep(`  variable: "--${P}-pinyon",`, `  variable: "--${P}-script",`, "variable de la script");
  // Sin script, la lista de clases de la raíz queda con un espacio de más.
  if (sinScript) {
    s = s.split(`\${${P}Script.variable}`).join("").split(".variable}  ").join(".variable} ");
  }
  if (fam.serif.italica === false) {
    rep('  style: ["normal", "italic"],\n', "", "itálica del serif");
  }
  rep(
    `const SERIF = "var(--${P}-cormorant), 'Cormorant Garamond', serif";`,
    `const SERIF = "var(--${P}-serif), ${fam.serif.css}";`,
    "constante SERIF"
  );
  rep(
    `const SANS = "var(--${P}-jost), 'Jost', sans-serif";`,
    `const SANS = "var(--${P}-sans), ${fam.sans.css}";`,
    "constante SANS"
  );
  rep(
    `const SCRIPT = "var(--${P}-pinyon), 'Pinyon Script', cursive";`,
    sinScript
      ? `const SCRIPT = "var(--${P}-serif), ${fam.script.css}";`
      : `const SCRIPT = "var(--${P}-script), ${fam.script.css}";`,
    "constante SCRIPT"
  );

  // ── 3. La paleta ────────────────────────────────────────────────────────
  rep('const PAPEL = "#F4EBE2";', `const PAPEL = "${fam.paleta.bg}";`, "PAPEL");
  rep('const PAPEL2 = "#EAE0D4";', `const PAPEL2 = "${fam.paleta.alt}";`, "PAPEL2");
  rep('const TINTA = "#2A2320";', `const TINTA = "${fam.paleta.ink}";`, "TINTA");
  rep('const TINTA_SUAVE = "#6E5E52";', `const TINTA_SUAVE = "${fam.paleta.ink2}";`, "TINTA_SUAVE");
  rep('const ACENTO = "#7A2F3A";', `const ACENTO = "${fam.paleta.acc}";`, "ACENTO");
  rep('const ACENTO2 = "#A8854E";', `const ACENTO2 = "${fam.paleta.acc2}";`, "ACENTO2");
  const rgb = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
  };
  rep('const SH = "42,35,32";', `const SH = "${rgb(fam.paleta.ink)}";`, "sombra");
  rep('scrimColorRgb="244,235,226"', `scrimColorRgb="${rgb(fam.paleta.bg)}"`, "scrim");

  // ── 4. Los doodles ──────────────────────────────────────────────────────
  // Membrete no tiene piezas: es papelería institucional, todo filete y
  // tipografía. En ese caso se van las tres apariciones y el componente.
  if (fam.sinDoodles) {
    for (const marca of ["portadaDesk", "portadaMovil", "frase", "cierre"]) void marca;
    const desde = s.indexOf("/**\n * Un doodle pintado.");
    const hasta = s.indexOf("/** Una tarjeta de papel", desde);
    if (desde < 0 || hasta < 0) faltantes.push("componente Doodle");
    else s = s.slice(0, desde) + s.slice(hasta);
    s = s.replace(/^.*<Doodle .*$\n/gm, "");
    s = s.replace(/^\/\*\*\n \* Los cuatro doodles[\s\S]*?\*\/\n/m, "");
    s = s.replace(/^const DOODLES = .*$\n\n?/m, "");
  } else {
    rep(
      'const DOODLES = "/templates/sobre-sello/";',
      `const DOODLES = "/templates/${fam.doodles.carpeta}/";`,
      "carpeta de doodles"
    );
  }
  if (!fam.sinDoodles) {
  rep(
    'function Doodle({ pieza, ancho, prioritario = false, className, ...posicion }: { pieza: "ramo-esquina" | "pluma" | "lazo" | "lacre"; ancho: number | string; prioritario?: boolean; className?: string } & React.CSSProperties) {',
    `function Doodle({ pieza, ancho, prioritario = false, className, ...posicion }: { pieza: ${fam.doodles.piezas.map((p) => `"${p}"`).join(" | ")}; ancho: number | string; prioritario?: boolean; className?: string } & React.CSSProperties) {`,
    "tipos de doodle"
  );

  // Los de la portada (que van dos veces: escritorio y celular, con distinta
  // sangría), el de la frase y el del cierre.
  const SANGRIA_DESK = " ".repeat(14);
  const SANGRIA_MOVIL = " ".repeat(16);
  const portadaBase = (sangria) => L(
    `${sangria}<Doodle pieza="ramo-esquina" ancho="35%" left="-4%" top="-2%" prioritario />`,
    `${sangria}<Doodle pieza="ramo-esquina" ancho="30%" right="-4%" bottom="14%" transform="scaleX(-1) rotate(8deg)" opacity={0.95} prioritario />`,
    `${sangria}<Doodle pieza="lacre" ancho="22%" left="50%" top="38%" transform="translate(-50%,-50%)" prioritario />`
  );
  rep(
    portadaBase(SANGRIA_DESK),
    fam.doodles.portada.map((d) => doodleJsx(d, SANGRIA_DESK)).join("\n"),
    "doodles de la portada (escritorio)"
  );
  rep(
    portadaBase(SANGRIA_MOVIL),
    fam.doodles.portada.map((d) => doodleJsx(d, SANGRIA_MOVIL)).join("\n"),
    "doodles de la portada (celular)"
  );
  rep(
    `${SANGRIA_DESK}<Doodle pieza="pluma" ancho={86} right={14} top={44} className="${P}-flota" />`,
    doodleJsx(fam.doodles.frase, SANGRIA_DESK),
    "doodle de la frase"
  );
  rep(
    `${SANGRIA_DESK}<Doodle pieza="lazo" ancho={120} left="50%" top={-28} transform="translateX(-50%)" />`,
    doodleJsx(fam.doodles.cierre, SANGRIA_DESK),
    "doodle del cierre"
  );
  }

  // ── 5. El vestuario propio ──────────────────────────────────────────────
  // Cada familia agrega su hoja de estilos al final del bloque compartido: es
  // más corto y más claro que reescribir las 200 líneas de la papelería.
  const extra = fs.readFileSync(path.join(__dirname, "css", `${fam.css}.css`), "utf8");
  const marca = "\n  @media (prefers-reduced-motion: reduce) {";
  if (!s.includes(marca)) faltantes.push("cierre del CSS");
  s = s.replace(marca, "\n" + extra.trimEnd() + "\n" + marca);

  if (faltantes.length) {
    console.error(`${fam.archivo}: no encontré estos anclajes en SobreSelloTemplate.tsx (¿cambió?):\n  - ${faltantes.join("\n  - ")}`);
    process.exitCode = 1;
    return;
  }

  fs.writeFileSync(path.join(DIR, `${fam.archivo}.tsx`), s);
  console.log(`${fam.archivo}.tsx (${(s.length / 1024).toFixed(0)} KB) — ${fam.titulo}, ${fam.script.modulo} + ${fam.serif.modulo} + ${fam.sans.modulo}`);
}

const pedidos = process.argv.slice(2);
if (pedidos.length) {
  pedidos.forEach((p) => derivar(path.resolve(p)));
} else {
  fs.readdirSync(CONFIGS).filter((f) => f.endsWith(".json")).forEach((f) => derivar(path.join(CONFIGS, f)));
}
