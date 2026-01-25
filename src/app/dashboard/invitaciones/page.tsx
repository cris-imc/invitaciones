import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Plus, Calendar } from "lucide-react";
import { prisma } from "@/lib/db";
import { InvitationCard } from "@/components/dashboard/InvitationCard";

async function getInvitations() {
    // TODO: Obtener userId de la sesión cuando tengamos auth
    const userId = "mock-user-id";
    
    const invitations = await prisma.invitation.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: {
                    rsvps: {
                        where: {
                            asistencia: 'CONFIRMA'
                        }
                    }
                }
            }
        }
    });
    
    return invitations;
}

export default async function InvitacionesPage() {
    const invitations = await getInvitations();
    return (
        <div className="p-6 md:p-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Mis Invitaciones</h1>
                    <p className="text-muted-foreground">Gestiona tus eventos y monitorea las confirmaciones.</p>
                </div>
                <Link href="/dashboard/invitaciones/crear">
                    <Button className="gap-2">
                        <Plus className="w-4 h-4" /> Nueva Invitación
                    </Button>
                </Link>
            </div>

            <div className="grid gap-6">
                {invitations.length > 0 ? (
                    invitations.map((invitation) => (
                        <InvitationCard key={invitation.id} invitation={invitation} />
                    ))
                ) : (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-10 space-y-4">
                            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-lg font-semibold">No tienes invitaciones</h3>
                                <p className="text-muted-foreground">Comienza creando tu primera invitación para un evento.</p>
                            </div>
                            <Link href="/dashboard/invitaciones/crear">
                                <Button>Crear Primera Invitación</Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
