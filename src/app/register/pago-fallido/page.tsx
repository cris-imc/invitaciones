import { XCircle } from "lucide-react";
import { PaymentResultCard } from "@/components/register/PaymentResultCard";

const WHATSAPP_URL = `https://wa.me/5493517660000?text=${encodeURIComponent(
  "Hola, mi pago de Mercado Pago no se completó al registrarme y quiero terminar de pagar mi membresía"
)}`;

export default function PagoFallidoPage() {
  return (
    <PaymentResultCard
      icon={XCircle}
      iconClassName="text-red-500"
      title="El pago no se completó"
      message="Tu cuenta ya está creada como Gratis, sin crédito. Iniciá sesión para seguir usándola, y escribinos por WhatsApp si querés completar el pago."
      ctaHref="/login"
      ctaLabel="Iniciar sesión"
      secondaryHref={WHATSAPP_URL}
      secondaryLabel="Completar el pago por WhatsApp →"
    />
  );
}
