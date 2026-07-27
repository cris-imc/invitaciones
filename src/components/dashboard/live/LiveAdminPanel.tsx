"use client";

import { useEffect, useState, useCallback } from "react";
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

interface LiveItem {
    id: string;
    type: string;
    fileUrl: string;
    guestName: string | null;
    createdAt: string;
}

interface LiveSession {
    id: string;
    publicToken: string;
    isActive: boolean;
    items: LiveItem[];
}

export function LiveAdminPanel({ invitationId }: { invitationId: string }) {
    const [session, setSession] = useState<LiveSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                <div>
                    <h3 className="font-semibold flex items-center gap-2">
                        Estado del LIVE
                        {isActive ? (
                            <span className="flex h-3 w-3 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                        ) : (
                            <span className="h-3 w-3 rounded-full bg-gray-400"></span>
                        )}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        {isActive ? "Los invitados pueden subir contenido ahora." : "El LIVE está apagado."}
                    </p>
                </div>
                <Button 
                    onClick={toggleLive} 
                    variant={isActive ? "destructive" : "default"}
                    disabled={loading}
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
                                                    🎤
                                                </div>
                                                <span className="text-xs font-semibold">Audio Mensaje</span>
                                            </div>
                                        )}
                                        
                                        <div className="p-2 border-t text-xs text-muted-foreground flex justify-between items-center bg-background/95 backdrop-blur-sm">
                                            <span className="truncate pr-2">{item.guestName || "Anónimo"}</span>
                                            <span>{new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        </div>

                                        {/* Overlay de moderación */}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Button 
                                                variant="destructive" 
                                                size="sm"
                                                onClick={() => setDeleteItemId(item.id)}
                                                className="gap-2"
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
