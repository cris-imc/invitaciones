"use client";

import { useWizardStore } from "@/store/wizard-store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export function StepPhrase() {
    const { data, setData, nextStep, prevStep } = useWizardStore();

    const tipo = data.type || "OTRO";
    const phraseHelp =
        tipo === "CASAMIENTO"
            ? "Una frase que refleje la historia de ustedes dos."
            : tipo === "QUINCE_ANOS"
            ? "Una frase que la quinceañera quiera compartir."
            : "Una frase institucional o de bienvenida para el evento.";

    const phrasePlaceholder =
        tipo === "CASAMIENTO"
            ? "Ej: 'Lo mejor de la vida es compartirla con quien amás...'"
            : tipo === "QUINCE_ANOS"
            ? "Ej: 'Este es el comienzo del resto de mi vida...'"
            : "Ej: 'Bienvenidos a nuestra celebración. Gracias por estar aquí.'";

    const WEDDING_PHRASES = [
        "El amor no consiste en mirarse el uno al otro, sino en mirar juntos en la misma dirección.",
        "Unimos nuestras vidas para siempre, porque juntos todo es mejor.",
        "Donde hay amor, hay vida. ¡Y queremos celebrar la nuestra con vos!",
        "Lo mejor de la vida es compartirla con quien amás... y con quienes te aman.",
        "Hoy comienza la mejor de nuestras aventuras."
    ];

    const QUINCE_PHRASES = [
        "Este es el comienzo del resto de mi vida. ¡Gracias por acompañarme!",
        "Hay momentos inolvidables que se atesoran en el corazón para siempre.",
        "Dejo atrás mi niñez para comenzar a vivir mis sueños.",
        "Celebro la magia de crecer, rodeada del amor de mi familia y amigos.",
        "Una noche mágica, un recuerdo eterno. ¡Acompáñame a festejar mis 15!"
    ];

    const suggestedPhrases = tipo === "CASAMIENTO" ? WEDDING_PHRASES : tipo === "QUINCE_ANOS" ? QUINCE_PHRASES : [];

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Frase Personalizada</h2>
                <p className="text-muted-foreground">
                    {phraseHelp}
                </p>
            </div>

            <div className="space-y-4 bg-[var(--ink-2)] border-[var(--ink-2)] p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                    <Label htmlFor="enablePhrase" className="text-lg font-medium">
                        Habilitar Frase
                    </Label>
                    <Switch
                        id="enablePhrase"
                        checked={data.frasePersonalizadaHabilitada}
                        onCheckedChange={(checked) => setData({ frasePersonalizadaHabilitada: checked })}
                    />
                </div>

                {data.frasePersonalizadaHabilitada && (
                    <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="space-y-2">
                            <Label htmlFor="phraseText">Tu Frase</Label>
                            <Textarea
                                id="phraseText"
                                placeholder={phrasePlaceholder}
                                value={data.frasePersonalizadaTexto || ""}
                                onChange={(e) => setData({ frasePersonalizadaTexto: e.target.value })}
                                className="min-h-[100px] resize-none text-lg"
                                maxLength={300}
                            />
                            <p className="text-xs text-muted-foreground text-right">
                                {(data.frasePersonalizadaTexto || "").length}/300
                            </p>
                        </div>
                        
                        {suggestedPhrases.length > 0 && (
                            <div className="space-y-2 mt-4 pt-4 border-t border-border">
                                <Label className="text-sm font-semibold text-muted-foreground">Sugerencias (haz clic para usar):</Label>
                                <div className="grid gap-2">
                                    {suggestedPhrases.map((phrase, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setData({ frasePersonalizadaTexto: phrase })}
                                            className="text-left text-sm p-3 rounded-md bg-background/50 hover:bg-muted border border-border text-foreground transition-colors"
                                        >
                                            &quot;{phrase}&quot;
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="flex justify-between pt-6">
                <Button type="button" variant="outline" onClick={prevStep}>
                    Anterior
                </Button>
                <Button onClick={nextStep}>
                    Siguiente
                </Button>
            </div>
        </div>
    );
}
