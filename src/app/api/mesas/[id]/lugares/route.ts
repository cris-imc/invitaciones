import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { accesoPorMesa, lugaresQueOcupa } from "@/lib/mesas";

/**
 * PUT - Cuántos lugares de este invitado van en esta mesa.
 *
 * Es "cuántos" y no "sentalo": una familia de 6 puede quedar 4 en la mesa 3 y
 * 2 en la mesa 4, y eso se escribe como dos filas, una por mesa. Mandar 0
 * borra la fila (lo saca de esta mesa) en vez de dejarla en cero, así la mesa
 * no arrastra invitados fantasma con los que después hay que lidiar en cada
 * consulta.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth().catch(() => null);
    const { id } = await params;

    const acceso = await accesoPorMesa(id, session);
    if (!acceso.ok) {
      return NextResponse.json({ error: acceso.error }, { status: acceso.status });
    }

    const body = await request.json().catch(() => ({}));
    const guestId = typeof body.guestId === "string" ? body.guestId : null;
    const pedidos = Math.round(Number(body.lugares));

    if (!guestId || !Number.isFinite(pedidos)) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    // El invitado tiene que ser de esta misma invitación: sin este chequeo,
    // conociendo un id cualquiera se podría sentar gente de otro evento.
    const guest = await prisma.guest.findFirst({
      where: { id: guestId, invitationId: acceso.invitationId },
      select: {
        id: true,
        status: true,
        expectedCount: true,
        attendingCount: true,
        lugaresEnMesas: { select: { mesaId: true, lugares: true } },
      },
    });
    if (!guest) {
      return NextResponse.json({ error: "Invitado no encontrado" }, { status: 404 });
    }

    if (pedidos <= 0) {
      await prisma.mesaLugar.deleteMany({ where: { mesaId: id, guestId } });
      return NextResponse.json({ lugares: 0, ajustado: false });
    }

    // Tope: lo que falta sentar de esta familia, sin contar lo que ya tiene en
    // ESTA mesa (que es justamente lo que se está por reemplazar).
    const enOtrasMesas = guest.lugaresEnMesas
      .filter((l) => l.mesaId !== id)
      .reduce((a, l) => a + l.lugares, 0);
    const disponibles = Math.max(0, lugaresQueOcupa(guest) - enOtrasMesas);

    if (disponibles === 0) {
      return NextResponse.json(
        { error: "Ya están ubicados todos los lugares de este invitado" },
        { status: 400 }
      );
    }

    // Se recorta en vez de fallar: el que arrastra una familia de 6 a una mesa
    // donde entran 2 quiere sentar a esos 2, no un cartel de error.
    const lugares = Math.min(pedidos, disponibles);

    await prisma.mesaLugar.upsert({
      where: { mesaId_guestId: { mesaId: id, guestId } },
      create: { mesaId: id, guestId, lugares },
      update: { lugares },
    });

    return NextResponse.json({ lugares, ajustado: lugares !== pedidos });
  } catch (error) {
    console.error("Error al asignar lugares:", error);
    return NextResponse.json({ error: "Error al asignar lugares" }, { status: 500 });
  }
}
