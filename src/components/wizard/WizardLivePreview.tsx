"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { useWizardStore } from "@/store/wizard-store";
import { getWizardSteps, isStorytellingTemplate } from "./wizard-steps-config";
import { isAdmin as isAdminRole } from "@/lib/roles";

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
    const { data, themeConfig, currentStep } = useWizardStore();
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const frameBoxRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [loading, setLoading] = useState(true);

    // Mientras el paso activo sea "Portada" (las 2 fotos de portada, antes
    // de elegir Plantilla), el preview debe quedarse mostrando la portada de
    // bienvenida en vez de saltar directo al interior -- así el cliente ve
    // sus propias fotos de portada tal cual van a lucir. Apenas avanza a
    // "Plantilla" (o cualquier paso posterior), vuelve al comportamiento de
    // siempre (auto-abrir y mostrar el interior).
    const { data: session } = useSession();
    const isAdmin = isAdminRole(session?.user?.role) || session?.user?.planTier === "ADMIN";
    const isEditing = Boolean(data.id);
    const isCasamiento = data.type === "CASAMIENTO";
    const steps = getWizardSteps({ isEditing, isCasamiento, hasGallery: data.galeriaPrincipalHabilitada !== false, isAdmin, templateTipo: data.templateTipo });
    const stepLabel = steps[currentStep]?.label || "";
    const showCoverOnly = stepLabel === "Portada";

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

        win.postMessage({ type: "wizard-live-data", invitation, showCoverOnly }, window.location.origin);
    };

    useEffect(() => {
        const box = frameBoxRef.current;
        if (!box) return;
        // Ignorar mediciones de 0px: la Colección Storytelling tiene una
        // forma de panel distinta a la de siempre (tarjetas de colección en
        // vez del resumen de plantilla elegida), así que cambiar hacia/desde
        // ella reacomoda el panel izquierdo -- durante ese reacomodo el
        // ResizeObserver puede disparar con clientWidth en 0 por un frame.
        // Si aceptáramos ese 0, scale quedaría en 0 (iframe visualmente
        // colapsado a un punto) y como después el contenedor no vuelve a
        // cambiar de tamaño, no hay ningún resize futuro que lo corrija --
        // queda "pegado" invisible hasta que algo fuerza un recálculo (ej.
        // cambiar de pestaña). Ignorando el 0 nunca se llega a ese estado.
        const update = () => {
            if (box.clientWidth === 0) return;
            setScale(box.clientWidth / MOBILE_VIEWPORT_WIDTH);
        };
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
    }, [data, themeConfig, showCoverOnly]); // Necesita dependencias porque sendLiveData lee de data, themeConfig y showCoverOnly

    // El src del iframe (fuerza recarga completa) solo depende de tipo de
    // evento / plantilla / color
    const evento = data.type || "CASAMIENTO";
    const DESIGN_TEMPLATE_TIPOS = new Set([
        "MODERNO", "NEON", "CHIC",
        "EDITORIAL", "ONIX", "JARDINSEDA", "HOLOGRAMA", "CIRCUITO", "CRISTAL3D",
        "CINE", "NORDICO", "RIVIERA", "GOLDENDUSK",
        "SEDA", "PETALOS", "LUZLUNA", "BONVOYAGE",
        "CORPORATE", "GARDENPARTY", "LOFTINDUSTRIAL", "INFANTIL",
        "GUESTPASSVIP", "PRINCESA", "CORONAESCARLATA", "JEWELRYBOX",
        "PASEVIP", "CINEABSTRACTOXV", "ACRYLICPOP", "BOLADEDISCOTECA", "CRYSTAL3D", "FASHIONTAG", "CERAMICAEDITORIAL", "CINEABSTRACTO", "PAPELERIADEHOTELDELUJO", "VINTAGEEDITORIAL",
        "FASHIONLOOKBOOK", "MARMOLYORO", "ATELIERDEPAPEL", "BOTANICAEDITORIAL", "ENCAJECONTEMPORANEO", "LIQUIDGLASS",
    ]);
    const tipo = data.templateTipo && DESIGN_TEMPLATE_TIPOS.has(data.templateTipo) ? data.templateTipo : "ELEGANT";
    const color = themeConfig?.colorPrincipal || "default";

    // Si el usuario ya pasó por un paso anterior que auto-abre la invitación
    // (ej. admin viendo "Tipo de Evento" antes de "Portada") y ahora vuelve a
    // un momento en el que se quiere ver la portada cerrada, no hay forma de
    // "re-cerrarla" en el mismo iframe ya abierto -- el estado de apertura
    // vive adentro del componente de plantilla. Se fuerza una recarga limpia
    // del iframe únicamente en esa transición (false -> true) agregando un
    // parámetro que cambia el src; en la dirección contraria (true -> false)
    // no hace falta: el mismo iframe ya montado se autoabre solita.
    const prevShowCoverOnlyRef = useRef(showCoverOnly);
    const [coverEpoch, setCoverEpoch] = useState(0);
    useEffect(() => {
        if (showCoverOnly && !prevShowCoverOnlyRef.current) {
            setCoverEpoch((e) => e + 1);
        }
        prevShowCoverOnlyRef.current = showCoverOnly;
    }, [showCoverOnly]);

    const previewSrc = `/preview-plantilla?evento=${encodeURIComponent(evento)}&tipo=${tipo}&color=${encodeURIComponent(color)}&ce=${coverEpoch}`;

    useEffect(() => {
        setLoading(true);
    }, [previewSrc]);

    // Enviar datos debounced ante cambios
    useEffect(() => {
        const timeout = setTimeout(sendLiveData, LIVE_DATA_DEBOUNCE_MS);
        return () => clearTimeout(timeout);
    }, [data, themeConfig, showCoverOnly]);

    // Sincronizar scroll cuando cambia de paso
    useEffect(() => {
        const win = iframeRef.current?.contentWindow;
        if (!win || loading) return;

        let section = "hero";
        if (stepLabel === "Portada" || stepLabel === "Plantilla" || stepLabel === "Tipografía") section = "hero";
        if (stepLabel === "Countdown" || stepLabel === "Información Básica") section = "countdown";
        if (stepLabel === "Frase") section = "quote";
        // Storytelling (Guest Pass VIP): Ceremonia y Salón son dos paneles
        // DISTINTOS de un mismo carrusel horizontal, no dos partes de la
        // misma sección -- si ambos pasos apuntaran al mismo id, el preview
        // queda "pegado" mostrando siempre el mismo panel (el primero) sin
        // importar a cuál de los dos pasos se avance. Las plantillas Flat sí
        // muestran Ceremonia dentro de la misma sección que el Salón, así
        // que ahí los dos pasos siguen yendo al mismo lugar.
        if (stepLabel === "Ceremonia / Civil") section = isStorytellingTemplate(data.templateTipo) ? "ceremonia" : "details";
        if (stepLabel === "Detalles del Salón") section = "details";
        if (stepLabel === "Cronograma") section = "schedule";
        if (stepLabel === "Galería" || stepLabel === "Álbum") section = "album";
        if (stepLabel === "Música") section = "music";
        if (stepLabel === "Regalo (CBU)") section = "banco";
        if (stepLabel === "Trivia") section = "quiz";
        if (stepLabel === "Info Adicional") section = "info-adicional";

        win.postMessage({ type: "wizard-scroll-to", section }, window.location.origin);
    }, [stepLabel, loading]);

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
                isolation: "isolate",
                WebkitMaskImage: "-webkit-radial-gradient(white, black)",
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
