"use client";

import { useWizardStore } from "@/store/wizard-store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { COLOR_TEMPLATES, FONT_FAMILIES, ColorTemplateId, FontFamilyId } from "@/lib/theme-config";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

export function StepDesign() {
    const { themeConfig, setThemeConfig, nextStep, prevStep } = useWizardStore();
    const [showAdvanced, setShowAdvanced] = useState(false);

    const handleTemplateSelect = (templateId: ColorTemplateId) => {
        const template = COLOR_TEMPLATES[templateId];
        setThemeConfig({
            colorTemplate: templateId,
            primaryColor: template.primaryColor,
            backgroundColor: template.backgroundColor,
            textDark: template.textDark,
            textLight: template.textLight,
            textSecondary: template.textSecondary,
        });
    };

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Diseño y Estilo</h2>
                <p className="text-muted-foreground">
                    Personaliza los colores y tipografía de tu invitación
                </p>
            </div>

            {/* Paleta de Colores */}
            <div className="space-y-4">
                <Label className="text-lg font-semibold">Selecciona una Paleta de Colores</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.values(COLOR_TEMPLATES).map((template) => (
                        <button
                            key={template.id}
                            type="button"
                            onClick={() => handleTemplateSelect(template.id as ColorTemplateId)}
                            className={`
                                flex flex-col items-center gap-2 p-4 rounded-lg transition-all
                                ${themeConfig.colorTemplate === template.id 
                                    ? 'bg-primary/5' 
                                    : 'hover:bg-primary/5'
                                }
                            `}
                        >
                            <div 
                                className="w-12 h-12 rounded-full shadow-md"
                                style={{ backgroundColor: template.primaryColor }}
                            />
                            <span className="text-sm font-medium text-center">
                                {template.name}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Color Personalizado */}
            <div className="space-y-2">
                <Label htmlFor="customColor">O elige un color personalizado</Label>
                <div className="flex gap-2 items-center">
                    <Input
                        id="customColor"
                        type="color"
                        value={themeConfig.primaryColor}
                        onChange={(e) => setThemeConfig({ 
                            colorTemplate: 'rosa-salmon',  // Reset template
                            primaryColor: e.target.value 
                        })}
                        className="w-20 h-12 cursor-pointer"
                    />
                    <Input
                        type="text"
                        value={themeConfig.primaryColor}
                        onChange={(e) => setThemeConfig({ 
                            colorTemplate: 'rosa-salmon',
                            primaryColor: e.target.value 
                        })}
                        placeholder="#c7757f"
                        className="flex-1"
                    />
                </div>
            </div>

            {/* Tipografía */}
            <div className="space-y-2">
                <Label htmlFor="fontFamily">Fuente Principal</Label>
                <select
                    id="fontFamily"
                    value={themeConfig.fontFamily}
                    onChange={(e) => setThemeConfig({ fontFamily: e.target.value as FontFamilyId })}
                    className="w-full p-2 rounded-md"
                >
                    {Object.values(FONT_FAMILIES).map((font) => (
                        <option key={font.id} value={font.id}>
                            {font.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Opciones Avanzadas */}
            <div className="pt-4">
                <div className="flex items-center space-x-2 mb-4">
                    <Checkbox
                        id="showAdvanced"
                        checked={showAdvanced}
                        onCheckedChange={(checked) => setShowAdvanced(Boolean(checked))}
                    />
                    <Label htmlFor="showAdvanced" className="cursor-pointer">
                        Mostrar opciones avanzadas
                    </Label>
                </div>

                {showAdvanced && (
                    <div className="space-y-4 pl-6">
                        {/* Escala de Fuente */}
                        <div className="space-y-2">
                            <Label htmlFor="fontScale">
                                Tamaño de Texto: {themeConfig.fontScale.toFixed(1)}x
                            </Label>
                            <input
                                id="fontScale"
                                type="range"
                                min="0.8"
                                max="1.2"
                                step="0.1"
                                value={themeConfig.fontScale}
                                onChange={(e) => setThemeConfig({ fontScale: parseFloat(e.target.value) })}
                                className="w-full"
                            />
                        </div>

                        {/* Espaciado entre Secciones */}
                        <div className="space-y-2">
                            <Label htmlFor="sectionSpacing">
                                Espaciado entre Secciones: {themeConfig.sectionSpacing}px
                            </Label>
                            <input
                                id="sectionSpacing"
                                type="range"
                                min="40"
                                max="160"
                                step="20"
                                value={themeConfig.sectionSpacing}
                                onChange={(e) => setThemeConfig({ sectionSpacing: parseInt(e.target.value) })}
                                className="w-full"
                            />
                        </div>

                        {/* Padding Interno */}
                        <div className="space-y-2">
                            <Label htmlFor="sectionPadding">
                                Margen Interno: {themeConfig.sectionPadding}px
                            </Label>
                            <input
                                id="sectionPadding"
                                type="range"
                                min="20"
                                max="80"
                                step="10"
                                value={themeConfig.sectionPadding}
                                onChange={(e) => setThemeConfig({ sectionPadding: parseInt(e.target.value) })}
                                className="w-full"
                            />
                        </div>

                        {/* Letter Spacing */}
                        <div className="space-y-2">
                            <Label htmlFor="letterSpacing">Espaciado de Letras</Label>
                            <select
                                id="letterSpacing"
                                value={themeConfig.letterSpacing}
                                onChange={(e) => setThemeConfig({ letterSpacing: e.target.value as any })}
                                className="w-full p-2 rounded-md"
                            >
                                <option value="tight">Compacto</option>
                                <option value="normal">Normal</option>
                                <option value="wide">Amplio</option>
                                <option value="wider">Muy Amplio</option>
                            </select>
                        </div>

                        {/* Line Height */}
                        <div className="space-y-2">
                            <Label htmlFor="lineHeight">Interlineado</Label>
                            <select
                                id="lineHeight"
                                value={themeConfig.lineHeight}
                                onChange={(e) => setThemeConfig({ lineHeight: e.target.value as any })}
                                className="w-full p-2 rounded-md"
                            >
                                <option value="tight">Compacto</option>
                                <option value="normal">Normal</option>
                                <option value="relaxed">Relajado</option>
                                <option value="loose">Amplio</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-between pt-6">
                <Button type="button" variant="outline" onClick={prevStep}>
                    Anterior
                </Button>
                <Button onClick={nextStep}>
                    Siguiente
                </Button>
            </div>
        </div>
    );
}
