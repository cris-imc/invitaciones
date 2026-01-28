import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ guestId: string }> }
) {
    try {
        const { guestId } = await params;

        await prisma.guest.delete({
            where: { id: guestId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting guest:", error);
        return NextResponse.json({ error: "Error al eliminar invitado" }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ guestId: string }> }
) {
    try {
        const { guestId } = await params;
        const body = await request.json();

        const updateData: any = {
            // Permitir actualizar nombre, cantidad esperada, o estado
            name: body.name,
            expectedCount: body.expectedCount,
            status: body.status,
            attendingCount: body.attendingCount,
            message: body.message
        };

        // Si se está confirmando (status cambia), registrar fecha de respuesta
        if (body.status && (body.status === "CONFIRMED" || body.status === "DECLINED")) {
            updateData.responseDate = new Date();
        }

        const updatedGuest = await prisma.guest.update({
            where: { id: guestId },
            data: updateData
        });

        return NextResponse.json(updatedGuest);
    } catch (error) {
        console.error("Error updating guest:", error);
        return NextResponse.json({ error: "Error al actualizar invitado" }, { status: 500 });
    }
}
