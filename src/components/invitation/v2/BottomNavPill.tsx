"use client";

import { useEffect, useRef, useState } from "react";

interface BottomNavPillProps {
  sections: {
    id: string;
    label: string;
    icon: React.ReactNode;
  }[];
}

export function BottomNavPill({ sections }: BottomNavPillProps) {
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

  return (
    <nav
      className="inv-bottom-nav"
      aria-label="Navegación de la invitación"
      role="navigation"
    >
      {sections.map(({ id, label, icon }) => (
        <button
          key={id}
          className={`inv-nav-item ${activeId === id ? "active" : ""}`}
          onClick={() => handleNav(id)}
          aria-label={`Ir a ${label}`}
          aria-current={activeId === id ? "true" : undefined}
          type="button"
        >
          {icon}
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
