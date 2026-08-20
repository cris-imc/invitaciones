"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { isAdmin, isSuperUser } from "@/lib/roles";

export async function toggleInvitationStatus(invitationId: string, currentStatus: string) {
    try {
        const session = await auth();

        if (!isAdmin(session?.user?.role)) {
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
        if (!isAdmin(session?.user?.role)) throw new Error("Unauthorized");

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
        if (!isAdmin(session?.user?.role)) throw new Error("Unauthorized");

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

        if (!isAdmin(session?.user?.role)) {
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

export async function adminCreateUser(data: { name: string; email: string; password: string; planTier?: "FREE" | "PREMIUM" | "DIAMOND"; role?: "CLIENT" | "ADMIN" }) {
    try {
        const session = await auth();

        if (!isAdmin(session?.user?.role)) {
            throw new Error("Unauthorized");
        }

        // Solo el Super Usuario puede dar de alta otras cuentas Admin -- un
        // Admin comun solo puede crear Clientes (rol forzado a CLIENT si no
        // es SU, sin importar lo que haya llegado en data.role).
        const requestedRole = data.role === "ADMIN" ? "ADMIN" : "CLIENT";
        if (requestedRole === "ADMIN" && !isSuperUser(session?.user?.role)) {
            return { success: false, error: "Solo el Super Usuario puede crear cuentas de Admin" };
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
        // (eso se asigna a mano despues, si corresponde). No aplica a cuentas
        // Admin, que no cargan invitaciones propias.
        const wantsPremium = requestedRole === "CLIENT" && data.planTier === "PREMIUM";
        const wantsDiamond = requestedRole === "CLIENT" && data.planTier === "DIAMOND";

        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                mustChangePassword: true,
                planTier: requestedRole === "ADMIN" ? "ADMIN" : "FREE",
                premiumCredits: wantsPremium ? 1 : 0,
                diamondCredits: wantsDiamond ? 1 : 0,
                subscriptionStatus: requestedRole === "ADMIN" || wantsPremium || wantsDiamond ? "ACTIVE" : "TRIAL",
                role: requestedRole,
            },
        });

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error: any) {
        console.error("Error creating user as admin:", error);
        return { success: false, error: error.message || "Failed to create user" };
    }
}

import { normalizeDiscountCode, isValidPercentage } from "@/lib/discount-codes";

export async function adminCreateDiscountCode(data: { code: string; percentage: number }) {
    try {
        const session = await auth();
        if (!isAdmin(session?.user?.role)) {
            throw new Error("Unauthorized");
        }

        const code = normalizeDiscountCode(data.code || "");
        if (!code) {
            return { success: false, error: "El código no puede estar vacío" };
        }
        if (!isValidPercentage(data.percentage)) {
            return { success: false, error: "El porcentaje debe ser un número entero entre 1 y 100" };
        }

        const existing = await prisma.discountCode.findUnique({ where: { code } });
        if (existing) {
            return { success: false, error: "Ya existe un código con ese nombre" };
        }

        await prisma.discountCode.create({
            data: { code, percentage: data.percentage },
        });

        revalidatePath("/dashboard/descuentos");
        return { success: true };
    } catch (error: any) {
        console.error("Error creating discount code:", error);
        return { success: false, error: error.message || "Failed to create discount code" };
    }
}

export async function toggleDiscountCode(id: string, currentEnabled: boolean) {
    try {
        const session = await auth();
        if (!isAdmin(session?.user?.role)) {
            throw new Error("Unauthorized");
        }

        await prisma.discountCode.update({
            where: { id },
            data: { enabled: !currentEnabled },
        });

        revalidatePath("/dashboard/descuentos");
        return { success: true, newEnabled: !currentEnabled };
    } catch (error: any) {
        console.error("Error toggling discount code:", error);
        return { success: false, error: "Failed to toggle discount code" };
    }
}
