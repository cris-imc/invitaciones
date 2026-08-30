import { NextRequest, NextResponse } from "next/server";
import { randomBytes, createHash } from "crypto";
import { prisma } from "@/lib/db";
import { resend, EMAIL_FROM } from "@/lib/resend";
import { getPublicBaseUrl } from "@/lib/mercadopago";

const TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutos
const RESEND_COOLDOWN_MS = 60 * 1000; // no reenviar si ya se pidió hace <1 min

function hashToken(rawToken: string): string {
    return createHash("sha256").update(rawToken).digest("hex");
}

// Siempre responde 200 con el mismo mensaje genérico, exista o no el email --
// decirle a un visitante anónimo "ese email no existe" es lo que permite
// enumerar qué cuentas están registradas.
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const email = String(body.email || "").trim().toLowerCase();

        if (!email) {
            return NextResponse.json({ error: "Ingresá tu email" }, { status: 400 });
        }

        const genericResponse = NextResponse.json({
            message: "Si el email está registrado, te enviamos un link para resetear tu contraseña.",
        });

        const user = await prisma.user.findUnique({ where: { email } });

        // Sin password (ej. cuenta futura solo con OAuth) no hay nada que
        // resetear -- pero igual devolvemos el mensaje genérico.
        if (!user || !user.password) {
            return genericResponse;
        }

        const recentToken = await prisma.passwordResetToken.findFirst({
            where: { userId: user.id, createdAt: { gte: new Date(Date.now() - RESEND_COOLDOWN_MS) } },
            orderBy: { createdAt: "desc" },
        });
        if (recentToken) {
            return genericResponse;
        }

        const rawToken = randomBytes(32).toString("hex");
        const tokenHash = hashToken(rawToken);

        await prisma.$transaction([
            // Un solo link válido a la vez -- pedir uno nuevo invalida los
            // anteriores que no se hayan usado.
            prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } }),
            prisma.passwordResetToken.create({
                data: {
                    userId: user.id,
                    tokenHash,
                    expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
                },
            }),
        ]);

        const baseUrl = getPublicBaseUrl(request.nextUrl.origin);
        const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`;

        // El SDK de Resend no tira excepción en errores de la API (ej. key
        // sin permisos, dominio no verificado) -- devuelve {data, error}. Si
        // no revisamos error acá, un fallo de envío queda invisible: el
        // cliente ve "listo, revisá tu mail" y el mail nunca sale.
        const { error: sendError } = await resend.emails.send({
            from: EMAIL_FROM,
            to: user.email,
            subject: "Resetear tu contraseña -- Alta Invitación",
            html: `
                <p>Hola${user.name ? " " + user.name : ""},</p>
                <p>Pediste resetear tu contraseña en Alta Invitación. Hacé click en el siguiente link para elegir una nueva (válido por 30 minutos):</p>
                <p><a href="${resetUrl}">${resetUrl}</a></p>
                <p>Si no fuiste vos, ignorá este mail -- tu contraseña actual sigue funcionando igual.</p>
            `,
        });
        if (sendError) {
            console.error("[FORGOT_PASSWORD] Resend no pudo enviar el mail:", sendError);
        }

        return genericResponse;
    } catch (error) {
        console.error("[FORGOT_PASSWORD]", error);
        return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 });
    }
}
