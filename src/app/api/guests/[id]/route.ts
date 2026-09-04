import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/roles";
import {
  PAYMENT_CLEAR_CODE,
  derivePaymentStatus,
  resolveExpectedAmount,
  resolveGuestPayment,
  serializePaidPrices,
} from "@/lib/payments";

// DELETE /api/guests/[id] — Eliminar invitado
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth().catch(() => null);
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const guest = await prisma.guest.findUnique({
      where: { id },
      select: { uniqueToken: true, invitation: { select: { userId: true } } },
    });

    if (!guest) {
      return NextResponse.json({ error: "Invitado no encontrado" }, { status: 404 });
    }

    if (guest.invitation.userId !== session.user.id && !isAdmin(session.user.role)) {
      return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
    }

    // QuizResponse no tiene relacion (ni cascade) con Guest -- sin este borrado
    // manual, las respuestas de trivia de un invitado eliminado quedan
    // huerfanas y siguen contando en el promedio de aciertos.
    await prisma.quizResponse.deleteMany({ where: { guestToken: guest.uniqueToken } });

    await prisma.guest.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting guest:", error);
    return NextResponse.json({ error: "Error al eliminar invitado" }, { status: 500 });
  }
}

// PUT /api/guests/[id] — Actualizar datos del invitado
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth().catch(() => null);
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const existingGuest = await prisma.guest.findUnique({
      where: { id },
      include: {
        invitation: {
          select: {
            userId: true,
            pagoTarjetaMonto: true,
            regaloMonto: true,
            precioAdolescente: true,
            precioNino: true,
          },
        },
      },
    });
    if (!existingGuest) {
      return NextResponse.json({ error: "Invitado no encontrado" }, { status: 404 });
    }

    if (existingGuest.invitation.userId !== session.user.id && !isAdmin(session.user.role)) {
      return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
    }

    const updateData: Record<string, unknown> = {
      name: body.name,
      expectedCount: body.expectedCount,
      expectedAdults: body.expectedAdults,
      expectedTeens: body.expectedTeens,
      expectedChildren: body.expectedChildren,
      status: body.status,
      attendingCount: body.attendingCount,
      attendingAdults: body.attendingAdults,
      attendingTeens: body.attendingTeens,
      attendingChildren: body.attendingChildren,
      isExempt: body.isExempt,
      message: body.message,
      dietaryRestrictions: body.dietaryRestrictions,
    };

    // Filtrar undefined
    Object.keys(updateData).forEach((k) => {
      if (updateData[k] === undefined) delete updateData[k];
    });

    // Pago de tarjeta: el estado sale del monto abonado (ver src/lib/payments.ts).
    // Marcar exento borra lo abonado -- ese invitado no paga; sacarle la exención
    // lo devuelve al estado que le corresponda según lo que efectivamente pagó.
    let paidAmount = resolveGuestPayment(existingGuest, existingGuest.invitation).paidAmount;
    let isExempt = existingGuest.isExempt;

    if (body.isExempt !== undefined) {
      isExempt = Boolean(body.isExempt);
      if (isExempt) {
        // Sin historial de pagos, poner el monto en cero es irreversible: hay
        // que confirmarlo explícitamente antes de perder lo que el invitado ya
        // entregó.
        if (paidAmount > 0 && body.confirmClearPayment !== true) {
          return NextResponse.json(
            {
              error: `Este invitado tiene ${paidAmount} registrado como abonado. Marcarlo exento lo borra.`,
              code: PAYMENT_CLEAR_CODE,
              paidAmount,
            },
            { status: 409 }
          );
        }
        paidAmount = 0;
        updateData.paidAmount = 0;
      }
    }

    // Si confirma/declina, registrar fecha de respuesta
    if (body.status && (body.status === "CONFIRMED" || body.status === "DECLINED")) {
      updateData.responseDate = new Date();
    }

    // El dueño de la tarjeta puede editar la cantidad de invitados de un
    // invitado que ya confirmó (antes esto estaba bloqueado). Si la nueva
    // cantidad esperada queda por DEBAJO de lo que el invitado ya había
    // confirmado, esa confirmación ya no es válida -- se resetea a PENDING
    // para que tenga que volver a confirmar (con el nuevo tope). Si el
    // dueño aumenta el cupo, el invitado conserva su confirmación y puede
    // entrar a su link a subir la cantidad hasta el nuevo máximo.
    if (
      body.expectedCount !== undefined &&
      existingGuest.status === "CONFIRMED" &&
      body.expectedCount < existingGuest.attendingCount
    ) {
      updateData.status = "PENDING";
      updateData.attendingCount = 0;
      updateData.attendingAdults = 0;
      updateData.attendingTeens = 0;
      updateData.attendingChildren = 0;
      updateData.responseDate = null;
    }

    // Si el invitado queda confirmado, el monto esperado se recalcula con las
    // cantidades finales y se congela, y el estado de pago se re-deriva: editar
    // la cantidad de personas de una familia cambia lo que le toca pagar, y un
    // pago parcial ya recibido puede quedar cubierto (PAID) o seguir corto
    // (PARTIAL) sin que nadie tenga que corregirlo a mano.
    const finalStatus = (updateData.status as string | undefined) ?? existingGuest.status;
    if (finalStatus === "CONFIRMED") {
      const expectedAmount = resolveExpectedAmount({
        guest: {
          attendingCount: (updateData.attendingCount as number | undefined) ?? existingGuest.attendingCount,
          attendingAdults: (updateData.attendingAdults as number | undefined) ?? existingGuest.attendingAdults,
          attendingTeens: (updateData.attendingTeens as number | undefined) ?? existingGuest.attendingTeens,
          attendingChildren: (updateData.attendingChildren as number | undefined) ?? existingGuest.attendingChildren,
        },
        invitation: existingGuest.invitation,
        paidPrices: existingGuest.paidPrices,
      });
      const nextStatus = derivePaymentStatus({ paidAmount, expectedAmount, isExempt });
      updateData.paidAmount = paidAmount;
      updateData.paymentStatus = nextStatus;
      updateData.expectedAmount = nextStatus === "PAID" ? expectedAmount : null;
      // Si queda pago y todavía no tenía congelamiento (por ejemplo, venía de un
      // parcial y el anfitrión bajó la cantidad hasta cubrirlo), se congela acá.
      // Un congelamiento existente NO se reescribe: eso achicaría los cupos ya
      // pagos y le sacaría la protección si después vuelve a sumar gente.
      if (nextStatus === "PAID" && !existingGuest.paidPrices) {
        updateData.paidPrices = serializePaidPrices(existingGuest.invitation, {
          attendingCount: (updateData.attendingCount as number | undefined) ?? existingGuest.attendingCount,
          attendingAdults: (updateData.attendingAdults as number | undefined) ?? existingGuest.attendingAdults,
          attendingTeens: (updateData.attendingTeens as number | undefined) ?? existingGuest.attendingTeens,
          attendingChildren: (updateData.attendingChildren as number | undefined) ?? existingGuest.attendingChildren,
        });
      }
      // Marcar exento descarta el congelamiento: ya no hay pago que proteger.
      if (isExempt) updateData.paidPrices = null;
    } else if (body.isExempt !== undefined) {
      updateData.paymentStatus = derivePaymentStatus({
        paidAmount,
        expectedAmount: existingGuest.expectedAmount,
        isExempt,
      });
    }

    const updatedGuest = await prisma.guest.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedGuest);
  } catch (error) {
    console.error("Error updating guest:", error);
    return NextResponse.json({ error: "Error al actualizar invitado" }, { status: 500 });
  }
}
