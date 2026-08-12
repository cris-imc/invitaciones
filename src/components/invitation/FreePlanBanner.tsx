import Link from "next/link";

// Alto del banner por breakpoint -- en mobile el texto y el botón se
// apilan en dos líneas (no entran juntos en una fila angosta), en
// desktop van en una sola fila. El spacer usa las mismas clases para
// reservar exactamente ese espacio y que no tape el contenido.
const HEIGHT_CLASSES = "h-[60px] sm:h-11";

// Barra promocional fija (siempre visible, acompaña el scroll) que se
// muestra arriba de las invitaciones del plan Gratis. z-index por
// encima de la portada de los templates (que usan z-[99999]), así se ve
// incluso antes de que el invitado toque "Abrir invitación".
export function FreePlanBanner() {
  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[999999] flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-4 px-3 py-1.5 sm:py-0 ${HEIGHT_CLASSES}`}
      style={{
        background: "var(--ink, #0F1613)",
        borderBottom: "1px solid rgba(246,243,236,0.12)",
      }}
    >
      <span className="text-[11px] sm:text-sm text-center" style={{ color: "#F6F3EC" }}>
        <span className="sm:hidden">Creada gratis en <strong>AltaInvitacion.com</strong></span>
        <span className="hidden sm:inline">🎉 Invitación gratuita creada en <strong>AltaInvitacion.com</strong></span>
      </span>
      <Link
        href="/register?plan=premium"
        className="shrink-0 inline-flex items-center rounded-full px-3 py-1 text-[10px] sm:text-xs font-semibold whitespace-nowrap hover:opacity-90 transition-opacity"
        style={{ background: "#C79A4B", color: "#0F1613" }}
      >
        Creá tu invitación Premium
      </Link>
    </div>
  );
}

// Reserva el espacio del banner para que no tape el inicio de la
// invitación (el banner es fixed, no ocupa lugar en el flujo normal).
export function FreePlanBannerSpacer() {
  return <div className={HEIGHT_CLASSES} />;
}
