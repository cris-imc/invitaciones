/**
 * Si una URL de imagen puede pasar por el optimizador de Next (`/_next/image`).
 *
 * El optimizador sólo acepta rutas propias (`/uploads/...`, `/fondos/...`) y
 * los dominios remotos listados en `images.remotePatterns` de next.config.ts;
 * a cualquier otra cosa le responde 400 y la imagen sale rota. Esta lista
 * tiene que ir a la par de esa configuración.
 */
const DOMINIOS_REMOTOS_PERMITIDOS = new Set(["images.unsplash.com"]);

export function esUrlDeImagenOptimizable(url: string): boolean {
  if (!url) return false;
  // Ya reducida: no envolver dos veces.
  if (url.startsWith("/_next/image")) return false;
  if (url.startsWith("data:") || url.startsWith("blob:")) return false;
  // Ruta propia (subidas y arte estática del sitio).
  if (url.startsWith("/") && !url.startsWith("//")) return true;
  try {
    const u = new URL(url);
    return u.protocol === "https:" && DOMINIOS_REMOTOS_PERMITIDOS.has(u.hostname);
  } catch {
    return false;
  }
}
