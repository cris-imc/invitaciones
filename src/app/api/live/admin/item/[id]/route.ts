import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;

        if (!id) {
            return new NextResponse("Missing id", { status: 400 });
        }

        const liveItem = await prisma.liveItem.findUnique({
            where: { id },
            include: {
                session: {
                    include: {
                        invitation: true
                    }
                }
            }
        });

        if (!liveItem) {
            return new NextResponse("Not Found", { status: 404 });
        }

        const invitation = liveItem.session.invitation;
        
        // Verify ownership or admin
        if (invitation.userId !== session.user.id && session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Borrado real: "isActive: false" ya lo usa el toggle de "Ocultar" para
        // moderacion (item pendiente/oculto pero visible en el panel), asi que
        // reutilizarlo para "Eliminar" hacia que el item siguiera apareciendo
        // en la lista del admin (con el badge de "Pendiente / Oculto") y
        // volviera a aparecer en cada refresco de polling.
        await prisma.liveItem.delete({ where: { id } });

        return new NextResponse("Deleted", { status: 200 });
    } catch (error) {
        console.error("[LIVE_ITEM_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;

        if (!id) {
            return new NextResponse("Missing id", { status: 400 });
        }

        const body = await req.json();
        const { isActive } = body;

        const liveItem = await prisma.liveItem.findUnique({
            where: { id },
            include: {
                session: {
                    include: {
                        invitation: true
                    }
                }
            }
        });

        if (!liveItem) {
            return new NextResponse("Not Found", { status: 404 });
        }

        const invitation = liveItem.session.invitation;
        
        // Verify ownership or admin
        if (invitation.userId !== session.user.id && session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const updatedItem = await prisma.liveItem.update({
            where: { id },
            data: { isActive: !!isActive }
        });

        return NextResponse.json(updatedItem);
    } catch (error) {
        console.error("[LIVE_ITEM_PUT]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
