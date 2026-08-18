"use client";

interface CoverFallbackBgProps {
  photoSrc: string;
  opacity?: number;
}

// Fondo decorativo fijo (sin Ken Burns ni tinte, a diferencia de
// AnimatedCoverPhoto) que se muestra SOLO en mobile cuando la invitación NO
// tiene foto cargada en "Portada de bienvenida" -- se renderiza por encima
// del mesh/glow/doodles de cada plantilla, por debajo del contenido
// (monograma/nombre/dress code/botón). Pedido explícito del usuario: decora
// con la estética propia de la familia+tipo de evento cuando no hay foto
// real, para no dejar el mesh liso de siempre en ese caso, pero sin competir
// nunca con una foto real (por eso solo aplica cuando no hay foto).
export function CoverFallbackBg({ photoSrc, opacity = 0.16 }: CoverFallbackBgProps) {
  return (
    <div
      aria-hidden
      className="cfb-mobile-only"
      style={{
        position: "absolute", inset: 0,
        backgroundImage: `url(${photoSrc})`,
        backgroundSize: "cover", backgroundPosition: "center",
        opacity, pointerEvents: "none",
      }}
    />
  );
}

export const COVER_FALLBACK_STYLE = `
  @media (min-width: 768px) {
    .cfb-mobile-only { display: none; }
  }
`;
