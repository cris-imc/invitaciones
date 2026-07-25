import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

// PATCH /api/guests/[id]/payment — Cambiar estado de pago (solo anfitrión autenticado)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth().catch(() => null);
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id: guestId } = await params;
  const body = await request.json().catch(() => ({}));
  const { status } = body;

  if (!["PENDING", "EXEMPT", "PAID"].includes(status)) {
    return NextResponse.json(
      { error: "status debe ser PENDING, EXEMPT o PAID" },
      { status: 400 }
    );
  }

  try {
    // Verificar que el guest pertenece a una invitación del usuario autenticado
    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
      include: { invitation: { select: { userId: true } } },
    });

    if (!guest) {
      return NextResponse.json({ error: "Invitado no encontrado" }, { status: 404 });
    }

    if (guest.invitation.userId !== session.user.id) {
      return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
    }

    const updated = await prisma.guest.update({
      where: { id: guestId },
      data: {
        paymentStatus: status,
        paymentStatusUpdatedAt: new Date(),
        paymentStatusUpdatedBy: String(session.user.id),
      },
      select: {
        id: true,
        name: true,
        paymentStatus: true,
        paymentStatusUpdatedAt: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[payment PATCH]", error);
    return NextResponse.json({ error: "Error al actualizar estado de pago" }, { status: 500 });
  }
}
