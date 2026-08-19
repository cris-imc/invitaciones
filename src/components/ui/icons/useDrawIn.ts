"use client";

import { useEffect, useRef, useState } from "react";

// Dispara `visible=true` una sola vez cuando el contenedor entra en el
// viewport -- mismo criterio que el trigger "in" de Lordicon, para que los
// íconos a medida se comporten igual que el animado de Save the Date.
export function useDrawIn<T extends HTMLElement = HTMLDivElement>() {
  const containerRef = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { containerRef, visible };
}
