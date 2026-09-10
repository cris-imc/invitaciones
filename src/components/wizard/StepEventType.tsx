"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useWizardStore } from "@/store/wizard-store";
import { eventTypeSchema } from "@/lib/schemas/invitation";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { CalendarHeart, Crown, PartyPopper, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { SaveStepButtons } from "./SaveStepButtons";
import { useTextos } from "@/components/i18n/ProveedorIdioma";
import type { Traductor } from "@/lib/i18n/texto";

// Los títulos sugeridos y el nombre de cada tipo de evento se arman con el
// traductor porque cambian con el idioma del anfitrión: un anfitrión que
// escribe en inglés necesita sugerencias en inglés, no "Nuestra Boda".
const titulosCasamiento = (t: Traductor) => [
    t("wizard.tipoEvento.casamiento1"),
    t("wizard.tipoEvento.casamiento2"),
    t("wizard.tipoEvento.casamiento3"),
];
const titulosQuince = (t: Traductor) => [
    t("wizard.tipoEvento.quince1"),
    t("wizard.tipoEvento.quince2"),
    t("wizard.tipoEvento.quince3"),
];

const nombreDelTipo = (t: Traductor, tipo: string | undefined) =>
    tipo === "CASAMIENTO"
        ? t("wizard.tipoEvento.casamiento")
        : tipo === "QUINCE_ANOS"
        ? t("wizard.tipoEvento.quince")
        : tipo === "CUMPLEANOS"
        ? t("wizard.tipoEvento.otro")
        : tipo;

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
    const t = useTextos();
    const predefinedCasamiento = titulosCasamiento(t);
    const predefinedQuince = titulosQuince(t);
    // Solo se llega a este paso en edición si sos admin (ver
    // wizard-steps-config.ts) -- igual el tipo de evento queda bloqueado:
    // cambiarlo post-creación mezclaría campos/plantillas de un tipo con
    // datos ya guardados del otro. Los nombres sí quedan editables.
    const isEditing = Boolean(data.id);

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
                ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['nombreNovia'], message: t("wizard.tipoEvento.errorNovia") });
            }
            if (!values.nombreNovio?.trim()) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['nombreNovio'], message: t("wizard.tipoEvento.errorNovio") });
            }
        }
        if (values.type === 'QUINCE_ANOS' && !values.nombreQuinceanera?.trim()) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['nombreQuinceanera'], message: t("wizard.tipoEvento.errorQuinceanera") });
        }
    });

    const form = useForm<z.infer<typeof eventTypeSchema>>({
        resolver: zodResolver(eventTypeSchemaForType),
        defaultValues: {
            type: (data.type as any) ?? "",
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
                <h2 className="text-2xl font-bold">{t("wizard.tipoEvento.titulo")}</h2>
                <p className="text-muted-foreground">{t("wizard.tipoEvento.subtitulo")}</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {isEditing ? (
                        <div className="flex items-center gap-3 rounded-xl bg-[var(--ink-2)] border border-[var(--line)] p-4">
                            <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span className="text-sm text-muted-foreground">{t("wizard.tipoEvento.bloqueadoEtiqueta")}</span>
                            <span className="text-sm font-semibold">{nombreDelTipo(t, data.type ?? undefined)}</span>
                            <span className="text-xs text-muted-foreground ml-auto">{t("wizard.tipoEvento.bloqueadoAviso")}</span>
                        </div>
                    ) : (
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
                                                <span className="text-sm font-semibold">{t("wizard.tipoEvento.casamiento")}</span>
                                            </FormLabel>
                                        </FormItem>

                                        <FormItem>
                                            <FormControl>
                                                <RadioGroupItem value="QUINCE_ANOS" className="peer sr-only" />
                                            </FormControl>
                                            <FormLabel className="flex flex-col items-center justify-center text-center h-full min-h-[120px] rounded-xl bg-[var(--ink-2)] border border-[var(--ink-2)] p-4 hover:border-[var(--paper)]/50 cursor-pointer shadow-sm peer-data-[state=checked]:border-[var(--paper)] transition-all">
                                                <Crown className="mb-3 h-8 w-8 text-pink-500" />
                                                <span className="text-sm font-semibold">{t("wizard.tipoEvento.quince")}</span>
                                            </FormLabel>
                                        </FormItem>

                                        <FormItem>
                                            <FormControl>
                                                <RadioGroupItem value="CUMPLEANOS" className="peer sr-only" />
                                            </FormControl>
                                            <FormLabel className="flex flex-col items-center justify-center text-center h-full min-h-[120px] rounded-xl bg-[var(--ink-2)] border border-[var(--ink-2)] p-4 hover:border-[var(--paper)]/50 cursor-pointer shadow-sm peer-data-[state=checked]:border-[var(--paper)] transition-all">
                                                <PartyPopper className="mb-3 h-8 w-8 text-yellow-500" />
                                                <span className="text-sm font-semibold">{t("wizard.tipoEvento.otro")}</span>
                                            </FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    )}

                    {tipo && (
                        <div className="space-y-6 pt-4 border-t border-[var(--line)] animate-in fade-in slide-in-from-top-4 duration-300">
                            <FormField
                                control={form.control}
                                name="nombreEvento"
                                render={({ field }) => {
                                    const options = tipo === 'CASAMIENTO' ? predefinedCasamiento : (tipo === 'QUINCE_ANOS' ? predefinedQuince : []);
                                    return (
                                        <FormItem>
                                            <FormLabel>{t("wizard.tipoEvento.tituloInvitacion")}</FormLabel>
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
                                                                            : "bg-[var(--ink-2)] text-[var(--shell-fg-mid)] hover:text-[var(--foreground)] border border-[var(--line)] hover:border-[var(--campo-borde)]"
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
                                                                        : "bg-[var(--ink-2)] text-[var(--shell-fg-mid)] hover:text-[var(--foreground)] border border-[var(--line)] hover:border-[var(--campo-borde)]"
                                                                )}
                                                            >
                                                                {t("wizard.tipoEvento.personalizado")}
                                                            </button>
                                                        </div>
                                                    )}
                                                    {(isCustomTitle || options.length === 0) && (
                                                        <Input 
                                                            className="bg-[var(--ink-2)] border border-[var(--campo-borde)] text-[var(--on-ink)] placeholder:text-[var(--shell-fg-faint)] h-12 rounded-xl mt-2"
                                                            placeholder={
                                                                tipo === 'CASAMIENTO' ? t("wizard.tipoEvento.placeholderCasamiento") :
                                                                    tipo === 'QUINCE_ANOS' ? t("wizard.tipoEvento.placeholderQuince") :
                                                                        t("wizard.tipoEvento.placeholderOtro")
                                                            } 
                                                            {...field} 
                                                            value={field.value || ""}
                                                            // Removed custom onChange to use the global input formatter
                                                        />
                                                    )}
                                                </div>
                                            </FormControl>
                                            <p className="text-xs text-muted-foreground">
                                                {tipo === 'QUINCE_ANOS'
                                                    ? t("wizard.tipoEvento.ayudaTituloQuince")
                                                    : t("wizard.tipoEvento.ayudaTitulo")}
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
                                                <FormLabel>{t("wizard.tipoEvento.nombreNovia")}</FormLabel>
                                                <FormControl>
                                                     <Input className="bg-[var(--ink-2)] border border-[var(--campo-borde)] text-[var(--on-ink)] placeholder:text-[var(--shell-fg-faint)] h-12 rounded-xl" placeholder="Nombre" {...field} value={field.value || ""} />
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
                                                <FormLabel>{t("wizard.tipoEvento.nombreNovio")}</FormLabel>
                                                <FormControl>
                                                     <Input className="bg-[var(--ink-2)] border border-[var(--campo-borde)] text-[var(--on-ink)] placeholder:text-[var(--shell-fg-faint)] h-12 rounded-xl" placeholder="Nombre" {...field} value={field.value || ""} />
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
                                            <FormLabel>{t("wizard.tipoEvento.nombreQuinceanera")}</FormLabel>
                                            <FormControl>
                                                 <Input className="bg-[var(--ink-2)] border border-[var(--campo-borde)] text-[var(--on-ink)] placeholder:text-[var(--shell-fg-faint)] h-12 rounded-xl" placeholder={t("wizard.tipoEvento.placeholderQuinceanera")} {...field} value={field.value || ""} />
                                            </FormControl>
                                            <p className="text-xs text-muted-foreground">
                                                {t("wizard.tipoEvento.ayudaQuinceanera")}
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
                                            <FormLabel>{t("wizard.tipoEvento.nombreFestejado")}</FormLabel>
                                            <FormControl>
                                                 <Input className="bg-[var(--ink-2)] border border-[var(--campo-borde)] text-[var(--on-ink)] placeholder:text-[var(--shell-fg-faint)] h-12 rounded-xl" placeholder={t("wizard.tipoEvento.placeholderFestejado")} {...field} value={field.value || ""} />
                                            </FormControl>
                                            <p className="text-xs text-muted-foreground">{t("wizard.tipoEvento.ayudaFestejado")}</p>
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>
                    )}

                    <SaveStepButtons form={form} />
                </form>
            </Form>
        </div>
    );
}
