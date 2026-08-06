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
  const base =
    process.env.UPLOADS_DIR ||
    process.env.RAILWAY_VOLUME_MOUNT_PATH ||
    path.join(process.cwd(), "public", "uploads");
  return path.join(base, ...segments);
}
