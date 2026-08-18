"use client";

import { AlbumCarousel } from "./AlbumCarousel";
import { AlbumPolaroidCascade } from "./AlbumPolaroidCascade";

// Componente de álbum unificado con 2 estilos visuales seleccionables desde
// el wizard (StepAlbumStyle) -- mismo patrón que Countdown.tsx con
// CountdownStyleId. Reemplaza el uso directo de <AlbumCarousel> en las
// plantillas (ese componente queda intacto, "carrusel" sigue siendo el
// default).

export type AlbumStyleId = "carrusel" | "solapadas";

interface AlbumProps {
  photos: string[];
  dark?: boolean;
  hideHeader?: boolean;
  albumStyle?: AlbumStyleId;
}

export function Album({ photos, dark = false, hideHeader = false, albumStyle = "carrusel" }: AlbumProps) {
  if (albumStyle === "solapadas") {
    return <AlbumPolaroidCascade photos={photos} dark={dark} hideHeader={hideHeader} />;
  }
  return <AlbumCarousel photos={photos} dark={dark} hideHeader={hideHeader} />;
}
