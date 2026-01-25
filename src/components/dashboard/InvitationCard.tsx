"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { MoreHorizontal, Calendar, MapPin, Pencil, Trash2, Users } from "lucide-react";
import { useRouter } from "next/navigation";

interface InvitationCardProps {
    invitation: {
        id: string;
        nombreEvento: string;
        tipo: string;
        estado: string;
        fechaEvento: Date;
        lugarNombre: string | null;
        slug: string;
        nombreNovia?: string | null;
        nombreNovio?: string | null;
        nombreQuinceanera?: string | null;
        _count: {
            guests: number;
        };
    };
}

export function InvitationCard({ invitation }: InvitationCardProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const router = useRouter();

    const getDisplayTitle = () => {
        const getFirstName = (fullName: string | null | undefined) => {
            if (!fullName) return '';
            return fullName.trim();
        };

        // Para casamientos: mostrar nombres de novios
        if (invitation.tipo === 'CASAMIENTO' && invitation.nombreNovia && invitation.nombreNovio) {
            return `${getFirstName(invitation.nombreNovia)} & ${getFirstName(invitation.nombreNovio)}`;
        }

        // Para otros eventos: mostrar nombre del festejado si existe
        if (invitation.nombreQuinceanera) {
            return getFirstName(invitation.nombreQuinceanera);
        }

        // Si no hay nombres específicos, mostrar el título del evento
        return invitation.nombreEvento;
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/invitations?slug=${invitation.slug}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Error al eliminar');

            // Refrescar la página para mostrar los cambios
            router.refresh();
            setShowDeleteDialog(false);
        } catch (error) {
            console.error('Error deleting invitation:', error);
            alert('Error al eliminar la invitación');
            setIsDeleting(false);
        }
    };

    return (
        <>
            <Card className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-48 h-32 md:h-auto bg-muted flex items-center justify-center text-muted-foreground">
                        <span className="text-sm">Preview</span>
                    </div>
                    <div className="flex-1">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${invitation.estado === 'ACTIVA'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {invitation.estado}
                                        </span>
                                        <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-secondary">
                                            {invitation.tipo}
                                        </span>
                                    </div>
                                    <CardTitle className="text-xl">{getDisplayTitle()}</CardTitle>
                                </div>
                            </div>
                            <CardDescription className="flex flex-col sm:flex-row gap-4 mt-2">
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(invitation.fechaEvento).toLocaleDateString('es-AR', {
                                        day: 'numeric', month: 'long', year: 'numeric'
                                    })}
                                </div>
                                {invitation.lugarNombre && (
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4" />
                                        {invitation.lugarNombre}
                                    </div>
                                )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-6">
                            <div className="flex gap-4">
                                <div className="flex flex-col">
                                    <span className="text-2xl font-bold">{invitation._count?.guests || 0}</span>
                                    <span className="text-xs text-muted-foreground">Confirmados</span>
                                </div>
                                <div className="w-px h-10 bg-secondary" />
                                <div className="flex gap-2 items-center flex-wrap">
                                    <Link href={`/invitation/${invitation.slug}`}>
                                        <Button variant="outline" size="sm" className="h-9">
                                            Ver Invitación
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="default"
                                        size="sm"
                                        className="h-9 gap-2"
                                        onClick={() => router.push(`/dashboard/invitaciones/editar/${invitation.id}`)}
                                    >
                                        <Pencil className="w-3 h-3" />
                                        Editar
                                    </Button>
                                    <Link href={`/dashboard/invitaciones/${invitation.id}/guests`}>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="h-9 gap-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                                        >
                                            <Users className="w-3 h-3" />
                                            Invitados
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="h-9 gap-2"
                                        onClick={() => setShowDeleteDialog(true)}
                                    >
                                        <Trash2 className="w-3 h-3" />
                                        Eliminar
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </div>
                </div>
            </Card>

            {/* Dialog de confirmación */}
            {showDeleteDialog && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-background rounded-lg shadow-lg max-w-md w-full p-6 space-y-4">
                        <div className="space-y-2">
                            <h2 className="text-xl font-semibold">¿Eliminar invitación?</h2>
                            <p className="text-muted-foreground">
                                Esta acción no se puede deshacer. Se eliminará permanentemente la invitación
                                <span className="font-semibold"> "{invitation.nombreEvento}"</span> y todos los datos asociados.
                            </p>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <Button
                                variant="outline"
                                onClick={() => setShowDeleteDialog(false)}
                                disabled={isDeleting}
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Eliminando...' : 'Eliminar'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
