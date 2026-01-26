import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        // Get invitation by slug
        const invitation = await prisma.invitation.findUnique({
            where: { slug },
            include: { album: true },
        });

        if (!invitation || !invitation.album) {
            return NextResponse.json(
                { error: "Invitation or album not found" },
                { status: 404 }
            );
        }

        const formData = await request.formData();
        const file = formData.get("photo") as File;
        const uploadedBy = formData.get("uploadedBy") as string;

        if (!file || !uploadedBy) {
            return NextResponse.json(
                { error: "Photo and uploader name are required" },
                { status: 400 }
            );
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
            return NextResponse.json(
                { error: "Only image files are allowed" },
                { status: 400 }
            );
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { error: "File size must be less than 5MB" },
                { status: 400 }
            );
        }

        // Save file to public/uploads
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create unique filename
        const timestamp = Date.now();
        const originalName = file.name.replace(/\s+/g, "-");
        const filename = `${timestamp}-${originalName}`;
        const filepath = path.join(process.cwd(), "public", "uploads", filename);

        await writeFile(filepath, buffer);

        const photoUrl = `/uploads/${filename}`;

        // Create photo record in database
        const photo = await prisma.foto.create({
            data: {
                albumId: invitation.album.id,
                url: photoUrl,
                uploadedBy,
                aprobada: !invitation.album.moderacion, // Auto-approve if moderation is off
            },
        });

        return NextResponse.json({
            success: true,
            photo: {
                id: photo.id,
                url: photo.url,
                uploadedBy: photo.uploadedBy,
                aprobada: photo.aprobada,
            },
        });
    } catch (error) {
        console.error("Error uploading photo:", error);
        return NextResponse.json(
            { error: "Failed to upload photo" },
            { status: 500 }
        );
    }
}
