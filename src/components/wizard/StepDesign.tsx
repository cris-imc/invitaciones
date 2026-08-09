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
    type TemplateTipo,
} from "./TemplatePreviewModal";
import { Wand2 } from "lucide-react";



export function StepDesign() {
    const { data, setData, setThemeConfig, themeConfig, usePremiumCredit, setDirty } = useWizardStore();
    const [isCreating, setIsCreating] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const selectedTemplate = data.templateTipo || "ORIGINAL";

    const isDesignEvent = ['CASAMIENTO', 'QUINCE_ANOS', 'CUMPLEANOS'].includes(data.type ?? '');
    const activeTemplateTipo: TemplateTipo = data.templateTipo === 'MODERNO' ? 'MODERNO' : 'ELEGANT';
    const activeColorId = themeConfig?.colorPrincipal || 'default';
    const activeColorList = activeTemplateTipo === 'MODERNO' ? MODERNO_COLORS : ELEGANT_COLORS;
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
                <div className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-border p-8">
                    {data.templateTipo ? (
                        <div className="flex items-center gap-3">
                            <span
                                className="h-10 w-10 rounded-full shadow-sm shrink-0"
                                style={{
                                    backgroundColor: activeColorOption?.color,
                                    border: activeTemplateTipo === 'MODERNO' ? '2px solid #C9A876' : '1px solid rgba(0,0,0,.15)',
                                }}
                            />
                            <div className="text-left">
                                <p className="font-semibold">{activeTemplateTipo === 'MODERNO' ? 'Moderno' : 'Elegant'}</p>
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
                        initialTemplateTipo={activeTemplateTipo}
                        initialColor={activeColorId}
                        onConfirm={(templateTipo, colorId) => {
                            setData({ templateTipo });
                            setThemeConfig({ colorPrincipal: colorId });
                            setPreviewOpen(false);
                        }}
                    />
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
