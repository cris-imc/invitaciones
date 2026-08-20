import { NextRequest, NextResponse } from "next/server";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

// Formato UTC básico requerido por RFC5545 (.ics): "YYYYMMDDTHHmmssZ".
function formatCalendarDate(iso: string) {
  const d = new Date(iso);
  return `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}T${pad2(d.getUTCHours())}${pad2(d.getUTCMinutes())}${pad2(d.getUTCSeconds())}Z`;
}

function escapeICSText(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n");
}

// Sirve el .ics como una respuesta HTTP real (Content-Type: text/calendar)
// en vez de un data: URI -- iOS Safari reconoce de forma consistente un
// <a href> que navega a una URL con ese Content-Type y abre la hoja nativa
// "Agregar a Calendario" sobre la pagina actual, mientras que los data:
// URI tuvieron reportes de fallar segun la version de WebKit (bloqueo de
// navegaciones a data: por seguridad). Ver SaveTheDate.tsx.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const title = params.get("title") || "Evento";
  const start = params.get("start");
  const end = params.get("end");
  const location = params.get("location") || "";
  const description = params.get("description") || "";

  if (!start || !end) {
    return NextResponse.json({ error: "Faltan parametros start/end" }, { status: 400 });
  }

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Invitaciones//ES",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `DTSTART:${formatCalendarDate(start)}`,
    `DTEND:${formatCalendarDate(end)}`,
    `SUMMARY:${escapeICSText(title)}`,
    description ? `DESCRIPTION:${escapeICSText(description)}` : "",
    location ? `LOCATION:${escapeICSText(location)}` : "",
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");

  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="evento.ics"',
    },
  });
}
