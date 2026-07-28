import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AnimatedMobileMockup } from "@/components/landing/AnimatedMobileMockup";
import { Settings2, Users, Radio } from "lucide-react";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();
  const registerUrl = session ? "/dashboard?new=true" : "/register";
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
            <h1>
              Cada evento tiene <em>su propia</em> historia. La invitación
              también debería.
            </h1>
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
