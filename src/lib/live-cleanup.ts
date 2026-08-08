import { unlink } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/db";
import { getUploadsDir } from "@/lib/uploads";

const REJECTED_TTL_MS = 60 * 60 * 1000; // 1 hora

/** Borra el archivo en disco de un LiveItem (no aplica a "TEXT", que no tiene archivo). */
async function deleteLiveItemFile(item: { type: string; fileUrl: string }) {
  if (item.type === "TEXT") return;
  if (!item.fileUrl.startsWith("/uploads/")) return;
  const relative = item.fileUrl.replace(/^\/uploads\//, "");
  const filepath = getUploadsDir(...relative.split("/"));
  try {
    await unlink(filepath);
  } catch {
    // El archivo ya no existe o no se pudo borrar -- no es bloqueante.
  }
}

/**
 * Borra definitivamente (archivo + registro) los items rechazados hace más
 * de 1 hora de una sesión LIVE. Se llama de forma "perezosa" en cada GET del
 * panel de moderación -- no hace falta un cron separado para esto.
 */
export async function cleanupExpiredRejectedItems(sessionId: string) {
  const expired = await prisma.liveItem.findMany({
    where: {
      sessionId,
      status: "REJECTED",
      rejectedAt: { lt: new Date(Date.now() - REJECTED_TTL_MS) },
    },
    select: { id: true, type: true, fileUrl: true },
  });

  if (expired.length === 0) return;

  await Promise.all(expired.map(deleteLiveItemFile));
  await prisma.liveItem.deleteMany({
    where: { id: { in: expired.map((i) => i.id) } },
  });
}

export { deleteLiveItemFile, REJECTED_TTL_MS };
