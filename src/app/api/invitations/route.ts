import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { checkPlanLimits } from '@/lib/plan-limits';
import type { PlanTier } from '@/lib/plan-limits';
import { checkAndCleanupIfExpired, isEventDateLocked } from '@/lib/expiration-server';
import { slugify } from '@/lib/slugify';

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
            const session = await auth();
            
            if (!session?.user || !session.user.id) {
                return NextResponse.json(
                    { error: 'No autenticado' },
                    { status: 401 }
                );
            }

            const userId = session.user.id;

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
        const session = await auth();
        
        if (!session?.user || !session.user.id) {
            return NextResponse.json(
                { error: 'No autenticado' },
                { status: 401 }
            );
        }

        const userId = session.user.id;
        const planTier = session.user.planTier;

        const body = await request.json();
        console.log('DEBUG: POST /api/invitations body:', JSON.stringify(body, null, 2));

        let invitationPlanTier = 'FREE';
        const hasUnlimitedPremium = planTier === 'PREMIUM' || planTier === 'ENTERPRISE' || planTier === 'ADMIN';

        if (body.usePremiumCredit) {
            if (!hasUnlimitedPremium) {
                // Chequeo rápido para devolver 403 antes de armar la invitación.
                // El descuento real y atómico pasa dentro de la transacción de
                // creación más abajo, para no perder el crédito si la creación falla.
                const user = await prisma.user.findUnique({
                    where: { id: userId },
                    select: { premiumCredits: true }
                });

                if (!user || user.premiumCredits <= 0) {
                    return NextResponse.json(
                        { error: 'No tienes créditos premium disponibles' },
                        { status: 403 }
                    );
                }
            }

            invitationPlanTier = 'PREMIUM';
        } else {
            // Check if user can create more invitations on their base plan
            const currentInvitationsCount = await prisma.invitation.count({
                where: { userId, estado: 'ACTIVA' }
            });

            const limitError = await checkPlanLimits(
                userId,
                planTier,
                'create-invitation',
                currentInvitationsCount
            );

            if (limitError) {
                return NextResponse.json(
                    { error: limitError.message },
                    { status: 403 }
                );
            }
        }

        // Generar slug único (sanitizado: solo minúsculas, números y guiones,
        // sin acentos ni símbolos, para que el ruteo dinámico de Next.js
        // siempre pueda resolverlo correctamente)
        const slugBase = slugify(String(body.nombreEvento || '')) || 'invitacion';
        const slug = `${slugBase}-${Date.now()}`;

        // Combinar fecha y hora correctamente preservando la zona horaria local
        let fechaEvento: Date;
        try {
            if (body.fecha) {
                const dateStr = String(body.fecha);
                if (dateStr.includes('-') && body.hora && typeof body.hora === 'string' && body.hora.includes(':')) {
                    const datePart = dateStr.split('T')[0];
                    const [hours, minutes] = body.hora.split(':');
                    const [year, month, day] = datePart.split('-').map(Number);
                    fechaEvento = new Date(year, month - 1, day, parseInt(hours || '0'), parseInt(minutes || '0'), 0);
                } else {
                    fechaEvento = new Date(body.fecha);
                }
            } else {
                fechaEvento = new Date();
            }
            if (isNaN(fechaEvento.getTime())) {
                fechaEvento = new Date();
            }
        } catch {
            fechaEvento = new Date();
        }

        // Solo marca premiumCreditSpent cuando realmente se descontó un
        // crédito (no para cuentas con plan ilimitado) — así el refund al
        // borrar la invitación (deleteInvitation) sabe si corresponde o no.
        const willSpendCredit = Boolean(body.usePremiumCredit) && !hasUnlimitedPremium;

        let invitation;
        try {
            invitation = await prisma.$transaction(async (tx) => {
                // Descuento atómico junto con la creación: si la creación
                // falla más abajo, la transacción entera se revierte y el
                // crédito no se pierde.
                if (willSpendCredit) {
                    const result = await tx.user.updateMany({
                        where: { id: userId, premiumCredits: { gt: 0 } },
                        data: { premiumCredits: { decrement: 1 } },
                    });
                    if (result.count === 0) {
                        throw new Error('INSUFFICIENT_CREDITS');
                    }
                }

                return tx.invitation.create({
            data: {
                userId,
                planTier: invitationPlanTier, // Asignar el plan correspondiente
                premiumCreditSpent: willSpendCredit,
                tipo: body.type || 'CASAMIENTO',
                estado: 'ACTIVA',
                slug,
                nombreEvento: body.nombreEvento || 'Nuestra Invitación',
                fechaEvento,
                nombreNovio: body.nombreNovio || null,
                nombreNovia: body.nombreNovia || null,
                nombreQuinceanera: body.nombreQuinceanera || null,
                lugarNombre: body.lugarNombre || null,
                direccion: body.direccion || null,
                hora: body.hora || null,
                mapUrl: body.mapUrl || null,

                // CEREMONIA / CIVIL
                ceremoniaHabilitada: body.ceremoniaHabilitada !== undefined ? Boolean(body.ceremoniaHabilitada) : false,
                ceremoniaTitulo: body.ceremoniaTitulo || null,
                ceremoniaNombre: body.ceremoniaNombre || null,
                ceremoniaDireccion: body.ceremoniaDireccion || null,
                ceremoniaHora: body.ceremoniaHora || null,
                ceremoniaMapUrl: body.ceremoniaMapUrl || null,

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
                ciudad: body.ciudad,
                portadaHabilitada: body.portadaHabilitada !== undefined ? body.portadaHabilitada : true,
                portadaKicker: body.portadaKicker,
                portadaTitulo: body.portadaTitulo,
                portadaDressCode: body.portadaDressCode,
                portadaMensaje: body.portadaMensaje,
                portadaTextoBoton: body.portadaTextoBoton,
                portadaImagenFondo: body.portadaImagenFondo,
                portadaImagenFondoDesktop: body.portadaImagenFondoDesktop,
                portadaImagenPosX: body.portadaImagenPosX,
                portadaImagenPosY: body.portadaImagenPosY,
                portadaImagenEscala: body.portadaImagenEscala,
                portadaImagenDesktopPosX: body.portadaImagenDesktopPosX,
                portadaImagenDesktopPosY: body.portadaImagenDesktopPosY,
                portadaImagenDesktopEscala: body.portadaImagenDesktopEscala,

                // 8. GALERÍA PRINCIPAL
                galeriaPrincipalHabilitada: body.galeriaPrincipalHabilitada !== undefined ? body.galeriaPrincipalHabilitada : true,
                galeriaPrincipalFotos: body.galeriaPrincipalFotos ? JSON.stringify(body.galeriaPrincipalFotos) : '[]',
                galeriaPrincipalAutoplay: body.galeriaPrincipalAutoplay !== undefined ? Boolean(body.galeriaPrincipalAutoplay) : false,
                galeriaPrincipalEstilo: body.galeriaPrincipalEstilo || 'carrusel',

                sugerenciaMusicaHabilitada: body.sugerenciaMusicaHabilitada !== undefined ? body.sugerenciaMusicaHabilitada : true,

                // 9. FRASE PERSONALIZADA
                frasePersonalizadaHabilitada: body.frasePersonalizadaHabilitada !== undefined ? Boolean(body.frasePersonalizadaHabilitada) : false,
                frasePersonalizadaTexto: body.frasePersonalizadaTexto || null,

                // 12. GALERÍA SECUNDARIA
                galeriaSecundariaHabilitada: body.galeriaSecundariaHabilitada !== undefined ? body.galeriaSecundariaHabilitada : false,
                galeriaSecundariaFotos: body.galeriaSecundariaFotos ? JSON.stringify(body.galeriaSecundariaFotos) : '[]',

                // 11. REGALO Y PAGO DE TARJETAS
                regaloHabilitado: body.regaloHabilitado !== undefined ? body.regaloHabilitado : false,
                regaloTitulo: body.regaloTitulo,
                regaloMensaje: body.regaloMensaje,
                regaloMostrarDatos: body.regaloMostrarDatos,
                regaloCbu: body.regaloCbu,
                regaloAlias: body.regaloAlias,
                regaloBanco: body.regaloBanco,
                regaloTitular: body.regaloTitular,
                regaloMonto: body.regaloMonto ? parseFloat(body.regaloMonto) : null,
                regaloMontoUpdatedAt: body.regaloMonto ? new Date() : null,

                pagoTarjetaHabilitado: body.pagoTarjetaHabilitado !== undefined ? body.pagoTarjetaHabilitado : false,
                pagoTarjetaTitulo: body.pagoTarjetaTitulo,
                pagoTarjetaMensaje: body.pagoTarjetaMensaje,
                pagoTarjetaMostrarDatos: body.pagoTarjetaMostrarDatos,
                pagoTarjetaCbu: body.pagoTarjetaCbu,
                pagoTarjetaAlias: body.pagoTarjetaAlias,
                pagoTarjetaBanco: body.pagoTarjetaBanco,
                pagoTarjetaTitular: body.pagoTarjetaTitular,
                pagoTarjetaMonto: body.pagoTarjetaMonto ? parseFloat(body.pagoTarjetaMonto) : null,
                precioNino: body.precioNino ? parseFloat(body.precioNino) : null,
                precioAdolescente: body.precioAdolescente ? parseFloat(body.precioAdolescente) : null,
                precioNinoHabilitado: body.precioNinoHabilitado !== undefined ? Boolean(body.precioNinoHabilitado) : true,
                precioAdolescenteHabilitado: body.precioAdolescenteHabilitado !== undefined ? Boolean(body.precioAdolescenteHabilitado) : false,

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
            });
        } catch (txError) {
            if (txError instanceof Error && txError.message === 'INSUFFICIENT_CREDITS') {
                return NextResponse.json(
                    { error: 'No tienes créditos premium disponibles' },
                    { status: 403 }
                );
            }
            throw txError;
        }

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

        // NUNCA regenerar el slug en actualizaciones — los links enviados a invitados deben ser permanentes.
        // El slug solo se genera una vez al crear la invitación (POST).

        // Combinar fecha y hora correctamente preservando la zona horaria local
        let fechaEvento: Date;
        const datePart = body.fecha ? body.fecha.split('T')[0] : '';
        if (body.hora) {
            // Si hay hora, combinar fecha + hora
            const [hours, minutes] = body.hora.split(':');
            const [year, month, day] = datePart.split('-').map(Number);
            // Crear fecha en zona horaria local
            fechaEvento = new Date(year, month - 1, day, parseInt(hours), parseInt(minutes), 0);
        } else {
            // Si no hay hora, usar solo la fecha a medianoche local
            const [year, month, day] = datePart.split('-').map(Number);
            fechaEvento = new Date(year, month - 1, day, 0, 0, 0);
        }

        const session = await auth().catch(() => null);
        const isAdmin = session?.user?.role === "ADMIN" || session?.user?.planTier === "ADMIN";

        const existingInvitation = await prisma.invitation.findUnique({
            where: { id },
            select: { regaloMonto: true, fechaEvento: true }
        });

        if (existingInvitation && fechaEvento && fechaEvento.getTime() !== new Date(existingInvitation.fechaEvento).getTime()) {
            if (!isAdmin && isEventDateLocked(existingInvitation.fechaEvento)) {
                return NextResponse.json(
                    { error: 'La fecha del evento no se puede modificar cuando faltan 30 días o menos por motivos de seguridad.' },
                    { status: 400 }
                );
            }
        }

        // Parse new regalo monto
        const newRegaloMonto = body.regaloMonto !== undefined && body.regaloMonto !== null 
            ? parseFloat(body.regaloMonto) 
            : null;
        
        let regaloMontoUpdatedAt = undefined;
        if (existingInvitation && existingInvitation.regaloMonto !== newRegaloMonto && newRegaloMonto !== null) {
            regaloMontoUpdatedAt = new Date();
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
                ciudad: body.ciudad,
                portadaHabilitada: body.portadaHabilitada,
                portadaKicker: body.portadaKicker,
                portadaTitulo: body.portadaTitulo,
                portadaDressCode: body.portadaDressCode,
                portadaMensaje: body.portadaMensaje,
                portadaTextoBoton: body.portadaTextoBoton,
                portadaImagenFondo: body.portadaImagenFondo,
                portadaImagenFondoDesktop: body.portadaImagenFondoDesktop,
                portadaImagenPosX: body.portadaImagenPosX,
                portadaImagenPosY: body.portadaImagenPosY,
                portadaImagenEscala: body.portadaImagenEscala,
                portadaImagenDesktopPosX: body.portadaImagenDesktopPosX,
                portadaImagenDesktopPosY: body.portadaImagenDesktopPosY,
                portadaImagenDesktopEscala: body.portadaImagenDesktopEscala,

                // 8. GALERÍA PRINCIPAL
                galeriaPrincipalHabilitada: body.galeriaPrincipalHabilitada,
                galeriaPrincipalFotos: body.galeriaPrincipalFotos ? JSON.stringify(body.galeriaPrincipalFotos) : undefined,

                sugerenciaMusicaHabilitada: body.sugerenciaMusicaHabilitada,

                // 9. FRASE PERSONALIZADA
                frasePersonalizadaHabilitada: body.frasePersonalizadaHabilitada,
                frasePersonalizadaTexto: body.frasePersonalizadaTexto,

                // 12. GALERÍA SECUNDARIA
                galeriaSecundariaHabilitada: body.galeriaSecundariaHabilitada,
                galeriaSecundariaFotos: body.galeriaSecundariaFotos ? JSON.stringify(body.galeriaSecundariaFotos) : undefined,

                // 11. REGALO Y PAGO DE TARJETAS
                regaloHabilitado: body.regaloHabilitado,
                regaloTitulo: body.regaloTitulo,
                regaloMensaje: body.regaloMensaje,
                regaloMostrarDatos: body.regaloMostrarDatos,
                regaloCbu: body.regaloCbu,
                regaloAlias: body.regaloAlias,
                regaloBanco: body.regaloBanco,
                regaloTitular: body.regaloTitular,
                regaloMonto: newRegaloMonto,
                ...(regaloMontoUpdatedAt && { regaloMontoUpdatedAt }),

                pagoTarjetaHabilitado: body.pagoTarjetaHabilitado,
                pagoTarjetaTitulo: body.pagoTarjetaTitulo,
                pagoTarjetaMensaje: body.pagoTarjetaMensaje,
                pagoTarjetaMostrarDatos: body.pagoTarjetaMostrarDatos,
                pagoTarjetaCbu: body.pagoTarjetaCbu,
                pagoTarjetaAlias: body.pagoTarjetaAlias,
                pagoTarjetaBanco: body.pagoTarjetaBanco,
                pagoTarjetaTitular: body.pagoTarjetaTitular,
                pagoTarjetaMonto: body.pagoTarjetaMonto !== undefined ? (body.pagoTarjetaMonto ? parseFloat(body.pagoTarjetaMonto) : null) : undefined,
                precioNino: body.precioNino !== undefined ? (body.precioNino ? parseFloat(body.precioNino) : null) : undefined,
                precioAdolescente: body.precioAdolescente !== undefined ? (body.precioAdolescente ? parseFloat(body.precioAdolescente) : null) : undefined,
                precioNinoHabilitado: body.precioNinoHabilitado !== undefined ? Boolean(body.precioNinoHabilitado) : undefined,
                precioAdolescenteHabilitado: body.precioAdolescenteHabilitado !== undefined ? Boolean(body.precioAdolescenteHabilitado) : undefined,


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
