"use client";

import { useEffect, useState } from "react";
import { Sparkles, Diamond } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { NoCreditsDialog } from "@/components/dashboard/NoCreditsDialog";

interface Credits {
    premiumCredits: number;
    diamondCredits: number;
}

// Se muestra cuando "Crear Invitación" choca con el límite del plan Gratis
// (el cliente ya tiene una tarjeta Gratis activa, ver PLAN_LIMITS.FREE.
// maxInvitations) -- a diferencia del diálogo de "+ Nueva invitación" del
// dashboard, acá nunca se ofrece "Crear Gratis" (por definición no es una
// opción válida en este momento).
export function WizardPlanLimitDialog({
    open,
    onOpenChange,
    onUseCredit,
    onPayMercadoPago,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUseCredit: (credit: "PREMIUM" | "DIAMOND") => void;
    onPayMercadoPago: (credit: "PREMIUM" | "DIAMOND") => Promise<void> | void;
}) {
    const [credits, setCredits] = useState<Credits | null>(null);
    const [showNoCredits, setShowNoCredits] = useState<null | "PREMIUM" | "DIAMOND">(null);
    const [isPaying, setIsPaying] = useState(false);

    useEffect(() => {
        if (!open) return;
        fetch("/api/user/credits")
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => setCredits({ premiumCredits: data?.premiumCredits || 0, diamondCredits: data?.diamondCredits || 0 }))
            .catch(() => setCredits({ premiumCredits: 0, diamondCredits: 0 }));
    }, [open]);

    const pick = (tier: "PREMIUM" | "DIAMOND") => {
        const has = tier === "PREMIUM" ? (credits?.premiumCredits ?? 0) > 0 : (credits?.diamondCredits ?? 0) > 0;
        if (has) {
            onOpenChange(false);
            onUseCredit(tier);
        } else {
            setShowNoCredits(tier);
        }
    };

    const handlePay = async () => {
        if (!showNoCredits) return;
        setIsPaying(true);
        await onPayMercadoPago(showNoCredits);
        // Si falla, el padre ya mostró el toast -- no reseteamos isPaying para
        // no reabilitar el botón mientras la redirección a Mercado Pago está
        // en curso.
    };

    return (
        <>
            <Dialog open={open && !showNoCredits} onOpenChange={onOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Llegaste al límite del plan Gratis</DialogTitle>
                        <DialogDescription className="pt-1">
                            Ya tenés una invitación Gratis activa -- elegí Premium o Diamond para crear esta.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-2.5 mt-2">
                        <button
                            type="button"
                            onClick={() => pick("PREMIUM")}
                            className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-yellow-500/30 hover:border-yellow-500/60 hover:bg-yellow-500/5 transition-colors text-left"
                        >
                            <div className="w-10 h-10 rounded-full bg-yellow-500/15 flex items-center justify-center shrink-0">
                                <Sparkles className="w-5 h-5 text-yellow-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-yellow-500">Usar Premium</p>
                                <p className="text-xs text-muted-foreground">
                                    {credits ? `${credits.premiumCredits} ${credits.premiumCredits === 1 ? "crédito disponible" : "créditos disponibles"}` : "Consultando créditos..."}
                                </p>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => pick("DIAMOND")}
                            className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-[#67e8f9]/40 hover:border-[#67e8f9] hover:bg-[#67e8f9]/5 transition-colors text-left"
                        >
                            <div className="w-10 h-10 rounded-full bg-[#67e8f9]/15 flex items-center justify-center shrink-0">
                                <Diamond className="w-5 h-5 text-[#67e8f9]" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-[#67e8f9]">Usar Diamond</p>
                                <p className="text-xs text-muted-foreground">
                                    {credits ? `${credits.diamondCredits} ${credits.diamondCredits === 1 ? "crédito disponible" : "créditos disponibles"}` : "Consultando créditos..."}
                                </p>
                            </div>
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            <NoCreditsDialog
                open={Boolean(showNoCredits)}
                onOpenChange={(o) => {
                    if (!o) {
                        setShowNoCredits(null);
                        setIsPaying(false);
                    }
                }}
                planLabel={showNoCredits === "DIAMOND" ? "diamond" : "premium"}
                onPayMercadoPago={handlePay}
                isPaying={isPaying}
            />
        </>
    );
}
