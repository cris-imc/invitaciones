"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useTextos } from "@/components/i18n/ProveedorIdioma";

export function AnimatedHeroText() {
  const t = useTextos();
  const PREFIX = t("landing.hero.prefijo");
  // Memoizado porque el efecto que tipea lo tiene como dependencia: un array
  // nuevo en cada render reiniciaría la animación sola.
  const SUFFIXES = useMemo(
    () => [t("landing.hero.frase1"), t("landing.hero.frase2"), t("landing.hero.frase3")],
    [t]
  );

  const [currentText, setCurrentText] = useState("");
  const [suffixIndex, setSuffixIndex] = useState(0);
  const [phase, setPhase] = useState<"typing" | "pausing" | "deleting">("typing");

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const fullText = PREFIX + SUFFIXES[suffixIndex];

    if (phase === "typing") {
      if (currentText.length < fullText.length) {
        timeout = setTimeout(() => {
          setCurrentText(fullText.substring(0, currentText.length + 1));
        }, Math.random() * 60 + 60); // Escritura normal (60-120ms)
      } else {
        timeout = setTimeout(() => setPhase("pausing"), 1800); // Pausa para leer
      }
    } else if (phase === "pausing") {
      timeout = setTimeout(() => setPhase("deleting"), 200);
    } else if (phase === "deleting") {
      if (currentText.length > PREFIX.length) {
        timeout = setTimeout(() => {
          setCurrentText(fullText.substring(0, currentText.length - 1));
        }, 40); // Borrado rápido
      } else {
        setSuffixIndex((prev) => (prev + 1) % SUFFIXES.length);
        setPhase("typing");
      }
    }

    return () => clearTimeout(timeout);
  }, [currentText, phase, suffixIndex, PREFIX, SUFFIXES]);

  // "LIVE" tiene tratamiento propio dentro del texto tipeado: verde de
  // marca, brillo pulsante ("encendido") y el ™ de marca -- en vez de
  // heredar el itálica/dorado del resto del texto que se está tipeando en
  // cada mensaje.
  const renderSuffix = (suffix: string) => {
    const parts = suffix.split(/(LIVE)/g);
    return parts.map((part, i) =>
      part === "LIVE" ? (
        <motion.span
          key={i}
          className="not-italic font-semibold"
          style={{ color: "#22c55e" }}
          animate={{
            textShadow: [
              "0 0 4px rgba(34,197,94,.4)",
              "0 0 12px rgba(34,197,94,.9)",
              "0 0 4px rgba(34,197,94,.4)",
            ],
          }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
        >
          LIVE
          <sup className="text-[0.5em] ml-px">™</sup>
        </motion.span>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  const renderText = (text: string) => {
    if (text.length <= PREFIX.length) {
      return <span>{text}</span>;
    }
    const renderedPrefix = text.substring(0, PREFIX.length);
    const renderedSuffix = text.substring(PREFIX.length);
    return (
      <>
        <span>{renderedPrefix}</span>
        <em className="italic text-[var(--accent)]">{renderSuffix(renderedSuffix)}</em>
      </>
    );
  };

  // La celda del grid tiene que adoptar el tamaño de la frase más larga de
  // las cuatro, para que no haya layout shift sin importar cuál se esté
  // mostrando en un momento dado.
  const longestSuffix = SUFFIXES.reduce((a, b) => (b.length > a.length ? b : a));

  return (
    // Centrado: el hero pasó a una sola columna. El `text-left` de antes tenía
    // sentido cuando el texto compartía la fila con una foto al costado.
    <div className="grid w-full text-center">
      <h1 className="leading-[1.1] invisible col-start-1 row-start-1" aria-hidden="true">
        <span>{PREFIX}</span>
        <em className="italic text-[var(--accent)]">{longestSuffix}</em>
      </h1>

      <h1 className="leading-[1.1] col-start-1 row-start-1 z-10">
        {renderText(currentText)}
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
          className="inline-block w-[3px] h-[0.9em] bg-[var(--paper)] translate-y-[2px] ml-[2px]"
        />
      </h1>
    </div>
  );
}
