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
import { useEffect, useState } from "react";
import { PagoPorTransferencia } from "@/components/pagos/PagoPorTransferencia";
import { esCodigoPais } from "@/lib/paises";
import { esArgentina } from "@/lib/precios-por-pais";

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
    // Con qué se cobra depende del país de la cuenta: Mercado Pago en
    // Argentina, PayPal afuera (una cuenta de Mercado Pago Argentina no puede
    // cobrarle a alguien de otro país). El backend ya decide igual; esto es
    // para que el botón no le prometa a un colombiano un medio de pago que no
    // va a ver cuando llegue al checkout.
    const [porMercadoPago, setPorMercadoPago] = useState(true);
    useEffect(() => {
        if (!open) return;
        let vigente = true;
        fetch("/api/user/pais")
            .then((r) => (r.ok ? r.json() : null))
            .then((j) => {
                if (vigente && esCodigoPais(j?.pais)) setPorMercadoPago(esArgentina(j.pais));
            })
            .catch(() => {
                // Sin respuesta se queda en Mercado Pago, que es el default de
                // la base y el camino de la enorme mayoría de las cuentas.
            });
        return () => {
            vigente = false;
        };
    }, [open]);

    const medio = porMercadoPago ? "Mercado Pago" : "PayPal";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-red-600 flex items-center gap-2">
                        <span>⚠️</span> Sin créditos {planLabel}
                    </DialogTitle>
                    <DialogDescription className="pt-2">
                        No tienes créditos {planLabel} disponibles en tu cuenta. Pagá con {medio} para conseguir uno al instante{onCreateFree ? ", o crea una invitación gratis por ahora" : ""}.
                    </DialogDescription>
                </DialogHeader>
                {/* Div plano (no DialogFooter): ese componente fuerza
                    sm:flex-row a partir de 640px, lo que hacía que estos 3
                    botones "w-full" compitieran por todo el ancho en fila y
                    se salieran del modal en desktop. Acá siempre en columna. */}
                <div className="mt-6 flex flex-col gap-2">
                    <Button
                        type="button"
                        className={`w-full text-white ${porMercadoPago ? "bg-[#009ee3] hover:bg-[#009ee3]/90" : "bg-[#003087] hover:bg-[#003087]/90"}`}
                        onClick={onPayMercadoPago}
                        disabled={isPaying}
                    >
                        {isPaying ? `Redirigiendo a ${medio}...` : `Pagar con ${medio}`}
                    </Button>
                    <PagoPorTransferencia concepto="tu crédito" />
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
