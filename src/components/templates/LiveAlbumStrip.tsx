"use client";

/**
 * LiveAlbumStrip.tsx
 *
 * Reemplaza a <AlbumCarousel> (pensado para las plantillas v2/Flat, con sus
 * propias clases `.album-*`/`.t-kicker` y la variable `--t-acc`) en la hoja
 * "EN VIVO" de la Colección Storytelling -- ese componente no tenía ningún
 * estilo propio para el look de ticket/tiara de esta colección y quedaba
 * visualmente desentonado. Este es autocontenido (sus propios estilos, sin
 * depender de ninguna variable/clase del resto de la app) para poder usarse
 * igual en cualquier plantilla de la colección, clara u oscura.
 */

import { useEffect, useRef, useState } from "react";

interface LiveAlbumStripProps {
  photos: string[];
  // Fondo claro (mosaico del álbum, hairlines finas) u oscuro (tinta) -- las
  // dos variantes de panel que ya usa esta colección.
  tone?: "light" | "dark";
  accentColor: string;
}

export function LiveAlbumStrip({ photos, tone = "light", accentColor }: LiveAlbumStripProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const isHovered = useRef(false);
  const isVisible = useRef(false);
  const [expandedPhoto, setExpandedPhoto] = useState<string | null>(null);

  // Se duplica varias veces para que el carril nunca llegue a su tope físico
  // antes del reset del scroll -- mismo truco que usaba <AlbumCarousel>.
  const duplicatedPhotos = Array(8).fill(photos).flat();

  useEffect(() => {
    let animationId: number;
    const track = trackRef.current;
    if (!track || photos.length === 0) return;

    let scrollPos = track.scrollLeft;
    const itemWidth = 132 + 10;
    const setWidth = itemWidth * photos.length;

    let isManualScrolling = false;
    let scrollTimeout: ReturnType<typeof setTimeout>;

    const handleScroll = () => {
      if (Math.abs(track.scrollLeft - scrollPos) <= 2) return;
      isManualScrolling = true;
      scrollPos = track.scrollLeft;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isManualScrolling = false;
      }, 150);
    };
    track.addEventListener("scroll", handleScroll, { passive: true });

    const wrap = wrapRef.current;
    const observer = wrap
      ? new IntersectionObserver(([entry]) => { isVisible.current = entry.isIntersecting; }, { threshold: 0.3 })
      : null;
    if (wrap && observer) observer.observe(wrap);

    const step = () => {
      if (isVisible.current && !isHovered.current && !isManualScrolling) {
        scrollPos += 0.6;
        if (scrollPos >= setWidth) scrollPos = scrollPos % setWidth;
        track.scrollLeft = scrollPos;
      }
      animationId = requestAnimationFrame(step);
    };
    animationId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationId);
      track.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
      if (wrap && observer) observer.unobserve(wrap);
    };
  }, [photos.length]);

  if (photos.length === 0) return null;

  const isDark = tone === "dark";

  return (
    <div className="lba-wrap">
      <style>{`
        .lba-wrap { position: relative; width: 100%; }
        .lba-track {
          display: flex; gap: 10px; overflow-x: auto; scroll-behavior: auto;
          scrollbar-width: none; -ms-overflow-style: none; padding-bottom: 2px;
        }
        .lba-track::-webkit-scrollbar { display: none; }
        .lba-item {
          flex: 0 0 132px; aspect-ratio: 1; background-size: cover; background-position: center;
          cursor: pointer; -webkit-touch-callout: none; user-select: none;
          border: 1px solid ${isDark ? "rgba(200,200,200,0.14)" : "rgba(20,20,27,0.1)"};
          transition: opacity 160ms ease;
        }
        .lba-item:hover { opacity: 0.85; }
        .lba-lightbox {
          position: fixed; inset: 0; z-index: 200; background: rgba(8,8,11,0.96);
          display: flex; align-items: center; justify-content: center; padding: 24px;
          cursor: zoom-out;
        }
        .lba-lightbox-close {
          position: absolute; top: 20px; right: 20px; width: 36px; height: 36px;
          border-radius: 50%; border: 1px solid ${accentColor}; background: rgba(0,0,0,0.4);
          color: #F4F1EA; font-size: 18px; line-height: 1; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
        }
        .lba-lightbox-img { max-width: 100%; max-height: 88vh; object-fit: contain; cursor: default; }
      `}</style>

      <div
        ref={wrapRef}
        onMouseEnter={() => (isHovered.current = true)}
        onMouseLeave={() => (isHovered.current = false)}
        onTouchStart={() => (isHovered.current = true)}
        onTouchEnd={() => (isHovered.current = false)}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="lba-track" ref={trackRef}>
          {duplicatedPhotos.map((url, i) => (
            <div
              key={i}
              className="lba-item"
              style={{ backgroundImage: `url(${url})` }}
              role="img"
              aria-label={`Foto ${(i % photos.length) + 1}`}
              onClick={() => setExpandedPhoto(url)}
            />
          ))}
        </div>
      </div>

      {expandedPhoto && (
        <div className="lba-lightbox" onClick={() => setExpandedPhoto(null)} onContextMenu={(e) => e.preventDefault()}>
          <button
            type="button"
            className="lba-lightbox-close"
            onClick={(e) => {
              e.stopPropagation();
              setExpandedPhoto(null);
            }}
            aria-label="Cerrar"
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={expandedPhoto}
            alt="Foto ampliada"
            className="lba-lightbox-img"
            draggable={false}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
