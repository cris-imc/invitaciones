import { prisma } from "@/lib/db";
import { GuestManager } from "@/components/dashboard/guests/GuestManager";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function GuestManagementPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const invitation = await prisma.invitation.findUnique({
        where: { slug },
    });

    if (!invitation) return notFound();

    return (
        <div className="p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/invitaciones">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Gestión de Invitados</h1>
                    <p className="text-muted-foreground">
                        {invitation.nombreEvento}
                    </p>
                </div>
            </div>

            <GuestManager
                slug={slug}
                initialRsvpEnabled={invitation.rsvpEnabled ?? invitation.confirmacionHabilitada ?? true}
            />
        </div>
    );
}
