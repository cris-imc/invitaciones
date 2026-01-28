"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, ChevronDown, Copy, Sparkles, Gift, Zap, Music } from "lucide-react";
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

export function DiscoNightTemplate({ data, themeConfig }: InvitationTemplateProps) {
    const { showToast } = useToast();
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [showBankDetails, setShowBankDetails] = useState(false);
    const countdown = useCountdown(data.fecha);
    const { scrollYProgress } = useScroll();

    const yHero = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

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
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const countdownData = [
        { label: 'Días', value: countdown.days },
        { label: 'Horas', value: countdown.hours },
        { label: 'Minutos', value: countdown.minutes },
        { label: 'Segundos', value: countdown.seconds }
    ];

    return (
        <div className="min-h-screen bg-[#0a0014] text-white overflow-x-hidden relative">

            {/* Global Styles */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Audiowide&family=Righteous&family=Orbitron:wght@400;700;900&display=swap');
                
                .font-disco-display { font-family: 'Audiowide', cursive; }
                .font-disco-title { font-family: 'Righteous', cursive; }
                .font-disco-text { font-family: 'Orbitron', sans-serif; }
                
                @keyframes neon-pulse {
                    0%, 100% { 
                        text-shadow: 0 0 10px #FF006E, 0 0 20px #FF006E, 0 0 30px #FF006E, 0 0 40px #FF006E;
                    }
                    50% { 
                        text-shadow: 0 0 20px #FF006E, 0 0 30px #FF006E, 0 0 40px #FF006E, 0 0 60px #FF006E, 0 0 80px #FF006E;
                    }
                }
                
                @keyframes strobe {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.3; }
                }
                
                @keyframes disco-gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                
                .neon-text {
                    color: #FF006E;
                    animation: neon-pulse 2s ease-in-out infinite;
                }
                
                .disco-gradient {
                    background: linear-gradient(
                        135deg,
                        #FF006E 0%,
                        #8338EC 25%,
                        #3A86FF 50%,
                        #FB5607 75%,
                        #FF006E 100%
                    );
                    background-size: 400% 400%;
                    animation: disco-gradient 8s ease infinite;
                }
                
                .glass-disco {
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 0, 110, 0.3);
                    box-shadow: 0 8px 32px 0 rgba(255, 0, 110, 0.3);
                }
                
                @keyframes confetti-fall {
                    0% { transform: translateY(-100vh) rotate(0deg); }
                    100% { transform: translateY(100vh) rotate(720deg); }
                }
                
                .confetti {
                    position: absolute;
                    width: 10px;
                    height: 10px;
                    animation: confetti-fall linear infinite;
                }
                
                @keyframes spotlight-rotate {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .spotlight {
                    position: absolute;
                    width: 200px;
                    height: 600px;
                    background: linear-gradient(to bottom, rgba(255, 0, 110, 0.3), transparent);
                    filter: blur(30px);
                    animation: spotlight-rotate 10s linear infinite;
                    transform-origin: top center;
                }
            `}</style>

            {/* Animated Confetti */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                {[...Array(30)].map((_, i) => (
                    <div
                        key={i}
                        className="confetti"
                        style={{
                            left: `${Math.random() * 100}%`,
                            backgroundColor: ['#FF006E', '#8338EC', '#3A86FF', '#FB5607', '#FFBE0B'][Math.floor(Math.random() * 5)],
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${5 + Math.random() * 5}s`
                        }}
                    />
                ))}
            </div>

            {/* Rotating Spotlights */}
            <div className="fixed top-0 left-1/4 pointer-events-none">
                <div className="spotlight" style={{ animationDelay: '0s' }} />
            </div>
            <div className="fixed top-0 right-1/4 pointer-events-none">
                <div className="spotlight" style={{ animationDelay: '3s' }} />
            </div>
            <div className="fixed top-0 left-1/2 pointer-events-none">
                <div className="spotlight" style={{ animationDelay: '6s' }} />
            </div>

            {/* Music Control */}
            {data.musicaUrl && (
                <>
                    <audio ref={audioRef} loop src={data.musicaUrl} />
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={togglePlay}
                        className="fixed top-6 right-6 z-50 p-4 glass-disco text-[#FF006E] shadow-lg"
                    >
                        {isPlaying ? <Volume2 size={24} /> : <VolumeX size={24} />}
                    </motion.button>
                </>
            )}

            {/* HERO SECTION */}
            <section className="relative min-h-screen flex items-center justify-center p-6 text-center overflow-hidden">
                {/* Pulsating Background */}
                <div className="absolute inset-0 disco-gradient opacity-30" />
                
                <motion.div
                    style={{ y: yHero }}
                    className="relative z-10 space-y-12 max-w-4xl"
                >
                    {/* Neon Icon */}
                    <motion.div
                        animate={{ 
                            scale: [1, 1.2, 1],
                            rotate: [0, 180, 360]
                        }}
                        transition={{ 
                            duration: 4, 
                            repeat: Infinity, 
                            ease: "easeInOut" 
                        }}
                        className="mx-auto w-32 h-32"
                    >
                        <Zap className="w-full h-full text-[#FF006E] drop-shadow-[0_0_30px_#FF006E]" />
                    </motion.div>

                    {/* Title */}
                    <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="space-y-6">
                        <h1 className="font-disco-display text-6xl md:text-8xl font-bold neon-text uppercase tracking-wider">
                            {data.tituloPortada || data.nombreNovio + " & " + data.nombreNovia}
                        </h1>
                        <p className="font-disco-title text-3xl md:text-5xl text-[#3A86FF] drop-shadow-[0_0_20px_#3A86FF]">
                            {data.subtituloPortada || "Noche de Fiesta"}
                        </p>
                    </motion.div>

                    {/* Date */}
                    {data.fecha && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            className="glass-disco p-8 inline-block"
                        >
                            <Music className="w-8 h-8 mx-auto mb-3 text-[#8338EC]" />
                            <p className="font-disco-text text-xl md:text-2xl text-white">
                                {format(new Date(data.fecha), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                            </p>
                        </motion.div>
                    )}

                    {/* Scroll Indicator */}
                    <motion.div
                        animate={{ y: [0, 15, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute bottom-10 left-1/2 -translate-x-1/2"
                    >
                        <ChevronDown className="w-10 h-10 text-[#FB5607] drop-shadow-[0_0_20px_#FB5607]" />
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
                        <h2 className="text-center font-disco-title text-4xl md:text-5xl neon-text mb-16 uppercase tracking-widest">
                            ¡La Fiesta Empieza En!
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
                                    <div className="glass-disco p-8 relative group hover:scale-110 transition-transform">
                                        <div className="absolute inset-0 disco-gradient opacity-0 group-hover:opacity-30 transition-opacity" />
                                        <span className="font-disco-display text-6xl md:text-7xl font-bold block text-[#FF006E] drop-shadow-[0_0_20px_#FF006E]">
                                            {String(item.value).padStart(2, '0')}
                                        </span>
                                        <span className="font-disco-text text-sm text-[#3A86FF] uppercase tracking-widest mt-3 block">
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
                        className="glass-disco p-12 text-center space-y-8 relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 disco-gradient opacity-0 group-hover:opacity-20 transition-opacity" />
                        
                        <Sparkles className="w-12 h-12 mx-auto text-[#FFBE0B] drop-shadow-[0_0_20px_#FFBE0B]" />

                        <div>
                            <h3 className="font-disco-title text-[#FF006E] text-2xl mb-4 tracking-widest uppercase">Lugar</h3>
                            <div className="space-y-2 font-disco-text text-white">
                                <p className="text-xl">{data.lugarNombre}</p>
                                <p className="text-sm opacity-70">{data.direccion}</p>
                                <p className="text-lg mt-2 text-[#3A86FF]">{data.hora} HS</p>
                            </div>
                        </div>

                        <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[#FF006E] to-transparent" />

                        <div>
                            <h3 className="font-disco-title text-[#8338EC] text-2xl mb-4 tracking-widest uppercase">La Fiesta</h3>
                            <p className="font-disco-text text-xl text-white">DJ en vivo, Pista de baile y Mucha Diversión</p>
                        </div>

                        {data.mapUrl && (
                            <Button
                                className="mt-4 disco-gradient text-white hover:opacity-90 px-10 py-6 font-disco-text tracking-widest uppercase transition-all duration-300 border-0"
                                onClick={() => window.open(data.mapUrl, '_blank')}
                            >
                                Ver Ubicación
                            </Button>
                        )}
                    </motion.div>

                    {/* IMAGE FRAME */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 1 }}
                        className="relative aspect-[3/4] glass-disco overflow-hidden group"
                    >
                        {data.portadaImagenFondo ? (
                            <>
                                <img src={data.portadaImagenFondo} className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110" alt="Party" />
                                <div className="absolute inset-0 disco-gradient opacity-0 group-hover:opacity-30 mix-blend-overlay transition-opacity" />
                            </>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center disco-gradient">
                                <Music className="w-24 h-24 text-white/50" />
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* GALLERY */}
                {(data.galeriaPrincipalHabilitada && data.galeriaPrincipalFotos.length > 0) && (
                    <section className="space-y-12">
                        <div className="text-center space-y-4">
                            <span className="font-disco-text text-[#FB5607] text-xs tracking-[0.3em] uppercase">Momentos</span>
                            <h2 className="font-disco-title text-5xl md:text-6xl neon-text">Galería de Fiesta</h2>
                            <div className="w-32 h-[2px] bg-gradient-to-r from-transparent via-[#FF006E] to-transparent mx-auto" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {data.galeriaPrincipalFotos.map((foto: string, index: number) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="aspect-[3/4] relative group overflow-hidden glass-disco"
                                >
                                    <div className="absolute inset-0 disco-gradient opacity-0 group-hover:opacity-40 transition-opacity z-10 pointer-events-none mix-blend-overlay" />
                                    <img
                                        src={foto}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        alt={`Party ${index}`}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}

                {/* TRIVIA */}
                {data.triviaHabilitada && data.triviaPreguntas && (
                    <div className="quiz-container glass-disco p-8 md:p-12">
                        <QuizTrivia
                            titulo="¿Qué tan bien conoces al festejado?"
                            subtitulo="Pon a prueba tu conocimiento"
                            preguntas={typeof data.triviaPreguntas === 'string' ? JSON.parse(data.triviaPreguntas) : data.triviaPreguntas}
                            invitationId={data.id}
                        />
                    </div>
                )}

                {/* SHARED ALBUM */}
                {data.albumCompartidoHabilitado && (
                    <section className="py-12 border-t border-b border-[#FF006E]/30">
                        <SharedAlbum
                            invitationSlug={data.slug || ''}
                            titulo="Álbum de Fiesta"
                            descripcion="Comparte tus mejores momentos de la noche."
                            colorPrimario="#FF006E"
                            fechaEvento={data.fecha ? new Date(data.fecha) : undefined}
                            guestName="Invitado"
                        />
                    </section>
                )}

                {/* GIFT & BANK */}
                {data.regaloHabilitado && (
                    <motion.div
                        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                        className="text-center max-w-2xl mx-auto space-y-8 p-12 glass-disco"
                    >
                        <Gift className="w-12 h-12 mx-auto text-[#FFBE0B] drop-shadow-[0_0_20px_#FFBE0B]" />
                        <div>
                            <h3 className="font-disco-title text-[#FF006E] text-3xl mb-4 tracking-[0.2em] uppercase">{data.regaloTitulo || "Regalos"}</h3>
                            <p className="font-disco-text text-xl text-white leading-relaxed">
                                {data.regaloMensaje || "Tu presencia es el mejor regalo."}
                            </p>
                        </div>

                        {data.regaloMostrarDatos && (
                            <>
                                <Button
                                    variant="outline"
                                    className="border-2 border-[#8338EC] text-[#8338EC] hover:bg-[#8338EC]/20 font-disco-text uppercase tracking-widest text-xs"
                                    onClick={() => setShowBankDetails(!showBankDetails)}
                                >
                                    {showBankDetails ? "Ocultar Datos" : "Ver Datos Bancarios"}
                                </Button>

                                <AnimatePresence>
                                    {showBankDetails && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden glass-disco p-6 space-y-4 text-left font-disco-text text-sm text-white"
                                        >
                                            {[
                                                { label: "Banco", value: data.regaloBanco },
                                                { label: "CBU/CVU", value: data.regaloCbu },
                                                { label: "Alias", value: data.regaloAlias },
                                                { label: "Titular", value: data.regaloTitular },
                                            ].map((field, i) => field.value && (
                                                <div key={i} className="flex justify-between items-center group cursor-pointer hover:text-[#FF006E] transition-colors" onClick={() => field.value && copyToClipboard(field.value)}>
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
                        <div>
                            <span className="font-disco-text text-[#FB5607] text-xs tracking-[0.3em] uppercase block mb-4">R.S.V.P</span>
                            <h2 className="font-disco-title text-6xl md:text-7xl neon-text uppercase">Confirmá</h2>
                            <div className="w-32 h-[2px] bg-gradient-to-r from-transparent via-[#FF006E] to-transparent mx-auto mt-6" />
                            <p className="font-disco-text text-white mt-6">
                                Responder antes del {data.fecha ? format(new Date(data.fecha), "d 'de' MMMM", { locale: es }) : "..."}
                            </p>
                        </div>

                        <form className="space-y-8 text-left glass-disco p-8 md:p-12">
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase tracking-widest text-[#FF006E] font-disco-text">Nombre Completo</Label>
                                <Input
                                    className="bg-white/5 border-0 border-b-2 border-[#FF006E]/40 rounded-none focus-visible:ring-0 focus-visible:border-[#FF006E] px-0 text-xl font-disco-text placeholder:text-white/30 h-12 text-white"
                                    placeholder="Tu nombre"
                                />
                            </div>

                            <div className="space-y-4">
                                <Label className="text-[10px] uppercase tracking-widest text-[#8338EC] font-disco-text">Asistencia</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button type="button" className="p-4 glass-disco hover:bg-[#FF006E]/20 transition-colors font-disco-text text-sm text-white border border-[#FF006E]/30">
                                        ¡Voy a la Fiesta!
                                    </button>
                                    <button type="button" className="p-4 glass-disco hover:bg-[#8338EC]/20 transition-colors font-disco-text text-sm text-white border border-[#8338EC]/30">
                                        No Podré Asistir
                                    </button>
                                </div>
                            </div>

                            <Button className="w-full disco-gradient text-white hover:opacity-90 font-disco-text uppercase tracking-widest py-6 border-0">
                                Enviar Confirmación
                            </Button>
                        </form>
                    </motion.div>
                </section>

                {/* FINAL MESSAGE */}
                {data.mensajeFinalHabilitado && (
                    <div className="text-center max-w-2xl mx-auto py-12">
                        <p className="font-disco-title text-4xl neon-text">
                            "{data.mensajeFinalTexto || '¡Nos vemos en la pista de baile!'}"
                        </p>
                        <div className="w-32 h-[2px] bg-gradient-to-r from-transparent via-[#FF006E] to-transparent mx-auto mt-6" />
                    </div>
                )}
            </main>

            <footer className="py-8 text-center border-t border-[#FF006E]/30 glass-disco">
                <p className="font-disco-text text-[10px] tracking-[0.2em] text-[#8338EC] uppercase">
                    Let's Party All Night
                </p>
            </footer>
            
            <style jsx global>{`
                .quiz-container {
                    --color-background: rgba(10, 0, 20, 0.9);
                    --color-primary: #FF006E;
                    --color-text-light: #ffffff;
                }
            `}</style>
        </div>
    );
}
