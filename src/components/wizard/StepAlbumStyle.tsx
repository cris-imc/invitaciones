"use client";

import { useWizardStore } from "@/store/wizard-store";
import { SaveStepButtons } from "./SaveStepButtons";
import { useTextos } from "@/components/i18n/ProveedorIdioma";
import type { ClaveTexto } from "@/lib/i18n/texto";

const ALBUM_STYLE_OPTIONS: { id: string; label: ClaveTexto; description: ClaveTexto }[] = [
    { id: "carrusel", label: "wizard.album.carrusel", description: "wizard.album.carruselDetalle" },
    { id: "solapadas", label: "wizard.album.solapadas", description: "wizard.album.solapadasDetalle" },
    { id: "carrusel-polaroid", label: "wizard.album.polaroid", description: "wizard.album.polaroidDetalle" },
];

// Preview chico y autocontenido de cada estilo -- no reusa los componentes
// públicos AlbumCarousel/AlbumPolaroidCascade para no arrastrar su
// animación/CSS de sección completa dentro de una tarjeta angosta del
// wizard (mismo criterio que StepCountdownStyle.tsx).
function MiniPreview({ styleId }: { styleId: string }) {
    if (styleId === "solapadas") {
        return (
            <div style={{ position: "relative", height: 54, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {[-6, 0, 6].map((rot, i) => (
                    <div
                        key={i}
                        style={{
                            position: "absolute",
                            width: 34, height: 42,
                            background: "#faf8f4",
                            padding: 3,
                            borderRadius: 2,
                            boxShadow: "0 4px 8px rgba(0,0,0,.35)",
                            transform: `rotate(${rot}deg) translateX(${rot * 1.4}px)`,
                            zIndex: i,
                        }}
                    >
                        <div style={{ width: "100%", height: "100%", background: "var(--accent)", opacity: 0.35, borderRadius: 1 }} />
                    </div>
                ))}
            </div>
        );
    }

    if (styleId === "carrusel-polaroid") {
        const rotations = [-6, 0, 6];
        return (
            <div style={{ display: "flex", gap: 6, justifyContent: "center", height: 54, alignItems: "center" }}>
                {rotations.map((rot, i) => (
                    <div
                        key={i}
                        style={{
                            width: 26, height: 34,
                            background: "#faf8f4",
                            padding: 2,
                            paddingBottom: 5,
                            borderRadius: 1,
                            boxShadow: "0 3px 6px rgba(0,0,0,.3)",
                            transform: `rotate(${rot}deg)`,
                        }}
                    >
                        <div style={{ width: "100%", height: "100%", background: "var(--accent)", opacity: i === 1 ? 0.5 : 0.3 }} />
                    </div>
                ))}
            </div>
        );
    }

    // carrusel
    return (
        <div style={{ display: "flex", gap: 4, justifyContent: "center", height: 54, alignItems: "center" }}>
            {[0, 1, 2].map((i) => (
                <div
                    key={i}
                    style={{
                        width: 26, height: 40,
                        borderRadius: 4,
                        background: "var(--accent)",
                        opacity: i === 1 ? 0.5 : 0.25,
                    }}
                />
            ))}
        </div>
    );
}

export function StepAlbumStyle() {
    const { data, setData } = useWizardStore();
    const t = useTextos();
    const selected = data.albumStyle || "carrusel";

    return (
        <div className="space-y-6">
            <div className="mb-2">
                <p
                    className="text-[10px] uppercase tracking-[0.1em] font-bold mb-2"
                    style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}
                >
                    {t("wizard.album.etiqueta")}
                </p>
                <h2
                    className="text-2xl font-bold mb-1"
                    style={{ fontFamily: "var(--font-display)", color: "var(--paper)" }}
                >
                    {t("wizard.album.titulo")}
                </h2>
                <p style={{ fontSize: "12.5px", color: "var(--shell-fg-soft)", lineHeight: 1.5 }}>
                    {t("wizard.album.subtitulo")}
                </p>
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "9px",
                }}
            >
                {ALBUM_STYLE_OPTIONS.map((option) => {
                    const isActive = selected === option.id;
                    return (
                        <button
                            key={option.id}
                            type="button"
                            onClick={() => setData({ albumStyle: option.id })}
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
                                <MiniPreview styleId={option.id} />
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

            {selected === "solapadas" && (
                <p
                    style={{
                        fontSize: "12px",
                        lineHeight: 1.5,
                        color: "var(--shell-fg-soft)",
                        background: "var(--tinte-1)",
                        border: "1px solid var(--line)",
                        borderRadius: "var(--r-s)",
                        padding: "10px 12px",
                    }}
                >
                    {t("wizard.album.avisoSolapadas")}
                </p>
            )}

            <SaveStepButtons isLastStep={false} />
        </div>
    );
}
