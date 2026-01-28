import { Loader2 } from "lucide-react";

export function TemplateLoadingFallback() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-slate-50 to-white">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground font-medium">Cargando vista previa...</p>
        </div>
    );
}
