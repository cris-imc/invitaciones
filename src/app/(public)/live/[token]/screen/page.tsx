"use client";

import { useEffect, useState, use } from "react";
import { QRCodeSVG } from "qrcode.react";
import { LiveItem } from "@prisma/client";
import { motion, AnimatePresence } from "framer-motion";
import Marquee from "react-fast-marquee";
import { Logo } from "@/components/ui/Logo";

export default function LiveScreenPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = use(params);
    const [session, setSession] = useState<any>(null);
    const [items, setItems] = useState<LiveItem[]>([]);
    const [loading, setLoading] = useState(true);

    const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/live/${token}` : '';

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const res = await fetch(`/api/live/public/${token}`);
                if (res.ok) {
                    setSession(await res.json());
                } else {
                    setSession(false);
                }
            } catch {
                setSession(false);
            } finally {
                setLoading(false);
            }
        };
        fetchSession();
    }, [token]);

    useEffect(() => {
        if (!session) return;
        const fetchItems = async () => {
            try {
                const res = await fetch(`/api/live/public/${token}/items`);
                if (res.ok) {
                    setItems(await res.json());
                }
            } catch {}
        };
        fetchItems();
        const interval = setInterval(fetchItems, 3000);
        return () => clearInterval(interval);
    }, [session, token]);

    if (loading) return <div className="min-h-dvh bg-[#050807] flex items-center justify-center text-white">Cargando...</div>;
    
    if (session === false || !session.isActive) {
        return (
            <div className="min-h-dvh bg-[#050807] flex items-center justify-center text-white/50 font-serif text-2xl">
                El LIVE está inactivo o finalizó.
            </div>
        );
    }

    return (
        <div className="min-h-dvh bg-[#050807] text-[#F6F3EC] p-8 flex flex-col font-sans">
            <header className="flex justify-between items-start border-b border-[#F6F3EC]/10 pb-8 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2 text-[#C79A4B] text-xs font-mono uppercase tracking-widest">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                        En Vivo
                    </div>
                    <h1 className="text-4xl font-serif font-bold mb-2">
                        {session.invitation?.nombreEvento || "Nuestra Fiesta"}
                    </h1>
                    <p className="text-[#F6F3EC]/60">Escaneá el código para compartir tus fotos y audios al instante.</p>
                </div>

                <div className="bg-[#F6F3EC] p-4 rounded-xl shadow-2xl shrink-0 flex flex-col items-center gap-3">
                    <QRCodeSVG value={publicUrl} size={150} level="H" />
                    <Logo href="" wordmarkColor="ink" />
                </div>
            </header>

            <div className="flex-1 overflow-hidden relative flex items-center">
                {items.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center text-[#F6F3EC]/40 text-lg">
                        ¡Sé el primero en subir una foto!
                    </div>
                ) : items.length < 5 ? (
                    <div className="flex justify-center items-center gap-4 w-full">
                        <AnimatePresence>
                            {items.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ type: "spring", stiffness: 100, damping: 15 }}
                                    className="bg-[#182420] rounded-xl overflow-hidden shadow-xl border border-[#F6F3EC]/5 shrink-0 w-64 md:w-80"
                                >
                                    {item.type === "PHOTO" ? (
                                        <img src={item.fileUrl} alt="Live" className="w-full h-64 md:h-80 object-cover" />
                                    ) : (
                                        <div className="w-full h-64 md:h-80 flex flex-col items-center justify-center bg-indigo-500/10 text-[#F6F3EC] p-8 text-center border border-indigo-500/20">
                                            <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mb-6">
                                                <svg className="w-8 h-8 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                </svg>
                                            </div>
                                            <p className="text-xl md:text-2xl font-serif leading-snug">
                                                "{item.fileUrl}"
                                            </p>
                                        </div>
                                    )}
                                    {item.guestName && (
                                        <div className="p-3 border-t border-[#F6F3EC]/10 text-sm font-medium flex justify-between items-center bg-[#0F1613]">
                                            <span className="truncate pr-2 opacity-80 font-normal">
                                                Enviado por <strong className="text-[#C79A4B] font-semibold">{item.guestName}</strong>
                                            </span>
                                            {item.createdAt && (
                                                <span className="text-xs opacity-50 whitespace-nowrap font-mono">
                                                    {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="w-full">
                        <Marquee speed={40} gradient={true} gradientColor="#050807" gradientWidth={200} autoFill>
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-[#182420] rounded-xl overflow-hidden shadow-xl border border-[#F6F3EC]/5 shrink-0 mx-4 w-64 md:w-80"
                                >
                                    {item.type === "PHOTO" ? (
                                        <img src={item.fileUrl} alt="Live" className="w-full h-64 md:h-80 object-cover" />
                                    ) : (
                                        <div className="w-full h-64 md:h-80 flex flex-col items-center justify-center bg-indigo-500/10 text-[#F6F3EC] p-8 text-center border border-indigo-500/20">
                                            <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mb-6">
                                                <svg className="w-8 h-8 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                </svg>
                                            </div>
                                            <p className="text-xl md:text-2xl font-serif leading-snug">
                                                "{item.fileUrl}"
                                            </p>
                                        </div>
                                    )}
                                    {item.guestName && (
                                        <div className="p-3 border-t border-[#F6F3EC]/10 text-sm font-medium flex justify-between items-center bg-[#0F1613]">
                                            <span className="truncate pr-2 opacity-80 font-normal">
                                                Enviado por <strong className="text-[#C79A4B] font-semibold">{item.guestName}</strong>
                                            </span>
                                            {item.createdAt && (
                                                <span className="text-xs opacity-50 whitespace-nowrap font-mono">
                                                    {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </Marquee>
                    </div>
                )}
            </div>
        </div>
    );
}
