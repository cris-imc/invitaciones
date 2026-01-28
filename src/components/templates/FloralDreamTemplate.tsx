"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX, Flower2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/invitation/Countdown";
import { PersonalizedRsvpForm } from "@/components/invitation/PersonalizedRsvpForm";
import { CollaborativeAlbumModern } from "@/components/templates/CollaborativeAlbumModern";

interface FloralDreamTemplateProps {
    invitation: any;
    guest?: any;
    isPersonalized?: boolean;
}

export function FloralDreamTemplate({ invitation, guest, isPersonalized = false }: FloralDreamTemplateProps) {
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
        <div className="min-h-screen bg-[#FFF0F5] text-[#5D4037] font-serif overflow-x-hidden">
            {/* Floating Petals Effect (CSS Animation) */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                {[...Array(10)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute bg-rose-300 rounded-full opacity-30"
                        style={{
                            width: Math.random() * 10 + 5 + 'px',
                            height: Math.random() * 10 + 5 + 'px',
                            left: Math.random() * 100 + '%',
                            top: -20 + 'px',
                            animation: `fall ${Math.random() * 10 + 10}s linear infinite`,
                            animationDelay: Math.random() * 10 + 's'
                        }}
                    />
                ))}
            </div>
            <style jsx>{`
                @keyframes fall {
                    to { transform: translateY(110vh) rotate(360deg); }
                }
             `}</style>

            {/* Background Music */}
            {invitation.musicaUrl && (
                <>
                    <audio ref={audioRef} loop>
                        <source src={invitation.musicaUrl} type="audio/mpeg" />
                    </audio>
                    <button
                        onClick={togglePlay}
                        className="fixed top-6 right-6 z-50 bg-white/80 backdrop-blur-md text-rose-500 p-3 rounded-full hover:bg-rose-100 transition-all shadow-md"
                    >
                        {isPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </button>
                </>
            )}

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center p-6 text-center">
                {/* Floral Frame Placeholder */}
                <div className="absolute inset-4 md:inset-10 border-[1px] border-rose-200 rounded-[3rem] pointer-events-none" />
                <div className="absolute inset-6 md:inset-12 border-[1px] border-rose-200 rounded-[2.5rem] pointer-events-none" />

                <div className="relative z-10 max-w-3xl space-y-6 bg-white/60 p-12 rounded-full shadow-xl backdrop-blur-sm">
                    <div className="flex justify-center text-rose-400">
                        <Flower2 className="w-10 h-10" />
                    </div>
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        className="text-6xl md:text-8xl text-rose-500"
                        style={{ fontFamily: "'Great Vibes', cursive" }}
                    >
                        {invitation.tipo === 'CASAMIENTO' ? invitation.nombreNovia : (invitation.nombreQuinceanera || invitation.nombreEvento)}
                        {invitation.tipo === 'CASAMIENTO' && <span className="block text-4xl text-[#5D4037] mt-2">& {invitation.nombreNovio}</span>}
                    </motion.h1>

                    <div className="text-xl md:text-2xl text-[#8D6E63] italic">
                        <p>{new Date(invitation.fechaEvento).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })}</p>
                        <p className="font-bold text-rose-400">{new Date(invitation.fechaEvento).getFullYear()}</p>
                    </div>
                </div>
            </section>

            {/* Description Quote */}
            <section className="py-20 bg-rose-50 text-center px-6">
                <p className="max-w-2xl mx-auto text-2xl italic text-rose-900 leading-relaxed font-light">
                    "Los momentos más hermosos de la vida no son solo cosas, son personas, momentos y sentimientos que guardamos en nuestra memoria."
                </p>
            </section>

            {/* Countdown */}
            <section className="py-16">
                <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-lg p-8 border border-rose-100">
                    <Countdown targetDate={new Date(invitation.fechaEvento)} />
                </div>
            </section>

            {/* Details Grid */}
            <section className="py-20 container mx-auto px-6">
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-tr-[3rem] rounded-bl-[3rem] shadow-md border-l-4 border-rose-300">
                        <h3 className="text-2xl font-bold text-rose-500 mb-4 font-sans">Ceremonia Religiosa</h3>
                        <p className="text-lg mb-2">{invitation.lugarNombre}</p>
                        <p className="text-gray-500 mb-6">{invitation.direccion}</p>
                        {invitation.mapUrl && (
                            <Button onClick={() => window.open(invitation.mapUrl, '_blank')} variant="outline" className="rounded-full border-rose-300 text-rose-500 hover:bg-rose-50">
                                Ver Ubicación
                            </Button>
                        )}
                    </div>
                    <div className="aspect-square bg-rose-100 rounded-tl-[3rem] rounded-br-[3rem] overflow-hidden">
                        {invitation.portadaImagenFondo ? (
                            <img src={invitation.portadaImagenFondo} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-rose-200">
                                <Flower2 className="w-32 h-32" />
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Album */}
            {invitation.albumCompartidoHabilitado && (
                <section className="py-20 bg-gradient-to-b from-white to-[#FFF0F5]">
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
                <section className="py-24 bg-rose-500 text-white">
                    <div className="container mx-auto px-6 max-w-xl text-center">
                        <h2 className="text-4xl font-bold mb-8 font-cursive">Confirmar Asistencia</h2>
                        <div className="bg-white/95 rounded-2xl p-2 text-gray-800">
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
