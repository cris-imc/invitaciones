"use client";

import { useWizardStore } from "@/store/wizard-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { Trash2, Plus, Pencil } from "lucide-react";

interface TriviaQuestion {
    pregunta: string;
    opciones: string[];
    respuestaCorrecta: number; // índice de la respuesta correcta (0-3)
}

export function StepTrivia() {
    const { data, setData, nextStep, prevStep } = useWizardStore();

    // Parse existing questions or initialize empty array
    const [preguntas, setPreguntas] = useState<TriviaQuestion[]>(() => {
        try {
            return data.triviaPreguntas ? JSON.parse(data.triviaPreguntas) : [];
        } catch {
            return [];
        }
    });

    const [currentQuestion, setCurrentQuestion] = useState<TriviaQuestion>({
        pregunta: "",
        opciones: ["", "", "", ""],
        respuestaCorrecta: 0,
    });

    const handleAddQuestion = () => {
        if (currentQuestion.pregunta.trim() && currentQuestion.opciones.every(op => op.trim())) {
            setPreguntas([...preguntas, currentQuestion]);
            setCurrentQuestion({
                pregunta: "",
                opciones: ["", "", "", ""],
                respuestaCorrecta: 0,
            });
        }
    };

    const handleDeleteQuestion = (index: number) => {
        setPreguntas(preguntas.filter((_, i) => i !== index));
    };

    const handleEditQuestion = (index: number) => {
        // Load the selected question into the form
        setCurrentQuestion(preguntas[index]);
        // Remove it from the saved list so they can replace it upon adding
        setPreguntas(preguntas.filter((_, i) => i !== index));
    };

    const handleNext = () => {
        // If there is a pending question (has text), add it effectively
        let finalPreguntas = [...preguntas];
        if (currentQuestion.pregunta.trim() && currentQuestion.opciones.every(op => op.trim())) {
            finalPreguntas.push(currentQuestion);
            // Optional: alert user or just do it silently
            // alert("Se agregó la última pregunta que estabas editando.");
        }

        setData({ triviaPreguntas: JSON.stringify(finalPreguntas) });
        nextStep();
    };

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Quiz/Trivia</h2>
                <p className="text-muted-foreground">
                    Crea un quiz divertido para que tus invitados conozcan más sobre {data.type === 'CASAMIENTO' ? 'la pareja' : 'la quinceañera'}
                </p>
            </div>

            <div className="space-y-4">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="triviaHabilitada"
                        checked={data.triviaHabilitada}
                        onCheckedChange={(checked) => setData({ triviaHabilitada: Boolean(checked) })}
                    />
                    <Label htmlFor="triviaHabilitada" className="cursor-pointer">
                        Activar Quiz/Trivia
                    </Label>
                </div>

                {data.triviaHabilitada && (
                    <>
                        {/* Configuración básica */}
                        <div className="space-y-4 border border-[var(--ink-2)] p-4 rounded-lg bg-[var(--ink-2)]">
                            <div className="space-y-2">
                                <Label htmlFor="triviaTitulo">Título</Label>
                                <Input
                                    id="triviaTitulo"
                                    value={data.triviaTitulo || ""}
                                    onChange={(e) => setData({ triviaTitulo: e.target.value })}
                                    placeholder="¿Cuánto nos conoces?"
                                />
                            </div>
                        </div>

                        {/* Lista de preguntas existentes */}
                        {preguntas.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="font-semibold">Preguntas agregadas ({preguntas.length})</h3>
                                <div className="space-y-2">
                                    {preguntas.map((q, index) => (
                                        <div
                                            key={index}
                                            className="flex items-start justify-between p-3 bg-[var(--ink)] border border-[var(--ink-2)] rounded-lg"
                                        >
                                            <div className="flex-1">
                                                <p className="font-medium">{index + 1}. {q.pregunta}</p>
                                                <div className="mt-1 space-y-1">
                                                    {q.opciones.map((op, i) => (
                                                        <p
                                                            key={i}
                                                            className={`text-sm ${i === q.respuestaCorrecta ? 'text-green-600 font-medium' : 'text-muted-foreground'}`}
                                                        >
                                                            {String.fromCharCode(65 + i)}. {op}
                                                            {i === q.respuestaCorrecta && " ✓"}
                                                        </p>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditQuestion(index)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Pencil className="w-4 h-4 text-blue-500" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteQuestion(index)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Formulario para nueva pregunta */}
                        <div className="border border-[var(--ink-2)] p-4 rounded-lg space-y-4 bg-yellow-500/10">
                            <h3 className="font-semibold text-yellow-500">Agregar nueva pregunta</h3>

                            <div className="space-y-2">
                                <Label htmlFor="pregunta">Pregunta</Label>
                                <Input
                                    id="pregunta"
                                    value={currentQuestion.pregunta}
                                    onChange={(e) =>
                                        setCurrentQuestion({ ...currentQuestion, pregunta: e.target.value })
                                    }
                                    placeholder="¿Cuál es el lugar favorito de la quinceañera?"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Opciones de respuesta</Label>
                                {currentQuestion.opciones.map((opcion, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <span className="w-8 text-sm font-medium">
                                            {String.fromCharCode(65 + index)}.
                                        </span>
                                        <Input
                                            value={opcion}
                                            onChange={(e) => {
                                                const newOpciones = [...currentQuestion.opciones];
                                                newOpciones[index] = e.target.value;
                                                setCurrentQuestion({ ...currentQuestion, opciones: newOpciones });
                                            }}
                                            placeholder={`Opción ${String.fromCharCode(65 + index)}`}
                                        />
                                        <Checkbox
                                            checked={currentQuestion.respuestaCorrecta === index}
                                            onCheckedChange={() =>
                                                setCurrentQuestion({ ...currentQuestion, respuestaCorrecta: index })
                                            }
                                        />
                                        <span className="text-xs text-muted-foreground">Correcta</span>
                                    </div>
                                ))}
                            </div>

                            <Button
                                type="button"
                                onClick={handleAddQuestion}
                                variant="outline"
                                className="w-full"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Agregar pregunta
                            </Button>
                        </div>
                    </>
                )}
            </div>

            <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={prevStep}>
                    Anterior
                </Button>
                <Button onClick={handleNext}>
                    Siguiente
                </Button>
            </div>
        </div>
    );
}
