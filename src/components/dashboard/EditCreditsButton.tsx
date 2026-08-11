"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Coins, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export function EditCreditsButton({
    userId,
    currentCredits,
    currentDiamondCredits = 0,
}: {
    userId: string;
    currentCredits: number;
    currentDiamondCredits?: number;
}) {
    const [open, setOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [credits, setCredits] = useState(currentCredits.toString());
    const [diamondCredits, setDiamondCredits] = useState(currentDiamondCredits.toString());
    const router = useRouter();

    const handleSave = async () => {
        const numCredits = parseInt(credits, 10);
        const numDiamondCredits = parseInt(diamondCredits, 10);
        if (isNaN(numCredits) || numCredits < 0 || isNaN(numDiamondCredits) || numDiamondCredits < 0) {
            alert("Por favor ingresa números válidos de créditos (0 o más).");
            return;
        }

        try {
            setIsSaving(true);
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ premiumCredits: numCredits, diamondCredits: numDiamondCredits }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Error al actualizar los créditos');
            }

            setOpen(false);
            router.refresh();
        } catch (error) {
            console.error('Error:', error);
            alert(error instanceof Error ? error.message : 'Error al actualizar los créditos');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 border-[var(--ink-2)] text-[var(--on-ink)] hover:bg-[var(--ink-2)]">
                    <Coins className="w-4 h-4 text-yellow-500" />
                    P: {currentCredits} / D: {currentDiamondCredits}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-[var(--ink-2)] text-[var(--on-ink)] border-none">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Coins className="w-5 h-5 text-yellow-500" />
                        Editar Créditos
                    </DialogTitle>
                    <DialogDescription className="text-[var(--on-ink)]/70 pt-2">
                        Ajusta la cantidad de créditos disponibles para este usuario.
                    </DialogDescription>
                </DialogHeader>

                <div className="my-4 space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-2 block text-[var(--on-ink)]/80">Créditos premium:</label>
                        <Input
                            type="number"
                            min="0"
                            value={credits}
                            onChange={(e) => setCredits(e.target.value)}
                            className="bg-[var(--ink)] border-none text-[var(--on-ink)]"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-2 block text-[var(--on-ink)]/80">Créditos diamond:</label>
                        <Input
                            type="number"
                            min="0"
                            value={diamondCredits}
                            onChange={(e) => setDiamondCredits(e.target.value)}
                            className="bg-[var(--ink)] border-none text-[var(--on-ink)]"
                        />
                    </div>
                </div>

                <DialogFooter className="flex gap-2 sm:justify-end mt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={isSaving}
                        className="bg-transparent border-[var(--on-ink)]/20 text-[var(--on-ink)] hover:bg-[var(--on-ink)]/10"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-yellow-500 hover:bg-yellow-600 text-[var(--ink)]"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            'Guardar Cambios'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
