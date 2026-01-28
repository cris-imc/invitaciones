"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, MapPin, Calendar, Clock, Music, Heart, ChevronDown, Copy, Sparkles, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export function LiquidCrystalTemplate({ data, themeConfig }: InvitationTemplateProps) {
    const { showToast } = useToast();
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [showBankDetails, setShowBankDetails] = useState(false);
    const countdown = useCountdown(data.fecha);
    const { scrollYProgress } = useScroll();

    // Parallax effects
    const yHero = useTransform(scrollYProgress, [0, 0.5], [0, 200]);
    const opacityHero = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

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
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 text-slate-800 overflow-x-hidden relative font-sans">

            {/* Global Styles for Fonts & Liquid Effects */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap');
                
                .font-liquid-display { font-family: 'Outfit', sans-serif; }
                .font-liquid-serif { font-family: 'Cormorant Garamond', serif; }
                
                .glass-card {
                    background: rgba(255, 255, 255, 0.25);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.4);
                    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.05);
                }
                
                .liquid-blob {
                    position: absolute;
                    filter: blur(80px);
                    opacity: 0.6;
                    border-radius: 50%;
                    animation: float 20s infinite ease-in-out;
                }
                
                @keyframes float {
                    0% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0, 0) scale(1); }
                }
                @keyframes float {
                    0% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0, 0) scale(1); }
                }

                /* Theme Variables for Reusable Components */
                :root {
                    --color-primary: #4f46e5;
                    --color-text-light: #ffffff;
                    --font-ornamental: 'Cormorant Garamond', serif;
                }
            `}</style>

            {/* Background Animated Blobs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="liquid-blob bg-purple-300 w-96 h-96 top-0 left-0 -translate-x-1/2 -translate-y-1/2" style={{ animationDelay: '0s' }}></div>
                <div className="liquid-blob bg-blue-300 w-80 h-80 bottom-0 right-0 translate-x-1/3 translate-y-1/3" style={{ animationDelay: '-5s' }}></div>
                <div className="liquid-blob bg-pink-300 w-64 h-64 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ animationDelay: '-10s' }}></div>
            </div>

            {/* Music Control */}
            {data.musicaUrl && (
                <>
                    <audio ref={audioRef} loop src={data.musicaUrl} />
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={togglePlay}
                        className="fixed top-6 right-6 z-50 p-3 rounded-full glass-card text-indigo-900 shadow-lg"
                    >
                        {isPlaying ? <Volume2 size={24} /> : <VolumeX size={24} />}
                    </motion.button>
                </>
            )}

            {/* HERO SECTION */}
            <section className="relative min-h-screen flex items-center justify-center p-6 text-center">
                <motion.div
                    style={{ y: yHero, opacity: opacityHero }}
                    className="relative z-10 space-y-8 max-w-4xl"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="glass-card p-12 md:p-20 rounded-[3rem] inline-block"
                    >
                        <span className="font-liquid-display text-indigo-900/60 uppercase tracking-[0.4em] text-sm md:text-base font-semibold block mb-8">
                            {data.nombreEvento || (data.type === 'CASAMIENTO' ? 'Celebremos Juntos' : 'Estás Invitado')}
                        </span>

                        <h1 className="font-liquid-serif text-6xl md:text-8xl lg:text-9xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mb-6 leading-[0.9]">
                            {data.type === 'CASAMIENTO' ? (
                                <>
                                    <span className="block">{data.nombreNovia}</span>
                                    <span className="block text-4xl md:text-6xl my-2 text-indigo-300 font-light">&</span>
                                    <span className="block">{data.nombreNovio}</span>
                                </>
                            ) : (
                                <span>{data.nombreQuinceanera || data.nombreEvento}</span>
                            )}
                        </h1>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-12 font-liquid-display text-slate-600">
                            <div className="flex items-center gap-2 bg-white/30 px-6 py-3 rounded-full backdrop-blur-sm">
                                <Calendar size={18} className="text-indigo-500" />
                                <span>{data.fecha ? format(new Date(data.fecha), "dd MMMM yyyy", { locale: es }) : "Fecha por definir"}</span>
                            </div>
                            <div className="hidden md:block w-px h-8 bg-indigo-200"></div>
                            <div className="flex items-center gap-2 bg-white/30 px-6 py-3 rounded-full backdrop-blur-sm">
                                <Clock size={18} className="text-indigo-500" />
                                <span>{data.hora || "Hora por definir"} HS</span>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute bottom-10"
                >
                    <ChevronDown className="text-indigo-400 w-8 h-8" />
                </motion.div>
            </section>

            {/* COUNTDOWN */}
            <section className="py-20 relative z-10 w-full max-w-5xl mx-auto px-4">
                <div className="glass-card rounded-[2rem] p-10 md:p-16 text-center">
                    <h2 className="font-liquid-display text-xl uppercase tracking-widest text-indigo-900/70 mb-12">Countdown to the big day</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { label: 'Días', value: countdown.days },
                            { label: 'Horas', value: countdown.hours },
                            { label: 'Min', value: countdown.minutes },
                            { label: 'Seg', value: countdown.seconds }
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col items-center">
                                <div className="text-5xl md:text-7xl font-liquid-serif text-indigo-600 mb-2">
                                    {String(item.value).padStart(2, '0')}
                                </div>
                                <div className="text-sm font-liquid-display uppercase tracking-widest text-slate-500">{item.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* DETAILS & LOCATION */}
            <section className="py-20 container mx-auto px-6 relative z-10">
                <div className="grid md:grid-cols-2 gap-8 items-stretch">
                    {/* Location Card */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="glass-card rounded-[2rem] p-10 flex flex-col justify-between"
                    >
                        <div>
                            <div className="bg-indigo-100 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 text-indigo-600">
                                <MapPin size={24} />
                            </div>
                            <h3 className="font-liquid-serif text-4xl text-slate-800 mb-4">Ceremonia & Recepción</h3>
                            <p className="font-liquid-display text-xl font-semibold text-indigo-900 mb-2">{data.lugarNombre}</p>
                            <p className="text-slate-600 text-lg leading-relaxed mb-6">{data.direccion}</p>
                        </div>

                        {data.mapUrl && (
                            <Button
                                onClick={() => window.open(data.mapUrl, '_blank')}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-6 font-liquid-display text-lg shadow-lg hover:shadow-indigo-300/50 transition-all"
                            >
                                <Navigation className="mr-2 w-5 h-5" /> Ver Ubicación
                            </Button>
                        )}
                    </motion.div>

                    {/* Image Card */}
                    <div className="rounded-[2rem] overflow-hidden shadow-2xl relative min-h-[400px]">
                        {data.portadaImagenFondo ? (
                            <img
                                src={data.portadaImagenFondo}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
                                alt="Event"
                            />
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-200 to-purple-200 flex items-center justify-center">
                                <Sparkles className="w-20 h-20 text-white/50" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/60 to-transparent flex items-end p-10">
                            <p className="text-white font-liquid-serif text-3xl italic">
                                "{data.frasePersonalizadaTexto || 'Celebremos juntos este momento especial'}"
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* GALLERY (Interactive Fluid Grid) */}
            {(data.galeriaPrincipalHabilitada && data.galeriaPrincipalFotos.length > 0) && (
                <section className="py-20 relative z-10">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="font-liquid-serif text-5xl text-slate-800 mb-4">Momentos Especiales</h2>
                            <div className="w-24 h-1 bg-gradient-to-r from-indigo-400 to-purple-400 mx-auto rounded-full"></div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px]">
                            {data.galeriaPrincipalFotos.map((foto: string, index: number) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`rounded-2xl overflow-hidden shadow-md cursor-pointer group relative ${index % 3 === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}
                                >
                                    <img
                                        src={foto}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        alt={`Gallery ${index}`}
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* TRIVIA SECTION */}
            {data.triviaHabilitada && data.triviaPreguntas && (
                <section className="py-20 container mx-auto px-6 z-10 relative">
                    <div className="glass-card rounded-[2rem] p-8 md:p-12 overflow-hidden">
                        <QuizTrivia
                            titulo="Trivia Time"
                            subtitulo="¿Cuánto sabes sobre nosotros?"
                            preguntas={typeof data.triviaPreguntas === 'string' ? JSON.parse(data.triviaPreguntas) : data.triviaPreguntas}
                            invitationId={data.id}
                            className="bg-transparent"
                            cardClassName="bg-white/40 backdrop-blur-md border-white/50 shadow-none text-slate-800"
                        />
                    </div>
                </section>
            )}

            {/* SHARED ALBUM */}
            {data.albumCompartidoHabilitado && (
                <section className="py-12 bg-white/40 backdrop-blur-md">
                    <SharedAlbum
                        invitationSlug={data.slug || ''}
                        titulo="Álbum Compartido"
                        descripcion="Sube tus fotos y sé parte de nuestra historia."
                        colorPrimario="#6366f1" // indigo-500
                        fechaEvento={data.fecha ? new Date(data.fecha) : undefined}
                        guestName="Invitado"
                        className="bg-transparent"
                    />
                </section>
            )}

            {/* RSVP & GIFTS */}
            <section className="py-24 container mx-auto px-6 relative z-10 mb-20">
                <div className="grid lg:grid-cols-12 gap-12">
                    {/* RSVP Box */}
                    <div className="lg:col-span-7 glass-card rounded-[2.5rem] p-10 md:p-16 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-300 rounded-full filter blur-[80px] opacity-20 -mr-20 -mt-20"></div>

                        <h2 className="font-liquid-serif text-5xl text-slate-800 mb-2">R.S.V.P</h2>
                        <p className="text-slate-500 mb-8 font-liquid-display">Por favor confirmar antes del {data.fecha ? format(new Date(data.fecha), "dd MMM", { locale: es }) : "..."}</p>

                        <form className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-indigo-900 font-semibold">Nombre Completo</Label>
                                <Input id="name" className="bg-white/50 border-indigo-100 h-12 rounded-xl focus:ring-indigo-300 text-lg" placeholder="Tu nombre" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Button type="button" variant="outline" className="h-14 rounded-xl border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 text-lg font-liquid-display">
                                    ¡Sí, asistiré!
                                </Button>
                                <Button type="button" variant="outline" className="h-14 rounded-xl border-slate-200 hover:bg-slate-50 text-slate-600 text-lg font-liquid-display">
                                    No podré ir
                                </Button>
                            </div>

                            <Button className="w-full h-14 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-lg font-bold shadow-lg shadow-indigo-200 mt-4">
                                Enviar Confirmación
                            </Button>
                        </form>
                    </div>

                    {/* Gifts Box */}
                    {data.regaloHabilitado && (
                        <div className="lg:col-span-5 flex flex-col gap-6">
                            <div className="glass-card rounded-[2.5rem] p-10 flex-1 flex flex-col justify-center text-center">
                                <div className="mx-auto bg-green-100 p-4 rounded-full text-green-600 mb-6">
                                    <Heart size={32} fill="currentColor" />
                                </div>
                                <h3 className="font-liquid-serif text-3xl mb-4 text-slate-800">{data.regaloTitulo || "Regalos"}</h3>
                                <p className="text-slate-600 leading-relaxed mb-8">
                                    {data.regaloMensaje || "Tu presencia es nuestro mejor regalo."}
                                </p>

                                {data.regaloMostrarDatos && (
                                    <Button
                                        onClick={() => setShowBankDetails(!showBankDetails)}
                                        variant="outline"
                                        className="rounded-full border-green-300 text-green-700 hover:bg-green-50 mx-auto"
                                    >
                                        {showBankDetails ? "Ocultar Datos" : "Ver Datos Bancarios"}
                                    </Button>
                                )}
                            </div>

                            <AnimatePresence>
                                {showBankDetails && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="glass-card rounded-[2rem] p-6 text-sm space-y-3 overflow-hidden"
                                    >
                                        {[
                                            { label: "Banco", value: data.regaloBanco },
                                            { label: "CBU/CVU", value: data.regaloCbu },
                                            { label: "Alias", value: data.regaloAlias },
                                        ].map((field, i) => field.value && (
                                            <div key={i} onClick={() => copyToClipboard(field.value)} className="flex justify-between items-center p-3 bg-white/40 rounded-xl cursor-pointer hover:bg-white/60 transition-colors">
                                                <span className="font-semibold text-slate-700">{field.label}</span>
                                                <div className="flex items-center gap-2 text-indigo-600">
                                                    <span className="truncate max-w-[120px]">{field.value}</span>
                                                    <Copy size={14} />
                                                </div>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </section>

            {/* FOOTER */}
            <footer className="py-10 text-center text-slate-400 text-sm font-liquid-display relative z-10">
                <p>© {new Date().getFullYear()} Invitaciones Digitales</p>
            </footer>

        </div>
    );
}
