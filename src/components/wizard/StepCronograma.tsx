"use client";

import { useState } from "react";
import { useWizardStore } from "@/store/wizard-store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/Toast";
import { Heart, Music, Utensils, Calendar, Gift, Camera, Clock, Trash2, Plus, Info, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { SaveStepButtons } from "./SaveStepButtons";

const ICON_OPTIONS = [
    { value: "Heart", label: "Corazón", Icon: Heart },
    { value: "Music", label: "Música", Icon: Music },
    { value: "Utensils", label: "Comida", Icon: Utensils },
    { value: "Calendar", label: "Calendario", Icon: Calendar },
    { value: "Gift", label: "Regalo", Icon: Gift },
    { value: "Camera", label: "Cámara", Icon: Camera },
    { value: "Clock", label: "Reloj", Icon: Clock },
];

interface CronogramaEvent {
    time: string;
    title: string;
    icon: string;
}

export function StepCronograma() {
    const { data, setData, nextStep } = useWizardStore();
    const { showToast } = useToast();
    const [showInfo, setShowInfo] = useState(false);
    const [attemptedNext, setAttemptedNext] = useState(false);
    
    let initialEvents: CronogramaEvent[] = [];
    try {
        const parsed = data.cronogramaEventos ? JSON.parse(data.cronogramaEventos) : [];
        if (Array.isArray(parsed)) initialEvents = parsed;
    } catch {
        // Si el JSON guardado está corrupto, se arranca vacío.
    }

    // Si la ceremonia está habilitada en su paso propio, evitar item redundante "Ceremonia"
    if (data.ceremoniaHabilitada) {
        initialEvents = initialEvents.filter(e => e.title.toLowerCase().trim() !== "ceremonia");
    }

    const [events, setEvents] = useState<CronogramaEvent[]>(initialEvents);

    const addEvent = () => {
        const newEvents = [...events, { time: "", title: "", icon: "Clock" }];
        setEvents(newEvents);
        setData({ cronogramaEventos: JSON.stringify(newEvents) });
    };

    const removeEvent = (index: number) => {
        const newEvents = events.filter((_, i) => i !== index);
        setEvents(newEvents);
        setData({ cronogramaEventos: JSON.stringify(newEvents) });
    };

    const updateEvent = (index: number, field: keyof CronogramaEvent, value: string) => {
        const newEvents = [...events];
        newEvents[index] = { ...newEvents[index], [field]: value };
        setEvents(newEvents);
        setData({ cronogramaEventos: JSON.stringify(newEvents) });
    };

    const incompleteIndexes = events
        .map((e, i) => (!e.time.trim() || !e.title.trim() ? i : -1))
        .filter((i) => i !== -1);

    const handleNext = () => {
        if (events.length === 0) {
            setAttemptedNext(true);
            showToast("Agregá al menos una etapa al cronograma antes de continuar.", "error");
            return;
        }
        if (incompleteIndexes.length > 0) {
            setAttemptedNext(true);
            showToast("Completá la hora y el título de todas las etapas del cronograma antes de continuar.", "error");
            return;
        }
        setAttemptedNext(false);
        nextStep();
    };

    return (
        <div className="space-y-6">
            <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold">Cronograma del Evento</h2>
                <p className="text-muted-foreground text-sm">
                    Definí los momentos principales de tu celebración
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
                        <span>¿Cómo funciona el Cronograma?</span>
                    </div>
                    <div className="text-amber-400 opacity-80 hover:opacity-100 transition-opacity shrink-0">
                        {showInfo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                </button>

                {showInfo && (
                    <div className="px-4 pb-4 pt-1 border-t border-amber-500/20 text-[13px] leading-relaxed opacity-95 animate-in fade-in duration-200">
                        El cronograma organiza y comunica las distintas etapas de tu fiesta (ej: Recepción, Cena, Brindis, Baile). Podés personalizar los horarios, editar los títulos e iconos de cada momento, agregar nuevas etapas o eliminar las que no necesites.
                    </div>
                )}
            </div>

            <div className="space-y-4 max-w-2xl mx-auto">
                {events.length === 0 && (
                    <div className="flex items-start gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>Todavía no agregaste ninguna etapa. Agregá al menos una para poder continuar.</span>
                    </div>
                )}
                {events.map((event, index) => {
                    const isIncomplete = attemptedNext && (!event.time.trim() || !event.title.trim());
                    return (
                    <div key={index} className={`p-4 border rounded-xl space-y-3 bg-[var(--ink-2)] shadow-sm ${isIncomplete ? 'border-red-500/60' : 'border-white/10'}`}>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                                Etapa #{index + 1}
                            </span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeEvent(index)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 px-2"
                            >
                                <Trash2 className="w-4 h-4 mr-1" />
                                <span className="text-xs">Eliminar</span>
                            </Button>
                        </div>

                        <div className="grid md:grid-cols-[1fr_2fr_1.5fr] gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Hora</Label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
                                    <Input
                                        type="time"
                                        value={event.time}
                                        onChange={(e) => updateEvent(index, "time", e.target.value)}
                                        required
                                        className="pl-9 [&::-webkit-calendar-picker-indicator]:hidden cursor-pointer"
                                        onClick={(e) => "showPicker" in e.currentTarget && typeof e.currentTarget.showPicker === 'function' && e.currentTarget.showPicker()}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs">Actividad / Momento</Label>
                                <Input
                                    type="text"
                                    placeholder="Ej: Recepción / Cena"
                                    value={event.title}
                                    onChange={(e) => updateEvent(index, "title", e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs">Icono</Label>
                                <div className="grid grid-cols-4 gap-1 p-1 border border-white/10 rounded-xl bg-[var(--ink)]">
                                    {ICON_OPTIONS.map(({ value, Icon }) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => updateEvent(index, "icon", value)}
                                            className={`
                                                p-2 rounded-lg transition-all flex items-center justify-center
                                                ${event.icon === value
                                                    ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                                                    : 'hover:bg-white/5 text-muted-foreground'
                                                }
                                            `}
                                        >
                                            <Icon className="w-4 h-4" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        {isIncomplete && (
                            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                <span>Completá la hora y el título de esta etapa, o eliminala.</span>
                            </div>
                        )}
                    </div>
                    );
                })}

                <Button
                    type="button"
                    variant="outline"
                    onClick={addEvent}
                    className="w-full border-dashed h-11 border-amber-500/40 hover:bg-amber-500/10 text-amber-300"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Etapa al Cronograma
                </Button>
            </div>

            <SaveStepButtons onNext={handleNext} />
        </div>
    );
}
