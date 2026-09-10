import { SelectorPais } from "@/components/i18n/SelectorPais";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

/**
 * País y tema, juntos, para la barra superior del panel.
 *
 * País y no idioma: el idioma sale del país (Brasil en portugués, Estados
 * Unidos en inglés, el resto en español), y el país además decide los medios
 * de pago, la moneda de los precios y qué funciones tiene sentido ofrecer.
 * Preguntar las dos cosas por separado sería preguntar dos veces lo mismo.
 *
 * Van juntos porque son lo mismo: preferencias de quien mira, no acciones del
 * producto. Sueltos y separados se leen como dos opciones más del menú.
 *
 * Se muestra en dos lugares y nunca en los dos a la vez: acá, en la barra
 * superior de las páginas que tienen una, y en el sidebar para las que no
 * (ver .sidebar-preferencias en globals.css, que se apaga sola con :has()
 * cuando la página trae barra superior).
 */
export function PreferenciasUsuario({ className }: { className?: string }) {
  return (
    <div className={`p-preferencias ${className ?? ""}`}>
      <SelectorPais />
      <ThemeToggle />
    </div>
  );
}
