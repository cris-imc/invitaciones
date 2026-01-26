import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { randomBytes } from "crypto";

// GET - Obtener todos los invitados de una invitación
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        // Primero obtener la invitación para conseguir su ID
        const invitation = await prisma.invitation.findUnique({
            where: { slug },
            select: { id: true }
        });

        if (!invitation) {
            return NextResponse.json(
                { error: "Invitación no encontrada" },
                { status: 404 }
            );
        }

        const guests = await prisma.guest.findMany({
            where: { invitationId: invitation.id },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(guests);
    } catch (error) {
        console.error("Error fetching guests:", error);
        return NextResponse.json(
            { error: "Error al obtener invitados" },
            { status: 500 }
        );
    }
}

// POST - Agregar un nuevo invitado
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const body = await request.json();

        // Primero obtener la invitación para conseguir su ID
        const invitation = await prisma.invitation.findUnique({
            where: { slug },
            select: { id: true }
        });

        if (!invitation) {
            return NextResponse.json(
                { error: "Invitación no encontrada" },
                { status: 404 }
            );
        }

        // Generar token único para el invitado
        const uniqueToken = randomBytes(16).toString("hex");

        const newGuest = await prisma.guest.create({
            data: {
                invitationId: invitation.id,
                name: body.name,
                type: body.type || "INDIVIDUAL",
                expectedCount: body.expectedCount || 1,
                uniqueToken,
                status: "PENDING",
                attendingCount: 0
            }
        });

        return NextResponse.json(newGuest);
    } catch (error) {
        console.error("Error creating guest:", error);
        return NextResponse.json(
            { error: "Error al crear invitado" },
            { status: 500 }
        );
    }
}
