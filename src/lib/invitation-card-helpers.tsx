import { Gem, Crown, Building2, PartyPopper } from "lucide-react";

export function getStripClass(tipo: string): string {
  const t = (tipo || "").toUpperCase();
  if (t === "CASAMIENTO") return "strip-casamiento";
  if (t === "QUINCE_ANOS" || t === "QUINCEANOS") return "strip-quince";
  if (t === "CUMPLEANOS" || t === "CUMPLEAÑOS") return "strip-cumple";
  if (t === "CORPORATIVO" || t === "EJECUTIVO") return "strip-corporativo";
  return "strip-default";
}

export function getEventEmoji(tipo: string): React.ReactNode {
  const t = (tipo || "").toUpperCase();
  if (t === "CASAMIENTO") return <Gem className="w-[18px] h-[18px] text-[rgba(255,255,255,0.7)]" />;
  if (t === "QUINCE_ANOS" || t === "QUINCEANOS") return <Crown className="w-[18px] h-[18px] text-[rgba(255,255,255,0.7)]" />;
  if (t === "CORPORATIVO" || t === "EJECUTIVO") return <Building2 className="w-[18px] h-[18px] text-[rgba(255,255,255,0.7)]" />;
  // CUMPLEANOS es el valor interno del tipo "Evento" del wizard (StepEventType.tsx) --
  // engloba cumpleaños, bautismos, corporativos, etc., no solo cumpleaños. Ícono
  // genérico, no una torta.
  return <PartyPopper className="w-[18px] h-[18px] text-[rgba(255,255,255,0.7)]" />;
}

export function getEventLabel(tipo: string): string {
  const t = (tipo || "").toUpperCase();
  if (t === "CASAMIENTO") return "Casamiento";
  if (t === "QUINCE_ANOS" || t === "QUINCEANOS") return "15 Años";
  if (t === "CORPORATIVO" || t === "EJECUTIVO") return "Corporativo";
  if (t === "CUMPLEANOS" || t === "CUMPLEAÑOS") return "Evento";
  return tipo || "Evento";
}

export function getDaysUntil(fecha: Date): number {
  const now = new Date();
  return Math.ceil((fecha.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
