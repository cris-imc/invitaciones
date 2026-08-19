"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useDrawIn } from "./useDrawIn";

interface CrownIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

const CROWN_PATH = "M15,65 L15,45 L30,55 L50,20 L70,55 L85,45 L85,65 Z";
const JEWELS: Array<[number, number]> = [
  [15, 45],
  [50, 20],
  [85, 45],
];

// Coronita para XV años, dibujada a mano -- el contorno se "dibuja" con
// stroke-dashoffset y las 3 gemas aparecen con un pequeño delay después,
// todo disparado una vez al entrar en viewport (mismo criterio que RingsIcon).
export function CrownIcon({ size = 72, color = "currentColor", strokeWidth = 3.5, className }: CrownIconProps) {
  const { containerRef, visible } = useDrawIn<HTMLDivElement>();
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);

  useEffect(() => {
    setPathLength(pathRef.current?.getTotalLength() ?? 0);
  }, []);

  const drawStyle: CSSProperties = {
    strokeDasharray: pathLength || undefined,
    strokeDashoffset: pathLength ? (visible ? 0 : pathLength) : undefined,
    transition: "stroke-dashoffset 1.3s cubic-bezier(0.4, 0, 0.2, 1)",
  };

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
      <svg width={size} height={size * 0.8} viewBox="0 0 100 80" fill="none">
        <path
          ref={pathRef}
          d={CROWN_PATH}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          strokeLinecap="round"
          style={drawStyle}
        />
        {JEWELS.map(([cx, cy], i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={4}
            fill={color}
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "scale(1)" : "scale(0)",
              transformOrigin: `${cx}px ${cy}px`,
              transition: `opacity 0.4s ease ${0.9 + i * 0.12}s, transform 0.4s ease ${0.9 + i * 0.12}s`,
            }}
          />
        ))}
      </svg>
    </div>
  );
}
