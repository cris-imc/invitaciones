"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
}

export function QuizTrivia({ icono, titulo, subtitulo, preguntas }: QuizTriviaProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [userAnswers, setUserAnswers] = useState<number[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);

    const currentQuestion = preguntas[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === preguntas.length - 1;

    const handleAnswerSelect = (index: number) => {
        setSelectedAnswer(index);
    };

    const handleNext = () => {
        if (selectedAnswer === null) return;

        const newAnswers = [...userAnswers, selectedAnswer];
        setUserAnswers(newAnswers);

        if (isLastQuestion) {
            setShowResults(true);
        } else {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer(null);
        }
    };

    const handleRestart = () => {
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setUserAnswers([]);
        setShowResults(false);
        setHasStarted(false);
    };

    const calculateScore = () => {
        let correct = 0;
        userAnswers.forEach((answer, index) => {
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

    if (!hasStarted) {
        return (
            <section className="py-16 px-4" style={{ backgroundColor: 'var(--color-background)' }}>
                <div className="max-w-2xl mx-auto text-center space-y-6">
                    <div className="text-6xl">{icono || "🎯"}</div>
                    <h2
                        className="text-3xl md:text-4xl font-bold"
                        style={{ color: 'var(--color-primary)' }}
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

                            <Button
                                onClick={handleRestart}
                                variant="outline"
                                className="mt-6"
                            >
                                Intentar de nuevo
                            </Button>
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
