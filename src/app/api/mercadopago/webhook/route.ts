import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { fetchMercadoPagoPayment } from "@/lib/mercadopago";

// Mercado Pago llama a esta URL server-to-server cuando cambia el estado de
// un pago. NUNCA confiamos en lo que venga en el body/query de la
// notificación en sí (se puede falsificar) -- solo lo usamos para saber qué
// id de pago consultar, y volvemos a pedirle el estado real directamente a
// la API de Mercado Pago con nuestro propio access token.
export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    let paymentId: string | null = searchParams.get("data.id") || searchParams.get("id");
    let type: string | null = searchParams.get("type") || searchParams.get("topic");

    try {
      const body = await request.json();
      if (body?.data?.id) paymentId = String(body.data.id);
      if (body?.type) type = body.type;
    } catch {
      // Sin body JSON válido -- nos quedamos con lo que haya en query params
      // (formato IPN viejo, que Mercado Pago todavía manda a veces).
    }

    if (type !== "payment" || !paymentId) {
      // No es una notificación de pago (ej. merchant_order) -- confirmamos
      // igual para que Mercado Pago no reintente de más.
      return NextResponse.json({ received: true });
    }

    const mpPayment = await fetchMercadoPagoPayment(paymentId);
    const ourPaymentId = mpPayment.external_reference;

    if (!ourPaymentId) {
      console.error("[MP webhook] Pago sin external_reference:", paymentId);
      return NextResponse.json({ received: true });
    }

    const ourPayment = await prisma.payment.findUnique({ where: { id: ourPaymentId } });

    if (!ourPayment) {
      console.error("[MP webhook] No se encontró el Payment local:", ourPaymentId);
      return NextResponse.json({ received: true });
    }

    // Idempotencia: Mercado Pago puede reenviar el mismo webhook varias
    // veces -- si ya lo procesamos, no volvemos a acreditar nada.
    if (ourPayment.status !== "PENDING") {
      return NextResponse.json({ received: true });
    }

    const mpStatus = mpPayment.status; // "approved" | "pending" | "in_process" | "rejected" | "cancelled" | ...

    if (mpStatus === "approved") {
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: ourPayment.id },
          data: {
            status: "APPROVED",
            mercadoPagoId: String(mpPayment.id),
            paymentMethod: mpPayment.payment_type_id || null,
          },
        }),
        prisma.user.update({
          where: { id: ourPayment.userId },
          data: {
            subscriptionStatus: "ACTIVE",
            ...(ourPayment.planTier === "DIAMOND"
              ? { diamondCredits: { increment: 1 } }
              : { premiumCredits: { increment: 1 } }),
          },
        }),
      ]);
    } else if (mpStatus === "rejected" || mpStatus === "cancelled") {
      await prisma.payment.update({
        where: { id: ourPayment.id },
        data: { status: "REJECTED", mercadoPagoId: String(mpPayment.id) },
      });
    }
    // "pending" / "in_process" (ej. Rapipago, Pago Fácil): no tocamos nada
    // todavía, esperamos el próximo webhook cuando se acredite o rechace.

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[MP webhook] Error procesando notificación:", error);
    // Devolvemos 200 igual: si devolvemos error, Mercado Pago reintenta
    // agresivamente y un bug de nuestro lado no se arregla reintentando al
    // infinito -- mejor loguearlo y revisarlo a mano.
    return NextResponse.json({ received: true });
  }
}

// Mercado Pago a veces valida la URL con un GET antes de guardar la
// configuración del webhook en el panel.
export async function GET() {
  return NextResponse.json({ ok: true });
}
