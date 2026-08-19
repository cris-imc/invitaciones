"use client";

import { useEffect } from "react";

// Concurrencia maxima de iframes cargando al mismo tiempo. Con 10
// miniaturas (2 destacadas + 8) el navegador ya podria bancarse todas de
// una, pero cada una es una pagina de Next.js entera (con su propio fetch
// de datos, fuentes, imagenes) -- limitar igual evita que compitan entre si
// y se sientan mas lentas de lo que son.
const CONCURRENCY = 4;
// Cuanto antes de que la miniatura entre en pantalla la empezamos a cargar.
const PRELOAD_MARGIN_PX = 600;

// Un solo componente para todas las miniaturas (no un hook por tarjeta). Usa
// scroll/resize + getBoundingClientRect en vez de IntersectionObserver a
// proposito: es mas facil de razonar y no depende de que el compositor del
// browser dispare callbacks (en algunos entornos de test automatizado
// IntersectionObserver no disparaba aunque el elemento estuviera visible).
export function ModelosLazyLoader() {
  useEffect(() => {
    const queue: HTMLIFrameElement[] = [];
    const seen = new Set<HTMLIFrameElement>();
    let active = 0;

    const pump = () => {
      while (active < CONCURRENCY && queue.length > 0) {
        const el = queue.shift()!;
        active++;
        const src = el.getAttribute("data-modelo-src");
        if (src) el.src = src;
        const done = () => {
          active--;
          el.removeEventListener("load", done);
          pump();
        };
        el.addEventListener("load", done);
        // Red de seguridad: si el load nunca dispara (error de red, iframe
        // bloqueado, etc.), no queremos que la cola entera se trabe.
        setTimeout(done, 8000);
      }
    };

    const checkVisible = () => {
      const iframes = document.querySelectorAll<HTMLIFrameElement>("iframe[data-modelo-iframe]");
      iframes.forEach((el) => {
        if (seen.has(el) || el.src) return;
        const rect = el.getBoundingClientRect();
        const nearViewport =
          rect.bottom > -PRELOAD_MARGIN_PX && rect.top < window.innerHeight + PRELOAD_MARGIN_PX;
        if (nearViewport) {
          seen.add(el);
          queue.push(el);
        }
      });
      pump();
    };

    checkVisible();

    // Sin un "ya terminamos, dejar de escuchar" -- las pestañas de
    // /modelos (ModelosTabs) montan iframes nuevos al cambiar de pestaña,
    // mucho después de que los de la primera pestaña ya hayan terminado de
    // cargar. Cortar el listener ahí dejaba las miniaturas de las otras
    // pestañas en negro para siempre (nunca se les asignaba `src`).
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        checkVisible();
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return null;
}
