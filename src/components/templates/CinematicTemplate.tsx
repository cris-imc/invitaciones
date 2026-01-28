"use client";

import { useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Volume2, VolumeX, Play, Film, MapPin, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/invitation/Countdown";
import { PersonalizedRsvpForm } from "@/components/invitation/PersonalizedRsvpForm";
import { CollaborativeAlbumModern } from "@/components/templates/CollaborativeAlbumModern";
import { FadeInUp } from "@/components/animations/ModernAnimations";
import { GlassCard } from "@/components/modern/GlassComponents";
import { MarqueeGallery } from "@/components/animations/MarqueeGallery";

interface CinematicTemplateProps {
    invitation: any;
    guest?: any;
    isPersonalized?: boolean;
}

export function CinematicTemplate({ invitation, guest, isPersonalized = false }: CinematicTemplateProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const { scrollY } = useScroll();

    const opacityHero = useTransform(scrollY, [0, 500], [1, 0]);
    const scaleHero = useTransform(scrollY, [0, 500], [1, 1.1]);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
            {/* Background Music */}
            {invitation.musicaUrl && (
                <>
                    <audio ref={audioRef} loop>
                        <source src={invitation.musicaUrl} type="audio/mpeg" />
                    </audio>
                    <button
                        onClick={togglePlay}
                        className="fixed top-6 right-6 z-50 bg-white/10 backdrop-blur-md p-3 rounded-full hover:bg-white/20 transition-all"
                    >
                        {isPlaying ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                    </button>
                </>
            )}

            {/* Cinematic Hero Section */}
            <motion.section
                style={{ opacity: opacityHero, scale: scaleHero }}
                className="relative h-screen flex items-center justify-center overflow-hidden"
            >
                {/* Background Video/Image */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-black/40 z-10" />
                    {invitation.portadaImagenFondo ? (
                        <img
                            src={invitation.portadaImagenFondo}
                            alt="Cover"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-neutral-900" />
                    )}
                </div>

                {/* Content */}
                <div className="relative z-20 text-center space-y-8 px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.5 }}
                    >
                        <p className="text-sm md:text-base tracking-[0.5em] uppercase text-white/80 mb-4">
                            {invitation.tipo === 'CASAMIENTO' ? 'THE WEDDING OF' : 'CELEBRATING'}
                        </p>
                        <h1 className="text-6xl md:text-9xl font-bold tracking-tighter mix-blend-overlay">
                            {invitation.tipo === 'CASAMIENTO'
                                ? `${invitation.nombreNovia} & ${invitation.nombreNovio}`
                                : invitation.nombreQuinceanera || invitation.nombreEvento}
                        </h1>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 1.5 }}
                        className="flex items-center justify-center gap-6 text-sm md:text-lg tracking-widest"
                    >
                        <span>{new Date(invitation.fechaEvento).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' })}</span>
                        <span>•</span>
                        <span>{invitation.lugarNombre}</span>
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2, duration: 1 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2"
                >
                    <div className="w-[1px] h-24 bg-gradient-to-b from-white to-transparent" />
                </motion.div>
            </motion.section>

            {/* Content Sections */}
            <div className="relative z-10 bg-black">
                {/* Countdown */}
                <section className="py-32 flex justify-center">
                    <div className="scale-75 md:scale-100 opacity-80">
                        <Countdown targetDate={new Date(invitation.fechaEvento)} />
                    </div>
                </section>

                {/* Location */}
                <section className="py-32 container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                        <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white/90">The <br />Location</h2>
                        <div className="space-y-4 text-neutral-400 font-light">
                            <p className="text-xl text-white">{invitation.lugarNombre}</p>
                            <p>{invitation.direccion}</p>
                            {invitation.mapUrl && (
                                <Button
                                    variant="outline"
                                    className="border-white/20 hover:bg-white hover:text-black text-white rounded-none mt-4 transition-all duration-500 uppercase tracking-widest text-xs h-12 px-8"
                                    onClick={() => window.open(invitation.mapUrl, '_blank')}
                                >
                                    Get Directions
                                </Button>
                            )}
                        </div>
                    </div>
                    <div className="aspect-[4/5] bg-neutral-900 rounded-sm overflow-hidden relative group">
                        {/* Placeholder or map image */}
                        <div className="absolute inset-0 bg-neutral-800 animate-pulse group-hover:scale-105 transition-transform duration-700" />
                    </div>
                </section>

                {/* RSVP */}
                {isPersonalized && guest && (
                    <section className="py-32 bg-white text-black">
                        <div className="container mx-auto px-6 max-w-2xl text-center">
                            <h2 className="text-4xl md:text-5xl font-bold mb-12 tracking-tight">RSVP</h2>
                            <PersonalizedRsvpForm
                                invitation={invitation}
                                guest={guest}
                                onSuccess={() => { }}
                            />
                        </div>
                    </section>
                )}

                {/* Collaborative Album */}
                {invitation.albumCompartidoHabilitado && (
                    <div className="bg-neutral-900 py-20">
                        <CollaborativeAlbumModern
                            invitationSlug={invitation.slug}
                            fechaEvento={invitation.fechaEvento}
                            horaEvento={invitation.hora || undefined}
                            guestName={guest?.name}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
