"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { loadAndClearPendingInvitationUpgrade } from "@/lib/pending-invitation-upgrade";
import { useToast } from "@/components/ui/Toast";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Contraparte de "Habilitar funciones Premium/Diamond" (ver EventShareCard /
// UpgradePlanDialog): si el cliente pagó un crédito en Mercado Pago para
// convertir una invitación Gratis existente, termina esa conversión al
// volver acá autenticado. No renderiza nada -- corre una vez al montar
// cualquier página del dashboard.
export function PendingInvitationUpgradeBridge() {
    const { status } = useSession();
    const router = useRouter();
    const { showToast } = useToast();
    const ranRef = useRef(false);

    useEffect(() => {
        if (status !== "authenticated" || ranRef.current) return;
        const pending = loadAndClearPendingInvitationUpgrade();
        if (!pending) return;
        ranRef.current = true;

        (async () => {
            // El webhook de Mercado Pago que acredita el crédito es
            // asíncrono -- puede tardar unos segundos más que la vuelta del
            // pago. Reintentamos unas veces antes de darnos por vencidos.
            const maxAttempts = 6;
            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                try {
                    const res = await fetch(`/api/invitations/${pending.slug}/upgrade-plan`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ planTier: pending.desiredCredit }),
                    });
                    const data = await res.json().catch(() => ({}));
                    if (res.ok) {
                        showToast(`¡Listo! Tu invitación ya es ${pending.desiredCredit === "DIAMOND" ? "Diamond" : "Premium"}.`, "success");
                        router.push(`/dashboard/invitaciones/${pending.slug}/guests`);
                        return;
                    }
                    const isCreditNotYetLanded = data.code === "NO_PREMIUM_CREDITS" || data.code === "NO_DIAMOND_CREDITS";
                    if (isCreditNotYetLanded && attempt < maxAttempts) {
                        await sleep(3000);
                        continue;
                    }
                    console.error("Error upgrading pending invitation:", data.error);
                    showToast(
                        isCreditNotYetLanded
                            ? "Tu pago todavía se está confirmando -- en unos minutos vas a poder habilitar Premium/Diamond desde la invitación con el crédito ya acreditado."
                            : `No pudimos convertir la invitación: ${data.error || "error desconocido"}.`,
                        "error"
                    );
                    return;
                } catch (error) {
                    console.error("Error upgrading pending invitation:", error);
                    showToast("No pudimos convertir la invitación. Probá de nuevo desde ahí.", "error");
                    return;
                }
            }
        })();
    }, [status, router, showToast]);

    return null;
}
