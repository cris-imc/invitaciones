"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface TriviaQuestion {
    pregunta: string;
    opciones: string[];
    respuestaCorrecta: number;
}

interface QuizTriviaProps {
    icono?: string;
    titulo: string;
    subtitulo?: string;
    preguntas: TriviaQuestion[];
    invitationId?: string;
    guestName?: string;
    guestToken?: string;
}

export function QuizTrivia({ icono, titulo, subtitulo, preguntas, invitationId, guestName, guestToken }: QuizTriviaProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [userAnswers, setUserAnswers] = useState<number[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [isCheckingStatus, setIsCheckingStatus] = useState(true);
    const [globalStats, setGlobalStats] = useState<{ averagePercentage: number; totalResponses: number } | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const currentQuestion = preguntas[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === preguntas.length - 1;

    // Check if user already answered on mount
    useEffect(() => {
        if (invitationId) {
            checkQuizStatus();
        } else {
            setIsCheckingStatus(false);
        }
    }, [invitationId, guestToken]);

    const checkQuizStatus = async () => {
        try {
            const params = new URLSearchParams({ invitationId: invitationId! });
            if (guestToken) {
                params.append("guestToken", guestToken);
            }
            
            const response = await fetch(`/api/quiz?${params.toString()}`);
            const data = await response.json();
            
            setHasAnswered(data.hasAnswered);
            if (data.totalResponses > 0) {
                setGlobalStats({
                    averagePercentage: data.averagePercentage,
                    totalResponses: data.totalResponses
                });
            }
        } catch (error) {
            console.error("Error checking quiz status:", error);
        } finally {
            setIsCheckingStatus(false);
        }
    };

    const saveQuizResponse = async (answers: number[], score: number) => {
        if (!invitationId) return;

        setIsSaving(true);
        try {
            const response = await fetch('/api/quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    invitationId,
                    guestName: guestName || 'Invitado Anónimo',
                    guestToken: guestToken || null,
                    answers,
                    score,
                    totalQuestions: preguntas.length
                })
            });

            if (response.ok) {
                // Refresh stats
                await checkQuizStatus();
            }
        } catch (error) {
            console.error("Error saving quiz response:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAnswerSelect = (index: number) => {
        setSelectedAnswer(index);
    };

    const handleNext = async () => {
        if (selectedAnswer === null) return;

        const newAnswers = [...userAnswers, selectedAnswer];
        setUserAnswers(newAnswers);

        if (isLastQuestion) {
            const score = calculateScoreFromAnswers(newAnswers);
            setShowResults(true);
            // Save to database
            await saveQuizResponse(newAnswers, score.correct);
        } else {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer(null);
        }
    };

    const handleRestart = () => {
        // Quiz can only be answered once
        setHasStarted(false);
    };

    const calculateScoreFromAnswers = (answers: number[]) => {
        let correct = 0;
        answers.forEach((answer, index) => {
            if (answer === preguntas[index].respuestaCorrecta) {
                correct++;
            }
        });
        return {
            correct,
            total: preguntas.length,
            percentage: Math.round((correct / preguntas.length) * 100),
        };
    };

    const calculateScore = () => {
        return calculateScoreFromAnswers(userAnswers);
    };

    if (isCheckingStatus) {
        return (
            <section className="py-16 px-4" style={{ backgroundColor: 'var(--color-background)' }}>
                <div className="max-w-2xl mx-auto text-center space-y-6">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
                </div>
            </section>
        );
    }

    if (hasAnswered && !hasStarted) {
        return (
            <section className="py-16 px-4" style={{ backgroundColor: 'var(--color-background)' }}>
                <div className="max-w-2xl mx-auto text-center space-y-6">
                    <div className="text-6xl">✅</div>
                    <h2
                        className="text-3xl md:text-4xl"
                        style={{ color: 'var(--color-primary)', fontFamily: "var(--font-ornamental)" }}
                    >
                        Ya completaste este quiz
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        ¡Gracias por participar! Solo se puede responder una vez.
                    </p>
                    {globalStats && (
                        <Card className="mt-6">
                            <CardContent className="pt-6">
                                <p className="text-sm text-muted-foreground mb-2">Estadísticas globales</p>
                                <div className="text-4xl font-bold" style={{ color: 'var(--color-primary)' }}>
                                    {globalStats.averagePercentage}%
                                </div>
                                <p className="text-muted-foreground mt-2">
                                    Promedio de aciertos ({globalStats.totalResponses} {globalStats.totalResponses === 1 ? 'participante' : 'participantes'})
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </section>
        );
    }

    if (!hasStarted) {
        return (
            <section className="py-16 px-4" style={{ backgroundColor: 'var(--color-background)' }}>
                <div className="max-w-2xl mx-auto text-center space-y-6">
                    <div className="text-6xl">{icono || "🎯"}</div>
                    <h2
                        className="text-3xl md:text-4xl"
                        style={{ color: 'var(--color-primary)', fontFamily: "var(--font-ornamental)" }}
                    >
                        {titulo}
                    </h2>
                    {subtitulo && (
                        <p className="text-lg text-muted-foreground">{subtitulo}</p>
                    )}
                    <p className="text-muted-foreground">
                        {preguntas.length} pregunta{preguntas.length !== 1 ? 's' : ''} • Descubre cuánto sabes
                    </p>
                    <Button
                        onClick={() => setHasStarted(true)}
                        size="lg"
                        className="mt-4"
                        style={{
                            backgroundColor: 'var(--color-primary)',
                            color: 'var(--color-text-light)',
                        }}
                    >
                        Comenzar Quiz
                    </Button>
                </div>
            </section>
        );
    }

    if (showResults) {
        const score = calculateScore();
        let mensaje = "";
        let emoji = "";

        if (score.percentage === 100) {
            mensaje = "¡Perfecto! 🎉 ¡Nos conoces muy bien!";
            emoji = "🏆";
        } else if (score.percentage >= 70) {
            mensaje = "¡Muy bien! Sabes bastante sobre nosotros";
            emoji = "⭐";
        } else if (score.percentage >= 40) {
            mensaje = "¡No está mal! Pero hay espacio para mejorar";
            emoji = "👍";
        } else {
            mensaje = "¡Necesitas conocernos mejor! 😊";
            emoji = "📚";
        }

        return (
            <section className="py-16 px-4" style={{ backgroundColor: 'var(--color-background)' }}>
                <div className="max-w-2xl mx-auto">
                    <Card className="text-center">
                        <CardContent className="pt-8 pb-8 space-y-6">
                            {isSaving && (
                                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Guardando resultados...
                                </div>
                            )}
                            <div className="text-8xl">{emoji}</div>
                            <h3 className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>
                                ¡Quiz Completado!
                            </h3>
                            <div className="space-y-2">
                                <div className="text-6xl font-bold" style={{ color: 'var(--color-primary)' }}>
                                    {score.percentage}%
                                </div>
                                <p className="text-xl text-muted-foreground">
                                    {score.correct} de {score.total} respuestas correctas
                                </p>
                                <p className="text-lg font-medium mt-4">{mensaje}</p>
                            </div>

                            {/* Global Stats */}
                            {globalStats && globalStats.totalResponses > 0 && (
                                <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                                    <p className="text-sm text-muted-foreground mb-2">📊 Estadísticas globales</p>
                                    <div className="text-3xl font-bold text-slate-700">
                                        {globalStats.averagePercentage}%
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Promedio de aciertos de {globalStats.totalResponses} {globalStats.totalResponses === 1 ? 'participante' : 'participantes'}
                                    </p>
                                </div>
                            )}

                            {/* Detalle de respuestas */}
                            <div className="mt-8 space-y-3 text-left">
                                {preguntas.map((q, index) => {
                                    const userAnswer = userAnswers[index];
                                    const isCorrect = userAnswer === q.respuestaCorrecta;
                                    return (
                                        <div
                                            key={index}
                                            className={`p-4 rounded-lg border-2 ${isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                                                }`}
                                        >
                                            <p className="font-medium mb-2">
                                                {index + 1}. {q.pregunta}
                                            </p>
                                            <p className={`text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                                Tu respuesta: {q.opciones[userAnswer]} {isCorrect ? '✓' : '✗'}
                                            </p>
                                            {!isCorrect && (
                                                <p className="text-sm text-green-700 mt-1">
                                                    Correcta: {q.opciones[q.respuestaCorrecta]}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                <p className="text-sm text-amber-800">
                                    ℹ️ El quiz solo puede responderse una vez
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>
        );
    }

    return (
        <section className="py-16 px-4" style={{ backgroundColor: 'var(--color-background)' }}>
            <div className="max-w-2xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                        Pregunta {currentQuestionIndex + 1} de {preguntas.length}
                    </span>
                    <div className="flex gap-1">
                        {preguntas.map((_, index) => (
                            <div
                                key={index}
                                className={`h-2 w-8 rounded-full ${index < currentQuestionIndex
                                        ? 'bg-green-500'
                                        : index === currentQuestionIndex
                                            ? 'bg-primary'
                                            : 'bg-gray-200'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                <Card>
                    <CardContent className="pt-8 pb-8 space-y-6">
                        <h3 className="text-2xl font-bold text-center">
                            {currentQuestion.pregunta}
                        </h3>

                        <div className="space-y-3">
                            {currentQuestion.opciones.map((opcion, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleAnswerSelect(index)}
                                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${selectedAnswer === index
                                            ? 'border-primary bg-primary/10'
                                            : 'border-gray-200 hover:border-primary/50'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-medium ${selectedAnswer === index
                                                    ? 'border-primary bg-primary text-white'
                                                    : 'border-gray-300'
                                                }`}
                                        >
                                            {String.fromCharCode(65 + index)}
                                        </div>
                                        <span className="flex-1">{opcion}</span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <Button
                            onClick={handleNext}
                            disabled={selectedAnswer === null}
                            className="w-full mt-6"
                            size="lg"
                            style={{
                                backgroundColor: selectedAnswer !== null ? 'var(--color-primary)' : undefined,
                                color: selectedAnswer !== null ? 'var(--color-text-light)' : undefined,
                            }}
                        >
                            {isLastQuestion ? 'Ver Resultados' : 'Siguiente Pregunta'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
