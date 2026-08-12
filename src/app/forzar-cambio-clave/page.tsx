"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { forceChangePassword } from "@/app/actions/user";
import { useToast } from "@/components/ui/Toast";
import { Lock, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { validatePassword, PASSWORD_MIN_LENGTH } from "@/lib/password";

export default function ForzarCambioClavePage() {
  const router = useRouter();
  const { update } = useSession();
  const { showToast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showToast("Las contraseñas no coinciden", "error");
      return;
    }
    const passwordError = validatePassword(password);
    if (passwordError) {
      showToast(passwordError, "error");
      return;
    }

    setIsLoading(true);
    const result = await forceChangePassword(password);
    
    if (result.success) {
      showToast("Contraseña actualizada con éxito. Redirigiendo al inicio...", "success");
      // Update local session to remove mustChangePassword flag
      await update({ mustChangePassword: false });
      router.push("/dashboard");
    } else {
      showToast(result.error || "Ocurrió un error al actualizar la contraseña.", "error");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-black px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900/50 p-8 shadow-xl backdrop-blur-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 mb-4">
            <Lock className="h-8 w-8 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Cambio de Contraseña Requerido</h1>
          <p className="text-sm text-zinc-400">
            Tu cuenta fue creada o modificada por un administrador. Por seguridad, debes establecer una nueva contraseña para continuar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Nueva Contraseña</label>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={PASSWORD_MIN_LENGTH}
                className="bg-black border-white/10"
              />
              <p className="text-xs text-zinc-500">Mínimo 8 caracteres, con al menos una mayúscula y un número</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Confirmar Nueva Contraseña</label>
              <PasswordInput 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-black border-white/10"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold h-12"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Actualizando...
              </>
            ) : (
              "Guardar y Continuar"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
