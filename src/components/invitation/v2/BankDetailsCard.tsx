"use client";

import { useState, type ComponentType, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import { datosParaMostrar, type Seccion } from "@/lib/datos-bancarios";
import { useDatosDeInvitacion } from "@/components/invitation/ContextoInvitacion";
import { useTextos } from "@/components/i18n/ProveedorIdioma";

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
  defaultExpanded?: boolean;
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
  defaultExpanded = false,
}: BankDetailsCardProps) {
  const tx = useTextos();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const fuente = useDatosDeInvitacion();

  // Los campos que pide el país de la invitación (IBAN en España,
  // CLABE en México, routing + account en Estados Unidos). En Argentina
  // devuelve CBU y Alias, así que no cambia nada de lo que ya se veía.
  const seccion = fuente ? seccionDeEstaTarjeta(fuente, data) : null;
  const camposDelPais = fuente && seccion ? datosParaMostrar(fuente, seccion) : [];

  const hayLegado = Boolean(data.banco || data.cbu || data.alias || data.titular);
  const hasDetails = camposDelPais.length > 0 || hayLegado;

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
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            className="flex items-center gap-1.5 shrink-0 transition-opacity hover:opacity-70"
            style={{ color: accentColor }}
            aria-label={expanded ? tx("invitacion.regalos.ocultarDatos") : tx("invitacion.regalos.verDatos")}
            aria-pressed={expanded}
          >
            <span
              className="text-[9px] font-semibold uppercase tracking-wider hidden sm:inline"
              style={{ color: textSecondary }}
            >
              {expanded ? tx("invitacion.regalos.ocultar") : tx("invitacion.regalos.verDatos")}
            </span>
            {expanded ? (
              <Eye className="w-[18px] h-[18px]" strokeWidth={1.75} />
            ) : (
              <EyeOff className="w-[18px] h-[18px]" strokeWidth={1.75} />
            )}
          </button>
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
          {camposDelPais.length > 0
            ? camposDelPais.map((c) =>
                c.copiable ? (
                  <CopyField key={c.clave} label={c.etiqueta.toUpperCase()} value={c.valor} />
                ) : (
                  <InfoRow key={c.clave} label={c.etiqueta.toUpperCase()} value={c.valor} />
                )
              )
            : (
              <>
                {Boolean(data.banco) && <InfoRow label={tx("invitacion.regalos.banco").toUpperCase()} value={data.banco!} />}
                {Boolean(data.cbu) && <CopyField label="CBU / CVU" value={data.cbu!} />}
                {Boolean(data.alias) && <CopyField label="ALIAS" value={data.alias!} />}
                {Boolean(data.titular) && <InfoRow label={tx("invitacion.regalos.titular").toUpperCase()} value={data.titular!} />}
              </>
            )}
        </div>
      )}
    </div>
  );
}

/**
 * De cuál de las dos secciones es esta tarjeta: la de regalos o la del pago
 * de la tarjeta de invitación.
 *
 * Hace falta porque las 360 plantillas llaman al componente sin decirlo, y
 * agregar la prop serían 720 llamadas a tocar. Se resuelve comparando el
 * banco y el titular que ya vienen en `data` contra los de cada sección. Si
 * las dos coinciden es porque el anfitrión usó la misma cuenta para ambas, y
 * entonces da igual cuál se elija: los datos son los mismos.
 */
function seccionDeEstaTarjeta(
  fuente: NonNullable<ReturnType<typeof useDatosDeInvitacion>>,
  data: BankAccountData
): Seccion | null {
  const igual = (a?: string | null, b?: string) => (a ?? "") === (b ?? "");
  const coincide = (s: Seccion) =>
    igual(s === "regalo" ? fuente.regaloBanco : fuente.pagoTarjetaBanco, data.banco) &&
    igual(s === "regalo" ? fuente.regaloTitular : fuente.pagoTarjetaTitular, data.titular);

  if (coincide("regalo")) return "regalo";
  if (coincide("pagoTarjeta")) return "pagoTarjeta";
  return null;
}
