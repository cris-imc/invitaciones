/**
 * Cobro por PayPal.
 *
 * POR QUÉ EXISTE, ADEMÁS DE MERCADO PAGO: una cuenta común de Mercado Pago
 * Argentina no puede cobrarle a alguien de otro país. MP no convierte monedas
 * -- una preferencia en ARS le cobra ese número en pesos argentinos -- y el
 * checkout argentino pide un tipo de documento argentino. Existe el producto
 * Cross Border, que sí sirve, pero la cuenta la crea el equipo de MP a pedido.
 * PayPal se habilita solo y cubre el mundo entero desde el primer día.
 *
 * En Argentina conviven los tres: Mercado Pago (el único con cuotas sin
 * interés), transferencia y PayPal. Fuera de Argentina, sólo PayPal.
 *
 * Se habla con la API REST directamente y no con un SDK: son dos llamadas
 * -- crear la orden y capturarla -- y un SDK sería una dependencia más para
 * mantener a cambio de nada.
 */

const BASE = process.env.PAYPAL_ENTORNO === "produccion"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

/** Si el cobro por PayPal está configurado en este entorno. */
export function paypalDisponible(): boolean {
  return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
}

async function token(): Promise<string> {
  const id = process.env.PAYPAL_CLIENT_ID;
  const secreto = process.env.PAYPAL_CLIENT_SECRET;
  if (!id || !secreto) throw new Error("Faltan las credenciales de PayPal");

  const r = await fetch(`${BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secreto}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!r.ok) throw new Error(`PayPal rechazó las credenciales (${r.status})`);
  const j = (await r.json()) as { access_token: string };
  return j.access_token;
}

export interface OrdenCreada {
  ordenId: string;
  urlDeAprobacion: string;
}

/**
 * Crea la orden y devuelve a dónde mandar al comprador.
 *
 * `referencia` es el id de nuestro Payment: viaja a PayPal y vuelve en la
 * captura, que es lo que permite saber qué pago se acreditó sin confiar en
 * nada que venga del navegador.
 */
export async function crearOrden(params: {
  monto: number;
  moneda: string;
  descripcion: string;
  referencia: string;
  urlBase: string;
}): Promise<OrdenCreada> {
  const r = await fetch(`${BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${await token()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: params.referencia,
          description: params.descripcion.slice(0, 127),
          amount: {
            currency_code: params.moneda,
            // PayPal exige dos decimales como texto, incluso en monedas que
            // no los usan.
            value: params.monto.toFixed(2),
          },
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            // Sin esto PayPal ofrece guardar la tarjeta y crear una cuenta,
            // que agrega dos pantallas antes de terminar de pagar.
            shipping_preference: "NO_SHIPPING",
            user_action: "PAY_NOW",
            return_url: `${params.urlBase}/api/paypal/capturar?pago=${encodeURIComponent(params.referencia)}`,
            cancel_url: `${params.urlBase}/register/pago-fallido`,
          },
        },
      },
    }),
    cache: "no-store",
  });

  if (!r.ok) {
    throw new Error(`PayPal no pudo crear la orden (${r.status}): ${await r.text()}`);
  }

  const j = (await r.json()) as {
    id: string;
    links: { rel: string; href: string }[];
  };
  const aprobar = j.links.find((l) => l.rel === "payer-action" || l.rel === "approve");
  if (!aprobar) throw new Error("PayPal no devolvió el link de aprobación");

  return { ordenId: j.id, urlDeAprobacion: aprobar.href };
}

export interface ResultadoCaptura {
  aprobada: boolean;
  estado: string;
  /** El id de nuestro Payment, tal como lo mandamos al crear la orden. */
  referencia: string | null;
}

/**
 * Cobra una orden ya aprobada por el comprador.
 *
 * Es el único momento en que el dinero se mueve: hasta acá el comprador sólo
 * dio su conformidad. Se llama desde el servidor y nunca desde el navegador.
 */
export async function capturarOrden(ordenId: string): Promise<ResultadoCaptura> {
  const r = await fetch(`${BASE}/v2/checkout/orders/${ordenId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${await token()}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const j = (await r.json()) as {
    status?: string;
    purchase_units?: { reference_id?: string }[];
  };

  return {
    aprobada: r.ok && j.status === "COMPLETED",
    estado: j.status ?? `HTTP ${r.status}`,
    referencia: j.purchase_units?.[0]?.reference_id ?? null,
  };
}
