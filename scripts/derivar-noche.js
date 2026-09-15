#!/usr/bin/env node
/**
 * Deriva NocheTemplate.tsx de PrensaTemplate.tsx.
 *
 * Noche es Papel Prensado impreso sobre papel negro. Es la misma imprenta que
 * Prensa -- hoja, filete, pliegues, entrada de sección, pastilla, cronograma --
 * con cuatro cambios que son toda la familia:
 *
 *  1. EL RELIEVE SE DA VUELTA. Sobre papel claro la letra sale hacia afuera:
 *     luz blanca al 92 % arriba a la izquierda y sombra abajo a la derecha.
 *     Sobre negro eso no existe: la letra se prensa hacia ADENTRO, la luz baja
 *     a .14 (más que eso y parece tiza) y la sombra sube. La luz sigue girando
 *     ±3° con el scroll.
 *  2. LAS LÍNEAS SE ACLARAN. En Prensa cada filete, borde y hairline es la
 *     sombra del papel (rgba(120,103,86,…)); acá son la tinta clara
 *     (rgba(246,235,228,…)), porque una línea marrón sobre negro no se ve. Las
 *     SOMBRAS siguen siendo negras: eso no cambia con el color del papel.
 *  3. EL GRANO SUBE a 0.42: el papel negro es más áspero, y con el grano de
 *     Prensa quedaba plano como una pantalla apagada.
 *  4. LA PORTADA LLEVA MONOGRAMA, no el ícono de línea: un óvalo de 0,75 px
 *     con las iniciales, y los nombres en Final Parade en vez del relieve
 *     (sobre negro el relieve de un nombre de 38 px no se lee).
 *
 * GENERADO: no editar NocheTemplate.tsx a mano. Lo del registro se arregla en
 * PrensaTemplate.tsx y se vuelve a derivar; lo de Noche, acá.
 *
 * Uso:  node scripts/derivar-noche.js
 */
const fs = require("node:fs");
const path = require("node:path");

const DIR = path.join(__dirname, "..", "src", "components", "templates");
let s = fs.readFileSync(path.join(DIR, "PrensaTemplate.tsx"), "utf8");
const faltantes = [];
function rep(a, b, etiqueta) {
  if (!s.includes(a)) { faltantes.push(etiqueta); return; }
  s = s.split(a).join(b);
}

// ── 1. Identidad del archivo ──────────────────────────────────────────────
s = s.replace(/\bpr-/g, "no-")
  .replace(/prCormorant/g, "noCormorant")
  .replace(/prJost/g, "noJost")
  .replace(/prSplashSale/g, "noSplashSale")
  .replace(/prPortadaSube/g, "noPortadaSube")
  .replace(/prPrensado/g, "noPrensado")
  .replace(/CSS_PRENSA/g, "CSS_NOCHE")
  .replace(/PrensaTemplate/g, "NocheTemplate");

const cabeceraVieja = s.slice(s.indexOf("/**"), s.indexOf(" */") + 3);
s = s.replace(cabeceraVieja, [
  "/**",
  " * NocheTemplate.tsx — Colección Paper · Papel Prensado · Familia 02 \"Noche\"",
  " * Variante: Carbón (base). Las otras cuatro (Tinta, Vino, Bosque, Bronce)",
  " * se generan con scripts/gen-papel-prensado-variants.js: son cinco negros",
  " * distintos, sin un solo color de acento.",
  " *",
  " * GENERADO por scripts/derivar-noche.js a partir de PrensaTemplate.tsx —",
  " * no editar a mano.",
  " *",
  " * Portado desde mockup/Paper/Noche - Panoramica.dc.html. Misma imprenta que",
  " * Prensa, impresa sobre papel negro:",
  " *",
  " *  - EL RELIEVE ES HUECO: la letra se prensa hacia adentro. Sobre negro la",
  " *    luz es mucho más tenue (.14 en vez de .92) y la sombra manda; con los",
  " *    valores de Prensa los nombres parecían escritos con tiza.",
  " *  - LAS LÍNEAS SON CLARAS (rgba(246,235,228,…)): un filete marrón sobre",
  " *    negro no se ve. Las sombras siguen siendo negras.",
  " *  - EL GRANO SUBE a 0.42: el papel negro es más áspero.",
  " *  - LA PORTADA LLEVA MONOGRAMA en un óvalo, no el ícono de línea, y los",
  " *    nombres van en Final Parade: el relieve de un nombre de 38 px sobre",
  " *    negro no se lee.",
  " */",
].join("\n"));

// ── 2. El papel, la tinta y la línea ──────────────────────────────────────
rep('const PAPEL = "#F4ECE2";', 'const PAPEL = "#141414";', "PAPEL");
rep('const PAPEL2 = "#EFE5D9";', 'const PAPEL2 = "#1C1C1A";', "PAPEL2");
rep('const TINTA = "#514842";', 'const TINTA = "#F6EBE4";', "TINTA");
rep('const TINTA_SUAVE = "#8A756D";', 'const TINTA_SUAVE = "#A89C93";', "TINTA_SUAVE");
rep(
  'const SH = "120,103,86";',
  [
    'const SH = "0,0,0";',
    '/**',
    ' * La tinta clara, para las líneas. En Prensa cada filete y cada borde es la',
    ' * sombra del papel; acá tienen que ser claros o desaparecen sobre el negro.',
    ' * Las sombras (box-shadow) siguen usando SH: eso no depende del papel.',
    ' */',
    'const LN = "246,235,228";',
  ].join("\n"),
  "SH y LN"
);

// ── 3. Las líneas pasan a ser claras, las sombras siguen negras ───────────
s = s.replace(/rgba\(\$\{SH\}/g, "rgba(${LN}");
// Todo lo que era una sombra proyectada vuelve a SH (se reconocen por el
// desplazamiento -1.41/1.41 que usa la colección).
s = s.replace(/(-1\.41px 1\.41px \d+px )rgba\(\$\{LN\}/g, "$1rgba(${SH}");

// ── 4. El relieve hueco ───────────────────────────────────────────────────
rep(
  "  return `${dx.toFixed(2)}px ${dy.toFixed(2)}px 0 rgba(${LN},.55), ${(-dx).toFixed(2)}px ${(-dy).toFixed(2)}px 0 rgba(255,255,255,.92), ${(-dx * 1.43).toFixed(2)}px ${(-dy * 2.14).toFixed(2)}px 4px rgba(${LN},.20)`;",
  "  // Invertido respecto de Prensa: primero la luz (tenue), después la sombra.\n  return `${dx.toFixed(2)}px ${dy.toFixed(2)}px 0 rgba(255,255,255,.14), ${(-dx).toFixed(2)}px ${(-dy).toFixed(2)}px 0 rgba(0,0,0,.55), ${(-dx * 1.43).toFixed(2)}px ${(-dy * 2.14).toFixed(2)}px 4px rgba(0,0,0,.26)`;",
  "relieve hueco"
);

// ── 5. El grano y la sombra de la hoja ────────────────────────────────────
// El velo de la portada animada es del color del papel, que ahora es negro.
rep('scrimColorRgb="244,236,226"', 'scrimColorRgb="20,20,20"', "scrim de la portada");
rep('const GRANO_PAGINA = grano("0.85", "0.30");', 'const GRANO_PAGINA = grano("0.85", "0.42");', "grano de página");
rep('const GRANO_HOJA = grano("1.1", "0.22");', 'const GRANO_HOJA = grano("1.1", "0.42");', "grano de hoja");
rep("    box-shadow: -1.41px 1.41px 4px rgba(${SH},.40);", "    box-shadow: -1.41px 1.41px 4px rgba(${SH},.55);", "sombra de la hoja");

// ── 6. La tinta prensada sobre negro se aclara en vez de oscurecerse ──────
s = s.split("${matiz(PAPEL, -4)}").join("${matiz(PAPEL, 14)}");
s = s.split("${matiz(PAPEL, 3)}").join("${matiz(PAPEL, 14)}");
rep(
  "    text-shadow: 0 -1px 0 rgba(255,255,255,.90), 0 1px 1px rgba(${LN},.50), 0 2px 3px rgba(${LN},.12);",
  "    text-shadow: 0 -1px 0 rgba(255,255,255,.14), 0 1px 1px rgba(0,0,0,.55), 0 2px 3px rgba(0,0,0,.30);",
  "CONFIRMADO hueco"
);

// ── 7. Los nombres van en Final Parade, no en relieve ─────────────────────
rep(
  "  .no-nombres { font-family: ${SERIF}; font-weight: 300; font-size: 38px; line-height: 1.12; margin: 0 0 14px; color: ${matiz(PAPEL, 14)};\n    text-shadow: var(--no-rel); display: flex; flex-direction: column; align-items: center; }",
  "  .no-nombres { font-family: ${SCRIPT}; font-weight: 400; font-size: 56px; line-height: 1; margin: 0 0 14px; color: ${TINTA};\n    display: flex; flex-direction: column; align-items: center; }\n  .desktop-stage .no-nombres { font-size: 62px; }",
  "nombres en script"
);
rep(
  "  .no-amp { font-family: ${SCRIPT}; font-weight: 400; font-size: 34px; line-height: 1.2; color: ${TINTA}; text-shadow: none; margin: 2px 0; }",
  "  .no-amp { font-family: ${SERIF}; font-weight: 300; font-size: 30px; line-height: 1.2; color: ${TINTA_SUAVE}; text-shadow: none; margin: 4px 0; }",
  "ampersand en serif"
);
rep(
  "  .no-hoja-grande .no-nombres { font-size: 38px; }",
  "  .no-hoja-grande .no-nombres { font-size: 62px; }",
  "nombres de la hoja grande"
);
// El & vuelve a ser serif, así que la regla que fuerza la script lo tiene que
// soltar (si no, gana el !important y el ampersand sigue en Final Parade).
rep(
  ".no-raiz .no-script, .no-raiz .no-amp, .no-raiz .no-splash-nombre",
  ".no-raiz .no-script, .no-raiz .no-nombres, .no-raiz .no-splash-nombre",
  "la script manda en los nombres"
);

// ── 8. La portada lleva monograma ─────────────────────────────────────────
const MONOGRAMA = [
  '<div className="no-monograma no-monograma--portada">',
  '              <svg viewBox="0 0 70 92" width="62" height="82" aria-hidden="true">',
  '                <ellipse cx="35" cy="46" rx="32" ry="44" fill="none" stroke="currentColor" strokeWidth=".75" />',
  "              </svg>",
  "              <span>{monograma}</span>",
  "            </div>",
].join("\n");
const CONTADOS = (s.match(/<IconoLinea nombre=\{esXV \? "torta" : "anillos"\} ancho=\{esXV \? "18%" : "22%"\} tope=\{76\} \/>/g) || []).length;
if (CONTADOS !== 2) faltantes.push(`íconos de portada (encontré ${CONTADOS}, esperaba 2)`);
s = s.replace(/<IconoLinea nombre=\{esXV \? "torta" : "anillos"\} ancho=\{esXV \? "18%" : "22%"\} tope=\{76\} \/>/g, MONOGRAMA);
rep(
  "  .no-monograma { position: relative; width: 78px; height: 98px;",
  "  .no-monograma--portada { width: 62px; height: 82px; margin: 0 auto 12px; }\n  .no-monograma--portada span { font-size: 19px; }\n  .no-monograma { position: relative; width: 78px; height: 98px;",
  "monograma de portada"
);

if (faltantes.length) {
  console.error("No encontré estos anclajes en PrensaTemplate.tsx (¿cambió?):\n  - " + faltantes.join("\n  - "));
  process.exit(1);
}

fs.writeFileSync(path.join(DIR, "NocheTemplate.tsx"), s);
console.log("NocheTemplate.tsx (" + (s.length / 1024).toFixed(0) + " KB) derivado de PrensaTemplate.tsx");
