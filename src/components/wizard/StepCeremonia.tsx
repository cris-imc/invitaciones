"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useWizardStore } from "@/store/wizard-store";
import { ceremoniaSchema } from "@/lib/schemas/invitation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Church, MapPin, Clock, Info, ChevronDown, ChevronUp } from "lucide-react";
import { SaveStepButtons } from "./SaveStepButtons";
import { useTextos } from "@/components/i18n/ProveedorIdioma";
import { CampoHora } from "./CampoHora";

export function StepCeremonia() {
    const { data, setData, nextStep, prevStep } = useWizardStore();
    const t = useTextos();
    const [showInfo, setShowInfo] = useState(false);

    const ceremoniaSchemaValidated = ceremoniaSchema.superRefine((values, ctx) => {
        if (!values.ceremoniaHabilitada) return;
        if (!values.ceremoniaNombre?.trim()) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['ceremoniaNombre'], message: t("wizard.ceremonia.errorNombre") });
        }
        if (!values.ceremoniaDireccion?.trim()) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['ceremoniaDireccion'], message: t("wizard.ceremonia.errorDireccion") });
        }
        if (!values.ceremoniaHora?.trim()) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['ceremoniaHora'], message: t("wizard.ceremonia.errorHora") });
        }
    });

    const form = useForm<any>({
        resolver: zodResolver(ceremoniaSchemaValidated),
        defaultValues: {
            ceremoniaHabilitada: data.ceremoniaHabilitada ?? false,
            ceremoniaTitulo: data.ceremoniaTitulo || t("wizard.ceremonia.titulo"),
            ceremoniaNombre: data.ceremoniaNombre || "",
            ceremoniaDireccion: data.ceremoniaDireccion || "",
            ceremoniaHora: data.ceremoniaHora || "",
            ceremoniaMapUrl: data.ceremoniaMapUrl || "",
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

    const ceremoniaHabilitada = form.watch("ceremoniaHabilitada");

    function onSubmit(values: z.infer<typeof ceremoniaSchema>) {
        setData(values);
        nextStep();
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mb-3">
                    <Church className="w-6 h-6 text-accent" />
                </div>
                <h2 className="text-2xl font-bold">{t("wizard.ceremonia.titulo")}</h2>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                    {t("wizard.ceremonia.subtitulo")}
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
                        <span>{t("wizard.ceremonia.infoTitulo")}</span>
                    </div>
                    <div className="text-amber-400 opacity-80 hover:opacity-100 transition-opacity shrink-0">
                        {showInfo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                </button>

                {showInfo && (
                    <div className="px-4 pb-4 pt-1 border-t border-amber-500/20 text-[13px] leading-relaxed opacity-95 animate-in fade-in duration-200">
                        {t("wizard.ceremonia.infoTexto")}
                    </div>
                )}
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="ceremoniaHabilitada"
                        render={({ field }) => (
                            <FormItem className="flex items-center justify-between p-4 border border-[var(--campo-borde)] rounded-xl bg-[var(--ink-2)]">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base font-semibold">
                                        {t("wizard.ceremonia.activar")}
                                    </FormLabel>
                                    <p className="text-xs text-muted-foreground">
                                        {t("wizard.ceremonia.activarAyuda")}
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
                        <div className="space-y-4 p-5 border border-[var(--line)] rounded-2xl bg-[var(--ink)]/40">
                            <FormField
                                control={form.control}
                                name="ceremoniaTitulo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("wizard.ceremonia.tituloSeccion")}</FormLabel>
                                        <FormControl>
                                            <Input
                                                className="bg-[var(--ink-2)] border border-[var(--campo-borde)] text-[var(--on-ink)] h-12 rounded-xl"
                                                placeholder={t("wizard.ceremonia.tituloSeccionPlaceholder")}
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
                                        <FormLabel>{t("wizard.ceremonia.nombreLugar")}</FormLabel>
                                        <FormControl>
                                            <Input
                                                className="bg-[var(--ink-2)] border border-[var(--campo-borde)] text-[var(--on-ink)] h-12 rounded-xl"
                                                placeholder={t("wizard.ceremonia.nombreLugarPlaceholder")}
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
                                            <FormLabel>{t("wizard.ceremonia.direccion")}</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        className="pl-9 bg-[var(--ink-2)] border border-[var(--campo-borde)] text-[var(--on-ink)] h-12 rounded-xl"
                                                        placeholder={t("wizard.ceremonia.direccionPlaceholder")}
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
                                            <FormLabel>{t("wizard.ceremonia.hora")}</FormLabel>
                                            <FormControl>
                                                <CampoHora
                                                    name={field.name}
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    onBlur={field.onBlur}
                                                    className="pl-9 bg-[var(--ink-2)] border border-[var(--campo-borde)] text-[var(--on-ink)] h-12 rounded-xl"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>


                        </div>
                    )}

                    
                        <SaveStepButtons form={form} />
                    
                </form>
            </Form>
        </div>
    );
}
