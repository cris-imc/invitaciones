"use client";

import { useWizardStore } from "@/store/wizard-store";
import { SaveStepButtons } from "./SaveStepButtons";
import { useTextos } from "@/components/i18n/ProveedorIdioma";
import type { ClaveTexto, Traductor } from "@/lib/i18n/texto";

const COUNTDOWN_STYLE_OPTIONS: { id: string; label: ClaveTexto; description: ClaveTexto }[] = [
    { id: "clasico", label: "wizard.countdown.clasico", description: "wizard.countdown.clasicoDetalle" },
    { id: "minimalista", label: "wizard.countdown.minimalista", description: "wizard.countdown.minimalistaDetalle" },
    { id: "capsulas", label: "wizard.countdown.capsulas", description: "wizard.countdown.capsulasDetalle" },
    { id: "flip", label: "wizard.countdown.flip", description: "wizard.countdown.flipDetalle" },
];

// Preview chico y autocontenido de cada estilo, con valores fijos (o
// derivados de la fecha real si ya está cargada) — no reusa el componente
// público Countdown.tsx para no arrastrar su timer/CSS de sección completa
// dentro de una tarjeta angosta del wizard.
function MiniPreview({ styleId, days, t }: { styleId: string; days: number; t: Traductor }) {
    const boxes = [
        { label: t("wizard.countdown.dias"), value: String(days) },
        { label: t("wizard.countdown.horas"), value: "08" },
        { label: t("wizard.countdown.minutos"), value: "24" },
    ];

    if (styleId === "minimalista") {
        return (
            <div style={{ textAlign: "center" }}>
                <p style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 28, color: "var(--paper)", lineHeight: 1 }}>{days}</p>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 4 }}>
                    {t("wizard.countdown.diasRestantes")}
                </p>
            </div>
        );
    }

    if (styleId === "capsulas") {
        return (
            <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                {boxes.map((b) => (
                    <div key={b.label} style={{ borderRadius: "var(--radius-pill)", background: "var(--accent)", padding: "4px 8px", textAlign: "center" }}>
                        <b style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 12, color: "#ffffff", display: "block" }}>{b.value}</b>
                    </div>
                ))}
            </div>
        );
    }

    if (styleId === "flip") {
        return (
            <div style={{ display: "flex", gap: 3, justifyContent: "center", alignItems: "center" }}>
                {boxes.map((b, i) => (
                    <span key={b.label} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                        <div style={{ borderRadius: 6, border: "1px solid var(--line)", padding: "3px 6px", textAlign: "center" }}>
                            <b style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 12, color: "var(--paper)" }}>{b.value}</b>
                        </div>
                        {i < boxes.length - 1 && <span style={{ color: "var(--accent)", fontSize: 10 }}>:</span>}
                    </span>
                ))}
            </div>
        );
    }

    // clasico
    return (
        <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
            {boxes.map((b) => (
                <div key={b.label} style={{ borderRadius: 8, border: "1px solid var(--line)", padding: "5px 7px", textAlign: "center" }}>
                    <b style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 12, color: "var(--paper)", display: "block" }}>{b.value}</b>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 6, color: "var(--accent)", textTransform: "uppercase" }}>{b.label}</span>
                </div>
            ))}
        </div>
    );
}

export function StepCountdownStyle() {
    const { data, setData } = useWizardStore();
    const t = useTextos();
    const selected = data.countdownStyle || "clasico";

    const days = data.fecha
        ? Math.max(0, Math.ceil((new Date(data.fecha).getTime() - Date.now()) / 86400000))
        : 45;

    return (
        <div className="space-y-6">
            <div className="mb-2">
                <p
                    className="text-[10px] uppercase tracking-[0.1em] font-bold mb-2"
                    style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}
                >
                    {t("wizard.countdown.etiqueta")}
                </p>
                <h2
                    className="text-2xl font-bold mb-1"
                    style={{ fontFamily: "var(--font-display)", color: "var(--paper)" }}
                >
                    {t("wizard.countdown.titulo")}
                </h2>
                <p style={{ fontSize: "12.5px", color: "var(--shell-fg-soft)", lineHeight: 1.5 }}>
                    {t("wizard.countdown.subtitulo")}
                </p>
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "9px",
                }}
            >
                {COUNTDOWN_STYLE_OPTIONS.map((option) => {
                    const isActive = selected === option.id;
                    return (
                        <button
                            key={option.id}
                            type="button"
                            onClick={() => setData({ countdownStyle: option.id })}
                            style={{
                                borderRadius: "var(--r-s)",
                                border: `1.5px solid ${isActive ? "var(--accent)" : "var(--line)"}`,
                                padding: "16px 10px",
                                cursor: "pointer",
                                textAlign: "center",
                                background: isActive ? "rgba(199,154,75,.08)" : "var(--tinte-1)",
                                transition: "all 0.15s",
                                position: "relative",
                            }}
                        >
                            {isActive && (
                                <span
                                    style={{
                                        position: "absolute",
                                        top: 5,
                                        right: 5,
                                        width: 16,
                                        height: 16,
                                        borderRadius: "50%",
                                        background: "var(--accent)",
                                        color: "var(--ink)",
                                        fontSize: 9,
                                        fontWeight: 700,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    ✓
                                </span>
                            )}
                            <div style={{ marginBottom: 10 }}>
                                <MiniPreview styleId={option.id} days={days} t={t} />
                            </div>
                            <p
                                style={{
                                    fontFamily: "var(--font-mono)",
                                    fontSize: "9px",
                                    color: "var(--shell-fg-faint)",
                                    letterSpacing: "0.05em",
                                }}
                            >
                                {t(option.label)}
                            </p>
                            <p
                                style={{
                                    fontFamily: "var(--font-mono)",
                                    fontSize: "8px",
                                    color: "var(--shell-fg-faint)",
                                    marginTop: "2px",
                                }}
                            >
                                {t(option.description)}
                            </p>
                        </button>
                    );
                })}
            </div>

            <SaveStepButtons isLastStep={false} />
        </div>
    );
}
