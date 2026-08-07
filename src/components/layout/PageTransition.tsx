"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);

  // Red de seguridad además de onAnimationComplete: si la pestaña queda en
  // background justo cuando la transición está corriendo (bloquear pantalla,
  // cambiar de app), el requestAnimationFrame del que depende Framer Motion
  // se pausa y ese callback puede no llegar a ejecutarse nunca — el filter
  // queda "trabado" en un valor distinto de "none" y rompe el anclaje de
  // cualquier position:fixed que no esté portado fuera de este árbol. Al
  // volver a foreground, forzamos la limpieza de una.
  useEffect(() => {
    const resetFilter = () => {
      if (ref.current) ref.current.style.filter = "none";
    };
    document.addEventListener("visibilitychange", resetFilter);
    window.addEventListener("pageshow", resetFilter);
    return () => {
      document.removeEventListener("visibilitychange", resetFilter);
      window.removeEventListener("pageshow", resetFilter);
    };
  }, []);

  return (
    <motion.div
      ref={ref}
      key={pathname}
      initial={{ opacity: 0, filter: "blur(8px)", y: 10 }}
      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
      exit={{ opacity: 0, filter: "blur(8px)", y: -10 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      // Framer Motion nunca deja el string literal "none" en el filter
      // final (lo normaliza a blur(0px) para poder interpolarlo), y
      // cualquier filter que no sea exactamente "none" crea un containing
      // block nuevo para los descendientes position:fixed, rompiéndolos.
      // Por eso se limpia el estilo a mano apenas termina la animación.
      onAnimationComplete={() => {
        if (ref.current) ref.current.style.filter = "none";
      }}
      className="flex-1 flex flex-col"
    >
      {children}
    </motion.div>
  );
}
