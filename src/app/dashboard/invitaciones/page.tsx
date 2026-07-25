import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Plus, Calendar } from "lucide-react";
import { prisma } from "@/lib/db";
import { InvitationCard } from "@/components/dashboard/InvitationCard";

async function getInvitations() {
    // TODO: Obtener userId de la sesión cuando tengamos auth
    // Por ahora, mostrar todas las invitaciones (desarrollo)
    const invitationsData = await prisma.invitation.findMany({
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

    return invitations;
}

export default async function InvitacionesPage() {
    const invitations = await getInvitations();
    return (
        <>
            <div className="p-topbar">
                <div>
                    <h2>Mis Invitaciones</h2>
                    <p>Gestiona tus eventos y monitorea las confirmaciones.</p>
                </div>
                <Link href="/dashboard/invitaciones/crear">
                    <Button className="l-cta text-ink bg-accent hover:bg-accent/90 border-none rounded-full px-6">
                        + Nueva Invitación
                    </Button>
                </Link>
            </div>

            <div className="flex flex-col">
                {invitations.length > 0 ? (
                    invitations.map((inv) => {
                        const mono = inv.nombreEvento.substring(0, 1).toUpperCase();
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
                                    {inv._count.guests} confirmadas
                                </div>

                                <Link href={`/dashboard/invitaciones/${inv.slug}/guests`} className="go">
                                    Administrar →
                                </Link>
                            </div>
                        );
                    })
                ) : (
                    <div className="stat text-center p-10 flex flex-col items-center justify-center border-dashed">
                        <p className="text-muted-foreground mb-4 font-ui">No tienes invitaciones. Comienza creando tu primera invitación para un evento.</p>
                        <Link href="/dashboard/invitaciones/crear">
                            <Button className="l-cta text-ink bg-accent hover:bg-accent/90 border-none rounded-full px-6">
                                Crear Primera Invitación
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
}
