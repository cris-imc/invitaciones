"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

const sidebarItems = [
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
        title: "Clientes (Admin)",
        href: "/dashboard/clientes",
        icon: Users,
        adminOnly: true,
    },
    {
        title: "Analytics",
        href: "/dashboard/analytics",
        icon: BarChart,
    },
    {
        title: "Configuración",
        href: "/dashboard/configuracion",
        icon: Settings,
    },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-screen bg-card text-card-foreground w-64 border-r fixed left-0 top-0">
            <div className="p-6 border-b shrink-0">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                    <Calendar className="w-6 h-6 text-primary" />
                    <span>InvitaDigital</span>
                </Link>
            </div>

            <div className="flex-1 py-4 overflow-hidden">
                <nav className="flex flex-col gap-1 px-2">
                    {sidebarItems.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                pathname === item.href
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.title}
                        </Link>
                    ))}
                </nav>
            </div>

            <div className="p-4 border-t shrink-0">
                <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive">
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
                </Button>
            </div>
        </div>
    );
}
