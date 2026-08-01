import { prisma } from "@/lib/db";
import fs from "fs/promises";
import path from "path";
import { getEventStatus } from "./expiration";

export { getEventStatus, getInvitationExpirationDate, isEventDateLocked } from "./expiration";

/**
 * Elimina físicamente del disco y de la base de datos la invitación expirada y sus archivos adjuntos.
 * Exclusivo para código ejecutado en el Servidor.
 */
export async function deleteExpiredInvitation(invitationId: string): Promise<boolean> {
  try {
    const inv = await prisma.invitation.findUnique({
      where: { id: invitationId },
      include: {
        album: {
          include: {
            fotos: true,
          },
        },
        liveSession: {
          include: {
            items: true,
          },
        },
      },
    });

    if (!inv) return false;

    // Recopilar URLs de archivos locales
    const fileUrls: string[] = [];
    if (inv.portadaImagenFondo) fileUrls.push(inv.portadaImagenFondo);
    if (inv.portadaImagenFondoDesktop) fileUrls.push(inv.portadaImagenFondoDesktop);
    if (inv.musicaUrl) fileUrls.push(inv.musicaUrl);
    if (inv.despedidaFoto) fileUrls.push(inv.despedidaFoto);

    if (inv.album?.fotos) {
      inv.album.fotos.forEach((f) => {
        if (f.url) fileUrls.push(f.url);
      });
    }

    if (inv.liveSession?.items) {
      inv.liveSession.items.forEach((item) => {
        if (item.fileUrl) fileUrls.push(item.fileUrl);
      });
    }

    // Borrado físico de archivos en disco (en la carpeta public/uploads)
    for (const url of fileUrls) {
      if (url && url.startsWith("/uploads/")) {
        const filepath = path.join(process.cwd(), "public", url);
        try {
          await fs.unlink(filepath);
        } catch {
          // El archivo puede no existir previamente
        }
      }
    }

    // Borrar la invitación en la DB (Prisma ejecutará onDelete: Cascade para dependencias)
    await prisma.invitation.delete({
      where: { id: invitationId },
    });

    console.log(`[EXPIRATION] Invitación ${invitationId} eliminada por superar los 3 meses de vigencia.`);
    return true;
  } catch (err) {
    console.error(`[EXPIRATION_ERROR] Error eliminando invitación expirada ${invitationId}:`, err);
    return false;
  }
}

/**
 * Verifica una invitación; si superó los 3 meses de vigencia la elimina y retorna null.
 * Exclusivo para código ejecutado en el Servidor.
 */
export async function checkAndCleanupIfExpired<T extends { id: string; fechaEvento: Date | string }>(
  invitation: T | null
): Promise<T | null> {
  if (!invitation) return null;
  const status = getEventStatus(invitation.fechaEvento);
  if (status === "EXPIRED") {
    await deleteExpiredInvitation(invitation.id);
    return null;
  }
  return invitation;
}
