import { Sidebar } from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
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

