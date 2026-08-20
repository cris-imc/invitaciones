import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { deleteLiveItemFile } from "@/lib/live-cleanup";
import { isAdmin } from "@/lib/roles";

const VALID_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;
type ItemStatus = (typeof VALID_STATUSES)[number];

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
        if (invitation.userId !== session.user.id && !isAdmin(session.user.role)) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Borrado real: archivo en disco + registro. Se usa para "Eliminar
        // ahora" (saltea la espera de 1h de la pestaña de Rechazadas).
        await deleteLiveItemFile(liveItem);
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
        const { status } = body as { status?: ItemStatus };

        if (!VALID_STATUSES.includes(status as ItemStatus)) {
            return new NextResponse("Invalid status", { status: 400 });
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
        if (invitation.userId !== session.user.id && !isAdmin(session.user.role)) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const updatedItem = await prisma.liveItem.update({
            where: { id },
            data: {
                status,
                isActive: status === "APPROVED",
                rejectedAt: status === "REJECTED" ? new Date() : null,
            }
        });

        return NextResponse.json(updatedItem);
    } catch (error) {
        console.error("[LIVE_ITEM_PUT]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
