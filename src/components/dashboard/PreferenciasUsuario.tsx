import { ThemeToggle } from "@/components/theme/ThemeToggle";

/**
 * Las preferencias de quien mira, en la barra superior del panel.
 *
 * SÓLO EL TEMA. El país no se cambia desde adentro del panel a propósito: si
 * la cuenta es argentina, el panel es argentino -- precios en pesos, cuotas,
 * CBU. Poder cambiarlo acá dejaría a alguien con invitaciones ya creadas
 * viendo precios en dólares y campos bancarios de otro país sin entender por
 * qué. El país se elige en la landing y en el registro, y de ahí en más manda
 * la cuenta.
 *
 * El idioma tampoco: sale del país de la cuenta.
 */
export function PreferenciasUsuario({ className }: { className?: string }) {
  return (
    <div className={`p-preferencias ${className ?? ""}`}>
      <ThemeToggle />
    </div>
  );
}
