"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export function DeleteUserButton({ userId, userName }: { userId: string, userName: string }) {
    const [open, setOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Error al eliminar el usuario');
            }

            setOpen(false);
            router.refresh();
        } catch (error) {
            console.error('Error:', error);
            alert(error instanceof Error ? error.message : 'Error al eliminar el usuario');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive" size="sm" className="gap-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border-none">
                    <Trash2 className="w-4 h-4" />
                    Eliminar Cuenta
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md border-red-500/20 bg-[var(--ink-2)] text-[var(--on-ink)]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-500">
                        <AlertTriangle className="w-5 h-5" />
                        Eliminar Cuenta Definitivamente
                    </DialogTitle>
                    <DialogDescription className="text-[var(--on-ink)]/70 pt-2">
                        ¿Estás seguro que deseas eliminar la cuenta de <strong>{userName}</strong>?
                    </DialogDescription>
                </DialogHeader>
                
                <div className="bg-red-500/10 text-red-500 p-3 rounded-lg text-sm border border-red-500/20 my-2">
                    <p className="font-bold mb-1">¡Advertencia crítica!</p>
                    <p>
                        Esta acción es irreversible. Se eliminarán permanentemente:
                    </p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                        <li>La cuenta del usuario y sus accesos.</li>
                        <li>Todas sus invitaciones.</li>
                        <li>Todos los invitados y respuestas RSVP.</li>
                        <li>Todas las fotos subidas a sus álbumes.</li>
                    </ul>
                </div>

                <DialogFooter className="flex gap-2 sm:justify-end mt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={isDeleting}
                        className="bg-transparent border-[var(--on-ink)]/20 text-[var(--on-ink)] hover:bg-[var(--on-ink)]/10"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Eliminando...
                            </>
                        ) : (
                            'Sí, eliminar cuenta'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
