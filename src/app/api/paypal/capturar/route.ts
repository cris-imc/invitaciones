import { NextRequest, NextResponse } from "next/server";
import { paypalDisponible } from "@/lib/paypal";
import { acreditarPagoDePayPal } from "@/lib/acreditar-pago";

/**
 * Vuelta del comprador desde PayPal: se cobra la orden y se acredita el
 * crédito del plan.
 *
 * PayPal manda de vuelta al comprador con `token`, que es el id de la orden.
 * **No se le cree nada al navegador**: alguien podría inventarse esta URL a
 * mano, así que lo único que se toma de ella es un identificador, y con él se
 * le pregunta a PayPal del lado del servidor si el pago se completó.
 *
 * La acreditación en sí vive en lib/acreditar-pago.ts porque el webhook hace
 * exactamente lo mismo cuando el comprador NO vuelve. Duplicarla acá
 * garantizaría que en algún momento las dos se separen.
 */
export async function GET(request: NextRequest) {
  const ordenId = request.nextUrl.searchParams.get("token");
  const base = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
  const volverA = (ruta: string) => NextResponse.redirect(new URL(ruta, base));

  if (!paypalDisponible() || !ordenId) return volverA("/register/pago-fallido");

  try {
    const resultado = await acreditarPagoDePayPal(ordenId);

    switch (resultado.estado) {
      case "acreditado":
        return volverA("/register/pago-exitoso");

      // El webhook llegó primero: el crédito ya está puesto. Para el comprador
      // el pago salió bien, que es lo único que le importa.
      case "ya-estaba":
        return volverA("/register/pago-exitoso");

      case "rechazado":
        console.error("[PayPal] Captura no completada:", ordenId, resultado.motivo);
        return volverA("/register/pago-fallido");

      case "sin-pago":
        console.error("[PayPal] Orden capturada sin Payment local:", ordenId);
        return volverA("/register/pago-fallido");
    }
  } catch (error) {
    console.error("[PayPal] Error capturando la orden:", error);
    return volverA("/register/pago-fallido");
  }
}
