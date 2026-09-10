"use client";
import { useState } from "react";
import { SaveStepButtons } from "./SaveStepButtons";

import { useWizardStore } from "@/store/wizard-store";
import { PresetMusicPicker } from "@/components/ui/PresetMusicPicker";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Lock, Info, ChevronDown, ChevronUp } from "lucide-react";

import { useSession } from "next-auth/react";
import { isAdmin as isAdminRole } from "@/lib/roles";
import { useTextos } from "@/components/i18n/ProveedorIdioma";

export function StepMusic() {
    const { data, setData } = useWizardStore();
    const t = useTextos();
    const usePremiumCredit = useWizardStore((state) => state.usePremiumCredit);
    const useDiamondCredit = useWizardStore((state) => state.useDiamondCredit);
    const [showMusicInfo, setShowMusicInfo] = useState(false);
    const { data: session } = useSession();
    const isAdmin = isAdminRole(session?.user?.role) || session?.user?.planTier === "ADMIN";

    // Si la invitación ya tiene un ID (edición) usamos su planTier, sino usamos usePremiumCredit/useDiamondCredit (creación)
    const isEditing = Boolean(data.id);
    const rawLocked = isEditing ? data.planTier === "FREE" : !usePremiumCredit && !useDiamondCredit;
    // Visitante sin cuenta armando el wizard antes de registrarse (ver
    // /dashboard/invitaciones/crear sin sesión): puede configurar todo,
    // incluidas las funciones de Premium -- recién al registrarse eligiendo
    // Gratis se descartan server-side (ver saveInvitationFromWizard). Acá
    // solo cambia el candado por un cartel informativo "Solo en Premium o Diamond".
    const isAnonymous = !session?.user && !isEditing;
    const isLocked = !isAdmin && rawLocked && !isAnonymous;
    const showPremiumOnlyBadge = !isAdmin && rawLocked && isAnonymous;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">{t("wizard.musica.titulo")}</h2>
                <p className="text-muted-foreground">
                    {t("wizard.musica.subtitulo")}
                </p>
            </div>

            <div className="space-y-4">
                {rawLocked && isAdmin && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
                        👑 <strong>{t("wizard.plan.modoAdmin")}</strong> {t("wizard.musica.modoAdminTexto")}
                    </div>
                )}

                <div className="flex items-center space-x-2 relative group w-fit">
                    <Checkbox
                        id="musicaHabilitada"
                        checked={data.musicaHabilitada && (!isLocked || isAdmin)}
                        disabled={isLocked}
                        onCheckedChange={(checked) =>
                            setData({ musicaHabilitada: Boolean(checked) })
                        }
                    />
                    <Label htmlFor="musicaHabilitada" className={`flex items-center gap-2 ${isLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                        {t("wizard.musica.activar")}
                        {isLocked && <Lock className="w-4 h-4 text-red-400" />}
                    </Label>
                    {isLocked && (
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                            {t("wizard.plan.disponibleEnPremium")}
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                        </div>
                    )}
                    {showPremiumOnlyBadge && (
                        <span className="text-[10px] uppercase tracking-wide font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-full px-2 py-0.5 whitespace-nowrap">
                            {t("wizard.plan.soloPremiumODiamond")}
                        </span>
                    )}
                </div>

                {data.musicaHabilitada && !isLocked && (
                    <>
                        <div className="space-y-2">
                            <Label>{t("wizard.musica.archivo")}</Label>
                            <PresetMusicPicker
                                selectedUrl={data.musicaUrl}
                                onSelect={(song) => setData({ musicaUrl: song.url })}
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="musicaAutoplay"
                                checked={data.musicaAutoplay}
                                onCheckedChange={(checked) =>
                                    setData({ musicaAutoplay: Boolean(checked) })
                                }
                            />
                            <Label htmlFor="musicaAutoplay">
                                {t("wizard.musica.autoplay")}
                            </Label>
                        </div>
                    </>
                )}

                <div className="pt-6 pb-2 border-t mt-6 space-y-4">
                    <div>
                        <h2 className="text-xl font-bold mb-1">{t("wizard.musica.sugerenciasTitulo")}</h2>
                        <p className="text-sm text-muted-foreground">
                            {t("wizard.musica.sugerenciasSubtitulo")}
                        </p>
                    </div>

                    {/* Caja informativa de Usabilidad (Collapsible - Minimizada por defecto) */}
                    <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs overflow-hidden transition-all duration-200 shadow-sm">
                        <button
                            type="button"
                            onClick={() => setShowMusicInfo(!showMusicInfo)}
                            className="w-full p-3.5 flex items-center justify-between gap-3 text-left hover:bg-amber-500/15 transition-colors cursor-pointer"
                        >
                            <div className="flex items-center gap-2.5 font-semibold text-amber-300 text-sm">
                                <Info className="w-4.5 h-4.5 shrink-0 text-amber-400" />
                                <span>{t("wizard.musica.infoTitulo")}</span>
                            </div>
                            <div className="text-amber-400 opacity-80 hover:opacity-100 transition-opacity shrink-0">
                                {showMusicInfo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </div>
                        </button>

                        {showMusicInfo && (
                            <div className="px-4 pb-4 pt-1 border-t border-amber-500/20 text-[13px] leading-relaxed opacity-95 animate-in fade-in duration-200">
                                {t("wizard.musica.infoTexto")}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center space-x-2 relative group w-fit pt-1">
                        <Checkbox
                            id="sugerenciaMusicaHabilitada"
                            checked={data.sugerenciaMusicaHabilitada && !isLocked}
                            disabled={isLocked}
                            onCheckedChange={(checked) =>
                                setData({ sugerenciaMusicaHabilitada: Boolean(checked) })
                            }
                        />
                        <Label htmlFor="sugerenciaMusicaHabilitada" className={`flex items-center gap-2 ${isLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                            {t("wizard.musica.activarSugerencias")}
                            {isLocked && <Lock className="w-4 h-4 text-red-400" />}
                        </Label>
                        {isLocked && (
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                {t("wizard.plan.disponibleEnPremium")}
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                            </div>
                        )}
                        {showPremiumOnlyBadge && (
                            <span className="text-[10px] uppercase tracking-wide font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-full px-2 py-0.5 whitespace-nowrap">
                                {t("wizard.plan.soloPremiumODiamond")}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <SaveStepButtons />
        </div>
    );
}
