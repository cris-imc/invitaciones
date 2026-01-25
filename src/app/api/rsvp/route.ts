import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const rsvp = await prisma.rSVP.create({
            data: {
                invitationId: body.invitationId,
                nombre: body.nombre,
                email: body.email || null,
                telefono: body.telefono || null,
                asistencia: body.asistencia,
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
