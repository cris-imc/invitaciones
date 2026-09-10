import { prisma } from "@/lib/db";
import { capturarOrden } from "@/lib/paypal";

/**
 * Cobrar una orden de PayPal aprobada y acreditar el crédito del plan.
 *
 * Vive acá y no dentro de una ruta porque HAY DOS CAMINOS que terminan en lo
 * mismo, y tienen que hacer exactamente lo mismo:
 *
 * 1. El comprador vuelve del checkout a /api/paypal/capturar.
 * 2. El webhook, cuando el comprador aprobó el pago y NO volvió -- cerró el
 *    navegador, se le cortó internet. Sin esto PayPal se queda con la plata y
 *    nosotros nunca acreditamos: alguien pagó y no recibió nada.
 *
 * Duplicar la lógica en las dos rutas garantiza que en algún momento se
 * separen y una acredite algo distinto de la otra.
 */

export type Resultado =
  | { estado: "acreditado" }
  | { estado: "ya-estaba" }
  | { estado: "rechazado"; motivo: string }
  | { estado: "sin-pago" };

export async function acreditarPagoDePayPal(ordenId: string): Promise<Resultado> {
  const pago = await prisma.payment.findFirst({
    where: { paypalOrderId: ordenId, proveedor: "paypal" },
  });
  if (!pago) return { estado: "sin-pago" };

  // Idempotencia: los dos caminos pueden llegar casi a la vez -- el comprador
  // vuelve al sitio y el webhook entra al mismo tiempo. El primero que lo
  // procesa lo saca de PENDING y el segundo no vuelve a acreditar.
  if (pago.status !== "PENDING") return { estado: "ya-estaba" };

  const resultado = await capturarOrden(ordenId);

  if (!resultado.aprobada) {
    // ORDER_ALREADY_CAPTURED: el otro camino ganó la carrera entre que
    // leímos el pago y llamamos a capturar. No es un error.
    if (/ALREADY_CAPTURED/i.test(resultado.estado)) return { estado: "ya-estaba" };

    await prisma.payment.update({ where: { id: pago.id }, data: { status: "REJECTED" } });
    return { estado: "rechazado", motivo: resultado.estado };
  }

  await prisma.$transaction([
    prisma.payment.update({ where: { id: pago.id }, data: { status: "APPROVED" } }),
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

  return { estado: "acreditado" };
}
