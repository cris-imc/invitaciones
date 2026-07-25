import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarCheck, Eye, Plus, Users, Music, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminInvitationRow } from "@/components/dashboard/AdminInvitationRow";
import { AdminPlanSelect } from "@/components/dashboard/AdminPlanSelect";

async function getDashboardStats(userId: string) {
  const invitations = await prisma.invitation.findMany({
    where: { userId },
    include: {
      guests: {
        select: {
          status: true,
          attendingCount: true,
          paymentStatus: true,
        },
      },
      songSuggestions: {
        where: { status: "PENDING" },
        select: { id: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalInvitations    = invitations.length;
  const activeInvitations   = invitations.filter((i) => i.estado === "ACTIVA").length;

  // Agregar totales de guests
  let totalConfirmed  = 0;
  let totalPaid       = 0;
  let totalPending    = 0;
  let totalSongsPending = 0;

  for (const inv of invitations) {
    const confirmed = inv.guests.filter((g) => g.status === "CONFIRMED");
    totalConfirmed  += confirmed.reduce((s, g) => s + g.attendingCount, 0);
    totalPaid       += confirmed.filter((g) => g.paymentStatus === "PAID").length;
    totalPending    += confirmed.filter((g) => g.paymentStatus === "PENDING").length;
    totalSongsPending += inv.songSuggestions.length;
  }

  return {
    totalInvitations,
    activeInvitations,
    totalConfirmed,
    totalPaid,
    totalPending,
    totalSongsPending,
    recentInvitations: invitations.slice(0, 3),
  };
}

export default async function DashboardPage() {
  const session = await auth().catch(() => null);
  if (!session?.user) redirect("/login");

  const userId  = session.user.id as string;
  const role = session.user.role as string;
  const userName = (session.user.name ?? "").split(" ")[0] || "anfitrión";

  if (role === "ADMIN") {
    const clients = await prisma.user.findMany({
      where: { role: "CLIENT" },
      include: {
        invitations: {
          orderBy: { createdAt: "desc" }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return (
      <>
        {/* Topbar */}
        <div className="p-topbar">
          <div>
            <h2>Panel de Administrador 👋</h2>
            <p>Gestiona los clientes activos y sus invitaciones.</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-6">
          {clients.map(client => (
            <div key={client.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
               <h3 className="font-bold text-xl mb-1 text-gray-900">
                 {client.name} <span className="text-sm text-gray-500 font-normal">({client.email})</span>
               </h3>
               <AdminPlanSelect userId={client.id} currentPlan={client.planTier} />
               
               {client.invitations.length === 0 ? (
                 <p className="text-sm text-gray-400 mt-2">No tiene invitaciones creadas.</p>
               ) : (
                 <div className="flex flex-col gap-2 mt-4">
                   {client.invitations.map(inv => (
                      <AdminInvitationRow key={inv.id} invitation={inv} />
                   ))}
                 </div>
               )}
            </div>
          ))}
        </div>
      </>
    );
  }

  // Lógica original para CLIENT
  const stats   = await getDashboardStats(userId);

  const kpis = [
    {
      label: "Invitaciones activas",
      value: stats.activeInvitations,
      sub: `${stats.totalInvitations} en total`,
      icon: CalendarCheck,
    },
    {
      label: "Confirmaron",
      value: stats.totalConfirmed,
      sub: `personas confirmadas`,
      icon: Users,
    },
    {
      label: "Pagaron",
      value: stats.totalPaid,
      sub: `${stats.totalPending} pendientes de pago`,
      icon: TrendingUp,
    },
    {
      label: "Canciones pendientes",
      value: stats.totalSongsPending,
      sub: "requieren moderación",
      icon: Music,
    },
  ];

  return (
    <>
      {/* Topbar */}
      <div className="p-topbar">
        <div>
          <h2>Hola, {userName} 👋</h2>
          <p>Acá tenés el resumen de tus eventos en tiempo real.</p>
        </div>
        <Link href="/dashboard/invitaciones/crear">
          <Button className="l-cta text-ink bg-accent hover:bg-accent/90 border-none rounded-full px-6">
            + Nueva invitación
          </Button>
        </Link>
      </div>

      {/* KPIs */}
      <div className="p-stats">
        {kpis.map(({ label, value, sub }) => (
          <div className="stat" key={label}>
            <p className="kicker">{label}</p>
            <b>{value}</b>
            <small>{sub}</small>
          </div>
        ))}
      </div>

      {/* Invitaciones recientes */}
      <div className="p-list-head">
        <h3>Tus invitaciones recientes</h3>
      </div>

      <div className="flex flex-col">
        {stats.recentInvitations.length > 0 ? (
          stats.recentInvitations.map((inv) => {
            const confirmed = inv.guests.filter((g) => g.status === "CONFIRMED");
            const people = confirmed.reduce((s, g) => s + g.attendingCount, 0);
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
                  {people} confirmadas
                </div>

                <Link href={`/dashboard/invitaciones/${inv.slug}/guests`} className="go">
                  Administrar →
                </Link>
              </div>
            );
          })
        ) : (
          <div className="stat text-center p-10 flex flex-col items-center justify-center border-dashed">
            <p className="text-muted-foreground mb-4 font-ui">Todavía no tenés invitaciones.</p>
            <Link href="/dashboard/invitaciones/crear">
              <Button className="l-cta text-ink bg-accent hover:bg-accent/90 border-none rounded-full px-6">
                Crear tu primera invitación
              </Button>
            </Link>
          </div>
        )}
      </div>

      {stats.totalInvitations > 3 && (
        <div className="mt-4 text-center">
          <Link href="/dashboard/invitaciones" className="text-accent font-ui font-semibold text-sm hover:underline">
            Ver todas las invitaciones →
          </Link>
        </div>
      )}
    </>
  );
}
