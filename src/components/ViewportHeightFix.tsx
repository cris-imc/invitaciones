"use client";

import { useEffect } from "react";

/**
 * Algunos navegadores mobile (ej: Chrome en iOS, que corre sobre WebKit pero
 * con su propio manejo de la barra de herramientas) no recalculan "dvh"
 * de forma confiable cuando la barra se muestra/oculta. Esto guarda el alto
 * real del viewport en la variable CSS --vh, actualizada en resize, para que
 * "calc(var(--vh, 1vh) * 100)" sea un reemplazo de 100dvh que funciona en
 * cualquier navegador.
 *
 * "resize"/"orientationchange" no alcanzan solos: al bloquear la pantalla o
 * cambiar de app y volver, el navegador puede restaurar la página con un
 * alto de viewport distinto (la barra de direcciones cambia de estado) sin
 * disparar ninguno de esos dos eventos, dejando --vh desactualizado. Por eso
 * también se recalcula en "pageshow", "focus" y "visibilitychange".
 */
export function ViewportHeightFix() {
  useEffect(() => {
    const setVh = () => {
      document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") setVh();
    };

    setVh();
    window.addEventListener("resize", setVh);
    window.addEventListener("orientationchange", setVh);
    window.addEventListener("pageshow", setVh);
    window.addEventListener("focus", setVh);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("resize", setVh);
      window.removeEventListener("orientationchange", setVh);
      window.removeEventListener("pageshow", setVh);
      window.removeEventListener("focus", setVh);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
}
