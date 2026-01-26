"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Calendar, Clock, MapPin, Music, Heart, Camera, Share2, ChevronDown, Copy, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarqueeGallery } from "@/components/animations/MarqueeGallery";
import { useToast } from "@/components/ui/Toast";
import { PersonalizedRsvpForm } from "@/components/invitation/PersonalizedRsvpForm";
import { CollaborativeAlbumModern } from "./CollaborativeAlbumModern";

interface ModernInvitationProps {
    invitation: any;
    guest?: any;
    isPersonalized?: boolean;
}

export function ModernInvitationTemplate({ invitation, guest, isPersonalized = false }: ModernInvitationProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // Parallax values
    const y1 = useTransform(smoothProgress, [0, 1], [0, -300]);
    const y2 = useTransform(smoothProgress, [0, 1], [0, -150]);
    const opacity1 = useTransform(smoothProgress, [0, 0.3], [1, 0]);
    const scale = useTransform(smoothProgress, [0, 0.5], [1, 0.8]);

    // Image fade: low opacity -> high opacity (centered) -> fade out completely
    const imageOpacity = useTransform(smoothProgress, [0.12, 0.18, 0.25], [0.1, 0.9, 0]);
    const imageY = useTransform(smoothProgress, [0.1, 0.3], [0, -100]);

    const toggleMusic = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const getNombreCompleto = () => {
        if (invitation.tipo === 'CASAMIENTO') {
            return `${invitation.nombreNovia} & ${invitation.nombreNovio}`;
        }
        return invitation.nombreQuinceanera || invitation.nombreEvento;
    };

    const getTipoEvento = () => {
        switch (invitation.tipo) {
            case 'CASAMIENTO': return 'Nuestra Boda';
            case 'QUINCE': return 'Mis Quince Años';
            case 'CUMPLEAÑOS': return 'Mi Cumpleaños';
            default: return invitation.nombreEvento;
        }
    };

    // Timeline events example
    const timelineEvents = [
        { time: "19:00", title: "Ceremonia", icon: Heart },
        { time: "20:30", title: "Recepción", icon: Music },
        { time: "21:00", title: "Cena", icon: Calendar },
        { time: "23:00", title: "Fiesta", icon: Music },
    ];

    // Get gallery photos
    const galleryPhotos = invitation.galeriaPrincipalFotos
        ? JSON.parse(invitation.galeriaPrincipalFotos)
        : [];

    return (
        <div ref={containerRef} className="relative bg-black text-white overflow-hidden">
            {/* Music Control */}
            {invitation.musicaUrl && (
                <>
                    <audio ref={audioRef} src={invitation.musicaUrl} loop />
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2 }}
                        onClick={toggleMusic}
                        className="fixed top-6 right-6 z-50 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-white/20 transition-all"
                    >
                        <Music className={`w-5 h-5 ${isPlaying ? 'animate-pulse' : ''}`} />
                    </motion.button>
                </>
            )}

            {/* Progress Indicator */}
            <motion.div
                className="fixed left-0 top-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 z-50"
                style={{ scaleX: scrollYProgress, transformOrigin: "0%" }}
            />

            {/* HERO SECTION */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                {/* Background Image with Parallax */}
                <motion.div
                    style={{ y: y1, scale }}
                    className="absolute inset-0"
                >
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage: invitation.portadaImagenFondo
                                ? `url(${invitation.portadaImagenFondo})`
                                : 'url(https://images.unsplash.com/photo-1519741497674-611481863552?w=1200)',
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black" />
                </motion.div>

                {/* Hero Content */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    style={{ y: y2, opacity: opacity1 }}
                    className="relative z-10 text-center px-6"
                >
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="text-sm md:text-base tracking-[0.3em] uppercase mb-6 text-white/70"
                    >
                        {getTipoEvento()}
                    </motion.p>

                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1, duration: 0.8 }}
                        className="text-6xl md:text-8xl lg:text-9xl font-thin mb-8 tracking-tight"
                        style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                        {getNombreCompleto()}
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.3 }}
                        className="text-xl md:text-2xl font-light tracking-wide text-white/90"
                    >
                        {new Date(invitation.fechaEvento).toLocaleDateString('es-AR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            timeZone: 'UTC'
                        })}
                    </motion.div>
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center"
                >
                    <span className="text-xs tracking-widest mb-4 text-white/50">SCROLL</span>
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                        <ChevronDown className="w-6 h-6 text-white/50" />
                    </motion.div>
                </motion.div>
            </section>

            {/* INVITATION TEXT SECTION */}
            <section className="relative min-h-screen flex items-center py-32 bg-white text-black overflow-hidden">
                <div className="container mx-auto px-6 max-w-6xl relative z-10">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8 }}
                            className="space-y-6"
                        >
                            <h2 className="text-5xl md:text-6xl font-thin leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                Celebremos juntos
                            </h2>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                Con gran alegría te invitamos a ser parte de este día tan especial.
                                Tu presencia hará que este momento sea aún más memorable.
                            </p>
                            <div className="pt-4">
                                <p className="text-sm tracking-widest text-gray-500 mb-2">NOS VEMOS EN</p>
                                <CountdownTimer targetDate={invitation.fechaEvento} />
                            </div>
                        </motion.div>
                        <div className="hidden md:block" />
                    </div>
                </div>

                {/* Absolute Image - Half Screen */}
                <motion.div
                    style={{ opacity: imageOpacity, y: imageY }}
                    className="hidden md:block absolute top-0 right-0 w-1/2 h-full pointer-events-none"
                >
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage: invitation.imagenCelebremosJuntos
                                ? `url(${invitation.imagenCelebremosJuntos})`
                                : galleryPhotos.length > 0
                                    ? `url(${galleryPhotos[0]})`
                                    : 'url(https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=600)',
                        }}
                    />
                </motion.div>
            </section>

            {/* EVENT DETAILS SECTION */}
            <section className="relative min-h-screen bg-gradient-to-b from-gray-50 to-white text-black py-32">
                <div className="container mx-auto px-6 max-w-6xl">
                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-5xl md:text-7xl font-thin text-center mb-20"
                        style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                        Detalles del Evento
                    </motion.h2>

                    <div className="grid md:grid-cols-3 gap-12">
                        {/* Date */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-center group"
                        >
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-black flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <Calendar className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-sm tracking-[0.3em] uppercase mb-3 text-gray-500">Fecha</h3>
                            <p className="text-2xl font-light">
                                {new Date(invitation.fechaEvento).toLocaleDateString('es-AR', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                    timeZone: 'UTC'
                                })}
                            </p>
                        </motion.div>

                        {/* Time */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-center group"
                        >
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-black flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <Clock className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-sm tracking-[0.3em] uppercase mb-3 text-gray-500">Hora</h3>
                            <p className="text-2xl font-light">{invitation.hora || '20:00 hs'}</p>
                        </motion.div>

                        {/* Location */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="text-center group"
                        >
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-black flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <MapPin className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-sm tracking-[0.3em] uppercase mb-3 text-gray-500">Lugar</h3>
                            <p className="text-2xl font-light mb-2">{invitation.lugarNombre}</p>
                            <p className="text-sm text-gray-500">{invitation.direccion}</p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* TIMELINE SECTION */}
            <section className="relative min-h-screen bg-black text-white py-32">
                <div className="container mx-auto px-6 max-w-4xl">
                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-5xl md:text-7xl font-thin text-center mb-20"
                        style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                        Cronograma
                    </motion.h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {timelineEvents.map((event, index) => {
                            const Icon = event.icon;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex flex-col items-center text-center p-8 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all"
                                >
                                    <div className="w-16 h-16 mb-4 rounded-full bg-white/10 flex items-center justify-center">
                                        <Icon className="w-8 h-8" />
                                    </div>
                                    <div className="text-3xl font-thin mb-2">{event.time}</div>
                                    <div className="text-xl font-light">{event.title}</div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* GALLERY SECTION */}
            <section className="relative min-h-screen bg-white text-black py-32">
                <div className="container mx-auto px-6 max-w-7xl">
                    {galleryPhotos.length > 0 && (
                        <MarqueeGallery images={galleryPhotos} speed={40} />
                    )}
                </div>
            </section>

            {/* COLLABORATIVE ALBUM SECTION */}
            {invitation.albumCompartidoHabilitado && (
                <CollaborativeAlbumModern
                    invitationSlug={invitation.slug}
                    fechaEvento={invitation.fechaEvento}
                    horaEvento={invitation.hora || undefined}
                    guestName={guest?.name}
                />
            )}

            {/* BANK DETAILS SECTION */}
            {invitation.regaloHabilitado && invitation.regaloMostrarDatos && (
                <BankDetailsModern
                    titulo={invitation.regaloTitulo || "Regalo"}
                    mensaje={invitation.regaloMensaje}
                    mostrarDatos={invitation.regaloMostrarDatos}
                    banco={invitation.regaloBanco}
                    cbu={invitation.regaloCbu}
                    alias={invitation.regaloAlias}
                    titular={invitation.regaloTitular}
                />
            )}

            {/* RSVP SECTION */}
            {isPersonalized && guest ? (
                <section className="relative min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 text-black flex items-center py-32">
                    <div className="container mx-auto px-6 max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="space-y-8"
                        >
                            <div className="text-center mb-8">
                                <h2 className="text-5xl md:text-7xl font-thin mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                    Hola, {guest.name}
                                </h2>
                                <p className="text-xl text-gray-600 leading-relaxed">
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
                            <PersonalizedRsvpForm guest={guest} invitation={invitation} onSuccess={() => { }} />
                        </motion.div>
                    </div>
                </section>
            ) : (
                <section className="relative min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 text-black flex items-center py-32">
                    <div className="container mx-auto px-6 max-w-2xl text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-5xl md:text-7xl font-thin mb-8" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                Confirmá tu asistencia
                            </h2>
                            <p className="text-xl text-gray-600 mb-12 leading-relaxed">
                                Esperamos contar con tu presencia. Por favor confirmanos antes del{' '}
                                {invitation.rsvpDeadline ? new Date(invitation.rsvpDeadline).toLocaleDateString('es-AR') : '10 de Marzo'}
                            </p>
                            <Button
                                size="lg"
                                className="px-12 py-8 text-lg rounded-full bg-black text-white hover:bg-gray-800 transition-all hover:scale-105"
                            >
                                Confirmar Asistencia
                            </Button>
                        </motion.div>
                    </div>
                </section>
            )}

            {/* FAREWELL SECTION */}
            <section className="relative min-h-screen bg-gradient-to-b from-white to-gray-50 text-black flex items-center py-32">
                <div className="container mx-auto px-6 max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center space-y-8"
                    >
                        <div className="text-6xl mb-8">✨</div>
                        <h2 className="text-5xl md:text-7xl font-thin mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                            {invitation.tipo === 'CASAMIENTO' ? 'Te esperamos' : 'Te espero'}
                        </h2>
                        <p className="text-3xl md:text-4xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                            {invitation.tipo === 'CASAMIENTO'
                                ? `${invitation.nombreNovia} & ${invitation.nombreNovio}`
                                : invitation.nombreQuinceanera || invitation.nombreEvento
                            }
                        </p>
                        <div className="flex items-center justify-center gap-4 pt-8">
                            <div className="h-px w-24 bg-black/20" />
                            <div className="w-2 h-2 rounded-full bg-black" />
                            <div className="h-px w-24 bg-black/20" />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* FOOTER */}
            <section className="relative bg-black text-white py-20">
                <div className="container mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="space-y-6"
                    >
                        <div className="flex justify-center gap-6">
                            <button className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
                                <Share2 className="w-5 h-5" />
                            </button>
                            <button className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
                                <Camera className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-sm text-white/50 tracking-widest">#MisQuinceAños</p>
                        <p className="text-xs text-white/30">© 2026 · Diseñado con amor</p>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}

// Countdown Timer Component
function CountdownTimer({ targetDate }: { targetDate: Date }) {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = new Date(targetDate).getTime() - now;

            if (distance > 0) {
                setTimeLeft({
                    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((distance % (1000 * 60)) / 1000)
                });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [targetDate]);

    return (
        <div className="flex gap-6">
            {Object.entries(timeLeft).map(([unit, value]) => (
                <div key={unit} className="text-center">
                    <div className="text-4xl font-thin tabular-nums">{String(value).padStart(2, '0')}</div>
                    <div className="text-xs tracking-wider text-gray-400 uppercase mt-1">{unit}</div>
                </div>
            ))}
        </div>
    );
}

// Bank Details Component
function BankDetailsModern({
    titulo,
    mensaje,
    mostrarDatos,
    banco,
    cbu,
    alias,
    titular
}: {
    titulo?: string;
    mensaje?: string;
    mostrarDatos: boolean;
    banco?: string;
    cbu?: string;
    alias?: string;
    titular?: string;
}) {
    const { showToast } = useToast();
    const [isRevealed, setIsRevealed] = useState(false);

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        showToast(`${label} copiado`, "success");
    };

    return (
        <section className="relative min-h-screen bg-black text-white flex items-center py-32">
            <div className="container mx-auto px-6 max-w-3xl">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center space-y-8"
                >
                    <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                        <Gift className="w-10 h-10" />
                    </div>

                    <h2 className="text-5xl md:text-7xl font-thin mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                        {titulo || "Regalo"}
                    </h2>

                    {mensaje && (
                        <p className="text-xl text-white/70 leading-relaxed max-w-2xl mx-auto">
                            {mensaje}
                        </p>
                    )}

                    {mostrarDatos && (
                        <div className="mt-12 space-y-6">
                            <Button
                                onClick={() => setIsRevealed(!isRevealed)}
                                size="lg"
                                className="px-8 py-6 text-base rounded-full bg-white text-black hover:bg-gray-200 transition-all hover:scale-105"
                            >
                                {isRevealed ? "Ocultar datos" : "Ver datos bancarios"}
                            </Button>

                            {isRevealed && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-8 p-8 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 space-y-6"
                                >
                                    {banco && (
                                        <div className="text-left">
                                            <p className="text-sm text-white/50 uppercase tracking-widest mb-2">Banco</p>
                                            <p className="text-xl font-light">{banco}</p>
                                        </div>
                                    )}

                                    {cbu && (
                                        <div className="text-left group">
                                            <p className="text-sm text-white/50 uppercase tracking-widest mb-2">CBU / CVU</p>
                                            <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all">
                                                <p className="text-lg font-mono break-all">{cbu}</p>
                                                <button
                                                    onClick={() => copyToClipboard(cbu, "CBU")}
                                                    className="p-2 rounded-full hover:bg-white/10 transition-all"
                                                >
                                                    <Copy className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {alias && (
                                        <div className="text-left group">
                                            <p className="text-sm text-white/50 uppercase tracking-widest mb-2">Alias</p>
                                            <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all">
                                                <p className="text-lg font-light">{alias}</p>
                                                <button
                                                    onClick={() => copyToClipboard(alias, "Alias")}
                                                    className="p-2 rounded-full hover:bg-white/10 transition-all"
                                                >
                                                    <Copy className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {titular && (
                                        <div className="pt-4 border-t border-white/10">
                                            <p className="text-sm text-white/50">Titular: <span className="font-light text-white">{titular}</span></p>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </div>
                    )}
                </motion.div>
            </div>
        </section>
    );
}
