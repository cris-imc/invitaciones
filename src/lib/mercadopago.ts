import { MercadoPagoConfig, Preference, Payment as MPPayment } from "mercadopago";

function getAccessToken(): string {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) {
    throw new Error("MERCADOPAGO_ACCESS_TOKEN no está configurado");
  }
  return token;
}

function getClient(): MercadoPagoConfig {
  return new MercadoPagoConfig({ accessToken: getAccessToken() });
}

// request.nextUrl.origin no es confiable detrás del proxy de Railway --
// resuelve a "http://localhost:8080" (el bind interno del contenedor) en vez
// del dominio público, lo que rompe silenciosamente el webhook (Mercado
// Pago nunca puede pegarle a localhost) y el auto_return. Se prioriza:
// 1) NEXT_PUBLIC_APP_URL, si está seteada explícitamente (dominio propio en
//    producción, ej. altainvitacion.com).
// 2) RAILWAY_PUBLIC_DOMAIN, provista automáticamente por Railway y siempre
//    correcta para el ambiente actual (ej. invitaciones-diamond.up.railway.app).
// 3) request.nextUrl.origin como último recurso (desarrollo local, fuera de
//    Railway).
export function getPublicBaseUrl(requestOrigin: string): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.RAILWAY_PUBLIC_DOMAIN) return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
  return requestOrigin;
}

export async function createCheckoutPreference(params: {
  paymentId: string;
  title: string;
  amount: number;
  payerEmail?: string;
  baseUrl: string;
}): Promise<{ preferenceId: string; checkoutUrl: string }> {
  const preference = new Preference(getClient());

  const result = await preference.create({
    body: {
      items: [
        {
          id: params.paymentId,
          title: params.title,
          quantity: 1,
          currency_id: "ARS",
          unit_price: params.amount,
        },
      ],
      external_reference: params.paymentId,
      payer: params.payerEmail ? { email: params.payerEmail } : undefined,
      back_urls: {
        success: `${params.baseUrl}/register/pago-exitoso`,
        pending: `${params.baseUrl}/register/pago-pendiente`,
        failure: `${params.baseUrl}/register/pago-fallido`,
      },
      // auto_return exige que back_url.success sea https:// -- en local
      // (http://localhost) Mercado Pago rechaza la preferencia si lo
      // mandamos. Sin auto_return el flujo funciona igual, solo que el
      // comprador tiene que tocar "Volver al sitio" en vez de que lo
      // redirija solo.
      auto_return: params.baseUrl.startsWith("https://") ? "approved" : undefined,
      notification_url: `${params.baseUrl}/api/mercadopago/webhook`,
    },
  });

  // No hace falta elegir entre init_point y sandbox_init_point a mano: Mercado
  // Pago ya sabe si la preferencia se creó con credenciales de prueba o de
  // producción (según el access token usado acá) y hace que init_point
  // lleve al entorno correcto solo. El prefijo "TEST-" para credenciales de
  // prueba está deprecado -- ahora ambos entornos usan "APP_USR-".
  if (!result.id || !result.init_point) {
    throw new Error("Mercado Pago no devolvió una preferencia válida");
  }

  return { preferenceId: result.id, checkoutUrl: result.init_point };
}

export async function fetchMercadoPagoPayment(paymentId: string) {
  const payment = new MPPayment(getClient());
  return payment.get({ id: paymentId });
}
