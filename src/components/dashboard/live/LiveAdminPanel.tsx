"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Trash2, ExternalLink, RefreshCw, Power } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { getEventStatus } from "@/lib/expiration";

interface LiveItem {
    id: string;
    type: string;
    fileUrl: string;
    guestName: string | null;
    createdAt: string;
    isActive: boolean;
}

interface LiveSession {
    id: string;
    publicToken: string;
    isActive: boolean;
    isModerated: boolean;
    items: LiveItem[];
}

export function LiveAdminPanel({ invitationId, fechaEvento }: { invitationId: string; fechaEvento: string }) {
    const [session, setSession] = useState<LiveSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const { data: authSession } = useSession();
    const isAdmin = authSession?.user?.role === "ADMIN" || authSession?.user?.planTier === "ADMIN";
    const isEventDay = getEventStatus(fechaEvento) === "EVENT_DAY";
    const canActivate = isAdmin || isEventDay;

    const fetchSession = useCallback(async () => {
        try {
            const res = await fetch(`/api/live/session?invitationId=${invitationId}`);
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
        }
    }, [invitationId]);

    useEffect(() => {
        fetchSession();
        // Poll every 5 seconds if active
        const interval = setInterval(() => {
            if (session?.isActive) {
                fetchSession();
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [fetchSession, session?.isActive]);

    const toggleLive = async () => {
        const activating = !session?.isActive;
        if (activating && !canActivate) {
            setErrorMsg("El LIVE solo se puede activar el día del evento.");
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
                const data = await res.json();
                setSession(data);
                fetchSession(); // Re-fetch to get items if needed
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
                const data = await res.json();
                setSession(data);
            } else {
                const errText = await res.text();
                setErrorMsg("Error al cambiar moderación.\n\nProbá detener la terminal y volver a correr `npm run dev` para que tome los últimos cambios de la base de datos.");
            }
        } catch (err) {
            console.error("Error toggling moderation", err);
            setErrorMsg("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    const toggleItemActive = async (id: string, currentActive: boolean) => {
        try {
            const res = await fetch(`/api/live/admin/item/${id}`, { 
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !currentActive })
            });
            if (res.ok) {
                setSession(prev => prev ? { 
                    ...prev, 
                    items: prev.items.map(i => i.id === id ? { ...i, isActive: !currentActive } : i) 
                } : prev);
            }
        } catch (err) {
            console.error("Error toggling item", err);
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
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border flex-wrap gap-3">
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
                    {!isActive && isAdmin && !isEventDay && (
                        <p className="text-xs text-amber-400 mt-1">
                            👑 Modo Administrador: podés activarlo aunque no sea el día del evento.
                        </p>
                    )}
                </div>
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

            {isActive && session && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg flex flex-col gap-3">
                        <p className="text-sm font-medium">Link para Invitados (Código QR)</p>
                        <code className="bg-background p-2 rounded border text-xs overflow-x-auto">
                            {publicUrl}
                        </code>
                        <div className="flex gap-3">
                            <Button asChild variant="outline" size="sm" className="gap-2">
                                <a href={screenUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-4 h-4" />
                                    Abrir Pantalla (Proyector)
                                </a>
                            </Button>
                            <Button asChild variant="outline" size="sm" className="gap-2">
                                <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-4 h-4" />
                                    Abrir App Invitado (Test)
                                </a>
                            </Button>
                        </div>
                    </div>

                    <div className="p-4 bg-muted/20 border rounded-lg flex items-center justify-between">
                        <div>
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
                            <Button variant="ghost" size="sm" onClick={fetchSession} className="gap-2">
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                Actualizar
                            </Button>
                        </div>

                        {session.items && session.items.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {session.items.map(item => (
                                    <div key={item.id} className="relative group rounded-lg overflow-hidden border bg-muted/20">
                                        {item.type === "PHOTO" ? (
                                            <img src={item.fileUrl} alt="Live" className="w-full h-40 object-cover" />
                                        ) : (
                                            <div className="w-full h-40 flex flex-col items-center justify-center bg-indigo-500/10 text-indigo-500 p-4 text-center">
                                                <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center mb-2">
                                                    💬
                                                </div>
                                                <span className="text-xs font-semibold">Mensaje</span>
                                                <span className="text-[10px] mt-1 opacity-70 line-clamp-2">"{item.fileUrl}"</span>
                                            </div>
                                        )}
                                            {/* Etiqueta de estado (pendiente/oculto) */}
                                            {!item.isActive && (
                                                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur text-white text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded">
                                                    Pendiente / Oculto
                                                </div>
                                            )}
                                        <div className="p-2 border-t text-xs text-muted-foreground flex justify-between items-center bg-background/95 backdrop-blur-sm">
                                            <span className="truncate pr-2">{item.guestName || "Anónimo"}</span>
                                            <span>{new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        </div>

                                        {/* Overlay de moderación */}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                            <Button 
                                                variant={item.isActive ? "secondary" : "default"} 
                                                size="sm"
                                                onClick={() => toggleItemActive(item.id, item.isActive)}
                                                className="w-32 font-semibold"
                                            >
                                                {item.isActive ? "Ocultar" : "Aprobar"}
                                            </Button>
                                            <Button 
                                                variant="destructive" 
                                                size="sm"
                                                onClick={() => setDeleteItemId(item.id)}
                                                className="w-32 gap-2"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Eliminar
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-8 border rounded-lg border-dashed text-muted-foreground">
                                Todavía no hay contenido subido a esta sesión.
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
                            ¿Estás seguro de que querés eliminar este contenido de la pantalla? No se podrá recuperar.
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
