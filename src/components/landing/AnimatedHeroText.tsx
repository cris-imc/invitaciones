"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const PREFIX = "Con esta tarjeta no solo invitas, ";
const SUFFIXES = [
  "avisas la fecha.",
  "escribes tu mejor historia.",
  "compartes fotos en vivo y gestionas los pagos.",
];

export function AnimatedHeroText() {
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
  }, [currentText, phase, suffixIndex]);

  const renderText = (text: string) => {
    if (text.length <= PREFIX.length) {
      return <span>{text}</span>;
    }
    const renderedPrefix = text.substring(0, PREFIX.length);
    const renderedSuffix = text.substring(PREFIX.length);
    return (
      <>
        <span>{renderedPrefix}</span>
        <em className="italic text-[var(--accent)]">{renderedSuffix}</em>
      </>
    );
  };

  // La celda del grid tiene que adoptar el tamaño de la frase más larga de
  // las tres, para que no haya layout shift sin importar cuál se esté
  // mostrando en un momento dado.
  const longestSuffix = SUFFIXES.reduce((a, b) => (b.length > a.length ? b : a));

  return (
    <div className="grid w-full text-left">
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
