"use client";

import { useState } from "react";
import { useWizardStore } from "@/store/wizard-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, MapPin, Calendar, Clock, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ClassicTemplate } from "../templates/ClassicTemplate";
import { ModernTemplate } from "../templates/ModernTemplate";
import { MinimalTemplate } from "../templates/MinimalTemplate";
import { GlassTemplate } from "../templates/GlassTemplate";
import { ParallaxTemplate } from "../templates/ParallaxTemplate";

export function StepPreview() {
    const { data, themeConfig, prevStep } = useWizardStore();
    const [isCreating, setIsCreating] = useState(false);

    const handleCreate = async () => {
        setIsCreating(true);
        try {
            // Include themeConfig in the data sent to the server
            const payload = {
                ...data,
                ...themeConfig, // This overwrites design fields in data if they overlap, or adds new ones
            };

            console.log('Datos enviados:', payload);
            const response = await fetch('/api/invitations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
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

    // Cast data to InvitationFormData for the templates
    // In a real app we might want to validate here
    const formData = data as any;

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold">¡Todo listo!</h2>
                <p className="text-muted-foreground">Revisá los datos antes de crear tu invitación.</p>
            </div>

            <div className="border rounded-xl overflow-hidden shadow-sm bg-slate-100 min-h-[600px] flex items-center justify-center relative">
                <div className="absolute inset-0 overflow-auto">
                    {/* Render selected template */}
                    {themeConfig.layout === 'classic' && <ClassicTemplate data={formData} themeConfig={themeConfig} />}
                    {themeConfig.layout === 'modern' && <ModernTemplate data={formData} themeConfig={themeConfig} />}
                    {themeConfig.layout === 'minimal' && <MinimalTemplate data={formData} themeConfig={themeConfig} />}
                    {themeConfig.layout === 'glass' && <GlassTemplate data={formData} themeConfig={themeConfig} />}
                    {themeConfig.layout === 'parallax' && <ParallaxTemplate data={formData} themeConfig={themeConfig} />}
                </div>
            </div>

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
