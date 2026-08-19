import * as React from "react"
import { cn } from "@/lib/utils"

export function formatInputText(val: string): string {
  if (!val || typeof val !== 'string') return val;

  let isFirstLetterFound = false;

  return val.split(/(\s+)/).map((word) => {
    if (!word.trim()) return word;

    if (!isFirstLetterFound) {
      // La primera palabra puede arrancar con símbolos (ej. "¡Nos casamos!")
      // -- hay que mayusculizar la primera LETRA real, no el símbolo, para
      // no dejar la letra que sigue forzada a minúscula.
      const letterIdx = word.search(/[a-zA-ZÀ-ÿ]/);
      if (letterIdx === -1) return word.toLowerCase();
      isFirstLetterFound = true;
      const lower = word.toLowerCase();
      return lower.slice(0, letterIdx) + lower.charAt(letterIdx).toUpperCase() + lower.slice(letterIdx + 1);
    }

    const firstChar = word.charAt(0);
    const rest = word.slice(1).toLowerCase();
    return firstChar + rest;
  }).join('');
}

export function handleAutoFormatChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, type?: string) {
  if (type !== "email" && type !== "password" && type !== "url" && type !== "number" && type !== "tel") {
    const originalStart = e.target.selectionStart;
    const originalEnd = e.target.selectionEnd;
    
    const formatted = formatInputText(e.target.value);
    if (formatted !== e.target.value) {
      e.target.value = formatted;
      if (originalStart !== null && originalEnd !== null) {
        e.target.setSelectionRange(originalStart, originalEnd);
      }
    }
  }
}

function Input({
  className,
  type,
  onChange,
  disableAutoFormat,
  ...props
}: React.ComponentProps<"input"> & { disableAutoFormat?: boolean }) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disableAutoFormat) {
      handleAutoFormatChange(e, type);
    }
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 h-12 w-full min-w-0 rounded-xl border border-white/20 bg-[var(--ink-2)] px-4 py-2 text-[var(--on-ink)] shadow-xs transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 text-base md:text-sm",
        "focus-visible:ring-2 focus-visible:ring-[var(--paper)]/40 focus-visible:border-[var(--paper)]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      onChange={handleChange}
      {...props}
    />
  )
}

export { Input }
