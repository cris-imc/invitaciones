import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/roles";

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
      include: { invitation: { select: { userId: true } } },
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

    // Lógica para paymentStatus al cambiar isExempt
    if (body.isExempt !== undefined) {
      if (body.isExempt === true) {
        updateData.paymentStatus = "EXEMPT";
      } else if (body.isExempt === false && existingGuest.paymentStatus === "EXEMPT") {
        updateData.paymentStatus = "PENDING";
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
