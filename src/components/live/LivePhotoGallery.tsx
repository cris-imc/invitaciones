"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Share2, X } from "lucide-react";
import { LiveItem } from "@prisma/client";

const AUTO_ADVANCE_MS = 4000;
const RESUME_AFTER_MANUAL_MS = 6000;
const LOGO_SRC = "/landing/logo-blanco-v2.png";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
    img.src = src;
  });
}

/** Compone la foto + el isologotipo chico (con un scrim degradado abajo para
 * que se lea sobre cualquier foto) en un canvas, y devuelve un File listo
 * para pasarle a navigator.share. */
async function buildWatermarkedFile(photoUrl: string): Promise<File> {
  const [photo, logo] = await Promise.all([loadImage(photoUrl), loadImage(LOGO_SRC)]);

  const canvas = document.createElement("canvas");
  canvas.width = photo.naturalWidth;
  canvas.height = photo.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas no soportado");
  ctx.drawImage(photo, 0, 0);

  const logoWidth = canvas.width * 0.3;
  const logoHeight = logoWidth * (logo.naturalHeight / logo.naturalWidth);
  const marginBottom = canvas.height * 0.035;
  const scrimHeight = logoHeight + marginBottom * 2.4;

  const gradient = ctx.createLinearGradient(0, canvas.height - scrimHeight, 0, canvas.height);
  gradient.addColorStop(0, "rgba(5,8,7,0)");
  gradient.addColorStop(1, "rgba(5,8,7,0.6)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, canvas.height - scrimHeight, canvas.width, scrimHeight);

  ctx.drawImage(logo, (canvas.width - logoWidth) / 2, canvas.height - marginBottom - logoHeight, logoWidth, logoHeight);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("No se pudo generar la imagen"))), "image/jpeg", 0.92);
  });
  return new File([blob], "altainvitacion-momento.jpg", { type: "image/jpeg" });
}

export function LivePhotoGallery({ items }: { items: LiveItem[] }) {
  const photos = items.filter((item) => item.type === "PHOTO");
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const pausedUntilRef = useRef(0);

  // Si llegan fotos nuevas y el índice quedó fuera de rango, lo reacomoda.
  useEffect(() => {
    if (index >= photos.length) setIndex(0);
  }, [photos.length, index]);

  const goTo = useCallback(
    (next: number) => {
      if (photos.length === 0) return;
      setIndex(((next % photos.length) + photos.length) % photos.length);
    },
    [photos.length]
  );

  // Avance automático -- se pausa un rato después de una interacción manual
  // (flechas/tocar), para no pisarle el gesto al invitado.
  useEffect(() => {
    if (photos.length <= 1) return;
    const id = setInterval(() => {
      if (Date.now() < pausedUntilRef.current) return;
      setIndex((prev) => (prev + 1) % photos.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [photos.length]);

  useEffect(() => {
    if (!expanded) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [expanded]);

  const pauseAutoplay = () => {
    pausedUntilRef.current = Date.now() + RESUME_AFTER_MANUAL_MS;
  };

  const handlePrev = () => {
    pauseAutoplay();
    goTo(index - 1);
  };
  const handleNext = () => {
    pauseAutoplay();
    goTo(index + 1);
  };

  const handleShare = async () => {
    const current = photos[index];
    if (!current) return;
    setShareError(null);
    setSharing(true);
    try {
      const file = await buildWatermarkedFile(current.fileUrl);
      const canShareFiles =
        typeof navigator !== "undefined" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] });

      if (canShareFiles) {
        await navigator.share({
          files: [file],
          title: "Un momento de la fiesta",
          text: "Compartido desde altainvitacion.com",
        });
      } else {
        const url = URL.createObjectURL(file);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
        setShareError("Tu navegador no deja compartir directo -- te descargamos la foto para que la compartas vos.");
      }
    } catch (err: unknown) {
      if ((err as { name?: string })?.name !== "AbortError") {
        setShareError("No pudimos preparar la foto para compartir. Probá de nuevo.");
      }
    } finally {
      setSharing(false);
    }
  };

  if (photos.length === 0) return null;
  const current = photos[index];

  const shareButton = (
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
  );

  return (
    <>
      <div className="w-full">
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-white/5 border border-white/10 block"
        >
          <img key={current.id} src={current.fileUrl} alt="Foto de la fiesta" className="w-full h-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pt-8 pb-3 flex items-end justify-between">
            {current.guestName ? (
              <span className="text-xs text-white/80 truncate pr-2">
                Enviado por <strong className="text-[#C79A4B] font-semibold">{current.guestName}</strong>
              </span>
            ) : (
              <span />
            )}
            {photos.length > 1 && (
              <span className="text-[10px] text-white/60 font-mono shrink-0">
                {index + 1}/{photos.length}
              </span>
            )}
          </div>
        </button>
        {photos.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-3">
            {photos.map((p, i) => (
              <span
                key={p.id}
                className={`h-1.5 rounded-full transition-all ${i === index ? "w-4 bg-[#C79A4B]" : "w-1.5 bg-white/20"}`}
              />
            ))}
          </div>
        )}
      </div>

      {expanded && (
        <div
          className="fixed inset-0 z-[200] bg-black flex flex-col"
          onClick={() => setExpanded(false)}
        >
          <div className="flex items-center justify-between p-4 text-white shrink-0">
            <span className="text-xs opacity-60">
              {index + 1} / {photos.length}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(false);
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
              alt="Foto de la fiesta"
              className="max-h-full max-w-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            {photos.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="absolute left-1 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white"
                >
                  <ChevronLeft className="w-7 h-7" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white"
                >
                  <ChevronRight className="w-7 h-7" />
                </button>
              </>
            )}
          </div>

          {current.guestName && (
            <p className="text-center text-white/60 text-xs pt-3 shrink-0">
              Enviado por <span className="text-[#C79A4B] font-semibold">{current.guestName}</span>
            </p>
          )}

          <div className="p-4 pb-6 shrink-0" onClick={(e) => e.stopPropagation()}>
            {shareError && <p className="text-red-400 text-xs text-center mb-2">{shareError}</p>}
            {shareButton}
          </div>
        </div>
      )}
    </>
  );
}
