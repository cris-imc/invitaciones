"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarPlus } from "lucide-react";

interface SaveTheDateProps {
  eventName: string;
  targetDate: Date;
  location?: string;
  description?: string;
  // true = fondo del bloque toma un tinte oscuro (para familias de tema
  // oscuro, mismo criterio que el prop `dark` de Countdown.tsx).
  dark?: boolean;
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

// Formato UTC básico requerido por RFC5545 (.ics) y por el link de Google
// Calendar -- ambos aceptan "YYYYMMDDTHHmmssZ".
function formatCalendarDate(d: Date) {
  return `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}T${pad2(d.getUTCHours())}${pad2(d.getUTCMinutes())}${pad2(d.getUTCSeconds())}Z`;
}

function escapeICSText(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n");
}

// iOS Safari abre un .ics con la hoja nativa "Agregar a Calendario" SOLO
// si la navegación llega desde un <a href="data:text/calendar;..."> real
// (click directo del usuario sobre un link) -- si en cambio se dispara vía
// JS con `window.location.href = dataUri` dentro de un handler, iOS no lo
// reconoce como una navegación de link y no pasa nada (confirmado: no
// funcionaba en un iPhone 15 real). Por eso en iOS se renderiza un <a>
// verdadero en vez de un <button onClick>. En Android, en cambio, el link
// de Google Calendar (calendar.google.com/calendar/render) es el que mejor
// abre la app o la versión web sin fricción -- no hay un único link
// universal que ande bien en las dos a la vez.
function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);
}

// --- Corrección automática de contraste (WCAG) ---
// Las 22 familias definen su propio "--t-acc"/"--t-muted"/"--t-bg", pero
// esos colores fueron elegidos por identidad de marca, no por contraste
// garantizado en TODOS los usos -- una auditoría real (relative luminance,
// formula WCAG) sobre los 128 archivos de plantilla mostró que ~45% de las
// combinaciones quedan por debajo del mínimo legible (4.5:1 para texto
// chico, 3:1 para texto grande) contra su propio fondo. En vez de curar el
// color a mano familia por familia (inviable a esta escala y se desactualiza
// solo con tocar un hex), se lee el valor RESUELTO real de cada variable en
// el navegador (getComputedStyle, ver useEffect más abajo) y si no alcanza
// el contraste mínimo contra "--t-bg", se mezcla algorítmicamente hacia
// negro o blanco (el que corresponda según si el fondo es claro u oscuro)
// hasta alcanzarlo -- conserva el matiz de marca todo lo posible, solo lo
// ajusta lo necesario para que se lea.
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function rgbToHex([r, g, b]: [number, number, number]) {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0"))
      .join("")
  );
}

function relativeLuminance([r, g, b]: [number, number, number]) {
  const f = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrastRatio(rgb1: [number, number, number], rgb2: [number, number, number]) {
  const l1 = relativeLuminance(rgb1);
  const l2 = relativeLuminance(rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function mixRgb(rgb: [number, number, number], target: [number, number, number], t: number): [number, number, number] {
  return [rgb[0] + (target[0] - rgb[0]) * t, rgb[1] + (target[1] - rgb[1]) * t, rgb[2] + (target[2] - rgb[2]) * t];
}

const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

// Mezcla fgHex hacia negro o blanco (el que más contraste sume contra
// bgHex) hasta llegar a minRatio, con un tope de mezcla (maxMix) para no
// terminar en negro/blanco puro y perder el color de marca por completo.
function ensureContrast(fgHex: string, bgHex: string, minRatio: number, maxMix = 0.88): string {
  if (!HEX_RE.test(fgHex) || !HEX_RE.test(bgHex)) return fgHex;
  const fg = hexToRgb(fgHex);
  const bg = hexToRgb(bgHex);
  if (contrastRatio(fg, bg) >= minRatio) return fgHex;

  const bgIsLight = relativeLuminance(bg) > 0.5;
  const target: [number, number, number] = bgIsLight ? [0, 0, 0] : [255, 255, 255];

  let lo = 0;
  let hi = maxMix;
  let best = fgHex;
  for (let i = 0; i < 14; i++) {
    const mid = (lo + hi) / 2;
    const mixed = mixRgb(fg, target, mid);
    if (contrastRatio(mixed, bg) >= minRatio) {
      best = rgbToHex(mixed);
      hi = mid;
    } else {
      lo = mid;
    }
  }
  return best;
}

export function SaveTheDate({ eventName, targetDate, location = "", description = "", dark = false }: SaveTheDateProps) {
  const rootRef = useRef<HTMLElement>(null);
  const [safeAcc, setSafeAcc] = useState<string | undefined>(undefined);
  const [safeMuted, setSafeMuted] = useState<string | undefined>(undefined);
  // Arranca en `false` (mismo render que el servidor) y se corrige recién
  // despues del mount -- evita mismatch de hidratación entre servidor y
  // cliente por usar `navigator` durante el render.
  const [isIOSDevice, setIsIOSDevice] = useState(false);

  useEffect(() => {
    setIsIOSDevice(isIOS());
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const cs = getComputedStyle(el);
    const bgFallback = dark ? "#000000" : "#ffffff";
    const bg = cs.getPropertyValue("--t-bg").trim() || bgFallback;
    const acc = cs.getPropertyValue("--t-acc").trim();
    const muted = cs.getPropertyValue("--t-muted").trim();
    if (HEX_RE.test(acc) && HEX_RE.test(bg)) setSafeAcc(ensureContrast(acc, bg, 4.5));
    if (HEX_RE.test(muted) && HEX_RE.test(bg)) setSafeMuted(ensureContrast(muted, bg, 4.5));
  }, [dark]);

  const dayNum = targetDate.getDate();
  const monthNameRaw = targetDate.toLocaleDateString("es-AR", { month: "long" });
  const monthName = monthNameRaw.charAt(0).toUpperCase() + monthNameRaw.slice(1);
  const weekdayRaw = targetDate.toLocaleDateString("es-AR", { weekday: "long" });
  const weekday = weekdayRaw.charAt(0).toUpperCase() + weekdayRaw.slice(1);
  const year = targetDate.getFullYear();

  const start = targetDate;
  const end = new Date(targetDate.getTime() + 4 * 60 * 60 * 1000);

  // Href del .ics para el <a> real en iOS -- se calcula siempre (es barato)
  // para que el link ya tenga el href correcto apenas se decide renderizarlo
  // como <a>, sin depender de un onClick que dispare la navegación por JS.
  const icsHref = `data:text/calendar;charset=utf-8,${encodeURIComponent(
    [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Invitaciones//ES",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `DTSTART:${formatCalendarDate(start)}`,
      `DTEND:${formatCalendarDate(end)}`,
      `SUMMARY:${escapeICSText(eventName)}`,
      description ? `DESCRIPTION:${escapeICSText(description)}` : "",
      location ? `LOCATION:${escapeICSText(location)}` : "",
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ]
      .filter(Boolean)
      .join("\r\n")
  )}`;

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

  const accColor = safeAcc ?? "var(--t-acc)";
  const mutedColor = safeMuted ?? "var(--t-muted, #8F8F98)";

  return (
    <section
      ref={rootRef}
      className={`w-full py-12 px-6 flex flex-col items-center justify-center text-center${dark ? " dark" : ""}`}
      id="save-the-date"
      style={{ backgroundColor: "var(--t-bg)" }}
    >
      <p className="t-kicker" style={{ justifyContent: "center", display: "flex" }}>Save the date</p>
      <p
        style={{
          fontFamily: "var(--font-title, var(--font-cormorant)), serif",
          fontSize: "2.75rem",
          lineHeight: 1.1,
          fontWeight: 500,
          color: accColor,
          margin: "0.25rem 0 0",
        }}
      >
        {dayNum} de {monthName}
      </p>
      <p
        style={{
          fontSize: "0.8rem",
          fontFamily: "sans-serif",
          fontWeight: 500,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: mutedColor,
          margin: "0.5rem 0 1.25rem",
        }}
      >
        {weekday} · {year}
      </p>
      {isIOSDevice ? (
        // <a> real apuntando al data URI del .ics -- en iOS Safari, solo una
        // navegación de link genuina (no un window.location.href disparado
        // por JS) abre la hoja nativa "Agregar a Calendario". Sin
        // target="_blank" y sin download: así Safari la reconoce como
        // calendario para previsualizar, no como archivo para descargar.
        <a
          href={icsHref}
          className="inline-flex items-center gap-1.5 font-medium text-[0.7rem] tracking-[0.1em] uppercase cursor-pointer no-underline"
          style={{
            fontFamily: "var(--font-body-custom, var(--font-inter)), sans-serif",
            color: mutedColor,
            opacity: 0.9,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "1";
            e.currentTarget.style.color = accColor;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "0.9";
            e.currentTarget.style.color = mutedColor;
          }}
        >
          <CalendarPlus className="w-3.5 h-3.5" strokeWidth={1.75} />
          Agregar al calendario
        </a>
      ) : (
        <button
          type="button"
          onClick={handleAddToCalendarAndroid}
          className="inline-flex items-center gap-1.5 font-medium text-[0.7rem] tracking-[0.1em] uppercase cursor-pointer bg-transparent border-0 p-0"
          style={{
            fontFamily: "var(--font-body-custom, var(--font-inter)), sans-serif",
            color: mutedColor,
            opacity: 0.9,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "1";
            e.currentTarget.style.color = accColor;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "0.9";
            e.currentTarget.style.color = mutedColor;
          }}
        >
          <CalendarPlus className="w-3.5 h-3.5" strokeWidth={1.75} />
          Agregar al calendario
        </button>
      )}
    </section>
  );
}
