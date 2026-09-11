"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { Check, ChevronDown, ChevronUp, ArrowRight, X } from "lucide-react";
import type { ResumenPasos } from "@/lib/pasos-pendientes";

interface Props {
  resumen: ResumenPasos;
  /** Para recordar que ya lo cerró en ESTA invitación y no en todas. */
  slug: string;
}

const clave = (slug: string) => `alta-pasos-cerrado:${slug}`;

function yaLoCerro(slug: string): boolean {
  try {
    return localStorage.getItem(clave(slug)) === "1";
  } catch {
    // Modo privado o storage bloqueado: la tarjeta sigue andando, sólo que no
    // recuerda que la cerró.
    return false;
  }
}

// Se lee con useSyncExternalStore y no con un efecto que llame a setState: en
// el servidor localStorage no existe, así que la instantánea de allá es
// siempre `false` y el primer dibujo de React coincide con el HTML que llegó.
const oyentes = new Set<() => void>();
function suscribir(avisar: () => void) {
  oyentes.add(avisar);
  return () => {
    oyentes.delete(avisar);
  };
}

/**
 * Lo que falta para terminar una invitación.
 *
 * Se pliega solo cuando está todo hecho: un checklist con todo tildado deja de
 * ser útil y pasa a ocupar el lugar de algo que sí importa. Y desaparece del
 * todo si nunca hubo nada pendiente.
 *
 * LA CRUZ APARECE RECIÉN CUANDO ESTÁ COMPLETO, no antes. Mientras falte algo
 * es una guía y cerrarla es esconder trabajo pendiente; una vez terminado ya
 * cumplió, y quien entra todos los días a ver quién confirmó no tiene por qué
 * seguir viendo un cartel que le dice que está todo bien.
 */
export function PasosPendientes({ resumen, slug }: Props) {
  const [abierto, setAbierto] = useState(!resumen.completo);

  const cerrado = useSyncExternalStore(
    suscribir,
    () => yaLoCerro(slug),
    () => false
  );

  const cerrar = () => {
    try {
      localStorage.setItem(clave(slug), "1");
    } catch {
      /* ídem que en yaLoCerro */
    }
    oyentes.forEach((avisar) => avisar());
  };

  if (resumen.total === 0 || cerrado) return null;

  const porcentaje = Math.round((resumen.hechos / resumen.total) * 100);

  return (
    <div className="rounded-2xl border border-[var(--campo-borde-suave)] bg-card p-4">
      {/* La cruz va al lado del botón que pliega, no adentro: un botón dentro
          de otro botón no es HTML válido y el click no se sabe de quién es. */}
      <div className="flex items-start gap-2">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        className="min-w-0 flex-1 flex items-center gap-3 text-left"
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
          <div className="mt-2 h-1.5 rounded-full bg-[var(--tinte-3)] overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
              style={{ width: `${porcentaje}%` }}
            />
          </div>

          {/* El próximo paso, dicho aunque esté plegado: es lo único que hay
              que saber para seguir. */}
          {!abierto && resumen.siguiente && (
            <p className="mt-2 text-xs text-muted-foreground truncate">
              Sigue con: {resumen.siguiente.titulo}
            </p>
          )}
        </div>
        {abierto ? (
          <ChevronUp className="w-4 h-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" />
        )}
      </button>

      {/* Recién cuando está todo hecho. Mientras falte algo, cerrar la guía
          sería esconder trabajo pendiente. */}
      {resumen.completo && (
        <button
          type="button"
          onClick={cerrar}
          aria-label="No mostrar más"
          title="No mostrar más"
          className="shrink-0 -mt-1 -mr-1 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-[var(--tinte-1)] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      </div>

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
                  className="flex items-start gap-2.5 px-2 py-1.5 rounded-lg hover:bg-[var(--tinte-1)] transition-colors group"
                >
                  <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full border border-[var(--campo-borde)]" />
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
