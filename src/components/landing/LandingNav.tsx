"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Menu, X } from "lucide-react";

interface LandingNavProps {
  registerUrl: string;
}

const LINKS = [
  { href: "#plantillas", label: "Plantillas" },
  { href: "#como-funciona", label: "Cómo funciona" },
  { href: "#precios", label: "Precios" },
];

export function LandingNav({ registerUrl }: LandingNavProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

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
            <span className="flex flex-col leading-none">
              <span className="text-[10px] font-sans font-bold tracking-widest uppercase opacity-70">
                Invitaciones
              </span>
              <span className="text-sm font-sans font-bold tracking-[0.2em] uppercase -mt-1">
                Digitales
              </span>
            </span>
          </div>
          <button type="button" className="l-hamburger" onClick={() => setOpen(false)} aria-label="Cerrar menú">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="l-drawer-links">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
        </div>

        <div className="l-drawer-foot">
          <Link href={registerUrl} onClick={() => setOpen(false)}>
            <button className="l-cta">Crear invitación</button>
          </Link>
        </div>
      </div>
    </>
  );

  return (
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
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href}>
            {l.label}
          </Link>
        ))}
      </div>

      <Link href={registerUrl} className="hidden md:block">
        <button className="l-cta">Crear invitación</button>
      </Link>

      <button type="button" className="l-hamburger" onClick={() => setOpen(true)} aria-label="Abrir menú">
        <Menu className="w-5 h-5" />
      </button>

      {mounted && createPortal(drawer, document.body)}
    </nav>
  );
}
