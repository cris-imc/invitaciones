import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { nanoid } from "nanoid";
import { getEventStatus } from "@/lib/expiration";

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const url = new URL(req.url);
        const invitationId = url.searchParams.get("invitationId");

        if (!invitationId) {
            return new NextResponse("Missing invitationId", { status: 400 });
        }

        // Verify ownership or admin
        const invitation = await prisma.invitation.findUnique({
            where: { id: invitationId },
        });

        if (!invitation) return new NextResponse("Not Found", { status: 404 });
        if (invitation.userId !== session.user.id && session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const liveSession = await prisma.liveSession.findUnique({
            where: { invitationId },
            include: {
                items: {
                    orderBy: { createdAt: "desc" }
                }
            }
        });

        return NextResponse.json(liveSession);
    } catch (error) {
        console.error("[LIVE_SESSION_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { invitationId, action } = body;

        if (!invitationId) {
            return new NextResponse("Missing invitationId", { status: 400 });
        }

        // Verify ownership or admin
        const invitation = await prisma.invitation.findUnique({
            where: { id: invitationId },
        });

        if (!invitation) return new NextResponse("Not Found", { status: 404 });
        if (invitation.userId !== session.user.id && session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        let liveSession = await prisma.liveSession.findUnique({
            where: { invitationId },
        });

        // El LIVE solo se puede ACTIVAR el día del evento, salvo para admins.
        // Apagarlo nunca está restringido.
        const isAdmin = session.user.role === "ADMIN";
        const canActivate = isAdmin || getEventStatus(invitation.fechaEvento) === "EVENT_DAY";

        if (action === "create" && !liveSession) {
            if (!canActivate) {
                return new NextResponse("El LIVE solo se puede activar el día del evento.", { status: 403 });
            }
            liveSession = await prisma.liveSession.create({
                data: {
                    invitationId,
                    publicToken: nanoid(10), // Generates a random 10-char string
                    isActive: true,
                },
            });
        } else if (action === "toggle" && liveSession) {
            const activating = !liveSession.isActive;
            if (activating && !canActivate) {
                return new NextResponse("El LIVE solo se puede activar el día del evento.", { status: 403 });
            }
            liveSession = await prisma.liveSession.update({
                where: { invitationId },
                data: {
                    isActive: !liveSession.isActive,
                },
                include: { items: { orderBy: { createdAt: "desc" } } }
            });
        } else if (action === "toggleModeration" && liveSession) {
            liveSession = await prisma.liveSession.update({
                where: { invitationId },
                data: {
                    isModerated: !liveSession.isModerated,
                },
                include: { items: { orderBy: { createdAt: "desc" } } }
            });
        }

        return NextResponse.json(liveSession);
    } catch (error) {
        console.error("[LIVE_SESSION_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
