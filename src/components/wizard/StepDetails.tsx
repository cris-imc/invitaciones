"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useWizardStore } from "@/store/wizard-store";
import { detailsSchema, LUGAR_NOMBRE_MAX_LENGTH, DIRECCION_MAX_LENGTH } from "@/lib/schemas/invitation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { MapPin, Clock, Info, ChevronDown, ChevronUp, Shirt } from "lucide-react";
import { SaveStepButtons } from "./SaveStepButtons";
import { useTextos } from "@/components/i18n/ProveedorIdioma";
import { CampoHora } from "./CampoHora";

export function StepDetails() {
    const { data, setData, nextStep } = useWizardStore();
    const t = useTextos();
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
    const lugarNombreValue = form.watch("lugarNombre") || "";
    const direccionValue = form.watch("direccion") || "";
    const lugarNombreOverLimit = lugarNombreValue.length > LUGAR_NOMBRE_MAX_LENGTH;
    const direccionOverLimit = direccionValue.length > DIRECCION_MAX_LENGTH;
    const predefinedOptions = [
        t("wizard.salon.vestimenta1"),
        t("wizard.salon.vestimenta2"),
        t("wizard.salon.vestimenta3"),
        t("wizard.salon.vestimenta4"),
        t("wizard.salon.vestimenta5"),
    ];
    
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
                <h2 className="text-2xl font-bold">{t("wizard.salon.titulo")}</h2>
                <p className="text-muted-foreground text-sm">{t("wizard.salon.subtitulo")}</p>
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
                        <span>{t("wizard.salon.infoTitulo")}</span>
                    </div>
                    <div className="text-amber-400 opacity-80 hover:opacity-100 transition-opacity shrink-0">
                        {showInfo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                </button>

                {showInfo && (
                    <div className="px-4 pb-4 pt-1 border-t border-amber-500/20 text-[13px] leading-relaxed opacity-95 animate-in fade-in duration-200">
                        {t("wizard.salon.infoTexto")}
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
                                <div className="flex justify-between items-center h-5">
                                    <FormLabel>{t("wizard.salon.lugarNombre")}</FormLabel>
                                    <span className={`text-[10px] font-mono ${lugarNombreOverLimit ? "text-red-400 font-bold" : "text-muted-foreground"}`}>
                                        {lugarNombreValue.length}/{LUGAR_NOMBRE_MAX_LENGTH}
                                    </span>
                                </div>
                                <FormControl>
                                    {/* Sin maxLength a propósito -- ver mismo criterio en
                                        StepInfoAdicional.tsx: dejamos escribir/pegar de más,
                                        marcamos en rojo el contador y bloqueamos "Siguiente"
                                        (validación de detailsSchema) hasta que lo acorten. */}
                                    <Input
                                        placeholder={t("wizard.salon.lugarPlaceholder")}
                                        className={lugarNombreOverLimit ? "border-red-500 focus-visible:ring-red-500" : undefined}
                                        {...field}
                                    />
                                </FormControl>
                                {lugarNombreOverLimit && (
                                    <p className="text-xs text-red-400">
                                        {t("wizard.salon.excesoNombre", { cantidad: lugarNombreValue.length - LUGAR_NOMBRE_MAX_LENGTH })}
                                    </p>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="direccion"
                        render={({ field }) => (
                            <FormItem className="flex flex-col justify-end">
                                <div className="flex justify-between items-center h-5">
                                    <FormLabel>{t("wizard.salon.direccion")}</FormLabel>
                                    <span className={`text-[10px] font-mono ${direccionOverLimit ? "text-red-400 font-bold" : "text-muted-foreground"}`}>
                                        {direccionValue.length}/{DIRECCION_MAX_LENGTH}
                                    </span>
                                </div>
                                <FormControl>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            className={`pl-9 ${direccionOverLimit ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                            placeholder={t("wizard.salon.direccionPlaceholder")}
                                            {...field}
                                        />
                                    </div>
                                </FormControl>
                                {direccionOverLimit && (
                                    <p className="text-xs text-red-400">
                                        {t("wizard.salon.excesoDireccion", { cantidad: direccionValue.length - DIRECCION_MAX_LENGTH })}
                                    </p>
                                )}
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
                                    <FormLabel>{t("wizard.salon.horario")}</FormLabel>
                                    <FormControl>
                                        <CampoHora
                                                name={field.name}
                                                value={field.value}
                                                onChange={field.onChange}
                                                onBlur={field.onBlur}
                                            />
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
                                    <FormLabel>{t("wizard.salon.mapa")}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t("wizard.salon.mapaPlaceholder")} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground -mt-2">
                        {t("wizard.salon.mapaAyuda")}
                    </p>

                    <div className="pt-4 border-t border-border/50">
                        <div className="flex items-center gap-2 mb-4">
                            <Shirt className="w-5 h-5 text-primary" />
                            <h3 className="font-semibold text-lg">{t("wizard.salon.vestimenta")}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">{t("wizard.salon.vestimentaAyuda")}</p>
                        
                        <div className="space-y-4">
                            <FormItem>
                                <FormLabel className="text-xs font-semibold text-amber-400 uppercase tracking-wider">{t("wizard.salon.vestimentaOpciones")}</FormLabel>
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
                                                    : "bg-[var(--tinte-1)] border-[var(--line)] hover:bg-[var(--tinte-2)] text-[var(--shell-fg-mid)]"
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
                                                : "bg-[var(--tinte-1)] border-[var(--line)] hover:bg-[var(--tinte-2)] text-[var(--shell-fg-mid)]"
                                        }`}
                                    >
                                        {t("wizard.salon.vestimentaPersonalizado")}
                                    </button>
                                </div>
                            </FormItem>

                            {isCustomMode && (
                                <FormField
                                    control={form.control}
                                    name="portadaDressCode"
                                    render={({ field }) => (
                                        <FormItem className="animate-in fade-in slide-in-from-top-2 duration-200">
                                            <FormLabel>{t("wizard.salon.vestimentaEspecifica")}</FormLabel>
                                            <FormControl>
                                                <Input placeholder={t("wizard.salon.vestimentaPlaceholder")} maxLength={20} {...field} />
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
