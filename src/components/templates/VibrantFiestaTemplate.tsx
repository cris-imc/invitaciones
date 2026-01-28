"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/invitation/Countdown";
import { PersonalizedRsvpForm } from "@/components/invitation/PersonalizedRsvpForm";
import { CollaborativeAlbumModern } from "@/components/templates/CollaborativeAlbumModern";

interface VibrantFiestaTemplateProps {
    invitation: any;
    guest?: any;
    isPersonalized?: boolean;
}

export function VibrantFiestaTemplate({ invitation, guest, isPersonalized = false }: VibrantFiestaTemplateProps) {
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
        <div className="min-h-screen bg-[#FFFF00] text-black font-sans overflow-x-hidden selection:bg-[#0000FF] selection:text-white">
            {/* Confetti Background (CSS Pattern) */}
            <div className="fixed inset-0 opacity-10 pointer-events-none" style={{
                backgroundImage: 'radial-gradient(circle, #0000FF 2px, transparent 2.5px), radial-gradient(circle, #FF0000 2px, transparent 2.5px)',
                backgroundSize: '30px 30px',
                backgroundPosition: '0 0, 15px 15px'
            }} />

            {/* Background Music */}
            {invitation.musicaUrl && (
                <>
                    <audio ref={audioRef} loop>
                        <source src={invitation.musicaUrl} type="audio/mpeg" />
                    </audio>
                    <button
                        onClick={togglePlay}
                        className="fixed top-6 right-6 z-50 bg-black text-white p-3 rotate-3 hover:rotate-0 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
                    >
                        {isPlaying ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                    </button>
                </>
            )}

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center p-6 bg-[#FFFF00]">
                <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -100, rotate: -10 }}
                        animate={{ opacity: 1, x: 0, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 100 }}
                        className="relative z-10"
                    >
                        <div className="bg-[#FF0000] text-white inline-block px-4 py-1 text-sm font-bold uppercase tracking-wider mb-6 -rotate-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            {invitation.tipo === 'CASAMIENTO' ? 'Wedding Party' : 'Epic Celebration'}
                        </div>
                        <h1 className="text-6xl md:text-9xl font-black uppercase leading-[0.9] text-black drop-shadow-sm">
                            {invitation.tipo === 'CASAMIENTO' ? (
                                <>
                                    <span className="block text-[#0000FF]">{invitation.nombreNovia}</span>
                                    <span className="block text-4xl my-2">&</span>
                                    <span className="block text-[#FF0000]">{invitation.nombreNovio}</span>
                                </>
                            ) : (
                                invitation.nombreQuinceanera || invitation.nombreEvento
                            )}
                        </h1>
                        <div className="mt-8 text-2xl font-bold bg-white inline-block px-6 py-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-1">
                            {new Date(invitation.fechaEvento).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', timeZone: 'UTC' })}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.2 }}
                        className="relative"
                    >
                        <div className="aspect-square bg-[#0000FF] rounded-full overflow-hidden border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                            {invitation.portadaImagenFondo ? (
                                <img src={invitation.portadaImagenFondo} className="w-full h-full object-cover mix-blend-luminosity hover:mix-blend-normal transition-all duration-300" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#00F3FF]">
                                    <span className="text-9xl">🎉</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Countdown */}
            <section className="py-20 bg-[#FF0000] text-white border-y-4 border-black">
                <div className="container mx-auto transform -rotate-1">
                    <Countdown targetDate={new Date(invitation.fechaEvento)} />
                </div>
            </section>

            {/* Info Cards (Color Blocking) */}
            <section className="py-24 container mx-auto px-6">
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-[#0000FF] p-8 text-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 transition-transform">
                        <h3 className="text-4xl font-black mb-6 uppercase italic">The Place</h3>
                        <p className="text-2xl font-bold mb-2">{invitation.lugarNombre}</p>
                        <p className="text-lg opacity-90">{invitation.direccion}</p>
                        {invitation.mapUrl && (
                            <Button onClick={() => window.open(invitation.mapUrl, '_blank')} className="mt-6 bg-[#FFFF00] text-black hover:bg-white border-2 border-black font-bold uppercase">
                                Check Map
                            </Button>
                        )}
                    </div>
                    <div className="bg-[#00FF00] p-8 text-black border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 transition-transform">
                        <h3 className="text-4xl font-black mb-6 uppercase italic">The Time</h3>
                        <p className="text-2xl font-bold mb-2">{invitation.hora} HRS</p>
                        <p className="text-lg">{new Date(invitation.fechaEvento).toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</p>
                    </div>
                </div>
            </section>

            {/* Album */}
            {invitation.albumCompartidoHabilitado && (
                <section className="bg-black py-20 border-t-4 border-[#0000FF]">
                    <div className="invert grayscale contrast-125">
                        <CollaborativeAlbumModern
                            invitationSlug={invitation.slug}
                            fechaEvento={invitation.fechaEvento}
                            horaEvento={invitation.hora || undefined}
                            guestName={guest?.name}
                        />
                    </div>
                </section>
            )}

            {/* RSVP */}
            {isPersonalized && guest && (
                <section className="py-24 bg-[#FF00FF] border-t-4 border-black">
                    <div className="container mx-auto px-6 max-w-xl text-center">
                        <h2 className="text-6xl font-black mb-8 text-white stroke-black drop-shadow-[4px_4px_0_#000]">RSVP NOW!</h2>
                        <div className="bg-white p-4 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                            <PersonalizedRsvpForm
                                invitation={invitation}
                                guest={guest}
                                onSuccess={() => { }}
                            />
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
