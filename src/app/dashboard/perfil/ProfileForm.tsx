"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateUserProfile, updateUserPhone } from "@/app/actions/user";
import { useToast } from "@/components/ui/Toast";
import { User, Mail, Phone, Loader2 } from "lucide-react";
import { normalizeDigits } from "@/lib/phone";

export function ProfileForm({
    initialName,
    email,
    initialPhoneAreaCode,
    initialPhoneNumber,
}: {
    initialName: string;
    email: string;
    initialPhoneAreaCode: string;
    initialPhoneNumber: string;
}) {
    const { update } = useSession();
    const [name, setName] = useState(initialName);
    const [phoneAreaCode, setPhoneAreaCode] = useState(initialPhoneAreaCode);
    const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
    const [isLoading, setIsLoading] = useState(false);
    const { showToast } = useToast();

    const isDirty =
        name !== initialName || phoneAreaCode !== initialPhoneAreaCode || phoneNumber !== initialPhoneNumber;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            showToast("El nombre no puede estar vacío", "error");
            return;
        }

        setIsLoading(true);
        try {
            if (name !== initialName) {
                const res = await updateUserProfile(name);
                if (!res.success) {
                    showToast(res.error || "Error al actualizar el perfil", "error");
                    setIsLoading(false);
                    return;
                }
            }

            if (phoneAreaCode !== initialPhoneAreaCode || phoneNumber !== initialPhoneNumber) {
                const res = await updateUserPhone(phoneAreaCode, phoneNumber);
                if (!res.success) {
                    showToast(res.error || "Error al actualizar el teléfono", "error");
                    setIsLoading(false);
                    return;
                }
                await update({ hasPhone: true });
            }

            showToast("Perfil actualizado correctamente", "success");
        } catch (error) {
            showToast("Ocurrió un error inesperado", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                        <User className="w-4 h-4 opacity-50" />
                        Nombre Completo
                    </label>
                    <Input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-12 bg-black/40 border-white/10 text-white rounded-xl focus-visible:ring-indigo-500"
                        placeholder="Tu nombre"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                        <Mail className="w-4 h-4 opacity-50" />
                        Correo Electrónico
                    </label>
                    <Input
                        type="email"
                        value={email}
                        disabled
                        className="h-12 bg-black/20 border-white/5 text-white/50 rounded-xl cursor-not-allowed"
                    />
                    <p className="text-xs text-white/40 mt-1">El correo electrónico no puede ser modificado por seguridad.</p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                        <Phone className="w-4 h-4 opacity-50" />
                        Teléfono
                    </label>
                    <div className="grid grid-cols-[100px_1fr] gap-2">
                        <Input
                            type="tel"
                            inputMode="numeric"
                            placeholder="Cód. área"
                            maxLength={4}
                            value={phoneAreaCode}
                            onChange={(e) => setPhoneAreaCode(normalizeDigits(e.target.value))}
                            className="h-12 bg-black/40 border-white/10 text-white rounded-xl focus-visible:ring-indigo-500"
                        />
                        <Input
                            type="tel"
                            inputMode="numeric"
                            placeholder="Número"
                            maxLength={8}
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(normalizeDigits(e.target.value))}
                            className="h-12 bg-black/40 border-white/10 text-white rounded-xl focus-visible:ring-indigo-500"
                        />
                    </div>
                    <p className="text-xs text-white/40 mt-1">
                        Código de área sin el 0 (ej. 351) y número sin el 15 (ej. 5551234)
                    </p>
                </div>
            </div>

            <Button
                type="submit"
                disabled={isLoading || !isDirty}
                className="w-full sm:w-auto h-12 px-8 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors"
            >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Guardar Cambios"}
            </Button>
        </form>
    );
}
