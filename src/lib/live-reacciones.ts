/**
 * Las reacciones que pueden dejar los invitados sobre una foto o un mensaje.
 *
 * Son cinco y no diez: en una fiesta nadie abre un menú de emojis con el
 * teléfono en una mano y una copa en la otra. Cinco entran en una fila, se
 * tocan sin apuntar y se leen de un vistazo desde la pantalla grande, que es
 * donde terminan.
 *
 * El orden es el de la fiesta, no el de Facebook: primero el brindis, que es
 * lo que la gente está haciendo, y después las de siempre.
 */

export const REACCIONES = [
  { id: "salud", emoji: "🍻", etiqueta: "Salud", campo: "reaccionSalud" },
  { id: "meGusta", emoji: "👍", etiqueta: "Me gusta", campo: "reaccionMeGusta" },
  { id: "meEncanta", emoji: "❤️", etiqueta: "Me encanta", campo: "reaccionMeEncanta" },
  { id: "meDivierte", emoji: "😂", etiqueta: "Me divierte", campo: "reaccionMeDivierte" },
  { id: "sorpresa", emoji: "😮", etiqueta: "Sorpresa", campo: "reaccionSorpresa" },
] as const;

export type ReaccionId = (typeof REACCIONES)[number]["id"];
export type CampoDeReaccion = (typeof REACCIONES)[number]["campo"];

const POR_ID = new Map(REACCIONES.map((r) => [r.id, r]));

export function esReaccionValida(v: unknown): v is ReaccionId {
  return typeof v === "string" && POR_ID.has(v as ReaccionId);
}

/** La columna que hay que incrementar. Nunca se arma el nombre con texto del pedido. */
export function campoDeReaccion(id: ReaccionId): CampoDeReaccion {
  return POR_ID.get(id)!.campo;
}

export interface ConteoDeReacciones {
  reaccionSalud?: number | null;
  reaccionMeGusta?: number | null;
  reaccionMeEncanta?: number | null;
  reaccionMeDivierte?: number | null;
  reaccionSorpresa?: number | null;
}

/** Cuántas reacciones tiene en total, para decidir si vale la pena mostrarlas. */
export function totalDeReacciones(item: ConteoDeReacciones): number {
  return REACCIONES.reduce((a, r) => a + (item[r.campo] ?? 0), 0);
}

/**
 * Lo que ya reaccionó este teléfono, guardado en el navegador.
 *
 * Acá y no en el servidor porque no hay con qué identificar a un invitado en
 * el LIVE -- entra por un link público, sin cuenta. El navegador alcanza para
 * lo que importa: que no se sume solo por tocar dos veces.
 */
const CLAVE = "alta-live-reacciones";

export function yaReacciono(itemId: string, reaccion: ReaccionId): boolean {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE) || "{}");
    return Boolean(guardado[`${itemId}:${reaccion}`]);
  } catch {
    return false;
  }
}

export function anotarReaccion(itemId: string, reaccion: ReaccionId): void {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE) || "{}");
    guardado[`${itemId}:${reaccion}`] = 1;
    localStorage.setItem(CLAVE, JSON.stringify(guardado));
  } catch {
    // Modo privado: se pierde el registro y podrá reaccionar de nuevo. En una
    // fiesta eso no es un problema que valga la pena resolver.
  }
}
