"use client";

import { motion } from "framer-motion";
import { Calendar, MapPin, Clock, Music, Utensils } from "lucide-react";
import { FloralDivider } from "../decorations/Dividers";

interface TimelineEvent {
    id: string;
    title: string;
    time: string;
    location?: string;
    description?: string;
    icon?: 'ceremony' | 'reception' | 'party' | 'dinner';
}

interface EventTimelineProps {
    events: TimelineEvent[];
    colorPrimary?: string;
}

const iconMap = {
    ceremony: Calendar,
    reception: Utensils,
    party: Music,
    dinner: Utensils,
};

export function EventTimeline({ events, colorPrimary }: EventTimelineProps) {
    if (!events || events.length === 0) return null;

    return (
        <div className="py-16 md:py-24" style={{ backgroundColor: 'var(--color-background)' }}>
            <div className="container px-6 mx-auto max-w-4xl">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <span
                        className="text-xs tracking-[0.25em] block mb-3"
                        style={{ color: 'var(--color-text-secondary)', fontFamily: "'Montserrat', sans-serif" }}
                    >
                        Programa
                    </span>
                    <h2
                        className="text-4xl md:text-5xl mb-6"
                        style={{ color: 'var(--color-primary)', fontFamily: "'Parisienne', cursive" }}
                    >
                        Cronograma del Evento
                    </h2>
                    <div className="flex justify-center mb-6">
                        <FloralDivider className="text-primary/30" style="elegant" />
                    </div>
                </motion.div>

                {/* Timeline */}
                <div className="relative">
                    {/* Vertical Line */}
                    <div 
                        className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2"
                        style={{ backgroundColor: 'var(--color-primary)', opacity: 0.2 }}
                    />

                    {/* Events */}
                    <div className="space-y-12 md:space-y-16">
                        {events.map((event, index) => {
                            const Icon = iconMap[event.icon || 'ceremony'];
                            const isEven = index % 2 === 0;

                            return (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.2 }}
                                    className={`relative flex items-center ${
                                        isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                                    } flex-row`}
                                >
                                    {/* Content Card */}
                                    <div className={`flex-1 ${isEven ? 'md:pr-12 pl-16' : 'md:pl-12 pl-16'}`}>
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div 
                                                    className="p-3 rounded-full"
                                                    style={{ backgroundColor: 'var(--color-primary)', opacity: 0.1 }}
                                                >
                                                    <Icon 
                                                        className="w-6 h-6" 
                                                        style={{ color: 'var(--color-primary)' }}
                                                    />
                                                </div>
                                                
                                                <div className="flex-1">
                                                    <h3 
                                                        className="text-2xl md:text-3xl mb-2"
                                                        style={{ fontFamily: "'Parisienne', cursive", color: 'var(--color-primary)' }}
                                                    >
                                                        {event.title}
                                                    </h3>
                                                    
                                                    <div className="flex items-center gap-2 mb-3 text-gray-600">
                                                        <Clock className="w-4 h-4" />
                                                        <span className="font-medium">{event.time}</span>
                                                    </div>

                                                    {event.location && (
                                                        <div className="flex items-center gap-2 mb-3 text-gray-600">
                                                            <MapPin className="w-4 h-4" />
                                                            <span>{event.location}</span>
                                                        </div>
                                                    )}

                                                    {event.description && (
                                                        <p className="text-gray-500 text-sm mt-2">
                                                            {event.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>

                                    {/* Center Dot */}
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        whileInView={{ scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.2 + 0.3 }}
                                        className="absolute left-8 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-4 border-white shadow-lg z-10"
                                        style={{ backgroundColor: 'var(--color-primary)' }}
                                    />
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
