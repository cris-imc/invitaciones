import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { checkAndCleanupIfExpired, isEventDateLocked } from '@/lib/expiration-server';
import { isAdmin as isAdminRole } from '@/lib/roles';

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
                liveSession: {
                    include: {
                        items: true,
                    },
                },
            },
        });

        const validInvitation = await checkAndCleanupIfExpired(invitation);

        if (!validInvitation) {
            return NextResponse.json(
                { error: 'Invitación no encontrada o expirada por superación de vigencia de 3 meses' },
                { status: 404 }
            );
        }

        return NextResponse.json(validInvitation);
    } catch (error) {
        console.error('Error fetching invitation:', error);
        return NextResponse.json(
            { error: 'Error al obtener invitación' },
            { status: 500 }
        );
    }
}

import { auth } from "@/auth";

// Campos editables por este endpoint -- allowlist explícita en vez de
// aceptar el body entero como `data` (eso hubiera permitido pisar
// `userId`, `planTier`, `estado`, etc. con solo mandarlos en el JSON).
// Cubre exactamente lo que usan los callers reales de este PATCH
// (GuestManager.tsx: precios y saludo; QuickEditPrice.tsx: precios y
// monto de regalo) más fechaEvento, que el propio endpoint ya valida
// más abajo contra el bloqueo anti-fraude de 30 días.
const PATCHABLE_FIELDS = [
    "fechaEvento",
    "precioNino",
    "precioAdolescente",
    "regaloMonto",
    "mostrarNombreInvitadoEnSaludo",
] as const;

// PATCH - Actualizar invitación (edición visual)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const body = await request.json();
        const session = await auth().catch(() => null);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
        }
        const isAdmin = isAdminRole(session.user.role) || session.user.planTier === "ADMIN";

        const existing = await prisma.invitation.findUnique({
            where: { slug },
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'Invitación no encontrada' },
                { status: 404 }
            );
        }

        if (existing.userId !== session.user.id && !isAdmin) {
            return NextResponse.json({ error: 'Sin permiso' }, { status: 403 });
        }

        // Si se intenta modificar la fecha y faltan 30 días o menos para la fecha original (exento si es ADMIN)
        if (body.fechaEvento && new Date(body.fechaEvento).getTime() !== new Date(existing.fechaEvento).getTime()) {
            if (!isAdmin && isEventDateLocked(existing.fechaEvento)) {
                return NextResponse.json(
                    { error: 'La fecha del evento no se puede modificar cuando faltan 30 días o menos por seguridad anti-fraude.' },
                    { status: 400 }
                );
            }
        }

        const data: Record<string, unknown> = {};
        for (const field of PATCHABLE_FIELDS) {
            if (body[field] !== undefined) data[field] = body[field];
        }

        const invitation = await prisma.invitation.update({
            where: { slug },
            data,
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