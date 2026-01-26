import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea una fecha asegurándose de usar la fecha UTC para evitar problemas de zona horaria
 * Las fechas se guardan con hora 12:00 UTC, así que al mostrarlas debemos usar getUTCDate(), getUTCMonth(), etc.
 */
export function formatEventDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Usar métodos UTC para obtener los componentes de la fecha
  return dateObj.toLocaleDateString('es-AR', {
    ...options,
    timeZone: 'UTC', // Importante: usar UTC para evitar conversión de zona horaria
  });
}

/**
 * Obtiene el día del mes de la fecha del evento sin conversión de zona horaria
 */
export function getEventDay(date: Date | string): number {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.getUTCDate(); // Usar UTC
}

/**
 * Obtiene el mes de la fecha del evento (0-11) sin conversión de zona horaria
 */
export function getEventMonth(date: Date | string): number {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.getUTCMonth(); // Usar UTC
}

/**
 * Obtiene el año de la fecha del evento sin conversión de zona horaria
 */
export function getEventYear(date: Date | string): number {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.getUTCFullYear(); // Usar UTC
}
