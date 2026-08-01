"use client";

import { useState } from "react";
import { useWizardStore } from "@/store/wizard-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SaveStepButtons } from "./SaveStepButtons";
import { Sparkles, Info, Smartphone, ChevronDown, ChevronUp } from "lucide-react";

export function StepCoverPage() {
    const { data, setData } = useWizardStore();
    const [showInfo, setShowInfo] = useState(false);

    const d = data as any;
    const portadaHabilitada = d.portadaHabilitada ?? true;
    const kicker = d.portadaKicker ?? "Con mucho cariño, para";
    const dressCode = d.portadaDressCode ?? "";
    const textoBoton = d.portadaTextoBoton || "Abrir invitación";

    // Computed display names for preview
    const nombreEvento = d.nombreEvento || (
        d.tipo === "CASAMIENTO"
            ? (d.nombreNovia && d.nombreNovio ? `${d.nombreNovia} & ${d.nombreNovio}` : "Nuestra Boda")
            : d.tipo === "QUINCE_ANOS"
                ? (d.nombreQuinceanera ? `Mis 15 - ${d.nombreQuinceanera}` : "Mis 15 Años")
                : "Nuestro Evento"
    );

    // Initial monogram for preview
    let monogram = "✦";
    if (d.tipo === "CASAMIENTO" && d.nombreNovia && d.nombreNovio) {
        monogram = `${d.nombreNovia[0]}&${d.nombreNovio[0]}`;
    } else if (d.nombreQuinceanera) {
        monogram = d.nombreQuinceanera[0]?.toUpperCase() || "15";
    }

    // Dynamic preset kickers per event type
    const presetsKicker = d.tipo === "CASAMIENTO"
        ? [
            "Con mucho cariño, para",
            "¡Te invitamos a nuestra boda!",
            "Estás invitado/a a nuestro casamiento",
            "Reservá la fecha para nuestra boda",
            "Especialmente preparado para",
          ]
        : d.tipo === "QUINCE_ANOS"
        ? [
            "Con mucho cariño, para",
            "¡Te invitamos a mis 15!",
            "Estás invitado/a a los 15 de",
            "Reservá la fecha para mis 15",
            "Especialmente preparado para",
          ]
        : [
            "Con mucho cariño, para",
            "¡Te invitamos a celebrar!",
            "Estás invitado/a a nuestra fiesta",
            "Reservá la fecha para celebrar con",
            "Especialmente preparado para",
          ];

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div>
                <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
                    <span>Portada de Bienvenida</span>
                    <Sparkles className="w-5 h-5 text-amber-500" />
                </h2>
                <p className="text-muted-foreground text-sm">
                    Personalizá la pantalla inicial (sobre virtual) que verán tus invitados al abrir su tarjeta.
                </p>
            </div>

            {/* Toggle Habilitado */}
            <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-md">
                <div className="space-y-0.5">
                    <Label className="text-base font-semibold">Mostrar Portada de Bienvenida</Label>
                    <p className="text-xs text-muted-foreground">
                        Activa una pantalla previa elegante antes de mostrar el contenido principal.
                    </p>
                </div>
                <Switch
                    checked={portadaHabilitada}
                    onCheckedChange={(val) => setData({ portadaHabilitada: val })}
                />
            </div>

            {portadaHabilitada && (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 xl:gap-14 items-start pt-2">
                    {/* FORMULARIO DE EDICIÓN */}
                    <div className="xl:col-span-7 space-y-7 xl:pr-6 xl:border-r border-slate-800/80">
                        {/* Caja informativa de Usabilidad (Collapsible - Minimizada por defecto) */}
                        <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs overflow-hidden transition-all duration-200 shadow-sm">
                            <button
                                type="button"
                                onClick={() => setShowInfo(!showInfo)}
                                className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-amber-500/15 transition-colors cursor-pointer"
                            >
                                <div className="flex items-center gap-2.5 font-semibold text-amber-300 text-sm">
                                    <Info className="w-4.5 h-4.5 shrink-0 text-amber-400" />
                                    <span>¿Cómo funciona la Portada con tus Invitados?</span>
                                </div>
                                <div className="text-amber-400 opacity-80 hover:opacity-100 transition-opacity shrink-0">
                                    {showInfo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </div>
                            </button>

                            {showInfo && (
                                <div className="px-4 pb-4 pt-1 border-t border-amber-500/20 text-[13px] leading-relaxed opacity-95 animate-in fade-in duration-200">
                                    Cuando le envíes a un invitado su enlace personalizado, el sistema colocará automáticamente su nombre (ej: <strong>&quot;Familia Pérez&quot;</strong>) debajo de este encabezado. Por eso, sugerimos frases que introduzcan al destinatario.
                                </div>
                            )}
                        </div>

                        {/* Campo Kicker */}
                        <div className="space-y-3.5">
                            <Label htmlFor="portadaKicker" className="font-semibold text-sm">
                                Encabezado / Frase de Portada
                            </Label>
                            <Input
                                id="portadaKicker"
                                className="bg-[var(--ink-2)] border border-white/20 text-[var(--on-ink)] h-12 rounded-xl text-sm"
                                placeholder="Ej: Con mucho cariño, para / ¡Te invitamos!"
                                value={d.portadaKicker || ""}
                                onChange={(e) => setData({ portadaKicker: e.target.value })}
                            />
                            
                            {/* Preset Buttons */}
                            <div className="space-y-2 pt-1">
                                <p className="text-xs text-muted-foreground font-medium">Sugerencias rápidas para tu evento (hacé clic para aplicar):</p>
                                <div className="flex flex-wrap gap-2">
                                    {presetsKicker.map((preset, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setData({ portadaKicker: preset })}
                                            className={`text-xs px-3 py-1.5 rounded-xl border transition-all duration-200 ${
                                                d.portadaKicker === preset
                                                    ? "bg-amber-500/25 border-amber-400 text-amber-200 font-semibold shadow-sm"
                                                    : "bg-white/5 border-white/10 hover:bg-white/10 text-slate-300"
                                            }`}
                                        >
                                            {preset}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Campo DressCode */}
                        <div className="space-y-2.5">
                            <Label htmlFor="portadaDressCode" className="font-semibold text-sm">Dress Code en Portada (Opcional)</Label>
                            <Input
                                id="portadaDressCode"
                                className="bg-[var(--ink-2)] border border-white/20 text-[var(--on-ink)] h-12 rounded-xl text-sm"
                                placeholder="Ej: Elegante Sport / Black Tie"
                                value={d.portadaDressCode || ""}
                                onChange={(e) => setData({ portadaDressCode: e.target.value })}
                            />
                            <p className="text-xs text-muted-foreground">
                                Si lo completás, aparecerá como un distintivo destacado en la portada inicial.
                            </p>
                        </div>

                        {/* Campo Texto Botón */}
                        <div className="space-y-2.5">
                            <Label htmlFor="portadaTextoBoton" className="font-semibold text-sm">Texto del Botón de Entrada</Label>
                            <Input
                                id="portadaTextoBoton"
                                className="bg-[var(--ink-2)] border border-white/20 text-[var(--on-ink)] h-12 rounded-xl text-sm"
                                placeholder="Ej: Abrir invitación / Ver detalles"
                                value={d.portadaTextoBoton || ""}
                                onChange={(e) => setData({ portadaTextoBoton: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* VISTA PREVIA MOBILE (MINIATURA EN VIVO) */}
                    <div className="xl:col-span-5 flex flex-col items-center sticky top-6 xl:pl-4">
                        <div className="w-full max-w-sm p-6 sm:p-7 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-2xl backdrop-blur-md flex flex-col items-center">
                            <div className="flex items-center gap-2 mb-4 text-xs font-semibold uppercase tracking-wider text-amber-400">
                                <Smartphone className="w-4 h-4 text-amber-400" />
                                <span>Vista Previa Portada en Vivo</span>
                            </div>

                            {/* Marco de Celular */}
                            <div className="w-[270px] sm:w-[290px] h-[500px] rounded-[38px] border-[8px] border-slate-800 bg-[#0F1613] text-[#F7F1E4] shadow-2xl overflow-hidden relative font-sans flex flex-col justify-between p-6 text-center select-none">
                                {/* Dynamic Background Image Simulation */}
                                {d.portadaImagenFondo ? (
                                    <div 
                                        className="absolute inset-0 bg-cover bg-center opacity-30"
                                        style={{ backgroundImage: `url(${d.portadaImagenFondo})` }}
                                    />
                                ) : null}
                                <div className="absolute inset-0 bg-gradient-to-b from-[#182420]/90 via-[#0F1613]/95 to-[#050807]/95" />

                                {/* Camera Notch */}
                                <div className="relative z-10 w-24 h-4 bg-slate-800 rounded-b-xl mx-auto -mt-6 mb-4 flex items-center justify-center">
                                    <div className="w-3 h-3 bg-black rounded-full" />
                                </div>

                                {/* Live Mobile Content */}
                                <div className="relative z-10 flex-1 flex flex-col items-center justify-center space-y-4">
                                    {/* Monogram Seal */}
                                    <div className="w-12 h-12 rounded-full border border-amber-400/60 bg-black/40 flex items-center justify-center shadow-lg">
                                        <span className="font-serif text-amber-300 font-bold text-sm">{monogram}</span>
                                    </div>

                                    {/* Live Kicker */}
                                    <div className="space-y-1">
                                        <p className="font-mono text-[10px] uppercase tracking-widest text-amber-400 font-bold opacity-90 px-2 line-clamp-2">
                                            {kicker || "Con mucho cariño, para"}
                                        </p>
                                        
                                        {/* Simulated Guest Name */}
                                        <div className="inline-block px-3 py-1 rounded-lg bg-white/10 border border-white/20 text-white font-serif font-bold text-sm shadow-sm">
                                            Familia Pérez <span className="text-[9px] font-sans opacity-70 font-normal">(Ejemplo de invitado)</span>
                                        </div>
                                    </div>

                                    {/* Event Title */}
                                    <h3 className="font-serif text-lg font-bold text-amber-200 leading-tight px-2">
                                        {nombreEvento}
                                    </h3>

                                    {/* Dress code pill */}
                                    {dressCode ? (
                                        <div className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-[10px] font-mono tracking-wider uppercase">
                                            Dress Code: {dressCode}
                                        </div>
                                    ) : null}

                                    {/* Simulated City & Date */}
                                    <p className="text-[10px] text-slate-300 font-mono opacity-80">
                                        {d.ciudad || "Buenos Aires"} · {d.fechaEvento ? new Date(d.fechaEvento).toLocaleDateString("es-AR") : "2026"}
                                    </p>
                                </div>

                                {/* Live Action Button */}
                                <div className="relative z-10 pt-2 pb-2">
                                    <div className="w-full py-2.5 rounded-full bg-gradient-to-r from-amber-600 to-amber-500 text-black font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-1">
                                        <span>{textoBoton}</span>
                                        <span>✦</span>
                                    </div>
                                </div>
                            </div>
                            
                            <p className="text-[11px] text-slate-400 mt-3 text-center leading-normal">
                                Vista en tiempo real de cómo abrirán la tarjeta tus invitados.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <SaveStepButtons />
        </div>
    );
}
