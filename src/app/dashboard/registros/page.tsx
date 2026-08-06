import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { BackLink } from "@/components/ui/BackLink";

const DAYS = 14;

function dayKey(d: Date) {
    return d.toISOString().split("T")[0];
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

export default async function RegistrosPage() {
    const session = await auth().catch(() => null);
    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/dashboard");
    }

    const since = new Date();
    since.setDate(since.getDate() - (DAYS - 1));
    since.setHours(0, 0, 0, 0);

    const [recentUsers, recentInvitations, recentLogins, totalUsers, totalInvitations, totalLogins] = await Promise.all([
        prisma.user.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
        prisma.invitation.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
        prisma.loginEvent.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
        prisma.user.count(),
        prisma.invitation.count(),
        prisma.loginEvent.count(),
    ]);

    const days: string[] = [];
    for (let i = 0; i < DAYS; i++) {
        const d = new Date(since);
        d.setDate(since.getDate() + i);
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
