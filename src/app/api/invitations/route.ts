import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Obtener invitaciones del usuario o invitación pública por slug
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (slug) {
        // Obtener invitación pública por slug
        try {
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
    } else {
        // Obtener invitaciones del usuario
        try {
            // TODO: Obtener userId de la sesión cuando tengamos auth
            const userId = "mock-user-id";

            const invitations = await prisma.invitation.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: {
                            rsvps: {
                                where: {
                                    asistencia: 'CONFIRMA'
                                }
                            }
                        }
                    }
                }
            });

            return NextResponse.json(invitations);
        } catch (error) {
            console.error('Error fetching invitations:', error);
            return NextResponse.json(
                { error: 'Error al obtener invitaciones' },
                { status: 500 }
            );
        }
    }
}

// POST - Crear nueva invitación
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // TODO: Obtener userId de la sesión
        const userId = "mock-user-id";

        // Generar slug único
        const slug = `${body.nombreEvento.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

        const invitation = await prisma.invitation.create({
            data: {
                userId,
                tipo: body.type || 'CASAMIENTO',
                estado: 'ACTIVA',
                slug,
                nombreEvento: body.nombreEvento,
                fechaEvento: new Date(body.fecha),
                nombreNovio: body.nombreNovio,
                nombreNovia: body.nombreNovia,
                nombreQuinceanera: body.nombreQuinceanera,
                lugarNombre: body.lugarNombre,
                direccion: body.direccion,
                hora: body.hora,
                mapUrl: body.mapUrl,
                templateId: 'default',
                temaColores: JSON.stringify({
                    colorPrincipal: body.colorPrincipal || '#000000',
                    tema: body.tema || 'moderno',
                }),
                musicaUrl: body.musicaUrl,
                // Crear álbum automáticamente
                album: {
                    create: {
                        permitirSubida: true,
                        moderacion: false,
                    },
                },
            },
            include: {
                album: true,
            },
        });

        return NextResponse.json(invitation, { status: 201 });
    } catch (error) {
        console.error('Error creating invitation:', error);
        console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
        return NextResponse.json(
            {
                error: 'Error al crear invitación',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

// PUT - Actualizar invitación por ID
export async function PUT(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'ID de invitación requerido' },
                { status: 400 }
            );
        }

        const body = await request.json();

        // Generar nuevo slug si cambió el nombre del evento
        const slug = `${body.nombreEvento.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

        const invitation = await prisma.invitation.update({
            where: { id },
            data: {
                tipo: body.type || 'CASAMIENTO',
                nombreEvento: body.nombreEvento,
                fechaEvento: new Date(body.fecha),
                nombreNovio: body.nombreNovio || null,
                nombreNovia: body.nombreNovia || null,
                nombreQuinceanera: body.nombreQuinceanera || null,
                lugarNombre: body.lugarNombre || null,
                direccion: body.direccion || null,
                hora: body.hora || null,
                mapUrl: body.mapUrl || null,
                musicaUrl: body.musicaUrl || null,
                slug, // Nuevo slug
                temaColores: JSON.stringify({
                    colorPrincipal: body.colorPrincipal || '#000000',
                    tema: body.tema || 'moderno',
                }),
            },
            include: {
                album: true,
            },
        });

        return NextResponse.json(invitation);
    } catch (error) {
        console.error('Error updating invitation:', error);
        console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
        return NextResponse.json(
            {
                error: 'Error al actualizar invitación',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

// DELETE - Eliminar invitación por slug
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');

        if (!slug) {
            return NextResponse.json(
                { error: 'Slug de invitación requerido' },
                { status: 400 }
            );
        }

        // TODO: Verificar que el usuario sea dueño de la invitación
        const invitation = await prisma.invitation.findUnique({
            where: { slug },
            select: { id: true }
        });

        if (!invitation) {
            return NextResponse.json(
                { error: 'Invitación no encontrada' },
                { status: 404 }
            );
        }

        // Eliminar la invitación (cascade eliminará album, fotos, rsvps, etc)
        await prisma.invitation.delete({
            where: { slug },
        });

        return NextResponse.json({ message: 'Invitación eliminada exitosamente' });
    } catch (error) {
        console.error('Error deleting invitation:', error);
        return NextResponse.json(
            { error: 'Error al eliminar invitación' },
            { status: 500 }
        );
    }
}
