import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

// Créditos premium del usuario logueado, para la botonera inferior mobile
// (necesita esto antes de abrir el dialogo de "Nueva invitación"). También
// informa si ya tiene una tarjeta Gratis activa -- el plan Gratis permite
// una sola (ver PLAN_LIMITS.FREE.maxInvitations), así que el diálogo de
// "Nueva invitación" oculta la opción "Crear Gratis" en ese caso.
export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const [user, freeInvitationsCount] = await Promise.all([
        prisma.user.findUnique({
            where: { id: session.user.id },
            select: { premiumCredits: true, diamondCredits: true },
        }),
        prisma.invitation.count({
            where: { userId: session.user.id, estado: 'ACTIVA', planTier: 'FREE' },
        }),
    ]);

    return NextResponse.json({
        premiumCredits: user?.premiumCredits || 0,
        diamondCredits: user?.diamondCredits || 0,
        hasFreeInvitation: freeInvitationsCount > 0,
    });
}
