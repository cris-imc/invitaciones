import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ token: string }> }) {
    try {
        const { token } = await params;
        const url = new URL(req.url);
        const lastId = url.searchParams.get("lastId");

        if (!token) {
            return new NextResponse("Missing token", { status: 400 });
        }

        const liveSession = await prisma.liveSession.findUnique({
            where: { publicToken: token },
            select: { id: true, isActive: true }
        });

        if (!liveSession || !liveSession.isActive) {
            return new NextResponse("Session not active or not found", { status: 404 });
        }

        // Fetch active items, order desc
        // If lastId is provided, we can fetch items created after that item (if needed for optimization)
        // For simplicity, we just return the latest 50 active items
        const items = await prisma.liveItem.findMany({
            where: {
                sessionId: liveSession.id,
                isActive: true
            },
            orderBy: {
                createdAt: "desc"
            },
            take: 50
        });

        return NextResponse.json(items);
    } catch (error) {
        console.error("[LIVE_PUBLIC_ITEMS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
