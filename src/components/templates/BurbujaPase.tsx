"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Ticket } from "lucide-react";
import { useTextos } from "@/components/i18n/ProveedorIdioma";

// Se muestra desplegada al entrar, el tiempo justo para leer el nombre y la
// mesa, y después se pliega sola a la píldora chica para no taparle nada a la
// invitación. Los mismos 4 segundos que ya usaban las plantillas Flat.
const ANTES_DE_PLEGARSE_MS = 4000;

interface Props {
  /**
   * El color de acento de esta variante. Sale del medallón de su propia
   * portada, así el pase de Bubblegum se ve Bubblegum y el de Scarlet se ve
   * Scarlet, sin inventar una paleta nueva ni pintarlas a todas iguales.
   */
  acento: string;
  // Campos opcionales porque así los declara el `GuestRecord` de cada
  // plantilla Storytelling. La burbuja se monta sólo cuando hay invitado, pero
  // el tipo tiene que aceptar la forma que le llega.
  guest: {
    name?: string;
    expectedCount?: number;
    mesas?: string[] | null;
  };
}

/**
 * La burbuja del pase, para la colección Storytelling.
 *
 * Es la misma que ya tenían las 183 plantillas Flat -- mismo lugar, mismo
 * gesto de tocar para plegar y desplegar, misma información -- pero escrita
 * una sola vez en vez de copiada 178 veces. En las Flat vive dentro de cada
 * archivo porque cada una la fue pintando con su paleta; acá alcanza con
 * recibir el acento, porque el resto del pase es igual en todas.
 *
 * El fondo es oscuro esmerilado en todas las variantes, y no el color de cada
 * portada: las portadas Storytelling van de una foto a pleno sol a un negro
 * total, y un fondo claro se pierde en la mitad de ellas. Lo que cambia de una
 * variante a otra es el acento, que es donde se nota la identidad.
 */
export function BurbujaPase({ acento, guest }: Props) {
  const tx = useTextos();
  const [desplegada, setDesplegada] = useState(true);
  const mesas = guest.mesas ?? [];
  const lugares = guest.expectedCount ?? 1;

  // Se replantea en cada cambio: si el invitado la vuelve a desplegar a mano,
  // arranca de nuevo la cuenta y se vuelve a plegar sola.
  useEffect(() => {
    if (!desplegada) return;
    const t = window.setTimeout(() => setDesplegada(false), ANTES_DE_PLEGARSE_MS);
    return () => window.clearTimeout(t);
  }, [desplegada]);

  return createPortal(
    <div
      onClick={() => setDesplegada(!desplegada)}
      className="fixed top-3 left-1/2 -translate-x-1/2 z-[99999] transition-all duration-500 cursor-pointer overflow-hidden shadow-md rounded-full"
      style={{
        border: `1px solid ${acento}66`,
        background: desplegada ? "rgba(12,12,14,.92)" : "rgba(255,255,255,.94)",
        backdropFilter: "blur(10px) saturate(140%)",
        WebkitBackdropFilter: "blur(10px) saturate(140%)",
        ...(desplegada
          ? { width: "90%", maxWidth: 384, padding: "10px 20px" }
          : { padding: "8px 20px" }),
      }}
    >
      {desplegada ? (
        <div className="flex items-center justify-between w-full animate-in fade-in duration-300">
          <div className="flex flex-col text-left min-w-0">
            <span
              className="text-[8px] font-semibold uppercase tracking-[0.2em] leading-none mb-1"
              style={{ fontFamily: "var(--font-body-custom, var(--font-inter))", color: acento }}
            >
              {tx("invitacion.pase.paseEspecial")}
            </span>
            <span
              className="font-bold text-sm leading-none truncate text-white"
              style={{ fontFamily: "var(--font-cormorant), serif" }}
            >
              {guest.name}
            </span>
            {mesas.length > 0 && (
              <span
                className="text-[8px] font-semibold uppercase tracking-[0.2em] leading-none mt-1.5 truncate"
                style={{ fontFamily: "var(--font-body-custom, var(--font-inter))", color: acento }}
              >
                {mesas.join(" · ")}
              </span>
            )}
          </div>
          <div
            className="flex flex-col items-end pl-3 shrink-0"
            style={{ borderLeft: `1px solid ${acento}33` }}
          >
            <span className="text-white font-bold text-sm leading-none">
              {lugares}
            </span>
            <span className="text-[#8F8F98] text-[8px] uppercase tracking-wider leading-none mt-1">
              {lugares === 1 ? tx("invitacion.pase.lugar") : tx("invitacion.pase.lugares")}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 animate-in fade-in duration-300">
          <Ticket className="w-4 h-4" style={{ color: acento }} />
          <span
            className="text-[#15151A] text-[10px] font-semibold tracking-wider uppercase"
            style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}
          >
            {tx("invitacion.pase.pase")}
          </span>
        </div>
      )}
    </div>,
    document.body
  );
}
