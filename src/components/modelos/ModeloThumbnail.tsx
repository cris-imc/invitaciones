import Link from "next/link";

interface ModeloThumbnailProps {
  slug: string;
  label: string;
}

// Ancho "real" de telefono que usamos adentro del iframe -- las portadas de
// bienvenida (foto con blur / fondo PNG decorativo) son mobile-only por
// diseño en toda la app (mismo patron que CoverFallbackBg/AnimatedCoverPhoto
// en las 22 familias), asi que el iframe tiene que renderizar en un viewport
// angosto de verdad para que se vean -- no alcanza con achicar la tarjeta
// con CSS si el iframe por dentro sigue siendo ancho de escritorio.
const IFRAME_WIDTH = 390;
const IFRAME_HEIGHT = 844;
const SCALE = 170 / IFRAME_WIDTH;
const BOX_WIDTH = IFRAME_WIDTH * SCALE;
const BOX_HEIGHT = IFRAME_HEIGHT * SCALE;

// Server component puro (sin "use client"): no tiene `src` propio -- lo pone
// ModelosLazyLoader (un solo script chico, compartido por todas las
// miniaturas) con concurrencia limitada, para no competir por conexiones
// con el resto -- con solo 10 miniaturas (2 destacadas + 8) esto ya alcanza
// sin necesitar ir a imagenes estaticas.
export function ModeloThumbnail({ slug, label }: ModeloThumbnailProps) {
  return (
    <Link
      href={`/preview/${slug}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 bg-black"
      style={{ width: BOX_WIDTH }}
    >
      <div className="relative overflow-hidden bg-neutral-900" style={{ width: BOX_WIDTH, height: BOX_HEIGHT }}>
        <iframe
          data-modelo-src={`/preview/${slug}`}
          data-modelo-iframe=""
          title={label}
          width={IFRAME_WIDTH}
          height={IFRAME_HEIGHT}
          tabIndex={-1}
          aria-hidden="true"
          scrolling="no"
          style={{
            width: IFRAME_WIDTH,
            height: IFRAME_HEIGHT,
            border: 0,
            pointerEvents: "none",
            transform: `scale(${SCALE})`,
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
