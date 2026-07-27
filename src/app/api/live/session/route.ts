import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { nanoid } from "nanoid";

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
                    where: { isActive: true },
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

        if (action === "create" && !liveSession) {
            liveSession = await prisma.liveSession.create({
                data: {
                    invitationId,
                    publicToken: nanoid(10), // Generates a random 10-char string
                    isActive: true,
                },
            });
        } else if (action === "toggle" && liveSession) {
            liveSession = await prisma.liveSession.update({
                where: { invitationId },
                data: {
                    isActive: !liveSession.isActive,
                },
            });
        }

        return NextResponse.json(liveSession);
    } catch (error) {
        console.error("[LIVE_SESSION_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
