import { prisma } from "@/lib/db";

/**
 * Qué invitación se muestra cuando alguien toca "Ver una invitación real".
 *
 * ANTES ERA UNA URL ESCRITA A MANO, con el slug y el token de un invitado
 * concreto. Tres problemas, y los tres se vieron:
 *
 * 1. Apuntaba a una invitación del plan GRATIS. El visitante llegaba a una
 *    invitación con el cartel de "creada con el plan gratis" arriba y sin
 *    música, sin trivia y sin varias de las cosas que la landing le acababa
 *    de prometer. El botón que existe para convencer estaba mostrando la
 *    versión más pobre del producto.
 *
 * 2. Llevaba el TOKEN PERSONAL de un invitado de verdad. Ese token es el
 *    secreto con el que cualquiera puede confirmar o rechazar la asistencia
 *    en nombre de esa persona: publicarlo en la home es dárselo a todo el
 *    mundo. Ahora va a /i/<slug>, la vista genérica, que no tiene token.
 *
 * 3. Escrito a mano no se entera de nada. Si esa invitación se borra, vence o
 *    cambia de plan, el botón sigue apuntando ahí y nadie se entera hasta que
 *    un cliente lo cuenta.
 *
 * Ahora se elige contra la base, con un criterio explícito: activa, de un
 * plan que muestre todo, DE LA CASA, y de las que quedan la que más funciones
 * tenga prendidas. Si no hay ninguna que valga la pena mostrar, no se muestra
 * el botón -- es mejor no ofrecer el ejemplo que ofrecer uno malo.
 *
 * Lo de "de la casa" no es un detalle: la home es pública, y elegir la mejor
 * invitación que haya sin mirar de quién es sería publicar el casamiento de
 * un cliente en la portada del sitio sin habérselo pedido.
 */

/** Se puede fijar a mano desde el entorno, sin tocar el código ni deployar. */
const SLUG_FIJADO = process.env.INVITACION_DE_EJEMPLO;

/** Los planes que muestran el producto completo, sin cartel de plan gratis. */
const PLANES_QUE_MUESTRAN_TODO = ["DIAMOND", "PREMIUM", "ADMIN", "ENTERPRISE"];

interface Candidata {
  slug: string;
  planTier: string;
  musicaHabilitada: boolean | null;
  musicaUrl: string | null;
  triviaHabilitada: boolean | null;
  regaloHabilitado: boolean | null;
  sugerenciaMusicaHabilitada: boolean | null;
  portadaImagenFondo: string | null;
}

const CAMPOS = {
  slug: true,
  planTier: true,
  musicaHabilitada: true,
  musicaUrl: true,
  triviaHabilitada: true,
  regaloHabilitado: true,
  sugerenciaMusicaHabilitada: true,
  portadaImagenFondo: true,
} as const;

/**
 * Cuántas de las cosas que la landing promete tiene prendidas.
 *
 * Se usa para desempatar: entre dos invitaciones Premium activas, la que
 * muestra más producto es mejor ejemplo. La portada pesa doble porque es lo
 * primero que se ve, y una invitación de ejemplo sin foto de portada arranca
 * mal antes de que la persona baje un pixel.
 */
function cuantoMuestra(i: Candidata): number {
  return (
    (i.portadaImagenFondo ? 2 : 0) +
    (i.musicaHabilitada && i.musicaUrl ? 1 : 0) +
    (i.triviaHabilitada ? 1 : 0) +
    (i.regaloHabilitado ? 1 : 0) +
    (i.sugerenciaMusicaHabilitada ? 1 : 0) +
    (i.planTier === "DIAMOND" ? 1 : 0)
  );
}

/**
 * La URL del ejemplo, o `null` si no hay ninguna que valga la pena mostrar.
 *
 * Que falle no puede tumbar la home: si la consulta se rompe, se devuelve
 * null y la landing sigue viva sin ese botón.
 */
export async function urlDeInvitacionDeEjemplo(): Promise<string | null> {
  try {
    if (SLUG_FIJADO) {
      const fijada = await prisma.invitation.findUnique({
        where: { slug: SLUG_FIJADO },
        select: CAMPOS,
      });
      // Se respeta aunque sea Gratis: si alguien la fijó a mano, sabrá por
      // qué. Lo único que no se puede es apuntar a una que no existe.
      if (fijada) return `/i/${fijada.slug}`;
    }

    const candidatas = await prisma.invitation.findMany({
      where: {
        estado: "ACTIVA",
        planTier: { in: PLANES_QUE_MUESTRAN_TODO },
        // Una invitación cuya fecha ya pasó abre en el post evento: como
        // ejemplo de lo que vas a poder armar, no sirve.
        fechaEvento: { gt: new Date() },
        // SÓLO INVITACIONES DE LA CASA. Esto es lo más importante de este
        // archivo: la home es pública, y elegir "la Premium más nueva" sin
        // este filtro sería publicar el casamiento de un cliente -- con los
        // nombres, el salón, las fotos y la lista de regalos -- en la portada
        // del sitio, sin habérselo pedido. El ejemplo tiene que ser una
        // invitación propia, armada para mostrar.
        user: { role: { in: ["ADMIN", "SUPERUSER"] } },
      },
      select: CAMPOS,
      // Un techo: alcanza para elegir bien y no trae la tabla entera.
      take: 50,
      orderBy: { createdAt: "desc" },
    });

    if (candidatas.length === 0) return null;

    const mejor = candidatas.reduce((a, b) => (cuantoMuestra(b) > cuantoMuestra(a) ? b : a));
    return `/i/${mejor.slug}`;
  } catch (error) {
    console.error("No se pudo elegir la invitación de ejemplo:", error);
    return null;
  }
}
