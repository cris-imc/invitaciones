import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ProfileForm } from "./ProfileForm";

export const metadata = {
    title: "Mi Perfil | Convite",
};

export default async function PerfilPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }

    return (
        <div className="w-full max-w-2xl mx-auto py-8 px-4 sm:px-0">
            <div className="mb-8">
                <h1 className="text-3xl font-display font-bold mb-2">Mi Perfil</h1>
                <p className="text-white/60">Administrá tus datos personales</p>
            </div>

            <div className="bg-[var(--ink)]/50 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-sm border border-[var(--ink-2)]">
                <ProfileForm 
                    initialName={session.user.name || ""} 
                    email={session.user.email || ""} 
                />
            </div>
        </div>
    );
}
