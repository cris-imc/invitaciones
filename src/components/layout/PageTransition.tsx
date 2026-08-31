"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

// Transición de entrada global (la envuelve app/template.tsx, o sea TODA la
// app: dashboard, wizard, landing, /preview-plantilla, /i/[slug], ...).
//
// OJO -- acá NO se puede animar `filter` (ni ninguna otra propiedad que cree
// un containing block: filter, backdrop-filter, perspective, contain,
// will-change sobre esas). Framer Motion nunca deja el string literal "none"
// en el valor final de `filter`: lo normaliza a `blur(0px)` para poder
// interpolarlo, y ese `blur(0px)` -- aunque visualmente sea un no-op -- hace
// que este div pase a ser el containing block de todos los `position: fixed`
// que cuelgan de él, y además los recorta a SU caja. En páginas donde este
// wrapper mide 0 de alto (todo el contenido es fixed, como el preview de
// plantillas), eso significa que la pantalla entera deja de pintarse: se ve
// el fondo de la app y nada más.
//
// Antes se limpiaba a mano (`ref.current.style.filter = "none"`) en
// onAnimationComplete + visibilitychange/pageshow, pero era una carrera que
// se perdía seguido: cualquier re-render del motion.div posterior a la
// animación vuelve a escribir `filter: blur(0px)` en el DOM y pisa la
// limpieza. De ahí el síntoma intermitente de "la plantilla se ve vacía/gris
// y recién aparece si cambio de pestaña y vuelvo" (volver disparaba el
// visibilitychange que limpiaba el filter).
//
// `opacity` no crea containing block, así que la entrada se hace solo con
// opacity + y (transform, que Framer sí normaliza a "none" al terminar).
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex-1 flex flex-col"
    >
      {children}
    </motion.div>
  );
}
