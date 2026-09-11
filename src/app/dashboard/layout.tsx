import { Sidebar } from "@/components/dashboard/Sidebar";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { PhoneReminderModal } from "@/components/dashboard/PhoneReminderModal";
import { PendingWizardInvitationBridge } from "@/components/dashboard/PendingWizardInvitationBridge";
import { PendingInvitationUpgradeBridge } from "@/components/dashboard/PendingInvitationUpgradeBridge";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    
    // Si el usuario fue forzado por admin a cambiar la clave
    if (session?.user?.mustChangePassword) {
        redirect("/forzar-cambio-clave");
    }

    return (
        <div className="flex min-h-dvh justify-center md:py-6 md:px-6 bg-background">
            <div className="panel w-full max-w-[1180px]">
                <Sidebar />
                <main className="p-main relative">
                    {/* Arriba a la derecha, igual que en el nav de la landing:
                        así no cambia de lugar al entrar al panel. Sólo en
                        escritorio -- en mobile vive en la barra de arriba, al
                        lado de Ayuda, porque acá se superpondría con el
                        contenido. */}
                    <div className="hidden md:block absolute top-6 right-6 z-30">
                        <ThemeToggle />
                    </div>
                    {children}
                </main>
            </div>
            <PhoneReminderModal />
            <PendingWizardInvitationBridge />
            <PendingInvitationUpgradeBridge />
        </div>
    );
}

