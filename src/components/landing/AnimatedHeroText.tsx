"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function AnimatedHeroText() {
  const prefix = "Con esta tarjeta no solo invitas, ";
  const tempSuffix = "avisas la fecha.";
  const epicSuffix = "escribes tu mejor historia.";
  
  const fullTemp = prefix + tempSuffix;
  const fullEpic = prefix + epicSuffix;
  
  const [currentText, setCurrentText] = useState("");
  const [phase, setPhase] = useState(0); 
  // Phase 0: typing temp
  // Phase 1: deleting temp
  // Phase 2: typing epic
  // Phase 3: done

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (phase === 0) {
      if (currentText.length < fullTemp.length) {
        timeout = setTimeout(() => {
          setCurrentText(fullTemp.substring(0, currentText.length + 1));
        }, Math.random() * 60 + 60); // Escritura normal (60-120ms)
      } else {
        timeout = setTimeout(() => setPhase(1), 1500); // Pausa para leer
      }
    } else if (phase === 1) {
      if (currentText.length > prefix.length) {
        timeout = setTimeout(() => {
          setCurrentText(fullTemp.substring(0, currentText.length - 1));
        }, 40); // Borrado rápido
      } else {
        timeout = setTimeout(() => setPhase(2), 600); // Pausa antes de la revelación épica
      }
    } else if (phase === 2) {
      if (currentText.length < fullEpic.length) {
        timeout = setTimeout(() => {
          setCurrentText(fullEpic.substring(0, currentText.length + 1));
        }, Math.random() * 80 + 70); // Escritura ÉPICA más lenta (70-150ms)
      } else {
        setPhase(3); // Terminado
      }
    }

    return () => clearTimeout(timeout);
  }, [currentText, phase, fullTemp, fullEpic, prefix.length]);

  const renderText = (text: string) => {
    if (text.length <= prefix.length) {
      return <span>{text}</span>;
    }
    const renderedPrefix = text.substring(0, prefix.length);
    const renderedSuffix = text.substring(prefix.length);
    return (
      <>
        <span>{renderedPrefix}</span>
        <em className="italic text-[var(--accent)]">{renderedSuffix}</em>
      </>
    );
  };

  return (
    <div className="grid w-full text-left">
      {/* 
        Técnica avanzada de Ghost Texts en Grid:
        Ponemos AMBAS versiones de la frase (la temporal y la épica) invisibles en la 
        misma celda del grid. El grid adoptará el tamaño de la más grande, garantizando
        absolutamente CERO layout shift sin importar cómo cambien las palabras o cómo envuelvan.
      */}
      <h1 className="leading-[1.1] invisible col-start-1 row-start-1" aria-hidden="true">
        <span>{prefix}</span>
        <em className="italic text-[var(--accent)]">{tempSuffix}</em>
      </h1>
      <h1 className="leading-[1.1] invisible col-start-1 row-start-1" aria-hidden="true">
        <span>{prefix}</span>
        <em className="italic text-[var(--accent)]">{epicSuffix}</em>
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
