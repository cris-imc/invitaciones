import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { InvitationContent } from "@/components/invitation/InvitationContent";

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
    });

    return invitation;
}

export default async function InvitationPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const invitation = await getInvitation(slug);

    if (!invitation) {
        notFound();
    }

    return <InvitationContent invitation={invitation} />;
}
