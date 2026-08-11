import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { nanoid } from "nanoid";
import { getEventStatus } from "@/lib/expiration";
import { cleanupExpiredRejectedItems } from "@/lib/live-cleanup";
import { canUseFeature, PlanTier } from "@/lib/plan-limits";

const PAGE_SIZE = 4;
const VALID_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;
type ItemStatus = (typeof VALID_STATUSES)[number];

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const url = new URL(req.url);
        const invitationId = url.searchParams.get("invitationId");
        const statusParam = url.searchParams.get("status");
        const status: ItemStatus = VALID_STATUSES.includes(statusParam as ItemStatus)
            ? (statusParam as ItemStatus)
            : "PENDING";
        const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10) || 1);

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

        const liveSessionBase = await prisma.liveSession.findUnique({
            where: { invitationId },
        });

        if (!liveSessionBase) {
            return NextResponse.json(null);
        }

        // Limpieza perezosa: borra (archivo + registro) las rechazadas de hace
        // más de 1 hora antes de contar/paginar, para que no se acumulen.
        await cleanupExpiredRejectedItems(liveSessionBase.id);

        const [items, total, counts] = await Promise.all([
            prisma.liveItem.findMany({
                where: { sessionId: liveSessionBase.id, status },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * PAGE_SIZE,
                take: PAGE_SIZE,
            }),
            prisma.liveItem.count({ where: { sessionId: liveSessionBase.id, status } }),
            prisma.liveItem.groupBy({
                by: ["status"],
                where: { sessionId: liveSessionBase.id },
                _count: { _all: true },
            }),
        ]);

        const countsByStatus = { PENDING: 0, APPROVED: 0, REJECTED: 0 } as Record<ItemStatus, number>;
        for (const c of counts) {
            if (VALID_STATUSES.includes(c.status as ItemStatus)) {
                countsByStatus[c.status as ItemStatus] = c._count._all;
            }
        }

        return NextResponse.json({
            ...liveSessionBase,
            items,
            pagination: {
                page,
                pageSize: PAGE_SIZE,
                total,
                totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
            },
            counts: countsByStatus,
        });
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
        const status = getEventStatus(invitation.fechaEvento);
        const canActivate = isAdmin || status === "EVENT_DAY" || status === "POST_EVENT";
        const hasLiveFeature = isAdmin || canUseFeature(invitation.planTier as PlanTier, "live");

        if (action === "create" && !liveSession) {
            if (!hasLiveFeature) {
                return new NextResponse("Tu plan no incluye LIVE. Actualizá a Premium para habilitarlo.", { status: 403 });
            }
            if (!canActivate) {
                return new NextResponse("El LIVE solo se puede activar a partir del día del evento.", { status: 403 });
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
            if (activating && !hasLiveFeature) {
                return new NextResponse("Tu plan no incluye LIVE. Actualizá a Premium para habilitarlo.", { status: 403 });
            }
            if (activating && !canActivate) {
                return new NextResponse("El LIVE solo se puede activar el día del evento.", { status: 403 });
            }
            liveSession = await prisma.liveSession.update({
                where: { invitationId },
                data: {
                    isActive: !liveSession.isActive,
                },
            });
        } else if (action === "toggleModeration" && liveSession) {
            liveSession = await prisma.liveSession.update({
                where: { invitationId },
                data: {
                    isModerated: !liveSession.isModerated,
                },
            });
        }

        return NextResponse.json(liveSession);
    } catch (error) {
        console.error("[LIVE_SESSION_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
