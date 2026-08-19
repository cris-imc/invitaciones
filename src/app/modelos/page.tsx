import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LandingNav } from "@/components/landing/LandingNav";
import { ModeloThumbnail } from "@/components/modelos/ModeloThumbnail";
import { auth } from "@/auth";

// Las 18 invitaciones reales que arma esta landing viven en la cuenta de
// prueba (ver docs/PLAN_LANDING_MODELOS.md para el detalle completo: familia,
// color, tipo de evento, si lleva foto o fondo PNG, y por qué). Esta lista es
// la única fuente de verdad de qué se muestra acá -- si se agrega o saca un
// modelo, se edita solo esta lista.
const FEATURED = [
  { slug: "modelo-tematico-river", label: "Hinchada de River" },
  { slug: "modelo-tematico-tini", label: "Fan de Tini" },
];

const MODELOS = [
  { slug: "modelo-onix-zafiro", label: "Onix Zafiro Base" },
  { slug: "modelo-riviera-azulejo", label: "Riviera Azulejo Cinemático" },
  { slug: "modelo-chic-rosa", label: "Chic Rosa Cinemático" },
  { slug: "modelo-chic-azul", label: "Chic Azul Base" },
  { slug: "modelo-moderno-verde", label: "Moderno Verde Cinemático" },
  { slug: "modelo-moderno-rojo", label: "Moderno Rojo Base" },
  { slug: "modelo-neon-violeta", label: "Neon Violeta Cinemático" },
  { slug: "modelo-nordico-marino", label: "Nórdico Marino Base" },
  { slug: "modelo-petalos-rosapastel", label: "Pétalos Rosa Pastel Cinemático" },
  { slug: "modelo-goldendusk-rosaantiguo", label: "Golden Dusk Rosa Antiguo Base" },
  { slug: "modelo-holograma-esmeralda", label: "Holograma Esmeralda Cinemático" },
  { slug: "modelo-seda-marfil", label: "Seda Marfil Base" },
  { slug: "modelo-cristal3d-violeta", label: "Cristal 3D Violeta Cinemático" },
  { slug: "modelo-elegant-darkyellow", label: "Elegant Amarillo Cinemático" },
  { slug: "modelo-circuito-rojo", label: "Circuito Rojo Cinemático" },
  { slug: "modelo-luzluna-perlada", label: "Luz de Luna Perlada Cinemático" },
];

export default async function ModelosPage() {
  const session = await auth();
  const registerUrl = session ? "/dashboard?new=true" : "/register";

  return (
    <div className="flex min-h-dvh flex-col items-center bg-[var(--ink)]">
      <div className="landing w-full max-w-[1180px]">
        <LandingNav registerUrl={registerUrl} isLoggedIn={Boolean(session)} />

        <section className="text-center px-6 pt-14 pb-10 md:pt-20 md:pb-14">
          <p className="kicker font-ui mx-auto mb-4">Modelos reales</p>
          <h1 className="text-3xl md:text-5xl font-display font-semibold tracking-tight text-white mb-4">
            Mirá cómo quedan tus invitados
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            18 invitaciones reales, con nombre, salón, mapa y fecha de verdad —
            tocá cualquiera para abrirla completa, tal cual la va a ver cada
            invitado.
          </p>
        </section>

        {/* Destacadas: mismo template (Bon Voyage) con una foto tematica en
            vez de la pareja/festejada -- vende que se puede personalizar con
            CUALQUIER imagen. */}
        <section className="px-6 pb-14">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-display font-semibold text-white mb-2">
              Personalizá tu tarjeta
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto">
              La foto de portada puede ser lo que quieras: tu club, tu artista
              favorito, o cualquier imagen que te represente.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {FEATURED.map((m) => (
              <ModeloThumbnail key={m.slug} slug={m.slug} label={m.label} featured />
            ))}
          </div>
        </section>

        <section className="px-6 pb-16">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-8 justify-items-center">
            {MODELOS.map((m) => (
              <ModeloThumbnail key={m.slug} slug={m.slug} label={m.label} />
            ))}
          </div>
        </section>

        <section className="text-center px-6 pb-20">
          <Link href={registerUrl}>
            <Button className="rounded-full bg-[var(--accent)] text-[var(--ink)] transition-all duration-200 hover:bg-[var(--accent)]/90 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[var(--accent)]/20 px-8 py-6 text-base font-ui">
              Crear mi invitación
            </Button>
          </Link>
        </section>
      </div>
    </div>
  );
}
