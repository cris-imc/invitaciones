"use client";

import { motion } from "framer-motion";

export function TypewriterText({ text, className, style }: { text: string, className?: string, style?: React.CSSProperties }) {
  // Animamos por palabras en lugar de letras para evitar crear cientos de nodos DOM
  // que pueden causar problemas de rendimiento o truncamiento visual en iframes móviles.
  const words = text.split(/(\s+)/);

  return (
    <motion.h2 
      className={className} 
      style={style}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10%" }}
      variants={{
        hidden: { opacity: 1 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.15
          }
        }
      }}
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          className="inline-block"
          style={{ whiteSpace: "pre-wrap" }}
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0 }
          }}
        >
          {word === '\n' ? <br /> : word}
        </motion.span>
      ))}
    </motion.h2>
  );
}
