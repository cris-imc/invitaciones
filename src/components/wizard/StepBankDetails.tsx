"use client";

import { useState } from "react";
import { useWizardStore } from "@/store/wizard-store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Info, ChevronDown, ChevronUp, Gift, CreditCard, ShieldAlert } from "lucide-react";
import { SaveStepButtons } from "./SaveStepButtons";

export function StepBankDetails() {
    const { data, setData } = useWizardStore();
    const [showInfo, setShowInfo] = useState(false);
    const [showRedWarning, setShowRedWarning] = useState(false);

    // Helper for CBU formatting (digits only, max 22 characters)
    const handleCbuChange = (field: "regaloCbu" | "pagoTarjetaCbu", rawValue: string) => {
        const cleanDigits = rawValue.replace(/\D/g, "").slice(0, 22);
        setData({ [field]: cleanDigits });
    };

    const d = data as any;
    const isEditing = Boolean(d.id);

    // Default toggle logic:
    // When CREATING (!isEditing): starts disabled (false) by default.
    // When EDITING (isEditing): active if enabled explicitly or if data is present.
    const isRegaloActive = d.regaloHabilitado ?? (isEditing && Boolean(d.regaloCbu || d.regaloAlias || d.regaloBanco || d.regaloTitular));
    const isPagoTarjetaActive = d.pagoTarjetaHabilitado ?? (isEditing && Boolean(d.pagoTarjetaCbu || d.pagoTarjetaAlias || d.pagoTarjetaBanco || d.pagoTarjetaTitular));

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold">Datos Bancarios (Regalos y Tarjetas)</h2>
                <p className="text-muted-foreground text-sm">
                    Configurá tus datos de transferencia para regalos del evento y/o cobro de entradas.
                </p>
            </div>

            {/* Caja informativa de Usabilidad (Collapsible - Minimizada por defecto) */}
            <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs overflow-hidden transition-all duration-200 shadow-sm">
                <button
                    type="button"
                    onClick={() => setShowInfo(!showInfo)}
                    className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-amber-500/15 transition-colors cursor-pointer"
                >
                    <div className="flex items-center gap-2.5 font-semibold text-amber-300 text-sm">
                        <Info className="w-4.5 h-4.5 shrink-0 text-amber-400" />
                        <span>¿Por qué podés configurar hasta 2 Cuentas Bancarias?</span>
                    </div>
                    <div className="text-amber-400 opacity-80 hover:opacity-100 transition-opacity shrink-0">
                        {showInfo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                </button>

                {showInfo && (
                    <div className="px-4 pb-4 pt-1 border-t border-amber-500/20 text-[13px] leading-relaxed opacity-95 animate-in fade-in duration-200 space-y-2">
                        <p>
                            En muchos eventos (casamientos o fiestas de 15), se requiere separar la <strong>cuenta para el pago de la tarjeta / catering</strong> (que va al salón o tarjetero) de la <strong>cuenta personal para regalos</strong>.
                        </p>
                        <p>
                            Además, en cumpleaños de 15, las billeteras virtuales juveniles (ej: MercadoPago o Ualá) suelen tener límites mensuales de recepción de dinero. Al usar dos cuentas, evitás superar dichos límites o mezclar las finanzas.
                        </p>
                        <p className="text-amber-300 font-medium">
                            💡 Si activás una sola cuenta, la tarjeta mostrará unificadamente que esa cuenta se utilizará tanto para regalos como para pagos. Si activás ambas, la tarjeta las dividirá en columnas (Desktop) o una sobre otra (Mobile).
                        </p>
                    </div>
                )}
            </div>

            {/* Advertencia de Seguridad ROJA sobre CBU / CVU (Collapsible - Minimizada por defecto) */}
            <div className="rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs overflow-hidden transition-all duration-200 shadow-lg">
                <button
                    type="button"
                    onClick={() => setShowRedWarning(!showRedWarning)}
                    className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-rose-500/20 transition-colors cursor-pointer"
                >
                    <div className="flex items-center gap-2 font-bold text-rose-300 text-sm sm:text-base">
                        <ShieldAlert className="w-5 h-5 shrink-0 text-rose-400" />
                        <span>¡ADVERTENCIA DE SEGURIDAD IMPORTANTE SOBRE EL CBU/CVU!</span>
                    </div>
                    <div className="text-rose-400 opacity-80 hover:opacity-100 transition-opacity shrink-0">
                        {showRedWarning ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                </button>

                {showRedWarning && (
                    <div className="px-4 pb-4 pt-1 border-t border-rose-500/25 text-[13px] leading-relaxed opacity-95 animate-in fade-in duration-200 space-y-2">
                        <p>
                            Verificá cuidadosamente cada uno de los <strong>22 números</strong> de tu CBU o CVU antes de guardar. Un error de tipeo podría provocar que las transferencias enviadas por tus invitados vayan a una cuenta incorrecta o se pierdan de forma irreversible.
                        </p>
                        <p className="text-[12px] text-rose-300/90 font-mono italic pt-1 border-t border-rose-500/20">
                            ⚠️ La plataforma no se hace responsable por la pérdida de fondos ocasionada por errores de tipeo en la carga de datos bancarios.
                        </p>
                    </div>
                )}
            </div>

            {/* SECCIÓN 1: CUENTA PARA REGALOS */}
            <div className="space-y-4 bg-[var(--ink-2)] border border-white/10 p-5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Gift className="w-5 h-5" />
                        </div>
                        <div>
                            <Label htmlFor="enableGift" className="text-base font-semibold cursor-pointer">
                                1. Cuenta para Regalos del Evento
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                CBU/Alias para que tus invitados te hagan un regalo voluntario
                            </p>
                        </div>
                    </div>
                    <Switch
                        id="enableGift"
                        checked={isRegaloActive}
                        onCheckedChange={(checked) => setData({ regaloHabilitado: checked })}
                    />
                </div>

                {isRegaloActive && (
                    <div className="space-y-4 pt-4 border-t border-white/10 animate-in fade-in duration-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="giftTitle" className="text-xs font-medium">Título de la Sección</Label>
                                <Input
                                    id="giftTitle"
                                    placeholder="Ej: Regalo / Mesa de Regalos"
                                    value={d.regaloTitulo || "Regalo"}
                                    onChange={(e) => setData({ regaloTitulo: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bankName" className="text-xs font-medium">Banco / Billetera Virtual</Label>
                                <Input
                                    id="bankName"
                                    placeholder="Ej: Mercado Pago / Banco Galicia"
                                    value={d.regaloBanco || ""}
                                    onChange={(e) => setData({ regaloBanco: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="giftMessage" className="text-xs font-medium">Mensaje para Invitados (Opcional)</Label>
                            <Textarea
                                id="giftMessage"
                                placeholder="Tu presencia es nuestro mejor regalo, pero si deseas colaborar..."
                                value={d.regaloMensaje || ""}
                                onChange={(e) => setData({ regaloMensaje: e.target.value })}
                                className="min-h-[70px] resize-none text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                            <div className="space-y-1.5 md:col-span-1">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="cbu" className="text-xs font-medium">CBU / CVU (22 números)</Label>
                                    <span className="text-[10px] font-mono text-muted-foreground">
                                        {(d.regaloCbu || "").length}/22
                                    </span>
                                </div>
                                <Input
                                    id="cbu"
                                    placeholder="Solo 22 números"
                                    value={d.regaloCbu || ""}
                                    maxLength={22}
                                    onChange={(e) => handleCbuChange("regaloCbu", e.target.value)}
                                    className="font-mono text-sm tracking-wider"
                                />
                            </div>

                            <div className="space-y-1.5 md:col-span-1">
                                <Label htmlFor="alias" className="text-xs font-medium">Alias</Label>
                                <Input
                                    id="alias"
                                    placeholder="Ej: novios.fiesta.mp"
                                    value={d.regaloAlias || ""}
                                    onChange={(e) => setData({ regaloAlias: e.target.value })}
                                    className="text-sm"
                                />
                            </div>

                            <div className="space-y-1.5 md:col-span-1">
                                <Label htmlFor="titular" className="text-xs font-medium">Titular de la Cuenta</Label>
                                <Input
                                    id="titular"
                                    placeholder="Ej: María Pérez"
                                    value={d.regaloTitular || ""}
                                    onChange={(e) => setData({ regaloTitular: e.target.value })}
                                    className="text-sm"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* SECCIÓN 2: CUENTA PARA PAGO DE TARJETAS / PASES */}
            <div className="space-y-4 bg-[var(--ink-2)] border border-white/10 p-5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                            <Label htmlFor="enableCardPayment" className="text-base font-semibold cursor-pointer">
                                2. Cuenta para Pago de Tarjetas / Pases
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                CBU/Alias destinado a saldar la tarjeta de invitación o pase del evento
                            </p>
                        </div>
                    </div>
                    <Switch
                        id="enableCardPayment"
                        checked={isPagoTarjetaActive}
                        onCheckedChange={(checked) => setData({ pagoTarjetaHabilitado: checked })}
                    />
                </div>

                {isPagoTarjetaActive && (
                    <div className="space-y-4 pt-4 border-t border-white/10 animate-in fade-in duration-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="cardTitle" className="text-xs font-medium">Título de la Sección</Label>
                                <Input
                                    id="cardTitle"
                                    placeholder="Ej: Pago de Tarjetas / Tarjetero"
                                    value={d.pagoTarjetaTitulo || "Pago de Tarjetas / Pases"}
                                    onChange={(e) => setData({ pagoTarjetaTitulo: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cardBank" className="text-xs font-medium">Banco / Billetera Virtual</Label>
                                <Input
                                    id="cardBank"
                                    placeholder="Ej: Banco BBVA / Mercado Pago"
                                    value={d.pagoTarjetaBanco || ""}
                                    onChange={(e) => setData({ pagoTarjetaBanco: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cardMessage" className="text-xs font-medium">Instrucciones o Mensaje (Opcional)</Label>
                            <Textarea
                                id="cardMessage"
                                placeholder="Por favor enviar el comprobante de pago indicando el nombre de los asistentes..."
                                value={d.pagoTarjetaMensaje || ""}
                                onChange={(e) => setData({ pagoTarjetaMensaje: e.target.value })}
                                className="min-h-[70px] resize-none text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                            <div className="space-y-1.5 md:col-span-1">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="cardCbu" className="text-xs font-medium">CBU / CVU (22 números)</Label>
                                    <span className="text-[10px] font-mono text-muted-foreground">
                                        {(d.pagoTarjetaCbu || "").length}/22
                                    </span>
                                </div>
                                <Input
                                    id="cardCbu"
                                    placeholder="Solo 22 números"
                                    value={d.pagoTarjetaCbu || ""}
                                    maxLength={22}
                                    onChange={(e) => handleCbuChange("pagoTarjetaCbu", e.target.value)}
                                    className="font-mono text-sm tracking-wider"
                                />
                            </div>

                            <div className="space-y-1.5 md:col-span-1">
                                <Label htmlFor="cardAlias" className="text-xs font-medium">Alias</Label>
                                <Input
                                    id="cardAlias"
                                    placeholder="Ej: tarjetas.salon.mp"
                                    value={d.pagoTarjetaAlias || ""}
                                    onChange={(e) => setData({ pagoTarjetaAlias: e.target.value })}
                                    className="text-sm"
                                />
                            </div>

                            <div className="space-y-1.5 md:col-span-1">
                                <Label htmlFor="cardHolder" className="text-xs font-medium">Titular de la Cuenta</Label>
                                <Input
                                    id="cardHolder"
                                    placeholder="Ej: Salón Los Olivos"
                                    value={d.pagoTarjetaTitular || ""}
                                    onChange={(e) => setData({ pagoTarjetaTitular: e.target.value })}
                                    className="text-sm"
                                />
                            </div>
                        </div>

                        {/* Montos por pase / tarjeta */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/10">
                            <div className="space-y-1.5">
                                <Label htmlFor="regaloMonto" className="text-xs font-medium">Monto de tarjeta por Adulto ($ ARS)</Label>
                                <Input
                                    id="regaloMonto"
                                    type="number"
                                    min={0}
                                    step={100}
                                    placeholder="Ej: 15000"
                                    value={d.regaloMonto || ""}
                                    onChange={(e) => setData({ regaloMonto: e.target.value ? Number(e.target.value) : undefined } as any)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="precioNino" className="text-xs font-medium">Monto de tarjeta por Niño ($ ARS)</Label>
                                <Input
                                    id="precioNino"
                                    type="number"
                                    min={0}
                                    step={100}
                                    placeholder="Ej: 8000"
                                    value={d.precioNino || ""}
                                    onChange={(e) => setData({ precioNino: e.target.value ? Number(e.target.value) : undefined } as any)}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <SaveStepButtons />
        </div>
    );
}
