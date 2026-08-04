"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  MODERNO_COMPONENTS,
  ELEGANT_COMPONENTS,
  PreviewLoading,
  type TemplateTipo,
} from "@/components/wizard/template-preview-registry";
import { getTemplatePreviewSample } from "@/lib/template-preview-samples";

// Página standalone, sin layout de dashboard/auth: se carga dentro de un
// <iframe> desde el wizard para que las media queries de la plantilla
// evalúen contra el viewport angosto del iframe (mobile real), en vez del
// viewport ancho del navegador del que la abre.
function PreviewPlantillaContent() {
  const params = useSearchParams();
  const evento = params.get("evento") ?? "CASAMIENTO";
  const tipo: TemplateTipo = params.get("tipo") === "MODERNO" ? "MODERNO" : "ELEGANT";
  const color = params.get("color") ?? "default";

  const componentsMap = tipo === "MODERNO" ? MODERNO_COMPONENTS : ELEGANT_COMPONENTS;
  const Template = componentsMap[color] ?? componentsMap.default;
  const sample = getTemplatePreviewSample(evento, tipo, color);

  // Salta la portada de bienvenida ("Abrir invitación") y recién ahí avisa
  // al padre (el modal del wizard) que ya se puede mostrar. Sin esto se ve
  // un flash roto: la portada fixed/z-99999 tapando todo, o el spinner
  // desapareciendo antes de que el componente real termine de montar.
  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    let settled = false;
    const notifyReady = () => {
      if (settled) return;
      settled = true;
      window.parent.postMessage({ type: "template-preview-ready" }, window.location.origin);
    };

    const tryOpen = () => {
      const btn = Array.from(document.querySelectorAll("button")).find((b) =>
        /abrir/i.test(b.textContent || "")
      );
      if (!btn) return false;
      btn.click();
      requestAnimationFrame(() => requestAnimationFrame(notifyReady));
      return true;
    };

    if (tryOpen()) return;

    const observer = new MutationObserver(() => {
      if (tryOpen()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Red de seguridad: si nunca aparece un botón "abrir" (plantilla sin
    // portada), no dejar el preview esperando para siempre.
    const timeout = setTimeout(() => {
      observer.disconnect();
      notifyReady();
    }, 4000);

    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, [evento, tipo, color]);

  return <Template invitation={sample} guest={null} isPersonalized={false} />;
}

export default function PreviewPlantillaPage() {
  return (
    <Suspense fallback={<PreviewLoading />}>
      <PreviewPlantillaContent />
    </Suspense>
  );
}
