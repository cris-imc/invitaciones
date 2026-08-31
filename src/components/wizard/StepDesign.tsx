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
    // de componentes fijo, sin elegir portada/tipografía/álbum). Si ya hay
    // una plantilla elegida, la colección se deduce de ella; si no, se
    // arranca sin elegir (null) para mostrar el selector de colección.
    const [collection, setCollection] = useState<Collection | null>(() => {
        if (!data.templateTipo) return null;
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
                collection === null ? (
                    <div className="grid sm:grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setCollection("FLAT")}
                            className="text-left rounded-xl border-2 border-border hover:border-primary/50 transition-colors p-6 space-y-2"
                        >
                            <LayoutGrid className="w-6 h-6 text-muted-foreground" />
                            <p className="font-semibold">Colección Flat</p>
                            <p className="text-sm text-muted-foreground">
                                Diseño tradicional y elegante: vos elegís cada detalle -- portada, tipografía, estilo de álbum y colores -- para una invitación prolija y a tu gusto.
                            </p>
                        </button>

                        {/* Guest Pass VIP (Casamiento) y Princesa (Quince Años) -- cuando se
                            sumen plantillas storytelling para otros tipos de evento, generalizar
                            esta condición (ver STORYTELLING_TEMPLATE_TIPOS en wizard-steps-config.ts). */}
                        {(data.type === "CASAMIENTO" || data.type === "QUINCE_ANOS") && (
                            <button
                                type="button"
                                onClick={() => setCollection("STORYTELLING")}
                                className="relative text-left rounded-xl border-2 border-border hover:border-primary/50 transition-colors p-6 space-y-2"
                            >
                                <span className="absolute top-3 right-3 text-[10px] font-bold tracking-wider uppercase bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                                    Nuevas
                                </span>
                                <Sparkles className="w-6 h-6 text-muted-foreground" />
                                <p className="font-semibold">Colección Storytelling</p>
                                <p className="text-sm text-muted-foreground">
                                    Diseño disruptivo, pensado para una invitación memorable: la experiencia viene armada de punta a punta, vos solo cargás los datos reales de tu evento.
                                </p>
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <button
                            type="button"
                            onClick={() => setCollection(null)}
                            className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2"
                        >
                            ← Cambiar de colección
                        </button>

                        <div className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-border p-8">
                            {data.templateTipo ? (
                                <div className="flex items-center gap-3">
                                    <span
                                        className="h-10 w-10 rounded-full shadow-sm shrink-0"
                                        style={{
                                            backgroundColor: activeColorOption?.color,
                                            border: TEMPLATE_TIPO_BORDER[activeTemplateTipo],
                                        }}
                                    />
                                    <div className="text-left">
                                        <p className="font-semibold">{TEMPLATE_TIPO_LABEL[activeTemplateTipo]}</p>
                                        <p className="text-sm text-muted-foreground">{activeColorOption?.name}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">Todavía no elegiste una plantilla</p>
                            )}

                            <Button type="button" size="lg" className="gap-2" onClick={() => setPreviewOpen(true)}>
                                <Wand2 className="w-4 h-4" />
                                {data.templateTipo ? 'Cambiar plantilla' : 'Elegir plantilla'}
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
                )
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
