"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useWizardStore } from "@/store/wizard-store";
import { detailsSchema } from "@/lib/schemas/invitation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { MapPin, Clock, Info, ChevronDown, ChevronUp, Shirt } from "lucide-react";
import { SaveStepButtons } from "./SaveStepButtons";

export function StepDetails() {
    const { data, setData, nextStep } = useWizardStore();
    const [showInfo, setShowInfo] = useState(false);

    const form = useForm<z.infer<typeof detailsSchema>>({
        resolver: zodResolver(detailsSchema),
        defaultValues: {
            lugarNombre: data.lugarNombre || "",
            direccion: data.direccion || "",
            hora: data.hora || "",
            mapUrl: data.mapUrl || "",
            portadaDressCode: data.portadaDressCode || "",
        },
    });

    // Reactividad en vivo: sincronizar estado local con el store global
    // para que la miniatura se actualice mientras el usuario escribe.
    useEffect(() => {
        const subscription = form.watch((value) => {
            if (value) {
                setData(value as any);
            }
        });
        return () => subscription.unsubscribe();
    }, [form, setData]);

    const currentDressCode = form.watch("portadaDressCode");
    const predefinedOptions = ["Elegante", "Elegante Sport", "Casual", "Formal", "De Gala"];
    
    const [isCustomMode, setIsCustomMode] = useState(() => {
        const code = data.portadaDressCode;
        return code ? !predefinedOptions.includes(code) : false;
    });

    function onSubmit(values: z.infer<typeof detailsSchema>) {
        setData(values);
        nextStep();
    }

    return (
        <div className="space-y-6">
            <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold">Detalles de la Fiesta</h2>
                <p className="text-muted-foreground text-sm">¿Dónde y a qué hora será la celebración?</p>
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
                        <span>¿Cómo configurar la Ubicación del Salón?</span>
                    </div>
                    <div className="text-amber-400 opacity-80 hover:opacity-100 transition-opacity shrink-0">
                        {showInfo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                </button>

                {showInfo && (
                    <div className="px-4 pb-4 pt-1 border-t border-amber-500/20 text-[13px] leading-relaxed opacity-95 animate-in fade-in duration-200">
                        Ingresá el nombre del salón o quinta, la dirección física y la URL del enlace a Google Maps. Tus invitados dispondrán de un botón interactivo <strong>&quot;Cómo llegar&quot;</strong> que abrirá la ubicación directamente en el GPS de su celular.
                    </div>
                )}
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto">
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
                            <FormItem className="flex flex-col justify-end">
                                <FormLabel>Dirección Completa</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                                <FormItem className="flex flex-col justify-end">
                                    <FormLabel>Horario</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
                                            <Input
                                                type="time"
                                                className="pl-9 [&::-webkit-calendar-picker-indicator]:hidden cursor-pointer"
                                                onClick={(e) => "showPicker" in e.currentTarget && typeof e.currentTarget.showPicker === 'function' && e.currentTarget.showPicker()}
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
                            name="mapUrl"
                            render={({ field }) => (
                                <FormItem className="flex flex-col justify-end">
                                    <FormLabel>Enlace Google Maps (Opcional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Pegá el link que copiaste de Google Maps" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground -mt-2">
                        Vale cualquier link de Google Maps (el de "Compartir" o el de la barra de direcciones).
                    </p>

                    <div className="pt-4 border-t border-border/50">
                        <div className="flex items-center gap-2 mb-4">
                            <Shirt className="w-5 h-5 text-primary" />
                            <h3 className="font-semibold text-lg">Código de Vestimenta</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">Se mostrará en la portada de bienvenida de forma sobria.</p>
                        
                        <div className="space-y-4">
                            <FormItem>
                                <FormLabel className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Opciones de Vestimenta</FormLabel>
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {predefinedOptions.map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => {
                                                setIsCustomMode(false);
                                                form.setValue("portadaDressCode", option, { shouldDirty: true });
                                            }}
                                            className={`text-sm px-4 py-2 rounded-full border transition-all duration-200 ${
                                                !isCustomMode && currentDressCode === option
                                                    ? "bg-amber-500/25 border-amber-400 text-amber-200 shadow-sm font-medium"
                                                    : "bg-white/5 border-white/10 hover:bg-white/10 text-slate-300"
                                            }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsCustomMode(true);
                                            form.setValue("portadaDressCode", "", { shouldDirty: true });
                                        }}
                                        className={`text-sm px-4 py-2 rounded-full border transition-all duration-200 ${
                                            isCustomMode
                                                ? "bg-amber-500/25 border-amber-400 text-amber-200 shadow-sm font-semibold"
                                                : "bg-white/5 border-white/10 hover:bg-white/10 text-slate-300"
                                        }`}
                                    >
                                        Personalizado...
                                    </button>
                                </div>
                            </FormItem>

                            {isCustomMode && (
                                <FormField
                                    control={form.control}
                                    name="portadaDressCode"
                                    render={({ field }) => (
                                        <FormItem className="animate-in fade-in slide-in-from-top-2 duration-200">
                                            <FormLabel>Especifíca tu Dress Code</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ej: Total White, Disfraz, etc." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>
                    </div>

                    <SaveStepButtons form={form} isLastStep={false} />
                </form>
            </Form>
        </div>
    );
}
