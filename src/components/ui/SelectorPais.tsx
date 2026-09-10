"use client";

import { PAISES_ORDENADOS, type CodigoPais } from "@/lib/paises";
import { cn } from "@/lib/utils";

/**
 * Selector del país del ANFITRIÓN (el que crea la cuenta y la invitación).
 *
 * De acá sale qué datos bancarios se le piden después para que sus invitados
 * le transfieran: CBU y alias en Argentina, una clave PIX en Brasil, routing +
 * account number en Estados Unidos (ver src/lib/paises.ts).
 *
 * POR QUÉ SE PREGUNTA Y NO SE DEDUCE: la IP o el idioma del navegador son los
 * de quien está mirando la pantalla, y un anfitrión puede estar de viaje, o
 * mirar su propia invitación desde otro país. El dato que importa es dónde
 * tiene la cuenta bancaria, y eso sólo lo sabe él.
 *
 * La lista sale siempre de PAISES_ORDENADOS: sumar un país es tocar un solo
 * archivo, no cada formulario que lo ofrece.
 */
export function SelectorPais({
    id,
    valor,
    onCambio,
    disabled,
    className,
}: {
    id: string;
    valor: CodigoPais;
    onCambio: (pais: CodigoPais) => void;
    disabled?: boolean;
    className?: string;
}) {
    return (
        <select
            id={id}
            name="pais"
            value={valor}
            onChange={(e) => onCambio(e.target.value as CodigoPais)}
            disabled={disabled}
            required
            className={cn(
                "campo-nativo h-12 w-full min-w-0 rounded-xl border border-[var(--campo-borde)] bg-[var(--ink-2)] px-4 py-2 text-[var(--on-ink)] shadow-xs transition-all outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 text-base md:text-sm",
                "focus-visible:ring-2 focus-visible:ring-[var(--paper)]/40 focus-visible:border-[var(--paper)]",
                className
            )}
        >
            {PAISES_ORDENADOS.map((pais) => (
                <option key={pais.codigo} value={pais.codigo}>
                    {pais.nombre}
                </option>
            ))}
        </select>
    );
}
