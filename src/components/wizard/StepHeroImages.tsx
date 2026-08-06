"use client";

import { useState } from "react";
import { useWizardStore } from "@/store/wizard-store";
import { Label } from "@/components/ui/label";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { useToast } from "@/components/ui/Toast";
import { Info, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { SaveStepButtons } from "./SaveStepButtons";

export function StepHeroImages() {
    const { data, setData, nextStep } = useWizardStore();
    const { showToast } = useToast();
    const [showInfo, setShowInfo] = useState(false);
    const [showMissingImageError, setShowMissingImageError] = useState(false);

    const handleNext = () => {
        if (!data.portadaImagenFondo) {
            setShowMissingImageError(true);
            showToast("Cargá la imagen de portada mobile antes de continuar.", "error");
            return;
        }
        setShowMissingImageError(false);
        nextStep();
    };

    return (
        <div className="space-y-6">
            <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold">Fotos de Portada y Fondo</h2>
                <p className="text-muted-foreground text-sm">
                    Imágenes de fondo principales que vestirán la presentación de tu tarjeta.
                </p>
            </div>

            {/* Caja informativa de Usabilidad (Collapsible - Minimizada por defecto) */}
            <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs overflow-hidden transition-all duration-200 shadow-sm max-w-2xl mx-auto">
                <button
                    type="button"
                    onClick={() => setShowInfo(!showInfo)}
                    className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-amber-500/15 transition-colors cursor-pointer"
                >
                    <div className="flex items-center gap-2.5 font-semibold text-amber-300 text-sm">
                        <Info className="w-4.5 h-4.5 shrink-0 text-amber-400" />
                        <span>¿Para qué sirven las Fotos de Portada y Fondo?</span>
                    </div>
                    <div className="text-amber-400 opacity-80 hover:opacity-100 transition-opacity shrink-0">
                        {showInfo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                </button>

                {showInfo && (
                    <div className="px-4 pb-4 pt-1 border-t border-amber-500/20 text-[13px] leading-relaxed opacity-95 animate-in fade-in duration-200">
                        Son las imágenes de fondo de la portada inicial. Ambas se ven verticales: la de celular ocupa la pantalla completa del teléfono (el recorte exacto varía un poco según el tamaño de cada celular) y la de PC se ve como panel lateral. Elegí fotos donde el sujeto principal quede centrado para que se adapten bien en cualquier dispositivo.
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 max-w-4xl mx-auto">
                {/* Hero Background Image Desktop */}
                <div className="space-y-2.5 p-4 rounded-2xl bg-[var(--ink-2)] border border-white/10">
                    <Label htmlFor="heroImagenFondoDesktop" className="font-semibold text-sm">Portada PC</Label>
                    <ImageUploader
                        currentImage={data.portadaImagenFondoDesktop}
                        onImageUploaded={(url: string) => setData({ portadaImagenFondoDesktop: url })}
                        aspectRatio={400 / 640}
                    />
                    <p className="text-xs text-muted-foreground leading-normal">
                        Se verá en computadoras o pantallas anchas como panel lateral izquierdo de bienvenida.
                    </p>
                </div>

                {/* Hero Background Image Mobile */}
                <div className={`space-y-2.5 p-4 rounded-2xl bg-[var(--ink-2)] border ${showMissingImageError && !data.portadaImagenFondo ? 'border-red-500/60' : 'border-white/10'}`}>
                    <Label htmlFor="heroImagenFondo" className="font-semibold text-sm">Portada Celular *</Label>
                    <ImageUploader
                        currentImage={data.portadaImagenFondo}
                        onImageUploaded={(url: string) => { setData({ portadaImagenFondo: url }); setShowMissingImageError(false); }}
                        aspectRatio={4 / 5}
                    />
                    <p className="text-xs text-muted-foreground leading-normal">
                        Se verá en teléfonos celulares como cabecera o fondo de pantalla previa. Obligatoria: todos los templates la usan como imagen principal.
                    </p>
                    {showMissingImageError && !data.portadaImagenFondo && (
                        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>Esta imagen es obligatoria para poder continuar.</span>
                        </div>
                    )}
                </div>
            </div>

            <SaveStepButtons onNext={handleNext} />
        </div>
    );
}
