"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Volume2, VolumeX, MapPin, Calendar, Clock, Feather, Flower, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export function NaturalBohoTemplate({ data, themeConfig }: InvitationTemplateProps) {
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
        <div className="min-h-screen bg-[#F7F3E8] text-[#5D5C58] font-sans overflow-x-hidden relative">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Quicksand:wght@300;400;500;600&display=swap');
                
                .font-boho-title { font-family: 'Cinzel Decorative', cursive; }
                .font-boho-body { font-family: 'Quicksand', sans-serif; }
                
                .torn-paper-top {
                  clip-path: polygon(0% 10%, 5% 5%, 10% 10%, 15% 5%, 20% 10%, 25% 5%, 30% 10%, 35% 5%, 40% 10%, 45% 5%, 50% 10%, 55% 5%, 60% 10%, 65% 5%, 70% 10%, 75% 5%, 80% 10%, 85% 5%, 90% 10%, 95% 5%, 100% 10%, 100% 100%, 0% 100%);
                }
                .torn-paper-bottom {
                  clip-path: polygon(0% 0%, 100% 0%, 100% 90%, 95% 95%, 90% 90%, 85% 95%, 80% 90%, 75% 95%, 70% 90%, 65% 95%, 60% 90%, 55% 95%, 50% 90%, 45% 95%, 40% 90%, 35% 95%, 30% 90%, 25% 95%, 20% 90%, 15% 95%, 10% 90%, 5% 95%, 0% 90%);
                }

                /* Quiz Overrides */
                .bg-white { background-color: #FAF7F2 !important; color: #5D5C61 !important; border-color: #E5E0D5 !important; }
                .text-gray-800 { color: #8C5E58 !important; }
                .text-gray-600 { color: #A6B08D !important; }
            `}</style>

            {/* Background Texture */}
            <div className="fixed inset-0 opacity-40 pointer-events-none mix-blend-multiply"
                style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/cream-paper.png")` }}
            />

            {/* Floating Elements */}
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 120, repeat: Infinity, ease: "linear" }} className="fixed -top-20 -right-20 text-[#A6B08D] opacity-20 pointer-events-none">
                <Flower size={300} strokeWidth={0.5} />
            </motion.div>

            {/* Audio */}
            {data.musicaUrl && (
                <>
                    <audio ref={audioRef} loop src={data.musicaUrl} />
                    <button onClick={togglePlay} className="fixed top-6 right-6 z-50 p-4 bg-[#A6B08D]/20 rounded-full text-[#5D5C58] hover:bg-[#A6B08D] hover:text-white transition-colors">
                        {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
                    </button>
                </>
            )}

            {/* HERO */}
            <section className="min-h-screen flex flex-col justify-center items-center text-center p-8 relative">
                <div className="bg-white/60 backdrop-blur-sm p-12 md:p-20 shadow-xl rounded-sm max-w-2xl relative torn-paper-bottom pt-32">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#5D5C58] text-[#F7F3E8] w-24 h-24 rounded-full flex items-center justify-center font-boho-title text-3xl shadow-lg border-4 border-[#F7F3E8]">
                        {new Date(data.fecha).getDate()}
                    </div>

                    <p className="font-boho-body uppercase tracking-[0.3em] text-sm mb-6 text-[#A6B08D]">Save The Date</p>
                    <h1 className="font-boho-title text-5xl md:text-7xl text-[#8C5E58] mb-8 leading-relaxed">
                        {data.type === 'CASAMIENTO' ? (
                            <>
                                {data.nombreNovia} <br /> <span className="text-3xl text-[#5D5C58]">&</span> <br /> {data.nombreNovio}
                            </>
                        ) : (
                            data.nombreQuinceanera || data.nombreEvento
                        )}
                    </h1>

                    <div className="flex justify-center items-center gap-2 text-[#5D5C58]/80 font-boho-body font-semibold">
                        <MapPin size={18} />
                        <span>{data.lugarNombre}</span>
                    </div>
                </div>
            </section>

            {/* COUNTDOWN */}
            <section className="py-20 bg-[#A6B08D]/10 torn-paper-top torn-paper-bottom relative z-10">
                <div className="container mx-auto text-center space-y-12">
                    <Feather className="mx-auto text-[#A6B08D]" />
                    <div className="flex justify-center gap-12 font-boho-title text-[#5D5C58]">
                        {[
                            { l: 'Días', v: countdown.days },
                            { l: 'Horas', v: countdown.hours },
                            { l: 'Min', v: countdown.minutes },
                        ].map((i, k) => (
                            <div key={k} className="text-center">
                                <div className="text-5xl mb-2">{String(i.v).padStart(2, '0')}</div>
                                <div className="text-xs font-boho-body uppercase tracking-wider">{i.l}</div>
                            </div>
                        ))}
                        <div className="text-center">
                            <div className="text-5xl mb-2">{String(countdown.seconds).padStart(2, '0')}</div>
                            <div className="text-xs font-boho-body uppercase tracking-wider">Seg</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* TIMELINE */}
            {data.cronogramaEventos && data.cronogramaEventos.length > 0 && (
                <section className="py-20 relative z-20">
                    <div className="container mx-auto px-6 max-w-4xl bg-white/80 p-8 rounded-xl shadow-lg">
                        <h2 className="font-boho-title text-4xl text-[#8C5E58] text-center mb-12">Itinerario</h2>
                        <CronogramaOriginal
                            events={typeof data.cronogramaEventos === 'string' ? JSON.parse(data.cronogramaEventos) : data.cronogramaEventos}
                            className="bg-transparent"
                            titleColor="#8C5E58"
                            subtitleColor="#A6B08D"
                            cardBgColor="bg-[#FAF7F2]"
                            cardBorderColor="border-[#E5E0D5]"
                            textColor="text-[#5D5C61]"
                        />
                    </div>
                </section>
            )}

            {/* DRESS CODE */}
            {data.dresscodeHabilitado && (
                <section className="py-12 container mx-auto text-center relative z-20">
                    <div className="inline-block bg-[#A6B08D]/10 p-8 rounded-full border-2 border-[#A6B08D] border-dashed">
                        <DressCode
                            titulo={data.dresscodeTitulo}
                            tipo={data.dresscodeTipo}
                            observaciones={data.dresscodeObservaciones}
                            icono={data.dresscodeIcono}
                            titleColor="#8C5E58"
                            textColor="#5D5C61"
                        />
                    </div>
                </section>
            )}

            {/* QUIZ */}
            {data.triviaHabilitada && (
                <section className="py-20 bg-[#F7F3E8] relative z-20">
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
                <section className="py-12 container mx-auto px-6 text-center relative z-20">
                    <SharedAlbum
                        invitationSlug={data.slug}
                        titulo={data.albumCompartidoTitulo}
                        descripcion={data.albumCompartidoDescripcion}
                        colorPrimario="#8C5E58"
                        fechaEvento={data.fecha}
                        className="bg-[#F7F3E8] bg-opacity-50"
                    />
                </section>
            )}

            {/* CONTENT */}
            <section className="py-24 px-6 container mx-auto max-w-4xl grid md:grid-cols-2 gap-12">
                <div className="space-y-8">
                    <h2 className="font-boho-title text-4xl text-[#8C5E58]">Detalles</h2>
                    <p className="font-boho-body leading-loose text-lg">
                        Únete a nosotros para celebrar con amor, risas y buena compañía.
                        La ceremonia será al aire libre, por lo que recomendamos calzado cómodo.
                    </p>

                    <div className="space-y-4 pt-4">
                        <div className="flex items-center gap-4 bg-white p-4 shadow-sm rounded-lg">
                            <Clock className="text-[#A6B08D]" />
                            <span className="font-boho-body font-bold">{data.hora} HS</span>
                        </div>
                        <div className="bg-white p-4 shadow-sm rounded-lg">
                            <div className="flex items-center gap-4 mb-2">
                                <MapPin className="text-[#A6B08D]" />
                                <span className="font-boho-body font-bold">{data.lugarNombre}</span>
                            </div>
                            <p className="text-sm pl-10 opacity-70 mb-4">{data.direccion}</p>
                            {data.mapUrl && <Button variant="outline" className="w-full border-[#A6B08D] text-[#5D5C58]">Ver Mapa</Button>}
                        </div>
                    </div>
                </div>

                <div className="relative h-96 md:h-auto">
                    {data.portadaImagenFondo ? (
                        <div className="absolute inset-0 p-4 bg-white shadow-xl rotate-2">
                            <img src={data.portadaImagenFondo} className="w-full h-full object-cover" />
                            <div className="absolute -top-4 -right-4 bg-[#D69F99] rounded-full p-4 shadow-md rotate-12">
                                <Heart className="text-white" fill="white" />
                            </div>
                        </div>
                    ) : (
                        <div className="w-full h-full bg-[#E5E0D5] flex items-center justify-center p-4 shadow-xl -rotate-1">
                            <p className="font-boho-title text-2xl text-[#fff]">Nuestra Historia</p>
                        </div>
                    )}
                </div>
            </section>

            {/* RSVP */}
            <div className="pb-24 pt-12 text-center relative z-20">
                <Button className="bg-[#8C5E58] hover:bg-[#7a524d] text-white px-12 py-6 rounded-full font-boho-body uppercase tracking-widest shadow-lg shadow-[#8C5E58]/30">
                    Confirmar Asistencia
                </Button>
            </div>

            {/* FAREWELL */}
            {data.despedidaHabilitada && (
                <div className="py-12 bg-[#E5E0D5]/30 text-center relative z-20">
                    <Farewell
                        nombreEvento={data.nombreEvento}
                        tipo={data.type}
                        nombreNovia={data.nombreNovia}
                        nombreNovio={data.nombreNovio}
                        nombreQuinceanera={data.nombreQuinceanera}
                        despedidaFoto={data.despedidaFoto}
                        colorPrincipal="#8C5E58"
                        className="bg-transparent"
                        titleClassName="font-boho-title font-bold text-4xl"
                        textClassName="font-boho-body"
                    />
                </div>
            )}

            {/* GIFTS */}
            {data.regaloHabilitado && (
                <section className="py-24 relative z-20 bg-white">
                    <div className="container mx-auto px-6 max-w-2xl text-center">
                        <div className="text-[#8C5E58] mb-6 flex justify-center"><Heart size={40} /></div>
                        <h2 className="font-boho-title text-4xl text-[#8C5E58] mb-6">{data.regaloTitulo || "Mesa de Regalos"}</h2>
                        <p className="text-[#5D5C61] font-boho-body text-lg mb-8">{data.regaloMensaje}</p>

                        {data.regaloMostrarDatos && (
                            <div className="bg-[#FAF7F2] p-8 rounded-xl border border-[#E5E0D5] inline-block w-full">
                                <div className="space-y-4 text-left">
                                    {data.regaloBanco && <div className="flex justify-between border-b border-[#E5E0D5] pb-2"><span>Banco:</span> <span className="font-bold text-[#8C5E58]">{data.regaloBanco}</span></div>}
                                    {data.regaloCbu && <div className="flex justify-between border-b border-[#E5E0D5] pb-2"><span>CBU:</span> <span className="font-bold text-[#8C5E58]">{data.regaloCbu}</span></div>}
                                    {data.regaloAlias && <div className="flex justify-between"><span>Alias:</span> <span className="font-bold text-[#8C5E58]">{data.regaloAlias}</span></div>}
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            )}
        </div>
    );
}
