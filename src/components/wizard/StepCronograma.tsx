"use client";

import { useState } from "react";
import { useWizardStore } from "@/store/wizard-store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/Toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
    const [showTimeError, setShowTimeError] = useState(false);
    
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
        if (incompleteIndexes.length > 0) {
            setAttemptedNext(true);
            showToast("Completá la hora y el título de todas las etapas del cronograma antes de continuar.", "error");
            return;
        }

        // La primera etapa no puede empezar antes de la hora de inicio del
        // evento (cargada en el paso "Detalles de la Fiesta"). Comparación de
        // strings "HH:MM" funciona directo porque ambos vienen del mismo
        // formato de <input type="time">.
        const eventoHora = (data.hora || "").trim();
        const primeraEtapaHora = events[0]?.time?.trim();
        
        if (primeraEtapaHora && eventoHora) {
            const parseTime = (timeStr: string) => {
                const [h, m] = timeStr.split(':').map(Number);
                return h * 60 + m;
            };

            let stageMins = parseTime(primeraEtapaHora);
            let eventMins = parseTime(eventoHora);

            // Si el evento arranca al mediodía o más tarde (>= 12:00),
            // y la etapa es de madrugada (< 08:00), consideramos que es del día siguiente.
            if (eventMins >= 720 && stageMins < 480) {
                stageMins += 1440; // Sumar 24 horas
            }

            if (stageMins < eventMins) {
                setShowTimeError(true);
                return;
            }
        }

        setAttemptedNext(false);
        nextStep();
    };

    return (
        <div className="space-y-6">
            <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold">
                    Cronograma del Evento
                    <span className="text-base font-normal text-muted-foreground ml-2">(Opcional)</span>
                </h2>
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

                        <div className="grid md:grid-cols-[1fr_3fr] gap-3">
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

            <Dialog open={showTimeError} onOpenChange={setShowTimeError}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-500">
                            <AlertTriangle className="w-5 h-5 shrink-0" />
                            La primera etapa empieza antes que el evento
                        </DialogTitle>
                        <DialogDescription>
                            Tu evento empieza a las <strong>{data.hora}</strong>, pero la primera etapa del
                            cronograma ({events[0]?.title || "Etapa #1"}) está cargada a las{" "}
                            <strong>{events[0]?.time}</strong>, antes de esa hora.
                            <br /><br />
                            Revisá el horario del evento en el paso &quot;Detalles de la Fiesta&quot;, o ajustá la
                            hora de esta etapa para que no sea anterior al inicio del evento.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setShowTimeError(false)}>Entendido</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
