"use client";

import { useState } from "react";
import { Copy, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollReveal } from "./ScrollReveal";
import { useToast } from "@/components/ui/Toast";

interface BankDetailsProps {
    titulo?: string;
    mensaje?: string;
    mostrarDatos: boolean;
    banco?: string;
    cbu?: string;
    alias?: string;
    titular?: string;
}

export function BankDetails({
    titulo = "Regalo",
    mensaje,
    mostrarDatos,
    banco,
    cbu,
    alias,
    titular
}: BankDetailsProps) {
    const { showToast } = useToast();
    const [isRevealed, setIsRevealed] = useState(false);

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        showToast(`${label} copiado al portapapeles`, "success");
    };

    return (
        <section className="py-16 px-4 bg-slate-50">
            <ScrollReveal>
                <div className="max-w-2xl mx-auto space-y-8 text-center">
                    <div className="space-y-4">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                            🎁
                        </div>
                        <h2 className="text-3xl md:text-4xl" style={{ color: 'var(--color-primary)', fontFamily: "var(--font-ornamental)" }}>
                            {titulo}
                        </h2>
                        {mensaje && (
                            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
                                {mensaje}
                            </p>
                        )}
                        {!mostrarDatos && !mensaje && (
                            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
                                Tu presencia es nuestro mejor regalo.
                            </p>
                        )}
                    </div>

                    {mostrarDatos && (
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
                                <Card className="bg-white shadow-lg border-primary/10 overflow-hidden">
                                    <div className="h-2 bg-gradient-to-r from-primary/40 via-primary to-primary/40"></div>
                                    <CardHeader>
                                        <CardTitle className="text-xl text-primary">Datos Bancarios</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6 text-left">
                                        {banco && (
                                            <div>
                                                <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Banco</p>
                                                <p className="text-lg font-medium">{banco}</p>
                                            </div>
                                        )}

                                        {cbu && (
                                            <div className="group relative">
                                                <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">CBU / CVU</p>
                                                <div className="flex items-center justify-between gap-2 p-2 rounded-md hover:bg-slate-50 transition-colors">
                                                    <p className="text-lg font-mono text-slate-700 break-all">{cbu}</p>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => copyToClipboard(cbu, "CBU")}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {alias && (
                                            <div className="group relative">
                                                <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Alias</p>
                                                <div className="flex items-center justify-between gap-2 p-2 rounded-md hover:bg-slate-50 transition-colors">
                                                    <p className="text-lg font-medium text-slate-700">{alias}</p>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => copyToClipboard(alias, "Alias")}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {titular && (
                                            <div className="pt-2 border-t mt-4">
                                                <p className="text-sm text-muted-foreground">Titular: <span className="font-medium text-slate-700">{titular}</span></p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                </div>
            </ScrollReveal>
        </section>
    );
}
