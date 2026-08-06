"use client";

import { useEffect } from "react";

/**
 * Algunos navegadores mobile (ej: Chrome en iOS, que corre sobre WebKit pero
 * con su propio manejo de la barra de herramientas) no recalculan "dvh"
 * de forma confiable cuando la barra se muestra/oculta. Esto guarda el alto
 * real del viewport en la variable CSS --vh, para que
 * "calc(var(--vh, 1vh) * 100)" sea un reemplazo de 100dvh que funciona en
 * cualquier navegador.
 *
 * Usa window.visualViewport cuando está disponible: es más preciso que
 * window.innerHeight para esto (pensado justamente para reflejar el área
 * visible real, sin importar la barra del navegador) y tiene sus propios
 * eventos "resize"/"scroll" más confiables que el "resize" genérico de
 * window para este caso.
 *
 * Además de resize/orientationchange/pageshow/focus/visibilitychange (que
 * cubren volver de background luego de bloquear la pantalla o cambiar de
 * app), se vuelve a recalcular con un pequeño delay después de cada evento:
 * en algunos navegadores el valor todavía no está estable en el instante
 * exacto en que el evento se dispara (la barra sigue animando/asentándose).
 */
export function ViewportHeightFix() {
  useEffect(() => {
    const getHeight = () =>
      typeof window !== "undefined" && window.visualViewport
        ? window.visualViewport.height
        : window.innerHeight;

    const setVh = () => {
      document.documentElement.style.setProperty("--vh", `${getHeight() * 0.01}px`);
    };

    const setVhSettled = () => {
      setVh();
      setTimeout(setVh, 120);
      setTimeout(setVh, 400);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") setVhSettled();
    };

    setVh();

    window.addEventListener("resize", setVhSettled);
    window.addEventListener("orientationchange", setVhSettled);
    window.addEventListener("pageshow", setVhSettled);
    window.addEventListener("focus", setVhSettled);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.visualViewport?.addEventListener("resize", setVhSettled);
    window.visualViewport?.addEventListener("scroll", setVh);

    return () => {
      window.removeEventListener("resize", setVhSettled);
      window.removeEventListener("orientationchange", setVhSettled);
      window.removeEventListener("pageshow", setVhSettled);
      window.removeEventListener("focus", setVhSettled);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.visualViewport?.removeEventListener("resize", setVhSettled);
      window.visualViewport?.removeEventListener("scroll", setVh);
    };
  }, []);

  return null;
}
