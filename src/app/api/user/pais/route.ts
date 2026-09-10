import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

/**
 * El país del anfitrión logueado.
 *
 * Existe para que el wizard sepa qué datos bancarios pedir antes de que la
 * invitación exista. No se puede resolver del lado del cliente: el país vive
 * en la base, no en la sesión.
 */
export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const usuario = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { pais: true },
    });

    return NextResponse.json({ pais: usuario?.pais ?? "AR" });
}
