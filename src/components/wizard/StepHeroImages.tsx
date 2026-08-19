"use client";

import { useEffect, useRef, useState } from "react";
import { useWizardStore } from "@/store/wizard-store";
import { Label } from "@/components/ui/label";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { useToast } from "@/components/ui/Toast";
import { Info, ChevronDown, ChevronUp, AlertTriangle, X } from "lucide-react";
import { SaveStepButtons } from "./SaveStepButtons";

const CINEMATICO_TIP = "Probá los dos: con foto (efecto cinemático) y sin foto (fondo decorativo propio de la plantilla).";

export function StepHeroImages() {
    const { data, setData, nextStep } = useWizardStore();
    const { showToast } = useToast();
    const [showInfo, setShowInfo] = useState(false);
    const [showMissingImageError, setShowMissingImageError] = useState(false);
    const [showCinematicoTip, setShowCinematicoTip] = useState(false);
    const cinematicoTipTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const triggerCinematicoTip = () => {
        setShowCinematicoTip(true);
        if (cinematicoTipTimeout.current) clearTimeout(cinematicoTipTimeout.current);
        cinematicoTipTimeout.current = setTimeout(() => setShowCinematicoTip(false), 10000);
    };

    // Se muestra sola apenas se entra al paso si todavía no hay foto cargada
    // -- así el usuario ve la sugerencia ANTES de decidir, no solo después.
    useEffect(() => {
        if (!data.portadaImagenFondoDesktop) {
            triggerCinematicoTip();
        }
        return () => {
            if (cinematicoTipTimeout.current) clearTimeout(cinematicoTipTimeout.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
                        La Portada Invitación es la que se ve como foto de portada de la invitación (obligatoria, todas las plantillas la usan). La Portada de bienvenida es opcional: si cargás una foto ahí, reemplaza el fondo original de la portada de bienvenida por esa foto. Si la dejás vacía, la portada se ve tal cual la plantilla que elegiste, sin cambios.
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 max-w-4xl mx-auto">
                {/* Foto de la portada de bienvenida (opcional) -- antes
                    "Portada PC": ese recorte no cumplía un propósito propio
                    (la de celular ya sirve perfecto en pantallas anchas
                    también). Se recicla como disparador de la portada de
                    bienvenida animada -- ver AnimatedCoverPhoto.tsx y su uso
                    en cada plantilla. Mismo aspectRatio que la de celular
                    (4/5) a propósito: son el mismo tipo de foto vertical de
                    portada, así los dos recortes quedan a la misma altura
                    en esta grilla en vez de desalineados. */}
                <div className="space-y-2.5 p-4 rounded-2xl bg-[var(--ink-2)] border border-white/10">
                    <Label htmlFor="heroImagenFondoDesktop" className="font-semibold text-sm block min-h-[2.5rem]">Portada de bienvenida</Label>
                    <div className="relative">
                        <ImageUploader
                            currentImage={data.portadaImagenFondoDesktop}
                            onImageUploaded={(url: string) => {
                                setData({ portadaImagenFondoDesktop: url });
                                triggerCinematicoTip();
                            }}
                            onRemove={() => {
                                setData({ portadaImagenFondoDesktop: "" });
                                triggerCinematicoTip();
                            }}
                            aspectRatio={4 / 5}
                        />
                        {showCinematicoTip && (
                            <div className="absolute left-0 top-full mt-2.5 z-20 w-72 max-w-[85vw] animate-in fade-in slide-in-from-top-1 duration-300">
                                <div className="absolute -top-1.5 left-6 w-3 h-3 bg-amber-950 border-l border-t border-amber-500/50 rotate-45" />
                                <div className="relative flex items-start gap-1.5 rounded-lg border border-amber-500/50 bg-amber-950 text-amber-100 shadow-xl px-3 py-2.5 text-xs leading-relaxed">
                                    <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                                    <span className="flex-1">{CINEMATICO_TIP}</span>
                                    <button
                                        type="button"
                                        onClick={() => setShowCinematicoTip(false)}
                                        className="shrink-0 text-amber-400/70 hover:text-amber-200 transition-colors"
                                        aria-label="Cerrar"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-normal">
                        Si cargás una foto acá, reemplaza el fondo original de la portada de bienvenida por esta foto.
                    </p>
                </div>

                {/* Hero Background Image Mobile */}
                <div className={`space-y-2.5 p-4 rounded-2xl bg-[var(--ink-2)] border ${showMissingImageError && !data.portadaImagenFondo ? 'border-red-500/60' : 'border-white/10'}`}>
                    <Label htmlFor="heroImagenFondo" className="font-semibold text-sm block min-h-[2.5rem]">Portada Invitación *</Label>
                    <ImageUploader
                        currentImage={data.portadaImagenFondo}
                        onImageUploaded={(url: string) => { setData({ portadaImagenFondo: url }); setShowMissingImageError(false); }}
                        aspectRatio={4 / 5}
                    />
                    <p className="text-xs text-muted-foreground leading-normal">
                        Se verá como foto de portada de la invitación. Obligatoria: todos los templates la usan como imagen principal.
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
