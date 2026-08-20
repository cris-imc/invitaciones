import { NextRequest, NextResponse } from "next/server";
import { validateDiscountCode, computeDiscountedAmount, type PaidPlanTier } from "@/lib/discount-codes";

// Endpoint público (sin sesión -- corre en la página de registro, antes de
// crear la cuenta) para el botón "Aplicar" del campo de código de
// descuento: le deja mostrar al usuario el precio recalculado en vivo
// antes de mandarlo a pagar a Mercado Pago. No es el punto de verdad final
// -- /api/auth/register vuelve a validar el código server-side igual.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, planTier } = body;

    if (planTier !== "PREMIUM" && planTier !== "DIAMOND") {
      return NextResponse.json({ valid: false, error: "Plan inválido" });
    }

    const result = await validateDiscountCode(String(code ?? ""));
    if (!result.valid) {
      return NextResponse.json({ valid: false, error: result.error });
    }

    const amount = computeDiscountedAmount(planTier as PaidPlanTier, result.percentage);
    return NextResponse.json({ valid: true, code: result.code, percentage: result.percentage, amount });
  } catch (error) {
    console.error("Error validando código de descuento:", error);
    return NextResponse.json({ valid: false, error: "Error al validar el código" });
  }
}
