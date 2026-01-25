"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useRef } from "react";
import { InvitationTemplateProps } from "./types";

export function ParallaxTemplate({ data, themeConfig }: InvitationTemplateProps) {
    const { primaryColor, textDark } = themeConfig;
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const yBackground = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const yText = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]);

    return (
        <div
            ref={containerRef}
            className="h-full w-full overflow-y-auto overflow-x-hidden relative bg-white"
            style={{ perspective: "10px" }} // CSS Parallax base
        >
            {/* Hero Section with Parallax */}
            <div className="relative h-screen flex items-center justify-center overflow-hidden"
                style={{ transformStyle: "preserve-3d", zIndex: -1 }}>

                {/* Background Image Layer - Furthest away */}
                <motion.div
                    className="absolute inset-0 z-0"
                    style={{
                        y: yBackground,
                        backgroundImage: `url(https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop)`, // Placeholder reliable image
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        scale: 1.2
                    }}
                />

                {/* Overlay Layer */}
                <div className="absolute inset-0 bg-black/40 z-10" />

                {/* Content Layer - Moves faster */}
                <motion.div
                    className="relative z-20 text-center text-white p-6"
                    style={{ y: yText }}
                >
                    <p className="text-sm uppercase tracking-[0.5em] mb-4 font-light">
                        {data.type === 'CASAMIENTO' ? 'Celebramos nuestra boda' : 'Estás invitado'}
                    </p>
                    <h1 className="text-6xl md:text-8xl font-serif mb-6 drop-shadow-lg">
                        {data.type !== 'QUINCE_ANOS' && data.nombreEvento}
                        {data.type === 'QUINCE_ANOS' && data.nombreQuinceanera}
                    </h1>
                    {data.type === 'CASAMIENTO' && (
                        <p className="text-2xl font-light italic">
                            {data.nombreNovia} & {data.nombreNovio}
                        </p>
                    )}
                </motion.div>
            </div>

            {/* Content Section - Sits on top */}
            <div className="relative z-30 bg-white shadow-2xl min-h-screen -mt-20 rounded-t-[3rem] px-6 py-20">
                <div className="max-w-2xl mx-auto text-center space-y-16">

                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="inline-block w-12 h-1 bg-gray-900 mb-8" style={{ backgroundColor: primaryColor }} />
                        <h2 className="text-3xl font-serif mb-6 text-gray-900">Detalles del Evento</h2>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            Acompáñanos en este día tan especial para nosotros. Queremos compartir contigo nuestra alegría y celebrar juntos este nuevo capítulo.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="p-8 border border-gray-100 rounded-2xl shadow-sm bg-gray-50/50"
                        >
                            <h3 className="text-xl font-bold mb-2 text-gray-900 uppercase tracking-wide">Cuándo</h3>
                            <p className="text-4xl font-serif my-4" style={{ color: primaryColor }}>
                                {data.fecha ? format(new Date(data.fecha), "d", { locale: es }) : "01"}
                            </p>
                            <p className="text-gray-600 uppercase">
                                {data.fecha ? format(new Date(data.fecha), "MMMM yyyy", { locale: es }) : "Enero 2026"}
                            </p>
                            <p className="text-gray-900 font-medium mt-2">
                                {data.hora || "20:00 hs"}
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                            className="p-8 border border-gray-100 rounded-2xl shadow-sm bg-gray-50/50"
                        >
                            <h3 className="text-xl font-bold mb-2 text-gray-900 uppercase tracking-wide">Dónde</h3>
                            <div className="h-12 flex items-center justify-center mb-2">
                                {/* Icon placeholder */}
                                <div className="w-8 h-8 rounded-full border-2 border-current" style={{ borderColor: primaryColor }} />
                            </div>
                            <p className="text-xl font-serif mb-2" style={{ color: textDark }}>
                                {data.lugarNombre}
                            </p>
                            <p className="text-gray-600 text-sm px-4">
                                {data.direccion}
                            </p>
                        </motion.div>
                    </div>

                    <button
                        className="px-10 py-4 bg-gray-900 text-white text-sm uppercase tracking-widest hover:bg-gray-800 transition-all rounded-full"
                        style={{ backgroundColor: textDark }}
                    >
                        Confirmar Asistencia
                    </button>
                </div>
            </div>
        </div>
    );
}
