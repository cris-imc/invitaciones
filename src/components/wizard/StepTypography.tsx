"use client";
import React, { useState } from 'react';

import { useWizardStore } from "@/store/wizard-store";
import { TITLE_FONT_OPTIONS, BODY_FONT_OPTIONS, type FontOption } from "@/lib/typography-map";
import { SaveStepButtons } from "./SaveStepButtons";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTextos } from "@/components/i18n/ProveedorIdioma";

function FontGrid({
    options,
    selectedId,
    previewText,
    onSelect,
}: {
    options: FontOption[];
    selectedId: string;
    previewText: string;
    onSelect: (id: string) => void;
}) {
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "9px",
            }}
        >
            {options.map((option) => {
                const isActive = selectedId === option.id;
                return (
                    <button
                        key={option.id}
                        type="button"
                        onClick={() => onSelect(option.id)}
                        style={{
                            borderRadius: "var(--r-s)",
                            border: `1.5px solid ${isActive ? "var(--accent)" : "var(--line)"}`,
                            padding: "14px 10px",
                            cursor: "pointer",
                            textAlign: "center",
                            background: isActive
                                ? "rgba(199,154,75,.08)"
                                : "var(--tinte-1)",
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
                        <p
                            style={{
                                fontFamily: option.fontFamily,
                                fontStyle: option.fontStyle || "normal",
                                fontSize: "15px",
                                color: "var(--paper)",
                                marginBottom: "6px",
                                lineHeight: 1.2,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {previewText}
                        </p>
                        <p
                            style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: "9px",
                                color: "var(--shell-fg-faint)",
                                letterSpacing: "0.05em",
                            }}
                        >
                            {option.label}
                        </p>
                    </button>
                );
            })}
        </div>
    );
}

export function StepTypography() {
    const { data, setData } = useWizardStore();
    const t = useTextos();
    const selectedTitle = data.fontTitle || "fraunces";
    const selectedBody = data.fontBody || "space-grotesk";
    // El nombre real que cargó el anfitrión manda; sólo el relleno de muestra
    // (cuando todavía no cargó nada) sale del diccionario.
    const getPreviewName = () => {
        if (data.type === "CASAMIENTO") {
            return data.nombreNovia || t("wizard.tipografia.muestraNombre");
        }
        if (data.type === "QUINCE_ANOS") {
            return data.nombreQuinceanera || t("wizard.tipografia.muestraQuince");
        }
        return data.nombreEvento || t("wizard.tipografia.muestraEvento");
    };
    
    const previewName = getPreviewName();

    const [modalTitleOpen, setModalTitleOpen] = useState(false);
    const [modalBodyOpen, setModalBodyOpen] = useState(false);

    // Muestra 4 opciones (2x2 grid) en la vista principal
    const visibleTitleOptions = TITLE_FONT_OPTIONS.slice(0, 4);
    const visibleBodyOptions = BODY_FONT_OPTIONS.slice(0, 4);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="mb-2">
                <p
                    className="text-[10px] uppercase tracking-[0.1em] font-bold mb-2"
                    style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}
                >
                    {t("wizard.tipografia.etiqueta")}
                </p>
                <h2
                    className="text-2xl font-bold mb-1"
                    style={{ fontFamily: "var(--font-display)", color: "var(--paper)" }}
                >
                    {t("wizard.tipografia.titulo")}
                </h2>
                <p style={{ fontSize: "12.5px", color: "var(--shell-fg-soft)", lineHeight: 1.5 }}>
                    {t("wizard.tipografia.subtitulo")}
                </p>
            </div>

            {/* Nivel 1: Títulos */}
            <div className="space-y-3">
                <p
                    style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "10px",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color: "var(--shell-fg-soft)",
                    }}
                >
                    {t("wizard.tipografia.titulos")}
                </p>
                <FontGrid
                    options={visibleTitleOptions}
                    selectedId={selectedTitle}
                    previewText={previewName}
                    onSelect={(id) => setData({ fontTitle: id })}
                />
                {TITLE_FONT_OPTIONS.length > 4 && (
                    <>
                        <button
                            type="button"
                            onClick={() => setModalTitleOpen(true)}
                            className="text-xs font-medium opacity-70 hover:opacity-100 transition-opacity flex items-center justify-center w-full py-1"
                        >
                            {t("wizard.tipografia.verMas")}
                        </button>
                        <Dialog open={modalTitleOpen} onOpenChange={setModalTitleOpen}>
                            <DialogContent className="max-w-4xl w-[95vw] max-h-[85vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>{t("wizard.tipografia.modalTitulos")}</DialogTitle>
                                    <DialogDescription>{t("wizard.tipografia.modalTitulosDesc")}</DialogDescription>
                                </DialogHeader>
                                <div className="py-4">
                                    <FontGrid
                                        options={TITLE_FONT_OPTIONS}
                                        selectedId={selectedTitle}
                                        previewText={previewName}
                                        onSelect={(id) => {
                                            setData({ fontTitle: id });
                                            setModalTitleOpen(false);
                                        }}
                                    />
                                </div>
                            </DialogContent>
                        </Dialog>
                    </>
                )}
            </div>

            {/* Nivel 2: Texto */}
            <div className="space-y-3">
                <p
                    style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "10px",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color: "var(--shell-fg-soft)",
                    }}
                >
                    {t("wizard.tipografia.texto")}
                </p>
                <FontGrid
                    options={visibleBodyOptions}
                    selectedId={selectedBody}
                    previewText={t("wizard.tipografia.muestraTexto")}
                    onSelect={(id) => setData({ fontBody: id })}
                />
                {BODY_FONT_OPTIONS.length > 4 && (
                    <>
                        <button
                            type="button"
                            onClick={() => setModalBodyOpen(true)}
                            className="text-xs font-medium opacity-70 hover:opacity-100 transition-opacity flex items-center justify-center w-full py-1"
                        >
                            {t("wizard.tipografia.verMas")}
                        </button>
                        <Dialog open={modalBodyOpen} onOpenChange={setModalBodyOpen}>
                            <DialogContent className="max-w-4xl w-[95vw] max-h-[85vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>{t("wizard.tipografia.modalTexto")}</DialogTitle>
                                    <DialogDescription>{t("wizard.tipografia.modalTextoDesc")}</DialogDescription>
                                </DialogHeader>
                                <div className="py-4">
                                    <FontGrid
                                        options={BODY_FONT_OPTIONS}
                                        selectedId={selectedBody}
                                        previewText={t("wizard.tipografia.muestraTexto")}
                                        onSelect={(id) => {
                                            setData({ fontBody: id });
                                            setModalBodyOpen(false);
                                        }}
                                    />
                                </div>
                            </DialogContent>
                        </Dialog>
                    </>
                )}
            </div>

            {/* Navigation */}
            <SaveStepButtons isLastStep={false} />
        </div>
    );
}
