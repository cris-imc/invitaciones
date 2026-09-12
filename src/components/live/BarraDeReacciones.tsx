"use client";

import { useEffect, useState } from "react";
import {
  REACCIONES,
  ReaccionId,
  anotarReaccion,
  yaReacciono,
  type ConteoDeReacciones,
} from "@/lib/live-reacciones";

/**
 * Los cuatro botones de reacción, para una foto o un mensaje.
 *
 * El número que se ve es `Math.max(lo que dice el servidor, lo que escribimos
 * al tocar)`. Suena raro pero resuelve el problema de la fiesta: la lista se
 * refresca cada cinco segundos, y sin esto el número volvía atrás un instante
 * después de tocar -- el invitado toca, ve 8, y medio segundo más tarde lee 7
 * otra vez. Con el máximo, el número sube al tocar y se queda; cuando la
 * respuesta del servidor llega con el toque ya contado, el máximo es el
 * servidor y el optimismo deja de pesar solo.
 */
export function BarraDeReacciones({
  token,
  item,
  tamano = "normal",
}: {
  token: string;
  item: ConteoDeReacciones & { id: string };
  tamano?: "normal" | "chico";
}) {
  const [optimista, setOptimista] = useState<Partial<Record<ReaccionId, number>>>({});
  const [mias, setMias] = useState<Set<ReaccionId>>(new Set());

  // localStorage recién en el navegador: en el render del servidor no existe,
  // y leerlo directo rompe la hidratación.
  useEffect(() => {
    const marcadas = REACCIONES.filter((r) => yaReacciono(item.id, r.id)).map((r) => r.id);
    setMias(new Set(marcadas));
    setOptimista({});
  }, [item.id]);

  const reaccionar = async (id: ReaccionId) => {
    if (mias.has(id)) return;

    const campo = REACCIONES.find((r) => r.id === id)!.campo;
    const nuevo = (item[campo] ?? 0) + 1;

    setMias((prev) => new Set(prev).add(id));
    setOptimista((prev) => ({ ...prev, [id]: nuevo }));
    anotarReaccion(item.id, id);

    try {
      const res = await fetch(`/api/live/public/${token}/items/${item.id}/reaccion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reaccion: id }),
      });
      if (!res.ok) throw new Error();
    } catch {
      // No se avisa nada: es una reacción en una fiesta, no un pago. Se
      // deshace el número y se deja volver a tocar.
      setMias((prev) => {
        const copia = new Set(prev);
        copia.delete(id);
        return copia;
      });
      setOptimista((prev) => ({ ...prev, [id]: undefined }));
    }
  };

  const chico = tamano === "chico";

  return (
    <div className={`flex items-center ${chico ? "gap-1" : "gap-1.5"}`}>
      {REACCIONES.map((r) => {
        const cuenta = Math.max(item[r.campo] ?? 0, optimista[r.id] ?? 0);
        const mia = mias.has(r.id);
        return (
          <button
            key={r.id}
            type="button"
            aria-label={r.etiqueta}
            aria-pressed={mia}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              reaccionar(r.id);
            }}
            className={`flex items-center gap-1 rounded-full border transition-all active:scale-95 ${
              chico ? "px-1.5 py-0.5 text-[11px]" : "px-2.5 py-1.5 text-xs"
            } ${
              mia
                ? "border-[#C79A4B]/60 bg-[#C79A4B]/20 text-[#F6F3EC]"
                : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            <span className={chico ? "text-sm leading-none" : "text-base leading-none"}>{r.emoji}</span>
            {cuenta > 0 && <span className="font-semibold tabular-nums">{cuenta}</span>}
          </button>
        );
      })}
    </div>
  );
}
