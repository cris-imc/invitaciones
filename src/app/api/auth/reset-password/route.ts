import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { validatePassword } from "@/lib/password";

function hashToken(rawToken: string): string {
    return createHash("sha256").update(rawToken).digest("hex");
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const token = String(body.token || "");
        const password = String(body.password || "").trim();

        if (!token) {
            return NextResponse.json({ error: "Falta el token" }, { status: 400 });
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
            return NextResponse.json({ error: passwordError }, { status: 400 });
        }

        const tokenHash = hashToken(token);
        const resetToken = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

        if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
            return NextResponse.json(
                { error: "El link para resetear la contraseña venció o ya fue usado -- pedí uno nuevo." },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.$transaction([
            prisma.user.update({
                where: { id: resetToken.userId },
                data: { password: hashedPassword, mustChangePassword: false },
            }),
            // De un solo uso: se marca usado, y de paso se invalida cualquier
            // otro link pendiente de la misma cuenta (no debería haber más de
            // uno vigente, pero por las dudas).
            prisma.passwordResetToken.update({
                where: { id: resetToken.id },
                data: { usedAt: new Date() },
            }),
            prisma.passwordResetToken.deleteMany({
                where: { userId: resetToken.userId, usedAt: null },
            }),
        ]);

        return NextResponse.json({ message: "Contraseña actualizada correctamente." });
    } catch (error) {
        console.error("[RESET_PASSWORD]", error);
        return NextResponse.json({ error: "Error al resetear la contraseña" }, { status: 500 });
    }
}
