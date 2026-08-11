import Link from "next/link";
import { CalendarCheck, Eye, Users, Music, TrendingUp, PartyPopper, Gem, Crown, Cake, Building2 } from "lucide-react";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminDashboardClient } from "@/components/dashboard/AdminDashboardClient";
import { DeleteInvitationButton } from "@/components/dashboard/DeleteInvitationButton";
import { NewInvitationButton } from "@/components/dashboard/NewInvitationButton";
import { GreetingText } from "@/components/dashboard/GreetingText";
import { PLAN_LIMITS } from "@/lib/plan-limits";
import { getEventStatus } from "@/lib/expiration";

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
    totalPending      += confirmed.filter((g) => g.paymentStatus === "PENDING").length;
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
    activeInvitationsList: invitations.filter((i) => i.estado === "ACTIVA" && getEventStatus(i.fechaEvento) !== "EXPIRED" && getEventStatus(i.fechaEvento) !== "POST_EVENT"),
    inactiveCount: invitations.filter(
      (i) => i.estado !== "ACTIVA" || getEventStatus(i.fechaEvento) === "EXPIRED" || getEventStatus(i.fechaEvento) === "POST_EVENT"
    ).length,
  };
}

// ── Helpers for card design ──────────────────────────────────────
function getStripClass(tipo: string): string {
  const t = (tipo || "").toUpperCase();
  if (t === "CASAMIENTO") return "strip-casamiento";
  if (t === "QUINCE_ANOS" || t === "QUINCEANOS") return "strip-quince";
  if (t === "CUMPLEANOS" || t === "CUMPLEAÑOS") return "strip-cumple";
  if (t === "CORPORATIVO" || t === "EJECUTIVO") return "strip-corporativo";
  return "strip-default";
}

function getEventEmoji(tipo: string): React.ReactNode {
  const t = (tipo || "").toUpperCase();
  if (t === "CASAMIENTO") return <Gem className="w-[18px] h-[18px] text-[rgba(255,255,255,0.7)]" />;
  if (t === "QUINCE_ANOS" || t === "QUINCEANOS") return <Crown className="w-[18px] h-[18px] text-[rgba(255,255,255,0.7)]" />;
  if (t === "CUMPLEANOS" || t === "CUMPLEAÑOS") return <Cake className="w-[18px] h-[18px] text-[rgba(255,255,255,0.7)]" />;
  if (t === "CORPORATIVO" || t === "EJECUTIVO") return <Building2 className="w-[18px] h-[18px] text-[rgba(255,255,255,0.7)]" />;
  return <PartyPopper className="w-[18px] h-[18px] text-[rgba(255,255,255,0.7)]" />;
}

function getEventLabel(tipo: string): string {
  const t = (tipo || "").toUpperCase();
  if (t === "CASAMIENTO") return "Casamiento";
  if (t === "QUINCE_ANOS" || t === "QUINCEANOS") return "15 Años";
  if (t === "CUMPLEANOS" || t === "CUMPLEAÑOS") return "Cumpleaños";
  if (t === "CORPORATIVO" || t === "EJECUTIVO") return "Corporativo";
  return tipo || "Evento";
}

function getDaysUntil(fecha: Date): number {
  const now = new Date();
  return Math.ceil((fecha.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
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
  if (role === "ADMIN") {
    const clients = await prisma.user.findMany({
      where: { role: "CLIENT" },
      include: { invitations: { orderBy: { createdAt: "desc" } } },
      orderBy: { createdAt: "desc" },
    });

    return (
      <>
        <div className="p-topbar">
          <div>
            <GreetingText userName={userName} />
            <p>Gestiona los clientes activos y sus invitaciones.</p>
          </div>
        </div>
        <div className="mt-6">
          <AdminDashboardClient clients={clients} />
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
            {dbUser && (
              <span className="text-yellow-500 font-semibold ml-2">
                {dbUser.planTier === "PREMIUM" ||
                dbUser.planTier === "DIAMOND" ||
                dbUser.planTier === "ADMIN" ||
                dbUser.planTier === "ENTERPRISE"
                  ? "Invitaciones Premium: ilimitadas por tu plan."
                  : `Invitaciones Premium disponibles: ${dbUser.premiumCredits || 0}.`}
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
            <span className="text-[11px] uppercase tracking-wide px-2.5 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {stats.activeInvitationsList.length > 0 ? (
          stats.activeInvitationsList.map((inv) => {
            const confirmed   = inv.guests.filter((g) => g.status === "CONFIRMED");
            const people      = confirmed.reduce((s, g) => s + g.attendingCount, 0);
            const planLimit   = PLAN_LIMITS[inv.planTier as keyof typeof PLAN_LIMITS]?.maxGuests;
            const maxGuests   = inv.maxGuestsOverride !== null ? inv.maxGuestsOverride : planLimit;
            const maxGuestsStr = maxGuests === null ? "∞" : maxGuests.toString();

            const daysUntil = getDaysUntil(inv.fechaEvento);
            const daysLabel =
              daysUntil > 0
                ? `Faltan ${daysUntil} días`
                : daysUntil === 0
                ? "¡Hoy!"
                : "Finalizado";

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
                  {/* Event name */}
                  <p className="m-card-title">{inv.nombreEvento}</p>

                  {/* Meta: date + place */}
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

                  {/* Confirmed count */}
                  <div className="m-card-confirmed">
                    <div className="m-card-confirmed-dot" />
                    <span>
                      {people} / {maxGuestsStr} confirmadas
                    </span>
                  </div>

                  {/* Status tags */}
                  <div className="m-tags">
                    <span className={`m-tag ${inv.estado === "ACTIVA" ? "active" : "draft"}`}>
                      {inv.estado === "ACTIVA"
                        ? "Activa"
                        : inv.estado === "BORRADOR"
                        ? "Borrador"
                        : "Finalizada"}
                    </span>
                    <span className={`m-tag ${inv.planTier === "FREE" ? "free" : "premium"}`}>
                      {inv.planTier === "FREE" ? "Gratis" : "✦ Premium"}
                    </span>
                    <span className="m-tag days">{daysLabel}</span>
                  </div>

                  {/* Actions */}
                  <div className="m-card-actions flex-col">
                    <div className="flex items-center gap-2 w-full">
                      <Link
                        href={`/i/${inv.slug}`}
                        target="_blank"
                        className="m-btn-ghost flex-1 h-9"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Ver ejemplo
                      </Link>
                      <Link
                        href={`/dashboard/invitaciones/${inv.slug}/guests`}
                        className="btn-action go btn-admin-glow inline-flex items-center justify-center h-[40px] px-4 text-xs font-semibold rounded-lg text-black transition-colors flex-1"
                      >
                        Administrar →
                      </Link>
                    </div>
                    <div className="flex items-center justify-center w-full mt-2">
                      <DeleteInvitationButton invitationId={inv.id} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="stat text-center p-10 flex flex-col items-center justify-center border-dashed">
            <p className="text-muted-foreground mb-4 font-ui">
              Todavía no tenés invitaciones activas.
            </p>
            <NewInvitationButton
              premiumCredits={dbUser?.premiumCredits || 0}
              totalInvitations={stats.totalInvitations}
              planTier={dbUser?.planTier}
              autoOpen={isAutoOpen}
            />
          </div>
        )}
      </div>

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
