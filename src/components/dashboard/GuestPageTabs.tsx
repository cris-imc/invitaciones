"use client";

import { useState } from "react";
import { GuestManager } from "@/components/dashboard/guests/GuestManager";
import { GuestListWithPayment } from "@/components/dashboard/GuestListWithPayment";
import { SongModerationPanel } from "@/components/dashboard/SongModerationPanel";
import { QuickEditPrice } from "@/components/dashboard/QuickEditPrice";
import { LiveAdminPanel } from "@/components/dashboard/live/LiveAdminPanel";

type Tab = "invitados" | "canciones" | "precio" | "agregar";

interface Props {
  invitationId: string;
  slug: string;
  regaloHabilitado: boolean;
  regaloMonto: unknown;
  precioNino: unknown;
  rsvpEnabled: boolean;
}

export function GuestPageTabs({ invitationId, slug, regaloHabilitado, regaloMonto, precioNino, rsvpEnabled }: Props) {
  const [tab, setTab] = useState<Tab>("invitados");

  const tabs: { id: Tab; label: string; primary?: boolean }[] = [
    { id: "invitados", label: "Invitados & Pagos" },
    { id: "canciones", label: "Música" },
    ...(regaloHabilitado ? [{ id: "precio" as Tab, label: "Precio Tarjeta" }] : []),
    { id: "agregar", label: "Gestionar Invitados 📲", primary: true },
    { id: "live" as Tab, label: "LIVE 📸", primary: true },
  ];

  return (
    <div>
      {/* Tab bar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          marginBottom: "20px",
          padding: "8px",
          background: "var(--muted, rgba(255,255,255,0.05))",
          borderRadius: "14px",
          border: "1px solid var(--line)",
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: "1 1 auto",
              minWidth: "120px",
              height: "40px",
              padding: "0 16px",
              borderRadius: "10px",
              border: t.primary ? "1px solid #4f46e5" : "1px solid transparent",
              cursor: "pointer",
              fontWeight: t.primary || tab === t.id ? 700 : 500,
              fontSize: "13.5px",
              fontFamily: "var(--font-ui)",
              transition: "all 0.15s",
              background: t.primary
                ? tab === t.id
                  ? "#3730a3"
                  : "#4f46e5"
                : tab === t.id
                ? "var(--paper)"
                : "transparent",
              color: t.primary
                ? "#fff"
                : tab === t.id
                ? "var(--ink)"
                : "rgba(246,243,236,0.6)",
              boxShadow: tab === t.id && !t.primary ? "0 1px 4px rgba(0,0,0,0.15)" : "none",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === "invitados" && (
        <div className="bg-card border rounded-lg p-4 md:p-6">
          <h2 className="text-xl font-semibold mb-6">Lista de Invitados</h2>
          <GuestListWithPayment invitationId={invitationId} />
        </div>
      )}
      {tab === "canciones" && (
        <div className="bg-card border rounded-lg p-4 md:p-6">
          <h2 className="text-xl font-semibold mb-6">Moderación de Canciones</h2>
          <SongModerationPanel invitationId={invitationId} />
        </div>
      )}
      {tab === "precio" && regaloHabilitado && (
        <div className="bg-card border rounded-lg p-4 md:p-6 max-w-lg">
          <h2 className="text-xl font-semibold mb-4">Actualizar Precio de Tarjeta</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Modifica rápidamente el valor por persona. Al cambiarlo aquí, aparecerá un indicador animado de &quot;¡Valor Actualizado!&quot; en la invitación de forma automática por 72 horas.
          </p>
          <QuickEditPrice
            invitationId={invitationId}
            slug={slug}
            currentAmount={regaloMonto}
            currentPrecioNino={precioNino}
          />
        </div>
      )}
      {tab === "agregar" && (
        <GuestManager slug={slug} initialRsvpEnabled={rsvpEnabled} />
      )}
      {tab === "live" && (
        <div className="bg-card border rounded-lg p-4 md:p-6">
          <h2 className="text-xl font-semibold mb-6">LIVE 📸</h2>
          <LiveAdminPanel invitationId={invitationId} />
        </div>
      )}
    </div>
  );
}
