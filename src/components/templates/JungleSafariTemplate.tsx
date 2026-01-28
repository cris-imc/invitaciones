"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX, Trees } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/invitation/Countdown";
import { PersonalizedRsvpForm } from "@/components/invitation/PersonalizedRsvpForm";
import { CollaborativeAlbumModern } from "@/components/templates/CollaborativeAlbumModern";

interface JungleSafariTemplateProps {
    invitation: any;
    guest?: any;
    isPersonalized?: boolean;
}

export function JungleSafariTemplate({ invitation, guest, isPersonalized = false }: JungleSafariTemplateProps) {
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
        <div className="min-h-screen bg-[#F4ECD8] text-[#2C5E1A] font-sans overflow-x-hidden selection:bg-[#FF8C42] selection:text-white">
            {/* Jungle Foliage Background */}
            <div className="fixed inset-0 pointer-events-none opacity-10"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l15 30-15 30L0 30z' fill='%234A7729' fill-opacity='0.4'/%3E%3C/svg%3E")` }}
            />

            {/* Background Music */}
            {invitation.musicaUrl && (
                <>
                    <audio ref={audioRef} loop>
                        <source src={invitation.musicaUrl} type="audio/mpeg" />
                    </audio>
                    <button
                        onClick={togglePlay}
                        className="fixed top-6 right-6 z-50 bg-[#4A7729] text-white p-3 rounded-full hover:bg-[#385C1E] transition-all shadow-lg border-4 border-[#F4ECD8]"
                    >
                        {isPlaying ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                    </button>
                </>
            )}

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center p-6 pb-20 overflow-hidden">
                {/* Vines decorations */}
                <div className="absolute top-0 left-10 w-4 h-64 bg-[#4A7729] rounded-b-full opacity-60" />
                <div className="absolute top-0 right-20 w-4 h-48 bg-[#6B8E23] rounded-b-full opacity-60" />

                <div className="relative z-10 text-center max-w-4xl bg-[#FFF8E7] p-12 rounded-[2rem] shadow-[0_20px_0_rgba(72,119,41,0.2)] border-dashed border-4 border-[#4A7729]">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring" }}
                    >
                        <div className="flex justify-center mb-4 text-[#FF8C42]">
                            <Trees size={48} />
                        </div>
                        <p className="text-[#8B7355] font-bold uppercase tracking-widest mb-4">¡Aventura Salvaje!</p>
                        <h1 className="text-5xl md:text-8xl font-black text-[#2C5E1A] mb-4" style={{ fontFamily: "'Titan One', cursive, sans-serif" }}>
                            {invitation.nombreQuinceanera || invitation.nombreEvento}
                        </h1>
                        <div className="inline-block bg-[#FF8C42] text-white font-bold px-8 py-2 rounded-full transform -rotate-2">
                            Cumple {new Date().getFullYear() - new Date(invitation.fechaEvento).getFullYear() > 0 ? 'Años' : 'Party'}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Countdown */}
            <section className="py-16 bg-[#4A7729] text-[#F4ECD8]">
                <div className="container mx-auto text-center">
                    <h2 className="text-2xl font-bold uppercase tracking-widest mb-8 opacity-80">La Expedición Comienza En</h2>
                    <div className="scale-90">
                        <Countdown targetDate={new Date(invitation.fechaEvento)} />
                    </div>
                </div>
            </section>

            {/* Map & Details */}
            <section className="py-24 container mx-auto px-6">
                <div className="grid md:grid-cols-2 gap-12">
                    <div className="bg-[#FFF8E7] p-8 rounded-[2rem] border-4 border-[#8B7355] shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 bg-[#FF8C42] text-white font-bold rounded-bl-2xl">MAPA</div>
                        <h3 className="text-3xl font-black text-[#8B7355] mb-4 mt-4">Campamento Base</h3>
                        <p className="text-xl font-bold text-[#2C5E1A] mb-2">{invitation.lugarNombre}</p>
                        <p className="text-[#8B7355] mb-6">{invitation.direccion}</p>
                        {invitation.mapUrl && (
                            <Button onClick={() => window.open(invitation.mapUrl, '_blank')} className="w-full bg-[#4A7729] hover:bg-[#385C1E] text-white font-bold py-6 rounded-xl">
                                Ver Ubicación en Google Maps
                            </Button>
                        )}
                    </div>

                    <div className="bg-[#FFF8E7] p-8 rounded-[2rem] border-4 border-[#8B7355] shadow-lg flex items-center justify-center">
                        <div className="text-center">
                            <h3 className="text-7xl font-black text-[#FF8C42] mb-2">
                                {new Date(invitation.fechaEvento).getDate()}
                            </h3>
                            <div className="text-2xl font-bold text-[#8B7355] uppercase">
                                {new Date(invitation.fechaEvento).toLocaleDateString('es-AR', { month: 'long', timeZone: 'UTC' })}
                            </div>
                            <div className="mt-4 text-xl font-bold text-[#4A7729] bg-[#F4ECD8] px-6 py-2 rounded-full inline-block">
                                {invitation.hora} HRS
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Album */}
            {invitation.albumCompartidoHabilitado && (
                <section className="py-20 bg-[#2C5E1A]/10">
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
                <section className="py-24 bg-[#FF8C42]">
                    <div className="container mx-auto px-6 max-w-xl">
                        <div className="bg-[#FFF8E7] rounded-[2rem] p-8 shadow-[0_20px_0_rgba(0,0,0,0.1)]">
                            <h2 className="text-4xl font-black text-[#8B7355] text-center mb-8">Confirmar Asistencia</h2>
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
