"use client";

import { WizardSteps } from "@/components/wizard/WizardSteps";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useWizardStore } from "@/store/wizard-store";
import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

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
        <div className="py-8 px-4 md:px-8 max-w-4xl mx-auto min-h-screen">
            <Suspense fallback={null}>
                <WizardBootstrap />
            </Suspense>

            <div className="mb-6 flex items-center">
                <Link href="/dashboard/invitaciones">
                    <Button variant="ghost" size="sm" className="gap-1">
                        <ChevronLeft className="w-4 h-4" /> Volver
                    </Button>
                </Link>
            </div>

            <div className="w-full">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Crear Nueva Invitación</h1>
                    <p className="text-muted-foreground mt-2">
                        Completa los pasos para generar tu invitación digital en minutos.
                    </p>
                </div>
                <WizardSteps />
            </div>
        </div>
    );
}
