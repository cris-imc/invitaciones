"use client";

import { motion } from "framer-motion";
import { Heart, Music, Utensils, Calendar, Gift, Camera, Clock } from "lucide-react";

interface CronogramaEvent {
    time: string;
    title: string;
    icon: string;
}

interface CronogramaOriginalProps {
    events: CronogramaEvent[];
}

const ICON_MAP: Record<string, any> = {
    Heart,
    Music,
    Utensils,
    Calendar,
    Gift,
    Camera,
    Clock
};

export function CronogramaOriginal({ events }: CronogramaOriginalProps) {
    if (!events || events.length === 0) return null;

    return (
        <section className="py-20 px-6 bg-gradient-to-b from-white to-slate-50">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <span className="text-xs tracking-[0.25em] block mb-3 text-muted-foreground uppercase">
                        Programa
                    </span>
                    <h2 className="text-3xl md:text-4xl" style={{ color: 'var(--color-primary)', fontFamily: "var(--font-ornamental)" }}>
                        Cronograma del Evento
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {events.map((event, index) => {
                        const Icon = ICON_MAP[event.icon] || Clock;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="flex flex-col items-center text-center p-8 rounded-lg bg-white shadow-md border border-primary/10 hover:shadow-lg hover:border-primary/30 transition-all duration-300"
                            >
                                <div className="w-16 h-16 mb-4 rounded-full flex items-center justify-center relative">
                                    <div 
                                        className="absolute inset-0 rounded-full"
                                        style={{ backgroundColor: 'var(--color-primary)', opacity: 0.15 }}
                                    />
                                    <Icon className="w-10 h-10 relative z-10" style={{ color: 'var(--color-primary)' }} strokeWidth={1.5} />
                                </div>
                                <div className="text-3xl font-thin mb-2" style={{ color: 'var(--color-primary)' }}>
                                    {event.time}
                                </div>
                                <div className="text-xl font-light text-gray-700">{event.title}</div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
