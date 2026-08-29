import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { createCheckoutPreference, getPublicBaseUrl } from "@/lib/mercadopago";
import { PREMIUM_DISCOUNT_PRICE, DIAMOND_DISCOUNT_PRICE } from "@/lib/plan-limits";

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
            select: { email: true },
        });
        if (!user) {
            return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
        }

        const amount = planTier === "DIAMOND" ? DIAMOND_DISCOUNT_PRICE : PREMIUM_DISCOUNT_PRICE;

        const payment = await prisma.payment.create({
            data: {
                userId: session.user.id,
                amount,
                currency: "ARS",
                status: "PENDING",
                planTier,
            },
        });

        const baseUrl = getPublicBaseUrl(request.nextUrl.origin);

        const { preferenceId, checkoutUrl } = await createCheckoutPreference({
            paymentId: payment.id,
            title: `Crédito ${planTier === "DIAMOND" ? "Diamond" : "Premium"} - Alta Invitación`,
            amount,
            payerEmail: user.email,
            baseUrl,
        });

        await prisma.payment.update({
            where: { id: payment.id },
            data: { mercadoPagoId: preferenceId },
        });

        return NextResponse.json({ checkoutUrl });
    } catch (error) {
        console.error("[BUY_CREDIT]", error);
        return NextResponse.json({ error: "Error al iniciar el pago" }, { status: 500 });
    }
}
