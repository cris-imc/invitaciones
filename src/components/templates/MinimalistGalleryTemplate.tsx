"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/invitation/Countdown";
import { PersonalizedRsvpForm } from "@/components/invitation/PersonalizedRsvpForm";
import { CollaborativeAlbumModern } from "@/components/templates/CollaborativeAlbumModern";

interface MinimalistGalleryTemplateProps {
    invitation: any;
    guest?: any;
    isPersonalized?: boolean;
}

export function MinimalistGalleryTemplate({ invitation, guest, isPersonalized = false }: MinimalistGalleryTemplateProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

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
        <div className="min-h-screen bg-white text-black font-sans overflow-x-hidden selection:bg-black selection:text-white">
            {/* Background Music */}
            {invitation.musicaUrl && (
                <>
                    <audio ref={audioRef} loop>
                        <source src={invitation.musicaUrl} type="audio/mpeg" />
                    </audio>
                    <button
                        onClick={togglePlay}
                        className="fixed top-6 right-6 z-50 bg-black text-white p-4 rounded-none hover:bg-neutral-800 transition-all font-bold text-xs uppercase tracking-widest flex items-center gap-2"
                    >
                        {isPlaying ? <>Sound On <Volume2 className="w-4 h-4" /></> : <>Sound Off <VolumeX className="w-4 h-4" /></>}
                    </button>
                </>
            )}

            {/* Hero Section */}
            <section className="relative h-screen grid grid-cols-1 md:grid-cols-2">
                <div className="flex flex-col justify-center px-8 md:px-20 py-20 bg-white order-2 md:order-1 border-r border-black/10">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <p className="text-xs font-bold uppercase tracking-[0.3em] mb-8 text-neutral-400">
                            {new Date(invitation.fechaEvento).toLocaleDateString('es-AR', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' })}
                        </p>
                        <h1 className="text-5xl md:text-8xl font-black mb-8 leading-tight tracking-tighter">
                            {invitation.tipo === 'CASAMIENTO' ? (
                                <>
                                    <span className="block">{invitation.nombreNovia}</span>
                                    <span className="block text-neutral-300">&</span>
                                    <span className="block">{invitation.nombreNovio}</span>
                                </>
                            ) : (
                                invitation.nombreQuinceanera || invitation.nombreEvento
                            )}
                        </h1>
                        <p className="text-xl md:text-2xl font-light text-neutral-600 max-w-md">
                            {invitation.lugarNombre}
                        </p>
                        <div className="mt-12 h-1 w-20 bg-black" />
                    </motion.div>
                </div>

                <div className="relative bg-neutral-100 order-1 md:order-2 overflow-hidden group">
                    {invitation.portadaImagenFondo ? (
                        <img src={invitation.portadaImagenFondo} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 saturate-0 group-hover:saturate-100" />
                    ) : (
                        <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
                            <span className="text-9xl font-black text-white">IMG</span>
                        </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/50 to-transparent md:hidden">
                        <span className="text-white text-xs font-bold uppercase tracking-widest">Scroll Down</span>
                    </div>
                </div>
            </section>

            {/* Minimal Countdown */}
            <section className="py-24 border-b border-black/5">
                <div className="container mx-auto">
                    <div className="grayscale opacity-60 hover:opacity-100 transition-opacity">
                        <Countdown targetDate={new Date(invitation.fechaEvento)} />
                    </div>
                </div>
            </section>

            {/* Grid Layout Details */}
            <section className="container mx-auto px-6 py-32">
                <div className="grid md:grid-cols-3 gap-0 border border-black/10">
                    <div className="p-12 border-b md:border-b-0 md:border-r border-black/10 hover:bg-neutral-50 transition-colors">
                        <span className="text-xs font-bold uppercase tracking-widest text-neutral-400 block mb-4">Location</span>
                        <h3 className="text-3xl font-bold mb-4">{invitation.lugarNombre}</h3>
                        <p className="text-neutral-600 mb-8 font-light">{invitation.direccion}</p>
                        {invitation.mapUrl && (
                            <a href={invitation.mapUrl} target="_blank" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider hover:underline">
                                Map View <ArrowRight className="w-4 h-4" />
                            </a>
                        )}
                    </div>
                    <div className="p-12 border-b md:border-b-0 md:border-r border-black/10 hover:bg-neutral-50 transition-colors">
                        <span className="text-xs font-bold uppercase tracking-widest text-neutral-400 block mb-4">Time</span>
                        <h3 className="text-3xl font-bold mb-4">{invitation.hora || 'TBA'}</h3>
                        <p className="text-neutral-600 font-light">
                            {new Date(invitation.fechaEvento).toLocaleDateString('es-AR', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' })}
                        </p>
                    </div>
                    <div className="p-12 hover:bg-neutral-50 transition-colors">
                        <span className="text-xs font-bold uppercase tracking-widest text-neutral-400 block mb-4">Code</span>
                        <h3 className="text-3xl font-bold mb-4">Formal</h3>
                        <p className="text-neutral-600 font-light">Black Tie Optional. Please dress accordance to the occasion.</p>
                    </div>
                </div>
            </section>

            {/* Album */}
            {invitation.albumCompartidoHabilitado && (
                <section className="py-24 bg-neutral-900 invert">
                    {/* Invert makes the component dark within a "light" design system, creating a cool effect */}
                    <CollaborativeAlbumModern
                        invitationSlug={invitation.slug}
                        fechaEvento={invitation.fechaEvento}
                        horaEvento={invitation.hora || undefined}
                        guestName={guest?.name}
                    />
                </section>
            )}

            {/* RSVP */}
            {isPersonalized && guest && (
                <section className="py-32">
                    <div className="container mx-auto px-6 max-w-xl">
                        <div className="border-l-4 border-black pl-8 mb-12">
                            <h2 className="text-6xl font-black mb-2 tracking-tighter">RSVP</h2>
                            <p className="text-neutral-500 font-light">Please confirm your attendance below.</p>
                        </div>
                        <PersonalizedRsvpForm
                            invitation={invitation}
                            guest={guest}
                            onSuccess={() => { }}
                        />
                    </div>
                </section>
            )}
        </div>
    );
}
