/**
 * Idiomas de la aplicación.
 *
 * DECISIÓN IMPORTANTE: hay dos idiomas distintos conviviendo, y confundirlos
 * rompe el producto.
 *
 * 1. El idioma del ANFITRIÓN: el del panel, el wizard y la landing. Es una
 *    preferencia personal suya y se guarda en una cookie.
 *
 * 2. El idioma de la INVITACIÓN: el que ven sus invitados. NO es una
 *    preferencia del que mira. Una boda en São Paulo manda su invitación en
 *    portugués aunque el invitado tenga el navegador en inglés; y si un tío
 *    argentino la abre, la tiene que ver igual que todos los demás. Se define
 *    al crear la invitación y viaja con ella.
 *
 * Por eso el idioma NO va en la URL (`/es/...`, `/en/...`). Además de que
 * partiría el sitio en tres, rompería todos los links de invitación ya
 * enviados, que es lo único de este producto que no se puede romper: están en
 * el WhatsApp de cientos de invitados y no hay forma de reenviarlos.
 */

export const IDIOMAS = ["es", "en", "pt"] as const;
export type Idioma = (typeof IDIOMAS)[number];

export const IDIOMA_POR_DEFECTO: Idioma = "es";

export const NOMBRES_DE_IDIOMA: Record<Idioma, string> = {
  es: "Español",
  en: "English",
  pt: "Português",
};

/** El código corto que se muestra en el selector. */
export const SIGLAS: Record<Idioma, string> = {
  es: "ES",
  en: "EN",
  pt: "PT",
};

export const COOKIE_IDIOMA = "idioma";

export function esIdiomaValido(v: unknown): v is Idioma {
  return typeof v === "string" && (IDIOMAS as readonly string[]).includes(v);
}

/**
 * El mejor idioma disponible según lo que pide el navegador.
 *
 * Se usa sólo la primera vez, antes de que la persona elija: a partir de ahí
 * manda su elección. Adivinar por encima de una elección explícita es de las
 * cosas más molestas que puede hacer un sitio.
 */
export function idiomaSegunNavegador(acceptLanguage: string | null): Idioma {
  if (!acceptLanguage) return IDIOMA_POR_DEFECTO;

  // "pt-BR,pt;q=0.9,en;q=0.8" -> ["pt-br", "pt", "en"], en orden de preferencia.
  const pedidos = acceptLanguage
    .split(",")
    .map((parte) => {
      const [etiqueta, q] = parte.trim().split(";q=");
      return { etiqueta: etiqueta.trim().toLowerCase(), peso: q ? parseFloat(q) : 1 };
    })
    .filter((p) => Number.isFinite(p.peso))
    .sort((a, b) => b.peso - a.peso);

  for (const { etiqueta } of pedidos) {
    // "pt-br" cuenta como "pt": no distinguimos variantes regionales.
    const base = etiqueta.split("-")[0];
    if (esIdiomaValido(base)) return base;
  }

  return IDIOMA_POR_DEFECTO;
}
