import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LandingNav } from "@/components/landing/LandingNav";
import { ModelosLazyLoader } from "@/components/modelos/ModelosLazyLoader";
import { ModelosTabs } from "@/components/modelos/ModelosTabs";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

// Landing 100% dinámica: en vez de una lista fija que hay que tocar por
// código cada vez, muestra las invitaciones reales de UNA cuenta de prueba
// dedicada (la que el usuario administra a mano, con el wizard normal,
// logueado en esa cuenta -- no se tocan ni se seedean acá). Se identifica
// por email vía `DEMO_ACCOUNT_EMAIL` -- así cada entorno (local/producción)
// apunta a su propia cuenta sin compartir credenciales ni datos entre sí.
// Ver docs/PLAN_LANDING_MODELOS.md.
//
// Convención de slug (así el dueño de la cuenta controla qué se muestra y en
// qué pestaña, simplemente nombrando la invitación al crearla -- "Nombre del
// evento" empezando con "Modelo XV", "Modelo Boda", "Modelo Evento" o
// "Personalizado" -- sin ningún campo nuevo en la base):
//   - empieza con "modelo-xv-" / "modelo-boda-" / "modelo-evento-" /
//     "personalizado-" → va en la pestaña correspondiente (máx. 8 cada una,
//     las más nuevas)
//   - cualquier otro slug en esa cuenta se ignora (no ensucia la landing si
//     la cuenta de prueba también se usa para probar otras cosas)

const FAMILIA_DISPLAY: Record<string, string> = {
  BONVOYAGE: "Bon Voyage", CHIC: "Chic", CINE: "Cine", CIRCUITO: "Circuito",
  CORPORATE: "Corporate", CRISTAL3D: "Cristal 3D", EDITORIAL: "Editorial",
  ELEGANT: "Elegant", GARDENPARTY: "Garden Party", GOLDENDUSK: "Golden Dusk",
  HOLOGRAMA: "Holograma", INFANTIL: "Infantil", JARDINSEDA: "Jardín Seda",
  LOFTINDUSTRIAL: "Loft Industrial", LUZLUNA: "Luz de Luna", MODERNO: "Moderno",
  NEON: "Neon", NORDICO: "Nórdico", ONIX: "Onix", PETALOS: "Pétalos",
  RIVIERA: "Riviera", SEDA: "Seda",
};

function labelFor(inv: { templateTipo: string; temaColores: string; portadaImagenFondoDesktop: string | null }) {
  const familia = FAMILIA_DISPLAY[inv.templateTipo] ?? inv.templateTipo;
  let colorPrincipal = "";
  try {
    colorPrincipal = JSON.parse(inv.temaColores ?? "{}")?.colorPrincipal ?? "";
  } catch {
    // temaColores mal formado -- no debería pasar, pero no vale la pena
    // romper la landing entera por una tarjeta.
  }
  const colorSpaced = colorPrincipal && colorPrincipal !== "default"
    ? " " + colorPrincipal.replace(/([a-z])([A-Z])/g, "$1 $2")
    : "";
  const hasPhoto = Boolean(inv.portadaImagenFondoDesktop);
  return `${familia}${colorSpaced} ${hasPhoto ? "Cinemático" : "Base"}`;
}

interface ModeloItem {
  slug: string;
  label: string;
}

const EMPTY_MODELOS: { xv: ModeloItem[]; boda: ModeloItem[]; evento: ModeloItem[]; personalizado: ModeloItem[] } = {
  xv: [], boda: [], evento: [], personalizado: [],
};

async function getModelos() {
  const email = process.env.DEMO_ACCOUNT_EMAIL;
  if (!email) return EMPTY_MODELOS;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return EMPTY_MODELOS;

  const invitations = await prisma.invitation.findMany({
    where: {
      userId: user.id,
      OR: [
        { slug: { startsWith: "modelo-xv-" } },
        { slug: { startsWith: "modelo-boda-" } },
        { slug: { startsWith: "modelo-evento-" } },
        { slug: { startsWith: "personalizado-" } },
      ],
    },
    orderBy: { createdAt: "desc" },
    select: { slug: true, templateTipo: true, temaColores: true, portadaImagenFondoDesktop: true },
  });

  const toItems = (prefix: string, max: number) =>
    invitations
      .filter((i) => i.slug.startsWith(prefix))
      .slice(0, max)
      .map((m) => ({ slug: m.slug, label: labelFor(m) }));

  return {
    xv: toItems("modelo-xv-", 8),
    boda: toItems("modelo-boda-", 8),
    evento: toItems("modelo-evento-", 8),
    personalizado: toItems("personalizado-", 8),
  };
}

export default async function ModelosPage() {
  const [session, { xv, boda, evento, personalizado }] = await Promise.all([auth(), getModelos()]);
  const registerUrl = session ? "/dashboard?new=true" : "/register";
  const hasTabbedModelos = xv.length > 0 || boda.length > 0 || evento.length > 0 || personalizado.length > 0;

  return (
    <div className="flex min-h-dvh flex-col items-center bg-[var(--ink)]">
      <div className="landing w-full max-w-[1180px]">
        <LandingNav registerUrl={registerUrl} isLoggedIn={Boolean(session)} />
        <ModelosLazyLoader />

        {/* pt-24 en mobile (no solo pt-14): el nav pasa a position:fixed
            debajo de 767px (ver .l-nav en globals.css) y esta pagina, a
            diferencia de la home (.l-hero ya compensa con 96px), no tenia
            padding-top suficiente -- el kicker "Modelos reales" quedaba
            tapado atras del nav fijo. */}
        <section className="text-center px-6 pt-24 pb-10 md:pt-20 md:pb-14">
          <p className="kicker font-ui mx-auto mb-4">Modelos reales</p>
          <h1 className="text-3xl md:text-5xl font-display font-semibold tracking-tight text-white mb-4">
            Mirá cómo ven la invitación <em className="italic text-[var(--accent)]">tus invitados</em>
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Invitaciones reales, con nombre, salón, mapa y fecha de verdad —
            tocá cualquiera para abrirla completa, tal cual la va a ver cada
            invitado.
          </p>
        </section>

        {hasTabbedModelos ? (
          <section className="px-6 pb-16">
            <ModelosTabs xv={xv} boda={boda} evento={evento} personalizado={personalizado} />
          </section>
        ) : (
          <section className="px-6 pb-16 text-center">
            <p className="text-zinc-500 max-w-md mx-auto">
              Estamos preparando los modelos. Volvé pronto para ver ejemplos
              reales.
            </p>
          </section>
        )}

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
