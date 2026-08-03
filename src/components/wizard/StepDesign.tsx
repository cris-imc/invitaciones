"use client";
import { useState } from "react";
import { useWizardStore } from "@/store/wizard-store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { AVAILABLE_TEMPLATES, MODERNO_COLORS } from "@/lib/theme-config";
import { TemplateSelector } from "@/components/dashboard/TemplateSelector";
import { SaveStepButtons } from "./SaveStepButtons";
import { saveInvitationFromWizard } from "@/lib/save-invitation";



export function StepDesign() {
    const { data, setData, setThemeConfig, themeConfig, usePremiumCredit } = useWizardStore();
    const [isCreating, setIsCreating] = useState(false);
    const selectedTemplate = data.templateTipo || "ORIGINAL";

    const handleTemplateSelect = (templateId: string) => {
        setData({ templateTipo: templateId });

        const template = AVAILABLE_TEMPLATES.find(t => t.id === templateId);
        if (template?.layoutId) {
            // @ts-ignore - Valid layout id check implied
            setThemeConfig({ layout: template.layoutId as any });
        }
    };

    const handleCreate = async () => {
        setIsCreating(true);
        try {
            const invitation = await saveInvitationFromWizard(data, themeConfig, usePremiumCredit);
            window.location.href = `/dashboard/invitaciones/${invitation.slug}/guests`;
        } catch (error) {
            console.error('Error creating invitation:', error);
            alert(`Error al crear la invitación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
            setIsCreating(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Diseño y Colores</h2>
                <p className="text-muted-foreground">
                    {['CASAMIENTO', 'QUINCE_ANOS'].includes(data.type ?? '') 
                        ? 'Elige el estilo de tu invitación y la gama de colores'
                        : 'Elige el estilo que mejor represente tu evento'}
                </p>
            </div>

            {['CASAMIENTO', 'QUINCE_ANOS'].includes(data.type ?? '') ? (
                <div className="space-y-6">
                    <div className="space-y-3">
                        <Label className="text-base font-semibold">1. Elige el Estilo</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <div 
                                onClick={() => setData({ templateTipo: 'ELEGANT' })}
                                className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-3 transition-all ${
                                    (!data.templateTipo || data.templateTipo === 'ELEGANT' || data.templateTipo === 'ORIGINAL')
                                        ? 'border-primary bg-primary/5 shadow-sm' 
                                        : 'border-border hover:border-primary/50'
                                }`}
                            >
                                <div className="w-full h-12 rounded bg-white shadow-sm border border-slate-200" />
                                <span className="text-sm font-bold text-center">Elegante (Clásico)</span>
                            </div>
                            <div 
                                onClick={() => setData({ templateTipo: 'MODERNO' })}
                                className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-3 transition-all ${
                                    data.templateTipo === 'MODERNO'
                                        ? 'border-primary bg-primary/5 shadow-sm' 
                                        : 'border-border hover:border-primary/50'
                                }`}
                            >
                                <div className="w-full h-12 rounded bg-[#0F0E13] shadow-sm border border-slate-800" />
                                <span className="text-sm font-bold text-center">Moderno (Oscuro)</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-base font-semibold">2. Elige la Gama de Colores</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {data.templateTipo === 'MODERNO' ? (
                                MODERNO_COLORS.map((gamut) => (
                                    <div 
                                        key={gamut.id}
                                        onClick={() => setData({ colorPrincipal: gamut.id })}
                                        className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-3 transition-all ${
                                            data?.colorPrincipal === gamut.id || (!data?.colorPrincipal && gamut.id === 'Azul')
                                                ? 'border-primary bg-primary/5 shadow-sm' 
                                                : 'border-border hover:border-primary/50'
                                        }`}
                                    >
                                        <div className="w-12 h-12 rounded-full shadow-sm ring-2 ring-slate-800 ring-offset-2" style={{ backgroundColor: gamut.color }} />
                                        <span className="text-sm font-medium text-center">{gamut.name}</span>
                                    </div>
                                ))
                            ) : (
                                [
                                    { id: 'default', name: 'Dorados (Original)', color: '#C79A4B' },
                                    { id: 'Green', name: 'Verdes', color: '#5C8A7A' },
                                    { id: 'Red', name: 'Rojos', color: '#8A4A54' },
                                    { id: 'Blue', name: 'Azules', color: '#52718A' },
                                    { id: 'Orange', name: 'Naranjas', color: '#B86A4C' },
                                    { id: 'Violet', name: 'Violetas', color: '#7B6282' },
                                    { id: 'Gray', name: 'Grises', color: '#70767B' },
                                    { id: 'DarkYellow', name: 'Amarillo Oscuro', color: '#B8964C' },
                                    { id: 'Pink', name: 'Rosas', color: '#A87082' }
                                ].map((gamut) => (
                                    <div 
                                        key={gamut.id}
                                        onClick={() => setData({ colorPrincipal: gamut.id })}
                                        className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-3 transition-all ${
                                            data?.colorPrincipal === gamut.id || (!data?.colorPrincipal && gamut.id === 'default')
                                                ? 'border-primary bg-primary/5 shadow-sm' 
                                                : 'border-border hover:border-primary/50'
                                        }`}
                                    >
                                        <div className="w-12 h-12 rounded-full shadow-sm" style={{ backgroundColor: gamut.color }} />
                                        <span className="text-sm font-medium text-center">{gamut.name}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <TemplateSelector 
                        value={selectedTemplate} 
                        onChange={handleTemplateSelect}
                        eventType={data.type}
                    />

                    {selectedTemplate === "PARALLAX" && (
                        <div className="space-y-2 border-l-4 border-primary pl-4 py-2 bg-primary/5 rounded-r-lg">
                            <Label htmlFor="imagenCelebremosJuntos">
                                Imagen "Celebremos Juntos"
                                <span className="text-xs text-muted-foreground ml-2">(Solo para Parallax)</span>
                            </Label>
                            <ImageUploader
                                currentImage={data.imagenCelebremosJuntos}
                                onImageUploaded={(url: string) => setData({ imagenCelebremosJuntos: url })}
                                aspectRatio={3 / 4}
                            />
                            <p className="text-xs text-muted-foreground">
                                Esta imagen aparecerá en la mitad derecha de la pantalla con efecto parallax.
                            </p>
                        </div>
                    )}
                </>
            )}

            <SaveStepButtons isLastStep={true} onCreate={handleCreate} isCreating={isCreating} />
        </div>
    );
}
