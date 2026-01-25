import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { InvitationContent } from "@/components/invitation/InvitationContent";

async function getInvitation(slug: string) {
    const invitation = await prisma.invitation.findUnique({
        where: { slug },
        include: {
            album: {
                include: {
                    fotos: {
                        where: { aprobada: true },
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
