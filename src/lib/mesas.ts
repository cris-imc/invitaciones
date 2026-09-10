import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/roles";
import { canUseFeature, PlanTier } from "@/lib/plan-limits";

export const FORMAS = ["REDONDA", "RECTANGULAR"] as const;
export type FormaMesa = (typeof FORMAS)[number];

// Una mesa de menos de 2 no es una mesa, y arriba de 20 el dibujo del panel
// deja de ser legible (las sillas se pisan unas con otras alrededor del disco).
export const SILLAS_MIN = 2;
export const SILLAS_MAX = 20;
export const SILLAS_DEFAULT = 8;

// Tope de seguridad, no una regla del negocio: evita que un bug de la UI o un
// click repetido llene la base de mesas vacías. Un salón real no pasa de acá.
export const MESAS_MAX = 60;

export interface GuestParaMesas {
  id: string;
  name: string;
  type: string;
  status: string;
  expectedCount: number;
  attendingCount: number;
}

/**
 * Cuánta gente hay que sentar de este invitado.
 *
 * Sólo los que confirmaron, y con lo que dijeron que vienen: una familia
 * invitada de 6 que confirma 4 ocupa 4 sillas, no 6.
 *
 * Los pendientes no ocupan nada y por eso no aparecen para ubicar. Sentar a
 * alguien que todavía no dijo si viene es acomodar el salón con un número
 * inventado: si al final vienen tres en vez de seis, hay que rehacer las mesas
 * de alrededor. Cuando confirme, aparece solo en la lista.
 */
export function lugaresQueOcupa(g: {
  status: string;
  expectedCount: number;
  attendingCount: number;
}): number {
  return g.status === "CONFIRMED" ? g.attendingCount : 0;
}

export function esFormaValida(v: unknown): v is FormaMesa {
  return typeof v === "string" && (FORMAS as readonly string[]).includes(v);
}

/**
 * Cómo se llama esta mesa para el invitado. Siempre el número, nunca el alias:
 * el anfitrión le puede haber puesto "Primos" para organizarse, pero un invitado
 * que lee "Primos" en su invitación no sabe a dónde ir. El cartel arriba de la
 * mesa el día del evento va a decir "Mesa 4", y eso es lo que tiene que leer.
 */
export function nombrePublico(mesa: { numero: number }): string {
  return `Mesa ${mesa.numero}`;
}

/** El alias, recortado, o null si viene vacío o es sólo espacios. */
export function normalizarAlias(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const limpio = v.trim().slice(0, 40);
  return limpio.length > 0 ? limpio : null;
}

export function normalizarSillas(v: unknown): number {
  const n = Math.round(Number(v));
  if (!Number.isFinite(n)) return SILLAS_DEFAULT;
  return Math.min(SILLAS_MAX, Math.max(SILLAS_MIN, n));
}

/**
 * Las posiciones se guardan en porcentaje del lienzo y no en píxeles: el panel
 * se ve en un monitor de 27" y en un teléfono, y un x=840px que en desktop cae
 * en el medio del salón, en mobile queda fuera de la pantalla.
 */
export function normalizarPos(v: unknown, porDefecto: number): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return porDefecto;
  return Math.min(100, Math.max(0, n));
}

interface AccesoOk {
  ok: true;
  invitationId: string;
  mesasHabilitadas: boolean;
  escaneoHabilitado: boolean;
}
interface AccesoError {
  ok: false;
  status: number;
  error: string;
}
export type Acceso = AccesoOk | AccesoError;

/**
 * Dueño (o admin) + el plan tiene mesas. Las dos cosas juntas, porque cualquiera
 * de las dos sola deja un agujero: sin la primera se editan las mesas de otro,
 * y sin la segunda alcanza con pegarle a la API para saltarse la pestaña
 * bloqueada del panel.
 */
async function verificar(
  invitation:
    | { id: string; userId: string; planTier: string; mesasHabilitadas: boolean; escaneoHabilitado: boolean }
    | null,
  session: { user?: { id?: string; role?: string | null } } | null
): Promise<Acceso> {
  if (!session?.user?.id) return { ok: false, status: 401, error: "No autenticado" };
  if (!invitation) return { ok: false, status: 404, error: "Invitación no encontrada" };

  const admin = isAdmin(session.user.role);
  if (invitation.userId !== session.user.id && !admin) {
    return { ok: false, status: 403, error: "Sin permiso" };
  }
  if (!admin && !canUseFeature(invitation.planTier as PlanTier, "tableAssignment")) {
    return { ok: false, status: 403, error: "Las mesas están disponibles en Diamond" };
  }
  return {
    ok: true,
    invitationId: invitation.id,
    mesasHabilitadas: invitation.mesasHabilitadas,
    escaneoHabilitado: invitation.escaneoHabilitado,
  };
}

export async function accesoPorSlug(
  slug: string,
  session: { user?: { id?: string; role?: string | null } } | null
): Promise<Acceso> {
  const invitation = await prisma.invitation.findUnique({
    where: { slug },
    select: { id: true, userId: true, planTier: true, mesasHabilitadas: true, escaneoHabilitado: true },
  });
  return verificar(invitation, session);
}

export async function accesoPorMesa(
  mesaId: string,
  session: { user?: { id?: string; role?: string | null } } | null
): Promise<Acceso> {
  const mesa = await prisma.mesa.findUnique({
    where: { id: mesaId },
    select: {
      invitation: {
        select: { id: true, userId: true, planTier: true, mesasHabilitadas: true, escaneoHabilitado: true },
      },
    },
  });
  return verificar(mesa?.invitation ?? null, session);
}
