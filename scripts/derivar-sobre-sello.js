#!/usr/bin/env node
/**
 * Deriva SobreSelloTemplate.tsx de PrensaTemplate.tsx.
 *
 * Sobre & Sello es la primera familia de la otra sub-colección de Paper:
 * Papelería Viva. Comparte con Papel Prensado la ARQUITECTURA (mecanismo
 * Flat, las mismas nueve secciones en el mismo orden, los mismos componentes
 * compartidos, el splash, la pastilla que se repliega) -- y eso es lo que se
 * hereda de Prensa, ya probado -- pero no comparte NADA del vestuario:
 *
 *  - Papel Prensado es monocroma y su gracia es el relieve. Papelería Viva
 *    tiene DOS acentos de color (el lacre y el dorado) y su gracia son los
 *    doodles pintados: ramos, plumas, lazos y un sello de lacre.
 *  - Ahí no hay hojas troqueladas con esquinas plegadas: hay tarjetas de
 *    papel con un filete fino y la esquina doblada.
 *  - La portada no es una hoja: es un SOBRE. Forro a rayas, doble filete
 *    interior, ramos en las esquinas, el borde rasgado del papel y los
 *    nombres abajo, sobre el papel que asoma.
 *  - La cuenta regresiva son los días en un círculo con un anillo que gira
 *    muy lento, y al costado tres cajas chicas.
 *  - La script es Pinyon Script (de Google, no la del repo).
 *
 * GENERADO: no editar SobreSelloTemplate.tsx a mano. Lo de la arquitectura
 * se arregla en Prensa y se vuelve a derivar; lo de Papelería Viva, acá.
 *
 * Uso:  node scripts/derivar-sobre-sello.js
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
const L = (...l) => l.join("\n");

// ── 1. Identidad ──────────────────────────────────────────────────────────
s = s.replace(/\bpr-/g, "ss-")
  .replace(/prCormorant/g, "ssCormorant")
  .replace(/prJost/g, "ssJost")
  .replace(/prSplashSale/g, "ssSplashSale")
  .replace(/prPortadaSube/g, "ssPortadaSube")
  .replace(/prPrensado/g, "ssPrensado")
  .replace(/CSS_PRENSA/g, "CSS_SOBRE")
  .replace(/CuentaPrensa/g, "CuentaSobre")
  .replace(/QuizPrensa/g, "QuizSobre")
  .replace(/PrensaTemplate/g, "SobreSelloTemplate");

const cabeceraVieja = s.slice(s.indexOf("/**"), s.indexOf(" */") + 3);
s = s.replace(cabeceraVieja, L(
  "/**",
  " * SobreSelloTemplate.tsx — Colección Paper · Papelería Viva · Familia 01",
  " * \"Sobre & Sello\". Variante: Bordó (base). Las otras cuatro (Verde bosque,",
  " * Azul tinta, Terracota, Oliva) se generan con",
  " * scripts/gen-papeleria-viva-variants.js.",
  " *",
  " * GENERADO por scripts/derivar-sobre-sello.js a partir de",
  " * PrensaTemplate.tsx — no editar a mano.",
  " *",
  " * Portado desde mockup/Paper/Sobre y Sello - Panoramica.dc.html.",
  " *",
  " * COMPARTE CON PAPEL PRENSADO la arquitectura: mecanismo Flat, las mismas",
  " * nueve secciones en el mismo orden, los componentes compartidos de v2/",
  " * vestidos con el registro, el splash y la pastilla que se repliega.",
  " *",
  " * NO COMPARTE NADA DEL VESTUARIO, que es lo que hace a la sub-colección:",
  " *",
  " *  - DOS ACENTOS: el lacre (bordó) y el dorado. Papel Prensado es",
  " *    monocroma; acá el color es la mitad de la identidad.",
  " *  - DOODLES PINTADOS en diez slots -- ramos de esquina, una pluma que",
  " *    flota, un lazo, el sello de lacre -- como <img>, porque tienen medios",
  " *    tonos y como máscara de un color plano se perderían.",
  " *  - TARJETAS, no hojas troqueladas: papel con un filete fino de",
  " *    rgba(0,0,0,.08) y la esquina doblada de 16 px.",
  " *  - LA PORTADA ES UN SOBRE: forro a rayas en diagonal, doble filete",
  " *    interior, ramos en las esquinas, el borde rasgado del papel asomando",
  " *    y los nombres abajo, en Cormorant con el & en Pinyon Script.",
  " *  - LA CUENTA REGRESIVA son los días en un círculo con un anillo que da",
  " *    una vuelta por minuto, y al costado tres cajitas con horas, minutos y",
  " *    segundos.",
  " *  - SIN RELIEVE: la tinta es plana. El registro prensado es de la otra",
  " *    sub-colección.",
  " */"
));

// ── 2. Tipografías ────────────────────────────────────────────────────────
rep(
  'import { Cormorant_Garamond, Jost } from "next/font/google";',
  'import { Cormorant_Garamond, Jost, Pinyon_Script } from "next/font/google";',
  "import de fuentes"
);
rep(
  L(
    "const ssJost = Jost({",
    '  subsets: ["latin"],',
    "  preload: false,",
    '  weight: ["300", "400", "500"],',
    '  variable: "--ss-jost",',
    '  display: "swap",',
    "});"
  ),
  L(
    "const ssJost = Jost({",
    '  subsets: ["latin"],',
    "  preload: false,",
    '  weight: ["300", "400", "500"],',
    '  variable: "--ss-jost",',
    '  display: "swap",',
    "});",
    "// La script de esta sub-colección sí es de Google (Papel Prensado usa la",
    "// del repo): Pinyon Script, que es la caligrafía de una tarjeta grabada.",
    "const ssPinyon = Pinyon_Script({",
    '  subsets: ["latin"],',
    "  preload: false,",
    '  weight: ["400"],',
    '  variable: "--ss-pinyon",',
    '  display: "swap",',
    "});"
  ),
  "declaración de Pinyon"
);
rep(
  `const SCRIPT = "var(--font-final-parade, 'Final Parade Script'), cursive";`,
  `const SCRIPT = "var(--ss-pinyon), 'Pinyon Script', cursive";`,
  "constante SCRIPT"
);
s = s.split("${ssCormorant.variable} ${ssJost.variable}").join("${ssCormorant.variable} ${ssJost.variable} ${ssPinyon.variable}");

// ── 3. La paleta: dos papeles y DOS acentos ───────────────────────────────
rep(
  L(
    'const PAPEL = "#F4ECE2";',
    'const PAPEL2 = "#EFE5D9";',
    'const TINTA = "#514842";',
    'const TINTA_SUAVE = "#8A756D";'
  ),
  L(
    'const PAPEL = "#F4EBE2";',
    'const PAPEL2 = "#EAE0D4";',
    'const TINTA = "#2A2320";',
    'const TINTA_SUAVE = "#6E5E52";',
    "/**",
    " * Los dos acentos de Papelería Viva: el lacre y el dorado. Son lo que",
    " * cambia por variante (junto con los papeles) y lo que la separa de Papel",
    " * Prensado, que es monocroma a propósito.",
    " */",
    'const ACENTO = "#7A2F3A";',
    'const ACENTO2 = "#A8854E";'
  ),
  "paleta"
);
rep('const SH = "120,103,86";', 'const SH = "42,35,32";', "sombra");
rep('scrimColorRgb="244,236,226"', 'scrimColorRgb="244,235,226"', "scrim");

// El acento manda en los ganchos de tema que leen los componentes compartidos.
rep(
  L(
    '    "--t-acc": TINTA,',
    '    "--t-acc2": TINTA_SUAVE,',
    '    "--c-accent": TINTA,'
  ),
  L(
    '    "--t-acc": ACENTO,',
    '    "--t-acc2": ACENTO2,',
    '    "--c-accent": ACENTO,'
  ),
  "acento en el tema"
);

// ── 4. Las piezas: doodles pintados ───────────────────────────────────────
rep(
  L(
    'const PIEZAS = "/templates/iconos-linea/";',
    "const ICONOS = {"
  ),
  L(
    "/**",
    " * Los cuatro doodles de la familia. Van como <img> y no como máscara: son",
    " * acuarelas con medios tonos, y pintadas de un color plano se perderían.",
    " * Las cinco variantes comparten los cuatro archivos.",
    " */",
    'const DOODLES = "/templates/sobre-sello/";',
    "",
    'const PIEZAS = "/templates/iconos-linea/";',
    "const ICONOS = {"
  ),
  "constante de doodles"
);

rep(
  "/** Una hoja de papel prensado: grano, sombra, esquinas plegadas y filete. */",
  L(
    "/**",
    " * Un doodle pintado. Va fuera del flujo, sin atajar clics, y con",
    " * loading lazy salvo los de la portada: son decoración y no tiene sentido",
    " * que retrasen el primer dibujo.",
    " */",
    'function Doodle({ pieza, ancho, prioritario = false, className, ...posicion }: { pieza: "ramo-esquina" | "pluma" | "lazo" | "lacre"; ancho: number | string; prioritario?: boolean; className?: string } & React.CSSProperties) {',
    "  return (",
    "    // eslint-disable-next-line @next/next/no-img-element",
    "    <img",
    "      src={`${DOODLES}${pieza}.webp`}",
    '      alt=""',
    '      aria-hidden="true"',
    "      className={className}",
    '      loading={prioritario ? "eager" : "lazy"}',
    "      style={{",
    '        position: "absolute", width: ancho, pointerEvents: "none", zIndex: 0,',
    "        filter: `drop-shadow(0 3px 6px rgba(${SH},.18))`, ...posicion,",
    "      }}",
    "    />",
    "  );",
    "}",
    "",
    "/** Una tarjeta de papel: filete fino y la esquina doblada. */"
  ),
  "componente Doodle"
);

// ── 5. La cuenta regresiva ────────────────────────────────────────────────
rep(
  L(
    "  return (",
    '    <div id="countdown" className="ss-cuenta">',
    "      {celdas.map((c) => (",
    '        <div key={c.l} className="ss-cuenta-celda">',
    '          <span className="ss-cuenta-num">{c.v}</span>',
    '          <span className="ss-cuenta-etq">{c.l}</span>',
    "        </div>",
    "      ))}",
    "    </div>",
    "  );"
  ),
  L(
    "  // Los días van en el centro de un anillo que da una vuelta por minuto:",
    "  // es lo único que se mueve en toda la sección, y se mueve tan despacio",
    "  // que se nota recién si uno se queda mirando. Horas, minutos y segundos",
    "  // van abajo, en tres cajitas con la esquina doblada.",
    "  const [dias, ...resto] = celdas;",
    "  return (",
    '    <div id="countdown" className="ss-cuenta">',
    '      <div className="ss-cuenta-circulo">',
    '        <span className="ss-cuenta-anillo" aria-hidden="true" />',
    "        <span>",
    '          <span className="ss-cuenta-dias">{dias.v}</span>',
    '          <span className="ss-cuenta-etq">{dias.l}</span>',
    "        </span>",
    "      </div>",
    '      <div className="ss-cuenta-grilla">',
    "        {resto.map((c) => (",
    '          <div key={c.l} className="ss-cuenta-caja">',
    '            <span className="ss-cuenta-num">{c.v}</span>',
    '            <span className="ss-cuenta-etq">{c.l}</span>',
    "          </div>",
    "        ))}",
    "      </div>",
    "    </div>",
    "  );"
  ),
  "cuenta regresiva"
);

// ── 6. Las portadas son un sobre ──────────────────────────────────────────
const SOBRE = (sangria) => L(
  `${sangria}{/* El sobre: forro a rayas, doble filete, ramos en las esquinas y`,
  `${sangria}    el borde rasgado del papel asomando abajo. */}`,
  `${sangria}<div className="ss-sobre" aria-hidden="true">`,
  `${sangria}  <div className="ss-sobre-forro" />`,
  `${sangria}  <div className="ss-sobre-brillo" />`,
  `${sangria}  <div className="ss-sobre-filete" />`,
  `${sangria}  <div className="ss-sobre-filete ss-sobre-filete--interno" />`,
  `${sangria}  <Doodle pieza="ramo-esquina" ancho="35%" left="-4%" top="-2%" prioritario />`,
  `${sangria}  <Doodle pieza="ramo-esquina" ancho="30%" right="-4%" bottom="14%" transform="scaleX(-1) rotate(8deg)" opacity={0.95} prioritario />`,
  `${sangria}  <Doodle pieza="lacre" ancho="22%" left="50%" top="38%" transform="translate(-50%,-50%)" prioritario />`,
  `${sangria}</div>`
);

rep(
  L(
    '        <aside className="d-left hide-mobile ss-izquierda">',
    '          <Hoja portada className="ss-hoja-grande">',
    '            <IconoLinea nombre={esXV ? "torta" : "anillos"} ancho={esXV ? "18%" : "22%"} tope={76} />'
  ),
  L(
    '        <aside className="d-left hide-mobile ss-izquierda">',
    '          <Hoja portada className="ss-hoja-grande">',
    SOBRE("            ")
  ),
  "sobre de escritorio"
);
rep(
  L(
    '            <Hoja portada className={isCoverOpen ? "ss-portada--sube" : ""}>',
    "              <Entra>",
    '                <IconoLinea nombre={esXV ? "torta" : "anillos"} ancho={esXV ? "18%" : "22%"} tope={76} />'
  ),
  L(
    '            <Hoja portada className={isCoverOpen ? "ss-portada--sube" : ""}>',
    SOBRE("              "),
    "              <Entra>"
  ),
  "sobre del celular"
);

// La pluma flota en la frase y el lazo cierra la invitación.
rep(
  L(
    "              <Entra>",
    '                <IconoLinea nombre={esXV ? "torta" : "anillos"} ancho={esXV ? "15%" : "16%"} />'
  ),
  L(
    '              <Doodle pieza="pluma" ancho={86} right={14} top={44} className="ss-flota" />',
    "              <Entra>"
  ),
  "pluma de la frase"
);
rep(
  L(
    "              <Entra>",
    '                <IconoLinea nombre="confeti" />'
  ),
  L(
    '              <Doodle pieza="lazo" ancho={120} left="50%" top={-28} transform="translateX(-50%)" />',
    "              <Entra>"
  ),
  "lazo del cierre"
);

// ── 6b. La cabecera de sección ────────────────────────────────────────────
// Papel Prensado encabeza con un ícono de línea y un número; Papelería Viva
// con un renglón: el nombre de la sección en el acento, un filete largo que
// llega hasta el borde y un punto dorado que lo cierra.
rep(
  L(
    "function Cabecera({ icono, numero, titulo, anchoIcono, topeIcono }: { icono: NombreDeIcono; numero: string; titulo: string; anchoIcono?: string; topeIcono?: number }) {",
    "  return (",
    "    <Entra>",
    "      <IconoLinea nombre={icono} ancho={anchoIcono} tope={topeIcono} />",
    '      <p className="ss-num">{numero}.</p>',
    '      <h3 className="ss-titulo">{titulo}</h3>',
    "    </Entra>",
    "  );"
  ),
  L(
    "// Los parámetros de ícono siguen en la firma porque las secciones los pasan",
    "// (el llamado es el mismo que en Papel Prensado); acá no se dibujan.",
    "// eslint-disable-next-line @typescript-eslint/no-unused-vars",
    "function Cabecera({ icono, numero, titulo, anchoIcono, topeIcono }: { icono: NombreDeIcono; numero: string; titulo: string; anchoIcono?: string; topeIcono?: number }) {",
    "  return (",
    "    <Entra>",
    '      <div className="ss-cabecera">',
    '        <span className="ss-kicker">{titulo}</span>',
    '        <span className="ss-cabecera-filete" aria-hidden="true" />',
    '        <span className="ss-cabecera-punto" aria-hidden="true" />',
    "      </div>",
    "    </Entra>",
    "  );"
  ),
  "cabecera de sección"
);

// ── 6c. Sin grano ni relieve: acá la tinta es plana ───────────────────────
rep(
  L(
    'const GRANO_PAGINA = grano("0.85", "0.30");',
    'const GRANO_HOJA = grano("1.1", "0.22");'
  ),
  L(
    "// Papelería Viva no lleva grano ni relieve: el papel es liso y la gracia",
    "// está en el color y en los doodles. Las dos funciones quedan en el",
    "// archivo (vienen del registro compartido) pero no se usan acá.",
    "void grano;",
    "void relieve;"
  ),
  "grano y relieve"
);

if (faltantes.length) {
  console.error("No encontré estos anclajes en PrensaTemplate.tsx (¿cambió?):\n  - " + faltantes.join("\n  - "));
  process.exit(1);
}

// ── 7. El vestuario entero ────────────────────────────────────────────────
// El CSS de Papel Prensado no sirve: son dos registros distintos. Se
// reemplaza el bloque completo, que es donde vive toda la identidad visual.
const inicioCss = s.indexOf("const CSS_SOBRE = `");
const finCss = s.indexOf("\n`;", inicioCss);
if (inicioCss < 0 || finCss < 0) {
  console.error("No encontré el bloque CSS de la plantilla base.");
  process.exit(1);
}
const CSS = fs.readFileSync(path.join(__dirname, "css", "sobre-sello.css.js"), "utf8");
s = s.slice(0, inicioCss) + CSS.trimEnd() + s.slice(finCss + 3);

fs.writeFileSync(path.join(DIR, "SobreSelloTemplate.tsx"), s);
console.log("SobreSelloTemplate.tsx (" + (s.length / 1024).toFixed(0) + " KB) derivado de PrensaTemplate.tsx");
