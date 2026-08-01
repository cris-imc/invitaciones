"use client";

import { useState } from "react";
import { GuestManager } from "@/components/dashboard/guests/GuestManager";
import { GuestListWithPayment } from "@/components/dashboard/GuestListWithPayment";
import { SongModerationPanel } from "@/components/dashboard/SongModerationPanel";
import { QuickEditPrice } from "@/components/dashboard/QuickEditPrice";
import { LiveAdminPanel } from "@/components/dashboard/live/LiveAdminPanel";
import { Lock } from "lucide-react";

type Tab = "invitados" | "canciones" | "precio" | "agregar" | "live";

interface Props {
  invitationId: string;
  slug: string;
  regaloHabilitado: boolean;
  regaloMonto: unknown;
  precioAdolescente?: unknown;
  precioNino: unknown;
  rsvpEnabled: boolean;
  planTier: string;
}

export function GuestPageTabs({ invitationId, slug, regaloHabilitado, regaloMonto, precioAdolescente, precioNino, rsvpEnabled, planTier }: Props) {
  const [tab, setTab] = useState<Tab>("invitados");

  const tabs: { id: Tab; label: string; primary?: boolean }[] = [
    { id: "invitados", label: "Invitados & Pagos" },
    { id: "canciones", label: "Música" },
    ...(regaloHabilitado ? [{ id: "precio" as Tab, label: "Precio" }] : []),
    { id: "agregar", label: "Gestionar invitados", primary: true },
    { id: "live" as Tab, label: "LIVE", primary: true },
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
        {tabs.map((t) => {
          const isLocked = planTier === "FREE" && (t.id === "canciones" || t.id === "live");
          
          return (
            <div key={t.id} className="relative group flex-1 min-w-[120px]">
              <button
                onClick={() => !isLocked && setTab(t.id)}
                disabled={isLocked}
                style={{
                  width: "100%",
                  minHeight: "40px",
                  padding: "8px 16px",
                  borderRadius: "10px",
                  border: t.primary ? "1px solid #4f46e5" : "1px solid transparent",
                  cursor: isLocked ? "not-allowed" : "pointer",
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
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  opacity: isLocked ? 0.5 : 1,
                  whiteSpace: "nowrap",
                }}
              >
                {t.id === "live" ? (
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{
                      display: "inline-block",
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#ef4444",
                      animation: isLocked ? "none" : "liveRecPulse 1.5s ease-in-out infinite",
                      flexShrink: 0,
                    }} />
                    LIVE
                  </span>
                ) : (
                  t.label
                )}
                {isLocked && <Lock className="w-3.5 h-3.5 text-red-400" />}
              </button>
              
              {/* Tooltip for locked tabs */}
              {isLocked && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  Disponible en Premium
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                </div>
              )}
            </div>
          );
        })}
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
            currentAmount={Number(regaloMonto)}
            currentPrecioAdolescente={Number(precioAdolescente)}
            currentPrecioNino={Number(precioNino)}
            planTier={planTier}
          />
        </div>
      )}
      {tab === "agregar" && (
        <GuestManager slug={slug} initialRsvpEnabled={rsvpEnabled} planTier={planTier} />
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
