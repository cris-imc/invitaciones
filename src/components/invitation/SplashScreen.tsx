"use client";

import { Button } from "@/components/ui/button";

interface SplashScreenProps {
    titulo: string;
    nombre: string;
    nombreInvitado?: string;
    textoBoton?: string;
    imagenFondo?: string;
    colorPrimario?: string;
    onEnter: () => void;
}

export function SplashScreen({
    titulo,
    nombre,
    nombreInvitado,
    textoBoton = "INGRESAR",
    imagenFondo,
    colorPrimario = "#000000",
    onEnter,
}: SplashScreenProps) {
    return (
        <div className="fixed inset-0 z-50 flex">
            {/* Left Half - Image */}
            <div
                className="w-1/2 relative"
                style={{
                    backgroundImage: imagenFondo ? `url(${imagenFondo})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div
                    className="absolute inset-0 bg-black"
                    style={{ opacity: 0.2 }}
                />
            </div>

            {/* Right Half - Content */}
            <div className="w-1/2 bg-white flex items-center justify-center">
                <div className="text-center px-6 flex flex-col items-center gap-6 max-w-md">
                    {/* Título del evento */}
                    <p
                        className="text-xs md:text-sm uppercase tracking-[0.3em] text-gray-600"
                        style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: '500' }}
                    >
                        {titulo}
                    </p>

                    {/* Nombre */}
                    <h1
                        className="text-gray-900"
                        style={{
                            fontFamily: "'Parisienne', cursive",
                            fontSize: 'clamp(3rem, 8vw, 5rem)',
                            lineHeight: '1.1',
                        }}
                    >
                        {nombre}
                    </h1>

                    {nombreInvitado && (
                        <p
                            className="text-lg md:text-xl mt-2 text-gray-700"
                            style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: '300' }}
                        >
                            {nombreInvitado}
                        </p>
                    )}

                    <Button
                        onClick={onEnter}
                        size="lg"
                        className="mt-8 px-10 py-6 text-sm transition-all duration-300"
                        style={{
                            fontFamily: "'Montserrat', sans-serif",
                            fontWeight: '500',
                            letterSpacing: '0.15em',
                            backgroundColor: colorPrimario,
                            color: '#ffffff',
                        }}
                    >
                        {textoBoton}
                    </Button>
                </div>
            </div>
        </div>
    );
}
