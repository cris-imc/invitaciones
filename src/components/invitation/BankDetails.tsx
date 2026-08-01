"use client";

import { useState } from "react";
import { Copy, ChevronDown, ChevronUp, Gift, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollReveal } from "./ScrollReveal";
import { useToast } from "@/components/ui/Toast";

interface BankDetailsProps {
    // Regalos
    regaloHabilitado?: boolean;
    regaloTitulo?: string;
    regaloMensaje?: string;
    regaloBanco?: string;
    regaloCbu?: string;
    regaloAlias?: string;
    regaloTitular?: string;

    // Pago Tarjetas
    pagoTarjetaHabilitado?: boolean;
    pagoTarjetaTitulo?: string;
    pagoTarjetaMensaje?: string;
    pagoTarjetaBanco?: string;
    pagoTarjetaCbu?: string;
    pagoTarjetaAlias?: string;
    pagoTarjetaTitular?: string;

    // Legacy / Fallback
    titulo?: string;
    mensaje?: string;
    mostrarDatos?: boolean;
    banco?: string;
    cbu?: string;
    alias?: string;
    titular?: string;
}

export function BankDetails(props: BankDetailsProps) {
    const { showToast } = useToast();
    const [isRevealed, setIsRevealed] = useState(false);

    const hasRegalo = Boolean(props.regaloHabilitado ?? props.mostrarDatos);
    const hasPagoTarjeta = Boolean(props.pagoTarjetaHabilitado);
    const isBoth = hasRegalo && hasPagoTarjeta;

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        showToast(`${label} copiado al portapapeles`, "success");
    };

    if (!hasRegalo && !hasPagoTarjeta && !props.mostrarDatos) {
        return null;
    }

    return (
        <section className="py-16 px-4 bg-slate-50" id="banco">
            <ScrollReveal>
                <div className="max-w-4xl mx-auto space-y-8 text-center">
                    <div className="space-y-4">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                            {isBoth ? "💳" : "🎁"}
                        </div>

                        {/* TÍTULO DINÁMICO */}
                        <h2 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--color-primary)', fontFamily: "var(--font-ornamental)" }}>
                            {isBoth 
                                ? "Datos Bancarios del Evento" 
                                : "Cuenta Única para Pagos y Regalos"
                            }
                        </h2>

                        <p className="text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                            {isBoth
                                ? "Disponemos de dos cuentas bancarias independientes: una para la acreditación de tarjetas / pases de la fiesta y otra para los regalos del evento."
                                : (props.regaloMensaje || props.pagoTarjetaMensaje || props.mensaje || "Esta cuenta se utilizará tanto para la acreditación / pago de tarjetas como para quienes deseen realizar un regalo.")
                            }
                        </p>
                    </div>

                    <div className="space-y-4">
                        <Button
                            onClick={() => setIsRevealed(!isRevealed)}
                            variant="outline"
                            size="lg"
                            className="mx-auto flex items-center gap-2 border-primary/30 text-primary hover:bg-primary/5"
                        >
                            {isRevealed ? (
                                <>
                                    <ChevronUp className="h-5 w-5" />
                                    Ocultar datos bancarios
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="h-5 w-5" />
                                    Ver datos bancarios
                                </>
                            )}
                        </Button>

                        {isRevealed && (
                            <div className={`grid grid-cols-1 ${isBoth ? 'md:grid-cols-2' : 'max-w-xl mx-auto'} gap-6 text-left pt-2`}>
                                {/* TARJETA 1: PAGO DE TARJETAS / PASES */}
                                {hasPagoTarjeta && (
                                    <Card className="bg-white shadow-lg border-primary/10 overflow-hidden">
                                        <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-lg text-primary flex items-center gap-2">
                                                <CreditCard className="w-5 h-5 text-blue-600" />
                                                <span>{props.pagoTarjetaTitulo || "Pago de Tarjetas / Pases"}</span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4 text-left">
                                            {props.pagoTarjetaMensaje && (
                                                <p className="text-xs text-muted-foreground bg-slate-100 p-2.5 rounded-lg border border-slate-200">
                                                    {props.pagoTarjetaMensaje}
                                                </p>
                                            )}
                                            {props.pagoTarjetaBanco && (
                                                <div>
                                                    <p className="text-xs text-muted-foreground uppercase font-semibold">Banco</p>
                                                    <p className="text-base font-medium">{props.pagoTarjetaBanco}</p>
                                                </div>
                                            )}
                                            {props.pagoTarjetaCbu && (
                                                <div className="group relative">
                                                    <p className="text-xs text-muted-foreground uppercase font-semibold">CBU / CVU</p>
                                                    <div className="flex items-center justify-between gap-2 p-2 rounded-md bg-slate-50 border border-slate-200">
                                                        <p className="text-sm font-mono text-slate-800 break-all">{props.pagoTarjetaCbu}</p>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => copyToClipboard(props.pagoTarjetaCbu!, "CBU Pago Tarjetas")}
                                                            className="h-8 w-8 text-slate-600"
                                                        >
                                                            <Copy className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                            {props.pagoTarjetaAlias && (
                                                <div className="group relative">
                                                    <p className="text-xs text-muted-foreground uppercase font-semibold">Alias</p>
                                                    <div className="flex items-center justify-between gap-2 p-2 rounded-md bg-slate-50 border border-slate-200">
                                                        <p className="text-sm font-medium text-slate-800">{props.pagoTarjetaAlias}</p>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => copyToClipboard(props.pagoTarjetaAlias!, "Alias Pago Tarjetas")}
                                                            className="h-8 w-8 text-slate-600"
                                                        >
                                                            <Copy className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                            {props.pagoTarjetaTitular && (
                                                <div className="pt-2 border-t">
                                                    <p className="text-xs text-muted-foreground">Titular: <span className="font-medium text-slate-800">{props.pagoTarjetaTitular}</span></p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* TARJETA 2: REGALOS DEL EVENTO */}
                                {hasRegalo && (
                                    <Card className="bg-white shadow-lg border-primary/10 overflow-hidden">
                                        <div className="h-2 bg-gradient-to-r from-amber-400 to-amber-600"></div>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-lg text-primary flex items-center gap-2">
                                                <Gift className="w-5 h-5 text-amber-600" />
                                                <span>{props.regaloTitulo || props.titulo || "Regalos del Evento"}</span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4 text-left">
                                            {(props.regaloMensaje || props.mensaje) && (
                                                <p className="text-xs text-muted-foreground bg-slate-100 p-2.5 rounded-lg border border-slate-200">
                                                    {props.regaloMensaje || props.mensaje}
                                                </p>
                                            )}
                                            {(props.regaloBanco || props.banco) && (
                                                <div>
                                                    <p className="text-xs text-muted-foreground uppercase font-semibold">Banco</p>
                                                    <p className="text-base font-medium">{props.regaloBanco || props.banco}</p>
                                                </div>
                                            )}
                                            {(props.regaloCbu || props.cbu) && (
                                                <div className="group relative">
                                                    <p className="text-xs text-muted-foreground uppercase font-semibold">CBU / CVU</p>
                                                    <div className="flex items-center justify-between gap-2 p-2 rounded-md bg-slate-50 border border-slate-200">
                                                        <p className="text-sm font-mono text-slate-800 break-all">{props.regaloCbu || props.cbu}</p>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => copyToClipboard((props.regaloCbu || props.cbu)!, "CBU Regalos")}
                                                            className="h-8 w-8 text-slate-600"
                                                        >
                                                            <Copy className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                            {(props.regaloAlias || props.alias) && (
                                                <div className="group relative">
                                                    <p className="text-xs text-muted-foreground uppercase font-semibold">Alias</p>
                                                    <div className="flex items-center justify-between gap-2 p-2 rounded-md bg-slate-50 border border-slate-200">
                                                        <p className="text-sm font-medium text-slate-800">{props.regaloAlias || props.alias}</p>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => copyToClipboard((props.regaloAlias || props.alias)!, "Alias Regalos")}
                                                            className="h-8 w-8 text-slate-600"
                                                        >
                                                            <Copy className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                            {(props.regaloTitular || props.titular) && (
                                                <div className="pt-2 border-t">
                                                    <p className="text-xs text-muted-foreground">Titular: <span className="font-medium text-slate-800">{props.regaloTitular || props.titular}</span></p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </ScrollReveal>
        </section>
    );
}
