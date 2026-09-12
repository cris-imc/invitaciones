import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { campoDeReaccion, esReaccionValida } from "@/lib/live-reacciones";

/**
 * Sumar una reacción a una foto o un mensaje del LIVE.
 *
 * Es público a propósito: al LIVE se entra por un link, sin cuenta, y pedirle
 * a alguien que se registre para poner un corazón en la fiesta es perder la
 * reacción. Lo que se protege es el alcance, no la identidad:
 *
 *  - el ítem tiene que pertenecer a ESA sesión y estar activo, así que el
 *    token de una fiesta no sirve para tocar las fotos de otra;
 *  - la sesión tiene que estar en vivo -- terminada la fiesta ya no se suma;
 *  - el nombre de la columna sale de una lista cerrada y nunca del pedido.
 *
 * El incremento es atómico (`increment`), no leer-sumar-escribir: en una
 * fiesta cincuenta teléfonos tocan el mismo corazón en el mismo segundo, y
 * leer y escribir por separado perdería la mitad de los toques.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string; id: string }> }
) {
  try {
    const { token, id } = await params;
    const body = await req.json().catch(() => ({}));

    if (!esReaccionValida(body?.reaccion)) {
      return NextResponse.json({ error: "Reacción desconocida" }, { status: 400 });
    }

    const liveSession = await prisma.liveSession.findUnique({
      where: { publicToken: token },
      select: { id: true, isActive: true },
    });

    if (!liveSession || !liveSession.isActive) {
      return NextResponse.json({ error: "Momentos no está activo" }, { status: 404 });
    }

    const campo = campoDeReaccion(body.reaccion);

    // updateMany y no update: así el "pertenece a esta sesión y está activo"
    // viaja en el WHERE. Con update habría que traer el ítem antes, mirarlo y
    // recién ahí escribir, que es una consulta de más y una carrera menos.
    const resultado = await prisma.liveItem.updateMany({
      where: { id, sessionId: liveSession.id, isActive: true },
      data: { [campo]: { increment: 1 } },
    });

    if (resultado.count === 0) {
      return NextResponse.json({ error: "No se encontró" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[LIVE_REACCION_POST]", error);
    return NextResponse.json({ error: "Error al reaccionar" }, { status: 500 });
  }
}
