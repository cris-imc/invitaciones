"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

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
