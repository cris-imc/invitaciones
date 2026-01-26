import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ModernInvitationTemplate } from "@/components/templates/ModernInvitationTemplate";

export default async function PreviewPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const invitation = await prisma.invitation.findUnique({
        where: { slug },
    });

    if (!invitation) {
        notFound();
    }

    return <ModernInvitationTemplate invitation={invitation} />;
}
