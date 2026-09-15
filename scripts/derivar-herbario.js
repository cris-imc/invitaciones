#!/usr/bin/env node
/**
 * Deriva HerbarioTemplate.tsx de PrensaTemplate.tsx.
 *
 * Herbario es Papel Prensado con botánica prensada encima: las mismas hojas
 * con grano, relieve y pliegues, y sobre ellas una magnolia, ramas de esquina
 * y hojas que caen. Lo propio de la familia:
 *
 *  1. LAS PIEZAS SON FOTOS, NO MÁSCARAS. Una rama tiene medios tonos; como
 *     máscara de un solo color se perdería. Van como <img> con un filtro CSS
 *     que las duotoniza al color de la variante, que es también lo que hace
 *     que las cinco variantes se vean como cinco herbarios distintos sin
 *     tener cinco juegos de imágenes (importa para el egress: son 4 WebP para
 *     toda la familia, no 20).
 *  2. LA VARIANTE CAMBIA EL FILTRO Y EL ACENTO, NO EL PAPEL.
 *  3. LA CUENTA REGRESIVA TIENE OTRA FORMA: los días en grande y, al costado
 *     de un filete vertical, horas, minutos y segundos en columna.
 *  4. AL CONFIRMAR CAEN TRES HOJAS sobre el CONFIRMADO.
 *
 * GENERADO: no editar HerbarioTemplate.tsx a mano.
 *
 * Uso:  node scripts/derivar-herbario.js
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
const L = (...lineas) => lineas.join("\n");

// ── 1. Identidad ──────────────────────────────────────────────────────────
s = s.replace(/\bpr-/g, "hb-")
  .replace(/prCormorant/g, "hbCormorant")
  .replace(/prJost/g, "hbJost")
  .replace(/prSplashSale/g, "hbSplashSale")
  .replace(/prPortadaSube/g, "hbPortadaSube")
  .replace(/prPrensado/g, "hbPrensado")
  .replace(/CSS_PRENSA/g, "CSS_HERBARIO")
  .replace(/CuentaPrensa/g, "CuentaHerbario")
  .replace(/PrensaTemplate/g, "HerbarioTemplate");

const cabeceraVieja = s.slice(s.indexOf("/**"), s.indexOf(" */") + 3);
s = s.replace(cabeceraVieja, L(
  "/**",
  " * HerbarioTemplate.tsx — Colección Paper · Papel Prensado · Familia 04 \"Herbario\"",
  " * Variante: Salvia (base). Las otras cuatro (Eucalipto, Oliva, Ceniza,",
  " * Tinta) se generan con scripts/gen-papel-prensado-variants.js.",
  " *",
  " * GENERADO por scripts/derivar-herbario.js a partir de PrensaTemplate.tsx —",
  " * no editar a mano.",
  " *",
  " * Portado desde mockup/Paper/Herbario - Panoramica.dc.html. Misma imprenta",
  " * que Prensa, con botánica prensada encima:",
  " *",
  " *  - LAS PIEZAS SON FOTOS, NO MÁSCARAS: una rama tiene medios tonos y como",
  " *    máscara de un color plano se perdería. Van como <img> con un filtro",
  " *    que las duotoniza; ese filtro es lo que cambia por variante, así que",
  " *    las cinco se ven como cinco herbarios distintos con UN solo juego de",
  " *    cuatro WebP.",
  " *  - LA CUENTA REGRESIVA tiene los días en grande y, al costado de un",
  " *    filete vertical, horas, minutos y segundos en columna.",
  " *  - AL CONFIRMAR CAEN TRES HOJAS sobre la palabra CONFIRMADO.",
  " */"
));

// ── 2. El papel y la tinta ────────────────────────────────────────────────
rep('const PAPEL = "#F4ECE2";', 'const PAPEL = "#F7F2EA";', "PAPEL");
rep('const PAPEL2 = "#EFE5D9";', 'const PAPEL2 = "#F1EADF";', "PAPEL2");
rep('const TINTA = "#514842";', 'const TINTA = "#45443C";', "TINTA");
rep('const TINTA_SUAVE = "#8A756D";', 'const TINTA_SUAVE = "#857F70";', "TINTA_SUAVE");
rep('const SH = "120,103,86";', 'const SH = "116,110,92";', "SH");
rep('scrimColorRgb="244,236,226"', 'scrimColorRgb="247,242,234"', "scrim");

// ── 3. La botánica ────────────────────────────────────────────────────────
rep(
  'const PIEZAS = "/templates/iconos-linea/";',
  L(
    'const PIEZAS = "/templates/iconos-linea/";',
    "",
    "/**",
    " * El color de la variante y el filtro que lo aplica a las fotos botánicas.",
    " * Los reemplaza scripts/gen-papel-prensado-variants.js: son las dos únicas",
    " * líneas que cambian entre las cinco variantes de esta familia.",
    " */",
    'const ACENTO = "#6E7A5E";',
    'const FILTRO = "grayscale(1) sepia(1) hue-rotate(48deg) saturate(.75) brightness(.96)";',
    "",
    "/** Las cuatro piezas botánicas, compartidas por las cinco variantes. */",
    'const BOTANICA = "/templates/herbario/";'
  ),
  "constantes botánicas"
);

rep(
  "/** Una hoja de papel prensado: grano, sombra, esquinas plegadas y filete. */",
  L(
    "/**",
    " * Una pieza botánica: una foto prensada, duotonizada al color de la",
    " * variante. Va fuera del flujo y sin atajar clics -- varias entran por",
    " * fuera del borde de la hoja a propósito.",
    " */",
    'function Botanica({ pieza, className, ...posicion }: { pieza: "magnolia" | "rama-esquina" | "rama-cabecera" | "hoja"; className?: string } & React.CSSProperties) {',
    "  return (",
    "    // eslint-disable-next-line @next/next/no-img-element",
    "    <img",
    "      src={`${BOTANICA}${pieza}.webp`}",
    '      alt=""',
    '      aria-hidden="true"',
    "      className={className}",
    '      loading="lazy"',
    '      style={{ position: "absolute", filter: FILTRO, pointerEvents: "none", zIndex: 0, ...posicion }}',
    "    />",
    "  );",
    "}",
    "",
    "/** Una hoja de papel prensado: grano, sombra, esquinas plegadas y filete. */"
  ),
  "componente Botanica"
);

// ── 4. La cuenta regresiva de Herbario ────────────────────────────────────
rep(
  L(
    "  return (",
    '    <div id="countdown" className="hb-cuenta">',
    "      {celdas.map((c) => (",
    '        <div key={c.l} className="hb-cuenta-celda">',
    '          <span className="hb-cuenta-num">{c.v}</span>',
    '          <span className="hb-cuenta-etq">{c.l}</span>',
    "        </div>",
    "      ))}",
    "    </div>",
    "  );"
  ),
  L(
    "  // Los días mandan: son el dato que se mira. Horas, minutos y segundos",
    "  // van al costado, en columna, separados por un filete vertical.",
    "  const [dias, ...resto] = celdas;",
    "  return (",
    '    <div id="countdown" className="hb-cuenta">',
    '      <div className="hb-cuenta-dias">',
    '        <span className="hb-cifra">{dias.v}</span>',
    '        <span className="hb-cuenta-etq">{dias.l}</span>',
    "      </div>",
    '      <span className="hb-cuenta-divisor" aria-hidden="true" />',
    '      <div className="hb-cuenta-lado">',
    "        {resto.map((c, i) => (",
    "          <div key={c.l}>",
    '            <div className="hb-cuenta-fila">',
    '              <span className="hb-cuenta-num">{c.v}</span>',
    '              <span className="hb-cuenta-etq">{c.l}</span>',
    "            </div>",
    '            {i < resto.length - 1 && <span className="hb-cuenta-regla" aria-hidden="true" />}',
    "          </div>",
    "        ))}",
    "      </div>",
    "    </div>",
    "  );"
  ),
  "cuenta regresiva de Herbario"
);

rep(
  L(
    "  /* La cuenta regresiva de la colección: cifras prensadas y filetes, nada más. */",
    "  .hb-cuenta { display: grid; grid-template-columns: repeat(4, 1fr); align-items: end; max-width: 400px; margin: 2px auto 4px; }",
    "  .hb-cuenta-celda { display: flex; flex-direction: column; align-items: center; gap: 9px; padding: 2px 2px 0; }",
    "  .hb-cuenta-celda + .hb-cuenta-celda { border-left: 0.5px solid rgba(${SH},.30); }"
  ),
  L(
    "  /* La cuenta regresiva de Herbario: los días en grande, el resto al lado. */",
    "  .hb-cuenta { display: flex; align-items: center; justify-content: center; gap: 22px; flex-wrap: wrap; margin: 4px auto 20px; }",
    "  .hb-cuenta-dias { text-align: center; display: flex; flex-direction: column; gap: 6px; }",
    "  .hb-cuenta-divisor { width: 0.5px; height: 112px; background: rgba(${SH},.45); }",
    "  .hb-cuenta-lado { display: flex; flex-direction: column; gap: 8px; text-align: left; }",
    "  .hb-cuenta-fila { display: flex; align-items: baseline; gap: 9px; }",
    "  .hb-cuenta-regla { display: block; width: 92px; height: 0.5px; background: rgba(${SH},.3); margin: 8px 0; }"
  ),
  "CSS de la cuenta"
);
rep(
  "  .hb-cuenta-num { font-family: ${SERIF}; font-weight: 300; font-size: clamp(32px, 10vw, 46px); line-height: .92; color: ${matiz(PAPEL, -4)}; text-shadow: var(--hb-rel); font-variant-numeric: tabular-nums; }",
  "  .hb-cuenta-num { font-family: ${SERIF}; font-weight: 300; font-size: 30px; line-height: 1; color: ${TINTA}; min-width: 44px; font-variant-numeric: tabular-nums; }",
  "CSS de las cifras chicas"
);

// ── 5. La botánica en las portadas ────────────────────────────────────────
rep(
  L(
    '        <aside className="d-left hide-mobile hb-izquierda">',
    '          <Hoja portada className="hb-hoja-grande">',
    '            <IconoLinea nombre={esXV ? "torta" : "anillos"} ancho={esXV ? "18%" : "22%"} tope={76} />'
  ),
  L(
    '        <aside className="d-left hide-mobile hb-izquierda">',
    '          <Hoja portada className="hb-hoja-grande">',
    '            <Botanica pieza="magnolia" width="45%" left="-6%" top="14%" />',
    '            <Botanica pieza="rama-esquina" width="38%" right="-8%" bottom="-4%" />'
  ),
  "botánica de escritorio"
);
rep(
  L(
    '            <Hoja portada className={isCoverOpen ? "hb-portada--sube" : ""}>',
    "              <Entra>",
    '                <IconoLinea nombre={esXV ? "torta" : "anillos"} ancho={esXV ? "18%" : "22%"} tope={76} />'
  ),
  L(
    '            <Hoja portada className={isCoverOpen ? "hb-portada--sube" : ""}>',
    '              <Botanica pieza="magnolia" width="44%" right="-26%" top="8%" />',
    '              <Botanica pieza="rama-esquina" width="28%" left="-9%" top="60%" />',
    "              <Entra>"
  ),
  "botánica del celular"
);
rep(
  L(
    "              <Entra>",
    '                <IconoLinea nombre="confeti" />'
  ),
  L(
    '              <Botanica pieza="rama-cabecera" width="72%" left="26%" top="-3%" />',
    "              <Entra>"
  ),
  "rama del cierre"
);
rep(
  '          <Hoja className="hb-splash-hoja">',
  L(
    '          <Hoja className="hb-splash-hoja">',
    '            <Botanica pieza="rama-cabecera" width="36%" left="62%" top="-4%" />'
  ),
  "rama del splash"
);

// ── 6. Tres hojas que caen sobre el CONFIRMADO ────────────────────────────
rep(
  L(
    '            <section className="hb-seccion" data-sec="06" id="rsvp-hoja">',
    "              <Hoja>"
  ),
  L(
    '            <section className="hb-seccion" data-sec="06" id="rsvp-hoja">',
    "              <Hoja>",
    '                <Botanica pieza="hoja" className="hb-hoja-cae" width="24px" />',
    '                <Botanica pieza="hoja" className="hb-hoja-cae" width="24px" />',
    '                <Botanica pieza="hoja" className="hb-hoja-cae" width="24px" />'
  ),
  "hojas que caen en el RSVP"
);

rep(
  "  /* Monograma */",
  L(
    "  /* Las tres hojas que caen cuando se confirma: entran desde arriba, con",
    "     120 ms de diferencia entre una y otra, y se quedan. Quietas hasta que",
    "     el RSVP muestra su bloque de confirmado, que es el único [role=status]",
    "     con aria-live: así no caen cuando alguien avisa que no viene. */",
    "  @keyframes hbCae1 { from { transform: translateY(-120px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }",
    "  @keyframes hbCae2 { from { transform: translateY(-150px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }",
    "  @keyframes hbCae3 { from { transform: translateY(-100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }",
    "  .hb-hoja-cae { top: 0; opacity: 0; z-index: 1; }",
    '  .hb-seccion:has([role="status"][aria-live="polite"]) .hb-hoja-cae:nth-of-type(1) { left: 18%; animation: hbCae1 .9s cubic-bezier(.22,.61,.36,1) both; }',
    '  .hb-seccion:has([role="status"][aria-live="polite"]) .hb-hoja-cae:nth-of-type(2) { left: 48%; top: 8px; animation: hbCae2 .9s cubic-bezier(.22,.61,.36,1) .12s both; }',
    '  .hb-seccion:has([role="status"][aria-live="polite"]) .hb-hoja-cae:nth-of-type(3) { left: 74%; top: 2px; animation: hbCae3 .9s cubic-bezier(.22,.61,.36,1) .24s both; }',
    "",
    "  /* Monograma */"
  ),
  "CSS de las hojas que caen"
);

// ── 7. El acento de la variante ───────────────────────────────────────────
rep(
  "  .hb-hito-punto { width: 3px; height: 3px; border-radius: 50%; background: ${TINTA}; flex-shrink: 0; }",
  "  .hb-hito-punto { width: 3px; height: 3px; border-radius: 50%; background: ${ACENTO}; flex-shrink: 0; }",
  "acento en el cronograma"
);

if (faltantes.length) {
  console.error("No encontré estos anclajes en PrensaTemplate.tsx (¿cambió?):\n  - " + faltantes.join("\n  - "));
  process.exit(1);
}

fs.writeFileSync(path.join(DIR, "HerbarioTemplate.tsx"), s);
console.log("HerbarioTemplate.tsx (" + (s.length / 1024).toFixed(0) + " KB) derivado de PrensaTemplate.tsx");
