"use client";

import { useEffect } from "react";

/**
 * Cuántas miniaturas pueden estar cargadas al mismo tiempo.
 *
 * Cada una es una página de Next entera (con su propio fetch, sus fuentes y
 * sus imágenes), así que lo caro es tenerlas vivas, no listarlas.
 *
 * El tope se cuenta mirando el DOM en cada pasada y no llevando un contador:
 * la versión anterior tenía uno que se decrementaba dos veces por miniatura
 * -- una en el evento `load` y otra en el setTimeout de seguridad, que
 * dispara igual aunque el load ya haya corrido --, así que se iba a negativo
 * y `active < CONCURRENCY` dejaba de limitar nada. Terminaban cargándose
 * todas juntas y el navegador mataba la pestaña.
 */
const VIVAS_MIN = 4;

/**
 * Techo duro, pase lo que pase. El problema original fue justamente que el
 * límite dejó de limitar y se cargaban las 32 juntas hasta que el navegador
 * mataba la pestaña; el tope se adapta, pero nunca por encima de esto.
 */
const VIVAS_TECHO = 8;

/** Cuánto antes de entrar en pantalla se empieza a cargar una miniatura.
 *  A propósito chico: cada portada tiene su efecto de apertura y, si se
 *  precarga con mucha anticipación, el efecto ya se jugó fuera de vista. */
const MARGEN_CARGA_PX = 150;

/** A qué distancia se suelta una que ya cargó. Muy holgado respecto del margen
 *  de carga, para que una miniatura parada justo en el borde no entre en un
 *  ciclo de cargarse y soltarse con cada ajuste chico de scroll. */
const MARGEN_SOLTAR_PX = 1200;

/** Cuánto más lejos tiene que estar una miniatura cargada que una que se
 *  quiere cargar para que valga la pena cambiarlas. Sin este margen, dos
 *  miniaturas casi a la misma distancia se turnarían en cada cuadro de scroll,
 *  descargándose y recargándose sin parar. */
const VENTAJA_MINIMA_PX = 250;

// Un solo componente para todas las miniaturas (no un hook por tarjeta). Usa
// scroll/resize + getBoundingClientRect en vez de IntersectionObserver a
// proposito: es mas facil de razonar y no depende de que el compositor del
// browser dispare callbacks (en algunos entornos de test automatizado
// IntersectionObserver no disparaba aunque el elemento estuviera visible).
export function ModelosLazyLoader() {
  useEffect(() => {
    // "Cargada" se marca a mano y no se deduce de el.src: para soltar una hay
    // que navegarla a about:blank (quitar el atributo no descarga el documento
    // que ya se pintó), y entonces el.src queda con valor -- si el estado
    // saliera de ahí, una miniatura soltada no volvería a cargarse nunca.
    const estaCargada = (el: HTMLIFrameElement) => el.dataset.modeloCargada === "1";

    const revisar = () => {
      // Con la pestaña en segundo plano no se carga ninguna miniatura nueva:
      // cada una es una página entera y no tiene sentido pagar ese tráfico
      // (ni el render en el servidor) por algo que nadie está mirando. Las que
      // ya están cargadas se dejan como están, así al volver está todo puesto.
      if (document.hidden) return;

      const alto = window.innerHeight;
      const centro = alto / 2;
      const todas = Array.from(
        document.querySelectorAll<HTMLIFrameElement>("iframe[data-modelo-iframe]")
      );

      const soltar = (el: HTMLIFrameElement) => {
        delete el.dataset.modeloCargada;
        el.src = "about:blank";
      };
      const distancia = (el: HTMLIFrameElement) => {
        const r = el.getBoundingClientRect();
        return Math.abs(r.top + r.height / 2 - centro);
      };

      // Primero soltar lo que quedó lejos, para hacer lugar en el mismo pase.
      for (const el of todas) {
        if (!estaCargada(el)) continue;
        const r = el.getBoundingClientRect();
        if (r.bottom < -MARGEN_SOLTAR_PX || r.top > alto + MARGEN_SOLTAR_PX) {
          soltar(el);
        }
      }

      // El tope sale de cuántas miniaturas entran de verdad en esta pantalla,
      // no de un número fijo. Con 4 fijas y una grilla de 3 columnas, en
      // escritorio se ven 6 a la vez y dos quedaban oscuras siempre: ninguna
      // estrategia de reciclado arregla un presupuesto más chico que lo que
      // hay a la vista. En un teléfono entran 2 o 3, así que ahí sigue siendo
      // el mínimo de siempre.
      const enPantalla = todas.filter((el) => {
        const r = el.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) return false;
        return r.bottom > 0 && r.top < alto;
      }).length;
      const vivasMax = Math.min(VIVAS_TECHO, Math.max(VIVAS_MIN, enPantalla + 1));

      // El cupo sale de contar el DOM en cada pasada: no hay contador que
      // pueda desincronizarse ni irse a negativo.
      let cupo = vivasMax - todas.filter(estaCargada).length;

      // Las más cercanas al centro primero: son las que se están mirando.
      const candidatas = todas
        .filter((el) => {
          if (estaCargada(el)) return false;
          if (!el.getAttribute("data-modelo-src")) return false;
          const r = el.getBoundingClientRect();
          // Una miniatura sin tamaño no está en pantalla aunque su rect caiga
          // dentro (pasa con las que quedan en un árbol montado pero oculto).
          if (r.width < 2 || r.height < 2) return false;
          return r.bottom > -MARGEN_CARGA_PX && r.top < alto + MARGEN_CARGA_PX;
        })
        .map((el) => {
          const r = el.getBoundingClientRect();
          return { el, dist: Math.abs(r.top + r.height / 2 - centro) };
        })
        .sort((a, b) => a.dist - b.dist);

      // Con el cupo lleno, manda lo que la persona está mirando: se suelta la
      // cargada que haya quedado más lejos para hacerle lugar.
      //
      // Sin esto, en mobile las miniaturas nuevas quedaban oscuras: una sólo
      // se soltaba al alejarse MARGEN_SOLTAR_PX, y en una columna angosta,
      // para cuando la primera llegaba a esa distancia, ya había tres nuevas
      // en pantalla esperando un cupo que no llegaba.
      if (candidatas.length > 0) {
        const cargadas = todas
          .filter(estaCargada)
          .map((el) => ({ el, dist: distancia(el) }))
          .sort((a, b) => b.dist - a.dist); // la más lejana primero

        // `liberadas` es a cuál candidata le tocaría el próximo lugar: la
        // primera ya tiene el que se acaba de hacer, la segunda el siguiente.
        let liberadas = 0;
        while (cupo <= 0 && cargadas.length > 0 && liberadas < candidatas.length) {
          const lejana = cargadas[0];
          const cercana = candidatas[liberadas];
          if (lejana.dist <= cercana.dist + VENTAJA_MINIMA_PX) break;
          soltar(lejana.el);
          cargadas.shift();
          liberadas++;
          cupo++;
        }
      }

      if (cupo <= 0) return;

      for (const { el } of candidatas) {
        if (cupo <= 0) break;
        el.dataset.modeloCargada = "1";
        el.src = el.getAttribute("data-modelo-src")!;
        cupo--;
      }
    };

    revisar();

    // Sin un "ya terminamos, dejar de escuchar": las pestañas de /modelos
    // (ModelosTabs) montan iframes nuevos al cambiar de pestaña, mucho después
    // de que los de la primera hayan terminado de cargar.
    let pendiente = false;
    const alScrollear = () => {
      if (pendiente) return;
      pendiente = true;
      requestAnimationFrame(() => {
        revisar();
        pendiente = false;
      });
    };

    window.addEventListener("scroll", alScrollear, { passive: true });
    window.addEventListener("resize", alScrollear);
    // Al volver a la pestaña hay que revisar de nuevo: mientras estuvo oculta
    // se saltearon todas las pasadas, y puede haber quedado scroll sin atender.
    document.addEventListener("visibilitychange", alScrollear);

    // Las miniaturas de una pestaña recién abierta son iframes que acaban de
    // montarse y, sin scroll de por medio, ningún evento avisa.
    const observador = new MutationObserver(alScrollear);
    observador.observe(document.body, { childList: true, subtree: true });

    return () => {
      observador.disconnect();
      window.removeEventListener("scroll", alScrollear);
      window.removeEventListener("resize", alScrollear);
      document.removeEventListener("visibilitychange", alScrollear);
    };
  }, []);

  return null;
}
