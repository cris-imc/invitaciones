"use client";

import { Card, CardContent } from "@/components/ui/card";

interface DressCodeProps {
    icono?: string;
    titulo: string;
    tipo: string;
    observaciones?: string;
}

export function DressCode({
    icono = "👔",
    titulo,
    tipo,
    observaciones,
}: DressCodeProps) {
    return (
        <section className="py-16 md:py-20" style={{ backgroundColor: 'var(--color-background)' }}>
            <div className="max-w-3xl mx-auto text-center px-6">
                <div className="flex flex-col items-center gap-6 mb-8">
                    <div className="text-5xl">{icono}</div>
                    {/* Título y tipo en una línea */}
                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                        <h2 
                            className="text-2xl"
                            style={{ 
                                fontFamily: "'Parisienne', cursive", 
                                color: 'var(--color-primary)'
                            }}
                        >
                            Dress Code:
                        </h2>
                        <p 
                            className="text-base"
                            style={{ 
                                fontFamily: "'Montserrat', sans-serif",
                                fontWeight: '500',
                                color: 'var(--color-text-dark)'
                            }}
                        >
                            {tipo}
                        </p>
                    </div>
                </div>
                
                {observaciones && (
                    <p 
                        className="text-sm leading-relaxed max-w-xl mx-auto"
                        style={{ 
                            fontFamily: "'Montserrat', sans-serif",
                            color: 'var(--color-text-secondary)'
                        }}
                    >
                        {observaciones}
                    </p>
                )}
            </div>
        </section>
    );
}
