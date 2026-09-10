import path from "path";

/**
 * Carpeta donde se guardan los archivos subidos (fotos de portada, álbum,
 * contenido de LIVE). Se resuelve, en orden:
 * 1. UPLOADS_DIR, si se setea a mano.
 * 2. RAILWAY_VOLUME_MOUNT_PATH, que Railway inyecta solo apenas se conecta
 *    un Volume al servicio (ver https://docs.railway.com/reference/volumes)
 *    — así alcanza con montar el Volume en, por ejemplo, "/data/uploads"
 *    sin necesidad de configurar nada más.
 * 3. "public/uploads" (comportamiento de siempre, para desarrollo local).
 */
export function getUploadsDir(...segments: string[]): string {
  // El `turbopackIgnore` es para el trazado de dependencias del build, no
  // para la ejecución: al ver un path.join() armado con variables de entorno,
  // el tracer no puede saber qué se lee y termina metiendo TODO el proyecto
  // --public/ incluido, cientos de MB de fondos, música y fotos-- adentro del
  // bundle del servidor. En producción los archivos viven en el Volume, que
  // no es parte del bundle, así que no hay nada que trazar.
  const base =
    process.env.UPLOADS_DIR ||
    process.env.RAILWAY_VOLUME_MOUNT_PATH ||
    path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "uploads");
  return path.join(/*turbopackIgnore: true*/ base, ...segments);
}
