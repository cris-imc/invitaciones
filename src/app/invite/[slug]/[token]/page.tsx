import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { ConviteTemplate } from "@/components/templates/ConviteTemplate";
import { ElegantTemplate } from "@/components/templates/ElegantTemplate";
import { ElegantTemplateGreen } from "@/components/templates/ElegantTemplateGreen";
import { ElegantTemplateRed } from "@/components/templates/ElegantTemplateRed";
import { ElegantTemplateBlue } from "@/components/templates/ElegantTemplateBlue";
import { ElegantTemplateOrange } from "@/components/templates/ElegantTemplateOrange";
import { ElegantTemplateViolet } from "@/components/templates/ElegantTemplateViolet";
import { ElegantTemplateGray } from "@/components/templates/ElegantTemplateGray";
import { ElegantTemplateDarkYellow } from "@/components/templates/ElegantTemplateDarkYellow";
import { ElegantTemplatePink } from "@/components/templates/ElegantTemplatePink";
import { ModernoTemplate } from "@/components/templates/ModernoTemplate";
import { ModernoTemplateAzul } from "@/components/templates/ModernoTemplateAzul";
import { ModernoTemplateBordo } from "@/components/templates/ModernoTemplateBordo";
import { ModernoTemplateNegro } from "@/components/templates/ModernoTemplateNegro";
import { ModernoTemplatePurpura } from "@/components/templates/ModernoTemplatePurpura";
import { ModernoTemplateVerde } from "@/components/templates/ModernoTemplateVerde";
import { ModernoTemplateRojo } from "@/components/templates/ModernoTemplateRojo";
import { ModernoTemplateGris } from "@/components/templates/ModernoTemplateGris";
import { Metadata } from 'next';
import { checkAndCleanupIfExpired } from "@/lib/expiration-server";
import { autoRejectStalePending } from "@/lib/live-cleanup";
import { getInvitePhrase } from "@/lib/invitation-copy";
import { FreePlanBanner, FreePlanBannerSpacer } from "@/components/invitation/FreePlanBanner";

// Generate metadata for social sharing
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const invitation = await prisma.invitation.findUnique({ where: { slug } });

    if (!invitation) return { title: 'Invitación no encontrada' };

    const fecha = new Date(invitation.fechaEvento).toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
    const description = `Estás invitado a ${getInvitePhrase(invitation.tipo)} · ${fecha}${invitation.lugarNombre ? ` · ${invitation.lugarNombre}` : ''}. Confirmá tu asistencia.`;
    const ogImage = invitation.portadaImagenFondo
        ? [{ url: invitation.portadaImagenFondo, width: 1200, height: 630, alt: invitation.nombreEvento }]
        : undefined;

    return {
        title: invitation.nombreEvento,
        description,
        openGraph: {
            title: invitation.nombreEvento,
            description,
            type: 'website',
            locale: 'es_AR',
            siteName: 'Invitaciones Digitales',
            images: ogImage,
        },
        twitter: {
            card: 'summary_large_image',
            title: invitation.nombreEvento,
            description,
            images: ogImage?.map((i) => i.url),
        },
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
                planTier: true,
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
                ciudad: true,
                portadaHabilitada: true,
                portadaKicker: true,
                portadaTitulo: true,
                portadaMensaje: true,
                portadaTextoBoton: true,
                portadaDressCode: true,
                portadaImagenFondo: true,
                portadaImagenFondoDesktop: true,
                portadaImagenPosX: true,
                portadaImagenPosY: true,
                portadaImagenEscala: true,
                portadaImagenDesktopPosX: true,
                portadaImagenDesktopPosY: true,
                contadorHabilitado: true,
                rsvpEnabled: true,
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
                precioAdolescente: true,
                regaloMontoUpdatedAt: true,
                pagoTarjetaHabilitado: true,
                pagoTarjetaTitulo: true,
                pagoTarjetaMensaje: true,
                pagoTarjetaMostrarDatos: true,
                pagoTarjetaAlias: true,
                pagoTarjetaCbu: true,
                pagoTarjetaBanco: true,
                pagoTarjetaTitular: true,
                pagoTarjetaMonto: true,
                triviaHabilitada: true,
                triviaIcono: true,
                triviaTitulo: true,
                triviaSubtitulo: true,
                triviaPreguntas: true,
                frasePersonalizadaHabilitada: true,
                frasePersonalizadaTexto: true,
                frasePersonalizadaEstilo: true,
                seccionCuandoHabilitada: true,
                seccionCuandoIcono: true,
                seccionCuandoTitulo: true,
                seccionDondeHabilitada: true,
                seccionDondeIcono: true,
                seccionDondeTitulo: true,
                lugarBotonTexto: true,
                ceremoniaHabilitada: true,
                ceremoniaTitulo: true,
                ceremoniaNombre: true,
                ceremoniaDireccion: true,
                ceremoniaHora: true,
                ceremoniaMapUrl: true,
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
                fontTitle: true,
                fontBody: true,
                tipografiaDisplay: true,
                countdownStyle: true,
                portadaImagenDesktopEscala: true,
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
                        // Solo aprobadas -- pendientes/rechazadas no deben
                        // mostrarse nunca en la invitación pública.
                        items: { where: { status: "APPROVED" } },
                    },
                },
            } as any,
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
                attendingAdults: true,
                attendingChildren: true,
                message: true,
                responseDate: true,
                paymentStatus: true,
                isExempt: true,
                expectedAdults: true,
                expectedTeens: true,
                expectedChildren: true,
                attendingTeens: true,
            },
        }),
    ]);

    const validInvitation = await checkAndCleanupIfExpired(invitation as any);
    if (!validInvitation) return notFound();

    const vInv = validInvitation as unknown as { liveSession?: { id?: string } | null; fechaEvento?: string | Date | null };
    if (vInv.liveSession?.id && vInv.fechaEvento) {
        await autoRejectStalePending(vInv.liveSession.id, new Date(vInv.fechaEvento));
    }

    // Security check: Ensure token matches the invitation
    if (!guest || guest.invitationId !== String(validInvitation.id)) {
        return (
            <div className="min-h-dvh flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-2xl font-bold mb-2">Enlace no válido</h1>
                <p className="text-muted-foreground">
                    El enlace que utilizaste no parece ser correcto o ha expirado.
                    Por favor contacta a los organizadores.
                </p>
            </div>
        );
    }

    let temaColoresObj = { colorPrincipal: 'default' };
    try {
        if (typeof validInvitation.temaColores === 'string') {
            temaColoresObj = JSON.parse(validInvitation.temaColores);
        } else if (validInvitation.temaColores) {
            temaColoresObj = validInvitation.temaColores as any;
        }
    } catch (e) {
        // Fallback
    }

    function renderTemplate() {
        if (validInvitation.tipo === 'CASAMIENTO' || validInvitation.tipo === 'QUINCE_ANOS' || validInvitation.tipo === 'CUMPLEANOS') {
            const color = temaColoresObj.colorPrincipal || 'default';
            const invRecord = validInvitation as Record<string, unknown>;
            const guestRecord = guest as any;

            if (validInvitation.templateTipo === 'MODERNO') {
                switch (color) {
                    case 'Azul': return <ModernoTemplateAzul invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Bordo': return <ModernoTemplateBordo invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Negro': return <ModernoTemplateNegro invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Purpura': return <ModernoTemplatePurpura invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Verde': return <ModernoTemplateVerde invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Rojo': return <ModernoTemplateRojo invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'default':
                    case 'Gris': return <ModernoTemplateGris invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    default: return <ModernoTemplate invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                }
            } else {
                // Default to ELEGANT
                switch (color) {
                    case 'Green': return <ElegantTemplateGreen invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Red': return <ElegantTemplateRed invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Blue': return <ElegantTemplateBlue invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Orange': return <ElegantTemplateOrange invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Violet': return <ElegantTemplateViolet invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Gray': return <ElegantTemplateGray invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'DarkYellow': return <ElegantTemplateDarkYellow invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Pink': return <ElegantTemplatePink invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    default: return <ElegantTemplate invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                }
            }
        }

        return (
            <ConviteTemplate
                invitation={invitation as Record<string, unknown>}
                guest={guest as any}
                isPersonalized={true}
            />
        );
    }

    const isFree = validInvitation.planTier === 'FREE';

    return (
        <>
            {isFree && <FreePlanBanner />}
            {isFree && <FreePlanBannerSpacer />}
            {renderTemplate()}
        </>
    );
}
