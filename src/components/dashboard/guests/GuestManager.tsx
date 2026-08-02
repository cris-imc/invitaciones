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
  expectedTeens?: number;
  expectedChildren?: number;
  uniqueToken: string;
  status: "PENDING" | "CONFIRMED" | "DECLINED";
  attendingCount: number;
  attendingAdults: number;
  attendingTeens: number;
  attendingChildren: number;
  isExempt: boolean;
  invitationId: string;
}

interface GuestManagerProps {
  slug: string;
  invitationId?: string;
  initialRsvpEnabled: boolean;
  planTier?: string;
  pagoTarjetaHabilitado?: boolean;
  pagoTarjetaMonto?: number | null;
  precioAdolescente?: number | null;
  precioNino?: number | null;
}

export function GuestManager({ slug, invitationId, initialRsvpEnabled, planTier, pagoTarjetaHabilitado = false, pagoTarjetaMonto, precioAdolescente: initPrecioAdolescente, precioNino: initPrecioNino }: GuestManagerProps) {
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
  const [editGuestTeenCount, setEditGuestTeenCount] = useState(0);
  const [editGuestChildCount, setEditGuestChildCount] = useState(0);
  const [editGuestIsExempt, setEditGuestIsExempt] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  // Prices state (local, updated after saving via modal)
  const [currentPrecioAdolescente, setCurrentPrecioAdolescente] = useState<number | null>(initPrecioAdolescente ?? null);
  const [currentPrecioNino, setCurrentPrecioNino] = useState<number | null>(initPrecioNino ?? null);
  const [currentAdultPrice, setCurrentAdultPrice] = useState<number | null>(pagoTarjetaMonto ?? null);

  // Price-set modal state
  const [priceModal, setPriceModal] = useState<{ open: boolean; category: 'adult' | 'teen' | 'child'; targetForm: 'new' | 'edit' }>({ open: false, category: 'adult', targetForm: 'new' });
  const [priceModalValue, setPriceModalValue] = useState("");
  const [isSavingPrice, setIsSavingPrice] = useState(false);

  // ADD FORM — category switches
  const [newAdultsEnabled, setNewAdultsEnabled] = useState(true);
  const [newTeensEnabled, setNewTeensEnabled] = useState((initPrecioAdolescente ?? 0) > 0);
  const [newChildrenEnabled, setNewChildrenEnabled] = useState((initPrecioNino ?? 0) > 0);

  // EDIT FORM — category switches
  const [editAdultsEnabled, setEditAdultsEnabled] = useState(true);
  const [editTeensEnabled, setEditTeensEnabled] = useState(false);
  const [editChildrenEnabled, setEditChildrenEnabled] = useState(false);

  const itemsPerPage = 3;
  const { showToast } = useToast();

  // Form States
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestType, setNewGuestType] = useState<"INDIVIDUAL" | "FAMILY">(
    "INDIVIDUAL",
  );
  const [newIndividualCategory, setNewIndividualCategory] = useState<'adult' | 'teen'>('adult');
  const [newGuestAdultCount, setNewGuestAdultCount] = useState(2);
  const [newGuestTeenCount, setNewGuestTeenCount] = useState(0);
  const [newGuestChildCount, setNewGuestChildCount] = useState(0);
  const [newGuestIsExempt, setNewGuestIsExempt] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit form individual category
  const [editIndividualCategory, setEditIndividualCategory] = useState<'adult' | 'teen'>('adult');

  // Helper: attempt to toggle a category switch — open price modal if no price set
  const tryToggle = (
    category: 'adult' | 'teen' | 'child',
    currentEnabled: boolean,
    setEnabled: (v: boolean) => void,
    form: 'new' | 'edit'
  ) => {
    if (currentEnabled) { setEnabled(false); return; }
    const price = category === 'adult' ? currentAdultPrice : category === 'teen' ? currentPrecioAdolescente : currentPrecioNino;
    if (!price || price <= 0) {
      // No price configured — open modal
      setPriceModalValue("");
      setPriceModal({ open: true, category, targetForm: form });
    } else {
      setEnabled(true);
    }
  };

  // Save price from modal
  const handleSavePrice = async () => {
    const val = parseFloat(priceModalValue);
    if (isNaN(val) || val <= 0) { showToast("Ingresá un monto válido", "error"); return; }
    setIsSavingPrice(true);
    try {
      const body: Record<string, number> = {};
      if (priceModal.category === 'adult') body.regaloMonto = val;
      if (priceModal.category === 'teen') body.precioAdolescente = val;
      if (priceModal.category === 'child') body.precioNino = val;

      const res = await fetch(`/api/invitations/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Error al guardar precio');

      // Update local price state
      if (priceModal.category === 'adult') setCurrentAdultPrice(val);
      if (priceModal.category === 'teen') setCurrentPrecioAdolescente(val);
      if (priceModal.category === 'child') setCurrentPrecioNino(val);

      // Enable the switch in the target form
      if (priceModal.targetForm === 'new') {
        if (priceModal.category === 'adult') setNewAdultsEnabled(true);
        if (priceModal.category === 'teen') setNewTeensEnabled(true);
        if (priceModal.category === 'child') setNewChildrenEnabled(true);
      } else {
        if (priceModal.category === 'adult') setEditAdultsEnabled(true);
        if (priceModal.category === 'teen') setEditTeensEnabled(true);
        if (priceModal.category === 'child') setEditChildrenEnabled(true);
      }
      setPriceModal(m => ({ ...m, open: false }));
      showToast("Precio guardado correctamente", "success");
    } catch {
      showToast("Error al guardar el precio", "error");
    } finally {
      setIsSavingPrice(false);
    }
  };

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

    const effectiveAdults = newAdultsEnabled ? newGuestAdultCount : 0;
    const effectiveTeens  = newTeensEnabled  ? newGuestTeenCount  : 0;
    const effectiveChildren = newChildrenEnabled ? newGuestChildCount : 0;

    try {
      const res = await fetch(`/api/invitations/${slug}/guests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newGuestName,
          type: newGuestType,
          expectedCount:
            newGuestType === "FAMILY"
              ? Math.max(1, effectiveAdults + effectiveTeens + effectiveChildren)
              : 1,
          expectedAdults: newGuestType === "FAMILY" ? effectiveAdults : (newIndividualCategory === 'adult' ? 1 : 0),
          expectedTeens:  newGuestType === "FAMILY" ? effectiveTeens  : (newIndividualCategory === 'teen'  ? 1 : 0),
          expectedChildren: newGuestType === "FAMILY" ? effectiveChildren : 0,
          isExempt: newGuestIsExempt,
        }),
      });

      if (res.ok) {
        const newGuest = await res.json();
        setGuests([newGuest, ...guests]);
        setNewGuestName("");
        setNewGuestAdultCount(2);
        setNewGuestTeenCount(0);
        setNewGuestChildCount(0);
        setNewGuestIsExempt(false);
        setNewIndividualCategory('adult');
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
    const adults = guest.expectedAdults ?? (guest.type === "FAMILY" ? 2 : 1);
    const teens  = guest.expectedTeens  ?? 0;
    const children = guest.expectedChildren ?? 0;
    setEditGuestAdultCount(adults);
    setEditGuestTeenCount(teens);
    setEditGuestChildCount(children);
    setEditAdultsEnabled(adults > 0);
    setEditTeensEnabled(teens > 0);
    setEditChildrenEnabled(children > 0);
    setEditGuestIsExempt(guest.isExempt ?? false);
    // Individual category
    if (guest.type === "INDIVIDUAL") {
      setEditIndividualCategory((guest.expectedTeens ?? 0) > 0 ? 'teen' : 'adult');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestToEdit) return;
    setIsEditSubmitting(true);

    try {
      const effectiveAdults   = editAdultsEnabled   ? editGuestAdultCount : 0;
      const effectiveTeens    = editTeensEnabled    ? editGuestTeenCount  : 0;
      const effectiveChildren = editChildrenEnabled ? editGuestChildCount : 0;
      const expectedCount =
        editGuestType === "FAMILY"
          ? Math.max(1, effectiveAdults + effectiveTeens + effectiveChildren)
          : 1;
      const res = await fetch(`/api/guests/${guestToEdit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editGuestName,
          type: editGuestType,
          expectedCount: expectedCount,
          expectedAdults: editGuestType === "FAMILY" ? effectiveAdults : (editIndividualCategory === 'adult' ? 1 : 0),
          expectedTeens:  editGuestType === "FAMILY" ? effectiveTeens  : (editIndividualCategory === 'teen'  ? 1 : 0),
          expectedChildren:
            editGuestType === "FAMILY" ? effectiveChildren : 0,
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
                  <div className={`flex items-center space-x-2 relative group${planTier !== 'PREMIUM' ? ' opacity-50' : ''}`}>
                    <input
                      type="radio"
                      id="family"
                      name="type"
                      checked={newGuestType === "FAMILY"}
                      onChange={() => setNewGuestType("FAMILY")}
                      disabled={planTier !== 'PREMIUM'}
                      className="accent-primary"
                    />
                    <Label htmlFor="family" className={`flex items-center gap-2${planTier !== 'PREMIUM' ? ' cursor-not-allowed' : ''}`}>
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

              {/* INDIVIDUAL: selector adulto/adolescente */}
              {newGuestType === "INDIVIDUAL" && (
                <div className="space-y-2 pt-1">
                  <Label className="text-sm text-muted-foreground">Categoría</Label>
                  <div className="flex gap-3">
                  <button
                      type="button"
                      onClick={() => setNewIndividualCategory('adult')}
                      className={`flex-1 flex flex-col items-center py-2 px-2 rounded-lg text-sm font-medium border transition-all ${newIndividualCategory === 'adult' ? 'border-primary bg-primary/10 text-primary' : 'border-muted-foreground/20 text-muted-foreground hover:border-muted-foreground/40'}`}
                    >
                      <span>Adulto</span>
                      {currentAdultPrice ? <span className="text-xs opacity-70 mt-0.5">${currentAdultPrice}</span> : null}
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewIndividualCategory('teen')}
                      className={`flex-1 flex flex-col items-center py-2 px-2 rounded-lg text-sm font-medium border transition-all ${newIndividualCategory === 'teen' ? 'border-primary bg-primary/10 text-primary' : 'border-muted-foreground/20 text-muted-foreground hover:border-muted-foreground/40'}`}
                    >
                      <span>Adolescente</span>
                      {currentPrecioAdolescente ? <span className="text-xs opacity-70 mt-0.5">${currentPrecioAdolescente}</span> : null}
                    </button>
                  </div>
                </div>
              )}

              {newGuestType === "FAMILY" && (
                <div className="space-y-3 pt-2">
                  {/* ADULTOS */}
                <div className={`rounded-lg p-3 transition-opacity ${!newAdultsEnabled ? "opacity-50" : ""}`}>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Adultos
                        {currentAdultPrice ? <span className="text-xs text-muted-foreground">(${currentAdultPrice})</span> : <span className="text-xs text-orange-400">Sin precio</span>}
                      </Label>
                      <Switch
                        checked={newAdultsEnabled}
                        onCheckedChange={() => tryToggle('adult', newAdultsEnabled, setNewAdultsEnabled, 'new')}
                      />
                    </div>
                    {newAdultsEnabled && (
                      <Input id="adultCount" type="number" min="1" max="20" value={newGuestAdultCount}
                        onChange={(e) => setNewGuestAdultCount(parseInt(e.target.value) || 1)} />
                    )}
                  </div>

                  {/* ADOLESCENTES */}
                <div className={`rounded-lg p-3 transition-opacity ${!newTeensEnabled ? "opacity-50" : ""}`}>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Adolescentes
                        {currentPrecioAdolescente ? <span className="text-xs text-muted-foreground">(${currentPrecioAdolescente})</span> : <span className="text-xs text-orange-400">Sin precio</span>}
                      </Label>
                      <Switch
                        checked={newTeensEnabled}
                        onCheckedChange={() => tryToggle('teen', newTeensEnabled, setNewTeensEnabled, 'new')}
                      />
                    </div>
                    {newTeensEnabled && (
                      <Input id="teenCount" type="number" min="0" max="20" value={newGuestTeenCount}
                        onChange={(e) => setNewGuestTeenCount(parseInt(e.target.value) || 0)} />
                    )}
                  </div>

                  {/* NIÑOS */}
                <div className={`rounded-lg p-3 transition-opacity ${!newChildrenEnabled ? "opacity-50" : ""}`}>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Niños
                        {currentPrecioNino ? <span className="text-xs text-muted-foreground">(${currentPrecioNino})</span> : <span className="text-xs text-orange-400">Sin precio</span>}
                      </Label>
                      <Switch
                        checked={newChildrenEnabled}
                        onCheckedChange={() => tryToggle('child', newChildrenEnabled, setNewChildrenEnabled, 'new')}
                      />
                    </div>
                    {newChildrenEnabled && (
                      <Input id="childCount" type="number" min="0" max="20" value={newGuestChildCount}
                        onChange={(e) => setNewGuestChildCount(parseInt(e.target.value) || 0)} />
                    )}
                  </div>
                </div>
              )}


              {pagoTarjetaHabilitado && (
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
              )}

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
                <div className={`flex items-center space-x-2 relative group${planTier !== 'PREMIUM' ? ' opacity-50' : ''}`}>
                  <input
                    type="radio"
                    id="edit-family"
                    name="edit-type"
                    checked={editGuestType === "FAMILY"}
                    onChange={() => setEditGuestType("FAMILY")}
                    disabled={planTier !== 'PREMIUM'}
                    className="accent-primary"
                  />
                  <Label htmlFor="edit-family" className={`flex items-center gap-2${planTier !== 'PREMIUM' ? ' cursor-not-allowed' : ''}`}>
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

            {/* INDIVIDUAL: selector adulto/adolescente */}
            {editGuestType === "INDIVIDUAL" && (
              <div className="space-y-2 pt-1">
                <Label className="text-sm text-muted-foreground">Categoría</Label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditIndividualCategory('adult')}
                    className={`flex-1 flex flex-col items-center py-2 px-2 rounded-lg text-sm font-medium border transition-all ${editIndividualCategory === 'adult' ? 'border-primary bg-primary/10 text-primary' : 'border-muted-foreground/20 text-muted-foreground hover:border-muted-foreground/40'}`}
                  >
                    <span>Adulto</span>
                    {currentAdultPrice ? <span className="text-xs opacity-70 mt-0.5">${currentAdultPrice}</span> : null}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditIndividualCategory('teen')}
                    className={`flex-1 flex flex-col items-center py-2 px-2 rounded-lg text-sm font-medium border transition-all ${editIndividualCategory === 'teen' ? 'border-primary bg-primary/10 text-primary' : 'border-muted-foreground/20 text-muted-foreground hover:border-muted-foreground/40'}`}
                  >
                    <span>Adolescente</span>
                    {currentPrecioAdolescente ? <span className="text-xs opacity-70 mt-0.5">${currentPrecioAdolescente}</span> : null}
                  </button>
                </div>
              </div>
            )}

            {editGuestType === "FAMILY" && (
              <div className="space-y-3 pt-2">
                {/* ADULTOS */}
              <div className={`rounded-lg p-3 transition-opacity ${!editAdultsEnabled ? "opacity-50" : ""}`}>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Adultos
                      {currentAdultPrice ? <span className="text-xs text-muted-foreground">(${currentAdultPrice})</span> : <span className="text-xs text-orange-400">Sin precio</span>}
                    </Label>
                    <Switch
                      checked={editAdultsEnabled}
                      onCheckedChange={() => tryToggle('adult', editAdultsEnabled, setEditAdultsEnabled, 'edit')}
                    />
                  </div>
                  {editAdultsEnabled && (
                    <Input id="editAdultCount" type="number" min="1" max="20" value={editGuestAdultCount}
                      onChange={(e) => setEditGuestAdultCount(parseInt(e.target.value) || 1)} />
                  )}
                </div>

                {/* ADOLESCENTES */}
              <div className={`rounded-lg p-3 transition-opacity ${!editTeensEnabled ? "opacity-50" : ""}`}>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Adolescentes
                      {currentPrecioAdolescente ? <span className="text-xs text-muted-foreground">(${currentPrecioAdolescente})</span> : <span className="text-xs text-orange-400">Sin precio</span>}
                    </Label>
                    <Switch
                      checked={editTeensEnabled}
                      onCheckedChange={() => tryToggle('teen', editTeensEnabled, setEditTeensEnabled, 'edit')}
                    />
                  </div>
                  {editTeensEnabled && (
                    <Input id="editTeenCount" type="number" min="0" max="20" value={editGuestTeenCount}
                      onChange={(e) => setEditGuestTeenCount(parseInt(e.target.value) || 0)} />
                  )}
                </div>

                {/* NIÑOS */}
              <div className={`rounded-lg p-3 transition-opacity ${!editChildrenEnabled ? "opacity-50" : ""}`}>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Niños
                      {currentPrecioNino ? <span className="text-xs text-muted-foreground">(${currentPrecioNino})</span> : <span className="text-xs text-orange-400">Sin precio</span>}
                    </Label>
                    <Switch
                      checked={editChildrenEnabled}
                      onCheckedChange={() => tryToggle('child', editChildrenEnabled, setEditChildrenEnabled, 'edit')}
                    />
                  </div>
                  {editChildrenEnabled && (
                    <Input id="editChildCount" type="number" min="0" max="20" value={editGuestChildCount}
                      onChange={(e) => setEditGuestChildCount(parseInt(e.target.value) || 0)} />
                  )}
                </div>
              </div>
            )}


            {pagoTarjetaHabilitado && (
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
            )}

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

      {/* Price-set Modal */}
      <Dialog open={priceModal.open} onOpenChange={(open) => !open && setPriceModal(m => ({ ...m, open: false }))}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {priceModal.category === 'adult' ? '💰 Precio Adulto' : priceModal.category === 'teen' ? '🎓 Precio Adolescente' : '👶 Precio Niño'}
            </DialogTitle>
            <DialogDescription>
              No hay precio configurado para esta categoría. Ingresá el monto para habilitarla.
            </DialogDescription>
          </DialogHeader>
          <div className="py-3">
            <Label className="text-sm mb-2 block">Monto ($)</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="Ej: 5000"
              value={priceModalValue}
              onChange={(e) => setPriceModalValue(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPriceModal(m => ({ ...m, open: false }))} disabled={isSavingPrice}>
              Cancelar
            </Button>
            <Button onClick={handleSavePrice} disabled={isSavingPrice}>
              {isSavingPrice ? "Guardando..." : "Guardar y Habilitar"}
            </Button>
          </DialogFooter>
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
