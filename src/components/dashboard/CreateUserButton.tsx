"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { UserPlus, Loader2, Mail, Lock, User } from "lucide-react";
import { adminCreateUser } from "@/app/actions/admin";
import { useToast } from "@/components/ui/Toast";

export function CreateUserButton() {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [planTier, setPlanTier] = useState<"FREE" | "PREMIUM">("FREE");
    const [isLoading, setIsLoading] = useState(false);
    const { showToast } = useToast();

    const reset = () => {
        setName("");
        setEmail("");
        setPassword("");
        setPlanTier("FREE");
    };

    const handleCreate = async () => {
        if (!name.trim() || !email.trim() || !password.trim()) {
            showToast("Nombre, email y contraseña son obligatorios", "error");
            return;
        }
        if (password.length < 6) {
            showToast("La contraseña debe tener al menos 6 caracteres", "error");
            return;
        }

        setIsLoading(true);
        try {
            const res = await adminCreateUser({ name, email, password, planTier });
            if (res.success) {
                showToast("Usuario creado correctamente", "success");
                setOpen(false);
                reset();
            } else {
                showToast(res.error || "Error al crear usuario", "error");
            }
        } catch {
            showToast("Error inesperado", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
            >
                <UserPlus className="w-4 h-4 mr-2" />
                Nuevo Usuario
            </Button>

            <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
                <DialogContent className="bg-black/90 border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>Dar de alta un usuario</DialogTitle>
                        <DialogDescription className="text-white/50">
                            Crea la cuenta manualmente, sin pasar por el registro público.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-white/70 flex items-center gap-2">
                                <User className="w-4 h-4" /> Nombre
                            </label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                                placeholder="Nombre del usuario"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-white/70 flex items-center gap-2">
                                <Mail className="w-4 h-4" /> Correo Electrónico
                            </label>
                            <Input
                                type="email"
                                name="admin-create-email"
                                autoComplete="off"
                                data-lpignore="true"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                                placeholder="usuario@email.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-white/70 flex items-center gap-2">
                                <Lock className="w-4 h-4" /> Contraseña
                            </label>
                            <Input
                                type="password"
                                name="admin-create-password"
                                autoComplete="new-password"
                                data-lpignore="true"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                                placeholder="Mínimo 6 caracteres"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-white/70">Plan inicial</label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPlanTier("FREE")}
                                    className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors ${planTier === "FREE" ? "bg-white/15 border-white/30 text-white" : "bg-white/5 border-white/10 text-white/50"}`}
                                >
                                    Gratis
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPlanTier("PREMIUM")}
                                    className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors ${planTier === "PREMIUM" ? "bg-yellow-500/20 border-yellow-500/40 text-yellow-400" : "bg-white/5 border-white/10 text-white/50"}`}
                                >
                                    Premium (1 crédito)
                                </button>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setOpen(false)} className="text-white/70">
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleCreate}
                            disabled={isLoading}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Crear Usuario
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
