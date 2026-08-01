export type EventStatus = "PRE_EVENT" | "EVENT_DAY" | "POST_EVENT" | "EXPIRED";

/**
 * Retorna la fecha exacta de expiración (3 meses de vigencia a partir de la fecha del evento).
 * Función pura segura tanto para Cliente (Navegador) como Servidor.
 */
export function getInvitationExpirationDate(fechaEvento: Date | string): Date {
  const date = new Date(fechaEvento);
  if (isNaN(date.getTime())) return new Date();
  
  const exp = new Date(date);
  exp.setMonth(exp.getMonth() + 3);
  // Fijar al final del día de la fecha de expiración
  exp.setHours(23, 59, 59, 999);
  return exp;
}

/**
 * Calcula el estado del evento con respecto al día actual.
 * Función pura segura para Cliente y Servidor.
 */
export function getEventStatus(fechaEvento: Date | string, now: Date = new Date()): EventStatus {
  const eventDate = new Date(fechaEvento);
  if (isNaN(eventDate.getTime())) return "PRE_EVENT";

  const expDate = getInvitationExpirationDate(eventDate);
  if (now > expDate) {
    return "EXPIRED";
  }

  // Inicio y fin del día del evento (00:00:00.000 a 23:59:59.999 en horario local)
  const startOfEventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), 0, 0, 0, 0);
  const endOfEventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), 23, 59, 59, 999);

  if (now > endOfEventDay) {
    return "POST_EVENT";
  }

  if (now >= startOfEventDay && now <= endOfEventDay) {
    return "EVENT_DAY";
  }

  return "PRE_EVENT";
}

/**
 * Determina si la fecha del evento está bloqueada para edición (30 días antes o si ya pasó/es el día).
 * Función pura segura para Cliente y Servidor.
 */
export function isEventDateLocked(fechaEvento: Date | string, now: Date = new Date()): boolean {
  const eventDate = new Date(fechaEvento);
  if (isNaN(eventDate.getTime())) return false;

  const startOfEventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), 0, 0, 0, 0);
  const diffTime = startOfEventDay.getTime() - now.getTime();
  const daysUntilEvent = diffTime / (1000 * 60 * 60 * 24);

  return daysUntilEvent <= 30;
}
