"use client";

import { useState, useEffect } from "react";
import { useWizardStore } from "@/store/wizard-store";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Info, ChevronDown, ChevronUp } from "lucide-react";
import { SaveStepButtons } from "./SaveStepButtons";
import { useTextos } from "@/components/i18n/ProveedorIdioma";

function TypewriterText({ text }: { text: string }) {
    const [displayText, setDisplayText] = useState("");

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (displayText.length < text.length) {
            timeout = setTimeout(() => {
                setDisplayText(text.slice(0, displayText.length + 1));
            }, 60);
        } else {
            timeout = setTimeout(() => {
                setDisplayText("");
            }, 4000);
        }
        return () => clearTimeout(timeout);
    }, [displayText, text]);

    return (
        <span>
            {displayText}
            <span className="animate-[pulse_1s_ease-in-out_infinite] border-r-[2px] border-amber-400 h-[1em] ml-[1px] inline-block align-middle"></span>
            <span className="invisible">{text.slice(displayText.length)}</span>
        </span>
    );
}

export function StepPhrase() {
    const { data, setData } = useWizardStore();
    const t = useTextos();
    const [showInfo, setShowInfo] = useState(false);

    const tipo = data.type || "OTRO";
    const phraseHelp =
        tipo === "CASAMIENTO"
            ? t("wizard.frase.ayudaCasamiento")
            : tipo === "QUINCE_ANOS"
            ? t("wizard.frase.ayudaQuince")
            : t("wizard.frase.ayudaOtro");

    const phrasePlaceholder =
        tipo === "CASAMIENTO"
            ? t("wizard.frase.placeholderCasamiento")
            : tipo === "QUINCE_ANOS"
            ? t("wizard.frase.placeholderQuince")
            : t("wizard.frase.placeholderOtro");

    // Las frases sugeridas también viajan por el diccionario: son texto que
    // ofrecemos nosotros, no algo que escribió el anfitrión, y ofrecerlas en
    // español a alguien que arma la invitación en inglés no le sirve de nada.
    const WEDDING_PHRASES = [
        t("wizard.frase.casamiento1"),
        t("wizard.frase.casamiento2"),
        t("wizard.frase.casamiento3"),
        t("wizard.frase.casamiento4"),
        t("wizard.frase.casamiento5"),
    ];

    const QUINCE_PHRASES = [
        t("wizard.frase.quince1"),
        t("wizard.frase.quince2"),
        t("wizard.frase.quince3"),
        t("wizard.frase.quince4"),
        t("wizard.frase.quince5"),
    ];

    const suggestedPhrases = tipo === "CASAMIENTO" ? WEDDING_PHRASES : tipo === "QUINCE_ANOS" ? QUINCE_PHRASES : [];
    
    const phraseValue = data.frasePersonalizadaTexto || "";
    const [customPhrase, setCustomPhrase] = useState(!suggestedPhrases.includes(phraseValue) && phraseValue !== "");

    return (
        <div className="space-y-6">
            <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold">{t("wizard.frase.titulo")}</h2>
                <p className="text-muted-foreground text-sm">
                    {phraseHelp}
                </p>
            </div>

            {/* Caja informativa de Usabilidad (Collapsible - Minimizada por defecto) */}
            <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs overflow-hidden transition-all duration-200 shadow-sm max-w-2xl mx-auto">
                <button
                    type="button"
                    onClick={() => setShowInfo(!showInfo)}
                    className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-amber-500/15 transition-colors cursor-pointer"
                >
                    <div className="flex items-center gap-2.5 font-semibold text-amber-300 text-sm">
                        <Info className="w-4.5 h-4.5 shrink-0 text-amber-400" />
                        <span>{t("wizard.frase.infoTitulo")}</span>
                    </div>
                    <div className="text-amber-400 opacity-80 hover:opacity-100 transition-opacity shrink-0">
                        {showInfo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                </button>

                {showInfo && (
                    <div className="px-4 pb-4 pt-1 border-t border-amber-500/20 text-[13px] leading-relaxed opacity-95 animate-in fade-in duration-200">
                        {t("wizard.frase.infoTexto")}
                    </div>
                )}
            </div>

            <div className="space-y-4 bg-[var(--ink-2)] border border-[var(--line)] p-5 rounded-2xl max-w-2xl mx-auto">
                <div className="flex items-center justify-between">
                    <Label htmlFor="enablePhrase" className="text-base font-semibold cursor-pointer">
                        {t("wizard.frase.habilitar")}
                    </Label>
                    <Switch
                        id="enablePhrase"
                        checked={data.frasePersonalizadaHabilitada}
                        onCheckedChange={(checked) => setData({ frasePersonalizadaHabilitada: checked })}
                    />
                </div>

                {data.frasePersonalizadaHabilitada && (
                    <div className="space-y-4 pt-4 border-t border-[var(--line)] animate-in fade-in duration-200">
                        {suggestedPhrases.length > 0 && (
                            <div className="space-y-3">
                                <Label className="text-xs font-semibold text-amber-400 uppercase tracking-wider">{t("wizard.frase.elegiOEscribi")}</Label>
                                <div className="grid gap-2">
                                    {suggestedPhrases.map((phrase, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => {
                                                setCustomPhrase(false);
                                                setData({ frasePersonalizadaTexto: phrase });
                                            }}
                                            className={`text-left text-sm p-3 rounded-xl border transition-all duration-200 ${
                                                !customPhrase && phraseValue === phrase
                                                    ? "bg-amber-500/25 border-amber-400 text-amber-200 shadow-sm"
                                                    : "bg-[var(--tinte-1)] border-[var(--line)] hover:bg-[var(--tinte-2)] text-[var(--shell-fg-mid)]"
                                            }`}
                                        >
                                            "{phrase}"
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => setCustomPhrase(true)}
                                        className={`text-left text-sm p-3 rounded-xl border transition-all duration-200 ${
                                            customPhrase
                                                ? "bg-amber-500/25 border-amber-400 text-amber-200 font-semibold shadow-sm"
                                                : "bg-[var(--tinte-1)] border-[var(--line)] hover:bg-[var(--tinte-2)] text-[var(--shell-fg-mid)] font-semibold"
                                        }`}
                                    >
                                        <TypewriterText text={t("wizard.frase.escribirPropia")} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {(customPhrase || suggestedPhrases.length === 0) && (
                            <div className="space-y-2 pt-4 mt-2 border-t border-[var(--line)] animate-in fade-in zoom-in-95">
                                <Label htmlFor="phraseText" className="text-sm font-medium">{t("wizard.frase.tuFrase")}</Label>
                                <Textarea
                                    id="phraseText"
                                    placeholder={phrasePlaceholder}
                                    value={phraseValue}
                                    onChange={(e) => setData({ frasePersonalizadaTexto: e.target.value.replace(/[\r\n]+/g, " ") })}
                                    className="min-h-[110px] resize-none text-base bg-[var(--ink)] border border-[var(--campo-borde)] rounded-xl p-3"
                                    maxLength={300}
                                />
                                <p className="text-xs text-muted-foreground text-right">
                                    {phraseValue.length}/300
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <SaveStepButtons />
        </div>
    );
}
