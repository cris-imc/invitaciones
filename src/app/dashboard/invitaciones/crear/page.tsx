"use client";

import { WizardSteps } from "@/components/wizard/WizardSteps";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useWizardStore } from "@/store/wizard-store";
import { useEffect, Suspense } from "react";
import { ConviteTemplate } from "@/components/templates/ConviteTemplate";
import { TemplateLoadingFallback } from "@/components/wizard/TemplateLoadingFallback";

export default function CrearInvitacionPage() {
    const { reset, data, themeConfig } = useWizardStore();

    // Reiniciar el wizard al entrar a la página
    useEffect(() => {
        reset();
    }, [reset]);

    const formData = { ...data, ...themeConfig } as any;

    return (
        <div className="py-8 px-4 md:px-8 max-w-4xl mx-auto min-h-screen">
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
