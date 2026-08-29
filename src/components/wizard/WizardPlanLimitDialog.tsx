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
import { PLAN_FEATURE_HIGHLIGHTS } from "@/lib/plan-limits";

interface Credits {
    premiumCredits: number;
    diamondCredits: number;
}

// Selector Premium/Diamond reutilizado en dos contextos: (1) "Crear
// Invitación" choca con el límite del plan Gratis (el cliente ya tiene una
// tarjeta Gratis activa, ver PLAN_LIMITS.FREE.maxInvitations) mientras arma
// una nueva desde el wizard, o (2) "Habilitar funciones Premium/Diamond"
// sobre una invitación Gratis ya creada (ver EventShareCard.tsx). En ambos
// casos nunca se ofrece "Crear Gratis" -- por definición no es una opción
// válida acá.
export function WizardPlanLimitDialog({
    open,
    onOpenChange,
    onUseCredit,
    onPayMercadoPago,
    title = "Llegaste al límite del plan Gratis",
    description = "Ya tenés una invitación Gratis activa -- elegí Premium o Diamond para crear esta.",
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUseCredit: (credit: "PREMIUM" | "DIAMOND") => void;
    onPayMercadoPago: (credit: "PREMIUM" | "DIAMOND") => Promise<void> | void;
    title?: string;
    description?: string;
}) {
    const [credits, setCredits] = useState<Credits | null>(null);
    const [showNoCredits, setShowNoCredits] = useState<null | "PREMIUM" | "DIAMOND">(null);
    const [confirmTier, setConfirmTier] = useState<null | "PREMIUM" | "DIAMOND">(null);
    const [isPaying, setIsPaying] = useState(false);
    const [isConfirmingCredit, setIsConfirmingCredit] = useState(false);

    useEffect(() => {
        if (!open) return;
        fetch("/api/user/credits")
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => setCredits({ premiumCredits: data?.premiumCredits || 0, diamondCredits: data?.diamondCredits || 0 }))
            .catch(() => setCredits({ premiumCredits: 0, diamondCredits: 0 }));
    }, [open]);

    const handleOpenChange = (o: boolean) => {
        if (!o) {
            setConfirmTier(null);
            setIsConfirmingCredit(false);
        }
        onOpenChange(o);
    };

    // Si ya tiene el crédito, no lo gastamos apenas toca la tarjeta -- primero
    // avisamos qué va a pasar (ver confirmTier) y recién en ese paso se
    // dispara onUseCredit. Sin crédito, va directo a Mercado Pago.
    const pick = (tier: "PREMIUM" | "DIAMOND") => {
        const has = tier === "PREMIUM" ? (credits?.premiumCredits ?? 0) > 0 : (credits?.diamondCredits ?? 0) > 0;
        if (has) {
            setConfirmTier(tier);
        } else {
            setShowNoCredits(tier);
        }
    };

    const confirmUseCredit = () => {
        if (!confirmTier) return;
        setIsConfirmingCredit(true);
        onUseCredit(confirmTier);
        handleOpenChange(false);
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
            <Dialog open={open && !showNoCredits} onOpenChange={handleOpenChange}>
                <DialogContent>
                    {confirmTier ? (
                        <>
                            <DialogHeader>
                                <DialogTitle>Confirmar uso de crédito {confirmTier === "DIAMOND" ? "Diamond" : "Premium"}</DialogTitle>
                                <DialogDescription className="pt-1">
                                    Tenés {confirmTier === "DIAMOND" ? credits?.diamondCredits : credits?.premiumCredits} crédito{(confirmTier === "DIAMOND" ? credits?.diamondCredits : credits?.premiumCredits) === 1 ? "" : "s"} {confirmTier === "DIAMOND" ? "Diamond" : "Premium"} disponible{(confirmTier === "DIAMOND" ? credits?.diamondCredits : credits?.premiumCredits) === 1 ? "" : "s"}. Al confirmar, se va a usar uno para convertir esta invitación -- no se te va a cobrar nada.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex gap-2.5 mt-2">
                                <button
                                    type="button"
                                    onClick={() => setConfirmTier(null)}
                                    disabled={isConfirmingCredit}
                                    className="flex-1 h-10 rounded-xl border border-border text-sm font-semibold hover:bg-muted/50 transition-colors disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={confirmUseCredit}
                                    disabled={isConfirmingCredit}
                                    className={`flex-1 h-10 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 ${confirmTier === "DIAMOND" ? "bg-[#67e8f9] text-black hover:opacity-90" : "bg-yellow-500 text-black hover:opacity-90"}`}
                                >
                                    Confirmar y usar crédito
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <DialogHeader>
                                <DialogTitle>{title}</DialogTitle>
                                <DialogDescription className="pt-1">
                                    {description}
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
                                        <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                                            {PLAN_FEATURE_HIGHLIGHTS.PREMIUM.map((f) => (
                                                <li key={f}>• {f}</li>
                                            ))}
                                        </ul>
                                        <p className="text-xs text-yellow-500/80 font-medium mt-1">
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
                                        <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                                            {PLAN_FEATURE_HIGHLIGHTS.DIAMOND.map((f) => (
                                                <li key={f}>• {f}</li>
                                            ))}
                                        </ul>
                                        <p className="text-xs text-[#67e8f9]/80 font-medium mt-1">
                                            {credits ? `${credits.diamondCredits} ${credits.diamondCredits === 1 ? "crédito disponible" : "créditos disponibles"}` : "Consultando créditos..."}
                                        </p>
                                    </div>
                                </button>
                            </div>
                        </>
                    )}
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
