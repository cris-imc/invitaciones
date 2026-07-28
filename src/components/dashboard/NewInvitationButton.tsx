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

export function NewInvitationButton({ premiumCredits, totalInvitations, planTier, autoOpen = false }: { premiumCredits: number, totalInvitations: number, planTier?: string, autoOpen?: boolean }) {
    const [open, setOpen] = useState(autoOpen);
    const [showError, setShowError] = useState(false);
    const router = useRouter();
    const setUsePremiumCredit = useWizardStore((state) => state.setUsePremiumCredit);
    const hasUnlimitedPremium = planTier === 'PREMIUM' || planTier === 'ENTERPRISE' || planTier === 'ADMIN';

    const handleNewClick = () => {
        if (totalInvitations === 0) {
            // Primera invitación: no pregunta, usa crédito/plan si tiene o gratis si no
            if (hasUnlimitedPremium || premiumCredits > 0) {
                setUsePremiumCredit(true);
            } else {
                setUsePremiumCredit(false);
            }
            router.push("/dashboard/invitaciones/crear");
        } else {
            // A partir de la segunda: siempre pregunta
            setOpen(true);
        }
    };

    const handleCreateFree = () => {
        setUsePremiumCredit(false);
        setOpen(false);
        router.push("/dashboard/invitaciones/crear");
    };

    const handleCreatePremium = () => {
        if (!hasUnlimitedPremium && premiumCredits <= 0) {
            setOpen(false);
            setTimeout(() => setShowError(true), 150);
            return;
        }
        setUsePremiumCredit(true);
        setOpen(false);
        router.push("/dashboard/invitaciones/crear");
    };

    return (
        <>
            <Button onClick={handleNewClick} className="l-cta text-ink bg-accent hover:bg-accent/90 border-none rounded-full px-6">
                + Nueva invitación
            </Button>
            
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Elegí tu tipo de invitación</DialogTitle>
                        <DialogDescription className="pt-2">
                            {hasUnlimitedPremium ? (
                                <span>Tu plan te permite crear <strong>invitaciones premium ilimitadas</strong>. ¿Qué tipo de invitación querés crear?</span>
                            ) : (
                                <span>Tenés <strong>{premiumCredits} {premiumCredits === 1 ? 'crédito premium' : 'créditos premium'}</strong> disponible{premiumCredits === 1 ? '' : 's'}. ¿Qué tipo de invitación querés crear?</span>
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
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showError} onOpenChange={setShowError}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600 flex items-center gap-2">
                            <span>⚠️</span> Sin créditos premium
                        </DialogTitle>
                        <DialogDescription className="pt-2">
                            No tienes créditos premium disponibles en tu cuenta. Por favor, comunícate con soporte (vía WhatsApp) para adquirir más créditos o crea una invitación gratis por ahora.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-6">
                        <Button variant="default" onClick={() => setShowError(false)} className="w-full sm:w-auto bg-slate-800 text-white">
                            Entendido
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
