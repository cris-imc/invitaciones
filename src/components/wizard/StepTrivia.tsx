"use client";

import { useWizardStore } from "@/store/wizard-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { Trash2, Plus } from "lucide-react";

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

    const handleNext = () => {
        setData({ triviaPreguntas: JSON.stringify(preguntas) });
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
                        <div className="space-y-4 border p-4 rounded-lg bg-slate-50">
                            <div className="space-y-2">
                                <Label htmlFor="triviaIcono">Icono (emoji)</Label>
                                <Input
                                    id="triviaIcono"
                                    value={data.triviaIcono || ""}
                                    onChange={(e) => setData({ triviaIcono: e.target.value })}
                                    placeholder="🎯"
                                    maxLength={2}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="triviaTitulo">Título</Label>
                                <Input
                                    id="triviaTitulo"
                                    value={data.triviaTitulo || ""}
                                    onChange={(e) => setData({ triviaTitulo: e.target.value })}
                                    placeholder="¿Cuánto nos conoces?"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="triviaSubtitulo">Subtítulo</Label>
                                <Input
                                    id="triviaSubtitulo"
                                    value={data.triviaSubtitulo || ""}
                                    onChange={(e) => setData({ triviaSubtitulo: e.target.value })}
                                    placeholder="Responde estas preguntas y descubre cuánto sabes"
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
                                            className="flex items-start justify-between p-3 bg-white border rounded-lg"
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
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteQuestion(index)}
                                            >
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Formulario para nueva pregunta */}
                        <div className="border p-4 rounded-lg space-y-4 bg-blue-50">
                            <h3 className="font-semibold">Agregar nueva pregunta</h3>

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
