"use client";

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg, PixelCrop } from '@/lib/image-processing';
import { Button } from '@/components/ui/button';
import { X, Check } from 'lucide-react';

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

    const onCropChange = (crop: { x: number; y: number }) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom: number) => {
        setZoom(zoom);
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

    return (
        <div className="fixed inset-0 z-[60] bg-black/90 flex flex-col animate-in fade-in duration-200">
            <div className="bg-black/50 p-4 flex justify-between items-center z-10 backdrop-blur-sm">
                <h3 className="text-white font-medium">Ajustar imagen</h3>
                <Button variant="ghost" size="icon" onClick={onCancel} className="text-white hover:bg-white/10">
                    <X className="w-6 h-6" />
                </Button>
            </div>

            <div className="flex-1 relative">
                <Cropper
                    image={image}
                    crop={crop}
                    zoom={zoom}
                    aspect={aspectRatio}
                    onCropChange={onCropChange}
                    onZoomChange={onZoomChange}
                    onCropComplete={onCropCompleteCallback}
                    showGrid={true}
                />
            </div>

            <div className="bg-black/80 p-6 space-y-6 backdrop-blur-md">
                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-400">
                        <span>Zoom</span>
                        <span>{zoom.toFixed(1)}x</span>
                    </div>
                    <input
                        type="range"
                        min={1}
                        max={3}
                        step={0.1}
                        value={zoom}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                </div>

                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        className="flex-1 border-white/20 text-white hover:bg-white/10 bg-transparent"
                        onClick={onCancel}
                    >
                        Cancelar
                    </Button>
                    <Button
                        className="flex-1 gap-2"
                        onClick={handleCropConfirm}
                        disabled={isProcessing}
                    >
                        {isProcessing ? 'Procesando...' : (
                            <>
                                <Check className="w-4 h-4" />
                                Confirmar Recorte
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
