"use client";

import { useState } from "react";
import { useWizardStore } from "@/store/wizard-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, MapPin, Calendar, Clock, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function StepPreview() {
    const { data, prevStep } = useWizardStore();
    const [isCreating, setIsCreating] = useState(false);

    const handleCreate = async () => {
        setIsCreating(true);
        try {
            console.log('Datos enviados:', data);
            const response = await fetch('/api/invitations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const responseData = await response.json();
            console.log('Respuesta de servidor:', responseData);

            if (!response.ok) {
                throw new Error(responseData.details || 'Error al crear invitación');
            }

            const invitation = responseData;

            // Redirigir a la invitación creada
            window.location.href = `/invitation/${invitation.slug}`;
        } catch (error) {
            console.error('Error creating invitation:', error);
            alert(`Error al crear la invitación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
            setIsCreating(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold">¡Todo listo!</h2>
                <p className="text-muted-foreground">Revisá los datos antes de crear tu invitación.</p>
            </div>

            <Card className="bg-slate-50 border-primary/20 overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-primary to-purple-600" style={{ backgroundColor: data.colorPrincipal }} />
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto bg-white p-3 rounded-full shadow-sm mb-4 w-16 h-16 flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-3xl font-serif text-primary">
                        {data.nombreEvento}
                    </CardTitle>
                    <p className="text-lg text-muted-foreground font-medium">
                        {data.type === 'CASAMIENTO' && `${data.nombreNovia} & ${data.nombreNovio}`}
                        {data.type === 'QUINCE_ANOS' && data.nombreQuinceanera}
                    </p>
                </CardHeader>
                <CardContent className="space-y-6 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center md:text-left">
                        <div className="flex flex-col items-center md:items-start p-4 bg-white rounded-lg shadow-sm">
                            <Calendar className="w-6 h-6 text-primary mb-2" />
                            <span className="font-semibold text-lg">Fecha</span>
                            <span>{data.fecha ? format(data.fecha, "PPP", { locale: es }) : "No definida"}</span>
                        </div>

                        <div className="flex flex-col items-center md:items-start p-4 bg-white rounded-lg shadow-sm">
                            <Clock className="w-6 h-6 text-primary mb-2" />
                            <span className="font-semibold text-lg">Hora</span>
                            <span>{data.hora || "No definida"}</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-sm text-center">
                        <MapPin className="w-6 h-6 text-primary mb-2" />
                        <span className="font-semibold text-lg">{data.lugarNombre}</span>
                        <span className="text-muted-foreground">{data.direccion}</span>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={prevStep} disabled={isCreating}>
                    Atrás
                </Button>
                <Button onClick={handleCreate} size="lg" className="px-8 gap-2" disabled={isCreating}>
                    {isCreating ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Creando...
                        </>
                    ) : (
                        'Crear Invitación'
                    )}
                </Button>
            </div>
        </div>
    );
}
