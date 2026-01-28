"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, ChevronDown, Copy, Sparkles, Gift, Star, Heart } from "lucide-react";
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

export function AuroraDreamyTemplate({ data, themeConfig, guest, isPersonalized = false }: InvitationTemplateProps) {
    const { showToast } = useToast();
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [showBankDetails, setShowBankDetails] = useState(false);
    const countdown = useCountdown(data.fecha);
    const { scrollYProgress } = useScroll();

    const yHero = useTransform(scrollYProgress, [0, 0.5], [0, 150]);
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

    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
    };

    const countdownData = [
        { label: 'Días', value: countdown.days },
        { label: 'Horas', value: countdown.hours },
        { label: 'Minutos', value: countdown.minutes },
        { label: 'Segundos', value: countdown.seconds }
    ];

    return (
        <div className="min-h-screen bg-[#0a0a1f] text-white overflow-x-hidden relative">

            {/* Global Styles */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Space+Grotesk:wght@300;400;600&family=Satisfy&display=swap');
                
                .font-aurora-display { font-family: 'Orbitron', sans-serif; }
                .font-aurora-sans { font-family: 'Space Grotesk', sans-serif; }
                .font-aurora-script { font-family: 'Satisfy', cursive; }
                
                @keyframes holographic-gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                
                .holographic-bg {
                    background: linear-gradient(
                        135deg,
                        #667eea 0%,
                        #764ba2 25%,
                        #f093fb 50%,
                        #4facfe 75%,
                        #00f2fe 100%
                    );
                    background-size: 200% 200%;
                    animation: holographic-gradient 10s ease infinite;
                }
                
                .glass-aurora {
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 8px 32px 0 rgba(102, 126, 234, 0.2);
                }
                
                .holographic-text {
                    background: linear-gradient(135deg, #667eea, #764ba2, #f093fb, #4facfe, #00f2fe);
                    background-size: 200% 200%;
                    -webkit-background-clip: text;
                    background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: holographic-gradient 10s ease infinite;
                }

                @keyframes aurora-float {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    25% { transform: translateY(-20px) rotate(2deg); }
                    50% { transform: translateY(-10px) rotate(-2deg); }
                    75% { transform: translateY(-25px) rotate(1deg); }
                }

                .aurora-particle {
                    position: absolute;
                    width: 3px;
                    height: 3px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #667eea, #f093fb);
                    box-shadow: 0 0 10px #667eea, 0 0 20px #f093fb;
                    animation: aurora-float 6s ease-in-out infinite;
                }
            `}</style>

            {/* Floating Particles */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="aurora-particle"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 6}s`,
                            animationDuration: `${4 + Math.random() * 4}s`
                        }}
                    />
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
                        className="fixed top-6 right-6 z-50 p-4 glass-aurora text-white shadow-lg"
                    >
                        {isPlaying ? <Volume2 size={24} /> : <VolumeX size={24} />}
                    </motion.button>
                </>
            )}

            {/* HERO SECTION */}
            <section className="relative min-h-screen flex items-center justify-center p-6 text-center overflow-hidden">
                {/* Holographic Background */}
                <div className="absolute inset-0 holographic-bg opacity-20" />
                
                <motion.div
                    style={{ y: yHero, opacity: opacityHero }}
                    className="relative z-10 space-y-10 max-w-4xl"
                >
                    {/* Decorative Sparkle */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="mx-auto w-24 h-24"
                    >
                        <Star className="w-full h-full holographic-text" />
                    </motion.div>

                    {/* Title */}
                    <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="space-y-4">
                        <h1 className="font-aurora-display text-6xl md:text-8xl font-bold holographic-text">
                            {data.tituloPortada || data.nombreNovio + " & " + data.nombreNovia}
                        </h1>
                        <p className="font-aurora-script text-3xl md:text-5xl text-purple-300">
                            {data.subtituloPortada || "Nuestra Boda"}
                        </p>
                    </motion.div>

                    {/* Date */}
                    {data.fecha && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            className="glass-aurora p-6 inline-block"
                        >
                            <p className="font-aurora-sans text-xl md:text-2xl text-cyan-200">
                                {format(new Date(data.fecha), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                            </p>
                        </motion.div>
                    )}

                    {/* Scroll Indicator */}
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute bottom-10 left-1/2 -translate-x-1/2"
                    >
                        <ChevronDown className="w-8 h-8 text-purple-300" />
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
                        <h2 className="text-center font-aurora-display text-3xl md:text-4xl holographic-text mb-12 uppercase tracking-wider">
                            Cuenta Regresiva
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {countdownData.map((item, index) => (
                                <motion.div
                                    key={item.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="text-center"
                                >
                                    <div className="glass-aurora p-8 relative group hover:scale-105 transition-transform">
                                        <div className="absolute inset-0 holographic-bg opacity-0 group-hover:opacity-20 transition-opacity" />
                                        <span className="font-aurora-display text-5xl md:text-6xl font-bold block holographic-text">
                                            {String(item.value).padStart(2, '0')}
                                        </span>
                                        <span className="font-aurora-sans text-sm text-purple-300 uppercase tracking-widest mt-2 block">
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
                        className="glass-aurora p-12 text-center space-y-8 relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 holographic-bg opacity-0 group-hover:opacity-10 transition-opacity" />
                        
                        <Sparkles className="w-12 h-12 mx-auto text-purple-300" />

                        <div>
                            <h3 className="font-aurora-display holographic-text text-xl mb-4 tracking-widest uppercase">Ceremonia</h3>
                            <div className="space-y-2 font-aurora-sans text-cyan-100">
                                <p className="text-lg">{data.lugarNombre}</p>
                                <p className="text-sm opacity-70">{data.direccion}</p>
                                <p className="text-lg mt-2">{data.hora} HS</p>
                            </div>
                        </div>

                        <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-purple-400 to-transparent" />

                        <div>
                            <h3 className="font-aurora-display holographic-text text-xl mb-4 tracking-widest uppercase">Recepción</h3>
                            <p className="font-aurora-script text-2xl text-purple-300">Cena, brindis y celebración</p>
                        </div>

                        {data.mapUrl && (
                            <Button
                                className="mt-4 holographic-bg text-white hover:opacity-90 px-10 py-6 font-aurora-display tracking-widest uppercase transition-all duration-300"
                                onClick={() => window.open(data.mapUrl, '_blank')}
                            >
                                Ver Mapa
                            </Button>
                        )}
                    </motion.div>

                    {/* IMAGE FRAME */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 1 }}
                        className="relative aspect-[3/4] glass-aurora overflow-hidden group"
                    >
                        {data.portadaImagenFondo ? (
                            <>
                                <img src={data.portadaImagenFondo} className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110" alt="Couple" />
                                <div className="absolute inset-0 holographic-bg opacity-0 group-hover:opacity-20 mix-blend-overlay transition-opacity" />
                            </>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center holographic-bg">
                                <Heart className="w-20 h-20 text-white/50" />
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* GALLERY */}
                {(data.galeriaPrincipalHabilitada && data.galeriaPrincipalFotos.length > 0) && (
                    <section className="space-y-12">
                        <div className="text-center space-y-4">
                            <span className="font-aurora-sans text-purple-300 text-xs tracking-[0.3em] uppercase">Recuerdos</span>
                            <h2 className="font-aurora-display text-4xl md:text-5xl holographic-text">Momentos Capturados</h2>
                            <div className="w-32 h-[2px] bg-gradient-to-r from-transparent via-purple-400 to-transparent mx-auto" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {data.galeriaPrincipalFotos.map((foto: string, index: number) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="aspect-[3/4] relative group overflow-hidden glass-aurora"
                                >
                                    <div className="absolute inset-0 holographic-bg opacity-0 group-hover:opacity-30 transition-opacity z-10 pointer-events-none mix-blend-overlay" />
                                    <img
                                        src={foto}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        alt={`Moment ${index}`}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}

                {/* TRIVIA */}
                {data.triviaHabilitada && data.triviaPreguntas && (
                    <div className="quiz-container glass-aurora p-8 md:p-12">
                        <QuizTrivia
                            titulo="¿Qué tan bien nos conoces?"
                            subtitulo="Pon a prueba tu conocimiento"
                            preguntas={typeof data.triviaPreguntas === 'string' ? JSON.parse(data.triviaPreguntas) : data.triviaPreguntas}
                            invitationId={data.id}
                        />
                    </div>
                )}

                {/* SHARED ALBUM */}
                {data.albumCompartidoHabilitado && (
                    <section className="py-12 border-t border-b border-purple-400/30">
                        <SharedAlbum
                            invitationSlug={data.slug || ''}
                            titulo="Álbum Compartido"
                            descripcion="Ayúdanos a capturar la magia desde tu perspectiva."
                            colorPrimario="#667eea"
                            fechaEvento={data.fecha ? new Date(data.fecha) : undefined}
                            guestName="Invitado"
                        />
                    </section>
                )}

                {/* GIFT & BANK */}
                {data.regaloHabilitado && (
                    <motion.div
                        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                        className="text-center max-w-2xl mx-auto space-y-8 p-12 glass-aurora"
                    >
                        <Gift className="w-12 h-12 mx-auto text-purple-300" />
                        <div>
                            <h3 className="font-aurora-display holographic-text text-2xl mb-4 tracking-[0.2em] uppercase">{data.regaloTitulo || "Regalos"}</h3>
                            <p className="font-aurora-script text-2xl text-cyan-200 leading-relaxed">
                                {data.regaloMensaje || "Tu presencia es nuestro mejor regalo."}
                            </p>
                        </div>

                        {data.regaloMostrarDatos && (
                            <>
                                <Button
                                    variant="outline"
                                    className="border-2 border-purple-400 text-purple-300 hover:bg-purple-400/20 font-aurora-display uppercase tracking-widest text-xs"
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
                                            className="overflow-hidden glass-aurora p-6 space-y-4 text-left font-aurora-sans text-sm text-cyan-100"
                                        >
                                            {[
                                                { label: "Banco", value: data.regaloBanco },
                                                { label: "CBU/CVU", value: data.regaloCbu },
                                                { label: "Alias", value: data.regaloAlias },
                                                { label: "Titular", value: data.regaloTitular },
                                            ].map((field, i) => field.value && (
                                                <div key={i} className="flex justify-between items-center group cursor-pointer hover:text-purple-300 transition-colors" onClick={() => field.value && copyToClipboard(field.value)}>
                                                    <span className="font-bold">{field.label}:</span>
                                                    <span className="flex items-center gap-2">{field.value} <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100" /></span>
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
                                    <span className="font-aurora-sans text-purple-300 text-xs tracking-[0.3em] uppercase block mb-4">R.S.V.P</span>
                                    <div className="text-6xl mb-4">✨</div>
                                    <h2 className="font-aurora-display text-4xl md:text-5xl holographic-text">Hola, {guest.name}</h2>
                                    <div className="w-32 h-[2px] bg-gradient-to-r from-transparent via-purple-400 to-transparent mx-auto mt-6" />
                                    <p className="font-aurora-sans text-cyan-200 mt-6">
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
                                    <span className="font-aurora-sans text-purple-300 text-xs tracking-[0.3em] uppercase block mb-4">R.S.V.P</span>
                                    <h2 className="font-aurora-display text-5xl md:text-6xl holographic-text">Confirma tu Asistencia</h2>
                                    <div className="w-32 h-[2px] bg-gradient-to-r from-transparent via-purple-400 to-transparent mx-auto mt-6" />
                                    <p className="font-aurora-sans text-cyan-200 mt-6">
                                        Por favor responder antes del {data.fecha ? format(new Date(data.fecha), "d 'de' MMMM", { locale: es }) : "..."}
                                    </p>
                                </div>

                                <form className="space-y-8 text-left glass-aurora p-8 md:p-12">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase tracking-widest text-purple-300 font-aurora-sans">Nombre Completo</Label>
                                        <Input
                                            className="bg-white/5 border-0 border-b-2 border-purple-400/40 rounded-none focus-visible:ring-0 focus-visible:border-purple-400 px-0 text-xl font-aurora-sans placeholder:text-white/30 h-12 text-white"
                                            placeholder="Ingresa tu nombre"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="text-[10px] uppercase tracking-widest text-purple-300 font-aurora-sans">Asistencia</Label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button type="button" className="p-4 glass-aurora hover:bg-purple-400/20 transition-colors font-aurora-sans text-sm text-white">
                                                Confirmo Asistencia
                                            </button>
                                            <button type="button" className="p-4 glass-aurora hover:bg-purple-400/20 transition-colors font-aurora-sans text-sm text-white">
                                                No Podré Asistir
                                            </button>
                                        </div>
                                    </div>

                                    <Button className="w-full holographic-bg text-white hover:opacity-90 font-aurora-display uppercase tracking-widest py-6">
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
                        <p className="font-aurora-script text-4xl holographic-text">
                            "{data.mensajeFinalTexto || 'Esperamos celebrar junto a ustedes.'}"
                        </p>
                    </div>
                )}
            </main>
            
            <style jsx global>{`
                .quiz-container {
                    --color-background: rgba(10, 10, 31, 0.8);
                    --color-primary: #667eea;
                    --color-text-light: #ffffff;
                }
            `}</style>
        </div>
    );
}
