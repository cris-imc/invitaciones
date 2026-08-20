"use client";

import { AlbumCarousel } from "./AlbumCarousel";
import { AlbumPolaroidCascade } from "./AlbumPolaroidCascade";

// Componente de álbum unificado con 2 estilos visuales seleccionables desde
// el wizard (StepAlbumStyle) -- mismo patrón que Countdown.tsx con
// CountdownStyleId. Reemplaza el uso directo de <AlbumCarousel> en las
// plantillas (ese componente queda intacto, "carrusel" sigue siendo el
// default).

export type AlbumStyleId = "carrusel" | "solapadas";

// "solapadas" no muestra el álbum completo (selección destacada, ver
// AlbumPolaroidCascade) -- de 5 a 8 fotos se reparten en dos tandas para no
// amontonar demasiadas fotos apiladas juntas: la primera queda en el lugar
// de siempre (dentro de la sección de galería) y la segunda la ubica cada
// plantilla más abajo (después de la confirmación de asistencia, ver
// prop `part`). Con 4 fotos o menos no hay división, se muestran todas
// juntas como antes. Más de 8 se recorta a 8 (sigue siendo una selección
// destacada, no el álbum completo).
export function getAlbumSplitCounts(total: number): { first: number; second: number } {
  const n = Math.min(total, 8);
  if (n <= 4) return { first: n, second: 0 };
  const first = Math.ceil(n / 2);
  return { first, second: n - first };
}

interface AlbumProps {
  photos: string[];
  dark?: boolean;
  hideHeader?: boolean;
  albumStyle?: AlbumStyleId;
  // Solo aplica a "solapadas": qué tanda de la división mostrar en este
  // punto de la plantilla. La plantilla llama a <Album> dos veces cuando
  // hay 5 fotos o más con este estilo: una vez con "first" en el lugar de
  // siempre, y otra con "second" después del RSVP.
  part?: "first" | "second";
}

export function Album({ photos, dark = false, hideHeader = false, albumStyle = "carrusel", part = "first" }: AlbumProps) {
  if (albumStyle === "solapadas") {
    const { first, second } = getAlbumSplitCounts(photos.length);
    if (part === "second") {
      if (second === 0) return null;
      return <AlbumPolaroidCascade photos={photos.slice(first, first + second)} dark={dark} hideHeader={hideHeader} />;
    }
    return <AlbumPolaroidCascade photos={photos.slice(0, first)} dark={dark} hideHeader={hideHeader} />;
  }
  return <AlbumCarousel photos={photos} dark={dark} hideHeader={hideHeader} />;
}
