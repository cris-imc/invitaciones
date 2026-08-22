"use client";

import { useEffect, useState } from "react";
import { BedDouble, CircleParking, Bus, Info, X, CircleQuestionMark } from "lucide-react";

interface InfoAdicionalSectionProps {
  invitation: {
    infoAdicionalSeccionHabilitada?: boolean;
    infoAlojamientoHabilitado?: boolean;
    infoAlojamientoTexto?: string | null;
    infoEstacionamientoHabilitado?: boolean;
    infoEstacionamientoTexto?: string | null;
    infoTransporteHabilitado?: boolean;
    infoTransporteTexto?: string | null;
    infoAdicionalHabilitado?: boolean;
    infoAdicionalTexto?: string | null;
  };
}

// Botón + modal con datos prácticos configurados por el anfitrión (StepInfoAdicional
// del wizard): alojamiento, estacionamiento, transporte y otros datos sueltos. A
// diferencia del resto de la invitación, el contenido del modal usa tipografía
// simple y legible a propósito (no la fuente ornamental de la plantilla) --
// es información práctica, no parte de la estética de la tarjeta.
export function InfoAdicionalSection({ invitation }: InfoAdicionalSectionProps) {
  const [open, setOpen] = useState(false);

  const items = [
    {
      key: "alojamiento",
      enabled: invitation.infoAlojamientoHabilitado,
      text: invitation.infoAlojamientoTexto,
      icon: BedDouble,
      title: "Alojamiento",
    },
    {
      key: "estacionamiento",
      enabled: invitation.infoEstacionamientoHabilitado,
      text: invitation.infoEstacionamientoTexto,
      icon: CircleParking,
      title: "Estacionamiento",
    },
    {
      key: "transporte",
      enabled: invitation.infoTransporteHabilitado,
      text: invitation.infoTransporteTexto,
      icon: Bus,
      title: "Transporte",
    },
    {
      key: "adicional",
      enabled: invitation.infoAdicionalHabilitado,
      text: invitation.infoAdicionalTexto,
      icon: Info,
      title: "Datos Adicionales",
    },
  ].filter((item) => item.enabled && item.text && item.text.trim());

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Switch maestro (StepInfoAdicional): apaga el botón entero aunque haya
  // secciones individuales con contenido cargado.
  if (!invitation.infoAdicionalSeccionHabilitada) return null;
  if (items.length === 0) return null;

  // Estilo fijo, no depende de las variables de tema de cada plantilla. No
  // alcanza con estilos inline: varias plantillas (ej. LuzLunaTemplate) traen
  // reglas globales tipo ".desktop-stage .tpl h3 { color: ... !important }"
  // o ".tpl button { font-family: ... !important }" que apuntan a CUALQUIER
  // h3/button de la página -- eso le gana a un inline style común, sin
  // importar cuán explícito sea. Por eso estas reglas van en un <style> propio
  // con selector por id (máxima especificidad) + !important: es la única
  // combinación que gana siempre, en las 184 plantillas, sin tener que salir
  // a parchear el CSS de cada una.
  const FONT_STACK = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

  return (
    <div id="info-adicional" style={{ display: "flex", justifyContent: "center", padding: "8px 0 32px" }}>
      <style>{`
        #ia-trigger-btn, #ia-trigger-btn * {
          font-family: ${FONT_STACK} !important;
          color: #fff !important;
        }
        #ia-trigger-btn {
          background: #1a1a1a !important;
          border: none !important;
          border-radius: 999px !important;
        }
        #ia-modal, #ia-modal h3, #ia-modal p, #ia-modal button {
          font-family: ${FONT_STACK} !important;
        }
        #ia-modal { color: #1a1a1a !important; border-radius: 18px !important; }
        #ia-modal .ia-icon-box { border-radius: 10px !important; }
        #ia-modal-title { color: #1a1a1a !important; }
        #ia-modal .ia-item-title { color: #1a1a1a !important; }
        #ia-modal .ia-item-text { color: #333 !important; }
        #ia-modal-close { color: #888 !important; background: none !important; border: none !important; }
      `}</style>
      <button
        id="ia-trigger-btn"
        type="button"
        onClick={() => setOpen(true)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "11px 20px",
          fontSize: "13px",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        <CircleQuestionMark className="w-4 h-4" />
        ¿Qué necesitás saber?
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            id="ia-modal"
            role="dialog"
            aria-modal="true"
            aria-label="¿Qué necesitás saber?"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              width: "100%",
              maxWidth: "480px",
              maxHeight: "85vh",
              overflowY: "auto",
              borderRadius: "18px",
              boxShadow: "0 20px 60px rgba(0,0,0,.4)",
            }}
          >
            <div
              style={{
                position: "sticky",
                top: 0,
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "18px 20px",
                borderBottom: "1px solid #eee",
              }}
            >
              <h3 id="ia-modal-title" style={{ fontSize: "17px", fontWeight: 700, margin: 0 }}>¿Qué necesitás saber?</h3>
              <button
                id="ia-modal-close"
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                style={{ cursor: "pointer", padding: "4px" }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.key} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <div
                      className="ia-icon-box"
                      style={{
                        flexShrink: 0,
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                        background: "#f3f0ea",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#8a6d3b",
                      }}
                    >
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p className="ia-item-title" style={{ fontSize: "14px", fontWeight: 700, margin: "0 0 4px" }}>{item.title}</p>
                      <p className="ia-item-text" style={{ fontSize: "13.5px", lineHeight: 1.55, margin: 0, whiteSpace: "pre-wrap" }}>
                        {item.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
