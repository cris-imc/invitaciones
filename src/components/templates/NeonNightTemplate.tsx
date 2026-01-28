"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, MapPin, Calendar, Clock, Zap, Disc, Gift, Copy, ChevronDown, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QuizTrivia } from "@/components/invitation/QuizTrivia";
import { SharedAlbum } from "@/components/invitation/SharedAlbum";
import { PersonalizedRsvpForm } from "@/components/invitation/PersonalizedRsvpForm";
import { useToast } from "@/components/ui/Toast";
import { GlitchText, ScanlineOverlay, NeonBorder } from "@/components/modern/CyberpunkEffects";
import { InvitationTemplateProps } from "./types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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

export function NeonNightTemplate({ data, themeConfig, guest, isPersonalized = false }: InvitationTemplateProps) {
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
        showToast("Datos copiados al portapapeles", "success");
    };

    return (
        <div className="min-h-screen bg-[#050505] text-[#E0E0E0] overflow-x-hidden selection:bg-[#00F3FF] selection:text-black relative font-sans">

            {/* Styles Injection */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap');
                .font-neon-display { font-family: 'Orbitron', sans-serif; }
                .font-neon-body { font-family: 'Rajdhani', sans-serif; }
                
                @keyframes pulse-glow {
                    0%, 100% { box-shadow: 0 0 10px #00F3FF, 0 0 20px #00F3FF; }
                    50% { box-shadow: 0 0 20px #FF00FF, 0 0 40px #FF00FF; }
                }
                .animate-pulse-glow {
                    animation: pulse-glow 3s infinite alternate;
                }
            `}</style>

            {/* Effects */}
            <ScanlineOverlay />
            <div className="fixed inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(#00F3FF 1px, transparent 1px), linear-gradient(90deg, #FF00FF 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            />
            {/* Ambient Glows */}
            <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#FF00FF] rounded-full blur-[150px] opacity-20 pointer-events-none animate-pulse" />
            <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#00F3FF] rounded-full blur-[150px] opacity-20 pointer-events-none animate-pulse" />

            {/* Audio Control */}
            {data.musicaUrl && (
                <>
                    <audio ref={audioRef} loop src={data.musicaUrl} />
                    <button
                        onClick={togglePlay}
                        className="fixed top-6 right-6 z-50 w-12 h-12 flex items-center justify-center rounded-full border border-[#00F3FF] bg-black/60 backdrop-blur-md text-[#00F3FF] hover:bg-[#00F3FF] hover:text-black transition-all duration-300 shadow-[0_0_15px_rgba(0,243,255,0.5)]"
                    >
                        {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
                    </button>
                </>
            )}

            {/* HERO SECTION */}
            <header className="relative min-h-screen flex flex-col items-center justify-center p-6 text-center overflow-hidden">
                <motion.div
                    style={{ opacity: opacityHero, scale: scaleHero }}
                    className="relative z-10 space-y-6 max-w-5xl"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 2, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                        transition={{ duration: 0.8 }}
                    >
                        <GlitchText className="text-sm md:text-lg font-neon-display tracking-[0.5em] text-[#00F3FF] mb-4">
                            {data.nombreEvento || (data.type === 'CASAMIENTO' ? 'PROTOCOLO DE BODA' : 'MODO FIESTA ACTIVADO')}
                        </GlitchText>

                        <h1 className="font-neon-display text-5xl md:text-7xl lg:text-9xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#00F3FF] via-white to-[#FF00FF] drop-shadow-[0_0_10px_rgba(0,243,255,0.5)] italic transform -skew-x-12">
                            {data.type === 'CASAMIENTO' ? (
                                <>
                                    <span className="block leading-none mb-2">{data.nombreNovia}</span>
                                    <span className="block text-4xl md:text-6xl text-white not-italic my-2">&</span>
                                    <span className="block leading-none">{data.nombreNovio}</span>
                                </>
                            ) : (
                                <span>{data.nombreQuinceanera || data.nombreEvento}</span>
                            )}
                        </h1>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="flex flex-col md:flex-row gap-6 mt-12 justify-center items-center"
                    >
                        <NeonBorder color="#00F3FF" className="px-8 py-3 bg-black/40 backdrop-blur-sm rounded-lg flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-[#00F3FF]" />
                            <span className="font-neon-display text-lg">{data.fecha ? format(new Date(data.fecha), "yyyy.MM.dd") : "xxxx.xx.xx"}</span>
                        </NeonBorder>

                        <NeonBorder color="#FF00FF" className="px-8 py-3 bg-black/40 backdrop-blur-sm rounded-lg flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-[#FF00FF]" />
                            <span className="font-neon-display text-lg">{data.lugarNombre}</span>
                        </NeonBorder>
                    </motion.div>
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, y: [0, 10, 0] }}
                    transition={{ delay: 2, duration: 2, repeat: Infinity }}
                    className="absolute bottom-12 left-1/2 -translate-x-1/2 text-[#00F3FF]"
                >
                    <ChevronDown className="w-8 h-8 animate-bounce" />
                </motion.div>
            </header>

            {/* COUNTDOWN */}
            <section className="py-20 bg-[#050505] relative border-y border-[#00F3FF]/20">
                <div className="text-center mb-12">
                    <h2 className="font-neon-display text-[#00F3FF] text-xl tracking-[0.3em] animate-pulse">INICIANDO...</h2>
                </div>
                <div className="container mx-auto flex flex-wrap justify-center gap-6 md:gap-12">
                    {[
                        { label: 'DÍAS', value: countdown.days },
                        { label: 'HORAS', value: countdown.hours },
                        { label: 'MINS', value: countdown.minutes },
                        { label: 'SEGS', value: countdown.seconds }
                    ].map((item, i) => (
                        <div key={i} className="bg-black border border-[#222] p-6 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] min-w-[120px] text-center relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00F3FF] to-[#FF00FF]" />
                            <span className="font-neon-display text-5xl md:text-6xl font-black text-white group-hover:text-[#00F3FF] transition-colors duration-300">
                                {String(item.value).padStart(2, '0')}
                            </span>
                            <span className="block font-neon-body text-xs tracking-widest text-neutral-500 mt-2">{item.label}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* MAIN CONTENT */}
            <main className="container mx-auto px-6 py-20 space-y-32 relative z-10">

                {/* DETAILS GRID */}
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    {/* Image */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                        className="relative rounded-3xl overflow-hidden border-2 border-transparent group"
                        style={{ boxShadow: '0 0 30px rgba(0, 243, 255, 0.2)' }}
                    >
                        {data.portadaImagenFondo ? (
                            <img src={data.portadaImagenFondo} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale hover:grayscale-0" alt="Event" />
                        ) : (
                            <div className="h-96 w-full bg-[#111] flex items-center justify-center">
                                <Disc className="w-20 h-20 text-[#333] animate-spin-slow" />
                            </div>
                        )}
                        <div className="absolute inset-0 border-[4px] border-[#00F3FF] opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none" />
                    </motion.div>

                    {/* Text Details */}
                    <div className="space-y-8">
                        <NeonBorder className="p-8 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10" color="#FF00FF">
                            <h3 className="text-[#FF00FF] font-neon-display text-2xl mb-4 flex items-center gap-3">
                                <MapPin /> COORDENADAS
                            </h3>
                            <p className="font-neon-body text-2xl">{data.lugarNombre}</p>
                            <p className="font-neon-body text-lg text-neutral-400 mt-2">{data.direccion}</p>

                            {data.mapUrl && (
                                <Button
                                    className="mt-6 w-full bg-transparent border border-[#FF00FF] text-[#FF00FF] hover:bg-[#FF00FF] hover:text-black font-neon-display font-bold uppercase transition-all shadow-[0_0_10px_rgba(255,0,255,0.3)]"
                                    onClick={() => window.open(data.mapUrl, '_blank')}
                                >
                                    Acceder al Mapa
                                </Button>
                            )}
                        </NeonBorder>

                        <NeonBorder className="p-8 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10" color="#00F3FF">
                            <h3 className="text-[#00F3FF] font-neon-display text-2xl mb-4 flex items-center gap-3">
                                <Clock /> CRONOGRAMA
                            </h3>
                            <p className="font-neon-body text-2xl">
                                {new Date(data.fecha).toLocaleDateString('es-AR', { dateStyle: 'full' })}
                            </p>
                            <p className="font-neon-display text-4xl text-white mt-2 font-bold">{data.hora} HS</p>
                        </NeonBorder>
                    </div>
                </div>

                {/* QUOTE */}
                {data.frasePersonalizadaHabilitada && (
                    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center max-w-4xl mx-auto py-12 border-y border-[#333]">
                        <p className="font-neon-display text-2xl md:text-4xl italic text-transparent bg-clip-text bg-gradient-to-r from-[#00F3FF] to-[#FF00FF] leading-relaxed">
                            "{data.frasePersonalizadaTexto}"
                        </p>
                    </motion.div>
                )}

                {/* GALLERY */}
                {(data.galeriaPrincipalHabilitada && data.galeriaPrincipalFotos.length > 0) && (
                    <section className="space-y-12">
                        <h2 className="font-neon-display text-4xl md:text-6xl text-center text-white mb-12">
                            <span className="text-[#00F3FF]">&lt;</span> VISUAL_LOGS <span className="text-[#00F3FF]">/&gt;</span>
                        </h2>

                        <div className="flex overflow-x-auto gap-6 pb-8 snap-x">
                            {data.galeriaPrincipalFotos.map((foto: string, index: number) => (
                                <motion.div
                                    key={index}
                                    className="min-w-[300px] md:min-w-[400px] aspect-[4/5] relative rounded-xl overflow-hidden border border-[#333] group snap-center"
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <div className="absolute inset-0 bg-[#00F3FF]/20 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                                    <img src={foto} className="w-full h-full object-cover" alt="Gallery" />
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}

                {/* TRIVIA */}
                {data.triviaHabilitada && data.triviaPreguntas && (
                    <div className="bg-[#111] rounded-3xl p-8 md:p-12 border border-[#333] relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-20"><Zap size={120} /></div>

                        <div className="quiz-override relative z-10">
                            <QuizTrivia
                                titulo="VERIFICACIÓN DEL SISTEMA: COMPATIBILIDAD"
                                subtitulo="Pon a prueba tu conocimiento sobre los anfitriones"
                                preguntas={typeof data.triviaPreguntas === 'string' ? JSON.parse(data.triviaPreguntas) : data.triviaPreguntas}
                                invitationId={data.id}
                            />
                        </div>
                    </div>
                )}

                {/* SHARED ALBUM */}
                {data.albumCompartidoHabilitado && (
                    <div className="border border-[#333] rounded-3xl overflow-hidden bg-black/50 album-neon-override">
                        <SharedAlbum
                            invitationSlug={data.slug || ''}
                            titulo="RECUERDOS COLABORATIVOS"
                            descripcion="Sube tu perspectiva. Todos los datos se sincronizan."
                            colorPrimario="#FF00FF" // Neon Pink for album accents
                            fechaEvento={data.fecha ? new Date(data.fecha) : undefined}
                            guestName="Usuario"
                        />
                    </div>
                )}

                {/* GIFT & BANK */}
                {data.regaloHabilitado && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        className="bg-black border border-[#00F3FF] p-10 md:p-16 rounded-[2rem] text-center relative overflow-hidden shadow-[0_0_40px_rgba(0,243,255,0.1)]"
                    >
                        <Gift className="w-16 h-16 mx-auto text-[#00F3FF] mb-6 animate-pulse" />
                        <h3 className="font-neon-display text-3xl md:text-4xl text-white mb-6 uppercase">{data.regaloTitulo || "Protocolo de Regalos"}</h3>
                        <p className="font-neon-body text-xl text-neutral-400 max-w-2xl mx-auto mb-10">
                            {data.regaloMensaje}
                        </p>

                        {data.regaloMostrarDatos && (
                            <>
                                <Button
                                    className="bg-[#00F3FF] text-black hover:bg-white font-neon-display font-bold uppercase px-8 py-6 rounded-lg shadow-[0_0_20px_rgba(0,243,255,0.4)]"
                                    onClick={() => setShowBankDetails(!showBankDetails)}
                                >
                                    {showBankDetails ? "TERMINAR CONEXIÓN" : "ESTABLECER ENLACE DE TRANSFERENCIA"}
                                </Button>

                                <AnimatePresence>
                                    {showBankDetails && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="mt-8 bg-[#0a0a0a] border border-[#333] rounded-xl p-6 text-left font-mono text-[#00F3FF] text-sm overflow-hidden"
                                        >
                                            <div className="space-y-4">
                                                <p className="text-white border-b border-[#333] pb-2 mb-4">// DETALLES_BANCARIOS_DESCIFRADOS</p>
                                                {[
                                                    { label: "BANK_ID", value: data.regaloBanco },
                                                    { label: "CBU_KEY", value: data.regaloCbu },
                                                    { label: "ALIAS_NODE", value: data.regaloAlias },
                                                    { label: "HOLDER_NAME", value: data.regaloTitular },
                                                ].map((field, i) => field.value && (
                                                    <div key={i} className="flex flex-col md:flex-row justify-between hover:bg-[#111] p-2 rounded cursor-pointer group" onClick={() => field.value && copyToClipboard(field.value)}>
                                                        <span className="text-neutral-500">{field.label}:</span>
                                                        <span className="flex items-center gap-2 text-white">{field.value} <Copy className="w-3 h-3 group-hover:text-[#00F3FF]" /></span>
                                                    </div>
                                                ))}
                                                <p className="text-[#00F3FF] animate-pulse mt-4">&gt;_ Listo para entrada...</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </>
                        )}
                    </motion.div>
                )}

                {/* RSVP */}
                <section className="py-20 relative">
                    <div className="max-w-xl mx-auto space-y-8 bg-black/80 border border-[#FF00FF] p-8 md:p-12 rounded-2xl backdrop-blur-xl">
                        {isPersonalized && guest ? (
                            <>
                                <div className="text-center space-y-4">
                                    <div className="text-6xl">👋</div>
                                    <h2 className="font-neon-display text-2xl md:text-3xl text-[#FF00FF] uppercase tracking-wider">
                                        Hola, {guest.name}
                                    </h2>
                                    <p className="font-neon-body text-neutral-400">Confirmar presencia antes del {data.fecha ? format(new Date(data.fecha), "yyyy.MM.dd") : "xxxx.xx.xx"}</p>
                                </div>
                                <PersonalizedRsvpForm
                                    guest={guest}
                                    invitation={data}
                                    onSuccess={() => {}}
                                />
                            </>
                        ) : (
                            <>
                                <div className="text-center">
                                    <h2 className="font-neon-display text-2xl md:text-3xl text-[#FF00FF] mb-2 uppercase tracking-wider">CONFIRMACIÓN</h2>
                                    <p className="font-neon-body text-neutral-400">Confirmar presencia antes del {data.fecha ? format(new Date(data.fecha), "yyyy.MM.dd") : "xxxx.xx.xx"}</p>
                                </div>

                                <form className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="font-neon-display text-[#FF00FF]">NOMBRE DEL JUGADOR</Label>
                                        <Input className="bg-[#111] border-[#333] text-white focus:border-[#FF00FF] h-12 font-neon-body text-lg" placeholder="Ingresa tu nombre..." />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button type="button" className="p-4 border-2 border-[#333] hover:border-[#00F3FF] hover:text-[#00F3FF] hover:bg-[#00F3FF]/10 rounded-xl transition-all font-neon-display text-sm font-bold">
                                            CONFIRMAR
                                        </button>
                                        <button type="button" className="p-4 border-2 border-[#333] hover:border-[#FF0099] hover:text-[#FF0099] hover:bg-[#FF0099]/10 rounded-xl transition-all font-neon-display text-sm font-bold">
                                            DECLINAR
                                        </button>
                                    </div>

                                    <Button className="w-full bg-[#FF00FF] hover:bg-[#cc00cc] text-white font-bold font-neon-display h-14 rounded-xl shadow-[0_0_20px_rgba(255,0,255,0.4)]">
                                        ENVIAR RESPUESTA
                                    </Button>
                                </form>
                            </>
                        )}
                    </div>
                </section>

                {data.mensajeFinalHabilitado && (
                    <div className="text-center py-12">
                        <h3 className="font-neon-display text-2xl md:text-4xl uppercase text-white tracking-widest leading-loose">
                            {data.mensajeFinalTexto || "GAME ON"}
                        </h3>
                    </div>
                )}
            </main>

            <footer className="py-8 bg-black border-t border-[#333] text-center">
                <p className="font-neon-body text-neutral-600 text-sm">// SYSTEM_END_OF_LINE</p>
            </footer>
            <style jsx global>{`
                .quiz-override {
                    --color-background: #111111;
                    --color-primary: #00F3FF;
                    --color-text-light: #000000;
                }
                .quiz-override h2,
                .quiz-override h3 {
                    font-family: 'Orbitron', sans-serif !important;
                    text-transform: uppercase;
                    letter-spacing: 0.2em;
                }
                .album-neon-override h2,
                .album-neon-override h3,
                .album-neon-override h4 {
                    font-family: 'Orbitron', sans-serif !important;
                    text-transform: uppercase;
                    letter-spacing: 0.2em;
                }
            `}</style>
        </div>
    );
}
