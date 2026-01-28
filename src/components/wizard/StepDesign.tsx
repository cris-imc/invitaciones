"use client";

import { useWizardStore } from "@/store/wizard-store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { AVAILABLE_TEMPLATES } from "@/lib/theme-config";
import { TemplateSelector } from "@/components/dashboard/TemplateSelector";



export function StepDesign() {
    const { data, setData, setThemeConfig, nextStep, prevStep } = useWizardStore();
    const selectedTemplate = data.templateTipo || "ORIGINAL";

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
                    Elige el estilo que mejor represente tu evento
                </p>
            </div>

            {/* Template Selection with New Selector */}
            <TemplateSelector 
                value={selectedTemplate} 
                onChange={handleTemplateSelect}
                eventType={data.type}
            />

            {/* Hero Background Image */}
            <div className="space-y-2">
                <Label htmlFor="heroImagenFondo">Imagen de Portada Principal</Label>
                <ImageUploader
                    currentImage={data.portadaImagenFondo}
                    onImageUploaded={(url: string) => setData({ portadaImagenFondo: url })}
                    aspectRatio={16 / 9}
                />
                <p className="text-xs text-muted-foreground">
                    Esta imagen aparecerá en la primera pantalla de tu invitación.
                </p>
            </div>

            {/* Parallax-specific: Celebremos Juntos Image */}
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

            <div className="flex justify-between pt-6">
                <Button type="button" variant="outline" onClick={prevStep}>
                    Anterior
                </Button>
                <Button onClick={nextStep}>
                    Siguiente
                </Button>
            </div>
        </div>
    );
}
