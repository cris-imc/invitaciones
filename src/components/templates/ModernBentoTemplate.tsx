"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, MapPin, Calendar, Clock, Music, Heart, Copy, Share2, Grid, ArrowRight, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/Toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { SharedAlbum } from "@/components/invitation/SharedAlbum";
import { QuizTrivia } from "@/components/invitation/QuizTrivia";

interface InvitationTemplateProps {
    data: any;
    themeConfig: any;
}

function useCountdown(targetDate: Date | string | undefined) {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        if (!targetDate) return;
        const date = new Date(targetDate);
        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const distance = date.getTime() - now;
            if (distance < 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }
            setTimeLeft({
                days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((distance % (1000 * 60)) / 1000)
            });
        };
        calculateTimeLeft();
        const interval = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(interval);
    }, [targetDate]);

    return timeLeft;
}

export function ModernBentoTemplate({ data, themeConfig }: InvitationTemplateProps) {
    const { showToast } = useToast();
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const countdown = useCountdown(data.fecha);

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

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        showToast("Copiado al portapapeles", "success");
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 md:p-8 font-sans selection:bg-lime-400 selection:text-black">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
                
                .font-bento-logo { font-family: 'Space Grotesk', sans-serif; }
                .font-bento-body { font-family: 'Plus Jakarta Sans', sans-serif; }
                
                .bento-card {
                    background-color: #171717;
                    border: 1px solid #262626;
                    border-radius: 1.5rem;
                    overflow: hidden;
                    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                }
                
                .bento-card:hover {
                    border-color: #404040;
                    transform: translateY(-2px);
                    box-shadow: 0 10px 40px -10px rgba(0,0,0,0.5);
                }

                .text-lime-glow {
                     text-shadow: 0 0 20px rgba(132, 204, 22, 0.4);
                }
            `}</style>

            <div className="max-w-[1200px] mx-auto space-y-4">

                {/* HEADER / NAV */}
                <header className="flex justify-between items-center mb-8 px-2">
                    <div className="flex items-center gap-2 font-bento-logo font-bold text-xl tracking-tight">
                        <div className="w-8 h-8 bg-lime-400 rounded-lg flex items-center justify-center text-black">
                            <Layers size={18} />
                        </div>
                        <span>INVITATION.OS</span>
                    </div>
                    {data.musicaUrl && (
                        <>
                            <audio ref={audioRef} loop src={data.musicaUrl} />
                            <Button
                                onClick={togglePlay}
                                variant="outline"
                                className="rounded-full border-neutral-700 bg-black/50 hover:bg-neutral-800 hover:text-lime-400 w-12 h-12 p-0"
                            >
                                {isPlaying ? <Volume2 size={18} /> : <VolumeX size={18} />}
                            </Button>
                        </>
                    )}
                </header>

                {/* BENTO GRID */}
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 auto-rows-[180px]">

                    {/* HERO (Large Block) */}
                    <div className="bento-card col-span-1 md:col-span-4 lg:col-span-4 row-span-2 relative p-8 md:p-12 flex flex-col justify-end group">
                        {data.portadaImagenFondo ? (
                            <img src={data.portadaImagenFondo} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 group-hover:opacity-70 transition-all duration-700" alt="Cover" />
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-black opacity-50" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-400/20 text-lime-400 border border-lime-400/30 text-xs font-bold uppercase tracking-widest mb-4">
                                {data.type === 'CASAMIENTO' ? 'Wedding Invitation' : 'Event Invitation'}
                            </div>
                            <h1 className="font-bento-logo text-5xl md:text-7xl font-bold leading-[0.9] mb-4 text-white">
                                {data.type === 'CASAMIENTO' ? (
                                    <>
                                        {data.nombreNovia} <span className="text-neutral-500">&</span> {data.nombreNovio}
                                    </>
                                ) : (
                                    data.nombreQuinceanera || data.nombreEvento
                                )}
                            </h1>
                            <p className="text-neutral-400 text-lg md:text-xl font-light font-bento-body max-w-lg">
                                {data.frasePersonalizadaTexto || "Acompáñanos en este día especial."}
                            </p>
                        </div>
                    </div>

                    {/* DATE (Square Block) */}
                    <div className="bento-card col-span-1 md:col-span-2 lg:col-span-2 row-span-1 flex flex-col justify-center items-center p-6 bg-neutral-900 text-center border-neutral-700">
                        <Calendar className="w-8 h-8 text-neutral-500 mb-4" />
                        <span className="text-4xl font-bento-logo font-bold">{data.fecha ? new Date(data.fecha).getDate() : "DD"}</span>
                        <span className="text-neutral-400 uppercase tracking-widest text-sm font-bold">
                            {data.fecha ? format(new Date(data.fecha), "MMMM", { locale: es }) : "MMMM"}
                        </span>
                    </div>

                    {/* TIME (Square Block) */}
                    <div className="bento-card col-span-1 md:col-span-2 lg:col-span-2 row-span-1 flex flex-col justify-center items-center p-6 bg-lime-400 text-black border-lime-500">
                        <Clock className="w-8 h-8 mb-4 opacity-50" />
                        <span className="text-4xl font-bento-logo font-bold">{data.hora || "00:00"}</span>
                        <span className="uppercase tracking-widest text-sm font-bold opacity-60">Horas</span>
                    </div>

                    {/* LOCATION (Wide Block) */}
                    <div className="bento-card col-span-1 md:col-span-2 lg:col-span-3 row-span-1 p-6 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-neutral-500 uppercase text-xs font-bold tracking-widest mb-1">Ubicación</h3>
                                <p className="font-bento-logo text-xl font-bold">{data.lugarNombre}</p>
                            </div>
                            <div className="bg-neutral-800 p-2 rounded-lg">
                                <MapPin size={20} className="text-lime-400" />
                            </div>
                        </div>

                        {data.mapUrl && (
                            <a
                                href={data.mapUrl}
                                target="_blank"
                                className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors group"
                            >
                                Ver mapa <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </a>
                        )}
                    </div>

                    {/* COUNTDOWN (Wide Block) */}
                    <div className="bento-card col-span-1 md:col-span-2 lg:col-span-3 row-span-1 p-6 flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-neutral-500 uppercase text-xs font-bold tracking-widest mb-2">Faltan</span>
                            <div className="flex gap-4 font-bento-logo text-2xl font-bold text-neutral-200">
                                <div className="text-center">
                                    <span className="block">{String(countdown.days).padStart(2, '0')}</span>
                                    <span className="text-[10px] text-neutral-500 uppercase font-normal tracking-wide">Días</span>
                                </div>
                                <span className="text-neutral-700">:</span>
                                <div className="text-center">
                                    <span className="block">{String(countdown.hours).padStart(2, '0')}</span>
                                    <span className="text-[10px] text-neutral-500 uppercase font-normal tracking-wide">Hrs</span>
                                </div>
                                <span className="text-neutral-700">:</span>
                                <div className="text-center">
                                    <span className="block">{String(countdown.minutes).padStart(2, '0')}</span>
                                    <span className="text-[10px] text-neutral-500 uppercase font-normal tracking-wide">Min</span>
                                </div>
                            </div>
                        </div>
                        <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center animate-pulse">
                            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                        </div>
                    </div>

                    {/* RSVP (Tall Feature Block) */}
                    <div className="bento-card col-span-1 md:col-span-2 lg:col-span-2 row-span-2 p-6 flex flex-col justify-between bg-gradient-to-b from-neutral-800 to-neutral-900 border-neutral-700">
                        <div>
                            <div className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center mb-6">
                                <span className="font-bold">?</span>
                            </div>
                            <h3 className="font-bento-logo text-2xl font-bold mb-2">RSVP</h3>
                            <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                                Es muy importante para nosotros saber si podremos contar con tu presencia.
                            </p>
                        </div>
                        <Button className="w-full bg-white text-black hover:bg-lime-400 hover:text-black font-bold h-12 rounded-xl transition-all">
                            Confirmar Asistencia
                        </Button>
                    </div>

                    {/* GALLERY PREVIEW (Grid Block) */}
                    {(data.galeriaPrincipalHabilitada && data.galeriaPrincipalFotos.length > 0) && (
                        <div className="bento-card col-span-1 md:col-span-4 lg:col-span-4 row-span-1 p-1 overflow-hidden relative group">
                            <div className="grid grid-cols-4 h-full gap-1">
                                {data.galeriaPrincipalFotos.slice(0, 4).map((foto: string, i: number) => (
                                    <div key={i} className="h-full bg-neutral-800 rounded-lg overflow-hidden">
                                        <img src={foto} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                    </div>
                                ))}
                            </div>
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 pointer-events-none transition-colors" />
                            <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2">
                                <Grid size={14} /> Ver Galería
                            </div>
                        </div>
                    )}

                    {/* GIFTS (Compact Block) */}
                    {data.regaloHabilitado && (
                        <div className="bento-card col-span-1 md:col-span-4 lg:col-span-6 row-span-auto p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="bg-neutral-800 p-3 rounded-xl text-yellow-400">
                                    <Heart size={24} fill="currentColor" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">{data.regaloTitulo || "Mesa de Regalos"}</h3>
                                    <p className="text-neutral-400 text-sm">{data.regaloMensaje || "Un detalle especial..."}</p>
                                </div>
                            </div>

                            {data.regaloMostrarDatos && (
                                <div className="flex gap-2">
                                    {data.regaloCbu && (
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="bg-neutral-800 text-white hover:bg-neutral-700 border border-neutral-700"
                                            onClick={() => copyToClipboard(data.regaloCbu)}
                                        >
                                            <Copy size={14} className="mr-2" /> CBU
                                        </Button>
                                    )}
                                    {data.regaloAlias && (
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="bg-neutral-800 text-white hover:bg-neutral-700 border border-neutral-700"
                                            onClick={() => copyToClipboard(data.regaloAlias)}
                                        >
                                            <Copy size={14} className="mr-2" /> Alias
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                </div>

                {/* FOOTER */}
                <footer className="text-center py-12 text-neutral-600 text-sm font-bento-body">
                    <p>Designed with Invitation.OS • © {new Date().getFullYear()}</p>
                </footer>
            </div>
        </div>
    );
}
