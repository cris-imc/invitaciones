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
      {/* Volver, sola arriba a la izquierda */}
      <Link href="/dashboard" title="Volver a Inicio" className="inline-block">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full border-white/15 bg-white/5 hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
      </Link>

      {/* Header — siempre en fila, título y cupos libres uno al lado del
          otro, también en mobile (apilados se veía desprolijo) */}
      <div className="flex flex-row items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg md:text-2xl font-bold tracking-tight truncate">Gestión del Evento</h1>
          <p className="text-muted-foreground text-xs md:text-sm truncate">{invitation.nombreEvento}</p>
        </div>

        <div
          className="flex items-center gap-2.5 md:gap-4 px-3 py-2 md:px-5 md:py-3 rounded-2xl border shrink-0"
          style={{ backgroundColor: "var(--ink)", borderColor: "var(--ink-2)", color: "var(--on-ink)" }}
        >
          <div className="text-right">
            <span className="block text-[8px] md:text-[10px] uppercase tracking-widest font-bold opacity-60 mb-0.5 md:mb-1 whitespace-nowrap">Cupos Libres</span>
            <strong className="text-lg md:text-3xl leading-none" style={{ color: "var(--accent)", fontFamily: "var(--font-display)" }}>
              {remaining}
            </strong>
          </div>
          {maxGuests !== null && (
            <div className="pl-2.5 md:pl-4 border-l text-right" style={{ borderColor: "var(--ink-2)" }}>
              <span className="block text-[8px] md:text-[10px] uppercase tracking-widest font-bold opacity-60 mb-0.5 md:mb-1">Total</span>
              <strong className="text-lg md:text-3xl leading-none" style={{ fontFamily: "var(--font-display)" }}>
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
