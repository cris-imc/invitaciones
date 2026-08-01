"use client";

import { useState } from "react";
import { useWizardStore } from "@/store/wizard-store";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { X, Info, ChevronDown, ChevronUp } from "lucide-react";
import { SaveStepButtons } from "./SaveStepButtons";

export function StepGallery() {
    const { data, setData } = useWizardStore();
    const [showInfo, setShowInfo] = useState(false);

    const galeriaPrincipal = data.galeriaPrincipalFotos
        ? (typeof data.galeriaPrincipalFotos === 'string'
            ? JSON.parse(data.galeriaPrincipalFotos)
            : data.galeriaPrincipalFotos)
        : [];

    const handleImageUploaded = (userId: string) => {
        const updatedPhotos = [...galeriaPrincipal, userId];
        setData({ galeriaPrincipalFotos: updatedPhotos as any });
    };

    const removePhoto = (index: number) => {
        const updatedPhotos = galeriaPrincipal.filter((_: any, i: number) => i !== index);
        setData({ galeriaPrincipalFotos: updatedPhotos as any });
    };

    return (
        <div className="space-y-6">
            <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold">Galería de Fotos</h2>
                <p className="text-muted-foreground text-sm">
                    Subí tus mejores fotos para lucir en la invitación.
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
                        <span>¿Cómo funciona la Galería de Fotos?</span>
                    </div>
                    <div className="text-amber-400 opacity-80 hover:opacity-100 transition-opacity shrink-0">
                        {showInfo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                </button>

                {showInfo && (
                    <div className="px-4 pb-4 pt-1 border-t border-amber-500/20 text-[13px] leading-relaxed opacity-95 animate-in fade-in duration-200">
                        Las fotos que subas aquí conformarán un carrusel interactivo continuo en la tarjeta. Se recomienda subir fotos en formato cuadrado u horizontal para asegurar una visualización óptima en celulares.
                    </div>
                )}
            </div>

            <div className="space-y-4 max-w-2xl mx-auto">
                <div className="flex items-center space-x-2.5 p-4 rounded-xl bg-[var(--ink-2)] border border-white/10">
                    <Checkbox
                        id="galeriaPrincipalHabilitada"
                        checked={data.galeriaPrincipalHabilitada}
                        onCheckedChange={(checked) =>
                            setData({ galeriaPrincipalHabilitada: Boolean(checked) })
                        }
                    />
                    <Label htmlFor="galeriaPrincipalHabilitada" className="text-sm font-semibold cursor-pointer">
                        Mostrar galería de fotos en la tarjeta
                    </Label>
                </div>

                {data.galeriaPrincipalHabilitada && (
                    <>
                        <div className="space-y-2 pt-2">
                            <Label className="text-sm font-medium">Agregar nueva foto</Label>
                            <ImageUploader
                                onImageUploaded={handleImageUploaded}
                                aspectRatio={1}
                            />
                        </div>

                        {galeriaPrincipal.length > 0 && (
                            <div className="space-y-2 pt-2">
                                <Label className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                                    Fotos agregadas ({galeriaPrincipal.length})
                                </Label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {galeriaPrincipal.map((url: string, index: number) => (
                                        <div key={index} className="relative group aspect-square rounded-2xl overflow-hidden border border-white/15 shadow-md">
                                            <img
                                                src={url}
                                                alt={`Foto ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removePhoto(index)}
                                                className="absolute top-2 right-2 bg-destructive/90 hover:bg-destructive text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <SaveStepButtons />
        </div>
    );
}
