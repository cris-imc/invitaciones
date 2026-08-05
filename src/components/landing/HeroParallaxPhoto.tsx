"use client";

import { useEffect, useRef } from "react";

// Solo desktop: en mobile la foto se saca del todo (ver page.tsx), así que
// este efecto no necesita correr ahí. La imagen va escalada un poco de más
// para tener margen y que el translate no revele bordes vacíos.
const MAX_SHIFT_PX = 46;
const SPEED = 0.12;

export function HeroParallaxPhoto() {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (window.matchMedia("(max-width: 767px)").matches) return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const img = imgRef.current;
        if (!img) return;
        const shift = Math.min(window.scrollY * SPEED, MAX_SHIFT_PX);
        img.style.transform = `translate3d(0, ${-shift}px, 0) scale(1.15)`;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="hidden md:flex relative md:h-full md:min-h-[400px] md:items-center overflow-visible pointer-events-none md:scale-110 md:origin-right">
      <div className="relative w-full md:w-full md:h-full overflow-hidden">
        <img
          ref={imgRef}
          src="/landing/novios2.jpg"
          alt="Novios"
          className="absolute inset-0 w-full h-full object-cover object-[center_30%] opacity-90"
          style={{ willChange: "transform", transform: "scale(1.15)" }}
        />
        {/* Degradado real (no solo una máscara de transparencia, que contra
            una foto clara casi no se notaba) para que la foto se funda de
            forma visible hacia el fondo oscuro del panel por la izquierda. */}
        <div
          className="absolute inset-0 z-10"
          style={{ background: "linear-gradient(to right, var(--ink) 0%, var(--ink) 12%, transparent 60%)" }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
