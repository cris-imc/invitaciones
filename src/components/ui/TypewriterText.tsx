"use client";

import React from "react";
import { motion } from "framer-motion";

export function TypewriterText({ text, className, style }: { text: string, className?: string, style?: React.CSSProperties }) {
  const words = text.split(/(\s+)/);
  let globalIndex = 0;

  return (
    <motion.h2 
      className={className} 
      style={style}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10%" }}
    >
      {words.map((word, wIdx) => {
        if (!word.trim()) {
           const spaces = Array.from(word).map((char, cIdx) => {
             const currentIndex = globalIndex++;
             return (
               <motion.span
                 key={`${wIdx}-${cIdx}`}
                 className="inline-block"
                 style={{ whiteSpace: "pre-wrap" }}
                 variants={{
                   hidden: { opacity: 0, y: 10 },
                   visible: { opacity: 1, y: 0, transition: { delay: currentIndex * 0.03 } }
                 }}
               >
                 {char === '\n' ? <br /> : char}
               </motion.span>
             );
           });
           return <React.Fragment key={wIdx}>{spaces}</React.Fragment>;
        }

        return (
          <span key={wIdx} className="inline-block whitespace-nowrap">
            {Array.from(word).map((char, cIdx) => {
              const currentIndex = globalIndex++;
              return (
                <motion.span
                  key={`${wIdx}-${cIdx}`}
                  className="inline-block"
                  variants={{
                   hidden: { opacity: 0, y: 10 },
                   visible: { opacity: 1, y: 0, transition: { delay: currentIndex * 0.03 } }
                 }}
                >
                  {char}
                </motion.span>
              );
            })}
          </span>
        );
      })}
    </motion.h2>
  );
}
