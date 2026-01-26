import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { InvitationContent } from "@/components/invitation/InvitationContent";
import { Metadata } from 'next';

// Generate metadata for social sharing
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const invitation = await prisma.invitation.findUnique({ where: { slug } });

    if (!invitation) return { title: 'Invitación no encontrada' };

    return {
        title: invitation.nombreEvento,
        description: `Estás invitado a ${invitation.nombreEvento}`,
    };
}

export default async function PersonalizedInvitationPage({ params }: { params: Promise<{ slug: string; token: string }> }) {
    const { slug, token } = await params;

    // 1. Verify invitation existence
    const invitation = await prisma.invitation.findUnique({
        where: { slug },
    });

    if (!invitation) return notFound();

    // 2. Validate Token and Guest
    const guest = await prisma.guest.findUnique({
        where: { uniqueToken: token },
    });

    // Security check: Ensure token matches the invitation
    if (!guest || guest.invitationId !== invitation.id) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-2xl font-bold mb-2">Enlace no válido</h1>
                <p className="text-muted-foreground">
                    El enlace que utilizaste no parece ser correcto o ha expirado.
                    Por favor contacta a los organizadores.
                </p>
            </div>
        );
    }

    return (
        <InvitationContent
            invitation={invitation}
            guest={guest}
            isPersonalized={true}
        />
    );
}
