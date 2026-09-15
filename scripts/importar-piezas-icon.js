#!/usr/bin/env node
/**
 * Trae las piezas de la colección Icon desde los mockups a public/templates/,
 * convertidas a WebP con transparencia y reducidas.
 *
 * Por qué existe: los mockups de Claude Design traen los PNG tal como salieron
 * del generador (1254×1254, ~1,3 MB cada uno). Son 34 MB en total y una sola
 * familia usa siete: servir eso a un teléfono en una invitación es inaceptable.
 * En WebP a 900 px cada pieza pesa ~30-80 KB y no se nota la diferencia a los
 * tamaños en que se dibujan (nunca más de 60 % del ancho de un celular).
 *
 * Idempotente: se puede correr las veces que haga falta.
 *   node scripts/importar-piezas-icon.js
 */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const raiz = path.join(__dirname, "..");
const ANCHO_MAX = 900;
const CALIDAD = 82;

// Origen → destino. Las piezas de `img/` las comparten las cuatro familias
// con fotos de Capas de papel (bola, luna, nota, salón, capilla, castillo,
// parejas y quinceañeras), así que van a una sola carpeta y no repetidas por
// familia. Trazo de papel y Retrowave tienen las suyas.
const LOTES = [
  { desde: "mockup/Icon/img", hasta: "public/templates/capas-de-papel" },
  { desde: "mockup/Icon/img/trazo", hasta: "public/templates/trazo-de-papel" },
  { desde: "mockup/Icon/assets", hasta: "public/templates/retrowave" },
];

async function convertir(origen, destino) {
  const meta = await sharp(origen).metadata();
  const ancho = Math.min(meta.width || ANCHO_MAX, ANCHO_MAX);
  await sharp(origen)
    .resize({ width: ancho, withoutEnlargement: true })
    .webp({ quality: CALIDAD, alphaQuality: 90, effort: 5 })
    .toFile(destino);
  return fs.statSync(destino).size;
}

(async () => {
  let total = 0;
  for (const lote of LOTES) {
    const dir = path.join(raiz, lote.desde);
    const out = path.join(raiz, lote.hasta);
    fs.mkdirSync(out, { recursive: true });
    const pngs = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith(".png"));
    let bytes = 0;
    for (const f of pngs) {
      const nombre = f.replace(/\.png$/i, "").replace(/^rw-/, "");
      bytes += await convertir(path.join(dir, f), path.join(out, `${nombre}.webp`));
    }
    total += bytes;
    console.log(`${lote.hasta}: ${pngs.length} piezas, ${(bytes / 1024).toFixed(0)} KB`);
  }
  console.log(`total: ${(total / 1024).toFixed(0)} KB`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
