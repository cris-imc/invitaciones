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
import { StepAlbumStyle } from "./StepAlbumStyle";
import { StepInfoAdicional } from "./StepInfoAdicional";

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
    hasGallery = true,
    isAdmin = false,
}: {
    isEditing: boolean;
    isCasamiento: boolean;
    // Si la galería está deshabilitada (StepGallery.tsx ->
    // galeriaPrincipalHabilitada) no tiene sentido pedir un estilo de álbum
    // para fotos que no se van a mostrar. Default true para no romper
    // callers que todavía no llegaron a ese paso del wizard (antes de que
    // exista un valor real, se asume habilitada).
    hasGallery?: boolean;
    // Un cliente editando una invitación ya creada no puede tocar tipo de
    // evento ni nombres (el slug depende de eso al crear y no se debe
    // reflejar como editable después) -- pero un admin sí necesita poder
    // corregir un título o nombre mal tipeado, así que el paso reaparece
    // para admin en edición (el tipo de evento en sí queda bloqueado
    // igual, ver StepEventType.tsx).
    isAdmin?: boolean;
}): WizardStepDef[] {
    return [
        ...(!isEditing || isAdmin ? [{ component: StepEventType, label: "Tipo de Evento" }] : []),
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
        ...(hasGallery ? [{ component: StepAlbumStyle, label: "Álbum" }] : []),
        { component: StepMusic, label: "Música" },
        { component: StepBankDetails, label: "Regalo (CBU)" },
        { component: StepTrivia, label: "Trivia" },
        { component: StepInfoAdicional, label: "Info Adicional" },
    ];
}
