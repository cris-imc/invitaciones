import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { InvitationContent } from "@/components/invitation/InvitationContent";
import { Metadata } from 'next';

// Generate metadata for social sharing
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const invitation = await prisma.invitation.findUnique({ where: { slug } });

    if (!invitation) return { title: 'Invitación no encontrada' };

    return {
        title: invitation.nombreEvento,
        description: `Estás invitado a ${invitation.nombreEvento}`,
    };
}

export default async function PersonalizedInvitationPage({ params }: { params: Promise<{ slug: string; token: string }> }) {
    const { slug, token } = await params;

    // Single optimized query combining invitation and guest validation
    const [invitation, guest] = await Promise.all([
        prisma.invitation.findUnique({
            where: { slug },
            select: {
                id: true,
                slug: true,
                tipo: true,
                estado: true,
                nombreEvento: true,
                nombreNovia: true,
                nombreNovio: true,
                nombreQuinceanera: true,
                fechaEvento: true,
                hora: true,
                lugarNombre: true,
                direccion: true,
                mapUrl: true,
                temaColores: true,
                portadaHabilitada: true,
                portadaTitulo: true,
                portadaTextoBoton: true,
                portadaImagenFondo: true,
                musicaHabilitada: true,
                musicaUrl: true,
                musicaAutoplay: true,
                musicaLoop: true,
                galeriaPrincipalHabilitada: true,
                galeriaPrincipalFotos: true,
                galeriaSecundariaHabilitada: true,
                galeriaSecundariaFotos: true,
                cronogramaEventos: true,
                confirmacionHabilitada: true,
                confirmacionIcono: true,
                confirmacionTitulo: true,
                confirmacionFechaLimite: true,
                albumCompartidoHabilitado: true,
                albumCompartidoTitulo: true,
                albumCompartidoDescripcion: true,
                regaloHabilitado: true,
                regaloTitulo: true,
                regaloMensaje: true,
                regaloMostrarDatos: true,
                regaloBanco: true,
                regaloCbu: true,
                regaloAlias: true,
                regaloTitular: true,
                triviaHabilitada: true,
                triviaIcono: true,
                triviaTitulo: true,
                triviaSubtitulo: true,
                triviaPreguntas: true,
                frasePersonalizadaHabilitada: true,
                frasePersonalizadaTexto: true,
                frasePersonalizadaEstilo: true,
                seccionCuandoHabilitada: true,
                dresscodeHabilitado: true,
                dresscodeIcono: true,
                dresscodeTitulo: true,
                dresscodeTipo: true,
                dresscodeObservaciones: true,
                mensajeFinalHabilitado: true,
                mensajeFinalTexto: true,
                despedidaHabilitada: true,
                despedidaFoto: true,
                rsvpDaysBeforeEvent: true,
                templateTipo: true,
                album: {
                    select: {
                        id: true,
                        fotos: {
                            where: { aprobada: true },
                            select: {
                                id: true,
                                url: true,
                                createdAt: true,
                            },
                            orderBy: { createdAt: 'desc' },
                        },
                    },
                },
            },
        }),
        prisma.guest.findUnique({
            where: { uniqueToken: token },
            select: {
                id: true,
                name: true,
                type: true,
                expectedCount: true,
                invitationId: true,
                uniqueToken: true,
                status: true,
                attendingCount: true,
                message: true,
                responseDate: true,
            },
        }),
    ]);

    if (!invitation) return notFound();

    // Security check: Ensure token matches the invitation
    if (!guest || guest.invitationId !== invitation.id) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-2xl font-bold mb-2">Enlace no válido</h1>
                <p className="text-muted-foreground">
                    El enlace que utilizaste no parece ser correcto o ha expirado.
                    Por favor contacta a los organizadores.
                </p>
            </div>
        );
    }

    return (
        <InvitationContent
            invitation={invitation}
            guest={guest}
            isPersonalized={true}
        />
    );
}
