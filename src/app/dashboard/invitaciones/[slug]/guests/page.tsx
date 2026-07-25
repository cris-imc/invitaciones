import { prisma } from "@/lib/db";
import { PLAN_LIMITS } from "@/lib/plan-limits";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GuestManager } from "@/components/dashboard/guests/GuestManager";
import { GuestListWithPayment } from "@/components/dashboard/GuestListWithPayment";
import { SongModerationPanel } from "@/components/dashboard/SongModerationPanel";
import { EventShareCard } from "@/components/dashboard/EventShareCard";

export default async function GuestManagementPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth().catch(() => null);

  if (!session?.user || !session.user.id) return redirect("/login");

  const invitation = await prisma.invitation.findUnique({
    where: { slug },
  });

  if (!invitation) return notFound();
  
  if (invitation.userId !== session.user.id && session.user.role !== "ADMIN") {
      return redirect("/dashboard");
  }

  const confirmedGuests = await prisma.guest.aggregate({
    where: { invitationId: invitation.id, status: 'CONFIRMED' },
    _sum: { attendingCount: true }
  });
  const totalConfirmed = confirmedGuests._sum.attendingCount || 0;
  const planLimit = PLAN_LIMITS[invitation.planTier as keyof typeof PLAN_LIMITS]?.maxGuests;
  const maxGuests = invitation.maxGuestsOverride !== null ? invitation.maxGuestsOverride : planLimit;
  const maxGuestsStr = maxGuests === null ? "∞" : maxGuests.toString();
  const remaining = maxGuests === null ? "Ilimitados" : Math.max(0, maxGuests - totalConfirmed);

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/invitaciones">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Gestión del Evento</h1>
            <p className="text-muted-foreground">{invitation.nombreEvento}</p>
          </div>
        </div>
        
        <div 
          className="flex items-center gap-4 px-6 py-4 rounded-2xl border"
          style={{ backgroundColor: 'var(--ink)', borderColor: 'var(--ink-2)', color: 'var(--on-ink)' }}
        >
            <div className="text-right">
                <span className="block text-[10px] uppercase tracking-widest font-bold opacity-60 mb-1">Cupos Libres</span>
                <strong className="text-3xl leading-none" style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>
                    {remaining}
                </strong>
            </div>
            {maxGuests !== null && (
                <div className="pl-4 border-l text-right" style={{ borderColor: 'var(--ink-2)' }}>
                    <span className="block text-[10px] uppercase tracking-widest font-bold opacity-60 mb-1">Total</span>
                    <strong className="text-3xl leading-none" style={{ fontFamily: 'var(--font-display)' }}>
                        {maxGuestsStr}
                    </strong>
                </div>
            )}
        </div>
      </div>

      <EventShareCard slug={slug} eventName={invitation.nombreEvento} />

      <Tabs defaultValue="invitados" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="invitados">Invitados & Pagos</TabsTrigger>
          <TabsTrigger value="canciones">Música</TabsTrigger>
          <TabsTrigger value="agregar">Agregar Invitado</TabsTrigger>
        </TabsList>
        
        <TabsContent value="invitados">
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Lista de Invitados</h2>
            <GuestListWithPayment 
              invitationId={invitation.id} 
            />
          </div>
        </TabsContent>
        
        <TabsContent value="canciones">
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Moderación de Canciones</h2>
            <SongModerationPanel invitationId={invitation.id} />
          </div>
        </TabsContent>

        <TabsContent value="agregar">
          {/* Reutilizamos el GuestManager viejo solo para el form de agregar y sus stats, 
              o podríamos crear un form de "Agregar" independiente luego, pero esto funciona rápido */}
          <GuestManager
            slug={slug}
            initialRsvpEnabled={invitation.rsvpEnabled ?? invitation.confirmacionHabilitada ?? true}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
