"use client";

import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { useDrawIn } from "./useDrawIn";

interface DrawLucideIconProps {
  icon: LucideIcon;
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

// Toma cualquier ícono de lucide-react (ya son de buena calidad, ISC/MIT,
// ya es dependencia del proyecto) y le aplica la misma animación de
// "dibujado" que RingsIcon/CrownIcon -- evita inventar path SVG a mano para
// objetos comunes (lápiz, cámara, nota musical) donde lucide ya tiene un
// ícono prolijo.
export function DrawLucideIcon({ icon: Icon, size = 72, color = "currentColor", strokeWidth = 1.5, className }: DrawLucideIconProps) {
  const { containerRef, visible } = useDrawIn<HTMLDivElement>();
  const wrapRef = useRef<HTMLSpanElement>(null);
  const [ready, setReady] = useState(false);

  // Al montar: mide cada forma dibujable del ícono y arranca "escondida"
  // (dashoffset = largo total).
  useEffect(() => {
    const svg = wrapRef.current?.querySelector("svg");
    if (!svg) return;
    const shapes = svg.querySelectorAll<SVGGeometryElement>("path, circle, line, polyline, rect, ellipse");
    shapes.forEach((el) => {
      const len = el.getTotalLength();
      el.style.strokeDasharray = `${len}`;
      el.style.strokeDashoffset = `${len}`;
      el.style.transition = "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)";
    });
    setReady(true);
  }, []);

  // Al hacerse visible: dispara el dibujado, con un pequeño delay
  // escalonado por forma para íconos de más de una pieza (cámara, nota).
  useEffect(() => {
    if (!ready || !visible) return;
    const svg = wrapRef.current?.querySelector("svg");
    if (!svg) return;
    const shapes = svg.querySelectorAll<SVGGeometryElement>("path, circle, line, polyline, rect, ellipse");
    shapes.forEach((el, i) => {
      el.style.transitionDelay = `${i * 0.1}s`;
      el.style.strokeDashoffset = "0";
    });
  }, [visible, ready]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        display: "inline-flex",
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1)" : "scale(0.92)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
      }}
    >
      <span ref={wrapRef} style={{ display: "inline-flex", color }}>
        <Icon size={size} strokeWidth={strokeWidth} />
      </span>
    </div>
  );
}
