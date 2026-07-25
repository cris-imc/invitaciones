import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// PATCH /api/songs/[id]/vote — Incrementar voto (sin auth, rate-limit por sesión en cliente)
export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const song = await prisma.songSuggestion.update({
      where: { id, status: "APPROVED" }, // solo se puede votar canciones aprobadas
      data: { votes: { increment: 1 } },
      select: { id: true, votes: true },
    });
    return NextResponse.json(song);
  } catch (error) {
    console.error("[songs vote]", error);
    return NextResponse.json({ error: "Error al votar" }, { status: 500 });
  }
}
