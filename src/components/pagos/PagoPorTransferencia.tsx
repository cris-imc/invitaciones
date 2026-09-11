"use client";

import { useEffect, useState } from "react";
import { Copy, Check, Landmark } from "lucide-react";

const WHATSAPP_COMPROBANTE = `https://wa.me/5493517660000?text=${encodeURIComponent(
  "Hola! Te paso el comprobante de la transferencia para activar mi plan."
)}`;

interface CobroDelPais {
  titular: string;
  banco: string;
  datos: { etiqueta: string; valor: string; copiable: boolean }[];
}

interface Props {
  /** Qué está pagando, para que el mensaje diga algo concreto. */
  concepto?: string;
  className?: string;
  /**
   * De qué país mostrar la cuenta.
   *
   * Hace falta en el registro: ahí todavía no hay sesión y el país que
   * importa es el que la persona acaba de elegir en el formulario, que el
   * servidor no tiene forma de saber. Donde ya hay sesión se omite y lo
   * resuelve el endpoint con el país de la cuenta.
   */
  pais?: string;
}

/**
 * Agrupa de a cuatro para poder leerlo y compararlo con el resumen del banco.
 * Veintidós dígitos seguidos son imposibles de verificar de un vistazo.
 *
 * Sólo cuando es puro número o número con espacios (un CBU, una CLABE, un
 * IBAN): un alias o una llave Bre-B se muestran tal cual. Y lo que se COPIA
 * es siempre el valor original, sin los espacios de adorno.
 */
function enGrupos(valor: string): string {
  if (!/^[A-Za-z]{0,2}[\d\s]+$/.test(valor)) return valor;
  return valor.replace(/\s+/g, "").replace(/(.{4})(?=.)/g, "$1 ").trim();
}

/**
 * Pago por transferencia, como alternativa a Mercado Pago.
 *
 * Va plegado por defecto: Mercado Pago es instantáneo y no requiere que nadie
 * mande un comprobante ni espere una activación a mano, así que sigue siendo
 * el camino principal. Esto es para quien prefiere transferir -- que en
 * Argentina es muchísima gente -- y sin ofrecerlo se perdía esa venta.
 */
export function PagoPorTransferencia({ concepto, className, pais }: Props) {
  const [abierto, setAbierto] = useState(false);
  // Qué etiqueta se copió, para que el "Copiado" salga en el botón correcto.
  const [copiado, setCopiado] = useState<string | null>(null);
  const [cobro, setCobro] = useState<CobroDelPais | null>(null);
  const [cargando, setCargando] = useState(false);

  // Los datos salen del servidor -- variables de entorno, ver lib/cobro.ts --
  // y no del bundle, así que cambiar un número de cuenta en Railway tiene
  // efecto sin volver a construir la app. Se piden al desplegar el panel y no
  // al montar: la mayoría de la gente paga con Mercado Pago y nunca lo abre.
  //
  // Van atados al país: en el registro se puede abrir el panel, ver los datos
  // de España, y después cambiar a México. Si no se vuelven a pedir, se queda
  // en pantalla la cuenta equivocada y alguien transfiere a otro país.
  useEffect(() => {
    if (!abierto) return;

    let vigente = true;
    setCargando(true);
    setCobro(null);
    fetch(pais ? `/api/cobro?pais=${encodeURIComponent(pais)}` : "/api/cobro")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        // Si el país cambió otra vez mientras esto volvía, esta respuesta ya
        // no sirve: pintarla dejaría la cuenta de un país que no es el
        // elegido.
        if (!vigente) return;
        if (j?.disponible) setCobro({ titular: j.titular, banco: j.banco, datos: j.datos });
      })
      .catch(() => {
        // Sin datos no se muestra la sección: media cuenta bancaria en
        // pantalla es peor que ninguna.
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
    };
  }, [abierto, pais]);

  const alternar = () => setAbierto((v) => !v);

  const copiar = async (etiqueta: string, valor: string) => {
    try {
      await navigator.clipboard.writeText(valor);
      setCopiado(etiqueta);
      window.setTimeout(() => setCopiado(null), 2000);
    } catch {
      // Sin portapapeles (contexto no seguro, permisos): el dato está a la
      // vista igual, así que no hay nada que avisar.
    }
  };

  const BotonCopiar = ({ etiqueta, valor }: { etiqueta: string; valor: string }) => (
    <button
      type="button"
      onClick={() => copiar(etiqueta, valor)}
      className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-[var(--campo-borde)] px-2.5 py-1.5 text-xs font-semibold hover:bg-[var(--tinte-2)] transition-colors"
    >
      {copiado === etiqueta ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-400" /> Copiado
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" /> Copiar
        </>
      )}
    </button>
  );

  return (
    <div className={className}>
      <button
        type="button"
        onClick={alternar}
        className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
      >
        <Landmark className="w-4 h-4" />
        {abierto ? "Ocultar datos para transferir" : "Prefiero pagar por transferencia"}
      </button>

      {abierto && cargando && !cobro && (
        <p className="mt-1 text-xs text-muted-foreground text-center py-3">Buscando los datos...</p>
      )}

      {abierto && !cargando && !cobro && (
        <p className="mt-1 text-xs text-muted-foreground text-center py-3">
          Por ahora no tenemos transferencia para tu país. Podés pagar con los otros medios.
        </p>
      )}

      {abierto && cobro && (
        <div className="mt-1 rounded-xl border border-[var(--line)] bg-[var(--tinte-1)] p-3 space-y-2.5 text-left">
          {cobro.datos.map((d) => (
            <div key={d.etiqueta} className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{d.etiqueta}</p>
                <p className="text-sm font-mono tracking-tight text-[var(--foreground)] break-all">
                  {enGrupos(d.valor)}
                </p>
              </div>
              {d.copiable && <BotonCopiar etiqueta={d.etiqueta} valor={d.valor} />}
            </div>
          ))}

          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Banco</p>
            <p className="text-sm">{cobro.banco}</p>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Titular</p>
            <p className="text-sm">{cobro.titular}</p>
          </div>

          {/* Qué pasa después, dicho antes de transferir. Sin esto la persona
              transfiere y se queda esperando que algo se active solo. */}
          <p className="text-xs text-muted-foreground leading-relaxed pt-1 border-t border-[var(--line)]">
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
