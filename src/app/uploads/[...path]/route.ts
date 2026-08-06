import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
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

export async function GET(
  _request: NextRequest,
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
    const buffer = await readFile(targetPath);
    const ext = path.extname(targetPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
