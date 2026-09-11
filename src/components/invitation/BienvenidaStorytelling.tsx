"use client";

import { useTextos } from "@/components/i18n/ProveedorIdioma";

/**
 * La primera pantalla de una invitación Storytelling: de quién es la fiesta.
 *
 * Hasta ahora las 177 abrían directo en "Save the Date" -- una fecha gigante
 * sin decir en ningún lado de quién es el casamiento, de quién son los quince
 * o a qué te están invitando. El nombre aparecía recién varias pantallas más
 * abajo, o no aparecía. Alguien que abre el link por WhatsApp y ve "12 dic"
 * no sabe si es la boda de su prima o la inauguración de un local.
 *
 * QUÉ MUESTRA, y por qué cada cosa:
 *
 * - El tipo de evento ("nos casamos", "mis 15"), que es el contexto en una
 *   línea.
 * - EL NOMBRE, que es lo que la invitación viene a decir y va más grande que
 *   todo lo demás.
 * - Fecha y lugar juntos: los dos datos que alguien busca para saber si puede
 *   ir, antes de leer nada más.
 * - El pase: su número de invitado y para cuántos es. Cuando el link es
 *   personalizado, es la diferencia entre "estás invitado" y "esto es tuyo".
 *
 * NO LLEVA NÚMERO DE SECCIÓN a propósito. Las secciones de estas plantillas
 * están numeradas ("01 — GUARDÁ LA FECHA") y numerarla la obligaría a
 * renumerar las ocho siguientes en las 177. En el mockup tampoco lo lleva:
 * es la portada, no el primer capítulo.
 *
 * SE VE COMO SU FAMILIA porque usa las clases de cada una (`gpv-section`,
 * `gpv-kicker`, y así con las 36): hereda el alto, el padding y la tipografía
 * del kicker sin copiar nada. Lo que no sale de ahí -- el tamaño del nombre,
 * los hilos, el acento -- sale de la paleta de la variante.
 */

export interface Bienvenida {
  /** Prefijo de clases de la familia: "gpv", "c3d", "ifs"... */
  prefijo: string;
  /** El color de marca de la variante. */
  acento: string;
  /** Nombre de los novios / la quinceañera / el evento. */
  titulo: string;
  /** CASAMIENTO, QUINCE_ANOS, CUMPLEANOS... de ahí sale la frase de arriba. */
  tipo?: string | null;
  fechaEvento: Date;
  lugar?: string | null;
  /** Nombre del invitado o la familia, si el link es personalizado. */
  invitado?: string | null;
  /** Su número de orden, que es el número de pase. */
  numeroDePase?: number | null;
  /** Para cuántas personas es la invitación. */
  personas?: number | null;
  /** El mensaje del anfitrión, si cargó uno. */
  mensaje?: string | null;
  /**
   * Si la variante es de fondo claro u oscuro. Lo lee el riel de progreso de
   * cada plantilla para saber de qué color dibujarse: mentirle acá le pinta
   * el indicador claro sobre fondo claro. De las 177, sólo Black and White
   * Negativo es clara -- por eso el default es "dark".
   */
  tono?: "dark" | "light";
}

export function BienvenidaStorytelling({
  prefijo,
  acento,
  titulo,
  tipo,
  fechaEvento,
  lugar,
  invitado,
  numeroDePase,
  personas,
  mensaje,
  tono = "dark",
}: Bienvenida) {
  const tx = useTextos();

  // La frase de contexto, en una línea. Sale del tipo de evento y no de un
  // texto escrito a mano, así una misma sección sirve para un casamiento,
  // unos quince y una inauguración.
  const fraseDelEvento = tx(
    tipo === "CASAMIENTO"
      ? "invitacion.evento.nosCasamos"
      : tipo === "QUINCE_ANOS"
      ? "invitacion.evento.misQuinceAnos"
      : tipo === "CUMPLEANOS"
      ? "invitacion.evento.miCumpleanos"
      : tipo === "ANIVERSARIO"
      ? "invitacion.evento.nuestroAniversario"
      : "invitacion.evento.teInvitamos"
  );

  const fecha = fechaEvento.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, " · ");

  const saludo = invitado
    ? tx("invitacion.bienvenida.hola", { nombre: invitado })
    : tx("invitacion.bienvenida.bienvenido");

  const datos = [
    fecha,
    lugar?.trim() || null,
  ].filter(Boolean) as string[];

  const pase = [
    numeroDePase ? tx("invitacion.bienvenida.pase", { numero: String(numeroDePase).padStart(3, "0") }) : null,
    personas && personas > 1 ? tx("invitacion.bienvenida.paraVarios", { cantidad: String(personas) }) : null,
    numeroDePase ? tx("invitacion.bienvenida.noTransferible") : null,
  ].filter(Boolean) as string[];

  const hilo = `${acento}59`; // el mismo acento, al 35%

  return (
    <section
      data-tone={tono}
      data-screen-label="Bienvenida"
      className={`${prefijo}-section`}
      style={{ justifyContent: "center", textAlign: "center", alignItems: "center" }}
    >
      {/* El saludo, en la tipografía de kicker de la familia. */}
      <span data-xin="1" data-dist="-60" className={`${prefijo}-kicker`} style={{ position: "relative" }}>
        {saludo.toUpperCase()}
      </span>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center", width: "100%" }}>
        <span
          style={{
            fontSize: 11,
            letterSpacing: ".24em",
            textTransform: "uppercase",
            color: acento,
            opacity: 0.95,
          }}
        >
          {fraseDelEvento}
        </span>

        {/* Lo que la invitación viene a decir. */}
        <h2
          style={{
            margin: 0,
            fontWeight: 400,
            lineHeight: 1.02,
            fontSize: "clamp(34px, 11vw, 66px)",
            wordBreak: "break-word",
          }}
        >
          {titulo}
        </h2>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, opacity: 0.55 }}>
        <span style={{ height: 1, width: 44, background: hilo }} />
        <span style={{ width: 4, height: 4, borderRadius: "50%", background: acento }} />
        <span style={{ height: 1, width: 44, background: hilo }} />
      </div>

      {datos.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "6px 14px",
            fontSize: 12,
            letterSpacing: ".16em",
            textTransform: "uppercase",
            opacity: 0.85,
          }}
        >
          {datos.map((d, i) => (
            <span key={d} style={{ display: "inline-flex", alignItems: "center", gap: 14 }}>
              {i > 0 && <span style={{ width: 3, height: 3, borderRadius: "50%", background: acento, opacity: 0.7 }} />}
              {d}
            </span>
          ))}
        </div>
      )}

      {mensaje && (
        <p style={{ margin: 0, maxWidth: 440, fontSize: 14, lineHeight: 1.65, opacity: 0.75 }}>{mensaje}</p>
      )}

      {pase.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            gap: "4px 10px",
            padding: "9px 16px",
            border: `1px solid ${hilo}`,
            borderRadius: 999,
            fontSize: 10,
            letterSpacing: ".18em",
            textTransform: "uppercase",
            opacity: 0.8,
          }}
        >
          {pase.map((p, i) => (
            <span key={p} style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
              {i > 0 && <span style={{ opacity: 0.5 }}>·</span>}
              {p}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
