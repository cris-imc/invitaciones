import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { ModernoTemplateLab } from "@/components/templates/ModernoTemplateLab";
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

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Lab Moderno · experimental", robots: { index: false, follow: false } };
}

// ── Página principal (LAB aislado — no linkeado desde la app) ──
export default async function DraftModernoLabPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    albumStyle?: string;
    heroBlur?: string;
    coverTint?: string;
    coverFx?: string;
    tintColor1?: string;
    tintColor2?: string;
  }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const rawInvitation = await getInvitation(slug);
  const invitation = await checkAndCleanupIfExpired(rawInvitation);

  if (!invitation) notFound();

  // Overrides sólo para el Lab -- no tocan la DB. La portada animada ahora
  // es automática según si la invitación tiene portadaImagenFondoDesktop
  // cargada (el recorte "desktop" del wizard, reciclado para esto -- ver
  // comentario en ModernoTemplateLab.tsx). heroBlur fuerza el estado en
  // invitaciones de prueba sin ese recorte. coverFx elige la familia de
  // efecto a comparar: enfoque (boda), shimmer/flash (XV delicado/alocado),
  // bounce (evento infantil/cumple), geometric (evento corporate, hoy sin
  // efecto extra a propósito). coverTint suma el tinte "tinta en agua"
  // arriba de cualquiera de ellos; tintColor1/2 (hex, ej. FF2E88) lo pisan
  // para probar la paleta de otra familia de plantilla.
  const invitationForLab: Record<string, unknown> = { ...invitation };
  if (query.albumStyle) invitationForLab.albumStyle = query.albumStyle;
  if (query.heroBlur) invitationForLab.portadaFondoDifuminadoHabilitado = query.heroBlur === "1";
  if (query.coverTint) invitationForLab.portadaCoverTint = query.coverTint;
  if (query.coverFx) invitationForLab.portadaCoverFx = query.coverFx;
  if (query.tintColor1) invitationForLab.portadaTintColor1 = `#${query.tintColor1.replace(/^#/, "")}`;
  if (query.tintColor2) invitationForLab.portadaTintColor2 = `#${query.tintColor2.replace(/^#/, "")}`;

  return <ModernoTemplateLab invitation={invitationForLab} />;
}
