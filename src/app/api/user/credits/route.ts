import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

// Créditos premium del usuario logueado, para la botonera inferior mobile
// (necesita esto antes de abrir el dialogo de "Nueva invitación").
export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { premiumCredits: true },
    });

    return NextResponse.json({ premiumCredits: user?.premiumCredits || 0 });
}
