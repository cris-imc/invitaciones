"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/Toast";
import Link from "next/link";
import { Diamond, Mail, Lock, User, Phone, Check, ChevronLeft } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { PLAN_LIMITS, formatPrice, DIAMOND_DISCOUNT_PRICE } from "@/lib/plan-limits";
import { REGISTRATION_ENABLED } from "@/lib/features";
import { normalizeDigits, validatePhoneAreaCode, validatePhoneNumber } from "@/lib/phone";
import { validatePassword, PASSWORD_MIN_LENGTH } from "@/lib/password";

type PlanType = "FREE" | "PREMIUM" | "DIAMOND";

const PLAN_CARDS: {
  key: PlanType;
  name: string;
  features: string[];
  negativeFeatures?: string[];
  recommended?: boolean;
}[] = [
  {
    key: "FREE",
    name: PLAN_LIMITS.FREE.name,
    features: [
      `Hasta ${PLAN_LIMITS.FREE.maxGuests} invitados`,
      "Plantilla 100% personalizada",
      "Gestión de invitados",
      "Cuenta regresiva",
      `Hasta ${PLAN_LIMITS.FREE.maxPhotos} fotos en el álbum`,
    ],
    negativeFeatures: ["Sin musica de fondo", "Sin LIVE (fotos en vivo)", "Sin Trivia", "Sin sugerencias DJ"],
  },
  {
    key: "PREMIUM",
    name: "Premium",
    features: [
      "Invitados ilimitados",
      "Plantilla 100% personalizada",
      "Gestión de invitados y pagos",
      "Cuenta regresiva",
      `Hasta ${PLAN_LIMITS.PREMIUM.maxPhotos} fotos en el álbum`,
      "Con musica de fondo",
      "Con Trivia",
      "Con sugerencias DJ",
    ],
    negativeFeatures: ["Sin función Live"],
  },
  {
    key: "DIAMOND",
    name: "Diamond",
    features: [
      "Invitados ilimitados",
      "Plantilla 100% personalizada",
      "Gestión de invitados y pagos",
      "Cuenta regresiva",
      `Hasta ${PLAN_LIMITS.DIAMOND.maxPhotos} fotos en el álbum`,
      "Con musica de fondo",
      `Con LIVE (hasta ${PLAN_LIMITS.DIAMOND.maxLivePhotos} fotos)`,
      "Con Trivia",
      "Con sugerencias DJ",
    ],
    recommended: true,
  },
];

function planPriceLabel(plan: PlanType): string {
  if (plan === "FREE") return formatPrice(PLAN_LIMITS.FREE.price);
  if (plan === "DIAMOND") return formatPrice(DIAMOND_DISCOUNT_PRICE);
  return formatPrice(PLAN_LIMITS[plan].price);
}

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
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("DIAMOND");

  useEffect(() => {
    const plan = searchParams?.get("plan");
    if (plan === "premium") setSelectedPlan("PREMIUM");
    else if (plan === "diamond") setSelectedPlan("DIAMOND");
    else if (plan === "free") setSelectedPlan("FREE");
  }, [searchParams]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneAreaCode: "",
    phoneNumber: "",
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptedTerms) {
      showToast("Debés aceptar los Términos y Condiciones para registrarte", "error");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showToast("Las contraseñas no coinciden", "error");
      return;
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      showToast(passwordError, "error");
      return;
    }

    const areaCodeError = validatePhoneAreaCode(formData.phoneAreaCode);
    if (areaCodeError) {
      showToast(areaCodeError, "error");
      return;
    }

    const phoneNumberError = validatePhoneNumber(formData.phoneNumber);
    if (phoneNumberError) {
      showToast(phoneNumberError, "error");
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
          phoneAreaCode: normalizeDigits(formData.phoneAreaCode),
          phoneNumber: normalizeDigits(formData.phoneNumber),
          acceptedTerms,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.error || "Error al registrarse", "error");
        return;
      }

      if (data.checkoutUrl) {
        showToast("¡Cuenta creada! Redirigiendo a Mercado Pago...", "success");
        window.location.href = data.checkoutUrl;
        return;
      }

      if (data.error) {
        // Cuenta creada, pero el cobro no se pudo generar (ver mensaje del servidor).
        showToast(data.error, "error");
        router.push("/login");
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

      <div className="max-w-5xl mx-auto w-full relative z-10 text-[var(--on-ink)] font-body">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-display mb-2">Crea tu cuenta</h1>
          <p className="opacity-70 text-lg font-body">
            {step === 1
              ? "Elegí el plan que mejor se adapta a tu evento"
              : "Ya casi terminamos, completá tus datos"}
          </p>
        </div>

        {step === 1 ? (
          <div className="w-full flex flex-col">
            <div className="grid sm:grid-cols-3 gap-4 sm:gap-5">
              {PLAN_CARDS.map((plan) => {
                const isSelected = selectedPlan === plan.key;
                return (
                  <button
                    key={plan.key}
                    type="button"
                    onClick={() => setSelectedPlan(plan.key)}
                    className={`relative w-full text-left p-5 sm:p-6 rounded-2xl border transition-all duration-300 flex flex-col ${
                      isSelected
                        ? "border-[var(--accent)] ring-2 ring-[var(--accent)] bg-[var(--ink-2)] shadow-[0_15px_40px_rgba(199,154,75,0.25)] sm:scale-[1.03] -translate-y-1 z-20"
                        : "border-[var(--ink-2)] hover:border-[var(--accent)]/50 bg-[var(--ink)]/50 backdrop-blur-md opacity-80 hover:opacity-100"
                    }`}
                  >
                    {plan.recommended && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--accent)] text-[var(--ink)] px-3 py-0.5 rounded-full text-[10px] sm:text-xs font-bold font-mono tracking-wide uppercase flex items-center gap-1 whitespace-nowrap">
                        <Diamond className="w-3 h-3" />
                        Recomendado
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-4 gap-2">
                      <div>
                        <h3 className="text-lg sm:text-xl font-display leading-tight">{plan.name}</h3>
                        <div className="mt-1 flex items-baseline gap-2 flex-wrap">
                          {plan.key === "DIAMOND" && (
                            <span className="text-sm font-normal text-[var(--on-ink)]/40 line-through">
                              {formatPrice(PLAN_LIMITS.DIAMOND.price)}
                            </span>
                          )}
                          <span className="text-xl sm:text-2xl font-display text-[var(--accent)]">
                            {planPriceLabel(plan.key)}
                          </span>
                        </div>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 ${
                          isSelected ? "bg-[var(--accent)] border-[var(--accent)]" : "border-[var(--on-ink)]/20"
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-[var(--ink)]" />}
                      </div>
                    </div>

                    <ul className="space-y-2 opacity-90 text-xs sm:text-sm flex-1">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                      {plan.negativeFeatures?.map((f) => (
                        <li key={f} className="flex items-center gap-1.5 opacity-50">
                          <span className="text-red-400 font-bold px-0.5 shrink-0">✕</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>

            <Button
              type="button"
              onClick={() => setStep(2)}
              className="w-full sm:w-auto sm:self-center l-cta h-14 text-lg px-12 bg-[var(--accent)] text-[var(--ink)] hover:bg-[var(--accent)]/90 border-none mt-10"
            >
              Continuar
            </Button>

            <div className="text-center pt-6">
              <p className="opacity-70">
                ¿Ya tienes cuenta?{" "}
                <Link href="/login" className="text-[var(--accent)] hover:underline font-semibold opacity-100">
                  Inicia sesión
                </Link>
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto w-full">
            <div className="bg-[var(--ink)]/80 backdrop-blur-md rounded-3xl border border-[var(--ink-2)] p-6 sm:p-8 shadow-2xl w-full">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 text-sm opacity-60 hover:opacity-100 transition-opacity mb-4"
              >
                <ChevronLeft className="w-4 h-4" />
                Cambiar plan
              </button>

              <div className="flex items-center justify-between mb-6 p-4 rounded-xl bg-[var(--ink-2)] border border-[var(--accent)]/30">
                <div>
                  <p className="text-xs uppercase tracking-wide opacity-60">Plan elegido</p>
                  <p className="text-lg font-display">{PLAN_CARDS.find((p) => p.key === selectedPlan)?.name}</p>
                </div>
                <p className="text-xl font-display text-[var(--accent)]">{planPriceLabel(selectedPlan)}</p>
              </div>

              <h2 className="text-2xl font-display mb-6">Datos de tu cuenta</h2>

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
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full bg-[var(--ink-2)] border-none text-[var(--on-ink)] placeholder:text-white/30 h-12 rounded-xl"
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2 opacity-80">
                    <Phone className="w-4 h-4" />
                    Teléfono
                  </Label>
                  <div className="grid grid-cols-[100px_1fr] gap-2">
                    <Input
                      id="phoneAreaCode"
                      type="tel"
                      inputMode="numeric"
                      placeholder="Cód. área"
                      value={formData.phoneAreaCode}
                      onChange={(e) => setFormData({ ...formData, phoneAreaCode: normalizeDigits(e.target.value) })}
                      maxLength={4}
                      required
                      className="w-full bg-[var(--ink-2)] border-none text-[var(--on-ink)] placeholder:text-white/30 h-12 rounded-xl"
                    />
                    <Input
                      id="phoneNumber"
                      type="tel"
                      inputMode="numeric"
                      placeholder="Número"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: normalizeDigits(e.target.value) })}
                      maxLength={8}
                      required
                      className="w-full bg-[var(--ink-2)] border-none text-[var(--on-ink)] placeholder:text-white/30 h-12 rounded-xl"
                    />
                  </div>
                  <p className="text-xs opacity-50 mt-1.5">
                    Código de área sin el 0 (ej. 351) y número sin el 15 (ej. 5551234)
                  </p>
                </div>

                <div>
                  <Label htmlFor="password" className="flex items-center gap-2 mb-2 opacity-80">
                    <Lock className="w-4 h-4" />
                    Contraseña
                  </Label>
                  <PasswordInput
                    id="password"
                    placeholder="Mínimo 8 caracteres, con una mayúscula y un número"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={PASSWORD_MIN_LENGTH}
                    className="w-full bg-[var(--ink-2)] border-none text-[var(--on-ink)] placeholder:text-white/30 h-12 rounded-xl"
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="flex items-center gap-2 mb-2 opacity-80">
                    <Lock className="w-4 h-4" />
                    Confirmar contraseña
                  </Label>
                  <PasswordInput
                    id="confirmPassword"
                    placeholder="Repite tu contraseña"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    minLength={PASSWORD_MIN_LENGTH}
                    className="w-full bg-[var(--ink-2)] border-none text-[var(--on-ink)] placeholder:text-white/30 h-12 rounded-xl"
                  />
                </div>

                <label htmlFor="acceptedTerms" className="flex items-start gap-2.5 pt-1 cursor-pointer">
                  <Checkbox
                    id="acceptedTerms"
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => setAcceptedTerms(Boolean(checked))}
                    className="mt-0.5 border-[var(--on-ink)]/30 data-[state=checked]:bg-[var(--accent)] data-[state=checked]:border-[var(--accent)] data-[state=checked]:text-[var(--ink)]"
                  />
                  <span className="text-sm opacity-80 leading-snug">
                    Acepto los{" "}
                    <Link
                      href="/terminos-registro"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--accent)] hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Términos y Condiciones
                    </Link>{" "}
                    de Alta Invitación
                  </span>
                </label>

                <Button
                  type="submit"
                  className="w-full l-cta h-14 text-lg bg-[var(--accent)] text-[var(--ink)] hover:bg-[var(--accent)]/90 border-none mt-2"
                  disabled={isLoading || !acceptedTerms}
                >
                  {isLoading
                    ? "Creando cuenta..."
                    : selectedPlan === "FREE"
                    ? "Crear cuenta"
                    : "Continuar a Mercado Pago"}
                </Button>

                <div className="text-center pt-4">
                  <p className="opacity-70">
                    ¿Ya tienes cuenta?{" "}
                    <Link href="/login" className="text-[var(--accent)] hover:underline font-semibold opacity-100">
                      Inicia sesión
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
