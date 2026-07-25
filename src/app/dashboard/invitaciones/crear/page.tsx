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
        <div className="py-8 px-4 md:px-8 max-w-[1400px] mx-auto min-h-screen">
            <div className="mb-6 flex items-center">
                <Link href="/dashboard/invitaciones">
                    <Button variant="ghost" size="sm" className="gap-1">
                        <ChevronLeft className="w-4 h-4" /> Volver
                    </Button>
                </Link>
            </div>

            <div className="grid md:grid-cols-[1fr_400px] gap-8 lg:gap-12 items-start">
                {/* Columna Izquierda: Formulario (Wizard) */}
                <div>
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold tracking-tight">Crear Nueva Invitación</h1>
                        <p className="text-muted-foreground mt-2">
                            Completa los pasos para generar tu invitación digital en minutos.
                        </p>
                    </div>
                    <WizardSteps />
                </div>

                {/* Columna Derecha: Vista Previa en Vivo */}
                <div className="hidden md:block sticky top-24">
                    <p className="kicker mb-4">Vista Previa en Vivo</p>
                    <div className="border rounded-[2.5rem] overflow-hidden shadow-sm bg-black h-[750px] relative w-[375px] mx-auto border-8 border-slate-800">
                        <div className="absolute inset-0 overflow-y-auto overflow-x-hidden bg-slate-100 no-scrollbar" style={{ scrollBehavior: 'smooth' }}>
                            <Suspense fallback={<TemplateLoadingFallback />}>
                                <ConviteTemplate invitation={formData} />
                            </Suspense>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
