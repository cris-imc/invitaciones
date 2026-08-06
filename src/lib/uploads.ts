import path from "path";

/**
 * Carpeta donde se guardan los archivos subidos (fotos de portada, álbum,
 * contenido de LIVE). Configurable vía UPLOADS_DIR para poder apuntar a un
 * Volume persistente en producción (ej: Railway) sin depender de que
 * coincida con la carpeta "public" del contenedor. Si no está seteada,
 * usa "public/uploads" (comportamiento de siempre, para desarrollo local).
 */
export function getUploadsDir(...segments: string[]): string {
  const base = process.env.UPLOADS_DIR || path.join(process.cwd(), "public", "uploads");
  return path.join(base, ...segments);
}
