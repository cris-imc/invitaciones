import type { ComponentType } from "react";
import { StepEventType } from "./StepEventType";
import { StepBasicInfo } from "./StepBasicInfo";
import { StepDetails } from "./StepDetails";
import { StepHeroImages } from "./StepHeroImages";
import { StepGallery } from "./StepGallery";
import { StepMusic } from "./StepMusic";
import { StepTrivia } from "./StepTrivia";
import { StepDesign } from "./StepDesign";
import { StepCronograma } from "./StepCronograma";
import { StepPhrase } from "./StepPhrase";
import { StepBankDetails } from "./StepBankDetails";
import { StepCeremonia } from "./StepCeremonia";
import { StepTypography } from "./StepTypography";
import { StepCountdownStyle } from "./StepCountdownStyle";

export interface WizardStepDef {
    component: ComponentType;
    label: string;
}

// Fuente única del orden de pasos del wizard, usada tanto por WizardSteps.tsx
// (para renderizar) como por EditWizardContainer.tsx (para saltar a un paso
// puntual por label, ej. "?step=design") -- así el índice nunca puede
// desincronizarse del array real cuando alguien reordena pasos.
export function getWizardSteps({
    isEditing,
    isCasamiento,
}: {
    isEditing: boolean;
    isCasamiento: boolean;
}): WizardStepDef[] {
    return [
        ...(isEditing ? [] : [{ component: StepEventType, label: "Tipo de Evento" }]),
        // Pedido del usuario: la Portada va antes de elegir Plantilla, así la
        // preview real de la plantilla ya refleja la foto de portada real
        // del cliente en vez de una de muestra.
        { component: StepHeroImages, label: "Portada" },
        { component: StepDesign, label: "Plantilla" },
        { component: StepTypography, label: "Tipografía" },
        { component: StepBasicInfo, label: "Información Básica" },
        { component: StepCountdownStyle, label: "Countdown" },
        { component: StepPhrase, label: "Frase" },
        { component: StepDetails, label: "Detalles del Salón" },
        ...(isCasamiento ? [{ component: StepCeremonia, label: "Ceremonia / Civil" }] : []),
        { component: StepCronograma, label: "Cronograma" },
        { component: StepGallery, label: "Galería" },
        { component: StepMusic, label: "Música" },
        { component: StepBankDetails, label: "Regalo (CBU)" },
        { component: StepTrivia, label: "Trivia" },
    ];
}
