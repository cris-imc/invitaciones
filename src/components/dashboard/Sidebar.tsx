"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Archive, BarChart3, Home, LogOut, User, UserPlus, Plus, Percent } from "lucide-react";
import { useWizardStore } from "@/store/wizard-store";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { NewInvitationButton } from "@/components/dashboard/NewInvitationButton";
import { CreateUserButton } from "@/components/dashboard/CreateUserButton";
import { HelpMenu } from "@/components/dashboard/HelpMenu";
import { LandingLogo } from "@/components/ui/Logo";
import { isAdmin } from "@/lib/roles";
import { useTextos } from "@/components/i18n/ProveedorIdioma";
import type { ClaveTexto } from "@/lib/i18n/texto";

// El `id` es lo que identifica a cada item en los filtros de abajo: el título
// visible ahora cambia con el idioma y no sirve para comparar.
const allSidebarItems = [
    { id: "inicio", texto: "panel.sidebar.inicio", href: "/dashboard", icon: Home },
    { id: "inactivas", texto: "panel.sidebar.inactivas", href: "/dashboard/invitaciones", icon: Archive },
    { id: "misDatos", texto: "panel.sidebar.misDatos", href: "/dashboard/perfil", icon: User },
    { id: "descuentos", texto: "panel.sidebar.descuentos", href: "/dashboard/descuentos", icon: Percent },
    { id: "registros", texto: "panel.sidebar.registros", href: "/dashboard/registros", icon: BarChart3 },
] satisfies { id: string; texto: ClaveTexto; href: string; icon: typeof Home }[];

export function Sidebar() {
    const pathname = usePathname();
    const t = useTextos();
    const { data: session } = useSession();
    const isAuthenticated = Boolean(session?.user);
    const role = session?.user?.role || "CLIENT";
    const { isDirty, setDirty, data: wizardData } = useWizardStore();
    const isNewInvitation = !wizardData.id;
    const router = useRouter();
    const [showWarning, setShowWarning] = useState(false);
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
    const [premiumCredits, setPremiumCredits] = useState(0);
    const [diamondCredits, setDiamondCredits] = useState(0);
    const [hasFreeInvitation, setHasFreeInvitation] = useState(false);
    const [mounted, setMounted] = useState(false);

    // El PageTransition global (template.tsx) anima "filter" en cada cambio
    // de pagina, lo que crea un containing block nuevo para position:fixed
    // (ver comentario igual en ImageCropper.tsx). Si esa animacion queda
    // "trabada" -- típicamente al volver de background/lock screen, porque
    // el callback que limpia el filter depende de un rAF que el navegador
    // pausa en segundo plano -- la topbar y la botonera (fixed) dejan de
    // anclarse a la pantalla real y se anclan al alto de toda la pagina,
    // generando el espacio de scroll fantasma. Un portal a <body> las
    // escapa de ese containing block por completo, sin depender de que
    // ese cleanup llegue a tiempo.
    useEffect(() => {
        setMounted(true);
    }, []);

    // Créditos premium para el item "Nueva invitación" de la botonera mobile
    // (el admin no crea invitaciones para si mismo, no aplica).
    useEffect(() => {
        if (role !== "CLIENT") return;
        fetch("/api/user/credits")
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => {
                if (data) {
                    setPremiumCredits(data.premiumCredits || 0);
                    setDiamondCredits(data.diamondCredits || 0);
                    setHasFreeInvitation(Boolean(data.hasFreeInvitation));
                }
            })
            .catch(() => {});
    }, [role]);

    // Wizard público sin cuenta (/dashboard/invitaciones/crear visitado desde
    // "Empezar gratis" en la landing, sin sesión -- ver StepInfoAdicional.tsx
    // y /register?from=wizard): el menú se ve casi igual que logueado, pero
    // sin nada que dependa de una cuenta real (Inactivas, Mis Datos, cerrar
    // sesión, la botonera mobile entera).
    const sidebarItems = allSidebarItems.filter(item => {
        if (isAdmin(role)) return item.id === "inicio" || item.id === "misDatos" || item.id === "descuentos" || item.id === "registros";
        if (!isAuthenticated) return item.id === "inicio";
        return item.id !== "descuentos" && item.id !== "registros";
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
                // Sin sesión, "/dashboard" redirige a /login -- "Inicio" va a
                // la landing en su lugar.
                const href = !isAuthenticated && item.href === "/dashboard" ? "/" : item.href;
                const isActive = pathname === item.href;

                return (
                    <Link
                        key={index}
                        href={href}
                        className={isActive ? "active" : ""}
                        onClick={(e) => handleNavClick(e, href, onClick)}
                    >
                        <b><item.icon className="w-4 h-4" /></b>
                        {t(item.texto)}
                    </Link>
                );
            })}

            <HelpMenu variant="desktop" />


            {isAuthenticated && (
                <div className="mt-2 px-2">
                    <button onClick={handleSignOut} className="sidebar-signout-btn w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold">
                        <LogOut className="w-4 h-4" />
                        {t("panel.sidebar.cerrarSesion")}
                    </button>
                </div>
            )}
        </>
    );

    return (
        <>
            <Dialog open={showWarning} onOpenChange={setShowWarning}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isNewInvitation ? t("panel.sidebar.salirSinTerminar") : t("panel.sidebar.cambiosSinGuardar")}</DialogTitle>
                        <DialogDescription>
                            {isNewInvitation
                                ? t("panel.sidebar.salirNuevaDetalle")
                                : t("panel.sidebar.salirEdicionDetalle")}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowWarning(false)}>
                            {t("comun.cancelar")}
                        </Button>
                        <Button variant="destructive" onClick={proceedNavigation}>
                            {isNewInvitation ? t("panel.sidebar.salirYPerder") : t("panel.sidebar.salirSinGuardar")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── DESKTOP SIDEBAR ── */}
            <aside className="p-side">
                <div className="p-brand">
                    <LandingLogo fullWidth className="w-3/4 h-auto block" />
                </div>

                <nav className="p-nav flex-1">
                    <NavLinks />
                </nav>

            </aside>

            {mounted && createPortal(
                <>
                    {/* ── MOBILE TOP BAR ── */}
                    <header className="p-mobile-topbar md:hidden">
                        <div className="p-brand" style={{ margin: 0 }}>
                            <LandingLogo className="h-[50px] w-auto" />
                        </div>
                        <div className="flex items-center gap-2">
                            <HelpMenu variant="mobile" />
                        </div>
                    </header>

                    {/* ── MOBILE BOTTOM NAV (botonera con Inicio elevado al centro) ──
                        Todos sus items dependen de una cuenta real -- sin
                        sesión (wizard público) se oculta entera. */}
                    {isAuthenticated && (
                    <div className="p-bottom-nav md:hidden">
                        {isAdmin(role) ? (
                            <Link
                                href="/dashboard/descuentos"
                                className={`p-bottom-nav-item ${pathname === "/dashboard/descuentos" ? "active" : ""}`}
                                onClick={(e) => handleNavClick(e, "/dashboard/descuentos")}
                                aria-label={t("panel.sidebar.descuentos")}
                            >
                                <Percent className="w-5 h-5" />
                                <span>{t("panel.sidebar.descuentosCorto")}</span>
                            </Link>
                        ) : (
                            <NewInvitationButton
                                premiumCredits={premiumCredits}
                                diamondCredits={diamondCredits}
                                totalInvitations={0}
                                planTier={session?.user?.planTier}
                                hasFreeInvitation={hasFreeInvitation}
                                renderTrigger={(onClick) => (
                                    <button onClick={onClick} className="p-bottom-nav-item" aria-label={t("panel.sidebar.nuevaInvitacion")}>
                                        <Plus className="w-5 h-5" style={{ color: "var(--accent)" }} />
                                        <span>{t("panel.sidebar.nuevaCorto")}</span>
                                    </button>
                                )}
                            />
                        )}

                        {isAdmin(role) ? (
                            <CreateUserButton
                                renderTrigger={(onClick) => (
                                    <button onClick={onClick} className="p-bottom-nav-item" aria-label={t("panel.sidebar.nuevoUsuario")}>
                                        <UserPlus className="w-5 h-5" />
                                        <span>{t("panel.sidebar.nuevoUsuarioCorto")}</span>
                                    </button>
                                )}
                            />
                        ) : (
                            <Link
                                href="/dashboard/invitaciones"
                                className={`p-bottom-nav-item ${pathname === "/dashboard/invitaciones" ? "active" : ""}`}
                                onClick={(e) => handleNavClick(e, "/dashboard/invitaciones")}
                                aria-label={t("panel.sidebar.inactivas")}
                            >
                                <Archive className="w-5 h-5" />
                                <span>{t("panel.sidebar.inactivas")}</span>
                            </Link>
                        )}

                        <Link
                            href="/dashboard"
                            className={`p-bottom-nav-home-wrap ${pathname === "/dashboard" ? "active" : ""}`}
                            onClick={(e) => handleNavClick(e, "/dashboard")}
                            aria-label={t("panel.sidebar.irAInicio")}
                        >
                            <span className="p-bottom-nav-home">
                                <Home className="w-5 h-5" />
                            </span>
                            <span>{t("panel.sidebar.inicio")}</span>
                        </Link>

                        {isAdmin(role) ? (
                            <Link
                                href="/dashboard/registros"
                                className={`p-bottom-nav-item ${pathname === "/dashboard/registros" ? "active" : ""}`}
                                onClick={(e) => handleNavClick(e, "/dashboard/registros")}
                                aria-label={t("panel.sidebar.registros")}
                            >
                                <BarChart3 className="w-5 h-5" />
                                <span>{t("panel.sidebar.registrosCorto")}</span>
                            </Link>
                        ) : (
                            <Link
                                href="/dashboard/perfil"
                                className={`p-bottom-nav-item ${pathname === "/dashboard/perfil" ? "active" : ""}`}
                                onClick={(e) => handleNavClick(e, "/dashboard/perfil")}
                                aria-label={t("panel.sidebar.misDatos")}
                            >
                                <User className="w-5 h-5" />
                                <span>{t("panel.sidebar.misDatosCorto")}</span>
                            </Link>
                        )}

                        <button onClick={handleSignOut} className="p-bottom-nav-item" aria-label={t("panel.sidebar.cerrarSesion")}>
                            <LogOut className="w-5 h-5 text-red-500" />
                            <span>{t("panel.sidebar.salirCorto")}</span>
                        </button>
                    </div>
                    )}
                </>,
                document.body
            )}
        </>
    );
}
