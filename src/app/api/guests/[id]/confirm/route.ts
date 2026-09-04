import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  computeExpectedAmount,
  derivePaymentStatus,
  resolveExpectedAmount,
  resolveGuestPayment,
} from "@/lib/payments";

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

    // El monto esperado se recalcula con lo que acaba de confirmar: cambiar la
    // cantidad de personas cambia lo que le toca pagar. Lo ya abonado se
    // conserva, así que si una familia pagó una parte y después suma o resta
    // gente, el estado se reacomoda solo: sigue PARTIAL, o pasa a PAID si lo
    // entregado ya cubre el nuevo total.
    //
    // El total se congela SOLO si queda pago (ver resolveExpectedAmount): al que
    // debe saldo tiene que alcanzarlo un aumento posterior del precio.
    const paidAmount = resolveGuestPayment(guest, guest.invitation).paidAmount;
    const isExempt = guest.isExempt;

    let paymentStatus = guest.paymentStatus;
    let expectedAmount = guest.expectedAmount;

    if (status === "CONFIRMED") {
      const liveExpected = computeExpectedAmount(
        { attendingCount, attendingAdults, attendingTeens, attendingChildren },
        guest.invitation
      );
      const resolvedExpected = resolveExpectedAmount({
        frozenExpected: guest.expectedAmount,
        liveExpected,
        paidAmount,
      });
      paymentStatus = derivePaymentStatus({ paidAmount, expectedAmount: resolvedExpected, isExempt });
      expectedAmount = paymentStatus === "PAID" ? resolvedExpected : null;
    }

    const updatedGuest = await prisma.guest.update({
      where: { id: guest.id },
      data: {
        status,
        paymentStatus,
        paidAmount,
        expectedAmount,
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
