"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/Toast";
import Link from "next/link";
import { Sparkles, Mail, Lock, User, Check, ChevronLeft } from "lucide-react";
import { PLAN_LIMITS, formatPrice } from "@/lib/plan-limits";
import { REGISTRATION_ENABLED } from "@/lib/features";

type PlanType = "FREE" | "PREMIUM";

export default function RegisterPage() {
  if (!REGISTRATION_ENABLED) {
    return (
      <div className="min-h-dvh py-12 px-4 flex items-center justify-center bg-[var(--ink)] relative text-[var(--on-ink)]">
        <Link href="/" className="absolute top-6 left-6 md:top-12 md:left-12 flex items-center gap-2 text-sm text-[var(--paper)] opacity-70 hover:opacity-100 transition-opacity">
          <ChevronLeft className="w-4 h-4" />
          Volver al inicio
        </Link>
        <div className="max-w-md w-full text-center bg-[var(--ink)]/80 backdrop-blur-md rounded-3xl border border-[var(--ink-2)] p-8 shadow-2xl">
          <h1 className="text-2xl font-display mb-3">Registro no disponible</h1>
          <p className="opacity-70 mb-6">
            Por ahora no se pueden crear cuentas nuevas de forma pública. Si ya tenés una cuenta, iniciá sesión; si necesitás una, contactanos.
          </p>
          <Link href="/login">
            <Button className="w-full l-cta bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--paper)]/90 border-none">
              Ir a Iniciar Sesión
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="min-h-dvh bg-[var(--ink)]" />}>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("FREE");

  useEffect(() => {
    if (searchParams?.get("plan") === "premium") {
      setSelectedPlan("PREMIUM");
    }
  }, [searchParams]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      showToast("Las contraseñas no coinciden", "error");
      return;
    }

    if (formData.password.length < 6) {
      showToast("La contraseña debe tener al menos 6 caracteres", "error");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          planTier: selectedPlan,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.error || "Error al registrarse", "error");
        return;
      }

      showToast("¡Cuenta creada exitosamente!", "success");
      router.push("/login");
    } catch (error) {
      showToast("Error al crear la cuenta", "error");
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
      <div className="max-w-6xl mx-auto w-full relative z-10 text-[var(--on-ink)]">
        {/* Header */}
        <div className="text-center mb-12">

          <h1 className="text-4xl font-display mb-2">
            Crea tu cuenta
          </h1>
          <p className="opacity-70 text-lg font-body">
            Comienza a crear invitaciones digitales increíbles
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 font-body max-w-6xl mx-auto w-full items-stretch">
          {/* Plan Selection */}
          <div className="w-full flex flex-col">
            <h2 className="text-2xl font-display mb-6">
              Elige tu plan
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 flex-1">

            {/* Free Plan */}
            <button
              type="button"
              onClick={() => setSelectedPlan("FREE")}
              className={`w-full h-full flex flex-col text-left p-3 sm:p-4 rounded-2xl border transition-all duration-300 ${
                selectedPlan === "FREE"
                  ? "border-[var(--paper)] ring-2 ring-[var(--paper)] bg-[var(--ink-2)] shadow-[0_15px_40px_rgba(246,243,236,0.2)] scale-[1.04] -translate-y-1.5 z-20"
                  : "border-[var(--ink-2)] hover:border-[var(--paper)]/50 bg-[var(--ink)]/50 backdrop-blur-md opacity-70 hover:opacity-100"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 gap-2 w-full">
                <div>
                  <h3 className="text-base sm:text-lg font-display leading-tight">
                    {PLAN_LIMITS.FREE.name}
                  </h3>
                  <p className="text-lg sm:text-xl font-display text-[var(--paper)] mt-1">
                    {formatPrice(PLAN_LIMITS.FREE.price)}
                  </p>
                </div>
                {selectedPlan === "FREE" && (
                  <div className="w-6 h-6 bg-[var(--paper)] rounded-full flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-[var(--ink)]" />
                  </div>
                )}
              </div>
              <ul className="space-y-1.5 opacity-80 text-[11px] sm:text-xs flex-1">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
                  <span>Hasta {PLAN_LIMITS.FREE.maxGuests} invitados</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
                  <span>Plantilla 100% personalizada</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
                  <span>Gestión de invitados y pagos</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
                  <span>Cuenta regresiva</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
                  <span>Album de fotos</span>
                </li>
                <li className="flex items-center gap-1.5 opacity-50">
                  <span className="text-red-400 font-bold px-0.5 shrink-0">✕</span>
                  <span>Sin musica de fondo</span>
                </li>
                <li className="flex items-center gap-1.5 opacity-50">
                  <span className="text-red-400 font-bold px-0.5 shrink-0">✕</span>
                  <span>Sin LIVE (fotos en vivo)</span>
                </li>
                <li className="flex items-center gap-1.5 opacity-50">
                  <span className="text-red-400 font-bold px-0.5 shrink-0">✕</span>
                  <span>Sin Trivia</span>
                </li>
                <li className="flex items-center gap-1.5 opacity-50">
                  <span className="text-red-400 font-bold px-0.5 shrink-0">✕</span>
                  <span>Sin sugerencias DJ</span>
                </li>
              </ul>
            </button>

            {/* Premium Plan */}
            <button
              type="button"
              onClick={() => setSelectedPlan("PREMIUM")}
              className={`w-full h-full flex flex-col text-left p-3 sm:p-4 rounded-2xl border transition-all duration-300 relative ${
                selectedPlan === "PREMIUM"
                  ? "border-[var(--paper)] ring-2 ring-[var(--paper)] bg-[var(--ink-2)] shadow-[0_15px_40px_rgba(246,243,236,0.2)] scale-[1.04] -translate-y-1.5 z-20"
                  : "border-[var(--ink-2)] hover:border-[var(--paper)]/50 bg-[var(--ink)]/50 backdrop-blur-md opacity-70 hover:opacity-100"
              }`}
            >
              <div className="absolute -top-2.5 right-3 bg-[var(--paper)] text-[var(--ink)] px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold font-mono tracking-wide uppercase">
                Más Popular
              </div>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 gap-2 w-full">
                <div>
                  <h3 className="text-base sm:text-lg font-display leading-tight">
                    Premium
                  </h3>
                  <p className="text-lg sm:text-xl font-display text-[var(--paper)] mt-1">
                    {formatPrice(PLAN_LIMITS.PREMIUM.price)}
                  </p>
                </div>
                {selectedPlan === "PREMIUM" && (
                  <div className="w-6 h-6 bg-[var(--paper)] rounded-full flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-[var(--ink)]" />
                  </div>
                )}
              </div>
              
              <ul className="space-y-1.5 opacity-80 text-[11px] sm:text-xs flex-1">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
                  <span>Invitados ilimitados</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
                  <span>Plantilla 100% personalizada</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
                  <span>Gestión de invitados y pagos</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
                  <span>Cuenta regresiva</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
                  <span>Album de fotos</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
                  <span>Con musica de fondo</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
                  <span>Con LIVE (fotos en vivo)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
                  <span>Con Trivia</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
                  <span>Con sugerencias DJ</span>
                </li>
              </ul>
              <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-md text-[10px] sm:text-[11px] text-yellow-500 leading-tight w-full mt-auto">
                ⚠️ El pago se habilitará próximamente con Mercado Pago
              </div>
            </button>
            </div>
          </div>

          {/* Registration Form */}
          <div className="bg-[var(--ink)]/80 backdrop-blur-md rounded-3xl border border-[var(--ink-2)] p-6 sm:p-8 shadow-2xl w-full">
            <h2 className="text-2xl font-display mb-6">
              Datos de tu cuenta
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="name" className="flex items-center gap-2 mb-2 opacity-80">
                  <User className="w-4 h-4" />
                  Nombre completo
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Juan Pérez"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="w-full bg-[var(--ink-2)] border-none text-[var(--on-ink)] placeholder:text-white/30 h-12 rounded-xl"
                />
              </div>

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
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  minLength={6}
                  className="w-full bg-[var(--ink-2)] border-none text-[var(--on-ink)] placeholder:text-white/30 h-12 rounded-xl"
                />
              </div>

              <div>
                <Label
                  htmlFor="confirmPassword"
                  className="flex items-center gap-2 mb-2 opacity-80"
                >
                  <Lock className="w-4 h-4" />
                  Confirmar contraseña
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repite tu contraseña"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  required
                  minLength={6}
                  className="w-full bg-[var(--ink-2)] border-none text-[var(--on-ink)] placeholder:text-white/30 h-12 rounded-xl"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full l-cta h-14 text-lg bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--paper)]/90 border-none mt-8"
                disabled={isLoading}
              >
                {isLoading ? (
                  "Creando cuenta..."
                ) : selectedPlan === "PREMIUM" ? (
                  `Pagar ${formatPrice(PLAN_LIMITS.PREMIUM.price)} y Registrarme`
                ) : (
                  "Crear Cuenta Gratis"
                )}
              </Button>

              <div className="text-center pt-4">
                <p className="opacity-70">
                  ¿Ya tienes cuenta?{" "}
                  <Link
                    href="/login"
                    className="text-[var(--paper)] hover:underline font-semibold opacity-100"
                  >
                    Inicia sesión
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
