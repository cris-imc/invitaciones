import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-0 md:p-6">
      <div className="landing w-full max-w-[1180px]">
        {/* NAV */}
        <nav className="l-nav">
          <div className="l-brand">
            <div className="seal">
              <span className="font-display">C</span>
            </div>
            Invitaciones Digitales
          </div>
          <div className="l-nav-links">
            <Link href="#plantillas">Plantillas</Link>
            <Link href="#como-funciona">Cómo funciona</Link>
            <Link href="#precios">Precios</Link>
          </div>
          <Link href="/register">
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
              <Link href="/register">
                <Button className="rounded-full bg-accent text-ink hover:bg-accent/90 px-6">Empezar gratis</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="ghost" className="rounded-full text-paper hover:text-paper hover:bg-white/10 px-6">Ingresar ↗</Button>
              </Link>
            </div>
          </div>
          <div className="hero-preview">
            <div className="seal">
              <span>M&G</span>
            </div>
            <p className="ev-eyebrow">Nos casamos</p>
            <h3>Martina & Gonzalo</h3>
            <p className="ev-date">14 · 03 · 2027 — Córdoba, Argentina</p>
            <div className="cd">
              <div>
                <b>62</b>
                <span>días</span>
              </div>
              <div>
                <b>14</b>
                <span>hs</span>
              </div>
              <div>
                <b>32</b>
                <span>min</span>
              </div>
            </div>
          </div>
        </section>

        {/* STRIP (PLANTILLAS) */}
        <section className="l-strip" id="plantillas">
          <p className="kicker">7 estilos, un mismo estándar de calidad</p>
          <div className="l-strip-grid">
            <div className="evcard">
              <b>Boda</b>
              <span>Elegante</span>
            </div>
            <div className="evcard">
              <b>15 años</b>
              <span>Festivo</span>
            </div>
            <div className="evcard">
              <b>Cumpleaños</b>
              <span>Cálido</span>
            </div>
            <div className="evcard">
              <b>Ejecutivo</b>
              <span>Corporativo</span>
            </div>
            <div className="evcard">
              <b>Bautismo</b>
              <span>Sobrio</span>
            </div>
            <div className="evcard">
              <b>Nacimiento</b>
              <span>Tierno</span>
            </div>
            <div className="evcard">
              <b>Infantil</b>
              <span>Lúdico</span>
            </div>
            <Link href="/register" className="evcard flex items-center justify-center border-dashed">
              <span className="font-ui font-semibold opacity-70">
                Crear ahora →
              </span>
            </Link>
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
