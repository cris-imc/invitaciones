"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Volume2, VolumeX, MapPin, Calendar, Clock, Film, Play, ChevronDown, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/Toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
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

export function CinematicScrollTemplate({ data, themeConfig }: InvitationTemplateProps) {
    const { showToast } = useToast();
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const countdown = useCountdown(data.fecha);
    const { scrollYProgress } = useScroll();

    // Parallax & Fade effects
    const opacityHero = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
    const scaleHero = useTransform(scrollYProgress, [0, 0.4], [1, 1.2]);
    const yHero = useTransform(scrollYProgress, [0, 0.4], [0, 100]);

    const opacityContent = useTransform(scrollYProgress, [0.8, 1], [0, 1]);

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
        <div className="bg-black text-white font-sans selection:bg-red-600 selection:text-white overflow-hidden">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:wght@300;400;600&display=swap');
                
                .font-cine-title { font-family: 'Bebas Neue', sans-serif; }
                .font-cine-body { font-family: 'Montserrat', sans-serif; }
                
                .fade-to-black {
                    background: linear-gradient(to bottom, transparent 0%, black 100%);
                }
                
                .grain-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 50;
                    opacity: 0.05;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
                }

                /* Quiz Overrides */
                .bg-white { background-color: #262626 !important; color: white !important; }
                .text-gray-800 { color: white !important; }
                .text-gray-600 { color: #a3a3a3 !important; }
            `}</style>

            <div className="grain-overlay"></div>

            {/* Audio Control */}
            {data.musicaUrl && (
                <>
                    <audio ref={audioRef} loop src={data.musicaUrl} />
                    <button
                        onClick={togglePlay}
                        className="fixed top-6 right-6 z-[60] text-xs font-cine-body tracking-widest flex items-center gap-2 group mix-blend-difference"
                    >
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity uppercase">
                            {isPlaying ? 'Pause Soundtrack' : 'Play Soundtrack'}
                        </span>
                        <div className="w-10 h-10 rounded-full border border-white flex items-center justify-center">
                            {isPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
                        </div>
                    </button>
                </>
            )}

            {/* SCENE 1: THE TITLE (HERO) */}
            <section className="relative h-screen w-full overflow-hidden sticky top-0">
                {/* Video/Image Background */}
                <motion.div
                    style={{ scale: scaleHero, opacity: opacityHero }}
                    className="absolute inset-0 z-0"
                >
                    {data.portadaImagenFondo ? (
                        <img src={data.portadaImagenFondo} className="w-full h-full object-cover brightness-50" />
                    ) : (
                        <div className="w-full h-full bg-neutral-900" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30 opacity-80" />
                </motion.div>

                <motion.div
                    style={{ y: yHero, opacity: opacityHero }}
                    className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center px-6"
                >
                    <motion.div
                        initial={{ opacity: 0, filter: "blur(10px)" }}
                        animate={{ opacity: 1, filter: "blur(0px)" }}
                        transition={{ duration: 1.5 }}
                    >
                        <p className="font-cine-body text-sm md:text-base tracking-[0.5em] uppercase mb-4 text-neutral-300">
                            Presenting
                        </p>
                        <h1 className="font-cine-title text-8xl md:text-[12rem] leading-[0.85] text-white mix-blend-overlay">
                            {data.type === 'CASAMIENTO' ? (
                                <>
                                    <span className="block">{data.nombreNovia}</span>
                                    <span className="block text-red-600">&</span>
                                    <span className="block">{data.nombreNovio}</span>
                                </>
                            ) : (
                                <span>{data.nombreQuinceanera || data.nombreEvento}</span>
                            )}
                        </h1>
                    </motion.div>
                </motion.div>

                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20 opacity-50 animate-bounce">
                    <span className="text-[10px] uppercase tracking-widest font-cine-body">Scroll to Begin</span>
                    <ChevronDown size={20} />
                </div>
            </section>

            {/* SCENE 2: THE PREMIERE (DETAILS) */}
            <section className="relative z-20 bg-black min-h-screen py-32 px-6">
                <div className="max-w-4xl mx-auto space-y-32">

                    {/* Date & Time "Credits" */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="font-cine-title text-6xl md:text-9xl text-neutral-800 leading-none text-right">
                            {data.fecha ? new Date(data.fecha).getDate() : "00"}
                            <span className="block text-4xl text-neutral-500">
                                {data.fecha ? format(new Date(data.fecha), "MMM", { locale: es }).toUpperCase() : "MES"}
                            </span>
                        </div>
                        <div className="border-l border-neutral-800 pl-12 space-y-8">
                            <div>
                                <h3 className="font-cine-body text-xs uppercase tracking-[0.3em] text-red-600 mb-2">The Date</h3>
                                <p className="font-cine-title text-4xl">One Night Only</p>
                            </div>
                            <div>
                                <h3 className="font-cine-body text-xs uppercase tracking-[0.3em] text-red-600 mb-2">Showtime</h3>
                                <p className="font-cine-title text-4xl">{data.hora} HS</p>
                            </div>
                            <div>
                                <h3 className="font-cine-body text-xs uppercase tracking-[0.3em] text-red-600 mb-2">Location</h3>
                                <p className="font-cine-title text-4xl">{data.lugarNombre}</p>
                                <p className="font-cine-body text-sm text-neutral-400 mt-2 max-w-xs">{data.direccion}</p>
                            </div>

                            {data.mapUrl && (
                                <Button
                                    variant="outline"
                                    className="rounded-none border-neutral-700 text-neutral-300 hover:bg-white hover:text-black font-cine-body text-xs uppercase tracking-widest py-6"
                                    onClick={() => window.open(data.mapUrl, '_blank')}
                                >
                                    Get Directions
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Countdown "Feature" */}
                    <div className="border-t border-b border-neutral-900 py-20 text-center">
                        <h2 className="font-cine-body text-xs uppercase tracking-[0.5em] mb-12 text-neutral-500">World Premiere In</h2>
                        <div className="flex justify-center gap-8 md:gap-20 font-cine-title text-6xl md:text-8xl">
                            <div>
                                {String(countdown.days).padStart(2, '0')}
                                <span className="block text-sm font-cine-body text-neutral-600 mt-2">Days</span>
                            </div>
                            <div>
                                {String(countdown.hours).padStart(2, '0')}
                                <span className="block text-sm font-cine-body text-neutral-600 mt-2">Hrs</span>
                            </div>
                            <div>
                                {String(countdown.minutes).padStart(2, '0')}
                                <span className="block text-sm font-cine-body text-neutral-600 mt-2">Mins</span>
                            </div>
                            <div>
                                {String(countdown.seconds).padStart(2, '0')}
                                <span className="block text-sm font-cine-body text-neutral-600 mt-2">Secs</span>
                            </div>
                        </div>
                    </div>

                    {/* Timeline / Cronograma */}
                    {data.cronogramaEventos && data.cronogramaEventos.length > 0 && (
                        <div className="space-y-12 text-center text-white">
                            <h2 className="font-cine-body text-xs uppercase tracking-[0.5em] text-neutral-500">Program</h2>
                            <div className="max-w-2xl mx-auto bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800">
                                <CronogramaOriginal
                                    events={typeof data.cronogramaEventos === 'string' ? JSON.parse(data.cronogramaEventos) : data.cronogramaEventos}
                                    className="bg-neutral-900/50 text-white"
                                    titleColor="#ffffff"
                                    subtitleColor="#a3a3a3"
                                    cardBgColor="bg-neutral-800"
                                    cardBorderColor="border-neutral-700"
                                    textColor="text-gray-300"
                                />
                            </div>
                        </div>
                    )}

                    {/* Dress Code */}
                    {data.dresscodeHabilitado && (
                        <DressCode
                            titulo={data.dresscodeTitulo}
                            tipo={data.dresscodeTipo}
                            observaciones={data.dresscodeObservaciones}
                            icono={data.dresscodeIcono}
                            className="bg-black text-white font-cine-body"
                            titleColor="#ffffff"
                            textColor="#d4d4d4"
                        />
                    )}

                    {/* Quiz */}
                    {data.triviaHabilitada && (
                        <div className="bg-neutral-900 py-12 px-6">
                            <div className="max-w-2xl mx-auto border border-neutral-700 rounded-xl p-8 bg-neutral-800">
                                <QuizTrivia
                                    titulo={data.triviaTitulo}
                                    subtitulo={data.triviaSubtitulo}
                                    preguntas={typeof data.triviaPreguntas === 'string' ? JSON.parse(data.triviaPreguntas) : data.triviaPreguntas}
                                    icono={data.triviaIcono}
                                    invitationId={data.id}
                                />
                            </div>
                        </div>
                    )}

                    {/* Shared Album */}
                    {data.albumCompartidoHabilitado && (
                        <SharedAlbum
                            invitationSlug={data.slug}
                            titulo={data.albumCompartidoTitulo}
                            descripcion={data.albumCompartidoDescripcion}
                            colorPrimario="#ffffff"
                            fechaEvento={data.fecha}
                            className="bg-neutral-900 text-white"
                        />
                    )}

                    {/* Gallery "Cast" */}
                    {(data.galeriaPrincipalHabilitada && data.galeriaPrincipalFotos.length > 0) && (
                        <div className="space-y-12">
                            <div className="flex items-end justify-between">
                                <h2 className="font-cine-title text-6xl text-white">Stills</h2>
                                <span className="font-cine-body text-xs uppercase tracking-widest text-neutral-500">Behind the Scenes</span>
                            </div>

                            <div className="flex overflow-x-auto gap-4 pb-8 snap-x">
                                {data.galeriaPrincipalFotos.map((foto: string, index: number) => (
                                    <div key={index} className="flex-none w-[80vw] md:w-[400px] aspect-[2/3] bg-neutral-900 snap-center relative grayscale hover:grayscale-0 transition-all duration-500">
                                        <img src={foto} className="w-full h-full object-cover" />
                                        <div className="absolute bottom-4 left-4 font-cine-body text-[10px] bg-black/50 backdrop-blur px-2 py-1">SCENE {index + 1}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* RSVP "Ticket" */}
                    <div className="bg-neutral-900 p-8 md:p-12 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Film size={120} />
                        </div>

                        <div className="relative z-10 grid md:grid-cols-2 gap-12">
                            <div>
                                <h2 className="font-cine-title text-5xl mb-6">Reserve Your Seat</h2>
                                <p className="font-cine-body text-neutral-400 text-sm leading-relaxed mb-8">
                                    Limited seating available. Please confirm your attendance before {data.fecha ? format(new Date(data.fecha), "MMMM dd", { locale: es }) : "..."}.
                                </p>
                                <div className="flex gap-4">
                                    <Button className="font-cine-body text-xs uppercase tracking-widest bg-white text-black hover:bg-neutral-200 py-6 px-8 rounded-none">
                                        I Will Attend
                                    </Button>
                                    <Button variant="outline" className="font-cine-body text-xs uppercase tracking-widest border-neutral-700 text-white hover:bg-neutral-800 py-6 px-8 rounded-none">
                                        Decline
                                    </Button>
                                </div>
                            </div>
                            <div className="border-l border-neutral-700 pl-12 hidden md:block">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end border-b border-neutral-800 pb-2">
                                        <span className="font-cine-body text-[10px] uppercase tracking-widest text-neutral-500">Admit One</span>
                                        <span className="font-cine-title text-2xl">VIP ACCESS</span>
                                    </div>
                                    <div className="barcode h-12 w-full bg-repeat-x opacity-50" style={{ backgroundImage: "linear-gradient(90deg, #fff 0%, #fff 2%, transparent 2%, transparent 4%, #fff 4%, #fff 8%)" }} />
                                    <div className="flex justify-between text-[10px] font-mono text-neutral-500">
                                        <span>ROW A</span>
                                        <span>SEAT {Math.floor(Math.random() * 100)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FAREWELL */}
                    {data.despedidaHabilitada && (
                        <Farewell
                            nombreEvento={data.nombreEvento}
                            tipo={data.type}
                            nombreNovia={data.nombreNovia}
                            nombreNovio={data.nombreNovio}
                            nombreQuinceanera={data.nombreQuinceanera}
                            despedidaFoto={data.despedidaFoto}
                            colorPrincipal="#ffffff"
                            className="bg-black text-white"
                            titleClassName="font-cine-display uppercase tracking-widest"
                            textClassName="font-cine-body font-light"
                        />
                    )}

                    {/* GIFTS */}
                    {data.regaloHabilitado && (
                        <div className="py-20 text-center bg-neutral-900 border-t border-neutral-800">
                            <div className="max-w-2xl mx-auto px-6">
                                <h2 className="font-cine-body text-xs uppercase tracking-[0.5em] text-neutral-500 mb-6">{data.regaloTitulo || "Gifts"}</h2>
                                <p className="text-xl text-neutral-300 mb-8 font-cine-body">{data.regaloMensaje}</p>
                                {data.regaloMostrarDatos && (
                                    <div className="bg-neutral-800 p-8 border border-neutral-700 inline-block text-left space-y-4 min-w-[300px]">
                                        {data.regaloBanco && <div><span className="text-neutral-500 text-xs uppercase block">Bank</span><span className="text-white">{data.regaloBanco}</span></div>}
                                        {data.regaloCbu && <div><span className="text-neutral-500 text-xs uppercase block">CBU</span><span className="text-white font-mono">{data.regaloCbu}</span></div>}
                                        {data.regaloAlias && <div><span className="text-neutral-500 text-xs uppercase block">Alias</span><span className="text-white font-mono">{data.regaloAlias}</span></div>}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Footer Credits */}
                    <footer className="text-center space-y-4 pt-20">
                        <Award size={32} className="mx-auto text-neutral-700" />
                        <div className="font-cine-body text-[10px] uppercase tracking-[0.3em] text-neutral-600">
                            A Production by {data.nombreNovia} & {data.nombreNovio}
                        </div>
                        <div className="text-[10px] text-neutral-800">
                            © {new Date().getFullYear()} Cinematic Invitations
                        </div>
                    </footer>
                </div>
            </section>
        </div>
    );
}
