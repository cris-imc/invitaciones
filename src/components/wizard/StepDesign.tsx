"use client";
import { useState } from "react";
import { useWizardStore } from "@/store/wizard-store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { AVAILABLE_TEMPLATES } from "@/lib/theme-config";
import { TemplateSelector } from "@/components/dashboard/TemplateSelector";
import { SaveStepButtons } from "./SaveStepButtons";
import { saveInvitationFromWizard } from "@/lib/save-invitation";
import {
    TemplatePreviewModal,
    MODERNO_COLORS,
    ELEGANT_COLORS,
    NEON_COLORS,
    CHIC_COLORS,
    EDITORIAL_COLORS,
    ONIX_COLORS,
    JARDINSEDA_COLORS,
    HOLOGRAMA_COLORS,
    CIRCUITO_COLORS,
    CRISTAL3D_COLORS,
    CINE_COLORS,
    NORDICO_COLORS,
    RIVIERA_COLORS,
    GOLDENDUSK_COLORS,
    SEDA_COLORS,
    PETALOS_COLORS,
    LUZLUNA_COLORS,
    BONVOYAGE_COLORS,
    CORPORATE_COLORS,
    GARDENPARTY_COLORS,
    LOFTINDUSTRIAL_COLORS,
    INFANTIL_COLORS,
    GUESTPASSVIP_COLORS,
    PRINCESA_COLORS,
    CORONAESCARLATA_COLORS,
    JEWELRYBOX_COLORS,
    PASEVIP_COLORS,
    CINEABSTRACTOXV_COLORS,
    ACRYLICPOP_COLORS,
    BOLADEDISCOTECA_COLORS,
    CRYSTAL3D_COLORS,
    FASHIONTAG_COLORS,
    CERAMICAEDITORIAL_COLORS,
    CINEABSTRACTO_COLORS,
    PAPELERIADEHOTELDELUJO_COLORS,
    VINTAGEEDITORIAL_COLORS,
    FASHIONLOOKBOOK_COLORS,
    MARMOLYORO_COLORS,
    ATELIERDEPAPEL_COLORS,
    BOTANICAEDITORIAL_COLORS,
    ENCAJECONTEMPORANEO_COLORS,
    LIQUIDGLASS_COLORS,
    BLACKANDWHITE_COLORS,
    BABYSHOWER_COLORS,
        BAUTISMO_COLORS,
    CORPORATIVOANIVERSARIO_COLORS,
    CORPORATIVOENCUENTRO_COLORS,
    CUMPLEANOSCOCKTAIL_COLORS,
    CUMPLEANOSJARDIN_COLORS,
    CUMPLEANOSTERRAZA_COLORS,
    DESPEDIDASOLTERA_COLORS,
    DESPEDIDASOLTERO_COLORS,
    GRADUACION_COLORS,
    INAUGURACION_COLORS,
    INFANTILESPACIO_COLORS,
    INFANTILJURASICO_COLORS,
    INFANTILSAFARI_COLORS,
    ANIVERSARIO_COLORS,
    TEMPLATE_TIPO_ACCENT,
    type TemplateTipo,
} from "./TemplatePreviewModal";
import { Wand2, Sparkles, LayoutGrid } from "lucide-react";
import { isStorytellingTemplate } from "./wizard-steps-config";

const TEMPLATE_TIPO_LABEL: Record<TemplateTipo, string> = {
    ELEGANT: "Elegant",
    MODERNO: "Moderno",
    NEON: "Neon",
    CHIC: "Chic",
    EDITORIAL: "Editorial",
    ONIX: "Ónix",
    JARDINSEDA: "Jardín de Seda",
    HOLOGRAMA: "Holograma",
    CIRCUITO: "Circuito",
    CRISTAL3D: "Cristal 3D",
    CINE: "Cine",
    NORDICO: "Atelier Nórdico",
    RIVIERA: "Riviera",
    GOLDENDUSK: "Golden Dusk",
    SEDA: "Seda",
    PETALOS: "Pétalos",
    LUZLUNA: "Luz de Luna",
    BONVOYAGE: "Bon Voyage",
    CORPORATE: "Corporate",
    GARDENPARTY: "Garden Party",
    LOFTINDUSTRIAL: "Loft Industrial",
    INFANTIL: "Infantil",
    GUESTPASSVIP: "Guest Pass VIP",
    PRINCESA: "Princesa",
    CORONAESCARLATA: "Corona Escarlata",
    JEWELRYBOX: "Jewelry Box",
    PASEVIP: "Pase VIP",
    CINEABSTRACTOXV: "Cine Abstracto XV",
    ACRYLICPOP: "Acrylic Pop",
    BOLADEDISCOTECA: "Bola de Discoteca",
    CRYSTAL3D: "Crystal 3D",
    FASHIONTAG: "Fashion Tag",
    CERAMICAEDITORIAL: "Cerámica Editorial",
    CINEABSTRACTO: "Cine Abstracto",
    PAPELERIADEHOTELDELUJO: "Papelería de Hotel de Lujo",
    VINTAGEEDITORIAL: "Vintage Editorial",
    FASHIONLOOKBOOK: "Fashion Lookbook",
    MARMOLYORO: "Mármol y Oro",
    ATELIERDEPAPEL: "Atelier de Papel",
    BOTANICAEDITORIAL: "Botánica Editorial",
    ENCAJECONTEMPORANEO: "Encaje Contemporáneo",
    LIQUIDGLASS: "Liquid Glass",
    BLACKANDWHITE: "Black y White",
    BABYSHOWER: "Baby Shower",
    BAUTISMO: "Bautismo",
    CORPORATIVOANIVERSARIO: "Corporativo Aniversario",
    CORPORATIVOENCUENTRO: "Corporativo Encuentro",
    CUMPLEANOSCOCKTAIL: "Cumpleaños Cocktail",
    CUMPLEANOSJARDIN: "Cumpleaños Jardín de Noche",
    CUMPLEANOSTERRAZA: "Cumpleaños Terraza Dorada",
    DESPEDIDASOLTERA: "Despedida de Soltera",
    DESPEDIDASOLTERO: "Despedida de Soltero",
    GRADUACION: "Graduación",
    INAUGURACION: "Inauguración",
    INFANTILESPACIO: "Infantil Rumbo al Espacio",
    INFANTILJURASICO: "Infantil Mundo Jurásico",
    INFANTILSAFARI: "Infantil Safari",
    ANIVERSARIO: "Aniversario",
};
const TEMPLATE_TIPO_COLORS: Record<TemplateTipo, typeof ELEGANT_COLORS> = {
    ELEGANT: ELEGANT_COLORS,
    MODERNO: MODERNO_COLORS,
    NEON: NEON_COLORS,
    CHIC: CHIC_COLORS,
    EDITORIAL: EDITORIAL_COLORS,
    ONIX: ONIX_COLORS,
    JARDINSEDA: JARDINSEDA_COLORS,
    HOLOGRAMA: HOLOGRAMA_COLORS,
    CIRCUITO: CIRCUITO_COLORS,
    CRISTAL3D: CRISTAL3D_COLORS,
    CINE: CINE_COLORS,
    NORDICO: NORDICO_COLORS,
    RIVIERA: RIVIERA_COLORS,
    GOLDENDUSK: GOLDENDUSK_COLORS,
    SEDA: SEDA_COLORS,
    PETALOS: PETALOS_COLORS,
    LUZLUNA: LUZLUNA_COLORS,
    BONVOYAGE: BONVOYAGE_COLORS,
    CORPORATE: CORPORATE_COLORS,
    GARDENPARTY: GARDENPARTY_COLORS,
    LOFTINDUSTRIAL: LOFTINDUSTRIAL_COLORS,
    INFANTIL: INFANTIL_COLORS,
    GUESTPASSVIP: GUESTPASSVIP_COLORS,
    PRINCESA: PRINCESA_COLORS,
    CORONAESCARLATA: CORONAESCARLATA_COLORS,
    JEWELRYBOX: JEWELRYBOX_COLORS,
    PASEVIP: PASEVIP_COLORS,
    CINEABSTRACTOXV: CINEABSTRACTOXV_COLORS,
    ACRYLICPOP: ACRYLICPOP_COLORS,
    BOLADEDISCOTECA: BOLADEDISCOTECA_COLORS,
    CRYSTAL3D: CRYSTAL3D_COLORS,
    FASHIONTAG: FASHIONTAG_COLORS,
    CERAMICAEDITORIAL: CERAMICAEDITORIAL_COLORS,
    CINEABSTRACTO: CINEABSTRACTO_COLORS,
    PAPELERIADEHOTELDELUJO: PAPELERIADEHOTELDELUJO_COLORS,
    VINTAGEEDITORIAL: VINTAGEEDITORIAL_COLORS,
    FASHIONLOOKBOOK: FASHIONLOOKBOOK_COLORS,
    MARMOLYORO: MARMOLYORO_COLORS,
    ATELIERDEPAPEL: ATELIERDEPAPEL_COLORS,
    BOTANICAEDITORIAL: BOTANICAEDITORIAL_COLORS,
    ENCAJECONTEMPORANEO: ENCAJECONTEMPORANEO_COLORS,
    LIQUIDGLASS: LIQUIDGLASS_COLORS,
    BLACKANDWHITE: BLACKANDWHITE_COLORS,
    BABYSHOWER: BABYSHOWER_COLORS,
    BAUTISMO: BAUTISMO_COLORS,
    CORPORATIVOANIVERSARIO: CORPORATIVOANIVERSARIO_COLORS,
    CORPORATIVOENCUENTRO: CORPORATIVOENCUENTRO_COLORS,
    CUMPLEANOSCOCKTAIL: CUMPLEANOSCOCKTAIL_COLORS,
    CUMPLEANOSJARDIN: CUMPLEANOSJARDIN_COLORS,
    CUMPLEANOSTERRAZA: CUMPLEANOSTERRAZA_COLORS,
    DESPEDIDASOLTERA: DESPEDIDASOLTERA_COLORS,
    DESPEDIDASOLTERO: DESPEDIDASOLTERO_COLORS,
    GRADUACION: GRADUACION_COLORS,
    INAUGURACION: INAUGURACION_COLORS,
    INFANTILESPACIO: INFANTILESPACIO_COLORS,
    INFANTILJURASICO: INFANTILJURASICO_COLORS,
    INFANTILSAFARI: INFANTILSAFARI_COLORS,
    ANIVERSARIO: ANIVERSARIO_COLORS,
};
const TEMPLATE_TIPO_BORDER: Record<TemplateTipo, string> = Object.fromEntries(
    (Object.keys(TEMPLATE_TIPO_LABEL) as TemplateTipo[]).map((tipo) => [
        tipo,
        tipo === "ELEGANT" ? "1px solid rgba(0,0,0,.15)" : `2px solid ${TEMPLATE_TIPO_ACCENT[tipo]}`,
    ])
) as Record<TemplateTipo, string>;



type Collection = "FLAT" | "STORYTELLING";

export function StepDesign() {
    const { data, setData, setThemeConfig, themeConfig, usePremiumCredit, setDirty } = useWizardStore();
    const [isCreating, setIsCreating] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const selectedTemplate = data.templateTipo || "ORIGINAL";

    // Colección Flat (las 22 plantillas de siempre: Elegant, Moderno, etc.)
    // vs. Colección Storytelling (Guest Pass VIP y las que se sumen -- diseño
    // de componentes fijo, sin elegir portada/tipografía/álbum). Antes esto
    // vivía en dos pantallas separadas (elegir colección, después elegir
    // plantilla, con un link "← Cambiar de colección" para volver) -- ahora
    // los botones de colección y "Cambiar plantilla" conviven en la misma
    // pantalla, así el flujo no se corta en dos pasos. Si ya hay una
    // plantilla elegida, la colección se deduce de ella; si no, arranca en
    // Flat (comportamiento de siempre).
    const [collection, setCollection] = useState<Collection>(() => {
        if (!data.templateTipo) return "FLAT";
        return isStorytellingTemplate(data.templateTipo) ? "STORYTELLING" : "FLAT";
    });

    const isDesignEvent = ['CASAMIENTO', 'QUINCE_ANOS', 'CUMPLEANOS'].includes(data.type ?? '');
    // Si ya hay plantilla elegida Y pertenece a la colección activa, se usa
    // esa. Si no (recién se entró a la colección, o la plantilla guardada
    // era de la otra colección), el default depende de qué colección se
    // está mostrando -- para Storytelling el default no puede ser ELEGANT
    // (quedaría filtrado de los tabs disponibles y rompería el preview).
    const templateTipoMatchesCollection = Boolean(
        data.templateTipo &&
        (data.templateTipo as string) in TEMPLATE_TIPO_LABEL &&
        (collection === "STORYTELLING" ? isStorytellingTemplate(data.templateTipo) : !isStorytellingTemplate(data.templateTipo))
    );
    const activeTemplateTipo: TemplateTipo = templateTipoMatchesCollection
        ? (data.templateTipo as TemplateTipo)
        : (collection === "STORYTELLING" ? (data.type === "QUINCE_ANOS" ? "PRINCESA" : "GUESTPASSVIP") : "ELEGANT");
    const activeColorId = themeConfig?.colorPrincipal || 'default';
    const activeColorList = TEMPLATE_TIPO_COLORS[activeTemplateTipo];
    const activeColorOption = activeColorList.find(c => c.id === activeColorId) ?? activeColorList[0];

    // Plantilla realmente guardada -- a diferencia de activeTemplateTipo (que
    // depende de qué botón de colección está tildado, solo para saber qué
    // mostrarle de entrada al modal), esto NO cambia al tocar Flat/Storytelling,
    // así la tarjeta de "plantilla actual" no da la falsa impresión de que ya
    // se seleccionó algo nuevo con solo tocar el botón de colección.
    const currentTemplateTipo: TemplateTipo | null =
        data.templateTipo && (data.templateTipo as string) in TEMPLATE_TIPO_LABEL
            ? (data.templateTipo as TemplateTipo)
            : null;
    const currentColorList = currentTemplateTipo ? TEMPLATE_TIPO_COLORS[currentTemplateTipo] : null;
    const currentColorOption = currentColorList ? (currentColorList.find(c => c.id === activeColorId) ?? currentColorList[0]) : null;

    const handleTemplateSelect = (templateId: string) => {
        setData({ templateTipo: templateId });

        const template = AVAILABLE_TEMPLATES.find(t => t.id === templateId);
        if (template?.layoutId) {
            // @ts-ignore - Valid layout id check implied
            setThemeConfig({ layout: template.layoutId as any });
        }
    };



    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Selecciona tu Plantilla</h2>
                <p className="text-muted-foreground">
                    {isDesignEvent
                        ? 'Elegí el estilo y la gama de colores para tu invitación'
                        : 'Elige el estilo que mejor represente tu evento'}
                </p>
            </div>

            {isDesignEvent ? (
                <div className="space-y-4">
                    {/* Botones de colección compactos (sin descripción, para
                        ganar espacio) -- conviven en la misma pantalla que
                        "Cambiar plantilla" de abajo, ya no son un paso aparte. */}
                    <div className="grid sm:grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setCollection("FLAT")}
                            className={`flex items-center justify-center gap-2 rounded-xl border-2 transition-colors py-3 px-4 font-semibold text-sm ${
                                collection === "FLAT"
                                    ? "border-primary bg-primary/10"
                                    : "border-border hover:border-primary/50"
                            }`}
                        >
                            <LayoutGrid className="w-4 h-4 text-muted-foreground" />
                            Colección Flat
                        </button>

                        {/* Guest Pass VIP (Casamiento) y Princesa (Quince Años) -- cuando se
                            sumen plantillas storytelling para otros tipos de evento, generalizar
                            esta condición (ver STORYTELLING_TEMPLATE_TIPOS en wizard-steps-config.ts). */}
                        {(data.type === "CASAMIENTO" || data.type === "QUINCE_ANOS") && (
                            <button
                                type="button"
                                onClick={() => setCollection("STORYTELLING")}
                                className={`relative flex items-center justify-center gap-2 rounded-xl border-2 transition-colors py-3 px-4 font-semibold text-sm ${
                                    collection === "STORYTELLING"
                                        ? "border-primary bg-primary/10"
                                        : "border-border hover:border-primary/50"
                                }`}
                            >
                                <span className="absolute -top-2 -right-2 text-[9px] font-bold tracking-wider uppercase bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full shadow-sm">
                                    Nuevas
                                </span>
                                <Sparkles className="w-4 h-4 text-muted-foreground shrink-0" />
                                <span>Colección Storytelling</span>
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-border p-8">
                        {currentTemplateTipo ? (
                            <div className="flex items-center gap-3">
                                <span
                                    className="h-10 w-10 rounded-full shadow-sm shrink-0"
                                    style={{
                                        backgroundColor: currentColorOption?.color,
                                        border: TEMPLATE_TIPO_BORDER[currentTemplateTipo],
                                    }}
                                />
                                <div className="text-left">
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Plantilla actual</p>
                                    <p className="font-semibold">{TEMPLATE_TIPO_LABEL[currentTemplateTipo]}</p>
                                    <p className="text-sm text-muted-foreground">{currentColorOption?.name}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">Todavía no elegiste una plantilla</p>
                        )}

                        <Button type="button" size="lg" className="gap-2" onClick={() => setPreviewOpen(true)}>
                            <Wand2 className="w-4 h-4" />
                            {collection === "STORYTELLING" ? "Ver Modelos Storytelling" : "Ver Modelos Flat"}
                        </Button>

                        <TemplatePreviewModal
                            open={previewOpen}
                            onOpenChange={setPreviewOpen}
                            eventType={data.type}
                            collection={collection}
                            initialTemplateTipo={activeTemplateTipo}
                            initialColor={activeColorId}
                            currentData={data}
                            onConfirm={(templateTipo, colorId) => {
                                setData({ templateTipo });
                                setThemeConfig({ colorPrincipal: colorId });
                                setPreviewOpen(false);
                            }}
                        />
                    </div>
                </div>
            ) : (
                <>
                    <TemplateSelector 
                        value={selectedTemplate} 
                        onChange={handleTemplateSelect}
                        eventType={data.type}
                    />

                    {selectedTemplate === "PARALLAX" && (
                        <div className="space-y-2 border-l-4 border-primary pl-4 py-2 bg-primary/5 rounded-r-lg">
                            <Label htmlFor="imagenCelebremosJuntos">
                                Imagen "Celebremos Juntos"
                                <span className="text-xs text-muted-foreground ml-2">(Solo para Parallax)</span>
                            </Label>
                            <ImageUploader
                                currentImage={data.imagenCelebremosJuntos}
                                onImageUploaded={(url: string) => setData({ imagenCelebremosJuntos: url })}
                                aspectRatio={3 / 4}
                            />
                            <p className="text-xs text-muted-foreground">
                                Esta imagen aparecerá en la mitad derecha de la pantalla con efecto parallax.
                            </p>
                        </div>
                    )}
                </>
            )}

            <SaveStepButtons />
        </div>
    );
}
