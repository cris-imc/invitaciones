"use client";

import { useEffect, useState, type ReactNode } from "react";
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
  const partialCount = confirmed.filter((g) => g.paymentStatus === "PARTIAL").length;
  // Los parciales viven en el recuadro de "Pagaron", con su propio color: ya
  // entregaron algo, así que no son lo mismo que quien no pagó nada. "Pendientes
  // de Pago" queda solo con los que no pagaron nada.
  const pendingPayCount = confirmed.filter((g) => g.paymentStatus === "PENDING").length;

  const stats: { label: string; value: ReactNode; colorClass?: string }[] = [
    { label: "Enviadas / Aceptadas", value: `${guests.length} / ${confirmed.length}` },
    { label: "Personas", value: totalPeople },
    ...(pagoTarjetaHabilitado
      ? [
          {
            label: "Pagaron / Parciales",
            value: (
              <>
                <span className="text-green-600">{paidCount}</span>
                <span className="text-muted-foreground font-normal"> / </span>
                <span className="text-orange-500">{partialCount}</span>
              </>
            ),
          },
          { label: "Pendientes de Pago", value: pendingPayCount, colorClass: "text-yellow-600" },
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
