import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

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
      select: { userId: true },
    });

    if (!invitation || invitation.userId !== session.user.id) {
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
        dietaryRestrictions: true,
        message: true,
        uniqueToken: true,
        responseDate: true,
        createdAt: true,
      },
    });

    return NextResponse.json(guests);
  } catch (error) {
    console.error("[guests GET]", error);
    return NextResponse.json({ error: "Error al obtener invitados" }, { status: 500 });
  }
}
