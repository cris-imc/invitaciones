import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { REGISTRATION_ENABLED } from "@/lib/features";
import { validatePhoneAreaCode, validatePhoneNumber } from "@/lib/phone";
import { validatePassword } from "@/lib/password";
import { PLAN_LIMITS, DIAMOND_DISCOUNT_PRICE } from "@/lib/plan-limits";
import { createCheckoutPreference, getPublicBaseUrl } from "@/lib/mercadopago";

export async function POST(request: NextRequest) {
  if (!REGISTRATION_ENABLED) {
    return NextResponse.json(
      { error: "El registro de cuentas nuevas está deshabilitado por ahora" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { name, email, password, planTier, phoneAreaCode, phoneNumber } = body;

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const areaCodeError = validatePhoneAreaCode(phoneAreaCode || "");
    if (areaCodeError) {
      return NextResponse.json({ error: areaCodeError }, { status: 400 });
    }

    const phoneNumberError = validatePhoneNumber(phoneNumber || "");
    if (phoneNumberError) {
      return NextResponse.json({ error: phoneNumberError }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Este email ya está registrado" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // "Premium"/"Diamond" en el registro es una compra de UN crédito para
    // hacer UNA invitación de ese tipo, nunca un plan de invitaciones
    // ilimitadas. El planTier de la cuenta queda siempre FREE acá — un plan
    // ilimitado (PREMIUM/DIAMOND/ENTERPRISE/ADMIN) solo se asigna
    // manualmente desde el admin.
    //
    // El crédito NO se otorga acá -- la cuenta se crea siempre (aunque no se
    // complete el pago, para no perder el alta), y el crédito recién se
    // acredita cuando el webhook de Mercado Pago confirma el pago aprobado.
    const wantsPremium = planTier === "PREMIUM";
    const wantsDiamond = planTier === "DIAMOND";

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        phoneAreaCode,
        phoneNumber,
        planTier: "FREE",
        premiumCredits: 0,
        diamondCredits: 0,
        subscriptionStatus: "TRIAL",
        role: "CLIENT",
      },
      select: {
        id: true,
        name: true,
        email: true,
        planTier: true,
        createdAt: true,
      },
    });

    if (!wantsPremium && !wantsDiamond) {
      return NextResponse.json(
        { message: "Usuario creado exitosamente", user },
        { status: 201 }
      );
    }

    const amount = wantsDiamond ? DIAMOND_DISCOUNT_PRICE : PLAN_LIMITS.PREMIUM.price;
    const paidPlanTier = wantsDiamond ? "DIAMOND" : "PREMIUM";

    try {
      const payment = await prisma.payment.create({
        data: {
          userId: user.id,
          amount,
          currency: "ARS",
          status: "PENDING",
          planTier: paidPlanTier,
        },
      });

      const baseUrl = getPublicBaseUrl(request.nextUrl.origin);

      const { preferenceId, checkoutUrl } = await createCheckoutPreference({
        paymentId: payment.id,
        title: `Membresía ${paidPlanTier === "DIAMOND" ? "Diamond" : "Premium"} - Alta Invitación`,
        amount,
        payerEmail: user.email,
        baseUrl,
      });

      await prisma.payment.update({
        where: { id: payment.id },
        data: { mercadoPagoId: preferenceId },
      });

      return NextResponse.json(
        { message: "Usuario creado exitosamente", user, checkoutUrl },
        { status: 201 }
      );
    } catch (paymentError) {
      console.error("Error creando la preferencia de Mercado Pago:", paymentError);
      // La cuenta ya existe (como Gratis, sin credito) -- no la perdemos por
      // un problema al armar el cobro. El usuario puede iniciar sesion igual.
      return NextResponse.json(
        {
          message: "Usuario creado exitosamente",
          user,
          error: "Tu cuenta se creó, pero hubo un problema al generar el pago. Escribinos por WhatsApp para completarlo.",
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Error al crear el usuario" },
      { status: 500 }
    );
  }
}
