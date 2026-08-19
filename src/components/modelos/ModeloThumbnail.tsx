import Link from "next/link";

interface ModeloThumbnailProps {
  slug: string;
  label: string;
  /** Featured = las 2 destacadas arriba de todo, un poco mas grandes. */
  featured?: boolean;
}

// Ancho "real" de telefono que usamos adentro del iframe -- las portadas de
// bienvenida (foto con blur / fondo PNG decorativo) son mobile-only por
// diseño en toda la app (mismo patron que CoverFallbackBg/AnimatedCoverPhoto
// en las 22 familias), asi que el iframe tiene que renderizar en un viewport
// angosto de verdad para que se vean -- no alcanza con achicar la tarjeta
// con CSS si el iframe por dentro sigue siendo ancho de escritorio.
const IFRAME_WIDTH = 390;
const IFRAME_HEIGHT = 844;

// Server component puro (sin "use client"): el iframe usa `loading="lazy"`
// nativo del browser para no cargar las 18 miniaturas de una -- se evitó a
// propósito un IntersectionObserver a mano acá.
export function ModeloThumbnail({ slug, label, featured = false }: ModeloThumbnailProps) {
  const scale = featured ? 260 / IFRAME_WIDTH : 170 / IFRAME_WIDTH;
  const boxWidth = IFRAME_WIDTH * scale;
  const boxHeight = IFRAME_HEIGHT * scale;

  return (
    <Link
      href={`/preview/${slug}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 bg-black"
      style={{ width: boxWidth }}
    >
      <div className="relative overflow-hidden bg-neutral-900" style={{ width: boxWidth, height: boxHeight }}>
        <iframe
          src={`/preview/${slug}`}
          title={label}
          width={IFRAME_WIDTH}
          height={IFRAME_HEIGHT}
          loading="lazy"
          tabIndex={-1}
          aria-hidden="true"
          scrolling="no"
          style={{
            width: IFRAME_WIDTH,
            height: IFRAME_HEIGHT,
            border: 0,
            pointerEvents: "none",
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        />
        <div className="absolute inset-0 ring-1 ring-inset ring-white/10 group-hover:ring-white/25 transition-all" />
      </div>
      <div className="px-3 py-2.5 bg-[#15131B] text-center">
        <span className="text-[11px] sm:text-xs font-medium tracking-wide text-[#F6F3EC]">
          {label}
        </span>
      </div>
    </Link>
  );
}
