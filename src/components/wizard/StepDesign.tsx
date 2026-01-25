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

            {/* Selección de Plantilla / Layout */}
            <div className="space-y-4">
                <Label className="text-lg font-semibold">Elige una estructura</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Classic */}
                    <button
                        type="button"
                        onClick={() => setThemeConfig({ layout: 'classic' })}
                        className={`p-4 border rounded-lg hover:border-primary transition-all text-left ${themeConfig.layout === 'classic' ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : ''}`}
                    >
                        <div className="bg-white p-2 border mb-2 h-24 flex items-center justify-center rounded">
                            <div className="w-16 h-20 bg-slate-100 border flex items-center justify-center text-[10px] text-muted-foreground">Card</div>
                        </div>
                        <span className="font-semibold block">Clásico</span>
                        <span className="text-xs text-muted-foreground">Tarjeta centrada tradicional</span>
                    </button>

                    {/* Modern */}
                    <button
                        type="button"
                        onClick={() => setThemeConfig({ layout: 'modern' })}
                        className={`p-4 border rounded-lg hover:border-primary transition-all text-left ${themeConfig.layout === 'modern' ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : ''}`}
                    >
                        <div className="bg-white p-2 border mb-2 h-24 flex items-center justify-center rounded overflow-hidden">
                            <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center text-[10px] text-muted-foreground">
                                <span>Animado</span>
                            </div>
                        </div>
                        <span className="font-semibold block">Moderno</span>
                        <span className="text-xs text-muted-foreground">Animaciones y pantalla completa</span>
                    </button>

                    {/* Minimal */}
                    <button
                        type="button"
                        onClick={() => setThemeConfig({ layout: 'minimal' })}
                        className={`p-4 border rounded-lg hover:border-primary transition-all text-left ${themeConfig.layout === 'minimal' ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : ''}`}
                    >
                        <div className="bg-white p-2 border mb-2 h-24 flex items-center justify-center rounded">
                            <div className="space-y-1 text-center">
                                <div className="w-20 h-1 bg-slate-200 mx-auto"></div>
                                <div className="w-12 h-1 bg-slate-200 mx-auto"></div>
                            </div>
                        </div>
                        <span className="font-semibold block">Minimalista</span>
                        <span className="text-xs text-muted-foreground">Enfoque en tipografía</span>
                    </button>

                    {/* Glass */}
                    <button
                        type="button"
                        onClick={() => setThemeConfig({ layout: 'glass' })}
                        className={`p-4 border rounded-lg hover:border-primary transition-all text-left ${themeConfig.layout === 'glass' ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : ''}`}
                    >
                        <div className="bg-slate-900 p-2 border mb-2 h-24 flex items-center justify-center rounded relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/50 to-blue-500/50"></div>
                            <div className="absolute inset-2 bg-white/10 backdrop-blur-md rounded border border-white/20 flex items-center justify-center">
                                <span className="text-[10px] text-white font-medium">Glass</span>
                            </div>
                        </div>
                        <span className="font-semibold block">Glass</span>
                        <span className="text-xs text-muted-foreground">Efecto cristal translúcido</span>
                    </button>

                    {/* Parallax */}
                    <button
                        type="button"
                        onClick={() => setThemeConfig({ layout: 'parallax' })}
                        className={`p-4 border rounded-lg hover:border-primary transition-all text-left ${themeConfig.layout === 'parallax' ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : ''}`}
                    >
                        <div className="bg-white p-2 border mb-2 h-24 flex items-center justify-center rounded overflow-hidden relative">
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=200&auto=format&fit=crop')] bg-cover bg-center opacity-50"></div>
                            <div className="relative z-10 bg-white/80 px-2 py-1 rounded shadow-sm text-[8px]">SCROLL</div>
                        </div>
                        <span className="font-semibold block">Parallax</span>
                        <span className="text-xs text-muted-foreground">Profundidad al hacer scroll</span>
                    </button>
                </div>
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
