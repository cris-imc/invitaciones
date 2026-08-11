"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, Loader2 } from "lucide-react";
import { updateUserPhone } from "@/app/actions/user";
import { useToast } from "@/components/ui/Toast";
import { normalizeDigits } from "@/lib/phone";

export function PhoneReminderModal() {
    const { data: session, status, update } = useSession();
    const { showToast } = useToast();
    const [areaCode, setAreaCode] = useState("");
    const [number, setNumber] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    // Evita el parpadeo del modal mientras update() (async) todavía no
    // terminó de propagar phoneModalDismissed a la sesión.
    const [dismissedLocally, setDismissedLocally] = useState(false);

    const shouldShow =
        status === "authenticated" &&
        session?.user?.role === "CLIENT" &&
        !session.user.hasPhone &&
        !session.user.phoneModalDismissed &&
        !dismissedLocally;

    if (!shouldShow) return null;

    const handleDismiss = async () => {
        setDismissedLocally(true);
        await update({ phoneModalDismissed: true });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const res = await updateUserPhone(areaCode, number);
        if (res.success) {
            showToast("¡Gracias! Guardamos tu teléfono", "success");
            await update({ hasPhone: true });
        } else {
            showToast(res.error || "Error al guardar el teléfono", "error");
        }
        setIsSaving(false);
    };

    return (
        <Dialog open onOpenChange={(open) => { if (!open) handleDismiss(); }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Phone className="w-5 h-5 text-[var(--accent)]" />
                        Sumá tu teléfono
                    </DialogTitle>
                    <DialogDescription className="pt-2">
                        Nos falta tu número para poder contactarte si lo necesitás. Código de área sin el 0 (ej. 351) y número sin el 15 (ej. 5551234).
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                    <div className="grid grid-cols-[100px_1fr] gap-2">
                        <div>
                            <Label htmlFor="reminder-area-code" className="sr-only">Código de área</Label>
                            <Input
                                id="reminder-area-code"
                                type="tel"
                                inputMode="numeric"
                                placeholder="Cód. área"
                                maxLength={4}
                                value={areaCode}
                                onChange={(e) => setAreaCode(normalizeDigits(e.target.value))}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="reminder-number" className="sr-only">Número</Label>
                            <Input
                                id="reminder-number"
                                type="tel"
                                inputMode="numeric"
                                placeholder="Número"
                                maxLength={8}
                                value={number}
                                onChange={(e) => setNumber(normalizeDigits(e.target.value))}
                                required
                            />
                        </div>
                    </div>

                    <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-2">
                        <Button type="button" variant="outline" onClick={handleDismiss} className="w-full sm:w-auto" disabled={isSaving}>
                            Recordar más tarde
                        </Button>
                        <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
