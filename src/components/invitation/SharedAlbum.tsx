"use client";

import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface SharedAlbumProps {
    icono?: string;
    titulo: string;
    descripcion?: string;
    botonTexto: string;
    albumUrl?: string;
    colorPrimario?: string;
}

export function SharedAlbum({
    icono = "📷",
    titulo,
    descripcion,
    botonTexto,
    albumUrl,
    colorPrimario = "#000000",
}: SharedAlbumProps) {
    return (
        <section className="py-16 md:py-20 px-6" style={{ backgroundColor: 'var(--color-background)' }}>
            <div className="max-w-2xl mx-auto text-center">
                <div className="mb-8">
                    <h2 
                        className="text-xl md:text-2xl mb-4 font-semibold"
                        style={{ color: 'var(--color-text-dark)', fontFamily: "'Montserrat', sans-serif" }}
                    >
                        {titulo}
                    </h2>
                    <p 
                        className="text-sm leading-relaxed"
                        style={{ color: 'var(--color-text-secondary)', fontFamily: "'Montserrat', sans-serif" }}
                    >
                        {descripcion || 'Subí tus fotos favoritas del evento y mirá las de los demás invitados'}
                    </p>
                </div>
                
                <Button
                    size="lg"
                    className="px-8 py-5 gap-2 rounded-full"
                    style={{ 
                        backgroundColor: 'var(--color-primary)',
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: '500',
                        letterSpacing: '0.05em'
                    }}
                    onClick={() => albumUrl && window.open(albumUrl, '_blank')}
                >
                    {botonTexto}
                    <ExternalLink className="w-4 h-4" />
                </Button>
            </div>
        </section>
    );
}
