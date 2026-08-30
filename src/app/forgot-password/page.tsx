"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/Toast";
import { Mail, ChevronLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(data.error || "Error al procesar la solicitud", "error");
        return;
      }
      setSent(true);
    } catch {
      showToast("Error al procesar la solicitud", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh py-12 px-4 flex items-center justify-center bg-[var(--ink)] relative">
      <Link href="/login" className="absolute top-6 left-6 md:top-12 md:left-12 flex items-center gap-2 text-sm text-[var(--paper)] opacity-70 hover:opacity-100 transition-opacity">
        <ChevronLeft className="w-4 h-4" />
        Volver a iniciar sesión
      </Link>
      <div className="max-w-md mx-auto w-full relative z-10 text-[var(--on-ink)]">
        <div className="bg-[var(--ink)]/80 backdrop-blur-md rounded-3xl border border-[var(--ink-2)] p-8 shadow-2xl text-[var(--on-ink)]">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl mb-2">Recuperar contraseña</h1>
            <p className="opacity-70 font-body">
              {sent
                ? "Revisá tu email para continuar."
                : "Ingresá tu email y te mandamos un link para resetear tu contraseña."}
            </p>
          </div>

          {sent ? (
            <p className="text-center opacity-80 font-body">
              Si <strong>{email}</strong> está registrado, te va a llegar un mail con un link válido por 30 minutos.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 font-body">
              <div>
                <Label htmlFor="email" className="flex items-center gap-2 mb-2 opacity-80">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-[var(--ink-2)] border-none text-[var(--on-ink)] placeholder:text-white/30 h-12 rounded-xl"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--paper)]/90 font-semibold mt-4 transition-all"
              >
                {isLoading ? "Enviando..." : "Enviar link de recuperación"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
