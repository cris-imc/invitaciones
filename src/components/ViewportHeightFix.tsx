"use client";

import { useEffect } from "react";

/**
 * En Chrome para iOS especificamente (no en Safari, Firefox ni Edge para
 * iOS, aunque los tres corren sobre el mismo WKWebView de Apple) "dvh"
 * puede quedar pegado a un valor viejo después de volver de background o
 * de bloquear la pantalla. Es un bug conocido y confirmado del lado de
 * Chrome (https://issues.chromium.org/issues/40944174), no algo que
 * dependa de esperar el tiempo justo.
 *
 * El problema es que no hay ninguna garantía de que ESCUCHAR el evento
 * correcto alcance: si el bug es tan profundo que ni siquiera
 * window.innerHeight/visualViewport.height se actualizan a tiempo con
 * "resize"/"visibilitychange"/etc. en Chrome-iOS, ningún listener por sí
 * solo lo va a agarrar de forma confiable. Por eso, además de reaccionar
 * a los eventos de siempre (para que responda rápido en los navegadores
 * donde sí funcionan), hay un sondeo de fondo que corre SIEMPRE, sin
 * depender de ningún evento -- así, aunque Chrome-iOS no dispare nada
 * útil, en el peor caso el layout se corrige solo en <=1.5s.
 */
export function ViewportHeightFix() {
  useEffect(() => {
    // Adentro de un iframe hay que usar innerHeight y NO visualViewport: en
    // iOS, visualViewport dentro de un iframe reporta el viewport de la página
    // de arriba, no el del iframe. Como este componente vive en el layout
    // raíz, corre también en /preview-plantilla -- que es lo que embeben el
    // showcase de la landing, las miniaturas de /modelos y la vista previa del
    // wizard --, así que ahí --vh terminaba con la altura del teléfono en vez
    // de la del iframe. Cada sección de Storytelling mide
    // `calc(var(--vh) * 100)`, así que la previsualización quedaba rota en
    // iPhone y bien en Chrome de escritorio (donde visualViewport sí devuelve
    // la altura del iframe).
    //
    // innerHeight dentro de un iframe devuelve la altura del iframe en todos
    // los navegadores, y ahí no hay barra de direcciones ni teclado que
    // compensar: el fix de visualViewport sólo hace falta en la página de
    // arriba.
    let enIframe = false;
    try {
      enIframe = window.self !== window.top;
    } catch {
      // Un iframe de otro origen tira al comparar; si pasa, es un iframe.
      enIframe = true;
    }

    const getHeight = () =>
      typeof window !== "undefined" && window.visualViewport && !enIframe
        ? window.visualViewport.height
        : window.innerHeight;

    // Mientras el usuario está escribiendo (input/textarea/contentEditable
    // con foco), el teclado virtual encoge visualViewport.height -- si eso
    // dispara un recalculo de --vh, cualquier sección con
    // `justify-content: center` (todas las de Storytelling) se recentra
    // dentro de la nueva altura más chica, y el campo recién tocado
    // "salta" de lugar debajo del dedo del usuario (reportado en RSVP al
    // tocar "Restricciones" y al sumar una canción). No es un problema de
    // layout de esas secciones puntuales: es este mismo listener
    // reaccionando al teclado. Se lo ignora puntualmente mientras hay foco
    // en un campo de texto -- el resto de los casos (rotar el dispositivo,
    // volver de background, mostrar/ocultar la barra de direcciones) siguen
    // actualizando igual apenas se saca el foco del campo.
    const isTypingInField = () => {
      const active = document.activeElement as HTMLElement | null;
      if (!active) return false;
      return active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.isContentEditable;
    };

    let lastApplied = -1;
    const setVh = () => {
      const h = getHeight();
      if (h !== lastApplied) {
        document.documentElement.style.setProperty("--vh", `${h * 0.01}px`);
        lastApplied = h;
      }
      return h;
    };
    const setVhUnlessTyping = () => {
      if (!isTypingInField()) setVh();
    };

    setVh();

    // Sondeo de fondo, independiente de cualquier evento -- la red de
    // seguridad real para navegadores que no avisan nada. Se salta mientras
    // se está escribiendo, por el mismo motivo de arriba.
    const backgroundPoll = setInterval(setVhUnlessTyping, 1500);

    // Listeners "normales", para reaccionar mas rapido donde sí funcionan.
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") setVh();
    };
    window.addEventListener("resize", setVh);
    window.addEventListener("orientationchange", setVh);
    window.addEventListener("pageshow", setVh);
    window.addEventListener("focus", setVh);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    // Estos dos SÍ disparan con la apertura/cierre del teclado (por eso
    // usan la variante que lo ignora mientras hay foco en un campo).
    window.visualViewport?.addEventListener("resize", setVhUnlessTyping);
    window.visualViewport?.addEventListener("scroll", setVhUnlessTyping);

    return () => {
      clearInterval(backgroundPoll);
      window.removeEventListener("resize", setVh);
      window.removeEventListener("orientationchange", setVh);
      window.removeEventListener("pageshow", setVh);
      window.removeEventListener("focus", setVh);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.visualViewport?.removeEventListener("resize", setVhUnlessTyping);
      window.visualViewport?.removeEventListener("scroll", setVhUnlessTyping);
    };
  }, []);

  return null;
}
