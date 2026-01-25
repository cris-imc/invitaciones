"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Check } from "lucide-react";

interface GiftInfoProps {
    icono?: string;
    titulo: string;
    mensaje: string;
    mostrarDatos: boolean;
    alias?: string;
    cvu?: string;
    cbu?: string;
    colorPrimario?: string;
}

export function GiftInfo({
    icono = "🎁",
    titulo,
    mensaje,
    mostrarDatos,
    alias,
    cvu,
    cbu,
    colorPrimario = "#000000",
}: GiftInfoProps) {
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [showData, setShowData] = useState(false);

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    // Don't render if mostrarDatos is false
    if (!mostrarDatos) return null;

    return (
        <section className="py-16 md:py-20 px-6" style={{ backgroundColor: '#f8fafc' }}>
            <div className="max-w-2xl mx-auto text-center">
                <div className="mb-8">
                    <span 
                        className="text-xs uppercase tracking-[0.25em] block mb-3"
                        style={{ color: 'var(--color-text-secondary)', fontFamily: "'Montserrat', sans-serif" }}
                    >
                        Regalo
                    </span>
                    <h2 
                        className="text-2xl md:text-3xl mb-4"
                        style={{ color: 'var(--color-primary)', fontFamily: "'Parisienne', cursive" }}
                    >
                        {titulo}
                    </h2>
                </div>
                
                <p 
                    className="text-sm leading-relaxed mb-8"
                    style={{ color: 'var(--color-text-secondary)', fontFamily: "'Montserrat', sans-serif" }}
                >
                    {mensaje}
                </p>

                {mostrarDatos && (
                    <div className="space-y-4">
                        {!showData ? (
                            <Button
                                onClick={() => setShowData(true)}
                                className="mt-4"
                                style={{ backgroundColor: colorPrimario }}
                            >
                                Ver Datos Bancarios
                            </Button>
                        ) : (
                            <div className="space-y-4 animate-in fade-in duration-500">
                                {alias && (
                                    <Card>
                                        <CardContent className="pt-6 pb-6">
                                            <p className="text-sm text-muted-foreground mb-2">ALIAS</p>
                                            <div className="flex items-center justify-center gap-2">
                                                <p className="text-xl font-mono font-bold">{alias}</p>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => copyToClipboard(alias, 'alias')}
                                                >
                                                    {copiedField === 'alias' ? (
                                                        <Check className="w-4 h-4 text-green-600" />
                                                    ) : (
                                                        <Copy className="w-4 h-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                                
                                {cvu && (
                                    <Card>
                                        <CardContent className="pt-6 pb-6">
                                            <p className="text-sm text-muted-foreground mb-2">CVU</p>
                                            <div className="flex items-center justify-center gap-2">
                                                <p className="text-lg font-mono">{cvu}</p>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => copyToClipboard(cvu, 'cvu')}
                                                >
                                                    {copiedField === 'cvu' ? (
                                                        <Check className="w-4 h-4 text-green-600" />
                                                    ) : (
                                                        <Copy className="w-4 h-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                                
                                {cbu && (
                                    <Card>
                                        <CardContent className="pt-6 pb-6">
                                            <p className="text-sm text-muted-foreground mb-2">CBU</p>
                                            <div className="flex items-center justify-center gap-2">
                                                <p className="text-lg font-mono">{cbu}</p>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => copyToClipboard(cbu, 'cbu')}
                                                >
                                                    {copiedField === 'cbu' ? (
                                                        <Check className="w-4 h-4 text-green-600" />
                                                    ) : (
                                                        <Copy className="w-4 h-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}
