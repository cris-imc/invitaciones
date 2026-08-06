import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

// DELETE /api/guests/[id] — Eliminar invitado
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const guest = await prisma.guest.findUnique({ where: { id }, select: { uniqueToken: true } });

    // QuizResponse no tiene relacion (ni cascade) con Guest -- sin este borrado
    // manual, las respuestas de trivia de un invitado eliminado quedan
    // huerfanas y siguen contando en el promedio de aciertos.
    if (guest) {
      await prisma.quizResponse.deleteMany({ where: { guestToken: guest.uniqueToken } });
    }

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
  try {
    const { id } = await params;
    const body = await request.json();

    const existingGuest = await prisma.guest.findUnique({ where: { id } });
    if (!existingGuest) {
      return NextResponse.json({ error: "Invitado no encontrado" }, { status: 404 });
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
