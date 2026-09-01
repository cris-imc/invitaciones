"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { authenticate } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/Toast";
import Link from "next/link";
import { Sparkles, Mail, Lock, ChevronLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { update } = useSession();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await authenticate(formData.email, formData.password);
      if (res?.error) {
        showToast(res.error, "error");
      } else {
        showToast("¡Bienvenido!", "success");
        await update();
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error: any) {
      if (error?.digest?.startsWith("NEXT_REDIRECT")) {
        // Next.js redirection succeeded -- signIn() ya dejó la cookie de
        // sesión seteada en el server, pero el SessionProvider del cliente
        // (useSession en Sidebar, CreateUserButton, etc.) no se entera solo
        // con la redirección: sigue sirviendo el session viejo (sin
        // rol/o con el rol previo) hasta el próximo refetch automático, que
        // recién pasaba al hacer F5. Forzar el refetch acá es lo que hace
        // que la botonera de admin y la opción de crear admin aparezcan sin
        // recargar.
        await update();
        showToast("¡Bienvenido!", "success");
        return;
      }
      console.error("[LOGIN ERROR]", error);
      showToast("Error al iniciar sesión", "error");
    } finally {
      setIsLoading(false);
    }
  };


  return (
      <div className="min-h-dvh py-12 px-4 flex items-center justify-center bg-[var(--ink)] relative">
        <Link href="/" className="absolute top-6 left-6 md:top-12 md:left-12 flex items-center gap-2 text-sm text-[var(--paper)] opacity-70 hover:opacity-100 transition-opacity">
          <ChevronLeft className="w-4 h-4" />
          Volver al inicio
        </Link>
        <div className="max-w-md mx-auto w-full relative z-10 text-[var(--on-ink)]">
        <div className="bg-[var(--ink)]/80 backdrop-blur-md rounded-3xl border border-[var(--ink-2)] p-8 shadow-2xl text-[var(--on-ink)]">
          {/* Logo/Header */}
          <div className="text-center mb-8">

            <h1 className="font-display text-3xl mb-2">
              Iniciar Sesión
            </h1>
            <p className="opacity-70 font-body">
              Accede a tu cuenta de invitaciones digitales
            </p>
          </div>

          {/* Form */}
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
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                className="w-full bg-[var(--ink-2)] border-none text-[var(--on-ink)] placeholder:text-white/30 h-12 rounded-xl"
              />
            </div>

            <div>
              <Label htmlFor="password" className="flex items-center gap-2 mb-2 opacity-80">
                <Lock className="w-4 h-4" />
                Contraseña
              </Label>
              <PasswordInput
                id="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                className="w-full bg-[var(--ink-2)] border-none text-[var(--on-ink)] placeholder:text-white/30 h-12 rounded-xl"
              />
              <div className="text-right mt-2">
                <Link href="/forgot-password" className="text-sm opacity-70 hover:opacity-100 hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--paper)]/90 font-semibold mt-4 transition-all"
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center opacity-30">
            <div className="flex-1 border-t border-current"></div>
            <span className="px-4 text-sm font-mono uppercase tracking-widest">o</span>
            <div className="flex-1 border-t border-current"></div>
          </div>

          {/* Register Link */}
          <div className="text-center font-body">
            <p className="opacity-70">
              ¿No tienes cuenta?{" "}
              <Link
                href="/register"
                className="text-[var(--paper)] hover:underline font-semibold opacity-100"
              >
                Registrate acá
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
