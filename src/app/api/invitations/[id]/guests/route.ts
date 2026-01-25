import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { nanoid } from "nanoid";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> } // Updated for Next.js 15+ async params
) {
    try {
        const { id } = await params;
        const invitationId = id;

        if (!invitationId) {
            return NextResponse.json({ error: "ID de invitación requerido" }, { status: 400 });
        }

        const guests = await prisma.guest.findMany({
            where: { invitationId },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(guests);
    } catch (error) {
        console.error("Error fetching guests:", error);
        return NextResponse.json({ error: "Error al obtener invitados" }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const invitationId = id;
        const body = await request.json();

        // Validar datos básicos
        if (!body.name) {
            return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
        }

        // Generar token único (seguro para URL)
        const uniqueToken = nanoid(10); // Ejemplo: "Please-Help" -> "V1StGXR8_Z"

        const newGuest = await prisma.guest.create({
            data: {
                invitationId,
                name: body.name,
                type: body.type || "INDIVIDUAL",
                expectedCount: body.expectedCount || 1,
                uniqueToken: uniqueToken,
                status: "PENDING"
            }
        });

        return NextResponse.json(newGuest);
    } catch (error) {
        console.error("Error creating guest:", error);
        return NextResponse.json({ error: "Error al crear invitado" }, { status: 500 });
    }
}
