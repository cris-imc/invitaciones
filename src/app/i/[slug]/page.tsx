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
import { ModernoTemplateAzul } from "@/components/templates/ModernoTemplateAzul";
import { ModernoTemplateBordo } from "@/components/templates/ModernoTemplateBordo";
import { ModernoTemplateNegro } from "@/components/templates/ModernoTemplateNegro";
import { ModernoTemplatePurpura } from "@/components/templates/ModernoTemplatePurpura";
import { ModernoTemplateVerde } from "@/components/templates/ModernoTemplateVerde";
import { ModernoTemplateRojo } from "@/components/templates/ModernoTemplateRojo";
import { ModernoTemplateGris } from "@/components/templates/ModernoTemplateGris";
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

        if (invitation!.templateTipo === 'MODERNO') {
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
