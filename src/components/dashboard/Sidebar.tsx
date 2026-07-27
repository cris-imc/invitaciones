"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BarChart, Heart, Home, LogOut, Menu, X } from "lucide-react";
import { useWizardStore } from "@/store/wizard-store";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const allSidebarItems = [
    { title: "Inicio", href: "/dashboard", icon: Home },
    { title: "Mis Invitaciones", href: "/dashboard/invitaciones", icon: Heart },
];

export function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const role = session?.user?.role || "CLIENT";
    const [open, setOpen] = useState(false);
    const { isDirty, setDirty } = useWizardStore();
    const router = useRouter();
    const [showWarning, setShowWarning] = useState(false);
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

    // Close drawer on route change
    useEffect(() => { setOpen(false); }, [pathname]);
    // Prevent body scroll when open
    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [open]);

    const sidebarItems = allSidebarItems.filter(item => {
        if (role === "ADMIN") return item.title === "Inicio";
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

            {sidebarItems.map((item, index) => (
                <Link
                    key={index}
                    href={item.href}
                    className={pathname === item.href || pathname.startsWith(item.href + "/") ? "active" : ""}
                    onClick={(e) => handleNavClick(e, item.href, onClick)}
                >
                    <b><item.icon className="w-4 h-4" /></b>
                    {item.title}
                </Link>
            ))}
        </>
    );

    return (
        <>
            {/* ── DESKTOP SIDEBAR ── */}
            <aside className="p-side">
                <div className="p-brand">
                    <div className="seal" style={{ borderColor: "var(--line)", width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--line)" }}>
                        <span className="font-display" style={{ color: "var(--paper)", fontSize: 15, fontWeight: 700 }}>C</span>
                    </div>
                    Convite
                </div>

                <nav className="p-nav flex-1">
                    <NavLinks />
                </nav>

                <div className="p-side-foot">
                    <div className="seal">
                        <span className="font-display">{session?.user?.name?.charAt(0).toUpperCase() || "U"}</span>
                    </div>
                    <div className="who flex-1">
                        <b>{session?.user?.name || "Mi Cuenta"}</b>
                        <span className="text-xs opacity-70 truncate">{session?.user?.email || "Ver Perfil"}</span>
                    </div>
                    <button onClick={() => signOut({ callbackUrl: "/login" })} className="text-danger hover:text-danger/80">
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </aside>

            {/* ── MOBILE TOP BAR ── */}
            <header className="p-mobile-topbar md:hidden">
                <div className="p-brand" style={{ margin: 0 }}>
                    <div className="seal" style={{ borderColor: "var(--line)", width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--line)" }}>
                        <span className="font-display" style={{ color: "var(--paper)", fontSize: 13, fontWeight: 700 }}>C</span>
                    </div>
                    Convite
                </div>
                <button
                    className="p-hamburger"
                    onClick={() => setOpen(true)}
                    aria-label="Abrir menú"
                >
                    <Menu className="w-5 h-5" />
                </button>
            </header>

            {/* ── MOBILE DRAWER OVERLAY ── */}
            {open && (
                <div className="p-drawer-overlay" onClick={() => setOpen(false)} />
            )}

            {/* ── MOBILE DRAWER ── */}
            <div className={`p-drawer md:hidden ${open ? "open" : ""}`}>
                <div className="p-drawer-head">
                    <div className="p-brand" style={{ margin: 0 }}>
                        <div className="seal" style={{ borderColor: "var(--line)", width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--line)" }}>
                            <span className="font-display" style={{ color: "var(--paper)", fontSize: 13, fontWeight: 700 }}>C</span>
                        </div>
                        Convite
                    </div>
                    <button className="p-hamburger" onClick={() => setOpen(false)} aria-label="Cerrar menú">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="p-nav flex-1" style={{ padding: "8px 0" }}>
                    <NavLinks onClick={() => setOpen(false)} />
                </nav>

                <div className="p-side-foot">
                    <div className="seal">
                        <span className="font-display">{session?.user?.name?.charAt(0).toUpperCase() || "U"}</span>
                    </div>
                    <div className="who flex-1">
                        <b>{session?.user?.name || "Mi Cuenta"}</b>
                        <span className="text-xs opacity-70 truncate">{session?.user?.email || "Ver Perfil"}</span>
                    </div>
                    <button onClick={() => signOut({ callbackUrl: "/login" })} className="text-danger hover:text-danger/80">
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </>
    );
}
