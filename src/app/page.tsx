import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AnimatedMobileMockup } from "@/components/landing/AnimatedMobileMockup";
import { AnimatedHeroText } from "@/components/landing/AnimatedHeroText";
import { Settings2, Users, Radio } from "lucide-react";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();
  const registerUrl = session ? "/dashboard?new=true" : "/register";
  const premiumUrl = session ? "/dashboard?new=true&plan=premium" : "/register?plan=premium";
  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-0 md:p-6">
      <div className="landing w-full max-w-[1180px]">
        {/* NAV */}
        <nav className="l-nav">
          <div className="l-brand">
            <Link href="/" className="flex flex-col leading-none hover:opacity-80 transition-opacity">
              <span className="text-[10px] font-sans font-bold tracking-widest uppercase opacity-70">
                  Invitaciones
              </span>
              <span className="text-sm font-sans font-bold tracking-[0.2em] uppercase -mt-1">
                  Digitales
              </span>
            </Link>
          </div>
          <div className="l-nav-links">
            <Link href="#plantillas">Plantillas</Link>
            <Link href="#como-funciona">Cómo funciona</Link>
            <Link href="#precios">Precios</Link>
          </div>
          <Link href={registerUrl}>
            <button className="l-cta">Crear invitación</button>
          </Link>
        </nav>

        {/* HERO */}
        <section className="l-hero">
          <div>
            <p className="kicker">Invitaciones digitales</p>
            <AnimatedHeroText />
            <p className="sub">
              Elegí una plantilla pensada para tu tipo de evento, personalizá
              cada detalle y compartí un link. Confirmaciones, mapa y mensajes
              de tus invitados, todo en un mismo lugar.
            </p>
            <div className="l-hero-ctas">
              <Link href={registerUrl}>
                <Button className="rounded-full bg-accent text-ink hover:bg-accent/90 px-6">Empezar gratis</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="ghost" className="rounded-full text-paper hover:text-paper hover:bg-white/10 px-6">Ingresar ↗</Button>
              </Link>
            </div>
          </div>
          <div className="relative w-full h-full min-h-[400px] flex items-center overflow-visible pointer-events-none scale-110 origin-right">
            <div className="absolute inset-0 z-0" style={{
                maskImage: 'linear-gradient(to right, transparent 0%, black 50%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 50%)'
            }}>
              <img src="/landing/novios2.jpg" alt="Novios" className="w-full h-full object-cover object-[center_30%] opacity-80" />
            </div>
          </div>
        </section>

        {/* STRIP (FEATURES) */}
        <section className="l-strip" id="caracteristicas" style={{ padding: "6rem 2rem", background: "black" }}>
          <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-16">
            
            <div className="flex-1 space-y-10">
              <div>
                <p className="text-accent uppercase tracking-widest text-sm font-semibold mb-2">Todo en uno</p>
                <h2 className="text-4xl lg:text-5xl font-serif text-white leading-tight">Mucho más que una invitación</h2>
              </div>

              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                    <Settings2 className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Plantilla 100% Personalizable</h3>
                    <p className="text-zinc-400">Adaptá colores, tipografías, fotos y estructura. Ya sea una boda, un 15 o un evento corporativo, el diseño se ajusta a tu estilo.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Gestión de Invitados y Pagos</h3>
                    <p className="text-zinc-400">Recibí confirmaciones (RSVP) al instante, administrá accesos y configurá tu mesa de regalos o cuenta bancaria sin comisiones.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                    <Radio className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Interacción en Vivo (LIVE)</h3>
                    <p className="text-zinc-400">Tus invitados pueden subir fotos y dejar mensajes desde sus teléfonos durante la fiesta. Todo se proyecta y queda guardado de recuerdo.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Link href="/register">
                  <Button className="rounded-full bg-accent text-ink hover:bg-accent/90 px-8 py-6 text-lg">Probar gratis</Button>
                </Link>
              </div>
            </div>

            <div className="flex-1 w-full flex justify-center lg:justify-end">
              <AnimatedMobileMockup />
            </div>

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

        {/* PRECIOS */}
        <section id="precios" className="py-20 md:py-32 border-t border-zinc-900">
          <div className="text-center mb-16">
            <p className="kicker mx-auto mb-4">Precios Transparentes</p>
            <h2 className="text-3xl md:text-5xl font-semibold mb-6 tracking-tight text-white">Elegí el plan para tu evento</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto px-4">
              Empezá completamente gratis o desbloqueá todas las funcionalidades con un único pago. Sin suscripciones.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto px-6">
            {/* Gratis */}
            <div className="bg-[var(--ink)]/40 border border-[var(--ink-2)] rounded-3xl p-8 flex flex-col relative overflow-hidden backdrop-blur-sm transition-transform hover:-translate-y-1">
              <h3 className="text-2xl font-semibold text-white mb-2">Gratis</h3>
              <div className="text-5xl font-display text-white mb-6">$0<span className="text-xl text-zinc-500 font-sans font-normal">/evento</span></div>
              <p className="text-zinc-400 mb-8 flex-1">Ideal para eventos íntimos y para probar la plataforma.</p>
              
              <ul className="space-y-4 mb-8 text-zinc-300 text-sm">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0 mt-0.5"><div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></div></div>
                  <span>Invitaciones personalizables completas</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0 mt-0.5"><div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></div></div>
                  <span>Gestión de confirmaciones (RSVP) y pagos</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0 mt-0.5"><div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></div></div>
                  <span>Hasta 20 invitados</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0 mt-0.5"><div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></div></div>
                  <span>Álbum de fotos (hasta 10 fotos)</span>
                </li>
              </ul>
              <Link href={registerUrl} className="w-full mt-auto">
                <Button className="w-full rounded-xl bg-zinc-800 text-white hover:bg-zinc-700 py-6 border border-zinc-700 font-sans">Crear cuenta gratis</Button>
              </Link>
            </div>

            {/* Premium */}
            <div className="bg-gradient-to-b from-zinc-800/80 to-[var(--ink)] border border-[var(--accent)]/40 rounded-3xl p-8 flex flex-col relative overflow-hidden backdrop-blur-sm transition-transform hover:-translate-y-1 shadow-[0_0_40px_rgba(202,171,115,0.1)]">
              <div className="absolute top-0 right-0 bg-[var(--accent)] text-[var(--ink)] text-xs font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-wider font-sans">Recomendado</div>
              <h3 className="text-2xl font-semibold text-[var(--accent)] mb-2">Premium</h3>
              <div className="text-5xl font-display text-white mb-6">$50.000<span className="text-xl text-zinc-500 font-sans font-normal">/evento</span></div>
              <p className="text-zinc-400 mb-8 flex-1">Para la experiencia definitiva. Acceso total a todas las herramientas interactivas.</p>
              
              <ul className="space-y-4 mb-8 text-zinc-300 text-sm">
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
                  <span><strong className="text-white">Interacción LIVE:</strong> proyección de fotos en vivo en tu fiesta</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[var(--accent)]/20 flex items-center justify-center flex-shrink-0 mt-0.5"><div className="w-2 h-2 rounded-full bg-[var(--accent)]"></div></div>
                  <span><strong className="text-white">Álbum de fotos premium</strong> (hasta 200 fotos)</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[var(--accent)]/20 flex items-center justify-center flex-shrink-0 mt-0.5"><div className="w-2 h-2 rounded-full bg-[var(--accent)]"></div></div>
                  <span>Música de fondo, trivias y sugerencias de DJ</span>
                </li>
              </ul>
              <Link href={premiumUrl} className="w-full mt-auto">
                <Button className="w-full rounded-xl bg-[var(--accent)] text-[var(--ink)] hover:bg-[var(--accent)]/90 py-6 font-semibold font-sans">Empezar con Premium</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <div className="l-foot">
          <small>Invitaciones Digitales · Hecho con ❤️</small>
          <small>
            Hecho para bodas, cumpleaños, eventos y todo lo que se celebra
          </small>
        </div>
      </div>
    </div>
  );
}
