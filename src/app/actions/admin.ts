"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function toggleInvitationStatus(invitationId: string, currentStatus: string) {
    try {
        const session = await auth();
        
        if (session?.user?.role !== "ADMIN") {
            throw new Error("Unauthorized");
        }

        const newStatus = currentStatus === "ACTIVA" ? "BORRADOR" : "ACTIVA";

        await prisma.invitation.update({
            where: { id: invitationId },
            data: { estado: newStatus }
        });

        revalidatePath("/dashboard");
        return { success: true, newStatus };
    } catch (error) {
        console.error("Error toggling invitation status:", error);
        return { success: false, error: "Failed to toggle status" };
    }
}

export async function updateInvitationPlan(invitationId: string, planTier: string) {
    try {
        const session = await auth();
        if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

        await prisma.invitation.update({
            where: { id: invitationId },
            data: { planTier }
        });

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Error updating invitation plan:", error);
        return { success: false, error: "Failed to update plan" };
    }
}

export async function updateInvitationMaxGuests(invitationId: string, maxGuestsOverride: number | null) {
    try {
        const session = await auth();
        if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

        await prisma.invitation.update({
            where: { id: invitationId },
            data: { maxGuestsOverride }
        });

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Error updating max guests:", error);
        return { success: false, error: "Failed to update max guests" };
    }
}

import bcrypt from "bcryptjs";

export async function adminUpdateUser(userId: string, data: { name?: string; email?: string; password?: string }) {
    try {
        const session = await auth();
        
        if (session?.user?.role !== "ADMIN") {
            throw new Error("Unauthorized");
        }

        const updateData: any = {};
        if (data.name && data.name.trim().length > 0) updateData.name = data.name.trim();
        if (data.email && data.email.trim().length > 0) updateData.email = data.email.trim().toLowerCase();
        
        if (data.password && data.password.trim().length > 0) {
            updateData.password = await bcrypt.hash(data.password.trim(), 10);
        }

        await prisma.user.update({
            where: { id: userId },
            data: updateData
        });

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error: any) {
        console.error("Error updating user as admin:", error);
        return { success: false, error: error.message || "Failed to update user" };
    }
}
