import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProfileForm } from "./ProfileForm";
import { PreferenciasUsuario } from "@/components/dashboard/PreferenciasUsuario";
import { esCodigoPais } from "@/lib/paises";
import { textosDelAnfitrion } from "@/lib/i18n/servidor";

// El título de la pestaña también sigue al idioma, así que se arma en tiempo
// de pedido y no como constante.
export async function generateMetadata() {
    const t = await textosDelAnfitrion();
    return { title: t("panel.perfil.tituloPagina") };
}

export default async function PerfilPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }

    const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { phoneAreaCode: true, phoneNumber: true, pais: true },
    });

    const paisGuardado = dbUser?.pais;
    const t = await textosDelAnfitrion();

    return (
        <div className="w-full max-w-2xl mx-auto py-8 px-4 sm:px-0">
            <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold mb-2">{t("panel.perfil.titulo")}</h1>
                    <p className="text-[var(--shell-fg-soft)]">{t("panel.perfil.detalle")}</p>
                </div>
                <PreferenciasUsuario />
            </div>

            <div className="bg-[var(--ink)]/50 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-sm border border-[var(--line)]">
                <ProfileForm
                    initialName={session.user.name || ""}
                    email={session.user.email || ""}
                    initialPhoneAreaCode={dbUser?.phoneAreaCode || ""}
                    initialPhoneNumber={dbUser?.phoneNumber || ""}
                    initialPais={esCodigoPais(paisGuardado) ? paisGuardado : "AR"}
                />
            </div>
        </div>
    );
}
