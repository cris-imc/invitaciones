import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST - Submit quiz response
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { invitationId, guestName, guestToken, answers } = body;

        if (!invitationId || !guestName || !Array.isArray(answers) || answers.length === 0) {
            return NextResponse.json(
                { error: "Faltan datos requeridos" },
                { status: 400 }
            );
        }

        // Check if this guest already answered the quiz
        const existingResponse = await prisma.quizResponse.findFirst({
            where: guestToken
                ? { invitationId, guestToken }
                : { invitationId, guestName }
        });

        if (existingResponse) {
            return NextResponse.json(
                { error: "Ya has respondido este quiz", alreadyAnswered: true },
                { status: 400 }
            );
        }

        // El puntaje se recalcula acá contra las respuestas correctas reales
        // de la invitación -- nunca se confía en el score que manda el
        // cliente (un invitado podía mandar cualquier puntaje falso y quedar
        // primero en el ranking/promedio).
        const invitation = await prisma.invitation.findUnique({
            where: { id: invitationId },
            select: { triviaPreguntas: true },
        });
        if (!invitation) {
            return NextResponse.json({ error: "Invitación no encontrada" }, { status: 404 });
        }
        let preguntas: { respuestaCorrecta?: number }[] = [];
        try {
            preguntas = JSON.parse(invitation.triviaPreguntas || "[]");
        } catch {
            preguntas = [];
        }
        if (preguntas.length === 0) {
            return NextResponse.json({ error: "Esta invitación no tiene trivia configurada" }, { status: 400 });
        }
        const totalQuestions = preguntas.length;
        const score = answers.reduce(
            (acc: number, answer: unknown, i: number) => acc + (i < preguntas.length && answer === preguntas[i].respuestaCorrecta ? 1 : 0),
            0
        );

        // Save the quiz response
        const quizResponse = await prisma.quizResponse.create({
            data: {
                invitationId,
                guestName,
                guestToken: guestToken || null,
                answers: JSON.stringify(answers),
                score,
                totalQuestions,
            },
        });

        return NextResponse.json({ 
            success: true, 
            quizResponse 
        });

    } catch (error) {
        console.error("Error saving quiz response:", error);
        return NextResponse.json(
            { error: "Error al guardar la respuesta del quiz" },
            { status: 500 }
        );
    }
}

// GET - Get quiz statistics for an invitation
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const invitationId = searchParams.get("invitationId");
        const guestToken = searchParams.get("guestToken");

        if (!invitationId) {
            return NextResponse.json(
                { error: "invitationId es requerido" },
                { status: 400 }
            );
        }

        // Check if guest already answered
        let hasAnswered = false;
        let guestScore = null;
        if (guestToken) {
            const existingResponse = await prisma.quizResponse.findFirst({
                where: { invitationId, guestToken }
            });
            if (existingResponse) {
                hasAnswered = true;
                guestScore = {
                    score: existingResponse.score,
                    totalQuestions: existingResponse.totalQuestions,
                    answers: JSON.parse(existingResponse.answers as string)
                };
            }
        }

        // Get all responses for this invitation, excluding las de invitados que
        // ya fueron eliminados (QuizResponse no tiene relacion/cascade con
        // Guest, asi que sin este filtro sus respuestas quedan huerfanas y
        // siguen contando en el promedio para siempre).
        const [allResponses, currentGuests] = await Promise.all([
            prisma.quizResponse.findMany({
                where: { invitationId },
                select: {
                    guestToken: true,
                    score: true,
                    totalQuestions: true,
                }
            }),
            prisma.guest.findMany({
                where: { invitationId },
                select: { uniqueToken: true },
            }),
        ]);

        const validTokens = new Set(currentGuests.map((g) => g.uniqueToken));
        const responses = allResponses.filter((r) => !r.guestToken || validTokens.has(r.guestToken));

        if (responses.length === 0) {
            return NextResponse.json({
                hasAnswered,
                guestScore,
                totalResponses: 0,
                averagePercentage: 0,
            });
        }

        // Calculate average percentage
        const totalPercentages = responses.reduce((sum, response) => {
            const percentage = (response.score / response.totalQuestions) * 100;
            return sum + percentage;
        }, 0);

        const averagePercentage = Math.round(totalPercentages / responses.length);

        return NextResponse.json({
            hasAnswered,
            guestScore,
            totalResponses: responses.length,
            averagePercentage,
        });

    } catch (error) {
        console.error("Error fetching quiz statistics:", error);
        return NextResponse.json(
            { error: "Error al obtener las estadísticas del quiz" },
            { status: 500 }
        );
    }
}
