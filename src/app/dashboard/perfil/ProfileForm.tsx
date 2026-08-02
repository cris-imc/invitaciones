"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateUserProfile } from "@/app/actions/user";
import { useToast } from "@/components/ui/Toast";
import { User, Mail, Loader2 } from "lucide-react";

export function ProfileForm({ initialName, email }: { initialName: string, email: string }) {
    const [name, setName] = useState(initialName);
    const [isLoading, setIsLoading] = useState(false);
    const { showToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            showToast("El nombre no puede estar vacío", "error");
            return;
        }

        setIsLoading(true);
        try {
            const res = await updateUserProfile(name);
            if (res.success) {
                showToast("Perfil actualizado correctamente", "success");
            } else {
                showToast(res.error || "Error al actualizar el perfil", "error");
            }
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
            </div>

            <Button 
                type="submit" 
                disabled={isLoading || name === initialName} 
                className="w-full sm:w-auto h-12 px-8 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors"
            >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Guardar Cambios"}
            </Button>
        </form>
    );
}
