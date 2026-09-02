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
  GUESTPASSVIP_COMPONENTS,
  PRINCESA_COMPONENTS,
  CORONAESCARLATA_COMPONENTS,
  JEWELRYBOX_COMPONENTS,
  PASEVIP_COMPONENTS,
  CINEABSTRACTOXV_COMPONENTS,
  ACRYLICPOP_COMPONENTS,
  BOLADEDISCOTECA_COMPONENTS,
  CRYSTAL3D_COMPONENTS,
  FASHIONTAG_COMPONENTS,
  CERAMICAEDITORIAL_COMPONENTS,
  CINEABSTRACTO_COMPONENTS,
  PAPELERIADEHOTELDELUJO_COMPONENTS,
  VINTAGEEDITORIAL_COMPONENTS,
  FASHIONLOOKBOOK_COMPONENTS,
  MARMOLYORO_COMPONENTS,
  ATELIERDEPAPEL_COMPONENTS,
  BOTANICAEDITORIAL_COMPONENTS,
  ENCAJECONTEMPORANEO_COMPONENTS,
  LIQUIDGLASS_COMPONENTS,
  BLACKANDWHITE_COMPONENTS,
  BABYSHOWER_COMPONENTS,
    BAUTISMO_COMPONENTS,
  CORPORATIVOANIVERSARIO_COMPONENTS,
  CORPORATIVOENCUENTRO_COMPONENTS,
  CUMPLEANOSCOCKTAIL_COMPONENTS,
  CUMPLEANOSJARDIN_COMPONENTS,
  CUMPLEANOSTERRAZA_COMPONENTS,
  DESPEDIDASOLTERA_COMPONENTS,
  DESPEDIDASOLTERO_COMPONENTS,
  GRADUACION_COMPONENTS,
  INAUGURACION_COMPONENTS,
  INFANTILESPACIO_COMPONENTS,
  INFANTILJURASICO_COMPONENTS,
  INFANTILSAFARI_COMPONENTS,
  ANIVERSARIO_COMPONENTS,
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
  GUESTPASSVIP: GUESTPASSVIP_COMPONENTS,
  PRINCESA: PRINCESA_COMPONENTS,
  CORONAESCARLATA: CORONAESCARLATA_COMPONENTS,
  JEWELRYBOX: JEWELRYBOX_COMPONENTS,
  PASEVIP: PASEVIP_COMPONENTS,
  CINEABSTRACTOXV: CINEABSTRACTOXV_COMPONENTS,
  ACRYLICPOP: ACRYLICPOP_COMPONENTS,
  BOLADEDISCOTECA: BOLADEDISCOTECA_COMPONENTS,
  CRYSTAL3D: CRYSTAL3D_COMPONENTS,
  FASHIONTAG: FASHIONTAG_COMPONENTS,
  CERAMICAEDITORIAL: CERAMICAEDITORIAL_COMPONENTS,
  CINEABSTRACTO: CINEABSTRACTO_COMPONENTS,
  PAPELERIADEHOTELDELUJO: PAPELERIADEHOTELDELUJO_COMPONENTS,
  VINTAGEEDITORIAL: VINTAGEEDITORIAL_COMPONENTS,
  FASHIONLOOKBOOK: FASHIONLOOKBOOK_COMPONENTS,
  MARMOLYORO: MARMOLYORO_COMPONENTS,
  ATELIERDEPAPEL: ATELIERDEPAPEL_COMPONENTS,
  BOTANICAEDITORIAL: BOTANICAEDITORIAL_COMPONENTS,
  ENCAJECONTEMPORANEO: ENCAJECONTEMPORANEO_COMPONENTS,
  LIQUIDGLASS: LIQUIDGLASS_COMPONENTS,
  BLACKANDWHITE: BLACKANDWHITE_COMPONENTS,
  BABYSHOWER: BABYSHOWER_COMPONENTS,
  BAUTISMO: BAUTISMO_COMPONENTS,
  CORPORATIVOANIVERSARIO: CORPORATIVOANIVERSARIO_COMPONENTS,
  CORPORATIVOENCUENTRO: CORPORATIVOENCUENTRO_COMPONENTS,
  CUMPLEANOSCOCKTAIL: CUMPLEANOSCOCKTAIL_COMPONENTS,
  CUMPLEANOSJARDIN: CUMPLEANOSJARDIN_COMPONENTS,
  CUMPLEANOSTERRAZA: CUMPLEANOSTERRAZA_COMPONENTS,
  DESPEDIDASOLTERA: DESPEDIDASOLTERA_COMPONENTS,
  DESPEDIDASOLTERO: DESPEDIDASOLTERO_COMPONENTS,
  GRADUACION: GRADUACION_COMPONENTS,
  INAUGURACION: INAUGURACION_COMPONENTS,
  INFANTILESPACIO: INFANTILESPACIO_COMPONENTS,
  INFANTILJURASICO: INFANTILJURASICO_COMPONENTS,
  INFANTILSAFARI: INFANTILSAFARI_COMPONENTS,
  ANIVERSARIO: ANIVERSARIO_COMPONENTS,
};

const DESIGN_TEMPLATE_TIPOS = new Set<string>(Object.keys(COMPONENTS_BY_TIPO));

// Las plantillas "storytelling" (Guest Pass VIP, Princesa, Corona Escarlata y
// las que se sumen) no scrollean la ventana/body como el resto -- tienen su
// propio contenedor interno con overflow-y (portada fija encima), marcado con
// el atributo data-scroller="1" (cada una con su propio prefijo de clase --
// .gpv-scroller, .prc-scroller, .cne-scroller -- para no chocar entre sí, por
// eso NO hay que buscar por clase acá). El scroll-to que dispara el wizard al
// cambiar de paso (ver wizard-scroll-to más abajo) tiene que apuntar ahí en
// vez de a `window` cuando ese contenedor existe; para el resto de las
// plantillas (sin ese contenedor) el comportamiento de siempre (scrollear la
// ventana) sigue igual.
function getStorytellingScroller(): HTMLElement | null {
  return document.querySelector<HTMLElement>("[data-scroller]");
}

function scrollToTopWithinPreview() {
  const scroller = getStorytellingScroller();
  if (scroller) {
    scroller.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function scrollToElementWithinPreview(element: HTMLElement) {
  const scroller = getStorytellingScroller();
  if (scroller) {
    // Paneles dentro de un carrusel horizontal pineado (ver [data-pan] en
    // GuestPassVipTemplate.tsx, ej. Ceremonia/Salón dentro de "El lugar"):
    // todos comparten la MISMA posición vertical (solo cambia su X según
    // cuánto se scrollea DENTRO del alto del pan) -- alinear por
    // getBoundingClientRect().top como con una sección normal siempre da el
    // mismo resultado sin importar cuál de los paneles sea el destino, y el
    // preview queda "pegado" en el primero. Hay que calcular el scrollTop
    // que le corresponde a la posición horizontal de ESE panel puntual.
    const pan = element.closest<HTMLElement>("[data-pan]");
    const strip = pan?.querySelector<HTMLElement>("[data-strip]");
    if (pan && strip) {
      const panels = Array.from(strip.children) as HTMLElement[];
      const index = panels.findIndex((p) => p === element || p.contains(element));
      if (index !== -1) {
        const n = panels.length;
        const span = pan.offsetHeight - scroller.clientHeight;
        const progress = n > 1 ? index / (n - 1) : 0;
        const target = pan.offsetTop + Math.max(0, span) * progress;
        scroller.scrollTo({ top: target > 0 ? target : 0, behavior: "smooth" });
        return;
      }
    }
    const scRect = scroller.getBoundingClientRect();
    const elRect = element.getBoundingClientRect();
    const target = scroller.scrollTop + (elRect.top - scRect.top) - scroller.clientHeight / 4;
    scroller.scrollTo({ top: target > 0 ? target : 0, behavior: "smooth" });
    return;
  }
  const top = element.getBoundingClientRect().top + window.pageYOffset - window.innerHeight / 4;
  window.scrollTo({ top: top > 0 ? top : 0, behavior: "smooth" });
}

function scrollToBottomWithinPreview() {
  const scroller = getStorytellingScroller();
  if (scroller) {
    scroller.scrollTo({ top: scroller.scrollHeight, behavior: "smooth" });
    return;
  }
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
}

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
  // Mientras el wizard está en el paso "Portada" (eligiendo las 2 fotos de
  // portada, antes de elegir Plantilla), no hay que autoabrir la invitación
  // -- se queda mostrando la portada de bienvenida con las fotos reales del
  // cliente. Apenas el wizard avanza a "Plantilla" (o más adelante), este
  // flag pasa a false y el efecto de abajo autoabre como siempre.
  const [showCoverOnly, setShowCoverOnly] = useState(false);
  // showCoverOnly arranca en `false` por default, pero recién sabemos su
  // valor REAL cuando llega el primer wizard-live-data del padre -- si se
  // decidiera si autoabrir antes de eso, se autoabriría siempre (con el
  // default) antes de que el flag real (true) llegue, y ya no hay forma de
  // "cerrar de nuevo" la portada. hasFirstContact frena esa decisión hasta
  // tener el dato real, con un fallback corto para los usos de este mismo
  // iframe que nunca reciben nada (showcase de la landing, modal de
  // plantillas) -- ahí se procede con el comportamiento de siempre.
  const [hasFirstContact, setHasFirstContact] = useState(false);
  // Contador para invalidar el fallback de scroll (ver más abajo) si llega
  // un wizard-scroll-to más nuevo antes de que se cumplan los 700ms.
  const scrollFallbackToken = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setHasFirstContact(true), 200);
    return () => clearTimeout(t);
  }, []);

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
    const SECTION_ORDER = ["hero", "countdown", "quote", "ceremonia", "details", "schedule", "album", "music", "banco", "quiz", "info-adicional"];

    const onMessage = (event: MessageEvent) => {
      if (event.source !== window.parent) return;
      if (event.data?.type === "wizard-live-data") {
          setLiveInvitation(event.data.invitation ?? {});
          setShowCoverOnly(Boolean(event.data.showCoverOnly));
          setHasFirstContact(true);
      } else if (event.data?.type === "wizard-scroll-to") {
          const sectionId = event.data.section;
          if (!sectionId) return;

          if (sectionId === 'hero') {
              scrollToTopWithinPreview();
              setPendingScrollId(null);
              scrollFallbackToken.current += 1;
              return;
          }
          const element = document.getElementById(sectionId);
          if (element) {
              scrollToElementWithinPreview(element);
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
                      scrollToElementWithinPreview(nextElement);
                  } else {
                      scrollToBottomWithinPreview();
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
        scrollToElementWithinPreview(element);
        setPendingScrollId(null);
      }
    }
  }, [liveInvitation, pendingScrollId]);

  // Solo pisa los campos que ya llegaron con un valor real -- así, por
  // ejemplo, antes de llegar al paso "Información Básica" la fecha sigue
  // siendo la de la muestra en vez de quedar vacía.
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

  // Avisa de entrada (sin esperar nada) que el iframe ya existe -- es lo que
  // hace que el padre (wizard/modal/showcase) responda con wizard-live-data
  // (con el showCoverOnly real) lo antes posible. Separado a propósito de la
  // decisión de autoabrir de abajo: esa decisión SÍ necesita esperar a
  // conocer el valor real de showCoverOnly (ver hasFirstContact), sin que
  // eso demore que el padre sepa que ya puede mandar datos.
  useEffect(() => {
    window.parent.postMessage({ type: "template-preview-ready" }, window.location.origin);
  }, [evento, tipo, color, scrollable]);

  // Salta la portada de bienvenida ("Abrir invitación") y recién ahí avisa
  // al padre (el modal del wizard) que ya se puede mostrar. Sin esto se ve
  // un flash roto: la portada fixed/z-99999 tapando todo, o el spinner
  // desapareciendo antes de que el componente real termine de montar.
  useEffect(() => {
    if (!hasFirstContact) return;

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

    // Paso "Portada" del wizard: se queda mostrando la portada de bienvenida
    // (con las fotos reales que el cliente ya subió) en vez de autoabrir. No
    // hace falta esperar nada más para avisar que está listo -- la portada
    // ya es lo que se quiere mostrar.
    if (showCoverOnly) {
      notifyReady();
      return;
    }

    let openTimeout: ReturnType<typeof setTimeout> | null = null;
    const tryOpen = () => {
      const btn = Array.from(document.querySelectorAll("button")).find((b) =>
        /abrir/i.test(b.textContent || "")
      );
      if (!btn) return false;
      // La portada ya está montada y es una vista válida para mostrar -- avisar
      // "ready" ya (saca el spinner del modal) en vez de esperar a la apertura.
      notifyReady();
      // Sostener la portada de bienvenida un rato antes de autoabrir, para que
      // se alcance a ver (antes pasaba a la parte superior casi instantáneo).
      openTimeout = setTimeout(() => {
        btn.click();
      }, 3000);
      return true;
    };

    const openedImmediately = tryOpen();

    const observer = new MutationObserver(() => {
      if (tryOpen()) observer.disconnect();
    });
    if (!openedImmediately) {
      observer.observe(document.body, { childList: true, subtree: true });
    }

    // Red de seguridad: si nunca aparece un botón "abrir" (plantilla sin
    // portada), no dejar el preview esperando para siempre.
    const timeout = setTimeout(() => {
      observer.disconnect();
      notifyReady();
    }, 4000);

    return () => {
      if (openTimeout) clearTimeout(openTimeout);
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, [evento, tipo, color, scrollable, showCoverOnly, hasFirstContact]);

  return <Template invitation={displayInvitation} guest={null} isPersonalized={false} />;
}

export default function PreviewPlantillaPage() {
  return (
    <Suspense fallback={<PreviewLoading />}>
      <PreviewPlantillaContent />
    </Suspense>
  );
}
