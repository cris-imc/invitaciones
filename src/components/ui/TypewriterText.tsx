"use client";

import { motion } from "framer-motion";

export function TypewriterText({ text, className, style }: { text: string, className?: string, style?: React.CSSProperties }) {
  const letters = Array.from(text);

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
            staggerChildren: 0.03
          }
        }
      }}
    >
      {letters.map((char, index) => (
        <motion.span
          key={index}
          className="inline-block"
          style={{ whiteSpace: "pre-wrap" }}
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0 }
          }}
        >
          {char === '\n' ? <br /> : char}
        </motion.span>
      ))}
    </motion.h2>
  );
}
