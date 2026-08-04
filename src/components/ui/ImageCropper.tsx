"use client";

import { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Cropper from 'react-easy-crop';
import { getCroppedImg, PixelCrop } from '@/lib/image-processing';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { X, Check, ZoomIn } from 'lucide-react';

interface ImageCropperProps {
    image: string;
    onCropComplete: (croppedImage: string) => void;
    onCancel: () => void;
    aspectRatio?: number;
}

export default function ImageCropper({
    image,
    onCropComplete,
    onCancel,
    aspectRatio = 1,
}: ImageCropperProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [mounted, setMounted] = useState(false);

    // El PageTransition global (template.tsx) anima filter/transform sobre
    // toda la app, lo que crea un containing block nuevo para position:fixed
    // — un fixed inset-0 adentro deja de anclarse a la pantalla real y se
    // ancla al alto de esa página. Un portal a <body> lo escapa del todo.
    useEffect(() => {
        setMounted(true);
    }, []);

    const onCropChange = (crop: { x: number; y: number }) => {
        setCrop(crop);
    };

    const onCropCompleteCallback = useCallback((croppedArea: any, croppedAreaPixels: PixelCrop) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleCropConfirm = async () => {
        if (!croppedAreaPixels) return;
        setIsProcessing(true);
        try {
            const croppedImage = await getCroppedImg(image, croppedAreaPixels);
            onCropComplete(croppedImage);
        } catch (error) {
            console.error('Error cropping:', error);
            alert('Error al recortar la imagen');
        } finally {
            setIsProcessing(false);
        }
    };

    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[60] bg-black/95 flex flex-col animate-in fade-in duration-200">
            {/* Header */}
            <div className="shrink-0 px-4 py-3 flex justify-between items-center border-b border-white/10">
                <h3 className="text-white text-sm font-medium">Ajustar imagen</h3>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onCancel}
                    className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                >
                    <X className="w-5 h-5" />
                </Button>
            </div>

            {/* Área de recorte: min-h-0 es clave para que este panel se achique
                correctamente dentro del flex column y nunca empuje los
                controles de abajo fuera de la pantalla en viewports bajos. */}
            <div className="flex-1 min-h-0 relative">
                <Cropper
                    image={image}
                    crop={crop}
                    zoom={zoom}
                    aspect={aspectRatio}
                    onCropChange={onCropChange}
                    onZoomChange={setZoom}
                    onCropComplete={onCropCompleteCallback}
                    showGrid={true}
                />
            </div>

            {/* Controles: max-w-sm + mx-auto para que en desktop (donde este
                overlay ocupa todo el ancho de pantalla) los botones no se
                estiren de punta a punta — en mobile igual ocupan el ancho
                disponible porque el contenedor es más angosto que max-w-sm. */}
            <div className="shrink-0 px-4 py-4 border-t border-white/10 bg-black/40">
                <div className="max-w-sm mx-auto space-y-4">
                    <div className="flex items-center gap-3">
                        <ZoomIn className="w-4 h-4 text-white/50 shrink-0" />
                        <Slider
                            value={[zoom]}
                            onValueChange={([v]) => setZoom(v)}
                            min={1}
                            max={3}
                            step={0.05}
                            className="flex-1"
                        />
                        <span className="text-xs text-white/50 w-9 text-right tabular-nums shrink-0">{zoom.toFixed(1)}x</span>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="flex-1 h-11 border-white/15 text-white hover:bg-white/10 bg-transparent"
                            onClick={onCancel}
                        >
                            Cancelar
                        </Button>
                        <Button
                            className="flex-1 h-11 gap-2"
                            onClick={handleCropConfirm}
                            disabled={isProcessing}
                        >
                            {isProcessing ? 'Procesando...' : (
                                <>
                                    <Check className="w-4 h-4" />
                                    Confirmar
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
