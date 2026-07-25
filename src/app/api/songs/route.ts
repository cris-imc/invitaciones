import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

// GET — Lista pública de canciones aprobadas (o todas para admin)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const invitationId = searchParams.get("invitationId");

  if (!invitationId) {
    return NextResponse.json({ error: "invitationId requerido" }, { status: 400 });
  }

  try {
    const session = await auth().catch(() => null);
    const isAdmin = Boolean(session?.user);

    const songs = await prisma.songSuggestion.findMany({
      where: {
        invitationId,
        // Invitados solo ven APPROVED; admin ve todo
        ...(isAdmin ? {} : { status: "APPROVED" }),
      },
      orderBy: { votes: "desc" },
      select: {
        id: true,
        title: true,
        artist: true,
        guestName: true,
        votes: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json(songs);
  } catch (error) {
    console.error("[songs GET]", error);
    return NextResponse.json({ error: "Error al obtener canciones" }, { status: 500 });
  }
}

// POST — Crear una nueva sugerencia de canción
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { invitationId, title, artist, guestToken, guestName } = body;

    if (!invitationId || !title || !artist) {
      return NextResponse.json(
        { error: "invitationId, title y artist son requeridos" },
        { status: 400 }
      );
    }

    // Verificar que la invitación existe
    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
      select: { id: true },
    });
    if (!invitation) {
      return NextResponse.json({ error: "Invitación no encontrada" }, { status: 404 });
    }

    // Buscar guest si hay token
    let guestId: string | null = null;
    if (guestToken) {
      const guest = await prisma.guest.findUnique({
        where: { uniqueToken: guestToken },
        select: { id: true },
      });
      if (guest) guestId = guest.id;
    }

    // Crear sugerencia
    const song = await prisma.songSuggestion.create({
      data: {
        invitationId,
        guestId,
        guestToken: guestToken ?? null,
        guestName: String(guestName ?? "Invitado").slice(0, 80),
        title: String(title).slice(0, 100),
        artist: String(artist).slice(0, 80),
        status: "PENDING", // siempre empieza pendiente de moderación
      },
    });

    return NextResponse.json(song, { status: 201 });
  } catch (error) {
    console.error("[songs POST]", error);
    return NextResponse.json({ error: "Error al crear sugerencia" }, { status: 500 });
  }
}
