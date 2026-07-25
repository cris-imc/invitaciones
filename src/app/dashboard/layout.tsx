import { Sidebar } from "@/components/dashboard/Sidebar";
import { AuthProvider } from "@/components/providers/AuthProvider";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthProvider>
            <div className="flex min-h-screen justify-center md:py-6 md:px-6 bg-black">
                <div className="panel w-full max-w-[1180px]">
                    <Sidebar />
                    <main className="p-main relative">
                        {children}
                    </main>
                </div>
            </div>
        </AuthProvider>
    );
}
