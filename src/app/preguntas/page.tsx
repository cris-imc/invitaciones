import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { LandingLogo } from "@/components/ui/Logo";
import { textosDelAnfitrion } from "@/lib/i18n/servidor";
import type { ClaveTexto } from "@/lib/i18n/texto";
import { FAQ_CLAVES } from "@/lib/faq-claves";

/**
 * Todas las preguntas frecuentes, en una página pública.
 *
 * Existe porque la landing muestra sólo seis: diecinueve preguntas plegadas
 * al final de una página de venta se leen como un muro y nadie las abre. Las
 * seis de la landing son las que frenan la decisión; las otras trece se
 * buscan cuando ya se está usando el producto, y para eso esta página.
 *
 * Pública y no dentro del panel: alguien que todavía está decidiendo si
 * comprar tiene que poder leerlas sin crearse una cuenta. Y de paso es una
 * página que Google puede indexar, con las preguntas que la gente escribe
 * tal cual en el buscador.
 */
export async function generateMetadata() {
  const t = await textosDelAnfitrion();
  return {
    title: `${t("landing.faq.kicker")} · altainvitacion.com`,
    description: t("landing.faq.titulo"),
  };
}

export default async function PreguntasPage() {
  const t = await textosDelAnfitrion();

  return (
    <div className="flex min-h-dvh justify-center bg-[var(--ink)]">
      <div className="landing w-full">
        <div className="max-w-3xl mx-auto w-full px-6 py-10 md:py-16">
          <div className="flex items-center justify-between gap-4 mb-10">
            <LandingLogo href="/" src="/landing/logo-blanco-v2.png" className="h-4 w-auto" />
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-[var(--shell-fg-mid)] hover:text-[var(--foreground)] transition-colors font-ui"
            >
              <ChevronLeft className="w-4 h-4" />
              {t("landing.faq.volver")}
            </Link>
          </div>

          <p className="kicker font-ui mb-4">{t("landing.faq.kicker")}</p>
          <h1 className="text-3xl md:text-5xl font-display font-semibold mb-10 tracking-tight text-[var(--foreground)]">
            {t("landing.faq.titulo")}
          </h1>

          <div className="divide-y" style={{ borderColor: "var(--line)" }}>
            {FAQ_CLAVES.map((clave) => (
              <details key={clave} className="group py-5">
                <summary className="flex justify-between items-center cursor-pointer list-none text-[var(--foreground)] font-semibold text-sm md:text-base gap-4 hover:text-[var(--accent)] transition-colors">
                  {t(`landing.faq.${clave}.q` as ClaveTexto)}
                  <span className="text-[var(--accent)] text-xl shrink-0 transition-transform duration-200 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-[var(--shell-fg-mid)] text-sm leading-relaxed">
                  {t(`landing.faq.${clave}.a` as ClaveTexto)}
                </p>
              </details>
            ))}
          </div>

          {/* Quien terminó de leer todas las preguntas ya no tiene dudas: lo
              que necesita es dónde empezar, no volver a la landing a
              buscarlo. */}
          <div className="mt-12 text-center">
            <Link
              href="/dashboard/invitaciones/crear"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] font-ui text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5"
            >
              {t("landing.empezarGratis")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
