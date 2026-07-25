import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
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

  const invitation = await prisma.invitation.findUnique({
    where: { slug },
  });

  if (!invitation) return notFound();

  return (
    <div className="p-6 md:p-8 space-y-6">
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
