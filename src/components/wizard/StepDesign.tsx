"use client";

import { useWizardStore } from "@/store/wizard-store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { COLOR_TEMPLATES, ColorTemplateId } from "@/lib/theme-config";
import { ImageUploader } from "@/components/ui/ImageUploader";

export function StepDesign() {
    const { data, setData, themeConfig, setThemeConfig, nextStep, prevStep } = useWizardStore();

    const handleTemplateSelect = (templateId: ColorTemplateId) => {
        const template = COLOR_TEMPLATES[templateId];
        setThemeConfig({
            colorTemplate: templateId,
            primaryColor: template.primaryColor,
            backgroundColor: template.backgroundColor,
            textDark: template.textDark,
            textLight: template.textLight,
            textSecondary: template.textSecondary,
        });
    };

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Diseño y Estilo</h2>
                <p className="text-muted-foreground">
                    Personaliza los colores y la imagen de fondo de tu invitación
                </p>
            </div>

            {/* Layout Info (Fixed) */}
            <div className="bg-slate-50 p-4 rounded-lg border text-center">
                <p className="text-sm text-muted-foreground">
                    Tu invitación utilizará el diseño <strong>Scroll Vertical</strong>, optimizado para una experiencia fluida y elegante.
                </p>
            </div>

            {/* Hero Background Image */}
            <div className="space-y-2">
                <Label htmlFor="heroImagenFondo">Imagen de Fondo del Encabezado</Label>
                <ImageUploader
                    currentImage={data.portadaImagenFondo}
                    onImageUploaded={(url: string) => setData({ portadaImagenFondo: url })}
                    aspectRatio={16 / 9}
                />
                <p className="text-xs text-muted-foreground">
                    Esta imagen se mostrará de fondo detrás de los nombres con opacidad baja para mejor legibilidad.
                </p>
            </div>

            {/* Paleta de Colores */}
            <div className="space-y-4">
                <Label className="text-lg font-semibold">Selecciona una Paleta de Colores</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.values(COLOR_TEMPLATES).map((template) => (
                        <button
                            key={template.id}
                            type="button"
                            onClick={() => handleTemplateSelect(template.id as ColorTemplateId)}
                            className={`
                                flex flex-col items-center gap-2 p-4 rounded-lg transition-all
                                ${themeConfig.colorTemplate === template.id
                                    ? 'bg-primary/5 ring-2 ring-primary'
                                    : 'hover:bg-primary/5 border hover:border-primary/50'
                                }
                            `}
                        >
                            <div
                                className="w-12 h-12 rounded-full shadow-md"
                                style={{ backgroundColor: template.primaryColor }}
                            />
                            <span className="text-sm font-medium text-center">
                                {template.name}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Color Personalizado */}
            <div className="space-y-2">
                <Label htmlFor="customColor">O elige un color personalizado</Label>
                <div className="flex gap-2 items-center">
                    <Input
                        id="customColor"
                        type="color"
                        value={themeConfig.primaryColor}
                        onChange={(e) => setThemeConfig({
                            colorTemplate: 'rosa-salmon',  // Reset template
                            primaryColor: e.target.value
                        })}
                        className="w-20 h-12 cursor-pointer"
                    />
                    <Input
                        type="text"
                        value={themeConfig.primaryColor}
                        onChange={(e) => setThemeConfig({
                            colorTemplate: 'rosa-salmon',
                            primaryColor: e.target.value
                        })}
                        placeholder="#c7757f"
                        className="flex-1"
                    />
                </div>
            </div>

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
