"use client";

import { useEffect } from "react";

// Concurrencia maxima de iframes cargando al mismo tiempo. Con 10
// miniaturas (2 destacadas + 8) el navegador ya podria bancarse todas de
// una, pero cada una es una pagina de Next.js entera (con su propio fetch
// de datos, fuentes, imagenes) -- limitar igual evita que compitan entre si
// y se sientan mas lentas de lo que son.
const CONCURRENCY = 4;
// Cuanto antes de que la miniatura entre en pantalla la empezamos a cargar.
// A propósito chico (no varias pantallas de anticipación): cada miniatura
// tiene su propio efecto de apertura de portada que arranca apenas carga --
// si se precarga demasiado antes, el efecto ya terminó de jugarse fuera de
// vista y el usuario nunca lo ve al llegar scrolleando hasta ahí.
const PRELOAD_MARGIN_PX = 150;
// A que distancia de la pantalla se suelta una miniatura que ya cargo.
//
// Antes no se soltaba ninguna: una vez cargada seguia viva (con su animacion
// de portada corriendo) para el resto de la visita, asi que cuantas mas
// miniaturas se listaran, mas pesaba la pagina -- y de ahi el techo practico
// de 8 por pestaña. Soltando las que quedaron lejos, lo que cuesta deja de
// depender de cuantas haya listadas y pasa a depender solo de cuantas se
// esten viendo.
//
// Es holgado a proposito (bastante mas que el margen de precarga): asi una
// miniatura apenas fuera de vista no se suelta y se recarga en loop mientras
// el visitante hace pequeños ajustes de scroll.
const RELEASE_MARGIN_PX = 1200;

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
        if (src) {
          el.dataset.modeloCargada = "1";
          el.src = src;
        }
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
        const rect = el.getBoundingClientRect();
        const alto = window.innerHeight;

        // Soltar lo que quedo lejos. Hay que navegarlo a about:blank: quitar
        // el atributo src no descarga el documento que ya se pinto. Y hay que
        // sacarlo de `seen`, o al volver a subir nunca se recargaria.
        const lejos = rect.bottom < -RELEASE_MARGIN_PX || rect.top > alto + RELEASE_MARGIN_PX;
        if (lejos) {
          if (el.dataset.modeloCargada === "1") {
            delete el.dataset.modeloCargada;
            seen.delete(el);
            el.src = "about:blank";
          }
          return;
        }

        // `el.src` no sirve para saber si ya cargo, porque una miniatura
        // soltada queda con src="about:blank" -- de ahi la marca propia.
        if (seen.has(el) || el.dataset.modeloCargada === "1") return;
        const nearViewport =
          rect.bottom > -PRELOAD_MARGIN_PX && rect.top < alto + PRELOAD_MARGIN_PX;
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
