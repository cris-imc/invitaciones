"use client";

import { useWizardStore } from "@/store/wizard-store";
import { StepEventType } from "./StepEventType";
import { StepBasicInfo } from "./StepBasicInfo";
import { StepDetails } from "./StepDetails";
import { StepCoverPage } from "./StepCoverPage";
import { StepGallery } from "./StepGallery";
import { StepMusic } from "./StepMusic";
import { StepTrivia } from "./StepTrivia";
import { StepDesign } from "./StepDesign";
import { StepPreview } from "./StepPreview";
import { Progress } from "@/components/ui/progress";

export function WizardSteps() {
    const { currentStep } = useWizardStore();

    const steps = [
        { component: StepEventType, label: "Tipo de Evento" },
        { component: StepBasicInfo, label: "Información Básica" },
        { component: StepDetails, label: "Detalles del Evento" },
        { component: StepCoverPage, label: "Portada" },
        { component: StepGallery, label: "Galería" },
        { component: StepMusic, label: "Música" },
        { component: StepTrivia, label: "Trivia" },
        { component: StepDesign, label: "Diseño" },
        { component: StepPreview, label: "Vista Previa" },
    ];

    const CurrentComponent = steps[currentStep].component;
    const progress = ((currentStep + 1) / steps.length) * 100;

    return (
        <div className="max-w-2xl mx-auto w-full">
            <div className="mb-8">
                <div className="flex justify-between text-sm font-medium text-muted-foreground mb-2">
                    <span>Paso {currentStep + 1} de {steps.length}</span>
                    <span>{steps[currentStep].label}</span>
                </div>
                <Progress value={progress} className="h-2" />
            </div>

            <div className="bg-card rounded-xl shadow-lg p-6 md:p-8">
                <CurrentComponent />
            </div>
        </div>
    );
}
