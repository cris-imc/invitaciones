import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { FAQ_CLAVES } from "@/lib/faq-claves";
import type { ClaveTexto } from "@/lib/i18n/texto";
import { textosDelAnfitrion } from "@/lib/i18n/servidor";

// El título de la pestaña también sigue al idioma, así que se arma en tiempo
// de pedido y no como constante.
export async function generateMetadata() {
    const t = await textosDelAnfitrion();
    return { title: t("panel.faq.tituloPagina") };
}

// Las mismas preguntas que /preguntas, pero sin salir del panel -- se llega
// acá desde el menú de Ayuda (Sidebar.tsx), en desktop y en mobile.
//
// Salen del diccionario y no de una lista propia: antes había dos copias del
// texto, una acá y otra en la landing, y se desincronizaron -- una pregunta
// agregada de un lado no aparecía del otro.
export default async function DashboardFaqPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }

    const t = await textosDelAnfitrion();

    return (
        <div className="w-full max-w-2xl mx-auto py-8 px-4 sm:px-0">
            <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                <h1 className="text-3xl font-display font-bold mb-2">{t("panel.faq.titulo")}</h1>
                <p className="text-[var(--shell-fg-soft)]">{t("panel.faq.detalle")}</p>
                </div>
            </div>

            <div className="bg-[var(--ink)]/50 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-sm border border-[var(--line)]">
                <div className="space-y-0 divide-y divide-[var(--line)]">
                    {FAQ_CLAVES.map((clave) => (
                        <details key={clave} className="group py-5">
                            <summary className="flex justify-between items-center cursor-pointer list-none font-semibold text-sm md:text-base gap-4 hover:text-[var(--accent)] transition-colors">
                                {t(`landing.faq.${clave}.q` as ClaveTexto)}
                                <span className="text-[var(--accent)] text-xl shrink-0 transition-transform duration-200 group-open:rotate-45">+</span>
                            </summary>
                            <p className="mt-3 text-[var(--shell-fg-soft)] text-sm leading-relaxed">{t(`landing.faq.${clave}.a` as ClaveTexto)}</p>
                        </details>
                    ))}
                </div>
            </div>
        </div>
    );
}
