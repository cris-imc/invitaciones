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
    const getHeight = () =>
      typeof window !== "undefined" && window.visualViewport
        ? window.visualViewport.height
        : window.innerHeight;

    let lastApplied = -1;
    const setVh = () => {
      const h = getHeight();
      if (h !== lastApplied) {
        document.documentElement.style.setProperty("--vh", `${h * 0.01}px`);
        lastApplied = h;
      }
      return h;
    };

    setVh();

    // Sondeo de fondo, independiente de cualquier evento -- la red de
    // seguridad real para navegadores que no avisan nada.
    const backgroundPoll = setInterval(setVh, 1500);

    // Listeners "normales", para reaccionar mas rapido donde sí funcionan.
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") setVh();
    };
    window.addEventListener("resize", setVh);
    window.addEventListener("orientationchange", setVh);
    window.addEventListener("pageshow", setVh);
    window.addEventListener("focus", setVh);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.visualViewport?.addEventListener("resize", setVh);
    window.visualViewport?.addEventListener("scroll", setVh);

    return () => {
      clearInterval(backgroundPoll);
      window.removeEventListener("resize", setVh);
      window.removeEventListener("orientationchange", setVh);
      window.removeEventListener("pageshow", setVh);
      window.removeEventListener("focus", setVh);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.visualViewport?.removeEventListener("resize", setVh);
      window.visualViewport?.removeEventListener("scroll", setVh);
    };
  }, []);

  return null;
}
