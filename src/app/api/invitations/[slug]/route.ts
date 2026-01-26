import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Obtener invitación por slug (pública)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
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
                rsvps: {
                    select: {
                        id: true,
                        nombre: true,
                        asistencia: true,
                        numeroAcompanantes: true,
                    },
                },
            },
        });

        if (!invitation) {
            return NextResponse.json(
                { error: 'Invitación no encontrada' },
                { status: 404 }
            );
        }

        return NextResponse.json(invitation);
    } catch (error) {
        console.error('Error fetching invitation:', error);
        return NextResponse.json(
            { error: 'Error al obtener invitación' },
            { status: 500 }
        );
    }
}
// PATCH - Actualizar invitación (edición visual)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const body = await request.json();

        const invitation = await prisma.invitation.update({
            where: { slug },
            data: body,
        });

        return NextResponse.json(invitation);
    } catch (error) {
        console.error('Error updating invitation:', error);
        return NextResponse.json(
            { error: 'Error al actualizar invitación' },
            { status: 500 }
        );
    }
}