"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/roles";

export async function deleteInvitation(invitationId: string) {
    try {
        const session = await auth();
        
        if (!session?.user?.id) {
            return { success: false, error: "No autenticado" };
        }

        const invitation = await prisma.invitation.findUnique({
            where: { id: invitationId },
            select: { userId: true, planTier: true, premiumCreditSpent: true, diamondCreditSpent: true }
        });

        if (!invitation) {
            return { success: false, error: "Invitación no encontrada" };
        }

        if (!isAdmin(session.user.role) && invitation.userId !== session.user.id) {
            return { success: false, error: "No tienes permisos para eliminar esta invitación" };
        }

        // Solo reembolsa si esta invitación puntual efectivamente consumió un
        // crédito al crearse (no para cuentas con plan ilimitado, ni para
        // invitaciones que un admin pasó a PREMIUM/DIAMOND manualmente sin
        // gastar uno).
        if (invitation.premiumCreditSpent) {
            await prisma.user.update({
                where: { id: invitation.userId },
                data: { premiumCredits: { increment: 1 } }
            });
        }
        if (invitation.diamondCreditSpent) {
            await prisma.user.update({
                where: { id: invitation.userId },
                data: { diamondCredits: { increment: 1 } }
            });
        }

        await prisma.invitation.delete({
            where: { id: invitationId }
        });

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/invitaciones");
        
        return { success: true };
    } catch (error) {
        console.error("Error deleting invitation:", error);
        return { success: false, error: "Error al eliminar la invitación" };
    }
}
