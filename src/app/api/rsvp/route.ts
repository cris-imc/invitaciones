import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const { PLAN_LIMITS } = await import("@/lib/plan-limits");
        const invitation = await prisma.invitation.findUnique({
            where: { id: body.invitationId },
            select: { planTier: true, maxGuestsOverride: true }
        });
        
        if (invitation) {
            const planLimit = PLAN_LIMITS[invitation.planTier as keyof typeof PLAN_LIMITS]?.maxGuests;
            const maxGuests = invitation.maxGuestsOverride !== null ? invitation.maxGuestsOverride : planLimit;
            
            if (maxGuests !== null) {
                // Calculate current RSVPs (assuming 1 for the person + numeroAcompanantes)
                const currentRSVPs = await prisma.rSVP.aggregate({
                    where: { invitationId: body.invitationId, asistencia: "CONFIRMA" },
                    _sum: { numeroAcompanantes: true },
                    _count: { id: true }
                });
                const totalCurrent = (currentRSVPs._sum?.numeroAcompanantes || 0) + (currentRSVPs._count?.id || 0);
                const toAdd = body.asistencia ? 1 + (body.numeroAcompanantes || 0) : 0;
                
                if (totalCurrent + toAdd > maxGuests) {
                    return NextResponse.json(
                        { error: `Lo sentimos, la capacidad máxima (${maxGuests} invitados) ha sido alcanzada.` },
                        { status: 400 }
                    );
                }
            }
        }

        const rsvp = await prisma.rSVP.create({
            data: {
                invitationId: body.invitationId,
                nombre: body.nombre,
                email: body.email || null,
                telefono: body.telefono || null,
                asistencia: body.asistencia ? "CONFIRMA" : "NO_ASISTE",
                numeroAcompanantes: body.numeroAcompanantes || 0,
                mensaje: body.mensaje || null,
            },
        });

        return NextResponse.json(rsvp, { status: 201 });
    } catch (error) {
        console.error('Error creating RSVP:', error);
        return NextResponse.json(
            { error: 'Error al guardar la confirmación' },
            { status: 500 }
        );
    }
}
