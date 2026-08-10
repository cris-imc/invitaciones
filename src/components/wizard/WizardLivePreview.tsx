"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useWizardStore } from "@/store/wizard-store";
import { getWizardSteps } from "./wizard-steps-config";

// Corrección 1 (docs/correcciones.md): preview del wizard con fidelidad
// real — reemplaza al mockup de teléfono inventado (WizardPreviewPane) por
// el mismo mecanismo de iframe+escala ya probado en TemplateShowcase.tsx
// (landing) y TemplatePreviewModal.tsx (paso "Plantilla" del wizard): la
// plantilla real se renderiza en /preview-plantilla dentro de un iframe
// layouteado a un ancho mobile fijo, escalado visualmente con transform.
//
// La diferencia con esos dos usos existentes: acá el iframe recibe los
// datos reales que el usuario va cargando (no una muestra fija) via
// postMessage, y los va empujando de nuevo cada vez que cambian.

const MOBILE_VIEWPORT_WIDTH = 390;
const MOBILE_ASPECT_RATIO = 19 / 9;
const LIVE_DATA_DEBOUNCE_MS = 200;

export function WizardLivePreview() {
    const { data, themeConfig } = useWizardStore();
    if (typeof window !== "undefined") (window as any).__debugRenderPortada = data.portadaImagenFondo;
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const frameBoxRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [loading, setLoading] = useState(true);
    
    // Función para enviar los datos actuales al iframe
    const sendLiveData = () => {
        const win = iframeRef.current?.contentWindow;
        if (!win) return;

        // galeriaPrincipalFotos puede ser un array JS (desde StepGallery) o
        // ya un string JSON (desde EditWizardContainer). El template siempre
        // espera un string JSON, así que normalizamos antes de postMessage.
        const rawFotos = data.galeriaPrincipalFotos;
        const galeriaPrincipalFotosStr = Array.isArray(rawFotos)
            ? JSON.stringify(rawFotos)
            : (typeof rawFotos === "string" ? rawFotos : "[]");

        const invitation = {
            ...data,
            fechaEvento: data.fecha,

            galeriaPrincipalFotos: galeriaPrincipalFotosStr,
            temaColores: JSON.stringify({
                colorPrincipal: themeConfig?.colorPrincipal,
                tema: themeConfig?.layout,
            }),
            isPreviewMode: true,
            galeriaPrincipalHabilitada: data.galeriaPrincipalHabilitada ?? false,
            // Deshabilitamos la música completamente en el Live Preview
            // para evitar que se superponga con el reproductor
            musicaHabilitada: false,
            musicaUrl: "",
        };

        (window as any).__debugLastPosted = invitation;
        win.postMessage({ type: "wizard-live-data", invitation }, window.location.origin);
    };

    useEffect(() => {
        const box = frameBoxRef.current;
        if (!box) return;
        const update = () => setScale(box.clientWidth / MOBILE_VIEWPORT_WIDTH);
        update();
        const observer = new ResizeObserver(update);
        observer.observe(box);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const onMessage = (event: MessageEvent) => {
            if (event.source !== iframeRef.current?.contentWindow) return;
            if (event.data?.type === "template-preview-ready") {
                setLoading(false);
                // El iframe acaba de cargar/recargar: enviar los datos actuales
                // para que no quede con la muestra fija.
                sendLiveData();
            }
        };
        window.addEventListener("message", onMessage);
        return () => window.removeEventListener("message", onMessage);
    }, [data, themeConfig]); // Necesita dependencias porque sendLiveData lee de data y themeConfig

    // El src del iframe (fuerza recarga completa) solo depende de tipo de
    // evento / plantilla / color
    const evento = data.type || "CASAMIENTO";
    const tipo = data.templateTipo === "MODERNO" ? "MODERNO" : "ELEGANT";
    const color = themeConfig?.colorPrincipal || "default";
    const previewSrc = `/preview-plantilla?evento=${encodeURIComponent(evento)}&tipo=${tipo}&color=${encodeURIComponent(color)}`;

    useEffect(() => {
        setLoading(true);
    }, [previewSrc]);

    // Enviar datos debounced ante cambios
    useEffect(() => {
        const timeout = setTimeout(sendLiveData, LIVE_DATA_DEBOUNCE_MS);
        return () => clearTimeout(timeout);
    }, [data, themeConfig]);
    
    const { currentStep } = useWizardStore();
    // Sincronizar scroll cuando cambia de paso
    useEffect(() => {
        const win = iframeRef.current?.contentWindow;
        if (!win || loading) return;
        
        const isEditing = Boolean(data.id);
        const isCasamiento = data.type === "CASAMIENTO";
        const steps = getWizardSteps({ isEditing, isCasamiento });
        const stepLabel = steps[currentStep]?.label || "";

        let section = "hero";
        if (stepLabel === "Portada" || stepLabel === "Plantilla" || stepLabel === "Tipografía") section = "hero";
        if (stepLabel === "Countdown" || stepLabel === "Información Básica") section = "countdown";
        if (stepLabel === "Frase") section = "quote";
        if (stepLabel === "Detalles del Salón" || stepLabel === "Ceremonia / Civil") section = "details";
        if (stepLabel === "Cronograma") section = "schedule";
        if (stepLabel === "Galería") section = "album";
        if (stepLabel === "Música") section = "music";
        if (stepLabel === "Regalo (CBU)") section = "banco";
        if (stepLabel === "Trivia") section = "quiz";

        win.postMessage({ type: "wizard-scroll-to", section }, window.location.origin);
    }, [currentStep, loading, data.id, data.type]);

    return (
        <div
            ref={frameBoxRef}
            style={{
                position: "relative",
                width: "100%",
                maxWidth: 240,
                aspectRatio: `1 / ${MOBILE_ASPECT_RATIO}`,
                borderRadius: "2.5rem",
                border: "8px solid #070909",
                boxShadow: "0 20px 60px rgba(0,0,0,.5), 0 0 0 1px rgba(246,243,236,.06)",
                overflow: "hidden",
                background: "#000",
            }}
        >
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 52,
                    height: 14,
                    background: "#070909",
                    borderRadius: "0 0 9px 9px",
                    zIndex: 50,
                }}
            />

            {loading && (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        zIndex: 10,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(0,0,0,.9)",
                    }}
                >
                    <Loader2 className="animate-spin" style={{ width: 22, height: 22, color: "rgba(255,255,255,.7)" }} />
                </div>
            )}

            <div
                style={{
                    width: MOBILE_VIEWPORT_WIDTH,
                    height: MOBILE_VIEWPORT_WIDTH * MOBILE_ASPECT_RATIO,
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                }}
            >
                <iframe
                    ref={iframeRef}
                    src={previewSrc}
                    title="Vista previa de tu invitación"
                    tabIndex={-1}
                    style={{
                        width: MOBILE_VIEWPORT_WIDTH,
                        height: MOBILE_VIEWPORT_WIDTH * MOBILE_ASPECT_RATIO,
                        border: 0,
                        pointerEvents: "none",
                    }}
                />
            </div>
        </div>
    );
}
