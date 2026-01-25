"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, MapPin, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { InvitationTemplateProps } from "./types";

export function ClassicTemplate({ data, themeConfig }: InvitationTemplateProps) {
    // Generate CSS variables for this specific instance if needed, 
    // or rely on parent container variables. 
    // For now, we rely on parent setting variables or inline styles where critical.

    const { primaryColor } = themeConfig;

    return (
        <Card className="bg-slate-50 border-primary/20 overflow-hidden max-w-md mx-auto shadow-lg">
            <div
                className="h-2 bg-gradient-to-r from-primary to-purple-600"
                style={{ backgroundColor: primaryColor }}
            />
            <CardHeader className="text-center pb-2">
                <div className="mx-auto bg-white p-3 rounded-full shadow-sm mb-4 w-16 h-16 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-primary" style={{ color: primaryColor }} />
                </div>
                <CardTitle className="text-3xl font-serif text-primary" style={{ color: primaryColor }}>
                    {data.nombreEvento}
                </CardTitle>
                <p className="text-lg text-muted-foreground font-medium">
                    {data.type === 'CASAMIENTO' && `${data.nombreNovia} & ${data.nombreNovio}`}
                    {data.type === 'QUINCE_ANOS' && data.nombreQuinceanera}
                    {data.type !== 'CASAMIENTO' && data.type !== 'QUINCE_ANOS' && "¡Te invitamos!"}
                </p>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
                <div className="grid grid-cols-1 gap-4 text-center md:text-left">
                    <div className="flex flex-col items-center md:items-start p-4 bg-white rounded-lg shadow-sm">
                        <Calendar className="w-6 h-6 text-primary mb-2" style={{ color: primaryColor }} />
                        <span className="font-semibold text-lg">Fecha</span>
                        <span>{data.fecha ? format(new Date(data.fecha), "PPP", { locale: es }) : "No definida"}</span>
                    </div>

                    <div className="flex flex-col items-center md:items-start p-4 bg-white rounded-lg shadow-sm">
                        <Clock className="w-6 h-6 text-primary mb-2" style={{ color: primaryColor }} />
                        <span className="font-semibold text-lg">Hora</span>
                        <span>{data.hora || "No definida"}</span>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-sm text-center">
                    <MapPin className="w-6 h-6 text-primary mb-2" style={{ color: primaryColor }} />
                    <span className="font-semibold text-lg">{data.lugarNombre}</span>
                    <span className="text-muted-foreground">{data.direccion}</span>
                </div>
            </CardContent>
        </Card>
    );
}
