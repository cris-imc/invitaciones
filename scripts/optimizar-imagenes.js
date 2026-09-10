// Convierte a WebP los assets estáticos pesados (fondos de plantilla y fotos
// de muestra). Son fotos guardadas como PNG de ~2,5 MB que se servían enteras
// a cada visitante, incluso en celular.
//
// No se reescalan: se mantiene el tamaño original en píxeles para que no haya
// ninguna diferencia visible, sólo se cambia el códec.
//
// Correr con: node scripts/optimizar-imagenes.js
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const OBJETIVOS = [
  { dir: "public/fondos", ext: [".png"], calidad: 82 },
  { dir: "public/mockup-preview", ext: [".jpg", ".jpeg"], calidad: 80 },
];

function* archivos(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* archivos(p);
    else yield p;
  }
}

(async () => {
  let antes = 0;
  let despues = 0;
  let n = 0;

  for (const { dir, ext, calidad } of OBJETIVOS) {
    if (!fs.existsSync(dir)) continue;
    for (const src of archivos(dir)) {
      if (!ext.includes(path.extname(src).toLowerCase())) continue;
      const dest = src.replace(/\.[^.]+$/, ".webp");

      // `effort: 6` es el máximo razonable: comprime bastante mejor que el
      // default y sólo cuesta tiempo en esta conversión, que se hace una vez.
      await sharp(src).webp({ quality: calidad, effort: 6 }).toFile(dest);

      const a = fs.statSync(src).size;
      const d = fs.statSync(dest).size;

      // Si el WebP saliera más grande (pasa con gráficos planos muy simples),
      // no vale la pena: se descarta y queda el original.
      if (d >= a) {
        fs.unlinkSync(dest);
        continue;
      }

      antes += a;
      despues += d;
      n++;
      fs.unlinkSync(src);
    }
  }

  const mb = (b) => (b / 1048576).toFixed(1) + " MB";
  console.log(`${n} imágenes: ${mb(antes)} -> ${mb(despues)} (-${(100 - (despues / antes) * 100).toFixed(0)}%)`);
})();
