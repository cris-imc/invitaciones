"use client";

import { format } from "date-fns";
import type { Locale } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/**
 * Campo de fecha del wizard.
 *
 * EN EL CELULAR ABRE EL SELECTOR DEL SISTEMA, no un calendario dibujado en
 * HTML. El de HTML tiene celdas de pocos milímetros pensadas para un mouse, y
 * para cambiar de año hay que ir mes por mes; el nativo es la rueda que la
 * persona ya usa en el resto de su teléfono. En escritorio se queda el
 * calendario, que ahí sí se apunta bien y muestra el mes entero de un vistazo.
 *
 * OJO CON LA ZONA HORARIA: `new Date("2027-03-12")` se interpreta como
 * medianoche UTC, que en Argentina es el 11 a las 21:00 -- la fecha se corre
 * un día. Por eso el valor del input se parte a mano y se arma una fecha
 * local.
 */

function aTextoDeInput(fecha: Date | undefined): string {
  if (!fecha || Number.isNaN(fecha.getTime())) return "";
  return format(fecha, "yyyy-MM-dd");
}

function desdeTextoDeInput(texto: string): Date | undefined {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto);
  if (!m) return undefined;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

interface Props {
  value?: Date;
  onChange: (fecha: Date | undefined) => void;
  locale: Locale;
  textoVacio: string;
  deshabilitado?: boolean;
  /** Si se pueden elegir fechas pasadas (los admin sí). */
  permitirPasado?: boolean;
}

const CLASES_CAMPO =
  "w-full pl-3 text-left font-normal bg-[var(--ink-2)] border border-[var(--campo-borde)] text-[var(--on-ink)] h-12 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed";

export function CampoFecha({ value, onChange, locale, textoVacio, deshabilitado, permitirPasado }: Props) {
  const hoy = new Date();
  const minimo = permitirPasado ? undefined : format(hoy, "yyyy-MM-dd");

  return (
    <>
      {/* Celular: el selector del sistema. `campo-nativo` por el mismo motivo
          que en CampoHora: el ícono del calendario y el panel los dibuja el
          navegador, y sin avisarle de qué lado está el tema los pinta para
          fondo claro -- negro sobre el verde oscuro del wizard. */}
      <input
        type="date"
        disabled={deshabilitado}
        min={minimo}
        value={aTextoDeInput(value)}
        onChange={(e) => onChange(desdeTextoDeInput(e.target.value))}
        className={cn(CLASES_CAMPO, "campo-nativo md:hidden pr-3")}
      />

      {/* Escritorio: el calendario, que se apunta con el mouse. */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={deshabilitado}
            className={cn(
              CLASES_CAMPO,
              "hidden md:flex hover:bg-[var(--ink-2)]/80 hover:text-[var(--on-ink)]",
              !value && "text-[var(--shell-fg-faint)]"
            )}
          >
            {value ? format(value, "PPP", { locale }) : <span>{textoVacio}</span>}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        {!deshabilitado && (
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              locale={locale}
              mode="single"
              selected={value}
              onSelect={onChange}
              disabled={(date) => !permitirPasado && date < hoy}
              initialFocus
            />
          </PopoverContent>
        )}
      </Popover>
    </>
  );
}
