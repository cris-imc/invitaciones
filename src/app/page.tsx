import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { AnimatedHeroText } from "@/components/landing/AnimatedHeroText";
import { TemplateShowcase } from "@/components/landing/TemplateShowcase";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingLogo } from "@/components/ui/Logo";
import { HeroParallaxPhoto } from "@/components/landing/HeroParallaxPhoto";
import { Settings2, Users, Radio, CalendarDays, MapPin, ListChecks, Gift, Images, Music, MessageCircleHeart, Rss } from "lucide-react";
import { auth } from "@/auth";
import { PLAN_LIMITS, formatPrice, DIAMOND_DISCOUNT_PRICE } from "@/lib/plan-limits";

export default async function Home() {
  const session = await auth();
  const registerUrl = session ? "/dashboard?new=true" : "/register";
  const premiumUrl = session ? "/dashboard?new=true&plan=premium" : "/register?plan=premium";
  const diamondUrl = session ? "/dashboard?new=true&plan=diamond" : "/register?plan=diamond";
  const diamondDiscountPrice = DIAMOND_DISCOUNT_PRICE;
  const whatsappEnterpriseUrl = `https://wa.me/5493517660000?text=${encodeURIComponent(
    "Hola, me interesa el plan Enterprise de Alta Invitación"
  )}`;
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[var(--ink)] p-0 md:p-6">
      <div className="landing w-full max-w-[1180px]">
        {/* NAV */}
        <LandingNav registerUrl={registerUrl} isLoggedIn={Boolean(session)} />

        <section className="l-hero">
          <div>
            <AnimatedHeroText />
            <p className="sub">
              Confirmaciones, pagos, fotos y mensajes en vivo — un solo link,
              sin suscripciones.
            </p>
            <div className="l-hero-ctas font-ui">
              <Link href={registerUrl}>
                <Button className="rounded-full bg-[var(--accent)] text-[var(--ink)] transition-all duration-200 hover:bg-[var(--accent)]/90 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[var(--accent)]/20 px-6 font-ui">Empezar gratis</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="ghost" className="rounded-full border border-white/25 text-[var(--paper)] transition-all duration-200 hover:text-[var(--paper)] hover:bg-white/10 hover:border-white/40 hover:-translate-y-0.5 px-6 font-ui">Ingresar</Button>
              </Link>
            </div>
          </div>
          {/* En mobile no se muestra: la foto suelta quedaba colgada al lado
              del texto. En desktop se mantiene, con un efecto parallax al
              hacer scroll (ver HeroParallaxPhoto). */}
          <HeroParallaxPhoto />
        </section>

        {/* PLANTILLAS (showcase animado) */}
        <TemplateShowcase />

        {/* SECCIÓN 1 — Collage "Así es tu invitación" */}
        <section id="asi-es-tu-invitacion" className="py-20 md:py-28 border-t" style={{ borderColor: 'var(--line)', background: 'var(--ink-2)' }} aria-labelledby="breakdown-title">
          <div className="text-center mb-10 px-6">
            <p className="kicker font-ui mx-auto mb-4">Todo en un solo link</p>
            <h2 id="breakdown-title" className="text-3xl md:text-5xl font-display font-semibold mb-4 tracking-tight text-white">Así es tu invitación</h2>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto">Portada, cuenta regresiva, ubicación, RSVP, álbum y regalos — todo lo que tus invitados necesitan, en un vistazo.</p>
          </div>
          <div className="max-w-4xl mx-auto px-6">
            <Image
              src="/collage-invitacion.png"
              alt="Desglose de las partes de una invitación digital de Alta Invitación: portada, cuenta regresiva, ubicación, RSVP, álbum de fotos y mesa de regalos"
              width={1200}
              height={900}
              className="w-full h-auto object-contain rounded-2xl"
              loading="lazy"
            />
          </div>
          <div className="text-center mt-10">
            <a
              href="https://altainvitacion.com/invite/nos-casamos-1786233859965/864f7d5912140fecee1eca69fd5dd17b"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full border border-white/25 text-[var(--paper)] font-ui text-sm transition-all duration-200 hover:bg-white/10 hover:border-white/40 hover:-translate-y-0.5"
            >
              Mirá un ejemplo real →
            </a>
          </div>
        </section>

        {/* STRIP (FEATURES) */}
        <section className="l-strip px-6 py-16 md:px-8 md:py-24" id="caracteristicas" style={{ background: "var(--ink-2)" }}>
          <div className="max-w-2xl mx-auto space-y-10">
            <div className="text-center">
              <p className="text-[var(--accent)] font-ui uppercase tracking-widest text-sm font-semibold mb-2">Todo en uno</p>
              <h2 className="text-4xl lg:text-5xl font-display text-white leading-tight">Mucho más que una invitación</h2>
            </div>

            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                  <Settings2 className="w-6 h-6 text-[var(--accent)]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Plantilla 100% Personalizable</h3>
                  <p className="text-zinc-400">Adaptá colores, tipografías, fotos y estructura. Ya sea una boda, un 15 o un evento corporativo, el diseño se ajusta a tu estilo.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6 text-[var(--accent)]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Gestión de Invitados y Pagos</h3>
                  <p className="text-zinc-400">Recibí confirmaciones (RSVP) al instante, administrá accesos y configurá tu mesa de regalos o cuenta bancaria sin comisiones.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                  <Radio className="w-6 h-6 text-[var(--accent)]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Con LIVE tu fiesta se anima</h3>
                  <p className="text-zinc-400">Tus invitados pueden subir fotos y dejar mensajes desde sus teléfonos durante la fiesta. Todo se proyecta y queda guardado de recuerdo.</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* SECCIÓN 2 — Grilla de 8 características */}
        <section className="py-20 md:py-28 border-t" style={{ borderColor: 'var(--line)' }} aria-labelledby="features-grid-title">
          <div className="text-center mb-12 px-6">
            <p className="kicker font-ui mx-auto mb-4">Incluido en tu invitación</p>
            <h2 id="features-grid-title" className="text-3xl md:text-5xl font-display font-semibold mb-4 tracking-tight text-white">Todo lo que incluye tu invitación</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto px-6">
            {[
              { icon: <CalendarDays className="w-6 h-6" />, title: "Save the date", text: "Cuenta regresiva y botón para agendar la fecha directo en Google Calendar.", premium: false },
              { icon: <MapPin className="w-6 h-6" />, title: "Ubicación e indicaciones", text: "Mapa, horarios y cómo llegar a la ceremonia y a la fiesta, todo en un lugar.", premium: false },
              { icon: <ListChecks className="w-6 h-6" />, title: "Confirmación de asistencia", text: "RSVP en tiempo real: sabés quién confirmó sin tener que preguntar.", premium: false },
              { icon: <Gift className="w-6 h-6" />, title: "Mesa de regalos y pagos", text: "Cuenta bancaria o cobro con tarjeta, sin comisiones sobre lo recaudado.", premium: false },
              { icon: <Images className="w-6 h-6" />, title: "Álbum de fotos", text: "Compartí los momentos de la pareja antes de la fiesta y sumá los del evento.", premium: false },
              { icon: <Music className="w-6 h-6" />, title: "Música de fondo", text: "La invitación suena con la canción que los identifica como pareja.", premium: false },
              { icon: <MessageCircleHeart className="w-6 h-6" />, title: "Módulo social", text: "Sugerencias de canciones para el DJ y mensajes de cariño de los invitados.", premium: false },
              { icon: <Rss className="w-6 h-6" />, title: "Modo LIVE", text: "Fotos y mensajes de invitados proyectados en vivo durante la fiesta.", premium: true },
            ].map((f) => (
              <div
                key={f.title}
                className={`rounded-2xl p-5 flex flex-col gap-3 relative ${
                  f.premium
                    ? "border border-[var(--accent)]/40 bg-gradient-to-b from-zinc-800/80 to-[var(--ink)] shadow-[0_0_30px_rgba(202,171,115,0.12)]"
                    : "bg-white/5 border border-white/8"
                }`}
              >
                {f.premium && (
                  <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--accent)] text-[var(--ink)]">Diamond</span>
                )}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${f.premium ? "bg-[var(--accent)]/15 text-[var(--accent)]" : "bg-white/10 text-[var(--accent)]"}`}>
                  {f.icon}
                </div>
                <h3 className="font-semibold text-white text-sm leading-snug">{f.title}</h3>
                <p className="text-zinc-400 text-xs leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* STEPS (CÓMO FUNCIONA) */}
        <section className="l-steps" id="como-funciona">
          <p className="kicker">Cómo funciona</p>
          <div className="l-steps-grid">
            <div className="step">
              <p className="n">Elegís</p>
              <h4>Una plantilla para tu evento</h4>
              <p>
                Boda, cumpleaños, bautismo o lo que estés celebrando: cada una
                trae su propio tono, tipografía y estructura.
              </p>
            </div>
            <div className="step">
              <p className="n">Personalizás</p>
              <h4>Nombres, fecha, lugar y mensaje</h4>
              <p>
                Wizard guiado paso a paso. Vista previa en vivo, igual a como la
                va a ver cada invitado en su teléfono.
              </p>
            </div>
            <div className="step">
              <p className="n">Compartís</p>
              <h4>Un link, listo para enviar</h4>
              <p>
                RSVP, mapa y módulo social incluidos. Vas viendo las
                confirmaciones a medida que entran.
              </p>
            </div>
          </div>
        </section>

        {/* SECCIÓN 3 — Video explicativo */}
        <section className="py-20 md:py-28 border-t" style={{ borderColor: 'var(--line)', background: 'var(--ink-2)' }} aria-labelledby="video-title">
          <div className="text-center mb-10 px-6">
            <p className="kicker font-ui mx-auto mb-4">En minutos, no en horas</p>
            <h2 id="video-title" className="text-3xl md:text-5xl font-display font-semibold mb-4 tracking-tight text-white">Mirá cómo funciona</h2>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto">De la idea a tu invitación lista, en minutos.</p>
          </div>
          <div className="max-w-3xl mx-auto px-6">
            <div className="rounded-2xl overflow-hidden shadow-[0_10px_50px_rgba(0,0,0,0.5)] border border-white/10">
              {/* Mobile video */}
              <video
                src="/video-demo-mobile.mp4"
                controls
                playsInline
                preload="metadata"
                className="w-full block md:hidden"
              >
                Tu navegador no soporta video HTML5.
              </video>
              {/* Desktop video */}
              <video
                src="/video-demo.mp4"
                controls
                playsInline
                preload="metadata"
                className="w-full hidden md:block"
              >
                Tu navegador no soporta video HTML5.
              </video>
            </div>
          </div>
          <div className="text-center mt-10">
            <a
              href="https://altainvitacion.com/invite/nos-casamos-1786233859965/864f7d5912140fecee1eca69fd5dd17b"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full border border-white/25 text-[var(--paper)] font-ui text-sm transition-all duration-200 hover:bg-white/10 hover:border-white/40 hover:-translate-y-0.5"
            >
              Mirá un ejemplo real →
            </a>
          </div>
        </section>

        {/* PRECIOS */}
        <section id="precios" className="py-20 md:py-32 border-t" style={{ borderColor: 'var(--line)' }}>
          <div className="text-center mb-16">
            <p className="kicker font-ui mx-auto mb-4">Precios Transparentes</p>
            <h2 className="text-3xl md:text-5xl font-display font-semibold mb-6 tracking-tight text-white">Elegí el plan para tu evento</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto px-4">
              Empezá completamente gratis o desbloqueá todas las funcionalidades con un único pago. Sin suscripciones.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto px-6 items-stretch">
            {/* Gratis */}
            <div className="bg-[var(--ink)]/40 border border-[var(--ink-2)] rounded-3xl p-6 flex flex-col relative overflow-hidden backdrop-blur-sm transition-transform hover:-translate-y-1">
              <h3 className="text-xl font-semibold text-white mb-2">Gratis</h3>
              <div className="text-4xl font-display text-white mb-4">$0<span className="text-lg text-zinc-500 font-sans font-normal">/evento</span></div>
              <p className="text-zinc-400 mb-6 flex-1 text-sm">Ideal para eventos íntimos y para probar la plataforma.</p>

              <ul className="space-y-3 mb-6 text-zinc-300 text-sm">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0 mt-0.5"><div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></div></div>
                  <span>Invitaciones personalizables completas</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0 mt-0.5"><div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></div></div>
                  <span>Gestión de confirmaciones (RSVP)</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0 mt-0.5"><div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></div></div>
                  <span>Hasta 20 invitados</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0 mt-0.5"><div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></div></div>
                  <span>Álbum de fotos (hasta {PLAN_LIMITS.FREE.maxPhotos} fotos)</span>
                </li>
                <li className="flex items-start gap-3 opacity-50">
                  <span className="text-red-400 font-bold w-5 text-center flex-shrink-0">✕</span>
                  <span>Sin función LIVE</span>
                </li>
              </ul>
              <Link href={registerUrl} className="w-full mt-auto">
                <Button className="w-full rounded-xl bg-zinc-800 text-white hover:bg-zinc-700 py-6 border border-zinc-700 font-sans">Crear cuenta gratis</Button>
              </Link>
            </div>

            {/* Premium */}
            <div className="bg-[var(--ink)]/40 border border-[var(--ink-2)] rounded-3xl p-6 flex flex-col relative overflow-hidden backdrop-blur-sm transition-transform hover:-translate-y-1">
              <h3 className="text-xl font-semibold text-white mb-2">Premium</h3>
              <div className="text-4xl font-display text-white mb-4">{formatPrice(PLAN_LIMITS.PREMIUM.price)}<span className="text-lg text-zinc-500 font-sans font-normal">/evento</span></div>
              <p className="text-zinc-400 mb-6 flex-1 text-sm">Todas las herramientas interactivas, sin límite de invitados.</p>

              <ul className="space-y-3 mb-6 text-zinc-300 text-sm">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[var(--accent)]/20 flex items-center justify-center flex-shrink-0 mt-0.5"><div className="w-2 h-2 rounded-full bg-[var(--accent)]"></div></div>
                  <span className="font-medium text-white">Todo lo del plan Gratis, más:</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[var(--accent)]/20 flex items-center justify-center flex-shrink-0 mt-0.5"><div className="w-2 h-2 rounded-full bg-[var(--accent)]"></div></div>
                  <span><strong className="text-white">Invitados ilimitados</strong> y sin restricciones</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[var(--accent)]/20 flex items-center justify-center flex-shrink-0 mt-0.5"><div className="w-2 h-2 rounded-full bg-[var(--accent)]"></div></div>
                  <span><strong className="text-white">Álbum de fotos premium</strong> (hasta {PLAN_LIMITS.PREMIUM.maxPhotos} fotos)</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[var(--accent)]/20 flex items-center justify-center flex-shrink-0 mt-0.5"><div className="w-2 h-2 rounded-full bg-[var(--accent)]"></div></div>
                  <span>Música de fondo, trivias y sugerencias de DJ</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[var(--accent)]/20 flex items-center justify-center flex-shrink-0 mt-0.5"><div className="w-2 h-2 rounded-full bg-[var(--accent)]"></div></div>
                  <span><strong className="text-white">Gestión de pagos:</strong> cuentas bancarias para regalos y cobro de tarjetas/entradas</span>
                </li>
                <li className="flex items-start gap-3 opacity-50">
                  <span className="text-red-400 font-bold w-5 text-center flex-shrink-0">✕</span>
                  <span>Sin función LIVE (exclusiva de Diamond)</span>
                </li>
              </ul>
              <Link href={premiumUrl} className="w-full mt-auto">
                <Button className="w-full rounded-xl bg-zinc-700 text-white hover:bg-zinc-600 py-6 font-semibold font-sans">Elegir Premium</Button>
              </Link>
            </div>

            {/* Diamond */}
            <div className="bg-gradient-to-b from-zinc-800/80 to-[var(--ink)] border border-[var(--accent)]/40 rounded-3xl p-6 flex flex-col relative overflow-hidden backdrop-blur-sm transition-transform hover:-translate-y-1 shadow-[0_0_40px_rgba(202,171,115,0.15)] lg:scale-105 lg:-translate-y-1">
              <div className="absolute top-0 right-0 bg-[var(--accent)] text-[var(--ink)] text-xs font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-wider font-sans">Recomendado</div>
              <h3 className="text-xl font-semibold text-[var(--accent)] mb-2">Diamond</h3>
              <div className="mb-1 flex items-baseline gap-2 flex-wrap">
                <span className="text-base text-zinc-500 font-sans line-through">{formatPrice(PLAN_LIMITS.DIAMOND.price)}</span>
                <span className="text-4xl font-display text-white">{formatPrice(diamondDiscountPrice)}</span>
                <span className="text-lg text-zinc-500 font-sans font-normal">/evento</span>
              </div>
              <p className="text-xs font-semibold text-[var(--accent)] mb-4">20% OFF</p>
              <p className="text-zinc-400 mb-6 flex-1 text-sm">Todo Premium, más el Modo Live para tu evento en vivo.</p>

              <ul className="space-y-3 mb-6 text-zinc-300 text-sm">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[var(--accent)]/20 flex items-center justify-center flex-shrink-0 mt-0.5"><div className="w-2 h-2 rounded-full bg-[var(--accent)]"></div></div>
                  <span className="font-medium text-white">Todo lo del plan Premium, más:</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[var(--accent)]/20 flex items-center justify-center flex-shrink-0 mt-0.5"><div className="w-2 h-2 rounded-full bg-[var(--accent)]"></div></div>
                  <span><strong className="text-white">Interacción LIVE:</strong> proyección de fotos en vivo en tu fiesta (hasta {PLAN_LIMITS.DIAMOND.maxLivePhotos} fotos)</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[var(--accent)]/20 flex items-center justify-center flex-shrink-0 mt-0.5"><div className="w-2 h-2 rounded-full bg-[var(--accent)]"></div></div>
                  <span>Álbum de fotos (hasta {PLAN_LIMITS.DIAMOND.maxPhotos} fotos)</span>
                </li>
              </ul>
              <Link href={diamondUrl} className="w-full mt-auto">
                <Button className="w-full rounded-xl bg-[var(--accent)] text-[var(--ink)] hover:bg-[var(--accent)]/90 py-6 font-semibold font-sans">Elegir Diamond</Button>
              </Link>
            </div>

            {/* Enterprise */}
            <div className="bg-[var(--ink)]/40 border border-[var(--ink-2)] rounded-3xl p-6 flex flex-col relative overflow-hidden backdrop-blur-sm transition-transform hover:-translate-y-1">
              <h3 className="text-xl font-semibold text-white mb-2">Enterprise</h3>
              <div className="text-2xl font-display text-white mb-4">Precio a consultar</div>
              <p className="text-zinc-400 mb-6 flex-1 text-sm">Para empresas o clientes que necesiten un diseño de plantilla a medida.</p>

              <ul className="space-y-3 mb-6 text-zinc-300 text-sm">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0 mt-0.5"><div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></div></div>
                  <span>Todo lo de Diamond</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0 mt-0.5"><div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></div></div>
                  <span>Diseño de plantilla 100% a medida</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0 mt-0.5"><div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></div></div>
                  <span>Asesor dedicado</span>
                </li>
              </ul>
              <Link href={whatsappEnterpriseUrl} target="_blank" rel="noopener noreferrer" className="w-full mt-auto">
                <Button className="w-full rounded-xl bg-zinc-800 text-white hover:bg-zinc-700 py-6 border border-zinc-700 font-sans">Consultar</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* SECCIÓN 5 — FAQ */}
        <section id="faq" className="py-20 md:py-28 border-t" style={{ borderColor: 'var(--line)' }} aria-labelledby="faq-title">
          <div className="max-w-2xl mx-auto px-6">
            <div className="text-center mb-12">
              <p className="kicker font-ui mx-auto mb-4">Preguntas frecuentes</p>
              <h2 id="faq-title" className="text-3xl md:text-5xl font-display font-semibold tracking-tight text-white">¿Tenés dudas?</h2>
            </div>
            <div className="space-y-0 divide-y" style={{ borderColor: 'var(--line)' }}>
              {[
                {
                  q: "¿Necesito saber de diseño o programación para armar mi invitación?",
                  a: "No. Elegís una plantilla y la personalizás con un wizard guiado paso a paso: nombres, fecha, lugar, fotos y mensaje. Vas viendo la vista previa en vivo, tal cual la va a ver cada invitado en su teléfono, así que no hay sorpresas al final."
                },
                {
                  q: "¿Cómo es el proceso, paso a paso?",
                  a: "Elegís una plantilla según tu evento, la personalizás con tus datos y fotos en el wizard viendo la vista previa en tiempo real, y publicás para compartir el link por WhatsApp, Instagram o el medio que prefieras. No hay tiempos de espera ni formularios que enviar a un tercero: vos controlás todo el proceso."
                },
                {
                  q: "¿Puedo editar mi invitación después de haberla publicado?",
                  a: "Sí, podés volver a tu panel y modificar textos, fotos, fecha o cualquier dato las veces que necesites. Si cambia el lugar o la fecha del evento, el link no cambia: tus invitados van a ver la información actualizada automáticamente."
                },
                {
                  q: "¿Cómo comparto mi invitación con los invitados?",
                  a: "Generás un link único y personalizado para cada invitado o grupo familiar. Lo enviás de forma individual (uno a uno) por WhatsApp, email o el medio que prefieras. Al ser un link personal, cada persona recibe su propia invitación exclusiva para confirmar su asistencia."
                },
                {
                  q: "¿Hay límite de invitados?",
                  a: "En el plan Gratis podés cargar hasta 20 invitados. En Premium y Diamond no hay límite: podés invitar a todos los que quieras sin restricciones."
                },
                {
                  q: "¿Qué diferencia hay entre los planes Gratis, Premium y Diamond?",
                  a: "El plan Gratis incluye invitación personalizable completa, RSVP y álbum de hasta 5 fotos para hasta 20 invitados: ideal para probar la plataforma o eventos íntimos. Premium suma invitados ilimitados, álbum de hasta 15 fotos, música de fondo, trivias, sugerencias de DJ y gestión de pagos. Diamond agrega el Modo LIVE, con proyección de fotos en vivo durante la fiesta."
                },
                {
                  q: "¿Puedo cambiar de plan después de haber empezado?",
                  a: "Sí, podés empezar gratis y subir de plan en cualquier momento sin perder lo que ya cargaste."
                },
                {
                  q: "¿Mi invitación se va a ver bien en el celular de mis invitados?",
                  a: "Sí. Cada plantilla está pensada mobile-first, porque la gran mayoría de tus invitados la va a abrir desde WhatsApp en su teléfono. También se ve correctamente en tablet y PC."
                },
                {
                  q: "¿Puedo usar Alta Invitación para otro evento que no sea una boda?",
                  a: "Sí, tenemos plantillas para bodas, XV años, cumpleaños y otros eventos, cada una con su propio estilo, tipografía y estructura."
                },
                {
                  q: "¿Hay algún costo por usar el plan Gratis?",
                  a: "No, el plan Gratis es $0 por evento, sin suscripción ni tarjeta requerida. Solo pagás si elegís desbloquear funcionalidades con Premium o Diamond, y es un pago único por evento, nunca una suscripción recurrente."
                },
              ].map((item) => (
                <details key={item.q} className="group py-5">
                  <summary className="flex justify-between items-center cursor-pointer list-none text-white font-semibold text-sm md:text-base gap-4 hover:text-[var(--accent)] transition-colors">
                    {item.q}
                    <span className="text-[var(--accent)] text-xl shrink-0 transition-transform duration-200 group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-zinc-400 text-sm leading-relaxed">{item.a}</p>
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
              <small className="text-zinc-500">Hecho para bodas, cumpleaños, eventos y todo lo que se celebra</small>
            </div>

            {/* Accesos rápidos */}
            <nav aria-label="Accesos rápidos" className="flex flex-col gap-2">
              <small className="text-zinc-500 uppercase tracking-widest text-[10px] font-semibold mb-1">Accesos rápidos</small>
              <div className="flex flex-row flex-wrap gap-x-4 gap-y-2">
                {[
                  { href: "#plantillas", label: "Plantillas" },
                  { href: "/modelos", label: "Ver modelos" },
                  { href: "#asi-es-tu-invitacion", label: "Así es tu invitación" },
                  { href: "#como-funciona", label: "Cómo funciona" },
                  { href: "#precios", label: "Precios" },
                  { href: "#faq", label: "Preguntas frecuentes" },
                ].map((l) => (
                  <a key={l.href} href={l.href} className="text-zinc-400 text-xs hover:text-white transition-colors">{l.label}</a>
                ))}
              </div>
            </nav>
          </div>

          {/* Botón de arrepentimiento */}
          <div className="w-full text-center pb-2">
            <a
              href={`mailto:altainvitacion@gmail.com?subject=${encodeURIComponent("Botón de arrepentimiento")}&body=${encodeURIComponent("Nombre completo:\nEmail de contratación:\nFecha de contratación:\nPlan contratado:\nMotivo (opcional):")}`}
              className="text-xs text-zinc-500 underline underline-offset-2 hover:text-zinc-300 transition-colors"
            >
              Botón de arrepentimiento
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
