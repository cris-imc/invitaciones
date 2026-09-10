import type { CodigoPais } from "@/lib/paises";
import type { Idioma } from "./idiomas";

/**
 * Textos que cambian por PAÍS, no por idioma.
 *
 * El caso que obliga a que exista: en Estados Unidos no se festejan los
 * quince, se festejan los Sweet 16 -- un año después y con otro nombre.
 *
 * Podría parecer que alcanza con traducirlo en el diccionario inglés, porque
 * el inglés se le sirve a Estados Unidos. Pero el idioma de una INVITACIÓN se
 * elige aparte del país: un argentino que casa a su hija en Miami manda la
 * invitación en inglés, y eso sigue siendo una quinceañera. Si el cambio
 * colgara del idioma, esa invitación diría "Sweet 16", que es otra fiesta.
 *
 * Por eso el diccionario inglés dice "quinceañera" -- que es la palabra que
 * se usa en inglés para esa fiesta -- y acá se sobrescribe sólo cuando el
 * país es Estados Unidos.
 */

type Sobrescrituras = Partial<Record<Idioma, Record<string, string>>>;

const ESTADOS_UNIDOS: Sobrescrituras = {
  en: {
    "landing.showcase.bajada":
      "Weddings and Sweet 16s, in all kinds of styles and colors. This is how your invitation looks on each guest's phone.",
    "landing.showcase.evento.quince": "Sweet 16",
    "landing.strip.personalizable.detalle":
      "Change colors, fonts, photos and layout. Wedding, Sweet 16 or corporate event, the design follows your style.",
    "landing.faq.otrosEventos.a":
      "Yes, we have templates for weddings, Sweet 16s, birthdays and other events, each with its own style, typography and structure.",
    "landing.modelos.tabs.xv": "Sweet 16",
    "panel.invitados.fraseQuince": "my sweet sixteen",
    "wizard.tipoEvento.quince": "Sweet 16",
    "wizard.tipoEvento.quince1": "My Sweet 16",
    "wizard.tipoEvento.quince2": "My Sweet Sixteen",
    "wizard.tipoEvento.quince3": "My 16!",
    "wizard.tipoEvento.placeholderQuince": "E.g. My Sweet 16",
    "wizard.tipografia.muestraQuince": "My Sweet 16",
    "wizard.frase.quince5":
      "One magical night, a memory for life. Come celebrate my Sweet 16 with me!",
    "wizard.trivia.quince2": "My Sweet 16 Trivia",
    "invitacion.evento.misQuinceAnos": "My Sweet 16",
    "invitacion.evento.misQuince": "My Sweet 16",
  },
};

const POR_PAIS: Partial<Record<CodigoPais, Sobrescrituras>> = {
  US: ESTADOS_UNIDOS,
};

/** El texto propio de ese país para esa clave, si lo hay. */
export function sobrescritura(
  pais: string | null | undefined,
  idioma: Idioma,
  clave: string
): string | undefined {
  if (!pais) return undefined;
  return POR_PAIS[pais as CodigoPais]?.[idioma]?.[clave];
}
