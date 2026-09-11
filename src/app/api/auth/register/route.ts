import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { REGISTRATION_ENABLED } from "@/lib/features";
import { validarTelefono } from "@/lib/phone";
import { validatePassword } from "@/lib/password";
import { createCheckoutPreference, getPublicBaseUrl } from "@/lib/mercadopago";
import { getRequestIp } from "@/lib/request-ip";
import { resolveDiscountForPlan } from "@/lib/discount-codes";
import { esCodigoPais } from "@/lib/paises";
import { costumbresDe } from '@/lib/costumbres-por-pais';
import { precioParaPayPal } from '@/lib/precios-por-pais';
import { crearOrden, paypalDisponible } from '@/lib/paypal';

export async function POST(request: NextRequest) {
  if (!REGISTRATION_ENABLED) {
    return NextResponse.json(
      { error: "El registro de cuentas nuevas está deshabilitado por ahora" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { name, email, password, planTier, phoneAreaCode, phoneNumber, pais, acceptedTerms, discountCode } = body;

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    // El checkbox del cliente es solo UX -- la aceptación real que vale
    // como evidencia es esta validación server-side + el timestamp/IP que
    // se graba abajo en el registro del usuario.
    if (acceptedTerms !== true) {
      return NextResponse.json(
        { error: "Debes aceptar los Términos y Condiciones para registrarte" },
        { status: 400 }
      );
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    // El teléfono es opcional: no se le manda nada automático, el login no lo
    // usa y la clave se recupera por email. Sus reglas dependen del país.
    const errorTelefono = validarTelefono(pais, phoneAreaCode || "", phoneNumber || "");
    if (errorTelefono) {
      return NextResponse.json({ error: errorTelefono }, { status: 400 });
    }

    // El país decide qué datos bancarios se le van a pedir después (CBU,
    // IBAN, routing number...). Se rechaza cualquier valor que no sea uno
    // de los países que manejamos en vez de caer al default: un código
    // inventado dejaría al usuario con formularios de Argentina sin avisarle.
    if (!esCodigoPais(pais)) {
      return NextResponse.json(
        { error: "Elige un país válido" },
        { status: 400 }
      );
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
    const paidPlanTier = wantsDiamond ? "DIAMOND" : "PREMIUM";

    // El código de descuento se valida ANTES de crear la cuenta -- si se
    // validara después y fallara, la cuenta ya existiría y un reintento con
    // el código corregido chocaría con "Este email ya está registrado" sin
    // que se haya cobrado nada.
    const discountResult = wantsPremium || wantsDiamond
      ? await resolveDiscountForPlan(discountCode, paidPlanTier)
      : { ok: true as const, discountCodeId: null, amount: 0, discountAmount: 0 };

    if (!discountResult.ok) {
      return NextResponse.json({ error: discountResult.error }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        phoneAreaCode,
        phoneNumber,
        pais,
        planTier: "FREE",
        premiumCredits: 0,
        diamondCredits: 0,
        subscriptionStatus: "TRIAL",
        role: "CLIENT",
        termsAcceptedAt: new Date(),
        termsAcceptedIp: getRequestIp(request),
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

    const { amount, discountCodeId, discountAmount } = discountResult;

    try {
      // Qué procesador cobra sale del país, no de una preferencia: una
      // cuenta común de Mercado Pago Argentina no puede cobrarle a alguien
      // de otro país -- MP no convierte monedas y el checkout argentino
      // pide un documento argentino. Fuera de Argentina cobra PayPal.
      const porMercadoPago = costumbresDe(pais).mediosDePago.includes("mercadopago");

      // El precio y la moneda salen del país. El descuento se calculó sobre
      // la lista argentina, así que fuera de Argentina se cobra el precio en
      // dólares que corresponde al plan.
      const precio = porMercadoPago
        ? { monto: amount, moneda: "ARS" }
        : precioParaPayPal(paidPlanTier, pais);

      const payment = await prisma.payment.create({
        data: {
          userId: user.id,
          amount: precio.monto,
          currency: precio.moneda,
          status: "PENDING",
          planTier: paidPlanTier,
          proveedor: porMercadoPago ? "mercadopago" : "paypal",
          discountCodeId,
          discountAmount: discountAmount || null,
        },
      });

      const baseUrl = getPublicBaseUrl(request.nextUrl.origin);
      const titulo = `Membresía ${paidPlanTier === "DIAMOND" ? "Diamond" : "Premium"} - Alta Invitación`;

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
        if (!paypalDisponible()) {
          throw new Error("PayPal no está configurado y es el único cobro disponible en este país");
        }
        const orden = await crearOrden({
          monto: precio.monto,
          moneda: precio.moneda,
          descripcion: titulo,
          referencia: payment.id,
          urlBase: baseUrl,
        });
        checkoutUrl = orden.urlDeAprobacion;
        await prisma.payment.update({
          where: { id: payment.id },
          data: { paypalOrderId: orden.ordenId },
        });
      }

      return NextResponse.json(
        { message: "Usuario creado exitosamente", user, checkoutUrl, proveedor: porMercadoPago ? "mercadopago" : "paypal" },
        { status: 201 }
      );
    } catch (paymentError) {
      console.error("Error creando el cobro:", paymentError);
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
