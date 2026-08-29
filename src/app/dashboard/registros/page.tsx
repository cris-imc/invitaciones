import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { BackLink } from "@/components/ui/BackLink";
import { isAdmin } from "@/lib/roles";

const DAYS = 14;

// Argentina no tiene horario de verano desde 2009 -- UTC-3 fijo todo el año,
// así que alcanza con este offset constante en vez de Intl/timezone DB para
// ubicar cada fecha en el día calendario que corresponde en Argentina (el
// server corre en UTC en producción, por eso "hoy" ahí no coincide con "hoy"
// en Argentina cerca de la medianoche).
const AR_OFFSET_MS = 3 * 60 * 60 * 1000;

function dayKey(d: Date) {
    return new Date(d.getTime() - AR_OFFSET_MS).toISOString().split("T")[0];
}

function countByDay(records: { createdAt: Date }[], days: string[]) {
    const map: Record<string, number> = {};
    for (const day of days) map[day] = 0;
    for (const r of records) {
        const key = dayKey(new Date(r.createdAt));
        if (map[key] !== undefined) map[key]++;
    }
    return map;
}

const ROLE_LABEL: Record<string, string> = { CLIENT: "Clientes", ADMIN: "Admins", SUPERUSER: "Super Usuarios" };
const PLAN_LABEL: Record<string, string> = { FREE: "Gratis", PREMIUM: "Premium", DIAMOND: "Diamond", ADMIN: "Admin", ENTERPRISE: "Enterprise" };

export default async function RegistrosPage() {
    const session = await auth().catch(() => null);
    if (!session?.user || !isAdmin(session.user.role)) {
        redirect("/dashboard");
    }

    // Medianoche de Argentina (hoy - (DAYS-1)), como instante UTC real -- ver
    // AR_OFFSET_MS más arriba sobre por qué no alcanza con Date local.
    const todayArKey = dayKey(new Date());
    const [arY, arM, arD] = todayArKey.split("-").map(Number);
    const since = new Date(Date.UTC(arY, arM - 1, arD, 3, 0, 0));
    since.setUTCDate(since.getUTCDate() - (DAYS - 1));

    const [
        recentUsers, recentInvitations, recentLogins,
        totalUsers, totalInvitations, totalLogins,
        usersByRole, invitationsByPlan, latestLogins,
    ] = await Promise.all([
        prisma.user.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
        prisma.invitation.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
        prisma.loginEvent.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
        prisma.user.count(),
        prisma.invitation.count(),
        prisma.loginEvent.count(),
        prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
        prisma.invitation.groupBy({ by: ["planTier"], _count: { _all: true } }),
        prisma.loginEvent.findMany({
            orderBy: { createdAt: "desc" },
            take: 10,
            include: { user: { select: { name: true, email: true, role: true } } },
        }),
    ]);

    const days: string[] = [];
    for (let i = 0; i < DAYS; i++) {
        const d = new Date(since);
        d.setUTCDate(since.getUTCDate() + i);
        days.push(dayKey(d));
    }

    const usersByDay = countByDay(recentUsers, days);
    const invitationsByDay = countByDay(recentInvitations, days);
    const loginsByDay = countByDay(recentLogins, days);

    return (
        <div className="space-y-6">
            <BackLink href="/dashboard" />

            <div className="p-topbar">
                <div>
                    <h2>Registros y actividad</h2>
                    <p>Cuentas nuevas, tarjetas creadas y logueos de los últimos {DAYS} días.</p>
                </div>
            </div>

            <div className="p-stats">
                <div className="stat">
                    <p className="kicker">Cuentas totales</p>
                    <b>{totalUsers}</b>
                    <small>{recentUsers.length} en los últimos {DAYS} días</small>
                </div>
                <div className="stat">
                    <p className="kicker">Tarjetas creadas</p>
                    <b>{totalInvitations}</b>
                    <small>{recentInvitations.length} en los últimos {DAYS} días</small>
                </div>
                <div className="stat">
                    <p className="kicker">Logueos</p>
                    <b>{totalLogins}</b>
                    <small>{recentLogins.length} en los últimos {DAYS} días</small>
                </div>
            </div>

            {/* ── Info general: cuentas por tipo y tarjetas por plan ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-xl border border-white/10 p-5">
                    <h3 className="text-sm font-semibold mb-4 opacity-80">Cuentas por tipo</h3>
                    <div className="space-y-2">
                        {usersByRole.map((r) => (
                            <div key={r.role} className="flex items-center justify-between text-sm">
                                <span className="opacity-70">{ROLE_LABEL[r.role] || r.role}</span>
                                <span className="font-semibold">{r._count._all}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-xl border border-white/10 p-5">
                    <h3 className="text-sm font-semibold mb-4 opacity-80">Tarjetas por plan</h3>
                    <div className="space-y-2">
                        {invitationsByPlan.map((p) => (
                            <div key={p.planTier} className="flex items-center justify-between text-sm">
                                <span className="opacity-70">{PLAN_LABEL[p.planTier] || p.planTier}</span>
                                <span className="font-semibold">{p._count._all}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Últimos logueos (general, todas las cuentas) ── */}
            <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-white/50 border-b border-white/10">
                            <th className="py-2.5 px-4 font-medium">Cuenta</th>
                            <th className="py-2.5 px-4 font-medium">Tipo</th>
                            <th className="py-2.5 px-4 font-medium">Fecha y hora</th>
                        </tr>
                    </thead>
                    <tbody>
                        {latestLogins.map((login) => (
                            <tr key={login.id} className="border-b border-white/5 last:border-0">
                                <td className="py-2.5 px-4">
                                    <div className="font-medium">{login.user.name}</div>
                                    <div className="text-xs opacity-50">{login.user.email}</div>
                                </td>
                                <td className="py-2.5 px-4 opacity-70">{ROLE_LABEL[login.user.role] || login.user.role}</td>
                                <td className="py-2.5 px-4 font-mono text-xs opacity-70 whitespace-nowrap">
                                    {new Date(login.createdAt).toLocaleString("es-AR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "America/Argentina/Buenos_Aires" })}
                                </td>
                            </tr>
                        ))}
                        {latestLogins.length === 0 && (
                            <tr>
                                <td colSpan={3} className="py-6 px-4 text-center opacity-50">Todavía no hay logueos registrados.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-white/50 border-b border-white/10">
                            <th className="py-2.5 px-4 font-medium">Fecha</th>
                            <th className="py-2.5 px-4 font-medium">Registros</th>
                            <th className="py-2.5 px-4 font-medium">Tarjetas</th>
                            <th className="py-2.5 px-4 font-medium">Logueos</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...days].reverse().map((day) => (
                            <tr key={day} className="border-b border-white/5 last:border-0">
                                <td className="py-2.5 px-4 font-mono text-xs opacity-70 whitespace-nowrap">
                                    {new Date(`${day}T00:00:00`).toLocaleDateString("es-AR", { day: "2-digit", month: "short" })}
                                </td>
                                <td className="py-2.5 px-4">{usersByDay[day]}</td>
                                <td className="py-2.5 px-4">{invitationsByDay[day]}</td>
                                <td className="py-2.5 px-4">{loginsByDay[day]}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
