import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function Hero() {
    return (
        <section className="relative overflow-hidden bg-background pt-[100px] md:pt-[150px] pb-[80px] md:pb-[120px]">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

            <div className="container px-4 md:px-6 mx-auto flex flex-col items-center text-center space-y-8">
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary hover:bg-primary/20">
                    <Sparkles className="w-3 h-3 mr-1" />
                    La nueva forma de invitar
                </div>

                <h1 className="text-4xl font-extrabold tracking-tight lg:text-6xl max-w-4xl">
                    Crea invitaciones digitales que <span className="text-primary">enamoran</span> a tus invitados
                </h1>

                <p className="text-xl text-muted-foreground max-w-2xl">
                    Diseña, gestiona y comparte invitaciones personalizadas para tu casamiento, 15 años o evento especial. Moderno, simple y elegante.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-4">
                    <Link href="/dashboard/invitaciones/crear">
                        <Button size="lg" className="w-full sm:w-auto text-base px-8 h-12 gap-2">
                            Crear mi invitación <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                    <Link href="#features">
                        <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 h-12">
                            Ver características
                        </Button>
                    </Link>
                </div>

                <div className="pt-12 w-full max-w-5xl mx-auto">
                    <div className="relative rounded-xl border bg-background shadow-2xl p-2 md:p-4">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-secondary/10 rounded-xl -z-10 blur-xl" />
                        <img
                            src="/assets/ejemplo.jpg"
                            alt="Preview de Invitación"
                            className="rounded-lg w-full h-auto object-cover aspect-[16/9]"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
