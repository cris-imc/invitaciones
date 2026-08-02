"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Props {
  words: string[];
  className?: string;
}

export function AnimatedSynonyms({ words, className = "" }: Props) {
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex];
    let timeout: NodeJS.Timeout;

    if (!isDeleting) {
      if (text.length < currentWord.length) {
        // Escribiendo
        timeout = setTimeout(() => {
          setText(currentWord.substring(0, text.length + 1));
        }, Math.random() * 50 + 80);
      } else {
        // Pausa al terminar de escribir (espera más si es la última palabra, aunque es cíclico)
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 2000);
      }
    } else {
      if (text.length > 0) {
        // Borrando
        timeout = setTimeout(() => {
          setText(currentWord.substring(0, text.length - 1));
        }, 40);
      } else {
        // Siguiente palabra
        setIsDeleting(false);
        setWordIndex((prev) => (prev + 1) % words.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [text, isDeleting, wordIndex, words]);

  // Encontrar la palabra más larga para reservar el espacio (evita layout shift)
  const longestWord = words.reduce((a, b) => (a.length > b.length ? a : b), "");

  return (
    <span className={`inline-grid text-left ${className}`}>
      {/* Texto fantasma para asegurar el ancho y evitar saltos */}
      <span className="invisible col-start-1 row-start-1" aria-hidden="true">
        {longestWord}
      </span>
      
      {/* Texto animado */}
      <span className="col-start-1 row-start-1 flex items-baseline">
        <span>{text}</span>
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
          className="inline-block w-[3px] h-[0.9em] bg-current ml-[2px] self-center"
        />
      </span>
    </span>
  );
}
