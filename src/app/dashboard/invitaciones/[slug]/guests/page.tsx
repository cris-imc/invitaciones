import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { BackLink } from "@/components/ui/BackLink";
import { EventShareCard } from "@/components/dashboard/EventShareCard";
import { GuestStatsBar } from "@/components/dashboard/GuestStatsBar";
import { GuestPageTabs } from "@/components/dashboard/GuestPageTabs";
import { getEventStatus } from "@/lib/expiration";
import { isAdmin } from "@/lib/roles";

// Prueba visual: leyenda animada de estado (en vivo / desconectado) junto al
// título de "Gestión del Evento". El evento deja de estar "en vivo" una vez
// pasado (POST_EVENT/EXPIRED, ver getEventStatus) -- ahi el icono se apaga.
function LiveStatusBadge({ live, size = "sm", className }: { live: boolean; size?: "xs" | "sm"; className?: string }) {
  const textSize = size === "xs" ? "text-[9px]" : "text-[10px]";

  if (live) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 ${textSize} font-mono uppercase tracking-wider text-emerald-400 ${className ?? ""}`}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
        </span>
        Datos en tiempo real
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${textSize} font-mono uppercase tracking-wider text-white/30 ${className ?? ""}`}
    >
      <span className="inline-flex rounded-full h-2 w-2 bg-white/25" />
      Desconectado
    </span>
  );
}

export default async function GuestManagementPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth().catch(() => null);

  if (!session?.user || !session.user.id) return redirect("/login");

  const invitation = await prisma.invitation.findUnique({ where: { slug } });
  if (!invitation) return notFound();
  if (invitation.userId !== session.user.id && !isAdmin(session.user.role)) {
    return redirect("/dashboard");
  }

  const eventStatus = getEventStatus(invitation.fechaEvento);
  const isLive = eventStatus === "PRE_EVENT" || eventStatus === "EVENT_DAY";

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* ── Breadcrumb ── */}
      <div className="flex items-center justify-between gap-3">
        <div className="adm-breadcrumb">
          <a href="/dashboard">Inicio</a>
          <span>›</span>
          <span>Administrar</span>
        </div>
        {/* Mobile/tablet: alineado con el breadcrumb, justificado a la derecha */}
        <div className="xl:hidden shrink-0">
          <LiveStatusBadge live={isLive} size="xs" />
        </div>
      </div>

      {/* ── Title + status card row ── */}
      <div className="flex flex-col gap-6 mb-2">
        {/* Title */}
        <div className="min-w-0 flex-1">
          <p className="adm-breadcrumb" style={{ marginBottom: 4 }}>
            Gestión del Evento
          </p>
          <h1 className="adm-title min-w-0" style={{ marginBottom: 0 }}>
            {invitation.nombreEvento}
          </h1>
          {/* Desktop: debajo del título */}
          <div className="hidden xl:block mt-2">
            <LiveStatusBadge live={isLive} />
          </div>
        </div>
      </div>

      {/* ── Estadísticas fijas (reemplaza al viejo recuadro "Capacidad") ── */}
      <GuestStatsBar invitationId={invitation.id} pagoTarjetaHabilitado={!!invitation.pagoTarjetaHabilitado} />

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
        mostrarNombreInvitadoEnSaludo={invitation.mostrarNombreInvitadoEnSaludo ?? true}
      />
    </div>
  );
}
