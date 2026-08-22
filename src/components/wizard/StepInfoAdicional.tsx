"use client";

import { useState } from "react";
import { useWizardStore } from "@/store/wizard-store";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { BedDouble, CircleParking, Bus, Info } from "lucide-react";
import { SaveStepButtons } from "./SaveStepButtons";
import { INFO_ADICIONAL_MAX_LENGTH } from "@/lib/schemas/invitation";
import { useToast } from "@/components/ui/Toast";
import { saveInvitationFromWizard } from "@/lib/save-invitation";

interface InfoField {
    key: "alojamiento" | "estacionamiento" | "transporte" | "adicional";
    habilitadoField: "infoAlojamientoHabilitado" | "infoEstacionamientoHabilitado" | "infoTransporteHabilitado" | "infoAdicionalHabilitado";
    textField: "infoAlojamientoTexto" | "infoEstacionamientoTexto" | "infoTransporteTexto" | "infoAdicionalTexto";
    icon: typeof BedDouble;
    title: string;
    description: string;
    placeholder: string;
}

const FIELDS: InfoField[] = [
    {
        key: "alojamiento",
        habilitadoField: "infoAlojamientoHabilitado",
        textField: "infoAlojamientoTexto",
        icon: BedDouble,
        title: "Alojamiento",
        description: "Hoteles o alojamientos recomendados cerca del evento",
        placeholder: "Ej: Hotel Los Álamos, a 5 min del salón. Mencioná \"Casamiento [apellido]\" para la tarifa preferencial.",
    },
    {
        key: "estacionamiento",
        habilitadoField: "infoEstacionamientoHabilitado",
        textField: "infoEstacionamientoTexto",
        icon: CircleParking,
        title: "Estacionamiento",
        description: "Dónde estacionar y si el lugar tiene cochera propia",
        placeholder: "Ej: El salón cuenta con cochera propia gratuita para los invitados.",
    },
    {
        key: "transporte",
        habilitadoField: "infoTransporteHabilitado",
        textField: "infoTransporteTexto",
        icon: Bus,
        title: "Transporte",
        description: "Traslados organizados, remises recomendadas, etc.",
        placeholder: "Ej: Vamos a organizar un traslado en combi desde la iglesia hasta el salón, saliendo a las 20:30.",
    },
    {
        key: "adicional",
        habilitadoField: "infoAdicionalHabilitado",
        textField: "infoAdicionalTexto",
        icon: Info,
        title: "Datos Adicionales",
        description: "Cualquier otra cosa que tus invitados necesiten saber",
        placeholder: "Ej: El evento es al aire libre, te recomendamos llevar un abrigo liviano para la noche.",
    },
];

export function StepInfoAdicional() {
    const { data, setData } = useWizardStore();
    const usePremiumCredit = useWizardStore((state) => state.usePremiumCredit);
    const useDiamondCredit = useWizardStore((state) => state.useDiamondCredit);
    const themeConfig = useWizardStore((state) => state.themeConfig);
    const { showToast } = useToast();
    const [isCreating, setIsCreating] = useState(false);
    const d = data as any;

    const missingText = FIELDS.some((field) => d[field.habilitadoField] && !String(d[field.textField] || "").trim());

    const handleCreate = async () => {
        if (missingText) {
            showToast("Completá el texto de las secciones que activaste, o desactivalas.", "error");
            return;
        }
        setIsCreating(true);
        try {
            const invitation = await saveInvitationFromWizard(data, themeConfig, usePremiumCredit, useDiamondCredit);
            useWizardStore.getState().setDirty(false);
            window.location.href = `/dashboard/invitaciones/${invitation.slug}/guests`;
        } catch (error) {
            console.error('Error creating invitation:', error);
            showToast(`Error al crear la invitación: ${error instanceof Error ? error.message : 'Error desconocido'}`, "error");
            setIsCreating(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold">¿Qué necesitás que sepan tus invitados?</h2>
                <p className="text-muted-foreground text-sm">
                    Datos prácticos como alojamiento, estacionamiento o transporte -- van a aparecer en un botón
                    aparte dentro de la invitación, así no se mezclan con el resto del contenido.
                </p>
            </div>

            {FIELDS.map((field) => {
                const isActive = Boolean(d[field.habilitadoField]);
                const text = d[field.textField] || "";
                const maxLength = INFO_ADICIONAL_MAX_LENGTH[field.key];
                const Icon = field.icon;

                return (
                    <div key={field.key} className="space-y-4 bg-[var(--ink-2)] border border-white/10 p-5 rounded-2xl shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <Label htmlFor={`enable-${field.key}`} className="flex items-center gap-2 text-base font-semibold cursor-pointer">
                                        {field.title}
                                    </Label>
                                    <p className="text-xs text-muted-foreground">{field.description}</p>
                                </div>
                            </div>
                            <Switch
                                id={`enable-${field.key}`}
                                checked={isActive}
                                onCheckedChange={(checked) => setData({ [field.habilitadoField]: checked } as any)}
                            />
                        </div>

                        {isActive && (
                            <div className="space-y-1.5 pt-4 border-t border-white/10 animate-in fade-in duration-200">
                                <div className="flex justify-between items-center h-5">
                                    <Label htmlFor={`text-${field.key}`} className="text-xs font-medium">Texto que van a ver tus invitados</Label>
                                    <span className="text-[10px] font-mono text-muted-foreground">
                                        {text.length}/{maxLength}
                                    </span>
                                </div>
                                <Textarea
                                    id={`text-${field.key}`}
                                    placeholder={field.placeholder}
                                    value={text}
                                    maxLength={maxLength}
                                    rows={3}
                                    onChange={(e) => setData({ [field.textField]: e.target.value } as any)}
                                />
                            </div>
                        )}
                    </div>
                );
            })}

            <SaveStepButtons isLastStep onCreate={handleCreate} isCreating={isCreating} />
        </div>
    );
}
