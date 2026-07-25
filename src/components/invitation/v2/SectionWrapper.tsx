"use client";

import { useEffect, useRef, ReactNode } from "react";

interface SectionWrapperProps {
  id?: string;
  children: ReactNode;
  dark?: boolean;
  noBorder?: boolean;
  delay?: number; // ms de delay en el reveal
  className?: string;
  style?: React.CSSProperties;
}

export function SectionWrapper({
  id,
  children,
  dark = false,
  noBorder = false,
  delay = 0,
  className = "",
  style,
}: SectionWrapperProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respeta prefers-reduced-motion
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      el.classList.add("visible");
      return;
    }

    el.classList.add("reveal");

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.classList.add("visible");
          }, delay);
          obs.unobserve(el);
        }
      },
      { threshold: 0.12 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);

  const classes = [
    "section",
    dark ? "dark" : "",
    noBorder ? "border-b-0" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section
      ref={ref}
      id={id}
      className={classes}
      style={style}
    >
      {children}
    </section>
  );
}
