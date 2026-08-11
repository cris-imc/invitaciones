import * as React from "react"

import { cn } from "@/lib/utils"
import { handleAutoFormatChange } from "@/components/ui/input"

function Textarea({ className, onChange, ...props }: React.ComponentProps<"textarea">) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleAutoFormatChange(e);
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-[var(--paper)]/30 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-[100px] w-full rounded-xl border border-white/10 bg-[var(--ink-2)] px-4 py-3 text-base text-[var(--on-ink)] shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      onChange={handleChange}
      {...props}
    />
  )
}

export { Textarea }
