#!/usr/bin/env node
/**
 * Enchufa una familia nueva de Paper o Iconic en los diez lugares del wizard
 * y de las rutas que la tienen que conocer.
 *
 * Instalar una familia son dos cosas: escribir la plantilla (eso es diseño, y
 * se hace a mano por familia) y darla de alta en el sistema (eso es siempre lo
 * mismo, y se hacía a mano diez veces por familia). Este script hace la
 * segunda parte, que es donde se olvidaba un punto y la familia aparecía en el
 * modal pero no se renderizaba, o al revés.
 *
 * Es idempotente: si la familia ya está dada de alta en un archivo, ese
 * archivo no se toca. Se puede volver a correr sin miedo.
 *
 * Uso:
 *   node scripts/cablear-familia.js scripts/familias/lumbre.json
 *   node scripts/generar-plantillas-dinamicas.js     (después, siempre)
 *
 * El JSON describe la familia; ver scripts/familias/lumbre.json.
 */
const fs = require("node:fs");
const path = require("node:path");

const RAIZ = path.join(__dirname, "..");
const fam = JSON.parse(fs.readFileSync(path.resolve(process.argv[2]), "utf8"));
const hechos = [];
const saltados = [];
const errores = [];

const CODIGO = fam.codigo;
const otras = fam.variantes.filter((v) => v.id !== "default");
const archivoDe = (v) => (v.id === "default" ? fam.archivo : fam.archivo + v.id);
const componenteDe = (v) => (v.id === "default" ? fam.componente : fam.componente + v.id);

// Los archivos del repo tienen finales de línea mezclados (CRLF y LF, a veces
// en el mismo archivo). Buscar con texto plano fallaba en silencio en los que
// son CRLF, así que todo anclaje se busca como expresión que acepta los dos.
function comoRegex(texto) {
  const escapado = texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(escapado.replace(/\n/g, "\\r?\\n"));
}

function editar(rel, cambios) {
  const abs = path.join(RAIZ, rel);
  let s = fs.readFileSync(abs, "utf8");
  const original = s;
  for (const { yaEsta, ancla, texto, que, antes } of cambios) {
    if (comoRegex(yaEsta).test(s)) { saltados.push(`${rel}: ${que}`); continue; }
    const m = s.match(comoRegex(ancla));
    if (!m) { errores.push(`${rel}: no encontré el anclaje de ${que}`); continue; }
    // El texto nuevo copia el final de línea del anclaje, para no mezclar.
    const nuevo = m[0].includes("\r\n") ? texto.replace(/\r?\n/g, "\r\n") : texto;
    s = s.replace(m[0], antes ? nuevo + m[0] : m[0] + nuevo);
    hechos.push(`${rel}: ${que}`);
  }
  if (s !== original) fs.writeFileSync(abs, s);
}

// ── 1. La familia pertenece a una colección y a una sub-colección ─────────
const mapa = fam.coleccion === "PAPER" ? "PAPER_TEMPLATE_TIPOS" : "ICONIC_TEMPLATE_TIPOS";
editar("src/components/wizard/wizard-steps-config.ts", [{
  yaEsta: `    ${CODIGO}: "`,
  ancla: `export const ${mapa}: Record<string, Subcoleccion> = {\n`,
  texto: `    ${CODIGO}: "${fam.subcoleccion}",\n`,
  que: "colección y sub-colección",
}]);

// ── 2. Registro de previews: tipo, colores y componentes ─────────────────
{
  const abs = path.join(RAIZ, "src/components/wizard/template-preview-registry.tsx");
  let s = fs.readFileSync(abs, "utf8");

  if (s.includes(`| "${CODIGO}"`)) {
    saltados.push("template-preview-registry.tsx: TemplateTipo");
  } else {
    s = s.replace(/(export type TemplateTipo = [^;]+);/, `$1 | "${CODIGO}";`);
    hechos.push("template-preview-registry.tsx: TemplateTipo");
  }

  if (s.includes(`export const ${CODIGO}_COLORS`)) {
    saltados.push("template-preview-registry.tsx: colores y componentes");
  } else {
    const bloque = [
      "",
      `export const ${CODIGO}_COLORS: ColorOption[] = [`,
      ...fam.variantes.map((v) => `  { id: "${v.id}", name: "${v.nombre}", color: "${v.color}" },`),
      "];",
      "",
      `export const ${CODIGO}_COMPONENTS: Record<string, PreviewComponent> = {`,
      ...fam.variantes.map((v) =>
        `  ${v.id}: dynamic(() => import("@/components/templates/${archivoDe(v)}").then((m) => m.${componenteDe(v)}), { ssr: false, loading: PreviewLoading }) as PreviewComponent,`),
      "};",
    ].join("\n");
    s = s.trimEnd() + "\n" + bloque + "\n";
    hechos.push("template-preview-registry.tsx: colores y componentes");
  }
  fs.writeFileSync(abs, s);
}

// ── 3. El nombre que ve el anfitrión ─────────────────────────────────────
editar("src/lib/template-labels.ts", [{
  yaEsta: `  ${CODIGO}: "`,
  ancla: `export const TEMPLATE_LABELS: Record<string, string> = {\n`,
  texto: `  ${CODIGO}: "${fam.etiqueta}",\n`,
  que: "etiqueta",
}]);

// ── 4. El modal de plantillas ────────────────────────────────────────────
{
  const abs = path.join(RAIZ, "src/components/wizard/TemplatePreviewModal.tsx");
  let s = fs.readFileSync(abs, "utf8");
  const original = s;

  // La guarda mira la LÍNEA del import, no el nombre suelto: si mirara el
  // nombre, una familia que ya figura en COLORS_BY_TIPO de una corrida
  // anterior se saltearía el import y el archivo no compilaría.
  if (!new RegExp(`^  ${CODIGO}_COLORS,$`, "m").test(s)) {
    // Se importa y se reexporta: StepDesign toma los colores de acá.
    s = s.replace(/^  PRENSA_COLORS,$/gm, `  PRENSA_COLORS,\n  ${CODIGO}_COLORS,`);
    s = s.replace("  PRENSA_COMPONENTS,", `  PRENSA_COMPONENTS,\n  ${CODIGO}_COMPONENTS,`);
    hechos.push("TemplatePreviewModal.tsx: import y reexport");
  } else saltados.push("TemplatePreviewModal.tsx: import y reexport");

  if (!new RegExp(`^  ${CODIGO}: "#`, "m").test(s)) {
    s = s.replace(/^(  PRENSA: "#514842",)$/m, `$1\n  ${CODIGO}: "${fam.acento}",`);
    hechos.push("TemplatePreviewModal.tsx: acento");
  } else saltados.push("TemplatePreviewModal.tsx: acento");

  if (!new RegExp(`^  "${CODIGO}",$`, "m").test(s)) {
    s = s.replace(new RegExp(`^(  "${fam.despuesDe}",)$`, "m"), `$1\n  "${CODIGO}",`);
    hechos.push("TemplatePreviewModal.tsx: orden");
  } else saltados.push("TemplatePreviewModal.tsx: orden");

  for (const set of fam.eventos) {
    const re = new RegExp(`(const ${set} = new Set\\(\\[[^\\]]*)`);
    if (!re.test(s)) { errores.push(`TemplatePreviewModal.tsx: no encontré el set ${set}`); continue; }
    if (new RegExp(`const ${set} = new Set\\(\\[[^\\]]*"${CODIGO}"`).test(s)) { saltados.push(`TemplatePreviewModal.tsx: set ${set}`); continue; }
    s = s.replace(re, `$1, "${CODIGO}"`);
    hechos.push(`TemplatePreviewModal.tsx: set ${set}`);
  }

  if (!new RegExp(`^  ${CODIGO}: ${CODIGO}_COLORS,`, "m").test(s)) {
    s = s.replace(/^(  PRENSA: PRENSA_COLORS,)$/m, `$1\n  ${CODIGO}: ${CODIGO}_COLORS,`);
    hechos.push("TemplatePreviewModal.tsx: colores por tipo");
  } else saltados.push("TemplatePreviewModal.tsx: colores por tipo");

  if (s !== original) fs.writeFileSync(abs, s);
}

// ── 5. El paso de diseño ─────────────────────────────────────────────────
editar("src/components/wizard/StepDesign.tsx", [
  { yaEsta: `    ${CODIGO}_COLORS,`, ancla: "    PRENSA_COLORS,\n", texto: `    ${CODIGO}_COLORS,\n`, que: "import de colores" },
  { yaEsta: `    ${CODIGO}: "`, ancla: '    PRENSA: "Prensa",\n', texto: `    ${CODIGO}: "${fam.etiqueta}",\n`, que: "nombre" },
  { yaEsta: `    ${CODIGO}: ${CODIGO}_COLORS,`, ancla: "    PRENSA: PRENSA_COLORS,\n", texto: `    ${CODIGO}: ${CODIGO}_COLORS,\n`, que: "colores" },
]);

// ── 6. La preview viva del wizard ────────────────────────────────────────
editar("src/components/wizard/WizardLivePreview.tsx", [{
  yaEsta: `        "${CODIGO}",`,
  ancla: '        "PRENSA",\n',
  texto: `        "${CODIGO}",\n`,
  que: "set de plantillas",
}]);

// ── 7. La pantalla de preview suelta ─────────────────────────────────────
editar("src/app/preview-plantilla/page.tsx", [
  { yaEsta: `  ${CODIGO}_COMPONENTS,\n`, ancla: "  PRENSA_COMPONENTS,\n", texto: `  ${CODIGO}_COMPONENTS,\n`, que: "import" },
  { yaEsta: `  ${CODIGO}: ${CODIGO}_COMPONENTS,`, ancla: "  PRENSA: PRENSA_COMPONENTS,\n", texto: `  ${CODIGO}: ${CODIGO}_COMPONENTS,\n`, que: "mapa" },
]);

// ── 8 y 9. Las tres pantallas que renderizan una invitación ──────────────
function ramaDinamica(sangria, propiedad) {
  return [
    `${sangria}} else if (${propiedad} === '${CODIGO}') {`,
    `${sangria}    switch (color) {`,
    ...otras.map((v) => `${sangria}        case '${v.id}': return <PlantillaDinamica nombre="${archivoDe(v)}" invitation={invRecord} guest={null} isPersonalized={false} />;`),
    `${sangria}        default: return <PlantillaDinamica nombre="${fam.archivo}" invitation={invRecord} guest={null} isPersonalized={false} />;`,
    `${sangria}    }`,
    "",
  ].join("\n");
}

editar("src/app/i/[slug]/page.tsx", [{
  yaEsta: `templateTipo === '${CODIGO}'`,
  ancla: "        } else if (invitation!.templateTipo === 'PRENSA') {",
  texto: ramaDinamica("        ", "invitation!.templateTipo"),
  antes: true,
  que: "render i/[slug]",
}]);

editar("src/app/preview/[slug]/page.tsx", [{
  yaEsta: `templateTipo === '${CODIGO}'`,
  ancla: "} else if (invitation.templateTipo === 'PRENSA') {",
  texto: ramaDinamica("", "invitation.templateTipo"),
  antes: true,
  que: "render preview/[slug]",
}]);

editar("src/app/invite/[slug]/[token]/page.tsx", [
  {
    yaEsta: `import { ${fam.componente} }`,
    ancla: 'import { PrensaTemplateHumo } from "@/components/templates/PrensaTemplateHumo";\n',
    texto: fam.variantes
      .map((v) => `import { ${componenteDe(v)} } from "@/components/templates/${archivoDe(v)}";`)
      .join("\n") + "\n",
    que: "imports invite",
  },
  {
    yaEsta: `templateTipo === '${CODIGO}'`,
    ancla: "            } else if (validInvitation.templateTipo === 'PRENSA') {",
    antes: true,
    texto: [
      `            } else if (validInvitation.templateTipo === '${CODIGO}') {`,
      "                switch (color) {",
      ...otras.map((v) => `                    case '${v.id}': return <${componenteDe(v)} invitation={invRecord} guest={guestRecord} isPersonalized={true} />;`),
      `                    default: return <${fam.componente} invitation={invRecord} guest={guestRecord} isPersonalized={true} />;`,
      "                }",
      "",
    ].join("\n"),
    que: "render invite",
  },
]);

console.log(`${fam.etiqueta} (${CODIGO})`);
if (hechos.length) console.log("  enchufado:\n    " + hechos.join("\n    "));
if (saltados.length) console.log("  ya estaba:\n    " + saltados.join("\n    "));
if (errores.length) {
  console.error("  SIN HACER:\n    " + errores.join("\n    "));
  process.exit(1);
}
console.log("  falta: node scripts/generar-plantillas-dinamicas.js");
