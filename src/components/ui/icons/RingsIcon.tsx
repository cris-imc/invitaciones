"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useDrawIn } from "./useDrawIn";

interface RingsIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

// Dos anillos entrelazados, dibujados a mano (sin depender de ningún
// catálogo de terceros) -- se "dibujan" con stroke-dashoffset al entrar en
// viewport, un anillo con un pequeño delay respecto al otro.
export function RingsIcon({ size = 72, color = "currentColor", strokeWidth = 3.5, className }: RingsIconProps) {
  const { containerRef, visible } = useDrawIn<HTMLDivElement>();
  const c1Ref = useRef<SVGCircleElement>(null);
  const c2Ref = useRef<SVGCircleElement>(null);
  const [lengths, setLengths] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    setLengths([c1Ref.current?.getTotalLength() ?? 0, c2Ref.current?.getTotalLength() ?? 0]);
  }, []);

  const drawStyle = (len: number, delay: number): CSSProperties => ({
    strokeDasharray: len || undefined,
    strokeDashoffset: len ? (visible ? 0 : len) : undefined,
    transition: `stroke-dashoffset 1.15s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s`,
  });

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
      <svg width={size} height={size * 0.62} viewBox="0 0 100 62" fill="none">
        <circle
          ref={c1Ref}
          cx="37"
          cy="31"
          r="21"
          stroke={color}
          strokeWidth={strokeWidth}
          style={drawStyle(lengths[0], 0)}
        />
        <circle
          ref={c2Ref}
          cx="63"
          cy="31"
          r="21"
          stroke={color}
          strokeWidth={strokeWidth}
          style={drawStyle(lengths[1], 0.28)}
        />
      </svg>
    </div>
  );
}
