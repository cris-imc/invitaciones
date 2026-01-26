"use client";

import { ScrollReveal } from "./ScrollReveal";

interface FarewellProps {
    nombreEvento: string;
    tipo: string;
    nombreNovia?: string | null;
    nombreNovio?: string | null;
    nombreQuinceanera?: string | null;
    colorPrincipal: string;
    despedidaFoto?: string | null;
}

export function Farewell({
    nombreEvento,
    tipo,
    nombreNovia,
    nombreNovio,
    nombreQuinceanera,
    colorPrincipal,
    despedidaFoto,
}: FarewellProps) {
    // Determine host names and message
    const getHostsAndMessage = () => {
        if (tipo === 'CASAMIENTO') {
            const hosts = [nombreNovia, nombreNovio].filter(Boolean);
            return {
                names: hosts.join(' & '),
                message: hosts.length > 1 ? 'Te esperamos' : 'Te espero',
            };
        } else {
            const hostName = nombreQuinceanera || nombreEvento;
            return {
                names: hostName,
                message: 'Te espero',
            };
        }
    };

    const { names, message } = getHostsAndMessage();

    return (
        <section className="py-20 px-4 bg-gradient-to-b from-white to-slate-50">
            <ScrollReveal>
                <div className="max-w-3xl mx-auto text-center space-y-8">
                    {/* Decorative Icon or Photo */}
                    <div className="text-6xl">
                        {despedidaFoto ? (
                            <img
                                src={despedidaFoto}
                                alt="Despedida"
                                className="w-32 h-32 mx-auto rounded-full object-cover shadow-lg"
                            />
                        ) : (
                            <span style={{ color: colorPrincipal }}>✨</span>
                        )}
                    </div>

                    {/* Message */}
                    <div className="space-y-4">
                        <h2
                            className="text-4xl md:text-5xl lg:text-6xl"
                            style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontWeight: '300',
                                color: colorPrincipal,
                            }}
                        >
                            {message}
                        </h2>

                        <p
                            className="text-2xl md:text-3xl"
                            style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontWeight: '400',
                                color: '#1a1a1a',
                            }}
                        >
                            {names}
                        </p>
                    </div>

                    {/* Decorative Line */}
                    <div className="flex items-center justify-center gap-4 pt-8">
                        <div
                            className="h-px w-24"
                            style={{ backgroundColor: colorPrincipal, opacity: 0.3 }}
                        />
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: colorPrincipal }}
                        />
                        <div
                            className="h-px w-24"
                            style={{ backgroundColor: colorPrincipal, opacity: 0.3 }}
                        />
                    </div>
                </div>
            </ScrollReveal>
        </section>
    );
}
