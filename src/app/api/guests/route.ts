import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/roles";
import { resolveGuestPayment } from "@/lib/payments";

// GET /api/guests?invitationId=X — Lista de invitados del anfitrión
export async function GET(request: NextRequest) {
  const session = await auth().catch(() => null);
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const invitationId = searchParams.get("invitationId");

  if (!invitationId) {
    return NextResponse.json({ error: "invitationId requerido" }, { status: 400 });
  }

  try {
    // Verificar que la invitación pertenece al usuario
    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
      select: {
        userId: true,
        pagoTarjetaMonto: true,
        regaloMonto: true,
        precioAdolescente: true,
        precioNino: true,
      },
    });

    if (!invitation || (invitation.userId !== session.user.id && !isAdmin(session.user.role))) {
      return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
    }

    const guests = await prisma.guest.findMany({
      where: { invitationId },
      orderBy: [{ status: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
        attendingCount: true,
        expectedCount: true,
        paymentStatus: true,
        paidAmount: true,
        expectedAmount: true,
        isExempt: true,
        attendingAdults: true,
        attendingTeens: true,
        attendingChildren: true,
        dietaryRestrictions: true,
        message: true,
        uniqueToken: true,
        responseDate: true,
        createdAt: true,
      },
    });

    // Los montos se resuelven en el servidor (una sola implementación del
    // cálculo, ver src/lib/payments.ts) para que el panel no vuelva a estimar
    // la recaudación por su cuenta -- antes multiplicaba plano por
    // attendingCount e ignoraba los precios de adolescente/niño.
    return NextResponse.json(
      guests.map((g) => {
        const payment = resolveGuestPayment(g, invitation);
        return {
          ...g,
          paymentStatus: payment.status,
          paidAmount: payment.paidAmount,
          expectedAmount: payment.expectedAmount,
          balance: payment.balance,
        };
      })
    );
  } catch (error) {
    console.error("[guests GET]", error);
    return NextResponse.json({ error: "Error al obtener invitados" }, { status: 500 });
  }
}
