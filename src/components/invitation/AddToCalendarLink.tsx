"use client";

import { useEffect, useState } from "react";
import { CalendarPlus } from "lucide-react";

/**
 * Versión "sin estilo propio" del link "Agregar al calendario" de
 * `v2/SaveTheDate.tsx` -- misma lógica (detección de iOS, .ics servido por
 * `/api/calendar`, link de Google Calendar en Android/desktop), pero sin
 * ningún supuesto sobre tipografía/color, para poder soltarlo dentro de las
 * plantillas de la Colección Storytelling (que no usan los componentes
 * `v2/*` compartidos, ver comentario en GuestPassVipTemplate.tsx) con la
 * clase CSS propia de cada familia.
 */

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

// Formato UTC básico requerido por RFC5545 (.ics) y por el link de Google
// Calendar -- ambos aceptan "YYYYMMDDTHHmmssZ".
function formatCalendarDate(d: Date) {
  return `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}T${pad2(d.getUTCHours())}${pad2(d.getUTCMinutes())}${pad2(d.getUTCSeconds())}Z`;
}

// iOS Safari abre un .ics con la hoja nativa "Agregar a Calendario" SOLO si
// la navegación llega desde un <a href> real -- ver el comentario largo en
// `v2/SaveTheDate.tsx` (mismo motivo, misma solución acá).
function isIOS() {
  if (typeof navigator === "undefined") return false;
  const isIPadOS = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return (/iPad|iPhone|iPod/.test(navigator.userAgent) || isIPadOS) && !("MSStream" in window);
}

interface AddToCalendarLinkProps {
  eventName: string;
  targetDate: Date;
  location?: string;
  description?: string;
  className?: string;
  style?: React.CSSProperties;
  /** Texto del link -- default "Agregar al calendario". */
  children?: React.ReactNode;
  /** Ícono de calendario antes del texto -- default true. */
  showIcon?: boolean;
  iconClassName?: string;
}

export function AddToCalendarLink({
  eventName,
  targetDate,
  location = "",
  description = "",
  className,
  style,
  children,
  showIcon = true,
  iconClassName,
}: AddToCalendarLinkProps) {
  const [isIOSDevice, setIsIOSDevice] = useState(false);

  useEffect(() => {
    setIsIOSDevice(isIOS());
  }, []);

  const start = targetDate;
  const end = new Date(targetDate.getTime() + 4 * 60 * 60 * 1000);

  const icsHref = `/api/calendar?${new URLSearchParams({
    title: eventName,
    start: start.toISOString(),
    end: end.toISOString(),
    location,
    description,
  }).toString()}`;

  const handleAddToCalendarAndroid = () => {
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: eventName,
      dates: `${formatCalendarDate(start)}/${formatCalendarDate(end)}`,
      details: description,
      location,
    });
    window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, "_blank", "noopener,noreferrer");
  };

  const label = children ?? "Agregar al calendario";
  const icon = showIcon ? <CalendarPlus className={iconClassName ?? "w-3.5 h-3.5"} strokeWidth={1.75} /> : null;

  if (isIOSDevice) {
    // Sin target="_blank" y sin download: así Safari la reconoce como
    // calendario para previsualizar, no como archivo para descargar.
    return (
      <a href={icsHref} className={className} style={style}>
        {icon}
        {label}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={handleAddToCalendarAndroid}
      className={className}
      style={{ background: "transparent", border: 0, padding: 0, cursor: "pointer", ...style }}
    >
      {icon}
      {label}
    </button>
  );
}
