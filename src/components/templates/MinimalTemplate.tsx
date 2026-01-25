"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { InvitationTemplateProps } from "./types";

export function MinimalTemplate({ data, themeConfig }: InvitationTemplateProps) {
    const { primaryColor, textDark } = themeConfig;

    return (
        <div className="max-w-xl mx-auto py-12 px-6 text-center space-y-12 bg-white min-h-screen flex flex-col justify-center">
            <div className="space-y-2">
                <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
                    {data.type === 'CASAMIENTO' ? 'Save The Date' : 'Invitación'}
                </p>
                <div
                    className="w-12 h-0.5 mx-auto"
                    style={{ backgroundColor: primaryColor }}
                />
            </div>

            <div className="space-y-6">
                <h1 className="text-6xl md:text-7xl font-light tracking-tight" style={{ color: textDark }}>
                    {data.nombreEvento}
                </h1>

                <p className="text-2xl font-light italic text-muted-foreground">
                    {data.type === 'CASAMIENTO' && `${data.nombreNovia} & ${data.nombreNovio}`}
                    {data.type === 'QUINCE_ANOS' && data.nombreQuinceanera}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12 border-y border-gray-100">
                <div className="space-y-2">
                    <span className="block text-sm uppercase tracking-widest text-muted-foreground">Día</span>
                    <span className="block text-xl font-medium" style={{ color: primaryColor }}>
                        {data.fecha ? format(new Date(data.fecha), "d", { locale: es }) : "--"}
                    </span>
                </div>
                <div className="space-y-2">
                    <span className="block text-sm uppercase tracking-widest text-muted-foreground">Mes</span>
                    <span className="block text-xl font-medium" style={{ color: primaryColor }}>
                        {data.fecha ? format(new Date(data.fecha), "MMMM", { locale: es }) : "--"}
                    </span>
                </div>
                <div className="space-y-2">
                    <span className="block text-sm uppercase tracking-widest text-muted-foreground">Año</span>
                    <span className="block text-xl font-medium" style={{ color: primaryColor }}>
                        {data.fecha ? format(new Date(data.fecha), "yyyy", { locale: es }) : "--"}
                    </span>
                </div>
            </div>

            <div className="space-y-2">
                <p className="text-lg font-medium" style={{ color: textDark }}>{data.lugarNombre}</p>
                <p className="text-muted-foreground">{data.direccion}</p>
                <p className="text-muted-foreground">{data.hora} hs</p>
            </div>

            <button
                className="px-8 py-3 bg-black text-white text-sm uppercase tracking-widest hover:bg-gray-800 transition-colors"
                style={{ backgroundColor: textDark }}
            >
                Confirmar Asistencia
            </button>
        </div>
    );
}
