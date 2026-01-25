"use client";

import { Heart } from "lucide-react";

interface HeroSectionProps {
    nombreEvento: string;
    tipo: string;
    nombreNovia?: string | null;
    nombreNovio?: string | null;
    nombreQuinceanera?: string | null;
    fechaEvento: Date;
    colorPrincipal: string;
}

export function HeroSection({
    nombreEvento,
    tipo,
    nombreNovia,
    nombreNovio,
    nombreQuinceanera,
    fechaEvento,
    colorPrincipal,
}: HeroSectionProps) {
    const scrollToCountdown = () => {
        document.getElementById('countdown')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div
            className="relative h-screen flex items-center justify-center overflow-hidden"
            style={{
                background: `linear-gradient(135deg, ${colorPrincipal}15 0%, ${colorPrincipal}05 100%)`,
            }}
        >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />

            <div className="relative z-10 text-center px-4 space-y-8 animate-in fade-in duration-1000">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
                    <Heart className="w-10 h-10 text-primary fill-primary" />
                </div>

                <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight">
                    {nombreEvento}
                </h1>

                <p className="text-2xl md:text-3xl text-muted-foreground font-light">
                    {tipo === 'CASAMIENTO' && `${nombreNovia} & ${nombreNovio}`}
                    {tipo === 'QUINCE_ANOS' && nombreQuinceanera}
                </p>

                <div className="pt-8">
                    <p className="text-lg text-muted-foreground mb-2">
                        {tipo === 'CASAMIENTO' ? 'Nos casamos el' : 'Celebramos el'}
                    </p>
                    <p className="text-2xl font-semibold">
                        {new Date(fechaEvento).toLocaleDateString('es-AR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        })}
                    </p>
                </div>

                <div className="pt-4">
                    <button
                        onClick={scrollToCountdown}
                        className="text-primary hover:underline animate-bounce"
                    >
                        ↓ Ver más ↓
                    </button>
                </div>
            </div>
        </div>
    );
}
