import { NextRequest, NextResponse } from "next/server";
import { createReadStream } from "fs";
import { stat } from "fs/promises";
import { Readable } from "stream";
import path from "path";
import { getUploadsDir } from "@/lib/uploads";

// Solo se ejecuta cuando UPLOADS_DIR apunta fuera de "public" (ej: un Volume
// montado en otro lado). Si los archivos siguen en public/uploads (config
// por defecto, desarrollo local), Next.js los sirve directo como estáticos
// y esta ruta ni se llega a ejecutar.

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".mp3": "audio/mpeg",
  ".webm": "video/webm",
  ".mp4": "video/mp4",
};

// Los nombres que genera la subida llevan timestamp + random, así que un
// nombre nunca cambia de contenido: se puede cachear para siempre.
const CACHE = "public, max-age=31536000, immutable";

function toWebStream(nodeStream: ReturnType<typeof createReadStream>) {
  return Readable.toWeb(nodeStream) as unknown as ReadableStream<Uint8Array>;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  if (!segments || segments.length === 0) {
    return new NextResponse("Not found", { status: 404 });
  }

  const baseDir = path.resolve(getUploadsDir());
  const targetPath = path.resolve(getUploadsDir(...segments));

  // Evita path traversal: el resultado tiene que quedar adentro de baseDir
  if (targetPath !== baseDir && !targetPath.startsWith(baseDir + path.sep)) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const fileStat = await stat(targetPath);
    if (!fileStat.isFile()) {
      return new NextResponse("Not found", { status: 404 });
    }

    const size = fileStat.size;
    const ext = path.extname(targetPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    // Validador barato y estable para que el navegador pueda revalidar con
    // If-None-Match y llevarse un 304 de 0 bytes en vez del archivo entero.
    const etag = `"${size.toString(16)}-${fileStat.mtimeMs.toString(16)}"`;
    if (request.headers.get("if-none-match") === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: { ETag: etag, "Cache-Control": CACHE },
      });
    }

    const comunes = {
      "Content-Type": contentType,
      "Cache-Control": CACHE,
      ETag: etag,
      // Sin esto el navegador no puede pedir tramos: al mover la aguja de un
      // audio se rebajaba el archivo completo de nuevo, y en iOS el <audio>
      // directamente reintentaba la descarga entera.
      "Accept-Ranges": "bytes",
    };

    // Pedido de un tramo (audio/video buscando una posición).
    const range = request.headers.get("range");
    const match = range?.match(/^bytes=(\d*)-(\d*)$/);
    if (match) {
      const [, desdeRaw, hastaRaw] = match;
      let desde = desdeRaw ? parseInt(desdeRaw, 10) : 0;
      let hasta = hastaRaw ? parseInt(hastaRaw, 10) : size - 1;

      // "bytes=-500" son los últimos 500 bytes, no del 0 al 500.
      if (!desdeRaw && hastaRaw) {
        desde = Math.max(0, size - parseInt(hastaRaw, 10));
        hasta = size - 1;
      }

      if (Number.isNaN(desde) || Number.isNaN(hasta) || desde > hasta || desde >= size) {
        return new NextResponse(null, {
          status: 416,
          headers: { "Content-Range": `bytes */${size}`, ...comunes },
        });
      }
      hasta = Math.min(hasta, size - 1);

      return new NextResponse(toWebStream(createReadStream(targetPath, { start: desde, end: hasta })), {
        status: 206,
        headers: {
          ...comunes,
          "Content-Range": `bytes ${desde}-${hasta}/${size}`,
          "Content-Length": String(hasta - desde + 1),
        },
      });
    }

    // Archivo completo, en streaming: antes se hacía readFile() y el archivo
    // entero quedaba en memoria por cada pedido en curso (un mp3 de 5,6 MB
    // eran 5,6 MB de RAM por request simultáneo). Ahora se manda por tramos
    // y la memoria queda acotada al buffer del stream.
    return new NextResponse(toWebStream(createReadStream(targetPath)), {
      status: 200,
      headers: { ...comunes, "Content-Length": String(size) },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
