"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface SplashScreenProps {
    titulo: string;
    nombre: string;
    nombreInvitado?: string;
    textoBoton: string;
    imagenFondo?: string;
    colorPrimario?: string;
    onEnter: () => void;
}

export function SplashScreen({
    titulo,
    nombre,
    nombreInvitado,
    textoBoton,
    imagenFondo,
    colorPrimario = "#000000",
    onEnter,
}: SplashScreenProps) {
    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{
                backgroundImage: imagenFondo ? `url(${imagenFondo})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40" />
            
            {/* Contenido */}
            <div className="relative z-10 text-center text-white px-6 flex flex-col items-center gap-6">
                {/* Título del evento - Sans serif limpio */}
                <p 
                    className="text-xs md:text-sm uppercase tracking-[0.3em]"
                    style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: '500', opacity: 0.9 }}
                >
                    {titulo}
                </p>
                
                {/* Nombre - Script elegante y grande */}
                <h1 
                    className="text-white"
                    style={{ 
                        fontFamily: "'Parisienne', cursive",
                        fontSize: 'clamp(3rem, 12vw, 6rem)',
                        lineHeight: '1.1',
                    }}
                >
                    {nombre}
                </h1>
                
                {nombreInvitado && (
                    <p 
                        className="text-lg md:text-xl mt-2"
                        style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: '300', opacity: 0.85 }}
                    >
                        {nombreInvitado}
                    </p>
                )}
                
                <Button
                    onClick={onEnter}
                    size="lg"
                    className="mt-8 px-10 py-6 text-sm rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
                    style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: '500',
                        letterSpacing: '0.15em',
                        backgroundColor: 'rgba(255,255,255,0.95)',
                        color: '#1a1a1a',
                    }}
                >
                    {textoBoton}
                </Button>
            </div>
        </div>
    );
}
