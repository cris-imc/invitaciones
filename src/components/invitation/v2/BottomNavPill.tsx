"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface BottomNavPillProps {
  sections: {
    id: string;
    label: string;
    icon: React.ReactNode;
  }[];
  variant?: "default" | "moderno";
  // El nav se porta a document.body (ver createPortal abajo), así que queda
  // fuera del árbol DOM del wrapper de la plantilla -- las CSS vars (--t-acc,
  // --t-surface) definidas ahí NO heredan hasta acá. Por eso se pasan como
  // props explícitas en vez de depender de var(--t-acc)/var(--t-surface)
  // heredadas. Los defaults son los colores originales de Moderno.
  accentColor?: string;
  surfaceColor?: string;
  // Color del texto inactivo en variant="moderno" -- default = accentColor
  // (comportamiento previo, sin cambios para el resto de las plantillas).
  // Algunas plantillas (Petalos) tienen una superficie muy clara donde el
  // accent a baja opacidad no contrasta lo suficiente; ahí conviene pisarlo
  // con el ink oscuro de la plantilla.
  inactiveColor?: string;
  // Si true, fondo solido (sin blur ni transparencia) en variant="moderno" --
  // el efecto "liquid glass" default no contrastaba lo suficiente en
  // plantillas como Petalos. Sigue siendo el color de la variante
  // (surfaceColor), simplemente al 100% de opacidad y sin backdrop-blur.
  solid?: boolean;
}

export function BottomNavPill({ sections, variant = "default", accentColor = "#C9A876", surfaceColor = "#151219", inactiveColor, solid = false }: BottomNavPillProps) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "");

  // Observa qué sección está visible y marca el nav activo
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;

      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveId(id);
        },
        { threshold: 0.4 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [sections]);

  const handleNav = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    // Respeta prefers-reduced-motion
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
    setActiveId(id);
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <nav
      className={variant === "moderno"
        ? `fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999] flex flex-nowrap overflow-x-auto items-center justify-start sm:justify-center gap-x-3 sm:gap-x-4 px-4 sm:px-6 py-3.5 rounded-[2rem] border border-[var(--t-acc)]/20 shadow-xl w-[95%] max-w-max hide-desktop ${solid ? "bg-[var(--t-surface)]" : "bg-[var(--t-surface)]/95 backdrop-blur-md"}`
        : "bottom-nav hide-desktop"}
      style={variant === "moderno" ? { scrollbarWidth: 'none', msOverflowStyle: 'none', "--t-acc": accentColor, "--t-surface": surfaceColor, "--t-nav-inactive": inactiveColor ?? accentColor } as React.CSSProperties : undefined}
      aria-label="Navegación de la invitación"
      role="navigation"
    >
      {sections.map(({ id, label, icon }) => (
        <a
          key={id}
          href={`#${id}`}
          onClick={(e) => {
            e.preventDefault();
            handleNav(id);
          }}
          aria-label={`Ir a ${label}`}
          aria-current={activeId === id ? "true" : undefined}
          className={variant === "moderno" 
            ? `font-sans text-[8.5px] sm:text-[10px] font-bold uppercase tracking-[0.1em] sm:tracking-[0.15em] transition-colors whitespace-nowrap ${activeId === id ? "text-[var(--t-acc)]" : "text-[var(--t-nav-inactive)]/75 hover:text-[var(--t-acc)]"}`
            : undefined}
          style={variant !== "moderno" && activeId === id ? { opacity: 1 } : undefined}
        >
          {variant !== "moderno" && <b>{icon}</b>}
          {label}
        </a>
      ))}
    </nav>,
    document.body
  );
}
