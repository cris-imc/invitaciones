import type { CodigoPais } from "@/lib/paises";

/**
 * Banderitas dibujadas en SVG, no emoji.
 *
 * Windows no trae la fuente de banderas: el emoji 🇦🇷 se ve como las dos
 * letras "AR" en Chrome sobre Windows, que es justo donde se prueba esto. Un
 * SVG se ve igual en todos lados y a 16 píxeles no necesita el detalle fino
 * de cada escudo -- alcanza con los colores y la forma para reconocerla.
 *
 * Todas en 24x16 (3:2) para que entren parejas en una lista.
 */

const SOL = "#F6B40E";

const BANDERAS: Record<CodigoPais, React.ReactNode> = {
  AR: (
    <>
      <rect width="24" height="16" fill="#74ACDF" />
      <rect y="5.33" width="24" height="5.33" fill="#fff" />
      <circle cx="12" cy="8" r="1.6" fill={SOL} />
    </>
  ),
  CL: (
    <>
      <rect width="24" height="16" fill="#fff" />
      <rect y="8" width="24" height="8" fill="#D52B1E" />
      <rect width="8" height="8" fill="#0039A6" />
      <path d="M4 2.2l.8 2.4h2.5l-2 1.5.8 2.4L4 7l-2.1 1.5.8-2.4-2-1.5h2.5z" fill="#fff" />
    </>
  ),
  UY: (
    <>
      <rect width="24" height="16" fill="#fff" />
      <rect y="2.2" width="24" height="2.2" fill="#0038A8" />
      <rect y="6.6" width="24" height="2.2" fill="#0038A8" />
      <rect y="11" width="24" height="2.2" fill="#0038A8" />
      <rect width="9" height="8.8" fill="#fff" />
      <circle cx="4.5" cy="4.4" r="2" fill={SOL} />
    </>
  ),
  BR: (
    <>
      <rect width="24" height="16" fill="#009C3B" />
      <path d="M12 2l9.5 6L12 14 2.5 8z" fill="#FFDF00" />
      <circle cx="12" cy="8" r="3.4" fill="#002776" />
    </>
  ),
  CO: (
    <>
      <rect width="24" height="16" fill="#FCD116" />
      <rect y="8" width="24" height="4" fill="#003893" />
      <rect y="12" width="24" height="4" fill="#CE1126" />
    </>
  ),
  MX: (
    <>
      <rect width="24" height="16" fill="#fff" />
      <rect width="8" height="16" fill="#006847" />
      <rect x="16" width="8" height="16" fill="#CE1126" />
      <circle cx="12" cy="8" r="2" fill="none" stroke="#8B5A2B" strokeWidth="1.2" />
    </>
  ),
  US: (
    <>
      <rect width="24" height="16" fill="#fff" />
      {[0, 2, 4, 6].map((i) => (
        <rect key={i} y={i * 2.46} width="24" height="1.23" fill="#B22234" />
      ))}
      {[1, 3, 5, 7].map((i) => (
        <rect key={i} y={i * 2.46 - 1.23} width="24" height="1.23" fill="#B22234" />
      ))}
      <rect width="10" height="8.6" fill="#3C3B6E" />
    </>
  ),
};

export function BanderaPais({ pais, className }: { pais: CodigoPais; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 16"
      className={className}
      aria-hidden="true"
      style={{ borderRadius: 2, display: "block" }}
    >
      {BANDERAS[pais]}
      {/* Un filete tenue: sin él, la parte blanca de varias banderas se pierde
          contra el fondo claro del menú. */}
      <rect width="24" height="16" fill="none" stroke="rgba(0,0,0,.25)" strokeWidth="1" rx="2" />
    </svg>
  );
}
