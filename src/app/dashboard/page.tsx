import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarCheck, Eye, Plus, Users, Music, TrendingUp, Pencil } from "lucide-react";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminDashboardClient } from "@/components/dashboard/AdminDashboardClient";
import { DeleteInvitationButton } from "@/components/dashboard/DeleteInvitationButton";
import { NewInvitationButton } from "@/components/dashboard/NewInvitationButton";
import { GreetingText } from "@/components/dashboard/GreetingText";
import { PLAN_LIMITS } from "@/lib/plan-limits";
import { getEventStatus } from "@/lib/expiration";

async function getDashboardStats(userId: string) {
  if (!userId) throw new Error("No user ID provided");
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

  const totalPremiumUsadas = invitations.filter((i) => i.planTier === "PREMIUM").length;

  return {
    totalInvitations,
    activeInvitations,
    totalConfirmed,
    totalPaid,
    totalPending,
    totalSongsPending,
    totalPremiumUsadas,
    activeInvitationsList: invitations.filter((i) => i.estado === "ACTIVA"),
    inactiveCount: invitations.filter(
      (i) => i.estado !== "ACTIVA" || getEventStatus(i.fechaEvento) === "EXPIRED"
    ).length,
  };
}

export default async function DashboardPage(props: { searchParams?: Promise<{ new?: string }> }) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const isAutoOpen = searchParams?.new === "true";

  const session = await auth().catch(() => null);
  if (!session?.user || !session.user.id) redirect("/login");

  const userId  = session.user.id as string;
  const role = session.user.role as string;
  const userName = (session.user.name ?? "").split(" ")[0] || "anfitrión";

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { planTier: true, premiumCredits: true }
  });
  const currentPlan = dbUser?.planTier || "FREE";
  const planName = PLAN_LIMITS[currentPlan as keyof typeof PLAN_LIMITS]?.name || "Gratis";

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

        <div className="mt-6">
          <AdminDashboardClient clients={clients} />
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
      <div className="p-topbar flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 !items-start w-full text-left">
        <div className="w-full text-left flex flex-col items-start">
          <div className="flex items-center gap-3 mb-1">
            <GreetingText userName={userName} />
          </div>
          <p>
            Acá tenés el resumen de tus eventos en tiempo real.
            {dbUser && (
              <span className="text-yellow-500 font-semibold ml-2 block sm:inline mt-2 sm:mt-0">
                {dbUser.planTier === 'PREMIUM' || dbUser.planTier === 'ADMIN' || dbUser.planTier === 'ENTERPRISE'
                  ? 'Invitaciones Premium: ilimitadas por tu plan.'
                  : `Invitaciones Premium disponibles: ${dbUser.premiumCredits || 0}.`}
              </span>
            )}
          </p>
        </div>
        <NewInvitationButton premiumCredits={dbUser?.premiumCredits || 0} totalInvitations={stats.totalInvitations} planTier={dbUser?.planTier} autoOpen={isAutoOpen} />
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

      {/* Invitaciones activas */}
      <div className="p-list-head">
        <h3>Tus invitaciones activas</h3>
      </div>

      <div className="flex flex-col gap-4">
        {stats.activeInvitationsList.length > 0 ? (
          stats.activeInvitationsList.map((inv) => {
            const confirmed = inv.guests.filter((g) => g.status === "CONFIRMED");
            const people = confirmed.reduce((s, g) => s + g.attendingCount, 0);
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
                  <span className="font-mono text-[11px] text-paper/50 mt-0.5">
                    {new Date(inv.fechaEvento).toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <div className="rsvp-mini flex items-center gap-2 mt-1">
                    <div className="dot" style={{ background: 'var(--accent)', width: 8, height: 8, borderRadius: '50%' }}></div>
                    {people} <span className="opacity-60 text-xs">/ {maxGuestsStr} confirmadas</span>
                  </div>
                </div>

                <div className="inv-actions">
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
            <p className="text-muted-foreground mb-4 font-ui">Todavía no tenés invitaciones activas.</p>
            <NewInvitationButton premiumCredits={dbUser?.premiumCredits || 0} totalInvitations={stats.totalInvitations} planTier={dbUser?.planTier} autoOpen={isAutoOpen} />
          </div>
        )}
      </div>

      {stats.inactiveCount > 0 && (
        <div className="mt-4 text-center">
          <Link href="/dashboard/invitaciones" className="text-accent font-ui font-semibold text-sm hover:underline">
            Ver invitaciones inactivas ({stats.inactiveCount}) →
          </Link>
        </div>
      )}
    </>
  );
}
