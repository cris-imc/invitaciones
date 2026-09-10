import { comun } from "./comun";
import { landing } from "./landing";
import { panel } from "./panel";
import { wizard } from "./wizard";
import { invitacion } from "./invitacion";
import type { Idioma } from "../idiomas";

/**
 * Los textos de la aplicación, armados a partir de un módulo por área.
 *
 * Está partido por área y no en un archivo único para que se pueda trabajar
 * en varias áreas a la vez sin pisarse: cada módulo se traduce y se revisa
 * por separado. `comun` es el único que cualquier área puede usar.
 *
 * Las claves son en español y describen el LUGAR, no el texto
 * ("panel.invitados.sinAbrir"), porque el texto cambia y la clave no. Una
 * clave que sea el texto mismo ("Sin abrir") obliga a tocar todos los
 * archivos cuando alguien decide que ahora diga "Todavía no la abrió".
 */
const es = {
  comun: comun.es,
  landing: landing.es,
  panel: panel.es,
  wizard: wizard.es,
  invitacion: invitacion.es,
};

export type Diccionario = {
  comun: (typeof comun)["en"];
  landing: (typeof landing)["en"];
  panel: (typeof panel)["en"];
  wizard: (typeof wizard)["en"];
  invitacion: (typeof invitacion)["en"];
};

export const DICCIONARIOS: Record<Idioma, Diccionario> = {
  es,
  en: { comun: comun.en, landing: landing.en, panel: panel.en, wizard: wizard.en, invitacion: invitacion.en },
  pt: { comun: comun.pt, landing: landing.pt, panel: panel.pt, wizard: wizard.pt, invitacion: invitacion.pt },
};
