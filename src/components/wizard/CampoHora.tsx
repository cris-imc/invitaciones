"use client";

import { cn } from "@/lib/utils";

/**
 * Campo de hora del wizard. Mismo criterio que CampoFecha: en el celular el
 * control del sistema, en escritorio uno que se elige con el mouse.
 *
 * POR QUÉ NO ES UN `<input type="time">` EN ESCRITORIO. Era lo que había, con
 * `step={300}` para que fuera de cinco en cinco. No alcanza: `step` sólo mueve
 * las flechitas y marca el valor como inválido, pero la persona igual escribe
 * 21:03 y el formulario se lo guarda. Y una fiesta no empieza a las 21:03: el
 * campo tiene que ofrecer las horas posibles, no aceptar cualquiera y después
 * quejarse. Con una lista, 21:03 directamente no existe.
 *
 * EN EL CELULAR SÍ SIGUE SIENDO EL NATIVO, porque ahí `step={300}` sí hace lo
 * que promete: la rueda del sistema muestra los minutos de cinco en cinco y no
 * hay manera de tipear otra cosa. Un desplegable de 288 opciones en una
 * pantalla de teléfono sería peor que la rueda que la persona ya conoce.
 *
 * `campo-nativo` va en los dos: el ícono del reloj y el desplegable los dibuja
 * el navegador, no la página, y sin avisarle de qué lado está el tema los
 * pinta para fondo claro -- negro sobre el verde oscuro del wizard.
 *
 * ARRANCA A LA NOCHE: sin valor, el selector abre a las 00:00 y hay que subir
 * un montón, cuando casi todos estos eventos son de noche. `horaSugerida` se
 * usa sólo si el campo está vacío, así que no pisa nada de lo ya cargado.
 */

const PASO_MINUTOS = 5;

const CLASES_CAMPO =
  "campo-nativo w-full px-3 bg-[var(--ink-2)] border border-[var(--campo-borde)] text-[var(--on-ink)] h-12 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[var(--paper)]/40 focus-visible:border-[var(--paper)] disabled:opacity-60 disabled:cursor-not-allowed";

/**
 * Las horas del día de cinco en cinco.
 *
 * `incluir` existe para las invitaciones viejas: si una quedó guardada a las
 * 21:03 y no está en la lista, el `<select>` se mostraría vacío y bastaría con
 * tocar otra cosa para perder la hora sin enterarse. Se agrega esa sola.
 */
function horasPosibles(incluir?: string): string[] {
  const horas: string[] = [];
  for (let minuto = 0; minuto < 24 * 60; minuto += PASO_MINUTOS) {
    const hh = String(Math.floor(minuto / 60)).padStart(2, "0");
    const mm = String(minuto % 60).padStart(2, "0");
    horas.push(`${hh}:${mm}`);
  }
  if (incluir && /^\d{2}:\d{2}$/.test(incluir) && !horas.includes(incluir)) {
    horas.push(incluir);
    horas.sort();
  }
  return horas;
}

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
  // El valor puede venir como "21:00:00" de la base; el <select> compara
  // texto exacto y sin recortarlo no coincidiría con ninguna opción.
  const actual = (value || "").slice(0, 5);

  // Al enfocar un campo vacío se propone la hora de la noche, para que la
  // lista abra ahí y no en la madrugada. Se puede cambiar como cualquier
  // valor.
  const proponerSiVacio = () => {
    if (!actual) onChange(horaSugerida);
  };

  return (
    <>
      {/* Celular: la rueda del sistema, de cinco en cinco. */}
      <input
        type="time"
        name={name}
        step={PASO_MINUTOS * 60}
        value={actual}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onFocus={proponerSiVacio}
        className={cn(CLASES_CAMPO, "md:hidden", className)}
      />

      {/* Escritorio: la lista. Acá 21:03 no se puede elegir porque no está.
          Sin `name`: los dos controles se dibujan siempre (los esconde el CSS,
          no React) y dos campos con el mismo nombre dentro del mismo form es
          pedir un problema. El formulario es controlado, el nombre no lo usa
          nadie para leer el valor. */}
      <select
        value={actual}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onFocus={proponerSiVacio}
        className={cn(CLASES_CAMPO, "hidden md:block", className)}
      >
        {/* Mientras no eligió nada. Desaparece apenas hay una hora: dejarlo
            invitaría a volver a "sin hora" desde un desplegable, que no es
            algo que se elija a propósito. */}
        {!actual && <option value="">--:--</option>}
        {horasPosibles(actual).map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
    </>
  );
}
