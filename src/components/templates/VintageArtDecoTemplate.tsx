"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Volume2, VolumeX, MapPin, Calendar, Clock, Gift, Copy, Gem } from "lucide-react";
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

export function VintageArtDecoTemplate({ data, themeConfig }: InvitationTemplateProps) {
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
        showToast("Copiado con elegancia", "success");
    };

    return (
        <div className="min-h-screen bg-[#1a1a1a] text-[#e0c097] font-sans selection:bg-[#e0c097] selection:text-black overflow-x-hidden relative border-[12px] border-[#1a1a1a]">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Marcellus&family=Limelight&display=swap');
                
                .font-deco-title { font-family: 'Limelight', cursive; }
                .font-deco-body { font-family: 'Marcellus', serif; }
                
                .deco-border {
                    border: 1px solid #e0c097;
                    position: relative;
                }
                
                .deco-border::before {
                    content: '';
                    position: absolute;
                    top: -4px; left: -4px; right: -4px; bottom: -4px;
                    border: 1px solid #e0c097;
                    opacity: 0.5;
                    pointer-events: none;
                }
                
                .deco-pattern {
                    background-image: 
                        linear-gradient(30deg, #e0c097 12%, transparent 12.5%, transparent 87%, #e0c097 87.5%, #e0c097),
                        linear-gradient(150deg, #e0c097 12%, transparent 12.5%, transparent 87%, #e0c097 87.5%, #e0c097),
                        linear-gradient(30deg, #e0c097 12%, transparent 12.5%, transparent 87%, #e0c097 87.5%, #e0c097),
                        linear-gradient(150deg, #e0c097 12%, transparent 12.5%, transparent 87%, #e0c097 87.5%, #e0c097),
                        linear-gradient(60deg, #b08d55 25%, transparent 25.5%, transparent 75%, #b08d55 75%, #b08d55),
                        linear-gradient(60deg, #b08d55 25%, transparent 25.5%, transparent 75%, #b08d55 75%, #b08d55);
                    background-size: 80px 140px;
                    background-position: 0 0, 0 0, 40px 70px, 40px 70px, 0 0, 40px 70px;
                    opacity: 0.03;
                }

                /* Quiz Overrides */
                .bg-white { background-color: #222 !important; color: #e0c097 !important; border-color: #e0c097 !important; }
                .text-gray-800 { color: #e0c097 !important; }
                .text-gray-600 { color: #b08d55 !important; }
            `}</style>

            {/* Pattern Overlay */}
            <div className="fixed inset-0 deco-pattern pointer-events-none" />

            {/* Decorative Corners */}
            <div className="fixed top-4 left-4 w-16 h-16 border-t-2 border-l-2 border-[#e0c097] z-50 pointer-events-none" />
            <div className="fixed top-4 right-4 w-16 h-16 border-t-2 border-r-2 border-[#e0c097] z-50 pointer-events-none" />
            <div className="fixed bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 border-[#e0c097] z-50 pointer-events-none" />
            <div className="fixed bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 border-[#e0c097] z-50 pointer-events-none" />

            {/* Audio */}
            {data.musicaUrl && (
                <>
                    <audio ref={audioRef} loop src={data.musicaUrl} />
                    <button
                        onClick={togglePlay}
                        className="fixed top-8 right-8 z-[60] w-12 h-12 rounded-full border border-[#e0c097] bg-black/50 text-[#e0c097] flex items-center justify-center hover:bg-[#e0c097] hover:text-black transition-colors"
                    >
                        {isPlaying ? <Volume2 size={18} /> : <VolumeX size={18} />}
                    </button>
                </>
            )}

            {/* HERO */}
            <header className="min-h-screen flex items-center justify-center relative p-8 text-center pt-24 pb-20">
                <div className="max-w-4xl w-full border border-[#e0c097] p-8 md:p-16 relative">
                    <div className="absolute inset-1 border border-[#e0c097]/30" />

                    <div className="space-y-8">
                        <div className="flex items-center justify-center gap-4 text-xs font-deco-body tracking-[0.3em] uppercase opacity-70">
                            <div className="h-px w-12 bg-[#e0c097]" />
                            <span>A Grand Celebration</span>
                            <div className="h-px w-12 bg-[#e0c097]" />
                        </div>

                        <h1 className="font-deco-title text-5xl md:text-7xl lg:text-8xl leading-none text-transparent bg-clip-text bg-gradient-to-b from-[#f8e5c4] via-[#e0c097] to-[#b08d55] drop-shadow-md">
                            {data.type === 'CASAMIENTO' ? (
                                <>
                                    <span className="block mb-4">{data.nombreNovia}</span>
                                    <span className="block text-4xl my-6 font-deco-body italic">&</span>
                                    <span className="block">{data.nombreNovio}</span>
                                </>
                            ) : (
                                <span>{data.nombreQuinceanera || data.nombreEvento}</span>
                            )}
                        </h1>

                        <div className="py-8">
                            <p className="font-deco-body text-xl md:text-2xl tracking-widest uppercase text-[#e0c097]/80">
                                {data.fecha ? format(new Date(data.fecha), "MMMM dd, yyyy", { locale: es }) : "DATE TBD"}
                            </p>
                            <div className="w-24 h-px bg-[#e0c097] mx-auto my-4" />
                            <p className="font-deco-body text-lg uppercase tracking-widest text-[#e0c097]/60">
                                {data.lugarNombre}
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* COUNTDOWN */}
            <section className="py-20 border-y border-[#e0c097]/20 bg-[#151515]">
                <div className="container mx-auto px-6 text-center">
                    <div className="flex justify-center gap-8 md:gap-16">
                        {[
                            { label: 'Days', value: countdown.days },
                            { label: 'Hours', value: countdown.hours },
                            { label: 'Minutes', value: countdown.minutes },
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col items-center">
                                <span className="font-deco-title text-5xl md:text-7xl text-[#e0c097] mb-2">{String(item.value).padStart(2, '0')}</span>
                                <span className="font-deco-body text-xs uppercase tracking-[0.2em]">{item.label}</span>
                            </div>
                        ))}
                        <div className="flex flex-col items-center">
                            <span className="font-deco-title text-5xl md:text-7xl text-[#e0c097] mb-2">{String(countdown.seconds).padStart(2, '0')}</span>
                            <span className="font-deco-body text-xs uppercase tracking-[0.2em]">Seconds</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* TIMELINE */}
            {data.cronogramaEventos && data.cronogramaEventos.length > 0 && (
                <section className="py-20 container mx-auto px-6 max-w-4xl text-center">
                    <h2 className="font-deco-title text-4xl mb-12">Itinerary</h2>
                    <div className="deco-border p-8 bg-[#1a1a1a]">
                        <CronogramaOriginal
                            events={typeof data.cronogramaEventos === 'string' ? JSON.parse(data.cronogramaEventos) : data.cronogramaEventos}
                            className="bg-[#1a1a1a] text-[#e0c097]"
                            titleColor="#e0c097"
                            subtitleColor="#b08d55"
                            cardBgColor="bg-[#222]"
                            cardBorderColor="border-[#e0c097]/30"
                            textColor="text-[#e0c097]/80"
                        />
                    </div>
                </section>
            )}

            {/* DRESS CODE */}
            {data.dresscodeHabilitado && (
                <section className="py-12 container mx-auto text-center">
                    <div className="inline-block border-y border-[#e0c097] py-8 px-12">
                        <DressCode
                            titulo={data.dresscodeTitulo}
                            tipo={data.dresscodeTipo}
                            observaciones={data.dresscodeObservaciones}
                            icono={data.dresscodeIcono}
                            className="bg-[#1a1a1a]"
                            titleColor="#e0c097"
                            textColor="#f8e5c4"
                        />
                    </div>
                </section>
            )}

            {/* QUIZ */}
            {data.triviaHabilitada && (
                <section className="py-20 bg-[#151515] border-y border-[#e0c097]/20">
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
                <section className="py-20 container mx-auto px-6 text-center">
                    <SharedAlbum
                        invitationSlug={data.slug}
                        titulo={data.albumCompartidoTitulo}
                        descripcion={data.albumCompartidoDescripcion}
                        colorPrimario="#e0c097"
                        fechaEvento={data.fecha}
                        className="bg-[#1a1a1a] text-[#e0c097]"
                    />
                </section>
            )}

            {/* DETAILS */}
            <section className="py-24 container mx-auto px-6 max-w-5xl">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div className="relative aspect-[3/4] border-8 border-[#222]">
                        {data.portadaImagenFondo ? (
                            <img src={data.portadaImagenFondo} className="w-full h-full object-cover grayscale sepia-[.3]" />
                        ) : (
                            <div className="w-full h-full bg-[#222] flex items-center justify-center">
                                <Gem size={48} className="opacity-20" />
                            </div>
                        )}
                        <div className="absolute top-4 left-4 right-4 bottom-4 border border-[#e0c097]/50" />
                    </div>

                    <div className="text-center md:text-left space-y-12">
                        <div>
                            <h2 className="font-deco-title text-4xl mb-6">Ceremony & Reception</h2>
                            <p className="font-deco-body text-lg leading-relaxed text-[#e0c097]/80">
                                We invite you to join us for an evening of celebration, dancing, and joy.
                                Dress strictly formal.
                            </p>
                        </div>

                        <div className="space-y-6 font-deco-body">
                            <div className="flex items-center gap-4 justify-center md:justify-start">
                                <Clock className="w-6 h-6" />
                                <span className="text-xl">{data.hora} HS</span>
                            </div>
                            <div className="flex items-center gap-4 justify-center md:justify-start">
                                <MapPin className="w-6 h-6" />
                                <div>
                                    <span className="block text-xl">{data.lugarNombre}</span>
                                    <span className="block text-sm opacity-60 mt-1">{data.direccion}</span>
                                </div>
                            </div>
                        </div>

                        {data.mapUrl && (
                            <Button className="w-full md:w-auto bg-[#e0c097] text-black hover:bg-[#b08d55] font-deco-body tracking-widest uppercase font-bold py-6 px-12 rounded-none">
                                View Map
                            </Button>
                        )}
                    </div>
                </div>
            </section>

            {/* GIFTS */}
            {data.regaloHabilitado && (
                <section className="py-24 bg-[#151515] border-y border-[#e0c097]/20">
                    <div className="container mx-auto px-6 max-w-2xl text-center space-y-8">
                        <Gift size={40} className="mx-auto text-[#e0c097]" />
                        <h2 className="font-deco-title text-3xl uppercase tracking-widest">Registry</h2>
                        <p className="font-deco-body text-lg opacity-80 italic">
                            "{data.regaloMensaje || "Your presence is the only gift we require."}"
                        </p>

                        {data.regaloMostrarDatos && (
                            <div className="bg-[#1a1a1a] p-8 border border-[#e0c097] relative mt-8">
                                <div className="absolute top-0 left-0 w-full h-1 bg-[#e0c097]" />
                                <div className="space-y-4">
                                    {[
                                        { label: "Bank", value: data.regaloBanco },
                                        { label: "CBU", value: data.regaloCbu },
                                        { label: "Alias", value: data.regaloAlias },
                                    ].map((field, i) => field.value && (
                                        <div key={i} className="flex justify-between items-center border-b border-[#e0c097]/20 pb-2 last:border-0 last:pb-0">
                                            <span className="font-deco-body text-sm uppercase opacity-60 ml-0 mr-auto">{field.label}</span>
                                            <span className="font-mono text-[#e0c097] mr-4">{field.value}</span>
                                            <button onClick={() => copyToClipboard(field.value)} className="hover:text-white transition-colors">
                                                <Copy size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* RSVP */}
            <section className="py-32 container mx-auto px-6 text-center">
                <div className="max-w-xl mx-auto border-2 border-[#e0c097] p-2">
                    <div className="border border-[#e0c097] p-10 md:p-16 space-y-8">
                        <h2 className="font-deco-title text-5xl">R.S.V.P.</h2>
                        <p className="font-deco-body uppercase tracking-widest text-sm">
                            Kindly respond by {data.fecha ? format(new Date(data.fecha), "MMMM dd", { locale: es }) : "..."}
                        </p>

                        <div className="space-y-4 pt-8">
                            <input
                                type="text"
                                placeholder="Your Name"
                                className="w-full bg-transparent border-b border-[#e0c097] py-3 text-center font-deco-body text-xl focus:outline-none placeholder:text-[#e0c097]/30"
                            />
                            <div className="flex gap-4 pt-8">
                                <button className="flex-1 border border-[#e0c097] py-4 uppercase tracking-[0.2em] text-xs hover:bg-[#e0c097] hover:text-black transition-colors font-bold">
                                    Accepts
                                </button>
                                <button className="flex-1 border border-[#e0c097] py-4 uppercase tracking-[0.2em] text-xs hover:bg-[#e0c097] hover:text-black transition-colors font-bold">
                                    Regrets
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAREWELL */}
            {data.despedidaHabilitada && (
                <div className="py-12 bg-[#1a1a1a] text-center">
                    <Farewell
                        nombreEvento={data.nombreEvento}
                        tipo={data.type}
                        nombreNovia={data.nombreNovia}
                        nombreNovio={data.nombreNovio}
                        nombreQuinceanera={data.nombreQuinceanera}
                        despedidaFoto={data.despedidaFoto}
                        colorPrincipal="#e0c097"
                        className="bg-[#1a1a1a] text-[#e0c097]"
                        titleClassName="font-deco-title tracking-widest text-4xl"
                        textClassName="font-deco-body opacity-80"
                    />
                </div>
            )}
        </div>
    );
}
