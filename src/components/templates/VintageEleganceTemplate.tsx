"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, MapPin, Calendar, Clock, Heart, Copy, Check, ChevronDown, Gift, Sparkles } from "lucide-react";
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

export function VintageEleganceTemplate({ data, themeConfig }: InvitationTemplateProps) {
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
        <div className="min-h-screen bg-[#FBF8F3] text-[#4A3F35] overflow-x-hidden selection:bg-[#B48E60] selection:text-white relative">

            {/* Styles Injection */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600;700&family=Montserrat:wght@300;400;500;600&family=Great+Vibes&display=swap');
                .font-vintage-serif { font-family: 'Cormorant Garamond', serif; }
                .font-vintage-sans { font-family: 'Montserrat', sans-serif; }
                .font-vintage-script { font-family: 'Great Vibes', cursive; }
                
                @keyframes shimmer-vintage {
                    0% { background-position: -1000px 0; }
                    100% { background-position: 1000px 0; }
                }
                
                .animate-shimmer-vintage {
                    background: linear-gradient(
                        90deg,
                        transparent 0%,
                        rgba(180, 142, 96, 0.3) 50%,
                        transparent 100%
                    );
                    background-size: 1000px 100%;
                    animation: shimmer-vintage 15s linear infinite;
                }

                .art-deco-pattern {
                    background-image: 
                        repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(180, 142, 96, 0.05) 10px, rgba(180, 142, 96, 0.05) 20px),
                        repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(180, 142, 96, 0.05) 10px, rgba(180, 142, 96, 0.05) 20px);
                }
            `}</style>

            {/* Background Pattern Art Deco */}
            <div className="fixed inset-0 art-deco-pattern opacity-30 pointer-events-none" />
            <div className="fixed inset-0 bg-gradient-to-b from-[#FBF8F3] via-transparent to-[#FBF8F3] pointer-events-none" />

            {/* Audio Control */}
            {data.musicaUrl && (
                <>
                    <audio ref={audioRef} loop src={data.musicaUrl} />
                    <motion.button
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1 }}
                        onClick={togglePlay}
                        className="fixed top-6 right-6 z-50 bg-[#B48E60] text-white p-4 rounded-full shadow-xl hover:bg-[#8B6F47] transition-colors"
                    >
                        {isPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </motion.button>
                </>
            )}

            {/* HERO SECTION */}
            <header className="relative min-h-screen flex flex-col items-center justify-center p-6 text-center">
                {/* Marcos de esquina ornamentales */}
                <div className="absolute top-8 left-8 w-24 h-24 border-t-2 border-l-2 border-[#B48E60]" />
                <div className="absolute top-8 right-8 w-24 h-24 border-t-2 border-r-2 border-[#B48E60]" />
                <div className="absolute bottom-8 left-8 w-24 h-24 border-b-2 border-l-2 border-[#B48E60]" />
                <div className="absolute bottom-8 right-8 w-24 h-24 border-b-2 border-r-2 border-[#B48E60]" />

                {/* Ornamentos centrales */}
                <motion.div 
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                    <svg width="800" height="800" viewBox="0 0 800 800" className="opacity-10">
                        <circle cx="400" cy="400" r="300" stroke="#B48E60" strokeWidth="1" fill="none" />
                        <circle cx="400" cy="400" r="250" stroke="#B48E60" strokeWidth="1" fill="none" />
                        <circle cx="400" cy="400" r="200" stroke="#B48E60" strokeWidth="2" fill="none" />
                    </svg>
                </motion.div>

                <div className="relative z-10 text-center px-6 max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.3 }}
                    >
                        <div className="mb-8">
                            <div className="w-32 h-px bg-[#B48E60] mx-auto mb-6" />
                            <p className="font-vintage-sans text-[#8B6F47] text-sm tracking-[0.3em] uppercase mb-6">
                                {data.type === 'CASAMIENTO' ? 'Nuestra Boda' : 'Celebración'}
                            </p>
                        </div>

                        {data.type === 'CASAMIENTO' ? (
                            <div className="space-y-4">
                                <h1 className="font-vintage-script text-7xl md:text-9xl text-[#B48E60] leading-tight">
                                    {data.nombreNovia || 'Novia'}
                                </h1>
                                <div className="flex items-center justify-center gap-6">
                                    <div className="w-16 h-px bg-[#B48E60]" />
                                    <Heart className="w-8 h-8 text-[#B48E60]" fill="#B48E60" />
                                    <div className="w-16 h-px bg-[#B48E60]" />
                                </div>
                                <h1 className="font-vintage-script text-7xl md:text-9xl text-[#B48E60] leading-tight">
                                    {data.nombreNovio || 'Novio'}
                                </h1>
                            </div>
                        ) : (
                            <h1 className="font-vintage-script text-8xl md:text-9xl text-[#B48E60] leading-tight">
                                {data.nombreQuinceanera || data.nombreEvento}
                            </h1>
                        )}

                        {data.fecha && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.2 }}
                                className="mt-12"
                            >
                                <div className="inline-block px-12 py-6 border-2 border-[#B48E60] bg-white/50 backdrop-blur-sm">
                                    <p className="font-vintage-serif text-2xl md:text-3xl text-[#4A3F35]">
                                        {new Date(data.fecha).toLocaleDateString('es-ES', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </p>
                                    {data.hora && (
                                        <p className="font-vintage-sans text-lg text-[#8B6F47] mt-2 tracking-widest">
                                            {data.hora}
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Scroll Indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, y: [0, 10, 0] }}
                        transition={{ delay: 2, duration: 2, repeat: Infinity }}
                        className="absolute bottom-12 left-1/2 -translate-x-1/2"
                    >
                        <ChevronDown className="w-8 h-8 text-[#B48E60]" />
                    </motion.div>
                </div>
            </header>

            {/* COUNTDOWN SECTION */}
            {data.fecha && (
                <motion.section
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                    className="py-24 px-6 bg-white"
                >
                    <div className="max-w-6xl mx-auto text-center">
                        <h2 className="font-vintage-serif text-4xl md:text-5xl text-[#4A3F35] mb-4">
                            Cuenta Regresiva
                        </h2>
                        <div className="w-24 h-1 bg-[#B48E60] mx-auto mb-16" />

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                            {[
                                { value: countdown.days, label: 'Días' },
                                { value: countdown.hours, label: 'Horas' },
                                { value: countdown.minutes, label: 'Minutos' },
                                { value: countdown.seconds, label: 'Segundos' }
                            ].map((item, index) => (
                                <motion.div
                                    key={item.label}
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="relative"
                                >
                                    <div className="border-2 border-[#B48E60] bg-[#FBF8F3] p-8 relative">
                                        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#8B6F47]" />
                                        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#8B6F47]" />
                                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#8B6F47]" />
                                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#8B6F47]" />
                                        
                                        <span className="font-vintage-serif text-5xl md:text-6xl text-[#B48E60] block">
                                            {String(item.value).padStart(2, '0')}
                                        </span>
                                        <span className="font-vintage-sans text-sm text-[#8B6F47] uppercase tracking-widest mt-2 block">
                                            {item.label}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.section>
            )}

            {/* MAIN CONTENT CONTAINER */}
            <main className="relative z-10 container mx-auto px-6 py-24 space-y-32">

                {/* DETAILS CARD */}
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
                        className="relative border-2 border-[#B48E60] bg-[#F5EFE7] p-10 md:p-14 text-center space-y-8"
                    >
                        {/* Art Deco Corner Ornaments */}
                        <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-[#8B6F47]"></div>
                        <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-[#8B6F47]"></div>
                        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-[#8B6F47]"></div>
                        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-[#8B6F47]"></div>

                        <div className="absolute top-8 right-8 opacity-20">
                            <Sparkles size={48} className="text-[#B48E60]" />
                        </div>

                        <div>
                            <h3 className="font-vintage-display text-[#B48E60] text-2xl mb-4 tracking-widest uppercase">Ceremonia</h3>
                            <div className="space-y-2 font-vintage-sans text-[#4A3F35]">
                                <p className="text-xl font-medium">{data.lugarNombre}</p>
                                <p className="text-sm opacity-70">{data.direccion}</p>
                                <p className="text-lg mt-3 font-vintage-serif italic">{data.hora} HS</p>
                            </div>
                        </div>

                        <div className="w-32 h-[2px] bg-gradient-to-r from-transparent via-[#B48E60] to-transparent mx-auto" />

                        <div>
                            <h3 className="font-vintage-display text-[#B48E60] text-2xl mb-4 tracking-widest uppercase">Recepción</h3>
                            <p className="font-vintage-script text-2xl text-[#8B6F47]">Cena, brindis y baile</p>
                        </div>

                        {data.mapUrl && (
                            <Button
                                className="mt-4 bg-[#B48E60] border-2 border-[#8B6F47] text-[#FBF8F3] hover:bg-[#8B6F47] hover:border-[#B48E60] px-10 py-6 font-vintage-display tracking-widest uppercase transition-all duration-300"
                                onClick={() => window.open(data.mapUrl, '_blank')}
                            >
                                Ver Mapa
                            </Button>
                        )}
                    </motion.div>

                    {/* IMAGE FRAME */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 1 }}
                        className="relative aspect-[3/4] border-8 border-[#B48E60] shadow-2xl bg-[#F5EFE7]"
                    >
                        {data.portadaImagenFondo ? (
                            <img src={data.portadaImagenFondo} className="w-full h-full object-cover sepia hover:sepia-0 transition-all duration-1000" alt="Couple" />
                        ) : (
                            <div className="w-full h-full bg-[#E8DDD0] flex items-center justify-center">
                                <Heart className="w-20 h-20 text-[#B48E60]/30" />
                            </div>
                        )}
                        <div className="absolute inset-6 border-2 border-[#8B6F47]/40 pointer-events-none" />
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
                    <div className="quiz-container border-2 border-[#B48E60] p-8 md:p-12 bg-[#F5EFE7] relative">
                        <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-[#8B6F47]"></div>
                        <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-[#8B6F47]"></div>
                        <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-[#8B6F47]"></div>
                        <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-[#8B6F47]"></div>
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
                    <section className="py-12 border-t-2 border-b-2 border-[#B48E60]">
                        <SharedAlbum
                            invitationSlug={data.slug || ''}
                            titulo="Álbum Compartido"
                            descripcion="Ayúdanos a capturar la magia desde tu perspectiva."
                            colorPrimario="#B48E60"
                            fechaEvento={data.fecha ? new Date(data.fecha) : undefined}
                            guestName="Invitado"
                        />
                    </section>
                )}

                {/* GIFT & BANK */}
                {data.regaloHabilitado && (
                    <motion.div
                        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                        className="text-center max-w-2xl mx-auto space-y-8 p-12 border-2 border-[#B48E60] bg-[#F5EFE7] relative"
                    >
                        <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-[#8B6F47]"></div>
                        <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-[#8B6F47]"></div>
                        <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-[#8B6F47]"></div>
                        <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-[#8B6F47]"></div>
                        
                        <Gift className="w-12 h-12 mx-auto text-[#B48E60]" strokeWidth={1.5} />
                        <div>
                            <h3 className="font-vintage-display text-[#B48E60] text-2xl mb-4 tracking-[0.2em] uppercase">{data.regaloTitulo || "Regalos"}</h3>
                            <p className="font-vintage-script text-2xl text-[#8B6F47] leading-relaxed">
                                {data.regaloMensaje || "Tu presencia es nuestro mejor regalo."}
                            </p>
                        </div>

                        {data.regaloMostrarDatos && (
                            <>
                                <Button
                                    variant="outline"
                                    className="border-2 border-[#B48E60] text-[#B48E60] hover:bg-[#B48E60] hover:text-[#FBF8F3] font-vintage-display uppercase tracking-widest text-xs"
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
                                            className="overflow-hidden bg-[#FBF8F3] border-2 border-[#B48E60] p-6 space-y-4 text-left font-vintage-sans text-sm text-[#4A3F35]"
                                        >
                                            {[
                                                { label: "Banco", value: data.regaloBanco },
                                                { label: "CBU/CVU", value: data.regaloCbu },
                                                { label: "Alias", value: data.regaloAlias },
                                                { label: "Titular", value: data.regaloTitular },
                                            ].map((field, i) => field.value && (
                                                <div key={i} className="flex justify-between items-center group cursor-pointer hover:text-[#B48E60] transition-colors" onClick={() => field.value && copyToClipboard(field.value)}>
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
                            <span className="font-vintage-sans text-[#B48E60] text-xs tracking-[0.3em] uppercase block mb-4">R.S.V.P</span>
                            <h2 className="font-vintage-serif text-5xl md:text-6xl text-[#4A3F35]">Confirma tu Asistencia</h2>
                            <div className="w-32 h-[2px] bg-gradient-to-r from-transparent via-[#B48E60] to-transparent mx-auto mt-6" />
                            <p className="font-vintage-sans text-[#8B6F47] mt-6">
                                Por favor responder antes del {data.fecha ? format(new Date(data.fecha), "d 'de' MMMM", { locale: es }) : "..."}
                            </p>
                        </div>

                        <form className="space-y-8 text-left bg-[#F5EFE7] p-8 md:p-12 border-2 border-[#B48E60] relative">
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#8B6F47]"></div>
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#8B6F47]"></div>
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#8B6F47]"></div>
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#8B6F47]"></div>
                            
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase tracking-widest text-[#B48E60] font-vintage-sans">Nombre Completo</Label>
                                <Input
                                    className="bg-transparent border-0 border-b-2 border-[#B48E60]/40 rounded-none focus-visible:ring-0 focus-visible:border-[#B48E60] px-0 text-xl font-vintage-serif placeholder:text-[#8B6F47]/40 h-12 text-[#4A3F35]"
                                    placeholder="Ingresa tu nombre"
                                />
                            </div>

                            <div className="space-y-4">
                                <Label className="text-[10px] uppercase tracking-widest text-[#B48E60] font-vintage-sans">Asistencia</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button type="button" className="p-4 border-2 border-[#B48E60] hover:bg-[#B48E60] hover:text-[#FBF8F3] transition-colors font-vintage-sans text-sm text-[#4A3F35]">
                                        Confirmo Asistencia
                                    </button>
                                    <button type="button" className="p-4 border-2 border-[#B48E60] hover:bg-[#B48E60] hover:text-[#FBF8F3] transition-colors font-vintage-sans text-sm text-[#4A3F35]">
                                        No Podré Asistir
                                    </button>
                                </div>
                            </div>

                            <Button className="w-full bg-[#B48E60] text-[#FBF8F3] hover:bg-[#8B6F47] font-vintage-display uppercase tracking-widest py-6">
                                Enviar Confirmación
                            </Button>
                        </form>
                    </motion.div>
                </section>

                {/* FINAL MESSAGE */}
                {data.mensajeFinalHabilitado && (
                    <div className="text-center max-w-2xl mx-auto py-12">
                        <p className="font-vintage-script text-3xl text-[#B48E60]">
                            "{data.mensajeFinalTexto || 'Esperamos celebrar junto a ustedes.'}"
                        </p>
                        <div className="w-32 h-[2px] bg-gradient-to-r from-transparent via-[#B48E60] to-transparent mx-auto mt-6" />
                    </div>
                )}
            </main>

            <footer className="py-8 text-center border-t-2 border-[#B48E60] bg-[#F5EFE7]">
                <p className="font-vintage-sans text-[10px] tracking-[0.2em] text-[#8B6F47] uppercase">
                    Diseñado con Elegancia
                </p>
            </footer>
            <style jsx global>{`
                .quiz-container {
                    --color-background: #F5EFE7;
                    --color-primary: #B48E60;
                    --color-text-light: #4A3F35;
                }
            `}</style>
        </div>
    );
}
