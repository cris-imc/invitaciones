"use client";

import { useEffect, useRef, useState } from "react";
import { X, Camera } from "lucide-react";
import { DrawLucideIcon } from "@/components/ui/icons/DrawLucideIcon";

interface AlbumCarouselProps {
  photos: string[];
  dark?: boolean;
  hideHeader?: boolean;
}

export function AlbumCarousel({ photos, dark = false, hideHeader = false }: AlbumCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const isHovered = useRef(false);
  const isVisible = useRef(false);
  const [expandedPhoto, setExpandedPhoto] = useState<string | null>(null);

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
    
    let isManualScrolling = false;
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      // Si el scroll coincide exactamente con nuestra posición animada (margen de 2px por redondeos del navegador),
      // significa que fue el scroll programático y lo ignoramos.
      if (Math.abs(track.scrollLeft - scrollPos) <= 2) {
        return;
      }
      
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
      ? new IntersectionObserver(
          ([entry]) => {
            isVisible.current = entry.isIntersecting;
          },
          { threshold: 0.3 }
        )
      : null;
    if (wrap && observer) observer.observe(wrap);

    const step = () => {
      if (isVisible.current && !isHovered.current && !isManualScrolling) {
        scrollPos += 1; // 1px por frame (entero evita saltos y parpadeos de sub-píxel)
        
        if (scrollPos >= setWidth) {
          scrollPos = scrollPos % setWidth; 
        }
        
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

  if (!photos.length) return null;

  const sectionClass = `d-sec album-sec${dark ? " dark" : ""}`;

  return (
    <div className={sectionClass}>
      <style>{`
        div.d-sec > div.album-wrap {
          width: 100% !important;
          max-width: 1000px !important;
          margin: 0 auto !important;
        }
        @media (max-width: 640px) {
          div.d-sec.album-sec {
            padding-left: 8px !important;
            padding-right: 8px !important;
          }
        }
      `}</style>
      {!hideHeader && (
        <>
          <div className="t-kicker flex justify-center mb-6">
            <DrawLucideIcon icon={Camera} size={46} color="var(--t-acc)" strokeWidth={1.5} />
          </div>
          <p className="t-kicker">Álbum</p>
          <h2>Un poco de nuestra historia</h2>
        </>
      )}
      <div
        ref={wrapRef}
        className="album-wrap w-full !max-w-[1000px] mx-auto"
        onMouseEnter={() => (isHovered.current = true)}
        onMouseLeave={() => (isHovered.current = false)}
        onTouchStart={() => (isHovered.current = true)}
        onTouchEnd={() => (isHovered.current = false)}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="album-track" ref={trackRef}>
          {duplicatedPhotos.map((url, i) => (
            <div
              key={i}
              className="album-item cursor-pointer hover:opacity-90 transition-opacity select-none"
              style={{ backgroundImage: `url(${url})`, WebkitTouchCallout: "none" }}
              role="img"
              aria-label={`Foto ${(i % photos.length) + 1}`}
              onClick={() => setExpandedPhoto(url)}
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

      {/* Lightbox Overlay */}
      {expandedPhoto && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm cursor-zoom-out"
          onClick={() => setExpandedPhoto(null)}
          onContextMenu={(e) => e.preventDefault()}
        >
          <button
            className="absolute top-4 right-4 md:top-8 md:right-8 text-white/70 hover:text-white p-2 rounded-full bg-black/50 hover:bg-black/80 transition-all"
            onClick={(e) => {
              e.stopPropagation();
              setExpandedPhoto(null);
            }}
          >
            <X className="w-8 h-8" />
          </button>

          <img
            src={expandedPhoto}
            alt="Foto ampliada"
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl cursor-default select-none"
            draggable={false}
            style={{ WebkitTouchCallout: "none" }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
