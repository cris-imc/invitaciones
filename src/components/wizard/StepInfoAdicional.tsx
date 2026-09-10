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
import { useTextos } from "@/components/i18n/ProveedorIdioma";
import type { ClaveTexto } from "@/lib/i18n/texto";

interface InfoField {
    key: "alojamiento" | "estacionamiento" | "transporte" | "adicional";
    habilitadoField: "infoAlojamientoHabilitado" | "infoEstacionamientoHabilitado" | "infoTransporteHabilitado" | "infoAdicionalHabilitado";
    textField: "infoAlojamientoTexto" | "infoEstacionamientoTexto" | "infoTransporteTexto" | "infoAdicionalTexto";
    icon: typeof BedDouble;
    title: ClaveTexto;
    description: ClaveTexto;
    placeholder: ClaveTexto;
}

const FIELDS: InfoField[] = [
    {
        key: "alojamiento",
        habilitadoField: "infoAlojamientoHabilitado",
        textField: "infoAlojamientoTexto",
        icon: BedDouble,
        title: "wizard.infoAdicional.alojamiento",
        description: "wizard.infoAdicional.alojamientoDetalle",
        placeholder: "wizard.infoAdicional.alojamientoPlaceholder",
    },
    {
        key: "estacionamiento",
        habilitadoField: "infoEstacionamientoHabilitado",
        textField: "infoEstacionamientoTexto",
        icon: CircleParking,
        title: "wizard.infoAdicional.estacionamiento",
        description: "wizard.infoAdicional.estacionamientoDetalle",
        placeholder: "wizard.infoAdicional.estacionamientoPlaceholder",
    },
    {
        key: "transporte",
        habilitadoField: "infoTransporteHabilitado",
        textField: "infoTransporteTexto",
        icon: Bus,
        title: "wizard.infoAdicional.transporte",
        description: "wizard.infoAdicional.transporteDetalle",
        placeholder: "wizard.infoAdicional.transportePlaceholder",
    },
    {
        key: "adicional",
        habilitadoField: "infoAdicionalHabilitado",
        textField: "infoAdicionalTexto",
        icon: Info,
        title: "wizard.infoAdicional.adicional",
        description: "wizard.infoAdicional.adicionalDetalle",
        placeholder: "wizard.infoAdicional.adicionalPlaceholder",
    },
];

export function StepInfoAdicional() {
    const { data, setData } = useWizardStore();
    const t = useTextos();
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
            showToast(
                t("wizard.infoAdicional.errorCrear", {
                    mensaje: error instanceof Error ? error.message : t("wizard.infoAdicional.errorDesconocido"),
                }),
                "error"
            );
            setIsCreating(false);
        }
    };

    const handleCreate = async () => {
        if (missingText) {
            showToast(t("wizard.infoAdicional.faltaTexto"), "error");
            return;
        }
        if (overLimitField) {
            showToast(t("wizard.infoAdicional.avisoExceso", { seccion: t(overLimitField.title) }), "error");
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
                throw new Error(responseData.error || t("wizard.infoAdicional.errorPago"));
            }
            useWizardStore.getState().setDirty(false);
            window.location.href = responseData.checkoutUrl;
        } catch (error) {
            showToast(error instanceof Error ? error.message : t("wizard.infoAdicional.errorPago"), "error");
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold">{t("wizard.infoAdicional.titulo")}</h2>
                <p className="text-muted-foreground text-sm">
                    {t("wizard.infoAdicional.subtitulo")}
                </p>
            </div>

            <div className="flex items-center justify-between gap-3 bg-amber-500/10 border border-amber-500/30 p-5 rounded-2xl shadow-sm">
                <div className="flex items-start gap-2.5 min-w-0">
                    <Info className="w-4.5 h-4.5 shrink-0 text-amber-400 mt-0.5" />
                    <div className="min-w-0">
                        <Label htmlFor="enable-info-adicional" className="text-base font-semibold text-amber-100 cursor-pointer">
                            {t("wizard.infoAdicional.interruptor")}
                        </Label>
                        <p className="text-xs text-amber-200/80">
                            {t("wizard.infoAdicional.interruptorAyuda")}
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
                    <div key={field.key} className="space-y-4 bg-[var(--ink-2)] border border-[var(--line)] p-5 rounded-2xl shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <Label htmlFor={`enable-${field.key}`} className="flex items-center gap-2 text-base font-semibold cursor-pointer">
                                        {t(field.title)}
                                    </Label>
                                    <p className="text-xs text-muted-foreground">{t(field.description)}</p>
                                </div>
                            </div>
                            <Switch
                                id={`enable-${field.key}`}
                                checked={isActive}
                                onCheckedChange={(checked) => setData({ [field.habilitadoField]: checked } as any)}
                            />
                        </div>

                        {isActive && (
                            <div className="space-y-1.5 pt-4 border-t border-[var(--line)] animate-in fade-in duration-200">
                                <div className="flex justify-between items-center h-5">
                                    <Label htmlFor={`text-${field.key}`} className="text-xs font-medium">{t("wizard.infoAdicional.textoInvitados")}</Label>
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
                                    placeholder={t(field.placeholder)}
                                    value={text}
                                    rows={3}
                                    className={isOverLimit ? "border-red-500 focus-visible:ring-red-500" : undefined}
                                    onChange={(e) => setData({ [field.textField]: e.target.value } as any)}
                                />
                                {isOverLimit && (
                                    <p className="text-xs text-red-400">
                                        {t("wizard.infoAdicional.exceso", { cantidad: text.length - maxLength })}
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
