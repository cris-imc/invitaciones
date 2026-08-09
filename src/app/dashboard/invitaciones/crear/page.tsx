"use client";

import { WizardSteps } from "@/components/wizard/WizardSteps";
import { useWizardStore } from "@/store/wizard-store";
import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

// Sincroniza el store con la elección gratis/premium hecha en el modal de
// NewInvitationButton, leída de la URL en vez de confiar en el estado que
// haya quedado en memoria del wizard-store (evita "premium" pegado de una
// invitación anterior si se navega directo a esta página).
function WizardBootstrap() {
    const { reset, setUsePremiumCredit } = useWizardStore();
    const searchParams = useSearchParams();
    const premiumParam = searchParams.get("premium");

    useEffect(() => {
        reset();
        setUsePremiumCredit(premiumParam === "1");
    }, [reset, setUsePremiumCredit, premiumParam]);

    return null;
}

export default function CrearInvitacionPage() {
    return (
        <div className="wiz-page">
            <Suspense fallback={null}>
                <WizardBootstrap />
            </Suspense>
            <WizardSteps />
        </div>
    );
}
