"use client";

import { useEffect, useRef } from "react";

interface AlbumCarouselProps {
  photos: string[];
  dark?: boolean;
}

export function AlbumCarousel({ photos, dark = false }: AlbumCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isHovered = useRef(false);

  // Multiplicamos las fotos varias veces (x10) para asegurar que el carril tenga 
  // ancho suficiente y jamás llegue a su tope físico derecho en monitores anchos
  // antes de que hagamos el reset.
  const duplicatedPhotos = Array(10).fill(photos).flat();

  const scroll = (dir: "prev" | "next") => {
    const track = trackRef.current;
    if (!track) return;
    const itemWidth = 190 + 12; // width + gap
    track.scrollBy({ left: dir === "next" ? itemWidth * 2 : -itemWidth * 2, behavior: "smooth" });
  };

  useEffect(() => {
    let animationId: number;
    const track = trackRef.current;
    if (!track || photos.length === 0) return;

    let scrollPos = track.scrollLeft;
    const itemWidth = 190 + 12; // 190px width + 12px gap
    const setWidth = itemWidth * photos.length; // Ancho exacto del set original
    
    const step = () => {
      if (!isHovered.current) {
        // If user scrolled manually, sync accumulator
        if (Math.abs(scrollPos - track.scrollLeft) > 2) {
          scrollPos = track.scrollLeft;
        }

        scrollPos += 0.5; // Velocidad smooth
        
        // Loop logic exacto sin saltos perceptibles usando módulo
        if (scrollPos >= setWidth) {
          scrollPos = scrollPos % setWidth; 
          track.scrollLeft = scrollPos; // Ajuste instantáneo invisible
        } else {
          track.scrollLeft = scrollPos;
        }
      } else {
        // Sync accumulator while paused to avoid jump on resume
        scrollPos = track.scrollLeft;
      }
      
      animationId = requestAnimationFrame(step);
    };
    
    animationId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationId);
  }, [photos.length]);

  if (!photos.length) return null;

  const sectionClass = `d-sec${dark ? " dark" : ""}`;

  return (
    <div className={sectionClass}>
      <p className="t-kicker">Álbum</p>
      <h2>Un poco de nuestra historia</h2>
      <div 
        className="album-wrap"
        onMouseEnter={() => (isHovered.current = true)}
        onMouseLeave={() => (isHovered.current = false)}
        onTouchStart={() => (isHovered.current = true)}
        onTouchEnd={() => (isHovered.current = false)}
      >
        <div className="album-track" ref={trackRef}>
          {duplicatedPhotos.map((url, i) => (
            <div
              key={i}
              className="album-item"
              style={{ backgroundImage: `url(${url})` }}
              role="img"
              aria-label={`Foto ${(i % photos.length) + 1}`}
            />
          ))}
        </div>
        <div className="album-nav">
          <button
            className="album-btn"
            type="button"
            onClick={() => scroll("prev")}
            aria-label="Foto anterior"
          >
            ‹
          </button>
          <button
            className="album-btn"
            type="button"
            onClick={() => scroll("next")}
            aria-label="Foto siguiente"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
