import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { PLAN_LIMITS, formatPrice } from "@/lib/plan-limits";

const DIAMOND_DISCOUNT_PRICE = Math.round(PLAN_LIMITS.DIAMOND.price * 0.8);

const WHATSAPP_ENTERPRISE_URL = `https://wa.me/5493517660000?text=${encodeURIComponent(
    "Hola, me interesa el plan Enterprise de Alta Invitación"
)}`;

const plans = [
    {
        key: "FREE",
        name: "Gratis",
        price: "Gratis",
        description: "Ideal para eventos pequeños y pruebas.",
        features: [
            "Hasta 20 invitados",
            "Plantilla 100% personalizada",
            "Gestión de invitados y pagos",
            "Cuenta regresiva",
            `Hasta ${PLAN_LIMITS.FREE.maxPhotos} fotos en el álbum`,
            "Sin musica de fondo",
            "Sin LIVE (fotos transmitidas en vivo)",
            "Sin Trivia",
            "Sin sugerencias de musica para el DJ",
        ],
        cta: "Crear cuenta gratis",
        href: "/register",
        variant: "outline" as const,
    },
    {
        key: "PREMIUM",
        name: "Premium",
        price: formatPrice(PLAN_LIMITS.PREMIUM.price),
        description: "La experiencia completa para tu fiesta.",
        features: [
            "Invitados ilimitados",
            "Plantilla 100% personalizada",
            "Gestión de invitados y pagos",
            "Cuenta regresiva",
            `Hasta ${PLAN_LIMITS.PREMIUM.maxPhotos} fotos en el álbum`,
            "Con musica de fondo",
            "Con Trivia",
            "Con sugerencias de musica para el DJ",
        ],
        note: "Sin función Live",
        cta: "Elegir Premium",
        href: "/register?plan=premium",
        variant: "outline" as const,
    },
    {
        key: "DIAMOND",
        name: "Diamond",
        price: formatPrice(DIAMOND_DISCOUNT_PRICE),
        strikethroughPrice: formatPrice(PLAN_LIMITS.DIAMOND.price),
        description: "Todo Premium, más el Modo Live para tu evento.",
        features: [
            "Invitados ilimitados",
            "Plantilla 100% personalizada",
            "Gestión de invitados y pagos",
            "Cuenta regresiva",
            `Hasta ${PLAN_LIMITS.DIAMOND.maxPhotos} fotos en el álbum`,
            "Con musica de fondo",
            `Con LIVE (hasta ${PLAN_LIMITS.DIAMOND.maxLivePhotos} fotos)`,
            "Con Trivia",
            "Con sugerencias de musica para el DJ",
        ],
        cta: "Elegir Diamond",
        href: "/register?plan=diamond",
        variant: "default" as const,
        popular: true,
    },
    {
        key: "ENTERPRISE",
        name: "Enterprise",
        price: "Precio a consultar",
        description: "Diseño de plantilla a medida para tu empresa o evento.",
        features: [
            "Todo lo de Diamond",
            "Diseño 100% a medida",
            "Asignación de mesas",
            "QR únicos por invitado",
            "Recordatorios por WhatsApp",
            "Asesor dedicado",
        ],
        cta: "Consultar",
        href: WHATSAPP_ENTERPRISE_URL,
        external: true,
        variant: "outline" as const,
    },
];

export function Pricing() {
    return (
        <section id="pricing" className="py-20 bg-background">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                    <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                        Planes y Precios
                    </div>
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                        Elige el plan perfecto para ti
                    </h2>
                    <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                        Sin costos ocultos. Comienza gratis y mejora cuando lo necesites.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto items-stretch">
                    {plans.map((plan) => (
                        <div
                            key={plan.key}
                            className={`relative flex flex-col p-6 bg-card border rounded-2xl shadow-sm ${
                                plan.popular
                                    ? "border-primary ring-2 ring-primary/30 lg:scale-105 shadow-xl"
                                    : "border-border"
                            }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                                    <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" />
                                        Recomendado
                                    </span>
                                </div>
                            )}

                            <div className="mb-5">
                                <h3 className="text-xl font-bold">{plan.name}</h3>
                                <div className="mt-2 flex items-baseline gap-2 flex-wrap text-3xl font-bold">
                                    {plan.strikethroughPrice && (
                                        <span className="text-lg font-normal text-muted-foreground line-through">
                                            {plan.strikethroughPrice}
                                        </span>
                                    )}
                                    <span>{plan.price}</span>
                                    {plan.price !== "Gratis" && plan.price !== "Precio a consultar" && (
                                        <span className="text-sm font-normal text-muted-foreground">/evento</span>
                                    )}
                                </div>
                                {plan.strikethroughPrice && (
                                    <p className="mt-1 text-xs font-semibold text-primary">20% OFF</p>
                                )}
                                <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                            </div>

                            <ul className="flex-1 space-y-3 mb-6">
                                {plan.features.map((feature, i) => {
                                    const isNegative = feature.startsWith("Sin ") && plan.key === "FREE";
                                    return (
                                        <li key={i} className={`flex items-center text-sm ${isNegative ? "opacity-50" : ""}`}>
                                            {isNegative ? (
                                                <span className="text-red-400 font-bold px-1 mr-1">✕</span>
                                            ) : (
                                                <Check className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
                                            )}
                                            {feature}
                                        </li>
                                    );
                                })}
                                {plan.note && (
                                    <li className="flex items-center text-sm opacity-70">
                                        <span className="text-red-400 font-bold px-1 mr-1">✕</span>
                                        {plan.note}
                                    </li>
                                )}
                            </ul>

                            <Button className="w-full" variant={plan.variant} asChild>
                                <Link
                                    href={plan.href}
                                    target={plan.external ? "_blank" : undefined}
                                    rel={plan.external ? "noopener noreferrer" : undefined}
                                >
                                    {plan.cta}
                                </Link>
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
