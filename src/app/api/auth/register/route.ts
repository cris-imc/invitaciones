import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { REGISTRATION_ENABLED } from "@/lib/features";
import { validatePhoneAreaCode, validatePhoneNumber } from "@/lib/phone";

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

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
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
        premiumCredits: wantsPremium ? 1 : 0,
        diamondCredits: wantsDiamond ? 1 : 0,
        subscriptionStatus: wantsPremium || wantsDiamond ? "ACTIVE" : "TRIAL",
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

    return NextResponse.json(
      {
        message: "Usuario creado exitosamente",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Error al crear el usuario" },
      { status: 500 }
    );
  }
}
