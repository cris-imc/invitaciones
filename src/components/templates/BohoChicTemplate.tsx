"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX, Leaf, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/invitation/Countdown";
import { PersonalizedRsvpForm } from "@/components/invitation/PersonalizedRsvpForm";
import { CollaborativeAlbumModern } from "@/components/templates/CollaborativeAlbumModern";

interface BohoChicTemplateProps {
    invitation: any;
    guest?: any;
    isPersonalized?: boolean;
}

export function BohoChicTemplate({ invitation, guest, isPersonalized = false }: BohoChicTemplateProps) {
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
        <div className="min-h-screen bg-[#F7F5F0] text-[#4A4238] font-serif overflow-x-hidden selection:bg-[#C17C74] selection:text-white">
            {/* Grain Texture */}
            <div className="fixed inset-0 opacity-40 pointer-events-none mix-blend-multiply z-0"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")` }}
            />

            {/* Background Music */}
            {invitation.musicaUrl && (
                <>
                    <audio ref={audioRef} loop>
                        <source src={invitation.musicaUrl} type="audio/mpeg" />
                    </audio>
                    <button
                        onClick={togglePlay}
                        className="fixed top-6 right-6 z-50 bg-[#C17C74] text-white p-3 rounded-full hover:bg-[#A6635C] transition-all shadow-lg"
                    >
                        {isPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </button>
                </>
            )}

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center p-6 pb-20 overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#E6DCCF] rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#D4C5B0] rounded-full blur-3xl opacity-40 translate-y-1/2 -translate-x-1/2" />

                <div className="text-center relative z-10 max-w-4xl w-full border border-[#D4C5B0] p-8 md:p-16 bg-white/40 backdrop-blur-sm rounded-t-[10rem]">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                    >
                        <div className="flex justify-center mb-6">
                            <Leaf className="w-8 h-8 text-[#9A8DA3]" />
                        </div>
                        <p className="tracking-[0.2em] text-[#9A8DA3] uppercase mb-4 text-sm font-sans">
                            {invitation.tipo === 'CASAMIENTO' ? 'Join us to celebrate' : 'You are invited'}
                        </p>
                        <h1
                            className="text-5xl md:text-8xl mb-8 text-[#4A4238]"
                            style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}
                        >
                            {invitation.tipo === 'CASAMIENTO'
                                ? (
                                    <div className="flex flex-col gap-2">
                                        <span>{invitation.nombreNovia}</span>
                                        <span className="text-3xl md:text-5xl font-sans text-[#C17C74] my-2">&</span>
                                        <span>{invitation.nombreNovio}</span>
                                    </div>
                                )
                                : invitation.nombreQuinceanera || invitation.nombreEvento}
                        </h1>
                        <p className="text-lg md:text-xl font-sans tracking-wide text-[#7A6F62]">
                            {new Date(invitation.fechaEvento).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}
                        </p>
                        <p className="mt-2 text-[#7A6F62] font-sans">
                            {invitation.lugarNombre}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Countdown */}
            <section className="py-20 bg-[#C17C74] text-[#F7F5F0]">
                <div className="scale-90">
                    <Countdown targetDate={new Date(invitation.fechaEvento)} />
                </div>
            </section>

            {/* Info Cards */}
            <section className="py-24 container mx-auto px-6">
                <div className="grid md:grid-cols-2 gap-12">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white p-10 rounded-2xl shadow-sm border border-[#E6DCCF] text-center"
                    >
                        <h3 className="text-3xl font-serif text-[#C17C74] mb-6 italic">Ceremony</h3>
                        <p className="text-lg text-[#7A6F62] mb-2">{invitation.lugarNombre}</p>
                        <p className="text-[#9A8DA3]">{invitation.direccion}</p>
                        <div className="mt-6 text-2xl font-serif">{invitation.hora} hrs</div>
                        {invitation.mapUrl && (
                            <Button variant="link" className="mt-4 text-[#C17C74] underline" onClick={() => window.open(invitation.mapUrl, '_blank')}>
                                Ver mapa
                            </Button>
                        )}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="bg-white p-2 rounded-2xl shadow-sm border border-[#E6DCCF] h-96 overflow-hidden"
                    >
                        {invitation.portadaImagenFondo ? (
                            <img src={invitation.portadaImagenFondo} className="w-full h-full object-cover rounded-xl grayscale opacity-90" />
                        ) : (
                            <div className="w-full h-full bg-[#F0EBE0] rounded-xl flex items-center justify-center text-[#D4C5B0]">
                                <Heart className="w-12 h-12" />
                            </div>
                        )}
                    </motion.div>
                </div>
            </section>

            {/* Album */}
            {invitation.albumCompartidoHabilitado && (
                <section className="bg-white py-20 border-t border-[#E6DCCF]">
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
                <section className="py-24 bg-[#E6DCCF]">
                    <div className="container mx-auto px-6 max-w-2xl text-center">
                        <h2 className="text-4xl md:text-5xl font-serif text-[#4A4238] mb-10 italic">R.S.V.P</h2>
                        <div className="bg-white/80 backdrop-blur-md p-2 rounded-2xl shadow-sm">
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
