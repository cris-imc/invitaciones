import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import {
  accesoPorSlug,
  esFormaValida,
  lugaresQueOcupa,
  normalizarAlias,
  normalizarPos,
  normalizarSillas,
  MESAS_MAX,
  SILLAS_DEFAULT,
} from "@/lib/mesas";

// GET - El plano completo: las mesas con su gente y la lista de invitados con
// cuántos lugares hay que sentarles. Va todo junto en una sola respuesta
// porque el panel no sirve de nada con la mitad: para dibujar "faltan 3 por
// ubicar" hacen falta las dos puntas.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth().catch(() => null);
    const { slug } = await params;

    const acceso = await accesoPorSlug(slug, session);
    if (!acceso.ok) {
      return NextResponse.json({ error: acceso.error }, { status: acceso.status });
    }

    const [mesas, guests] = await Promise.all([
      prisma.mesa.findMany({
        where: { invitationId: acceso.invitationId },
        orderBy: { orden: "asc" },
        include: {
          lugares: { select: { id: true, guestId: true, lugares: true } },
        },
      }),
      prisma.guest.findMany({
        where: { invitationId: acceso.invitationId },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          type: true,
          status: true,
          expectedCount: true,
          attendingCount: true,
        },
      }),
    ]);

    return NextResponse.json({
      mesas,
      habilitadas: acceso.mesasHabilitadas,
      invitados: guests.map((g) => ({ ...g, aSentar: lugaresQueOcupa(g) })),
    });
  } catch (error) {
    console.error("Error al obtener las mesas:", error);
    return NextResponse.json({ error: "Error al obtener las mesas" }, { status: 500 });
  }
}

// POST - Nueva mesa
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth().catch(() => null);
    const { slug } = await params;

    const acceso = await accesoPorSlug(slug, session);
    if (!acceso.ok) {
      return NextResponse.json({ error: acceso.error }, { status: acceso.status });
    }

    const body = await request.json().catch(() => ({}));

    const cuantas = await prisma.mesa.count({ where: { invitationId: acceso.invitationId } });
    if (cuantas >= MESAS_MAX) {
      return NextResponse.json(
        { error: `No se pueden crear más de ${MESAS_MAX} mesas` },
        { status: 400 }
      );
    }

    // El número sale del mayor que haya, no de la cantidad: si se borró la
    // mesa 3 de 5, contar da 4 y la nueva sería otra "Mesa 5". Dos mesas con
    // el mismo número el día del evento es gente parada sin saber dónde ir.
    const ultima = await prisma.mesa.findFirst({
      where: { invitationId: acceso.invitationId },
      orderBy: { numero: "desc" },
      select: { numero: true, orden: true },
    });
    const numero = (ultima?.numero ?? 0) + 1;

    const mesa = await prisma.mesa.create({
      data: {
        invitationId: acceso.invitationId,
        numero,
        alias: normalizarAlias(body.alias),
        sillas: body.sillas === undefined ? SILLAS_DEFAULT : normalizarSillas(body.sillas),
        forma: esFormaValida(body.forma) ? body.forma : "REDONDA",
        posX: normalizarPos(body.posX, 50),
        posY: normalizarPos(body.posY, 50),
        orden: (ultima?.orden ?? -1) + 1,
      },
      include: { lugares: { select: { id: true, guestId: true, lugares: true } } },
    });

    return NextResponse.json(mesa);
  } catch (error) {
    console.error("Error al crear la mesa:", error);
    return NextResponse.json({ error: "Error al crear la mesa" }, { status: 500 });
  }
}
