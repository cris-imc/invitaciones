import {
    CalendarCheck,
    Camera,
    MapPin,
    Music,
    Palette,
    Smartphone
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
    {
        title: "RSVP en Tiempo Real",
        description: "Gestiona confirmaciones de asistencia al instante. Sabe quién viene, cuántos acompañantes y dietas especiales.",
        icon: CalendarCheck,
    },
    {
        title: "Álbum de Fotos Colaborativo",
        description: "Tus invitados pueden subir fotos del evento en vivo. Crea recuerdos compartidos automáticamente.",
        icon: Camera,
    },
    {
        title: "Ubicación con Mapas",
        description: "Integración directa con Google Maps y Waze para que nadie se pierda en el camino a tu fiesta.",
        icon: MapPin,
    },
    {
        title: "Diseño 100% Personalizable",
        description: "Colores, tipografías y fotos que se adaptan a tu estilo. Elegante, moderno y único como tu evento.",
        icon: Palette,
    },
    {
        title: "Música de Fondo",
        description: "Agrega esa canción especial que define tu momento para ambientar la experiencia de tus invitados.",
        icon: Music,
    },
    {
        title: "Mobile First",
        description: "Diseñado para verse perfecto en cualquier dispositivo móvil, donde tus invitados verán la invitación.",
        icon: Smartphone,
    },
];

export function Features() {
    return (
        <section id="features" className="py-20 bg-slate-50 dark:bg-slate-900/50">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                    <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                        Características
                    </div>
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                        Todo lo que necesitas para tu evento
                    </h2>
                    <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                        Nuestra plataforma incluye todas las herramientas modernas para facilitar la organización de tu fiesta.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <Card key={index} className="border-none shadow-md hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                                    <feature.icon className="w-6 h-6 text-primary" />
                                </div>
                                <CardTitle className="text-xl">{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-base">
                                    {feature.description}
                                </CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
