"use client";

import { useState } from "react";
import { useWizardStore } from "@/store/wizard-store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Info, ChevronDown, ChevronUp } from "lucide-react";
import { SaveStepButtons } from "./SaveStepButtons";

export function StepBankDetails() {
    const { data, setData, nextStep, prevStep } = useWizardStore();
    const [showInfo, setShowInfo] = useState(false);

    return (
        <div className="space-y-6">
            <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold">Datos Bancarios / Regalo</h2>
                <p className="text-muted-foreground text-sm">
                    Compartí tu CBU, Alias o sugerencia de regalo para tus invitados.
                </p>
            </div>

            {/* Caja informativa de Usabilidad (Collapsible - Minimizada por defecto) */}
            <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs overflow-hidden transition-all duration-200 shadow-sm max-w-2xl mx-auto">
                <button
                    type="button"
                    onClick={() => setShowInfo(!showInfo)}
                    className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-amber-500/15 transition-colors cursor-pointer"
                >
                    <div className="flex items-center gap-2.5 font-semibold text-amber-300 text-sm">
                        <Info className="w-4.5 h-4.5 shrink-0 text-amber-400" />
                        <span>¿Cómo funciona la Sección de Regalos?</span>
                    </div>
                    <div className="text-amber-400 opacity-80 hover:opacity-100 transition-opacity shrink-0">
                        {showInfo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                </button>

                {showInfo && (
                    <div className="px-4 pb-4 pt-1 border-t border-amber-500/20 text-[13px] leading-relaxed opacity-95 animate-in fade-in duration-200">
                        Si habilitás esta opción, tus invitados dispondrán de una tarjeta de regalos donde podrán hacer clic en un botón para copiar automáticamente tu CBU o Alias al portapapeles de su teléfono móvil para realizar transferencias.
                    </div>
                )}
            </div>

            <div className="space-y-4 bg-[var(--ink-2)] border-[var(--ink-2)] p-4 rounded-lg border">
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

                        <div className="grid gap-4 p-4 border border-[var(--ink-2)] rounded-md bg-[var(--ink)]">
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
                            <div className="space-y-2">
                                <Label htmlFor="regaloMonto">Monto de la tarjeta por adulto (opcional)</Label>
                                <Input
                                    id="regaloMonto"
                                    type="number"
                                    min={0}
                                    step={100}
                                    placeholder="Ej: 15000"
                                    value={(data as any).regaloMonto || ""}
                                    onChange={(e) => setData({ regaloMonto: e.target.value ? Number(e.target.value) : undefined } as any)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="precioNino">Monto de la tarjeta por niño (opcional)</Label>
                                <Input
                                    id="precioNino"
                                    type="number"
                                    min={0}
                                    step={100}
                                    placeholder="Ej: 8000"
                                    value={(data as any).precioNino || ""}
                                    onChange={(e) => setData({ precioNino: e.target.value ? Number(e.target.value) : undefined } as any)}
                                />
                                <p className="text-xs text-muted-foreground mt-2">
                                    Si cargás un monto, los invitados podrán indicar cuántos adultos y niños asisten, y el cálculo será automático (salvo para las familias exentas).
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <SaveStepButtons />
        </div>
    );
}
