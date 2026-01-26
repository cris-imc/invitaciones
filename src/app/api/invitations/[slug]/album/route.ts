import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        // Get invitation by slug
        const invitation = await prisma.invitation.findUnique({
            where: { slug },
            include: {
                album: {
                    include: {
                        fotos: {
                            where: { aprobada: true },
                            orderBy: { createdAt: 'desc' },
                        },
                    },
                },
            },
        });

        if (!invitation || !invitation.album) {
            return NextResponse.json(
                { error: "Invitation or album not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            photos: invitation.album.fotos.map((foto) => ({
                id: foto.id,
                url: foto.url,
                uploadedBy: foto.uploadedBy,
                createdAt: foto.createdAt,
            })),
        });
    } catch (error) {
        console.error("Error fetching album photos:", error);
        return NextResponse.json(
            { error: "Failed to fetch photos" },
            { status: 500 }
        );
    }
}
