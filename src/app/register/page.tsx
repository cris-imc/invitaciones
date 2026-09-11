"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { hapticoExito, hapticoError } from "@/lib/haptics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/Toast";
import Link from "next/link";
import { Diamond, Mail, Lock, User, Phone, Check, ChevronLeft, Tag, Radio, Globe } from "lucide-react";
import { SelectorPais } from "@/components/ui/SelectorPais";
import type { CodigoPais } from "@/lib/paises";
import { Checkbox } from "@/components/ui/checkbox";
import { PLAN_LIMITS, formatPrice, PREMIUM_DISCOUNT_PRICE, DIAMOND_DISCOUNT_PRICE, PREMIUM_DISCOUNT_PERCENTAGE, DIAMOND_DISCOUNT_PERCENTAGE } from "@/lib/plan-limits";
import { REGISTRATION_ENABLED } from "@/lib/features";
import { PagoPorTransferencia } from "@/components/pagos/PagoPorTransferencia";
import { normalizeDigits, validarTelefono, prefijoTelefonico, formatoTelefonico } from "@/lib/phone";
import { validatePassword, PASSWORD_MIN_LENGTH } from "@/lib/password";
import { setPendingWizardDesiredCredit } from "@/lib/pending-wizard-invitation";
import { costumbresDe } from "@/lib/costumbres-por-pais";
import {
  cobraEnOtraMoneda,
  precioParaPayPal,
  precioDePlan,
  precioConDescuento,
  formatearPrecio,
} from "@/lib/precios-por-pais";
import { paisDelVisitanteEnCliente, recordarPaisDelVisitante, recordarPaisElegido } from "@/lib/pais-visitante";
import { useIdioma } from "@/components/i18n/ProveedorIdioma";
import { LogoDePago } from "@/components/pagos/LogoDePago";

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
      "Control de ingreso por QR",
    ],
    negativeFeatures: ["Sin gestión de pagos", "Sin musica de fondo", "Sin Modo LIVE (fotos y mensajes en vivo)", "Sin Trivia", "Sin sugerencias DJ"],
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
      "Con organización de mesas",
      "Con control de ingreso por QR",
    ],
    negativeFeatures: ["Sin Modo LIVE (fotos y mensajes en vivo)", "Sin ver quién abrió la invitación"],
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
      "Con LIVE (fotos y mensajes en vivo)",
      "Con organización de mesas",
      "Con control de ingreso por QR",
      "Ver quién abrió la invitación",
      "Con Trivia",
      "Con sugerencias DJ",
    ],
    recommended: true,
  },
];

/**
 * El precio que paga alguien de ese país, en su moneda.
 *
 * Antes salía de PLAN_LIMITS, que son los precios argentinos: un colombiano
 * veía el precio en pesos colombianos en la landing, hacía clic en "Crear
 * cuenta" y acá le aparecían pesos argentinos. Cambiar de número entre la
 * promesa y el checkout es la forma más rápida de perder la venta.
 */
function planPriceLabel(plan: PlanType, pais: CodigoPais): string {
  if (plan === "FREE") return formatearPrecio(precioDePlan("FREE", pais), "es");
  return formatearPrecio(precioConDescuento(plan as "PREMIUM" | "DIAMOND", pais), "es");
}

export default function RegisterPage() {
  if (!REGISTRATION_ENABLED) {
    return (
      <div className="pantalla-auth min-h-dvh py-12 px-4 flex items-center justify-center bg-[var(--ink)] relative text-[var(--on-ink)]">
        <Link href="/" className="absolute top-6 left-6 md:top-12 md:left-12 flex items-center gap-2 text-sm text-[var(--paper)] opacity-70 hover:opacity-100 transition-opacity">
          <ChevronLeft className="w-4 h-4" />
          Volver al inicio
        </Link>
        <div className="max-w-md w-full text-center bg-[var(--ink)]/80 backdrop-blur-md rounded-3xl border border-[var(--ink-2)] p-8 shadow-2xl">
          <h1 className="text-2xl font-display mb-3">Registro no disponible</h1>
          <p className="opacity-70 mb-6">
            Por ahora no se pueden crear cuentas nuevas de forma pública. Si ya tienes una cuenta, inicia sesión; si necesitas una, contactanos.
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


  const fromWizard = searchParams?.get("from") === "wizard";

  useEffect(() => {
    const plan = searchParams?.get("plan");
    if (plan === "premium") setSelectedPlan("PREMIUM");
    else if (plan === "diamond") setSelectedPlan("DIAMOND");
    else if (plan === "free") setSelectedPlan("FREE");
    // Sin plan explícito en la URL: si viene de "Empezar gratis" (wizard
    // público, ver /dashboard/invitaciones/crear sin sesión), preseleccionar Free -- si no, queda
    // el default (Diamond, recomendado) para quien entra directo a /register.
    else if (fromWizard) setSelectedPlan("FREE");
  }, [searchParams, fromWizard]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneAreaCode: "",
    phoneNumber: "",
    // Argentina de arranque, y apenas monta se reemplaza por el país que se
    // detecte (ver abajo). No se detecta acá mismo para no producir un HTML
    // distinto en el servidor y en el cliente.
    pais: "AR" as CodigoPais,
  });

  // El país de quien está entrando, para no hacerle buscar el suyo en la
  // lista. Sólo pisa el valor inicial: si ya tocó el selector, manda su
  // elección (por eso depende de `paisElegidoAMano`).
  // `paisDelServidor` es lo que el servidor resolvió para esta carga (con un
  // CDN adelante, la IP real): pasa por encima de la zona horaria.
  const { pais: paisDelServidor } = useIdioma();
  const [paisElegidoAMano, setPaisElegidoAMano] = useState(false);
  useEffect(() => {
    if (paisElegidoAMano) return;
    const detectado = paisDelVisitanteEnCliente(paisDelServidor);
    if (detectado) {
      setFormData((previo) => ({ ...previo, pais: detectado }));
      recordarPaisDelVisitante(detectado);
    }
  }, [paisElegidoAMano, paisDelServidor]);

  // Qué medios de pago corresponden al país elegido. Fuera de Argentina
  // sólo PayPal: una cuenta común de Mercado Pago Argentina no puede
  // cobrarle a alguien de otro país, y la transferencia va a un CBU
  // argentino que no le sirve a nadie de afuera.
  const medios = costumbresDe(formData.pais).mediosDePago;
  const porMercadoPago = medios.includes("mercadopago");

  // Cómo se escribe un teléfono en el país elegido: si lleva código de área,
  // cómo se llama ahí y cuántos dígitos tiene cada tramo.
  const formatoTel = formatoTelefonico(formData.pais);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Código de descuento: se valida en vivo contra el servidor (botón
  // "Aplicar") antes de mandarlo en el submit final -- así el usuario ve
  // confirmado el precio recalculado antes de ir a pagar a Mercado Pago,
  // que solo muestra un monto en pesos, no si un código se aplicó o no.
  const [discountInput, setDiscountInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; percentage: number; amount: number } | null>(null);
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [discountError, setDiscountError] = useState<string | null>(null);

  // El monto del código depende del plan elegido -- si el usuario vuelve a
  // "Cambiar plan" y elige otro, el descuento aplicado quedaría calculado
  // sobre el precio del plan viejo.
  useEffect(() => {
    setAppliedDiscount(null);
    setDiscountError(null);
  }, [selectedPlan]);

  const handleApplyDiscountCode = async () => {
    if (!discountInput.trim()) return;
    setIsValidatingCode(true);
    setDiscountError(null);
    try {
      const response = await fetch("/api/auth/validate-discount-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: discountInput, planTier: selectedPlan }),
      });
      const data = await response.json();
      if (!data.valid) {
        setDiscountError(data.error || "Código inválido");
        setAppliedDiscount(null);
        return;
      }
      setAppliedDiscount({ code: data.code, percentage: data.percentage, amount: data.amount });
    } catch {
      setDiscountError("Error al validar el código");
    } finally {
      setIsValidatingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptedTerms) {
      hapticoError();
      showToast("Debes aceptar los Términos y Condiciones para registrarte", "error");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      hapticoError();
      showToast("Las contraseñas no coinciden", "error");
      return;
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      hapticoError();
      showToast(passwordError, "error");
      return;
    }

    // El teléfono es opcional y sus reglas dependen del país: las que había
    // eran argentinas y le rechazaban a un colombiano un número válido.
    const errorTelefono = validarTelefono(formData.pais, formData.phoneAreaCode, formData.phoneNumber);

    if (errorTelefono) {
      hapticoError();
      showToast(errorTelefono, "error");
      return;
    }

    if (discountInput.trim() && !appliedDiscount) {
      hapticoError();
      showToast("Aplica el código de descuento antes de continuar, o borralo si no lo vas a usar", "error");
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
          pais: formData.pais,
          acceptedTerms,
          discountCode: appliedDiscount?.code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        hapticoError();
        showToast(data.error || "Error al registrarse", "error");
        return;
      }

      if (data.checkoutUrl) {
        // La cuenta que se crea acá siempre queda en plan Gratis (ver
        // /api/auth/register) -- lo que compra Premium/Diamond es un
        // crédito. Si venía del wizard público, hay que dejar guardado con
        // qué crédito termina de crear la invitación cuando vuelva
        // autenticado (ver PendingWizardInvitationBridge).
        if (fromWizard) {
          setPendingWizardDesiredCredit(selectedPlan === "DIAMOND" ? "DIAMOND" : "PREMIUM");
        }
        hapticoExito();
        showToast(
          data.proveedor === "paypal"
            ? "¡Cuenta creada! Redirigiendo a PayPal..."
            : "¡Cuenta creada! Redirigiendo a Mercado Pago...",
          "success"
        );
        window.location.href = data.checkoutUrl;
        return;
      }

      if (data.error) {
        // Cuenta creada, pero el cobro no se pudo generar (ver mensaje del servidor).
        hapticoError();
        showToast(data.error, "error");
        router.push("/login");
        return;
      }

      hapticoExito();
      showToast("¡Cuenta creada exitosamente!", "success");
      router.push("/login");
    } catch (error) {
      hapticoError();
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
        {fromWizard && (
          <div className="max-w-md mx-auto mb-6 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-sm text-center justify-center">
            <Check className="w-4 h-4 text-[var(--accent)] shrink-0" />
            <span>Ya armaste tu invitación -- crea tu cuenta para publicarla.</span>
          </div>
        )}
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-display mb-2">Crea tu cuenta</h1>
          <p className="opacity-70 text-lg font-body">
            {step === 1
              ? "Elige la invitación que mejor se adapta a tu evento"
              : "Ya casi terminamos, completa tus datos"}
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
                          {(plan.key === "DIAMOND" || plan.key === "PREMIUM") && (
                            <span className="text-sm font-normal text-[var(--on-ink)]/40 line-through">
                              {formatearPrecio(precioDePlan(plan.key, formData.pais), "es")}
                            </span>
                          )}
                          <span className="text-xl sm:text-2xl font-display text-[var(--accent)]">
                            {planPriceLabel(plan.key, formData.pais)}
                          </span>
                          {plan.key === "DIAMOND" && (
                            <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)]">
                              {DIAMOND_DISCOUNT_PERCENTAGE}% OFF
                            </span>
                          )}
                          {plan.key === "PREMIUM" && (
                            <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)]">
                              {PREMIUM_DISCOUNT_PERCENTAGE}% OFF
                            </span>
                          )}
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
                      {plan.features.map((f) => {
                        // LIVE es LA diferencia entre Premium y Diamond -- se
                        // destaca aparte del resto del check-list (que es
                        // igual en ambos) para que quede clarísimo qué es lo
                        // que realmente se paga de más.
                        if (f.startsWith("Con LIVE")) {
                          return (
                            <li
                              key={f}
                              className="!opacity-100 mt-1 -mx-1 px-2.5 py-2 rounded-lg bg-[var(--accent)]/15 border border-[var(--accent)]/40"
                            >
                              <div className="flex items-center gap-1.5 font-semibold text-[var(--accent)]">
                                <Radio className="w-4 h-4 shrink-0" />
                                <span>{f}</span>
                              </div>
                              <p className="text-[11px] font-normal text-[var(--on-ink)]/70 mt-1 leading-snug">
                                Único plan con &ldquo;Modo LIVE&rdquo;: las fotos y mensajes que suben tus invitados se proyectan en pantalla en tiempo real, durante la fiesta.
                              </p>
                            </li>
                          );
                        }
                        return (
                          <li key={f} className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
                            <span>{f}</span>
                          </li>
                        );
                      })}
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
                <div className="flex items-baseline gap-2 flex-wrap justify-end">
                  {appliedDiscount && (
                    <span className="text-sm font-normal text-[var(--on-ink)]/40 line-through">
                      {planPriceLabel(selectedPlan, formData.pais)}
                    </span>
                  )}
                  <p className="text-xl font-display text-[var(--accent)]">
                    {appliedDiscount ? formatPrice(appliedDiscount.amount) : planPriceLabel(selectedPlan, formData.pais)}
                  </p>
                </div>
              </div>

              {selectedPlan !== "FREE" && (
                <div className="mb-6">
                  <Label htmlFor="discountCode" className="flex items-center gap-2 mb-2 opacity-80">
                    <Tag className="w-4 h-4" />
                    Código de descuento (opcional)
                  </Label>
                  {appliedDiscount ? (
                    <div className="flex items-center justify-between gap-2 h-12 px-4 rounded-xl bg-green-500/10 border border-green-500/30">
                      <span className="text-sm text-green-400 font-semibold">
                        {appliedDiscount.code} · {appliedDiscount.percentage}% OFF aplicado
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setAppliedDiscount(null);
                          setDiscountInput("");
                        }}
                        className="text-xs opacity-60 hover:opacity-100 transition-opacity underline"
                      >
                        Quitar
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        id="discountCode"
                        type="text"
                        placeholder="Ej: PROMO30"
                        value={discountInput}
                        onChange={(e) => {
                          setDiscountInput(e.target.value);
                          setDiscountError(null);
                        }}
                        className="w-full bg-[var(--ink-2)] border-none text-[var(--on-ink)] placeholder:text-[var(--shell-fg-faint)] h-12 rounded-xl uppercase"
                      />
                      <Button
                        type="button"
                        onClick={handleApplyDiscountCode}
                        disabled={isValidatingCode || !discountInput.trim()}
                        className="h-12 px-5 rounded-xl bg-[var(--ink-2)] border border-[var(--on-ink)]/20 text-[var(--on-ink)] hover:bg-[var(--ink-2)]/80 shrink-0"
                      >
                        {isValidatingCode ? "..." : "Aplicar"}
                      </Button>
                    </div>
                  )}
                  {discountError && (
                    <p className="text-xs text-red-400 mt-1.5">{discountError}</p>
                  )}
                </div>
              )}

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
                    className="w-full bg-[var(--ink-2)] border-none text-[var(--on-ink)] placeholder:text-[var(--shell-fg-faint)] h-12 rounded-xl"
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
                    className="w-full bg-[var(--ink-2)] border-none text-[var(--on-ink)] placeholder:text-[var(--shell-fg-faint)] h-12 rounded-xl"
                  />
                </div>

                <div>
                  <Label htmlFor="pais" className="flex items-center gap-2 mb-2 opacity-80">
                    <Globe className="w-4 h-4" />
                    País
                  </Label>
                  <SelectorPais
                    id="pais"
                    valor={formData.pais}
                    onCambio={(pais) => {
                      setPaisElegidoAMano(true);
                      recordarPaisElegido(pais);
                      // Se limpia el código de área: cada país lo escribe
                      // distinto y hay tres que no lo usan. Dejarlo cargado
                      // le mete al número dígitos de otro país sin que se
                      // entere.
                      setFormData({ ...formData, pais, phoneAreaCode: "" });
                    }}
                    className="border-none"
                  />
                  <p className="text-xs opacity-50 mt-1.5">
                    Define en qué moneda cobras y qué datos bancarios te vamos a pedir para que tus invitados te transfieran.
                  </p>
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2 opacity-80">
                    <Phone className="w-4 h-4" />
                    Teléfono
                    <span className="font-normal text-[var(--shell-fg-soft)]">(opcional)</span>
                  </Label>
                  {/* El prefijo del país se pone solo y no se escribe: ya lo
                      eligió arriba, y pedírselo de nuevo es pedirle que sepa
                      su propio código internacional.

                      Y el tramo del medio sale del país. No todos tienen
                      "código de área": en México es la lada, en Estados Unidos
                      el area code, y en España, Colombia y Uruguay no existe
                      -- ahí va un solo campo. Ver formatoTelefonico. */}
                  <div
                    className={`grid gap-2 ${formatoTel.etiquetaArea ? "grid-cols-[auto_100px_1fr]" : "grid-cols-[auto_1fr]"}`}
                  >
                    <span
                      className="h-12 px-3 inline-flex items-center rounded-xl bg-[var(--ink-2)] text-[var(--on-ink)]/70 text-sm font-mono select-none"
                      aria-label="Código del país"
                    >
                      {prefijoTelefonico(formData.pais) || "+"}
                    </span>

                    {formatoTel.etiquetaArea && (
                      <Input
                        id="phoneAreaCode"
                        type="tel"
                        inputMode="numeric"
                        placeholder={formatoTel.etiquetaArea}
                        value={formData.phoneAreaCode}
                        onChange={(e) => setFormData({ ...formData, phoneAreaCode: normalizeDigits(e.target.value) })}
                        maxLength={formatoTel.areaMax}
                        className="w-full bg-[var(--ink-2)] border-none text-[var(--on-ink)] placeholder:text-[var(--shell-fg-faint)] h-12 rounded-xl"
                      />
                    )}

                    <Input
                      id="phoneNumber"
                      type="tel"
                      inputMode="numeric"
                      placeholder="Número"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: normalizeDigits(e.target.value) })}
                      maxLength={formatoTel.numeroMax}
                      className="w-full bg-[var(--ink-2)] border-none text-[var(--on-ink)] placeholder:text-[var(--shell-fg-faint)] h-12 rounded-xl"
                    />
                  </div>
                  {/* La ayuda es un ejemplo del país, que se entiende de un
                      vistazo. Lo del 0 y el 15 son trampas argentinas que no
                      existen en ningún otro lado. */}
                  <p className="text-xs opacity-50 mt-1.5">
                    {formData.pais === "AR"
                      ? "Sin el 0 del área ni el 15 del número. Ej. 351 5551234"
                      : formatoTel.ejemplo
                      ? `Ej. ${formatoTel.ejemplo}`
                      : "Sólo dígitos"}
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
                    className="w-full bg-[var(--ink-2)] border-none text-[var(--on-ink)] placeholder:text-[var(--shell-fg-faint)] h-12 rounded-xl"
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
                    className="w-full bg-[var(--ink-2)] border-none text-[var(--on-ink)] placeholder:text-[var(--shell-fg-faint)] h-12 rounded-xl"
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
                    : porMercadoPago
                    ? "Continuar a Mercado Pago"
                    : "Continuar a PayPal"}
                </Button>

                {/* Quién procesa el cobro, con su marca. El visitante está por
                    poner plata en un sitio que no conoce: ver una marca que ya
                    usó le dice que no le está dando la tarjeta a un
                    desconocido. */}
                {selectedPlan !== "FREE" && (
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <span className="text-xs text-muted-foreground">Pago procesado por</span>
                    <LogoDePago marca={porMercadoPago ? "mercadopago" : "paypal"} />
                  </div>
                )}

                {/* PayPal no cobra en pesos colombianos ni uruguayos, así que
                    ahí se muestra el precio local pero la orden va en dólares.
                    Se avisa ANTES de mandarlo al checkout: llegar a PayPal y
                    ver otra moneda sin explicación parece un error o una
                    estafa, y se pierde la venta. */}
                {selectedPlan !== "FREE" && !porMercadoPago && cobraEnOtraMoneda(formData.pais) && (
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    PayPal cobra en dólares:{" "}
                    <strong>
                      {formatearPrecio(
                        precioParaPayPal(selectedPlan as "PREMIUM" | "DIAMOND", formData.pais),
                        "es"
                      )}
                    </strong>
                    . Tu banco lo convierte a tu moneda.
                  </p>
                )}

                {/* Sólo cuando hay algo que pagar: en el plan gratis no hay
                    nada que transferir y sería una distracción. Ya no está
                    limitada a Argentina -- hay una cuenta local por país (ver
                    lib/cobro.ts) --, pero se sigue consultando `medios` porque
                    la lista de cada país es la que manda. */}
                {selectedPlan !== "FREE" && medios.includes("transferencia") && (
                  <PagoPorTransferencia concepto="tu plan" className="mt-1" pais={formData.pais} />
                )}

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
