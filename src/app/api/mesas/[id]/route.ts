import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import {
  accesoPorMesa,
  esFormaValida,
  normalizarAlias,
  normalizarPos,
  normalizarSillas,
} from "@/lib/mesas";

// PATCH - Cambia nombre, sillas, forma o posición de una mesa.
//
// Parcial a propósito: arrastrar una mesa manda sólo posX/posY y no tiene por
// qué reenviar el resto, que puede haber cambiado en otra pestaña mientras
// tanto.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth().catch(() => null);
    const { id } = await params;

    const acceso = await accesoPorMesa(id, session);
    if (!acceso.ok) {
      return NextResponse.json({ error: acceso.error }, { status: acceso.status });
    }

    const body = await request.json().catch(() => ({}));
    const data: {
      alias?: string | null;
      sillas?: number;
      forma?: string;
      posX?: number;
      posY?: number;
    } = {};

    // El número no se toca por acá: es la identidad de la mesa el día del
    // evento. Lo que el anfitrión edita es el alias, y borrarlo (mandar vacío)
    // deja la mesa con su número pelado, que es un estado válido.
    if (body.alias !== undefined) data.alias = normalizarAlias(body.alias);
    if (body.sillas !== undefined) data.sillas = normalizarSillas(body.sillas);
    if (body.forma !== undefined && esFormaValida(body.forma)) data.forma = body.forma;
    if (body.posX !== undefined) data.posX = normalizarPos(body.posX, 50);
    if (body.posY !== undefined) data.posY = normalizarPos(body.posY, 50);

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Nada para cambiar" }, { status: 400 });
    }

    // Achicar una mesa no expulsa a nadie: la mesa queda pasada de gente y el
    // panel la marca en rojo. Sacar a alguien es una decisión del anfitrión --
    // el sistema no elige por él a quién dejar afuera.
    const mesa = await prisma.mesa.update({
      where: { id },
      data,
      include: { lugares: { select: { id: true, guestId: true, lugares: true } } },
    });

    return NextResponse.json(mesa);
  } catch (error) {
    console.error("Error al actualizar la mesa:", error);
    return NextResponse.json({ error: "Error al actualizar la mesa" }, { status: 500 });
  }
}

// DELETE - Borra la mesa. Las asignaciones se van con ella (onDelete: Cascade)
// y esa gente vuelve a la lista de "sin ubicar".
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth().catch(() => null);
    const { id } = await params;

    const acceso = await accesoPorMesa(id, session);
    if (!acceso.ok) {
      return NextResponse.json({ error: acceso.error }, { status: acceso.status });
    }

    await prisma.mesa.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error al borrar la mesa:", error);
    return NextResponse.json({ error: "Error al borrar la mesa" }, { status: 500 });
  }
}
