"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MODERNO_COLORS,
  ELEGANT_COLORS,
  NEON_COLORS,
  CHIC_COLORS,
  type TemplateTipo,
} from "./template-preview-registry";

export { MODERNO_COLORS, ELEGANT_COLORS, NEON_COLORS, CHIC_COLORS, type TemplateTipo };

const TEMPLATE_TABS: { tipo: TemplateTipo; label: string }[] = [
  { tipo: "ELEGANT", label: "Elegant" },
  { tipo: "MODERNO", label: "Moderno" },
  { tipo: "NEON", label: "Neon" },
  { tipo: "CHIC", label: "Chic" },
];

// Neon ("Doodle Disco 15") solo se ofrece para 15 años y Evento (CUMPLEANOS),
// Chic ("Doodle Wedding") solo para Casamiento -- ver
// docs/PLAN_TEMPLATES_NEON_CHIC.md.
function getAvailableTabs(eventType: string | undefined): { tipo: TemplateTipo; label: string }[] {
  return TEMPLATE_TABS.filter(({ tipo }) => {
    if (tipo === "NEON") return eventType === "QUINCE_ANOS" || eventType === "CUMPLEANOS";
    if (tipo === "CHIC") return eventType === "CASAMIENTO";
    return true;
  });
}

function getColorsForTipo(tipo: TemplateTipo) {
  if (tipo === "MODERNO") return MODERNO_COLORS;
  if (tipo === "NEON") return NEON_COLORS;
  if (tipo === "CHIC") return CHIC_COLORS;
  return ELEGANT_COLORS;
}

// Ancho de un celular real: el iframe siempre se layoutea a este ancho para
// que las tipografías/paddings de la plantilla queden proporcionados como en
// un teléfono de verdad. El marco visible lo escala (zoom-out) para que
// entre en el modal, sin achicar el viewport interno del iframe.
const MOBILE_VIEWPORT_WIDTH = 390;
const MOBILE_ASPECT_RATIO = 19 / 9; // alto / ancho

interface TemplatePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventType: string | undefined;
  initialTemplateTipo: TemplateTipo;
  initialColor: string;
  currentData?: Record<string, any>;
  onConfirm: (templateTipo: TemplateTipo, colorId: string) => void;
}

export function TemplatePreviewModal({
  open,
  onOpenChange,
  eventType,
  initialTemplateTipo,
  initialColor,
  currentData,
  onConfirm,
}: TemplatePreviewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] h-[88vh] p-0 gap-0 flex flex-col overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle>Elegí tu plantilla</DialogTitle>
        </DialogHeader>

        {open && (
          <TemplatePreviewModalBody
            key={`${initialTemplateTipo}:${initialColor}`}
            eventType={eventType}
            initialTemplateTipo={initialTemplateTipo}
            initialColor={initialColor}
            currentData={currentData}
            onOpenChange={onOpenChange}
            onConfirm={onConfirm}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface TemplatePreviewModalBodyProps {
  eventType: string | undefined;
  initialTemplateTipo: TemplateTipo;
  initialColor: string;
  currentData?: Record<string, any>;
  onOpenChange: (open: boolean) => void;
  onConfirm: (templateTipo: TemplateTipo, colorId: string) => void;
}

function TemplatePreviewModalBody({
  eventType,
  initialTemplateTipo,
  initialColor,
  currentData,
  onOpenChange,
  onConfirm,
}: TemplatePreviewModalBodyProps) {
  const [activeTab, setActiveTab] = useState<TemplateTipo>(initialTemplateTipo);
  const [previewColor, setPreviewColor] = useState(initialColor || "default");
  const [previewLoading, setPreviewLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const frameBoxRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // El marco visible (frameBoxRef) puede variar de tamaño según la altura
  // del modal; medimos su ancho real y lo convertimos en un factor de escala
  // para el viewport móvil fijo de 390px, en vez de dejar que el iframe se
  // layoutee a ese ancho variable (eso es lo que hacía ver las tipografías
  // desproporcionadas: 390px real vs. un marco mucho más angosto).
  useEffect(() => {
    const box = frameBoxRef.current;
    if (!box) return;
    const update = () => setScale(box.clientWidth / MOBILE_VIEWPORT_WIDTH);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  // La página en el iframe abre la portada de bienvenida sola y recién ahí
  // avisa que está lista (ver preview-plantilla/page.tsx) — así el spinner
  // no desaparece antes de tiempo mostrando un flash roto.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      if (event.data?.type === "template-preview-ready") {
          setPreviewLoading(false);
          // Si tenemos datos del usuario editando la invitación, se los pasamos a la miniatura
          if (currentData && iframeRef.current?.contentWindow) {
              const invitation = {
                  ...currentData,
                  templateTipo: activeTab,
                  temaColores: JSON.stringify({
                      colorPrincipal: previewColor,
                  }),
                  musicaHabilitada: false,
                  musicaUrl: "",
              };
              iframeRef.current.contentWindow.postMessage(
                  { type: "wizard-live-data", invitation },
                  window.location.origin
              );
          }
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const colors = getColorsForTipo(activeTab);
  const previewSrc = `/preview-plantilla?evento=${encodeURIComponent(eventType ?? "CASAMIENTO")}&tipo=${activeTab}&color=${encodeURIComponent(previewColor)}`;
  const availableTabs = getAvailableTabs(eventType);

  return (
    <>
        <div className="flex gap-2 px-6 pt-4 shrink-0">
          {availableTabs.map(({ tipo, label }) => (
            <button
              key={tipo}
              type="button"
              onClick={() => {
                setActiveTab(tipo);
                setPreviewColor("default");
                setPreviewLoading(true);
              }}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                activeTab === tipo
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-1 min-h-0 mt-4">
          {/* Lista de colores: en mobile, solo las pastillas de color (sin
              nombre) en una grilla angosta, para dejarle más ancho a la
              vista previa del teléfono. En desktop, swatch + nombre. */}
          <div className="w-20 md:w-56 shrink-0 border-r overflow-y-auto px-3 md:px-4 pb-4">
            <div className="flex flex-col gap-3 md:gap-2">
              {colors.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  title={c.name}
                  onClick={() => {
                    setPreviewColor(c.id);
                    setPreviewLoading(true);
                  }}
                  className={cn(
                    "flex items-center justify-center md:justify-start gap-3 rounded-full md:rounded-lg md:border-2 p-1 md:px-3 md:py-2.5 text-left transition-all",
                    previewColor === c.id
                      ? "md:border-primary md:bg-primary/5"
                      : "md:border-border md:hover:border-primary/40"
                  )}
                >
                  <span
                    className={cn(
                      "h-9 w-9 md:h-7 md:w-7 rounded-full shadow-sm shrink-0 transition-all",
                      previewColor === c.id && "ring-2 ring-offset-2 ring-offset-background ring-primary"
                    )}
                    style={{
                      backgroundColor: c.color,
                      border: activeTab === "MODERNO" ? "2px solid #C9A876" : activeTab === "NEON" ? "2px solid #39FFD0" : activeTab === "CHIC" ? "2px solid #C9A876" : "1px solid rgba(0,0,0,.1)",
                    }}
                  />
                  <span className="hidden md:inline text-sm font-medium flex-1">{c.name}</span>
                  {previewColor === c.id && (
                    <Check className="hidden md:block h-4 w-4 text-primary shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Preview real en vivo (misma URL/plantilla que ve el invitado, en
              un iframe para que sus media queries evalúen un ancho mobile
              real y renderice la versión mobile de verdad, tipografías
              incluidas) */}
          <div className="flex-1 min-h-0 flex items-center justify-center bg-neutral-950 p-4 md:p-8">
            <div
              ref={frameBoxRef}
              className="relative h-full max-h-[720px] rounded-[2rem] border-[6px] border-neutral-800 shadow-2xl overflow-hidden bg-black"
              style={{ aspectRatio: `1 / ${MOBILE_ASPECT_RATIO}` }}
            >
              {previewLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/90">
                  <Loader2 className="h-6 w-6 animate-spin text-white/70" />
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
                  title="Vista previa de la plantilla"
                  style={{
                    width: MOBILE_VIEWPORT_WIDTH,
                    height: MOBILE_VIEWPORT_WIDTH * MOBILE_ASPECT_RATIO,
                    border: 0,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end md:justify-between px-6 py-4 border-t shrink-0 bg-background">
          <p className="hidden md:block text-xs text-muted-foreground">
            Vista previa real con contenido de ejemplo. Tus fotos y datos se verán así de organizados.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={() => onConfirm(activeTab, previewColor)}>
              Elegir esta plantilla
            </Button>
          </div>
        </div>
    </>
  );
}
