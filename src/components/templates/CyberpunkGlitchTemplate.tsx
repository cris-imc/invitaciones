"use client";

import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, MapPin, Calendar, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SharedAlbum } from "@/components/invitation/SharedAlbum";
import { QuizTrivia } from "@/components/invitation/QuizTrivia";
import { CronogramaOriginal } from "../invitation/CronogramaOriginal";
import { DressCode } from "../invitation/DressCode";
import { Farewell } from "../invitation/Farewell";

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

export function CyberpunkGlitchTemplate({ data, themeConfig }: InvitationTemplateProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const countdown = useCountdown(data.fecha);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) { audioRef.current.pause(); } else { audioRef.current.play(); }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-[#0ff] font-sans overflow-x-hidden relative selection:bg-[#f0f] selection:text-white">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;500;700&display=swap');
                
                .font-cyber-title { font-family: 'Orbitron', sans-serif; }
                .font-cyber-body { font-family: 'Rajdhani', sans-serif; }
                
                .glitch {
                    position: relative;
                }
                .glitch::before, .glitch::after {
                    content: attr(data-text);
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                }
                .glitch::before {
                    left: 2px; text-shadow: -1px 0 #f0f; clip: rect(44px, 450px, 56px, 0);
                    animation: glitch-anim 5s infinite linear alternate-reverse;
                }
                .glitch::after {
                    left: -2px; text-shadow: -1px 0 #0ff; clip: rect(44px, 450px, 56px, 0);
                    animation: glitch-anim2 5s infinite linear alternate-reverse;
                }
                
                @keyframes glitch-anim {
                    0% { clip: rect(59px, 9999px, 86px, 0); }
                    100% { clip: rect(18px, 9999px, 7px, 0); }
                }
                 @keyframes glitch-anim2 {
                    0% { clip: rect(2px, 9999px, 46px, 0); }
                    100% { clip: rect(98px, 9999px, 2px, 0); }
                }

                .scanner-line {
                    position: fixed; top: 0; left: 0; width: 100%; height: 5px;
                    background: #0ff; opacity: 0.5;
                    box-shadow: 0 0 10px #0ff;
                    animation: scan 4s linear infinite;
                    pointer-events: none; z-index: 40;
                }
                @keyframes scan { 0% { top: -10%; } 100% { top: 110%; } }
                
                .cyber-grid {
                    background-size: 40px 40px;
                    background-image: linear-gradient(to right, rgba(0, 255, 255, 0.1) 1px, transparent 1px),
                                      linear-gradient(to bottom, rgba(0, 255, 255, 0.1) 1px, transparent 1px);
                    perspective: 500px;
                    transform-style: preserve-3d;
                }

                /* Quiz Overrides */
                .bg-white { background-color: #000 !important; color: #0ff !important; border-color: #0ff !important; border-width: 1px !important; }
                .text-gray-800 { color: #f0f !important; font-family: 'Orbitron', sans-serif !important; }
                .text-gray-600 { color: #0ff !important; font-family: 'Rajdhani', sans-serif !important; }
                .shadow-md { box-shadow: 0 0 10px rgba(0,255,255,0.3) !important; }
            `}</style>

            <div className="scanner-line"></div>
            <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />

            {/* Audio */}
            {data.musicaUrl && (
                <>
                    <audio ref={audioRef} loop src={data.musicaUrl} />
                    <button onClick={togglePlay} className="fixed top-6 right-6 z-50 p-2 border border-[#0ff] bg-black/80 text-[#0ff] hover:bg-[#0ff] hover:text-black transition-colors uppercase font-cyber-body font-bold text-xs tracking-widest clip-path-polygon">
                        [{isPlaying ? 'MUTE SYSTEM' : 'INIT AUDIO'}]
                    </button>
                </>
            )}

            {/* HERO */}
            <section className="min-h-screen flex flex-col justify-center items-center text-center p-4 relative z-10">
                <div className="border border-[#0ff]/30 p-8 md:p-16 bg-black/60 backdrop-blur-sm shadow-[0_0_50px_rgba(0,255,255,0.2)]">
                    <p className="font-cyber-body text-[#f0f] tracking-[0.5em] text-lg mb-4">SYSTEM_EVENT_LOADED</p>
                    <h1 className="glitch font-cyber-title text-6xl md:text-8xl lg:text-9xl font-black text-white mb-8 leading-none mix-blend-difference" data-text={data.type === 'CASAMIENTO' ? 'WEDDING_V.2.0' : 'PARTY_PROTOCOL'}>
                        {data.type === 'CASAMIENTO' ? (
                            <>
                                {data.nombreNovia}<span className="text-[#0ff]">_</span>{data.nombreNovio}
                            </>
                        ) : (
                            data.nombreQuinceanera || data.nombreEvento
                        )}
                    </h1>
                    <div className="flex flex-col md:flex-row gap-8 justify-center items-center mt-12 font-cyber-body text-xl">
                        <div className="flex items-center gap-2 border border-[#0ff] px-6 py-2 bg-[#0ff]/10">
                            <Calendar size={20} />
                            <span>{new Date(data.fecha).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 border border-[#f0f] px-6 py-2 bg-[#f0f]/10 text-[#f0f]">
                            <MapPin size={20} />
                            <span>{data.lugarNombre}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* COUNTDOWN */}
            <section className="py-20 bg-[#0a0a0a] border-y border-[#0ff]/20 z-10 relative">
                <div className="container mx-auto text-center">
                    <h2 className="text-[#f0f] font-cyber-body tracking-widest mb-8">T-MINUS COUNTDOWN</h2>
                    <div className="flex justify-center gap-4 md:gap-12 font-cyber-title text-5xl md:text-7xl text-white">
                        <div>
                            <span className="text-[#0ff]">{String(countdown.days).padStart(2, '0')}</span>
                            <span className="block text-xs text-start text-neutral-500 font-cyber-body">DAYS</span>
                        </div>
                        <span className="animate-pulse">:</span>
                        <div>
                            <span className="text-[#0ff]">{String(countdown.hours).padStart(2, '0')}</span>
                            <span className="block text-xs text-start text-neutral-500 font-cyber-body">HRS</span>
                        </div>
                        <span className="animate-pulse">:</span>
                        <div>
                            <span className="text-[#0ff]">{String(countdown.minutes).padStart(2, '0')}</span>
                            <span className="block text-xs text-start text-neutral-500 font-cyber-body">MIN</span>
                        </div>
                        <span className="animate-pulse">:</span>
                        <div>
                            <span className="text-[#0ff]">{String(countdown.seconds).padStart(2, '0')}</span>
                            <span className="block text-xs text-start text-neutral-500 font-cyber-body">SEC</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* TIMELINE */}
            {data.cronogramaEventos && data.cronogramaEventos.length > 0 && (
                <section className="py-20 relative z-10 bg-[#050505]">
                    <div className="container mx-auto max-w-4xl border border-[#0ff]/20 p-8 cyberpunk-box">
                        <h2 className="font-cyber-title text-4xl text-[#0ff] text-center mb-12 glitch" data-text="MISSION_TIMELINE">MISSION_TIMELINE</h2>
                        <div className="filter hue-rotate-180 brightness-150 contrast-125">
                            <CronogramaOriginal
                                events={typeof data.cronogramaEventos === 'string' ? JSON.parse(data.cronogramaEventos) : data.cronogramaEventos}
                                className="bg-transparent"
                                titleColor="#0ff"
                                subtitleColor="#f0f"
                                cardBgColor="bg-black/50"
                                cardBorderColor="border-[#0ff]/30"
                                textColor="text-[#0ff]"
                            />
                        </div>
                    </div>
                </section>
            )}

            {/* DRESS CODE */}
            {data.dresscodeHabilitado && (
                <section className="py-12 container mx-auto text-center relative z-10">
                    <div className="inline-block border border-[#f0f] bg-[#f0f]/5 p-8 clip-path-polygon">
                        <DressCode
                            titulo={data.dresscodeTitulo}
                            tipo={data.dresscodeTipo}
                            observaciones={data.dresscodeObservaciones}
                            icono={data.dresscodeIcono}
                            className="bg-transparent text-[#0ff]"
                            titleColor="#f0f"
                            textColor="#0ff"
                        />
                    </div>
                </section>
            )}

            {/* QUIZ */}
            {data.triviaHabilitada && (
                <section className="py-20 bg-[#0a0a0a] relative z-10 border-y border-[#0ff]/20">
                    <div className="container mx-auto px-6">
                        <QuizTrivia
                            titulo={data.triviaTitulo}
                            subtitulo={data.triviaSubtitulo}
                            preguntas={typeof data.triviaPreguntas === 'string' ? JSON.parse(data.triviaPreguntas) : data.triviaPreguntas}
                            icono={data.triviaIcono}
                            invitationId={data.id}
                        />
                    </div>
                </section>
            )}

            {/* SHARED ALBUM */}
            {data.albumCompartidoHabilitado && (
                <section className="py-20 container mx-auto px-6 text-center relative z-10">
                    <SharedAlbum
                        invitationSlug={data.slug}
                        titulo={data.albumCompartidoTitulo}
                        descripcion={data.albumCompartidoDescripcion}
                        colorPrimario="#0ff"
                        fechaEvento={data.fecha}
                        className="bg-[#050505] text-[#0ff]"
                    />
                </section>
            )}

            {/* RSVP */}
            <div className="py-32 flex justify-center z-10 relative">
                <Button className="font-cyber-body text-xl font-bold bg-[#f0f] text-white hover:bg-[#fff] hover:text-[#f0f] rounded-none px-12 py-8 clip-path-polygon shadow-[5px_5px_0px_#0ff] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
                    CONFIRM_PRESENCE_NOW_&gt;
                </Button>
            </div>

            {/* FAREWELL */}
            {data.despedidaHabilitada && (
                <div className="py-12 bg-black text-center relative z-10 border-t border-[#0ff]/30">
                    <Farewell
                        nombreEvento={data.nombreEvento}
                        tipo={data.type}
                        nombreNovia={data.nombreNovia}
                        nombreNovio={data.nombreNovio}
                        nombreQuinceanera={data.nombreQuinceanera}
                        despedidaFoto={data.despedidaFoto}
                        colorPrincipal="#0ff"
                        className="bg-black text-[#0ff]"
                        titleClassName="font-cyber-title font-black glitch"
                        textClassName="font-cyber-body text-[#f0f]"
                    />
                </div>
            )}

            {/* GIFTS */}
            {data.regaloHabilitado && (
                <section className="py-20 relative z-10 border-t border-[#0ff]/30 bg-[#050505]">
                    <div className="container mx-auto px-6 max-w-2xl text-center cyberpunk-box p-8 border border-[#f0f]/50">
                        <div className="text-[#f0f] mb-6 flex justify-center animate-pulse"><Heart size={40} /></div>
                        <h2 className="font-cyber-title text-3xl text-[#f0f] mb-6 glitch" data-text={data.regaloTitulo || "SUPPLY_DROP"}>{data.regaloTitulo || "SUPPLY_DROP"}</h2>
                        <p className="text-[#0ff] font-cyber-body text-lg mb-8">{data.regaloMensaje}</p>

                        {data.regaloMostrarDatos && (
                            <div className="bg-black p-8 border border-[#0ff] inline-block w-full">
                                <div className="space-y-4 text-left font-mono text-[#0ff]">
                                    {data.regaloBanco && <div className="flex justify-between border-b border-[#0ff]/30 pb-2"><span>BANK:</span> <span className="font-bold text-white">{data.regaloBanco}</span></div>}
                                    {data.regaloCbu && <div className="flex justify-between border-b border-[#0ff]/30 pb-2"><span>ID_CODE:</span> <span className="font-bold text-white">{data.regaloCbu}</span></div>}
                                    {data.regaloAlias && <div className="flex justify-between"><span>ALIAS:</span> <span className="font-bold text-white">{data.regaloAlias}</span></div>}
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            )}
        </div>
    );
}
