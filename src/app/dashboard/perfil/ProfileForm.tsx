"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateUserProfile, updateUserPhone } from "@/app/actions/user";
import { useToast } from "@/components/ui/Toast";
import { User, Mail, Phone, Loader2 } from "lucide-react";
import { normalizeDigits } from "@/lib/phone";
import { useTextos } from "@/components/i18n/ProveedorIdioma";

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
    const t = useTextos();
    const [name, setName] = useState(initialName);
    const [phoneAreaCode, setPhoneAreaCode] = useState(initialPhoneAreaCode);
    const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
    const [isLoading, setIsLoading] = useState(false);
    const { showToast } = useToast();

    const isDirty =
        name !== initialName ||
        phoneAreaCode !== initialPhoneAreaCode ||
        phoneNumber !== initialPhoneNumber;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            showToast(t("panel.perfil.nombreVacio"), "error");
            return;
        }

        setIsLoading(true);
        try {
            if (name !== initialName) {
                const res = await updateUserProfile(name);
                if (!res.success) {
                    showToast(res.error || t("panel.perfil.errorPerfil"), "error");
                    setIsLoading(false);
                    return;
                }
            }

            if (phoneAreaCode !== initialPhoneAreaCode || phoneNumber !== initialPhoneNumber) {
                const res = await updateUserPhone(phoneAreaCode, phoneNumber);
                if (!res.success) {
                    showToast(res.error || t("panel.perfil.errorTelefono"), "error");
                    setIsLoading(false);
                    return;
                }
                await update({ hasPhone: true });
            }

            showToast(t("panel.perfil.guardado"), "success");
        } catch (error) {
            showToast(t("panel.perfil.errorInesperado"), "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--shell-fg-strong)] flex items-center gap-2">
                        <User className="w-4 h-4 opacity-50" />
                        {t("panel.perfil.nombreCompleto")}
                    </label>
                    <Input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-12 bg-[var(--tinte-1)] border-[var(--campo-borde)] text-[var(--foreground)] rounded-xl focus-visible:ring-indigo-500"
                        placeholder={t("panel.perfil.tuNombre")}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--shell-fg-strong)] flex items-center gap-2">
                        <Mail className="w-4 h-4 opacity-50" />
                        {t("panel.perfil.correo")}
                    </label>
                    <Input
                        type="email"
                        value={email}
                        disabled
                        className="h-12 bg-[var(--tinte-1)] border-[var(--campo-borde-suave)] text-[var(--shell-fg-soft)] rounded-xl cursor-not-allowed"
                    />
                    <p className="text-xs text-[var(--shell-fg-soft)] mt-1">{t("panel.perfil.correoNota")}</p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--shell-fg-strong)] flex items-center gap-2">
                        <Phone className="w-4 h-4 opacity-50" />
                        {t("panel.perfil.telefono")}
                    </label>
                    <div className="grid grid-cols-[100px_1fr] gap-2">
                        <Input
                            type="tel"
                            inputMode="numeric"
                            placeholder={t("panel.perfil.codigoArea")}
                            maxLength={4}
                            value={phoneAreaCode}
                            onChange={(e) => setPhoneAreaCode(normalizeDigits(e.target.value))}
                            className="h-12 bg-[var(--tinte-1)] border-[var(--campo-borde)] text-[var(--foreground)] rounded-xl focus-visible:ring-indigo-500"
                        />
                        <Input
                            type="tel"
                            inputMode="numeric"
                            placeholder={t("panel.perfil.numero")}
                            maxLength={8}
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(normalizeDigits(e.target.value))}
                            className="h-12 bg-[var(--tinte-1)] border-[var(--campo-borde)] text-[var(--foreground)] rounded-xl focus-visible:ring-indigo-500"
                        />
                    </div>
                    <p className="text-xs text-[var(--shell-fg-soft)] mt-1">
                        {t("panel.perfil.telefonoNota")}
                    </p>
                </div>
            </div>

            <Button
                type="submit"
                disabled={isLoading || !isDirty}
                className="w-full sm:w-auto h-12 px-8 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors"
            >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t("panel.perfil.guardarCambios")}
            </Button>
        </form>
    );
}
