import Link from "next/link";
import { Eye, Pencil } from "lucide-react";
import { prisma } from "@/lib/db";
import { DeleteInvitationButton } from "@/components/dashboard/DeleteInvitationButton";
import { NewInvitationButton } from "@/components/dashboard/NewInvitationButton";
import { PLAN_LIMITS } from "@/lib/plan-limits";
import { getEventStatus } from "@/lib/expiration";
import { getStripClass, getEventEmoji, getEventLabel } from "@/lib/invitation-card-helpers";

import { auth } from "@/auth";
import { redirect } from "next/navigation";

async function getInvitations() {
    const session = await auth().catch(() => null);
    if (!session?.user || !session.user.id) redirect("/login");
    const userId = session.user.id;

    const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { premiumCredits: true, diamondCredits: true, planTier: true }
    });

    const invitationsData = await prisma.invitation.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
            guests: {
                where: {
                    status: 'CONFIRMED'
                },
                select: {
                    attendingCount: true
                }
            }
        }
    });

    // Solo invitaciones inactivas: no-ACTIVA (borrador/finalizada), o que ya
    // pasaron los 3 meses de vigencia posteriores a la fecha del evento
    // o cuyo evento ya ocurrió (POST_EVENT).
    const inactiveInvitationsData = invitationsData.filter(
        (inv) => inv.estado !== "ACTIVA" || getEventStatus(inv.fechaEvento) === "EXPIRED" || getEventStatus(inv.fechaEvento) === "POST_EVENT"
    );

    const invitations = inactiveInvitationsData.map(inv => ({
        ...inv,
        _count: {
            guests: inv.guests.reduce((sum, g) => sum + (g.attendingCount || 0), 0)
        }
    }));

    // Mismo criterio que el límite del plan Gratis en /api/invitations POST
    // -- oculta "Crear Gratis" del diálogo de "Nueva invitación" cuando ya
    // tiene una tarjeta Gratis activa (puede estar entre las activas, no
    // necesariamente en esta lista de inactivas).
    const hasFreeInvitation = invitationsData.some((inv) => inv.estado === "ACTIVA" && inv.planTier === "FREE");

    return { invitations, dbUser, hasFreeInvitation };
}

export default async function InvitacionesPage() {
    const { invitations, dbUser, hasFreeInvitation } = await getInvitations();
    const hasUnlimitedPremium =
        dbUser?.planTier === 'PREMIUM' || dbUser?.planTier === 'DIAMOND' || dbUser?.planTier === 'ADMIN' || dbUser?.planTier === 'ENTERPRISE';

    return (
        <>
            <div className="p-topbar">
                <div>
                    <h2>Invitaciones Inactivas</h2>
                    <p>
                        Invitaciones en borrador, finalizadas, o que ya vencieron (3 meses después del evento).
                        {dbUser && hasUnlimitedPremium && (
                            <span className="text-yellow-500 font-semibold ml-2 block sm:inline mt-2 sm:mt-0">
                                Invitaciones Premium: ilimitadas por tu plan.
                            </span>
                        )}
                    </p>
                </div>
                <NewInvitationButton premiumCredits={dbUser?.premiumCredits || 0} diamondCredits={dbUser?.diamondCredits || 0} totalInvitations={invitations.length} planTier={dbUser?.planTier} hasFreeInvitation={hasFreeInvitation} />
            </div>

            {/* Créditos remanentes */}
            {dbUser && ((dbUser.premiumCredits || 0) > 0 || (dbUser.diamondCredits || 0) > 0) && (
                <div className="flex flex-wrap gap-2 mb-4" style={{ fontFamily: "var(--font-mono)" }}>
                    {(dbUser.premiumCredits || 0) > 0 && (
                        <span className="text-[11px] uppercase tracking-wide px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                            {dbUser.premiumCredits} crédito{dbUser.premiumCredits === 1 ? "" : "s"} Premium disponible{dbUser.premiumCredits === 1 ? "" : "s"}
                        </span>
                    )}
                    {(dbUser.diamondCredits || 0) > 0 && (
                        <span className="text-[11px] uppercase tracking-wide px-2.5 py-1 rounded-full bg-[#67e8f9]/10 text-[#67e8f9] border border-[#67e8f9]/20">
                            {dbUser.diamondCredits} crédito{dbUser.diamondCredits === 1 ? "" : "s"} Diamond disponible{dbUser.diamondCredits === 1 ? "" : "s"}
                        </span>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {invitations.length > 0 ? (
                    invitations.map((inv) => {
                        const planLimit = PLAN_LIMITS[inv.planTier as keyof typeof PLAN_LIMITS]?.maxGuests;
                        const maxGuests = inv.maxGuestsOverride !== null ? inv.maxGuestsOverride : planLimit;
                        const maxGuestsStr = maxGuests === null ? "∞" : maxGuests.toString();

                        // Dentro de esta página, estado === "ACTIVA" solo aparece
                        // cuando el evento ya venció por fecha (ver filtro arriba) --
                        // nunca debe mostrar "Activa" acá, sino "Finalizada".
                        const statusLabel =
                            inv.estado === "BORRADOR" ? "Borrador" : "Finalizada";

                        return (
                            <div className="m-inv-card" key={inv.id}>
                                {/* ── Colored strip ── */}
                                <div className={`m-card-strip ${getStripClass(inv.tipo)}`}>
                                    <div className="m-card-strip-overlay" />
                                    <span className="m-card-type">{getEventLabel(inv.tipo)}</span>
                                    <span className="m-card-emoji">{getEventEmoji(inv.tipo)}</span>
                                </div>

                                {/* ── Card body ── */}
                                <div className="m-card-body">
                                    <p className="m-card-title">{inv.nombreEvento}</p>

                                    <div className="m-card-meta">
                                        <span className="m-meta-row">
                                            📅{" "}
                                            {new Date(inv.fechaEvento).toLocaleDateString("es-AR", {
                                                day: "2-digit",
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </span>
                                        {inv.lugarNombre && (
                                            <span className="m-meta-row">🏰 {inv.lugarNombre}</span>
                                        )}
                                        {inv.direccion && (
                                            <span className="m-meta-row">📍 {inv.direccion}</span>
                                        )}
                                    </div>

                                    <div className="m-card-confirmed">
                                        <div className="m-card-confirmed-dot" />
                                        <span>
                                            {inv._count.guests} / {maxGuestsStr} confirmadas
                                        </span>
                                    </div>

                                    <div className="m-tags">
                                        <span className="m-tag draft">
                                            {statusLabel}
                                        </span>
                                        <span
                                            className={`m-tag ${
                                                inv.planTier === "FREE"
                                                    ? "free"
                                                    : inv.planTier === "DIAMOND" || inv.planTier === "ENTERPRISE"
                                                    ? "diamond"
                                                    : "premium"
                                            }`}
                                        >
                                            {inv.planTier === "FREE"
                                                ? "Gratis"
                                                : inv.planTier === "DIAMOND"
                                                ? "◆ Diamond"
                                                : inv.planTier === "ENTERPRISE"
                                                ? "◆ Enterprise"
                                                : "✦ Premium"}
                                        </span>
                                    </div>

                                    <div className="m-card-actions flex-col">
                                        <div className="flex items-center gap-2 w-full">
                                            <Link
                                                href={`/i/${inv.slug}`}
                                                target="_blank"
                                                className="m-btn-ghost flex-1 h-9"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                Ver
                                            </Link>
                                            <Link
                                                href={`/dashboard/invitaciones/editar/${inv.id}`}
                                                className="m-btn-ghost flex-1 h-9"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                                Editar
                                            </Link>
                                        </div>
                                        <Link
                                            href={`/dashboard/invitaciones/${inv.slug}/guests`}
                                            className="bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)] inline-flex items-center justify-center h-[40px] px-4 text-xs font-semibold rounded-lg transition-colors w-full mt-2"
                                        >
                                            Administrar →
                                        </Link>
                                        <div className="flex items-center justify-center w-full mt-2">
                                            <DeleteInvitationButton invitationId={inv.id} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="stat text-center p-10 flex flex-col items-center justify-center border-dashed col-span-full">
                        <p className="text-muted-foreground font-ui">No tenés invitaciones inactivas. Las vas a encontrar acá cuando queden en borrador, finalicen, o venzan 3 meses después del evento.</p>
                    </div>
                )}
            </div>
        </>
    );
}
