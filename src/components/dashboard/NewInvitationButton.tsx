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
import { Sparkles } from "lucide-react";
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
    // Los planes ilimitados ya se cubren con el botón "Premium" (hereda su
    // propio tier al crear); este botón de crédito diamond es solo para
    // cuentas que compraron créditos diamond sueltos sin tener el plan.
    const hasDiamondCredits = !hasUnlimitedPremium && diamondCredits > 0;

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
                        <DialogDescription className="pt-2 space-y-1">
                            {hasUnlimitedPremium ? (
                                <span>Tu plan te permite crear <strong>invitaciones {planTier === 'DIAMOND' || planTier === 'ENTERPRISE' || planTier === 'ADMIN' ? 'diamond' : 'premium'} ilimitadas</strong>. ¿Qué tipo de invitación querés crear?</span>
                            ) : (
                                <>
                                    <span className="block">Tenés <strong>{premiumCredits} {premiumCredits === 1 ? 'crédito premium' : 'créditos premium'}</strong> disponible{premiumCredits === 1 ? '' : 's'}{hasDiamondCredits && <> y <strong>{diamondCredits} {diamondCredits === 1 ? 'crédito diamond' : 'créditos diamond'}</strong></>}.</span>
                                    <span className="block">¿Qué tipo de invitación querés crear?</span>
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-2">
                        <Button variant="outline" onClick={handleCreateFree} className="w-full sm:w-auto">
                            Crear Gratis
                        </Button>
                        <Button onClick={handleCreatePremium} className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-white flex items-center justify-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Usar Crédito Premium
                        </Button>
                        {hasDiamondCredits && (
                            <Button onClick={handleCreateDiamond} className="w-full sm:w-auto bg-[var(--accent,#C79A4B)] hover:opacity-90 text-[var(--ink,#0F1613)] flex items-center justify-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                Usar Crédito Diamond
                            </Button>
                        )}
                    </DialogFooter>
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
