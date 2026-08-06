"use client";

import { useEffect } from "react";

/**
 * Algunos navegadores mobile (ej: Chrome en iOS, que corre sobre WebKit pero
 * con su propio manejo de la barra de herramientas) no recalculan "dvh"
 * de forma confiable cuando la barra se muestra/oculta. Esto guarda el alto
 * real del viewport en la variable CSS --vh, actualizada en resize, para que
 * "calc(var(--vh, 1vh) * 100)" sea un reemplazo de 100dvh que funciona en
 * cualquier navegador.
 */
export function ViewportHeightFix() {
  useEffect(() => {
    const setVh = () => {
      document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
    };
    setVh();
    window.addEventListener("resize", setVh);
    window.addEventListener("orientationchange", setVh);
    return () => {
      window.removeEventListener("resize", setVh);
      window.removeEventListener("orientationchange", setVh);
    };
  }, []);

  return null;
}
