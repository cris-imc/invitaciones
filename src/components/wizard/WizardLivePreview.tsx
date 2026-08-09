"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useWizardStore } from "@/store/wizard-store";

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
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const frameBoxRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [loading, setLoading] = useState(true);

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
            if (event.data?.type === "template-preview-ready") setLoading(false);
        };
        window.addEventListener("message", onMessage);
        return () => window.removeEventListener("message", onMessage);
    }, []);

    // El src del iframe (fuerza recarga completa) solo depende de tipo de
    // evento / plantilla / color -- son elecciones deliberadas y poco
    // frecuentes, ya resueltas antes de llegar a los pasos donde importa la
    // reactividad fina (Plantilla es el 2do paso del wizard).
    const evento = data.type || "CASAMIENTO";
    const tipo = data.templateTipo === "MODERNO" ? "MODERNO" : "ELEGANT";
    const color = themeConfig?.colorPrincipal || "default";
    const previewSrc = `/preview-plantilla?evento=${encodeURIComponent(evento)}&tipo=${tipo}&color=${encodeURIComponent(color)}`;

    useEffect(() => {
        setLoading(true);
    }, [previewSrc]);

    // Todo lo demás (nombre, fecha, lugar, tipografía, countdown...) viaja
    // por postMessage sin recargar el iframe, con un debounce corto para no
    // saturarlo en cada tecla.
    useEffect(() => {
        const timeout = setTimeout(() => {
            const win = iframeRef.current?.contentWindow;
            if (!win) return;

            const invitation = {
                nombreEvento: data.nombreEvento,
                fechaEvento: data.fecha,
                lugarNombre: data.lugarNombre,
                direccion: data.direccion,
                ciudad: data.ciudad,
                nombreNovio: data.nombreNovio,
                nombreNovia: data.nombreNovia,
                nombreQuinceanera: data.nombreQuinceanera,
                portadaImagenFondo: data.portadaImagenFondo,
                portadaImagenFondoDesktop: data.portadaImagenFondoDesktop,
                templateTipo: data.templateTipo,
                tipografiaDisplay: data.tipografiaDisplay,
                fontTitle: data.fontTitle,
                fontBody: data.fontBody,
                countdownStyle: data.countdownStyle,
                temaColores: JSON.stringify({
                    colorPrincipal: themeConfig?.colorPrincipal,
                    tema: themeConfig?.layout,
                }),
            };

            win.postMessage({ type: "wizard-live-data", invitation }, window.location.origin);
        }, LIVE_DATA_DEBOUNCE_MS);

        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, themeConfig, previewSrc]);

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
