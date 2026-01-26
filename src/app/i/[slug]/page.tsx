import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Countdown } from "@/components/invitation/Countdown";
import { EventDetails } from "@/components/invitation/EventDetails";
import { RSVPForm } from "@/components/invitation/RSVPForm";
import { PhotoGallery } from "@/components/invitation/PhotoGallery";
import { HeroSection } from "@/components/invitation/HeroSection";
import { EditModeProvider } from "@/contexts/EditModeContext";
import { EditModeToggle } from "@/components/invitation/EditModeToggle";

async function getInvitation(slug: string) {
    const invitation = await prisma.invitation.findUnique({
        where: { slug },
        include: {
            album: {
                include: {
                    fotos: {
                        where: { aprobada: true },
                        orderBy: { createdAt: 'desc' },
                    },
                },
            },
        },
    });

    return invitation;
}

export default async function InvitationPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const invitation = await getInvitation(slug);

    if (!invitation) {
        notFound();
    }

    const temaColores = typeof invitation.temaColores === 'string'
        ? JSON.parse(invitation.temaColores)
        : invitation.temaColores;
    const colorPrincipal = temaColores?.colorPrincipal || '#2563eb';

    return (
        <EditModeProvider>
            <div className="min-h-screen bg-background">
                {/* Hero Section */}
                <HeroSection
                    nombreEvento={invitation.nombreEvento}
                    tipo={invitation.tipo}
                    nombreNovia={invitation.nombreNovia}
                    nombreNovio={invitation.nombreNovio}
                    nombreQuinceanera={invitation.nombreQuinceanera}
                    fechaEvento={invitation.fechaEvento}
                    colorPrincipal={colorPrincipal}
                    imagenPortada={invitation.portadaImagenFondo}
                    imagenPosX={invitation.portadaImagenPosX || 50}
                    imagenPosY={invitation.portadaImagenPosY || 50}
                    imagenEscala={invitation.portadaImagenEscala || 100}
                    invitationId={invitation.id}
                />

            {/* Música de fondo (si existe) */}
            {invitation.musicaUrl && (
                <audio autoPlay loop>
                    <source src={invitation.musicaUrl} type="audio/mpeg" />
                </audio>
            )}

            {/* Countdown */}
            <div id="countdown">
                <Countdown targetDate={new Date(invitation.fechaEvento)} />
            </div>

            {/* Event Details */}
            {invitation.lugarNombre && invitation.direccion && (
                <EventDetails
                    lugarNombre={invitation.lugarNombre}
                    direccion={invitation.direccion}
                    fecha={new Date(invitation.fechaEvento)}
                    hora={invitation.hora || "Por confirmar"}
                    mapUrl={invitation.mapUrl || undefined}
                />
            )}

            {/* Photo Gallery */}
            {invitation.album && (
                <PhotoGallery
                    albumId={invitation.album.id}
                    photos={invitation.album.fotos}
                />
            )}

            {/* RSVP Form */}
            <RSVPForm invitationId={invitation.id} />

            {/* Footer */}
            <footer className="py-8 text-center text-sm text-muted-foreground border-t">
                <p>Creado con ❤️ usando InvitaDigital</p>
            </footer>

            {/* Edit Mode Toggle Button */}
            <EditModeToggle />
        </div>
        </EditModeProvider>
    );
}
