"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";

interface ShowcaseItem {
  evento: "CASAMIENTO" | "QUINCE_ANOS";
  tipo: string;
  color: string;
  label: string;
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
  { evento: "CASAMIENTO", tipo: "ELEGANT", color: "Green", label: "Boda · Elegant Verde" },
  { evento: "CASAMIENTO", tipo: "GUESTPASSVIP", color: "default", label: "Boda · Guest Pass VIP" },
  { evento: "QUINCE_ANOS", tipo: "MODERNO", color: "Rojo", label: "15 Años · Moderno Rojo" },
  { evento: "QUINCE_ANOS", tipo: "PRINCESA", color: "default", label: "15 Años · Princesa" },
  { evento: "CASAMIENTO", tipo: "MODERNO", color: "Azul", label: "Boda · Moderno Azul" },
  { evento: "CASAMIENTO", tipo: "MARMOLYORO", color: "default", label: "Boda · Mármol y Oro" },
  { evento: "QUINCE_ANOS", tipo: "ELEGANT", color: "Pink", label: "15 Años · Elegant Rosa" },
  { evento: "QUINCE_ANOS", tipo: "ACRYLICPOP", color: "default", label: "15 Años · Acrylic Pop" },
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
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const frameBoxRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  // Cada avance de la rotación es una navegación COMPLETA del iframe: se baja
  // de nuevo el fondo de la plantilla, sus fotos de muestra y su chunk JS
  // (~3-4 MB por vuelta, cada ~7s). Sin frenos eso corre para siempre, incluso
  // con la pestaña en segundo plano o la sección fuera de pantalla, y se come
  // el ancho de banda del hosting sin que nadie lo esté mirando. Estos tres
  // gates hacen que sólo consuma mientras alguien la está viendo de verdad.
  const [everInView, setEverInView] = useState(false);
  const [inView, setInView] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  // Nadie se queda mirando las 8 plantillas seguidas (son ~1 minuto). Después
  // de una vuelta completa se frena sola y ofrece repetirla, en vez de seguir
  // rotando indefinidamente contra una pestaña olvidada.
  const [lapDone, setLapDone] = useState(false);
  // Si ya se vio abrir esta plantilla antes de una pausa, al volver no hay que
  // esperar de nuevo el aviso del iframe (que ya no va a llegar): se sigue
  // directo con el avance.
  const openedIndexRef = useRef<number | null>(null);

  const running = everInView && inView && tabVisible && !lapDone;
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

  // La vitrina sólo se monta (y por lo tanto sólo pide red) cuando la sección
  // se acerca al viewport, y sólo rota mientras está efectivamente a la vista.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) setEverInView(true);
      },
      // Se precarga un poco antes de entrar para que no se vea el hueco vacío
      // al llegar scrolleando, pero no desde el arranque de la página.
      { rootMargin: "200px 0px", threshold: 0.01 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Pestaña en segundo plano: no tiene sentido seguir rotando plantillas que
  // nadie ve.
  useEffect(() => {
    const onVisibility = () => setTabVisible(!document.hidden);
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Avanza a la siguiente plantilla y, al cerrar la vuelta, frena la rotación.
  const advance = useCallback(() => {
    setIndex((i) => {
      const next = (i + 1) % ROTATION.length;
      if (next === 0) setLapDone(true);
      return next;
    });
  }, []);

  // Repetir la vuelta a pedido, desde la primera plantilla.
  const replay = useCallback(() => {
    openedIndexRef.current = null;
    setLapDone(false);
    setVisible(false);
    setIndex(0);
  }, []);

  useEffect(() => {
    const clearTimers = () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };

    // Pausada (fuera de pantalla, pestaña oculta o vuelta terminada): no se
    // arma ningún temporizador, así que el iframe no vuelve a navegar y no se
    // pide nada más de red. El iframe montado se queda como está.
    if (!running) return clearTimers;

    // Si esta plantilla ya se había abierto antes de una pausa, el aviso del
    // iframe no va a repetirse: se retoma directo desde el avance.
    if (openedIndexRef.current === index) {
      timersRef.current.push(setTimeout(() => setVisible(false), HOLD_AFTER_OPEN_MS));
      timersRef.current.push(setTimeout(advance, HOLD_AFTER_OPEN_MS + FADE_MS));
      return clearTimers;
    }

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
      openedIndexRef.current = index;

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
          timersRef.current.push(setTimeout(advance, FADE_MS));
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
  }, [index, running, advance]);

  const item = ROTATION[index];
  const previewSrc = `/preview-plantilla?evento=${item.evento}&tipo=${item.tipo}&color=${encodeURIComponent(item.color)}&scroll=1&portada=${COVER_HOLD_MS}`;

  return (
    <section ref={sectionRef} id="plantillas" className="l-plantillas relative py-20 md:py-28 px-6 border-t border-zinc-900 overflow-hidden">
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
                height: frame.height,
                transform: `scale(${frame.scale})`,
                transformOrigin: "top left",
                opacity: visible ? 1 : 0,
                transition: `opacity ${FADE_MS}ms ease-in-out`,
              }}
            >
              {/* No interactivo: es una vitrina, no un preview clickeable.
                  No se monta hasta que la sección se acerca al viewport: si no,
                  toda visita a la landing pagaba la carga de una plantilla
                  entera aunque el visitante nunca bajara hasta acá. */}
              {everInView && (
                <iframe
                  ref={iframeRef}
                  src={previewSrc}
                  title="Vista previa de plantillas"
                  tabIndex={-1}
                  style={{
                    width: MOBILE_VIEWPORT_WIDTH,
                    height: frame.height,
                    border: 0,
                    pointerEvents: "none",
                  }}
                />
              )}
            </div>
          </div>
        </div>

        <p
          className="mt-8 text-sm font-medium text-zinc-300 tracking-wide"
          style={{ opacity: visible ? 1 : 0, transition: `opacity ${FADE_MS}ms ease-in-out` }}
        >
          {item.label}
        </p>

        {/* Terminada la vuelta, la rotación se detiene sola. El botón deja
            repetirla a pedido en vez de que siga girando para siempre. */}
        {lapDone && (
          <button
            type="button"
            onClick={replay}
            className="mt-4 inline-flex items-center gap-2 text-xs font-ui text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            Ver las plantillas de nuevo
          </button>
        )}
      </div>
    </section>
  );
}
