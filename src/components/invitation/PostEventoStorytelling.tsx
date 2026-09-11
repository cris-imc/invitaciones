"use client";

import { useEffect, useState } from "react";
import { AlbumCarousel } from "@/components/invitation/v2/AlbumCarousel";
import { AnimatedSynonyms } from "@/components/ui/AnimatedSynonyms";
import { LogoFooterCredit } from "@/components/ui/Logo";
import { useTextos } from "@/components/i18n/ProveedorIdioma";
import { getEventStatus, getInvitationExpirationDate, type EventStatus } from "@/lib/expiration";

/**
 * La pantalla que ve un invitado que abre la invitación DESPUÉS de la fiesta.
 *
 * Las 177 plantillas de la colección Storytelling no tenían ninguna: la cuenta
 * regresiva llegaba a cero, se quedaba clavada en 00:00:00:00 y la invitación
 * seguía mostrando "guardá la fecha" y el formulario de confirmación de una
 * fiesta que ya había pasado.
 *
 * ES LA MISMA QUE LA DE LAS FLAT, a propósito, y no un diseño nuevo: la tarjeta
 * centrada con el halo detrás, el título "Un momento" con la palabra que rota,
 * el hilo con el punto en el medio, el agradecimiento, la píldora con hasta
 * cuándo está el álbum y el carrusel abajo. Un cliente que probó una plantilla
 * Flat y después eligió una Storytelling tiene que encontrar lo mismo después
 * de su fiesta.
 *
 * Lo único que cambia por plantilla es la paleta, que sale del contenedor raíz
 * de cada variante. En las Flat también es así -- cada familia pinta su post
 * evento con sus colores --, sólo que allá está escrito a mano en cada uno de
 * los 184 archivos y acá hay uno solo.
 */

export interface PaletaDeVariante {
  /** Fondo del contenedor raíz de la plantilla. */
  fondo: string;
  /** Color de texto del contenedor raíz. */
  tinta: string;
  /** El color de marca de la variante (el de sus enlaces). */
  acento: string;
  /** Las clases de fuente del contenedor raíz, para no perder la tipografía. */
  clase?: string;
  /** El `fontFamily` del contenedor raíz. */
  fuente?: string;
}

/**
 * El estado del evento, recalculado mientras la página está abierta.
 *
 * Sin esto, alguien que deja la invitación abierta cruzando la medianoche del
 * evento se queda para siempre en la pantalla de antes: el estado se calcula
 * una vez, al dibujar, y nadie lo vuelve a mirar. Justamente lo que se veía
 * como "el countdown queda tildado en cero".
 *
 * Cada 30 segundos alcanza: los saltos que importan (que empiece, que pase) se
 * miden en días, no en segundos, y un intervalo más corto sería un `setState`
 * por segundo en una página que además está animando.
 */
export function useEstadoDelEvento(fechaEvento: Date): EventStatus {
  const [estado, setEstado] = useState<EventStatus>(() => getEventStatus(fechaEvento));

  useEffect(() => {
    const revisar = () => setEstado(getEventStatus(fechaEvento));
    revisar();
    const timer = window.setInterval(revisar, 30_000);
    return () => window.clearInterval(timer);
    // El tiempo en ms y no el objeto: `new Date(...)` devuelve una instancia
    // nueva en cada dibujo y el efecto se rearmaría infinitamente.
  }, [fechaEvento.getTime()]); // eslint-disable-line react-hooks/exhaustive-deps

  return estado;
}

interface Props {
  /** El nombre de los novios / la quinceañera / el evento. */
  titulo: string;
  fechaEvento: Date;
  paleta: PaletaDeVariante;
  fotos: string[];
}

export function PostEventoStorytelling({ titulo, fechaEvento, paleta, fotos }: Props) {
  const tx = useTextos();

  const vence = getInvitationExpirationDate(fechaEvento);
  const venceStr = vence.toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });

  // El velo de las superficies se calcula, no se fija: la mayoría de las
  // variantes son oscuras pero no todas, y una tarjeta negra translúcida sobre
  // un fondo claro no se ve.
  const oscuro = esOscuro(paleta.fondo);
  const velo = oscuro ? "rgba(0,0,0,.40)" : "rgba(255,255,255,.55)";
  const hilo = oscuro ? "rgba(255,255,255,.12)" : "rgba(0,0,0,.10)";
  const veloSuave = oscuro ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.04)";

  return (
    <div
      className={`min-h-dvh w-full relative overflow-x-hidden flex flex-col justify-between ${paleta.clase ?? ""}`}
      style={{ background: paleta.fondo, color: paleta.tinta, fontFamily: paleta.fuente }}
    >
      {/* Los dos halos del fondo, como en las Flat. */}
      <div
        className="absolute left-1/2 top-0 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none"
        style={{ background: `${paleta.acento}1A` }}
        aria-hidden="true"
      />
      <div
        className="absolute right-0 bottom-0 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none"
        style={{ background: `${paleta.acento}1A` }}
        aria-hidden="true"
      />

      <main className="relative z-10 max-w-5xl mx-auto w-full px-4 md:px-6 py-12 lg:py-20">
        <div
          className="rounded-[2rem] shadow-2xl backdrop-blur-3xl text-center max-w-4xl mx-auto relative overflow-hidden flex flex-col"
          style={{ background: velo, border: `1px solid ${hilo}` }}
        >
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[1px]"
            style={{ background: `linear-gradient(to right, transparent, ${paleta.acento}80, transparent)` }}
          />

          <div className="p-10 md:p-16 space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-wide drop-shadow-md">
              {tx("invitacion.frase.unMomento")}{" "}
              <AnimatedSynonyms
                words={[
                  tx("invitacion.frase.inolvidable"),
                  tx("invitacion.frase.unico"),
                  tx("invitacion.frase.eterno"),
                  tx("invitacion.frase.magico"),
                ]}
                className="italic"
              />
            </h1>

            {/* De quién fue la fiesta. Las Flat lo dan por sabido porque su
                post evento suele venir después de haber visto la invitación;
                acá el link se abre meses después y "un momento inolvidable"
                sin nombre no dice de quién. */}
            <p className="text-sm uppercase tracking-[0.2em]" style={{ color: paleta.acento }}>
              {titulo}
            </p>

            <div className="flex justify-center items-center gap-4 py-2 opacity-60">
              <div className="h-[1px] w-12" style={{ background: hilo }} />
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: `${paleta.acento}80` }} />
              <div className="h-[1px] w-12" style={{ background: hilo }} />
            </div>

            <p className="text-lg md:text-xl leading-relaxed max-w-2xl mx-auto font-light tracking-wide opacity-75">
              {tx("invitacion.frase.graciasPorAcompanarnos")}
            </p>

            <div className="pt-6">
              <span
                className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full text-xs tracking-widest uppercase backdrop-blur-md opacity-80"
                style={{ background: veloSuave, border: `1px solid ${hilo}` }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: paleta.acento }} />
                <span>
                  {tx("invitacion.album.disponibleHasta")} {venceStr}
                </span>
              </span>
            </div>
          </div>

          <div className="w-full py-8 md:py-12" style={{ background: veloSuave, borderTop: `1px solid ${hilo}` }}>
            <div className="px-4 md:px-10">
              {fotos.length > 0 ? (
                <div className="w-full overflow-hidden rounded-2xl shadow-xl" style={{ outline: `1px solid ${hilo}` }}>
                  <AlbumCarousel photos={fotos} dark={oscuro} hideHeader />
                </div>
              ) : (
                <div className="text-center space-y-3">
                  <h3 className="font-light text-xl tracking-wide opacity-85">
                    {tx("invitacion.album.fotografico")}
                  </h3>
                  <p className="text-sm font-light tracking-wide opacity-60">
                    {tx("invitacion.album.sinCapturas")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 pt-4 pb-2 text-center" style={{ borderTop: `1px solid ${hilo}` }}>
        <LogoFooterCredit bgColor="transparent" textColor={paleta.tinta} />
      </footer>
    </div>
  );
}

/** Luminancia relativa, para saber si el fondo de la variante es oscuro. */
function esOscuro(hex: string): boolean {
  const m = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!m) return true;
  let h = m[1];
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
}
