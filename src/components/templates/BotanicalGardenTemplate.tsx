"use client";

import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useRef, useState, useEffect } from "react";
// import { InvitationTemplateProps } from "./types"; (removed strict type)
interface InvitationTemplateProps {
    data: any;
    themeConfig: any;
}
import { MapPin, Calendar, Clock, Gift, Music, Heart, Leaf, Copy, ChevronDown } from "lucide-react";
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

export function BotanicalGardenTemplate({ data, themeConfig }: InvitationTemplateProps) {
    const { primaryColor, backgroundColor } = themeConfig;
    const { showToast } = useToast();

    // Fallback fonts injection
    // As per user request: 'Libre Baskerville', 'Dancing Script'

    const floatingVariant = {
        animate: {
            y: [0, -15, 0],
            rotate: [0, 2, -2, 0],
            transition: {
                duration: 6,
                ease: "easeInOut" as const,
                repeat: Infinity,
            }
        }
    };

    const { scrollYProgress } = useScroll();
    const yHero = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const countdown = useCountdown(data.fecha);

    // Bank Details Expansion
    const [showBankDetails, setShowBankDetails] = useState(false);

    // Copy to clipboard
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        showToast("Dato copiado al portapapeles", "success");
    };

    return (
        <div
            className="h-full w-full overflow-x-hidden bg-[#E8F3E8] relative selection:bg-[#B8A398] selection:text-white"
            style={{
                fontFamily: themeConfig.fontFamily === 'poppins' ? '"Libre Baskerville", serif' : undefined,
                // Inject CSS variables for shared components
                ['--color-primary' as any]: '#3A5A40',
                ['--color-background' as any]: '#FAFAFA',
                ['--color-text-light' as any]: '#ffffff',
                ['--color-text-secondary' as any]: '#5c5c5c',
                ['--font-ornamental' as any]: "'Libre Baskerville', serif",
            }}
        >
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Dancing+Script:wght@400;600&family=Quicksand:wght@300;400;500&display=swap');
                .font-botanic-serif { font-family: 'Libre Baskerville', serif; }
                .font-botanic-script { font-family: 'Dancing Script', cursive; }
                .font-botanic-sans { font-family: 'Quicksand', sans-serif; }
            `}</style>

            {/* INJECT SHARED COMPONENT STYLES IF NEEDED */}

            {/* Floating Organic Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <motion.div
                    className="absolute -top-20 -right-20 w-96 h-96 bg-[#F7E7DC] rounded-full mix-blend-multiply filter blur-3xl opacity-60"
                    animate={{
                        scale: [1, 1.2, 1],
                        x: [0, 50, 0],
                        y: [0, 30, 0]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute top-1/3 -left-20 w-80 h-80 bg-[#B8A398] rounded-full mix-blend-multiply filter blur-3xl opacity-40"
                    animate={{
                        scale: [1, 1.1, 1],
                        x: [0, -30, 0],
                        y: [0, 50, 0]
                    }}
                    transition={{ duration: 12, delay: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-0 right-10 w-[500px] h-[500px] bg-[#D4A574] rounded-full mix-blend-multiply filter blur-[100px] opacity-20"
                    animate={{
                        scale: [0.8, 1, 0.8],
                    }}
                    transition={{ duration: 15, delay: 1, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>

            {/* HERO SECTION */}
            <header className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden z-10">

                {/* Decorative SVG Frame/Leaves */}
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 2 }}
                >
                    <svg className="absolute top-0 left-0 w-64 h-64 text-[#3A5A40] opacity-20" viewBox="0 0 100 100" fill="currentColor">
                        <path d="M0 0C20 0 50 20 50 50C50 80 20 100 0 100V0Z" />
                    </svg>
                </motion.div>

                <motion.div
                    variants={floatingVariant}
                    animate="animate"
                    className="relative z-10 bg-white/40 backdrop-blur-sm p-12 rounded-[3rem] border border-white/60 shadow-xl max-w-2xl w-full"
                >
                    <p className="font-botanic-sans uppercase tracking-[0.2em] text-[#3A5A40] mb-4 text-sm font-semibold">
                        {data.type === 'CASAMIENTO' ? 'Nos Casamos' : 'Estás Invitado'}
                    </p>

                    <h1 className="font-botanic-script text-7xl md:text-8xl text-[#3A5A40] mb-6 leading-[1.2]">
                        {data.type === 'CASAMIENTO' && (
                            <>
                                <span className="block">{data.nombreNovia}</span>
                                <span className="text-4xl text-[#B8A398]">&</span>
                                <span className="block">{data.nombreNovio}</span>
                            </>
                        )}
                        {data.type !== 'CASAMIENTO' && (data.nombreQuinceanera || data.nombreEvento)}
                    </h1>

                    <div className="flex items-center justify-center gap-4 my-8">
                        <div className="h-px w-12 bg-[#3A5A40]" />
                        <Leaf className="w-6 h-6 text-[#D4A574]" />
                        <div className="h-px w-12 bg-[#3A5A40]" />
                    </div>

                    <p className="font-botanic-serif text-3xl font-bold text-[#203124] italic">
                        {data.fecha ? format(new Date(data.fecha), "PPP", { locale: es }) : "Fecha por definir"}
                    </p>
                </motion.div>

                {/* Scroll hint */}
                <motion.div
                    className="absolute bottom-10"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                >
                    <span className="font-botanic-sans text-[#3A5A40] text-sm tracking-widest uppercase">Descubre</span>
                </motion.div>
            </header>

            {/* CURVED TRANSITION */}
            <div className="relative h-24 overflow-hidden -mt-1 z-20">
                <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-full text-white fill-current">
                    <path d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,208C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                </svg>
            </div>

            {/* MAIN CONTENT */}
            <main className="relative z-20 bg-white pb-32">

                {/* FRASE / QUOTE SECTION */}
                {data.frasePersonalizadaHabilitada && (
                    <section className="py-20 px-6 text-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="max-w-3xl mx-auto p-10 rounded-[2rem] bg-[#E8F3E8]/50 border border-[#dce9dc]"
                        >
                            <p className="font-botanic-serif text-2xl md:text-3xl text-[#3A5A40] italic leading-relaxed">
                                "{data.frasePersonalizadaTexto}"
                            </p>
                        </motion.div>
                    </section>
                )}

                {/* COUNTDOWN SECTION */}
                <section className="py-20 px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="font-botanic-sans text-sm tracking-[0.3em] uppercase mb-10 text-[#5c5c5c]">Cuenta Regresiva</h2>
                        <div className="flex flex-wrap justify-center gap-6 md:gap-12">
                            {[
                                { label: 'Días', value: countdown.days },
                                { label: 'Horas', value: countdown.hours },
                                { label: 'Min', value: countdown.minutes },
                                { label: 'Seg', value: countdown.seconds }
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col items-center">
                                    <div className="w-24 h-24 md:w-32 md:h-32 bg-[#3A5A40] text-white rounded-full flex items-center justify-center shadow-lg border-4 border-[#E8F3E8] relative">
                                        {/* Organic Leaf Detail */}
                                        <Leaf className="absolute -top-2 -right-2 w-6 h-6 text-[#9bbb59]" />
                                        <span className="font-botanic-serif text-3xl md:text-5xl font-bold">
                                            {String(item.value).padStart(2, '0')}
                                        </span>
                                    </div>
                                    <span className="font-botanic-sans text-xs tracking-[0.2em] uppercase text-[#3A5A40] mt-3 font-semibold">
                                        {item.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* STORY & TIMELINE - Path Animation Style */}
                <section className="py-20 px-4 max-w-5xl mx-auto">
                    <div className="relative">
                        {/* Dashed line connecting sections - rudimentary SVG path simulation */}
                        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px border-l-2 border-dashed border-[#B8A398]/50 -translate-x-1/2 hidden md:block" />

                        <div className="space-y-24">
                            {/* Where */}
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="md:flex items-center justify-between gap-12 group"
                            >
                                <div className="md:w-[45%] text-right bg-[#FAFAFA] p-8 rounded-[2rem] rounded-tr-none shadow-sm hover:shadow-md transition-shadow border border-[#E8F3E8]">
                                    <MapPin className="w-8 h-8 text-[#D4A574] ml-auto mb-4" />
                                    <h3 className="font-botanic-serif text-2xl text-[#3A5A40] mb-2">La Ceremonia</h3>
                                    <p className="font-botanic-sans text-gray-600 font-semibold">{data.lugarNombre}</p>
                                    <p className="font-botanic-sans text-gray-500 text-sm mt-1">{data.direccion}</p>

                                    {data.mapUrl && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-4 border-[#3A5A40] text-[#3A5A40] hover:bg-[#3A5A40] hover:text-white rounded-full"
                                            onClick={() => window.open(data.mapUrl, '_blank')}
                                        >
                                            Ver Mapa
                                        </Button>
                                    )}
                                </div>
                                <div className="hidden md:block w-[10%] relative flex justify-center">
                                    <div className="w-4 h-4 rounded-full bg-[#3A5A40] border-4 border-[#E8F3E8]" />
                                </div>
                                <div className="md:w-[45%] mt-8 md:mt-0">
                                    {/* Optional Image or Empty space */}
                                    <div className="aspect-video rounded-[2rem] rounded-bl-none overflow-hidden bg-[#E8F3E8]">
                                        <img src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" alt="Ceremony" />
                                    </div>
                                </div>
                            </motion.div>

                            {/* When */}
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="md:flex items-center justify-between gap-12 flex-row-reverse group"
                            >
                                <div className="md:w-[45%] text-left bg-[#FAFAFA] p-8 rounded-[2rem] rounded-tl-none shadow-sm hover:shadow-md transition-shadow border border-[#E8F3E8]">
                                    <Clock className="w-8 h-8 text-[#D4A574] mr-auto mb-4" />
                                    <h3 className="font-botanic-serif text-2xl text-[#3A5A40] mb-2">Horario</h3>
                                    <p className="font-botanic-sans text-gray-600 text-lg font-semibold">{data.hora || "Por definir"}</p>
                                    <p className="font-botanic-sans text-gray-500 text-sm mt-1">Se ruega puntualidad</p>
                                </div>
                                <div className="hidden md:block w-[10%] relative flex justify-center">
                                    <div className="w-4 h-4 rounded-full bg-[#3A5A40] border-4 border-[#E8F3E8]" />
                                </div>
                                <div className="md:w-[45%] mt-8 md:mt-0">
                                    <div className="aspect-video rounded-[2rem] rounded-br-none overflow-hidden bg-[#E8F3E8]">
                                        <img src="https://images.unsplash.com/photo-1507915977619-6ccfe8003aa6?q=80&w=1974&auto=format&fit=crop" className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" alt="Time" />
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* GALLERY - ORGANIC SHAPES */}
                {(data.galeriaPrincipalHabilitada && data.galeriaPrincipalFotos.length > 0) && (
                    <section className="py-20 px-4 bg-[#F7E7DC]/30">
                        <div className="max-w-6xl mx-auto">
                            <h2 className="font-botanic-script text-5xl text-center text-[#3A5A40] mb-16">Nuestros Momentos</h2>

                            <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                                {data.galeriaPrincipalFotos.map((foto: string, index: number) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 50 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                        className="overflow-hidden bg-white p-2 shadow-lg transition-transform hover:-translate-y-2 duration-300"
                                        style={{
                                            // Randomize border radius for organic feel
                                            borderRadius: index % 2 === 0 ? '2rem 1rem 3rem 1rem' : '1rem 3rem 1rem 2rem'
                                        }}
                                    >
                                        <img
                                            src={foto}
                                            alt={`Gallery ${index}`}
                                            className="w-full h-auto rounded-[inherit] transform group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* TRIVIA SECTION */}
                {data.triviaHabilitada && data.triviaPreguntas && (
                    <div className="bg-[#E8F3E8]/30">
                        <QuizTrivia
                            titulo="¿Cuánto nos conoces?"
                            subtitulo="¡Juega y diviértete con nuestra trivia!"
                            preguntas={typeof data.triviaPreguntas === 'string' ? JSON.parse(data.triviaPreguntas) : data.triviaPreguntas}
                            invitationId={data.id}
                        />
                    </div>
                )}

                {/* SHARED ALBUM SECTION */}
                {data.albumCompartidoHabilitado && (
                    <div className="bg-white">
                        <SharedAlbum
                            invitationSlug={data.slug || ''}
                            titulo="Álbum de Recuerdos"
                            descripcion="¡Ayúdanos a capturar cada momento especial!"
                            colorPrimario={"#3A5A40"}
                            fechaEvento={data.fecha ? new Date(data.fecha) : undefined}
                            guestName="Invitado"
                        />
                    </div>
                )}

                {/* GIFT & BANK DETAILS */}
                {data.regaloHabilitado && (
                    <section className="py-20 px-4 bg-[#F9F7F5]">
                        <div className="max-w-3xl mx-auto">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="bg-white p-10 md:p-14 rounded-[3rem] border border-[#E8F3E8] text-center shadow-lg relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-20 h-20 bg-[#E8F3E8] rounded-bl-[100%]" />
                                <Gift className="w-10 h-10 mx-auto mb-6 text-[#D4A574]" strokeWidth={1.5} />

                                <h3 className="font-botanic-serif text-2xl text-[#3A5A40] mb-4">{data.regaloTitulo || "Regalo"}</h3>
                                <p className="font-botanic-sans text-lg text-gray-600 mb-8 leading-relaxed">
                                    {data.regaloMensaje || "Tu presencia es nuestro mejor regalo."}
                                </p>

                                {data.regaloMostrarDatos && (
                                    <>
                                        <Button
                                            variant="outline"
                                            className="border-[#3A5A40] text-[#3A5A40] hover:bg-[#3A5A40] hover:text-white rounded-full px-8 py-2 font-botanic-sans"
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
                                                    className="mt-8 text-left bg-[#E8F3E8]/50 p-6 md:p-8 rounded-2xl text-stone-700 space-y-4 font-botanic-sans"
                                                >
                                                    {data.regaloBanco && (
                                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center group cursor-pointer border-b border-[#3A5A40]/10 pb-2" onClick={() => copyToClipboard(data.regaloBanco!)}>
                                                            <span className="font-bold text-[#3A5A40]">Banco:</span>
                                                            <span className="flex items-center gap-2">{data.regaloBanco} <Copy className="w-4 h-4 opacity-50" /></span>
                                                        </div>
                                                    )}
                                                    {data.regaloCbu && (
                                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center group cursor-pointer border-b border-[#3A5A40]/10 pb-2" onClick={() => copyToClipboard(data.regaloCbu!)}>
                                                            <span className="font-bold text-[#3A5A40]">CBU/CVU:</span>
                                                            <span className="flex items-center gap-2 break-all">{data.regaloCbu} <Copy className="w-4 h-4 opacity-50" /></span>
                                                        </div>
                                                    )}
                                                    {data.regaloAlias && (
                                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center group cursor-pointer border-b border-[#3A5A40]/10 pb-2" onClick={() => copyToClipboard(data.regaloAlias!)}>
                                                            <span className="font-bold text-[#3A5A40]">Alias:</span>
                                                            <span className="flex items-center gap-2">{data.regaloAlias} <Copy className="w-4 h-4 opacity-50" /></span>
                                                        </div>
                                                    )}
                                                    {data.regaloTitular && (
                                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center pt-2">
                                                            <span className="font-bold text-[#3A5A40]">Titular:</span>
                                                            <span>{data.regaloTitular}</span>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </>
                                )}
                            </motion.div>
                        </div>
                    </section>
                )}

                {/* RSVP FLOWER CARD */}
                <section className="py-32 px-4 relative">
                    <motion.div
                        whileInView={{ scale: [0.95, 1] }}
                        transition={{ duration: 0.5 }}
                        className="max-w-xl mx-auto bg-white rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(58,90,64,0.15)] p-8 md:p-12 border border-[#E8F3E8] relative overflow-hidden"
                    >
                        {/* Corner decoration */}
                        <div className="absolute top-0 left-0 w-32 h-32 bg-[#E8F3E8] rounded-br-[100%] opacity-50 -z-0" />
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#F7E7DC] rounded-tl-[100%] opacity-50 -z-0" />

                        <div className="relative z-10 text-center">
                            <h2 className="font-botanic-serif text-3xl text-[#3A5A40] mb-2">Confirmación</h2>
                            <p className="font-botanic-sans text-gray-500 mb-8">
                                Esperamos contar contigo.
                                <br />
                                {data.rsvpDaysBeforeEvent ? `(Confirmar hasta ${data.rsvpDaysBeforeEvent} días antes)` : ''}
                            </p>

                            <form className="space-y-6">
                                <div>
                                    <Label className="sr-only">Nombre</Label>
                                    <Input
                                        placeholder="Nombre completo"
                                        className="h-14 rounded-2xl bg-[#FAFAFA] border-[#E8F3E8] focus:border-[#D4A574] focus:ring-0 text-center font-botanic-sans"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-14 rounded-2xl border-[#E8F3E8] hover:bg-[#E8F3E8] hover:text-[#3A5A40] text-gray-600 font-botanic-sans"
                                    >
                                        Asistiré
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-14 rounded-2xl border-[#E8F3E8] hover:bg-[#FEE2E2] hover:text-red-500 text-gray-600 font-botanic-sans"
                                    >
                                        No podré
                                    </Button>
                                </div>

                                <Button className="w-full h-14 rounded-2xl bg-[#3A5A40] hover:bg-[#2D4531] text-white font-botanic-sans text-lg shadow-lg shadow-[#3A5A40]/20 mt-4">
                                    Enviar Respuesta
                                </Button>
                            </form>
                        </div>
                    </motion.div>
                </section>

                {/* FINAL MESSAGE */}
                {data.mensajeFinalHabilitado && (
                    <section className="py-20 px-6 text-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="max-w-2xl mx-auto"
                        >
                            <p className="font-botanic-serif text-3xl md:text-4xl text-[#3A5A40] italic leading-snug">
                                "{data.mensajeFinalTexto || '¡Te esperamos para celebrar!'}"
                            </p>
                        </motion.div>
                    </section>
                )}

                <footer className="text-center pb-12 pt-0 font-botanic-sans text-[#B8A398] text-sm">
                    <p>Con amor, {data.nombreNovia || "Nosotros"} & {data.nombreNovio || "Nosotros"}</p>
                </footer>
            </main>
        </div >
    );
}
