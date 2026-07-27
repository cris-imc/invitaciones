"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useWizardStore } from "@/store/wizard-store";
import { ceremoniaSchema } from "@/lib/schemas/invitation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Church, MapPin, Clock } from "lucide-react";
import { SaveStepButtons } from "./SaveStepButtons";

export function StepCeremonia() {
    const { data, setData, nextStep, prevStep } = useWizardStore();

    const form = useForm<z.infer<typeof ceremoniaSchema>>({
        resolver: zodResolver(ceremoniaSchema),
        defaultValues: {
            ceremoniaHabilitada: data.ceremoniaHabilitada ?? false,
            ceremoniaTitulo: data.ceremoniaTitulo || "Ceremonia Religiosa / Civil",
            ceremoniaNombre: data.ceremoniaNombre || "",
            ceremoniaDireccion: data.ceremoniaDireccion || "",
            ceremoniaHora: data.ceremoniaHora || "",
            ceremoniaMapUrl: data.ceremoniaMapUrl || "",
        },
    });

    const ceremoniaHabilitada = form.watch("ceremoniaHabilitada");

    function onSubmit(values: z.infer<typeof ceremoniaSchema>) {
        setData(values);
        nextStep();
    }

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <div className="mx-auto w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mb-3">
                    <Church className="w-6 h-6 text-accent" />
                </div>
                <h2 className="text-2xl font-bold">Ceremonia Religiosa / Civil</h2>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                    Si la ceremonia o el matrimonio civil se realiza en una ubicación o fecha/hora distinta al salón de fiesta, activa esta sección.
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="ceremoniaHabilitada"
                        render={({ field }) => (
                            <FormItem className="flex items-center justify-between p-4 border border-white/20 rounded-xl bg-[var(--ink-2)]">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base font-semibold">
                                        ¿Agregar ubicación de Iglesia / Civil?
                                    </FormLabel>
                                    <p className="text-xs text-muted-foreground">
                                        (Opcional - Actívalo si la ceremonia es en otro lugar)
                                    </p>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    {ceremoniaHabilitada && (
                        <div className="space-y-4 p-5 border border-white/10 rounded-2xl bg-[var(--ink)]/40">
                            <FormField
                                control={form.control}
                                name="ceremoniaTitulo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Título de la Sección</FormLabel>
                                        <FormControl>
                                            <Input
                                                className="bg-[var(--ink-2)] border border-white/20 text-[var(--on-ink)] h-12 rounded-xl"
                                                placeholder="Ej: Ceremonia Religiosa, Registro Civil, Boda"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="ceremoniaNombre"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre de la Iglesia / Registro Civil / Lugar</FormLabel>
                                        <FormControl>
                                            <Input
                                                className="bg-[var(--ink-2)] border border-white/20 text-[var(--on-ink)] h-12 rounded-xl"
                                                placeholder="Ej: Parroquia Nuestra Señora del Carmen"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="ceremoniaDireccion"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Dirección</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        className="pl-9 bg-[var(--ink-2)] border border-white/20 text-[var(--on-ink)] h-12 rounded-xl"
                                                        placeholder="Ej: Av. Santa Fe 1234"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="ceremoniaHora"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Horario de la Ceremonia</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
                                                    <Input
                                                        type="time"
                                                        className="pl-9 bg-[var(--ink-2)] border border-white/20 text-[var(--on-ink)] h-12 rounded-xl [&::-webkit-calendar-picker-indicator]:hidden cursor-pointer"
                                                        onClick={(e) => "showPicker" in e.currentTarget && typeof e.currentTarget.showPicker === 'function' && e.currentTarget.showPicker()}
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="ceremoniaMapUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Link de Google Maps de la Ceremonia (Opcional)</FormLabel>
                                        <FormControl>
                                            <Input
                                                className="bg-[var(--ink-2)] border border-white/20 text-[var(--on-ink)] h-12 rounded-xl"
                                                placeholder="https://maps.google.com/?q=..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}

                    
                        <SaveStepButtons form={form} />
                    
                </form>
            </Form>
        </div>
    );
}
