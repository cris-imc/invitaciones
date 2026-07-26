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
    // Ceremonia / Civil opcional
    ceremoniaHabilitada?: boolean;
    ceremoniaTitulo?: string;
    ceremoniaNombre?: string;
    ceremoniaDireccion?: string;
    ceremoniaHora?: string;
    ceremoniaMapUrl?: string;
}

export function EventDetails({
    lugarNombre,
    direccion,
    fecha,
    hora,
    mapUrl,
    ceremoniaHabilitada,
    ceremoniaTitulo,
    ceremoniaNombre,
    ceremoniaDireccion,
    ceremoniaHora,
    ceremoniaMapUrl
}: EventDetailsProps) {
    const showCeremonia = Boolean(ceremoniaHabilitada && (ceremoniaNombre || ceremoniaDireccion));

    return (
        <section className="py-20 md:py-32 bg-white relative overflow-hidden">
            <div className="container px-4 mx-auto max-w-5xl">
                <div className={`grid md:grid-cols-${showCeremonia ? '3' : '2'} gap-8 md:gap-12 text-center`}>

                    {/* TARJETA 1: CEREMONIA / CIVIL (Si está activado) */}
                    {showCeremonia && (
                        <div className="group relative rounded-[2rem] overflow-hidden transition-transform duration-500 hover:-translate-y-2">
                            <div className="absolute inset-0 bg-amber-500/10 group-hover:bg-amber-500/15 transition-colors duration-500" />

                            <div className="relative p-8 md:p-10 flex flex-col items-center justify-center h-full min-h-[300px]">
                                <div className="w-12 h-12 mb-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-700">
                                    <MapPin className="w-5 h-5" />
                                </div>

                                <span className="text-xs font-semibold tracking-[0.2em] text-amber-800 uppercase mb-3 font-sans">
                                    {ceremoniaTitulo || "Ceremonia / Civil"}
                                </span>

                                <h3 className="text-xl md:text-2xl font-medium mb-3 text-gray-900 font-serif">
                                    {ceremoniaNombre || "Iglesia / Registro Civil"}
                                </h3>

                                {ceremoniaHora && (
                                    <p className="text-sm font-semibold text-amber-700 mb-2 font-mono">
                                        🕒 {ceremoniaHora} hs
                                    </p>
                                )}

                                <p className="text-sm text-gray-600 mb-6 font-light max-w-xs mx-auto leading-relaxed">
                                    {ceremoniaDireccion}
                                </p>

                                {ceremoniaMapUrl && (
                                    <Button
                                        variant="outline"
                                        className="rounded-full border-amber-600 text-amber-700 hover:bg-amber-600 hover:text-white transition-all duration-300 text-xs"
                                        onClick={() => window.open(ceremoniaMapUrl, '_blank')}
                                    >
                                        <Navigation className="w-3.5 h-3.5 mr-2" />
                                        Cómo llegar
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TARJETA 2: DÓNDE - SALÓN / FIESTA */}
                    <div className="group relative rounded-[2rem] overflow-hidden transition-transform duration-500 hover:-translate-y-2">
                        <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors duration-500" />

                        <div className="relative p-8 md:p-10 flex flex-col items-center justify-center h-full min-h-[300px]">
                            <div className="w-12 h-12 mb-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <MapPin className="w-5 h-5" />
                            </div>

                            <span className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase mb-3 font-sans">
                                {showCeremonia ? "Fiesta / Salón" : "Ceremonia & Fiesta"}
                            </span>

                            <h3 className="text-xl md:text-2xl font-medium mb-3 text-gray-900 font-serif">
                                {lugarNombre}
                            </h3>

                            {showCeremonia && hora && (
                                <p className="text-sm font-semibold text-primary mb-2 font-mono">
                                    🕒 {hora} hs
                                </p>
                            )}

                            <p className="text-sm text-gray-600 mb-6 font-light max-w-xs mx-auto leading-relaxed">
                                {direccion}
                            </p>

                            {mapUrl && (
                                <Button
                                    variant="outline"
                                    className="rounded-full border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 text-xs"
                                    onClick={() => window.open(mapUrl, '_blank')}
                                >
                                    <Navigation className="w-3.5 h-3.5 mr-2" />
                                    Cómo llegar
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* TARJETA 3: CUÁNDO */}
                    <div className="group relative rounded-[2rem] overflow-hidden transition-transform duration-500 hover:-translate-y-2">
                        <div className="absolute inset-0 bg-slate-50 group-hover:bg-slate-100 transition-colors duration-500" />

                        <div className="relative p-8 md:p-10 flex flex-col items-center justify-center h-full min-h-[300px]">
                            <div className="w-12 h-12 mb-6 rounded-full bg-slate-200 flex items-center justify-center text-gray-600">
                                <Calendar className="w-5 h-5" />
                            </div>

                            <span className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase mb-3 font-sans">
                                Fecha del Evento
                            </span>

                            <div className="flex flex-col items-center gap-1">
                                <p className="text-2xl md:text-3xl font-light text-gray-900 font-serif capitalize">
                                    {fecha.toLocaleDateString('es-AR', { weekday: 'long', timeZone: 'UTC' })}
                                </p>
                                <p className="text-4xl md:text-5xl font-medium text-primary font-serif">
                                    {fecha.getUTCDate()}
                                </p>
                                <p className="text-xl md:text-2xl font-light text-gray-900 font-serif capitalize">
                                    {fecha.toLocaleDateString('es-AR', { month: 'long', timeZone: 'UTC' })}
                                </p>
                            </div>

                            <div className="mt-6 flex items-center gap-2 text-gray-600 bg-white/50 px-4 py-2 rounded-full text-sm">
                                <Clock className="w-4 h-4" />
                                <span className="font-medium">{hora} hs</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
