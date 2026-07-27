"use client";
import { SaveStepButtons } from "./SaveStepButtons";

import { useWizardStore } from "@/store/wizard-store";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MusicUploader } from "@/components/ui/MusicUploader";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Lock } from "lucide-react";

export function StepMusic() {
    const { data, setData, nextStep, prevStep } = useWizardStore();
    const usePremiumCredit = useWizardStore((state) => state.usePremiumCredit);
    
    // Si la invitación ya tiene un ID (edición) usamos su planTier, sino usamos usePremiumCredit (creación)
    const isEditing = Boolean(data.id);
    const isLocked = isEditing ? data.planTier === "FREE" : !usePremiumCredit;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">Música de Fondo</h2>
                <p className="text-muted-foreground">
                    Agrega música para que suene mientras ven la invitación
                </p>
            </div>

            <div className="space-y-4">
                <div className="flex items-center space-x-2 relative group w-fit">
                    <Checkbox
                        id="musicaHabilitada"
                        checked={data.musicaHabilitada && !isLocked}
                        disabled={isLocked}
                        onCheckedChange={(checked) =>
                            setData({ musicaHabilitada: Boolean(checked) })
                        }
                    />
                    <Label htmlFor="musicaHabilitada" className={`flex items-center gap-2 ${isLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                        Activar música de fondo
                        {isLocked && <Lock className="w-4 h-4 text-red-400" />}
                    </Label>
                    {isLocked && (
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                            Disponible en Premium
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                        </div>
                    )}
                </div>

                {data.musicaHabilitada && !isLocked && (
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

                <div className="pt-6 pb-2 border-t mt-6">
                    <h2 className="text-xl font-bold mb-2">Sugerencia de Canciones</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                        Permite que tus invitados te sugieran canciones para la fiesta
                    </p>
                    <div className="flex items-center space-x-2 relative group w-fit">
                        <Checkbox
                            id="sugerenciaMusicaHabilitada"
                            checked={data.sugerenciaMusicaHabilitada && !isLocked}
                            disabled={isLocked}
                            onCheckedChange={(checked) =>
                                setData({ sugerenciaMusicaHabilitada: Boolean(checked) })
                            }
                        />
                        <Label htmlFor="sugerenciaMusicaHabilitada" className={`flex items-center gap-2 ${isLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                            Activar sugerencia de música
                            {isLocked && <Lock className="w-4 h-4 text-red-400" />}
                        </Label>
                        {isLocked && (
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                Disponible en Premium
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <SaveStepButtons />
        </div>
    );
}
