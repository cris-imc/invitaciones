import { SelectorIdioma } from "@/components/i18n/SelectorIdioma";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

/**
 * Idioma y tema, arriba a la derecha del panel.
 *
 * IDIOMA SÍ, PAÍS NO, y la diferencia importa:
 *
 * - El IDIOMA es libre. Dónde vivís no dice qué idioma hablás: alguien de
 *   México puede querer el panel en inglés. Arranca en el que sugiere el país
 *   y de ahí en más manda su elección.
 *
 * - El PAÍS es de la cuenta y no se cambia desde acá. De él dependen los
 *   precios, la moneda, los medios de pago y los datos bancarios que pide el
 *   wizard -- una CLABE para México, sin importar en qué idioma esté el
 *   panel. Cambiarlo desde adentro dejaría a alguien con invitaciones ya
 *   publicadas viendo otra moneda y otros campos sin entender por qué. Se
 *   elige en la landing y en el registro.
 *
 * Y el idioma de cada INVITACIÓN es una tercera cosa, que se elige en el
 * wizard: el panel lo ve el anfitrión, la invitación la ven sus invitados.
 */
export function PreferenciasUsuario({ className }: { className?: string }) {
  return (
    <div className={`p-preferencias ${className ?? ""}`}>
      <SelectorIdioma />
      <ThemeToggle />
    </div>
  );
}
