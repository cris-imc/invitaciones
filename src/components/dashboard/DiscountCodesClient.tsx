"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tag, Loader2 } from "lucide-react";
import { adminCreateDiscountCode, toggleDiscountCode } from "@/app/actions/admin";
import { useToast } from "@/components/ui/Toast";

interface DiscountCodeRow {
    id: string;
    code: string;
    percentage: number;
    enabled: boolean;
    createdAt: string;
    usedCount: number;
}

export function DiscountCodesClient({ codes }: { codes: DiscountCodeRow[] }) {
    const [rows, setRows] = useState(codes);
    const [open, setOpen] = useState(false);
    const [code, setCode] = useState("");
    const [percentage, setPercentage] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const { showToast } = useToast();

    const reset = () => {
        setCode("");
        setPercentage("");
    };

    const handleCreate = async () => {
        const percentageNum = Number(percentage);
        if (!code.trim()) {
            showToast("Ingresá un código", "error");
            return;
        }
        if (!Number.isInteger(percentageNum) || percentageNum < 1 || percentageNum > 100) {
            showToast("El porcentaje debe ser un número entero entre 1 y 100", "error");
            return;
        }

        setIsCreating(true);
        try {
            const res = await adminCreateDiscountCode({ code, percentage: percentageNum });
            if (res.success) {
                showToast("Código creado", "success");
                setOpen(false);
                reset();
                // La revalidación del server action refresca la ruta, pero como
                // esta lista vive en useState (mismo patrón que
                // AdminDashboardClient), se actualiza acá también para que se
                // vea al toque sin esperar la navegación.
                setRows((prev) => [
                    { id: crypto.randomUUID(), code: code.trim().toUpperCase(), percentage: percentageNum, enabled: true, createdAt: new Date().toISOString(), usedCount: 0 },
                    ...prev,
                ]);
            } else {
                showToast(res.error || "Error al crear el código", "error");
            }
        } catch {
            showToast("Error inesperado", "error");
        } finally {
            setIsCreating(false);
        }
    };

    const handleToggle = async (row: DiscountCodeRow) => {
        setTogglingId(row.id);
        try {
            const res = await toggleDiscountCode(row.id, row.enabled);
            if (res.success) {
                setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, enabled: res.newEnabled! } : r)));
            } else {
                showToast(res.error || "Error al actualizar el código", "error");
            }
        } catch {
            showToast("Error inesperado", "error");
        } finally {
            setTogglingId(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button onClick={() => setOpen(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                    <Tag className="w-4 h-4 mr-2" />
                    Crear código
                </Button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-white/50 border-b border-white/10">
                            <th className="py-2.5 px-4 font-medium">Código</th>
                            <th className="py-2.5 px-4 font-medium">Descuento</th>
                            <th className="py-2.5 px-4 font-medium">Usos</th>
                            <th className="py-2.5 px-4 font-medium">Creado</th>
                            <th className="py-2.5 px-4 font-medium">Estado</th>
                            <th className="py-2.5 px-4 font-medium"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length === 0 && (
                            <tr>
                                <td colSpan={6} className="py-6 px-4 text-center text-white/40">
                                    Todavía no creaste ningún código.
                                </td>
                            </tr>
                        )}
                        {rows.map((row) => (
                            <tr key={row.id} className="border-b border-white/5 last:border-0">
                                <td className="py-2.5 px-4 font-mono">{row.code}</td>
                                <td className="py-2.5 px-4">{row.percentage}% OFF</td>
                                <td className="py-2.5 px-4">{row.usedCount}</td>
                                <td className="py-2.5 px-4 font-mono text-xs opacity-70 whitespace-nowrap">
                                    {new Date(row.createdAt).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })}
                                </td>
                                <td className="py-2.5 px-4">
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${row.enabled ? "bg-green-500/15 text-green-400" : "bg-white/10 text-white/40"}`}>
                                        {row.enabled ? "Habilitado" : "Deshabilitado"}
                                    </span>
                                </td>
                                <td className="py-2.5 px-4 text-right">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        disabled={togglingId === row.id}
                                        onClick={() => handleToggle(row)}
                                        className="text-white/70 hover:text-white"
                                    >
                                        {togglingId === row.id ? <Loader2 className="w-4 h-4 animate-spin" /> : row.enabled ? "Deshabilitar" : "Habilitar"}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
                <DialogContent className="bg-black/90 border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>Crear código de descuento</DialogTitle>
                        <DialogDescription className="text-white/50">
                            El % se aplica extra sobre el precio de Premium/Diamond que el cliente ya vería.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-white/70">Código</label>
                            <Input
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 uppercase"
                                placeholder="Ej: PROMO30"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-white/70">Porcentaje de descuento</label>
                            <Input
                                type="number"
                                min={1}
                                max={100}
                                value={percentage}
                                onChange={(e) => setPercentage(e.target.value)}
                                className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                                placeholder="Ej: 30"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setOpen(false)} className="text-white/70">
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleCreate}
                            disabled={isCreating}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white"
                        >
                            {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Crear código
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
