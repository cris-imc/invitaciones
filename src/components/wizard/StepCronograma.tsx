"use client";

import { useState } from "react";
import { useWizardStore } from "@/store/wizard-store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Heart, Music, Utensils, Calendar, Gift, Camera, Clock, Trash2, Plus } from "lucide-react";

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
    const { data, setData, nextStep, prevStep } = useWizardStore();
    
    // Parse cronogramaEventos from JSON string
    const parsedEvents: CronogramaEvent[] = data.cronogramaEventos 
        ? JSON.parse(data.cronogramaEventos) 
        : [
            { time: "19:00", title: "Ceremonia", icon: "Heart" },
            { time: "20:30", title: "Recepción", icon: "Music" },
            { time: "21:00", title: "Cena", icon: "Utensils" },
            { time: "23:00", title: "Fiesta", icon: "Music" }
        ];

    const [events, setEvents] = useState<CronogramaEvent[]>(parsedEvents);

    const addEvent = () => {
        setEvents([...events, { time: "", title: "", icon: "Clock" }]);
    };

    const removeEvent = (index: number) => {
        setEvents(events.filter((_, i) => i !== index));
    };

    const updateEvent = (index: number, field: keyof CronogramaEvent, value: string) => {
        const newEvents = [...events];
        newEvents[index] = { ...newEvents[index], [field]: value };
        setEvents(newEvents);
    };

    const handleNext = () => {
        // Save events to store as JSON string
        setData({ cronogramaEventos: JSON.stringify(events) });
        nextStep();
    };

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Cronograma del Evento</h2>
                <p className="text-muted-foreground">
                    Define la secuencia de actividades de tu celebración
                </p>
            </div>

            <div className="space-y-4">
                {events.map((event, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3 bg-white shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">
                                Evento #{index + 1}
                            </span>
                            {events.length > 1 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeEvent(index)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            )}
                        </div>

                        <div className="grid md:grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <Label>Hora</Label>
                                <Input
                                    type="time"
                                    value={event.time}
                                    onChange={(e) => updateEvent(index, "time", e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <Label>Actividad</Label>
                                <Input
                                    type="text"
                                    placeholder="Ej: Ceremonia"
                                    value={event.title}
                                    onChange={(e) => updateEvent(index, "title", e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <Label>Icono</Label>
                                <div className="grid grid-cols-4 gap-1 p-1 border rounded-md">
                                    {ICON_OPTIONS.map(({ value, Icon }) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => updateEvent(index, "icon", value)}
                                            className={`
                                                p-2 rounded transition-all
                                                ${event.icon === value
                                                    ? 'bg-primary text-white'
                                                    : 'hover:bg-gray-100'
                                                }
                                            `}
                                        >
                                            <Icon className="w-4 h-4 mx-auto" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                <Button
                    type="button"
                    variant="outline"
                    onClick={addEvent}
                    className="w-full border-dashed"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Evento
                </Button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                    💡 <strong>Tip:</strong> El cronograma ayuda a tus invitados a planificar su llegada y saber qué esperar durante el evento.
                </p>
            </div>

            <div className="flex justify-between pt-6">
                <Button type="button" variant="outline" onClick={prevStep}>
                    Anterior
                </Button>
                <Button onClick={handleNext}>
                    Siguiente
                </Button>
            </div>
        </div>
    );
}
