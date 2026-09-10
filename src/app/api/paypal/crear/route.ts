import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { crearOrden, paypalDisponible } from "@/lib/paypal";
import { esCodigoPais } from "@/lib/paises";
import { costumbresDe } from "@/lib/costumbres-por-pais";
import { precioParaPayPal } from "@/lib/precios-por-pais";

/**
 * Arranca un cobro por PayPal y devuelve a dónde mandar al comprador.
 *
 * El monto y la moneda se calculan ACÁ, en el servidor, a partir del plan y
 * del país del usuario. Nunca se toman del cuerpo del pedido: si el precio
 * viniera del navegador, cualquiera podría comprar Diamond por un dólar.
 */
export async function POST(request: NextRequest) {
  if (!paypalDisponible()) {
    return NextResponse.json(
      { error: "El cobro por PayPal todavía no está configurado." },
      { status: 503 }
    );
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { planTier } = (await request.json()) as { planTier?: string };
  if (planTier !== "PREMIUM" && planTier !== "DIAMOND") {
    return NextResponse.json({ error: "Plan inválido" }, { status: 400 });
  }

  const usuario = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { pais: true, email: true },
  });
  const pais = esCodigoPais(usuario?.pais) ? usuario.pais : "AR";

  if (!costumbresDe(pais).mediosDePago.includes("paypal")) {
    return NextResponse.json(
      { error: "PayPal no está disponible en tu país." },
      { status: 400 }
    );
  }

  // Por PayPal se cobra en una moneda que PayPal acepte, que no siempre
  // es la que se le muestra al cliente (ver precioParaPayPal).
  const precio = precioParaPayPal(planTier, pais);

  // El Payment se crea PENDING antes de hablar con PayPal: su id es la
  // referencia que viaja con la orden y vuelve en la captura. Sin eso no hay
  // forma de saber qué pago se acreditó sin confiar en el navegador.
  const pago = await prisma.payment.create({
    data: {
      userId: session.user.id,
      amount: precio.monto,
      currency: precio.moneda,
      status: "PENDING",
      planTier,
      proveedor: "paypal",
      paymentMethod: "paypal",
    },
  });

  try {
    const urlBase = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
    const orden = await crearOrden({
      monto: precio.monto,
      moneda: precio.moneda,
      descripcion: `altainvitacion.com — plan ${planTier}`,
      referencia: pago.id,
      urlBase,
    });

    await prisma.payment.update({
      where: { id: pago.id },
      data: { paypalOrderId: orden.ordenId },
    });

    return NextResponse.json({ url: orden.urlDeAprobacion });
  } catch (error) {
    // El Payment queda marcado y no PENDING para siempre: un pendiente eterno
    // ensucia los informes y hace pensar que alguien quedó a mitad de camino.
    await prisma.payment.update({ where: { id: pago.id }, data: { status: "FAILED" } });
    console.error("[PayPal] No se pudo crear la orden:", error);
    return NextResponse.json(
      { error: "No pudimos iniciar el pago. Probá de nuevo." },
      { status: 502 }
    );
  }
}
