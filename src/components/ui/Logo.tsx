import Link from "next/link";

/**
 * Isologotipo de "altainvitacion.com" (Manual de Marca v1.0, Agosto 2026).
 * El isotipo ("el moño") son las cuatro esquinas de un sobre desplegado,
 * unidas al punto central donde se pliega -- el mismo cruce de líneas, leído
 * de otra forma, es un moño de frac. Path SVG tomado tal cual del manual.
 *
 * Isotipo + wordmark completo en todos los tamaños de pantalla (el icono
 * siempre dorado, --accent, que ya coincide con el "Oro #C79A4B" del
 * manual) -- mas chico en mobile, mas grande en desktop, via clases
 * responsive, sin ocultar ninguna parte.
 */
const ISOTYPE_PATH =
  "M15 20 Q5 50 15 80 L47 53 Q50 50 47 47 Z M85 20 Q95 50 85 80 L53 53 Q50 50 53 47 Z";

type LogoColor = "paper" | "ink" | "accent";

const COLOR_VALUES: Record<LogoColor, string> = {
  paper: "#F6F3EC",
  ink: "#0F1613",
  accent: "var(--accent, #C79A4B)",
};

function Isotype({ color, className }: { color: LogoColor; className?: string }) {
  const fill = COLOR_VALUES[color];
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      stroke={fill}
      strokeWidth={4}
      aria-hidden="true"
    >
      <path d={ISOTYPE_PATH} strokeLinejoin="round" strokeLinecap="round" />
      <rect x="46" y="43" width="8" height="14" rx="2" fill={fill} stroke="none" />
    </svg>
  );
}

export function Logo({
  href = "/",
  wordmarkColor = "paper",
  className,
}: {
  href?: string;
  /** Color de "altainvitacion" (el ".com" y el isotipo siempre van dorados). */
  wordmarkColor?: LogoColor;
  className?: string;
}) {
  const textColor = COLOR_VALUES[wordmarkColor];

  // Todo en una sola fila horizontal, siempre completo: isotipo (dorado) —
  // altainvitacion (color a elección, blanco por default) — .com (dorado).
  // Mas chico en mobile, mas grande en desktop, via clases responsive.
  const content = (
    <span className="flex items-center gap-2 md:gap-2.5">
      <Isotype color="accent" className="w-5 h-5 md:w-6 md:h-6 shrink-0" />
      <span
        className="leading-none whitespace-nowrap text-[14px] md:text-[17px]"
        style={{ fontFamily: "var(--font-fraunces), serif", color: textColor }}
      >
        <span style={{ fontWeight: 600 }}>alta</span>
        <span style={{ fontWeight: 300 }}>invitacion</span>
        <span style={{ fontWeight: 300, color: "var(--accent, #C79A4B)" }}>.com</span>
      </span>
    </span>
  );

  const wrapperClassName = className ? `flex items-center ${className}` : "flex items-center";

  if (!href) {
    return <span className={wrapperClassName}>{content}</span>;
  }

  return (
    <Link href={href} className={`${wrapperClassName} hover:opacity-80 transition-opacity`}>
      {content}
    </Link>
  );
}

/**
 * Credito de marca al pie de cada invitación (solo mobile): "Hecho con amor
 * por" + isologotipo completo horizontal. En desktop no se muestra --
 * pensado para la version mobile de la tarjeta, que es la que ve casi todo
 * invitado real.
 */
export function LogoFooterCredit({ className }: { className?: string }) {
  // Va en el pie de cada invitación, que cambia de sección/fondo segun la
  // plantilla (a veces oscuro, a veces claro) -- por eso lleva su propio
  // fondo tinta + texto papel, con contraste garantizado sin importar
  // sobre que seccion caiga.
  return (
    <div className={`md:hidden flex justify-center py-8 ${className ?? ""}`}>
      <div
        className="flex flex-col items-center gap-2 px-5 py-4 rounded-2xl"
        style={{ backgroundColor: "#0F1613" }}
      >
        <span
          className="text-[10px] uppercase tracking-[0.15em]"
          style={{ fontFamily: "var(--font-inter), sans-serif", color: "#F6F3EC", opacity: 0.6 }}
        >
          Hecho con amor por
        </span>
        <span className="flex items-center gap-2">
          <Isotype color="accent" className="w-5 h-5 shrink-0" />
          <span
            className="leading-none whitespace-nowrap"
            style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 15, color: "#F6F3EC" }}
          >
            <span style={{ fontWeight: 600 }}>alta</span>
            <span style={{ fontWeight: 300 }}>invitacion</span>
            <span style={{ fontWeight: 300, color: "var(--accent, #C79A4B)" }}>.com</span>
          </span>
        </span>
      </div>
    </div>
  );
}
