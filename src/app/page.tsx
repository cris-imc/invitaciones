import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { AnimatedHeroText } from "@/components/landing/AnimatedHeroText";
import { TemplateShowcase } from "@/components/landing/TemplateShowcase";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingLogo } from "@/components/ui/Logo";
import { HeroFondoFiesta } from "@/components/landing/HeroFondoFiesta";
import { Settings2, Users, Radio, CalendarDays, MapPin, ListChecks, Gift, Images, Music, MessageCircleHeart, Rss, Armchair, ScanLine, Eye, Clock } from "lucide-react";
import { auth } from "@/auth";
import { PLAN_LIMITS, formatPrice, PREMIUM_DISCOUNT_PRICE, DIAMOND_DISCOUNT_PRICE, PREMIUM_DISCOUNT_PERCENTAGE, DIAMOND_DISCOUNT_PERCENTAGE } from "@/lib/plan-limits";
import { textosDelAnfitrion } from "@/lib/i18n/servidor";
import type { ClaveTexto } from "@/lib/i18n/texto";
import { headers } from "next/headers";
import { paisSegunCabeceras } from "@/lib/pais-visitante";
import { costumbresDeVisitante } from "@/lib/costumbres-por-pais";
import { precioDePlan, precioConDescuento, formatearPrecio, cobraEnOtraMoneda, precioParaPayPal } from "@/lib/precios-por-pais";
import { idiomaDelAnfitrion } from "@/lib/i18n/servidor";
import { urlDeInvitacionDeEjemplo } from "@/lib/invitacion-de-ejemplo";


// El orden de las preguntas es el de la sección: las claves viven en el
// diccionario (landing.faq) y acá sólo se dice cuáles se muestran y en qué
// orden.
const FAQ_CLAVES = [
  "sinDiseno",
  "proceso",
  "editar",
  "compartir",
  "limite",
  "planes",
  "cambiarPlan",
  "celular",
  "otrosEventos",
  "costoGratis",
  "cantidadConfirmada",
] as const;

export default async function Home() {
  const session = await auth();
  const t = await textosDelAnfitrion();

  // De qué país es quien mira, para no prometerle cosas que en su país no
  // existen. Ante la duda no se promete nada: prometer de menos se corrige
  // cuando se registra y dice de dónde es; prometer de más se descubre en
  // el checkout, que es el peor momento posible.
  const cabeceras = await headers();
  const paisVisitante = paisSegunCabeceras((n) => cabeceras.get(n));
  const costumbres = costumbresDeVisitante(paisVisitante);
  const cuotas = costumbres.cuotasSinInteres;
  // PayPal tiene una lista cerrada de monedas y no están ni el peso
  // colombiano ni el uruguayo: a esos países se les cobra en dólares. El
  // precio que ven ya iguala a ese monto, pero el asterisco lo aclara --
  // llegar al checkout y ver otra moneda sin explicación parece un error.
  const enDolares =
    !costumbres.mediosDePago.includes("mercadopago") && cobraEnOtraMoneda(paisVisitante);

  // Pesos en Argentina, dólares en el resto. No es una conversión: son
  // precios propios, para que el precio internacional no quede atado a la
  // inflación argentina ni cambie de número todos los días (ver
  // precios-por-pais.ts).
  const idioma = await idiomaDelAnfitrion();
  const precio = (valor: Parameters<typeof formatearPrecio>[0]) => formatearPrecio(valor, idioma);
  // "Empezar gratis"/"Crear cuenta gratis": para un visitante sin cuenta va
  // directo al wizard (/dashboard/invitaciones/crear) sin pasar por
  // /register antes -- ni esa ruta ni el layout de /dashboard exigen sesión
  // (Sidebar.tsx se ve casi igual sin cuenta, solo oculta lo que depende de
  // una). Recién al terminar el wizard y tocar "Crear invitación" se le pide
  // crear la cuenta (ver StepInfoAdicional.tsx). Con sesión ya iniciada,
  // sigue yendo directo ahí también, mostrando primero el diálogo de
  // gratis/premium/diamond de siempre (?new=true).
  const registerUrl = session ? "/dashboard?new=true" : "/dashboard/invitaciones/crear";
  const premiumUrl = session ? "/dashboard?new=true&plan=premium" : "/register?plan=premium";
  const diamondUrl = session ? "/dashboard?new=true&plan=diamond" : "/register?plan=diamond";
  const premiumConDescuento = precioConDescuento("PREMIUM", paisVisitante);
  const diamondConDescuento = precioConDescuento("DIAMOND", paisVisitante);
  const whatsappEnterpriseUrl = `https://wa.me/5493517660000?text=${encodeURIComponent(
    t("landing.planes.enterprise.whatsapp")
  )}`;
  // La invitación que se muestra al tocar "Ver una invitación real". Sale de
  // la base y ya no de una URL escrita a mano: la que había apuntaba a una
  // invitación del plan Gratis -- con el cartel arriba y sin música ni trivia
  // -- y encima llevaba el token personal de un invitado de verdad, que es el
  // secreto con el que cualquiera puede confirmar en su nombre. Ver
  // invitacion-de-ejemplo.ts.
  const ejemploRealUrl = await urlDeInvitacionDeEjemplo();
  return (
    // PRUEBA (revertir = volver a `items-center justify-center ... p-0 md:p-6`):
    // el md:p-6 dejaba aire alrededor de la tarjeta, y el centrado vertical
    // sólo tenía sentido con ese marco. Sin él la página arranca pegada arriba
    // y ocupa todo el ancho.
    <div className="flex min-h-dvh justify-center bg-[var(--ink)]">
      {/* Sin max-width acá: el límite pasó al contenido de cada sección
          (ver `.landing > section > *` en globals.css), así las bandas de
          fondo y el fondo animado del hero llegan hasta el borde de la
          pantalla en vez de cortarse a 1180px. */}
      <div className="landing w-full">
        {/* NAV */}
        <LandingNav registerUrl={registerUrl} isLoggedIn={Boolean(session)} />

        <section className="l-hero">
          <HeroFondoFiesta />
          <AnimatedHeroText />
          <div className="l-hero-ctas font-ui">
            <Link href={registerUrl}>
              {/* El botón de empezar es el que tiene que llevarse la mirada:
                  más grande que el resto de la página y con sombra propia. */}
              <Button className="rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] font-semibold text-base px-9 py-6 shadow-lg shadow-[var(--accent)]/25 transition-all duration-200 hover:bg-[var(--accent)]/90 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[var(--accent)]/35 font-ui">
                {t("landing.empezarGratis")}
              </Button>
            </Link>
            {/* Ingresar baja a link de texto: es para quien ya es cliente, no
                compite con la acción que importa. */}
            <Link
              href="/dashboard"
              className="text-sm text-[var(--shell-fg-mid)] underline underline-offset-4 decoration-[var(--tinte-4)] transition-colors hover:text-[var(--foreground)] hover:decoration-[var(--foreground)]/60 font-ui"
            >
              {t("landing.yaTengoCuenta")}
            </Link>
          </div>
          <p className="mt-5 text-xs sm:text-sm text-[var(--shell-fg-soft)] font-ui tracking-wide">
            {t("landing.gratisParaEmpezar")}
          </p>
          {/* Cuánto sale, arriba de todo. Hasta ahora había que bajar hasta la
              sección de planes para saber el precio, y mucha gente no baja: se
              va sin saber si esto cuesta mil o cien mil.

              Sale del precio del país del visitante, el mismo que va a ver más
              abajo y el mismo que va a pagar -- no de una constante en pesos
              argentinos, que a un colombiano le diría cualquier cosa.

              Es un link a los planes y no un texto suelto: quien mira el
              precio quiere ver qué incluye, y de paso ahí está la aclaración
              de en qué moneda se cobra, que acá arriba sería ruido. */}
          <a
            href="#precios"
            className="mt-1 block text-xs sm:text-sm text-[var(--shell-fg-mid)] font-ui tracking-wide underline underline-offset-4 decoration-[var(--tinte-4)] transition-colors hover:text-[var(--foreground)] hover:decoration-[var(--foreground)]/60"
          >
            {t("landing.planesDesde", { precio: precio(premiumConDescuento) })}
          </a>
          {/* En píldora y no como una línea más de texto: las cuotas sin
              interés son de las pocas cosas que se comparan de un vistazo
              contra la competencia, y suelta entre otras frases grises no se
              ve.

              Sólo donde existen: es una campaña de Mercado Pago Argentina.
              Mostrárselo a un colombiano es prometerle una forma de pago que
              no va a estar cuando llegue al checkout. */}
          {cuotas && (
            <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/45 bg-[var(--accent)]/10 px-4 py-2 text-xs sm:text-sm font-ui font-semibold tracking-wide text-[var(--accent)]">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)]" aria-hidden="true" />
              {t("landing.cuotasSinInteres", { cuotas })}
            </p>
          )}
        </section>

        {/* PLANTILLAS (showcase animado) */}
        <TemplateShowcase />

        {/* SECCIÓN 1 — Collage "Así es tu invitación" */}
        <section id="asi-es-tu-invitacion" className="py-20 md:py-28 border-t" style={{ borderColor: 'var(--line)', background: 'var(--ink-2)' }} aria-labelledby="breakdown-title">
          <div className="text-center mb-10 px-6">
            <p className="kicker font-ui mx-auto mb-4">{t("landing.collage.kicker")}</p>
            <h2 id="breakdown-title" className="text-3xl md:text-5xl font-display font-semibold mb-4 tracking-tight text-[var(--foreground)]">{t("landing.collage.titulo")}</h2>
            <p className="text-[var(--shell-fg-mid)] text-lg max-w-xl mx-auto">{t("landing.collage.bajada")}</p>
          </div>
          <div className="max-w-4xl mx-auto px-6">
            <Image
              src="/collage-invitacion.png"
              alt={t("landing.collage.alt")}
              width={1200}
              height={900}
              className="w-full h-auto object-contain rounded-2xl"
              loading="lazy"
            />
          </div>
          {/* Sin un ejemplo que valga la pena mostrar, no se muestra el botón:
              es mejor no ofrecer el ejemplo que ofrecer uno malo. */}
          {ejemploRealUrl && (
            <div className="text-center mt-10">
              <a
                href={ejemploRealUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full border border-[var(--campo-borde)] text-[var(--paper)] font-ui text-sm transition-all duration-200 hover:bg-[var(--tinte-2)] hover:border-[var(--foreground)]/40 hover:-translate-y-0.5"
              >
                {t("landing.verInvitacionReal")} →
              </a>
            </div>
          )}
        </section>

        {/* STRIP (FEATURES) */}
        <section className="l-strip px-6 py-16 md:px-8 md:py-24" id="caracteristicas" style={{ background: "var(--ink-2)" }}>
          <div className="max-w-2xl mx-auto space-y-10">
            <div className="text-center">
              <p className="text-[var(--accent)] font-ui uppercase tracking-widest text-sm font-semibold mb-2">{t("landing.strip.kicker")}</p>
              <h2 className="text-4xl lg:text-5xl font-display text-[var(--foreground)] leading-tight">{t("landing.strip.titulo")}</h2>
            </div>

            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[var(--tinte-2)] flex items-center justify-center shrink-0">
                  <Settings2 className="w-6 h-6 text-[var(--accent)]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">{t("landing.strip.personalizable.titulo")}</h3>
                  <p className="text-[var(--shell-fg-mid)]">{t("landing.strip.personalizable.detalle")}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[var(--tinte-2)] flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6 text-[var(--accent)]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">{t("landing.strip.gestion.titulo")}</h3>
                  <p className="text-[var(--shell-fg-mid)]">{t("landing.strip.gestion.detalle")}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[var(--tinte-2)] flex items-center justify-center shrink-0">
                  <Radio className="w-6 h-6 text-[var(--accent)]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">{t("landing.strip.live.titulo")}</h3>
                  <p className="text-[var(--shell-fg-mid)]">{t("landing.strip.live.detalle")}</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* SECCIÓN 2 — Grilla de 8 características */}
        <section className="py-20 md:py-28 border-t" style={{ borderColor: 'var(--line)' }} aria-labelledby="features-grid-title">
          <div className="text-center mb-12 px-6">
            <p className="kicker font-ui mx-auto mb-4">{t("landing.caracteristicas.kicker")}</p>
            <h2 id="features-grid-title" className="text-3xl md:text-5xl font-display font-semibold mb-4 tracking-tight text-[var(--foreground)]">{t("landing.caracteristicas.titulo")}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto px-6">
            {/* Los dos primeros son los que ningún competidor tiene: seguir
                quién pagó la tarjeta y la fiesta en vivo. Antes estaban
                perdidos en el medio y al final de la grilla, compitiendo por
                atención con "Música de fondo" -- que ofrece cualquiera. Van
                primero y marcados. */}
            {[
              { clave: "pagos", icon: <Gift className="w-6 h-6" />, premium: false, destacado: true },
              { clave: "live", icon: <Rss className="w-6 h-6" />, premium: true, destacado: true },
              { clave: "mesas", icon: <Armchair className="w-6 h-6" />, premium: true, destacado: true },
              { clave: "ingreso", icon: <ScanLine className="w-6 h-6" />, premium: true, destacado: true },
              { clave: "aperturas", icon: <Eye className="w-6 h-6" />, premium: true, destacado: true },
              { clave: "rsvp", icon: <ListChecks className="w-6 h-6" />, premium: false, destacado: false },
              { clave: "social", icon: <MessageCircleHeart className="w-6 h-6" />, premium: false, destacado: false },
              { clave: "saveTheDate", icon: <CalendarDays className="w-6 h-6" />, premium: false, destacado: false },
              { clave: "ubicacion", icon: <MapPin className="w-6 h-6" />, premium: false, destacado: false },
              { clave: "album", icon: <Images className="w-6 h-6" />, premium: false, destacado: false },
              { clave: "musica", icon: <Music className="w-6 h-6" />, premium: false, destacado: false },
              { clave: "cronograma", icon: <Clock className="w-6 h-6" />, premium: false, destacado: false },
            ].map((f) => (
              <div
                key={f.clave}
                className={`rounded-2xl p-5 flex flex-col gap-3 relative ${
                  f.destacado
                    ? "border border-[var(--accent)]/40 bg-gradient-to-b from-[var(--tinte-3)] to-[var(--background)] shadow-[0_0_30px_rgba(202,171,115,0.12)]"
                    : "bg-[var(--tinte-1)] border border-[var(--line)]"
                }`}
              >
                {f.premium ? (
                  <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--accent)] text-[var(--ink)]">Diamond</span>
                ) : f.destacado ? (
                  <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-[var(--accent)]/50 text-[var(--accent)]">{t("landing.caracteristicas.soloAca")}</span>
                ) : null}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${f.destacado ? "bg-[var(--accent)]/15 text-[var(--accent)]" : "bg-[var(--tinte-2)] text-[var(--accent)]"}`}>
                  {f.icon}
                </div>
                <h3 className="font-semibold text-[var(--foreground)] text-sm leading-snug">{t(`landing.caracteristicas.${f.clave}.titulo` as ClaveTexto)}</h3>
                <p className="text-[var(--shell-fg-mid)] text-xs leading-relaxed">{t(`landing.caracteristicas.${f.clave}.detalle` as ClaveTexto)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* STEPS (CÓMO FUNCIONA) */}
        <section className="l-steps" id="como-funciona">
          <p className="kicker">{t("landing.comoFunciona")}</p>
          <div className="l-steps-grid">
            <div className="step">
              <p className="n">{t("landing.pasos.elegis.n")}</p>
              <h4>{t("landing.pasos.elegis.titulo")}</h4>
              <p>{t("landing.pasos.elegis.detalle")}</p>
            </div>
            <div className="step">
              <p className="n">{t("landing.pasos.personalizas.n")}</p>
              <h4>{t("landing.pasos.personalizas.titulo")}</h4>
              <p>{t("landing.pasos.personalizas.detalle")}</p>
            </div>
            <div className="step">
              <p className="n">{t("landing.pasos.compartis.n")}</p>
              <h4>{t("landing.pasos.compartis.titulo")}</h4>
              <p>{t("landing.pasos.compartis.detalle")}</p>
            </div>
          </div>
        </section>

        {/* SECCIÓN 3 — Video explicativo */}
        <section className="py-20 md:py-28 border-t" style={{ borderColor: 'var(--line)', background: 'var(--ink-2)' }} aria-labelledby="video-title">
          <div className="text-center mb-10 px-6">
            <p className="kicker font-ui mx-auto mb-4">{t("landing.video.kicker")}</p>
            <h2 id="video-title" className="text-3xl md:text-5xl font-display font-semibold mb-4 tracking-tight text-[var(--foreground)]">{t("landing.video.titulo")}</h2>
            <p className="text-[var(--shell-fg-mid)] text-lg max-w-xl mx-auto">{t("landing.video.bajada")}</p>
          </div>
          <div className="max-w-3xl mx-auto px-6">
            <div className="rounded-2xl overflow-hidden shadow-[0_10px_50px_rgba(0,0,0,0.5)] border border-[var(--line)]">
              {/* `preload="none"`: antes los dos videos pedían sus metadatos
                  apenas cargaba la landing (el oculto también -- `display:none`
                  no evita la descarga). Ahora no se baja nada hasta que le den
                  play.
                  El poster es negro sólido a propósito, del mismo tamaño que
                  cada video: es el reposo que se eligió para la sección, y
                  puesto como imagen (1,4 KB) en vez de dejar el atributo vacío
                  porque sin poster cada navegador resuelve distinto -- algunos
                  pintan negro y otros dejan ver el fondo de la página. */}
              {/* Mobile video */}
              <video
                src="/video-demo-mobile.mp4"
                poster="/video-demo-mobile-poster.webp"
                controls
                playsInline
                preload="none"
                className="w-full block md:hidden aspect-[720/1080]"
              >
                {t("landing.video.sinSoporte")}
              </video>
              {/* Desktop video */}
              <video
                src="/video-demo.mp4"
                poster="/video-demo-poster.webp"
                controls
                playsInline
                preload="none"
                className="w-full hidden md:block aspect-[1080/720]"
              >
                {t("landing.video.sinSoporte")}
              </video>
            </div>
          </div>
          {ejemploRealUrl && (
            <div className="text-center mt-24 md:mt-10">
              <a
                href={ejemploRealUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full border border-[var(--campo-borde)] text-[var(--paper)] font-ui text-sm transition-all duration-200 hover:bg-[var(--tinte-2)] hover:border-[var(--foreground)]/40 hover:-translate-y-0.5"
              >
                {t("landing.verInvitacionReal")} →
              </a>
            </div>
          )}
        </section>

        {/* PRECIOS */}
        <section id="precios" className="py-20 md:py-32 border-t" style={{ borderColor: 'var(--line)' }}>
          <div className="text-center mb-16">
            <p className="kicker font-ui mx-auto mb-4">{t("landing.planes.kicker")}</p>
            <h2 className="text-3xl md:text-5xl font-display font-semibold mb-6 tracking-tight text-[var(--foreground)]">{t("landing.planes.titulo")}</h2>
            <p className="text-[var(--shell-fg-mid)] text-lg max-w-2xl mx-auto px-4">
              {cuotas ? t("landing.planes.bajada", { cuotas }) : t("landing.planes.bajadaSinCuotas")}
            </p>
          </div>

          {/* La aclaración del asterisco de los precios. Va acá, junto a los
              números, y no en el pie de la página: una aclaración sobre lo que
              se va a cobrar tiene que leerse en el mismo momento que el precio. */}
          {enDolares && (
            <p className="max-w-2xl mx-auto text-center text-xs text-[var(--shell-fg-soft)] mb-8">
              {t("landing.planes.cobroEnDolares", {
                monto: formatearPrecio(precioParaPayPal("PREMIUM", paisVisitante), idioma),
              })}
            </p>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto px-6 items-stretch">
            {/* Gratis */}
            <div className="bg-[var(--card)] border border-[var(--line)] rounded-3xl p-6 flex flex-col relative overflow-hidden backdrop-blur-sm transition-transform hover:-translate-y-1">
              <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">{t("landing.planes.gratis.nombre")}</h3>
              <div className="text-4xl font-display text-[var(--foreground)] mb-4">$0<span className="text-lg text-[var(--shell-fg-soft)] font-sans font-normal">{t("landing.planes.porEvento")}</span></div>
              <p className="text-[var(--shell-fg-mid)] mb-6 text-sm">{t("landing.planes.gratis.detalle")}</p>

              <ul className="space-y-3 mb-6 flex-1 text-[var(--shell-fg-strong)] text-sm">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0 mt-0.5"><div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></div></div>
                  <span>{t("landing.planes.gratis.personalizables")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0 mt-0.5"><div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></div></div>
                  <span>{t("landing.planes.gratis.rsvp")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0 mt-0.5"><div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></div></div>
                  <span>{t("landing.planes.gratis.invitados", { max: PLAN_LIMITS.FREE.maxGuests ?? 0 })}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0 mt-0.5"><div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></div></div>
                  <span>{t("landing.planes.gratis.album", { fotos: PLAN_LIMITS.FREE.maxPhotos ?? 0 })}</span>
                </li>
                <li className="flex items-start gap-3 opacity-50">
                  <span className="text-[var(--danger)] font-bold w-5 text-center flex-shrink-0">✕</span>
                  <span>{t("landing.planes.sin.pagos")}</span>
                </li>
                <li className="flex items-start gap-3 opacity-50">
                  <span className="text-[var(--danger)] font-bold w-5 text-center flex-shrink-0">✕</span>
                  <span>{t("landing.planes.sin.live")}</span>
                </li>
                <li className="flex items-start gap-3 opacity-50">
                  <span className="text-[var(--danger)] font-bold w-5 text-center flex-shrink-0">✕</span>
                  <span>{t("landing.planes.sin.marcaAgua")}</span>
                </li>
                <li className="flex items-start gap-3 opacity-50">
                  <span className="text-[var(--danger)] font-bold w-5 text-center flex-shrink-0">✕</span>
                  <span>{t("landing.planes.sin.mesas")}</span>
                </li>
                <li className="flex items-start gap-3 opacity-50">
                  <span className="text-[var(--danger)] font-bold w-5 text-center flex-shrink-0">✕</span>
                  <span>{t("landing.planes.sin.ingreso")}</span>
                </li>
                <li className="flex items-start gap-3 opacity-50">
                  <span className="text-[var(--danger)] font-bold w-5 text-center flex-shrink-0">✕</span>
                  <span>{t("landing.planes.sin.aperturas")}</span>
                </li>
              </ul>
              <Link href={registerUrl} className="w-full mt-auto">
                <Button className="w-full rounded-xl bg-[var(--tinte-3)] text-[var(--foreground)] hover:bg-[var(--tinte-4)] py-6 border border-[var(--line)] font-sans">{t("landing.planes.gratis.cta")}</Button>
              </Link>
            </div>

            {/* Premium */}
            <div className="bg-[var(--card)] border border-[var(--line)] rounded-3xl p-6 flex flex-col relative overflow-hidden backdrop-blur-sm transition-transform hover:-translate-y-1">
              <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">Premium</h3>
              <div className="mb-1 flex items-baseline gap-2 flex-wrap">
                <span className="text-base text-[var(--shell-fg-soft)] font-sans line-through">{precio(precioDePlan("PREMIUM", paisVisitante))}</span>
                <span className="text-4xl font-display text-[var(--foreground)]">{precio(premiumConDescuento)}{enDolares && <span className="text-2xl align-super">*</span>}</span>
                <span className="text-lg text-[var(--shell-fg-soft)] font-sans font-normal">{t("landing.planes.porEvento")}</span>
              </div>
              <p className="text-xs font-semibold text-[var(--accent)] mb-1">{t("landing.planes.descuento", { porcentaje: PREMIUM_DISCOUNT_PERCENTAGE })}</p>
              {/* La cuota se calcula desde el precio, no se escribe a mano: si
                  mañana cambia el precio, este número lo sigue solo. */}
              {cuotas && <p className="text-xs text-[var(--shell-fg-mid)] mb-4">{t("landing.planes.cuotas", { cuotas, monto: precio({ ...premiumConDescuento, monto: Math.round(premiumConDescuento.monto / cuotas) }) })}</p>}
              <p className="text-[var(--shell-fg-mid)] mb-6 text-sm">{t("landing.planes.premium.detalle")}</p>

              <ul className="space-y-3 mb-6 flex-1 text-[var(--shell-fg-strong)] text-sm">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[var(--accent)]/20 flex items-center justify-center flex-shrink-0 mt-0.5"><div className="w-2 h-2 rounded-full bg-[var(--accent)]"></div></div>
                  <span className="font-medium text-[var(--foreground)]">{t("landing.planes.premium.todoGratis")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[var(--accent)]/20 flex items-center justify-center flex-shrink-0 mt-0.5"><div className="w-2 h-2 rounded-full bg-[var(--accent)]"></div></div>
                  <span><strong className="text-[var(--foreground)]">{t("landing.planes.premium.ilimitados.titulo")}</strong> {t("landing.planes.premium.ilimitados.detalle")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[var(--accent)]/20 flex items-center justify-center flex-shrink-0 mt-0.5"><div className="w-2 h-2 rounded-full bg-[var(--accent)]"></div></div>
                  <span><strong className="text-[var(--foreground)]">{t("landing.planes.premium.album.titulo")}</strong> {t("landing.planes.premium.album.detalle", { fotos: PLAN_LIMITS.PREMIUM.maxPhotos ?? 0 })}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[var(--accent)]/20 flex items-center justify-center flex-shrink-0 mt-0.5"><div className="w-2 h-2 rounded-full bg-[var(--accent)]"></div></div>
                  <span>{t("landing.planes.premium.musica")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[var(--accent)]/20 flex items-center justify-center flex-shrink-0 mt-0.5"><div className="w-2 h-2 rounded-full bg-[var(--accent)]"></div></div>
                  <span><strong className="text-[var(--foreground)]">{t("landing.planes.premium.pagos.titulo")}</strong> {t("landing.planes.premium.pagos.detalle")}</span>
                </li>
                <li className="flex items-start gap-3 opacity-50">
                  <span className="text-[var(--danger)] font-bold w-5 text-center flex-shrink-0">✕</span>
                  <span>{t("landing.planes.sin.liveDiamond")}</span>
                </li>
                <li className="flex items-start gap-3 opacity-50">
                  <span className="text-[var(--danger)] font-bold w-5 text-center flex-shrink-0">✕</span>
                  <span>{t("landing.planes.sin.marcaAgua")}</span>
                </li>
                <li className="flex items-start gap-3 opacity-50">
                  <span className="text-[var(--danger)] font-bold w-5 text-center flex-shrink-0">✕</span>
                  <span>{t("landing.planes.sin.mesas")}</span>
                </li>
                <li className="flex items-start gap-3 opacity-50">
                  <span className="text-[var(--danger)] font-bold w-5 text-center flex-shrink-0">✕</span>
                  <span>{t("landing.planes.sin.ingreso")}</span>
                </li>
                <li className="flex items-start gap-3 opacity-50">
                  <span className="text-[var(--danger)] font-bold w-5 text-center flex-shrink-0">✕</span>
                  <span>{t("landing.planes.sin.aperturas")}</span>
                </li>
              </ul>
              <Link href={premiumUrl} className="w-full mt-auto">
                <Button className="w-full rounded-xl bg-[var(--tinte-4)] text-[var(--foreground)] hover:bg-[var(--foreground)]/25 py-6 font-semibold font-sans">{t("landing.planes.premium.cta")}</Button>
              </Link>
            </div>

            {/* Diamond */}
            <div className="bg-gradient-to-b from-[var(--tinte-3)] to-[var(--background)] border border-[var(--accent)]/40 rounded-3xl p-6 flex flex-col relative overflow-hidden backdrop-blur-sm transition-transform hover:-translate-y-1 shadow-[0_0_40px_rgba(202,171,115,0.15)] lg:scale-105 lg:-translate-y-1">
              <div className="absolute top-0 right-0 bg-[var(--accent)] text-[var(--ink)] text-xs font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-wider font-sans">{t("landing.planes.recomendado")}</div>
              <h3 className="text-xl font-semibold text-[var(--accent)] mb-2">Diamond</h3>
              <div className="mb-1 flex items-baseline gap-2 flex-wrap">
                <span className="text-base text-[var(--shell-fg-soft)] font-sans line-through">{precio(precioDePlan("DIAMOND", paisVisitante))}</span>
                <span className="text-4xl font-display text-[var(--foreground)]">{precio(diamondConDescuento)}{enDolares && <span className="text-2xl align-super">*</span>}</span>
                <span className="text-lg text-[var(--shell-fg-soft)] font-sans font-normal">{t("landing.planes.porEvento")}</span>
              </div>
              <p className="text-xs font-semibold text-[var(--accent)] mb-1">{t("landing.planes.descuento", { porcentaje: DIAMOND_DISCOUNT_PERCENTAGE })}</p>
              {cuotas && <p className="text-xs text-[var(--shell-fg-mid)] mb-4">{t("landing.planes.cuotas", { cuotas, monto: precio({ ...diamondConDescuento, monto: Math.round(diamondConDescuento.monto / cuotas) }) })}</p>}
              <p className="text-[var(--shell-fg-mid)] mb-6 text-sm">{t("landing.planes.diamond.detalle")}</p>

              <ul className="space-y-3 mb-6 flex-1 text-[var(--shell-fg-strong)] text-sm">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[var(--accent)]/20 flex items-center justify-center flex-shrink-0 mt-0.5"><div className="w-2 h-2 rounded-full bg-[var(--accent)]"></div></div>
                  <span className="font-medium text-[var(--foreground)]">{t("landing.planes.diamond.todoPremium")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[var(--accent)]/20 flex items-center justify-center flex-shrink-0 mt-0.5"><div className="w-2 h-2 rounded-full bg-[var(--accent)]"></div></div>
                  <span><strong className="text-[var(--foreground)]">{t("landing.planes.diamond.live.titulo")}</strong> {t("landing.planes.diamond.live.detalle", { fotos: PLAN_LIMITS.DIAMOND.maxLivePhotos ?? 0 })}</span>
                </li>
                {/* El álbum no se repite acá: Diamond tiene el mismo límite que
                    Premium y la tarjeta ya arranca diciendo "todo lo del plan
                    Premium". Repetirlo hacía que la lista de lo que suma
                    Diamond pareciera más larga de lo que realmente es. */}
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[var(--accent)]/20 flex items-center justify-center flex-shrink-0 mt-0.5"><div className="w-2 h-2 rounded-full bg-[var(--accent)]"></div></div>
                  <span><strong className="text-[var(--foreground)]">{t("landing.planes.diamond.mesas.titulo")}</strong> {t("landing.planes.diamond.mesas.detalle")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[var(--accent)]/20 flex items-center justify-center flex-shrink-0 mt-0.5"><div className="w-2 h-2 rounded-full bg-[var(--accent)]"></div></div>
                  <span><strong className="text-[var(--foreground)]">{t("landing.planes.diamond.ingreso.titulo")}</strong> {t("landing.planes.diamond.ingreso.detalle")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[var(--accent)]/20 flex items-center justify-center flex-shrink-0 mt-0.5"><div className="w-2 h-2 rounded-full bg-[var(--accent)]"></div></div>
                  <span><strong className="text-[var(--foreground)]">{t("landing.planes.diamond.aperturas.titulo")}</strong> {t("landing.planes.diamond.aperturas.detalle")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[var(--accent)]/20 flex items-center justify-center flex-shrink-0 mt-0.5"><div className="w-2 h-2 rounded-full bg-[var(--accent)]"></div></div>
                  <span><strong className="text-[var(--foreground)]">{t("landing.planes.diamond.sinMarca.titulo")}</strong> {t("landing.planes.diamond.sinMarca.detalle")}</span>
                </li>
              </ul>
              <Link href={diamondUrl} className="w-full mt-auto">
                <Button className="w-full rounded-xl bg-[var(--accent)] text-[var(--ink)] hover:bg-[var(--accent)]/90 py-6 font-semibold font-sans">{t("landing.planes.diamond.cta")}</Button>
              </Link>
            </div>

            {/* Enterprise */}
            <div className="bg-[var(--card)] border border-[var(--line)] rounded-3xl p-6 flex flex-col relative overflow-hidden backdrop-blur-sm transition-transform hover:-translate-y-1">
              <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">Enterprise</h3>
              <div className="text-2xl font-display text-[var(--foreground)] mb-4">{t("landing.planes.enterprise.precio")}</div>
              <p className="text-[var(--shell-fg-mid)] mb-6 text-sm">{t("landing.planes.enterprise.detalle")}</p>

              <ul className="space-y-3 mb-6 flex-1 text-[var(--shell-fg-strong)] text-sm">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0 mt-0.5"><div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></div></div>
                  <span>{t("landing.planes.enterprise.todoDiamond")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0 mt-0.5"><div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></div></div>
                  <span>{t("landing.planes.enterprise.diseno")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0 mt-0.5"><div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></div></div>
                  <span>{t("landing.planes.enterprise.asesor")}</span>
                </li>
              </ul>
              <Link href={whatsappEnterpriseUrl} target="_blank" rel="noopener noreferrer" className="w-full mt-auto">
                <Button className="w-full rounded-xl bg-[var(--tinte-3)] text-[var(--foreground)] hover:bg-[var(--tinte-4)] py-6 border border-[var(--line)] font-sans">{t("landing.planes.enterprise.cta")}</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* SECCIÓN 5 — FAQ */}
        <section id="faq" className="py-20 md:py-28 border-t" style={{ borderColor: 'var(--line)' }} aria-labelledby="faq-title">
          <div className="max-w-2xl mx-auto px-6">
            <div className="text-center mb-12">
              <p className="kicker font-ui mx-auto mb-4">{t("landing.faq.kicker")}</p>
              <h2 id="faq-title" className="text-3xl md:text-5xl font-display font-semibold tracking-tight text-[var(--foreground)]">{t("landing.faq.titulo")}</h2>
            </div>
            <div className="space-y-0 divide-y" style={{ borderColor: 'var(--line)' }}>
              {FAQ_CLAVES.map((clave) => (
                <details key={clave} className="group py-5">
                  <summary className="flex justify-between items-center cursor-pointer list-none text-[var(--foreground)] font-semibold text-sm md:text-base gap-4 hover:text-[var(--accent)] transition-colors">
                    {t(`landing.faq.${clave}.q` as ClaveTexto)}
                    <span className="text-[var(--accent)] text-xl shrink-0 transition-transform duration-200 group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-[var(--shell-fg-mid)] text-sm leading-relaxed">{t(`landing.faq.${clave}.a` as ClaveTexto)}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <div className="l-foot flex-col gap-6 py-10 border-t" style={{ borderColor: 'var(--line)' }}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 w-full max-w-5xl mx-auto px-6">
            {/* Logo + tagline */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <LandingLogo href="" src="/landing/logo-blanco-v2.png" className="h-4 w-auto" />
              </div>
              <small className="text-[var(--shell-fg-soft)]">{t("landing.hechoPara")}</small>
            </div>

            {/* Accesos rápidos */}
            <nav aria-label={t("landing.accesosRapidos")} className="flex flex-col gap-2">
              <small className="text-[var(--shell-fg-soft)] uppercase tracking-widest text-[10px] font-semibold mb-1">{t("landing.accesosRapidos")}</small>
              <div className="flex flex-row flex-wrap gap-x-4 gap-y-2">
                {[
                  { href: "#plantillas", label: t("landing.pie.links.plantillas") },
                  { href: "/modelos", label: t("landing.verModelos") },
                  { href: "#asi-es-tu-invitacion", label: t("landing.pie.links.asiEsTuInvitacion") },
                  { href: "#como-funciona", label: t("landing.comoFunciona") },
                  { href: "#precios", label: t("landing.precios") },
                  { href: "#faq", label: t("landing.pie.links.preguntasFrecuentes") },
                ].map((l) => (
                  <a key={l.href} href={l.href} className="text-[var(--shell-fg-mid)] text-xs hover:text-[var(--foreground)] transition-colors">{l.label}</a>
                ))}
              </div>
            </nav>
          </div>

          {/* Botón de arrepentimiento */}
          <div className="w-full text-center pb-2">
            <a
              href={`mailto:altainvitacion@gmail.com?subject=${encodeURIComponent(t("landing.pie.arrepentimiento.asunto"))}&body=${encodeURIComponent(t("landing.pie.arrepentimiento.cuerpo"))}`}
              className="text-xs text-[var(--shell-fg-soft)] underline underline-offset-2 hover:text-[var(--shell-fg-strong)] transition-colors"
            >
              {t("landing.pie.arrepentimiento.enlace")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
