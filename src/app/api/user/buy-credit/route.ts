import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { createCheckoutPreference, getPublicBaseUrl } from "@/lib/mercadopago";
import { crearOrden } from "@/lib/paypal";
import { precioConDescuento, precioParaPayPal, esArgentina } from "@/lib/precios-por-pais";
import { esCodigoPais, type CodigoPais } from "@/lib/paises";

// Un cliente que ya tiene cuenta (a diferencia del registro, que vende un
// crédito junto con el alta) compra acá UN crédito Premium o Diamond suelto
// -- para poder crear una invitación de ese tier cuando ya usó su tarjeta
// Gratis. Mismo mecanismo que el registro (Payment PENDING + preferencia de
// Mercado Pago; el webhook acredita el crédito cuando se aprueba el pago),
// ver /api/mercadopago/webhook.
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "No autenticado" }, { status: 401 });
        }

        const body = await request.json();
        const planTier: string = body.planTier;
        if (planTier !== "PREMIUM" && planTier !== "DIAMOND") {
            return NextResponse.json({ error: "Plan inválido" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { email: true, pais: true },
        });
        if (!user) {
            return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
        }

        // El precio y el medio de pago salen del PAÍS de la cuenta, igual que
        // en el registro. Antes esto cobraba siempre en pesos por Mercado
        // Pago: a alguien de México le creaba un pago en pesos argentinos que
        // su tarjeta no podía pagar, y quedaba trabado sin poder comprar el
        // crédito ni entender por qué.
        // Ante la duda, ARGENTINA. El campo `pais` tiene default "AR" en la
        // base, pero si por lo que sea llegara vacío o con basura, un
        // fallback a null mandaría a un argentino a PayPal -- que no puede
        // cobrar en pesos -- en vez de a Mercado Pago. El default tiene que
        // ser el camino que hoy funciona.
        const pais: CodigoPais = esCodigoPais(user.pais) ? user.pais : "AR";
        const porMercadoPago = esArgentina(pais);
        const titulo = `Crédito ${planTier === "DIAMOND" ? "Diamond" : "Premium"} - Alta Invitación`;
        const baseUrl = getPublicBaseUrl(request.nextUrl.origin);

        // Por PayPal se cobra en una moneda que PayPal acepte, que no siempre
        // es la que se le muestra al cliente (ver precioParaPayPal).
        const precio = porMercadoPago
            ? precioConDescuento(planTier, pais)
            : precioParaPayPal(planTier, pais);

        const payment = await prisma.payment.create({
            data: {
                userId: session.user.id,
                amount: precio.monto,
                currency: precio.moneda,
                status: "PENDING",
                planTier,
                proveedor: porMercadoPago ? "mercadopago" : "paypal",
            },
        });

        let checkoutUrl: string;
        if (porMercadoPago) {
            const preferencia = await createCheckoutPreference({
                paymentId: payment.id,
                title: titulo,
                amount: precio.monto,
                payerEmail: user.email,
                baseUrl,
            });
            checkoutUrl = preferencia.checkoutUrl;
            await prisma.payment.update({
                where: { id: payment.id },
                data: { mercadoPagoId: preferencia.preferenceId },
            });
        } else {
            const orden = await crearOrden({
                monto: precio.monto,
                moneda: precio.moneda,
                descripcion: titulo,
                referencia: payment.id,
                urlBase: process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin,
            });
            checkoutUrl = orden.urlDeAprobacion;
            await prisma.payment.update({
                where: { id: payment.id },
                data: { paypalOrderId: orden.ordenId },
            });
        }

        return NextResponse.json({ checkoutUrl });
    } catch (error) {
        console.error("[BUY_CREDIT]", error);
        return NextResponse.json({ error: "Error al iniciar el pago" }, { status: 500 });
    }
}
