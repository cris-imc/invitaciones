"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useWizardStore } from "@/store/wizard-store";
import { eventTypeSchema } from "@/lib/schemas/invitation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { CalendarHeart, Crown, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";

const predefinedCasamiento = ["Nuestra Boda", "Nos Casamos", "¡Nos Casamos!"];
const predefinedQuince = ["Mis 15 Años", "Mis Quince", "¡Mis 15!"];

const formatName = (value: string) => {
    if (!value) return value;
    // Si está todo en mayúsculas, lo pasamos a minúsculas para que el title-case haga efecto 
    // y no quede todo en mayúsculas (que puede romper fuentes decorativas).
    if (value === value.toUpperCase() && /[a-zA-Z]/.test(value)) {
        value = value.toLowerCase();
    }
    // Siempre capitalizamos la primera letra de cada palabra
    return value.replace(/(?:^|\s|-)\S/g, match => match.toUpperCase());
};

export function StepEventType() {
    const { data, setData, nextStep } = useWizardStore();
    const router = useRouter();

    const [isCustomTitle, setIsCustomTitle] = useState(() => {
        if (data.type === 'CUMPLEANOS') return true;
        if (!data.nombreEvento) return false;
        if (data.type === 'CASAMIENTO' && !predefinedCasamiento.includes(data.nombreEvento)) return true;
        if (data.type === 'QUINCE_ANOS' && !predefinedQuince.includes(data.nombreEvento)) return true;
        return false;
    });

    const eventTypeSchemaForType = eventTypeSchema.superRefine((values, ctx) => {
        if (!values.type) return;
        if (values.type === 'CASAMIENTO') {
            if (!values.nombreNovia?.trim()) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['nombreNovia'], message: 'El nombre de la novia es obligatorio' });
            }
            if (!values.nombreNovio?.trim()) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['nombreNovio'], message: 'El nombre del novio es obligatorio' });
            }
        }
        if (values.type === 'QUINCE_ANOS' && !values.nombreQuinceanera?.trim()) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['nombreQuinceanera'], message: 'El nombre o apodo de la quinceañera es obligatorio' });
        }
    });

    const form = useForm<z.infer<typeof eventTypeSchema>>({
        resolver: zodResolver(eventTypeSchemaForType),
        defaultValues: {
            type: data.type as any,
            nombreEvento: data.nombreEvento || "",
            nombreNovio: data.nombreNovio || "",
            nombreNovia: data.nombreNovia || "",
            nombreQuinceanera: data.nombreQuinceanera || "",
        },
    });

    useEffect(() => {
        const subscription = form.watch((value) => {
            if (value) {
                setData(value as any);
            }
        });
        return () => subscription.unsubscribe();
    }, [form, setData]);

    const tipo = form.watch("type");

    function onSubmit(values: z.infer<typeof eventTypeSchema>) {
        setData({
            ...values,
            sugerenciaMusicaHabilitada: values.type === "CASAMIENTO" || values.type === "QUINCE_ANOS"
        });
        nextStep();
    }

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold">¿Qué tipo de evento estás organizando?</h2>
                <p className="text-muted-foreground">Elegí la categoría para ver las plantillas ideales.</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                            setData({ type: value as any });
                                        }}
                                        defaultValue={field.value}
                                        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                                    >
                                        <FormItem>
                                            <FormControl>
                                                <RadioGroupItem value="CASAMIENTO" className="peer sr-only" />
                                            </FormControl>
                                            <FormLabel className="flex flex-col items-center justify-center text-center h-full min-h-[120px] rounded-xl bg-[var(--ink-2)] border border-[var(--ink-2)] p-4 hover:border-[var(--paper)]/50 cursor-pointer shadow-sm peer-data-[state=checked]:border-[var(--paper)] transition-all">
                                                <CalendarHeart className="mb-3 h-8 w-8 text-[var(--accent)]" />
                                                <span className="text-sm font-semibold">Casamiento</span>
                                            </FormLabel>
                                        </FormItem>

                                        <FormItem>
                                            <FormControl>
                                                <RadioGroupItem value="QUINCE_ANOS" className="peer sr-only" />
                                            </FormControl>
                                            <FormLabel className="flex flex-col items-center justify-center text-center h-full min-h-[120px] rounded-xl bg-[var(--ink-2)] border border-[var(--ink-2)] p-4 hover:border-[var(--paper)]/50 cursor-pointer shadow-sm peer-data-[state=checked]:border-[var(--paper)] transition-all">
                                                <Crown className="mb-3 h-8 w-8 text-pink-500" />
                                                <span className="text-sm font-semibold">15 Años</span>
                                            </FormLabel>
                                        </FormItem>

                                        <FormItem>
                                            <FormControl>
                                                <RadioGroupItem value="CUMPLEANOS" className="peer sr-only" />
                                            </FormControl>
                                            <FormLabel className="flex flex-col items-center justify-center text-center h-full min-h-[120px] rounded-xl bg-[var(--ink-2)] border border-[var(--ink-2)] p-4 hover:border-[var(--paper)]/50 cursor-pointer shadow-sm peer-data-[state=checked]:border-[var(--paper)] transition-all">
                                                <PartyPopper className="mb-3 h-8 w-8 text-yellow-500" />
                                                <span className="text-sm font-semibold">Evento</span>
                                            </FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {tipo && (
                        <div className="space-y-6 pt-4 border-t border-white/10 animate-in fade-in slide-in-from-top-4 duration-300">
                            <FormField
                                control={form.control}
                                name="nombreEvento"
                                render={({ field }) => {
                                    const options = tipo === 'CASAMIENTO' ? predefinedCasamiento : (tipo === 'QUINCE_ANOS' ? predefinedQuince : []);
                                    return (
                                        <FormItem>
                                            <FormLabel>Título de la Invitación</FormLabel>
                                            <FormControl>
                                                <div className="flex flex-col gap-3">
                                                    {options.length > 0 && (
                                                        <div className="flex flex-wrap gap-2">
                                                            {options.map(opt => (
                                                                <button
                                                                    key={opt}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        field.onChange(opt);
                                                                        setIsCustomTitle(false);
                                                                    }}
                                                                    className={cn(
                                                                        "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                                                                        field.value === opt && !isCustomTitle
                                                                            ? "bg-amber-500 text-white border-amber-600"
                                                                            : "bg-[var(--ink-2)] text-white/70 hover:text-white border border-white/10 hover:border-white/20"
                                                                    )}
                                                                >
                                                                    {opt}
                                                                </button>
                                                            ))}
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setIsCustomTitle(true);
                                                                    if (options.includes(field.value || "")) {
                                                                        field.onChange("");
                                                                    }
                                                                }}
                                                                className={cn(
                                                                    "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                                                                    isCustomTitle
                                                                        ? "bg-amber-500 text-white border-amber-600"
                                                                        : "bg-[var(--ink-2)] text-white/70 hover:text-white border border-white/10 hover:border-white/20"
                                                                )}
                                                            >
                                                                Personalizado
                                                            </button>
                                                        </div>
                                                    )}
                                                    {(isCustomTitle || options.length === 0) && (
                                                        <Input 
                                                            className="bg-[var(--ink-2)] border border-white/20 text-[var(--on-ink)] placeholder:text-white/30 h-12 rounded-xl mt-2"
                                                            placeholder={
                                                                tipo === 'CASAMIENTO' ? "Ej: Nuestra Boda" :
                                                                    tipo === 'QUINCE_ANOS' ? "Ej: Mis 15 Años" :
                                                                        "Ej: Mi Cumpleaños, Mi Bautismo, etc."
                                                            } 
                                                            {...field} 
                                                            value={field.value || ""}
                                                            onChange={(e) => field.onChange(formatName(e.target.value))}
                                                        />
                                                    )}
                                                </div>
                                            </FormControl>
                                            <p className="text-xs text-muted-foreground">
                                                {tipo === 'QUINCE_ANOS'
                                                    ? "Este es el título general de la invitación. Tu nombre lo ingresarás en el siguiente campo."
                                                    : "Este es el título general que aparecerá en la invitación."}
                                            </p>
                                            <FormMessage />
                                        </FormItem>
                                    );
                                }}
                            />

                            {tipo === 'CASAMIENTO' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="nombreNovia"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nombre Novia</FormLabel>
                                                <FormControl>
                                                     <Input className="bg-[var(--ink-2)] border border-white/20 text-[var(--on-ink)] placeholder:text-white/30 h-12 rounded-xl" placeholder="Nombre" {...field} value={field.value || ""} onChange={(e) => field.onChange(formatName(e.target.value))} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="nombreNovio"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nombre Novio</FormLabel>
                                                <FormControl>
                                                     <Input className="bg-[var(--ink-2)] border border-white/20 text-[var(--on-ink)] placeholder:text-white/30 h-12 rounded-xl" placeholder="Nombre" {...field} value={field.value || ""} onChange={(e) => field.onChange(formatName(e.target.value))} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                            {tipo === 'QUINCE_ANOS' && (
                                <FormField
                                    control={form.control}
                                    name="nombreQuinceanera"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nombre o Apodo de la Quinceañera</FormLabel>
                                            <FormControl>
                                                 <Input className="bg-[var(--ink-2)] border border-white/20 text-[var(--on-ink)] placeholder:text-white/30 h-12 rounded-xl" placeholder="Ej: Sofi, Valentina, Mafe..." {...field} value={field.value || ""} onChange={(e) => field.onChange(formatName(e.target.value))} />
                                            </FormControl>
                                            <p className="text-xs text-muted-foreground">
                                                Ingresá el nombre o apodo de la quinceañera que aparecerá destacado en toda la tarjeta.
                                            </p>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {tipo !== 'CASAMIENTO' && tipo !== 'QUINCE_ANOS' && (
                                <FormField
                                    control={form.control}
                                    name="nombreQuinceanera"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nombre del Festejado/a (Opcional)</FormLabel>
                                            <FormControl>
                                                 <Input className="bg-[var(--ink-2)] border border-white/20 text-[var(--on-ink)] placeholder:text-white/30 h-12 rounded-xl" placeholder="Nombre de la persona o empresa" {...field} value={field.value || ""} onChange={(e) => field.onChange(formatName(e.target.value))} />
                                            </FormControl>
                                            <p className="text-xs text-muted-foreground">Si lo dejas vacío, se usará el nombre del evento.</p>
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>
                    )}

                    <div className="flex justify-between items-center mt-8">
                        <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>
                            Atrás
                        </Button>
                        <Button type="submit" size="lg" disabled={!tipo}>Siguiente Paso</Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
