"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useWizardStore } from "@/store/wizard-store";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { BedDouble, CircleParking, Bus, Info } from "lucide-react";
import { SaveStepButtons } from "./SaveStepButtons";
import { INFO_ADICIONAL_MAX_LENGTH } from "@/lib/schemas/invitation";
import { useToast } from "@/components/ui/Toast";
import { saveInvitationFromWizard, SaveInvitationError } from "@/lib/save-invitation";
import { savePendingWizardInvitation } from "@/lib/pending-wizard-invitation";
import { WizardPlanLimitDialog } from "./WizardPlanLimitDialog";

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
    const { data: session } = useSession();
    const { showToast } = useToast();
    const [isCreating, setIsCreating] = useState(false);
    const [showPlanLimitDialog, setShowPlanLimitDialog] = useState(false);
    const d = data as any;

    const missingText = FIELDS.some((field) => d[field.habilitadoField] && !String(d[field.textField] || "").trim());
    const overLimitField = FIELDS.find(
        (field) => d[field.habilitadoField] && String(d[field.textField] || "").length > INFO_ADICIONAL_MAX_LENGTH[field.key]
    );

    // Intenta crear la invitación con un crédito puntual (o sin ninguno, para
    // el alta normal) -- separado de handleCreate para poder reintentarlo
    // desde WizardPlanLimitDialog sin repetir las validaciones de arriba.
    const attemptCreate = async (creditOverride?: { usePremiumCredit: boolean; useDiamondCredit: boolean }) => {
        setIsCreating(true);
        try {
            const invitation = await saveInvitationFromWizard(
                data,
                themeConfig,
                creditOverride ? creditOverride.usePremiumCredit : usePremiumCredit,
                creditOverride ? creditOverride.useDiamondCredit : useDiamondCredit
            );
            useWizardStore.getState().setDirty(false);
            window.location.href = `/dashboard/invitaciones/${invitation.slug}/guests`;
        } catch (error) {
            console.error('Error creating invitation:', error);
            if (error instanceof SaveInvitationError && error.code === 'FREE_LIMIT_REACHED') {
                // Ya tiene una tarjeta Gratis activa (el plan Gratis admite
                // una sola) -- en vez de un error plano, ofrecemos elegir
                // Premium/Diamond ahí mismo, sin perder lo ya cargado en el
                // wizard.
                setIsCreating(false);
                setShowPlanLimitDialog(true);
                return;
            }
            showToast(`Error al crear la invitación: ${error instanceof Error ? error.message : 'Error desconocido'}`, "error");
            setIsCreating(false);
        }
    };

    const handleCreate = async () => {
        if (missingText) {
            showToast("Completá el texto de las secciones que activaste, o desactivalas.", "error");
            return;
        }
        if (overLimitField) {
            showToast(`El texto de "${overLimitField.title}" se pasó del límite -- acortalo para poder continuar.`, "error");
            return;
        }
        if (!session?.user) {
            // Visitante sin cuenta (vino de "Empezar gratis" en la landing
            // directo al wizard, sin registrarse antes). Recién acá -- al
            // tocar "Crear invitación" -- lo mandamos a crear la cuenta y
            // elegir plan; si nunca llega a este paso, no se crea nada. La
            // invitación real se termina de crear cuando vuelva con sesión
            // (ver PendingWizardInvitationBridge).
            savePendingWizardInvitation({ data, themeConfig });
            useWizardStore.getState().setDirty(false);
            window.location.href = "/register?from=wizard";
            return;
        }
        await attemptCreate();
    };

    // El cliente ya tiene crédito de ese tier -- reintenta la creación de
    // una sin salir del wizard.
    const handleUseCredit = (credit: "PREMIUM" | "DIAMOND") => {
        useWizardStore.getState().setUsePremiumCredit(credit === "PREMIUM");
        useWizardStore.getState().setUseDiamondCredit(credit === "DIAMOND");
        attemptCreate({ usePremiumCredit: credit === "PREMIUM", useDiamondCredit: credit === "DIAMOND" });
    };

    // Sin crédito de ese tier -- guarda el wizard como pendiente (la compra
    // en Mercado Pago es una redirección dura, se pierde el estado en
    // memoria) y manda a pagar; PendingWizardInvitationBridge termina de
    // crear la invitación cuando el crédito se acredite.
    const handlePayMercadoPago = async (credit: "PREMIUM" | "DIAMOND") => {
        try {
            savePendingWizardInvitation({ data, themeConfig, desiredCredit: credit });
            const res = await fetch("/api/user/buy-credit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planTier: credit }),
            });
            const responseData = await res.json();
            if (!res.ok || !responseData.checkoutUrl) {
                throw new Error(responseData.error || "Error al iniciar el pago");
            }
            useWizardStore.getState().setDirty(false);
            window.location.href = responseData.checkoutUrl;
        } catch (error) {
            showToast(error instanceof Error ? error.message : "Error al iniciar el pago", "error");
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

            <div className="flex items-center justify-between gap-3 bg-amber-500/10 border border-amber-500/30 p-5 rounded-2xl shadow-sm">
                <div className="flex items-start gap-2.5 min-w-0">
                    <Info className="w-4.5 h-4.5 shrink-0 text-amber-400 mt-0.5" />
                    <div className="min-w-0">
                        <Label htmlFor="enable-info-adicional" className="text-base font-semibold text-amber-100 cursor-pointer">
                            Mostrar esta sección en la invitación
                        </Label>
                        <p className="text-xs text-amber-200/80">
                            Es el interruptor general: si está apagado, el botón "¿Qué necesitás saber?" no aparece
                            aunque hayas cargado información abajo -- podés dejar todo preparado y activarlo cuando quieras.
                        </p>
                    </div>
                </div>
                <Switch
                    id="enable-info-adicional"
                    checked={Boolean(d.infoAdicionalSeccionHabilitada)}
                    onCheckedChange={(checked) => setData({ infoAdicionalSeccionHabilitada: checked } as any)}
                />
            </div>

            {FIELDS.map((field) => {
                const isActive = Boolean(d[field.habilitadoField]);
                const text = d[field.textField] || "";
                const maxLength = INFO_ADICIONAL_MAX_LENGTH[field.key];
                const isOverLimit = text.length > maxLength;
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
                                    <span className={`text-[10px] font-mono ${isOverLimit ? "text-red-400 font-bold" : "text-muted-foreground"}`}>
                                        {text.length}/{maxLength}
                                    </span>
                                </div>
                                {/* Sin maxLength en el textarea a propósito: un maxLength nativo trunca
                                    en silencio -- si el usuario pega un texto más largo, pierde el final
                                    sin darse cuenta. Dejamos escribir/pegar de más, marcamos en rojo el
                                    contador y bloqueamos "Crear invitación" hasta que lo acorte (mismo
                                    criterio que X/Twitter). */}
                                <Textarea
                                    id={`text-${field.key}`}
                                    placeholder={field.placeholder}
                                    value={text}
                                    rows={3}
                                    className={isOverLimit ? "border-red-500 focus-visible:ring-red-500" : undefined}
                                    onChange={(e) => setData({ [field.textField]: e.target.value } as any)}
                                />
                                {isOverLimit && (
                                    <p className="text-xs text-red-400">
                                        Te pasaste por {text.length - maxLength} caracteres -- acortá el texto para poder continuar.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}

            <SaveStepButtons isLastStep onCreate={handleCreate} isCreating={isCreating} disableSave={missingText || Boolean(overLimitField)} />

            <WizardPlanLimitDialog
                open={showPlanLimitDialog}
                onOpenChange={setShowPlanLimitDialog}
                onUseCredit={handleUseCredit}
                onPayMercadoPago={handlePayMercadoPago}
            />
        </div>
    );
}
