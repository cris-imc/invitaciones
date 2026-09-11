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
import { useTextos } from "@/components/i18n/ProveedorIdioma";
import { CampoHora } from "./CampoHora";

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
    const t = useTextos();
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
            showToast(t("wizard.cronograma.faltanDatos"), "error");
            return;
        }

        // La primera etapa no puede empezar antes de la hora de inicio del
        // evento (cargada en el paso "Detalles de la Fiesta"). Comparación de
        // strings "HH:MM" funciona directo porque ambos vienen del mismo
        // formato de <input type="time">.
        const eventoHora = (data.hora || "").trim();
        const primeraEtapaHora = events[0]?.time?.trim();
        
        if (primeraEtapaHora && eventoHora) {
            const parseTime = (t: string) => {
                const [h, m] = t.split(':').map(Number);
                return (h || 0) * 60 + (m || 0);
            };
            
            const eventoMin = parseTime(eventoHora);
            let primeraMin = parseTime(primeraEtapaHora);
            
            // Si el evento arranca al mediodía o más tarde (>= 12:00) y la primera etapa es de 
            // madrugada (antes de las 09:00), asumimos que cruzó la medianoche hacia el día siguiente.
            if (eventoMin >= 720 && primeraMin < 540) {
                primeraMin += 1440;
            }
            
            if (primeraMin < eventoMin) {
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
                    {t("wizard.cronograma.titulo")}
                    <span className="text-base font-normal text-muted-foreground ml-2">{t("wizard.cronograma.opcional")}</span>
                </h2>
                <p className="text-muted-foreground text-sm">
                    {t("wizard.cronograma.subtitulo")}
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
                        <span>{t("wizard.cronograma.infoTitulo")}</span>
                    </div>
                    <div className="text-amber-400 opacity-80 hover:opacity-100 transition-opacity shrink-0">
                        {showInfo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                </button>

                {showInfo && (
                    <div className="px-4 pb-4 pt-1 border-t border-amber-500/20 text-[13px] leading-relaxed opacity-95 animate-in fade-in duration-200">
                        {t("wizard.cronograma.infoTexto")}
                    </div>
                )}
            </div>

            <div className="space-y-4 max-w-2xl mx-auto">
                {events.map((event, index) => {
                    const isIncomplete = attemptedNext && (!event.time.trim() || !event.title.trim());
                    return (
                    <div key={index} className={`p-4 border rounded-xl space-y-3 bg-[var(--ink-2)] shadow-sm ${isIncomplete ? 'border-red-500/60' : 'border-[var(--line)]'}`}>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                                {t("wizard.cronograma.etapa", { numero: index + 1 })}
                            </span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeEvent(index)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 px-2"
                            >
                                <Trash2 className="w-4 h-4 mr-1" />
                                <span className="text-xs">{t("comun.eliminar")}</span>
                            </Button>
                        </div>

                        <div className="grid md:grid-cols-[1fr_3fr] gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">{t("wizard.cronograma.hora")}</Label>
                                <CampoHora
                                    value={event.time}
                                    onChange={(valor) => updateEvent(index, "time", valor)}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs">{t("wizard.cronograma.actividad")}</Label>
                                <Input
                                    type="text"
                                    placeholder={t("wizard.cronograma.actividadPlaceholder")}
                                    value={event.title}
                                    onChange={(e) => updateEvent(index, "title", e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        {isIncomplete && (
                            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                <span>{t("wizard.cronograma.etapaIncompleta")}</span>
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
                    {t("wizard.cronograma.agregar")}
                </Button>
            </div>

            <SaveStepButtons onNext={handleNext} />

            <Dialog open={showTimeError} onOpenChange={setShowTimeError}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-500">
                            <AlertTriangle className="w-5 h-5 shrink-0" />
                            {t("wizard.cronograma.errorHoraTitulo")}
                        </DialogTitle>
                        <DialogDescription>
                            {t("wizard.cronograma.errorHoraTexto", {
                                hora: data.hora ?? "",
                                etapa: events[0]?.title || t("wizard.cronograma.etapa", { numero: 1 }),
                                horaEtapa: events[0]?.time ?? "",
                            })}
                            <br /><br />
                            {t("wizard.cronograma.errorHoraAyuda")}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setShowTimeError(false)}>{t("wizard.entendido")}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
