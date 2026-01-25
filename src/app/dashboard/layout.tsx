import { Sidebar } from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-background">
            <div className="hidden md:flex flex-shrink-0">
                <Sidebar />
            </div>

            <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900/20">
                {/* Mobile Header would go here */}
                <div className="min-h-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
