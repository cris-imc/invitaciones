"use client";

interface FarewellProps {
    icono?: string;
    texto: string;
    nombre: string;
    foto?: string;
    colorPrimario?: string;
}

export function Farewell({
    icono = "💕",
    texto,
    nombre,
    foto,
    colorPrimario = "#000000",
}: FarewellProps) {
    return (
        <section className="py-20 md:py-24 px-6" style={{ backgroundColor: 'var(--color-background)' }}>
            <div className="max-w-2xl mx-auto text-center">
                {foto && (
                    <div className="mb-8">
                        <img
                            src={foto}
                            alt={nombre}
                            className="w-40 h-40 md:w-48 md:h-48 rounded-full object-cover mx-auto shadow-lg border-4 border-white"
                        />
                    </div>
                )}
                
                <div className="space-y-6">
                    <div className="text-5xl mb-4">{icono}</div>
                    <p 
                        className="text-base uppercase tracking-[0.25em]"
                        style={{ 
                            fontFamily: "'Montserrat', sans-serif",
                            fontWeight: '400',
                            color: 'var(--color-text-secondary)'
                        }}
                    >
                        {texto}
                    </p>
                    <h2 
                        className="text-3xl md:text-4xl"
                        style={{ 
                            fontFamily: "'Parisienne', cursive",
                            color: 'var(--color-primary)'
                        }}
                    >
                        {nombre}
                    </h2>
                </div>
            </div>
        </section>
    );
}
