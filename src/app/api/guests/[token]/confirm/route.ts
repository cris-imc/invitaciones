import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST /api/guests/[token]/confirm
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();

    const guest = await prisma.guest.findFirst({
      where: { uniqueToken: token },
    });

    if (!guest) {
      return NextResponse.json({ error: "Invitado no encontrado" }, { status: 404 });
    }

    // Actualizamos el Guest
    const status = body.asistencia === "CONFIRMA" ? "CONFIRMED" : "DECLINED";
    
    const updatedGuest = await prisma.guest.update({
      where: { id: guest.id },
      data: {
        status,
        attendingCount: body.numeroAcompanantes + 1, // +1 por el titular
        dietaryRestrictions: body.restricciones,
        responseDate: new Date(),
        name: body.nombre || guest.name, // Opcionalmente actualizar el nombre si lo cambió
      },
    });

    return NextResponse.json(updatedGuest, { status: 200 });
  } catch (error) {
    console.error("Error confirming guest:", error);
    return NextResponse.json({ error: "Error al confirmar asistencia" }, { status: 500 });
  }
}
