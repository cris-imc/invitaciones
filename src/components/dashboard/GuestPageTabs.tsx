"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GuestManager } from "@/components/dashboard/guests/GuestManager";
import { GuestListWithPayment } from "@/components/dashboard/GuestListWithPayment";
import { SongModerationPanel } from "@/components/dashboard/SongModerationPanel";
import { QuickEditPrice } from "@/components/dashboard/QuickEditPrice";
import { LiveAdminPanel } from "@/components/dashboard/live/LiveAdminPanel";
import { Lock, Info, Camera } from "lucide-react";

type Tab = "invitados" | "canciones" | "precio" | "agregar" | "live";

interface Props {
  invitationId: string;
  slug: string;
  regaloHabilitado: boolean;
  pagoTarjetaHabilitado?: boolean;
  regaloMonto: unknown;
  precioAdolescente?: unknown;
  precioNino: unknown;
  rsvpEnabled: boolean;
  planTier: string;
  fechaEvento: string;
}

const TAB_DESCRIPTIONS: Record<Tab, string> = {
  agregar: "Agregá invitados, familias y enviales su enlace único por WhatsApp...",
  invitados: "Revisá quién confirmó asistencia y llevá el control exacto de los pagos...",
  precio: "Modificá el precio del cubierto y notificá automáticamente a tus invitados...",
  canciones: "Escuchá, aprobá o rechazá las canciones que sugieren para la fiesta...",
  live: "Modo Fiesta: Proyectá fotos en vivo y moderá la pantalla gigante...",
};

function AnimatedTabDescription({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let i = 0;
    setDisplayed("");
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <div className="flex items-center gap-2 px-1 mb-5 w-full text-sm text-amber-600 dark:text-amber-400/90 font-medium min-h-[24px]">
      <Info className="w-4 h-4 shrink-0" />
      <span className="min-w-0 flex-1 break-words">
        {displayed}
        <span className="animate-pulse ml-0.5">|</span>
      </span>
    </div>
  );
}

export function GuestPageTabs({ invitationId, slug, regaloHabilitado, pagoTarjetaHabilitado = false, regaloMonto, precioAdolescente, precioNino, rsvpEnabled, planTier, fechaEvento }: Props) {
  const [tab, setTab] = useState<Tab>("agregar");
  const [liveActive, setLiveActive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchLiveStatus = async () => {
      try {
        const res = await fetch(`/api/live/session?invitationId=${invitationId}`);
        if (!res.ok) { if (!cancelled) setLiveActive(false); return; }
        const data = await res.json();
        if (!cancelled) setLiveActive(Boolean(data?.isActive));
      } catch {
        if (!cancelled) setLiveActive(false);
      }
    };
    fetchLiveStatus();
    const interval = setInterval(fetchLiveStatus, 5000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [invitationId]);

  const tabs: { id: Tab; label: string; highlight?: "gold" | "live" | "default" }[] = [
    { id: "agregar", label: "Gestionar invitados", highlight: "gold" },
    { id: "invitados", label: pagoTarjetaHabilitado ? "Gestionar pagos" : "Lista de invitados", highlight: "default" },
    ...(pagoTarjetaHabilitado ? [{ id: "precio" as Tab, label: "Gestionar precios", highlight: "default" as const }] : []),
    { id: "canciones", label: "Música sugerida", highlight: "default" },
    { id: "live" as Tab, label: "LIVE", highlight: "live" },
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
                type="button"
                onClick={() => !isLocked && setTab(t.id)}
                disabled={isLocked}
                className={`
                  w-full min-h-[42px] px-4 py-2 rounded-xl flex items-center justify-center gap-2 whitespace-nowrap
                  transition-all duration-300 cursor-pointer text-[13.5px] border relative overflow-hidden
                  ${isLocked ? "opacity-50 cursor-not-allowed grayscale" : "hover:-translate-y-0.5"}
                  ${t.highlight === "gold" ?
                      tab === t.id
                        ? "bg-amber-500 border-amber-400 text-black font-bold shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                        : "bg-amber-500/15 border-amber-500/30 text-amber-300 font-semibold hover:bg-amber-500/25"
                    : t.highlight === "live" ?
                      (liveActive
                        ? tab === t.id
                          ? "bg-green-500 border-green-400 text-white font-bold shadow-[0_0_15px_rgba(34,197,94,0.5)]"
                          : "bg-green-500/10 border-green-500/30 text-green-400 font-semibold hover:bg-green-500/20 hover:border-green-400/50 shadow-[0_0_8px_rgba(34,197,94,0.1)]"
                        : tab === t.id
                          ? "bg-red-500 border-red-400 text-white font-bold shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                          : "bg-red-500/10 border-red-500/30 text-red-400 font-semibold hover:bg-red-500/20 hover:border-red-400/50 shadow-[0_0_8px_rgba(239,68,68,0.1)]")
                    : tab === t.id
                      ? "bg-[var(--paper)] border-transparent text-[var(--ink)] font-bold shadow-sm"
                      : "bg-transparent border-transparent text-white/60 font-medium hover:bg-white/5"
                  }
                `}
              >
                {t.id === "live" ? (
                  <span className="flex items-center gap-2 relative z-10">
                    <div className="relative flex items-center justify-center w-2 h-2">
                        {!isLocked && liveActive && <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping"></span>}
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${liveActive ? "bg-green-500" : "bg-red-500"}`}></span>
                    </div>
                    LIVE
                  </span>
                ) : (
                  <span className="relative z-10">{t.label}</span>
                )}
                {isLocked && <Lock className="w-3.5 h-3.5 text-red-400 relative z-10" />}
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

      <AnimatedTabDescription text={TAB_DESCRIPTIONS[tab]} />

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
          animate={{ opacity: 1, filter: "none", y: 0 }}
          exit={{ opacity: 0, filter: "blur(4px)", y: -10 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          {tab === "invitados" && (
            <div className="bg-card border rounded-lg p-4 md:p-6">
              <h2 className="text-xl font-semibold mb-6">Lista de Invitados</h2>
              <GuestListWithPayment invitationId={invitationId} pagoTarjetaHabilitado={pagoTarjetaHabilitado} />
            </div>
          )}
          {tab === "canciones" && (
            <div className="bg-card border rounded-lg p-4 md:p-6">
              <h2 className="text-xl font-semibold mb-6">Moderación de Canciones</h2>
              <SongModerationPanel invitationId={invitationId} />
            </div>
          )}
          {tab === "precio" && pagoTarjetaHabilitado && (
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
            <GuestManager
              slug={slug}
              invitationId={invitationId}
              initialRsvpEnabled={rsvpEnabled}
              planTier={planTier}
              pagoTarjetaHabilitado={pagoTarjetaHabilitado}
              pagoTarjetaMonto={Number(regaloMonto) || null}
              precioAdolescente={precioAdolescente != null ? Number(precioAdolescente) : null}
              precioNino={precioNino != null ? Number(precioNino) : null}
            />
          )}
          {tab === "live" && (
            <div className="bg-card border rounded-lg p-4 md:p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                LIVE
                <Camera className="w-5 h-5 text-muted-foreground" strokeWidth={1.75} />
              </h2>
              <LiveAdminPanel invitationId={invitationId} fechaEvento={fechaEvento} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
