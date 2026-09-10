import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { FAQ_ITEMS } from "@/lib/faq-data";
import { PreferenciasUsuario } from "@/components/dashboard/PreferenciasUsuario";
import { textosDelAnfitrion } from "@/lib/i18n/servidor";

// El título de la pestaña también sigue al idioma, así que se arma en tiempo
// de pedido y no como constante.
export async function generateMetadata() {
    const t = await textosDelAnfitrion();
    return { title: t("panel.faq.tituloPagina") };
}

// Misma lista que la sección #faq de la landing pública (src/app/page.tsx),
// pero accesible sin salir del panel -- se llega acá desde el menú de Ayuda
// (Sidebar.tsx), tanto en desktop como en mobile.
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
                <PreferenciasUsuario />
            </div>

            <div className="bg-[var(--ink)]/50 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-sm border border-[var(--line)]">
                <div className="space-y-0 divide-y divide-[var(--line)]">
                    {FAQ_ITEMS.map((item) => (
                        <details key={item.q} className="group py-5">
                            <summary className="flex justify-between items-center cursor-pointer list-none font-semibold text-sm md:text-base gap-4 hover:text-[var(--accent)] transition-colors">
                                {item.q}
                                <span className="text-[var(--accent)] text-xl shrink-0 transition-transform duration-200 group-open:rotate-45">+</span>
                            </summary>
                            <p className="mt-3 text-[var(--shell-fg-soft)] text-sm leading-relaxed">{item.a}</p>
                        </details>
                    ))}
                </div>
            </div>
        </div>
    );
}
