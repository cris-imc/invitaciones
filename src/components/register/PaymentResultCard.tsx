import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, type LucideIcon } from "lucide-react";

export function PaymentResultCard({
  icon: Icon,
  iconClassName,
  title,
  message,
  ctaHref,
  ctaLabel,
  secondaryHref,
  secondaryLabel,
}: {
  icon: LucideIcon;
  iconClassName: string;
  title: string;
  message: string;
  ctaHref: string;
  ctaLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <div className="min-h-dvh py-12 px-4 flex items-center justify-center bg-[var(--ink)] relative text-[var(--on-ink)]">
      <Link
        href="/"
        className="absolute top-6 left-6 md:top-12 md:left-12 flex items-center gap-2 text-sm text-[var(--paper)] opacity-70 hover:opacity-100 transition-opacity"
      >
        <ChevronLeft className="w-4 h-4" />
        Volver al inicio
      </Link>
      <div className="max-w-md w-full text-center bg-[var(--ink)]/80 backdrop-blur-md rounded-3xl border border-[var(--ink-2)] p-8 shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--ink-2)] mb-4">
          <Icon className={`w-8 h-8 ${iconClassName}`} />
        </div>
        <h1 className="text-2xl font-display mb-3">{title}</h1>
        <p className="opacity-70 mb-6">{message}</p>
        <Link href={ctaHref}>
          <Button className="w-full l-cta bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--paper)]/90 border-none">
            {ctaLabel}
          </Button>
        </Link>
        {secondaryHref && secondaryLabel && (
          <Link
            href={secondaryHref}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-4 text-sm text-[var(--paper)] opacity-70 hover:opacity-100 hover:underline transition-opacity"
          >
            {secondaryLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
