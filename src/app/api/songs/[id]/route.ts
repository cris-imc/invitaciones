import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/roles";

// PATCH /api/songs/[id] — Aprobar o ocultar (solo el anfitrión de esa invitación o admin)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const { status } = body;

  if (!["APPROVED", "HIDDEN", "PENDING"].includes(status)) {
    return NextResponse.json(
      { error: "status debe ser APPROVED, HIDDEN o PENDING" },
      { status: 400 }
    );
  }

  try {
    const existing = await prisma.songSuggestion.findUnique({
      where: { id },
      select: { invitation: { select: { userId: true } } },
    });
    if (!existing) {
      return NextResponse.json({ error: "Sugerencia no encontrada" }, { status: 404 });
    }
    if (existing.invitation.userId !== session.user.id && !isAdmin(session.user.role)) {
      return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
    }

    const song = await prisma.songSuggestion.update({
      where: { id },
      data: { status },
    });
    return NextResponse.json(song);
  } catch (error) {
    console.error("[songs PATCH]", error);
    return NextResponse.json({ error: "Error al actualizar canción" }, { status: 500 });
  }
}
