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

            const invitationsData = await prisma.invitation.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                include: {
                    guests: {
                        where: {
                            status: 'CONFIRMED'
                        },
                        select: {
                            attendingCount: true
                        }
                    }
                }
            });

            // Calculate total confirmed guests count (sum of attendingCount)
            const invitations = invitationsData.map(inv => ({
                ...inv,
                _count: {
                    guests: inv.guests.reduce((sum, g) => sum + (g.attendingCount || 0), 0)
                },
                guests: undefined // Remove detailed list to keep response light
            }));

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
        console.log('DEBUG: POST /api/invitations body:', JSON.stringify(body, null, 2));

        // TODO: Obtener userId de la sesión
        const userId = "mock-user-id";

        // Generar slug único
        const slug = `${body.nombreEvento.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

        // Combinar fecha y hora correctamente preservando la zona horaria local
        let fechaEvento: Date;
        if (body.hora) {
            // Si hay hora, combinar fecha + hora
            const [hours, minutes] = body.hora.split(':');
            const dateStr = body.fecha; // "YYYY-MM-DD"
            const [year, month, day] = dateStr.split('-').map(Number);
            // Crear fecha en zona horaria local
            fechaEvento = new Date(year, month - 1, day, parseInt(hours), parseInt(minutes), 0);
        } else {
            // Si no hay hora, usar solo la fecha a medianoche local
            const dateStr = body.fecha;
            const [year, month, day] = dateStr.split('-').map(Number);
            fechaEvento = new Date(year, month - 1, day, 0, 0, 0);
        }

        const invitation = await prisma.invitation.create({
            data: {
                userId,
                tipo: body.type || 'CASAMIENTO',
                estado: 'ACTIVA',
                slug,
                nombreEvento: body.nombreEvento,
                fechaEvento,
                nombreNovio: body.nombreNovio,
                nombreNovia: body.nombreNovia,
                nombreQuinceanera: body.nombreQuinceanera,
                lugarNombre: body.lugarNombre,
                direccion: body.direccion,
                hora: body.hora,
                mapUrl: body.mapUrl,
                templateId: 'default',
                templateTipo: body.templateTipo || 'ORIGINAL',
                temaColores: JSON.stringify({
                    colorPrincipal: body.colorPrincipal || '#000000',
                    tema: body.tema || 'moderno',
                    layout: body.layout || 'classic',
                    fontFamily: body.fontFamily,
                    fontScale: body.fontScale,
                    primaryColor: body.primaryColor,
                    backgroundColor: body.backgroundColor,
                    textDark: body.textDark,
                    textLight: body.textLight,
                    textSecondary: body.textSecondary,
                    sectionSpacing: body.sectionSpacing,
                    sectionPadding: body.sectionPadding,
                    letterSpacing: body.letterSpacing,
                    lineHeight: body.lineHeight,
                }),
                cronogramaEventos: body.cronogramaEventos || '[]',
                imagenCelebremosJuntos: body.imagenCelebremosJuntos,
                // 1. PORTADA
                portadaHabilitada: body.portadaHabilitada !== undefined ? body.portadaHabilitada : true,
                portadaTitulo: body.portadaTitulo,
                portadaTextoBoton: body.portadaTextoBoton,
                portadaImagenFondo: body.portadaImagenFondo,

                // 8. GALERÍA PRINCIPAL
                galeriaPrincipalHabilitada: body.galeriaPrincipalHabilitada !== undefined ? body.galeriaPrincipalHabilitada : true,
                galeriaPrincipalFotos: body.galeriaPrincipalFotos ? JSON.stringify(body.galeriaPrincipalFotos) : '[]',

                // 12. GALERÍA SECUNDARIA
                galeriaSecundariaHabilitada: body.galeriaSecundariaHabilitada !== undefined ? body.galeriaSecundariaHabilitada : false,
                galeriaSecundariaFotos: body.galeriaSecundariaFotos ? JSON.stringify(body.galeriaSecundariaFotos) : '[]',

                // 11. REGALO
                regaloHabilitado: body.regaloHabilitado !== undefined ? body.regaloHabilitado : false,
                regaloTitulo: body.regaloTitulo,
                regaloMensaje: body.regaloMensaje,
                regaloMostrarDatos: body.regaloMostrarDatos,
                regaloCbu: body.regaloCbu,
                regaloAlias: body.regaloAlias,
                regaloBanco: body.regaloBanco,
                regaloTitular: body.regaloTitular,

                // 2. MÚSICA
                musicaHabilitada: body.musicaHabilitada !== undefined ? body.musicaHabilitada : false,
                musicaAutoplay: body.musicaAutoplay !== undefined ? body.musicaAutoplay : false,
                musicaLoop: body.musicaLoop !== undefined ? body.musicaLoop : true,
                musicaUrl: body.musicaUrl,

                // 3. TRIVIA
                triviaHabilitada: body.triviaHabilitada !== undefined ? body.triviaHabilitada : false,
                triviaIcono: body.triviaIcono,
                triviaTitulo: body.triviaTitulo,
                triviaSubtitulo: body.triviaSubtitulo,
                triviaPreguntas: body.triviaPreguntas,

                // RSVP
                rsvpDaysBeforeEvent: body.rsvpDaysBeforeEvent || 7,

                // Crear álbum automáticamente
                album: {
                    create: {
                        permitirSubida: true,
                        moderacion: false,
                    },
                },
            } as any, // Cast to any because Prisma Client might be stale due to file locks
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

        // Combinar fecha y hora correctamente preservando la zona horaria local
        let fechaEvento: Date;
        if (body.hora) {
            // Si hay hora, combinar fecha + hora
            const [hours, minutes] = body.hora.split(':');
            const dateStr = body.fecha; // "YYYY-MM-DD"
            const [year, month, day] = dateStr.split('-').map(Number);
            // Crear fecha en zona horaria local
            fechaEvento = new Date(year, month - 1, day, parseInt(hours), parseInt(minutes), 0);
        } else {
            // Si no hay hora, usar solo la fecha a medianoche local
            const dateStr = body.fecha;
            const [year, month, day] = dateStr.split('-').map(Number);
            fechaEvento = new Date(year, month - 1, day, 0, 0, 0);
        }

        const invitation = await prisma.invitation.update({
            where: { id },
            data: {
                tipo: body.type || 'CASAMIENTO',
                nombreEvento: body.nombreEvento,
                fechaEvento,
                nombreNovio: body.nombreNovio || null,
                nombreNovia: body.nombreNovia || null,
                nombreQuinceanera: body.nombreQuinceanera || null,
                lugarNombre: body.lugarNombre || null,
                direccion: body.direccion || null,
                hora: body.hora || null,
                mapUrl: body.mapUrl || null,
                musicaUrl: body.musicaUrl || null,
                slug, // Nuevo slug
                templateTipo: body.templateTipo || 'ORIGINAL',
                temaColores: JSON.stringify({
                    colorPrincipal: body.colorPrincipal || '#000000',
                    tema: body.tema || 'moderno',
                    layout: body.layout || 'classic',
                    fontFamily: body.fontFamily,
                    fontScale: body.fontScale,
                    primaryColor: body.primaryColor,
                    backgroundColor: body.backgroundColor,
                    textDark: body.textDark,
                    textLight: body.textLight,
                    textSecondary: body.textSecondary,
                    sectionSpacing: body.sectionSpacing,
                    sectionPadding: body.sectionPadding,
                    letterSpacing: body.letterSpacing,
                    lineHeight: body.lineHeight,
                }),
                cronogramaEventos: body.cronogramaEventos,
                imagenCelebremosJuntos: body.imagenCelebremosJuntos,

                // 1. PORTADA
                portadaHabilitada: body.portadaHabilitada,
                portadaTitulo: body.portadaTitulo,
                portadaTextoBoton: body.portadaTextoBoton,
                portadaImagenFondo: body.portadaImagenFondo,

                // 8. GALERÍA PRINCIPAL
                galeriaPrincipalHabilitada: body.galeriaPrincipalHabilitada,
                galeriaPrincipalFotos: body.galeriaPrincipalFotos ? JSON.stringify(body.galeriaPrincipalFotos) : undefined,

                // 12. GALERÍA SECUNDARIA
                galeriaSecundariaHabilitada: body.galeriaSecundariaHabilitada,
                galeriaSecundariaFotos: body.galeriaSecundariaFotos ? JSON.stringify(body.galeriaSecundariaFotos) : undefined,

                // 11. REGALO
                regaloHabilitado: body.regaloHabilitado,
                regaloTitulo: body.regaloTitulo,
                regaloMensaje: body.regaloMensaje,
                regaloMostrarDatos: body.regaloMostrarDatos,
                regaloCbu: body.regaloCbu,
                regaloAlias: body.regaloAlias,
                regaloBanco: body.regaloBanco,
                regaloTitular: body.regaloTitular,


                // 2. MÚSICA
                musicaHabilitada: body.musicaHabilitada,
                musicaAutoplay: body.musicaAutoplay,
                musicaLoop: body.musicaLoop,

                // 3. TRIVIA
                triviaHabilitada: body.triviaHabilitada,
                triviaIcono: body.triviaIcono,
                triviaTitulo: body.triviaTitulo,
                triviaSubtitulo: body.triviaSubtitulo,
                triviaPreguntas: body.triviaPreguntas,
            } as any,
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
