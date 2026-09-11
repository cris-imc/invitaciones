"use client";

import { useEffect } from "react";

/**
 * LO QUE HACE Y LO QUE NO HACE, Y POR QUÉ.
 *
 * Carga cada miniatura cuando se acerca a la pantalla, de a pocas por vez, y
 * NO LA SUELTA NUNCA MÁS. Eso último es la decisión importante de este
 * archivo, y va contra la intuición.
 *
 * La versión original cargaba las 8 miniaturas de una y no las tocaba más, y
 * andaba. Después se intentó "apagar las que no se ven" al scrollear, para
 * poder mostrar más modelos. Eso fue lo que rompió /modelos en el teléfono:
 * cada miniatura es una página de Next entera, y al scrollear se soltaban y
 * recargaban de a varias. Un documento recién soltado no devuelve su memoria
 * al instante, así que en el medio conviven el viejo y el nuevo, y en un
 * teléfono eso alcanza para que el navegador mate la pestaña ("No se puede
 * abrir esta página", "carga un rato, scrolleo y muere").
 *
 * Con 8 modelos por pestaña (MODELOS_POR_PESTANA en app/modelos/page.tsx),
 * apagar no ahorra nada que valga ese riesgo: lo que de verdad pesaba era el
 * Google Maps que cada miniatura embebía, y eso ya no se carga (ver
 * `miniatura=1` en la página de preview). Así que: se carga una vez y queda.
 *
 * Si alguna vez una pestaña tiene muchos más de 8 modelos, la respuesta es
 * paginar la lista, no volver a soltar iframes.
 */

/**
 * Cuántas pueden estar CARGANDO a la vez.
 *
 * Los navegadores abren como mucho ~6 conexiones por dominio. Ocho páginas
 * arrancando juntas se pisan entre ellas, se encolan y varias se quedan a
 * medio cargar -- "cargan de a 8 y no se cargan todas". De a dos, cada una
 * termina rápido y la siguiente entra enseguida.
 */
const CARGANDO_MAX = 2;

/** Cuánto antes de entrar en pantalla se empieza a cargar una miniatura. */
const MARGEN_CARGA_PX = 300;

/**
 * Red de seguridad para el turno de carga: si una miniatura muere sin
 * disparar `load`, su turno se libera igual pasado este tiempo. Sin esto, dos
 * cargas rotas trabarían todas las demás para siempre.
 */
const GUARDIA_CARGA_MS = 8000;

// Un solo componente para todas las miniaturas (no un hook por tarjeta). Usa
// scroll/resize + getBoundingClientRect en vez de IntersectionObserver a
// propósito: es más fácil de razonar y no depende de que el compositor del
// navegador dispare callbacks (en algunos entornos de prueba automatizada
// IntersectionObserver no disparaba aunque el elemento estuviera visible).
export function ModelosLazyLoader() {
  useEffect(() => {
    const estaCargada = (el: HTMLIFrameElement) => el.dataset.modeloCargada === "1";
    const estaCargando = (el: HTMLIFrameElement) => el.dataset.modeloCargando === "1";

    /** Píxeles que faltan scrollear para que se vea; 0 si ya se ve algo. */
    const distancia = (el: HTMLIFrameElement): number => {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0) return -r.bottom;
      if (r.top > window.innerHeight) return r.top - window.innerHeight;
      return 0;
    };

    /** Una miniatura sin tamaño está en una pestaña oculta: no se toca. */
    const tieneTamano = (el: HTMLIFrameElement) => {
      const r = el.getBoundingClientRect();
      return r.width >= 2 && r.height >= 2;
    };

    let pendiente = false;
    const programar = () => {
      if (pendiente) return;
      pendiente = true;
      requestAnimationFrame(() => {
        pendiente = false;
        revisar();
      });
    };

    const cargar = (el: HTMLIFrameElement) => {
      el.dataset.modeloCargada = "1";
      el.dataset.modeloCargando = "1";
      const listo = () => {
        delete el.dataset.modeloCargando;
        el.removeEventListener("load", listo);
        window.clearTimeout(guardia);
        // Terminó una: que entre la siguiente sin esperar a que alguien
        // scrollee.
        programar();
      };
      const guardia = window.setTimeout(listo, GUARDIA_CARGA_MS);
      el.addEventListener("load", listo);
      el.src = el.getAttribute("data-modelo-src")!;
    };

    const revisar = () => {
      // Con la pestaña del navegador en segundo plano no se arranca nada
      // nuevo: cada miniatura es una página entera y no tiene sentido pagar
      // esa memoria por algo que nadie está mirando. Lo ya cargado se queda.
      if (document.hidden) return;

      const todas = Array.from(
        document.querySelectorAll<HTMLIFrameElement>("iframe[data-modelo-iframe]")
      ).filter((el) => el.getAttribute("data-modelo-src"));

      let enVuelo = todas.filter(estaCargando).length;
      if (enVuelo >= CARGANDO_MAX) return;

      // Las que faltan, de la más cercana a la más lejana. Nunca se
      // desaloja nada: acá sólo se suma.
      const candidatas = todas
        .filter((el) => !estaCargada(el) && tieneTamano(el) && distancia(el) <= MARGEN_CARGA_PX)
        .sort((a, b) => distancia(a) - distancia(b));

      for (const candidata of candidatas) {
        if (enVuelo >= CARGANDO_MAX) break;
        cargar(candidata);
        enVuelo++;
      }
    };

    revisar();

    // Sin un "ya terminamos, dejar de escuchar": las pestañas de /modelos
    // (ModelosTabs) montan iframes nuevos al cambiar de pestaña, mucho después
    // de que los de la primera hayan terminado de cargar.
    window.addEventListener("scroll", programar, { passive: true });
    window.addEventListener("resize", programar);
    // Al volver a la pestaña hay que revisar de nuevo: mientras estuvo oculta
    // se saltearon todas las pasadas.
    document.addEventListener("visibilitychange", programar);

    // Las miniaturas de una pestaña recién abierta son iframes que acaban de
    // montarse y, sin scroll de por medio, ningún evento avisa.
    const observador = new MutationObserver(programar);
    observador.observe(document.body, { childList: true, subtree: true });

    return () => {
      observador.disconnect();
      window.removeEventListener("scroll", programar);
      window.removeEventListener("resize", programar);
      document.removeEventListener("visibilitychange", programar);
    };
  }, []);

  return null;
}
