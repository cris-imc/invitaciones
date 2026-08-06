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
  Plus,
  Minus,
  X,
  Info,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

// TEMPORAL: deshabilita la burbuja animada del primer invitado (y su halo
// en "Copiar Link") para descartar si es la causa del bug de scroll extra
// en Chrome-iOS. Volver a poner en "true" para reactivarla una vez
// descartado/confirmado.
const HINT_BUBBLE_ENABLED = false;

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
  createdAt: string;
}

function buildGuestName(type: "INDIVIDUAL" | "FAMILY", nombre: string, apellido: string): string {
  if (type === "FAMILY") {
    return apellido.trim();
  }
  return `${nombre.trim()} ${apellido.trim()}`.trim();
}

// Intenta separar un nombre ya guardado en Nombre/Apellido para precargar el
// formulario de edición. Es un mejor-esfuerzo: invitados cargados antes de esta
// separación pueden no partirse de forma perfecta.
function parseGuestName(guest: Pick<Guest, "name" | "type">): { nombre: string; apellido: string } {
  if (guest.type === "FAMILY") {
    return { nombre: "", apellido: guest.name.trim() };
  }
  const parts = guest.name.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { nombre: guest.name.trim(), apellido: "" };
  return { nombre: parts.slice(0, -1).join(" "), apellido: parts[parts.length - 1] };
}

// Selector +/- para las cantidades de adultos/adolescentes/niños: en mobile,
// tipear en un input numérico es incómodo, así que se suma/resta con botones.
function QuantityStepper({
  value,
  onChange,
  min = 0,
  max = 20,
  ariaLabel,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  ariaLabel: string;
}) {
  return (
    <div className="flex items-center justify-center gap-4">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`Restar ${ariaLabel}`}
        className="w-9 h-9 shrink-0 flex items-center justify-center rounded-full border border-muted-foreground/30 text-foreground hover:bg-muted/60 disabled:opacity-30 disabled:pointer-events-none transition-colors"
      >
        <Minus className="w-4 h-4" />
      </button>
      <span className="w-8 text-center text-base font-semibold tabular-nums">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`Sumar ${ariaLabel}`}
        className="w-9 h-9 shrink-0 flex items-center justify-center rounded-full border border-muted-foreground/30 text-foreground hover:bg-muted/60 disabled:opacity-30 disabled:pointer-events-none transition-colors"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
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
  const [firstGuestHintDismissed, setFirstGuestHintDismissed] = useState(true);
  const [hintVisible, setHintVisible] = useState(false);
  const [hintMounted, setHintMounted] = useState(false);

  // Edit Form States
  const [editGuestNombre, setEditGuestNombre] = useState("");
  const [editGuestApellido, setEditGuestApellido] = useState("");
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
  const [addGuestOpen, setAddGuestOpen] = useState(false);
  const [newGuestNombre, setNewGuestNombre] = useState("");
  const [newGuestApellido, setNewGuestApellido] = useState("");
  const [newGuestType, setNewGuestType] = useState<"INDIVIDUAL" | "FAMILY" | null>(
    null,
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

  useEffect(() => {
    const dismissed = localStorage.getItem(`guestLinkHintDismissed_${slug}`) === "1";
    setFirstGuestHintDismissed(dismissed);
  }, [slug]);

  const dismissFirstGuestHint = () => {
    localStorage.setItem(`guestLinkHintDismissed_${slug}`, "1");
    setFirstGuestHintDismissed(true);
  };

  // Mientras haya un único invitado (el primero creado) y no se haya cerrado la
  // burbuja, la mostramos, la desvanecemos sola a los pocos segundos, y la
  // volvemos a mostrar al minuto como recordatorio.
  useEffect(() => {
    if (!HINT_BUBBLE_ENABLED || firstGuestHintDismissed || guests.length !== 1) {
      setHintVisible(false);
      return;
    }

    let cancelled = false;
    let hideTimeout: ReturnType<typeof setTimeout>;
    let showTimeout: ReturnType<typeof setTimeout>;

    const showThenScheduleHide = () => {
      if (cancelled) return;
      setHintVisible(true);
      hideTimeout = setTimeout(() => {
        if (cancelled) return;
        setHintVisible(false);
        showTimeout = setTimeout(showThenScheduleHide, 60000);
      }, 8000);
    };

    showThenScheduleHide();

    return () => {
      cancelled = true;
      clearTimeout(hideTimeout);
      clearTimeout(showTimeout);
    };
  }, [guests.length, firstGuestHintDismissed]);

  // La burbuja solo debe existir en el DOM mientras es visible o se está
  // desvaneciendo (dura la transición). El resto del tiempo (la mayor parte
  // del ciclo) no debe montarse: al ser "position: absolute", aunque quede en
  // opacity-0 sigue ocupando espacio y estira el scroll de la página aunque
  // no se vea nada ahí.
  useEffect(() => {
    if (hintVisible) {
      setHintMounted(true);
      return;
    }
    const unmountTimeout = setTimeout(() => setHintMounted(false), 700);
    return () => clearTimeout(unmountTimeout);
  }, [hintVisible]);

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
    if (!newGuestType) return;
    const guestType = newGuestType;
    setIsSubmitting(true);

    const effectiveAdults = newAdultsEnabled ? newGuestAdultCount : 0;
    const effectiveTeens  = newTeensEnabled  ? newGuestTeenCount  : 0;
    const effectiveChildren = newChildrenEnabled ? newGuestChildCount : 0;

    try {
      const res = await fetch(`/api/invitations/${slug}/guests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: buildGuestName(guestType, newGuestNombre, newGuestApellido),
          type: guestType,
          expectedCount:
            guestType === "FAMILY"
              ? Math.max(1, effectiveAdults + effectiveTeens + effectiveChildren)
              : 1,
          expectedAdults: guestType === "FAMILY" ? effectiveAdults : (newIndividualCategory === 'adult' ? 1 : 0),
          expectedTeens:  guestType === "FAMILY" ? effectiveTeens  : (newIndividualCategory === 'teen'  ? 1 : 0),
          expectedChildren: guestType === "FAMILY" ? effectiveChildren : 0,
          isExempt: newGuestIsExempt,
        }),
      });

      if (res.ok) {
        const newGuest = await res.json();
        setGuests([newGuest, ...guests]);
        setNewGuestNombre("");
        setNewGuestApellido("");
        setNewGuestAdultCount(2);
        setNewGuestTeenCount(0);
        setNewGuestChildCount(0);
        setNewGuestIsExempt(false);
        setNewIndividualCategory('adult');
        setNewGuestType(null);
        setAddGuestOpen(false);
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
    const { nombre, apellido } = parseGuestName(guest);
    setEditGuestNombre(nombre);
    setEditGuestApellido(apellido);
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
          name: buildGuestName(editGuestType, editGuestNombre, editGuestApellido),
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

  // El primer invitado creado es el de menor createdAt (la lista viene ordenada desc del servidor)
  const firstGuestId = guests.length > 0
    ? guests.reduce((oldest, g) => (new Date(g.createdAt) < new Date(oldest.createdAt) ? g : oldest), guests[0]).id
    : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
        {/* Stats Cards */}
        <Card className="flex flex-col justify-center py-4 px-4 md:py-6 md:px-6 gap-1 md:gap-2">
          <div className="text-xs md:text-sm font-medium text-muted-foreground leading-none">
            Total Invitados
          </div>
          <div className="text-2xl md:text-3xl font-bold leading-none mt-1">{totalGuests}</div>
          <p className="text-[10px] md:text-xs text-muted-foreground leading-none">Registros en lista</p>
        </Card>
        <Card className="flex flex-col justify-center py-4 px-4 md:py-6 md:px-6 gap-1 md:gap-2">
          <div className="text-xs md:text-sm font-medium text-muted-foreground leading-none">
            Confirmados
          </div>
          <div className="text-2xl md:text-3xl font-bold text-green-600 leading-none mt-1">
            {totalAttending}
          </div>
          <p className="text-[10px] md:text-xs text-muted-foreground leading-tight">
            Asistirán ({confirmedGuests} grupos)
          </p>
        </Card>
        <Card className="col-span-2 md:col-span-1 flex flex-col justify-center py-4 px-4 md:py-6 md:px-6 gap-1 md:gap-2">
          <div className="text-xs md:text-sm font-medium text-muted-foreground leading-none">
            Pendientes
          </div>
          <div className="text-2xl md:text-3xl font-bold text-yellow-600 leading-none mt-1">
            {pendingGuests}
          </div>
          <p className="text-[10px] md:text-xs text-muted-foreground leading-none">Sin responder</p>
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
            {!addGuestOpen ? (
              <button
                type="button"
                onClick={() => setAddGuestOpen(true)}
                className="w-full flex flex-col items-center justify-center gap-2 py-10 rounded-xl border-2 border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
              >
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                  <Plus className="w-5 h-5" />
                </span>
                <span className="font-medium">Agrega un invitado</span>
              </button>
            ) : newGuestType === null ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">¿Qué tipo de invitación querés crear?</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewGuestType("INDIVIDUAL")}
                    className="flex flex-col items-center gap-2 py-6 px-3 rounded-xl border-2 border-muted-foreground/20 hover:border-primary hover:bg-primary/5 transition-colors text-sm font-medium"
                  >
                    <UserPlus className="w-6 h-6" />
                    Individual
                  </button>
                  <div className="relative group">
                    <button
                      type="button"
                      disabled={planTier !== 'PREMIUM'}
                      onClick={() => setNewGuestType("FAMILY")}
                      className={`w-full h-full flex flex-col items-center gap-2 py-6 px-3 rounded-xl border-2 text-sm font-medium transition-colors ${planTier !== 'PREMIUM' ? 'opacity-50 cursor-not-allowed border-muted-foreground/20' : 'border-muted-foreground/20 hover:border-primary hover:bg-primary/5'}`}
                    >
                      <Users className="w-6 h-6" />
                      <span className="flex items-center gap-1.5">
                        Familia/Grupo
                        {planTier !== 'PREMIUM' && <Lock className="w-3.5 h-3.5 text-red-400" />}
                      </span>
                    </button>
                    {planTier !== 'PREMIUM' && (
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                        Disponible en Premium
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAddGuestOpen(false)}
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                >
                  Cancelar
                </button>
              </div>
            ) : (
            <form onSubmit={handleAddGuest} className="space-y-4">
              <button
                type="button"
                onClick={() => setNewGuestType(null)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                ← Cambiar tipo de invitación
              </button>

              {newGuestType === "FAMILY" ? (
                <div className="space-y-2">
                  <Label htmlFor="guestApellido">Nombre del Grupo/Familia</Label>
                  <Input
                    id="guestApellido"
                    placeholder="Ej: Pérez, o Amigos del Trabajo"
                    value={newGuestApellido}
                    onChange={(e) => setNewGuestApellido(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Se va a mostrar como <strong>&quot;{newGuestApellido || "..."}&quot;</strong>.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="guestNombre">Nombre</Label>
                    <Input
                      id="guestNombre"
                      placeholder="Ej: Juan"
                      value={newGuestNombre}
                      onChange={(e) => setNewGuestNombre(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guestApellidoIndividual">Apellido</Label>
                    <Input
                      id="guestApellidoIndividual"
                      placeholder="Ej: García"
                      value={newGuestApellido}
                      onChange={(e) => setNewGuestApellido(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

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
                      <QuantityStepper value={newGuestAdultCount} onChange={setNewGuestAdultCount} min={1} max={20} ariaLabel="adultos" />
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
                      <QuantityStepper value={newGuestTeenCount} onChange={setNewGuestTeenCount} min={0} max={20} ariaLabel="adolescentes" />
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
                      <QuantityStepper value={newGuestChildCount} onChange={setNewGuestChildCount} min={0} max={20} ariaLabel="niños" />
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
            )}
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
                  const guestUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/invite/${slug}/${guest.uniqueToken}`;
                  const waMsg = encodeURIComponent(
                    `¡Hola ${guest.name}! Te invitamos a nuestra celebración. Hacé clic en tu link personalizado para ver la invitación y confirmar tu asistencia: ${guestUrl}`,
                  );
                  const waHref = `https://wa.me/?text=${waMsg}`;

                  const isFirstGuestHintCandidate = HINT_BUBBLE_ENABLED && guest.id === firstGuestId && guests.length === 1 && !firstGuestHintDismissed;
                  const isHintActive = isFirstGuestHintCandidate && hintVisible;

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

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <StatusBadge status={guest.status} />

                        <a
                          href={waHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Enviar WhatsApp"
                          className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-[#25D366] hover:bg-[#128C7E] text-white shadow-sm transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 hover:bg-blue-500/20"
                          title="Editar"
                          onClick={() => handleEditClick(guest)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>

                        <div className="relative">
                          {isHintActive && (
                            <span className="absolute -inset-1.5 rounded-full bg-amber-400/60 blur-md animate-pulse pointer-events-none"></span>
                          )}
                          <Button
                            size="sm"
                            className={`relative h-8 px-3 rounded-full text-xs gap-1.5 font-semibold border-0 shadow-sm bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white transition-shadow duration-300 ${isHintActive ? "ring-2 ring-amber-300 shadow-[0_0_10px_2px_rgba(251,191,36,0.6)]" : ""}`}
                            title="Copiar enlace personalizado"
                            onClick={() => copyLink(guest.uniqueToken)}
                          >
                            <LinkIcon className="w-3.5 h-3.5" />
                            Copiar Link
                          </Button>

                          {isFirstGuestHintCandidate && hintMounted && (
                            <div
                              className={`absolute bottom-full mb-2 left-1/2 -translate-x-1/2 sm:bottom-auto sm:top-full sm:mt-2 sm:mb-0 sm:left-auto sm:right-0 sm:translate-x-0 w-64 max-w-[calc(100vw-2rem)] p-3 rounded-2xl bg-amber-950 border border-amber-500/50 text-amber-100 text-xs shadow-xl z-50 transition-opacity duration-700 ${isHintActive ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                            >
                              <button
                                type="button"
                                onClick={dismissFirstGuestHint}
                                className="absolute top-1.5 right-1.5 text-amber-400/70 hover:text-amber-200"
                                title="Cerrar"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                              <p className="pr-5 leading-relaxed flex items-start gap-2">
                                <Info className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                                <span>
                                  <strong className="text-amber-300">¡Así se comparte!</strong> Copiá este enlace único y enviáselo a tu invitado para que vea su invitación personalizada y confirme su asistencia.
                                </span>
                              </p>
                              {/* Flecha apuntando hacia abajo (mobile: burbuja arriba del botón) */}
                              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-amber-950 border-r border-b border-amber-500/50 rotate-45 sm:hidden"></div>
                              {/* Flecha apuntando hacia arriba (desktop: burbuja debajo del botón) */}
                              <div className="hidden sm:block absolute -top-1.5 right-6 w-3 h-3 bg-amber-950 border-l border-t border-amber-500/50 rotate-45"></div>
                            </div>
                          )}
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 hover:text-red-600"
                          title="Eliminar"
                          onClick={() => setGuestToDelete(guest)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
                      Familia/Grupo
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

            {editGuestType === "FAMILY" ? (
              <div className="space-y-2">
                <Label htmlFor="editGuestApellido">Nombre del Grupo/Familia</Label>
                <Input
                  id="editGuestApellido"
                  placeholder="Ej: Pérez, o Amigos del Trabajo"
                  value={editGuestApellido}
                  onChange={(e) => setEditGuestApellido(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Se va a mostrar como <strong>&quot;{editGuestApellido || "..."}&quot;</strong>.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="editGuestNombre">Nombre</Label>
                  <Input
                    id="editGuestNombre"
                    placeholder="Ej: Juan"
                    value={editGuestNombre}
                    onChange={(e) => setEditGuestNombre(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editGuestApellidoIndividual">Apellido</Label>
                  <Input
                    id="editGuestApellidoIndividual"
                    placeholder="Ej: García"
                    value={editGuestApellido}
                    onChange={(e) => setEditGuestApellido(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

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
                    <QuantityStepper value={editGuestAdultCount} onChange={setEditGuestAdultCount} min={1} max={20} ariaLabel="adultos" />
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
                    <QuantityStepper value={editGuestTeenCount} onChange={setEditGuestTeenCount} min={0} max={20} ariaLabel="adolescentes" />
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
                    <QuantityStepper value={editGuestChildCount} onChange={setEditGuestChildCount} min={0} max={20} ariaLabel="niños" />
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
