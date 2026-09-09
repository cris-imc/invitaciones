import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { accesoPorSlug, lugaresQueOcupa } from "@/lib/mesas";

/**
 * POST - Resuelve un QR escaneado en la puerta: quién es, cuántos vienen, qué
 * hay que saber de ellos y a qué mesa van. Y deja registrado que llegaron.
 *
 * El ingreso se guarda en `Guest.ingresoEn`, aparte de `status`: ese dice si
 * avisó que venía, esto dice que efectivamente entró. Se marca una sola vez
 * -- si la misma familia vuelve a pasar el QR, se devuelve la hora original en
 * vez de pisarla, para que la hora de llegada siga siendo la de llegada.
 */
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
    const bruto = typeof body.token === "string" ? body.token.trim() : "";
    if (!bruto) {
      return NextResponse.json({ error: "Falta el código" }, { status: 400 });
    }

    // El QR lleva el enlace completo de la invitación, no el token pelado: así
    // quien lo escanee con la cámara del teléfono abre la invitación. Acá se
    // acepta cualquiera de las dos formas -- la URL o el token suelto -- y de
    // la URL se toma el último tramo, que es el token.
    const token = bruto.includes("/") ? bruto.split(/[?#]/)[0].split("/").filter(Boolean).pop() ?? "" : bruto;

    const guest = await prisma.guest.findFirst({
      // Acotado a ESTA invitación: un token válido de otro evento no tiene por
      // qué abrir la puerta de este.
      where: { uniqueToken: token, invitationId: acceso.invitationId },
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
        expectedCount: true,
        expectedAdults: true,
        expectedTeens: true,
        expectedChildren: true,
        attendingCount: true,
        attendingAdults: true,
        attendingTeens: true,
        attendingChildren: true,
        dietaryRestrictions: true,
        hostNotes: true,
        ingresoEn: true,
        lugaresEnMesas: {
          select: { lugares: true, mesa: { select: { numero: true, alias: true } } },
          orderBy: { mesa: { numero: "asc" } },
        },
      },
    });

    if (!guest) {
      return NextResponse.json(
        { error: "Ese código no es de este evento" },
        { status: 404 }
      );
    }

    const yaHabiaEntrado = guest.ingresoEn !== null;
    const ingresoEn = guest.ingresoEn ?? new Date();
    if (!yaHabiaEntrado) {
      await prisma.guest.update({ where: { id: guest.id }, data: { ingresoEn } });
    }

    const confirmo = guest.status === "CONFIRMED";
    // Confirmados: lo que dijeron que vienen. Sin confirmar: a cuántos se
    // invitó, que es lo único que se sabe de ellos en la puerta.
    const adultos = confirmo ? guest.attendingAdults : guest.expectedAdults ?? 0;
    const adolescentes = confirmo ? guest.attendingTeens : guest.expectedTeens ?? 0;
    const ninos = confirmo ? guest.attendingChildren : guest.expectedChildren ?? 0;

    return NextResponse.json({
      nombre: guest.name,
      esGrupo: guest.type !== "INDIVIDUAL",
      personas: lugaresQueOcupa(guest),
      confirmo,
      // El desglose sólo si suma algo: muchas invitaciones no cargan franjas y
      // repetir "6 adultos" debajo de "6 personas" es ruido.
      desglose:
        adultos + adolescentes + ninos > 0
          ? { adultos, adolescentes, ninos }
          : null,
      restricciones: guest.dietaryRestrictions || null,
      notas: guest.hostNotes || null,
      yaHabiaEntrado,
      ingresoEn: ingresoEn.toISOString(),
      // Con cuántos lugares en cada una: en la puerta, "4 en la 3 y 2 en la 4"
      // es lo que hay que decirle a la familia, no sólo los números de mesa.
      mesas: guest.lugaresEnMesas.map((l) => ({
        numero: l.mesa.numero,
        alias: l.mesa.alias,
        lugares: l.lugares,
      })),
    });
  } catch (error) {
    console.error("Error al resolver el ingreso:", error);
    return NextResponse.json({ error: "Error al leer el código" }, { status: 500 });
  }
}
