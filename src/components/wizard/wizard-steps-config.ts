import type { ComponentType } from "react";
import type { ClaveTexto } from "@/lib/i18n/texto";
import { StepEventType } from "./StepEventType";
import { StepBasicInfo } from "./StepBasicInfo";
import { StepDetails } from "./StepDetails";
import { StepHeroImages } from "./StepHeroImages";
import { StepStorytellingScroll } from "./StepStorytellingScroll";
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
    /**
     * Identificador interno del paso. NO se traduce ni se muestra: hay dos
     * lugares que lo comparan por texto -- EditWizardContainer.tsx (para
     * saltar a "Plantilla" desde "?step=design") y WizardLivePreview.tsx
     * (para saber a qué sección de la invitación hacer scroll). Si se
     * tradujera, la preview dejaría de seguir al paso y el salto directo
     * al paso de plantilla se rompería en inglés y portugués.
     */
    label: string;
    /** El nombre que ve el anfitrión, ya en su idioma. */
    clave: ClaveTexto;
}

// Plantillas de la "Colección Storytelling" (Guest Pass VIP y las que se
// vayan sumando): diseño de componentes prediseñado y fijo -- no eligen
// portada de bienvenida/interior, tipografía, estilo de countdown ni estilo
// de álbum desde el wizard (ver comentario de cabecera de
// GuestPassVipTemplate.tsx). El resto de los pasos (datos reales: salón,
// ceremonia, cronograma, galería, música, banco, trivia, info adicional)
// se comparten igual que con la Colección Flat.
export const STORYTELLING_TEMPLATE_TIPOS = new Set(["GUESTPASSVIP", "PRINCESA", "CORONAESCARLATA", "JEWELRYBOX", "PASEVIP", "CINEABSTRACTOXV", "ACRYLICPOP", "BOLADEDISCOTECA", "CRYSTAL3D", "FASHIONTAG", "CERAMICAEDITORIAL", "CINEABSTRACTO", "PAPELERIADEHOTELDELUJO", "VINTAGEEDITORIAL", "FASHIONLOOKBOOK", "MARMOLYORO", "ATELIERDEPAPEL", "BOTANICAEDITORIAL", "ENCAJECONTEMPORANEO", "LIQUIDGLASS", "BLACKANDWHITE", "BABYSHOWER", "BAUTISMO", "CORPORATIVOANIVERSARIO", "CORPORATIVOENCUENTRO", "CUMPLEANOSCOCKTAIL", "CUMPLEANOSJARDIN", "CUMPLEANOSTERRAZA", "DESPEDIDASOLTERA", "DESPEDIDASOLTERO", "GRADUACION", "INAUGURACION", "INFANTILESPACIO", "INFANTILJURASICO", "INFANTILSAFARI", "ANIVERSARIO"]);

export function isStorytellingTemplate(templateTipo: string | null | undefined): boolean {
    return Boolean(templateTipo && STORYTELLING_TEMPLATE_TIPOS.has(templateTipo));
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
    templateTipo,
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
    // Plantilla elegida hasta ahora (data.templateTipo) -- define si esta
    // invitación pertenece a la Colección Storytelling (ver arriba). Antes
    // de elegir plantilla no hay valor todavía, así que por defecto se
    // asume Colección Flat (comportamiento de siempre).
    templateTipo?: string | null;
}): WizardStepDef[] {
    const storytelling = isStorytellingTemplate(templateTipo);
    return [
        ...(!isEditing || isAdmin ? [{ component: StepEventType, label: "Tipo de Evento", clave: "wizard.pasos.tipoDeEvento" as const }] : []),
        // La Plantilla se elige primero: además de que la Colección
        // Storytelling se salta portada/tipografía por completo, así la
        // preview ya sabe desde el arranque qué flujo seguir.
        { component: StepDesign, label: "Plantilla", clave: "wizard.pasos.plantilla" as const },
        // Antes se saltaba por completo para Storytelling (esa colección no
        // elige tipografía/countdown/álbum desde el wizard) -- pero SÍ puede
        // usar fotos reales (portada de bienvenida + foto principal
        // narrativa, ver AnimatedCoverPhoto.tsx), así que el paso ahora se
        // muestra para las dos colecciones. StepHeroImages.tsx decide
        // internamente qué campos pedir según isStorytellingTemplate.
        // Sólo Storytelling: es el único que tiene paneles que recorrer.
        ...(storytelling ? [{ component: StepStorytellingScroll, label: "Recorrido", clave: "wizard.pasos.recorrido" as const }] : []),
        { component: StepHeroImages, label: "Portada", clave: "wizard.pasos.portada" as const },
        ...(!storytelling ? [{ component: StepTypography, label: "Tipografía", clave: "wizard.pasos.tipografia" as const }] : []),
        { component: StepBasicInfo, label: "Información Básica", clave: "wizard.pasos.informacionBasica" as const },
        ...(!storytelling ? [{ component: StepCountdownStyle, label: "Countdown", clave: "wizard.pasos.countdown" as const }] : []),
        { component: StepPhrase, label: "Frase", clave: "wizard.pasos.frase" as const },
        // Orden Salón/Ceremonia: en las plantillas Flat el salón se pregunta
        // primero. En Guest Pass VIP (y el resto de Storytelling) el panel
        // "El lugar" muestra la Ceremonia ANTES que el Salón cuando está
        // habilitada (ver GuestPassVipTemplate.tsx) -- si el wizard preguntara
        // en el orden de siempre, se cargarían los datos en el orden
        // contrario al que después se ven en la tarjeta. Para Storytelling se
        // invierte el orden de estos dos pasos para que coincidan.
        ...(isCasamiento && storytelling ? [{ component: StepCeremonia, label: "Ceremonia / Civil", clave: "wizard.pasos.ceremonia" as const }] : []),
        { component: StepDetails, label: "Detalles del Salón", clave: "wizard.pasos.detallesSalon" as const },
        ...(isCasamiento && !storytelling ? [{ component: StepCeremonia, label: "Ceremonia / Civil", clave: "wizard.pasos.ceremonia" as const }] : []),
        { component: StepCronograma, label: "Cronograma", clave: "wizard.pasos.cronograma" as const },
        { component: StepGallery, label: "Galería", clave: "wizard.pasos.galeria" as const },
        ...(hasGallery && !storytelling ? [{ component: StepAlbumStyle, label: "Álbum", clave: "wizard.pasos.album" as const }] : []),
        { component: StepMusic, label: "Música", clave: "wizard.pasos.musica" as const },
        { component: StepBankDetails, label: "Regalo (CBU)", clave: "wizard.pasos.regalo" as const },
        { component: StepTrivia, label: "Trivia", clave: "wizard.pasos.trivia" as const },
        { component: StepInfoAdicional, label: "Info Adicional", clave: "wizard.pasos.infoAdicional" as const },
    ];
}
