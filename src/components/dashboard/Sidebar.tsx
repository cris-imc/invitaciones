"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
    BarChart,
    Calendar,
    Heart,
    Home,
    LogOut,
    Settings,
    Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const allSidebarItems = [
    {
        title: "Inicio",
        href: "/dashboard",
        icon: Home,
    },
    {
        title: "Mis Invitaciones",
        href: "/dashboard/invitaciones",
        icon: Heart,
    },
    {
        title: "Analytics",
        href: "/dashboard/analytics",
        icon: BarChart,
    }
];

export function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const role = session?.user?.role || "CLIENT";

    // Filter items based on role
    const sidebarItems = allSidebarItems.filter(item => {
        if (role === "ADMIN") {
            // Admin solo ve Inicio y Analytics
            return item.title === "Inicio" || item.title === "Analytics";
        }
        // Client ve todo lo definido arriba
        return true;
    });

    return (
        <>
            {/* DESKTOP SIDEBAR */}
            <aside className="p-side">
                <div className="p-brand">
                    <div className="seal" style={{ borderColor: 'var(--line)', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--line)' }}>
                        <span className="font-display" style={{ color: 'var(--paper)', fontSize: 15, fontWeight: 700 }}>C</span>
                    </div>
                    Convite
                </div>

                <nav className="p-nav flex-1">
                    {sidebarItems.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            className={pathname === item.href ? "active" : ""}
                        >
                            <b><item.icon className="w-4 h-4" /></b>
                            {item.title}
                        </Link>
                    ))}
                </nav>

                <div className="p-side-foot">
                    <div className="seal">
                        <span className="font-display">{session?.user?.name?.charAt(0).toUpperCase() || 'U'}</span>
                    </div>
                    <div className="who flex-1">
                        <b>{session?.user?.name || 'Mi Cuenta'}</b>
                        <span className="text-xs opacity-70 truncate">{session?.user?.email || 'Ver Perfil'}</span>
                    </div>
                    <button onClick={() => signOut({ callbackUrl: '/login' })} className="text-danger hover:text-danger/80">
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </aside>

            {/* MOBILE NAV (Tira horizontal de tabs) */}
            <nav className="p-nav-mobile md:hidden">
                {sidebarItems.map((item, index) => (
                    <Link
                        key={index}
                        href={item.href}
                        className={pathname === item.href ? "active" : ""}
                    >
                        <b><item.icon className="w-4 h-4" /></b>
                        {item.title}
                    </Link>
                ))}
            </nav>
        </>
    );
}
