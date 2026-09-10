"use client";

import { useWizardStore } from "@/store/wizard-store";
import { SaveStepButtons } from "./SaveStepButtons";
import { useTextos } from "@/components/i18n/ProveedorIdioma";
import type { ClaveTexto } from "@/lib/i18n/texto";

/**
 * Cómo se recorren los paneles de "Cuándo y dónde" en la Colección
 * Storytelling. Este paso sólo aparece para esas plantillas (ver
 * wizard-steps-config.ts): las Flat no tienen paneles que recorrer.
 *
 * El diseño de los paneles es el mismo en los dos modos -- lo único que cambia
 * es hacia dónde se avanza.
 */
const OPCIONES: { id: "lateral" | "vertical"; vertical: boolean; titulo: ClaveTexto; detalle: ClaveTexto }[] = [
    {
        id: "lateral",
        vertical: false,
        titulo: "wizard.recorrido.zigzagTitulo",
        detalle: "wizard.recorrido.zigzagDetalle",
    },
    {
        id: "vertical",
        vertical: true,
        titulo: "wizard.recorrido.abajoTitulo",
        detalle: "wizard.recorrido.abajoDetalle",
    },
];

export function StepStorytellingScroll() {
    const { data, setData } = useWizardStore();
    const t = useTextos();
    const esVertical = Boolean(data.storytellingScrollVertical);

    return (
        <div className="space-y-6">
            <div className="mb-2">
                <p
                    className="text-[10px] uppercase tracking-[0.1em] font-bold mb-2"
                    style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}
                >
                    {t("wizard.recorrido.etiqueta")}
                </p>
                <h2
                    className="text-2xl font-bold mb-1"
                    style={{ fontFamily: "var(--font-display)", color: "var(--paper)" }}
                >
                    {t("wizard.recorrido.titulo")}
                </h2>
                <p style={{ fontSize: "12.5px", color: "var(--shell-fg-soft)", lineHeight: 1.5 }}>
                    {t("wizard.recorrido.subtitulo")}
                </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "9px" }}>
                {OPCIONES.map((op) => {
                    const activa = op.vertical === esVertical;
                    return (
                        <button
                            key={op.id}
                            type="button"
                            onClick={() => setData({ storytellingScrollVertical: op.vertical })}
                            aria-pressed={activa}
                            style={{
                                borderRadius: "var(--r-s)",
                                border: `1.5px solid ${activa ? "var(--accent)" : "var(--line)"}`,
                                padding: "16px 14px",
                                cursor: "pointer",
                                textAlign: "left",
                                background: activa ? "rgba(199,154,75,.08)" : "var(--tinte-1)",
                                transition: "all 0.15s",
                            }}
                        >
                            {/* El dibujito es el recorrido en sí. El de costado no es
                                lateral de punta a punta: se baja, los paneles del lugar
                                pasan de lado, y se sigue bajando -- eso dibuja una Z
                                parada. El otro es una sola bajada. */}
                            <div
                                aria-hidden
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "flex-start",
                                    gap: "3px",
                                    marginBottom: "10px",
                                    width: "32px",
                                }}
                            >
                                {(op.vertical
                                    ? [
                                          { w: "26px", h: "7px", der: false },
                                          { w: "26px", h: "7px", der: false },
                                          { w: "26px", h: "7px", der: false },
                                      ]
                                    : [
                                          // baja · cruza · baja
                                          { w: "8px", h: "10px", der: false },
                                          { w: "32px", h: "7px", der: false },
                                          { w: "8px", h: "10px", der: true },
                                      ]
                                ).map((b, i) => (
                                    <span
                                        key={i}
                                        style={{
                                            display: "block",
                                            width: b.w,
                                            height: b.h,
                                            borderRadius: "2px",
                                            background: activa ? "var(--accent)" : "var(--tinte-4)",
                                            opacity: activa ? 1 : 0.9,
                                            alignSelf: b.der ? "flex-end" : "flex-start",
                                        }}
                                    />
                                ))}
                            </div>
                            <div
                                style={{
                                    fontSize: "13.5px",
                                    fontWeight: 700,
                                    color: activa ? "var(--accent)" : "var(--paper)",
                                    marginBottom: "3px",
                                }}
                            >
                                {t(op.titulo)}
                            </div>
                            <div style={{ fontSize: "11.5px", color: "var(--shell-fg-soft)", lineHeight: 1.45 }}>
                                {t(op.detalle)}
                            </div>
                        </button>
                    );
                })}
            </div>

            <SaveStepButtons isLastStep={false} />
        </div>
    );
}
