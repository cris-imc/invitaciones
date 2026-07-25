import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarCheck, Eye, Plus, Users, Music, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

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
  const stats   = await getDashboardStats(userId);
  const userName = (session.user.name ?? "").split(" ")[0] || "anfitrión";

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
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Hola, {userName} 👋
          </h1>
          <p className="text-muted-foreground">
            Acá tenés el resumen de tus eventos en tiempo real.
          </p>
        </div>
        <Link href="/dashboard/invitaciones/crear">
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> Nueva invitación
          </Button>
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map(({ label, value, sub, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{label}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
              <p className="text-xs text-muted-foreground">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Invitaciones recientes */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Tus invitaciones</h2>
        <div className="grid gap-4">
          {stats.recentInvitations.length > 0 ? (
            stats.recentInvitations.map((inv) => {
              const confirmed = inv.guests.filter((g) => g.status === "CONFIRMED");
              const people = confirmed.reduce((s, g) => s + g.attendingCount, 0);
              const paid   = confirmed.filter((g) => g.paymentStatus === "PAID").length;
              return (
                <Card key={inv.id}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div>
                        <p className="font-semibold">{inv.nombreEvento}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(inv.fechaEvento).toLocaleDateString("es-AR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                          {" · "}
                          <span className={
                            inv.estado === "ACTIVA" ? "text-green-600" :
                            inv.estado === "BORRADOR" ? "text-amber-600" : "text-muted-foreground"
                          }>
                            {inv.estado === "ACTIVA" ? "Activa" : inv.estado === "BORRADOR" ? "Borrador" : "Finalizada"}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {people} confirmadas · {paid} pagaron
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Link href={`/dashboard/invitaciones/${inv.slug}/guests`}>
                          <Button variant="outline" size="sm" className="gap-1">
                            <Users className="w-3 h-3" /> Invitados
                          </Button>
                        </Link>
                        <Link href={`/i/${inv.slug}`} target="_blank">
                          <Button variant="ghost" size="sm" className="gap-1">
                            <Eye className="w-3 h-3" /> Ver
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <p className="mb-4">Todavía no tenés invitaciones.</p>
                <Link href="/dashboard/invitaciones/crear">
                  <Button>Crear tu primera invitación</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {stats.totalInvitations > 3 && (
          <div className="mt-4 text-center">
            <Link href="/dashboard/invitaciones">
              <Button variant="ghost" size="sm">Ver todas las invitaciones →</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
