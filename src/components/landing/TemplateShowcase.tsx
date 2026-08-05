"use client";

import { useEffect, useRef, useState } from "react";

interface ShowcaseItem {
  evento: "CASAMIENTO" | "QUINCE_ANOS";
  tipo: "ELEGANT" | "MODERNO";
  color: string;
  label: string;
}

// Curaduría de combinaciones evento/plantilla/color a mostrar en rotación.
// Las fotos (vestido acorde al color) las resuelve automáticamente
// getTemplatePreviewSample() dentro de /preview-plantilla.
const ROTATION: ShowcaseItem[] = [
  { evento: "CASAMIENTO", tipo: "ELEGANT", color: "Green", label: "Boda · Elegant Verde" },
  { evento: "QUINCE_ANOS", tipo: "MODERNO", color: "Rojo", label: "15 Años · Moderno Rojo" },
  { evento: "CASAMIENTO", tipo: "MODERNO", color: "Azul", label: "Boda · Moderno Azul" },
  { evento: "QUINCE_ANOS", tipo: "ELEGANT", color: "Pink", label: "15 Años · Elegant Rosa" },
  { evento: "CASAMIENTO", tipo: "ELEGANT", color: "DarkYellow", label: "Boda · Elegant Dorado" },
  { evento: "QUINCE_ANOS", tipo: "MODERNO", color: "Verde", label: "15 Años · Moderno Verde" },
];

// El iframe siempre se layoutea a un ancho de celular real para que
// tipografías/paddings queden proporcionados; el marco visible lo escala.
const MOBILE_VIEWPORT_WIDTH = 390;
const MOBILE_ASPECT_RATIO = 19 / 9;

const HOLD_MS = 4500;
const FADE_MS = 700;
const SCROLL_DELAY_MS = 1700;

export function TemplateShowcase() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const frameBoxRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const box = frameBoxRef.current;
    if (!box) return;
    const update = () => setScale(box.clientWidth / MOBILE_VIEWPORT_WIDTH);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const clearTimers = () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };

    const onMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      if (event.data?.type !== "template-preview-ready") return;

      clearTimers();
      timersRef.current.push(setTimeout(() => setVisible(true), 50));

      // Scroll suave hacia abajo para mostrar que hay más contenido, como
      // si un visitante estuviera recorriendo la invitación.
      timersRef.current.push(
        setTimeout(() => {
          const win = iframeRef.current?.contentWindow;
          const doc = iframeRef.current?.contentDocument;
          const scrollHeight = doc?.documentElement.scrollHeight ?? 1400;
          const target = Math.min(650, Math.max(320, scrollHeight * 0.32));
          win?.scrollTo({ top: target, behavior: "smooth" });
        }, SCROLL_DELAY_MS)
      );

      // Fundido a negro y avance a la siguiente plantilla de la rotación.
      timersRef.current.push(
        setTimeout(() => {
          setVisible(false);
          timersRef.current.push(
            setTimeout(() => setIndex((i) => (i + 1) % ROTATION.length), FADE_MS)
          );
        }, HOLD_MS)
      );
    };

    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
      clearTimers();
    };
  }, [index]);

  const item = ROTATION[index];
  const previewSrc = `/preview-plantilla?evento=${item.evento}&tipo=${item.tipo}&color=${encodeURIComponent(item.color)}&scroll=1`;

  return (
    <section id="plantillas" className="l-plantillas relative py-20 md:py-28 px-6 border-t border-zinc-900 overflow-hidden">
      <div
        className="absolute left-1/2 top-0 -translate-x-1/2 w-[600px] h-[600px] bg-[var(--accent)]/10 rounded-full blur-[120px] pointer-events-none"
        aria-hidden="true"
      />
      <div className="relative max-w-5xl mx-auto flex flex-col items-center text-center">
        <p className="kicker mb-3">Plantillas</p>
        <h2 className="text-3xl md:text-5xl font-serif text-white leading-tight mb-4 max-w-xl">
          Un diseño para cada celebración
        </h2>
        <p className="text-zinc-400 max-w-lg mb-12">
          Bodas y 15 años, en distintos estilos y colores. Así se ve tu invitación en el celular de cada invitado.
        </p>

        <div className="relative">
          <div
            className="absolute -inset-10 rounded-full bg-[var(--accent)]/20 blur-3xl opacity-70"
            aria-hidden="true"
          />
          <div
            ref={frameBoxRef}
            className="relative w-[240px] sm:w-[280px] rounded-[3rem] border-[8px] border-zinc-900 shadow-2xl overflow-hidden ring-1 ring-white/10 bg-black"
            style={{ aspectRatio: `1 / ${MOBILE_ASPECT_RATIO}` }}
          >
            <div className="absolute top-0 inset-x-0 h-6 bg-zinc-900 rounded-b-2xl w-32 mx-auto z-50" />
            <div
              style={{
                width: MOBILE_VIEWPORT_WIDTH,
                height: MOBILE_VIEWPORT_WIDTH * MOBILE_ASPECT_RATIO,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                opacity: visible ? 1 : 0,
                transition: `opacity ${FADE_MS}ms ease-in-out`,
              }}
            >
              {/* No interactivo: es una vitrina, no un preview clickeable. */}
              <iframe
                ref={iframeRef}
                src={previewSrc}
                title="Vista previa de plantillas"
                tabIndex={-1}
                style={{
                  width: MOBILE_VIEWPORT_WIDTH,
                  height: MOBILE_VIEWPORT_WIDTH * MOBILE_ASPECT_RATIO,
                  border: 0,
                  pointerEvents: "none",
                }}
              />
            </div>
          </div>
        </div>

        <p
          className="mt-8 text-sm font-medium text-zinc-300 tracking-wide"
          style={{ opacity: visible ? 1 : 0, transition: `opacity ${FADE_MS}ms ease-in-out` }}
        >
          {item.label}
        </p>
      </div>
    </section>
  );
}
