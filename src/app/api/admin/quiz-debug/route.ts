import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

// Diagnostico temporal: inspecciona las QuizResponse guardadas para
// entender por que el promedio de aciertos no coincide con lo esperado.
export async function GET() {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const responses = await prisma.quizResponse.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
        select: {
            id: true,
            invitationId: true,
            guestName: true,
            guestToken: true,
            score: true,
            totalQuestions: true,
            answers: true,
            createdAt: true,
        },
    });

    const invitationIds = [...new Set(responses.map((r) => r.invitationId))];
    const invitations = await prisma.invitation.findMany({
        where: { id: { in: invitationIds } },
        select: { id: true, slug: true, nombreEvento: true, triviaPreguntas: true },
    });

    return NextResponse.json({ responses, invitations });
}
