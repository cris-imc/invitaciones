import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { ConviteTemplate } from "@/components/templates/ConviteTemplate";

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
    return { title: "Invitación no encontrada · Convite" };
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
    title: `${eventTitle} · Convite`,
    description,
    openGraph: {
      title: eventTitle,
      description,
      type: "website",
      locale: "es_AR",
      siteName: "Convite",
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
  const invitation = await getInvitation(slug);

  if (!invitation) notFound();

  // Usar el nuevo ConviteTemplate para todas las invitaciones
  // Las invitaciones existentes con templates viejos se migran automáticamente
  return (
    <ConviteTemplate
      invitation={invitation as Record<string, unknown>}
      guest={null}
      isPersonalized={false}
    />
  );
}
