import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const plans = [
    {
        name: "Básico",
        price: "Gratis",
        description: "Ideal para eventos pequeños y pruebas.",
        features: [
            "Hasta 50 invitados",
            "Diseño estándar",
            "RSVP básico",
            "Cuenta regresiva",
            "Mapa del evento"
        ],
        cta: "Comenzar Gratis",
        variant: "outline" as const,
    },
    {
        name: "Premium",
        price: "$2.500",
        description: "La experiencia completa para tu fiesta.",
        features: [
            "Invitados ilimitados",
            "Álbum de fotos colaborativo",
            "Cuestionarios interactivos",
            "Música personalizada",
            "Sin marca de agua",
            "Soporte prioritario"
        ],
        cta: "Elegir Premium",
        variant: "default" as const,
        popular: true,
    },
    {
        name: "Enterprise",
        price: "$5.000",
        description: "Para eventos que requieren perfección.",
        features: [
            "Todo lo de Premium",
            "Diseño 100% a medida",
            "Asignación de mesas",
            "QR únicos por invitado",
            "Recordatorios por WhatsApp",
            "Asesor dedicado"
        ],
        cta: "Contactar Ventas",
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`relative flex flex-col p-6 bg-card border rounded-2xl shadow-sm ${plan.popular ? 'border-primary ring-2 ring-primary/20 scale-105 shadow-xl' : 'border-border'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                                    <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                        Más Popular
                                    </span>
                                </div>
                            )}

                            <div className="mb-5">
                                <h3 className="text-xl font-bold">{plan.name}</h3>
                                <div className="mt-2 flex items-baseline text-3xl font-bold">
                                    {plan.price}
                                    {plan.price !== "Gratis" && <span className="ml-1 text-sm font-normal text-muted-foreground">/evento</span>}
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                            </div>

                            <ul className="flex-1 space-y-3 mb-6">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center text-sm">
                                        <Check className="w-4 h-4 mr-2 text-green-500" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Button className="w-full" variant={plan.variant}>
                                {plan.cta}
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
