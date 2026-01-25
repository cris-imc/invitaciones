"use client";

import { MapPin, Navigation, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EventDetailsProps {
    lugarNombre: string;
    direccion: string;
    fecha: Date;
    hora: string;
    mapUrl?: string;
    colorPrimario?: string;
}

export function EventDetails({ lugarNombre, direccion, fecha, hora, mapUrl, colorPrimario = "#000" }: EventDetailsProps) {
    return (
        <div className="py-16 md:py-24" style={{ backgroundColor: 'var(--color-background)' }}>
            <div className="container px-6 mx-auto max-w-4xl">
                <div className="text-center mb-12">
                    <span 
                        className="text-xs uppercase tracking-[0.25em] block mb-3"
                        style={{ color: 'var(--color-text-secondary)', fontFamily: "'Montserrat', sans-serif" }}
                    >
                        Celebración
                    </span>
                    <h2 
                        className="text-3xl md:text-4xl"
                        style={{ color: 'var(--color-primary)', fontFamily: "'Parisienne', cursive" }}
                    >
                        Dónde & Cuándo
                    </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6 md:gap-10">
                    {/* Location Card */}
                    <div className="text-center p-8 rounded-2xl bg-white shadow-sm border border-gray-100">
                        <div 
                            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                            style={{ backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)', color: 'var(--color-primary)' }}
                        >
                            <MapPin className="w-6 h-6" />
                        </div>
                        <h3 
                            className="text-lg mb-2 font-semibold"
                            style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--color-text-dark)' }}
                        >
                            {lugarNombre}
                        </h3>
                        <p 
                            className="mb-6 text-sm leading-relaxed"
                            style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--color-text-secondary)' }}
                        >
                            {direccion}
                        </p>
                        
                        {mapUrl && (
                            <a href={mapUrl} target="_blank" rel="noopener noreferrer">
                                <Button 
                                    variant="outline" 
                                    className="gap-2 rounded-full px-6 py-5 text-sm hover:opacity-80 transition-opacity"
                                    style={{ 
                                        borderColor: 'var(--color-primary)', 
                                        color: 'var(--color-primary)',
                                        fontFamily: "'Montserrat', sans-serif",
                                        fontWeight: '500'
                                    }}
                                >
                                    <Navigation className="w-4 h-4" />
                                    <span>Ver en Mapa</span>
                                </Button>
                            </a>
                        )}
                    </div>

                    {/* DateTime Card */}
                    <div className="text-center p-8 rounded-2xl bg-white shadow-sm border border-gray-100 flex flex-col justify-center">
                        
                        <div className="mb-6">
                            <div className="flex flex-col items-center gap-2 mb-3">
                                <div style={{ color: 'var(--color-primary)' }}>
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <span 
                                    className="text-xs uppercase tracking-[0.2em]"
                                    style={{ color: 'var(--color-text-secondary)', fontFamily: "'Montserrat', sans-serif" }}
                                >
                                    Fecha
                                </span>
                            </div>
                            <p 
                                className="text-base capitalize font-medium"
                                style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--color-text-dark)' }}
                            >
                                {fecha.toLocaleDateString('es-AR', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long'
                                })}
                            </p>
                        </div>

                        <div className="w-12 h-px bg-gray-200 mx-auto my-4"></div>

                        <div>
                            <div className="flex flex-col items-center gap-2 mb-3">
                                <div style={{ color: 'var(--color-primary)' }}>
                                    <Clock className="w-6 h-6" />
                                </div>
                                <span 
                                    className="text-xs uppercase tracking-[0.2em]"
                                    style={{ color: 'var(--color-text-secondary)', fontFamily: "'Montserrat', sans-serif" }}
                                >
                                    Horario
                                </span>
                            </div>
                            <p 
                                className="text-xl font-medium"
                                style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--color-text-dark)' }}
                            >
                                {hora} hs
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
