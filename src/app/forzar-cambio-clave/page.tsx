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
    <div className="pantalla-auth flex min-h-dvh items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--line)] bg-[var(--card)] p-8 shadow-xl backdrop-blur-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 mb-4">
            <Lock className="h-8 w-8 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">Cambio de Contraseña Requerido</h1>
          <p className="text-sm text-[var(--shell-fg-mid)]">
            Tu cuenta fue creada o modificada por un administrador. Por seguridad, debes establecer una nueva contraseña para continuar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--shell-fg-strong)]">Nueva Contraseña</label>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={PASSWORD_MIN_LENGTH}
                className="bg-[var(--background)] border-[var(--line)]"
              />
              <p className="text-xs text-[var(--shell-fg-soft)]">Mínimo 8 caracteres, con al menos una mayúscula y un número</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--shell-fg-strong)]">Confirmar Nueva Contraseña</label>
              <PasswordInput 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-[var(--background)] border-[var(--line)]"
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
