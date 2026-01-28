"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, MapPin, Calendar, Clock, Sparkles, Gift, Copy, ChevronDown, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QuizTrivia } from "@/components/invitation/QuizTrivia";
import { SharedAlbum } from "@/components/invitation/SharedAlbum";
import { useToast } from "@/components/ui/Toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface InvitationTemplateProps {
    data: any;
    themeConfig: any;
}

// Hook for countdown
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

export function GoldenLuxuryTemplate({ data, themeConfig }: InvitationTemplateProps) {
    const { primaryColor } = themeConfig;
    const { showToast } = useToast();
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [showBankDetails, setShowBankDetails] = useState(false);

    const countdown = useCountdown(data.fecha);
    const { scrollYProgress } = useScroll();
    const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const scaleHero = useTransform(scrollYProgress, [0, 0.2], [1, 1.1]);

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
        showToast("Dato copiado al portapapeles", "success");
    };

    // Animation Variants
    const fadeInUp = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-[#FDFCF8] overflow-x-hidden selection:bg-[#D4AF37] selection:text-black relative">

            {/* Styles Injection */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Cinzel:wght@400;700&family=Lato:wght@300;400&display=swap');
                .font-gold-serif { font-family: 'Playfair Display', serif; }
                .font-gold-display { font-family: 'Cinzel', serif; }
                .font-gold-sans { font-family: 'Lato', sans-serif; }
                
                @keyframes shimmer {
                    0% { background-position: -1000px 0; }
                    100% { background-position: 1000px 0; }
                }
                .animate-shimmer {
                    animation: shimmer 15s linear infinite;
                    background: linear-gradient(to right, transparent 0%, rgba(212, 175, 55, 0.1) 50%, transparent 100%);
                    background-size: 1000px 100%;
                }
            `}</style>

            {/* Background Texture & Effects */}
            <div className="fixed inset-0 bg-[#0a0a0a]" />
            <div className="fixed inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}
            />
            <div className="fixed inset-0 bg-gradient-to-b from-transparent via-[#D4AF37]/5 to-transparent pointer-events-none" />

            {/* Audio Control */}
            {data.musicaUrl && (
                <>
                    <audio ref={audioRef} loop src={data.musicaUrl} />
                    <button
                        onClick={togglePlay}
                        className="fixed top-6 right-6 z-50 w-12 h-12 flex items-center justify-center rounded-full border border-[#D4AF37]/30 bg-black/40 backdrop-blur-sm text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all duration-300"
                    >
                        {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
                    </button>
                </>
            )}

            {/* HERO SECTION */}
            <header className="relative min-h-screen flex flex-col items-center justify-center p-6 text-center">
                {/* Border Frame */}
                <div className="absolute inset-4 md:inset-8 border border-[#D4AF37]/30 pointer-events-none">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#D4AF37]" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#D4AF37]" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#D4AF37]" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#D4AF37]" />
                </div>

                <motion.div
                    style={{ opacity: opacityHero, scale: scaleHero }}
                    className="relative z-10 space-y-8 max-w-4xl"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                        className="flex items-center justify-center gap-4"
                    >
                        <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#D4AF37]" />
                        <span className="font-gold-display text-[#D4AF37] tracking-[0.3em] text-sm uppercase">
                            {data.type === 'CASAMIENTO' ? 'The Wedding Of' : 'You Are Invited'}
                        </span>
                        <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#D4AF37]" />
                    </motion.div>

                    <h1 className="font-gold-serif text-5xl md:text-7xl lg:text-8xl text-transparent bg-clip-text bg-gradient-to-b from-[#F4E4BC] via-[#D4AF37] to-[#8C7335] drop-shadow-sm">
                        {data.type === 'CASAMIENTO' ? (
                            <>
                                <span className="block mb-2">{data.nombreNovia}</span>
                                <span className="block text-3xl md:text-5xl my-4 text-[#D4AF37]/70 font-gold-script">&</span>
                                <span className="block">{data.nombreNovio}</span>
                            </>
                        ) : (
                            <span>{data.nombreQuinceanera || data.nombreEvento}</span>
                        )}
                    </h1>

                    <div className="flex flex-col items-center gap-4 font-gold-sans tracking-widest text-[#FDFCF8]/80 text-sm md:text-base uppercase mt-12">
                        <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-[#D4AF37]" />
                            <span>{data.fecha ? format(new Date(data.fecha), "MMMM dd, yyyy", { locale: es }) : "Date TBD"}</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-[#D4AF37]" />
                        <div className="flex items-center gap-3">
                            <MapPin className="w-4 h-4 text-[#D4AF37]" />
                            <span>{data.lugarNombre}</span>
                        </div>
                    </div>
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, y: [0, 10, 0] }}
                    transition={{ delay: 2, duration: 2, repeat: Infinity }}
                    className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                >
                    <span className="font-gold-sans text-[10px] tracking-[0.3em] uppercase text-[#D4AF37]/60">Scroll</span>
                    <ChevronDown className="w-4 h-4 text-[#D4AF37]/60" />
                </motion.div>
            </header>

            {/* COUNTDOWN */}
            <section className="py-24 relative overflow-hidden border-y border-[#D4AF37]/20 bg-gradient-to-b from-[#0a0a0a] to-[#12100b]">
                <div className="absolute inset-0 animate-shimmer pointer-events-none" />
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <h2 className="font-gold-display text-[#D4AF37] text-lg tracking-[0.4em] uppercase mb-12">Countdown</h2>

                    <div className="flex flex-wrap justify-center gap-8 md:gap-16">
                        {[
                            { label: 'Days', value: countdown.days },
                            { label: 'Hours', value: countdown.hours },
                            { label: 'Minutes', value: countdown.minutes },
                            { label: 'Seconds', value: countdown.seconds }
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col items-center">
                                <div className="w-24 h-24 md:w-32 md:h-32 border border-[#D4AF37]/30 flex items-center justify-center bg-[#0a0a0a]/50 rotate-45 mb-8">
                                    <span className="font-gold-serif text-4xl md:text-5xl text-[#F4E4BC] -rotate-45">
                                        {String(item.value).padStart(2, '0')}
                                    </span>
                                </div>
                                <span className="font-gold-sans text-xs tracking-[0.2em] uppercase text-[#D4AF37]/70">
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* MAIN CONTENT CONTAINER */}
            <main className="relative z-10 container mx-auto px-6 py-24 space-y-32">

                {/* QUOTE */}
                {data.frasePersonalizadaHabilitada && (
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
                        className="text-center max-w-3xl mx-auto"
                    >
                        <Sparkles className="w-8 h-8 text-[#D4AF37] mx-auto mb-6 opacity-60" />
                        <p className="font-gold-serif text-3xl md:text-4xl italic leading-relaxed text-[#F4E4BC]">
                            "{data.frasePersonalizadaTexto}"
                        </p>
                    </motion.div>
                )}

                {/* DETAILS CARD */}
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
                        className="relative p-[1px] bg-gradient-to-br from-[#D4AF37] via-transparent to-[#D4AF37]"
                    >
                        <div className="bg-[#0f0f0f] p-10 md:p-14 text-center space-y-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10"><Sparkles size={64} /></div>

                            <div>
                                <h3 className="font-gold-display text-[#D4AF37] text-xl mb-4 tracking-widest uppercase">Ceremony</h3>
                                <div className="space-y-2 font-gold-sans font-light text-[#FDFCF8]/90">
                                    <p className="text-lg">{data.lugarNombre}</p>
                                    <p className="text-sm opacity-70">{data.direccion}</p>
                                    <p className="text-lg mt-2">{data.hora} HS</p>
                                </div>
                            </div>

                            <div className="w-full h-[1px] bg-[#D4AF37]/20" />

                            <div>
                                <h3 className="font-gold-display text-[#D4AF37] text-xl mb-4 tracking-widest uppercase">Reception</h3>
                                <p className="font-gold-serif italic text-lg opacity-80">Dinner, drinks and dancing to follow.</p>
                            </div>

                            {data.mapUrl && (
                                <Button
                                    className="mt-4 bg-transparent border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0a0a0a] rounded-none px-8 py-6 font-gold-display tracking-widest uppercase transition-all duration-500"
                                    onClick={() => window.open(data.mapUrl, '_blank')}
                                >
                                    View Map
                                </Button>
                            )}
                        </div>
                    </motion.div>

                    {/* IMAGE FRAME */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 1 }}
                        className="relative aspect-[3/4] border-8 border-[#151515] outline outline-1 outline-[#D4AF37]/40 shadow-2xl"
                    >
                        {data.portadaImagenFondo ? (
                            <img src={data.portadaImagenFondo} className="w-full h-full object-cover grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-1000" alt="Couple" />
                        ) : (
                            <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center">
                                <Sparkles className="w-16 h-16 text-[#D4AF37]/20" />
                            </div>
                        )}
                        <div className="absolute inset-4 border border-white/20 pointer-events-none" />
                    </motion.div>
                </div>

                {/* GALLERY */}
                {(data.galeriaPrincipalHabilitada && data.galeriaPrincipalFotos.length > 0) && (
                    <section className="space-y-12">
                        <div className="text-center space-y-4">
                            <span className="font-gold-sans text-[#D4AF37] text-xs tracking-[0.3em] uppercase">Memories</span>
                            <h2 className="font-gold-serif text-4xl md:text-5xl">Captured Moments</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {data.galeriaPrincipalFotos.map((foto: string, index: number) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="aspect-[3/4] relative group overflow-hidden border border-[#D4AF37]/20"
                                >
                                    <div className="absolute inset-0 bg-[#D4AF37]/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none mix-blend-overlay" />
                                    <img
                                        src={foto}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        alt={`Moment ${index}`}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}

                {/* TRIVIA */}
                {data.triviaHabilitada && data.triviaPreguntas && (
                    <div className="quiz-container border border-[#D4AF37]/20 p-8 md:p-12 bg-[#0f0f0f]">
                        <QuizTrivia
                            titulo="How well do you know us?"
                            subtitulo="Test your knowledge"
                            preguntas={typeof data.triviaPreguntas === 'string' ? JSON.parse(data.triviaPreguntas) : data.triviaPreguntas}
                            invitationId={data.id}
                        />

                    </div>
                )}

                {/* SHARED ALBUM */}
                {data.albumCompartidoHabilitado && (
                    <section className="py-12 border-t border-[#D4AF37]/20 border-b border-[#D4AF37]/20">
                        <SharedAlbum
                            invitationSlug={data.slug || ''}
                            titulo="Shared Gallery"
                            descripcion="Help us capture the magic from your perspective."
                            colorPrimario="#D4AF37"
                            fechaEvento={data.fecha ? new Date(data.fecha) : undefined}
                            guestName="Guest"
                        />
                    </section>
                )}

                {/* GIFT & BANK */}
                {data.regaloHabilitado && (
                    <motion.div
                        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                        className="text-center max-w-2xl mx-auto space-y-8 p-12 border border-[#D4AF37]/30 bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a]"
                    >
                        <Gift className="w-10 h-10 mx-auto text-[#D4AF37]" strokeWidth={1} />
                        <div>
                            <h3 className="font-gold-display text-[#D4AF37] text-xl mb-4 tracking-[0.2em] uppercase">{data.regaloTitulo || "Gifts"}</h3>
                            <p className="font-gold-serif text-lg text-[#FDFCF8]/80 leading-relaxed">
                                {data.regaloMensaje || "Your presence is our present."}
                            </p>
                        </div>

                        {data.regaloMostrarDatos && (
                            <>
                                <Button
                                    variant="outline"
                                    className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black font-gold-display uppercase tracking-widest text-xs"
                                    onClick={() => setShowBankDetails(!showBankDetails)}
                                >
                                    {showBankDetails ? "Hide Details" : "View Bank Details"}
                                </Button>

                                <AnimatePresence>
                                    {showBankDetails && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden bg-[#0a0a0a] border border-[#D4AF37]/20 p-6 space-y-4 text-left font-gold-sans text-sm text-[#F4E4BC]"
                                        >
                                            {[
                                                { label: "Bank", value: data.regaloBanco },
                                                { label: "CBU/CVU", value: data.regaloCbu },
                                                { label: "Alias", value: data.regaloAlias },
                                                { label: "Holder", value: data.regaloTitular },
                                            ].map((field, i) => field.value && (
                                                <div key={i} className="flex justify-between items-center group cursor-pointer hover:text-[#D4AF37]" onClick={() => field.value && copyToClipboard(field.value)}>
                                                    <span className="font-bold opacity-70">{field.label}:</span>
                                                    <span className="flex items-center gap-2">{field.value} <Copy className="w-3 h-3 opacity-0 group-hover:opacity-50" /></span>
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
                            <span className="font-gold-sans text-[#D4AF37] text-xs tracking-[0.3em] uppercase block mb-4">R.S.V.P</span>
                            <h2 className="font-gold-serif text-5xl md:text-6xl text-[#F4E4BC]">Kindly Reply</h2>
                            <p className="font-gold-sans text-[#FDFCF8]/60 mt-6 font-light">
                                Please respond by {data.fecha ? format(new Date(data.fecha), "MMMM d", { locale: es }) : "..."}
                            </p>
                        </div>

                        <form className="space-y-8 text-left bg-[#0f0f0f] p-8 md:p-12 border border-[#D4AF37]/20">
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase tracking-widest text-[#D4AF37]">Full Name</Label>
                                <Input
                                    className="bg-transparent border-0 border-b border-[#D4AF37]/40 rounded-none focus-visible:ring-0 focus-visible:border-[#D4AF37] px-0 text-xl font-gold-serif placeholder:text-[#333] h-12 text-[#F4E4BC]"
                                    placeholder="Enter your name"
                                />
                            </div>

                            <div className="space-y-4">
                                <Label className="text-[10px] uppercase tracking-widest text-[#D4AF37]">Attendance</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button type="button" className="p-4 border border-[#D4AF37]/30 hover:bg-[#D4AF37]/10 transition-colors font-gold-sans text-sm text-[#F4E4BC]">
                                        Accepts with Pleasure
                                    </button>
                                    <button type="button" className="p-4 border border-[#D4AF37]/30 hover:bg-[#D4AF37]/10 transition-colors font-gold-sans text-sm text-[#F4E4BC]">
                                        Declines with Regret
                                    </button>
                                </div>
                            </div>

                            <Button className="w-full bg-[#D4AF37] text-[#0a0a0a] hover:bg-[#c5a028] font-gold-display uppercase tracking-widest py-6 rounded-none">
                                Send Confirmation
                            </Button>
                        </form>
                    </motion.div>
                </section>

                {/* FINAL MESSAGE */}
                {data.mensajeFinalHabilitado && (
                    <div className="text-center max-w-2xl mx-auto py-12">
                        <p className="font-gold-serif text-2xl italic text-[#D4AF37]/80">
                            "{data.mensajeFinalTexto || 'We look forward to celebrating with you.'}"
                        </p>
                    </div>
                )}
            </main>

            <footer className="py-8 text-center border-t border-[#D4AF37]/10 bg-[#050505]">
                <p className="font-gold-sans text-[10px] tracking-[0.2em] text-[#D4AF37]/40 uppercase">
                    Designed with elegance
                </p>
            </footer>
            <style jsx global>{`
                .quiz-container {
                    --color-background: #0f0f0f;
                    --color-primary: #D4AF37;
                    --color-text-light: #000000;
                }
            `}</style>
        </div>
    );
}
