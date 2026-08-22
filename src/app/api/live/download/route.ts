import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
const { ZipArchive } = require("archiver");
import path from "path";
import fs from "fs";
import { Readable } from "stream";
import { getUploadsDir } from "@/lib/uploads";
import { isAdmin } from "@/lib/roles";
import { buildWatermarkedJpegBuffer } from "@/lib/liveWatermarkServer";

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
        if (invitation.userId !== session.user.id && !isAdmin(session.user.role)) {
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

        const archive = new ZipArchive({
            zlib: { level: 5 } // Sets the compression level.
        });

        archive.on("error", (err: any) => {
            console.error("Archiver error:", err);
            stream.destroy(err);
        });

        archive.pipe(stream);

        for (const item of items) {
            if (item.fileUrl) {
                // Extraemos el nombre del archivo de la URL (ej: /uploads/123.jpg -> 123.jpg)
                const urlPath = item.fileUrl.split('?')[0];
                const fileName = urlPath.replace("/uploads/", "");
                const filePath = getUploadsDir(fileName);

                if (!fs.existsSync(filePath)) continue;

                if (item.type === "PHOTO") {
                    // Le agregamos el isologotipo de altainvitacion.com antes de
                    // empaquetarla -- mismo criterio visual que al compartir una
                    // foto desde el celular (ver src/lib/liveShare.ts), pero acá
                    // resuelto server-side con sharp porque no hay Canvas/Image
                    // del navegador disponibles en esta ruta.
                    try {
                        const watermarked = await buildWatermarkedJpegBuffer(filePath);
                        archive.append(watermarked, { name: fileName });
                    } catch (err) {
                        console.error("[live download] fallo watermark, se usa original:", err);
                        archive.file(filePath, { name: fileName });
                    }
                } else {
                    archive.file(filePath, { name: fileName });
                }
            }
        }

        archive.finalize();

        const filename = `fotos-live-${invitation.nombreEvento || "evento"}.zip`.replace(/[^a-zA-Z0-9.\-]/g, "_");

        function iteratorToStream(iterator: AsyncIterable<any>) {
            const it = iterator[Symbol.asyncIterator]();
            return new ReadableStream({
                async pull(controller) {
                    const { value, done } = await it.next();
                    if (done) {
                        controller.close();
                    } else {
                        controller.enqueue(new Uint8Array(value));
                    }
                },
            });
        }

        const webStream = iteratorToStream(stream);

        return new NextResponse(webStream as any, {
            headers: {
                "Content-Type": "application/zip",
                "Content-Disposition": `attachment; filename="${filename}"`
            }
        });
    } catch (error: any) {
        console.error("Live download zip error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
