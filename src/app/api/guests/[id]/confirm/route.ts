import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST /api/guests/[id]/confirm
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const guest = await prisma.guest.findFirst({
      where: { uniqueToken: id },
    });

    if (!guest) {
      return NextResponse.json({ error: "Invitado no encontrado" }, { status: 404 });
    }

    // Actualizamos el Guest
    const status = body.asistencia === "CONFIRMA" ? "CONFIRMED" : "DECLINED";
    
    // Lógica para paymentStatus si es exento
    let paymentStatus = guest.paymentStatus;
    if (status === "CONFIRMED" && guest.isExempt) {
      paymentStatus = "EXEMPT";
    }

    const updatedGuest = await prisma.guest.update({
      where: { id: guest.id },
      data: {
        status,
        paymentStatus,
        attendingCount: (body.attendingAdults || 0) + (body.attendingTeens || 0) + (body.attendingChildren || 0) > 0
          ? (body.attendingAdults || 0) + (body.attendingTeens || 0) + (body.attendingChildren || 0)
          : (body.numeroAcompanantes !== undefined ? body.numeroAcompanantes + 1 : 1),
        attendingAdults: body.attendingAdults !== undefined ? body.attendingAdults : (body.numeroAcompanantes !== undefined ? body.numeroAcompanantes + 1 : 0),
        attendingTeens: body.attendingTeens || 0,
        attendingChildren: body.attendingChildren || 0,
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
