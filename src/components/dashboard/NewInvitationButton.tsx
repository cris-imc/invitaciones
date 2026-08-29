"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWizardStore } from "@/store/wizard-store";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Gift, Sparkles, Diamond, ChevronRight } from "lucide-react";
import { NoCreditsDialog } from "./NoCreditsDialog";
import { useToast } from "@/components/ui/Toast";
import { PLAN_FEATURE_HIGHLIGHTS } from "@/lib/plan-limits";

export function NewInvitationButton({ premiumCredits, diamondCredits = 0, totalInvitations, planTier, hasFreeInvitation = false, autoOpen = false, renderTrigger }: { premiumCredits: number, diamondCredits?: number, totalInvitations: number, planTier?: string, hasFreeInvitation?: boolean, autoOpen?: boolean, renderTrigger?: (onClick: () => void) => React.ReactNode }) {
    const [open, setOpen] = useState(autoOpen);
    const [showError, setShowError] = useState(false);
    const [errorCreditType, setErrorCreditType] = useState<'premium' | 'diamond'>('premium');
    const [isPaying, setIsPaying] = useState(false);
    const router = useRouter();
    const { showToast } = useToast();
    const setUsePremiumCredit = useWizardStore((state) => state.setUsePremiumCredit);
    const setUseDiamondCredit = useWizardStore((state) => state.setUseDiamondCredit);
    const hasUnlimitedPremium = planTier === 'PREMIUM' || planTier === 'DIAMOND' || planTier === 'ENTERPRISE' || planTier === 'ADMIN';

    const handleNewClick = () => {
        // Siempre pregunta gratis/premium, incluida la primera invitación.
        setOpen(true);
    };

    const handleCreateFree = () => {
        setUsePremiumCredit(false);
        setUseDiamondCredit(false);
        setOpen(false);
        router.push("/dashboard/invitaciones/crear?premium=0");
    };

    const handleCreatePremium = () => {
        if (!hasUnlimitedPremium && premiumCredits <= 0) {
            setOpen(false);
            setErrorCreditType('premium');
            setTimeout(() => setShowError(true), 150);
            return;
        }
        setUsePremiumCredit(true);
        setUseDiamondCredit(false);
        setOpen(false);
        router.push("/dashboard/invitaciones/crear?premium=1");
    };

    const handleCreateDiamond = () => {
        if (!hasUnlimitedPremium && diamondCredits <= 0) {
            setOpen(false);
            setErrorCreditType('diamond');
            setTimeout(() => setShowError(true), 150);
            return;
        }
        setUsePremiumCredit(false);
        setUseDiamondCredit(true);
        setOpen(false);
        router.push("/dashboard/invitaciones/crear?diamond=1");
    };

    const handlePayMercadoPago = async () => {
        setIsPaying(true);
        try {
            const res = await fetch("/api/user/buy-credit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planTier: errorCreditType === "diamond" ? "DIAMOND" : "PREMIUM" }),
            });
            const responseData = await res.json();
            if (!res.ok || !responseData.checkoutUrl) {
                throw new Error(responseData.error || "Error al iniciar el pago");
            }
            window.location.href = responseData.checkoutUrl;
        } catch (error) {
            showToast(error instanceof Error ? error.message : "Error al iniciar el pago", "error");
            setIsPaying(false);
        }
    };

    return (
        <>
            {renderTrigger ? renderTrigger(handleNewClick) : (
                <Button onClick={handleNewClick} className="l-cta text-ink bg-accent hover:bg-accent/90 border-none rounded-full px-6">
                    + Nueva invitación
                </Button>
            )}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Elegí tu tipo de invitación</DialogTitle>
                        <DialogDescription className="pt-1">
                            ¿Qué tipo de invitación querés crear?
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-2.5 mt-2">
                        {/* El plan Gratis solo admite una tarjeta activa -- si ya
                            tiene una, ni mostramos la opción (evita que elija
                            Gratis solo para chocar con el límite al final del
                            wizard, ver StepInfoAdicional.tsx). */}
                        {!hasFreeInvitation && (
                            <button
                                type="button"
                                onClick={handleCreateFree}
                                className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-border hover:border-foreground/25 hover:bg-muted/50 transition-colors text-left"
                            >
                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                                    <Gift className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm">Crear Gratis</p>
                                    <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                                        {PLAN_FEATURE_HIGHLIGHTS.FREE.map((f) => (
                                            <li key={f}>• {f}</li>
                                        ))}
                                    </ul>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={handleCreatePremium}
                            className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-yellow-500/30 hover:border-yellow-500/60 hover:bg-yellow-500/5 transition-colors text-left"
                        >
                            <div className="w-10 h-10 rounded-full bg-yellow-500/15 flex items-center justify-center shrink-0">
                                <Sparkles className="w-5 h-5 text-yellow-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-yellow-500">Usar Crédito Premium</p>
                                <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                                    {PLAN_FEATURE_HIGHLIGHTS.PREMIUM.map((f) => (
                                        <li key={f}>• {f}</li>
                                    ))}
                                </ul>
                                <p className="text-xs text-yellow-500/80 font-medium mt-1">
                                    {hasUnlimitedPremium
                                        ? "Invitaciones premium ilimitadas por tu plan"
                                        : `${premiumCredits} ${premiumCredits === 1 ? 'crédito disponible' : 'créditos disponibles'}`}
                                </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-yellow-500/60 shrink-0" />
                        </button>

                        <button
                            type="button"
                            onClick={handleCreateDiamond}
                            className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-[#67e8f9]/40 hover:border-[#67e8f9] hover:bg-[#67e8f9]/5 transition-colors text-left"
                        >
                            <div className="w-10 h-10 rounded-full bg-[#67e8f9]/15 flex items-center justify-center shrink-0">
                                <Diamond className="w-5 h-5 text-[#67e8f9]" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-[#67e8f9]">Usar Crédito Diamond</p>
                                <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                                    {PLAN_FEATURE_HIGHLIGHTS.DIAMOND.map((f) => (
                                        <li key={f}>• {f}</li>
                                    ))}
                                </ul>
                                <p className="text-xs text-[#67e8f9]/80 font-medium mt-1">
                                    {hasUnlimitedPremium
                                        ? "Invitaciones premium ilimitadas por tu plan"
                                        : `${diamondCredits} ${diamondCredits === 1 ? 'crédito disponible' : 'créditos disponibles'}`}
                                </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-[#67e8f9]/60 shrink-0" />
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            <NoCreditsDialog
                open={showError}
                onOpenChange={setShowError}
                planLabel={errorCreditType}
                onCreateFree={hasFreeInvitation ? undefined : handleCreateFree}
                onPayMercadoPago={handlePayMercadoPago}
                isPaying={isPaying}
            />
        </>
    );
}
