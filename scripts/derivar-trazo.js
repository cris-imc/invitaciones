#!/usr/bin/env node
/**
 * Deriva TrazoTemplate.tsx de PrensaTemplate.tsx.
 *
 * Trazo es Papel Prensado dibujado a mano: la misma hoja con grano, relieve y
 * pliegues, pero con garabatos, destellos y corazones de trazo suelto en los
 * márgenes. Dos cosas propias:
 *
 *  1. LO QUE CAMBIA POR VARIANTE ES LA TINTA, NO EL PAPEL. En el resto de la
 *     sub-colección las cinco variantes son cinco papeles; acá el papel es
 *     siempre el mismo cuaderno (#F6F1E9) y lo que cambia es el color del
 *     trazo: grafito, tinta, terracota, verde, ciruela. Los garabatos se
 *     pintan con esa tinta porque son máscaras CSS, así que la familia pasa
 *     de lápiz negro a lápiz de color sin regenerar una sola pieza.
 *  2. LOS ORNAMENTOS SON DIBUJOS, NO ÍCONOS. Donde Prensa pone el ícono de
 *     anillos, Trazo pone un corazón chico y deja garabatos largos saliéndose
 *     por los bordes de la hoja; la cifra grande del countdown va adentro de
 *     un marco circular dibujado.
 *
 * GENERADO: no editar TrazoTemplate.tsx a mano.
 *
 * Uso:  node scripts/derivar-trazo.js
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

// ── 1. Identidad ──────────────────────────────────────────────────────────
s = s.replace(/\bpr-/g, "tz-")
  .replace(/prCormorant/g, "tzCormorant")
  .replace(/prJost/g, "tzJost")
  .replace(/prSplashSale/g, "tzSplashSale")
  .replace(/prPortadaSube/g, "tzPortadaSube")
  .replace(/prPrensado/g, "tzPrensado")
  .replace(/CSS_PRENSA/g, "CSS_TRAZO")
  .replace(/PrensaTemplate/g, "TrazoTemplate");

const cabeceraVieja = s.slice(s.indexOf("/**"), s.indexOf(" */") + 3);
s = s.replace(cabeceraVieja, [
  "/**",
  " * TrazoTemplate.tsx — Colección Paper · Papel Prensado · Familia 05 \"Trazo\"",
  " * Variante: Grafito (base). Las otras cuatro (Tinta, Terracota, Verde,",
  " * Ciruela) se generan con scripts/gen-papel-prensado-variants.js.",
  " *",
  " * GENERADO por scripts/derivar-trazo.js a partir de PrensaTemplate.tsx —",
  " * no editar a mano.",
  " *",
  " * Portado desde mockup/Paper/Trazo - Panoramica.dc.html. Misma imprenta que",
  " * Prensa, dibujada a mano:",
  " *",
  " *  - LO QUE CAMBIA POR VARIANTE ES LA TINTA, NO EL PAPEL. El papel es",
  " *    siempre el mismo cuaderno (#F6F1E9); lo que cambia es el color del",
  " *    trazo. Como los garabatos son máscaras CSS pintadas con la tinta, la",
  " *    familia pasa de lápiz negro a lápiz de color sin regenerar una pieza.",
  " *  - LOS ORNAMENTOS SON DIBUJOS: garabatos largos que se salen por los",
  " *    bordes de la hoja, destellos, un corazón donde Prensa pone los anillos",
  " *    y un marco circular alrededor de la cifra del countdown.",
  " */",
].join("\n"));

// ── 2. El cuaderno y la tinta ─────────────────────────────────────────────
rep('const PAPEL = "#F4ECE2";', 'const PAPEL = "#F6F1E9";', "PAPEL");
rep('const PAPEL2 = "#EFE5D9";', 'const PAPEL2 = "#EFE8DC";', "PAPEL2");
rep('const TINTA = "#514842";', 'const TINTA = "#3C3A35";', "TINTA");
rep('const TINTA_SUAVE = "#8A756D";', 'const TINTA_SUAVE = "#7E7A70";', "TINTA_SUAVE");
rep('const SH = "120,103,86";', 'const SH = "112,106,94";', "SH");
rep('scrimColorRgb="244,236,226"', 'scrimColorRgb="246,241,233"', "scrim");

// ── 3. Las piezas dibujadas ───────────────────────────────────────────────
rep(
  'const PIEZAS = "/templates/iconos-linea/";',
  [
    'const PIEZAS = "/templates/iconos-linea/";',
    '/** Los dibujos sueltos de esta familia, con su proporción real. */',
    'const DIBUJOS = "/templates/trazo/";',
    'const TRAZOS = {',
    '  garabatoLargo: { f: "garabato-largo", ar: "176/1168" },',
    '  garabatoCorto: { f: "garabato-corto", ar: "584/161" },',
    '  corazonGrande: { f: "corazon-grande", ar: "196/238" },',
    '  corazonChico: { f: "corazon-chico", ar: "134/148" },',
    '  destello1: { f: "destello-1", ar: "126/185" },',
    '  destello3: { f: "destello-3", ar: "72/96" },',
    '  marcoCircular: { f: "marco-circular", ar: "632/674" },',
    '} as const;',
    'type NombreDeTrazo = keyof typeof TRAZOS;',
  ].join("\n"),
  "piezas dibujadas"
);

rep(
  "/** Una hoja de papel prensado: grano, sombra, esquinas plegadas y filete. */",
  [
    "/**",
    " * Un dibujo suelto, como máscara con la tinta de la variante.",
    " *",
    " * Van fuera del flujo y con pointerEvents none: se salen por los bordes de",
    " * la hoja a propósito (el garabato largo entra un 17 % por fuera), así que",
    " * si atajaran clics romperían los botones que quedan debajo.",
    " */",
    'function Dibujo({ nombre, ancho, ...posicion }: { nombre: NombreDeTrazo; ancho: string } & React.CSSProperties) {',
    "  const t = TRAZOS[nombre];",
    "  const u = `url(${DIBUJOS}${t.f}.webp) no-repeat center / contain`;",
    "  return (",
    "    <div",
    '      aria-hidden="true"',
    "      style={{",
    '        position: "absolute", width: ancho, aspectRatio: t.ar, background: TINTA,',
    "        WebkitMask: u, mask: u, pointerEvents: \"none\", zIndex: 0, ...posicion,",
    "      }}",
    "    />",
    "  );",
    "}",
    "",
    "/** Una hoja de papel prensado: grano, sombra, esquinas plegadas y filete. */",
  ].join("\n"),
  "componente Dibujo"
);

// ── 4. Los ornamentos de la portada ───────────────────────────────────────
// Escritorio: garabato largo espejado a la derecha y un corazón chico.
rep(
  [
    '        <aside className="d-left hide-mobile tz-izquierda">',
    '          <Hoja portada className="tz-hoja-grande">',
    '            <IconoLinea nombre={esXV ? "torta" : "anillos"} ancho={esXV ? "18%" : "22%"} tope={76} />',
  ].join("\n"),
  [
    '        <aside className="d-left hide-mobile tz-izquierda">',
    '          <Hoja portada className="tz-hoja-grande">',
    '            <Dibujo nombre="garabatoLargo" ancho="30%" right="-17%" top="-4%" transform="scaleX(-1)" />',
    '            <Dibujo nombre="corazonChico" ancho="8%" position="relative" margin="0 auto 12px" />',
  ].join("\n"),
  "ornamentos de escritorio"
);

// Celular: dos garabatos, dos destellos y el corazón sobre el kicker.
rep(
  [
    '            <Hoja portada className={isCoverOpen ? "tz-portada--sube" : ""}>',
    "              <Entra>",
    '                <IconoLinea nombre={esXV ? "torta" : "anillos"} ancho={esXV ? "18%" : "22%"} tope={76} />',
  ].join("\n"),
  [
    '            <Hoja portada className={isCoverOpen ? "tz-portada--sube" : ""}>',
    '              <Dibujo nombre="garabatoLargo" ancho="30%" left="-17%" top="-6%" />',
    '              <Dibujo nombre="destello1" ancho="7%" left="9%" top="9%" />',
    '              <Dibujo nombre="destello3" ancho="5%" right="10%" top="16%" />',
    '              <Dibujo nombre="garabatoCorto" ancho="46%" right="-16%" bottom="3%" />',
    "              <Entra>",
    '                <Dibujo nombre="corazonChico" ancho="8%" position="relative" margin="0 auto 12px" />',
  ].join("\n"),
  "ornamentos del celular"
);

// El cierre: corazón grande y un garabato corto que entra por la izquierda.
rep(
  [
    "              <Entra>",
    '                <IconoLinea nombre="confeti" />',
  ].join("\n"),
  [
    '              <Dibujo nombre="garabatoCorto" ancho="40%" left="-15%" bottom="4%" />',
    "              <Entra>",
    '                <Dibujo nombre="corazonGrande" ancho="12%" position="relative" margin="0 auto 12px" />',
  ].join("\n"),
  "ornamentos del cierre"
);

// ── 5. La cifra del countdown, dentro del marco dibujado ──────────────────
rep(
  [
    "                  <Entra retraso={120}>",
    '                    <p className="tz-kicker">{tx("invitacion.rsvp.quedan")}</p>',
    '                    <p className="tz-cifra">{diasParaConfirmar}</p>',
  ].join("\n"),
  [
    "                  <Entra retraso={120}>",
    '                    <p className="tz-kicker">{tx("invitacion.rsvp.quedan")}</p>',
    '                    <div className="tz-marco">',
    '                      <Dibujo nombre="marcoCircular" ancho="58%" left="50%" top="50%" transform="translate(-50%,-50%)" />',
    '                      <p className="tz-cifra">{diasParaConfirmar}</p>',
    "                    </div>",
  ].join("\n"),
  "marco de la cifra"
);
rep(
  '                    <p className="tz-kicker">{tx("invitacion.rsvp.diasParaConfirmar")}</p>',
  '                    <p className="tz-kicker">{tx("invitacion.rsvp.diasParaConfirmar")}</p>',
  "etiqueta de la cifra"
);

// ── 6. Vestuario propio ───────────────────────────────────────────────────
rep(
  "  /* Monograma */",
  [
    "  /* El marco dibujado alrededor de la cifra: la cifra va encima (z-index 1)",
    "     porque el marco es un dibujo suelto con z-index 0. */",
    "  .tz-marco { position: relative; width: 200px; height: 150px; margin: 0 auto; display: flex; align-items: center; justify-content: center; }",
    "  .tz-marco .tz-cifra { position: relative; z-index: 1; margin: 0; }",
    "",
    "  /* Monograma */",
  ].join("\n"),
  "CSS del marco"
);
// La hoja recorta: los garabatos tienen que poder salirse por el borde.
rep(
  "  .tz-hoja { position: relative; padding: 32px 26px 28px; text-align: center;",
  "  .tz-hoja { position: relative; padding: 32px 26px 28px; text-align: center; overflow: visible;",
  "la hoja no recorta los dibujos"
);

if (faltantes.length) {
  console.error("No encontré estos anclajes en PrensaTemplate.tsx (¿cambió?):\n  - " + faltantes.join("\n  - "));
  process.exit(1);
}

fs.writeFileSync(path.join(DIR, "TrazoTemplate.tsx"), s);
console.log("TrazoTemplate.tsx (" + (s.length / 1024).toFixed(0) + " KB) derivado de PrensaTemplate.tsx");
