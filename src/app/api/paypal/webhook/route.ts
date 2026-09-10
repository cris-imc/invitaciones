import { NextRequest, NextResponse } from "next/server";
import { consultarOrden, notificacionEsDePayPal, paypalDisponible } from "@/lib/paypal";
import { acreditarPagoDePayPal } from "@/lib/acreditar-pago";

/**
 * Notificaciones de PayPal, servidor a servidor.
 *
 * POR QUÉ HACE FALTA, si ya capturamos cuando el comprador vuelve: porque no
 * siempre vuelve. Aprueba el pago, cierra el navegador o se le corta internet,
 * y la vuelta nunca ocurre. Sin esto PayPal se queda con la plata y nosotros
 * no acreditamos nada: alguien pagó y no recibió su crédito, y encima no hay
 * forma de que se dé cuenta hasta que reclame.
 *
 * El evento que importa es CHECKOUT.ORDER.APPROVED, que es exactamente ese
 * momento: el comprador dio su conformidad y todavía no se cobró.
 *
 * NUNCA SE CONFÍA EN LO QUE LLEGA EN EL CUERPO. Cualquiera puede mandar un
 * POST a esta URL diciendo que una orden se aprobó. De la notificación sólo
 * se toma el ID, y el estado real se le pregunta a PayPal con nuestras
 * credenciales. Mismo criterio que el webhook de Mercado Pago.
 */

/** Los eventos que nos interesan; del resto se avisa recibido y nada más. */
const RELEVANTES = new Set([
  "CHECKOUT.ORDER.APPROVED",
  "CHECKOUT.ORDER.COMPLETED",
  "PAYMENT.CAPTURE.COMPLETED",
]);

export async function POST(request: NextRequest) {
  // Siempre se responde 200, incluso ante un error nuestro: un 500 hace que
  // PayPal reintente durante días, y un bug propio no se arregla reintentando.
  const recibido = () => NextResponse.json({ received: true });

  try {
    if (!paypalDisponible()) return recibido();

    const cuerpo = await request.text();
    if (!(await notificacionEsDePayPal(request.headers, cuerpo))) {
      console.error("[PayPal webhook] Firma inválida, se descarta");
      return recibido();
    }

    const evento = JSON.parse(cuerpo) as {
      event_type?: string;
      resource?: {
        id?: string;
        // En PAYMENT.CAPTURE.* el recurso es la captura, y la orden viene
        // como el id de la orden en supplementary_data.
        supplementary_data?: { related_ids?: { order_id?: string } };
      };
    };

    if (!evento.event_type || !RELEVANTES.has(evento.event_type)) return recibido();

    const ordenId =
      evento.resource?.supplementary_data?.related_ids?.order_id ?? evento.resource?.id;
    if (!ordenId) return recibido();

    // El estado real, preguntado a PayPal y no leído de la notificación.
    const orden = await consultarOrden(ordenId);
    if (!orden) {
      console.error("[PayPal webhook] No se pudo consultar la orden:", ordenId);
      return recibido();
    }

    // COMPLETED = ya se cobró (probablemente por la vuelta del comprador).
    // APPROVED = el comprador aprobó y nadie cobró todavía: es el caso que
    // este webhook viene a resolver.
    if (orden.estado !== "APPROVED" && orden.estado !== "COMPLETED") return recibido();

    const resultado = await acreditarPagoDePayPal(ordenId);
    if (resultado.estado === "acreditado") {
      console.log("[PayPal webhook] Crédito acreditado por webhook, orden", ordenId);
    } else if (resultado.estado === "rechazado") {
      console.error("[PayPal webhook] Captura rechazada:", ordenId, resultado.motivo);
    } else if (resultado.estado === "sin-pago") {
      console.error("[PayPal webhook] Orden sin Payment local:", ordenId);
    }

    return recibido();
  } catch (error) {
    console.error("[PayPal webhook] Error procesando la notificación:", error);
    return recibido();
  }
}

// PayPal valida la URL con un GET antes de guardar la configuración.
export async function GET() {
  return NextResponse.json({ ok: true });
}
