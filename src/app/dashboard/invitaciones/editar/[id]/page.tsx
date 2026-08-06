import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { EditWizardContainer } from "@/components/dashboard/EditWizardContainer";
import { BackLink } from "@/components/ui/BackLink";

async function getInvitation(id: string) {
    const invitation = await prisma.invitation.findUnique({
        where: { id },
        include: {
            album: true,
        },
    });

    return invitation;
}

export default async function EditInvitationPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const invitation = await getInvitation(id);

    if (!invitation) {
        notFound();
    }

    return (
        <div className="p-6 md:p-8 space-y-8">
            <BackLink href="/dashboard" confirmIfDirty />
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Editar Invitación</h1>
                <p className="text-muted-foreground">
                    Modificá cualquier paso de tu invitación "{invitation.nombreEvento}".
                </p>
            </div>

            <EditWizardContainer invitation={invitation} />
        </div>
    );
}