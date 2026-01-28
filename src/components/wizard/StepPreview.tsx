"use client";

import { useState } from "react";
import { useWizardStore } from "@/store/wizard-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, MapPin, Calendar, Clock, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { LuxuryMinimalistTemplate } from "../templates/LuxuryMinimalistTemplate";
import { BotanicalGardenTemplate } from "../templates/BotanicalGardenTemplate";
import { GoldenLuxuryTemplate } from "../templates/GoldenLuxuryTemplate";
import { NeonNightTemplate } from "../templates/NeonNightTemplate";
import { ModernBentoTemplate } from "../templates/ModernBentoTemplate";
import { LiquidCrystalTemplate } from "../templates/LiquidCrystalTemplate";
import { ModernInvitationTemplate } from "../templates/ModernInvitationTemplate";
import { VintageEleganceTemplate } from "../templates/VintageEleganceTemplate";
import { AuroraDreamyTemplate } from "../templates/AuroraDreamyTemplate";
import { DiscoNightTemplate } from "../templates/DiscoNightTemplate";
import { KidsPartyTemplate } from "../templates/KidsPartyTemplate";
import { BabyBaptismTemplate } from "../templates/BabyBaptismTemplate";

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

                // Explicitly ensure objects are passed (some frameworks strip undefineds/partials weirdly)
                portadaHabilitada: data.portadaHabilitada,
                galeriaPrincipalHabilitada: data.galeriaPrincipalHabilitada,
                galeriaPrincipalFotos: data.galeriaPrincipalFotos,
                galeriaSecundariaHabilitada: data.galeriaSecundariaHabilitada,
                galeriaSecundariaFotos: data.galeriaSecundariaFotos,

                musicaHabilitada: data.musicaHabilitada,
                triviaHabilitada: data.triviaHabilitada,
                triviaPreguntas: data.triviaPreguntas,
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
                    {/* Render preview based on layout */}
                    {(themeConfig.layout === 'classic' || themeConfig.layout === 'modern') && (
                        <div 
                            className="min-h-screen flex items-center justify-center p-8"
                            style={{
                                backgroundColor: themeConfig.backgroundColor || '#ffffff',
                                fontFamily: themeConfig.fontFamily || 'Poppins, sans-serif',
                            }}
                        >
                            <div className="max-w-2xl w-full text-center space-y-6">
                                <h1 
                                    className="text-5xl font-bold"
                                    style={{ color: themeConfig.primaryColor || '#d4af37' }}
                                >
                                    {formData.nombreEvento}
                                </h1>
                                {formData.eventDate && (
                                    <p className="text-xl" style={{ color: themeConfig.textSecondary || '#666' }}>
                                        {new Date(formData.eventDate).toLocaleDateString('es-ES', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                )}
                                {formData.location && (
                                    <p className="text-lg" style={{ color: themeConfig.textDark || '#1a1a1a' }}>
                                        📍 {formData.location}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                    {themeConfig.layout === 'luxury' && <LuxuryMinimalistTemplate data={formData} themeConfig={themeConfig} />}
                    {themeConfig.layout === 'botanical' && <BotanicalGardenTemplate data={formData} themeConfig={themeConfig} />}
                    {themeConfig.layout === 'golden' && <GoldenLuxuryTemplate data={formData} themeConfig={themeConfig} />}
                    {themeConfig.layout === 'neon' && <NeonNightTemplate data={formData} themeConfig={themeConfig} />}
                    {themeConfig.layout === 'bento' && <ModernBentoTemplate data={formData} themeConfig={themeConfig} />}
                    {themeConfig.layout === 'liquid' && <LiquidCrystalTemplate data={formData} themeConfig={themeConfig} />}
                    {themeConfig.layout === 'vintage' && <VintageEleganceTemplate data={formData} themeConfig={themeConfig} />}
                    {themeConfig.layout === 'aurora' && <AuroraDreamyTemplate data={formData} themeConfig={themeConfig} />}
                    {themeConfig.layout === 'disco' && <DiscoNightTemplate data={formData} themeConfig={themeConfig} />}
                    {themeConfig.layout === 'kidsparty' && <KidsPartyTemplate data={formData} themeConfig={themeConfig} />}
                    {themeConfig.layout === 'baby' && <BabyBaptismTemplate data={formData} themeConfig={themeConfig} />}
                    {themeConfig.layout === 'parallax' && (
                        <div className="min-h-screen p-8" style={{ background: `linear-gradient(135deg, ${themeConfig.primaryColor}20, ${themeConfig.backgroundColor})` }}>
                            <div className="max-w-4xl mx-auto text-center">
                                <h1 className="text-6xl font-bold mb-4" style={{ color: themeConfig.primaryColor }}>
                                    {formData.nombreEvento}
                                </h1>
                            </div>
                        </div>
                    )}
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
