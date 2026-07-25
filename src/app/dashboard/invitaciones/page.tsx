import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Plus, Calendar } from "lucide-react";
import { prisma } from "@/lib/db";
import { InvitationCard } from "@/components/dashboard/InvitationCard";
import { DeleteInvitationButton } from "@/components/dashboard/DeleteInvitationButton";
import { NewInvitationButton } from "@/components/dashboard/NewInvitationButton";
import { PLAN_LIMITS } from "@/lib/plan-limits";

import { auth } from "@/auth";
import { redirect } from "next/navigation";

async function getInvitations() {
    const session = await auth().catch(() => null);
    if (!session?.user || !session.user.id) redirect("/login");
    const userId = session.user.id;
    
    const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { premiumCredits: true }
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

    const invitations = invitationsData.map(inv => ({
        ...inv,
        _count: {
            guests: inv.guests.reduce((sum, g) => sum + (g.attendingCount || 0), 0)
        }
    }));
    const totalPremiumUsadas = invitations.filter((i) => i.planTier === "PREMIUM").length;

    return { invitations, dbUser, totalPremiumUsadas };
}

export default async function InvitacionesPage() {
    const { invitations, dbUser, totalPremiumUsadas } = await getInvitations();
    const totalPremiumCompradas = totalPremiumUsadas + (dbUser?.premiumCredits || 0);
    return (
        <>
            <div className="p-topbar">
                <div>
                    <h2>Mis Invitaciones</h2>
                    <p>
                        Gestiona tus eventos y monitorea las confirmaciones.
                        {dbUser && (
                            <span className="text-yellow-500 font-semibold ml-2 block sm:inline mt-2 sm:mt-0">
                                Invitaciones Premium: {totalPremiumUsadas} en uso | {dbUser.premiumCredits || 0} disponibles.
                            </span>
                        )}
                    </p>
                </div>
                <NewInvitationButton premiumCredits={dbUser?.premiumCredits || 0} totalInvitations={invitations.length} />
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
                                
                                <div className="meta">
                                    <b>{inv.nombreEvento}</b>
                                    <span>
                                        {new Date(inv.fechaEvento).toLocaleDateString("es-AR", {
                                            day: "2-digit",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </span>
                                </div>

                                <div className={`tag ${inv.estado === "ACTIVA" ? "on" : "draft"}`}>
                                    {inv.estado === "ACTIVA" ? "Activa" : inv.estado === "BORRADOR" ? "Borrador" : "Finalizada"}
                                </div>

                                <div className="rsvp-mini flex items-center gap-2">
                                    <div className="dot" style={{ background: 'var(--accent)', width: 8, height: 8, borderRadius: '50%' }}></div>
                                    {inv._count.guests} <span className="opacity-60 text-xs">/ {maxGuestsStr} confirmadas</span>
                                </div>

                                <div className="flex items-center gap-4 ml-auto">
                                  {inv.planTier === "FREE" ? (
                                    <button
                                      type="button"
                                      className="hidden sm:inline-flex items-center justify-center h-8 px-4 text-xs font-semibold rounded-full bg-accent/10 text-accent border border-accent hover:bg-accent/20 transition-colors"
                                      title="Por ahora sin funcionar"
                                    >
                                      Mejorar a Premium
                                    </button>
                                  ) : (
                                    <div className="hidden sm:inline-flex items-center justify-center h-6 px-3 text-[10px] uppercase tracking-widest font-bold rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/30">
                                      Premium
                                    </div>
                                  )}
                                  <DeleteInvitationButton invitationId={inv.id} />
                                  <Link href={`/dashboard/invitaciones/${inv.slug}/guests`} className="go !ml-0">
                                      Administrar →
                                  </Link>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="stat text-center p-10 flex flex-col items-center justify-center border-dashed">
                        <p className="text-muted-foreground mb-4 font-ui">No tienes invitaciones. Comienza creando tu primera invitación para un evento.</p>
                        <NewInvitationButton premiumCredits={dbUser?.premiumCredits || 0} totalInvitations={invitations.length} />
                    </div>
                )}
            </div>
        </>
    );
}
