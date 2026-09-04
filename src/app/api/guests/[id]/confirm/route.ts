import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { resolveCardPayment } from "@/lib/card-payments";

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
      include: {
        invitation: {
          select: {
            pagoTarjetaMonto: true,
            regaloMonto: true,
            precioAdolescente: true,
            precioNino: true,
          },
        },
      },
    });

    if (!guest) {
      return NextResponse.json({ error: "Invitado no encontrado" }, { status: 404 });
    }

    // Actualizamos el Guest
    const status = body.asistencia === "CONFIRMA" ? "CONFIRMED" : "DECLINED";

    const attendingAdults = body.attendingAdults !== undefined
      ? body.attendingAdults
      : (body.numeroAcompanantes !== undefined ? body.numeroAcompanantes + 1 : 0);
    const attendingTeens = body.attendingTeens || 0;
    const attendingChildren = body.attendingChildren || 0;
    const attendingCount = attendingAdults + attendingTeens + attendingChildren > 0
      ? attendingAdults + attendingTeens + attendingChildren
      : (body.numeroAcompanantes !== undefined ? body.numeroAcompanantes + 1 : 1);

    // El estado de pago se recalcula con las cantidades que acaba de confirmar.
    // Los cupos ya marcados como pagos no se tocan: si suma gente, esos lugares
    // nuevos quedan pendientes y la tarjeta vuelve a "parcial". Sin esto, un
    // invitado que sumaba a alguien despues de pagar seguia viendo "Tarjeta
    // abonada", porque el estado guardado quedaba viejo.
    let paymentStatus = guest.paymentStatus;
    if (status === "CONFIRMED") {
      paymentStatus = resolveCardPayment(
        { ...guest, attendingCount, attendingAdults, attendingTeens, attendingChildren },
        guest.invitation
      ).status;
    }

    const updatedGuest = await prisma.guest.update({
      where: { id: guest.id },
      data: {
        status,
        paymentStatus,
        attendingCount,
        attendingAdults,
        attendingTeens,
        attendingChildren,
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
