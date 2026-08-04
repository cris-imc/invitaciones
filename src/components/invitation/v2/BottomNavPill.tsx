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
}

export function BottomNavPill({ sections, variant = "default" }: BottomNavPillProps) {
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
        ? "fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999] flex flex-nowrap overflow-x-auto items-center justify-start sm:justify-center gap-x-3 sm:gap-x-4 px-4 sm:px-6 py-3.5 rounded-[2rem] bg-[#151219]/95 border border-[#C9A876]/20 shadow-xl backdrop-blur-md w-[95%] max-w-max hide-desktop" 
        : "bottom-nav hide-desktop"}
      style={variant === "moderno" ? { scrollbarWidth: 'none', msOverflowStyle: 'none' } : undefined}
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
            ? `font-sans text-[8.5px] sm:text-[10px] font-bold uppercase tracking-[0.1em] sm:tracking-[0.15em] transition-colors whitespace-nowrap ${activeId === id ? "text-[#C9A876]" : "text-[#C9A876]/60 hover:text-[#C9A876]"}`
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
