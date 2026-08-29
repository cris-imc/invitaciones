"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const WHATSAPP_SUPPORT_URL = `https://wa.me/5493517660000?text=${encodeURIComponent("Hola! Quiero comprar créditos premium para crear una invitación")}`;

// Se muestra cuando el cliente elige Premium/Diamond pero no tiene crédito
// -- antes solo ofrecía contactar por WhatsApp, ahora también puede pagar
// con Mercado Pago y conseguir el crédito al instante (ver
// /api/user/buy-credit). Compartido entre NewInvitationButton (dashboard) y
// WizardPlanLimitDialog (wizard, cuando ya usó la tarjeta Gratis).
export function NoCreditsDialog({
    open,
    onOpenChange,
    planLabel,
    onCreateFree,
    onPayMercadoPago,
    isPaying,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    planLabel: "premium" | "diamond";
    onCreateFree?: () => void;
    onPayMercadoPago: () => void;
    isPaying?: boolean;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-red-600 flex items-center gap-2">
                        <span>⚠️</span> Sin créditos {planLabel}
                    </DialogTitle>
                    <DialogDescription className="pt-2">
                        No tenés créditos {planLabel} disponibles en tu cuenta. Pagá con Mercado Pago para conseguir uno al instante{onCreateFree ? ", o creá una invitación gratis por ahora" : ""}.
                    </DialogDescription>
                </DialogHeader>
                {/* Div plano (no DialogFooter): ese componente fuerza
                    sm:flex-row a partir de 640px, lo que hacía que estos 3
                    botones "w-full" compitieran por todo el ancho en fila y
                    se salieran del modal en desktop. Acá siempre en columna. */}
                <div className="mt-6 flex flex-col gap-2">
                    <Button
                        type="button"
                        className="w-full bg-[#009ee3] hover:bg-[#009ee3]/90 text-white"
                        onClick={onPayMercadoPago}
                        disabled={isPaying}
                    >
                        {isPaying ? "Redirigiendo a Mercado Pago..." : "Pagar con Mercado Pago"}
                    </Button>
                    {onCreateFree && (
                        <Button type="button" variant="outline" className="w-full" onClick={onCreateFree}>
                            Crear Gratis
                        </Button>
                    )}
                    <Link href={WHATSAPP_SUPPORT_URL} target="_blank" className="w-full">
                        <Button type="button" variant="ghost" className="w-full">
                            Contactar por WhatsApp
                        </Button>
                    </Link>
                </div>
            </DialogContent>
        </Dialog>
    );
}
