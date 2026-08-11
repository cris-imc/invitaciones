import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Plus, Calendar, Eye, Pencil } from "lucide-react";
import { prisma } from "@/lib/db";
import { InvitationCard } from "@/components/dashboard/InvitationCard";
import { DeleteInvitationButton } from "@/components/dashboard/DeleteInvitationButton";
import { NewInvitationButton } from "@/components/dashboard/NewInvitationButton";
import { PLAN_LIMITS } from "@/lib/plan-limits";
import { getEventStatus } from "@/lib/expiration";

import { auth } from "@/auth";
import { redirect } from "next/navigation";

async function getInvitations() {
    const session = await auth().catch(() => null);
    if (!session?.user || !session.user.id) redirect("/login");
    const userId = session.user.id;
    
    const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { premiumCredits: true, planTier: true }
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
    return { invitations, dbUser };
}

export default async function InvitacionesPage() {
    const { invitations, dbUser } = await getInvitations();
    return (
        <>
            <div className="p-topbar">
                <div>
                    <h2>Invitaciones Inactivas</h2>
                    <p>
                        Invitaciones en borrador, finalizadas, o que ya vencieron (3 meses después del evento).
                        {dbUser && (
                            <span className="text-yellow-500 font-semibold ml-2 block sm:inline mt-2 sm:mt-0">
                                {dbUser.planTier === 'PREMIUM' || dbUser.planTier === 'DIAMOND' || dbUser.planTier === 'ADMIN' || dbUser.planTier === 'ENTERPRISE' ?
                                    `Invitaciones Premium: ilimitadas por tu plan.` :
                                    `Invitaciones Premium disponibles: ${dbUser.premiumCredits || 0}.`
                                }
                            </span>
                        )}
                    </p>
                </div>
                <NewInvitationButton premiumCredits={dbUser?.premiumCredits || 0} totalInvitations={invitations.length} planTier={dbUser?.planTier} />
            </div>

            <div className="flex flex-col">
                {invitations.length > 0 ? (
                    invitations.map((inv) => {
                        const mono = inv.nombreEvento.substring(0, 1).toUpperCase();
                        const planLimit = PLAN_LIMITS[inv.planTier as keyof typeof PLAN_LIMITS]?.maxGuests;
                        const maxGuests = inv.maxGuestsOverride !== null ? inv.maxGuestsOverride : planLimit;
                        const maxGuestsStr = maxGuests === null ? "∞" : maxGuests.toString();

                        return (
                            <div className="inv-row" key={inv.id}>
                                <div className="seal" style={{ borderColor: 'var(--line)', width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span className="font-display text-accent font-bold">{mono}</span>
                                </div>

                                <div className="inv-info">
                                    <div className="inv-title-row">
                                        <b>{inv.nombreEvento}</b>
                                        <div className={`tag ${inv.estado === "ACTIVA" ? "on" : "draft"}`}>
                                            {inv.estado === "ACTIVA" ? "Activa" : inv.estado === "BORRADOR" ? "Borrador" : "Finalizada"}
                                        </div>
                                        {inv.planTier === "FREE" ? (
                                            <span className="plan-badge plan-badge--free">Gratis</span>
                                        ) : (
                                            <span className="plan-badge plan-badge--premium">✦ Premium</span>
                                        )}
                                    </div>
                                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs opacity-60 mt-1">
                                        <span>
                                            📅 {new Date(inv.fechaEvento).toLocaleDateString("es-AR", {
                                                day: "2-digit",
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </span>
                                        {inv.lugarNombre && (
                                            <span>🏰 {inv.lugarNombre}</span>
                                        )}
                                        {inv.direccion && (
                                            <span>📍 {inv.direccion}</span>
                                        )}
                                    </span>
                                    <div className="rsvp-mini flex items-center gap-2 mt-1">
                                        <div className="dot" style={{ background: 'var(--accent)', width: 8, height: 8, borderRadius: '50%' }}></div>
                                        {inv._count.guests} <span className="opacity-60 text-xs">/ {maxGuestsStr} confirmadas</span>
                                    </div>
                                </div>

                                <div className="inv-actions">
                                  <Link
                                      href={`/i/${inv.slug}`}
                                      target="_blank"
                                      className="btn-action go inline-flex items-center gap-1.5 justify-center h-8 px-3 text-xs font-semibold rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/40 transition-colors"
                                  >
                                      <Eye className="w-3.5 h-3.5" />
                                      <span>Ver</span>
                                  </Link>
                                  <Link
                                      href={`/dashboard/invitaciones/editar/${inv.id}`}
                                      className="btn-action inline-flex items-center gap-1.5 justify-center h-8 px-3 text-xs font-semibold rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 transition-colors"
                                  >
                                      <Pencil className="w-3.5 h-3.5" />
                                      <span>Editar</span>
                                  </Link>
                                  <Link href={`/dashboard/invitaciones/${inv.slug}/guests`} className="btn-action go btn-admin-glow inline-flex items-center justify-center h-8 px-3 text-xs font-semibold rounded-lg text-black transition-colors">
                                      Administrar →
                                  </Link>
                                  <div className="btn-delete flex items-center justify-center">
                                      <DeleteInvitationButton invitationId={inv.id} />
                                  </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="stat text-center p-10 flex flex-col items-center justify-center border-dashed">
                        <p className="text-muted-foreground font-ui">No tenés invitaciones inactivas. Las vas a encontrar acá cuando queden en borrador, finalicen, o venzan 3 meses después del evento.</p>
                    </div>
                )}
            </div>
        </>
    );
}
