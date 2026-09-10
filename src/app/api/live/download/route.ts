import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
const { ZipArchive } = require("archiver");
import path from "path";
import fs from "fs";
import { Readable } from "stream";
import { getUploadsDir } from "@/lib/uploads";
import { isAdmin } from "@/lib/roles";
import { buildWatermarkedJpegStream } from "@/lib/liveWatermarkServer";

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

        // El armado del ZIP NO se espera acá: la respuesta se devuelve enseguida
        // (más abajo) y el navegador empieza a bajar mientras esto va sumando
        // fotos. Antes se recorrían las 200 fotos, se apilaban todas en memoria
        // y recién entonces se mandaba el primer byte: un evento grande eran
        // ~400 MB de pico, suficiente para que el contenedor se quede sin
        // memoria y se lleve puesta la app entera.

        // Espera a que el archivador termine de consumir la entrada recién
        // encolada antes de preparar la siguiente. Sin esto se construyen las
        // 200 tuberías de sharp de una, y la memoria termina PEOR que con
        // buffers (medido: 489 MB contra 363 MB con 40 fotos). Encolando de a
        // una, el pico se mantiene plano sin importar cuántas fotos haya.
        //
        // También corta si se cae la salida: si quien descarga cancela a mitad,
        // sin esto el bucle se quedaría esperando un "entry" que ya no va a
        // llegar, reteniendo la foto en curso para siempre.
        const esperarEntrada = () =>
            new Promise<void>((resolve, reject) => {
                const limpiar = () => {
                    archive.off("entry", ok);
                    archive.off("error", fallo);
                    stream.off("close", cortado);
                };
                const ok = () => { limpiar(); resolve(); };
                const fallo = (e: unknown) => { limpiar(); reject(e); };
                const cortado = () => { limpiar(); reject(new Error("descarga cancelada")); };
                archive.once("entry", ok);
                archive.once("error", fallo);
                stream.once("close", cortado);
            });

        const armarZip = async () => {
            for (const item of items) {
                // Si ya nadie está del otro lado, no tiene sentido seguir
                // procesando fotos.
                if (stream.destroyed) return;
                if (!item.fileUrl) continue;

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
                        archive.append(await buildWatermarkedJpegStream(filePath), { name: fileName });
                    } catch (err) {
                        console.error("[live download] fallo watermark, se usa original:", err);
                        archive.file(filePath, { name: fileName });
                    }
                } else {
                    archive.file(filePath, { name: fileName });
                }

                await esperarEntrada();
            }
            await archive.finalize();
        };

        armarZip().catch((err) => {
            // Una cancelación del cliente no es un fallo que valga la pena
            // registrar como error: es el caso normal de alguien que cierra
            // la pestaña a mitad de la descarga.
            if (stream.destroyed) return;
            console.error("[live download] fallo armando el zip:", err);
            stream.destroy(err);
        });

        const filename = `fotos-live-${invitation.nombreEvento || "evento"}.zip`.replace(/[^a-zA-Z0-9.\-]/g, "_");

        const webStream = Readable.toWeb(stream) as unknown as ReadableStream<Uint8Array>;

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
