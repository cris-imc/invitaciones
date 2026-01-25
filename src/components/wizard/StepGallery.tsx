"use client";

import { useWizardStore } from "@/store/wizard-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { X } from "lucide-react";

export function StepGallery() {
    const { data, setData, nextStep, prevStep } = useWizardStore();

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
            <div>
                <h2 className="text-2xl font-bold mb-2">Galería de Fotos</h2>
                <p className="text-muted-foreground">
                    Sube las mejores fotos para tu invitación. Se recomienda formato cuadrado (1:1).
                </p>
            </div>

            <div className="space-y-4">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="galeriaPrincipalHabilitada"
                        checked={data.galeriaPrincipalHabilitada}
                        onCheckedChange={(checked) =>
                            setData({ galeriaPrincipalHabilitada: Boolean(checked) })
                        }
                    />
                    <Label htmlFor="galeriaPrincipalHabilitada">
                        Mostrar galería de fotos
                    </Label>
                </div>

                {data.galeriaPrincipalHabilitada && (
                    <>
                        <div className="space-y-4">
                            <Label>Agregar nueva foto</Label>
                            <ImageUploader
                                onImageUploaded={handleImageUploaded}
                                aspectRatio={1}
                            />
                        </div>

                        {galeriaPrincipal.length > 0 && (
                            <div className="space-y-2">
                                <Label>Fotos agregadas ({galeriaPrincipal.length})</Label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {galeriaPrincipal.map((url: string, index: number) => (
                                        <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border">
                                            <img
                                                src={url}
                                                alt={`Foto ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removePhoto(index)}
                                                className="absolute top-2 right-2 bg-destructive/90 hover:bg-destructive text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
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
