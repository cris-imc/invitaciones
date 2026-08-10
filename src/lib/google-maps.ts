/**
 * El iframe del mapa se rompia con casi cualquier link real que un usuario
 * pega desde Google Maps: ni el link corto de "Compartir" (maps.app.goo.gl)
 * ni el link largo de la barra de direcciones (google.com/maps/place/...)
 * son embebibles tal cual -- Google los bloquea con X-Frame-Options salvo
 * que sea especificamente un link con formato "embed".
 */

/** true si la URL ya es un link de embed valido para iframe. */
function isEmbedUrl(url: string): boolean {
  return /\/maps\/embed/.test(url) || /[?&]output=embed\b/.test(url);
}

/**
 * Convierte un link "normal" de Google Maps (largo, con @lat,lng o ?q=...)
 * al formato query-embed (google.com/maps?q=...&output=embed), que si
 * funciona dentro de un iframe sin necesitar API key. Devuelve null si no
 * pudo extraer nada usable (ej. todavia es un link corto sin resolver).
 */
export function toEmbedMapUrl(rawUrl: string): string | null {
  const url = (rawUrl || "").trim();
  if (!url) return null;

  // Si el usuario pego todo un <iframe> de Google Maps, extraemos solo el src
  const iframeSrcMatch = url.match(/src="([^"]+)"/i);
  let processUrl = url;
  if (iframeSrcMatch) {
    processUrl = iframeSrcMatch[1];
  }

  if (isEmbedUrl(processUrl)) return processUrl;

  try {
    const parsed = new URL(processUrl);

    // ?q=... o ?query=... ya presente
    const q = parsed.searchParams.get("q") || parsed.searchParams.get("query");
    if (q) {
      return `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
    }

    // /maps/place/<nombre>/@lat,lng,zoom
    const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (atMatch) {
      return `https://www.google.com/maps?q=${atMatch[1]},${atMatch[2]}&output=embed`;
    }

    // /maps/place/<nombre del lugar>/
    const placeMatch = parsed.pathname.match(/\/maps\/place\/([^/]+)/);
    if (placeMatch) {
      const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, " "));
      return `https://www.google.com/maps?q=${encodeURIComponent(placeName)}&output=embed`;
    }

    // Link corto (maps.app.goo.gl) sin resolver todavia: no hay forma de
    // sacarle datos sin seguir la redirección en el servidor.
    return null;
  } catch {
    return null;
  }
}

/**
 * Sigue la redirección de un link corto de Google Maps (maps.app.goo.gl,
 * goo.gl/maps) para obtener la URL larga real. Server-side only (usa
 * fetch con seguimiento de redirects) -- se usa una sola vez al guardar
 * la invitación, no en cada visita del invitado.
 */
export async function resolveGoogleMapsShortLink(url: string): Promise<string> {
  const trimmed = (url || "").trim();
  if (!trimmed) return trimmed;

  const isShortLink = /^https?:\/\/(maps\.app\.goo\.gl|goo\.gl\/maps)\//.test(trimmed);
  if (!isShortLink) return trimmed;

  try {
    const res = await fetch(trimmed, { method: "GET", redirect: "follow" });
    return res.url || trimmed;
  } catch {
    // Si falla la resolución (sin internet, timeout, etc.), guardamos el
    // link tal cual llegó -- mejor eso que perder el dato del usuario.
    return trimmed;
  }
}
