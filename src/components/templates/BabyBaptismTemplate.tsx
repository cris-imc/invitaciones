"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, ChevronDown, Copy, Sparkles, Gift, Cloud, Heart, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/Toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { SharedAlbum } from "@/components/invitation/SharedAlbum";
import { QuizTrivia } from "@/components/invitation/QuizTrivia";
import { PersonalizedRsvpForm } from "@/components/invitation/PersonalizedRsvpForm";
import { InvitationTemplateProps } from "./types";

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

export function BabyBaptismTemplate({ data, themeConfig, guest, isPersonalized = false }: InvitationTemplateProps) {
    const { showToast } = useToast();
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [showBankDetails, setShowBankDetails] = useState(false);
    const countdown = useCountdown(data.fecha);
    const { scrollYProgress } = useScroll();

    const yHero = useTransform(scrollYProgress, [0, 0.5], [0, 80]);
    const opacityHero = useTransform(scrollYProgress, [0, 0.3], [1, 0.7]);

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

    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] as const } }
    };

    const countdownData = [
        { label: 'Días', value: countdown.days },
        { label: 'Horas', value: countdown.hours },
        { label: 'Minutos', value: countdown.minutes },
        { label: 'Segundos', value: countdown.seconds }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#FFF4E6] via-[#F0E5CF] to-[#E8E9F3] text-gray-700 overflow-x-hidden relative">

            {/* Global Styles */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&family=Comfortaa:wght@300;400;600;700&family=Pacifico&display=swap');
                
                .font-baby-display { font-family: 'Comfortaa', cursive; }
                .font-baby-script { font-family: 'Pacifico', cursive; }
                .font-baby-text { font-family: 'Quicksand', sans-serif; }
                
                @keyframes cloud-float {
                    0%, 100% { transform: translateX(0) translateY(0); }
                    50% { transform: translateX(20px) translateY(-10px); }
                }
                
                @keyframes gentle-bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                
                @keyframes watercolor-spread {
                    0% { opacity: 0.3; filter: blur(20px); }
                    50% { opacity: 0.5; filter: blur(30px); }
                    100% { opacity: 0.3; filter: blur(20px); }
                }
                
                @keyframes twinkle {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.3); }
                }
                
                .pastel-gradient {
                    background: linear-gradient(
                        135deg,
                        #FADADD 0%,
                        #E8E9F3 25%,
                        #F0E5CF 50%,
                        #FFF4E6 75%,
                        #FADADD 100%
                    );
                    background-size: 400% 400%;
                    animation: watercolor-spread 8s ease infinite;
                }
                
                .cloud-float {
                    animation: cloud-float 6s ease-in-out infinite;
                }
                
                .gentle-bounce {
                    animation: gentle-bounce 3s ease-in-out infinite;
                }
                
                .card-baby {
                    background: rgba(255, 255, 255, 0.85);
                    border-radius: 40px;
                    box-shadow: 0 10px 40px rgba(232, 233, 243, 0.4);
                    border: 3px solid rgba(250, 218, 221, 0.5);
                }
                
                .watercolor-blob {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(40px);
                    animation: watercolor-spread 10s ease-in-out infinite;
                }
                
                .star-twinkle {
                    animation: twinkle 3s ease-in-out infinite;
                }
            `}</style>

            {/* Watercolor Background Blobs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="watercolor-blob w-96 h-96 bg-[#FADADD]/30 top-20 left-10" style={{ animationDelay: '0s' }} />
                <div className="watercolor-blob w-80 h-80 bg-[#E8E9F3]/30 bottom-20 right-20" style={{ animationDelay: '3s' }} />
                <div className="watercolor-blob w-64 h-64 bg-[#F0E5CF]/30 top-1/2 left-1/3" style={{ animationDelay: '6s' }} />
            </div>

            {/* Floating Clouds */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                {[...Array(8)].map((_, i) => (
                    <div
                        key={i}
                        className="cloud-float absolute"
                        style={{
                            left: `${10 + (i * 12)}%`,
                            top: `${10 + (i * 8)}%`,
                            animationDelay: `${i * 1.2}s`,
                            animationDuration: `${6 + i}s`
                        }}
                    >
                        <svg width="100" height="60" viewBox="0 0 100 60" opacity="0.4">
                            <path d="M 20,40 Q 10,30 20,20 Q 30,10 40,15 Q 50,5 60,15 Q 70,10 80,20 Q 90,30 80,40 Z" 
                                fill={['#FADADD', '#E8E9F3', '#F0E5CF'][i % 3]} 
                            />
                        </svg>
                    </div>
                ))}
            </div>

            {/* Twinkling Stars */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="star-twinkle absolute"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${2 + Math.random() * 2}s`
                        }}
                    >
                        <Sparkles className="w-4 h-4 text-[#E8E9F3]" />
                    </div>
                ))}
            </div>

            {/* Music Control */}
            {data.musicaUrl && (
                <>
                    <audio ref={audioRef} loop src={data.musicaUrl} />
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={togglePlay}
                        className="fixed top-6 right-6 z-50 p-4 card-baby text-[#FADADD] shadow-lg"
                    >
                        {isPlaying ? <Volume2 size={24} /> : <VolumeX size={24} />}
                    </motion.button>
                </>
            )}

            {/* HERO SECTION */}
            <section className="relative min-h-screen flex items-center justify-center p-6 text-center overflow-hidden">
                <motion.div
                    style={{ y: yHero, opacity: opacityHero }}
                    className="relative z-10 space-y-12 max-w-4xl"
                >
                    {/* Gentle Moon */}
                    <motion.div
                        animate={{ rotate: [0, 10, 0, -10, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="mx-auto w-32 h-32"
                    >
                        <Moon className="w-full h-full fill-[#FFF4E6] text-[#E8E9F3] drop-shadow-[0_0_30px_#E8E9F3]" />
                    </motion.div>

                    {/* Title */}
                    <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="space-y-8">
                        <div className="inline-flex items-center gap-3 mb-6">
                            <Heart className="w-10 h-10 text-[#FADADD] fill-[#FADADD]" />
                            <Cloud className="w-12 h-12 text-[#E8E9F3]" />
                            <Heart className="w-10 h-10 text-[#FADADD] fill-[#FADADD]" />
                        </div>
                        <h1 className="font-baby-script text-6xl md:text-8xl text-[#FADADD] drop-shadow-lg">
                            {data.nombreQuinceanera || data.tituloPortada || "Bienvenido al Mundo"}
                        </h1>
                        <p className="font-baby-display text-4xl md:text-5xl text-[#E8E9F3] font-semibold">
                            {data.subtituloPortada || data.nombreEvento || "Un Nuevo Angelito"}
                        </p>
                    </motion.div>

                    {/* Date Card */}
                    {data.fecha && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.6, duration: 0.8 }}
                            className="card-baby p-8 inline-block"
                        >
                            <Cloud className="w-10 h-10 mx-auto mb-3 text-[#E8E9F3]" />
                            <p className="font-baby-text text-2xl md:text-3xl font-semibold text-gray-600">
                                {format(new Date(data.fecha), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                            </p>
                        </motion.div>
                    )}

                    {/* Scroll Indicator */}
                    <motion.div
                        animate={{ y: [0, 15, 0] }}
                        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                        className="absolute bottom-10 left-1/2 -translate-x-1/2"
                    >
                        <ChevronDown className="w-10 h-10 text-[#FADADD]" />
                    </motion.div>
                </motion.div>
            </section>

            {/* COUNTDOWN */}
            {data.fecha && (
                <motion.section
                    initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
                    className="py-24 px-6"
                >
                    <div className="max-w-5xl mx-auto">
                        <h2 className="text-center font-baby-display text-4xl md:text-5xl text-[#FADADD] mb-16 font-semibold">
                            ✨ Faltan Poquitos Días ✨
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {countdownData.map((item, index) => (
                                <motion.div
                                    key={item.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.15, duration: 0.6 }}
                                    className="text-center"
                                >
                                    <div className="card-baby p-8 relative group hover:scale-105 transition-transform">
                                        <span className="font-baby-display text-6xl md:text-7xl font-bold block text-[#E8E9F3]">
                                            {String(item.value).padStart(2, '0')}
                                        </span>
                                        <span className="font-baby-text text-base text-[#FADADD] uppercase tracking-wider mt-3 block font-semibold">
                                            {item.label}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.section>
            )}

            {/* MAIN CONTENT */}
            <main className="relative z-10 container mx-auto px-6 py-24 space-y-32">

                {/* DETAILS CARD */}
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
                        className="card-baby p-12 text-center space-y-8"
                    >
                        <div className="w-20 h-20 mx-auto pastel-gradient rounded-full flex items-center justify-center">
                            <Cloud className="w-10 h-10 text-white" />
                        </div>

                        <div>
                            <h3 className="font-baby-display text-[#FADADD] text-3xl mb-4 font-semibold">Lugar del Evento</h3>
                            <div className="space-y-3 font-baby-text text-gray-600">
                                <p className="text-2xl font-semibold">{data.lugarNombre}</p>
                                <p className="text-lg">{data.direccion}</p>
                                <p className="text-2xl mt-4 text-[#E8E9F3] font-bold">{data.hora} HS</p>
                            </div>
                        </div>

                        <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#FADADD] to-transparent rounded-full" />

                        <div>
                            <h3 className="font-baby-display text-[#E8E9F3] text-3xl mb-4 font-semibold">Celebración</h3>
                            <p className="font-baby-script text-2xl text-gray-600">Un día lleno de amor y bendiciones</p>
                        </div>

                        {data.mapUrl && (
                            <Button
                                className="mt-4 pastel-gradient text-white hover:opacity-90 px-12 py-7 font-baby-text text-lg rounded-full shadow-xl border-0"
                                onClick={() => window.open(data.mapUrl, '_blank')}
                            >
                                Ver Ubicación
                            </Button>
                        )}
                    </motion.div>

                    {/* IMAGE FRAME */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 1 }}
                        className="relative aspect-[3/4] card-baby overflow-hidden group"
                    >
                        {data.portadaImagenFondo ? (
                            <>
                                <img src={data.portadaImagenFondo} className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105" alt="Baby" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#FADADD]/10 to-transparent" />
                            </>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center pastel-gradient">
                                <Heart className="w-24 h-24 text-white/50 fill-white/50" />
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* GALLERY */}
                {(data.galeriaPrincipalHabilitada && data.galeriaPrincipalFotos.length > 0) && (
                    <section className="space-y-12">
                        <div className="text-center space-y-4">
                            <span className="font-baby-text text-[#E8E9F3] text-sm tracking-widest uppercase font-semibold">Momentos Especiales</span>
                            <h2 className="font-baby-display text-5xl md:text-6xl text-[#FADADD] font-semibold">Galería de Recuerdos</h2>
                            <div className="w-32 h-1 bg-gradient-to-r from-transparent via-[#FADADD] to-transparent rounded-full mx-auto" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {data.galeriaPrincipalFotos.map((foto: string, index: number) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="aspect-[3/4] relative group overflow-hidden card-baby"
                                >
                                    <img
                                        src={foto}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        alt={`Memory ${index}`}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#FADADD]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}

                {/* TRIVIA */}
                {data.triviaHabilitada && data.triviaPreguntas && (
                    <div className="quiz-container card-baby p-8 md:p-12">
                        <QuizTrivia
                            titulo="¿Qué tanto sabes del bebé?"
                            subtitulo="Pequeño cuestionario"
                            preguntas={typeof data.triviaPreguntas === 'string' ? JSON.parse(data.triviaPreguntas) : data.triviaPreguntas}
                            invitationId={data.id}
                        />
                    </div>
                )}

                {/* SHARED ALBUM */}
                {data.albumCompartidoHabilitado && (
                    <section className="py-12 border-t-2 border-b-2 border-[#FADADD]/30 rounded-3xl">
                        <SharedAlbum
                            invitationSlug={data.slug || ''}
                            titulo="Álbum Compartido"
                            descripcion="Comparte tus momentos especiales del evento."
                            colorPrimario="#FADADD"
                            fechaEvento={data.fecha ? new Date(data.fecha) : undefined}
                            guestName="Invitado"
                        />
                    </section>
                )}

                {/* GIFT & BANK */}
                {data.regaloHabilitado && (
                    <motion.div
                        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                        className="text-center max-w-2xl mx-auto space-y-8 p-12 card-baby"
                    >
                        <div className="w-20 h-20 mx-auto pastel-gradient rounded-full flex items-center justify-center">
                            <Gift className="w-10 h-10 text-white" />
                        </div>
                        <div>
                            <h3 className="font-baby-display text-[#FADADD] text-4xl mb-4 font-semibold">{data.regaloTitulo || "Regalos"}</h3>
                            <p className="font-baby-script text-2xl text-gray-600 leading-relaxed">
                                {data.regaloMensaje || "Tu presencia es nuestro mejor regalo"}
                            </p>
                        </div>

                        {data.regaloMostrarDatos && (
                            <>
                                <Button
                                    variant="outline"
                                    className="border-3 border-[#E8E9F3] text-[#E8E9F3] hover:bg-[#E8E9F3]/20 font-baby-text uppercase tracking-widest text-sm rounded-full px-10 py-6"
                                    onClick={() => setShowBankDetails(!showBankDetails)}
                                >
                                    {showBankDetails ? "Ocultar Detalles" : "Ver Datos Bancarios"}
                                </Button>

                                <AnimatePresence>
                                    {showBankDetails && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden bg-white/90 rounded-3xl p-6 space-y-4 text-left font-baby-text text-base text-gray-700 border-3 border-[#E8E9F3]/30"
                                        >
                                            {[
                                                { label: "Banco", value: data.regaloBanco },
                                                { label: "CBU/CVU", value: data.regaloCbu },
                                                { label: "Alias", value: data.regaloAlias },
                                                { label: "Titular", value: data.regaloTitular },
                                            ].map((field, i) => field.value && (
                                                <div key={i} className="flex justify-between items-center group cursor-pointer hover:text-[#FADADD] transition-colors p-3 rounded-2xl hover:bg-[#FADADD]/10" onClick={() => field.value && copyToClipboard(field.value)}>
                                                    <span className="font-semibold">{field.label}:</span>
                                                    <span className="flex items-center gap-2">{field.value} <Copy className="w-4 h-4 opacity-0 group-hover:opacity-100" /></span>
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </>
                        )}
                    </motion.div>
                )}

                {/* RSVP */}
                <section className="py-24 relative text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        className="max-w-xl mx-auto space-y-12"
                    >
                        {isPersonalized && guest ? (
                            <>
                                <div>
                                    <span className="font-baby-text text-[#E8E9F3] text-sm tracking-widest uppercase font-semibold block mb-4">R.S.V.P</span>
                                    <div className="text-6xl mb-4">👶</div>
                                    <h2 className="font-baby-display text-4xl md:text-5xl text-[#FADADD] font-semibold">Hola, {guest.name}</h2>
                                    <div className="w-32 h-1 bg-gradient-to-r from-transparent via-[#FADADD] to-transparent rounded-full mx-auto mt-6" />
                                    <p className="font-baby-text text-gray-600 mt-6 text-lg">
                                        Por favor responder antes del {data.fecha ? format(new Date(data.fecha), "d 'de' MMMM", { locale: es }) : "..."}
                                    </p>
                                </div>
                                <PersonalizedRsvpForm
                                    guest={guest}
                                    invitation={data}
                                    onSuccess={() => {}}
                                />
                            </>
                        ) : (
                            <>
                                <div>
                                    <span className="font-baby-text text-[#E8E9F3] text-sm tracking-widest uppercase font-semibold block mb-4">R.S.V.P</span>
                                    <h2 className="font-baby-display text-5xl md:text-6xl text-[#FADADD] font-semibold">Confirmá tu Asistencia</h2>
                                    <div className="w-32 h-1 bg-gradient-to-r from-transparent via-[#FADADD] to-transparent rounded-full mx-auto mt-6" />
                                    <p className="font-baby-text text-gray-600 mt-6 text-lg">
                                        Por favor responder antes del {data.fecha ? format(new Date(data.fecha), "d 'de' MMMM", { locale: es }) : "..."}
                                    </p>
                                </div>

                                <form className="space-y-8 text-left card-baby p-8 md:p-12">
                                    <div className="space-y-2">
                                        <Label className="text-sm uppercase tracking-wider text-[#FADADD] font-baby-text font-semibold">Nombre Completo</Label>
                                        <Input
                                            className="bg-white border-2 border-[#FADADD]/40 rounded-3xl focus-visible:ring-0 focus-visible:border-[#FADADD] px-6 text-xl font-baby-text placeholder:text-gray-400 h-14 text-gray-700"
                                            placeholder="Ingresa tu nombre"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="text-sm uppercase tracking-wider text-[#E8E9F3] font-baby-text font-semibold">Asistencia</Label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button type="button" className="p-6 bg-white border-3 border-[#E8E9F3] hover:bg-[#E8E9F3]/10 transition-colors font-baby-text text-lg text-gray-700 rounded-3xl font-semibold">
                                                Confirmo Asistencia
                                            </button>
                                            <button type="button" className="p-6 bg-white border-3 border-[#FADADD] hover:bg-[#FADADD]/10 transition-colors font-baby-text text-lg text-gray-700 rounded-3xl font-semibold">
                                                No Podré Asistir
                                            </button>
                                        </div>
                                    </div>

                                    <Button className="w-full pastel-gradient text-white hover:opacity-90 font-baby-text text-xl uppercase tracking-wider py-7 border-0 rounded-full shadow-xl">
                                        Enviar Confirmación
                                    </Button>
                                </form>
                            </>
                        )}
                    </motion.div>
                </section>

                {/* FINAL MESSAGE */}
                {data.mensajeFinalHabilitado && (
                    <div className="text-center max-w-2xl mx-auto py-12">
                        <p className="font-baby-script text-5xl text-[#FADADD]">
                            "{data.mensajeFinalTexto || 'Con amor, esperamos tu presencia'}"
                        </p>
                        <div className="w-32 h-1 bg-gradient-to-r from-transparent via-[#FADADD] to-transparent rounded-full mx-auto mt-6" />
                    </div>
                )}
            </main>

            <footer className="py-8 text-center border-t-2 border-[#FADADD]/30 bg-white/50 rounded-t-3xl">
                <p className="font-baby-text text-sm tracking-wider text-[#E8E9F3] font-semibold">
                    ✨ Hecho con amor y ternura ✨
                </p>
            </footer>
            
            <style jsx global>{`
                .quiz-container {
                    --color-background: rgba(255, 255, 255, 0.9);
                    --color-primary: #FADADD;
                    --color-text-light: #4a5568;
                }
            `}</style>
        </div>
    );
}
