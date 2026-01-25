"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { MapPin, Calendar, Clock, Music } from "lucide-react";
import { InvitationTemplateProps } from "./types";

export function ModernTemplate({ data, themeConfig }: InvitationTemplateProps) {
    const { primaryColor, backgroundColor, textDark } = themeConfig;

    return (
        <div
            className="min-h-screen w-full overflow-hidden relative flex flex-col items-center justify-center p-6"
            style={{ backgroundColor: backgroundColor }}
        >
            {/* Background Decor */}
            <div
                className="absolute top-0 left-0 w-full h-64 opacity-10 rounded-b-[50%]"
                style={{ backgroundColor: primaryColor }}
            />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="z-10 text-center space-y-8 w-full max-w-lg"
            >
                <header className="space-y-4">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-block px-4 py-1 rounded-full text-sm font-medium uppercase tracking-wider"
                        style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                    >
                        {data.type === 'CASAMIENTO' ? 'Nuestra Boda' :
                            data.type === 'QUINCE_ANOS' ? 'Mis 15 Años' : 'Estás Invitado'}
                    </motion.div>

                    <h1
                        className="text-5xl md:text-6xl font-serif font-bold leading-tight"
                        style={{ color: textDark }}
                    >
                        {data.nombreEvento}
                    </h1>

                    <p className="text-xl md:text-2xl font-light text-muted-foreground">
                        {data.type === 'CASAMIENTO' && `${data.nombreNovia} & ${data.nombreNovio}`}
                        {data.type === 'QUINCE_ANOS' && data.nombreQuinceanera}
                    </p>
                </header>

                <div
                    className="grid gap-6 p-8 rounded-2xl shadow-xl backdrop-blur-sm bg-white/50 border border-white/20"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-white shadow-sm">
                            <Calendar className="w-6 h-6" style={{ color: primaryColor }} />
                        </div>
                        <div className="text-left">
                            <p className="text-sm text-muted-foreground uppercase tracking-wide">Cuándo</p>
                            <p className="font-semibold text-lg" style={{ color: textDark }}>
                                {data.fecha ? format(new Date(data.fecha), "PPPP", { locale: es }) : "Fecha por definir"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-white shadow-sm">
                            <Clock className="w-6 h-6" style={{ color: primaryColor }} />
                        </div>
                        <div className="text-left">
                            <p className="text-sm text-muted-foreground uppercase tracking-wide">Hora</p>
                            <p className="font-semibold text-lg" style={{ color: textDark }}>
                                {data.hora || "Hora por definir"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-white shadow-sm">
                            <MapPin className="w-6 h-6" style={{ color: primaryColor }} />
                        </div>
                        <div className="text-left">
                            <p className="text-sm text-muted-foreground uppercase tracking-wide">Dónde</p>
                            <p className="font-semibold text-lg" style={{ color: textDark }}>
                                {data.lugarNombre}
                            </p>
                            <p className="text-sm text-muted-foreground">{data.direccion}</p>
                        </div>
                    </div>
                </div>

                {data.musicaHabilitada && (
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-md cursor-pointer"
                    >
                        <Music className="w-4 h-4" style={{ color: primaryColor }} />
                        <span className="text-sm font-medium">Reproducir música</span>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
