"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useWizardStore } from "@/store/wizard-store";
import { detailsSchema } from "@/lib/schemas/invitation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { MapPin, Clock } from "lucide-react";

export function StepDetails() {
    const { data, setData, nextStep, prevStep } = useWizardStore();

    const form = useForm<z.infer<typeof detailsSchema>>({
        resolver: zodResolver(detailsSchema),
        defaultValues: {
            lugarNombre: data.lugarNombre || "",
            direccion: data.direccion || "",
            hora: data.hora || "",
            mapUrl: data.mapUrl || "",
        },
    });

    function onSubmit(values: z.infer<typeof detailsSchema>) {
        setData(values);
        nextStep();
    }

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold">Detalles del Evento</h2>
                <p className="text-muted-foreground">¿Dónde y cuándo será la fiesta?</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="lugarNombre"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre del Lugar / Salón</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ej: Salón Los Olivos" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="direccion"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Dirección Completa</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input className="pl-9" placeholder="Calle 123, Ciudad" {...field} />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="hora"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Horario</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input className="pl-9" type="time" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="mapUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Link de Google Maps (Opcional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://goo.gl/maps/..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="flex justify-between pt-4">
                        <Button type="button" variant="outline" onClick={prevStep}>Atrás</Button>
                        <Button type="submit">Siguiente Paso</Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
