"use client";

import { Clock } from "lucide-react";
import { Input } from "@/components/ui/input";

/**
 * Campo de hora del wizard.
 *
 * Tres cosas que antes molestaban:
 *
 * 1. SE VEÍA RARO. El input traía `[&::-webkit-calendar-picker-indicator]:hidden`,
 *    que esconde el ícono con el que el navegador abre su propio selector, y
 *    encima se forzaba `showPicker()` al hacer clic en cualquier parte. Quedaba
 *    un campo que no parecía un campo de hora y que abría un panel al tocarlo
 *    en cualquier lado. Ahora se deja el control nativo como es: en el celular
 *    abre la rueda del sistema, que es lo que la gente espera.
 *
 * 2. DE 5 EN 5. `step={300}` (segundos) hace que el selector nativo se mueva
 *    de cinco en cinco minutos en vez de de uno en uno. Nadie pone una fiesta
 *    a las 21:37, y bajar de minuto en minuto hasta las 21:30 es tedioso.
 *
 * 3. ARRANCA A LA NOCHE. Sin valor, el selector del navegador abre a las 00:00
 *    o a la hora actual, y hay que subir un montón: casi todos estos eventos
 *    son de noche. `horaSugerida` se usa sólo cuando el campo está vacío, así
 *    que no pisa nada de lo que ya haya cargado.
 */
export function CampoHora({
  value,
  onChange,
  onBlur,
  name,
  horaSugerida = "21:00",
  className,
}: {
  value?: string;
  onChange: (valor: string) => void;
  onBlur?: () => void;
  name?: string;
  /** A qué hora abre el selector cuando el campo está vacío. */
  horaSugerida?: string;
  className?: string;
}) {
  return (
    <div className="relative">
      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
      <Input
        type="time"
        name={name}
        // De cinco en cinco minutos.
        step={300}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        // Al enfocar un campo vacío se propone la hora de la noche, para que
        // el selector abra ahí y no en la madrugada. Se puede borrar o cambiar
        // como cualquier valor.
        onFocus={(e) => {
          if (!e.target.value) onChange(horaSugerida);
        }}
        className={className ?? "pl-9"}
      />
    </div>
  );
}
