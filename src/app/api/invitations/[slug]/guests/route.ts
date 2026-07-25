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

        // Primero obtener la invitación para conseguir su ID y plan
        const invitation = await prisma.invitation.findUnique({
            where: { slug },
            select: { id: true, planTier: true, maxGuestsOverride: true }
        });

        if (!invitation) {
            return NextResponse.json(
                { error: "Invitación no encontrada" },
                { status: 404 }
            );
        }

        // Obtener límite de invitados (override o el del plan)
        const { PLAN_LIMITS } = await import("@/lib/plan-limits");
        const planLimit = PLAN_LIMITS[invitation.planTier as keyof typeof PLAN_LIMITS]?.maxGuests;
        const maxGuests = invitation.maxGuestsOverride !== null ? invitation.maxGuestsOverride : planLimit;
        
        // Calcular total actual de invitados esperados
        if (maxGuests !== null) {
            const currentGuests = await prisma.guest.aggregate({
                where: { invitationId: invitation.id },
                _sum: { expectedCount: true }
            });
            
            const totalCurrent = currentGuests._sum.expectedCount || 0;
            const toAdd = body.expectedCount || 1;
            
            if (totalCurrent + toAdd > maxGuests) {
                return NextResponse.json(
                    { error: `Límite de invitados superado (Máximo: ${maxGuests})` },
                    { status: 400 }
                );
            }
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
