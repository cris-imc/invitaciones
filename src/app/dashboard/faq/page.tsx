import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { FAQ_ITEMS } from "@/lib/faq-data";

export const metadata = {
    title: "Preguntas frecuentes | Convite",
};

// Misma lista que la sección #faq de la landing pública (src/app/page.tsx),
// pero accesible sin salir del panel -- se llega acá desde el menú de Ayuda
// (Sidebar.tsx), tanto en desktop como en mobile.
export default async function DashboardFaqPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }

    return (
        <div className="w-full max-w-2xl mx-auto py-8 px-4 sm:px-0">
            <div className="mb-8">
                <h1 className="text-3xl font-display font-bold mb-2">Preguntas frecuentes</h1>
                <p className="text-white/60">Dudas comunes sobre cómo funciona Alta Invitación</p>
            </div>

            <div className="bg-[var(--ink)]/50 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-sm border border-[var(--ink-2)]">
                <div className="space-y-0 divide-y divide-white/10">
                    {FAQ_ITEMS.map((item) => (
                        <details key={item.q} className="group py-5">
                            <summary className="flex justify-between items-center cursor-pointer list-none font-semibold text-sm md:text-base gap-4 hover:text-[var(--accent)] transition-colors">
                                {item.q}
                                <span className="text-[var(--accent)] text-xl shrink-0 transition-transform duration-200 group-open:rotate-45">+</span>
                            </summary>
                            <p className="mt-3 text-white/60 text-sm leading-relaxed">{item.a}</p>
                        </details>
                    ))}
                </div>
            </div>
        </div>
    );
}
