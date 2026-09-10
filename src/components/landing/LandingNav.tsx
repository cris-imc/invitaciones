"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { LandingLogo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

interface LandingNavProps {
  registerUrl: string;
  isLoggedIn: boolean;
}

const WHATSAPP_CONTACT_URL = `https://wa.me/5493517660000?text=${encodeURIComponent(
  "Hola, quiero conocer más sobre las invitaciones de altainvitacion.com"
)}`;

// Con "/" adelante (no solo "#ancla"): LandingNav se usa en /modelos y otras
// páginas además de la home -- un href="#ancla" ahí solo cambia el hash de
// la URL actual sin navegar, y como esas páginas no tienen esos ids, el
// click no hace nada visible. Con "/#ancla" Next.js navega a home y baja al
// ancla sin importar desde qué página se haga click.
// "Plantillas" apuntaba al showcase animado de la home, que muestra una
// plantilla por vez. Desde que existe /modelos -- que es la página dedicada,
// con pestañas por tipo de evento -- eran dos entradas para lo mismo y la
// peor de las dos iba primera.
const BASE_LINKS = [
  { href: "/modelos", label: "Ver modelos" },
  { href: "/#como-funciona", label: "Cómo funciona" },
  { href: "/#precios", label: "Precios" },
  { href: WHATSAPP_CONTACT_URL, label: "Contacto", external: true },
];

export function LandingNav({ registerUrl, isLoggedIn }: LandingNavProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Logueado: agrega "Inicio" (vuelve al dashboard) al ppio de los links,
  // tanto en la barra de escritorio como en el drawer mobile. Deslogueado,
  // no tiene sentido mostrarlo (no hay a dónde volver todavía).
  const LINKS = isLoggedIn
    ? [{ href: "/dashboard", label: "Inicio" }, ...BASE_LINKS]
    : BASE_LINKS;

  // El drawer se porta a document.body: PageTransition envuelve toda la app
  // en un motion.div con filter (blur en la animación de entre-páginas), y
  // cualquier filter !== none convierte a ese div en el containing block de
  // los descendientes position:fixed — el drawer terminaba con la altura de
  // toda la página y se desplazaba con el scroll en vez de quedar fijo.
  useEffect(() => {
    setMounted(true);
  }, []);

  const drawer = (
    <>
      {open && <div className="l-drawer-overlay" onClick={() => setOpen(false)} />}
      <div className={`l-drawer ${open ? "open" : ""}`}>
        <div className="l-drawer-head">
          <div className="l-brand" style={{ margin: 0 }}>
            <LandingLogo href="/" />
          </div>
          <button type="button" className="l-hamburger" onClick={() => setOpen(false)} aria-label="Cerrar menú">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="l-drawer-links">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              target={"external" in l && l.external ? "_blank" : undefined}
              rel={"external" in l && l.external ? "noopener noreferrer" : undefined}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Justo debajo de los links, no pegados abajo del todo: mismo lugar
            donde vive "Cerrar sesión" en el drawer del dashboard. */}
        <div className="px-3 pt-1 flex flex-col gap-2">
          {isLoggedIn ? (
            <>
              <Link href={registerUrl} onClick={() => setOpen(false)}>
                <button className="l-cta">Crear invitación</button>
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="l-drawer-secondary-btn w-full rounded-full text-sm font-semibold py-2.5"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link href="/register" onClick={() => setOpen(false)}>
                <button className="l-cta">Registrarse</button>
              </Link>
              <Link href="/login" onClick={() => setOpen(false)}>
                <button className="l-drawer-secondary-btn w-full rounded-full text-sm font-semibold py-2.5">
                  Ingresar
                </button>
              </Link>
            </>
          )}
        </div>

        <div className="px-3 pt-2 pb-1 flex items-center justify-center">
          <ThemeToggle />
        </div>
      </div>
    </>
  );

  return (
    // El desenfoque va como clase de Tailwind y no en globals.css: escrito
    // ahí como `backdrop-filter`, el procesador de CSS lo descarta y la barra
    // queda sólo translúcida, sin esmerilar. El resto del estilo (fondo,
    // borde, sticky) sí vive en .l-nav.
    <nav className="l-nav backdrop-blur-xl backdrop-saturate-150">
      <div className="l-brand">
        <LandingLogo href="/" />
      </div>

      <div className="l-nav-links">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            target={"external" in l && l.external ? "_blank" : undefined}
            rel={"external" in l && l.external ? "noopener noreferrer" : undefined}
          >
            {l.label}
          </Link>
        ))}
      </div>

      <ThemeToggle className="theme-toggle-btn hidden md:flex" />

      {isLoggedIn && (
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="l-drawer-secondary-btn hidden md:block rounded-full text-sm font-semibold py-2 px-4"
        >
          Cerrar sesión
        </button>
      )}

      <Link href={registerUrl} className="hidden md:block">
        <button className="l-cta">Crear invitación</button>
      </Link>

      <ThemeToggle className="theme-toggle-btn flex md:hidden" />

      <button type="button" className="l-hamburger" onClick={() => setOpen(true)} aria-label="Abrir menú">
        <Menu className="w-5 h-5" />
      </button>

      {mounted && createPortal(drawer, document.body)}
    </nav>
  );
}
