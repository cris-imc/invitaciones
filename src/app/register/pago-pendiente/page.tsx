import { Clock } from "lucide-react";
import { PaymentResultCard } from "@/components/register/PaymentResultCard";

export default function PagoPendientePage() {
  return (
    <PaymentResultCard
      icon={Clock}
      iconClassName="text-amber-500"
      title="Pago pendiente"
      message="Tu cuenta ya está creada. Si pagaste con Rapipago, Pago Fácil u otro medio en efectivo, puede demorar hasta 2 días hábiles en acreditarse -- te va a aparecer el crédito apenas se confirme."
      ctaHref="/login"
      ctaLabel="Iniciar sesión"
    />
  );
}
