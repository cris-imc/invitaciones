"use client";

import { useWizardStore } from "@/store/wizard-store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { Sparkles, Image as ImageIcon } from "lucide-react";

const TEMPLATES = [
    {
        id: "ORIGINAL",
        name: "Original",
        description: "Diseño clásico con acentos dorados y transiciones suaves",
        color: "#d4af37",
        features: ["Diseño vertical", "Colores cálidos", "Estilo tradicional"]
    },
    {
        id: "PARALLAX",
        name: "Parallax",
        description: "Diseño moderno con efectos de profundidad y minimalismo",
        color: "#000000",
        features: ["Efectos parallax", "Minimalista", "Blanco y negro"]
    }
];

export function StepDesign() {
    const { data, setData, nextStep, prevStep } = useWizardStore();
    const selectedTemplate = data.templateTipo || "ORIGINAL";

    const handleTemplateSelect = (templateId: string) => {
        setData({ templateTipo: templateId });
    };

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Selecciona tu Plantilla</h2>
                <p className="text-muted-foreground">
                    Elige el estilo que mejor represente tu evento
                </p>
            </div>

            {/* Template Selection */}
            <div className="grid md:grid-cols-2 gap-6">
                {TEMPLATES.map((template) => (
                    <button
                        key={template.id}
                        type="button"
                        onClick={() => handleTemplateSelect(template.id)}
                        className={`
                            relative p-6 rounded-xl border-2 transition-all text-left
                            hover:shadow-lg
                            ${selectedTemplate === template.id
                                ? 'border-primary bg-primary/5 shadow-md'
                                : 'border-gray-200 hover:border-primary/50'
                            }
                        `}
                    >
                        {selectedTemplate === template.id && (
                            <div className="absolute top-4 right-4">
                                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-3 mb-4">
                            <div
                                className="w-12 h-12 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: template.color }}
                            >
                                {template.id === "PARALLAX" ? (
                                    <ImageIcon className="w-6 h-6 text-white" />
                                ) : (
                                    <Sparkles className="w-6 h-6 text-white" />
                                )}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">{template.name}</h3>
                                <p className="text-sm text-muted-foreground">{template.description}</p>
                            </div>
                        </div>

                        <ul className="space-y-1">
                            {template.features.map((feature, index) => (
                                <li key={index} className="text-sm flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </button>
                ))}
            </div>

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
