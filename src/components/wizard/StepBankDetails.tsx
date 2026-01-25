"use client";

import { useWizardStore } from "@/store/wizard-store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export function StepBankDetails() {
    const { data, setData, nextStep, prevStep } = useWizardStore();

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Datos Bancarios / Regalo</h2>
                <p className="text-muted-foreground">
                    Comparte tu CBU o Alias para quienes deseen hacerte un regalo.
                </p>
            </div>

            <div className="space-y-4 bg-slate-50 p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                    <Label htmlFor="enableGift" className="text-lg font-medium">
                        Habilitar Sección de Regalo
                    </Label>
                    <Switch
                        id="enableGift"
                        checked={data.regaloHabilitado}
                        onCheckedChange={(checked) => setData({ regaloHabilitado: checked })}
                    />
                </div>

                {data.regaloHabilitado && (
                    <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="space-y-2">
                            <Label htmlFor="giftTitle">Título de la Sección</Label>
                            <Input
                                id="giftTitle"
                                value={data.regaloTitulo || "Regalo"}
                                onChange={(e) => setData({ regaloTitulo: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="giftMessage">Mensaje (Opcional)</Label>
                            <Textarea
                                id="giftMessage"
                                placeholder="Tu presencia es nuestro mejor regalo, pero si deseas colaborar..."
                                value={data.regaloMensaje || ""}
                                onChange={(e) => setData({ regaloMensaje: e.target.value })}
                            />
                        </div>

                        <div className="flex items-center justify-between py-2">
                            <Label htmlFor="showBankDetails" className="font-medium">
                                Mostrar Datos Bancarios
                            </Label>
                            <Switch
                                id="showBankDetails"
                                checked={data.regaloMostrarDatos}
                                onCheckedChange={(checked) => setData({ regaloMostrarDatos: checked })}
                            />
                        </div>

                        {data.regaloMostrarDatos && (
                            <div className="grid gap-4 p-4 border rounded-md bg-white">
                                <div className="space-y-2">
                                    <Label htmlFor="bankName">Banco</Label>
                                    <Input
                                        id="bankName"
                                        placeholder="Ej: Banco Galicia"
                                        value={data.regaloBanco || ""}
                                        onChange={(e) => setData({ regaloBanco: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cbu">CBU / CVU</Label>
                                    <Input
                                        id="cbu"
                                        placeholder="0000000000000000000000"
                                        value={data.regaloCbu || ""}
                                        onChange={(e) => setData({ regaloCbu: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="alias">Alias</Label>
                                    <Input
                                        id="alias"
                                        placeholder="mi.alias.mp"
                                        value={data.regaloAlias || ""}
                                        onChange={(e) => setData({ regaloAlias: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="titular">Titular de la cuenta</Label>
                                    <Input
                                        id="titular"
                                        placeholder="Nombre Apellido"
                                        value={data.regaloTitular || ""}
                                        onChange={(e) => setData({ regaloTitular: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="flex justify-between pt-6">
                <Button type="button" variant="outline" onClick={prevStep}>
                    Anterior
                </Button>
                <Button onClick={nextStep}>
                    Siguiente
                </Button>
            </div>
        </div>
    );
}
