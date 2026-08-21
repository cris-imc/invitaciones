import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/db";
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
import { NeonTemplate } from "@/components/templates/NeonTemplate";
import { NeonTemplateVioleta } from "@/components/templates/NeonTemplateVioleta";
import { NeonTemplateDorado } from "@/components/templates/NeonTemplateDorado";
import { NeonTemplateVerde } from "@/components/templates/NeonTemplateVerde";
import { NeonTemplateAzul } from "@/components/templates/NeonTemplateAzul";
import { NeonTemplateRojo } from "@/components/templates/NeonTemplateRojo";
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
import { EditorialTemplateGrafito } from "@/components/templates/EditorialTemplateGrafito";
import { EditorialTemplateAzul } from "@/components/templates/EditorialTemplateAzul";
import { EditorialTemplateGris } from "@/components/templates/EditorialTemplateGris";
import { EditorialTemplateMalva } from "@/components/templates/EditorialTemplateMalva";
import { EditorialTemplateTerracota } from "@/components/templates/EditorialTemplateTerracota";
import { EditorialTemplateVerde } from "@/components/templates/EditorialTemplateVerde";
import { OnixTemplate } from "@/components/templates/OnixTemplate";
import { OnixTemplateAmatista } from "@/components/templates/OnixTemplateAmatista";
import { OnixTemplateEsmeralda } from "@/components/templates/OnixTemplateEsmeralda";
import { OnixTemplateOro } from "@/components/templates/OnixTemplateOro";
import { OnixTemplatePlata } from "@/components/templates/OnixTemplatePlata";
import { OnixTemplateZafiro } from "@/components/templates/OnixTemplateZafiro";
import { JardinSedaTemplate } from "@/components/templates/JardinSedaTemplate";
import { JardinSedaTemplateCielo } from "@/components/templates/JardinSedaTemplateCielo";
import { JardinSedaTemplateDurazno } from "@/components/templates/JardinSedaTemplateDurazno";
import { JardinSedaTemplateLila } from "@/components/templates/JardinSedaTemplateLila";
import { JardinSedaTemplateRosaAntiguo } from "@/components/templates/JardinSedaTemplateRosaAntiguo";
import { JardinSedaTemplateSalvia } from "@/components/templates/JardinSedaTemplateSalvia";
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
import { Cristal3DTemplateVioleta } from "@/components/templates/Cristal3DTemplateVioleta";
import { CineTemplate } from "@/components/templates/CineTemplate";
import { CineTemplateBorgona } from "@/components/templates/CineTemplateBorgona";
import { CineTemplateEsmeralda } from "@/components/templates/CineTemplateEsmeralda";
import { CineTemplateNoir } from "@/components/templates/CineTemplateNoir";
import { CineTemplateTecnicolor } from "@/components/templates/CineTemplateTecnicolor";
import { NordicoTemplate } from "@/components/templates/NordicoTemplate";
import { NordicoTemplateBosque } from "@/components/templates/NordicoTemplateBosque";
import { NordicoTemplateMarino } from "@/components/templates/NordicoTemplateMarino";
import { NordicoTemplateOcre } from "@/components/templates/NordicoTemplateOcre";
import { NordicoTemplateTerracota } from "@/components/templates/NordicoTemplateTerracota";
import { RivieraTemplate } from "@/components/templates/RivieraTemplate";
import { RivieraTemplateAzulejo } from "@/components/templates/RivieraTemplateAzulejo";
import { RivieraTemplateCoral } from "@/components/templates/RivieraTemplateCoral";
import { RivieraTemplateOcre } from "@/components/templates/RivieraTemplateOcre";
import { RivieraTemplateOliva } from "@/components/templates/RivieraTemplateOliva";
import { GoldenDuskTemplate } from "@/components/templates/GoldenDuskTemplate";
import { GoldenDuskTemplateAzulMedianoche } from "@/components/templates/GoldenDuskTemplateAzulMedianoche";
import { GoldenDuskTemplateBorgona } from "@/components/templates/GoldenDuskTemplateBorgona";
import { GoldenDuskTemplateChampagneDorado } from "@/components/templates/GoldenDuskTemplateChampagneDorado";
import { GoldenDuskTemplateRosaAntiguo } from "@/components/templates/GoldenDuskTemplateRosaAntiguo";
import { GoldenDuskTemplateSalvia } from "@/components/templates/GoldenDuskTemplateSalvia";
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
import { checkAndCleanupIfExpired } from "@/lib/expiration-server";
import { autoRejectStalePending } from "@/lib/live-cleanup";
import { FreePlanBanner, FreePlanBannerSpacer } from "@/components/invitation/FreePlanBanner";

// ── Helpers ──────────────────────────────────────────────────────
async function getInvitation(slug: string) {
  return prisma.invitation.findUnique({
    where: { slug },
    include: {
      album: {
        include: {
          fotos: {
            where: { aprobada: true },
            orderBy: { createdAt: "desc" },
          },
        },
      },
      liveSession: {
        include: {
          // Solo aprobadas -- pendientes/rechazadas no deben mostrarse
          // nunca en la invitación pública.
          items: { where: { status: "APPROVED" } },
        },
      },
    },
  });
}

function getEventTitle(invitation: Awaited<ReturnType<typeof getInvitation>>) {
  if (!invitation) return "Invitación";
  if (invitation.tipo === "CASAMIENTO" && invitation.nombreNovia && invitation.nombreNovio) {
    return `Boda de ${invitation.nombreNovia} & ${invitation.nombreNovio}`;
  }
  if (invitation.tipo === "QUINCE_ANOS" && invitation.nombreQuinceanera) {
    return `XV años de ${invitation.nombreQuinceanera}`;
  }
  return invitation.nombreEvento;
}

// ── OG Metadata dinámica por invitación ─────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const invitation = await getInvitation(slug);

  if (!invitation) {
    return { title: "Invitación no encontrada · Invitaciones Digitales" };
  }

  const eventTitle = getEventTitle(invitation);
  const fecha = new Date(invitation.fechaEvento).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const description = `${eventTitle} · ${fecha}${invitation.lugarNombre ? ` · ${invitation.lugarNombre}` : ""}. Confirmá tu asistencia.`;

  const ogImage = invitation.portadaImagenFondo
    ? [{ url: invitation.portadaImagenFondo, width: 1200, height: 630, alt: eventTitle }]
    : undefined;

  return {
    title: `${eventTitle} · Invitaciones Digitales`,
    description,
    openGraph: {
      title: eventTitle,
      description,
      type: "website",
      locale: "es_AR",
      siteName: "Invitaciones Digitales",
      images: ogImage,
    },
    twitter: {
      card: "summary_large_image",
      title: eventTitle,
      description,
      images: ogImage?.map((i) => i.url),
    },
  };
}

// ── Página principal ─────────────────────────────────────────────
export default async function InvitationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const rawInvitation = await getInvitation(slug);
  const invitation = await checkAndCleanupIfExpired(rawInvitation);

  if (!invitation) notFound();

  if (invitation.liveSession?.id && invitation.fechaEvento) {
    await autoRejectStalePending(invitation.liveSession.id, new Date(invitation.fechaEvento));
  }

  let temaColoresObj = { colorPrincipal: 'default' };
  try {
      if (typeof invitation.temaColores === 'string') {
          temaColoresObj = JSON.parse(invitation.temaColores);
      } else if (invitation.temaColores) {
          temaColoresObj = invitation.temaColores as any;
      }
  } catch (e) {
      // Fallback
  }

  function renderTemplate() {
    if (invitation!.tipo === 'CASAMIENTO' || invitation!.tipo === 'QUINCE_ANOS' || invitation!.tipo === 'CUMPLEANOS') {
        const color = temaColoresObj.colorPrincipal || 'default';
        const invRecord = invitation as Record<string, unknown>;

        if (invitation!.templateTipo === 'NEON') {
            switch (color) {
                case 'Violeta': return <NeonTemplateVioleta invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Dorado': return <NeonTemplateDorado invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Verde': return <NeonTemplateVerde invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Azul': return <NeonTemplateAzul invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Rojo': return <NeonTemplateRojo invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <NeonTemplate invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'CHIC') {
            switch (color) {
                case 'Rosa': return <ChicTemplateRosa invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Azul': return <ChicTemplateAzul invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Terracota': return <ChicTemplateTerracota invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Violeta': return <ChicTemplateVioleta invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'VerdeBotella': return <ChicTemplateVerdeBotella invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Gris': return <ChicTemplateGris invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <ChicTemplate invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'MODERNO') {
            switch (color) {
                case 'Azul': return <ModernoTemplateAzul invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Bordo': return <ModernoTemplateBordo invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Negro': return <ModernoTemplateNegro invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Purpura': return <ModernoTemplatePurpura invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Verde': return <ModernoTemplateVerde invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Rojo': return <ModernoTemplateRojo invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'default':
                case 'Gris': return <ModernoTemplateGris invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <ModernoTemplate invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'EDITORIAL') {
            switch (color) {
                case 'Grafito': return <EditorialTemplateGrafito invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Azul': return <EditorialTemplateAzul invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Gris': return <EditorialTemplateGris invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Malva': return <EditorialTemplateMalva invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Terracota': return <EditorialTemplateTerracota invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Verde': return <EditorialTemplateVerde invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <EditorialTemplate invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'ONIX') {
            switch (color) {
                case 'Amatista': return <OnixTemplateAmatista invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Esmeralda': return <OnixTemplateEsmeralda invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Oro': return <OnixTemplateOro invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Plata': return <OnixTemplatePlata invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Zafiro': return <OnixTemplateZafiro invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <OnixTemplate invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'JARDINSEDA') {
            switch (color) {
                case 'Cielo': return <JardinSedaTemplateCielo invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Durazno': return <JardinSedaTemplateDurazno invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Lila': return <JardinSedaTemplateLila invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'RosaAntiguo': return <JardinSedaTemplateRosaAntiguo invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Salvia': return <JardinSedaTemplateSalvia invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <JardinSedaTemplate invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'HOLOGRAMA') {
            switch (color) {
                case 'Azul': return <HologramaTemplateAzul invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Coral': return <HologramaTemplateCoral invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Dorado': return <HologramaTemplateDorado invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Esmeralda': return <HologramaTemplateEsmeralda invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Rosa': return <HologramaTemplateRosa invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <HologramaTemplate invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'CIRCUITO') {
            switch (color) {
                case 'Ambar': return <CircuitoTemplateAmbar invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Azul': return <CircuitoTemplateAzul invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Lima': return <CircuitoTemplateLima invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Rojo': return <CircuitoTemplateRojo invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Violeta': return <CircuitoTemplateVioleta invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <CircuitoTemplate invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'CRISTAL3D') {
            switch (color) {
                case 'Ambar': return <Cristal3DTemplateAmbar invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Esmeralda': return <Cristal3DTemplateEsmeralda invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Menta': return <Cristal3DTemplateMenta invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'RosaCuarzo': return <Cristal3DTemplateRosaCuarzo invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Violeta': return <Cristal3DTemplateVioleta invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <Cristal3DTemplate invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'CINE') {
            switch (color) {
                case 'Borgona': return <CineTemplateBorgona invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Esmeralda': return <CineTemplateEsmeralda invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Noir': return <CineTemplateNoir invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Tecnicolor': return <CineTemplateTecnicolor invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <CineTemplate invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'NORDICO') {
            switch (color) {
                case 'Bosque': return <NordicoTemplateBosque invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Marino': return <NordicoTemplateMarino invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Ocre': return <NordicoTemplateOcre invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Terracota': return <NordicoTemplateTerracota invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <NordicoTemplate invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'RIVIERA') {
            switch (color) {
                case 'Azulejo': return <RivieraTemplateAzulejo invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Coral': return <RivieraTemplateCoral invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Ocre': return <RivieraTemplateOcre invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Oliva': return <RivieraTemplateOliva invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <RivieraTemplate invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'GOLDENDUSK') {
            switch (color) {
                case 'AzulMedianoche': return <GoldenDuskTemplateAzulMedianoche invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Borgona': return <GoldenDuskTemplateBorgona invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'ChampagneDorado': return <GoldenDuskTemplateChampagneDorado invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'RosaAntiguo': return <GoldenDuskTemplateRosaAntiguo invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Salvia': return <GoldenDuskTemplateSalvia invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <GoldenDuskTemplate invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'SEDA') {
            switch (color) {
                case 'Esmeralda': return <SedaTemplateEsmeralda invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Marfil': return <SedaTemplateMarfil invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Nocturna': return <SedaTemplateNocturna invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Perla': return <SedaTemplatePerla invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <SedaTemplate invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'PETALOS') {
            switch (color) {
                case 'Coral': return <PetalosTemplateCoral invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Pastel': return <PetalosTemplatePastel invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'RosaPastel': return <PetalosTemplateRosaPastel invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'VinoVibrante': return <PetalosTemplateVinoVibrante invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <PetalosTemplate invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'LUZLUNA') {
            switch (color) {
                case 'MedianocheAzul': return <LuzLunaTemplateMedianocheAzul invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'NocheEstrellada': return <LuzLunaTemplateNocheEstrellada invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Perlada': return <LuzLunaTemplatePerlada invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'PerlaSuave': return <LuzLunaTemplatePerlaSuave invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <LuzLunaTemplate invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'BONVOYAGE') {
            switch (color) {
                case 'Coral': return <BonVoyageTemplateCoral invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Esmeralda': return <BonVoyageTemplateEsmeralda invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Lavanda': return <BonVoyageTemplateLavanda invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Medianoche': return <BonVoyageTemplateMedianoche invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Turquesa': return <BonVoyageTemplateTurquesa invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <BonVoyageTemplate invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'CORPORATE') {
            switch (color) {
                case 'Bordo': return <CorporateTemplateBordo invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Claro': return <CorporateTemplateClaro invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Verde': return <CorporateTemplateVerde invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Violeta': return <CorporateTemplateVioleta invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <CorporateTemplate invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'GARDENPARTY') {
            switch (color) {
                case 'Amarillo': return <GardenPartyTemplateAmarillo invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Lavanda': return <GardenPartyTemplateLavanda invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Rosa': return <GardenPartyTemplateRosa invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Vibrante': return <GardenPartyTemplateVibrante invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <GardenPartyTemplate invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'LOFTINDUSTRIAL') {
            switch (color) {
                case 'Acero': return <LoftIndustrialTemplateAcero invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Claro': return <LoftIndustrialTemplateClaro invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Cobre': return <LoftIndustrialTemplateCobre invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Verde': return <LoftIndustrialTemplateVerde invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <LoftIndustrialTemplate invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'INFANTIL') {
            switch (color) {
                case 'Amarillo': return <InfantilTemplateAmarillo invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Celeste': return <InfantilTemplateCeleste invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Lavanda': return <InfantilTemplateLavanda invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Menta': return <InfantilTemplateMenta invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <InfantilTemplate invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else {
            // Default to ELEGANT
            switch (color) {
                case 'Green': return <ElegantTemplateGreen invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Red': return <ElegantTemplateRed invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Blue': return <ElegantTemplateBlue invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Orange': return <ElegantTemplateOrange invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Violet': return <ElegantTemplateViolet invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Gray': return <ElegantTemplateGray invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'DarkYellow': return <ElegantTemplateDarkYellow invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Pink': return <ElegantTemplatePink invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <ElegantTemplate invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        }
    }

    // Usar el nuevo ConviteTemplate para todas las invitaciones
    return (
      <ConviteTemplate
        invitation={invitation as Record<string, unknown>}
        guest={null}
        isPersonalized={false}
      />
    );
  }

  const isFree = invitation.planTier === 'FREE';

  return (
    <>
      {isFree && <FreePlanBanner />}
      {isFree && <FreePlanBannerSpacer />}
      {renderTemplate()}
    </>
  );
}
