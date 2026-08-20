import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { BackLink } from "@/components/ui/BackLink";
import { isAdmin, ROLE_LABELS } from "@/lib/roles";
import { getEventLabel, getEventEmoji } from "@/lib/invitation-card-helpers";

const PLAN_LABEL: Record<string, string> = { FREE: "Gratis", PREMIUM: "Premium", DIAMOND: "Diamond", ADMIN: "Admin", ENTERPRISE: "Enterprise" };

export default async function ClienteDetallePage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth().catch(() => null);
    if (!session?.user || !isAdmin(session.user.role)) {
        redirect("/dashboard");
    }

    const { id } = await params;

    const [client, last3Logins] = await Promise.all([
        prisma.user.findUnique({
            where: { id },
            include: { invitations: { orderBy: { createdAt: "desc" } } },
        }),
        prisma.loginEvent.findMany({
            where: { userId: id },
            orderBy: { createdAt: "desc" },
            take: 3,
        }),
    ]);

    if (!client) notFound();

    // El planTier de la cuenta en si (client.planTier) queda siempre en FREE
    // para clientes -- el plan real se define por invitacion (cada una tiene
    // su propio planTier), no por la cuenta. Mostrar client.planTier directo
    // era enganoso: un cliente con varias tarjetas Premium igual mostraba
    // "Plan: Gratis". Se resume acá cuántas tarjetas tiene por plan en su lugar.
    const premiumCount = client.invitations.filter((i) => i.planTier === "PREMIUM").length;
    const diamondCount = client.invitations.filter((i) => i.planTier === "DIAMOND").length;
    const planUsageLabel = client.role !== "CLIENT"
        ? `Plan: ${PLAN_LABEL[client.planTier] || client.planTier}`
        : premiumCount === 0 && diamondCount === 0
        ? "Sin tarjetas Premium/Diamond"
        : [premiumCount > 0 ? `${premiumCount} Premium` : null, diamondCount > 0 ? `${diamondCount} Diamond` : null].filter(Boolean).join(" · ");

    return (
        <div className="space-y-6">
            <BackLink href="/dashboard" />

            <div className="p-topbar">
                <div>
                    <h2>{client.name}</h2>
                    <p>{client.email}</p>
                </div>
            </div>

            <div className="p-stats">
                <div className="stat">
                    <p className="kicker">Cuenta creada</p>
                    <b className="text-lg">
                        {new Date(client.createdAt).toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })}
                    </b>
                    <small>{new Date(client.createdAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })} hs</small>
                </div>
                <div className="stat">
                    <p className="kicker">Tarjetas creadas</p>
                    <b>{client.invitations.length}</b>
                </div>
                <div className="stat">
                    <p className="kicker">Tipo de cuenta</p>
                    <b className="text-lg">{ROLE_LABELS[client.role] || client.role}</b>
                    <small>{planUsageLabel}</small>
                </div>
            </div>

            {/* ── Últimos 3 logins ── */}
            <div className="rounded-xl border border-white/10 p-5">
                <h3 className="text-sm font-semibold mb-4 opacity-80">Últimos 3 inicios de sesión</h3>
                {last3Logins.length === 0 ? (
                    <p className="text-sm opacity-40">Todavía no hay logueos registrados para esta cuenta.</p>
                ) : (
                    <div className="space-y-2">
                        {last3Logins.map((login) => (
                            <div key={login.id} className="flex items-center justify-between text-sm border-b border-white/5 last:border-0 py-1.5">
                                <span className="opacity-70">
                                    {new Date(login.createdAt).toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })}
                                </span>
                                <span className="font-mono text-xs opacity-50">
                                    {new Date(login.createdAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })} hs
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Tarjetas de la cuenta ── */}
            <div>
                <h3 className="text-sm font-semibold mb-3 opacity-80">Tarjetas de esta cuenta</h3>
                {client.invitations.length === 0 ? (
                    <p className="text-sm opacity-40">No tiene invitaciones creadas.</p>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-white/10">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-white/50 border-b border-white/10">
                                    <th className="py-2.5 px-4 font-medium">Evento</th>
                                    <th className="py-2.5 px-4 font-medium">Tipo</th>
                                    <th className="py-2.5 px-4 font-medium">Plan</th>
                                    <th className="py-2.5 px-4 font-medium">Estado</th>
                                    <th className="py-2.5 px-4 font-medium">Creada</th>
                                </tr>
                            </thead>
                            <tbody>
                                {client.invitations.map((inv) => (
                                    <tr key={inv.id} className="border-b border-white/5 last:border-0">
                                        <td className="py-2.5 px-4">{inv.nombreEvento}</td>
                                        <td className="py-2.5 px-4">{getEventEmoji(inv.tipo)} {getEventLabel(inv.tipo)}</td>
                                        <td className="py-2.5 px-4">{PLAN_LABEL[inv.planTier] || inv.planTier}</td>
                                        <td className="py-2.5 px-4">{inv.estado === "ACTIVA" ? "Activa" : inv.estado === "BORRADOR" ? "Borrador" : "Finalizada"}</td>
                                        <td className="py-2.5 px-4 font-mono text-xs opacity-70 whitespace-nowrap">
                                            {new Date(inv.createdAt).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
