import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <div className="relative flex items-center justify-center w-16 h-16">
        <div className="absolute inset-0 border-t-2 border-[var(--accent)] rounded-full animate-spin"></div>
        <div className="absolute inset-2 border-r-2 border-[var(--paper)] rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
        <Loader2 className="w-6 h-6 text-[var(--accent)] animate-pulse" />
      </div>
      <p className="text-[var(--paper)] font-body opacity-80 animate-pulse tracking-widest text-sm uppercase">Cargando...</p>
    </div>
  );
}
