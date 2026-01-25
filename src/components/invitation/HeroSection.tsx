"use client";

import { Heart, ChevronDown } from "lucide-react";
import { Countdown } from "./Countdown";

interface HeroSectionProps {
    nombreEvento: string;
    tipo: string;
    nombreNovia?: string | null;
    nombreNovio?: string | null;
    nombreQuinceanera?: string | null;
    fechaEvento: Date;
    colorPrincipal: string;
    imagenPortada?: string | null;
}

export function HeroSection({
    nombreEvento,
    tipo,
    nombreNovia,
    nombreNovio,
    nombreQuinceanera,
    fechaEvento,
    colorPrincipal,
    imagenPortada,
}: HeroSectionProps) {
    const scrollToDetails = () => {
        const nextSection = document.getElementById('detalles');
        nextSection?.scrollIntoView({ behavior: 'smooth' });
    };

    // Calculate dynamic font size based on total name length to prevent line breaks
    const getNameFontSize = () => {
        let displayName = '';

        if (tipo === 'CASAMIENTO') {
            displayName = `${nombreNovia || 'Novia'} & ${nombreNovio || 'Novio'}`;
        } else {
            displayName = nombreQuinceanera || nombreEvento;
        }

        const length = displayName.length;

        // Adjust font sizes based on character count
        if (length > 40) return 'text-2xl md:text-3xl lg:text-4xl';
        if (length > 30) return 'text-3xl md:text-4xl lg:text-5xl';
        if (length > 14) return 'text-5xl md:text-6xl lg:text-7xl';
        return 'text-6xl md:text-8xl lg:text-9xl';
    };

    return (
        <div
            className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden pb-16"
            style={{
                backgroundColor: '#f8f8f8',
            }}
        >
            {/* Background Image with reduced opacity */}
            {imagenPortada && (
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: `url(${imagenPortada})`,
                        opacity: 0.6,
                    }}
                />
            )}

            {/* Lighter gradient overlay for better visibility */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/20 to-white/40" />

            {/* Main Content */}
            <div className="relative z-10 text-center px-4 flex-1 flex flex-col justify-center items-center w-full max-w-4xl mx-auto mt-10">

                {/* Overlapping Typography Layout */}
                <div className="relative mb-8">
                    {/* Event Type / Pre-title */}
                    <p
                        className="text-lg md:text-xl tracking-[0.3em] uppercase text-muted-foreground mb-4 font-sans"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                        {nombreEvento}
                    </p>

                    {/* Names with Overlap */}
                    <div className="relative">
                        <h1
                            className={`leading-tight text-gray-900 ${getNameFontSize()}`}
                            style={{ fontFamily: "'Parisienne', cursive", opacity: 0.9 }}
                        >
                            {tipo === 'CASAMIENTO' ? (
                                <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-8">
                                    <span className="leading-tight">{nombreNovia || "Novia"}</span>
                                    <span className="text-primary italic text-4xl md:text-6xl my-2 md:my-0" style={{ fontFamily: "'Parisienne', cursive" }}>&</span>
                                    <span className="leading-tight">{nombreNovio || "Novio"}</span>
                                </div>
                            ) : (
                                <span>{nombreQuinceanera || nombreEvento}</span>
                            )}
                        </h1>
                    </div>

                    {/* Date */}
                    <p className="mt-6 text-xl md:text-2xl text-gray-700 font-light border-t border-b border-gray-200 py-2 inline-block px-8">
                        {new Date(fechaEvento).toLocaleDateString('es-AR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        })}
                    </p>
                </div>

                {/* Arrow Down */}
                <div className="animate-bounce mb-8 text-primary/50">
                    <ChevronDown className="w-8 h-8" />
                </div>

            </div>

            {/* Integrated Countdown - Overlapping Bottom */}
            <div className="relative z-20 w-full mb-[-4rem] md:mb-[-5rem]">
                <Countdown targetDate={fechaEvento} />
            </div>
        </div>
    );
}
