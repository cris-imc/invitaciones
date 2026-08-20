import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { BackLink } from "@/components/ui/BackLink";
import { DiscountCodesClient } from "@/components/dashboard/DiscountCodesClient";

export default async function DescuentosPage() {
    const session = await auth().catch(() => null);
    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/dashboard");
    }

    const codes = await prisma.discountCode.findMany({
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { payments: true } } },
    });

    return (
        <div className="space-y-6">
            <BackLink href="/dashboard" />

            <div className="p-topbar">
                <div>
                    <h2>Códigos de descuento</h2>
                    <p>Códigos que dan un % extra sobre el precio de Premium/Diamond al registrarse.</p>
                </div>
            </div>

            <DiscountCodesClient
                codes={codes.map((c) => ({
                    id: c.id,
                    code: c.code,
                    percentage: c.percentage,
                    enabled: c.enabled,
                    createdAt: c.createdAt.toISOString(),
                    usedCount: c._count.payments,
                }))}
            />
        </div>
    );
}
