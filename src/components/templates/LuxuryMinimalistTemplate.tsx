"use client";

import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useRef, useState, useEffect } from "react";
// import { InvitationTemplateProps } from "./types";
interface InvitationTemplateProps {
    data: any;
    themeConfig: any;
}
import { MapPin, Calendar, Clock, Gift, Music, Heart, Copy, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QuizTrivia } from "@/components/invitation/QuizTrivia";
import { SharedAlbum } from "@/components/invitation/SharedAlbum";
import { useToast } from "@/components/ui/Toast";

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

export function LuxuryMinimalistTemplate({ data, themeConfig }: InvitationTemplateProps) {
    const { primaryColor, textDark, backgroundColor, fontFamily } = themeConfig;
    const { showToast } = useToast();

    // Smooth scroll progress for parallax
    const { scrollYProgress } = useScroll();

    const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.1]);

    // Countdown
    const countdown = useCountdown(data.fecha);

    // Bank Details Expansion
    const [showBankDetails, setShowBankDetails] = useState(false);

    // Copy to clipboard
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        showToast("Datos bancarios copiados", "success");
    };

    // Animation variants
    const fadeInUp = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    return (
        <div
            className="h-full w-full overflow-x-hidden bg-stone-50 text-stone-900 selection:bg-stone-200"
            style={{
                // Inject CSS variables for shared components
                ['--color-primary' as any]: primaryColor || '#1a1a1a',
                ['--color-background' as any]: '#fafaf9', // stone-50
                ['--color-text-light' as any]: '#ffffff',
                ['--color-text-secondary' as any]: data.colorPrincipal || '#57534e', // stone-600
                ['--font-ornamental' as any]: "'Cormorant Garamond', serif",
            }}
        >
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Montserrat:wght@200;300;400;500&display=swap');
                .font-luxury-serif { font-family: 'Cormorant Garamond', serif; }
                .font-luxury-sans { font-family: 'Montserrat', sans-serif; }
                
                /* Auto-scroll animation */
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 40s linear infinite;
                }
                .animate-marquee:hover {
                    animation-play-state: paused;
                }
            `}</style>

            {/* HERO SECTION */}
            <header className="relative h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
                <motion.div
                    className="absolute inset-0 z-0 opacity-20"
                    style={{
                        backgroundColor: primaryColor,
                        scale: heroScale,
                        opacity: useTransform(scrollYProgress, [0, 0.3], [0.1, 0])
                    }}
                />

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    className="relative z-10 max-w-4xl mx-auto"
                    style={{ opacity: heroOpacity }}
                >
                    <motion.p variants={fadeInUp} className="font-luxury-sans text-sm tracking-[0.3em] uppercase mb-8 text-stone-500">
                        {data.type === 'CASAMIENTO' ? 'The Wedding of' : 'You Are Invited'}
                    </motion.p>

                    <motion.h1 variants={fadeInUp} className="font-luxury-serif text-6xl md:text-8xl lg:text-9xl font-light mb-6 leading-none text-stone-900">
                        {data.type === 'CASAMIENTO' && (
                            <>
                                <span className="block">{data.nombreNovia}</span>
                                <span className="block text-4xl md:text-6xl my-4 text-stone-400">&</span>
                                <span className="block">{data.nombreNovio}</span>
                            </>
                        )}
                        {data.type !== 'CASAMIENTO' && (data.nombreQuinceanera || data.nombreEvento)}
                    </motion.h1>

                    <motion.div variants={fadeInUp} className="w-px h-24 bg-stone-900 mx-auto my-8" />

                    <motion.div variants={fadeInUp} className="font-luxury-sans text-lg tracking-widest uppercase">
                        {data.fecha ? format(new Date(data.fecha), "MMMM dd, yyyy", { locale: es }) : "Date TBD"}
                    </motion.div>
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    className="absolute bottom-12 left-1/2 -translate-x-1/2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, y: [0, 10, 0] }}
                    transition={{ delay: 2, duration: 2, repeat: Infinity }}
                >
                    <div className="w-[1px] h-16 bg-stone-300 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1/2 bg-stone-900 animate-slide-down" />
                    </div>
                </motion.div>
            </header>

            {/* MAIN CONTENT CONTAINER */}
            <main className="relative z-10 bg-white">

                {/* FRASE / QUOTE SECTION */}
                {data.frasePersonalizadaHabilitada && (
                    <section className="py-24 px-6 text-center bg-stone-50">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="max-w-3xl mx-auto"
                        >
                            <p className="font-luxury-serif text-3xl md:text-5xl italic leading-relaxed text-stone-700">
                                "{data.frasePersonalizadaTexto}"
                            </p>
                        </motion.div>
                    </section>
                )}

                {/* TIMELINE / DETAILS SECTION */}
                <section className="py-32 px-6 md:px-12 max-w-6xl mx-auto">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-10%" }}
                        variants={staggerContainer}
                        className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center"
                    >
                        {/* Text Details */}
                        <div className="space-y-12 text-center md:text-right order-2 md:order-1">
                            <motion.div variants={fadeInUp}>
                                <h3 className="font-luxury-sans text-xs tracking-[0.2em] mb-4 text-stone-400 uppercase">Ceremony</h3>
                                <div className="font-luxury-serif text-4xl md:text-5xl mb-4">{data.lugarNombre}</div>
                                <div className="font-luxury-sans text-stone-500 font-light">{data.direccion}</div>
                                <div className="font-luxury-sans text-stone-500 font-light mt-2">{data.hora}</div>
                            </motion.div>

                            <motion.div variants={fadeInUp} className="pt-8">
                                <h3 className="font-luxury-sans text-xs tracking-[0.2em] mb-4 text-stone-400 uppercase">Reception</h3>
                                <div className="font-luxury-serif text-3xl text-stone-800">Dinner and Dancing to follow</div>
                            </motion.div>

                            {data.mapUrl && (
                                <motion.div variants={fadeInUp}>
                                    <Button
                                        variant="outline"
                                        className="rounded-none border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-white transition-colors duration-500 uppercase tracking-widest text-xs py-6 px-8"
                                        onClick={() => window.open(data.mapUrl, '_blank')}
                                    >
                                        View Map
                                    </Button>
                                </motion.div>
                            )}
                        </div>

                        {/* Visual/Image Element */}
                        <div className="relative h-[600px] w-full overflow-hidden order-1 md:order-2 bg-stone-100">
                            <motion.div
                                className="absolute inset-0 bg-cover bg-center"
                                style={{
                                    backgroundImage: `url(${data.portadaImagenFondo || 'https://images.unsplash.com/photo-1511285560982-1351cdeb9821?q=80&w=1974&auto=format&fit=crop'})`
                                }}
                                whileInView={{ scale: 1.05 }}
                                transition={{ duration: 1.5 }}
                            />
                            {/* Elegant Border Overlay */}
                            <div className="absolute inset-4 border border-white/30" />
                        </div>
                    </motion.div>
                </section>

                {/* COUNTDOWN SECTION */}
                <section className="py-24 bg-stone-900 text-stone-100">
                    <div className="container mx-auto px-6 max-w-4xl text-center">
                        <h2 className="font-luxury-sans text-xs tracking-[0.3em] uppercase mb-12 text-stone-400">Counting Down</h2>
                        <div className="flex flex-wrap justify-center gap-8 md:gap-16">
                            {[
                                { label: 'Days', value: countdown.days },
                                { label: 'Hours', value: countdown.hours },
                                { label: 'Minutes', value: countdown.minutes },
                                { label: 'Seconds', value: countdown.seconds }
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col items-center">
                                    <span className="font-luxury-serif text-5xl md:text-7xl font-light mb-2">
                                        {String(item.value).padStart(2, '0')}
                                    </span>
                                    <span className="font-luxury-sans text-[10px] tracking-[0.2em] uppercase text-stone-500">
                                        {item.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* GALLERY SCROLL SECTION (Auto Scroll) */}
                {(data.galeriaPrincipalHabilitada && data.galeriaPrincipalFotos.length > 0) && (
                    <section className="py-32 bg-stone-50 overflow-hidden">
                        <div className="px-6 mb-16 max-w-6xl mx-auto flex items-end justify-between">
                            <h2 className="font-luxury-serif text-5xl md:text-6xl text-stone-900">Moments</h2>
                            <span className="font-luxury-sans text-stone-400 text-sm tracking-widest hidden md:inline-block">CAPTURED MEMORIES</span>
                        </div>

                        {/* Marquee Container */}
                        <div className="w-full overflow-hidden flex">
                            <div className="flex gap-8 animate-marquee w-max">
                                {/* Triplicate content for seamless loop */}
                                {[...Array(3)].map((_, setIndex) => (
                                    <div key={setIndex} className="flex gap-8">
                                        {data.galeriaPrincipalFotos.map((foto: string, index: number) => (
                                            <div
                                                key={`${setIndex}-${index}`}
                                                className="flex-none w-[300px] md:w-[400px] aspect-[3/4] relative grayscale hover:grayscale-0 transition-all duration-700 ease-in-out"
                                            >
                                                <img
                                                    src={foto}
                                                    alt={`Moment ${index + 1}`}
                                                    className="absolute inset-0 w-full h-full object-cover"
                                                    loading="lazy"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* TRIVIA SECTION */}
                {data.triviaHabilitada && data.triviaPreguntas && (
                    <div className="bg-white">
                        <QuizTrivia
                            titulo="How well do you know us?"
                            subtitulo="Take the quiz and find out"
                            preguntas={typeof data.triviaPreguntas === 'string' ? JSON.parse(data.triviaPreguntas) : data.triviaPreguntas}
                            invitationId={data.id}
                        />
                    </div>
                )}

                {/* SHARED ALBUM SECTION */}
                {data.albumCompartidoHabilitado && (
                    <div className="bg-stone-50">
                        <SharedAlbum
                            invitationSlug={data.slug || ''} // Fallback if slug missing in preview
                            titulo="Shared Moments"
                            descripcion="Upload your photos and help us capture every angle of our special day."
                            colorPrimario={primaryColor}
                            fechaEvento={data.fecha ? new Date(data.fecha) : undefined}
                            guestName="Guest"
                        />
                    </div>
                )}

                {/* DETAILS GRID & GIFT */}
                <section className="py-32 px-6 max-w-5xl mx-auto">
                    <div className={`grid grid-cols-1 ${data.regaloHabilitado ? 'md:grid-cols-2' : ''} gap-16`}>
                        {/* Dress Code */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-white p-12 border border-stone-100 text-center shadow-[0_0_40px_-10px_rgba(0,0,0,0.05)]"
                        >
                            <div className="w-12 h-12 mx-auto mb-6 flex items-center justify-center text-stone-900">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-8 h-8">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                    <line x1="16" y1="2" x2="16" y2="6" />
                                    <line x1="8" y1="2" x2="8" y2="6" />
                                    <line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                            </div>
                            <h3 className="font-luxury-sans text-sm tracking-widest uppercase mb-4">Dress Code</h3>
                            <p className="font-luxury-serif text-2xl italic text-stone-600">Formal Elegance</p>
                        </motion.div>

                        {/* Gift / Registry */}
                        {data.regaloHabilitado && (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="bg-white p-12 border border-stone-100 text-center shadow-[0_0_40px_-10px_rgba(0,0,0,0.05)] relative overflow-hidden"
                            >
                                <Gift className="w-8 h-8 mx-auto mb-6 text-stone-900" strokeWidth={1} />
                                <h3 className="font-luxury-sans text-sm tracking-widest uppercase mb-4">{data.regaloTitulo || "Gifts"}</h3>
                                <p className="font-luxury-serif text-lg text-stone-600 mb-6 leading-relaxed">
                                    {data.regaloMensaje || "Your presence is our present."}
                                </p>

                                {data.regaloMostrarDatos && (
                                    <>
                                        <Button
                                            variant="link"
                                            className="text-stone-900 underline-offset-4 font-luxury-sans text-xs uppercase tracking-widest"
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
                                                    className="mt-6 text-left bg-stone-50 p-6 rounded text-sm text-stone-600 space-y-3"
                                                >
                                                    {data.regaloBanco && (
                                                        <div className="flex justify-between items-center group cursor-pointer" onClick={() => copyToClipboard(data.regaloBanco!)}>
                                                            <span className="font-bold">Bank:</span>
                                                            <span className="flex items-center gap-2">{data.regaloBanco} <Copy className="w-3 h-3 opacity-0 group-hover:opacity-50" /></span>
                                                        </div>
                                                    )}
                                                    {data.regaloCbu && (
                                                        <div className="flex justify-between items-center group cursor-pointer" onClick={() => copyToClipboard(data.regaloCbu!)}>
                                                            <span className="font-bold">CBU:</span>
                                                            <span className="flex items-center gap-2 truncate max-w-[150px]">{data.regaloCbu} <Copy className="w-3 h-3 opacity-0 group-hover:opacity-50" /></span>
                                                        </div>
                                                    )}
                                                    {data.regaloAlias && (
                                                        <div className="flex justify-between items-center group cursor-pointer" onClick={() => copyToClipboard(data.regaloAlias!)}>
                                                            <span className="font-bold">Alias:</span>
                                                            <span className="flex items-center gap-2">{data.regaloAlias} <Copy className="w-3 h-3 opacity-0 group-hover:opacity-50" /></span>
                                                        </div>
                                                    )}
                                                    {data.regaloTitular && (
                                                        <div className="flex justify-between items-center">
                                                            <span className="font-bold">Holder:</span>
                                                            <span>{data.regaloTitular}</span>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </>
                                )}
                            </motion.div>
                        )}
                    </div>
                </section>

                {/* RSVP SECTION */}
                <section className="py-32 px-6 bg-stone-900 text-stone-200">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="max-w-xl mx-auto text-center"
                    >
                        <h2 className="font-luxury-serif text-5xl mb-8 text-white">R . S . V . P</h2>
                        <p className="font-luxury-sans text-stone-400 mb-12 font-light">
                            Please respond by {data.fecha ? format(new Date(data.fecha), "MMMM d", { locale: es }) : "..."}
                            <br />
                            {data.rsvpDaysBeforeEvent ? `(Please confirm ${data.rsvpDaysBeforeEvent} days before)` : ''}
                        </p>

                        <form className="space-y-8 text-left">
                            <div className="space-y-2">
                                <Label className="text-xs uppercase tracking-widest text-stone-500 ml-1">Full Name</Label>
                                <Input
                                    className="bg-transparent border-0 border-b border-stone-700 rounded-none focus-visible:ring-0 focus-visible:border-white px-1 text-xl font-luxury-serif placeholder:text-stone-700 h-12 transition-colors"
                                    placeholder="Enter your name"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs uppercase tracking-widest text-stone-500 ml-1">Attending?</Label>
                                <div className="flex gap-8 pt-2">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className="w-4 h-4 rounded-full border border-stone-500 group-hover:border-white flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <span className="font-luxury-sans text-sm text-stone-300">Yes, gladly</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className="w-4 h-4 rounded-full border border-stone-500 group-hover:border-white flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <span className="font-luxury-sans text-sm text-stone-300">Regretfully no</span>
                                    </label>
                                </div>
                            </div>

                            <Button className="w-full bg-white text-black hover:bg-stone-200 rounded-none h-14 font-luxury-sans uppercase tracking-[0.2em] text-xs mt-8 transition-all">
                                Send Response
                            </Button>
                        </form>
                    </motion.div>
                </section>

                {/* FINAL MESSAGE */}
                {data.mensajeFinalHabilitado && (
                    <section className="py-24 px-6 text-center bg-stone-900 border-t border-stone-800">
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="max-w-2xl mx-auto"
                        >
                            <p className="font-luxury-serif text-3xl italic text-stone-400">
                                "{data.mensajeFinalTexto || 'We look forward to celebrating with you.'}"
                            </p>
                        </motion.div>
                    </section>
                )}

                {/* FOOTER */}
                <footer className="py-12 text-center bg-stone-950 text-stone-600">
                    <p className="font-luxury-serif italic text-lg opacity-50">
                        Designed with love
                    </p>
                </footer>
            </main>
        </div>
    );
}
