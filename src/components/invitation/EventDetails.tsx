"use client";

import { MapPin, Calendar, Clock, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EventDetailsProps {
    lugarNombre: string;
    direccion: string;
    fecha: Date;
    hora: string;
    mapUrl?: string;
    colorPrimario?: string;
}

export function EventDetails({ lugarNombre, direccion, fecha, hora, mapUrl }: EventDetailsProps) {
    return (
        <section className="py-20 md:py-32 bg-white relative overflow-hidden">
            <div className="container px-4 mx-auto max-w-5xl">
                <div className="grid md:grid-cols-2 gap-8 md:gap-12 text-center">

                    {/* DÓNDE - Colored Card 1 (Subtle Primary) */}
                    <div className="group relative rounded-[2rem] overflow-hidden transition-transform duration-500 hover:-translate-y-2">
                        <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors duration-500" />

                        <div className="relative p-12 flex flex-col items-center justify-center h-full min-h-[300px]">
                            <div className="w-12 h-12 mb-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <MapPin className="w-5 h-5" />
                            </div>

                            <span className="text-sm font-medium tracking-[0.2em] text-muted-foreground uppercase mb-4 font-sans">
                                Ceremonia & Fiesta
                            </span>

                            <h3 className="text-2xl md:text-3xl font-medium mb-4 text-gray-900 font-serif">
                                {lugarNombre}
                            </h3>

                            <p className="text-lg text-gray-600 mb-8 font-light max-w-xs mx-auto leading-relaxed">
                                {direccion}
                            </p>

                            {mapUrl && (
                                <Button
                                    variant="outline"
                                    className="rounded-full border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300"
                                    onClick={() => window.open(mapUrl, '_blank')}
                                >
                                    <Navigation className="w-4 h-4 mr-2" />
                                    Ver ubicación
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* CUÁNDO - Colored Card 2 (Subtle Gray/Secondary) */}
                    <div className="group relative rounded-[2rem] overflow-hidden transition-transform duration-500 hover:-translate-y-2">
                        <div className="absolute inset-0 bg-slate-50 group-hover:bg-slate-100 transition-colors duration-500" />

                        <div className="relative p-12 flex flex-col items-center justify-center h-full min-h-[300px]">
                            <div className="w-12 h-12 mb-6 rounded-full bg-slate-200 flex items-center justify-center text-gray-600">
                                <Calendar className="w-5 h-5" />
                            </div>

                            <span className="text-sm font-medium tracking-[0.2em] text-muted-foreground uppercase mb-4 font-sans">
                                Cuándo
                            </span>

                            <div className="flex flex-col items-center gap-2">
                                <p className="text-3xl md:text-4xl font-light text-gray-900 font-serif capitalize">
                                    {fecha.toLocaleDateString('es-AR', { weekday: 'long' })}
                                </p>
                                <p className="text-5xl md:text-6xl font-medium text-primary font-serif">
                                    {fecha.getDate()}
                                </p>
                                <p className="text-2xl md:text-3xl font-light text-gray-900 font-serif capitalize">
                                    {fecha.toLocaleDateString('es-AR', { month: 'long' })}
                                </p>
                            </div>

                            <div className="mt-8 flex items-center gap-2 text-gray-600 bg-white/50 px-4 py-2 rounded-full">
                                <Clock className="w-4 h-4" />
                                <span className="text-lg font-medium">{hora} hs</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
