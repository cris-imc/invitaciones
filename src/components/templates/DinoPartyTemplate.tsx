"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX, Ghost } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/invitation/Countdown";
import { PersonalizedRsvpForm } from "@/components/invitation/PersonalizedRsvpForm";
import { CollaborativeAlbumModern } from "@/components/templates/CollaborativeAlbumModern";

interface DinoPartyTemplateProps {
    invitation: any;
    guest?: any;
    isPersonalized?: boolean;
}

export function DinoPartyTemplate({ invitation, guest, isPersonalized = false }: DinoPartyTemplateProps) {
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
        <div className="min-h-screen bg-[#F5DEB3] text-[#5D4037] font-sans overflow-x-hidden selection:bg-[#6B8E23] selection:text-white">
            {/* Dino Prints Background */}
            <div className="fixed inset-0 pointer-events-none opacity-5"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 50l-10 20h20z' fill='%236B8E23'/%3E%3C/svg%3E")`,
                    backgroundSize: '80px 80px'
                }}
            />

            {/* Background Music */}
            {invitation.musicaUrl && (
                <>
                    <audio ref={audioRef} loop>
                        <source src={invitation.musicaUrl} type="audio/mpeg" />
                    </audio>
                    <button
                        onClick={togglePlay}
                        className="fixed top-6 right-6 z-50 bg-[#6B8E23] text-white p-3 rounded-[35%_65%_35%_65%/65%_35%_65%_35%] hover:scale-110 transition-all shadow-md border-2 border-[#5D4037]"
                    >
                        {isPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </button>
                </>
            )}

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center p-6 pb-20 overflow-hidden">
                {/* Decoration items */}
                <div className="absolute top-10 left-10 text-[#6B8E23] opacity-20 transform -rotate-12">
                    <span className="text-9xl font-black">RAWWR!</span>
                </div>

                <div className="relative z-10 text-center max-w-4xl bg-white p-8 md:p-14 rounded-[3rem] shadow-[10px_10px_0px_0px_#6B8E23] border-4 border-[#5D4037]">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", bounce: 0.6 }}
                    >
                        <p className="text-[#D2691E] font-black uppercase tracking-widest text-xl mb-4">¡Cuidado! Se acerca el</p>
                        <h1 className="text-6xl md:text-9xl font-black text-[#5D4037] mb-2 leading-none" style={{ fontFamily: "'Bangers', cursive" }}>
                            CUMPLE
                            <br />
                            <span className="text-[#6B8E23]">DINO</span>
                        </h1>
                        <h2 className="text-3xl md:text-5xl font-black text-[#D2691E] mt-4" style={{ fontFamily: "'Bangers', cursive" }}>
                            DE {invitation.nombreQuinceanera || invitation.nombreEvento}
                        </h2>
                    </motion.div>

                    <div className="mt-8 flex justify-center">
                        <div className="bg-[#6B8E23] text-white px-8 py-4 rounded-full font-bold text-xl border-4 border-[#5D4037] transform rotate-2">
                            {new Date(invitation.fechaEvento).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', timeZone: 'UTC' })}
                        </div>
                    </div>
                </div>
            </section>

            {/* Countdown */}
            <section className="py-20 bg-[#D2691E] text-white border-y-8 border-[#5D4037] border-dashed">
                <div className="container mx-auto text-center">
                    <h2 className="text-3xl font-black uppercase tracking-widest mb-8" style={{ fontFamily: "'Bangers', cursive" }}>Tiempo Para La Extinción</h2>
                    <div className="scale-90">
                        <Countdown targetDate={new Date(invitation.fechaEvento)} />
                    </div>
                </div>
            </section>

            {/* Cave Location */}
            <section className="py-24 container mx-auto px-6">
                <div className="bg-[#8FBC8F] p-8 md:p-12 rounded-[3rem] shadow-xl border-4 border-[#5D4037] relative">
                    <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 bg-[#5D4037] text-white px-10 py-2 rounded-xl font-bold text-2xl uppercase">
                        La Cueva
                    </div>
                    <div className="grid md:grid-cols-2 gap-12 mt-8 items-center">
                        <div className="text-center md:text-left">
                            <h3 className="text-4xl font-black text-[#5D4037] mb-2">{invitation.lugarNombre}</h3>
                            <p className="text-2xl font-bold text-white mb-8">{invitation.direccion}</p>
                            {invitation.mapUrl && (
                                <Button
                                    onClick={() => window.open(invitation.mapUrl, '_blank')}
                                    className="bg-[#D2691E] hover:bg-[#A0522D] text-white font-black text-xl py-6 px-10 rounded-2xl shadow-[4px_4px_0_#5D4037] border-2 border-[#5D4037] active:shadow-none active:translate-y-1 transition-all"
                                >
                                    VER MAPA
                                </Button>
                            )}
                        </div>
                        <div className="aspect-video bg-[#F5DEB3] rounded-3xl border-4 border-[#5D4037] p-2 rotate-2">
                            {invitation.portadaImagenFondo ? (
                                <img src={invitation.portadaImagenFondo} className="w-full h-full object-cover rounded-2xl" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[#6B8E23]/50">
                                    <span className="text-6xl font-black">FOTO</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Album */}
            {invitation.albumCompartidoHabilitado && (
                <section className="py-20 bg-[#6B8E23]/20">
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
                <section className="py-24 bg-[#5D4037]">
                    <div className="container mx-auto px-6 max-w-xl">
                        <div className="bg-[#F5DEB3] rounded-[2rem] p-8 border-4 border-[#D2691E] shadow-2xl">
                            <h2 className="text-4xl font-black text-[#6B8E23] text-center mb-6" style={{ fontFamily: "'Bangers', cursive" }}>¡Ruge si vienes!</h2>
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
