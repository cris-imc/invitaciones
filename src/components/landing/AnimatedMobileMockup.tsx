"use client";

import { useEffect, useState } from "react";
import { Camera, Send, Heart, MapPin, CalendarClock, Music, CheckCircle2 } from "lucide-react";

export function AnimatedMobileMockup() {
    const [scene, setScene] = useState(0);
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setScene((s) => (s + 1) % 3);
        }, 5000);
        
        const secInterval = setInterval(() => {
            setSeconds((s) => (s + 1) % 60);
        }, 1000);
        
        return () => {
            clearInterval(interval);
            clearInterval(secInterval);
        };
    }, []);

    return (
        <div className="relative mx-auto w-[280px] h-[580px] bg-black rounded-[3rem] border-[8px] border-zinc-900 shadow-2xl overflow-hidden ring-1 ring-white/10">
            {/* Notch */}
            <div className="absolute top-0 inset-x-0 h-6 bg-zinc-900 rounded-b-2xl w-32 mx-auto z-50"></div>
            
            {/* Screen Content Container */}
            <div className="relative w-full h-full bg-[#f8f9fa] overflow-hidden">
                
                {/* SCENE 0: Diseño Personalizable (Hero) */}
                <div className={`absolute inset-0 transition-opacity duration-1000 ${scene === 0 ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                    <div className="h-[400px] w-full bg-zinc-800 relative flex flex-col items-center justify-center p-6 text-center text-white overflow-hidden" style={{ backgroundImage: "url('/landing/novios1.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}>
                        <div className="absolute inset-0 bg-black/40 z-10"></div>
                        <div className="relative z-20 flex flex-col items-center animate-[slideUp_1s_ease-out]">
                            <p className="text-xs tracking-[0.3em] uppercase mb-4 opacity-80">Nos casamos</p>
                            <h2 className="text-4xl font-serif mb-4">Martina<br/>& Gonzalo</h2>
                            <p className="text-xs uppercase tracking-widest opacity-80">14 · 03 · 2027</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-t-3xl -mt-6 relative z-30 p-6 flex flex-col gap-4 animate-[slideUp_1.5s_ease-out]">
                        <div className="h-16 bg-zinc-50 rounded-xl border border-zinc-100 flex items-center justify-around px-4">
                            <div className="flex flex-col items-center"><span className="text-lg font-bold text-zinc-800">62</span><span className="text-[10px] text-zinc-400 uppercase">Días</span></div>
                            <div className="flex flex-col items-center"><span className="text-lg font-bold text-zinc-800">14</span><span className="text-[10px] text-zinc-400 uppercase">Hs</span></div>
                            <div className="flex flex-col items-center"><span className="text-lg font-bold text-zinc-800">32</span><span className="text-[10px] text-zinc-400 uppercase">Min</span></div>
                            <div className="flex flex-col items-center"><span className="text-lg font-bold text-yellow-500 tabular-nums">{(59 - seconds).toString().padStart(2, "0")}</span><span className="text-[10px] text-zinc-400 uppercase">Seg</span></div>
                        </div>
                    </div>
                </div>

                {/* SCENE 1: Gestión de Invitados y Pagos (RSVP) */}
                <div className={`absolute inset-0 bg-zinc-50 transition-opacity duration-1000 ${scene === 1 ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                    <div className="p-6 pt-12 flex flex-col gap-4">
                        <div className="text-center mb-4 animate-[fadeIn_0.5s_ease-out]">
                            <h3 className="text-xl font-serif text-zinc-800">Confirmar Asistencia</h3>
                            <p className="text-xs text-zinc-500 mt-2">Por favor, confirmanos antes del 1 de Marzo.</p>
                        </div>
                        
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-100 animate-[slideUp_0.8s_ease-out] flex flex-col gap-3">
                            <div className="h-10 bg-zinc-100 rounded-lg w-full"></div>
                            <div className="h-10 bg-zinc-100 rounded-lg w-full"></div>
                            <div className="flex gap-2">
                                <div className="h-10 bg-zinc-800 rounded-lg w-full text-white flex items-center justify-center text-sm font-medium">Sí, asisto</div>
                                <div className="h-10 bg-zinc-100 rounded-lg w-full text-zinc-400 flex items-center justify-center text-sm font-medium">No asisto</div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-100 animate-[slideUp_1.2s_ease-out] mt-4">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center"><CheckCircle2 className="w-4 h-4" /></div>
                                <span className="text-sm font-medium text-zinc-800">Mesa de Regalos</span>
                            </div>
                            <div className="h-10 bg-zinc-800 rounded-lg w-full text-white flex items-center justify-center text-sm font-medium">Ver datos bancarios</div>
                        </div>
                    </div>
                </div>

                {/* SCENE 2: LIVE (Fotos y Mensajes) */}
                <div className={`absolute inset-0 bg-zinc-900 transition-opacity duration-1000 ${scene === 2 ? "opacity-100" : "opacity-0 pointer-events-none"}`} style={{ backgroundImage: "url('/landing/fiesta.png')", backgroundSize: "cover", backgroundPosition: "center" }}>
                    <div className="absolute inset-0 bg-black/60 z-0"></div>
                    <div className="p-6 pt-12 flex flex-col h-full relative z-10">
                        <div className="flex items-center justify-between mb-6 animate-[fadeIn_0.5s_ease-out]">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                <span className="text-white font-medium text-sm">LIVE</span>
                            </div>
                            <span className="text-zinc-300 text-xs font-medium">84 conectados</span>
                        </div>
                        
                        <div className="flex-1 flex flex-col justify-end gap-3 pb-16">
                            {/* Mensaje 1 */}
                            <div className="bg-zinc-900/80 backdrop-blur-md p-3 rounded-2xl rounded-tl-sm self-start max-w-[85%] border border-white/10 animate-[slideUp_0.8s_ease-out]">
                                <p className="text-xs font-bold text-yellow-400 mb-1">Julieta Gómez</p>
                                <p className="text-sm text-white">¡Qué hermosa fiesta! Los quiero muchísimo ❤️</p>
                            </div>
                            
                            {/* Foto */}
                            <div className="bg-zinc-900/80 backdrop-blur-md p-2 rounded-2xl self-end max-w-[75%] border border-white/10 animate-[slideUp_1.2s_ease-out]">
                                <div className="w-full h-32 bg-zinc-800 rounded-xl mb-2 flex items-center justify-center overflow-hidden relative">
                                    <div className="absolute inset-0" style={{ backgroundImage: "url('/landing/fiesta.png')", backgroundSize: "cover", backgroundPosition: "center", filter: "blur(2px) brightness(1.2)" }}></div>
                                    <Heart className="w-8 h-8 text-white z-10 drop-shadow-md animate-pulse" fill="currentColor" />
                                </div>
                                <p className="text-xs font-bold text-white px-1">Fede R.</p>
                            </div>
                        </div>

                        {/* Input fake */}
                        <div className="absolute bottom-6 left-6 right-6 h-12 bg-zinc-900/90 backdrop-blur-md rounded-full border border-white/10 flex items-center px-4 justify-between">
                            <span className="text-zinc-400 text-sm">Escribe un mensaje...</span>
                            <div className="flex gap-3 text-zinc-300">
                                <Camera className="w-5 h-5" />
                                <Send className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
