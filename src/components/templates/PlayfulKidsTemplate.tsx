"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX, Star, Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/invitation/Countdown";
import { PersonalizedRsvpForm } from "@/components/invitation/PersonalizedRsvpForm";
import { CollaborativeAlbumModern } from "@/components/templates/CollaborativeAlbumModern";

interface PlayfulKidsTemplateProps {
    invitation: any;
    guest?: any;
    isPersonalized?: boolean;
}

export function PlayfulKidsTemplate({ invitation, guest, isPersonalized = false }: PlayfulKidsTemplateProps) {
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
        <div className="min-h-screen bg-[#E0F7FA] text-[#006064] font-sans overflow-x-hidden selection:bg-[#FFD54F] selection:text-black">
            {/* Animated Clouds Background */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute text-white/60"
                        initial={{ x: -200 }}
                        animate={{ x: '120vw' }}
                        transition={{
                            duration: 20 + Math.random() * 20,
                            repeat: Infinity,
                            ease: "linear",
                            delay: Math.random() * 20
                        }}
                        style={{ top: `${Math.random() * 60}%` }}
                    >
                        <Cloud size={100 + Math.random() * 100} fill="currentColor" />
                    </motion.div>
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
                        className="fixed top-6 right-6 z-50 bg-[#FF6B6B] text-white p-3 rounded-full hover:bg-[#FF8787] transition-all shadow-lg border-4 border-white"
                    >
                        {isPlaying ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                    </button>
                </>
            )}

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center p-6 pb-20">
                <div className="relative z-10 text-center space-y-8 max-w-4xl bg-white/40 backdrop-blur-sm p-12 rounded-[3rem] shadow-xl border-4 border-white">
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                    >
                        <div className="inline-block bg-[#FFD54F] text-[#5D4037] px-6 py-2 rounded-full font-black uppercase tracking-widest text-sm mb-6 border-2 border-white shadow-md rotate-2">
                            ¡Estás Invitado!
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black text-[#FF6B6B] drop-shadow-sm" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                            {invitation.tipo === 'CUMPLEAÑOS' ? 'Cumpleaños de' : ''}
                            <span className="block mt-2 text-[#4ECDC4]">
                                {invitation.nombreQuinceanera || invitation.nombreNovio || invitation.nombreEvento}
                            </span>
                        </h1>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-col md:flex-row items-center justify-center gap-6 mt-8"
                    >
                        <div className="bg-white px-8 py-4 rounded-2xl shadow-md border-b-4 border-gray-200">
                            <div className="text-sm font-bold text-gray-400 uppercase">Cuándo</div>
                            <div className="text-xl font-bold text-[#FF6B6B]">
                                {new Date(invitation.fechaEvento).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', timeZone: 'UTC' })}
                            </div>
                        </div>
                        <div className="bg-white px-8 py-4 rounded-2xl shadow-md border-b-4 border-gray-200">
                            <div className="text-sm font-bold text-gray-400 uppercase">Dónde</div>
                            <div className="text-xl font-bold text-[#4ECDC4]">{invitation.lugarNombre}</div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Countdown */}
            <section className="py-20 bg-[#FFD54F] text-[#5D4037]">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black uppercase tracking-wider">¡Falta Muy Poco!</h2>
                </div>
                <div className="scale-90 md:scale-100">
                    <Countdown targetDate={new Date(invitation.fechaEvento)} />
                </div>
            </section>

            {/* Info Section */}
            <section className="py-24 container mx-auto px-6">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="bg-white p-10 rounded-[2rem] shadow-lg border-b-8 border-[#4ECDC4]">
                        <h3 className="text-3xl font-black text-[#4ECDC4] mb-6">Ubicación de la Fiesta</h3>
                        <p className="text-xl text-[#5D4037] mb-2 font-bold">{invitation.lugarNombre}</p>
                        <p className="text-lg text-gray-500 mb-8">{invitation.direccion}</p>
                        {invitation.mapUrl && (
                            <Button
                                onClick={() => window.open(invitation.mapUrl, '_blank')}
                                className="w-full bg-[#FF6B6B] hover:bg-[#ff5252] text-white font-bold py-6 rounded-xl text-lg shadow-[0_4px_0_#d32f2f] active:shadow-none active:translate-y-1 transition-all"
                            >
                                Ver Mapa 🗺️
                            </Button>
                        )}
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 bg-[#FFD54F] rounded-[2rem] rotate-3 transform translate-x-2 translate-y-2" />
                        <div className="relative bg-white p-4 rounded-[2rem] border-4 border-white shadow-xl overflow-hidden aspect-square">
                            {invitation.portadaImagenFondo ? (
                                <img src={invitation.portadaImagenFondo} className="w-full h-full object-cover rounded-[1.5rem]" />
                            ) : (
                                <div className="w-full h-full bg-[#E0F7FA] rounded-[1.5rem] flex items-center justify-center">
                                    <Star size={80} className="text-[#4ECDC4]" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Album */}
            {invitation.albumCompartidoHabilitado && (
                <section className="bg-white py-20 border-t-4 border-[#E0F2F1]">
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
                <section className="py-24 bg-[#4ECDC4]">
                    <div className="container mx-auto px-6 max-w-xl text-center">
                        <div className="mb-12">
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 drop-shadow-md">¿Vienes a la fiesta?</h2>
                            <p className="text-white/90 text-xl font-medium">¡Confirma tu asistencia para guardarte torta!</p>
                        </div>
                        <div className="bg-white rounded-3xl p-4 shadow-xl">
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
