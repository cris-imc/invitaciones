"use client";

import { useEffect } from "react";

/**
 * LO QUE HACE Y LO QUE NO HACE, Y POR QUÉ.
 *
 * Carga TODAS las miniaturas de la pestaña activa apenas abre la página, de
 * a pocas y en orden (primero las más cercanas a la pantalla), y no las
 * suelta nunca más. Lo que NO hace, a propósito, es cargar en respuesta al
 * scroll.
 *
 * Historia, porque cada versión anterior falló en el teléfono de una forma
 * distinta:
 *
 * 1. Cargar las 8 de una: se pisaban entre ellas y varias quedaban a medio
 *    cargar ("cargan de a 8 y no se cargan todas").
 * 2. Cargar cerca de la pantalla y SOLTAR las lejanas: cada miniatura es una
 *    página entera; al scrollear se soltaban y recargaban de a varias, y un
 *    documento recién soltado no devuelve su memoria al instante. El
 *    teléfono mataba la pestaña.
 * 3. Cargar cerca de la pantalla sin soltar: mejor, pero el síntoma que
 *    quedó fue exacto y revelador: bajando despacio la página aguanta (y se
 *    puede cambiar de pestaña); bajando de golpe, muere. O sea, lo que mata
 *    no es cuánto hay cargado sino el PICO: varias miniaturas arrancando a
 *    la vez (HTML + JS + decodificar fotos + primer render) mientras las
 *    demás animan.
 *
 * De ahí esta versión: la carga la gobierna una cola con concurrencia fija,
 * no el dedo. Si la persona scrollea rápido, se encuentra con miniaturas ya
 * cargadas o con recuadros vacíos que se llenan cuando les toca; nunca con
 * ocho arranques simultáneos. La cola arranca por las más cercanas para que
 * lo primero que se ve sea lo primero que carga.
 *
 * Además, las miniaturas que quedan lejos de la pantalla se OCULTAN con
 * `visibility: hidden` -- no se descargan: el documento sigue vivo, la
 * animación sigue corriendo, pero el compositor no mantiene texturas ni
 * dibuja lo que no se ve. Volver a mostrarlas es sólo volver a pintar, sin
 * red ni JS, así que no reproduce el problema de la versión 2.
 */

/**
 * Cuántas pueden estar CARGANDO a la vez. Dos: cada una termina rápido y la
 * siguiente entra enseguida, y el pico de memoria de "arrancar una página"
 * nunca se suma más de dos veces.
 */
const CARGANDO_MAX = 2;

/**
 * A partir de cuántas pantallas de distancia se oculta una miniatura ya
 * cargada. Una y media: lo que está a un scroll normal de distancia sigue
 * pintado, así al aparecer no parpadea.
 */
const OCULTAR_A_PANTALLAS = 1.5;

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

    const todas = () =>
      Array.from(document.querySelectorAll<HTMLIFrameElement>("iframe[data-modelo-iframe]")).filter(
        (el) => el.getAttribute("data-modelo-src")
      );

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
        // Terminó una: que entre la siguiente sin esperar a nada.
        programar();
      };
      const guardia = window.setTimeout(listo, GUARDIA_CARGA_MS);
      el.addEventListener("load", listo);
      el.src = el.getAttribute("data-modelo-src")!;
    };

    /** Oculta lo que quedó lejos y muestra lo que se acercó. Sin red, sin JS. */
    const actualizarVisibilidad = (lista: HTMLIFrameElement[]) => {
      const limite = window.innerHeight * OCULTAR_A_PANTALLAS;
      for (const el of lista) {
        if (!tieneTamano(el)) continue;
        const oculta = distancia(el) > limite;
        const valor = oculta ? "hidden" : "";
        if (el.style.visibility !== valor) el.style.visibility = valor;
      }
    };

    const revisar = () => {
      const lista = todas();
      actualizarVisibilidad(lista);

      // Con la pestaña del navegador en segundo plano no se arranca nada
      // nuevo: cada miniatura es una página entera y no tiene sentido pagar
      // esa memoria por algo que nadie está mirando. Lo ya cargado se queda.
      if (document.hidden) return;

      let enVuelo = lista.filter(estaCargando).length;
      if (enVuelo >= CARGANDO_MAX) return;

      // Todas las que faltan, sin importar la distancia: la cola las va a
      // cargar igual, sólo cambia el orden. De la más cercana a la más
      // lejana. Nunca se desaloja nada: acá sólo se suma.
      const candidatas = lista
        .filter((el) => !estaCargada(el) && tieneTamano(el))
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
    // de que los de la primera hayan terminado de cargar. El scroll ya no
    // dispara cargas (la cola las hace solas), pero sí decide qué se oculta.
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
