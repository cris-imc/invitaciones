import { CheckCircle2 } from "lucide-react";
import { PaymentResultCard } from "@/components/register/PaymentResultCard";

export default function PagoExitosoPage() {
  return (
    <PaymentResultCard
      icon={CheckCircle2}
      iconClassName="text-green-500"
      title="¡Pago aprobado!"
      message="Tu pago fue aprobado. En unos segundos vas a ver tu crédito acreditado en la cuenta -- iniciá sesión para continuar."
      ctaHref="/login"
      ctaLabel="Iniciar sesión"
    />
  );
}
