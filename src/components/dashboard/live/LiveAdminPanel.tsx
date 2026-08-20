"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Trash2, ExternalLink, RefreshCw, Power, ChevronLeft, ChevronRight, Check, X, RotateCcw, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { getEventStatus } from "@/lib/expiration";
import { isAdmin as isAdminRole } from "@/lib/roles";

type ItemStatus = "PENDING" | "APPROVED" | "REJECTED";

interface LiveItem {
    id: string;
    type: string;
    fileUrl: string;
    guestName: string | null;
    createdAt: string;
    isActive: boolean;
    status: ItemStatus;
    rejectedAt: string | null;
}

interface LiveSession {
    id: string;
    publicToken: string;
    isActive: boolean;
    isModerated: boolean;
    items: LiveItem[];
    pagination: { page: number; pageSize: number; total: number; totalPages: number };
    counts: Record<ItemStatus, number>;
}

const TABS: { key: ItemStatus; label: string }[] = [
    { key: "PENDING", label: "Pendientes" },
    { key: "APPROVED", label: "Aceptadas" },
    { key: "REJECTED", label: "Rechazadas" },
];

const REJECTED_TTL_MS = 60 * 60 * 1000;

function timeLeftLabel(rejectedAt: string | null): string {
    if (!rejectedAt) return "";
    const deadline = new Date(rejectedAt).getTime() + REJECTED_TTL_MS;
    const msLeft = deadline - Date.now();
    if (msLeft <= 0) return "se está eliminando...";
    const minsLeft = Math.ceil(msLeft / 60000);
    if (minsLeft < 60) return `se elimina en ${minsLeft} min`;
    return "se elimina en menos de 1 h";
}

export function LiveAdminPanel({ invitationId, fechaEvento }: { invitationId: string; fechaEvento: string }) {
    const [session, setSession] = useState<LiveSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [tabLoading, setTabLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<ItemStatus>("PENDING");
    const [page, setPage] = useState(1);

    const { data: authSession } = useSession();
    const isAdmin = isAdminRole(authSession?.user?.role) || authSession?.user?.planTier === "ADMIN";
    const status = getEventStatus(fechaEvento);
    const canActivate = isAdmin || status === "EVENT_DAY" || status === "POST_EVENT";

    const fetchSession = useCallback(async (opts?: { silent?: boolean }) => {
        if (!opts?.silent) setTabLoading(true);
        try {
            const res = await fetch(`/api/live/session?invitationId=${invitationId}&status=${activeTab}&page=${page}`);
            if (res.ok) {
                const data = await res.json();
                setSession(data);
            } else if (res.status !== 404) {
                throw new Error("Error fetching session");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
            setTabLoading(false);
        }
    }, [invitationId, activeTab, page]);

    useEffect(() => {
        fetchSession();
        // Poll every 5 seconds si el LIVE está activo, sin mostrar el loader
        // (para no interrumpir al que está moderando mientras entran fotos).
        const interval = setInterval(() => {
            if (session?.isActive) {
                fetchSession({ silent: true });
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [fetchSession, session?.isActive]);

    const changeTab = (tab: ItemStatus) => {
        if (tab === activeTab) return;
        setActiveTab(tab);
        setPage(1);
    };

    const toggleLive = async () => {
        const activating = !session?.isActive;
        if (activating && !canActivate) {
            setErrorMsg("El LIVE solo se puede activar a partir del día del evento.");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("/api/live/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ invitationId, action: session ? "toggle" : "create" })
            });
            if (res.ok) {
                fetchSession();
            } else {
                const errText = await res.text();
                console.error("API error", errText);
                setErrorMsg("Error al activar LIVE: " + errText + "\n\n(Si dice Internal Error, probá reiniciar el servidor npm run dev para que cargue la nueva base de datos)");
            }
        } catch (err) {
            console.error("Error toggling live", err);
            setErrorMsg("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    const toggleModeration = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/live/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ invitationId, action: "toggleModeration" })
            });
            if (res.ok) {
                fetchSession();
            } else {
                setErrorMsg("Error al cambiar moderación.\n\nProbá detener la terminal y volver a correr `npm run dev` para que tome los últimos cambios de la base de datos.");
            }
        } catch (err) {
            console.error("Error toggling moderation", err);
            setErrorMsg("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    const setItemStatus = async (id: string, status: ItemStatus) => {
        // Optimista: lo sacamos de la lista actual ya mismo (va a aparecer en
        // su nueva pestaña la próxima vez que el moderador la abra).
        setSession(prev => prev ? {
            ...prev,
            items: prev.items.filter(i => i.id !== id),
            counts: { ...prev.counts, [activeTab]: Math.max(0, prev.counts[activeTab] - 1), [status]: prev.counts[status] + 1 },
        } : prev);
        try {
            const res = await fetch(`/api/live/admin/item/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status })
            });
            if (!res.ok) throw new Error("failed");
        } catch (err) {
            console.error("Error updating item status", err);
            fetchSession(); // revertir el optimismo si falló
        }
    };

    const confirmDelete = async () => {
        if (!deleteItemId) return;
        try {
            const res = await fetch(`/api/live/admin/item/${deleteItemId}`, { method: "DELETE" });
            if (res.ok) {
                setSession(prev => prev ? { ...prev, items: prev.items.filter(i => i.id !== deleteItemId) } : prev);
            }
        } catch (err) {
            console.error("Error deleting item", err);
        } finally {
            setDeleteItemId(null);
        }
    };

    if (loading && !session) return <div>Cargando...</div>;

    const isActive = session?.isActive;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const publicUrl = session ? `${origin}/live/${session.publicToken}` : '';
    const screenUrl = session ? `${origin}/live/${session.publicToken}/screen` : '';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-white/10 flex-wrap gap-3">
                <div>
                    <h3 className="font-semibold flex items-center gap-2">
                        Estado del LIVE
                        {isActive ? (
                            <span className="flex h-3 w-3 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                        ) : (
                            <span className="h-3 w-3 rounded-full bg-red-500"></span>
                        )}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        {isActive ? "Los invitados pueden subir contenido ahora." : "El LIVE está apagado."}
                    </p>
                    {!isActive && !canActivate && (
                        <p className="text-xs text-amber-500 mt-1">
                            Se habilita el día del evento.
                        </p>
                    )}
                    {!isActive && isAdmin && status !== "EVENT_DAY" && status !== "POST_EVENT" && (
                        <p className="text-xs text-amber-400 mt-1">
                            👑 Modo Administrador: podés activarlo aunque falte para el evento.
                        </p>
                    )}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
                    {session && session.counts.APPROVED > 0 && (
                        <Button asChild variant="outline" className="gap-2">
                            <a href={`/api/live/download?invitationId=${invitationId}`} target="_blank" download>
                                <Download className="w-4 h-4" />
                                <span className="hidden sm:inline">Descargar </span>{session.counts.APPROVED} fotos (ZIP)
                            </a>
                        </Button>
                    )}
                    <Button
                        onClick={toggleLive}
                        variant={isActive ? "destructive" : "default"}
                        disabled={loading || (!isActive && !canActivate)}
                        className="gap-2"
                    >
                        <Power className="w-4 h-4" />
                        {isActive ? "Apagar LIVE" : "Activar LIVE"}
                    </Button>
                </div>
            </div>

            {isActive && session && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg flex flex-col gap-3">
                        <p className="text-sm font-medium">Link para Invitados (Código QR)</p>
                        <code className="bg-background p-2 rounded border border-white/10 text-xs overflow-x-auto">
                            {publicUrl}
                        </code>
                        <div className="flex gap-3">
                            <Button asChild variant="outline" size="sm" className="gap-2 border-white/10">
                                <a href={screenUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-4 h-4" />
                                    Abrir Pantalla (Proyector)
                                </a>
                            </Button>
                        </div>
                    </div>

                    <div className="p-4 bg-muted/20 border border-white/10 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1 pr-0 sm:pr-4">
                            <h4 className="font-semibold text-sm">Moderación de contenido</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                                Si está activado, las fotos y mensajes no aparecerán en pantalla hasta que los apruebes.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">{session.isModerated ? 'Activado' : 'Desactivado'}</span>
                            <button
                                type="button"
                                onClick={toggleModeration}
                                disabled={loading}
                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${session.isModerated ? 'bg-primary' : 'bg-input'}`}
                            >
                                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${session.isModerated ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-lg">Contenido en Pantalla</h4>
                            <Button variant="ghost" size="sm" onClick={() => fetchSession()} className="gap-2">
                                <RefreshCw className={`w-4 h-4 ${tabLoading ? 'animate-spin' : ''}`} />
                                Actualizar
                            </Button>
                        </div>

                        {/* Pestañas Pendientes / Aceptadas / Rechazadas */}
                        <div className="flex gap-2 mb-4 border-b border-white/10">
                            {TABS.map(tab => (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => changeTab(tab.key)}
                                    className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                                        activeTab === tab.key
                                            ? "border-primary text-primary"
                                            : "border-transparent text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    {tab.label} ({session.counts[tab.key]})
                                </button>
                            ))}
                        </div>

                        {session.items && session.items.length > 0 ? (
                            <>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {session.items.map(item => (
                                        <div key={item.id} className="relative rounded-lg overflow-hidden border border-white/10 bg-muted/20">
                                            {item.type === "PHOTO" ? (
                                                <img src={item.fileUrl} alt="Live" className="w-full h-40 object-cover" />
                                            ) : item.type === "AUDIO" ? (
                                                <div className="w-full h-40 flex flex-col items-center justify-center bg-purple-500/10 text-purple-500 p-4 text-center">
                                                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-2">🎤</div>
                                                    <span className="text-xs font-semibold">Audio</span>
                                                </div>
                                            ) : (
                                                <div className="w-full h-40 flex flex-col items-center justify-center bg-indigo-500/10 text-indigo-500 p-4 text-center">
                                                    <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center mb-2">
                                                        💬
                                                    </div>
                                                    <span className="text-xs font-semibold">Mensaje</span>
                                                    <span className="text-[10px] mt-1 opacity-70 line-clamp-2">"{item.fileUrl}"</span>
                                                </div>
                                            )}

                                            {activeTab === "REJECTED" && (
                                                <div className="px-2 py-1 text-[10px] uppercase tracking-wider font-bold text-center bg-black/70 text-amber-400">
                                                    {timeLeftLabel(item.rejectedAt)}
                                                </div>
                                            )}

                                            <div className="p-2 border-t border-white/10 text-xs text-muted-foreground flex justify-between items-center bg-background/95 backdrop-blur-sm">
                                                <span className="truncate pr-2">{item.guestName || "Anónimo"}</span>
                                                <span>{new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                            </div>

                                            {/* Botones de moderación: siempre visibles (no por hover, que no
                                                existe en mobile), mismo estilo que "eliminar foto" del wizard. */}
                                            {activeTab === "PENDING" && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => setItemStatus(item.id, "APPROVED")}
                                                        aria-label="Aprobar"
                                                        className="absolute top-2 left-2 bg-green-600/90 hover:bg-green-600 text-white rounded-full p-1.5 shadow-lg"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setItemStatus(item.id, "REJECTED")}
                                                        aria-label="Rechazar"
                                                        className="absolute top-2 right-2 bg-destructive/90 hover:bg-destructive text-white rounded-full p-1.5 shadow-lg"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                            {activeTab === "APPROVED" && (
                                                <button
                                                    type="button"
                                                    onClick={() => setItemStatus(item.id, "REJECTED")}
                                                    aria-label="Rechazar"
                                                    className="absolute top-2 right-2 bg-destructive/90 hover:bg-destructive text-white rounded-full p-1.5 shadow-lg"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                            {activeTab === "REJECTED" && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => setItemStatus(item.id, "APPROVED")}
                                                        aria-label="Restaurar"
                                                        className="absolute top-2 right-2 bg-yellow-500/90 hover:bg-yellow-500 text-white rounded-full p-1.5 shadow-lg"
                                                    >
                                                        <RotateCcw className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeleteItemId(item.id)}
                                                        aria-label="Eliminar ahora"
                                                        className="absolute top-2 left-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 shadow-lg"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {session.pagination.totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-2 mt-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={page <= 1}
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </Button>
                                        {Array.from({ length: session.pagination.totalPages }, (_, i) => i + 1).map(p => (
                                            <Button
                                                key={p}
                                                variant={p === page ? "default" : "outline"}
                                                size="sm"
                                                className="w-9"
                                                onClick={() => setPage(p)}
                                            >
                                                {p}
                                            </Button>
                                        ))}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={page >= session.pagination.totalPages}
                                            onClick={() => setPage(p => Math.min(session.pagination.totalPages, p + 1))}
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center p-8 border border-white/10 rounded-lg border-dashed text-muted-foreground">
                                {activeTab === "PENDING" && "Todavía no hay contenido pendiente de moderar."}
                                {activeTab === "APPROVED" && "Todavía no hay contenido aceptado."}
                                {activeTab === "REJECTED" && "No hay contenido rechazado."}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal para Confirmar Eliminar Contenido */}
            <Dialog open={!!deleteItemId} onOpenChange={(open) => !open && setDeleteItemId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Eliminar contenido</DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de que querés eliminar este contenido ahora mismo? No se podrá recuperar.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteItemId(null)}>Cancelar</Button>
                        <Button variant="destructive" onClick={confirmDelete}>Eliminar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal para Errores */}
            <Dialog open={!!errorMsg} onOpenChange={(open) => !open && setErrorMsg(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>¡Ups! Hubo un problema</DialogTitle>
                        <DialogDescription className="whitespace-pre-wrap">
                            {errorMsg}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setErrorMsg(null)}>Entendido</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
