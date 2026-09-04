"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

interface Guest {
  status: string;
  attendingCount: number;
  paymentStatus: string;
  paidAmount: number;
  expectedAmount: number;
  balance: number;
}

interface GuestStatsBarProps {
  invitationId: string;
  pagoTarjetaHabilitado?: boolean;
}

// Reemplaza al viejo recuadro "Capacidad" (limite de invitados, ya no
// relevante para el modelo de negocio actual) y a los resumenes que antes
// vivian sueltos dentro de "Gestionar pagos"/"Lista de invitados" -- ahora
// se muestran fijos arriba de todo, con la misma estetica de <Card> que
// tenian las (ahora eliminadas) tarjetas de estadisticas de "Gestionar
// invitados".
export function GuestStatsBar({ invitationId, pagoTarjetaHabilitado = false }: GuestStatsBarProps) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/guests?invitationId=${invitationId}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setGuests(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [invitationId]);

  if (loading) return null;

  const confirmed = guests.filter((g) => g.status === "CONFIRMED");
  const totalPeople = confirmed.reduce((s, g) => s + g.attendingCount, 0);
  const paidCount = confirmed.filter((g) => g.paymentStatus === "PAID").length;
  // Un pago parcial sigue siendo plata por cobrar: cuenta como pendiente, no
  // como pagado (si no, un grupo que entregó una parte desaparecería del radar).
  const pendingPayCount = confirmed.filter(
    (g) => g.paymentStatus === "PENDING" || g.paymentStatus === "PARTIAL"
  ).length;
  const partialCount = confirmed.filter((g) => g.paymentStatus === "PARTIAL").length;

  const stats = [
    { label: "Enviadas / Aceptadas", value: `${guests.length} / ${confirmed.length}` },
    { label: "Personas", value: totalPeople },
    ...(pagoTarjetaHabilitado
      ? [
          { label: "Pagaron", value: paidCount, colorClass: "text-green-600" },
          {
            label: partialCount > 0
              ? `Pendientes de Pago (${partialCount} parcial${partialCount !== 1 ? "es" : ""})`
              : "Pendientes de Pago",
            value: pendingPayCount,
            colorClass: "text-yellow-600",
          },
        ]
      : []),
  ];

  return (
    <div className={`grid grid-cols-2 ${pagoTarjetaHabilitado ? "md:grid-cols-4" : "md:grid-cols-2"} gap-3 md:gap-4`}>
      {stats.map(({ label, value, colorClass }) => (
        <Card key={label} className="flex flex-col justify-center py-4 px-4 md:py-5 md:px-5 gap-1 md:gap-1.5">
          <div className="text-xs md:text-sm font-medium text-muted-foreground leading-none">
            {label}
          </div>
          <div className={`text-2xl md:text-3xl font-bold leading-none mt-1 ${colorClass ?? ""}`}>
            {value}
          </div>
        </Card>
      ))}
    </div>
  );
}
