"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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
  precio: "Modificá el precio de la tarjeta y mantené informado a tus invitados...",
  canciones: "Aprobá o rechazá las canciones que sugieren para la fiesta...",
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

export function GuestPageTabs({
  invitationId,
  slug,
  regaloHabilitado,
  pagoTarjetaHabilitado = false,
  regaloMonto,
  precioAdolescente,
  precioNino,
  rsvpEnabled,
  planTier,
  fechaEvento,
}: Props) {
  const [tab, setTab] = useState<Tab>("agregar");
  const [liveActive, setLiveActive] = useState(false);
  const [lockedTooltip, setLockedTooltip] = useState<{ id: Tab; top: number; left: number } | null>(null);
  const tabContentRef = useRef<HTMLDivElement>(null);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

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

  // Safety net for stuck filter animations (e.g. when returning from background)
  useEffect(() => {
    const resetFilter = () => {
      if (tabContentRef.current) tabContentRef.current.style.filter = "none";
    };
    document.addEventListener("visibilitychange", resetFilter);
    window.addEventListener("pageshow", resetFilter);
    return () => {
      document.removeEventListener("visibilitychange", resetFilter);
      window.removeEventListener("pageshow", resetFilter);
    };
  }, []);

  const tabs: { id: Tab; label: string; highlight?: "gold" | "live" | "default" }[] = [
    { id: "agregar", label: "Gestionar invitados", highlight: "gold" },
    { id: "invitados", label: pagoTarjetaHabilitado ? "Gestionar pagos" : "Lista de invitados", highlight: "default" },
    ...(pagoTarjetaHabilitado ? [{ id: "precio" as Tab, label: "Gestionar precios", highlight: "default" as const }] : []),
    { id: "canciones", label: "Música sugerida", highlight: "default" },
    { id: "live" as Tab, label: "LIVE", highlight: "live" },
  ];

  return (
    <div>
      {/* 📱 Desktop horizontal tab bar (adm-tabs mockup style) 📱 */}
      <div className="adm-tabs-container">
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[var(--ink)] to-transparent pointer-events-none z-10 flex items-center justify-start pl-2">
            <span className="text-white/40 font-ui text-lg tracking-[-2px] animate-pulse" style={{ animationDuration: '2.5s' }}>‹‹</span>
          </div>
        )}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[var(--ink)] to-transparent pointer-events-none z-10 flex items-center justify-end pr-2">
            <span className="text-white/40 font-ui text-lg tracking-[-2px] animate-pulse" style={{ animationDuration: '2.5s' }}>››</span>
          </div>
        )}
        <div 
          className="adm-tabs pl-4"
          ref={scrollContainerRef}
          onScroll={checkScroll}
        >
          {tabs.map((t) => {
            const hasLive = planTier === "DIAMOND" || planTier === "ENTERPRISE" || planTier === "ADMIN";
            const isLocked =
              t.id === "canciones" ? planTier === "FREE" : t.id === "live" ? !hasLive : false;

            // Live tab: pulsing dot
            const tabLabel =
              t.id === "live" ? (
                <>
                  <span style={{ position: "relative", width: 8, height: 8, display: "block" }}>
                    {!isLocked && liveActive && (
                      <span
                        style={{
                          position: "absolute",
                          inset: 0,
                          borderRadius: "50%",
                          background: "#22c55e",
                          opacity: 0.7,
                          animation: "liveRecPulse 1.2s ease-in-out infinite",
                        }}
                      />
                    )}
                    <span
                      style={{
                        position: "relative",
                        display: "block",
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: liveActive ? "#22c55e" : "#ef4444",
                      }}
                    />
                  </span>
                  LIVE
                </>
              ) : (
                t.label
              );

            return (
              <div
                key={t.id}
                className="relative"
                onMouseEnter={(e) => {
                  if (!isLocked) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  setLockedTooltip({ id: t.id, top: rect.top, left: rect.left + rect.width / 2 });
                }}
                onMouseLeave={() => setLockedTooltip(null)}
              >
                <button
                  type="button"
                  onClick={() => !isLocked && setTab(t.id)}
                  disabled={isLocked}
                  className={`adm-tab ${tab === t.id ? "active" : ""} ${isLocked ? "opacity-40" : ""}`}
                  style={
                    t.highlight === "gold" && tab !== t.id
                      ? { color: "var(--accent)" }
                      : t.highlight === "live"
                      ? { color: liveActive ? "#22c55e" : "#ef4444" }
                      : {}
                  }
                >
                  {tabLabel}
                  {isLocked && <Lock className="w-3 h-3 ml-1" />}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tooltip de tabs bloqueados, portado a <body>: el contenedor de tabs
          tiene overflow-x:auto para el scroll horizontal, lo que fuerza
          overflow-y:hidden implícito y recorta cualquier tooltip absoluto
          que intente sobresalir por arriba de la fila. */}
      {lockedTooltip &&
        createPortal(
          <div
            className="fixed px-3 py-1.5 bg-black text-white text-xs rounded whitespace-nowrap z-[200] pointer-events-none"
            style={{ top: lockedTooltip.top - 8, left: lockedTooltip.left, transform: "translate(-50%, -100%)" }}
          >
            {lockedTooltip.id === "live" ? "Disponible en Diamond" : "Disponible en Premium"}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black" />
          </div>,
          document.body
        )}

      {/* 📱 Animated description 📱 */}
      <AnimatedTabDescription text={TAB_DESCRIPTIONS[tab]} />

      {/* ── Tab content (AnimatePresence unchanged) ── */}
      <AnimatePresence mode="wait">
        <motion.div
          ref={tabContentRef}
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          {tab === "invitados" && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Lista de Invitados</h2>
              <GuestListWithPayment invitationId={invitationId} pagoTarjetaHabilitado={pagoTarjetaHabilitado} />
            </div>
          )}
          {tab === "canciones" && (
            <div>
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
            <div className="bg-card border border-white/10 rounded-lg p-4 md:p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                LIVE
                <Camera className="w-5 h-5 text-muted-foreground" strokeWidth={1.75} />
              </h2>
              <LiveAdminPanel invitationId={invitationId} fechaEvento={fechaEvento} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Mobile bottom nav ── */}
      <nav className="adm-mobile-nav">
        <div className="adm-mobile-nav-inner">
          {tabs.map((t) => {
            const hasLive = planTier === "DIAMOND" || planTier === "ENTERPRISE" || planTier === "ADMIN";
            const isLocked =
              t.id === "canciones" ? planTier === "FREE" : t.id === "live" ? !hasLive : false;
            return (
              <button
                key={t.id}
                type="button"
                className={`adm-nav-item ${tab === t.id ? "active" : ""} ${isLocked ? "opacity-40" : ""}`}
                onClick={() => !isLocked && setTab(t.id)}
                disabled={isLocked}
              >
                <span className="adm-nav-icon">
                  {t.id === "agregar" && "👥"}
                  {t.id === "invitados" && "✅"}
                  {t.id === "precio" && "💰"}
                  {t.id === "canciones" && "🎵"}
                  {t.id === "live" && (liveActive ? "🟢" : "⭕")}
                </span>
                <span className="adm-nav-lbl">
                  {t.id === "agregar" ? "Invitados" :
                   t.id === "invitados" ? "Lista" :
                   t.id === "precio" ? "Precio" :
                   t.id === "canciones" ? "Música" : "LIVE"}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
