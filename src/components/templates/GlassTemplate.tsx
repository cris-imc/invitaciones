"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { MapPin, Calendar, Clock } from "lucide-react";
import { InvitationTemplateProps } from "./types";

export function GlassTemplate({ data, themeConfig }: InvitationTemplateProps) {
    const { primaryColor, textDark, textLight } = themeConfig;

    return (
        <div
            className="min-h-screen w-full relative flex flex-col items-center justify-center p-4 overflow-hidden"
            style={{
                background: `linear-gradient(135deg, #f6d365 0%, #fda085 100%)` // Fallback/Default gradient
            }}
        >
            {/* Background elements for depth */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-400/30 blur-[100px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/30 blur-[100px]" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-lg relative z-10"
            >
                {/* Glass Card */}
                <div
                    className="backdrop-blur-xl bg-white/20 border border-white/30 shadow-2xl rounded-3xl p-8 md:p-12 text-center"
                    style={{
                        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
                    }}
                >
                    <div className="space-y-8">
                        <div className="inline-block px-4 py-1.5 rounded-full border border-white/40 bg-white/10 backdrop-blur-md text-white font-medium text-sm tracking-widest uppercase">
                            {data.type === 'CASAMIENTO' ? 'Nuestra Boda' :
                                data.type === 'QUINCE_ANOS' ? 'Mis 15 Años' : 'Invitación'}
                        </div>

                        <h1
                            className="text-5xl md:text-6xl font-serif font-bold text-white drop-shadow-md"
                            style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}
                        >
                            {data.nombreEvento}
                        </h1>

                        <p className="text-xl text-white/90 font-light">
                            {data.type === 'CASAMIENTO' && `${data.nombreNovia} & ${data.nombreNovio}`}
                            {data.type === 'QUINCE_ANOS' && data.nombreQuinceanera}
                        </p>

                        <div className="w-16 h-px bg-white/40 mx-auto my-6" />

                        <div className="grid gap-6 text-white text-left">
                            <div className="flex items-center gap-4 bg-white/10 p-4 rounded-xl border border-white/10 hover:bg-white/20 transition-colors">
                                <Calendar className="w-6 h-6 shrink-0" />
                                <div>
                                    <p className="text-xs uppercase opacity-70 tracking-wider">Fecha</p>
                                    <p className="font-semibold text-lg">
                                        {data.fecha ? format(new Date(data.fecha), "PPP", { locale: es }) : "Por definir"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 bg-white/10 p-4 rounded-xl border border-white/10 hover:bg-white/20 transition-colors">
                                <Clock className="w-6 h-6 shrink-0" />
                                <div>
                                    <p className="text-xs uppercase opacity-70 tracking-wider">Hora</p>
                                    <p className="font-semibold text-lg">{data.hora || "--:--"}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 bg-white/10 p-4 rounded-xl border border-white/10 hover:bg-white/20 transition-colors">
                                <MapPin className="w-6 h-6 shrink-0" />
                                <div>
                                    <p className="text-xs uppercase opacity-70 tracking-wider">Lugar</p>
                                    <p className="font-semibold text-lg leading-tight">{data.lugarNombre}</p>
                                    <p className="text-sm opacity-80 mt-1">{data.direccion}</p>
                                </div>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-4 rounded-xl bg-white text-gray-900 font-bold shadow-lg mt-4 hover:shadow-xl transition-all"
                            style={{ color: primaryColor }}
                        >
                            Confirmar Asistencia
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
