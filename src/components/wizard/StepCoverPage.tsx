"use client";

import { useWizardStore } from "@/store/wizard-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SaveStepButtons } from "./SaveStepButtons";

export function StepCoverPage() {
    const { data, setData, nextStep, prevStep } = useWizardStore();

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">Portada de Bienvenida</h2>
                <p className="text-muted-foreground">
                    Configura la pantalla inicial que verán tus invitados
                </p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="portadaKicker">Encabezado / Copete de portada</Label>
                    <Input
                                id="portadaKicker"
                                className="bg-[var(--ink-2)] border border-white/20 text-[var(--on-ink)] h-12 rounded-xl"
                                placeholder="Ej: Con mucho cariño, para / ¡Te invitamos!"
                                value={data.portadaKicker || ""}
                                onChange={(e) => setData({ portadaKicker: e.target.value })}
                            />
                            <p className="text-xs text-muted-foreground">
                                Aparece arriba del nombre del invitado en la tarjeta de bienvenida.
                            </p>
                        </div>

                        

                        

                        <div className="space-y-2">
                            <Label htmlFor="portadaDressCode">Dress Code en Portada (Opcional)</Label>
                            <Input
                                id="portadaDressCode"
                                className="bg-[var(--ink-2)] border border-white/20 text-[var(--on-ink)] h-12 rounded-xl"
                                placeholder="Ej: Elegante Sport / Black Tie"
                                value={data.portadaDressCode || ""}
                                onChange={(e) => setData({ portadaDressCode: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="portadaTextoBoton">Texto del Botón de Entrada</Label>
                            <Input
                                id="portadaTextoBoton"
                                className="bg-[var(--ink-2)] border border-white/20 text-[var(--on-ink)] h-12 rounded-xl"
                                placeholder="Ej: Abrir invitación / Ver detalles"
                                value={data.portadaTextoBoton || ""}
                                onChange={(e) => setData({ portadaTextoBoton: e.target.value })}
                            />
                        </div>
            </div>

            <SaveStepButtons />
        </div>
    );
}
