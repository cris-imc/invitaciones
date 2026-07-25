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

    const updateData: Record<string, unknown> = {
      name: body.name,
      expectedCount: body.expectedCount,
      status: body.status,
      attendingCount: body.attendingCount,
      message: body.message,
      dietaryRestrictions: body.dietaryRestrictions,
    };

    // Filtrar undefined
    Object.keys(updateData).forEach((k) => {
      if (updateData[k] === undefined) delete updateData[k];
    });

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
