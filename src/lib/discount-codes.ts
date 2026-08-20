import { prisma } from "@/lib/db";
import { PLAN_LIMITS, DIAMOND_DISCOUNT_PRICE } from "@/lib/plan-limits";

// Códigos de descuento configurables por el admin (/dashboard/descuentos):
// un código aplica un % EXTRA sobre el precio que el plan ya tiene vigente
// (para Diamond, sobre DIAMOND_DISCOUNT_PRICE -- el 20% base ya aplicado --
// no sobre el precio de lista). Centralizado acá junto con plan-limits.ts
// para que registro y el cobro de Mercado Pago nunca se desincronicen.

export type PaidPlanTier = "PREMIUM" | "DIAMOND";

export function normalizeDiscountCode(raw: string): string {
  return raw.trim().toUpperCase();
}

export function isValidPercentage(percentage: number): boolean {
  return Number.isInteger(percentage) && percentage >= 1 && percentage <= 100;
}

export function computeDiscountedAmount(planTier: PaidPlanTier, percentage: number): number {
  const basePrice = planTier === "DIAMOND" ? DIAMOND_DISCOUNT_PRICE : PLAN_LIMITS.PREMIUM.price;
  return Math.round(basePrice * (1 - percentage / 100));
}

type ValidateResult =
  | { valid: true; id: string; code: string; percentage: number }
  | { valid: false; error: string };

export async function validateDiscountCode(rawCode: string): Promise<ValidateResult> {
  const code = normalizeDiscountCode(rawCode);
  if (!code) {
    return { valid: false, error: "Ingresá un código" };
  }

  const discountCode = await prisma.discountCode.findUnique({ where: { code } });

  if (!discountCode) {
    return { valid: false, error: "Código inválido" };
  }
  if (!discountCode.enabled) {
    return { valid: false, error: "Este código ya no está disponible" };
  }

  return { valid: true, id: discountCode.id, code: discountCode.code, percentage: discountCode.percentage };
}

type ResolveResult =
  | { ok: true; discountCodeId: string | null; amount: number; discountAmount: number }
  | { ok: false; error: string };

// Punto de entrada único para el registro: sin código, devuelve el precio
// base del plan sin tocar nada; con código, valida y aplica el descuento.
// Nunca confía en un porcentaje/monto mandado por el cliente -- siempre lee
// el porcentaje fresco desde la base de datos.
export async function resolveDiscountForPlan(
  rawCode: string | undefined | null,
  planTier: PaidPlanTier
): Promise<ResolveResult> {
  const basePrice = planTier === "DIAMOND" ? DIAMOND_DISCOUNT_PRICE : PLAN_LIMITS.PREMIUM.price;

  if (!rawCode || !rawCode.trim()) {
    return { ok: true, discountCodeId: null, amount: basePrice, discountAmount: 0 };
  }

  const result = await validateDiscountCode(rawCode);
  if (!result.valid) {
    return { ok: false, error: result.error };
  }

  const amount = computeDiscountedAmount(planTier, result.percentage);
  return { ok: true, discountCodeId: result.id, amount, discountAmount: basePrice - amount };
}
