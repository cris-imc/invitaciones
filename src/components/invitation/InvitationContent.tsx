"use client";

import { useState } from "react";
import { SplashScreen } from "./SplashScreen";
import { MusicPlayer } from "./MusicPlayer";
import { EventDetails } from "./EventDetails";
import { DressCode } from "./DressCode";
import { QuoteSection } from "./QuoteSection";
import { SharedAlbum } from "./SharedAlbum";
import { BankDetails } from "./BankDetails";
import { FinalMessage } from "./FinalMessage";
import { RSVPForm } from "./RSVPForm";
import { PersonalizedRsvpForm } from "./PersonalizedRsvpForm";
import { Farewell } from "./Farewell";
import { InvitationThemeProvider } from "./InvitationThemeProvider";
import { ScrollReveal } from "./ScrollReveal";
import { ThemeConfig } from "@/lib/theme-config";
import Image from "next/image";
import { MarqueeGallery } from "@/components/animations/MarqueeGallery";
import { MotivationalSection } from "./MotivationalSection";
import { HeroSection } from "./HeroSection";
import { ModernInvitationTemplate } from "@/components/templates/ModernInvitationTemplate";
import { CronogramaOriginal } from "./CronogramaOriginal";
import { LuxuryMinimalistTemplate } from "@/components/templates/LuxuryMinimalistTemplate";
import { BotanicalGardenTemplate } from "@/components/templates/BotanicalGardenTemplate";
import { GoldenLuxuryTemplate } from "@/components/templates/GoldenLuxuryTemplate";
import { NeonNightTemplate } from "@/components/templates/NeonNightTemplate";

interface InvitationContentProps {
    invitation: any;
    guest?: any;
    isPersonalized?: boolean;
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

export function InvitationContent({ invitation, guest, isPersonalized = false }: InvitationContentProps) {
    const [showSplash, setShowSplash] = useState(invitation.portadaHabilitada);

    // Parse theme configuration
    const temaColores = safeJsonParse(invitation.temaColores, { colorPrincipal: '#c7757f' });
    const themeConfig: Partial<ThemeConfig> = {
        colorTemplate: 'dorado', // Default fallback
        primaryColor: temaColores?.primaryColor || temaColores?.colorPrincipal || '#c7757f',
        backgroundColor: temaColores?.backgroundColor || '#ffffff',
        textDark: temaColores?.textDark || '#1a1a1a',
        textLight: temaColores?.textLight || '#ffffff',
        textSecondary: temaColores?.textSecondary || '#666666',

        layout: 'modern', // Enforce Modern/Scroll layout
        fontFamily: 'montserrat', // Enforce delicate font
        fontScale: 1.0,
        letterSpacing: 'normal',
        lineHeight: 'normal',
        sectionSpacing: 100,
        sectionPadding: 50,
    };

    // Parse arrays directly
    const galeriaPrincipal = safeJsonParse(invitation.galeriaPrincipalFotos, []);
    const galeriaSecundaria = safeJsonParse(invitation.galeriaSecundariaFotos, []);
    const cronogramaEvents = safeJsonParse(invitation.cronogramaEventos, []);

    // Helper para obtener el nombre completo (sin cortar)
    const getFirstName = (fullName: string | null | undefined) => {
        if (!fullName) return '';
        return fullName.trim();
    };

    // Calcular nombre(s) para despedida
    const nombreFestejado = invitation.tipo === 'CASAMIENTO'
        ? `${getFirstName(invitation.nombreNovia)} & ${getFirstName(invitation.nombreNovio)}`
        : getFirstName(invitation.nombreQuinceanera) || invitation.nombreEvento;

    // Check if event has passed (one day after event date)
    const eventDate = new Date(invitation.fechaEvento);
    const oneDayAfterEvent = new Date(eventDate);
    oneDayAfterEvent.setDate(oneDayAfterEvent.getDate() + 1);
    const hasEventPassed = new Date() > oneDayAfterEvent;

    // Determine the actual state
    const isInactive = invitation.estado === 'BORRADOR';
    const isFinalized = invitation.estado === 'FINALIZADA' || hasEventPassed;

    // Parse trivia questions safely
    const triviaData = invitation.triviaHabilitada ? (() => {
        try {
            const preguntas = JSON.parse(invitation.triviaPreguntas || "[]");
            if (preguntas && preguntas.length > 0) {
                return {
                    icono: invitation.triviaIcono,
                    titulo: invitation.triviaTitulo || "¿Cuánto nos conoces?",
                    subtitulo: invitation.triviaSubtitulo,
                    preguntas: preguntas
                };
            }
        } catch (e) {
            console.error("Error parsing trivia questions:", e);
        }
        return null;
    })() : null;

    if (invitation.templateTipo === "PARALLAX") {
        return <ModernInvitationTemplate invitation={invitation} guest={guest} isPersonalized={isPersonalized} />;
    }

    if (invitation.templateTipo === "LUXURY") {
        // Map invitation/Prisma data to InvitationFormData shape
        const formData = {
            ...invitation,
            type: invitation.tipo,
            fecha: new Date(invitation.fechaEvento),
            galeriaPrincipalFotos: galeriaPrincipal,
            galeriaSecundariaFotos: galeriaSecundaria,
        } as any;

        return <LuxuryMinimalistTemplate data={formData} themeConfig={themeConfig as any} />;
    }

    if (invitation.templateTipo === "BOTANICAL") {
        const formData = {
            ...invitation,
            type: invitation.tipo,
            fecha: new Date(invitation.fechaEvento),
            galeriaPrincipalFotos: galeriaPrincipal,
            galeriaSecundariaFotos: galeriaSecundaria,
        } as any;

        return <BotanicalGardenTemplate data={formData} themeConfig={themeConfig as any} />;
    }

    if (invitation.templateTipo === "GOLDEN") {
        const formData = {
            ...invitation,
            type: invitation.tipo,
            fecha: new Date(invitation.fechaEvento),
            galeriaPrincipalFotos: galeriaPrincipal,
            galeriaSecundariaFotos: galeriaSecundaria,
        } as any;

        return <GoldenLuxuryTemplate data={formData} themeConfig={themeConfig as any} />;
    }

    if (invitation.templateTipo === "NEON") {
        const formData = {
            ...invitation,
            type: invitation.tipo,
            fecha: new Date(invitation.fechaEvento),
            galeriaPrincipalFotos: galeriaPrincipal,
            galeriaSecundariaFotos: galeriaSecundaria,
        } as any;

        return <NeonNightTemplate data={formData} themeConfig={themeConfig as any} />;
    }

    return (
        <InvitationThemeProvider themeConfig={themeConfig}>
            {/* Status Banners */}
            {isInactive && (
                <div className="bg-yellow-500 text-white py-3 px-4 text-center font-medium">
                    ⚠️ Esta invitación está INACTIVA y solo es visible en modo de vista previa
                </div>
            )}

            {isFinalized && (
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-12 px-4 text-center">
                    <div className="max-w-2xl mx-auto space-y-4">
                        <div className="text-6xl">🎉</div>
                        <h2 className="text-3xl font-bold">¡Gracias por ser parte!</h2>
                        <p className="text-xl">
                            Esperamos que hayas disfrutado de este día tan especial tanto como nosotros.
                        </p>
                        <p className="text-lg opacity-90">
                            Tu presencia hizo que este momento fuera aún más memorable.
                        </p>
                    </div>
                </div>
            )}

            {/* Only show full invitation content if not finalized */}
            {!isFinalized && (
                <>
                    {/* Portada/Splash Screen */}
                    {showSplash && invitation.portadaHabilitada && (
                        <SplashScreen
                            titulo={invitation.portadaTitulo || ""}
                            nombre={nombreFestejado}
                            nombreInvitado=""
                            textoBoton={invitation.portadaTextoBoton || "INGRESAR"}
                            imagenFondo={invitation.portadaImagenFondo}
                            onEnter={() => setShowSplash(false)}
                        />
                    )}

                    <div className="min-h-screen bg-background text-foreground">
                        {/* Reproductor de Música */}
                        {invitation.musicaHabilitada && invitation.musicaUrl && (
                            <MusicPlayer
                                musicaUrl={invitation.musicaUrl}
                                autoplay={invitation.musicaAutoplay && !showSplash}
                                loop={invitation.musicaLoop}
                            />
                        )}

                        {/* Hero Section (Includes Countdown internally) */}
                        <HeroSection
                            nombreEvento={invitation.nombreEvento || "Celebración"}
                            tipo={invitation.tipo}
                            nombreNovia={invitation.nombreNovia}
                            nombreNovio={invitation.nombreNovio}
                            nombreQuinceanera={invitation.nombreQuinceanera}
                            fechaEvento={new Date(invitation.fechaEvento)}
                            colorPrincipal={themeConfig.primaryColor!}
                            imagenPortada={invitation.portadaImagenFondo || null}
                        />

                        {/* Frase Personalizada */}
                        {invitation.frasePersonalizadaHabilitada && invitation.frasePersonalizadaTexto && (
                            <ScrollReveal>
                                <QuoteSection
                                    texto={invitation.frasePersonalizadaTexto}
                                    estilo={invitation.frasePersonalizadaEstilo}
                                />
                            </ScrollReveal>
                        )}

                        {/* Sección Cuándo y Dónde */}
                        <div id="detalles">
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
                        </div>

                        {/* Galería Principal */}
                        {invitation.galeriaPrincipalHabilitada && galeriaPrincipal.length > 0 && (
                            <section className="py-20 px-6 bg-slate-50">
                                <ScrollReveal>
                                    <div className="max-w-6xl mx-auto mb-12 text-center">
                                        <span className="text-xs tracking-[0.25em] block mb-3 text-muted-foreground uppercase">
                                            Momentos
                                        </span>
                                        <h2 className="text-3xl md:text-4xl" style={{ color: 'var(--color-primary)', fontFamily: "var(--font-ornamental)" }}>
                                            Galería de Fotos
                                        </h2>
                                    </div>
                                    <MarqueeGallery images={galeriaPrincipal} />
                                </ScrollReveal>
                            </section>
                        )}


                        {/* Motivational Phrase & Quiz */}
                        <MotivationalSection
                            triviaEnabled={invitation.triviaHabilitada}
                            triviaData={triviaData}
                            invitationId={invitation.id}
                            guestName={guest?.name}
                            guestToken={guest?.uniqueToken}
                        />

                        {/* Cronograma */}
                        {cronogramaEvents.length > 0 && (
                            <ScrollReveal>
                                <CronogramaOriginal events={cronogramaEvents} />
                            </ScrollReveal>
                        )}

                        {/* Dress Code */}
                        {invitation.dresscodeHabilitado && (
                            <ScrollReveal>
                                <DressCode
                                    icono={invitation.dresscodeIcono}
                                    titulo={invitation.dresscodeTitulo || "Código de Vestimenta"}
                                    tipo={invitation.dresscodeTipo || "Elegante Sport"}
                                    observaciones={invitation.dresscodeObservaciones}
                                />
                            </ScrollReveal>
                        )}


                        {/* Área de Regalo / Datos Bancarios */}
                        {invitation.regaloHabilitado && (
                            <ScrollReveal>
                                <BankDetails
                                    titulo={invitation.regaloTitulo || "Regalo"}
                                    mensaje={invitation.regaloMensaje}
                                    mostrarDatos={invitation.regaloMostrarDatos}
                                    banco={invitation.regaloBanco}
                                    cbu={invitation.regaloCbu}
                                    alias={invitation.regaloAlias}
                                    titular={invitation.regaloTitular}
                                />
                            </ScrollReveal>
                        )}

                        {/* Álbum Compartido */}
                        {invitation.albumCompartidoHabilitado && (
                            <ScrollReveal>
                                <SharedAlbum
                                    invitationSlug={invitation.slug}
                                    titulo={invitation.albumCompartidoTitulo || "Álbum Colaborativo"}
                                    descripcion={invitation.albumCompartidoDescripcion}
                                    colorPrimario={themeConfig.primaryColor || '#c7757f'}
                                    fechaEvento={invitation.fechaEvento}
                                    horaEvento={invitation.hora || undefined}
                                    guestName={guest?.name}
                                />
                            </ScrollReveal>
                        )}

                        {/* Galería Secundaria */}
                        {invitation.galeriaSecundariaHabilitada && galeriaSecundaria.length > 0 && (
                            <section className="py-16 px-4 bg-white">
                                <ScrollReveal>
                                    <div className="max-w-6xl mx-auto">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {galeriaSecundaria.map((foto: string, index: number) => (
                                                <div key={index} className="aspect-square overflow-hidden relative group">
                                                    <Image
                                                        src={foto}
                                                        alt={`Foto secundaria ${index + 1}`}
                                                        fill
                                                        sizes="(max-width: 768px) 100vw, 50vw"
                                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </ScrollReveal>
                            </section>
                        )}

                        {/* Confirmación de Asistencia */}
                        {invitation.confirmacionHabilitada && (
                            <section className="py-20 px-4 bg-slate-50">
                                <ScrollReveal>
                                    <div className="max-w-3xl mx-auto text-center space-y-8">
                                        {isPersonalized && guest ? (
                                            <>
                                                <div className="space-y-4">
                                                    <div className="text-6xl">{invitation.confirmacionIcono || "✉️"}</div>
                                                    <h2 className="text-3xl md:text-4xl" style={{ color: 'var(--color-primary)', fontFamily: "var(--font-ornamental)" }}>
                                                        Hola, {guest.name}
                                                    </h2>
                                                    <p className="text-lg text-muted-foreground">
                                                        Confirmá tu asistencia antes del{' '}
                                                        {(() => {
                                                            const eventDate = new Date(invitation.fechaEvento);
                                                            const daysBeforeEvent = invitation.rsvpDaysBeforeEvent || 7;
                                                            const deadlineDate = new Date(eventDate);
                                                            deadlineDate.setUTCDate(deadlineDate.getUTCDate() - daysBeforeEvent);
                                                            return deadlineDate.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
                                                        })()}
                                                        {' '}({invitation.rsvpDaysBeforeEvent || 7} días antes del evento)
                                                    </p>
                                                </div>
                                                <PersonalizedRsvpForm
                                                    guest={guest}
                                                    invitation={invitation}
                                                    onSuccess={() => alert("¡Gracias por confirmar!")}
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <div className="space-y-4">
                                                    <div className="text-6xl">{invitation.confirmacionIcono || "✉️"}</div>
                                                    <h2 className="text-3xl md:text-4xl" style={{ color: 'var(--color-primary)', fontFamily: "var(--font-ornamental)" }}>
                                                        {invitation.confirmacionTitulo || "Confirmá tu asistencia"}
                                                    </h2>
                                                    {invitation.confirmacionFechaLimite && (
                                                        <p className="text-lg text-muted-foreground">
                                                            Fecha límite: {new Date(invitation.confirmacionFechaLimite).toLocaleDateString('es-AR')}
                                                        </p>
                                                    )}
                                                </div>
                                                <RSVPForm invitationId={invitation.id} />
                                            </>
                                        )}
                                    </div>
                                </ScrollReveal>
                            </section>
                        )}

                        {/* Mensaje Final & Footer Dynamic */}
                        <div className="py-20 bg-white text-center">
                            {invitation.mensajeFinalHabilitado && invitation.mensajeFinalTexto && (
                                <ScrollReveal>
                                    <FinalMessage
                                        texto={invitation.mensajeFinalTexto}
                                    />
                                </ScrollReveal>
                            )}

                            {invitation.despedidaHabilitada && (
                                <ScrollReveal>
                                    {/* Example 10: "Te espero" o "Los esperamos" logic could be handled here or inside Farewell */}
                                    {/* Farewell component uses "TE ESPERO" by default or text prop.
                                          We can check invitation type to send different default if needed.
                                          But for now we use what is in `despedidaTexto` */}
                                    <Farewell
                                        nombreEvento={invitation.nombreEvento}
                                        tipo={invitation.tipo}
                                        nombreNovia={invitation.nombreNovia}
                                        nombreNovio={invitation.nombreNovio}
                                        nombreQuinceanera={invitation.nombreQuinceanera}
                                        colorPrincipal={themeConfig.primaryColor || '#c7757f'}
                                        despedidaFoto={invitation.despedidaFoto}
                                    />
                                </ScrollReveal>
                            )}

                            <footer className="mt-12 text-sm text-muted-foreground">
                                <p>Creado con ❤️ usando InvitaDigital</p>
                            </footer>
                        </div>

                    </div>
                </>
            )}
        </InvitationThemeProvider>
    );
}
