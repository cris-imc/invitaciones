"use client";

import { useEffect } from "react";

// El custom element <lord-icon> solo se registra una vez por sesión de
// página -- registrarlo de nuevo no rompe nada, pero evitamos el import
// dinámico repetido en cada instancia del componente.
let definePromise: Promise<void> | null = null;

function ensureDefined() {
  if (typeof window === "undefined") return;
  if (!definePromise) {
    definePromise = import("@lordicon/element").then(({ defineElement }) => defineElement());
  }
}

interface LordIconProps {
  /** Ruta al .json del ícono, self-hosteado en /public (ver /lordicon/*.json). */
  src: string;
  /** Ver README de @lordicon/element -- "in" (aparece en viewport) es el
   * default acá porque es el único que tiene sentido en mobile (sin hover). */
  trigger?: "in" | "click" | "hover" | "loop" | "loop-on-hover" | "morph" | "boomerang" | "sequence";
  /** Formato "primary:#hex,secondary:#hex" -- para adaptar el color de marca
   * de cada familia/variante en vez del color fijo con que se exportó el ícono. */
  colors?: string;
  size?: number;
  className?: string;
}

export function LordIcon({ src, trigger = "in", colors, size = 28, className }: LordIconProps) {
  useEffect(() => {
    ensureDefined();
  }, []);

  return (
    <lord-icon
      src={src}
      trigger={trigger}
      colors={colors}
      className={className}
      style={{ width: size, height: size, display: "inline-block" }}
    />
  );
}
