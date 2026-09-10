import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { capturarOrden, paypalDisponible } from "@/lib/paypal";

/**
 * Vuelta del comprador desde PayPal: se cobra la orden y se acreditan los
 * créditos del plan.
 *
 * PayPal manda de vuelta al comprador a esta URL con `token`, que es el id de
 * la orden. **No se le cree nada al navegador**: con ese id se le pregunta a
 * PayPal, del lado del servidor, si el pago se completó. Alguien podría
 * inventarse esta URL a mano, y por eso lo único que se toma de ella es un
 * identificador que después se verifica contra PayPal.
 *
 * Es un GET y no un webhook porque PayPal captura en el momento del retorno:
 * el comprador ya dio su conformidad y acá recién se mueve el dinero. Si el
 * comprador cierra el navegador justo en el medio, el pago queda PENDING y se
 * ve en el panel de PayPal -- por eso conviene revisar los PENDING viejos.
 */
export async function GET(request: NextRequest) {
  const ordenId = request.nextUrl.searchParams.get("token");
  const base = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;

  const volverA = (ruta: string) => NextResponse.redirect(new URL(ruta, base));

  if (!paypalDisponible() || !ordenId) return volverA("/register/pago-fallido");

  try {
    const resultado = await capturarOrden(ordenId);

    const pago = await prisma.payment.findFirst({
      where: { paypalOrderId: ordenId, proveedor: "paypal" },
    });
    if (!pago) {
      console.error("[PayPal] Orden capturada sin Payment local:", ordenId);
      return volverA("/register/pago-fallido");
    }

    // Idempotencia: si alguien recarga esta URL, el pago ya no está PENDING y
    // no se vuelve a acreditar nada.
    if (pago.status !== "PENDING") {
      return volverA(pago.status === "APPROVED" ? "/register/pago-exitoso" : "/register/pago-fallido");
    }

    if (!resultado.aprobada) {
      await prisma.payment.update({
        where: { id: pago.id },
        data: { status: "REJECTED" },
      });
      console.error("[PayPal] Captura no completada:", resultado.estado);
      return volverA("/register/pago-fallido");
    }

    // Mismos efectos que el webhook de Mercado Pago: un pago vale lo mismo
    // por cualquier vía.
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: pago.id },
        data: { status: "APPROVED" },
      }),
      prisma.user.update({
        where: { id: pago.userId },
        data: {
          subscriptionStatus: "ACTIVE",
          ...(pago.planTier === "DIAMOND"
            ? { diamondCredits: { increment: 1 } }
            : { premiumCredits: { increment: 1 } }),
        },
      }),
    ]);

    return volverA("/register/pago-exitoso");
  } catch (error) {
    console.error("[PayPal] Error capturando la orden:", error);
    return volverA("/register/pago-fallido");
  }
}
