"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/Toast";
import { Lock, ChevronLeft } from "lucide-react";
import { PASSWORD_REQUIREMENTS_HINT } from "@/lib/password";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
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
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(data.error || "Error al resetear la contraseña", "error");
        return;
      }
      showToast("¡Contraseña actualizada! Ya podés iniciar sesión.", "success");
      router.push("/login");
    } catch {
      showToast("Error al resetear la contraseña", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <p className="text-center opacity-80 font-body">
        Este link no es válido.{" "}
        <Link href="/forgot-password" className="text-[var(--paper)] hover:underline font-semibold">
          Pedí uno nuevo
        </Link>
        .
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 font-body">
      <div>
        <Label htmlFor="password" className="flex items-center gap-2 mb-2 opacity-80">
          <Lock className="w-4 h-4" />
          Nueva contraseña
        </Label>
        <PasswordInput
          id="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full bg-[var(--ink-2)] border-none text-[var(--on-ink)] placeholder:text-white/30 h-12 rounded-xl"
        />
        <p className="text-xs opacity-50 mt-1.5">{PASSWORD_REQUIREMENTS_HINT}</p>
      </div>

      <div>
        <Label htmlFor="confirmPassword" className="flex items-center gap-2 mb-2 opacity-80">
          <Lock className="w-4 h-4" />
          Confirmar contraseña
        </Label>
        <PasswordInput
          id="confirmPassword"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full bg-[var(--ink-2)] border-none text-[var(--on-ink)] placeholder:text-white/30 h-12 rounded-xl"
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 rounded-xl bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--paper)]/90 font-semibold mt-4 transition-all"
      >
        {isLoading ? "Guardando..." : "Guardar nueva contraseña"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-dvh py-12 px-4 flex items-center justify-center bg-[var(--ink)] relative">
      <Link href="/login" className="absolute top-6 left-6 md:top-12 md:left-12 flex items-center gap-2 text-sm text-[var(--paper)] opacity-70 hover:opacity-100 transition-opacity">
        <ChevronLeft className="w-4 h-4" />
        Volver a iniciar sesión
      </Link>
      <div className="max-w-md mx-auto w-full relative z-10 text-[var(--on-ink)]">
        <div className="bg-[var(--ink)]/80 backdrop-blur-md rounded-3xl border border-[var(--ink-2)] p-8 shadow-2xl text-[var(--on-ink)]">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl mb-2">Elegí tu nueva contraseña</h1>
          </div>
          <Suspense fallback={null}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
