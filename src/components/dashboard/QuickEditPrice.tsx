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

export function QuickEditPrice({ 
    invitationId, 
    slug,
    currentAmount
}: { 
    invitationId: string, 
    slug: string,
    currentAmount: number | null
}) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [amount, setAmount] = useState(currentAmount ? currentAmount.toString() : "");

    const handleSave = async () => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount < 0) {
            alert("Por favor ingresa un monto válido.");
            return;
        }

        try {
            setIsSaving(true);
            const response = await fetch(`/api/invitations/${slug}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ regaloMonto: numAmount }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Error al actualizar el precio');
            }

            setOpen(false);
            router.refresh(); // Refresca los datos del servidor (como el Server Component)
        } catch (error) {
            console.error('Error:', error);
            alert(error instanceof Error ? error.message : 'Error al actualizar el precio');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 border-[var(--ink-2)] text-[var(--on-ink)] hover:bg-[var(--ink-2)] bg-transparent w-full sm:w-auto mt-2 sm:mt-0" onClick={(e) => e.stopPropagation()}>
                    <Coins className="w-4 h-4 text-green-500" />
                    Actualizar Precio
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-[var(--ink-2)] text-[var(--on-ink)] border-none" onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Coins className="w-5 h-5 text-green-500" />
                        Actualizar Valor de Tarjeta
                    </DialogTitle>
                    <DialogDescription className="text-[var(--on-ink)]/70 pt-2">
                        Modifica rápidamente el monto que deben abonar tus invitados. Al cambiarlo, se activará un aviso de actualización en la invitación.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="my-4">
                    <label className="text-sm font-medium mb-2 block text-[var(--on-ink)]/80">Nuevo monto ($):</label>
                    <Input 
                        type="number" 
                        min="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="bg-[var(--ink)] border-none text-[var(--on-ink)]"
                    />
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
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Actualizando...
                            </>
                        ) : (
                            'Guardar Precio'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
