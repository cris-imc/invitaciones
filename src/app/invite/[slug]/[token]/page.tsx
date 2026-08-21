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
import { NeonTemplateBlackout } from "@/components/templates/NeonTemplateBlackout";
import { NeonTemplateTropical } from "@/components/templates/NeonTemplateTropical";
import { NeonTemplateManzana } from "@/components/templates/NeonTemplateManzana";
import { NeonTemplateAscuas } from "@/components/templates/NeonTemplateAscuas";
import { NeonTemplateEclipse } from "@/components/templates/NeonTemplateEclipse";
import { NeonTemplate } from "@/components/templates/NeonTemplate";
import { NeonTemplateVioleta } from "@/components/templates/NeonTemplateVioleta";
import { NeonTemplateDorado } from "@/components/templates/NeonTemplateDorado";
import { NeonTemplateVerde } from "@/components/templates/NeonTemplateVerde";
import { NeonTemplateAzul } from "@/components/templates/NeonTemplateAzul";
import { NeonTemplateRojo } from "@/components/templates/NeonTemplateRojo";
import { ChicTemplateNocheChic } from "@/components/templates/ChicTemplateNocheChic";
import { ChicTemplatePiedraChic } from "@/components/templates/ChicTemplatePiedraChic";
import { ChicTemplateAzulMedianocheChic } from "@/components/templates/ChicTemplateAzulMedianocheChic";
import { ChicTemplateAmbar } from "@/components/templates/ChicTemplateAmbar";
import { ChicTemplate } from "@/components/templates/ChicTemplate";
import { ChicTemplateRosa } from "@/components/templates/ChicTemplateRosa";
import { ChicTemplateAzul } from "@/components/templates/ChicTemplateAzul";
import { ChicTemplateTerracota } from "@/components/templates/ChicTemplateTerracota";
import { ChicTemplateVioleta } from "@/components/templates/ChicTemplateVioleta";
import { ChicTemplateVerdeBotella } from "@/components/templates/ChicTemplateVerdeBotella";
import { ChicTemplateGris } from "@/components/templates/ChicTemplateGris";
import { ModernoTemplateAzul } from "@/components/templates/ModernoTemplateAzul";
import { ModernoTemplateBordo } from "@/components/templates/ModernoTemplateBordo";
import { ModernoTemplateNegro } from "@/components/templates/ModernoTemplateNegro";
import { ModernoTemplatePurpura } from "@/components/templates/ModernoTemplatePurpura";
import { ModernoTemplateVerde } from "@/components/templates/ModernoTemplateVerde";
import { ModernoTemplateRojo } from "@/components/templates/ModernoTemplateRojo";
import { ModernoTemplateGris } from "@/components/templates/ModernoTemplateGris";
import { EditorialTemplate } from "@/components/templates/EditorialTemplate";
import { EditorialTemplateOnice } from "@/components/templates/EditorialTemplateOnice";
import { EditorialTemplatePiedra } from "@/components/templates/EditorialTemplatePiedra";
import { EditorialTemplateCobalto } from "@/components/templates/EditorialTemplateCobalto";
import { EditorialTemplateGrafito } from "@/components/templates/EditorialTemplateGrafito";
import { EditorialTemplateAzul } from "@/components/templates/EditorialTemplateAzul";
import { EditorialTemplateGris } from "@/components/templates/EditorialTemplateGris";
import { EditorialTemplateMalva } from "@/components/templates/EditorialTemplateMalva";
import { EditorialTemplateTerracota } from "@/components/templates/EditorialTemplateTerracota";
import { EditorialTemplateVerde } from "@/components/templates/EditorialTemplateVerde";
import { OnixTemplateCarbon } from "@/components/templates/OnixTemplateCarbon";
import { OnixTemplateMarfil } from "@/components/templates/OnixTemplateMarfil";
import { OnixTemplateBosque } from "@/components/templates/OnixTemplateBosque";
import { OnixTemplateMedianoche } from "@/components/templates/OnixTemplateMedianoche";
import { OnixTemplate } from "@/components/templates/OnixTemplate";
import { OnixTemplateAmatista } from "@/components/templates/OnixTemplateAmatista";
import { OnixTemplateEsmeralda } from "@/components/templates/OnixTemplateEsmeralda";
import { OnixTemplateOro } from "@/components/templates/OnixTemplateOro";
import { OnixTemplatePlata } from "@/components/templates/OnixTemplatePlata";
import { OnixTemplateZafiro } from "@/components/templates/OnixTemplateZafiro";
import { JardinSedaTemplateJardinNocturno } from "@/components/templates/JardinSedaTemplateJardinNocturno";
import { JardinSedaTemplatePiedraJardin } from "@/components/templates/JardinSedaTemplatePiedraJardin";
import { JardinSedaTemplateTerracotaJardin } from "@/components/templates/JardinSedaTemplateTerracotaJardin";
import { JardinSedaTemplate } from "@/components/templates/JardinSedaTemplate";
import { JardinSedaTemplateCielo } from "@/components/templates/JardinSedaTemplateCielo";
import { JardinSedaTemplateDurazno } from "@/components/templates/JardinSedaTemplateDurazno";
import { JardinSedaTemplateLila } from "@/components/templates/JardinSedaTemplateLila";
import { JardinSedaTemplateRosaAntiguo } from "@/components/templates/JardinSedaTemplateRosaAntiguo";
import { JardinSedaTemplateSalvia } from "@/components/templates/JardinSedaTemplateSalvia";
import { HologramaTemplateNebulosaRoja } from "@/components/templates/HologramaTemplateNebulosaRoja";
import { HologramaTemplateBlancoPrisma } from "@/components/templates/HologramaTemplateBlancoPrisma";
import { HologramaTemplateGrafitoCuantico } from "@/components/templates/HologramaTemplateGrafitoCuantico";
import { HologramaTemplateAurora } from "@/components/templates/HologramaTemplateAurora";
import { HologramaTemplate } from "@/components/templates/HologramaTemplate";
import { HologramaTemplateAzul } from "@/components/templates/HologramaTemplateAzul";
import { HologramaTemplateCoral } from "@/components/templates/HologramaTemplateCoral";
import { HologramaTemplateDorado } from "@/components/templates/HologramaTemplateDorado";
import { HologramaTemplateEsmeralda } from "@/components/templates/HologramaTemplateEsmeralda";
import { HologramaTemplateRosa } from "@/components/templates/HologramaTemplateRosa";
import { CircuitoTemplate } from "@/components/templates/CircuitoTemplate";
import { CircuitoTemplateAmbar } from "@/components/templates/CircuitoTemplateAmbar";
import { CircuitoTemplateAzul } from "@/components/templates/CircuitoTemplateAzul";
import { CircuitoTemplateLima } from "@/components/templates/CircuitoTemplateLima";
import { CircuitoTemplateRojo } from "@/components/templates/CircuitoTemplateRojo";
import { CircuitoTemplateVioleta } from "@/components/templates/CircuitoTemplateVioleta";
import { Cristal3DTemplate } from "@/components/templates/Cristal3DTemplate";
import { Cristal3DTemplateAmbar } from "@/components/templates/Cristal3DTemplateAmbar";
import { Cristal3DTemplateEsmeralda } from "@/components/templates/Cristal3DTemplateEsmeralda";
import { Cristal3DTemplateMenta } from "@/components/templates/Cristal3DTemplateMenta";
import { Cristal3DTemplateRosaCuarzo } from "@/components/templates/Cristal3DTemplateRosaCuarzo";
import { Cristal3DTemplateAmbarFundido } from "@/components/templates/Cristal3DTemplateAmbarFundido";
import { Cristal3DTemplateCristalBlanco } from "@/components/templates/Cristal3DTemplateCristalBlanco";
import { Cristal3DTemplateRosaCristalOscuro } from "@/components/templates/Cristal3DTemplateRosaCristalOscuro";
import { Cristal3DTemplateVioleta } from "@/components/templates/Cristal3DTemplateVioleta";
import { CineTemplateBlancoYNegro } from "@/components/templates/CineTemplateBlancoYNegro";
import { CineTemplateMedianocheDeCine } from "@/components/templates/CineTemplateMedianocheDeCine";
import { CineTemplateOcreVintage } from "@/components/templates/CineTemplateOcreVintage";
import { CineTemplateAmbar } from "@/components/templates/CineTemplateAmbar";
import { CineTemplate } from "@/components/templates/CineTemplate";
import { CineTemplateBorgona } from "@/components/templates/CineTemplateBorgona";
import { CineTemplateEsmeralda } from "@/components/templates/CineTemplateEsmeralda";
import { CineTemplateNoir } from "@/components/templates/CineTemplateNoir";
import { CineTemplateTecnicolor } from "@/components/templates/CineTemplateTecnicolor";
import { NordicoTemplateCarbonNordico } from "@/components/templates/NordicoTemplateCarbonNordico";
import { NordicoTemplateMusgo } from "@/components/templates/NordicoTemplateMusgo";
import { NordicoTemplateArticoAzul } from "@/components/templates/NordicoTemplateArticoAzul";
import { NordicoTemplatePizarra } from "@/components/templates/NordicoTemplatePizarra";
import { NordicoTemplate } from "@/components/templates/NordicoTemplate";
import { NordicoTemplateBosque } from "@/components/templates/NordicoTemplateBosque";
import { NordicoTemplateMarino } from "@/components/templates/NordicoTemplateMarino";
import { NordicoTemplateOcre } from "@/components/templates/NordicoTemplateOcre";
import { NordicoTemplateTerracota } from "@/components/templates/NordicoTemplateTerracota";
import { RivieraTemplateMedianocheRiviera } from "@/components/templates/RivieraTemplateMedianocheRiviera";
import { RivieraTemplatePiedraGris } from "@/components/templates/RivieraTemplatePiedraGris";
import { RivieraTemplateOcasoAzulejo } from "@/components/templates/RivieraTemplateOcasoAzulejo";
import { RivieraTemplateLavandaCostera } from "@/components/templates/RivieraTemplateLavandaCostera";
import { RivieraTemplateCal } from "@/components/templates/RivieraTemplateCal";
import { RivieraTemplate } from "@/components/templates/RivieraTemplate";
import { RivieraTemplateAzulejo } from "@/components/templates/RivieraTemplateAzulejo";
import { RivieraTemplateCoral } from "@/components/templates/RivieraTemplateCoral";
import { RivieraTemplateOcre } from "@/components/templates/RivieraTemplateOcre";
import { RivieraTemplateOliva } from "@/components/templates/RivieraTemplateOliva";
import { GoldenDuskTemplateNocheDorada } from "@/components/templates/GoldenDuskTemplateNocheDorada";
import { GoldenDuskTemplatePiedraCalida } from "@/components/templates/GoldenDuskTemplatePiedraCalida";
import { GoldenDuskTemplateNocheCiruela } from "@/components/templates/GoldenDuskTemplateNocheCiruela";
import { GoldenDuskTemplateBrumaAzul } from "@/components/templates/GoldenDuskTemplateBrumaAzul";
import { GoldenDuskTemplateOcaso } from "@/components/templates/GoldenDuskTemplateOcaso";
import { GoldenDuskTemplate } from "@/components/templates/GoldenDuskTemplate";
import { GoldenDuskTemplateAzulMedianoche } from "@/components/templates/GoldenDuskTemplateAzulMedianoche";
import { GoldenDuskTemplateBorgona } from "@/components/templates/GoldenDuskTemplateBorgona";
import { GoldenDuskTemplateChampagneDorado } from "@/components/templates/GoldenDuskTemplateChampagneDorado";
import { GoldenDuskTemplateRosaAntiguo } from "@/components/templates/GoldenDuskTemplateRosaAntiguo";
import { GoldenDuskTemplateSalvia } from "@/components/templates/GoldenDuskTemplateSalvia";
import { SedaTemplateOnixSeda } from "@/components/templates/SedaTemplateOnixSeda";
import { SedaTemplatePiedra } from "@/components/templates/SedaTemplatePiedra";
import { SedaTemplateCiruela } from "@/components/templates/SedaTemplateCiruela";
import { SedaTemplate } from "@/components/templates/SedaTemplate";
import { SedaTemplateEsmeralda } from "@/components/templates/SedaTemplateEsmeralda";
import { SedaTemplateMarfil } from "@/components/templates/SedaTemplateMarfil";
import { SedaTemplateNocturna } from "@/components/templates/SedaTemplateNocturna";
import { SedaTemplatePerla } from "@/components/templates/SedaTemplatePerla";
import { PetalosTemplate } from "@/components/templates/PetalosTemplate";
import { PetalosTemplateCoral } from "@/components/templates/PetalosTemplateCoral";
import { PetalosTemplatePastel } from "@/components/templates/PetalosTemplatePastel";
import { PetalosTemplateRosaPastel } from "@/components/templates/PetalosTemplateRosaPastel";
import { PetalosTemplateVinoVibrante } from "@/components/templates/PetalosTemplateVinoVibrante";
import { LuzLunaTemplate } from "@/components/templates/LuzLunaTemplate";
import { LuzLunaTemplateMedianocheAzul } from "@/components/templates/LuzLunaTemplateMedianocheAzul";
import { LuzLunaTemplateNocheEstrellada } from "@/components/templates/LuzLunaTemplateNocheEstrellada";
import { LuzLunaTemplatePerlada } from "@/components/templates/LuzLunaTemplatePerlada";
import { LuzLunaTemplatePerlaSuave } from "@/components/templates/LuzLunaTemplatePerlaSuave";
import { BonVoyageTemplateNocheDeViaje } from "@/components/templates/BonVoyageTemplateNocheDeViaje";
import { BonVoyageTemplateArenaCalida } from "@/components/templates/BonVoyageTemplateArenaCalida";
import { BonVoyageTemplateCoralTropical } from "@/components/templates/BonVoyageTemplateCoralTropical";
import { BonVoyageTemplateMapaVintage } from "@/components/templates/BonVoyageTemplateMapaVintage";
import { BonVoyageTemplateIvoire } from "@/components/templates/BonVoyageTemplateIvoire";
import { BonVoyageTemplate } from "@/components/templates/BonVoyageTemplate";
import { BonVoyageTemplateCoral } from "@/components/templates/BonVoyageTemplateCoral";
import { BonVoyageTemplateEsmeralda } from "@/components/templates/BonVoyageTemplateEsmeralda";
import { BonVoyageTemplateLavanda } from "@/components/templates/BonVoyageTemplateLavanda";
import { BonVoyageTemplateMedianoche } from "@/components/templates/BonVoyageTemplateMedianoche";
import { BonVoyageTemplateTurquesa } from "@/components/templates/BonVoyageTemplateTurquesa";
import { CorporateTemplate } from "@/components/templates/CorporateTemplate";
import { CorporateTemplateBordo } from "@/components/templates/CorporateTemplateBordo";
import { CorporateTemplateClaro } from "@/components/templates/CorporateTemplateClaro";
import { CorporateTemplateVerde } from "@/components/templates/CorporateTemplateVerde";
import { CorporateTemplateVioleta } from "@/components/templates/CorporateTemplateVioleta";
import { GardenPartyTemplate } from "@/components/templates/GardenPartyTemplate";
import { GardenPartyTemplateAmarillo } from "@/components/templates/GardenPartyTemplateAmarillo";
import { GardenPartyTemplateLavanda } from "@/components/templates/GardenPartyTemplateLavanda";
import { GardenPartyTemplateRosa } from "@/components/templates/GardenPartyTemplateRosa";
import { GardenPartyTemplateVibrante } from "@/components/templates/GardenPartyTemplateVibrante";
import { LoftIndustrialTemplate } from "@/components/templates/LoftIndustrialTemplate";
import { LoftIndustrialTemplateAcero } from "@/components/templates/LoftIndustrialTemplateAcero";
import { LoftIndustrialTemplateClaro } from "@/components/templates/LoftIndustrialTemplateClaro";
import { LoftIndustrialTemplateCobre } from "@/components/templates/LoftIndustrialTemplateCobre";
import { LoftIndustrialTemplateVerde } from "@/components/templates/LoftIndustrialTemplateVerde";
import { InfantilTemplate } from "@/components/templates/InfantilTemplate";
import { InfantilTemplateAmarillo } from "@/components/templates/InfantilTemplateAmarillo";
import { InfantilTemplateCeleste } from "@/components/templates/InfantilTemplateCeleste";
import { InfantilTemplateLavanda } from "@/components/templates/InfantilTemplateLavanda";
import { InfantilTemplateMenta } from "@/components/templates/InfantilTemplateMenta";
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
                mostrarNombreInvitadoEnSaludo: true,
                fontTitle: true,
                fontBody: true,
                tipografiaDisplay: true,
                countdownStyle: true,
                albumStyle: true,
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

            if (validInvitation.templateTipo === 'NEON') {
                switch (color) {
                    case 'Blackout': return <NeonTemplateBlackout invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Tropical': return <NeonTemplateTropical invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Manzana': return <NeonTemplateManzana invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Ascuas': return <NeonTemplateAscuas invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Eclipse': return <NeonTemplateEclipse invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Violeta': return <NeonTemplateVioleta invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Dorado': return <NeonTemplateDorado invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Verde': return <NeonTemplateVerde invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Azul': return <NeonTemplateAzul invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Rojo': return <NeonTemplateRojo invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    default: return <NeonTemplate invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                }
            } else if (validInvitation.templateTipo === 'CHIC') {
                switch (color) {
                    case 'NocheChic': return <ChicTemplateNocheChic invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'PiedraChic': return <ChicTemplatePiedraChic invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'AzulMedianocheChic': return <ChicTemplateAzulMedianocheChic invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Ambar': return <ChicTemplateAmbar invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Rosa': return <ChicTemplateRosa invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Azul': return <ChicTemplateAzul invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Terracota': return <ChicTemplateTerracota invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Violeta': return <ChicTemplateVioleta invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'VerdeBotella': return <ChicTemplateVerdeBotella invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Gris': return <ChicTemplateGris invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    default: return <ChicTemplate invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                }
            } else if (validInvitation.templateTipo === 'MODERNO') {
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
            } else if (validInvitation.templateTipo === 'EDITORIAL') {
                switch (color) {
                    case 'Onice': return <EditorialTemplateOnice invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Piedra': return <EditorialTemplatePiedra invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Cobalto': return <EditorialTemplateCobalto invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Grafito': return <EditorialTemplateGrafito invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Azul': return <EditorialTemplateAzul invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Gris': return <EditorialTemplateGris invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Malva': return <EditorialTemplateMalva invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Terracota': return <EditorialTemplateTerracota invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Verde': return <EditorialTemplateVerde invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    default: return <EditorialTemplate invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                }
            } else if (validInvitation.templateTipo === 'ONIX') {
                switch (color) {
                    case 'Carbon': return <OnixTemplateCarbon invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Marfil': return <OnixTemplateMarfil invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Bosque': return <OnixTemplateBosque invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Medianoche': return <OnixTemplateMedianoche invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Amatista': return <OnixTemplateAmatista invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Esmeralda': return <OnixTemplateEsmeralda invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Oro': return <OnixTemplateOro invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Plata': return <OnixTemplatePlata invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Zafiro': return <OnixTemplateZafiro invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    default: return <OnixTemplate invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                }
            } else if (validInvitation.templateTipo === 'JARDINSEDA') {
                switch (color) {
                    case 'JardinNocturno': return <JardinSedaTemplateJardinNocturno invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'PiedraJardin': return <JardinSedaTemplatePiedraJardin invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'TerracotaJardin': return <JardinSedaTemplateTerracotaJardin invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Cielo': return <JardinSedaTemplateCielo invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Durazno': return <JardinSedaTemplateDurazno invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Lila': return <JardinSedaTemplateLila invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'RosaAntiguo': return <JardinSedaTemplateRosaAntiguo invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Salvia': return <JardinSedaTemplateSalvia invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    default: return <JardinSedaTemplate invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                }
            } else if (validInvitation.templateTipo === 'HOLOGRAMA') {
                switch (color) {
                    case 'NebulosaRoja': return <HologramaTemplateNebulosaRoja invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'BlancoPrisma': return <HologramaTemplateBlancoPrisma invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'GrafitoCuantico': return <HologramaTemplateGrafitoCuantico invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Aurora': return <HologramaTemplateAurora invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Azul': return <HologramaTemplateAzul invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Coral': return <HologramaTemplateCoral invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Dorado': return <HologramaTemplateDorado invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Esmeralda': return <HologramaTemplateEsmeralda invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Rosa': return <HologramaTemplateRosa invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    default: return <HologramaTemplate invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                }
            } else if (validInvitation.templateTipo === 'CIRCUITO') {
                switch (color) {
                    case 'Ambar': return <CircuitoTemplateAmbar invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Azul': return <CircuitoTemplateAzul invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Lima': return <CircuitoTemplateLima invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Rojo': return <CircuitoTemplateRojo invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Violeta': return <CircuitoTemplateVioleta invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    default: return <CircuitoTemplate invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                }
            } else if (validInvitation.templateTipo === 'CRISTAL3D') {
                switch (color) {
                    case 'Ambar': return <Cristal3DTemplateAmbar invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Esmeralda': return <Cristal3DTemplateEsmeralda invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Menta': return <Cristal3DTemplateMenta invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'RosaCuarzo': return <Cristal3DTemplateRosaCuarzo invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'AmbarFundido': return <Cristal3DTemplateAmbarFundido invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'CristalBlanco': return <Cristal3DTemplateCristalBlanco invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'RosaCristalOscuro': return <Cristal3DTemplateRosaCristalOscuro invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Violeta': return <Cristal3DTemplateVioleta invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    default: return <Cristal3DTemplate invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                }
            } else if (validInvitation.templateTipo === 'CINE') {
                switch (color) {
                    case 'BlancoYNegro': return <CineTemplateBlancoYNegro invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'MedianocheDeCine': return <CineTemplateMedianocheDeCine invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'OcreVintage': return <CineTemplateOcreVintage invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Ambar': return <CineTemplateAmbar invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Borgona': return <CineTemplateBorgona invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Esmeralda': return <CineTemplateEsmeralda invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Noir': return <CineTemplateNoir invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Tecnicolor': return <CineTemplateTecnicolor invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    default: return <CineTemplate invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                }
            } else if (validInvitation.templateTipo === 'NORDICO') {
                switch (color) {
                    case 'CarbonNordico': return <NordicoTemplateCarbonNordico invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Musgo': return <NordicoTemplateMusgo invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'ArticoAzul': return <NordicoTemplateArticoAzul invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Pizarra': return <NordicoTemplatePizarra invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Bosque': return <NordicoTemplateBosque invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Marino': return <NordicoTemplateMarino invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Ocre': return <NordicoTemplateOcre invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Terracota': return <NordicoTemplateTerracota invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    default: return <NordicoTemplate invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                }
            } else if (validInvitation.templateTipo === 'RIVIERA') {
                switch (color) {
                    case 'MedianocheRiviera': return <RivieraTemplateMedianocheRiviera invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'PiedraGris': return <RivieraTemplatePiedraGris invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'OcasoAzulejo': return <RivieraTemplateOcasoAzulejo invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'LavandaCostera': return <RivieraTemplateLavandaCostera invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Cal': return <RivieraTemplateCal invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Azulejo': return <RivieraTemplateAzulejo invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Coral': return <RivieraTemplateCoral invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Ocre': return <RivieraTemplateOcre invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Oliva': return <RivieraTemplateOliva invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    default: return <RivieraTemplate invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                }
            } else if (validInvitation.templateTipo === 'GOLDENDUSK') {
                switch (color) {
                    case 'NocheDorada': return <GoldenDuskTemplateNocheDorada invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'PiedraCalida': return <GoldenDuskTemplatePiedraCalida invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'NocheCiruela': return <GoldenDuskTemplateNocheCiruela invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'BrumaAzul': return <GoldenDuskTemplateBrumaAzul invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Ocaso': return <GoldenDuskTemplateOcaso invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'AzulMedianoche': return <GoldenDuskTemplateAzulMedianoche invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Borgona': return <GoldenDuskTemplateBorgona invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'ChampagneDorado': return <GoldenDuskTemplateChampagneDorado invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'RosaAntiguo': return <GoldenDuskTemplateRosaAntiguo invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Salvia': return <GoldenDuskTemplateSalvia invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    default: return <GoldenDuskTemplate invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                }
            } else if (validInvitation.templateTipo === 'SEDA') {
                switch (color) {
                    case 'OnixSeda': return <SedaTemplateOnixSeda invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Piedra': return <SedaTemplatePiedra invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Ciruela': return <SedaTemplateCiruela invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Esmeralda': return <SedaTemplateEsmeralda invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Marfil': return <SedaTemplateMarfil invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Nocturna': return <SedaTemplateNocturna invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Perla': return <SedaTemplatePerla invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    default: return <SedaTemplate invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                }
            } else if (validInvitation.templateTipo === 'PETALOS') {
                switch (color) {
                    case 'Coral': return <PetalosTemplateCoral invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Pastel': return <PetalosTemplatePastel invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'RosaPastel': return <PetalosTemplateRosaPastel invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'VinoVibrante': return <PetalosTemplateVinoVibrante invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    default: return <PetalosTemplate invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                }
            } else if (validInvitation.templateTipo === 'LUZLUNA') {
                switch (color) {
                    case 'MedianocheAzul': return <LuzLunaTemplateMedianocheAzul invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'NocheEstrellada': return <LuzLunaTemplateNocheEstrellada invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Perlada': return <LuzLunaTemplatePerlada invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'PerlaSuave': return <LuzLunaTemplatePerlaSuave invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    default: return <LuzLunaTemplate invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                }
            } else if (validInvitation.templateTipo === 'BONVOYAGE') {
                switch (color) {
                    case 'NocheDeViaje': return <BonVoyageTemplateNocheDeViaje invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'ArenaCalida': return <BonVoyageTemplateArenaCalida invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'CoralTropical': return <BonVoyageTemplateCoralTropical invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'MapaVintage': return <BonVoyageTemplateMapaVintage invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Ivoire': return <BonVoyageTemplateIvoire invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Coral': return <BonVoyageTemplateCoral invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Esmeralda': return <BonVoyageTemplateEsmeralda invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Lavanda': return <BonVoyageTemplateLavanda invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Medianoche': return <BonVoyageTemplateMedianoche invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Turquesa': return <BonVoyageTemplateTurquesa invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    default: return <BonVoyageTemplate invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                }
            } else if (validInvitation.templateTipo === 'CORPORATE') {
                switch (color) {
                    case 'Bordo': return <CorporateTemplateBordo invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Claro': return <CorporateTemplateClaro invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Verde': return <CorporateTemplateVerde invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Violeta': return <CorporateTemplateVioleta invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    default: return <CorporateTemplate invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                }
            } else if (validInvitation.templateTipo === 'GARDENPARTY') {
                switch (color) {
                    case 'Amarillo': return <GardenPartyTemplateAmarillo invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Lavanda': return <GardenPartyTemplateLavanda invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Rosa': return <GardenPartyTemplateRosa invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Vibrante': return <GardenPartyTemplateVibrante invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    default: return <GardenPartyTemplate invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                }
            } else if (validInvitation.templateTipo === 'LOFTINDUSTRIAL') {
                switch (color) {
                    case 'Acero': return <LoftIndustrialTemplateAcero invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Claro': return <LoftIndustrialTemplateClaro invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Cobre': return <LoftIndustrialTemplateCobre invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Verde': return <LoftIndustrialTemplateVerde invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    default: return <LoftIndustrialTemplate invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                }
            } else if (validInvitation.templateTipo === 'INFANTIL') {
                switch (color) {
                    case 'Amarillo': return <InfantilTemplateAmarillo invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Celeste': return <InfantilTemplateCeleste invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Lavanda': return <InfantilTemplateLavanda invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    case 'Menta': return <InfantilTemplateMenta invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
                    default: return <InfantilTemplate invitation={invRecord} guest={guestRecord} isPersonalized={true} />;
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
