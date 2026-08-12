import Link from "next/link";

// Alto fijo del banner -- se usa acá y en el spacer que reserva el
// espacio para que no tape el contenido de la invitación.
export const FREE_PLAN_BANNER_HEIGHT = 44;

// Barra promocional fija (siempre visible, acompaña el scroll) que se
// muestra arriba de las invitaciones del plan Gratis.
export function FreePlanBanner() {
  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-2 sm:gap-4 px-3"
      style={{
        height: FREE_PLAN_BANNER_HEIGHT,
        background: "var(--ink, #0F1613)",
        borderBottom: "1px solid rgba(246,243,236,0.12)",
      }}
    >
      <span className="truncate text-[11px] sm:text-sm" style={{ color: "#F6F3EC" }}>
        🎉 Invitación gratuita creada en <strong>AltaInvitacion.com</strong>
      </span>
      <Link
        href="/register"
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
  return <div style={{ height: FREE_PLAN_BANNER_HEIGHT }} />;
}
