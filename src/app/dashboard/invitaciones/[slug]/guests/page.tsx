import { prisma } from "@/lib/db";
import { PLAN_LIMITS } from "@/lib/plan-limits";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
  const remaining = maxGuests === null ? "Ilimitados" : Math.max(0, maxGuests - totalConfirmed);

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/invitaciones">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">Gestión del Evento</h1>
            <p className="text-muted-foreground text-sm">{invitation.nombreEvento}</p>
          </div>
        </div>

        <div
          className="flex items-center gap-4 px-5 py-3 rounded-2xl border self-start md:self-auto"
          style={{ backgroundColor: "var(--ink)", borderColor: "var(--ink-2)", color: "var(--on-ink)" }}
        >
          <div className="text-right">
            <span className="block text-[10px] uppercase tracking-widest font-bold opacity-60 mb-1">Cupos Libres</span>
            <strong className="text-2xl md:text-3xl leading-none" style={{ color: "var(--accent)", fontFamily: "var(--font-display)" }}>
              {remaining}
            </strong>
          </div>
          {maxGuests !== null && (
            <div className="pl-4 border-l text-right" style={{ borderColor: "var(--ink-2)" }}>
              <span className="block text-[10px] uppercase tracking-widest font-bold opacity-60 mb-1">Total</span>
              <strong className="text-2xl md:text-3xl leading-none" style={{ fontFamily: "var(--font-display)" }}>
                {maxGuestsStr}
              </strong>
            </div>
          )}
        </div>
      </div>

      <EventShareCard slug={slug} eventName={invitation.nombreEvento} invitationId={invitation.id} />

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
      />
    </div>
  );
}
