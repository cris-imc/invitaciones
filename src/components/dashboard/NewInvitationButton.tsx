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

export function NewInvitationButton({ premiumCredits, totalInvitations, planTier, autoOpen = false }: { premiumCredits: number, totalInvitations: number, planTier?: string, autoOpen?: boolean }) {
    const [open, setOpen] = useState(autoOpen);
    const [showError, setShowError] = useState(false);
    const router = useRouter();
    const setUsePremiumCredit = useWizardStore((state) => state.setUsePremiumCredit);
    const hasUnlimitedPremium = planTier === 'PREMIUM' || planTier === 'ENTERPRISE' || planTier === 'ADMIN';

    const handleNewClick = () => {
        // Siempre pregunta gratis/premium, incluida la primera invitación.
        setOpen(true);
    };

    const handleCreateFree = () => {
        setUsePremiumCredit(false);
        setOpen(false);
        router.push("/dashboard/invitaciones/crear?premium=0");
    };

    const handleCreatePremium = () => {
        if (!hasUnlimitedPremium && premiumCredits <= 0) {
            setOpen(false);
            setTimeout(() => setShowError(true), 150);
            return;
        }
        setUsePremiumCredit(true);
        setOpen(false);
        router.push("/dashboard/invitaciones/crear?premium=1");
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
                            No tenés créditos premium disponibles en tu cuenta. Comunicate con nosotros para adquirir más, o creá una invitación gratis por ahora.
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
