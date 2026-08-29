"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { loadAndClearPendingWizardInvitation } from "@/lib/pending-wizard-invitation";
import { saveInvitationFromWizard, SaveInvitationError } from "@/lib/save-invitation";
import { useToast } from "@/components/ui/Toast";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Contraparte de /dashboard/invitaciones/crear (wizard público, sin login) y
// de WizardPlanLimitDialog (wizard logueado, cuando ya usó la tarjeta
// Gratis): si el visitante dejó una invitación pendiente y volvió acá ya
// autenticado (registro recién hecho, o de vuelta de pagar un crédito en
// Mercado Pago), termina de crearla de verdad. No renderiza nada -- corre
// una vez al montar cualquier página del dashboard.
export function PendingWizardInvitationBridge() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { showToast } = useToast();
    const ranRef = useRef(false);

    useEffect(() => {
        if (status !== "authenticated" || !session?.user || ranRef.current) return;
        const pending = loadAndClearPendingWizardInvitation();
        if (!pending) return;
        ranRef.current = true;

        // El crédito a usar viene explícito en lo guardado, nunca del
        // planTier de la cuenta: tanto el registro con Premium/Diamond como
        // la compra suelta de un crédito (buy-credit) dejan la cuenta en
        // FREE igual -- lo que compran es UN crédito, no un plan de cuenta
        // ilimitado (ver /api/auth/register y /api/user/buy-credit).
        const usePremiumCredit = pending.desiredCredit === "PREMIUM";
        const useDiamondCredit = pending.desiredCredit === "DIAMOND";

        (async () => {
            // El webhook de Mercado Pago que acredita el crédito es
            // asíncrono -- puede tardar unos segundos más que la vuelta del
            // pago. Si la creación falla puntualmente por falta de crédito,
            // reintentamos unas veces antes de darnos por vencidos.
            const maxAttempts = (usePremiumCredit || useDiamondCredit) ? 6 : 1;
            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                try {
                    const invitation = await saveInvitationFromWizard(pending.data, pending.themeConfig, usePremiumCredit, useDiamondCredit);
                    router.push(`/dashboard/invitaciones/${invitation.slug}/guests`);
                    return;
                } catch (error) {
                    const isCreditNotYetLanded =
                        error instanceof SaveInvitationError &&
                        (error.code === "NO_PREMIUM_CREDITS" || error.code === "NO_DIAMOND_CREDITS");
                    if (isCreditNotYetLanded && attempt < maxAttempts) {
                        await sleep(3000);
                        continue;
                    }
                    console.error("Error creating pending wizard invitation:", error);
                    if (isCreditNotYetLanded) {
                        showToast(
                            "Tu pago todavía se está confirmando -- en unos minutos vas a poder crear la invitación desde \"+ Nueva invitación\" con el crédito ya acreditado.",
                            "error"
                        );
                    } else {
                        showToast(
                            `No pudimos terminar de crear la invitación que armaste antes: ${error instanceof Error ? error.message : "error desconocido"}. Podés crearla de nuevo desde acá.`,
                            "error"
                        );
                    }
                    return;
                }
            }
        })();
    }, [status, session, router, showToast]);

    return null;
}
