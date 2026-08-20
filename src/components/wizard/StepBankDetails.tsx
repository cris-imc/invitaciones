"use client";

import { useState } from "react";
import { useWizardStore } from "@/store/wizard-store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/Toast";
import { Info, ChevronDown, ChevronUp, Gift, CreditCard, ShieldAlert, Lock } from "lucide-react";
import { SaveStepButtons } from "./SaveStepButtons";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { saveInvitationFromWizard } from "@/lib/save-invitation";
import { isAdmin as isAdminRole } from "@/lib/roles";

const PREDEFINED_TITULOS_REGALO = ["Regalo", "Mesa de Regalos", "Colaboración"];
const PREDEFINED_TITULOS_TARJETA = ["Pago de Tarjetas", "Pago de Invitaciones", "Entrada al Evento"];

export function StepBankDetails() {
    const { data, setData, nextStep } = useWizardStore();
    const usePremiumCredit = useWizardStore((state) => state.usePremiumCredit);
    const useDiamondCredit = useWizardStore((state) => state.useDiamondCredit);
    const { showToast } = useToast();
    const { data: session } = useSession();
    const isAdmin = isAdminRole(session?.user?.role) || session?.user?.planTier === "ADMIN";
    const [showInfo, setShowInfo] = useState(false);
    const [showRedWarning, setShowRedWarning] = useState(false);
    const [attemptedNext, setAttemptedNext] = useState(false);
    const themeConfig = useWizardStore((state) => state.themeConfig);

    // Helper for CBU formatting (digits only, max 22 characters)
    const handleCbuChange = (field: "regaloCbu" | "pagoTarjetaCbu", rawValue: string) => {
        const cleanDigits = rawValue.replace(/\D/g, "").slice(0, 22);
        setData({ [field]: cleanDigits });
    };

    const d = data as any;
    const isEditing = Boolean(d.id);

    // Si la invitación ya tiene un ID (edición) usamos su planTier, sino usamos usePremiumCredit/useDiamondCredit (creación)
    const rawLocked = isEditing ? data.planTier === "FREE" : !usePremiumCredit && !useDiamondCredit;
    const isLocked = !isAdmin && rawLocked;

    const [isCustomRegaloTitulo, setIsCustomRegaloTitulo] = useState(() => {
        const current = d.regaloTitulo || "Regalo";
        return !PREDEFINED_TITULOS_REGALO.includes(current);
    });
    const [isCustomTarjetaTitulo, setIsCustomTarjetaTitulo] = useState(() => {
        const current = d.pagoTarjetaTitulo || "Pago de Tarjetas";
        return !PREDEFINED_TITULOS_TARJETA.includes(current);
    });

    // Default toggle logic:
    // When CREATING (!isEditing): starts disabled (false) by default.
    // When EDITING (isEditing): active if enabled explicitly or if data is present.
    const isRegaloActive = d.regaloHabilitado ?? (isEditing && Boolean(d.regaloCbu || d.regaloAlias || d.regaloBanco || d.regaloTitular));
    const isPagoTarjetaActive = d.pagoTarjetaHabilitado ?? (isEditing && Boolean(d.pagoTarjetaCbu || d.pagoTarjetaAlias || d.pagoTarjetaBanco || d.pagoTarjetaTitular));

    const missingRegaloTitular = isRegaloActive && !String(d.regaloTitular || "").trim();
    const missingRegaloCbuAlias = isRegaloActive && !String(d.regaloCbu || "").trim() && !String(d.regaloAlias || "").trim();
    const missingTarjetaTitular = isPagoTarjetaActive && !String(d.pagoTarjetaTitular || "").trim();
    const missingTarjetaCbuAlias = isPagoTarjetaActive && !String(d.pagoTarjetaCbu || "").trim() && !String(d.pagoTarjetaAlias || "").trim();
    const missingRegaloMonto = isPagoTarjetaActive && !d.regaloMonto;

    const hasMissingRequired = missingRegaloTitular || missingRegaloCbuAlias || missingTarjetaTitular || missingTarjetaCbuAlias || missingRegaloMonto;

    const handleNext = () => {
        if (hasMissingRequired) {
            setAttemptedNext(true);
            showToast("Completá los datos bancarios obligatorios (titular y CBU/CVU o alias) antes de continuar.", "error");
            return;
        }
        setAttemptedNext(false);
        nextStep();
    };

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
                            💡 Si activás una sola cuenta, la tarjeta mostrará unificadamente que esa cuenta se utilizará tanto para regalos como para pagos.
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

            {rawLocked && isAdmin && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
                    👑 <strong>Modo Administrador:</strong> Esta invitación está en Plan Gratis (bloqueada para el cliente), pero tenés permiso de Admin para editar/activar las cuentas bancarias.
                </div>
            )}

            {/* SECCIÓN 1: CUENTA PARA REGALOS */}
            <div className="space-y-4 bg-[var(--ink-2)] border border-white/10 p-5 rounded-2xl shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                            <Gift className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <Label htmlFor="enableGift" className={`flex items-center gap-2 text-base font-semibold ${isLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                                1. Cuenta para Regalos del Evento
                                {isLocked && <Lock className="w-4 h-4 text-red-400" />}
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                CBU/Alias para que tus invitados te hagan un regalo voluntario
                            </p>
                        </div>
                    </div>
                    <div className="relative group self-end sm:self-auto">
                        <Switch
                            id="enableGift"
                            checked={isRegaloActive && (!isLocked || isAdmin)}
                            disabled={isLocked}
                            onCheckedChange={(checked) => setData({ regaloHabilitado: checked })}
                        />
                        {isLocked && (
                            <div className="absolute -top-10 right-0 px-3 py-1.5 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                Disponible en Premium
                                <div className="absolute -bottom-1 right-3 border-4 border-transparent border-t-black"></div>
                            </div>
                        )}
                    </div>
                </div>

                {isRegaloActive && !isLocked && (
                    <div className="space-y-4 pt-4 border-t border-white/10 animate-in fade-in duration-200">
                        <div className="space-y-2">
                            <Label className="text-xs font-medium">Título de la Sección</Label>
                            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1" style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-x" }}>
                                {PREDEFINED_TITULOS_REGALO.map((opt) => (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => {
                                            setData({ regaloTitulo: opt });
                                            setIsCustomRegaloTitulo(false);
                                        }}
                                        className={cn(
                                            "px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap shrink-0",
                                            (d.regaloTitulo || "Regalo") === opt && !isCustomRegaloTitulo
                                                ? "bg-amber-500 text-white border-amber-600"
                                                : "bg-[var(--ink)] text-white/70 hover:text-white border border-white/10 hover:border-white/20"
                                        )}
                                    >
                                        {opt}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsCustomRegaloTitulo(true);
                                        if (PREDEFINED_TITULOS_REGALO.includes(d.regaloTitulo || "Regalo")) {
                                            setData({ regaloTitulo: "" });
                                        }
                                    }}
                                    className={cn(
                                        "px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap shrink-0",
                                        isCustomRegaloTitulo
                                            ? "bg-amber-500 text-white border-amber-600"
                                            : "bg-[var(--ink)] text-white/70 hover:text-white border border-white/10 hover:border-white/20"
                                    )}
                                >
                                    Personalizado
                                </button>
                            </div>
                            {isCustomRegaloTitulo && (
                                <Input
                                    placeholder="Escribí un título personalizado"
                                    value={d.regaloTitulo || ""}
                                    onChange={(e) => setData({ regaloTitulo: e.target.value })}
                                    className="mt-2"
                                />
                            )}
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

                        <div className="space-y-4 pt-1">
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center h-5">
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
                                    className={`font-mono text-sm tracking-wider ${attemptedNext && missingRegaloCbuAlias ? 'border-red-500/60' : ''}`}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="alias" className="text-xs font-medium h-5 flex items-center">Alias</Label>
                                    <Input
                                        id="alias"
                                        placeholder="Ej: novios.fiesta.mp"
                                        value={d.regaloAlias || ""}
                                        onChange={(e) => setData({ regaloAlias: e.target.value })}
                                        className={`text-sm ${attemptedNext && missingRegaloCbuAlias ? 'border-red-500/60' : ''}`}
                                    />
                                    {attemptedNext && missingRegaloCbuAlias && (
                                        <p className="text-[11px] text-red-400">Cargá el CBU/CVU o el Alias.</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="titular" className="text-xs font-medium h-5 flex items-center">Titular de la Cuenta</Label>
                                    <Input
                                        id="titular"
                                        placeholder="Ej: María Pérez"
                                        value={d.regaloTitular || ""}
                                        onChange={(e) => setData({ regaloTitular: e.target.value })}
                                        className={`text-sm ${attemptedNext && missingRegaloTitular ? 'border-red-500/60' : ''}`}
                                    />
                                    {attemptedNext && missingRegaloTitular && (
                                        <p className="text-[11px] text-red-400">El titular es obligatorio.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* SECCIÓN 2: CUENTA PARA PAGO DE TARJETAS / PASES */}
            <div className="space-y-4 bg-[var(--ink-2)] border border-white/10 p-5 rounded-2xl shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <Label htmlFor="enableCardPayment" className={`flex items-center gap-2 text-base font-semibold ${isLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                                2. Cuenta para Pago de Tarjetas / Pases
                                {isLocked && <Lock className="w-4 h-4 text-red-400" />}
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                CBU/Alias destinado a saldar la tarjeta de invitación o pase del evento
                            </p>
                        </div>
                    </div>
                    <div className="relative group self-end sm:self-auto">
                        <Switch
                            id="enableCardPayment"
                            checked={isPagoTarjetaActive && (!isLocked || isAdmin)}
                            disabled={isLocked}
                            onCheckedChange={(checked) => setData({ pagoTarjetaHabilitado: checked })}
                        />
                        {isLocked && (
                            <div className="absolute -top-10 right-0 px-3 py-1.5 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                Disponible en Premium
                                <div className="absolute -bottom-1 right-3 border-4 border-transparent border-t-black"></div>
                            </div>
                        )}
                    </div>
                </div>

                {isPagoTarjetaActive && !isLocked && (
                    <div className="space-y-4 pt-4 border-t border-white/10 animate-in fade-in duration-200">
                        <div className="space-y-2">
                            <Label className="text-xs font-medium">Título de la Sección</Label>
                            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1" style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-x" }}>
                                {PREDEFINED_TITULOS_TARJETA.map((opt) => (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => {
                                            setData({ pagoTarjetaTitulo: opt });
                                            setIsCustomTarjetaTitulo(false);
                                        }}
                                        className={cn(
                                            "px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap shrink-0",
                                            (d.pagoTarjetaTitulo || "Pago de Tarjetas") === opt && !isCustomTarjetaTitulo
                                                ? "bg-amber-500 text-white border-amber-600"
                                                : "bg-[var(--ink)] text-white/70 hover:text-white border border-white/10 hover:border-white/20"
                                        )}
                                    >
                                        {opt}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsCustomTarjetaTitulo(true);
                                        if (PREDEFINED_TITULOS_TARJETA.includes(d.pagoTarjetaTitulo || "Pago de Tarjetas")) {
                                            setData({ pagoTarjetaTitulo: "" });
                                        }
                                    }}
                                    className={cn(
                                        "px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap shrink-0",
                                        isCustomTarjetaTitulo
                                            ? "bg-amber-500 text-white border-amber-600"
                                            : "bg-[var(--ink)] text-white/70 hover:text-white border border-white/10 hover:border-white/20"
                                    )}
                                >
                                    Personalizado
                                </button>
                            </div>
                            {isCustomTarjetaTitulo && (
                                <Input
                                    placeholder="Escribí un título personalizado"
                                    value={d.pagoTarjetaTitulo || ""}
                                    onChange={(e) => setData({ pagoTarjetaTitulo: e.target.value })}
                                    className="mt-2"
                                />
                            )}
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

                        <div className="space-y-4 pt-1">
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center h-5">
                                    <Label htmlFor="cbu-tarjeta" className="text-xs font-medium">CBU / CVU (22 números)</Label>
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
                                    className={`font-mono text-sm tracking-wider ${attemptedNext && missingTarjetaCbuAlias ? 'border-red-500/60' : ''}`}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="alias-tarjeta" className="text-xs font-medium h-5 flex items-center">Alias</Label>
                                    <Input
                                        id="cardAlias"
                                        placeholder="Ej: tarjetas.salon.mp"
                                        value={d.pagoTarjetaAlias || ""}
                                        onChange={(e) => setData({ pagoTarjetaAlias: e.target.value })}
                                        className={`text-sm ${attemptedNext && missingTarjetaCbuAlias ? 'border-red-500/60' : ''}`}
                                    />
                                    {attemptedNext && missingTarjetaCbuAlias && (
                                        <p className="text-[11px] text-red-400">Cargá el CBU/CVU o el Alias.</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="titular-tarjeta" className="text-xs font-medium h-5 flex items-center">Titular de la Cuenta</Label>
                                    <Input
                                        id="cardHolder"
                                        placeholder="Ej: Salón Los Olivos"
                                        value={d.pagoTarjetaTitular || ""}
                                        onChange={(e) => setData({ pagoTarjetaTitular: e.target.value })}
                                        className={`text-sm ${attemptedNext && missingTarjetaTitular ? 'border-red-500/60' : ''}`}
                                    />
                                    {attemptedNext && missingTarjetaTitular && (
                                        <p className="text-[11px] text-red-400">El titular es obligatorio.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Configuración de Categorías de Precios (Adultos, Adolescentes, Niños) */}
                        <div className="space-y-4 pt-3 border-t border-white/10">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                                Tarifas por Categoría de Invitado ($ ARS)
                            </h4>

                            {/* Categoria 1: ADULTOS (Obligatoria si se cobra tarjeta) */}
                            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                                <Label htmlFor="regaloMonto" className="text-xs font-semibold text-slate-200">
                                    1. Valor de la Tarjeta por ADULTO ($ ARS)
                                </Label>
                                <Input
                                    id="regaloMonto"
                                    type="number"
                                    min={0}
                                    step={100}
                                    placeholder="Ej: 15000"
                                    value={d.regaloMonto || ""}
                                    onChange={(e) => setData({ regaloMonto: e.target.value ? Number(e.target.value) : undefined } as any)}
                                    className={`bg-[var(--ink)] border-white/15 ${attemptedNext && missingRegaloMonto ? 'border-red-500/60' : ''}`}
                                />
                                {attemptedNext && missingRegaloMonto && (
                                    <p className="text-[11px] text-red-400">El valor por adulto es obligatorio si vas a cobrar la tarjeta.</p>
                                )}
                            </div>

                            {/* Categoria 2: ADOLESCENTES (Opcional con Switch) */}
                            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="precioAdolescenteHabilitado" className="text-xs font-semibold text-slate-200 cursor-pointer">
                                            2. Tarifa diferenciada para ADOLESCENTES
                                        </Label>
                                        <p className="text-[11px] text-muted-foreground">
                                            Permite ingresar un valor específico para jóvenes / adolescentes
                                        </p>
                                    </div>
                                    <Switch
                                        id="precioAdolescenteHabilitado"
                                        checked={d.precioAdolescenteHabilitado ?? false}
                                        onCheckedChange={(checked) => setData({ precioAdolescenteHabilitado: checked })}
                                    />
                                </div>
                                {d.precioAdolescenteHabilitado && (
                                    <Input
                                        id="precioAdolescente"
                                        type="number"
                                        min={0}
                                        step={100}
                                        placeholder="Ej: 11000"
                                        value={d.precioAdolescente || ""}
                                        onChange={(e) => setData({ precioAdolescente: e.target.value ? Number(e.target.value) : undefined } as any)}
                                        className="bg-[var(--ink)] border-white/15 animate-in fade-in duration-200"
                                    />
                                )}
                            </div>

                            {/* Categoria 3: NIÑOS (Opcional con Switch) */}
                            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="precioNinoHabilitado" className="text-xs font-semibold text-slate-200 cursor-pointer">
                                            3. Tarifa diferenciada para NIÑOS
                                        </Label>
                                        <p className="text-[11px] text-muted-foreground">
                                            Permite ingresar un valor específico para niños de menor edad
                                        </p>
                                    </div>
                                    <Switch
                                        id="precioNinoHabilitado"
                                        checked={d.precioNinoHabilitado ?? false}
                                        onCheckedChange={(checked) => setData({ precioNinoHabilitado: checked })}
                                    />
                                </div>
                                {d.precioNinoHabilitado && (
                                    <Input
                                        id="precioNino"
                                        type="number"
                                        min={0}
                                        step={100}
                                        placeholder="Ej: 8000"
                                        value={d.precioNino || ""}
                                        onChange={(e) => setData({ precioNino: e.target.value ? Number(e.target.value) : undefined } as any)}
                                        className="bg-[var(--ink)] border-white/15 animate-in fade-in duration-200"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <SaveStepButtons onNext={handleNext} />
        </div>
    );
}
