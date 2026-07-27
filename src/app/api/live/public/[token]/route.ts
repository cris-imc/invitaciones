import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ token: string }> }) {
    try {
        const { token } = await params;

        if (!token) {
            return new NextResponse("Missing token", { status: 400 });
        }

        const liveSession = await prisma.liveSession.findUnique({
            where: { publicToken: token },
            include: {
                invitation: {
                    select: {
                        nombreEvento: true,
                        temaColores: true
                    }
                }
            }
        });

        if (!liveSession) {
            return new NextResponse("Session not found", { status: 404 });
        }

        return NextResponse.json(liveSession);
    } catch (error) {
        console.error("[LIVE_PUBLIC_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
