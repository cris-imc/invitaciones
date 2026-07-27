"use client";

import { useWizardStore } from "@/store/wizard-store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { SaveStepButtons } from "./SaveStepButtons";

export function StepHeroImages() {
    const { data, setData, nextStep, prevStep } = useWizardStore();

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">Fotos de Portada</h2>
                <p className="text-muted-foreground">
                    Estas son las imágenes de fondo principales que se verán al abrir la invitación.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Hero Background Image Desktop */}
                <div className="space-y-2">
                    <Label htmlFor="heroImagenFondoDesktop">Portada (Desktop - Vertical)</Label>
                    <ImageUploader
                        currentImage={data.portadaImagenFondoDesktop}
                        onImageUploaded={(url: string) => setData({ portadaImagenFondoDesktop: url })}
                        aspectRatio={9 / 16}
                    />
                    <p className="text-xs text-muted-foreground">
                        Esta imagen se verá en computadoras o pantallas anchas (panel izquierdo).
                    </p>
                </div>

                {/* Hero Background Image Mobile */}
                <div className="space-y-2">
                    <Label htmlFor="heroImagenFondo">Portada (Mobile - Horizontal)</Label>
                    <ImageUploader
                        currentImage={data.portadaImagenFondo}
                        onImageUploaded={(url: string) => setData({ portadaImagenFondo: url })}
                        aspectRatio={16 / 9}
                    />
                    <p className="text-xs text-muted-foreground">
                        Esta imagen se verá en dispositivos móviles (celulares) como cabecera.
                    </p>
                </div>
            </div>

            <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={prevStep}>
                    Anterior
                </Button>
                <Button onClick={nextStep}>
                    Siguiente
                </Button>
            </div>
        </div>
    );
}
