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
import { checkAndCleanupIfExpired } from "@/lib/expiration-server";

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
          items: true,
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

  if (invitation.tipo === 'CASAMIENTO' || invitation.tipo === 'QUINCE_ANOS' || invitation.tipo === 'CUMPLEANOS') {
      const color = temaColoresObj.colorPrincipal || 'default';
      const invRecord = invitation as Record<string, unknown>;
      
      switch (color) {
          case 'Green': return <ElegantTemplateGreen invitation={invRecord} />;
          case 'Red': return <ElegantTemplateRed invitation={invRecord} />;
          case 'Blue': return <ElegantTemplateBlue invitation={invRecord} />;
          case 'Orange': return <ElegantTemplateOrange invitation={invRecord} />;
          case 'Violet': return <ElegantTemplateViolet invitation={invRecord} />;
          case 'Gray': return <ElegantTemplateGray invitation={invRecord} />;
          case 'DarkYellow': return <ElegantTemplateDarkYellow invitation={invRecord} />;
          case 'Pink': return <ElegantTemplatePink invitation={invRecord} />;
          default: return <ElegantTemplate invitation={invRecord} />;
      }
  }

  return <ConviteTemplate invitation={invitation as Record<string, unknown>} />;
}
