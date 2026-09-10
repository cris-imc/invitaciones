"use client";

import { useState } from "react";
import { Copy, Check, Landmark } from "lucide-react";

/**
 * Los datos para transferir. Escritos una sola vez: aparecen en seis lugares
 * distintos del flujo de pago, y un alias tipeado seis veces es un alias que
 * tarde o temprano queda desactualizado en cinco.
 */
export const DATOS_TRANSFERENCIA = {
  alias: "altainvitacion",
  banco: "Banco Supervielle",
  titular: "Cristian Iván Martínez Calderón",
};

const WHATSAPP_COMPROBANTE = `https://wa.me/5493517660000?text=${encodeURIComponent(
  "Hola! Te paso el comprobante de la transferencia para activar mi plan."
)}`;

interface Props {
  /** Qué está pagando, para que el mensaje diga algo concreto. */
  concepto?: string;
  className?: string;
}

/**
 * Pago por transferencia, como alternativa a Mercado Pago.
 *
 * Va plegado por defecto: Mercado Pago es instantáneo y no requiere que nadie
 * mande un comprobante ni espere una activación a mano, así que sigue siendo
 * el camino principal. Esto es para quien prefiere transferir -- que en
 * Argentina es muchísima gente -- y sin ofrecerlo se perdía esa venta.
 */
export function PagoPorTransferencia({ concepto, className }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const copiarAlias = async () => {
    try {
      await navigator.clipboard.writeText(DATOS_TRANSFERENCIA.alias);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Sin portapapeles (contexto no seguro, permisos): el alias está a la
      // vista igual, así que no hay nada que avisar.
    }
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
      >
        <Landmark className="w-4 h-4" />
        {abierto ? "Ocultar datos para transferir" : "Prefiero pagar por transferencia"}
      </button>

      {abierto && (
        <div className="mt-1 rounded-xl border border-white/15 bg-black/20 p-3 space-y-2.5 text-left">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Alias</p>
              <p className="text-base font-semibold truncate">{DATOS_TRANSFERENCIA.alias}</p>
            </div>
            <button
              type="button"
              onClick={copiarAlias}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-white/20 px-2.5 py-1.5 text-xs font-semibold hover:bg-white/10 transition-colors"
            >
              {copiado ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Copiado
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copiar
                </>
              )}
            </button>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Banco</p>
            <p className="text-sm">{DATOS_TRANSFERENCIA.banco}</p>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Titular</p>
            <p className="text-sm">{DATOS_TRANSFERENCIA.titular}</p>
          </div>

          {/* Qué pasa después, dicho antes de transferir. Sin esto la persona
              transfiere y se queda esperando que algo se active solo. */}
          <p className="text-xs text-muted-foreground leading-relaxed pt-1 border-t border-white/10">
            Después de transferir, mandanos el comprobante y activamos
            {concepto ? ` ${concepto}` : " tu plan"} a mano. No es automático como
            Mercado Pago, así que puede demorar un rato.
          </p>

          <a
            href={WHATSAPP_COMPROBANTE}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center rounded-lg bg-emerald-600/90 hover:bg-emerald-600 text-white text-sm font-semibold py-2 transition-colors"
          >
            Enviar comprobante por WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}
