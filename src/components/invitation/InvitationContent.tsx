"use client";

import { useState } from "react";
import { SplashScreen } from "./SplashScreen";
import { MusicPlayer } from "./MusicPlayer";
import { Countdown } from "./Countdown";
import { EventDetails } from "./EventDetails";
import { DressCode } from "./DressCode";
import { QuoteSection } from "./QuoteSection";
import { SharedAlbum } from "./SharedAlbum";
import { GiftInfo } from "./GiftInfo";
import { FinalMessage } from "./FinalMessage";
import { RSVPForm } from "./RSVPForm";
import { Farewell } from "./Farewell";
import { InvitationThemeProvider } from "./InvitationThemeProvider";
import { ScrollReveal } from "./ScrollReveal";
import { ThemeConfig } from "@/lib/theme-config";
import Image from "next/image";
import { MarqueeGallery } from "@/components/animations/MarqueeGallery";

interface InvitationContentProps {
    invitation: any;
}

// Helper function para parsear JSON de forma segura
function safeJsonParse(value: string | null | undefined, defaultValue: any = null) {
    if (!value) return defaultValue;
    try {
        if (typeof value !== 'string') return value;
        return JSON.parse(value);
    } catch {
        return defaultValue;
    }
}

export function InvitationContent({ invitation }: InvitationContentProps) {
    console.log('DEBUG: InvitationContent received:', JSON.stringify({
        titulo: invitation.portadaTitulo,
        fondo: invitation.portadaImagenFondo,
        galeria: invitation.galeriaPrincipalFotos
    }, null, 2));
    const [showSplash, setShowSplash] = useState(invitation.portadaHabilitada);

    // Parse theme configuration
    const temaColores = safeJsonParse(invitation.temaColores, { colorPrincipal: '#c7757f' });
    const themeConfig: Partial<ThemeConfig> = {
        colorTemplate: 'rosa-salmon', // Default fallback
        primaryColor: temaColores?.primaryColor || temaColores?.colorPrincipal || '#c7757f',
        backgroundColor: temaColores?.backgroundColor || '#ffffff',
        textDark: temaColores?.textDark || '#1a1a1a',
        textLight: temaColores?.textLight || '#ffffff',
        textSecondary: temaColores?.textSecondary || '#666666',

        layout: temaColores?.layout || 'classic',
        fontFamily: temaColores?.fontFamily || 'poppins',
        fontScale: temaColores?.fontScale || 1.0,
        letterSpacing: temaColores?.letterSpacing || 'normal',
        lineHeight: temaColores?.lineHeight || 'normal',
        sectionSpacing: temaColores?.sectionSpacing || 100,
        sectionPadding: temaColores?.sectionPadding || 50,
    };

    // Parse arrays directly
    const galeriaPrincipal = safeJsonParse(invitation.galeriaPrincipalFotos, []);
    const galeriaSecundaria = safeJsonParse(invitation.galeriaSecundariaFotos, []);

    // Calcular nombre(s) para despedida
    const nombreFestejado = invitation.tipo === 'CASAMIENTO'
        ? `${invitation.nombreNovia} & ${invitation.nombreNovio}`
        : invitation.nombreQuinceanera || invitation.nombreEvento;

    return (
        <InvitationThemeProvider themeConfig={themeConfig}>
            {/* Portada/Splash Screen */}
            {showSplash && invitation.portadaHabilitada && (
                <SplashScreen
                    titulo={invitation.portadaTitulo || ""}
                    nombre={nombreFestejado}
                    nombreInvitado=""
                    textoBoton={invitation.portadaTextoBoton || "ABRIR INVITACIÓN"}
                    imagenFondo={invitation.portadaImagenFondo}
                    onEnter={() => setShowSplash(false)}
                />
            )}

            <div className="min-h-screen bg-background">
                {/* Reproductor de Música */}
                {invitation.musicaHabilitada && invitation.musicaUrl && (
                    <MusicPlayer
                        musicaUrl={invitation.musicaUrl}
                        // Solo autoplay si está habilitado Y NO se muestra el splash screen (o ya pasó)
                        // Si hay splash screen, el autoplay se activa al cerrarlo (interacción del usuario)
                        autoplay={invitation.musicaAutoplay && !showSplash}
                        loop={invitation.musicaLoop}
                    />
                )}

                {/* Hero Section - Altura reducida y tipografía mejorada */}
                <section
                    className="relative h-[75vh] min-h-[500px] max-h-[800px] flex items-center justify-center"
                    style={{
                        backgroundImage: galeriaPrincipal[0]
                            ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.5)), url(${galeriaPrincipal[0]})`
                            : 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-text-dark) 100%)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        color: 'var(--color-text-light)',
                    }}
                >
                    <ScrollReveal className="w-full flex justify-center">
                        <div className="text-center px-6 py-8 flex flex-col items-center justify-center gap-4" style={{ maxWidth: '700px' }}>
                            {/* Tipo de evento - Pequeño y elegante arriba */}
                            <p className="invitation-event-type">
                                {invitation.tipo === 'CASAMIENTO' ? 'Nuestra Boda' :
                                    invitation.tipo === 'QUINCE_ANOS' ? 'Mis XV Años' :
                                        'Celebración'}
                            </p>

                            {/* Nombres - Grande y script elegante */}
                            {/* Nombres - Grande y script elegante */}
                            <h1 className="invitation-names">
                                {invitation.nombreEvento}
                            </h1>

                            {invitation.tipo === 'CASAMIENTO' && (invitation.nombreNovia || invitation.nombreNovio) && (
                                <p className="text-2xl mt-4 font-light">
                                    {invitation.nombreNovia} & {invitation.nombreNovio}
                                </p>
                            )}
                            {invitation.tipo === 'QUINCE_ANOS' && invitation.nombreQuinceanera && (
                                <p className="text-2xl mt-4 font-light">
                                    {invitation.nombreQuinceanera}
                                </p>
                            )}

                            {/* Separador decorativo */}
                            <div className="w-16 h-px bg-white/50 my-2"></div>

                            {/* Fecha */}
                            <p className="invitation-date-hero">
                                {new Date(invitation.fechaEvento).toLocaleDateString('es-AR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </p>
                        </div>
                    </ScrollReveal>
                </section>

                {/* Contador Regresivo */}
                {invitation.contadorHabilitado && (
                    <ScrollReveal>
                        <Countdown targetDate={new Date(invitation.fechaEvento)} />
                    </ScrollReveal>
                )}

                {/* Sección Cuándo y Dónde */}
                {invitation.seccionCuandoHabilitada && invitation.lugarNombre && (
                    <ScrollReveal>
                        <EventDetails
                            lugarNombre={invitation.lugarNombre}
                            direccion={invitation.direccion || ""}
                            fecha={new Date(invitation.fechaEvento)}
                            hora={invitation.hora || ""}
                            mapUrl={invitation.mapUrl || undefined}
                        />
                    </ScrollReveal>
                )}

                {/* Dress Code */}
                {invitation.dresscodeHabilitado && (
                    <ScrollReveal>
                        <DressCode
                            icono={invitation.dresscodeIcono}
                            titulo={invitation.dresscodeTitulo || "DRESS CODE"}
                            tipo={invitation.dresscodeTipo || ""}
                            observaciones={invitation.dresscodeObservaciones}
                        />
                    </ScrollReveal>
                )}

                {/* Galería Principal */}
                {invitation.galeriaPrincipalHabilitada && galeriaPrincipal.length > 0 && (
                    <section className="py-16 md:py-20 px-6" style={{ backgroundColor: 'var(--color-background)' }}>
                        <ScrollReveal>
                            <div className="max-w-6xl mx-auto">
                                <div className="text-center mb-12">
                                    <span
                                        className="text-xs uppercase tracking-[0.25em] block mb-3"
                                        style={{ color: 'var(--color-text-secondary)', fontFamily: "'Montserrat', sans-serif" }}
                                    >
                                        Recuerdos
                                    </span>
                                    <h2
                                        className="text-3xl md:text-4xl"
                                        style={{ color: 'var(--color-primary)', fontFamily: "'Parisienne', cursive" }}
                                    >
                                        Galería
                                    </h2>
                                    {/* <div className={`grid gap-4 ${galeriaPrincipal.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
                                    galeriaPrincipal.length === 2 ? 'grid-cols-2 max-w-2xl mx-auto' :
                                        'grid-cols-2 md:grid-cols-4'
                                    }`}>
                                    {galeriaPrincipal.map((foto: string, index: number) => (
                                        <div key={index} className="aspect-square overflow-hidden rounded-lg relative group">
                                            <Image
                                                src={foto}
                                                alt={`Foto ${index + 1}`}
                                                fill
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                className="object-cover group-hover:scale-110 transition-transform duration-300"
                                            />
                                        </div>
                                    ))}
                                </div> */}
                                    <MarqueeGallery images={galeriaPrincipal} />
                                </div>
                            </div>
                        </ScrollReveal>
                    </section>
                )}

                {/* Frase Personalizada */}
                {invitation.frasePersonalizadaHabilitada && invitation.frasePersonalizadaTexto && (
                    <ScrollReveal>
                        <QuoteSection
                            texto={invitation.frasePersonalizadaTexto}
                            estilo={invitation.frasePersonalizadaEstilo}
                        />
                    </ScrollReveal>
                )}

                {/* Álbum Compartido */}
                {invitation.albumCompartidoHabilitado && (
                    <ScrollReveal>
                        <SharedAlbum
                            icono={invitation.albumCompartidoIcono}
                            titulo={invitation.albumCompartidoTitulo || "COMPARTE TUS FOTOS"}
                            descripcion={invitation.albumCompartidoDescripcion}
                            botonTexto={invitation.albumCompartidoBotonTexto || "IR AL ÁLBUM"}
                            albumUrl={`/album/${invitation.id}`}
                        />
                    </ScrollReveal>
                )}

                {/* Regalo/Datos Bancarios */}
                {invitation.regaloHabilitado && (
                    <ScrollReveal>
                        <GiftInfo
                            icono={invitation.regaloIcono}
                            titulo={invitation.regaloTitulo || "REGALO"}
                            mensaje={invitation.regaloMensaje || ""}
                            mostrarDatos={invitation.regaloMostrarDatos}
                            alias={invitation.regaloAlias}
                            cvu={invitation.regaloCvu}
                            cbu={invitation.regaloCbu}
                        />
                    </ScrollReveal>
                )}

                {/* Galería Secundaria */}
                {invitation.galeriaSecundariaHabilitada && galeriaSecundaria.length > 0 && (
                    <section className="py-16 px-4 bg-gray-50">
                        <ScrollReveal>
                            <div className="max-w-6xl mx-auto">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {galeriaSecundaria.map((foto: string, index: number) => (
                                        <div key={index} className="aspect-square overflow-hidden rounded-lg relative group">
                                            <Image
                                                src={foto}
                                                alt={`Foto secundaria ${index + 1}`}
                                                fill
                                                sizes="(max-width: 768px) 50vw, 25vw"
                                                className="object-cover group-hover:scale-110 transition-transform duration-300"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </ScrollReveal>
                    </section>
                )}

                {/* Mensaje Final */}
                {invitation.mensajeFinalHabilitado && invitation.mensajeFinalTexto && (
                    <ScrollReveal>
                        <FinalMessage
                            texto={invitation.mensajeFinalTexto}
                        />
                    </ScrollReveal>
                )}

                {/* Confirmación de Asistencia */}
                {invitation.confirmacionHabilitada && (
                    <section className="py-16 px-4 bg-white">
                        <ScrollReveal>
                            <div className="max-w-3xl mx-auto text-center space-y-8">
                                <div className="space-y-4">
                                    <div className="text-6xl">{invitation.confirmacionIcono || "✉️"}</div>
                                    <h2 className="invitation-title-section" style={{ color: 'var(--color-primary)' }}>
                                        {invitation.confirmacionTitulo || "CONFIRMA TU ASISTENCIA"}
                                    </h2>
                                    {invitation.confirmacionFechaLimite && (
                                        <p className="text-lg text-muted-foreground">
                                            Fecha límite: {new Date(invitation.confirmacionFechaLimite).toLocaleDateString('es-AR')}
                                        </p>
                                    )}
                                </div>
                                <RSVPForm invitationId={invitation.id} />
                            </div>
                        </ScrollReveal>
                    </section>
                )}

                {/* Despedida */}
                {invitation.despedidaHabilitada && (
                    <ScrollReveal>
                        <Farewell
                            icono={invitation.despedidaIcono}
                            texto={invitation.despedidaTexto || "TE ESPERO"}
                            nombre={nombreFestejado}
                            foto={invitation.despedidaFoto}
                        />
                    </ScrollReveal>
                )}

                {/* Footer */}
                <footer className="py-8 text-center text-sm text-muted-foreground bg-gray-50">
                    <p>Creado con ❤️ usando InvitaDigital</p>
                </footer>
            </div>
        </InvitationThemeProvider>
    );
}
