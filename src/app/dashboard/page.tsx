import Link from "next/link";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminDashboardClient } from "@/components/dashboard/AdminDashboardClient";
import { NewInvitationButton } from "@/components/dashboard/NewInvitationButton";
import { GreetingText } from "@/components/dashboard/GreetingText";
import { getEventStatus } from "@/lib/expiration";
import { isAdmin, isSuperUser } from "@/lib/roles";
import { ClientInvitationsGrid } from "@/components/dashboard/ClientInvitationsGrid";

// ── Data fetching ────────────────────────────────────────────────
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

  const totalInvitations  = invitations.length;
  const activeInvitations = invitations.filter((i) => i.estado === "ACTIVA" && getEventStatus(i.fechaEvento) !== "EXPIRED" && getEventStatus(i.fechaEvento) !== "POST_EVENT").length;

  let totalConfirmed    = 0;
  let totalPaid         = 0;
  let totalPending      = 0;
  let totalSongsPending = 0;

  for (const inv of invitations) {
    const confirmed = inv.guests.filter((g) => g.status === "CONFIRMED");
    totalConfirmed    += confirmed.reduce((s, g) => s + g.attendingCount, 0);
    totalPaid         += confirmed.filter((g) => g.paymentStatus === "PAID").length;
    // Los pagos parciales van a "pendientes": todavía hay saldo por cobrar.
    totalPending      += confirmed.filter((g) => g.paymentStatus === "PENDING" || g.paymentStatus === "PARTIAL").length;
    totalSongsPending += inv.songSuggestions.length;
  }

  const totalPremiumUsadas = invitations.filter((i) => i.planTier === "PREMIUM").length;

  // Mismo criterio que el límite del plan Gratis en /api/invitations POST
  // (estado ACTIVA + planTier FREE, sin filtrar por vencimiento) -- así el
  // botón "Crear Gratis" se oculta exactamente cuando el servidor rechazaría
  // igual el alta.
  const hasFreeInvitation = invitations.some((i) => i.estado === "ACTIVA" && i.planTier === "FREE");

  return {
    totalInvitations,
    activeInvitations,
    totalConfirmed,
    totalPaid,
    totalPending,
    totalSongsPending,
    totalPremiumUsadas,
    hasFreeInvitation,
    activeInvitationsList: invitations.filter((i) => i.estado === "ACTIVA" && getEventStatus(i.fechaEvento) !== "EXPIRED" && getEventStatus(i.fechaEvento) !== "POST_EVENT"),
    inactiveCount: invitations.filter(
      (i) => i.estado !== "ACTIVA" || getEventStatus(i.fechaEvento) === "EXPIRED" || getEventStatus(i.fechaEvento) === "POST_EVENT"
    ).length,
  };
}

// ── Page component ───────────────────────────────────────────────
export default async function DashboardPage(props: { searchParams?: Promise<{ new?: string }> }) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const isAutoOpen   = searchParams?.new === "true";

  const session = await auth().catch(() => null);
  if (!session?.user || !session.user.id) redirect("/login");

  const userId   = session.user.id as string;
  const role     = session.user.role as string;
  const userName = (session.user.name ?? "").split(" ")[0] || "anfitrión";

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { planTier: true, premiumCredits: true, diamondCredits: true },
  });

  // ── ADMIN view ───────────────────────────────────────────────
  if (isAdmin(role)) {
    const [clients, admins] = await Promise.all([
      prisma.user.findMany({
        where: { role: "CLIENT" },
        include: { invitations: { orderBy: { createdAt: "desc" } } },
        orderBy: { createdAt: "desc" },
      }),
      isSuperUser(role)
        ? prisma.user.findMany({
            where: { role: "ADMIN" },
            orderBy: { createdAt: "desc" },
          })
        : Promise.resolve([]),
    ]);

    return (
      <>
        <div className="p-topbar">
          <div>
            <GreetingText userName={userName} />
            <p>Gestiona los clientes activos y sus invitaciones.</p>
          </div>
        </div>
        <div className="mt-6">
          <AdminDashboardClient clients={clients} admins={admins} isSuperUser={isSuperUser(role)} />
        </div>
      </>
    );
  }

  // ── CLIENT view ──────────────────────────────────────────────
  const stats = await getDashboardStats(userId);

  const kpis = [
    {
      label: "Invitaciones activas",
      value: stats.activeInvitations,
      sub: `${stats.totalInvitations} en total`,
    },
    {
      label: "Confirmaron",
      value: stats.totalConfirmed,
      sub: "personas confirmadas",
    },
    {
      label: "Pagaron",
      value: stats.totalPaid,
      sub: `${stats.totalPending} pendientes de pago`,
    },
    {
      label: "Canciones pendientes",
      value: stats.totalSongsPending,
      sub: "requieren moderación",
    },
  ];

  return (
    <>
      {/* Topbar */}
      <div className="p-topbar">
        <div>
          <GreetingText userName={userName} />
          <p>
            Acá tenés el resumen de tus eventos en tiempo real.
            {dbUser &&
              (dbUser.planTier === "PREMIUM" ||
                dbUser.planTier === "DIAMOND" ||
                dbUser.planTier === "ADMIN" ||
                dbUser.planTier === "ENTERPRISE") && (
                <span className="text-yellow-500 font-semibold ml-2">
                  Invitaciones Premium: ilimitadas por tu plan.
                </span>
              )}
          </p>
        </div>
        <div className="hidden md:block">
          <NewInvitationButton
            premiumCredits={dbUser?.premiumCredits || 0}
            diamondCredits={dbUser?.diamondCredits || 0}
            totalInvitations={stats.totalInvitations}
            planTier={dbUser?.planTier}
            hasFreeInvitation={stats.hasFreeInvitation}
            autoOpen={isAutoOpen}
          />
        </div>
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

      {/* KPI stats */}
      <div className="p-stats">
        {kpis.map(({ label, value, sub }) => (
          <div className="stat" key={label}>
            <p className="kicker">{label}</p>
            <b>{value}</b>
            <small>{sub}</small>
          </div>
        ))}
      </div>

      {/* Invitaciones activas — list header */}
      <div className="p-list-head">
        <h3>Tus invitaciones activas</h3>
      </div>

      {/* Cards */}
      {stats.activeInvitationsList.length > 0 ? (
        <ClientInvitationsGrid invitations={stats.activeInvitationsList} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <div className="stat text-center p-10 flex flex-col items-center justify-center border-dashed">
            <p className="text-muted-foreground mb-4 font-ui">
              Todavía no tenés invitaciones activas.
            </p>
            <NewInvitationButton
              premiumCredits={dbUser?.premiumCredits || 0}
              diamondCredits={dbUser?.diamondCredits || 0}
              totalInvitations={stats.totalInvitations}
              planTier={dbUser?.planTier}
              hasFreeInvitation={stats.hasFreeInvitation}
              autoOpen={isAutoOpen}
            />
          </div>
        </div>
      )}

      {/* Link to inactive */}
      {stats.inactiveCount > 0 && (
        <div className="mt-4 text-center">
          <Link
            href="/dashboard/invitaciones"
            className="text-accent font-ui font-semibold text-sm hover:underline"
          >
            Ver invitaciones inactivas ({stats.inactiveCount}) →
          </Link>
        </div>
      )}
    </>
  );
}
