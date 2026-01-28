"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX, MoveUpRight, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/invitation/Countdown";
import { PersonalizedRsvpForm } from "@/components/invitation/PersonalizedRsvpForm";
import { CollaborativeAlbumModern } from "@/components/templates/CollaborativeAlbumModern";

interface SpaceExplorerTemplateProps {
    invitation: any;
    guest?: any;
    isPersonalized?: boolean;
}

export function SpaceExplorerTemplate({ invitation, guest, isPersonalized = false }: SpaceExplorerTemplateProps) {
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
        <div className="min-h-screen bg-[#0B1026] text-white font-sans overflow-x-hidden selection:bg-[#4B0082] selection:text-white">
            {/* Stars Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                {[...Array(50)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute bg-white rounded-full animate-pulse"
                        style={{
                            width: Math.random() * 3 + 'px',
                            height: Math.random() * 3 + 'px',
                            left: Math.random() * 100 + '%',
                            top: Math.random() * 100 + '%',
                            opacity: Math.random()
                        }}
                    />
                ))}
            </div>

            {/* Background Music */}
            {invitation.musicaUrl && (
                <>
                    <audio ref={audioRef} loop>
                        <source src={invitation.musicaUrl} type="audio/mpeg" />
                    </audio>
                    <button
                        onClick={togglePlay}
                        className="fixed top-6 right-6 z-50 bg-[#4B0082]/80 backdrop-blur-md border border-[#FFD700] p-3 rounded-full hover:bg-[#FFD700] hover:text-[#4B0082] transition-all shadow-lg"
                    >
                        {isPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </button>
                </>
            )}

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center p-6 pb-20 overflow-hidden">
                {/* Planet Decoration */}
                <div className="absolute top-20 right-[-100px] w-64 h-64 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FF4500] blur-sm opacity-80" />
                <div className="absolute bottom-20 left-[-100px] w-96 h-96 rounded-full bg-gradient-to-tr from-[#4B0082] to-[#0000FF] blur-xl opacity-60" />

                <div className="relative z-10 text-center max-w-4xl bg-[#0B1026]/80 backdrop-blur-md p-10 rounded-3xl border border-[#4B0082] shadow-[0_0_50px_rgba(75,0,130,0.5)]">
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, type: "spring" }}
                    >
                        <div className="flex justify-center mb-6 text-[#FFD700]">
                            <Rocket size={64} className="animate-bounce" />
                        </div>
                        <p className="text-[#FFD700] font-mono uppercase tracking-[0.3em] mb-4">Misión Espacial</p>
                        <h1 className="text-5xl md:text-8xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#FFFFFF] via-[#4B0082] to-[#FFD700]" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                            {invitation.nombreQuinceanera || invitation.nombreEvento}
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-300 font-light mb-8">
                            ¡Prepárate para el despegue!
                        </p>
                        <div className="flex items-center justify-center gap-2 text-[#FFD700] font-mono">
                            <span>COORDENADAS:</span>
                            <span>{new Date(invitation.fechaEvento).getDate()}.{new Date(invitation.fechaEvento).getMonth() + 1}.{new Date(invitation.fechaEvento).getFullYear()}</span>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Countdown */}
            <section className="py-20 bg-gradient-to-r from-[#4B0082] to-[#0B1026] text-white border-y border-[#FFD700]/30">
                <div className="container mx-auto text-center">
                    <h2 className="text-2xl font-mono text-[#FFD700] mb-8 animate-pulse">T-MINUS</h2>
                    <div className="grayscale-0">
                        <Countdown targetDate={new Date(invitation.fechaEvento)} />
                    </div>
                </div>
            </section>

            {/* Mission Details */}
            <section className="py-24 container mx-auto px-6">
                <div className="grid md:grid-cols-2 gap-12">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-[#1A1F3C] p-8 rounded-2xl border border-[#FFD700]/50 shadow-lg relative group overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-[#4B0082]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <h3 className="text-3xl font-bold text-[#FFD700] mb-6 font-mono">BASE DE LANZAMIENTO</h3>
                        <p className="text-2xl font-bold mb-2">{invitation.lugarNombre}</p>
                        <p className="text-gray-400 mb-8 font-mono">{invitation.direccion}</p>
                        {invitation.mapUrl && (
                            <Button onClick={() => window.open(invitation.mapUrl, '_blank')} className="w-full bg-[#FFD700] hover:bg-[#F0C000] text-[#0B1026] font-bold py-6 font-mono">
                                SISTEMA DE NAVEGACIÓN <MoveUpRight className="ml-2 w-4 h-4" />
                            </Button>
                        )}
                    </motion.div>

                    <div className="bg-[#1A1F3C] p-2 rounded-2xl border border-[#FFD700]/50 shadow-lg h-96 flex items-center justify-center overflow-hidden">
                        {invitation.portadaImagenFondo ? (
                            <img src={invitation.portadaImagenFondo} className="w-full h-full object-cover rounded-xl opacity-80" />
                        ) : (
                            <div className="text-center font-mono text-[#FFD700]/50">
                                <Rocket size={100} className="mx-auto mb-4 opacity-50" />
                                <p>[IMAGEN DE TRIPULACIÓN NO ENCONTRADA]</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Album */}
            {invitation.albumCompartidoHabilitado && (
                <section className="py-20 bg-[#000000]/50">
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
                <section className="py-24">
                    <div className="container mx-auto px-6 max-w-xl">
                        <div className="bg-[#4B0082]/90 backdrop-blur-xl rounded-3xl p-8 border-2 border-[#FFD700] shadow-[0_0_100px_rgba(75,0,130,0.6)]">
                            <h2 className="text-3xl font-black text-[#FFD700] text-center mb-8 font-mono">CONFIRMAR MISION</h2>
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
