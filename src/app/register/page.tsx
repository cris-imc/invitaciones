"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/Toast";
import Link from "next/link";
import { Sparkles, Mail, Lock, User, Check, ArrowLeft } from "lucide-react";
import { PLAN_LIMITS, formatPrice } from "@/lib/plan-limits";

type PlanType = "FREE" | "PREMIUM";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--ink)]" />}>
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
  const [premiumQuantity, setPremiumQuantity] = useState(1);

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
          premiumCredits: selectedPlan === "PREMIUM" ? premiumQuantity : 0,
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
    <div className="min-h-screen py-12 px-4 flex items-center justify-center bg-[var(--ink)] relative">
      <Link href="/" className="absolute top-6 left-6 md:top-12 md:left-12 flex items-center gap-2 text-sm text-[var(--paper)] opacity-70 hover:opacity-100 transition-opacity">
        <ArrowLeft className="w-4 h-4" />
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

        <div className="grid md:grid-cols-2 gap-8 font-body">
          {/* Plan Selection */}
          <div className="space-y-4">
            <h2 className="text-2xl font-display mb-6">
              Elige tu plan
            </h2>

            {/* Free Plan */}
            <button
              type="button"
              onClick={() => setSelectedPlan("FREE")}
              className={`w-full text-left p-6 rounded-3xl border transition-all ${
                selectedPlan === "FREE"
                  ? "border-[var(--paper)] bg-[var(--ink-2)] shadow-[0_0_20px_rgba(246,243,236,0.1)]"
                  : "border-[var(--ink-2)] hover:border-[var(--paper)]/50 bg-[var(--ink)]/50 backdrop-blur-md"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-display">
                    {PLAN_LIMITS.FREE.name}
                  </h3>
                  <p className="text-3xl font-display text-[var(--paper)] mt-2">
                    {formatPrice(PLAN_LIMITS.FREE.price)}
                  </p>
                </div>
                {selectedPlan === "FREE" && (
                  <div className="w-8 h-8 bg-[var(--paper)] rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-[var(--ink)]" />
                  </div>
                )}
              </div>
              <ul className="space-y-2 opacity-80">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  Hasta {PLAN_LIMITS.FREE.maxGuests} invitados
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  Plantilla 100% personalizada
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  Gestión de invitados y pagos
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  Cuenta regresiva
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  Album de fotos
                </li>
                <li className="flex items-center gap-2 opacity-50">
                  <span className="text-red-400 font-bold px-1">✕</span>
                  Sin musica de fondo
                </li>
                <li className="flex items-center gap-2 opacity-50">
                  <span className="text-red-400 font-bold px-1">✕</span>
                  Sin LIVE (fotos transmitidas en vivo)
                </li>
                <li className="flex items-center gap-2 opacity-50">
                  <span className="text-red-400 font-bold px-1">✕</span>
                  Sin Trivia
                </li>
                <li className="flex items-center gap-2 opacity-50">
                  <span className="text-red-400 font-bold px-1">✕</span>
                  Sin sugerencias de musica para el DJ
                </li>
              </ul>
            </button>

            {/* Premium Plan */}
            <button
              type="button"
              onClick={() => setSelectedPlan("PREMIUM")}
              className={`w-full text-left p-6 rounded-3xl border transition-all relative ${
                selectedPlan === "PREMIUM"
                  ? "border-[var(--paper)] bg-[var(--ink-2)] shadow-[0_0_20px_rgba(246,243,236,0.1)]"
                  : "border-[var(--ink-2)] hover:border-[var(--paper)]/50 bg-[var(--ink)]/50 backdrop-blur-md"
              }`}
            >
              <div className="absolute -top-3 right-6 bg-[var(--paper)] text-[var(--ink)] px-4 py-1 rounded-full text-sm font-semibold font-mono tracking-wide uppercase">
                Más Popular
              </div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-display">
                    Invitaciones Premium
                  </h3>
                  <p className="text-3xl font-display text-[var(--paper)] mt-2">
                    {formatPrice(PLAN_LIMITS.PREMIUM.price)} <span className="text-sm opacity-60 font-body">c/u</span>
                  </p>
                </div>
                {selectedPlan === "PREMIUM" && (
                  <div className="w-8 h-8 bg-[var(--paper)] rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-[var(--ink)]" />
                  </div>
                )}
              </div>
              
              {selectedPlan === "PREMIUM" && (
                <div className="mb-6 bg-[var(--ink)] p-4 rounded-2xl border border-[var(--ink-2)]" onClick={(e) => e.stopPropagation()}>
                  <label className="block text-sm font-semibold opacity-70 mb-2">Cantidad de invitaciones a comprar:</label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center bg-[var(--ink-2)] rounded-full p-1">
                        <button type="button" onClick={() => setPremiumQuantity(Math.max(1, premiumQuantity - 1))} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">-</button>
                        <span className="w-12 text-center font-bold text-lg">{premiumQuantity}</span>
                        <button type="button" onClick={() => setPremiumQuantity(premiumQuantity + 1)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">+</button>
                    </div>
                    <div className="ml-auto text-right">
                        <span className="text-xs opacity-60 block">Total a pagar</span>
                        <span className="font-display text-xl text-[var(--accent)]">{formatPrice(PLAN_LIMITS.PREMIUM.price * premiumQuantity)}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <ul className="space-y-2 opacity-80">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  Invitados ilimitados
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  Plantilla 100% personalizada
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  Gestión de invitados y pagos
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  Cuenta regresiva
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  Album de fotos
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  Con musica de fondo
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  Con LIVE (fotos transmitidas en vivo)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  Con Trivia
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  Con sugerencias de musica para el DJ
                </li>
              </ul>
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm text-yellow-500">
                ⚠️ El pago se habilitará próximamente con Mercado Pago
              </div>
            </button>
          </div>

          {/* Registration Form */}
          <div className="bg-[var(--ink)]/80 backdrop-blur-md rounded-3xl border border-[var(--ink-2)] p-8 shadow-2xl">
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
                  `Pagar ${formatPrice(PLAN_LIMITS.PREMIUM.price * premiumQuantity)} y Registrarme`
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
