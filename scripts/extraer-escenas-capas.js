#!/usr/bin/env node
/**
 * Saca de un mockup de "Capas de papel" (Claude Design) las escenas de papel
 * recortado -- cielo, cerros, sol, figuras, mariposas, pétalos, grano -- tal
 * cual están dibujadas, y las deja en un módulo TypeScript como strings de
 * HTML para que la plantilla las monte con dangerouslySetInnerHTML.
 *
 * Por qué así y no reescritas a JSX: son cientos de paths SVG dibujados a
 * mano, con sus animaciones y sus data-drift/data-depth para el parallax.
 * Retipearlos es la forma más segura de perder fidelidad; copiarlos byte por
 * byte es la forma más segura de conservarla. No tienen ningún dato del
 * invitado ni ningún binding: son decoración pura, así que inyectarlos como
 * HTML es legítimo. Lo que sí tiene datos (kickers, nombres, tarjetas,
 * formularios) lo escribe la plantilla en JSX.
 *
 * Uso:
 *   node scripts/extraer-escenas-capas.js "mockup/Icon/Jardín de papel - Panoramica.dc.html" jdp capas-de-papel
 * Genera src/components/templates/escenas/JdpEscenas.ts
 */
const fs = require("node:fs");
const path = require("node:path");

const [, , archivo, prefijo, carpetaPiezas] = process.argv;
if (!archivo || !prefijo || !carpetaPiezas) {
  console.error("uso: extraer-escenas-capas.js <mockup.dc.html> <prefijo> <carpeta en public/templates>");
  process.exit(1);
}
const html = fs.readFileSync(archivo, "utf8");

const VOID = new Set(["img", "input", "br", "meta", "link", "hr"]);

/** Devuelve el índice del cierre del elemento que abre en `desde`. */
function cerrar(src, desde) {
  const abre = /<([a-zA-Z][\w-]*)/y;
  abre.lastIndex = desde;
  const m = abre.exec(src);
  if (!m) throw new Error("no hay tag en " + desde);
  const tag = m[1].toLowerCase();
  let i = src.indexOf(">", desde) + 1;
  if (VOID.has(tag) || src[i - 2] === "/") return i;
  let prof = 1;
  const re = /<\/?([a-zA-Z][\w-]*)[^>]*?(\/?)>/g;
  re.lastIndex = i;
  let t;
  while ((t = re.exec(src))) {
    const nombre = t[1].toLowerCase();
    if (t[0].startsWith("</")) {
      if (nombre === tag) { prof--; if (prof === 0) return re.lastIndex; }
    } else if (!VOID.has(nombre) && !t[2]) {
      if (nombre === tag) prof++;
    }
  }
  throw new Error("no cierra <" + tag + "> desde " + desde);
}

/** Hijos directos (outerHTML) de un fragmento. */
function hijos(src) {
  const out = [];
  let i = 0;
  while (i < src.length) {
    const a = src.indexOf("<", i);
    if (a < 0) break;
    if (src.startsWith("<!--", a)) { i = src.indexOf("-->", a) + 3; continue; }
    if (src[a + 1] === "/") { i = a + 1; continue; }
    const fin = cerrar(src, a);
    out.push(src.slice(a, fin));
    i = fin;
  }
  return out;
}

/**
 * El bloque que arranca en una marca, o null si esa sección no existe.
 *
 * No todas las familias traen todas las secciones: Trazo de papel no tiene
 * foto principal (es la familia dibujada a mano, sin fotos), y los quince no
 * tienen panel de ceremonia. Que falte una no es un error del extractor: la
 * plantilla dibuja esa sección sin decoración propia si el anfitrión igual
 * carga los datos.
 */
function bloqueDesde(marca) {
  const a = html.indexOf(marca);
  if (a < 0) return null;
  const inicio = html.indexOf("<", a + marca.length);
  return html.slice(inicio, cerrar(html, inicio));
}

/** Contenido interior de un elemento. */
function interior(outer) {
  const a = outer.indexOf(">") + 1;
  const b = outer.lastIndexOf("<");
  return outer.slice(a, b);
}

/** Decoración = sin bindings ni texto propio: sólo svg/img y sus envoltorios. */
function esDecoracion(el) {
  if (el.includes("{{")) return false;
  const sinTags = el.replace(/<[^>]*>/g, "").trim();
  if (sinTags && !/^[\s]*$/.test(sinTags)) return false;
  return /^<(svg|img|div)\b/.test(el);
}

/**
 * Reapunta las piezas del mockup a las WebP del repo.
 *
 * Hay que mirar `src` Y `href`: las que están sueltas en el HTML son <img
 * src>, pero las que van DENTRO de un SVG son <image href> -- y la pareja de
 * la portada es de esas. Reescribiendo sólo `src` quedaba apuntando al PNG
 * del mockup, que en el sitio no existe: la portada de bienvenida de las
 * familias de casamiento cargaba sin la pareja y nadie veía un error.
 */
function piezas(s) {
  return s.replace(
    /\b(src|href|xlink:href)="\.\/img\/(?:trazo\/)?([^"]+)\.png"/g,
    (_, attr, n) => `${attr}="/templates/${carpetaPiezas}/${n}.webp"`
  );
}

const secciones = [
  ["defs", "<svg aria-hidden=\"true\" style=\"position: absolute; width: 0; height: 0;\">", "entero"],
  ["saveTheDate", "<!-- 01 SAVE THE DATE -->", "decoracion"],
  ["foto", "<!-- foto principal", "decoracion"],
  ["countdown", "<!-- 02 COUNTDOWN -->", "decoracion"],
  ["frase", "<!-- 03 FRASE -->", "decoracion"],
  ["cuando", "<!-- 04 CUÁNDO Y DÓNDE", "paneles"],
  ["checkin", "<!-- 05 CHECK-IN -->", "decoracion"],
  ["album", "<!-- 06 ÁLBUM", "paneles"],
  ["musica", "<!-- 07 MÚSICA -->", "decoracion"],
  ["regalos", "<!-- 08 REGALOS -->", "decoracion"],
  ["quiz", "<!-- 09 QUIZ -->", "decoracion"],
  ["pase", "<!-- 10 TU PASE -->", "decoracion"],
  ["cover", "<div ref=\"{{ setCoverScene }}\"", "interiorDecoracion"],
];

const salida = {};
const ausentes = [];
for (const [nombre, marca, modo] of secciones) {
  let outer;
  if (modo === "entero" || modo === "interiorDecoracion") {
    const a = html.indexOf(marca);
    // Los defs y la portada sí son obligatorios: sin ellos no hay familia.
    if (a < 0) throw new Error("no encontré " + marca);
    outer = html.slice(a, cerrar(html, a));
  } else {
    outer = bloqueDesde(marca);
  }
  if (outer === null) {
    salida[nombre] = modo === "paneles" ? [] : "";
    ausentes.push(nombre);
    continue;
  }
  if (modo === "entero") { salida[nombre] = piezas(outer); continue; }
  if (modo === "paneles") {
    // [data-pan] > [data-sticky] > [data-strip] > paneles: la decoración de cada uno.
    const sticky = hijos(interior(outer)).find((h) => h.includes("data-sticky"));
    const strip = hijos(interior(sticky)).find((h) => h.includes("data-strip"));
    salida[nombre] = hijos(interior(strip)).map((panel) => piezas(hijos(interior(panel)).filter(esDecoracion).join("\n")));
    continue;
  }
  const dentro = modo === "interiorDecoracion" ? interior(outer) : interior(outer);
  salida[nombre] = piezas(hijos(dentro).filter(esDecoracion).join("\n"));
}

const P = prefijo.charAt(0).toUpperCase() + prefijo.slice(1);
let ts = `// GENERADO por scripts/extraer-escenas-capas.js a partir de\n// ${path.basename(archivo)} -- no editar a mano: volver a correr el script.\n//\n// Escenas de papel recortado de la familia, byte por byte como en el mockup.\n// Son decoración pura (svg + img sin datos), montadas con\n// dangerouslySetInnerHTML; el motor de motion las encuentra por sus\n// data-drift / data-depth / data-cl / data-layer.\n\n`;
for (const [k, v] of Object.entries(salida)) {
  if (Array.isArray(v)) {
    ts += `export const ${k.toUpperCase()}_${P.toUpperCase()}: string[] = ${JSON.stringify(v, null, 2)};\n\n`;
  } else {
    ts += `export const ${k.toUpperCase()}_${P.toUpperCase()} = ${JSON.stringify(v)};\n\n`;
  }
}
const dir = path.join(__dirname, "..", "src", "components", "templates", "escenas");
fs.mkdirSync(dir, { recursive: true });
const destino = path.join(dir, `${P}Escenas.ts`);
fs.writeFileSync(destino, ts);
const resumen = Object.entries(salida)
  .filter(([k]) => !ausentes.includes(k))
  .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.map((x) => x.length).join("+") : v.length} bytes`)
  .join("\n  ");
console.log(`${path.relative(process.cwd(), destino)} (${(ts.length / 1024).toFixed(0)} KB)\n  ${resumen}`);
if (ausentes.length) console.log(`  (este mockup no dibuja: ${ausentes.join(", ")})`);
