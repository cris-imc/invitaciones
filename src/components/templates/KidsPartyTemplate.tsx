"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, ChevronDown, Copy, Sparkles, Gift, Star, Smile, Balloon } from "lucide-react";
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

export function KidsPartyTemplate({ data, themeConfig }: InvitationTemplateProps) {
    const { showToast } = useToast();
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [showBankDetails, setShowBankDetails] = useState(false);
    const countdown = useCountdown(data.fecha);
    const { scrollYProgress } = useScroll();

    const yHero = useTransform(scrollYProgress, [0, 0.5], [0, 120]);

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

    const bounce = {
        hidden: { opacity: 0, scale: 0 },
        visible: { 
            opacity: 1, 
            scale: 1, 
            transition: { 
                type: "spring" as const,
                stiffness: 300,
                damping: 15
            } 
        }
    };

    const countdownData = [
        { label: 'Días', value: countdown.days, emoji: '📅' },
        { label: 'Horas', value: countdown.hours, emoji: '⏰' },
        { label: 'Minutos', value: countdown.minutes, emoji: '⏱️' },
        { label: 'Segundos', value: countdown.seconds, emoji: '⚡' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#FFE5EC] via-[#FFF4E6] to-[#E5F5FF] text-gray-800 overflow-x-hidden relative">

            {/* Global Styles */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@300;400;600;700&family=Bubblegum+Sans&family=Chewy&display=swap');
                
                .font-kids-display { font-family: 'Bubblegum Sans', cursive; }
                .font-kids-title { font-family: 'Chewy', cursive; }
                .font-kids-text { font-family: 'Fredoka', sans-serif; }
                
                @keyframes bounce-float {
                    0%, 100% { transform: translateY(0) rotate(-5deg); }
                    50% { transform: translateY(-20px) rotate(5deg); }
                }
                
                @keyframes rainbow-shift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                @keyframes confetti-pop {
                    0% { transform: translateY(0) scale(0); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: translateY(-100px) scale(1); opacity: 0; }
                }
                
                .rainbow-gradient {
                    background: linear-gradient(
                        135deg,
                        #FF6B6B 0%,
                        #4ECDC4 20%,
                        #FFE66D 40%,
                        #95E1D3 60%,
                        #C7CEEA 80%,
                        #FF6B6B 100%
                    );
                    background-size: 400% 400%;
                    animation: rainbow-shift 6s ease infinite;
                }
                
                .balloon-float {
                    animation: bounce-float 4s ease-in-out infinite;
                }
                
                .card-kids {
                    background: rgba(255, 255, 255, 0.9);
                    border-radius: 30px;
                    box-shadow: 0 10px 40px rgba(255, 107, 107, 0.2);
                    border: 4px solid transparent;
                    background-clip: padding-box;
                }
                
                .confetti-piece {
                    position: absolute;
                    width: 12px;
                    height: 12px;
                    animation: confetti-pop 3s ease-out infinite;
                }
            `}</style>

            {/* Floating Balloons SVG */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                {[...Array(15)].map((_, i) => (
                    <div
                        key={i}
                        className="balloon-float absolute"
                        style={{
                            left: `${10 + (i * 6)}%`,
                            bottom: `${-20 + Math.random() * 40}%`,
                            animationDelay: `${i * 0.5}s`,
                            animationDuration: `${3 + Math.random() * 2}s`
                        }}
                    >
                        <svg width="60" height="80" viewBox="0 0 60 80">
                            <ellipse cx="30" cy="35" rx="25" ry="30" 
                                fill={['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#C7CEEA'][i % 5]} 
                                opacity="0.8"
                            />
                            <line x1="30" y1="65" x2="30" y2="80" stroke="#888" strokeWidth="2"/>
                        </svg>
                    </div>
                ))}
            </div>

            {/* Confetti */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                {[...Array(25)].map((_, i) => (
                    <div
                        key={i}
                        className="confetti-piece"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            backgroundColor: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#C7CEEA'][Math.floor(Math.random() * 5)],
                            animationDelay: `${Math.random() * 3}s`,
                            borderRadius: Math.random() > 0.5 ? '50%' : '0'
                        }}
                    />
                ))}
            </div>

            {/* Music Control */}
            {data.musicaUrl && (
                <>
                    <audio ref={audioRef} loop src={data.musicaUrl} />
                    <motion.button
                        whileHover={{ scale: 1.2, rotate: 10 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={togglePlay}
                        className="fixed top-6 right-6 z-50 p-4 rainbow-gradient rounded-full text-white shadow-2xl"
                    >
                        {isPlaying ? <Volume2 size={28} /> : <VolumeX size={28} />}
                    </motion.button>
                </>
            )}

            {/* HERO SECTION */}
            <section className="relative min-h-screen flex items-center justify-center p-6 text-center overflow-hidden">
                <motion.div
                    style={{ y: yHero }}
                    className="relative z-10 space-y-10 max-w-4xl"
                >
                    {/* Spinning Star */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        className="mx-auto w-32 h-32"
                    >
                        <Star className="w-full h-full fill-[#FFE66D] text-[#FFE66D] drop-shadow-[0_0_20px_#FFE66D]" />
                    </motion.div>

                    {/* Title */}
                    <motion.div initial="hidden" animate="visible" variants={bounce} className="space-y-6">
                        <div className="inline-block px-8 py-3 rainbow-gradient rounded-full mb-4">
                            <Smile className="w-12 h-12 text-white inline-block" />
                        </div>
                        <h1 className="font-kids-display text-7xl md:text-9xl font-bold text-[#FF6B6B] drop-shadow-lg">
                            {data.tituloPortada || "¡Fiesta Infantil!"}
                        </h1>
                        <p className="font-kids-title text-4xl md:text-6xl text-[#4ECDC4]">
                            {data.subtituloPortada || data.nombreFestejado || "Celebremos Juntos"}
                        </p>
                    </motion.div>

                    {/* Date Card */}
                    {data.fecha && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
                            className="card-kids p-8 inline-block border-[#FF6B6B]"
                        >
                            <Balloon className="w-10 h-10 mx-auto mb-3 text-[#4ECDC4]" />
                            <p className="font-kids-text text-2xl md:text-3xl font-semibold text-gray-700">
                                {format(new Date(data.fecha), "EEEE, d 'de' MMMM", { locale: es })}
                            </p>
                        </motion.div>
                    )}

                    {/* Scroll Indicator */}
                    <motion.div
                        animate={{ y: [0, 20, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute bottom-10 left-1/2 -translate-x-1/2"
                    >
                        <ChevronDown className="w-12 h-12 text-[#95E1D3]" />
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
                        <h2 className="text-center font-kids-title text-5xl md:text-6xl text-[#FF6B6B] mb-16 drop-shadow-md">
                            🎉 ¡Faltan Solo...! 🎊
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {countdownData.map((item, index) => (
                                <motion.div
                                    key={item.label}
                                    initial={{ opacity: 0, scale: 0 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ 
                                        delay: index * 0.15,
                                        type: "spring",
                                        stiffness: 260,
                                        damping: 20
                                    }}
                                    className="text-center"
                                >
                                    <div className="card-kids p-8 relative group hover:scale-110 transition-transform">
                                        <div className="text-5xl mb-2">{item.emoji}</div>
                                        <span className="font-kids-display text-6xl md:text-7xl font-bold block text-[#4ECDC4] drop-shadow-md">
                                            {String(item.value).padStart(2, '0')}
                                        </span>
                                        <span className="font-kids-text text-lg text-[#FF6B6B] font-semibold uppercase mt-2 block">
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
                        className="card-kids p-12 text-center space-y-8"
                    >
                        <div className="w-20 h-20 mx-auto rainbow-gradient rounded-full flex items-center justify-center">
                            <Sparkles className="w-10 h-10 text-white" />
                        </div>

                        <div>
                            <h3 className="font-kids-title text-[#FF6B6B] text-3xl mb-4">📍 Dónde</h3>
                            <div className="space-y-2 font-kids-text text-gray-700">
                                <p className="text-2xl font-semibold">{data.lugarNombre}</p>
                                <p className="text-lg opacity-80">{data.direccion}</p>
                                <p className="text-2xl mt-4 text-[#4ECDC4] font-bold">{data.hora} HS</p>
                            </div>
                        </div>

                        <div className="w-full h-1 rainbow-gradient rounded-full" />

                        <div>
                            <h3 className="font-kids-title text-[#4ECDC4] text-3xl mb-4">🎈 ¡Vamos a Jugar!</h3>
                            <p className="font-kids-text text-xl text-gray-700">Juegos, risas y mucha diversión</p>
                        </div>

                        {data.mapUrl && (
                            <Button
                                className="mt-4 rainbow-gradient text-white hover:opacity-90 px-12 py-7 font-kids-text text-xl rounded-full shadow-xl border-0"
                                onClick={() => window.open(data.mapUrl, '_blank')}
                            >
                                Ver Ubicación 🗺️
                            </Button>
                        )}
                    </motion.div>

                    {/* IMAGE FRAME */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 1 }}
                        className="relative aspect-[3/4] card-kids overflow-hidden group"
                    >
                        {data.portadaImagenFondo ? (
                            <>
                                <img src={data.portadaImagenFondo} className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110" alt="Party" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#FF6B6B]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center rainbow-gradient">
                                <Balloon className="w-28 h-28 text-white/70" />
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* GALLERY */}
                {(data.galeriaPrincipalHabilitada && data.galeriaPrincipalFotos.length > 0) && (
                    <section className="space-y-12">
                        <div className="text-center space-y-4">
                            <span className="font-kids-text text-[#4ECDC4] text-sm tracking-widest uppercase font-semibold">📸 Momentos</span>
                            <h2 className="font-kids-title text-5xl md:text-6xl text-[#FF6B6B]">Galería de Diversión</h2>
                            <div className="w-32 h-2 rainbow-gradient rounded-full mx-auto" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {data.galeriaPrincipalFotos.map((foto: string, index: number) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="aspect-[3/4] relative group overflow-hidden card-kids"
                                >
                                    <img
                                        src={foto}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        alt={`Fun ${index}`}
                                    />
                                    <div className="absolute top-4 right-4 text-4xl">
                                        {['🎈', '🎉', '🎊', '⭐', '🌟'][index % 5]}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}

                {/* TRIVIA */}
                {data.triviaHabilitada && data.triviaPreguntas && (
                    <div className="quiz-container card-kids p-8 md:p-12">
                        <QuizTrivia
                            titulo="🤔 ¿Qué tanto sabes?"
                            subtitulo="¡Juega y diviértete!"
                            preguntas={typeof data.triviaPreguntas === 'string' ? JSON.parse(data.triviaPreguntas) : data.triviaPreguntas}
                            invitationId={data.id}
                        />
                    </div>
                )}

                {/* SHARED ALBUM */}
                {data.albumCompartidoHabilitado && (
                    <section className="py-12 border-t-4 border-b-4 border-[#FF6B6B]/30 rounded-3xl">
                        <SharedAlbum
                            invitationSlug={data.slug || ''}
                            titulo="📷 Álbum de Recuerdos"
                            descripcion="¡Comparte tus mejores fotos de la fiesta!"
                            colorPrimario="#FF6B6B"
                            fechaEvento={data.fecha ? new Date(data.fecha) : undefined}
                            guestName="Invitado"
                        />
                    </section>
                )}

                {/* GIFT & BANK */}
                {data.regaloHabilitado && (
                    <motion.div
                        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                        className="text-center max-w-2xl mx-auto space-y-8 p-12 card-kids"
                    >
                        <div className="w-20 h-20 mx-auto rainbow-gradient rounded-full flex items-center justify-center">
                            <Gift className="w-10 h-10 text-white" />
                        </div>
                        <div>
                            <h3 className="font-kids-title text-[#FF6B6B] text-4xl mb-4">{data.regaloTitulo || "🎁 Regalos"}</h3>
                            <p className="font-kids-text text-xl text-gray-700 leading-relaxed">
                                {data.regaloMensaje || "Tu presencia es el mejor regalo"}
                            </p>
                        </div>

                        {data.regaloMostrarDatos && (
                            <>
                                <Button
                                    variant="outline"
                                    className="border-4 border-[#4ECDC4] text-[#4ECDC4] hover:bg-[#4ECDC4]/20 font-kids-text uppercase tracking-widest text-sm rounded-full px-8 py-6"
                                    onClick={() => setShowBankDetails(!showBankDetails)}
                                >
                                    {showBankDetails ? "Ocultar Datos 👆" : "Ver Datos Bancarios 👇"}
                                </Button>

                                <AnimatePresence>
                                    {showBankDetails && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden bg-white/80 rounded-3xl p-6 space-y-4 text-left font-kids-text text-base text-gray-700 border-4 border-[#4ECDC4]/30"
                                        >
                                            {[
                                                { label: "Banco", value: data.regaloBanco },
                                                { label: "CBU/CVU", value: data.regaloCbu },
                                                { label: "Alias", value: data.regaloAlias },
                                                { label: "Titular", value: data.regaloTitular },
                                            ].map((field, i) => field.value && (
                                                <div key={i} className="flex justify-between items-center group cursor-pointer hover:text-[#FF6B6B] transition-colors p-3 rounded-xl hover:bg-[#FFE5EC]" onClick={() => field.value && copyToClipboard(field.value)}>
                                                    <span className="font-bold">{field.label}:</span>
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
                        <div>
                            <span className="font-kids-text text-[#4ECDC4] text-sm tracking-widest uppercase font-semibold block mb-4">✉️ R.S.V.P</span>
                            <h2 className="font-kids-title text-6xl md:text-7xl text-[#FF6B6B]">¡Confirmá!</h2>
                            <div className="w-32 h-2 rainbow-gradient rounded-full mx-auto mt-6" />
                            <p className="font-kids-text text-gray-700 mt-6 text-lg">
                                Responder antes del {data.fecha ? format(new Date(data.fecha), "d 'de' MMMM", { locale: es }) : "..."}
                            </p>
                        </div>

                        <form className="space-y-8 text-left card-kids p-8 md:p-12">
                            <div className="space-y-2">
                                <Label className="text-sm uppercase tracking-wider text-[#FF6B6B] font-kids-text font-semibold">Nombre Completo</Label>
                                <Input
                                    className="bg-white border-4 border-[#FFE66D]/40 rounded-2xl focus-visible:ring-0 focus-visible:border-[#FFE66D] px-6 text-xl font-kids-text placeholder:text-gray-400 h-14 text-gray-700"
                                    placeholder="Tu nombre aquí..."
                                />
                            </div>

                            <div className="space-y-4">
                                <Label className="text-sm uppercase tracking-wider text-[#4ECDC4] font-kids-text font-semibold">¿Vas a Venir?</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button type="button" className="p-6 bg-white border-4 border-[#4ECDC4] hover:bg-[#4ECDC4]/10 transition-colors font-kids-text text-lg text-gray-700 rounded-2xl font-semibold">
                                        ¡Sí, voy! 🎉
                                    </button>
                                    <button type="button" className="p-6 bg-white border-4 border-[#FF6B6B] hover:bg-[#FF6B6B]/10 transition-colors font-kids-text text-lg text-gray-700 rounded-2xl font-semibold">
                                        No podré 😢
                                    </button>
                                </div>
                            </div>

                            <Button className="w-full rainbow-gradient text-white hover:opacity-90 font-kids-text text-xl uppercase tracking-wider py-7 border-0 rounded-full shadow-xl">
                                Enviar Confirmación ✨
                            </Button>
                        </form>
                    </motion.div>
                </section>

                {/* FINAL MESSAGE */}
                {data.mensajeFinalHabilitado && (
                    <div className="text-center max-w-2xl mx-auto py-12">
                        <p className="font-kids-title text-5xl text-[#FF6B6B]">
                            "{data.mensajeFinalTexto || '¡Nos vemos en la fiesta!'}"
                        </p>
                        <div className="w-32 h-2 rainbow-gradient rounded-full mx-auto mt-6" />
                    </div>
                )}
            </main>

            <footer className="py-8 text-center border-t-4 border-[#FF6B6B]/30 bg-white/50 rounded-t-3xl">
                <p className="font-kids-text text-sm tracking-wider text-[#4ECDC4] font-semibold">
                    ✨ ¡Hecho con amor y mucha diversión! ✨
                </p>
            </footer>
            
            <style jsx global>{`
                .quiz-container {
                    --color-background: rgba(255, 255, 255, 0.9);
                    --color-primary: #FF6B6B;
                    --color-text-light: #333333;
                }
            `}</style>
        </div>
    );
}
