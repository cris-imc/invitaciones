import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/roles";

// POST /api/invitations/[slug]/upgrade-plan -- convierte una invitación ya
// creada en plan Gratis a Premium/Diamond, gastando un crédito de la cuenta
// (o sin gastar nada si la cuenta tiene plan ilimitado). No crea una
// invitación nueva -- es la MISMA tarjeta, ya con sus invitados y datos
// cargados, que pasa a tener las funciones de ese tier disponibles para
// habilitar (ver "Habilitar funciones Premium/Diamond" en EventShareCard).
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const session = await auth().catch(() => null);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "No autenticado" }, { status: 401 });
        }

        const { slug } = await params;
        const body = await request.json();
        const targetPlanTier: string = body.planTier;
        if (targetPlanTier !== "PREMIUM" && targetPlanTier !== "DIAMOND") {
            return NextResponse.json({ error: "Plan inválido" }, { status: 400 });
        }

        const invitation = await prisma.invitation.findUnique({ where: { slug } });
        if (!invitation) {
            return NextResponse.json({ error: "Invitación no encontrada" }, { status: 404 });
        }
        if (invitation.userId !== session.user.id && !isAdmin(session.user.role)) {
            return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
        }
        if (invitation.planTier !== "FREE") {
            return NextResponse.json({ error: "Esta invitación ya no está en plan Gratis" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { planTier: true, premiumCredits: true, diamondCredits: true },
        });
        if (!user) {
            return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
        }

        // Mismo criterio que la creación de invitaciones: una cuenta con plan
        // ilimitado (Premium/Diamond/Enterprise/Admin) no gasta crédito.
        const hasUnlimitedPremium = user.planTier === "PREMIUM" || user.planTier === "DIAMOND" || user.planTier === "ENTERPRISE" || user.planTier === "ADMIN";
        const willSpendCredit = !hasUnlimitedPremium;

        if (willSpendCredit) {
            if (targetPlanTier === "PREMIUM" && user.premiumCredits <= 0) {
                return NextResponse.json({ error: "No tienes créditos premium disponibles", code: "NO_PREMIUM_CREDITS" }, { status: 403 });
            }
            if (targetPlanTier === "DIAMOND" && user.diamondCredits <= 0) {
                return NextResponse.json({ error: "No tienes créditos diamond disponibles", code: "NO_DIAMOND_CREDITS" }, { status: 403 });
            }
        }

        const updatedInvitation = await prisma.$transaction(async (tx) => {
            if (willSpendCredit) {
                const result = await tx.user.updateMany({
                    where: {
                        id: session.user.id,
                        ...(targetPlanTier === "DIAMOND" ? { diamondCredits: { gt: 0 } } : { premiumCredits: { gt: 0 } }),
                    },
                    data: targetPlanTier === "DIAMOND" ? { diamondCredits: { decrement: 1 } } : { premiumCredits: { decrement: 1 } },
                });
                if (result.count === 0) {
                    throw new Error(targetPlanTier === "DIAMOND" ? "NO_DIAMOND_CREDITS" : "NO_PREMIUM_CREDITS");
                }
            }

            return tx.invitation.update({
                where: { id: invitation.id },
                data: {
                    // Cuenta ilimitada: hereda su propio tier (igual que al
                    // crear), no siempre "PREMIUM" -- así una cuenta Diamond
                    // que "usa Premium" para una tarjeta igual habilita LIVE.
                    planTier: hasUnlimitedPremium ? user.planTier : targetPlanTier,
                    premiumCreditSpent: willSpendCredit && targetPlanTier === "PREMIUM",
                    diamondCreditSpent: willSpendCredit && targetPlanTier === "DIAMOND",
                },
            });
        });

        return NextResponse.json(updatedInvitation);
    } catch (error) {
        const code = error instanceof Error ? error.message : null;
        if (code === "NO_PREMIUM_CREDITS" || code === "NO_DIAMOND_CREDITS") {
            return NextResponse.json({ error: "Te quedaste sin ese crédito justo ahora", code }, { status: 403 });
        }
        console.error("[UPGRADE_INVITATION_PLAN]", error);
        return NextResponse.json({ error: "Error al actualizar el plan de la invitación" }, { status: 500 });
    }
}
