"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  MODERNO_COMPONENTS,
  ELEGANT_COMPONENTS,
  NEON_COMPONENTS,
  CHIC_COMPONENTS,
  EDITORIAL_COMPONENTS,
  ONIX_COMPONENTS,
  JARDINSEDA_COMPONENTS,
  HOLOGRAMA_COMPONENTS,
  CIRCUITO_COMPONENTS,
  CRISTAL3D_COMPONENTS,
  CINE_COMPONENTS,
  NORDICO_COMPONENTS,
  RIVIERA_COMPONENTS,
  GOLDENDUSK_COMPONENTS,
  SEDA_COMPONENTS,
  PETALOS_COMPONENTS,
  LUZLUNA_COMPONENTS,
  BONVOYAGE_COMPONENTS,
  CORPORATE_COMPONENTS,
  GARDENPARTY_COMPONENTS,
  LOFTINDUSTRIAL_COMPONENTS,
  INFANTIL_COMPONENTS,
  PreviewLoading,
  type TemplateTipo,
} from "@/components/wizard/template-preview-registry";
import { getTemplatePreviewSample } from "@/lib/template-preview-samples";

const COMPONENTS_BY_TIPO: Record<TemplateTipo, typeof ELEGANT_COMPONENTS> = {
  ELEGANT: ELEGANT_COMPONENTS,
  MODERNO: MODERNO_COMPONENTS,
  NEON: NEON_COMPONENTS,
  CHIC: CHIC_COMPONENTS,
  EDITORIAL: EDITORIAL_COMPONENTS,
  ONIX: ONIX_COMPONENTS,
  JARDINSEDA: JARDINSEDA_COMPONENTS,
  HOLOGRAMA: HOLOGRAMA_COMPONENTS,
  CIRCUITO: CIRCUITO_COMPONENTS,
  CRISTAL3D: CRISTAL3D_COMPONENTS,
  CINE: CINE_COMPONENTS,
  NORDICO: NORDICO_COMPONENTS,
  RIVIERA: RIVIERA_COMPONENTS,
  GOLDENDUSK: GOLDENDUSK_COMPONENTS,
  SEDA: SEDA_COMPONENTS,
  PETALOS: PETALOS_COMPONENTS,
  LUZLUNA: LUZLUNA_COMPONENTS,
  BONVOYAGE: BONVOYAGE_COMPONENTS,
  CORPORATE: CORPORATE_COMPONENTS,
  GARDENPARTY: GARDENPARTY_COMPONENTS,
  LOFTINDUSTRIAL: LOFTINDUSTRIAL_COMPONENTS,
  INFANTIL: INFANTIL_COMPONENTS,
};

const DESIGN_TEMPLATE_TIPOS = new Set<string>(Object.keys(COMPONENTS_BY_TIPO));

// Página standalone, sin layout de dashboard/auth: se carga dentro de un
// <iframe> desde el wizard para que las media queries de la plantilla
// evalúen contra el viewport angosto del iframe (mobile real), en vez del
// viewport ancho del navegador del que la abre.
function PreviewPlantillaContent() {
  const params = useSearchParams();
  const evento = params.get("evento") ?? "CASAMIENTO";
  const tipoParam = params.get("tipo");
  const tipo: TemplateTipo = (tipoParam && DESIGN_TEMPLATE_TIPOS.has(tipoParam)) ? (tipoParam as TemplateTipo) : "ELEGANT";
  const color = params.get("color") ?? "default";
  // El showcase de la landing (a diferencia del preview del wizard) quiere
  // poder hacer scroll para mostrar más contenido de la plantilla en vez de
  // quedarse fijo en la portada.
  const scrollable = params.get("scroll") === "1";

  const componentsMap = COMPONENTS_BY_TIPO[tipo];
  const Template = componentsMap[color] ?? componentsMap.default;
  const sample = getTemplatePreviewSample(evento, tipo, color);

  // Corrección 1 (docs/correcciones.md): cuando este iframe se usa desde el
  // wizard (WizardLivePreview.tsx), el padre empuja los datos reales que el
  // usuario va cargando via postMessage. Mientras no llegó nada, se sigue
  // mostrando la muestra fija (para no verse vacío antes del primer mensaje,
  // ej. cuando se usa como TemplateShowcase/TemplatePreviewModal sin nunca
  // mandar datos en vivo).
  const [liveInvitation, setLiveInvitation] = useState<Record<string, unknown> | null>(null);
  const [pendingScrollId, setPendingScrollId] = useState<string | null>(null);
  // Contador para invalidar el fallback de scroll (ver más abajo) si llega
  // un wizard-scroll-to más nuevo antes de que se cumplan los 700ms.
  const scrollFallbackToken = useRef(0);

  useEffect(() => {
    // Mismo orden que las secciones van apareciendo a medida que se avanza
    // en el wizard (ver el mapeo stepLabel->section en WizardLivePreview.tsx).
    // Se usa como ruta de fallback: si la sección pedida no existe en este
    // preview puntual (Cronograma vacío, Música deshabilitada, Regalo/Quiz
    // apagados, etc.), no tiene sentido saltar directo al final de la
    // página -- eso se siente como "se rompió" cuando en realidad solo
    // faltan datos para esa sección puntual. En vez de eso, se busca la
    // PRÓXIMA sección real que sí exista, siguiendo el orden del wizard, y
    // recién si no queda ninguna más adelante se cae al final de la página.
    const SECTION_ORDER = ["hero", "countdown", "quote", "details", "schedule", "album", "music", "banco", "quiz"];

    const scrollToElement = (element: HTMLElement) => {
        const top = element.getBoundingClientRect().top + window.pageYOffset - window.innerHeight / 4;
        window.scrollTo({ top: top > 0 ? top : 0, behavior: "smooth" });
    };

    const onMessage = (event: MessageEvent) => {
      if (event.source !== window.parent) return;
      if (event.data?.type === "wizard-live-data") {
          (window as any).__debugLastReceived = event.data.invitation;
          setLiveInvitation(event.data.invitation ?? {});
      } else if (event.data?.type === "wizard-scroll-to") {
          const sectionId = event.data.section;
          if (!sectionId) return;

          if (sectionId === 'hero') {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setPendingScrollId(null);
              scrollFallbackToken.current += 1;
              return;
          }
          const element = document.getElementById(sectionId);
          if (element) {
              scrollToElement(element);
              setPendingScrollId(null);
              scrollFallbackToken.current += 1;
          } else {
              // OJO: pendingScrollId queda "pegado" en sectionId a propósito
              // (no se limpia después del fallback de 700ms) -- el usuario
              // suele tardar bastante más que eso en cargar el primer dato
              // de la sección (ej. el primer ítem del cronograma, la primera
              // foto de galería). El efecto de abajo (dependiente de
              // liveInvitation) sigue reintentando getElementById cada vez
              // que llega data nueva, así que apenas la sección real
              // aparece en el DOM, el preview salta ahí solo -- aunque
              // hayan pasado varios segundos y ya se haya usado el fallback
              // de abajo como ubicación provisoria mientras tanto.
              setPendingScrollId(sectionId);
              // Si en 700ms el elemento sigue sin aparecer, mientras se
              // sigue esperando la sección real, mostramos algo razonable
              // en el medio tiempo: la próxima sección que sí exista (ver
              // SECTION_ORDER arriba) en vez de quedarse clavado o saltar
              // directo al final.
              const myToken = ++scrollFallbackToken.current;
              setTimeout(() => {
                  if (scrollFallbackToken.current !== myToken) return; // llegó un scroll-to más nuevo mientras tanto
                  if (document.getElementById(sectionId)) return; // apareció justo a tiempo

                  const idx = SECTION_ORDER.indexOf(sectionId);
                  let nextElement: HTMLElement | null = null;
                  if (idx !== -1) {
                      for (let i = idx + 1; i < SECTION_ORDER.length; i++) {
                          const el = document.getElementById(SECTION_ORDER[i]);
                          if (el) { nextElement = el; break; }
                      }
                  }
                  if (nextElement) {
                      scrollToElement(nextElement);
                  } else {
                      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
                  }
              }, 700);
          }
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Si recibimos datos nuevos y hay un scroll pendiente (ej. usuario acaba de habilitar galería)
  // intentamos hacer el scroll si el elemento ya existe en el DOM.
  useEffect(() => {
    if (pendingScrollId) {
      const element = document.getElementById(pendingScrollId);
      if (element) {
        const top = element.getBoundingClientRect().top + window.pageYOffset - window.innerHeight / 4;
        window.scrollTo({ top: top > 0 ? top : 0, behavior: "smooth" });
        setPendingScrollId(null);
      }
    }
  }, [liveInvitation, pendingScrollId]);

  // Solo pisa los campos que ya llegaron con un valor real -- así, por
  // ejemplo, antes de llegar al paso "Información Básica" la fecha sigue
  // siendo la de la muestra en vez de quedar vacía.
  if (typeof window !== "undefined") (window as any).__debugLiveInvitationState = liveInvitation;
  const displayInvitation = liveInvitation
    ? {
        ...sample,
        // En modo wizard nunca usar las fotos del sample — solo las reales
        // que el usuario subió. Esto evita que el usuario vea fotos de ejemplo
        // que no subió él. Si no hay fotos todavía, la sección no se muestra.
        galeriaPrincipalFotos: "[]",
        galeriaPrincipalHabilitada: false,
        portadaImagenFondo: undefined,
        portadaImagenFondoDesktop: undefined,
        ...Object.fromEntries(
          Object.entries(liveInvitation).filter(([key, v]) => {
            if (v === undefined || v === null || v === "") return false;
            // Para el album: solo pisar si el user realmente subió fotos
            if (key === "galeriaPrincipalFotos") {
              if (v === "[]") return false;
              if (Array.isArray(v) && v.length === 0) return false;
              // Ignorar si son fotos de mockup
              if (typeof v === 'string' && v.includes('/mockup-preview/')) return false;
            }
            // Para arrays genéricos vacíos (excepto galería ya manejada arriba)
            if (Array.isArray(v) && v.length === 0) return false;
            // Ignorar fotos de mockup en cualquier campo
            if (typeof v === 'string' && v.includes('/mockup-preview/')) return false;
            return true;
          })
        ),
      }
    : sample;
    
  displayInvitation.isPreviewMode = true;

  // Salta la portada de bienvenida ("Abrir invitación") y recién ahí avisa
  // al padre (el modal del wizard) que ya se puede mostrar. Sin esto se ve
  // un flash roto: la portada fixed/z-99999 tapando todo, o el spinner
  // desapareciendo antes de que el componente real termine de montar.
  useEffect(() => {
    if (!scrollable) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    }

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
  }, [evento, tipo, color, scrollable]);

  return <Template invitation={displayInvitation} guest={null} isPersonalized={false} />;
}

export default function PreviewPlantillaPage() {
  return (
    <Suspense fallback={<PreviewLoading />}>
      <PreviewPlantillaContent />
    </Suspense>
  );
}
