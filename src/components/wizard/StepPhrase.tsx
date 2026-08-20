"use client";

import { useState, useEffect } from "react";
import { useWizardStore } from "@/store/wizard-store";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Info, ChevronDown, ChevronUp } from "lucide-react";
import { SaveStepButtons } from "./SaveStepButtons";

function TypewriterText({ text }: { text: string }) {
    const [displayText, setDisplayText] = useState("");

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (displayText.length < text.length) {
            timeout = setTimeout(() => {
                setDisplayText(text.slice(0, displayText.length + 1));
            }, 60);
        } else {
            timeout = setTimeout(() => {
                setDisplayText("");
            }, 4000);
        }
        return () => clearTimeout(timeout);
    }, [displayText, text]);

    return (
        <span>
            {displayText}
            <span className="animate-[pulse_1s_ease-in-out_infinite] border-r-[2px] border-amber-400 h-[1em] ml-[1px] inline-block align-middle"></span>
            <span className="invisible">{text.slice(displayText.length)}</span>
        </span>
    );
}

export function StepPhrase() {
    const { data, setData } = useWizardStore();
    const [showInfo, setShowInfo] = useState(false);

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
    
    const phraseValue = data.frasePersonalizadaTexto || "";
    const [customPhrase, setCustomPhrase] = useState(!suggestedPhrases.includes(phraseValue) && phraseValue !== "");

    return (
        <div className="space-y-6">
            <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold">Frase Personalizada</h2>
                <p className="text-muted-foreground text-sm">
                    {phraseHelp}
                </p>
            </div>

            {/* Caja informativa de Usabilidad (Collapsible - Minimizada por defecto) */}
            <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs overflow-hidden transition-all duration-200 shadow-sm max-w-2xl mx-auto">
                <button
                    type="button"
                    onClick={() => setShowInfo(!showInfo)}
                    className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-amber-500/15 transition-colors cursor-pointer"
                >
                    <div className="flex items-center gap-2.5 font-semibold text-amber-300 text-sm">
                        <Info className="w-4.5 h-4.5 shrink-0 text-amber-400" />
                        <span>¿Cómo se muestra la Frase Personalizada?</span>
                    </div>
                    <div className="text-amber-400 opacity-80 hover:opacity-100 transition-opacity shrink-0">
                        {showInfo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                </button>

                {showInfo && (
                    <div className="px-4 pb-4 pt-1 border-t border-amber-500/20 text-[13px] leading-relaxed opacity-95 animate-in fade-in duration-200">
                        Esta frase o poema se desplegará como cita destacada en el cuerpo de la invitación. Podés redactar tu propio mensaje sentimental o elegir una de nuestras sugerencias predefinidas listas para usar.
                    </div>
                )}
            </div>

            <div className="space-y-4 bg-[var(--ink-2)] border border-white/10 p-5 rounded-2xl max-w-2xl mx-auto">
                <div className="flex items-center justify-between">
                    <Label htmlFor="enablePhrase" className="text-base font-semibold cursor-pointer">
                        Habilitar Frase Personalizada
                    </Label>
                    <Switch
                        id="enablePhrase"
                        checked={data.frasePersonalizadaHabilitada}
                        onCheckedChange={(checked) => setData({ frasePersonalizadaHabilitada: checked })}
                    />
                </div>

                {data.frasePersonalizadaHabilitada && (
                    <div className="space-y-4 pt-4 border-t border-white/10 animate-in fade-in duration-200">
                        {suggestedPhrases.length > 0 && (
                            <div className="space-y-3">
                                <Label className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Elegí una frase o escribí la tuya:</Label>
                                <div className="grid gap-2">
                                    {suggestedPhrases.map((phrase, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => {
                                                setCustomPhrase(false);
                                                setData({ frasePersonalizadaTexto: phrase });
                                            }}
                                            className={`text-left text-sm p-3 rounded-xl border transition-all duration-200 ${
                                                !customPhrase && phraseValue === phrase
                                                    ? "bg-amber-500/25 border-amber-400 text-amber-200 shadow-sm"
                                                    : "bg-white/5 border-white/10 hover:bg-white/10 text-slate-300"
                                            }`}
                                        >
                                            "{phrase}"
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => setCustomPhrase(true)}
                                        className={`text-left text-sm p-3 rounded-xl border transition-all duration-200 ${
                                            customPhrase
                                                ? "bg-amber-500/25 border-amber-400 text-amber-200 font-semibold shadow-sm"
                                                : "bg-white/5 border-white/10 hover:bg-white/10 text-slate-300 font-semibold"
                                        }`}
                                    >
                                        <TypewriterText text="Escribir mi propia frase..." />
                                    </button>
                                </div>
                            </div>
                        )}

                        {(customPhrase || suggestedPhrases.length === 0) && (
                            <div className="space-y-2 pt-4 mt-2 border-t border-white/10 animate-in fade-in zoom-in-95">
                                <Label htmlFor="phraseText" className="text-sm font-medium">Tu Frase Personalizada</Label>
                                <Textarea
                                    id="phraseText"
                                    placeholder={phrasePlaceholder}
                                    value={phraseValue}
                                    onChange={(e) => setData({ frasePersonalizadaTexto: e.target.value.replace(/[\r\n]+/g, " ") })}
                                    className="min-h-[110px] resize-none text-base bg-[var(--ink)] border border-white/15 rounded-xl p-3"
                                    maxLength={300}
                                />
                                <p className="text-xs text-muted-foreground text-right">
                                    {phraseValue.length}/300
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <SaveStepButtons />
        </div>
    );
}
