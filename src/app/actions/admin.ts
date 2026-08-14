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

export async function updateInvitationMaxLivePhotos(invitationId: string, maxLivePhotosOverride: number | null) {
    try {
        const session = await auth();
        if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

        await prisma.invitation.update({
            where: { id: invitationId },
            data: { maxLivePhotosOverride }
        });

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Error updating max live photos:", error);
        return { success: false, error: "Failed to update max live photos" };
    }
}

import bcrypt from "bcryptjs";
import { validatePassword } from "@/lib/password";
import { validatePhoneAreaCode, validatePhoneNumber } from "@/lib/phone";

export async function adminUpdateUser(userId: string, data: { name?: string; email?: string; password?: string; phoneAreaCode?: string; phoneNumber?: string }) {
    try {
        const session = await auth();

        if (session?.user?.role !== "ADMIN") {
            throw new Error("Unauthorized");
        }

        const updateData: any = {};
        if (data.name && data.name.trim().length > 0) updateData.name = data.name.trim();
        if (data.email && data.email.trim().length > 0) updateData.email = data.email.trim().toLowerCase();

        if (data.phoneAreaCode !== undefined && data.phoneNumber !== undefined) {
            const areaCode = data.phoneAreaCode.trim();
            const number = data.phoneNumber.trim();
            // Ambos vacíos = borrar el teléfono. Si sólo uno está cargado, validar.
            if (!areaCode && !number) {
                updateData.phoneAreaCode = null;
                updateData.phoneNumber = null;
            } else {
                const areaCodeError = validatePhoneAreaCode(areaCode);
                if (areaCodeError) return { success: false, error: areaCodeError };
                const numberError = validatePhoneNumber(number);
                if (numberError) return { success: false, error: numberError };
                updateData.phoneAreaCode = areaCode;
                updateData.phoneNumber = number;
            }
        }

        if (data.password && data.password.trim().length > 0) {
            const passwordError = validatePassword(data.password.trim());
            if (passwordError) {
                return { success: false, error: passwordError };
            }
            updateData.password = await bcrypt.hash(data.password.trim(), 10);
            updateData.mustChangePassword = true;
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

export async function adminCreateUser(data: { name: string; email: string; password: string; planTier?: "FREE" | "PREMIUM" | "DIAMOND" }) {
    try {
        const session = await auth();

        if (session?.user?.role !== "ADMIN") {
            throw new Error("Unauthorized");
        }

        const name = data.name?.trim();
        const email = data.email?.trim().toLowerCase();
        const password = data.password?.trim();

        if (!name || !email || !password) {
            return { success: false, error: "Nombre, email y contraseña son obligatorios" };
        }
        const passwordError = validatePassword(password);
        if (passwordError) {
            return { success: false, error: passwordError };
        }

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return { success: false, error: "Ya existe una cuenta con ese email" };
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        // Igual que en el registro público: "Premium"/"Diamond" acá es un
        // credito para UNA invitacion de ese tipo, nunca un plan ilimitado
        // (eso se asigna a mano despues, si corresponde).
        const wantsPremium = data.planTier === "PREMIUM";
        const wantsDiamond = data.planTier === "DIAMOND";

        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                mustChangePassword: true,
                planTier: "FREE",
                premiumCredits: wantsPremium ? 1 : 0,
                diamondCredits: wantsDiamond ? 1 : 0,
                subscriptionStatus: wantsPremium || wantsDiamond ? "ACTIVE" : "TRIAL",
                role: "CLIENT",
            },
        });

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error: any) {
        console.error("Error creating user as admin:", error);
        return { success: false, error: error.message || "Failed to create user" };
    }
}
