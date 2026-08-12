"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Settings, Loader2, Mail, Lock, User, Phone } from "lucide-react";
import { adminUpdateUser } from "@/app/actions/admin";
import { useToast } from "@/components/ui/Toast";
import { validatePassword, PASSWORD_MIN_LENGTH } from "@/lib/password";
import { normalizeDigits } from "@/lib/phone";

export function EditUserButton({ userId, initialName, initialEmail, initialPhoneAreaCode = "", initialPhoneNumber = "" }: { userId: string, initialName: string, initialEmail: string, initialPhoneAreaCode?: string, initialPhoneNumber?: string }) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState(initialName);
    const [email, setEmail] = useState(initialEmail);
    const [phoneAreaCode, setPhoneAreaCode] = useState(initialPhoneAreaCode);
    const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { showToast } = useToast();

    const handleUpdate = async () => {
        if (!name.trim() || !email.trim()) {
            showToast("Nombre y email son obligatorios", "error");
            return;
        }

        if (password.trim().length > 0) {
            const passwordError = validatePassword(password.trim());
            if (passwordError) {
                showToast(passwordError, "error");
                return;
            }
        }

        setIsLoading(true);
        try {
            const res = await adminUpdateUser(userId, { name, email, password, phoneAreaCode, phoneNumber });
            if (res.success) {
                showToast("Usuario actualizado correctamente", "success");
                setOpen(false);
                setPassword("");
            } else {
                showToast(res.error || "Error al actualizar usuario", "error");
            }
        } catch (error) {
            showToast("Error inesperado", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border-indigo-500/20"
                onClick={() => setOpen(true)}
            >
                <Settings className="w-4 h-4 mr-2" />
                Editar Perfil
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="bg-black/90 border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>Editar Usuario</DialogTitle>
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
                                name="admin-edit-email"
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
                                <Phone className="w-4 h-4" /> Teléfono
                            </label>
                            <div className="grid grid-cols-[100px_1fr] gap-2">
                                <Input
                                    type="tel"
                                    inputMode="numeric"
                                    placeholder="Cód. área"
                                    maxLength={4}
                                    value={phoneAreaCode}
                                    onChange={(e) => setPhoneAreaCode(normalizeDigits(e.target.value))}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                                />
                                <Input
                                    type="tel"
                                    inputMode="numeric"
                                    placeholder="Número"
                                    maxLength={8}
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(normalizeDigits(e.target.value))}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                                />
                            </div>
                            <p className="text-[10px] text-white/40">Código de área sin el 0 (ej. 351) y número sin el 15 (ej. 5551234). Dejar ambos vacíos para borrar el teléfono.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-white/70 flex items-center gap-2">
                                <Lock className="w-4 h-4" /> Nueva Contraseña
                            </label>
                            <PasswordInput
                                name="admin-edit-password"
                                autoComplete="new-password"
                                data-lpignore="true"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                                placeholder="Dejar en blanco para no cambiar"
                                minLength={PASSWORD_MIN_LENGTH}
                            />
                            <p className="text-[10px] text-white/40">Si ingresás una contraseña (mínimo 8 caracteres, con una mayúscula y un número), se sobreescribirá la actual y se le pedirá cambiarla al iniciar sesión.</p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setOpen(false)} className="text-white/70">
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleUpdate}
                            disabled={isLoading || (!name.trim() || !email.trim())}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Guardar Cambios
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
