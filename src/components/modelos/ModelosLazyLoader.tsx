"use client";

import { useEffect } from "react";

/**
 * Cuántas miniaturas pueden estar vivas a la vez.
 *
 * Cada una es una página de Next entera adentro de un iframe, así que el
 * límite no es estético: en un teléfono, ocho de estas hacen que Safari se
 * quede sin memoria, mate la pestaña y la recargue sola. Ya pasó una vez (ver
 * el commit "la pestaña de modelos se colgaba") y volvió a pasar.
 *
 * En el teléfono el techo es más bajo que en escritorio: no por la pantalla
 * sino por el presupuesto de memoria, que es mucho más chico.
 *
 * Cuatro y no menos porque en un teléfono entran cuatro miniaturas en
 * pantalla: con un techo más bajo, las que sobran quedan en NEGRO a la vista,
 * que es peor que el problema que se quiere evitar. Lo que descomprime la
 * memoria no es bajar este número sino no cargar un Google Maps por miniatura
 * (ver `miniatura=1` en la página de preview).
 */
const VIVAS_TELEFONO = 4;
const VIVAS_ESCRITORIO = 8;
const ANCHO_TELEFONO = 768;

/**
 * Cuántas pueden estar CARGANDO a la vez. Distinto del techo de vivas: ese
 * acota la memoria, este acota las conexiones.
 *
 * Los navegadores abren como mucho ~6 conexiones por dominio. Ocho páginas
 * arrancando juntas se pisan entre ellas, se encolan y varias se quedan a
 * medio cargar -- "cargan de a 8 y no se cargan todas". De a dos, cada una
 * termina rápido y las demás entran enseguida.
 */
const CARGANDO_MAX = 2;

/** Cuánto antes de entrar en pantalla se empieza a cargar una miniatura. */
const MARGEN_CARGA_PX = 300;

/**
 * A qué distancia se suelta una que ya cargó. Bien holgado respecto del margen
 * de carga: si los dos números estuvieran cerca, una miniatura parada justo en
 * el borde entraría en un ciclo de cargarse y soltarse con cada ajuste chico
 * de scroll.
 */
const MARGEN_SOLTAR_PX = 1200;

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

    /**
     * La distancia de una miniatura al viewport: 0 si se ve aunque sea en
     * parte, y si no, cuántos píxeles falta scrollear para alcanzarla.
     *
     * Se mide contra el VIEWPORT y no contra su centro, y esa es la
     * corrección que hace que esto funcione. Con la distancia al centro, una
     * miniatura que se ve abajo de todo y otra que está fuera de pantalla dan
     * números parecidos; el intercambio pedía además una "ventaja mínima" que
     * casi nunca se daba, el cupo quedaba trabado y varias miniaturas no
     * cargaban NUNCA -- se quedaban en negro para siempre. Con esta medida,
     * todo lo visible vale 0 y nunca lo desaloja algo que no se ve.
     */
    const distancia = (el: HTMLIFrameElement): number => {
      const r = el.getBoundingClientRect();
      const alto = window.innerHeight;
      if (r.bottom < 0) return -r.bottom;
      if (r.top > alto) return r.top - alto;
      return 0;
    };

    /** Una miniatura sin tamaño no está en pantalla aunque su rect caiga
     *  dentro: pasa con las que quedan en un árbol montado pero oculto (la
     *  pestaña que no está activa). */
    const tieneTamano = (el: HTMLIFrameElement) => {
      const r = el.getBoundingClientRect();
      return r.width >= 2 && r.height >= 2;
    };

    const estaCargando = (el: HTMLIFrameElement) => el.dataset.modeloCargando === "1";

    const cargar = (el: HTMLIFrameElement) => {
      el.dataset.modeloCargada = "1";
      el.dataset.modeloCargando = "1";
      // El `load` avisa que terminó y libera el lugar para la siguiente. El
      // temporizador es la red de seguridad: si la carga muere sin disparar
      // `load`, sin él ese lugar quedaría ocupado para siempre y no cargaría
      // ninguna más.
      const listo = () => {
        delete el.dataset.modeloCargando;
        el.removeEventListener("load", listo);
        window.clearTimeout(guardia);
        alScrollear();
      };
      const guardia = window.setTimeout(listo, 8000);
      el.addEventListener("load", listo);
      el.src = el.getAttribute("data-modelo-src")!;
    };

    const soltar = (el: HTMLIFrameElement) => {
      delete el.dataset.modeloCargada;
      delete el.dataset.modeloCargando;
      // Navegar a about:blank y no quitar el atributo: sacar el src no
      // descarga el documento que ya se pintó, y es justamente la memoria que
      // hay que devolver.
      el.src = "about:blank";
    };

    const revisar = () => {
      // Con la pestaña del navegador en segundo plano no se carga nada nuevo:
      // cada miniatura es una página entera y no tiene sentido pagar esa
      // memoria por algo que nadie está mirando.
      if (document.hidden) return;

      const todas = Array.from(
        document.querySelectorAll<HTMLIFrameElement>("iframe[data-modelo-iframe]")
      ).filter((el) => el.getAttribute("data-modelo-src"));

      const vivasMax =
        window.innerWidth < ANCHO_TELEFONO ? VIVAS_TELEFONO : VIVAS_ESCRITORIO;

      // 1. Soltar lo que quedó lejos o lo que dejó de tener tamaño (cambio de
      //    pestaña): libera memoria y hace lugar en la misma pasada.
      for (const el of todas) {
        if (!estaCargada(el)) continue;
        if (!tieneTamano(el) || distancia(el) > MARGEN_SOLTAR_PX) soltar(el);
      }

      // 2. Las que deberían estar cargadas, de la más cercana a la más lejana.
      const candidatas = todas
        .filter((el) => !estaCargada(el) && tieneTamano(el) && distancia(el) <= MARGEN_CARGA_PX)
        .sort((a, b) => distancia(a) - distancia(b));

      if (candidatas.length === 0) return;

      // Cuántos lugares de carga hay libres ahora mismo.
      let enVuelo = todas.filter(estaCargando).length;
      if (enVuelo >= CARGANDO_MAX) return;

      // 3. Cargarlas, haciendo lugar si el cupo está lleno.
      //
      //    Acá estaba el bloqueo viejo: para desalojar una cargada se le
      //    exigía superar a la candidata por un margen extra, y como se medía
      //    al centro de la pantalla esa diferencia casi nunca aparecía. Ahora
      //    alcanza con que la cargada esté ESTRICTAMENTE más lejos: como todo
      //    lo visible mide 0, una miniatura a la vista jamás es desalojada por
      //    otra que no se ve, y el ciclo de cargar/soltar no puede armarse.
      for (const candidata of candidatas) {
        const cargadas = todas
          .filter(estaCargada)
          .sort((a, b) => distancia(b) - distancia(a)); // la más lejana primero

        if (enVuelo >= CARGANDO_MAX) break;

        if (cargadas.length >= vivasMax) {
          // No se desaloja algo que todavía está cargando: sería tirar a la
          // basura una descarga a medio hacer y volver a empezarla.
          const lejana = cargadas.find((el) => !estaCargando(el));
          if (!lejana || distancia(lejana) <= distancia(candidata)) break;
          soltar(lejana);
        }
        cargar(candidata);
        enVuelo++;
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
