"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Share2, X } from "lucide-react";
import { LiveItem } from "@prisma/client";
import { shareWatermarkedPhoto } from "@/lib/liveShare";

interface LiveMyPhotosCarouselProps {
  items: LiveItem[];
  acceptanceId: string;
}

// Tira chica y deslizable con SOLO las fotos que subió este invitado (mismo
// dispositivo, identificado por el acceptanceId de sus Términos LIVE -- ver
// page.tsx). A diferencia de LivePhotoGallery (una foto grande a la vez, con
// todas las fotos del evento), acá son varias miniaturas en fila para que el
// invitado ubique rápido lo suyo entre todo lo que se está subiendo en vivo.
export function LiveMyPhotosCarousel({ items, acceptanceId }: LiveMyPhotosCarouselProps) {
  const myPhotos = items.filter((item) => item.type === "PHOTO" && item.acceptanceId === acceptanceId);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [sharing, setSharing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  useEffect(() => {
    if (openIndex !== null && openIndex >= myPhotos.length) {
      setOpenIndex(myPhotos.length > 0 ? myPhotos.length - 1 : null);
    }
  }, [myPhotos.length, openIndex]);

  useEffect(() => {
    if (openIndex === null) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [openIndex]);

  if (myPhotos.length === 0) return null;

  const current = openIndex !== null ? myPhotos[openIndex] : null;

  const handleShare = async () => {
    if (!current) return;
    setShareError(null);
    setSharing(true);
    const errorMsg = await shareWatermarkedPhoto(current.fileUrl);
    if (errorMsg) setShareError(errorMsg);
    setSharing(false);
  };

  return (
    <div className="w-full max-w-sm mx-auto mt-10 px-4">
      <p className="text-xs uppercase tracking-widest text-white/40 mb-3 text-center">Tus fotos</p>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {myPhotos.map((photo, i) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setOpenIndex(i)}
            className="shrink-0 w-24 h-24 rounded-xl overflow-hidden border border-white/10 snap-start"
          >
            <img src={photo.fileUrl} alt="Tu foto" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {current && (
        <div
          className="fixed inset-0 z-[200] bg-black flex flex-col"
          onClick={() => setOpenIndex(null)}
        >
          <div className="flex items-center justify-between p-4 text-white shrink-0">
            <span className="text-xs opacity-60">Tus fotos · {(openIndex ?? 0) + 1} / {myPhotos.length}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenIndex(null);
              }}
              className="p-2 -m-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 relative flex items-center justify-center overflow-hidden min-h-0">
            <img
              key={current.id}
              src={current.fileUrl}
              alt="Tu foto"
              className="max-h-full max-w-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            {myPhotos.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenIndex((i) => (i === null ? i : (i - 1 + myPhotos.length) % myPhotos.length));
                  }}
                  className="absolute left-1 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white"
                >
                  <ChevronLeft className="w-7 h-7" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenIndex((i) => (i === null ? i : (i + 1) % myPhotos.length));
                  }}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white"
                >
                  <ChevronRight className="w-7 h-7" />
                </button>
              </>
            )}
          </div>

          <div className="p-4 pb-6 shrink-0" onClick={(e) => e.stopPropagation()}>
            {shareError && <p className="text-red-400 text-xs text-center mb-2">{shareError}</p>}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleShare();
              }}
              disabled={sharing}
              className="w-full bg-[#C79A4B] text-black font-semibold rounded-full py-3 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {sharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
              {sharing ? "Preparando..." : "Compartir esta foto"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
