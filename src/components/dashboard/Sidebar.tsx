"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Archive, BarChart3, Home, LogOut, User, UserPlus, Plus } from "lucide-react";
import { useWizardStore } from "@/store/wizard-store";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { NewInvitationButton } from "@/components/dashboard/NewInvitationButton";
import { CreateUserButton } from "@/components/dashboard/CreateUserButton";

const allSidebarItems = [
    { title: "Inicio", href: "/dashboard", icon: Home },
    { title: "Inactivas", href: "/dashboard/invitaciones", icon: Archive },
    { title: "Mis Datos", href: "/dashboard/perfil", icon: User },
];

export function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const role = session?.user?.role || "CLIENT";
    const { isDirty, setDirty } = useWizardStore();
    const router = useRouter();
    const [showWarning, setShowWarning] = useState(false);
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
    const [premiumCredits, setPremiumCredits] = useState(0);

    // Créditos premium para el item "Nueva invitación" de la botonera mobile
    // (el admin no crea invitaciones para si mismo, no aplica).
    useEffect(() => {
        if (role !== "CLIENT") return;
        fetch("/api/user/credits")
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => { if (data) setPremiumCredits(data.premiumCredits || 0); })
            .catch(() => {});
    }, [role]);

    const sidebarItems = allSidebarItems.filter(item => {
        if (role === "ADMIN") return item.title === "Inicio" || item.title === "Mis Datos";
        return true;
    });

    const handleNavClick = (e: React.MouseEvent, href: string, originalOnClick?: () => void) => {
        if (isDirty) {
            e.preventDefault(); // Stop Next.js link navigation immediately
            setPendingAction(() => () => {
                setDirty(false);
                if (originalOnClick) originalOnClick();
                router.push(href);
            });
            setShowWarning(true);
            return;
        }
        if (originalOnClick) originalOnClick();
    };

    const handleSignOut = () => {
        if (isDirty) {
            setPendingAction(() => () => {
                setDirty(false);
                signOut({ callbackUrl: "/login" });
            });
            setShowWarning(true);
            return;
        }
        setDirty(false);
        signOut({ callbackUrl: "/login" });
    };

    const proceedNavigation = () => {
        if (pendingAction) {
            pendingAction();
        }
        setShowWarning(false);
    };

    const NavLinks = ({ onClick }: { onClick?: () => void }) => (
        <>
            {sidebarItems.map((item, index) => {
                const isActive = pathname === item.href;

                return (
                    <Link
                        key={index}
                        href={item.href}
                        className={isActive ? "active" : ""}
                        onClick={(e) => handleNavClick(e, item.href, onClick)}
                    >
                        <b><item.icon className="w-4 h-4" /></b>
                        {item.title}
                    </Link>
                );
            })}
            
            <div className="mt-4 px-2">
                <button onClick={handleSignOut} className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 py-2 rounded-lg text-sm font-semibold transition-colors">
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
                </button>
            </div>
        </>
    );

    return (
        <>
            <Dialog open={showWarning} onOpenChange={setShowWarning}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cambios sin guardar</DialogTitle>
                        <DialogDescription>
                            Tenés cambios sin guardar en la invitación. ¿Estás seguro de que querés salir sin aplicar los cambios?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowWarning(false)}>
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={proceedNavigation}>
                            Salir sin guardar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── DESKTOP SIDEBAR ── */}
            <aside className="p-side">
                <div className="p-brand">
                    <Link href="/" className="flex flex-col leading-none hover:opacity-80 transition-opacity">
                        <span className="text-[10px] font-sans font-bold tracking-widest uppercase opacity-70">
                            Invitaciones
                        </span>
                        <span className="text-sm font-sans font-bold tracking-[0.2em] uppercase -mt-1">
                            Digitales
                        </span>
                    </Link>
                </div>

                <nav className="p-nav flex-1">
                    <NavLinks />
                </nav>

            </aside>

            {/* ── MOBILE TOP BAR ── */}
            <header className="p-mobile-topbar md:hidden">
                <div className="p-brand" style={{ margin: 0 }}>
                    <Link href="/" className="flex flex-col leading-none hover:opacity-80 transition-opacity">
                        <span className="text-[10px] font-sans font-bold tracking-widest uppercase opacity-70">
                            Invitaciones
                        </span>
                        <span className="text-sm font-sans font-bold tracking-[0.2em] uppercase -mt-1">
                            Digitales
                        </span>
                    </Link>
                </div>
            </header>

            {/* ── MOBILE BOTTOM NAV (botonera con Inicio elevado al centro) ── */}
            <div className="p-bottom-nav md:hidden" data-debug-role={role}>
                <button onClick={handleSignOut} className="p-bottom-nav-item" aria-label="Cerrar sesión">
                    <LogOut className="w-5 h-5" />
                    <span>Salir</span>
                </button>

                {role === "ADMIN" ? (
                    <CreateUserButton
                        renderTrigger={(onClick) => (
                            <button onClick={onClick} className="p-bottom-nav-item" aria-label="Nuevo Usuario">
                                <UserPlus className="w-5 h-5" />
                                <span>Alta</span>
                            </button>
                        )}
                    />
                ) : (
                    <Link
                        href="/dashboard/invitaciones"
                        className={`p-bottom-nav-item ${pathname === "/dashboard/invitaciones" ? "active" : ""}`}
                        onClick={(e) => handleNavClick(e, "/dashboard/invitaciones")}
                        aria-label="Inactivas"
                    >
                        <Archive className="w-5 h-5" />
                        <span>Inactivas</span>
                    </Link>
                )}

                <Link
                    href="/dashboard"
                    className={`p-bottom-nav-home-wrap ${pathname === "/dashboard" ? "active" : ""}`}
                    onClick={(e) => handleNavClick(e, "/dashboard")}
                    aria-label="Ir a Inicio"
                >
                    <span className="p-bottom-nav-home">
                        <Home className="w-5 h-5" />
                    </span>
                    <span>Inicio</span>
                </Link>

                <Link
                    href="/dashboard/perfil"
                    className={`p-bottom-nav-item ${pathname === "/dashboard/perfil" ? "active" : ""}`}
                    onClick={(e) => handleNavClick(e, "/dashboard/perfil")}
                    aria-label="Mis Datos"
                >
                    <User className="w-5 h-5" />
                    <span>Datos</span>
                </Link>

                {role === "ADMIN" ? (
                    <Link
                        href="/dashboard/registros"
                        className={`p-bottom-nav-item ${pathname === "/dashboard/registros" ? "active" : ""}`}
                        onClick={(e) => handleNavClick(e, "/dashboard/registros")}
                        aria-label="Registros"
                    >
                        <BarChart3 className="w-5 h-5" />
                        <span>Registros</span>
                    </Link>
                ) : (
                    <NewInvitationButton
                        premiumCredits={premiumCredits}
                        totalInvitations={0}
                        planTier={session?.user?.planTier}
                        renderTrigger={(onClick) => (
                            <button onClick={onClick} className="p-bottom-nav-item" aria-label="Nueva invitación">
                                <Plus className="w-5 h-5" />
                                <span>Nueva</span>
                            </button>
                        )}
                    />
                )}
            </div>
        </>
    );
}
