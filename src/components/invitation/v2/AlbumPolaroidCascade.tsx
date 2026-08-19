"use client";

import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, Camera } from "lucide-react";
import { DrawLucideIcon } from "@/components/ui/icons/DrawLucideIcon";

interface AlbumPolaroidCascadeProps {
  photos: string[];
  dark?: boolean;
  hideHeader?: boolean;
  // Este estilo es una pila vertical solapada: con cientos de fotos la
  // sección se vuelve interminable. Se recorta a una selección destacada
  // en vez de mostrar el álbum completo (a diferencia de AlbumCarousel).
  maxPhotos?: number;
}

// Rotación y corrimiento horizontal por foto: ciclos fijos (no Math.random en
// render, para no romper la hidratación SSR/cliente) que simulan el desorden
// de una pila de fotos instantáneas apoyadas unas sobre otras.
const ROTATIONS = [-5, 4, -3, 6, -6, 3, -4, 5, -2, 4];
const SHIFTS = [-14, 10, -8, 16, -10, 8, -16, 12, -6, 10];

// Estilo "Cascada de Polaroids": columna única, cada foto con marco blanco
// tipo instantánea, ligeramente rotada y solapando a la anterior con sombra
// en capas para dar sensación de pila física. Sin ningún loop de animación
// (todo transform/opacity vía CSS) -- mismo motivo que AlbumMosaic para no
// repetir el congelamiento del carrusel viejo (commit 82bcaff).
export function AlbumPolaroidCascade({ photos: allPhotos, dark = false, hideHeader = false, maxPhotos = 4 }: AlbumPolaroidCascadeProps) {
  const photos = allPhotos.slice(0, maxPhotos);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenIndex(null);
      if (e.key === "ArrowRight") setOpenIndex((i) => (i === null ? i : (i + 1) % photos.length));
      if (e.key === "ArrowLeft") setOpenIndex((i) => (i === null ? i : (i - 1 + photos.length) % photos.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIndex, photos.length]);

  if (!photos.length) return null;

  const sectionClass = `d-sec album-sec${dark ? " dark" : ""}`;

  return (
    <div className={sectionClass}>
      <style>{`
        div.d-sec > div.cascade-wrap {
          width: 100% !important;
          max-width: 1000px !important;
          margin: 0 auto !important;
        }
        .cascade-stack {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 8px 0 40px;
        }
        .cascade-frame {
          width: 240px;
          background: #faf8f4;
          padding: 9px 9px 30px 9px;
          border-radius: 2px;
          box-shadow:
            0 1px 2px rgba(0,0,0,.25),
            0 10px 18px -6px rgba(0,0,0,.4),
            0 24px 32px -14px rgba(0,0,0,.3);
          cursor: pointer;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          position: relative;
        }
        @media (min-width: 640px) {
          .cascade-frame { width: 290px; }
        }
        .cascade-frame:hover {
          box-shadow:
            0 2px 4px rgba(0,0,0,.3),
            0 16px 26px -6px rgba(0,0,0,.45),
            0 30px 40px -12px rgba(0,0,0,.35);
        }
        .cascade-photo {
          width: 100%;
          aspect-ratio: 1 / 1;
          background-size: cover;
          background-position: center;
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
      <div className="cascade-wrap w-full !max-w-[1000px] mx-auto">
        <div className="cascade-stack">
          {photos.map((url, i) => {
            const rot = ROTATIONS[i % ROTATIONS.length];
            const shift = SHIFTS[i % SHIFTS.length];
            return (
              <div
                key={i}
                className="cascade-frame"
                style={{
                  marginTop: i === 0 ? 0 : "clamp(-100px, -22vw, -70px)",
                  transform: `rotate(${rot}deg) translateX(${shift}px)`,
                  zIndex: i + 1,
                  WebkitTouchCallout: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = `rotate(0deg) translateX(${shift}px) translateY(-6px) scale(1.03)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = `rotate(${rot}deg) translateX(${shift}px)`;
                }}
                role="img"
                aria-label={`Foto ${i + 1}`}
                onClick={() => setOpenIndex(i)}
                onContextMenu={(e) => e.preventDefault()}
              >
                <div className="cascade-photo" style={{ backgroundImage: `url(${url})` }} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox con navegación prev/next */}
      {openIndex !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm cursor-zoom-out"
          onClick={() => setOpenIndex(null)}
          onContextMenu={(e) => e.preventDefault()}
        >
          <button
            className="absolute top-4 right-4 md:top-8 md:right-8 text-white/70 hover:text-white p-2 rounded-full bg-black/50 hover:bg-black/80 transition-all"
            onClick={(e) => {
              e.stopPropagation();
              setOpenIndex(null);
            }}
            aria-label="Cerrar"
          >
            <X className="w-8 h-8" />
          </button>

          {photos.length > 1 && (
            <>
              <button
                className="absolute left-2 md:left-6 text-white/70 hover:text-white p-2 rounded-full bg-black/50 hover:bg-black/80 transition-all cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenIndex((i) => (i === null ? i : (i - 1 + photos.length) % photos.length));
                }}
                aria-label="Foto anterior"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>
              <button
                className="absolute right-2 md:right-6 text-white/70 hover:text-white p-2 rounded-full bg-black/50 hover:bg-black/80 transition-all cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenIndex((i) => (i === null ? i : (i + 1) % photos.length));
                }}
                aria-label="Foto siguiente"
              >
                <ChevronRight className="w-7 h-7" />
              </button>
            </>
          )}

          <img
            src={photos[openIndex]}
            alt={`Foto ampliada ${openIndex + 1} de ${photos.length}`}
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl cursor-default select-none"
            draggable={false}
            style={{ WebkitTouchCallout: "none" }}
            onClick={(e) => e.stopPropagation()}
          />

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-xs tracking-widest">
            {openIndex + 1} / {photos.length}
          </div>
        </div>
      )}
    </div>
  );
}
