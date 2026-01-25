"use client";

import { useWizardStore } from "@/store/wizard-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MusicUploader } from "@/components/ui/MusicUploader";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export function StepMusic() {
    const { data, setData, nextStep, prevStep } = useWizardStore();

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">Música de Fondo</h2>
                <p className="text-muted-foreground">
                    Agrega música para que suene mientras ven la invitación
                </p>
            </div>

            <div className="space-y-4">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="musicaHabilitada"
                        checked={data.musicaHabilitada}
                        onCheckedChange={(checked) =>
                            setData({ musicaHabilitada: Boolean(checked) })
                        }
                    />
                    <Label htmlFor="musicaHabilitada">
                        Activar música de fondo
                    </Label>
                </div>

                {data.musicaHabilitada && (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="musicaUrl">Archivo de Audio</Label>
                            <MusicUploader
                                currentMusicUrl={data.musicaUrl}
                                onMusicUploaded={(url) => setData({ musicaUrl: url })}
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="musicaAutoplay"
                                checked={data.musicaAutoplay}
                                onCheckedChange={(checked) =>
                                    setData({ musicaAutoplay: Boolean(checked) })
                                }
                            />
                            <Label htmlFor="musicaAutoplay">
                                Reproducir automáticamente
                            </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="musicaLoop"
                                checked={data.musicaLoop}
                                onCheckedChange={(checked) =>
                                    setData({ musicaLoop: Boolean(checked) })
                                }
                            />
                            <Label htmlFor="musicaLoop">
                                Repetir en bucle
                            </Label>
                        </div>
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
