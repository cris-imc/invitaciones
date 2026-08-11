import { prisma } from "@/lib/db";
import { PLAN_LIMITS } from "@/lib/plan-limits";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { BackLink } from "@/components/ui/BackLink";
import { EventShareCard } from "@/components/dashboard/EventShareCard";
import { GuestPageTabs } from "@/components/dashboard/GuestPageTabs";

export default async function GuestManagementPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth().catch(() => null);

  if (!session?.user || !session.user.id) return redirect("/login");

  const invitation = await prisma.invitation.findUnique({ where: { slug } });
  if (!invitation) return notFound();
  if (invitation.userId !== session.user.id && session.user.role !== "ADMIN") {
    return redirect("/dashboard");
  }

  const totalConfirmed = await prisma.guest.count({
    where: { invitationId: invitation.id },
  });
  const planLimit = PLAN_LIMITS[invitation.planTier as keyof typeof PLAN_LIMITS]?.maxGuests;
  const maxGuests = invitation.maxGuestsOverride !== null ? invitation.maxGuestsOverride : planLimit;
  const maxGuestsStr = maxGuests === null ? "∞" : maxGuests.toString();
  const remaining = maxGuests === null ? "∞" : Math.max(0, maxGuests - totalConfirmed);

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* ── Breadcrumb ── */}
      <div className="adm-breadcrumb">
        <a href="/dashboard">Inicio</a>
        <span>›</span>
        <span>Administrar</span>
      </div>

      {/* ── Title + status card row ── */}
      <div className="flex flex-col xl:flex-row items-start justify-between gap-6 mb-2">
        {/* Title */}
        <div className="min-w-0 flex-1">
          <p className="adm-breadcrumb" style={{ marginBottom: 4 }}>
            Gestión del Evento
          </p>
          <h1 className="adm-title" style={{ marginBottom: 0 }}>
            {invitation.nombreEvento}
          </h1>
        </div>

        {/* Metrics card (Horizontal) */}
        <div className="adm-status-card w-full xl:w-auto" style={{ marginBottom: 0 }}>
          <p className="adm-status-kicker mb-3">
            <span style={{ fontSize: 12 }}>●</span> Capacidad
          </p>
          <div className="flex flex-row items-center gap-3">
            <div className="adm-metric flex-1 xl:flex-none px-4 py-2">
              <span className="adm-metric-val gold text-2xl">{remaining}</span>
              <span className="adm-metric-lbl text-[10px]">Cupos Libres</span>
            </div>
            <div className="adm-metric flex-1 xl:flex-none px-4 py-2">
              <span className="adm-metric-val text-2xl">{maxGuestsStr}</span>
              <span className="adm-metric-lbl text-[10px]">Total</span>
            </div>
            <div className="adm-metric flex-1 xl:flex-none px-4 py-2">
              <span className="adm-metric-val sage text-2xl">{totalConfirmed}</span>
              <span className="adm-metric-lbl text-[10px]">Invitados</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Share card ── */}
      <EventShareCard slug={slug} eventName={invitation.nombreEvento} invitationId={invitation.id} />

      {/* ── Tabs (with all original props) ── */}
      <GuestPageTabs
        invitationId={invitation.id}
        slug={slug}
        regaloHabilitado={!!invitation.regaloHabilitado}
        pagoTarjetaHabilitado={!!invitation.pagoTarjetaHabilitado}
        regaloMonto={invitation.regaloMonto}
        precioAdolescente={invitation.precioAdolescente}
        precioNino={invitation.precioNino}
        rsvpEnabled={invitation.rsvpEnabled ?? invitation.confirmacionHabilitada ?? true}
        planTier={invitation.planTier}
        fechaEvento={invitation.fechaEvento.toISOString()}
        tipo={invitation.tipo}
      />
    </div>
  );
}
