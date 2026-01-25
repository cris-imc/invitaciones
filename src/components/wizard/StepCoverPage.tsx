"use client";

import { useWizardStore } from "@/store/wizard-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

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
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="portadaHabilitada"
                        checked={data.portadaHabilitada}
                        onCheckedChange={(checked) =>
                            setData({ portadaHabilitada: Boolean(checked) })
                        }
                    />
                    <Label htmlFor="portadaHabilitada">
                        Mostrar portada de bienvenida
                    </Label>
                </div>

                {data.portadaHabilitada && (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="portadaTitulo">Título de la portada</Label>
                            <Input
                                id="portadaTitulo"
                                placeholder="¡Estás invitado!"
                                value={data.portadaTitulo || ""}
                                onChange={(e) => setData({ portadaTitulo: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="portadaTextoBoton">Texto del botón</Label>
                            <Input
                                id="portadaTextoBoton"
                                placeholder="ABRIR INVITACIÓN"
                                value={data.portadaTextoBoton || ""}
                                onChange={(e) => setData({ portadaTextoBoton: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="portadaImagenFondo">URL de imagen de fondo (opcional)</Label>
                            <Input
                                id="portadaImagenFondo"
                                type="url"
                                placeholder="https://ejemplo.com/imagen.jpg"
                                value={data.portadaImagenFondo || ""}
                                onChange={(e) => setData({ portadaImagenFondo: e.target.value })}
                            />
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
