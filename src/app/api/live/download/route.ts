import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import archiver from "archiver";
import path from "path";
import fs from "fs";

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
        });

        if (!liveSession) {
            return new NextResponse("Live session not found", { status: 404 });
        }

        const items = await prisma.liveItem.findMany({
            where: { 
                sessionId: liveSession.id, 
                status: "APPROVED" 
            },
        });

        if (items.length === 0) {
            return new NextResponse("No approved items found to download", { status: 404 });
        }

        // Create a PassThrough stream to pipe the archiver output
        const { PassThrough } = require("stream");
        const stream = new PassThrough();

        const archive = archiver("zip", {
            zlib: { level: 5 } // Sets the compression level.
        });

        archive.on("error", (err) => {
            console.error("Archiver error:", err);
            stream.destroy(err);
        });

        archive.pipe(stream);

        for (const item of items) {
            if (item.fileUrl) {
                // Remove query strings if any, e.g. /uploads/file.jpg?v=1
                const urlPath = item.fileUrl.split('?')[0];
                const filePath = path.join(process.cwd(), "public", urlPath);
                
                if (fs.existsSync(filePath)) {
                    const filename = path.basename(filePath);
                    archive.file(filePath, { name: filename });
                }
            }
        }

        archive.finalize();

        const filename = `fotos-live-${invitation.nombreEvento || "evento"}.zip`.replace(/[^a-zA-Z0-9.\-]/g, "_");

        return new NextResponse(stream as any, {
            headers: {
                "Content-Type": "application/zip",
                "Content-Disposition": `attachment; filename="${filename}"`
            }
        });
    } catch (error) {
        console.error("Live download zip error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
