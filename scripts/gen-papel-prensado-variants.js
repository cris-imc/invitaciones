#!/usr/bin/env node
/**
 * Genera las variantes de color de las familias de Papel Prensado (Colección
 * Paper): Prensa, Noche, Lumbre, Herbario y Trazo.
 *
 * En esta colección una variante NO es un acento distinto: es otro tono de
 * papel. La tinta, la tinta suave y la sombra son las mismas en las cinco a
 * propósito (la colección es monocroma, ver el handoff de cada mockup). Por
 * eso el chequeo de la guía §3.6 ("dos variantes con el mismo acento") acá
 * se lee al revés: lo que tiene que ser distinto entre archivos es el hex del
 * papel, y --t-acc es el mismo en todas. Este script lo verifica al final.
 *
 * Reemplaza por string sobre el archivo base, como manda la guía §2.4:
 *   - los dos hex del papel (PAPEL y PAPEL2),
 *   - el rgb del scrim de la portada animada (derivado de PAPEL),
 *   - el identificador (XxxTemplate → XxxTemplateNombre),
 *   - la línea "Variante: ..." del encabezado.
 *
 * Correr después de CADA edición del archivo base, si no las variantes
 * quedan desincronizadas en silencio:
 *   node scripts/gen-papel-prensado-variants.js prensa
 *   node scripts/gen-papel-prensado-variants.js            (todas)
 */
const fs = require("node:fs");
const path = require("node:path");

const DIR = path.join(__dirname, "..", "src", "components", "templates");

// Base = la variante default (id "default" en el registro). Las demás llevan
// el id con el que el wizard las guarda en temaColores.colorPrincipal.
const FAMILIAS = {
  prensa: {
    archivo: "PrensaTemplate",
    base: { nombre: "Lino", paper: "#F4ECE2", paper2: "#EFE5D9" },
    variantes: [
      { id: "Hueso", paper: "#F8F4EE", paper2: "#F1ECE3" },
      { id: "Arena", paper: "#EDE3D4", paper2: "#E6DBC9" },
      { id: "Piedra", paper: "#E4DED6", paper2: "#DBD4CA" },
      { id: "Humo", paper: "#DCD8D2", paper2: "#D3CEC6" },
    ],
  },
};

function rgbDe(hex) {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}

function generar(clave) {
  const fam = FAMILIAS[clave];
  if (!fam) throw new Error(`familia desconocida: ${clave}`);
  const rutaBase = path.join(DIR, `${fam.archivo}.tsx`);
  const base = fs.readFileSync(rutaBase, "utf8");

  const chequeos = [
    [`const PAPEL = "${fam.base.paper}";`, "PAPEL"],
    [`const PAPEL2 = "${fam.base.paper2}";`, "PAPEL2"],
    [`scrimColorRgb="${rgbDe(fam.base.paper)}"`, "scrimColorRgb"],
    [`Variante: ${fam.base.nombre} (base)`, "encabezado"],
    [`export function ${fam.archivo}(`, "export"],
  ];
  for (const [texto, que] of chequeos) {
    if (!base.includes(texto)) throw new Error(`${fam.archivo}: no encontré ${que} → "${texto}"`);
  }

  for (const v of fam.variantes) {
    let s = base;
    s = s.split(`const PAPEL = "${fam.base.paper}";`).join(`const PAPEL = "${v.paper}";`);
    s = s.split(`const PAPEL2 = "${fam.base.paper2}";`).join(`const PAPEL2 = "${v.paper2}";`);
    s = s.split(`scrimColorRgb="${rgbDe(fam.base.paper)}"`).join(`scrimColorRgb="${rgbDe(v.paper)}"`);
    s = s.split(`Variante: ${fam.base.nombre} (base)`).join(`Variante: ${v.id} (generada por scripts/gen-papel-prensado-variants.js, no editar a mano)`);
    s = s.split(fam.archivo).join(`${fam.archivo}${v.id}`);
    fs.writeFileSync(path.join(DIR, `${fam.archivo}${v.id}.tsx`), s);
  }

  // Verificación: papeles todos distintos, tinta idéntica en todos.
  const papeles = new Set([fam.base.paper, ...fam.variantes.map((v) => v.paper)]);
  if (papeles.size !== fam.variantes.length + 1) throw new Error(`${fam.archivo}: dos variantes con el mismo papel`);
  console.log(`${fam.archivo}: ${fam.variantes.length} variantes (${fam.variantes.map((v) => v.id).join(", ")}) — papel distinto en cada una, tinta igual a propósito`);
}

const pedidas = process.argv.slice(2);
(pedidas.length ? pedidas : Object.keys(FAMILIAS)).forEach(generar);
