"use client";

import { useWizardStore } from "@/store/wizard-store";
import { StepEventType } from "./StepEventType";
import { StepBasicInfo } from "./StepBasicInfo";
import { StepDetails } from "./StepDetails";
import { StepHeroImages } from "./StepHeroImages";
import { StepGallery } from "./StepGallery";
import { StepMusic } from "./StepMusic";
import { StepTrivia } from "./StepTrivia";
import { StepDesign } from "./StepDesign";
import { StepCronograma } from "./StepCronograma";
import { WizardPreviewPane } from "./WizardPreviewPane";
import { BackLink } from "@/components/ui/BackLink";
import { StepPreview } from "./StepPreview";
import { StepPhrase } from "./StepPhrase";
import { StepBankDetails } from "./StepBankDetails";
import { StepCeremonia } from "./StepCeremonia";
import { StepTypography } from "./StepTypography";

// ──────────────────────────────────────────────────────────
//  TYPOGRAPHY FONT MAP — maps tipografiaDisplay id → CSS
// ──────────────────────────────────────────────────────────
const FONT_STYLE_MAP: Record<string, React.CSSProperties> = {
    "fraunces": { fontFamily: "var(--font-display)", fontStyle: "normal" },
    "fraunces-italic": { fontFamily: "var(--font-display)", fontStyle: "italic" },
    "cormorant": { fontFamily: "var(--font-cormorant)", fontStyle: "normal" },
    "space-grotesk": { fontFamily: "var(--font-ui)", fontStyle: "normal" },
};

// ──────────────────────────────────────────────────────────
//  Mini preview of the invitation shown in the right pane
// ──────────────────────────────────────────────────────────
function WizardPreviewPane({ eventName, eventDate, typography, eventType }: {
    eventName?: string;
    eventDate?: Date;
    typography?: string;
    eventType?: string;
}) {
    const fontStyle = FONT_STYLE_MAP[typography || "fraunces"] || FONT_STYLE_MAP["fraunces"];
    const displayName = eventName || "Mi Evento";
    const dateStr = eventDate
        ? new Date(eventDate).toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })
        : "Fecha por definir";

    // Strip color by event type
    const stripColors: Record<string, string> = {
        CASAMIENTO: "linear-gradient(135deg, #122019, #1c2f26)",
        QUINCE_ANOS: "linear-gradient(135deg, #241221, #33162d)",
        CUMPLEANOS: "linear-gradient(135deg, #0F2E28, #173F37)",
        default: "linear-gradient(135deg, var(--ink-2), var(--ink))",
    };
    const stripColor = stripColors[eventType || "default"] || stripColors.default;
    const accentColors: Record<string, string> = {
        CASAMIENTO: "#B98B3E",
        QUINCE_ANOS: "#C98A4B",
        CUMPLEANOS: "#E0A458",
        default: "var(--accent)",
    };
    const accentColor = accentColors[eventType || "default"] || accentColors.default;

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
                gap: 14,
                position: "relative",
            }}
        >
            {/* Radial glow bg */}
            <div style={{
                position: "absolute", inset: 0,
                background: "radial-gradient(ellipse at 60% 40%, rgba(199,154,75,.07) 0%, transparent 65%)",
                pointerEvents: "none",
            }} />

            {/* Preview label */}
            <p style={{
                fontFamily: "var(--font-mono)",
                fontSize: "9.5px",
                textTransform: "uppercase",
                letterSpacing: ".1em",
                color: "rgba(246,243,236,.22)",
                position: "absolute",
                top: 18,
            }}>
                Vista previa
            </p>

            {/* Phone frame */}
            <div style={{
                width: 190,
                background: "#070909",
                borderRadius: 34,
                padding: "12px 8px",
                boxShadow: "0 20px 60px rgba(0,0,0,.5), 0 0 0 1px rgba(246,243,236,.06)",
                position: "relative",
                zIndex: 1,
            }}>
                {/* Notch */}
                <div style={{
                    width: 52, height: 14,
                    background: "#070909",
                    borderRadius: "0 0 9px 9px",
                    margin: "0 auto 6px",
                }} />

                {/* Screen */}
                <div style={{
                    background: stripColor,
                    borderRadius: 22,
                    height: 360,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    padding: 20,
                    position: "relative",
                }}>
                    {/* Overlay */}
                    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.22)" }} />

                    {/* Content */}
                    <div style={{ position: "relative", zIndex: 1 }}>
                        {/* Seal */}
                        <div style={{
                            width: 40, height: 40, borderRadius: "50%",
                            border: `1.5px solid ${accentColor}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            margin: "0 auto 10px",
                        }}>
                            <span style={{ ...fontStyle, fontSize: 13, color: accentColor, fontWeight: 700 }}>
                                {displayName.charAt(0).toUpperCase()}
                            </span>
                        </div>

                        {/* Event type eyebrow */}
                        <p style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 8,
                            letterSpacing: ".1em",
                            textTransform: "uppercase",
                            color: "rgba(247,241,228,.45)",
                            marginBottom: 5,
                        }}>
                            {eventType === "CASAMIENTO" ? "Casamiento"
                                : eventType === "QUINCE_ANOS" ? "15 Años"
                                : eventType === "CUMPLEANOS" ? "Cumpleaños"
                                : "Invitación"}
                        </p>

                        {/* Event name */}
                        <p style={{
                            ...fontStyle,
                            fontSize: 20,
                            fontWeight: 700,
                            color: "#F7F1E4",
                            lineHeight: 1.06,
                            marginBottom: 4,
                        }}>
                            {displayName}
                        </p>

                        {/* Date */}
                        <p style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 9,
                            color: "rgba(247,241,228,.55)",
                            marginBottom: 14,
                        }}>
                            {dateStr}
                        </p>

                        {/* CTA */}
                        <div style={{
                            background: accentColor,
                            color: "#122019",
                            borderRadius: 999,
                            fontFamily: "var(--font-ui)",
                            fontSize: 10,
                            fontWeight: 700,
                            padding: "6px 18px",
                            display: "inline-block",
                        }}>
                            Abrir invitación
                        </div>
                    </div>
                </div>
            </div>

            {/* Hint */}
            <p style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                color: "rgba(246,243,236,.18)",
                textAlign: "center",
                position: "absolute",
                bottom: 16,
                letterSpacing: ".04em",
            }}>
                La preview se actualiza en tiempo real
            </p>
        </div>
    );
}

export function WizardSteps() {
    const { currentStep, data } = useWizardStore();

    const isCasamiento = data.type === "CASAMIENTO";
    const isEditing = Boolean(data.id);

    // ──────────────────────────────────────────────────────
    //  STEPS ORDER (redesign): EventType → Design → Typography → BasicInfo → ...
    // ──────────────────────────────────────────────────────
    const steps = [
        ...(isEditing ? [] : [{ component: StepEventType, label: "Tipo de Evento" }]),
        // Template selector moved up to be the 2nd step
        { component: StepDesign, label: "Plantilla" },
        // New typography step
        { component: StepTypography, label: "Tipografía" },
        { component: StepBasicInfo, label: "Información Básica" },
        { component: StepDetails, label: "Detalles del Salón" },
        ...(isCasamiento ? [{ component: StepCeremonia, label: "Ceremonia / Civil" }] : []),
        { component: StepCronograma, label: "Cronograma" },
        { component: StepHeroImages, label: "Portada" },
        { component: StepGallery, label: "Galería" },
        { component: StepPhrase, label: "Frase" },
        { component: StepMusic, label: "Música" },
        { component: StepTrivia, label: "Trivia" },
        { component: StepBankDetails, label: "Regalo (CBU)" },
    ];

    const CurrentComponent = steps[currentStep].component;
    const progress = ((currentStep + 1) / steps.length) * 100;
    const showProgress = isEditing || Boolean(data.type);

    // ──────────────────────────────────────────────────────
    //  Desktop split-panel layout (left edit + right preview)
    // ──────────────────────────────────────────────────────
    return (
        <div className="wiz-root">
            {/* ── LEFT PANEL (edit) ── */}
            <div className="wiz-panel">
                {/* Wizard header bar */}
                <div className="wiz-header flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex-1">
                        {showProgress && (
                            <>
                                <div className="wiz-step-lbl">
                                    <span style={{ color: "var(--accent)", fontWeight: 700 }}>
                                        PASO {currentStep + 1}
                                    </span>
                                    {" · "}{steps[currentStep].label}
                                </div>
                                <div className="wiz-progress-track">
                                    <div
                                        className="wiz-progress-fill"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </>
                        )}
                        {!showProgress && (
                            <div className="wiz-step-lbl">
                                Creá tu invitación
                            </div>
                        )}
                    </div>
                    <div className="shrink-0 flex items-center">
                        <BackLink href="/dashboard" confirmIfDirty />
                    </div>
                </div>

                {/* Step content */}
                <div className="wiz-scroll">
                    <CurrentComponent />
                </div>
            </div>

            {/* ── RIGHT PANEL (preview — hidden on mobile, visible on desktop) ── */}
            <div className="wiz-preview-pane">
                <WizardPreviewPane
                    eventName={data.nombreEvento}
                    eventDate={data.fecha}
                    typography={data.tipografiaDisplay}
                    eventType={data.type}
                />
            </div>
        </div>
    );
}
