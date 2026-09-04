import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/roles";
import { resolveCardPayment } from "@/lib/card-payments";

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
        isExempt: true,
        attendingAdults: true,
        attendingTeens: true,
        attendingChildren: true,
        paidAdults: true,
        paidTeens: true,
        paidChildren: true,
        paidAmountAdults: true,
        paidAmountTeens: true,
        paidAmountChildren: true,
        receivedAmount: true,
        hostNotes: true,
        dietaryRestrictions: true,
        message: true,
        uniqueToken: true,
        responseDate: true,
        createdAt: true,
      },
    });

    // Los montos se resuelven en el servidor: el panel no vuelve a calcular
    // precios, asi que lo que ve el anfitrion y lo que ve el invitado coinciden.
    return NextResponse.json(
      guests.map((g) => {
        const p = resolveCardPayment(g, invitation);
        return {
          ...g,
          paymentStatus: p.status,
          seats: p.seats,
          paidSeats: p.paidSeats,
          paidAmount: p.paidAmount,
          pendingAmount: p.pendingAmount,
          totalAmount: p.totalAmount,
          surplus: p.surplus,
          receivedAmount: p.receivedAmount,
          onAccount: p.onAccount,
          missingAmount: p.missingAmount,
        };
      })
    );
  } catch (error) {
    console.error("[guests GET]", error);
    return NextResponse.json({ error: "Error al obtener invitados" }, { status: 500 });
  }
}
