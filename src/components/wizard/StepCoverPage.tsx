"use client";

import { useWizardStore } from "@/store/wizard-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
                            <p className="text-xs text-muted-foreground">
                                Mensaje de bienvenida opcional. Tu nombre se mostrará automáticamente debajo.
                            </p>
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
                            <Label htmlFor="portadaImagenFondo">Imagen de Fondo</Label>
                            <ImageUploader
                                currentImage={data.portadaImagenFondo}
                                onImageUploaded={(url: string) => setData({ portadaImagenFondo: url })}
                                aspectRatio={16 / 9} // Horizontal format
                            />
                            <p className="text-xs text-muted-foreground">Sube la imagen y luego ajusta el encuadre para cada dispositivo.</p>
                        </div>

                        {data.portadaImagenFondo && (
                            <div className="pt-4 border-t mt-4 space-y-4">
                                <Label>Ajuste de Encuadre</Label>
                                <Tabs defaultValue="mobile" className="w-full">
                                    <TabsList className="w-full grid grid-cols-2">
                                        <TabsTrigger value="mobile">Móvil</TabsTrigger>
                                        <TabsTrigger value="desktop">Escritorio</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="mobile" className="space-y-4 pt-4">
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-xs">
                                                <Label>Posición Horizontal (X)</Label>
                                                <span>{data.portadaImagenPosX ?? 50}%</span>
                                            </div>
                                            <Slider
                                                value={[data.portadaImagenPosX ?? 50]}
                                                onValueChange={([val]) => setData({ portadaImagenPosX: val })}
                                                max={100}
                                                step={1}
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-xs">
                                                <Label>Posición Vertical (Y)</Label>
                                                <span>{data.portadaImagenPosY ?? 50}%</span>
                                            </div>
                                            <Slider
                                                value={[data.portadaImagenPosY ?? 50]}
                                                onValueChange={([val]) => setData({ portadaImagenPosY: val })}
                                                max={100}
                                                step={1}
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-xs">
                                                <Label>Escala / Zoom</Label>
                                                <span>{data.portadaImagenEscala ?? 100}%</span>
                                            </div>
                                            <Slider
                                                value={[data.portadaImagenEscala ?? 100]}
                                                onValueChange={([val]) => setData({ portadaImagenEscala: val })}
                                                min={100}
                                                max={200}
                                                step={1}
                                            />
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="desktop" className="space-y-4 pt-4">
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-xs">
                                                <Label>Posición Horizontal (X)</Label>
                                                <span>{data.portadaImagenDesktopPosX ?? 50}%</span>
                                            </div>
                                            <Slider
                                                value={[data.portadaImagenDesktopPosX ?? 50]}
                                                onValueChange={([val]) => setData({ portadaImagenDesktopPosX: val })}
                                                max={100}
                                                step={1}
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-xs">
                                                <Label>Posición Vertical (Y)</Label>
                                                <span>{data.portadaImagenDesktopPosY ?? 50}%</span>
                                            </div>
                                            <Slider
                                                value={[data.portadaImagenDesktopPosY ?? 50]}
                                                onValueChange={([val]) => setData({ portadaImagenDesktopPosY: val })}
                                                max={100}
                                                step={1}
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-xs">
                                                <Label>Escala / Zoom</Label>
                                                <span>{data.portadaImagenDesktopEscala ?? 100}%</span>
                                            </div>
                                            <Slider
                                                value={[data.portadaImagenDesktopEscala ?? 100]}
                                                onValueChange={([val]) => setData({ portadaImagenDesktopEscala: val })}
                                                min={50}
                                                max={200}
                                                step={1}
                                            />
                                        </div>
                                    </TabsContent>
                                </Tabs>
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
