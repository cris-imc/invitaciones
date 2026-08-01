"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Coins, Loader2, Lock } from "lucide-react";
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
    currentAmount,
    currentPrecioAdolescente,
    currentPrecioNino,
    planTier
}: { 
    invitationId: string, 
    slug: string,
    currentAmount: number | null,
    currentPrecioAdolescente?: number | null,
    currentPrecioNino?: number | null,
    planTier?: string
}) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [amount, setAmount] = useState(currentAmount ? currentAmount.toString() : "");
    const [precioAdolescente, setPrecioAdolescente] = useState(currentPrecioAdolescente ? currentPrecioAdolescente.toString() : "");
    const [precioNino, setPrecioNino] = useState(currentPrecioNino ? currentPrecioNino.toString() : "");

    const handleSave = async () => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount < 0) {
            alert("Por favor ingresa un monto válido para adultos.");
            return;
        }

        const numPrecioAdolescente = precioAdolescente ? parseFloat(precioAdolescente) : undefined;
        if (precioAdolescente && (isNaN(numPrecioAdolescente!) || numPrecioAdolescente! < 0)) {
            alert("Por favor ingresa un monto válido para adolescentes.");
            return;
        }

        const numPrecioNino = precioNino ? parseFloat(precioNino) : undefined;
        if (precioNino && (isNaN(numPrecioNino!) || numPrecioNino! < 0)) {
            alert("Por favor ingresa un monto válido para niños.");
            return;
        }

        try {
            setIsSaving(true);
            const response = await fetch(`/api/invitations/${slug}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    regaloMonto: numAmount,
                    precioAdolescente: numPrecioAdolescente,
                    precioNino: numPrecioNino,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Error al actualizar los precios');
            }

            setOpen(false);
            router.refresh();
        } catch (error) {
            console.error('Error:', error);
            alert(error instanceof Error ? error.message : 'Error al actualizar los precios');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 border-[var(--ink-2)] text-[var(--on-ink)] hover:bg-[var(--ink-2)] bg-transparent w-full sm:w-auto mt-2 sm:mt-0" onClick={(e) => e.stopPropagation()}>
                    <Coins className="w-4 h-4 text-green-500" />
                    Actualizar Precios
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-[var(--ink-2)] text-[var(--on-ink)] border-none" onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Coins className="w-5 h-5 text-green-500" />
                        Actualizar Valores de Tarjeta
                    </DialogTitle>
                    <DialogDescription className="text-[var(--on-ink)]/70 pt-2">
                        Modificá rápidamente los montos por categoría que deben abonar tus invitados.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="my-4 space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-2 block text-[var(--on-ink)]/80">Valor Adulto ($):</label>
                        <Input 
                            type="number" 
                            min="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="bg-[var(--ink)] border-none text-[var(--on-ink)]"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-2 block text-[var(--on-ink)]/80">Valor Adolescente ($):</label>
                        <Input 
                            type="number" 
                            min="0"
                            placeholder="Opcional"
                            value={precioAdolescente}
                            onChange={(e) => setPrecioAdolescente(e.target.value)}
                            className="bg-[var(--ink)] border-none text-[var(--on-ink)]"
                        />
                    </div>
                    <div className="relative group">
                        <label className="text-sm font-medium mb-2 flex items-center gap-2 text-[var(--on-ink)]/80">
                            Valor Niño ($):
                            {planTier !== 'PREMIUM' && <Lock className="w-3.5 h-3.5 text-red-400" />}
                        </label>
                        <Input 
                            type="number" 
                            min="0"
                            placeholder="Opcional"
                            value={precioNino}
                            onChange={(e) => setPrecioNino(e.target.value)}
                            disabled={planTier !== 'PREMIUM'}
                            className="bg-[var(--ink)] border-none text-[var(--on-ink)] disabled:opacity-50"
                        />
                        {planTier !== 'PREMIUM' && (
                            <div className="absolute -top-10 left-16 px-3 py-1.5 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                              Disponible en Premium
                              <div className="absolute -bottom-1 left-4 border-4 border-transparent border-t-black"></div>
                            </div>
                        )}
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
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Actualizando...
                            </>
                        ) : (
                            'Guardar Precios'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
