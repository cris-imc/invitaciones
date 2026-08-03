"use client";

import { motion } from "framer-motion";

export function TypewriterText({ text, className, style }: { text: string, className?: string, style?: React.CSSProperties }) {
  const characters = text.split("");

  return (
    <motion.h2 
      className={className} 
      style={style}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
      variants={{
        hidden: { opacity: 1 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.04
          }
        }
      }}
    >
      {characters.map((char, index) => (
        <motion.span
          key={index}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1 }
          }}
        >
          {char}
        </motion.span>
      ))}
    </motion.h2>
  );
}
