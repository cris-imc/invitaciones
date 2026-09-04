"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, Eye, Pencil, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { WizardPlanLimitDialog } from "@/components/wizard/WizardPlanLimitDialog";
import { savePendingInvitationUpgrade } from "@/lib/pending-invitation-upgrade";
import { useToast } from "@/components/ui/Toast";

function TypewriterText() {
  const text = "Previsualizá tu diseño o editá los detalles...";
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 45); // Velocidad de escritura
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="font-medium text-xs sm:text-sm text-slate-600 dark:text-slate-300">
      {displayed}
      <span className="animate-pulse text-amber-500 font-bold ml-0.5">|</span>
    </span>
  );
}

/**
 * "Cambiar Plantilla" oculto: hoy lleva al mismo editor que "Editar invitación"
 * (solo cambia el paso), asi que eran dos botones para el mismo lugar. Queda el
 * codigo para volver a mostrarlo con solo poner true.
 */
const MOSTRAR_CAMBIAR_PLANTILLA = false;

interface EventShareCardProps {
  slug: string;
  eventName: string;
  invitationId?: string;
  planTier?: string;
}

export function EventShareCard({ slug, eventName, invitationId, planTier }: EventShareCardProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  const upgradeWithCredit = async (tier: "PREMIUM" | "DIAMOND") => {
    try {
      const res = await fetch(`/api/invitations/${slug}/upgrade-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planTier: tier }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Error al actualizar el plan");
      showToast(`¡Listo! Tu invitación ya es ${tier === "DIAMOND" ? "Diamond" : "Premium"}.`, "success");
      router.refresh();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Error al actualizar el plan", "error");
    }
  };

  const payMercadoPagoForUpgrade = async (tier: "PREMIUM" | "DIAMOND") => {
    try {
      // Redirección dura a Mercado Pago -- se guarda qué invitación convertir
      // para cuando vuelva (ver PendingInvitationUpgradeBridge).
      savePendingInvitationUpgrade({ slug, desiredCredit: tier });
      const res = await fetch("/api/user/buy-credit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planTier: tier }),
      });
      const data = await res.json();
      if (!res.ok || !data.checkoutUrl) throw new Error(data.error || "Error al iniciar el pago");
      window.location.href = data.checkoutUrl;
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Error al iniciar el pago", "error");
    }
  };

  return (
    <div className="w-full mb-4">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes colorCycle {
          0% { background-position: 0% 50%; }
          100% { background-position: -300% 50%; }
        }
        .btn-color-cycle {
          background: linear-gradient(90deg, #f43f5e, #f59e0b, #10b981, #3b82f6, #8b5cf6, #f43f5e);
          background-size: 300% 100%;
          animation: colorCycle 5s linear infinite;
          color: white;
          border: none;
          transition: transform 0.2s ease, filter 0.2s ease;
        }
        .btn-color-cycle:hover {
          transform: scale(1.02);
          filter: brightness(1.1);
        }
      `}} />
      <div className="relative group w-full">
        {/* Efecto de aura/brillo sutil animado */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/30 to-amber-500/30 rounded-full blur-md opacity-50 group-hover:opacity-75 transition duration-1000 animate-pulse"></div>
        
        {/* Burbuja Principal */}
        <div className="relative w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-1.5 sm:pl-5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-800/50 rounded-3xl sm:rounded-full shadow-sm gap-3 sm:gap-6 transition-all duration-300 hover:shadow-md overflow-hidden">

          <div className="flex items-center gap-2.5 pt-2 sm:pt-0 min-w-0">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <div className="flex-1 truncate min-w-0">
              <TypewriterText />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 w-full sm:w-auto">
            <Link href={`/i/${slug}`} target="_blank" className="w-full sm:w-auto inline-flex items-center justify-center h-9 px-4 gap-2 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700">
                <Eye className="w-3.5 h-3.5" />
                <span>Ver ejemplo</span>
            </Link>

            {invitationId && (
              <>
                <Link href={`/dashboard/invitaciones/editar/${invitationId}`} className="w-full sm:w-auto">
                  <Button size="sm" className="w-full h-9 px-5 rounded-full gap-2 text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-sm border-0">
                    <Pencil className="w-3.5 h-3.5" />
                    Editar invitación
                  </Button>
                </Link>
                {MOSTRAR_CAMBIAR_PLANTILLA && (
                  <Link href={`/dashboard/invitaciones/editar/${invitationId}?step=design`} className="w-full sm:w-auto">
                    <Button size="sm" className="w-full h-9 px-4 rounded-full gap-2 text-xs font-bold shadow-sm btn-color-cycle">
                      Cambiar Plantilla
                    </Button>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Banner aparte (no metido en la burbuja de arriba, que ya viene
          justa de espacio y le cortaba el texto animado) -- solo para
          invitaciones en plan Gratis. */}
      {planTier === "FREE" && (
        <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-yellow-500/10 to-[#67e8f9]/10 border border-yellow-500/30">
          <div className="flex items-start gap-2.5 min-w-0">
            <Sparkles className="w-4.5 h-4.5 text-yellow-500 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm font-semibold">Esta invitación está en plan Gratis</p>
              <p className="text-xs text-muted-foreground">Convertila a Premium o Diamond para sumar música, trivia, gestión de pagos y el Modo LIVE.</p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setShowUpgradeDialog(true)}
            className="w-full sm:w-auto shrink-0 h-9 px-4 rounded-full gap-2 text-xs font-bold shadow-sm bg-gradient-to-r from-yellow-500 to-[#67e8f9] hover:opacity-90 text-black border-0"
          >
            Habilitar Premium/Diamond
          </Button>
        </div>
      )}

      <WizardPlanLimitDialog
        open={showUpgradeDialog}
        onOpenChange={setShowUpgradeDialog}
        onUseCredit={upgradeWithCredit}
        onPayMercadoPago={payMercadoPagoForUpgrade}
        title="Habilitar funciones Premium/Diamond"
        description="Convertí esta invitación de Gratis a Premium o Diamond sin perder nada de lo que ya cargaste."
      />
    </div>
  );
}
