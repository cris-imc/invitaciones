"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import type { ResumenPasos } from "@/lib/pasos-pendientes";

interface Props {
  resumen: ResumenPasos;
}

/**
 * Lo que falta para terminar una invitación.
 *
 * Se pliega solo cuando está todo hecho: un checklist con todo tildado deja de
 * ser útil y pasa a ocupar el lugar de algo que sí importa. Y desaparece del
 * todo si nunca hubo nada pendiente.
 */
export function PasosPendientes({ resumen }: Props) {
  const [abierto, setAbierto] = useState(!resumen.completo);

  if (resumen.total === 0) return null;

  const porcentaje = Math.round((resumen.hechos / resumen.total) * 100);

  return (
    <div className="rounded-2xl border border-white/10 bg-card p-4">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="w-full flex items-center gap-3 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">
              {resumen.completo ? "Tu invitación está lista" : "Lo que falta"}
            </h3>
            <span className="text-xs text-muted-foreground">
              {resumen.hechos} de {resumen.total}
            </span>
          </div>

          {/* La barra hace el trabajo del número: se entiende sin leer. */}
          <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
              style={{ width: `${porcentaje}%` }}
            />
          </div>

          {/* El próximo paso, dicho aunque esté plegado: es lo único que hay
              que saber para seguir. */}
          {!abierto && resumen.siguiente && (
            <p className="mt-2 text-xs text-muted-foreground truncate">
              Seguí con: {resumen.siguiente.titulo}
            </p>
          )}
        </div>
        {abierto ? (
          <ChevronUp className="w-4 h-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" />
        )}
      </button>

      {abierto && (
        <ul className="mt-3 space-y-1.5">
          {resumen.pasos.map((p) => (
            <li key={p.id}>
              {p.hecho ? (
                <div className="flex items-start gap-2.5 px-2 py-1.5 opacity-50">
                  <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-emerald-400" />
                  </span>
                  <span className="text-sm line-through">{p.titulo}</span>
                </div>
              ) : (
                <Link
                  href={p.ir}
                  className="flex items-start gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors group"
                >
                  <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full border border-white/25" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{p.titulo}</span>
                    <span className="block text-xs text-muted-foreground leading-snug">
                      {p.ayuda}
                    </span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0 mt-1 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
