import { Sidebar } from "@/components/dashboard/Sidebar";
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
        <div className="flex min-h-dvh justify-center md:py-6 md:px-6 bg-black">
            <div className="panel w-full max-w-[1180px]">
                <Sidebar />
                <main className="p-main relative">
                    {children}
                </main>
            </div>
        </div>
    );
}

