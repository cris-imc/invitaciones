"use client";

import { useState, type ComponentType, type ReactNode } from "react";
import { Switch } from "@/components/ui/switch";

export interface BankAccountData {
  titulo: string;
  mensaje?: string;
  banco?: string;
  cbu?: string;
  alias?: string;
  titular?: string;
}

interface RowProps {
  label: string;
  value: string;
}

interface BankDetailsCardProps {
  icon: ReactNode;
  data: BankAccountData;
  accentColor: string;
  cardBg: string;
  textPrimary: string;
  textSecondary: string;
  rounded?: boolean;
  cardBorder?: string;
  InfoRow: ComponentType<RowProps>;
  CopyField: ComponentType<RowProps>;
}

// Card colapsable: por defecto solo se ve el icono + título (ahorra mucho
// espacio cuando hay cuenta de regalo Y de tarjeta), un switch propio revela
// CBU/alias/titular. Colores via props para adaptarse a la paleta de cada
// plantilla/color sin duplicar estilos.
export function BankDetailsCard({
  icon,
  data,
  accentColor,
  cardBg,
  textPrimary,
  textSecondary,
  rounded,
  cardBorder,
  InfoRow,
  CopyField,
}: BankDetailsCardProps) {
  const [expanded, setExpanded] = useState(false);
  const hasDetails = Boolean(data.banco || data.cbu || data.alias || data.titular);

  return (
    <div
      className={`px-4 py-4 sm:p-5 space-y-2 ${rounded ? "rounded-2xl" : ""} ${cardBorder ? "border" : ""}`}
      style={{ backgroundColor: cardBg, borderColor: cardBorder }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-semibold text-sm min-w-0" style={{ color: textPrimary }}>
          <span className="shrink-0" style={{ color: accentColor }}>{icon}</span>
          <span className="truncate">{data.titulo}</span>
        </div>
        {hasDetails && (
          <label
            className="flex items-center gap-2 cursor-pointer shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <span
              className="text-[9px] font-semibold uppercase tracking-wider hidden sm:inline"
              style={{ color: textSecondary }}
            >
              {expanded ? "Ocultar" : "Ver datos"}
            </span>
            <Switch
              checked={expanded}
              onCheckedChange={setExpanded}
              size="lg"
              style={expanded ? { backgroundColor: accentColor } : undefined}
            />
          </label>
        )}
      </div>

      {expanded && hasDetails && (
        <div
          className="pt-2 mt-1 space-y-0 border-t animate-in fade-in slide-in-from-top-1 duration-200"
          style={{ borderColor: `${accentColor}33` }}
        >
          {Boolean(data.mensaje) && (
            <p className="text-xs italic py-1" style={{ color: textSecondary }}>
              {data.mensaje}
            </p>
          )}
          {Boolean(data.banco) && <InfoRow label="BANCO" value={data.banco!} />}
          {Boolean(data.cbu) && <CopyField label="CBU / CVU" value={data.cbu!} />}
          {Boolean(data.alias) && <CopyField label="ALIAS" value={data.alias!} />}
          {Boolean(data.titular) && <InfoRow label="TITULAR" value={data.titular!} />}
        </div>
      )}
    </div>
  );
}
