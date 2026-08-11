"use client";

import { useState } from "react";
import { useWizardStore } from "@/store/wizard-store";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUploader } from "@/components/ui/ImageUploader";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Info, ChevronDown, ChevronUp, AlertCircle, ImageOff } from "lucide-react";
import { SaveStepButtons } from "./SaveStepButtons";
import { PLAN_LIMITS, type PlanTier } from "@/lib/plan-limits";

export function StepGallery() {
    const { data, setData, usePremiumCredit, useDiamondCredit } = useWizardStore();
    const [showInfo, setShowInfo] = useState(false);
    const [showRedWarning, setShowRedWarning] = useState(false);
    const [showLimitModal, setShowLimitModal] = useState(false);

    const galeriaPrincipal = data.galeriaPrincipalFotos
        ? (typeof data.galeriaPrincipalFotos === 'string'
            ? JSON.parse(data.galeriaPrincipalFotos)
            : data.galeriaPrincipalFotos)
        : [];

    // Si la invitación ya tiene un ID (edición) usamos su planTier real,
    // sino el tier efectivo segun el credito elegido en el paso de creación.
    const isEditing = Boolean(data.id);
    const effectivePlanTier: PlanTier = isEditing
        ? ((data.planTier as PlanTier) || "FREE")
        : (usePremiumCredit || useDiamondCredit ? "PREMIUM" : "FREE");
    const maxPhotos = PLAN_LIMITS[effectivePlanTier]?.maxPhotos ?? PLAN_LIMITS.FREE.maxPhotos;
    const limitReached = maxPhotos !== null && galeriaPrincipal.length >= maxPhotos;

    const handleImageUploaded = (userId: string) => {
        if (limitReached) {
            setShowLimitModal(true);
            return;
        }
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
                        {/* Burbuja Roja / Alerta Destacada sobre carga individual (Collapsible - Minimizada por defecto) */}
                        <div className="rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs overflow-hidden transition-all duration-200 shadow-md">
                            <button
                                type="button"
                                onClick={() => setShowRedWarning(!showRedWarning)}
                                className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-rose-500/20 transition-colors cursor-pointer"
                            >
                                <div className="flex items-center gap-2 font-bold text-rose-300 text-sm">
                                    <AlertCircle className="w-4.5 h-4.5 shrink-0 text-rose-400" />
                                    <span>Importante sobre la selección de fotos</span>
                                </div>
                                <div className="text-rose-400 opacity-80 hover:opacity-100 transition-opacity shrink-0">
                                    {showRedWarning ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </div>
                            </button>

                            {showRedWarning && (
                                <div className="px-4 pb-4 pt-1 border-t border-rose-500/25 text-[13px] leading-relaxed opacity-95 animate-in fade-in duration-200">
                                    Las fotos deben seleccionarse <strong>una a una</strong>. Al subir cada imagen, el sistema te permitirá ajustar y elegir el encuadre exacto en <strong>formato cuadrado (1:1)</strong> para que se adapte perfectamente al carrusel.
                                </div>
                            )}
                        </div>

                        <div className="space-y-2 pt-1">
                            <Label className="text-sm font-medium">Agregar nueva foto (de a una)</Label>
                            {limitReached ? (
                                <button
                                    type="button"
                                    onClick={() => setShowLimitModal(true)}
                                    className="w-full min-h-[140px] rounded-xl border-2 border-dashed border-amber-500/40 bg-amber-500/5 flex flex-col items-center justify-center gap-2 text-amber-300 text-sm p-6"
                                >
                                    <ImageOff className="w-6 h-6" />
                                    <span className="font-medium">Llegaste al límite de fotos de tu plan</span>
                                </button>
                            ) : (
                                <ImageUploader
                                    onImageUploaded={handleImageUploaded}
                                    aspectRatio={1}
                                />
                            )}
                        </div>

                        {galeriaPrincipal.length > 0 && (
                            <div className="space-y-2 pt-2">
                                <Label className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                                    Fotos agregadas ({galeriaPrincipal.length}{maxPhotos !== null ? `/${maxPhotos}` : ''})
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
                                                aria-label="Eliminar foto"
                                                className="absolute top-2 right-2 bg-destructive/90 hover:bg-destructive text-white rounded-full p-1.5 shadow-lg"
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

            <Dialog open={showLimitModal} onOpenChange={setShowLimitModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ImageOff className="w-5 h-5 text-amber-500" />
                            Llegaste al límite de fotos
                        </DialogTitle>
                        <DialogDescription className="pt-2">
                            Tu plan {PLAN_LIMITS[effectivePlanTier].name} permite hasta{" "}
                            <strong>{maxPhotos} fotos</strong> en el álbum. Actualizá tu plan para agregar más.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setShowLimitModal(false)}>Entendido</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
