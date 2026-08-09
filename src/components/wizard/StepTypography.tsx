"use client";

import { useWizardStore } from "@/store/wizard-store";
import { SaveStepButtons } from "./SaveStepButtons";

const TYPOGRAPHY_OPTIONS = [
    {
        id: "fraunces",
        label: "Fraunces",
        style: { fontFamily: "var(--font-display)", fontStyle: "normal" },
        description: "Clásica · Elegante",
    },
    {
        id: "fraunces-italic",
        label: "Fraunces Italic",
        style: { fontFamily: "var(--font-display)", fontStyle: "italic" },
        description: "Romántica · Suave",
    },
    {
        id: "cormorant",
        label: "Cormorant",
        style: { fontFamily: "var(--font-cormorant)", fontStyle: "normal" },
        description: "Sobria · Refinada",
    },
    {
        id: "space-grotesk",
        label: "Space Grotesk",
        style: { fontFamily: "var(--font-ui)", fontStyle: "normal" },
        description: "Moderna · Limpia",
    },
];

export function StepTypography() {
    const { data, setData, nextStep, prevStep } = useWizardStore();
    const selected = data.tipografiaDisplay || "fraunces";
    const previewName = data.nombreEvento || "Nombre del Evento";

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="mb-2">
                <p
                    className="text-[10px] uppercase tracking-[0.1em] font-bold mb-2"
                    style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}
                >
                    Tipografía
                </p>
                <h2
                    className="text-2xl font-bold mb-1"
                    style={{ fontFamily: "var(--font-display)", color: "var(--paper)" }}
                >
                    Elegí la tipografía
                </h2>
                <p style={{ fontSize: "12.5px", color: "rgba(246,243,236,.5)", lineHeight: 1.5 }}>
                    Define el carácter visual de tu invitación. Podés cambiarla después.
                </p>
            </div>

            {/* Font grid 2×2 */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "9px",
                }}
            >
                {TYPOGRAPHY_OPTIONS.map((option) => {
                    const isActive = selected === option.id;
                    return (
                        <button
                            key={option.id}
                            type="button"
                            onClick={() => setData({ tipografiaDisplay: option.id })}
                            style={{
                                borderRadius: "var(--r-s)",
                                border: `1.5px solid ${isActive ? "var(--accent)" : "var(--line)"}`,
                                padding: "14px 10px",
                                cursor: "pointer",
                                textAlign: "center",
                                background: isActive
                                    ? "rgba(199,154,75,.08)"
                                    : "rgba(246,243,236,.03)",
                                transition: "all 0.15s",
                                position: "relative",
                            }}
                        >
                            {/* Checkmark for active */}
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
                            {/* Font preview */}
                            <p
                                style={{
                                    ...option.style,
                                    fontSize: "15px",
                                    color: "var(--paper)",
                                    marginBottom: "6px",
                                    lineHeight: 1.2,
                                }}
                            >
                                {previewName}
                            </p>
                            {/* Font name label */}
                            <p
                                style={{
                                    fontFamily: "var(--font-mono)",
                                    fontSize: "9px",
                                    color: "rgba(246,243,236,.35)",
                                    letterSpacing: "0.05em",
                                }}
                            >
                                {option.label}
                            </p>
                            <p
                                style={{
                                    fontFamily: "var(--font-mono)",
                                    fontSize: "8px",
                                    color: "rgba(246,243,236,.22)",
                                    marginTop: "2px",
                                }}
                            >
                                {option.description}
                            </p>
                        </button>
                    );
                })}
            </div>

            {/* Navigation */}
            <SaveStepButtons isLastStep={false} />
        </div>
    );
}
