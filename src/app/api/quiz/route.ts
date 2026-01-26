import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST - Submit quiz response
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { invitationId, guestName, guestToken, answers, score, totalQuestions } = body;

        if (!invitationId || !guestName || !answers || score === undefined || !totalQuestions) {
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
        if (guestToken) {
            const existingResponse = await prisma.quizResponse.findFirst({
                where: { invitationId, guestToken }
            });
            hasAnswered = !!existingResponse;
        }

        // Get all responses for this invitation
        const responses = await prisma.quizResponse.findMany({
            where: { invitationId },
            select: {
                score: true,
                totalQuestions: true,
            }
        });

        if (responses.length === 0) {
            return NextResponse.json({
                hasAnswered,
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
