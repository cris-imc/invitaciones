"use client";

import { useEffect, useRef, useState } from "react";
import { useTextos } from "@/components/i18n/ProveedorIdioma";

interface ShowcaseItem {
  evento: "CASAMIENTO" | "QUINCE_ANOS";
  tipo: string;
  color: string;
  /** El nombre de la familia de plantillas, que es de marca y no se traduce. */
  familia: string;
  /** El color, cuando la plantilla tiene variante de color. */
  colorClave?: "verde" | "rojo" | "azul" | "rosa";
}

// Curaduría de combinaciones evento/plantilla/color a mostrar en rotación.
// Las fotos (vestido acorde al color) las resuelve automáticamente
// getTemplatePreviewSample() dentro de /preview-plantilla.
//
// Se alterna Flat y Storytelling a propósito: antes rotaban sólo Elegant y
// Moderno, así que el visitante veía dos familias de las 58 y ninguna de la
// Colección Storytelling, que es la que no tiene equivalente en la
// competencia. Van intercaladas para que dos vecinas nunca se parezcan.
const ROTATION: ShowcaseItem[] = [
  { evento: "CASAMIENTO", tipo: "ELEGANT", color: "Green", familia: "Elegant", colorClave: "verde" },
  { evento: "CASAMIENTO", tipo: "GUESTPASSVIP", color: "default", familia: "Guest Pass VIP" },
  { evento: "QUINCE_ANOS", tipo: "MODERNO", color: "Rojo", familia: "Moderno", colorClave: "rojo" },
  { evento: "QUINCE_ANOS", tipo: "PRINCESA", color: "default", familia: "Princesa" },
  { evento: "CASAMIENTO", tipo: "MODERNO", color: "Azul", familia: "Moderno", colorClave: "azul" },
  { evento: "CASAMIENTO", tipo: "MARMOLYORO", color: "default", familia: "Mármol y Oro" },
  { evento: "QUINCE_ANOS", tipo: "ELEGANT", color: "Pink", familia: "Elegant", colorClave: "rosa" },
  { evento: "QUINCE_ANOS", tipo: "ACRYLICPOP", color: "default", familia: "Acrylic Pop" },
];

// El iframe siempre se layoutea a un ancho de celular real para que
// tipografías/paddings queden proporcionados; el marco visible lo escala.
const MOBILE_VIEWPORT_WIDTH = 390;
const MOBILE_ASPECT_RATIO = 19 / 9;

const FADE_MS = 700;
// Cuánto se sostiene la portada de bienvenida dentro del iframe antes de que
// se autoabra sola (se lo pasamos al preview por query string).
const COVER_HOLD_MS = 1300;
// A partir de que la invitación se ABRE (no de que el iframe está listo):
// cuánto se espera para el paseo de scroll y cuánto se la deja en pantalla.
// El fundido tiene que arrancar bastante después de que termine la animación
// de apertura (~1.1s en las plantillas de Storytelling), si no la apertura se
// ve cortada por la mitad y parece que se rompió.
const SCROLL_AFTER_OPEN_MS = 1600;
const HOLD_AFTER_OPEN_MS = 4200;
// Red de seguridad: una plantilla sin portada que abrir nunca avisa
// "template-preview-opened". Se cuenta igual desde que el iframe avisó que
// está listo para que la rotación no se quede clavada.
const OPEN_FALLBACK_MS = 4600;

export function TemplateShowcase() {
  const t = useTextos();
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const frameBoxRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  // El alto del iframe NO sale de MOBILE_ASPECT_RATIO: ese aspecto lo cumple
  // la caja del marco entera (borde incluido, box-sizing: border-box), así
  // que el hueco interior queda un poco más alto de lo que da la proporción
  // -- escalando 390 x (390 * 19/9) sobraban ~18px de negro abajo de la
  // pantalla del celular. Se deriva del alto real del hueco para que el
  // iframe lo llene exacto.
  const [frame, setFrame] = useState({
    scale: 1,
    height: MOBILE_VIEWPORT_WIDTH * MOBILE_ASPECT_RATIO,
  });

  useEffect(() => {
    const box = frameBoxRef.current;
    if (!box) return;
    const update = () => {
      const scale = box.clientWidth / MOBILE_VIEWPORT_WIDTH;
      setFrame({
        scale,
        height: scale > 0 ? box.clientHeight / scale : MOBILE_VIEWPORT_WIDTH * MOBILE_ASPECT_RATIO,
      });
    };
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

    // El iframe avisa "listo" MÁS DE UNA VEZ por plantilla (una apenas monta
    // y otra cuando ya tiene la portada armada; en dev, además, React monta
    // dos veces). Antes cada aviso reiniciaba todos los tiempos, así que la
    // cuenta terminaba arrancando desde el último y la invitación quedaba
    // abierta apenas unas décimas antes del fundido: la apertura se veía
    // cortada por la mitad. Sólo cuenta el primero de cada plantilla.
    let started = false;
    // Idem para la apertura: sólo se programa el resto de la secuencia una vez.
    let opened = false;

    const runAfterOpen = () => {
      if (opened) return;
      opened = true;

      // Paseo hacia abajo para mostrar que hay más contenido, como si un
      // visitante estuviera recorriendo la invitación. Va DESPUÉS de la
      // apertura: si se scrollea con la portada todavía puesta, al abrirse
      // la invitación ya aparece por la mitad (se saltea el hero) y se ve
      // como un salto raro. Y lo scrollea el propio preview, porque las
      // plantillas de Storytelling no mueven `window` sino su contenedor
      // interno (ver showcase-scroll en /preview-plantilla).
      timersRef.current.push(
        setTimeout(() => {
          iframeRef.current?.contentWindow?.postMessage(
            { type: "showcase-scroll" },
            window.location.origin
          );
        }, SCROLL_AFTER_OPEN_MS)
      );

      // Fundido a negro y avance a la siguiente plantilla de la rotación.
      timersRef.current.push(
        setTimeout(() => {
          setVisible(false);
          timersRef.current.push(
            setTimeout(() => setIndex((i) => (i + 1) % ROTATION.length), FADE_MS)
          );
        }, HOLD_AFTER_OPEN_MS)
      );
    };

    const onMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;

      if (event.data?.type === "template-preview-opened") {
        runAfterOpen();
        return;
      }
      if (event.data?.type !== "template-preview-ready" || started) return;

      started = true;
      timersRef.current.push(setTimeout(() => setVisible(true), 50));
      timersRef.current.push(setTimeout(runAfterOpen, OPEN_FALLBACK_MS));
    };

    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
      clearTimers();
    };
  }, [index]);

  const item = ROTATION[index];
  const previewSrc = `/preview-plantilla?evento=${item.evento}&tipo=${item.tipo}&color=${encodeURIComponent(item.color)}&scroll=1&portada=${COVER_HOLD_MS}`;
  // El pie de la vitrina se arma por partes ("Boda · Elegant Verde"): el tipo
  // de evento y el color se traducen, el nombre de la familia no.
  const evento = t(item.evento === "CASAMIENTO" ? "landing.showcase.evento.boda" : "landing.showcase.evento.quince");
  const color = item.colorClave ? ` ${t(`landing.showcase.color.${item.colorClave}`)}` : "";
  const label = `${evento} · ${item.familia}${color}`;

  return (
    <section id="plantillas" className="l-plantillas relative py-20 md:py-28 px-6 border-t border-[var(--line)] overflow-hidden">
      <div
        className="absolute left-1/2 top-0 -translate-x-1/2 w-[600px] h-[600px] bg-[var(--accent)]/10 rounded-full blur-[120px] pointer-events-none"
        aria-hidden="true"
      />
      <div className="relative max-w-5xl mx-auto flex flex-col items-center text-center">
        <p className="kicker mb-3">{t("landing.showcase.kicker")}</p>
        <h2 className="text-3xl md:text-5xl font-serif text-[var(--foreground)] leading-tight mb-4 max-w-xl">
          {t("landing.showcase.titulo")}
        </h2>
        <p className="text-[var(--shell-fg-mid)] max-w-lg mb-12">
          {t("landing.showcase.bajada")}
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
                height: frame.height,
                transform: `scale(${frame.scale})`,
                transformOrigin: "top left",
                opacity: visible ? 1 : 0,
                transition: `opacity ${FADE_MS}ms ease-in-out`,
              }}
            >
              {/* No interactivo: es una vitrina, no un preview clickeable. */}
              <iframe
                ref={iframeRef}
                src={previewSrc}
                title={t("landing.showcase.tituloIframe")}
                tabIndex={-1}
                style={{
                  width: MOBILE_VIEWPORT_WIDTH,
                  height: frame.height,
                  border: 0,
                  pointerEvents: "none",
                }}
              />
            </div>
          </div>
        </div>

        <p
          className="mt-8 text-sm font-medium text-[var(--shell-fg-strong)] tracking-wide"
          style={{ opacity: visible ? 1 : 0, transition: `opacity ${FADE_MS}ms ease-in-out` }}
        >
          {label}
        </p>
      </div>
    </section>
  );
}
