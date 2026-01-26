"use client";

import { useState } from "react";
import { X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface ImagePositionEditorProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
    currentPosition?: { x: number; y: number };
    currentScale?: number;
    onSave: (position: { x: number; y: number }, scale: number) => void;
}

export function ImagePositionEditor({
    isOpen,
    onClose,
    imageUrl,
    currentPosition = { x: 50, y: 50 },
    currentScale = 100,
    onSave,
}: ImagePositionEditorProps) {
    const [position, setPosition] = useState(currentPosition);
    const [scale, setScale] = useState(currentScale);

    const handleSave = () => {
        onSave(position, scale);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Ajustar Posición de Imagen</DialogTitle>
                    <DialogDescription>
                        Mueve los controles para ajustar la posición y el zoom de la imagen de portada.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Vista previa */}
                    <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                        <div
                            className="absolute inset-0"
                            style={{
                                backgroundImage: `url(${imageUrl})`,
                                backgroundPosition: `${position.x}% ${position.y}%`,
                                backgroundSize: scale === 100 ? 'cover' : `${scale}%`,
                                backgroundRepeat: 'no-repeat',
                            }}
                        />
                        {/* Overlay gradient simulado */}
                        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/20 to-white/40 pointer-events-none" />
                        
                        {/* Grid de ayuda */}
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-1/2 left-0 right-0 h-px bg-primary/30" />
                            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-primary/30" />
                        </div>
                    </div>

                    {/* Controles */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Posición Horizontal: {position.x}%</Label>
                            <Slider
                                value={[position.x]}
                                onValueChange={(value) => setPosition({ ...position, x: value[0] })}
                                min={0}
                                max={100}
                                step={1}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Posición Vertical: {position.y}%</Label>
                            <Slider
                                value={[position.y]}
                                onValueChange={(value) => setPosition({ ...position, y: value[0] })}
                                min={0}
                                max={100}
                                step={1}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Zoom: {scale}%</Label>
                            <Slider
                                value={[scale]}
                                onValueChange={(value) => setScale(value[0])}
                                min={50}
                                max={200}
                                step={5}
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                    </Button>
                    <Button onClick={handleSave}>
                        <Save className="h-4 w-4 mr-2" />
                        Guardar Cambios
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
