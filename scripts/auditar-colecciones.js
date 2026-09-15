#!/usr/bin/env node
/**
 * Audita que cada familia de Paper e Iconic esté enchufada en los diez
 * lugares que tiene que estar, y que sus archivos existan.
 *
 * Es el chequeo que faltaba: una familia puede aparecer en el modal y no
 * renderizarse, o renderizarse y no aparecer, y el compilador no dice nada
 * porque cada punto es válido por separado. Esto los mira juntos.
 *
 * Uso:  node scripts/auditar-colecciones.js
 */
const fs = require("node:fs");
const path = require("node:path");

const RAIZ = path.join(__dirname, "..");
const leer = (rel) => fs.readFileSync(path.join(RAIZ, rel), "utf8");

const config = leer("src/components/wizard/wizard-steps-config.ts");
const registry = leer("src/components/wizard/template-preview-registry.tsx");
const modal = leer("src/components/wizard/TemplatePreviewModal.tsx");
const stepDesign = leer("src/components/wizard/StepDesign.tsx");
const livePreview = leer("src/components/wizard/WizardLivePreview.tsx");
const previewPlantilla = leer("src/app/preview-plantilla/page.tsx");
const rutaI = leer("src/app/i/[slug]/page.tsx");
const rutaPreview = leer("src/app/preview/[slug]/page.tsx");
const rutaInvite = leer("src/app/invite/[slug]/[token]/page.tsx");
const dinamicas = leer("src/components/templates/PlantillaDinamica.tsx");
const etiquetas = leer("src/lib/template-labels.ts");

/** Los códigos de familia declarados en cada colección. */
function familiasDe(mapa) {
  const bloque = config.match(new RegExp(`${mapa}: Record<string, Subcoleccion> = \\{([\\s\\S]*?)\\n\\};`));
  if (!bloque) return [];
  return [...bloque[1].matchAll(/^\s+([A-Z0-9]+):\s*"([a-zA-Z]+)"/gm)].map((m) => ({ codigo: m[1], sub: m[2] }));
}

const familias = [
  ...familiasDe("PAPER_TEMPLATE_TIPOS").map((f) => ({ ...f, coleccion: "PAPER" })),
  ...familiasDe("ICONIC_TEMPLATE_TIPOS").map((f) => ({ ...f, coleccion: "ICONIC" })),
];

let problemas = 0;
const aviso = (codigo, que) => { console.error(`  ✗ ${codigo}: ${que}`); problemas++; };

console.log(`Auditando ${familias.length} familias (Paper e Iconic)\n`);

for (const { codigo, coleccion, sub } of familias) {
  const colores = registry.match(new RegExp(`export const ${codigo}_COLORS: ColorOption\\[\\] = \\[([\\s\\S]*?)\\];`));
  const componentes = registry.match(new RegExp(`export const ${codigo}_COMPONENTS: Record<string, PreviewComponent> = \\{([\\s\\S]*?)\\};`));

  if (!registry.includes(`| "${codigo}"`)) aviso(codigo, "falta en el tipo TemplateTipo");
  if (!colores) aviso(codigo, "falta XXX_COLORS en el registro");
  if (!componentes) aviso(codigo, "falta XXX_COMPONENTS en el registro");
  if (!new RegExp(`^  ${codigo}: "`, "m").test(etiquetas)) aviso(codigo, "falta la etiqueta en template-labels");
  if (!new RegExp(`^  ${codigo}_COLORS,$`, "m").test(modal)) aviso(codigo, "el modal no lo importa");
  if (!new RegExp(`^  ${codigo}: "#`, "m").test(modal)) aviso(codigo, "falta su acento en el modal");
  if (!new RegExp(`^  "${codigo}",$`, "m").test(modal)) aviso(codigo, "no está en el orden del modal");
  if (!new RegExp(`^  ${codigo}: ${codigo}_COLORS,$`, "m").test(modal)) aviso(codigo, "falta en COLORS_BY_TIPO");
  if (!new RegExp(`"${codigo}"`).test(modal.match(/const solo\w+ = new Set\(\[[^\]]*\]\);|const quinceYCasamiento = new Set\(\[[^\]]*\]\);/g)?.join("\n") || "")) {
    aviso(codigo, "no está en ningún set de evento del modal (no se vería nunca)");
  }
  if (!new RegExp(`^    ${codigo}: `, "m").test(stepDesign)) aviso(codigo, "falta el nombre en StepDesign");
  if (!new RegExp(`^    ${codigo}: ${codigo}_COLORS,$`, "m").test(stepDesign)) aviso(codigo, "faltan sus colores en StepDesign");
  if (!new RegExp(`^        "${codigo}",$`, "m").test(livePreview)) aviso(codigo, "falta en la preview viva del wizard");
  if (!new RegExp(`^  ${codigo}: ${codigo}_COMPONENTS,$`, "m").test(previewPlantilla)) aviso(codigo, "falta en /preview-plantilla");
  if (!rutaI.includes(`templateTipo === '${codigo}'`)) aviso(codigo, "no se renderiza en /i/[slug]");
  if (!rutaPreview.includes(`templateTipo === '${codigo}'`)) aviso(codigo, "no se renderiza en /preview/[slug]");
  if (!rutaInvite.includes(`templateTipo === '${codigo}'`)) aviso(codigo, "no se renderiza en la ruta del invitado");

  // Los archivos de cada variante existen, se exportan y están en el mapa dinámico.
  if (componentes) {
    const archivos = [...componentes[1].matchAll(/import\("@\/components\/templates\/([A-Za-z0-9]+)"\)/g)].map((m) => m[1]);
    for (const archivo of archivos) {
      const ruta = path.join(RAIZ, "src", "components", "templates", `${archivo}.tsx`);
      if (!fs.existsSync(ruta)) { aviso(codigo, `falta el archivo ${archivo}.tsx`); continue; }
      if (!fs.readFileSync(ruta, "utf8").includes(`export function ${archivo}(`)) {
        aviso(codigo, `${archivo}.tsx no exporta una función con su nombre`);
      }
      if (!dinamicas.includes(`"${archivo}"`)) aviso(codigo, `${archivo} no está en PlantillaDinamica`);
    }
    // Un acento por variante, todos distintos (salvo que la familia lo declare).
    const hexes = [...colores[1].matchAll(/color: "(#[0-9A-Fa-f]{6})"/g)].map((m) => m[1]);
    if (new Set(hexes).size !== hexes.length) {
      console.warn(`  ~ ${codigo}: dos variantes con el mismo color en el selector (revisar si es a propósito)`);
    }
  }

  if (!["papeleriaViva", "papelPrensado", "capasDePapel", "tipograficaEditorial"].includes(sub)) {
    aviso(codigo, `sub-colección desconocida: ${sub}`);
  }
  void coleccion;
}

const porColeccion = familias.reduce((acc, f) => {
  acc[f.coleccion] = (acc[f.coleccion] || 0) + 1;
  return acc;
}, {});
console.log(`\nPaper: ${porColeccion.PAPER || 0} familias · Iconic: ${porColeccion.ICONIC || 0} familias`);
console.log(problemas ? `\n${problemas} problema(s).` : "\nTodo enchufado.");
process.exit(problemas ? 1 : 0);
