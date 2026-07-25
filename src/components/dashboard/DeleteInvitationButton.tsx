"use client";

import { useState, useTransition } from "react";
import { deleteInvitation } from "@/app/actions/invitation";
import { useToast } from "@/components/ui/Toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function DeleteInvitationButton({ invitationId }: { invitationId: string }) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const { showToast } = useToast();

    const handleDelete = () => {
        startTransition(async () => {
            const res = await deleteInvitation(invitationId);
            if (res.success) {
                showToast("Invitación eliminada correctamente", "success");
                setOpen(false);
            } else {
                showToast(res.error || "Error al eliminar la invitación", "error");
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button 
                    type="button" 
                    className="text-sm font-semibold text-red-500 hover:text-red-400 hover:underline opacity-80 hover:opacity-100 px-2 py-1"
                    title="Eliminar invitación"
                >
                    Eliminar
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Eliminar Invitación</DialogTitle>
                    <DialogDescription className="pt-2">
                        ¿Estás seguro de que querés eliminar esta invitación? 
                        Esta acción no se puede deshacer y se perderán todos los datos asociados (RSVP, Álbum, etc).
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-6 flex gap-2 sm:justify-end">
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
                        Cancelar
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
                        {isPending ? "Eliminando..." : "Sí, eliminar"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
