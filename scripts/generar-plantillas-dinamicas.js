#!/usr/bin/env node
/**
 * Genera src/components/templates/PlantillaDinamica.tsx: un componente de
 * cliente con UN import dinámico por plantilla.
 *
 * Por qué existe: las páginas de invitación (/i/[slug] y /preview/[slug])
 * elegían la plantilla con un switch sobre 284 imports estáticos. En el App
 * Router, todos los componentes de cliente que importa una página van al
 * bundle de ESA RUTA, se rendericen o no: cada visitante bajaba el código de
 * las 364 plantillas (4,7 MB comprimidos, 18 MB de JS a parsear) para ver
 * una. En /modelos, con 8 miniaturas vivas, eso eran ~1 GB de memoria y la
 * pestaña muerta en el teléfono. Con import() desde un componente de
 * cliente, cada plantilla es su propio chunk y sólo se baja la que se dibuja.
 *
 * Se genera con un script y no a mano porque son 364 líneas iguales y las
 * plantillas nuevas se agregan por archivo: correr
 *   node scripts/generar-plantillas-dinamicas.js
 * cada vez que aparece una plantilla nueva en src/components/templates.
 * Regla: el archivo X.tsx exporta la función X (se verifica acá).
 */
const fs = require("node:fs");
const path = require("node:path");

const dir = path.join(__dirname, "..", "src", "components", "templates");
const salida = path.join(dir, "PlantillaDinamica.tsx");

const nombres = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith(".tsx") && f !== "PlantillaDinamica.tsx")
  .map((f) => f.replace(/\.tsx$/, ""))
  .filter((n) => {
    const fuente = fs.readFileSync(path.join(dir, `${n}.tsx`), "utf8");
    const exporta = new RegExp(`export (function|const) ${n}\\b`).test(fuente);
    if (!exporta) console.warn(`aviso: ${n}.tsx no exporta "${n}"; se omite`);
    return exporta;
  })
  .sort();

const entradas = nombres
  .map((n) => `  ${n}: cargar(() => import("./${n}"), "${n}"),`)
  .join("\n");

const contenido = `"use client";

// GENERADO por scripts/generar-plantillas-dinamicas.js -- no editar a mano.
// Para agregar una plantilla, creá el archivo en esta carpeta y volvé a
// correr el script. El porqué de este archivo está en ese script.

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

/** Lo que las páginas le pasan a cualquier plantilla. */
export interface PropsDePlantilla {
  invitation: Record<string, unknown>;
  guest?: unknown;
  isPersonalized?: boolean;
}

type Plantilla = ComponentType<PropsDePlantilla>;

// Cada plantilla tipa sus props un poco distinto (el \`guest\` sobre todo);
// acá se las trata a todas igual, que es como las páginas las usaban.
function cargar(importar: () => Promise<unknown>, nombre: string): Plantilla {
  return dynamic(() =>
    importar().then((m) => (m as Record<string, unknown>)[nombre] as Plantilla)
  );
}

// Cada entrada es su propio chunk: sólo se baja la que se renderiza. Va en un
// componente de CLIENTE a propósito -- next/dynamic desde un Server
// Component no parte el bundle (ver docs de Next, "Lazy Loading").
const PLANTILLAS: Record<string, Plantilla> = {
${entradas}
};

/** Si existe una plantilla con ese nombre exportado. */
export function esNombreDePlantilla(nombre: string): boolean {
  return Object.prototype.hasOwnProperty.call(PLANTILLAS, nombre);
}

/**
 * Dibuja la plantilla \`nombre\` con las props de siempre. Con un nombre
 * desconocido no dibuja nada: las páginas eligen el nombre con su propio
 * switch, así que acá no debería pasar nunca.
 */
export function PlantillaDinamica({ nombre, ...props }: PropsDePlantilla & { nombre: string }) {
  const Plantilla = PLANTILLAS[nombre];
  if (!Plantilla) return null;
  return <Plantilla {...props} />;
}
`;

fs.writeFileSync(salida, contenido);
console.log(`PlantillaDinamica.tsx: ${nombres.length} plantillas`);
