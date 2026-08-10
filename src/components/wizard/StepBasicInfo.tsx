"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useWizardStore } from "@/store/wizard-store";
import { basicInfoSchema } from "@/lib/schemas/invitation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Lock, Info, ChevronDown, ChevronUp } from "lucide-react";
import { isEventDateLocked } from "@/lib/expiration";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useSession } from "next-auth/react";
import { SaveStepButtons } from "./SaveStepButtons";

export function StepBasicInfo() {
    const { data, setData, nextStep, prevStep } = useWizardStore();
    const [showInfo, setShowInfo] = useState(false);
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === "ADMIN" || session?.user?.planTier === "ADMIN";

    const [isCustomTitle, setIsCustomTitle] = useState(false); // No longer needed but kept for TS if used
    const tipo = data.type;

    const basicInfoSchemaForType = basicInfoSchema.superRefine((values, ctx) => {
        // Validation for name fields moved to StepEventType
    });

    const form = useForm<z.infer<typeof basicInfoSchema>>({
        resolver: zodResolver(basicInfoSchemaForType),
        defaultValues: {
            fecha: data.fecha,
            ciudad: data.ciudad || "",
            rsvpDaysBeforeEvent: data.rsvpDaysBeforeEvent || 7,
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

    function onSubmit(values: z.infer<typeof basicInfoSchema>) {
        setData(values);
        nextStep();
    }

    return (
        <div className="space-y-6">
            <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold">Información Básica</h2>
                <p className="text-muted-foreground text-sm">Contanos los detalles principales del evento.</p>
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
                        <span>¿Para qué sirve la Información Básica?</span>
                    </div>
                    <div className="text-amber-400 opacity-80 hover:opacity-100 transition-opacity shrink-0">
                        {showInfo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                </button>

                {showInfo && (
                    <div className="px-4 pb-4 pt-1 border-t border-amber-500/20 text-[13px] leading-relaxed opacity-95 animate-in fade-in duration-200">
                        Esta información establece los cimientos de tu invitación: el nombre del evento, la fecha de celebración y los nombres de los agasajados. Con estos datos se calcula la cuenta regresiva, se encabeza la portada y se organiza la agenda de tus invitados.
                    </div>
                )}
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">


                    <FormField
                        control={form.control}
                        name="fecha"
                        render={({ field }) => {
                            // Si no tiene data.id, es una invitación en borrador (no creada)
                            const isEditing = Boolean(data.id);
                            
                            // Bloqueo base: la fecha está dentro de 30 días
                            const baseLocked = data.fecha ? isEventDateLocked(data.fecha) : false;
                            
                            // No bloqueamos si la invitación se creó hace menos de 1 hora
                            // Esto evita que un error de tipeo bloquee la fecha instantáneamente
                            const createdAt = (data as any).createdAt;
                            const isNew = createdAt ? (new Date().getTime() - new Date(createdAt).getTime() < 60 * 60 * 1000) : !isEditing;
                            
                            // El bloqueo real solo aplica si ya fue creada (isEditing) y no es "nueva" (dentro de la primera hora)
                            const isDateLocked = !isAdmin && baseLocked && !isNew;
                            
                            // Si queremos mostrar el cartel de administrador de que él puede editar,
                            // o el cartel rojo a un usuario de que está bloqueada.
                            // Solo se debe mostrar si baseLocked es true, y NO es nueva.
                            const showLockStatus = baseLocked && !isNew;

                            return (
                                <FormItem className="flex flex-col">
                                    <FormLabel className="flex items-center justify-between">
                                        <span>Fecha del Evento</span>
                                        {showLockStatus && (
                                            <span className={`text-xs flex items-center gap-1 font-semibold ${isAdmin ? 'text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                                <Lock className="w-3 h-3" /> {isAdmin ? "👑 Desbloqueado (Admin)" : "Bloqueada (30d)"}
                                            </span>
                                        )}
                                    </FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                 <Button
                                                    variant={"outline"}
                                                    disabled={isDateLocked}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal bg-[var(--ink-2)] border border-white/20 text-[var(--on-ink)] h-12 rounded-xl hover:bg-[var(--ink-2)]/80 hover:text-[var(--on-ink)] disabled:opacity-60 disabled:cursor-not-allowed",
                                                        !field.value && "text-white/30"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP", { locale: es })
                                                    ) : (
                                                        <span>Selecciona una fecha</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        {!isDateLocked && (
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        !isAdmin && date < new Date()
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        )}
                                    </Popover>
                                    {showLockStatus && !isAdmin && (
                                        <p className="text-xs text-amber-600 dark:text-amber-400">
                                            Fecha bloqueada por seguridad. Faltan 30 días o menos para la fecha del evento.
                                        </p>
                                    )}
                                    {showLockStatus && isAdmin && (
                                        <p className="text-xs text-green-400 font-medium">
                                            👑 Habilitado por rol Administrador: tenés permiso para editar la fecha aunque falten menos de 30 días.
                                        </p>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            );
                        }}
                    />

                    <FormField
                        control={form.control}
                        name="ciudad"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ciudad / Localidad del Evento</FormLabel>
                                <FormControl>
                                    <Input
                                        className="bg-[var(--ink-2)] border border-white/20 text-[var(--on-ink)] placeholder:text-white/30 h-12 rounded-xl"
                                        placeholder="Ej: Buenos Aires, Rosario, Mendoza..."
                                        {...field}
                                    />
                                </FormControl>
                                <p className="text-xs text-muted-foreground">
                                    Aparecerá junto a la fecha en la tarjeta de bienvenida de tus invitados.
                                </p>
                                <FormMessage />
                            </FormItem>
                        )}
                    />



                    
                        <SaveStepButtons form={form} />
                    
                </form>
            </Form>
        </div>
    );
}
