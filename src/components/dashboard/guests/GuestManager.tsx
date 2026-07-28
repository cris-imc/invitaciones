"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Users,
  UserPlus,
  Link as LinkIcon,
  Trash2,
  CalendarIcon,
  CheckCircle,
  XCircle,
  Clock,
  MessageCircle,
  Pencil,
  Lock,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface Guest {
  id: string;
  name: string;
  type: "INDIVIDUAL" | "FAMILY";
  expectedCount: number;
  expectedAdults?: number;
  expectedChildren?: number;
  uniqueToken: string;
  status: "PENDING" | "CONFIRMED" | "DECLINED";
  attendingCount: number;
  attendingAdults: number;
  attendingChildren: number;
  isExempt: boolean;
  invitationId: string;
}

interface GuestManagerProps {
  slug: string;
  initialRsvpEnabled: boolean;
  planTier?: string;
}

export function GuestManager({ slug, initialRsvpEnabled, planTier }: GuestManagerProps) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rsvpEnabled, setRsvpEnabled] = useState(initialRsvpEnabled);
  const [activeTab, setActiveTab] = useState("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [guestToDelete, setGuestToDelete] = useState<Guest | null>(null);
  const [guestToEdit, setGuestToEdit] = useState<Guest | null>(null);

  // Edit Form States
  const [editGuestName, setEditGuestName] = useState("");
  const [editGuestType, setEditGuestType] = useState<"INDIVIDUAL" | "FAMILY">(
    "INDIVIDUAL",
  );
  const [editGuestAdultCount, setEditGuestAdultCount] = useState(2);
  const [editGuestChildCount, setEditGuestChildCount] = useState(0);
  const [editGuestIsExempt, setEditGuestIsExempt] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  const itemsPerPage = 3;
  const { showToast } = useToast();

  // Form States
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestType, setNewGuestType] = useState<"INDIVIDUAL" | "FAMILY">(
    "INDIVIDUAL",
  );
  const [newGuestAdultCount, setNewGuestAdultCount] = useState(2);
  const [newGuestChildCount, setNewGuestChildCount] = useState(0);
  const [newGuestIsExempt, setNewGuestIsExempt] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchGuests();
  }, [slug]);

  const fetchGuests = async () => {
    try {
      const res = await fetch(`/api/invitations/${slug}/guests`);
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
      const res = await fetch(`/api/invitations/${slug}/guests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newGuestName,
          type: newGuestType,
          expectedCount:
            newGuestType === "FAMILY"
              ? newGuestAdultCount + newGuestChildCount
              : 1,
          expectedAdults: newGuestType === "FAMILY" ? newGuestAdultCount : 1,
          expectedChildren: newGuestType === "FAMILY" ? newGuestChildCount : 0,
          isExempt: newGuestIsExempt,
        }),
      });

      if (res.ok) {
        const newGuest = await res.json();
        setGuests([newGuest, ...guests]);
        setNewGuestName("");
        setNewGuestAdultCount(2);
        setNewGuestChildCount(0);
        setNewGuestIsExempt(false);
        showToast("Invitado agregado exitosamente", "success");
      } else {
        showToast("Error al agregar invitado", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Error de conexión", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (guest: Guest) => {
    setGuestToEdit(guest);
    setEditGuestName(guest.name);
    setEditGuestType(guest.type);
    setEditGuestAdultCount(
      guest.expectedAdults ?? (guest.type === "FAMILY" ? 2 : 1),
    );
    setEditGuestChildCount(guest.expectedChildren ?? 0);
    setEditGuestIsExempt(guest.isExempt ?? false);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestToEdit) return;
    setIsEditSubmitting(true);

    try {
      const expectedCount =
        editGuestType === "FAMILY"
          ? editGuestAdultCount + editGuestChildCount
          : 1;
      const res = await fetch(`/api/guests/${guestToEdit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editGuestName,
          type: editGuestType,
          expectedCount: expectedCount,
          expectedAdults: editGuestType === "FAMILY" ? editGuestAdultCount : 1,
          expectedChildren:
            editGuestType === "FAMILY" ? editGuestChildCount : 0,
          isExempt: editGuestIsExempt,
        }),
      });

      if (res.ok) {
        const updatedGuest = await res.json();
        setGuests(
          guests.map((g) => (g.id === updatedGuest.id ? updatedGuest : g)),
        );
        showToast("Invitado actualizado exitosamente", "success");
        setGuestToEdit(null);
      } else {
        showToast("Error al actualizar invitado", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Error de conexión", "error");
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleDeleteGuest = async () => {
    if (!guestToDelete) return;

    try {
      const res = await fetch(`/api/guests/${guestToDelete.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setGuests(guests.filter((g) => g.id !== guestToDelete.id));
        showToast("Invitado eliminado", "success");
      }
    } catch (error) {
      console.error(error);
      showToast("Error al eliminar", "error");
    } finally {
      setGuestToDelete(null);
    }
  };

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/invite/${slug}/${token}`;
    navigator.clipboard.writeText(url);
    showToast("¡Enlace copiado! Compártelo con el invitado.", "success");
  };

  // Filter and Pagination
  const filteredGuests = guests.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const totalPages = Math.max(
    1,
    Math.ceil(filteredGuests.length / itemsPerPage),
  );
  const paginatedGuests = filteredGuests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Stats
  const totalGuests = guests.length;
  const confirmedGuests = guests.filter((g) => g.status === "CONFIRMED").length;
  const totalAttending = guests.reduce(
    (sum, g) => sum + (g.attendingCount || 0),
    0,
  );
  const pendingGuests = guests.filter((g) => g.status === "PENDING").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Stats Cards */}
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Invitados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGuests}</div>
            <p className="text-xs text-muted-foreground">Registros en lista</p>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Confirmados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalAttending}
            </div>
            <p className="text-xs text-muted-foreground">
              Personas asistirán ({confirmedGuests} grupos)
            </p>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {pendingGuests}
            </div>
            <p className="text-xs text-muted-foreground">Sin responder</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Add Guest Form */}
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Agregar Invitados</CardTitle>
            <CardDescription>
              Genera un enlace único para cada invitado/a.
            </CardDescription>
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
                  <div className="flex items-center space-x-2 opacity-50 relative group">
                    <input
                      type="radio"
                      id="family"
                      name="type"
                      checked={newGuestType === "FAMILY"}
                      onChange={() => setNewGuestType("FAMILY")}
                      disabled={planTier !== 'PREMIUM'}
                      className="accent-primary"
                    />
                    <Label htmlFor="family" className="flex items-center gap-2 cursor-not-allowed">
                        Familiar
                        {planTier !== 'PREMIUM' && <Lock className="w-4 h-4 text-red-400" />}
                    </Label>

                    {planTier !== 'PREMIUM' && (
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                          Disponible en Premium
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                        </div>
                    )}
                  </div>
                </div>
              </div>

              {newGuestType === "FAMILY" && (
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="adultCount"
                      className="text-sm text-muted-foreground"
                    >
                      Adultos esperados
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <Input
                        id="adultCount"
                        type="number"
                        min="1"
                        max="10"
                        value={newGuestAdultCount}
                        onChange={(e) =>
                          setNewGuestAdultCount(parseInt(e.target.value) || 1)
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="childCount"
                      className="text-sm text-muted-foreground"
                    >
                      Niños esperados
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <Input
                        id="childCount"
                        type="number"
                        min="0"
                        max="10"
                        value={newGuestChildCount}
                        onChange={(e) =>
                          setNewGuestChildCount(parseInt(e.target.value) || 0)
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="newGuestIsExempt"
                  checked={newGuestIsExempt}
                  onCheckedChange={setNewGuestIsExempt}
                />
                <Label
                  htmlFor="newGuestIsExempt"
                  className="text-sm text-muted-foreground"
                >
                  Exento de pago
                </Label>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Agregando..." : "Agregar a la lista"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Guest List */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Lista de Invitados</CardTitle>
              <CardDescription>
                Gestiona tus invitados y comparte sus enlaces.
              </CardDescription>
            </div>
            <div className="w-full sm:w-64">
              <Input
                type="search"
                placeholder="Buscar invitado..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Cargando invitados...</div>
            ) : filteredGuests.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed rounded-lg text-muted-foreground">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>
                  {searchQuery
                    ? "No se encontraron invitados que coincidan con tu búsqueda."
                    : "Aún no has agregado invitados."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedGuests.map((guest) => {
                  const guestUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/i/${slug}?t=${guest.uniqueToken}`;
                  const waMsg = encodeURIComponent(
                    `¡Hola ${guest.name}! Te invitamos a nuestra celebración. Hacé clic en tu link personalizado para ver la invitación y confirmar tu asistencia: ${guestUrl}`,
                  );
                  const waHref = `https://wa.me/?text=${waMsg}`;

                  return (
                    <div
                      key={guest.id}
                      className="flex items-center justify-between p-4 border rounded-xl bg-card hover:bg-muted/50 transition-colors flex-wrap gap-3"
                    >
                      <div>
                        <h4 className="font-semibold">{guest.name}</h4>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                          {guest.type === "FAMILY" ? (
                            <span className="flex items-center">
                              <Users className="w-3 h-3 mr-1" /> Familia (
                              {guest.expectedCount})
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <Users className="w-3 h-3 mr-1" /> Individual
                            </span>
                          )}
                          {guest.isExempt && (
                            <Badge
                              variant="outline"
                              className="text-[10px] h-4 leading-3 border-green-200 text-green-700 bg-green-50 uppercase tracking-wider"
                            >
                              Exento
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge status={guest.status} />

                        <a
                          href={waHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#128C7E] text-white text-xs font-semibold shadow-sm transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          Enviar WhatsApp
                        </a>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                          title="Editar"
                          onClick={() => handleEditClick(guest)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2.5 text-xs gap-1"
                          title="Copiar enlace personalizado"
                          onClick={() => copyLink(guest.uniqueToken)}
                        >
                          <LinkIcon className="w-3.5 h-3.5 text-blue-600" />
                          Copiar Link
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          title="Eliminar"
                          onClick={() => setGuestToDelete(guest)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </Button>
                    <span className="text-sm text-muted-foreground px-2">
                      Página {currentPage} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Siguiente
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={!!guestToDelete && !guestToEdit}
        onOpenChange={(open) => !open && setGuestToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar invitado?</DialogTitle>
            <DialogDescription>
              Estás a punto de eliminar a <strong>{guestToDelete?.name}</strong>{" "}
              de la lista de invitados. Esta acción no se puede deshacer y el
              enlace de la invitación dejará de funcionar para ellos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setGuestToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteGuest}>
              Eliminar Invitado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!guestToEdit}
        onOpenChange={(open) => !open && setGuestToEdit(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Invitado</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editGuestName">Nombre / Familia</Label>
              <Input
                id="editGuestName"
                value={editGuestName}
                onChange={(e) => setEditGuestName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo de Invitación</Label>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="edit-individual"
                    name="edit-type"
                    checked={editGuestType === "INDIVIDUAL"}
                    onChange={() => setEditGuestType("INDIVIDUAL")}
                    className="accent-primary"
                  />
                  <Label htmlFor="edit-individual">Individual</Label>
                </div>
                <div className="flex items-center space-x-2 opacity-50 relative group">
                  <input
                    type="radio"
                    id="edit-family"
                    name="edit-type"
                    checked={editGuestType === "FAMILY"}
                    onChange={() => setEditGuestType("FAMILY")}
                    disabled={planTier !== 'PREMIUM'}
                    className="accent-primary"
                  />
                  <Label htmlFor="edit-family" className="flex items-center gap-2 cursor-not-allowed">
                      Familiar
                      {planTier !== 'PREMIUM' && <Lock className="w-4 h-4 text-red-400" />}
                  </Label>

                  {planTier !== 'PREMIUM' && (
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                        Disponible en Premium
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                      </div>
                  )}
                </div>
              </div>
            </div>

            {editGuestType === "FAMILY" && (
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="editAdultCount"
                    className="text-sm text-muted-foreground"
                  >
                    Adultos esperados
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <Input
                      id="editAdultCount"
                      type="number"
                      min="1"
                      max="10"
                      value={editGuestAdultCount}
                      onChange={(e) =>
                        setEditGuestAdultCount(parseInt(e.target.value) || 1)
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="editChildCount"
                    className="text-sm text-muted-foreground"
                  >
                    Niños esperados
                  </Label>
                  <div className="flex items-center space-x-2">
                    <UserPlus className="w-4 h-4 text-muted-foreground" />
                    <Input
                      id="editChildCount"
                      type="number"
                      min="0"
                      max="10"
                      value={editGuestChildCount}
                      onChange={(e) =>
                        setEditGuestChildCount(parseInt(e.target.value) || 0)
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <Label htmlFor="edit-exempt" className="font-medium">
                  Exento de pago
                </Label>
                <p className="text-xs text-muted-foreground">
                  El invitado no tendrá que abonar tarjeta.
                </p>
              </div>
              <Switch
                id="edit-exempt"
                checked={editGuestIsExempt}
                onCheckedChange={setEditGuestIsExempt}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setGuestToEdit(null)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isEditSubmitting}>
                {isEditSubmitting ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
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
