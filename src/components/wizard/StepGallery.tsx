"use client";

import { useWizardStore } from "@/store/wizard-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { Plus, X } from "lucide-react";

export function StepGallery() {
    const { data, setData, nextStep, prevStep } = useWizardStore();
    const [newPhotoUrl, setNewPhotoUrl] = useState("");

    const galeriaPrincipal = data.galeriaPrincipalFotos 
        ? (typeof data.galeriaPrincipalFotos === 'string' 
            ? JSON.parse(data.galeriaPrincipalFotos) 
            : data.galeriaPrincipalFotos)
        : [];

    const addPhoto = () => {
        if (newPhotoUrl.trim()) {
            const updatedPhotos = [...galeriaPrincipal, newPhotoUrl.trim()];
            setData({ galeriaPrincipalFotos: updatedPhotos as any });
            setNewPhotoUrl("");
        }
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
                    Agrega fotos para mostrar en tu invitación
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
                        <div className="space-y-2">
                            <Label>Agregar foto (URL)</Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="https://ejemplo.com/foto.jpg"
                                    value={newPhotoUrl}
                                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addPhoto()}
                                />
                                <Button type="button" onClick={addPhoto} size="icon">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {galeriaPrincipal.length > 0 && (
                            <div className="space-y-2">
                                <Label>Fotos agregadas ({galeriaPrincipal.length})</Label>
                                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                                    {galeriaPrincipal.map((url: string, index: number) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={url}
                                                alt={`Foto ${index + 1}`}
                                                className="w-full h-24 object-cover rounded border"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removePhoto(index)}
                                                className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3 h-3" />
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
