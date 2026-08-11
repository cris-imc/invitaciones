import { MercadoPagoConfig, Preference, Payment as MPPayment } from "mercadopago";

function getAccessToken(): string {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) {
    throw new Error("MERCADOPAGO_ACCESS_TOKEN no está configurado");
  }
  return token;
}

// Los access tokens de prueba (sandbox) siempre arrancan con "TEST-", los
// de producción con "APP_USR-" -- con eso alcanza para saber a qué
// init_point redirigir sin pedir una variable de entorno aparte.
function isSandboxToken(): boolean {
  return getAccessToken().startsWith("TEST-");
}

function getClient(): MercadoPagoConfig {
  return new MercadoPagoConfig({ accessToken: getAccessToken() });
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
      auto_return: "approved",
      notification_url: `${params.baseUrl}/api/mercadopago/webhook`,
    },
  });

  const checkoutUrl = (isSandboxToken() ? result.sandbox_init_point : result.init_point) || result.init_point;

  if (!result.id || !checkoutUrl) {
    throw new Error("Mercado Pago no devolvió una preferencia válida");
  }

  return { preferenceId: result.id, checkoutUrl };
}

export async function fetchMercadoPagoPayment(paymentId: string) {
  const payment = new MPPayment(getClient());
  return payment.get({ id: paymentId });
}
