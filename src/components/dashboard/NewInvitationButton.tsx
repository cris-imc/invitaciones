"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWizardStore } from "@/store/wizard-store";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Gift, Sparkles, Diamond, ChevronRight } from "lucide-react";
import Link from "next/link";

const WHATSAPP_SUPPORT_URL = `https://wa.me/5493517660000?text=${encodeURIComponent("Hola! Quiero comprar créditos premium para crear una invitación")}`;

export function NewInvitationButton({ premiumCredits, diamondCredits = 0, totalInvitations, planTier, autoOpen = false, renderTrigger }: { premiumCredits: number, diamondCredits?: number, totalInvitations: number, planTier?: string, autoOpen?: boolean, renderTrigger?: (onClick: () => void) => React.ReactNode }) {
    const [open, setOpen] = useState(autoOpen);
    const [showError, setShowError] = useState(false);
    const [errorCreditType, setErrorCreditType] = useState<'premium' | 'diamond'>('premium');
    const router = useRouter();
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
                                <p className="text-xs text-muted-foreground">Sin costo, funciones básicas</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                        </button>

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
                                <p className="text-xs text-muted-foreground">
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
                            className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-[var(--accent,#C79A4B)]/40 hover:border-[var(--accent,#C79A4B)] hover:bg-[var(--accent,#C79A4B)]/5 transition-colors text-left"
                        >
                            <div className="w-10 h-10 rounded-full bg-[var(--accent,#C79A4B)]/15 flex items-center justify-center shrink-0">
                                <Diamond className="w-5 h-5 text-[var(--accent,#C79A4B)]" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-[var(--accent,#C79A4B)]">Usar Crédito Diamond</p>
                                <p className="text-xs text-muted-foreground">
                                    {hasUnlimitedPremium
                                        ? "Invitaciones premium ilimitadas por tu plan"
                                        : `${diamondCredits} ${diamondCredits === 1 ? 'crédito disponible' : 'créditos disponibles'}`}
                                </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-[var(--accent,#C79A4B)]/60 shrink-0" />
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={showError} onOpenChange={setShowError}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600 flex items-center gap-2">
                            <span>⚠️</span> Sin créditos {errorCreditType === 'diamond' ? 'diamond' : 'premium'}
                        </DialogTitle>
                        <DialogDescription className="pt-2">
                            No tenés créditos {errorCreditType === 'diamond' ? 'diamond' : 'premium'} disponibles en tu cuenta. Comunicate con nosotros para adquirir más, o creá una invitación gratis por ahora.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-2">
                        <Button variant="outline" onClick={handleCreateFree} className="w-full sm:w-auto">
                            Crear Gratis
                        </Button>
                        <Link href={WHATSAPP_SUPPORT_URL} target="_blank" className="w-full sm:w-auto">
                            <Button variant="default" className="w-full bg-slate-800 text-white">
                                Contactar por WhatsApp
                            </Button>
                        </Link>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
