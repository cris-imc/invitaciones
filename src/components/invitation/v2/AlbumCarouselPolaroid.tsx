"use client";

import { useEffect, useRef, useState } from "react";
import { X, Camera } from "lucide-react";
import { DrawLucideIcon } from "@/components/ui/icons/DrawLucideIcon";

interface AlbumCarouselPolaroidProps {
  photos: string[];
  dark?: boolean;
  hideHeader?: boolean;
}

// Mismo ciclo fijo de rotaciones que AlbumPolaroidCascade.tsx (no
// Math.random en render, para no romper la hidratación SSR/cliente).
const ROTATIONS = [-5, 4, -3, 6, -6, 3, -4, 5, -2, 4];

// Tercer estilo de álbum: el carril horizontal infinito de AlbumCarousel,
// pero cada foto enmarcada como una instantánea Polaroid (borde blanco más
// grueso abajo, leve rotación alternada, sombra en capas) en vez del
// rectángulo liso original. Comparte toda la lógica de auto-scroll/pausa
// con AlbumCarousel -- ver comentarios ahí para el detalle de por qué.
export function AlbumCarouselPolaroid({ photos, dark = false, hideHeader = false }: AlbumCarouselPolaroidProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const isHovered = useRef(false);
  const isVisible = useRef(false);
  const [expandedPhoto, setExpandedPhoto] = useState<string | null>(null);

  const duplicatedPhotos = Array(10).fill(photos).flat();

  const scroll = (dir: "prev" | "next") => {
    const track = trackRef.current;
    if (!track) return;
    const itemWidth = 190 + 14; // width + gap
    track.scrollBy({ left: dir === "next" ? itemWidth * 2 : -itemWidth * 2, behavior: "smooth" });
  };

  useEffect(() => {
    let animationId: number;
    const track = trackRef.current;
    if (!track || photos.length === 0) return;

    let scrollPos = track.scrollLeft;
    const itemWidth = 190 + 14; // 190px width + 14px gap
    const setWidth = itemWidth * photos.length;

    let isManualScrolling = false;
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
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
        scrollPos += 1;

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
        div.d-sec > div.album-polaroid-wrap {
          width: 100% !important;
          max-width: 1000px !important;
          margin: 0 auto !important;
        }
        .album-polaroid-track {
          display: flex;
          gap: 14px;
          overflow-x: auto;
          padding: 10px 4px 14px;
          -webkit-overflow-scrolling: touch;
          touch-action: pan-x;
        }
        .album-polaroid-track::-webkit-scrollbar { display: none; }
        .album-polaroid-slot {
          flex: 0 0 auto;
          width: 190px;
          height: 250px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .album-polaroid-frame {
          width: 172px;
          height: 218px;
          background: #faf8f4;
          padding: 8px 8px 24px 8px;
          border-radius: 3px;
          box-shadow:
            0 1px 2px rgba(0,0,0,.25),
            0 10px 18px -6px rgba(0,0,0,.4),
            0 20px 26px -14px rgba(0,0,0,.3);
          cursor: pointer;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .album-polaroid-frame:hover {
          transform: rotate(0deg) translateY(-5px) scale(1.04) !important;
          box-shadow:
            0 2px 4px rgba(0,0,0,.3),
            0 16px 26px -6px rgba(0,0,0,.45),
            0 26px 34px -12px rgba(0,0,0,.35);
        }
        .album-polaroid-photo {
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
        }
        @media (max-width: 640px) {
          div.d-sec.album-sec { padding-left: 8px !important; padding-right: 8px !important; }
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
        className="album-polaroid-wrap w-full !max-w-[1000px] mx-auto"
        onMouseEnter={() => (isHovered.current = true)}
        onMouseLeave={() => (isHovered.current = false)}
        onTouchStart={() => (isHovered.current = true)}
        onTouchEnd={() => (isHovered.current = false)}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="album-polaroid-track" ref={trackRef}>
          {duplicatedPhotos.map((url, i) => {
            const rot = ROTATIONS[i % ROTATIONS.length];
            return (
              <div key={i} className="album-polaroid-slot">
                <div
                  className="album-polaroid-frame select-none"
                  style={{ transform: `rotate(${rot}deg)`, WebkitTouchCallout: "none" }}
                  role="img"
                  aria-label={`Foto ${(i % photos.length) + 1}`}
                  onClick={() => setExpandedPhoto(url)}
                >
                  <div className="album-polaroid-photo" style={{ backgroundImage: `url(${url})` }} />
                </div>
              </div>
            );
          })}
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
