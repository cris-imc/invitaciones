import Link from "next/link";

/**
 * Isologotipo de "altainvitacion.com" (Manual de Marca v1.0, Agosto 2026).
 * El isotipo ("el moño") son las cuatro esquinas de un sobre desplegado,
 * unidas al punto central donde se pliega -- el mismo cruce de líneas, leído
 * de otra forma, es un moño de frac. Path SVG tomado tal cual del manual.
 *
 * En mobile se muestra solo el isotipo, en el dorado/acento de la marca
 * (--accent, que ya coincide con el "Oro #C79A4B" del manual) -- en desktop,
 * isotipo + wordmark completo.
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
  color = "paper",
  mobileIconColor = "accent",
  className,
}: {
  href?: string;
  color?: LogoColor;
  mobileIconColor?: LogoColor;
  className?: string;
}) {
  const wordmarkColor = COLOR_VALUES[color];

  const content = (
    <>
      {/* Mobile: solo isotipo, en el color de acento de la marca */}
      <Isotype color={mobileIconColor} className="w-6 h-6 md:hidden" />

      {/* Desktop/tablet: isotipo + wordmark completo */}
      <span className="hidden md:flex items-center gap-2.5">
        <Isotype color={color} className="w-5 h-5 shrink-0" />
        <span
          className="leading-none whitespace-nowrap"
          style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 15, color: wordmarkColor }}
        >
          <span style={{ fontWeight: 600 }}>alta</span>
          <span style={{ fontWeight: 300 }}>invitacion</span>
          <span style={{ fontWeight: 300, color: "var(--accent, #C79A4B)" }}>.com</span>
        </span>
      </span>
    </>
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
