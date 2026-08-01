import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ConviteTemplate } from "@/components/templates/ConviteTemplate";
import { checkAndCleanupIfExpired } from "@/lib/expiration-server";

async function getInvitation(slug: string) {
    const invitation = await prisma.invitation.findUnique({
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
            portadaImagenFondoDesktop: true,
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
            sugerenciaMusicaHabilitada: true,
            regaloHabilitado: true,
            regaloTitulo: true,
            regaloMensaje: true,
            regaloMostrarDatos: true,
            regaloBanco: true,
            regaloCbu: true,
            regaloAlias: true,
            regaloTitular: true,
            regaloMonto: true,
            precioNino: true,
            regaloMontoUpdatedAt: true,
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
            liveSession: {
                select: {
                    id: true,
                    items: true,
                },
            },
        },
    });

    return invitation;
}

export default async function InvitationPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const rawInvitation = await getInvitation(slug);
    const invitation = await checkAndCleanupIfExpired(rawInvitation);

    if (!invitation) {
        notFound();
    }

    return <ConviteTemplate invitation={invitation as Record<string, unknown>} />;
}
