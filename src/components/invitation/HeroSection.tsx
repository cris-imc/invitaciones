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
        if (length > 40) return 'text-3xl md:text-4xl lg:text-5xl';
        if (length > 30) return 'text-4xl md:text-5xl lg:text-6xl';
        if (length > 14) return 'text-5xl md:text-7xl lg:text-8xl';
        return 'text-6xl md:text-8xl lg:text-9xl';
    };

    return (
        <div className="relative">
            {/* Hero Section */}
            <div
                className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
                style={{
                    backgroundColor: '#fafafa',
                }}
            >
                {/* Background Image with subtle opacity */}
                {imagenPortada && (
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage: `url(${imagenPortada})`,
                            opacity: 0.12,
                            transform: 'scale(1.05)',
                        }}
                    />
                )}

                {/* Main Content */}
                <div className="relative z-10 text-center px-4 py-20 max-w-5xl mx-auto">
                    {/* Event Type Label */}
                    <div className="mb-10">
                        <span
                            className="inline-block text-xs md:text-sm uppercase tracking-[0.5em] font-light"
                            style={{
                                color: colorPrincipal,
                                fontFamily: "'Montserrat', sans-serif",
                            }}
                        >
                            {nombreEvento}
                        </span>
                    </div>

                    {/* Names */}
                    <div className="mb-12">
                        <h1
                            className={`leading-[1.1] ${getNameFontSize()}`}
                            style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontWeight: '300',
                                color: '#1a1a1a',
                                letterSpacing: '-0.01em',
                            }}
                        >
                            {tipo === 'CASAMIENTO' ? (
                                <div className="flex flex-col items-center gap-6">
                                    <span>{nombreNovia || "Novia"}</span>
                                    <Heart
                                        className="w-10 h-10 md:w-14 md:h-14"
                                        style={{ color: colorPrincipal }}
                                        fill={colorPrincipal}
                                        strokeWidth={1}
                                    />
                                    <span>{nombreNovio || "Novio"}</span>
                                </div>
                            ) : (
                                <span>{nombreQuinceanera || nombreEvento}</span>
                            )}
                        </h1>
                    </div>

                    {/* Date */}
                    <div className="mb-16">
                        <p
                            className="text-base md:text-lg font-light tracking-widest uppercase"
                            style={{
                                fontFamily: "'Montserrat', sans-serif",
                                color: '#888',
                                letterSpacing: '0.2em',
                            }}
                        >
                            {new Date(fechaEvento).toLocaleDateString('es-AR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                timeZone: 'UTC'
                            }).replace(/\//g, ' . ')}
                        </p>
                    </div>

                    {/* Scroll Indicator */}
                    <button
                        onClick={scrollToDetails}
                        className="animate-bounce text-gray-300 hover:text-gray-500 transition-colors mt-8"
                        aria-label="Scroll to details"
                    >
                        <ChevronDown className="w-6 h-6 md:w-8 md:h-8" strokeWidth={1} />
                    </button>
                </div>
            </div>

            {/* Countdown Section - Separate from Hero */}
            <div className="relative bg-white border-t border-gray-100">
                <Countdown targetDate={fechaEvento} />
            </div>
        </div>
    );
}
