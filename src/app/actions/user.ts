"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { normalizeDigits, validatePhoneAreaCode, validatePhoneNumber } from "@/lib/phone";
import { esCodigoPais } from "@/lib/paises";

export async function updateUserPhone(phoneAreaCode: string, phoneNumber: string) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const areaCode = normalizeDigits(phoneAreaCode);
        const number = normalizeDigits(phoneNumber);

        const areaCodeError = validatePhoneAreaCode(areaCode);
        if (areaCodeError) throw new Error(areaCodeError);

        const phoneNumberError = validatePhoneNumber(number);
        if (phoneNumberError) throw new Error(phoneNumberError);

        await prisma.user.update({
            where: { id: session.user.id },
            data: { phoneAreaCode: areaCode, phoneNumber: number },
        });

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/perfil");
        return { success: true };
    } catch (error: any) {
        console.error("Error updating phone:", error);
        return { success: false, error: error.message || "Failed to update phone" };
    }
}

/**
 * Cambia el país de la cuenta. Sólo afecta a las invitaciones que se creen de
 * acá en adelante: las ya creadas guardan su propio país (ver POST
 * /api/invitations), así que mudarse no le cambia los datos bancarios a una
 * invitación que ya está en manos de sus invitados.
 */
export async function updateUserPais(pais: string) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        if (!esCodigoPais(pais)) {
            throw new Error("Elegí un país válido.");
        }

        await prisma.user.update({
            where: { id: session.user.id },
            data: { pais },
        });

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/perfil");
        return { success: true };
    } catch (error: any) {
        console.error("Error updating pais:", error);
        return { success: false, error: error.message || "Failed to update pais" };
    }
}

export async function updateUserProfile(name: string) {
    try {
        const session = await auth();
        
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        if (!name || name.trim().length === 0) {
            throw new Error("El nombre no puede estar vacío.");
        }

        await prisma.user.update({
            where: { id: session.user.id },
            data: { name: name.trim() }
        });

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error: any) {
        console.error("Error updating profile:", error);
        return { success: false, error: error.message || "Failed to update profile" };
    }
}

import bcrypt from "bcryptjs";
import { validatePassword } from "@/lib/password";

export async function forceChangePassword(password: string) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const passwordError = validatePassword((password || "").trim());
        if (passwordError) {
            throw new Error(passwordError);
        }

        const hashedPassword = await bcrypt.hash(password.trim(), 10);

        await prisma.user.update({
            where: { id: session.user.id },
            data: { 
                password: hashedPassword,
                mustChangePassword: false 
            }
        });

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error: any) {
        console.error("Error force changing password:", error);
        return { success: false, error: error.message || "Failed to update password" };
    }
}
