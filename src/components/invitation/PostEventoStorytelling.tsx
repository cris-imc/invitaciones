"use client";

import { useEffect, useState } from "react";
import { LiveAlbumStrip } from "@/components/templates/LiveAlbumStrip";
import { LogoFooterCredit } from "@/components/ui/Logo";
import { useTextos } from "@/components/i18n/ProveedorIdioma";
import { getEventStatus, getInvitationExpirationDate, type EventStatus } from "@/lib/expiration";

/**
 * La pantalla que ve un invitado que abre la invitación DESPUÉS de la fiesta.
 *
 * Las 177 plantillas de la colección Storytelling no tenían ninguna: la cuenta
 * regresiva llegaba a cero, se quedaba clavada en 00:00:00:00 y la invitación
 * seguía mostrando "guardá la fecha" y el formulario de confirmación de una
 * fiesta que ya había pasado. La colección Flat sí la tiene, pero escrita a
 * mano dentro de cada archivo -- 184 copias de la misma idea.
 *
 * Acá va una sola, y cada plantilla le pasa SU paleta. No es un genérico gris
 * pegado a todas: el fondo, la tinta y el acento salen del contenedor raíz de
 * cada variante, así que la de Cine Abstracto sigue siendo Cine Abstracto y la
 * Infantil Safari sigue siendo Infantil Safari.
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
  const fechaStr = fechaEvento.toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });

  // El acento sobre el fondo de la variante: algunas son claras y otras
  // oscuras, así que el velo de las superficies se calcula, no se fija.
  const oscuro = esOscuro(paleta.fondo);
  const velo = oscuro ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.05)";
  const hilo = oscuro ? "rgba(255,255,255,.12)" : "rgba(0,0,0,.12)";

  return (
    <div
      className={paleta.clase}
      style={{
        minHeight: "calc(var(--vh, 1vh) * 100)",
        background: paleta.fondo,
        color: paleta.tinta,
        fontFamily: paleta.fuente,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <main
        style={{
          flex: 1,
          width: "100%",
          maxWidth: 880,
          margin: "0 auto",
          padding: "72px 24px 48px",
          display: "flex",
          flexDirection: "column",
          gap: 32,
          textAlign: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span
            style={{
              fontSize: 11,
              letterSpacing: ".22em",
              textTransform: "uppercase",
              color: paleta.acento,
            }}
          >
            {fechaStr}
          </span>
          <h1 style={{ fontSize: "clamp(30px, 7vw, 54px)", lineHeight: 1.05, margin: 0, fontWeight: 400 }}>
            {titulo}
          </h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, opacity: 0.5 }}>
          <span style={{ height: 1, width: 52, background: hilo }} />
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: paleta.acento }} />
          <span style={{ height: 1, width: 52, background: hilo }} />
        </div>

        <p style={{ fontSize: 15, lineHeight: 1.7, opacity: 0.8, margin: "0 auto", maxWidth: 540 }}>
          {tx("invitacion.frase.graciasPorAcompanarnosCorto")}
        </p>

        {/* El álbum es la razón por la que alguien vuelve a abrir el link
            después de la fiesta. Va primero que cualquier otra cosa. */}
        <section style={{ marginTop: 8 }}>
          {fotos.length > 0 ? (
            <LiveAlbumStrip photos={fotos} tone={oscuro ? "dark" : "light"} accentColor={paleta.acento} />
          ) : (
            <div
              style={{
                border: `1px solid ${hilo}`,
                background: velo,
                borderRadius: 16,
                padding: "36px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <h2 style={{ fontSize: 17, margin: 0, fontWeight: 400 }}>{tx("invitacion.album.fotografico")}</h2>
              <p style={{ fontSize: 13, opacity: 0.65, margin: 0 }}>{tx("invitacion.album.sinCapturas")}</p>
            </div>
          )}
        </section>

        {fotos.length > 0 && (
          <span
            style={{
              alignSelf: "center",
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 18px",
              borderRadius: 999,
              border: `1px solid ${hilo}`,
              background: velo,
              fontSize: 11,
              letterSpacing: ".14em",
              textTransform: "uppercase",
              opacity: 0.8,
            }}
          >
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: paleta.acento }} />
            {tx("invitacion.album.disponibleHasta")} {venceStr}
          </span>
        )}
      </main>

      <LogoFooterCredit bgColor="transparent" textColor={paleta.tinta} />
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
