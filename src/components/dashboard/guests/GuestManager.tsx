"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Users, UserPlus, Link as LinkIcon, Trash2, CalendarIcon, CheckCircle, XCircle, Clock } from "lucide-react";

interface Guest {
    id: string;
    name: string;
    type: "INDIVIDUAL" | "FAMILY";
    expectedCount: number;
    uniqueToken: string;
    status: "PENDING" | "CONFIRMED" | "DECLINED";
    attendingCount: number;
    invitationId: string;
}

interface GuestManagerProps {
    invitationId: string;
    initialRsvpEnabled: boolean;
}

export function GuestManager({ invitationId, initialRsvpEnabled }: GuestManagerProps) {
    const [guests, setGuests] = useState<Guest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [rsvpEnabled, setRsvpEnabled] = useState(initialRsvpEnabled);
    const [activeTab, setActiveTab] = useState("list");

    // Form States
    const [newGuestName, setNewGuestName] = useState("");
    const [newGuestType, setNewGuestType] = useState<"INDIVIDUAL" | "FAMILY">("INDIVIDUAL");
    const [newGuestCount, setNewGuestCount] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchGuests();
    }, [invitationId]);

    const fetchGuests = async () => {
        try {
            const res = await fetch(`/api/invitations/${invitationId}/guests`);
            if (res.ok) {
                const data = await res.json();
                setGuests(data);
            }
        } catch (error) {
            console.error("Error fetching guests:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddGuest = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch(`/api/invitations/${invitationId}/guests`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newGuestName,
                    type: newGuestType,
                    expectedCount: newGuestType === "FAMILY" ? newGuestCount : 1
                })
            });

            if (res.ok) {
                const newGuest = await res.json();
                setGuests([newGuest, ...guests]);
                setNewGuestName("");
                setNewGuestCount(1);
                // toast.success("Invitado agregado");
            } else {
                alert("Error al agregar invitado");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteGuest = async (guestId: string) => {
        if (!confirm("¿Eliminar este invitado?")) return;

        try {
            const res = await fetch(`/api/guests/${guestId}`, { method: "DELETE" });
            if (res.ok) {
                setGuests(guests.filter(g => g.id !== guestId));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const copyLink = (token: string) => {
        const url = `${window.location.origin}/invite/${invitationId}/${token}`;
        navigator.clipboard.writeText(url);
        alert("¡Enlace copiado! Compártelo con el invitado.");
    };

    // Stats
    const totalGuests = guests.length;
    const confirmedGuests = guests.filter(g => g.status === "CONFIRMED").length;
    const totalAttending = guests.reduce((sum, g) => sum + (g.attendingCount || 0), 0);
    const pendingGuests = guests.filter(g => g.status === "PENDING").length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
                {/* Stats Cards */}
                <Card className="flex-1">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Invitados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalGuests}</div>
                        <p className="text-xs text-muted-foreground">Registros en lista</p>
                    </CardContent>
                </Card>
                <Card className="flex-1">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Confirmados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{totalAttending}</div>
                        <p className="text-xs text-muted-foreground">Personas asistirán ({confirmedGuests} grupos)</p>
                    </CardContent>
                </Card>
                <Card className="flex-1">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Pendientes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{pendingGuests}</div>
                        <p className="text-xs text-muted-foreground">Sin responder</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Add Guest Form */}
                <Card className="md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle>Agregar Invitados</CardTitle>
                        <CardDescription>Genera un enlace único para cada invitado/a.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddGuest} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="guestName">Nombre / Familia</Label>
                                <Input
                                    id="guestName"
                                    placeholder="Ej: Familia Pérez o Juan García"
                                    value={newGuestName}
                                    onChange={(e) => setNewGuestName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Tipo de Invitación</Label>
                                <div className="flex gap-4">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            id="individual"
                                            name="type"
                                            checked={newGuestType === "INDIVIDUAL"}
                                            onChange={() => setNewGuestType("INDIVIDUAL")}
                                            className="accent-primary"
                                        />
                                        <Label htmlFor="individual">Individual</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            id="family"
                                            name="type"
                                            checked={newGuestType === "FAMILY"}
                                            onChange={() => setNewGuestType("FAMILY")}
                                            className="accent-primary"
                                        />
                                        <Label htmlFor="family">Familiar</Label>
                                    </div>
                                </div>
                            </div>

                            {newGuestType === "FAMILY" && (
                                <div className="space-y-2">
                                    <Label htmlFor="count">Cupos (Personas esperadas)</Label>
                                    <Input
                                        id="count"
                                        type="number"
                                        min="1"
                                        max="20"
                                        value={newGuestCount}
                                        onChange={(e) => setNewGuestCount(parseInt(e.target.value))}
                                    />
                                </div>
                            )}

                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? "Agregando..." : "Agregar a la lista"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Guest List */}
                <Card className="md:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Lista de Invitados</CardTitle>
                            <CardDescription>Gestiona tus invitados y comparte sus enlaces.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="text-center py-8">Cargando invitados...</div>
                        ) : guests.length === 0 ? (
                            <div className="text-center py-10 border-2 border-dashed rounded-lg text-muted-foreground">
                                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p>Aún no has agregado invitados.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {guests.map((guest) => (
                                    <div key={guest.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold">{guest.name}</span>
                                                <Badge variant="secondary" className="text-[10px]">
                                                    {guest.type === "FAMILY" ? "FAMILIA" : "INDIVIDUAL"}
                                                </Badge>
                                            </div>
                                            <div className="text-sm text-muted-foreground flex gap-3">
                                                <span>Esperados: {guest.expectedCount}</span>
                                                {guest.status === "CONFIRMED" && (
                                                    <span className="text-green-600 font-medium">Asistirán: {guest.attendingCount}</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <StatusBadge status={guest.status} />

                                            <div className="flex items-center border-l pl-3 gap-1">
                                                <Button variant="ghost" size="icon" title="Copiar enlace" onClick={() => copyLink(guest.uniqueToken)}>
                                                    <LinkIcon className="w-4 h-4 text-blue-600" />
                                                </Button>
                                                <Button variant="ghost" size="icon" title="Eliminar" onClick={() => handleDeleteGuest(guest.id)}>
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case "CONFIRMED":
            return (
                <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-medium border border-green-100">
                    <CheckCircle className="w-3 h-3" /> Confirmado
                </div>
            );
        case "DECLINED":
            return (
                <div className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-medium border border-red-100">
                    <XCircle className="w-3 h-3" /> No asistirá
                </div>
            );
        default:
            return (
                <div className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full text-xs font-medium border border-yellow-100">
                    <Clock className="w-3 h-3" /> Pendiente
                </div>
            );
    }
}
