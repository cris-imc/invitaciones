import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { PlantillaDinamica } from "@/components/templates/PlantillaDinamica";
import { checkAndCleanupIfExpired } from "@/lib/expiration-server";
import { autoRejectStalePending } from "@/lib/live-cleanup";
import { FreePlanBanner, FreePlanBannerSpacer } from "@/components/invitation/FreePlanBanner";
import { ProveedorIdioma } from "@/components/i18n/ProveedorIdioma";
import { ProveedorInvitacion } from "@/components/invitation/ContextoInvitacion";
import { esIdiomaValido, idiomaSegunPais } from "@/lib/i18n/idiomas";

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
                case 'Blackout': return <PlantillaDinamica nombre="NeonTemplateBlackout" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Tropical': return <PlantillaDinamica nombre="NeonTemplateTropical" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Manzana': return <PlantillaDinamica nombre="NeonTemplateManzana" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Ascuas': return <PlantillaDinamica nombre="NeonTemplateAscuas" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Eclipse': return <PlantillaDinamica nombre="NeonTemplateEclipse" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Violeta': return <PlantillaDinamica nombre="NeonTemplateVioleta" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Dorado': return <PlantillaDinamica nombre="NeonTemplateDorado" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Verde': return <PlantillaDinamica nombre="NeonTemplateVerde" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Azul': return <PlantillaDinamica nombre="NeonTemplateAzul" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Rojo': return <PlantillaDinamica nombre="NeonTemplateRojo" invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <PlantillaDinamica nombre="NeonTemplate" invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'CHIC') {
            switch (color) {
                case 'NocheChic': return <PlantillaDinamica nombre="ChicTemplateNocheChic" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'PiedraChic': return <PlantillaDinamica nombre="ChicTemplatePiedraChic" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'AzulMedianocheChic': return <PlantillaDinamica nombre="ChicTemplateAzulMedianocheChic" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Ambar': return <PlantillaDinamica nombre="ChicTemplateAmbar" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Rosa': return <PlantillaDinamica nombre="ChicTemplateRosa" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Azul': return <PlantillaDinamica nombre="ChicTemplateAzul" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Terracota': return <PlantillaDinamica nombre="ChicTemplateTerracota" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Violeta': return <PlantillaDinamica nombre="ChicTemplateVioleta" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'VerdeBotella': return <PlantillaDinamica nombre="ChicTemplateVerdeBotella" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Gris': return <PlantillaDinamica nombre="ChicTemplateGris" invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <PlantillaDinamica nombre="ChicTemplate" invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'GUESTPASSVIP') {
            switch (color) {
                case 'Borgona': return <PlantillaDinamica nombre="GuestPassVipTemplateBorgona" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Esmeralda': return <PlantillaDinamica nombre="GuestPassVipTemplateEsmeralda" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Plata': return <PlantillaDinamica nombre="GuestPassVipTemplatePlata" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Zafiro': return <PlantillaDinamica nombre="GuestPassVipTemplateZafiro" invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <PlantillaDinamica nombre="GuestPassVipTemplate" invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'BLACKANDWHITE') {
            switch (color) {
                case 'Negativo': return <PlantillaDinamica nombre="BlackAndWhiteTemplateNegativo" invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <PlantillaDinamica nombre="BlackAndWhiteTemplate" invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'PRINCESA') {
            switch (color) {
                case 'AzulMedianoche': return <PlantillaDinamica nombre="PrincesaTemplateAzulMedianoche" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Borgona': return <PlantillaDinamica nombre="PrincesaTemplateBorgona" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'BosqueEncantado': return <PlantillaDinamica nombre="PrincesaTemplateBosqueEncantado" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'RosaAntiguo': return <PlantillaDinamica nombre="PrincesaTemplateRosaAntiguo" invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <PlantillaDinamica nombre="PrincesaTemplate" invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'CORONAESCARLATA') {
            switch (color) {
                case 'Esmeralda': return <PlantillaDinamica nombre="CoronaEscarlataTemplateEsmeralda" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Imperial': return <PlantillaDinamica nombre="CoronaEscarlataTemplateImperial" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Medianoche': return <PlantillaDinamica nombre="CoronaEscarlataTemplateMedianoche" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Zafiro': return <PlantillaDinamica nombre="CoronaEscarlataTemplateZafiro" invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <PlantillaDinamica nombre="CoronaEscarlataTemplate" invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'JEWELRYBOX') {
            switch (color) {
                case 'Esmeralda': return <PlantillaDinamica nombre="JewelryBoxTemplateEsmeralda" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Perla': return <PlantillaDinamica nombre="JewelryBoxTemplatePerla" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Rubi': return <PlantillaDinamica nombre="JewelryBoxTemplateRubi" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Zafiro': return <PlantillaDinamica nombre="JewelryBoxTemplateZafiro" invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <PlantillaDinamica nombre="JewelryBoxTemplate" invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'PASEVIP') {
            switch (color) {
                case 'Cobre': return <PlantillaDinamica nombre="PaseVipTemplateCobre" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Platino': return <PlantillaDinamica nombre="PaseVipTemplatePlatino" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Rubi': return <PlantillaDinamica nombre="PaseVipTemplateRubi" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Violeta': return <PlantillaDinamica nombre="PaseVipTemplateVioleta" invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <PlantillaDinamica nombre="PaseVipTemplate" invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'CINEABSTRACTOXV') {
            switch (color) {
                case 'Noir': return <PlantillaDinamica nombre="CineAbstractoXvTemplateNoir" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'SciFi': return <PlantillaDinamica nombre="CineAbstractoXvTemplateSciFi" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Tecnicolor': return <PlantillaDinamica nombre="CineAbstractoXvTemplateTecnicolor" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Western': return <PlantillaDinamica nombre="CineAbstractoXvTemplateWestern" invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <PlantillaDinamica nombre="CineAbstractoXvTemplate" invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'ACRYLICPOP') {
            switch (color) {
                case 'Bubblegum': return <PlantillaDinamica nombre="AcrylicPopTemplateBubblegum" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Scarlet': return <PlantillaDinamica nombre="AcrylicPopTemplateScarlet" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Sunset': return <PlantillaDinamica nombre="AcrylicPopTemplateSunset" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'UltraViolet': return <PlantillaDinamica nombre="AcrylicPopTemplateUltraViolet" invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <PlantillaDinamica nombre="AcrylicPopTemplate" invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'BOLADEDISCOTECA') {
            switch (color) {
                case 'Esmeralda': return <PlantillaDinamica nombre="BolaDeDiscotecaTemplateEsmeralda" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'FucsiaElectrico': return <PlantillaDinamica nombre="BolaDeDiscotecaTemplateFucsiaElectrico" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Turquesa': return <PlantillaDinamica nombre="BolaDeDiscotecaTemplateTurquesa" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Violeta': return <PlantillaDinamica nombre="BolaDeDiscotecaTemplateVioleta" invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <PlantillaDinamica nombre="BolaDeDiscotecaTemplate" invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'CRYSTAL3D') {
            switch (color) {
                case 'AmbarBronce': return <PlantillaDinamica nombre="Crystal3dTemplateAmbarBronce" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'CuarzoRosa': return <PlantillaDinamica nombre="Crystal3dTemplateCuarzoRosa" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'EsmeraldaPlata': return <PlantillaDinamica nombre="Crystal3dTemplateEsmeraldaPlata" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'ZafiroBlanco': return <PlantillaDinamica nombre="Crystal3dTemplateZafiroBlanco" invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <PlantillaDinamica nombre="Crystal3dTemplate" invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'FASHIONTAG') {
            switch (color) {
                case 'BottleGreen': return <PlantillaDinamica nombre="FashionTagTemplateBottleGreen" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Burgundy': return <PlantillaDinamica nombre="FashionTagTemplateBurgundy" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'GoldenMustard': return <PlantillaDinamica nombre="FashionTagTemplateGoldenMustard" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'MidnightNavy': return <PlantillaDinamica nombre="FashionTagTemplateMidnightNavy" invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <PlantillaDinamica nombre="FashionTagTemplate" invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'CERAMICAEDITORIAL') {
            switch (color) {
                case 'Celadon': return <PlantillaDinamica nombre="CeramicaEditorialTemplateCeladon" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Cobalto': return <PlantillaDinamica nombre="CeramicaEditorialTemplateCobalto" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'GrisPiedra': return <PlantillaDinamica nombre="CeramicaEditorialTemplateGrisPiedra" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Terracota': return <PlantillaDinamica nombre="CeramicaEditorialTemplateTerracota" invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <PlantillaDinamica nombre="CeramicaEditorialTemplate" invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'CINEABSTRACTO') {
            switch (color) {
                case 'BlancoNegroPlata': return <PlantillaDinamica nombre="CineAbstractoTemplateBlancoNegroPlata" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'NoirEsmeralda': return <PlantillaDinamica nombre="CineAbstractoTemplateNoirEsmeralda" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'SepiaClasico': return <PlantillaDinamica nombre="CineAbstractoTemplateSepiaClasico" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'TecnicolorAzulNaranja': return <PlantillaDinamica nombre="CineAbstractoTemplateTecnicolorAzulNaranja" invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <PlantillaDinamica nombre="CineAbstractoTemplate" invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'PAPELERIADEHOTELDELUJO') {
            switch (color) {
                case 'AzulMarinoPlata': return <PlantillaDinamica nombre="PapeleriaDeHotelDeLujoTemplateAzulMarinoPlata" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'BorgonaOroRosa': return <PlantillaDinamica nombre="PapeleriaDeHotelDeLujoTemplateBorgonaOroRosa" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'GrisCarbonOroBlanco': return <PlantillaDinamica nombre="PapeleriaDeHotelDeLujoTemplateGrisCarbonOroBlanco" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'NegroYBronce': return <PlantillaDinamica nombre="PapeleriaDeHotelDeLujoTemplateNegroYBronce" invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <PlantillaDinamica nombre="PapeleriaDeHotelDeLujoTemplate" invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'VINTAGEEDITORIAL') {
            switch (color) {
                case 'AzulPetroleo': return <PlantillaDinamica nombre="VintageEditorialTemplateAzulPetroleo" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'BorgonaVino': return <PlantillaDinamica nombre="VintageEditorialTemplateBorgonaVino" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'OlivaVintage': return <PlantillaDinamica nombre="VintageEditorialTemplateOlivaVintage" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'PlataAntigua': return <PlantillaDinamica nombre="VintageEditorialTemplatePlataAntigua" invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <PlantillaDinamica nombre="VintageEditorialTemplate" invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'FASHIONLOOKBOOK') {
            switch (color) {
                case 'Cobalto': return <PlantillaDinamica nombre="FashionLookbookTemplateCobalto" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Magenta': return <PlantillaDinamica nombre="FashionLookbookTemplateMagenta" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Militar': return <PlantillaDinamica nombre="FashionLookbookTemplateMilitar" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Mostaza': return <PlantillaDinamica nombre="FashionLookbookTemplateMostaza" invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <PlantillaDinamica nombre="FashionLookbookTemplate" invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'MARMOLYORO') {
            switch (color) {
                case 'Bronce': return <PlantillaDinamica nombre="MarmolYOroTemplateBronce" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Esmeralda': return <PlantillaDinamica nombre="MarmolYOroTemplateEsmeralda" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Onix': return <PlantillaDinamica nombre="MarmolYOroTemplateOnix" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Rosa': return <PlantillaDinamica nombre="MarmolYOroTemplateRosa" invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <PlantillaDinamica nombre="MarmolYOroTemplate" invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'ATELIERDEPAPEL') {
            switch (color) {
                case 'AzulTinta': return <PlantillaDinamica nombre="AtelierDePapelTemplateAzulTinta" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'BorgonaVino': return <PlantillaDinamica nombre="AtelierDePapelTemplateBorgonaVino" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'GrisGrafito': return <PlantillaDinamica nombre="AtelierDePapelTemplateGrisGrafito" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'VerdeSalvia': return <PlantillaDinamica nombre="AtelierDePapelTemplateVerdeSalvia" invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <PlantillaDinamica nombre="AtelierDePapelTemplate" invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'BOTANICAEDITORIAL') {
            switch (color) {
                case 'Borgona': return <PlantillaDinamica nombre="BotanicaEditorialTemplateBorgona" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Indigo': return <PlantillaDinamica nombre="BotanicaEditorialTemplateIndigo" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Lavanda': return <PlantillaDinamica nombre="BotanicaEditorialTemplateLavanda" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Terracota': return <PlantillaDinamica nombre="BotanicaEditorialTemplateTerracota" invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <PlantillaDinamica nombre="BotanicaEditorialTemplate" invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'ENCAJECONTEMPORANEO') {
            switch (color) {
                case 'AzulMedianoche': return <PlantillaDinamica nombre="EncajeContemporaneoTemplateAzulMedianoche" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Borgona': return <PlantillaDinamica nombre="EncajeContemporaneoTemplateBorgona" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'GrisPiedra': return <PlantillaDinamica nombre="EncajeContemporaneoTemplateGrisPiedra" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'VerdeBosque': return <PlantillaDinamica nombre="EncajeContemporaneoTemplateVerdeBosque" invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <PlantillaDinamica nombre="EncajeContemporaneoTemplate" invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'LIQUIDGLASS') {
            switch (color) {
                case 'Amatista': return <PlantillaDinamica nombre="LiquidGlassTemplateAmatista" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Ambar': return <PlantillaDinamica nombre="LiquidGlassTemplateAmbar" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Cuarzo': return <PlantillaDinamica nombre="LiquidGlassTemplateCuarzo" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Esmeralda': return <PlantillaDinamica nombre="LiquidGlassTemplateEsmeralda" invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <PlantillaDinamica nombre="LiquidGlassTemplate" invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'MODERNO') {
            switch (color) {
                case 'Azul': return <PlantillaDinamica nombre="ModernoTemplateAzul" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Bordo': return <PlantillaDinamica nombre="ModernoTemplateBordo" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Negro': return <PlantillaDinamica nombre="ModernoTemplateNegro" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Purpura': return <PlantillaDinamica nombre="ModernoTemplatePurpura" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Verde': return <PlantillaDinamica nombre="ModernoTemplateVerde" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Rojo': return <PlantillaDinamica nombre="ModernoTemplateRojo" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'default':
                case 'Gris': return <PlantillaDinamica nombre="ModernoTemplateGris" invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <PlantillaDinamica nombre="ModernoTemplate" invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'EDITORIAL') {
            switch (color) {
                case 'Onice': return <PlantillaDinamica nombre="EditorialTemplateOnice" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Piedra': return <PlantillaDinamica nombre="EditorialTemplatePiedra" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Cobalto': return <PlantillaDinamica nombre="EditorialTemplateCobalto" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Grafito': return <PlantillaDinamica nombre="EditorialTemplateGrafito" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Azul': return <PlantillaDinamica nombre="EditorialTemplateAzul" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Gris': return <PlantillaDinamica nombre="EditorialTemplateGris" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Malva': return <PlantillaDinamica nombre="EditorialTemplateMalva" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Terracota': return <PlantillaDinamica nombre="EditorialTemplateTerracota" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Verde': return <PlantillaDinamica nombre="EditorialTemplateVerde" invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <PlantillaDinamica nombre="EditorialTemplate" invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'ONIX') {
            switch (color) {
                case 'Carbon': return <PlantillaDinamica nombre="OnixTemplateCarbon" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Marfil': return <PlantillaDinamica nombre="OnixTemplateMarfil" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Bosque': return <PlantillaDinamica nombre="OnixTemplateBosque" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Medianoche': return <PlantillaDinamica nombre="OnixTemplateMedianoche" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Amatista': return <PlantillaDinamica nombre="OnixTemplateAmatista" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Esmeralda': return <PlantillaDinamica nombre="OnixTemplateEsmeralda" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Oro': return <PlantillaDinamica nombre="OnixTemplateOro" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Plata': return <PlantillaDinamica nombre="OnixTemplatePlata" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Zafiro': return <PlantillaDinamica nombre="OnixTemplateZafiro" invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <PlantillaDinamica nombre="OnixTemplate" invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'JARDINSEDA') {
            switch (color) {
                case 'JardinNocturno': return <PlantillaDinamica nombre="JardinSedaTemplateJardinNocturno" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'PiedraJardin': return <PlantillaDinamica nombre="JardinSedaTemplatePiedraJardin" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'TerracotaJardin': return <PlantillaDinamica nombre="JardinSedaTemplateTerracotaJardin" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Cielo': return <PlantillaDinamica nombre="JardinSedaTemplateCielo" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Durazno': return <PlantillaDinamica nombre="JardinSedaTemplateDurazno" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Lila': return <PlantillaDinamica nombre="JardinSedaTemplateLila" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'RosaAntiguo': return <PlantillaDinamica nombre="JardinSedaTemplateRosaAntiguo" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Salvia': return <PlantillaDinamica nombre="JardinSedaTemplateSalvia" invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <PlantillaDinamica nombre="JardinSedaTemplate" invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'HOLOGRAMA') {
            switch (color) {
                case 'NebulosaRoja': return <PlantillaDinamica nombre="HologramaTemplateNebulosaRoja" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'BlancoPrisma': return <PlantillaDinamica nombre="HologramaTemplateBlancoPrisma" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'GrafitoCuantico': return <PlantillaDinamica nombre="HologramaTemplateGrafitoCuantico" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Aurora': return <PlantillaDinamica nombre="HologramaTemplateAurora" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Azul': return <PlantillaDinamica nombre="HologramaTemplateAzul" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Coral': return <PlantillaDinamica nombre="HologramaTemplateCoral" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Dorado': return <PlantillaDinamica nombre="HologramaTemplateDorado" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Esmeralda': return <PlantillaDinamica nombre="HologramaTemplateEsmeralda" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Rosa': return <PlantillaDinamica nombre="HologramaTemplateRosa" invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <PlantillaDinamica nombre="HologramaTemplate" invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'CIRCUITO') {
            switch (color) {
                case 'Ambar': return <PlantillaDinamica nombre="CircuitoTemplateAmbar" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Azul': return <PlantillaDinamica nombre="CircuitoTemplateAzul" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Lima': return <PlantillaDinamica nombre="CircuitoTemplateLima" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Rojo': return <PlantillaDinamica nombre="CircuitoTemplateRojo" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Violeta': return <PlantillaDinamica nombre="CircuitoTemplateVioleta" invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <PlantillaDinamica nombre="CircuitoTemplate" invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'CRISTAL3D') {
            switch (color) {
                case 'Ambar': return <PlantillaDinamica nombre="Cristal3DTemplateAmbar" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Esmeralda': return <PlantillaDinamica nombre="Cristal3DTemplateEsmeralda" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Menta': return <PlantillaDinamica nombre="Cristal3DTemplateMenta" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'RosaCuarzo': return <PlantillaDinamica nombre="Cristal3DTemplateRosaCuarzo" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'AmbarFundido': return <PlantillaDinamica nombre="Cristal3DTemplateAmbarFundido" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'CristalBlanco': return <PlantillaDinamica nombre="Cristal3DTemplateCristalBlanco" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'RosaCristalOscuro': return <PlantillaDinamica nombre="Cristal3DTemplateRosaCristalOscuro" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Violeta': return <PlantillaDinamica nombre="Cristal3DTemplateVioleta" invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <PlantillaDinamica nombre="Cristal3DTemplate" invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'CINE') {
            switch (color) {
                case 'BlancoYNegro': return <PlantillaDinamica nombre="CineTemplateBlancoYNegro" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'MedianocheDeCine': return <PlantillaDinamica nombre="CineTemplateMedianocheDeCine" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'OcreVintage': return <PlantillaDinamica nombre="CineTemplateOcreVintage" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Ambar': return <PlantillaDinamica nombre="CineTemplateAmbar" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Borgona': return <PlantillaDinamica nombre="CineTemplateBorgona" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Esmeralda': return <PlantillaDinamica nombre="CineTemplateEsmeralda" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Noir': return <PlantillaDinamica nombre="CineTemplateNoir" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Tecnicolor': return <PlantillaDinamica nombre="CineTemplateTecnicolor" invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <PlantillaDinamica nombre="CineTemplate" invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'NORDICO') {
            switch (color) {
                case 'CarbonNordico': return <PlantillaDinamica nombre="NordicoTemplateCarbonNordico" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Musgo': return <PlantillaDinamica nombre="NordicoTemplateMusgo" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'ArticoAzul': return <PlantillaDinamica nombre="NordicoTemplateArticoAzul" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Pizarra': return <PlantillaDinamica nombre="NordicoTemplatePizarra" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Bosque': return <PlantillaDinamica nombre="NordicoTemplateBosque" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Marino': return <PlantillaDinamica nombre="NordicoTemplateMarino" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Ocre': return <PlantillaDinamica nombre="NordicoTemplateOcre" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Terracota': return <PlantillaDinamica nombre="NordicoTemplateTerracota" invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <PlantillaDinamica nombre="NordicoTemplate" invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'RIVIERA') {
            switch (color) {
                case 'MedianocheRiviera': return <PlantillaDinamica nombre="RivieraTemplateMedianocheRiviera" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'PiedraGris': return <PlantillaDinamica nombre="RivieraTemplatePiedraGris" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'OcasoAzulejo': return <PlantillaDinamica nombre="RivieraTemplateOcasoAzulejo" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'LavandaCostera': return <PlantillaDinamica nombre="RivieraTemplateLavandaCostera" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Cal': return <PlantillaDinamica nombre="RivieraTemplateCal" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Azulejo': return <PlantillaDinamica nombre="RivieraTemplateAzulejo" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Coral': return <PlantillaDinamica nombre="RivieraTemplateCoral" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Ocre': return <PlantillaDinamica nombre="RivieraTemplateOcre" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Oliva': return <PlantillaDinamica nombre="RivieraTemplateOliva" invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <PlantillaDinamica nombre="RivieraTemplate" invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'GOLDENDUSK') {
            switch (color) {
                case 'NocheDorada': return <PlantillaDinamica nombre="GoldenDuskTemplateNocheDorada" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'PiedraCalida': return <PlantillaDinamica nombre="GoldenDuskTemplatePiedraCalida" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'NocheCiruela': return <PlantillaDinamica nombre="GoldenDuskTemplateNocheCiruela" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'BrumaAzul': return <PlantillaDinamica nombre="GoldenDuskTemplateBrumaAzul" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Ocaso': return <PlantillaDinamica nombre="GoldenDuskTemplateOcaso" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'AzulMedianoche': return <PlantillaDinamica nombre="GoldenDuskTemplateAzulMedianoche" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Borgona': return <PlantillaDinamica nombre="GoldenDuskTemplateBorgona" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'ChampagneDorado': return <PlantillaDinamica nombre="GoldenDuskTemplateChampagneDorado" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'RosaAntiguo': return <PlantillaDinamica nombre="GoldenDuskTemplateRosaAntiguo" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Salvia': return <PlantillaDinamica nombre="GoldenDuskTemplateSalvia" invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <PlantillaDinamica nombre="GoldenDuskTemplate" invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'SEDA') {
            switch (color) {
                case 'OnixSeda': return <PlantillaDinamica nombre="SedaTemplateOnixSeda" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Piedra': return <PlantillaDinamica nombre="SedaTemplatePiedra" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Ciruela': return <PlantillaDinamica nombre="SedaTemplateCiruela" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Esmeralda': return <PlantillaDinamica nombre="SedaTemplateEsmeralda" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Marfil': return <PlantillaDinamica nombre="SedaTemplateMarfil" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Nocturna': return <PlantillaDinamica nombre="SedaTemplateNocturna" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Perla': return <PlantillaDinamica nombre="SedaTemplatePerla" invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <PlantillaDinamica nombre="SedaTemplate" invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'PETALOS') {
            switch (color) {
                case 'Coral': return <PlantillaDinamica nombre="PetalosTemplateCoral" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Pastel': return <PlantillaDinamica nombre="PetalosTemplatePastel" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'RosaPastel': return <PlantillaDinamica nombre="PetalosTemplateRosaPastel" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'VinoVibrante': return <PlantillaDinamica nombre="PetalosTemplateVinoVibrante" invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <PlantillaDinamica nombre="PetalosTemplate" invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'LUZLUNA') {
            switch (color) {
                case 'MedianocheAzul': return <PlantillaDinamica nombre="LuzLunaTemplateMedianocheAzul" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'NocheEstrellada': return <PlantillaDinamica nombre="LuzLunaTemplateNocheEstrellada" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Perlada': return <PlantillaDinamica nombre="LuzLunaTemplatePerlada" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'PerlaSuave': return <PlantillaDinamica nombre="LuzLunaTemplatePerlaSuave" invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <PlantillaDinamica nombre="LuzLunaTemplate" invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'BONVOYAGE') {
            switch (color) {
                case 'NocheDeViaje': return <PlantillaDinamica nombre="BonVoyageTemplateNocheDeViaje" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'ArenaCalida': return <PlantillaDinamica nombre="BonVoyageTemplateArenaCalida" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'CoralTropical': return <PlantillaDinamica nombre="BonVoyageTemplateCoralTropical" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'MapaVintage': return <PlantillaDinamica nombre="BonVoyageTemplateMapaVintage" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Ivoire': return <PlantillaDinamica nombre="BonVoyageTemplateIvoire" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Coral': return <PlantillaDinamica nombre="BonVoyageTemplateCoral" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Esmeralda': return <PlantillaDinamica nombre="BonVoyageTemplateEsmeralda" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Lavanda': return <PlantillaDinamica nombre="BonVoyageTemplateLavanda" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Medianoche': return <PlantillaDinamica nombre="BonVoyageTemplateMedianoche" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Turquesa': return <PlantillaDinamica nombre="BonVoyageTemplateTurquesa" invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <PlantillaDinamica nombre="BonVoyageTemplate" invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'CORPORATE') {
            switch (color) {
                case 'Bordo': return <PlantillaDinamica nombre="CorporateTemplateBordo" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Claro': return <PlantillaDinamica nombre="CorporateTemplateClaro" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Verde': return <PlantillaDinamica nombre="CorporateTemplateVerde" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Violeta': return <PlantillaDinamica nombre="CorporateTemplateVioleta" invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <PlantillaDinamica nombre="CorporateTemplate" invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'GARDENPARTY') {
            switch (color) {
                case 'Amarillo': return <PlantillaDinamica nombre="GardenPartyTemplateAmarillo" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Lavanda': return <PlantillaDinamica nombre="GardenPartyTemplateLavanda" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Rosa': return <PlantillaDinamica nombre="GardenPartyTemplateRosa" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Vibrante': return <PlantillaDinamica nombre="GardenPartyTemplateVibrante" invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <PlantillaDinamica nombre="GardenPartyTemplate" invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'LOFTINDUSTRIAL') {
            switch (color) {
                case 'Acero': return <PlantillaDinamica nombre="LoftIndustrialTemplateAcero" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Claro': return <PlantillaDinamica nombre="LoftIndustrialTemplateClaro" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Cobre': return <PlantillaDinamica nombre="LoftIndustrialTemplateCobre" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Verde': return <PlantillaDinamica nombre="LoftIndustrialTemplateVerde" invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <PlantillaDinamica nombre="LoftIndustrialTemplate" invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation!.templateTipo === 'INFANTIL') {
            switch (color) {
                case 'Amarillo': return <PlantillaDinamica nombre="InfantilTemplateAmarillo" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Celeste': return <PlantillaDinamica nombre="InfantilTemplateCeleste" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Lavanda': return <PlantillaDinamica nombre="InfantilTemplateLavanda" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Menta': return <PlantillaDinamica nombre="InfantilTemplateMenta" invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <PlantillaDinamica nombre="InfantilTemplate" invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else {
            // Default to ELEGANT
            switch (color) {
                case 'Green': return <PlantillaDinamica nombre="ElegantTemplateGreen" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Red': return <PlantillaDinamica nombre="ElegantTemplateRed" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Blue': return <PlantillaDinamica nombre="ElegantTemplateBlue" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Orange': return <PlantillaDinamica nombre="ElegantTemplateOrange" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Violet': return <PlantillaDinamica nombre="ElegantTemplateViolet" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Gray': return <PlantillaDinamica nombre="ElegantTemplateGray" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'DarkYellow': return <PlantillaDinamica nombre="ElegantTemplateDarkYellow" invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Pink': return <PlantillaDinamica nombre="ElegantTemplatePink" invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <PlantillaDinamica nombre="ElegantTemplate" invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        }
    }

    // Usar el nuevo ConviteTemplate para todas las invitaciones
    return (
      <PlantillaDinamica
        nombre="ConviteTemplate"
        invitation={invitation as Record<string, unknown>}
        guest={null}
        isPersonalized={false}
      />
    );
  }

  const isFree = invitation.planTier === 'FREE';

  // Igual que en /invite: el plan se marca acá y una regla en globals.css
  // decide si el crédito al pie se ve (ver .credito-alta).
  // El idioma de la INVITACIÓN, que pisa al del anfitrión para todo este
  // subárbol. Esta ruta es el link público, el que más se abre: sin esto,
  // un convite de São Paulo se veía en el idioma que tuviera configurado
  // quien lo abriera, en vez del que eligió quien lo mandó.
  const idiomaInvitacion = esIdiomaValido(invitation.idioma)
    ? invitation.idioma
    : idiomaSegunPais(invitation.pais);

  return (
    <ProveedorIdioma idioma={idiomaInvitacion}>
      <ProveedorInvitacion datos={invitation}>
        <div data-invitado data-plan-tier={String(invitation.planTier ?? 'FREE')}>
          {isFree && <FreePlanBanner />}
          {isFree && <FreePlanBannerSpacer />}
          {renderTemplate()}
        </div>
      </ProveedorInvitacion>
    </ProveedorIdioma>
  );
}
